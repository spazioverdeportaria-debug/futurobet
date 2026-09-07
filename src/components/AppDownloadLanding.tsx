import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  ArrowRight,
  MessageCircle,
  Share2,
  Info,
  Download,
  Check,
  Globe,
  Smartphone,
  Award,
  FileCheck,
  Building2
} from 'lucide-react';

import appIconImg from '../assets/images/futurobet_app_icon_1788740802769.jpg';
import playstoreBannerImg from '../assets/images/futurobet_playstore_banner_1788816332729.jpg';
import promoRoletaImg from '../assets/images/promo_roleta_banner_1788621267724.jpg';
import promoTigerImg from '../assets/images/promo_tiger_pagando_1788621281607.jpg';
import gamesScreenImg from '../assets/images/vegasbet_games_screen_1785002600335.jpg';
import oxSlotImg from '../assets/images/fortune_ox_screen_1785008108345.jpg';

interface AppDownloadLandingProps {
  onEnterCasino: (options?: { directRegister?: boolean; directGame?: string }) => void;
  gameIdParam?: string | null;
}

export default function AppDownloadLanding({ onEnterCasino, gameIdParam }: AppDownloadLandingProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStatus, setInstallStatus] = useState<string>('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showLegalDetails, setShowLegalDetails] = useState(false);

  const supportPhone = '42999687965';
  const supportMessage = encodeURIComponent('Olá, vim pela página oficial do FuturoBet e preciso de suporte.');
  const whatsappUrl = `https://wa.me/55${supportPhone}?text=${supportMessage}`;

  // Executa o fluxo de instalação realista do App no celular e abre o cassino
  const handleInstallClick = () => {
    if (isInstalling) return;

    try {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'Lead', { content_name: 'FuturoBet_Instalar_Celular' });
        (window as any).fbq('track', 'InitiateCheckout', { content_name: 'Download_App_Mobile' });
      }
    } catch (e) {
      // ignore
    }

    setIsInstalling(true);
    setInstallStatus('Verificando compatibilidade com seu aparelho...');
    setInstallProgress(20);

    setTimeout(() => {
      setInstallStatus('Baixando pacote do App (28,4 MB)...');
      setInstallProgress(55);
    }, 450);

    setTimeout(() => {
      setInstallStatus('Verificando integridade com Google Play Protect...');
      setInstallProgress(85);
    }, 900);

    setTimeout(() => {
      setInstallStatus('Criando atalho na tela inicial do celular...');
      setInstallProgress(100);
    }, 1300);

    setTimeout(() => {
      setInstallStatus('Abrindo FuturoBet Oficial...');
      localStorage.setItem('fb_presell_dismissed', 'true');
      onEnterCasino({ directRegister: true, directGame: gameIdParam || undefined });
    }, 1700);
  };

  // Acesso direto sem baixar nada (Jogar na Web)
  const handleWebAccess = () => {
    try {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'ViewContent', { content_name: 'Jogar_Direto_Web' });
      }
    } catch (e) {
      // ignore
    }
    localStorage.setItem('fb_presell_dismissed', 'true');
    onEnterCasino({ directRegister: false, directGame: gameIdParam || undefined });
  };

  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-[#111315] text-[#e3e3e3] flex justify-center items-start font-sans antialiased selection:bg-[#01875f] selection:text-white">
      {/* Container Mobile Centralizado idêntico ao Google Play Store Dark Mode */}
      <div className="w-full max-w-md min-h-screen min-h-[100dvh] bg-[#111315] flex flex-col justify-between relative sm:border-x border-[#2b2e33] shadow-2xl pb-24">
        
        {/* 1. BARRA SUPERIOR GOOGLE PLAY OFICIAL */}
        <header className="w-full px-4 py-2.5 flex items-center justify-between border-b border-[#24272c] bg-[#111315]/95 sticky top-0 z-40 backdrop-blur-md">
          {/* Logo do Google Play */}
          <div className="flex items-center gap-2 select-none">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 40 40" fill="none">
              <path d="M7.4 3.7C6.8 4.4 6.5 5.4 6.5 6.7V33.3C6.5 34.6 6.8 35.6 7.4 36.3L7.5 36.4L25.3 18.6V18.2L7.5 3.6L7.4 3.7Z" fill="#00D3FF"/>
              <path d="M31.2 24.5L25.3 18.6V18.2L31.2 12.3L31.4 12.4L38.4 16.4C40.4 17.5 40.4 19.3 38.4 20.4L31.4 24.4L31.2 24.5Z" fill="#FFCE00"/>
              <path d="M31.4 24.4L25.3 18.4L7.4 36.3C8.1 37 9.2 37.1 10.5 36.4L31.4 24.4Z" fill="#FF375F"/>
              <path d="M31.4 12.4L10.5 0.4C9.2 -0.3 8.1 -0.2 7.4 0.5L25.3 18.4L31.4 12.4Z" fill="#00E676"/>
            </svg>
            <div className="flex items-center gap-1.5 font-sans">
              <span className="text-white text-sm font-bold tracking-tight">Google Play</span>
              <span className="text-[#9aa0a6] text-xs font-normal">•</span>
              <span className="text-[#00a86b] text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} className="text-[#00a86b]" />
                Verificado
              </span>
            </div>
          </div>

          {/* Atalho Acessar Web */}
          <button
            onClick={handleWebAccess}
            className="text-xs font-semibold text-[#8ab4f8] hover:text-[#aecbfa] flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-[#181a1e] border border-[#2b2e33] transition cursor-pointer"
          >
            <Globe size={12} className="text-[#8ab4f8]" />
            <span>Versão Web</span>
            <ChevronRight size={13} />
          </button>
        </header>

        {/* 2. CAPA OFICIAL DE DESTAQUE DO CASSINO (FEATURE GRAPHIC DO GOOGLE PLAY) */}
        <div className="w-full relative aspect-[16/9] overflow-hidden bg-black border-b border-[#24272c] group">
          <img 
            src={playstoreBannerImg} 
            alt="FuturoBet Cassino Oficial - Google Play Feature Graphic"
            className="w-full h-full object-cover"
          />
          {/* Gradiente para mesclar com o conteúdo da loja */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-black/30 to-transparent" />
          
          {/* Selos Oficiais Sobrepostos na Capa */}
          <div className="absolute top-2.5 left-3 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase flex items-center gap-1 shadow-sm">
              <Award size={11} className="text-amber-400" />
              Cassino Oficial Brasil
            </span>
            <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-[#00a86b]/40 text-[#00a86b] font-bold text-[10px] uppercase flex items-center gap-1 shadow-sm">
              <CheckCircle2 size={11} className="text-[#00a86b]" />
              SPA / MF
            </span>
          </div>

          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
            <span className="font-medium drop-shadow-md">Aplicativo Oficial de Apostas & Jogos</span>
            <span className="text-amber-400 font-bold drop-shadow-md">100% Bônus no 1º PIX</span>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL DO APP */}
        <div className="px-4 pt-3 pb-2 space-y-4">
          
          {/* 3. CABEÇALHO DO APLICATIVO (ÍCONE DO CASSINO + TÍTULO + DESENVOLVEDOR + REGULAMENTAÇÃO) */}
          <div className="flex items-start gap-3.5">
            {/* Ícone Oficial do Cassino FuturoBet */}
            <div className="w-[82px] h-[82px] rounded-2xl overflow-hidden shadow-xl border border-[#2e3238] flex-shrink-0 bg-black relative">
              <img 
                src={appIconImg} 
                alt="FuturoBet Oficial App"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Informações do App */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                FuturoBet: Jogos e Cassino
              </h1>
              <p className="text-xs text-[#00a86b] font-semibold mt-0.5 tracking-wide flex items-center gap-1">
                <span>FUTUROBET ENTRETENIMENTO BRASIL</span>
              </p>
              
              {/* Selo Play Protect e Regulamentação */}
              <div className="flex flex-col gap-0.5 mt-1.5">
                <div className="flex items-center gap-1 text-[11px] text-[#9aa0a6]">
                  <ShieldCheck size={13} className="text-[#00a86b] flex-shrink-0" />
                  <span className="truncate">Verificado pelo Play Protect</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-amber-300/90 font-medium">
                  <FileCheck size={12} className="text-amber-400 flex-shrink-0" />
                  <span className="truncate">Conforme Portaria SPA/MF (Min. da Fazenda)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. MÉTRICAS OFICIAIS DA PLAY STORE (AVALIAÇÃO, DOWNLOADS, CLASSIFICAÇÃO) */}
          <div className="flex items-center justify-between py-2 border-y border-[#24272c] text-center">
            {/* Avaliação */}
            <div className="flex-1 px-1">
              <div className="flex items-center justify-center gap-1 font-bold text-sm text-white">
                <span>4,9</span>
                <Star size={13} className="fill-[#e8eaed] text-[#e8eaed]" />
              </div>
              <div className="text-[11px] text-[#9aa0a6] mt-0.5">380 mil avaliações</div>
            </div>

            <div className="w-[1px] h-7 bg-[#24272c]" />

            {/* Downloads */}
            <div className="flex-1 px-1">
              <div className="font-bold text-sm text-white">50 mi+</div>
              <div className="text-[11px] text-[#9aa0a6] mt-0.5">Downloads</div>
            </div>

            <div className="w-[1px] h-7 bg-[#24272c]" />

            {/* Classificação Indicativa */}
            <div className="flex-1 px-1 flex flex-col items-center">
              <div className="w-5 h-5 rounded border border-[#9aa0a6] flex items-center justify-center text-[10px] font-black text-white bg-black/40">
                18+
              </div>
              <div className="text-[11px] text-[#9aa0a6] mt-0.5">Não recomendado - 18</div>
            </div>
          </div>

          {/* 5. OS 2 BOTÕES DE ESCOLHA (BAIXAR NO CELULAR OU JOGAR AGORA NA WEB) */}
          <div className="space-y-2.5 pt-1">
            <div className="text-xs text-white/80 font-medium flex items-center justify-between px-0.5">
              <span>Escolha como deseja acessar:</span>
              <span className="text-[11px] text-[#00a86b] font-semibold">Grátis & Seguro</span>
            </div>

            {/* Opção 1: Baixar e Deixar no Celular (Botão Verde Play Store) */}
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-between cursor-pointer shadow-lg border border-[#00a86b]/40 ${
                isInstalling 
                  ? 'bg-[#005f3e] text-white cursor-wait' 
                  : 'bg-[#01875f] hover:bg-[#007451] active:bg-[#005f3e] text-white hover:shadow-[0_4px_20px_rgba(1,135,95,0.45)]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-black/25 flex items-center justify-center flex-shrink-0">
                  <Smartphone size={18} />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-sm font-bold">
                    {isInstalling ? 'Instalando Aplicativo...' : 'Instalar e Deixar no Celular'}
                  </div>
                  <div className="text-[11px] text-emerald-100 font-normal">
                    {isInstalling ? installStatus : 'Adicionar atalho rápido na sua tela inicial'}
                  </div>
                </div>
              </div>

              {!isInstalling && (
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Download size={15} />
                </div>
              )}
            </button>

            {/* Barra de Progresso Realista caso esteja instalando */}
            {isInstalling && (
              <div className="w-full bg-[#24272c] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#00a86b] h-full transition-all duration-300 ease-out shadow-[0_0_8px_#00a86b]" 
                  style={{ width: `${installProgress}%` }}
                />
              </div>
            )}

            {/* Opção 2: Jogar Agora na Web (Sem Baixar Nada) */}
            <button
              onClick={handleWebAccess}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-between cursor-pointer bg-[#181a1e] hover:bg-[#202328] active:bg-[#141619] text-white border border-[#2e3238] shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#24272c] flex items-center justify-center flex-shrink-0 text-[#8ab4f8]">
                  <Globe size={17} />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-sm font-bold text-[#e3e3e3]">
                    Jogar Agora na Web
                  </div>
                  <div className="text-[11px] text-[#9aa0a6] font-normal">
                    Acesso imediato no navegador sem ocupar espaço
                  </div>
                </div>
              </div>

              <div className="text-[#8ab4f8] flex items-center gap-0.5 text-xs font-bold">
                <span>Acessar</span>
                <ChevronRight size={15} />
              </div>
            </button>

            {/* Selos de Confirmação Técnicos */}
            <div className="flex items-center justify-between text-[11px] text-[#9aa0a6] px-1 pt-0.5">
              <div className="flex items-center gap-1.5">
                <Check size={13} className="text-[#00a86b]" />
                <span>Aplicativo Leve (28,4 MB)</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck size={13} />
                <span>Livre de vírus e malware</span>
              </div>
            </div>
          </div>

          {/* 6. SELO ESPECIAL: REGULAMENTAÇÃO MINISTÉRIO DA FAZENDA & RECEITA FEDERAL */}
          <div className="p-3 bg-gradient-to-r from-[#181b20] to-[#14161a] rounded-xl border border-amber-500/30 shadow-md space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-400">
                <Building2 size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wide">
                    Regulamentação Oficial no Brasil
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    SPA / MF
                  </span>
                </div>
                <p className="text-[11px] text-[#bdc1c6] leading-relaxed mt-0.5">
                  Operação autorizada e em estrita conformidade com as diretrizes da <strong>Secretaria de Prêmios e Apostas do Ministério da Fazenda (SPA/MF)</strong> e normas fiscais vigentes da <strong>Receita Federal</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#2a2d33] text-[10px] text-[#9aa0a6]">
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-[#00a86b] flex-shrink-0" />
                <span>Transações auditadas via PIX</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-[#00a86b] flex-shrink-0" />
                <span>Jogo Responsável (+18 anos)</span>
              </div>
            </div>
          </div>

          {/* 7. DESTAQUES DO APLICATIVO (CARROSSEL COM CAPTURAS DO CASSINO COMPLETO) */}
          <div className="space-y-2 pt-2 border-t border-[#24272c]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white tracking-wide">
                DESTAQUES DO APLICATIVO
              </h2>
              <span className="text-[11px] text-[#9aa0a6]">Telas do Cassino</span>
            </div>

            {/* Carrossel de screenshots do app com proporção vertical */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
              
              {/* Tela 1: Biblioteca com +200 Jogos */}
              <div 
                onClick={handleInstallClick}
                className="w-44 h-72 rounded-2xl overflow-hidden border border-[#2b2e33] flex-shrink-0 relative cursor-pointer snap-start bg-[#181a1e] group"
              >
                <img 
                  src={gamesScreenImg} 
                  alt="Biblioteca de Jogos FuturoBet"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
                
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#01875f] text-white font-bold text-[9px] rounded-full uppercase">
                  +200 JOGOS
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <div className="text-[11px] text-[#8ab4f8] font-bold uppercase tracking-wide">
                    Catálogo Oficial
                  </div>
                  <div className="text-xs font-bold leading-tight mt-0.5">
                    Slots, Mines, Crash, Roletas & Mesas ao Vivo
                  </div>
                </div>
              </div>

              {/* Tela 2: Roleta da Sorte Grátis */}
              <div 
                onClick={handleInstallClick}
                className="w-44 h-72 rounded-2xl overflow-hidden border border-[#2b2e33] flex-shrink-0 relative cursor-pointer snap-start bg-[#181a1e] group"
              >
                <img 
                  src={promoRoletaImg} 
                  alt="Roleta da Sorte Grátis"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
                
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#00a86b] text-black font-black text-[9px] rounded-full uppercase">
                  GRÁTIS TODO DIA
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wide">
                    Roda da Fortuna
                  </div>
                  <div className="text-xs font-bold leading-tight mt-0.5">
                    Giro diário gratuito com prêmios creditados via PIX
                  </div>
                </div>
              </div>

              {/* Tela 3: Bônus VIP & Saque PIX Instantâneo */}
              <div 
                onClick={handleInstallClick}
                className="w-44 h-72 rounded-2xl overflow-hidden border border-[#2b2e33] flex-shrink-0 relative cursor-pointer snap-start bg-[#181a1e] group"
              >
                <img 
                  src={promoTigerImg} 
                  alt="Bônus VIP e Saques Imediatos"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
                
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-amber-500 text-black font-black text-[9px] rounded-full uppercase">
                  BÔNUS 100%
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wide">
                    Saque Automático
                  </div>
                  <div className="text-xs font-bold leading-tight mt-0.5">
                    Retiradas via chave PIX em 10 segundos
                  </div>
                </div>
              </div>

              {/* Tela 4: Indique e Ganhe & Clube de Afiliados */}
              <div 
                onClick={handleInstallClick}
                className="w-44 h-72 rounded-2xl overflow-hidden border border-[#2b2e33] flex-shrink-0 relative cursor-pointer snap-start bg-[#181a1e] group"
              >
                <img 
                  src={oxSlotImg} 
                  alt="Programa de Afiliados e Indicação"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
                
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-purple-500 text-white font-black text-[9px] rounded-full uppercase">
                  INDIQUE & GANHE
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <div className="text-[11px] text-purple-300 font-bold uppercase tracking-wide">
                    Comissão Vitalícia
                  </div>
                  <div className="text-xs font-bold leading-tight mt-0.5">
                    5% sobre movimentação com saques diários
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 8. SEÇÃO "SOBRE ESTE APLICATIVO" (TEXTO INSTITUCIONAL AUDITADO) */}
          <div className="pt-3 border-t border-[#24272c] space-y-2">
            <div 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="flex items-center justify-between cursor-pointer group"
            >
              <h2 className="text-sm font-bold text-white tracking-wide">
                Sobre este aplicativo
              </h2>
              <ChevronRight 
                size={18} 
                className={`text-[#9aa0a6] group-hover:text-white transition-transform ${showFullDescription ? 'rotate-90' : ''}`} 
              />
            </div>

            <div className="text-xs text-[#bdc1c6] leading-relaxed space-y-2 font-normal">
              <p>
                O aplicativo oficial <strong>FuturoBet</strong> é a plataforma de entretenimento digital e apostas de quota fixa que reúne os jogos online mais populares do mercado. Desenvolvido para oferecer máxima estabilidade, segurança e agilidade em dispositivos móveis Android.
              </p>
              
              {showFullDescription ? (
                <>
                  <p>
                    🌟 <strong>Recursos e Vantagens Oficiais:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[#9aa0a6]">
                    <li>Biblioteca com mais de 200 títulos certificados de provedores internacionais.</li>
                    <li>Roda da Fortuna diária com chances gratuitas de prêmios no PIX para usuários ativos.</li>
                    <li>Depósitos e saques instantâneos por chave PIX aprovados pelo Banco Central do Brasil.</li>
                    <li>Bônus exclusivo de boas-vindas com 100% de acréscimo no seu primeiro depósito.</li>
                    <li>Programa de afiliados com links de convite e relatórios de comissões em tempo real.</li>
                    <li>Central de suporte humanizado 24 horas por dia em português via WhatsApp e chat.</li>
                  </ul>
                  <div className="p-2.5 bg-[#14161a] rounded-lg border border-[#24272c] text-[11px] text-[#9aa0a6] space-y-1 mt-2">
                    <p className="font-semibold text-white">⚖️ Aviso de Jogo Responsável e Legislação:</p>
                    <p>
                      O uso deste aplicativo é estritamente proibido para menores de 18 anos (+18). O jogo deve ser praticado como forma de entretenimento e recreação. Jogue com moderação e responsabilidade financeira.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-[#9aa0a6]">
                  Aproveite mais de 200 jogos exclusivos, giros na Roda da Fortuna, saques automáticos via PIX e suporte humanizado 24h em conformidade com as normas federais...{' '}
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullDescription(true);
                    }}
                    className="text-[#8ab4f8] font-semibold cursor-pointer"
                  >
                    Ler mais
                  </span>
                </p>
              )}
            </div>

            {/* Tags do App */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#24272c] text-[11px] text-[#bdc1c6] font-medium">
                Cassino & Jogos
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#24272c] text-[11px] text-[#bdc1c6] font-medium">
                Apostas de Quota Fixa
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#24272c] text-[11px] text-[#bdc1c6] font-medium">
                Ministério da Fazenda
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#24272c] text-[11px] text-[#bdc1c6] font-medium">
                Saque PIX 10s
              </span>
            </div>
          </div>

          {/* 9. SEGURANÇA DOS DADOS (BLINDAGEM OFICIAL PADRÃO GOOGLE PLAY) */}
          <div className="pt-3 border-t border-[#24272c] space-y-2">
            <h2 className="text-sm font-bold text-white tracking-wide">
              Segurança dos dados
            </h2>
            <p className="text-[11px] text-[#9aa0a6] leading-relaxed">
              A segurança começa com o entendimento de como os desenvolvedores coletam e compartilham seus dados. As práticas de privacidade e segurança podem variar de acordo com o uso.
            </p>

            <div className="p-3 bg-[#181a1e] rounded-xl border border-[#24272c] space-y-2.5 text-xs text-[#bdc1c6]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-[#00a86b] flex-shrink-0" />
                <span>Nenhum dado financeiro sensível é compartilhado com terceiros</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Lock size={16} className="text-[#00a86b] flex-shrink-0" />
                <span>Criptografia de ponta a ponta (SSL 256-Bit e TLS 1.3)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-[#00a86b] flex-shrink-0" />
                <span>Auditado e protegido pelo Google Play Protect</span>
              </div>
            </div>
          </div>

          {/* 10. AVALIAÇÕES E OPINIÕES (PROVA SOCIAL) */}
          <div className="pt-3 border-t border-[#24272c] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Avaliações e opiniões
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-white">4,9</span>
                  <div>
                    <div className="flex text-[#e8eaed]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={13} className="fill-[#e8eaed]" />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#9aa0a6]">380.412 avaliações no Brasil</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Avaliação 1 */}
            <div className="p-3 bg-[#181a1e] rounded-xl border border-[#24272c] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Carlos Eduardo M.</span>
                <span className="text-[10px] text-[#9aa0a6]">Há 1 dia</span>
              </div>
              <div className="flex text-[#e8eaed]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={11} className="fill-[#e8eaed]" />
                ))}
              </div>
              <p className="text-[#bdc1c6] text-[11px] leading-relaxed">
                App excelente! O melhor cassino que já joguei. Fiz meu primeiro saque de R$ 850 via PIX e caiu na conta em menos de 10 segundos. Recomendo demais!
              </p>
            </div>

            {/* Avaliação 2 */}
            <div className="p-3 bg-[#181a1e] rounded-xl border border-[#24272c] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Larissa Santos</span>
                <span className="text-[10px] text-[#9aa0a6]">Há 3 dias</span>
              </div>
              <div className="flex text-[#e8eaed]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={11} className="fill-[#e8eaed]" />
                ))}
              </div>
              <p className="text-[#bdc1c6] text-[11px] leading-relaxed">
                Jogos rodam muito liso sem travar nada. A roleta diária gratuita é top, todo dia entro pra girar e o suporte no WhatsApp me atendeu super rápido.
              </p>
            </div>
          </div>

          {/* 11. INFORMAÇÕES TÉCNICAS E REGULATÓRIAS DO APLICATIVO */}
          <div className="pt-3 border-t border-[#24272c] space-y-2 text-xs">
            <h2 className="text-sm font-bold text-white tracking-wide">
              Informações do aplicativo & Legalidade
            </h2>

            <div className="grid grid-cols-2 gap-2.5 text-[11px] text-[#9aa0a6]">
              <div>
                <span className="block text-white font-medium">Versão</span>
                <span>4.8.2 (Estável)</span>
              </div>
              <div>
                <span className="block text-white font-medium">Atualizado em</span>
                <span>07 de set. de 2026</span>
              </div>
              <div>
                <span className="block text-white font-medium">Downloads</span>
                <span>50.000.000+</span>
              </div>
              <div>
                <span className="block text-white font-medium">Tamanho</span>
                <span>28,4 MB</span>
              </div>
              <div>
                <span className="block text-white font-medium">Desenvolvedor</span>
                <span className="text-[#00a86b] font-semibold">FUTUROBET BRASIL LTDA</span>
              </div>
              <div>
                <span className="block text-white font-medium">Supervisão</span>
                <span className="text-amber-400 font-semibold">SPA / Ministério da Fazenda</span>
              </div>
            </div>
          </div>

          {/* 12. SUPORTE OFICIAL & CONTATO */}
          <div className="pt-3 border-t border-[#24272c] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Contato e Atendimento Oficial</span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#00a86b] hover:underline flex items-center gap-1"
              >
                <MessageCircle size={13} />
                <span>WhatsApp 24h</span>
              </a>
            </div>
            <p className="text-[11px] text-[#9aa0a6]">
              Dúvidas sobre o download, jogos ou saques? Central de Atendimento 24h via WhatsApp: <strong>(42) 99968-7965</strong>.
            </p>
          </div>

        </div>

        {/* 13. BARRA FIXA INFERIOR COM AS DUAS OPÇÕES DIRETAS (INSTALAR OU JOGAR NA WEB) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-3 pb-3">
          <div className="w-full max-w-md bg-[#181a1e]/95 backdrop-blur-xl border border-[#2b2e33] rounded-2xl p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.95)] flex items-center justify-between gap-2 pointer-events-auto">
            
            {/* Ícone e Nome do Cassino */}
            <div className="flex items-center gap-2 min-w-0 pl-0.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-[#2e3238]">
                <img src={appIconImg} alt="FuturoBet" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white truncate block">
                  FuturoBet Oficial
                </span>
                <span className="text-[10px] text-[#00a86b] font-medium truncate block">
                  Regulamentado SPA/MF
                </span>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleWebAccess}
                className="py-2 px-3 bg-[#24272c] hover:bg-[#2d3137] text-white font-medium text-[11px] rounded-xl transition cursor-pointer flex items-center gap-1"
              >
                <Globe size={12} className="text-[#8ab4f8]" />
                <span>Web</span>
              </button>

              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="py-2.5 px-4 bg-[#01875f] hover:bg-[#007451] active:bg-[#005f3e] text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Smartphone size={13} />
                <span>{isInstalling ? 'Instalando...' : 'Instalar App'}</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

