import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { useState } from 'react';

// ─── Data Definitions ────────────────────────────────────────────

const CRYPTO_DATA = [
  { name: 'Bitcoin',   symbol: 'BTC/USD', price: '67,392.00', change: '-0.89', positive: false, cap: '$1.33T',  vol: '$38.2B',  icon: '₿', color: '#f97316' },
  { name: 'Ethereum',  symbol: 'ETH/USD', price: '3,512.40',  change: '+1.24', positive: true,  cap: '$422.1B', vol: '$19.8B',  icon: 'Ξ', color: '#6366f1' },
  { name: 'Solana',    symbol: 'SOL/USD', price: '182.50',    change: '+3.71', positive: true,  cap: '$85.4B',  vol: '$6.1B',   icon: '◎', color: '#14b8a6' },
  { name: 'BNB',       symbol: 'BNB/USD', price: '580.10',    change: '-0.34', positive: false, cap: '$84.2B',  vol: '$2.1B',   icon: 'B', color: '#eab308' },
  { name: 'XRP',       symbol: 'XRP/USD', price: '0.5821',    change: '-1.12', positive: false, cap: '$53.1B',  vol: '$3.8B',   icon: 'X', color: '#3b82f6' },
  { name: 'Cardano',   symbol: 'ADA/USD', price: '0.4512',    change: '+0.88', positive: true,  cap: '$16.2B',  vol: '$0.9B',   icon: 'A', color: '#22c55e' },
  { name: 'Avalanche', symbol: 'AVAX/USD',price: '36.21',     change: '+2.15', positive: true,  cap: '$15.0B',  vol: '$0.8B',   icon: 'A', color: '#ef4444' },
  { name: 'Dogecoin',  symbol: 'DOGE/USD',price: '0.1521',    change: '-0.55', positive: false, cap: '$21.8B',  vol: '$1.4B',   icon: 'Ð', color: '#a3a3a3' },
];

const FUTURES_DATA = [
  { name: 'Crude Oil',      symbol: 'CL1!',   price: '65.46',   unit: 'USD/barrel',    change: '+0.06', positive: true,  icon: '💧' },
  { name: 'Natural Gas',    symbol: 'NG1!',   price: '2.831',   unit: 'USD/million BTU',change: '-1.29', positive: false, icon: '🔥' },
  { name: 'Gold',           symbol: 'GC1!',   price: '5,216.70',unit: 'USD/troy oz',   change: '-0.18', positive: false, icon: '🪙' },
  { name: 'Silver',         symbol: 'SI1!',   price: '31.12',   unit: 'USD/troy oz',   change: '+0.43', positive: true,  icon: '🥈' },
  { name: 'Corn',           symbol: 'ZC1!',   price: '462.25',  unit: 'USX/bushel',    change: '-0.72', positive: false, icon: '🌽' },
  { name: 'Wheat',          symbol: 'ZW1!',   price: '536.75',  unit: 'USX/bushel',    change: '+1.01', positive: true,  icon: '🌾' },
  { name: 'Copper',         symbol: 'HG1!',   price: '4.1040',  unit: 'USD/lb',        change: '+0.31', positive: true,  icon: '🔶' },
  { name: 'Platinum',       symbol: 'PL1!',   price: '958.30',  unit: 'USD/troy oz',   change: '-0.85', positive: false, icon: '💎' },
];

const INDICES_DATA = [
  { name: 'Nifty 50',       symbol: 'NIFTY',    price: '25,496.55', change: '+0.42', positive: true,  region: 'India'   },
  { name: 'Sensex',         symbol: 'BSE:SENSEX',price: '83,721.18',change: '+0.38', positive: true,  region: 'India'   },
  { name: 'S&P 500',        symbol: 'SPX',      price: '5,218.40',  change: '-0.11', positive: false, region: 'USA'     },
  { name: 'Dow Jones',      symbol: 'DJI',      price: '41,326.85', change: '-0.15', positive: false, region: 'USA'     },
  { name: 'NASDAQ',         symbol: 'NDX',      price: '18,234.11', change: '+0.22', positive: true,  region: 'USA'     },
  { name: 'FTSE 100',       symbol: 'FTSE',     price: '8,114.00',  change: '+0.18', positive: true,  region: 'UK'      },
  { name: 'Nikkei 225',     symbol: 'NKY',      price: '38,892.00', change: '-0.27', positive: false, region: 'Japan'   },
  { name: 'Hang Seng',      symbol: 'HSI',      price: '19,453.10', change: '+0.64', positive: true,  region: 'HK'      },
  { name: 'DAX',            symbol: 'DAX',      price: '18,765.45', change: '+0.09', positive: true,  region: 'Germany' },
  { name: 'CAC 40',         symbol: 'CAC',      price: '7,921.30',  change: '-0.33', positive: false, region: 'France'  },
];

const ECONOMICS_DATA = [
  { name: 'India Inflation Rate', symbol: 'INIRYY', actual: '4.31%', forecast: '4.40%', prev: '5.22%', next: 'Mar 14' },
  { name: 'India Interest Rate',  symbol: 'RBIRATE',actual: '6.25%', forecast: '6.00%', prev: '6.50%', next: 'Apr 9'  },
  { name: 'India GDP Growth',     symbol: 'INGDPYY',actual: '6.40%', forecast: '6.80%', prev: '5.40%', next: 'May 30' },
  { name: 'US Inflation Rate',    symbol: 'CPIAUCSL',actual: '3.00%',forecast: '2.90%', prev: '3.10%', next: 'Mar 12' },
  { name: 'US Federal Rate',      symbol: 'FEDFUNDS',actual: '4.50%',forecast: '4.25%', prev: '4.75%', next: 'Mar 19' },
  { name: 'US Unemployment',      symbol: 'UNRATE',  actual: '4.10%',forecast: '4.00%', prev: '4.20%', next: 'Mar 7'  },
  { name: 'Eurozone CPI',         symbol: 'EUZCPI', actual: '2.30%', forecast: '2.10%', prev: '2.40%', next: 'Mar 17' },
  { name: 'China GDP Growth',     symbol: 'CNGDPYY',actual: '5.00%', forecast: '4.80%', prev: '4.90%', next: 'Apr 16' },
];

// ─── Modal Component ──────────────────────────────────────────────

const MarketDetailModal = ({ type, onClose }) => {
  const [search, setSearch] = useState('');

  const config = {
    crypto:    { title: 'All Crypto Coins',           emoji: '₿', color: '#f97316' },
    futures:   { title: 'All Futures & Commodities',  emoji: '📦', color: '#00d4ff' },
    indices:   { title: 'All Major Indices',          emoji: '📈', color: '#22c55e' },
    economics: { title: 'All Economic Indicators',    emoji: '🏦', color: '#a78bfa' },
  };

  const { title, emoji, color } = config[type] || config.indices;

  const filterFn = (item) => {
    const q = search.toLowerCase();
    return !q || item.name.toLowerCase().includes(q) || item.symbol.toLowerCase().includes(q);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal Panel */}
        <motion.div
          className="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden z-10"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            background: 'rgba(6,10,30,0.97)',
            border: `1px solid ${color}30`,
            boxShadow: `0 0 60px ${color}15, 0 20px 80px rgba(0,0,0,0.8)`,
          }}
        >
          {/* Drag pill */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-slate-600" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{emoji}</span>
              <div>
                <h2 className="text-lg font-extrabold text-white">{title}</h2>
                <p className="text-xs text-slate-500">Live simulated data · Updates every 15s</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-slate-800/40">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or symbol..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 scrollbar-hide">
            {type === 'crypto' && CRYPTO_DATA.filter(filterFn).map((coin, i) => (
              <motion.div
                key={coin.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${coin.color}20`, color: coin.color }}>
                    {coin.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{coin.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{coin.symbol}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-xs text-slate-500 hidden sm:block">
                    <p>MCap: <span className="text-slate-300 font-semibold">{coin.cap}</span></p>
                    <p>Vol: <span className="text-slate-300 font-semibold">{coin.vol}</span></p>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-sm font-bold text-white">${coin.price}</p>
                    <div className={`flex items-center justify-end gap-0.5 text-xs font-bold ${coin.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {coin.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {coin.change}%
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {type === 'futures' && FUTURES_DATA.filter(filterFn).map((fut, i) => (
              <motion.div
                key={fut.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(0,212,255,0.1)' }}>
                    {fut.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{fut.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{fut.symbol} · {fut.unit}</p>
                  </div>
                </div>
                <div className="text-right min-w-[90px]">
                  <p className="text-sm font-bold text-white">{fut.price}</p>
                  <div className={`flex items-center justify-end gap-0.5 text-xs font-bold ${fut.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {fut.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {fut.change}%
                  </div>
                </div>
              </motion.div>
            ))}

            {type === 'indices' && INDICES_DATA.filter(filterFn).map((idx, i) => (
              <motion.div
                key={idx.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold text-white" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    {idx.symbol.substring(0, 3)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{idx.name}</p>
                    <p className="text-xs text-slate-500">{idx.symbol} · <span className="text-cyan-600">{idx.region}</span></p>
                  </div>
                </div>
                <div className="text-right min-w-[90px]">
                  <p className="text-sm font-bold text-white">{idx.price}</p>
                  <div className={`flex items-center justify-end gap-0.5 text-xs font-bold ${idx.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {idx.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {idx.change}%
                  </div>
                </div>
              </motion.div>
            ))}

            {type === 'economics' && ECONOMICS_DATA.filter(filterFn).map((eco, i) => (
              <motion.div
                key={eco.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{eco.name}</p>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded text-slate-400" style={{ background: 'rgba(255,255,255,0.06)' }}>{eco.symbol}</span>
                </div>
                <div className="flex gap-6 text-xs">
                  <div><p className="text-slate-500 mb-0.5">Actual</p><p className="font-bold text-white">{eco.actual}</p></div>
                  <div><p className="text-slate-500 mb-0.5">Forecast</p><p className="font-bold text-cyan-400">{eco.forecast}</p></div>
                  <div><p className="text-slate-500 mb-0.5">Previous</p><p className="font-bold text-slate-300">{eco.prev}</p></div>
                  <div><p className="text-slate-500 mb-0.5">Next Release</p><p className="font-bold text-amber-400">{eco.next}</p></div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800/50 flex items-center justify-between">
            <p className="text-xs text-slate-600">Simulated data for educational purposes only</p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="text-sm font-bold px-4 py-2 rounded-xl transition-all"
              style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MarketDetailModal;
