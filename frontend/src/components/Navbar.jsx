import { motion } from 'framer-motion';
import { Activity, LayoutDashboard, MessageSquare, PieChart, Newspaper, Briefcase, Users, HelpCircle, Brain, UserCheck, Bitcoin } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, onLogout }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard'      },
    { id: 'trade',     icon: Activity,        label: 'Trade Markets'  },
    { id: 'holdings',  icon: Briefcase,        label: 'Holdings & SIP' },
    { id: 'crypto',    icon: Bitcoin,          label: 'Crypto Wallet'  },
    { id: 'predict',   icon: Brain,            label: 'AI Prediction' },
    { id: 'portfolio', icon: PieChart,         label: 'AI Analyzer'   },
    { id: 'chat',      icon: MessageSquare,    label: 'AI Advisor'    },
    { id: 'advisors',  icon: UserCheck,        label: 'Pro Advisors'  },
    { id: 'news',      icon: Newspaper,        label: 'Market News'   },
    { id: 'community', icon: Users,            label: 'Community Chat'},
    { id: 'faq',       icon: HelpCircle,       label: 'FAQ & Help'    },
  ];

  return (
    <nav
      className="w-20 lg:w-64 h-screen fixed left-0 top-0 flex flex-col items-center lg:items-start py-8 px-3 lg:px-4 z-50 transition-all duration-300 overflow-y-auto scrollbar-hide"
      style={{
        background: 'linear-gradient(180deg, rgba(4,8,24,0.98) 0%, rgba(6,10,22,0.95) 100%)',
        borderRight: '1px solid rgba(0,212,255,0.08)',
        boxShadow: '4px 0 40px rgba(0,0,0,0.7), inset -1px 0 0 rgba(0,212,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 mb-8 lg:px-2 w-full justify-center lg:justify-start flex-none">
        <div
          className="relative p-2.5 rounded-xl flex-none"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.13), rgba(124,58,237,0.13))',
            border: '1px solid rgba(0,212,255,0.3)',
            boxShadow: '0 0 20px rgba(0,212,255,0.15)',
          }}
        >
          <Activity className="text-cyan-400 w-5 h-5" style={{ filter: 'drop-shadow(0 0 6px #00d4ff)' }} />
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
            style={{ boxShadow: '0 0 6px #00d4ff' }}
          />
        </div>
        <div className="hidden lg:block">
          <h1 className="text-lg font-extrabold text-gradient tracking-tight leading-tight">FinVerse AI</h1>
          <p className="text-xs text-slate-500 font-medium">Premium Trading Platform</p>
        </div>
      </div>

      {/* Glowing separator */}
      <div className="glow-sep w-full mb-5 hidden lg:block flex-none" />

      {/* ── Nav Items ── */}
      <div className="flex flex-col gap-1.5 w-full flex-1 min-h-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl w-full justify-center lg:justify-start transition-all duration-200 group overflow-hidden ${
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200'
              }`}
              style={isActive ? {
                background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(124,58,237,0.08))',
                border: '1px solid rgba(0,212,255,0.22)',
                boxShadow: '0 0 20px rgba(0,212,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
              } : {
                background: 'transparent',
                border: '1px solid transparent',
              }}
            >
              {/* Animated active left bar */}
              {isActive && (
                <motion.span
                  layoutId="activeBar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{
                    background: 'linear-gradient(180deg, #00d4ff, #7c3aed)',
                    boxShadow: '0 0 8px #00d4ff',
                  }}
                />
              )}

              <Icon
                className={`w-5 h-5 flex-none transition-all ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                style={isActive ? { filter: 'drop-shadow(0 0 6px #00d4ff)' } : {}}
              />
              <span className={`hidden lg:block text-sm font-semibold truncate ${isActive ? 'text-white' : ''}`}>
                {item.label}
              </span>

              {/* Hover glow overlay */}
              {!isActive && (
                <span
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.06)' }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Glowing separator */}
      <div className="glow-sep w-full my-4 hidden lg:block flex-none" />

      {/* ── Logout ── */}
      <div className="w-full flex-none">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={onLogout}
          className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl w-full justify-center lg:justify-start text-red-500/70 hover:text-red-400 transition-all"
          style={{ border: '1px solid transparent' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" x2="9" y1="12" y2="12"/>
          </svg>
          <span className="hidden lg:block text-sm font-semibold">Log out</span>
        </motion.button>
      </div>
    </nav>
  );
};

export default Navbar;
