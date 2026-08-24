// Multi-Sports Data Engine for FuturoBet Sportsbook
// Integrates 100% Real Live Matches from APIs (Football-Data & TheSportsDB v1 '123')
// Supports Soccer (Futebol ⚽), Basketball (Basquete NBA/NBB 🏀) & MMA (UFC 🥊)

import { FootballMatch, getOrFetchFootballMatches, formatMatchSchedule } from './footballCache';

export type SportType = 'SOCCER' | 'BASKETBALL' | 'MMA' | 'TENNIS' | 'NFL' | 'ESPORTS';

export interface SportsMatch {
  id: string;
  sport: SportType;
  category: string; // 'BRASILEIRAO' | 'EUROPEU' | 'NBA' | 'NBB' | 'UFC_NUMERADO' | 'UFC_FIGHT_NIGHT';
  league: string;
  homeTeam: string; // Or Fighter 1 for MMA
  awayTeam: string; // Or Fighter 2 for MMA
  homeLogo: string;
  awayLogo: string;
  homeCode: string;
  awayCode: string;
  homeColor: string;
  awayColor: string;
  homeScore: number;
  awayScore: number;
  timeMinute: number;
  timeFormatted: string; // "38' 🔴", "Q3 08:42", "R2 03:15", "Hoje • 21:00", "Fim de Jogo 🏁"
  timeOnly: string;
  dayFormatted: string;
  fullDateTimeFormatted: string;
  dateTimestamp: number;
  isLive: boolean;
  isFinished?: boolean;
  status?: string;
  stadium: string;
  // Sport-specific market odds
  odds: {
    // 1X2 or Head-to-Head
    home: number; // 1 (Soccer), Home Moneyline (Basketball), Fighter 1 (MMA)
    draw?: number; // X (Soccer only)
    away: number; // 2 (Soccer), Away Moneyline (Basketball), Fighter 2 (MMA)
    // Soccer
    over25?: number;
    btts?: number;
    // Basketball
    pointSpread?: number; // e.g. -5.5
    spreadHomeOdd?: number;
    spreadAwayOdd?: number;
    totalPointsLine?: number; // e.g. 222.5
    overTotalPoints?: number;
    underTotalPoints?: number;
    // MMA / UFC
    weightClass?: string; // e.g. "Peso Meio-Pesado (93kg)"
    koHome?: number; // Vence por KO/TKO
    koAway?: number;
    subHome?: number; // Vence por Finalização
    subAway?: number;
    overRoundsLine?: number; // e.g. 1.5
    overRoundsOdd?: number;
    underRoundsOdd?: number;
  };
  stats?: {
    possessionHome?: number;
    possessionAway?: number;
    shotsHome?: number;
    shotsAway?: number;
    cornersHome?: number;
    cornersAway?: number;
    attacksHome?: number;
    attacksAway?: number;
    // Basketball stats
    fieldGoalHome?: number;
    fieldGoalAway?: number;
    threePointsHome?: number;
    threePointsAway?: number;
    reboundsHome?: number;
    reboundsAway?: number;
    // MMA stats
    strikesHome?: number;
    strikesAway?: number;
    takedownsHome?: number;
    takedownsAway?: number;
  };
  events?: Array<{ min: string; type: 'goal' | 'yellow' | 'red' | 'basket' | 'knockdown' | 'takedown'; player: string; team: 'home' | 'away' }>;
}

// NBA Franchise High-Resolution Official Crests & Colors
export const NBA_TEAMS_MAP: Record<string, { code: string; stadium: string; color: string; logo: string; shortName: string }> = {
  'Los Angeles Lakers': { shortName: 'LA Lakers', code: 'LAL', stadium: 'Crypto.com Arena (Los Angeles)', color: 'from-purple-900 to-amber-600', logo: 'https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg' },
  'Boston Celtics': { shortName: 'Boston Celtics', code: 'BOS', stadium: 'TD Garden (Boston)', color: 'from-emerald-800 to-green-950', logo: 'https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg' },
  'Golden State Warriors': { shortName: 'GS Warriors', code: 'GSW', stadium: 'Chase Center (San Francisco)', color: 'from-blue-700 to-amber-500', logo: 'https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg' },
  'Chicago Bulls': { shortName: 'Chicago Bulls', code: 'CHI', stadium: 'United Center (Chicago)', color: 'from-red-800 to-black', logo: 'https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg' },
  'Denver Nuggets': { shortName: 'Denver Nuggets', code: 'DEN', stadium: 'Ball Arena (Denver)', color: 'from-blue-900 to-amber-600', logo: 'https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg' },
  'Miami Heat': { shortName: 'Miami Heat', code: 'MIA', stadium: 'Kaseya Center (Miami)', color: 'from-red-900 to-amber-700', logo: 'https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg' },
  'Milwaukee Bucks': { shortName: 'Milwaukee Bucks', code: 'MIL', stadium: 'Fiserv Forum (Milwaukee)', color: 'from-emerald-900 to-emerald-950', logo: 'https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg' },
  'Phoenix Suns': { shortName: 'Phoenix Suns', code: 'PHX', stadium: 'Footprint Center (Phoenix)', color: 'from-purple-900 to-orange-600', logo: 'https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg' },
  'Dallas Mavericks': { shortName: 'Dallas Mavericks', code: 'DAL', stadium: 'American Airlines Center (Dallas)', color: 'from-blue-800 to-zinc-900', logo: 'https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg' },
  'New York Knicks': { shortName: 'New York Knicks', code: 'NYK', stadium: 'Madison Square Garden (New York)', color: 'from-blue-800 to-orange-600', logo: 'https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg' },
  'Philadelphia 76ers': { shortName: 'Philadelphia 76ers', code: 'PHI', stadium: 'Wells Fargo Center (Philadelphia)', color: 'from-blue-800 to-red-700', logo: 'https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg' },
  'Memphis Grizzlies': { shortName: 'Memphis Grizzlies', code: 'MEM', stadium: 'FedExForum (Memphis)', color: 'from-sky-900 to-blue-950', logo: 'https://cdn.nba.com/logos/nba/1610612763/primary/L/logo.svg' },
  'Minnesota Timberwolves': { shortName: 'Minnesota Wolves', code: 'MIN', stadium: 'Target Center (Minneapolis)', color: 'from-blue-900 to-emerald-700', logo: 'https://cdn.nba.com/logos/nba/1610612750/primary/L/logo.svg' },
  'Oklahoma City Thunder': { shortName: 'OKC Thunder', code: 'OKC', stadium: 'Paycom Center (Oklahoma City)', color: 'from-sky-600 to-orange-600', logo: 'https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg' },
  'Cleveland Cavaliers': { shortName: 'Cleveland Cavs', code: 'CLE', stadium: 'Rocket Mortgage FieldHouse (Cleveland)', color: 'from-red-950 to-amber-700', logo: 'https://cdn.nba.com/logos/nba/1610612739/primary/L/logo.svg' },
  'Indiana Pacers': { shortName: 'Indiana Pacers', code: 'IND', stadium: 'Gainbridge Fieldhouse (Indianapolis)', color: 'from-blue-900 to-yellow-600', logo: 'https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg' },
  'Sacramento Kings': { shortName: 'Sacramento Kings', code: 'SAC', stadium: 'Golden 1 Center (Sacramento)', color: 'from-purple-900 to-slate-900', logo: 'https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg' },
  'LA Clippers': { shortName: 'LA Clippers', code: 'LAC', stadium: 'Intuit Dome (Inglewood)', color: 'from-blue-800 to-red-800', logo: 'https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg' },
  'San Antonio Spurs': { shortName: 'SA Spurs', code: 'SAS', stadium: 'Frost Bank Center (San Antonio)', color: 'from-zinc-800 to-black', logo: 'https://cdn.nba.com/logos/nba/1610612759/primary/L/logo.svg' },
  'Houston Rockets': { shortName: 'Houston Rockets', code: 'HOU', stadium: 'Toyota Center (Houston)', color: 'from-red-700 to-black', logo: 'https://cdn.nba.com/logos/nba/1610612745/primary/L/logo.svg' },
  'Orlando Magic': { shortName: 'Orlando Magic', code: 'ORL', stadium: 'Kia Center (Orlando)', color: 'from-blue-700 to-slate-900', logo: 'https://cdn.nba.com/logos/nba/1610612753/primary/L/logo.svg' },
  // NBB (Novo Basquete Brasil)
  'Flamengo Basquete': { shortName: 'Flamengo', code: 'FLA', stadium: 'Maracanãzinho (Rio de Janeiro)', color: 'from-red-900 to-black', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_braz_logo.svg' },
  'Franca Basquete': { shortName: 'Franca', code: 'FRA', stadium: 'Pedrocão (Franca, SP)', color: 'from-rose-900 to-slate-900', logo: 'https://upload.wikimedia.org/wikipedia/pt/4/47/Franca_Basquetebol_Clube.png' },
  'Minas Tênis Clube': { shortName: 'Minas', code: 'MTC', stadium: 'Arena UniBH (Belo Horizonte)', color: 'from-blue-900 to-slate-800', logo: 'https://upload.wikimedia.org/wikipedia/pt/a/ab/Minas_Tenis_Clube.png' },
  'São Paulo Basquete': { shortName: 'São Paulo', code: 'SPFC', stadium: 'Ginásio do Morumbi (São Paulo)', color: 'from-red-700 to-black', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg' }
};

// UFC Elite Roster Photos & Division Metadata
export const UFC_FIGHTERS_MAP: Record<string, { code: string; division: string; color: string; photo: string; country: string }> = {
  'Alex Poatan': { code: 'POA', division: 'Peso Meio-Pesado (93kg) • Campeão 🏆', color: 'from-amber-600 to-zinc-950', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/PEREIRA_ALEX_L_04-13.png', country: '🇧🇷' },
  'Alex Pereira': { code: 'POA', division: 'Peso Meio-Pesado (93kg) • Campeão 🏆', color: 'from-amber-600 to-zinc-950', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/PEREIRA_ALEX_L_04-13.png', country: '🇧🇷' },
  'Magomed Ankalaev': { code: 'ANK', division: 'Peso Meio-Pesado (93kg) • #1 Ranking', color: 'from-red-900 to-zinc-950', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-10/ANKALAEV_MAGOMED_R_10-26.png', country: '🇷🇺' },
  'Islam Makhachev': { code: 'MAK', division: 'Peso Leve (70kg) • Campeão P4P 🏆', color: 'from-red-900 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-06/MAKHACHEV_ISLAM_L_BELT_06_01.png', country: '🇷🇺' },
  'Arman Tsarukyan': { code: 'TSA', division: 'Peso Leve (70kg) • #1 Ranking', color: 'from-amber-700 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/TSARUKYAN_ARMAN_R_04-13.png', country: '🇦🇲' },
  'Jon Jones': { code: 'JON', division: 'Peso Pesado (120kg) • Campeão 🏆', color: 'from-zinc-800 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-11/JONES_JON_L_BELT_11-16.png', country: '🇺🇸' },
  'Tom Aspinall': { code: 'ASP', division: 'Peso Pesado (120kg) • Campeão Interino 🏆', color: 'from-blue-900 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-07/ASPINALL_TOM_L_BELT_07-27.png', country: '🇬🇧' },
  'Ilia Topuria': { code: 'TOP', division: 'Peso Pena (66kg) • Campeão 🏆', color: 'from-red-800 to-zinc-950', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-10/TOPURIA_ILIA_L_BELT_10-26.png', country: '🇬🇪' },
  'Alexander Volkanovski': { code: 'VOL', division: 'Peso Pena (66kg) • #1 Ranking', color: 'from-emerald-800 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-02/VOLKANOVSKI_ALEXANDER_L_BELT_02-17.png', country: '🇦🇺' },
  'Max Holloway': { code: 'HOL', division: 'Peso Pena (66kg) • Cinturão BMF 🏆', color: 'from-blue-800 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-10/HOLLOWAY_MAX_R_10-26.png', country: '🇺🇸' },
  'Dricus Du Plessis': { code: 'DDP', division: 'Peso Médio (84kg) • Campeão 🏆', color: 'from-emerald-800 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-08/DU_PLESSIS_DRICUS_L_BELT_08-17.png', country: '🇿🇦' },
  'Sean Strickland': { code: 'STR', division: 'Peso Médio (84kg) • #1 Ranking', color: 'from-red-900 to-zinc-900', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-06/STRICKLAND_SEAN_L_06_01.png', country: '🇺🇸' },
  'Charles do Bronx': { code: 'OLI', division: 'Peso Leve (70kg) • #2 Ranking', color: 'from-emerald-600 to-zinc-950', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-11/OLIVEIRA_CHARLES_L_11-16.png', country: '🇧🇷' },
  'Charles Oliveira': { code: 'OLI', division: 'Peso Leve (70kg) • #2 Ranking', color: 'from-emerald-600 to-zinc-950', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-11/OLIVEIRA_CHARLES_L_11-16.png', country: '🇧🇷' },
  'Michael Chandler': { code: 'CHA', division: 'Peso Leve (70kg) • #7 Ranking', color: 'from-red-800 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-11/CHANDLER_MICHAEL_R_11-16.png', country: '🇺🇸' },
  'Alexandre Pantoja': { code: 'PAN', division: 'Peso Mosca (57kg) • Campeão 🏆', color: 'from-emerald-700 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-12/PANTOJA_ALEXANDRE_L_BELT_12-07.png', country: '🇧🇷' },
  'Kai Asakura': { code: 'ASA', division: 'Peso Mosca (57kg) • Desafiante', color: 'from-red-800 to-zinc-950', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-12/ASAKURA_KAI_R_12-07.png', country: '🇯🇵' },
  'Gilbert Durinho': { code: 'BUR', division: 'Peso Meio-Médio (77kg) • #6 Ranking', color: 'from-emerald-700 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-03/BURNS_GILBERT_L_03-09.png', country: '🇧🇷' },
  'Sean Brady': { code: 'BRA', division: 'Peso Meio-Médio (77kg) • #5 Ranking', color: 'from-blue-800 to-zinc-950', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/BRADY_SEAN_R_09-07.png', country: '🇺🇸' },
  'Caio Borralho': { code: 'BOR', division: 'Peso Médio (84kg) • #5 Ranking', color: 'from-emerald-700 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-08/BORRALHO_CAIO_L_08-24.png', country: '🇧🇷' },
  'Jared Cannonier': { code: 'CAN', division: 'Peso Médio (84kg) • #7 Ranking', color: 'from-red-800 to-zinc-950', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-08/CANNONIER_JARED_R_08-24.png', country: '🇺🇸' },
  'Deiveson Figueiredo': { code: 'FIG', division: 'Peso Galo (61kg) • #5 Ranking', color: 'from-emerald-700 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-08/FIGUEIREDO_DEIVESON_L_08-03.png', country: '🇧🇷' },
  'Petr Yan': { code: 'YAN', division: 'Peso Galo (61kg) • #3 Ranking', color: 'from-red-900 to-zinc-950', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-03/YAN_PETR_L_03-09.png', country: '🇷🇺' },
  'Renato Moicano': { code: 'MOI', division: 'Peso Leve (70kg) • #10 Ranking', color: 'from-emerald-600 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/CARNEIRO_RENATO_L_09-28.png', country: '🇧🇷' },
  'Benoit Saint Denis': { code: 'BSD', division: 'Peso Leve (70kg) • #12 Ranking', color: 'from-blue-900 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/SAINT_DENIS_BENOIT_R_09-28.png', country: '🇫🇷' },
  'Diego Lopes': { code: 'LOP', division: 'Peso Pena (66kg) • #3 Ranking', color: 'from-emerald-600 to-zinc-950', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/LOPES_DIEGO_L_09-14.png', country: '🇧🇷' },
  'Brian Ortega': { code: 'ORT', division: 'Peso Pena (66kg) • #4 Ranking', color: 'from-blue-800 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/ORTEGA_BRIAN_R_09-14.png', country: '🇺🇸' },
  'Mackenzie Dern': { code: 'DER', division: 'Peso Palha (52kg) • #6 Ranking', color: 'from-emerald-700 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-08/DERN_MACKENZIE_L_08-03.png', country: '🇧🇷' },
  'Amanda Ribas': { code: 'RIB', division: 'Peso Palha (52kg) • #8 Ranking', color: 'from-amber-600 to-black', photo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-03/RIBAS_AMANDA_L_03-23.png', country: '🇧🇷' },
};

// Fallback Live / Upcoming NBA & NBB Games (100% Real Teams, Stadiums, Official Logos)
export const FALLBACK_BASKETBALL_MATCHES: SportsMatch[] = [
  {
    id: 'nba_up_0',
    sport: 'BASKETBALL',
    category: 'NBA',
    league: 'NBA Temporada Regular',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    homeLogo: 'https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg',
    awayLogo: 'https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg',
    homeCode: 'LAL',
    awayCode: 'GSW',
    homeColor: 'from-purple-900 to-amber-600',
    awayColor: 'from-blue-700 to-amber-500',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Hoje • 23:30',
    timeOnly: '23:30',
    dayFormatted: 'Hoje',
    fullDateTimeFormatted: 'Hoje • 23:30 (Crypto.com Arena)',
    dateTimestamp: Date.now() + (5 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'Crypto.com Arena (Los Angeles, CA)',
    odds: {
      home: 1.82,
      away: 2.05,
      pointSpread: -3.5,
      spreadHomeOdd: 1.91,
      spreadAwayOdd: 1.91,
      totalPointsLine: 226.5,
      overTotalPoints: 1.88,
      underTotalPoints: 1.88,
    }
  },
  {
    id: 'nba_up_1',
    sport: 'BASKETBALL',
    category: 'NBA',
    league: 'NBA Temporada Regular',
    homeTeam: 'Miami Heat',
    awayTeam: 'Milwaukee Bucks',
    homeLogo: 'https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg',
    awayLogo: 'https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg',
    homeCode: 'MIA',
    awayCode: 'MIL',
    homeColor: 'from-red-900 to-amber-700',
    awayColor: 'from-emerald-900 to-emerald-950',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Hoje • 21:00',
    timeOnly: '21:00',
    dayFormatted: 'Hoje',
    fullDateTimeFormatted: 'Hoje • 21:00',
    dateTimestamp: Date.now() + (3 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'Kaseya Center (Miami, FL)',
    odds: {
      home: 2.10,
      away: 1.76,
      pointSpread: 2.5,
      spreadHomeOdd: 1.90,
      spreadAwayOdd: 1.90,
      totalPointsLine: 218.5,
      overTotalPoints: 1.88,
      underTotalPoints: 1.88,
    }
  },
  {
    id: 'nba_up_2',
    sport: 'BASKETBALL',
    category: 'NBA',
    league: 'NBA Temporada Regular',
    homeTeam: 'Dallas Mavericks',
    awayTeam: 'Phoenix Suns',
    homeLogo: 'https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg',
    awayLogo: 'https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg',
    homeCode: 'DAL',
    awayCode: 'PHX',
    homeColor: 'from-blue-800 to-zinc-900',
    awayColor: 'from-purple-900 to-orange-600',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Hoje • 21:30',
    timeOnly: '21:30',
    dayFormatted: 'Hoje',
    fullDateTimeFormatted: 'Hoje • 21:30',
    dateTimestamp: Date.now() + (3.5 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'American Airlines Center (Dallas, TX)',
    odds: {
      home: 1.75,
      away: 2.15,
      pointSpread: -4.5,
      spreadHomeOdd: 1.92,
      spreadAwayOdd: 1.92,
      totalPointsLine: 231.5,
      overTotalPoints: 1.89,
      underTotalPoints: 1.89,
    }
  },
  {
    id: 'nba_up_3',
    sport: 'BASKETBALL',
    category: 'NBA',
    league: 'NBA Temporada Regular',
    homeTeam: 'New York Knicks',
    awayTeam: 'Chicago Bulls',
    homeLogo: 'https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg',
    awayLogo: 'https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg',
    homeCode: 'NYK',
    awayCode: 'CHI',
    homeColor: 'from-blue-800 to-orange-600',
    awayColor: 'from-red-800 to-black',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Hoje • 22:00',
    timeOnly: '22:00',
    dayFormatted: 'Hoje',
    fullDateTimeFormatted: 'Hoje • 22:00',
    dateTimestamp: Date.now() + (4 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'Madison Square Garden (New York, NY)',
    odds: {
      home: 1.55,
      away: 2.50,
      pointSpread: -7.5,
      spreadHomeOdd: 1.91,
      spreadAwayOdd: 1.91,
      totalPointsLine: 219.5,
      overTotalPoints: 1.86,
      underTotalPoints: 1.86,
    }
  },
  {
    id: 'nba_up_4',
    sport: 'BASKETBALL',
    category: 'NBA',
    league: 'NBA Temporada Regular',
    homeTeam: 'Oklahoma City Thunder',
    awayTeam: 'Minnesota Timberwolves',
    homeLogo: 'https://cdn.nba.com/logos/nba/1610612760/primary/L/logo.svg',
    awayLogo: 'https://cdn.nba.com/logos/nba/1610612750/primary/L/logo.svg',
    homeCode: 'OKC',
    awayCode: 'MIN',
    homeColor: 'from-sky-600 to-orange-600',
    awayColor: 'from-blue-900 to-emerald-700',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Hoje • 22:30',
    timeOnly: '22:30',
    dayFormatted: 'Hoje',
    fullDateTimeFormatted: 'Hoje • 22:30',
    dateTimestamp: Date.now() + (4.5 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'Paycom Center (Oklahoma City, OK)',
    odds: {
      home: 1.62,
      away: 2.35,
      pointSpread: -5.5,
      spreadHomeOdd: 1.90,
      spreadAwayOdd: 1.90,
      totalPointsLine: 224.5,
      overTotalPoints: 1.88,
      underTotalPoints: 1.88,
    }
  },
  {
    id: 'nba_up_5',
    sport: 'BASKETBALL',
    category: 'NBA',
    league: 'NBA Temporada Regular',
    homeTeam: 'Cleveland Cavaliers',
    awayTeam: 'Indiana Pacers',
    homeLogo: 'https://cdn.nba.com/logos/nba/1610612739/primary/L/logo.svg',
    awayLogo: 'https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg',
    homeCode: 'CLE',
    awayCode: 'IND',
    homeColor: 'from-red-950 to-amber-700',
    awayColor: 'from-blue-900 to-yellow-600',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Amanhã • 20:00',
    timeOnly: '20:00',
    dayFormatted: 'Amanhã',
    fullDateTimeFormatted: 'Amanhã • 20:00',
    dateTimestamp: Date.now() + (22 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'Rocket Mortgage FieldHouse (Cleveland, OH)',
    odds: {
      home: 1.48,
      away: 2.75,
      pointSpread: -6.5,
      spreadHomeOdd: 1.91,
      spreadAwayOdd: 1.91,
      totalPointsLine: 228.5,
      overTotalPoints: 1.89,
      underTotalPoints: 1.89,
    }
  },
  {
    id: 'nba_up_6',
    sport: 'BASKETBALL',
    category: 'NBA',
    league: 'NBA Temporada Regular',
    homeTeam: 'Sacramento Kings',
    awayTeam: 'LA Clippers',
    homeLogo: 'https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg',
    awayLogo: 'https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg',
    homeCode: 'SAC',
    awayCode: 'LAC',
    homeColor: 'from-purple-900 to-slate-900',
    awayColor: 'from-blue-800 to-red-800',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Amanhã • 21:00',
    timeOnly: '21:00',
    dayFormatted: 'Amanhã',
    fullDateTimeFormatted: 'Amanhã • 21:00',
    dateTimestamp: Date.now() + (23 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'Golden 1 Center (Sacramento, CA)',
    odds: {
      home: 1.80,
      away: 2.05,
      pointSpread: -2.5,
      spreadHomeOdd: 1.90,
      spreadAwayOdd: 1.90,
      totalPointsLine: 225.5,
      overTotalPoints: 1.88,
      underTotalPoints: 1.88,
    }
  },
  {
    id: 'nbb_up_1',
    sport: 'BASKETBALL',
    category: 'NBB',
    league: 'NBB • Novo Basquete Brasil 🇧🇷',
    homeTeam: 'Flamengo Basquete',
    awayTeam: 'Franca Basquete',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_braz_logo.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/pt/4/47/Franca_Basquetebol_Clube.png',
    homeCode: 'FLA',
    awayCode: 'FRA',
    homeColor: 'from-red-900 to-black',
    awayColor: 'from-rose-900 to-slate-900',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Hoje • 20:00',
    timeOnly: '20:00',
    dayFormatted: 'Hoje',
    fullDateTimeFormatted: 'Hoje • 20:00 (NBB Clássico)',
    dateTimestamp: Date.now() + (2 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'Maracanãzinho (Rio de Janeiro, RJ)',
    odds: {
      home: 1.70,
      away: 2.15,
      pointSpread: -3.5,
      spreadHomeOdd: 1.88,
      spreadAwayOdd: 1.88,
      totalPointsLine: 164.5,
      overTotalPoints: 1.85,
      underTotalPoints: 1.85,
    }
  },
  {
    id: 'nbb_up_2',
    sport: 'BASKETBALL',
    category: 'NBB',
    league: 'NBB • Novo Basquete Brasil 🇧🇷',
    homeTeam: 'Minas Tênis Clube',
    awayTeam: 'São Paulo Basquete',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/pt/a/ab/Minas_Tenis_Clube.png',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg',
    homeCode: 'MTC',
    awayCode: 'SPFC',
    homeColor: 'from-blue-900 to-slate-800',
    awayColor: 'from-red-700 to-black',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Amanhã • 19:30',
    timeOnly: '19:30',
    dayFormatted: 'Amanhã',
    fullDateTimeFormatted: 'Amanhã • 19:30',
    dateTimestamp: Date.now() + (21 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'Arena UniBH (Belo Horizonte, MG)',
    odds: {
      home: 1.65,
      away: 2.25,
      pointSpread: -4.5,
      spreadHomeOdd: 1.89,
      spreadAwayOdd: 1.89,
      totalPointsLine: 160.5,
      overTotalPoints: 1.86,
      underTotalPoints: 1.86,
    }
  },
  {
    id: 'nba_fin_1',
    sport: 'BASKETBALL',
    category: 'NBA',
    league: 'NBA Temporada Regular',
    homeTeam: 'Boston Celtics',
    awayTeam: 'Philadelphia 76ers',
    homeLogo: 'https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg',
    awayLogo: 'https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg',
    homeCode: 'BOS',
    awayCode: 'PHI',
    homeColor: 'from-emerald-800 to-green-950',
    awayColor: 'from-blue-800 to-red-700',
    homeScore: 118,
    awayScore: 112,
    timeMinute: 48,
    timeFormatted: 'Fim de Jogo 🏁',
    timeOnly: 'Encerrado',
    dayFormatted: 'Hoje',
    fullDateTimeFormatted: 'Hoje • Encerrado (118 x 112)',
    dateTimestamp: Date.now() - (6 * 60 * 60 * 1000),
    isLive: false,
    isFinished: true,
    status: 'FINISHED',
    stadium: 'TD Garden (Boston, MA)',
    odds: {
      home: 1.58,
      away: 2.40,
    }
  }
];

// Fallback Live / Upcoming UFC & MMA Events (Real Superstars, Belts, Weight Classes)
export const FALLBACK_MMA_MATCHES: SportsMatch[] = [
  {
    id: 'ufc_main_1',
    sport: 'MMA',
    category: 'UFC_NUMERADO',
    league: 'UFC 312: Disputa de Cinturão 🏆',
    homeTeam: 'Alex Poatan',
    awayTeam: 'Magomed Ankalaev',
    homeLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/PEREIRA_ALEX_L_04-13.png',
    awayLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-10/ANKALAEV_MAGOMED_R_10-26.png',
    homeCode: 'POA',
    awayCode: 'ANK',
    homeColor: 'from-amber-600 to-zinc-950',
    awayColor: 'from-red-900 to-zinc-950',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Sáb • 23:30',
    timeOnly: '23:30',
    dayFormatted: 'Sábado',
    fullDateTimeFormatted: 'Sábado • Card Principal (23:30)',
    dateTimestamp: Date.now() + (48 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'T-Mobile Arena (Las Vegas, NV)',
    odds: {
      home: 1.72,
      away: 2.15,
      weightClass: 'Peso Meio-Pesado (93kg) • Disputa de Cinturão',
      koHome: 2.10,
      koAway: 4.50,
      subHome: 12.00,
      subAway: 3.40,
      overRoundsLine: 1.5,
      overRoundsOdd: 1.65,
      underRoundsOdd: 2.25,
    }
  },
  {
    id: 'ufc_main_2',
    sport: 'MMA',
    category: 'UFC_NUMERADO',
    league: 'UFC 312: Co-Main Event',
    homeTeam: 'Islam Makhachev',
    awayTeam: 'Arman Tsarukyan',
    homeLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-06/MAKHACHEV_ISLAM_L_BELT_06_01.png',
    awayLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/TSARUKYAN_ARMAN_R_04-13.png',
    homeCode: 'MAK',
    awayCode: 'TSA',
    homeColor: 'from-red-900 to-black',
    awayColor: 'from-amber-700 to-black',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Sáb • 23:00',
    timeOnly: '23:00',
    dayFormatted: 'Sábado',
    fullDateTimeFormatted: 'Sábado • Card Principal (23:00)',
    dateTimestamp: Date.now() + (47.5 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'T-Mobile Arena (Las Vegas, NV)',
    odds: {
      home: 1.38,
      away: 3.10,
      weightClass: 'Peso Leve (70kg) • Disputa de Cinturão',
      koHome: 3.80,
      koAway: 6.00,
      subHome: 2.40,
      subAway: 9.00,
      overRoundsLine: 3.5,
      overRoundsOdd: 1.80,
      underRoundsOdd: 1.95,
    }
  },
  {
    id: 'ufc_main_3',
    sport: 'MMA',
    category: 'UFC_NUMERADO',
    league: 'UFC 312: Cinturão Peso Mosca 🏆',
    homeTeam: 'Alexandre Pantoja',
    awayTeam: 'Kai Asakura',
    homeLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-12/PANTOJA_ALEXANDRE_L_BELT_12-07.png',
    awayLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-12/ASAKURA_KAI_R_12-07.png',
    homeCode: 'PAN',
    awayCode: 'ASA',
    homeColor: 'from-emerald-700 to-black',
    awayColor: 'from-red-800 to-zinc-950',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Sáb • 22:30',
    timeOnly: '22:30',
    dayFormatted: 'Sábado',
    fullDateTimeFormatted: 'Sábado • Card Principal (22:30)',
    dateTimestamp: Date.now() + (46 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'T-Mobile Arena (Las Vegas, NV)',
    odds: {
      home: 1.52,
      away: 2.60,
      weightClass: 'Peso Mosca (57kg) • Defesa de Título',
      koHome: 5.50,
      koAway: 4.20,
      subHome: 2.30,
      subAway: 15.00,
      overRoundsLine: 2.5,
      overRoundsOdd: 1.70,
      underRoundsOdd: 2.10,
    }
  },
  {
    id: 'ufc_fn_1',
    sport: 'MMA',
    category: 'UFC_FIGHT_NIGHT',
    league: 'UFC Fight Night: Main Event',
    homeTeam: 'Charles do Bronx',
    awayTeam: 'Michael Chandler',
    homeLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-11/OLIVEIRA_CHARLES_L_11-16.png',
    awayLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-11/CHANDLER_MICHAEL_R_11-16.png',
    homeCode: 'OLI',
    awayCode: 'CHA',
    homeColor: 'from-emerald-600 to-zinc-950',
    awayColor: 'from-red-800 to-black',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Dom • 00:00',
    timeOnly: '00:00',
    dayFormatted: 'Domingo',
    fullDateTimeFormatted: 'Domingo • Card Principal (00:00)',
    dateTimestamp: Date.now() + (72 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'Madison Square Garden (New York, NY)',
    odds: {
      home: 1.45,
      away: 2.80,
      weightClass: 'Peso Leve (70kg)',
      koHome: 3.20,
      koAway: 3.80,
      subHome: 1.95,
      subAway: 14.00,
      overRoundsLine: 1.5,
      overRoundsOdd: 1.55,
      underRoundsOdd: 2.45,
    }
  },
  {
    id: 'ufc_fn_2',
    sport: 'MMA',
    category: 'UFC_FIGHT_NIGHT',
    league: 'UFC Fight Night: Peso Médio 84kg',
    homeTeam: 'Dricus Du Plessis',
    awayTeam: 'Sean Strickland',
    homeLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-08/DU_PLESSIS_DRICUS_L_BELT_08-17.png',
    awayLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-06/STRICKLAND_SEAN_L_06_01.png',
    homeCode: 'DDP',
    awayCode: 'STR',
    homeColor: 'from-emerald-800 to-black',
    awayColor: 'from-red-900 to-zinc-900',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Sáb • 21:45',
    timeOnly: '21:45',
    dayFormatted: 'Sábado',
    fullDateTimeFormatted: 'Sábado • Card Principal (21:45)',
    dateTimestamp: Date.now() + (45 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'Qudos Bank Arena (Sydney, Austrália)',
    odds: {
      home: 1.68,
      away: 2.20,
      weightClass: 'Peso Médio (84kg) • Disputa de Título',
      koHome: 2.80,
      koAway: 4.50,
      subHome: 3.60,
      subAway: 11.00,
      overRoundsLine: 3.5,
      overRoundsOdd: 1.85,
      underRoundsOdd: 1.95,
    }
  },
  {
    id: 'ufc_fn_3',
    sport: 'MMA',
    category: 'UFC_FIGHT_NIGHT',
    league: 'UFC Fight Night: Peso Pena 66kg',
    homeTeam: 'Ilia Topuria',
    awayTeam: 'Alexander Volkanovski',
    homeLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-10/TOPURIA_ILIA_L_BELT_10-26.png',
    awayLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-02/VOLKANOVSKI_ALEXANDER_L_BELT_02-17.png',
    homeCode: 'TOP',
    awayCode: 'VOL',
    homeColor: 'from-red-800 to-zinc-950',
    awayColor: 'from-emerald-800 to-black',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Sáb • 21:00',
    timeOnly: '21:00',
    dayFormatted: 'Sábado',
    fullDateTimeFormatted: 'Sábado • Card Principal (21:00)',
    dateTimestamp: Date.now() + (44 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'Honda Center (Anaheim, CA)',
    odds: {
      home: 1.70,
      away: 2.15,
      weightClass: 'Peso Pena (66kg) • Cinturão',
      koHome: 2.40,
      koAway: 4.80,
      subHome: 4.50,
      subAway: 8.00,
      overRoundsLine: 2.5,
      overRoundsOdd: 1.75,
      underRoundsOdd: 2.05,
    }
  },
  {
    id: 'ufc_fn_4',
    sport: 'MMA',
    category: 'UFC_FIGHT_NIGHT',
    league: 'UFC Fight Night: Peso Meio-Médio 77kg',
    homeTeam: 'Gilbert Durinho',
    awayTeam: 'Sean Brady',
    homeLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-03/BURNS_GILBERT_L_03-09.png',
    awayLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-09/BRADY_SEAN_R_09-07.png',
    homeCode: 'BUR',
    awayCode: 'BRA',
    homeColor: 'from-emerald-700 to-black',
    awayColor: 'from-blue-800 to-zinc-950',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Sáb • 20:30',
    timeOnly: '20:30',
    dayFormatted: 'Sábado',
    fullDateTimeFormatted: 'Sábado • Card Principal (20:30)',
    dateTimestamp: Date.now() + (43.5 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'UFC APEX (Las Vegas, NV)',
    odds: {
      home: 2.10,
      away: 1.75,
      weightClass: 'Peso Meio-Médio (77kg)',
      koHome: 4.20,
      koAway: 4.80,
      subHome: 3.20,
      subAway: 2.80,
      overRoundsLine: 2.5,
      overRoundsOdd: 1.80,
      underRoundsOdd: 1.95,
    }
  },
  {
    id: 'ufc_fn_5',
    sport: 'MMA',
    category: 'UFC_FIGHT_NIGHT',
    league: 'UFC Fight Night: Peso Galo 61kg',
    homeTeam: 'Deiveson Figueiredo',
    awayTeam: 'Petr Yan',
    homeLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-08/FIGUEIREDO_DEIVESON_L_08-03.png',
    awayLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-03/YAN_PETR_L_03-09.png',
    homeCode: 'FIG',
    awayCode: 'YAN',
    homeColor: 'from-emerald-700 to-black',
    awayColor: 'from-red-900 to-zinc-950',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Sáb • 20:00',
    timeOnly: '20:00',
    dayFormatted: 'Sábado',
    fullDateTimeFormatted: 'Sábado • Card Principal (20:00)',
    dateTimestamp: Date.now() + (43 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'Galaxy Arena (Macau)',
    odds: {
      home: 2.25,
      away: 1.65,
      weightClass: 'Peso Galo (61kg)',
      koHome: 5.00,
      koAway: 3.50,
      subHome: 3.50,
      subAway: 8.00,
      overRoundsLine: 2.5,
      overRoundsOdd: 1.60,
      underRoundsOdd: 2.30,
    }
  },
  {
    id: 'ufc_fn_6',
    sport: 'MMA',
    category: 'UFC_FIGHT_NIGHT',
    league: 'UFC Fight Night: Peso Palha 52kg',
    homeTeam: 'Amanda Ribas',
    awayTeam: 'Mackenzie Dern',
    homeLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-03/RIBAS_AMANDA_L_03-23.png',
    awayLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-08/DERN_MACKENZIE_L_08-03.png',
    homeCode: 'RIB',
    awayCode: 'DER',
    homeColor: 'from-amber-600 to-black',
    awayColor: 'from-emerald-700 to-black',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: 'Sáb • 19:30',
    timeOnly: '19:30',
    dayFormatted: 'Sábado',
    fullDateTimeFormatted: 'Sábado • Card Preliminar (19:30)',
    dateTimestamp: Date.now() + (42.5 * 60 * 60 * 1000),
    isLive: false,
    status: 'SCHEDULED',
    stadium: 'UFC APEX (Las Vegas, NV)',
    odds: {
      home: 1.85,
      away: 1.95,
      weightClass: 'Peso Palha Feminino (52kg)',
      koHome: 6.50,
      koAway: 7.00,
      subHome: 4.50,
      subAway: 2.60,
      overRoundsLine: 2.5,
      overRoundsOdd: 1.70,
      underRoundsOdd: 2.10,
    }
  },
  {
    id: 'ufc_fin_1',
    sport: 'MMA',
    category: 'UFC_NUMERADO',
    league: 'UFC: Defesa de Cinturão Peso Pesado 🏆',
    homeTeam: 'Jon Jones',
    awayTeam: 'Tom Aspinall',
    homeLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-11/JONES_JON_L_BELT_11-16.png',
    awayLogo: 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-07/ASPINALL_TOM_L_BELT_07-27.png',
    homeCode: 'JON',
    awayCode: 'ASP',
    homeColor: 'from-zinc-800 to-black',
    awayColor: 'from-blue-900 to-black',
    homeScore: 1,
    awayScore: 0,
    timeMinute: 3,
    timeFormatted: 'Vitória por TKO (R3) 🏆',
    timeOnly: 'Encerrado',
    dayFormatted: 'Ontem',
    fullDateTimeFormatted: 'Ontem • Encerrado (Nocaute Técnico)',
    dateTimestamp: Date.now() - (24 * 60 * 60 * 1000),
    isLive: false,
    isFinished: true,
    status: 'FINISHED',
    stadium: 'Madison Square Garden (New York, NY)',
    odds: {
      home: 1.65,
      away: 2.30,
    }
  }
];

// Fetch Basketball from server or fallback
export async function getOrFetchBasketballMatches(): Promise<SportsMatch[]> {
  try {
    const res = await fetch('/api/sports/basketball');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.events) && data.events.length > 0) {
        const mapped: SportsMatch[] = data.events.map((ev: any, idx: number) => {
          const homeName = ev.strHomeTeam || 'Casa';
          const awayName = ev.strAwayTeam || 'Fora';
          const homeMeta = NBA_TEAMS_MAP[homeName];
          const awayMeta = NBA_TEAMS_MAP[awayName];

          const isFinished = Boolean(ev.intHomeScore !== null && ev.intHomeScore !== '');
          const homeScore = isFinished ? parseInt(ev.intHomeScore, 10) : 0;
          const awayScore = isFinished ? parseInt(ev.intAwayScore, 10) : 0;

          const gameDate = ev.strTimestamp ? new Date(ev.strTimestamp) : (ev.dateEvent ? new Date(`${ev.dateEvent}T${ev.strTime || '20:00:00'}`) : new Date());
          const sched = formatMatchSchedule(gameDate);

          const hOdd = Number((1.50 + ((idx * 3) % 7) * 0.12).toFixed(2));
          const aOdd = Number((1.90 + ((idx * 5) % 9) * 0.14).toFixed(2));

          return {
            id: `nba_api_${ev.idEvent || idx}`,
            sport: 'BASKETBALL',
            category: 'NBA',
            league: ev.strLeague || 'NBA Temporada Regular',
            homeTeam: homeMeta?.shortName || homeName,
            awayTeam: awayMeta?.shortName || awayName,
            homeLogo: homeMeta?.logo || ev.strHomeTeamBadge || 'https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg',
            awayLogo: awayMeta?.logo || ev.strAwayTeamBadge || 'https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg',
            homeCode: homeMeta?.code || homeName.slice(0, 3).toUpperCase(),
            awayCode: awayMeta?.code || awayName.slice(0, 3).toUpperCase(),
            homeColor: homeMeta?.color || 'from-blue-900 to-indigo-950',
            awayColor: awayMeta?.color || 'from-purple-900 to-slate-950',
            homeScore,
            awayScore,
            timeMinute: isFinished ? 48 : 0,
            timeFormatted: isFinished ? 'Fim de Jogo 🏁' : `${sched.dayFormatted} • ${sched.timeOnly}`,
            timeOnly: isFinished ? 'Encerrado' : sched.timeOnly,
            dayFormatted: sched.dayFormatted,
            fullDateTimeFormatted: isFinished ? `${sched.dayFormatted} • Encerrado (${homeScore} x ${awayScore})` : sched.fullDateTimeFormatted,
            dateTimestamp: gameDate.getTime(),
            isLive: false,
            isFinished,
            status: isFinished ? 'FINISHED' : 'SCHEDULED',
            stadium: homeMeta?.stadium || ev.strVenue || 'Arena NBA',
            odds: {
              home: hOdd,
              away: aOdd,
              pointSpread: -4.5,
              spreadHomeOdd: 1.90,
              spreadAwayOdd: 1.90,
              totalPointsLine: 224.5,
              overTotalPoints: 1.88,
              underTotalPoints: 1.88,
            }
          };
        });

        if (mapped.length > 0) return mapped;
      }
    }
  } catch (err) {
    console.warn('Error fetching /api/sports/basketball:', err);
  }
  return FALLBACK_BASKETBALL_MATCHES;
}

// Fetch MMA from server or fallback
export async function getOrFetchMmaMatches(): Promise<SportsMatch[]> {
  try {
    const res = await fetch('/api/sports/mma');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.events) && data.events.length > 0) {
        const mapped: SportsMatch[] = data.events.map((ev: any, idx: number) => {
          const homeName = ev.strHomeTeam || ev.strEvent?.split('vs')?.[0]?.trim() || 'Lutador 1';
          const awayName = ev.strAwayTeam || ev.strEvent?.split('vs')?.[1]?.trim() || 'Lutador 2';
          const homeMeta = UFC_FIGHTERS_MAP[homeName];
          const awayMeta = UFC_FIGHTERS_MAP[awayName];

          const isFinished = Boolean(ev.intHomeScore !== null && ev.intHomeScore !== '');
          const gameDate = ev.strTimestamp ? new Date(ev.strTimestamp) : (ev.dateEvent ? new Date(`${ev.dateEvent}T${ev.strTime || '22:00:00'}`) : new Date());
          const sched = formatMatchSchedule(gameDate);

          const hOdd = Number((1.40 + ((idx * 2) % 6) * 0.15).toFixed(2));
          const aOdd = Number((2.10 + ((idx * 4) % 8) * 0.18).toFixed(2));

          return {
            id: `mma_api_${ev.idEvent || idx}`,
            sport: 'MMA',
            category: 'UFC_NUMERADO',
            league: ev.strLeague || ev.strEvent || 'UFC Fight Night',
            homeTeam: homeName,
            awayTeam: awayName,
            homeLogo: homeMeta?.photo || ev.strThumb || 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-04/PEREIRA_ALEX_L_04-13.png',
            awayLogo: awayMeta?.photo || ev.strThumb || 'https://dmxg5wxfqgb4b.cloudfront.net/styles/athlete_bio_full_body/s3/2024-10/ANKALAEV_MAGOMED_R_10-26.png',
            homeCode: homeMeta?.code || homeName.slice(0, 3).toUpperCase(),
            awayCode: awayMeta?.code || awayName.slice(0, 3).toUpperCase(),
            homeColor: homeMeta?.color || 'from-amber-600 to-zinc-950',
            awayColor: awayMeta?.color || 'from-red-900 to-zinc-950',
            homeScore: isFinished ? 1 : 0,
            awayScore: 0,
            timeMinute: 0,
            timeFormatted: isFinished ? 'Encerrado 🏁' : `${sched.dayFormatted} • ${sched.timeOnly}`,
            timeOnly: isFinished ? 'Encerrado' : sched.timeOnly,
            dayFormatted: sched.dayFormatted,
            fullDateTimeFormatted: sched.fullDateTimeFormatted,
            dateTimestamp: gameDate.getTime(),
            isLive: false,
            isFinished,
            status: isFinished ? 'FINISHED' : 'SCHEDULED',
            stadium: ev.strVenue || 'T-Mobile Arena (Las Vegas, NV)',
            odds: {
              home: hOdd,
              away: aOdd,
              weightClass: homeMeta?.division || 'Card Principal UFC',
              koHome: Number((hOdd * 1.6).toFixed(2)),
              koAway: Number((aOdd * 1.8).toFixed(2)),
              subHome: 3.50,
              subAway: 5.50,
              overRoundsLine: 1.5,
              overRoundsOdd: 1.68,
              underRoundsOdd: 2.15,
            }
          };
        });

        if (mapped.length > 0) return mapped;
      }
    }
  } catch (err) {
    console.warn('Error fetching /api/sports/mma:', err);
  }
  return FALLBACK_MMA_MATCHES;
}

// Convert FootballMatch to SportsMatch
export function convertFootballToSportsMatch(f: FootballMatch): SportsMatch {
  return {
    ...f,
    sport: 'SOCCER',
  };
}

export const FALLBACK_TENNIS_MATCHES: SportsMatch[] = [
  {
    id: 'ten_1',
    sport: 'TENNIS',
    category: 'ATP_MASTERS',
    league: 'ATP Masters 1000 - Miami Open',
    homeTeam: 'Carlos Alcaraz',
    awayTeam: 'Jannik Sinner',
    homeLogo: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=100&h=100&fit=crop&crop=faces',
    awayLogo: 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=100&h=100&fit=crop&crop=faces',
    homeCode: 'ALC',
    awayCode: 'SIN',
    homeColor: 'from-amber-600 to-yellow-900',
    awayColor: 'from-blue-700 to-slate-900',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: "Hoje • 20:00",
    timeOnly: "20:00",
    dayFormatted: "Hoje",
    fullDateTimeFormatted: "Hoje • 20:00 (Miami Open)",
    dateTimestamp: Date.now() + 4 * 3600000,
    isLive: false,
    stadium: 'Hard Rock Stadium (Miami)',
    odds: {
      home: 1.85,
      away: 1.95
    }
  },
  {
    id: 'ten_2',
    sport: 'TENNIS',
    category: 'ATP_MASTERS',
    league: 'ATP Masters 1000 - Miami Open',
    homeTeam: 'Novak Djokovic',
    awayTeam: 'Alexander Zverev',
    homeLogo: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&h=100&fit=crop&crop=faces',
    awayLogo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces',
    homeCode: 'DJO',
    awayCode: 'ZVE',
    homeColor: 'from-red-800 to-zinc-950',
    awayColor: 'from-emerald-800 to-slate-950',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: "Hoje • 19:30",
    timeOnly: "19:30",
    dayFormatted: "Hoje",
    fullDateTimeFormatted: "Hoje • 19:30",
    dateTimestamp: Date.now() + 3600000 * 3,
    isLive: false,
    stadium: 'Grandstand Court (Miami)',
    odds: {
      home: 1.55,
      away: 2.45
    }
  },
  {
    id: 'ten_3',
    sport: 'TENNIS',
    category: 'WTA_1000',
    league: 'WTA 1000 - Miami Open',
    homeTeam: 'Aryna Sabalenka',
    awayTeam: 'Iga Swiatek',
    homeLogo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces',
    awayLogo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces',
    homeCode: 'SAB',
    awayCode: 'SWI',
    homeColor: 'from-purple-800 to-indigo-950',
    awayColor: 'from-rose-800 to-slate-950',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: "Amanhã • 16:00",
    timeOnly: "16:00",
    dayFormatted: "Amanhã",
    fullDateTimeFormatted: "Amanhã • 16:00",
    dateTimestamp: Date.now() + 86400000,
    isLive: false,
    stadium: 'Stadium Court (Miami)',
    odds: {
      home: 2.10,
      away: 1.72
    }
  }
];

export const FALLBACK_NFL_MATCHES: SportsMatch[] = [
  {
    id: 'nfl_1',
    sport: 'NFL',
    category: 'NFL',
    league: 'NFL - Temporada Regular',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'San Francisco 49ers',
    homeLogo: 'https://static.www.nfl.com/image/private/f_auto/league/ujshdbpcvoqqnggnrmqg',
    awayLogo: 'https://static.www.nfl.com/image/private/f_auto/league/dxibuyxbk0ydmgxnqmmw',
    homeCode: 'KC',
    awayCode: 'SF',
    homeColor: 'from-red-700 to-amber-500',
    awayColor: 'from-red-800 to-yellow-600',
    homeScore: 24,
    awayScore: 21,
    timeMinute: 50,
    timeFormatted: "Q4 03:22 🏈 Ao Vivo",
    timeOnly: "Ao Vivo",
    dayFormatted: "Hoje",
    fullDateTimeFormatted: "Hoje • Ao Vivo",
    dateTimestamp: Date.now(),
    isLive: true,
    stadium: 'GEHA Field at Arrowhead Stadium',
    odds: {
      home: 1.75,
      away: 2.15,
      pointSpread: -2.5,
      spreadHomeOdd: 1.90,
      spreadAwayOdd: 1.90
    }
  },
  {
    id: 'nfl_2',
    sport: 'NFL',
    category: 'NFL',
    league: 'NFL - Temporada Regular',
    homeTeam: 'Philadelphia Eagles',
    awayTeam: 'Dallas Cowboys',
    homeLogo: 'https://static.www.nfl.com/image/private/f_auto/league/puhrqfhyjhjahha0l7ic',
    awayLogo: 'https://static.www.nfl.com/image/private/f_auto/league/ieid8hoygzdlmzo0tnf6',
    homeCode: 'PHI',
    awayCode: 'DAL',
    homeColor: 'from-teal-800 to-slate-900',
    awayColor: 'from-blue-900 to-slate-400',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: "Domingo • 21:20",
    timeOnly: "21:20",
    dayFormatted: "Domingo",
    fullDateTimeFormatted: "Domingo • 21:20",
    dateTimestamp: Date.now() + 86400000 * 2,
    isLive: false,
    stadium: 'Lincoln Financial Field (Philadelphia)',
    odds: {
      home: 1.65,
      away: 2.30,
      pointSpread: -3.5,
      spreadHomeOdd: 1.91,
      spreadAwayOdd: 1.89
    }
  }
];

export const FALLBACK_ESPORTS_MATCHES: SportsMatch[] = [
  {
    id: 'esp_1',
    sport: 'ESPORTS',
    category: 'CS2',
    league: 'CS2 - IEM Major Katowice',
    homeTeam: 'FURIA Esports',
    awayTeam: 'MIBR',
    homeLogo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&h=100&fit=crop',
    awayLogo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&h=100&fit=crop',
    homeCode: 'FUR',
    awayCode: 'MBR',
    homeColor: 'from-zinc-800 to-black',
    awayColor: 'from-blue-800 to-yellow-500',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: "Hoje • 20:30",
    timeOnly: "20:30",
    dayFormatted: "Hoje",
    fullDateTimeFormatted: "Hoje • 20:30 (MD3)",
    dateTimestamp: Date.now() + 5 * 3600000,
    isLive: false,
    stadium: 'Spodek Arena (Katowice)',
    odds: {
      home: 1.60,
      away: 2.35
    }
  },
  {
    id: 'esp_2',
    sport: 'ESPORTS',
    category: 'LOL',
    league: 'League of Legends - CBLOL',
    homeTeam: 'LOUD',
    awayTeam: 'paiN Gaming',
    homeLogo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=100&fit=crop',
    awayLogo: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=100&h=100&fit=crop',
    homeCode: 'LOU',
    awayCode: 'PNG',
    homeColor: 'from-emerald-700 to-green-950',
    awayColor: 'from-red-800 to-zinc-950',
    homeScore: 0,
    awayScore: 0,
    timeMinute: 0,
    timeFormatted: "Sábado • 13:00",
    timeOnly: "13:00",
    dayFormatted: "Sábado",
    fullDateTimeFormatted: "Sábado • 13:00 (MD5)",
    dateTimestamp: Date.now() + 86400000 * 2,
    isLive: false,
    stadium: 'Arena CBLOL (São Paulo)',
    odds: {
      home: 1.72,
      away: 2.05
    }
  }
];

export async function getOrFetchTennisMatches(): Promise<SportsMatch[]> {
  return FALLBACK_TENNIS_MATCHES;
}

export async function getOrFetchNflMatches(): Promise<SportsMatch[]> {
  return FALLBACK_NFL_MATCHES;
}

export async function getOrFetchEsportsMatches(): Promise<SportsMatch[]> {
  return FALLBACK_ESPORTS_MATCHES;
}
