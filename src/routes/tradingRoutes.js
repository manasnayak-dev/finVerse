import express from 'express';
import {
  buyStock,
  sellStock,
  getTransactionHistory,
  getQuote,
} from '../controllers/tradingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All trading routes are protected
router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);
router.get('/history', protect, getTransactionHistory);
router.get('/quote/:symbol', protect, getQuote);

export default router;
