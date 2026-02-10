
import React, { useMemo } from 'react';
import { PlacedBet } from '../types';

interface ProfileProps {
  history: PlacedBet[];
  bankroll: number;
  onBankrollChange: (val: number) => void;
}

const Profile: React.FC<ProfileProps> = ({ history, bankroll, onBankrollChange }) => {
  const stats = useMemo(() => {
    const totalProfit = history.reduce((acc, curr) => acc + curr.calculatedProfit, 0);
    const totalStake = history.reduce((acc, curr) => acc + curr.totalStake, 0);
    const avgRoi = history.length > 0 ? (totalProfit / totalStake) * 100 : 0;
    
    return { totalProfit, avgRoi, totalStake };
  }, [history]);

  return (
    <div className="flex flex-col h-full bg-background-dark pb-32">
      <header className="p-10 flex flex-col items-center">
        <div className="relative group">
          <div className="size-32 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-primary/30 to-primary/10 p-1 border border-primary/20 shadow-[0_0_40px_rgba(13,242,89,0.1)] group-hover:rotate-6 transition-all duration-500">
             <div className="w-full h-full bg-[#050505] rounded-[2.2rem] flex items-center justify-center">
               <span className="material-symbols-outlined text-primary text-6xl font-black opacity-80">account_tree</span>
             </div>
          </div>
          <div className="absolute -bottom-3 -right-3 bg-primary text-black text-[10px] font-black px-4 py-1.5 rounded-2xl border-4 border-background-dark shadow-xl uppercase tracking-tighter">Elite Tier</div>
        </div>
        <h1 className="text-3xl font-black mt-8 tracking-tighter italic uppercase italic">Operator_779</h1>
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Verified Aggregator Node</p>
      </header>

      <main className="px-6 space-y-10">
        {/* Performance Grid */}
        <section className="grid grid-cols-2 gap-5">
            <div className="bg-[#0f0f0f] border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between aspect-square hover:border-primary/20 transition-all">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">savings</span>
              </div>
              <div>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Net Gain</p>
                <p className="text-2xl font-black text-white tracking-tighter">${stats.totalProfit.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-[#0f0f0f] border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between aspect-square hover:border-primary/20 transition-all">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">insights</span>
              </div>
              <div>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Avg Yield</p>
                <p className="text-2xl font-black text-white tracking-tighter">{stats.avgRoi.toFixed(2)}%</p>
              </div>
            </div>
        </section>

        {/* Global Bankroll Config */}
        <section className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16" />
           <div className="relative z-10">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Operational Bankroll</h3>
                <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-primary font-black text-4xl leading-none">$</span>
                <input 
                  type="number" 
                  value={bankroll}
                  onChange={(e) => onBankrollChange(Number(e.target.value))}
                  className="bg-transparent border-none text-white text-5xl font-black outline-none w-full p-0 tracking-tighter focus:ring-0"
                />
             </div>
             <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-4">Sets the default stake vector for the execution terminal</p>
           </div>
        </section>

        {/* System Settings */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] ml-2">Terminal Access</h3>
          {[
            { icon: 'api', label: 'API Protocols', detail: process.env.API_KEY ? 'Secure Connection' : 'Offline Mode', active: !!process.env.API_KEY },
            { icon: 'notifications_active', label: 'ROI Alerts', detail: 'Threshold: 2.5%' },
            { icon: 'encrypted', label: 'Node Encryption', detail: '256-bit AES' },
            { icon: 'power_settings_new', label: 'Shutdown Session', danger: true }
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-6 bg-[#0f0f0f] border border-white/5 rounded-[1.5rem] hover:bg-white/[0.03] transition-all group active:scale-[0.98]">
              <div className="flex items-center gap-5">
                <span className={`material-symbols-outlined text-2xl ${item.danger ? 'text-red-500' : item.active ? 'text-primary' : 'text-slate-600 group-hover:text-primary transition-colors'}`}>{item.icon}</span>
                <div className="text-left">
                  <p className={`text-sm font-black uppercase tracking-tight ${item.danger ? 'text-red-500' : 'text-white'}`}>{item.label}</p>
                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-0.5">{item.detail}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-800 text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Profile;
