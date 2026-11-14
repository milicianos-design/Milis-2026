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
        private readonly ?string $clientIpHeader = null,
    ) {
    }

    /** @param ?string $clientIpHeader header con la IP real del visitante cuando hay un CDN (config client_ip_header) */
    public static function fromGlobals(?string $clientIpHeader = null): self
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
            $clientIpHeader,
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

    /**
     * IP del visitante (se usa para limitar intentos). Detrás de un CDN, REMOTE_ADDR es la IP del CDN y la
     * real viene en un header como X-Forwarded-For. De esa lista se toma la última IP, que es la que agregó
     * el CDN: las anteriores las puede inventar quien hace el pedido.
     */
    public function ip(): string
    {
        if ($this->clientIpHeader !== null) {
            $list = explode(',', (string) $this->header($this->clientIpHeader));
            $candidate = trim((string) end($list));
            if (filter_var($candidate, FILTER_VALIDATE_IP)) {
                return $candidate;
            }
        }
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
