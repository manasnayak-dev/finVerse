/**
 * prediction.service.js
 * ─────────────────────────────────────────────────────────────────────
 * Core time-series trend analysis engine.
 *
 * Responsibilities:
 *   1. Generate synthetic but realistic 7–14 day historical price data
 *      (or accept real prices when provided)
 *   2. Run multi-indicator trend analysis:
 *        - SMA crossover (5d vs 10d)
 *        - EMA trend
 *        - RSI (14d → short window)
 *        - MACD-lite
 *        - Linear regression slope
 *        - Support / Resistance pivot
 *   3. Produce a price target range and direction signal
 */

import { getGeminiModel } from '../config/aiConfig.js';

// ─── Mathematical Utilities ───────────────────────────────────────────────────

/** Simple Moving Average over last n prices. */
const sma = (prices, n) => {
  const slice = prices.slice(-n);
  return slice.reduce((s, p) => s + p, 0) / slice.length;
};

/** Exponential Moving Average — full series, returns latest EMA value. */
const ema = (prices, period) => {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
};

/** RSI over specified period (default 7 for short data windows). */
const rsi = (prices, period = 7) => {
  if (prices.length < period + 1) return 50;
  const returns = prices.slice(-period - 1).slice(1).map((p, i) => p - prices.slice(-period - 1)[i]);
  const gains = returns.filter(r => r > 0);
  const losses = returns.filter(r => r < 0).map(Math.abs);
  const avgGain = gains.length ? gains.reduce((s, v) => s + v, 0) / period : 0;
  const avgLoss = losses.length ? losses.reduce((s, v) => s + v, 0) / period : 0;
  if (!avgLoss) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

/** MACD-lite: difference between 3-day EMA and 6-day EMA (scaled for short windows). */
const macdLite = (prices) => {
  if (prices.length < 6) return 0;
  return ema(prices, 3) - ema(prices, 6);
};

/** Linear regression slope (change per day, normalised by latest price). */
const linearSlope = (prices) => {
  const n = prices.length;
  const xMean = (n - 1) / 2;
  const yMean = prices.reduce((s, p) => s + p, 0) / n;
  let SSxy = 0, SSxx = 0;
  prices.forEach((p, i) => {
    SSxy += (i - xMean) * (p - yMean);
    SSxx += Math.pow(i - xMean, 2);
  });
  const slope = SSxx ? SSxy / SSxx : 0;
  return slope / (prices[prices.length - 1] || 1); // normalise
};

/** Support and resistance from min/max of the window. */
const supportResistance = (prices) => ({
  support:    Math.min(...prices),
  resistance: Math.max(...prices),
});

// ─── Synthetic Price Generator (fallback when no real data) ──────────────────

/**
 * Generates realistic random walk prices using geometric Brownian motion.
 * @param {number} basePrice - Starting price
 * @param {number} days      - Number of days (7–14)
 * @param {number} drift     - Daily drift (positive = slight uptrend)
 * @param {number} sigma     - Daily volatility (e.g. 0.015 = 1.5%)
 */
export const generateHistoricalPrices = (basePrice, days = 10, drift = 0.001, sigma = 0.018) => {
  const prices = [basePrice];
  for (let i = 1; i < days; i++) {
    const shock = (Math.random() - 0.5) * 2 * sigma;
    prices.push(prices[i - 1] * (1 + drift + shock));
  }
  return prices.map(p => Math.round(p * 100) / 100);
};

// ─── Mock Yahoo-Finance Price Fetcher ─────────────────────────────────────────

const MOCK_BASE_PRICES = {
  AAPL:     182.50,  GOOGL:     141.80,  MSFT:     415.70,
  TSLA:     175.20,  AMZN:      185.30,  META:     500.40,
  RELIANCE: 2940.50, TCS:      3720.00,  INFY:     1560.00,
  HDFCBANK: 1620.80, NIFTY:   25496.55,  SENSEX: 83721.18,
  NVDA:     875.50,  AMD:       175.40,  SBIN:     810.30,
};

/**
 * Fetch (or simulate) 7–14 days of historical closing prices.
 * In production you would replace this with a real data provider call.
 */
export const fetchHistoricalPrices = async (symbol, days = 10) => {
  const base = MOCK_BASE_PRICES[symbol.toUpperCase()] || 150;
  // Simulate slight volatility difference per symbol
  const sigma  = symbol.length > 5 ? 0.012 : 0.020;
  const drift  = Math.random() > 0.5 ? 0.002 : -0.001;
  return generateHistoricalPrices(base, Math.max(7, Math.min(14, days)), drift, sigma);
};

// ─── Core Trend Analysis ──────────────────────────────────────────────────────

/**
 * Analyses a price series using multiple indicators.
 * @param {number[]} prices  - Array (oldest → newest), length 7–14
 * @returns {Object} analysisResult
 */
export const analyseTrend = (prices) => {
  const last  = prices[prices.length - 1];
  const first = prices[0];

  const sma5    = prices.length >= 5  ? sma(prices, 5)  : last;
  const sma10   = prices.length >= 10 ? sma(prices, 10) : sma(prices, prices.length);
  const ema7    = ema(prices, Math.min(7, prices.length));
  const rsiVal  = rsi(prices, Math.min(7, prices.length - 1));
  const macd    = macdLite(prices);
  const slope   = linearSlope(prices);
  const { support, resistance } = supportResistance(prices);

  // Scoring system: each indicator votes bullish (+1) or bearish (-1)
  let bullishVotes = 0;
  let bearishVotes = 0;

  if (sma5 > sma10)         { bullishVotes += 2; } else { bearishVotes += 2; }  // SMA crossover (weighted)
  if (last > ema7)           { bullishVotes++;    } else { bearishVotes++;    }  // Price vs EMA
  if (rsiVal < 35)           { bullishVotes++;    }                              // Oversold → potential bounce
  if (rsiVal > 65)           { bearishVotes++;    }                              // Overbought → potential pullback
  if (macd > 0)              { bullishVotes++;    } else { bearishVotes++;    }  // MACD signal
  if (slope > 0.0005)        { bullishVotes++;    } else if (slope < -0.0005) { bearishVotes++; }

  const totalVotes = bullishVotes + bearishVotes;
  const bullishPct = totalVotes ? (bullishVotes / totalVotes) * 100 : 50;

  const direction =
    bullishPct >= 60 ? 'BULLISH' :
    bullishPct <= 40 ? 'BEARISH' : 'NEUTRAL';

  // 7-day price target (simple linear extrapolation + sentiment nudge)
  const dailyChange = (last - first) / (prices.length - 1 || 1);
  const target7d    = last + dailyChange * 7;
  const targetHigh  = target7d * 1.025;
  const targetLow   = target7d * 0.975;

  return {
    direction,
    bullishPct: Math.round(bullishPct),
    bearishPct: Math.round(100 - bullishPct),
    indicators: {
      sma5:        Math.round(sma5 * 100) / 100,
      sma10:       Math.round(sma10 * 100) / 100,
      ema7:        Math.round(ema7 * 100) / 100,
      rsi:         Math.round(rsiVal),
      macd:        Math.round(macd * 1000) / 1000,
      linearSlope: Math.round(slope * 10000) / 10000,
    },
    priceRange: {
      current:    last,
      target7d:   Math.round(target7d * 100) / 100,
      targetHigh: Math.round(targetHigh * 100) / 100,
      targetLow:  Math.round(targetLow * 100) / 100,
      changePercent: Math.round(((target7d - last) / last) * 10000) / 100,
    },
    support:    Math.round(support * 100) / 100,
    resistance: Math.round(resistance * 100) / 100,
  };
};

// ─── Gemini AI Summary Generator ─────────────────────────────────────────────

/**
 * Generates a plain-English AI analyst summary using Gemini.
 */
export const generateAISummary = async (symbol, trendData, sentiment, risk, confidence) => {
  try {
    const model = getGeminiModel();
    const prompt = `
You are a professional quant analyst generating a short-term stock outlook. Be concise and probabilistic (not financial advice).

Symbol: ${symbol}
Direction Signal: ${trendData.direction} (${trendData.bullishPct}% bullish indicators)
RSI: ${trendData.indicators.rsi} | MACD: ${trendData.indicators.macd > 0 ? 'Positive' : 'Negative'}
Sentiment: ${sentiment.label} (${sentiment.score.toFixed(2)})
7-Day Price Target: $${trendData.priceRange.target7d} (${trendData.priceRange.changePercent > 0 ? '+' : ''}${trendData.priceRange.changePercent}%)
Risk Level: ${risk.level} (${risk.score}/100)
Confidence: ${confidence.score}% (Grade ${confidence.grade})

Write a 2–3 sentence probabilistic analyst summary. Reference specific indicators. End with a disclaimer that this is AI-generated probabilistic guidance, not financial advice. Keep it under 80 words.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return `${trendData.direction} signal detected for ${symbol} with ${confidence.score}% confidence. ` +
      `RSI at ${trendData.indicators.rsi} and ${sentiment.label.toLowerCase()} sentiment suggest ` +
      `a 7-day target of $${trendData.priceRange.target7d}. ⚠️ This is AI-generated probabilistic guidance, not financial advice.`;
  }
};
