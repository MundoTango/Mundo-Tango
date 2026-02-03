/**
 * TIER 3: EXECUTION & RISK MANAGEMENT (Agents #92-97)
 * Trade execution, position sizing, risk management, rebalancing, liquidity, compliance
 */

import { calculateKellyCriterion, calculatePositionSize, adjustKellyForMarketConditions, type TradeHistory } from '../../algorithms/kellyCriterion';
import type { TradeSignal } from './StrategyEngines';

export interface TradeOrder {
  symbol: string;
  orderType: 'market' | 'limit' | 'stop';
  action: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'pending' | 'filled' | 'rejected' | 'cancelled';
}

export interface RiskLimits {
  maxPositionSize: number; // percentage of portfolio
  maxDrawdown: number; // percentage
  maxDailyLoss: number; // dollar amount
  stopLossPercent: number; // percentage below entry
}

/**
 * Agent #92: Trade Executor
 * Order placement, slippage minimization, smart order routing
 */
export class Agent92_TradeExecutor {
  async executeOrder(order: TradeOrder): Promise<{
    success: boolean;
    fillPrice?: number;
    slippage?: number;
    message: string;
  }> {
    try {
      console.log(`[Agent #92] Executing ${order.action} order for ${order.symbol}`);

      // Mock execution - would call real broker APIs (Coinbase, Schwab)
      const executionPrice = order.price || Math.random() * 1000;
      const expectedPrice = order.price || executionPrice;
      const slippage = Math.abs((executionPrice - expectedPrice) / expectedPrice) * 100;

      // Simulate successful execution
      if (Math.random() > 0.05) { // 95% success rate
        return {
          success: true,
          fillPrice: executionPrice,
          slippage,
          message: `Order filled at $${executionPrice.toFixed(2)}. Slippage: ${slippage.toFixed(3)}%`
        };
      }

      return {
        success: false,
        message: 'Order rejected: Insufficient liquidity'
      };
    } catch (error) {
      console.error('[Agent #92] Execution error:', error);
      return {
        success: false,
        message: `Execution failed: ${(error as Error).message}`
      };
    }
  }

  async minimizeSlippage(order: TradeOrder, liquidityData: {
    volume: number;
    spread: number;
  }): Promise<TradeOrder> {
    console.log(`[Agent #92] Minimizing slippage for ${order.symbol}`);

    // If order is large relative to volume, split it
    const orderValue = order.quantity * (order.price || 100);
    const liquidityRatio = orderValue / liquidityData.volume;

    if (liquidityRatio > 0.05) { // Order is >5% of volume
      console.log('[Agent #92] Large order detected. Recommending TWAP execution.');
      // Would implement TWAP (Time-Weighted Average Price) splitting
      return {
        ...order,
        orderType: 'limit', // Use limit orders to control slippage
        price: order.price ? order.price * 1.001 : undefined // Slightly above market for buys
      };
    }

    return order;
  }

  async smartOrderRouting(symbol: string, action: 'buy' | 'sell'): Promise<{
    exchange: string;
    expectedPrice: number;
    fees: number;
  }> {
    console.log(`[Agent #92] Finding best execution venue for ${symbol}`);

    // Mock implementation - would query multiple exchanges
    const exchanges = [
      { name: 'Coinbase', price: 50000, fees: 0.5 },
      { name: 'Schwab', price: 50010, fees: 0.0 },
      { name: 'Interactive Brokers', price: 49995, fees: 0.1 }
    ];

    const best = action === 'buy'
      ? exchanges.sort((a, b) => (a.price + a.fees) - (b.price + b.fees))[0]
      : exchanges.sort((a, b) => (b.price - b.fees) - (a.price - a.fees))[0];

    return {
      exchange: best.name,
      expectedPrice: best.price,
      fees: best.fees
    };
  }
}

/**
 * Agent #93: Position Sizer (Kelly Criterion)
 * Optimal position sizing based on win rate and edge
 */
export class Agent93_PositionSizer {
  calculateOptimalSize(
    signal: TradeSignal,
    portfolioValue: number,
    tradeHistory: TradeHistory,
    marketConditions: {
      volatility: number;
      regime: 'bull' | 'bear' | 'sideways';
      drawdown: number;
    }
  ): {
    recommendedSize: number;
    maxSize: number;
    actualSize: number;
    reasoning: string;
  } {
    console.log('[Agent #93] Calculating optimal position size');

    try {
      // Calculate base Kelly fraction
      const kellyResult = calculateKellyCriterion(tradeHistory);

      // Adjust for market conditions
      const adjusted = adjustKellyForMarketConditions(
        kellyResult.optimalFraction,
        marketConditions.volatility,
        marketConditions.regime,
        marketConditions.drawdown
      );

      // Further adjust by signal confidence
      const confidenceAdjusted = adjusted.adjustedKelly * signal.confidence;

      // Calculate dollar amounts
      const sizeResult = calculatePositionSize(
        portfolioValue,
        { ...kellyResult, optimalFraction: confidenceAdjusted },
        0.10 // Max 10% per position
      );

      return {
        ...sizeResult,
        reasoning: `Kelly: ${(kellyResult.optimalFraction * 100).toFixed(1)}%, ` +
          `Market adjusted: ${(adjusted.adjustedKelly * 100).toFixed(1)}%, ` +
          `Confidence adjusted: ${(confidenceAdjusted * 100).toFixed(1)}%, ` +
          `Final: $${sizeResult.actualSize.toFixed(2)} (${adjusted.reason})`
      };
    } catch (error) {
      console.error('[Agent #93] Position sizing error:', error);
      return {
        recommendedSize: 0,
        maxSize: portfolioValue * 0.05,
        actualSize: 0,
        reasoning: 'Error in position sizing'
      };
    }
  }

  enforcePositionLimits(
    proposedSize: number,
    currentPositions: { symbol: string; value: number }[],
    portfolioValue: number
  ): {
    approved: boolean;
    adjustedSize: number;
    reason: string;
  } {
    console.log('[Agent #93] Enforcing position limits');

    const currentExposure = currentPositions.reduce((sum, p) => sum + p.value, 0);
    const exposurePercent = currentExposure / portfolioValue;

    // Max 80% total exposure
    if (exposurePercent > 0.80) {
      return {
        approved: false,
        adjustedSize: 0,
        reason: `Total exposure ${(exposurePercent * 100).toFixed(1)}% exceeds 80% limit`
      };
    }

    // Max 10% per position
    const positionPercent = proposedSize / portfolioValue;
    if (positionPercent > 0.10) {
      return {
        approved: true,
        adjustedSize: portfolioValue * 0.10,
        reason: `Position capped at 10% ($${(portfolioValue * 0.10).toFixed(2)})`
      };
    }

    return {
      approved: true,
      adjustedSize: proposedSize,
      reason: 'Within position limits'
    };
  }
}

/**
 * Agent #94: Risk Manager
 * Stop-loss, take-profit, drawdown monitoring, circuit breakers
 */
export class Agent94_RiskManager {
  calculateStopLoss(
    entryPrice: number,
    riskPercent: number = 0.02 // 2% default
  ): number {
    console.log('[Agent #94] Calculating stop-loss');
    return entryPrice * (1 - riskPercent);
  }

  calculateTakeProfit(
    entryPrice: number,
    targetRatio: number = 3 // 3:1 reward:risk ratio
  ): number {
    console.log('[Agent #94] Calculating take-profit');
    const riskAmount = entryPrice * 0.02; // 2% risk
    return entryPrice + (riskAmount * targetRatio);
  }

  monitorDrawdown(
    currentValue: number,
    peakValue: number,
    maxDrawdown: number = 0.20 // 20% max drawdown
  ): {
    currentDrawdown: number;
    triggerCircuitBreaker: boolean;
    message: string;
  } {
    console.log('[Agent #94] Monitoring drawdown');

    const drawdown = (peakValue - currentValue) / peakValue;

    if (drawdown > maxDrawdown) {
      return {
        currentDrawdown: drawdown,
        triggerCircuitBreaker: true,
        message: `CIRCUIT BREAKER TRIGGERED: Drawdown ${(drawdown * 100).toFixed(1)}% exceeds ${(maxDrawdown * 100).toFixed(0)}% limit. Halting all trading.`
      };
    }

    if (drawdown > maxDrawdown * 0.75) { // 75% of max
      return {
        currentDrawdown: drawdown,
        triggerCircuitBreaker: false,
        message: `WARNING: Drawdown ${(drawdown * 100).toFixed(1)}% approaching limit. Reducing position sizes.`
      };
    }

    return {
      currentDrawdown: drawdown,
      triggerCircuitBreaker: false,
      message: `Drawdown ${(drawdown * 100).toFixed(1)}% within normal range.`
    };
  }

  validateTrade(
    signal: TradeSignal,
    portfolioValue: number,
    currentPositions: number,
    riskLimits: RiskLimits
  ): {
    approved: boolean;
    reason: string;
  } {
    console.log('[Agent #94] Validating trade against risk limits');

    // Check position count
    if (currentPositions >= 20) {
      return {
        approved: false,
        reason: 'Maximum 20 positions limit reached'
      };
    }

    // Check confidence threshold
    if (signal.confidence < 0.6) {
      return {
        approved: false,
        reason: `Signal confidence ${(signal.confidence * 100).toFixed(0)}% below 60% threshold`
      };
    }

    // Check if position size is specified
    if (!signal.positionSize) {
      return {
        approved: false,
        reason: 'No position size specified'
      };
    }

    return {
      approved: true,
      reason: 'Trade approved by risk manager'
    };
  }
}

/**
 * Agent #95: Portfolio Rebalancer
 * Maintain target allocations, tax-loss harvesting, correlation optimization
 */
export class Agent95_PortfolioRebalancer {
  async rebalancePortfolio(
    currentAllocations: { symbol: string; percent: number }[],
    targetAllocations: { symbol: string; percent: number }[],
    threshold: number = 0.05 // 5% drift threshold
  ): Promise<{
    rebalanceNeeded: boolean;
    trades: { symbol: string; action: 'buy' | 'sell'; percent: number }[];
    reasoning: string;
  }> {
    console.log('[Agent #95] Analyzing portfolio rebalancing needs');

    const trades: { symbol: string; action: 'buy' | 'sell'; percent: number }[] = [];
    let maxDrift = 0;

    for (const target of targetAllocations) {
      const current = currentAllocations.find(c => c.symbol === target.symbol);
      const currentPercent = current?.percent || 0;
      const drift = Math.abs(currentPercent - target.percent);

      if (drift > threshold) {
        trades.push({
          symbol: target.symbol,
          action: currentPercent < target.percent ? 'buy' : 'sell',
          percent: drift
        });
        maxDrift = Math.max(maxDrift, drift);
      }
    }

    return {
      rebalanceNeeded: trades.length > 0,
      trades,
      reasoning: trades.length > 0
        ? `Rebalancing needed: ${trades.length} positions drifted >5%. Max drift: ${(maxDrift * 100).toFixed(1)}%`
        : 'Portfolio within tolerance. No rebalancing needed.'
    };
  }

  async identifyTaxLossHarvesting(
    positions: { symbol: string; cost: number; current: number; heldDays: number }[]
  ): Promise<{
    opportunities: { symbol: string; loss: number; savings: number }[];
    reasoning: string;
  }> {
    console.log('[Agent #95] Identifying tax-loss harvesting opportunities');

    const opportunities = positions
      .filter(p => p.current < p.cost && p.heldDays > 30) // Avoid wash sales
      .map(p => ({
        symbol: p.symbol,
        loss: p.cost - p.current,
        savings: (p.cost - p.current) * 0.30 // Assume 30% tax rate
      }))
      .sort((a, b) => b.savings - a.savings);

    return {
      opportunities,
      reasoning: opportunities.length > 0
        ? `${opportunities.length} tax-loss harvesting opportunities. Total potential savings: $${opportunities.reduce((sum, o) => sum + o.savings, 0).toFixed(2)}`
        : 'No tax-loss harvesting opportunities identified.'
    };
  }
}

/**
 * Agent #96: Liquidity Manager
 * Cash reserves, margin utilization, emergency liquidity
 */
export class Agent96_LiquidityManager {
  calculateCashReserve(
    portfolioValue: number,
    targetCashPercent: number = 0.10 // 10% cash reserve
  ): {
    targetCash: number;
    currentCash: number;
    adjustment: number;
    message: string;
  } {
    console.log('[Agent #96] Calculating cash reserve needs');

    const targetCash = portfolioValue * targetCashPercent;
    const currentCash = portfolioValue * 0.08; // Mock current cash
    const adjustment = targetCash - currentCash;

    return {
      targetCash,
      currentCash,
      adjustment,
      message: adjustment > 0
        ? `Need to raise $${adjustment.toFixed(2)} in cash`
        : `Excess cash: $${Math.abs(adjustment).toFixed(2)} available for deployment`
    };
  }

  monitorMarginUtilization(
    borrowedAmount: number,
    collateralValue: number,
    maxMarginPercent: number = 0.30 // Max 30% margin
  ): {
    currentMargin: number;
    safeMargin: boolean;
    message: string;
  } {
    console.log('[Agent #96] Monitoring margin utilization');

    const marginPercent = borrowedAmount / collateralValue;
    const safeMargin = marginPercent <= maxMarginPercent;

    return {
      currentMargin: marginPercent,
      safeMargin,
      message: safeMargin
        ? `Margin ${(marginPercent * 100).toFixed(1)}% within ${(maxMarginPercent * 100).toFixed(0)}% limit`
        : `⚠️ MARGIN ALERT: ${(marginPercent * 100).toFixed(1)}% exceeds ${(maxMarginPercent * 100).toFixed(0)}% limit. Reduce leverage.`
    };
  }
}

/**
 * Agent #97: Compliance Monitor
 * Pattern day trader rules, wash sales, position limits
 */
export class Agent97_ComplianceMonitor {
  checkPatternDayTrader(
    trades: { date: Date }[],
    accountValue: number
  ): {
    isPDT: boolean;
    dayTradesCount: number;
    message: string;
  } {
    console.log('[Agent #97] Checking pattern day trader status');

    // Count day trades in last 5 business days
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const recentDayTrades = trades.filter(t => t.date >= fiveDaysAgo).length;

    const isPDT = recentDayTrades >= 4 && accountValue < 25000;

    return {
      isPDT,
      dayTradesCount: recentDayTrades,
      message: isPDT
        ? `⚠️ Pattern Day Trader flag triggered. ${recentDayTrades} day trades with account <$25K. Trading restricted.`
        : `Day trades: ${recentDayTrades}/4. ${isPDT ? 'PDT restrictions apply' : 'Within limits'}.`
    };
  }

  checkWashSale(
    symbol: string,
    sellDate: Date,
    recentBuys: { symbol: string; date: Date }[]
  ): {
    isWashSale: boolean;
    message: string;
  } {
    console.log(`[Agent #97] Checking wash sale for ${symbol}`);

    // Wash sale if bought same security within 30 days before or after sale
    const thirtyDaysBefore = new Date(sellDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAfter = new Date(sellDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const washSale = recentBuys.some(
      buy => buy.symbol === symbol &&
        buy.date >= thirtyDaysBefore &&
        buy.date <= thirtyDaysAfter
    );

    return {
      isWashSale: washSale,
      message: washSale
        ? `⚠️ WASH SALE: Cannot claim tax loss. ${symbol} repurchased within 30 days.`
        : 'No wash sale violation. Tax loss can be claimed.'
    };
  }

  enforcePositionLimits(
    symbol: string,
    proposedQuantity: number,
    regulatoryLimit: number = 100000
  ): {
    approved: boolean;
    message: string;
  } {
    console.log(`[Agent #97] Checking position limits for ${symbol}`);

    if (proposedQuantity > regulatoryLimit) {
      return {
        approved: false,
        message: `Position exceeds regulatory limit of ${regulatoryLimit} shares`
      };
    }

    return {
      approved: true,
      message: 'Within regulatory position limits'
    };
  }
}

/**
 * Execution & Risk Coordinator
 * Aggregates all Tier 3 agents
 */
export class ExecutionRiskCoordinator {
  private agent92: Agent92_TradeExecutor;
  private agent93: Agent93_PositionSizer;
  private agent94: Agent94_RiskManager;
  private agent95: Agent95_PortfolioRebalancer;
  private agent96: Agent96_LiquidityManager;
  private agent97: Agent97_ComplianceMonitor;

  constructor() {
    this.agent92 = new Agent92_TradeExecutor();
    this.agent93 = new Agent93_PositionSizer();
    this.agent94 = new Agent94_RiskManager();
    this.agent95 = new Agent95_PortfolioRebalancer();
    this.agent96 = new Agent96_LiquidityManager();
    this.agent97 = new Agent97_ComplianceMonitor();
  }

  async validateAndExecuteTrade(
    signal: TradeSignal,
    portfolioValue: number,
    tradeHistory: TradeHistory,
    marketConditions: any
  ): Promise<{
    executed: boolean;
    order?: TradeOrder;
    reason: string;
  }> {
    console.log('[Execution & Risk] Validating and executing trade');

    // Step 1: Risk validation
    const riskCheck = this.agent94.validateTrade(
      signal,
      portfolioValue,
      10, // current positions
      {
        maxPositionSize: 0.10,
        maxDrawdown: 0.20,
        maxDailyLoss: 1000,
        stopLossPercent: 0.02
      }
    );

    if (!riskCheck.approved) {
      return {
        executed: false,
        reason: `Risk check failed: ${riskCheck.reason}`
      };
    }

    // Step 2: Position sizing
    const sizing = this.agent93.calculateOptimalSize(
      signal,
      portfolioValue,
      tradeHistory,
      marketConditions
    );

    if (sizing.actualSize === 0) {
      return {
        executed: false,
        reason: 'Position size calculated as zero'
      };
    }

    // Step 3: Create order
    const order: TradeOrder = {
      symbol: 'AAPL', // Would use actual symbol from signal
      orderType: 'limit',
      action: signal.action,
      quantity: sizing.actualSize / 150, // Assuming $150/share
      price: 150,
      stopLoss: this.agent94.calculateStopLoss(150),
      takeProfit: this.agent94.calculateTakeProfit(150),
      status: 'pending'
    };

    // Step 4: Execute
    const execution = await this.agent92.executeOrder(order);

    return {
      executed: execution.success,
      order: execution.success ? { ...order, status: 'filled' } : order,
      reason: execution.message
    };
  }
}
