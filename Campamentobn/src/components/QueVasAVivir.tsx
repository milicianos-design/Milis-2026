import React from 'react';
import { Bot, Scale, BookOpen, ArrowRight } from 'lucide-react';
import { EJES_FORMACION } from '../data/campamentoData';

export const QueVasAVivir: React.FC = () => {
  return (
    <section className="pt-10 pb-12 md:py-16 bg-pbc text-pbc-deep relative overflow-hidden border-y-2 border-pbc-deep" id="que-vas-a-vivir">
      {/* Motion Watermark Editorial */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-full max-w-7xl flex justify-between pointer-events-none select-none opacity-15">
        <span className="font-coolvetica text-[90px] md:text-[140px] lg:text-[180px] text-pbc-deep tracking-tighter motion-watermark-editorial">
          FORMACIÓN
        </span>
        <span className="font-coolvetica text-[90px] md:text-[140px] lg:text-[180px] text-pbc-deep tracking-tighter motion-watermark-editorial">
          2027
        </span>
      </div>

      <div className="relative z-10 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 md:px-8">
        {/* Cabecera del Bloque alineada en 2 líneas título + 2 líneas subtítulo */}
        <div className="text-center mb-6 md:mb-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pbc-deep text-pbc font-mono text-[10px] md:text-xs uppercase tracking-[0.18em] font-bold mb-2 md:mb-3 shadow-[2px_2px_0px_#0A0E0D]">
            <span className="w-1.5 h-1.5 rounded-full bg-pbc animate-pulse"></span>
            <span>BLOQUE 2: QUÉ VAS A VIVIR</span>
          </div>
          
          <div className="inline-flex flex-col items-center max-w-full">
            <h2 className="font-coolvetica text-[23px] min-[360px]:text-[25px] sm:text-[30px] md:text-[38px] lg:text-[44px] tracking-tight text-pbc-deep uppercase leading-[1.02] mb-2 md:mb-3 drop-shadow-sm">
              <span className="block whitespace-nowrap">UNA EXPERIENCIA INTEGRAL</span>
              <span className="block whitespace-nowrap mt-0.5">DE FORMACIÓN Y ACCIÓN</span>
            </h2>
            
            <p className="w-full font-sans text-pbc-deep/90 text-[11px] min-[360px]:text-xs sm:text-sm md:text-base leading-snug font-semibold">
              <span className="block whitespace-nowrap">Tres pilares sincronizados para transformar</span>
              <span className="block whitespace-nowrap">tu vocación universitaria en respuesta real.</span>
            </p>
          </div>
        </div>

        {/* 3 Tarjetas en Formato Editorial Dossier: 1 col mobile, 3 col PC */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch">
          {EJES_FORMACION.map((eje) => {
            const IconComponent = eje.numero === "1" ? Bot : eje.numero === "2" ? Scale : BookOpen;

            return (
              <div 
                key={eje.numero}
                className="p-4 sm:p-5 rounded-xl bg-pbc-paper editorial-border shadow-[4px_4px_0px_#0A0E0D] relative flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0A0E0D]"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-pbc-deep/15">
                    <span className="px-2.5 py-0.5 rounded bg-pbc-deep text-pbc font-mono text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                      {eje.numero === "1" && <span className="w-1.5 h-1.5 rounded-full bg-pbc animate-ping"></span>}
                      {eje.badge}
                    </span>
                    <IconComponent className="w-5 h-5 text-pbc-deep" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-[9px] text-pbc-dark uppercase tracking-[0.18em] font-extrabold">
                        {eje.ejeTag}
                      </span>
                    </div>

                    <h3 className="font-coolvetica text-lg sm:text-xl uppercase text-pbc-deep mb-1.5 leading-tight tracking-wide text-balance">
                      {eje.numero}. {eje.titulo}
                    </h3>

                    <p className="font-sans text-xs text-pbc-deep/85 leading-relaxed text-pretty">
                      {eje.descripcion}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-2 border-t-2 border-pbc-deep/10 flex items-center justify-between font-mono text-[10px] text-pbc-deep/80 uppercase tracking-wider font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-pbc-deep"></span>
                    <span>{eje.entregable}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-pbc-deep/60" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
