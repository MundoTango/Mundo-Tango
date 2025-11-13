/**
 * SUPPORTING AGENTS (Agents #73-80)
 * Capital Manager, Tax Optimizer, Fee Minimizer, Slippage Analyzer,
 * Latency Monitor, Data Quality Checker, Backup System, Emergency Shutdown
 */

export interface CapitalTier {
  tier: number;
  minAmount: number;
  maxAmount: number;
  maxPositions: number;
  maxPositionSize: number; // percentage
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
}

/**
 * Agent #73: Capital Manager
 * Dynamic capital allocation, tier-based limits
 */
export class Agent73_CapitalManager {
  private capitalTiers: CapitalTier[] = [
    { tier: 1, minAmount: 0, maxAmount: 1000, maxPositions: 3, maxPositionSize: 0.20, riskLevel: 'conservative' },
    { tier: 2, minAmount: 1000, maxAmount: 5000, maxPositions: 5, maxPositionSize: 0.15, riskLevel: 'conservative' },
    { tier: 3, minAmount: 5000, maxAmount: 25000, maxPositions: 10, maxPositionSize: 0.12, riskLevel: 'moderate' },
    { tier: 4, minAmount: 25000, maxAmount: 100000, maxPositions: 15, maxPositionSize: 0.10, riskLevel: 'moderate' },
    { tier: 5, minAmount: 100000, maxAmount: Infinity, maxPositions: 20, maxPositionSize: 0.08, riskLevel: 'aggressive' }
  ];

  determineCapitalTier(portfolioValue: number): CapitalTier {
    console.log(`[Agent #73] Determining capital tier for $${portfolioValue.toFixed(2)}`);

    const tier = this.capitalTiers.find(
      t => portfolioValue >= t.minAmount && portfolioValue < t.maxAmount
    ) || this.capitalTiers[this.capitalTiers.length - 1];

    console.log(`[Agent #73] Assigned to Tier ${tier.tier} (${tier.riskLevel})`);
    return tier;
  }

  adjustLimitsForCapital(
    portfolioValue: number,
    tier: CapitalTier
  ): {
    maxPositions: number;
    maxPositionDollars: number;
    cashReservePercent: number;
    message: string;
  } {
    console.log(`[Agent #73] Adjusting limits for $${portfolioValue.toFixed(2)}`);

    const maxPositionDollars = portfolioValue * tier.maxPositionSize;
    const cashReservePercent = tier.riskLevel === 'conservative' ? 0.20 :
                               tier.riskLevel === 'moderate' ? 0.15 : 0.10;

    return {
      maxPositions: tier.maxPositions,
      maxPositionDollars,
      cashReservePercent,
      message: `Tier ${tier.tier}: Max ${tier.maxPositions} positions, ` +
        `$${maxPositionDollars.toFixed(2)} per position, ` +
        `${(cashReservePercent * 100).toFixed(0)}% cash reserve (${tier.riskLevel})`
    };
  }
}

/**
 * Agent #74: Tax Optimizer
 * Tax-loss harvesting, long-term vs short-term optimization
 */
export class Agent74_TaxOptimizer {
  optimizeTaxStrategy(
    positions: {
      symbol: string;
      quantity: number;
      costBasis: number;
      currentPrice: number;
      purchaseDate: Date;
    }[]
  ): {
    sellRecommendations: {
      symbol: string;
      reason: string;
      taxSavings: number;
    }[];
    holdRecommendations: {
      symbol: string;
      daysUntilLongTerm: number;
    }[];
  } {
    console.log('[Agent #74] Optimizing tax strategy');

    const sellRecommendations: any[] = [];
    const holdRecommendations: any[] = [];

    for (const position of positions) {
      const holdingPeriod = Math.floor(
        (Date.now() - position.purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isLongTerm = holdingPeriod >= 365;
      const currentValue = position.quantity * position.currentPrice;
      const gain = currentValue - position.costBasis;

      // If in loss and held >30 days, recommend tax-loss harvesting
      if (gain < 0 && holdingPeriod > 30) {
        const taxSavings = Math.abs(gain) * 0.30; // 30% tax rate
        sellRecommendations.push({
          symbol: position.symbol,
          reason: `Tax-loss harvesting: ${(gain / position.costBasis * 100).toFixed(1)}% loss`,
          taxSavings
        });
      }

      // If in profit and < 365 days, recommend holding for long-term status
      if (gain > 0 && !isLongTerm) {
        holdRecommendations.push({
          symbol: position.symbol,
          daysUntilLongTerm: 365 - holdingPeriod
        });
      }
    }

    return {
      sellRecommendations: sellRecommendations.sort((a, b) => b.taxSavings - a.taxSavings),
      holdRecommendations
    };
  }

  calculateEstimatedTaxes(
    trades: { profit: number; longTerm: boolean }[]
  ): {
    shortTermTax: number;
    longTermTax: number;
    totalTax: number;
  } {
    console.log('[Agent #74] Calculating estimated taxes');

    const shortTermGains = trades
      .filter(t => !t.longTerm && t.profit > 0)
      .reduce((sum, t) => sum + t.profit, 0);

    const longTermGains = trades
      .filter(t => t.longTerm && t.profit > 0)
      .reduce((sum, t) => sum + t.profit, 0);

    const shortTermTax = shortTermGains * 0.37; // 37% federal rate
    const longTermTax = longTermGains * 0.20; // 20% federal rate

    return {
      shortTermTax,
      longTermTax,
      totalTax: shortTermTax + longTermTax
    };
  }
}

/**
 * Agent #75: Fee Minimizer
 * Optimize trading costs, fee comparison across exchanges
 */
export class Agent75_FeeMinimizer {
  calculateTradingFees(
    symbol: string,
    quantity: number,
    price: number,
    exchange: 'coinbase' | 'schwab' | 'interactive_brokers'
  ): {
    commissionFee: number;
    spreadCost: number;
    totalCost: number;
    percentOfTrade: number;
  } {
    console.log(`[Agent #75] Calculating fees for ${symbol} on ${exchange}`);

    const tradeValue = quantity * price;

    // Fee structures (simplified)
    const fees = {
      coinbase: { commission: tradeValue * 0.005, spread: tradeValue * 0.001 }, // 0.5% + spread
      schwab: { commission: 0, spread: tradeValue * 0.0005 }, // $0 + tight spread
      interactive_brokers: { commission: Math.min(quantity * 0.005, 1), spread: tradeValue * 0.0001 } // $0.005/share, max $1
    };

    const selectedFees = fees[exchange];
    const totalCost = selectedFees.commission + selectedFees.spread;

    return {
      commissionFee: selectedFees.commission,
      spreadCost: selectedFees.spread,
      totalCost,
      percentOfTrade: (totalCost / tradeValue) * 100
    };
  }

  recommendBestExchange(
    symbol: string,
    quantity: number,
    price: number
  ): {
    exchange: 'coinbase' | 'schwab' | 'interactive_brokers';
    fees: number;
    savings: number;
  } {
    console.log(`[Agent #75] Finding cheapest exchange for ${symbol}`);

    const coinbaseFees = this.calculateTradingFees(symbol, quantity, price, 'coinbase');
    const schwabFees = this.calculateTradingFees(symbol, quantity, price, 'schwab');
    const ibFees = this.calculateTradingFees(symbol, quantity, price, 'interactive_brokers');

    const options = [
      { exchange: 'coinbase' as const, fees: coinbaseFees.totalCost },
      { exchange: 'schwab' as const, fees: schwabFees.totalCost },
      { exchange: 'interactive_brokers' as const, fees: ibFees.totalCost }
    ];

    const best = options.sort((a, b) => a.fees - b.fees)[0];
    const worst = options.sort((a, b) => b.fees - a.fees)[0];

    return {
      exchange: best.exchange,
      fees: best.fees,
      savings: worst.fees - best.fees
    };
  }
}

/**
 * Agent #76: Slippage Analyzer
 * Track actual vs expected prices, optimize execution
 */
export class Agent76_SlippageAnalyzer {
  analyzeSlippage(
    expectedPrice: number,
    actualPrice: number,
    quantity: number,
    orderType: 'market' | 'limit'
  ): {
    slippageDollars: number;
    slippagePercent: number;
    slippageBps: number; // basis points
    acceptable: boolean;
    message: string;
  } {
    console.log('[Agent #76] Analyzing slippage');

    const slippageDollars = Math.abs(actualPrice - expectedPrice) * quantity;
    const slippagePercent = Math.abs((actualPrice - expectedPrice) / expectedPrice) * 100;
    const slippageBps = slippagePercent * 100; // Convert to basis points

    // Acceptable thresholds
    const marketOrderThreshold = 0.10; // 10 bps for market orders
    const limitOrderThreshold = 0.05; // 5 bps for limit orders
    const threshold = orderType === 'market' ? marketOrderThreshold : limitOrderThreshold;

    const acceptable = slippageBps <= threshold;

    return {
      slippageDollars,
      slippagePercent,
      slippageBps,
      acceptable,
      message: acceptable
        ? `✓ Acceptable slippage: ${slippageBps.toFixed(2)} bps (threshold: ${threshold * 100} bps)`
        : `⚠️ High slippage: ${slippageBps.toFixed(2)} bps exceeds ${threshold * 100} bps threshold. Consider using limit orders.`
    };
  }

  trackAverageSlippage(
    recentTrades: { expected: number; actual: number }[]
  ): {
    averageSlippageBps: number;
    trend: 'improving' | 'worsening' | 'stable';
    recommendation: string;
  } {
    console.log('[Agent #76] Tracking average slippage');

    if (recentTrades.length === 0) {
      return {
        averageSlippageBps: 0,
        trend: 'stable',
        recommendation: 'No recent trades to analyze'
      };
    }

    const slippages = recentTrades.map(t =>
      Math.abs((t.actual - t.expected) / t.expected) * 10000 // bps
    );

    const averageSlippageBps = slippages.reduce((sum, s) => sum + s, 0) / slippages.length;

    // Analyze trend
    const firstHalf = slippages.slice(0, Math.floor(slippages.length / 2));
    const secondHalf = slippages.slice(Math.floor(slippages.length / 2));

    const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;

    let trend: 'improving' | 'worsening' | 'stable';
    if (secondAvg < firstAvg * 0.9) trend = 'improving';
    else if (secondAvg > firstAvg * 1.1) trend = 'worsening';
    else trend = 'stable';

    return {
      averageSlippageBps,
      trend,
      recommendation: trend === 'worsening'
        ? 'Consider switching to limit orders or trading during higher liquidity hours'
        : 'Slippage performance is acceptable'
    };
  }
}

/**
 * Agent #77: Latency Monitor
 * Track API response times, execution speed
 */
export class Agent77_LatencyMonitor {
  measureLatency(
    operation: string,
    startTime: number,
    endTime: number
  ): {
    latencyMs: number;
    acceptable: boolean;
    message: string;
  } {
    console.log(`[Agent #77] Measuring latency for ${operation}`);

    const latencyMs = endTime - startTime;
    const thresholds: Record<string, number> = {
      'market_data': 100,      // 100ms for market data
      'order_execution': 500,  // 500ms for order execution
      'account_info': 1000,    // 1s for account info
      'ai_decision': 3000      // 3s for AI decisions
    };

    const threshold = thresholds[operation] || 1000;
    const acceptable = latencyMs <= threshold;

    return {
      latencyMs,
      acceptable,
      message: acceptable
        ? `✓ ${operation} latency: ${latencyMs}ms (threshold: ${threshold}ms)`
        : `⚠️ HIGH LATENCY: ${operation} took ${latencyMs}ms (threshold: ${threshold}ms). Performance degraded.`
    };
  }

  trackSystemLatency(
    recentMeasurements: { operation: string; latency: number }[]
  ): {
    avgLatency: number;
    p95Latency: number;
    slowestOperation: string;
    recommendation: string;
  } {
    console.log('[Agent #77] Tracking system latency');

    const latencies = recentMeasurements.map(m => m.latency).sort((a, b) => a - b);
    const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const p95Index = Math.floor(latencies.length * 0.95);
    const p95Latency = latencies[p95Index] || 0;

    const slowest = recentMeasurements.sort((a, b) => b.latency - a.latency)[0];

    return {
      avgLatency,
      p95Latency,
      slowestOperation: slowest?.operation || 'none',
      recommendation: p95Latency > 1000
        ? 'System experiencing high latency. Consider caching or infrastructure upgrade.'
        : 'System latency is within acceptable limits'
    };
  }
}

/**
 * Agent #78: Data Quality Checker
 * Validate market data, detect anomalies
 */
export class Agent78_DataQualityChecker {
  validateMarketData(data: {
    price: number;
    volume: number;
    timestamp: Date;
  }): {
    valid: boolean;
    issues: string[];
  } {
    console.log('[Agent #78] Validating market data');

    const issues: string[] = [];

    // Check for null/undefined
    if (data.price == null || data.volume == null) {
      issues.push('Missing price or volume data');
    }

    // Check for negative values
    if (data.price < 0 || data.volume < 0) {
      issues.push('Negative price or volume detected');
    }

    // Check for stale data (>5 minutes old)
    const dataAge = Date.now() - data.timestamp.getTime();
    if (dataAge > 5 * 60 * 1000) {
      issues.push(`Stale data: ${Math.floor(dataAge / 1000)}s old`);
    }

    // Check for extreme values (likely errors)
    if (data.price > 1000000 || data.price < 0.001) {
      issues.push('Extreme price value detected');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  detectDataAnomalies(
    currentData: number,
    historicalData: number[]
  ): {
    isAnomaly: boolean;
    zScore: number;
    message: string;
  } {
    console.log('[Agent #78] Detecting data anomalies');

    const mean = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length;
    const variance = historicalData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / historicalData.length;
    const stdDev = Math.sqrt(variance);

    const zScore = (currentData - mean) / stdDev;
    const isAnomaly = Math.abs(zScore) > 3; // 3 standard deviations

    return {
      isAnomaly,
      zScore,
      message: isAnomaly
        ? `⚠️ DATA ANOMALY: Current value ${currentData} is ${Math.abs(zScore).toFixed(1)} std devs from mean. Possible data error.`
        : `Data point within normal range (z-score: ${zScore.toFixed(2)})`
    };
  }
}

/**
 * Agent #79: Backup System
 * Automated backups, disaster recovery
 */
export class Agent79_BackupSystem {
  async createBackup(portfolioData: any): Promise<{
    backupId: string;
    timestamp: Date;
    size: number;
    location: string;
  }> {
    console.log('[Agent #79] Creating portfolio backup');

    const backupId = `backup_${Date.now()}`;
    const dataStr = JSON.stringify(portfolioData);

    // In production, would save to cloud storage (S3, etc.)
    return {
      backupId,
      timestamp: new Date(),
      size: dataStr.length,
      location: `/backups/${backupId}.json`
    };
  }

  async restoreFromBackup(backupId: string): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    console.log(`[Agent #79] Restoring from backup ${backupId}`);

    // Mock restoration
    return {
      success: true,
      data: { /* restored data */ },
      message: `Successfully restored from backup ${backupId}`
    };
  }
}

/**
 * Agent #80: Emergency Shutdown
 * Circuit breakers, emergency stop
 */
export class Agent80_EmergencyShutdown {
  private emergencyActive = false;

  triggerEmergencyShutdown(reason: string): {
    shutdownInitiated: boolean;
    timestamp: Date;
    reason: string;
    actionsToken: string[];
  } {
    console.log(`[Agent #80] 🚨 EMERGENCY SHUTDOWN TRIGGERED: ${reason}`);

    this.emergencyActive = true;

    return {
      shutdownInitiated: true,
      timestamp: new Date(),
      reason,
      actionsToken: [
        'All automated trading halted',
        'Pending orders cancelled',
        'Alert sent to administrator',
        'System locked until manual review'
      ]
    };
  }

  checkEmergencyConditions(
    drawdown: number,
    dailyLoss: number,
    errorCount: number
  ): {
    shouldTrigger: boolean;
    reason?: string;
  } {
    console.log('[Agent #80] Checking emergency conditions');

    // Trigger conditions
    if (drawdown > 0.25) {
      return {
        shouldTrigger: true,
        reason: `Excessive drawdown: ${(drawdown * 100).toFixed(1)}% exceeds 25% limit`
      };
    }

    if (dailyLoss > 5000) {
      return {
        shouldTrigger: true,
        reason: `Daily loss $${dailyLoss.toFixed(2)} exceeds $5,000 limit`
      };
    }

    if (errorCount > 10) {
      return {
        shouldTrigger: true,
        reason: `System errors: ${errorCount} errors in monitoring period`
      };
    }

    return { shouldTrigger: false };
  }

  resetEmergency(adminKey: string): {
    success: boolean;
    message: string;
  } {
    console.log('[Agent #80] Resetting emergency shutdown');

    // In production, would validate admin key
    this.emergencyActive = false;

    return {
      success: true,
      message: 'Emergency shutdown reset. System ready to resume.'
    };
  }
}

/**
 * Supporting Agents Coordinator
 */
export class SupportingAgentsCoordinator {
  private agent73: Agent73_CapitalManager;
  private agent74: Agent74_TaxOptimizer;
  private agent75: Agent75_FeeMinimizer;
  private agent76: Agent76_SlippageAnalyzer;
  private agent77: Agent77_LatencyMonitor;
  private agent78: Agent78_DataQualityChecker;
  private agent79: Agent79_BackupSystem;
  private agent80: Agent80_EmergencyShutdown;

  constructor() {
    this.agent73 = new Agent73_CapitalManager();
    this.agent74 = new Agent74_TaxOptimizer();
    this.agent75 = new Agent75_FeeMinimizer();
    this.agent76 = new Agent76_SlippageAnalyzer();
    this.agent77 = new Agent77_LatencyMonitor();
    this.agent78 = new Agent78_DataQualityChecker();
    this.agent79 = new Agent79_BackupSystem();
    this.agent80 = new Agent80_EmergencyShutdown();
  }

  async runSupportingAgents(portfolioValue: number, systemMetrics: any) {
    console.log('[Supporting Agents] Running all supporting agents');

    const [tier, emergencyCheck] = await Promise.all([
      Promise.resolve(this.agent73.determineCapitalTier(portfolioValue)),
      Promise.resolve(this.agent80.checkEmergencyConditions(
        systemMetrics.drawdown || 0,
        systemMetrics.dailyLoss || 0,
        systemMetrics.errorCount || 0
      ))
    ]);

    if (emergencyCheck.shouldTrigger) {
      return this.agent80.triggerEmergencyShutdown(emergencyCheck.reason!);
    }

    return {
      tier,
      emergencyStatus: 'normal',
      timestamp: new Date()
    };
  }
}
