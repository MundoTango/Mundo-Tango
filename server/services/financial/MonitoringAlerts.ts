/**
 * TIER 5: MONITORING & ALERTS (Agents #102-104)
 * Performance monitoring, alert generation, report generation
 */

import { calculateSharpeRatio, calculateMaxDrawdown } from '../../algorithms/kellyCriterion';

export interface PerformanceMetrics {
  currentValue: number;
  totalReturn: number;
  dailyReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
}

export interface Alert {
  id: string;
  type: 'price_target' | 'stop_loss' | 'news' | 'position_limit' | 'risk' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  actionRequired?: string;
}

/**
 * Agent #102: Performance Monitor
 * Real-time P&L tracking, Sharpe ratio, max drawdown, benchmark comparison
 */
export class Agent102_PerformanceMonitor {
  trackPerformance(
    portfolioHistory: number[],
    trades: { profit: number; win: boolean }[]
  ): PerformanceMetrics {
    console.log('[Agent #102] Tracking portfolio performance');

    const currentValue = portfolioHistory[portfolioHistory.length - 1];
    const initialValue = portfolioHistory[0];
    const previousValue = portfolioHistory[portfolioHistory.length - 2] || currentValue;

    const totalReturn = (currentValue - initialValue) / initialValue;
    const dailyReturn = (currentValue - previousValue) / previousValue;

    // Calculate returns array
    const returns: number[] = [];
    for (let i = 1; i < portfolioHistory.length; i++) {
      returns.push((portfolioHistory[i] - portfolioHistory[i - 1]) / portfolioHistory[i - 1]);
    }

    const sharpeRatio = calculateSharpeRatio(returns);
    const maxDrawdownData = calculateMaxDrawdown(portfolioHistory);

    // Win rate
    const wins = trades.filter(t => t.win).length;
    const winRate = trades.length > 0 ? wins / trades.length : 0;

    const winningTrades = trades.filter(t => t.win);
    const losingTrades = trades.filter(t => !t.win);
    
    const averageWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length
      : 0;
    
    const averageLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length)
      : 0;

    return {
      currentValue,
      totalReturn,
      dailyReturn,
      sharpeRatio,
      maxDrawdown: maxDrawdownData.maxDrawdownPercent,
      winRate,
      averageWin,
      averageLoss
    };
  }

  compareToBenchmark(
    portfolioReturn: number,
    benchmarkReturn: number,
    portfolioVolatility: number,
    benchmarkVolatility: number
  ): {
    outperformance: number;
    informationRatio: number;
    message: string;
  } {
    console.log('[Agent #102] Comparing to benchmark');

    const outperformance = portfolioReturn - benchmarkReturn;
    
    // Information Ratio: excess return per unit of tracking error
    const trackingError = Math.abs(portfolioVolatility - benchmarkVolatility);
    const informationRatio = trackingError > 0 ? outperformance / trackingError : 0;

    let message: string;
    if (outperformance > 0.05) {
      message = `OUTPERFORMING: +${(outperformance * 100).toFixed(2)}% vs benchmark. IR: ${informationRatio.toFixed(2)}`;
    } else if (outperformance < -0.05) {
      message = `UNDERPERFORMING: ${(outperformance * 100).toFixed(2)}% vs benchmark. IR: ${informationRatio.toFixed(2)}`;
    } else {
      message = `INLINE: ${(outperformance * 100).toFixed(2)}% vs benchmark. IR: ${informationRatio.toFixed(2)}`;
    }

    return {
      outperformance,
      informationRatio,
      message
    };
  }

  calculateRiskMetrics(
    portfolioHistory: number[],
    positions: { value: number; volatility: number }[]
  ): {
    portfolioVolatility: number;
    valueAtRisk: number; // VaR 95%
    expectedShortfall: number; // CVaR
    concentration: number; // Herfindahl index
  } {
    console.log('[Agent #102] Calculating risk metrics');

    // Portfolio volatility
    const returns: number[] = [];
    for (let i = 1; i < portfolioHistory.length; i++) {
      returns.push((portfolioHistory[i] - portfolioHistory[i - 1]) / portfolioHistory[i - 1]);
    }

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const portfolioVolatility = Math.sqrt(variance * 252); // Annualized

    // Value at Risk (95% confidence)
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const var95Index = Math.floor(sortedReturns.length * 0.05);
    const valueAtRisk = Math.abs(sortedReturns[var95Index] || 0);

    // Expected Shortfall (average of worst 5%)
    const worstReturns = sortedReturns.slice(0, var95Index);
    const expectedShortfall = worstReturns.length > 0
      ? Math.abs(worstReturns.reduce((sum, r) => sum + r, 0) / worstReturns.length)
      : 0;

    // Portfolio concentration (Herfindahl Index)
    const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
    const concentration = positions.reduce((sum, p) => {
      const weight = p.value / totalValue;
      return sum + Math.pow(weight, 2);
    }, 0);

    return {
      portfolioVolatility,
      valueAtRisk,
      expectedShortfall,
      concentration
    };
  }
}

/**
 * Agent #103: Alert Generator
 * Price targets, stop-loss triggers, news events, position limits
 */
export class Agent103_AlertGenerator {
  generateAlerts(
    currentPrices: Map<string, number>,
    positions: Map<string, { targetPrice?: number; stopLoss?: number; quantity: number }>,
    riskMetrics: { drawdown: number; exposure: number; volatility: number }
  ): Alert[] {
    console.log('[Agent #103] Generating alerts');

    const alerts: Alert[] = [];

    // Check price targets and stop-losses
    for (const [symbol, price] of currentPrices.entries()) {
      const position = positions.get(symbol);
      if (!position) continue;

      // Price target hit
      if (position.targetPrice && price >= position.targetPrice) {
        alerts.push({
          id: `target_${symbol}_${Date.now()}`,
          type: 'price_target',
          severity: 'medium',
          message: `${symbol} hit target price $${position.targetPrice.toFixed(2)}. Current: $${price.toFixed(2)}`,
          timestamp: new Date(),
          actionRequired: 'Consider taking profits'
        });
      }

      // Stop-loss triggered
      if (position.stopLoss && price <= position.stopLoss) {
        alerts.push({
          id: `stop_${symbol}_${Date.now()}`,
          type: 'stop_loss',
          severity: 'high',
          message: `⚠️ ${symbol} triggered stop-loss at $${position.stopLoss.toFixed(2)}. Current: $${price.toFixed(2)}`,
          timestamp: new Date(),
          actionRequired: 'IMMEDIATE: Sell position to limit losses'
        });
      }
    }

    // Risk alerts
    if (riskMetrics.drawdown > 0.15) {
      alerts.push({
        id: `drawdown_${Date.now()}`,
        type: 'risk',
        severity: 'high',
        message: `⚠️ Portfolio drawdown ${(riskMetrics.drawdown * 100).toFixed(1)}% exceeds 15% threshold`,
        timestamp: new Date(),
        actionRequired: 'Reduce position sizes or halt trading'
      });
    }

    if (riskMetrics.exposure > 0.85) {
      alerts.push({
        id: `exposure_${Date.now()}`,
        type: 'position_limit',
        severity: 'medium',
        message: `Portfolio exposure ${(riskMetrics.exposure * 100).toFixed(1)}% approaching 100% limit`,
        timestamp: new Date(),
        actionRequired: 'Maintain cash reserves'
      });
    }

    if (riskMetrics.volatility > 0.40) {
      alerts.push({
        id: `volatility_${Date.now()}`,
        type: 'risk',
        severity: 'medium',
        message: `High portfolio volatility: ${(riskMetrics.volatility * 100).toFixed(1)}% annualized`,
        timestamp: new Date(),
        actionRequired: 'Consider hedging strategies'
      });
    }

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  async sendNewsAlert(
    symbol: string,
    newsEvent: {
      headline: string;
      sentiment: number;
      impact: 'high' | 'medium' | 'low';
    }
  ): Promise<Alert> {
    console.log(`[Agent #103] Generating news alert for ${symbol}`);

    const severity = newsEvent.impact === 'high' ? 'high' : 
                    newsEvent.impact === 'medium' ? 'medium' : 'low';

    return {
      id: `news_${symbol}_${Date.now()}`,
      type: 'news',
      severity,
      message: `${symbol}: ${newsEvent.headline} (Sentiment: ${newsEvent.sentiment > 0 ? 'Positive' : 'Negative'})`,
      timestamp: new Date(),
      actionRequired: newsEvent.impact === 'high' ? 'Review position immediately' : undefined
    };
  }
}

/**
 * Agent #104: Report Generator
 * Daily summaries, weekly reviews, monthly attribution, tax reports
 */
export class Agent104_ReportGenerator {
  generateDailyReport(
    performance: PerformanceMetrics,
    trades: any[],
    alerts: Alert[]
  ): {
    title: string;
    summary: string;
    details: any;
    timestamp: Date;
  } {
    console.log('[Agent #104] Generating daily performance report');

    const profitableTrades = trades.filter(t => t.profit > 0).length;
    const totalTrades = trades.length;

    return {
      title: `Daily Performance Report - ${new Date().toLocaleDateString()}`,
      summary: `Portfolio value: $${performance.currentValue.toFixed(2)} ` +
        `(${performance.dailyReturn > 0 ? '+' : ''}${(performance.dailyReturn * 100).toFixed(2)}%). ` +
        `Trades: ${totalTrades} (${profitableTrades} profitable). ` +
        `Sharpe: ${performance.sharpeRatio.toFixed(2)}. ` +
        `Alerts: ${alerts.filter(a => a.severity === 'high').length} high-priority.`,
      details: {
        performance,
        trades: trades.slice(-10), // Last 10 trades
        alerts: alerts.slice(0, 5), // Top 5 alerts
        winRate: `${(performance.winRate * 100).toFixed(1)}%`,
        avgWinLoss: `$${performance.averageWin.toFixed(2)} / -$${performance.averageLoss.toFixed(2)}`
      },
      timestamp: new Date()
    };
  }

  generateWeeklyReport(
    weeklyPerformance: {
      startValue: number;
      endValue: number;
      highValue: number;
      lowValue: number;
      trades: any[];
    },
    topPerformers: { symbol: string; return: number }[],
    bottomPerformers: { symbol: string; return: number }[]
  ): {
    title: string;
    summary: string;
    details: any;
    timestamp: Date;
  } {
    console.log('[Agent #104] Generating weekly strategy review');

    const weekReturn = (weeklyPerformance.endValue - weeklyPerformance.startValue) / weeklyPerformance.startValue;

    return {
      title: `Weekly Strategy Review - ${new Date().toLocaleDateString()}`,
      summary: `Week return: ${(weekReturn * 100).toFixed(2)}%. ` +
        `Trades executed: ${weeklyPerformance.trades.length}. ` +
        `Best performer: ${topPerformers[0]?.symbol} (+${(topPerformers[0]?.return * 100).toFixed(1)}%). ` +
        `Worst: ${bottomPerformers[0]?.symbol} (${(bottomPerformers[0]?.return * 100).toFixed(1)}%).`,
      details: {
        weeklyPerformance,
        topPerformers: topPerformers.slice(0, 5),
        bottomPerformers: bottomPerformers.slice(0, 5),
        volatility: ((weeklyPerformance.highValue - weeklyPerformance.lowValue) / weeklyPerformance.startValue * 100).toFixed(2) + '%'
      },
      timestamp: new Date()
    };
  }

  generateMonthlyReport(
    monthlyData: {
      startingValue: number;
      endingValue: number;
      totalDeposits: number;
      totalWithdrawals: number;
      realizedGains: number;
      unrealizedGains: number;
      fees: number;
      taxes: number;
    }
  ): {
    title: string;
    summary: string;
    details: any;
    timestamp: Date;
  } {
    console.log('[Agent #104] Generating monthly attribution report');

    const netReturn = (monthlyData.endingValue - monthlyData.startingValue - monthlyData.totalDeposits + monthlyData.totalWithdrawals) / monthlyData.startingValue;

    return {
      title: `Monthly Attribution Report - ${new Date().toLocaleDateString()}`,
      summary: `Net return: ${(netReturn * 100).toFixed(2)}%. ` +
        `Realized gains: $${monthlyData.realizedGains.toFixed(2)}. ` +
        `Unrealized gains: $${monthlyData.unrealizedGains.toFixed(2)}. ` +
        `Fees: $${monthlyData.fees.toFixed(2)}. ` +
        `Estimated taxes: $${monthlyData.taxes.toFixed(2)}.`,
      details: monthlyData,
      timestamp: new Date()
    };
  }

  generateTaxReport(
    year: number,
    trades: { symbol: string; buyDate: Date; sellDate: Date; profit: number; longTerm: boolean }[]
  ): {
    title: string;
    summary: string;
    details: {
      shortTermGains: number;
      longTermGains: number;
      totalTrades: number;
      estimatedTaxes: number;
    };
    timestamp: Date;
  } {
    console.log(`[Agent #104] Generating tax report for ${year}`);

    const shortTermTrades = trades.filter(t => !t.longTerm);
    const longTermTrades = trades.filter(t => t.longTerm);

    const shortTermGains = shortTermTrades.reduce((sum, t) => sum + t.profit, 0);
    const longTermGains = longTermTrades.reduce((sum, t) => sum + t.profit, 0);

    // Estimate taxes (simplified)
    const shortTermTax = Math.max(0, shortTermGains * 0.37); // 37% short-term rate
    const longTermTax = Math.max(0, longTermGains * 0.20); // 20% long-term rate
    const estimatedTaxes = shortTermTax + longTermTax;

    return {
      title: `Tax Report ${year}`,
      summary: `Total trades: ${trades.length}. ` +
        `Short-term gains: $${shortTermGains.toFixed(2)} (${shortTermTrades.length} trades). ` +
        `Long-term gains: $${longTermGains.toFixed(2)} (${longTermTrades.length} trades). ` +
        `Estimated taxes: $${estimatedTaxes.toFixed(2)}.`,
      details: {
        shortTermGains,
        longTermGains,
        totalTrades: trades.length,
        estimatedTaxes
      },
      timestamp: new Date()
    };
  }
}

/**
 * Monitoring & Alerts Coordinator
 * Aggregates all Tier 5 agents
 */
export class MonitoringAlertsCoordinator {
  private agent102: Agent102_PerformanceMonitor;
  private agent103: Agent103_AlertGenerator;
  private agent104: Agent104_ReportGenerator;

  constructor() {
    this.agent102 = new Agent102_PerformanceMonitor();
    this.agent103 = new Agent103_AlertGenerator();
    this.agent104 = new Agent104_ReportGenerator();
  }

  async runMonitoringCycle(
    portfolioData: any,
    trades: any[],
    currentPrices: Map<string, number>,
    positions: Map<string, any>
  ) {
    console.log('[Monitoring & Alerts] Running monitoring cycle');

    const [performance, alerts] = await Promise.all([
      Promise.resolve(this.agent102.trackPerformance(portfolioData.history, trades)),
      Promise.resolve(this.agent103.generateAlerts(
        currentPrices,
        positions,
        {
          drawdown: 0.10,
          exposure: 0.75,
          volatility: 0.25
        }
      ))
    ]);

    const dailyReport = this.agent104.generateDailyReport(performance, trades, alerts);

    return {
      performance,
      alerts,
      dailyReport,
      timestamp: new Date()
    };
  }
}
