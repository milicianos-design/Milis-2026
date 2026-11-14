export interface CampamentoConfig {
  nombreCampamento: string;
  lema: string;
  fechas: string; // Placeholder editable
  fechasRango: string;
  lugar: string;
  provincia: string;
  hotelSede: string;
  arancelFederal: string; // Placeholder editable
  arancelDetalle: string;
  contactoWhatsApp: string;
  contactoEmail: string;
  cupoAproximado: string;
}

export const CAMPAMENTO_CONFIG: CampamentoConfig = {
  nombreCampamento: "Protagonistas del Bien Común",
  lema: "No es repetir, es reinventar",
  fechas: "15 al 22 de Enero de 2027",
  fechasRango: "15 AL 22/01 · 2027",
  lugar: "Mendoza, Argentina",
  provincia: "Mendoza",
  hotelSede: "Hotel Savoia Mendoza",
  arancelFederal: "$600.000",
  arancelDetalle: "Cuotas fijas federales · Prorrateado por distancia · Pensión completa + traslados + rafting",
  contactoWhatsApp: "+54 9 223 552-4205",
  contactoEmail: "milicianos@movimiento.fasta.org.ar",
  cupoAproximado: "+250 Jóvenes Universitarios",
};

export const METRICAS_HERO = [
  { valor: "+250", label: "Jóvenes del País", color: "text-pbc" },
  { valor: "7 Días", label: "Vivencias Unidas", color: "text-white" },
  { valor: "Disertantes", label: "De Alto Nivel", color: "text-pbc" },
  { valor: "Vocación", label: "Descubrimiento", color: "text-white" },
];

export const MARQUEE_ITEMS = [
  "10 ÁREAS PROFESIONALES",
  "MODELO LEGISLATIVO",
  "7 DÍAS EN MENDOZA",
  "RAFTING POTRERILLOS",
  "DOCTRINA SOCIAL",
  "HACKATON IA + MVP",
  "FOGON Y PEÑA",
];

export const EJES_FORMACION = [
  {
    badge: "IA + MVP",
    ejeTag: "EJE NACIÓN · INNOVACIÓN",
    numero: "1",
    titulo: "HACKATÓN PROFESIONAL E INNOVACIÓN CON IA",
    descripcion: "Prototipá soluciones reales para el territorio nacional con mentores de primer nivel. Creá MVPs y herramientas con agentes de IA diseñados para presentar ante líderes de ACDE.",
    entregable: "Prototipo funcional validado",
  },
  {
    badge: "DEBATE & TÉCNICA",
    ejeTag: "EJE ESTADO · LEGISLACIÓN",
    numero: "2",
    titulo: "MODELO LEGISLATIVO Y DEBATE CIUDADANO",
    descripcion: "Viví una simulación parlamentaria real con dinámicas de comisiones, negociación política, técnica legislativa rigurosa y orientación estratégica hacia el Bien Común.",
    entregable: "Dictamen & Proyecto de Ley",
  },
  {
    badge: "DSI & MAGISTERIO",
    ejeTag: "PILAR INTELECTUAL · MAGISTERIO",
    numero: "3",
    titulo: "FORMACIÓN DE ALTO NIVEL Y MASTERCLASS",
    descripcion: "Clases magistrales y mesas redondas de debate con referentes del país sobre Doctrina Social de la Iglesia, filosofía tomista y orden institucional.",
    entregable: "Síntesis doctrinal & Debate",
  },
];

export const EXPERIENCIAS_MENDOZA = [
  {
    id: "rafting",
    categoria: "POTRERILLOS · PARADOR BETANCOURT",
    titulo: "Rafting en Potrerillos",
    descripcion: "Adrenalina y cordillera en el Río Mendoza. Desafío en aguas de deshielo en el Parador Betancourt frente a la inmensidad de los Andes.",
    subtexto: "Río Mendoza · Parador Betancourt",
    imgUrl: "/Campamentobn/media/rafting-betancourt.webp",
    videoUrl: "/Campamentobn/media/rafting-betancourt.mp4",
    posterUrl: "/Campamentobn/media/rafting-poster.webp",
    mapsUrl: "https://www.google.com/maps/place/Parador+Betancourt+Rafting/@-33.0399545,-69.0445856,17z",
    instagramUrl: "https://www.instagram.com/p/DSXsqdmjmCz/",
  },
  {
    id: "fogon",
    categoria: "NOCHES CUYANAS · FOGÓN Y PEÑA",
    titulo: "Fogón y Peña",
    descripcion: "Comunidad, canciones y conversaciones de fondo. La guitarra al pie de la noche mendocina y el diálogo hondo que sella amistades.",
    subtexto: "Bajo las estrellas · Folklore y canto",
    imgUrl: "/Campamentobn/media/pena/pena-6.webp",
  },
  {
    id: "mision",
    categoria: "CIUDAD · MISIÓN VIVA",
    titulo: "Acción en Mendoza",
    descripcion: "Presencia pública en Plaza Independencia y territorio. Salir al encuentro, dar testimonio y servicio en el corazón cívico de la provincia.",
    subtexto: "Plaza Independencia · Misión",
    imgUrl: "/Campamentobn/media/accion/accion-1.webp",
  },
];

export interface FotoPena {
  id: number;
  url: string;
  titulo: string;
}

export const FOTOS_PENA: FotoPena[] = [
  { id: 1, url: "/Campamentobn/media/pena/pena-6.webp", titulo: "Ronda de cantos al calor del fogón" },
  { id: 2, url: "/Campamentobn/media/pena/pena-2.webp", titulo: "Peña Gaucha: milicianos en comunidad" },
  { id: 3, url: "/Campamentobn/media/pena/pena-5.webp", titulo: "El fuego vivo en la noche mendocina" },
  { id: 4, url: "/Campamentobn/media/pena/pena-1.webp", titulo: "Apertura y conducción de la peña" },
  { id: 5, url: "/Campamentobn/media/pena/pena-3.webp", titulo: "Guitarras y folklore en vivo" },
  { id: 6, url: "/Campamentobn/media/pena/pena-7.webp", titulo: "Guitarreada y canto compartido" },
  { id: 7, url: "/Campamentobn/media/pena/pena-8.webp", titulo: "Tradición y alegría universitaria" },
  { id: 8, url: "/Campamentobn/media/pena/pena-9.webp", titulo: "Mística y amistad alrededor del fuego" },
  { id: 9, url: "/Campamentobn/media/pena/pena-11.webp", titulo: "Chacareras y danzas tradicionales" },
  { id: 10, url: "/Campamentobn/media/pena/pena-12.webp", titulo: "Bombo legüero y música en directo" },
  { id: 11, url: "/Campamentobn/media/pena/pena-4.webp", titulo: "Cientos de jóvenes bajo las estrellas" },
  { id: 12, url: "/Campamentobn/media/pena/pena-10.webp", titulo: "Conversaciones hondas en la noche" },
];

export interface FotoAccion {
  id: number;
  url: string;
  titulo: string;
}

export const FOTOS_ACCION: FotoAccion[] = [
  { id: 1, url: "/Campamentobn/media/accion/accion-1.webp", titulo: "Proyecto Horizonte: «Tengan miedo de soñar cosas grandes»" },
  { id: 2, url: "/Campamentobn/media/accion/accion-2.webp", titulo: "Stand Verdad y Cultura: debate y formación universitaria" },
  { id: 3, url: "/Campamentobn/media/accion/accion-3.webp", titulo: "Acción Apostólica: presencia viva en la plaza" },
  { id: 4, url: "/Campamentobn/media/accion/accion-4.webp", titulo: "Espacio «¿Por qué no?»: testimonio y diálogo cívico" },
  { id: 5, url: "/Campamentobn/media/accion/accion-5.webp", titulo: "Stands de vocación y proyectos universitarios" },
  { id: 6, url: "/Campamentobn/media/accion/accion-6.webp", titulo: "Concurrencia y encuentro con la comunidad mendocina" },
  { id: 7, url: "/Campamentobn/media/accion/accion-7.webp", titulo: "Mural interactivo de ideas y compromiso social" },
  { id: 8, url: "/Campamentobn/media/accion/accion-8.webp", titulo: "Tradición y cultura al servicio del bien común" },
  { id: 9, url: "/Campamentobn/media/accion/accion-9.webp", titulo: "Acto cívico y apertura de la misión urbana" },
  { id: 10, url: "/Campamentobn/media/accion/accion-10.webp", titulo: "Comunidades universitarias de todo el país en misión" },
];

export const FAQS = [
  {
    id: "faq-1",
    num: "01",
    pregunta: "¿Quiénes pueden ir? Jóvenes de 18 a 24 años",
    respuesta: "Abierto a estudiantes universitarios de todo el país, provengan o no de las comunidades de FASTA.",
  },
  {
    id: "faq-2",
    num: "02",
    pregunta: "¿Cómo funciona el arancel prorrateado?",
    respuesta: "Se compensa por distancia geográfica de cada provincia y podés abonarlo en cuotas fijas anticipadas para congelar el valor.",
  },
  {
    id: "faq-3",
    num: "03",
    pregunta: "¿Qué equipaje debo preparar?",
    respuesta: "Ropa cómoda para actividades diurnas, abrigo en capas para la cordillera y calzado firme de trekking. No se requiere carpa ni bolsa de dormir ya que descansamos en hotel.",
  },
  {
    id: "faq-4",
    num: "04",
    pregunta: "¿Cómo se organizan los traslados?",
    respuesta: "Se coordinan micros chárter desde nodos federales y la Guardia de Mendoza recibe de forma permanente en terminal de ómnibus y aeropuerto El Plumerillo.",
  },
  {
    id: "faq-5",
    num: "05",
    pregunta: "¿En qué consiste el Rafting en Potrerillos?",
    respuesta: "Actividad de aventura comunitaria con guías profesionales certificados, neopreno, casco y chaleco salvavidas. Totalmente cubierto por el arancel general.",
  },
  {
    id: "faq-6",
    num: "06",
    pregunta: "¿Qué sucede al terminar el campamento?",
    respuesta: "Los proyectos validados reciben mentoreo durante 2027, vinculación activa con la red de empresarios de ACDE y seguimiento en tu propia ruca o universidad.",
  },
];

export const TYPEFORM_QUESTIONS = [
  {
    id: "nombre",
    numero: "01",
    pregunta: "¿Cuál es tu nombre completo?",
    subtitulo: "Queremos llamarte por tu nombre como en el ruca.",
    placeholder: "Ej: Juan Ignacio Gómez",
    tipo: "text",
    requerido: true,
  },
  {
    id: "whatsapp",
    numero: "02",
    pregunta: "¿Cuál es tu WhatsApp de contacto?",
    subtitulo: "Te sumaremos a la lista de Guardia Mendoza y coordinaremos tu delegación.",
    placeholder: "Ej: +54 9 11 2345-6789",
    tipo: "tel",
    requerido: true,
  },
  {
    id: "ciudad",
    numero: "03",
    pregunta: "¿De qué ciudad o Ruca venís?",
    subtitulo: "Para ubicar tu nodo de viaje y transporte federal.",
    placeholder: "Ej: Córdoba · Ruca Champaquí",
    tipo: "text",
    requerido: true,
  },
  {
    id: "carrera",
    numero: "04",
    pregunta: "¿Qué carrera estudias o cuál es tu área profesional?",
    subtitulo: "Así te asignamos al equipo temático de Hackatón y Modelo Legislativo adecuado.",
    placeholder: "Ej: Ingeniería en Sistemas, Derecho, Medicina, Comunicación...",
    tipo: "text",
    requerido: true,
  },
  {
    id: "motivacion",
    numero: "05",
    pregunta: "¿Por qué querés ser protagonista del Bien Común en Mendoza?",
    subtitulo: "(Opcional) Contanos en una frase qué te mueve a dar el paso.",
    placeholder: "Ej: Quiero poner mi profesión al servicio del país y no quedarme como espectador.",
    tipo: "textarea",
    requerido: false,
  },
];
