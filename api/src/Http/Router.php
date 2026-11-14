<?php
declare(strict_types=1);

namespace Milis\Http;

/** Router mínimo: rutas como '/posts/{id}/like', donde {id} es siempre un número. */
final class Router
{
    /** @var list<array{string, string, callable}> */
    private array $routes = [];

    public function add(string $method, string $pattern, callable $handler): void
    {
        $regex = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>[0-9]{1,10})', $pattern) . '$#';
        $this->routes[] = [$method, $regex, $handler];
    }

    public function dispatch(Request $request): mixed
    {
        $pathMatched = false;
        foreach ($this->routes as [$method, $regex, $handler]) {
            if (!preg_match($regex, $request->path, $match)) {
                continue;
            }
            $pathMatched = true;
            if ($method !== $request->method) {
                continue;
            }
            $params = array_map('intval', array_filter($match, 'is_string', ARRAY_FILTER_USE_KEY));
            return $handler($request, ...$params);
        }
        throw $pathMatched ? new HttpError(405, 'Método no permitido.') : HttpError::notFound();
    }
}
