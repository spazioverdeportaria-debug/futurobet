import React from 'react';
import { ShieldAlert, Wrench, Clock, MessageSquare, ExternalLink, RefreshCw } from 'lucide-react';

interface MaintenanceScreenProps {
  message?: string;
  onAdminAccess?: () => void;
}

export default function MaintenanceScreen({ message, onAdminAccess }: MaintenanceScreenProps) {
  const supportPhone = '42999687965';
  const supportMessage = encodeURIComponent('Olá, preciso de suporte no FuturoBet.');
  const whatsappUrl = `https://wa.me/55${supportPhone}?text=${supportMessage}`;

  return (
    <div className="min-h-screen bg-[#07080b] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full bg-[#0e1017]/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-center space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center bg-zinc-900/90 px-3.5 py-1.5 rounded-2xl border border-zinc-800 shadow-inner">
            <span className="text-white font-black text-lg tracking-tight">FUTURO</span>
            <span className="text-amber-400 font-black text-lg tracking-tight ml-1">BET</span>
          </div>
        </div>

        {/* Maintenance Icon */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping opacity-75" />
          <div className="relative w-20 h-20 bg-gradient-to-b from-amber-500/20 to-yellow-500/10 border border-amber-500/60 rounded-full flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
            <Wrench className="w-9 h-9 stroke-[2.2] animate-pulse" />
          </div>
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Manutenção Programada</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
            Sistema Temporariamente em Manutenção
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
            {message || 'Estamos realizando melhorias programadas em nossos servidores para garantir maior velocidade e segurança em seus saques e jogos. Voltamos em instantes!'}
          </p>
        </div>

        {/* Features improved */}
        <div className="grid grid-cols-2 gap-3 pt-2 text-left">
          <div className="bg-[#141620] border border-zinc-800 rounded-2xl p-3 space-y-1">
            <span className="text-xs font-bold text-amber-400">⚡ Saques e Depósitos</span>
            <p className="text-[11px] text-zinc-400">Otimização de rotas de pagamento PIX</p>
          </div>
          <div className="bg-[#141620] border border-zinc-800 rounded-2xl p-3 space-y-1">
            <span className="text-xs font-bold text-emerald-400">🛡️ Segurança Máxima</span>
            <p className="text-[11px] text-zinc-400">Atualização de proteção de dados</p>
          </div>
        </div>

        {/* Direct WhatsApp Support */}
        <div className="pt-2 space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Falar com Suporte no WhatsApp (42) 99968-7965</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => window.location.reload()}
            className="text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition cursor-pointer py-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recarregar página para verificar status</span>
          </button>
        </div>

        {/* Discreet admin link */}
        <div className="pt-2 border-t border-zinc-900/80">
          <button
            onClick={onAdminAccess || (() => { window.location.pathname = '/admin'; })}
            className="text-[11px] text-zinc-600 hover:text-zinc-400 transition cursor-pointer"
          >
            Acesso Restrito da Administração (ADM)
          </button>
        </div>

      </div>
    </div>
  );
}
