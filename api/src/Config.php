<?php
declare(strict_types=1);

namespace Milis;

/** Configuración leída de config.php (o del archivo indicado en la variable de entorno MILIS_CONFIG). */
final class Config
{
    private function __construct(private readonly array $values)
    {
    }

    public static function load(): self
    {
        $path = getenv('MILIS_CONFIG') ?: dirname(__DIR__) . '/config.php';
        if (!is_file($path)) {
            throw new \RuntimeException("Falta la configuración: $path (copiá config.example.php como config.php).");
        }
        $values = require $path;
        if (!is_array($values)) {
            throw new \RuntimeException("$path tiene que devolver un array.");
        }
        return new self($values);
    }

    /** Lee un valor con notación de puntos, por ejemplo get('db.host'). */
    public function get(string $key, mixed $default = null): mixed
    {
        $value = $this->values;
        foreach (explode('.', $key) as $part) {
            if (!is_array($value) || !array_key_exists($part, $value)) {
                return $default;
            }
            $value = $value[$part];
        }
        return $value;
    }

    public function isDev(): bool
    {
        return $this->get('env') === 'development';
    }

    public function appUrl(): string
    {
        return rtrim((string) $this->get('app_url'), '/');
    }
}
