<?php
declare(strict_types=1);

namespace Milis\Controllers;

use Milis\Auth\RateLimiter;
use Milis\Auth\Sessions;
use Milis\Content\Time;
use Milis\Db;
use Milis\Http\HttpError;
use Milis\Http\Input;
use Milis\Http\JsonResponse;
use Milis\Http\Request;

/** Comentarios de los posts. Son texto plano: el frontend los muestra escapados. */
final class CommentController
{
    public function __construct(
        private readonly Db $db,
        private readonly Sessions $sessions,
        private readonly RateLimiter $limiter,
    ) {
    }

    public function list(Request $request, int $postId): array
    {
        if (!$this->db->value('SELECT 1 FROM posts WHERE id = ?', [$postId])) {
            throw HttpError::notFound();
        }
        $rows = $this->db->all(
            'SELECT c.id, c.post_id, c.author_id, c.content, c.created_at, u.first_name, u.last_name
               FROM comments c JOIN users u ON u.id = c.author_id
              WHERE c.post_id = ? ORDER BY c.created_at, c.id',
            [$postId]
        );
        $viewer = $this->sessions->user();
        return ['comments' => array_map(fn (array $row) => $this->present($row, $viewer), $rows)];
    }

    public function create(Request $request, int $postId): JsonResponse
    {
        $user = $this->sessions->requireUser();
        $this->limiter->hit('comment:user:' . $user['id'], 20, 60);
        $content = (new Input($request->json()))->text('content', 'comentario', 2000);
        if (!$this->db->value('SELECT 1 FROM posts WHERE id = ?', [$postId])) {
            throw HttpError::notFound();
        }
        $id = $this->db->insert('INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)', [$postId, $user['id'], $content]);
        $row = $this->db->one(
            'SELECT c.id, c.post_id, c.author_id, c.content, c.created_at, u.first_name, u.last_name
               FROM comments c JOIN users u ON u.id = c.author_id WHERE c.id = ?',
            [$id]
        );
        return JsonResponse::created(['comment' => $this->present($row, $user)]);
    }

    public function delete(Request $request, int $id): array
    {
        $user = $this->sessions->requireUser();
        $authorId = $this->db->value('SELECT author_id FROM comments WHERE id = ?', [$id]) ?? throw HttpError::notFound();
        if ((int) $authorId !== $user['id'] && !Sessions::isModerator($user)) {
            throw HttpError::forbidden();
        }
        $this->db->run('DELETE FROM comments WHERE id = ?', [$id]);
        return ['ok' => true];
    }

    private function present(array $row, ?array $viewer): array
    {
        return [
            'id' => (int) $row['id'],
            'post_id' => (int) $row['post_id'],
            'content' => $row['content'],
            'created_at' => Time::iso($row['created_at']),
            'author' => ['id' => (int) $row['author_id'], 'first_name' => $row['first_name'], 'last_name' => $row['last_name']],
            'can_delete' => $viewer !== null && ((int) $row['author_id'] === $viewer['id'] || Sessions::isModerator($viewer)),
        ];
    }
}
