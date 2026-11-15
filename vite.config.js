import { resolve } from 'path';
import { cpSync, rmSync } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const API_PORT = 8787;

// Lo que NO se sube al servidor: dependencias de desarrollo, pruebas y la configuración local.
const API_EXCLUDE = ['vendor', 'config.php', 'tests', 'phpunit.xml', '.phpunit.cache', 'dev-router.php'];

/**
 * En local, las mismas redirecciones que hace public/.htaccess en el sitio publicado: sin esto,
 * /admin (sin barra final) mostraba la portada en vez del panel.
 */
function devRedirects() {
  return {
    name: 'milis-dev-redirects',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const [path, query] = (req.url ?? '').split('?');
        const target = path === '/admin' ? '/admin/'
          : path.toLowerCase() === '/campamentobn' ? '/Campamentobn/'
          : null;
        if (!target) return next();
        res.writeHead(301, { Location: target + (query ? `?${query}` : '') });
        res.end();
      });
    },
  };
}

/** En desarrollo, levanta la API PHP (php -S) junto con Vite; Vite le pasa /api y /uploads. */
function phpDevServer(phpBin) {
  return {
    name: 'milis-php-dev-server',
    apply: 'serve',
    configureServer(server) {
      let major = 0;
      try {
        major = Number(execFileSync(phpBin, ['-r', 'echo PHP_MAJOR_VERSION;']).toString());
      } catch { /* se informa abajo */ }
      if (major < 8) {
        throw new Error(`La API necesita PHP 8 y "${phpBin}" no lo es. Configurá PHP_BIN en .env.local.`);
      }
      // Cuando cambia este archivo, Vite se reinicia dentro del mismo proceso: se reutiliza el PHP que
      // ya estaba corriendo (uno nuevo chocaría con el puerto ocupado y la API quedaría caída).
      const running = globalThis.__milisPhpServer;
      if (running && running.exitCode === null) return;

      const php = spawn(phpBin, ['-S', `127.0.0.1:${API_PORT}`, 'api/dev-router.php'], {
        cwd: __dirname,
        stdio: ['ignore', 'ignore', 'pipe'],
      });
      globalThis.__milisPhpServer = php;
      // php -S anota cada pedido; solo mostramos los errores de PHP.
      php.stderr.on('data', (chunk) => {
        for (const line of chunk.toString().split('\n')) {
          if (line.trim() && !/ (Accepted|Closing)$|\]: (GET|POST|PUT|DELETE) |Development Server/.test(line)) {
            server.config.logger.error(`[php] ${line}`);
          }
        }
      });
      process.on('exit', () => php.kill());
    },
  };
}

/** En el build, copia el backend a dist/api con solo las dependencias de producción. */
function phpApiBuild() {
  return {
    name: 'milis-php-api-build',
    apply: 'build',
    closeBundle() {
      const src = resolve(__dirname, 'api');
      const dest = resolve(__dirname, 'dist/api');
      rmSync(dest, { recursive: true, force: true });
      cpSync(src, dest, {
        recursive: true,
        filter: (path) => !API_EXCLUDE.some((name) => path === resolve(src, name)),
      });
      execFileSync('composer', ['install', '--no-dev', '--optimize-autoloader', '--no-interaction', '--no-progress', '--quiet', `--working-dir=${dest}`], {
        stdio: 'inherit',
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  return {
    plugins: [
      // React solo para la página del campamento (Campamentobn/); el resto del sitio es JS sin framework.
      react({ include: /Campamentobn\/.*\.[jt]sx?$/ }),
      devRedirects(),
      phpDevServer(env.PHP_BIN || 'php'),
      phpApiBuild(),
    ],
    server: {
      // Puerto fijo: la API solo acepta pedidos que vengan de http://localhost:5173.
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': `http://127.0.0.1:${API_PORT}`,
        '/uploads': `http://127.0.0.1:${API_PORT}`,
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          foro: resolve(__dirname, 'foro.html'),
          biencomun: resolve(__dirname, 'bien-comun-2026.html'),
          piergiorgio: resolve(__dirname, 'pier_giorgio.html'),
          promesas: resolve(__dirname, 'promesas.html'),
          stacatalina: resolve(__dirname, 'sta_catalina.html'),
          campamentobn: resolve(__dirname, 'Campamentobn/index.html'),
          admin: resolve(__dirname, 'admin/index.html'),
        },
      },
    },
  };
});
