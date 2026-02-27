import express from 'express';
import { getAdvisors, getAdvisorById } from '../controllers/advisorController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getAdvisors);
router.route('/:id').get(protect, getAdvisorById);

export default router;
