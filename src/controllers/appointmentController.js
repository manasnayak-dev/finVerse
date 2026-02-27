import Appointment from '../models/appointmentModel.js';

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private
export const bookAppointment = async (req, res) => {
  try {
    const { advisorId, date, timeSlot, notes } = req.body;
    
    const appointment = new Appointment({
      user: req.user._id,
      advisor: advisorId,
      date,
      timeSlot,
      notes,
    });
    
    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('advisor', 'name avatarUrl email hourlyRate')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
