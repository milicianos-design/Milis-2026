<?php
declare(strict_types=1);

namespace Milis\Tests;

final class AdminTest extends ApiTestCase
{
    private const NUEVA = ['email' => 'Invitada@Milis.test', 'first_name' => 'Lucía', 'last_name' => 'Gómez', 'role' => 'redactor'];

    private function admin(): ApiClient
    {
        [$admin] = $this->member('admin');
        return $admin;
    }

    private function userId(string $email): int
    {
        $stmt = self::pdo()->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        return (int) $stmt->fetchColumn();
    }

    /** Cantidad de emails enviados a $email (se guardan como archivos en las pruebas). */
    private function mailsTo(string $email): int
    {
        $files = glob(self::$config['mail']['log_dir'] . '/*.txt') ?: [];
        return count(array_filter($files, fn (string $f) => str_contains((string) file_get_contents($f), "Para: $email\n")));
    }

    public function testSoloLosAdminsUsanElPanel(): void
    {
        [$miliciano] = $this->member();
        [$redactor] = $this->member('redactor');
        foreach (['/api/admin/resumen', '/api/admin/usuarios'] as $path) {
            $this->assertSame(401, $this->client()->get($path)[0], "invitado en $path");
            $this->assertSame(403, $miliciano->get($path)[0], "miliciano en $path");
            $this->assertSame(403, $redactor->get($path)[0], "redactor en $path");
        }
        $this->assertSame(403, $redactor->post('/api/admin/usuarios', ['email' => 'x@milis.test'] + self::NUEVA)[0]);
        $this->assertSame(403, $redactor->put('/api/admin/usuarios/1/rol', ['role' => 'admin'])[0]);
        $this->assertSame(403, $redactor->post('/api/admin/usuarios/1/suspender')[0]);
    }

    public function testInvitarUnaCuentaNueva(): void
    {
        $admin = $this->admin();
        $email = 'invitada@milis.test';

        [$status, $body] = $admin->post('/api/admin/usuarios', self::NUEVA);
        $this->assertSame(201, $status, json_encode($body));
        $this->assertSame($email, $body['user']['email']);
        $this->assertSame('redactor', $body['user']['role']);
        $this->assertSame('pending_invite', $body['user']['status']);

        // Validaciones.
        $this->assertSame(409, $admin->post('/api/admin/usuarios', self::NUEVA)[0], 'email repetido');
        $this->assertSame(422, $admin->post('/api/admin/usuarios', ['role' => 'superadmin', 'email' => 'otra@milis.test'] + self::NUEVA)[0]);
        $this->assertSame(422, $admin->post('/api/admin/usuarios', ['email' => 'no-es-email'] + self::NUEVA)[0]);
        $this->assertSame(422, $admin->post('/api/admin/usuarios', ['first_name' => '', 'email' => 'otra@milis.test'] + self::NUEVA)[0]);

        // Antes de aceptar no hay contraseña que sirva.
        $this->assertSame(401, $this->client()->post('/api/auth/login', ['email' => $email, 'password' => 'cualquier-cosa'])[0]);

        // El token de invitación no sirve como token de "nueva contraseña".
        $token = $this->tokenFromMail($email, 'invitacion');
        $this->assertSame(400, $this->client()->post('/api/auth/reset-password', ['token' => $token, 'password' => 'mi-clave-nueva'])[0]);

        $invitada = $this->client();
        [$status, $body] = $invitada->post('/api/auth/accept-invite', ['token' => $token, 'password' => 'corta']);
        $this->assertSame(422, $status, 'la contraseña tiene que tener 8 caracteres');
        [$status, $body] = $invitada->post('/api/auth/accept-invite', ['token' => $token, 'password' => 'mi-clave-nueva']);
        $this->assertSame(200, $status, json_encode($body));
        $this->assertSame('redactor', $body['user']['role']);
        $this->assertSame(400, $this->client()->post('/api/auth/accept-invite', ['token' => $token, 'password' => 'otra-clave-1'])[0], 'el enlace se usa una sola vez');

        $this->assertSame(200, $this->client()->post('/api/auth/login', ['email' => $email, 'password' => 'mi-clave-nueva'])[0]);
        [, $body] = $admin->get('/api/admin/usuarios');
        $fila = array_values(array_filter($body['users'], fn (array $u) => $u['email'] === $email))[0];
        $this->assertSame('active', $fila['status']);
        $this->assertNotNull($fila['last_seen_at']);
    }

    public function testReenviarInvitacionAnulaLaAnterior(): void
    {
        $admin = $this->admin();
        $email = 'reenvio@milis.test';
        [, $body] = $admin->post('/api/admin/usuarios', ['email' => $email] + self::NUEVA);
        $id = $body['user']['id'];
        $primero = $this->tokenFromMail($email, 'invitacion');

        [$status] = $admin->post("/api/admin/usuarios/$id/invitacion");
        $this->assertSame(200, $status);
        $segundo = $this->tokenFromMail($email, 'invitacion');
        $this->assertNotSame($primero, $segundo);

        $this->assertSame(400, $this->client()->post('/api/auth/accept-invite', ['token' => $primero, 'password' => 'clave-segura-1'])[0]);
        $this->assertSame(200, $this->client()->post('/api/auth/accept-invite', ['token' => $segundo, 'password' => 'clave-segura-1'])[0]);

        // Ya activa: no hay invitación para reenviar.
        $this->assertSame(409, $admin->post("/api/admin/usuarios/$id/invitacion")[0]);
    }

    public function testCambiarRol(): void
    {
        $admin = $this->admin();
        [$miembro, $email] = $this->member();
        $id = $this->userId($email);

        [$status, $body] = $admin->put("/api/admin/usuarios/$id/rol", ['role' => 'redactor']);
        $this->assertSame(200, $status, json_encode($body));
        $this->assertSame('redactor', $body['user']['role']);
        [, $me] = $miembro->get('/api/auth/me');
        $this->assertSame('redactor', $me['user']['role'], 'el cambio vale sin volver a entrar');

        $this->assertSame(422, $admin->put("/api/admin/usuarios/$id/rol", ['role' => 'jefe'])[0]);
        $this->assertSame(404, $admin->put('/api/admin/usuarios/999999/rol', ['role' => 'admin'])[0]);

        // Nadie se cambia el rol a sí mismo (así nunca queda el sitio sin admin).
        [, $me] = $admin->get('/api/auth/me');
        [$status, $body] = $admin->put("/api/admin/usuarios/{$me['user']['id']}/rol", ['role' => 'miliciano']);
        $this->assertSame(403, $status);
        $this->assertStringContainsString('propio rol', $body['error']);
    }

    public function testSuspenderYReactivar(): void
    {
        $admin = $this->admin();
        [$miembro, $email] = $this->member();
        $id = $this->userId($email);

        [$status, $body] = $admin->post("/api/admin/usuarios/$id/suspender");
        $this->assertSame(200, $status, json_encode($body));
        $this->assertSame('suspended', $body['user']['status']);

        // Se le cierra la sesión que tenía abierta y no puede volver a entrar.
        [, $me] = $miembro->get('/api/auth/me');
        $this->assertNull($me['user']);
        [$status, $body] = $this->client()->post('/api/auth/login', ['email' => $email, 'password' => 'clave-segura-1']);
        $this->assertSame(403, $status);
        $this->assertStringContainsString('suspendida', $body['error']);

        // Tampoco recibe emails para cambiar la contraseña (la respuesta es la de siempre).
        $antes = $this->mailsTo($email);
        $this->assertSame(200, $this->client()->post('/api/auth/forgot-password', ['email' => $email])[0]);
        $this->assertSame($antes, $this->mailsTo($email));

        // Nadie se suspende a sí mismo.
        [, $me] = $admin->get('/api/auth/me');
        $this->assertSame(403, $admin->post("/api/admin/usuarios/{$me['user']['id']}/suspender")[0]);

        [$status, $body] = $admin->post("/api/admin/usuarios/$id/reactivar");
        $this->assertSame(200, $status);
        $this->assertSame('active', $body['user']['status']);
        $this->assertSame(200, $this->client()->post('/api/auth/login', ['email' => $email, 'password' => 'clave-segura-1'])[0]);
    }

    public function testResumen(): void
    {
        $admin = $this->admin();
        $this->client()->post('/api/campamento/postulaciones', [
            'nombre' => 'Juan Pérez', 'whatsapp' => '+54 9 11 2345-6789', 'ciudad' => 'Córdoba', 'carrera' => 'Ingeniería',
        ]);

        [$status, $body] = $admin->get('/api/admin/resumen');
        $this->assertSame(200, $status);
        $total = (int) self::pdo()->query('SELECT COUNT(*) FROM users')->fetchColumn();
        $this->assertSame($total, $body['users']['total']);
        $this->assertSame($total, array_sum($body['roles']));
        $this->assertGreaterThanOrEqual(1, $body['users']['active_last_week']);
        $this->assertSame((int) self::pdo()->query('SELECT COUNT(*) FROM campamento_postulaciones')->fetchColumn(), $body['postulaciones']['total']);
        $this->assertGreaterThanOrEqual(1, $body['postulaciones']['last_week']);
        foreach (['posts', 'comments', 'notes'] as $key) {
            $this->assertArrayHasKey('total', $body[$key]);
            $this->assertArrayHasKey('last_week', $body[$key]);
        }
    }
}
