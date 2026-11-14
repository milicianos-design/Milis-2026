import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../lib/useBodyScrollLock';
import { Play, Pause, Volume2, Zap, ChevronLeft, ChevronRight, Video, X, Maximize2, Camera } from 'lucide-react';

interface TestimoniosProps {
  audioSrc?: string;
}

interface VideoTestimonial {
  id: string;
  nombre: string;
  carrera: string;
  ciudad: string;
  frase: string;
  duracion: string;
  portada: string;
  videoSrc: string;
  subtitulos?: string;
}

interface PolaroidPhoto {
  id: string;
  foto: string;
  alt: string;
  rotacion: string;
}

export const Testimonios: React.FC<TestimoniosProps> = ({ audioSrc = "/Campamentobn/media/audio-fogon.mp3" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(65);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Carrusel de Polaroids Oficiales (11 fotos reales de la carpeta Carrusel)
  const [currentPolaroidIdx, setCurrentPolaroidIdx] = useState(0);
  const [polaroidLightboxOpen, setPolaroidLightboxOpen] = useState(false);

  // Gestos táctiles de swipe para Polaroids
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const polaroidPhotos: PolaroidPhoto[] = [
    {
      id: "polaroid-1",
      foto: "/Campamentobn/media/carrusel/polaroid-11.webp",
      alt: "Comunidad miliciana en el campamento",
      rotacion: "-rotate-1"
    },
    {
      id: "polaroid-2",
      foto: "/Campamentobn/media/carrusel/polaroid-10.webp",
      alt: "Guitarra y música sobre el césped",
      rotacion: "rotate-1"
    },
    {
      id: "polaroid-3",
      foto: "/Campamentobn/media/carrusel/polaroid-8.webp",
      alt: "Mates y fraternidad",
      rotacion: "-rotate-0.5"
    },
    {
      id: "polaroid-4",
      foto: "/Campamentobn/media/carrusel/polaroid-6.webp",
      alt: "Amistades y risas en el campamento",
      rotacion: "rotate-1"
    },
    {
      id: "polaroid-5",
      foto: "/Campamentobn/media/carrusel/polaroid-7.webp",
      alt: "Fútbol y deporte en equipo",
      rotacion: "-rotate-1"
    },
    {
      id: "polaroid-6",
      foto: "/Campamentobn/media/carrusel/polaroid-3.webp",
      alt: "Vóley y momentos de juego",
      rotacion: "rotate-0.5"
    },
    {
      id: "polaroid-7",
      foto: "/Campamentobn/media/carrusel/polaroid-4.webp",
      alt: "Alegría y compañerismo",
      rotacion: "-rotate-0.5"
    },
    {
      id: "polaroid-8",
      foto: "/Campamentobn/media/carrusel/polaroid-2.webp",
      alt: "Juventud miliciana",
      rotacion: "rotate-1"
    },
    {
      id: "polaroid-9",
      foto: "/Campamentobn/media/carrusel/polaroid-5.webp",
      alt: "Alentando en las jornadas",
      rotacion: "-rotate-1"
    },
    {
      id: "polaroid-10",
      foto: "/Campamentobn/media/carrusel/polaroid-9.webp",
      alt: "Compañeros de camino",
      rotacion: "rotate-0.5"
    },
    {
      id: "polaroid-11",
      foto: "/Campamentobn/media/carrusel/polaroid-1.webp",
      alt: "Mística y presencia miliciana",
      rotacion: "-rotate-0.5"
    }
  ];

  const nextPolaroid = () => {
    setCurrentPolaroidIdx((prev) => (prev + 1) % polaroidPhotos.length);
  };
  const prevPolaroid = () => {
    setCurrentPolaroidIdx((prev) => (prev - 1 + polaroidPhotos.length) % polaroidPhotos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 45) {
        nextPolaroid();
      } else if (diff < -45) {
        prevPolaroid();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Teclado en Lightbox de Polaroids
  useEffect(() => {
    if (!polaroidLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPolaroidLightboxOpen(false);
      if (e.key === 'ArrowRight') nextPolaroid();
      if (e.key === 'ArrowLeft') prevPolaroid();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [polaroidLightboxOpen]);

  // Videos Verticales Oficiales de la carpeta Testimonios (Reels 9:16)
  const verticalVideos: VideoTestimonial[] = [
    {
      id: "reel-agus",
      nombre: "Agus Piedrabuena",
      carrera: "Miliciano FASTA",
      ciudad: "Mendoza 2027",
      frase: "«El compromiso universitario en primera persona.»",
      duracion: "01:12",
      portada: "/Campamentobn/media/testimonios/agus-piedrabuena-poster.webp",
      videoSrc: "/Campamentobn/media/testimonios/agus-piedrabuena.mp4",
      subtitulos: "“Protagonistas del Bien Común: vivir la vocación universitaria sin tibiezas.”"
    },
    {
      id: "reel-lucia",
      nombre: "Lucía Sosa",
      carrera: "Miliciana FASTA",
      ciudad: "Mendoza",
      frase: "«Una experiencia para encontrarse y disfrutar con amigos.»",
      duracion: "01:07",
      portada: "/Campamentobn/media/testimonios/lucia-sosa-poster.webp",
      videoSrc: "/Campamentobn/media/testimonios/lucia-sosa.mp4",
      subtitulos: "“Un campamento para compartir, crecer en la fe y disfrutar con amigos.”"
    },
    {
      id: "reel-fede",
      nombre: "Fede Fernández",
      carrera: "Miliciano FASTA",
      ciudad: "Mendoza 2027",
      frase: "«La muralla viva: comunidad, servicio y rigor.»",
      duracion: "01:01",
      portada: "/Campamentobn/media/testimonios/fede-fernandez-poster.webp",
      videoSrc: "/Campamentobn/media/testimonios/fede-fernandez.mp4",
      subtitulos: "“Construir la Patria hombro a hombro desde cada profesión.”"
    },
    {
      id: "reel-juanfran",
      nombre: "Juanfran Rico",
      carrera: "Miliciano FASTA",
      ciudad: "Mendoza 2027",
      frase: "«Una experiencia que te transforma para siempre.»",
      duracion: "00:50",
      portada: "/Campamentobn/media/testimonios/juanfran-rico-poster.webp",
      videoSrc: "/Campamentobn/media/testimonios/juanfran-rico.mp4",
      subtitulos: "“El llamado a reedificar los muros caídos de nuestra Patria.”"
    }
  ];

  // Estado del Video Activo a Pantalla Completa
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);

  // Con el video o la galería abiertos, la página de fondo no se mueve.
  useBodyScrollLock(polaroidLightboxOpen || activeVideo !== null);

  // Control de Audio Real del Fogón
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(Math.floor(audioRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(Math.floor(audioRef.current.duration));
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const currentP = polaroidPhotos[currentPolaroidIdx];

  return (
    <section className="py-16 bg-[#e5ede9] relative overflow-hidden border-t-2 border-b-2 border-[#121917]/20" id="testimonios">
      {/* Background texture overlay en Ultra-Alta Resolución */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="/Campamentobn/media/testimonios-bg.webp" 
          alt="Textura de pared limpia en alta resolución" 
          className="w-full h-full object-cover object-center filter contrast-105 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#e5ede9]/40 via-transparent to-[#e5ede9]/60"></div>
      </div>

      <div className="relative z-10 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 md:px-8">
        {/* Encabezado */}
        <div className="text-center mb-7 md:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121917] text-pbc font-mono text-[10px] md:text-xs uppercase tracking-[0.18em] font-extrabold mb-2.5 shadow-[3px_3px_0px_rgba(0,0,0,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-pbc animate-pulse"></span>
            <span>POSTALES REALES DEL CAMPAMENTO</span>
          </div>

          <h2 className="font-coolvetica text-[26px] sm:text-3xl md:text-[42px] tracking-tight text-[#0a100d] uppercase leading-[1.1] mb-2 text-balance">
            El eco vivo de la muralla
          </h2>
          
          <div className="w-20 h-1.5 mx-auto rounded-full bg-gradient-to-r from-[#007156] via-pbc to-[#007156] mb-2.5"></div>
          
          <p className="font-sans text-[#22312b] text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium text-pretty">
            Postales auténticas de la vida compartida en el campamento: deporte, música, mates y fraternidad.
          </p>
        </div>

        <div className="flex flex-col gap-6 md:gap-10">
          
          {/* FILA SUPERIOR PC: Polaroids (Izq) + Lema y Fogón (Der) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* ======================================================== */}
            {/* 1. CARRUSEL DE FOTOS POLAROID (SIN CITAS NI NOMBRES)    */}
            {/* ======================================================== */}
            <div className="relative lg:col-span-6">
              {/* Tarjeta Polaroid Clásica */}
              <div 
                key={currentP.id}
                className={`relative bg-[#fafaf7] p-3.5 pt-3.5 pb-6 sm:pb-7 rounded-sm border border-[#1b2522]/20 shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition-all duration-300 ${currentP.rotacion} cursor-pointer group select-none touch-pan-y`}
                onClick={() => setPolaroidLightboxOpen(true)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Marco Fotográfico Interno */}
                <div className="aspect-[16/11] w-full rounded-[2px] bg-black/10 overflow-hidden relative shadow-inner border border-black/5">
                  <img 
                    src={currentP.foto} 
                    alt={currentP.alt} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none"></div>

                  {/* Badge flotante en la foto */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[9px] font-bold">
                      <Camera className="w-3 h-3 text-pbc" />
                      <span>{currentPolaroidIdx + 1} / {polaroidPhotos.length}</span>
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center shadow">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Borde inferior clásico de Polaroid (Sin nombres ni testimonios) */}
                <div className="pt-3 px-1 flex items-center justify-between">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#121917]/70 font-bold">
                    MENDOZA 2027 · POLAROID
                  </span>
                  <span className="font-mono text-[9px] text-[#007156] font-semibold">
                    Tocá para ampliar
                  </span>
                </div>
              </div>

              {/* Controles del Carrusel de Polaroids */}
              <div className="flex items-center justify-between mt-3 px-1">
                <button 
                  type="button"
                  onClick={prevPolaroid}
                  aria-label="Polaroid anterior"
                  className="w-10 h-10 rounded-xl bg-[#121917] text-white flex items-center justify-center active:scale-90 hover:bg-[#64D5AB] hover:text-[#0A0E0D] transition-all cursor-pointer shadow-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-xs no-scrollbar py-1">
                  {polaroidPhotos.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentPolaroidIdx(idx)}
                      aria-label={`Ir a polaroid ${idx + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentPolaroidIdx ? 'w-5 bg-[#007156]' : 'w-2 bg-[#121917]/30 hover:bg-[#121917]/50'
                      }`}
                    />
                  ))}
                </div>

                <button 
                  type="button"
                  onClick={nextPolaroid}
                  aria-label="Polaroid siguiente"
                  className="w-10 h-10 rounded-xl bg-[#121917] text-white flex items-center justify-center active:scale-90 hover:bg-[#64D5AB] hover:text-[#0A0E0D] transition-all cursor-pointer shadow-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Columna Derecha PC: Lema + Reproductor Fogón */}
            <div className="lg:col-span-6 flex flex-col gap-5">
              {/* Placa Lema Institucional */}
              <div className="px-4 py-3 md:px-6 md:py-4 rounded-lg bg-[#64D5AB] text-[#0A0E0D] font-coolvetica text-sm sm:text-base md:text-xl tracking-wider uppercase font-extrabold shadow-[3px_4px_0px_#101413] border-2 border-[#101413] flex items-center justify-between transition-transform duration-150 active:scale-95">
                <span>«NO ES REPETIR, ES REINVENTAR»</span>
                <Zap className="w-5 h-5 md:w-6 md:h-6 fill-current" />
              </div>

              {/* Reproductor Interactivo Sonido Real Fogón */}
              <div className="relative overflow-hidden bg-[#141d1a] p-4 md:p-6 rounded-xl border-2 border-[#64D5AB]/60 shadow-[6px_12px_28px_rgba(0,0,0,0.25)] text-white">
                <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-luminosity">
                  <img src="/Campamentobn/media/pena/pena-5.webp" alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141d1a] via-[#141d1a]/80 to-transparent"></div>
                </div>
                
                <div className="relative z-10 flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f39c12] animate-ping"></span>
                    <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-wider text-pbc font-extrabold">
                      SONIDO REAL · FOGÓN Y BRASAS
                    </span>
                  </div>
                  <span className="font-mono text-[10px] md:text-xs text-gray-300">
                    {formatTimer(currentTime)} / {formatTimer(duration)}
                  </span>
                </div>

                <h4 className="font-coolvetica text-base sm:text-lg md:text-2xl text-white uppercase mb-1 text-balance relative z-10">
                  «Andá haciéndote una idea del fogón»
                </h4>
                <p className="font-sans text-[11px] md:text-xs text-gray-300 mb-3 font-medium leading-snug relative z-10">
                  El crujido de las brasas, las canciones y la noche compartida bajo el cielo de Mendoza.
                </p>

                <div className="relative z-10 flex items-center gap-3 bg-[#0b0f0e] p-2.5 md:p-3 rounded-xl border border-pbc/30 transition-all duration-300 hover:border-pbc">
                  <button 
                    type="button"
                    onClick={toggleAudio}
                    aria-label={isPlaying ? "Pausar audio de fogón" : "Reproducir audio de fogón"}
                    className="w-10 h-10 md:w-12 md:h-12 min-h-[40px] rounded-full bg-pbc text-pbc-deep flex items-center justify-center flex-shrink-0 active:scale-90 hover:scale-105 transition-all shadow-[0_0_15px_rgba(100,213,171,0.5)] cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="flex items-center gap-1 md:gap-1.5 flex-1 h-6 px-1">
                    {[10, 20, 14, 24, 16, 8, 20, 12, 18, 14, 22, 16].map((height, i) => (
                      <span 
                        key={i}
                        style={{ height: `${height}px` }}
                        className={`audio-bar w-1 md:w-1.5 bg-pbc rounded-full origin-bottom transition-all ${isPlaying ? 'playing' : 'opacity-40'}`}
                      ></span>
                    ))}
                  </div>

                  <Volume2 className={`w-4 h-4 md:w-5 md:h-5 ${isPlaying ? 'text-pbc animate-pulse' : 'text-zinc-500'}`} />
                </div>

                {audioSrc && (
                  <audio 
                    ref={audioRef} 
                    src={audioSrc} 
                    preload="metadata" 
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => {
                      setIsPlaying(false);
                      setCurrentTime(0);
                    }} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. BLOQUE DE VIDEOS EN VERTICAL (REELS 9:16)             */}
          {/* ======================================================== */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3 md:mb-4 px-1">
              <div className="flex items-center gap-1.5">
                <Video className="w-4 h-4 md:w-5 md:h-5 text-[#007156]" />
                <span className="font-mono text-[10px] md:text-xs uppercase tracking-wider text-[#0A0E0D] font-extrabold">
                  TESTIMONIOS EN VIDEO (REELS)
                </span>
              </div>
              <span className="font-mono text-[9px] md:text-[11px] text-[#007156] font-bold">
                Tocá para ver en pantalla completa
              </span>
            </div>

            {/* Fila Horizontal en Mobile / Grid 4 Columnas en PC */}
            <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:pb-0">
              {verticalVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className="snap-center flex-shrink-0 w-[140px] sm:w-[150px] md:w-full aspect-[9/15] rounded-2xl overflow-hidden bg-pbc-deep border-2 border-pbc/40 shadow-glow-pbc relative cursor-pointer group transition-all duration-200 active:scale-95 hover:border-pbc hover:-translate-y-1"
                >
                  {/* Foto de portada vertical */}
                  <img 
                    src={video.portada} 
                    alt={video.nombre} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/40"></div>

                  {/* Header de la tarjeta vertical */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-pbc font-mono text-[8px] md:text-[10px] font-bold uppercase border border-pbc/30">
                      {video.duracion}
                    </span>
                    <Maximize2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/70 group-hover:text-pbc transition-colors" />
                  </div>

                  {/* Botón central Play */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-pbc/90 text-pbc-deep flex items-center justify-center shadow-[0_0_20px_rgba(100,213,171,0.8)] transition-transform duration-200 group-hover:scale-110">
                      <Play className="w-4 h-4 md:w-6 md:h-6 ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Info inferior */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 md:bottom-4 md:left-4 md:right-4 text-left">
                    <h4 className="font-coolvetica text-sm md:text-lg text-white uppercase leading-tight truncate">
                      {video.nombre}
                    </h4>
                    <span className="font-mono text-[8.5px] md:text-[10px] text-pbc block truncate">
                      {video.carrera}
                    </span>
                    <span className="font-mono text-[7.5px] md:text-[9px] text-gray-300 block truncate opacity-80">
                      {video.ciudad}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* MODAL LIGHTBOX FULLSCREEN PARA FOTOS POLAROID            */}
        {/* ======================================================== */}
        {polaroidLightboxOpen && createPortal(
          <div 
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] flex flex-col justify-between p-3 sm:p-6 animate-fadeIn select-none"
            onClick={() => setPolaroidLightboxOpen(false)}
          >
            {/* Header del Lightbox con botón Cerrar prominente */}
            <div className="flex items-center justify-between w-full max-w-3xl mx-auto z-10 pt-1 sm:pt-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#121917] border border-pbc/40 text-pbc font-mono text-[10px] font-bold">
                  POSTAL POLAROID
                </span>
                <span className="font-mono text-gray-300 text-xs">
                  {currentPolaroidIdx + 1} de {polaroidPhotos.length}
                </span>
              </div>

              {/* Botón Cerrar Superior Claro y Visible */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPolaroidLightboxOpen(false);
                }}
                aria-label="Cerrar postal"
                className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all border border-white/30 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cerrar</span>
              </button>
            </div>

            {/* Imagen Principal Centrada con gestos swipe */}
            <div 
              className="relative flex-1 w-full max-w-3xl mx-auto flex items-center justify-center my-2 touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="relative bg-[#fafaf7] p-3 pb-6 rounded shadow-2xl max-h-[72vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={polaroidPhotos[currentPolaroidIdx].foto} 
                  alt={polaroidPhotos[currentPolaroidIdx].alt} 
                  className="max-h-[60vh] max-w-full object-contain rounded-[2px]"
                />
                <span className="pt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#121917]/70 font-bold block">
                  MENDOZA 2027 · {currentPolaroidIdx + 1} / {polaroidPhotos.length}
                </span>
              </div>

              {/* Botones de navegación Prev / Next */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevPolaroid();
                }}
                aria-label="Foto anterior"
                className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center hover:bg-pbc hover:text-black transition-all cursor-pointer z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextPolaroid();
                }}
                aria-label="Foto siguiente"
                className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center hover:bg-pbc hover:text-black transition-all cursor-pointer z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Footer del Lightbox con Miniaturas y Botón Volver Accesible */}
            <div className="w-full max-w-3xl mx-auto z-10 pb-1 flex flex-col gap-2">
              <div 
                className="flex items-center justify-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                {polaroidPhotos.map((photo, idx) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setCurrentPolaroidIdx(idx)}
                    className={`w-9 h-7 rounded overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      idx === currentPolaroidIdx 
                        ? 'border-pbc scale-110 shadow-lg' 
                        : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={photo.foto} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Botón Grande Inferior para Cerrar / Volver con el Pulgar */}
              <div className="w-full max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => setPolaroidLightboxOpen(false)}
                  className="w-full min-h-[46px] py-2.5 rounded-xl bg-pbc text-pbc-deep font-sans font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-[0_0_20px_rgba(100,213,171,0.5)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>Volver / Cerrar postal</span>
                </button>
              </div>
            </div>
          </div>
        , document.body)}

        {/* ======================================================== */}
        {/* MODAL FULLSCREEN A PANTALLA COMPLETA VERTICAL 9:16       */}
        {/* ======================================================== */}
        {activeVideo && createPortal(
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
            {/* Barra superior de Stories / Reels */}
            <div className="w-full space-y-2 max-w-sm mx-auto">
              {/* Barra de progreso animada */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-pbc transition-all duration-200 ease-linear"
                  style={{ width: `${videoProgress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span className="font-coolvetica text-base text-white uppercase tracking-wide">
                    {activeVideo.nombre} · {activeVideo.ciudad}
                  </span>
                </div>

                <button 
                  type="button"
                  onClick={() => setActiveVideo(null)}
                  aria-label="Cerrar video"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Video Central Vertical Real con Sonido y Controles */}
            <div className="relative flex-1 max-w-sm w-full mx-auto my-2 rounded-2xl overflow-hidden bg-black border-2 border-pbc/40 shadow-glow-pbc flex items-center justify-center">
              <video 
                key={activeVideo.id}
                src={activeVideo.videoSrc}
                poster={activeVideo.portada}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  if (v.duration) {
                    setVideoProgress((v.currentTime / v.duration) * 100);
                  }
                }}
              />
            </div>

            {/* Botón de cierre inferior accesible */}
            <div className="w-full max-w-sm mx-auto pt-1">
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="w-full min-h-[46px] py-3 rounded-xl bg-pbc text-pbc-deep font-sans font-extrabold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Cerrar Video
              </button>
            </div>
          </div>
        , document.body)}

      </div>
    </section>
  );
};
