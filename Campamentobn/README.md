# Protagonistas del Bien Común 2027

Sitio del campamento nacional de Milicianos universitarios (Mendoza, 15 al 22 de enero de 2027).
Publicado en https://agrupacionjuvenil.com/Campamentobn/ (Hostinger).

Es un sitio estático: HTML, CSS y JS en `index.html`, sin compilación.

- `index.html`: toda la página.
- `assets/v2/`: fotos (WebP), logos, imagen para compartir (`og.jpg`) e ícono.
- `assets/v2/video/`: testimonios, rafting, audio del fogón y guitarra de fondo.
- `favicon.png`

Para publicar un cambio: editar, hacer commit y push a `main`. GitHub Actions («Publicar en Hostinger») compila el repo y copia esta carpeta, con su `.htaccess` (la política de seguridad CSP de la página), a `public_html/Campamentobn/`. Las rutas del HTML llevan el prefijo `/Campamentobn/`.

Pendiente: tipografía Coolvetica (Adobe Fonts). Falta el ID del kit: agregar en el `<head>` el `<link rel="stylesheet" href="https://use.typekit.net/ID.css">`, sumar `agrupacionjuvenil.com` al kit y permitir `use.typekit.net` (y `p.typekit.net`) en la CSP del `.htaccess` de esta carpeta.
