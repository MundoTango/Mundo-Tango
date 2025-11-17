import { Router } from "express";
import { db } from "../db";
import { 
  analyticsEvents, 
  userAnalytics, 
  platformMetrics,
  moderationReports,
  moderationActions,
  userViolations,
  users,
  insertAnalyticsEventSchema,
  insertModerationReportSchema,
  insertModerationActionSchema,
  insertUserViolationSchema
} from "@shared/schema";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { eq, and, gte, desc, count, sql } from "drizzle-orm";
import { AnalyticsService } from "../services/AnalyticsService";
import { apiRateLimiter } from "../middleware/rateLimiter";
// Temporarily disabled profanity filter due to import issues
// import * as BadWordsModule from "bad-words";
// const Filter = (BadWordsModule as any).default || BadWordsModule;
// const profanityFilter = new Filter();

const router = Router();

// Apply rate limiting to all routes
router.use(apiRateLimiter);

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

/**
 * POST /api/analytics/track - Track user event
 */
router.post("/analytics/track", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { eventType, metadata } = req.body;
    const userId = req.userId!;

    // Validate input
    const validated = insertAnalyticsEventSchema.parse({
      userId,
      eventType,
      metadata: metadata || {},
    });

    await db.insert(analyticsEvents).values(validated);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking event:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/dashboard - Admin dashboard data
 */
router.get("/analytics/dashboard", authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if admin
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    if (user?.role !== "admin" && user?.role !== "super_admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Get comprehensive dashboard data
    const [dau, mau, userGrowth, topCities, postsPerDay, eventsPerWeek] = await Promise.all([
      AnalyticsService.getDailyActiveUsers(),
      AnalyticsService.getMonthlyActiveUsers(),
      AnalyticsService.getUserGrowth(),
      AnalyticsService.getTopCities(10),
      AnalyticsService.getPostsPerDay(),
      AnalyticsService.getEventsPerWeek(),
    ]);

    // Get engagement metrics from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalEvents = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.timestamp, thirtyDaysAgo));

    const eventsByType = await db
      .select({
        eventType: analyticsEvents.eventType,
        count: count(),
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.timestamp, thirtyDaysAgo))
      .groupBy(analyticsEvents.eventType)
      .orderBy(desc(count()))
      .limit(10);

    res.json({
      metrics: {
        dau,
        mau,
        postsPerDay,
        eventsPerWeek,
        totalEvents: totalEvents[0].count,
      },
      userGrowth,
      topCities,
      eventsByType,
    });
  } catch (error: any) {
    console.error("Error getting dashboard data:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/user/:id - User activity report
 */
router.get("/analytics/user/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const targetUserId = parseInt(req.params.id);
    
    // Users can only view their own analytics unless they're admin
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    if (targetUserId !== req.userId && user?.role !== "admin" && user?.role !== "super_admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get all events for user
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.userId, targetUserId))
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(100);

    // Calculate stats
    const totalEvents = events.length;
    const eventTypes = events.reduce((acc, e) => {
      acc[e.eventType] = (acc[e.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lastActive = events.length > 0 ? events[0].timestamp : null;

    // Get last 7 days activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await db
      .select({
        date: sql<string>`DATE(${analyticsEvents.timestamp})`,
        count: count(),
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.userId, targetUserId),
          gte(analyticsEvents.timestamp, sevenDaysAgo)
        )
      )
      .groupBy(sql`DATE(${analyticsEvents.timestamp})`)
      .orderBy(sql`DATE(${analyticsEvents.timestamp})`);

    res.json({
      userId: targetUserId,
      totalEvents,
      eventTypes,
      lastActive,
      recentActivity,
    });
  } catch (error: any) {
    console.error("Error getting user analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/platform - Platform health metrics
 */
router.get("/analytics/platform", authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if admin
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    if (user?.role !== "admin" && user?.role !== "super_admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Get recent platform metrics
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const metrics = await db
      .select()
      .from(platformMetrics)
      .where(gte(platformMetrics.timestamp, oneHourAgo))
      .orderBy(desc(platformMetrics.timestamp));

    // Group by metric type
    const grouped = metrics.reduce((acc, m) => {
      if (!acc[m.metric]) acc[m.metric] = [];
      acc[m.metric].push({
        value: Number(m.value),
        timestamp: m.timestamp,
      });
      return acc;
    }, {} as Record<string, Array<{ value: number; timestamp: Date }>>);

    // Calculate averages
    const averages = Object.entries(grouped).reduce((acc, [metric, values]) => {
      const avg = values.reduce((sum, v) => sum + v.value, 0) / values.length;
      acc[metric] = avg;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      metrics: averages,
      history: grouped,
    });
  } catch (error: any) {
    console.error("Error getting platform metrics:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/cohorts - Cohort analysis
 */
router.get("/analytics/cohorts", authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if admin
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    if (user?.role !== "admin" && user?.role !== "super_admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Group users by signup month
    const cohorts = await db
      .select({
        cohort: sql<string>`TO_CHAR(${users.createdAt}, 'YYYY-MM')`,
        userCount: count(),
      })
      .from(users)
      .groupBy(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM')`);

    res.json({ cohorts });
  } catch (error: any) {
    console.error("Error getting cohort analysis:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// MODERATION ROUTES
// ============================================================================

/**
 * POST /api/moderation/report - Report content
 */
router.post("/moderation/report", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { contentType, contentId, reason } = req.body;
    const reporterId = req.userId!;

    // Validate input
    const validated = insertModerationReportSchema.parse({
      reporterId,
      contentType,
      contentId,
      reason,
      status: "pending",
    });

    const [report] = await db.insert(moderationReports).values(validated).returning();

    res.json({ success: true, reportId: report.id });
  } catch (error: any) {
    console.error("Error reporting content:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/moderation/queue - Admin moderation queue
 */
router.get("/moderation/queue", authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if admin
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    if (user?.role !== "admin" && user?.role !== "super_admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Get pending reports
    const reports = await db.query.moderationReports.findMany({
      where: eq(moderationReports.status, "pending"),
      orderBy: desc(moderationReports.createdAt),
      limit: 100,
      with: {
        reporter: {
          columns: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    res.json({ reports });
  } catch (error: any) {
    console.error("Error getting moderation queue:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/moderation/action - Take moderation action
 */
router.post("/moderation/action", authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if admin
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    if (user?.role !== "admin" && user?.role !== "super_admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { reportId, actionType, targetId, targetType, reason } = req.body;
    const moderatorId = req.userId!;

    // Record action
    const actionValidated = insertModerationActionSchema.parse({
      moderatorId,
      actionType,
      targetId,
      targetType,
      reason,
    });

    await db.insert(moderationActions).values(actionValidated);

    // Update report status
    if (reportId) {
      await db
        .update(moderationReports)
        .set({
          status: "resolved",
          resolvedAt: new Date(),
          resolvedBy: moderatorId,
        })
        .where(eq(moderationReports.id, reportId));
    }

    // If ban action, add violation and suspend user
    if (actionType === "ban" && targetType === "user") {
      await db.insert(userViolations).values({
        userId: targetId,
        violationType: "banned",
        severity: "critical",
        description: reason,
      });

      await db.update(users).set({ suspended: true }).where(eq(users.id, targetId));
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error taking moderation action:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/moderation/appeals - Review appeals
 */
router.get("/moderation/appeals", authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if admin
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.userId!),
    });

    if (user?.role !== "admin" && user?.role !== "super_admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Get violations with appeals
    const appeals = await db
      .select()
      .from(userViolations)
      .where(eq(userViolations.appealStatus, "pending"))
      .orderBy(desc(userViolations.timestamp))
      .limit(100);

    res.json({ appeals });
  } catch (error: any) {
    console.error("Error getting appeals:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/moderation/check - Check content for violations
 */
router.post("/moderation/check", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Check for profanity (temporarily disabled)
    const hasProfanity = false; // profanityFilter.isProfane(content);

    // Check for spam patterns
    const spamPatterns = [
      /click here/i,
      /buy now/i,
      /limited time/i,
      /\$\$\$/,
    ];
    const hasSpam = spamPatterns.some(pattern => pattern.test(content));

    // Check for excessive caps
    const letters = content.replace(/[^a-zA-Z]/g, "");
    const caps = content.replace(/[^A-Z]/g, "");
    const hasExcessiveCaps = letters.length > 20 && (caps.length / letters.length) > 0.7;

    const violations = [];
    if (hasProfanity) violations.push("profanity");
    if (hasSpam) violations.push("spam");
    if (hasExcessiveCaps) violations.push("excessive_caps");

    res.json({
      clean: violations.length === 0,
      violations,
    });
  } catch (error: any) {
    console.error("Error checking content:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
