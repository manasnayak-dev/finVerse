import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, X, Bell, BellOff, Zap } from 'lucide-react';

// ─── Market Event Detector ───────────────────────────────────────────────────
// Scans a news headline for major-impact keywords and classifies the alert type
const IMPACT_RULES = [
  { pattern: /crash|collapse|default|bankrupt|war|sanctions|pandemic|recession|crisis|meltdown/i, severity: 'critical', label: 'CRITICAL RISK', color: '#ef4444', icon: AlertTriangle },
  { pattern: /rate hike|interest rate|fed decision|rbi|inflation surge|gdp miss/i, severity: 'high', label: 'MACRO EVENT', color: '#f97316', icon: Zap },
  { pattern: /earnings beat|earnings miss|acquisition|merger|ipo|quarterly results/i, severity: 'medium', label: 'CORP EVENT', color: '#eab308', icon: TrendingUp },
  { pattern: /rally|all.time high|bullish breakout|surge|bull run/i, severity: 'bullish', label: 'BULL SIGNAL', color: '#22c55e', icon: TrendingUp },
  { pattern: /sell.off|bearish|downgrade|correction|bear market|profit.taking/i, severity: 'bearish', label: 'BEAR SIGNAL', color: '#f43f5e', icon: TrendingDown },
];

export const detectMarketImpact = (headline) => {
  for (const rule of IMPACT_RULES) {
    if (rule.pattern.test(headline)) {
      return { ...rule, headline };
    }
  }
  return null;
};

// ─── Single Toast Card ────────────────────────────────────────────────────────
const AlertToast = ({ alert, onDismiss }) => {
  const Icon = alert.icon;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 7000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="relative flex items-start gap-3 p-4 rounded-2xl overflow-hidden w-80 max-w-[90vw] cursor-pointer select-none"
      style={{
        background: 'rgba(6,10,30,0.92)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alert.color}40`,
        boxShadow: `0 0 30px ${alert.color}18, 0 8px 32px rgba(0,0,0,0.6)`,
      }}
      onClick={onDismiss}
    >
      {/* Animated glow streak */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{ background: `linear-gradient(90deg, transparent, ${alert.color}22, transparent)` }}
      />

      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: alert.color }} />

      {/* Icon */}
      <div className="p-2 rounded-xl shrink-0 mt-0.5" style={{ background: `${alert.color}18` }}>
        <Icon className="w-4 h-4" style={{ color: alert.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-extrabold tracking-widest px-2 py-0.5 rounded-full" style={{ background: `${alert.color}20`, color: alert.color }}>
            {alert.label}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST
          </span>
        </div>
        <p className="text-sm text-slate-200 leading-snug font-medium line-clamp-2">{alert.headline}</p>
      </div>

      {/* Close */}
      <button onClick={(e) => { e.stopPropagation(); onDismiss(); }} className="text-slate-600 hover:text-slate-300 transition-colors shrink-0 mt-0.5">
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 rounded-b-2xl"
        style={{ background: alert.color }}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 7, ease: 'linear' }}
      />
    </motion.div>
  );
};

// ─── Global Alert Manager (renders toasts in top-right corner) ────────────────
export const MarketAlertManager = () => {
  const [toasts, setToasts] = useState([]);
  const [muted, setMuted] = useState(false);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Expose a global trigger function so NewsSentiment can fire alerts
  useEffect(() => {
    window.__fireMarketAlert = (headline) => {
      if (muted) return;
      const impact = detectMarketImpact(headline);
      if (!impact) return;

      const id = Date.now() + Math.random();
      setToasts(prev => [{ ...impact, id }, ...prev].slice(0, 5)); // max 5 stacked
    };
    return () => { delete window.__fireMarketAlert; };
  }, [muted]);

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 items-end pointer-events-none">
      {/* Mute toggle — always visible */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMuted(m => !m)}
        className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
        style={{
          background: muted ? 'rgba(100,116,139,0.15)' : 'rgba(0,212,255,0.1)',
          border: `1px solid ${muted ? 'rgba(100,116,139,0.2)' : 'rgba(0,212,255,0.25)'}`,
          color: muted ? '#64748b' : '#00d4ff',
          backdropFilter: 'blur(8px)',
        }}
      >
        {muted ? <BellOff className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
        {muted ? 'Alerts off' : 'Alerts on'}
      </motion.button>

      {/* Toast stack */}
      <div className="pointer-events-auto flex flex-col gap-2 items-end">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <AlertToast key={toast.id} alert={toast} onDismiss={() => dismiss(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MarketAlertManager;
