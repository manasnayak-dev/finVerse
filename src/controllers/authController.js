import asyncHandler from '../middlewares/asyncHandler.js';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user (password is hashed in the Mongoose pre-save middleware)
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    // Generate token
    const token = generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      activeAccountType: user.activeAccountType,
      demoBalance: user.demoBalance,
      realBalance: user.realBalance,
      demoPortfolio: user.demoPortfolio,
      realPortfolio: user.realPortfolio,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate fields
  if (!email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Find user by email
  const user = await User.findOne({ email });

  // Compare password using the method defined in userModel
  if (user && (await user.matchPassword(password))) {
    // Generate token
    const token = generateToken(res, user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      activeAccountType: user.activeAccountType,
      demoBalance: user.demoBalance,
      realBalance: user.realBalance,
      demoPortfolio: user.demoPortfolio,
      realPortfolio: user.realPortfolio,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  // The user should be attached to req in the auth middleware (to be implemented)
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      activeAccountType: user.activeAccountType,
      demoBalance: user.demoBalance,
      realBalance: user.realBalance,
      demoPortfolio: user.demoPortfolio,
      realPortfolio: user.realPortfolio,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
