/**
 * CostTracker - Budget Monitoring & Spend Tracking
 * 
 * Real-time cost tracking per user with budget enforcement:
 * - Track spend in ai_spend_tracking table
 * - Check against cost_budgets per user tier
 * - Alert at 80% budget threshold
 * - Block requests at 100% budget exceeded
 * - Generate daily/weekly cost reports
 * 
 * ENHANCEMENT 1: Real-Time Budget Warnings (Learning #18)
 * - WebSocket notifications at 80%, 95%, 100% thresholds
 * - Alert history stored in budget_alerts table
 * - Duplicate prevention per billing period
 * 
 * ENHANCEMENT 2: Cost Prediction Model (Learning #11)
 * - Daily/weekly spending pattern tracking
 * - Average burn rate calculation
 * - Budget exhaustion date prediction
 * 
 * ENHANCEMENT 3: Detailed Cost Breakdowns (Learning #19)
 * - Breakdown by model (GPT-4o, Claude, Llama, etc.)
 * - Breakdown by tier (tier-0, tier-1, tier-2, tier-3)
 * - Breakdown by time period (today, week, month)
 * - Cost per query averages
 * - Most expensive queries tracking
 * 
 * Budget Tiers:
 * - Free: $10/month ($0.33/day)
 * - Basic: $50/month ($1.67/day)
 * - Pro: $200/month ($6.67/day)
 * - Enterprise: $1000/month ($33.33/day)
 */

import { db } from '../../db';
import { aiSpendTracking, costBudgets, budgetAlerts, users } from '@shared/schema';
import { eq, and, gte, sql, desc, lte } from 'drizzle-orm';
import { broadcastToUser } from '../websocket';

// ============================================================================
// TYPES
// ============================================================================

export interface TrackSpendOptions {
  userId: number;
  platform: string;
  model: string;
  cost: number;
  tokens: number;
  inputTokens?: number;
  outputTokens?: number;
  requestType?: string;
  useCase?: string;
}

export interface BudgetStatus {
  tier: string;
  monthlyLimit: number;
  currentSpend: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
  isNearingLimit: boolean;
  alertMessage?: string;
}

export interface CostReport {
  userId: number;
  period: string;
  totalSpend: number;
  requestCount: number;
  totalTokens: number;
  avgCostPerRequest: number;
  topPlatforms: Array<{ platform: string; cost: number; percentage: number }>;
  topModels: Array<{ model: string; cost: number; percentage: number }>;
  dailyBreakdown?: Array<{ date: string; cost: number; requests: number }>;
}

export interface CostPrediction {
  projectedDate: string | null;
  daysRemaining: number | null;
  burnRate: number;
  dailyAverage: number;
  weeklyAverage: number;
  currentSpend: number;
  monthlyLimit: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface ModelBreakdown {
  model: string;
  platform: string;
  cost: number;
  requests: number;
  tokens: number;
  percentage: number;
  avgCostPerRequest: number;
}

export interface TierBreakdown {
  tier: string;
  cost: number;
  requests: number;
  tokens: number;
  percentage: number;
}

export interface TimeBreakdown {
  period: 'today' | 'week' | 'month';
  cost: number;
  requests: number;
  tokens: number;
  avgCostPerRequest: number;
}

export interface ExpensiveQuery {
  id: number;
  platform: string;
  model: string;
  cost: number;
  tokens: number;
  timestamp: Date;
  requestType?: string;
  useCase?: string;
}

export interface DetailedStats {
  userId: number;
  period: string;
  modelBreakdowns: ModelBreakdown[];
  tierBreakdowns: TierBreakdown[];
  timeBreakdowns: TimeBreakdown[];
  totalStats: {
    totalSpend: number;
    totalRequests: number;
    totalTokens: number;
    avgCostPerRequest: number;
  };
  mostExpensiveQueries: ExpensiveQuery[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const ALERT_THRESHOLD = 0.80;
const CRITICAL_THRESHOLD = 0.95;
const BLOCK_THRESHOLD = 1.00;

const DEFAULT_BUDGETS: Record<string, { monthlyLimit: number; alertThreshold: number }> = {
  free: { monthlyLimit: 10.00, alertThreshold: 80.00 },
  basic: { monthlyLimit: 50.00, alertThreshold: 80.00 },
  pro: { monthlyLimit: 200.00, alertThreshold: 80.00 },
  enterprise: { monthlyLimit: 1000.00, alertThreshold: 80.00 },
};

// ============================================================================
// COST TRACKER SERVICE
// ============================================================================

export class CostTracker {
  /**
   * Track AI spend in database
   * After tracking, check for budget threshold alerts
   */
  static async trackSpend(options: TrackSpendOptions): Promise<void> {
    try {
      const billingMonth = new Date().toISOString().slice(0, 7);

      await db.insert(aiSpendTracking).values({
        userId: options.userId,
        platform: options.platform,
        model: options.model,
        cost: options.cost.toString(),
        tokens: options.tokens,
        inputTokens: options.inputTokens,
        outputTokens: options.outputTokens,
        requestType: options.requestType,
        useCase: options.useCase,
        billingMonth,
      });

      console.log(
        `[CostTracker] ✅ Tracked spend: User ${options.userId} | ` +
        `${options.platform}/${options.model} | $${options.cost.toFixed(6)} | ${options.tokens} tokens`
      );

      await this.checkAndSendBudgetAlerts(options.userId);
    } catch (error: any) {
      console.error(`[CostTracker] ❌ Failed to track spend:`, error.message);
      throw error;
    }
  }

  /**
   * ENHANCEMENT 1: Check budget and send real-time WebSocket alerts
   * Triggers alerts at 80%, 95%, and 100% thresholds
   */
  static async checkAndSendBudgetAlerts(userId: number): Promise<void> {
    try {
      const budgetStatus = await this.checkBudget(userId);
      const billingMonth = new Date().toISOString().slice(0, 7);
      
      let alertType: string | null = null;
      let threshold: number | null = null;

      if (budgetStatus.percentageUsed >= 100) {
        alertType = 'budget-exceeded';
        threshold = 100;
      } else if (budgetStatus.percentageUsed >= 95) {
        alertType = 'budget-critical';
        threshold = 95;
      } else if (budgetStatus.percentageUsed >= 80) {
        alertType = 'budget-warning';
        threshold = 80;
      }

      if (alertType && threshold) {
        const alreadySent = await db.query.budgetAlerts.findFirst({
          where: and(
            eq(budgetAlerts.userId, userId),
            eq(budgetAlerts.alertType, alertType),
            eq(budgetAlerts.billingMonth, billingMonth)
          ),
        });

        if (!alreadySent) {
          await db.insert(budgetAlerts).values({
            userId,
            alertType,
            threshold: threshold.toString(),
            currentSpend: budgetStatus.currentSpend.toString(),
            monthlyLimit: budgetStatus.monthlyLimit.toString(),
            percentageUsed: budgetStatus.percentageUsed.toString(),
            billingMonth,
            notificationSent: true,
            notificationMethod: 'websocket',
          });

          broadcastToUser(userId, alertType, {
            threshold,
            currentSpend: budgetStatus.currentSpend,
            monthlyLimit: budgetStatus.monthlyLimit,
            percentageUsed: budgetStatus.percentageUsed,
            remaining: budgetStatus.remaining,
            tier: budgetStatus.tier,
            message: budgetStatus.alertMessage,
          });

          console.log(
            `[CostTracker] 🚨 Alert sent: User ${userId} | ${alertType} | ` +
            `${budgetStatus.percentageUsed.toFixed(1)}% used`
          );
        }
      }
    } catch (error: any) {
      console.error(`[CostTracker] ❌ Failed to check/send alerts:`, error.message);
    }
  }

  /**
   * Check budget status for user (before executing request)
   */
  static async checkBudget(userId: number, estimatedCost: number = 0): Promise<BudgetStatus> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const tier = user.subscriptionTier || 'free';

      let budgetConfig = await db.query.costBudgets.findFirst({
        where: eq(costBudgets.tier, tier),
      });

      if (!budgetConfig) {
        const defaults = DEFAULT_BUDGETS[tier] || DEFAULT_BUDGETS.free;
        budgetConfig = {
          id: 0,
          tier,
          monthlyLimit: defaults.monthlyLimit.toString(),
          alertThreshold: defaults.alertThreshold.toString(),
          maxCostPerRequest: null,
          maxTokensPerRequest: null,
          maxRequestsPerMinute: null,
          maxRequestsPerDay: null,
          allowPremiumModels: tier !== 'free',
          allowCascadeEscalation: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      const billingMonth = new Date().toISOString().slice(0, 7);
      const spendRecords = await db
        .select({
          totalCost: sql<number>`CAST(SUM(CAST(${aiSpendTracking.cost} AS NUMERIC)) AS NUMERIC)`,
        })
        .from(aiSpendTracking)
        .where(
          and(
            eq(aiSpendTracking.userId, userId),
            eq(aiSpendTracking.billingMonth, billingMonth)
          )
        );

      const currentSpend = Number(spendRecords[0]?.totalCost || 0);
      const monthlyLimit = Number(budgetConfig.monthlyLimit);
      const remaining = Math.max(0, monthlyLimit - currentSpend - estimatedCost);
      const percentageUsed = (currentSpend / monthlyLimit) * 100;
      const isOverBudget = currentSpend + estimatedCost >= monthlyLimit;
      const isNearingLimit = percentageUsed >= Number(budgetConfig.alertThreshold);

      let alertMessage: string | undefined;
      if (isOverBudget) {
        alertMessage = `Budget exceeded! ${percentageUsed.toFixed(1)}% used ($${currentSpend.toFixed(2)}/$${monthlyLimit.toFixed(2)})`;
      } else if (isNearingLimit) {
        alertMessage = `Budget warning: ${percentageUsed.toFixed(1)}% used ($${currentSpend.toFixed(2)}/$${monthlyLimit.toFixed(2)})`;
      }

      console.log(
        `[CostTracker] Budget check: User ${userId} (${tier}) | ` +
        `${percentageUsed.toFixed(1)}% used | $${currentSpend.toFixed(2)}/$${monthlyLimit.toFixed(2)}`
      );

      return {
        tier,
        monthlyLimit,
        currentSpend,
        remaining,
        percentageUsed,
        isOverBudget,
        isNearingLimit,
        alertMessage,
      };
    } catch (error: any) {
      console.error(`[CostTracker] ❌ Budget check failed:`, error.message);
      
      return {
        tier: 'free',
        monthlyLimit: 10,
        currentSpend: 0,
        remaining: 10,
        percentageUsed: 0,
        isOverBudget: false,
        isNearingLimit: false,
      };
    }
  }

  /**
   * ENHANCEMENT 2: Cost Prediction Model
   * Analyzes spending patterns and predicts when budget will be exhausted
   */
  static async predictBudgetExhaustion(userId: number): Promise<CostPrediction> {
    try {
      const billingMonth = new Date().toISOString().slice(0, 7);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysSoFar = now.getDate();

      const monthSpend = await db
        .select()
        .from(aiSpendTracking)
        .where(
          and(
            eq(aiSpendTracking.userId, userId),
            eq(aiSpendTracking.billingMonth, billingMonth)
          )
        );

      if (monthSpend.length === 0) {
        const budgetStatus = await this.checkBudget(userId);
        return {
          projectedDate: null,
          daysRemaining: null,
          burnRate: 0,
          dailyAverage: 0,
          weeklyAverage: 0,
          currentSpend: 0,
          monthlyLimit: budgetStatus.monthlyLimit,
          confidence: 'low',
        };
      }

      const totalSpend = monthSpend.reduce((sum, r) => sum + Number(r.cost), 0);
      const dailyAverage = totalSpend / daysSoFar;
      const weeklyAverage = dailyAverage * 7;

      const last7Days = monthSpend.filter(r => {
        const recordDate = new Date(r.timestamp);
        const daysDiff = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      });

      const burnRate = last7Days.length > 0
        ? last7Days.reduce((sum, r) => sum + Number(r.cost), 0) / Math.min(7, daysSoFar)
        : dailyAverage;

      const budgetStatus = await this.checkBudget(userId);
      const remaining = budgetStatus.remaining;

      let projectedDate: string | null = null;
      let daysRemaining: number | null = null;
      let confidence: 'high' | 'medium' | 'low' = 'low';

      if (burnRate > 0 && remaining > 0) {
        daysRemaining = Math.floor(remaining / burnRate);
        const exhaustionDate = new Date(now);
        exhaustionDate.setDate(exhaustionDate.getDate() + daysRemaining);
        projectedDate = exhaustionDate.toISOString().slice(0, 10);

        if (last7Days.length >= 7) {
          confidence = 'high';
        } else if (daysSoFar >= 3) {
          confidence = 'medium';
        }
      }

      console.log(
        `[CostTracker] 📊 Prediction: User ${userId} | ` +
        `Burn rate: $${burnRate.toFixed(2)}/day | ` +
        `Days remaining: ${daysRemaining || 'N/A'} | ` +
        `Confidence: ${confidence}`
      );

      return {
        projectedDate,
        daysRemaining,
        burnRate,
        dailyAverage,
        weeklyAverage,
        currentSpend: totalSpend,
        monthlyLimit: budgetStatus.monthlyLimit,
        confidence,
      };
    } catch (error: any) {
      console.error(`[CostTracker] ❌ Prediction failed:`, error.message);
      throw error;
    }
  }

  /**
   * ENHANCEMENT 3: Detailed Cost Breakdowns
   * Comprehensive stats by model, tier, time period, and expensive queries
   */
  static async getUserStats(userId: number, billingMonth?: string): Promise<DetailedStats> {
    try {
      const month = billingMonth || new Date().toISOString().slice(0, 7);
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);

      const allSpend = await db
        .select()
        .from(aiSpendTracking)
        .where(
          and(
            eq(aiSpendTracking.userId, userId),
            eq(aiSpendTracking.billingMonth, month)
          )
        )
        .orderBy(desc(aiSpendTracking.timestamp));

      if (allSpend.length === 0) {
        return {
          userId,
          period: month,
          modelBreakdowns: [],
          tierBreakdowns: [],
          timeBreakdowns: [],
          totalStats: {
            totalSpend: 0,
            totalRequests: 0,
            totalTokens: 0,
            avgCostPerRequest: 0,
          },
          mostExpensiveQueries: [],
        };
      }

      const totalSpend = allSpend.reduce((sum, r) => sum + Number(r.cost), 0);
      const totalTokens = allSpend.reduce((sum, r) => sum + r.tokens, 0);

      const modelMap = new Map<string, { platform: string; cost: number; requests: number; tokens: number }>();
      allSpend.forEach(r => {
        const key = `${r.platform}:${r.model}`;
        const existing = modelMap.get(key) || { platform: r.platform, cost: 0, requests: 0, tokens: 0 };
        existing.cost += Number(r.cost);
        existing.requests += 1;
        existing.tokens += r.tokens;
        modelMap.set(key, existing);
      });

      const modelBreakdowns: ModelBreakdown[] = Array.from(modelMap.entries())
        .map(([key, data]) => {
          const model = key.split(':')[1];
          return {
            model,
            platform: data.platform,
            cost: data.cost,
            requests: data.requests,
            tokens: data.tokens,
            percentage: (data.cost / totalSpend) * 100,
            avgCostPerRequest: data.cost / data.requests,
          };
        })
        .sort((a, b) => b.cost - a.cost);

      const tierMap = new Map<string, { cost: number; requests: number; tokens: number }>();
      allSpend.forEach(r => {
        const tierKey = this.inferTierFromModel(r.model);
        const existing = tierMap.get(tierKey) || { cost: 0, requests: 0, tokens: 0 };
        existing.cost += Number(r.cost);
        existing.requests += 1;
        existing.tokens += r.tokens;
        tierMap.set(tierKey, existing);
      });

      const tierBreakdowns: TierBreakdown[] = Array.from(tierMap.entries())
        .map(([tier, data]) => ({
          tier,
          cost: data.cost,
          requests: data.requests,
          tokens: data.tokens,
          percentage: (data.cost / totalSpend) * 100,
        }))
        .sort((a, b) => b.cost - a.cost);

      const todaySpend = allSpend.filter(r => new Date(r.timestamp) >= todayStart);
      const weekSpend = allSpend.filter(r => new Date(r.timestamp) >= weekStart);

      const timeBreakdowns: TimeBreakdown[] = [
        {
          period: 'today',
          cost: todaySpend.reduce((sum, r) => sum + Number(r.cost), 0),
          requests: todaySpend.length,
          tokens: todaySpend.reduce((sum, r) => sum + r.tokens, 0),
          avgCostPerRequest: todaySpend.length > 0 
            ? todaySpend.reduce((sum, r) => sum + Number(r.cost), 0) / todaySpend.length 
            : 0,
        },
        {
          period: 'week',
          cost: weekSpend.reduce((sum, r) => sum + Number(r.cost), 0),
          requests: weekSpend.length,
          tokens: weekSpend.reduce((sum, r) => sum + r.tokens, 0),
          avgCostPerRequest: weekSpend.length > 0 
            ? weekSpend.reduce((sum, r) => sum + Number(r.cost), 0) / weekSpend.length 
            : 0,
        },
        {
          period: 'month',
          cost: totalSpend,
          requests: allSpend.length,
          tokens: totalTokens,
          avgCostPerRequest: totalSpend / allSpend.length,
        },
      ];

      const mostExpensiveQueries: ExpensiveQuery[] = allSpend
        .sort((a, b) => Number(b.cost) - Number(a.cost))
        .slice(0, 10)
        .map(r => ({
          id: r.id,
          platform: r.platform,
          model: r.model,
          cost: Number(r.cost),
          tokens: r.tokens,
          timestamp: r.timestamp,
          requestType: r.requestType || undefined,
          useCase: r.useCase || undefined,
        }));

      console.log(
        `[CostTracker] 📈 Stats generated: User ${userId} | ` +
        `Models: ${modelBreakdowns.length} | ` +
        `Tiers: ${tierBreakdowns.length} | ` +
        `Total: $${totalSpend.toFixed(6)}`
      );

      return {
        userId,
        period: month,
        modelBreakdowns,
        tierBreakdowns,
        timeBreakdowns,
        totalStats: {
          totalSpend,
          totalRequests: allSpend.length,
          totalTokens,
          avgCostPerRequest: totalSpend / allSpend.length,
        },
        mostExpensiveQueries,
      };
    } catch (error: any) {
      console.error(`[CostTracker] ❌ Stats generation failed:`, error.message);
      throw error;
    }
  }

  /**
   * Helper: Infer tier from model name
   */
  private static inferTierFromModel(model: string): string {
    const lowerModel = model.toLowerCase();
    if (lowerModel.includes('gpt-4') || lowerModel.includes('claude-3-opus') || lowerModel.includes('claude-3.5')) {
      return 'tier-3';
    } else if (lowerModel.includes('gpt-3.5') || lowerModel.includes('claude-3-sonnet')) {
      return 'tier-2';
    } else if (lowerModel.includes('claude-3-haiku') || lowerModel.includes('gemini-1.5-flash')) {
      return 'tier-1';
    } else {
      return 'tier-0';
    }
  }

  /**
   * Generate cost report for user (daily or monthly)
   */
  static async generateReport(
    userId: number,
    period: 'daily' | 'monthly' = 'monthly',
    date?: string
  ): Promise<CostReport> {
    try {
      const now = new Date();
      const targetDate = date || now.toISOString().slice(0, 10);
      
      let whereClause;
      let periodLabel: string;

      if (period === 'daily') {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        whereClause = and(
          eq(aiSpendTracking.userId, userId),
          gte(aiSpendTracking.timestamp, startOfDay),
          sql`${aiSpendTracking.timestamp} < ${endOfDay}`
        );
        periodLabel = targetDate;
      } else {
        const billingMonth = targetDate.slice(0, 7);
        whereClause = and(
          eq(aiSpendTracking.userId, userId),
          eq(aiSpendTracking.billingMonth, billingMonth)
        );
        periodLabel = billingMonth;
      }

      const spendData = await db
        .select()
        .from(aiSpendTracking)
        .where(whereClause);

      if (spendData.length === 0) {
        return {
          userId,
          period: periodLabel,
          totalSpend: 0,
          requestCount: 0,
          totalTokens: 0,
          avgCostPerRequest: 0,
          topPlatforms: [],
          topModels: [],
        };
      }

      const totalSpend = spendData.reduce((sum, record) => sum + Number(record.cost), 0);
      const requestCount = spendData.length;
      const totalTokens = spendData.reduce((sum, record) => sum + record.tokens, 0);
      const avgCostPerRequest = totalSpend / requestCount;

      const platformMap = new Map<string, number>();
      spendData.forEach(record => {
        const current = platformMap.get(record.platform) || 0;
        platformMap.set(record.platform, current + Number(record.cost));
      });

      const topPlatforms = Array.from(platformMap.entries())
        .map(([platform, cost]) => ({
          platform,
          cost,
          percentage: (cost / totalSpend) * 100,
        }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5);

      const modelMap = new Map<string, number>();
      spendData.forEach(record => {
        const current = modelMap.get(record.model) || 0;
        modelMap.set(record.model, current + Number(record.cost));
      });

      const topModels = Array.from(modelMap.entries())
        .map(([model, cost]) => ({
          model,
          cost,
          percentage: (cost / totalSpend) * 100,
        }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5);

      console.log(
        `[CostTracker] ✅ Report generated: User ${userId} | Period: ${periodLabel} | ` +
        `Total spend: $${totalSpend.toFixed(6)} | Requests: ${requestCount}`
      );

      return {
        userId,
        period: periodLabel,
        totalSpend,
        requestCount,
        totalTokens,
        avgCostPerRequest,
        topPlatforms,
        topModels,
      };
    } catch (error: any) {
      console.error(`[CostTracker] ❌ Report generation failed:`, error.message);
      throw error;
    }
  }

  /**
   * Initialize default budget tiers in database
   */
  static async initializeDefaultBudgets(): Promise<void> {
    try {
      for (const [tier, config] of Object.entries(DEFAULT_BUDGETS)) {
        const existing = await db.query.costBudgets.findFirst({
          where: eq(costBudgets.tier, tier),
        });

        if (!existing) {
          await db.insert(costBudgets).values({
            tier,
            monthlyLimit: config.monthlyLimit.toString(),
            alertThreshold: config.alertThreshold.toString(),
            maxCostPerRequest: tier === 'free' ? '0.01' : null,
            maxTokensPerRequest: null,
            maxRequestsPerMinute: tier === 'free' ? 10 : tier === 'basic' ? 30 : tier === 'pro' ? 100 : 1000,
            maxRequestsPerDay: tier === 'free' ? 100 : tier === 'basic' ? 1000 : tier === 'pro' ? 10000 : 100000,
            allowPremiumModels: tier !== 'free',
            allowCascadeEscalation: true,
          });

          console.log(`[CostTracker] ✅ Initialized budget tier: ${tier} ($${config.monthlyLimit}/month)`);
        }
      }
    } catch (error: any) {
      console.error(`[CostTracker] ❌ Failed to initialize budgets:`, error.message);
    }
  }

  /**
   * Get total platform spend (across all users)
   */
  static async getPlatformTotalSpend(billingMonth?: string): Promise<{
    month: string;
    totalSpend: number;
    totalRequests: number;
    totalTokens: number;
  }> {
    const month = billingMonth || new Date().toISOString().slice(0, 7);

    const result = await db
      .select({
        totalCost: sql<number>`CAST(SUM(CAST(${aiSpendTracking.cost} AS NUMERIC)) AS NUMERIC)`,
        totalRequests: sql<number>`COUNT(*)`,
        totalTokens: sql<number>`SUM(${aiSpendTracking.tokens})`,
      })
      .from(aiSpendTracking)
      .where(eq(aiSpendTracking.billingMonth, month));

    return {
      month,
      totalSpend: Number(result[0]?.totalCost || 0),
      totalRequests: Number(result[0]?.totalRequests || 0),
      totalTokens: Number(result[0]?.totalTokens || 0),
    };
  }
}
