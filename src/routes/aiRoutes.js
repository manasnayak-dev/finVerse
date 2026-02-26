import express from 'express';
import { chatWithAI, explainPrediction, generateStrategy } from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, chatWithAI);
router.post('/explain', protect, explainPrediction);
router.post('/strategy', protect, generateStrategy);

export default router;
