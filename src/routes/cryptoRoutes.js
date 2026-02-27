import express from 'express';
import { getWallet, buyCrypto, sellCrypto } from '../controllers/cryptoController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/wallet', protect, getWallet);
router.post('/buy', protect, buyCrypto);
router.post('/sell', protect, sellCrypto);

export default router;
