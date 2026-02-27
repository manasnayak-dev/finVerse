import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, RefreshCw, TrendingUp, TrendingDown, Wallet, ArrowRightLeft, DollarSign, Loader2 } from 'lucide-react';
import { getCryptoWallet, buyCrypto, sellCrypto } from '../services/api';
import axios from 'axios';

const COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA'];

const CryptoWallet = ({ user }) => {
  const [wallet, setWallet] = useState(null);
  const [livePrices, setLivePrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Trading Widget State
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [tradeAmount, setTradeAmount] = useState('');
  const [isTrading, setIsTrading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState('');

  useEffect(() => {
    fetchWalletData();
    const interval = setInterval(fetchLivePrices, 10000); // Poll prices every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchWalletData = async () => {
    try {
      const data = await getCryptoWallet();
      setWallet(data);
      await fetchLivePrices();
    } catch (err) {
      console.error('Failed to load wallet', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLivePrices = async () => {
    try {
      const symbols = COINS.map(c => `"${c}USDT"`).join(',');
      const res = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbols=[${symbols}]`);
      const priceMap = {};
      res.data.forEach(item => {
        const symbol = item.symbol.replace('USDT', '');
        priceMap[symbol] = parseFloat(item.price);
      });
      setLivePrices(priceMap);
    } catch (err) {
      console.error('Error fetching live Binance prices', err);
    }
  };

  const activeBalance = wallet?.activeAccountType === 'real' ? wallet?.realBalance : wallet?.demoBalance;
  
  // Calculate total portfolio value
  let totalCryptoValue = 0;
  const portfolioWithPrices = wallet?.cryptoPortfolio?.map(asset => {
    const currentPrice = livePrices[asset.symbol] || asset.averagePrice;
    const currentValue = currentPrice * asset.amount;
    const profitLoss = currentValue - (asset.averagePrice * asset.amount);
    const profitLossPercent = ((currentPrice - asset.averagePrice) / asset.averagePrice) * 100;
    
    totalCryptoValue += currentValue;

    return { ...asset, currentPrice, currentValue, profitLoss, profitLossPercent };
  }) || [];

  const handleTrade = async (type) => {
    setTradeError('');
    setTradeSuccess('');
    if (!tradeAmount || isNaN(tradeAmount) || parseFloat(tradeAmount) <= 0) {
      setTradeError('Please enter a valid amount.');
      return;
    }

    setIsTrading(true);
    try {
      if (type === 'buy') {
        await buyCrypto(selectedCoin, parseFloat(tradeAmount));
        setTradeSuccess(`Successfully bought ${tradeAmount} ${selectedCoin}`);
      } else {
        await sellCrypto(selectedCoin, parseFloat(tradeAmount));
        setTradeSuccess(`Successfully sold ${tradeAmount} ${selectedCoin}`);
      }
      setTradeAmount('');
      await fetchWalletData(); // Refresh portfolio instantly
    } catch (err) {
      setTradeError(err.error || err.message || `Failed to ${type} crypto.`);
    } finally {
      setIsTrading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-7xl mx-auto pb-20 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
            <Bitcoin className="w-8 h-8 text-amber-400" />
            Crypto Wallet
          </h1>
          <p className="text-slate-400 text-sm">
            {wallet?.activeAccountType === 'real' ? 'Live ' : 'Simulated '} cryptocurrency trading & storage
          </p>
        </div>
        <button onClick={fetchWalletData} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Balances & Assets */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Balance Card */}
          <div className="glass rounded-3xl p-8 border border-slate-700/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-cyan-500/20 transition-all duration-700 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row gap-8 justify-between relative z-10">
              <div>
                <div className="text-slate-400 text-sm font-semibold mb-1 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-cyan-400" /> Total Balance
                </div>
                <div className="text-5xl font-extrabold text-white tracking-tight">
                  ${(activeBalance + totalCryptoValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              
              <div className="flex gap-8">
                <div>
                  <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Available Cash</div>
                  <div className="text-xl font-bold text-white">${activeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Crypto Assets</div>
                  <div className="text-xl font-bold text-cyan-400">${totalCryptoValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Holdings List */}
          <div className="glass rounded-3xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6">Your Digital Assets</h2>
            
            {portfolioWithPrices.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Bitcoin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No crypto assets found.</p>
                <p className="text-sm">Use the trading widget to buy your first coin.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {portfolioWithPrices.map((asset, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">
                        {asset.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{asset.symbol}</div>
                        <div className="text-xs text-slate-500">{asset.amount} Coins</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-8 sm:gap-12 text-right">
                      <div>
                        <div className="font-mono font-bold text-white">${asset.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div className="text-xs text-slate-500">Avg ${asset.averagePrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                      </div>
                      
                      <div className="text-right min-w-[80px]">
                        <div className={`font-bold flex items-center justify-end gap-1 ${asset.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {asset.profitLoss >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(asset.profitLossPercent).toFixed(2)}%
                        </div>
                        <div className={`text-xs ${asset.profitLoss >= 0 ? 'text-green-500/70' : 'text-red-500/70'}`}>
                          {asset.profitLoss >= 0 ? '+' : '-'}${Math.abs(asset.profitLoss).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Trading Widget */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-6 border border-slate-700/50 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-cyan-400" /> Convert / Trade
            </h2>

            {tradeError && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">{tradeError}</div>}
            {tradeSuccess && <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">{tradeSuccess}</div>}

            <div className="space-y-4">
              {/* Coin Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Asset</label>
                <div className="grid grid-cols-3 gap-2">
                  {COINS.map(coin => (
                    <button
                      key={coin}
                      onClick={() => setSelectedCoin(coin)}
                      className={`py-2 px-1 rounded-xl text-sm font-bold transition-all border ${
                        selectedCoin === coin 
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {coin}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Display */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-500 text-sm font-semibold">Live Price</span>
                <span className="text-white font-mono font-bold text-lg">
                  ${livePrices[selectedCoin] ? livePrices[selectedCoin].toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6}) : '...'}
                </span>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (Coins)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">{selectedCoin}</div>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.0001"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 pl-14 py-3 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Estimated Total */}
              {tradeAmount && !isNaN(tradeAmount) && livePrices[selectedCoin] && (
                <div className="flex justify-between items-center text-sm px-1 text-slate-400">
                  <span>Estimated Total</span>
                  <span className="font-mono text-white">~${(livePrices[selectedCoin] * parseFloat(tradeAmount)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleTrade('buy')}
                  disabled={isTrading || !livePrices[selectedCoin]}
                  className="py-3.5 rounded-xl font-bold text-white transition-all bg-green-600 hover:bg-green-500 disabled:opacity-50 flex justify-center items-center"
                >
                  {isTrading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buy'}
                </button>
                <button
                  onClick={() => handleTrade('sell')}
                  disabled={isTrading || !livePrices[selectedCoin]}
                  className="py-3.5 rounded-xl font-bold text-white transition-all bg-red-600 hover:bg-red-500 disabled:opacity-50 flex justify-center items-center"
                >
                  {isTrading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sell'}
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest"><DollarSign className="w-3 h-3 inline-block relative -top-0.5" /> 0% Trading Fees</span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default CryptoWallet;
