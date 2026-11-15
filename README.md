# Milis 2026

Plataforma digital de los Milicianos: sitio institucional y de formación (Bien Común, Promesas,
Pier Giorgio Frassati, Santa Catalina), con un foro y las Notas de Vanguardia para miembros registrados.

## Estado actual (noviembre 2026)

- **Publicado en Hostinger:** https://agrupacionjuvenil.com (páginas, API y base de datos).
- **El Campamento Nacional todavía no tiene enlaces:** https://agrupacionjuvenil.com/Campamentobn/ está
  publicada y funciona, pero **ninguna parte de agrupacionjuvenil.com lleva ahí** (ni el menú ni la portada).
  Por ahora solo se llega con el link directo, así que sus visitas vienen de links compartidos.
- **Cada cambio que se sube a `main` se publica solo** en agrupacionjuvenil.com (ver *Actualizaciones*).
  Vercel ya no está conectado a este repositorio.
- **Falta apagar lo viejo:** el proyecto anterior en Vercel + Supabase y la versión anterior del campamento
  (también en Vercel). Las postulaciones que llegaron antes del cambio están en una planilla de Google, no en la base.

## Cómo trabajamos

- **`main` es lo que está publicado.** Todo lo que llega a `main` se publica solo en agrupacionjuvenil.com,
  así que nadie trabaja ni sube cambios directo ahí.
- **`desarrollo` es la rama de trabajo.** Los cambios se hacen y se suben ahí; subirla a GitHub no publica nada.
- **Todo se prueba primero en local** con `npm run dev` (y `npm test` si se tocó la API).
- **Publicar es pasar `desarrollo` a `main`**, cuando está probado y lo acordamos: en GitHub, *Pull requests*
  → *New pull request* → `main` ← `desarrollo` → *Merge*. En un minuto queda publicado (se sigue en la pestaña *Actions*).
- Para algo grande, o si dos personas trabajan a la vez, conviene una rama propia que sale de `desarrollo`
  (por ejemplo `reportes-panel`) y vuelve a `desarrollo` cuando está lista.

## Cómo está armado

| Parte | Tecnología | Dónde está |
|---|---|---|
| Páginas | HTML + Tailwind CSS + JavaScript | `*.html`, `js/`, `src/input.css` |
| Campamento Nacional (`/Campamentobn/`) | React + TypeScript + Tailwind (propio) | `Campamentobn/` |
| Compilación del frontend | Vite (Node) — solo en la compu, no en el servidor | `vite.config.js` |
| API (cuentas, foro, notas, imágenes) | PHP 8.2+ sin framework | `api/` |
| Base de datos | MySQL / MariaDB | `api/database/migrations/` |
| Hosting | Hostinger (archivos estáticos + PHP) | — |

No depende de servicios externos: fuentes, íconos, librerías e imágenes se sirven desde el propio sitio.
Lo único externo son los videos de YouTube que se incrustan en posts y notas, y Google Analytics para las
estadísticas de visitas (si no carga, el sitio funciona igual).

```
├── *.html                 páginas del sitio
├── Campamentobn/          landing del Campamento Nacional (React); sus fotos y videos en public/Campamentobn/media
├── admin/                 panel de administración (/admin); su lógica en js/admin.js
├── js/main.js             lógica de las páginas
├── js/api.js              cliente de la API (login, posts, notas…)
├── js/security.js         limpieza de lo que escriben los usuarios antes de mostrarlo
├── js/analytics.ts        estadísticas de visitas (Google Analytics), compartido con el campamento
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
- Los permisos de las cuentas se manejan desde el panel `/admin` (ver *Panel de administración*). Para crear
  el primer admin, o si no hay ninguno: `php api/bin/set-role.php email@ejemplo.com admin`.

### Otros comandos

| Comando | Para qué |
|---|---|
| `npm test` | Pruebas de la API (necesita `npm run db` corriendo) |
| `npm run build` | Compila el sitio en `dist/` (incluye la API con sus dependencias de producción) |
| `npm run package` | Compila y arma `build/milis-hostinger.zip` para subir |
| `npm run deploy` | Compila y publica en Hostinger por SSH (datos en `.env.local`) |
| `npm run icons` | Regenera la fuente de íconos después de agregar o quitar un ícono de Material Symbols |
| `npm run typecheck` | Revisa los tipos de TypeScript de la página del campamento |

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
    los nameservers o la IP). `public/.htaccess` ya envía `Strict-Transport-Security` (HSTS): si cambiás de dominio o hosting, asegurate de tener SSL andando antes de mudar el sitio.
11. **Apagar lo viejo:** con todo funcionando en Hostinger, eliminá el proyecto de Vercel y el de Supabase.

### Actualizaciones

**Automática (lo normal):** cada vez que se sube algo a la rama `main`, GitHub compila el sitio y lo publica
en Hostinger (`.github/workflows/publicar.yml`). El avance y los errores se ven en la pestaña *Actions* del
repositorio; desde ahí también se puede volver a publicar a mano (*Publicar en Hostinger* → *Run workflow*).
Si la compilación falla, no se publica nada y el sitio sigue con la versión anterior.
Por eso se trabaja en `desarrollo` y se pasa a `main` solo lo que ya está probado (ver *Cómo trabajamos*).

Usa una llave SSH exclusiva de GitHub, guardada en los secretos del repositorio (*Settings* → *Secrets and
variables* → *Actions*: `DEPLOY_SSH`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`). Para revocarla, se borra esa
llave en hPanel → *Acceso SSH*.

**Desde tu compu, con SSH:** completá los datos `DEPLOY_*` en `.env.local` (ver `.env.example`) y corré
`npm run deploy`. Compila, sube el sitio, aplica migraciones nuevas y verifica que responda.
No toca `api/config.php` ni las imágenes de `uploads/`.
Cada persona que publica usa su propia llave SSH (se crea como indica `.env.example` y se agrega en hPanel →
*Acceso SSH*): no compartan llaves.

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

## Panel de administración

`https://agrupacionjuvenil.com/admin` — solo para cuentas con rol **admin** (el servidor lo controla en cada
pedido; cualquier otra cuenta ve "Sin acceso"). No aparece en buscadores ni carga Google Analytics.

- **Resumen:** totales de usuarios, posts, comentarios, notas y postulaciones, y cuántos hubo en la última semana.
- **Usuarios:** buscar, filtrar por rol o estado, y ver la última actividad de cada cuenta.
  - **Nuevo usuario:** se carga nombre, email y rol, y a la persona le llega un email para elegir su contraseña
    (el enlace vale 7 días y se puede reenviar). El admin nunca conoce la contraseña de nadie.
  - **Rol:** se cambia desde la tabla y vale al instante, sin que la persona tenga que volver a entrar.
  - **Suspender:** la persona no puede entrar más y se le cierra la sesión en el momento. Lo que publicó se
    conserva; se puede reactivar. (No hay "borrar": borraría también todos sus posts, notas y comentarios.)
  - Nadie puede cambiarse su propio rol ni suspenderse a sí mismo, así el sitio nunca queda sin admin.
- **Postulaciones:** las del Campamento Nacional, con búsqueda y botón para descargarlas en Excel.

| Rol | Puede |
|---|---|
| `miliciano` | Publicar en el foro, comentar y borrar lo suyo (es el rol de toda cuenta nueva) |
| `redactor` | Además escribir Notas de Vanguardia y moderar (borrar posts y comentarios ajenos) |
| `admin` | Además borrar notas ajenas, usar este panel y ver las postulaciones (datos personales) |

## Postulaciones al Campamento Nacional

El formulario de `/Campamentobn/` guarda cada postulación en la tabla `campamento_postulaciones`
(antes iban a una planilla de Google). Se ven en el panel (`/admin` → *Postulaciones*), o descargando
directamente `https://agrupacionjuvenil.com/api/campamento/postulaciones.csv` con una cuenta admin.

La API limita los envíos (20 por hora desde una misma conexión) y descarta los de bots con un campo trampa.

## Estadísticas de visitas (Google Analytics)

El sitio usa Google Analytics 4 para saber qué páginas se visitan, incluida `/Campamentobn/`. Todo está en `js/analytics.ts`:

- `MEASUREMENT_ID` es el ID de medición de la propiedad (`G-…`, en analytics.google.com → *Administrar* →
  *Flujos de datos*). Si está vacío, no se mide nada.
- Solo se activa en `agrupacionjuvenil.com` (`PRODUCTION_HOST`): con `npm run dev` no se carga, así las
  pruebas no ensucian las estadísticas. Si el sitio cambia de dominio, hay que actualizarlo.
- De cada dirección se envía solo la ruta y los parámetros `utm_*`. Los tokens de los emails
  (`?confirmar=`, `?nueva-clave=`) nunca llegan a Google.
- Además de las visitas, registra el evento `postulacion_campamento` cada vez que alguien completa el
  formulario del campamento. Para medir otra acción: `trackEvent('nombre_del_evento')`, importado de `js/analytics.ts`.
- Para saber de dónde llega la gente, compartí los links con `utm_source`, por ejemplo
  `https://agrupacionjuvenil.com/Campamentobn/?utm_source=instagram` o `?utm_source=whatsapp`.
- La política de seguridad (`public/.htaccess`) ya permite los dominios de Google que necesita GA4.

## Seguridad

- `api/config.php` tiene contraseñas: nunca se sube a git.
- Todo lo que escriben los usuarios se limpia en el servidor (HTMLPurifier) y otra vez al mostrarlo (DOMPurify).
- Las sesiones usan una cookie que JavaScript no puede leer, con token CSRF y límite de intentos de login.
- Las imágenes subidas se validan y se vuelven a codificar como WebP (sin metadatos como la ubicación GPS).
