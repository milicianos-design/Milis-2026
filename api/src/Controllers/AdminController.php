<?php
declare(strict_types=1);

namespace Milis\Controllers;

use Milis\Auth\AccountMail;
use Milis\Auth\RateLimiter;
use Milis\Auth\Sessions;
use Milis\Content\Time;
use Milis\Db;
use Milis\Http\HttpError;
use Milis\Http\Input;
use Milis\Http\JsonResponse;
use Milis\Http\Request;

/**
 * Panel de administración (/admin): resumen, usuarios, invitaciones, roles y suspensiones.
 * Todo es solo para admins. Un admin no puede cambiarse el rol ni suspenderse a sí mismo, así
 * siempre queda al menos un admin con acceso.
 */
final class AdminController
{
    private const ROLES = ['miliciano', 'redactor', 'admin'];

    public function __construct(
        private readonly Db $db,
        private readonly Sessions $sessions,
        private readonly RateLimiter $limiter,
        private readonly AccountMail $mail,
    ) {
    }

    /** GET /admin/resumen — totales y cuántos hubo en los últimos 7 días. */
    public function summary(Request $request): array
    {
        $this->sessions->requireRole(['admin']);

        // $table, $column y $where son textos fijos de este archivo, nunca datos del pedido.
        $count = fn (string $table, string $column = 'created_at', string $where = '1 = 1') => [
            'total' => (int) $this->db->value("SELECT COUNT(*) FROM $table WHERE $where"),
            'last_week' => (int) $this->db->value("SELECT COUNT(*) FROM $table WHERE $where AND $column >= UTC_TIMESTAMP() - INTERVAL 7 DAY"),
        ];
        $roles = array_fill_keys(self::ROLES, 0);
        foreach ($this->db->all('SELECT role, COUNT(*) AS n FROM users GROUP BY role') as $row) {
            $roles[$row['role']] = (int) $row['n'];
        }

        return [
            'users' => $count('users') + [
                'active_last_week' => (int) $this->db->value('SELECT COUNT(*) FROM users WHERE last_seen_at >= UTC_TIMESTAMP() - INTERVAL 7 DAY'),
            ],
            'roles' => $roles,
            'posts' => $count('posts'),
            'comments' => $count('comments'),
            'notes' => $count('notes', 'published_at', "status = 'published'"),
            'postulaciones' => $count('campamento_postulaciones'),
        ];
    }

    /** GET /admin/usuarios — todas las cuentas, las más nuevas primero. */
    public function users(Request $request): array
    {
        $admin = $this->sessions->requireRole(['admin']);
        $rows = $this->db->all(self::USER_QUERY . ' ORDER BY u.created_at DESC, u.id DESC');
        return ['users' => array_map(fn (array $row) => $this->shape($row, $admin), $rows)];
    }

    /** POST /admin/usuarios — crea la cuenta y le manda a la persona un email para elegir su contraseña. */
    public function createUser(Request $request): JsonResponse
    {
        $admin = $this->sessions->requireRole(['admin']);
        $input = new Input($request->json());
        $email = $input->email();
        $firstName = (string) $input->text('first_name', 'nombre', 80);
        $lastName = (string) $input->text('last_name', 'apellido', 80);
        $role = $this->role($input);
        $this->limiter->hit('admin-invite:user:' . $admin['id'], 30, 3600);

        $conflict = HttpError::conflict('Ya existe una cuenta con ese email.');
        if ($this->db->value('SELECT 1 FROM users WHERE email = ?', [$email])) {
            throw $conflict;
        }
        try {
            $userId = $this->db->transaction(function () use ($email, $firstName, $lastName, $role, $admin) {
                // Contraseña aleatoria que nadie conoce: la cuenta no sirve hasta aceptar la invitación.
                $userId = $this->db->insert(
                    'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
                    [$email, password_hash(bin2hex(random_bytes(32)), PASSWORD_DEFAULT), $firstName, $lastName, $role]
                );
                $this->mail->sendInvitation($userId, $email, $firstName, $this->fullName($admin));
                return $userId;
            });
        } catch (\PDOException $e) {
            throw Db::isDuplicateKey($e) ? $conflict : $e;
        }

        return JsonResponse::created([
            'message' => "Cuenta creada. Le enviamos la invitación a $email.",
            'user' => $this->find($userId, $admin),
        ]);
    }

    /** POST /admin/usuarios/{id}/invitacion — manda de nuevo la invitación (anula la anterior). */
    public function resendInvitation(Request $request, int $id): array
    {
        $admin = $this->sessions->requireRole(['admin']);
        $user = $this->find($id, $admin);
        if ($user['status'] !== 'pending_invite') {
            throw HttpError::conflict('Esta cuenta no tiene una invitación pendiente.');
        }
        $this->limiter->hit('admin-invite:user:' . $admin['id'], 30, 3600);
        $this->mail->sendInvitation($id, $user['email'], $user['first_name'], $this->fullName($admin));
        return ['message' => "Le enviamos de nuevo la invitación a {$user['email']}.", 'user' => $user];
    }

    /** PUT /admin/usuarios/{id}/rol */
    public function changeRole(Request $request, int $id): array
    {
        $admin = $this->sessions->requireRole(['admin']);
        $this->find($id, $admin);
        if ($id === $admin['id']) {
            throw HttpError::forbidden('No podés cambiar tu propio rol (así nunca se queda el sitio sin admin). Pedíselo a otro admin.');
        }
        $role = $this->role(new Input($request->json()));
        $this->db->run('UPDATE users SET role = ? WHERE id = ?', [$role, $id]);
        $user = $this->find($id, $admin);
        return ['message' => "{$this->fullName($user)} ahora es $role.", 'user' => $user];
    }

    /** POST /admin/usuarios/{id}/suspender — no puede entrar más y se cierran sus sesiones abiertas. */
    public function suspend(Request $request, int $id): array
    {
        $admin = $this->sessions->requireRole(['admin']);
        $this->find($id, $admin);
        if ($id === $admin['id']) {
            throw HttpError::forbidden('No podés suspender tu propia cuenta.');
        }
        $this->db->transaction(function () use ($id) {
            $this->db->run('UPDATE users SET suspended_at = COALESCE(suspended_at, UTC_TIMESTAMP()) WHERE id = ?', [$id]);
            $this->sessions->logoutEverywhere($id);
        });
        $user = $this->find($id, $admin);
        return ['message' => "Suspendiste la cuenta de {$this->fullName($user)}.", 'user' => $user];
    }

    /** POST /admin/usuarios/{id}/reactivar */
    public function reactivate(Request $request, int $id): array
    {
        $admin = $this->sessions->requireRole(['admin']);
        $this->find($id, $admin);
        $this->db->run('UPDATE users SET suspended_at = NULL WHERE id = ?', [$id]);
        $user = $this->find($id, $admin);
        return ['message' => "La cuenta de {$this->fullName($user)} volvió a estar activa.", 'user' => $user];
    }

    private const USER_QUERY = "SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.email_verified_at, u.suspended_at,
                                       u.created_at, u.last_seen_at,
                                       EXISTS (SELECT 1 FROM user_tokens t WHERE t.user_id = u.id AND t.purpose = 'invite') AS invited
                                  FROM users u";

    private function find(int $id, array $admin): array
    {
        $row = $this->db->one(self::USER_QUERY . ' WHERE u.id = ?', [$id]) ?? throw HttpError::notFound('No existe ese usuario.');
        return $this->shape($row, $admin);
    }

    private function shape(array $row, array $admin): array
    {
        return [
            'id' => (int) $row['id'],
            'email' => $row['email'],
            'first_name' => $row['first_name'],
            'last_name' => $row['last_name'],
            'role' => $row['role'],
            'status' => match (true) {
                $row['suspended_at'] !== null => 'suspended',
                $row['email_verified_at'] !== null => 'active',
                (bool) $row['invited'] => 'pending_invite',
                default => 'unverified',
            },
            'is_me' => (int) $row['id'] === $admin['id'],
            'created_at' => Time::iso($row['created_at']),
            'last_seen_at' => Time::iso($row['last_seen_at']),
        ];
    }

    private function role(Input $input): string
    {
        $role = $input->raw('role');
        if (!in_array($role, self::ROLES, true)) {
            throw HttpError::invalid('El rol tiene que ser miliciano, redactor o admin.');
        }
        return $role;
    }

    private function fullName(array $user): string
    {
        return trim($user['first_name'] . ' ' . $user['last_name']);
    }
}
