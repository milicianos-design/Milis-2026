<?php
declare(strict_types=1);

namespace Milis\Tests;

final class PostTest extends ApiTestCase
{
    public function testUnInvitadoVePeroNoPublica(): void
    {
        $guest = $this->client();
        [$status, $body] = $guest->get('/api/posts');
        $this->assertSame(200, $status);
        $this->assertIsArray($body['posts']);
        [$status] = $guest->post('/api/posts', ['title' => 'Hola', 'content' => '<p>Hola</p>']);
        $this->assertSame(401, $status);
    }

    public function testPublicarConEncuestaVideoYContenidoLimpio(): void
    {
        [$client] = $this->member();
        [$status, $body] = $client->post('/api/posts', [
            'title' => '  Primer post  ',
            'content' => '<p><strong>Hola</strong><script>alert(1)</script><img src=x onerror=alert(1)></p>'
                . '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"></iframe>'
                . '<iframe src="https://evil.example/embed/x"></iframe>',
            'category' => 'Filosofía',
            'youtube_url' => 'https://youtu.be/dQw4w9WgXcQ',
            'poll' => ['question' => '¿Vamos?', 'options' => ['Sí', 'No', '  ']],
        ]);
        $this->assertSame(201, $status, json_encode($body));
        $post = $body['post'];
        $this->assertSame('Primer post', $post['title']);
        $this->assertSame('FILOSOFÍA', $post['category']);
        $this->assertSame('https://www.youtube.com/watch?v=dQw4w9WgXcQ', $post['youtube_url']);
        $this->assertStringContainsString('<strong>Hola</strong>', $post['content']);
        $this->assertStringNotContainsString('script', $post['content']);
        $this->assertStringNotContainsString('onerror', $post['content']);
        $this->assertStringNotContainsString('evil.example', $post['content']);
        $this->assertStringContainsString('https://www.youtube.com/embed/dQw4w9WgXcQ', $post['content']);
        $this->assertSame(['Sí', 'No'], array_column($post['poll']['options'], 'text'));
        $this->assertFalse($post['poll']['show_results']);
        $this->assertNull($post['poll']['options'][0]['votes']);
        $this->assertTrue($post['can_delete']);
    }

    public function testValidacionesAlPublicar(): void
    {
        [$client] = $this->member();
        $ok = ['title' => 'T', 'content' => '<p>x</p>'];
        foreach ([
            ['title' => ''] + $ok,
            ['content' => '<script>solo script</script>'] + $ok,
            ['category' => 'INVENTADA'] + $ok,
            ['youtube_url' => 'https://evil.example/watch?v=dQw4w9WgXcQ'] + $ok,
            ['image_url' => 'https://otro-sitio.com/foto.jpg'] + $ok,
            ['poll' => ['question' => '¿?', 'options' => ['una sola']]] + $ok,
        ] as $payload) {
            [$status] = $client->post('/api/posts', $payload);
            $this->assertSame(422, $status, json_encode($payload));
        }
    }

    public function testLikesYVotos(): void
    {
        [$author] = $this->member();
        [$reader] = $this->member();
        [, $body] = $author->post('/api/posts', ['title' => 'Encuesta', 'content' => '<p>x</p>', 'poll' => ['question' => '¿?', 'options' => ['A', 'B']]]);
        $id = $body['post']['id'];
        $optionB = $body['post']['poll']['options'][1]['id'];

        [, $like] = $reader->post("/api/posts/$id/like");
        $this->assertSame(['liked' => true, 'vote_count' => 1], $like);
        [, $like] = $reader->post("/api/posts/$id/like");
        $this->assertSame(['liked' => false, 'vote_count' => 0], $like);

        [$status, $body] = $reader->post("/api/posts/$id/poll/vote", ['option_id' => $optionB]);
        $this->assertSame(200, $status);
        $this->assertSame($optionB, $body['poll']['my_vote']);
        $this->assertSame([0, 1], array_column($body['poll']['options'], 'votes'));
        [$status, $body] = $reader->post("/api/posts/$id/poll/vote", ['option_id' => $optionB]);
        $this->assertSame(409, $status);
        $this->assertSame('Ya participaste en esta encuesta.', $body['error']);

        // Ver resultados sin votar.
        [, $body] = $author->post("/api/posts/$id/poll/reveal");
        $this->assertTrue($body['poll']['show_results']);
        $this->assertNull($body['poll']['my_vote']);
        $this->assertSame(1, $body['poll']['total_votes']);

        // Una opción de otra encuesta no se acepta.
        [$status] = $reader->post('/api/posts/' . ($id + 999) . '/poll/vote', ['option_id' => $optionB]);
        $this->assertSame(404, $status);
    }

    public function testComentariosYPermisosDeBorrado(): void
    {
        [$author] = $this->member();
        [$other] = $this->member();
        [$moderator] = $this->member('redactor');
        [, $body] = $author->post('/api/posts', ['title' => 'Post', 'content' => '<p>x</p>']);
        $id = $body['post']['id'];

        [$status, $body] = $other->post("/api/posts/$id/comments", ['content' => '<b>Hola</b> & chau']);
        $this->assertSame(201, $status);
        $commentId = $body['comment']['id'];
        $this->assertSame('<b>Hola</b> & chau', $body['comment']['content'], 'los comentarios se guardan como texto; el frontend los escapa');

        [, $body] = $this->client()->get("/api/posts/$id/comments");
        $this->assertCount(1, $body['comments']);
        $this->assertFalse($body['comments'][0]['can_delete']);
        [, $body] = $this->client()->get('/api/posts');
        $this->assertSame(1, $body['posts'][0]['comment_count']);

        [$status] = $author->delete("/api/comments/$commentId");
        $this->assertSame(403, $status, 'el autor del post no puede borrar comentarios ajenos');
        [$status] = $moderator->delete("/api/comments/$commentId");
        $this->assertSame(200, $status);

        [$status] = $other->delete("/api/posts/$id");
        $this->assertSame(403, $status);
        [$status] = $author->delete("/api/posts/$id");
        $this->assertSame(200, $status);
        [$status] = $author->delete("/api/posts/$id");
        $this->assertSame(404, $status);
    }

    public function testSubidaDeImagenes(): void
    {
        [$client] = $this->member();
        [$intruder] = $this->member();

        $png = tempnam(sys_get_temp_dir(), 'milis') . '.png';
        $image = imagecreatetruecolor(3000, 1500);
        imagefill($image, 0, 0, imagecolorallocate($image, 150, 3, 23));
        imagepng($image, $png);

        [$status, $body] = $client->upload('/api/uploads?kind=post', $png, 'image/png');
        $this->assertSame(201, $status, json_encode($body));
        $this->assertMatchesRegularExpression('~^/uploads/posts/\d{4}/\d{2}/[a-f0-9]{32}\.webp$~', $body['url']);
        $stored = self::$config['uploads']['dir'] . substr($body['url'], strlen('/uploads'));
        [$width, $height, $type] = getimagesize($stored);
        $this->assertSame([1920, 960, IMAGETYPE_WEBP], [$width, $height, $type], 'se achica a 1920 px y se guarda como WebP');

        // Se sirve por /uploads.
        $this->assertSame('image/webp', get_headers(self::$baseUrl . $body['url'], true)['Content-Type']);

        // Solo el que la subió puede usarla en un post.
        [$status] = $intruder->post('/api/posts', ['title' => 'T', 'content' => '<p>x</p>', 'image_url' => $body['url']]);
        $this->assertSame(422, $status);
        [$status, $post] = $client->post('/api/posts', ['title' => 'T', 'content' => '<p>x</p>', 'image_url' => $body['url']]);
        $this->assertSame(201, $status);
        $this->assertSame($body['url'], $post['post']['image_url']);

        // Al borrar el post se borra la imagen.
        $client->delete('/api/posts/' . $post['post']['id']);
        $this->assertFileDoesNotExist($stored);

        // Un archivo que no es imagen (aunque diga ser PNG) se rechaza.
        $fake = tempnam(sys_get_temp_dir(), 'milis') . '.png';
        file_put_contents($fake, "<?php echo 'hola';");
        [$status] = $client->upload('/api/uploads?kind=post', $fake, 'image/png');
        $this->assertSame(422, $status);

        // Las imágenes de notas son solo para redactores.
        [$status] = $client->upload('/api/uploads?kind=note', $png, 'image/png');
        $this->assertSame(403, $status);

        unlink($png);
        unlink($fake);
    }
}
