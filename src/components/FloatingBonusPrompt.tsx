import React from 'react';
import { Gift, ArrowRight, X, Sparkles, Flame } from 'lucide-react';

interface FloatingBonusPromptProps {
  isOpen: boolean;
  onClaim: () => void;
  onClose: () => void;
}

export default function FloatingBonusPrompt({
  isOpen,
  onClaim,
  onClose,
}: FloatingBonusPromptProps) {
  if (!isOpen) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-1rem)] sm:max-w-[480px] px-1 z-40 animate-in slide-in-from-bottom-3 fade-in duration-200 pointer-events-auto">
      <div
        onClick={onClaim}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#090e1a]/95 backdrop-blur-xl border border-amber-400/80 hover:border-amber-300 px-2.5 py-2 sm:px-3.5 sm:py-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(245,158,11,0.3)] cursor-pointer transition-all duration-200 group active:scale-[0.99]"
      >
        {/* Subtle Gold Sheen Line */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300 to-transparent pointer-events-none" />

        {/* Botão Fechar compacto no canto */}
        <button
          type="button"
          title="Fechar"
          onClick={handleDismiss}
          aria-label="Fechar notificação"
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors z-20"
        >
          <X size={11} className="stroke-[2.5]" />
        </button>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Ícone VIP Dourado Compacto */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-[1.5px] shadow-[0_2px_12px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full rounded-[7px] sm:rounded-[9px] bg-[#1a1304] flex items-center justify-center relative overflow-hidden">
                <Gift size={18} className="text-amber-400 stroke-[2.5] drop-shadow-[0_1px_6px_rgba(245,158,11,0.7)]" />
              </div>
            </div>
            {/* Pulse Indicator */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 border border-[#090e1a]" />
            </span>
          </div>

          {/* Textos da Oferta em Linhas Precisas */}
          <div className="flex-1 min-w-0 pr-4 sm:pr-3">
            {/* Linha 1: Tag / Destaque */}
            <div className="flex items-center gap-1 leading-none">
              <Flame size={11} className="fill-amber-400 text-amber-400 shrink-0" />
              <span className="text-[10.5px] sm:text-xs font-black text-amber-300 uppercase tracking-tight truncate">
                100% BÔNUS NO 1º DEPÓSITO
              </span>
            </div>

            {/* Linha 2: Chamada Direta */}
            <p className="text-[11px] sm:text-[12px] text-white font-bold leading-tight mt-0.5 truncate">
              Cadastre-se e dobre até <span className="text-amber-400 font-black">R$ 500</span>!
            </p>
          </div>

          {/* Botão Resgatar Ouro Compacto */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={onClaim}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-[10.5px] sm:text-xs uppercase tracking-wider shadow-[0_2px_12px_rgba(245,158,11,0.5)] flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap border border-yellow-200/80"
            >
              <span>RESGATAR</span>
              <ArrowRight size={12} className="stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
