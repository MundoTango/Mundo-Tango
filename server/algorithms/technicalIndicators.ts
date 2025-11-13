/**
 * TECHNICAL INDICATORS LIBRARY
 * Used by Market Intelligence Agents (#81-85)
 * RSI, MACD, Bollinger Bands, Moving Averages, Volume Indicators
 */

export interface PriceData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RSIResult {
  value: number;
  signal: 'oversold' | 'neutral' | 'overbought';
  strength: number; // 0-100
}

export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export interface BollingerBandsResult {
  upper: number;
  middle: number; // SMA
  lower: number;
  bandwidth: number; // (upper - lower) / middle
  percentB: number; // (price - lower) / (upper - lower)
  signal: 'overbought' | 'neutral' | 'oversold';
}

/**
 * RELATIVE STRENGTH INDEX (RSI)
 * Measures momentum and identifies overbought/oversold conditions
 */
export function calculateRSI(prices: number[], period: number = 14): RSIResult {
  if (prices.length < period + 1) {
    return { value: 50, signal: 'neutral', strength: 50 };
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  let signal: 'oversold' | 'neutral' | 'overbought';
  if (rsi < 30) signal = 'oversold';
  else if (rsi > 70) signal = 'overbought';
  else signal = 'neutral';

  return {
    value: rsi,
    signal,
    strength: rsi
  };
}

/**
 * MOVING AVERAGE CONVERGENCE DIVERGENCE (MACD)
 * Trend-following momentum indicator
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  if (prices.length < slowPeriod + signalPeriod) {
    return { macd: 0, signal: 0, histogram: 0, trend: 'neutral' };
  }

  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  const macdLine = fastEMA[fastEMA.length - 1] - slowEMA[slowEMA.length - 1];
  
  const macdHistory: number[] = [];
  for (let i = 0; i < Math.min(fastEMA.length, slowEMA.length); i++) {
    macdHistory.push(fastEMA[i] - slowEMA[i]);
  }
  
  const signalEMA = calculateEMA(macdHistory, signalPeriod);
  const signalLine = signalEMA[signalEMA.length - 1];
  
  const histogram = macdLine - signalLine;

  let trend: 'bullish' | 'bearish' | 'neutral';
  if (histogram > 0 && macdLine > signalLine) trend = 'bullish';
  else if (histogram < 0 && macdLine < signalLine) trend = 'bearish';
  else trend = 'neutral';

  return {
    macd: macdLine,
    signal: signalLine,
    histogram,
    trend
  };
}

/**
 * BOLLINGER BANDS
 * Volatility indicator using standard deviations
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): BollingerBandsResult {
  if (prices.length < period) {
    return {
      upper: prices[prices.length - 1],
      middle: prices[prices.length - 1],
      lower: prices[prices.length - 1],
      bandwidth: 0,
      percentB: 0.5,
      signal: 'neutral'
    };
  }

  const sma = calculateSMA(prices, period);
  const middle = sma[sma.length - 1];
  
  const recentPrices = prices.slice(-period);
  const variance = recentPrices.reduce((sum, price) => 
    sum + Math.pow(price - middle, 2), 0) / period;
  const standardDeviation = Math.sqrt(variance);

  const upper = middle + (stdDev * standardDeviation);
  const lower = middle - (stdDev * standardDeviation);
  
  const currentPrice = prices[prices.length - 1];
  const bandwidth = (upper - lower) / middle;
  const percentB = (currentPrice - lower) / (upper - lower);

  let signal: 'overbought' | 'neutral' | 'oversold';
  if (percentB > 1) signal = 'overbought';
  else if (percentB < 0) signal = 'oversold';
  else signal = 'neutral';

  return {
    upper,
    middle,
    lower,
    bandwidth,
    percentB,
    signal
  };
}

/**
 * SIMPLE MOVING AVERAGE (SMA)
 */
export function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  
  return sma;
}

/**
 * EXPONENTIAL MOVING AVERAGE (EMA)
 */
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length === 0) return [];
  
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  ema.push(prices[0]);
  
  for (let i = 1; i < prices.length; i++) {
    const currentEMA = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    ema.push(currentEMA);
  }
  
  return ema;
}

/**
 * VOLUME WEIGHTED AVERAGE PRICE (VWAP)
 */
export function calculateVWAP(priceData: PriceData[]): number {
  if (priceData.length === 0) return 0;

  let totalPriceVolume = 0;
  let totalVolume = 0;

  for (const data of priceData) {
    const typicalPrice = (data.high + data.low + data.close) / 3;
    totalPriceVolume += typicalPrice * data.volume;
    totalVolume += data.volume;
  }

  return totalVolume > 0 ? totalPriceVolume / totalVolume : 0;
}

/**
 * AVERAGE TRUE RANGE (ATR)
 * Measures market volatility
 */
export function calculateATR(priceData: PriceData[], period: number = 14): number {
  if (priceData.length < 2) return 0;

  const trueRanges: number[] = [];

  for (let i = 1; i < priceData.length; i++) {
    const high = priceData[i].high;
    const low = priceData[i].low;
    const prevClose = priceData[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );

    trueRanges.push(tr);
  }

  const recentTR = trueRanges.slice(-Math.min(period, trueRanges.length));
  return recentTR.reduce((sum, tr) => sum + tr, 0) / recentTR.length;
}

/**
 * STOCHASTIC OSCILLATOR
 * Momentum indicator comparing closing price to price range
 */
export function calculateStochastic(
  priceData: PriceData[],
  period: number = 14,
  smoothK: number = 3,
  smoothD: number = 3
): { k: number; d: number; signal: 'oversold' | 'neutral' | 'overbought' } {
  if (priceData.length < period) {
    return { k: 50, d: 50, signal: 'neutral' };
  }

  const recentData = priceData.slice(-period);
  const currentClose = priceData[priceData.length - 1].close;
  const highestHigh = Math.max(...recentData.map(d => d.high));
  const lowestLow = Math.min(...recentData.map(d => d.low));

  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  
  const closes = priceData.slice(-period).map(d => d.close);
  const kValues: number[] = [];
  
  for (let i = 0; i < closes.length; i++) {
    const windowData = priceData.slice(Math.max(0, i - period + 1), i + 1);
    const windowHigh = Math.max(...windowData.map(d => d.high));
    const windowLow = Math.min(...windowData.map(d => d.low));
    const windowK = ((closes[i] - windowLow) / (windowHigh - windowLow)) * 100;
    kValues.push(windowK);
  }
  
  const smoothedK = kValues.slice(-smoothK).reduce((sum, val) => sum + val, 0) / smoothK;
  const d = kValues.slice(-smoothD).reduce((sum, val) => sum + val, 0) / smoothD;

  let signal: 'oversold' | 'neutral' | 'overbought';
  if (smoothedK < 20) signal = 'oversold';
  else if (smoothedK > 80) signal = 'overbought';
  else signal = 'neutral';

  return { k: smoothedK, d, signal };
}

/**
 * ON-BALANCE VOLUME (OBV)
 * Volume-based momentum indicator
 */
export function calculateOBV(priceData: PriceData[]): number[] {
  if (priceData.length === 0) return [];

  const obv: number[] = [priceData[0].volume];

  for (let i = 1; i < priceData.length; i++) {
    if (priceData[i].close > priceData[i - 1].close) {
      obv.push(obv[i - 1] + priceData[i].volume);
    } else if (priceData[i].close < priceData[i - 1].close) {
      obv.push(obv[i - 1] - priceData[i].volume);
    } else {
      obv.push(obv[i - 1]);
    }
  }

  return obv;
}

/**
 * MONEY FLOW INDEX (MFI)
 * Volume-weighted RSI
 */
export function calculateMFI(priceData: PriceData[], period: number = 14): number {
  if (priceData.length < period + 1) return 50;

  const typicalPrices: number[] = [];
  const rawMoneyFlow: number[] = [];

  for (const data of priceData) {
    const typicalPrice = (data.high + data.low + data.close) / 3;
    typicalPrices.push(typicalPrice);
    rawMoneyFlow.push(typicalPrice * data.volume);
  }

  let positiveFlow = 0;
  let negativeFlow = 0;

  for (let i = priceData.length - period; i < priceData.length; i++) {
    if (i > 0) {
      if (typicalPrices[i] > typicalPrices[i - 1]) {
        positiveFlow += rawMoneyFlow[i];
      } else {
        negativeFlow += rawMoneyFlow[i];
      }
    }
  }

  if (negativeFlow === 0) return 100;
  
  const moneyRatio = positiveFlow / negativeFlow;
  const mfi = 100 - (100 / (1 + moneyRatio));

  return mfi;
}

/**
 * DETECT CANDLESTICK PATTERNS
 */
export function detectCandlestickPatterns(priceData: PriceData[]): {
  pattern: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number;
}[] {
  const patterns: { pattern: string; signal: 'bullish' | 'bearish' | 'neutral'; strength: number }[] = [];

  if (priceData.length < 3) return patterns;

  const current = priceData[priceData.length - 1];
  const prev1 = priceData[priceData.length - 2];
  const prev2 = priceData[priceData.length - 3];

  const currentBody = Math.abs(current.close - current.open);
  const currentRange = current.high - current.low;

  if (currentBody < currentRange * 0.1) {
    patterns.push({
      pattern: 'Doji',
      signal: 'neutral',
      strength: 60
    });
  }

  if (
    current.close > current.open &&
    current.open <= prev1.close &&
    current.close >= prev1.open
  ) {
    patterns.push({
      pattern: 'Bullish Engulfing',
      signal: 'bullish',
      strength: 75
    });
  }

  if (
    current.close < current.open &&
    current.open >= prev1.close &&
    current.close <= prev1.open
  ) {
    patterns.push({
      pattern: 'Bearish Engulfing',
      signal: 'bearish',
      strength: 75
    });
  }

  return patterns;
}
