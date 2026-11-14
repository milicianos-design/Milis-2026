import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, Send, RefreshCw, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { TYPEFORM_QUESTIONS, CAMPAMENTO_CONFIG } from '../data/campamentoData';
import { enviarPostulacion } from '../lib/postulaciones';
import { trackEvent } from '../../../js/analytics.ts';

export const TypeformLlamado: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({
    nombre: '',
    whatsapp: '',
    ciudad: '',
    carrera: '',
    motivacion: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentQ = TYPEFORM_QUESTIONS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / TYPEFORM_QUESTIONS.length) * 100);

  const handleInputChange = (val: string) => {
    setErrorMsg('');
    const maxLen = currentQ.tipo === 'textarea' ? 600 : 120;
    setFormData((prev) => ({
      ...prev,
      [currentQ.id]: val.slice(0, maxLen),
    }));
  };

  const handleNext = async () => {
    if (isSubmitting) return;
    const value = formData[currentQ.id]?.trim();
    if (currentQ.requerido && (!value || value.length < 2)) {
      setErrorMsg('Por favor completa este campo para continuar');
      return;
    }

    if (currentQ.id === 'whatsapp') {
      const digits = (value || '').replace(/\D/g, '');
      if (digits.length < 6 || digits.length > 16) {
        setErrorMsg('Por favor ingresa un número de WhatsApp válido');
        return;
      }
    }

    if (currentStep < TYPEFORM_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // La API valida los datos, limita la cantidad de envíos y descarta los de bots (campo trampa).
      setIsSubmitting(true);
      try {
        await enviarPostulacion({
          nombre: formData.nombre,
          whatsapp: formData.whatsapp,
          ciudad: formData.ciudad,
          carrera: formData.carrera,
          motivacion: formData.motivacion,
          website: honeypot,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No pudimos registrar tu postulación.';
        setErrorMsg(message);
        toast.error('No se pudo enviar la postulación', { description: message });
        return;
      } finally {
        setIsSubmitting(false);
      }

      // Formulario Completado (solo si la postulación quedó guardada)
      setIsCompleted(true);
      trackEvent('postulacion_campamento');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#64D5AB', '#89E2C1', '#FFFFFF', '#3AA37C']
      });
      toast.success("¡Postulación registrada con éxito!", {
        description: "Tu lugar para Mendoza 2027 ha sido pre-reservado."
      });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setErrorMsg('');
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentQ.tipo !== 'textarea') {
      e.preventDefault();
      handleNext();
    }
  };

  // Mensaje pre-armado para WhatsApp
  const generateWhatsAppUrl = () => {
    const msg = `¡Hola Guardia Mendoza! Quiero ser Protagonista del Bien Común 2027.
*Nombre:* ${formData.nombre}
*Ciudad/Ruca:* ${formData.ciudad}
*Carrera/Área:* ${formData.carrera}
*WhatsApp:* ${formData.whatsapp}
${formData.motivacion ? `*Motivación:* ${formData.motivacion}` : ''}`;
    
    return `https://wa.me/5492235524205?text=${encodeURIComponent(msg)}`;
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      whatsapp: '',
      ciudad: '',
      carrera: '',
      motivacion: '',
    });
    setCurrentStep(0);
    setIsCompleted(false);
  };

  return (
    <section className="py-16 md:py-24 bg-pbc-deep bg-grain text-white relative overflow-hidden border-t-2 border-pbc/20" id="llamado-final">
      {/* Watermarks de Fondo */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-7xl flex justify-between pointer-events-none select-none opacity-10 animate-badge-float">
        <span className="font-coolvetica text-[120px] md:text-[200px] text-pbc tracking-tighter motion-watermark">
          SUMATE
        </span>
        <span className="font-coolvetica text-[120px] md:text-[200px] text-pbc tracking-tighter motion-watermark">
          2027
        </span>
      </div>

      <div className="relative z-10 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-8 text-center">
        {/* Cabecera del Bloque */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pbc-card border border-pbc/30 text-pbc font-mono text-[10px] md:text-xs uppercase tracking-[0.18em] font-bold mb-2.5 md:mb-3 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-pbc animate-pulse"></span>
          <span>BLOQUE 5: EL LLAMADO FINAL</span>
        </div>

        <h2 className="font-coolvetica text-[24px] sm:text-3xl md:text-4xl lg:text-[42px] tracking-tight text-white uppercase leading-[1.12] mb-2 md:mb-3 drop-shadow-2xl text-balance">
          ¿QUÉ PARTE DE LA MURALLA TE TOCA RECONSTRUIR A VOS?
        </h2>

        <p className="font-sans text-gray-300 text-xs sm:text-sm md:text-base max-w-sm md:max-w-lg mx-auto leading-relaxed mb-6 md:mb-10 text-pretty">
          La historia no la cambian los espectadores resignados. Da un paso al frente y postulá tu lugar en Mendoza 2027.
        </p>

        {/* CONTENEDOR TIPO TYPEFORM NATIVO */}
        <div className="p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl bg-pbc-card border-2 border-pbc/30 shadow-glow-pbc text-left relative overflow-hidden">
          
          {!isCompleted ? (
            <div>
              {/* Barra de Progreso Tipo Typeform */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1.5">
                  <span className="text-pbc font-bold uppercase tracking-wider">
                    Paso {currentStep + 1} de {TYPEFORM_QUESTIONS.length}
                  </span>
                  <span>{progressPercent}% completado</span>
                </div>
                <div className="w-full h-1.5 bg-pbc-carbon rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-pbc-dark via-pbc to-pbc-light transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Pregunta Activa */}
              <div className="space-y-3 min-h-[190px] flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-pbc/20 border border-pbc/40 text-pbc font-mono text-xs font-bold flex items-center justify-center">
                    {currentQ.numero}
                  </span>
                  <span className="font-mono text-[10px] text-pbc uppercase tracking-wider font-semibold">
                    {currentQ.requerido ? 'Pregunta Obligatoria' : 'Opcional'}
                  </span>
                </div>

                <h3 className="font-coolvetica text-xl sm:text-2xl md:text-3xl uppercase text-white leading-tight text-balance">
                  {currentQ.pregunta}
                </h3>

                <p className="font-sans text-xs md:text-sm text-gray-400 text-pretty">
                  {currentQ.subtitulo}
                </p>

                {/* Input Dinámico + Honeypot Anti-Bots */}
                <div className="pt-2">
                  <input
                    type="text"
                    name="website_url_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                  />
                  {currentQ.tipo === 'textarea' ? (
                    <textarea 
                      rows={3}
                      maxLength={600}
                      value={formData[currentQ.id] || ''}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={currentQ.placeholder}
                      className="input-micro-focus w-full px-3.5 md:px-4 py-2.5 md:py-3 rounded-xl bg-pbc-carbon border border-pbc/30 text-white font-sans text-xs md:text-base placeholder:text-gray-500 focus:outline-none transition-all duration-200 resize-none"
                    />
                  ) : (
                    <input 
                      type={currentQ.tipo}
                      maxLength={120}
                      value={formData[currentQ.id] || ''}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={currentQ.placeholder}
                      className="input-micro-focus w-full min-h-[46px] md:min-h-[54px] px-3.5 md:px-4 py-2.5 md:py-3 rounded-xl bg-pbc-carbon border border-pbc/30 text-white font-sans text-xs sm:text-sm md:text-base placeholder:text-gray-500 focus:outline-none transition-all duration-200"
                    />
                  )}

                  {errorMsg && (
                    <span className="block mt-1 text-[11px] font-mono text-red-400">
                      {errorMsg}
                    </span>
                  )}
                </div>
              </div>

              {/* Botones de Navegación del Typeform */}
              <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between gap-3">
                <button 
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`min-h-[44px] px-3.5 rounded-xl border border-white/15 font-mono text-xs uppercase flex items-center gap-1.5 transition-all ${
                    currentStep === 0 ? 'opacity-30 cursor-not-allowed text-gray-500' : 'text-gray-300 hover:bg-white/10 active:scale-95 cursor-pointer'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Atrás</span>
                </button>

                <button 
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex-1 min-h-[48px] py-3 px-4 rounded-xl bg-pbc hover:bg-pbc-light text-pbc-deep font-sans font-extrabold text-xs uppercase tracking-wider animate-cta-pulse active:scale-95 flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-wait"
                >
                  <span>
                    {isSubmitting
                      ? 'ENVIANDO...'
                      : currentStep === TYPEFORM_QUESTIONS.length - 1
                        ? 'FINALIZAR'
                        : 'SIGUIENTE'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 text-center">
                <span className="font-mono text-[9px] text-gray-500">
                  Presiona Enter ↵ para avanzar
                </span>
              </div>
            </div>
          ) : (
            /* Pantalla de Éxito & Conexión Directa con WhatsApp */
            <div className="py-2 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-pbc/20 border-2 border-pbc text-pbc mx-auto flex items-center justify-center shadow-glow-pbc">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <span className="font-mono text-[10px] text-pbc font-bold uppercase tracking-widest block mb-1">
                  ¡POSTULACIÓN REGISTRADA!
                </span>
                <h3 className="font-coolvetica text-2xl uppercase text-white leading-tight">
                  Bienvenido a la Muralla, {formData.nombre.split(' ')[0]}
                </h3>
                <p className="font-sans text-xs text-gray-300 mt-1 max-w-xs mx-auto text-pretty">
                  Tus datos han quedado listos. Conectá ahora con la Guardia de Mendoza para confirmar tu delegación y congelar tu arancel.
                </p>
              </div>

              {/* Ficha Resumen */}
              <div className="bg-pbc-carbon p-3.5 rounded-xl border border-white/10 text-left font-mono text-[11px] space-y-1.5 text-gray-300">
                <div><span className="text-gray-500">Nombre:</span> <span className="text-white font-bold">{formData.nombre}</span></div>
                <div><span className="text-gray-500">Ciudad/Ruca:</span> <span className="text-pbc font-semibold">{formData.ciudad}</span></div>
                <div><span className="text-gray-500">Carrera:</span> <span className="text-white">{formData.carrera}</span></div>
                <div><span className="text-gray-500">WhatsApp:</span> <span className="text-white">{formData.whatsapp}</span></div>
              </div>

              {/* Botón WhatsApp */}
              <div className="space-y-2 pt-1">
                <a 
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-sans font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.4)] active:scale-95 transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>CONFIRMAR POR WHATSAPP</span>
                  <Send className="w-3.5 h-3.5" />
                </a>

                <button 
                  type="button"
                  onClick={resetForm}
                  className="w-full min-h-[40px] text-gray-400 hover:text-white font-mono text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Modificar o cargar otra respuesta</span>
                </button>
              </div>
            </div>
          )}

        </div>

        <div className="inline-flex items-center justify-center gap-1.5 text-[11px] font-mono text-gray-400 mt-4">
          <span className="w-1.5 h-1.5 rounded-full bg-pbc animate-pulse"></span>
          <span>Sede {CAMPAMENTO_CONFIG.hotelSede} · Cupos federales</span>
        </div>
      </div>
    </section>
  );
};
