
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Lobby from './components/Lobby';
import CalculatorDetail from './components/CalculatorDetail';
import History from './components/History';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import { View, ArbitrageOpportunity, PlacedBet } from './types';
import { fetchLiveOdds, SPORT_MAP, ODDS_API_KEY, STORAGE_KEYS } from './services/api';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LOBBY);
  const [selectedArb, setSelectedArb] = useState<ArbitrageOpportunity | null>(null);
  const [history, setHistory] = useState<PlacedBet[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [activeSportFilter, setActiveSportFilter] = useState('All');
  const [bankroll, setBankroll] = useState(1000);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | undefined>(undefined);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  
  const pollingIntervalRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const persistToDatabase = (arbs: ArbitrageOpportunity[], syncDate: Date) => {
    try {
      localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(arbs));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, syncDate.toISOString());
    } catch (e) {
      console.warn('Persist error:', e);
    }
  };

  const loadFromDatabase = useCallback(() => {
    try {
      const cachedArbs = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
      const cachedSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (cachedArbs) {
        const parsedArbs = JSON.parse(cachedArbs);
        setOpportunities(parsedArbs);
        if (cachedSync) setLastSyncedAt(new Date(cachedSync));
        return parsedArbs.length > 0;
      }
    } catch (e) { console.warn('Load error:', e); }
    return false;
  }, []);

  const handleScan = useCallback(async (sportFriendlyName: string = activeSportFilter, silent: boolean = false) => {
    if (!silent) setIsScanning(true);
    setIsRefreshing(true);
    setActiveSportFilter(sportFriendlyName);
    setConnectionError(false);
    try {
      if (ODDS_API_KEY && ODDS_API_KEY.length > 10) {
        const sportKey = SPORT_MAP[sportFriendlyName] || 'upcoming';
        const freshArbs = await fetchLiveOdds(ODDS_API_KEY, sportKey);
        const now = new Date();
        setOpportunities(freshArbs);
        setLastSyncedAt(now);
        persistToDatabase(freshArbs, now);
        if (!silent) showToast(freshArbs.length > 0 ? `Synced ${freshArbs.length} signals` : 'Markets Stable', 'success');
      } else {
        setConnectionError(true);
        if (!silent) showToast('API Key Missing', 'error');
      }
    } catch (err: any) {
      setConnectionError(true);
      if (!silent) showToast('Connection Failed', 'error');
    } finally {
      setIsRefreshing(false);
      if (!silent) setTimeout(() => setIsScanning(false), 800);
    }
  }, [activeSportFilter, showToast]);

  useEffect(() => {
    const hasCache = loadFromDatabase();
    handleScan('All', hasCache);
  }, []);

  useEffect(() => {
    pollingIntervalRef.current = window.setInterval(() => {
      if (currentView === View.LOBBY && !isRefreshing) handleScan(activeSportFilter, true);
    }, 120 * 1000);
    return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); };
  }, [currentView, activeSportFilter, handleScan, isRefreshing]);

  return (
    <div className="min-h-screen bg-background-dark text-white selection:bg-primary selection:text-black relative">
      <div className="scanline" />
      
      {/* 动态背景光晕 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[200px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[180px] rounded-full" />
      </div>

      <Navbar 
        activeView={currentView} 
        onViewChange={setCurrentView} 
        lastSyncedAt={lastSyncedAt}
        onRefresh={() => handleScan(activeSportFilter)}
        isRefreshing={isRefreshing}
      />

      {isScanning && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in">
           <div className="relative size-80 mb-12">
              <div className="absolute inset-0 border border-primary/20 rounded-full animate-[ping_4s_linear_infinite]" />
              <div className="absolute inset-4 border-2 border-primary/30 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="material-symbols-outlined text-primary text-7xl font-black mb-6 animate-bounce">rocket_launch</span>
                 <p className="text-xl font-black uppercase italic tracking-[0.4em] text-primary">Initializing</p>
                 <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">Global Node Handshake</p>
              </div>
           </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[110] px-6 animate-in slide-in-from-top-4">
          <div className={`rounded-2xl px-10 py-5 flex items-center gap-4 shadow-glow border backdrop-blur-3xl ${
            toast.type === 'success' ? 'bg-primary/10 border-primary/40 text-primary' : 
            toast.type === 'error' ? 'bg-red-500/10 border-red-500/40 text-red-400' :
            'bg-white/5 border-white/10 text-white'
          }`}>
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

      <main className="relative z-10 container mx-auto px-6 lg:px-12 py-10 min-h-screen">
        <div className="max-w-[1400px] mx-auto">
          {currentView === View.LOBBY && (
            <Lobby 
              opportunities={opportunities} 
              favorites={favorites}
              isRefreshing={isRefreshing}
              onRefresh={() => handleScan(activeSportFilter)}
              onToggleFavorite={(id) => setFavorites(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
              onOpenDetail={(arb) => { setSelectedArb(arb); setCurrentView(View.CALC); }}
              activeSport={activeSportFilter}
              onSportChange={handleScan}
              lastSyncedAt={lastSyncedAt}
              connectionError={connectionError}
            />
          )}
          {currentView === View.CALC && selectedArb && (
            <CalculatorDetail 
              arb={selectedArb} 
              onBack={() => setCurrentView(View.LOBBY)} 
              onPlaceBet={(stake, profit) => {
                setHistory([{...selectedArb, totalStake: stake, calculatedProfit: profit, placedAt: new Date().toLocaleString(), status: 'pending'}, ...history]);
                showToast('Hedge Logged Successfully');
                setCurrentView(View.HISTORY);
              }}
              onNotify={(msg) => showToast(msg, 'info')}
              defaultInvestment={bankroll}
            />
          )}
          {currentView === View.HISTORY && <History bets={history} />}
          {currentView === View.PROFILE && <Profile history={history} bankroll={bankroll} onBankrollChange={setBankroll} />}
        </div>
      </main>

      <footer className="relative z-10 mt-32 border-t border-white/5 py-16 px-12 bg-black/40 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center opacity-40 hover:opacity-100 transition-opacity">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-black italic tracking-tighter uppercase">ArbVision Pro</h4>
            <p className="text-[10px] font-black uppercase tracking-widest">Decentralized Arbitrage Node v4.2.0-LTS</p>
          </div>
          <div className="flex gap-12 mt-8 md:mt-0">
             <a href="#" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">Protocol Status</a>
             <a href="#" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">Risk Disclaimer</a>
             <a href="#" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">Terminal Log</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
