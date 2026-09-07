import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Play, 
  Sparkles, 
  ChevronRight, 
  Gift, 
  Zap, 
  ArrowRight,
  MessageCircle,
  Users,
  TrendingUp,
  Award,
  Wallet,
  Clock,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

import tigerSlotImg from '../assets/images/fortune_tiger_slot_screen_1785009353922.jpg';
import oxSlotImg from '../assets/images/fortune_ox_screen_1785008108345.jpg';
import rabbitSlotImg from '../assets/images/fortune_rabbit_slot_screen_1785006591458.jpg';
import luckyTigerGoldImg from '../assets/images/lucky_tiger_gold_slot_1788738484588.jpg';
import sevenRushImg from '../assets/images/seven_rush_slot_1788738497552.jpg';
import bingoManiaImg from '../assets/images/bingo_mania_slot_1788738511110.jpg';
import promoRoletaImg from '../assets/images/promo_roleta_banner_1788621267724.jpg';
import promoTigerImg from '../assets/images/promo_tiger_pagando_1788621281607.jpg';
import wheelBlitzImg from '../assets/images/wheel_blitz_slot_1788619037026.jpg';
import deathDominionImg from '../assets/images/death_dominion_slot_1788619080433.jpg';

interface AppDownloadLandingProps {
  onEnterCasino: (options?: { directRegister?: boolean; directGame?: string }) => void;
  gameIdParam?: string | null;
}

interface ShowcaseGame {
  id: string;
  name: string;
  provider: string;
  category: 'slots' | 'crash' | 'novos';
  rtp: string;
  image: string;
  badge: 'HOT' | 'PAGANDO' | 'NOVO' | 'TURBO' | 'POPULAR';
  accentColor: string;
  multiplier: string;
}

const SHOWCASE_GAMES: ShowcaseGame[] = [
  {
    id: 'fortune-tiger',
    name: 'Fortune Tiger',
    provider: 'PG SOFT',
    category: 'slots',
    rtp: '96.81%',
    image: tigerSlotImg,
    badge: 'HOT',
    accentColor: '#f59e0b',
    multiplier: 'x2.500',
  },
  {
    id: 'fortune-ox',
    name: 'Fortune Ox',
    provider: 'PG SOFT',
    category: 'slots',
    rtp: '96.75%',
    image: oxSlotImg,
    badge: 'PAGANDO',
    accentColor: '#ef4444',
    multiplier: 'x2.000',
  },
  {
    id: 'lucky-tiger-gold',
    name: 'Lucky Tiger Gold',
    provider: 'PRAGMATIC PLAY',
    category: 'slots',
    rtp: '96.50%',
    image: luckyTigerGoldImg,
    badge: 'POPULAR',
    accentColor: '#f59e0b',
    multiplier: 'x25.000',
  },
  {
    id: '777-rush',
    name: '777 Rush',
    provider: 'PRAGMATIC PLAY',
    category: 'slots',
    rtp: '96.50%',
    image: sevenRushImg,
    badge: 'TURBO',
    accentColor: '#ef4444',
    multiplier: 'x2.000',
  },
  {
    id: 'gates-of-olympus',
    name: 'Gates of Olympus',
    provider: 'PRAGMATIC PLAY',
    category: 'slots',
    rtp: '96.50%',
    image: 'https://fruityslots.com/wp-content/uploads/2021/05/gates-of-olympus-slot-logo.jpg',
    badge: 'HOT',
    accentColor: '#3b82f6',
    multiplier: 'x5.000',
  },
  {
    id: 'mines',
    name: 'Mines',
    provider: 'SPRIBE',
    category: 'crash',
    rtp: '97.00%',
    image: 'https://www.gazetavirtual.com.br/wp-content/uploads/2023/05/Mines.png',
    badge: 'HOT',
    accentColor: '#10b981',
    multiplier: 'x10.000',
  },
  {
    id: 'bingo-mania',
    name: 'Bingo Mania',
    provider: 'PRAGMATIC PLAY',
    category: 'novos',
    rtp: '96.51%',
    image: bingoManiaImg,
    badge: 'NOVO',
    accentColor: '#8b5cf6',
    multiplier: 'x5.000',
  },
  {
    id: 'fortune-rabbit',
    name: 'Fortune Rabbit',
    provider: 'PG SOFT',
    category: 'slots',
    rtp: '96.75%',
    image: rabbitSlotImg,
    badge: 'PAGANDO',
    accentColor: '#ec4899',
    multiplier: 'x5.000',
  },
  {
    id: 'sugar-rush',
    name: 'Sugar Rush 1000',
    provider: 'PRAGMATIC PLAY',
    category: 'slots',
    rtp: '96.53%',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR07w2a-Wq0Yv18L3-oD45-zIeFkS6pL9G4kg&s',
    badge: 'HOT',
    accentColor: '#f43f5e',
    multiplier: 'x25.000',
  },
  {
    id: 'aviator',
    name: 'Aviator',
    provider: 'SPRIBE',
    category: 'crash',
    rtp: '97.00%',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6sJ5zR7W5h8iQp3eY2j0tV4X7z9k1B3m4gA&s',
    badge: 'TURBO',
    accentColor: '#ef4444',
    multiplier: 'x10.000',
  },
];

const RECENT_WINNERS = [
  { name: 'Lucas M.', amount: 'R$ 3.840,00', game: 'Gates of Olympus', time: 'Há 1 min' },
  { name: 'Fernanda L.', amount: 'R$ 1.920,00', game: 'Fortune Tiger', time: 'Há 2 min' },
  { name: 'Gabriel S.', amount: 'R$ 5.400,00', game: 'Lucky Tiger Gold', time: 'Há 3 min' },
  { name: 'Rafaela C.', amount: 'R$ 950,00', game: 'Mines', time: 'Há 5 min' },
];

export default function AppDownloadLanding({ onEnterCasino, gameIdParam }: AppDownloadLandingProps) {
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'slots' | 'crash' | 'novos'>('todos');
  const [activeWinnerIndex, setActiveWinnerIndex] = useState(0);

  const supportPhone = '42999687965';
  const supportMessage = encodeURIComponent('Olá, preciso de suporte no FuturoBet.');
  const whatsappUrl = `https://wa.me/55${supportPhone}?text=${supportMessage}`;

  // Rotação suave dos ganhadores em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWinnerIndex((prev) => (prev + 1) % RECENT_WINNERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Determina o jogo em destaque se veio por parâmetro de anúncio
  const featuredGame = (() => {
    const p = (gameIdParam || '').toLowerCase();
    if (p.includes('ox') || p.includes('touro')) {
      return SHOWCASE_GAMES.find((g) => g.id === 'fortune-ox') || SHOWCASE_GAMES[0];
    }
    if (p.includes('lucky') || p.includes('gold')) {
      return SHOWCASE_GAMES.find((g) => g.id === 'lucky-tiger-gold') || SHOWCASE_GAMES[0];
    }
    if (p.includes('777') || p.includes('rush')) {
      return SHOWCASE_GAMES.find((g) => g.id === '777-rush') || SHOWCASE_GAMES[0];
    }
    if (p.includes('mines')) {
      return SHOWCASE_GAMES.find((g) => g.id === 'mines') || SHOWCASE_GAMES[0];
    }
    return SHOWCASE_GAMES[0]; // Fortune Tiger padrão
  })();

  const handleRegisterAndPlay = (gameId?: string) => {
    try {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'Lead', { content_name: gameId || 'FuturoBet_Landing' });
        (window as any).fbq('track', 'InitiateCheckout', { content_name: 'Cadastro_FuturoBet' });
      }
    } catch (e) {
      // ignore
    }
    localStorage.setItem('fb_presell_dismissed', 'true');
    onEnterCasino({ directRegister: true, directGame: gameId || featuredGame.id });
  };

  const handleLoginDirect = () => {
    localStorage.setItem('fb_presell_dismissed', 'true');
    onEnterCasino({ directRegister: false });
  };

  const filteredGames = SHOWCASE_GAMES.filter((g) => {
    if (selectedCategory === 'todos') return true;
    return g.category === selectedCategory;
  });

  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-[#060a14] text-slate-100 flex justify-center items-start font-sans antialiased selection:bg-amber-400 selection:text-black">
      {/* Container Mobile Centralizado com layout de alta conversão */}
      <div className="w-full max-w-md min-h-screen min-h-[100dvh] bg-[#080d1a] flex flex-col justify-between relative sm:border-x border-slate-800/80 shadow-[0_0_50px_rgba(0,0,0,0.9)] pb-24">
        
        {/* 1. TOPO OFICIAL FUTUROBET (LOGO + SUPORTE + ENTRAR) */}
        <header className="w-full px-4 py-3 flex items-center justify-between border-b border-amber-500/20 bg-[#070b16]/95 sticky top-0 z-40 backdrop-blur-md">
          {/* Logo Oficial FuturoBet */}
          <div 
            onClick={handleLoginDirect}
            className="flex items-center cursor-pointer select-none group"
          >
            <div className="flex items-center font-black text-2xl tracking-tighter uppercase font-sans leading-none">
              <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
                FUTURO
              </span>
              <span className="text-amber-400 drop-shadow-[0_2px_12px_rgba(251,191,36,0.6)] ml-0.5">
                BET
              </span>
            </div>
            <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-[9px] font-bold text-amber-400 uppercase tracking-widest hidden sm:inline-block">
              OFICIAL
            </span>
          </div>

          {/* Ações Rápidas: Suporte 24h e Botão Entrar */}
          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition active:scale-95"
              title="Falar com Suporte Oficial 24h"
            >
              <MessageCircle size={14} className="text-emerald-400" />
              <span className="hidden xs:inline">Suporte</span>
            </a>

            <button
              onClick={handleLoginDirect}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition active:scale-95 cursor-pointer"
            >
              Entrar
            </button>
          </div>
        </header>

        {/* 2. TICKER DE CONFIANÇA & GANHADORES RECENTES */}
        <div className="w-full bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-[11px] overflow-hidden">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="uppercase tracking-wider text-[10px]">Saques em tempo real:</span>
          </div>
          <div className="text-slate-300 font-medium truncate ml-2 flex items-center gap-1">
            <span className="text-white font-bold">{RECENT_WINNERS[activeWinnerIndex].name}</span>
            <span>sacou</span>
            <span className="text-emerald-400 font-bold">{RECENT_WINNERS[activeWinnerIndex].amount}</span>
            <span className="text-slate-500 text-[10px]">({RECENT_WINNERS[activeWinnerIndex].time})</span>
          </div>
        </div>

        {/* 3. HERO SECTION DE ALTA CONVERSÃO COM BLINDAGEM META ADS */}
        <div className="px-4 pt-4 pb-2 space-y-4">
          
          {/* Badge de Autoridade e Conformidade */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Plataforma Oficial Verificada</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>4.9 ★ (380K+ Jogadores)</span>
            </div>
          </div>

          {/* Headline Forte e Segura */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-[26px] font-black text-white tracking-tight leading-tight">
              O Maior Hub de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">Entretenimento Online</span> do Brasil
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mais de 200 jogos exclusivos, saques imediatos via PIX e bônus de 100% no seu 1º depósito. Plataforma estável, segura e auditada.
            </p>
          </div>

          {/* Card em Destaque do Jogo de Entrada (com botão de ação rápida) */}
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-gradient-to-b from-[#131b2e] to-[#0d1322] p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3">
              <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-amber-400/40 shadow-lg flex-shrink-0 bg-slate-900">
                <img 
                  src={featuredGame.image} 
                  alt={featuredGame.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 px-1 py-0.2 bg-amber-500 text-black text-[8px] font-black rounded uppercase">
                  {featuredGame.badge}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                  <Zap size={11} className="text-amber-400" />
                  <span>Destaque da Rodada</span>
                </div>
                <h2 className="text-lg font-black text-white truncate leading-tight mt-0.5">
                  {featuredGame.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span className="text-[11px] font-semibold text-slate-300">{featuredGame.provider}</span>
                  <span>•</span>
                  <span className="text-[11px] text-emerald-400 font-bold">RTP {featuredGame.rtp}</span>
                </div>
              </div>
            </div>

            {/* CTA Principal de Cadastro */}
            <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center gap-2">
              <button
                onClick={() => handleRegisterAndPlay(featuredGame.id)}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs sm:text-sm uppercase tracking-wide rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>CRIAR CONTA & JOGAR AGORA</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* 4 Destaques Rápidos da Plataforma */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Zap size={16} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Saque Instantâneo</span>
                <span className="font-bold text-white text-[11px]">Via PIX em 10s</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Gift size={16} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Bônus Boas-Vindas</span>
                <span className="font-bold text-white text-[11px]">100% no 1º PIX</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Users size={16} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Indique & Ganhe</span>
                <span className="font-bold text-white text-[11px]">Comissão Diária</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Segurança Máxima</span>
                <span className="font-bold text-white text-[11px]">SSL 256-Bit</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4. VITRINE DE JOGOS: MOSTRA QUE É UM CASSINO COMPLETO DE +200 JOGOS */}
        <div className="px-4 py-3 space-y-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Catálogo Completo
              </span>
              <h3 className="text-base font-black text-white">
                Mais de 200 Jogos Disponíveis
              </h3>
            </div>
            <button
              onClick={() => handleRegisterAndPlay()}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver todos</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Filtros de Categoria da Vitrine */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'todos', label: 'Todos (+200)' },
              { id: 'slots', label: 'Slots Populares 🔥' },
              { id: 'crash', label: 'Mines & Crash 💣' },
              { id: 'novos', label: 'Lançamentos 🚀' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grade de Jogos */}
          <div className="grid grid-cols-2 gap-2.5">
            {filteredGames.slice(0, 6).map((game) => (
              <div
                key={game.id}
                onClick={() => handleRegisterAndPlay(game.id)}
                className="group relative rounded-xl overflow-hidden bg-slate-900/90 border border-slate-800 hover:border-amber-400/60 transition duration-200 cursor-pointer shadow-md flex flex-col justify-between"
              >
                {/* Imagem do Jogo */}
                <div className="h-28 w-full relative overflow-hidden bg-slate-950">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm border border-amber-400/40 text-amber-400 text-[9px] font-black rounded">
                    {game.badge}
                  </div>

                  {/* Multiplicador */}
                  <div className="absolute bottom-1.5 right-1.5 text-[10px] font-black text-amber-300 drop-shadow">
                    {game.multiplier}
                  </div>
                </div>

                {/* Info do Jogo */}
                <div className="p-2.5 space-y-1">
                  <h4 className="text-xs font-bold text-white truncate leading-tight group-hover:text-amber-400 transition">
                    {game.name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate">{game.provider}</span>
                    <span className="text-emerald-400 font-semibold">{game.rtp}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegisterAndPlay(game.id);
                    }}
                    className="w-full mt-1.5 py-1.5 bg-slate-800 group-hover:bg-amber-400 text-slate-200 group-hover:text-black font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play size={11} className="fill-current" />
                    <span>Jogar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1">
            <button
              onClick={() => handleRegisterAndPlay()}
              className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700/80 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Acessar Biblioteca com +200 Jogos</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 5. SEÇÃO: PROGRAMA DE INDICAÇÃO (CONVIDE & GANHE) */}
        <div className="px-4 py-4 space-y-3 border-t border-slate-800/80 bg-gradient-to-b from-[#0b1222] to-[#080d1a]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Users size={16} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Programa de Afiliados
              </span>
              <h3 className="text-sm font-black text-white">
                Indique Amigos e Ganhe Comissões
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Compartilhe seu link exclusivo com amigos, grupos e redes sociais. Receba até <strong className="text-amber-400">5% de comissão contínua</strong> sobre a movimentação dos seus convidados com saques diretos no PIX.
          </p>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800/80">
              <span className="text-amber-400 font-black text-sm block">1</span>
              <span className="text-[10px] text-slate-300 leading-tight block mt-0.5">Cadastre-se na FuturoBet</span>
            </div>
            <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800/80">
              <span className="text-amber-400 font-black text-sm block">2</span>
              <span className="text-[10px] text-slate-300 leading-tight block mt-0.5">Pegue seu link de convite</span>
            </div>
            <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800/80">
              <span className="text-amber-400 font-black text-sm block">3</span>
              <span className="text-[10px] text-slate-300 leading-tight block mt-0.5">Receba no PIX diariamente</span>
            </div>
          </div>

          <button
            onClick={() => handleRegisterAndPlay()}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>QUERO SER UM AFILIADO FUTUROBET</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 6. SEÇÃO: SUPORTE AO VIVO 24H */}
        <div className="px-4 py-4 space-y-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MessageCircle size={16} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Atendimento Oficial
                </span>
                <h3 className="text-sm font-black text-white">
                  Suporte Humanizado 24 Horas
                </h3>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online Agora
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Dúvidas sobre depósitos via PIX, resgate de saques ou bônus? Nossa equipe de atendimento está pronta para te atender imediatamente via WhatsApp ou Chat Oficial.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
          >
            <MessageCircle size={15} />
            <span>Chamar Atendente no WhatsApp (42 99968-7965)</span>
          </a>
        </div>

        {/* 7. BLINDAGEM META ADS: JOGO RESPONSÁVEL, TERMOS E PRIVACIDADE */}
        <div className="px-4 py-4 space-y-3 border-t border-slate-800/80 bg-[#050810] text-[11px] text-slate-400">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <AlertCircle size={14} className="text-amber-400" />
            <span>Diretrizes e Jogo Responsável (+18)</span>
          </div>

          <p className="leading-relaxed">
            A FuturoBet é uma plataforma destinada exclusivamente para maiores de 18 anos. Jogos online devem ser praticados como entretenimento casual e com responsabilidade financeira. Jogue com moderação.
          </p>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>Transações 100% via PIX</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>Auditoria de Jogos e RTP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>Criptografia SSL 256-Bit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>Privacidade em conformidade LGPD</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-center text-[10px] text-slate-500 space-y-1">
            <p>© 2026 FuturoBet Oficial. Todos os direitos reservados.</p>
            <p>Entretenimento digital seguro e certificado.</p>
          </div>
        </div>

        {/* 8. BARRA FIXA INFERIOR NO MOBILE (STICKY BOTTOM CTA) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-3 pb-3">
          <div className="w-full max-w-md bg-[#0b1222]/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.9)] flex items-center justify-between gap-3 pointer-events-auto">
            <div className="min-w-0 pl-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Bônus 100% no 1º PIX
              </span>
              <span className="text-xs font-black text-white truncate block">
                Cadastre-se e Jogue Agora
              </span>
            </div>

            <button
              onClick={() => handleRegisterAndPlay()}
              className="py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wide rounded-xl shadow-lg active:scale-95 transition cursor-pointer flex items-center gap-1 flex-shrink-0"
            >
              <span>JOGAR AGORA</span>
              <Zap size={14} className="fill-black" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
