import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn, 
  Phone, 
  CreditCard, 
  User, 
  Sparkles, 
  Zap, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCPF, formatPhone, validateCPF } from '../utils/cpfValidator';
import TermsModal from './TermsModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  redirectActionName?: string; // Ex: 'jogar', 'apostar', 'depositar'
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'register',
  redirectActionName
}: AuthModalProps) {
  const { login, register } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Campos do formulário
  const [name, setName] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
    setErrorMessage(null);
  };

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
        const cleanCpf = cpf.replace(/\D/g, '');
        if (!validateCPF(cleanCpf)) {
          setErrorMessage('CPF inválido. Por favor, digite um CPF válido.');
          setIsSubmitting(false);
          return;
        }

        const res = await register({
          name,
          cpf,
          phone,
          password,
          termsAccepted
        });

        if (!res.success) {
          setErrorMessage(res.message || 'Erro ao realizar cadastro.');
          setIsSubmitting(false);
          return;
        }

        setSuccessMessage('Conta criada com sucesso! 100% de Bônus Ativado 🎁');
        setTimeout(() => {
          onClose();
        }, 1200);

      } else {
        // Modo Login
        const res = await login(cpf, password, rememberMe);
        if (!res.success) {
          setErrorMessage(res.message || 'CPF ou senha incorretos.');
          setIsSubmitting(false);
          return;
        }

        setSuccessMessage('Login efetuado com sucesso!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
        
        <div className="w-full max-w-sm bg-gradient-to-b from-[#160f06] via-[#0d0903] to-[#060401] border-2 border-amber-500/50 rounded-3xl p-5 text-slate-100 shadow-[0_0_50px_rgba(245,158,11,0.35)] relative flex flex-col overflow-hidden max-h-[92vh]">
          
          {/* Luz de Fundo */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Botão Fechar (X) */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/60 border border-amber-500/30 text-amber-200/80 hover:text-white hover:bg-black/90 flex items-center justify-center cursor-pointer transition active:scale-95 z-20"
            title="Fechar"
          >
            <X size={16} />
          </button>

          {/* Cabeçalho */}
          <div className="text-center pt-1 pb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-400/40 rounded-full text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={12} className="text-amber-400" />
              <span>{mode === 'register' ? 'BÔNUS 100% NO 1º PIX 🎁' : 'ACESSO SEGURO SSL ⚡'}</span>
            </div>

            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 uppercase tracking-tight font-sans">
              {mode === 'register' ? 'CRIE SUA CONTA FUTUROBET' : 'ENTRE NA SUA CONTA'}
            </h2>

            <p className="text-[11px] text-zinc-400 mt-0.5">
              {redirectActionName ? (
                <span>Cadastre-se ou entre para <strong className="text-amber-300">{redirectActionName}</strong></span>
              ) : mode === 'register' ? (
                'Cadastro instantâneo em menos de 20 segundos.'
              ) : (
                'Informe seu CPF e senha cadastrada para acessar.'
              )}
            </p>
          </div>

          {/* Abas Alternar: Cadastro / Entrar */}
          <div className="flex bg-black/70 p-1 rounded-2xl border border-amber-500/25 mb-3.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserPlus size={13} />
              <span>Cadastrar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LogIn size={13} />
              <span>Entrar</span>
            </button>
          </div>

          {/* Mensagens de Erro ou Sucesso */}
          {errorMessage && (
            <div className="mb-3 p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-[11px] font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={14} className="shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-3 p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-[11px] font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="space-y-2.5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
            
            {/* Campo: Nome Completo (Apenas no Cadastro) */}
            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-extrabold text-amber-200/80 uppercase tracking-wider mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400/70">
                    <User size={14} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome e sobrenome"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full bg-black/80 border border-amber-500/30 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Campo: CPF */}
            <div>
              <label className="block text-[10px] font-extrabold text-amber-200/80 uppercase tracking-wider mb-1">
                CPF (Chave PIX)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400/70">
                  <CreditCard size={14} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={cpf}
                  onChange={handleCpfChange}
                  className="w-full bg-black/80 border border-amber-500/30 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50 font-mono"
                />
              </div>
            </div>

            {/* Campo: WhatsApp / Celular (Apenas no Cadastro) */}
            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-extrabold text-amber-200/80 uppercase tracking-wider mb-1">
                  WhatsApp / Celular
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400/70">
                    <Phone size={14} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full bg-black/80 border border-amber-500/30 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Campo: Senha */}
            <div>
              <label className="block text-[10px] font-extrabold text-amber-200/80 uppercase tracking-wider mb-1">
                {mode === 'register' ? 'Crie uma Senha' : 'Sua Senha'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400/70">
                  <Lock size={14} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 4 caracteres"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-black/80 border border-amber-500/30 focus:border-amber-400 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-amber-300"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Checkbox: Lembrar-me no aparelho (Login) */}
            {mode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 accent-amber-400 rounded cursor-pointer"
                  />
                  <span className="text-[11px] text-zinc-300 font-medium">Lembrar-me neste aparelho</span>
                </label>
              </div>
            )}

            {/* Checkbox: Blindagem Jurídica e Termos +18 (Cadastro) */}
            {mode === 'register' && (
              <div className="pt-1 space-y-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-amber-400 rounded cursor-pointer shrink-0"
                  />
                  <span className="text-[10px] text-zinc-300 leading-tight">
                    Declaro que sou <strong className="text-amber-300">maior de 18 anos</strong> e concordo com os{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTermsModalOpen(true);
                      }}
                      className="text-amber-400 underline hover:text-yellow-300 font-bold"
                    >
                      Termos de Uso, Privacidade e Blindagem Jurídica
                    </button>.
                  </span>
                </label>
              </div>
            )}

            {/* Botão de Ação Principal */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer border border-white/40 disabled:opacity-50"
              >
                <Zap size={14} className="fill-black stroke-black" />
                <span>
                  {isSubmitting
                    ? 'PROCESSANDO...'
                    : mode === 'register'
                    ? 'CRIAR CONTA & RESGATAR BÔNUS 🎁'
                    : 'ENTRAR NA CONTA ⚡'}
                </span>
              </button>
            </div>

          </form>

          {/* Rodapé com Selo de Segurança */}
          <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-center gap-3 text-[9px] text-zinc-400 shrink-0">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-400" /> Criptografia 256-Bit
            </span>
            <span className="flex items-center gap-1">
              <Lock size={11} className="text-amber-400" /> Dados Protegidos LGPD
            </span>
          </div>

        </div>

      </div>

      {/* Modal de Termos de Uso e Privacidade */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </>
  );
}
