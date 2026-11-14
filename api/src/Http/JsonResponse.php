<?php
declare(strict_types=1);

namespace Milis\Http;

final class JsonResponse implements Response
{
    public function __construct(public readonly mixed $data, public readonly int $status = 200)
    {
    }

    public static function created(mixed $data): self
    {
        return new self($data, 201);
    }

    public function send(): void
    {
        http_response_code($this->status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($this->data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }
}
