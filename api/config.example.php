<?php
// Plantilla de configuración. Copiala como config.php (en la misma carpeta) y completá los valores.
// config.php tiene contraseñas: NO se sube a git. Es un archivo PHP a propósito: si alguien lo pide
// por la web, el servidor lo ejecuta y no muestra nada.

return [
    // 'production' oculta los detalles de los errores; 'development' los muestra.
    'env' => 'production',

    // Dirección pública del sitio, sin barra final. Se usa en los links de los emails
    // y para aceptar solo pedidos que vengan del propio sitio.
    'app_url' => 'https://tudominio.com',

    // Otros orígenes aceptados (por ejemplo 'https://www.tudominio.com').
    'trusted_origins' => [],

    // Base de datos (en Hostinger: hPanel → Bases de datos → MySQL).
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => '',
        'user' => '',
        'pass' => '',
    ],

    // Imágenes que suben los usuarios. En Hostinger: public_html/uploads.
    'uploads' => [
        'dir' => dirname(__DIR__) . '/uploads',
        'url' => '/uploads',
        'max_bytes' => 8 * 1024 * 1024,
    ],

    'mail' => [
        // 'smtp' envía de verdad; 'log' guarda cada email como archivo en log_dir (para desarrollo).
        'transport' => 'smtp',
        'from_email' => 'no-responder@tudominio.com',
        'from_name' => 'Milicianos',
        // En Hostinger: hPanel → Emails → creá la cuenta y usá sus datos (verificá host y puerto ahí).
        'smtp' => [
            'host' => 'smtp.hostinger.com',
            'port' => 465,
            'encryption' => 'ssl', // 'ssl' para el puerto 465, 'tls' para el 587
            'user' => '',
            'pass' => '',
        ],
        'log_dir' => null,
    ],

    'session' => [
        'cookie' => 'milis_session',
        'lifetime_days' => 30,
    ],
];
