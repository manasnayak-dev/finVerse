/**
 * sentiment.service.js
 * ─────────────────────────────────────────────────────────────────────
 * Analyses sentiment from news headlines using Gemini AI.
 * Returns a numeric score between -1.0 (very bearish) and +1.0 (very bullish).
 */

import { getGeminiModel } from '../config/aiConfig.js';

// Keyword-based fast fallback (used if Gemini is unavailable)
const POSITIVE_KEYWORDS = ['surge', 'rally', 'profit', 'growth', 'beat', 'acquisition',
  'all-time high', 'record', 'upgrade', 'bullish', 'expansion', 'recovery'];
const NEGATIVE_KEYWORDS = ['crash', 'decline', 'loss', 'bearish', 'downgrade', 'recession',
  'sell-off', 'default', 'crisis', 'miss', 'correction', 'layoff', 'sanctions'];

const keywordSentiment = (headlines) => {
  let score = 0;
  const text = headlines.join(' ').toLowerCase();
  POSITIVE_KEYWORDS.forEach(kw => { if (text.includes(kw)) score += 0.12; });
  NEGATIVE_KEYWORDS.forEach(kw => { if (text.includes(kw)) score -= 0.12; });
  return Math.max(-1, Math.min(1, score));
};

/**
 * Analyse sentiment of news headlines for a given stock symbol.
 * @param {string} symbol  - Ticker symbol (e.g. 'AAPL')
 * @param {string[]} headlines - Array of recent news headlines
 * @returns {{ score: number, label: string, breakdown: string }}
 */
export const analyseSentiment = async (symbol, headlines = []) => {
  if (!headlines.length) {
    return { score: 0, label: 'Neutral', breakdown: 'No headlines provided.' };
  }

  try {
    const model = getGeminiModel();
    const prompt = `
You are a financial sentiment analyst. Analyse the following recent news headlines for ${symbol}.

Headlines:
${headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Respond in strict JSON with:
{
  "score": <number between -1.0 (very bearish) and 1.0 (very bullish)>,
  "label": "<Very Bearish | Bearish | Neutral | Bullish | Very Bullish>",
  "breakdown": "<1-2 sentence summary of the dominant sentiment trend>"
}
Return ONLY the JSON. No extra text.`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    return {
      score: Math.max(-1, Math.min(1, Number(parsed.score) || 0)),
      label: parsed.label || 'Neutral',
      breakdown: parsed.breakdown || '',
    };
  } catch {
    // Fallback to keyword analysis
    const score = keywordSentiment(headlines);
    const label = score > 0.3 ? 'Bullish' : score < -0.3 ? 'Bearish' : 'Neutral';
    return { score, label, breakdown: 'Keyword-based analysis (Gemini unavailable).' };
  }
};
