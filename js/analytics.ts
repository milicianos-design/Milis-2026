/**
 * Google Analytics 4: cuenta las visitas de cada página (incluida /Campamentobn/) para saber qué se usa.
 *
 * - Solo se activa en el sitio publicado: en `npm run dev`, en pruebas o en otra dirección no carga nada.
 * - Nunca le manda a Google los tokens de los enlaces de email (?confirmar=…, ?nueva-clave=…): de cada
 *   dirección se envía solo la ruta y los parámetros utm_* (los que se usan para medir campañas).
 * - Si Google no responde o alguien lo bloquea, el sitio funciona igual.
 */

// ID de medición de GA4 ("G-…"): analytics.google.com → Administrar → Flujos de datos → el flujo web.
// Vacío = desactivado.
const MEASUREMENT_ID: string = 'G-WSVFMFHD45';
const PRODUCTION_HOST = 'agrupacionjuvenil.com';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const enabled = MEASUREMENT_ID !== '' && window.location.hostname === PRODUCTION_HOST;

/** La dirección sin datos privados: origen + ruta + solo los parámetros utm_*. */
function withoutPrivateParams(href: string): string {
  try {
    const url = new URL(href);
    const kept = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (key.startsWith('utm_')) kept.append(key, value);
    });
    const query = kept.toString();
    return url.origin + url.pathname + (query ? `?${query}` : '');
  } catch {
    return '';
  }
}

if (enabled) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js espera el objeto `arguments` tal cual, no un array.
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    page_location: withoutPrivateParams(window.location.href),
    page_referrer: document.referrer ? withoutPrivateParams(document.referrer) : '',
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.append(script);
}

/** Registra una acción puntual (por ejemplo, una postulación enviada). No hace nada si GA está desactivado. */
export function trackEvent(name: string, params: Record<string, string | number> = {}): void {
  if (enabled) window.gtag('event', name, params);
}
