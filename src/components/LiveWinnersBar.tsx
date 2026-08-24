import React, { useState, useEffect } from 'react';
import { LIVE_WINNERS } from '../data/gamesConfig';
import { Trophy } from 'lucide-react';

export default function LiveWinnersBar() {
  const [winnerIndex, setWinnerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWinnerIndex((prev) => (prev + 1) % LIVE_WINNERS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const winner = LIVE_WINNERS[winnerIndex];

  return (
    <div className="w-full px-3 pt-2.5 select-none">
      <div className="relative bg-gradient-to-r from-[#211202] via-[#0d0701] to-[#211202] border-2 border-[#d4af37]/60 rounded-2xl py-2 px-3.5 flex items-center justify-between text-xs overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.15)]">
        
        {/* Top 3D Specular Highlight Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ffe899]/70 to-transparent pointer-events-none" />

        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* 3D Gold Trophy Badge */}
          <div className="w-7 h-7 bg-gradient-to-b from-[#fff6be] via-[#f7b700] to-[#804f00] p-0.5 rounded-xl shadow-[0_3px_8px_rgba(245,158,11,0.6)] flex items-center justify-center shrink-0 animate-pulse">
            <div className="w-full h-full bg-[#170e01] rounded-[10px] flex items-center justify-center">
              <Trophy className="w-4 h-4 fill-amber-300 text-amber-300" />
            </div>
          </div>

          <div key={winner.id} className="flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-1 duration-300 truncate">
            <span className="font-extrabold text-amber-100 truncate">{winner.user}</span>
            <span className="text-[10px] font-bold text-amber-400/90">ganhou</span>
            <span className="font-black text-emerald-300 bg-emerald-950/90 border-2 border-emerald-500/60 px-2 py-0.5 rounded-lg text-xs shadow-sm font-mono">
              {winner.amount}
            </span>
            <span className="text-amber-200/80 hidden sm:inline text-[10px] font-bold">no {winner.game}</span>
          </div>
        </div>

        {/* Live Badge */}
        <div className="flex items-center gap-1 flex-shrink-0 text-[9px] font-black text-emerald-300 uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-full shadow-inner">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          <span>AO VIVO</span>
        </div>

      </div>
    </div>
  );
}
