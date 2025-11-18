/**
 * MB.MD v9.3: SuperAGI-Style Agent Telemetry Service (Phase 5)
 * 
 * Production observability, cost tracking, and performance monitoring.
 * Enables visibility into agent behavior and spending at scale.
 * 
 * Features:
 * - Per-agent cost tracking (daily/monthly budgets)
 * - Performance metrics (latency, tokens, API calls)
 * - Success rate monitoring
 * - Budget alerts and auto-throttling
 * - Real-time dashboards
 * 
 * Inspired by: SuperAGI production patterns
 */

import { db } from "@db";
import { 
  agentOperationMetrics,
  agentCostBudgets,
  type InsertAgentOperationMetric,
  type InsertAgentCostBudget,
  type SelectAgentOperationMetric,
  type SelectAgentCostBudget
} from "@shared/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

interface TelemetryConfig {
  enableCostTracking: boolean;
  enablePerformanceTracking: boolean;
  budgetAlertThreshold: number; // 0-1
  defaultDailyBudgetUSD: number;
  defaultMonthlyBudgetUSD: number;
}

interface OperationMetrics {
  agentId: string;
  operation: string;
  pageId?: string;
  durationMs: number;
  tokensUsed?: number;
  costUSD?: number;
  cacheHitRate?: number;
  databaseQueries?: number;
  apiCalls?: number;
  success: boolean;
  errorType?: string;
  errorMessage?: string;
  memoryMB?: number;
  cpuPercent?: number;
}

interface AgentStats {
  agentId: string;
  totalOperations: number;
  successRate: number;
  avgDurationMs: number;
  totalCostUSD: number;
  totalTokensUsed: number;
  budgetStatus: 'ok' | 'warning' | 'exceeded';
}

export class AgentTelemetryService {
  private static readonly DEFAULT_CONFIG: TelemetryConfig = {
    enableCostTracking: true,
    enablePerformanceTracking: true,
    budgetAlertThreshold: 0.8,
    defaultDailyBudgetUSD: 1.0,
    defaultMonthlyBudgetUSD: 10.0
  };

  private static config: TelemetryConfig = this.DEFAULT_CONFIG;

  static configure(config: Partial<TelemetryConfig>) {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // OPERATION TRACKING
  // ============================================================================

  /**
   * Track an agent operation with automatic cost calculation
   */
  static async trackOperation<T>(
    agentId: string,
    operation: string,
    fn: () => Promise<T>,
    options?: { pageId?: string; tokensUsed?: number }
  ): Promise<T> {
    const startTime = Date.now();
    let success = true;
    let errorType: string | undefined;
    let errorMessage: string | undefined;
    let result: T;

    try {
      result = await fn();
    } catch (error: any) {
      success = false;
      errorType = error.name || 'UnknownError';
      errorMessage = error.message || 'Unknown error';
      throw error;
    } finally {
      const durationMs = Date.now() - startTime;
      
      if (this.config.enablePerformanceTracking) {
        await this.recordMetrics({
          agentId,
          operation,
          pageId: options?.pageId,
          durationMs,
          tokensUsed: options?.tokensUsed || 0,
          costUSD: this.calculateCost(options?.tokensUsed || 0),
          success,
          errorType,
          errorMessage
        });
      }

      if (this.config.enableCostTracking) {
        const cost = this.calculateCost(options?.tokensUsed || 0);
        await this.updateBudget(agentId, cost);
      }
    }

    return result!;
  }

  /**
   * Record operation metrics
   */
  static async recordMetrics(metrics: OperationMetrics): Promise<SelectAgentOperationMetric> {
    const [record] = await db
      .insert(agentOperationMetrics)
      .values({
        agentId: metrics.agentId,
        operation: metrics.operation,
        pageId: metrics.pageId,
        durationMs: metrics.durationMs,
        tokensUsed: metrics.tokensUsed || 0,
        costUSD: metrics.costUSD || 0,
        cacheHitRate: metrics.cacheHitRate,
        databaseQueries: metrics.databaseQueries || 0,
        apiCalls: metrics.apiCalls || 0,
        success: metrics.success,
        errorType: metrics.errorType,
        errorMessage: metrics.errorMessage,
        memoryMB: metrics.memoryMB,
        cpuPercent: metrics.cpuPercent
      })
      .returning();

    return record;
  }

  /**
   * Calculate cost based on tokens (simplified pricing)
   */
  private static calculateCost(tokensUsed: number): number {
    // Simplified: $0.01 per 1000 tokens (GPT-4o pricing ballpark)
    return (tokensUsed / 1000) * 0.01;
  }

  // ============================================================================
  // BUDGET MANAGEMENT
  // ============================================================================

  /**
   * Initialize budget for agent
   */
  static async initializeBudget(
    agentId: string,
    dailyBudgetUSD?: number,
    monthlyBudgetUSD?: number
  ): Promise<SelectAgentCostBudget> {
    const existing = await this.getBudget(agentId);
    if (existing) {
      return existing;
    }

    const [budget] = await db
      .insert(agentCostBudgets)
      .values({
        agentId,
        dailyBudgetUSD: dailyBudgetUSD ?? this.config.defaultDailyBudgetUSD,
        monthlyBudgetUSD: monthlyBudgetUSD ?? this.config.defaultMonthlyBudgetUSD,
        alertThreshold: this.config.budgetAlertThreshold
      })
      .returning();

    return budget;
  }

  /**
   * Get budget for agent
   */
  static async getBudget(agentId: string): Promise<SelectAgentCostBudget | null> {
    const [budget] = await db
      .select()
      .from(agentCostBudgets)
      .where(eq(agentCostBudgets.agentId, agentId))
      .limit(1);

    return budget || null;
  }

  /**
   * Update budget after operation
   */
  private static async updateBudget(agentId: string, costUSD: number): Promise<void> {
    let budget = await this.getBudget(agentId);
    
    if (!budget) {
      budget = await this.initializeBudget(agentId);
    }

    const now = new Date();
    
    // Check if daily reset needed
    const daysSinceReset = Math.floor(
      (now.getTime() - new Date(budget.lastDailyReset).getTime()) / (1000 * 60 * 60 * 24)
    );
    const todaySpent = daysSinceReset >= 1 ? 0 : budget.todaySpentUSD + costUSD;
    const lastDailyReset = daysSinceReset >= 1 ? now : budget.lastDailyReset;

    // Check if monthly reset needed
    const monthsSinceReset = Math.floor(
      (now.getTime() - new Date(budget.lastMonthlyReset).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const monthSpent = monthsSinceReset >= 1 ? 0 : budget.monthSpentUSD + costUSD;
    const lastMonthlyReset = monthsSinceReset >= 1 ? now : budget.lastMonthlyReset;

    // Check if budget exceeded
    const dailyExceeded = todaySpent > budget.dailyBudgetUSD;
    const monthlyExceeded = monthSpent > budget.monthlyBudgetUSD;
    const budgetExceeded = dailyExceeded || monthlyExceeded;

    await db
      .update(agentCostBudgets)
      .set({
        todaySpentUSD: todaySpent,
        monthSpentUSD: monthSpent,
        lastDailyReset,
        lastMonthlyReset,
        budgetExceeded,
        updatedAt: now
      })
      .where(eq(agentCostBudgets.id, budget.id));

    // Alert if threshold exceeded
    if (todaySpent > budget.dailyBudgetUSD * budget.alertThreshold && !dailyExceeded) {
      console.warn(
        `[AgentTelemetry] WARNING: Agent ${agentId} has spent $${todaySpent.toFixed(2)} of daily budget $${budget.dailyBudgetUSD.toFixed(2)} (${Math.round(todaySpent / budget.dailyBudgetUSD * 100)}%)`
      );
    }

    if (budgetExceeded) {
      console.error(
        `[AgentTelemetry] ALERT: Agent ${agentId} has exceeded budget! Daily: $${todaySpent.toFixed(2)}/$${budget.dailyBudgetUSD.toFixed(2)}, Monthly: $${monthSpent.toFixed(2)}/$${budget.monthlyBudgetUSD.toFixed(2)}`
      );
    }
  }

  /**
   * Check if agent can execute operation (budget check)
   */
  static async canExecute(agentId: string): Promise<boolean> {
    const budget = await this.getBudget(agentId);
    return budget ? !budget.budgetExceeded : true;
  }

  // ============================================================================
  // ANALYTICS & DASHBOARDS
  // ============================================================================

  /**
   * Get agent statistics
   */
  static async getAgentStats(
    agentId: string,
    timeframe?: { start: Date; end: Date }
  ): Promise<AgentStats> {
    let query = db
      .select()
      .from(agentOperationMetrics)
      .where(eq(agentOperationMetrics.agentId, agentId));

    if (timeframe) {
      query = query
        .where(gte(agentOperationMetrics.timestamp, timeframe.start))
        .where(lte(agentOperationMetrics.timestamp, timeframe.end));
    }

    const operations = await query;

    const totalOperations = operations.length;
    const successCount = operations.filter(op => op.success).length;
    const successRate = totalOperations > 0 ? successCount / totalOperations : 0;
    const avgDurationMs = totalOperations > 0 
      ? operations.reduce((sum, op) => sum + op.durationMs, 0) / totalOperations 
      : 0;
    const totalCostUSD = operations.reduce((sum, op) => sum + (op.costUSD || 0), 0);
    const totalTokensUsed = operations.reduce((sum, op) => sum + (op.tokensUsed || 0), 0);

    const budget = await this.getBudget(agentId);
    const budgetStatus = budget?.budgetExceeded 
      ? 'exceeded' 
      : budget && budget.todaySpentUSD > budget.dailyBudgetUSD * budget.alertThreshold 
        ? 'warning' 
        : 'ok';

    return {
      agentId,
      totalOperations,
      successRate,
      avgDurationMs,
      totalCostUSD,
      totalTokensUsed,
      budgetStatus: budgetStatus as 'ok' | 'warning' | 'exceeded'
    };
  }

  /**
   * Get top expensive agents
   */
  static async getTopExpensiveAgents(
    limit: number = 10,
    timeframe?: { start: Date; end: Date }
  ): Promise<Array<{ agentId: string; totalCostUSD: number; operationCount: number }>> {
    let query = db
      .select({
        agentId: agentOperationMetrics.agentId,
        totalCostUSD: sql<number>`SUM(${agentOperationMetrics.costUSD})`,
        operationCount: sql<number>`COUNT(*)`
      })
      .from(agentOperationMetrics);

    if (timeframe) {
      query = query
        .where(gte(agentOperationMetrics.timestamp, timeframe.start))
        .where(lte(agentOperationMetrics.timestamp, timeframe.end));
    }

    const results = await query
      .groupBy(agentOperationMetrics.agentId)
      .orderBy(desc(sql`SUM(${agentOperationMetrics.costUSD})`))
      .limit(limit);

    return results;
  }

  /**
   * Get slowest operations
   */
  static async getSlowestOperations(
    limit: number = 10,
    timeframe?: { start: Date; end: Date }
  ): Promise<SelectAgentOperationMetric[]> {
    let query = db
      .select()
      .from(agentOperationMetrics);

    if (timeframe) {
      query = query
        .where(gte(agentOperationMetrics.timestamp, timeframe.start))
        .where(lte(agentOperationMetrics.timestamp, timeframe.end));
    }

    return await query
      .orderBy(desc(agentOperationMetrics.durationMs))
      .limit(limit);
  }

  /**
   * Get error statistics
   */
  static async getErrorStats(
    timeframe?: { start: Date; end: Date }
  ): Promise<Array<{ errorType: string; count: number; agentIds: string[] }>> {
    let query = db
      .select({
        errorType: agentOperationMetrics.errorType,
        count: sql<number>`COUNT(*)`,
        agentIds: sql<string[]>`ARRAY_AGG(DISTINCT ${agentOperationMetrics.agentId})`
      })
      .from(agentOperationMetrics)
      .where(eq(agentOperationMetrics.success, false));

    if (timeframe) {
      query = query
        .where(gte(agentOperationMetrics.timestamp, timeframe.start))
        .where(lte(agentOperationMetrics.timestamp, timeframe.end));
    }

    return await query
      .groupBy(agentOperationMetrics.errorType)
      .orderBy(desc(sql`COUNT(*)`));
  }

  /**
   * Get cost summary across all agents
   */
  static async getCostSummary(
    timeframe?: { start: Date; end: Date }
  ): Promise<{ totalCostUSD: number; totalOperations: number; avgCostPerOperation: number }> {
    let query = db
      .select({
        totalCostUSD: sql<number>`SUM(${agentOperationMetrics.costUSD})`,
        totalOperations: sql<number>`COUNT(*)`
      })
      .from(agentOperationMetrics);

    if (timeframe) {
      query = query
        .where(gte(agentOperationMetrics.timestamp, timeframe.start))
        .where(lte(agentOperationMetrics.timestamp, timeframe.end));
    }

    const [result] = await query;

    return {
      totalCostUSD: result.totalCostUSD || 0,
      totalOperations: result.totalOperations || 0,
      avgCostPerOperation: result.totalOperations > 0 
        ? (result.totalCostUSD || 0) / result.totalOperations 
        : 0
    };
  }

  // ============================================================================
  // BUDGET REPORTING
  // ============================================================================

  /**
   * Get all agents with budget alerts
   */
  static async getBudgetAlerts(): Promise<SelectAgentCostBudget[]> {
    return await db
      .select()
      .from(agentCostBudgets)
      .where(eq(agentCostBudgets.budgetExceeded, true));
  }

  /**
   * Reset budget for agent (admin function)
   */
  static async resetBudget(agentId: string): Promise<void> {
    await db
      .update(agentCostBudgets)
      .set({
        todaySpentUSD: 0,
        monthSpentUSD: 0,
        lastDailyReset: new Date(),
        lastMonthlyReset: new Date(),
        budgetExceeded: false,
        updatedAt: new Date()
      })
      .where(eq(agentCostBudgets.agentId, agentId));
  }
}
