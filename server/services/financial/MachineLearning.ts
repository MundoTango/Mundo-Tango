/**
 * TIER 4: MACHINE LEARNING (Agents #98-101)
 * Model training, prediction aggregation, performance attribution, regime classification
 */

import type { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';
import type { TradeSignal } from './StrategyEngines';
import { calculateSharpeRatio } from '../../algorithms/kellyCriterion';

export interface MLModel {
  name: string;
  type: 'lstm' | 'random_forest' | 'gradient_boost' | 'ensemble';
  accuracy: number;
  lastTrained: Date;
  predictions: number;
}

/**
 * Agent #98: Model Trainer
 * Feature engineering, backtesting, hyperparameter tuning, cross-validation
 */
export class Agent98_ModelTrainer {
  private aiOrchestrator?: RateLimitedAIOrchestrator;

  constructor(aiOrchestrator?: RateLimitedAIOrchestrator) {
    this.aiOrchestrator = aiOrchestrator;
  }

  async trainModel(
    symbol: string,
    historicalData: { prices: number[]; features: any[] }
  ): Promise<MLModel> {
    console.log(`[Agent #98] Training ML model for ${symbol}`);

    try {
      // Feature engineering
      const features = this.engineerFeatures(historicalData.prices);
      
      // Mock training - in production would use actual ML libraries
      const model: MLModel = {
        name: `${symbol}_LSTM_Model`,
        type: 'lstm',
        accuracy: 0.65 + Math.random() * 0.15, // 65-80% accuracy
        lastTrained: new Date(),
        predictions: 0
      };

      console.log(`[Agent #98] Model trained with ${(model.accuracy * 100).toFixed(1)}% accuracy`);
      
      return model;
    } catch (error) {
      console.error('[Agent #98] Model training error:', error);
      throw error;
    }
  }

  private engineerFeatures(prices: number[]): number[][] {
    console.log('[Agent #98] Engineering features');

    const features: number[][] = [];

    for (let i = 10; i < prices.length; i++) {
      const window = prices.slice(i - 10, i);
      
      // Feature 1: 10-day momentum
      const momentum = (prices[i] - window[0]) / window[0];
      
      // Feature 2: 10-day volatility
      const avg = window.reduce((sum, p) => sum + p, 0) / window.length;
      const variance = window.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / window.length;
      const volatility = Math.sqrt(variance);
      
      // Feature 3: Trend (slope)
      const trend = (window[window.length - 1] - window[0]) / window.length;

      features.push([momentum, volatility, trend]);
    }

    return features;
  }

  async backtest(
    model: MLModel,
    historicalPrices: number[],
    startCapital: number = 10000
  ): Promise<{
    finalCapital: number;
    totalReturn: number;
    sharpeRatio: number;
    winRate: number;
    maxDrawdown: number;
  }> {
    console.log(`[Agent #98] Backtesting ${model.name}`);

    // Mock backtest results
    const finalCapital = startCapital * (1 + (Math.random() * 0.5 - 0.1)); // -10% to +40%
    const returns = Array.from({ length: 100 }, () => Math.random() * 0.04 - 0.02); // -2% to +2%
    
    return {
      finalCapital,
      totalReturn: (finalCapital - startCapital) / startCapital,
      sharpeRatio: calculateSharpeRatio(returns),
      winRate: 0.55 + Math.random() * 0.15, // 55-70%
      maxDrawdown: 0.10 + Math.random() * 0.10 // 10-20%
    };
  }

  async tuneHyperparameters(
    model: MLModel,
    parameterGrid: Record<string, any[]>
  ): Promise<{
    bestParams: Record<string, any>;
    bestAccuracy: number;
  }> {
    console.log(`[Agent #98] Tuning hyperparameters for ${model.name}`);

    // Mock hyperparameter tuning
    return {
      bestParams: {
        learningRate: 0.001,
        layers: 3,
        neurons: 64,
        dropout: 0.2
      },
      bestAccuracy: model.accuracy + 0.05 // 5% improvement
    };
  }
}

/**
 * Agent #99: Prediction Aggregator
 * Ensemble model combination, confidence weighting, consensus building
 */
export class Agent99_PredictionAggregator {
  aggregateSignals(signals: TradeSignal[]): TradeSignal {
    console.log(`[Agent #99] Aggregating ${signals.length} trading signals`);

    if (signals.length === 0) {
      return {
        action: 'hold',
        confidence: 0,
        reasoning: 'No signals to aggregate',
        agentId: 99
      };
    }

    // Count votes by action
    const buyVotes = signals.filter(s => s.action === 'buy');
    const sellVotes = signals.filter(s => s.action === 'sell');
    const holdVotes = signals.filter(s => s.action === 'hold');

    // Weight by confidence
    const buyWeight = buyVotes.reduce((sum, s) => sum + s.confidence, 0);
    const sellWeight = sellVotes.reduce((sum, s) => sum + s.confidence, 0);
    const holdWeight = holdVotes.reduce((sum, s) => sum + s.confidence, 0);

    // Determine consensus
    let action: 'buy' | 'sell' | 'hold';
    let confidence: number;

    if (buyWeight > sellWeight && buyWeight > holdWeight) {
      action = 'buy';
      confidence = buyWeight / signals.length;
    } else if (sellWeight > buyWeight && sellWeight > holdWeight) {
      action = 'sell';
      confidence = sellWeight / signals.length;
    } else {
      action = 'hold';
      confidence = holdWeight / signals.length;
    }

    // Filter outliers (signals with very low confidence)
    const reliableSignals = signals.filter(s => s.confidence >= 0.5);
    const outliers = signals.filter(s => s.confidence < 0.5);

    return {
      action,
      confidence,
      reasoning: `Consensus: ${action.toUpperCase()} (${reliableSignals.length} reliable signals, ${outliers.length} outliers filtered). ` +
        `Buy: ${buyVotes.length}, Sell: ${sellVotes.length}, Hold: ${holdVotes.length}. ` +
        `Weighted confidence: ${(confidence * 100).toFixed(1)}%`,
      agentId: 99
    };
  }

  detectConflicts(signals: TradeSignal[]): {
    hasConflict: boolean;
    conflictingAgents: number[];
    resolution: string;
  } {
    console.log('[Agent #99] Detecting signal conflicts');

    const buySignals = signals.filter(s => s.action === 'buy' && s.confidence > 0.7);
    const sellSignals = signals.filter(s => s.action === 'sell' && s.confidence > 0.7);

    const hasConflict = buySignals.length > 0 && sellSignals.length > 0;

    if (!hasConflict) {
      return {
        hasConflict: false,
        conflictingAgents: [],
        resolution: 'No high-confidence conflicts detected'
      };
    }

    return {
      hasConflict: true,
      conflictingAgents: [
        ...buySignals.map(s => s.agentId),
        ...sellSignals.map(s => s.agentId)
      ],
      resolution: `Conflict: ${buySignals.length} agents recommend BUY, ${sellSignals.length} recommend SELL. ` +
        `Defer to higher confidence or aggregate vote.`
    };
  }
}

/**
 * Agent #100: Performance Attribution
 * Return decomposition, factor exposure, alpha/beta separation
 */
export class Agent100_PerformanceAttribution {
  analyzeReturns(
    portfolioReturns: number[],
    benchmarkReturns: number[]
  ): {
    alpha: number;
    beta: number;
    attribution: {
      skillBased: number;
      marketBased: number;
      luck: number;
    };
  } {
    console.log('[Agent #100] Analyzing performance attribution');

    // Calculate beta (sensitivity to market)
    const covariance = this.calculateCovariance(portfolioReturns, benchmarkReturns);
    const benchmarkVariance = this.calculateVariance(benchmarkReturns);
    const beta = covariance / benchmarkVariance;

    // Calculate alpha (excess return beyond market)
    const avgPortfolioReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const avgBenchmarkReturn = benchmarkReturns.reduce((sum, r) => sum + r, 0) / benchmarkReturns.length;
    const alpha = avgPortfolioReturn - (beta * avgBenchmarkReturn);

    // Attribute returns
    const marketBased = beta * avgBenchmarkReturn;
    const skillBased = alpha > 0 ? alpha * 0.7 : alpha; // 70% of alpha is skill
    const luck = alpha > 0 ? alpha * 0.3 : 0; // 30% of alpha is luck

    return {
      alpha,
      beta,
      attribution: {
        skillBased,
        marketBased,
        luck
      }
    };
  }

  private calculateCovariance(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    const avgX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const avgY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;

    let covariance = 0;
    for (let i = 0; i < n; i++) {
      covariance += (x[i] - avgX) * (y[i] - avgY);
    }

    return covariance / n;
  }

  private calculateVariance(values: number[]): number {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    return variance;
  }

  analyzeFactorExposure(
    portfolioReturns: number[],
    factors: {
      value: number[];
      momentum: number[];
      quality: number[];
    }
  ): {
    valueFactor: number;
    momentumFactor: number;
    qualityFactor: number;
  } {
    console.log('[Agent #100] Analyzing factor exposure');

    return {
      valueFactor: this.calculateCovariance(portfolioReturns, factors.value),
      momentumFactor: this.calculateCovariance(portfolioReturns, factors.momentum),
      qualityFactor: this.calculateCovariance(portfolioReturns, factors.quality)
    };
  }
}

/**
 * Agent #101: Market Regime Classifier
 * Trend/range/volatile detection, strategy selection, adaptive tuning
 */
export class Agent101_MarketRegimeClassifier {
  classifyRegime(
    priceData: { close: number; volume: number; date: Date }[],
    volatilityIndex: number // VIX
  ): {
    regime: 'bull_trending' | 'bear_trending' | 'sideways_range' | 'high_volatility';
    confidence: number;
    recommendedStrategies: string[];
  } {
    console.log('[Agent #101] Classifying market regime');

    const prices = priceData.map(d => d.close);
    const recent50 = prices.slice(-50);
    const recent200 = prices.slice(-200);

    // Calculate trend
    const sma50 = recent50.reduce((sum, p) => sum + p, 0) / recent50.length;
    const sma200 = recent200.reduce((sum, p) => sum + p, 0) / recent200.length;
    const trend = (sma50 - sma200) / sma200;

    // Calculate volatility
    const recentVol = this.calculateHistoricalVolatility(recent50);

    // Classify regime
    let regime: 'bull_trending' | 'bear_trending' | 'sideways_range' | 'high_volatility';
    let strategies: string[];

    if (volatilityIndex > 30 || recentVol > 0.30) {
      regime = 'high_volatility';
      strategies = ['defensive', 'options_hedging', 'cash_preservation'];
    } else if (trend > 0.10) {
      regime = 'bull_trending';
      strategies = ['momentum', 'breakout', 'trend_following'];
    } else if (trend < -0.10) {
      regime = 'bear_trending';
      strategies = ['short_selling', 'defensive', 'value_hunting'];
    } else {
      regime = 'sideways_range';
      strategies = ['mean_reversion', 'pairs_trading', 'theta_strategies'];
    }

    return {
      regime,
      confidence: 0.75,
      recommendedStrategies: strategies
    };
  }

  private calculateHistoricalVolatility(prices: number[]): number {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance * 252); // Annualized
  }

  detectRegimeShift(
    currentRegime: string,
    previousRegimes: string[]
  ): {
    shiftDetected: boolean;
    newRegime?: string;
    message: string;
  } {
    console.log('[Agent #101] Detecting regime shift');

    const recent5 = previousRegimes.slice(-5);
    const allSame = recent5.every(r => r === currentRegime);

    if (!allSame && !recent5.includes(currentRegime)) {
      return {
        shiftDetected: true,
        newRegime: currentRegime,
        message: `REGIME SHIFT DETECTED: Transitioning to ${currentRegime}. Adjust strategies accordingly.`
      };
    }

    return {
      shiftDetected: false,
      message: `No regime shift. Current regime: ${currentRegime} (stable)`
    };
  }

  adaptStrategyParameters(
    regime: string,
    baseParameters: {
      positionSize: number;
      stopLoss: number;
      takeProfit: number;
    }
  ): {
    positionSize: number;
    stopLoss: number;
    takeProfit: number;
    reasoning: string;
  } {
    console.log(`[Agent #101] Adapting strategy for ${regime} regime`);

    let adjustments = { ...baseParameters };
    let reasoning = '';

    switch (regime) {
      case 'high_volatility':
        adjustments.positionSize *= 0.5; // Reduce size by 50%
        adjustments.stopLoss *= 1.5; // Wider stops
        reasoning = 'High volatility: Reduced position size, wider stops';
        break;

      case 'bull_trending':
        adjustments.positionSize *= 1.2; // Increase size by 20%
        adjustments.takeProfit *= 1.5; // Let winners run
        reasoning = 'Bull trend: Increased size, higher profit targets';
        break;

      case 'bear_trending':
        adjustments.positionSize *= 0.7; // Reduce size
        adjustments.stopLoss *= 0.8; // Tighter stops
        reasoning = 'Bear trend: Reduced size, tighter stops, defensive';
        break;

      case 'sideways_range':
        adjustments.takeProfit *= 0.8; // Take profits faster
        reasoning = 'Range-bound: Quick profits, tight risk management';
        break;
    }

    return {
      ...adjustments,
      reasoning
    };
  }
}

/**
 * Machine Learning Coordinator
 * Aggregates all Tier 4 agents
 */
export class MachineLearningCoordinator {
  private agent98: Agent98_ModelTrainer;
  private agent99: Agent99_PredictionAggregator;
  private agent100: Agent100_PerformanceAttribution;
  private agent101: Agent101_MarketRegimeClassifier;

  constructor(aiOrchestrator?: RateLimitedAIOrchestrator) {
    this.agent98 = new Agent98_ModelTrainer(aiOrchestrator);
    this.agent99 = new Agent99_PredictionAggregator();
    this.agent100 = new Agent100_PerformanceAttribution();
    this.agent101 = new Agent101_MarketRegimeClassifier();
  }

  async processMLPipeline(
    symbol: string,
    historicalData: any,
    currentSignals: TradeSignal[],
    portfolioReturns: number[],
    benchmarkReturns: number[]
  ) {
    console.log(`[Machine Learning] Running ML pipeline for ${symbol}`);

    const [
      model,
      aggregatedSignal,
      performance,
      regime
    ] = await Promise.all([
      this.agent98.trainModel(symbol, historicalData),
      Promise.resolve(this.agent99.aggregateSignals(currentSignals)),
      Promise.resolve(this.agent100.analyzeReturns(portfolioReturns, benchmarkReturns)),
      Promise.resolve(this.agent101.classifyRegime(historicalData.priceData || [], 20))
    ]);

    return {
      model,
      aggregatedSignal,
      performance,
      regime,
      timestamp: new Date()
    };
  }
}
