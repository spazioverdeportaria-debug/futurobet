import React, { useState, useEffect } from 'react';
import { X, Sparkles, Flame, ArrowRight, Trophy, Zap, ShieldCheck, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';

// Imagens em alta definição exclusivas para os pop-ups
import popupRoletaImg from '../assets/images/popup_roleta_vip_clean_1788816723863.jpg';
import popupSportsImg from '../assets/images/popup_sports_bet_clean_1788816738253.jpg';

interface WelcomePromoPopupsProps {
  onOpenWheel: () => void;
  onOpenGame?: (gameName: string) => void;
  onOpenSports: () => void;
  isAnyModalOpen: boolean;
}

export default function WelcomePromoPopups({
  onOpenWheel,
  onOpenSports,
  isAnyModalOpen
}: WelcomePromoPopupsProps) {
  // 0 = fechado, 1 = pop-up roleta VIP, 2 = pop-up bet esportiva
  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0);
  const [timeLeft, setTimeLeft] = useState<number>(299); // 4min 59s de urgência

  useEffect(() => {
    // Timer regressivo de urgência
    if (activeStep === 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 1 ? prev - 1 : 299));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeStep]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    // Verificar se já foi dispensado nesta sessão do navegador
    const isDismissed = sessionStorage.getItem('futurobet_promos_dismissed');
    if (isDismissed === 'true') {
      return;
    }

    // Aguardar 3.5 segundos após carregar a interface para exibir o pop-up
    const timer = setTimeout(() => {
      const alreadySeen = sessionStorage.getItem('futurobet_promos_dismissed');
      if (!alreadySeen && !isAnyModalOpen) {
        setActiveStep(1);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [isAnyModalOpen]);

  // Se nenhum popup estiver ativo, não renderiza nada
  if (activeStep === 0) return null;

  // Finaliza a sequência e grava na sessão (não incomoda mais nesta sessão)
  const finishSequence = () => {
    sessionStorage.setItem('futurobet_promos_dismissed', 'true');
    setActiveStep(0);
  };

  // Rejeitou o Pop-up 1 (Roleta) -> Mostra o Pop-up 2 (Bet de Sports)
  const handleRejectFirst = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveStep(2);
  };

  // Rejeitou o Pop-up 2 (Sports) -> Fecha e encerra a sessão
  const handleRejectSecond = (e: React.MouseEvent) => {
    e.stopPropagation();
    finishSequence();
  };

  // Aceitou Roleta
  const handleAcceptFirst = () => {
    finishSequence();
    onOpenWheel();
  };

  // Aceitou Sports Bet
  const handleAcceptSecond = () => {
    finishSequence();
    onOpenSports();
  };

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* SELETOR DE ABA ENTRE AS DUAS PROMOÇÕES (ROLETA VIP / BET DE ESPORTES) */}
      <div className="flex items-center gap-1.5 p-1 bg-black/70 border border-white/10 rounded-full mb-3 shadow-xl backdrop-blur-lg">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeStep === 1
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles size={13} className={activeStep === 1 ? 'fill-black' : ''} />
          <span>Roleta VIP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeStep === 2
              ? 'bg-[#00a86b] text-white shadow-[0_0_15px_rgba(0,168,107,0.5)]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Flame size={13} className={activeStep === 2 ? 'fill-white' : ''} />
          <span>Bet de Esportes</span>
        </button>
      </div>

      {/* ========================================================
          POP-UP 1: ROLETA DA SORTE VIP (Design Tier-1 Luxo & Conversão)
      ======================================================== */}
      {activeStep === 1 && (
        <div className="flex flex-col items-center max-w-[340px] sm:max-w-[380px] w-full animate-in zoom-in-95 duration-200 relative">
          
          {/* Card Principal da Roleta */}
          <div 
            onClick={handleAcceptFirst}
            className="w-full relative overflow-hidden rounded-3xl border border-amber-400/90 bg-gradient-to-b from-[#181103] via-[#0d0902] to-[#050301] shadow-[0_0_60px_rgba(245,158,11,0.45)] cursor-pointer group transition-all duration-300 hover:border-amber-300 active:scale-[0.98] flex flex-col"
          >
            {/* Tag Superior Oficial */}
            <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
              <div className="px-3 py-1 bg-black/90 backdrop-blur-md border border-amber-400/90 rounded-full text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <Sparkles size={12} className="text-yellow-400 animate-pulse" />
                <span>GIRO GRÁTIS DISPONÍVEL</span>
              </div>

              <div className="px-2.5 py-1 bg-black/90 backdrop-blur-md border border-amber-400/40 rounded-full text-[10px] font-bold text-amber-200 flex items-center gap-1 shadow-lg">
                <Clock size={11} className="text-amber-400" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            </div>

            {/* Imagem Limpa da Roleta em Alta Definição */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">
              <img 
                src={popupRoletaImg} 
                alt="Roleta VIP FuturoBet"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0902] via-[#0d0902]/80 to-transparent pointer-events-none" />
            </div>

            {/* Área de Conteúdo Diagramada com Tipografia Clara */}
            <div className="p-4 pt-1 text-center space-y-3 relative z-10">
              
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 uppercase tracking-tight">
                  Roleta da Sorte VIP
                </h3>
                <p className="text-xs text-amber-200/90 font-medium mt-1">
                  Gire sem custos e concorra a até <span className="text-emerald-400 font-black">R$ 1.000</span> no seu PIX instantâneo.
                </p>
              </div>

              {/* Grid com Prêmios Reais em Destaque */}
              <div className="grid grid-cols-3 gap-1.5 py-1">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col items-center justify-center text-center">
                  <span className="text-base">📱</span>
                  <span className="text-[10px] font-black text-amber-300 leading-tight mt-0.5">iPhone 15 Pro</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col items-center justify-center text-center">
                  <span className="text-base">💵</span>
                  <span className="text-[10px] font-black text-emerald-400 leading-tight mt-0.5">R$ 1.000 PIX</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col items-center justify-center text-center">
                  <span className="text-base">📺</span>
                  <span className="text-[10px] font-black text-amber-300 leading-tight mt-0.5">Smart TV 60"</span>
                </div>
              </div>

              {/* Selos de Benefício em Chips */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-amber-500/30 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-amber-400" />
                  Sem Rollover
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Zap size={11} className="text-emerald-400" />
                  Saque no PIX em 30s
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-[10px] font-bold text-zinc-300">
                  100% Grátis
                </span>
              </div>

              {/* Botão de Ação Direto */}
              <button
                type="button"
                onClick={handleAcceptFirst}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 border border-yellow-200 cursor-pointer"
              >
                <Trophy size={18} className="fill-black" />
                <span>GIRAR ROLETA GRATUITA AGORA</span>
                <ArrowRight size={18} />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 pt-0.5">
                <ShieldCheck size={13} className="text-[#00a86b]" />
                <span>Regulamentado SPA/MF • Prêmios Auditados e Reais</span>
              </div>
            </div>

          </div>

          {/* Botão Fechar Redondo Flutuante */}
          <button
            type="button"
            onClick={handleRejectFirst}
            aria-label="Ver próxima promoção"
            className="mt-3.5 w-11 h-11 rounded-full bg-black/85 hover:bg-zinc-900 border border-white/40 hover:border-white text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition cursor-pointer"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

        </div>
      )}

      {/* ========================================================
          POP-UP 2: BET DE ESPORTES (Futebol & Super Odds da Rodada)
      ======================================================== */}
      {activeStep === 2 && (
        <div className="flex flex-col items-center max-w-[340px] sm:max-w-[380px] w-full animate-in zoom-in-95 duration-200 relative">
          
          {/* Card Principal de Esportes */}
          <div 
            onClick={handleAcceptSecond}
            className="w-full relative overflow-hidden rounded-3xl border border-emerald-500/90 bg-gradient-to-b from-[#061c14] via-[#03120c] to-[#010805] shadow-[0_0_60px_rgba(0,168,107,0.45)] cursor-pointer group transition-all duration-300 hover:border-emerald-400 active:scale-[0.98] flex flex-col"
          >
            {/* Tag Superior Oficial */}
            <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
              <div className="px-3 py-1 bg-black/90 backdrop-blur-md border border-emerald-400/90 rounded-full text-[10px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                <Flame size={13} className="text-emerald-400 animate-pulse" />
                <span>SUPER ODDS ATIVADAS</span>
              </div>

              <div className="px-2.5 py-1 bg-black/90 backdrop-blur-md border border-emerald-400/40 rounded-full text-[10px] font-bold text-emerald-200 flex items-center gap-1 shadow-lg">
                <Clock size={11} className="text-emerald-400" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            </div>

            {/* Imagem Limpa de Esportes em Alta Definição */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">
              <img 
                src={popupSportsImg} 
                alt="Bet de Esportes FuturoBet"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#03120c] via-[#03120c]/80 to-transparent pointer-events-none" />
            </div>

            {/* Área de Conteúdo Diagramada com Tipografia Clara */}
            <div className="p-4 pt-1 text-center space-y-3 relative z-10">
              
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-green-300 to-yellow-200 uppercase tracking-tight">
                  Super Odds & Múltipla Turbinada
                </h3>
                <p className="text-xs text-emerald-100/90 font-medium mt-1">
                  Aposte nos jogos de hoje com <span className="text-amber-300 font-bold">cotações aumentadas</span> e saque no PIX.
                </p>
              </div>

              {/* Bilhete com Destaque de Confrontos Reais */}
              <div className="p-2.5 rounded-2xl bg-black/60 border border-emerald-500/25 space-y-1.5 text-left">
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-emerald-400">
                  <span>🏆 Libertadores & Brasileirão</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Super Odds</span>
                </div>
                
                <div className="flex items-center justify-between text-xs font-bold text-zinc-200 bg-white/5 px-2 py-1 rounded-lg">
                  <span className="truncate">Vitória x Grêmio</span>
                  <span className="text-amber-400 font-mono text-[11px]">Hoje 20h • 2.45x</span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-zinc-200 bg-white/5 px-2 py-1 rounded-lg">
                  <span className="truncate">Fluminense x Platense</span>
                  <span className="text-amber-400 font-mono text-[11px]">Amanhã 19h • 1.85x</span>
                </div>
              </div>

              {/* Selos de Benefício em Chips */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                  <TrendingUp size={11} />
                  Múltiplas +50%
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                  +100% no 1º Depósito
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-[10px] font-bold text-zinc-300">
                  Pagamento Antecipado
                </span>
              </div>

              {/* Botão de Ação Direto */}
              <button
                type="button"
                onClick={handleAcceptSecond}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-[#00a86b] to-emerald-400 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_30px_rgba(0,168,107,0.6)] hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 border border-emerald-200/40 cursor-pointer"
              >
                <Zap size={18} className="fill-white" />
                <span>VER JOGOS & APOSTAR AGORA</span>
                <ArrowRight size={18} />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 pt-0.5">
                <ShieldCheck size={13} className="text-[#00a86b]" />
                <span>Brasileirão • Libertadores • Copa do Brasil • Europa</span>
              </div>
            </div>

          </div>

          {/* Botão Fechar Redondo Flutuante */}
          <button
            type="button"
            onClick={handleRejectSecond}
            aria-label="Fechar promoção"
            className="mt-3.5 w-11 h-11 rounded-full bg-black/85 hover:bg-zinc-900 border border-white/40 hover:border-white text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition cursor-pointer"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

        </div>
      )}
    </div>
  );
}
