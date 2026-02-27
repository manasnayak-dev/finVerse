import asyncHandler from '../middlewares/asyncHandler.js';
import { getGeminiModel } from '../config/aiConfig.js';
import Alert from '../models/alertModel.js';
import { getLiveNews } from '../services/marketService.js';

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

// @desc    Get latest news sentiment
// @route   GET /api/news/sentiment
// @access  Private
export const getSentiment = asyncHandler(async (req, res) => {
  const isDemo = req.user.activeAccountType === 'demo';

  // If Real Mode, attempt to fetch live news. If it fails, silently fall through to mock data.
  if (!isDemo) {
    try {
      const headlines = await getLiveNews();
      const prompt = `
        You are a financial AI analyzing the latest market headlines.
        Headlines:
        ${headlines}

        Return strictly a JSON array (no markdown, no backticks) with exactly 4 to 5 objects representing the top stories.
        Each object must match:
        {
          "headline": "String - the exact or slightly summarized news headline",
          "sentiment": "Positive" | "Negative" | "Neutral",
          "confidence": number between 0.0 and 1.0 representing your confidence in this sentiment
        }
      `;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      const text = (await result.response).text().replace(/```json/g, '').replace(/```/g, '').trim();
      const liveNewsSentiment = JSON.parse(text);

      return res.status(200).json(liveNewsSentiment);
    } catch (error) {
      // Live news fetch failed (missing API key, rate limit, parse error etc.)
      // Log the warning and fall through to high-quality mock data below
      console.warn('Live news sentiment failed, falling back to mock data:', error.message);
    }
  }

  // Mock data — used for Demo Mode OR when live news is unavailable
  const mockNews = [
    { headline: "Federal Reserve Holds Interest Rates Steady Amid Mixed Economic Signals", sentiment: "Neutral", confidence: 0.87 },
    { headline: "US Tech Stocks Rally on Strong Q4 Earnings Reports", sentiment: "Positive", confidence: 0.92 },
    { headline: "Oil Prices Drop as OPEC Signals Production Increase", sentiment: "Negative", confidence: 0.84 },
    { headline: "India's GDP Growth Beats Forecasts at 7.2% for FY2025", sentiment: "Positive", confidence: 0.90 },
    { headline: "Global Supply Chain Disruptions Ease but Inflation Remains Elevated", sentiment: "Neutral", confidence: 0.78 },
  ];

  res.status(200).json(mockNews);
});
