<?php
declare(strict_types=1);

namespace Milis\Controllers;

use Milis\Auth\RateLimiter;
use Milis\Auth\Sessions;
use Milis\Content\Time;
use Milis\Db;
use Milis\Http\CsvResponse;
use Milis\Http\HttpError;
use Milis\Http\Input;
use Milis\Http\JsonResponse;
use Milis\Http\Request;

/** Postulaciones al Campamento Nacional (formulario público de /Campamentobn). */
final class CampamentoController
{
    private const MESSAGE = '¡Postulación registrada! Tu lugar para Mendoza 2027 quedó pre-reservado.';

    public function __construct(
        private readonly Db $db,
        private readonly Sessions $sessions,
        private readonly RateLimiter $limiter,
    ) {
    }

    /** POST /campamento/postulaciones — no hace falta tener cuenta. */
    public function create(Request $request): JsonResponse
    {
        // Varias personas pueden postularse desde el mismo celular o la misma red (una delegación).
        $this->limiter->hit('campamento:ip:' . $request->ip(), 20, 3600);
        $input = new Input($request->json());

        // Campo trampa: las personas no lo ven; si llega completo es un bot. Se responde igual que
        // siempre (para no darle pistas) pero no se guarda nada.
        if ($input->has('website')) {
            return JsonResponse::created(['message' => self::MESSAGE]);
        }

        $nombre = $this->required($input, 'nombre', 'nombre', 100);
        $whatsapp = $this->required($input, 'whatsapp', 'WhatsApp', 40);
        $digits = strlen((string) preg_replace('/\D/', '', $whatsapp));
        if ($digits < 6 || $digits > 16) {
            throw HttpError::invalid('El número de WhatsApp no es válido.');
        }
        $ciudad = $this->required($input, 'ciudad', 'ciudad o ruca', 100);
        $carrera = $this->required($input, 'carrera', 'carrera', 120);
        $motivacion = $input->text('motivacion', 'motivación', 600, required: false);

        $this->db->run(
            'INSERT INTO campamento_postulaciones (nombre, whatsapp, ciudad, carrera, motivacion, ip) VALUES (?, ?, ?, ?, ?, ?)',
            [$nombre, $whatsapp, $ciudad, $carrera, $motivacion, $request->ip()]
        );
        return JsonResponse::created(['message' => self::MESSAGE]);
    }

    /** GET /campamento/postulaciones — solo admins (son datos personales). */
    public function list(Request $request): array
    {
        $this->sessions->requireRole(['admin']);
        $rows = $this->db->all('SELECT id, nombre, whatsapp, ciudad, carrera, motivacion, created_at FROM campamento_postulaciones ORDER BY id DESC');
        return [
            'total' => count($rows),
            'postulaciones' => array_map(fn (array $row) => ['id' => (int) $row['id'], 'created_at' => Time::iso($row['created_at'])] + $row, $rows),
        ];
    }

    /** GET /campamento/postulaciones.csv — planilla para Excel o Google Sheets (solo admins). */
    public function csv(Request $request): CsvResponse
    {
        $this->sessions->requireRole(['admin']);
        $rows = $this->db->all('SELECT nombre, whatsapp, ciudad, carrera, motivacion, created_at FROM campamento_postulaciones ORDER BY id');
        $argentina = new \DateTimeZone('America/Argentina/Buenos_Aires');

        return new CsvResponse(
            'postulaciones-campamento-' . (new \DateTimeImmutable('now', $argentina))->format('Y-m-d') . '.csv',
            ['Fecha', 'Nombre', 'WhatsApp', 'Ciudad / Ruca', 'Carrera', 'Motivación'],
            array_map(fn (array $row) => [
                (new \DateTimeImmutable($row['created_at'], new \DateTimeZone('UTC')))->setTimezone($argentina)->format('d/m/Y H:i'),
                $row['nombre'],
                $row['whatsapp'],
                $row['ciudad'],
                $row['carrera'],
                $row['motivacion'] ?? '',
            ], $rows)
        );
    }

    /** Como el formulario original: obligatorio y de al menos 2 caracteres. */
    private function required(Input $input, string $key, string $label, int $max): string
    {
        $value = (string) $input->text($key, $label, $max);
        if (mb_strlen($value) < 2) {
            throw HttpError::invalid("Completá el campo $label.");
        }
        return $value;
    }
}
