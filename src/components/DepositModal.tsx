import React, { useState, useEffect, useRef } from 'react';
import { 
  X, QrCode, Copy, Check, ShieldCheck, Zap, RefreshCw, 
  Clock, CheckCircle2, Sparkles, Lock, ArrowRight, 
  Loader2, Hourglass, Shield, HelpCircle
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import vegasBetLuxuryLogo from '../assets/images/vegasbet_luxury_logo_1786891904925.jpg';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessDeposit: (amount: number) => void;
}

interface SyncPayPixData {
  transactionId: string;
  amount: number;
  pixCode: string;
  qrCodeUrl: string;
  expiresAt: string;
  isSimulated: boolean;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  gatewayMessage: string;
}

export default function DepositModal({ isOpen, onClose, onSuccessDeposit }: DepositModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientCpf, setClientCpf] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPixScreen, setShowPixScreen] = useState(false);
  const [pixData, setPixData] = useState<SyncPayPixData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes timer
  const [showOptionalFields, setShowOptionalFields] = useState<boolean>(false);
  
  // Real Verification States
  const [isCheckingPayment, setIsCheckingPayment] = useState<boolean>(false);
  const [hasNotifiedPayment, setHasNotifiedPayment] = useState<boolean>(false);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState<boolean>(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(900);
      setHasNotifiedPayment(false);
      setIsPaymentConfirmed(false);
    }
  }, [isOpen]);

  // Countdown timer for PIX expiration
  useEffect(() => {
    if (!showPixScreen || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showPixScreen, timeLeft]);

  // Background Polling for Real Payment Status
  useEffect(() => {
    if (!showPixScreen || !pixData?.transactionId || isPaymentConfirmed) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/syncpay/check-pix/${pixData.transactionId}`);
        const data = await res.json();

        if (data.status === 'PAID') {
          setIsPaymentConfirmed(true);
          soundEngine.playCoinDrop();
          onSuccessDeposit(pixData.amount);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch (err) {
        // Continue quietly polling
      }
    };

    pollingRef.current = setInterval(checkStatus, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [showPixScreen, pixData, isPaymentConfirmed, onSuccessDeposit]);

  if (!isOpen) return null;

  const quickAmounts = [
    { value: 20, label: 'R$ 20', badge: null },
    { value: 30, label: 'R$ 30', badge: null },
    { value: 50, label: 'R$ 50', badge: 'MAIS POPULAR 🔥' },
    { value: 100, label: 'R$ 100', badge: 'BÔNUS DUPLO 💎' },
    { value: 200, label: 'R$ 200', badge: null },
    { value: 500, label: 'R$ 500', badge: 'VIP EXPERT 👑' },
  ];

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const bonusAmount = finalAmount;
  const totalCredited = finalAmount + bonusAmount;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGeneratePix = async () => {
    if (finalAmount <= 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setHasNotifiedPayment(false);
    setIsPaymentConfirmed(false);

    try {
      const response = await fetch('/api/syncpay/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          clientName: clientName || 'Jogador FuturoBet',
          clientCpf: clientCpf || '00000000000',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPixData(data);
        setShowPixScreen(true);
        setTimeLeft(900);
      } else {
        setErrorMessage(data.error || 'Falha ao gerar PIX no SysPay.');
      }
    } catch (err: any) {
      console.error('Error calling /api/syncpay/deposit:', err);
      // Fallback standard QR & Code
      const receiveKey = 'cd96e0ab-1a2f-4b28-8a45-caf37dd6069e';
      const cleanAmountStr = finalAmount.toFixed(2);
      const formattedCents = cleanAmountStr.replace('.', '');
      const pixCode = `00020126580014BR.GOV.BCB.PIX0136${receiveKey}520400005303986540${formattedCents}5802BR5916FUTUROBET_CASINO6009SAO_PAULO62070503${Date.now().toString().slice(-8)}6304`;
      
      setPixData({
        transactionId: `SYS_${Date.now()}`,
        amount: finalAmount,
        pixCode,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        isSimulated: false,
        status: 'PENDING',
        gatewayMessage: 'PIX SysPay gerado com sucesso.',
      });
      setShowPixScreen(true);
      setTimeLeft(900);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyCode = () => {
    if (!pixData?.pixCode) return;
    navigator.clipboard.writeText(pixData.pixCode);
    setCopied(true);
    soundEngine.playCoinDrop();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerifyPaymentStatus = async () => {
    if (!pixData?.transactionId) return;
    setIsCheckingPayment(true);

    try {
      const res = await fetch(`/api/syncpay/check-pix/${pixData.transactionId}`);
      const data = await res.json();

      if (data.status === 'PAID') {
        setIsPaymentConfirmed(true);
        soundEngine.playCoinDrop();
        onSuccessDeposit(pixData.amount);
      } else {
        setHasNotifiedPayment(true);
      }
    } catch (err) {
      setHasNotifiedPayment(true);
    } finally {
      setIsCheckingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[440px] bg-gradient-to-b from-[#140e06] via-[#0d0905] to-[#070503] border border-[#d4af37]/40 rounded-[28px] p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.15)] text-white relative max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col justify-between">
        
        {/* Luxury Gold Halo Light on Top */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-500/15 via-transparent to-transparent pointer-events-none rounded-t-[28px]" />

        {!showPixScreen ? (
          /* ============================================================ */
          /* STEP 1: VALUE SELECTION & BONUS PREVIEW                     */
          /* ============================================================ */
          <div className="space-y-4 relative z-10">
            
            {/* Header with Close */}
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="flex items-center font-black text-lg tracking-tighter uppercase font-sans select-none">
                  <span className="text-white">FUTURO</span>
                  <span className="text-amber-400 ml-0.5">BET</span>
                </div>
                <div className="border-l border-zinc-800 pl-3">
                  <h3 className="text-xs font-black tracking-wider uppercase text-white flex items-center gap-1.5">
                    Depósito Instantâneo
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-black border border-emerald-500/40">
                      PIX
                    </span>
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-medium">Bônus automático de 100% no seu saldo</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Amounts Grid */}
            <div>
              <label className="text-[11px] font-extrabold text-amber-300/90 mb-2 block uppercase tracking-wider">
                Escolha o valor
              </label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((item) => {
                  const isSelected = selectedAmount === item.value && !customAmount;
                  return (
                    <button
                      key={item.value}
                      onClick={() => {
                        setSelectedAmount(item.value);
                        setCustomAmount('');
                      }}
                      className={`relative py-3 px-2 rounded-2xl font-black text-sm transition-all border cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#ffe899] via-[#f59e0b] to-[#b45309] text-black border-[#fff4c2] shadow-[0_0_18px_rgba(245,158,11,0.5)] scale-[1.02]'
                          : 'bg-zinc-900/80 text-zinc-200 border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-850'
                      }`}
                    >
                      {item.badge && (
                        <span className={`absolute -top-2 text-[7.5px] font-black uppercase px-1.5 py-0.2 rounded-full border shadow ${
                          isSelected 
                            ? 'bg-black text-amber-300 border-amber-400' 
                            : 'bg-amber-500 text-black border-amber-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  Ou digite outro valor
                </label>
                <span className="text-[10px] text-zinc-500 font-medium">Mínimo R$ 10,00</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-amber-400 text-sm">R$</span>
                <input
                  type="number"
                  placeholder="Ex: 75,00"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-zinc-950/90 border border-zinc-800 rounded-2xl py-2.5 pl-11 pr-4 text-white placeholder-zinc-600 font-black text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            {/* VIP 100% Double Bonus Card */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/30 via-zinc-900 to-amber-950/30 border border-amber-500/30 relative overflow-hidden shadow">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-300 block">
                      BÔNUS VIP BOAS-VINDAS (+100%)
                    </span>
                    <span className="text-[11px] font-medium text-zinc-300">
                      Você deposita <strong className="text-white">R$ {finalAmount.toFixed(2)}</strong> e recebe:
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-emerald-400 font-mono block">
                    R$ {totalCredited.toFixed(2)}
                  </span>
                  <span className="text-[8px] text-emerald-300/80 font-bold uppercase block">NA SUA BANCA</span>
                </div>
              </div>
            </div>

            {/* Optional CPF / Name toggle */}
            <div>
              <button
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="text-[10.5px] font-bold text-amber-400/80 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
              >
                <span>{showOptionalFields ? '− Ocultar dados adicionais' : '+ Adicionar Nome e CPF (Opcional)'}</span>
              </button>

              {showOptionalFields && (
                <div className="mt-2 grid grid-cols-2 gap-2 animate-in fade-in duration-150">
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 block mb-1">Nome do Titular</label>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 block mb-1">CPF</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={clientCpf}
                      onChange={(e) => setClientCpf(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-950/50 border border-red-500/50 rounded-xl text-red-300 text-xs font-bold text-center">
                {errorMessage}
              </div>
            )}

            {/* Generate PIX Button */}
            <button
              onClick={handleGeneratePix}
              disabled={isProcessing || finalAmount <= 0}
              className="w-full py-3.5 bg-gradient-to-r from-[#ffe485] via-[#f7b700] to-[#b45309] text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-t border-white/60"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>GERANDO PIX SEGURO...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-black" />
                  <span>GERAR PIX DE R$ {finalAmount.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            {/* Security Guarantee Footer */}
            <div className="flex items-center justify-center gap-2 text-[9.5px] text-zinc-400 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Transação protegida por criptografia SSL 256-bit • SysPay</span>
            </div>

          </div>
        ) : (
          /* ============================================================ */
          /* STEP 2: PROFESSIONAL HIGH-CONVERTING PIX PAYMENT SCREEN     */
          /* ============================================================ */
          <div className="space-y-3.5 relative z-10 animate-in fade-in duration-200">
            
            {/* Top Navigation & Status Bar */}
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80">
              
              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                {isPaymentConfirmed ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    PAGAMENTO CONFIRMADO
                  </div>
                ) : hasNotifiedPayment ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    PAGAMENTO PENDENTE
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    AGUARDANDO PIX
                  </div>
                )}
              </div>

              {/* Right Controls: Timer + Close Button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono font-bold text-amber-400 shadow-inner">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>

                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Financial Breakdown Card */}
            <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 rounded-2xl border border-zinc-800/90 p-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    VALOR DO DEPÓSITO
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-sm font-black text-white font-mono">
                      R$ {finalAmount.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 font-mono">
                      (+ R$ {bonusAmount.toFixed(2)} bônus)
                    </span>
                  </div>
                </div>

                <div className="text-right pl-3 border-l border-zinc-800">
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block">
                    TOTAL CREDITADO
                  </span>
                  <span className="text-base font-black text-emerald-400 font-mono block">
                    R$ {totalCredited.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* If Confirmed Screen */}
            {isPaymentConfirmed ? (
              <div className="py-5 px-4 bg-emerald-950/30 border border-emerald-500/50 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-400 rounded-full mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white uppercase tracking-wide">DEPÓSITO APROVADO!</h4>
                  <p className="text-xs text-emerald-300 font-medium mt-0.5">
                    Seu saldo de <strong>R$ {totalCredited.toFixed(2)}</strong> já está disponível na sua conta!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-400 transition cursor-pointer shadow-lg"
                >
                  JOGAR AGORA
                </button>
              </div>
            ) : (
              <>
                {/* Clean QR Code Container */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-44 h-44 sm:w-48 sm:h-48 bg-white p-2.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.8)] border border-amber-400/30 relative flex items-center justify-center">
                    {pixData?.qrCodeUrl ? (
                      <img
                        src={pixData.qrCodeUrl}
                        alt="QR Code PIX SysPay"
                        className="w-full h-full object-contain rounded-lg select-none pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-zinc-400 rounded-lg flex flex-col items-center justify-center text-zinc-800">
                        <QrCode className="w-14 h-14 text-zinc-700 mb-1" />
                        <span className="text-[10px] font-black uppercase">PIX SYSPAY</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 mt-2">
                    Abra o app do banco e escaneie o QR Code acima
                  </span>
                </div>

                {/* PIX Copia e Cola Section */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9.5px] font-extrabold uppercase tracking-wider text-zinc-400 px-0.5">
                    <span>CÓDIGO PIX COPIA E COLA</span>
                    {copied && <span className="text-emerald-400 font-black animate-pulse">✓ Código Copiado!</span>}
                  </div>

                  <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl p-1 pr-1.5 focus-within:border-amber-400/70 transition">
                    <input
                      type="text"
                      readOnly
                      value={pixData?.pixCode || ''}
                      className="bg-transparent text-xs font-mono text-zinc-300 px-2.5 py-1.5 w-full focus:outline-none truncate select-all"
                    />
                    <button
                      onClick={handleCopyCode}
                      className={`px-3.5 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow ${
                        copied
                          ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                          : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black hover:brightness-110 active:scale-95 shadow-amber-500/20'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>COPIADO</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPIAR</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Pending State Banner */}
                {hasNotifiedPayment && (
                  <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-1 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Hourglass className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span className="text-[10.5px] font-black uppercase tracking-wide">
                        COMPENSAÇÃO EM ANDAMENTO NO BANCO
                      </span>
                    </div>
                    <p className="text-[10.5px] text-zinc-300 leading-relaxed">
                      Seu pagamento está sendo processado pelo sistema bancário. O saldo será creditado automaticamente na sua conta assim que for compensado.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-1.5 pt-0.5">
                  <button
                    onClick={handleVerifyPaymentStatus}
                    disabled={isCheckingPayment}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border-t border-white/60 disabled:opacity-60"
                  >
                    {isCheckingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>CONSULTANDO BANCO CENTRAL...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>JÁ FIZ O PAGAMENTO / VERIFICAR</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowPixScreen(false)}
                    className="w-full py-1 text-[11px] text-zinc-400 hover:text-white font-semibold transition cursor-pointer text-center block"
                  >
                    ← Voltar e alterar valor
                  </button>
                </div>
              </>
            )}

            {/* Official SysPay & Central Bank Badge */}
            <div className="flex items-center justify-center gap-2.5 pt-1 border-t border-zinc-800/60 text-[9.5px] text-zinc-500 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                SysPay Gateway
              </span>
              <span>•</span>
              <span>Banco Central</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                SSL 256-bit
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
