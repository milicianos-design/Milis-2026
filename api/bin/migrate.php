<?php
// Aplica, en orden, las migraciones de database/migrations que todavía no se aplicaron.
// Uso: php bin/migrate.php
declare(strict_types=1);

use Milis\Config;
use Milis\Db;

require __DIR__ . '/../vendor/autoload.php';

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$db = new Db(Config::load());
$db->pdo()->exec(
    'CREATE TABLE IF NOT EXISTS schema_migrations (
        version    VARCHAR(190) PRIMARY KEY,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
);
$applied = array_column($db->all('SELECT version FROM schema_migrations'), 'version');

$files = glob(__DIR__ . '/../database/migrations/*.sql');
sort($files);
$count = 0;
foreach ($files as $file) {
    $version = basename($file, '.sql');
    if (in_array($version, $applied, true)) {
        continue;
    }
    // Las sentencias de cada archivo terminan en ";" al final de una línea.
    foreach (preg_split('/;\s*$/m', (string) file_get_contents($file)) as $statement) {
        $sql = trim((string) preg_replace('/^\s*--.*$/m', '', $statement));
        if ($sql !== '') {
            $db->pdo()->exec($sql);
        }
    }
    $db->run('INSERT INTO schema_migrations (version) VALUES (?)', [$version]);
    echo "Aplicada: $version\n";
    $count++;
}
echo $count === 0 ? "La base ya está al día.\n" : "Listo: $count migración(es) aplicada(s).\n";
