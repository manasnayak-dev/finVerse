import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { GLOBAL_INDICES, generateMockChartData } from '../utils/mockMarketData';

// Live IST clock — ticks every second using Asia/Kolkata timezone
const ISTClock = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-1.5 px-4 border-l border-slate-800 h-full text-xs font-mono font-bold text-cyan-400 whitespace-nowrap">
      <Clock className="w-3 h-3" />
      <span>{time}</span>
      <span className="text-slate-600 font-normal ml-1">IST</span>
    </div>
  );
};

const MarketTicker = () => {
  const [tickerData, setTickerData] = useState([]);

  useEffect(() => {
    const generate = () => {
      const data = GLOBAL_INDICES.map(index => {
        const { isPositive, changePercent, currentPrice } = generateMockChartData(10, index.vol, index.basePrice);
        return {
          ...index,
          isPositive,
          changePercent: changePercent.toFixed(2),
          currentPrice: currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        };
      });
      setTickerData(data);
    };

    generate();
    // Refresh every 15 seconds to look alive
    const interval = setInterval(generate, 15000);
    return () => clearInterval(interval);
  }, []);

  if (tickerData.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 overflow-hidden flex items-center h-10 select-none">
      <div className="flex px-4 bg-slate-900 z-10 font-bold text-slate-400 text-xs uppercase tracking-wider h-full items-center border-r border-slate-800 whitespace-nowrap">
        Global Markets
      </div>

      <div className="flex-1 relative overflow-hidden h-full flex items-center">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 40, repeat: Infinity }}
          className="flex whitespace-nowrap"
        >
          {/* Duplicate for seamless infinite scroll */}
          {[...tickerData, ...tickerData].map((item, i) => (
            <div key={i} className="flex items-center space-x-2 px-6 border-r border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-default">
              <span className="font-semibold text-slate-300 text-sm">{item.symbol}</span>
              <div className="flex items-center space-x-1">
                {item.isPositive
                  ? <TrendingUp className="w-3 h-3 text-green-500" />
                  : <TrendingDown className="w-3 h-3 text-red-500" />
                }
                <span className={`text-sm font-medium ${item.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {item.isPositive ? '+' : ''}{item.changePercent}%
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* IST Live Clock pinned to the right */}
      <ISTClock />
    </div>
  );
};

export default MarketTicker;
