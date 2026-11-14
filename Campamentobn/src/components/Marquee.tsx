import React from 'react';
import { MARQUEE_ITEMS } from '../data/campamentoData';

export const Marquee: React.FC = () => {
  return (
    <div className="w-full overflow-hidden bg-pbc text-pbc-deep py-3 border-y-2 border-pbc-deep relative z-20 shadow-[0_4px_20px_rgba(0,0,0,0.35)] select-none">
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 22s linear infinite;
        }
        .animate-marquee-track:hover,
        .animate-marquee-track:active {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="animate-marquee-track flex items-center font-coolvetica uppercase text-base sm:text-xl tracking-wider font-bold">
        {/* Set 1 */}
        <div className="flex items-center gap-6 px-4 whitespace-nowrap">
          {MARQUEE_ITEMS.map((item, i) => (
            <React.Fragment key={`set1-${i}`}>
              <span>{item}</span>
              <span className="text-xs font-mono opacity-60">◆</span>
            </React.Fragment>
          ))}
        </div>

        {/* Set 2 duplicado para bucle perfecto sin salto */}
        <div aria-hidden="true" className="flex items-center gap-6 px-4 whitespace-nowrap">
          {MARQUEE_ITEMS.map((item, i) => (
            <React.Fragment key={`set2-${i}`}>
              <span>{item}</span>
              <span className="text-xs font-mono opacity-60">◆</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
