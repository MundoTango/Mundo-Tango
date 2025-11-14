/**
 * ADMIN DASHBOARD ROUTES
 * 12 endpoints: User management, content moderation, platform stats
 */

import { Router, Response } from "express";
import { db } from "@shared/db";
import { 
  users, posts, postReports, events, userReports, roleRequests, housingListings,
  moderationQueue, moderationActions, flaggedContent, postComments
} from "@shared/schema";
import { eq, desc, like, or, and, gte, count, sql, inArray } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireMinimumRole } from "../middleware/tierEnforcement";
import { storage } from "../storage";
import { AnalyticsService } from "../services/AnalyticsService";

const router = Router();

// TIER ENFORCEMENT: Admin routes require Admin (level 4) or higher
// Uses 8-tier RBAC system: 8=God, 7=Super Admin, 6=Platform Volunteer, 5=Platform Contributor, 4=Admin
const requireAdmin = requireMinimumRole(4);

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
 * Get pending moderation items with pagination and filters
 */
router.get("/moderation/queue", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { 
      status = "pending",
      contentType = "",
      priority = "",
      page = "1",
      limit = "50"
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db.select({
      queue: moderationQueue,
      reporter: {
        id: users.id,
        username: users.username,
        name: users.name,
      }
    })
    .from(moderationQueue)
    .leftJoin(users, eq(moderationQueue.reportedBy, users.id))
    .$dynamic();

    // Filter by status
    if (status && status !== "all") {
      query = query.where(eq(moderationQueue.status, status as string));
    }

    // Filter by content type
    if (contentType) {
      query = query.where(eq(moderationQueue.contentType, contentType as string));
    }

    // Filter by priority
    if (priority) {
      query = query.where(eq(moderationQueue.priority, parseInt(priority as string)));
    }

    const results = await query
      .orderBy(desc(moderationQueue.priority), desc(moderationQueue.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const totalCount = await db.select({ count: count() })
      .from(moderationQueue)
      .where(status && status !== "all" ? eq(moderationQueue.status, status as string) : sql`1=1`);

    res.json({
      queue: results,
      total: totalCount[0]?.count || 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error: any) {
    console.error("Error fetching moderation queue:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/moderation/:id/action
 * Take action on moderation queue item
 */
router.post("/moderation/:id/action", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const moderatorId = req.user?.id;

    if (!moderatorId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get the queue item
    const queueItem = await db.query.moderationQueue.findFirst({
      where: eq(moderationQueue.id, parseInt(id))
    });

    if (!queueItem) {
      return res.status(404).json({ error: "Queue item not found" });
    }

    // Perform the action based on type
    let newStatus = "pending";
    
    switch (action) {
      case "approve":
        newStatus = "approved";
        break;
      case "remove":
        newStatus = "removed";
        // Delete the content
        if (queueItem.contentType === "post") {
          await db.delete(posts).where(eq(posts.id, queueItem.contentId));
        } else if (queueItem.contentType === "comment") {
          await db.delete(postComments).where(eq(postComments.id, queueItem.contentId));
        } else if (queueItem.contentType === "event") {
          await db.update(events)
            .set({ status: "cancelled", cancellationReason: notes || "Removed by moderation" })
            .where(eq(events.id, queueItem.contentId));
        } else if (queueItem.contentType === "housing") {
          await db.delete(housingListings).where(eq(housingListings.id, queueItem.contentId));
        }
        break;
      case "ban_user":
        newStatus = "banned";
        // Get user ID from content and ban them
        let userId: number | null = null;
        if (queueItem.contentType === "post") {
          const post = await db.query.posts.findFirst({
            where: eq(posts.id, queueItem.contentId)
          });
          userId = post?.userId || null;
        } else if (queueItem.contentType === "comment") {
          const comment = await db.query.postComments.findFirst({
            where: eq(postComments.id, queueItem.contentId)
          });
          userId = comment?.userId || null;
        } else if (queueItem.contentType === "user") {
          userId = queueItem.contentId;
        }
        
        if (userId) {
          await db.update(users)
            .set({ role: "guest", suspended: true, updatedAt: new Date() })
            .where(eq(users.id, userId));
        }
        break;
      case "warn_user":
        newStatus = "approved";
        // TODO: Implement warning system
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    // Update queue item
    await db.update(moderationQueue)
      .set({
        status: newStatus,
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
        moderatorNotes: notes || null,
      })
      .where(eq(moderationQueue.id, parseInt(id)));

    // Log the action
    await db.insert(moderationActions).values({
      queueId: parseInt(id),
      action,
      moderatorId,
      reason: notes || null,
    });

    res.json({ success: true, id, action, status: newStatus });
  } catch (error: any) {
    console.error("Error performing moderation action:", error);
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
 * GET /api/admin/moderation/stats
 * Get moderation statistics
 */
router.get("/moderation/stats", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const pendingCount = await db.select({ count: count() })
      .from(moderationQueue)
      .where(eq(moderationQueue.status, "pending"));

    const approvedCount = await db.select({ count: count() })
      .from(moderationQueue)
      .where(eq(moderationQueue.status, "approved"));

    const removedCount = await db.select({ count: count() })
      .from(moderationQueue)
      .where(eq(moderationQueue.status, "removed"));

    const bannedCount = await db.select({ count: count() })
      .from(moderationQueue)
      .where(eq(moderationQueue.status, "banned"));

    const flaggedCount = await db.select({ count: count() })
      .from(flaggedContent);

    // Get recent actions (last 24h)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentActions = await db.select({ count: count() })
      .from(moderationActions)
      .where(gte(moderationActions.createdAt, oneDayAgo));

    res.json({
      pending: pendingCount[0]?.count || 0,
      approved: approvedCount[0]?.count || 0,
      removed: removedCount[0]?.count || 0,
      banned: bannedCount[0]?.count || 0,
      flagged: flaggedCount[0]?.count || 0,
      recentActions24h: recentActions[0]?.count || 0,
    });
  } catch (error: any) {
    console.error("Error fetching moderation stats:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/moderation/flagged
 * Get auto-flagged content
 */
router.get("/moderation/flagged", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { page = "1", limit = "50" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const results = await db.select()
      .from(flaggedContent)
      .orderBy(desc(flaggedContent.createdAt))
      .limit(limitNum)
      .offset(offset);

    const totalCount = await db.select({ count: count() }).from(flaggedContent);

    res.json({
      flagged: results,
      total: totalCount[0]?.count || 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error: any) {
    console.error("Error fetching flagged content:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/moderation/audit-log
 * Get moderation action audit log
 */
router.get("/moderation/audit-log", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { page = "1", limit = "100" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const results = await db.select({
      action: moderationActions,
      moderator: {
        id: users.id,
        username: users.username,
        name: users.name,
      }
    })
    .from(moderationActions)
    .leftJoin(users, eq(moderationActions.moderatorId, users.id))
    .orderBy(desc(moderationActions.createdAt))
    .limit(limitNum)
    .offset(offset);

    const totalCount = await db.select({ count: count() }).from(moderationActions);

    res.json({
      actions: results,
      total: totalCount[0]?.count || 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error: any) {
    console.error("Error fetching audit log:", error);
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

/**
 * GET /api/admin/role-requests
 * Get all professional role requests with filters
 */
router.get("/role-requests", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { status, requestedRole } = req.query;

    let query = db
      .select({
        id: roleRequests.id,
        userId: roleRequests.userId,
        requestedRole: roleRequests.requestedRole,
        currentRole: roleRequests.currentRole,
        experience: roleRequests.experience,
        credentials: roleRequests.credentials,
        bio: roleRequests.bio,
        specialties: roleRequests.specialties,
        city: roleRequests.city,
        country: roleRequests.country,
        website: roleRequests.website,
        socialLinks: roleRequests.socialLinks,
        whyRequest: roleRequests.whyRequest,
        status: roleRequests.status,
        reviewedBy: roleRequests.reviewedBy,
        reviewedAt: roleRequests.reviewedAt,
        adminNotes: roleRequests.adminNotes,
        rejectionReason: roleRequests.rejectionReason,
        createdAt: roleRequests.createdAt,
      })
      .from(roleRequests)
      .$dynamic();

    // Add status filter
    if (status && status !== "all") {
      query = query.where(eq(roleRequests.status, status as string));
    }

    // Add role filter
    if (requestedRole && requestedRole !== "all") {
      query = query.where(eq(roleRequests.requestedRole, requestedRole as string));
    }

    const requests = await query.orderBy(desc(roleRequests.createdAt));

    // Enrich with user data
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const [user] = await db
          .select({
            id: users.id,
            name: users.name,
            username: users.username,
            email: users.email,
            profileImage: users.profileImage,
          })
          .from(users)
          .where(eq(users.id, request.userId));

        return {
          ...request,
          user,
        };
      })
    );

    res.json(enrichedRequests);
  } catch (error: any) {
    console.error("Error fetching role requests:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/role-requests/:requestId/approve
 * Approve a role request and update user role
 */
router.post("/role-requests/:requestId/approve", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const { adminNotes } = req.body;

    // Get the request
    const [request] = await db
      .select()
      .from(roleRequests)
      .where(eq(roleRequests.id, parseInt(requestId)));

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Update request status
    await db
      .update(roleRequests)
      .set({
        status: "approved",
        adminNotes,
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(roleRequests.id, parseInt(requestId)));

    // Update user role based on requested role
    // Map requested role to actual user role
    const roleMapping: Record<string, string> = {
      teacher: "teacher",
      dj: "premium", // DJs get premium role
      organizer: "premium", // Organizers get premium role
    };

    const newRole = roleMapping[request.requestedRole] || request.requestedRole;

    await db
      .update(users)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(users.id, request.userId));

    res.json({ success: true, message: "Role request approved and user role updated" });
  } catch (error: any) {
    console.error("Error approving role request:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/role-requests/:requestId/reject
 * Reject a role request
 */
router.post("/role-requests/:requestId/reject", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const { adminNotes, rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const [updated] = await db
      .update(roleRequests)
      .set({
        status: "rejected",
        adminNotes,
        rejectionReason,
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(roleRequests.id, parseInt(requestId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({ success: true, request: updated });
  } catch (error: any) {
    console.error("Error rejecting role request:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/event-approvals
 * Get all events pending approval with filters
 */
router.get("/event-approvals", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { status, eventType } = req.query;

    let query = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        eventType: events.eventType,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        city: events.city,
        country: events.country,
        venue: events.venue,
        isOnline: events.isOnline,
        onlineLink: events.onlineLink,
        imageUrl: events.imageUrl,
        maxAttendees: events.maxAttendees,
        currentAttendees: events.currentAttendees,
        isPaid: events.isPaid,
        price: events.price,
        currency: events.currency,
        status: events.status,
        visibility: events.visibility,
        musicStyle: events.musicStyle,
        dressCode: events.dressCode,
        tags: events.tags,
        approvedBy: events.approvedBy,
        approvedAt: events.approvedAt,
        rejectionReason: events.rejectionReason,
        adminNotes: events.adminNotes,
        createdAt: events.createdAt,
        userId: events.userId,
      })
      .from(events)
      .$dynamic();

    // Add status filter
    if (status && status !== "all") {
      query = query.where(eq(events.status, status as string));
    } else {
      // Default to showing pending events if no filter
      query = query.where(eq(events.status, "pending"));
    }

    // Add event type filter
    if (eventType && eventType !== "all") {
      query = query.where(eq(events.eventType, eventType as string));
    }

    const eventsList = await query.orderBy(desc(events.createdAt));

    // Enrich with organizer data
    const enrichedEvents = await Promise.all(
      eventsList.map(async (event) => {
        const [organizer] = await db
          .select({
            id: users.id,
            name: users.name,
            username: users.username,
            email: users.email,
            profileImage: users.profileImage,
          })
          .from(users)
          .where(eq(users.id, event.userId));

        return {
          ...event,
          organizer,
        };
      })
    );

    res.json(enrichedEvents);
  } catch (error: any) {
    console.error("Error fetching event approvals:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/event-approvals/:eventId/approve
 * Approve an event and publish it
 */
router.post("/event-approvals/:eventId/approve", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const { adminNotes } = req.body;

    const [updated] = await db
      .update(events)
      .set({
        status: "published",
        adminNotes,
        approvedBy: req.user!.id,
        approvedAt: new Date(),
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(events.id, parseInt(eventId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ success: true, event: updated });
  } catch (error: any) {
    console.error("Error approving event:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/event-approvals/:eventId/reject
 * Reject an event
 */
router.post("/event-approvals/:eventId/reject", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const { adminNotes, rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const [updated] = await db
      .update(events)
      .set({
        status: "rejected",
        adminNotes,
        rejectionReason,
        approvedBy: req.user!.id,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(events.id, parseInt(eventId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ success: true, event: updated });
  } catch (error: any) {
    console.error("Error rejecting event:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/housing-reviews
 * Get housing listings for safety verification
 */
router.get("/housing-reviews", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { verificationStatus, propertyType } = req.query;

    let query = db
      .select({
        id: housingListings.id,
        title: housingListings.title,
        description: housingListings.description,
        propertyType: housingListings.propertyType,
        bedrooms: housingListings.bedrooms,
        bathrooms: housingListings.bathrooms,
        maxGuests: housingListings.maxGuests,
        pricePerNight: housingListings.pricePerNight,
        currency: housingListings.currency,
        address: housingListings.address,
        city: housingListings.city,
        country: housingListings.country,
        amenities: housingListings.amenities,
        houseRules: housingListings.houseRules,
        images: housingListings.images,
        status: housingListings.status,
        verificationStatus: housingListings.verificationStatus,
        verifiedBy: housingListings.verifiedBy,
        verifiedAt: housingListings.verifiedAt,
        safetyNotes: housingListings.safetyNotes,
        rejectionReason: housingListings.rejectionReason,
        createdAt: housingListings.createdAt,
        hostId: housingListings.hostId,
      })
      .from(housingListings)
      .$dynamic();

    // Add verification status filter
    if (verificationStatus && verificationStatus !== "all") {
      query = query.where(eq(housingListings.verificationStatus, verificationStatus as string));
    } else {
      // Default to showing pending listings
      query = query.where(eq(housingListings.verificationStatus, "pending"));
    }

    // Add property type filter
    if (propertyType && propertyType !== "all") {
      query = query.where(eq(housingListings.propertyType, propertyType as string));
    }

    const listings = await query.orderBy(desc(housingListings.createdAt));

    // Enrich with host data
    const enrichedListings = await Promise.all(
      listings.map(async (listing) => {
        const [host] = await db
          .select({
            id: users.id,
            name: users.name,
            username: users.username,
            email: users.email,
            profileImage: users.profileImage,
          })
          .from(users)
          .where(eq(users.id, listing.hostId));

        return {
          ...listing,
          host,
        };
      })
    );

    res.json(enrichedListings);
  } catch (error: any) {
    console.error("Error fetching housing reviews:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/housing-reviews/:listingId/verify
 * Verify a housing listing for safety
 */
router.post("/housing-reviews/:listingId/verify", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { listingId } = req.params;
    const { safetyNotes } = req.body;

    const [updated] = await db
      .update(housingListings)
      .set({
        verificationStatus: "verified",
        safetyNotes,
        verifiedBy: req.user!.id,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(housingListings.id, parseInt(listingId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ success: true, listing: updated });
  } catch (error: any) {
    console.error("Error verifying housing listing:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/housing-reviews/:listingId/reject
 * Reject a housing listing for safety concerns
 */
router.post("/housing-reviews/:listingId/reject", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { listingId } = req.params;
    const { safetyNotes, rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const [updated] = await db
      .update(housingListings)
      .set({
        verificationStatus: "rejected",
        safetyNotes,
        rejectionReason,
        verifiedBy: req.user!.id,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(housingListings.id, parseInt(listingId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ success: true, listing: updated });
  } catch (error: any) {
    console.error("Error rejecting housing listing:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * =====================================================
 * PLATFORM ANALYTICS ENDPOINTS
 * =====================================================
 */

/**
 * GET /api/admin/analytics/overview
 * Get overview metrics for analytics dashboard
 */
router.get("/analytics/overview", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    // Calculate metrics
    const [
      totalUsersResult,
      dauResult,
      mauResult,
      postsResult,
      eventsResult,
      subscriptionsResult,
      lastMonthUsersResult
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(users).where(gte(users.lastLoginAt, new Date(Date.now() - 24 * 60 * 60 * 1000))),
      db.select({ count: count() }).from(users).where(gte(users.lastLoginAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
      db.select({ count: count() }).from(posts).where(gte(posts.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))),
      db.select({ count: count() }).from(events).where(gte(events.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))),
      db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.status, 'active')),
      db.select({ count: count() }).from(users).where(
        and(
          gte(users.createdAt, new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)),
          gte(users.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        ) as any
      )
    ]);

    const totalUsers = totalUsersResult[0]?.count || 0;
    const dau = dauResult[0]?.count || 0;
    const mau = mauResult[0]?.count || 0;
    const lastMonthUsers = lastMonthUsersResult[0]?.count || 0;

    // Calculate growth percentage
    const prevMonthTotal = totalUsers - lastMonthUsers;
    const growthPercentage = prevMonthTotal > 0 ? ((lastMonthUsers / prevMonthTotal) * 100) : 0;

    // Calculate retention (users active in last 30 days / total users)
    const retentionRate = totalUsers > 0 ? (mau / totalUsers) * 100 : 0;

    // Calculate posts per day (last 7 days)
    const postsPerDay = (postsResult[0]?.count || 0) / 7;

    // Calculate events per week
    const eventsPerWeek = eventsResult[0]?.count || 0;

    // Calculate MRR (Monthly Recurring Revenue)
    const activeSubscriptions = await db.select({
      tierName: sql<string>`pt.name`,
      count: count()
    })
    .from(subscriptions)
    .leftJoin(sql`pricing_tiers pt`, sql`subscriptions.tier_id = pt.id`)
    .where(eq(subscriptions.status, 'active'))
    .groupBy(sql`pt.name`);

    const tierPrices: Record<string, number> = {
      basic: 5,
      premium: 15,
      god_level: 99
    };

    const mrr = activeSubscriptions.reduce((sum, sub) => {
      const price = tierPrices[sub.tierName] || 0;
      return sum + (price * sub.count);
    }, 0);

    // Calculate churn rate (placeholder - would need historical data)
    const churnRate = 2.5; // Placeholder - calculate from actual cancellations

    res.json({
      totalUsers,
      growthPercentage: Math.round(growthPercentage * 10) / 10,
      dau,
      mau,
      retentionRate: Math.round(retentionRate * 10) / 10,
      postsPerDay: Math.round(postsPerDay * 10) / 10,
      eventsPerWeek,
      mrr,
      churnRate
    });
  } catch (error: any) {
    console.error("Error fetching analytics overview:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/users
 * Get user growth data with date filters
 */
router.get("/analytics/users", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { days = "90" } = req.query;
    const daysNum = parseInt(days as string);

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - daysNum);

    // Get daily user signups
    const dailySignups = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as cumulative_users
      FROM users
      WHERE created_at >= ${daysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json(dailySignups.rows);
  } catch (error: any) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/revenue
 * Get revenue trends data
 */
router.get("/analytics/revenue", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    // Get monthly revenue for last 12 months
    const monthlyRevenue = await db.execute(sql`
      SELECT 
        DATE_TRUNC('month', s.created_at) as month,
        COUNT(DISTINCT s.user_id) as paying_users,
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
      GROUP BY DATE_TRUNC('month', s.created_at)
      ORDER BY month DESC
    `);

    res.json(monthlyRevenue.rows);
  } catch (error: any) {
    console.error("Error fetching revenue analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/engagement
 * Get engagement data by feature
 */
router.get("/analytics/engagement", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [postsCount, eventsCount, commentsCount, messagesCount] = await Promise.all([
      db.select({ count: count() }).from(posts).where(gte(posts.createdAt, thirtyDaysAgo)),
      db.select({ count: count() }).from(events).where(gte(events.createdAt, thirtyDaysAgo)),
      db.select({ count: count() }).from(postComments).where(gte(postComments.createdAt, thirtyDaysAgo)),
      db.execute(sql`SELECT COUNT(*) as count FROM messages WHERE created_at >= ${thirtyDaysAgo}`)
    ]);

    const engagement = [
      { name: 'Posts', value: postsCount[0]?.count || 0 },
      { name: 'Events', value: eventsCount[0]?.count || 0 },
      { name: 'Comments', value: commentsCount[0]?.count || 0 },
      { name: 'Messages', value: messagesCount.rows[0]?.count || 0 }
    ];

    res.json(engagement);
  } catch (error: any) {
    console.error("Error fetching engagement analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/top-cities
 * Get top cities by user count
 */
router.get("/analytics/top-cities", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const topCities = await db.execute(sql`
      SELECT 
        city,
        COUNT(*) as user_count,
        COUNT(DISTINCT CASE WHEN last_login_at >= CURRENT_DATE - 30 THEN id END) as active_users
      FROM users
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
      ORDER BY user_count DESC
      LIMIT 10
    `);

    res.json(topCities.rows);
  } catch (error: any) {
    console.error("Error fetching top cities:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/top-organizers
 * Get top event organizers
 */
router.get("/analytics/top-organizers", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const topOrganizers = await db.execute(sql`
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
      LIMIT 10
    `);

    res.json(topOrganizers.rows);
  } catch (error: any) {
    console.error("Error fetching top organizers:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/export
 * Export analytics data as CSV
 */
router.get("/analytics/export", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const { type = "users" } = req.query;

    let data: any[] = [];
    let headers: string[] = [];
    let filename = "export.csv";

    switch (type) {
      case "users":
        const users = await db.execute(sql`
          SELECT id, name, email, created_at, last_login_at, city, role
          FROM users
          ORDER BY created_at DESC
        `);
        data = users.rows;
        headers = ["ID", "Name", "Email", "Created At", "Last Login", "City", "Role"];
        filename = "users-export.csv";
        break;

      case "revenue":
        const revenue = await db.execute(sql`
          SELECT 
            DATE_TRUNC('month', s.created_at) as month,
            pt.name as tier,
            COUNT(*) as subscriptions,
            SUM(
              CASE 
                WHEN pt.name = 'basic' THEN 5
                WHEN pt.name = 'premium' THEN 15
                WHEN pt.name = 'god_level' THEN 99
                ELSE 0
              END
            ) as revenue
          FROM subscriptions s
          LEFT JOIN pricing_tiers pt ON s.tier_id = pt.id
          WHERE s.status = 'active'
          GROUP BY DATE_TRUNC('month', s.created_at), pt.name
          ORDER BY month DESC
        `);
        data = revenue.rows;
        headers = ["Month", "Tier", "Subscriptions", "Revenue"];
        filename = "revenue-export.csv";
        break;

      case "engagement":
        const engagement = await db.execute(sql`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as post_count
          FROM posts
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `);
        data = engagement.rows;
        headers = ["Date", "Posts"];
        filename = "engagement-export.csv";
        break;

      default:
        return res.status(400).json({ error: "Invalid export type" });
    }

    // Generate CSV
    const csvRows = [headers.join(",")];
    for (const row of data) {
      const values = Object.values(row).map(val => {
        if (val === null || val === undefined) return "";
        const str = String(val);
        // Escape quotes and wrap in quotes if contains comma
        return str.includes(",") ? `"${str.replace(/"/g, '""')}"` : str;
      });
      csvRows.push(values.join(","));
    }
    const csv = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error: any) {
    console.error("Error exporting analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * ============================================================================
 * PLATFORM ANALYTICS ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/admin/analytics/stats
 * Get comprehensive analytics overview
 */
router.get("/analytics/stats", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const [totalUsers, dau, mau, mrr, churnRate, topOrganizers, postsPerDay, eventsPerWeek] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      AnalyticsService.getDailyActiveUsers(),
      AnalyticsService.getMonthlyActiveUsers(),
      AnalyticsService.getMRR(),
      AnalyticsService.getChurnRate(),
      AnalyticsService.getTopOrganizers(5),
      AnalyticsService.getPostsPerDay(),
      AnalyticsService.getEventsPerWeek()
    ]);
    
    const totalCount = Number(totalUsers[0]?.count) || 0;
    const dauCount = Number(dau) || 0;
    const mauCount = Number(mau) || 1; // Avoid division by zero
    
    res.json({
      totalUsers: totalCount,
      dau: dauCount,
      mau: mauCount,
      mrr: Number(mrr) || 0,
      churnRate: Number(churnRate) || 0,
      retention: mauCount > 0 ? Math.round((dauCount / mauCount) * 100) : 0,
      postsPerDay: Math.round(Number(postsPerDay) || 0),
      eventsPerWeek: Math.round(Number(eventsPerWeek) || 0),
      topOrganizers: topOrganizers || []
    });
  } catch (error: any) {
    console.error("Error fetching analytics stats:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/user-growth
 * Get daily user growth for last 30 days
 */
router.get("/analytics/user-growth", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const data = await AnalyticsService.getUserGrowth();
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching user growth:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/revenue
 * Get monthly revenue trends for last 12 months
 */
router.get("/analytics/revenue", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const data = await AnalyticsService.getRevenueTrends();
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching revenue trends:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/top-cities
 * Get top cities by user count
 */
router.get("/analytics/top-cities", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const data = await AnalyticsService.getTopCities(10);
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching top cities:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/analytics/export
 * Export analytics data as CSV
 */
router.get("/analytics/export", authenticateToken, requireAdmin, async (req, res: Response) => {
  try {
    const userGrowth = await AnalyticsService.getUserGrowth();
    
    const csv = [
      'Date,New Users',
      ...userGrowth.map(row => `${row.date},${row.count}`)
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics-user-growth.csv');
    res.send(csv);
  } catch (error: any) {
    console.error("Error exporting analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
