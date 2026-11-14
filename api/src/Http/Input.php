<?php
declare(strict_types=1);

namespace Milis\Http;

/** Lee y valida campos de un pedido. Los mensajes de error son para mostrarle al usuario. */
final class Input
{
    public function __construct(private readonly array $data)
    {
    }

    public function has(string $key): bool
    {
        return isset($this->data[$key]) && $this->data[$key] !== '';
    }

    public function raw(string $key): mixed
    {
        return $this->data[$key] ?? null;
    }

    /** Texto de una línea o párrafo: sin caracteres de control, recortado y con largo acotado. */
    public function text(string $key, string $label, int $max, bool $required = true): ?string
    {
        $value = $this->data[$key] ?? null;
        if ($value === null || (is_string($value) && trim($value) === '')) {
            if ($required) {
                throw HttpError::invalid("Completá el campo $label.");
            }
            return null;
        }
        if (!is_string($value)) {
            throw HttpError::invalid("El campo $label no es válido.");
        }
        $value = trim(self::stripControlChars($value));
        if ($value === '' && $required) {
            throw HttpError::invalid("Completá el campo $label.");
        }
        if (mb_strlen($value) > $max) {
            throw HttpError::invalid("El campo $label es demasiado largo (máximo $max caracteres).");
        }
        return $value === '' ? null : $value;
    }

    public function email(string $key = 'email'): string
    {
        $email = mb_strtolower((string) $this->text($key, 'email', 254));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw HttpError::invalid('El email no es válido.');
        }
        return $email;
    }

    public function int(string $key, string $label): int
    {
        $value = $this->data[$key] ?? null;
        if (!is_int($value) && !(is_string($value) && ctype_digit($value))) {
            throw HttpError::invalid("El campo $label no es válido.");
        }
        return (int) $value;
    }

    /** Lista de textos (por ejemplo opciones de encuesta o etiquetas). */
    public function stringList(string $key, string $label, int $maxItems, int $maxLength): array
    {
        $value = $this->data[$key] ?? [];
        if (!is_array($value) || !array_is_list($value)) {
            throw HttpError::invalid("El campo $label no es válido.");
        }
        $items = [];
        foreach ($value as $item) {
            if (!is_string($item)) {
                throw HttpError::invalid("El campo $label no es válido.");
            }
            $item = trim(self::stripControlChars($item));
            if ($item === '') {
                continue;
            }
            if (mb_strlen($item) > $maxLength) {
                throw HttpError::invalid("Cada elemento de $label puede tener hasta $maxLength caracteres.");
            }
            $items[] = $item;
        }
        if (count($items) > $maxItems) {
            throw HttpError::invalid("El campo $label admite hasta $maxItems elementos.");
        }
        return $items;
    }

    /** Quita caracteres de control salvo saltos de línea y tabulaciones. */
    public static function stripControlChars(string $value): string
    {
        return (string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value);
    }
}
