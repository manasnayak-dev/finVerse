import express from 'express';
import { switchAccount, getCurrentAccount } from '../controllers/accountController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/switch', protect, switchAccount);
router.get('/current', protect, getCurrentAccount);

export default router;
