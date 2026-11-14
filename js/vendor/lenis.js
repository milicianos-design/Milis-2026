// Scroll suave (solo en las páginas que lo cargan). main.js lo usa como global (`typeof Lenis`).
// Este módulo tiene que cargarse antes que main.js.
import Lenis from 'lenis';

window.Lenis = Lenis;
