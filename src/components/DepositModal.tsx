import React, { useState, useEffect, useRef } from 'react';
import { 
  X, QrCode, Copy, Check, Zap, RefreshCw, 
  Clock, CheckCircle2, Sparkles, ArrowRight, 
  Loader2, ArrowLeft, ShieldCheck, CheckCircle
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

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
  const [hasNotifiedPayment, setHasNotifiedPayment] = useState<boolean>(false);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState<boolean>(false);
  const checkIntervalRef = useRef<any>(null);

  const presetAmounts = [20, 30, 50, 100, 200, 500];

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

  // Polling to verify transaction status automatically every 4s
  useEffect(() => {
    if (!showPixScreen || !pixData?.transactionId || isPaymentConfirmed) {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      return;
    }

    checkIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/syncpay/check-pix/${encodeURIComponent(pixData.transactionId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.status === 'PAID') {
            setIsPaymentConfirmed(true);
            soundEngine.playWinChime();
            onSuccessDeposit(totalCredited);
            clearInterval(checkIntervalRef.current);
          }
        }
      } catch (err) {
        // Silently continue polling
      }
    }, 4000);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
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

  // Real SyncPayments Cash-In Direct Fallback in case of proxy issues
  const requestDirectSyncPaymentsCashIn = async (amount: number, name: string, cpf: string): Promise<SyncPayPixData | null> => {
    try {
      const authRes = await fetch('https://api.syncpayments.com.br/api/partner/v1/auth-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          client_id: '36adf56b-e3f6-4319-b10b-e1347e62eafd',
          client_secret: '8240be3d-2c32-4f78-8e71-6a2d0d523abc',
        }),
      });

      if (!authRes.ok) return null;
      const authData = await authRes.json();
      const token = authData.access_token || authData.token;
      if (!token) return null;

      const cleanCpf = (cpf || '12345678909').replace(/\D/g, '') || '12345678909';
      const cleanName = (name || 'Jogador FuturoBet').trim();

      const cashInRes = await fetch('https://api.syncpayments.com.br/api/partner/v1/cash-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount.toFixed(2)),
          description: `Deposito FuturoBet R$ ${amount.toFixed(2)}`,
          client: {
            name: cleanName,
            cpf: cleanCpf,
            email: 'cliente@futurobet.com',
          },
        }),
      });

      if (!cashInRes.ok) return null;
      const cashInData = await cashInRes.json();
      const pixCode = cashInData.pix_code || cashInData.qrcode || cashInData.emv || cashInData.data?.pix_code;
      const identifier = cashInData.identifier || cashInData.id || `SYNC_${Date.now()}`;

      if (pixCode) {
        return {
          transactionId: identifier,
          amount,
          pixCode,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(pixCode)}`,
          expiresAt: cashInData.expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          isSimulated: false,
          status: 'PENDING',
          gatewayMessage: 'PIX oficial gerado via SyncPayments',
        };
      }
    } catch (e) {
      console.warn('Direct SyncPayments call error:', e);
    }
    return null;
  };

  const handleGeneratePix = async () => {
    if (finalAmount < 20) {
      setErrorMessage('O valor mínimo de depósito é R$ 20,00.');
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
    setHasNotifiedPayment(false);
    setIsPaymentConfirmed(false);

    try {
      let createdData: SyncPayPixData | null = null;

      // 1. First try serverless / API endpoint
      try {
        const response = await fetch('/api/syncpay/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            amount: finalAmount,
            clientName: clientName || 'Jogador FuturoBet',
            clientCpf: clientCpf || '12345678909',
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          if (data && data.pixCode) {
            createdData = data;
          }
        }
      } catch (networkErr) {
        console.warn('API endpoint call had an issue:', networkErr);
      }

      // 2. Fallback to direct SyncPayments Partner API
      if (!createdData) {
        createdData = await requestDirectSyncPaymentsCashIn(
          finalAmount,
          clientName || 'Jogador FuturoBet',
          clientCpf || '12345678909'
        );
      }

      if (createdData && createdData.pixCode) {
        setPixData(createdData);
        setShowPixScreen(true);
        setTimeLeft(900);
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
      const res = await fetch(`/api/syncpay/check-pix/${encodeURIComponent(pixData.transactionId)}`);
      const data = await res.json();

      if (data && data.status === 'PAID') {
        setIsPaymentConfirmed(true);
        soundEngine.playWinChime();
        onSuccessDeposit(totalCredited);
      } else {
        setHasNotifiedPayment(true);
      }
    } catch (err) {
      setHasNotifiedPayment(true);
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
                  placeholder="0,00 (Mínimo R$ 20)"
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

                {/* Verification Notice */}
                {hasNotifiedPayment && (
                  <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-0.5 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-wide">
                        COMPENSAÇÃO EM ANDAMENTO
                      </span>
                    </div>
                    <p className="text-[10.5px] text-zinc-300 leading-snug">
                      Pagamento em processamento no Banco Central. Seu saldo será liberado automaticamente.
                    </p>
                  </div>
                )}

                {/* Main Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleVerifyPaymentStatus}
                    disabled={isCheckingPayment}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isCheckingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>VERIFICANDO NO BANCO...</span>
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
                    className="w-full py-1 text-xs text-zinc-400 hover:text-white font-medium transition cursor-pointer text-center flex items-center justify-center gap-1"
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
