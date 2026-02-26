/**
 * Calculates portfolio risk based on diversification (number of unique stocks)
 * and concentration (highest single stock allocation).
 *
 * @param {Array} holdings - Array of objects containing { stockSymbol, quantity, averagePrice }
 * @returns {String} 'Low', 'Medium', or 'High'
 */
export const calculateRisk = (holdings) => {
  if (!holdings || holdings.length === 0) {
    return 'Low'; // Empty portfolio has no market risk
  }

  const numUniqueStocks = holdings.length;

  // Calculate total portfolio value
  const totalValue = holdings.reduce(
    (sum, holding) => sum + holding.quantity * holding.averagePrice,
    0
  );

  if (totalValue === 0) return 'Low';

  // Find the highest concentration in a single stock
  let maxAllocationPercentage = 0;
  for (const holding of holdings) {
    const value = holding.quantity * holding.averagePrice;
    const percentage = value / totalValue;
    if (percentage > maxAllocationPercentage) {
      maxAllocationPercentage = percentage;
    }
  }

  // Risk logic rules:
  // High Risk: Holding 1-2 stocks OR > 60% in a single stock
  // Medium Risk: Holding 3-5 stocks AND no single stock > 40%
  // Low Risk: Holding 6+ stocks AND no single stock > 20%

  if (numUniqueStocks <= 2 || maxAllocationPercentage > 0.6) {
    return 'High';
  } else if (numUniqueStocks >= 6 && maxAllocationPercentage <= 0.2) {
    return 'Low';
  } else {
    // Everything in between falls to Medium risk
    return 'Medium';
  }
};
