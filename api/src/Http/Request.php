<?php
declare(strict_types=1);

namespace Milis\Http;

final class Request
{
    private ?array $json = null;

    public function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $query,
        private readonly array $server,
        private readonly array $cookies,
        private readonly array $files,
        private readonly string $body,
    ) {
    }

    public static function fromGlobals(): self
    {
        $path = (string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $path = preg_replace('#^/api(?=/|$)#', '', $path);
        $path = '/' . trim($path, '/');

        return new self(
            strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'),
            $path,
            $_GET,
            $_SERVER,
            $_COOKIE,
            $_FILES,
            (string) file_get_contents('php://input'),
        );
    }

    public function header(string $name): ?string
    {
        $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        $value = $this->server[$key] ?? null;
        return is_string($value) ? $value : null;
    }

    public function cookie(string $name): ?string
    {
        $value = $this->cookies[$name] ?? null;
        return is_string($value) ? $value : null;
    }

    /** Cuerpo JSON del pedido como array. */
    public function json(): array
    {
        if ($this->json === null) {
            if (trim($this->body) === '') {
                return $this->json = [];
            }
            $data = json_decode($this->body, true);
            if (!is_array($data)) {
                throw HttpError::badRequest('El pedido no tiene un formato válido.');
            }
            $this->json = $data;
        }
        return $this->json;
    }

    public function file(string $name): ?array
    {
        $file = $this->files[$name] ?? null;
        return is_array($file) && isset($file['tmp_name'], $file['error']) && !is_array($file['tmp_name']) ? $file : null;
    }

    public function ip(): string
    {
        return (string) ($this->server['REMOTE_ADDR'] ?? '0.0.0.0');
    }

    public function userAgent(): string
    {
        return mb_substr((string) ($this->server['HTTP_USER_AGENT'] ?? ''), 0, 255);
    }

    public function isSafeMethod(): bool
    {
        return in_array($this->method, ['GET', 'HEAD', 'OPTIONS'], true);
    }
}
