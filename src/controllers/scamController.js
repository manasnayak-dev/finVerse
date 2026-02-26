import asyncHandler from '../middlewares/asyncHandler.js';
import { getGeminiModel } from '../config/aiConfig.js';

// @desc    Analyze a suspicious message for scams
// @route   POST /api/scam/analyze
// @access  Private (or Public, depending on your needs)
export const analyzeScamMessage = asyncHandler(async (req, res) => {
  const { suspiciousText } = req.body;

  if (!suspiciousText) {
    res.status(400);
    throw new Error('Please provide the suspiciousText to analyze');
  }

  // Instruct Gemini to return a structured JSON response
  const prompt = `
    You are an expert cybersecurity analyst specializing in financial scams and social engineering.
    Analyze the following suspicious text.

    Suspicious Text: "${suspiciousText}"

    You MUST respond with a valid JSON object only (no markdown, no backticks, no extra text) with the following strictly typed structure:
    {
      "scamProbability": Number (0-100 indicating how likely it is a scam),
      "riskLevel": String ("Low", "Medium", or "High"),
      "explanation": String (Detailed reasoning of why it might be a scam or not),
      "safetyTips": Array of Strings (Practical tips for the user)
    }
  `;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Attempt to extract pure JSON from the AI response
    let text = response.text().trim();
    
    // Clean up potential markdown blocks if the AI ignores instructions
    if (text.startsWith('\`\`\`json')) {
      text = text.substring(7);
    } else if (text.startsWith('\`\`\`')) {
      text = text.substring(3);
    }
    if (text.endsWith('\`\`\`')) {
      text = text.slice(0, -3);
    }
    
    text = text.trim();

    // Parse AI response to ensure it matches requirement
    const analysisData = JSON.parse(text);

    // Provide default fallback if keys are missing from AI
    res.status(200).json({
      scamProbability: analysisData.scamProbability || 0,
      riskLevel: analysisData.riskLevel || 'Unknown',
      explanation: analysisData.explanation || 'Could not parse explanation.',
      safetyTips: analysisData.safetyTips || [],
    });
  } catch (error) {
    console.error('AI Scam Analysis Error:', error);
    res.status(500);
    throw new Error('Failed to analyze the message for scams.');
  }
});
