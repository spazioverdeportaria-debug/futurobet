import React from 'react';
import { X, ShieldCheck, FileText, Lock, AlertTriangle } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#090e17] border border-amber-500/40 rounded-3xl p-5 text-slate-200 shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[85vh] flex flex-col relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-amber-300 uppercase tracking-wide">
              Termos de Uso, Privacidade e Blindagem Jurídica
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-300 leading-relaxed custom-scrollbar">
          
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-300">CLÁUSULA DE MAIORIDADE (+18 ANOS)</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                O acesso e cadastro na plataforma FuturoBet são estritamente proibidos para menores de 18 anos. Ao prosseguir, o usuário declara sob as penas da lei ser civilmente capaz e maior de idade.
              </p>
            </div>
          </div>

          <section className="space-y-1.5">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <FileText size={14} className="text-amber-400" /> 1. Titularidade da Conta e Chave PIX
            </h4>
            <p className="text-slate-400 text-[11px]">
              Os depósitos e saques são vinculados exclusivamente ao CPF cadastrado pelo titular da conta. Não são permitidas transações a partir ou para contas bancárias de terceiros. Tentativas de fraude resultarão em bloqueio cautelar imediato.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Lock size={14} className="text-emerald-400" /> 2. Privacidade e Proteção de Dados (LGPD)
            </h4>
            <p className="text-slate-400 text-[11px]">
              A FuturoBet trata seus dados pessoais (Nome, CPF e Telefone) com criptografia de ponta a ponta (SSL 256-bit) e estrita observância à Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Seus dados não são comercializados ou compartilhados com terceiros não autorizados.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-amber-400" /> 3. Jogo Responsável e Entretenimento
            </h4>
            <p className="text-slate-400 text-[11px]">
              Apostas e jogos de cassino destinam-se exclusivamente ao entretenimento e recreação. Não devem ser considerados fonte de renda, investimento ou solução para dificuldades financeiras. Jogue com moderação e responsabilidade.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <FileText size={14} className="text-sky-400" /> 4. Bônus, Promoções e Regras de Rollover
            </h4>
            <p className="text-slate-400 text-[11px]">
              Bônus de boas-vindas, rodadas grátis da roleta diária e saldo promocional estão sujeitos às regras de utilização da plataforma e podem requerer cumprimento de volume mínimo de apostas antes de eventuais resgates.
            </p>
          </section>

        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-slate-800 mt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            Entendido e Concordo
          </button>
        </div>

      </div>
    </div>
  );
}
