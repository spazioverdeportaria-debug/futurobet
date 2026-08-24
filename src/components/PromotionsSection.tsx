import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Coins, 
  Zap, 
  Share2, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Flame,
  Percent,
  Gift,
  Trophy,
  Users,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Wallet
} from 'lucide-react';

interface PromotionsSectionProps {
  balance: number;
  onUpdateBalance?: (newBalance: number) => void;
  onOpenDeposit: () => void;
  onOpenWheel?: () => void;
}

export default function PromotionsSection({ 
  balance, 
  onUpdateBalance, 
  onOpenDeposit 
}: PromotionsSectionProps) {
  const AFFILIATE_COMMISSION_KEY = 'futurobet_affiliate_commission_val';
  const AFFILIATE_REFERRED_COUNT_KEY = 'futurobet_affiliate_referred_count';
  
  const inviteCode = 'FUTURO 371 525';
  const inviteLink = `https://futurobet.vip/r/371525`;

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🔥 Use meu código de convite *${inviteCode}* na FuturoBet e ganhe bônus de boas-vindas no primeiro depósito! Acesse: ${inviteLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `🔥 Use meu código *${inviteCode}* na FuturoBet e receba bônus de boas-vindas! ${inviteLink}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${text}`, '_blank');
  };

  return (
    <div className="w-full max-w-md mx-auto px-3.5 pt-2 pb-24 space-y-3.5 select-none animate-in fade-in duration-200">
      
      {/* 🌟 1. BANNER PRINCIPAL FUTUROBET LUXURY GOLD CARD */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#161f33] via-[#0d1527] to-[#080d19] p-5 text-center shadow-[0_12px_35px_rgba(0,0,0,0.8)] border-2 border-amber-400/40">
        
        {/* Glow Dourado de Fundo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          {/* Badge Superior */}
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-yellow-500/20 text-amber-300 text-[11px] font-black uppercase px-4 py-1.5 rounded-full shadow-inner border border-amber-400/50 tracking-wider">
            <Flame size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
            <span>SUPER BÔNUS CONVIDE & GANHE</span>
            <Coins size={14} className="text-amber-400 fill-amber-400" />
          </div>

          {/* Destaque Central */}
          <div className="rounded-2xl bg-[#060b14]/90 border border-amber-400/30 p-4 shadow-[0_8px_20px_rgba(0,0,0,0.6)] space-y-1.5">
            <span className="inline-block bg-amber-400/15 text-amber-300 border border-amber-400/40 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
              COMISSÃO VITALÍCIA
            </span>
            
            <div className="flex items-center justify-center gap-2 pt-0.5">
              <span className="text-white text-xl sm:text-2xl font-black tracking-tight">Ganhe</span>
              <span className="text-4xl sm:text-5xl font-black bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] font-sans tracking-tight">
                5%
              </span>
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">DE TUDO</span>
            </div>

            <div className="text-xs sm:text-[13px] font-black text-amber-300 uppercase tracking-wide">
              QUE SEUS AMIGOS APOSTAREM NO CASSINO!
            </div>
          </div>

          {/* Copy Inferior Elegante e Nítida */}
          <p className="text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 pt-0.5">
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <span>Receba comissões automáticas para sempre a cada aposta!</span>
          </p>
        </div>
      </div>

      {/* 🎟️ 2. CARD DO CÓDIGO DE CONVITE (DESIGN LUXO ESCURO INTEGRADO) */}
      <div className="rounded-2xl bg-[#0b1322] border border-amber-400/30 p-4 shadow-[0_8px_25px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Seu Código de Convite
          </span>
          <div className="text-base sm:text-lg font-black text-amber-300 tracking-wider font-mono">
            {inviteCode}
          </div>
        </div>

        <button
          onClick={copyToClipboard}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all duration-200 active:scale-95 cursor-pointer shadow-lg flex items-center gap-1.5 shrink-0 ${
            copied
              ? 'bg-emerald-500 text-black shadow-emerald-500/40'
              : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-black shadow-amber-500/30'
          }`}
        >
          {copied ? <Check size={15} className="stroke-[3]" /> : <Copy size={15} />}
          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>

      {/* 📋 3. "COMO FUNCIONA?" (DESIGN ESCURO ELEGANTE) */}
      <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-4 space-y-3 shadow-[0_8px_25px_rgba(0,0,0,0.5)]">
        <h3 className="text-center text-xs font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
          <Award size={15} className="text-amber-400" />
          <span>COMO FUNCIONA O PROGRAMA?</span>
        </h3>

        <div className="space-y-2">
          {/* Passo 1 */}
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                <Share2 size={18} />
              </div>
              <div>
                <div className="text-xs font-black text-white">
                  1. Convide seus Amigos
                </div>
                <div className="text-[11px] text-slate-400">
                  Compartilhe seu código ou link oficial
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20 shrink-0 uppercase">
              Ilimitado
            </span>
          </div>

          {/* Passo 2 */}
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Percent size={18} />
              </div>
              <div>
                <div className="text-xs font-black text-white">
                  2. Ganhe 5% de Cada Aposta
                </div>
                <div className="text-[11px] text-slate-400">
                  Em Slots, Roleta, Aviator e Esportes
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20 shrink-0 uppercase">
              5% Vitalício
            </span>
          </div>

          {/* Passo 3 */}
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-400/10 border border-purple-400/30 text-purple-400 flex items-center justify-center shrink-0">
                <Zap size={18} />
              </div>
              <div>
                <div className="text-xs font-black text-white">
                  3. Saque Instantâneo via PIX
                </div>
                <div className="text-[11px] text-slate-400">
                  Comissão liberada para saque 24h por dia
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black text-purple-300 bg-purple-400/10 px-2 py-1 rounded-lg border border-purple-400/20 shrink-0 uppercase">
              PIX 24/7
            </span>
          </div>
        </div>
      </div>

      {/* 📲 5. BARRA DE COMPARTILHAMENTO RÁPIDO */}
      <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-3.5 shadow-[0_8px_25px_rgba(0,0,0,0.5)]">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-3">
          Compartilhe agora e comece a lucrar
        </span>

        <div className="grid grid-cols-4 gap-2 text-center">
          {/* WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="flex flex-col items-center gap-1.5 group cursor-pointer active:scale-95"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <MessageCircle size={20} className="fill-white" />
            </div>
            <span className="text-[10px] font-bold text-slate-300">WhatsApp</span>
          </button>

          {/* Telegram */}
          <button
            onClick={handleShareTelegram}
            className="flex flex-col items-center gap-1.5 group cursor-pointer active:scale-95"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#0088cc] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <Send size={18} className="fill-white" />
            </div>
            <span className="text-[10px] font-bold text-slate-300">Telegram</span>
          </button>

          {/* Copiar Link */}
          <button
            onClick={copyToClipboard}
            className="flex flex-col items-center gap-1.5 group cursor-pointer active:scale-95"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#142036] border border-slate-700 text-amber-400 flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <Copy size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-300">Copiar</span>
          </button>

          {/* Mais Opções */}
          <button
            onClick={handleShareWhatsApp}
            className="flex flex-col items-center gap-1.5 group cursor-pointer active:scale-95"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#142036] border border-slate-700 text-slate-300 flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <Share2 size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-300">Mais</span>
          </button>
        </div>
      </div>

    </div>
  );
}
