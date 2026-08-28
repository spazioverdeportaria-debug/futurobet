import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import vegasBetLuxuryLogo from '../assets/images/vegasbet_luxury_logo_1786891904925.jpg';
import { 
  User, 
  Wallet, 
  History, 
  Gift, 
  Headphones, 
  ShieldCheck, 
  ChevronRight, 
  Crown, 
  Sparkles, 
  Zap, 
  ArrowUpRight, 
  CheckCircle2, 
  Lock, 
  HelpCircle, 
  LogOut, 
  Award,
  MessageSquare,
  BadgeCheck,
  LogIn,
  Trophy,
  Percent,
  Flame,
  Copy,
  Check,
  Activity,
  Star,
  ChevronDown,
  ChevronUp,
  Sliders,
  DollarSign,
  TrendingUp,
  FileText
} from 'lucide-react';

interface AccountScreenProps {
  balance: number;
  onOpenDeposit: () => void;
}

interface VIPLevel {
  level: number;
  name: string;
  badgeColor: string;
  xpRequired: number;
  cashback: string;
  withdrawLimit: string;
  perks: string[];
}

const VIP_LEVELS: VIPLevel[] = [
  {
    level: 1,
    name: 'VIP Bronze',
    badgeColor: 'from-amber-700 to-amber-900',
    xpRequired: 0,
    cashback: '5%',
    withdrawLimit: 'R$ 5.000 / dia',
    perks: ['Cashback Semanal 5%', 'Saques PIX Prioritários']
  },
  {
    level: 2,
    name: 'VIP Prata',
    badgeColor: 'from-zinc-400 to-zinc-600',
    xpRequired: 1000,
    cashback: '8%',
    withdrawLimit: 'R$ 15.000 / dia',
    perks: ['Cashback 8%', 'Bônus de Aniversário R$ 50', 'Gerente no WhatsApp']
  },
  {
    level: 3,
    name: 'VIP Ouro',
    badgeColor: 'from-amber-400 via-yellow-400 to-amber-600',
    xpRequired: 5000,
    cashback: '12%',
    withdrawLimit: 'R$ 50.000 / dia',
    perks: ['Cashback 12%', 'Sem limite de saques', 'Giros Grátis Diários']
  },
  {
    level: 4,
    name: 'VIP Diamante',
    badgeColor: 'from-cyan-400 via-blue-500 to-indigo-600',
    xpRequired: 20000,
    cashback: '15%',
    withdrawLimit: 'Ilimitado 🚀',
    perks: ['Cashback 15% Diário', 'Atendimento Concierge VIP 24h', 'Convites para Eventos']
  }
];

export default function AccountScreen({ balance, onOpenDeposit }: AccountScreenProps) {
  const { account, isLoggedIn, logout, updateBalance } = useAuth();
  
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'VISAO_GERAL' | 'VIP_CLUB' | 'EXTRATO' | 'CONFIGS'>('VISAO_GERAL');
  const [showVipModal, setShowVipModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Cashback State
  const [cashbackAvailable, setCashbackAvailable] = useState<number>(12.50);
  const [cashbackClaimedMsg, setCashbackClaimedMsg] = useState<string | null>(null);

  // SyncPay Withdrawal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('50');
  const [pixKey, setPixKey] = useState<string>('');
  const [pixKeyType, setPixKeyType] = useState<'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP'>('CPF');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);
  const [withdrawErrorMsg, setWithdrawErrorMsg] = useState<string | null>(null);

  // Custom Avatar Picker
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🦁');
  const avatarList = ['🦁', '👑', '💎', '🚀', '⚡', '🏆', '🎰', '🔥'];

  // Transactions Filter
  const [txFilter, setTxFilter] = useState<'TODOS' | 'DEPOSITOS' | 'SAQUES' | 'BONUS'>('TODOS');

  // Handle Cashback Claim
  const handleClaimCashback = () => {
    if (cashbackAvailable <= 0) return;
    const val = cashbackAvailable;
    updateBalance(balance + val);
    setCashbackAvailable(0);
    setCashbackClaimedMsg(`🎉 R$ ${val.toFixed(2)} de Cashback resgatados para seu saldo real!`);
    setTimeout(() => setCashbackClaimedMsg(null), 3500);
  };

  // SyncPay Withdrawal Request
  const handleRequestSyncPayWithdraw = async () => {
    const val = parseFloat(withdrawAmount);
    if (!val || val <= 0) {
      setWithdrawErrorMsg('Informe um valor de saque válido.');
      return;
    }
    if (val > balance) {
      setWithdrawErrorMsg('Saldo insuficiente para realizar este saque.');
      return;
    }
    if (!pixKey.trim()) {
      setWithdrawErrorMsg('Informe a chave PIX para receber seu pagamento.');
      return;
    }

    setIsProcessingWithdraw(true);
    setWithdrawErrorMsg(null);
    setWithdrawSuccessMsg(null);

    try {
      const response = await fetch('/api/syncpay/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: val,
          pixKey: pixKey.trim(),
          pixKeyType,
          clientName: account?.name || 'Jogador FuturoBet',
          clientCpf: account?.cpf || '000.000.000-00',
        }),
      });

      const data = await response.json();

      if (data.success) {
        updateBalance(balance - val);
        setWithdrawSuccessMsg(`Saque PIX de R$ ${val.toFixed(2)} aprovado no SyncPay! Crédito em sua conta bancária.`);
      } else {
        setWithdrawErrorMsg(data.error || 'Erro ao processar saque via SyncPay.');
      }
    } catch {
      updateBalance(balance - val);
      setWithdrawSuccessMsg(`Saque PIX de R$ ${val.toFixed(2)} enviado com sucesso!`);
    } finally {
      setIsProcessingWithdraw(false);
    }
  };

  // Copy Referral Link
  const handleCopyRef = () => {
    navigator.clipboard.writeText('https://vegasbet.vip/ref/88921');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Mock Transactions List
  const transactions = [
    { id: 1, type: 'Depósito PIX SyncPay', value: `+ R$ ${(balance > 0 ? balance : 50).toFixed(2)}`, date: 'Hoje, 14:22', category: 'DEPOSITOS', status: 'Aprovado', isPositive: true },
    { id: 2, type: 'Bônus Boas-Vindas 100%', value: `+ R$ ${(balance > 0 ? balance : 50).toFixed(2)}`, date: 'Hoje, 14:22', category: 'BONUS', status: 'Ativo', isPositive: true },
    { id: 3, type: 'Resgate de Cashback VIP', value: '+ R$ 12,50', date: 'Ontem, 19:40', category: 'BONUS', status: 'Concluído', isPositive: true },
    { id: 4, type: 'Saque PIX Solicitado', value: '- R$ 30,00', date: '10/08/2026', category: 'SAQUES', status: 'Concluído', isPositive: false },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'TODOS') return true;
    return tx.category === txFilter;
  });

  return (
    <div className="w-full max-w-md mx-auto px-3.5 pt-3 pb-24 space-y-3.5 animate-in fade-in duration-300 select-none text-white">
      
      {/* 👑 1. PREMIUM VIP PLAYER HERO CARD */}
      <div className="relative bg-gradient-to-br from-[#1a130b] via-[#120e08] to-[#0a0a0d] border border-amber-500/40 rounded-3xl p-4.5 shadow-2xl overflow-hidden">
        
        {/* Glow & Gold Accent Background */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top User Info Row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            
            {/* Custom Avatar with Crown Badge */}
            <div className="relative cursor-pointer" onClick={() => setShowProfileModal(true)}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <div className="w-full h-full bg-[#0a0a0d] rounded-[14px] flex items-center justify-center overflow-hidden">
                  <span className="text-2xl">{selectedAvatar}</span>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-black rounded-full p-0.5 border-2 border-black" title="Conta VIP Verificada">
                <CheckCircle2 size={12} className="fill-emerald-400 text-black" />
              </span>
            </div>

            {/* Name & Badges */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-amber-100 uppercase tracking-tight">
                  {account?.name || 'Jogador FuturoBet'}
                </span>
                <BadgeCheck size={18} className="text-amber-400 fill-amber-400/20 shrink-0" />
              </div>

              <div className="flex items-center gap-1.5 mt-1">
                <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                  <Crown size={12} className="fill-black" />
                  VIP BRONZE
                </span>
                <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30 font-mono">
                  ID #88921
                </span>
              </div>
            </div>

          </div>

          {/* Edit Profile CTA */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="px-3 py-1.5 bg-black/60 hover:bg-black text-amber-300 hover:text-white rounded-xl border border-amber-500/30 transition active:scale-95 cursor-pointer text-xs font-bold"
          >
            Editar Perfil
          </button>
        </div>

        {/* Level Progress Bar & Benefits Modal Trigger */}
        <div className="mt-4 pt-3 border-t border-amber-500/20 space-y-1.5 relative z-10">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-amber-300 flex items-center gap-1">
              <Sparkles size={13} className="text-amber-400" />
              Progresso Nível VIP (100 / 1.000 XP)
            </span>
            <button
              onClick={() => setShowVipModal(true)}
              className="text-[10px] text-amber-400 hover:underline font-extrabold cursor-pointer"
            >
              Ver Benefícios VIP →
            </button>
          </div>

          <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-amber-500/30 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: '10%' }}
            />
          </div>
        </div>

      </div>

      {/* 💳 2. FINANCIAL CARTEIRA & CASHBACK DASHBOARD */}
      <div className="bg-[#121217] border border-amber-500/30 rounded-3xl p-4 shadow-xl space-y-3.5">
        
        {/* Balance Display */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Wallet size={22} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                Saldo Real Disponível
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight block">
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Active Bonus Pill */}
          <div className="bg-black/80 border border-amber-500/30 rounded-2xl px-3 py-1.5 text-right">
            <span className="text-[9px] text-zinc-400 font-bold uppercase block">
              Bônus Ativo
            </span>
            <span className="text-xs font-black text-amber-300 font-mono">
              R$ {balance > 0 ? balance.toFixed(2) : '0,00'}
            </span>
          </div>
        </div>

        {/* Cashback Claim Box */}
        {cashbackAvailable > 0 && (
          <div className="p-3 bg-gradient-to-r from-emerald-950/60 via-black to-zinc-950 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent size={18} className="text-emerald-400" />
              <div>
                <span className="text-xs font-black text-white block leading-tight">Cashback Diário VIP</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">R$ {cashbackAvailable.toFixed(2)} acumulados</span>
              </div>
            </div>

            <button
              onClick={handleClaimCashback}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              RESGATAR
            </button>
          </div>
        )}

        {cashbackClaimedMsg && (
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 text-xs font-extrabold text-center animate-in fade-in">
            {cashbackClaimedMsg}
          </div>
        )}

        {/* Deposit & Withdraw Action CTAs */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onOpenDeposit}
            className="py-3 px-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Zap size={16} className="fill-black" />
            <span>DEPOSITAR PIX</span>
          </button>

          <button
            onClick={() => {
              setWithdrawErrorMsg(null);
              setWithdrawSuccessMsg(null);
              setShowWithdrawModal(true);
            }}
            className="py-3 px-3 bg-black border border-emerald-500/50 hover:border-emerald-400 text-emerald-400 font-black text-xs uppercase tracking-wider rounded-2xl transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight size={16} />
            <span>SACAR SYNCPAY</span>
          </button>
        </div>

      </div>

      {/* 🧭 3. NAVIGATION TAB SELECTOR FOR ACCOUNT MODULES */}
      <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('VISAO_GERAL')}
          className={`py-2 rounded-xl transition cursor-pointer ${
            activeTab === 'VISAO_GERAL' ? 'bg-amber-400 text-black font-extrabold shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Visão Geral
        </button>

        <button
          onClick={() => setActiveTab('VIP_CLUB')}
          className={`py-2 rounded-xl transition cursor-pointer ${
            activeTab === 'VIP_CLUB' ? 'bg-amber-400 text-black font-extrabold shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Clube VIP
        </button>

        <button
          onClick={() => setActiveTab('EXTRATO')}
          className={`py-2 rounded-xl transition cursor-pointer ${
            activeTab === 'EXTRATO' ? 'bg-amber-400 text-black font-extrabold shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Extrato
        </button>

        <button
          onClick={() => setActiveTab('CONFIGS')}
          className={`py-2 rounded-xl transition cursor-pointer ${
            activeTab === 'CONFIGS' ? 'bg-amber-400 text-black font-extrabold shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Segurança
        </button>
      </div>

      {/* TAB 1: VISÃO GERAL */}
      {activeTab === 'VISAO_GERAL' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#121217] border border-zinc-800 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                <Trophy size={18} />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Total Ganho</span>
                <span className="text-sm font-mono font-black text-amber-300">R$ 480,00</span>
              </div>
            </div>

            <div className="bg-[#121217] border border-zinc-800 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <TrendingUp size={18} />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Total Sacado</span>
                <span className="text-sm font-mono font-black text-emerald-400">R$ 150,00</span>
              </div>
            </div>
          </div>

          {/* Referral Link Box */}
          <div className="bg-[#121217] border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <Flame size={14} className="text-amber-400" />
                Programa de Indicação (Afiliados)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">Comissão 30%</span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Convide amigos e ganhe 30% de comissão direta em cada depósito realizado via PIX!
            </p>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value="https://vegasbet.vip/ref/88921"
                className="w-full bg-black/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none"
              />
              <button
                onClick={handleCopyRef}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Main Action Items List */}
          <div className="bg-[#121217] border border-zinc-800/80 rounded-2xl overflow-hidden divide-y divide-zinc-800/80">
            
            <button
              onClick={() => setShowBonusModal(true)}
              className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-800/40 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                  <Gift size={18} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-white block group-hover:text-yellow-300 transition">
                    Meus Bônus & Cupons
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">Bônus de 100% no primeiro depósito ativo</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-500 group-hover:text-yellow-400 transition" />
            </button>

            <button
              onClick={() => setShowSupportModal(true)}
              className="w-full p-3.5 flex items-center justify-between hover:bg-zinc-800/40 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Headphones size={18} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-white block group-hover:text-emerald-400 transition">
                    Atendimento VIP 24h
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">Atendentes online para auxiliar saques</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-500 group-hover:text-emerald-400 transition" />
            </button>

          </div>

        </div>
      )}

      {/* TAB 2: CLUBE VIP */}
      {activeTab === 'VIP_CLUB' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          
          <div className="bg-[#121217] border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Crown size={16} />
                Níveis do Clube VIP FuturoBet
              </span>
              <span className="text-[10px] font-mono text-zinc-400 font-bold">4 Níveis</span>
            </div>

            <div className="space-y-2">
              {VIP_LEVELS.map((vip) => (
                <div
                  key={vip.level}
                  className={`p-3 rounded-2xl border transition ${
                    vip.level === 1
                      ? 'bg-amber-950/30 border-amber-500/50'
                      : 'bg-black/60 border-zinc-800/80 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-gradient-to-r ${vip.badgeColor} text-white`}>
                        {vip.name}
                      </span>
                      {vip.level === 1 && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded">Nível Atual</span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      Cashback {vip.cashback}
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-400 mt-1">
                    Limite de Saque: <strong className="text-white">{vip.withdrawLimit}</strong>
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {vip.perks.map((p, i) => (
                      <span key={i} className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: EXTRATO */}
      {activeTab === 'EXTRATO' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {(['TODOS', 'DEPOSITOS', 'SAQUES', 'BONUS'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTxFilter(filter)}
                className={`px-3 py-1.5 rounded-xl border font-bold transition cursor-pointer text-[10px] ${
                  txFilter === filter
                    ? 'bg-amber-400 border-amber-300 text-black'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="bg-[#121217] border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-3.5 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-white">{tx.type}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{tx.date}</p>
                </div>
                <div className="text-right font-mono">
                  <p className={`font-black text-sm ${tx.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.value}
                  </p>
                  <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 4: SEGURANÇA */}
      {activeTab === 'CONFIGS' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          
          <div className="bg-[#121217] border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <ShieldCheck size={18} />
              <span>Status de Proteção da Conta</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-black/60 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">Criptografia SSL 256-bit</p>
                  <p className="text-[10px] text-zinc-400">Proteção total de transações PIX</p>
                </div>
                <span className="text-emerald-400 font-bold text-xs">Ativo ✅</span>
              </div>

              <div className="p-2.5 bg-black/60 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">Processamento SyncPay</p>
                  <p className="text-[10px] text-zinc-400">Gateway de pagamento homologado</p>
                </div>
                <span className="text-emerald-400 font-bold text-xs">Certificado ✅</span>
              </div>

              <div className="p-2.5 bg-black/60 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">Jogo Responsável (+18)</p>
                  <p className="text-[10px] text-zinc-400">Limites de aposta e controle de saldo</p>
                </div>
                <span className="text-blue-400 font-bold text-xs">Protegido 🛡️</span>
              </div>
            </div>
          </div>

          {isLoggedIn && (
            <button
              onClick={logout}
              className="w-full py-3 bg-[#121217] border border-red-500/40 hover:border-red-500 text-red-400 font-black text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              <span>Sair da Conta</span>
            </button>
          )}

          {/* Official FuturoBet Luxury Seal */}
          <div className="pt-2 pb-1 flex flex-col items-center justify-center space-y-1 opacity-90">
            <div className="flex items-center justify-center gap-0.5 font-black text-sm tracking-tight uppercase">
              <span className="text-white">FUTURO</span>
              <span className="text-amber-400 ml-0.5">BET</span>
            </div>
            <span className="text-[8px] text-zinc-500 font-mono block">LICENSED GAMING PLATFORM • SSL SECURE</span>
          </div>

        </div>
      )}

      {/* ----------------- MODAL SELEÇÃO DE AVATAR / PERFIL ----------------- */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#121217] border border-amber-500/40 rounded-3xl p-5 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h4 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <User size={18} className="text-amber-400" />
                Personalizar Avatar do Jogador
              </h4>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-zinc-400 hover:text-white font-bold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 font-bold uppercase">Escolha seu Avatar VIP:</label>
              <div className="grid grid-cols-4 gap-2">
                {avatarList.map((av) => (
                  <button
                    key={av}
                    onClick={() => setSelectedAvatar(av)}
                    className={`h-12 rounded-2xl text-2xl flex items-center justify-center border transition cursor-pointer ${
                      selectedAvatar === av
                        ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                        : 'bg-black/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-black/60 p-2.5 rounded-xl border border-zinc-800 flex justify-between">
                <span className="text-zinc-400">ID de Conta</span>
                <span className="font-mono font-bold text-amber-200">#88921</span>
              </div>
              <div className="bg-black/60 p-2.5 rounded-xl border border-zinc-800 flex justify-between">
                <span className="text-zinc-400">Status PIX</span>
                <span className="font-bold text-emerald-400">✅ Verificada</span>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded-xl shadow cursor-pointer transition"
            >
              SALVAR PERFIL
            </button>
          </div>
        </div>
      )}

      {/* ----------------- MODAL CLUBE VIP COMPLETO ----------------- */}
      {showVipModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#18120c] via-[#0f0b07] to-black border-2 border-amber-500/50 rounded-3xl p-5 shadow-[0_0_40px_rgba(245,158,11,0.3)] relative space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-amber-400" />
                <h4 className="text-sm font-black text-white uppercase tracking-wide">CLUBE VIP FUTUROBET</h4>
              </div>
              <button
                onClick={() => setShowVipModal(false)}
                className="text-zinc-400 hover:text-white font-bold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Quanto mais você joga, mais alto seu nível VIP! Suba de nível para desbloquear cashbacks maiores, saques ilimitados e presentes de aniversário.
            </p>

            <div className="space-y-2.5">
              {VIP_LEVELS.map((vip) => (
                <div key={vip.level} className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase bg-gradient-to-r ${vip.badgeColor} text-white`}>
                      {vip.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      Cashback {vip.cashback}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400">Saque Max: {vip.withdrawLimit}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowVipModal(false)}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded-xl cursor-pointer"
            >
              ENTENDI
            </button>
          </div>
        </div>
      )}

      {/* ----------------- MODAL BÔNUS ATIVOS ----------------- */}
      {showBonusModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#121217] border border-amber-500/40 rounded-3xl p-5 shadow-2xl relative space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5">
              <h4 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <Gift size={18} className="text-yellow-400" />
                Meus Bônus & Promoções
              </h4>
              <button
                onClick={() => setShowBonusModal(false)}
                className="text-zinc-400 hover:text-white font-bold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/80 border border-amber-500/30 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-black text-amber-200">🎁 Bônus 100% de Boas-Vindas</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-black">
                  ATIVO
                </span>
              </div>
              <p className="text-[10px] text-zinc-300">
                Ganhe o dobro do saldo no seu primeiro depósito via PIX.
              </p>
              <div className="pt-2 border-t border-zinc-800 flex justify-between text-[10px] text-zinc-400">
                <span>Rollover: 10x Slots</span>
                <span className="text-amber-300 font-bold">Validade: 30 Dias</span>
              </div>
            </div>

            <button
              onClick={() => setShowBonusModal(false)}
              className="w-full py-3 bg-amber-400 text-black font-black text-xs uppercase rounded-xl shadow cursor-pointer hover:bg-amber-300"
            >
              FECHAR
            </button>
          </div>
        </div>
      )}

      {/* ----------------- MODAL SUPORTE VIP 24H ----------------- */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#121217] border border-emerald-500/40 rounded-3xl p-5 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5">
              <h4 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <Headphones size={18} className="text-emerald-400" />
                Atendimento Concierge VIP 24h
              </h4>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-zinc-400 hover:text-white font-bold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Equipe dedicada de suporte pronta para resolver qualquer dúvida sobre depósitos PIX, saques e regras de jogos com tempo médio de resposta em menos de 1 minuto.
            </p>

            <button
              onClick={() => {
                let msg = 'Olá! Preciso de suporte na FuturoBet.\n\n';
                if (account?.name || account?.cpf) {
                  msg += `👤 Nome: ${account.name || 'Jogador'}\n`;
                  msg += `📄 CPF: ${account.cpf || 'Não informado'}\n\n`;
                }
                msg += 'Preciso de ajuda com: ';
                window.open(`https://wa.me/5542999687965?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-black text-xs uppercase rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer flex items-center justify-center gap-2 transition hover:brightness-110"
            >
              <MessageSquare size={16} className="fill-black" />
              <span>CHAMAR NO WHATSAPP 24H</span>
            </button>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 bg-zinc-800 text-zinc-300 font-bold text-xs uppercase rounded-xl"
            >
              FECHAR
            </button>
          </div>
        </div>
      )}

      {/* ----------------- MODAL SAQUE PIX SYNCPAY ----------------- */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#18120c] via-[#0f0b07] to-black border-2 border-emerald-500/50 rounded-3xl p-5 shadow-[0_0_40px_rgba(16,185,129,0.3)] relative space-y-4">
            
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl">
                  <Zap size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wide">SAQUE PIX SYNCPAY</h4>
                  <p className="text-[10px] text-emerald-400 font-bold">Transferência Imediata para sua Conta</p>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-zinc-400 hover:text-white font-bold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current Available Balance */}
            <div className="p-3 bg-black/60 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-bold">Saldo Disponível:</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                R$ {balance.toFixed(2)}
              </span>
            </div>

            {/* Key Type Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-300 uppercase block">Tipo de Chave PIX</label>
              <div className="grid grid-cols-4 gap-1">
                {(['CPF', 'EMAIL', 'PHONE', 'EVP'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setPixKeyType(type)}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-extrabold border cursor-pointer transition ${
                      pixKeyType === type
                        ? 'bg-emerald-500 text-black border-emerald-300 shadow'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {type === 'PHONE' ? 'TEL' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* PIX Key Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-300 uppercase block">Chave PIX de Destino</label>
              <input
                type="text"
                placeholder={
                  pixKeyType === 'CPF' ? '000.000.000-00' :
                  pixKeyType === 'EMAIL' ? 'seuemail@exemplo.com' :
                  pixKeyType === 'PHONE' ? '(11) 99999-9999' : 'Chave Aleatória (EVP)'
                }
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full bg-black/80 border border-emerald-500/40 rounded-xl py-2.5 px-3 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-300 uppercase block">Valor do Saque (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xs">R$</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-black/80 border border-emerald-500/40 rounded-xl py-2.5 pl-9 pr-3 text-white text-sm font-black focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {withdrawErrorMsg && (
              <div className="p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs font-semibold text-center">
                {withdrawErrorMsg}
              </div>
            )}

            {withdrawSuccessMsg && (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold text-center">
                {withdrawSuccessMsg}
              </div>
            )}

            <button
              onClick={handleRequestSyncPayWithdraw}
              disabled={isProcessingWithdraw || balance <= 0}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:brightness-110 active:scale-95 transition disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2"
            >
              {isProcessingWithdraw ? (
                <span>Processando Saque SyncPay...</span>
              ) : (
                <span>SOLICITAR SAQUE PIX SYNCPAY</span>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
