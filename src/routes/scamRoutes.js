import express from 'express';
import { analyzeScamMessage } from '../controllers/scamController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// The scam analyzer is protected, but you could remove "protect" if you want it public
router.post('/analyze', protect, analyzeScamMessage);

export default router;
