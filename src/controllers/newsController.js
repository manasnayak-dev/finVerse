import asyncHandler from '../middlewares/asyncHandler.js';
import { getGeminiModel } from '../config/aiConfig.js';
import Alert from '../models/alertModel.js';

// @desc    Analyze news for market impact and broadcast alert
// @route   POST /api/news/analyze
// @access  Private (or Public depending on who submits the news)
export const analyzeNews = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Please provide news content to analyze');
  }

  const prompt = `
    You are an expert financial market analyst. Analyze the following news content and determine if it represents a "major market-impacting event".
    
    News Content:
    "${content}"
    
    Respond STRICTLY with a valid JSON object in the following format (and nothing else):
    {
      "isImpacting": true or false,
      "impactLevel": "High", "Medium", or "Low",
      "title": "A short, punchy alert title (if impacting, else empty string)",
      "description": "A 1-2 sentence summary of the alert and why it matters to the market (if impacting, else empty string)"
    }
  `;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting from the response
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(jsonString);

    if (analysis.isImpacting) {
      // 1. Save alert to the database
      const alert = await Alert.create({
        title: analysis.title,
        description: analysis.description,
        impactLevel: analysis.impactLevel,
        marketImpacting: true,
      });

      // 2. Broadcast alert to all connected clients natively
      const io = req.app.get('io');
      if (io) {
        io.emit('market_alert', alert);
      } else {
        console.warn('Socket.io instance not found on req.app');
      }

      res.status(201).json({
        message: 'Market-impacting event detected. Alert broadcasted.',
        alert,
      });
    } else {
      res.status(200).json({
        message: 'News analyzed. No major market impact detected.',
        analysis,
      });
    }
  } catch (error) {
    console.error('News Analysis Error:', error);
    res.status(500);
    throw new Error('Failed to analyze news content');
  }
});
