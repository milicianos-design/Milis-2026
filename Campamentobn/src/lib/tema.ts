import { useCallback, useEffect, useState } from 'react';

export type Tema = 'claro' | 'oscuro';

/** Misma clave que usa public/Campamentobn/tema.js al cargar la página. */
const CLAVE = 'campamento-tema';

const temaActual = (): Tema => (document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro');

const elegidoPorLaPersona = (): boolean => {
  try {
    return localStorage.getItem(CLAVE) !== null;
  } catch {
    return false;
  }
};

/**
 * Modo claro / oscuro. El modo inicial ya lo puso tema.js (antes de pintar); acá solo se lee y se cambia.
 * Mientras la persona no toque el botón, la página sigue los cambios de modo de su celular o compu.
 */
export function useTema(): { tema: Tema; alternar: () => void } {
  const [tema, setTema] = useState<Tema>(temaActual);

  useEffect(() => {
    const sistema = window.matchMedia('(prefers-color-scheme: dark)');
    const alCambiarSistema = (e: MediaQueryListEvent) => {
      if (elegidoPorLaPersona()) return;
      document.documentElement.classList.toggle('dark', e.matches);
      setTema(e.matches ? 'oscuro' : 'claro');
    };
    sistema.addEventListener('change', alCambiarSistema);
    return () => sistema.removeEventListener('change', alCambiarSistema);
  }, []);

  const alternar = useCallback(() => {
    const nuevo: Tema = temaActual() === 'oscuro' ? 'claro' : 'oscuro';
    document.documentElement.classList.toggle('dark', nuevo === 'oscuro');
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      // Sin localStorage el cambio vale solo hasta recargar.
    }
    setTema(nuevo);
  }, []);

  return { tema, alternar };
}
