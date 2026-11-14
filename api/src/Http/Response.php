<?php
declare(strict_types=1);

namespace Milis\Http;

/** Respuesta que un controlador puede devolver tal cual (JSON, CSV…). */
interface Response
{
    public function send(): void;
}
