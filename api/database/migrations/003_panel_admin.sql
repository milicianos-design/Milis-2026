-- Panel de administración (/admin): cuentas suspendidas, última actividad e invitaciones por email.

-- suspended_at: la cuenta no puede entrar (se conserva todo lo que publicó).
-- last_seen_at: última vez que la persona usó el sitio con su sesión (se actualiza como mucho una vez por hora).
ALTER TABLE users
    ADD COLUMN suspended_at DATETIME NULL AFTER email_verified_at,
    ADD COLUMN last_seen_at DATETIME NULL AFTER suspended_at;

-- 'invite': enlace para que una cuenta creada por un admin elija su contraseña.
ALTER TABLE user_tokens
    MODIFY purpose ENUM('verify_email', 'reset_password', 'invite') NOT NULL;
