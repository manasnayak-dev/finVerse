import mongoose from 'mongoose';
import asyncHandler from '../middlewares/asyncHandler.js';
import User from '../models/userModel.js';
import Portfolio from '../models/portfolioModel.js';
import Transaction from '../models/transactionModel.js';

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

  const totalCost = quantity * price;

  // Start a Mongoose session for atomic transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check user balance
    const user = await User.findById(userId).session(session);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.demoBalance < totalCost) {
      res.status(400);
      throw new Error('Insufficient demo balance');
    }

    // 2. Deduct balance
    user.demoBalance -= totalCost;
    await user.save({ session });

    // 3. Update holdings in Portfolio
    let portfolio = await Portfolio.findOne({ userId }).session(session);

    if (!portfolio) {
      // Create new portfolio if it doesn't exist
      portfolio = new Portfolio({
        userId,
        holdings: [],
      });
    }

    // Check if the stock already exists in the portfolio
    const existingHoldingIndex = portfolio.holdings.findIndex(
      (h) => h.stockSymbol.toUpperCase() === stockSymbol.toUpperCase()
    );

    if (existingHoldingIndex >= 0) {
      // Update existing holding: calculate new average price
      const holding = portfolio.holdings[existingHoldingIndex];
      const totalOldValue = holding.quantity * holding.averagePrice;
      const newTotalValue = totalOldValue + totalCost;
      const newQuantity = holding.quantity + quantity;
      
      holding.quantity = newQuantity;
      holding.averagePrice = newTotalValue / newQuantity;
    } else {
      // Add new holding
      portfolio.holdings.push({
        stockSymbol: stockSymbol.toUpperCase(),
        quantity,
        averagePrice: price,
      });
    }

    await portfolio.save({ session });

    // 4. Save transaction logic
    const transaction = new Transaction({
      userId,
      stockSymbol,
      quantity,
      price,
      type: 'buy',
    });

    await transaction.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Stock purchased successfully',
      transaction,
      newBalance: user.demoBalance,
    });
  } catch (error) {
    // Abort transaction in case of any failure
    await session.abortTransaction();
    session.endSession();
    
    // Pass the error to the asyncHandler
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

  const totalRevenue = quantity * price;

  // Start a Mongoose session for atomic transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Get Portfolio & Check if stock is held
    const portfolio = await Portfolio.findOne({ userId }).session(session);

    if (!portfolio) {
      res.status(400);
      throw new Error('Portfolio not found');
    }

    const holdingIndex = portfolio.holdings.findIndex(
      (h) => h.stockSymbol.toUpperCase() === stockSymbol.toUpperCase()
    );

    if (holdingIndex === -1) {
      res.status(400);
      throw new Error('You do not own this stock');
    }

    const holding = portfolio.holdings[holdingIndex];

    if (holding.quantity < quantity) {
      res.status(400);
      throw new Error(`Insufficient shares. You only own ${holding.quantity} shares.`);
    }

    // 2. Update quantity in holdings
    holding.quantity -= quantity;

    // If quantity is 0, optionally remove the holding from the array
    if (holding.quantity === 0) {
      portfolio.holdings.splice(holdingIndex, 1);
    }
    
    await portfolio.save({ session });

    // 3. Add balance to User
    const user = await User.findById(userId).session(session);
    user.demoBalance += totalRevenue;
    await user.save({ session });

    // 4. Save transaction logic
    const transaction = new Transaction({
      userId,
      stockSymbol,
      quantity,
      price,
      type: 'sell',
    });

    await transaction.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'Stock sold successfully',
      transaction,
      newBalance: user.demoBalance,
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
