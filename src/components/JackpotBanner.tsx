import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Trophy } from 'lucide-react';

export default function JackpotBanner() {
  const [jackpot, setJackpot] = useState<number>(2485912.80);

  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot((prev) => prev + Number((Math.random() * 0.85 + 0.15).toFixed(2)));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full px-3 pt-3 select-none">
      <div className="relative w-full bg-gradient-to-b from-[#2b1805] via-[#140b01] to-[#241303] border-3 border-[#ffd700] rounded-3xl p-3.5 text-center shadow-[0_12px_35px_rgba(245,158,11,0.5),inset_0_4px_12px_rgba(255,255,255,0.25)] overflow-hidden group">
        
        {/* Glowing Casino Lights Around Rim */}
        <div className="absolute top-1 left-2 right-2 flex justify-between pointer-events-none opacity-80">
          <div className="w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_8px_#fff] animate-ping" />
          <div className="w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_8px_#fff]" />
          <div className="w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_8px_#fff] animate-ping" />
          <div className="w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_8px_#fff]" />
        </div>

        {/* Shimmer Light Reflection Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-amber-300 fill-amber-300 filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.8)] animate-bounce" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#ffd977] to-[#d48b00] font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            JACKPOT PROGRESSIVO VEGAS
          </span>
          <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.8)] animate-pulse" />
        </div>

        {/* Live Ticking Counter Number Display in 3D Metallic Slot Frame */}
        <div className="my-1.5 py-1 px-4 bg-gradient-to-b from-black via-zinc-950 to-black rounded-2xl border-2 border-[#d4af37]/60 inline-block shadow-[inset_0_4px_10px_rgba(0,0,0,0.98),0_4px_12px_rgba(0,0,0,0.8)]">
          <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fff399] via-[#f7b700] to-[#e69d00] font-mono tracking-tight drop-shadow-[0_4px_12px_rgba(245,158,11,0.9)]">
            R$ {jackpot.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Subtitle */}
        <div className="flex items-center justify-center gap-2 mt-1 text-[10px] text-amber-300/90 font-black uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Saindo a qualquer momento
          </span>
          <span>•</span>
          <span className="text-emerald-400">100% Verificado</span>
        </div>

      </div>
    </div>
  );
}
