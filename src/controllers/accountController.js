import asyncHandler from '../middlewares/asyncHandler.js';
import User from '../models/userModel.js';

// @desc    Switch active account type
// @route   POST /api/account/switch
// @access  Private
export const switchAccount = asyncHandler(async (req, res) => {
  const { type } = req.body;
  const userId = req.user._id;

  if (!type || (type !== 'demo' && type !== 'real')) {
    res.status(400);
    throw new Error('Invalid account type. Use "demo" or "real".');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.activeAccountType = type;
  await user.save();

  res.status(200).json({
    message: `Successfully switched to ${type} account`,
    activeAccountType: user.activeAccountType,
    demoBalance: user.demoBalance,
    realBalance: user.realBalance,
    demoPortfolio: user.demoPortfolio,
    realPortfolio: user.realPortfolio
  });
});

// @desc    Get current account state
// @route   GET /api/account/current
// @access  Private
export const getCurrentAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    activeAccountType: user.activeAccountType,
    demoBalance: user.demoBalance,
    realBalance: user.realBalance,
    demoPortfolio: user.demoPortfolio,
    realPortfolio: user.realPortfolio
  });
});
