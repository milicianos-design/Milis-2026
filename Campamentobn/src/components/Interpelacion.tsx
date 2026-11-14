import React, { useState, useEffect, useRef } from 'react';
import { Radio, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { CAMPAMENTO_CONFIG } from '../data/campamentoData';

export const Interpelacion: React.FC = () => {
  const [isRevealed, setIsRevealed] = useState(false);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const checkScrollPosition = () => {
      if (!cardsContainerRef.current) return;
      const rect = cardsContainerRef.current.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      // Al bajar con el scroll: cuando las tarjetas entran al 85% de la pantalla, descienden y se muestran
      // Al subir con el scroll: cuando las tarjetas bajan del 92% de la pantalla, ascienden y se guardan
      if (rect.top <= vh * 0.85 && rect.bottom >= 60) {
        setIsRevealed(true);
      } else if (rect.top > vh * 0.92) {
        setIsRevealed(false);
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkScrollPosition);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Chequeo inicial
    checkScrollPosition();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section 
      className="pt-9 pb-12 md:py-16 bg-pbc-deep bg-grain text-white relative overflow-hidden border-b border-pbc/15" 
      id="interpelacion"
    >
      {/* Motion Watermarks */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-full max-w-7xl flex justify-between pointer-events-none select-none opacity-10">
        <span className="font-coolvetica text-[90px] md:text-[140px] lg:text-[180px] text-pbc tracking-tighter motion-watermark">
          {CAMPAMENTO_CONFIG.fechasRango}
        </span>
        <span className="font-coolvetica text-[90px] md:text-[140px] lg:text-[180px] text-pbc tracking-tighter motion-watermark">
          {CAMPAMENTO_CONFIG.provincia.toUpperCase()}
        </span>
      </div>

      <div className="relative z-10 max-w-md md:max-w-4xl lg:max-w-5xl mx-auto px-4 md:px-8">
        {/* Encabezado alineado en 2 líneas exactas título + 2 líneas subtítulo */}
        <div className="text-center mb-6 md:mb-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pbc-card border border-pbc/30 text-pbc font-mono text-[10px] md:text-xs uppercase tracking-widest font-bold mb-2 md:mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-pbc animate-pulse"></span>
            <span>BLOQUE 1: LA INTERPELACIÓN</span>
          </div>
          
          <div className="inline-flex flex-col items-center max-w-full">
            <h2 className="font-coolvetica text-[22px] min-[360px]:text-[25px] sm:text-[29px] md:text-[38px] lg:text-[44px] tracking-tight text-white uppercase leading-[1.04] mb-2 md:mb-3">
              <span className="block whitespace-nowrap">¿QUÉ PASA EN NUESTRA PATRIA</span>
              <span className="block text-pbc whitespace-nowrap mt-0.5">Y EN NUESTRA GENERACIÓN?</span>
            </h2>
            
            <p className="w-full font-sans text-gray-300 text-[11px] min-[360px]:text-xs sm:text-sm md:text-base leading-snug">
              <span className="block whitespace-nowrap">Un llamado urgente a discernir el tiempo histórico</span>
              <span className="block whitespace-nowrap">uniendo rigor profesional, vida en comunidad y fe.</span>
            </p>
          </div>
        </div>

        {/* Las 2 Tarjetas Oficiales: apiladas en mobile, lado a lado en PC */}
        <div ref={cardsContainerRef} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 items-stretch">
          
          {/* Tarjeta 1: La trampa de Babel (Desciende primero) */}
          <div 
            style={{
              transform: isRevealed ? 'translateY(0px) scale(1)' : 'translateY(-65px) scale(0.93)',
              opacity: isRevealed ? 1 : 0,
              transition: isRevealed 
                ? 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0ms, opacity 0.5s ease-out 0ms' 
                : 'transform 0.4s ease-in 0ms, opacity 0.3s ease-in 0ms',
              willChange: 'transform, opacity'
            }}
            className="p-5 rounded-2xl bg-[#141212] border-2 border-red-500/40 shadow-[0_8px_30px_rgba(239,68,68,0.2)] relative flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 font-mono text-[10px] font-black uppercase tracking-wider border border-red-500/30">
                  LA ILUSIÓN ESTÉRIL
                </span>
                <Radio className="w-5 h-5 text-red-400 animate-pulse" />
              </div>

              <div>
                <h3 className="font-coolvetica text-2xl uppercase text-white mb-0.5 text-balance">
                  La trampa de Babel
                </h3>
                <p className="font-sans text-xs text-gray-400 text-pretty">
                  Hiperindividualismo y fragmentación contemporánea.
                </p>
              </div>

              <ul className="space-y-2.5 pt-1">
                {[
                  "Redes que aíslan y cansan",
                  "Sociedad del rendimiento vacío",
                  "Queja pasiva de redes sociales"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-red-400" />
                    </div>
                    <span className="font-sans text-xs sm:text-sm text-gray-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-2.5 border-t border-white/10 font-mono text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span>Diagnóstico: Indiferencia y parálisis</span>
            </div>
          </div>

          {/* Tarjeta 2: La respuesta miliciana / Nehemías (Desciende en cascada tras la primera) */}
          <div 
            style={{
              transform: isRevealed ? 'translateY(0px) scale(1)' : 'translateY(-95px) scale(0.92)',
              opacity: isRevealed ? 1 : 0,
              transition: isRevealed 
                ? 'transform 0.72s cubic-bezier(0.16, 1, 0.3, 1) 160ms, opacity 0.55s ease-out 160ms' 
                : 'transform 0.4s ease-in 0ms, opacity 0.3s ease-in 0ms',
              willChange: 'transform, opacity'
            }}
            className="p-5 rounded-2xl bg-pbc-card border-2 border-pbc/60 shadow-[0_0_35px_rgba(100,213,171,0.25)] relative flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <span className="px-2.5 py-1 rounded bg-pbc text-pbc-deep font-mono text-[10px] font-black uppercase tracking-wider">
                  LA RESPUESTA MILICIANA
                </span>
                <ShieldAlert className="w-5 h-5 text-pbc" />
              </div>

              <div>
                <h3 className="font-coolvetica text-2xl uppercase text-white mb-0.5 text-balance">
                  El camino de Nehemías
                </h3>
                <p className="font-sans text-xs text-pbc font-medium text-pretty">
                  Reedificar los muros caídos hombro a hombro.
                </p>
              </div>

              <ul className="space-y-2.5 pt-1">
                {[
                  "Diagnóstico sin maquillaje",
                  "Trabajo profesional en equipo",
                  "Ensuciarse las manos en la historia"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-pbc/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-pbc" />
                    </div>
                    <span className="font-sans text-xs sm:text-sm text-gray-200 font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-2.5 border-t border-white/10 font-mono text-[10px] text-pbc uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-pbc animate-ping"></span>
              <span>Respuesta: Reconstrucción & Bien Común</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
