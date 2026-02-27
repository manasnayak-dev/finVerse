import asyncHandler from '../middlewares/asyncHandler.js';
import { getGeminiModel } from '../config/aiConfig.js';
import { getCurrentPrice } from '../services/marketService.js';

// @desc    Analyze portfolio risk and diversification
// @route   POST /api/portfolio/analyze
// @access  Private
export const analyzePortfolio = asyncHandler(async (req, res) => {
  const { stocks } = req.body;

  if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of stocks');
  }

  const isDemo = req.user.activeAccountType === 'demo';

  let evaluatedStocks = stocks;

  if (!isDemo) {
    try {
      // Recalculate portfolio value using real-time prices
      evaluatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const livePrice = await getCurrentPrice(stock.symbol);
            // Reconstruct the evaluation value based on live price
            // Assume the passed 'amount' is actually derived from quantity in the frontend,
            // or we just pass the live price to the AI so it knows the current valuation.
            return {
              symbol: stock.symbol,
              currentMarketPrice: livePrice,
              originalAmount: stock.amount,
              estimatedLiveValue: stock.amount // the frontend passes total value, so AI can just use market context
            };
          } catch (err) {
            console.warn(`Could not fetch live price for ${stock.symbol} during analysis`);
            return stock;
          }
        })
      );
    } catch (error) {
      console.error('Error fetching live prices for portfolio analysis:', error);
    }
  }

  const prompt = `
    You are an expert financial analyst AI.
    Analyze the following portfolio: ${JSON.stringify(evaluatedStocks)}
    
    You must respond ONLY with a valid JSON object matching this exact structure, with no markdown formatting or backticks:
    {
      "riskLevel": "Low" | "Medium" | "High",
      "diversificationScore": <number from 0 to 100>,
      "suggestions": "A short, concise paragraph suggesting improvements or confirming strategy."
    }
  `;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const analysis = JSON.parse(text);
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Portfolio Analysis Error:', error);
    if (error.status === 429 || error.message?.includes('Quota') || error.message?.includes('Rate')) {
      return res.status(200).json({
        riskLevel: "Medium",
        diversificationScore: 65,
        suggestions: "AI Quota Reached. This is a simulated response. Consider diversifying across multiple sectors to lower overall volatility."
      });
    }
    res.status(500);
    throw new Error('Failed to analyze portfolio');
  }
});

// @desc    Create a new Systematic Investment Plan (SIP)
// @route   POST /api/portfolio/sip
// @access  Private
export const createSIP = asyncHandler(async (req, res) => {
  const { symbol, amount, dateOfMonth } = req.body;
  const user = req.user;

  if (!symbol || !amount || !dateOfMonth) {
    res.status(400);
    throw new Error('Please provide symbol, amount, and execution date');
  }

  // Create a unique SIP ID
  const sipId = `SIP-${Date.now()}`;
  
  const newSIP = {
    id: sipId,
    symbol: symbol.toUpperCase(),
    amount: Number(amount),
    dateOfMonth: Number(dateOfMonth), // 1 - 28
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    nextExecutionDate: calculateNextExecutionDate(Number(dateOfMonth))
  };

  user.activeSIPs.push(newSIP);
  await user.save();

  res.status(201).json({ message: 'SIP created successfully', sip: newSIP });
});

// @desc    Get all active SIPs for the user
// @route   GET /api/portfolio/sip
// @access  Private
export const getSIPs = asyncHandler(async (req, res) => {
  res.status(200).json(req.user.activeSIPs || []);
});

// @desc    Cancel an active SIP
// @route   DELETE /api/portfolio/sip/:id
// @access  Private
export const cancelSIP = asyncHandler(async (req, res) => {
  const user = req.user;
  const sipId = req.params.id;

  if (!user.activeSIPs || user.activeSIPs.length === 0) {
    res.status(404);
    throw new Error('No active SIPs found');
  }

  const initialLength = user.activeSIPs.length;
  user.activeSIPs = user.activeSIPs.filter(sip => sip.id !== sipId);

  if (user.activeSIPs.length === initialLength) {
    res.status(404);
    throw new Error('SIP not found');
  }

  await user.save();
  res.status(200).json({ message: 'SIP cancelled successfully' });
});

// Helper function to calculate the next execution date
const calculateNextExecutionDate = (targetDate) => {
  const date = new Date();
  const currentDay = date.getDate();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  let executionMonth = currentMonth;
  let executionYear = currentYear;

  // If the target date has already passed this month, schedule for next month
  if (currentDay > targetDate) {
    executionMonth++;
    if (executionMonth > 11) {
      executionMonth = 0;
      executionYear++;
    }
  }

  // Handle months with fewer days (e.g., Feb 28/29)
  const daysInNextMonth = new Date(executionYear, executionMonth + 1, 0).getDate();
  const finalDate = targetDate > daysInNextMonth ? daysInNextMonth : targetDate;

  return new Date(executionYear, executionMonth, finalDate).toISOString();
};
