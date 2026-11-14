<?php
// Solo para desarrollo local con el servidor de PHP (php -S): sirve /uploads/* y manda el resto
// a index.php. En Hostinger no se usa (lo reemplazan .htaccess y el propio servidor web).
declare(strict_types=1);

$path = (string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

if (str_starts_with($path, '/uploads/')) {
    $config = require (getenv('MILIS_CONFIG') ?: __DIR__ . '/config.php');
    $base = realpath($config['uploads']['dir']);
    $file = $base ? realpath($base . substr($path, strlen('/uploads'))) : false;
    if ($file && str_starts_with($file, $base . DIRECTORY_SEPARATOR) && is_file($file)) {
        header('Content-Type: ' . (mime_content_type($file) ?: 'application/octet-stream'));
        header('X-Content-Type-Options: nosniff');
        readfile($file);
    } else {
        http_response_code(404);
    }
    return true;
}

require __DIR__ . '/index.php';
