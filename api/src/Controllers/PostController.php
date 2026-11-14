<?php
declare(strict_types=1);

namespace Milis\Controllers;

use Milis\Auth\RateLimiter;
use Milis\Auth\Sessions;
use Milis\Content\HtmlSanitizer;
use Milis\Content\ImageUploader;
use Milis\Content\Polls;
use Milis\Content\Time;
use Milis\Content\YouTube;
use Milis\Db;
use Milis\Http\HttpError;
use Milis\Http\Input;
use Milis\Http\JsonResponse;
use Milis\Http\Request;

final class PostController
{
    public const CATEGORIES = ['MILICIANOS', 'FILOSOFÍA', 'ESPIRITUALIDAD', 'HISTORIA', 'POLÍTICA'];

    private const SELECT = 'SELECT p.id, p.author_id, p.title, p.content, p.category, p.image_path, p.youtube_id,
               p.poll_question, p.created_at, u.first_name, u.last_name,
               (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id) AS vote_count,
               (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
               EXISTS(SELECT 1 FROM post_likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked_by_me
          FROM posts p JOIN users u ON u.id = p.author_id';

    public function __construct(
        private readonly Db $db,
        private readonly Sessions $sessions,
        private readonly RateLimiter $limiter,
        private readonly HtmlSanitizer $sanitizer,
        private readonly ImageUploader $uploader,
        private readonly Polls $polls,
    ) {
    }

    /** GET /posts?limit=50&before=<id> — los más nuevos primero. */
    public function list(Request $request): array
    {
        $viewer = $this->sessions->user();
        $limit = min(100, max(1, (int) ($request->query['limit'] ?? 50)));
        $before = max(0, (int) ($request->query['before'] ?? 0));
        $rows = $this->db->all(
            self::SELECT . ' WHERE (? = 0 OR p.id < ?) ORDER BY p.id DESC LIMIT ?',
            [$viewer['id'] ?? 0, $before, $before, $limit]
        );
        return ['posts' => $this->present($rows, $viewer)];
    }

    public function create(Request $request): JsonResponse
    {
        $user = $this->sessions->requireUser();
        $this->limiter->hit('post:user:' . $user['id'], 10, 600);
        $input = new Input($request->json());

        $title = $input->text('title', 'título', 200);
        $raw = $input->raw('content');
        if (!is_string($raw) || mb_strlen($raw) > 100_000) {
            throw HttpError::invalid('El contenido no es válido o es demasiado largo.');
        }
        $content = $this->sanitizer->rich($raw);
        if (trim(html_entity_decode(strip_tags($content))) === '' && !str_contains($content, '<iframe')) {
            throw HttpError::invalid('El título y el contenido son obligatorios.');
        }

        $category = mb_strtoupper((string) ($input->text('category', 'categoría', 30, required: false) ?? 'MILICIANOS'));
        if (!in_array($category, self::CATEGORIES, true)) {
            throw HttpError::invalid('La categoría no es válida.');
        }

        $imagePath = null;
        if ($input->has('image_url')) {
            $imagePath = $this->uploader->ownedPath((string) $input->raw('image_url'), 'post', $user['id'])
                ?? throw HttpError::invalid('La imagen no es válida.');
        }

        $youtubeId = null;
        if ($input->has('youtube_url')) {
            $youtubeId = YouTube::extractId((string) $input->raw('youtube_url'))
                ?? throw HttpError::invalid('El enlace de YouTube no es válido.');
        }

        [$pollQuestion, $pollOptions] = $this->readPoll($input);

        $postId = $this->db->transaction(function () use ($user, $title, $content, $category, $imagePath, $youtubeId, $pollQuestion, $pollOptions) {
            $postId = $this->db->insert(
                'INSERT INTO posts (author_id, title, content, category, image_path, youtube_id, poll_question) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [$user['id'], $title, $content, $category, $imagePath, $youtubeId, $pollQuestion]
            );
            if ($pollQuestion !== null) {
                $this->polls->create($postId, $pollOptions);
            }
            return $postId;
        });
        return JsonResponse::created(['post' => $this->find($postId, $user)]);
    }

    public function delete(Request $request, int $id): array
    {
        $user = $this->sessions->requireUser();
        $post = $this->db->one('SELECT author_id, image_path FROM posts WHERE id = ?', [$id]) ?? throw HttpError::notFound();
        if ((int) $post['author_id'] !== $user['id'] && !Sessions::isModerator($user)) {
            throw HttpError::forbidden();
        }
        $this->db->run('DELETE FROM posts WHERE id = ?', [$id]);
        if ($post['image_path'] !== null) {
            $this->uploader->delete($post['image_path']);
        }
        return ['ok' => true];
    }

    /** Like / quitar like (uno por usuario). */
    public function toggleLike(Request $request, int $id): array
    {
        $user = $this->sessions->requireUser();
        $this->limiter->hit('like:user:' . $user['id'], 120, 60);
        $this->assertExists($id);

        $added = $this->db->run('INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)', [$id, $user['id']])->rowCount() === 1;
        if (!$added) {
            $this->db->run('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [$id, $user['id']]);
        }
        return [
            'liked' => $added,
            'vote_count' => (int) $this->db->value('SELECT COUNT(*) FROM post_likes WHERE post_id = ?', [$id]),
        ];
    }

    public function vote(Request $request, int $id): array
    {
        $user = $this->sessions->requireUser();
        $optionId = (new Input($request->json()))->int('option_id', 'opción');
        if (!$this->db->value('SELECT 1 FROM poll_options WHERE id = ? AND post_id = ?', [$optionId, $id])) {
            throw HttpError::notFound('Opción no encontrada.');
        }
        try {
            $this->db->run('INSERT INTO poll_votes (post_id, user_id, option_id) VALUES (?, ?, ?)', [$id, $user['id'], $optionId]);
        } catch (\PDOException $e) {
            if (Db::isDuplicateKey($e)) {
                throw HttpError::conflict('Ya participaste en esta encuesta.');
            }
            throw $e;
        }
        return ['poll' => $this->pollOf($id, $user['id'])];
    }

    /** "Ver resultados" sin votar. */
    public function reveal(Request $request, int $id): array
    {
        $user = $this->sessions->requireUser();
        $this->assertExists($id);
        $this->db->run('INSERT IGNORE INTO poll_reveals (post_id, user_id) VALUES (?, ?)', [$id, $user['id']]);
        return ['poll' => $this->pollOf($id, $user['id'])];
    }

    private function readPoll(Input $input): array
    {
        $poll = $input->raw('poll');
        if ($poll === null) {
            return [null, []];
        }
        if (!is_array($poll)) {
            throw HttpError::invalid('La encuesta no es válida.');
        }
        $pollInput = new Input($poll);
        $question = $pollInput->text('question', 'pregunta de la encuesta', 300);
        $options = $pollInput->stringList('options', 'opciones de la encuesta', 10, 200);
        if (count($options) < 2) {
            throw HttpError::invalid('La encuesta necesita al menos 2 opciones.');
        }
        return [$question, $options];
    }

    private function pollOf(int $postId, int $viewerId): ?array
    {
        $question = $this->db->value('SELECT poll_question FROM posts WHERE id = ?', [$postId]);
        if ($question === null) {
            throw HttpError::notFound('Este post no tiene encuesta.');
        }
        return $this->polls->forPosts([$postId => $question], $viewerId)[$postId];
    }

    private function assertExists(int $id): void
    {
        if (!$this->db->value('SELECT 1 FROM posts WHERE id = ?', [$id])) {
            throw HttpError::notFound();
        }
    }

    private function find(int $id, ?array $viewer): array
    {
        $rows = $this->db->all(self::SELECT . ' WHERE p.id = ?', [$viewer['id'] ?? 0, $id]);
        return $this->present($rows, $viewer)[0] ?? throw HttpError::notFound();
    }

    private function present(array $rows, ?array $viewer): array
    {
        $questions = [];
        foreach ($rows as $row) {
            if ($row['poll_question'] !== null) {
                $questions[(int) $row['id']] = $row['poll_question'];
            }
        }
        $polls = $this->polls->forPosts($questions, $viewer['id'] ?? 0);

        return array_map(fn (array $row) => [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'content' => $row['content'],
            'category' => $row['category'],
            'image_url' => $row['image_path'] === null ? null : $this->uploader->urlFor($row['image_path']),
            'youtube_url' => $row['youtube_id'] === null ? null : YouTube::watchUrl($row['youtube_id']),
            'created_at' => Time::iso($row['created_at']),
            'author' => ['id' => (int) $row['author_id'], 'first_name' => $row['first_name'], 'last_name' => $row['last_name']],
            'vote_count' => (int) $row['vote_count'],
            'comment_count' => (int) $row['comment_count'],
            'liked_by_me' => (bool) $row['liked_by_me'],
            'can_delete' => $viewer !== null && ((int) $row['author_id'] === $viewer['id'] || Sessions::isModerator($viewer)),
            'poll' => $polls[(int) $row['id']] ?? null,
        ], $rows);
    }
}
