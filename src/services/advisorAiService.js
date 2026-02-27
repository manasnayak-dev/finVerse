import { getGeminiModel } from '../config/aiConfig.js';
import Advisor from '../models/advisorModel.js';
import Message from '../models/messageModel.js';

export const handleAdvisorAILogic = async (io, data) => {
  // data contains: { room, senderId, senderModel, username, message, timestamp }
  
  // Only trigger AI if the message is from a User to an Advisor room
  if (data.senderModel !== 'User' || !data.room.startsWith('room_user_')) {
    return;
  }

  try {
    // Extract user & advisor IDs from room name: room_user_{userId}_advisor_{advisorId}
    const match = data.room.match(/room_user_(.*?)_advisor_(.*)/);
    if (!match) return;
    
    const userId = match[1];
    const advisorId = match[2];

    // Fetch the advisor details to build the persona
    const advisor = await Advisor.findById(advisorId);
    if (!advisor) return;

    // Fetch the last 5 messages in this room to give the AI some context
    const recentMessages = await Message.find({ room: data.room })
      .sort({ timestamp: -1 })
      .limit(6);
    recentMessages.reverse();

    let chatContext = '';
    for (const msg of recentMessages) {
      chatContext += `${msg.senderModel === 'Advisor' ? advisor.name : msg.username}: ${msg.message}\n`;
    }

    // Build the prompt for Gemini
    const prompt = `
You are a highly professional, verified financial advisor named ${advisor.name}.
Your biography: ${advisor.bio}
Your areas of expertise: ${advisor.expertise.join(', ')}

You are having a private, 1-on-1 chat with a client named ${data.username}.
Respond to their latest message naturally, as a human advisor would in a chat interface (short, concise, professional, but conversational).
Do NOT break character. Do NOT say you are an AI. Only output your direct response message.

Recent Chat History:
${chatContext}

${advisor.name}: `;

    // Get the Gemini model
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    let aiResponse = result.response.text().trim();
    
    // Clean up if the AI accidentally prefixes with its name
    if (aiResponse.startsWith(`${advisor.name}:`)) {
        aiResponse = aiResponse.replace(`${advisor.name}:`, '').trim();
    }

    // Create the AI's response message object
    const advisorMessageData = {
      room: data.room,
      senderId: advisor._id,
      senderModel: 'Advisor',
      username: advisor.name,
      message: aiResponse,
      timestamp: Date.now()
    };

    // Save AI response to database
    await Message.create(advisorMessageData);

    // Broadcast the AI response back to the room with a slight artificial delay for "typing"
    setTimeout(() => {
        io.to(data.room).emit('receive_message', advisorMessageData);
    }, 1500); // 1.5 second delay

  } catch (error) {
    console.error('Error generating AI Advisor response:', error);
  }
};
