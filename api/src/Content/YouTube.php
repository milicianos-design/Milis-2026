<?php
declare(strict_types=1);

namespace Milis\Content;

final class YouTube
{
    /** ID de 11 caracteres de un link de YouTube, o null si no es un link válido. */
    public static function extractId(?string $url): ?string
    {
        if ($url === null || $url === '') {
            return null;
        }
        if (!preg_match('~^https?://(?:www\.|m\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)/~i', $url)) {
            return null;
        }
        if (preg_match('~(?:youtu\.be/|/embed/|/v/|/shorts/|[?&]v=)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])~', $url, $m)) {
            return $m[1];
        }
        return null;
    }

    public static function watchUrl(string $id): string
    {
        return "https://www.youtube.com/watch?v=$id";
    }

    public static function embedUrl(string $id): string
    {
        return "https://www.youtube.com/embed/$id";
    }

    public static function isThumbnailUrl(string $url): bool
    {
        return (bool) preg_match('~^https://img\.youtube\.com/vi/[A-Za-z0-9_-]{11}/(maxresdefault|hqdefault)\.jpg$~', $url);
    }
}
