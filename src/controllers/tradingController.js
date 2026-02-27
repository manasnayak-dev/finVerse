import mongoose from 'mongoose';
import asyncHandler from '../middlewares/asyncHandler.js';
import User from '../models/userModel.js';
import Transaction from '../models/transactionModel.js';
import { getCurrentPrice } from '../services/marketService.js';

// @desc    Buy a stock
// @route   POST /api/trade/buy
// @access  Private
export const buyStock = asyncHandler(async (req, res) => {
  const { stockSymbol, quantity, price } = req.body;
  const userId = req.user._id;

  if (!stockSymbol || !quantity || !price || quantity <= 0 || price <= 0) {
    res.status(400);
    throw new Error('Please provide valid stockSymbol, quantity, and price');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    const isDemo = user.activeAccountType === 'demo';
    
    // In Real Mode, ignore the user-submitted price and fetch the live market price
    let executionPrice = price;
    if (!isDemo) {
      try {
        executionPrice = await getCurrentPrice(stockSymbol);
      } catch (marketError) {
        // Fallback to submitted price if live api is dead
        console.warn(`Real Mode live fetch failed for buy. Using submitted price for ${stockSymbol}.`);
      }
    }

    const totalCost = quantity * executionPrice;
    const currentBalance = isDemo ? user.demoBalance : user.realBalance;

    if (currentBalance < totalCost) {
      res.status(400);
      throw new Error(`Insufficient ${isDemo ? 'demo' : 'real'} balance`);
    }

    // Deduct balance
    if (isDemo) {
      user.demoBalance -= totalCost;
    } else {
      user.realBalance -= totalCost;
    }

    // Update holdings
    const portfolioKey = isDemo ? 'demoPortfolio' : 'realPortfolio';
    let portfolio = user[portfolioKey] || [];
    
    const existingIndex = portfolio.findIndex(
      (h) => h.stockSymbol.toUpperCase() === stockSymbol.toUpperCase()
    );

    if (existingIndex >= 0) {
      const holding = portfolio[existingIndex];
      const totalOldValue = holding.quantity * holding.averagePrice;
      const newTotalValue = totalOldValue + totalCost;
      const newQuantity = holding.quantity + quantity;
      
      holding.quantity = newQuantity;
      holding.averagePrice = newTotalValue / newQuantity;
      portfolio[existingIndex] = holding;
    } else {
      portfolio.push({
        stockSymbol: stockSymbol.toUpperCase(),
        quantity,
        averagePrice: executionPrice,
      });
    }

    // Explicitly mark array as modified since it's Mixed type or Array
    user.markModified(portfolioKey);
    await user.save({ session });

    // Save transaction
    const transaction = new Transaction({
      userId,
      stockSymbol,
      quantity,
      price: executionPrice,
      type: 'buy',
      // We could add accountType: isDemo ? 'demo' : 'real' here if schema supported it
    });

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Stock purchased successfully',
      transaction,
      newBalance: isDemo ? user.demoBalance : user.realBalance,
      activeAccountType: user.activeAccountType,
      portfolio: user[portfolioKey]
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// @desc    Sell a stock
// @route   POST /api/trade/sell
// @access  Private
export const sellStock = asyncHandler(async (req, res) => {
  const { stockSymbol, quantity, price } = req.body;
  const userId = req.user._id;

  if (!stockSymbol || !quantity || !price || quantity <= 0 || price <= 0) {
    res.status(400);
    throw new Error('Please provide valid stockSymbol, quantity, and price');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    const isDemo = user.activeAccountType === 'demo';
    
    // In Real Mode, ignore user-submitted price and fetch actual market price
    let executionPrice = price;
    if (!isDemo) {
      try {
        executionPrice = await getCurrentPrice(stockSymbol);
      } catch (marketError) {
        // Fallback to submitted price if live api is dead
        console.warn(`Real Mode live fetch failed for sell. Using submitted price for ${stockSymbol}.`);
      }
    }

    const totalRevenue = quantity * executionPrice;
    
    const portfolioKey = isDemo ? 'demoPortfolio' : 'realPortfolio';
    let portfolio = user[portfolioKey] || [];

    const holdingIndex = portfolio.findIndex(
      (h) => h.stockSymbol.toUpperCase() === stockSymbol.toUpperCase()
    );

    if (holdingIndex === -1) {
      res.status(400);
      throw new Error('You do not own this stock in your active account');
    }

    const holding = portfolio[holdingIndex];

    if (holding.quantity < quantity) {
      res.status(400);
      throw new Error(`Insufficient shares. You only own ${holding.quantity} shares.`);
    }

    // Update holding quantity
    holding.quantity -= quantity;

    if (holding.quantity === 0) {
      portfolio.splice(holdingIndex, 1);
    } else {
      portfolio[holdingIndex] = holding;
    }

    user.markModified(portfolioKey);

    // Add balance to User
    if (isDemo) {
      user.demoBalance += totalRevenue;
    } else {
      user.realBalance += totalRevenue;
    }

    await user.save({ session });

    // Save transaction
    const transaction = new Transaction({
      userId,
      stockSymbol,
      quantity,
      price: executionPrice,
      type: 'sell',
    });

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'Stock sold successfully',
      transaction,
      newBalance: isDemo ? user.demoBalance : user.realBalance,
      activeAccountType: user.activeAccountType,
      portfolio: user[portfolioKey]
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// @desc    Get user transaction history
// @route   GET /api/trade/history
// @access  Private
export const getTransactionHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Fetch transactions sorted by date descending (newest first)
  const transactions = await Transaction.find({ userId }).sort({ date: -1 });

  res.status(200).json(transactions);
});

// @desc    Get live quote for a stock
// @route   GET /api/trade/quote/:symbol
// @access  Private
export const getQuote = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isDemo = user.activeAccountType === 'demo';

  if (!isDemo) {
    try {
      const price = await getCurrentPrice(symbol);
      return res.status(200).json({ symbol, price });
    } catch (error) {
      // Fallback for demo/hackathon so user isn't fully blocked
      console.warn(`Live API failed for ${symbol}, using mock price.`);
      const mockPrice = parseFloat((Math.random() * 450 + 50).toFixed(2));
      return res.status(200).json({ symbol, price: mockPrice, simulated: true });
    }
  }

  // Generate a mock price between 50 and 500 for demo mode if not available
  const mockPrice = parseFloat((Math.random() * 450 + 50).toFixed(2));
  res.status(200).json({ symbol, price: mockPrice });
});
