import { db } from "@shared/db";
import { revenueShares, platformRevenue } from "@shared/schema";
import { eq, and, desc, sum, gte, lte } from "drizzle-orm";
import type { InsertRevenueShare } from "@shared/schema";

/**
 * Revenue Sharing Service (P0 #4)
 * Manages revenue distribution between platform and creators
 */
export class RevenueShareService {
  /**
   * Calculate platform fee based on transaction type
   * Platform fees: Housing 10%, Events 5%, Workshops 15%, Marketplace 8%
   */
  static calculateFees(transactionType: string, totalAmount: number): {
    platformFee: number;
    creatorPayout: number;
  } {
    let feePercentage = 0.10; // Default 10%
    
    switch (transactionType) {
      case "housing":
        feePercentage = 0.10; // 10%
        break;
      case "event_ticket":
        feePercentage = 0.05; // 5%
        break;
      case "workshop":
        feePercentage = 0.15; // 15%
        break;
      case "marketplace":
        feePercentage = 0.08; // 8%
        break;
    }

    const platformFee = Math.round(totalAmount * feePercentage);
    const creatorPayout = totalAmount - platformFee;

    return { platformFee, creatorPayout };
  }

  /**
   * Record revenue share for a transaction
   */
  static async createRevenueShare(params: {
    userId: number;
    transactionType: string;
    transactionId: number;
    role: string;
    totalAmount: number;
    currency?: string;
  }): Promise<typeof revenueShares.$inferSelect> {
    const { platformFee, creatorPayout } = this.calculateFees(
      params.transactionType,
      params.totalAmount
    );

    const [revenueShare] = await db.insert(revenueShares).values({
      userId: params.userId,
      transactionType: params.transactionType,
      transactionId: params.transactionId,
      role: params.role,
      platformFee,
      creatorPayout,
      totalAmount: params.totalAmount,
      currency: params.currency || "USD",
      status: "pending",
    }).returning();

    // Record platform revenue
    await db.insert(platformRevenue).values({
      transactionType: params.transactionType,
      transactionId: params.transactionId,
      amount: platformFee,
      currency: params.currency || "USD",
    });

    return revenueShare;
  }

  /**
   * Get revenue shares for a user
   */
  static async getUserRevenueShares(
    userId: number,
    options?: {
      status?: string;
      transactionType?: string;
      limit?: number;
    }
  ) {
    // Build all conditions upfront
    const conditions = [eq(revenueShares.userId, userId)];

    if (options?.status) {
      conditions.push(eq(revenueShares.status, options.status));
    }

    if (options?.transactionType) {
      conditions.push(eq(revenueShares.transactionType, options.transactionType));
    }

    // Build and execute query with all conditions and modifiers at once
    const baseQuery = db
      .select()
      .from(revenueShares)
      .where(and(...conditions))
      .orderBy(desc(revenueShares.createdAt));

    if (options?.limit) {
      return await baseQuery.limit(options.limit);
    }

    return await baseQuery;
  }

  /**
   * Mark revenue share as paid
   */
  static async markAsPaid(shareId: number, stripeTransferId: string) {
    const [updated] = await db.update(revenueShares)
      .set({
        status: "paid",
        stripeTransferId,
        paidAt: new Date(),
      })
      .where(eq(revenueShares.id, shareId))
      .returning();

    return updated;
  }

  /**
   * Get revenue summary for a user
   */
  static async getRevenueSummary(userId: number, dateRange?: { start: Date; end: Date }) {
    // Build all conditions upfront
    const conditions = [eq(revenueShares.userId, userId)];

    if (dateRange) {
      conditions.push(gte(revenueShares.createdAt, dateRange.start));
      conditions.push(lte(revenueShares.createdAt, dateRange.end));
    }

    // Execute query with all conditions at once
    const [summary] = await db
      .select({
        total: sum(revenueShares.creatorPayout),
        count: sum(revenueShares.id),
      })
      .from(revenueShares)
      .where(and(...conditions));

    // Get breakdown by status
    const statusBreakdown = await db
      .select({
        status: revenueShares.status,
        total: sum(revenueShares.creatorPayout),
      })
      .from(revenueShares)
      .where(eq(revenueShares.userId, userId))
      .groupBy(revenueShares.status);

    return {
      totalEarnings: Number(summary.total) || 0,
      totalTransactions: Number(summary.count) || 0,
      byStatus: statusBreakdown,
    };
  }

  /**
   * Process pending payouts (batch)
   */
  static async processPendingPayouts(userId: number) {
    const pending = await db
      .select()
      .from(revenueShares)
      .where(and(
        eq(revenueShares.userId, userId),
        eq(revenueShares.status, "pending")
      ));

    // In production, this would integrate with Stripe Connect
    // to transfer funds to creator's connected account
    
    return {
      count: pending.length,
      total: pending.reduce((sum, share) => sum + share.creatorPayout, 0),
      shares: pending,
    };
  }
}
