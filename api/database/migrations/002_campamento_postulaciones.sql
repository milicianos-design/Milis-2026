-- Postulaciones al Campamento Nacional (formulario de /Campamentobn). Antes iban a una planilla de Google.
CREATE TABLE IF NOT EXISTS campamento_postulaciones (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    whatsapp   VARCHAR(40)  NOT NULL,
    ciudad     VARCHAR(100) NOT NULL,
    carrera    VARCHAR(120) NOT NULL,
    motivacion VARCHAR(600) NULL,
    ip         VARCHAR(45)  NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_campamento_postulaciones_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
