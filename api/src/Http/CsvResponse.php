<?php
declare(strict_types=1);

namespace Milis\Http;

/**
 * Descarga de una planilla CSV que abre bien en Excel (separador ";" y BOM UTF-8) y en Google Sheets.
 * Los valores que empiezan con = + - @ se anteponen con ' para que la planilla no los ejecute como fórmula.
 */
final class CsvResponse implements Response
{
    /** @param list<string> $headers @param list<list<string|int|null>> $rows */
    public function __construct(
        private readonly string $filename,
        private readonly array $headers,
        private readonly array $rows,
    ) {
    }

    public function send(): void
    {
        http_response_code(200);
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . preg_replace('/[^A-Za-z0-9._-]/', '_', $this->filename) . '"');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');

        $out = fopen('php://output', 'wb');
        fwrite($out, "\xEF\xBB\xBF");
        fputcsv($out, $this->headers, ';', '"', '');
        foreach ($this->rows as $row) {
            fputcsv($out, array_map(self::safeCell(...), $row), ';', '"', '');
        }
        fclose($out);
    }

    public static function safeCell(string|int|null $value): string
    {
        $value = (string) $value;
        return preg_match('/^[=+\-@\t\r]/', $value) ? "'" . $value : $value;
    }
}
