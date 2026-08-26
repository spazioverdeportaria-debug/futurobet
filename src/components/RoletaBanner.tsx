import React from 'react';
import { Sparkles, Zap, ShieldCheck, Trophy, Smartphone } from 'lucide-react';
import wheelDiscImg from '../assets/images/wheel_disc_full_1787774201308.jpg';

interface RoletaBannerProps {
  onOpenWheel: () => void;
}

export default function RoletaBanner({ onOpenWheel }: RoletaBannerProps) {
  return (
    <div className="w-full px-3 pt-2 select-none">
      <div
        onClick={onOpenWheel}
        className="w-full relative bg-gradient-to-r from-[#071330] via-[#09183d] to-[#040e24] border border-amber-500/40 hover:border-amber-400 rounded-2xl shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group p-3.5"
      >
        {/* Glow halo */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-20 flex items-center justify-between gap-3">
          
          {/* LEFT COLUMN: Clean Copy, Badges & CTA Button */}
          <div className="flex-1 space-y-1.5">
            
            {/* Top Badge Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-black uppercase bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-2 py-0.5 rounded-full flex items-center gap-1 tracking-tight shadow">
                <Sparkles className="w-2.5 h-2.5 fill-black stroke-black" />
                R$ 2,50 POR GIRO
              </span>

              <span className="text-[9px] font-bold uppercase bg-blue-950/90 border border-blue-400/50 text-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Smartphone className="w-2.5 h-2.5 text-blue-300" />
                IPHONE & PIX
              </span>
            </div>

            {/* Main Title & Subtitle */}
            <div>
              <h3 className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 uppercase tracking-tight leading-tight">
                Roleta de Prêmios FuturoBet
              </h3>
              <p className="text-[10px] sm:text-[11px] text-zinc-300 font-medium leading-snug mt-0.5">
                Gire por apenas R$ 2,50 e concorra a iPhones 15 Pro, Smart TVs e R$ 1.000 no PIX!
              </p>
            </div>

            {/* Action CTA Button */}
            <div className="pt-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenWheel();
                }}
                className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-black font-black text-[10.5px] sm:text-xs px-3.5 py-1.5 rounded-xl transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[0_2px_8px_rgba(245,158,11,0.4)] active:scale-95"
              >
                <Zap className="w-3 h-3 fill-black stroke-black" />
                <span>Girar por R$ 2,50 🚀</span>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: 3D Wheel Disc */}
          <div className="relative w-18 sm:w-22 h-18 sm:h-22 shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-2 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.5)] overflow-hidden group-hover:rotate-45 transition-transform duration-700 ease-out p-0.5 bg-[#0a122c]">
              <img
                src={wheelDiscImg}
                alt="Roleta 3D"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full animate-[spin_25s_linear_infinite]"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

