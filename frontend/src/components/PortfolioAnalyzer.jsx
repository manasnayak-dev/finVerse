import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ShieldAlert, TrendingUp, Plus, Trash2, ShieldCheck, Shield, PieChart, Bot } from 'lucide-react';
import { analyzePortfolio } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const COLORS = ['#06b6d4', '#a855f7', '#22c55e', '#f59e0b', '#ec4899', '#3b82f6'];

const PortfolioAnalyzer = ({ user }) => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    if (user) {
      const isDemo = user.activeAccountType === 'demo';
      const portfolio = isDemo ? user.demoPortfolio : user.realPortfolio;
      
      if (portfolio && portfolio.length > 0) {
        const mapped = portfolio.map(item => ({
          symbol: item.stockSymbol,
          amount: item.quantity * item.averagePrice
        }));
        setStocks(mapped);
      } else {
        setStocks([]);
      }
    }
  }, [user]);
  const [newSymbol, setNewSymbol] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (stocks.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzePortfolio(stocks);
      setAnalysis(data);
    } catch (err) {
      setError(err.error || 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addStock = (e) => {
    e.preventDefault();
    if (!newSymbol || !newAmount || isNaN(newAmount)) return;
    setStocks([...stocks, { symbol: newSymbol.toUpperCase(), amount: parseFloat(newAmount) }]);
    setNewSymbol('');
    setNewAmount('');
  };

  const removeStock = (index) => {
    setStocks(stocks.filter((_, i) => i !== index));
  };

  const totalValue = stocks.reduce((sum, stock) => sum + stock.amount, 0);

  const getRiskColor = (level) => {
    const l = (level || '').toLowerCase();
    if (l.includes('low')) return 'text-green-400 bg-green-400/10 border-green-400/30';
    if (l.includes('high')) return 'text-red-400 bg-red-400/10 border-red-400/30';
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass rounded-2xl p-6 flex flex-col h-[calc(100vh-6rem)]">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <PieChart className="text-primary" /> 
          Your Holdings
        </h2>

        <form onSubmit={addStock} className="flex gap-2 mb-6">
          <input
            type="text" placeholder="Symbol (e.g. TSLA)" value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)}
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:border-primary outline-none uppercase"
          />
          <input
            type="number" placeholder="Amount ($)" value={newAmount} onChange={(e) => setNewAmount(e.target.value)}
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:border-primary outline-none"
          />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="bg-primary p-2 rounded-xl text-white">
            <Plus />
          </motion.button>
        </form>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          {stocks.map((stock, i) => (
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={i} className="flex items-center justify-between bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
              <div>
                <p className="font-bold text-lg">{stock.symbol}</p>
                <p className="text-slate-400 text-sm">{(stock.amount / totalValue * 100).toFixed(1)}% of portfolio</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-mono text-lg">${stock.amount.toLocaleString()}</p>
                <button onClick={() => removeStock(i)} className="text-red-400 hover:text-red-300 transition-colors p-2 bg-red-400/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          {stocks.length === 0 && <p className="text-center text-slate-500 mt-10">No holdings added yet.</p>}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-sm">Total Value</p>
            <p className="text-2xl font-bold text-gradient">${totalValue.toLocaleString()}</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleAnalyze} disabled={isLoading || stocks.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : <TrendingUp className="w-5 h-5" />}
            Analyze Now
          </motion.button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <ShieldAlert className="text-secondary" /> 
          AI Analysis Report
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {!analysis && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <Shield className="w-16 h-16 opacity-20" />
            <p>Run analysis to see your portfolio health, risk metrics, and AI suggestions.</p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-primary">
            <LoadingSpinner size="lg" />
            <p className="animate-pulse">Crunching market data...</p>
          </div>
        )}

        {analysis && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-2">Assessed Risk Level</p>
                <span className={`px-4 py-2 rounded-full font-bold border flex items-center gap-2 w-max ${getRiskColor(analysis?.riskLevel)}`}>
                  <ShieldCheck className="w-4 h-4" />
                  {typeof analysis === 'object' ? (analysis?.riskLevel || 'Unknown') : 'Error'}
                </span>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Diversification Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gradient">{typeof analysis === 'object' ? (analysis?.diversificationScore || 0) : 0}</span>
                  <span className="text-slate-500 mb-1">/ 100</span>
                </div>
              </div>
            </div>

            <div className="h-64 mt-8 bg-slate-900/30 rounded-xl border border-slate-700/50 p-4 relative">
              <h3 className="text-sm text-slate-400 absolute top-4 left-4 z-10">Allocation</h3>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={stocks} dataKey="amount" nameKey="symbol" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {stocks.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '0.75rem', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </RechartsPie>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6 mt-8">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Bot className="text-secondary" />
                AI Recommendations
              </h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {typeof analysis === 'object' && analysis?.suggestions ? analysis.suggestions : (typeof analysis === 'string' ? analysis : 'No specific suggestions available at this time.')}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PortfolioAnalyzer;
