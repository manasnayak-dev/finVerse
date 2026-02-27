import { motion } from 'framer-motion';
import { RefreshCw, Play, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { switchAccount } from '../services/api';

const AccountSwitcher = ({ activeAccountType, onAccountSwitch }) => {
  const [isSwitching, setIsSwitching] = useState(false);

  const handleToggle = async (type) => {
    if (type === activeAccountType || isSwitching) return;
    
    setIsSwitching(true);
    try {
      const data = await switchAccount(type);
      onAccountSwitch(data);
    } catch (error) {
      console.error(error);
      alert(error.message || 'Failed to switch accounts');
    } finally {
      setIsSwitching(false);
    }
  };

  const isDemo = activeAccountType === 'demo';

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-800/40 p-2 rounded-2xl border border-slate-700/50 w-full md:w-auto mt-4 md:mt-0">
      
      <div className="flex items-center gap-2 px-3">
        <span className={`text-sm font-bold flex items-center gap-2 ${isDemo ? 'text-purple-400' : 'text-green-400'}`}>
          {isDemo ? <Play className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
          {isDemo ? 'Demo Mode' : 'Real Mode'}
        </span>
      </div>

      <div className="flex bg-slate-900/50 rounded-xl p-1 relative overflow-hidden self-stretch sm:self-auto w-full sm:w-auto">
        {/* Animated Background Highlight */}
        <motion.div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg pointer-events-none ${
            isDemo ? 'bg-purple-600/20 border border-purple-500/30' : 'bg-green-600/20 border border-green-500/30'
          }`}
          initial={false}
          animate={{
            x: isDemo ? 0 : '100%',
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        <button
          onClick={() => handleToggle('demo')}
          disabled={isSwitching}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors z-10 ${
            isDemo ? 'text-purple-300' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isSwitching && !isDemo ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
          Use Demo Account
        </button>

        <button
          onClick={() => handleToggle('real')}
          disabled={isSwitching}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors z-10 ${
            !isDemo ? 'text-green-300' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isSwitching && isDemo ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
          Use Real Account
        </button>
      </div>

    </div>
  );
};

export default AccountSwitcher;
