
import React, { useState, useMemo, useEffect } from 'react';
import { ArbitrageOpportunity } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface AIPick {
  selection: string;
  rating: number;
  reasoning: string;
  bookie: string;
}

interface CalculatorDetailProps {
  arb: ArbitrageOpportunity;
  onBack: () => void;
  onPlaceBet: (totalStake: number, profit: number) => void;
  onNotify: (msg: string) => void;
  defaultInvestment: number;
}

const CalculatorDetail: React.FC<CalculatorDetailProps> = ({ arb, onBack, onPlaceBet, onNotify, defaultInvestment }) => {
  const [totalInvestment, setTotalInvestment] = useState<number>(defaultInvestment);
  const [aiPicks, setAiPicks] = useState<AIPick[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [roundingMode, setRoundingMode] = useState<'exact' | 'nearest5' | 'nearest10'>('exact');

  const calculations = useMemo(() => {
    const oddsA = arb.bookmakerA.odds;
    const oddsB = arb.bookmakerB.odds;
    const invA = 1 / oddsA;
    const invB = 1 / oddsB;
    const sumInv = invA + invB;
    
    let stakeA = (totalInvestment * invA) / sumInv;
    let stakeB = (totalInvestment * invB) / sumInv;

    if (roundingMode === 'nearest5') {
      stakeA = Math.round(stakeA / 5) * 5;
      stakeB = Math.round(stakeB / 5) * 5;
    } else if (roundingMode === 'nearest10') {
      stakeA = Math.round(stakeA / 10) * 10;
      stakeB = Math.round(stakeB / 10) * 10;
    }
    
    const profit = Math.min(stakeA * oddsA, stakeB * oddsB) - (stakeA + stakeB);
    const actualRoi = (profit / (stakeA + stakeB)) * 100;
    
    return { stakeA, stakeB, returnA: stakeA * oddsA, returnB: stakeB * oddsB, profit, actualRoi, totalUsed: stakeA + stakeB };
  }, [totalInvestment, arb, roundingMode]);

  const requestAiPicks = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `分析这场对冲比赛：${arb.matchName}。运动：${arb.sport}。当前对冲ROI：${arb.roi}%。
      请平衡风险和回报，提供3-5个专家推单 pick。返回 JSON 数组，包含：selection, rating (1-5), reasoning, bookie。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                selection: { type: Type.STRING },
                rating: { type: Type.INTEGER },
                reasoning: { type: Type.STRING },
                bookie: { type: Type.STRING },
              },
              required: ['selection', 'rating', 'reasoning', 'bookie'],
            },
          },
        }
      });
      
      const parsed = JSON.parse(response.text || "[]");
      setAiPicks(parsed);
      onNotify("AI 策略已生成");
    } catch (error) {
      onNotify("AI 服务繁忙");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="pb-32 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-6 mb-12">
        <button onClick={onBack} className="size-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">{arb.matchName}</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mt-1">Operational Terminal / Level 4 Security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* 左侧：比赛信息与AI */}
        <div className="lg:col-span-7 space-y-12">
          <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
            <img src={arb.bannerUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-12 left-12 right-12">
              <div className="flex items-center gap-4 mb-4">
                 <span className="bg-primary text-black text-[10px] font-black px-4 py-1.5 rounded-xl uppercase shadow-lg shadow-primary/20">{arb.sport}</span>
                 <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">{arb.league}</span>
              </div>
              <h2 className="text-5xl font-black tracking-tighter leading-none">{arb.matchName}</h2>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
                </div>
                <div>
                   <h3 className="text-lg font-black uppercase tracking-tight">AI Expert Strategy</h3>
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Confidence-Ranked Probabilities</p>
                </div>
              </div>
              {!aiPicks && (
                <button 
                  onClick={requestAiPicks}
                  disabled={isAnalyzing}
                  className="px-8 py-3 bg-primary text-black text-[10px] font-black rounded-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em]"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Execute Analysis'}
                </button>
              )}
            </div>

            {aiPicks ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiPicks.map((pick, i) => (
                  <div key={i} className="bg-black/40 border border-white/5 rounded-3xl p-6 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full" />
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-primary font-black text-sm uppercase">{pick.selection}</p>
                        <div className="flex gap-1 mt-1">
                          {Array.from({length:5}).map((_,j) => <span key={j} className={`material-symbols-outlined text-[10px] ${j < pick.rating ? 'text-primary' : 'text-white/10'}`} style={{fontVariationSettings: "'FILL' 1"}}>star</span>)}
                        </div>
                      </div>
                      <span className="text-[8px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase">{pick.bookie}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">{pick.reasoning}</p>
                  </div>
                ))}
              </div>
            ) : isAnalyzing ? (
              <div className="py-20 flex flex-col items-center">
                 <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
                   <div className="h-full bg-primary animate-[shimmer_2s_infinite] w-1/3" />
                 </div>
                 <p className="text-[10px] text-primary/60 font-black uppercase tracking-[0.6em] animate-pulse">Running Monte Carlo Simulations</p>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl opacity-20">
                 <p className="text-xs font-black uppercase tracking-widest italic">Neural link standby. Initiate strategy scan.</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：计算器核心 */}
        <div className="lg:col-span-5 sticky top-32 space-y-8">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-[3rem] p-10 shadow-2xl">
            <div className="mb-12">
               <label className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-4 block">Stake Allocation Vector</label>
               <div className="relative group">
                 <span className="absolute left-10 top-1/2 -translate-y-1/2 text-primary/30 font-black text-5xl">$</span>
                 <input 
                   type="number"
                   className="w-full bg-black/40 border border-white/5 text-white text-7xl font-black rounded-[2rem] py-14 pl-24 pr-10 outline-none focus:border-primary/40 focus:bg-black/60 transition-all tracking-tighter"
                   value={totalInvestment}
                   onChange={e => setTotalInvestment(Number(e.target.value))}
                 />
               </div>
            </div>

            <div className="space-y-6">
              {[
                { leg: 'A', bm: arb.bookmakerA, stake: calculations.stakeA, ret: calculations.returnA },
                { leg: 'B', bm: arb.bookmakerB, stake: calculations.stakeB, ret: calculations.returnB }
              ].map((item, i) => (
                <div key={i} className="bg-black/60 border border-white/5 rounded-[2.5rem] p-8 group hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <div className="size-12 bg-white rounded-xl p-2.5">
                        <img src={item.bm.logoUrl} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-600 font-black uppercase">Leg {item.leg} - {item.bm.name}</p>
                        <p className="text-white font-black text-sm uppercase">{item.bm.selection}</p>
                      </div>
                    </div>
                    <p className="text-primary font-black text-4xl tracking-tighter">{item.bm.odds.toFixed(2)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/80 rounded-2xl p-4 border border-white/5 cursor-pointer active:scale-95 transition-all" onClick={() => {navigator.clipboard.writeText(item.stake.toFixed(2)); onNotify('Copied Stake');}}>
                      <p className="text-slate-600 text-[8px] font-black uppercase mb-1">Position Stake</p>
                      <p className="text-white font-black text-xl">${item.stake.toFixed(2)}</p>
                    </div>
                    <div className="bg-black/80 rounded-2xl p-4 border border-white/5">
                      <p className="text-slate-600 text-[8px] font-black uppercase mb-1">Gross Return</p>
                      <p className="text-white font-black text-xl">${item.ret.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <p className="text-primary font-black text-5xl tracking-tighter italic">${calculations.profit.toFixed(2)}</p>
                  <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-1 rounded-md">+{calculations.actualRoi.toFixed(2)}%</span>
                </div>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Net Market Capture</p>
              </div>
              <button 
                onClick={() => onPlaceBet(calculations.totalUsed, calculations.profit)}
                className="bg-primary text-black font-black px-12 py-6 rounded-2xl uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all shadow-glow"
              >
                Log Hedge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorDetail;
