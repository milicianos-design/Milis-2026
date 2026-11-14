<?php
declare(strict_types=1);

namespace Milis\Auth;

use Milis\Config;
use Milis\Db;
use Milis\Http\HttpError;
use Milis\Http\Request;

/**
 * Sesiones de login guardadas en la base de datos.
 * La cookie (HttpOnly, inaccesible para JavaScript) lleva un token aleatorio; la base guarda solo su hash.
 * Cada sesión tiene además un token CSRF que el frontend manda en el header X-CSRF-Token.
 */
final class Sessions
{
    public const MODERATOR_ROLES = ['admin', 'redactor'];

    private ?array $user = null;
    private ?string $tokenHash = null;
    private bool $loaded = false;

    public function __construct(
        private readonly Db $db,
        private readonly Config $config,
        private readonly Request $request,
    ) {
    }

    /** Usuario logueado o null. Incluye 'csrf_token'. */
    public function user(): ?array
    {
        if ($this->loaded) {
            return $this->user;
        }
        $this->loaded = true;

        $token = $this->request->cookie($this->cookieName());
        if ($token === null || !preg_match('/^[a-f0-9]{64}$/', $token)) {
            return null;
        }
        $row = $this->db->one(
            'SELECT s.token_hash, s.csrf_token, s.last_used_at, u.id, u.email, u.first_name, u.last_name, u.role
               FROM sessions s JOIN users u ON u.id = s.user_id
              WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()',
            [hash('sha256', $token)]
        );
        if ($row === null) {
            $this->clearCookie();
            return null;
        }

        // Renovación: cada vez que se usa (como mucho una vez por hora) la sesión dura otros N días.
        if (strtotime($row['last_used_at'] . ' UTC') < time() - 3600) {
            $this->db->run(
                'UPDATE sessions SET last_used_at = UTC_TIMESTAMP(), expires_at = UTC_TIMESTAMP() + INTERVAL ? DAY WHERE token_hash = ?',
                [$this->lifetimeDays(), $row['token_hash']]
            );
            $this->setCookie($token);
        }

        $this->tokenHash = $row['token_hash'];
        return $this->user = self::shape($row);
    }

    public function requireUser(): array
    {
        return $this->user() ?? throw HttpError::unauthorized();
    }

    /** @param list<string> $roles */
    public function requireRole(array $roles): array
    {
        $user = $this->requireUser();
        if (!in_array($user['role'], $roles, true)) {
            throw HttpError::forbidden();
        }
        return $user;
    }

    public static function isModerator(?array $user): bool
    {
        return $user !== null && in_array($user['role'], self::MODERATOR_ROLES, true);
    }

    /** Inicia sesión para $userId (cierra la sesión anterior de este navegador, si había). */
    public function login(int $userId): array
    {
        if ($this->user() !== null) {
            $this->logout();
        }
        $token = bin2hex(random_bytes(32));
        $this->db->run(
            'INSERT INTO sessions (token_hash, user_id, csrf_token, ip, user_agent, expires_at)
             VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP() + INTERVAL ? DAY)',
            [hash('sha256', $token), $userId, bin2hex(random_bytes(32)), $this->request->ip(), $this->request->userAgent(), $this->lifetimeDays()]
        );
        $this->setCookie($token);

        $row = $this->db->one(
            'SELECT s.token_hash, s.csrf_token, u.id, u.email, u.first_name, u.last_name, u.role
               FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?',
            [hash('sha256', $token)]
        );
        $this->loaded = true;
        $this->tokenHash = $row['token_hash'];
        return $this->user = self::shape($row);
    }

    public function logout(): void
    {
        if ($this->user() !== null) {
            $this->db->run('DELETE FROM sessions WHERE token_hash = ?', [$this->tokenHash]);
        }
        $this->clearCookie();
        $this->user = null;
        $this->tokenHash = null;
    }

    /** Cierra todas las sesiones del usuario (por ejemplo al cambiar la contraseña). */
    public function logoutEverywhere(int $userId): void
    {
        $this->db->run('DELETE FROM sessions WHERE user_id = ?', [$userId]);
    }

    /** En pedidos que modifican datos, un usuario logueado tiene que mandar su token CSRF. */
    public function verifyCsrf(): void
    {
        $user = $this->user();
        if ($user === null) {
            return;
        }
        $sent = $this->request->header('X-CSRF-Token') ?? '';
        if (!hash_equals($user['csrf_token'], $sent)) {
            throw HttpError::forbidden('Tu sesión cambió. Recargá la página y volvé a intentar.');
        }
    }

    private static function shape(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'email' => $row['email'],
            'first_name' => $row['first_name'],
            'last_name' => $row['last_name'],
            'role' => $row['role'],
            'csrf_token' => $row['csrf_token'],
        ];
    }

    private function cookieName(): string
    {
        return (string) $this->config->get('session.cookie', 'milis_session');
    }

    private function lifetimeDays(): int
    {
        return (int) $this->config->get('session.lifetime_days', 30);
    }

    private function setCookie(string $token): void
    {
        setcookie($this->cookieName(), $token, [
            'expires' => time() + $this->lifetimeDays() * 86400,
            'path' => '/',
            'secure' => str_starts_with($this->config->appUrl(), 'https://'),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    private function clearCookie(): void
    {
        setcookie($this->cookieName(), '', [
            'expires' => time() - 3600,
            'path' => '/',
            'secure' => str_starts_with($this->config->appUrl(), 'https://'),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }
}
