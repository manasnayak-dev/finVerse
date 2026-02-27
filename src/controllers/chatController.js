import Message from '../models/messageModel.js';

// @desc    Get chat history between current user and a specific advisor
// @route   GET /api/chat/:advisorId
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const { advisorId } = req.params;
    const userId = req.user._id;

    // Standardized room namer: room_user_{userId}_advisor_{advisorId}
    const room = `room_user_${userId}_advisor_${advisorId}`;

    const messages = await Message.find({ room }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
