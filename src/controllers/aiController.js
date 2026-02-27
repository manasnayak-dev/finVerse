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
    const isDemo = req.user?.activeAccountType === 'demo';
    const balance = isDemo ? req.user?.demoBalance : req.user?.realBalance;
    const portfolio = isDemo ? req.user?.demoPortfolio : req.user?.realPortfolio;
    
    const contextPrompt = `
      You are an expert financial advisor for the FinVerse platform.
      The user is currently using a ${isDemo ? 'SIMULATED DEMO' : 'LIVE REAL'} account.
      Their current balance is $${balance}.
      Their current portfolio holdings are: ${JSON.stringify(portfolio)}.
      
      User Message: "${message}"
      
      Provide a helpful, precise reply. Do not use markdown blocks for standard conversation unless showing code.
    `;

    const model = getGeminiModel();
    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Defensive Check for Rate Limits (429) & Quota Issues
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota')) {
      const isDemo = req.user?.activeAccountType === 'demo';
      const balance = isDemo ? req.user?.demoBalance : req.user?.realBalance;
      
      return res.status(200).json({ 
        response: `⚠️ **[API Rate Limit Reached]**\n\nThe Google Gemini Live API is currently experiencing unusually high demand and your free tier quota is temporarily exhausted.\n\nHowever, I can still see you are in **${isDemo ? 'Demo Mode' : 'Real Accounts Mode'}** and your active balance is **$${balance?.toLocaleString()}**.\n\nPlease try again in a few minutes when the API quota resets!`
      });
    }

    res.status(500);
    throw new Error(`Failed to generate AI response: ${error.message}`);
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
