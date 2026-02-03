import { db } from "@db";
import { userTelemetry } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export interface FeatureUsage {
  feature: string;
  users: number;
  avgTimeSpent: number;
  usageCount: number;
}

export interface ChurnPrediction {
  userId: number;
  riskScore: number;
  lastActivityDays: number;
  engagementLevel: string;
}

export class FeatureUsagePathway {
  /**
   * Get usage statistics for all features
   */
  async getFeatureUsage(): Promise<FeatureUsage[]> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const events = await db
        .select()
        .from(userTelemetry)
        .where(gte(userTelemetry.timestamp, sevenDaysAgo));

      const featureData: Record<string, {
        users: Set<number>;
        totalTime: number;
        count: number;
      }> = {};

      events.forEach(event => {
        const feature = event.eventType;
        const userId = event.userId;
        const metadata = event.metadata as any;
        const timeSpent = metadata?.timeSpent || 0;

        if (!featureData[feature]) {
          featureData[feature] = {
            users: new Set(),
            totalTime: 0,
            count: 0,
          };
        }

        featureData[feature].users.add(userId);
        featureData[feature].totalTime += timeSpent;
        featureData[feature].count++;
      });

      return Object.entries(featureData)
        .map(([feature, data]) => ({
          feature,
          users: data.users.size,
          avgTimeSpent: data.count > 0 ? Math.round(data.totalTime / data.count) : 0,
          usageCount: data.count,
        }))
        .sort((a, b) => b.users - a.users);
    } catch (error) {
      console.error('[Feature Usage Pathway] Error getting feature usage:', error);
      return [];
    }
  }

  /**
   * Find features that are rarely or never used
   */
  async findUnusedFeatures(): Promise<string[]> {
    try {
      const allFeatures = await this.getFeatureUsage();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // Get total unique users in the last 30 days
      const recentEvents = await db
        .select()
        .from(userTelemetry)
        .where(gte(userTelemetry.timestamp, thirtyDaysAgo));

      const totalUsers = new Set(recentEvents.map(e => e.userId)).size;

      // Features used by less than 5% of users are considered "unused"
      const unusedFeatures = allFeatures
        .filter(f => {
          const usageRate = totalUsers > 0 ? (f.users / totalUsers) * 100 : 0;
          return usageRate < 5;
        })
        .map(f => f.feature);

      return unusedFeatures;
    } catch (error) {
      console.error('[Feature Usage Pathway] Error finding unused features:', error);
      return [];
    }
  }

  /**
   * Predict users at risk of churning based on engagement
   */
  async predictChurn(): Promise<ChurnPrediction[]> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const events = await db
        .select()
        .from(userTelemetry)
        .where(gte(userTelemetry.timestamp, thirtyDaysAgo));

      // Group events by user
      const userActivity: Record<number, {
        lastActivity: Date;
        eventCount: number;
        uniqueDays: Set<string>;
      }> = {};

      events.forEach(event => {
        const userId = event.userId;
        const date = event.timestamp;
        const dayKey = date.toISOString().split('T')[0];

        if (!userActivity[userId]) {
          userActivity[userId] = {
            lastActivity: date,
            eventCount: 0,
            uniqueDays: new Set(),
          };
        }

        userActivity[userId].eventCount++;
        userActivity[userId].uniqueDays.add(dayKey);
        if (date > userActivity[userId].lastActivity) {
          userActivity[userId].lastActivity = date;
        }
      });

      const now = new Date();
      const churnPredictions: ChurnPrediction[] = [];

      Object.entries(userActivity).forEach(([userIdStr, activity]) => {
        const userId = parseInt(userIdStr);
        const daysSinceLastActivity = Math.floor(
          (now.getTime() - activity.lastActivity.getTime()) / (24 * 60 * 60 * 1000)
        );

        // Calculate risk score (0-100)
        let riskScore = 0;
        
        // Factor 1: Days since last activity (40 points)
        riskScore += Math.min(40, daysSinceLastActivity * 4);
        
        // Factor 2: Low event count (30 points)
        const avgEventsPerDay = activity.eventCount / 30;
        if (avgEventsPerDay < 1) riskScore += 30;
        else if (avgEventsPerDay < 5) riskScore += 15;
        
        // Factor 3: Infrequent usage (30 points)
        const activeDays = activity.uniqueDays.size;
        if (activeDays < 3) riskScore += 30;
        else if (activeDays < 7) riskScore += 15;

        // Determine engagement level
        let engagementLevel = 'high';
        if (riskScore > 70) engagementLevel = 'at-risk';
        else if (riskScore > 40) engagementLevel = 'low';
        else if (riskScore > 20) engagementLevel = 'medium';

        if (riskScore > 40) { // Only include users with medium-high risk
          churnPredictions.push({
            userId,
            riskScore,
            lastActivityDays: daysSinceLastActivity,
            engagementLevel,
          });
        }
      });

      return churnPredictions.sort((a, b) => b.riskScore - a.riskScore);
    } catch (error) {
      console.error('[Feature Usage Pathway] Error predicting churn:', error);
      return [];
    }
  }

  /**
   * Get feature adoption over time
   */
  async getFeatureAdoptionTrend(feature: string, days: number = 30): Promise<{
    date: string;
    users: number;
    usage: number;
  }[]> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const events = await db
        .select()
        .from(userTelemetry)
        .where(
          and(
            eq(userTelemetry.eventType, feature),
            gte(userTelemetry.timestamp, since)
          )
        );

      const dailyData: Record<string, { users: Set<number>; usage: number }> = {};

      events.forEach(event => {
        const dateKey = event.timestamp.toISOString().split('T')[0];
        
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { users: new Set(), usage: 0 };
        }

        dailyData[dateKey].users.add(event.userId);
        dailyData[dateKey].usage++;
      });

      return Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          users: data.users.size,
          usage: data.usage,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('[Feature Usage Pathway] Error getting adoption trend:', error);
      return [];
    }
  }
}

export const featureUsagePathway = new FeatureUsagePathway();
