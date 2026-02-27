import express from 'express';
import { getChatHistory } from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/:advisorId').get(protect, getChatHistory);

export default router;
