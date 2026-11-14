<?php
declare(strict_types=1);

namespace Milis\Controllers;

use Milis\Auth\RateLimiter;
use Milis\Auth\Sessions;
use Milis\Content\ImageUploader;
use Milis\Http\HttpError;
use Milis\Http\JsonResponse;
use Milis\Http\Request;

final class UploadController
{
    public function __construct(
        private readonly Sessions $sessions,
        private readonly RateLimiter $limiter,
        private readonly ImageUploader $uploader,
    ) {
    }

    /** POST /uploads?kind=post|note con el archivo en el campo "image". Devuelve { url }. */
    public function store(Request $request): JsonResponse
    {
        $kind = (string) ($request->query['kind'] ?? 'post');
        $user = $kind === 'note' ? $this->sessions->requireRole(Sessions::MODERATOR_ROLES) : $this->sessions->requireUser();
        $this->limiter->hit('upload:user:' . $user['id'], 30, 3600);
        $file = $request->file('image') ?? throw HttpError::invalid('Elegí una imagen para subir.');
        return JsonResponse::created(['url' => $this->uploader->store($file, $kind, $user['id'])]);
    }
}
