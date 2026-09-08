import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  MoreVertical, 
  Star, 
  ChevronRight, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Trash2, 
  Download, 
  Share2, 
  Info,
  CheckCircle2,
  Gamepad2,
  LayoutGrid,
  Search,
  BookOpen,
  User,
  Smartphone,
  ExternalLink,
  Zap,
  Flame,
  Award
} from 'lucide-react';

interface AppDownloadLandingProps {
  onEnterCasino: (options?: { directRegister?: boolean; directGame?: string }) => void;
  gameIdParam?: string | null;
}

export default function AppDownloadLanding({ onEnterCasino, gameIdParam }: AppDownloadLandingProps) {
  const [isAddingToPhone, setIsAddingToPhone] = useState(false);
  const [addProgress, setAddProgress] = useState(0);
  const [addMessage, setAddMessage] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'jogos' | 'apps' | 'pesquisa' | 'livros' | 'voce'>('pesquisa');

  // Captura o evento nativo de instalação do PWA no Android/Chrome
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // 1. BOTÃO PRÁTICO: "Jogar Agora" (Entrada direta e imediata no cassino/jogos)
  const handlePlayNow = () => {
    try {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'ViewContent', { content_name: 'PlayStore_Jogar_Agora' });
      }
    } catch (e) {
      // ignore
    }
    localStorage.setItem('fb_presell_dismissed', 'true');
    onEnterCasino({ directRegister: false, directGame: gameIdParam || undefined });
  };

  // 2. BOTÃO PRÁTICO: "Adicionar Cassino no Celular" (Adiciona atalho/PWA e entra)
  const handleAddToPhone = async () => {
    if (isAddingToPhone) return;

    try {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'Lead', { content_name: 'PlayStore_Adicionar_Celular' });
        (window as any).fbq('track', 'InitiateCheckout', { content_name: 'PlayStore_Install_PWA' });
      }
    } catch (e) {
      // ignore
    }

    // Se o navegador suportar instalação nativa PWA
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          localStorage.setItem('fb_presell_dismissed', 'true');
          onEnterCasino({ directRegister: true, directGame: gameIdParam || undefined });
          return;
        }
      } catch (err) {
        console.warn('Install prompt note:', err);
      }
    }

    // Feedback visual suave de instalação rápida Google Play
    setIsAddingToPhone(true);
    setAddProgress(25);
    setAddMessage('Verificando compatibilidade...');

    setTimeout(() => {
      setAddProgress(60);
      setAddMessage('Adicionando atalho seguro ao celular...');
    }, 400);

    setTimeout(() => {
      setAddProgress(100);
      setAddMessage('Pronto! Abrindo FuturoBet...');
    }, 900);

    setTimeout(() => {
      localStorage.setItem('fb_presell_dismissed', 'true');
      onEnterCasino({ directRegister: true, directGame: gameIdParam || undefined });
    }, 1300);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] text-[#1f1f1f] flex justify-center items-start font-sans antialiased selection:bg-[#0b57d0] selection:text-white">
      {/* Container Mobile Google Play Store fiel (Light Mode idêntico ao Android Play Store) */}
      <div className="w-full max-w-[480px] min-h-screen bg-white flex flex-col justify-between relative shadow-[0_4px_30px_rgba(0,0,0,0.06)] sm:border-x border-[#e3e3e3] pb-24">
        
        {/* =========================================================
            1. TOP APP BAR GOOGLE PLAY (Seta voltar, Salvar, Menu 3 pontos)
           ========================================================= */}
        <header className="w-full px-4 h-14 flex items-center justify-between bg-white sticky top-0 z-30">
          <button 
            onClick={handlePlayNow}
            title="Voltar"
            className="p-1 -ml-1 text-[#1f1f1f] hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleAddToPhone}
              title="Adicionar à lista de desejos"
              className="p-2 text-[#1f1f1f] hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <div className="relative">
                <Bookmark size={20} strokeWidth={2} />
                <span className="absolute -top-1 -right-1 text-[10px] font-black text-[#0b57d0] leading-none">+</span>
              </div>
            </button>
            <button 
              onClick={handlePlayNow}
              title="Mais opções"
              className="p-2 text-[#1f1f1f] hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <MoreVertical size={20} strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* =========================================================
            2. CABEÇALHO DO APP (Ícone com Logo Futuro em amarelo e Bet em preto, Título e Desenvolvedor)
           ========================================================= */}
        <section className="px-4 pt-1 pb-3 flex items-start gap-4">
          {/* ÍCONE DO APP: 
              Conforme exigência estrita: "a nossa logo é só Futuro Bet, Futuro em amarelo e Bet na cor preta. É só a letra, não tem ícone."
          */}
          <div className="w-[74px] h-[74px] flex-shrink-0 rounded-[18px] bg-white border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center p-2 select-none">
            <div className="text-center font-black tracking-tight leading-none">
              <div className="text-[17px]">
                <span className="text-[#eab308]">Futuro</span>
                <span className="text-[#000000]">Bet</span>
              </div>
            </div>
          </div>

          {/* Título e Desenvolvedor */}
          <div className="flex-1 min-w-0">
            <h1 className="text-[21px] font-normal leading-[26px] text-[#1f1f1f] tracking-tight">
              FuturoBet: Apostas e Cassino
            </h1>
            <p className="text-[13px] text-[#0b57d0] font-medium mt-0.5 hover:underline cursor-pointer">
              FuturoBet Entretenimento Brasil Ltda
            </p>
            <p className="text-[11px] text-[#5f6368] mt-0.5">
              Contém anúncios • Compras no app
            </p>
          </div>
        </section>

        {/* =========================================================
            3. MÉTRICAS E AVALIAÇÕES (Colunas com divisores verticais do Google Play)
           ========================================================= */}
        <section className="px-4 py-2 border-b border-[#f1f3f4]">
          <div className="flex items-center justify-between text-center max-w-sm mx-auto">
            {/* Avaliação */}
            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center gap-1 text-[13px] font-bold text-[#1f1f1f]">
                <span>4,7</span>
                <Star size={12} className="fill-[#1f1f1f] text-[#1f1f1f]" />
              </div>
              <div className="flex items-center gap-0.5 text-[10px] text-[#5f6368] mt-0.5">
                <span>344 mil avaliações</span>
                <Info size={10} />
              </div>
            </div>

            {/* Divisor */}
            <div className="w-[1px] h-6 bg-[#dadce0]" />

            {/* Faixa Etária 18+ */}
            <div className="flex-1 flex flex-col items-center">
              <div className="w-5 h-5 rounded-[3px] border border-[#1f1f1f] flex items-center justify-center text-[11px] font-black text-[#1f1f1f]">
                18
              </div>
              <div className="flex items-center gap-0.5 text-[10px] text-[#5f6368] mt-0.5">
                <span>Classificação 18 anos</span>
                <Info size={10} />
              </div>
            </div>

            {/* Divisor */}
            <div className="w-[1px] h-6 bg-[#dadce0]" />

            {/* Tamanho / Downloads */}
            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center gap-0.5 text-[13px] font-bold text-[#1f1f1f]">
                <Download size={12} strokeWidth={2.5} className="text-[#1f1f1f]" />
                <span>82 MB</span>
              </div>
              <div className="text-[10px] text-[#5f6368] mt-0.5">
                50 mi+ downloads
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            4. BOTÕES DE AÇÃO PRÁTICOS E DIRETOS
               "O botão é Jogar Agora ou Adicionar Cassino no Celular, tipo, Adicionar. Jogar Agora ou Adicionar, dois botões ali práticos, que a pessoa pode ver que é uma bet e já clicar em Jogar Agora"
           ========================================================= */}
        <section className="px-4 pt-4 pb-2">
          {isAddingToPhone ? (
            /* Barra de Progresso Realista do Google Play durante a adição */
            <div className="w-full bg-[#f0f4f9] rounded-full p-2 border border-[#c2d7fa]">
              <div className="flex items-center justify-between text-xs text-[#0b57d0] font-semibold px-2 mb-1.5">
                <span>{addMessage}</span>
                <span>{addProgress}%</span>
              </div>
              <div className="w-full h-2 bg-[#e0e8f5] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0b57d0] transition-all duration-300 rounded-full"
                  style={{ width: `${addProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* BOTÃO 1: JOGAR AGORA (Principal - Google Play Blue) */}
              <button
                onClick={handlePlayNow}
                className="flex-1 h-11 bg-[#0b57d0] hover:bg-[#0842a0] active:scale-[0.98] text-white text-[14px] font-semibold rounded-full flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <span>Jogar Agora</span>
                <ArrowRight size={16} />
              </button>

              {/* BOTÃO 2: ADICIONAR CASSINO NO CELULAR (Secundário estilo Play Store) */}
              <button
                onClick={handleAddToPhone}
                className="h-11 px-4 bg-[#f0f4f9] hover:bg-[#e4ebf5] active:scale-[0.98] border border-[#c2d7fa] text-[#0b57d0] text-[13px] font-semibold rounded-full flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
              >
                <Smartphone size={15} />
                <span>Adicionar no Celular</span>
              </button>
            </div>
          )}

          {/* Microcopy oficial do Google Play */}
          <p className="text-[11px] text-[#5f6368] text-center mt-2.5">
            Instalar em smartphone. Mais dispositivos estão disponíveis.
          </p>
        </section>

        {/* =========================================================
            5. CARROSSEL DE PRINTS DO APP (Idêntico ao Betano na referência)
           ========================================================= */}
        <section className="pt-3 pb-4">
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar scroll-smooth">
            
            {/* Card 1: Promoções e Torneios */}
            <div 
              onClick={handlePlayNow}
              className="flex-shrink-0 w-[160px] aspect-[9/16] rounded-[14px] bg-gradient-to-b from-[#111111] via-[#1a1a1a] to-[#0d0d0d] p-3 text-white flex flex-col justify-between border border-[#e0e0e0] shadow-sm cursor-pointer hover:opacity-95 transition"
            >
              <div>
                <div className="font-black text-sm tracking-tight mb-2 flex items-center gap-0.5">
                  <span className="text-[#eab308]">FUTURO</span>
                  <span className="text-white">BET</span>
                </div>
                <div className="space-y-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                  <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Torneios Diários</span>
                  </div>
                  <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Missões Exclusivas</span>
                  </div>
                  <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Cashback Semanal</span>
                  </div>
                </div>
              </div>
              
              {/* Miniatura Ilustrativa do App */}
              <div className="w-full bg-black/60 rounded-lg p-2 border border-white/10 text-center">
                <p className="text-[10px] text-amber-400 font-bold">100% BÔNUS</p>
                <p className="text-[8px] text-gray-300">No seu primeiro PIX</p>
              </div>

              <div className="text-[7px] text-gray-400 text-center leading-tight">
                18+ Jogue com responsabilidade.
              </div>
            </div>

            {/* Card 2: Melhores Odds e Apostas */}
            <div 
              onClick={handlePlayNow}
              className="flex-shrink-0 w-[160px] aspect-[9/16] rounded-[14px] bg-gradient-to-b from-[#e65100] via-[#bf360c] to-[#3e1206] p-3 text-white flex flex-col justify-between border border-[#e0e0e0] shadow-sm cursor-pointer hover:opacity-95 transition"
            >
              <div>
                <div className="font-black text-sm tracking-tight mb-2 flex items-center gap-0.5">
                  <span className="text-[#eab308]">FUTURO</span>
                  <span className="text-white">BET</span>
                </div>
                <div className="space-y-1 text-[9px] font-bold leading-tight">
                  <p className="text-amber-200">MELHORES ODDS</p>
                  <p className="text-[8px] text-white/90">APOSTAS MÚLTIPLAS COM ATÉ 200% DE AUMENTO</p>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-1.5 border border-white/10 space-y-1">
                <div className="flex justify-between text-[8px] font-semibold text-gray-200">
                  <span>Vitória x Grêmio</span>
                  <span className="text-amber-400 font-bold">2.45</span>
                </div>
                <div className="flex justify-between text-[8px] font-semibold text-gray-200">
                  <span>Flamengo x Coritiba</span>
                  <span className="text-amber-400 font-bold">1.85</span>
                </div>
              </div>

              <div className="text-[7px] text-white/70 text-center leading-tight">
                Autorizado Portaria SPA/MF.
              </div>
            </div>

            {/* Card 3: Criar Aposta & 25% Aumento */}
            <div 
              onClick={handlePlayNow}
              className="flex-shrink-0 w-[160px] aspect-[9/16] rounded-[14px] bg-gradient-to-b from-[#ff6f00] via-[#e65100] to-[#bf360c] p-3 text-white flex flex-col justify-between border border-[#e0e0e0] shadow-sm cursor-pointer hover:opacity-95 transition"
            >
              <div>
                <div className="font-black text-sm tracking-tight mb-2 flex items-center gap-0.5">
                  <span className="text-[#eab308]">FUTURO</span>
                  <span className="text-white">BET</span>
                </div>
                <div className="space-y-1 text-[9px] font-bold leading-tight">
                  <p className="text-amber-200">25% DE AUMENTO</p>
                  <p className="text-[8px] text-white/90">COM O CRIAR APOSTA AO VIVO</p>
                </div>
              </div>

              <div className="bg-black/40 rounded-lg p-2 border border-white/10 text-center">
                <p className="text-[10px] text-white font-extrabold">SAQUE IMEDIATO</p>
                <p className="text-[8px] text-amber-300 font-bold">PIX em menos de 2 min</p>
              </div>

              <div className="text-[7px] text-white/70 text-center leading-tight">
                18+ Ministério da Fazenda.
              </div>
            </div>

            {/* Card 4: Roleta & Slots */}
            <div 
              onClick={handlePlayNow}
              className="flex-shrink-0 w-[160px] aspect-[9/16] rounded-[14px] bg-gradient-to-b from-[#212121] via-[#111111] to-black p-3 text-white flex flex-col justify-between border border-[#e0e0e0] shadow-sm cursor-pointer hover:opacity-95 transition"
            >
              <div>
                <div className="font-black text-sm tracking-tight mb-2 flex items-center gap-0.5">
                  <span className="text-[#eab308]">FUTURO</span>
                  <span className="text-white">BET</span>
                </div>
                <div className="space-y-1 text-[9px] font-bold leading-tight">
                  <p className="text-amber-300">ROLETA BRASILEIRA</p>
                  <p className="text-[8px] text-gray-300">CASSINO AO VIVO & SLOTS PG SOFT</p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 text-center">
                <p className="text-[10px] text-amber-400 font-black">FORTUNE TIGER</p>
                <p className="text-[8px] text-gray-300">Fortune Ox & Roleta VIP</p>
              </div>

              <div className="text-[7px] text-gray-400 text-center leading-tight">
                Segurança e criptografia SSL.
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================
            6. SOBRE ESTE APP (Idêntico ao Google Play)
           ========================================================= */}
        <section className="px-4 py-3 border-t border-[#f1f3f4]">
          <div 
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <h2 className="text-[17px] font-medium text-[#1f1f1f]">Sobre este app</h2>
            <div className="w-8 h-8 rounded-full bg-[#f0f4f9] group-hover:bg-[#e4ebf5] flex items-center justify-center text-[#1f1f1f] transition">
              <ArrowRight size={16} />
            </div>
          </div>

          <p className="text-[13px] text-[#5f6368] mt-2 leading-relaxed">
            Apostas esportivas e cassino online na 1ª casa regulamentada do Brasil
          </p>

          {showFullDescription && (
            <div className="mt-3 text-[12px] text-[#5f6368] space-y-2 border-t border-gray-100 pt-3">
              <p>
                O aplicativo oficial do <strong>FuturoBet</strong> oferece a melhor experiência em apostas esportivas, futebol nacional e internacional, além dos jogos de cassino mais populares como Roleta ao Vivo, Fortune Tiger e Fortune Ox.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Depósitos e saques instantâneos via PIX</li>
                <li>Odds aumentadas no Brasileirão Série A e Libertadores</li>
                <li>Suporte ao cliente 24 horas por dia em português</li>
                <li>Ambiente 100% regulamentado de acordo com a legislação brasileira (SPA/MF)</li>
              </ul>
            </div>
          )}

          {/* CHIP DE CLASSIFICAÇÃO: Idêntico à referência (Número 1 da lista principais apps...) */}
          <div 
            onClick={handlePlayNow}
            className="mt-4 p-3 rounded-xl border border-[#dadce0] bg-white flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
          >
            <span className="text-[12px] font-medium text-[#1f1f1f]">
              Número 1 da lista principais apps gratuitos de cassino
            </span>
            <ChevronRight size={16} className="text-[#5f6368]" />
          </div>
        </section>

        {/* =========================================================
            7. SEGURANÇA DOS DADOS (Google Play Data Safety)
           ========================================================= */}
        <section className="px-4 py-4 border-t border-[#f1f3f4]">
          <div className="flex items-center justify-between cursor-pointer group" onClick={handlePlayNow}>
            <h2 className="text-[17px] font-medium text-[#1f1f1f]">Segurança dos dados</h2>
            <div className="w-8 h-8 rounded-full bg-[#f0f4f9] group-hover:bg-[#e4ebf5] flex items-center justify-center text-[#1f1f1f] transition">
              <ArrowRight size={16} />
            </div>
          </div>

          <p className="text-[12px] text-[#5f6368] mt-2 leading-relaxed">
            Sua segurança começa quando você entende como os desenvolvedores coletam e compartilham seus dados. Práticas de privacidade e segurança podem variar de acordo com o uso, a região e a sua idade.
          </p>

          <div className="mt-3 p-3 rounded-xl border border-[#dadce0] space-y-2.5">
            <div className="flex items-start gap-3">
              <ShieldCheck size={18} className="text-[#5f6368] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-medium text-[#1f1f1f]">Nenhum dado compartilhado com terceiros</p>
                <p className="text-[11px] text-[#5f6368]">O desenvolvedor declara que este app não compartilha dados de usuários com outras empresas.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock size={18} className="text-[#5f6368] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-medium text-[#1f1f1f]">Os dados são criptografados em trânsito</p>
                <p className="text-[11px] text-[#5f6368]">Seus dados são transferidos por uma conexão segura SSL de 256 bits.</p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            8. AVALIAÇÕES E NOTAS PREVIEW
           ========================================================= */}
        <section className="px-4 py-3 border-t border-[#f1f3f4]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[17px] font-medium text-[#1f1f1f]">Avaliações e notas</h2>
            <ChevronRight size={18} className="text-[#5f6368]" />
          </div>

          <div className="flex items-center gap-4 py-1">
            <div className="text-center">
              <span className="text-[40px] font-light leading-none text-[#1f1f1f]">4,7</span>
              <div className="flex items-center gap-0.5 justify-center mt-1 text-[#0b57d0]">
                <Star size={12} className="fill-current" />
                <Star size={12} className="fill-current" />
                <Star size={12} className="fill-current" />
                <Star size={12} className="fill-current" />
                <Star size={12} className="fill-current" />
              </div>
              <span className="text-[10px] text-[#5f6368] block mt-1">344.180</span>
            </div>

            {/* Barras de avaliação Google Play */}
            <div className="flex-1 space-y-1">
              {[
                { stars: 5, pct: '85%' },
                { stars: 4, pct: '10%' },
                { stars: 3, pct: '3%' },
                { stars: 2, pct: '1%' },
                { stars: 1, pct: '1%' },
              ].map((b) => (
                <div key={b.stars} className="flex items-center gap-2 text-[10px] text-[#5f6368]">
                  <span className="w-1 text-right">{b.stars}</span>
                  <div className="flex-1 h-1 bg-[#e0e0e0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0b57d0] rounded-full" style={{ width: b.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            9. BARRA INFERIOR GOOGLE PLAY STORE (Jogos, Apps, Pesquisa, Livros, Você)
               Réplica exata da barra de navegação inferior exibida no screenshot de referência
           ========================================================= */}
        <nav className="w-full max-w-[480px] h-16 bg-white border-t border-[#dadce0] fixed bottom-0 z-40 flex items-center justify-around px-2 select-none shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
          
          {/* Aba Jogos */}
          <button
            onClick={() => {
              setActiveBottomTab('jogos');
              handlePlayNow();
            }}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#5f6368] hover:text-[#1f1f1f] transition cursor-pointer"
          >
            <Gamepad2 size={20} strokeWidth={activeBottomTab === 'jogos' ? 2.5 : 1.8} />
            <span className="text-[11px] font-medium mt-1">Jogos</span>
          </button>

          {/* Aba Apps */}
          <button
            onClick={() => {
              setActiveBottomTab('apps');
              handlePlayNow();
            }}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#5f6368] hover:text-[#1f1f1f] transition cursor-pointer"
          >
            <LayoutGrid size={20} strokeWidth={activeBottomTab === 'apps' ? 2.5 : 1.8} />
            <span className="text-[11px] font-medium mt-1">Apps</span>
          </button>

          {/* Aba Pesquisa (Ativa na referência com pílula azul suave) */}
          <button
            onClick={() => {
              setActiveBottomTab('pesquisa');
              handlePlayNow();
            }}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#001d35] transition cursor-pointer"
          >
            <div className="px-5 py-1 rounded-full bg-[#c2e7ff] flex items-center justify-center">
              <Search size={19} strokeWidth={2.5} className="text-[#001d35]" />
            </div>
            <span className="text-[11px] font-semibold text-[#0b57d0] mt-0.5">Pesquisa</span>
          </button>

          {/* Aba Livros */}
          <button
            onClick={() => {
              setActiveBottomTab('livros');
              handlePlayNow();
            }}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#5f6368] hover:text-[#1f1f1f] transition cursor-pointer"
          >
            <BookOpen size={20} strokeWidth={activeBottomTab === 'livros' ? 2.5 : 1.8} />
            <span className="text-[11px] font-medium mt-1">Livros</span>
          </button>

          {/* Aba Você */}
          <button
            onClick={() => {
              setActiveBottomTab('voce');
              handlePlayNow();
            }}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#5f6368] hover:text-[#1f1f1f] transition cursor-pointer"
          >
            <User size={20} strokeWidth={activeBottomTab === 'voce' ? 2.5 : 1.8} />
            <span className="text-[11px] font-medium mt-1">Você</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
