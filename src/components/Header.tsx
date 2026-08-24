import React from 'react';
import { Plus, UserPlus, User, LogOut } from 'lucide-react';

interface HeaderProps {
  balance: number;
  onOpenDeposit: () => void;
  onOpenWithdraw?: () => void;
  onOpenWheel?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  currentTab?: string;
  isLoggedIn?: boolean;
  userName?: string;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}

export default function Header({ 
  balance, 
  onOpenDeposit, 
  onOpenWithdraw,
  currentTab,
  isLoggedIn = false,
  userName,
  onOpenLogin,
  onOpenRegister,
  onOpenProfile,
  onLogout
}: HeaderProps) {
  const isSportsMode = currentTab === 'futebol';

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className={`w-full ${
      isSportsMode 
        ? 'bg-[#050b14]/98 border-b-2 border-[#1b2b48]' 
        : 'bg-[#0a0702]/95 border-b-2 border-[#d4af37]/40'
    } backdrop-blur-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sticky top-0 z-40 shadow-[0_8px_30px_rgba(0,0,0,0.95)] select-none transition-colors duration-300`}>
      
      {/* 1. MASTER LOGO FUTUROBET (PURO TEXTO) */}
      <div 
        className="flex items-center cursor-pointer group shrink-0 py-0.5"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        {/* Typography: FUTURO in White, BET in Yellow */}
        <div className="flex items-center font-black text-xl sm:text-2xl tracking-tighter uppercase font-sans leading-none select-none">
          <span className="text-white font-black drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]">
            FUTURO
          </span>
          <span className="text-amber-400 font-black drop-shadow-[0_2px_12px_rgba(251,191,36,0.7)] ml-0.5">
            BET
          </span>
        </div>
      </div>

      {/* 2. DIREITA: CONDICIONAL (VISITANTE: SOMENTE CADASTRE-SE | LOGADO: AVATAR + SALDO COM '+') */}
      <div className="flex items-center gap-2 shrink-0">
        {!isLoggedIn ? (
          /* ESTADO VISITANTE / PRIMEIRA VEZ: BOTÃO CADASTRE-SE PREMIUM GOLD */
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenLogin}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-black/60 border border-zinc-700/60 transition cursor-pointer active:scale-95"
            >
              Entrar
            </button>
            <button
              onClick={onOpenRegister || onOpenLogin}
              className="px-3.5 py-1.5 rounded-full text-xs font-black text-[#0a0702] bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-200 shadow-[0_0_18px_rgba(251,191,36,0.5),inset_0_1px_2px_rgba(255,255,255,0.8)] border border-amber-200/90 hover:brightness-105 transition-all duration-200 cursor-pointer flex items-center gap-1 active:scale-95 select-none tracking-tight"
              title="Criar nova conta"
            >
              <UserPlus size={13} className="stroke-[3] text-[#0a0702]" />
              <span className="font-sans font-black">Cadastre-se</span>
            </button>
          </div>
        ) : (
          /* ESTADO AUTENTICADO: SALDO COM BOTÃO '+' INTEGRADO + AVATAR COM LOGOUT */
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenDeposit}
              className={`group cursor-pointer active:scale-95 transition-all duration-150 rounded-full p-1 pl-3 pr-1.5 flex items-center gap-2 border shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.6)] ${
                isSportsMode
                  ? 'bg-gradient-to-r from-[#070e1b] to-[#0c1930] border-[#1f3760] hover:border-sky-400'
                  : 'bg-gradient-to-r from-[#140e03] to-[#241703] border-[#d4af37]/60 hover:border-[#ffe484]'
              }`}
              title="Clique para adicionar saldo"
            >
              {/* Valor do Saldo */}
              <div className="flex items-baseline gap-1">
                <span className={`text-[11px] font-black ${isSportsMode ? 'text-sky-400' : 'text-amber-400'} font-mono`}>
                  R$
                </span>
                <span className="text-sm sm:text-base font-black text-white font-mono tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Botão circular '+' integrado para adicionar saldo */}
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105 ${
                isSportsMode
                  ? 'bg-gradient-to-b from-[#4ade80] to-[#16a34a] text-black border border-[#86efac]'
                  : 'bg-gradient-to-b from-[#fde047] via-[#eab308] to-[#ca8a04] text-black border border-[#fef08a]'
              }`}>
                <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3.5]" />
              </div>
            </button>

            {/* Avatar do Usuário */}
            <div 
              onClick={onOpenProfile || onLogout}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow cursor-pointer active:scale-95 group relative"
              title="Minha Conta"
            >
              <div className="w-full h-full bg-[#120a02] rounded-full flex items-center justify-center text-[10px] font-black text-amber-300">
                {getInitials(userName)}
              </div>
            </div>
          </div>
        )}
      </div>

    </header>
  );
}
