import React, { useState } from 'react';
import { 
  X, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCPF, validateCPF } from '../utils/cpfValidator';
import { soundEngine } from '../utils/audio';

interface CashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'deposit' | 'withdraw';
  onOpenDepositPix: () => void;
  balance: number;
  onUpdateBalance: (newBal: number) => void;
}

export default function CashierModal({
  isOpen,
  onClose,
  initialTab = 'withdraw',
  onOpenDepositPix,
  balance,
  onUpdateBalance
}: CashierModalProps) {
  const { account } = useAuth();
  const [tab, setTab] = useState<'deposit' | 'withdraw'>(initialTab);

  // Estados de Saque
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'phone' | 'email' | 'random'>('cpf');
  const [pixKeyValue, setPixKeyValue] = useState<string>(() => {
    return account?.cpf ? formatCPF(account.cpf) : '';
  });
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState<boolean>(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [20, 50, 100];

  const handleExecuteWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(false);

    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) {
      setWithdrawError('Informe um valor de saque válido.');
      return;
    }

    if (val < 20) {
      setWithdrawError('Valor mínimo de saque: R$ 20,00');
      return;
    }

    if (val > balance) {
      setWithdrawError(`Saldo insuficiente (Disponível: R$ ${balance.toFixed(2)})`);
      return;
    }

    if (!pixKeyValue.trim()) {
      setWithdrawError('Informe sua Chave PIX.');
      return;
    }

    if (pixKeyType === 'cpf') {
      const cleanCpf = pixKeyValue.replace(/\D/g, '');
      if (!validateCPF(cleanCpf)) {
        setWithdrawError('CPF inválido. Verifique os dígitos digitados.');
        return;
      }
    }

    setIsProcessingWithdraw(true);

    setTimeout(() => {
      setIsProcessingWithdraw(false);
      const newBal = balance - val;
      onUpdateBalance(newBal);
      setWithdrawSuccess(true);
      soundEngine.playCoinDrop();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0d1117] border border-slate-800 rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Glow Superior Suave */}
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex items-center font-black text-base tracking-wider uppercase">
              <span>FUTURO</span>
              <span className="text-amber-400 ml-0.5">BET</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/50">
              CARTEIRA
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Abas Alternar: DEPOSITAR / SACAR */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800/90 my-3.5 relative z-10">
          <button
            type="button"
            onClick={() => {
              setTab('deposit');
              onClose();
              onOpenDepositPix();
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'deposit'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownCircle size={14} />
            <span>Depositar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('withdraw');
              setWithdrawSuccess(false);
              setWithdrawError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'withdraw'
                ? 'bg-emerald-400 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpCircle size={14} />
            <span>Sacar PIX</span>
          </button>
        </div>

        {/* CONTEÚDO DA ABA SACAR */}
        {tab === 'withdraw' && (
          <div className="relative z-10">
            
            {withdrawSuccess ? (
              <div className="py-6 text-center space-y-3.5 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-400/40 rounded-full mx-auto flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>

                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wide">
                    Saque Solicitado com Sucesso!
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Transferindo <strong className="text-emerald-400">R$ {parseFloat(withdrawAmount).toFixed(2)}</strong> via PIX.
                  </p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-left text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chave PIX:</span>
                    <span className="font-mono text-white truncate max-w-[170px]">{pixKeyValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Previsão:</span>
                    <span className="text-emerald-400 font-semibold">1 a 3 minutos</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setWithdrawSuccess(false);
                    setWithdrawAmount('');
                    onClose();
                  }}
                  className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={handleExecuteWithdraw} className="space-y-3.5">
                
                {/* Saldo Disponível Minimalista */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400">Saldo Disponível</span>
                  <span className="text-sm font-black text-white font-mono">
                    R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {withdrawError && (
                  <div className="p-2 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle size={14} className="shrink-0 text-rose-400" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                {/* Valor do Saque com Atalhos Rápidos */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Quanto deseja sacar?
                    </label>
                    <span className="text-[10px] text-slate-400">Mín: R$ 20</span>
                  </div>

                  <div className="relative mb-2">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">R$</span>
                    <input
                      type="number"
                      placeholder="0,00"
                      min={20}
                      max={balance}
                      step="any"
                      value={withdrawAmount}
                      onChange={(e) => {
                        setWithdrawAmount(e.target.value);
                        setWithdrawError(null);
                      }}
                      className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-400 rounded-xl py-2 pl-9 pr-14 text-white font-bold text-sm focus:outline-none transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawAmount(balance.toString());
                        setWithdrawError(null);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 transition"
                    >
                      MÁX
                    </button>
                  </div>

                  {/* Atalhos Rápidos */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setWithdrawAmount(amt.toString());
                          setWithdrawError(null);
                        }}
                        className={`py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                          parseFloat(withdrawAmount) === amt
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        + R$ {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipo de Chave & Campo */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Chave PIX
                    </label>
                    <div className="flex gap-1">
                      {[
                        { id: 'cpf', label: 'CPF' },
                        { id: 'phone', label: 'Celular' },
                        { id: 'email', label: 'E-mail' },
                        { id: 'random', label: 'Aleatória' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setPixKeyType(item.id as any);
                            if (item.id === 'cpf' && account?.cpf) {
                              setPixKeyValue(formatCPF(account.cpf));
                            } else if (item.id === 'phone' && account?.phone) {
                              setPixKeyValue(account.phone);
                            } else {
                              setPixKeyValue('');
                            }
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition ${
                            pixKeyType === item.id
                              ? 'bg-slate-700 text-white font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <CreditCard size={14} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={pixKeyType === 'cpf' ? '000.000.000-00' : 'Sua chave PIX'}
                      value={pixKeyValue}
                      onChange={(e) => {
                        if (pixKeyType === 'cpf') {
                          setPixKeyValue(formatCPF(e.target.value));
                        } else {
                          setPixKeyValue(e.target.value);
                        }
                        setWithdrawError(null);
                      }}
                      className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono"
                    />
                  </div>
                </div>

                {/* Botão de Saque */}
                <button
                  type="submit"
                  disabled={isProcessingWithdraw || balance < 20}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap size={14} className="fill-current" />
                  <span>
                    {isProcessingWithdraw
                      ? 'Processando...'
                      : balance < 20
                      ? 'Saldo mínimo R$ 20,00'
                      : `Sacar R$ ${withdrawAmount ? parseFloat(withdrawAmount).toFixed(2) : '0,00'}`}
                  </span>
                </button>

                {/* Nota de Segurança Sutil */}
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 pt-1">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>PIX Instantâneo 24h</span>
                </div>

              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
