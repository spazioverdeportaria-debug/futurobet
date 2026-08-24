import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Flame, Sparkles, Activity, CheckCircle2, 
  ChevronRight, ChevronLeft, ArrowRight, DollarSign, RefreshCw, X, ShieldAlert,
  Radio, Zap, BarChart2, Eye, Shield, Award, Clock, ArrowUpRight,
  Search, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Layers, Filter,
  Star, PlaySquare, Calendar, SlidersHorizontal, Check, Compass, Share2,
  Receipt, CheckCircle, AlertCircle, History, ArrowDownLeft, Swords
} from 'lucide-react';

import sportsBannerBonusImg from '../assets/images/sports_promo_banner_1787424195529.jpg';
import heroMatchupImg from '../assets/images/football_hero_matchup_1786555584191.jpg';
import depositBonusImg from '../assets/images/football_deposit_bonus_1786555603016.jpg';
import earlyPayoutImg from '../assets/images/football_early_payout_1786555622855.jpg';
import { getOrFetchFootballMatches, filterNextMatchPerTeam, FootballMatch, AUTO_SYNC_INTERVAL_MS } from '../data/footballCache';
import { 
  SportsMatch, SportType, 
  getOrFetchBasketballMatches, getOrFetchMmaMatches, 
  getOrFetchTennisMatches, getOrFetchNflMatches, getOrFetchEsportsMatches,
  convertFootballToSportsMatch 
} from '../data/multiSportsCache';

export type Match = SportsMatch;

// PROMOTIONAL HERO BANNER SLIDES - 50% BONUS ON FIRST WINNING PREDICTION
const HERO_SLIDES = [
  {
    id: 'slide1',
    badge: 'BÔNUS 50% NO 1º PALPITE 🎯',
    title: 'Deposite & Ganhe +50% de Bônus',
    subtitle: 'Acerte o primeiro resultado que apostar e receba 50% de bônus sobre o seu depósito!',
    bgImage: depositBonusImg,
    badgeBg: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black',
    borderColor: 'border-amber-500/40 hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    ctaGlow: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-black font-black',
    cta: 'DEPOSITAR AGORA 💰',
    code: 'DEPOSIT'
  },
  {
    id: 'slide2',
    badge: 'PRIMEIRO RESULTADO TURBINADO 🔥',
    title: '50% Extra no 1º Acerto',
    subtitle: 'Faça seu depósito via PIX, dê o seu palpite esportivo e leve +50% de saldo bônus!',
    bgImage: heroMatchupImg,
    badgeBg: 'bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 text-black',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    ctaGlow: 'bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 hover:brightness-110 text-black font-black',
    cta: 'APROVEITAR 50% ⚡',
    code: 'DEPOSIT'
  },
  {
    id: 'slide3',
    badge: 'PROMOÇÃO EXCLUSIVA ESPORTES 🚀',
    title: 'Palpite Certo = +50% no Saldo',
    subtitle: 'Depósito instantâneo com liberação de 50% de bônus ao cravar o primeiro resultado!',
    bgImage: earlyPayoutImg,
    badgeBg: 'bg-gradient-to-r from-sky-400 via-blue-400 to-sky-500 text-black',
    borderColor: 'border-sky-500/40 hover:border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.25)]',
    ctaGlow: 'bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 hover:brightness-110 text-black font-black',
    cta: 'RESGATAR BÔNUS 🎁',
    code: 'DEPOSIT'
  }
];

export interface PlacedBet {
  id: string;
  createdAt: string;
  matchId: string;
  matchTitle: string;
  sport: SportType;
  marketName: string;
  selectionName: string;
  odd: number;
  stake: number;
  potentialPayout: number;
  status: 'OPEN' | 'PROCESSING_PAYOUT' | 'WON' | 'LOST';
  payoutCredited?: boolean;
  liveScore?: string;
  isLive?: boolean;
  matchFinished?: boolean;
  settledAt?: string;
  resultMessage?: string;
}

interface SelectedBet {
  matchId: string;
  matchTitle: string;
  marketName: string;
  selectionName: string;
  odd: number;
}

interface SportsBettingProps {
  balance: number;
  onUpdateBalance: (newBalance: number) => void;
  onOpenDeposit: () => void;
}

// STORAGE KEY FOR PLACED BETS
const PLACED_BETS_STORAGE_KEY = 'vegasbet_sports_placed_bets';

// Team / Fighter Crest Component (High Res Badges & Fighter Photos)
function TeamCrest({ logoUrl, name, code, color, size = 'sm', isFighter = false }: { logoUrl: string; name: string; code: string; color: string; size?: 'sm' | 'md' | 'lg' | 'card'; isFighter?: boolean }) {
  const [hasError, setHasError] = useState(false);

  const dimClasses = {
    sm: 'w-5 h-5 sm:w-6 sm:h-6 text-[9px]',
    md: 'w-7 h-7 sm:w-8 sm:h-8 text-xs',
    card: 'w-8 h-8 sm:w-9 sm:h-9 text-xs',
    lg: 'w-10 h-10 sm:w-11 sm:h-11 text-sm',
  }[size];

  if (hasError || !logoUrl) {
    return (
      <div className={`${dimClasses} rounded-lg bg-[#142239] flex items-center justify-center font-black text-slate-300 border border-slate-700/50 shadow-sm shrink-0 select-none`}>
        <span className="tracking-tight uppercase">{code ? code.slice(0, 3) : name.slice(0, 3)}</span>
      </div>
    );
  }

  if (isFighter) {
    return (
      <div className={`${dimClasses} rounded-full bg-[#0e192c] flex items-center justify-center shrink-0 overflow-hidden border border-slate-700/60 shadow-sm`}>
        <img
          src={logoUrl}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`${dimClasses} flex items-center justify-center shrink-0`}>
      <img
        src={logoUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] transition-transform hover:scale-110"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

// Skeleton Card
function SportsSkeleton() {
  return (
    <div className="bg-[#0b1322] border border-[#1e293b] rounded-xl p-3 space-y-2.5 animate-pulse">
      <div className="flex justify-between items-center pb-2 border-b border-[#1e293b]/70">
        <div className="h-3 bg-slate-800 rounded w-28" />
        <div className="h-3.5 bg-slate-800 rounded-md w-14" />
      </div>
      <div className="space-y-1.5 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-800" />
            <div className="h-3 bg-slate-800 rounded w-24" />
          </div>
          <div className="w-4 h-3 bg-slate-800 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-800" />
            <div className="h-3 bg-slate-800 rounded w-20" />
          </div>
          <div className="w-4 h-3 bg-slate-800 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        <div className="h-8 bg-slate-800/80 rounded-lg" />
        <div className="h-8 bg-slate-800/80 rounded-lg" />
        <div className="h-8 bg-slate-800/80 rounded-lg" />
      </div>
    </div>
  );
}

export default function SportsBetting({ balance, onUpdateBalance, onOpenDeposit }: SportsBettingProps) {
  // Active sport category: Futebol ⚽ | Basquete 🏀 | UFC / MMA 🥊
  const [activeSport, setActiveSport] = useState<SportType>('SOCCER');

  const [soccerMatches, setSoccerMatches] = useState<Match[]>([]);
  const [basketballMatches, setBasketballMatches] = useState<Match[]>([]);
  const [mmaMatches, setMmaMatches] = useState<Match[]>([]);
  const [tennisMatches, setTennisMatches] = useState<Match[]>([]);
  const [nflMatches, setNflMatches] = useState<Match[]>([]);
  const [esportsMatches, setEsportsMatches] = useState<Match[]>([]);

  const [activeMainView, setActiveMainView] = useState<'MATCHES' | 'MY_BETS'>('MATCHES');
  const [soccerFilter, setSoccerFilter] = useState<'BRASILEIRAO' | 'AO_VIVO' | 'COPA_DO_BRASIL' | 'LIBERTADORES' | 'EUROPEU'>('BRASILEIRAO');
  const [basketFilter, setBasketFilter] = useState<'NBA' | 'AO_VIVO' | 'ALL'>('NBA');
  const [mmaFilter, setMmaFilter] = useState<'ALL' | 'UFC_NUMERADO' | 'UFC_FIGHT_NIGHT'>('ALL');

  const [selectedBets, setSelectedBets] = useState<SelectedBet[]>([]);
  const [stake, setStake] = useState<string>('20');
  const [isCouponOpen, setIsCouponOpen] = useState<boolean>(false);
  const [selectedMatchDetail, setSelectedMatchDetail] = useState<Match | null>(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState<number>(0);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [collapsedLeagues, setCollapsedLeagues] = useState<string[]>([]);
  
  // Market tabs adapt dynamically per sport
  const [soccerMarketTab, setSoccerMarketTab] = useState<'1X2' | 'RESULTADOS_HOJE' | 'TOTAL_GOLS' | 'BTTS'>('1X2');
  const [basketMarketTab, setBasketMarketTab] = useState<'MONEYLINE' | 'RESULTADOS_HOJE' | 'SPREAD' | 'TOTAL_POINTS'>('MONEYLINE');
  const [mmaMarketTab, setMmaMarketTab] = useState<'WINNER' | 'RESULTADOS_HOJE' | 'KO_TKO' | 'SUBMISSION' | 'ROUNDS'>('WINNER');

  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [favoriteMatchIds, setFavoriteMatchIds] = useState<string[]>([]);
  const [activeBetNotification, setActiveBetNotification] = useState<string | null>(null);
  
  // MY BETS STATE
  const [myBetsFilter, setMyBetsFilter] = useState<'ALL' | 'OPEN' | 'SETTLED'>('ALL');
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>(() => {
    try {
      const saved = localStorage.getItem(PLACED_BETS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load placed bets:', e);
    }
    return [];
  });

  // SAVE PLACED BETS TO LOCAL STORAGE
  useEffect(() => {
    try {
      localStorage.setItem(PLACED_BETS_STORAGE_KEY, JSON.stringify(placedBets));
    } catch (e) {
      console.warn('Failed to save placed bets:', e);
    }
  }, [placedBets]);

  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // FETCH ALL SPORTS DATA WITH 20-MINUTE AUTOMATIC RECURRING SYNC
  const fetchAllSportsData = async (forceRefresh = false) => {
    setIsLoadingApi(true);
    try {
      const [footballData, bballData, mmaData, tennisData, nflData, esportsData] = await Promise.all([
        getOrFetchFootballMatches(forceRefresh),
        getOrFetchBasketballMatches(),
        getOrFetchMmaMatches(),
        getOrFetchTennisMatches(),
        getOrFetchNflMatches(),
        getOrFetchEsportsMatches(),
      ]);

      if (footballData && footballData.length > 0) {
        setSoccerMatches(footballData.map(convertFootballToSportsMatch));
      }
      if (bballData && bballData.length > 0) {
        setBasketballMatches(bballData);
      }
      if (mmaData && mmaData.length > 0) {
        setMmaMatches(mmaData);
      }
      if (tennisData && tennisData.length > 0) {
        setTennisMatches(tennisData);
      }
      if (nflData && nflData.length > 0) {
        setNflMatches(nflData);
      }
      if (esportsData && esportsData.length > 0) {
        setEsportsMatches(esportsData);
      }
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Multi-sports API sync fallback:', err);
    } finally {
      setIsLoadingApi(false);
    }
  };

  useEffect(() => {
    fetchAllSportsData();
    const syncInterval = setInterval(() => {
      fetchAllSportsData(true);
    }, AUTO_SYNC_INTERVAL_MS);
    return () => clearInterval(syncInterval);
  }, []);

  // BANNER ROTATOR
  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(bannerTimer);
  }, []);

  // LIVE TICKER FOR SOCCER & BASKETBALL
  useEffect(() => {
    const timer = setInterval(() => {
      setSoccerMatches((prev) =>
        prev.map((m) => {
          if (!m.isLive) return m;
          const nextMinute = m.timeMinute >= 90 ? 90 : m.timeMinute + 1;
          const homeOddShift = Number((m.odds.home + (Math.random() * 0.04 - 0.02)).toFixed(2));
          const awayOddShift = Number((m.odds.away + (Math.random() * 0.04 - 0.02)).toFixed(2));
          return {
            ...m,
            timeMinute: nextMinute,
            timeFormatted: `${nextMinute}'`,
            odds: {
              ...m.odds,
              home: Math.max(1.10, homeOddShift),
              away: Math.max(1.10, awayOddShift),
            }
          };
        })
      );

      setBasketballMatches((prev) =>
        prev.map((m) => {
          if (!m.isLive) return m;
          // Random live basketball scoring
          const homePts = m.homeScore + (Math.random() > 0.6 ? (Math.random() > 0.5 ? 3 : 2) : 0);
          const awayPts = m.awayScore + (Math.random() > 0.6 ? (Math.random() > 0.5 ? 3 : 2) : 0);
          return {
            ...m,
            homeScore: homePts,
            awayScore: awayPts,
          };
        })
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const toggleFavorite = (matchId: string) => {
    setFavoriteMatchIds((prev) =>
      prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [...prev, matchId]
    );
  };

  const toggleCollapseLeague = (leagueTitle: string) => {
    setCollapsedLeagues((prev) =>
      prev.includes(leagueTitle)
        ? prev.filter((l) => l !== leagueTitle)
        : [...prev, leagueTitle]
    );
  };

  // Current sport active matches pool
  const currentSportMatches = useMemo(() => {
    if (activeSport === 'SOCCER') return soccerMatches;
    if (activeSport === 'BASKETBALL') return basketballMatches;
    if (activeSport === 'MMA') return mmaMatches;
    if (activeSport === 'TENNIS') return tennisMatches;
    if (activeSport === 'NFL') return nflMatches;
    if (activeSport === 'ESPORTS') return esportsMatches;
    return soccerMatches;
  }, [activeSport, soccerMatches, basketballMatches, mmaMatches, tennisMatches, nflMatches, esportsMatches]);

  const liveMatches = useMemo(() => currentSportMatches.filter((m) => m.isLive), [currentSportMatches]);
  const finishedMatches = useMemo(() => currentSportMatches.filter((m) => m.isFinished), [currentSportMatches]);

  // Filter matches based on selected sub-filter and market tabs
  const filteredMatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    // 1. SOCCER FILTERING
    if (activeSport === 'SOCCER') {
      if (soccerMarketTab === 'RESULTADOS_HOJE') {
        const fin = soccerMatches.filter((m) => {
          if (!m.isFinished) return false;
          if (soccerFilter === 'AO_VIVO') return true;
          return m.category === soccerFilter;
        });
        const sourceList = fin.length > 0 ? fin : soccerMatches.filter(m => m.isFinished);
        if (q) {
          return sourceList.filter(m => m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q) || m.league.toLowerCase().includes(q));
        }
        return sourceList;
      }

      if (soccerFilter === 'AO_VIVO') {
        const live = soccerMatches.filter((m) => m.isLive);
        if (q) return live.filter(m => m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q) || m.league.toLowerCase().includes(q));
        return live;
      }

      const cat = soccerMatches.filter((m) => m.category === soccerFilter && !m.isFinished);
      const deduped = filterNextMatchPerTeam(cat as any) as Match[];
      if (q) return deduped.filter(m => m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q) || m.league.toLowerCase().includes(q));
      return deduped;
    }

    // 2. BASKETBALL FILTERING
    if (activeSport === 'BASKETBALL') {
      if (basketMarketTab === 'RESULTADOS_HOJE') {
        const fin = basketballMatches.filter(m => m.isFinished);
        if (q) return fin.filter(m => m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q) || m.league.toLowerCase().includes(q));
        return fin;
      }

      let list = basketballMatches;
      if (basketFilter === 'AO_VIVO') {
        list = basketballMatches.filter(m => m.isLive);
      } else if (basketFilter === 'NBA') {
        list = basketballMatches.filter(m => !m.isFinished);
      }

      if (q) return list.filter(m => m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q) || m.league.toLowerCase().includes(q));
      return list;
    }

    // 3. MMA FILTERING
    if (activeSport === 'MMA') {
      if (mmaMarketTab === 'RESULTADOS_HOJE') {
        const fin = mmaMatches.filter(m => m.isFinished);
        if (q) return fin.filter(m => m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q) || m.league.toLowerCase().includes(q));
        return fin;
      }

      let list = mmaMatches.filter(m => !m.isFinished);
      if (mmaFilter === 'UFC_NUMERADO') {
        list = list.filter(m => m.category === 'UFC_NUMERADO');
      } else if (mmaFilter === 'UFC_FIGHT_NIGHT') {
        list = list.filter(m => m.category === 'UFC_FIGHT_NIGHT');
      }

      if (q) return list.filter(m => m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q) || m.league.toLowerCase().includes(q));
      return list;
    }

    // 4. TENNIS FILTERING
    if (activeSport === 'TENNIS') {
      let list = tennisMatches;
      if (q) return list.filter(m => m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q) || m.league.toLowerCase().includes(q));
      return list;
    }

    // 5. NFL FILTERING
    if (activeSport === 'NFL') {
      let list = nflMatches;
      if (q) return list.filter(m => m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q) || m.league.toLowerCase().includes(q));
      return list;
    }

    // 6. ESPORTS FILTERING
    if (activeSport === 'ESPORTS') {
      let list = esportsMatches;
      if (q) return list.filter(m => m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q) || m.league.toLowerCase().includes(q));
      return list;
    }

    return currentSportMatches;
  }, [activeSport, soccerMatches, basketballMatches, mmaMatches, tennisMatches, nflMatches, esportsMatches, soccerFilter, basketFilter, mmaFilter, soccerMarketTab, basketMarketTab, mmaMarketTab, searchQuery, currentSportMatches]);

  const handleToggleBet = (match: Match, marketName: string, selectionName: string, odd: number) => {
    setSelectedBets((prev) => {
      const existingIndex = prev.findIndex((b) => b.matchId === match.id && b.selectionName === selectionName);
      if (existingIndex >= 0) {
        return prev.filter((_, i) => i !== existingIndex);
      } else {
        const matchTitle = `${match.homeTeam} x ${match.awayTeam}`;
        const otherMatches = prev.filter((b) => b.matchId !== match.id);
        return [...otherMatches, { matchId: match.id, matchTitle, marketName, selectionName, odd }];
      }
    });
  };

  const isBetSelected = (matchId: string, selectionName: string) => {
    return selectedBets.some((b) => b.matchId === matchId && b.selectionName === selectionName);
  };

  const totalOdd = selectedBets.reduce((acc, b) => acc * b.odd, 1);
  const numStake = parseFloat(stake) || 0;
  const potentialPayout = totalOdd * numStake;

  // EVALUATE BET RESULT AGAINST FINISHED MATCH
  const evaluateBet = (bet: PlacedBet, match: Match): { won: boolean; summary: string } => {
    const homeScore = match.homeScore || 0;
    const awayScore = match.awayScore || 0;
    const totalScore = homeScore + awayScore;
    const sel = bet.selectionName.toLowerCase();
    const mkt = bet.marketName.toLowerCase();

    // 1. Final result / 1X2 / Match Winner / Combat Winner
    if (mkt.includes('resultado final') || mkt.includes('1x2') || mkt.includes('vencedor') || mkt.includes('combate') || mkt.includes('moneyline')) {
      if (sel.includes('casa') || sel.includes('(1)') || sel.includes(match.homeTeam.toLowerCase())) {
        const won = homeScore > awayScore;
        return { won, summary: won ? `${match.homeTeam} venceu (${homeScore} x ${awayScore})` : `${match.homeTeam} perdeu (${homeScore} x ${awayScore})` };
      }
      if (sel.includes('fora') || sel.includes('(2)') || sel.includes(match.awayTeam.toLowerCase())) {
        const won = awayScore > homeScore;
        return { won, summary: won ? `${match.awayTeam} venceu (${homeScore} x ${awayScore})` : `${match.awayTeam} perdeu (${homeScore} x ${awayScore})` };
      }
      if (sel.includes('empate') || sel.includes('(x)')) {
        const won = homeScore === awayScore;
        return { won, summary: won ? `Jogo empatado (${homeScore} x ${awayScore})` : `Não terminou empatado (${homeScore} x ${awayScore})` };
      }
    }

    // 2. Over / Under (Total de Gols / Total de Pontos / Total de Rounds)
    if (mkt.includes('total') || mkt.includes('gols') || mkt.includes('pontos') || mkt.includes('rounds')) {
      const matchNum = sel.match(/(\d+(\.\d+)?)/);
      const line = matchNum ? parseFloat(matchNum[1]) : 2.5;
      if (sel.includes('mais') || sel.includes('over') || sel.includes('+')) {
        const won = totalScore > line;
        return { won, summary: won ? `Total de ${totalScore} superou a linha de ${line}` : `Total de ${totalScore} ficou abaixo de ${line}` };
      }
      if (sel.includes('menos') || sel.includes('under') || sel.includes('-')) {
        const won = totalScore < line;
        return { won, summary: won ? `Total de ${totalScore} ficou abaixo de ${line}` : `Total de ${totalScore} superou a linha de ${line}` };
      }
    }

    // 3. MMA KO / TKO
    if (mkt.includes('nocaute') || mkt.includes('ko') || sel.includes('ko/tko')) {
      if (sel.includes(match.homeTeam.toLowerCase()) || sel.includes('(1)')) {
        const won = homeScore > awayScore;
        return { won, summary: won ? `${match.homeTeam} venceu por Nocaute!` : `Lutador não obteve vitória por KO` };
      }
      if (sel.includes(match.awayTeam.toLowerCase()) || sel.includes('(2)')) {
        const won = awayScore > homeScore;
        return { won, summary: won ? `${match.awayTeam} venceu por Nocaute!` : `Lutador não obteve vitória por KO` };
      }
    }

    // Default fallback based on winning team
    const won = (homeScore > awayScore && sel.includes(match.homeTeam.toLowerCase())) ||
                (awayScore > homeScore && sel.includes(match.awayTeam.toLowerCase()));
    return { won, summary: `Placar final: ${homeScore} x ${awayScore}` };
  };

  // AUTOMATED SETTLEMENT ENGINE: Checks open bets against finished matches
  useEffect(() => {
    const allMatches = [...soccerMatches, ...basketballMatches, ...mmaMatches, ...tennisMatches, ...nflMatches, ...esportsMatches];
    if (allMatches.length === 0 || placedBets.length === 0) return;

    let stateChanged = false;
    const updated = placedBets.map((bet) => {
      if (bet.status !== 'OPEN') return bet;

      const match = allMatches.find(m => m.id === bet.matchId || m.homeTeam === bet.matchTitle.split(' x ')[0]);
      if (!match) return bet;

      // Update live score display if changed
      const currentLiveScore = match.isFinished
        ? `Encerrado: ${match.homeScore} x ${match.awayScore}`
        : match.isLive
        ? `Ao Vivo: ${match.homeScore} x ${match.awayScore} (${match.timeFormatted})`
        : bet.liveScore;

      if (match.isFinished) {
        stateChanged = true;
        const { won, summary } = evaluateBet(bet, match);
        const now = new Date();
        const settledTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        if (won) {
          // Put in processing payout stage
          return {
            ...bet,
            status: 'PROCESSING_PAYOUT' as const,
            liveScore: currentLiveScore,
            matchFinished: true,
            settledAt: settledTimeString,
            resultMessage: summary
          };
        } else {
          return {
            ...bet,
            status: 'LOST' as const,
            liveScore: currentLiveScore,
            matchFinished: true,
            settledAt: settledTimeString,
            resultMessage: summary
          };
        }
      } else if (currentLiveScore !== bet.liveScore || match.isLive !== bet.isLive) {
        stateChanged = true;
        return {
          ...bet,
          liveScore: currentLiveScore,
          isLive: match.isLive
        };
      }

      return bet;
    });

    if (stateChanged) {
      setPlacedBets(updated);
    }
  }, [soccerMatches, basketballMatches, mmaMatches, tennisMatches, nflMatches, esportsMatches, placedBets]);

  // AUTOMATED PAYOUT CREDIT DISPATCHER: Releases money for PROCESSING_PAYOUT tickets
  useEffect(() => {
    const processingBets = placedBets.filter(b => b.status === 'PROCESSING_PAYOUT' && !b.payoutCredited);
    if (processingBets.length === 0) return;

    processingBets.forEach((bet) => {
      // Simulate banking settlement delay of 3 seconds
      const timer = setTimeout(() => {
        setPlacedBets(prev =>
          prev.map(b => b.id === bet.id ? { ...b, status: 'WON' as const, payoutCredited: true } : b)
        );
        onUpdateBalance(Number((balance + bet.potentialPayout).toFixed(2)));
        setActiveBetNotification(`💰 Pagamento Creditado: +R$ ${bet.potentialPayout.toFixed(2)} no seu saldo!`);
        setTimeout(() => setActiveBetNotification(null), 5000);
      }, 3000);

      return () => clearTimeout(timer);
    });
  }, [placedBets, balance]);

  const handlePlaceBet = () => {
    if (selectedBets.length === 0) return;
    if (numStake <= 0) return;

    // Strict balance check: prompt user to deposit if insufficient
    if (numStake > balance) {
      onOpenDeposit();
      return;
    }

    // Deduct real balance immediately
    const newBal = Number((balance - numStake).toFixed(2));
    onUpdateBalance(newBal);

    // Create persistent ticket for "My Bets"
    const now = new Date();
    const timeString = `Hoje, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newPlacedBets: PlacedBet[] = selectedBets.map((b, idx) => {
      const match = [...soccerMatches, ...basketballMatches, ...mmaMatches, ...tennisMatches, ...nflMatches, ...esportsMatches].find(m => m.id === b.matchId);
      return {
        id: `bet-${Date.now()}-${idx}`,
        createdAt: timeString,
        matchId: b.matchId,
        matchTitle: b.matchTitle,
        sport: match?.sport || activeSport,
        marketName: b.marketName,
        selectionName: b.selectionName,
        odd: b.odd,
        stake: selectedBets.length > 1 ? Number((numStake / selectedBets.length).toFixed(2)) : numStake,
        potentialPayout: selectedBets.length > 1 ? Number(((numStake / selectedBets.length) * b.odd).toFixed(2)) : potentialPayout,
        status: 'OPEN',
        liveScore: match?.isFinished 
          ? `Encerrado: ${match.homeScore} x ${match.awayScore}`
          : match?.isLive 
          ? `${match.homeScore} - ${match.awayScore} (${match.timeFormatted})` 
          : 'Aguardando Início do Confronto',
        isLive: match?.isLive || false,
        matchFinished: match?.isFinished || false
      };
    });

    setPlacedBets(prev => [...newPlacedBets, ...prev]);

    setActiveBetNotification(`✅ Bilhete Registrado! O prêmio será creditado automaticamente após o jogo.`);
    setTimeout(() => setActiveBetNotification(null), 5000);

    setSelectedBets([]);
    setIsCouponOpen(false);
  };

  const currentBanner = HERO_SLIDES[activeBannerIndex];

  const handlePromoClick = (code: string) => {
    if (code === 'DEPOSIT') {
      onOpenDeposit();
      return;
    }
    if (code === 'SUPERODDS' || code === 'MATCHUP') {
      setActiveSport('SOCCER');
      setSoccerFilter('BRASILEIRAO');
      const match = soccerMatches.find(m => m.category === 'BRASILEIRAO') || soccerMatches[0];
      if (match) {
        handleToggleBet(match, 'SuperOdds Brasileirão', `${match.homeTeam} (Casa)`, Math.max(match.odds.home, 2.50));
        setIsCouponOpen(true);
      }
    } else if (code === 'EARLY_PAYOUT') {
      const match = soccerMatches.find(m => m.isLive) || soccerMatches[0];
      if (match) {
        handleToggleBet(match, 'Vantagem 2 Gols', `${match.homeTeam} (2 Gols)`, match.odds.home);
        setIsCouponOpen(true);
      }
    }
  };

  const openBetsCount = placedBets.filter(b => b.status === 'OPEN').length;

  // Featured Match for the Hero Card adapts to active sport
  const featuredMatch = useMemo(() => {
    if (activeSport === 'BASKETBALL') {
      return basketballMatches.find(m => m.isLive) || basketballMatches.find(m => !m.isFinished) || basketballMatches[0];
    }
    if (activeSport === 'MMA') {
      return mmaMatches.find(m => !m.isFinished) || mmaMatches[0];
    }
    const live = soccerMatches.find(m => m.isLive);
    if (live) return live;
    const bsa = soccerMatches.find(m => m.category === 'BRASILEIRAO' && !m.isFinished);
    if (bsa) return bsa;
    return soccerMatches.find(m => !m.isFinished) || soccerMatches[0];
  }, [activeSport, soccerMatches, basketballMatches, mmaMatches]);

  const getLeagueEmoji = (league: string) => {
    const l = league.toLowerCase();
    if (l.includes('brasil') || l.includes('brasileirão') || l.includes('paulista') || l.includes('carioca')) return '🇧🇷';
    if (l.includes('premier') || l.includes('inglaterra') || l.includes('fa cup')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
    if (l.includes('bundesliga') || l.includes('alemanha')) return '🇩🇪';
    if (l.includes('la liga') || l.includes('espanha')) return '🇪🇸';
    if (l.includes('serie a') || l.includes('itália')) return '🇮🇹';
    if (l.includes('ligue 1') || l.includes('frança')) return '🇫🇷';
    if (l.includes('champions') || l.includes('libertadores') || l.includes('copa')) return '🏆';
    if (l.includes('nba') || l.includes('nbb') || l.includes('basquete')) return '🏀';
    if (l.includes('ufc') || l.includes('mma') || l.includes('fight')) return '🥊';
    if (l.includes('atp') || l.includes('wta') || l.includes('tennis') || l.includes('tênis')) return '🎾';
    if (l.includes('nfl') || l.includes('american')) return '🏈';
    if (l.includes('esport') || l.includes('cs2') || l.includes('lol')) return '🎮';
    return '⚽';
  };

  const totalLiveMatches = soccerMatches.filter(m => m.isLive).length + basketballMatches.filter(m => m.isLive).length;

  return (
    <div className="w-full flex flex-col bg-[#050a12] min-h-screen text-slate-100 select-none pb-28">
      
      {/* 🚀 TOPO FIXO ESTILO BETMGM / BET365 */}
      <div className="w-full bg-[#08101d] border-b border-[#142236] sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col">
          
          {/* 1. BARRA DE ESPORTES HORIZONTAL */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-2 py-1.5 border-b border-[#142236]/80 bg-[#060c17]">
            {[
              { 
                id: 'ALL_LIVE', 
                label: 'Ao Vivo', 
                icon: '⚡', 
                count: totalLiveMatches,
                isLiveTab: true 
              },
              { 
                id: 'SOCCER', 
                label: 'Futebol', 
                icon: '⚽', 
                count: soccerMatches.length,
                liveCount: soccerMatches.filter(m => m.isLive).length
              },
              { 
                id: 'BASKETBALL', 
                label: 'Basquete', 
                icon: '🏀', 
                count: basketballMatches.length,
                liveCount: basketballMatches.filter(m => m.isLive).length
              },
              { 
                id: 'MMA', 
                label: 'MMA / UFC', 
                icon: '🥊', 
                count: mmaMatches.length,
                liveCount: 0
              },
              { 
                id: 'TENNIS', 
                label: 'Tênis', 
                icon: '🎾', 
                count: tennisMatches.length || 14,
                liveCount: 0
              },
              { 
                id: 'NFL', 
                label: 'Futebol Amer.', 
                icon: '🏈', 
                count: nflMatches.length || 8,
                liveCount: 0
              },
              { 
                id: 'ESPORTS', 
                label: 'E-Sports', 
                icon: '🎮', 
                count: esportsMatches.length || 12,
                liveCount: 0
              }
            ].map((sp) => {
              const isSelected = sp.id === 'ALL_LIVE' 
                ? soccerFilter === 'AO_VIVO' && activeSport === 'SOCCER'
                : activeSport === sp.id && soccerFilter !== 'AO_VIVO';

              return (
                <button
                  key={sp.id}
                  onClick={() => {
                    setActiveMainView('MATCHES');
                    if (sp.id === 'ALL_LIVE') {
                      setActiveSport('SOCCER');
                      setSoccerFilter('AO_VIVO');
                      setBasketFilter('AO_VIVO');
                    } else {
                      setActiveSport(sp.id as SportType);
                      setSoccerFilter('BRASILEIRAO');
                      setBasketFilter('NBA');
                    }
                  }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-amber-400 text-black font-black shadow-sm'
                      : 'bg-[#0a1424] text-slate-300 hover:text-white hover:bg-[#0f1d33] border border-[#14233c]'
                  }`}
                >
                  <span className="text-sm">{sp.icon}</span>
                  <span>{sp.label}</span>
                  {sp.liveCount !== undefined && sp.liveCount > 0 ? (
                    <span className={`text-[9px] px-1 py-0.2 rounded-full font-mono font-black ${
                      isSelected ? 'bg-black text-amber-400' : 'bg-red-600 text-white animate-pulse'
                    }`}>
                      {sp.liveCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* 2. SUB-BARRA: NAVEGAÇÃO RÁPIDA + LIGAS + BOTÕES DE AÇÃO */}
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[#091220]">
            
            {/* Sub-Tabs: Jogos vs Meus Bilhetes */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setActiveMainView('MATCHES')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeMainView === 'MATCHES'
                    ? 'bg-[#182842] text-amber-300 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Trophy size={12} className={activeMainView === 'MATCHES' ? 'text-amber-400' : 'text-slate-400'} />
                <span>Jogos</span>
              </button>

              <button
                onClick={() => setActiveMainView('MY_BETS')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeMainView === 'MY_BETS'
                    ? 'bg-[#182842] text-amber-300 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Receipt size={12} className={activeMainView === 'MY_BETS' ? 'text-amber-400' : 'text-slate-400'} />
                <span>Bilhetes</span>
                {openBetsCount > 0 && (
                  <span className="text-[9px] px-1 rounded-full bg-[#00e701] text-black font-mono font-black animate-pulse">
                    {openBetsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Action Icons: Search toggle & Refresh */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setShowSearch(prev => !prev)}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  showSearch 
                    ? 'bg-amber-400 text-black border-amber-300' 
                    : 'bg-[#0e192c] text-slate-400 hover:text-white border-[#182944]'
                }`}
                title="Buscar confrontos"
              >
                <Search size={13} />
              </button>

              <button
                onClick={() => fetchAllSportsData(true)}
                disabled={isLoadingApi}
                className="p-1.5 rounded-lg bg-[#0e192c] text-slate-400 hover:text-white border border-[#182944] transition cursor-pointer disabled:opacity-50"
                title="Atualizar Odds"
              >
                <RefreshCw size={13} className={isLoadingApi ? 'animate-spin text-amber-400' : ''} />
              </button>
            </div>

          </div>

          {/* Inline Search Bar (Only when toggled) */}
          {showSearch && activeMainView === 'MATCHES' && (
            <div className="px-3 pb-2 pt-1 bg-[#091220] border-t border-[#142236] animate-in fade-in duration-150">
              <div className="relative w-full flex items-center bg-[#050b14] rounded-lg border border-[#1d2f4d] px-2.5 py-1">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar times, lutadores ou ligas..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-medium"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white p-0.5 cursor-pointer">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3. LIGAS / CATEGORIAS DO ESPORTE ATIVO */}
          {activeMainView === 'MATCHES' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-1.5 bg-[#070e1a] border-t border-[#121e30]">
              
              {/* Categorias Futebol */}
              {activeSport === 'SOCCER' && (
                <>
                  {[
                    { id: 'BRASILEIRAO', label: 'Brasileirão Série A' },
                    { id: 'AO_VIVO', label: 'Ao Vivo' },
                    { id: 'COPA_DO_BRASIL', label: 'Copa do Brasil' },
                    { id: 'LIBERTADORES', label: 'Libertadores' },
                    { id: 'EUROPEU', label: 'Futebol Europeu' },
                  ].map((tab) => {
                    const isActive = soccerFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSoccerFilter(tab.id as any)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-[#1a2c47] text-amber-300 font-black border border-amber-400/40'
                            : 'bg-[#0a1220] text-slate-400 hover:text-slate-200 border border-[#132035]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </>
              )}

              {/* Categorias Basquete */}
              {activeSport === 'BASKETBALL' && (
                <>
                  {[
                    { id: 'NBA', label: 'NBA Temporada Regular' },
                    { id: 'AO_VIVO', label: 'Ao Vivo Agora' },
                    { id: 'ALL', label: 'Todos os Jogos' },
                  ].map((tab) => {
                    const isActive = basketFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setBasketFilter(tab.id as any)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-[#1a2c47] text-amber-300 font-black border border-amber-400/40'
                            : 'bg-[#0a1220] text-slate-400 hover:text-slate-200 border border-[#132035]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </>
              )}

              {/* Categorias MMA */}
              {activeSport === 'MMA' && (
                <>
                  {[
                    { id: 'ALL', label: 'Todos os Eventos UFC' },
                    { id: 'UFC_NUMERADO', label: 'UFC Numerados 🏆' },
                    { id: 'UFC_FIGHT_NIGHT', label: 'UFC Fight Night' },
                  ].map((tab) => {
                    const isActive = mmaFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setMmaFilter(tab.id as any)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-[#1a2c47] text-amber-300 font-black border border-amber-400/40'
                            : 'bg-[#0a1220] text-slate-400 hover:text-slate-200 border border-[#132035]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </>
              )}

            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: MEUS BILHETES / MINHAS APOSTAS REALIZADAS */}
      {/* ========================================================================= */}
      {activeMainView === 'MY_BETS' && (
        <div className="w-full px-3 pt-3 max-w-4xl mx-auto space-y-3 animate-in fade-in duration-150">
          
          {/* Sub-filtro: Todas, Abertas, Finalizadas */}
          <div className="flex items-center justify-between bg-[#08101d] p-1.5 rounded-xl border border-[#17243b] gap-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'Todos os Bilhetes' },
                { id: 'OPEN', label: 'Em Andamento' },
                { id: 'SETTLED', label: 'Finalizados' },
              ].map((subTab) => {
                const isActive = myBetsFilter === subTab.id;
                return (
                  <button
                    key={subTab.id}
                    onClick={() => setMyBetsFilter(subTab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      isActive 
                        ? 'bg-[#1e2f50] text-amber-300 font-black shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {subTab.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setActiveMainView('MATCHES')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2 py-1 cursor-pointer shrink-0"
            >
              <span>+ Novo Jogo</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Lista de Bilhetes com Liquidação Automática e Processamento de Pagamento */}
          {(() => {
            const filteredBets = placedBets.filter(b => {
              if (myBetsFilter === 'OPEN') return b.status === 'OPEN' || b.status === 'PROCESSING_PAYOUT';
              if (myBetsFilter === 'SETTLED') return b.status === 'WON' || b.status === 'LOST';
              return true;
            });

            if (filteredBets.length === 0) {
              return (
                <div className="text-center py-10 bg-[#08101d] rounded-2xl border border-[#17243b] p-6 space-y-3 shadow-md">
                  <div className="w-12 h-12 rounded-full bg-[#121f36] border border-[#1e2d4a] flex items-center justify-center mx-auto text-amber-400 shadow-inner">
                    <Receipt size={22} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100">Nenhum bilhete encontrado nesta categoria</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Selecione suas cotações nos jogos para registrar seu bilhete esportivo.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMainView('MATCHES')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs rounded-xl shadow-lg cursor-pointer hover:brightness-105 active:scale-95 transition"
                  >
                    <Trophy size={14} />
                    <span>Explorar Jogos e Lutas</span>
                  </button>
                </div>
              );
            }

            return (
              <div className="space-y-2.5">
                {filteredBets.map((bet) => {
                  const isOpen = bet.status === 'OPEN';
                  const isProcessing = bet.status === 'PROCESSING_PAYOUT';
                  const isWon = bet.status === 'WON';
                  const isLost = bet.status === 'LOST';

                  return (
                    <div
                      key={bet.id}
                      className={`bg-[#08101d] border rounded-2xl p-3.5 space-y-2.5 shadow-md relative overflow-hidden transition-all ${
                        isProcessing ? 'border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)]' :
                        isWon ? 'border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]' :
                        isLost ? 'border-slate-800 opacity-80' :
                        'border-[#17243b]'
                      }`}
                    >
                      {/* Status Banner */}
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-[#17243b]">
                        <div className="flex items-center gap-1.5">
                          <Receipt size={13} className="text-amber-400" />
                          <span className="font-mono text-[10px] text-slate-400">{bet.createdAt}</span>
                          <span className="text-[10px] text-slate-600">•</span>
                          <span className="font-mono text-[10px] text-slate-400">ID: {bet.id.slice(0, 12)}</span>
                        </div>

                        <div>
                          {isOpen && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-[10px] uppercase font-mono flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                              AGUARDANDO FIM DO JOGO
                            </span>
                          )}
                          {isProcessing && (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-black font-black text-[10px] uppercase font-mono flex items-center gap-1.5 shadow animate-pulse">
                              <RefreshCw size={11} className="animate-spin text-black" />
                              PROCESSANDO SEU PAGAMENTO...
                            </span>
                          )}
                          {isWon && (
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-black text-[10px] uppercase font-mono flex items-center gap-1">
                              <CheckCircle2 size={12} className="text-emerald-400" />
                              BILHETE PREMIADO 🏆
                            </span>
                          )}
                          {isLost && (
                            <span className="px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-300 font-black text-[10px] uppercase font-mono">
                              NÃO PREMIADO ❌
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dados da Seleção & Partida */}
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-300">{bet.matchTitle}</span>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-amber-300">{bet.selectionName}</span>
                            <span className="text-[11px] text-slate-400">({bet.marketName})</span>
                          </div>
                          <span className="font-mono font-black text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            @{bet.odd.toFixed(2)}
                          </span>
                        </div>

                        {bet.liveScore && (
                          <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1 pt-0.5">
                            <Clock size={12} className={bet.isLive ? "text-red-400 animate-pulse" : "text-amber-400"} />
                            <span>Status do Jogo: <strong className="text-slate-200 font-mono">{bet.liveScore}</strong></span>
                          </div>
                        )}

                        {bet.resultMessage && (
                          <div className={`text-[11px] font-medium p-1.5 rounded-lg border flex items-center gap-1.5 ${
                            isWon ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40' :
                            isLost ? 'bg-slate-900 text-slate-400 border-slate-800' :
                            'bg-amber-950/40 text-amber-200 border-amber-800/40'
                          }`}>
                            <Activity size={12} />
                            <span>{bet.resultMessage}</span>
                          </div>
                        )}
                      </div>

                      {/* Valores: Aposta e Retorno Potencial + Mensagem de Liquidação */}
                      <div className="bg-[#050b14] p-2.5 rounded-xl border border-[#141f33] flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor Apostado:</span>
                          <span className="font-mono font-bold text-xs text-slate-200">R$ {bet.stake.toFixed(2)}</span>
                        </div>

                        <div className="space-y-0.5 text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            {isWon ? 'Prêmio Pago:' : 'Retorno Potencial:'}
                          </span>
                          <span className={`font-mono font-black text-xs ${isWon ? 'text-emerald-400 text-sm' : isLost ? 'text-slate-500' : 'text-[#00e701]'}`}>
                            R$ {bet.potentialPayout.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Aviso de pagamento em andamento */}
                      {isProcessing && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2 flex items-center gap-2 text-amber-300 text-xs font-bold animate-pulse">
                          <RefreshCw size={14} className="animate-spin shrink-0 text-amber-400" />
                          <span>Jogo encerrado com vitória! O valor de R$ {bet.potentialPayout.toFixed(2)} está sendo creditado no seu saldo...</span>
                        </div>
                      )}

                      {isWon && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2 flex items-center gap-2 text-emerald-300 text-xs font-bold">
                          <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                          <span>Pagamento de R$ {bet.potentialPayout.toFixed(2)} creditado automaticamente com sucesso no seu saldo!</span>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            );
          })()}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: EXPLORAR JOGOS & ODDS (TABELA COMPACTA ESTILO BET365 / BETANO) */}
      {/* ========================================================================= */}
      {activeMainView === 'MATCHES' && (
        <div className="w-full max-w-4xl mx-auto space-y-2 pt-1">
          
          {/* 🌟 BANNER PROMOCIONAL DE ESPORTES: BÔNUS 50% NO 1º PALPITE */}
          <div className="px-2.5 sm:px-3 pt-1 select-none">
            <div 
              onClick={() => onOpenDeposit()}
              className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#1e3050]/80 hover:border-amber-400/80 bg-[#08101d] shadow-[0_4px_25px_rgba(0,0,0,0.85)] group cursor-pointer transition-all duration-300 active:scale-[0.99]"
              title="Clique para resgatar o bônus de 50% no depósito"
            >
              <img
                src={sportsBannerBonusImg}
                alt="Promoção Exclusiva Esportes: Palpite Certo = +50% no Saldo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-[1.015] transition-transform duration-500"
              />
            </div>
          </div>

          {isLoadingApi && filteredMatches.length === 0 ? (
            <div className="p-3 space-y-2">
              <SportsSkeleton />
              <SportsSkeleton />
              <SportsSkeleton />
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-10 bg-[#08101d] rounded-2xl border border-[#17243b] p-6 space-y-3 mx-3 my-2">
              <Trophy className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-300">
                {searchQuery ? `Nenhum evento encontrado para "${searchQuery}".` : 'Nenhum confronto programado nesta categoria no momento.'}
              </p>
              <button
                onClick={() => { 
                  setSearchQuery('');
                  if (activeSport === 'SOCCER') {
                    setSoccerFilter('BRASILEIRAO');
                    setSoccerMarketTab('1X2');
                  }
                  fetchAllSportsData(true);
                }}
                className="mt-2 px-4 py-2 bg-amber-400 text-black font-black text-xs rounded-xl cursor-pointer hover:brightness-105 transition"
              >
                Ver Todos os Eventos
              </button>
            </div>
          ) : (
            (() => {
              // Group by league
              const groups: { [key: string]: Match[] } = {};
              filteredMatches.forEach((m) => {
                const lg = m.league || (activeSport === 'BASKETBALL' ? 'NBA' : activeSport === 'MMA' ? 'UFC' : 'Futebol Profissional');
                if (!groups[lg]) groups[lg] = [];
                groups[lg].push(m);
              });

              return Object.entries(groups).map(([leagueTitle, leagueMatches]) => {
                const isCollapsed = collapsedLeagues.includes(leagueTitle);
                const isSoccer = activeSport === 'SOCCER';

                return (
                  <div key={leagueTitle} className="border-b border-[#142236] bg-[#070e1a]">
                    
                    {/* CABEÇALHO DA LIGA (BANNER ESTILO BETMGM) */}
                    <div 
                      onClick={() => toggleCollapseLeague(leagueTitle)}
                      className="flex items-center justify-between px-3.5 py-2.5 bg-[#0a1424] border-y border-[#14233a] cursor-pointer select-none text-xs font-bold shadow-sm hover:bg-[#0e1b2f] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">{getLeagueEmoji(leagueTitle)}</span>
                        <span className="text-slate-100 uppercase tracking-wider font-black text-xs sm:text-sm font-sans truncate">
                          {leagueTitle}
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 shrink-0">
                          {leagueMatches.length} {leagueMatches.length === 1 ? 'jogo' : 'jogos'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 shrink-0 text-[11px]">
                        <span className="hidden sm:inline font-medium text-slate-500">
                          {isCollapsed ? 'Expandir' : 'Recolher'}
                        </span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                      </div>
                    </div>

                    {/* LISTA DE CONFRONTOS EM CARDS DE ALTA CONVERSÃO (PADRÃO BETMGM) */}
                    {!isCollapsed && (
                      <div className="p-2 sm:p-3 space-y-2.5 bg-[#050b14]">
                        {leagueMatches.map((m) => {
                          const isFav = favoriteMatchIds.includes(m.id);
                          const totalMarketsCount = 48;

                          return (
                            <div 
                              key={m.id}
                              className="bg-[#091322] border border-[#14243b] hover:border-amber-400/30 rounded-2xl p-3 sm:p-3.5 shadow-md transition-all space-y-3"
                            >
                              {/* 1. TOPO DO CARD: HORÁRIO / AO VIVO + MERCADOS + FAVORITO */}
                              <div className="flex items-center justify-between pb-2 border-b border-[#121f33] text-xs">
                                <div className="flex items-center gap-2">
                                  {m.isLive ? (
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-mono font-black text-[10px] animate-pulse">
                                      <span className="w-2 h-2 rounded-full bg-red-500" />
                                      AO VIVO {m.timeFormatted}
                                    </span>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                                      <Clock size={12} className="text-amber-400" />
                                      <span className="font-bold text-slate-200">{m.dayFormatted || 'Hoje'}, {m.timeOnly || m.timeFormatted}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setSelectedMatchDetail(m)}
                                    className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-300 transition-colors px-2 py-0.5 rounded-lg bg-[#0e1a2c] border border-[#172944] cursor-pointer"
                                  >
                                    <span>+{totalMarketsCount} mercados</span>
                                    <ChevronRight size={12} />
                                  </button>

                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(m.id); }}
                                    className="text-slate-500 hover:text-amber-400 p-1 cursor-pointer transition-colors"
                                    title="Favoritar partida"
                                  >
                                    <Star size={15} className={isFav ? 'fill-amber-400 text-amber-400' : ''} />
                                  </button>
                                </div>
                              </div>

                              {/* 2. ÁREA DOS TIMES COM NOMES COMPLETOS E ESCUDOS OFICIAIS */}
                              <div 
                                onClick={() => setSelectedMatchDetail(m)}
                                className="space-y-2 cursor-pointer py-0.5 group"
                              >
                                {/* Time Casa */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <TeamCrest logoUrl={m.homeLogo} name={m.homeTeam} code={m.homeCode} color={m.homeColor} size="md" isFighter={activeSport === 'MMA'} />
                                    <span className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                                      {m.homeTeam}
                                    </span>
                                  </div>
                                  {m.isLive && (
                                    <span className="font-mono text-base font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                                      {m.homeScore}
                                    </span>
                                  )}
                                </div>

                                {/* Time Fora */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <TeamCrest logoUrl={m.awayLogo} name={m.awayTeam} code={m.awayCode} color={m.awayColor} size="md" isFighter={activeSport === 'MMA'} />
                                    <span className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                                      {m.awayTeam}
                                    </span>
                                  </div>
                                  {m.isLive && (
                                    <span className="font-mono text-base font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                                      {m.awayScore}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* 3. GRADE DE ODDS PADRÃO BETMGM (1, X, 2) */}
                              <div className="pt-2 border-t border-[#121f33]">
                                {isSoccer ? (
                                  <div className="grid grid-cols-3 gap-2">
                                    {/* 1 - Casa */}
                                    <button
                                      onClick={() => handleToggleBet(m, 'Resultado Final (1X2)', `${m.homeTeam} (Casa)`, m.odds.home)}
                                      className={`py-2 px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center cursor-pointer border ${
                                        isBetSelected(m.id, `${m.homeTeam} (Casa)`)
                                          ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-[1.02]'
                                          : 'bg-[#0d1829] hover:bg-[#14233c] text-amber-400 border-[#182a45] hover:border-amber-400/40'
                                      }`}
                                    >
                                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isBetSelected(m.id, `${m.homeTeam} (Casa)`) ? 'text-black/80' : 'text-slate-400'}`}>
                                        1 · Casa
                                      </span>
                                      <span className={`font-mono text-sm font-black ${isBetSelected(m.id, `${m.homeTeam} (Casa)`) ? 'text-black' : 'text-amber-400'}`}>
                                        {m.odds.home.toFixed(2)}
                                      </span>
                                    </button>

                                    {/* X - Empate */}
                                    <button
                                      onClick={() => handleToggleBet(m, 'Resultado Final (1X2)', 'Empate (X)', m.odds.draw || 3.10)}
                                      className={`py-2 px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center cursor-pointer border ${
                                        isBetSelected(m.id, 'Empate (X)')
                                          ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-[1.02]'
                                          : 'bg-[#0d1829] hover:bg-[#14233c] text-amber-400 border-[#182a45] hover:border-amber-400/40'
                                      }`}
                                    >
                                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isBetSelected(m.id, 'Empate (X)') ? 'text-black/80' : 'text-slate-400'}`}>
                                        X · Empate
                                      </span>
                                      <span className={`font-mono text-sm font-black ${isBetSelected(m.id, 'Empate (X)') ? 'text-black' : 'text-amber-400'}`}>
                                        {(m.odds.draw || 3.10).toFixed(2)}
                                      </span>
                                    </button>

                                    {/* 2 - Fora */}
                                    <button
                                      onClick={() => handleToggleBet(m, 'Resultado Final (1X2)', `${m.awayTeam} (Fora)`, m.odds.away)}
                                      className={`py-2 px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center cursor-pointer border ${
                                        isBetSelected(m.id, `${m.awayTeam} (Fora)`)
                                          ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-[1.02]'
                                          : 'bg-[#0d1829] hover:bg-[#14233c] text-amber-400 border-[#182a45] hover:border-amber-400/40'
                                      }`}
                                    >
                                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isBetSelected(m.id, `${m.awayTeam} (Fora)`) ? 'text-black/80' : 'text-slate-400'}`}>
                                        2 · Fora
                                      </span>
                                      <span className={`font-mono text-sm font-black ${isBetSelected(m.id, `${m.awayTeam} (Fora)`) ? 'text-black' : 'text-amber-400'}`}>
                                        {m.odds.away.toFixed(2)}
                                      </span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2">
                                    {/* 1 - Casa / Lutador 1 */}
                                    <button
                                      onClick={() => handleToggleBet(m, 'Vencedor', `${m.homeTeam} (1)`, m.odds.home)}
                                      className={`py-2 px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center cursor-pointer border ${
                                        isBetSelected(m.id, `${m.homeTeam} (1)`)
                                          ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-[1.02]'
                                          : 'bg-[#0d1829] hover:bg-[#14233c] text-amber-400 border-[#182a45] hover:border-amber-400/40'
                                      }`}
                                    >
                                      <span className={`text-[10px] font-bold uppercase truncate max-w-full px-1 ${isBetSelected(m.id, `${m.homeTeam} (1)`) ? 'text-black/80' : 'text-slate-400'}`}>
                                        1 · {m.homeTeam}
                                      </span>
                                      <span className={`font-mono text-sm font-black ${isBetSelected(m.id, `${m.homeTeam} (1)`) ? 'text-black' : 'text-amber-400'}`}>
                                        {m.odds.home.toFixed(2)}
                                      </span>
                                    </button>

                                    {/* 2 - Fora / Lutador 2 */}
                                    <button
                                      onClick={() => handleToggleBet(m, 'Vencedor', `${m.awayTeam} (2)`, m.odds.away)}
                                      className={`py-2 px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center cursor-pointer border ${
                                        isBetSelected(m.id, `${m.awayTeam} (2)`)
                                          ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-[1.02]'
                                          : 'bg-[#0d1829] hover:bg-[#14233c] text-amber-400 border-[#182a45] hover:border-amber-400/40'
                                      }`}
                                    >
                                      <span className={`text-[10px] font-bold uppercase truncate max-w-full px-1 ${isBetSelected(m.id, `${m.awayTeam} (2)`) ? 'text-black/80' : 'text-slate-400'}`}>
                                        2 · {m.awayTeam}
                                      </span>
                                      <span className={`font-mono text-sm font-black ${isBetSelected(m.id, `${m.awayTeam} (2)`) ? 'text-black' : 'text-amber-400'}`}>
                                        {m.odds.away.toFixed(2)}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              });
            })()
          )}
        </div>
      )}

      {/* 🔔 NOTIFICAÇÃO TOAST DE APOSTA REALIZADA */}
      {activeBetNotification && (
        <div className="fixed top-14 inset-x-4 max-w-sm mx-auto z-50 bg-[#00e701] text-black font-black text-xs p-3 rounded-2xl shadow-[0_0_25px_rgba(0,231,1,0.5)] border border-[#39ff3a] flex items-center justify-between animate-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="stroke-[2.5]" />
            <span>{activeBetNotification}</span>
          </div>
          <button onClick={() => setActiveBetNotification(null)} className="p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 🎫 BARRA FLUTUANTE DO CUPOM DE APOSTAS */}
      {selectedBets.length > 0 && (
        <div className="fixed bottom-14 inset-x-3 sm:inset-x-auto sm:right-6 max-w-md z-40 animate-in slide-in-from-bottom-3 duration-200">
          <div 
            onClick={() => setIsCouponOpen(true)}
            className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black px-3.5 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-98 transition border border-white/60"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-black text-amber-300 font-mono font-black flex items-center justify-center text-xs shadow">
                {selectedBets.length}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-black uppercase">CUPOM DE APOSTAS</span>
                <span className="text-[9px] font-bold opacity-80">Odd Total: @{totalOdd.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black bg-black text-amber-300 px-2 py-0.5 rounded-lg font-mono">
                R$ {potentialPayout.toFixed(2)}
              </span>
              <ChevronRight size={15} className="stroke-[3]" />
            </div>
          </div>
        </div>
      )}

      {/* 📋 MODAL CUPOM DE APOSTAS EXPANDIDO */}
      {isCouponOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#09111e] border-t-2 border-amber-400 rounded-t-3xl p-4 space-y-3 max-h-[85vh] overflow-y-auto shadow-2xl">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#17243b]">
              <div className="flex items-center gap-2">
                <Trophy size={15} className="text-amber-400" />
                <h3 className="font-black text-xs text-white uppercase tracking-wider">
                  CUPOM DE APOSTAS ({selectedBets.length})
                </h3>
              </div>
              <button
                onClick={() => setIsCouponOpen(false)}
                className="p-1 rounded-full bg-[#152238] text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Itens do Cupom */}
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {selectedBets.map((bet) => (
                <div
                  key={bet.selectionName}
                  className="bg-[#0f1a2d] p-2 rounded-xl border border-[#1d2f4f] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.2 min-w-0 pr-2">
                    <span className="text-[10px] text-amber-400 font-bold block truncate">{bet.matchTitle}</span>
                    <span className="font-black text-slate-100 block truncate text-xs">{bet.selectionName}</span>
                    <span className="text-[9px] text-slate-400">{bet.marketName}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-amber-300 text-xs font-mono">@{bet.odd.toFixed(2)}</span>
                    <button
                      onClick={() => setSelectedBets(prev => prev.filter(b => b.selectionName !== bet.selectionName))}
                      className="text-red-400 hover:text-red-300 text-xs font-bold p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Valor da Aposta e Retorno */}
            <div className="bg-[#0d1626] p-3 rounded-2xl border border-[#1b2b48] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Cotação Total:</span>
                <span className="text-amber-400 font-black text-sm font-mono">@{totalOdd.toFixed(2)}</span>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Valor da Aposta (R$):
                </label>
                <div className="flex gap-1">
                  {['10', '20', '50', '100'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setStake(val)}
                      className={`flex-1 py-1 text-xs font-black rounded-lg border transition cursor-pointer ${
                        stake === val 
                          ? 'bg-amber-400 text-black border-amber-300' 
                          : 'bg-[#15233c] text-slate-200 border-[#1f3354] hover:bg-[#1a2c4c]'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  placeholder="Digitar valor..."
                  className="w-full mt-2 bg-[#050b14] border border-[#1f3354] rounded-xl py-1.5 px-3 text-amber-200 text-xs font-bold focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="pt-2 border-t border-[#17243b] space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Seu Saldo Disponível:</span>
                  <span className="font-mono font-bold text-slate-200">R$ {balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-300">Retorno Potencial:</span>
                  <span className="font-black text-[#00e701] text-sm font-mono">
                    R$ {potentialPayout.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Verificação de Saldo e Botão de Ação */}
            {numStake > balance ? (
              <div className="space-y-2">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-red-300 font-bold">
                    <AlertCircle size={15} className="shrink-0 text-red-400" />
                    <span>Saldo insuficiente (R$ {balance.toFixed(2)})</span>
                  </div>
                  <span className="text-[10px] text-red-300 font-mono">Faltam R$ {(numStake - balance).toFixed(2)}</span>
                </div>

                <button
                  onClick={() => {
                    setIsCouponOpen(false);
                    onOpenDeposit();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <DollarSign size={16} className="stroke-[3]" />
                  <span>ADICIONAR SALDO VIA PIX (R$ {numStake.toFixed(2)}) 💰</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handlePlaceBet}
                disabled={numStake <= 0}
                className="w-full py-3 bg-gradient-to-r from-[#00e701] to-[#00b301] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,231,1,0.4)] hover:brightness-110 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                CONFIRMAR BILHETE (R$ {numStake.toFixed(2)}) ⚡
              </button>
            )}

          </div>
        </div>
      )}

      {/* 🔍 MODAL DETALHES DA PARTIDA & MERCADOS ADICIONAIS */}
      {selectedMatchDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#09111e] border border-[#17243b] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Header Modal */}
            <div className="p-3 bg-[#0d1728] border-b border-[#17243b] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Trophy size={13} className="text-amber-400" />
                <span className="text-xs font-black text-white uppercase truncate max-w-[240px]">
                  {selectedMatchDetail.league}
                </span>
              </div>
              <button 
                onClick={() => setSelectedMatchDetail(null)}
                className="p-1 rounded-full bg-[#15233c] text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Placar e Confronto */}
            <div className="p-3.5 bg-gradient-to-b from-[#0d1728] to-[#09111e] flex items-center justify-between border-b border-[#17243b]">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <TeamCrest 
                  logoUrl={selectedMatchDetail.homeLogo} 
                  name={selectedMatchDetail.homeTeam} 
                  code={selectedMatchDetail.homeCode} 
                  color={selectedMatchDetail.homeColor} 
                  size="md" 
                  isFighter={selectedMatchDetail.sport === 'MMA'}
                />
                <span className="font-bold text-xs text-white truncate">{selectedMatchDetail.homeTeam}</span>
              </div>

              <div className="px-2.5 py-1.5 bg-[#050b14] rounded-xl border border-[#17243b] text-center font-mono shrink-0 mx-1.5">
                {selectedMatchDetail.isLive ? (
                  <>
                    <div className="text-sm font-black text-amber-300">{selectedMatchDetail.homeScore} - {selectedMatchDetail.awayScore}</div>
                    <div className="text-[9px] font-black text-red-400 animate-pulse flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                      <span>{selectedMatchDetail.timeFormatted}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-black text-amber-400 uppercase tracking-tight">
                      {selectedMatchDetail.dayFormatted || 'Hoje'}
                    </div>
                    <div className="text-[11px] font-black text-slate-100">
                      {selectedMatchDetail.timeOnly || selectedMatchDetail.timeFormatted}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end text-right">
                <span className="font-bold text-xs text-white truncate">{selectedMatchDetail.awayTeam}</span>
                <TeamCrest 
                  logoUrl={selectedMatchDetail.awayLogo} 
                  name={selectedMatchDetail.awayTeam} 
                  code={selectedMatchDetail.awayCode} 
                  color={selectedMatchDetail.awayColor} 
                  size="md" 
                  isFighter={selectedMatchDetail.sport === 'MMA'}
                />
              </div>
            </div>

            {/* Mercados Extras do Confronto */}
            <div className="p-3 overflow-y-auto space-y-2.5 flex-1">
              
              {/* Vencedor */}
              <div className="bg-[#0c1626] rounded-xl border border-[#17243b] p-2.5 space-y-1.5">
                <h4 className="text-[11px] font-black text-amber-300 uppercase">
                  {selectedMatchDetail.sport === 'MMA' ? 'Vencedor do Combate' : 'Vencedor da Partida'}
                </h4>
                <div className={`grid gap-1.5 ${selectedMatchDetail.odds.draw ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <button
                    onClick={() => handleToggleBet(selectedMatchDetail, 'Vencedor', `${selectedMatchDetail.homeTeam} (1)`, selectedMatchDetail.odds.home)}
                    className={`py-1.5 px-1 rounded-lg text-xs font-black transition border flex flex-col items-center cursor-pointer ${
                      isBetSelected(selectedMatchDetail.id, `${selectedMatchDetail.homeTeam} (1)`)
                        ? 'bg-amber-400 text-black border-amber-300'
                        : 'bg-[#050b14] text-white border-[#1c2c48] hover:border-amber-400'
                    }`}
                  >
                    <span className="text-[7px] text-slate-400">1</span>
                    <span className="font-mono text-xs">{selectedMatchDetail.odds.home.toFixed(2)}</span>
                  </button>

                  {selectedMatchDetail.odds.draw && (
                    <button
                      onClick={() => handleToggleBet(selectedMatchDetail, 'Resultado Final (1X2)', 'Empate (X)', selectedMatchDetail.odds.draw!)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-black transition border flex flex-col items-center cursor-pointer ${
                        isBetSelected(selectedMatchDetail.id, 'Empate (X)')
                          ? 'bg-amber-400 text-black border-amber-300'
                          : 'bg-[#050b14] text-white border-[#1c2c48] hover:border-amber-400'
                      }`}
                    >
                      <span className="text-[7px] text-slate-400">X</span>
                      <span className="font-mono text-xs">{selectedMatchDetail.odds.draw.toFixed(2)}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleBet(selectedMatchDetail, 'Vencedor', `${selectedMatchDetail.awayTeam} (2)`, selectedMatchDetail.odds.away)}
                    className={`py-1.5 px-1 rounded-lg text-xs font-black transition border flex flex-col items-center cursor-pointer ${
                      isBetSelected(selectedMatchDetail.id, `${selectedMatchDetail.awayTeam} (2)`)
                        ? 'bg-amber-400 text-black border-amber-300'
                        : 'bg-[#050b14] text-white border-[#1c2c48] hover:border-amber-400'
                    }`}
                  >
                    <span className="text-[7px] text-slate-400">2</span>
                    <span className="font-mono text-xs">{selectedMatchDetail.odds.away.toFixed(2)}</span>
                  </button>
                </div>
              </div>

              {/* MMA Specific Details */}
              {selectedMatchDetail.sport === 'MMA' && (
                <div className="bg-[#0c1626] rounded-xl border border-[#17243b] p-2.5 space-y-1.5">
                  <h4 className="text-[11px] font-black text-amber-300 uppercase">Método da Vitória</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleToggleBet(selectedMatchDetail, 'Vitória por Nocaute', `${selectedMatchDetail.homeTeam} por KO/TKO`, selectedMatchDetail.odds.koHome || 2.20)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-black transition border flex justify-between items-center cursor-pointer ${
                        isBetSelected(selectedMatchDetail.id, `${selectedMatchDetail.homeTeam} por KO/TKO`)
                          ? 'bg-amber-400 text-black border-amber-300'
                          : 'bg-[#050b14] text-white border-[#1c2c48] hover:border-amber-400'
                      }`}
                    >
                      <span className="text-slate-400 text-[10px] truncate">{selectedMatchDetail.homeTeam.split(' ')[0]} (KO)</span>
                      <span className="font-mono text-xs">{(selectedMatchDetail.odds.koHome || 2.20).toFixed(2)}</span>
                    </button>
                    <button
                      onClick={() => handleToggleBet(selectedMatchDetail, 'Vitória por Nocaute', `${selectedMatchDetail.awayTeam} por KO/TKO`, selectedMatchDetail.odds.koAway || 3.40)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-black transition border flex justify-between items-center cursor-pointer ${
                        isBetSelected(selectedMatchDetail.id, `${selectedMatchDetail.awayTeam} por KO/TKO`)
                          ? 'bg-amber-400 text-black border-amber-300'
                          : 'bg-[#050b14] text-white border-[#1c2c48] hover:border-amber-400'
                      }`}
                    >
                      <span className="text-slate-400 text-[10px] truncate">{selectedMatchDetail.awayTeam.split(' ')[0]} (KO)</span>
                      <span className="font-mono text-xs">{(selectedMatchDetail.odds.koAway || 3.40).toFixed(2)}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Fechar */}
            <div className="p-2.5 bg-[#0d1728] border-t border-[#17243b]">
              <button
                onClick={() => setSelectedMatchDetail(null)}
                className="w-full py-2 bg-[#15233c] hover:bg-[#1a2d4d] text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Voltar às Apostas
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
