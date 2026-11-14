-- Esquema inicial de la plataforma Milicianos.
-- Todas las fechas se guardan en UTC. Usa IF NOT EXISTS para poder importarlo a mano (phpMyAdmin)
-- y después correr bin/migrate.php sin que falle.

CREATE TABLE IF NOT EXISTS users (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email             VARCHAR(254) NOT NULL,
    password_hash     VARCHAR(255) NOT NULL,
    first_name        VARCHAR(80)  NOT NULL,
    last_name         VARCHAR(80)  NOT NULL,
    role              ENUM('miliciano', 'redactor', 'admin') NOT NULL DEFAULT 'miliciano',
    email_verified_at DATETIME NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sesiones de login. La cookie guarda un token aleatorio; acá solo su hash.
CREATE TABLE IF NOT EXISTS sessions (
    token_hash   CHAR(64) PRIMARY KEY,
    user_id      INT UNSIGNED NOT NULL,
    csrf_token   CHAR(64) NOT NULL,
    ip           VARCHAR(45) NULL,
    user_agent   VARCHAR(255) NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at   DATETIME NOT NULL,
    KEY idx_sessions_user (user_id),
    KEY idx_sessions_expires (expires_at),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tokens de un solo uso enviados por email (confirmar cuenta, restablecer contraseña).
CREATE TABLE IF NOT EXISTS user_tokens (
    token_hash CHAR(64) PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    purpose    ENUM('verify_email', 'reset_password') NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at    DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user_tokens_user (user_id, purpose),
    CONSTRAINT fk_user_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contadores para limitar intentos (login, registro, recuperación de clave, publicaciones).
CREATE TABLE IF NOT EXISTS rate_limits (
    bucket       VARCHAR(190) PRIMARY KEY,
    window_start DATETIME NOT NULL,
    hits         INT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Imágenes subidas por los usuarios (para validar que un post/nota use una imagen propia).
CREATE TABLE IF NOT EXISTS uploads (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    kind       ENUM('post', 'note') NOT NULL,
    path       VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_uploads_path (path),
    CONSTRAINT fk_uploads_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    author_id     INT UNSIGNED NOT NULL,
    title         VARCHAR(200) NOT NULL,
    content       MEDIUMTEXT NOT NULL,
    category      VARCHAR(30) NOT NULL,
    image_path    VARCHAR(255) NULL,
    youtube_id    CHAR(11) NULL,
    poll_question VARCHAR(300) NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_posts_created (created_at),
    CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_likes (
    post_id    INT UNSIGNED NOT NULL,
    user_id    INT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    CONSTRAINT fk_post_likes_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_post_likes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS poll_options (
    id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id  INT UNSIGNED NOT NULL,
    position TINYINT UNSIGNED NOT NULL,
    text     VARCHAR(200) NOT NULL,
    UNIQUE KEY uq_poll_options_position (post_id, position),
    CONSTRAINT fk_poll_options_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Un voto por usuario y encuesta (la clave primaria lo garantiza).
CREATE TABLE IF NOT EXISTS poll_votes (
    post_id    INT UNSIGNED NOT NULL,
    user_id    INT UNSIGNED NOT NULL,
    option_id  INT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    CONSTRAINT fk_poll_votes_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_poll_votes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_poll_votes_option FOREIGN KEY (option_id) REFERENCES poll_options (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuarios que pidieron "Ver resultados" sin votar.
CREATE TABLE IF NOT EXISTS poll_reveals (
    post_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (post_id, user_id),
    CONSTRAINT fk_poll_reveals_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_poll_reveals_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id    INT UNSIGNED NOT NULL,
    author_id  INT UNSIGNED NOT NULL,
    content    VARCHAR(2000) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_comments_post (post_id, created_at),
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notas de Vanguardia. content guarda el JSON de Editor.js.
CREATE TABLE IF NOT EXISTS notes (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    author_id        INT UNSIGNED NOT NULL,
    title            VARCHAR(200) NOT NULL,
    slug             VARCHAR(230) NOT NULL,
    type             VARCHAR(30)  NOT NULL,
    content          MEDIUMTEXT   NOT NULL,
    image_url        VARCHAR(255) NULL,
    status           ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    reading_time_min SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at     DATETIME NULL,
    UNIQUE KEY uq_notes_slug (slug),
    KEY idx_notes_status (status, published_at),
    KEY idx_notes_author (author_id, status),
    CONSTRAINT fk_notes_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS note_keywords (
    note_id INT UNSIGNED NOT NULL,
    keyword VARCHAR(40) NOT NULL,
    PRIMARY KEY (note_id, keyword),
    KEY idx_note_keywords_keyword (keyword),
    CONSTRAINT fk_note_keywords_note FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
