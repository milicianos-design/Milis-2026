<?php
// Configuración de las pruebas: usa la base "milis_test" de la MariaDB local (npm run db).
return [
    'env' => 'development',
    'app_url' => 'http://milis.test',
    'trusted_origins' => [],
    'db' => ['host' => '127.0.0.1', 'port' => 3307, 'name' => 'milis_test', 'user' => 'milis', 'pass' => 'milis-dev'],
    'uploads' => ['dir' => dirname(__DIR__, 2) . '/.dev/test-uploads', 'url' => '/uploads', 'max_bytes' => 2 * 1024 * 1024],
    'mail' => ['transport' => 'log', 'from_email' => 'no-responder@milis.test', 'from_name' => 'Milicianos', 'log_dir' => dirname(__DIR__, 2) . '/.dev/test-mail'],
    'session' => ['cookie' => 'milis_session', 'lifetime_days' => 30],
];
