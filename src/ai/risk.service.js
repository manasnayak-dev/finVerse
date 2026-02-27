/**
 * risk.service.js
 * ─────────────────────────────────────────────────────────────────────
 * Calculates a risk score (0–100) for a stock based on:
 *   - Volatility  (standard deviation of daily returns)
 *   - Drawdown    (max peak-to-trough drop)
 *   - Momentum    (recent trend slope steepness)
 *   - Sentiment   (negative sentiment amplifies risk)
 */

/**
 * Compute daily returns array from a prices array.
 */
const dailyReturns = (prices) =>
  prices.slice(1).map((p, i) => (p - prices[i]) / (prices[i] || 1));

/**
 * Standard deviation of an array.
 */
const stddev = (arr) => {
  const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
  const variance = arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
};

/**
 * Maximum drawdown (as a positive percentage).
 */
const maxDrawdown = (prices) => {
  let peak = prices[0];
  let dd = 0;
  for (const p of prices) {
    if (p > peak) peak = p;
    const drawdown = (peak - p) / peak;
    if (drawdown > dd) dd = drawdown;
  }
  return dd;
};

/**
 * Linear trend slope via least-squares regression (normalised per price).
 */
const trendSlope = (prices) => {
  const n = prices.length;
  const xMean = (n - 1) / 2;
  const yMean = prices.reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0;
  prices.forEach((p, i) => {
    num += (i - xMean) * (p - yMean);
    den += Math.pow(i - xMean, 2);
  });
  const slope = den ? num / den : 0;
  return Math.abs(slope / (yMean || 1)); // normalise by price level
};

/**
 * Calculate a risk score 0–100 and a risk level label.
 * @param {number[]} prices   - Array of 7–14 closing prices (oldest → newest)
 * @param {number}   sentiment - Sentiment score (-1 to 1)
 * @returns {{ score: number, level: string, factors: Object }}
 */
export const calculateRisk = (prices, sentiment = 0) => {
  if (!prices || prices.length < 2) {
    return { score: 50, level: 'Medium', factors: {} };
  }

  const returns       = dailyReturns(prices);
  const volatility    = stddev(returns) * 100;         // % daily vol
  const dd            = maxDrawdown(prices) * 100;     // % drawdown
  const slope         = trendSlope(prices) * 100;      // normalised slope
  const sentimentRisk = (-sentiment + 1) * 25;         // 0 (bullish) → 50 (bearish)

  // Weight each factor
  const volScore  = Math.min(100, volatility * 15);   // high vol = high risk
  const ddScore   = Math.min(100, dd * 3);
  const slopeRisk = Math.min(100, slope * 20);        // steep moves = risk
  const raw       = volScore * 0.35 + ddScore * 0.30 + slopeRisk * 0.15 + sentimentRisk * 0.20;
  const score     = Math.round(Math.max(0, Math.min(100, raw)));

  const level =
    score >= 75 ? 'Very High' :
    score >= 55 ? 'High'      :
    score >= 35 ? 'Medium'    :
    score >= 15 ? 'Low'       : 'Very Low';

  return {
    score,
    level,
    factors: {
      volatilityScore : Math.round(volScore),
      drawdownScore   : Math.round(ddScore),
      momentumRisk    : Math.round(slopeRisk),
      sentimentRisk   : Math.round(sentimentRisk),
    },
  };
};
