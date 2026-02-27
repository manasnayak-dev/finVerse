import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import PortfolioAnalyzer from './components/PortfolioAnalyzer';
import NewsSentiment from './components/NewsSentiment';
import Trade from './components/Trade';
import Holdings from './components/Holdings';
import CommunityChat from './components/CommunityChat';
import FAQ from './components/FAQ';
import Auth from './components/Auth';
import LoadingSpinner from './components/LoadingSpinner';
import MarketAlertManager from './components/MarketAlertManager';
import AIPrediction from './components/AIPrediction';
import Advisors from './components/Advisors';
import CryptoWallet from './components/CryptoWallet';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile, logoutUser } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('finverse_token');
        if (token) {
          const profile = await getProfile();
          setUser(profile);
        }
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('finverse_token');
      } finally {
        setIsInitializing(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('finverse_token', userData.token);
    setUser(userData);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const handleUserUpdate = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} user={user} onUserUpdate={handleUserUpdate} />;
      case 'trade':
        return <Trade user={user} onUserUpdate={handleUserUpdate} />;
      case 'holdings':
        return <Holdings user={user} />;
      case 'crypto':
        return <CryptoWallet user={user} />;
      case 'advisors':
        return <Advisors user={user} />;
      case 'chat':
        return <ChatBot />;
      case 'portfolio':
        return <PortfolioAnalyzer user={user} />;
      case 'news':
        return <NewsSentiment />;
      case 'community':
        return <CommunityChat user={user} />;
      case 'faq':
        return <FAQ />;
      case 'predict':
        return <AIPrediction />;
      default:
        return <Dashboard setActiveTab={setActiveTab} user={user} onUserUpdate={handleUserUpdate} />;
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen text-slate-200 font-sans selection:bg-primary/30">
      {/* Global real-time market alert toasts */}
      <MarketAlertManager />

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 transition-all duration-300">
        
        {user?.activeAccountType === 'real' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            <div>
              <h4 className="text-yellow-400 font-bold text-sm mb-1">Security Disclaimer: Real Market Simulator</h4>
              <p className="text-yellow-400/80 text-xs leading-relaxed">This platform does not execute real broker transactions yet. It simulates real-time market conditions for educational purposes using actual market prices.</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
