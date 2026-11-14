import React, { useState, useRef } from 'react';
import { PlaneTakeoff, RefreshCw, MapPin, ExternalLink, ArrowRight, Bed, Utensils, Waves, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { FAQS } from '../data/campamentoData';

interface LocalidadInfo {
  codigo: string;
  nombre: string;
  precio: string;
}

// Mapa de localidades con código aeronáutico y precio federal
const LOCALIDADES_INFO: Record<string, LocalidadInfo> = {
  "MAR DEL PLATA": { codigo: "MDQ", nombre: "MAR DEL PLATA", precio: "$600.000" },
  "BUENOS AIRES": { codigo: "BUE", nombre: "BUENOS AIRES", precio: "$600.000" },
  "CABA": { codigo: "BUE", nombre: "BUENOS AIRES", precio: "$600.000" },
  "AUTONOMOUS CITY OF BUENOS AIRES": { codigo: "BUE", nombre: "BUENOS AIRES", precio: "$600.000" },
  "CORDOBA": { codigo: "CBA", nombre: "CÓRDOBA", precio: "$600.000" },
  "CÓRDOBA": { codigo: "CBA", nombre: "CÓRDOBA", precio: "$600.000" },
  "ROSARIO": { codigo: "ROS", nombre: "ROSARIO", precio: "$600.000" },
  "SANTA FE": { codigo: "SFE", nombre: "SANTA FE", precio: "$600.000" },
  "TUCUMAN": { codigo: "TUC", nombre: "TUCUMÁN", precio: "$600.000" },
  "SAN MIGUEL DE TUCUMAN": { codigo: "TUC", nombre: "TUCUMÁN", precio: "$600.000" },
  "SALTA": { codigo: "SLA", nombre: "SALTA", precio: "$600.000" },
  "JUJUY": { codigo: "JUJ", nombre: "JUJUY", precio: "$600.000" },
  "SAN JUAN": { codigo: "UAQ", nombre: "SAN JUAN", precio: "$600.000" },
  "SAN LUIS": { codigo: "LUQ", nombre: "SAN LUIS", precio: "$600.000" },
  "MENDOZA": { codigo: "MDZ", nombre: "MENDOZA", precio: "$600.000" },
  "NEUQUEN": { codigo: "NQN", nombre: "NEUQUÉN", precio: "$600.000" },
  "BARILOCHE": { codigo: "BRC", nombre: "BARILOCHE", precio: "$600.000" },
  "CATAMARCA": { codigo: "CTC", nombre: "CATAMARCA", precio: "$600.000" },
  "LA RIOJA": { codigo: "IRJ", nombre: "LA RIOJA", precio: "$600.000" },
  "FEDERAL": { codigo: "ARG", nombre: "ORIGEN FEDERAL", precio: "$600.000" },
};

// Ciudad de origen del "pasaje", estimada con la zona horaria del navegador. No consulta servicios
// externos (antes se mandaba la IP de cada visitante a ipapi.co). Si no se reconoce, queda "Origen federal".
const ZONA_HORARIA_A_LOCALIDAD: Record<string, string> = {
  'America/Argentina/Buenos_Aires': 'BUENOS AIRES',
  'America/Buenos_Aires': 'BUENOS AIRES',
  'America/Argentina/Cordoba': 'CORDOBA',
  'America/Cordoba': 'CORDOBA',
  'America/Argentina/Mendoza': 'MENDOZA',
  'America/Mendoza': 'MENDOZA',
  'America/Argentina/Tucuman': 'TUCUMAN',
  'America/Argentina/Salta': 'SALTA',
  'America/Argentina/Jujuy': 'JUJUY',
  'America/Jujuy': 'JUJUY',
  'America/Argentina/San_Juan': 'SAN JUAN',
  'America/Argentina/San_Luis': 'SAN LUIS',
  'America/Argentina/Catamarca': 'CATAMARCA',
  'America/Catamarca': 'CATAMARCA',
  'America/Argentina/La_Rioja': 'LA RIOJA',
};

const estimarOrigen = (): LocalidadInfo => {
  try {
    const zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return LOCALIDADES_INFO[ZONA_HORARIA_A_LOCALIDAD[zona] ?? 'FEDERAL'] ?? LOCALIDADES_INFO.FEDERAL;
  } catch {
    return LOCALIDADES_INFO.FEDERAL;
  }
};

const FOTOS_HOTEL_SAVOIA = [
  {
    id: "fachada",
    src: "/Campamentobn/media/hotel/fachada.webp",
    titulo: "Parque & Fachada Principal",
    tag: "Predio Exclusivo"
  },
  {
    id: "pileta",
    src: "/Campamentobn/media/hotel/pileta.webp",
    titulo: "Pileta Olímpica",
    tag: "Recreación"
  },
  {
    id: "parque",
    src: "/Campamentobn/media/hotel/parque.webp",
    titulo: "Jardines & Espacios Verdes",
    tag: "Naturaleza"
  },
  {
    id: "salon",
    src: "/Campamentobn/media/hotel/salon.webp",
    titulo: "Auditorio & Salón de Plenarios",
    tag: "Formación"
  },
  {
    id: "recepcion",
    src: "/Campamentobn/media/hotel/recepcion.webp",
    titulo: "Recepción & Áreas Comunes",
    tag: "Confort"
  }
];

export const LogisticaTicket: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1");
  const [originInfo] = useState<LocalidadInfo>(estimarOrigen);

  // Estado del carrusel deslizable de fotos del Hotel Savoia
  const [activeHotelSlide, setActiveHotelSlide] = useState(0);
  const hotelCarouselRef = useRef<HTMLDivElement>(null);

  const scrollToHotelSlide = (index: number) => {
    const nextIdx = (index + FOTOS_HOTEL_SAVOIA.length) % FOTOS_HOTEL_SAVOIA.length;
    setActiveHotelSlide(nextIdx);
    if (hotelCarouselRef.current) {
      const slideWidth = hotelCarouselRef.current.clientWidth;
      hotelCarouselRef.current.scrollTo({
        left: slideWidth * nextIdx,
        behavior: 'smooth'
      });
    }
  };

  const handleCarouselScroll = () => {
    if (!hotelCarouselRef.current) return;
    const { scrollLeft, clientWidth } = hotelCarouselRef.current;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth);
      if (idx !== activeHotelSlide && idx >= 0 && idx < FOTOS_HOTEL_SAVOIA.length) {
        setActiveHotelSlide(idx);
      }
    }
  };

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-16 md:py-20 bg-[#F4F9F7] text-[#0A0E0D] relative overflow-hidden" id="logistica-faq">
      <div className="relative z-10 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Encabezado jerarquizado */}
        <div className="mb-7 md:mb-12 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10.5px] md:text-xs tracking-[0.2em] uppercase text-[#007156] font-extrabold mb-3 bg-[#E6F8F1] px-3.5 py-1 rounded-full border border-[#64D5AB]/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#64D5AB] animate-pulse"></span>
            <span>BLOQUE 4 · INFORMACIÓN PRÁCTICA</span>
          </div>
          
          <h2 className="font-coolvetica text-[38px] min-[360px]:text-[44px] sm:text-[50px] md:text-[56px] uppercase tracking-tight text-[#0A0E0D] leading-[0.98] mb-3 font-bold">
            <span className="block">TU EMBARQUE A</span>
            <span className="block text-[#007156]">MENDOZA 2027</span>
          </h2>
          
          <p className="font-sans text-[#1b2522]/85 text-xs sm:text-sm md:text-base leading-snug font-medium">
            <span className="block">Todo sobre traslados federales, fechas,</span>
            <span className="block font-semibold text-[#0A0E0D]">alojamiento y arancel unificado.</span>
          </p>
        </div>

        {/* Layout 2 Columnas en PC: Boarding Pass (Izq) + FAQs & CTA (Der) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

        {/* ======================================================== */}
        {/* TARJETA BOARDING PASS COMPACTA Y CON GLOW                */}
        {/* ======================================================== */}
        <div className="ticket-flip-container w-full max-w-md mx-auto lg:mx-0 lg:col-span-5 mb-2 lg:mb-0 relative">
          <div className={`ticket-flipper ${isFlipped ? 'is-flipped' : ''}`}>
            
            {/* ---------------- LADO FRONTAL: BOARDING PASS ---------------- */}
            <div 
              className={`ticket-front rounded-2xl bg-[#0A0E0D] text-white border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.35)] flex flex-col justify-between relative overflow-hidden ${
                isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
              }`}
            >
              {/* MITAD SUPERIOR: CABECERA, RUTA Y DATOS DE VUELO (p-6 pb-5) */}
              <div className="p-6 pb-5 flex flex-col justify-between flex-1">
                {/* Cabecera Limpia con botón destacado para rotar donde estaba fasta - mdz 2027 */}
                <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px] uppercase tracking-wider pb-4 border-b border-white/10">
                  <span className="flex items-center gap-1.5 font-bold text-[#64D5AB]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#64D5AB] animate-pulse"></span>
                    BOARDING PASS
                  </span>

                  {/* Botón destacado para rotar el boarding pass */}
                  <button 
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#64D5AB] text-[#0A0E0D] hover:bg-white border border-[#64D5AB] shadow-[0_0_16px_rgba(100,213,171,0.45)] text-[10.5px] font-mono font-extrabold uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                    title="Ver Hotel Savoia"
                  >
                    <span>Ver Hotel Savoia</span>
                    <RefreshCw className="w-3.5 h-3.5 stroke-[2.5] transition-transform duration-300 group-hover:rotate-180" />
                  </button>
                </div>

                {/* Nivel 1 (Foco Primario): Ruta Aérea con Glow y Tipografía Extra Grande */}
                <div className="py-5 flex items-center justify-between">
                  {/* Origen */}
                  <div className="flex-1 text-left min-w-0">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono font-bold block">
                      ORIGEN
                    </span>
                    <div className="font-coolvetica text-4xl sm:text-[44px] text-white leading-none font-bold mt-1 tracking-wide drop-shadow-[0_0_15px_rgba(100,213,171,0.25)]">
                      {originInfo.codigo}
                    </div>
                    <span className="text-xs text-zinc-300 font-medium block mt-1 truncate">
                      {originInfo.nombre}
                    </span>
                  </div>

                  {/* Centro con Avión y Trayectoria Directa */}
                  <div className="flex flex-col items-center px-4 flex-shrink-0">
                    <PlaneTakeoff className="w-6 h-6 text-[#64D5AB] animate-pulse drop-shadow-[0_0_12px_rgba(100,213,171,0.7)]" />
                    <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mt-1">
                      DIRECTO
                    </span>
                  </div>

                  {/* Destino */}
                  <div className="flex-1 text-right min-w-0">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono font-bold block">
                      DESTINO
                    </span>
                    <div className="font-coolvetica text-4xl sm:text-[44px] text-[#64D5AB] leading-none font-bold mt-1 tracking-wide drop-shadow-[0_0_15px_rgba(100,213,171,0.5)]">
                      MDZ
                    </div>
                    <span className="text-xs text-zinc-300 font-medium block mt-1 truncate">
                      MENDOZA
                    </span>
                  </div>
                </div>

                {/* Nivel 2 y 3: Solo Fechas Oficiales y Alojamiento (Sin pasajero ni vuelo) */}
                <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-y-3 gap-x-5 text-left">
                  {/* Fechas Oficiales */}
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono block">
                      FECHAS OFICIALES
                    </span>
                    <span className="text-sm font-semibold text-white block mt-0.5 whitespace-nowrap">
                      15 al 22 Ene 2027
                    </span>
                    <span className="text-[#64D5AB] font-mono text-xs font-bold block mt-0.5">
                      (7 días)
                    </span>
                  </div>

                  {/* Alojamiento */}
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono block">
                      ALOJAMIENTO
                    </span>
                    <span className="text-sm font-semibold text-white block mt-0.5">
                      Hotel Savoia
                    </span>
                    <span className="text-zinc-400 font-normal text-xs block mt-0.5">
                      (Pensión Completa)
                    </span>
                  </div>
                </div>
              </div>

              {/* CORTE DEL TICKET (Línea Separadora con Muescas Laterales) */}
              <div className="relative flex items-center my-0">
                {/* Muesca Izquierda */}
                <div className="w-6 h-6 rounded-full bg-[#F4F9F7] -ml-3 z-10 flex-shrink-0"></div>
                {/* Línea Troquelada Transversal */}
                <div className="flex-1 border-b border-dashed border-white/20 mx-1"></div>
                {/* Muesca Derecha */}
                <div className="w-6 h-6 rounded-full bg-[#F4F9F7] -mr-3 z-10 flex-shrink-0"></div>
              </div>

              {/* MITAD INFERIOR: TALÓN DE PAGO Y ARANCEL FEDERAL (p-6 pt-5) */}
              <div className="p-6 pt-5 flex flex-col justify-between flex-1">
                {/* Header de Arancel Federal */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono font-bold">
                    ARANCEL FEDERAL
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#64D5AB]/15 text-[#64D5AB] border border-[#64D5AB]/30 font-mono text-[10px] font-bold uppercase tracking-wider">
                    TODO INCLUIDO
                  </span>
                </div>

                {/* Nivel 1 (Foco Primario Inferior): Precio Extra Grande */}
                <div className="font-coolvetica text-4xl sm:text-[44px] text-[#64D5AB] font-bold leading-none tracking-wide drop-shadow-[0_0_16px_rgba(100,213,171,0.35)]">
                  {originInfo.precio}
                </div>

                {/* Condiciones de Financiación */}
                <p className="text-xs text-zinc-300 font-medium mt-2 leading-relaxed">
                  Cuotas fijas congeladas · Prorrateo federal por distancia
                </p>

                {/* Código de Barras Aeronáutico Centrado con Margen Amplio (mt-6) */}
                <div className="mt-6 pt-1 flex flex-col items-center justify-center opacity-70">
                  <div className="flex items-center gap-[2.5px] h-7 px-2">
                    {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 1, 2, 3, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2].map((w, i) => (
                      <span key={i} style={{ width: `${w}px` }} className="h-full bg-white block" />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-[0.28em] mt-2">
                    PBC · {originInfo.codigo}-MDZ · 2027 · FASTA
                  </span>
                </div>
              </div>
            </div>

            {/* ---------------- LADO TRASERO: HOTEL SAVOIA CON CARRUSEL DESLIZABLE ---------------- */}
            <div 
              className={`ticket-back rounded-2xl bg-[#0A0E0D] text-white border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.35)] flex flex-col justify-between relative overflow-hidden ${
                isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
            >
              {/* MITAD SUPERIOR: CABECERA Y CARRUSEL DE FOTOS (p-6 pb-5) */}
              <div className="p-6 pb-5 flex flex-col justify-between flex-1">
                {/* Cabecera Trasera Limpia */}
                <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px] uppercase tracking-wider pb-4 border-b border-white/10">
                  <span className="flex items-center gap-1.5 font-bold text-[#64D5AB]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#64D5AB] animate-pulse"></span>
                    SEDE OFICIAL · HOTEL SAVOIA
                  </span>

                  <button 
                    type="button"
                    onClick={() => setIsFlipped(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#64D5AB]/15 text-[#64D5AB] hover:bg-[#64D5AB] hover:text-[#0A0E0D] border border-[#64D5AB]/50 text-[10.5px] font-mono font-extrabold uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                  >
                    <span>Volver al Ticket</span>
                    <RefreshCw className="w-3.5 h-3.5 stroke-[2.5] transition-transform duration-300 hover:-rotate-180" />
                  </button>
                </div>

                {/* Carrusel Deslizable de 5 Fotos */}
                <div className="my-auto py-3">
                  <div className="relative rounded-xl overflow-hidden border border-[#64D5AB]/30 bg-black/70 group">
                    <div 
                      ref={hotelCarouselRef}
                      onScroll={handleCarouselScroll}
                      className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar h-44 sm:h-48"
                    >
                      {FOTOS_HOTEL_SAVOIA.map((foto, idx) => (
                        <div 
                          key={foto.id}
                          className="w-full flex-shrink-0 snap-center relative h-full"
                        >
                          <img 
                            src={foto.src} 
                            alt={foto.titulo} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/30"></div>
                          
                          {/* Tag superior izquierdo */}
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-[#64D5AB]/40 font-mono text-[8.5px] text-[#64D5AB] uppercase font-bold">
                            {foto.tag}
                          </span>

                          {/* Contador superior derecho */}
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/15 font-mono text-[8.5px] text-white font-bold">
                            {idx + 1} / {FOTOS_HOTEL_SAVOIA.length}
                          </span>

                          {/* Título de la foto */}
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                            <span className="font-coolvetica text-sm sm:text-base text-white uppercase tracking-wide drop-shadow">
                              {foto.titulo}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Flechas laterales */}
                    <button
                      type="button"
                      onClick={() => scrollToHotelSlide(activeHotelSlide - 1)}
                      aria-label="Foto anterior del hotel"
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/65 hover:bg-[#64D5AB] text-white hover:text-[#0A0E0D] border border-white/20 flex items-center justify-center active:scale-90 transition-all cursor-pointer z-10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollToHotelSlide(activeHotelSlide + 1)}
                      aria-label="Siguiente foto del hotel"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/65 hover:bg-[#64D5AB] text-white hover:text-[#0A0E0D] border border-white/20 flex items-center justify-center active:scale-90 transition-all cursor-pointer z-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Puntos Indicadores */}
                    <div className="absolute bottom-2.5 right-3 flex items-center gap-1 z-10">
                      {FOTOS_HOTEL_SAVOIA.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => scrollToHotelSlide(idx)}
                          aria-label={`Ir a foto ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === activeHotelSlide ? 'w-4 bg-[#64D5AB]' : 'w-1.5 bg-white/45'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CORTE DEL TICKET (Mismo Divider que el frente) */}
              <div className="relative flex items-center my-0">
                <div className="w-6 h-6 rounded-full bg-[#F4F9F7] -ml-3 z-10 flex-shrink-0"></div>
                <div className="flex-1 border-b border-dashed border-white/20 mx-1"></div>
                <div className="w-6 h-6 rounded-full bg-[#F4F9F7] -mr-3 z-10 flex-shrink-0"></div>
              </div>

              {/* MITAD INFERIOR: DETALLES, AMENITIES Y ACCIONES (p-6 pt-5) */}
              <div className="p-6 pt-5 flex flex-col justify-between flex-1 space-y-4">
                <p className="font-sans text-xs text-zinc-300 leading-relaxed text-pretty">
                  Complejo hotelero de primer nivel en Guaymallén, Mendoza. Habitaciones compartidas con sommier, pensión completa (4 comidas diarias), piscina olímpica y auditorios exclusivos para los plenarios.
                </p>

                {/* Amenities en Píldoras Limpias */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-[9px] uppercase text-[#64D5AB]">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                    <Bed className="w-4 h-4 mb-1 text-[#64D5AB]" />
                    <span className="text-zinc-200">Sommier</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                    <Utensils className="w-4 h-4 mb-1 text-[#64D5AB]" />
                    <span className="text-zinc-200">4 Comidas</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                    <Waves className="w-4 h-4 mb-1 text-[#64D5AB]" />
                    <span className="text-zinc-200">Pileta & Salón</span>
                  </div>
                </div>

                {/* Enlaces de Acción */}
                <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                  <a 
                    href="https://www.hotelessavoia.com/mendoza" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-[#64D5AB] text-[#0A0E0D] font-mono text-[10px] uppercase font-black tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(100,213,171,0.3)] active:scale-95 transition-transform"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Web Oficial Hotel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a 
                    href="https://maps.google.com/?q=Hotel+Savoia+Mendoza" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-[#64D5AB] font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1 active:scale-95 transition-all hover:bg-white/10"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Maps</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* PREGUNTAS FRECUENTES (FAQ ACORDEÓN)                      */}
        {/* ======================================================== */}
        <div className="lg:col-span-7">
          <div className="mb-3 pb-2 border-b-2 border-[#0A0E0D]">
            <span className="font-mono text-[11px] md:text-xs uppercase tracking-[0.2em] text-[#007156] font-extrabold">
              PREGUNTAS FRECUENTES
            </span>
          </div>

          <div className="space-y-0 divide-y divide-[#0A0E0D]/20 font-sans">
            {FAQS.map((faq) => {
              const isOpen = openFaq === faq.id;

              return (
                <div key={faq.id} className="py-3 md:py-3.5 select-none">
                  <button 
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full min-h-[44px] flex items-center justify-between font-bold text-xs sm:text-sm md:text-base text-[#0A0E0D] text-left cursor-pointer group"
                  >
                    <span className="pr-4 group-hover:text-[#007156] transition-colors">{faq.pregunta}</span>
                    <span className={`text-[#007156] font-mono text-lg transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-45' : ''}`}>
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-xs md:text-sm text-gray-700 leading-relaxed pr-2 text-pretty animate-fadeIn">
                      {faq.respuesta}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botón CTA Intermedio */}
          <div className="mt-8 text-center">
            <a 
              href="#llamado-final" 
              className="w-full min-h-[52px] py-3.5 rounded-xl bg-[#0A0E0D] text-[#64D5AB] font-sans font-extrabold text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all hover:bg-[#17211E] border border-[#64D5AB]/30"
            >
              <span>asegurar mi plaza en el embarque</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        </div>
      </div>
    </section>
  );
};
