<?php
declare(strict_types=1);

namespace Milis\Content;

final class Time
{
    /** '2026-11-13 21:05:00' (UTC, como lo guarda MySQL) → '2026-11-13T21:05:00Z'. */
    public static function iso(?string $datetime): ?string
    {
        return $datetime === null ? null : str_replace(' ', 'T', $datetime) . 'Z';
    }
}
