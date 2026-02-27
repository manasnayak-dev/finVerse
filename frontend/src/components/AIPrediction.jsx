import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, TrendingUp, TrendingDown, Minus, Search, Zap,
  ShieldAlert, BarChart2, Activity, ChevronRight, RefreshCw,
  AlertTriangle, Info, CheckCircle, Target, Calendar,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { analyzePrediction } from '../services/api';

// ─── Supported symbols inline (avoids an extra fetch) ─────────────────────────
const SYMBOLS = [
  { symbol: 'AAPL',     name: 'Apple Inc.',               exchange: 'NASDAQ' },
  { symbol: 'GOOGL',    name: 'Alphabet Inc.',             exchange: 'NASDAQ' },
  { symbol: 'MSFT',     name: 'Microsoft Corp.',           exchange: 'NASDAQ' },
  { symbol: 'TSLA',     name: 'Tesla Inc.',                exchange: 'NASDAQ' },
  { symbol: 'AMZN',     name: 'Amazon.com Inc.',           exchange: 'NASDAQ' },
  { symbol: 'META',     name: 'Meta Platforms Inc.',       exchange: 'NASDAQ' },
  { symbol: 'NVDA',     name: 'NVIDIA Corp.',              exchange: 'NASDAQ' },
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.',  exchange: 'NSE'    },
  { symbol: 'TCS',      name: 'Tata Consultancy Services', exchange: 'NSE'    },
  { symbol: 'INFY',     name: 'Infosys Ltd.',              exchange: 'NSE'    },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.',            exchange: 'NSE'    },
  { symbol: 'SBIN',     name: 'State Bank of India',       exchange: 'NSE'    },
];

// ─── Mini Price Sparkline (SVG) ───────────────────────────────────────────────
const Sparkline = ({ prices, color }) => {
  if (!prices || prices.length < 2) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 200, h = 50;
  const pts = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x},${y}`;
  });
  const path = `M ${pts.join(' L ')}`;
  const area = `${path} L ${w},${h} L 0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkGrad)" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── Risk Meter ───────────────────────────────────────────────────────────────
const RiskMeter = ({ score, level }) => {
  const colour =
    score >= 75 ? '#ef4444' :
    score >= 55 ? '#f97316' :
    score >= 35 ? '#eab308' :
    score >= 15 ? '#22c55e' : '#14b8a6';

  // Arc from 180° to 0° (π → 0)
  const radius = 54;
  const cx = 72, cy = 72;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;

  const arcX = (angle) => cx + radius * Math.cos(Math.PI - angle * Math.PI / 180);
  const arcY = (angle) => cy - radius * Math.sin(Math.PI - angle * Math.PI / 180);

  const sweepAngle = (score / 100) * 180;
  const endX = arcX(sweepAngle);
  const endY = arcY(sweepAngle);
  const largeArc = sweepAngle > 180 ? 1 : 0;

  return (
    <div className="flex flex-col items-center">
      <svg width="144" height="80" viewBox="0 0 144 88">
        {/* Background arc */}
        <path d="M 18,72 A 54,54 0 0,1 126,72"
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" strokeLinecap="round" />
        {/* Coloured fill arc */}
        {score > 0 && (
          <path
            d={`M 18,72 A 54,54 0 ${score > 50 ? 1 : 0},1 ${endX},${endY}`}
            fill="none" stroke={colour}
            strokeWidth="10" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 5px ${colour}60)` }}
          />
        )}
        {/* Score text */}
        <text x="72" y="80" textAnchor="middle" fill="white" fontSize="20" fontWeight="800" fontFamily="monospace">
          {score}
        </text>
        <text x="72" y="62" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">
          RISK SCORE
        </text>
      </svg>
      <span className="text-xs font-extrabold tracking-widest mt-1 px-3 py-1 rounded-full"
        style={{ background: `${colour}18`, color: colour, border: `1px solid ${colour}30` }}>
        {level.toUpperCase()}
      </span>
    </div>
  );
};

// ─── Confidence Badge ─────────────────────────────────────────────────────────
const ConfidenceBadge = ({ score, grade, explanation }) => {
  const colour =
    score >= 80 ? '#22c55e' :
    score >= 65 ? '#00d4ff' :
    score >= 50 ? '#eab308' :
    score >= 35 ? '#f97316' : '#ef4444';

  return (
    <div className="rounded-2xl p-5 space-y-3"
      style={{ background: `${colour}06`, border: `1px solid ${colour}20` }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5" style={{ color: colour }} /> Confidence
        </span>
        <span className="text-3xl font-extrabold font-mono" style={{ color: colour }}>{score}%</span>
      </div>
      {/* Bar */}
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: colour }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{explanation}</span>
        <span className="font-extrabold px-2 py-0.5 rounded" style={{ background: `${colour}18`, color: colour }}>
          Grade {grade}
        </span>
      </div>
    </div>
  );
};

// ─── Indicator Pill ───────────────────────────────────────────────────────────
const IndicatorPill = ({ label, value, signal }) => {
  const c = signal === 'bull' ? '#22c55e' : signal === 'bear' ? '#ef4444' : '#94a3b8';
  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl"
      style={{ background: `${c}08`, border: `1px solid ${c}18` }}>
      <span className="text-xs text-slate-500 font-semibold">{label}</span>
      <span className="text-xs font-extrabold font-mono" style={{ color: c }}>{value}</span>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const TECH_FEATURES = [
  { name: 'SMA Crossover', desc: 'Compares short-term vs long-term Simple Moving Averages to detect momentum shifts.' },
  { name: 'EMA Trend', desc: 'Uses Exponential Moving Averages to identify recent price direction with higher sensitivity.' },
  { name: 'RSI', desc: 'Relative Strength Index measures momentum to find overbought (>65) or oversold (<35) conditions.' },
  { name: 'MACD-lite', desc: 'Moving Average Convergence Divergence simplified to spot quick trend acceleration.' },
  { name: 'Linear Regression', desc: 'Fits a mathematical slope to the price history to find the core underlying trend line.' },
  { name: 'Sentiment NLP', desc: 'Analyzes recent news headlines using Natural Language Processing (Gemini AI) for market mood.' },
  { name: 'Risk Scoring', desc: 'Evaluates historical volatility and max drawdown to warn about high-risk assets.' },
  { name: 'Confidence Grading', desc: 'Our AI overall confidence score based on how well all these signals align together.' }
];

const AIPrediction = () => {
  const [selected, setSelected]   = useState(null);
  const [days, setDays]           = useState(10);
  const [headlines, setHeadlines] = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [activeFeature, setActiveFeature] = useState(null);
  const resultRef = useRef(null);

  const filtered = SYMBOLS.filter(s =>
    !search || s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAnalyze = async () => {
    if (!selected) { setError('Please select a stock symbol.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const headlineArr = headlines.split('\n').map(h => h.trim()).filter(Boolean);
      const data = await analyzePrediction(selected.symbol, days, headlineArr);
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setError(e?.error || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const directionConfig = {
    BULLISH: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', Icon: ArrowUpRight,  label: '🟢 BULLISH — Upward Trend Expected' },
    BEARISH: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  Icon: ArrowDownRight, label: '🔴 BEARISH — Downward Trend Expected' },
    NEUTRAL: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',Icon: Minus,          label: '⚪ NEUTRAL — Sideways / Inconclusive' },
  };

  const dir = result ? (directionConfig[result.trend.direction] || directionConfig.NEUTRAL) : null;

  return (
    <div className="space-y-6 pb-16">
      {/* ── Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 relative overflow-hidden shadow-2xl"
        style={{ 
          background: 'linear-gradient(135deg, rgba(8,14,35,0.85) 0%, rgba(15,23,42,0.95) 100%)', 
          border: '1px solid rgba(0,212,255,0.15)',
          backdropFilter: 'blur(20px)'
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 0%, rgba(124,58,237,0.15), transparent 50%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl shadow-lg shadow-cyan-500/10" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.05))', border: '1px solid rgba(0,212,255,0.3)' }}>
              <Brain className="w-7 h-7 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px #00d4ff)' }} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 tracking-tight">AI Stock Prediction</h1>
              <p className="text-sm text-slate-400 mt-1 font-medium">7–14 day probabilistic short-term outlook • <span className="text-amber-500/80">Not financial advice</span></p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 relative w-full">
            {TECH_FEATURES.map(f => (
              <motion.button
                key={f.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFeature(activeFeature === f.name ? null : f.name)}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors focus:outline-none flex items-center gap-1.5"
                style={{ 
                  background: activeFeature === f.name ? 'rgba(0,212,255,0.2)' : 'rgba(0,212,255,0.06)', 
                  border: activeFeature === f.name ? '1px solid rgba(0,212,255,0.5)' : '1px solid rgba(0,212,255,0.12)',
                  color: activeFeature === f.name ? '#fff' : '#0891b2' // cyan-600
                }}
              >
                {f.name}
              </motion.button>
            ))}
            
            {/* Inline Explanatory Tooltip/Card */}
            <AnimatePresence>
              {activeFeature && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="w-full overflow-hidden"
                >
                  <div className="p-3 rounded-xl text-xs flex items-start gap-2.5 shadow-lg"
                    style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                    <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-cyan-300 mr-2">{activeFeature}</span>
                      <span className="text-slate-200 leading-relaxed">
                        {TECH_FEATURES.find(x => x.name === activeFeature)?.desc}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── LEFT: Symbol Selector + Config ── */}
        <div className="space-y-4">
          {/* Search */}
          <div className="rounded-3xl p-5 space-y-4 shadow-xl"
            style={{ 
              background: 'linear-gradient(180deg, rgba(8,14,35,0.8), rgba(6,10,30,0.9))', 
              border: '1px solid rgba(255,255,255,0.05)',
              backdropFilter: 'blur(16px)'
            }}>
            <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2 tracking-wide">
              <Search className="w-4 h-4 text-cyan-400" /> Select Stock
            </h3>
            <div className="relative">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search symbol or company…"
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600"
                style={{ background: 'rgba(6,10,30,0.7)', border: '1px solid rgba(0,212,255,0.12)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.12)'}
              />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {filtered.map(s => (
                <motion.button
                  key={s.symbol} whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelected(s); setResult(null); setError(''); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all relative overflow-hidden shadow-sm"
                  style={{
                    background: selected?.symbol === s.symbol ? 'linear-gradient(90deg, rgba(0,212,255,0.15), rgba(0,212,255,0.05))' : 'rgba(255,255,255,0.02)',
                    border: selected?.symbol === s.symbol ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(255,255,255,0.03)',
                  }}
                >
                  {selected?.symbol === s.symbol && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_8px_#00d4ff]" />
                  )}
                  <div className="pl-1">
                    <p className="text-sm font-extrabold tracking-wide" style={{ color: selected?.symbol === s.symbol ? '#00d4ff' : '#f8fafc' }}>{s.symbol}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{s.name}</p>
                  </div>
                  <span className="text-[9px] font-black tracking-widest px-2 py-1 rounded-md"
                    style={{ background: s.exchange === 'NSE' ? 'rgba(34,197,94,0.1)' : 'rgba(0,212,255,0.1)',
                      color: s.exchange === 'NSE' ? '#4ade80' : '#00d4ff', border: `1px solid ${s.exchange === 'NSE' ? 'rgba(34,197,94,0.2)' : 'rgba(0,212,255,0.2)'}` }}>
                    {s.exchange}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Config */}
          <div className="rounded-3xl p-5 space-y-4 shadow-xl"
            style={{ 
              background: 'linear-gradient(180deg, rgba(8,14,35,0.8), rgba(6,10,30,0.9))', 
              border: '1px solid rgba(255,255,255,0.05)',
              backdropFilter: 'blur(16px)'
            }}>
            <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2 tracking-wide">
              <Calendar className="w-4 h-4 text-violet-400" /> Analysis Window
            </h3>
            {/* Days slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Historical days</span>
                <span className="font-bold text-cyan-400">{days} days</span>
              </div>
              <input type="range" min="7" max="14" value={days} onChange={e => setDays(+e.target.value)}
                className="w-full accent-cyan-400 h-1.5 rounded-full" />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>7d</span><span>14d</span>
              </div>
            </div>

            {/* Optional headlines */}
            <div>
              <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-wider">
                News Headlines (optional)
              </label>
              <textarea
                value={headlines} onChange={e => setHeadlines(e.target.value)}
                placeholder={"Fed raises rates by 25bps\nApple beats earnings expectations\n..."}
                rows={3}
                className="w-full rounded-xl px-3 py-2.5 text-xs text-slate-300 placeholder-slate-600 resize-none"
                style={{ background: 'rgba(6,10,30,0.7)', border: '1px solid rgba(0,212,255,0.1)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.35)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.1)'}
              />
              <p className="text-[10px] text-slate-600 mt-1">One headline per line — used for sentiment scoring</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-red-400 text-xs"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            onClick={handleAnalyze}
            disabled={loading || !selected}
            className="w-full py-4 rounded-2xl font-extrabold text-white flex items-center justify-center gap-3 disabled:opacity-40 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #00d4ff22, #7c3aed44)',
              border: '1px solid rgba(0,212,255,0.4)',
              boxShadow: '0 0 30px rgba(0,212,255,0.12)',
            }}
          >
            {/* Shimmer overlay */}
            {!loading && (
              <motion.div className="absolute inset-0 pointer-events-none"
                animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent)', width: '40%' }} />
            )}
            {loading ? (
              <><RefreshCw className="w-5 h-5 animate-spin" /> Running AI Analysis…</>
            ) : (
              <><Zap className="w-5 h-5 text-cyan-300" /> Analyze {selected?.symbol || 'Stock'} →</>
            )}
          </motion.button>
        </div>

        {/* ── RIGHT: Results Panel ── */}
        <div className="xl:col-span-2" ref={resultRef}>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-cyan-500/20 animate-spin"
                    style={{ borderTopColor: '#00d4ff' }} />
                  <Brain className="w-8 h-8 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-lg">Running AI Analysis</p>
                  <p className="text-slate-500 text-sm mt-1">Processing {days} days of price data + sentiment…</p>
                </div>
                <div className="space-y-2 text-xs text-slate-600 font-mono">
                  {['Fetching historical prices…', 'Computing SMA/EMA/RSI/MACD…', 'Scoring sentiment…', 'Calculating risk & confidence…', 'Generating AI summary…'].map((step, i) => (
                    <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.4 }}>
                      ✓ {step}
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            )}

            {!loading && !result && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 text-center gap-5">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
                  <Brain className="w-10 h-10 text-cyan-800" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-400 mb-1">AI Ready</h3>
                  <p className="text-slate-600 text-sm">Select a stock and click <span className="text-cyan-500 font-semibold">Analyze</span> to run the prediction engine.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left mt-2 max-w-sm">
                  {[
                    { icon: Activity, label: 'Multi-indicator trend analysis' },
                    { icon: BarChart2, label: 'Time-series price modelling' },
                    { icon: ShieldAlert, label: 'Volatility & drawdown risk' },
                    { icon: Brain, label: 'Gemini AI narrative summary' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
                      <Icon className="w-3.5 h-3.5 text-cyan-700" /> {label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {!loading && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                {/* Direction Banner */}
                <motion.div 
                  whileHover={{ y: -2, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="rounded-3xl p-6 flex items-center justify-between gap-4 overflow-hidden relative shadow-2xl"
                  style={{ background: `linear-gradient(135deg, rgba(15,23,42,0.9), rgba(8,14,35,0.95))`, border: `1px solid ${dir.color}40`, boxShadow: `0 10px 40px ${dir.color}15`, backdropFilter: 'blur(16px)' }}>
                  
                  <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at right, ${dir.color}, transparent 60%)` }} />
                  
                  <div className="relative z-10">
                    <p className="text-[11px] text-slate-400 font-bold mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" style={{ color: dir.color }} /> Prediction Direction — {result.daysAnalysed}-Day Window
                    </p>
                    <h2 className="text-3xl font-black tracking-tight" style={{ color: dir.color, textShadow: `0 0 20px ${dir.color}40` }}>{dir.label}</h2>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                        <span className="text-xs text-slate-300 font-medium">Bulls: <b className="text-green-400 ml-1">{result.trend.bullishPct}%</b></span>
                      </div>
                      <div className="bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                        <span className="text-xs text-slate-300 font-medium">Bears: <b className="text-red-400 ml-1">{result.trend.bearishPct}%</b></span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 relative z-10 bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-1">7-Day Target</p>
                    <p className="text-4xl font-black text-white font-mono tracking-tighter">${result.trend.priceRange.target7d}</p>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black tracking-wider ${result.trend.priceRange.changePercent >= 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {result.trend.priceRange.changePercent >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {Math.abs(result.trend.priceRange.changePercent)}%
                    </div>
                  </div>
                </motion.div>

                {/* Price Chart + Risk + Confidence row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Sparkline */}
                  <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="md:col-span-1 rounded-3xl p-5 shadow-xl"
                    style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.8), rgba(8,14,35,0.9))', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)' }}>
                    <p className="text-[10px] text-slate-400 font-bold mb-3 uppercase tracking-widest">{result.daysAnalysed}-Day Price History</p>
                    <Sparkline prices={result.prices} color={dir.color} />
                    <div className="flex justify-between text-xs text-slate-400 mt-4 font-medium">
                      <span>Open: <b className="text-slate-200 font-mono">${result.prices[0]}</b></span>
                      <span>Close: <b className="text-slate-200 font-mono">${result.prices[result.prices.length - 1]}</b></span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2 border-t border-white/5 pt-2">
                      <span>Support: ${result.trend.support}</span>
                      <span>Resistance: ${result.trend.resistance}</span>
                    </div>
                  </motion.div>

                  {/* Risk Meter */}
                  <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="rounded-3xl p-5 flex flex-col items-center justify-center shadow-xl relative overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.8), rgba(8,14,35,0.9))', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
                    <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-widest relative z-10 w-full text-left">Risk Assessment</p>
                    <RiskMeter score={result.risk.score} level={result.risk.level} />
                    <div className="grid grid-cols-2 gap-1.5 mt-3 w-full text-[10px] text-slate-500">
                      {Object.entries(result.risk.factors || {}).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="capitalize">{k.replace(/Score|Risk/, '')}</span>
                          <span className="text-slate-300 font-mono">{v}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Target Range */}
                  <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="rounded-3xl p-5 space-y-4 shadow-xl"
                    style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.8), rgba(8,14,35,0.9))', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)' }}>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Target className="w-3.5 h-3.5 text-cyan-400" /> Target Scenario
                    </p>
                    <div className="space-y-3">
                      {[
                        { label: 'Bull Case',    val: result.trend.priceRange.targetHigh, c: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
                        { label: 'Base Target',  val: result.trend.priceRange.target7d,   c: dir.color, bg: `${dir.color}15` },
                        { label: 'Bear Case',    val: result.trend.priceRange.targetLow,  c: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                        { label: 'Current',      val: result.trend.priceRange.current,    c: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
                      ].map(({ label, val, c, bg }) => (
                        <div key={label} className="flex justify-between items-center text-sm p-2 rounded-lg" style={{ background: bg }}>
                          <span className="text-slate-300 text-xs font-semibold">{label}</span>
                          <span className="font-black font-mono tracking-tight" style={{ color: c }}>${val}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Confidence */}
                <ConfidenceBadge
                  score={result.confidence.score}
                  grade={result.confidence.grade}
                  explanation={result.confidence.explanation}
                />

                {/* Technical Indicators */}
                <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="rounded-3xl p-6 shadow-xl"
                  style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.8), rgba(8,14,35,0.9))', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)' }}>
                  <h3 className="text-sm font-extrabold text-slate-200 mb-4 flex items-center gap-2 tracking-wide">
                    <Activity className="w-4 h-4 text-cyan-400" /> Technical Indicators
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <IndicatorPill label="SMA 5" value={result.trend.indicators.sma5}
                      signal={result.trend.indicators.sma5 > result.trend.indicators.sma10 ? 'bull' : 'bear'} />
                    <IndicatorPill label="SMA 10" value={result.trend.indicators.sma10} signal="neutral" />
                    <IndicatorPill label="EMA 7" value={result.trend.indicators.ema7}
                      signal={result.trend.priceRange.current > result.trend.indicators.ema7 ? 'bull' : 'bear'} />
                    <IndicatorPill label="RSI"
                      value={`${result.trend.indicators.rsi} ${result.trend.indicators.rsi > 65 ? '⚠️' : result.trend.indicators.rsi < 35 ? '📉' : ''}`}
                      signal={result.trend.indicators.rsi < 35 ? 'bull' : result.trend.indicators.rsi > 65 ? 'bear' : 'neutral'} />
                    <IndicatorPill label="MACD" value={result.trend.indicators.macd}
                      signal={result.trend.indicators.macd > 0 ? 'bull' : 'bear'} />
                    <IndicatorPill label="Slope" value={result.trend.indicators.linearSlope}
                      signal={result.trend.indicators.linearSlope > 0 ? 'bull' : 'bear'} />
                  </div>
                </motion.div>

                {/* Sentiment */}
                <div className="rounded-2xl p-4 flex items-center justify-between gap-4"
                  style={{ background: 'rgba(8,14,35,0.70)', border: '1px solid rgba(0,212,255,0.08)' }}>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">News Sentiment</p>
                    <p className="font-extrabold text-white">{result.sentiment.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{result.sentiment.breakdown}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold font-mono"
                      style={{ color: result.sentiment.score > 0.1 ? '#22c55e' : result.sentiment.score < -0.1 ? '#ef4444' : '#94a3b8' }}>
                      {result.sentiment.score > 0 ? '+' : ''}{result.sentiment.score.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-600">score (−1 to +1)</p>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="rounded-2xl p-5"
                  style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.18)' }}>
                  <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5" /> Gemini AI Analyst Summary
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">{result.aiSummary}</p>
                  <p className="text-[10px] text-slate-600 mt-3">Generated: {new Date(result.generatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
                </div>

                {/* Disclaimer */}
                <div className="rounded-xl p-3 flex items-start gap-2.5"
                  style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-400/70 leading-relaxed">{result.disclaimer}</p>
                </div>

                {/* Re-analyze */}
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 1.03 }}
                  onClick={handleAnalyze}
                  className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-slate-400"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <RefreshCw className="w-4 h-4" /> Re-run Analysis
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AIPrediction;
