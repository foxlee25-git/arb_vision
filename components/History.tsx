
import React from 'react';
import { PlacedBet } from '../types';

interface HistoryProps {
  bets: PlacedBet[];
}

const History: React.FC<HistoryProps> = ({ bets }) => {
  return (
    <div className="flex flex-col h-full bg-background-dark">
      <header className="p-8 pb-4">
        <h1 className="text-3xl font-black tracking-tighter mb-1 uppercase italic">Terminal Logs</h1>
        <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">Archived Executions</p>
      </header>

      {bets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-12 text-center opacity-20">
          <div className="size-32 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-7xl">history_edu</span>
          </div>
          <h2 className="text-lg font-black uppercase tracking-widest">No Logs Found</h2>
          <p className="text-xs mt-2 font-medium">Initialize an arbitrage hedge to begin performance tracking.</p>
        </div>
      ) : (
        <div className="px-6 py-4 space-y-6">
          {bets.map((bet, i) => (
            <div key={i} className="relative group">
              <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full opacity-40 group-hover:opacity-100 transition-all" />
              <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 transition-all hover:bg-white/[0.05]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[8px] bg-white/10 text-white/60 font-black px-2 py-0.5 rounded uppercase">{bet.sport}</span>
                       <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{bet.placedAt}</span>
                    </div>
                    <h3 className="font-black text-lg text-white group-hover:text-primary transition-colors">{bet.matchName}</h3>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="bg-primary/10 text-primary text-[9px] font-black px-3 py-1 rounded-full border border-primary/20 uppercase tracking-tighter flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">check_circle</span>
                      {bet.status}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Exposure</p>
                    <p className="text-sm font-black text-white">${bet.totalStake.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">ROI captured</p>
                    <p className="text-sm font-black text-primary">+{bet.roi}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Net Gain</p>
                    <p className="text-sm font-black text-primary italic">+${bet.calculatedProfit.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
