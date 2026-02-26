import express from 'express';
import {
  bookConsultation,
  getUserBookings,
  updateBookingStatus,
} from '../controllers/expertController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/book', protect, bookConsultation);
router.get('/bookings', protect, getUserBookings);
router.put('/bookings/:id/status', protect, updateBookingStatus); // Usually restricted to admin/expert

export default router;
