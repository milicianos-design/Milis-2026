<?php
declare(strict_types=1);

namespace Milis\Content;

use Milis\Http\HttpError;

/**
 * Valida y limpia el JSON de Editor.js de las notas: solo deja los bloques que usa el editor
 * (párrafo, título, lista, cita, video de YouTube y separador) y limpia el HTML de cada texto.
 */
final class EditorJsContent
{
    private const MAX_BLOCKS = 500;
    private const MAX_LIST_DEPTH = 5;

    public function __construct(private readonly HtmlSanitizer $sanitizer)
    {
    }

    /** @return array{json: string, text: string} JSON limpio y texto plano (para calcular el tiempo de lectura). */
    public function clean(mixed $content): array
    {
        if (is_string($content)) {
            if (strlen($content) > 500_000) {
                throw HttpError::invalid('La nota es demasiado larga.');
            }
            $content = json_decode($content, true);
        }
        if (!is_array($content) || !is_array($content['blocks'] ?? null)) {
            throw HttpError::invalid('El contenido de la nota no es válido.');
        }

        $text = [];
        $blocks = [];
        foreach (array_slice($content['blocks'], 0, self::MAX_BLOCKS) as $block) {
            if (!is_array($block) || !is_array($block['data'] ?? null)) {
                continue;
            }
            $data = $this->cleanBlock((string) ($block['type'] ?? ''), $block['data'], $text);
            if ($data === null) {
                continue;
            }
            $clean = ['type' => $block['type'], 'data' => $data];
            if (is_string($block['id'] ?? null) && preg_match('/^[\w-]{1,40}$/', $block['id'])) {
                $clean = ['id' => $block['id']] + $clean;
            }
            $blocks[] = $clean;
        }

        $json = json_encode(
            ['time' => (int) ($content['time'] ?? 0), 'blocks' => $blocks, 'version' => (string) ($content['version'] ?? '')],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
        );
        return ['json' => $json, 'text' => trim(implode(' ', $text))];
    }

    private function cleanBlock(string $type, array $data, array &$text): ?array
    {
        return match ($type) {
            'paragraph' => ['text' => $this->inline($data['text'] ?? '', $text)],
            'header' => [
                'text' => $this->inline($data['text'] ?? '', $text),
                'level' => in_array((int) ($data['level'] ?? 2), [1, 2, 3, 4, 5, 6], true) ? (int) $data['level'] : 2,
            ],
            'quote' => [
                'text' => $this->inline($data['text'] ?? '', $text),
                'caption' => $this->inline($data['caption'] ?? '', $text),
                'alignment' => ($data['alignment'] ?? '') === 'center' ? 'center' : 'left',
            ],
            'list' => [
                'style' => in_array($data['style'] ?? '', ['ordered', 'unordered', 'checklist'], true) ? $data['style'] : 'unordered',
                'meta' => [],
                'items' => $this->listItems($data['items'] ?? [], 0, $text),
            ],
            'embed' => $this->embed($data, $text),
            'delimiter' => [],
            default => null,
        };
    }

    private function listItems(mixed $items, int $depth, array &$text): array
    {
        if (!is_array($items) || $depth > self::MAX_LIST_DEPTH) {
            return [];
        }
        $clean = [];
        foreach (array_slice($items, 0, 200) as $item) {
            if (is_string($item)) { // formato viejo de la lista: solo texto
                $item = ['content' => $item];
            }
            if (!is_array($item)) {
                continue;
            }
            $meta = is_array($item['meta'] ?? null) && array_key_exists('checked', $item['meta'])
                ? ['checked' => (bool) $item['meta']['checked']]
                : [];
            $clean[] = [
                'content' => $this->inline($item['content'] ?? '', $text),
                'meta' => $meta,
                'items' => $this->listItems($item['items'] ?? [], $depth + 1, $text),
            ];
        }
        return $clean;
    }

    private function embed(array $data, array &$text): ?array
    {
        if (($data['service'] ?? '') !== 'youtube') {
            return null;
        }
        $id = YouTube::extractId(is_string($data['source'] ?? null) ? $data['source'] : null)
            ?? YouTube::extractId(is_string($data['embed'] ?? null) ? $data['embed'] : null);
        if ($id === null) {
            return null;
        }
        return [
            'service' => 'youtube',
            'source' => YouTube::watchUrl($id),
            'embed' => YouTube::embedUrl($id),
            'width' => 580,
            'height' => 320,
            'caption' => $this->inline($data['caption'] ?? '', $text),
        ];
    }

    private function inline(mixed $html, array &$text): string
    {
        if (!is_string($html) || $html === '') {
            return '';
        }
        $clean = $this->sanitizer->inline($html);
        $text[] = html_entity_decode(strip_tags($clean), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return $clean;
    }
}
