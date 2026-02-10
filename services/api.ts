
import { ArbitrageOpportunity, Bookmaker } from '../types';

const BASE_URL = 'https://api.the-odds-api.com/v4/sports';

export const STORAGE_KEYS = {
  OPPORTUNITIES: 'arbvision_opportunities',
  LAST_SYNC: 'arbvision_last_sync'
};

// 优先尝试获取 Vercel 中设置的环境变量
export const ODDS_API_KEY = (process.env.VITE_ODDS_API_KEY) || '9215827bcac57a6b09049472d4810d3e';

export const SPORT_MAP: Record<string, string> = {
  'All': 'upcoming',
  'Football': 'soccer',
  'Basketball': 'basketball'
};

export interface OddsApiResponse {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: {
    key: string;
    title: string;
    last_update: string;
    markets: {
      key: string;
      outcomes: {
        name: string;
        price: number;
      }[];
    }[];
  }[];
}

const formatMatchTime = (date: Date): string => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timePart = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  if (isToday) return `Today ${timePart}`;
  if (isTomorrow) return `Tomorrow ${timePart}`;
  
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const transformOddsToArbs = (data: OddsApiResponse[]): ArbitrageOpportunity[] => {
  const arbs: ArbitrageOpportunity[] = [];
  const now = new Date();

  if (!Array.isArray(data)) return [];

  data.forEach((match) => {
    const isFootball = match.sport_key.toLowerCase().includes('soccer');
    const isBasketball = match.sport_key.toLowerCase().includes('basketball');
    if (!isFootball && !isBasketball) return;
    
    if (!match.bookmakers || match.bookmakers.length < 2) return;

    const commenceTime = new Date(match.commence_time);
    let matchStatus: 'live' | 'upcoming' | 'past' = 'upcoming';
    
    const matchEndTime = new Date(commenceTime.getTime() + 150 * 60 * 1000);
    
    if (now > matchEndTime) {
      matchStatus = 'past';
    } else if (now > commenceTime) {
      matchStatus = 'live';
    }

    const marketType = 'h2h';
    let bestHome: { price: number; bookie: string; outcome: string } | null = null;
    let bestAway: { price: number; bookie: string; outcome: string } | null = null;

    match.bookmakers.forEach((bm) => {
      const market = bm.markets.find(m => m.key === marketType);
      if (!market) return;

      market.outcomes.forEach(outcome => {
        if (outcome.name === match.home_team) {
          if (!bestHome || outcome.price > bestHome.price) 
            bestHome = { price: outcome.price, bookie: bm.title, outcome: outcome.name };
        } else if (outcome.name === match.away_team) {
          if (!bestAway || outcome.price > bestAway.price) 
            bestAway = { price: outcome.price, bookie: bm.title, outcome: outcome.name };
        }
      });
    });

    if (bestHome && bestAway) {
      const invSum = (1 / (bestHome as any).price) + (1 / (bestAway as any).price);
      const roi = ((1 / invSum) - 1) * 100;

      if (roi > -5.0) { 
        arbs.push({
          id: match.id,
          league: match.sport_title || match.sport_key.split('_').join(' ').toUpperCase(),
          time: formatMatchTime(commenceTime),
          matchName: `${match.home_team} vs ${match.away_team}`,
          marketType: 'Moneyline',
          roi: parseFloat(roi.toFixed(2)),
          updatedAt: 'Live',
          sport: isFootball ? 'Football' : 'Basketball',
          bannerUrl: `https://picsum.photos/seed/${match.id}/800/400`,
          matchStatus: matchStatus,
          bookmakerA: {
            name: (bestHome as any).bookie,
            odds: (bestHome as any).price,
            selection: (bestHome as any).outcome,
            logoUrl: `https://ui-avatars.com/api/?name=${(bestHome as any).bookie}&background=0df259&color=000`
          },
          bookmakerB: {
            name: (bestAway as any).bookie,
            odds: (bestAway as any).price,
            selection: (bestAway as any).outcome,
            logoUrl: `https://ui-avatars.com/api/?name=${(bestAway as any).bookie}&background=333&color=fff`
          }
        });
      }
    }
  });

  return arbs.sort((a, b) => {
    const statusOrder: Record<string, number> = { 'live': 0, 'upcoming': 1, 'past': 2 };
    if (statusOrder[a.matchStatus] !== statusOrder[b.matchStatus]) {
      return statusOrder[a.matchStatus] - statusOrder[b.matchStatus];
    }
    
    if (a.matchStatus === 'upcoming' && b.matchStatus === 'upcoming') {
      const timeA = new Date(a.time.replace('Today ', '').replace('Tomorrow ', '')).getTime();
      const timeB = new Date(b.time.replace('Today ', '').replace('Tomorrow ', '')).getTime();
      return timeA - timeB;
    }

    return b.roi - a.roi;
  });
};

export const fetchLiveOdds = async (apiKey: string, sportKey: string = 'upcoming') => {
  const url = `${BASE_URL}/${sportKey}/odds/?apiKey=${apiKey}&regions=us,uk,eu&markets=h2h&oddsFormat=decimal`;
  const response = await fetch(url);
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData?.message || 'API Sync failed. Please check your plan or key.');
  }
  const data = await response.json();
  return transformOddsToArbs(data);
};
