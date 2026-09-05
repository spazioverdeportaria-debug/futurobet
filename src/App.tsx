import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import BannerCarousel from './components/BannerCarousel';
import RoletaBanner from './components/RoletaBanner';
import LiveWinnersBar from './components/LiveWinnersBar';
import CategoryNav from './components/CategoryNav';
import GameCard from './components/GameCard';
import MiddleBannerCarousel from './components/MiddleBannerCarousel';
import SupportScreen from './components/SupportScreen';
import BottomNav, { NavTab } from './components/BottomNav';
import DepositModal from './components/DepositModal';
import CashierModal from './components/CashierModal';
import FortuneOxGame from './components/FortuneOxGame';
import SportsBetting from './components/SportsBetting';
import PromotionsSection from './components/PromotionsSection';
import DailyPrizeWheel from './components/DailyPrizeWheel';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import FloatingBonusPrompt from './components/FloatingBonusPrompt';
import WelcomePromoPopups from './components/WelcomePromoPopups';
import AdminPanel from './components/AdminPanel';
import MaintenanceScreen from './components/MaintenanceScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db, doc, onSnapshot } from './lib/firebase';

import { GAMES_CATALOG, GameConfig } from './data/gamesConfig';
import { getOrFetchFootballMatches } from './data/footballCache';
import { Sparkles, Trophy, Flame, ShieldCheck, Headphones, Zap, Gift } from 'lucide-react';

function FuturoBetContent() {
  const { account, isLoggedIn, updateBalance, logout } = useAuth();
  
  // Route check for /admin
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    const p = window.location.pathname.toLowerCase();
    const h = window.location.hash.toLowerCase();
    return p === '/admin' || p.startsWith('/admin/') || h === '#admin' || h.startsWith('#/admin');
  });

  // Maintenance state
  const [isMaintenanceActive, setIsMaintenanceActive] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(
    'Estamos realizando melhorias programadas em nossos servidores. Voltamos em instantes!'
  );

  useEffect(() => {
    const checkPath = () => {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      setIsAdminRoute(p === '/admin' || p.startsWith('/admin/') || h === '#admin' || h.startsWith('#/admin'));
    };

    window.addEventListener('popstate', checkPath);
    window.addEventListener('hashchange', checkPath);
    return () => {
      window.removeEventListener('popstate', checkPath);
      window.removeEventListener('hashchange', checkPath);
    };
  }, []);

  // Real-time maintenance status sync
  useEffect(() => {
    // Check API
    fetch('/api/system/status')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.maintenanceMode === 'boolean') {
          setIsMaintenanceActive(data.maintenanceMode);
        }
        if (data.maintenanceMessage) {
          setMaintenanceMessage(data.maintenanceMessage);
        }
      })
      .catch(() => null);

    // Check Firestore
    try {
      const unsub = onSnapshot(doc(db, 'system_settings', 'config'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.maintenanceMode === 'boolean') {
            setIsMaintenanceActive(data.maintenanceMode);
          }
          if (data.maintenanceMessage) {
            setMaintenanceMessage(data.maintenanceMessage);
          }
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('System settings listener notice:', e);
    }
  }, []);

  const [localBalance, setLocalBalance] = useState<number>(() => {
    const saved = localStorage.getItem('vegas_local_balance');
    if (saved !== null) {
      const parsed = parseFloat(saved);
      // Se era o antigo saldo inicial de demonstração (50.00), zera para a nova regra da conta zerada
      if (parsed === 50) return 0.00;
      return Math.max(0, isNaN(parsed) ? 0.00 : parsed);
    }
    return 0.00;
  });
  
  const [currentTab, setCurrentTab] = useState<NavTab>('cassino');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isCashierOpen, setIsCashierOpen] = useState<boolean>(false);
  const [cashierTab, setCashierTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [isWheelOpen, setIsWheelOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isExitCasinoModalOpen, setIsExitCasinoModalOpen] = useState<boolean>(false);

  // Modal de Autenticação / Cadastro
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [authActionName, setAuthActionName] = useState<string | undefined>(undefined);
  const [showFloatingBonusPrompt, setShowFloatingBonusPrompt] = useState<boolean>(false);

  const [depositBonusAlert, setDepositBonusAlert] = useState<{
    deposited: number;
    bonus: number;
    total: number;
  } | null>(null);

  // Pre-fetch live football matches in background as soon as app opens
  useEffect(() => {
    getOrFetchFootballMatches().catch(() => null);
  }, []);

  // 📱 Proteção contra fechamento / saída acidental no celular (Botão Voltar)
  useEffect(() => {
    // Adiciona entrada no histórico para interceptar botão 'Voltar' do navegador/celular
    window.history.pushState({ page: 'futurobet-home' }, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      // Se tiver jogo aberto, o próprio jogo lida ou fecha para o lobby
      if (selectedGame) {
        setSelectedGame(null);
        window.history.pushState({ page: 'futurobet-home' }, '', window.location.href);
        return;
      }
      
      // Se qualquer modal estiver aberto, apenas fecha o modal
      if (isProfileOpen || isCashierOpen || isDepositOpen || isWheelOpen || isAuthModalOpen) {
        setIsProfileOpen(false);
        setIsCashierOpen(false);
        setIsDepositOpen(false);
        setIsWheelOpen(false);
        setIsAuthModalOpen(false);
        window.history.pushState({ page: 'futurobet-home' }, '', window.location.href);
        return;
      }

      // Caso contrário, pergunta antes de sair do cassino
      setIsExitCasinoModalOpen(true);
      window.history.pushState({ page: 'futurobet-home' }, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedGame, isProfileOpen, isCashierOpen, isDepositOpen, isWheelOpen, isAuthModalOpen]);

  // 🎁 POP-UP COMPACTO DE BÔNUS 100% (Permanece ativo até a pessoa realizar o login/cadastro)
  useEffect(() => {
    if (isLoggedIn) {
      setShowFloatingBonusPrompt(false);
      return;
    }

    // Se o usuário não estiver logado, garante que o pop-up apareça
    if (!showFloatingBonusPrompt && !isAuthModalOpen && !selectedGame) {
      const timer = setTimeout(() => {
        if (!isLoggedIn) {
          setShowFloatingBonusPrompt(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, showFloatingBonusPrompt, isAuthModalOpen, selectedGame]);

  // Sync account balance from Firestore / AuthContext, else use local state
  const balance = account ? account.balance : localBalance;

  const handleUpdateBalance = (newBal: number) => {
    const cleanBal = Math.max(0, parseFloat(newBal.toFixed(2)));
    setLocalBalance(cleanBal);
    localStorage.setItem('vegas_local_balance', cleanBal.toString());
    if (account) {
      updateBalance(cleanBal);
    }
  };

  // 🛡️ GUARDIÃO DE AUTENTICAÇÃO: Intercepta qualquer ação restrita
  const requireAuth = (actionName: string, onAllowed: () => void) => {
    if (!isLoggedIn) {
      setAuthModalMode('register');
      setAuthActionName(actionName);
      setIsAuthModalOpen(true);
      return false;
    }
    onAllowed();
    return true;
  };

  // Filter games based on category tab & search query
  const filteredGames = useMemo(() => {
    return GAMES_CATALOG.filter((game) => {
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            game.provider.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedCategory === 'Todos') return matchesSearch;
      if (selectedCategory === 'Novos') return matchesSearch && game.badge === 'NOVO';
      return matchesSearch && game.category === selectedCategory;
    });
  }, [selectedCategory, searchQuery]);

  const handleDepositSuccess = (amount: number) => {
    const bonus = amount; // 100% Deposit Bonus
    const totalAdded = amount + bonus;
    const newTotalBalance = balance + totalAdded;
    handleUpdateBalance(newTotalBalance);
    setDepositBonusAlert({ deposited: amount, bonus, total: newTotalBalance });
  };

  // Abrir Jogo com trava de login
  const handleSelectGame = (gameName: string) => {
    requireAuth('jogar no cassino', () => {
      setSelectedGame(gameName);
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'ViewContent', {
          content_name: gameName,
          content_category: 'Cassino',
        });
      }
    });
  };

  // Abrir Depósito / Carteira com trava de login
  const handleOpenDeposit = () => {
    requireAuth('adicionar saldo via PIX', () => {
      setCashierTab('deposit');
      setIsCashierOpen(true);
    });
  };

  // Abrir Saque com trava de login
  const handleOpenWithdraw = () => {
    requireAuth('solicitar saque via PIX', () => {
      setCashierTab('withdraw');
      setIsCashierOpen(true);
    });
  };

  // Abrir Roleta com trava de login
  const handleOpenWheel = () => {
    requireAuth('girar a Roleta Diária', () => {
      setIsWheelOpen(true);
    });
  };

  // Mudar de aba livremente para navegação do usuário
  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_name: `Aba ${tab.toUpperCase()}`,
        content_category: 'Navegação',
      });
    }
  };

  // 🛡️ 1. Render Admin Panel if on /admin route
  if (isAdminRoute) {
    return (
      <AdminPanel
        onBackToCasino={() => {
          window.history.pushState({}, '', '/');
          setIsAdminRoute(false);
        }}
      />
    );
  }

  // 🛡️ 2. Render Maintenance Screen if casino is paused
  if (isMaintenanceActive) {
    return (
      <MaintenanceScreen
        message={maintenanceMessage}
        onAdminAccess={() => {
          window.history.pushState({}, '', '/admin');
          setIsAdminRoute(true);
        }}
      />
    );
  }

  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-[#03070e] text-slate-100 flex justify-center items-start font-sans antialiased selection:bg-amber-400 selection:text-black overflow-x-hidden">
      
      {/* Mobile Frame Container for FuturoBet - Locked to Mobile Viewport */}
      <div className="w-full max-w-md min-h-screen min-h-[100dvh] bg-[#060a14] flex flex-col justify-between relative shadow-[0_0_50px_rgba(0,0,0,0.8)] sm:border-x border-[#131d33] overflow-x-hidden">
        
        {/* Main Content Area (pb-20 garante que os jogos nunca fiquem escondidos atrás da barra fixa) */}
        <div className="w-full flex-1 flex flex-col pb-20">
          
          {/* TOP HEADER BAR - Sempre no topo fixo */}
          <Header
            balance={balance}
            isLoggedIn={isLoggedIn}
            userName={account?.name}
            onOpenLogin={() => {
              setAuthModalMode('login');
              setAuthActionName(undefined);
              setIsAuthModalOpen(true);
            }}
            onOpenRegister={() => {
              setAuthModalMode('register');
              setAuthActionName(undefined);
              setIsAuthModalOpen(true);
            }}
            onOpenProfile={() => setIsProfileOpen(true)}
            onLogout={logout}
            onOpenDeposit={handleOpenDeposit}
            onOpenWithdraw={handleOpenWithdraw}
            onOpenWheel={handleOpenWheel}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentTab={currentTab}
          />

          {/* TAB 1: CASSINO SCREEN */}
          {currentTab === 'cassino' && (
            <div className="w-full flex flex-col animate-in fade-in duration-300">
              
              {/* Hero Banner Carousel */}
              <BannerCarousel
                onSelectGame={handleSelectGame}
                onOpenDeposit={handleOpenDeposit}
              />

              {/* 🎡 DAILY ROLETA PROMINENT BANNER */}
              <RoletaBanner onOpenWheel={handleOpenWheel} />

              {/* Category Pills Nav */}
              <CategoryNav
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
              />

              {/* Popular Games Section */}
              <div className="w-full px-3 pt-3.5 pb-20">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      Jogos em Destaque
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                    {filteredGames.length} Jogos
                  </span>
                </div>

                {/* Game Cards Grid - Rows 1 & 2 (First 6 Games) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {filteredGames.slice(0, 6).map((game) => (
                    <GameCard key={game.id} game={game} onSelect={handleSelectGame} />
                  ))}
                </div>

                {/* Rotating Middle Banner (Bonus & Traditional Games) */}
                <MiddleBannerCarousel onOpenDeposit={handleOpenDeposit} />

                {/* Game Cards Grid - Row 3+ (Remaining Games) */}
                {filteredGames.length > 6 && (
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    {filteredGames.slice(6).map((game) => (
                      <GameCard key={game.id} game={game} onSelect={handleSelectGame} />
                    ))}
                  </div>
                )}

                {/* Institutional Casino Footer & Compliance */}
                <div className="mt-6 pt-5 border-t border-[#131d33] px-2 text-center text-slate-400 space-y-3">
                  <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-slate-300">
                    <span className="px-2 py-1 bg-[#0b1220] border border-[#1b2844] rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> PIX Instantâneo
                    </span>
                    <span className="px-2 py-1 bg-[#0b1220] border border-[#1b2844] rounded-md flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" /> SSL 256-Bit
                    </span>
                    <span className="px-2 py-1 bg-[#0b1220] border border-[#1b2844] rounded-md font-mono text-rose-400">
                      +18 Anos
                    </span>
                  </div>

                  <p className="text-[9px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                    FuturoBet é operado sob licença internacional de entretenimento e jogos digitais. Jogue com responsabilidade. Proibido para menores de 18 anos.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: FUTEBOL / APOSTAS ESPORTIVAS (BETANO & SOFASCORE STYLE) */}
          {currentTab === 'futebol' && (
            <SportsBetting
              balance={balance}
              onUpdateBalance={(newBal) => handleUpdateBalance(newBal)}
              onOpenDeposit={handleOpenDeposit}
              isLoggedIn={isLoggedIn}
              onRequireAuth={(action) => requireAuth(action, () => {})}
            />
          )}

          {/* TAB 3: ÁREA VIP & CLUBE DE RECOMPENSAS */}
          {currentTab === 'promocoes' && (
            <PromotionsSection
              balance={balance}
              onUpdateBalance={(newBal) => handleUpdateBalance(newBal)}
              onOpenDeposit={handleOpenDeposit}
              onOpenWheel={handleOpenWheel}
            />
          )}

          {/* TAB 4: SUPORTE & ATENDIMENTO 24/7 */}
          {currentTab === 'suporte' && (
            <SupportScreen
              onOpenDeposit={handleOpenDeposit}
            />
          )}

        </div>

        {/* FIXED BOTTOM NAVIGATION (Sempre visível e acessível no rodapé) */}
        <BottomNav
          currentTab={currentTab}
          onTabChange={handleTabChange}
          onOpenDeposit={handleOpenDeposit}
          onOpenWithdraw={handleOpenWithdraw}
        />

        {/* FULL INTERACTIVE SLOT MACHINE PLAYER (When a game is launched) */}
        {selectedGame && (
          <div className="fixed inset-0 z-50 bg-black flex items-center justify-center w-full h-full h-[100dvh] overflow-hidden animate-in fade-in duration-100">
            <FortuneOxGame
              gameName={selectedGame}
              onBack={() => setSelectedGame(null)}
              balance={balance}
              onUpdateBalance={(newBal) => handleUpdateBalance(newBal)}
              onOpenDeposit={handleOpenDeposit}
            />
          </div>
        )}

        {/* POP-UP COMPLETO DA CARTEIRA: DEPOSITAR & SACAR */}
        <CashierModal
          isOpen={isCashierOpen}
          initialTab={cashierTab}
          onClose={() => setIsCashierOpen(false)}
          onOpenDepositPix={() => setIsDepositOpen(true)}
          balance={balance}
          onUpdateBalance={handleUpdateBalance}
        />

        {/* DEPOSIT PIX MODAL DIRETO */}
        <DepositModal
          isOpen={isDepositOpen}
          onClose={() => setIsDepositOpen(false)}
          onSuccessDeposit={handleDepositSuccess}
        />

        {/* DAILY PRIZE WHEEL MODAL (R$ 2,50 PAGO) */}
        <DailyPrizeWheel
          isOpen={isWheelOpen}
          onClose={() => setIsWheelOpen(false)}
          balance={balance}
          onUpdateBalance={(newBal) => handleUpdateBalance(newBal)}
          onOpenDeposit={handleOpenDeposit}
        />

        {/* PERFIL DO USUÁRIO & LOGOUT SEGURO COM CONFIRMAÇÃO */}
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onLogout={logout}
          onOpenDeposit={handleOpenDeposit}
          onOpenWithdraw={handleOpenWithdraw}
          onOpenWheel={handleOpenWheel}
        />

        {/* 📱 CONFIRMAÇÃO DE SAÍDA DO CASSINO (Botão Voltar no celular) */}
        {isExitCasinoModalOpen && (
          <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-xs bg-gradient-to-b from-[#140c04] via-[#0e0802] to-black border border-amber-500/40 rounded-3xl p-5 text-center shadow-[0_0_40px_rgba(245,158,11,0.3)] relative">
              <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/40 rounded-full mx-auto flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <ShieldCheck size={24} />
              </div>

              <h3 className="text-base font-black text-white uppercase tracking-tight font-sans">
                Deseja sair do cassino?
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Seu saldo de <strong className="text-amber-400 font-mono">R$ {balance.toFixed(2)}</strong> e suas rodadas diárias estão salvas com segurança.
              </p>

              <div className="space-y-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsExitCasinoModalOpen(false)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition cursor-pointer"
                >
                  CONTINUAR NO CASSINO
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsExitCasinoModalOpen(false);
                    // Minimiza ou volta ao início
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 text-xs font-bold transition cursor-pointer"
                >
                  Ir para Início
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AUTHENTICATION / REGISTRATION MODAL (5s Popup & Action Lock) */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          redirectActionName={authActionName}
        />

        {/* DEPOSIT BONUS CELEBRATION MODAL */}
        {depositBonusAlert && (
          <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-xs bg-gradient-to-b from-[#1c1208] via-[#120a04] to-black border-2 border-amber-400 rounded-3xl p-5 text-center shadow-[0_0_50px_rgba(245,158,11,0.6)] relative">
              <button
                onClick={() => setDepositBonusAlert(null)}
                className="absolute top-3 right-3 text-amber-200/60 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                ✕
              </button>

              <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-yellow-300 text-black rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(245,158,11,0.8)] text-3xl animate-bounce">
                🎁
              </div>

              <h2 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 uppercase tracking-wider font-sans">
                DEPÓSITO E BÔNUS CREDITADOS!
              </h2>

              <p className="text-xs text-amber-200/90 font-medium mt-1">
                Seu pagamento foi confirmado instantaneamente com o Bônus VIP!
              </p>

              <div className="my-4 p-3 bg-black/80 rounded-2xl border border-amber-500/40 text-left space-y-1.5 text-xs font-bold">
                <div className="flex justify-between text-amber-200/80">
                  <span>Valor Depositado:</span>
                  <span className="text-amber-100">R$ {depositBonusAlert.deposited.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Bônus 100% VIP:</span>
                  <span className="text-amber-300">+ R$ {depositBonusAlert.bonus.toFixed(2)}</span>
                </div>
                <div className="pt-1.5 border-t border-amber-500/20 flex justify-between text-emerald-400 text-sm font-black">
                  <span>Novo Saldo:</span>
                  <span>R$ {depositBonusAlert.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-4 py-1.5 px-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center justify-center gap-1">
                <Sparkles size={12} className="fill-amber-300" />
                <span>+ 50 RODADAS GRÁTIS LIBERADAS!</span>
              </div>

              <button
                onClick={() => setDepositBonusAlert(null)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                JOGAR AGORA COM MEU BÔNUS 🎰
              </button>
            </div>
          </div>
        )}

        {/* POP-UPS PROMOCIONAIS DE ENTRADA NO CASSINO (4s Roleta e Sequência Pagando Muito) */}
        <WelcomePromoPopups
          onOpenWheel={handleOpenWheel}
          onOpenGame={handleSelectGame}
          isAnyModalOpen={Boolean(selectedGame || isAuthModalOpen || isCashierOpen || isDepositOpen || isWheelOpen || isProfileOpen || isExitCasinoModalOpen)}
        />

        {/* POP-UP COMPACTO FLUTUANTE: 100% BÔNUS PARA CADASTRO */}
        <FloatingBonusPrompt
          isOpen={showFloatingBonusPrompt && !isLoggedIn && !isAuthModalOpen && !selectedGame}
          onClaim={() => {
            setShowFloatingBonusPrompt(false);
            setAuthModalMode('register');
            setAuthActionName('resgatar 100% de bônus no 1º depósito');
            setIsAuthModalOpen(true);
          }}
          onClose={() => setShowFloatingBonusPrompt(false)}
        />

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FuturoBetContent />
    </AuthProvider>
  );
}
