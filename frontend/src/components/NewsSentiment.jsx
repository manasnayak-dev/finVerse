import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, TrendingUp, TrendingDown, Minus,
  AlertTriangle, Zap, Bell, ChevronDown, ChevronUp, Radio,
} from 'lucide-react';
import { getNewsSentiment } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { detectMarketImpact } from './MarketAlertManager';

// ─── Sentiment helpers ────────────────────────────────────────────
const getSentimentStyle = (sentiment) => {
  const s = (sentiment || '').toLowerCase();
  if (s.includes('positive')) return { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', icon: TrendingUp };
  if (s.includes('negative')) return { color: 'text-red-400',   bg: 'bg-red-400/10',   border: 'border-red-400/20',   icon: TrendingDown };
  return { color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: Minus };
};

// ─── Alert Feed Item ──────────────────────────────────────────────
const AlertFeedItem = ({ alert, isNew }) => {
  const Icon = alert.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-3 rounded-xl relative overflow-hidden"
      style={{
        background: `${alert.color}08`,
        border: `1px solid ${alert.color}25`,
      }}
    >
      {isNew && (
        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-ping"
          style={{ background: alert.color }} />
      )}
      <div className="p-1.5 rounded-lg shrink-0 mt-0.5" style={{ background: `${alert.color}15` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: alert.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[9px] font-extrabold tracking-widest px-1.5 py-0.5 rounded-full"
            style={{ background: `${alert.color}18`, color: alert.color }}>
            {alert.label}
          </span>
          <span className="text-[9px] text-slate-600 font-mono">{alert.time}</span>
        </div>
        <p className="text-xs text-slate-300 leading-snug line-clamp-2">{alert.headline}</p>
      </div>
    </motion.div>
  );
};

// ─── Manual Alert Tester ──────────────────────────────────────────
const AlertTester = ({ onFire }) => {
  const [headline, setHeadline] = useState('');
  const EXAMPLES = [
    'Fed announces emergency rate hike amid inflation surge',
    'Sensex crash — markets in freefall as geopolitical war escalates',
    'Apple earnings beat expectations with record quarterly results',
    'BTC rally to all-time high — bull run confirmed',
    'RIL bearish downgrade by Goldman Sachs — correction expected',
  ];

  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)' }}>
      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-cyan-400" />
        Test Alert Detector
      </h3>
      <textarea
        value={headline}
        onChange={e => setHeadline(e.target.value)}
        placeholder="Paste or type a news headline to test impact detection..."
        rows={2}
        className="w-full rounded-xl p-3 text-sm text-white placeholder-slate-500 resize-none mb-3"
        style={{ background: 'rgba(6,10,30,0.6)', border: '1px solid rgba(0,212,255,0.15)', outline: 'none' }}
        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'}
      />
      <div className="flex flex-wrap gap-2 mb-3">
        {EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => setHeadline(ex)}
            className="text-[10px] px-2 py-1 rounded-lg text-slate-400 hover:text-cyan-300 transition-colors truncate max-w-[200px]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {ex.substring(0, 40)}…
          </button>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        onClick={() => { if (headline.trim()) { onFire(headline.trim()); setHeadline(''); } }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
        style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))',
          border: '1px solid rgba(0,212,255,0.3)',
          color: '#00d4ff',
          boxShadow: '0 0 20px rgba(0,212,255,0.1)',
        }}
      >
        <Bell className="w-4 h-4" />
        Analyze &amp; Fire Alert
      </motion.button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const NewsSentiment = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const newAlertIds = useRef(new Set());

  // Scan a headline and add to local feed + fire global toast
  const fireAlert = (headline) => {
    const impact = detectMarketImpact(headline);
    if (!impact) {
      // Show a neutral info alert anyway for manual tester
      const fallback = {
        label: 'INFO',
        color: '#94a3b8',
        icon: Newspaper,
        headline,
        id: Date.now(),
        time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
      };
      setAlerts(prev => [fallback, ...prev].slice(0, 20));
      return;
    }
    const alert = {
      ...impact,
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
    };
    newAlertIds.current.add(alert.id);
    setAlerts(prev => [alert, ...prev].slice(0, 20));
    // Fire the global toast
    if (window.__fireMarketAlert) window.__fireMarketAlert(headline);
    // Clear "new" badge after 4s
    setTimeout(() => {
      newAlertIds.current.delete(alert.id);
    }, 4000);
  };

  // Scan all news items on load
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNewsSentiment();
        setNews(data);
        // Auto-detect alerts from fetched news
        setTimeout(() => {
          (data || []).forEach((item, i) => {
            setTimeout(() => fireAlert(item.headline), i * 600);
          });
        }, 800);
      } catch (err) {
        setError(err.error || 'Failed to fetch market news sentiment.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []); // eslint-disable-line

  // Simulate a streaming alert every 45 seconds (like a live news feed)
  useEffect(() => {
    const SIMULATED = [
      'Fed signals two more rate hikes amid persistent inflation surge',
      'Nifty 50 hits all-time high in massive bull run session',
      'RBI keeps rates unchanged — markets rally on dovish posture',
      'Global oil crash as OPEC announces production increase',
      'SEBI new circuit breaker rules shock Dalal Street — sell-off begins',
      'TCS quarterly earnings beat — stock surges 8% in after-hours',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      fireAlert(SIMULATED[idx % SIMULATED.length]);
      idx++;
    }, 45000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  const criticalAlerts = alerts.filter(a => ['critical', 'high'].includes(a.severity));
  const otherAlerts   = alerts.filter(a => !['critical', 'high'].includes(a.severity));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold flex items-center gap-2.5">
            <Newspaper className="text-cyan-400 w-6 h-6" />
            News Intelligence Module
          </h2>
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2.5 h-2.5 rounded-full bg-green-400"
            />
            <span className="text-sm text-slate-400 font-medium">Live Feed Active</span>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Real-time headline scanner with AI sentiment analysis and automatic major-event alert detection.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── LEFT: Alert Feed ── */}
        <div className="xl:col-span-1 space-y-4">
          {/* Alert Panel */}
          <div className="glass rounded-2xl overflow-hidden"
            style={{ border: alerts.length > 0 ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => setAlertsExpanded(e => !e)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-red-400" />
                <span className="font-bold text-slate-200 text-sm">Market Alerts</span>
                {alerts.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    {alerts.length}
                  </span>
                )}
              </div>
              {alertsExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            <AnimatePresence>
              {alertsExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2 max-h-[50vh] overflow-y-auto scrollbar-hide">
                    {alerts.length === 0 && (
                      <p className="text-xs text-slate-600 text-center py-6">
                        Scanning for market-impacting events…
                      </p>
                    )}
                    {/* Critical/High first */}
                    {criticalAlerts.length > 0 && (
                      <p className="text-[9px] font-bold text-red-400/60 tracking-widest uppercase px-1 pt-1">🚨 High Impact</p>
                    )}
                    {criticalAlerts.map(a => (
                      <AlertFeedItem key={a.id} alert={a} isNew={newAlertIds.current.has(a.id)} />
                    ))}
                    {otherAlerts.length > 0 && (
                      <p className="text-[9px] font-bold text-slate-600 tracking-widest uppercase px-1 pt-1">📌 Other Events</p>
                    )}
                    {otherAlerts.map(a => (
                      <AlertFeedItem key={a.id} alert={a} isNew={newAlertIds.current.has(a.id)} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Alert Tester */}
          <AlertTester onFire={fireAlert} />
        </div>

        {/* ── RIGHT: News Cards ── */}
        <div className="xl:col-span-2">
          {isLoading && (
            <div className="flex justify-center items-center h-64 glass rounded-2xl">
              <LoadingSpinner size="lg" />
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-4">
              {error}
            </div>
          )}
          {!isLoading && !error && (!news || news.length === 0) && (
            <p className="text-slate-500 text-center py-10">No recent market news found.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news && news.length > 0 && news.map((item, idx) => {
              const style = getSentimentStyle(item.sentiment);
              const Icon = style.icon;
              const impact = detectMarketImpact(item.headline);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  key={idx}
                  className={`border ${style.border} bg-slate-900/40 rounded-xl p-5 hover:bg-slate-800/60 transition-colors group relative overflow-hidden`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${style.bg} rounded-full blur-3xl -mr-16 -mt-16 opacity-50`} />

                  {/* Impact badge if detected */}
                  {impact && (
                    <div className="flex items-center gap-1.5 mb-2 relative z-10">
                      <AlertTriangle className="w-3 h-3" style={{ color: impact.color }} />
                      <span className="text-[9px] font-extrabold tracking-widest px-1.5 py-0.5 rounded-full"
                        style={{ background: `${impact.color}18`, color: impact.color }}>
                        {impact.label}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <h3 className="font-medium text-slate-200 leading-snug group-hover:text-white transition-colors">{item.headline}</h3>
                    <Icon className={`w-6 h-6 shrink-0 ${style.color}`} />
                  </div>

                  <div className="mt-5 flex items-center justify-between relative z-10">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.color} border ${style.border}`}>
                      {item.sentiment}
                    </div>
                    {item.confidence && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <span className={`block h-full ${style.bg.replace('/10', '')}`} style={{ width: `${item.confidence * 100}%` }} />
                        </span>
                        {(item.confidence * 100).toFixed(0)}% Conf.
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsSentiment;
