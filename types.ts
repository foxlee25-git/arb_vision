
export interface Bookmaker {
  name: string;
  odds: number;
  selection: string;
  logoUrl?: string;
  brandColor?: string;
}

export interface ArbitrageOpportunity {
  id: string;
  league: string;
  time: string;
  matchName: string;
  marketType: string;
  roi: number;
  updatedAt: string;
  bookmakerA: Bookmaker;
  bookmakerB: Bookmaker;
  sport: string;
  bannerUrl?: string;
  isFavorite?: boolean;
  matchStatus: 'live' | 'upcoming' | 'past';
}

export interface PlacedBet extends ArbitrageOpportunity {
  totalStake: number;
  placedAt: string;
  status: 'pending' | 'settled' | 'void';
  calculatedProfit: number;
}

export enum View {
  LOBBY = 'lobby',
  CALC = 'calc',
  HISTORY = 'history',
  PROFILE = 'profile'
}
