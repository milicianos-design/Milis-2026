<?php
declare(strict_types=1);

namespace Milis\Tests;

use Milis\Http\Request;
use PHPUnit\Framework\TestCase;

/** IP del visitante con y sin CDN (no necesita base de datos). */
final class RequestTest extends TestCase
{
    private function request(array $server, ?string $clientIpHeader): Request
    {
        return new Request('GET', '/', [], $server, [], [], '', $clientIpHeader);
    }

    public function testSinCdnUsaRemoteAddr(): void
    {
        $request = $this->request(['REMOTE_ADDR' => '203.0.113.7', 'HTTP_X_FORWARDED_FOR' => '1.2.3.4'], null);
        $this->assertSame('203.0.113.7', $request->ip(), 'sin configurar, el header se ignora (se podría falsificar)');
    }

    public function testConCdnTomaLaUltimaIpDelHeader(): void
    {
        $server = ['REMOTE_ADDR' => '10.0.0.1', 'HTTP_X_FORWARDED_FOR' => '6.6.6.6, 198.51.100.20'];
        $this->assertSame('198.51.100.20', $this->request($server, 'X-Forwarded-For')->ip(), 'la primera la puede inventar el cliente');
    }

    public function testHeaderInvalidoVuelveARemoteAddr(): void
    {
        $server = ['REMOTE_ADDR' => '10.0.0.1', 'HTTP_X_FORWARDED_FOR' => 'no-es-una-ip'];
        $this->assertSame('10.0.0.1', $this->request($server, 'X-Forwarded-For')->ip());
        $this->assertSame('10.0.0.1', $this->request(['REMOTE_ADDR' => '10.0.0.1'], 'X-Forwarded-For')->ip());
    }
}
