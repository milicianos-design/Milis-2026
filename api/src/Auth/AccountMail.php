<?php
declare(strict_types=1);

namespace Milis\Auth;

use Milis\Config;
use Milis\Db;
use Milis\Http\HttpError;
use Milis\Mail\Mailer;

/**
 * Emails con enlaces de un solo uso: confirmar la cuenta, elegir una contraseña nueva y aceptar una
 * invitación de un admin. Cada enlace lleva un token aleatorio; la base guarda solo su hash.
 */
final class AccountMail
{
    private const VERIFY_TTL = 86400;      // 24 h
    private const RESET_TTL = 3600;        // 1 h
    private const INVITE_TTL = 7 * 86400;  // 7 días

    public function __construct(
        private readonly Db $db,
        private readonly Mailer $mailer,
        private readonly Config $config,
    ) {
    }

    public function sendVerification(int $userId, string $email, string $firstName): void
    {
        $link = $this->link('confirmar', $this->issue($userId, 'verify_email', self::VERIFY_TTL));
        $this->mailer->send($email, 'Confirmá tu cuenta - Milicianos', <<<TXT
            Hola $firstName:

            Para activar tu cuenta en la plataforma Milicianos entrá a este enlace (vale por 24 horas):
            $link

            Si no te registraste vos, ignorá este email.
            TXT);
    }

    public function sendPasswordReset(int $userId, string $email, string $firstName): void
    {
        $link = $this->link('nueva-clave', $this->issue($userId, 'reset_password', self::RESET_TTL));
        $this->mailer->send($email, 'Restablecer tu contraseña - Milicianos', <<<TXT
            Hola $firstName:

            Para elegir una contraseña nueva entrá a este enlace (vale por 1 hora):
            $link

            Si no lo pediste vos, ignorá este email: tu contraseña no cambia.
            TXT);
    }

    /** Invitación a una cuenta creada por un admin. Anula las invitaciones anteriores de esa cuenta. */
    public function sendInvitation(int $userId, string $email, string $firstName, string $invitedBy): void
    {
        $this->db->run("UPDATE user_tokens SET used_at = UTC_TIMESTAMP() WHERE user_id = ? AND purpose = 'invite' AND used_at IS NULL", [$userId]);
        $link = $this->link('invitacion', $this->issue($userId, 'invite', self::INVITE_TTL));
        $this->mailer->send($email, 'Te invitaron a la plataforma Milicianos', <<<TXT
            Hola $firstName:

            $invitedBy te creó una cuenta en la plataforma Milicianos ({$this->config->appUrl()}).
            Para activarla y elegir tu contraseña entrá a este enlace (vale por 7 días):
            $link

            Si no esperabas esta invitación, ignorá este email.
            TXT);
    }

    /** Marca el token como usado y devuelve el id del usuario. */
    public function consume(string $token, string $purpose): int
    {
        $invalid = HttpError::badRequest('El enlace no es válido o ya venció. Pedí uno nuevo.');
        if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
            throw $invalid;
        }
        $hash = hash('sha256', $token);
        $userId = $this->db->value(
            'SELECT user_id FROM user_tokens WHERE token_hash = ? AND purpose = ? AND used_at IS NULL AND expires_at > UTC_TIMESTAMP()',
            [$hash, $purpose]
        );
        // El UPDATE condicional evita que dos pedidos simultáneos usen el mismo token.
        $used = $userId !== null
            && $this->db->run('UPDATE user_tokens SET used_at = UTC_TIMESTAMP() WHERE token_hash = ? AND used_at IS NULL', [$hash])->rowCount() === 1;
        if (!$used) {
            throw $invalid;
        }
        return (int) $userId;
    }

    private function issue(int $userId, string $purpose, int $ttlSeconds): string
    {
        $token = bin2hex(random_bytes(32));
        $this->db->run(
            'INSERT INTO user_tokens (token_hash, user_id, purpose, expires_at) VALUES (?, ?, ?, UTC_TIMESTAMP() + INTERVAL ? SECOND)',
            [hash('sha256', $token), $userId, $purpose, $ttlSeconds]
        );
        return $token;
    }

    private function link(string $param, string $token): string
    {
        return $this->config->appUrl() . "/?$param=" . $token;
    }
}
