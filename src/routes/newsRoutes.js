import express from 'express';
import { analyzeNews, getSentiment } from '../controllers/newsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route for submitting news to be analyzed by the AI
router.post('/analyze', protect, analyzeNews);

// Route for getting latest news sentiment
router.get('/sentiment', protect, getSentiment);

export default router;
