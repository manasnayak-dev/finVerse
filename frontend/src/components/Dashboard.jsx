import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, Bot, ChevronRight } from 'lucide-react';
import MarketSummaryHero from './MarketSummaryHero';
import MarketMiniCards from './MarketMiniCards';
import AccountSwitcher from './AccountSwitcher';

const Dashboard = ({ setActiveTab, user, onUserUpdate }) => {
  const isDemo = user?.activeAccountType === 'demo';
  const currentBalance = isDemo ? (user?.demoBalance || 100000) : (user?.realBalance || 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* Header Profile Summary (Dark Theme) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(8,14,35,0.8) 0%, rgba(15,23,42,0.9) 100%)', backdropFilter: 'blur(20px)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(0,212,255,0.08), transparent 50%)' }} />
        <div className="p-6 md:p-8 flex-1 relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 tracking-tight">
              Market summary <span className="text-slate-500 font-normal ml-1">›</span>
            </h1>
            <span className={`px-2.5 py-1 text-[10px] font-black rounded border tracking-widest ${isDemo ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
              {isDemo ? 'Simulation Mode' : 'Live Trading Account'}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-400">
             Active Balance: <span className="font-mono text-xl font-bold text-white ml-2 tracking-tight">${currentBalance.toLocaleString()}</span>
          </p>
        </div>
        
        {/* Account Switcher built into header right */}
        <div className="p-6 md:p-8 relative z-10 md:border-l border-t md:border-t-0 border-white/5 h-full flex items-center justify-center min-w-[300px]"
          style={{ background: 'rgba(0,0,0,0.2)' }}>
           <AccountSwitcher activeAccountType={user?.activeAccountType} onAccountSwitch={onUserUpdate} />
        </div>
      </div>

      {!isDemo && (
        <div className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-emerald-700 mb-1">Live Market Mode Active</p>
            <p>You are viewing real live market data. The simulated TradingView component and data widgets are rendering realistic market structures for display purposes only.</p>
          </div>
        </div>
      )}

      {/* NEW HERO SPLIT COMPONENT */}
      <MarketSummaryHero />

      {/* NEW MINI CARDS GRID */}
      <div className="mt-8">
         <div className="flex items-center justify-between mb-4">
           <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              Trending Markets
           </h2>
         </div>
         <MarketMiniCards />
      </div>

      {/* CALL TO ACTION ROW - with zoom-in effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 mt-8">
        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 350, damping: 18 }}
          onClick={() => setActiveTab('trade')}
          className="flex flex-col items-start p-8 rounded-3xl border border-white/10 group relative overflow-hidden transition-all shadow-xl"
          style={{ background: 'linear-gradient(180deg, rgba(8,14,35,0.8), rgba(6,10,30,0.9))', backdropFilter: 'blur(16px)' }}
        >
          <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors duration-500" />
          <div className="p-4 rounded-xl mb-4 transition-colors relative z-10 border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white shadow-[0_0_15px_rgba(0,212,255,0.1)] group-hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2 relative z-10 tracking-tight">Advanced Charts</h3>
          <p className="text-slate-400 font-medium text-left leading-relaxed relative z-10 text-sm">
            Access the full-screen Real-Time TradingView Chart and execute live market orders instantly.
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 350, damping: 18 }}
          onClick={() => setActiveTab('chat')}
          className="flex flex-col items-start p-8 rounded-3xl border border-white/10 group relative overflow-hidden transition-all shadow-xl"
          style={{ background: 'linear-gradient(180deg, rgba(8,14,35,0.8), rgba(6,10,30,0.9))', backdropFilter: 'blur(16px)' }}
        >
          <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/5 transition-colors duration-500" />
          <div className="p-4 rounded-xl mb-4 transition-colors relative z-10 border border-violet-500/20 bg-violet-500/10 text-violet-400 group-hover:bg-violet-500 group-hover:text-white shadow-[0_0_15px_rgba(124,58,237,0.1)] group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            <Bot className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2 relative z-10 tracking-tight">FinVerse AI Advisor</h3>
          <p className="text-slate-400 font-medium text-left leading-relaxed relative z-10 text-sm">
            Chat with our elite AI to analyze specific assets, generate trading strategies, and summarize news.
          </p>
        </motion.button>
      </div>

    </div>
  );
};

export default Dashboard;
