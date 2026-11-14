<?php
declare(strict_types=1);

namespace Milis;

use Milis\Auth\RateLimiter;
use Milis\Auth\Sessions;
use Milis\Content\EditorJsContent;
use Milis\Content\HtmlSanitizer;
use Milis\Content\ImageUploader;
use Milis\Content\Polls;
use Milis\Controllers\AuthController;
use Milis\Controllers\CommentController;
use Milis\Controllers\NoteController;
use Milis\Controllers\PostController;
use Milis\Controllers\UploadController;
use Milis\Http\HttpError;
use Milis\Http\JsonResponse;
use Milis\Http\Request;
use Milis\Http\Router;
use Milis\Mail\Mailer;

final class App
{
    public static function run(): void
    {
        // Cualquier aviso de PHP se trata como error: mejor fallar claro que seguir con datos raros.
        set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
            if (!(error_reporting() & $severity)) {
                return false;
            }
            throw new \ErrorException($message, 0, $severity, $file, $line);
        });

        $config = null;
        try {
            $config = Config::load();
            $request = Request::fromGlobals();
            $db = new Db($config);
            $sessions = new Sessions($db, $config, $request);

            if (!$request->isSafeMethod()) {
                self::checkOrigin($request, $config);
                $sessions->verifyCsrf();
            }

            $result = self::router($db, $config, $sessions)->dispatch($request);
            ($result instanceof JsonResponse ? $result : new JsonResponse($result))->send();

            if (random_int(1, 50) === 1) {
                self::cleanup($db);
            }
        } catch (HttpError $e) {
            (new JsonResponse(['error' => $e->getMessage()], $e->status))->send();
        } catch (\Throwable $e) {
            error_log('[milis] ' . $e);
            $message = $config?->isDev()
                ? $e->getMessage()
                : 'Ocurrió un error inesperado. Probá de nuevo en unos minutos.';
            (new JsonResponse(['error' => $message], 500))->send();
        }
    }

    private static function router(Db $db, Config $config, Sessions $sessions): Router
    {
        $limiter = new RateLimiter($db);
        $sanitizer = new HtmlSanitizer();
        $uploader = new ImageUploader($config, $db);

        $auth = new AuthController($db, $sessions, $limiter, new Mailer($config), $config);
        $posts = new PostController($db, $sessions, $limiter, $sanitizer, $uploader, new Polls($db));
        $comments = new CommentController($db, $sessions, $limiter);
        $notes = new NoteController($db, $sessions, $limiter, new EditorJsContent($sanitizer), $uploader);
        $uploads = new UploadController($sessions, $limiter, $uploader);

        $router = new Router();
        $router->add('GET', '/auth/me', $auth->me(...));
        $router->add('POST', '/auth/register', $auth->register(...));
        $router->add('POST', '/auth/verify-email', $auth->verifyEmail(...));
        $router->add('POST', '/auth/login', $auth->login(...));
        $router->add('POST', '/auth/logout', $auth->logout(...));
        $router->add('POST', '/auth/forgot-password', $auth->forgotPassword(...));
        $router->add('POST', '/auth/reset-password', $auth->resetPassword(...));

        $router->add('GET', '/posts', $posts->list(...));
        $router->add('POST', '/posts', $posts->create(...));
        $router->add('DELETE', '/posts/{id}', $posts->delete(...));
        $router->add('POST', '/posts/{id}/like', $posts->toggleLike(...));
        $router->add('POST', '/posts/{id}/poll/vote', $posts->vote(...));
        $router->add('POST', '/posts/{id}/poll/reveal', $posts->reveal(...));
        $router->add('GET', '/posts/{postId}/comments', $comments->list(...));
        $router->add('POST', '/posts/{postId}/comments', $comments->create(...));
        $router->add('DELETE', '/comments/{id}', $comments->delete(...));

        $router->add('GET', '/notes', $notes->list(...));
        $router->add('GET', '/notes/tags', $notes->tags(...));
        $router->add('GET', '/notes/drafts/latest', $notes->latestDraft(...));
        $router->add('GET', '/notes/{id}', $notes->show(...));
        $router->add('POST', '/notes', $notes->create(...));
        $router->add('PUT', '/notes/{id}', $notes->update(...));
        $router->add('DELETE', '/notes/{id}', $notes->delete(...));

        $router->add('POST', '/uploads', $uploads->store(...));
        return $router;
    }

    /**
     * Los pedidos que modifican datos solo se aceptan si vienen del propio sitio (los navegadores
     * mandan el header Origin). Junto con el token CSRF, frena que otra página actúe en nombre del usuario.
     */
    private static function checkOrigin(Request $request, Config $config): void
    {
        $allowed = array_map(
            fn (string $url) => rtrim($url, '/'),
            [$config->appUrl(), ...(array) $config->get('trusted_origins', [])]
        );
        if (!in_array($request->header('Origin'), $allowed, true)) {
            throw HttpError::forbidden('Pedido no permitido.');
        }
    }

    /** Borra de vez en cuando sesiones vencidas, tokens viejos y contadores de intentos. */
    private static function cleanup(Db $db): void
    {
        $db->run('DELETE FROM sessions WHERE expires_at < UTC_TIMESTAMP()');
        $db->run('DELETE FROM user_tokens WHERE expires_at < UTC_TIMESTAMP() - INTERVAL 7 DAY');
        $db->run('DELETE FROM rate_limits WHERE window_start < UTC_TIMESTAMP() - INTERVAL 1 DAY');
    }
}
