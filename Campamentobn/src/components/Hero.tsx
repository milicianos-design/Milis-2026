import React, { useState, useRef } from 'react';
import { Play, ArrowRight, ArrowDown } from 'lucide-react';
import { CAMPAMENTO_CONFIG, METRICAS_HERO } from '../data/campamentoData';

export const Hero: React.FC = () => {
  const [isPlayingInline, setIsPlayingInline] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startPlaying = () => {
    setIsPlayingInline(true);
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <section className="relative min-h-screen bg-fondo bg-grain overflow-hidden flex flex-col justify-center pb-12 md:pb-16 pt-20 md:pt-28" id="hero">
      {/* Motion Watermarks de fondo */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-full max-w-7xl flex justify-around pointer-events-none select-none opacity-10 animate-badge-float">
        <span className="font-coolvetica text-[90px] md:text-[150px] lg:text-[190px] text-pbc tracking-tighter motion-watermark">MDZ</span>
        <span className="font-coolvetica text-[90px] md:text-[150px] lg:text-[190px] text-pbc tracking-tighter motion-watermark">2027</span>
      </div>

      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] md:w-[540px] md:h-[540px] bg-pbc/20 rounded-full blur-[110px] md:blur-[140px] pointer-events-none transition-all duration-1000"></div>

      <div className="relative z-10 w-full max-w-md md:max-w-3xl lg:max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-4 items-center">
          
          {/* Bloque A: Badge + Título + Subtítulo */}
          <div className="lg:col-span-6 lg:col-start-1 lg:row-start-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Badge superior oficial con fechas */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-superficie border-2 border-pbc/40 text-acento font-mono text-[10.5px] md:text-xs uppercase tracking-wider mb-3 md:mb-4 shadow-[0_0_15px_rgba(100,213,171,0.25)] animate-badge-float">
              <span className="w-2 h-2 rounded-full bg-pbc animate-ping"></span>
              <span className="font-bold">{CAMPAMENTO_CONFIG.fechas.toUpperCase()} · MENDOZA</span>
            </div>

            {/* Bloque de Título + Subtítulo */}
            <div className="mb-5 lg:mb-2 inline-flex flex-col items-center lg:items-start max-w-full">
              <h1
                aria-label="PROTAGONISTAS DEL BIEN COMÚN"
                className="font-coolvetica text-[35px] min-[360px]:text-[40px] min-[400px]:text-[44px] sm:text-[51px] md:text-[56px] lg:text-[54px] xl:text-[62px] uppercase leading-[0.94] tracking-tight dark:drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
              >
                <span aria-hidden="true" className="block text-tinta whitespace-nowrap">
                  {"PROTAGONISTAS".split("").map((ch, i) => (
                    <span key={`l1-${i}`} className="hero-char-wrap">
                      <span
                        className="hero-char-blur-tilt"
                        style={{ animationDelay: `${i * 24}ms` }}
                      >
                        {ch === " " ? "\u00A0" : ch}
                      </span>
                    </span>
                  ))}
                </span>
                <span aria-hidden="true" className="block text-acento mt-1 whitespace-nowrap">
                  {"DEL BIEN COMÚN".split("").map((ch, i) => (
                    <span key={`l2-${i}`} className="hero-char-wrap">
                      <span
                        className="hero-char-blur-tilt"
                        style={{ animationDelay: `${(13 + i) * 24}ms` }}
                      >
                        {ch === " " ? "\u00A0" : ch}
                      </span>
                    </span>
                  ))}
                </span>
              </h1>

              {/* Frase más chica y alineada */}
              <p className="w-full font-sans text-[9.5px] min-[360px]:text-[10.5px] sm:text-[12px] md:text-sm text-tinta-3 tracking-[0.015em] leading-snug mt-2 font-medium whitespace-nowrap hero-subtitle-in">
                Una experiencia inolvidable para jóvenes universitarios
              </p>
            </div>
          </div>

          {/* Bloque B: Video Oficial Integrado (Derecha en PC, 2do en Mobile) */}
          <div className="lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:row-span-3 w-full mx-auto mb-6 lg:mb-0">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-superficie border-2 border-pbc/40 shadow-[0_0_45px_rgba(100,213,171,0.22)] transition-all duration-300 hover:border-pbc">
              {/* El video no arranca solo: espera a que la persona toque reproducir. preload="none": no se baja nada hasta ese momento */}
              <video
                ref={videoRef}
                src="/Campamentobn/media/video-inicial.mp4"
                poster="/Campamentobn/media/portada-video-oficial.webp"
                controls={isPlayingInline}
                playsInline
                preload="none"
                className="w-full h-full object-cover sm:object-contain bg-black"
              />

              {/* Portada Cinemática Interactiva (Desaparece al toque exacto de tocarla) */}
              {!isPlayingInline && (
                <div 
                  onClick={startPlaying}
                  className="absolute inset-0 z-20 w-full h-full group cursor-pointer"
                >
                  {/* Portada Oficial */}
                  <img 
                    src="/Campamentobn/media/portada-video-oficial.webp" 
                    alt="Video Oficial Protagonistas del Bien Común 2027 en Mendoza" 
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Overlay degradado suave */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40 pointer-events-none"></div>

                  {/* Badge Superior Izquierdo: Solo VIDEO OFICIAL (sin duración) */}
                  <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md font-mono text-[9.5px] text-pbc uppercase tracking-wider border border-pbc/40 font-bold shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      VIDEO OFICIAL
                    </span>
                  </div>

                  {/* Botón Central de Play: Desaparece al instante exacto del toque */}
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startPlaying();
                      }}
                      aria-label="Reproducir Video Oficial"
                      className="w-16 h-16 md:w-20 md:h-20 min-h-[44px] rounded-full bg-pbc text-pbc-deep flex items-center justify-center shadow-[0_0_35px_rgba(100,213,171,0.95)] transition-transform duration-75 active:scale-75 hover:scale-110 focus:outline-none hover:shadow-[0_0_45px_rgba(100,213,171,1)] cursor-pointer"
                    >
                      <Play className="w-8 h-8 md:w-9 md:h-9 ml-1 fill-current" />
                    </button>
                  </div>

                  {/* Barra Inferior */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 z-10 flex items-center justify-between pt-1.5 border-t border-white/15 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] md:text-xs pointer-events-none">
                    <span className="font-bold text-pbc font-coolvetica uppercase tracking-wide">MENDOZA 2027</span>
                    <span className="font-mono text-gray-300 text-[9.5px] md:text-[11px]">Sonido Oficial</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bloque C: Botones de Acción Primarios */}
          <div className="lg:col-span-6 lg:col-start-1 lg:row-start-3 w-full flex flex-col items-center lg:items-start gap-3 mb-6 lg:mb-0">
            <div className="w-full flex flex-col sm:flex-row gap-3">
              <a 
                href="#llamado-final"
                className="w-full sm:flex-1 min-h-[48px] md:min-h-[52px] py-3.5 px-5 rounded-xl bg-pbc text-pbc-deep font-sans font-black text-sm uppercase tracking-wider animate-cta-pulse active:scale-95 flex items-center justify-center gap-2 transition-all duration-200 hover:bg-pbc-light group"
              >
                <span>¡QUIERO SUMARME!</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>

              <a 
                href="#que-vas-a-vivir"
                className="w-full sm:flex-1 min-h-[46px] md:min-h-[52px] py-3 px-5 rounded-xl bg-tarjeta text-tinta-2 border border-pbc/40 font-sans font-semibold text-xs md:text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 hover:bg-pbc/15 hover:border-pbc transition-all duration-200"
              >
                <span>Ver cómo es el campamento</span>
                <ArrowDown className="w-3.5 h-3.5 text-acento animate-bounce" />
              </a>
            </div>

            <div className="inline-flex items-center justify-center lg:justify-start gap-1.5 text-[11px] font-mono text-tinta-4 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pbc animate-pulse"></span>
              <span>Cupos limitados por delegación y carrera</span>
            </div>
          </div>

          {/* Bloque D: Párrafo descriptivo institucional */}
          <div className="lg:col-span-6 lg:col-start-1 lg:row-start-2 text-tinta-3 font-sans text-xs sm:text-sm md:text-[15px] leading-relaxed text-center lg:text-left mb-6 lg:mb-2 text-pretty max-w-sm md:max-w-lg mx-auto lg:mx-0 space-y-2">
            <p>
              Un campamento de formación, actividades recreativas y encuentro con Jesús con más de 250 jóvenes universitarios de todo el país.
            </p>
            <p className="text-acento font-medium">
              7 días para profundizar en tu vocación repensando la Patria a la luz de la DSI.
            </p>
          </div>
        </div>

        {/* Métricas con glow de contorno animado en loop (4 columnas en desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4 w-full mt-2 lg:mt-12">
          {METRICAS_HERO.map((m, idx) => (
            <div 
              key={idx}
              className="metric-card-glow p-3 md:p-5 rounded-xl bg-tarjeta border border-pbc/30 text-center transition-all duration-300 hover:bg-pbc-soft dark:hover:bg-[#1a2622] hover:-translate-y-0.5"
            >
              <span className={`block font-coolvetica text-2xl md:text-3xl lg:text-4xl ${m.color}`}>{m.valor}</span>
              <span className="font-sans text-[10px] md:text-xs uppercase font-bold text-tinta-4 tracking-wider block mt-0.5 md:mt-1">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
