/**
 * confidence.service.js
 * ─────────────────────────────────────────────────────────────────────
 * Calculates a prediction confidence score (0–100%) based on:
 *   - Data quality     (number of data points available)
 *   - Signal strength  (how decisive the trend is)
 *   - Sentiment alignment (sentiment agrees with trend direction)
 *   - Volatility penalty (noisy data reduces confidence)
 *   - Trend consistency (price moves in a consistent direction)
 */

/**
 * Pearson R² of prices vs a linear time axis — measures how well
 * price follows a straight line trend (1 = perfect linear, 0 = chaotic).
 */
const linearR2 = (prices) => {
  const n = prices.length;
  if (n < 3) return 0;
  const xs = prices.map((_, i) => i);
  const xMean = (n - 1) / 2;
  const yMean = prices.reduce((s, p) => s + p, 0) / n;
  let SSxy = 0, SSxx = 0, SSyy = 0;
  prices.forEach((p, i) => {
    SSxy += (i - xMean) * (p - yMean);
    SSxx += Math.pow(i - xMean, 2);
    SSyy += Math.pow(p - yMean, 2);
  });
  if (!SSxx || !SSyy) return 0;
  return Math.pow(SSxy / Math.sqrt(SSxx * SSyy), 2);
};

/**
 * Fraction of consecutive same-direction daily moves.
 */
const trendConsistency = (prices) => {
  const returns = prices.slice(1).map((p, i) => p - prices[i]);
  let consistent = 0;
  for (let i = 1; i < returns.length; i++) {
    if (Math.sign(returns[i]) === Math.sign(returns[i - 1])) consistent++;
  }
  return returns.length > 1 ? consistent / (returns.length - 1) : 0;
};

/**
 * Calculates confidence score and grade.
 * @param {number[]} prices      - Historical prices (oldest → newest)
 * @param {number}   sentiment   - Sentiment score (-1 to 1)
 * @param {string}   direction   - Predicted direction ('BULLISH'|'BEARISH'|'NEUTRAL')
 * @param {number}   riskScore   - Risk score 0–100 (higher risk = lower confidence)
 * @returns {{ score: number, grade: string, explanation: string }}
 */
export const calculateConfidence = (prices, sentiment, direction, riskScore) => {
  if (!prices || prices.length < 2) {
    return { score: 30, grade: 'D', explanation: 'Insufficient data for confidence analysis.' };
  }

  // 1. Data quality: more days = better (max 14 days normalised to 100)
  const dataQuality = Math.min(100, (prices.length / 14) * 100);

  // 2. Linear trend strength (R² × 100)
  const trendR2 = linearR2(prices) * 100;

  // 3. Trend consistency score
  const consistency = trendConsistency(prices) * 100;

  // 4. Sentiment alignment: does sentiment agree with the predicted direction?
  const sentimentAligned =
    (direction === 'BULLISH' && sentiment > 0.05) ? Math.min(100, sentiment * 80 + 20) :
    (direction === 'BEARISH' && sentiment < -0.05) ? Math.min(100, -sentiment * 80 + 20) :
    direction === 'NEUTRAL' ? 50 : 20;

  // 5. Volatility (risk) penalty: high risk lowers confidence
  const riskPenalty = riskScore * 0.35;

  // Weighted composite
  const raw =
    dataQuality     * 0.20 +
    trendR2         * 0.30 +
    consistency     * 0.20 +
    sentimentAligned * 0.25 +
    (100 - riskPenalty) * 0.05;

  const score = Math.round(Math.max(5, Math.min(95, raw)));

  const grade =
    score >= 80 ? 'A' :
    score >= 65 ? 'B' :
    score >= 50 ? 'C' :
    score >= 35 ? 'D' : 'F';

  const explanation =
    score >= 80 ? 'Strong signal — high data quality, consistent trend, aligned sentiment.' :
    score >= 65 ? 'Good signal — most indicators align but some noise present.'  :
    score >= 50 ? 'Moderate signal — mixed indicators, use with additional analysis.' :
    score >= 35 ? 'Weak signal — low consistency or data quality.' :
                  'Very weak signal — insufficient or contradictory data.';

  return { score, grade, explanation };
};
