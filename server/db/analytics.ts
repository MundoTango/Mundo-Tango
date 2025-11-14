/**
 * ANALYTICS MATERIALIZED VIEWS
 * Performance-optimized views for admin analytics dashboard
 */

import { sql } from "drizzle-orm";
import { db } from "@shared/db";

/**
 * Create materialized views for analytics
 * Run this during migration or app startup
 */
export async function createMaterializedViews() {
  try {
    // Daily Stats View
    await db.execute(sql`
      CREATE MATERIALIZED VIEW IF NOT EXISTS daily_stats AS
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT id) as total_users,
        COUNT(DISTINCT CASE WHEN last_login_at >= CURRENT_DATE - 1 THEN id END) as dau,
        COUNT(DISTINCT CASE WHEN last_login_at >= CURRENT_DATE - 30 THEN id END) as mau
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC;
    `);

    // User Growth View (last 90 days)
    await db.execute(sql`
      CREATE MATERIALIZED VIEW IF NOT EXISTS user_growth_stats AS
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as cumulative_users
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC;
    `);

    // Revenue Stats View (last 12 months)
    await db.execute(sql`
      CREATE MATERIALIZED VIEW IF NOT EXISTS revenue_stats AS
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(DISTINCT user_id) as paying_users,
        SUM(
          CASE 
            WHEN pt.name = 'basic' THEN 5
            WHEN pt.name = 'premium' THEN 15
            WHEN pt.name = 'god_level' THEN 99
            ELSE 0
          END
        ) as mrr
      FROM subscriptions s
      LEFT JOIN pricing_tiers pt ON s.tier_id = pt.id
      WHERE s.status = 'active'
        AND s.created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC;
    `);

    // Engagement Stats View
    await db.execute(sql`
      CREATE MATERIALIZED VIEW IF NOT EXISTS engagement_stats AS
      SELECT 
        'posts' as feature,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM posts
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      
      UNION ALL
      
      SELECT 
        'events' as feature,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM events
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      
      UNION ALL
      
      SELECT 
        'comments' as feature,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM comments
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      
      UNION ALL
      
      SELECT 
        'messages' as feature,
        COUNT(*) as count,
        COUNT(DISTINCT sender_id) as unique_users
      FROM messages
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
    `);

    // Top Event Organizers View
    await db.execute(sql`
      CREATE MATERIALIZED VIEW IF NOT EXISTS top_event_organizers AS
      SELECT 
        u.id,
        u.name,
        u.username,
        COUNT(e.id) as event_count,
        COALESCE(SUM(ea.attendee_count), 0) as total_attendees,
        ROUND(AVG(ea.attendee_count), 1) as avg_attendees_per_event
      FROM users u
      LEFT JOIN events e ON e.user_id = u.id
      LEFT JOIN (
        SELECT event_id, COUNT(*) as attendee_count
        FROM event_attendees
        GROUP BY event_id
      ) ea ON ea.event_id = e.id
      WHERE e.created_at >= CURRENT_DATE - INTERVAL '90 days'
      GROUP BY u.id, u.name, u.username
      HAVING COUNT(e.id) > 0
      ORDER BY event_count DESC
      LIMIT 10;
    `);

    // Top Cities View
    await db.execute(sql`
      CREATE MATERIALIZED VIEW IF NOT EXISTS top_cities_stats AS
      SELECT 
        city,
        COUNT(*) as user_count,
        COUNT(DISTINCT CASE WHEN last_login_at >= CURRENT_DATE - 30 THEN id END) as active_users
      FROM users
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
      ORDER BY user_count DESC
      LIMIT 10;
    `);

    console.log("✅ Materialized views created successfully");
  } catch (error) {
    console.error("Error creating materialized views:", error);
    // Views might already exist, which is fine
  }
}

/**
 * Refresh all materialized views
 * Call this periodically (e.g., every hour via cron)
 */
export async function refreshMaterializedViews() {
  try {
    await db.execute(sql`REFRESH MATERIALIZED VIEW daily_stats;`);
    await db.execute(sql`REFRESH MATERIALIZED VIEW user_growth_stats;`);
    await db.execute(sql`REFRESH MATERIALIZED VIEW revenue_stats;`);
    await db.execute(sql`REFRESH MATERIALIZED VIEW engagement_stats;`);
    await db.execute(sql`REFRESH MATERIALIZED VIEW top_event_organizers;`);
    await db.execute(sql`REFRESH MATERIALIZED VIEW top_cities_stats;`);
    console.log("✅ Materialized views refreshed successfully");
  } catch (error) {
    console.error("Error refreshing materialized views:", error);
  }
}

/**
 * Drop all materialized views (for cleanup/migrations)
 */
export async function dropMaterializedViews() {
  try {
    await db.execute(sql`DROP MATERIALIZED VIEW IF EXISTS daily_stats CASCADE;`);
    await db.execute(sql`DROP MATERIALIZED VIEW IF EXISTS user_growth_stats CASCADE;`);
    await db.execute(sql`DROP MATERIALIZED VIEW IF EXISTS revenue_stats CASCADE;`);
    await db.execute(sql`DROP MATERIALIZED VIEW IF EXISTS engagement_stats CASCADE;`);
    await db.execute(sql`DROP MATERIALIZED VIEW IF EXISTS top_event_organizers CASCADE;`);
    await db.execute(sql`DROP MATERIALIZED VIEW IF EXISTS top_cities_stats CASCADE;`);
    console.log("✅ Materialized views dropped successfully");
  } catch (error) {
    console.error("Error dropping materialized views:", error);
  }
}
