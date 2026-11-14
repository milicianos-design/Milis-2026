# Milis 2026

Plataforma digital de los Milicianos: sitio institucional y de formación (Bien Común, Promesas,
Pier Giorgio Frassati, Santa Catalina), con un foro y las Notas de Vanguardia para miembros registrados.

## Cómo está armado

| Parte | Tecnología | Dónde está |
|---|---|---|
| Páginas | HTML + Tailwind CSS + JavaScript | `*.html`, `js/`, `src/input.css` |
| Compilación del frontend | Vite (Node) — solo en la compu, no en el servidor | `vite.config.js` |
| API (cuentas, foro, notas, imágenes) | PHP 8.2+ sin framework | `api/` |
| Base de datos | MySQL / MariaDB | `api/database/migrations/` |
| Hosting | Hostinger (archivos estáticos + PHP) | — |

No depende de servicios externos: fuentes, íconos, librerías e imágenes se sirven desde el propio sitio.
Lo único externo son los videos de YouTube que se incrustan en posts y notas.

```
├── *.html                 páginas del sitio
├── js/main.js             lógica de las páginas
├── js/api.js              cliente de la API (login, posts, notas…)
├── js/security.js         limpieza de lo que escriben los usuarios antes de mostrarlo
├── js/vendor/             editores (Quill, Editor.js) y scroll suave, empaquetados
├── src/input.css          estilos (Tailwind) y fuentes
├── assets/                imágenes, video y fuentes
├── public/                se copia tal cual al sitio (.htaccess, mapa ar.svg)
├── api/
│   ├── index.php          entrada de la API
│   ├── src/               código (controladores, sesiones, validaciones)
│   ├── database/          migraciones SQL
│   ├── bin/               migrate.php y set-role.php (línea de comandos)
│   ├── tests/             pruebas automáticas (PHPUnit)
│   └── config.example.php plantilla de configuración
└── scripts/               base de datos local e íconos
```

## Desarrollo local

### Requisitos

- Node.js 20 o superior
- PHP 8.2 o superior (con las extensiones pdo_mysql, gd, fileinfo y mbstring) y Composer
- MariaDB instalado (por ejemplo con Homebrew). No hace falta configurarlo: el proyecto usa su propia instancia.

### La primera vez

```bash
npm install
composer --working-dir=api install
cp .env.example .env.local   # y completá PHP_BIN si `php` no es PHP 8
npm run db                    # crea la base local, api/config.php y las tablas
```

### Día a día

```bash
npm run db        # arranca la base local (MariaDB propia del proyecto, puerto 3307, datos en .dev/)
npm run dev       # sitio + API en http://localhost:5173
npm run db:stop   # apaga la base al terminar
```

- Los emails no se envían en local: se guardan como archivos en `.dev/mail/` (de ahí se copian los
  links de confirmación de cuenta y de nueva contraseña).
- Las imágenes que se suben quedan en `.dev/uploads/`.
- Para dar permisos a una cuenta: `php api/bin/set-role.php email@ejemplo.com admin` (o `redactor`, `miliciano`).
  Los redactores escriben Notas de Vanguardia y moderan; los admins además borran notas ajenas.

### Otros comandos

| Comando | Para qué |
|---|---|
| `npm test` | Pruebas de la API (necesita `npm run db` corriendo) |
| `npm run build` | Compila el sitio en `dist/` (incluye la API con sus dependencias de producción) |
| `npm run package` | Compila y arma `build/milis-hostinger.zip` para subir |
| `npm run deploy` | Compila y publica en Hostinger por SSH (datos en `.env.local`) |
| `npm run icons` | Regenera la fuente de íconos después de agregar o quitar un ícono de Material Symbols |

## Publicar en Hostinger

### La primera vez

1. **PHP:** en hPanel → tu sitio → *Avanzado* → *Configuración de PHP*, elegí PHP 8.3 u 8.4 y verificá que
   estén activas las extensiones `pdo_mysql`, `gd`, `fileinfo` y `mbstring`.
2. **Base de datos:** en *Bases de datos* creá una base MySQL con su usuario y contraseña. Anotá el nombre,
   el usuario (Hostinger les agrega un prefijo como `u123456789_`) y el host que muestra el panel (normalmente `localhost`).
3. **Email:** en *Emails* creá una cuenta para los envíos del sitio (por ejemplo `no-responder@tudominio.com`).
   Desde ahí salen los emails de confirmación de cuenta y de recuperación de contraseña.
4. **SSL:** activá el certificado gratuito en *Seguridad* → *SSL*.
5. **Subir el sitio:** en tu compu corré `npm run package`. En el *Administrador de archivos*, entrá a
   `public_html`, subí `build/milis-hostinger.zip` y extraelo ahí mismo (borrá el `default.php` de Hostinger si está).
6. **Configuración:** en `public_html/api/` copiá `config.example.php` como `config.php` y completalo:
   `app_url` con la dirección final del sitio (por ejemplo `https://tudominio.com`, sin `www` — el `.htaccess`
   redirige `www` a esa dirección), los datos de la base y los del email (`smtp.hostinger.com`, puerto 465,
   `ssl`, usuario = la dirección de email completa). Verificá host y puerto en la sección *Emails* del panel.
7. **Crear las tablas:**
   - con acceso SSH: `cd public_html/api && php bin/migrate.php` (antes revisá con `php -v` que sea PHP 8.2 o superior);
   - sin SSH: en phpMyAdmin, elegí la base → *Importar* → el archivo `api/database/migrations/001_esquema_inicial.sql` del repositorio.
8. **Primer admin:** registrate en el sitio y confirmá la cuenta con el email que llega (eso prueba que el envío funciona).
   Después: por SSH `php bin/set-role.php tu@email.com admin`, o en phpMyAdmin
   `UPDATE users SET role = 'admin' WHERE email = 'tu@email.com';`
9. **Probar:** login, un post con imagen y encuesta, un comentario y una nota.
   Si el sitio pasa por el CDN de Hostinger, revisá en phpMyAdmin la columna `ip` de la tabla `sessions`:
   tiene que ser tu IP real. Si aparece una IP de Hostinger, poné `'client_ip_header' => 'X-Forwarded-For'`
   en `api/config.php` (si no, el límite de intentos de login trataría a todos los visitantes como uno solo).
10. **Dominio:** si el dominio todavía apunta a Vercel, cambiá los DNS para que apunten a Hostinger (hPanel indica
    los nameservers o la IP). Cuando el sitio ande por HTTPS, podés activar la línea `Strict-Transport-Security` de `public/.htaccess`.
11. **Apagar lo viejo:** con todo funcionando en Hostinger, eliminá el proyecto de Vercel y el de Supabase.

### Actualizaciones

**Con SSH (lo más simple):** completá los datos `DEPLOY_*` en `.env.local` (ver `.env.example`) y corré
`npm run deploy`. Compila, sube el sitio, aplica migraciones nuevas y verifica que responda.
No toca `api/config.php` ni las imágenes de `uploads/`.

**A mano:**

1. `npm run package`
2. Subí el zip a `public_html` y extraelo encima. Se reemplazan los archivos del sitio;
   **no se tocan** `api/config.php` ni las imágenes de `uploads/` (no borres esas dos cosas).
3. Si la actualización trae migraciones nuevas en `api/database/migrations/`, corré `php bin/migrate.php`
   (o importá en phpMyAdmin solo los archivos nuevos).
4. Si el CDN de Hostinger está activo, vaciá su caché desde hPanel (sección CDN) para que todos vean la versión nueva.

### Copias de seguridad

Hostinger hace copias automáticas (la frecuencia depende del plan). Igual, antes de cada actualización
importante exportá la base desde phpMyAdmin y descargá `public_html/uploads/`: son lo único que no está en este repositorio.

## Seguridad

- `api/config.php` tiene contraseñas: nunca se sube a git.
- Todo lo que escriben los usuarios se limpia en el servidor (HTMLPurifier) y otra vez al mostrarlo (DOMPurify).
- Las sesiones usan una cookie que JavaScript no puede leer, con token CSRF y límite de intentos de login.
- Las imágenes subidas se validan y se vuelven a codificar como WebP (sin metadatos como la ubicación GPS).
