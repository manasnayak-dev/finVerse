import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, TrendingUp, TrendingDown, Clock, Plus, X,
  PieChart, Activity, ChevronRight, AlertCircle, CheckCircle,
  RefreshCw, Calendar, DollarSign, BarChart2, Zap,
} from 'lucide-react';
import { getSIPs, createSIP, cancelSIP } from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Mock live price variation (±8% random from purchase price for realism)
const mockCurrentPrice = (purchasePrice) => {
  if (!purchasePrice) return 0;
  const change = (Math.random() - 0.46) * 0.16; // slight upward bias
  return purchasePrice * (1 + change);
};

const pct = (val, base) => base ? (((val - base) / base) * 100).toFixed(2) : '0.00';

const COLORS = ['#00d4ff', '#7c3aed', '#22c55e', '#f97316', '#f43f5e', '#a78bfa', '#eab308', '#14b8a6'];

const SIP_INTERVALS = ['Monthly', 'Weekly', 'Quarterly'];

const POPULAR_STOCKS = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK'];

// ─── MetricCard ───────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, sub, positive, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative overflow-hidden rounded-2xl p-5"
    style={{
      background: 'rgba(8,14,35,0.65)',
      border: `1px solid ${color}25`,
      boxShadow: `0 0 20px ${color}08`,
    }}
  >
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle, ${color}18, transparent 70%)`, filter: 'blur(20px)', transform: 'translate(30%, -30%)' }} />
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <div className="p-2 rounded-xl" style={{ background: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
    </div>
    <p className="text-2xl font-extrabold text-white font-mono mb-0.5">{value}</p>
    {sub && (
      <p className={`text-xs font-semibold ${positive === undefined ? 'text-slate-500' : positive ? 'text-green-400' : 'text-red-400'}`}>
        {sub}
      </p>
    )}
  </motion.div>
);

// ─── Holdings Tab ─────────────────────────────────────────────────────────────
const HoldingsTab = ({ portfolio, isDemo }) => {
  // Enrich portfolio items with mock live prices
  const [enriched, setEnriched] = useState([]);

  useEffect(() => {
    const items = (portfolio || [])
      .filter(a => (a?.symbol || a?.stockSymbol) && a?.quantity && (a?.purchasePrice || a?.averagePrice))
      .map((asset, i) => {
        const sym = asset.symbol || asset.stockSymbol;
        const price = asset.purchasePrice || asset.averagePrice;
        return {
          ...asset,
          symbol: sym,
          purchasePrice: price,
          currentPrice: mockCurrentPrice(price),
          color: COLORS[i % COLORS.length],
        };
      });
    setEnriched(items);
  }, [portfolio]);

  const totalInvested    = enriched.reduce((s, a) => s + (a.purchasePrice * a.quantity), 0);
  const totalCurrentVal  = enriched.reduce((s, a) => s + (a.currentPrice * a.quantity), 0);
  const totalPnL         = totalCurrentVal - totalInvested;
  const totalPnLPct      = pct(totalCurrentVal, totalInvested);
  const positive         = totalPnL >= 0;

  if (enriched.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)' }}>
          <Briefcase className="w-9 h-9 text-cyan-700" />
        </div>
        <h3 className="text-xl font-bold text-slate-300 mb-2">No Holdings Yet</h3>
        <p className="text-slate-500 text-sm max-w-xs">
          {isDemo ? 'Use your $100,000 demo balance to buy your first stock in the Trade Markets tab.' : 'No real holdings found.'}
        </p>
        <div className="mt-4 text-xs text-cyan-600 flex items-center gap-1 font-semibold">
          <Zap className="w-3 h-3" /> Go to Trade Markets → Buy a stock → Come back here
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Invested"  value={`$${totalInvested.toLocaleString(undefined,{maximumFractionDigits:2})}`}  icon={DollarSign}  color="#00d4ff"  delay={0.0} />
        <MetricCard label="Current Value"   value={`$${totalCurrentVal.toLocaleString(undefined,{maximumFractionDigits:2})}`} icon={BarChart2}   color="#7c3aed"  delay={0.05} />
        <MetricCard label="Total P&L"
          value={`${positive ? '+' : ''}$${Math.abs(totalPnL).toLocaleString(undefined,{maximumFractionDigits:2})}`}
          sub={`${positive ? '▲' : '▼'} ${Math.abs(totalPnLPct)}% overall`}
          positive={positive}
          icon={positive ? TrendingUp : TrendingDown}
          color={positive ? '#22c55e' : '#f43f5e'}
          delay={0.1}
        />
        <MetricCard label="Positions" value={enriched.length} sub="Active holdings" icon={PieChart} color="#f97316" delay={0.15} />
      </div>

      {/* Holdings Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(8,14,35,0.65)', border: '1px solid rgba(0,212,255,0.08)' }}>
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800/60">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Your Positions
          </h3>
          <span className="text-xs text-slate-500 font-mono">Prices update on load</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800/50">
                <th className="px-6 py-3">Asset</th>
                <th className="px-6 py-3 text-right">Qty</th>
                <th className="px-6 py-3 text-right">Avg. Buy</th>
                <th className="px-6 py-3 text-right">Current</th>
                <th className="px-6 py-3 text-right">Invested</th>
                <th className="px-6 py-3 text-right">Current Val.</th>
                <th className="px-6 py-3 text-right">P&L</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((asset, i) => {
                const invested = (asset.purchasePrice ?? 0) * (asset.quantity ?? 0);
                const curVal   = (asset.currentPrice ?? 0) * (asset.quantity ?? 0);
                const pnl      = curVal - invested;
                const pnlPct   = pct(curVal, invested);
                const isUp     = pnl >= 0;
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-slate-800/30 hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Asset */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0"
                          style={{ background: `${asset.color}18`, border: `1px solid ${asset.color}30`, color: asset.color }}>
                          {(asset.symbol || '?').substring(0, 4)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{asset.symbol}</p>
                          <p className="text-[11px] text-slate-500">Equity · NSE/NYSE</p>
                        </div>
                      </div>
                    </td>
                    {/* Qty */}
                    <td className="px-6 py-4 text-right font-mono text-slate-200 text-sm">{asset.quantity}</td>
                    {/* Avg Buy */}
                    <td className="px-6 py-4 text-right font-mono text-slate-300 text-sm">
                      ${(asset.purchasePrice ?? 0).toFixed(2)}
                    </td>
                    {/* Current */}
                    <td className="px-6 py-4 text-right font-mono text-sm font-bold"
                      style={{ color: isUp ? '#22c55e' : '#f43f5e' }}>
                      ${(asset.currentPrice ?? 0).toFixed(2)}
                    </td>
                    {/* Invested */}
                    <td className="px-6 py-4 text-right font-mono text-slate-400 text-sm">
                      ${invested.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    {/* Current Val */}
                    <td className="px-6 py-4 text-right font-mono text-white text-sm font-semibold">
                      ${curVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    {/* P&L */}
                    <td className="px-6 py-4 text-right">
                      <div className={`flex flex-col items-end ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                        <span className="font-bold text-sm font-mono">
                          {isUp ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
                        </span>
                        <span className="text-[11px] font-semibold opacity-80">
                          {isUp ? '▲' : '▼'} {Math.abs(pnlPct)}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocation Bar */}
      {enriched.length > 1 && (
        <div className="rounded-2xl p-5 space-y-3"
          style={{ background: 'rgba(8,14,35,0.65)', border: '1px solid rgba(0,212,255,0.08)' }}>
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" /> Portfolio Allocation
          </h3>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            {enriched.map((a, i) => {
              const w = totalCurrentVal ? ((a.currentPrice * a.quantity) / totalCurrentVal) * 100 : 0;
              return <div key={i} className="h-full transition-all" style={{ width: `${w}%`, background: a.color }} />;
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {enriched.map((a, i) => {
              const w = totalCurrentVal ? ((a.currentPrice * a.quantity) / totalCurrentVal) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: a.color }} />
                  <span className="font-semibold">{a.symbol}</span>
                  <span className="text-slate-600">{w.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SIP Tab ──────────────────────────────────────────────────────────────────
const SIPTab = ({ user }) => {
  const [sips, setSips]          = useState([]);
  const [loading, setLoading]    = useState(true);
  const [showForm, setShowForm]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]    = useState('');
  const [err, setErr]            = useState('');
  const [form, setForm]          = useState({ symbol: '', amount: '', dateOfMonth: '1', interval: 'Monthly' });

  useEffect(() => { fetchSIPs(); }, []);

  const fetchSIPs = async () => {
    try {
      setLoading(true);
      const data = await getSIPs();
      setSips(Array.isArray(data) ? data : []);
    } catch {
      setSips([]);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.symbol || !form.amount) { setErr('Symbol and amount are required.'); return; }
    setSubmitting(true); setErr(''); setSuccess('');
    try {
      await createSIP(form.symbol.toUpperCase(), Number(form.amount), Number(form.dateOfMonth));
      setSuccess(`SIP for ${form.symbol.toUpperCase()} started successfully! ₹${form.amount}/month`);
      setForm({ symbol: '', amount: '', dateOfMonth: '1', interval: 'Monthly' });
      setShowForm(false);
      await fetchSIPs();
    } catch (e) {
      setErr(e?.error || 'Failed to create SIP. Try again.');
    } finally { setSubmitting(false); }
  };

  const handleCancel = async (id, symbol) => {
    if (!window.confirm(`Cancel SIP for ${symbol}?`)) return;
    try {
      await cancelSIP(id);
      setSips(prev => prev.filter(s => (s._id || s.id) !== id));
      setSuccess(`SIP for ${symbol} cancelled.`);
    } catch { setErr('Failed to cancel SIP.'); }
  };

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-400" /> Systematic Investment Plans
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Set up recurring investments that execute automatically</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          onClick={() => { setShowForm(f => !f); setErr(''); setSuccess(''); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
          style={{
            background: showForm ? 'rgba(239,68,68,0.12)' : 'linear-gradient(135deg, rgba(0,212,255,0.18), rgba(124,58,237,0.18))',
            border: showForm ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(0,212,255,0.3)',
            color: showForm ? '#f87171' : '#00d4ff',
          }}
        >
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New SIP</>}
        </motion.button>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl text-green-400 text-sm"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle className="w-4 h-4 shrink-0" /> {success}
          </motion.div>
        )}
        {err && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl text-red-400 text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle className="w-4 h-4 shrink-0" /> {err}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New SIP Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleCreate} className="rounded-2xl p-6 space-y-5"
              style={{ background: 'rgba(8,14,35,0.80)', border: '1px solid rgba(124,58,237,0.25)', boxShadow: '0 0 40px rgba(124,58,237,0.06)' }}>
              <h4 className="font-bold text-slate-200 flex items-center gap-2 text-base">
                <Zap className="w-4 h-4 text-violet-400" /> Configure New SIP
              </h4>

              {/* Quick symbol buttons */}
              <div>
                <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Popular Stocks</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_STOCKS.map(s => (
                    <button key={s} type="button"
                      onClick={() => setForm(f => ({ ...f, symbol: s }))}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: form.symbol === s ? 'rgba(0,212,255,0.18)' : 'rgba(255,255,255,0.04)',
                        border: form.symbol === s ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(255,255,255,0.07)',
                        color: form.symbol === s ? '#00d4ff' : '#94a3b8',
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Symbol */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Stock Symbol *</label>
                  <input
                    type="text" placeholder="e.g. AAPL, RELIANCE"
                    value={form.symbol}
                    onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 font-mono"
                    style={{ background: 'rgba(6,10,30,0.7)', border: '1px solid rgba(0,212,255,0.15)', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'}
                    required
                  />
                </div>
                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Monthly Amount ($) *</label>
                  <input
                    type="number" placeholder="e.g. 500" min="1"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 font-mono"
                    style={{ background: 'rgba(6,10,30,0.7)', border: '1px solid rgba(0,212,255,0.15)', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'}
                    required
                  />
                </div>
                {/* Day of month */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Execution Day (1–28)</label>
                  <input
                    type="number" min="1" max="28"
                    value={form.dateOfMonth}
                    onChange={e => setForm(f => ({ ...f, dateOfMonth: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white font-mono"
                    style={{ background: 'rgba(6,10,30,0.7)', border: '1px solid rgba(0,212,255,0.15)', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'}
                  />
                  <p className="text-[11px] text-slate-600 mt-1">Day of every month to execute</p>
                </div>
                {/* Interval */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Frequency</label>
                  <div className="flex gap-2">
                    {SIP_INTERVALS.map(opt => (
                      <button key={opt} type="button"
                        onClick={() => setForm(f => ({ ...f, interval: opt }))}
                        className="flex-1 py-3 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: form.interval === opt ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                          border: form.interval === opt ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)',
                          color: form.interval === opt ? '#a78bfa' : '#64748b',
                        }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={submitting}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="w-full py-3.5 rounded-xl font-extrabold text-white flex items-center justify-center gap-2 disabled:opacity-50 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #00d4ff)', boxShadow: '0 0 30px rgba(124,58,237,0.25)' }}
              >
                {submitting ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Creating SIP…</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Start SIP — {form.interval || 'Monthly'}</>
                )}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIP List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
      ) : sips.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <Clock className="w-9 h-9 text-violet-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-300 mb-2">No Active SIPs</h3>
          <p className="text-slate-500 text-sm">Click <span className="text-violet-400 font-semibold">+ New SIP</span> above to set up your first automated investment.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {sips.map((sip, i) => {
            const id = sip._id || sip.id;
            const nextDate = sip.nextExecutionDate
              ? new Date(sip.nextExecutionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'N/A';
            return (
              <motion.div
                key={id || i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between p-5 rounded-2xl group transition-all"
                style={{ background: 'rgba(8,14,35,0.65)', border: '1px solid rgba(124,58,237,0.12)', boxShadow: '0 0 16px rgba(0,0,0,0.3)' }}
              >
                {/* Left */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
                    <TrendingUp className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-extrabold text-white text-base">{sip?.symbol || '—'}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}>
                        SIP ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      Next: <span className="text-slate-300 font-semibold">{nextDate}</span>
                      {sip.dateOfMonth && <> · Day {sip.dateOfMonth} of month</>}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-0.5">Monthly</p>
                    <p className="text-xl font-extrabold text-white font-mono">
                      ${(sip?.amount ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleCancel(id, sip?.symbol)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* SIP Info Banner */}
      <div className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)' }}>
        <Zap className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 leading-relaxed">
          <span className="text-slate-300 font-semibold">How SIPs work: </span>
          A Systematic Investment Plan (SIP) automatically invests a fixed amount at regular intervals, reducing the impact of market volatility through rupee cost averaging.
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const Holdings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('holdings');
  const isDemo    = user?.activeAccountType === 'demo';
  const portfolio = isDemo ? (user?.demoPortfolio || []) : (user?.realPortfolio || []);
  const balance   = isDemo ? (user?.demoBalance || 0) : (user?.realBalance || 0);

  const tabs = [
    { id: 'holdings', label: 'Portfolio Holdings', icon: Briefcase },
    { id: 'sip',      label: 'SIP Manager',        icon: Clock      },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="p-2.5 rounded-xl" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <Briefcase className="w-6 h-6 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px #00d4ff)' }} />
            </span>
            Investments &amp; Holdings
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-1">
            {isDemo ? '🎮 Demo Account' : '🔴 Live Account'} ·&nbsp;
            Balance: <span className="text-slate-300 font-semibold font-mono">${balance.toLocaleString()}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', color: '#4ade80' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {portfolio.length} Position{portfolio.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)', color: '#a78bfa' }}>
            <Clock className="w-3 h-3" />
            SIP Manager
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(6,10,30,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))' : 'transparent',
                border: isActive ? '1px solid rgba(0,212,255,0.25)' : '1px solid transparent',
                color: isActive ? '#e2e8f0' : '#64748b',
              }}
            >
              <Icon className="w-4 h-4" style={isActive ? { color: '#00d4ff', filter: 'drop-shadow(0 0 4px #00d4ff)' } : {}} />
              {tab.label}
              {isActive && (
                <motion.span layoutId="tabIndicator" className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ boxShadow: '0 0 12px rgba(0,212,255,0.08)' }} />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'holdings' && <HoldingsTab portfolio={portfolio} isDemo={isDemo} />}
          {activeTab === 'sip'      && <SIPTab user={user} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Holdings;
