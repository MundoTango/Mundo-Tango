/**
 * ADMIN DASHBOARD ROUTES
 * 12 endpoints: User management, content moderation, platform stats
 */

import { Router, Response } from "express";
import { db } from "@shared/db";
import { users, posts, postReports, events, userReports } from "@shared/schema";
import { eq, desc, like, or, and, gte, count, sql } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { storage } from "../storage";

const router = Router();

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * GET /api/admin/stats/overview
 * Overview metrics for admin dashboard
 */
router.get("/stats/overview", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await storage.getAdminStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/moderation/queue
 * Get pending moderation items
 */
router.get("/moderation/queue", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const queue = await storage.getModerationQueue();
    res.json(queue);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/moderation/:reportId/action
 * Take action on moderation report
 */
router.post("/moderation/:reportId/action", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, notes } = req.body;
    
    // TODO: Implement moderation action logic
    // actions: 'dismiss', 'warn', 'remove', 'suspend', 'ban'
    
    res.json({ success: true, reportId, action });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/activity/recent
 * Get recent user activity
 */
router.get("/activity/recent", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = "20" } = req.query;
    const activities = await storage.getRecentAdminActivity();
    res.json(activities.slice(0, parseInt(limit as string)));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users
 * Get all users with pagination and filters
 */
router.get("/users", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { page = "1", limit = "50", search = "", role = "" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db.select().from(users).$dynamic();

    // Add search filter
    if (search && typeof search === "string") {
      query = query.where(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.username, `%${search}%`)
        ) as any
      );
    }

    // Add role filter
    if (role && typeof role === "string") {
      query = query.where(eq(users.role, role));
    }

    const results = await query.limit(limitNum).offset(offset);
    const totalCount = await db.select({ count: count() }).from(users);

    res.json({
      users: results,
      total: totalCount[0]?.count || 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error: any) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/users/:userId
 * Update user role or status
 */
router.patch("/users/:userId", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { userId } = req.params;
    const { role, verified } = req.body;

    const updated = await db.update(users)
      .set({ role, isVerified: verified, updatedAt: new Date() })
      .where(eq(users.id, parseInt(userId)))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/users/:userId
 * Delete or ban user
 */
router.delete("/users/:userId", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { userId } = req.params;
    const { action = "delete" } = req.query;

    if (action === "ban") {
      // Ban user by setting role to 'guest'
      await db.update(users)
        .set({ role: "guest", updatedAt: new Date() })
        .where(eq(users.id, parseInt(userId)));
    } else {
      // Delete user
      await db.delete(users).where(eq(users.id, parseInt(userId)));
    }

    res.json({ success: true, userId, action });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/content/flagged
 * Get flagged content (posts, comments, etc.)
 */
router.get("/content/flagged", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { status = "pending" } = req.query;

    const flaggedReports = await db.select({
      id: postReports.id,
      reporterId: postReports.reporterId,
      postId: postReports.postId,
      reason: postReports.reason,
      status: postReports.status,
      createdAt: postReports.createdAt,
    })
      .from(postReports)
      .where(eq(postReports.status, status as string))
      .orderBy(desc(postReports.createdAt))
      .limit(50);

    res.json(flaggedReports);
  } catch (error: any) {
    console.error("Error fetching flagged content:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/content/:contentId/moderate
 * Moderate content (approve, remove, warn)
 */
router.post("/content/:contentId/moderate", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { contentId } = req.params;
    const { action, contentType } = req.body;

    if (action === "remove" && contentType === "post") {
      // Delete the post
      await db.delete(posts).where(eq(posts.id, parseInt(contentId)));
    }

    // Update report status to resolved
    await db.update(postReports)
      .set({ status: "resolved" })
      .where(eq(postReports.postId, parseInt(contentId)));

    res.json({ success: true, contentId, action });
  } catch (error: any) {
    console.error("Error moderating content:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/platform/health
 * Platform health metrics
 */
router.get("/platform/health", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const totalUsers = await db.select({ count: count() }).from(users);
    const totalPosts = await db.select({ count: count() }).from(posts);
    const totalEvents = await db.select({ count: count() }).from(events);

    // Check active users (posted in last 24h)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const activeUsers = await db.select({
      count: sql<number>`COUNT(DISTINCT ${posts.userId})`,
    })
      .from(posts)
      .where(gte(posts.createdAt, oneDayAgo));

    res.json({
      status: "healthy",
      totalUsers: totalUsers[0]?.count || 0,
      totalPosts: totalPosts[0]?.count || 0,
      totalEvents: totalEvents[0]?.count || 0,
      activeUsers24h: activeUsers[0]?.count || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching platform health:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/reports/analytics
 * Get admin analytics reports
 */
router.get("/reports/analytics", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { timeframe = "7d" } = req.query;
    const days = parseInt(timeframe as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const postStats = await db.select({ count: count() })
      .from(posts)
      .where(gte(posts.createdAt, startDate));

    const eventStats = await db.select({ count: count() })
      .from(events)
      .where(gte(events.createdAt, startDate));

    const userGrowth = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, startDate));

    res.json({
      timeframe,
      posts: postStats[0]?.count || 0,
      events: eventStats[0]?.count || 0,
      newUsers: userGrowth[0]?.count || 0,
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/user-growth
 * User growth over time
 */
router.get("/analytics/user-growth", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { timeframe = "30d" } = req.query;
    const days = parseInt(timeframe as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const growth = await db.select({
      date: sql<string>`DATE(${users.createdAt})`,
      count: count(),
    })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    res.json(growth);
  } catch (error: any) {
    console.error("Error fetching user growth:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/engagement
 * Platform engagement metrics
 */
router.get("/analytics/engagement", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { timeframe = "7d" } = req.query;
    const days = parseInt(timeframe as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totalPosts = await db.select({ count: count() })
      .from(posts)
      .where(gte(posts.createdAt, startDate));

    const activeUsers = await db.select({
      count: sql<number>`COUNT(DISTINCT ${posts.userId})`,
    })
      .from(posts)
      .where(gte(posts.createdAt, startDate));

    res.json({
      totalPosts: totalPosts[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      timeframe,
    });
  } catch (error: any) {
    console.error("Error fetching engagement:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/retention
 * User retention metrics
 */
router.get("/analytics/retention", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const totalUsers = await db.select({ count: count() }).from(users);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await db.select({
      count: sql<number>`COUNT(DISTINCT ${posts.userId})`,
    })
      .from(posts)
      .where(gte(posts.createdAt, thirtyDaysAgo));

    const total = totalUsers[0]?.count || 1;
    const active = activeUsers[0]?.count || 0;
    const retentionRate = ((active / total) * 100).toFixed(2);

    res.json({
      totalUsers: total,
      activeUsers: active,
      retentionRate: parseFloat(retentionRate),
    });
  } catch (error: any) {
    console.error("Error fetching retention:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/content-performance
 * Top performing content
 */
router.get("/analytics/content-performance", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { limit = "10" } = req.query;

    const topPosts = await db.select({
      id: posts.id,
      content: posts.content,
      userId: posts.userId,
      likesCount: posts.likes,
      commentsCount: posts.comments,
      sharesCount: posts.shares,
      createdAt: posts.createdAt,
    })
      .from(posts)
      .orderBy(desc(posts.likes))
      .limit(parseInt(limit as string));

    res.json(topPosts);
  } catch (error: any) {
    console.error("Error fetching content performance:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/demographics
 * User demographics
 */
router.get("/analytics/demographics", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const byCity = await db.select({
      city: users.city,
      count: count(),
    })
      .from(users)
      .where(sql`${users.city} IS NOT NULL`)
      .groupBy(users.city)
      .orderBy(desc(count()))
      .limit(10);

    const totalUsers = await db.select({ count: count() }).from(users);

    res.json({
      totalUsers: totalUsers[0]?.count || 0,
      topCities: byCity,
    });
  } catch (error: any) {
    console.error("Error fetching demographics:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/events-metrics
 * Event participation metrics
 */
router.get("/analytics/events-metrics", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { timeframe = "30d" } = req.query;
    const days = parseInt(timeframe as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totalEvents = await db.select({ count: count() })
      .from(events)
      .where(gte(events.createdAt, startDate));

    res.json({
      totalEvents: totalEvents[0]?.count || 0,
      timeframe,
    });
  } catch (error: any) {
    console.error("Error fetching events metrics:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/realtime
 * Real-time activity
 */
router.get("/analytics/realtime", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);

    const recentPosts = await db.select({ count: count() })
      .from(posts)
      .where(gte(posts.createdAt, lastHour));

    const recentEvents = await db.select({ count: count() })
      .from(events)
      .where(gte(events.createdAt, lastHour));

    res.json({
      postsLastHour: recentPosts[0]?.count || 0,
      eventsLastHour: recentEvents[0]?.count || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching realtime:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/user-reports
 * Get all user reports with filters
 */
router.get("/user-reports", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { status, severity } = req.query;

    let query = db
      .select({
        id: userReports.id,
        reporterId: userReports.reporterId,
        reportedUserId: userReports.reportedUserId,
        reportType: userReports.reportType,
        description: userReports.description,
        evidence: userReports.evidence,
        status: userReports.status,
        severity: userReports.severity,
        reviewedBy: userReports.reviewedBy,
        reviewedAt: userReports.reviewedAt,
        adminNotes: userReports.adminNotes,
        action: userReports.action,
        actionDetails: userReports.actionDetails,
        createdAt: userReports.createdAt,
      })
      .from(userReports)
      .$dynamic();

    // Add status filter
    if (status && status !== "all") {
      query = query.where(eq(userReports.status, status as string));
    }

    // Add severity filter
    if (severity && severity !== "all") {
      query = query.where(eq(userReports.severity, severity as string));
    }

    const reports = await query.orderBy(desc(userReports.createdAt));

    // Enrich with user data
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        const [reporter] = await db
          .select({
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
          })
          .from(users)
          .where(eq(users.id, report.reporterId));

        const [reportedUser] = await db
          .select({
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, report.reportedUserId));

        return {
          ...report,
          reporter,
          reportedUser,
        };
      })
    );

    res.json(enrichedReports);
  } catch (error: any) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/user-reports/:reportId/resolve
 * Resolve a user report with action
 */
router.post("/user-reports/:reportId/resolve", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { action, adminNotes } = req.body;

    if (!action) {
      return res.status(400).json({ error: "Action is required" });
    }

    const [updated] = await db
      .update(userReports)
      .set({
        status: "resolved",
        action,
        adminNotes,
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userReports.id, parseInt(reportId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({ success: true, report: updated });
  } catch (error: any) {
    console.error("Error resolving user report:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/user-reports/:reportId/dismiss
 * Dismiss a user report
 */
router.post("/user-reports/:reportId/dismiss", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { adminNotes } = req.body;

    const [updated] = await db
      .update(userReports)
      .set({
        status: "dismissed",
        adminNotes,
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userReports.id, parseInt(reportId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({ success: true, report: updated });
  } catch (error: any) {
    console.error("Error dismissing user report:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
