import mongoose from 'mongoose';

const advisorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String, required: true },
    expertise: [{ type: String }], // e.g., ['Tax Planning', 'Retirement', 'Crypto']
    hourlyRate: { type: Number, required: true },
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 5.0 },
    reviews: { type: Number, default: 0 },
    avatarUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

const Advisor = mongoose.model('Advisor', advisorSchema);

export default Advisor;
