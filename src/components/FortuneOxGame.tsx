import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  RefreshCw, 
  Lock, 
  Zap, 
  ShieldAlert,
  Minus
} from 'lucide-react';
import { GAMES_CATALOG } from '../data/gamesConfig';
import { soundEngine } from '../utils/audio';

interface FortuneOxGameProps {
  gameName?: string | null;
  onBack: () => void;
  balance: number;
  onUpdateBalance: (newBalance: number) => void;
  onOpenDeposit: () => void;
}

const BET_OPTIONS = [0.50, 1.00, 2.00, 3.00, 5.00, 10.00, 20.00];

export default function FortuneOxGame({
  gameName,
  onBack,
  balance,
  onUpdateBalance,
  onOpenDeposit
}: FortuneOxGameProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [selectedBetIndex, setSelectedBetIndex] = useState<number>(1); // Padrão R$ 1,00
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dummyFocusRef = useRef<HTMLButtonElement>(null);
  
  const balanceRef = useRef<number>(balance);
  balanceRef.current = balance;

  const currentBet = BET_OPTIONS[selectedBetIndex] || 1.00;
  const currentBetRef = useRef<number>(currentBet);
  currentBetRef.current = currentBet;

  const lastSpinTimeRef = useRef<number>(0);

  // Identificar jogo no catálogo
  const nameLower = gameName?.toLowerCase() || '';
  const catalogGame = GAMES_CATALOG.find(
    g => g.name.toLowerCase() === nameLower || 
         g.id === nameLower ||
         nameLower.includes(g.id.replace('-', '')) ||
         g.name.toLowerCase().includes(nameLower)
  );

  const rawUrl = catalogGame?.demoUrl || 
    'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20sweetbonanza&lang=pt&cur=BRL';

  const gameUrl = rawUrl;

  const displayName = gameName || catalogGame?.name || 'FuturoBet Slot';
  const gameBg = catalogGame?.bgImage || catalogGame?.icon || '';

  const MIN_BALANCE_REQUIRED = 20.00;
  const isBalanceInsufficient = balance < MIN_BALANCE_REQUIRED;

  // Estado para controlar se o popup de saldo está aberto (inicia fechado para o usuário ver o jogo carregando)
  const [showDepositPopup, setShowDepositPopup] = useState<boolean>(false);

  // Timeout para remover tela de loading rapidamente
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [iframeKey]);

  // 🛡️ BLOQUEIA TELA CHEIA NATIVA DO NAVEGADOR PARA NÃO SAIR DA NOSSA INTERFACE
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 🎯 DESCONTA O VALOR DA APOSTA SELECIONADA DIRETAMENTE DO SALDO REAL (HOUSE EDGE RETAIN)
  const handleSpinDeduction = useCallback(() => {
    const currentBal = balanceRef.current;
    const betCost = currentBetRef.current;
    
    // Se não tiver saldo mínimo de R$ 20,00 para jogar, bloqueia e abre o depósito
    if (currentBal < 20.00) {
      soundEngine.playLockedSound();
      return;
    }

    const now = Date.now();
    // Cooldown rápido de 400ms para permitir giros contínuos sem duplicar acidentalmente
    if (now - lastSpinTimeRef.current < 400) {
      return;
    }

    lastSpinTimeRef.current = now;
    setIsSpinning(true);

    // O saldo apenas reduz conforme os giros (retenção da casa / saldo diminui)
    const newBalAfterBet = parseFloat(Math.max(0, currentBal - betCost).toFixed(2));
    onUpdateBalance(newBalAfterBet);
    soundEngine.playSpinSound();

    setTimeout(() => {
      setIsSpinning(false);
    }, 600);

    // Reseta o foco da janela para capturar o próximo toque com precisão
    setTimeout(() => {
      dummyFocusRef.current?.focus();
    }, 50);
  }, [onUpdateBalance]);

  // 🎯 CAPTURADOR DE CLIQUES E EVENTOS DE GIRO (SALDO SÓ DIMINUI A CADA GIRO)
  useEffect(() => {
    // Quando o usuário toca no iframe, o foco sai da janela pai e vai para o iframe
    const handleWindowBlur = () => {
      handleSpinDeduction();
      // Reseta o foco imediatamente para o botão oculto para capturar o próximo toque
      setTimeout(() => {
        dummyFocusRef.current?.focus();
      }, 80);
    };

    // Monitor de foco do elemento ativo
    const focusCheckInterval = setInterval(() => {
      if (document.activeElement === iframeRef.current) {
        handleSpinDeduction();
        dummyFocusRef.current?.focus();
      }
    }, 100);

    // Escuta eventos emitidos pelo iframe do provedor
    const handleGameMessage = (event: MessageEvent) => {
      try {
        const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!msg) return;

        // Detecta giro da bobina ou aposta - desconta imediatamente
        if (
          msg.event === 'spin' || 
          msg.action === 'spin' || 
          msg.type === 'SPIN_START' ||
          msg.type === 'BET' ||
          (msg.data && (msg.data.event === 'spin' || msg.data.action === 'spin'))
        ) {
          handleSpinDeduction();
        }
      } catch (e) {
        // Ignora mensagens não serializadas
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('message', handleGameMessage);

    return () => {
      clearInterval(focusCheckInterval);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('message', handleGameMessage);
    };
  }, [handleSpinDeduction]);

  const handleReloadGame = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleDecreaseBet = () => {
    if (selectedBetIndex > 0) {
      setSelectedBetIndex(prev => prev - 1);
    }
  };

  const handleIncreaseBet = () => {
    if (selectedBetIndex < BET_OPTIONS.length - 1) {
      setSelectedBetIndex(prev => prev + 1);
    }
  };

  return (
    <div className="w-full h-full h-[100dvh] max-w-md mx-auto bg-black flex flex-col items-center justify-between overflow-hidden select-none font-sans relative">
      
      {/* Botão invisível para resetar o foco da janela e capturar todos os giros */}
      <button 
        ref={dummyFocusRef} 
        aria-hidden="true" 
        className="opacity-0 pointer-events-none absolute top-0 left-0 w-0 h-0" 
        tabIndex={-1} 
      />

      {/* 1. BACKGROUND AMBIENTE */}
      {gameBg && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 filter blur-3xl scale-110 z-0 transition-opacity duration-700"
          style={{
            backgroundImage: `url(${gameBg})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
      )}

      {/* 2. TOP BAR: VOLTAR + NOME DO JOGO + RECARREGAR */}
      <header className="w-full z-30 bg-[#0c0803]/95 backdrop-blur-md border-b border-amber-500/30 px-3 py-2 flex items-center justify-between gap-2 shrink-0 shadow-lg">
        
        {/* Voltar com Confirmação */}
        <button
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-1.5 text-xs font-black text-amber-200 bg-black/90 border border-amber-500/40 hover:border-amber-400 px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition shrink-0 shadow"
        >
          <ArrowLeft size={14} className="text-amber-400" />
          <span>Voltar</span>
        </button>

        {/* Nome do Jogo */}
        <div className="flex flex-col items-center justify-center min-w-0 flex-1 px-1 text-center">
          <span className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 truncate w-full uppercase tracking-wide">
            {displayName}
          </span>
          <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MODO REAL FUTUROBET
          </span>
        </div>

        {/* Recarregar */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleReloadGame}
            className="p-2 text-zinc-300 hover:text-amber-300 bg-black/80 rounded-xl border border-amber-500/30 transition cursor-pointer active:scale-95"
            title="Recarregar jogo"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </header>

      {/* 3. ÁREA PRINCIPAL DO JOGO: PROPORÇÃO 100% PERFEITA SEM CORTAR ELEMENTOS */}
      <main 
        ref={containerRef}
        className="w-full flex-1 relative bg-black flex items-center justify-center overflow-hidden z-10"
      >
        
        {/* Loading com Poster Real do Jogo no Fundo para nunca ficar tela preta */}
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-zinc-950 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
            {gameBg && (
              <img 
                src={gameBg} 
                alt={displayName} 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover blur-sm opacity-40 scale-105" 
              />
            )}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-11 h-11 rounded-full border-3 border-amber-500/20 border-t-amber-400 animate-spin mb-3 shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
              <h3 className="text-sm font-black text-amber-100 uppercase tracking-wider drop-shadow-md">
                {displayName.toUpperCase()}
              </h3>
              <p className="text-[11px] text-amber-400 font-bold mt-1 tracking-wide">
                Carregando demonstração ao vivo...
              </p>
            </div>
          </div>
        )}

        {/* ⚠️ Confirmação de Saída do Jogo */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-200 select-none">
            
            <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              <ArrowLeft className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Deseja sair do jogo?
              </h3>
              <p className="text-xs text-zinc-300 mt-1.5 max-w-xs mx-auto leading-relaxed">
                Seu saldo de <strong className="text-amber-400 font-mono">R$ {balance.toFixed(2)}</strong> está seguro. Deseja retornar ao lobby do cassino?
              </p>
            </div>

            <div className="w-full max-w-xs space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                CONTINUAR JOGANDO
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-2.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase rounded-xl transition cursor-pointer"
              >
                Sim, Sair para o Cassino
              </button>
            </div>

          </div>
        )}

        {/* 🔒 Pop-up Simples e Direto: Mostra o jogo ao fundo com overlay e convite para adicionar saldo */}
        {isBalanceInsufficient && showDepositPopup && (
          <div 
            onClick={() => setShowDepositPopup(false)}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
          >
            
            {/* Card Modal Compacto e Transparente */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[340px] bg-[#0c0a09]/95 border border-amber-500/40 rounded-3xl p-6 text-center shadow-[0_10px_40px_rgba(0,0,0,0.85)] flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-150 relative"
            >
              {/* Botão Fechar X rápido para continuar vendo o demo */}
              <button 
                type="button"
                onClick={() => setShowDepositPopup(false)}
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>

              {/* Ícone de Raio / Dourado */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.5)] mt-1">
                <div className="w-full h-full bg-[#17120a] rounded-[14px] flex items-center justify-center">
                  <Zap className="w-7 h-7 text-amber-400 fill-amber-400" />
                </div>
              </div>

              {/* Textos Claros e Objetivos */}
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Adicione saldo para jogar
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Para girar e concorrer a prêmios reais no <strong className="text-amber-300">{displayName}</strong>, adicione saldo à sua conta.
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="w-full space-y-2 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDeposit();
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer border border-white/40"
                >
                  <Zap className="w-4 h-4 fill-black stroke-black" />
                  <span>Adicionar Saldo (PIX)</span>
                </button>

                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-2.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800/80 text-xs font-bold transition cursor-pointer"
                >
                  Voltar para o Cassino
                </button>
              </div>

            </div>

          </div>
        )}

        {/* 🎯 ENQUADRAMENTO EXATO: LARGURA 100% INTEGRAL (NÃO CORTA NENHUMA COLUNA OU PERSONAGEM) */}
        <div 
          className="w-full h-full relative overflow-hidden flex items-center justify-center"
          style={{
            // Altura expandida em 42px para empurrar o rodapé de crédito demo para baixo do footer
            marginTop: '0px',
            marginBottom: '-38px',
          }}
        >
          {/* Camada invisível de captura de toque quando saldo insuficiente para abrir popup em qualquer toque */}
          {isBalanceInsufficient && (
            <div 
              onClick={() => setShowDepositPopup(true)}
              className="absolute inset-0 z-30 cursor-pointer"
              title="Toque para adicionar saldo"
            />
          )}

          <iframe
            ref={iframeRef}
            key={iframeKey}
            src={gameUrl}
            title={displayName}
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoading(false)}
            className="w-full border-0 select-none bg-black block"
            style={{
              width: '100%',
              height: 'calc(100% + 42px)',
              minHeight: '100%',
              touchAction: 'manipulation'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          />
        </div>

      </main>

      {/* 4. 🥇 LUXURY CONTROLLER: SALDO REAL + APOSTA REAL + PIX (GIRO DIRETO NO JOGO) */}
      <footer className="w-full z-30 bg-gradient-to-t from-[#080502] via-[#120a03] to-[#1a0f05] border-t-2 border-amber-500/50 px-3 py-2.5 flex flex-col gap-1 shrink-0 shadow-[0_-12px_35px_rgba(0,0,0,0.98)] relative">
        
        <div className="flex items-center justify-between gap-2 w-full">
          
          {/* 🟢 SALDO REAL DA CONTA */}
          <div 
            onClick={onOpenDeposit}
            className="bg-black/90 border border-amber-500/40 hover:border-amber-400 rounded-xl px-3 py-1.5 flex flex-col justify-center cursor-pointer shadow active:scale-95 transition min-w-[110px]"
          >
            <div className="flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-tighter">
                SALDO REAL
              </span>
            </div>
            <span className="text-xs font-black text-emerald-400 font-mono">
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* 🎯 SELETOR DE APOSTA REAL POR GIRO (R$ 0,50 a R$ 20,00) */}
          <div className="bg-black/90 border border-amber-500/30 rounded-xl px-2 py-1 flex items-center gap-1.5 shadow">
            
            <button
              onClick={handleDecreaseBet}
              disabled={selectedBetIndex === 0}
              className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 font-bold flex items-center justify-center transition disabled:opacity-30 cursor-pointer active:scale-95"
            >
              <Minus size={12} />
            </button>

            <div className="flex flex-col items-center justify-center min-w-[62px] text-center">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                Aposta Real
              </span>
              <span className="text-xs font-black text-amber-300 font-mono">
                R$ {currentBet.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleIncreaseBet}
              disabled={selectedBetIndex === BET_OPTIONS.length - 1}
              className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 font-bold flex items-center justify-center transition disabled:opacity-30 cursor-pointer active:scale-95"
            >
              <Plus size={12} />
            </button>

          </div>

          {/* ⚡ BOTÃO DEPOSITAR PIX */}
          <button
            onClick={onOpenDeposit}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-[11px] uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap border border-white/40"
          >
            <Zap className="w-3.5 h-3.5 fill-black stroke-black" />
            <span>+ PIX</span>
          </button>

        </div>

      </footer>

    </div>
  );
}
