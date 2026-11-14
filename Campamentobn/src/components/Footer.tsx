import React from 'react';
import { CAMPAMENTO_CONFIG } from '../data/campamentoData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-pbc-deep border-t border-pbc/20 text-gray-400 py-12 md:py-14">
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 md:px-8 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4">
            {/* Logo Oficial en Alta Resolución */}
            <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
              <img 
                src="/Campamentobn/media/logo-oficial.webp" 
                alt="Logo Protagonistas del Bien Común 2027" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_16px_rgba(100,213,171,0.5)]"
              />
            </div>

            <div>
              <h3 className="font-coolvetica text-lg md:text-xl text-white uppercase tracking-wider">
                Protagonistas del BIEN COMÚN
              </h3>
              <p className="text-xs md:text-sm font-sans text-gray-400 max-w-xs md:max-w-sm mx-auto md:mx-0 text-pretty mt-1">
                Campamento Nacional de Milicianos Universitarios. FASTA Argentina · Mendoza, {CAMPAMENTO_CONFIG.fechas}.
              </p>
              <span className="inline-block font-mono text-[10px] text-pbc font-bold uppercase tracking-widest mt-2">
                «{CAMPAMENTO_CONFIG.lema.toUpperCase()}»
              </span>
            </div>
          </div>

          {/* Navegación rápida en PC */}
          <div className="hidden md:flex flex-col gap-2 font-mono text-[11px] uppercase tracking-wider text-gray-400">
            <span className="font-coolvetica text-xs text-white uppercase mb-0.5">Secciones</span>
            <a href="#interpelacion" className="hover:text-pbc transition-colors">La Interpelación</a>
            <a href="#que-vas-a-vivir" className="hover:text-pbc transition-colors">Qué vas a vivir</a>
            <a href="#experiencia-mendoza" className="hover:text-pbc transition-colors">Experiencia Mendoza</a>
            <a href="#testimonios" className="hover:text-pbc transition-colors">Testimonios</a>
            <a href="#logistica-faq" className="hover:text-pbc transition-colors">Logística & FAQs</a>
          </div>

          {/* Contacto Guardia Mendoza */}
          <div className="flex flex-col items-center md:items-end gap-1 font-mono text-[11px] md:text-xs text-gray-400">
            <span className="font-coolvetica text-xs md:text-sm text-white uppercase mb-0.5">
              Guardia Mendoza
            </span>
            <a href={`tel:${CAMPAMENTO_CONFIG.contactoWhatsApp}`} className="hover:text-pbc transition-colors">
              {CAMPAMENTO_CONFIG.contactoWhatsApp}
            </a>
            <a href={`mailto:${CAMPAMENTO_CONFIG.contactoEmail}`} className="text-pbc hover:underline">
              {CAMPAMENTO_CONFIG.contactoEmail}
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-1 text-[10px] md:text-[11px] font-mono text-gray-500">
          <p>© 2027 FASTA · Movimiento de Milicianos.</p>
          <p className="text-pbc">Mendoza · {CAMPAMENTO_CONFIG.fechas}</p>
        </div>
      </div>
    </footer>
  );
};
