import express from 'express';
import { bookAppointment, getAppointments } from '../controllers/appointmentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, bookAppointment)
  .get(protect, getAppointments);

export default router;
