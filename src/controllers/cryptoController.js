import User from '../models/userModel.js';
import axios from 'axios';

// @desc    Get user's crypto wallet & portfolio
// @route   GET /api/crypto/wallet
// @access  Private
export const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      demoBalance: user.demoBalance,
      realBalance: user.realBalance,
      cryptoPortfolio: user.cryptoPortfolio || [],
      activeAccountType: user.activeAccountType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Buy Cryptocurrency
// @route   POST /api/crypto/buy
// @access  Private
// @body    { symbol: 'BTC', amount: 0.5 }
export const buyCrypto = async (req, res) => {
  const { symbol, amount } = req.body;
  const uppercaseSymbol = symbol.toUpperCase();

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const currentType = req.user.activeAccountType || 'demo';
    
    // Fetch live crypto price using Binance Public API (no key needed for simple ticker)
    let livePrice = 0;
    try {
      const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${uppercaseSymbol}USDT`);
      livePrice = parseFloat(response.data.price);
    } catch (apiError) {
      console.error(`Failed to fetch live price for ${uppercaseSymbol}USDT from Binance.`, apiError.message);
      return res.status(400).json({ message: `Could not fetch live price for ${uppercaseSymbol}. Make sure symbol is valid (e.g. BTC, ETH).` });
    }

    const totalCost = livePrice * amount;
    const user = await User.findById(req.user._id);

    // Filter available balance based on account type
    const availableBalance = currentType === 'demo' ? user.demoBalance : user.realBalance;

    if (totalCost > availableBalance) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Deduct balance
    if (currentType === 'demo') {
      user.demoBalance -= totalCost;
    } else {
      user.realBalance -= totalCost;
    }

    // Initialize cryptoPortfolio if it doesn't exist
    if (!user.cryptoPortfolio) {
        user.cryptoPortfolio = [];
    }

    // Add to portfolio or update existing holding
    const existingAssetIndex = user.cryptoPortfolio.findIndex(
      (asset) => asset.symbol === uppercaseSymbol && asset.accountType === currentType
    );

    if (existingAssetIndex >= 0) {
      const existingAsset = user.cryptoPortfolio[existingAssetIndex];
      const totalAmount = existingAsset.amount + amount;
      const totalCostBasis = (existingAsset.averagePrice * existingAsset.amount) + totalCost;
      
      user.cryptoPortfolio[existingAssetIndex].amount = totalAmount;
      user.cryptoPortfolio[existingAssetIndex].averagePrice = totalCostBasis / totalAmount;
    } else {
      user.cryptoPortfolio.push({
        symbol: uppercaseSymbol,
        amount: amount,
        averagePrice: livePrice,
        accountType: currentType,
        purchaseDate: new Date()
      });
    }

    await user.save();
    
    res.status(200).json({
      message: `Successfully bought ${amount} ${uppercaseSymbol} at $${livePrice.toFixed(2)}`,
      portfolio: user.cryptoPortfolio,
      demoBalance: user.demoBalance,
      realBalance: user.realBalance
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sell Cryptocurrency
// @route   POST /api/crypto/sell
// @access  Private
// @body    { symbol: 'BTC', amount: 0.5 }
export const sellCrypto = async (req, res) => {
  const { symbol, amount } = req.body;
  const uppercaseSymbol = symbol.toUpperCase();

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const currentType = req.user.activeAccountType || 'demo';
    const user = await User.findById(req.user._id);
    
    if (!user.cryptoPortfolio) {
        return res.status(400).json({ message: 'No crypto assets found in your wallet.' });
    }

    const existingAssetIndex = user.cryptoPortfolio.findIndex(
      (asset) => asset.symbol === uppercaseSymbol && asset.accountType === currentType
    );

    if (existingAssetIndex === -1 || user.cryptoPortfolio[existingAssetIndex].amount < amount) {
      return res.status(400).json({ message: 'Insufficient crypto balance' });
    }

    // Fetch live crypto price using Binance
    let livePrice = 0;
    try {
      const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${uppercaseSymbol}USDT`);
      livePrice = parseFloat(response.data.price);
    } catch (apiError) {
      console.error(`Failed to fetch live price for ${uppercaseSymbol}USDT from Binance.`, apiError.message);
      return res.status(400).json({ message: `Could not fetch live price for ${uppercaseSymbol}.` });
    }

    const totalRevenue = livePrice * amount;

    // Add revenue back to balance
    if (currentType === 'demo') {
      user.demoBalance += totalRevenue;
    } else {
      user.realBalance += totalRevenue;
    }

    // Deduct crypto amount
    user.cryptoPortfolio[existingAssetIndex].amount -= amount;

    // Remove if empty
    if (user.cryptoPortfolio[existingAssetIndex].amount <= 0) {
      user.cryptoPortfolio.splice(existingAssetIndex, 1);
    }

    await user.save();

    res.status(200).json({
      message: `Successfully sold ${amount} ${uppercaseSymbol} at $${livePrice.toFixed(2)}`,
      portfolio: user.cryptoPortfolio,
      demoBalance: user.demoBalance,
      realBalance: user.realBalance
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
