import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  User, 
  Sparkles, 
  Zap, 
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPhone } from '../utils/cpfValidator';
import TermsModal from './TermsModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  redirectActionName?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'register',
  redirectActionName
}: AuthModalProps) {
  const { login, register } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Campos do Cadastro Simplificado (Apenas Nome, Celular e Senha)
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Campo de Login (Telefone ou Nome)
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Estados de feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (!name.trim() || name.trim().length < 3) {
          setErrorMessage('Por favor, informe seu nome completo.');
          setIsSubmitting(false);
          return;
        }

        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
          setErrorMessage('Informe seu celular com DDD (ex: 11 99999-9999).');
          setIsSubmitting(false);
          return;
        }

        if (!password || password.length < 4) {
          setErrorMessage('Crie uma senha de no mínimo 4 caracteres.');
          setIsSubmitting(false);
          return;
        }

        if (!termsAccepted) {
          setErrorMessage('Confirme que você é maior de 18 anos.');
          setIsSubmitting(false);
          return;
        }

        const res = await register({
          name: name.trim(),
          phone: phone.trim(),
          password,
          termsAccepted
        });

        if (!res.success) {
          setErrorMessage(res.message || 'Erro ao criar conta. Tente novamente.');
          setIsSubmitting(false);
          return;
        }

        setSuccessMessage('🎉 Conta criada com sucesso! Bônus liberado.');
        setTimeout(() => {
          onClose();
        }, 1100);

      } else {
        // Modo Login (Telefone ou Nome)
        if (!loginIdentifier.trim()) {
          setErrorMessage('Digite seu telefone ou seu nome cadastrado.');
          setIsSubmitting(false);
          return;
        }

        if (!loginPassword || loginPassword.length < 4) {
          setErrorMessage('Digite sua senha cadastrada.');
          setIsSubmitting(false);
          return;
        }

        const res = await login(loginIdentifier.trim(), loginPassword, rememberMe);
        if (!res.success) {
          setErrorMessage(res.message || 'Dados ou senha incorretos.');
          setIsSubmitting(false);
          return;
        }

        setSuccessMessage('✓ Acesso confirmado! Entrando...');
        setTimeout(() => {
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div 
          id="auth-modal-card"
          className="w-full max-w-sm bg-gradient-to-b from-[#181108] via-[#0f0a04] to-black border border-amber-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-slate-100 shadow-[0_0_50px_rgba(245,158,11,0.35)] relative flex flex-col my-auto"
        >
          {/* Botão Fechar */}
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-900 border border-amber-500/40 text-amber-200 hover:text-white hover:bg-amber-600/30 flex items-center justify-center cursor-pointer transition active:scale-90 z-20"
          >
            <X size={17} strokeWidth={2.5} />
          </button>

          {/* Cabeçalho Compacto */}
          <div className="text-center pt-0.5 pb-2.5">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1.5">
              <Sparkles size={12} className="text-amber-400 shrink-0" />
              <span>{mode === 'register' ? 'BÔNUS DE BOAS-VINDAS LIBERADO 🎁' : 'ACESSO RÁPIDO E SEGURO ⚡'}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {mode === 'register' ? 'CRIAR CONTA FUTUROBET' : 'ENTRE NA SUA CONTA'}
            </h2>

            <p className="text-xs text-zinc-300 mt-0.5 font-medium">
              {redirectActionName ? (
                <span>Para <strong className="text-amber-300 underline">{redirectActionName}</strong></span>
              ) : mode === 'register' ? (
                <span className="text-emerald-400 font-semibold">✓ Sem CPF no cadastro • Apenas 3 passos</span>
              ) : (
                'Informe seu telefone ou nome e sua senha'
              )}
            </p>
          </div>

          {/* Abas Alternadoras Compactas */}
          <div className="grid grid-cols-2 gap-1.5 bg-black/70 p-1 rounded-xl border border-amber-500/30 mb-3">
            <button
              id="tab-mode-register"
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <span>Novo Cadastro</span>
            </button>

            <button
              id="tab-mode-login"
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <span>Já Tenho Conta</span>
            </button>
          </div>

          {/* Feedback de Erro ou Sucesso */}
          {errorMessage && (
            <div className="mb-2.5 p-2.5 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={15} className="shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-2.5 p-2.5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FORMULÁRIO COMPACTO */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            
            {/* ====== MODO CADASTRO ====== */}
            {mode === 'register' && (
              <>
                {/* 1. Nome Completo */}
                <div className="space-y-1">
                  <label className="block text-xs font-black text-amber-200 uppercase tracking-wide">
                    1. Nome Completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
                      <User size={16} />
                    </div>
                    <input
                      id="input-register-name"
                      type="text"
                      required
                      placeholder="Digite seu nome e sobrenome"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full bg-black/90 border border-amber-500/40 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    />
                  </div>
                </div>

                {/* 2. Celular */}
                <div className="space-y-1">
                  <label className="block text-xs font-black text-amber-200 uppercase tracking-wide">
                    2. Celular com DDD
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
                      <Phone size={16} />
                    </div>
                    <input
                      id="input-register-phone"
                      type="tel"
                      inputMode="tel"
                      required
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full bg-black/90 border border-amber-500/40 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    />
                  </div>
                </div>

                {/* 3. Crie uma Senha */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-black text-amber-200 uppercase tracking-wide">
                      3. Crie uma Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-amber-300 font-bold hover:text-white flex items-center gap-1 cursor-pointer bg-zinc-900/80 px-2 py-0.5 rounded border border-amber-500/30"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff size={12} />
                          <span>Ocultar</span>
                        </>
                      ) : (
                        <>
                          <Eye size={12} />
                          <span>Ver</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
                      <Lock size={16} />
                    </div>
                    <input
                      id="input-register-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 4 dígitos"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full bg-black/90 border border-amber-500/40 focus:border-amber-400 rounded-xl pl-9 pr-10 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    />
                  </div>
                </div>

                {/* Confirmação +18 anos */}
                <div className="pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none py-0.5">
                    <input
                      id="checkbox-terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] text-zinc-300 leading-snug">
                      Tenho <strong>+18 anos</strong> e aceito os{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsTermsModalOpen(true);
                        }}
                        className="text-amber-400 underline font-bold"
                      >
                        Termos do Cassino
                      </button>.
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* ====== MODO LOGIN ====== */}
            {mode === 'login' && (
              <>
                {/* Telefone ou Nome */}
                <div className="space-y-1">
                  <label className="block text-xs font-black text-amber-200 uppercase tracking-wide">
                    Telefone ou Nome
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
                      <Phone size={16} />
                    </div>
                    <input
                      id="input-login-identifier"
                      type="text"
                      required
                      placeholder="Ex: (11) 99999-9999 ou seu nome"
                      value={loginIdentifier}
                      onChange={(e) => {
                        setLoginIdentifier(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full bg-black/90 border border-amber-500/40 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-black text-amber-200 uppercase tracking-wide">
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-amber-300 font-bold hover:text-white flex items-center gap-1 cursor-pointer bg-zinc-900/80 px-2 py-0.5 rounded border border-amber-500/30"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff size={12} />
                          <span>Ocultar</span>
                        </>
                      ) : (
                        <>
                          <Eye size={12} />
                          <span>Ver</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
                      <Lock size={16} />
                    </div>
                    <input
                      id="input-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Digite sua senha cadastrada"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full bg-black/90 border border-amber-500/40 focus:border-amber-400 rounded-xl pl-9 pr-10 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
                    />
                  </div>
                </div>

                {/* Lembrar neste aparelho */}
                <div className="pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none py-0.5">
                    <input
                      id="checkbox-remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 accent-amber-400 rounded cursor-pointer"
                    />
                    <span className="text-[11px] text-zinc-300 font-medium">
                      Manter conectado neste aparelho
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* BOTÃO PRINCIPAL COMPACTO */}
            <div className="pt-1">
              <button
                id="btn-submit-auth"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer border border-yellow-200/50 disabled:opacity-50"
              >
                <Zap size={16} className="fill-black stroke-black shrink-0" />
                <span>
                  {mode === 'register' 
                    ? (isSubmitting ? 'CRIANDO CONTA...' : 'CRIAR CONTA GRÁTIS') 
                    : (isSubmitting ? 'ENTRANDO...' : 'ENTRAR NA CONTA')}
                </span>
                <ArrowRight size={16} className="shrink-0" />
              </button>
            </div>

          </form>

          {/* Rodapé Compacto */}
          <div className="mt-3 pt-2 border-t border-amber-500/20 flex items-center justify-center gap-3 text-[11px] text-zinc-400 shrink-0">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck size={13} className="text-emerald-400" /> Site Seguro
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">
              CPF pedido apenas no Saque PIX
            </span>
          </div>

        </div>
      </div>

      {/* Modal de Termos */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </>
  );
}
