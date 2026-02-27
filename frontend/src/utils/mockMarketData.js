export const generateMockChartData = (points = 30, volatility = 0.02, startPrice = 100) => {
  let currentPrice = startPrice;
  const data = [];
  const now = new Date();

  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000); // minute intervals
    
    // Random walk
    const change = currentPrice * volatility * (Math.random() - 0.5);
    currentPrice += change;

    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: Number(currentPrice.toFixed(2))
    });
  }

  const isPositive = data[data.length - 1].price >= data[0].price;
  const changePercent = ((data[data.length - 1].price - data[0].price) / data[0].price) * 100;

  return { data, isPositive, changePercent, currentPrice: Number(currentPrice.toFixed(2)) };
};

export const GLOBAL_INDICES = [
  { symbol: 'SENSEX', name: 'BSE SENSEX', basePrice: 82248.61, vol: 0.005 },
  { symbol: 'NIFTY', name: 'NIFTY 50', basePrice: 25496.55, vol: 0.005 },
  { symbol: 'DOW', name: 'Dow Jones', basePrice: 39521.45, vol: 0.008 },
  { symbol: 'FTSE 100', name: 'FTSE 100', basePrice: 8046.70, vol: 0.006 },
  { symbol: 'Nikkei 225', name: 'Nikkei 225', basePrice: 38753.39, vol: 0.01 },
  { symbol: 'NASDAQ', name: 'NASDAQ Composite', basePrice: 16863.54, vol: 0.012 },
  { symbol: 'S&P 500', name: 'S&P 500', basePrice: 5305.65, vol: 0.01 },
  { symbol: 'DAX', name: 'DAX Performance', basePrice: 18289.02, vol: 0.007 },
  { symbol: 'CAC 40', name: 'CAC 40', basePrice: 8100.25, vol: 0.008 },
  { symbol: 'HANG SENG', name: 'Hang Seng Index', basePrice: 18500.40, vol: 0.015 }
];
