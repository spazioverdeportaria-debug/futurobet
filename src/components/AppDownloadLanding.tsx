import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Play, 
  Sparkles, 
  Smartphone, 
  ChevronRight, 
  Gift, 
  Zap, 
  ArrowRight,
  ThumbsUp,
  Award
} from 'lucide-react';

import tigerSlotImg from '../assets/images/fortune_tiger_slot_screen_1785009353922.jpg';
import oxSlotImg from '../assets/images/fortune_ox_screen_1785008108345.jpg';
import tigerBannerImg from '../assets/images/banner_fortune_tiger_1785003192886.jpg';
import promoRoletaImg from '../assets/images/promo_roleta_banner_1788621267724.jpg';
import promoTigerImg from '../assets/images/promo_tiger_pagando_1788621281607.jpg';

interface AppDownloadLandingProps {
  onEnterCasino: (options?: { directRegister?: boolean; directGame?: string }) => void;
  gameIdParam?: string | null;
}

export default function AppDownloadLanding({ onEnterCasino, gameIdParam }: AppDownloadLandingProps) {
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Captura o evento nativo de instalação do PWA
  useEffect(() => {
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isApple);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Determina nome do jogo ou app baseado no parâmetro
  const appInfo = (() => {
    const p = (gameIdParam || '').toLowerCase();
    if (p.includes('ox') || p.includes('touro')) {
      return {
        title: 'Fortune Ox',
        developer: 'FUTUROBET OFICIAL',
        category: 'Casino • Casual',
        icon: oxSlotImg,
        gameTarget: 'fortune-ox'
      };
    }
    return {
      title: 'Fortune Tiger',
      developer: 'FUTUROBET OFICIAL',
      category: 'Casino • Casual',
      icon: tigerSlotImg,
      gameTarget: 'fortune-tiger'
    };
  })();

  // Ação principal do botão Obter App / Baixar
  const handleDownloadApp = async () => {
    setIsDownloading(true);

    // Dispara eventos do Pixel do Meta se estiver instalado
    try {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'Lead', { content_name: appInfo.title });
        (window as any).fbq('track', 'InitiateCheckout', { content_name: appInfo.title });
      }
    } catch (e) {
      // Ignora silenciosamente
    }

    // Marca no localStorage que o visitante já passou pela pré-landing
    localStorage.setItem('fb_presell_dismissed', 'true');

    // Simula barra de download rápida e realista estilo loja de apps (1.2s)
    let cur = 0;
    const interval = setInterval(() => {
      cur += 25;
      setDownloadProgress(cur);
      if (cur >= 100) {
        clearInterval(interval);
        
        // Se houver prompt de PWA disponível no navegador, exibe
        if (deferredPrompt) {
          try {
            deferredPrompt.prompt();
          } catch (err) {
            console.warn('PWA prompt notice:', err);
          }
        }

        // Redireciona com transição limpa para a tela do cassino com cadastro direto
        setTimeout(() => {
          onEnterCasino({ directRegister: true, directGame: appInfo.gameTarget });
        }, 300);
      }
    }, 150);
  };

  // Acesso direto pelo navegador
  const handleDirectWebAccess = () => {
    localStorage.setItem('fb_presell_dismissed', 'true');
    try {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'ViewContent', { content_name: 'DirectWebAccess' });
      }
    } catch (e) {}
    onEnterCasino({ directRegister: true });
  };

  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-[#0c1017] text-slate-100 flex justify-center items-start font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Container Mobile Centralizado com proporções perfeitas de App Store */}
      <div className="w-full max-w-md min-h-screen min-h-[100dvh] bg-[#0c1017] flex flex-col justify-between relative sm:border-x border-slate-800/80 shadow-2xl">
        
        {/* TOP BAR / SIMULAÇÃO DE CABEÇALHO DA LOJA */}
        <div className="w-full px-4 pt-3 pb-2 flex items-center justify-between border-b border-slate-800/60 bg-[#0c1017]/95 sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider text-slate-300 uppercase">
              {isIOS ? 'App Store' : 'Google Play'}
            </span>
            <span className="text-[10px] text-slate-500">•</span>
            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400" /> Oficial
            </span>
          </div>

          <button
            onClick={handleDirectWebAccess}
            className="text-[11px] font-semibold text-slate-400 hover:text-white transition flex items-center gap-0.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-800/50"
          >
            <span>Acessar Web</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* CORPO PRINCIPAL - ESTILO IDENTICO AO ANEXO */}
        <div className="flex-1 w-full px-4 py-4 space-y-4">
          
          {/* 1. CABEÇALHO DO APLICATIVO (Ícone + Título + Desenvolvedor) */}
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.6)] border border-amber-500/30 flex-shrink-0 bg-slate-900">
              <img 
                src={appInfo.icon} 
                alt={appInfo.title}
                className="w-full h-full object-cover" 
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate leading-tight">
                {appInfo.title}
              </h1>
              
              <div className="text-sm font-bold text-blue-400 mt-0.5 flex items-center gap-1.5">
                <span>{appInfo.developer}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] text-slate-300 font-medium">Verificado pelo aplicativo</span>
              </div>
            </div>
          </div>

          {/* 2. LINHA DE MÉTRICAS E AVALIAÇÕES (Idêntico ao da imagem) */}
          <div className="w-full grid grid-cols-3 py-2.5 px-2 bg-slate-900/60 rounded-2xl border border-slate-800/80 divide-x divide-slate-800/80 text-center">
            {/* Avaliação */}
            <div className="flex flex-col items-center justify-center px-1">
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-white">4,9</span>
                <Star size={13} className="text-amber-400 fill-amber-400" />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">380K+ reviews</span>
            </div>

            {/* Downloads */}
            <div className="flex flex-col items-center justify-center px-1">
              <span className="text-sm font-black text-white">50M+</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Baixando</span>
            </div>

            {/* Classificação Indicativa */}
            <div className="flex flex-col items-center justify-center px-1">
              <span className="text-sm font-black text-amber-400">21+</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Rated for 21+</span>
            </div>
          </div>

          {/* 3. BOTÃO DE AÇÃO PRINCIPAL: "Obter app na App Store" */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleDownloadApp}
              disabled={isDownloading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-500 text-white font-black text-sm tracking-wide rounded-2xl shadow-[0_6px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.6)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
            >
              {isDownloading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Instalando... {downloadProgress}%</span>
                </div>
              ) : (
                <>
                  <span>
                    {isIOS ? 'Obter app na App Store' : 'Obter app no Google Play'}
                  </span>
                  <span className="text-base">⬇</span>
                </>
              )}

              {/* Barra de progresso interna suave ao clicar */}
              {isDownloading && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-white transition-all duration-150"
                  style={{ width: `${downloadProgress}%` }}
                />
              )}
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 size={12} /> Download 100% Gratuito
              </span>
              <span>Tamanho: 28,4 MB</span>
            </div>
          </div>

          {/* 4. CAROUSEL / CARDS DE CAPTURAS DE TELA E PROMOÇÕES (Idêntico ao do Anexo) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Destaques do Jogo
              </span>
              <span className="text-[10px] text-blue-400 font-medium">3 telas</span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {/* CARD 1: Rodada Gratuita do Dia - GANHE ATÉ R$ 1.000 */}
              <div 
                onClick={handleDownloadApp}
                className="w-36 sm:w-40 flex-shrink-0 snap-start bg-gradient-to-b from-amber-950/40 to-slate-900 rounded-2xl border border-amber-500/30 overflow-hidden shadow-lg cursor-pointer hover:border-amber-400 transition transform hover:-translate-y-0.5 relative group"
              >
                <div className="h-48 sm:h-52 w-full relative overflow-hidden">
                  <img 
                    src={promoRoletaImg} 
                    alt="Rodada gratuita" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-black rounded-md uppercase">
                    Grátis Hoje
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 text-left">
                    <p className="text-[10px] font-bold text-amber-300 leading-tight">Rodada gratuita do dia</p>
                    <p className="text-xs font-black text-white leading-tight uppercase">GANHE ATÉ R$ 1.000</p>
                  </div>
                </div>
              </div>

              {/* CARD 2: Perda Diária - Cashback até 25% */}
              <div 
                onClick={handleDownloadApp}
                className="w-36 sm:w-40 flex-shrink-0 snap-start bg-gradient-to-b from-emerald-950/40 to-slate-900 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-lg cursor-pointer hover:border-emerald-400 transition transform hover:-translate-y-0.5 relative group"
              >
                <div className="h-48 sm:h-52 w-full relative overflow-hidden">
                  <img 
                    src={oxSlotImg} 
                    alt="Cashback Diário" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-emerald-500 text-black text-[9px] font-black rounded-md uppercase">
                    Proteção
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 text-left">
                    <p className="text-[10px] font-bold text-emerald-300 leading-tight">Perda diária</p>
                    <p className="text-xs font-black text-white leading-tight uppercase">CASHBACK ATÉ 25%</p>
                  </div>
                </div>
              </div>

              {/* CARD 3: Revele seus Bônus - Super Bônus até R$ 8.888 */}
              <div 
                onClick={handleDownloadApp}
                className="w-36 sm:w-40 flex-shrink-0 snap-start bg-gradient-to-b from-rose-950/40 to-slate-900 rounded-2xl border border-rose-500/30 overflow-hidden shadow-lg cursor-pointer hover:border-rose-400 transition transform hover:-translate-y-0.5 relative group"
              >
                <div className="h-48 sm:h-52 w-full relative overflow-hidden">
                  <img 
                    src={promoTigerImg} 
                    alt="Super Bônus" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-md uppercase">
                    Bônus VIP
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 text-left">
                    <p className="text-[10px] font-bold text-rose-300 leading-tight">Revele seus bônus</p>
                    <p className="text-xs font-black text-white leading-tight uppercase">ATÉ R$ 8.888</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. TEXTO EXPLICATIVO "Sobre este aplicativo" (Conforme solicitado) */}
          <div className="pt-2 space-y-2 border-t border-slate-800/80">
            <h2 className="text-base font-black text-white tracking-tight flex items-center justify-between">
              <span>Sobre este aplicativo</span>
              <ChevronRight size={18} className="text-slate-500" />
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Sobre este jogo * O jogo de slots de cassino mais quente de 2026 * O som dos rolos, as luzes na tela e a emoção da vitória! Os Casino Slots trazem o espetáculo dos slots de cassino de Las Vegas e Macau para a ponta dos seus dedos! Também traz os sons e visuais da experiência do cassino para casa e empilha seus ganhos até o céu! Quanto mais você girar, mais você ganha!
            </p>
          </div>

          {/* 6. ATUALIZADO EM E DADOS TÉCNICOS */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Informações do aplicativo
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 block">Atualizado em</span>
                <span className="font-semibold text-slate-200">06/09/2026</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 block">Versão</span>
                <span className="font-semibold text-slate-200">4.8.2 (Estável)</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 block">Compatibilidade</span>
                <span className="font-semibold text-slate-200">iOS & Android</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60">
                <span className="text-[10px] text-slate-500 block">Segurança</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={12} /> Protegido
                </span>
              </div>
            </div>
          </div>

          {/* 7. SEGURANÇA DOS DADOS (Estilo Google Play Store / Apple) */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Lock size={14} className="text-emerald-400" />
                <span>Segurança dos dados</span>
              </h3>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              A segurança começa com a compreensão de como o aplicativo processa e protege seus acessos:
            </p>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px]">Nenhum dado é compartilhado com terceiros não autorizados.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px]">Os dados são criptografados em trânsito com certificado SSL 256-Bit.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px]">Saques e pagamentos auditados e validados via Banco Central (PIX).</span>
              </div>
            </div>
          </div>

          {/* 8. AVALIAÇÕES DE JOGADORES REAIS (PROVA SOCIAL ALTA CONVERSÃO) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80 pb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1">
                <span>Avaliações e opiniões</span>
                <span className="text-amber-400 font-black ml-1">4.9 ★</span>
              </h3>
              <span className="text-[11px] text-slate-500">Todas verificadas</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/70 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Carlos Eduardo M.</span>
                  <span className="text-amber-400 text-[10px]">★★★★★</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  "Baixei direto pelo anúncio e já resgatei o bônus de boas-vindas. Saquei R$ 320 no PIX em menos de 2 minutos. Muito rápido!"
                </p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/70 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Fernanda Lima</span>
                  <span className="text-amber-400 text-[10px]">★★★★★</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  "O aplicativo é muito leve, não esquenta o celular e os gráficos do tigrinho rodam sem travar nada. 10/10."
                </p>
              </div>
            </div>

            {/* BOTÃO SECUNDÁRIO FIXO OU INFERIOR */}
            <div className="pt-2">
              <button
                onClick={handleDownloadApp}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white font-bold text-xs rounded-xl border border-slate-700/80 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Instalar Agora e Ganhar Bônus</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
