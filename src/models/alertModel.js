import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    impactLevel: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'High',
    },
    marketImpacting: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
