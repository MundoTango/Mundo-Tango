/**
 * Financial System Test Fixtures
 * Sample data for financial management testing
 */

export const testPortfolios = [
  {
    name: 'Test Growth Portfolio',
    description: 'Aggressive growth strategy portfolio',
    initialCash: 50000,
    allocation: {
      stocks: 60,
      crypto: 30,
      cash: 10,
    },
  },
  {
    name: 'Test Conservative Portfolio',
    description: 'Conservative income-focused portfolio',
    initialCash: 100000,
    allocation: {
      stocks: 40,
      bonds: 50,
      cash: 10,
    },
  },
];

export const testTrades = [
  {
    symbol: 'AAPL',
    type: 'buy' as const,
    quantity: 10,
    price: 150.00,
  },
  {
    symbol: 'BTC',
    type: 'buy' as const,
    quantity: 0.5,
    price: 45000.00,
  },
  {
    symbol: 'TSLA',
    type: 'buy' as const,
    quantity: 5,
    price: 250.00,
  },
  {
    symbol: 'SPY',
    type: 'sell' as const,
    quantity: 20,
    price: 420.00,
  },
];

export const testAssets = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    currentPrice: 150.00,
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    currentPrice: 45000.00,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    type: 'stock',
    currentPrice: 250.00,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    currentPrice: 3000.00,
  },
];

export const aiAgentDecisions = [
  {
    id: 'decision-1',
    strategy: 'Mean Reversion',
    symbol: 'AAPL',
    action: 'buy',
    quantity: 10,
    confidence: 0.85,
    risk: 'medium',
    reasoning: 'Stock price is 2 standard deviations below 50-day moving average, indicating oversold condition',
  },
  {
    id: 'decision-2',
    strategy: 'Momentum',
    symbol: 'BTC',
    action: 'sell',
    quantity: 0.2,
    confidence: 0.78,
    risk: 'high',
    reasoning: 'RSI above 70 indicating overbought conditions, take partial profits',
  },
];

export const riskMetrics = {
  maxDrawdown: -12.5,
  volatility: 18.3,
  beta: 1.15,
  sharpeRatio: 1.8,
  sortinoRatio: 2.1,
  var95: -5.2,
};

export const accountConnections = [
  {
    provider: 'coinbase',
    name: 'Coinbase Pro',
    type: 'crypto',
  },
  {
    provider: 'schwab',
    name: 'Charles Schwab',
    type: 'stocks',
  },
  {
    provider: 'mercury',
    name: 'Mercury Bank',
    type: 'business',
  },
];
