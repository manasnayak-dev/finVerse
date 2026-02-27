import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, TrendingUp, TrendingDown, Activity, AlertCircle,
  Clock, CheckCircle, Loader2, BarChart2, Zap, Shield,
  DollarSign, RefreshCw, ChevronUp, ChevronDown, Star,
  ArrowUpRight, ArrowDownRight, Flame, Target, Wallet
} from 'lucide-react';
import { getQuote, buyStock, sellStock, createSIP } from '../services/api';
import MarketTicker from './MarketTicker';
import MainChart from './MainChart';

const QUICK_PICKS = [
  { symbol: 'AAPL', name: 'Apple', change: '+1.2%', up: true },
  { symbol: 'MSFT', name: 'Microsoft', change: '+0.8%', up: true },
  { symbol: 'TSLA', name: 'Tesla', change: '-2.1%', up: false },
  { symbol: 'GOOGL', name: 'Google', change: '+0.5%', up: true },
  { symbol: 'AMZN', name: 'Amazon', change: '+1.9%', up: true },
  { symbol: 'NFLX', name: 'Netflix', change: '-0.3%', up: false },
  { symbol: 'META', name: 'Meta', change: '+3.2%', up: true },
  { symbol: 'NVDA', name: 'NVIDIA', change: '+4.7%', up: true },
];

const PRESET_QUANTITIES = [1, 5, 10, 25, 50];

const StatBadge = ({ label, value, sub, accent, icon: Icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-slate-700/40 min-w-[160px]"
  >
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{label}</p>
      <p className="text-sm font-bold text-white font-mono">{value}</p>
      {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
    </div>
  </motion.div>
);

const Trade = ({ user, onUserUpdate }) => {
  const [symbol, setSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState(1);
  const [quote, setQuote] = useState(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [orderType, setOrderType] = useState('buy');
  const [orderMode, setOrderMode] = useState('delivery');
  const [sipAmount, setSipAmount] = useState('500');
  const [sipDate, setSipDate] = useState('5');
  const [activePickSymbol, setActivePickSymbol] = useState('AAPL');
  const [priceFlash, setPriceFlash] = useState(null); // 'up' | 'down' | null
  const prevPrice = useRef(null);
  const inputRef = useRef(null);

  const isDemo = user?.activeAccountType === 'demo';
  const currentBalance = isDemo ? (user?.demoBalance || 100000) : (user?.realBalance || 0);
  const totalCost = quote ? (quote.price * (Number(quantity) || 0)) : 0;
  const remainingBalance = Math.max(0, currentBalance - (orderType === 'buy' ? totalCost : -totalCost));
  const canAfford = orderType === 'sell' || totalCost <= currentBalance;

  useEffect(() => {
    fetchQuoteForSymbol('AAPL');
  }, []);

  const fetchQuoteForSymbol = async (sym) => {
    setIsLoadingQuote(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await getQuote(sym.toUpperCase());
      // Flash animation on price change
      if (prevPrice.current !== null) {
        setPriceFlash(data.price > prevPrice.current ? 'up' : 'down');
        setTimeout(() => setPriceFlash(null), 800);
      }
      prevPrice.current = data.price;
      setQuote(data);
      setSymbol(sym.toUpperCase());
      setActivePickSymbol(sym.toUpperCase());
    } catch (err) {
      setError(err.error || err.message || 'Could not fetch quote. Please try again.');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    fetchQuoteForSymbol(symbol);
  };

  const executeTrade = async () => {
    if (!quote || quantity <= 0) {
      setError('Please load a stock quote and enter a valid quantity first.');
      return;
    }
    setIsTransacting(true);
    setError('');
    setSuccessMsg('');
    try {
      let data;
      if (orderType === 'buy') {
        data = await buyStock(quote.symbol, Number(quantity), quote.price);
        setSuccessMsg(`Successfully BOUGHT ${quantity} share(s) of ${quote.symbol} @ $${quote.price.toFixed(2)}`);
      } else {
        data = await sellStock(quote.symbol, Number(quantity), quote.price);
        setSuccessMsg(`Successfully SOLD ${quantity} share(s) of ${quote.symbol} @ $${quote.price.toFixed(2)}`);
      }
      onUserUpdate({
        activeAccountType: data.activeAccountType,
        [isDemo ? 'demoBalance' : 'realBalance']: data.newBalance,
        [isDemo ? 'demoPortfolio' : 'realPortfolio']: data.portfolio
      });
    } catch (err) {
      setError(err.error || err.message || 'Trade failed. Please try again.');
    } finally {
      setIsTransacting(false);
    }
  };

  const handleStartSIP = async () => {
    if (!quote || !sipAmount || !sipDate) return;
    setIsTransacting(true);
    setError('');
    setSuccessMsg('');
    try {
      await createSIP(quote.symbol, sipAmount, sipDate);
      setSuccessMsg(`Monthly SIP of $${sipAmount} for ${quote.symbol} started. Runs on day ${sipDate} each month.`);
    } catch (err) {
      setError(err.error || err.message || 'Failed to start SIP');
    } finally {
      setIsTransacting(false);
    }
  };

  const accentColor = isDemo ? 'purple' : 'green';
  const accentGradient = isDemo
    ? 'from-purple-600 to-indigo-600'
    : 'from-green-600 to-emerald-600';
  const accentBg = isDemo ? 'bg-purple-500/20' : 'bg-green-500/20';
  const accentBorder = isDemo ? 'border-purple-500/30' : 'border-green-500/30';
  const accentText = isDemo ? 'text-purple-400' : 'text-green-400';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 pb-16">

      {/* ── TOP HEADER ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${accentGradient}`}>
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Trade Markets</h1>
            {!isDemo && (
              <span className="px-2.5 py-1 bg-red-500/20 text-red-400 text-[10px] font-black rounded-full border border-red-500/40 tracking-widest uppercase animate-pulse">
                ● LIVE
              </span>
            )}
            {isDemo && (
              <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-black rounded-full border border-purple-500/40 tracking-widest uppercase">
                PAPER
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm ml-13 pl-1">Real-time market data · Zero commission trading</p>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-2">
          <StatBadge
            icon={Wallet}
            label="Balance"
            value={`$${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            sub={isDemo ? 'Demo Account' : 'Live Account'}
            accent={isDemo ? 'bg-purple-600' : 'bg-green-600'}
            delay={0}
          />
          <StatBadge
            icon={Target}
            label="Selected"
            value={quote?.symbol || '—'}
            sub={quote ? `$${quote.price?.toFixed(2)}` : 'Search a stock'}
            accent="bg-blue-600"
            delay={0.05}
          />
          <StatBadge
            icon={Flame}
            label="Order Value"
            value={`$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            sub={`${quantity} share${quantity !== 1 ? 's' : ''}`}
            accent={orderType === 'buy' ? 'bg-green-600' : 'bg-red-600'}
            delay={0.1}
          />
        </div>
      </div>

      {/* ── MARKET TICKER STRIP ── */}
      <div className="rounded-xl overflow-hidden border border-slate-800/60 bg-slate-900/40">
        <MarketTicker />
      </div>

      {/* ── SEARCH + QUICK PICKS BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl border border-slate-700/50 p-4"
      >
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 min-w-[260px]">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search symbol…  e.g. AAPL, TSLA"
                className={`w-full bg-slate-900/70 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white uppercase placeholder:normal-case placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-${accentColor}-500/40 transition-all text-sm font-mono font-bold`}
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingQuote || !symbol.trim()}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r ${accentGradient} text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg`}
            >
              {isLoadingQuote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Get Quote
            </button>
          </form>

          {/* Quick Picks */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mr-1 whitespace-nowrap">Hot Picks</span>
            {QUICK_PICKS.map((pick) => (
              <button
                key={pick.symbol}
                onClick={() => fetchQuoteForSymbol(pick.symbol)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                  activePickSymbol === pick.symbol
                    ? (isDemo ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-green-500/20 border-green-500/50 text-green-300')
                    : 'bg-slate-800/50 border-slate-700/40 text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
              >
                <span>{pick.symbol}</span>
                <span className={`text-[10px] font-semibold ${pick.up ? 'text-green-400' : 'text-red-400'}`}>
                  {pick.up ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
                  {pick.change}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── MAIN 3-COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* LEFT COLUMN: Quote info + Chart */}
        <div className="xl:col-span-8 flex flex-col gap-5">

          {/* Quote Hero Card */}
          <AnimatePresence mode="wait">
            {isLoadingQuote ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-2xl border border-slate-700/50 p-6 flex items-center gap-4"
              >
                <Loader2 className={`w-8 h-8 animate-spin ${accentText}`} />
                <div>
                  <p className="text-white font-bold">Fetching live quote…</p>
                  <p className="text-slate-500 text-sm">Pulling real-time market data</p>
                </div>
              </motion.div>
            ) : quote ? (
              <motion.div
                key={`quote-${quote.symbol}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl border border-slate-700/50 overflow-hidden"
              >
                <div className="p-5 flex flex-wrap gap-6 items-center justify-between">
                  {/* Symbol + Price */}
                  <div className="flex items-end gap-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-black uppercase tracking-widest ${accentText} px-2 py-0.5 rounded ${accentBg} border ${accentBorder}`}>
                          {quote.symbol}
                        </span>
                        <span className="text-xs text-slate-500">NYSE · USD</span>
                      </div>
                      <motion.p
                        key={quote.price}
                        className={`text-5xl font-black font-mono transition-colors ${
                          priceFlash === 'up' ? 'text-green-400' :
                          priceFlash === 'down' ? 'text-red-400' :
                          'text-white'
                        }`}
                      >
                        ${quote.price.toFixed(2)}
                      </motion.p>
                    </div>
                    <div className="pb-1">
                      <div className="flex items-center gap-1.5 text-green-400 text-sm font-bold">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>+{(Math.random() * 3).toFixed(2)}%</span>
                        <span className="text-slate-500 font-normal text-xs">today</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Last updated just now</p>
                    </div>
                  </div>

                  {/* Mini Stats */}
                  <div className="flex flex-wrap gap-4 text-xs">
                    {[
                      { label: 'Open', value: `$${(quote.price * 0.995).toFixed(2)}` },
                      { label: 'High', value: `$${(quote.price * 1.012).toFixed(2)}` },
                      { label: 'Low', value: `$${(quote.price * 0.982).toFixed(2)}` },
                      { label: 'Volume', value: `${(Math.random() * 80 + 10).toFixed(1)}M` },
                      { label: 'Mkt Cap', value: `$${(quote.price * Math.random() * 1000 + 100).toFixed(0)}B` },
                      { label: 'P/E', value: `${(Math.random() * 30 + 15).toFixed(1)}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/40">
                        <p className="text-slate-500 uppercase tracking-wider text-[9px] font-bold mb-0.5">{label}</p>
                        <p className="text-white font-mono font-bold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account type bar */}
                <div className={`px-5 py-2 border-t border-slate-800 flex items-center gap-2 ${accentBg}`}>
                  <Shield className={`w-3.5 h-3.5 ${accentText}`} />
                  <span className={`text-xs font-semibold ${accentText}`}>
                    Trading on {isDemo ? 'Demo (Paper)' : 'Live'} Account · Balance: ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl border border-slate-700/50 p-8 text-center"
              >
                <BarChart2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-semibold">No quote loaded</p>
                <p className="text-slate-600 text-sm mt-1">Search for a stock symbol above to get started</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main TradingView Chart */}
          <MainChart symbol={quote?.symbol} price={quote?.price} isDemo={isDemo} />
        </div>

        {/* RIGHT COLUMN: Order Panel */}
        <div className="xl:col-span-4 flex flex-col gap-4">

          {/* ★ ORDER PANEL ★ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className={`glass rounded-2xl border-2 ${isDemo ? 'border-purple-500/30' : 'border-green-500/30'} overflow-hidden`}
          >
            {/* Panel header */}
            <div className={`px-5 py-3.5 border-b border-slate-800 bg-gradient-to-r ${accentGradient} bg-opacity-10 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-white" />
                <span className="text-white font-extrabold text-sm tracking-wide uppercase">Place Order</span>
              </div>
              {quote && (
                <button
                  onClick={() => fetchQuoteForSymbol(quote.symbol)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Refresh quote"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-white" />
                </button>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Order Mode Tabs */}
              <div className="flex rounded-xl border border-slate-700/50 overflow-hidden divide-x divide-slate-700/50 bg-slate-900/40">
                {[
                  { key: 'delivery', label: 'Delivery', icon: Shield },
                  { key: 'intraday', label: 'Intraday', icon: Zap },
                  { key: 'sip', label: 'SIP', icon: Clock },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setOrderMode(key)}
                    className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 ${
                      orderMode === key
                        ? `bg-gradient-to-r ${accentGradient} text-white`
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>

              {orderMode !== 'sip' ? (
                <>
                  {/* BUY / SELL TOGGLE */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOrderType('buy')}
                      className={`py-3 rounded-xl font-extrabold text-sm transition-all border-2 flex items-center justify-center gap-1.5 ${
                        orderType === 'buy'
                          ? 'bg-green-500 border-green-400 text-white shadow-xl shadow-green-500/30 scale-[1.02]'
                          : 'bg-transparent border-green-500/30 text-green-400 hover:border-green-500/60 hover:bg-green-500/5'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      BUY
                    </button>
                    <button
                      onClick={() => setOrderType('sell')}
                      className={`py-3 rounded-xl font-extrabold text-sm transition-all border-2 flex items-center justify-center gap-1.5 ${
                        orderType === 'sell'
                          ? 'bg-red-500 border-red-400 text-white shadow-xl shadow-red-500/30 scale-[1.02]'
                          : 'bg-transparent border-red-500/30 text-red-400 hover:border-red-500/60 hover:bg-red-500/5'
                      }`}
                    >
                      <TrendingDown className="w-4 h-4" />
                      SELL
                    </button>
                  </div>

                  {/* QUANTITY */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                      Quantity (Shares)
                    </label>
                    {/* Preset chips */}
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {PRESET_QUANTITIES.map((q) => (
                        <button
                          key={q}
                          onClick={() => setQuantity(q)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                            Number(quantity) === q
                              ? (isDemo ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-green-500/20 border-green-500/40 text-green-300')
                              : 'bg-slate-800/50 border-slate-700/40 text-slate-500 hover:text-white hover:border-slate-500'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, Number(q) - 1))}
                        className="w-10 h-10 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-lg transition-colors"
                      >−</button>
                      <input
                        type="number"
                        min="1"
                        className={`flex-1 bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-center font-mono font-black text-xl focus:outline-none focus:ring-2 focus:ring-${accentColor}-500/40 transition-all`}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      />
                      <button
                        onClick={() => setQuantity(q => Number(q) + 1)}
                        className="w-10 h-10 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-lg transition-colors"
                      >+</button>
                    </div>
                  </div>

                  {/* ORDER SUMMARY */}
                  <div className="bg-slate-900/60 rounded-xl p-4 space-y-2 text-sm border border-slate-800">
                    <div className="flex justify-between text-slate-400">
                      <span>Price per share</span>
                      <span className="text-white font-mono font-semibold">{quote ? `$${quote.price.toFixed(2)}` : '—'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Shares</span>
                      <span className="text-white font-mono font-semibold">× {quantity}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Commission</span>
                      <span className="text-green-400 font-semibold">Free</span>
                    </div>
                    <div className="border-t border-slate-700/60 pt-2 flex justify-between font-bold">
                      <span className="text-slate-300">Total {orderType === 'buy' ? 'Cost' : 'Proceeds'}</span>
                      <span className={`font-mono text-lg ${orderType === 'buy' ? 'text-orange-400' : 'text-green-400'}`}>
                        ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Affordability warning */}
                  {quote && !canAfford && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-orange-400 text-xs"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Insufficient balance. Reduce quantity or add funds.</span>
                    </motion.div>
                  )}

                  {/* EXECUTE BUTTON */}
                  <button
                    disabled={isTransacting || !quote || quantity <= 0 || !canAfford}
                    onClick={executeTrade}
                    className={`w-full py-4 rounded-xl font-black text-lg text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group ${
                      orderType === 'buy'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-xl shadow-green-500/25'
                        : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-xl shadow-red-500/25'
                    } hover:scale-[1.01] active:scale-[0.99]`}
                  >
                    {/* shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {isTransacting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
                    ) : orderType === 'buy' ? (
                      <><TrendingUp className="w-5 h-5" /> BUY {quote?.symbol || 'STOCK'}</>
                    ) : (
                      <><TrendingDown className="w-5 h-5" /> SELL {quote?.symbol || 'STOCK'}</>
                    )}
                  </button>
                </>
              ) : (
                /* ── SIP MODE ── */
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Monthly Amount ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="number"
                        min="1"
                        placeholder="500"
                        className={`w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500/40`}
                        value={sipAmount}
                        onChange={(e) => setSipAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Day of Month (1–28)</label>
                    <input
                      type="number"
                      min="1"
                      max="28"
                      className={`w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-${accentColor}-500/40`}
                      value={sipDate}
                      onChange={(e) => setSipDate(e.target.value)}
                    />
                  </div>
                  <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 text-sm text-slate-400 leading-relaxed">
                    📅 Monthly SIP of <span className="text-white font-bold">${sipAmount || '—'}</span> in{' '}
                    <span className="text-white font-bold">{quote?.symbol || '—'}</span> will auto-invest on day{' '}
                    <span className="text-white font-bold">{sipDate}</span> of each month.
                  </div>
                  <button
                    disabled={isTransacting || !quote || !sipAmount}
                    onClick={handleStartSIP}
                    className={`w-full py-4 rounded-xl font-black text-lg text-white bg-gradient-to-r ${accentGradient} shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] transition-all`}
                  >
                    {isTransacting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
                    Activate SIP
                  </button>
                </>
              )}

              {/* Status Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 5, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-start gap-2.5 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 5, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 flex items-start gap-2.5 text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{successMsg}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Balance Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-4 border border-slate-700/40"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">After This {orderType === 'sip' ? 'SIP' : orderType}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-black font-mono text-white">
                  ${remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">Estimated remaining balance</p>
              </div>
              <div className={`text-right text-xs font-bold ${canAfford ? 'text-green-400' : 'text-orange-400'}`}>
                {canAfford ? (
                  <><CheckCircle className="w-4 h-4 inline mr-1" />Sufficient funds</>
                ) : (
                  <><AlertCircle className="w-4 h-4 inline mr-1" />Insufficient</>
                )}
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${Math.min(100, (totalCost / currentBalance) * 100)}%` }}
                transition={{ type: 'spring', stiffness: 80 }}
                className={`h-full rounded-full ${totalCost / currentBalance > 0.8 ? 'bg-orange-500' : 'bg-green-500'}`}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-600">
              <span>Order: {((totalCost / currentBalance) * 100).toFixed(1)}%</span>
              <span>of balance</span>
            </div>
          </motion.div>

          {/* Market Hours Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-xl p-4 border border-slate-700/40"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">Market Info</p>
            <div className="space-y-2">
              {[
                { label: 'NYSE Hours', value: '9:30 AM – 4:00 PM ET', icon: Clock },
                { label: 'Commission', value: 'Zero Fee Trading', icon: Star },
                { label: 'Settlement', value: 'T+2 Business Days', icon: CheckCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2.5 text-xs">
                  <Icon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="text-slate-500">{label}:</span>
                  <span className="text-slate-300 font-medium ml-auto">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Trade;
