<?php
declare(strict_types=1);

namespace Milis\Content;

use GdImage;
use Milis\Config;
use Milis\Db;
use Milis\Http\HttpError;

/**
 * Guarda imágenes subidas por usuarios. Cada imagen se valida, se achica si hace falta y se vuelve
 * a codificar como WebP: así nunca se guarda el archivo original (que podría esconder otra cosa) y
 * se pierden los metadatos, como la ubicación GPS de las fotos.
 */
final class ImageUploader
{
    private const MAX_SIDE = 1920;
    private const MAX_PIXELS = 40_000_000;
    private const QUALITY = 82;
    private const FOLDERS = ['post' => 'posts', 'note' => 'notes'];

    public function __construct(private readonly Config $config, private readonly Db $db)
    {
    }

    /** Devuelve la URL pública de la imagen guardada. */
    public function store(array $file, string $kind, int $userId): string
    {
        $folder = self::FOLDERS[$kind] ?? throw HttpError::invalid('Tipo de imagen no válido.');
        $this->assertUploadOk($file);

        $info = @getimagesize($file['tmp_name']);
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        if ($info === false || !in_array($mime, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], true)) {
            throw HttpError::invalid('El archivo tiene que ser una imagen JPG, PNG, WebP o GIF.');
        }
        if ($info[0] * $info[1] > self::MAX_PIXELS) {
            throw HttpError::invalid('La imagen es demasiado grande.');
        }

        $image = $this->decode($file['tmp_name'], $mime);
        $image = $this->resize($image);

        $relative = sprintf('%s/%s/%s.webp', $folder, gmdate('Y/m'), bin2hex(random_bytes(16)));
        $target = $this->baseDir() . '/' . $relative;
        if (!is_dir(dirname($target)) && !mkdir(dirname($target), 0755, true) && !is_dir(dirname($target))) {
            throw new \RuntimeException('No se pudo crear la carpeta de imágenes.');
        }
        if (!imagewebp($image, $target, self::QUALITY)) {
            throw new \RuntimeException('No se pudo guardar la imagen.');
        }

        $this->db->run('INSERT INTO uploads (user_id, kind, path) VALUES (?, ?, ?)', [$userId, $kind, $relative]);
        return $this->urlFor($relative);
    }

    public function urlFor(string $relative): string
    {
        return rtrim((string) $this->config->get('uploads.url', '/uploads'), '/') . '/' . $relative;
    }

    /** Si $url apunta a una imagen subida por $userId (del tipo $kind), devuelve su ruta relativa. */
    public function ownedPath(string $url, string $kind, int $userId): ?string
    {
        $prefix = rtrim((string) $this->config->get('uploads.url', '/uploads'), '/') . '/';
        if (!str_starts_with($url, $prefix)) {
            return null;
        }
        $relative = substr($url, strlen($prefix));
        $owned = $this->db->value('SELECT 1 FROM uploads WHERE path = ? AND kind = ? AND user_id = ?', [$relative, $kind, $userId]);
        return $owned ? $relative : null;
    }

    public function delete(string $relative): void
    {
        $this->db->run('DELETE FROM uploads WHERE path = ?', [$relative]);
        $file = $this->baseDir() . '/' . $relative;
        if (preg_match('~^(posts|notes)/\d{4}/\d{2}/[a-f0-9]{32}\.webp$~', $relative) && is_file($file)) {
            unlink($file);
        }
    }

    private function assertUploadOk(array $file): void
    {
        $max = (int) $this->config->get('uploads.max_bytes', 8 * 1024 * 1024);
        $error = (int) $file['error'];
        if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE || (int) ($file['size'] ?? 0) > $max) {
            throw HttpError::invalid(sprintf('La imagen supera el máximo de %d MB.', intdiv($max, 1024 * 1024)));
        }
        if ($error !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
            throw HttpError::invalid('No se pudo recibir la imagen. Probá de nuevo.');
        }
    }

    private function decode(string $path, string $mime): GdImage
    {
        $image = match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($path),
            'image/png' => @imagecreatefrompng($path),
            'image/webp' => @imagecreatefromwebp($path),
            'image/gif' => @imagecreatefromgif($path),
        };
        if (!$image instanceof GdImage) {
            throw HttpError::invalid('La imagen está dañada o no se puede leer.');
        }
        if ($mime === 'image/jpeg') {
            $image = $this->applyExifOrientation($image, $path);
        }
        if (!imageistruecolor($image)) {
            imagepalettetotruecolor($image);
        }
        imagealphablending($image, false);
        imagesavealpha($image, true);
        return $image;
    }

    private function resize(GdImage $image): GdImage
    {
        $width = imagesx($image);
        $height = imagesy($image);
        if (max($width, $height) <= self::MAX_SIDE) {
            return $image;
        }
        $scale = self::MAX_SIDE / max($width, $height);
        $resized = imagescale($image, max(1, (int) round($width * $scale)), max(1, (int) round($height * $scale)), IMG_BICUBIC);
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        return $resized;
    }

    /** Las fotos de celular suelen venir "acostadas" con una marca de rotación: la aplicamos. */
    private function applyExifOrientation(GdImage $image, string $path): GdImage
    {
        if (!function_exists('exif_read_data')) {
            return $image;
        }
        $orientation = (int) (@exif_read_data($path)['Orientation'] ?? 1);
        $rotated = match ($orientation) {
            3 => imagerotate($image, 180, 0),
            6 => imagerotate($image, -90, 0),
            8 => imagerotate($image, 90, 0),
            default => $image,
        };
        return $rotated instanceof GdImage ? $rotated : $image;
    }

    private function baseDir(): string
    {
        return rtrim((string) $this->config->get('uploads.dir'), '/');
    }
}
