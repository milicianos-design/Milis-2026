<?php
declare(strict_types=1);

namespace Milis\Http;

/** Error que se le muestra al usuario tal cual, con su código HTTP. */
final class HttpError extends \RuntimeException
{
    public function __construct(public readonly int $status, string $message)
    {
        parent::__construct($message);
    }

    public static function badRequest(string $message): self
    {
        return new self(400, $message);
    }

    public static function unauthorized(string $message = 'Tenés que ingresar para hacer esto.'): self
    {
        return new self(401, $message);
    }

    public static function forbidden(string $message = 'No tenés permiso para hacer esto.'): self
    {
        return new self(403, $message);
    }

    public static function notFound(string $message = 'No encontramos lo que buscás.'): self
    {
        return new self(404, $message);
    }

    public static function conflict(string $message): self
    {
        return new self(409, $message);
    }

    public static function invalid(string $message): self
    {
        return new self(422, $message);
    }

    public static function tooManyRequests(): self
    {
        return new self(429, 'Demasiados intentos. Esperá unos minutos y volvé a probar.');
    }
}
