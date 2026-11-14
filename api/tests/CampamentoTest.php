<?php
declare(strict_types=1);

namespace Milis\Tests;

final class CampamentoTest extends ApiTestCase
{
    private const DATOS = [
        'nombre' => 'Juan Ignacio Gómez',
        'whatsapp' => '+54 9 11 2345-6789',
        'ciudad' => 'Córdoba · Ruca Champaquí',
        'carrera' => 'Ingeniería en Sistemas',
        'motivacion' => 'Quiero poner mi profesión al servicio del país.',
        'website' => '',
    ];

    private function total(): int
    {
        return (int) self::pdo()->query('SELECT COUNT(*) FROM campamento_postulaciones')->fetchColumn();
    }

    public function testUnVisitanteSinCuentaSePostula(): void
    {
        $antes = $this->total();
        [$status, $body] = $this->client()->post('/api/campamento/postulaciones', self::DATOS);
        $this->assertSame(201, $status, json_encode($body));
        $this->assertStringContainsString('Postulación registrada', $body['message']);
        $this->assertSame($antes + 1, $this->total());
    }

    public function testValidaciones(): void
    {
        $client = $this->client();
        foreach ([
            ['nombre' => 'J'],
            ['whatsapp' => '123'],
            ['whatsapp' => 'no es un número'],
            ['ciudad' => ''],
            ['carrera' => ' '],
            ['motivacion' => str_repeat('x', 601)],
        ] as $cambio) {
            [$status] = $client->post('/api/campamento/postulaciones', $cambio + self::DATOS);
            $this->assertSame(422, $status, json_encode($cambio));
        }
        // La motivación es opcional.
        [$status] = $client->post('/api/campamento/postulaciones', ['motivacion' => ''] + self::DATOS);
        $this->assertSame(201, $status);
    }

    public function testLosBotsRecibenOkPeroNoSeGuarda(): void
    {
        $antes = $this->total();
        [$status, $body] = $this->client()->post('/api/campamento/postulaciones', ['website' => 'http://spam.example'] + self::DATOS);
        $this->assertSame(201, $status);
        $this->assertStringContainsString('Postulación registrada', $body['message']);
        $this->assertSame($antes, $this->total());
    }

    public function testLimiteDeEnviosPorIp(): void
    {
        $client = $this->client();
        $statuses = [];
        for ($i = 0; $i < 22; $i++) {
            [$statuses[]] = $client->post('/api/campamento/postulaciones', self::DATOS);
        }
        $this->assertSame(array_fill(0, 20, 201), array_slice($statuses, 0, 20));
        $this->assertSame([429, 429], array_slice($statuses, 20));
    }

    public function testUnMiembroLogueadoNecesitaSuTokenCsrf(): void
    {
        [$member] = $this->member();
        [$status] = $member->request('POST', '/api/campamento/postulaciones', json_encode(self::DATOS), ['Content-Type: application/json'], withCsrf: false);
        $this->assertSame(403, $status);
        [$status] = $member->post('/api/campamento/postulaciones', self::DATOS);
        $this->assertSame(201, $status);
    }

    public function testSoloAdminsVenYExportanLasPostulaciones(): void
    {
        $this->client()->post('/api/campamento/postulaciones', ['nombre' => '=HYPERLINK("http://x")'] + self::DATOS);
        [$miliciano] = $this->member();
        [$redactor] = $this->member('redactor');
        [$admin] = $this->member('admin');

        foreach (['/api/campamento/postulaciones', '/api/campamento/postulaciones.csv'] as $path) {
            $this->assertSame(401, $this->client()->get($path)[0], "invitado en $path");
            $this->assertSame(403, $miliciano->get($path)[0], "miliciano en $path");
            $this->assertSame(403, $redactor->get($path)[0], "redactor en $path");
        }

        [$status, $body] = $admin->get('/api/campamento/postulaciones');
        $this->assertSame(200, $status);
        $this->assertSame($this->total(), $body['total']);
        $this->assertSame('Ingeniería en Sistemas', $body['postulaciones'][0]['carrera']);

        [$status, $csv] = $admin->request('GET', '/api/campamento/postulaciones.csv');
        $this->assertSame(200, $status);
        $raw = $csv['raw'];
        $this->assertStringStartsWith("\xEF\xBB\xBFFecha;Nombre;WhatsApp;\"Ciudad / Ruca\";Carrera;Motivación", $raw, 'BOM + encabezados para Excel');
        $this->assertStringContainsString("'=HYPERLINK", $raw, 'las fórmulas se neutralizan');
        $this->assertStringContainsString('Córdoba · Ruca Champaquí', $raw);
    }

    public function testLaRutaCsvNoAceptaVariantes(): void
    {
        [$admin] = $this->member('admin');
        $this->assertSame(404, $admin->get('/api/campamento/postulacionesXcsv')[0]);
    }
}
