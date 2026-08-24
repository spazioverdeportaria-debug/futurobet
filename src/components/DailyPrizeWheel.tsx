import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, Zap, Frown, Clock, CheckCircle2, Lock, Gift } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { useAuth } from '../context/AuthContext';

import wheelDiscImg from '../assets/images/wheel_disc_3d_1785703882307.jpg';
import iphoneTrioImg from '../assets/images/iphone_trio_group_1785703563180.jpg';
import moneyPixImg from '../assets/images/money_pix_stack_1785703547306.jpg';

interface DailyPrizeWheelProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onUpdateBalance: (newBalance: number) => void;
}

export interface WheelSegment {
  id: number;
  label: string;
  type: 'cash' | 'device' | 'retry';
  value: number;
  image: string;
  isWin: boolean;
}

// 5 Wheel Segments aligned with the disc geometry (72 deg per slice)
const SEGMENTS: WheelSegment[] = [
  {
    id: 0,
    label: 'IPHONE',
    type: 'device',
    value: 0,
    image: iphoneTrioImg,
    isWin: true,
  },
  {
    id: 1,
    label: 'Tente de Novo',
    type: 'retry',
    value: 0,
    image: '',
    isWin: false,
  },
  {
    id: 2,
    label: 'R$ 1.000',
    type: 'cash',
    value: 1000,
    image: moneyPixImg,
    isWin: true,
  },
  {
    id: 3,
    label: 'IPHONE',
    type: 'device',
    value: 0,
    image: iphoneTrioImg,
    isWin: true,
  },
  {
    id: 4,
    label: 'Tente de Novo',
    type: 'retry',
    value: 0,
    image: '',
    isWin: false,
  },
];

export default function DailyPrizeWheel({ isOpen, onClose, balance, onUpdateBalance }: DailyPrizeWheelProps) {
  const { account, setLastSpinDate } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [resultPrize, setResultPrize] = useState<WheelSegment | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('');

  // Daily spin verification (1 spin per day strictly)
  const todayStr = new Date().toISOString().slice(0, 10);
  const lastSpin = account?.lastDailySpin || localStorage.getItem('vegasbet_last_daily_spin');
  const hasSpunToday = lastSpin === todayStr;

  // Countdown timer to next midnight (00:00)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, nextMidnight.getTime() - now.getTime());

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilMidnight(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const handleSpinWheel = () => {
    if (isSpinning || hasSpunToday) return;

    setIsSpinning(true);
    soundEngine.playWheelSpinSequence(8);

    // Target "Tente de Novo" (Left seal at 288° or Right seal at 72° in the wheel disk)
    // To align slice at angle θ with top pointer (0°), rotation R mod 360 must be (360 - θ):
    // For Right "Tente de Novo" (θ = 72°): target rotation = 288° (or -72°)
    // For Left "Tente de Novo" (θ = 288°): target rotation = 72° (or -288°)
    const retryAngles = [288, 72];
    const targetSliceAngle = retryAngles[Math.floor(Math.random() * retryAngles.length)];
    const chosenPrize = SEGMENTS[1]; // "Tente de Novo"

    // Continuous smooth forward rotation degree formula over ~8 seconds
    const fullSpins = 12; // 12 full high-speed spins for authentic 8s suspense
    const currentModulo = rotationDegree % 360;
    const additionalDegrees = (360 - currentModulo + targetSliceAngle) % 360;
    const targetAngle = rotationDegree + 360 * fullSpins + (additionalDegrees === 0 ? 360 : additionalDegrees);

    setRotationDegree(targetAngle);
    setSpinCount((prev) => prev + 1);

    // After 8s spin animation finishes smoothly
    setTimeout(() => {
      setIsSpinning(false);
      setResultPrize(chosenPrize);

      // Record daily spin completed
      localStorage.setItem('vegasbet_last_daily_spin', todayStr);
      setLastSpinDate(todayStr);

      if (chosenPrize.isWin) {
        soundEngine.playWinChime();
        if (chosenPrize.type === 'cash' && chosenPrize.value > 0) {
          onUpdateBalance(Number((balance + chosenPrize.value).toFixed(2)));
        }
      }

      setShowResultModal(true);
    }, 8000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070401] text-white flex flex-col justify-between items-center overflow-y-auto select-none font-sans p-2">
      
      {/* 1. CASINO BOKEH & GOLD RAYS BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[repeating-conic-gradient(from_0deg,rgba(255,215,0,0.08)_0deg_15deg,transparent_15deg_30deg)] rounded-full animate-[spin_120s_linear_infinite] blur-md opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(245,158,11,0.28)_0%,rgba(180,83,9,0.12)_40%,transparent_70%)] rounded-full blur-3xl" />
      </div>

      {/* 2. TOP NAV BAR WITH 3D GOLDEN BACK BUTTON */}
      <div className="w-full max-w-md px-2 pt-3 pb-2 flex items-center justify-between relative z-20">
        <button
          onClick={onClose}
          className="relative group cursor-pointer active:translate-y-1 transition-all duration-150"
        >
          {/* 3D Drop Shadow Base */}
          <div className="absolute inset-0 rounded-2xl bg-[#3d2400] translate-y-1.5 shadow-[0_6px_12px_rgba(0,0,0,0.9)]" />
          <div className="relative px-4 py-2 bg-gradient-to-b from-[#fff6be] via-[#f7b700] to-[#8f5a00] border-2 border-[#fffde0] text-black font-black rounded-2xl flex items-center gap-2 text-xs shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(0,0,0,0.4)]">
            <ArrowLeft size={16} className="text-black stroke-[3] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]" />
            <span className="uppercase tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] font-black">
              Voltar ao Cassino
            </span>
          </div>
        </button>

        {/* Daily Status Indicator */}
        <div className="flex items-center gap-1.5 bg-black/70 border border-amber-500/40 px-3 py-1.5 rounded-2xl">
          {hasSpunToday ? (
            <span className="text-[10px] text-zinc-400 font-extrabold flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-400" />
              Giro Utilizado (0/1)
            </span>
          ) : (
            <span className="text-[10px] text-emerald-300 font-extrabold flex items-center gap-1">
              <Sparkles size={13} className="text-amber-400 animate-pulse" />
              Disponível (1/1)
            </span>
          )}
        </div>
      </div>

      {/* 3. HEADLINE SECTION */}
      <div className="w-full max-w-md text-center px-4 pt-1 pb-1 relative z-20 space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-gradient-to-b from-[#ffea85] via-[#ffd54f] to-[#ffb300] border-2 border-[#fff8e1] rounded-full text-black font-black text-[11px] uppercase tracking-wider shadow-[0_4px_12px_rgba(245,158,11,0.7),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(180,83,9,0.5)]">
          <Gift size={13} className="fill-black stroke-black" />
          <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] font-black">
            1 GIRO GRÁTIS POR DIA
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 drop-shadow-[0_4px_12px_rgba(245,158,11,0.8)]">
          ROLETA DIÁRIA DE PRÊMIOS
        </h1>
        <p className="text-xs text-amber-200/90 font-medium max-w-xs mx-auto">
          Gire diariamente e ganhe prêmios no Pix e iPhones!
        </p>
      </div>

      {/* 4. THE CASINO WHEEL CONTAINER */}
      <div className="relative w-[320px] sm:w-[340px] h-[320px] sm:h-[340px] my-2 flex items-center justify-center relative z-20 shrink-0">
        
        {/* Outer Glow Halo */}
        <div className="absolute inset-[-20px] bg-[radial-gradient(circle,rgba(255,215,0,0.55)_0%,transparent_70%)] rounded-full blur-2xl animate-pulse pointer-events-none" />

        {/* Outer Skeuomorphic Brass/Gold Frame Rim */}
        <div className="absolute w-[320px] sm:w-[340px] h-[320px] sm:h-[340px] rounded-full bg-gradient-to-br from-[#ffd977] via-[#b88e34] to-[#422e08] shadow-[0_30px_80px_rgba(0,0,0,0.98),inset_0_10px_25px_rgba(255,255,255,0.9),inset_0_-10px_25px_rgba(0,0,0,0.95)] border-[5px] border-[#fff7c2] flex items-center justify-center">
          
          {/* Glowing Casino Lights Around Rim */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center pointer-events-none z-20">
            <div className="w-full h-full absolute animate-[spin_40s_linear_infinite]">
              {Array.from({ length: 10 }).map((_, i) => {
                const angle = i * 36;
                return (
                  <div
                    key={i}
                    className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-[0_0_15px_#fff,0_0_25px_#ffd700] border-2 border-[#ffeb99]"
                    style={{
                      top: `calc(50% - 7px + ${150 * Math.sin((angle * Math.PI) / 180)}px)`,
                      left: `calc(50% - 7px + ${150 * Math.cos((angle * Math.PI) / 180)}px)`,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Inner Wheel Disc Holder */}
          <div className="w-[280px] sm:w-[296px] h-[280px] sm:h-[296px] rounded-full border-[6px] border-[#ffe484] relative overflow-hidden shadow-[inset_0_15px_35px_rgba(0,0,0,0.95)] bg-[#100903]">
            
            {/* ROTATING 3D WHEEL DISC */}
            <div
              className="w-full h-full rounded-full transition-transform duration-[8000ms] cubic-bezier(0.15, 0.95, 0.2, 1) flex items-center justify-center"
              style={{
                transform: `rotate(${rotationDegree}deg)`,
              }}
            >
              <img
                src={wheelDiscImg}
                alt="Roleta de Prêmios"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

          </div>

          {/* CENTER 3D DIAMOND GEAR HUB */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#fff7c2] via-[#e2b028] to-[#543b02] shadow-[0_15px_35px_rgba(0,0,0,0.95),inset_0_6px_12px_rgba(255,255,255,0.9)] border-[4px] border-[#ffe484] z-30 flex items-center justify-center">
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-[#8a610f] via-[#d4af37] to-[#402a00] border-2 border-[#ffd700] flex items-center justify-center text-xl sm:text-2xl shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]">
              💎
            </div>
          </div>

          {/* TOP BRASS ARROW POINTER WITH EMERALD GEM */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center filter drop-shadow-[0_12px_15px_rgba(0,0,0,0.98)]">
            <div className="w-12 h-11 bg-gradient-to-b from-[#fff7c2] via-[#d4af37] to-[#543b02] rounded-t-2xl border-2 border-[#fff1a0] relative shadow-inner flex justify-center items-center p-1">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-900 border-2 border-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.9)] transform rotate-45 flex items-center justify-center" />
            </div>
            <div className="w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-t-[28px] border-t-[#d4af37] -mt-1 relative z-10" />
          </div>

        </div>

      </div>

      {/* 5. COOLDOWN BANNER OR 3D CASINO GOLD CTA SPIN BUTTON */}
      <div className="w-full max-w-md px-4 pb-4 pt-1 relative z-20 space-y-2">
        
        {hasSpunToday ? (
          <div className="p-3 bg-[#130d07] border-2 border-amber-500/40 rounded-2xl text-center space-y-1.5 shadow-xl">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-black text-xs uppercase tracking-wide">
              <Lock size={15} className="text-amber-400" />
              <span>Giro Diário Realizado com Sucesso</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-snug">
              Você já usou seu 1 giro diário hoje. O próximo giro gratuito será liberado em:
            </p>
            <div className="inline-flex items-center gap-1.5 bg-black/80 border border-amber-500/40 px-3 py-1.5 rounded-xl font-mono text-sm font-black text-amber-300">
              <Clock size={14} className="text-amber-400 animate-spin" />
              <span>{timeUntilMidnight}</span>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs uppercase rounded-xl transition cursor-pointer"
            >
              Voltar ao Cassino
            </button>
          </div>
        ) : (
          <div className="p-2 rounded-[28px] bg-gradient-to-b from-[#5c3e03] via-[#241500] to-[#0d0700] border-2 border-[#ffd700]/70 shadow-[0_20px_45px_rgba(0,0,0,0.95)]">
            <button
              onClick={handleSpinWheel}
              disabled={isSpinning}
              className={`w-full h-16 rounded-[22px] font-black text-xl uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer relative overflow-hidden select-none border-2 border-[#fffde0] ${
                isSpinning
                  ? 'bg-gradient-to-b from-[#ffec85] via-[#d4990d] to-[#734a00] text-black translate-y-1 shadow-[0_2px_0_#4a2e00] opacity-90 cursor-wait'
                  : 'bg-gradient-to-b from-[#fff399] via-[#f7b700] to-[#a36200] text-black shadow-[0_8px_0_#4a2e00,0_15px_30px_rgba(245,158,11,0.8),inset_0_3px_6px_rgba(255,255,255,0.95),inset_0_-4px_8px_rgba(120,60,0,0.6)] hover:brightness-110 active:translate-y-1.5 active:shadow-[0_2px_0_#4a2e00]'
              }`}
            >
              {/* Top Gloss Specular Highlight */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent pointer-events-none rounded-t-[20px]" />

              <Zap size={26} className="fill-black stroke-[3] shrink-0 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]" />
              <span className="font-black text-xl tracking-wide whitespace-nowrap drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                {isSpinning ? 'GIRANDO A ROLETA...' : 'GIRAR MEU GIRO DIÁRIO! 🎁'}
              </span>
            </button>
          </div>
        )}

      </div>

      {/* RESULT MODAL */}
      {showResultModal && resultPrize && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200 select-none">
          <div className="w-full max-w-xs bg-gradient-to-b from-[#2a1b08] via-[#120801] to-black border-2 border-amber-400 rounded-3xl p-6 text-center shadow-[0_0_90px_rgba(245,158,11,0.95)] relative space-y-4">
            
            {resultPrize.isWin ? (
              <>
                <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-300 text-black rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(245,158,11,0.9)] text-3xl animate-bounce">
                  🎉
                </div>

                <h3 className="text-lg font-black text-amber-100 uppercase tracking-tight">
                  PARABÉNS! VOCÊ GANHOU!
                </h3>

                <div className="py-4 px-4 bg-black/85 rounded-2xl border-2 border-amber-400/60 text-center space-y-2">
                  {resultPrize.image ? (
                    <img
                      src={resultPrize.image}
                      alt={resultPrize.label}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 object-contain rounded-xl mx-auto drop-shadow-lg"
                    />
                  ) : (
                    <div className="text-3xl">🎁</div>
                  )}
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Seu Prêmio da Roleta</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono block drop-shadow">
                    {resultPrize.label}
                  </span>
                  {resultPrize.type === 'cash' && (
                    <span className="text-[11px] text-emerald-300 font-bold block">
                      ✅ Creditado instantaneamente no seu saldo Pix!
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 font-medium">
                  Seu 1 giro diário foi utilizado. Próximo giro liberado amanhã às 00:00!
                </p>

                <div className="p-1 rounded-2xl bg-gradient-to-b from-[#593b04] to-[#120801] border border-[#ffd700]/50">
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      onClose();
                    }}
                    className="w-full py-3.5 bg-gradient-to-b from-[#fff399] via-[#f7b700] to-[#a36200] border-2 border-[#fffde0] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_6px_0_#4a2e00,0_12px_20px_rgba(245,158,11,0.6),inset_0_2px_4px_rgba(255,255,255,0.9)] hover:brightness-110 active:translate-y-1 active:shadow-[0_1px_0_#4a2e00] transition cursor-pointer"
                  >
                    VOLTAR AO CASSINO 🎰
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-950/90 border-2 border-red-500/60 text-red-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.5)] text-3xl">
                  <Frown size={32} />
                </div>

                <h3 className="text-lg font-black text-red-400 uppercase tracking-tight">
                  NÃO FOI DESSA VEZ!
                </h3>

                <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                  Seu 1 giro diário foi utilizado hoje. Volte amanhã às 00:00 para girar a roleta novamente e concorrer a iPhones e Pix!
                </p>

                <div className="p-2 bg-black/60 rounded-xl border border-amber-500/30 text-[11px] font-mono text-amber-300 font-bold">
                  ⏳ Próximo giro em: {timeUntilMidnight}
                </div>

                <div className="p-1 rounded-2xl bg-gradient-to-b from-[#5c3e03] to-[#120801] border border-[#ffd700]/60">
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      onClose();
                    }}
                    className="w-full py-3.5 bg-gradient-to-b from-[#fff399] via-[#f7b700] to-[#a36200] border-2 border-[#fffde0] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_6px_0_#4a2e00,0_12px_20px_rgba(245,158,11,0.7),inset_0_2px_4px_rgba(255,255,255,0.95)] hover:brightness-110 active:translate-y-1 active:shadow-[0_1px_0_#4a2e00] transition cursor-pointer"
                  >
                    VOLTAR AO CASSINO 🎰
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
