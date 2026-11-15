import React from 'react';
import { Moon, Sun, Zap } from 'lucide-react';
import type { Tema } from '../lib/tema';

interface HeaderProps {
  tema: Tema;
  onAlternarTema: () => void;
}

export const Header: React.FC<HeaderProps> = ({ tema, onAlternarTema }) => {
  const oscuro = tema === 'oscuro';

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-fondo/95 backdrop-blur-md border-b border-pbc/20 transition-all duration-300 shadow-[0_4px_20px_rgba(10,14,13,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">

        {/* Logo Oficial Compartido por el Usuario (en modo claro se oscurece para que se lea sobre blanco) */}
        <a
          href="#hero"
          className="flex items-center gap-2 group active:scale-95 transition-transform duration-150 py-1 min-w-0"
        >
          <img
            src="/Campamentobn/media/logo-oficial.webp"
            alt="Logo Oficial Protagonistas del Bien Común"
            className="h-11 md:h-12 w-auto max-w-[170px] md:max-w-[200px] object-contain brightness-50 dark:brightness-100 dark:drop-shadow-[0_0_12px_rgba(100,213,171,0.35)]"
          />
          <span className="text-[10px] md:text-[11px] font-mono px-1.5 py-0.5 rounded bg-pbc/20 text-acento font-extrabold border border-pbc/40 self-center">
            2027
          </span>
        </a>

        {/* Navegación Desktop */}
        <nav aria-label="Secciones principales" className="hidden lg:flex items-center gap-7 font-mono text-[11px] uppercase tracking-widest text-tinta-3">
          <a href="#interpelacion" className="hover:text-acento transition-colors py-1">La Interpelación</a>
          <a href="#que-vas-a-vivir" className="hover:text-acento transition-colors py-1">Formación</a>
          <a href="#experiencia-mendoza" className="hover:text-acento transition-colors py-1">Mendoza</a>
          <a href="#testimonios" className="hover:text-acento transition-colors py-1">Testimonios</a>
          <a href="#logistica-faq" className="hover:text-acento transition-colors py-1">Logística</a>
        </nav>

        <div className="flex items-center gap-2">
          {/* Modo claro / oscuro */}
          <button
            type="button"
            onClick={onAlternarTema}
            aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={oscuro ? 'Modo claro' : 'Modo oscuro'}
            className="w-[42px] h-[42px] md:w-[44px] md:h-[44px] rounded-xl border border-pbc/40 bg-superficie text-acento flex items-center justify-center hover:bg-pbc/15 active:scale-90 transition-all cursor-pointer"
          >
            {oscuro ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          {/* Botón CTA Header */}
          <a
            href="#llamado-final"
            className="min-h-[42px] md:min-h-[44px] px-4 md:px-6 rounded-xl bg-pbc text-pbc-deep font-sans font-black text-[12px] md:text-[13px] uppercase tracking-wider transition-all duration-200 shadow-[0_0_18px_rgba(100,213,171,0.45)] active:scale-95 flex items-center gap-1.5 hover:bg-pbc-light cursor-pointer"
          >
            <span>SUMARME</span>
            <Zap className="w-3.5 h-3.5 fill-current" />
          </a>
        </div>

      </div>
    </header>
  );
};
