import express from 'express';
import { analyzePortfolio, createSIP, getSIPs, cancelSIP } from '../controllers/portfolioController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, analyzePortfolio);
router.post('/sip', protect, createSIP);
router.get('/sip', protect, getSIPs);
router.delete('/sip/:id', protect, cancelSIP);

export default router;
