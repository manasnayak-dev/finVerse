import { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { GLOBAL_INDICES, generateMockChartData } from '../utils/mockMarketData';

const SidebarItem = ({ item }) => {
  const [data, setData] = useState(generateMockChartData(15, item.vol, item.basePrice));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockChartData(15, item.vol, item.basePrice));
    }, 15000);
    return () => clearInterval(interval);
  }, [item]);

  const color = data.isPositive ? '#10b981' : '#ef4444'; // green-500 or red-500
  const bgFill = data.isPositive ? 'url(#colorGreen)' : 'url(#colorRed)';

  return (
    <div className="p-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-white font-bold">{item.symbol}</h3>
          <p className="text-xs text-slate-500 uppercase">{item.name}</p>
        </div>
        <div className="text-right">
          <p className="text-white font-mono font-bold">
            {data.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className={`flex items-center justify-end text-xs font-semibold ${data.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {data.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {data.isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
          </div>
        </div>
      </div>
      
      <div className="h-12 w-full flex items-center gap-2">
        <div className="flex-1 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.data}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={bgFill} 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <button className="w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 group-hover:border-slate-400 group-hover:text-white transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const GlobalMarketsSidebar = () => {
  return (
    <div className="w-full lg:w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col h-[calc(100vh-4rem-2.5rem)] overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-white font-bold tracking-wide">Global Market</h2>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {GLOBAL_INDICES.map((item, idx) => (
          <SidebarItem key={idx} item={item} />
        ))}
      </div>
    </div>
  );
};

export default GlobalMarketsSidebar;
