// Regenera assets/fonts/material-symbols-outlined.woff2 con solo los íconos que usa el sitio
// (~7 KB en vez de varios MB). Correrlo después de agregar o quitar un ícono: npm run icons
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUTPUT = join(ROOT, 'assets/fonts/material-symbols-outlined.woff2');

// Íconos que se eligen en tiempo de ejecución y no aparecen escritos dentro de un elemento
// (los de showToast en js/main.js).
const DYNAMIC_ICONS = ['check_circle', 'warning', 'info'];
const ICON_ELEMENT = /class="[^"]*\bmaterial-symbols-outlined\b[^"]*"[^>]*>\s*([a-z0-9_]+)\s*</g;

const sources = [
    ...readdirSync(ROOT).filter((f) => f.endsWith('.html')),
    ...readdirSync(join(ROOT, 'js')).filter((f) => f.endsWith('.js')).map((f) => `js/${f}`),
];

const icons = new Set(DYNAMIC_ICONS);
for (const file of sources) {
    for (const [, name] of readFileSync(join(ROOT, file), 'utf8').matchAll(ICON_ELEMENT)) icons.add(name);
}
const names = [...icons].sort(); // Google Fonts exige la lista en orden alfabético

// Estilo fijo: contorno, peso 400, sin relleno, tamaño óptico 24 (el que usan todas las páginas).
const cssUrl = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${names.join(',')}`;
const headers = { 'User-Agent': 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/130.0 Safari/537.36' };

const css = await (await fetch(cssUrl, { headers })).text();
const fontUrl = css.match(/url\((https:[^)]+)\)/)?.[1];
if (!fontUrl) throw new Error(`Google Fonts no devolvió una fuente:\n${css}`);

const font = Buffer.from(await (await fetch(fontUrl, { headers })).arrayBuffer());
writeFileSync(OUTPUT, font);
console.log(`${names.length} íconos → assets/fonts/material-symbols-outlined.woff2 (${(font.length / 1024).toFixed(1)} KB)`);
