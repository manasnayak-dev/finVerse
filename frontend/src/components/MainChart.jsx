import { useState } from 'react';
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { Bot, Sparkles, X, ChevronRight } from 'lucide-react';
import { chatWithAI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

const MainChart = ({ symbol, price, isDemo }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [showAnalyst, setShowAnalyst] = useState(false);

  // If user hasn't searched a symbol yet, default to a major index
  const chartSymbol = symbol ? symbol : 'BSE:SENSEX';

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    setShowAnalyst(true);
    setAiInsight(null);
    try {
      const prompt = `Act as an elite Wall Street technical analyst. I am looking at the live chart for the asset ticker: ${chartSymbol}. Please provide a highly concise, 3-sentence maximum technical and fundamental consensus on this asset right now. Classify it strictly as BULLISH, BEARISH, or NEUTRAL. Format your response clearly.`;
      const response = await chatWithAI(prompt);
      setAiInsight(response.response);
    } catch (err) {
      setAiInsight(`⚠️ Error: ${err.message || 'The AI Analyst is currently rate-limited. Please try again in 60 seconds.'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="glass rounded-2xl flex flex-col h-[600px] border border-slate-800/60 overflow-hidden relative group">
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-32 -mt-32 opacity-10 ${isDemo ? 'bg-purple-500' : 'bg-green-500'}`} />
      
      {/* Header Info & AI Button */}
      <div className="p-4 border-b border-slate-800/50 flex flex-wrap justify-between items-center z-10 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white uppercase">{chartSymbol}</h2>
          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs font-semibold border border-blue-500/20">
            Live TV Feed
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 1.10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          onClick={analyzeWithAI}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/30 rounded-xl text-indigo-300 font-bold text-sm transition-colors disabled:opacity-50"
        >
          {isAnalyzing ? <LoadingSpinner size="sm" /> : <Bot className="w-4 h-4" />}
          AI Analyst
        </motion.button>
      </div>

      <div className="flex-1 relative z-0 flex h-full min-h-[500px]">
        {/* TradingView Real Chart */}
        <div className="flex-1 h-full w-full" style={{ height: "100%" }}>
          <AdvancedRealTimeChart 
            symbol={chartSymbol}
            theme="dark"
            autosize
            allow_symbol_change={false}
            hide_side_toolbar={false}
            toolbar_bg="#0f172a"
            container_id="tv_chart"
          />
        </div>

        {/* AI Analyst Overlay Panel */}
        <AnimatePresence>
          {showAnalyst && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl flex flex-col z-20"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-indigo-950/30">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Gemini AI Analyst
                </h3>
                <button 
                  onClick={() => setShowAnalyst(false)}
                  className="p-1 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                >
                   <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto flex-1 text-sm leading-relaxed text-slate-300">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-full text-indigo-400 opacity-70">
                    <LoadingSpinner size="md" />
                    <p className="mt-4 animate-pulse">Running advanced market analysis on {chartSymbol}...</p>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                     <p className="font-semibold text-white bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        Asset: <span className="text-indigo-400 font-bold">{chartSymbol}</span>
                     </p>
                     <div className="prose prose-invert prose-sm">
                       {/* Render AI markdown response simply */}
                       {aiInsight?.split('\n').map((line, i) => (
                         <p key={i}>{line}</p>
                       ))}
                     </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainChart;
