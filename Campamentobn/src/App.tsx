import React from 'react';
import { Toaster } from 'sonner';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Interpelacion } from './components/Interpelacion';
import { QueVasAVivir } from './components/QueVasAVivir';
import { ExperienciaMendoza } from './components/ExperienciaMendoza';
import { Testimonios } from './components/Testimonios';
import { LogisticaTicket } from './components/LogisticaTicket';
import { TypeformLlamado } from './components/TypeformLlamado';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-pbc-deep text-white font-sans selection:bg-pbc selection:text-pbc-deep">
      {/* Toast Notification Provider (Sonner) */}
      <Toaster 
        position="top-center" 
        richColors 
        theme="dark"
        toastOptions={{
          style: {
            background: '#17211E',
            border: '1px solid #64D5AB',
            color: '#FFFFFF',
            fontFamily: 'Raleway, sans-serif'
          }
        }}
      />

      {/* 1. Header con Escudo Vectorial y Navegación */}
      <Header />

      <main>
        {/* 2. Hero con Video Modal y Métricas */}
        <Hero />

        {/* 3. Marquee Continuo */}
        <Marquee />

        {/* 4. Bloque 1: La Interpelación (Babel vs. Nehemías) */}
        <Interpelacion />

        {/* 5. Bloque 2: Qué vas a vivir (Modo Póster Editorial #64D5AB) */}
        <QueVasAVivir />

        {/* 6. Bloque 3: Experiencia Mendoza (Mística Andina, Rafting, Fogón) */}
        <ExperienciaMendoza />

        {/* 7. Testimonios & Sonido Real del Fogón con Waveform */}
        <Testimonios audioSrc="/Campamentobn/media/audio-fogon.mp3" />

        {/* 8. Bloque 4: Logística, Boarding Pass 3D Flip & FAQs */}
        <LogisticaTicket />

        {/* 9. Bloque 5: El Llamado Final (Formulario Interactivo Typeform) */}
        <TypeformLlamado />
      </main>

      {/* 10. Footer Institucional */}
      <Footer />
    </div>
  );
};

export default App;
