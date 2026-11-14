<?php
declare(strict_types=1);

namespace Milis\Content;

use Milis\Db;

/** Encuestas de los posts: opciones, votos (uno por usuario) y quién pidió ver resultados. */
final class Polls
{
    public function __construct(private readonly Db $db)
    {
    }

    /**
     * @param array<int, string> $questions post_id => pregunta (solo posts con encuesta)
     * @return array<int, array> post_id => encuesta lista para la respuesta JSON
     */
    public function forPosts(array $questions, int $viewerId): array
    {
        if ($questions === []) {
            return [];
        }
        $ids = array_keys($questions);
        $in = Db::placeholders(count($ids));

        $options = $this->db->all(
            "SELECT o.id, o.post_id, o.text, COUNT(v.user_id) AS votes
               FROM poll_options o LEFT JOIN poll_votes v ON v.option_id = o.id
              WHERE o.post_id IN ($in)
              GROUP BY o.id, o.post_id, o.position, o.text
              ORDER BY o.post_id, o.position",
            $ids
        );
        $myVotes = $viewerId === 0 ? [] : array_column(
            $this->db->all("SELECT post_id, option_id FROM poll_votes WHERE user_id = ? AND post_id IN ($in)", [$viewerId, ...$ids]),
            'option_id',
            'post_id'
        );
        $revealed = $viewerId === 0 ? [] : array_flip(array_column(
            $this->db->all("SELECT post_id FROM poll_reveals WHERE user_id = ? AND post_id IN ($in)", [$viewerId, ...$ids]),
            'post_id'
        ));

        $byPost = [];
        foreach ($options as $option) {
            $byPost[(int) $option['post_id']][] = $option;
        }

        $polls = [];
        foreach ($questions as $postId => $question) {
            $myVote = isset($myVotes[$postId]) ? (int) $myVotes[$postId] : null;
            $showResults = $myVote !== null || isset($revealed[$postId]);
            $total = 0;
            $list = [];
            foreach ($byPost[$postId] ?? [] as $option) {
                $total += (int) $option['votes'];
                $list[] = [
                    'id' => (int) $option['id'],
                    'text' => $option['text'],
                    // Los votos de cada opción se ven recién después de votar o de pedir los resultados.
                    'votes' => $showResults ? (int) $option['votes'] : null,
                ];
            }
            $polls[$postId] = [
                'question' => $question,
                'options' => $list,
                'total_votes' => $total,
                'my_vote' => $myVote,
                'show_results' => $showResults,
            ];
        }
        return $polls;
    }

    /** @param list<string> $options */
    public function create(int $postId, array $options): void
    {
        foreach (array_values($options) as $position => $text) {
            $this->db->run('INSERT INTO poll_options (post_id, position, text) VALUES (?, ?, ?)', [$postId, $position, $text]);
        }
    }
}
