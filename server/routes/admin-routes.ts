/**
 * ADMIN DASHBOARD ROUTES
 * 12 endpoints: User management, content moderation, platform stats
 */

import { Router, Response } from "express";
import { db } from "@shared/db";
import { users, posts, postReports, events, userReports, roleRequests } from "@shared/schema";
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

export default router;
