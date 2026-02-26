import asyncHandler from '../middlewares/asyncHandler.js';
import Consultation from '../models/consultationModel.js';

// @desc    Book a new consultation with an expert
// @route   POST /api/experts/book
// @access  Private
export const bookConsultation = asyncHandler(async (req, res) => {
  const { expertName, date, topic } = req.body;
  const userId = req.user._id;

  if (!expertName || !date || !topic) {
    res.status(400);
    throw new Error('Please provide expertName, date, and topic');
  }

  // Create the booking
  const consultation = await Consultation.create({
    userId,
    expertName,
    date,
    topic,
    status: 'pending',
  });

  if (consultation) {
    res.status(201).json({
      message: 'Consultation booked successfully',
      consultation,
    });
  } else {
    res.status(400);
    throw new Error('Invalid consultation data');
  }
});

// @desc    Get all bookings for the logged-in user
// @route   GET /api/experts/bookings
// @access  Private
export const getUserBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Retrieve descending by date so upcoming ones are easiest to find
  const bookings = await Consultation.find({ userId }).sort({ date: -1 });

  res.status(200).json(bookings);
});

// @desc    Update a booking status (e.g. approve, cancel, complete)
// @route   PUT /api/experts/bookings/:id/status
// @access  Private (Usually would be restricted by an admin/expert role middleware)
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, meetingLink } = req.body;
  const consultationId = req.params.id;

  const validStatuses = ['pending', 'approved', 'completed', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Please provide a valid status');
  }

  const consultation = await Consultation.findById(consultationId);

  if (!consultation) {
    res.status(404);
    throw new Error('Consultation not found');
  }

  // Optionally: Verify if the currently logged in user owns this booking or is an admin
  // if (consultation.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  //   res.status(401);
  //   throw new Error('Not authorized to update this booking');
  // }

  // Update fields
  consultation.status = status;

  if (meetingLink) {
    consultation.meetingLink = meetingLink;
  }

  const updatedConsultation = await consultation.save();

  res.status(200).json({
    message: 'Consultation status updated',
    consultation: updatedConsultation,
  });
});
