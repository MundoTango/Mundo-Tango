import { db } from "@shared/db";
import { users, posts, events, subscriptions } from "@shared/schema";
import { sql, gte, and, eq } from "drizzle-orm";

export class AnalyticsService {
  /**
   * Calculate Daily Active Users (DAU)
   * Users who logged in within the last 24 hours
   */
  static async getDailyActiveUsers(): Promise<number> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const result = await db.select({ 
      count: sql<number>`count(distinct ${users.id})` 
    })
    .from(users)
    .where(gte(users.lastLoginAt, yesterday));
    
    return Number(result[0]?.count) || 0;
  }
  
  /**
   * Calculate Monthly Active Users (MAU)
   * Users who logged in within the last 30 days
   */
  static async getMonthlyActiveUsers(): Promise<number> {
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    
    const result = await db.select({ 
      count: sql<number>`count(distinct ${users.id})` 
    })
    .from(users)
    .where(gte(users.lastLoginAt, lastMonth));
    
    return Number(result[0]?.count) || 0;
  }
  
  /**
   * Calculate Monthly Recurring Revenue (MRR)
   * Sum of all active monthly subscriptions
   */
  static async getMRR(): Promise<number> {
    const result = await db.select({
      total: sql<number>`COALESCE(sum(${subscriptions.amount}), 0)`
    })
    .from(subscriptions)
    .where(and(
      eq(subscriptions.status, 'active'),
      eq(subscriptions.billingInterval, 'monthly')
    ));
    
    return Number(result[0]?.total) || 0;
  }
  
  /**
   * Calculate churn rate
   * Percentage of users who cancelled in the last month
   */
  static async getChurnRate(): Promise<number> {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const cancelled = await db.select({ 
      count: sql<number>`count(*)` 
    })
    .from(subscriptions)
    .where(gte(subscriptions.cancelledAt, lastMonth));
    
    const total = await db.select({ 
      count: sql<number>`count(*)` 
    })
    .from(subscriptions)
    .where(eq(subscriptions.status, 'active'));
    
    const cancelledCount = Number(cancelled[0]?.count) || 0;
    const totalCount = Number(total[0]?.count) || 1;
    
    return (cancelledCount / totalCount) * 100;
  }
  
  /**
   * Get user growth data (last 30 days)
   * Returns daily new user signups
   */
  static async getUserGrowth(): Promise<{ date: string; count: number }[]> {
    const result = await db.execute(sql`
      SELECT 
        TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as date,
        COUNT(*)::integer as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    
    return (result.rows as any[]).map(row => ({
      date: row.date,
      count: Number(row.count)
    }));
  }
  
  /**
   * Get revenue trends (last 12 months)
   * Returns monthly revenue aggregation
   */
  static async getRevenueTrends(): Promise<{ month: string; revenue: number }[]> {
    const result = await db.execute(sql`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
        COALESCE(SUM(amount), 0)::integer as revenue
      FROM subscriptions
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `);
    
    return (result.rows as any[]).map(row => ({
      month: row.month,
      revenue: Number(row.revenue)
    }));
  }
  
  /**
   * Get top cities by user count
   */
  static async getTopCities(limit: number = 10): Promise<{ city: string; count: number }[]> {
    const result = await db.select({
      city: users.city,
      count: sql<number>`count(*)`
    })
    .from(users)
    .where(sql`${users.city} IS NOT NULL AND ${users.city} != ''`)
    .groupBy(users.city)
    .orderBy(sql`count(*) DESC`)
    .limit(limit);
    
    return result.map(row => ({
      city: row.city || 'Unknown',
      count: Number(row.count)
    }));
  }
  
  /**
   * Get top event organizers
   */
  static async getTopOrganizers(limit: number = 10): Promise<{ 
    id: number;
    username: string; 
    displayName: string | null;
    eventCount: number 
  }[]> {
    const result = await db.execute(sql`
      SELECT 
        u.id,
        u.username,
        u.name as display_name,
        COUNT(e.id)::integer as event_count
      FROM users u
      JOIN events e ON e.organizer_id = u.id
      GROUP BY u.id, u.username, u.name
      ORDER BY event_count DESC
      LIMIT ${limit}
    `);
    
    return (result.rows as any[]).map(row => ({
      id: Number(row.id),
      username: row.username,
      displayName: row.display_name,
      eventCount: Number(row.event_count)
    }));
  }
  
  /**
   * Get posts per day average (last 7 days)
   */
  static async getPostsPerDay(): Promise<number> {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*)::integer / 7 as avg_per_day
      FROM posts
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    
    return Number(result.rows[0]?.avg_per_day) || 0;
  }
  
  /**
   * Get events per week average (last 4 weeks)
   */
  static async getEventsPerWeek(): Promise<number> {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*)::integer / 4 as avg_per_week
      FROM events
      WHERE created_at >= NOW() - INTERVAL '4 weeks'
    `);
    
    return Number(result.rows[0]?.avg_per_week) || 0;
  }
}
