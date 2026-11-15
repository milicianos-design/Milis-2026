/** @type {import('tailwindcss').Config} */
export default {
  // Rutas relativas a este archivo (no a la raíz del proyecto).
  content: {
    relative: true,
    files: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pbc: {
          DEFAULT: '#64D5AB',
          light: '#89E2C1',
          soft: '#E6F8F1',
          dark: '#3AA37C',
          deep: '#0A0E0D',
          carbon: '#121917',
          card: '#17211E',
          paper: '#F2F7F5',
          muted: '#8A9993'
        },
        // Colores que cambian con el modo claro / oscuro. Los valores de cada modo están en
        // src/index.css (:root = claro, .dark = oscuro). En oscuro son los mismos colores de siempre.
        fondo: {
          DEFAULT: 'rgb(var(--c-fondo) / <alpha-value>)',     // fondo de las secciones
          alt: 'rgb(var(--c-fondo-alt) / <alpha-value>)',     // fondo de Experiencia Mendoza
        },
        superficie: 'rgb(var(--c-superficie) / <alpha-value>)', // insignias y marcos sobre el fondo
        hundido: 'rgb(var(--c-hundido) / <alpha-value>)',       // campos del formulario, barras
        tarjeta: 'rgb(var(--c-tarjeta) / <alpha-value>)',
        tinta: {
          DEFAULT: 'rgb(var(--c-tinta) / <alpha-value>)',     // títulos (antes text-white)
          2: 'rgb(var(--c-tinta-2) / <alpha-value>)',         // antes gray-200
          3: 'rgb(var(--c-tinta-3) / <alpha-value>)',         // antes gray-300
          4: 'rgb(var(--c-tinta-4) / <alpha-value>)',         // antes gray-400
          5: 'rgb(var(--c-tinta-5) / <alpha-value>)',         // antes gray-500
        },
        linea: 'rgb(var(--c-linea) / <alpha-value>)',           // bordes (antes border-white/…)
        acento: 'rgb(var(--c-acento) / <alpha-value>)',         // texto verde (en claro, verde oscuro legible)
        ambar: 'rgb(var(--c-ambar) / <alpha-value>)',           // texto ámbar de la Peña
      },
      fontFamily: {
        brand: ['Coolvetica', 'Arial Black', 'sans-serif'],
        coolvetica: ['Coolvetica', 'Arial Black', 'sans-serif'],
        sans: ['Raleway', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'glow-pbc': '0 0 35px -8px rgba(100, 213, 171, 0.45)',
        'glow-card': '0 8px 30px -10px rgba(100, 213, 171, 0.25)',
        'editorial': '5px 5px 0px #0A0E0D',
        'editorial-hover': '7px 7px 0px #0A0E0D',
        'editorial-sm': '3px 3px 0px #0A0E0D',
        'editorial-lg': '6px 6px 0px #0A0E0D'
      }
    },
  },
  plugins: [],
}
