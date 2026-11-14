<?php
declare(strict_types=1);

namespace Milis\Auth;

use Milis\Db;
use Milis\Http\HttpError;

/** Limita cuántas veces se puede hacer algo en una ventana de tiempo (contra fuerza bruta y spam). */
final class RateLimiter
{
    public function __construct(private readonly Db $db)
    {
    }

    /** Suma un intento a $bucket; si supera $max dentro de $windowSeconds, responde 429. */
    public function hit(string $bucket, int $max, int $windowSeconds): void
    {
        if (!$this->attempt($bucket, $max, $windowSeconds)) {
            throw HttpError::tooManyRequests();
        }
    }

    /** Igual que hit() pero devuelve false en vez de cortar el pedido. */
    public function attempt(string $bucket, int $max, int $windowSeconds): bool
    {
        $bucket = mb_substr($bucket, 0, 190);
        // Las asignaciones se evalúan en orden: 'hits' todavía ve el window_start anterior.
        $this->db->run(
            'INSERT INTO rate_limits (bucket, window_start, hits) VALUES (?, UTC_TIMESTAMP(), 1)
             ON DUPLICATE KEY UPDATE
                 hits = IF(window_start < UTC_TIMESTAMP() - INTERVAL ? SECOND, 1, hits + 1),
                 window_start = IF(window_start < UTC_TIMESTAMP() - INTERVAL ? SECOND, UTC_TIMESTAMP(), window_start)',
            [$bucket, $windowSeconds, $windowSeconds]
        );
        return (int) $this->db->value('SELECT hits FROM rate_limits WHERE bucket = ?', [$bucket]) <= $max;
    }

    public function clear(string $bucket): void
    {
        $this->db->run('DELETE FROM rate_limits WHERE bucket = ?', [mb_substr($bucket, 0, 190)]);
    }
}
