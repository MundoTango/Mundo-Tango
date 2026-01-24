import { db } from "../core/connection";
import {
  analyticsEvents,
  analyticsConsent,
  activityLogs,
  communityStats,
  crossPlatformAnalytics,
  marketplaceAnalytics,
  costRecords,
  type InsertAnalyticsEvent,
  type SelectAnalyticsEvent,
} from "@shared/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

/**
 * AnalyticsRepository - Handles all analytics, stats, and activity logging operations
 * Migrated from DbStorage class as part of Sprint 2.2
 * 
 * Manages:
 * - Analytics event tracking
 * - User consent management  
 * - Activity logs
 * - Community statistics
 * - Cross-platform analytics
 * - Marketplace analytics
 * - Cost tracking
 * 
 * @see server/storage.ts (legacy DbStorage class)
 */
export class AnalyticsRepository {
  // Analytics Events
  async createAnalyticsEvent(eventData: InsertAnalyticsEvent): Promise<SelectAnalyticsEvent> {
    const [event] = await db.insert(analyticsEvents).values(eventData).returning();
    return event;
  }

  async createAnalyticsConsent(consentData: any): Promise<any> {
    const [consent] = await db.insert(analyticsConsent).values(consentData).returning();
    return consent;
  }

  async createCrossPlatformAnalytics(analyticsData: any): Promise<any> {
    const [analytics] = await db.insert(crossPlatformAnalytics).values(analyticsData).returning();
    return analytics;
  }

  async createMarketplaceAnalytics(analyticsData: any): Promise<any> {
    const [analytics] = await db.insert(marketplaceAnalytics).values(analyticsData).returning();
    return analytics;
  }

  // Activity Logs
  async createActivityLog(logData: any): Promise<any> {
    const [log] = await db.insert(activityLogs).values(logData).returning();
    return log;
  }

  async getActivityLog(userId: number, params: { limit?: number; offset?: number }): Promise<any[]> {
    const { limit = 100, offset = 0 } = params;
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async analyzeActivityPatterns(userId: number): Promise<any> {
    // Placeholder for activity pattern analysis
    return null;
  }

  // Community Stats (already partially in GroupRepository, but keeping for compatibility)
  async createCommunityStats(statsData: any): Promise<any> {
    const [stats] = await db.insert(communityStats).values(statsData).returning();
    return stats;
  }

  async getCommunityStats(cityId: number): Promise<any | undefined> {
    const [stats] = await db
      .select()
      .from(communityStats)
      .where(eq(communityStats.cityId, cityId))
      .limit(1);
    return stats;
  }

  async getAllCommunityStats(): Promise<any[]> {
    return await db
      .select()
      .from(communityStats)
      .orderBy(desc(communityStats.totalMembers));
  }

  async updateCommunityStats(cityId: number, data: any): Promise<any | undefined> {
    const [updated] = await db
      .update(communityStats)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(communityStats.cityId, cityId))
      .returning();
    return updated;
  }

  // Cost Records
  async createCostRecord(costData: any): Promise<any> {
    const [cost] = await db.insert(costRecords).values(costData).returning();
    return cost;
  }

  async getCostAnalytics(params: { startDate?: Date; endDate?: Date }): Promise<any> {
    // Placeholder for cost analytics
    return null;
  }
}

// Export singleton instance
export const analyticsRepository = new AnalyticsRepository();
