import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis } from 'recharts';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateMockChartData } from '../utils/mockMarketData';
import MarketDetailModal from './MarketDetailModal';

// Utility for tiny Sparklines in cards
const MiniSparkline = ({ data, color }) => (
  <div className="h-16 w-full mt-2 mb-4">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
         <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="price" 
          stroke={color} 
          strokeWidth={2}
          fillOpacity={1} 
          fill={`url(#gradient-${color})`} 
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const MarketMiniCards = () => {
  const [btcData, setBtcData] = useState([]);
  const [crudeData, setCrudeData] = useState([]);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    setBtcData(generateMockChartData(15, 0.05, 67392).data);
    setCrudeData(generateMockChartData(15, 0.02, 65.46).data);
  }, []);

  // Mock bar chart data for inflation
  const inflationData = [
    { name: 'Feb', val: 3.8 },
    { name: '', val: 3.5 },
    { name: '', val: 3.2 },
    { name: 'May', val: 2.8 },
    { name: '', val: 2.5 },
    { name: '', val: 2.4 },
    { name: 'Aug', val: 1.8 },
    { name: '', val: 1.2 },
    { name: '', val: 1.1 },
    { name: '', val: 1.6 },
    { name: '2026', val: 2.1 },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {/* CARD 1: CRYPTO DOMINANCE */}
      <div className="rounded-3xl border border-white/10 p-6 flex flex-col justify-between h-[380px] shadow-xl relative overflow-hidden group"
        style={{ background: 'linear-gradient(180deg, rgba(8,14,35,0.8), rgba(6,10,30,0.9))', backdropFilter: 'blur(16px)' }}>
        <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/5 transition-colors duration-500" />
        <div className="relative z-10">
           <div className="flex justify-between items-start">
             <span className="text-xl font-black text-rose-500 tracking-tighter drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">-22.10%</span>
           </div>
           <MiniSparkline data={btcData} color="#f43f5e" />
           <h3 className="font-extrabold text-white mb-4 tracking-wide">Bitcoin dominance</h3>
           
           <div className="flex justify-between text-xs font-bold mb-2">
              <div className="flex gap-1.5 items-center"><div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div><span className="text-slate-400 tracking-wider">Bitcoin</span></div>
              <div className="flex gap-1.5 items-center"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div><span className="text-slate-400 tracking-wider">Ethereum</span></div>
              <div className="flex gap-1.5 items-center"><div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div><span className="text-slate-400 tracking-wider">Others</span></div>
           </div>
           <div className="flex justify-between font-black text-white text-sm mb-4 tracking-tight">
              <span>58.55%</span>
              <span>10.62%</span>
              <span>30.83%</span>
           </div>
           
           {/* Progress Bar Mock */}
           <div className="w-full h-2 rounded-full overflow-hidden flex gap-1 mb-6 bg-white/5 p-px">
              <div className="bg-cyan-400 h-full w-[58%] rounded-l-full shadow-[0_0_4px_#22d3ee]"></div>
              <div className="bg-green-500 h-full w-[11%] shadow-[0_0_4px_#22c55e]"></div>
              <div className="bg-rose-500 h-full w-[31%] rounded-r-full shadow-[0_0_4px_#f43f5e]"></div>
           </div>

           {/* List Items */}
           <div className="flex justify-between items-center mb-4 p-2 rounded-xl hover:bg-white/5 transition-colors">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold shadow-inner text-lg">₿</div>
               <div>
                 <p className="text-sm font-extrabold text-white leading-tight tracking-wide">Bitcoin</p>
                 <span className="text-[10px] font-black tracking-widest text-slate-400 bg-white/5 border border-white/5 px-1.5 py-0.5 mt-0.5 inline-block rounded">BTCUSD</span>
               </div>
             </div>
             <div className="text-right">
                <p className="text-sm font-black text-white font-mono tracking-tight">67,392 <span className="text-[10px] font-bold text-slate-500 tracking-widest font-sans">USD</span></p>
                <p className="text-[11px] font-black tracking-wider text-rose-500">-0.89%</p>
             </div>
           </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setModalType('crypto')}
          className="text-xs font-black tracking-widest text-cyan-400 hover:text-cyan-300 flex items-center justify-center transition-colors bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 w-full py-3 rounded-xl relative z-10"
        >
          SEE ALL CRYPTO <ChevronRight className="w-4 h-4 ml-1" />
        </motion.button>
      </div>

      {/* CARD 2: COMMODITIES */}
      <div className="rounded-3xl border border-white/10 p-6 flex flex-col justify-between h-[380px] shadow-xl relative overflow-hidden group"
        style={{ background: 'linear-gradient(180deg, rgba(8,14,35,0.8), rgba(6,10,30,0.9))', backdropFilter: 'blur(16px)' }}>
        <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/5 transition-colors duration-500" />
        <div className="relative z-10">
           <span className="text-sm font-black text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)] tracking-wider">-0.77%</span>
           <MiniSparkline data={crudeData} color="#f43f5e" />
           
           <div className="space-y-2 mt-4">
               {/* Crude */}
              <div className="flex justify-between items-center p-2 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-white text-lg font-bold shadow-inner border border-white/10">💧</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold text-white leading-tight tracking-wide">Crude oil</p>
                      <span className="text-[8px] text-amber-500 font-black tracking-widest bg-amber-500/10 px-1 rounded border border-amber-500/20">D</span>
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 bg-white/5 border border-white/5 px-1.5 py-0.5 mt-0.5 inline-block rounded">CL1!</span>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-white font-mono tracking-tight">65.46 <span className="text-[10px] font-bold text-slate-500 tracking-widest font-sans block leading-tight">USD/bbl</span></p>
                    <p className="text-[10px] font-black tracking-wider text-green-400 mt-0.5">+0.06%</p>
                </div>
              </div>

               {/* Nat Gas */}
               <div className="flex justify-between items-center p-2 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-lg font-bold shadow-inner border border-cyan-500/20">🔥</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold text-white leading-tight tracking-wide">Natural gas</p>
                      <span className="text-[8px] text-amber-500 font-black tracking-widest bg-amber-500/10 px-1 rounded border border-amber-500/20">D</span>
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 bg-white/5 border border-white/5 px-1.5 py-0.5 mt-0.5 inline-block rounded">NG1!</span>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-white font-mono tracking-tight">2.831 <span className="text-[10px] font-bold text-slate-500 tracking-widest font-sans block leading-tight">USD/MMBtu</span></p>
                    <p className="text-[10px] font-black tracking-wider text-rose-500 mt-0.5">-1.29%</p>
                </div>
              </div>

              {/* Gold */}
              <div className="flex justify-between items-center p-2 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 text-lg font-bold shadow-inner border border-amber-500/20">🪙</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-extrabold text-white leading-tight tracking-wide">Gold</p>
                      <span className="text-[8px] text-amber-500 font-black tracking-widest bg-amber-500/10 px-1 rounded border border-amber-500/20">D</span>
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 bg-white/5 border border-white/5 px-1.5 py-0.5 mt-0.5 inline-block rounded">GC1!</span>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-white font-mono tracking-tight">5,216.7 <span className="text-[10px] font-bold text-slate-500 tracking-widest font-sans block leading-tight">USD/oz</span></p>
                    <p className="text-[10px] font-black tracking-wider text-rose-500 mt-0.5">-0.18%</p>
                </div>
              </div>
           </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setModalType('futures')}
          className="text-xs font-black tracking-widest text-cyan-400 hover:text-cyan-300 flex items-center justify-center transition-colors bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 w-full py-3 rounded-xl relative z-10"
        >
          SEE ALL FUTURES <ChevronRight className="w-4 h-4 ml-1" />
        </motion.button>
      </div>

      {/* CARD 3: ECONOMICS */}
      <div className="rounded-3xl border border-white/10 p-6 flex flex-col justify-between h-[380px] shadow-xl relative overflow-hidden group"
        style={{ background: 'linear-gradient(180deg, rgba(8,14,35,0.8), rgba(6,10,30,0.9))', backdropFilter: 'blur(16px)' }}>
        <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-colors duration-500" />
        <div className="relative z-10 w-full text-left">
           <span className="text-sm font-black text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)] tracking-wider">+0.05%</span>
           <MiniSparkline data={btcData} color="#10b981" />
           
           <div className="flex items-center gap-3 mb-4 w-full text-left">
              <h3 className="font-extrabold text-white text-sm tracking-wide text-left">India annual inflation rate</h3>
              <span className="text-[10px] font-black tracking-widest text-slate-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded">INIRYY</span>
           </div>

           <div className="h-24 w-full mb-6 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inflationData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                  <Bar dataKey="val" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {/* Y Axis Mock labels */}
              <div className="absolute right-0 top-0 bottom-6 flex flex-col justify-between items-end text-[10px] text-slate-500 font-bold bg-transparent pl-2 shadow-[-8px_0_8px_rgba(0,0,0,0.5)]">
                <span>4%</span>
                <span>2%</span>
                <span>0%</span>
              </div>
           </div>

           <h3 className="font-extrabold text-white text-sm mb-3 tracking-wide text-left">India interest rate</h3>
           <div className="flex justify-between border-b border-white/5 pb-3 mb-2 w-full">
              <div className="text-left">
                 <p className="text-[10px] font-black tracking-widest text-slate-500 mb-1 uppercase">Actual</p>
                 <p className="text-sm font-black text-white font-mono">5.25%</p>
              </div>
              <div className="text-left">
                 <p className="text-[10px] font-black tracking-widest text-slate-500 mb-1 uppercase">Forecast</p>
                 <p className="text-sm font-black text-white font-mono">-</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black tracking-widest text-slate-500 mb-1 uppercase">Next release</p>
                 <p className="text-sm font-black text-white font-mono">-</p>
              </div>
           </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setModalType('economics')}
          className="text-xs font-black tracking-widest text-cyan-400 hover:text-cyan-300 flex items-center justify-center transition-colors bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 w-full py-3 rounded-xl relative z-10"
        >
          SEE ALL INDICATORS <ChevronRight className="w-4 h-4 ml-1" />
        </motion.button>
      </div>

      </div>

      {/* Market Detail Modal */}
      {modalType && (
        <MarketDetailModal type={modalType} onClose={() => setModalType(null)} />
      )}
    </>
  );
};

export default MarketMiniCards;
