/**
 * KELLY CRITERION POSITION SIZING ALGORITHM
 * Calculates optimal position sizes based on win rate and expected value
 * Used by Agent #93 (Position Sizer)
 */

export interface TradeHistory {
  wins: number;
  losses: number;
  avgWin: number;
  avgLoss: number;
}

export interface KellyCriterionResult {
  optimalFraction: number; // Percentage of capital to risk (0-1)
  expectedValue: number; // Expected value of the bet
  winRate: number; // Probability of winning
  confidenceLevel: string; // low, medium, high
  recommendation: string; // Human-readable recommendation
}

/**
 * Calculate Kelly Criterion optimal position size
 * Formula: f* = (p * b - q) / b
 * Where:
 * - f* = fraction of capital to bet
 * - p = probability of winning
 * - q = probability of losing (1 - p)
 * - b = ratio of amount won to amount lost (avg win / avg loss)
 */
export function calculateKellyCriterion(history: TradeHistory): KellyCriterionResult {
  const totalTrades = history.wins + history.losses;
  
  if (totalTrades === 0) {
    return {
      optimalFraction: 0,
      expectedValue: 0,
      winRate: 0,
      confidenceLevel: 'low',
      recommendation: 'Insufficient trade history. Start with minimal position sizes.'
    };
  }

  const winRate = history.wins / totalTrades;
  const lossRate = 1 - winRate;
  
  if (history.avgLoss === 0) {
    return {
      optimalFraction: 0,
      expectedValue: 0,
      winRate,
      confidenceLevel: 'low',
      recommendation: 'Invalid trade history: average loss cannot be zero.'
    };
  }

  const winLossRatio = history.avgWin / Math.abs(history.avgLoss);
  
  const kellyFraction = (winRate * winLossRatio - lossRate) / winLossRatio;
  
  const expectedValue = (winRate * history.avgWin) + (lossRate * history.avgLoss);
  
  const optimalFraction = Math.max(0, Math.min(kellyFraction, 1));
  
  const fractionalKelly = optimalFraction * 0.5;
  
  let confidenceLevel: string;
  let recommendation: string;

  if (totalTrades < 30) {
    confidenceLevel = 'low';
    recommendation = `Limited trade history (${totalTrades} trades). Use ${(fractionalKelly * 100).toFixed(1)}% of Kelly (50% Kelly) for safety.`;
  } else if (totalTrades < 100) {
    confidenceLevel = 'medium';
    recommendation = `Moderate trade history (${totalTrades} trades). Use ${(fractionalKelly * 100).toFixed(1)}% of Kelly (50% Kelly).`;
  } else {
    confidenceLevel = 'high';
    recommendation = `Strong trade history (${totalTrades} trades). Full Kelly: ${(optimalFraction * 100).toFixed(1)}%, Half Kelly: ${(fractionalKelly * 100).toFixed(1)}% (recommended).`;
  }

  if (expectedValue < 0) {
    return {
      optimalFraction: 0,
      expectedValue,
      winRate,
      confidenceLevel: 'low',
      recommendation: 'Negative expected value. Do not trade this strategy.'
    };
  }

  return {
    optimalFraction: fractionalKelly,
    expectedValue,
    winRate,
    confidenceLevel,
    recommendation
  };
}

/**
 * Calculate position size in dollars
 */
export function calculatePositionSize(
  portfolioValue: number,
  kellyResult: KellyCriterionResult,
  maxPositionPercent: number = 0.10
): {
  recommendedSize: number;
  maxSize: number;
  actualSize: number;
  reasoning: string;
} {
  const kellySize = portfolioValue * kellyResult.optimalFraction;
  const maxSize = portfolioValue * maxPositionPercent;
  const actualSize = Math.min(kellySize, maxSize);

  let reasoning: string;

  if (actualSize === 0) {
    reasoning = 'Position size is zero. Strategy has negative edge or insufficient data.';
  } else if (actualSize < kellySize) {
    reasoning = `Kelly suggests $${kellySize.toFixed(2)}, but capped at max position limit of ${(maxPositionPercent * 100).toFixed(0)}%.`;
  } else {
    reasoning = `Kelly criterion suggests $${kellySize.toFixed(2)} (${(kellyResult.optimalFraction * 100).toFixed(1)}% of portfolio).`;
  }

  return {
    recommendedSize: kellySize,
    maxSize,
    actualSize,
    reasoning
  };
}

/**
 * Validate and adjust Kelly fraction based on market conditions
 */
export function adjustKellyForMarketConditions(
  baseKelly: number,
  volatility: number, // VIX or portfolio volatility
  marketRegime: 'bull' | 'bear' | 'sideways',
  recentDrawdown: number // percentage drawdown (0-1)
): {
  adjustedKelly: number;
  adjustmentFactor: number;
  reason: string;
} {
  let adjustmentFactor = 1.0;
  let reasons: string[] = [];

  if (volatility > 30) {
    adjustmentFactor *= 0.5;
    reasons.push('High volatility (VIX > 30): reduce by 50%');
  } else if (volatility > 20) {
    adjustmentFactor *= 0.75;
    reasons.push('Elevated volatility (VIX > 20): reduce by 25%');
  }

  if (marketRegime === 'bear') {
    adjustmentFactor *= 0.6;
    reasons.push('Bear market: reduce by 40%');
  } else if (marketRegime === 'sideways') {
    adjustmentFactor *= 0.8;
    reasons.push('Sideways market: reduce by 20%');
  }

  if (recentDrawdown > 0.20) {
    adjustmentFactor *= 0.5;
    reasons.push('Significant drawdown (>20%): reduce by 50%');
  } else if (recentDrawdown > 0.10) {
    adjustmentFactor *= 0.75;
    reasons.push('Moderate drawdown (>10%): reduce by 25%');
  }

  const adjustedKelly = baseKelly * adjustmentFactor;

  return {
    adjustedKelly: Math.max(0, Math.min(adjustedKelly, 1)),
    adjustmentFactor,
    reason: reasons.length > 0 ? reasons.join('; ') : 'No adjustments needed'
  };
}

/**
 * Calculate maximum drawdown from trade history
 */
export function calculateMaxDrawdown(equityCurve: number[]): {
  maxDrawdown: number;
  maxDrawdownPercent: number;
  peakValue: number;
  troughValue: number;
} {
  if (equityCurve.length === 0) {
    return {
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      peakValue: 0,
      troughValue: 0
    };
  }

  let peak = equityCurve[0];
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  let peakValue = peak;
  let troughValue = peak;

  for (const value of equityCurve) {
    if (value > peak) {
      peak = value;
    }

    const drawdown = peak - value;
    const drawdownPercent = peak > 0 ? (drawdown / peak) : 0;

    if (drawdownPercent > maxDrawdownPercent) {
      maxDrawdownPercent = drawdownPercent;
      maxDrawdown = drawdown;
      peakValue = peak;
      troughValue = value;
    }
  }

  return {
    maxDrawdown,
    maxDrawdownPercent,
    peakValue,
    troughValue
  };
}

/**
 * Calculate Sharpe Ratio
 */
export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate: number = 0.02 // 2% annual risk-free rate
): number {
  if (returns.length === 0) return 0;

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  const annualizedReturn = avgReturn * 252;
  const annualizedStdDev = stdDev * Math.sqrt(252);
  
  return (annualizedReturn - riskFreeRate) / annualizedStdDev;
}
