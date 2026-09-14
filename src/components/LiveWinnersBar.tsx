import React, { useState, useEffect } from 'react';
import { LIVE_WINNERS } from '../data/gamesConfig';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';

export default function LiveWinnersBar() {
  const [winnerIndex, setWinnerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWinnerIndex((prev) => (prev + 1) % LIVE_WINNERS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const winner = LIVE_WINNERS[winnerIndex];

  return (
    <div className="w-full px-3 pt-1 select-none">
      {/* Carrossel discreto e compacto de saques aprovados */}
      <div className="relative bg-[#0b101c]/90 border border-emerald-500/25 rounded-full py-1 px-3 flex items-center justify-between text-[11px] overflow-hidden shadow-sm">
        
        {/* Subtle light sweep */}
        <div className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-emerald-300/10 to-transparent pointer-events-none z-10 animate-light-sweep" />

        {/* Informação do Saque */}
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {/* Status PIX / Saque Aprovado */}
          <div className="flex items-center gap-1 shrink-0 text-emerald-400 font-bold text-[10px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="hidden xs:inline">Saque PIX</span>
          </div>

          <div className="h-3 w-px bg-white/10 shrink-0" />

          {/* Nome e Valor do Saque */}
          <div
            key={winner.id}
            className="flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-1 duration-250 truncate text-[11px]"
          >
            <span className="font-semibold text-zinc-200 truncate">{winner.user}</span>
            <span className="text-zinc-400 text-[10px]">sacou</span>
            <span className="font-extrabold font-mono text-emerald-400 tracking-tight">
              {winner.amount}
            </span>
          </div>
        </div>

        {/* Tag Discreta de Tempo */}
        <div className="flex items-center gap-1 shrink-0 text-[9px] font-medium text-zinc-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{winner.time}</span>
        </div>

      </div>
    </div>
  );
}
