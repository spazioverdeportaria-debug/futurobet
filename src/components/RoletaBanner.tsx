import React from 'react';
import { Sparkles, Zap, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import wheelDiscImg from '../assets/images/wheel_disc_3d_1785703882307.jpg';
import { useAuth } from '../context/AuthContext';

interface RoletaBannerProps {
  onOpenWheel: () => void;
}

export default function RoletaBanner({ onOpenWheel }: RoletaBannerProps) {
  const { account } = useAuth();
  const todayStr = new Date().toISOString().slice(0, 10);
  const lastSpin = account?.lastDailySpin || localStorage.getItem('vegasbet_last_daily_spin');
  const hasSpunToday = lastSpin === todayStr;

  return (
    <div className="w-full px-3 pt-2 select-none">
      <div
        onClick={onOpenWheel}
        className="w-full relative bg-gradient-to-r from-[#140b24] via-[#0d0918] to-[#120a20] border border-[#2b1b47] hover:border-purple-400/70 rounded-xl shadow-md transition-all duration-200 cursor-pointer overflow-hidden group p-3"
      >
        <div className="relative z-20 flex items-center justify-between gap-3">
          
          {/* LEFT COLUMN: Clean Copy, Badges & CTA Button */}
          <div className="flex-1 space-y-1">
            
            {/* Top Badge Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {hasSpunToday ? (
                <span className="text-[8.5px] font-bold uppercase bg-slate-800/80 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  GIRO DE HOJE REALIZADO
                </span>
              ) : (
                <span className="text-[8.5px] font-black uppercase bg-amber-400 text-black px-2 py-0.5 rounded-md flex items-center gap-1 tracking-tight">
                  <Sparkles className="w-2.5 h-2.5 fill-black stroke-black" />
                  1 GIRO DISPONÍVEL
                </span>
              )}

              <span className="text-[8.5px] font-bold uppercase bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                GRÁTIS
              </span>
            </div>

            {/* Main Title & Subtitle */}
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight leading-tight">
                Roleta de Prêmios Diária
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium leading-snug mt-0.5">
                {hasSpunToday
                  ? 'Você já girou hoje! Clique para ver a roleta e o tempo restante.'
                  : 'Gire sua rodada diária grátis e concorra a bônus PIX e prêmios.'}
              </p>
            </div>

            {/* Action CTA Button */}
            <div className="pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenWheel();
                }}
                className={`text-black font-black text-[10px] sm:text-xs px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                  hasSpunToday
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-105 text-black shadow-md'
                }`}
              >
                {hasSpunToday ? (
                  <>
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span>Ver Roleta ⏳</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 fill-black stroke-black" />
                    <span>Girar Agora 🚀</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Clean 3D Wheel Disc */}
          <div className="relative w-16 sm:w-20 h-16 sm:h-20 shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-purple-400/40 shadow-lg overflow-hidden group-hover:rotate-45 transition-transform duration-700 ease-out p-0.5 bg-purple-950/40">
              <img
                src={wheelDiscImg}
                alt="Roleta 3D"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full animate-[spin_20s_linear_infinite]"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
