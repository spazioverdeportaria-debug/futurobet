export interface GameConfig {
  id: string;
  name: string;
  provider: string;
  category: 'Slots' | 'Ao Vivo' | 'Mines' | 'Popular' | 'Novos';
  multiplier: string;
  rtp: string;
  icon: string;
  bgImage: string;
  badge?: 'HOT' | 'NOVO' | 'POPULAR' | 'TURBO';
  accentColor: string;
  demoUrl?: string;
}

export interface BannerConfig {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  gameId: string;
  ctaText: string;
  badge: string;
  actionType?: 'deposit' | 'game';
}

export interface PromotionConfig {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  color: string;
  code: string;
  buttonText: string;
}

export interface LiveWinner {
  id: string;
  user: string;
  amount: string;
  game: string;
  icon: string;
  time: string;
}

export const HERO_BANNERS: BannerConfig[] = [
  {
    id: 'olympus-welcome',
    title: '100% BÔNUS NO PRIMEIRO PIX',
    subtitle: 'Deposite R$ 20 e jogue com R$ 40 na hora!',
    image: 'https://i.pinimg.com/1200x/d5/a6/6a/d5a66a9e6425636bb7c89537d26af07f.jpg',
    gameId: 'gates-of-olympus',
    ctaText: 'DEPOSITAR ⚡',
    badge: '🎁 BÔNUS VIP',
    actionType: 'deposit',
  },
  {
    id: 'bonanza-bonus',
    title: 'MINUTOS PAGANTES ATIVADOS',
    subtitle: 'Sweet Bonanza 1000 com multiplicador de até 21.100x!',
    image: 'https://i.pinimg.com/1200x/49/b5/94/49b594c29ef556b15a94f46369ae1e46.jpg',
    gameId: 'sweet-bonanza',
    ctaText: 'JOGAR 🍭',
    badge: '🔥 PAGANDO MUITO',
    actionType: 'game',
  },
  {
    id: 'free-spins',
    title: '50 RODADAS GRÁTIS LIBERADAS',
    subtitle: 'Gire os reels do Gates of Olympus no seu 1º PIX!',
    image: 'https://i.pinimg.com/1200x/4b/43/9d/4b439db2e26d391346850d1c2dd73ff7.jpg',
    gameId: 'gates-of-olympus',
    ctaText: 'RESGATAR 🚀',
    badge: '💰 GIROS GRÁTIS',
    actionType: 'deposit',
  },
  {
    id: 'pix-withdrawal',
    title: 'SAQUE PIX EM 10 SEGUNDOS',
    subtitle: 'Seu saldo cai direto na conta via SyncPay 24h!',
    image: 'https://i.pinimg.com/736x/a7/22/04/a72204eb522e9fc1bbfbd7cf6fcc6f34.jpg',
    gameId: 'starlight-princess',
    ctaText: 'DEPOSITAR 💵',
    badge: '⚡ SAQUE IMEDIATO',
    actionType: 'deposit',
  },
];

export const PROMOTIONS: PromotionConfig[] = [
  {
    id: 'bonus-100',
    title: '100% Bônus Depósito',
    subtitle: 'Dobre seu primeiro depósito na FuturoBet',
    tag: 'BOAS-VINDAS',
    color: 'from-amber-500 to-yellow-600',
    code: 'FUTURO100',
    buttonText: 'RESGATAR',
  },
  {
    id: 'free-spins',
    title: '50 Giros Grátis',
    subtitle: 'Válido para Gates of Olympus e Sweet Bonanza',
    tag: 'EXCLUSIVO',
    color: 'from-yellow-400 to-amber-600',
    code: 'GIROS50',
    buttonText: 'RESGATAR',
  },
  {
    id: 'cashback',
    title: 'Cashback Fim de Semana',
    subtitle: 'Receba 15% de volta em todas as apostas',
    tag: 'SEMANAL',
    color: 'from-amber-600 to-red-600',
    code: 'CASH15',
    buttonText: 'ATIVAR',
  },
];

export const LIVE_WINNERS: LiveWinner[] = [
  { id: '1', user: 'Lucas M.***', amount: 'R$ 3.840,00', game: 'Gates of Olympus', icon: '🏛️', time: 'Agora' },
  { id: '2', user: 'Ana P.***', amount: 'R$ 1.250,50', game: 'Sweet Bonanza 1000', icon: '🍭', time: '1m atrás' },
  { id: '3', user: 'Gabriel S.***', amount: 'R$ 8.900,00', game: 'Aviator', icon: '✈️', time: '2m atrás' },
  { id: '4', user: 'Carla R.***', amount: 'R$ 500,00', game: 'Sugar Rush 1000', icon: '🍬', time: '3m atrás' },
  { id: '5', user: 'Felipe C.***', amount: 'R$ 12.450,00', game: 'Starlight Princess 1000', icon: '✨', time: '5m atrás' },
];

export const GAMES_CATALOG: GameConfig[] = [
  {
    id: 'sweet-bonanza',
    name: 'Sweet Bonanza 1000',
    provider: 'PRAGMATIC PLAY',
    category: 'Slots',
    multiplier: 'x21100',
    rtp: '96.48%',
    icon: '🍭',
    bgImage: 'https://www.segs.com.br/media/k2/items/cache/abb4a514c067bb67ed4e552f8f109c6f_XL.jpg',
    badge: 'HOT',
    accentColor: '#ec4899',
    demoUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20sweetbonanza&lang=pt&cur=BRL',
  },
  {
    id: 'gates-of-olympus',
    name: 'Gates of Olympus',
    provider: 'PRAGMATIC PLAY',
    category: 'Slots',
    multiplier: 'x5000',
    rtp: '96.50%',
    icon: '🏛️',
    bgImage: 'https://fruityslots.com/wp-content/uploads/2021/05/gates-of-olympus-slot-logo.jpg',
    badge: 'HOT',
    accentColor: '#3b82f6',
    demoUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympgate&lang=pt&cur=BRL',
  },
  {
    id: 'mines',
    name: 'Mines',
    provider: 'SPRIBE',
    category: 'Mines',
    multiplier: 'x10000',
    rtp: '97.00%',
    icon: '💣',
    bgImage: 'https://www.gazetavirtual.com.br/wp-content/uploads/2023/05/Mines.png',
    badge: 'HOT',
    accentColor: '#f59e0b',
    demoUrl: 'https://demo.spribe.io/launch/mines?currency=BRL&lang=pt',
  },
  {
    id: 'sugar-rush',
    name: 'Sugar Rush 1000',
    provider: 'PRAGMATIC PLAY',
    category: 'Slots',
    multiplier: 'x25000',
    rtp: '96.53%',
    icon: '🍬',
    bgImage: 'https://tse-mm.bing.com/th?q=sugar%20rush%201000%20demo',
    badge: 'HOT',
    accentColor: '#a855f7',
    demoUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20sugarrush&lang=pt&cur=BRL',
  },
  {
    id: 'starlight-princess',
    name: 'Starlight Princess 1000',
    provider: 'PRAGMATIC PLAY',
    category: 'Slots',
    multiplier: 'x15000',
    rtp: '96.50%',
    icon: '✨',
    bgImage: 'https://tse-mm.bing.com/th?q=princess%20starlight&w=512&h=512&c=7',
    badge: 'TURBO',
    accentColor: '#f43f5e',
    demoUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20starlight&lang=pt&cur=BRL',
  },
  {
    id: 'big-bass-bonanza',
    name: 'Big Bass Bonanza',
    provider: 'PRAGMATIC PLAY',
    category: 'Slots',
    multiplier: 'x2100',
    rtp: '96.71%',
    icon: '🐟',
    bgImage: 'https://play-lh.googleusercontent.com/FkcZso198lIGQ8HFTrkYqtiXbkSWxGexWWV7LghJ_AS0EmoPIn1FKlMCUUKuKeyYpE2P31sYVhD6ngLGmNkE',
    badge: 'POPULAR',
    accentColor: '#0284c7',
    demoUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs10bbbonanza&lang=pt&cur=BRL',
  },
  {
    id: 'goal',
    name: 'Goal',
    provider: 'SPRIBE',
    category: 'Popular',
    multiplier: 'x9000',
    rtp: '97.00%',
    icon: '⚽',
    bgImage: 'https://imagecache.365scores.com/image/fetch/f_jpg,c_fill,q_auto:eco,dpr_2/https%3A%2F%2Fimagecache.365scores.com%2Fimage%2Fupload%2Ff_png%2Cc_limit%2Cq_auto%3Aeco%2Fv1774389978%2FWebSite%2FBettingZone%2FWordpress%2Fodds.png%3F_i%3DAA',
    badge: 'NOVO',
    accentColor: '#3b82f6',
    demoUrl: 'https://demo.spribe.io/launch/goal?currency=BRL&lang=pt',
  },
  {
    id: 'fruit-party',
    name: 'Fruit Party',
    provider: 'PRAGMATIC PLAY',
    category: 'Slots',
    multiplier: 'x5000',
    rtp: '96.47%',
    icon: '🍓',
    bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9Iyr0UaG1OGjwbOwKlHQxqJdVOXlCeMCC9an7tOltvw&s=10',
    badge: 'NOVO',
    accentColor: '#10b981',
    demoUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fruitparty&lang=pt&cur=BRL',
  },
  {
    id: 'madame-destiny',
    name: 'Madame Destiny Megaways',
    provider: 'PRAGMATIC PLAY',
    category: 'Slots',
    multiplier: 'x5000',
    rtp: '96.56%',
    icon: '🔮',
    bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQALqcm0KON_3oZ4xlysaZEMMeZESFo2qG9BXhhqrhINFquTc50rH8npZE&s=10',
    badge: 'HOT',
    accentColor: '#a855f7',
    demoUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vswaysmadame&lang=pt&cur=BRL',
  },
  {
    id: 'wolf-gold',
    name: 'Wolf Gold',
    provider: 'PRAGMATIC PLAY',
    category: 'Slots',
    multiplier: 'x2500',
    rtp: '96.01%',
    icon: '🐺',
    bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcxG8d-9Vy_1SZyFbVJqNcNpEp2k46D0PtULHcRrBOyfoMUHrn5YHNFLRm&s=10',
    badge: 'POPULAR',
    accentColor: '#3b82f6',
    demoUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs25wolfgold&lang=pt&cur=BRL',
  },
  {
    id: 'hand-of-midas',
    name: 'The Hand of Midas',
    provider: 'PRAGMATIC PLAY',
    category: 'Slots',
    multiplier: 'x5000',
    rtp: '96.54%',
    icon: '👑',
    bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7x3UsD3QB9ME5gSCrzI-uwlKgQLS41T2jSCWhAxZKZybpLplMk3V9Pq8&s=10',
    badge: 'NOVO',
    accentColor: '#f59e0b',
    demoUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20midas&lang=pt&cur=BRL',
  },
  {
    id: 'aviator',
    name: 'Aviator',
    provider: 'SPRIBE',
    category: 'Popular',
    multiplier: 'x10000',
    rtp: '97.00%',
    icon: '✈️',
    bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw65smyMq_jnwgGUta0ALlu9pnF4S8NPfWnYrZQKxYBu2KC2BuP9P5ik5p&s=10',
    badge: 'HOT',
    accentColor: '#ef4444',
    demoUrl: 'https://demo.spribe.io/launch/aviator?currency=BRL&lang=pt',
  },
];

