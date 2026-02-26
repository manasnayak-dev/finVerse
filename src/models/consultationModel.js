import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    expertName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'],
      default: 'pending',
    },
    meetingLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Consultation = mongoose.model('Consultation', consultationSchema);

export default Consultation;
