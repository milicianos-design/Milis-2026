import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../lib/useBodyScrollLock';
import { Waves, Flame, Landmark, ArrowRight, ChevronLeft, ChevronRight, Camera, Maximize2, X, Play, MapPin, ExternalLink, Instagram } from 'lucide-react';
import { EXPERIENCIAS_MENDOZA, FOTOS_PENA, FOTOS_ACCION } from '../data/campamentoData';

export const ExperienciaMendoza: React.FC = () => {
  // Estado para el carrusel de fotos de la Peña
  const [activePenaIndex, setActivePenaIndex] = useState(0);

  // Estado para el carrusel de fotos de Acción en Mendoza
  const [activeAccionIndex, setActiveAccionIndex] = useState(0);

  // Lightbox activo ('pena' | 'accion' | null)
  const [lightboxGallery, setLightboxGallery] = useState<'pena' | 'accion' | null>(null);
  // Con la galería abierta, la página de fondo no se mueve.
  useBodyScrollLock(lightboxGallery !== null);

  // Estado para el reproductor de video de Rafting Betancourt
  const [raftingPlaying, setRaftingPlaying] = useState(false);
  const raftingVideoRef = useRef<HTMLVideoElement | null>(null);

  // Manejo de gestos táctiles (swipe)
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const prevPenaSlide = () => {
    setActivePenaIndex((prev) => (prev === 0 ? FOTOS_PENA.length - 1 : prev - 1));
  };

  const nextPenaSlide = () => {
    setActivePenaIndex((prev) => (prev === FOTOS_PENA.length - 1 ? 0 : prev + 1));
  };

  const prevAccionSlide = () => {
    setActiveAccionIndex((prev) => (prev === 0 ? FOTOS_ACCION.length - 1 : prev - 1));
  };

  const nextAccionSlide = () => {
    setActiveAccionIndex((prev) => (prev === FOTOS_ACCION.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEndPena = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 45) {
        nextPenaSlide();
      } else if (diff < -45) {
        prevPenaSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleTouchEndAccion = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 45) {
        nextAccionSlide();
      } else if (diff < -45) {
        prevAccionSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Soporte de navegación por teclado en Lightbox
  useEffect(() => {
    if (!lightboxGallery) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxGallery(null);
      if (e.key === 'ArrowRight') {
        if (lightboxGallery === 'pena') nextPenaSlide();
        else nextAccionSlide();
      }
      if (e.key === 'ArrowLeft') {
        if (lightboxGallery === 'pena') prevPenaSlide();
        else prevAccionSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxGallery]);

  return (
    <section className="pt-10 pb-12 md:py-16 bg-fondo-alt text-tinta relative overflow-hidden border-t-2 border-b-2 border-pbc/20 dark:border-pbc-deep/80" id="experiencia-mendoza">
      {/* Imagen de fondo en alta resolución de los Andes con mezcla atmosférica */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src="/Campamentobn/media/mendoza-bg.webp" 
          alt="Cordillera de los Andes Mendoza al anochecer" 
          className="w-full h-full object-cover object-center opacity-45 filter contrast-125 brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-fondo-alt/90 via-fondo-alt/70 to-fondo-alt/95"></div>
        <div className="absolute inset-0 bg-grain opacity-60"></div>
      </div>

      {/* Motion Watermarks */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl flex justify-between pointer-events-none select-none opacity-10 z-0">
        <span className="font-coolvetica text-[110px] md:text-[180px] text-[#e0a96d] tracking-tighter motion-watermark">
          ANDES
        </span>
        <span className="font-coolvetica text-[110px] md:text-[180px] text-[#e0a96d] tracking-tighter motion-watermark">
          MÍSTICA
        </span>
      </div>

      <div className="relative z-10 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 md:px-8">
        {/* Cabecera del Bloque en 2 líneas exactas título + 2 líneas exactas subtítulo */}
        <div className="text-center mb-6 md:mb-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tarjeta/90 dark:bg-[#1b2522]/90 backdrop-blur-md border border-[#e0a96d]/40 text-ambar font-mono text-[9px] md:text-xs uppercase tracking-[0.16em] font-bold mb-2 md:mb-3 shadow-[0_0_15px_rgba(224,169,109,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f39c12] animate-pulse"></span>
            <span>BLOQUE 3: EXPERIENCIA MENDOZA</span>
          </div>
          
          <div className="inline-flex flex-col items-center max-w-full">
            <h2 className="font-coolvetica text-[23px] min-[360px]:text-[25px] sm:text-[30px] md:text-[38px] lg:text-[44px] tracking-tight uppercase leading-[1.04] mb-2 md:mb-3 drop-shadow-lg">
              <span className="block text-tinta whitespace-nowrap">PARA CONSTRUIR LA PATRIA</span>
              <span className="block text-acento whitespace-nowrap mt-0.5">LO HACEMOS EN COMUNIDAD</span>
            </h2>
            
            <p className="w-full font-sans text-[11px] min-[360px]:text-xs sm:text-sm md:text-base leading-snug text-tinta-3">
              <span className="block whitespace-nowrap">El campamento trasciende lo formativo:</span>
              <span className="block text-tinta-2 font-medium whitespace-nowrap">cordillera, amistad y misión en las calles.</span>
            </p>
          </div>
        </div>

        {/* Galería de Experiencias: 1 col mobile, 3 col PC */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
          {EXPERIENCIAS_MENDOZA.map((item) => {
            const isFogon = item.id === 'fogon';
            const isRafting = item.id === 'rafting';
            const isMision = item.id === 'mision';

            return (
              <div 
                key={item.id}
                className={`group bg-tarjeta/90 dark:bg-[#151e1b]/90 backdrop-blur-md rounded-2xl overflow-hidden border ${
                  isFogon 
                    ? 'border-[#e0a96d]/40 hover:border-[#e0a96d]/70 shadow-[0_0_25px_rgba(224,169,109,0.15)]' 
                    : isMision
                    ? 'border-pbc/40 hover:border-pbc/75 shadow-[0_0_25px_rgba(100,213,171,0.15)]'
                    : 'border-pbc/35 hover:border-pbc/70 shadow-[0_0_25px_rgba(100,213,171,0.15)]'
                } flex flex-col justify-between transition-all duration-300`}
              >
                {/* Visual / Carrusel según corresponda */}
                {isRafting ? (
                  /* ============================================================
                     RECUADRO ESPECIAL: RAFTING EN PARADOR BETANCOURT (FOTO + VIDEO)
                     ============================================================ */
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black select-none">
                    {!raftingPlaying ? (
                      <div 
                        className="relative w-full h-full cursor-pointer group/rafting"
                        onClick={() => setRaftingPlaying(true)}
                      >
                        <img 
                          src="/Campamentobn/media/rafting-betancourt.webp" 
                          alt="Parador Betancourt Rafting Potrerillos" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/rafting:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-tarjeta dark:from-[#151e1b] via-black/25 to-black/45"></div>

                        {/* Tag Superior Izquierda */}
                        <div className="absolute top-3 left-3 pointer-events-none z-10">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[#81f2c6] border border-pbc/40 font-mono text-[9px] font-bold tracking-wider uppercase shadow-md">
                            <Waves className="w-3 h-3 text-pbc" />
                            <span>POTRERILLOS · RÍO MENDOZA</span>
                          </span>
                        </div>

                        {/* Badge Superior Derecha */}
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-pbc font-mono text-[9px] font-bold tracking-wider uppercase border border-pbc/30 shadow-md">
                            <Play className="w-2.5 h-2.5 fill-current text-pbc" />
                            <span>REEL OFICIAL</span>
                          </span>
                        </div>

                        {/* Botón Central Play */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRaftingPlaying(true);
                            }}
                            aria-label="Reproducir video de Parador Betancourt Rafting"
                            className="w-14 h-14 rounded-full bg-pbc text-pbc-deep flex items-center justify-center shadow-[0_0_30px_rgba(100,213,171,0.95)] transition-all duration-200 group-hover/rafting:scale-110 active:scale-90 cursor-pointer"
                          >
                            <Play className="w-7 h-7 ml-0.5 fill-current" />
                          </button>
                        </div>

                        {/* Barra Inferior */}
                        <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[9.5px]">
                          <span className="font-mono text-gray-200 font-medium">Parador Betancourt Rafting</span>
                          <span className="font-mono text-pbc font-bold flex items-center gap-1">
                            <span>Ver video del parador</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Reproductor de Video Oficial en Línea */
                      <div className="relative w-full h-full bg-black flex items-center justify-center animate-fadeIn">
                        <video 
                          ref={raftingVideoRef}
                          src="/Campamentobn/media/rafting-betancourt.mp4"
                          poster="/Campamentobn/media/rafting-poster.webp"
                          controls
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover sm:object-contain bg-black"
                        />
                        <button
                          type="button"
                          onClick={() => setRaftingPlaying(false)}
                          aria-label="Cerrar reproductor de video"
                          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/20 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : isFogon ? (
                  /* ============================================================
                     RECUADRO ESPECIAL: CARRUSEL INTERACTIVO DE FOTOS DE LA PEÑA
                     ============================================================ */
                  <div 
                    className="relative aspect-[16/10] w-full overflow-hidden bg-black select-none touch-pan-y"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEndPena}
                  >
                    {/* Slides de Fotos */}
                    <div 
                      className="flex h-full w-full transition-transform duration-300 ease-out cursor-pointer"
                      style={{ transform: `translateX(-${activePenaIndex * 100}%)` }}
                      onClick={() => setLightboxGallery('pena')}
                    >
                      {FOTOS_PENA.map((foto, idx) => (
                        <div key={foto.id} className="relative min-w-full h-full flex-shrink-0">
                          <img 
                            src={foto.url} 
                            alt={foto.titulo} 
                            loading={idx === 0 ? "eager" : "lazy"}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-tarjeta dark:from-[#151e1b] via-transparent to-black/35 pointer-events-none"></div>
                        </div>
                      ))}
                    </div>

                    {/* Tag de Categoría Superior Izquierda */}
                    <div className="absolute top-3 left-3 pointer-events-none z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[#f5caa0] border border-[#e0a96d]/40 font-mono text-[9px] font-bold tracking-wider uppercase shadow-md">
                        <Flame className="w-3 h-3 text-[#f39c12]" />
                        <span>{item.categoria}</span>
                      </span>
                    </div>

                    {/* Badge Contador de Fotos Superior Derecha */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[#f5caa0] border border-[#e0a96d]/40 font-mono text-[9.5px] font-bold tracking-wider shadow-md">
                        <Camera className="w-3 h-3 text-[#f39c12]" />
                        <span>{activePenaIndex + 1} / {FOTOS_PENA.length}</span>
                      </span>
                    </div>

                    {/* Flechas de Navegación Lateral (Prev / Next) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevPenaSlide();
                      }}
                      aria-label="Foto anterior de la peña"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all active:scale-90 hover:bg-[#e0a96d] hover:text-black hover:border-[#e0a96d]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextPenaSlide();
                      }}
                      aria-label="Foto siguiente de la peña"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all active:scale-90 hover:bg-[#e0a96d] hover:text-black hover:border-[#e0a96d]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Barra Inferior con Título de la Foto + Botón Ampliar */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[9.5px]">
                      <span className="font-mono text-gray-200 truncate pr-2 font-medium">
                        {FOTOS_PENA[activePenaIndex].titulo}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxGallery('pena');
                        }}
                        className="inline-flex items-center gap-1 text-[#f5caa0] hover:text-white transition-colors flex-shrink-0 font-mono font-semibold"
                        title="Ver foto en tamaño completo"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span className="hidden min-[360px]:inline">Ampliar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ============================================================
                     RECUADRO ESPECIAL: CARRUSEL INTERACTIVO DE FOTOS DE ACCIÓN
                     ============================================================ */
                  <div 
                    className="relative aspect-[16/10] w-full overflow-hidden bg-black select-none touch-pan-y"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEndAccion}
                  >
                    {/* Slides de Fotos de Acción */}
                    <div 
                      className="flex h-full w-full transition-transform duration-300 ease-out cursor-pointer"
                      style={{ transform: `translateX(-${activeAccionIndex * 100}%)` }}
                      onClick={() => setLightboxGallery('accion')}
                    >
                      {FOTOS_ACCION.map((foto, idx) => (
                        <div key={foto.id} className="relative min-w-full h-full flex-shrink-0">
                          <img 
                            src={foto.url} 
                            alt={foto.titulo} 
                            loading={idx === 0 ? "eager" : "lazy"}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-tarjeta dark:from-[#151e1b] via-transparent to-black/35 pointer-events-none"></div>
                        </div>
                      ))}
                    </div>

                    {/* Tag de Categoría Superior Izquierda */}
                    <div className="absolute top-3 left-3 pointer-events-none z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[#81f2c6] border border-pbc/40 font-mono text-[9px] font-bold tracking-wider uppercase shadow-md">
                        <Landmark className="w-3 h-3 text-pbc" />
                        <span>{item.categoria}</span>
                      </span>
                    </div>

                    {/* Badge Contador de Fotos Superior Derecha */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[#81f2c6] border border-pbc/40 font-mono text-[9.5px] font-bold tracking-wider shadow-md">
                        <Camera className="w-3 h-3 text-pbc" />
                        <span>{activeAccionIndex + 1} / {FOTOS_ACCION.length}</span>
                      </span>
                    </div>

                    {/* Flechas de Navegación Lateral (Prev / Next) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevAccionSlide();
                      }}
                      aria-label="Foto anterior de acción"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all active:scale-90 hover:bg-[#64D5AB] hover:text-[#0A0E0D] hover:border-[#64D5AB]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextAccionSlide();
                      }}
                      aria-label="Foto siguiente de acción"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all active:scale-90 hover:bg-[#64D5AB] hover:text-[#0A0E0D] hover:border-[#64D5AB]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Barra Inferior con Título de la Foto + Botón Ampliar */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[9.5px]">
                      <span className="font-mono text-gray-200 truncate pr-2 font-medium">
                        {FOTOS_ACCION[activeAccionIndex].titulo}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxGallery('accion');
                        }}
                        className="inline-flex items-center gap-1 text-[#81f2c6] hover:text-white transition-colors flex-shrink-0 font-mono font-semibold"
                        title="Ver foto en tamaño completo"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span className="hidden min-[360px]:inline">Ampliar</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Contenido descriptivo */}
                <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-coolvetica text-xl uppercase text-tinta text-balance">
                        {item.titulo}
                      </h3>
                      {isRafting && (
                        <span className="px-2 py-0.5 rounded bg-pbc/15 border border-pbc/35 text-acento font-mono text-[9px] font-bold uppercase tracking-wider flex-shrink-0 mt-0.5">
                          PARADOR BETANCOURT
                        </span>
                      )}
                      {isFogon && (
                        <span className="px-2 py-0.5 rounded bg-[#e0a96d]/15 border border-[#e0a96d]/30 text-ambar font-mono text-[9px] font-bold uppercase tracking-wider flex-shrink-0 mt-0.5">
                          12 FOTOS REALES
                        </span>
                      )}
                      {isMision && (
                        <span className="px-2 py-0.5 rounded bg-pbc/15 border border-pbc/35 text-acento font-mono text-[9px] font-bold uppercase tracking-wider flex-shrink-0 mt-0.5">
                          10 FOTOS REALES
                        </span>
                      )}
                    </div>
                    
                    <p className="font-sans text-xs md:text-[13px] text-tinta-3 leading-relaxed text-pretty">
                      {item.descripcion}
                    </p>
                  </div>

                  <div>

                  {/* Botones de Acción para Rafting: Google Maps + Instagram */}
                  {isRafting && (
                    <div className="mt-3 pt-2.5 border-t border-linea/10 flex flex-wrap items-center gap-2">
                      <a
                        href="https://www.google.com/maps/place/Parador+Betancourt+Rafting/@-33.0399545,-69.0445856,17z"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#007156]/30 border border-pbc/40 text-acento font-mono text-[10px] font-bold hover:bg-pbc/20 hover:border-pbc transition-all active:scale-95 shadow-sm"
                      >
                        <MapPin className="w-3.5 h-3.5 text-acento" />
                        <span>Ver en Google Maps</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>

                      <a
                        href="https://www.instagram.com/p/DSXsqdmjmCz/?hl=en"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/15 border border-pink-500/35 text-pink-700 dark:text-pink-300 font-mono text-[10px] font-bold hover:bg-pink-500/25 transition-all active:scale-95 shadow-sm"
                      >
                        <Instagram className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                        <span>@betancourt.parador</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>
                  )}

                  {/* Indicadores de Fotos para la Peña */}
                  {isFogon && (
                    <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-linea/10">
                      <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-[240px] no-scrollbar">
                        {FOTOS_PENA.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => setActivePenaIndex(dotIdx)}
                            aria-label={`Ir a foto ${dotIdx + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-200 ${
                              dotIdx === activePenaIndex 
                                ? 'w-5 bg-[#e0a96d]' 
                                : 'w-1.5 bg-linea/20 hover:bg-linea/40'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[9px] text-ambar flex-shrink-0">
                        Deslizá para explorar →
                      </span>
                    </div>
                  )}

                  {/* Indicadores de Fotos para Acción en Mendoza */}
                  {isMision && (
                    <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-linea/10">
                      <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-[240px] no-scrollbar">
                        {FOTOS_ACCION.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => setActiveAccionIndex(dotIdx)}
                            aria-label={`Ir a foto ${dotIdx + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-200 ${
                              dotIdx === activeAccionIndex 
                                ? 'w-5 bg-pbc' 
                                : 'w-1.5 bg-linea/20 hover:bg-linea/40'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[9px] text-acento dark:text-[#81f2c6] flex-shrink-0">
                        Deslizá para explorar →
                      </span>
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-linea/10 flex items-center justify-between font-mono text-[10px] text-tinta-4 dark:text-[#bccac1]">
                    <span className={`flex items-center gap-1.5 ${isFogon ? 'text-ambar' : 'text-acento'} font-medium`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span>{item.subtexto}</span>
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isFogon ? 'text-ambar' : 'text-acento'} transition-transform duration-200 group-hover:translate-x-1`} />
                  </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
         MODAL LIGHTBOX A PANTALLA COMPLETA (PEÑA O ACCIÓN)
         ============================================================ */}
      {lightboxGallery && (() => {
        const isPena = lightboxGallery === 'pena';
        const currentPhotos = isPena ? FOTOS_PENA : FOTOS_ACCION;
        const currentIndex = isPena ? activePenaIndex : activeAccionIndex;
        const setIndex = isPena ? setActivePenaIndex : setActiveAccionIndex;
        const prevSlide = isPena ? prevPenaSlide : prevAccionSlide;
        const nextSlide = isPena ? nextPenaSlide : nextAccionSlide;
        const touchEnd = isPena ? handleTouchEndPena : handleTouchEndAccion;
        const badgeClass = isPena 
          ? 'bg-[#1b2522] border-[#e0a96d]/40 text-[#f5caa0]' 
          : 'bg-[#121917] border-pbc/40 text-[#81f2c6]';
        const galleryTitle = isPena ? 'PEÑA GAUCHA & FOGÓN' : 'ACCIÓN EN MENDOZA · MISIÓN';

        return createPortal(
          <div 
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-6 animate-fadeIn select-none"
            onClick={() => setLightboxGallery(null)}
          >
            {/* Header del Lightbox con botón Cerrar prominente */}
            <div className="flex items-center justify-between w-full max-w-4xl mx-auto z-10 pt-1 sm:pt-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full border font-mono text-[10px] font-bold ${badgeClass}`}>
                  {galleryTitle}
                </span>
                <span className="font-mono text-gray-300 text-xs">
                  {currentIndex + 1} de {currentPhotos.length}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxGallery(null);
                }}
                aria-label="Cerrar vista completa"
                className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all border border-white/30 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cerrar</span>
              </button>
            </div>

            {/* Imagen Principal en Pantalla Completa */}
            <div 
              className="relative flex-1 w-full max-w-4xl mx-auto flex items-center justify-center my-2 touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={touchEnd}
            >
              <img 
                src={currentPhotos[currentIndex].url} 
                alt={currentPhotos[currentIndex].titulo} 
                onClick={(e) => e.stopPropagation()}
                className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
              />

              {/* Controles Prev / Next Flotantes */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                aria-label="Foto anterior"
                className={`absolute left-1 md:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center ${isPena ? 'hover:bg-[#e0a96d] hover:text-black' : 'hover:bg-pbc hover:text-black'} transition-all cursor-pointer z-10`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                aria-label="Foto siguiente"
                className={`absolute right-1 md:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center ${isPena ? 'hover:bg-[#e0a96d] hover:text-black' : 'hover:bg-pbc hover:text-black'} transition-all cursor-pointer z-10`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Footer del Lightbox con Título, Miniaturas y Botón Volver */}
            <div className="w-full max-w-4xl mx-auto text-center z-10 pb-1 flex flex-col gap-2">
              <p className="font-coolvetica text-base md:text-lg text-white uppercase tracking-wide">
                {currentPhotos[currentIndex].titulo}
              </p>
              <div 
                className="flex items-center justify-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                {currentPhotos.map((foto, idx) => (
                  <button
                    key={foto.id}
                    type="button"
                    onClick={() => setIndex(idx)}
                    className={`w-9 h-7 rounded overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      idx === currentIndex 
                        ? isPena ? 'border-[#e0a96d] scale-110 shadow-lg' : 'border-pbc scale-110 shadow-lg'
                        : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={foto.url} alt={foto.titulo} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Botón Grande Inferior para Cerrar con el Pulgar */}
              <div className="w-full max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => setLightboxGallery(null)}
                  className={`w-full min-h-[46px] py-2.5 rounded-xl font-sans font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                    isPena ? 'bg-[#e0a96d] text-black' : 'bg-pbc text-pbc-deep'
                  }`}
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>Volver / Cerrar galería</span>
                </button>
              </div>
            </div>
          </div>
        , document.body);
      })()}
    </section>
  );
};
