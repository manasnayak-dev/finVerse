import asyncHandler from '../middlewares/asyncHandler.js';
import { getGeminiModel } from '../config/aiConfig.js';

// @desc    Chat directly with AI
// @route   POST /api/ai/chat
// @access  Private
export const chatWithAI = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Please provide a message');
  }

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500);
    throw new Error('Failed to generate AI response');
  }
});

// @desc    Explain a stock prediction
// @route   POST /api/ai/explain
// @access  Private
export const explainPrediction = asyncHandler(async (req, res) => {
  const { stockData, prediction } = req.body;

  if (!stockData || !prediction) {
    res.status(400);
    throw new Error('Please provide stockData and prediction');
  }

  const prompt = `
    You are an expert financial analyst. Please explain the following stock prediction in clear, simple terms.
    
    Stock Data provided: ${JSON.stringify(stockData)}
    AI Prediction: ${prediction}
    
    Explain why this prediction might make sense based on the provided data and market logic. Keep it concise.
  `;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ explanation: text });
  } catch (error) {
    console.error('AI Explain Error:', error);
    res.status(500);
    throw new Error('Failed to explain prediction');
  }
});

// @desc    Generate an investment strategy based on portfolio summary
// @route   POST /api/ai/strategy
// @access  Private
export const generateStrategy = asyncHandler(async (req, res) => {
  const { portfolioSummary } = req.body;

  if (!portfolioSummary) {
    res.status(400);
    throw new Error('Please provide a portfolioSummary');
  }

  const prompt = `
    You are a professional wealth manager and financial advisor.
    The user has the following portfolio summary:
    
    ${JSON.stringify(portfolioSummary)}
    
    Please suggest a high-level investment strategy for them based on this summary. 
    Mention diversification, risk management, and any obvious portfolio rebalancing they might need to do.
  `;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ strategy: text });
  } catch (error) {
    console.error('AI Strategy Error:', error);
    res.status(500);
    throw new Error('Failed to generate investment strategy');
  }
});
