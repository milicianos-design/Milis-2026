<?php
// Punto de entrada único de la API. En Hostinger, .htaccess manda acá todos los pedidos a /api/*.
declare(strict_types=1);

ini_set('display_errors', '0');
error_reporting(E_ALL);

require __DIR__ . '/vendor/autoload.php';

Milis\App::run();
