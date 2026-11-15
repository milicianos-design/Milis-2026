<?php
declare(strict_types=1);

namespace Milis\Controllers;

use Milis\Auth\AccountMail;
use Milis\Auth\RateLimiter;
use Milis\Auth\Sessions;
use Milis\Db;
use Milis\Http\HttpError;
use Milis\Http\Input;
use Milis\Http\JsonResponse;
use Milis\Http\Request;

final class AuthController
{
    private const PASSWORD_MIN = 8;
    private const PASSWORD_MAX = 128;

    public function __construct(
        private readonly Db $db,
        private readonly Sessions $sessions,
        private readonly RateLimiter $limiter,
        private readonly AccountMail $mail,
    ) {
    }

    public function me(Request $request): array
    {
        return $this->sessionPayload($this->sessions->user());
    }

    public function register(Request $request): JsonResponse
    {
        $input = new Input($request->json());
        $email = $input->email();
        $password = $this->newPassword($input);
        $firstName = $input->text('first_name', 'nombre', 80);
        $lastName = $input->text('last_name', 'apellido', 80);
        $this->limiter->hit('register:ip:' . $request->ip(), 10, 3600);

        if ($this->db->value('SELECT 1 FROM users WHERE email = ?', [$email])) {
            throw HttpError::conflict('Este correo electrónico ya se encuentra registrado.');
        }
        try {
            $this->db->transaction(function () use ($email, $password, $firstName, $lastName) {
                $userId = $this->db->insert(
                    'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
                    [$email, $this->hash($password), $firstName, $lastName]
                );
                $this->mail->sendVerification($userId, $email, $firstName);
            });
        } catch (\PDOException $e) {
            if (Db::isDuplicateKey($e)) {
                throw HttpError::conflict('Este correo electrónico ya se encuentra registrado.');
            }
            throw $e;
        }
        return JsonResponse::created(['message' => 'Registro exitoso. Revisá tu email para confirmar la cuenta.']);
    }

    public function verifyEmail(Request $request): array
    {
        $this->limiter->hit('verify:ip:' . $request->ip(), 30, 3600);
        $userId = $this->mail->consume((string) (new Input($request->json()))->text('token', 'token', 128), 'verify_email');
        $this->db->run('UPDATE users SET email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP()) WHERE id = ?', [$userId]);
        return ['message' => '¡Cuenta confirmada! Ya ingresaste.'] + $this->sessionPayload($this->sessions->login($userId));
    }

    public function login(Request $request): array
    {
        $input = new Input($request->json());
        $email = $input->email();
        $password = (string) $input->text('password', 'contraseña', self::PASSWORD_MAX);
        $this->limiter->hit('login:ip:' . $request->ip(), 30, 900);
        $this->limiter->hit('login:email:' . sha1($email), 10, 900);

        $user = $this->db->one('SELECT id, password_hash, first_name, email_verified_at FROM users WHERE email = ?', [$email]);
        $valid = password_verify($password, $user['password_hash'] ?? $this->dummyHash());
        if ($user === null || !$valid) {
            throw HttpError::unauthorized('Credenciales incorrectas. Verificá tu email y contraseña.');
        }
        $userId = (int) $user['id'];

        if ($user['email_verified_at'] === null) {
            if ($this->limiter->attempt("verify-resend:user:$userId", 1, 300)) {
                $this->mail->sendVerification($userId, $email, $user['first_name']);
            }
            throw HttpError::forbidden('Todavía no confirmaste tu email. Te enviamos de nuevo el enlace de confirmación.');
        }
        if (password_needs_rehash($user['password_hash'], $this->algorithm())) {
            $this->db->run('UPDATE users SET password_hash = ? WHERE id = ?', [$this->hash($password), $userId]);
        }
        $this->limiter->clear('login:email:' . sha1($email));
        return $this->sessionPayload($this->sessions->login($userId));
    }

    public function logout(Request $request): array
    {
        $this->sessions->logout();
        return $this->sessionPayload(null);
    }

    public function forgotPassword(Request $request): array
    {
        $email = (new Input($request->json()))->email();
        $this->limiter->hit('forgot:ip:' . $request->ip(), 10, 3600);
        $this->limiter->hit('forgot:email:' . sha1($email), 3, 3600);

        // A las cuentas suspendidas no se les manda nada (igual no podrían entrar).
        $user = $this->db->one('SELECT id, first_name FROM users WHERE email = ? AND suspended_at IS NULL', [$email]);
        if ($user !== null) {
            $this->mail->sendPasswordReset((int) $user['id'], $email, $user['first_name']);
        }
        // Misma respuesta exista o no el email, para no revelar quién está registrado.
        return ['message' => 'Si el email está registrado, te enviamos un enlace para restablecer la contraseña.'];
    }

    public function resetPassword(Request $request): array
    {
        $userId = $this->setPasswordWithToken($request, 'reset_password');
        return ['message' => 'Contraseña actualizada con éxito.'] + $this->sessionPayload($this->sessions->login($userId));
    }

    /** POST /auth/accept-invite — la persona invitada por un admin elige su contraseña y queda adentro. */
    public function acceptInvite(Request $request): array
    {
        $userId = $this->setPasswordWithToken($request, 'invite');
        return ['message' => '¡Bienvenido/a! Tu cuenta quedó activa.'] + $this->sessionPayload($this->sessions->login($userId));
    }

    /**
     * Cambia la contraseña con el token de un email (recuperación o invitación). Como el enlace llegó a
     * su casilla, el email queda confirmado. Cierra las demás sesiones de la cuenta.
     */
    private function setPasswordWithToken(Request $request, string $purpose): int
    {
        $input = new Input($request->json());
        $token = (string) $input->text('token', 'token', 128);
        $password = $this->newPassword($input);
        $this->limiter->hit('reset:ip:' . $request->ip(), 20, 3600);

        return $this->db->transaction(function () use ($token, $password, $purpose) {
            $userId = $this->mail->consume($token, $purpose);
            $this->db->run(
                'UPDATE users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP()) WHERE id = ?',
                [$this->hash($password), $userId]
            );
            $this->db->run('UPDATE user_tokens SET used_at = UTC_TIMESTAMP() WHERE user_id = ? AND purpose = ? AND used_at IS NULL', [$userId, $purpose]);
            $this->sessions->logoutEverywhere($userId);
            return $userId;
        });
    }

    private function sessionPayload(?array $user): array
    {
        return [
            'user' => $user === null ? null : [
                'id' => $user['id'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'role' => $user['role'],
            ],
            'csrf_token' => $user['csrf_token'] ?? null,
        ];
    }

    private function newPassword(Input $input): string
    {
        $password = $input->raw('password');
        if (!is_string($password) || mb_strlen($password) < self::PASSWORD_MIN) {
            throw HttpError::invalid('La contraseña debe tener al menos ' . self::PASSWORD_MIN . ' caracteres.');
        }
        if (mb_strlen($password) > self::PASSWORD_MAX) {
            throw HttpError::invalid('La contraseña es demasiado larga.');
        }
        return $password;
    }

    /**
     * Hash de una clave cualquiera con el mismo algoritmo: se verifica contra él cuando el email no
     * existe, para que la respuesta tarde lo mismo y no delate qué emails están registrados.
     */
    private function dummyHash(): string
    {
        return $this->hash(bin2hex(random_bytes(16)));
    }

    private function algorithm(): string
    {
        return defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
    }

    private function hash(string $password): string
    {
        return password_hash($password, $this->algorithm());
    }
}
