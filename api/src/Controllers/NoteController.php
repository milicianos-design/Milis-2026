<?php
declare(strict_types=1);

namespace Milis\Controllers;

use Milis\Auth\RateLimiter;
use Milis\Auth\Sessions;
use Milis\Content\EditorJsContent;
use Milis\Content\ImageUploader;
use Milis\Content\Time;
use Milis\Content\YouTube;
use Milis\Db;
use Milis\Http\HttpError;
use Milis\Http\Input;
use Milis\Http\JsonResponse;
use Milis\Http\Request;

/** Notas de Vanguardia. Las escriben redactores y admins; las publicadas las ve cualquiera. */
final class NoteController
{
    private const WORDS_PER_MINUTE = 200;

    public function __construct(
        private readonly Db $db,
        private readonly Sessions $sessions,
        private readonly RateLimiter $limiter,
        private readonly EditorJsContent $content,
        private readonly ImageUploader $uploader,
    ) {
    }

    /** GET /notes — notas publicadas, sin el contenido completo. */
    public function list(Request $request): array
    {
        $rows = $this->db->all(
            "SELECT n.id, n.author_id, n.title, n.slug, n.type, n.image_url, n.status, n.reading_time_min,
                    n.created_at, n.published_at, u.first_name, u.last_name
               FROM notes n JOIN users u ON u.id = n.author_id
              WHERE n.status = 'published'
              ORDER BY n.published_at DESC, n.id DESC
              LIMIT 200"
        );
        return ['notes' => $this->present($rows, $this->sessions->user(), withContent: false)];
    }

    public function show(Request $request, int $id): array
    {
        $viewer = $this->sessions->user();
        $row = $this->findRow($id);
        if ($row === null || ($row['status'] === 'draft' && (int) $row['author_id'] !== ($viewer['id'] ?? 0))) {
            throw HttpError::notFound();
        }
        return ['note' => $this->present([$row], $viewer, withContent: true)[0]];
    }

    /** Etiquetas usadas en notas publicadas o en las propias (para autocompletar). */
    public function tags(Request $request): array
    {
        $viewer = $this->sessions->user();
        $tags = $this->db->all(
            "SELECT DISTINCT k.keyword FROM note_keywords k JOIN notes n ON n.id = k.note_id
              WHERE n.status = 'published' OR n.author_id = ? ORDER BY k.keyword LIMIT 500",
            [$viewer['id'] ?? 0]
        );
        return ['tags' => array_column($tags, 'keyword')];
    }

    public function latestDraft(Request $request): array
    {
        $user = $this->sessions->requireRole(Sessions::MODERATOR_ROLES);
        $id = $this->db->value(
            "SELECT id FROM notes WHERE author_id = ? AND status = 'draft' ORDER BY updated_at DESC, id DESC LIMIT 1",
            [$user['id']]
        );
        return ['note' => $id === null ? null : $this->present([$this->findRow((int) $id)], $user, withContent: true)[0]];
    }

    public function create(Request $request): JsonResponse
    {
        $user = $this->sessions->requireRole(Sessions::MODERATOR_ROLES);
        $this->limiter->hit('note:user:' . $user['id'], 120, 600); // el editor guarda borradores solo
        $note = $this->readNote(new Input($request->json()), $user);

        $id = $this->db->transaction(function () use ($user, $note) {
            $id = $this->db->insert(
                'INSERT INTO notes (author_id, title, slug, type, content, image_url, status, reading_time_min, published_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, IF(? = \'published\', UTC_TIMESTAMP(), NULL))',
                [$user['id'], $note['title'], $this->uniqueSlug($note['title'], 0), $note['type'], $note['content'],
                    $note['image_url'], $note['status'], $note['reading_time_min'], $note['status']]
            );
            $this->saveKeywords($id, $note['keywords']);
            return $id;
        });
        return JsonResponse::created(['note' => $this->present([$this->findRow($id)], $user, withContent: true)[0]]);
    }

    public function update(Request $request, int $id): array
    {
        $user = $this->sessions->requireRole(Sessions::MODERATOR_ROLES);
        $this->limiter->hit('note:user:' . $user['id'], 120, 600);
        $current = $this->findRow($id) ?? throw HttpError::notFound();
        if ((int) $current['author_id'] !== $user['id']) {
            throw HttpError::forbidden('Solo quien escribió la nota puede editarla.');
        }
        $note = $this->readNote(new Input($request->json()), $user);

        $this->db->transaction(function () use ($id, $note) {
            $this->db->run(
                'UPDATE notes SET title = ?, slug = ?, type = ?, content = ?, image_url = ?, status = ?, reading_time_min = ?,
                        published_at = IF(? = \'published\', COALESCE(published_at, UTC_TIMESTAMP()), NULL)
                  WHERE id = ?',
                [$note['title'], $this->uniqueSlug($note['title'], $id), $note['type'], $note['content'], $note['image_url'],
                    $note['status'], $note['reading_time_min'], $note['status'], $id]
            );
            $this->saveKeywords($id, $note['keywords']);
        });
        return ['note' => $this->present([$this->findRow($id)], $user, withContent: true)[0]];
    }

    public function delete(Request $request, int $id): array
    {
        $user = $this->sessions->requireUser();
        $authorId = $this->db->value('SELECT author_id FROM notes WHERE id = ?', [$id]) ?? throw HttpError::notFound();
        if ((int) $authorId !== $user['id'] && $user['role'] !== 'admin') {
            throw HttpError::forbidden();
        }
        $this->db->run('DELETE FROM notes WHERE id = ?', [$id]);
        return ['ok' => true];
    }

    private function readNote(Input $input, array $user): array
    {
        $status = $input->raw('status') ?? 'draft';
        if (!in_array($status, ['draft', 'published'], true)) {
            throw HttpError::invalid('El estado de la nota no es válido.');
        }
        $type = mb_strtoupper((string) $input->text('type', 'tipo', 30));
        if (!in_array($type, PostController::CATEGORIES, true)) {
            throw HttpError::invalid('El tipo de nota no es válido.');
        }
        $title = $input->text('title', 'título', 200, required: $status === 'published') ?? 'Borrador sin título';
        $content = $this->content->clean($input->raw('content') ?? ['blocks' => []]);

        $imageUrl = null;
        if ($input->has('image_url')) {
            $url = (string) $input->raw('image_url');
            if (YouTube::isThumbnailUrl($url)) {
                $imageUrl = $url;
            } elseif ($path = $this->uploader->ownedPath($url, 'note', $user['id'])) {
                $imageUrl = $this->uploader->urlFor($path);
            } else {
                throw HttpError::invalid('La imagen no es válida.');
            }
        }

        $keywords = array_values(array_unique(array_map(
            fn (string $k) => mb_strtolower(ltrim($k, '#')),
            $input->stringList('keywords', 'etiquetas', 15, 40)
        )));
        $words = $content['text'] === '' ? 0 : count(preg_split('/\s+/u', $content['text']));

        return [
            'title' => $title,
            'type' => $type,
            'status' => $status,
            'content' => $content['json'],
            'image_url' => $imageUrl,
            'keywords' => $keywords,
            'reading_time_min' => max(1, (int) ceil($words / self::WORDS_PER_MINUTE)),
        ];
    }

    private function saveKeywords(int $noteId, array $keywords): void
    {
        $this->db->run('DELETE FROM note_keywords WHERE note_id = ?', [$noteId]);
        foreach ($keywords as $keyword) {
            $this->db->run('INSERT IGNORE INTO note_keywords (note_id, keyword) VALUES (?, ?)', [$noteId, $keyword]);
        }
    }

    /** Slug legible y único a partir del título ("Mi nota" → "mi-nota", "mi-nota-2"...). */
    private function uniqueSlug(string $title, int $noteId): string
    {
        // Tabla propia en vez de iconv: iconv translitera distinto según el sistema operativo.
        $ascii = strtr(mb_strtolower($title), [
            'á' => 'a', 'à' => 'a', 'â' => 'a', 'ä' => 'a', 'ã' => 'a', 'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
            'í' => 'i', 'ì' => 'i', 'î' => 'i', 'ï' => 'i', 'ó' => 'o', 'ò' => 'o', 'ô' => 'o', 'ö' => 'o', 'õ' => 'o',
            'ú' => 'u', 'ù' => 'u', 'û' => 'u', 'ü' => 'u', 'ñ' => 'n', 'ç' => 'c',
        ]);
        $base = trim((string) preg_replace('/[^a-z0-9]+/', '-', $ascii), '-');
        $base = substr($base !== '' ? $base : 'nota', 0, 200);
        $slug = $base;
        for ($n = 2; $this->db->value('SELECT 1 FROM notes WHERE slug = ? AND id <> ?', [$slug, $noteId]); $n++) {
            $slug = "$base-$n";
        }
        return $slug;
    }

    private function findRow(int $id): ?array
    {
        return $this->db->one(
            'SELECT n.*, u.first_name, u.last_name FROM notes n JOIN users u ON u.id = n.author_id WHERE n.id = ?',
            [$id]
        );
    }

    private function present(array $rows, ?array $viewer, bool $withContent): array
    {
        $ids = array_map(fn (array $r) => (int) $r['id'], $rows);
        $keywords = [];
        if ($ids !== []) {
            foreach ($this->db->all('SELECT note_id, keyword FROM note_keywords WHERE note_id IN (' . Db::placeholders(count($ids)) . ') ORDER BY keyword', $ids) as $k) {
                $keywords[(int) $k['note_id']][] = $k['keyword'];
            }
        }
        return array_map(function (array $row) use ($viewer, $withContent, $keywords) {
            $note = [
                'id' => (int) $row['id'],
                'title' => $row['title'],
                'slug' => $row['slug'],
                'type' => $row['type'],
                'image_url' => $row['image_url'],
                'status' => $row['status'],
                'reading_time_min' => (int) $row['reading_time_min'],
                'keywords' => $keywords[(int) $row['id']] ?? [],
                'created_at' => Time::iso($row['created_at']),
                'published_at' => Time::iso($row['published_at']),
                'author' => ['id' => (int) $row['author_id'], 'first_name' => $row['first_name'], 'last_name' => $row['last_name']],
                'can_delete' => $viewer !== null && ((int) $row['author_id'] === $viewer['id'] || $viewer['role'] === 'admin'),
            ];
            if ($withContent) {
                $note['content'] = $row['content'];
            }
            return $note;
        }, $rows);
    }
}
