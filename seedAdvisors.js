import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Advisor from './src/models/advisorModel.js';

dotenv.config();

const mockAdvisors = [
  {
    name: 'Sarah Jenkins, CFP',
    email: 'sarah.jenkins@finverse.expert',
    bio: 'Certified Financial Planner with 10+ years helping tech professionals build tax-advantaged retirement portfolios.',
    expertise: ['Tax Planning', 'Retirement', 'RSUs'],
    hourlyRate: 150,
    verified: true,
    rating: 4.9,
    reviews: 124,
    avatarUrl: 'https://i.pravatar.cc/150?u=sarah'
  },
  {
    name: 'Michael Chen',
    email: 'mchen@finverse.expert',
    bio: 'Former institutional trader turned advisor. I specialize in aggressive growth strategies, swing trading setups, and crypto asset allocation.',
    expertise: ['Crypto', 'Swing Trading', 'Options'],
    hourlyRate: 200,
    verified: true,
    rating: 4.8,
    reviews: 89,
    avatarUrl: 'https://i.pravatar.cc/150?u=michael'
  },
  {
    name: 'Aisha Patel, CPA',
    email: 'apatel.cpa@finverse.expert',
    bio: 'Certified Public Accountant focused on real estate investments, tax optimization, and wealth preservation for high net worth individuals.',
    expertise: ['Real Estate', 'Tax Planning', 'Wealth Preservation'],
    hourlyRate: 175,
    verified: true,
    rating: 5.0,
    reviews: 210,
    avatarUrl: 'https://i.pravatar.cc/150?u=aisha'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected to seed...');
    
    await Advisor.deleteMany(); // Clear existing
    console.log('Cleared existing advisors.');

    await Advisor.insertMany(mockAdvisors);
    console.log('Successfully inserted mock advisors!');

    process.exit();
  } catch (error) {
    console.error('Error with data import:', error);
    process.exit(1);
  }
};

seedDB();
