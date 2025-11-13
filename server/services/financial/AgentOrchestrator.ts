/**
 * TIER 6: AGENT ORCHESTRATOR (Agent #105)
 * Master coordination, decision aggregation, conflict resolution, priority scheduling
 */

import { MarketIntelligenceCoordinator } from './MarketIntelligence';
import { StrategyEnginesCoordinator } from './StrategyEngines';
import { ExecutionRiskCoordinator } from './ExecutionRisk';
import { MachineLearningCoordinator } from './MachineLearning';
import { MonitoringAlertsCoordinator } from './MonitoringAlerts';
import { SupportingAgentsCoordinator } from './SupportingAgents';
import type { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';
import type { TradeSignal } from './StrategyEngines';
import type { Alert } from './MonitoringAlerts';
import { storage } from '../../storage';

export interface Agent {
  id: number;
  name: string;
  tier: number;
  status: 'active' | 'inactive' | 'error';
  lastRun?: Date;
  successRate?: number;
  decisions?: number;
}

export interface AgentDecision {
  agentId: number;
  agentName: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  timestamp: Date;
}

export interface OrchestratorDecision {
  finalAction: 'buy' | 'sell' | 'hold';
  confidence: number;
  consensusStrength: number; // 0-1
  participatingAgents: number;
  dissenterAgents: number;
  reasoning: string;
  individualDecisions: AgentDecision[];
  timestamp: Date;
}

/**
 * Agent #105: Master Orchestrator
 * Coordinates all 33 agents, aggregates decisions, resolves conflicts
 */
export class Agent105_MasterOrchestrator {
  private marketIntelligence: MarketIntelligenceCoordinator;
  private strategyEngines: StrategyEnginesCoordinator;
  private executionRisk: ExecutionRiskCoordinator;
  private machineLearning: MachineLearningCoordinator;
  private monitoringAlerts: MonitoringAlertsCoordinator;
  private supportingAgents: SupportingAgentsCoordinator;
  private aiOrchestrator?: RateLimitedAIOrchestrator;

  private agents: Map<number, Agent> = new Map();
  private systemActive: boolean = false;

  constructor(aiOrchestrator?: RateLimitedAIOrchestrator) {
    this.marketIntelligence = new MarketIntelligenceCoordinator(aiOrchestrator);
    this.strategyEngines = new StrategyEnginesCoordinator(aiOrchestrator);
    this.executionRisk = new ExecutionRiskCoordinator();
    this.machineLearning = new MachineLearningCoordinator(aiOrchestrator);
    this.monitoringAlerts = new MonitoringAlertsCoordinator();
    this.supportingAgents = new SupportingAgentsCoordinator();
    this.aiOrchestrator = aiOrchestrator;

    this.initializeAgents();
  }

  private initializeAgents() {
    console.log('[Agent #105] Initializing all 33 agents');

    // Tier 1: Market Intelligence (Agents #81-85)
    for (let i = 81; i <= 85; i++) {
      this.agents.set(i, {
        id: i,
        name: this.getAgentName(i),
        tier: 1,
        status: 'active',
        successRate: 0.75,
        decisions: 0
      });
    }

    // Tier 2: Strategy Engines (Agents #86-91)
    for (let i = 86; i <= 91; i++) {
      this.agents.set(i, {
        id: i,
        name: this.getAgentName(i),
        tier: 2,
        status: 'active',
        successRate: 0.70,
        decisions: 0
      });
    }

    // Tier 3: Execution & Risk (Agents #92-97)
    for (let i = 92; i <= 97; i++) {
      this.agents.set(i, {
        id: i,
        name: this.getAgentName(i),
        tier: 3,
        status: 'active',
        successRate: 0.85,
        decisions: 0
      });
    }

    // Tier 4: Machine Learning (Agents #98-101)
    for (let i = 98; i <= 101; i++) {
      this.agents.set(i, {
        id: i,
        name: this.getAgentName(i),
        tier: 4,
        status: 'active',
        successRate: 0.65,
        decisions: 0
      });
    }

    // Tier 5: Monitoring & Alerts (Agents #102-104)
    for (let i = 102; i <= 104; i++) {
      this.agents.set(i, {
        id: i,
        name: this.getAgentName(i),
        tier: 5,
        status: 'active',
        successRate: 0.95,
        decisions: 0
      });
    }

    // Supporting Agents (Agents #73-80)
    for (let i = 73; i <= 80; i++) {
      this.agents.set(i, {
        id: i,
        name: this.getAgentName(i),
        tier: 0,
        status: 'active',
        successRate: 0.90,
        decisions: 0
      });
    }

    // Agent #105 (self)
    this.agents.set(105, {
      id: 105,
      name: 'Master Orchestrator',
      tier: 6,
      status: 'active',
      successRate: 1.0,
      decisions: 0
    });

    console.log(`[Agent #105] Initialized ${this.agents.size} agents across 6 tiers`);
  }

  private getAgentName(id: number): string {
    const names: Record<number, string> = {
      73: 'Capital Manager',
      74: 'Tax Optimizer',
      75: 'Fee Minimizer',
      76: 'Slippage Analyzer',
      77: 'Latency Monitor',
      78: 'Data Quality Checker',
      79: 'Backup System',
      80: 'Emergency Shutdown',
      81: 'Market Data Aggregator',
      82: 'News Sentiment Analyzer',
      83: 'Social Media Monitor',
      84: 'Pattern Recognition Engine',
      85: 'Competitor Tracking',
      86: 'Momentum Strategy',
      87: 'Value Strategy',
      88: 'Arbitrage Hunter',
      89: 'Options Strategy',
      90: 'Mean Reversion',
      91: 'AI ML Predictor',
      92: 'Trade Executor',
      93: 'Position Sizer',
      94: 'Risk Manager',
      95: 'Portfolio Rebalancer',
      96: 'Liquidity Manager',
      97: 'Compliance Monitor',
      98: 'Model Trainer',
      99: 'Prediction Aggregator',
      100: 'Performance Attribution',
      101: 'Market Regime Classifier',
      102: 'Performance Monitor',
      103: 'Alert Generator',
      104: 'Report Generator',
      105: 'Master Orchestrator'
    };

    return names[id] || `Agent #${id}`;
  }

  /**
   * Start the agent system
   */
  async start(): Promise<{ success: boolean; message: string; agentsStarted: number }> {
    console.log('[Agent #105] 🚀 Starting Financial Management AI Agent System');

    this.systemActive = true;

    // Initialize agents in database
    const agentIds = Array.from(this.agents.keys());
    
    for (const id of agentIds) {
      const agent = this.agents.get(id)!;
      
      try {
        // Check if agent exists in DB
        const existingAgent = await storage.getFinancialAgentById(id);
        
        if (!existingAgent) {
          // Create agent in database
          await storage.createFinancialAgent({
            agentNumber: id,
            name: agent.name,
            tier: agent.tier,
            role: agent.name,
            status: 'active',
            isEnabled: true,
            lastRun: new Date(),
            successRate: (agent.successRate! * 100).toString(),
            totalDecisions: 0
          });
        }
      } catch (error) {
        console.error(`[Agent #105] Error initializing agent ${id}:`, error);
      }
    }

    console.log(`[Agent #105] ✅ ${this.agents.size} agents started successfully`);

    return {
      success: true,
      message: `Financial Management AI Agent System started. ${this.agents.size} agents active.`,
      agentsStarted: this.agents.size
    };
  }

  /**
   * Stop the agent system
   */
  async stop(): Promise<{ success: boolean; message: string }> {
    console.log('[Agent #105] 🛑 Stopping Financial Management AI Agent System');

    this.systemActive = false;

    // Mark all agents as inactive in database
    for (const [id, agent] of this.agents.entries()) {
      agent.status = 'inactive';
      
      try {
        await storage.updateFinancialAgent(id, { status: 'inactive', isEnabled: false });
      } catch (error) {
        console.error(`[Agent #105] Error stopping agent ${id}:`, error);
      }
    }

    return {
      success: true,
      message: 'Financial Management AI Agent System stopped.'
    };
  }

  /**
   * Run a complete monitoring cycle (called every 30 seconds)
   */
  async runMonitoringCycle(
    userId: number,
    portfolioValue: number
  ): Promise<{
    decision?: OrchestratorDecision;
    alerts: Alert[];
    performance: any;
    agentsRun: number;
    errors: number;
  }> {
    console.log('[Agent #105] 🔄 Running 30-second monitoring cycle');

    if (!this.systemActive) {
      console.log('[Agent #105] System is not active. Skipping cycle.');
      return {
        alerts: [],
        performance: null,
        agentsRun: 0,
        errors: 0
      };
    }

    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Step 1: Gather market intelligence (Tier 1)
      const symbol = 'BTC'; // Example symbol
      const priceHistory = Array.from({ length: 100 }, (_, i) => 50000 + Math.random() * 1000);
      const priceData = priceHistory.map((price, i) => ({
        timestamp: new Date(Date.now() - (100 - i) * 60000),
        open: price,
        high: price * 1.01,
        low: price * 0.99,
        close: price,
        volume: Math.random() * 1000000
      }));

      const marketIntel = await this.marketIntelligence.gatherMarketIntelligence(
        symbol,
        priceHistory,
        priceData
      );

      // Step 2: Generate trading signals (Tier 2)
      const signals = await this.strategyEngines.generateAllSignals(
        symbol,
        priceHistory,
        marketIntel
      );

      // Step 3: Aggregate signals and make decision (Tier 4 - Agent #99)
      const decision = this.aggregateDecisions(signals);

      // Step 4: Log decision to database
      if (decision && decision.finalAction !== 'hold') {
        await this.logDecision(userId, symbol, decision);
      }

      // Step 5: Monitor performance (Tier 5)
      const monitoring = await this.monitoringAlerts.runMonitoringCycle(
        {
          history: priceHistory,
          value: portfolioValue
        },
        [],
        new Map([[symbol, priceHistory[priceHistory.length - 1]]]),
        new Map()
      );

      // Step 6: Log monitoring data
      await this.logMonitoring(userId, monitoring);

      const duration = Date.now() - startTime;
      console.log(`[Agent #105] ✅ Cycle completed in ${duration}ms`);

      return {
        decision,
        alerts: monitoring.alerts,
        performance: monitoring.performance,
        agentsRun: this.agents.size,
        errors: errors.length
      };
    } catch (error) {
      console.error('[Agent #105] Error in monitoring cycle:', error);
      errors.push((error as Error).message);

      return {
        alerts: [],
        performance: null,
        agentsRun: 0,
        errors: errors.length
      };
    }
  }

  /**
   * Aggregate all agent signals into a single decision using weighted voting
   */
  private aggregateDecisions(signals: TradeSignal[]): OrchestratorDecision {
    console.log(`[Agent #105] Aggregating ${signals.length} agent signals`);

    if (signals.length === 0) {
      return {
        finalAction: 'hold',
        confidence: 0,
        consensusStrength: 0,
        participatingAgents: 0,
        dissenterAgents: 0,
        reasoning: 'No signals received from strategy agents',
        individualDecisions: [],
        timestamp: new Date()
      };
    }

    // Convert to agent decisions
    const decisions: AgentDecision[] = signals.map(s => ({
      agentId: s.agentId,
      agentName: this.getAgentName(s.agentId),
      action: s.action,
      confidence: s.confidence,
      reasoning: s.reasoning,
      timestamp: new Date()
    }));

    // Weighted voting: weight by agent success rate and signal confidence
    const weightedVotes = {
      buy: 0,
      sell: 0,
      hold: 0
    };

    for (const decision of decisions) {
      const agent = this.agents.get(decision.agentId);
      const weight = (agent?.successRate || 0.5) * decision.confidence;
      
      weightedVotes[decision.action] += weight;
    }

    // Determine final action
    const totalWeight = weightedVotes.buy + weightedVotes.sell + weightedVotes.hold;
    let finalAction: 'buy' | 'sell' | 'hold';
    let confidence: number;

    if (weightedVotes.buy > weightedVotes.sell && weightedVotes.buy > weightedVotes.hold) {
      finalAction = 'buy';
      confidence = weightedVotes.buy / totalWeight;
    } else if (weightedVotes.sell > weightedVotes.buy && weightedVotes.sell > weightedVotes.hold) {
      finalAction = 'sell';
      confidence = weightedVotes.sell / totalWeight;
    } else {
      finalAction = 'hold';
      confidence = weightedVotes.hold / totalWeight;
    }

    // Calculate consensus strength
    const maxVotes = Math.max(weightedVotes.buy, weightedVotes.sell, weightedVotes.hold);
    const consensusStrength = maxVotes / totalWeight;

    // Count dissenters
    const majority = decisions.filter(d => d.action === finalAction);
    const dissenters = decisions.filter(d => d.action !== finalAction);

    const reasoning = `Decision: ${finalAction.toUpperCase()} with ${(confidence * 100).toFixed(1)}% confidence. ` +
      `Consensus: ${(consensusStrength * 100).toFixed(1)}%. ` +
      `Votes: BUY=${weightedVotes.buy.toFixed(2)}, SELL=${weightedVotes.sell.toFixed(2)}, HOLD=${weightedVotes.hold.toFixed(2)}. ` +
      `${majority.length} agents agree, ${dissenters.length} dissent.`;

    return {
      finalAction,
      confidence,
      consensusStrength,
      participatingAgents: signals.length,
      dissenterAgents: dissenters.length,
      reasoning,
      individualDecisions: decisions,
      timestamp: new Date()
    };
  }

  /**
   * Log decision to database
   */
  private async logDecision(userId: number, symbol: string, decision: OrchestratorDecision) {
    try {
      await storage.createFinancialAIDecision({
        userId,
        agentId: 105, // Master Orchestrator
        symbol,
        action: decision.finalAction,
        confidence: decision.confidence.toString(),
        reasoning: decision.reasoning,
        executedAt: null, // Not yet executed
        profitLoss: null
      });

      console.log(`[Agent #105] Logged decision: ${decision.finalAction} ${symbol}`);
    } catch (error) {
      console.error('[Agent #105] Error logging decision:', error);
    }
  }

  /**
   * Log monitoring data
   */
  private async logMonitoring(userId: number, monitoring: any) {
    try {
      await storage.createFinancialMonitoring({
        userId,
        checkType: 'opportunity',
        findings: {
          performance: monitoring.performance,
          alerts: monitoring.alerts.length,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('[Agent #105] Error logging monitoring:', error);
    }
  }

  /**
   * Get status of all agents
   */
  getAgentStatus(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get system status
   */
  getSystemStatus(): {
    active: boolean;
    totalAgents: number;
    activeAgents: number;
    inactiveAgents: number;
    errorAgents: number;
  } {
    const agents = Array.from(this.agents.values());
    
    return {
      active: this.systemActive,
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'active').length,
      inactiveAgents: agents.filter(a => a.status === 'inactive').length,
      errorAgents: agents.filter(a => a.status === 'error').length
    };
  }

  /**
   * Override a specific agent's decision
   */
  async overrideAgent(agentId: number, newStatus: 'active' | 'inactive'): Promise<{
    success: boolean;
    message: string;
  }> {
    console.log(`[Agent #105] Overriding agent ${agentId} to ${newStatus}`);

    const agent = this.agents.get(agentId);
    if (!agent) {
      return {
        success: false,
        message: `Agent #${agentId} not found`
      };
    }

    agent.status = newStatus;

    try {
      await storage.updateFinancialAgent(agentId, {
        status: newStatus,
        isEnabled: newStatus === 'active'
      });

      return {
        success: true,
        message: `Agent #${agentId} (${agent.name}) set to ${newStatus}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Error updating agent: ${(error as Error).message}`
      };
    }
  }
}
