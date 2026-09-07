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
  Check
} from 'lucide-react';

import appIconImg from '../assets/images/futurobet_app_icon_1788740802769.jpg';
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

  const supportPhone = '42999687965';
  const supportMessage = encodeURIComponent('Olá, vim pela página oficial do FuturoBet e preciso de suporte.');
  const whatsappUrl = `https://wa.me/55${supportPhone}?text=${supportMessage}`;

  // Executa o fluxo de instalação realista da Play Store e direciona ao cassino
  const handleInstallClick = () => {
    if (isInstalling) return;

    try {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'Lead', { content_name: 'FuturoBet_GooglePlay_Install' });
        (window as any).fbq('track', 'InitiateCheckout', { content_name: 'Instalar_App_FuturoBet' });
      }
    } catch (e) {
      // ignore
    }

    setIsInstalling(true);
    setInstallStatus('Pendente...');
    setInstallProgress(15);

    setTimeout(() => {
      setInstallStatus('Baixando 28,4 MB (45%)...');
      setInstallProgress(45);
    }, 400);

    setTimeout(() => {
      setInstallStatus('Baixando 28,4 MB (88%)...');
      setInstallProgress(88);
    }, 800);

    setTimeout(() => {
      setInstallStatus('Instalando...');
      setInstallProgress(100);
    }, 1200);

    setTimeout(() => {
      setInstallStatus('Abrindo FuturoBet Oficial...');
      localStorage.setItem('fb_presell_dismissed', 'true');
      onEnterCasino({ directRegister: true, directGame: gameIdParam || 'fortune-tiger' });
    }, 1600);
  };

  const handleWebAccess = () => {
    localStorage.setItem('fb_presell_dismissed', 'true');
    onEnterCasino({ directRegister: false, directGame: gameIdParam || undefined });
  };

  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-[#111315] text-[#e3e3e3] flex justify-center items-start font-sans antialiased selection:bg-[#01875f] selection:text-white">
      {/* Container Mobile Centralizado idêntico ao Google Play Store Dark Mode */}
      <div className="w-full max-w-md min-h-screen min-h-[100dvh] bg-[#111315] flex flex-col justify-between relative sm:border-x border-[#2b2e33] shadow-2xl pb-16">
        
        {/* 1. BARRA SUPERIOR GOOGLE PLAY OFICIAL */}
        <header className="w-full px-4 py-3 flex items-center justify-between border-b border-[#24272c] bg-[#111315]/95 sticky top-0 z-40 backdrop-blur-md">
          {/* Logo do Google Play */}
          <div className="flex items-center gap-2 select-none">
            {/* Ícone triangular característico Google Play */}
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
                Oficial
              </span>
            </div>
          </div>

          {/* Atalho Acessar Web */}
          <button
            onClick={handleWebAccess}
            className="text-xs font-semibold text-[#8ab4f8] hover:text-[#aecbfa] flex items-center gap-0.5 px-2 py-1 rounded hover:bg-[#1f2328] transition cursor-pointer"
          >
            <span>Acessar Web</span>
            <ChevronRight size={14} />
          </button>
        </header>

        {/* CONTEÚDO PRINCIPAL DO APP */}
        <div className="px-4 pt-4 pb-2 space-y-4">
          
          {/* 2. CABEÇALHO DO APLICATIVO (ÍCONE + TÍTULO + DESENVOLVEDOR + PLAY PROTECT) */}
          <div className="flex items-start gap-4">
            {/* Ícone Oficial do App FuturoBet */}
            <div className="w-[78px] h-[78px] rounded-2xl overflow-hidden shadow-lg border border-[#2e3238] flex-shrink-0 bg-black relative">
              <img 
                src={appIconImg} 
                alt="FuturoBet Oficial App"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Informações do App */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-snug">
                FuturoBet: Jogos e Cassino
              </h1>
              <p className="text-xs text-[#00a86b] font-semibold mt-0.5 tracking-wide">
                FUTUROBET GAMING OFICIAL
              </p>
              <div className="flex items-center gap-1 text-[11px] text-[#9aa0a6] mt-1">
                <ShieldCheck size={13} className="text-[#00a86b] flex-shrink-0" />
                <span className="truncate">Verificado pelo Play Protect</span>
              </div>
            </div>
          </div>

          {/* 3. MÉTRICAS OFICIAIS DA PLAY STORE (AVALIAÇÃO, DOWNLOADS, CLASSIFICAÇÃO) */}
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

          {/* 4. BOTÃO PRINCIPAL DE INSTALAÇÃO (PADRÃO GOOGLE PLAY STORE) */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className={`w-full py-3 px-6 rounded-full font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isInstalling 
                  ? 'bg-[#005f3e] text-white cursor-wait' 
                  : 'bg-[#01875f] hover:bg-[#007451] active:bg-[#005f3e] text-white hover:shadow-[0_4px_15px_rgba(1,135,95,0.4)]'
              }`}
            >
              {isInstalling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{installStatus}</span>
                </>
              ) : (
                <>
                  <Download size={17} />
                  <span>Instalar</span>
                </>
              )}
            </button>

            {/* Barra de Progresso Realista caso esteja instalando */}
            {isInstalling && (
              <div className="w-full bg-[#24272c] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#00a86b] h-full transition-all duration-300 ease-out" 
                  style={{ width: `${installProgress}%` }}
                />
              </div>
            )}

            {/* Selos de Confirmação */}
            <div className="flex items-center justify-between text-[11px] text-[#9aa0a6] px-1 pt-0.5">
              <div className="flex items-center gap-1.5">
                <Check size={13} className="text-[#00a86b]" />
                <span>Download 100% Gratuito</span>
              </div>
              <div>
                <span>Tamanho: 28,4 MB</span>
              </div>
            </div>
          </div>

          {/* 5. DESTAQUES DO APLICATIVO (CARROSSEL DE TELAS E RECURSOS) */}
          <div className="space-y-2 pt-3 border-t border-[#24272c]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white tracking-wide">
                DESTAQUES DO APLICATIVO
              </h2>
              <span className="text-[11px] text-[#9aa0a6]">4 telas</span>
            </div>

            {/* Carrossel de screenshots do app com proporção vertical */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
              
              {/* Tela 1: Roleta da Sorte Grátis */}
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
                  GRÁTIS HOJE
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wide">
                    Roleta da Sorte
                  </div>
                  <div className="text-xs font-bold leading-tight mt-0.5">
                    1 Giro Grátis Todo Dia com Prêmios no PIX
                  </div>
                </div>
              </div>

              {/* Tela 2: Mais de 200 Jogos e Slots */}
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
                    Catálogo Completo
                  </div>
                  <div className="text-xs font-bold leading-tight mt-0.5">
                    Tiger, Ox, Mines, 777 Rush & Roletas
                  </div>
                </div>
              </div>

              {/* Tela 3: Bônus VIP & Saque PIX */}
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
                  BÔNUS VIP
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wide">
                    100% de Bônus
                  </div>
                  <div className="text-xs font-bold leading-tight mt-0.5">
                    Saques imediatos via PIX em até 10 segundos
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

          {/* 6. SEÇÃO "SOBRE ESTE APLICATIVO" (TEXTO SEGURO E CONVERSIVO PARA O META) */}
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
                O aplicativo oficial <strong>FuturoBet</strong> traz a mais completa experiência de jogos mobile e entretenimento interativo do Brasil! Desfrute de uma biblioteca completa com mais de 200 títulos consagrados, incluindo Fortune Tiger, Fortune Ox, 777 Rush, Mines e mesas ao vivo.
              </p>
              
              {showFullDescription ? (
                <>
                  <p>
                    🌟 <strong>Vantagens exclusivas do App Oficial:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[#9aa0a6]">
                    <li>Roleta da Sorte com giros gratuitos diários para membros ativos.</li>
                    <li>Depósitos e saques instantâneos via PIX (processados em poucos segundos).</li>
                    <li>Bônus exclusivo de 100% no seu primeiro depósito com saldo dobrado.</li>
                    <li>Programa oficial de afiliados com comissões contínuas no PIX.</li>
                    <li>Suporte humanizado 24 horas por dia em português via WhatsApp e Chat.</li>
                  </ul>
                  <p>
                    Segurança máxima com criptografia de ponta a ponta e jogos certificados. Baixe agora e comece a jogar em menos de 1 minuto!
                  </p>
                </>
              ) : (
                <p className="text-[#9aa0a6]">
                  Aproveite rodadas diárias na Roleta da Sorte, saques automáticos via PIX, suporte 24h e o melhor programa de indicação do mercado...{' '}
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
                Cassino & Slots
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#24272c] text-[11px] text-[#bdc1c6] font-medium">
                Entretenimento
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#24272c] text-[11px] text-[#bdc1c6] font-medium">
                Jogos Rápidos
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#24272c] text-[11px] text-[#bdc1c6] font-medium">
                Saque PIX
              </span>
            </div>
          </div>

          {/* 7. SEGURANÇA DOS DADOS (BLINDAGEM OFICIAL PADRÃO GOOGLE PLAY) */}
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
                <span>Nenhum dado financeiro sensível é repassado a terceiros</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Lock size={16} className="text-[#00a86b] flex-shrink-0" />
                <span>Dados criptografados em trânsito com segurança SSL 256-Bit</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-[#00a86b] flex-shrink-0" />
                <span>Protegido e verificado com Google Play Protect</span>
              </div>
            </div>
          </div>

          {/* 8. AVALIAÇÕES E OPINIÕES (PROVA SOCIAL ALTA CONVERSÃO) */}
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
                    <span className="text-[10px] text-[#9aa0a6]">380.412 avaliações</span>
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
                App sensacional! O melhor cassino que já joguei. Fiz meu primeiro saque de R$ 850 via PIX e caiu na conta em menos de 10 segundos. Recomendo demais!
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
                Jogos rodam muito liso sem travar nada. A roleta diária gratuita é top, todo dia entro pra girar e o suporte no WhatsApp me atendeu muito rápido.
              </p>
            </div>
          </div>

          {/* 9. INFORMAÇÕES DO APLICATIVO */}
          <div className="pt-3 border-t border-[#24272c] space-y-2 text-xs">
            <h2 className="text-sm font-bold text-white tracking-wide">
              Informações do aplicativo
            </h2>

            <div className="grid grid-cols-2 gap-2.5 text-[11px] text-[#9aa0a6]">
              <div>
                <span className="block text-white font-medium">Versão</span>
                <span>4.8.2 (Estável)</span>
              </div>
              <div>
                <span className="block text-white font-medium">Atualizado em</span>
                <span>06 de set. de 2026</span>
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
                <span className="block text-white font-medium">Oferecido por</span>
                <span className="text-[#00a86b] font-semibold">FUTUROBET OFICIAL</span>
              </div>
              <div>
                <span className="block text-white font-medium">Requisitos</span>
                <span>Android 7.0 ou sup.</span>
              </div>
            </div>
          </div>

          {/* 10. SUPORTE OFICIAL & CONTATO */}
          <div className="pt-3 border-t border-[#24272c] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Contato do desenvolvedor</span>
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
              Precisa de ajuda ou suporte técnico? Central de Atendimento 24h via WhatsApp: <strong>(42) 99968-7965</strong>.
            </p>
          </div>

        </div>

        {/* 11. BARRA FIXA INFERIOR COM BOTÃO GOOGLE PLAY DE ALTA CONVERSÃO */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-3 pb-3">
          <div className="w-full max-w-md bg-[#181a1e]/95 backdrop-blur-xl border border-[#2b2e33] rounded-2xl p-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.95)] flex items-center justify-between gap-3 pointer-events-auto">
            <div className="flex items-center gap-2.5 min-w-0 pl-1">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-[#2e3238]">
                <img src={appIconImg} alt="FuturoBet" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white truncate block">
                  FuturoBet Oficial
                </span>
                <span className="text-[10px] text-[#00a86b] font-medium truncate block">
                  Instale grátis • Bônus no 1º PIX
                </span>
              </div>
            </div>

            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="py-2.5 px-5 bg-[#01875f] hover:bg-[#007451] active:bg-[#005f3e] text-white font-bold text-xs uppercase tracking-wide rounded-full shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-1.5 flex-shrink-0"
            >
              <span>{isInstalling ? 'Instalando...' : 'Instalar'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
