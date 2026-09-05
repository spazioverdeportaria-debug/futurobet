import React, { useState, useEffect, useRef } from 'react';
import { 
  X, QrCode, Copy, Check, Zap, RefreshCw, 
  Clock, CheckCircle2, Sparkles, ArrowRight, 
  Loader2, ArrowLeft, ShieldCheck, CheckCircle,
  AlertCircle, Users, Hourglass
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { db, doc, setDoc, onSnapshot } from '../lib/firebase';

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
  const [selectedAmount, setSelectedAmount] = useState<number>(20);
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
  
  const [isCheckingPayment, setIsCheckingPayment] = useState<boolean>(false);
  const [isWaitingAdminApproval, setIsWaitingAdminApproval] = useState<boolean>(false);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState<boolean>(false);
  const checkIntervalRef = useRef<any>(null);

  const presetAmounts = [5, 20, 50, 100, 1000];

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const bonusAmount = finalAmount; // 100% bonus
  const totalCredited = finalAmount + bonusAmount;

  // Format currency in BRL (pt-BR)
  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Countdown timer for PIX expiration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPixScreen && timeLeft > 0 && !isPaymentConfirmed) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showPixScreen, timeLeft, isPaymentConfirmed]);

  // Firestore Real-time listener for deposit document
  useEffect(() => {
    if (!showPixScreen || !pixData?.transactionId || isPaymentConfirmed) return;

    try {
      const unsub = onSnapshot(doc(db, 'deposits', pixData.transactionId), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.status === 'APPROVED') {
            setIsWaitingAdminApproval(false);
            setIsPaymentConfirmed(true);
            soundEngine.playWinChime();

            // Dispara evento Purchase no Meta Pixel
            if (typeof window !== 'undefined' && (window as any).fbq) {
              (window as any).fbq('track', 'Purchase', {
                value: finalAmount,
                currency: 'BRL',
                content_name: 'Depósito PIX FuturoBet',
              });
            }

            onSuccessDeposit(finalAmount);
          } else if (data.status === 'PAID_PENDING_APPROVAL') {
            setIsWaitingAdminApproval(true);
          }
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firestore snapshot error on deposits:', e);
    }
  }, [showPixScreen, pixData?.transactionId, isPaymentConfirmed, totalCredited, onSuccessDeposit]);

  // Polling to verify transaction status automatically every 2.5s
  useEffect(() => {
    if (!showPixScreen || !pixData?.transactionId || isPaymentConfirmed) {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/syncpay/check-pix/${encodeURIComponent(pixData.transactionId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && (data.status === 'PAID' || data.moderatedStatus === 'APPROVED')) {
            setIsWaitingAdminApproval(false);
            setIsPaymentConfirmed(true);
            soundEngine.playWinChime();
            onSuccessDeposit(finalAmount);
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
          } else if (data && (data.status === 'PAID_PENDING_APPROVAL' || data.moderatedStatus === 'PAID_PENDING_APPROVAL')) {
            setIsWaitingAdminApproval(true);
          }
        }
      } catch (err) {
        // Silently continue polling
      }
    };

    checkIntervalRef.current = setInterval(checkStatus, 2500);

    // Immediate check when returning from banking app (focus / visibilitychange)
    const handleFocusCheck = () => {
      checkStatus();
    };

    window.addEventListener('focus', handleFocusCheck);
    document.addEventListener('visibilitychange', handleFocusCheck);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      window.removeEventListener('focus', handleFocusCheck);
      document.removeEventListener('visibilitychange', handleFocusCheck);
    };
  }, [showPixScreen, pixData?.transactionId, isPaymentConfirmed, totalCredited, onSuccessDeposit]);

  if (!isOpen) return null;

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setErrorMessage(null);
    soundEngine.playCashierBeep();
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setCustomAmount(val);
    setErrorMessage(null);
  };


  const handleGeneratePix = async () => {
    if (finalAmount < 5) {
      setErrorMessage('O valor mínimo de depósito é R$ 5,00.');
      soundEngine.playLockedSound();
      return;
    }

    if (finalAmount > 10000) {
      setErrorMessage('O valor máximo por transação é R$ 10.000,00.');
      soundEngine.playLockedSound();
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    soundEngine.playCashierBeep();
    setIsWaitingAdminApproval(false);
    setIsPaymentConfirmed(false);

    try {
      // Geração segura de cobrança PIX via servidor backend
      const response = await fetch('/api/syncpay/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          clientName: clientName || 'Jogador FuturoBet',
          clientCpf: clientCpf || '12345678909',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao comunicar com o gateway de pagamento.');
      }

      const createdData: SyncPayPixData = await response.json();

      if (createdData && createdData.pixCode) {
        setPixData(createdData);
        setShowPixScreen(true);
        setTimeLeft(900);

        // Dispara evento InitiateCheckout no Meta Pixel
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'InitiateCheckout', {
            value: finalAmount,
            currency: 'BRL',
            content_name: 'Gerar PIX Depósito',
          });
        }

        // Store into Firestore for real-time admin queue sync
        try {
          await setDoc(doc(db, 'deposits', createdData.transactionId), {
            id: createdData.transactionId,
            transactionId: createdData.transactionId,
            cpf: clientCpf || '12345678909',
            clientName: clientName || 'Jogador FuturoBet',
            amount: finalAmount,
            bonusAmount,
            totalAmount: totalCredited,
            status: 'WAITING_PAYMENT',
            gatewayStatus: 'PENDING',
            pixCode: createdData.pixCode,
            qrCodeUrl: createdData.qrCodeUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (fErr) {
          console.warn('Firestore deposit sync notice:', fErr);
        }
      } else {
        throw new Error('Não foi possível gerar a cobrança PIX no momento. Tente novamente em instantes.');
      }
    } catch (err: any) {
      console.error('Erro ao gerar PIX:', err);
      setErrorMessage(err.message || 'Erro ao comunicar com o gateway de pagamento. Tente novamente.');
      soundEngine.playLockedSound();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyCode = () => {
    if (!pixData?.pixCode) return;
    navigator.clipboard.writeText(pixData.pixCode);
    setCopied(true);
    soundEngine.playCoinDrop();
    setTimeout(() => setCopied(false), 3000);
  };

  const handleVerifyPaymentStatus = async () => {
    if (!pixData?.transactionId) return;
    setIsCheckingPayment(true);

    try {
      // Consulta verificação real do PIX junto ao gateway e à moderação
      const res = await fetch(`/api/syncpay/check-pix/${encodeURIComponent(pixData.transactionId)}`);
      const data = await res.json();

      if (data && (data.status === 'PAID' || data.moderatedStatus === 'APPROVED')) {
        setIsWaitingAdminApproval(false);
        setIsPaymentConfirmed(true);
        soundEngine.playWinChime();
        onSuccessDeposit(finalAmount);
      } else {
        // Enters the moderated waiting screen
        setIsWaitingAdminApproval(true);
      }
    } catch (err) {
      setIsWaitingAdminApproval(true);
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Premium Glass Container with precise constraints to prevent scrolling & broken wrapping */}
      <div className="relative w-full max-w-[425px] bg-[#0c0d12] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-white overflow-hidden">
        
        {/* Glow ambient effects */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* TOP HEADER: Clean FuturoBet Brand & Title */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 relative z-10">
          <div className="flex items-center gap-2.5">
            {/* FUTUROBET Master Logo */}
            <div className="flex items-center bg-zinc-900/90 px-2.5 py-1 rounded-xl border border-zinc-800">
              <span className="text-white font-black text-sm tracking-tight font-sans">FUTURO</span>
              <span className="text-amber-400 font-black text-sm tracking-tight font-sans ml-0.5">BET</span>
            </div>
            
            <div className="leading-tight">
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-white">
                {showPixScreen ? 'PAGAMENTO PIX' : 'DEPÓSITO PIX'}
              </h3>
              <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <Zap className="w-3 h-3 fill-emerald-400 text-emerald-400 shrink-0" />
                <span>Bônus 100% no 1º Depósito</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SCREEN 1: VALUE SELECTION */}
        {/* ========================================================================= */}
        {!showPixScreen ? (
          <div className="space-y-4 pt-3.5 relative z-10">
            
            {/* Bonus Card */}
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/30 via-yellow-950/20 to-zinc-900/60 border border-amber-500/40 rounded-2xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-black uppercase tracking-wider">DOBRE SEU SALDO AGORA</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-zinc-300">
                Deposite <strong className="text-white font-bold">R$ {formatBRL(finalAmount)}</strong> e receba{' '}
                <strong className="text-emerald-400 font-black">R$ {formatBRL(totalCredited)}</strong> para jogar!
              </p>
            </div>

            {/* Presets Grid */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-zinc-300 uppercase tracking-wider">
                ESCOLHA O VALOR:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map((amount) => {
                  const isSelected = selectedAmount === amount && !customAmount;
                  return (
                    <button
                      key={amount}
                      onClick={() => handleSelectAmount(amount)}
                      className={`relative py-2.5 px-1.5 rounded-xl text-center font-black transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-gradient-to-b from-amber-400 to-yellow-500 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[1.02]'
                          : 'bg-[#12141c] text-zinc-300 border-zinc-800/90 hover:border-amber-500/40 hover:bg-zinc-800/80'
                      }`}
                    >
                      <span className="text-xs font-black block">R$ {amount}</span>
                      <span className={`text-[9.5px] font-extrabold block mt-0.5 ${isSelected ? 'text-black/85' : 'text-emerald-400'}`}>
                        +{amount} bônus
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-zinc-300 uppercase tracking-wider">
                OU DIGITE OUTRO VALOR:
              </label>
              <div className="relative flex items-center bg-[#101218] border border-zinc-800 rounded-xl py-2.5 px-3.5 focus-within:border-amber-400 transition">
                <span className="text-zinc-400 font-extrabold text-sm mr-2">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00 (Mínimo R$ 5)"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="w-full bg-transparent text-sm font-bold text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Optional payer info */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1 cursor-pointer"
              >
                <span>{showOptionalFields ? '− Ocultar dados opcionais' : '+ Adicionar Nome e CPF (Opcional)'}</span>
              </button>

              {showOptionalFields && (
                <div className="space-y-2 mt-2 pt-2 border-t border-zinc-800/60 animate-in fade-in duration-150">
                  <input
                    type="text"
                    placeholder="Nome Completo (Opcional)"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    placeholder="CPF (Opcional)"
                    value={clientCpf}
                    onChange={(e) => setClientCpf(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-950/40 border border-red-500/50 rounded-xl text-red-400 text-xs font-bold text-center">
                {errorMessage}
              </div>
            )}

            {/* Generate PIX Button */}
            <button
              onClick={handleGeneratePix}
              disabled={isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>GERANDO PIX...</span>
                </>
              ) : (
                <>
                  <span>GERAR PIX DE R$ {formatBRL(finalAmount)}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* ========================================================================= */
          /* SCREEN 2: HIGH-QUALITY CLEAN PIX SCREEN WITHOUT BROKEN WRAPPING */
          /* ========================================================================= */
          <div className="space-y-3.5 pt-3 relative z-10">
            
            {/* Status & Timer Bar */}
            <div className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800/90 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wide text-zinc-200">
                  Aguardando Pagamento
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800/80">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Clean Financial Breakdown Card */}
            <div className="bg-[#12141d] rounded-2xl border border-amber-500/30 p-3.5 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                    VALOR A PAGAR
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-base font-black text-white font-mono">
                      R$ {formatBRL(finalAmount)}
                    </span>
                    <span className="text-[10.5px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30 whitespace-nowrap">
                      +100% Bônus
                    </span>
                  </div>
                </div>

                <div className="text-right pl-3 border-l border-zinc-800/80">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                    TOTAL CREDITADO
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono block mt-0.5">
                    R$ {formatBRL(totalCredited)}
                  </span>
                </div>
              </div>
            </div>

            {/* Approved View */}
            {isPaymentConfirmed ? (
              <div className="py-6 px-4 bg-emerald-950/40 border border-emerald-500/60 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-400 rounded-full mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.6)]">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white uppercase tracking-wide">DEPÓSITO APROVADO!</h4>
                  <p className="text-xs text-emerald-300 font-medium mt-1">
                    Seu saldo de <strong>R$ {formatBRL(totalCredited)}</strong> já foi creditado com sucesso!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-400 transition cursor-pointer shadow-lg"
                >
                  JOGAR AGORA
                </button>
              </div>
            ) : isWaitingAdminApproval ? (
              <div className="py-6 px-4 bg-[#10121a] border border-amber-500/50 rounded-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-amber-500/15 border border-amber-400/80 rounded-full mx-auto flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                  <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-black text-amber-400 uppercase tracking-wide">
                    PROCESSANDO PAGAMENTO...
                  </h4>
                </div>

                <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-xl text-center space-y-2">
                  <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                    Aguarde alguns minutos. O sistema está apresentando falhas temporárias no processamento.
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Seu saldo de <strong className="text-amber-400 font-mono">R$ {formatBRL(totalCredited)}</strong> será creditado em instantes.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 pt-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Sincronizando com o sistema...</span>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2 bg-zinc-800/80 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white font-bold rounded-xl transition cursor-pointer text-center"
                >
                  Fechar janela (saldo será creditado)
                </button>
              </div>
            ) : (
              <>
                {/* Modern Crisp QR Code Frame */}
                <div className="flex flex-col items-center justify-center pt-0.5">
                  <div className="w-44 h-44 sm:w-48 sm:h-48 bg-white p-2.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.8)] border border-amber-400/80 relative flex items-center justify-center">
                    {pixData?.qrCodeUrl ? (
                      <img
                        src={pixData.qrCodeUrl}
                        alt="QR Code PIX"
                        className="w-full h-full object-contain rounded-lg select-none pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full border border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center text-zinc-800">
                        <QrCode className="w-14 h-14 text-zinc-700 mb-1" />
                        <span className="text-xs font-black uppercase">PIX</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[11.5px] font-medium text-zinc-400 mt-2 text-center">
                    Abra o app do seu banco e aponte a câmera para o QR Code
                  </span>
                </div>

                {/* PIX Copia e Cola with Clean UI */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex justify-between items-center text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 px-0.5">
                    <span>PIX COPIA E COLA</span>
                    {copied && (
                      <span className="text-emerald-400 font-black flex items-center gap-1 animate-pulse">
                        <Check className="w-3 h-3 stroke-[3]" /> Copiado com sucesso!
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#101218] border border-zinc-800 rounded-xl p-1 pr-1 focus-within:border-amber-400/80 transition">
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
                          ? 'bg-emerald-500 text-black shadow-emerald-500/40'
                          : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black hover:brightness-110 active:scale-95 shadow-amber-500/25'
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

                {/* Status Indicator */}
                <div className="py-2 px-3 bg-[#11131a] border border-zinc-800/80 rounded-xl flex items-center justify-center gap-2 text-zinc-300">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                  <span className="text-[11.5px] font-medium text-zinc-300">
                    Aguardando confirmação do pagamento...
                  </span>
                </div>

                {/* Bottom Back Button */}
                <div className="pt-1">
                  <button
                    onClick={() => setShowPixScreen(false)}
                    className="w-full py-1.5 text-xs text-zinc-400 hover:text-white font-medium transition cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar e alterar valor</span>
                  </button>
                </div>
              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
