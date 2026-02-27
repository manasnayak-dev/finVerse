import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateMockChartData, GLOBAL_INDICES } from '../utils/mockMarketData';
import MarketDetailModal from './MarketDetailModal';

const MarketSummaryHero = () => {
  const [heroData, setHeroData] = useState(null);
  const [indicesData, setIndicesData] = useState([]);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    setHeroData(generateMockChartData(60, 0.005, 25496.55));

    const sideData = GLOBAL_INDICES.slice(0, 5).map(idx => {
      const mock = generateMockChartData(2, idx.vol, idx.basePrice);
      return {
        ...idx,
        currentPrice: mock.currentPrice,
        changePercent: mock.changePercent,
        isPositive: mock.isPositive,
      };
    });
    setIndicesData(sideData);
  }, []);

  if (!heroData) return null;

  const isPositive = heroData.isPositive;
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const bgFillId = isPositive ? 'colorHeroGreen' : 'colorHeroRed';

  return (
    <>
      <div className="rounded-3xl border border-white/10 overflow-hidden flex flex-col lg:flex-row shadow-2xl relative"
        style={{ background: 'linear-gradient(135deg, rgba(8,14,35,0.8) 0%, rgba(15,23,42,0.9) 100%)', backdropFilter: 'blur(20px)' }}>
        {/* LEFT PANE - BIG CHART */}
        <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-white/10 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-white/10 text-white flex items-center justify-center font-bold text-lg shadow-inner">
              50
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">Nifty 50</h2>
                <span className="text-[10px] font-black tracking-widest text-slate-300 bg-white/10 border border-white/5 px-2 py-0.5 rounded-md">NIFTY</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl font-black text-white font-mono tracking-tighter drop-shadow-lg">
                  {heroData.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-slate-400 font-bold tracking-widest mt-1">INR</span>
                <span className={`text-sm font-black tracking-wider mt-1 ${isPositive ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`}>
                  {isPositive ? '+' : ''}{heroData.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={heroData.data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHeroGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHeroRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                <YAxis domain={['auto', 'auto']} hide />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={strokeColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${bgFillId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT PANE - MAJOR INDICES */}
        <div className="w-full lg:w-[350px] flex flex-col relative z-10" style={{ background: 'rgba(0,0,0,0.15)' }}>
          <div className="p-6 pb-2 border-b border-white/5">
            <h3 className="text-sm font-black text-slate-300 tracking-widest uppercase mb-2">Major indices</h3>
          </div>

          <div className="flex-1 flex flex-col justify-between p-2">
            {indicesData.map((idx, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-cyan-500/50 transition-colors shadow-inner">
                    <span className="text-[10px] font-black text-slate-300 block text-center tracking-widest">
                      {idx.symbol.substring(0, 3)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-sm text-white tracking-wide">{idx.name}</p>
                      <span className="text-[9px] text-amber-400 font-black tracking-widest bg-amber-400/10 px-1 rounded">D</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest">{idx.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white font-mono tracking-tight">
                    {idx.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-[11px] font-black tracking-wider mt-0.5 ${idx.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {idx.isPositive ? '+' : ''}{idx.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 bg-black/10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalType('indices')}
              className="w-full py-3 rounded-xl text-xs font-black tracking-widest text-cyan-400 hover:text-cyan-300 flex items-center justify-center transition-colors bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20"
            >
              SEE ALL INDICES <ChevronRight className="w-4 h-4 ml-1" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Market Detail Modal */}
      {modalType && (
        <MarketDetailModal type={modalType} onClose={() => setModalType(null)} />
      )}
    </>
  );
};

export default MarketSummaryHero;
