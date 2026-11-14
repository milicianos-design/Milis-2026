// Publica el sitio en Hostinger: compila, sube dist/ por SSH, aplica migraciones nuevas y verifica.
//
//   npm run deploy
//
// Solo agrega o reemplaza archivos: nunca borra api/config.php ni las imágenes de uploads/
// (no están en dist/). Los datos de conexión se leen de .env.local:
//   DEPLOY_SSH=usuario@ip  DEPLOY_PORT=65002  DEPLOY_KEY=.dev/ssh/hostinger
//   DEPLOY_PATH=domains/tudominio.com/public_html  DEPLOY_URL=https://tudominio.com
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const env = { ...readEnvLocal(), ...process.env };

const missing = ['DEPLOY_SSH', 'DEPLOY_PORT', 'DEPLOY_KEY', 'DEPLOY_PATH', 'DEPLOY_URL'].filter((key) => !env[key]);
if (missing.length) fail(`Faltan en .env.local: ${missing.join(', ')} (ver .env.example).`);
if (!/^[\w.\/-]+$/.test(env.DEPLOY_PATH)) fail('DEPLOY_PATH tiene caracteres no permitidos.');

const key = resolve(ROOT, env.DEPLOY_KEY);
if (!existsSync(key)) fail(`No existe la llave SSH ${env.DEPLOY_KEY}.`);
const ssh = (command) => ['ssh', [
  '-i', key, '-p', String(env.DEPLOY_PORT),
  '-o', `UserKnownHostsFile=${join(ROOT, '.dev/ssh/known_hosts')}`, '-o', 'StrictHostKeyChecking=accept-new',
  '-o', 'BatchMode=yes', '-o', 'IdentitiesOnly=yes', '-o', 'LogLevel=ERROR',
  env.DEPLOY_SSH, command,
]];

step('1/4 Compilando');
execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit' });

step(`2/4 Subiendo dist/ a ${env.DEPLOY_SSH}:${env.DEPLOY_PATH}`);
await upload();

step('3/4 Aplicando migraciones de la base');
execFileSync(...ssh(`cd ${env.DEPLOY_PATH}/api && php bin/migrate.php`), { stdio: 'inherit' });

step('4/4 Verificando el sitio publicado');
const base = env.DEPLOY_URL.replace(/\/$/, '');
const page = await fetch(`${base}/`, { cache: 'no-store' });
const api = await fetch(`${base}/api/auth/me`, { cache: 'no-store' });
console.log(`  ${base}/ → ${page.status}`);
console.log(`  ${base}/api/auth/me → ${api.status}`);
if (!page.ok || !api.ok) fail('El sitio no respondió bien después de publicar. Revisá los logs de error en hPanel.');

console.log('\nListo. Si ves la versión anterior, vaciá la caché del CDN en hPanel.');

/** tar de dist/ por la conexión SSH (sin metadatos de macOS) y se extrae encima de lo que hay. */
function upload() {
  return new Promise((done, reject) => {
    const tar = spawn('tar', ['--no-mac-metadata', '--no-xattrs', '-czf', '-', '-C', join(ROOT, 'dist'), '.'], {
      env: { ...process.env, COPYFILE_DISABLE: '1' },
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    const remote = spawn(...ssh(`cd ${env.DEPLOY_PATH} && tar -xzf - --no-same-owner`), { stdio: ['pipe', 'inherit', 'inherit'] });
    tar.stdout.pipe(remote.stdin);
    let pending = 2;
    const finish = (name) => (code) => {
      if (code !== 0) reject(new Error(`${name} terminó con código ${code}`));
      else if (--pending === 0) done();
    };
    tar.on('close', finish('tar'));
    remote.on('close', finish('ssh'));
  }).catch((error) => fail(`Falló la subida: ${error.message}`));
}

function step(text) {
  console.log(`\n▸ ${text}`);
}

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

function readEnvLocal() {
  const file = join(ROOT, '.env.local');
  if (!existsSync(file)) return {};
  return Object.fromEntries(readFileSync(file, 'utf8').split('\n')
    .map((line) => line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/))
    .filter(Boolean)
    .map(([, name, value]) => [name, value.replace(/^["']|["']$/g, '')]));
}
