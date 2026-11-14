<?php
declare(strict_types=1);

namespace Milis\Tests;

final class AuthTest extends ApiTestCase
{
    public function testRegistroConfirmacionYLogin(): void
    {
        $client = $this->client();
        $email = 'nuevo@milis.test';
        [$status, $body] = $client->post('/api/auth/register', [
            'email' => 'Nuevo@Milis.test', 'password' => 'clave-segura-1', 'first_name' => 'Juan', 'last_name' => 'Pérez',
        ]);
        $this->assertSame(201, $status);
        $this->assertStringContainsString('Revisá tu email', $body['message']);

        // Sin confirmar no se puede entrar (y se reenvía el email).
        [$status, $body] = $client->post('/api/auth/login', ['email' => $email, 'password' => 'clave-segura-1']);
        $this->assertSame(403, $status);
        $this->assertStringContainsString('confirmaste', $body['error']);

        [$status, $body] = $client->post('/api/auth/verify-email', ['token' => $this->tokenFromMail($email, 'confirmar')]);
        $this->assertSame(200, $status);
        $this->assertSame($email, $body['user']['email']);
        $this->assertSame('miliciano', $body['user']['role']);
        $this->assertTrue($client->hasSessionCookie());

        [, $body] = $client->get('/api/auth/me');
        $this->assertSame('Juan', $body['user']['first_name']);
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $body['csrf_token']);

        [$status, $body] = $client->post('/api/auth/logout');
        $this->assertSame(200, $status);
        $this->assertNull($body['user']);
        [, $body] = $client->get('/api/auth/me');
        $this->assertNull($body['user']);

        [$status] = $client->post('/api/auth/login', ['email' => $email, 'password' => 'clave-equivocada']);
        $this->assertSame(401, $status);
        [$status, $body] = $client->post('/api/auth/login', ['email' => $email, 'password' => 'clave-segura-1']);
        $this->assertSame(200, $status);
        $this->assertSame($email, $body['user']['email']);
    }

    public function testValidacionesDelRegistro(): void
    {
        $client = $this->client();
        $base = ['email' => 'valida@milis.test', 'password' => 'clave-segura-1', 'first_name' => 'A', 'last_name' => 'B'];

        [$status, $body] = $client->post('/api/auth/register', ['password' => 'corta'] + $base);
        $this->assertSame(422, $status);
        $this->assertStringContainsString('al menos 8', $body['error']);
        [$status] = $client->post('/api/auth/register', ['email' => 'no-es-un-email'] + $base);
        $this->assertSame(422, $status);
        [$status] = $client->post('/api/auth/register', ['first_name' => ''] + $base);
        $this->assertSame(422, $status);

        [$status] = $client->post('/api/auth/register', $base);
        $this->assertSame(201, $status);
        [$status, $body] = $client->post('/api/auth/register', $base);
        $this->assertSame(409, $status);
        $this->assertStringContainsString('ya se encuentra registrado', $body['error']);
    }

    public function testRecuperarContrasena(): void
    {
        [$client, $email] = $this->member();
        $other = $this->client();

        // Misma respuesta exista o no el email.
        [$status, $unknown] = $other->post('/api/auth/forgot-password', ['email' => 'nadie@milis.test']);
        $this->assertSame(200, $status);
        [$status, $known] = $other->post('/api/auth/forgot-password', ['email' => $email]);
        $this->assertSame(200, $status);
        $this->assertSame($unknown['message'], $known['message']);

        $token = $this->tokenFromMail($email, 'nueva-clave');
        [$status, $body] = $other->post('/api/auth/reset-password', ['token' => $token, 'password' => 'otra-clave-2']);
        $this->assertSame(200, $status);
        $this->assertSame($email, $body['user']['email']);

        // El token no se puede reusar, la clave vieja ya no sirve y las otras sesiones se cerraron.
        [$status] = $other->post('/api/auth/reset-password', ['token' => $token, 'password' => 'tercera-clave-3']);
        $this->assertSame(400, $status);
        [$status] = $this->client()->post('/api/auth/login', ['email' => $email, 'password' => 'clave-segura-1']);
        $this->assertSame(401, $status);
        [, $body] = $client->get('/api/auth/me');
        $this->assertNull($body['user']);
    }

    public function testLimiteDeIntentosDeLogin(): void
    {
        [, $email] = $this->member();
        $attacker = $this->client();
        $statuses = [];
        for ($i = 0; $i < 12; $i++) {
            [$statuses[]] = $attacker->post('/api/auth/login', ['email' => $email, 'password' => "intento-$i"]);
        }
        $this->assertSame(array_fill(0, 10, 401), array_slice($statuses, 0, 10));
        $this->assertSame([429, 429], array_slice($statuses, 10));
    }

    public function testPedidosDeOtroSitioOSinTokenCsrfSeRechazan(): void
    {
        [$client] = $this->member();

        [$status] = $client->request('POST', '/api/posts', '{}', ['Content-Type: application/json'], withOrigin: false);
        $this->assertSame(403, $status);
        [$status] = $client->request('POST', '/api/posts', '{}', ['Content-Type: application/json', 'Origin: https://sitio-malicioso.com'], withOrigin: false);
        $this->assertSame(403, $status);
        [$status, $body] = $client->request('POST', '/api/auth/logout', withCsrf: false);
        $this->assertSame(403, $status);
        $this->assertStringContainsString('Recargá la página', $body['error']);

        [, $body] = $client->get('/api/auth/me');
        $this->assertNotNull($body['user'], 'el logout sin token CSRF no tiene que haber cerrado la sesión');
    }

    public function testTokenDeConfirmacionInvalido(): void
    {
        [$status] = $this->client()->post('/api/auth/verify-email', ['token' => str_repeat('a', 64)]);
        $this->assertSame(400, $status);
        [$status] = $this->client()->post('/api/auth/verify-email', ['token' => '../../etc/passwd']);
        $this->assertSame(400, $status);
    }
}
