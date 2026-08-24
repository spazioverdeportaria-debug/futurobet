import React, { useState } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  LogOut, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Sparkles, 
  Lock, 
  Phone, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle,
  Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCPF } from '../utils/cpfValidator';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenWheel: () => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  onLogout,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenWheel
}: UserProfileModalProps) {
  const { account } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const getInitials = (name?: string) => {
    if (!name) return 'FB';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onClose();
    onLogout();
  };

  const maskedCpf = account?.cpf 
    ? `${account.cpf.slice(0, 3)}.***.***-${account.cpf.slice(-2)}` 
    : '000.***.***-00';

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      
      {/* Modal Principal */}
      <div className="w-full max-w-sm bg-gradient-to-b from-[#130d05] via-[#0d0904] to-[#080502] border border-amber-500/40 rounded-3xl p-5 text-white shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden flex flex-col">
        
        {/* Glow Superior */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-amber-500/15 to-transparent pointer-events-none rounded-t-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/90 relative z-10">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-wider uppercase font-sans text-white">
              MINHA <span className="text-amber-400">CONTA</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black">
              <ShieldCheck size={11} /> Verificado
            </span>
          </div>

          <button
            onClick={() => {
              setShowLogoutConfirm(false);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* CONFIRMAÇÃO DE SAÍDA SOBREPOSTA */}
        {showLogoutConfirm ? (
          <div className="py-6 text-center space-y-4 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/40 rounded-full mx-auto flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Deseja realmente sair?
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                Seu saldo de <strong className="text-amber-400 font-mono">R$ {(account?.balance || 0).toFixed(2)}</strong> e progresso ficarão guardados com segurança no sistema.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {/* Botão Cancelar / Continuar Jogando */}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                CONTINUAR JOGANDO
              </button>

              {/* Botão Confirmar Saída */}
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="w-full py-2.5 bg-zinc-900/80 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 font-bold text-xs uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut size={13} />
                <span>Sim, Desconectar Minha Conta</span>
              </button>
            </div>
          </div>
        ) : (
          /* CONTEÚDO PRINCIPAL DO PERFIL */
          <div className="space-y-3.5 mt-3 relative z-10">
            
            {/* Card do Usuário */}
            <div className="p-3.5 bg-black/70 border border-amber-500/25 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow shrink-0">
                <div className="w-full h-full bg-[#140b03] rounded-full flex items-center justify-center text-sm font-black text-amber-300">
                  {getInitials(account?.name)}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-white truncate">
                  {account?.name || 'Jogador FuturoBet'}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                  <span>CPF: {maskedCpf}</span>
                </div>
                {account?.phone && (
                  <span className="text-[10px] text-zinc-500 block truncate">
                    {account.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Saldo da Conta */}
            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Saldo em Conta
                </span>
                <span className="text-lg font-black text-amber-400 font-mono">
                  R$ {(account?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDeposit();
                  }}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-yellow-300 text-black font-black text-[11px] uppercase rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowDownCircle size={12} />
                  <span>Depósito</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWithdraw();
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] uppercase rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowUpCircle size={12} />
                  <span>Saque</span>
                </button>
              </div>
            </div>

            {/* Ações Extras */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWheel();
                }}
                className="p-2.5 bg-black/60 border border-amber-500/30 hover:border-amber-400 rounded-xl text-left transition cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-0.5">
                  <Gift size={13} />
                  <span>Roleta Diária</span>
                </div>
                <span className="text-[10px] text-zinc-400">Gire e ganhe prêmios</span>
              </button>

              <div className="p-2.5 bg-black/60 border border-zinc-800 rounded-xl text-left">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-0.5">
                  <ShieldCheck size={13} />
                  <span>Proteção 256-Bit</span>
                </div>
                <span className="text-[10px] text-zinc-400">Dados seguros LGPD</span>
              </div>
            </div>

            {/* Botão Sair com Confirmação */}
            <div className="pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <LogOut size={14} />
                <span>Sair da Minha Conta</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
