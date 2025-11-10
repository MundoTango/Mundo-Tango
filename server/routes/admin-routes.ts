/**
 * ADMIN DASHBOARD ROUTES
 * 12 endpoints: User management, content moderation, platform stats
 */

import { Router, Response } from "express";
import { db } from "@shared/db";
import { users, posts, reports, events } from "@shared/schema";
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
      .set({ role, verified, updatedAt: new Date() })
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
      id: reports.id,
      reporterId: reports.reporterId,
      contentType: reports.contentType,
      contentId: reports.contentId,
      reason: reports.reason,
      status: reports.status,
      createdAt: reports.createdAt,
    })
      .from(reports)
      .where(eq(reports.status, status as string))
      .orderBy(desc(reports.createdAt))
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

    // Update report status
    await db.update(reports)
      .set({ status: "resolved", resolvedAt: new Date() })
      .where(
        and(
          eq(reports.contentId, parseInt(contentId)),
          eq(reports.contentType, contentType)
        )
      );

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

export default router;
