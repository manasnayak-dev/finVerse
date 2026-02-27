/**
 * prediction.routes.js
 * ─────────────────────────────────────────────────────────────────────
 * Routes for the AI Stock Prediction System
 *
 * POST /api/prediction/analyze   → Full prediction report
 * GET  /api/prediction/symbols   → Supported symbols list
 */

import express from 'express';
import { analyzePrediction, getSupportedSymbols } from './prediction.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.post('/analyze',  protect, analyzePrediction);
router.get('/symbols',   protect, getSupportedSymbols);

export default router;
