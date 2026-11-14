// Base de datos local para desarrollo: una instancia de MariaDB propia de este proyecto.
// Guarda sus datos en .dev/mysql y escucha en 127.0.0.1:3307. Arranca con --no-defaults, así que
// no lee la configuración global ni toca bases de otros proyectos.
//
//   npm run db          arranca (la primera vez crea la base, el usuario, api/config.php y las tablas)
//   npm run db:stop     la apaga
//
// Variables en .env.local (opcionales): PHP_BIN (PHP 8 para las migraciones), MARIADB_BIN_DIR.
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { userInfo } from 'node:os';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEV = join(ROOT, '.dev');
const DATA = join(DEV, 'mysql');
const SOCKET = join(DEV, 'mysql.sock');
const PORT = 3307;
const DB_USER = 'milis';
const DB_PASS = 'milis-dev'; // solo para esta base local, que no acepta conexiones de afuera de la máquina

const env = { ...readEnvLocal(), ...process.env };
const BIN = env.MARIADB_BIN_DIR || '/opt/homebrew/bin';
const PHP = env.PHP_BIN || 'php';
const client = (...args) => [join(BIN, 'mariadb'), ['--no-defaults', `--socket=${SOCKET}`, `--user=${userInfo().username}`, ...args]];

const command = process.argv[2] ?? 'start';
if (command === 'stop') stop();
else if (command === 'start') await start();
else {
  console.error('Uso: node scripts/dev-db.mjs [start|stop]');
  process.exit(1);
}

async function start() {
  assertPhp8();
  mkdirSync(DEV, { recursive: true });

  if (!existsSync(join(DATA, 'mysql'))) {
    console.log('Creando la base local en .dev/mysql ...');
    execFileSync(join(BIN, 'mariadb-install-db'), [
      '--no-defaults', `--datadir=${DATA}`, '--auth-root-authentication-method=socket', '--skip-test-db',
    ], { stdio: 'ignore' });
  }

  if (!isRunning()) {
    const server = spawn(join(BIN, 'mariadbd'), [
      '--no-defaults', `--datadir=${DATA}`, `--port=${PORT}`, '--bind-address=127.0.0.1', `--socket=${SOCKET}`,
      `--pid-file=${join(DEV, 'mysql.pid')}`, `--log-error=${join(DEV, 'mysql.log')}`, '--skip-name-resolve',
      '--character-set-server=utf8mb4', '--collation-server=utf8mb4_unicode_ci',
    ], { detached: true, stdio: 'ignore' });
    server.unref();
    for (let i = 0; i < 40 && !isRunning(); i++) await new Promise((r) => setTimeout(r, 250));
    if (!isRunning()) throw new Error('MariaDB no arrancó. Mirá .dev/mysql.log');
  }

  const [bin, args] = client('-e', `
    CREATE DATABASE IF NOT EXISTS milis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE DATABASE IF NOT EXISTS milis_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
    GRANT ALL PRIVILEGES ON milis.* TO '${DB_USER}'@'127.0.0.1';
    GRANT ALL PRIVILEGES ON milis_test.* TO '${DB_USER}'@'127.0.0.1';`);
  execFileSync(bin, args, { stdio: 'inherit' });

  writeDevConfig();
  execFileSync(PHP, [join(ROOT, 'api/bin/migrate.php')], { stdio: 'inherit' });
  console.log(`MariaDB local lista en 127.0.0.1:${PORT} (base "milis"). Para apagarla: npm run db:stop`);
}

function stop() {
  if (!isRunning()) {
    console.log('La base local no estaba corriendo.');
    return;
  }
  execFileSync(join(BIN, 'mariadb-admin'), ['--no-defaults', `--socket=${SOCKET}`, `--user=${userInfo().username}`, 'shutdown']);
  console.log('Base local apagada.');
}

function isRunning() {
  try {
    execFileSync(join(BIN, 'mariadb-admin'), ['--no-defaults', `--socket=${SOCKET}`, `--user=${userInfo().username}`, 'ping'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/** api/config.php para desarrollo (solo si no existe; nunca pisa uno que ya esté). */
function writeDevConfig() {
  const target = join(ROOT, 'api/config.php');
  if (existsSync(target)) return;
  writeFileSync(target, `<?php
// Configuración de DESARROLLO generada por scripts/dev-db.mjs (no se sube a git).
return [
    'env' => 'development',
    'app_url' => 'http://localhost:5173',
    'trusted_origins' => ['http://127.0.0.1:5173'],
    'db' => ['host' => '127.0.0.1', 'port' => ${PORT}, 'name' => 'milis', 'user' => '${DB_USER}', 'pass' => '${DB_PASS}'],
    'uploads' => ['dir' => dirname(__DIR__) . '/.dev/uploads', 'url' => '/uploads', 'max_bytes' => 8 * 1024 * 1024],
    'mail' => ['transport' => 'log', 'from_email' => 'no-responder@localhost', 'from_name' => 'Milicianos', 'log_dir' => dirname(__DIR__) . '/.dev/mail'],
    'session' => ['cookie' => 'milis_session', 'lifetime_days' => 30],
];
`);
  console.log('Creado api/config.php (desarrollo).');
}

function assertPhp8() {
  let major = 0;
  try {
    major = Number(execFileSync(PHP, ['-r', 'echo PHP_MAJOR_VERSION;']).toString());
  } catch { /* se informa abajo */ }
  if (major < 8) {
    console.error(`Se necesita PHP 8 y "${PHP}" no lo es. Configurá PHP_BIN en .env.local con la ruta a PHP 8.`);
    process.exit(1);
  }
}

function readEnvLocal() {
  const file = join(ROOT, '.env.local');
  if (!existsSync(file)) return {};
  return Object.fromEntries(readFileSync(file, 'utf8').split('\n')
    .map((line) => line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/))
    .filter(Boolean)
    .map(([, key, value]) => [key, value.replace(/^["']|["']$/g, '')]));
}
