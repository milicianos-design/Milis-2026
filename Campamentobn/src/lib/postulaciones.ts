// Envío de postulaciones a la API propia del sitio (api/ en PHP), que las guarda en la base de datos.
// Reemplaza al webhook de Google Sheets: ahora el éxito se muestra solo si la postulación quedó guardada.

export interface Postulacion {
  nombre: string;
  whatsapp: string;
  ciudad: string;
  carrera: string;
  motivacion: string;
  /** Campo trampa para bots: tiene que llegar vacío. */
  website: string;
}

/** Envía la postulación y devuelve el mensaje de confirmación del servidor. */
export async function enviarPostulacion(datos: Postulacion): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };

  // Si la persona tiene sesión iniciada en el sitio, la API exige su token CSRF.
  const csrf = await fetch('/api/auth/me', { credentials: 'same-origin' })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => (typeof data?.csrf_token === 'string' ? data.csrf_token : null))
    .catch(() => null);
  if (csrf) headers['X-CSRF-Token'] = csrf;

  let res: Response;
  try {
    res = await fetch('/api/campamento/postulaciones', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify(datos),
    });
  } catch {
    throw new Error('No hay conexión con el servidor. Revisá tu internet y probá de nuevo.');
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'No pudimos registrar tu postulación. Probá de nuevo en unos minutos.');
  }
  return typeof body.message === 'string' ? body.message : '¡Postulación registrada!';
}
