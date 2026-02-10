
import React, { useState } from 'react';
import { ArbitrageOpportunity } from '../types';

interface LobbyProps {
  opportunities: ArbitrageOpportunity[];
  favorites: string[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (arb: ArbitrageOpportunity) => void;
  activeSport: string;
  onSportChange: (sport: string) => void;
  lastSyncedAt?: Date;
  connectionError?: boolean;
}

const Lobby: React.FC<LobbyProps> = ({ 
  opportunities, 
  favorites, 
  isRefreshing, 
  onRefresh, 
  onToggleFavorite, 
  onOpenDetail,
  activeSport,
  onSportChange,
  lastSyncedAt,
  connectionError
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredArbs = opportunities.filter(arb => {
    const matchesSearch = arb.matchName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          arb.league.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFav = !showFavoritesOnly || favorites.includes(arb.id);
    return matchesSearch && matchesFav;
  });

  return (
    <div className="space-y-16 py-8">
      {/* 仪表盘 Hero 部分 */}
      <section className="bg-surface/50 border border-white/5 rounded-[3rem] p-10 md:p-14 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-5 py-2 rounded-full">
               <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Monitoring: Active</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-[900] tracking-tighter leading-[0.9] uppercase italic italic">
              Market <br /> <span className="text-primary">Terminal</span>
            </h1>
            <p className="text-slate-400 max-w-lg text-sm md:text-base font-medium leading-relaxed">
              实时抓取全球 40+ 顶级博彩平台赔率，通过 ArbVision 核心算法自动识别正收益对冲空间。
            </p>
          </div>

          <div className="flex flex-wrap gap-8 items-center bg-black/40 border border-white/5 p-8 rounded-[2.5rem]">
             <div className="space-y-1">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Signals</p>
               <p className="text-4xl font-black italic">{opportunities.length}</p>
             </div>
             <div className="w-[1px] h-12 bg-white/10 hidden sm:block" />
             <div className="space-y-1">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg ROI</p>
               <p className="text-4xl font-black italic text-primary">
                 {opportunities.length > 0 
                   ? (opportunities.reduce((acc, curr) => acc + curr.roi, 0) / opportunities.length).toFixed(1)
                   : '0.0'}%
               </p>
             </div>
             <div className="w-[1px] h-12 bg-white/10 hidden sm:block" />
             <div className="space-y-1">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Health</p>
               <p className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mt-2">OPTIMAL</p>
             </div>
          </div>
        </div>

        {/* 底部过滤栏 */}
        <div className="mt-16 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 w-full md:w-auto overflow-x-auto no-scrollbar">
            {['All', 'Football', 'Basketball'].map(s => (
              <button 
                key={s}
                onClick={() => onSportChange(s)}
                className={`px-8 py-3 rounded-xl text-[11px] font-[900] uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeSport === s ? 'bg-primary text-black shadow-glow' : 'text-slate-500 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">search</span>
              <input 
                type="text"
                placeholder="Search events, leagues..."
                className="bg-black/60 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold w-full outline-none focus:border-primary/40 transition-all placeholder:text-slate-700"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`size-14 rounded-2xl flex items-center justify-center border transition-all ${
                showFavoritesOnly ? 'bg-primary border-primary text-black shadow-glow' : 'bg-white/5 border-white/10 text-slate-500 hover:border-primary/30'
              }`}
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>grade</span>
            </button>
          </div>
        </div>
      </section>

      {/* 信号列表网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {connectionError ? (
          <div className="col-span-full py-32 text-center bg-red-500/5 border border-red-500/20 rounded-[4rem] animate-in fade-in slide-in-from-bottom-8">
            <span className="material-symbols-outlined text-8xl mb-8 text-red-500 opacity-60">dns</span>
            <h3 className="text-3xl font-[900] uppercase tracking-tighter italic">无法链接到服务器</h3>
            <p className="text-slate-500 mt-4 font-bold uppercase tracking-widest">终端目前处于离线状态，请检查网络节点设置</p>
            <button onClick={onRefresh} className="mt-10 px-12 py-5 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:border-primary/30 transition-all">尝试重新握手</button>
          </div>
        ) : filteredArbs.length === 0 ? (
          <div className="col-span-full py-48 text-center opacity-40">
            <div className="relative size-32 mx-auto mb-10">
               <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full animate-spin duration-[10s]" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="material-symbols-outlined text-6xl">satellite_alt</span>
               </div>
            </div>
            <p className="text-xl font-black uppercase tracking-[0.5em] italic">Scanning Markets...</p>
          </div>
        ) : (
          filteredArbs.map(arb => (
            <div 
              key={arb.id}
              onClick={() => onOpenDetail(arb)}
              className="group relative bg-surface/50 border border-white/5 rounded-[3rem] p-9 shadow-2xl transition-all hover:border-primary/40 hover:-translate-y-2 cursor-pointer overflow-hidden backdrop-blur-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] -mr-12 -mt-12 group-hover:bg-primary/20 transition-all" />
              
              <div className="flex justify-between items-start mb-8">
                 <div className="flex flex-col gap-3">
                   <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                        arb.matchStatus === 'live' ? 'bg-red-600 border-red-400 text-white' : 'bg-primary/10 border-primary/20 text-primary'
                      }`}>
                        {arb.matchStatus === 'live' ? 'LIVE' : 'UPCOMING'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{arb.time}</span>
                   </div>
                   <div className="bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 w-fit">
                      <span className="text-primary text-sm font-black italic">{arb.roi}% ROI</span>
                   </div>
                 </div>

                 <button 
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(arb.id); }}
                  className={`size-12 rounded-2xl flex items-center justify-center border transition-all ${
                    favorites.includes(arb.id) ? 'bg-primary border-primary text-black shadow-glow' : 'bg-white/5 border-white/5 text-slate-700 hover:text-white'
                  }`}
                 >
                   <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: favorites.includes(arb.id) ? "'FILL' 1" : "'FILL' 0" }}>grade</span>
                 </button>
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-10 group-hover:text-primary transition-colors leading-[1.1] uppercase italic">
                {arb.matchName}
              </h2>

              <div className="grid grid-cols-2 gap-5 mb-10">
                {[arb.bookmakerA, arb.bookmakerB].map((bm, i) => (
                  <div key={i} className="bg-black/60 border border-white/5 rounded-[2rem] p-6 flex flex-col items-center group/leg hover:bg-black/80 transition-all">
                     <div className="size-10 bg-white rounded-xl p-2 mb-3 group-hover/leg:scale-110 transition-transform">
                       <img src={bm.logoUrl} className="w-full h-full object-contain" />
                     </div>
                     <p className="text-primary font-black text-3xl tracking-tighter">{bm.odds.toFixed(2)}</p>
                     <p className="text-[9px] text-slate-600 font-black uppercase truncate w-full text-center mt-2 tracking-tighter">{bm.selection}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-white/5">
                 <div className="flex items-center gap-3">
                    <div className="size-2 bg-primary rounded-full shadow-[0_0_10px_#0df259] animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{arb.league}</span>
                 </div>
                 <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all">
                    <span className="text-[10px] font-black uppercase italic">Terminal</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                 </div>
              </div>
            </div>
          ) || [])
        )}
      </div>
    </div>
  );
};

export default Lobby;
