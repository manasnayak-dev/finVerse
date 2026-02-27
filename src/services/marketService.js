import axios from 'axios';

// Cache objects to avoid hitting rate limits on free APIs too frequently
const stockCache = {};
const CACHE_TTL = 60 * 1000; // 1 minute

export const getCurrentPrice = async (symbol) => {
  const apiKey = process.env.STOCK_API_KEY;

  if (!apiKey || apiKey === 'your_stock_api_key_here') {
    throw new Error('STOCK_API_KEY is missing or invalid in .env configuration.');
  }

  // Check cache first
  const cached = stockCache[symbol];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price;
  }

  try {
    // Using Finnhub as an example, or Alpha Vantage.
    // Let's use Finnhub format for simplicity: /quote?symbol=AAPL&token=...
    // You can easily swap this to Alpha Vantage or another provider.
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${apiKey}`;
    
    const response = await axios.get(url);
    const data = response.data;

    // Finnhub returns 'c' for current price. If it's 0, symbol might be invalid.
    if (!data || data.c === undefined || data.c === 0) {
      throw new Error(`Failed to fetch live price for ${symbol}. Invalid symbol or API error.`);
    }

    const currentPrice = data.c;

    // Update cache
    stockCache[symbol] = {
      price: currentPrice,
      timestamp: Date.now()
    };

    return currentPrice;
  } catch (error) {
    console.error(`Error fetching live price for ${symbol}:`, error.message);
    throw new Error(`Live market data unavailable for ${symbol}. ${error.response?.data?.error || error.message}`);
  }
};

export const getLiveNews = async () => {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey || apiKey === 'your_news_api_key_here') {
    throw new Error('NEWS_API_KEY is missing or invalid in .env configuration.');
  }

  try {
    // Using NewsAPI as an example: /v2/top-headlines?category=business
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${apiKey}`;
    
    const response = await axios.get(url);
    const articles = response.data.articles || [];

    // Return the top 5 headlines wrapped in a single text block
    const headlines = articles.slice(0, 5).map(a => a.title).join('\n- ');
    return headlines;
  } catch (error) {
    console.error(`Error fetching live news:`, error.message);
    throw new Error(`Live news data unavailable. ${error.response?.data?.message || error.message}`);
  }
};
