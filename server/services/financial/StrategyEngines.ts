/**
 * TIER 2: STRATEGY ENGINES (Agents #86-91)
 * Momentum, Value, Arbitrage, Options, Mean Reversion, ML Prediction
 */

import { calculateSMA, calculateEMA, calculateRSI, calculateBollingerBands, calculateMACD } from '../../algorithms/technicalIndicators';
import type { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';

export interface TradeSignal {
  action: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-1
  targetPrice?: number;
  stopLoss?: number;
  positionSize?: number; // percentage of portfolio
  reasoning: string;
  agentId: number;
}

/**
 * Agent #86: Momentum Strategy
 * Moving average crossovers, trend following, breakout detection
 */
export class Agent86_MomentumStrategy {
  generateSignal(priceHistory: number[]): TradeSignal {
    try {
      console.log('[Agent #86] Generating momentum signal');

      const sma50 = calculateSMA(priceHistory, 50);
      const sma200 = calculateSMA(priceHistory, 200);

      if (sma50.length === 0 || sma200.length === 0) {
        return {
          action: 'hold',
          confidence: 0,
          reasoning: 'Insufficient price history for momentum analysis',
          agentId: 86
        };
      }

      const currentSMA50 = sma50[sma50.length - 1];
      const currentSMA200 = sma200[sma200.length - 1];
      const prevSMA50 = sma50[sma50.length - 2] || currentSMA50;
      const prevSMA200 = sma200[sma200.length - 2] || currentSMA200;

      // Golden Cross: SMA50 crosses above SMA200
      if (prevSMA50 <= prevSMA200 && currentSMA50 > currentSMA200) {
        return {
          action: 'buy',
          confidence: 0.85,
          positionSize: 0.05, // 5% of portfolio
          reasoning: 'Golden Cross detected: SMA50 crossed above SMA200. Strong bullish momentum signal.',
          agentId: 86
        };
      }

      // Death Cross: SMA50 crosses below SMA200
      if (prevSMA50 >= prevSMA200 && currentSMA50 < currentSMA200) {
        return {
          action: 'sell',
          confidence: 0.85,
          reasoning: 'Death Cross detected: SMA50 crossed below SMA200. Strong bearish momentum signal.',
          agentId: 86
        };
      }

      // Trend is up
      if (currentSMA50 > currentSMA200) {
        return {
          action: 'hold',
          confidence: 0.6,
          reasoning: 'Uptrend intact (SMA50 > SMA200). Hold current positions.',
          agentId: 86
        };
      }

      // Trend is down
      return {
        action: 'hold',
        confidence: 0.4,
        reasoning: 'Downtrend (SMA50 < SMA200). Avoid new positions.',
        agentId: 86
      };
    } catch (error) {
      console.error('[Agent #86] Error:', error);
      return {
        action: 'hold',
        confidence: 0,
        reasoning: 'Error in momentum analysis',
        agentId: 86
      };
    }
  }

  detectBreakout(priceHistory: number[], volumeHistory: number[]): boolean {
    console.log('[Agent #86] Detecting breakout');

    if (priceHistory.length < 20 || volumeHistory.length < 20) return false;

    const recent20 = priceHistory.slice(-20);
    const high20 = Math.max(...recent20);
    const currentPrice = priceHistory[priceHistory.length - 1];
    const currentVolume = volumeHistory[volumeHistory.length - 1];
    const avgVolume = volumeHistory.slice(-20).reduce((a, b) => a + b, 0) / 20;

    // Price breaks above 20-day high with volume confirmation
    return currentPrice > high20 && currentVolume > avgVolume * 1.5;
  }
}

/**
 * Agent #87: Value Strategy
 * Fundamental analysis, P/E ratios, undervaluation detection
 */
export class Agent87_ValueStrategy {
  private aiOrchestrator?: RateLimitedAIOrchestrator;

  constructor(aiOrchestrator?: RateLimitedAIOrchestrator) {
    this.aiOrchestrator = aiOrchestrator;
  }

  async analyzeValue(symbol: string, fundamentals: {
    pe?: number;
    pb?: number;
    eps?: number;
    revenue?: number;
    marketCap?: number;
  }): Promise<TradeSignal> {
    try {
      console.log(`[Agent #87] Analyzing value for ${symbol}`);

      if (!fundamentals.pe || !fundamentals.pb) {
        return {
          action: 'hold',
          confidence: 0,
          reasoning: 'Insufficient fundamental data',
          agentId: 87
        };
      }

      // Simple value metrics
      const isPEAttractive = fundamentals.pe < 15; // P/E < 15 is attractive
      const isPBAttractive = fundamentals.pb < 1.5; // P/B < 1.5 is attractive

      if (isPEAttractive && isPBAttractive) {
        return {
          action: 'buy',
          confidence: 0.75,
          positionSize: 0.08, // 8% of portfolio
          reasoning: `Strong value: P/E=${fundamentals.pe.toFixed(1)}, P/B=${fundamentals.pb.toFixed(2)}. Both metrics attractive.`,
          agentId: 87
        };
      }

      if (!isPEAttractive && !isPBAttractive) {
        return {
          action: 'sell',
          confidence: 0.6,
          reasoning: `Overvalued: P/E=${fundamentals.pe.toFixed(1)}, P/B=${fundamentals.pb.toFixed(2)}. Both metrics high.`,
          agentId: 87
        };
      }

      return {
        action: 'hold',
        confidence: 0.5,
        reasoning: `Mixed value signals: P/E=${fundamentals.pe.toFixed(1)}, P/B=${fundamentals.pb.toFixed(2)}`,
        agentId: 87
      };
    } catch (error) {
      console.error('[Agent #87] Error:', error);
      return {
        action: 'hold',
        confidence: 0,
        reasoning: 'Error in value analysis',
        agentId: 87
      };
    }
  }
}

/**
 * Agent #88: Arbitrage Hunter
 * Cross-exchange price differences, statistical arbitrage, pairs trading
 */
export class Agent88_ArbitrageHunter {
  detectArbitrage(symbol: string, prices: {
    exchange1: number;
    exchange2: number;
    fees: number;
  }): TradeSignal {
    console.log(`[Agent #88] Detecting arbitrage for ${symbol}`);

    const priceDiff = Math.abs(prices.exchange1 - prices.exchange2);
    const avgPrice = (prices.exchange1 + prices.exchange2) / 2;
    const spreadPercent = (priceDiff / avgPrice) * 100;

    // Account for fees
    const netSpread = spreadPercent - prices.fees;

    if (netSpread > 0.5) { // 0.5% net spread is profitable
      return {
        action: 'buy',
        confidence: 0.9,
        positionSize: 0.03, // 3% for arbitrage (less risk)
        reasoning: `Arbitrage opportunity: ${netSpread.toFixed(2)}% net spread after fees. Buy low, sell high.`,
        agentId: 88
      };
    }

    return {
      action: 'hold',
      confidence: 0.3,
      reasoning: `No arbitrage opportunity. Net spread: ${netSpread.toFixed(2)}%`,
      agentId: 88
    };
  }

  detectPairsTrade(symbol1Prices: number[], symbol2Prices: number[]): {
    signal: 'long_s1_short_s2' | 'short_s1_long_s2' | 'hold';
    confidence: number;
    zScore: number;
  } {
    console.log('[Agent #88] Detecting pairs trade opportunity');

    if (symbol1Prices.length !== symbol2Prices.length || symbol1Prices.length < 30) {
      return { signal: 'hold', confidence: 0, zScore: 0 };
    }

    // Calculate spread
    const spreads = symbol1Prices.map((p1, i) => p1 - symbol2Prices[i]);
    const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length;
    const variance = spreads.reduce((sum, s) => sum + Math.pow(s - avgSpread, 2), 0) / spreads.length;
    const stdDev = Math.sqrt(variance);
    
    const currentSpread = spreads[spreads.length - 1];
    const zScore = (currentSpread - avgSpread) / stdDev;

    if (zScore > 2) { // Spread is 2 std devs above mean
      return {
        signal: 'short_s1_long_s2',
        confidence: 0.75,
        zScore
      };
    }

    if (zScore < -2) { // Spread is 2 std devs below mean
      return {
        signal: 'long_s1_short_s2',
        confidence: 0.75,
        zScore
      };
    }

    return { signal: 'hold', confidence: 0.3, zScore };
  }
}

/**
 * Agent #89: Options Strategy
 * Volatility analysis, Greeks calculation, covered calls, protective puts
 */
export class Agent89_OptionsStrategy {
  recommendCoveredCall(
    currentPrice: number,
    volatility: number,
    holdings: number
  ): TradeSignal {
    console.log('[Agent #89] Analyzing covered call opportunity');

    // Sell calls 10% above current price if volatility is high
    const strikePrice = currentPrice * 1.10;
    const isHighVolatility = volatility > 30; // VIX > 30

    if (isHighVolatility && holdings > 0) {
      return {
        action: 'sell', // sell call options
        confidence: 0.7,
        targetPrice: strikePrice,
        reasoning: `Covered call recommended at strike $${strikePrice.toFixed(2)}. High volatility (${volatility.toFixed(1)}) presents premium opportunity.`,
        agentId: 89
      };
    }

    return {
      action: 'hold',
      confidence: 0.4,
      reasoning: `Volatility too low (${volatility.toFixed(1)}) for attractive covered call premiums.`,
      agentId: 89
    };
  }

  recommendProtectivePut(
    currentPrice: number,
    volatility: number,
    drawdown: number
  ): TradeSignal {
    console.log('[Agent #89] Analyzing protective put opportunity');

    // Buy puts 10% below current price if market is volatile and we're in drawdown
    const strikePrice = currentPrice * 0.90;
    const shouldHedge = volatility > 25 || drawdown > 0.15; // VIX > 25 or >15% drawdown

    if (shouldHedge) {
      return {
        action: 'buy', // buy put options
        confidence: 0.8,
        targetPrice: strikePrice,
        reasoning: `Protective put recommended at strike $${strikePrice.toFixed(2)}. Risk management needed (vol=${volatility.toFixed(1)}, drawdown=${(drawdown * 100).toFixed(1)}%).`,
        agentId: 89
      };
    }

    return {
      action: 'hold',
      confidence: 0.5,
      reasoning: `No hedging needed. Market conditions stable (vol=${volatility.toFixed(1)}, drawdown=${(drawdown * 100).toFixed(1)}%).`,
      agentId: 89
    };
  }
}

/**
 * Agent #90: Mean Reversion
 * Bollinger Band reversions, RSI oversold/overbought, support/resistance
 */
export class Agent90_MeanReversion {
  generateSignal(priceHistory: number[]): TradeSignal {
    try {
      console.log('[Agent #90] Generating mean reversion signal');

      const rsi = calculateRSI(priceHistory);
      const bb = calculateBollingerBands(priceHistory);

      // RSI oversold + price below lower Bollinger Band = strong buy
      if (rsi.value < 30 && bb.percentB < 0) {
        return {
          action: 'buy',
          confidence: 0.85,
          positionSize: 0.06,
          targetPrice: bb.middle,
          stopLoss: bb.lower * 0.95,
          reasoning: `Strong oversold: RSI=${rsi.value.toFixed(1)}, Price below lower BB. Expect mean reversion.`,
          agentId: 90
        };
      }

      // RSI overbought + price above upper Bollinger Band = strong sell
      if (rsi.value > 70 && bb.percentB > 1) {
        return {
          action: 'sell',
          confidence: 0.85,
          targetPrice: bb.middle,
          reasoning: `Strong overbought: RSI=${rsi.value.toFixed(1)}, Price above upper BB. Expect mean reversion.`,
          agentId: 90
        };
      }

      // Moderate oversold
      if (rsi.value < 35) {
        return {
          action: 'buy',
          confidence: 0.65,
          positionSize: 0.04,
          reasoning: `Moderate oversold: RSI=${rsi.value.toFixed(1)}. Potential reversion.`,
          agentId: 90
        };
      }

      // Moderate overbought
      if (rsi.value > 65) {
        return {
          action: 'sell',
          confidence: 0.65,
          reasoning: `Moderate overbought: RSI=${rsi.value.toFixed(1)}. Potential reversion.`,
          agentId: 90
        };
      }

      return {
        action: 'hold',
        confidence: 0.5,
        reasoning: `Neutral zone: RSI=${rsi.value.toFixed(1)}. No mean reversion signal.`,
        agentId: 90
      };
    } catch (error) {
      console.error('[Agent #90] Error:', error);
      return {
        action: 'hold',
        confidence: 0,
        reasoning: 'Error in mean reversion analysis',
        agentId: 90
      };
    }
  }
}

/**
 * Agent #91: AI ML Predictor
 * LSTM price prediction, ensemble models, ML-based signals
 */
export class Agent91_MLPredictor {
  private aiOrchestrator?: RateLimitedAIOrchestrator;

  constructor(aiOrchestrator?: RateLimitedAIOrchestrator) {
    this.aiOrchestrator = aiOrchestrator;
  }

  async generatePrediction(
    symbol: string,
    priceHistory: number[],
    marketData: any
  ): Promise<TradeSignal> {
    try {
      console.log(`[Agent #91] Generating ML prediction for ${symbol}`);

      if (!this.aiOrchestrator) {
        return {
          action: 'hold',
          confidence: 0,
          reasoning: 'AI orchestrator not available',
          agentId: 91
        };
      }

      const recent10 = priceHistory.slice(-10);
      const prompt = `You are a quantitative trading AI. Analyze this price history and predict the next move.

Symbol: ${symbol}
Last 10 prices: ${recent10.join(', ')}
Current price: ${priceHistory[priceHistory.length - 1]}
RSI: ${marketData.rsi || 'N/A'}
Trend: ${marketData.trend || 'N/A'}

Predict:
1. Next price movement (up/down/sideways)
2. Confidence (0-100)
3. Reasoning (1 sentence)

Return JSON: { action: "buy"|"sell"|"hold", confidence: 0-1, reasoning: "..." }`;

      const response = await this.aiOrchestrator.queryWithRateLimit(
        'anthropic',
        'claude-3-5-sonnet-20241022',
        { prompt, temperature: 0.3 },
        { priority: 1 }
      );

      const result = JSON.parse(response.content);

      return {
        action: result.action,
        confidence: result.confidence,
        reasoning: `ML prediction: ${result.reasoning}`,
        agentId: 91,
        positionSize: result.confidence > 0.7 ? 0.05 : 0.03
      };
    } catch (error) {
      console.error('[Agent #91] Error:', error);
      return {
        action: 'hold',
        confidence: 0,
        reasoning: 'Error in ML prediction',
        agentId: 91
      };
    }
  }
}

/**
 * Strategy Engines Coordinator
 * Aggregates all Tier 2 agents
 */
export class StrategyEnginesCoordinator {
  private agent86: Agent86_MomentumStrategy;
  private agent87: Agent87_ValueStrategy;
  private agent88: Agent88_ArbitrageHunter;
  private agent89: Agent89_OptionsStrategy;
  private agent90: Agent90_MeanReversion;
  private agent91: Agent91_MLPredictor;

  constructor(aiOrchestrator?: RateLimitedAIOrchestrator) {
    this.agent86 = new Agent86_MomentumStrategy();
    this.agent87 = new Agent87_ValueStrategy(aiOrchestrator);
    this.agent88 = new Agent88_ArbitrageHunter();
    this.agent89 = new Agent89_OptionsStrategy();
    this.agent90 = new Agent90_MeanReversion();
    this.agent91 = new Agent91_MLPredictor(aiOrchestrator);
  }

  async generateAllSignals(symbol: string, priceHistory: number[], marketData: any): Promise<TradeSignal[]> {
    console.log(`[Strategy Engines] Generating all signals for ${symbol}`);

    const [
      momentumSignal,
      valueSignal,
      meanReversionSignal,
      mlPrediction
    ] = await Promise.all([
      Promise.resolve(this.agent86.generateSignal(priceHistory)),
      this.agent87.analyzeValue(symbol, marketData.fundamentals || {}),
      Promise.resolve(this.agent90.generateSignal(priceHistory)),
      this.agent91.generatePrediction(symbol, priceHistory, marketData)
    ]);

    return [momentumSignal, valueSignal, meanReversionSignal, mlPrediction];
  }
}
