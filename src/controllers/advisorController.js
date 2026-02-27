import Advisor from '../models/advisorModel.js';

// @desc    Get all verified advisors
// @route   GET /api/advisors
// @access  Private
export const getAdvisors = async (req, res) => {
  try {
    const advisors = await Advisor.find({ verified: true });
    res.json(advisors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single advisor by ID
// @route   GET /api/advisors/:id
// @access  Private
export const getAdvisorById = async (req, res) => {
  try {
    const advisor = await Advisor.findById(req.params.id);
    if (advisor) {
      res.json(advisor);
    } else {
      res.status(404).json({ message: 'Advisor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
