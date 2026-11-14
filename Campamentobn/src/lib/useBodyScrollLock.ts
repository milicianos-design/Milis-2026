import { useEffect } from 'react';

/**
 * Mientras `active` sea true, la página de fondo no se puede scrollear (para ventanas de video o
 * galerías abiertas encima). Al cerrarse, devuelve el scroll como estaba.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    const previous = { html: html.style.overflow, body: document.body.style.overflow };
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = previous.html;
      document.body.style.overflow = previous.body;
    };
  }, [active]);
}
