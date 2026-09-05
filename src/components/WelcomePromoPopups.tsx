import React, { useState, useEffect } from 'react';
import { X, Sparkles, Flame, ArrowRight, Zap, Trophy } from 'lucide-react';

// Imagens geradas com alta resolução no estilo cassino brasileiro
import promoRoletaImg from '../assets/images/promo_roleta_banner_1788621267724.jpg';
import promoTigerImg from '../assets/images/promo_tiger_pagando_1788621281607.jpg';

interface WelcomePromoPopupsProps {
  onOpenWheel: () => void;
  onOpenGame: (gameName: string) => void;
  isAnyModalOpen: boolean;
}

export default function WelcomePromoPopups({
  onOpenWheel,
  onOpenGame,
  isAnyModalOpen
}: WelcomePromoPopupsProps) {
  // 0 = nenhum, 1 = pop-up roleta, 2 = pop-up jogo pagando muito
  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    // Verificar se já foi dispensado nesta sessão do navegador
    const isDismissed = sessionStorage.getItem('futurobet_promos_dismissed');
    if (isDismissed === 'true') {
      return;
    }

    // Aguardar 4 segundos após entrar na home para abrir o 1º popup
    const timer = setTimeout(() => {
      const alreadySeen = sessionStorage.getItem('futurobet_promos_dismissed');
      if (!alreadySeen && !isAnyModalOpen) {
        setActiveStep(1);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [isAnyModalOpen]);

  // Se nenhum popup estiver ativo, não renderiza nada
  if (activeStep === 0) return null;

  // Finaliza a sequência e grava na sessão (não aparece mais a não ser que saia e entre novamente)
  const finishSequence = () => {
    sessionStorage.setItem('futurobet_promos_dismissed', 'true');
    setActiveStep(0);
  };

  // Rejeitou o Pop-up 1 -> Mostra o Pop-up 2 em sequência
  const handleRejectFirst = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveStep(2);
  };

  // Rejeitou o Pop-up 2 -> Fecha e encerra a sessão
  const handleRejectSecond = (e: React.MouseEvent) => {
    e.stopPropagation();
    finishSequence();
  };

  // Clicou no Pop-up 1 (Roleta)
  const handleAcceptFirst = () => {
    finishSequence();
    onOpenWheel();
  };

  // Clicou no Pop-up 2 (Jogo Pagando Muito - Fortune Tiger)
  const handleAcceptSecond = () => {
    finishSequence();
    onOpenGame('fortune-tiger');
  };

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* ========================================================
          POP-UP 1: ROLETA DA SORTE (Aparece após 4 segundos)
      ======================================================== */}
      {activeStep === 1 && (
        <div className="flex flex-col items-center max-w-[310px] sm:max-w-[350px] w-full animate-in zoom-in-95 duration-200">
          
          {/* Card Principal da Promoção */}
          <div 
            onClick={handleAcceptFirst}
            className="w-full relative overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-[#181105] to-[#0a0702] shadow-[0_0_50px_rgba(245,158,11,0.6)] cursor-pointer group transition-transform active:scale-[0.98] max-h-[78vh] flex flex-col justify-between"
          >
            {/* Tag Superior de Destaque */}
            <div className="absolute top-3 inset-x-3 z-10 flex justify-center pointer-events-none">
              <div className="px-3 py-1 bg-black/80 backdrop-blur-md border border-amber-400/80 rounded-full text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <Sparkles size={13} className="text-yellow-400 animate-pulse" />
                <span>GIRO GRÁTIS LIBERADO! 🎁</span>
              </div>
            </div>

            {/* Imagem do Jogo / Roleta */}
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-black">
              <img 
                src={promoRoletaImg} 
                alt="Roleta da Sorte FuturoBet"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />

              {/* Gradiente de Fusão na Base */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d0903] via-[#0d0903]/80 to-transparent pointer-events-none" />

              {/* Informações Sobrepostas na Base */}
              <div className="absolute inset-x-0 bottom-0 p-4 text-center space-y-2.5 z-10">
                <div className="space-y-0.5">
                  <h3 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 uppercase tracking-tight drop-shadow-md">
                    ROLETA PREMIADA
                  </h3>
                  <p className="text-[11px] font-bold text-amber-200 drop-shadow">
                    Participe e ganhe até <span className="text-emerald-400 font-extrabold text-xs">R$ 1.000 no PIX</span>
                  </p>
                </div>

                {/* Botão de Ação Chamativo */}
                <button
                  type="button"
                  onClick={handleAcceptFirst}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.8)] hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 border border-yellow-200 cursor-pointer"
                >
                  <Trophy size={16} className="fill-black" />
                  <span>GIRAR ROLETA AGORA</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

          </div>

          {/* Botão Fechar Redondo Flutuante Embaixo (Igual ao Cassino Real) */}
          <button
            type="button"
            onClick={handleRejectFirst}
            aria-label="Dispensar promoção"
            className="mt-4 w-11 h-11 rounded-full bg-black/80 hover:bg-zinc-900 border-2 border-white/70 text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:scale-110 active:scale-90 transition-all cursor-pointer"
          >
            <X size={22} strokeWidth={3} />
          </button>

        </div>
      )}

      {/* ========================================================
          POP-UP 2: JOGO PAGANDO MUITO (Aparece em sequência se recusar o 1º)
      ======================================================== */}
      {activeStep === 2 && (
        <div className="flex flex-col items-center max-w-[310px] sm:max-w-[350px] w-full animate-in zoom-in-95 duration-200">
          
          {/* Card Principal do Jogo */}
          <div 
            onClick={handleAcceptSecond}
            className="w-full relative overflow-hidden rounded-3xl border-2 border-red-500 bg-gradient-to-b from-[#200808] to-[#0c0303] shadow-[0_0_50px_rgba(239,68,68,0.6)] cursor-pointer group transition-transform active:scale-[0.98] max-h-[78vh] flex flex-col justify-between"
          >
            {/* Tag Superior de Destaque */}
            <div className="absolute top-3 inset-x-3 z-10 flex justify-center pointer-events-none">
              <div className="px-3 py-1 bg-black/85 backdrop-blur-md border border-red-500/80 rounded-full text-[11px] font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <Flame size={14} className="text-red-500 animate-bounce" />
                <span>PAGANDO MUITO AGORA! 🔥</span>
              </div>
            </div>

            {/* Imagem do Jogo Fortune Tiger */}
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-black">
              <img 
                src={promoTigerImg} 
                alt="Fortune Tiger Pagando Muito"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />

              {/* Gradiente de Fusão na Base */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#140404] via-[#140404]/80 to-transparent pointer-events-none" />

              {/* Informações Sobrepostas na Base */}
              <div className="absolute inset-x-0 bottom-0 p-4 text-center space-y-2.5 z-10">
                <div className="space-y-0.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs px-2 py-0.5 bg-red-600/90 text-white font-black rounded uppercase">
                      RTP 99.2%
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-amber-500/90 text-black font-black rounded uppercase">
                      HORÁRIO PAGANTE
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-amber-300 to-yellow-200 uppercase tracking-tight drop-shadow-md">
                    FORTUNE TIGER
                  </h3>
                  <p className="text-[11px] font-bold text-zinc-200 drop-shadow">
                    Multiplicadores de até <span className="text-yellow-400 font-black text-xs">2.500x a sua aposta</span>
                  </p>
                </div>

                {/* Botão de Ação Chamativo */}
                <button
                  type="button"
                  onClick={handleAcceptSecond}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.8)] hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 border border-yellow-200 cursor-pointer"
                >
                  <Zap size={16} className="fill-black" />
                  <span>JOGAR AGORA E GANHAR</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

          </div>

          {/* Botão Fechar Redondo Flutuante Embaixo */}
          <button
            type="button"
            onClick={handleRejectSecond}
            aria-label="Fechar promoção"
            className="mt-4 w-11 h-11 rounded-full bg-black/80 hover:bg-zinc-900 border-2 border-white/70 text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:scale-110 active:scale-90 transition-all cursor-pointer"
          >
            <X size={22} strokeWidth={3} />
          </button>

        </div>
      )}
    </div>
  );
}
