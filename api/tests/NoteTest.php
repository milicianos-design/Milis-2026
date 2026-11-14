<?php
declare(strict_types=1);

namespace Milis\Tests;

final class NoteTest extends ApiTestCase
{
    private function noteContent(): array
    {
        return ['time' => 1, 'version' => '2.31.7', 'blocks' => [
            ['id' => 'a1', 'type' => 'header', 'data' => ['text' => 'Título <script>x</script>', 'level' => 2]],
            ['id' => 'a2', 'type' => 'paragraph', 'data' => ['text' => 'Texto con <b>negrita</b> y <a href="javascript:alert(1)">link</a> <img src=x onerror=alert(1)>']],
            ['type' => 'list', 'data' => ['style' => 'checklist', 'items' => [['content' => 'uno', 'meta' => ['checked' => true], 'items' => []], 'dos']]],
            ['type' => 'embed', 'data' => ['service' => 'youtube', 'source' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'embed' => 'https://www.youtube.com/embed/dQw4w9WgXcQ']],
            ['type' => 'embed', 'data' => ['service' => 'vimeo', 'embed' => 'https://evil.example/x']],
            ['type' => 'raw', 'data' => ['html' => '<script>alert(1)</script>']],
        ]];
    }

    public function testSoloRedactoresEscribenNotas(): void
    {
        [$member] = $this->member();
        [$status] = $member->post('/api/notes', ['title' => 'Nota', 'type' => 'HISTORIA', 'status' => 'published', 'content' => $this->noteContent()]);
        $this->assertSame(403, $status);
        [$status] = $this->client()->post('/api/notes', ['title' => 'Nota']);
        $this->assertSame(401, $status);
    }

    public function testBorradorPublicacionYContenidoLimpio(): void
    {
        [$writer] = $this->member('redactor');
        [$reader] = $this->member();

        [$status, $body] = $writer->post('/api/notes', ['title' => '', 'type' => 'HISTORIA', 'status' => 'draft', 'content' => $this->noteContent(), 'keywords' => ['Fe', '#fe', 'Historia']]);
        $this->assertSame(201, $status, json_encode($body));
        $draft = $body['note'];
        $this->assertSame('Borrador sin título', $draft['title']);
        $this->assertSame(['fe', 'historia'], $draft['keywords']);

        $blocks = json_decode($draft['content'], true)['blocks'];
        $this->assertSame(['header', 'paragraph', 'list', 'embed'], array_column($blocks, 'type'), 'se descartan bloques desconocidos y videos que no son de YouTube');
        $json = $draft['content'];
        $this->assertStringNotContainsString('<script', $json);
        $this->assertStringNotContainsString('javascript:', $json);
        $this->assertStringNotContainsString('onerror', $json);
        $this->assertStringContainsString('<b>negrita</b>', $json);
        $this->assertSame(['checked' => true], $blocks[2]['data']['items'][0]['meta']);
        $this->assertSame('dos', $blocks[2]['data']['items'][1]['content']);

        // El borrador no es público.
        [, $list] = $this->client()->get('/api/notes');
        $this->assertSame([], $list['notes']);
        [$status] = $reader->get('/api/notes/' . $draft['id']);
        $this->assertSame(404, $status);
        [, $latest] = $writer->get('/api/notes/drafts/latest');
        $this->assertSame($draft['id'], $latest['note']['id']);

        // Publicar.
        [$status, $body] = $writer->put('/api/notes/' . $draft['id'], ['title' => 'La Vanguardia en acción', 'type' => 'HISTORIA', 'status' => 'published', 'content' => $this->noteContent(), 'keywords' => ['fe'], 'image_url' => 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg']);
        $this->assertSame(200, $status, json_encode($body));
        $this->assertSame('la-vanguardia-en-accion', $body['note']['slug']);
        $this->assertNotNull($body['note']['published_at']);

        [, $list] = $this->client()->get('/api/notes');
        $this->assertCount(1, $list['notes']);
        $this->assertArrayNotHasKey('content', $list['notes'][0], 'el listado no incluye el contenido completo');
        [$status, $body] = $reader->get('/api/notes/' . $draft['id']);
        $this->assertSame(200, $status);
        $this->assertFalse($body['note']['can_delete']);
        [, $tags] = $this->client()->get('/api/notes/tags');
        $this->assertSame(['fe'], $tags['tags']);

        // Otra nota con el mismo título recibe otro slug.
        [, $body] = $writer->post('/api/notes', ['title' => 'La Vanguardia en acción', 'type' => 'HISTORIA', 'status' => 'published', 'content' => $this->noteContent()]);
        $this->assertSame('la-vanguardia-en-accion-2', $body['note']['slug']);
    }

    public function testPermisosDeEdicionYBorrado(): void
    {
        [$writer] = $this->member('redactor');
        [$otherWriter] = $this->member('redactor');
        [$admin] = $this->member('admin');
        $payload = ['title' => 'Mía', 'type' => 'POLÍTICA', 'status' => 'published', 'content' => $this->noteContent()];
        [, $body] = $writer->post('/api/notes', $payload);
        $id = $body['note']['id'];

        [$status] = $otherWriter->put("/api/notes/$id", $payload);
        $this->assertSame(403, $status);
        [$status] = $otherWriter->delete("/api/notes/$id");
        $this->assertSame(403, $status);
        [$status] = $writer->post('/api/notes', ['image_url' => 'https://otro-sitio.com/x.jpg'] + $payload);
        $this->assertSame(422, $status);
        [$status] = $writer->post('/api/notes', ['type' => 'INVENTADO'] + $payload);
        $this->assertSame(422, $status);
        [$status] = $admin->delete("/api/notes/$id");
        $this->assertSame(200, $status);
    }
}
