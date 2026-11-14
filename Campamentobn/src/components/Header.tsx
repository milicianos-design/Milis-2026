import React from 'react';
import { Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#0A0E0D]/95 backdrop-blur-md border-b border-[#64D5AB]/20 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
        
        {/* Logo Oficial Compartido por el Usuario */}
        <a 
          href="#hero" 
          className="flex items-center gap-2 group active:scale-95 transition-transform duration-150 py-1 min-w-0"
        >
          <img 
            src="/Campamentobn/media/logo-oficial.webp" 
            alt="Logo Oficial Protagonistas del Bien Común" 
            className="h-11 md:h-12 w-auto max-w-[170px] md:max-w-[200px] object-contain drop-shadow-[0_0_12px_rgba(100,213,171,0.35)]"
          />
          <span className="text-[10px] md:text-[11px] font-mono px-1.5 py-0.5 rounded bg-pbc/20 text-pbc font-extrabold border border-pbc/40 self-center">
            2027
          </span>
        </a>

        {/* Navegación Desktop */}
        <nav aria-label="Secciones principales" className="hidden lg:flex items-center gap-7 font-mono text-[11px] uppercase tracking-widest text-gray-300">
          <a href="#interpelacion" className="hover:text-pbc transition-colors py-1">La Interpelación</a>
          <a href="#que-vas-a-vivir" className="hover:text-pbc transition-colors py-1">Formación</a>
          <a href="#experiencia-mendoza" className="hover:text-pbc transition-colors py-1">Mendoza</a>
          <a href="#testimonios" className="hover:text-pbc transition-colors py-1">Testimonios</a>
          <a href="#logistica-faq" className="hover:text-pbc transition-colors py-1">Logística</a>
        </nav>

        {/* Botón CTA Header */}
        <div className="flex items-center">
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
