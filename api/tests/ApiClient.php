<?php
declare(strict_types=1);

namespace Milis\Tests;

/** Cliente HTTP de prueba: se comporta como un navegador (cookies, header Origin y token CSRF). */
final class ApiClient
{
    private array $cookies = [];
    public ?string $csrf = null;

    public function __construct(private readonly string $baseUrl, private readonly string $origin)
    {
    }

    /** @return array{0: int, 1: array} [código HTTP, cuerpo JSON] */
    public function get(string $path): array
    {
        return $this->request('GET', $path);
    }

    public function post(string $path, array $json = [], array $headers = []): array
    {
        return $this->request('POST', $path, json_encode($json), ['Content-Type: application/json', ...$headers]);
    }

    public function put(string $path, array $json = []): array
    {
        return $this->request('PUT', $path, json_encode($json), ['Content-Type: application/json']);
    }

    public function delete(string $path): array
    {
        return $this->request('DELETE', $path);
    }

    public function upload(string $path, string $file, string $mime): array
    {
        return $this->request('POST', $path, ['image' => new \CURLFile($file, $mime, basename($file))]);
    }

    /** Pedido "crudo", para probar casos como un Origin ajeno o sin token CSRF. */
    public function request(string $method, string $path, string|array|null $body = null, array $headers = [], bool $withOrigin = true, bool $withCsrf = true): array
    {
        $curl = curl_init($this->baseUrl . $path);
        if ($withOrigin) {
            $headers[] = 'Origin: ' . $this->origin;
        }
        if ($withCsrf && $this->csrf !== null) {
            $headers[] = 'X-CSRF-Token: ' . $this->csrf;
        }
        if ($this->cookies !== []) {
            $headers[] = 'Cookie: ' . implode('; ', array_map(fn ($k, $v) => "$k=$v", array_keys($this->cookies), $this->cookies));
        }
        curl_setopt_array($curl, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_HEADERFUNCTION => function ($curl, string $line) {
                if (preg_match('/^Set-Cookie:\s*([^=]+)=([^;]*)/i', $line, $m)) {
                    if ($m[2] === '' || stripos($line, 'expires=Thu, 01 Jan 1970') !== false || preg_match('/Max-Age=0\b/i', $line)) {
                        unset($this->cookies[$m[1]]);
                    } else {
                        $this->cookies[$m[1]] = $m[2];
                    }
                }
                return strlen($line);
            },
        ]);
        if ($body !== null) {
            curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
        }
        $raw = (string) curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $data = json_decode($raw, true) ?? ['raw' => $raw];
        if (array_key_exists('csrf_token', $data)) {
            $this->csrf = $data['csrf_token'];
        }
        return [$status, $data];
    }

    public function hasSessionCookie(): bool
    {
        return isset($this->cookies['milis_session']);
    }
}
