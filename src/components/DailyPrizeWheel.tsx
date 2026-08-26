import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ArrowLeft, Zap, Frown, Clock, CheckCircle2, 
  Lock, Gift, Trophy, Plus, ShieldCheck, Smartphone, Tv, Car, DollarSign
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import wheelDiscImg from '../assets/images/wheel_disc_full_1787774201308.jpg';
import iphoneTrioImg from '../assets/images/iphone_trio_group_1785703563180.jpg';
import moneyPixImg from '../assets/images/money_pix_stack_1785703547306.jpg';

interface DailyPrizeWheelProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onUpdateBalance: (newBalance: number) => void;
  onOpenDeposit?: () => void;
}

export interface WheelSegment {
  id: number;
  label: string;
  type: 'cash' | 'device' | 'car' | 'tv' | 'retry';
  value: number;
  image?: string;
  isWin: boolean;
}

// 8 Segments matching the wheel layout (45° per slice)
// 0: iPhone (Top: 0°)
// 1: Tente Novamente (45°)
// 2: Carro 0KM (90°)
// 3: Tente Novamente (135°)
// 4: R$ 1.000 PIX (180°)
// 5: Tente Novamente (225°)
// 6: Smart TV 60" (270°)
// 7: Tente Novamente (315°)
const SEGMENTS: WheelSegment[] = [
  { id: 0, label: 'IPHONE 15 PRO', type: 'device', value: 0, image: iphoneTrioImg, isWin: true },
  { id: 1, label: 'TENTE NOVAMENTE', type: 'retry', value: 0, isWin: false },
  { id: 2, label: 'CARRO 0KM', type: 'car', value: 0, isWin: true },
  { id: 3, label: 'TENTE NOVAMENTE', type: 'retry', value: 0, isWin: false },
  { id: 4, label: 'R$ 1.000 NO PIX', type: 'cash', value: 1000, image: moneyPixImg, isWin: true },
  { id: 5, label: 'TENTE NOVAMENTE', type: 'retry', value: 0, isWin: false },
  { id: 6, label: 'SMART TV 60"', type: 'tv', value: 0, isWin: true },
  { id: 7, label: 'TENTE NOVAMENTE', type: 'retry', value: 0, isWin: false },
];

const SPIN_COST = 2.50;

// Dynamic realistic non-repeating winners pool (sem carros, prêmios realistas e sérios)
const WINNERS_DATABASE = [
  { name: 'João Carlos Silva', prize: 'R$ 1.000 no PIX', type: 'cash', city: 'SP' },
  { name: 'Joanita Oliveira', prize: 'iPhone 15 Pro Max', type: 'iphone', city: 'MG' },
  { name: 'Marcos Vinícius Souza', prize: 'R$ 500 no PIX', type: 'cash', city: 'RJ' },
  { name: 'Camila Santos Ferreira', prize: 'Smart TV 60" 4K', type: 'tv', city: 'PR' },
  { name: 'Lucas Gabriel Pereira', prize: 'R$ 1.000 no PIX', type: 'cash', city: 'BA' },
  { name: 'Larissa Mendes Duarte', prize: 'iPhone 15 Pro Max', type: 'iphone', city: 'RS' },
  { name: 'Rafael Costa Lima', prize: 'R$ 1.000 no PIX', type: 'cash', city: 'CE' },
  { name: 'Fernanda Rocha Batista', prize: 'Smart TV 60" 4K', type: 'tv', city: 'GO' },
  { name: 'Bruno Henrique Ramos', prize: 'R$ 250 no PIX', type: 'cash', city: 'PE' },
  { name: 'Patrícia Cristina Dias', prize: 'iPhone 15 Pro Max', type: 'iphone', city: 'SC' },
  { name: 'Diego Santana Carvalho', prize: 'R$ 500 no PIX', type: 'cash', city: 'DF' },
  { name: 'Amanda Vieira Gomes', prize: 'R$ 1.000 no PIX', type: 'cash', city: 'ES' },
  { name: 'Rodrigo Albuquerque', prize: 'Smart TV 60" 4K', type: 'tv', city: 'AM' },
  { name: 'Juliana Prado Silveira', prize: 'R$ 1.000 no PIX', type: 'cash', city: 'MT' },
  { name: 'Gabriel Zanin Ribeiro', prize: 'iPhone 15 Pro Max', type: 'iphone', city: 'MS' },
  { name: 'Tatiane Barbosa', prize: 'R$ 500 no PIX', type: 'cash', city: 'PA' },
  { name: 'Wesley Moreira Santos', prize: 'Smart TV 60" 4K', type: 'tv', city: 'RN' },
  { name: 'Vanessa Nogueira', prize: 'iPhone 15 Pro Max', type: 'iphone', city: 'PB' },
  { name: 'Thiago Farias Lima', prize: 'R$ 1.000 no PIX', type: 'cash', city: 'AL' },
  { name: 'Karina Bittencourt', prize: 'R$ 500 no PIX', type: 'cash', city: 'SE' },
];

export default function DailyPrizeWheel({ 
  isOpen, 
  onClose, 
  balance, 
  onUpdateBalance,
  onOpenDeposit 
}: DailyPrizeWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [resultPrize, setResultPrize] = useState<WheelSegment | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live winners non-repeating ticker state
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(0);
  const [secondsAgo, setSecondsAgo] = useState(12);

  // Rotate winners ticker every 3.8 seconds without repeating
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCurrentWinnerIndex((prev) => (prev + 1) % WINNERS_DATABASE.length);
      // Random authentic recent time (8s to 45s)
      setSecondsAgo(Math.floor(Math.random() * 35) + 8);
    }, 3800);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentWinner = WINNERS_DATABASE[currentWinnerIndex];

  const handleSpinWheel = () => {
    if (isSpinning) return;

    // Check if user has sufficient balance (R$ 2,50)
    if (balance < SPIN_COST) {
      soundEngine.playCashierBeep();
      setErrorMessage(`Saldo insuficiente (R$ ${balance.toFixed(2)}). Você precisa de R$ 2,50 para girar a roleta.`);
      return;
    }

    setErrorMessage(null);
    setIsSpinning(true);

    // Deduct R$ 2,50 immediately from user balance
    const newBal = Number(Math.max(0, balance - SPIN_COST).toFixed(2));
    onUpdateBalance(newBal);
    soundEngine.playSpinSound();
    soundEngine.playWheelSpinSequence(7);

    // House edge retention target: Lands on one of the 4 "TENTE NOVAMENTE" segments
    // Slices at 45°, 135°, 225°, 315°
    const retrySlices = [
      { angle: 45, segment: SEGMENTS[1] },
      { angle: 135, segment: SEGMENTS[3] },
      { angle: 225, segment: SEGMENTS[5] },
      { angle: 315, segment: SEGMENTS[7] },
    ];
    const chosenRetry = retrySlices[Math.floor(Math.random() * retrySlices.length)];
    const chosenPrize = chosenRetry.segment;

    // Continuous smooth forward rotation degree formula over 7.5 seconds
    const fullSpins = 10; // 10 high-speed revolutions for suspense
    const currentModulo = rotationDegree % 360;
    // To align slice at angle θ with top pointer (0°), target rotation = (360 - θ)
    const targetSliceAngle = (360 - chosenRetry.angle) % 360;
    const additionalDegrees = (360 - currentModulo + targetSliceAngle) % 360;
    const targetAngle = rotationDegree + 360 * fullSpins + (additionalDegrees === 0 ? 360 : additionalDegrees);

    setRotationDegree(targetAngle);
    setSpinCount((prev) => prev + 1);

    // After 7.5s animation completes
    setTimeout(() => {
      setIsSpinning(false);
      setResultPrize(chosenPrize);

      if (chosenPrize.isWin) {
        soundEngine.playWinChime();
        if (chosenPrize.type === 'cash' && chosenPrize.value > 0) {
          onUpdateBalance(Number((newBal + chosenPrize.value).toFixed(2)));
        }
      } else {
        soundEngine.playCashierBeep();
      }

      setShowResultModal(true);
    }, 7500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030717] text-white flex flex-col justify-between items-center overflow-y-auto select-none font-sans p-2">
      
      {/* 1. DEEP ROYAL BLUE LUXURY CASINO BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#050C22]">
        {/* Subtle Watermark Pattern */}
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Floating golden glow orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(30,58,138,0.5)_0%,rgba(14,24,64,0.3)_45%,transparent_75%)] rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(245,158,11,0.15)_0%,transparent_70%)] rounded-full blur-3xl" />
      </div>

      {/* 2. TOP NAV BAR WITH BACK BUTTON & USER BALANCE PILL */}
      <div className="w-full max-w-md px-3 pt-2 pb-0 flex items-center justify-between relative z-20">
        {/* Golden Back Button */}
        <button
          onClick={onClose}
          id="btn-close-roleta"
          className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#1e2c4d] to-[#0a1226] border border-amber-400/60 flex items-center justify-center text-amber-400 hover:brightness-125 active:scale-95 transition cursor-pointer shadow-md"
        >
          <ArrowLeft size={18} className="stroke-[2.5]" />
        </button>

        {/* User Balance & Quick Deposit Pill */}
        <div className="flex items-center gap-1.5 bg-[#091330]/95 border border-amber-500/60 px-3 py-1.5 rounded-full shadow-lg">
          <span className="text-[11px] text-zinc-300 font-bold">Saldo:</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            R$ {balance.toFixed(2)}
          </span>
          {onOpenDeposit && (
            <button
              onClick={onOpenDeposit}
              className="ml-0.5 w-5 h-5 bg-amber-400 hover:bg-amber-300 text-black rounded-full font-black text-xs flex items-center justify-center transition active:scale-90 shadow"
              title="Recarregar Saldo"
            >
              <Plus size={11} className="stroke-[3]" />
            </button>
          )}
        </div>
      </div>

      {/* 3. HEADER & TITLE SECTION (HARMONIC SPACING) */}
      <div className="w-full max-w-md text-center px-4 pt-1.5 pb-0 relative z-20">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#fff7d1] via-[#ffd54f] to-[#e69b00] drop-shadow-[0_2px_12px_rgba(245,158,11,0.85)]">
          ROLETA DIÁRIA DE PRÊMIOS
        </h1>
        <p className="text-[11.5px] sm:text-xs text-amber-200/90 font-medium max-w-xs mx-auto mt-0.5">
          Gire por apenas R$ 2,50 e ganhe prêmios no Pix e iPhones!
        </p>
      </div>

      {/* 4. THE CASINO WHEEL (NO GAP BETWEEN BORDER & PRIZE DISC) */}
      <div className="relative w-[90vw] max-w-[360px] aspect-square my-auto flex items-center justify-center relative z-20 shrink-0">
        
        {/* Outer Glow Halo */}
        <div className="absolute inset-[-15px] bg-[radial-gradient(circle,rgba(255,215,0,0.45)_0%,transparent_70%)] rounded-full blur-xl pointer-events-none" />

        {/* Thinner, Elegant Outer Brass/Gold Frame Rim */}
        <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-[#ffd977] via-[#b88e34] to-[#422e08] shadow-[0_20px_60px_rgba(0,0,0,0.95),inset_0_4px_10px_rgba(255,255,255,0.9),inset_0_-4px_10px_rgba(0,0,0,0.95)] border-[2.5px] border-[#fff7c2] flex items-center justify-center">
          
          {/* Subtle Glowing Casino Lights Around Thin Rim */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none z-20">
            <div className="w-full h-full absolute">
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = i * 30;
                return (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#fff,0_0_16px_#ffd700] border border-[#ffeb99]"
                    style={{
                      top: `calc(50% - 6px + calc(48.5% * ${Math.sin((angle * Math.PI) / 180)}))`,
                      left: `calc(50% - 6px + calc(48.5% * ${Math.cos((angle * Math.PI) / 180)}))`,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Inner Wheel Disc Holder - Full Fit 97% Seamless to Outer Rim (No Gap) */}
          <div className="w-[97%] h-[97%] rounded-full relative overflow-hidden flex items-center justify-center shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)]">
            
            {/* ROTATING 3D WHEEL DISC WITH 8 SECTORS */}
            <div
              className="w-full h-full rounded-full transition-transform duration-[7500ms] cubic-bezier(0.15, 0.95, 0.2, 1) flex items-center justify-center"
              style={{
                transform: `rotate(${rotationDegree}deg)`,
              }}
            >
              <img
                src={wheelDiscImg}
                alt="Roleta de Prêmios FuturoBet"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover scale-[1.01] rounded-full select-none pointer-events-none"
              />
            </div>

          </div>

          {/* 🔥 BOTÃO CENTRAL DE GIRAR (ELEGANTE, METÁLICO DOURADO SEM PISCAR) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center pointer-events-auto">
            <button
              id="btn-spin-wheel-center"
              onClick={handleSpinWheel}
              disabled={isSpinning}
              className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full font-black uppercase tracking-wider transition-all duration-150 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden select-none border-[3px] border-[#ffeaa7] shadow-[0_6px_20px_rgba(0,0,0,0.95),0_0_20px_rgba(245,158,11,0.6),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-4px_8px_rgba(110,50,0,0.8)] ${
                isSpinning
                  ? 'bg-gradient-to-b from-[#e5b22b] via-[#c68912] to-[#734a00] text-black scale-95 opacity-90 cursor-wait'
                  : 'bg-gradient-to-b from-[#fff399] via-[#f7b700] to-[#b36b00] text-black hover:brightness-110 active:scale-95'
              }`}
            >
              {/* Gloss highlight */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent pointer-events-none rounded-t-full" />

              {isSpinning ? (
                <span className="font-serif font-black text-[11px] uppercase tracking-tight text-black leading-tight text-center">
                  GIRANDO...
                </span>
              ) : (
                <>
                  <span className="font-serif font-black text-base sm:text-lg tracking-tight leading-none text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                    GIRAR
                  </span>
                  <span className="text-[8.5px] sm:text-[9px] font-mono font-black text-black bg-amber-200/90 px-2 py-0.5 rounded-full mt-0.5 shadow-inner border border-amber-400/50">
                    R$ 2,50
                  </span>
                </>
              )}
            </button>
          </div>

          {/* TOP BRASS ARROW POINTER WITH EMERALD GEM */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.98)] pointer-events-none">
            <div className="w-10 h-9 bg-gradient-to-b from-[#fff7c2] via-[#d4af37] to-[#543b02] rounded-t-xl border border-[#fff1a0] relative shadow-inner flex justify-center items-center p-1">
              <div className="w-4 h-4 rounded-md bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-900 border border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.9)] transform rotate-45 flex items-center justify-center" />
            </div>
            <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[22px] border-t-[#d4af37] -mt-1 relative z-10" />
          </div>

        </div>

      </div>

      {/* 5. ERROR NOTIFICATION & DISCREET FOOTER WINNERS CAROUSEL */}
      <div className="w-full max-w-md px-3 pb-2 pt-0 relative z-20 space-y-1.5">
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-red-950/95 border border-red-500/60 text-red-200 text-xs font-bold text-center flex items-center justify-between gap-2 shadow-lg animate-in shake">
            <span className="text-left">{errorMessage}</span>
            {onOpenDeposit && (
              <button
                onClick={() => {
                  setErrorMessage(null);
                  onOpenDeposit();
                }}
                className="px-2.5 py-1 bg-amber-400 text-black text-[10.5px] font-black rounded-lg uppercase tracking-wider shrink-0 hover:bg-amber-300"
              >
                Depositar +
              </button>
            )}
          </div>
        )}

        {/* DISCREET FOOTER WINNERS CAROUSEL (RODAPÉ DISCRETO SEM REPETIR NOMES E SEM AVATARES) */}
        <div className="w-full bg-[#050e26]/90 border border-amber-500/25 rounded-full px-3.5 py-1.5 flex items-center justify-between gap-2 overflow-hidden shadow-inner">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
            <p className="text-[11px] sm:text-xs text-zinc-300 truncate">
              <strong className="text-white font-semibold">{currentWinner.name}</strong> <span className="text-zinc-400">ganhou</span> <span className="text-emerald-400 font-bold font-mono">{currentWinner.prize}</span>
            </p>
          </div>
          <span className="text-[9.5px] text-zinc-400 font-mono shrink-0 pl-1">
            há {secondsAgo}s
          </span>
        </div>
      </div>

      {/* 7. RESULT MODAL (TRY AGAIN OR WIN) */}
      {showResultModal && resultPrize && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200 select-none">
          <div className="w-full max-w-xs bg-gradient-to-b from-[#0e1635] via-[#090e24] to-black border-2 border-amber-400 rounded-3xl p-5 text-center shadow-[0_0_80px_rgba(245,158,11,0.9)] relative space-y-3.5">
            
            {resultPrize.isWin ? (
              <>
                <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-yellow-300 text-black rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.9)] text-3xl animate-bounce">
                  🎉
                </div>

                <h3 className="text-lg font-black text-amber-100 uppercase tracking-tight">
                  PARABÉNS! VOCÊ GANHOU!
                </h3>

                <div className="py-3.5 px-4 bg-black/85 rounded-2xl border-2 border-amber-400/60 text-center space-y-1.5">
                  {resultPrize.image ? (
                    <img
                      src={resultPrize.image}
                      alt={resultPrize.label}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 object-contain rounded-xl mx-auto drop-shadow-lg"
                    />
                  ) : (
                    <div className="text-3xl">🎁</div>
                  )}
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Prêmio Conquistado</span>
                  <span className="text-xl font-black text-emerald-400 font-mono block drop-shadow">
                    {resultPrize.label}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      handleSpinWheel();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition"
                  >
                    GIRAR NOVAMENTE (R$ 2,50) 🎰
                  </button>

                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      onClose();
                    }}
                    className="w-full py-2 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold rounded-xl transition"
                  >
                    Voltar ao Cassino
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-red-950/90 border-2 border-red-500/60 text-red-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.5)] text-2xl">
                  <Frown size={28} />
                </div>

                <h3 className="text-base font-black text-red-400 uppercase tracking-tight">
                  NÃO FOI DESSA VEZ!
                </h3>

                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  A roleta passou raspando no iPhone e no PIX de R$ 1.000! Gire novamente por apenas <strong className="text-amber-400">R$ 2,50</strong>.
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      handleSpinWheel();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 transition"
                  >
                    GIRAR NOVAMENTE (R$ 2,50) 🚀
                  </button>

                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      onClose();
                    }}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold rounded-xl transition"
                  >
                    Voltar ao Cassino
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
