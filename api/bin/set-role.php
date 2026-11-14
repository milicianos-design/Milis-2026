<?php
// Cambia el rol de un usuario. Uso: php bin/set-role.php email@ejemplo.com admin|redactor|miliciano
declare(strict_types=1);

use Milis\Config;
use Milis\Db;

require __DIR__ . '/../vendor/autoload.php';

if (PHP_SAPI !== 'cli') {
    exit(1);
}

[, $email, $role] = $argv + [null, null, null];
if ($email === null || !in_array($role, ['admin', 'redactor', 'miliciano'], true)) {
    fwrite(STDERR, "Uso: php bin/set-role.php email@ejemplo.com admin|redactor|miliciano\n");
    exit(1);
}

$db = new Db(Config::load());
$updated = $db->run('UPDATE users SET role = ? WHERE email = ?', [$role, mb_strtolower($email)])->rowCount();
if ($updated === 0 && !$db->value('SELECT 1 FROM users WHERE email = ?', [mb_strtolower($email)])) {
    fwrite(STDERR, "No existe un usuario con el email $email.\n");
    exit(1);
}
echo "$email ahora es $role.\n";
