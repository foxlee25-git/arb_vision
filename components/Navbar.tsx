
import React from 'react';
import { View } from '../types';

interface NavbarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  lastSyncedAt?: Date;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, onViewChange, lastSyncedAt, onRefresh, isRefreshing }) => {
  const menuItems = [
    { view: View.LOBBY, label: 'Lobby', icon: 'grid_view' },
    { view: View.HISTORY, label: 'Ledger', icon: 'list_alt' },
    { view: View.PROFILE, label: 'Terminal', icon: 'monitoring' }
  ];

  return (
    <nav className="sticky top-0 z-[60] bg-background-dark/90 backdrop-blur-3xl border-b border-white/5 px-8 py-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-16">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-4 cursor-pointer group select-none" 
            onClick={() => onViewChange(View.LOBBY)}
          >
            <div className="size-11 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/30 group-hover:scale-105 transition-all shadow-[0_0_20px_rgba(13,242,89,0.1)]">
              <span className="material-symbols-outlined text-primary text-2xl font-black">radar</span>
            </div>
            <div>
              <h1 className="text-2xl font-[900] tracking-tighter uppercase italic leading-none">ArbVision</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[8px] font-black tracking-[0.4em] text-primary uppercase">Production Server</span>
              </div>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-3">
            {menuItems.map(item => (
              <button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl transition-all border ${
                  activeView === item.view 
                    ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(13,242,89,0.05)]' 
                    : 'text-slate-500 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden lg:flex flex-col items-end border-r border-white/10 pr-8">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Node Latency</p>
            <p className="text-[11px] font-black text-primary">24ms / HK-North</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Last Broadcast</p>
               <p className="text-[10px] font-black text-white">{lastSyncedAt?.toLocaleTimeString() || '--:--:--'}</p>
            </div>
            <button 
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`size-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all ${isRefreshing ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
            >
              <span className={`material-symbols-outlined text-2xl ${isRefreshing ? 'animate-spin text-primary' : ''}`}>
                sync
              </span>
            </button>
          </div>

          <div className="size-12 bg-primary text-black rounded-2xl flex items-center justify-center font-black text-sm shadow-glow cursor-pointer hover:brightness-110 transition-all">
            PRO
          </div>
        </div>
      </div>
      
      {/* 实时状态流动条 */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/5 overflow-hidden">
        <div className="h-full bg-primary/40 w-1/4 animate-[shimmer_3s_linear_infinite]" />
      </div>
    </nav>
  );
};

export default Navbar;
