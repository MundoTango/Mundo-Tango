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
 * Budget Tiers:
 * - Free: $10/month ($0.33/day)
 * - Basic: $50/month ($1.67/day)
 * - Pro: $200/month ($6.67/day)
 * - Enterprise: $1000/month ($33.33/day)
 */

import { db } from '../../db';
import { aiSpendTracking, costBudgets, users } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

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
  isNearingLimit: boolean; // 80% threshold
  alertMessage?: string;
}

export interface CostReport {
  userId: number;
  period: string; // YYYY-MM-DD or YYYY-MM
  totalSpend: number;
  requestCount: number;
  totalTokens: number;
  avgCostPerRequest: number;
  topPlatforms: Array<{ platform: string; cost: number; percentage: number }>;
  topModels: Array<{ model: string; cost: number; percentage: number }>;
  dailyBreakdown?: Array<{ date: string; cost: number; requests: number }>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const ALERT_THRESHOLD = 0.80; // Alert at 80% budget usage
const BLOCK_THRESHOLD = 1.00;  // Block at 100% budget usage

// Default budgets (if not in database)
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
   */
  static async trackSpend(options: TrackSpendOptions): Promise<void> {
    try {
      const billingMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

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
    } catch (error: any) {
      console.error(`[CostTracker] ❌ Failed to track spend:`, error.message);
      throw error;
    }
  }

  /**
   * Check budget status for user (before executing request)
   */
  static async checkBudget(userId: number, estimatedCost: number = 0): Promise<BudgetStatus> {
    try {
      // Get user tier
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const tier = user.subscriptionTier || 'free';

      // Get budget configuration
      let budgetConfig = await db.query.costBudgets.findFirst({
        where: eq(costBudgets.tier, tier),
      });

      // Use default if not in DB
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

      // Calculate current month spend
      const billingMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
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
      
      // Fail-open: allow request if budget check fails
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
        // Daily report: filter by timestamp date
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
        // Monthly report: filter by billingMonth
        const billingMonth = targetDate.slice(0, 7); // YYYY-MM
        whereClause = and(
          eq(aiSpendTracking.userId, userId),
          eq(aiSpendTracking.billingMonth, billingMonth)
        );
        periodLabel = billingMonth;
      }

      // Query spend data
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

      // Calculate totals
      const totalSpend = spendData.reduce((sum, record) => sum + Number(record.cost), 0);
      const requestCount = spendData.length;
      const totalTokens = spendData.reduce((sum, record) => sum + record.tokens, 0);
      const avgCostPerRequest = totalSpend / requestCount;

      // Group by platform
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

      // Group by model
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
        // Check if budget exists
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
