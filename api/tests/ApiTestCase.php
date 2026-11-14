<?php
declare(strict_types=1);

namespace Milis\Tests;

use PDO;
use PHPUnit\Framework\TestCase;

/**
 * Base de las pruebas: levanta la API con el servidor de PHP (php -S) contra la base "milis_test",
 * que se borra y se vuelve a crear al empezar cada clase de pruebas.
 */
abstract class ApiTestCase extends TestCase
{
    private const CONFIG = __DIR__ . '/config.php';
    private static $server = null;
    protected static ?string $baseUrl = null;
    protected static array $config;

    public static function setUpBeforeClass(): void
    {
        self::$config = require self::CONFIG;
        self::resetDatabase();
        foreach ([self::$config['mail']['log_dir'], self::$config['uploads']['dir']] as $dir) {
            self::removeDir($dir);
        }
        self::startServer();
    }

    protected function setUp(): void
    {
        // Cada prueba arranca sin intentos acumulados (todas salen de la misma IP).
        self::pdo()->exec('DELETE FROM rate_limits');
    }

    protected function client(): ApiClient
    {
        return new ApiClient(self::$baseUrl, self::$config['app_url']);
    }

    /** Registra, confirma el email y deja logueado un usuario. Devuelve [cliente, email]. */
    protected function member(string $role = 'miliciano', ?string $email = null): array
    {
        $email ??= 'user' . bin2hex(random_bytes(4)) . '@milis.test';
        $client = $this->client();
        [$status] = $client->post('/api/auth/register', [
            'email' => $email, 'password' => 'clave-segura-1', 'first_name' => 'Ana', 'last_name' => 'Pérez',
        ]);
        self::assertSame(201, $status);
        [$status] = $client->post('/api/auth/verify-email', ['token' => $this->tokenFromMail($email, 'confirmar')]);
        self::assertSame(200, $status);
        if ($role !== 'miliciano') {
            self::pdo()->prepare('UPDATE users SET role = ? WHERE email = ?')->execute([$role, $email]);
        }
        return [$client, $email];
    }

    /** Token del último email enviado a $email con un link "?$param=TOKEN". */
    protected function tokenFromMail(string $email, string $param): string
    {
        $files = glob(self::$config['mail']['log_dir'] . '/*.txt') ?: [];
        rsort($files);
        foreach ($files as $file) {
            $text = (string) file_get_contents($file);
            if (str_contains($text, "Para: $email\n") && preg_match("/\\?$param=([a-f0-9]{64})/", $text, $m)) {
                return $m[1];
            }
        }
        self::fail("No llegó ningún email a $email con ?$param=");
    }

    protected static function pdo(): PDO
    {
        $db = self::$config['db'];
        return new PDO("mysql:host={$db['host']};port={$db['port']};dbname={$db['name']};charset=utf8mb4", $db['user'], $db['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
    }

    private static function resetDatabase(): void
    {
        $pdo = self::pdo();
        $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
        foreach ($pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN) as $table) {
            $pdo->exec("DROP TABLE `$table`");
        }
        $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

        $output = [];
        exec('MILIS_CONFIG=' . escapeshellarg(self::CONFIG) . ' ' . escapeshellarg(PHP_BINARY) . ' '
            . escapeshellarg(dirname(__DIR__) . '/bin/migrate.php') . ' 2>&1', $output, $code);
        if ($code !== 0) {
            throw new \RuntimeException("Fallaron las migraciones:\n" . implode("\n", $output));
        }
    }

    private static function startServer(): void
    {
        if (self::$server !== null) {
            return;
        }
        $socket = stream_socket_server('tcp://127.0.0.1:0');
        $port = (int) substr(strrchr(stream_socket_get_name($socket, false), ':'), 1);
        fclose($socket);

        self::$server = proc_open(
            [PHP_BINARY, '-S', "127.0.0.1:$port", dirname(__DIR__) . '/dev-router.php'],
            [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']],
            $pipes,
            dirname(__DIR__),
            ['MILIS_CONFIG' => self::CONFIG] + getenv()
        );
        self::$baseUrl = "http://127.0.0.1:$port";
        register_shutdown_function(static fn () => proc_terminate(self::$server));

        for ($i = 0; $i < 50; $i++) {
            if (@fsockopen('127.0.0.1', $port)) {
                return;
            }
            usleep(100_000);
        }
        throw new \RuntimeException('No arrancó el servidor de PHP para las pruebas.');
    }

    private static function removeDir(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }
        $items = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS), \RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($items as $item) {
            $item->isDir() ? rmdir($item->getPathname()) : unlink($item->getPathname());
        }
        rmdir($dir);
    }
}
