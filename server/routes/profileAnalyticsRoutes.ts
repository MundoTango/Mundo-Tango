/**
 * BATCH 13-14: Profile Analytics Routes
 * 
 * Handles profile analytics including:
 * - Profile view tracking
 * - View statistics and trends
 * - Engagement metrics
 * - Recent visitor tracking
 * - Professional inquiries (for business profiles)
 * - Booking statistics
 * 
 * Privacy: Detailed analytics only visible to profile owner
 */

import { Router, type Response } from "express";
import { db } from "@shared/db";
import { 
  profileAnalytics,
  profileInquiries,
  profileMedia,
  users,
  friendships,
  insertProfileAnalyticsSchema,
  insertProfileInquirySchema,
  type SelectProfileAnalytics 
} from "@shared/schema";
import { eq, desc, and, sql, gte, count, isNull } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// ============================================================================
// VIEW TRACKING
// ============================================================================

/**
 * POST /api/profile/analytics/view/:userId
 * Track a profile view
 */
router.post('/analytics/view/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const profileUserId = parseInt(req.params.userId);
    
    if (isNaN(profileUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Don't track self-views
    if (req.userId === profileUserId) {
      return res.json({ message: 'Self-view not tracked' });
    }

    const {
      viewDuration,
      referrerUrl,
      sourceType,
      deviceType,
      sectionsViewed,
      interactionType,
      sessionId,
    } = req.body;

    // Check if this is a unique view (first view in 24h from this viewer)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentViews = await db.select()
      .from(profileAnalytics)
      .where(
        and(
          eq(profileAnalytics.profileUserId, profileUserId),
          eq(profileAnalytics.viewerUserId, req.userId!),
          gte(profileAnalytics.viewDate, twentyFourHoursAgo)
        )
      )
      .limit(1);

    const isUniqueView = recentViews.length === 0;

    // Get viewer's location from their profile
    const [viewer] = await db.select({
      city: users.city,
      country: users.country,
    })
    .from(users)
    .where(eq(users.id, req.userId!))
    .limit(1);

    // Create analytics record
    const analyticsData = {
      profileUserId,
      viewerUserId: req.userId!,
      viewDuration: viewDuration || null,
      referrerUrl: referrerUrl || null,
      sourceType: sourceType || 'direct',
      deviceType: deviceType || 'desktop',
      sectionsViewed: sectionsViewed || [],
      interactionType: interactionType || 'view',
      city: viewer?.city || null,
      country: viewer?.country || null,
      sessionId: sessionId || null,
      isUniqueView,
    };

    const validatedData = insertProfileAnalyticsSchema.parse(analyticsData);
    const [analytics] = await db.insert(profileAnalytics).values(validatedData).returning();

    res.status(201).json({ 
      message: 'Profile view tracked',
      isUniqueView,
      id: analytics.id 
    });
  } catch (error) {
    console.error('[ProfileAnalytics] View tracking error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Failed to track profile view' });
  }
});

// ============================================================================
// VIEW STATISTICS
// ============================================================================

/**
 * GET /api/profile/analytics/views/:userId
 * Get view statistics for a profile
 * Privacy: Only profile owner can see detailed analytics
 */
router.get('/analytics/views/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const profileUserId = parseInt(req.params.userId);
    
    if (isNaN(profileUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Privacy check: only owner can see detailed analytics
    if (req.userId !== profileUserId) {
      return res.status(403).json({ message: 'Not authorized to view analytics' });
    }

    const { period = '30' } = req.query; // days
    const days = parseInt(period as string);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get view counts
    const [totalViews] = await db.select({
      count: count(),
    })
    .from(profileAnalytics)
    .where(
      and(
        eq(profileAnalytics.profileUserId, profileUserId),
        gte(profileAnalytics.viewDate, startDate)
      )
    );

    const [uniqueViews] = await db.select({
      count: count(),
    })
    .from(profileAnalytics)
    .where(
      and(
        eq(profileAnalytics.profileUserId, profileUserId),
        eq(profileAnalytics.isUniqueView, true),
        gte(profileAnalytics.viewDate, startDate)
      )
    );

    // Views by source type
    const viewsBySource = await db.select({
      sourceType: profileAnalytics.sourceType,
      count: count(),
    })
    .from(profileAnalytics)
    .where(
      and(
        eq(profileAnalytics.profileUserId, profileUserId),
        gte(profileAnalytics.viewDate, startDate)
      )
    )
    .groupBy(profileAnalytics.sourceType);

    // Views by device type
    const viewsByDevice = await db.select({
      deviceType: profileAnalytics.deviceType,
      count: count(),
    })
    .from(profileAnalytics)
    .where(
      and(
        eq(profileAnalytics.profileUserId, profileUserId),
        gte(profileAnalytics.viewDate, startDate)
      )
    )
    .groupBy(profileAnalytics.deviceType);

    // Daily views trend
    const dailyViews = await db
      .select({
        date: sql<string>`DATE(${profileAnalytics.viewDate})`,
        count: count(),
        uniqueCount: sql<number>`COUNT(*) FILTER (WHERE ${profileAnalytics.isUniqueView} = true)`,
      })
      .from(profileAnalytics)
      .where(
        and(
          eq(profileAnalytics.profileUserId, profileUserId),
          gte(profileAnalytics.viewDate, startDate)
        )
      )
      .groupBy(sql`DATE(${profileAnalytics.viewDate})`)
      .orderBy(sql`DATE(${profileAnalytics.viewDate})`);

    res.json({
      period: days,
      totalViews: totalViews.count || 0,
      uniqueViews: uniqueViews.count || 0,
      viewsBySource,
      viewsByDevice,
      dailyViews,
    });
  } catch (error) {
    console.error('[ProfileAnalytics] View stats error:', error);
    res.status(500).json({ message: 'Failed to fetch view statistics' });
  }
});

// ============================================================================
// ENGAGEMENT METRICS
// ============================================================================

/**
 * GET /api/profile/analytics/engagement/:userId
 * Get comprehensive engagement metrics for a profile
 * Privacy: Only profile owner can see
 */
router.get('/analytics/engagement/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const profileUserId = parseInt(req.params.userId);
    
    if (isNaN(profileUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Privacy check
    if (req.userId !== profileUserId) {
      return res.status(403).json({ message: 'Not authorized to view engagement metrics' });
    }

    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Profile media engagement
    const mediaStats = await db
      .select({
        totalMedia: count(),
        totalViews: sql<number>`COALESCE(SUM(${profileMedia.views}), 0)`,
        totalLikes: sql<number>`COALESCE(SUM(${profileMedia.likes}), 0)`,
      })
      .from(profileMedia)
      .where(eq(profileMedia.userId, profileUserId));

    // Interaction types breakdown
    const interactionTypes = await db
      .select({
        type: profileAnalytics.interactionType,
        count: count(),
      })
      .from(profileAnalytics)
      .where(
        and(
          eq(profileAnalytics.profileUserId, profileUserId),
          gte(profileAnalytics.viewDate, startDate)
        )
      )
      .groupBy(profileAnalytics.interactionType);

    // Most viewed sections
    const sectionViews = await db
      .select({
        sections: profileAnalytics.sectionsViewed,
      })
      .from(profileAnalytics)
      .where(
        and(
          eq(profileAnalytics.profileUserId, profileUserId),
          gte(profileAnalytics.viewDate, startDate)
        )
      );

    // Flatten and count section views
    const sectionCounts: Record<string, number> = {};
    sectionViews.forEach(({ sections }) => {
      sections?.forEach((section: string) => {
        sectionCounts[section] = (sectionCounts[section] || 0) + 1;
      });
    });

    // Geographic distribution
    const viewsByLocation = await db
      .select({
        city: profileAnalytics.city,
        country: profileAnalytics.country,
        count: count(),
      })
      .from(profileAnalytics)
      .where(
        and(
          eq(profileAnalytics.profileUserId, profileUserId),
          gte(profileAnalytics.viewDate, startDate)
        )
      )
      .groupBy(profileAnalytics.city, profileAnalytics.country)
      .orderBy(desc(count()))
      .limit(10);

    res.json({
      period: days,
      mediaStats: mediaStats[0] || { totalMedia: 0, totalViews: 0, totalLikes: 0 },
      interactionTypes,
      topSections: Object.entries(sectionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([section, count]) => ({ section, count })),
      topLocations: viewsByLocation,
    });
  } catch (error) {
    console.error('[ProfileAnalytics] Engagement metrics error:', error);
    res.status(500).json({ message: 'Failed to fetch engagement metrics' });
  }
});

// ============================================================================
// RECENT VISITORS
// ============================================================================

/**
 * GET /api/profile/analytics/visitors/:userId
 * Get recent profile visitors with user details
 * Privacy: Only profile owner can see
 */
router.get('/analytics/visitors/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const profileUserId = parseInt(req.params.userId);
    
    if (isNaN(profileUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Privacy check
    if (req.userId !== profileUserId) {
      return res.status(403).json({ message: 'Not authorized to view visitors' });
    }

    const { limit = '20' } = req.query;

    // Get recent visitors with user details
    const visitors = await db
      .select({
        id: profileAnalytics.id,
        viewDate: profileAnalytics.viewDate,
        viewDuration: profileAnalytics.viewDuration,
        sourceType: profileAnalytics.sourceType,
        interactionType: profileAnalytics.interactionType,
        isUniqueView: profileAnalytics.isUniqueView,
        viewer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(profileAnalytics)
      .leftJoin(users, eq(profileAnalytics.viewerUserId, users.id))
      .where(eq(profileAnalytics.profileUserId, profileUserId))
      .orderBy(desc(profileAnalytics.viewDate))
      .limit(parseInt(limit as string));

    res.json(visitors);
  } catch (error) {
    console.error('[ProfileAnalytics] Visitors error:', error);
    res.status(500).json({ message: 'Failed to fetch recent visitors' });
  }
});

// ============================================================================
// PROFESSIONAL METRICS (Business Profiles)
// ============================================================================

/**
 * GET /api/profile/analytics/inquiries/:userId
 * Get inquiry statistics for business profiles
 * Privacy: Only profile owner can see
 */
router.get('/analytics/inquiries/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const profileUserId = parseInt(req.params.userId);
    
    if (isNaN(profileUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Privacy check
    if (req.userId !== profileUserId) {
      return res.status(403).json({ message: 'Not authorized to view inquiry stats' });
    }

    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Total inquiries
    const [totalInquiries] = await db
      .select({
        count: count(),
      })
      .from(profileInquiries)
      .where(
        and(
          eq(profileInquiries.profileUserId, profileUserId),
          gte(profileInquiries.createdAt, startDate)
        )
      );

    // Inquiries by status
    const inquiriesByStatus = await db
      .select({
        status: profileInquiries.status,
        count: count(),
      })
      .from(profileInquiries)
      .where(
        and(
          eq(profileInquiries.profileUserId, profileUserId),
          gte(profileInquiries.createdAt, startDate)
        )
      )
      .groupBy(profileInquiries.status);

    // Inquiries by type
    const inquiriesByType = await db
      .select({
        type: profileInquiries.inquiryType,
        count: count(),
      })
      .from(profileInquiries)
      .where(
        and(
          eq(profileInquiries.profileUserId, profileUserId),
          gte(profileInquiries.createdAt, startDate)
        )
      )
      .groupBy(profileInquiries.inquiryType);

    // Response rate
    const [responseStats] = await db
      .select({
        total: count(),
        responded: sql<number>`COUNT(*) FILTER (WHERE ${profileInquiries.respondedAt} IS NOT NULL)`,
      })
      .from(profileInquiries)
      .where(
        and(
          eq(profileInquiries.profileUserId, profileUserId),
          gte(profileInquiries.createdAt, startDate)
        )
      );

    const responseRate = responseStats.total > 0 
      ? (responseStats.responded / responseStats.total) * 100 
      : 0;

    // Average response time (in hours)
    const avgResponseTime = await db
      .select({
        avgHours: sql<number>`AVG(EXTRACT(EPOCH FROM (${profileInquiries.respondedAt} - ${profileInquiries.createdAt})) / 3600)`,
      })
      .from(profileInquiries)
      .where(
        and(
          eq(profileInquiries.profileUserId, profileUserId),
          gte(profileInquiries.createdAt, startDate),
          sql`${profileInquiries.respondedAt} IS NOT NULL`
        )
      );

    res.json({
      period: days,
      totalInquiries: totalInquiries.count || 0,
      inquiriesByStatus,
      inquiriesByType,
      responseRate: Math.round(responseRate * 10) / 10,
      avgResponseTimeHours: avgResponseTime[0]?.avgHours 
        ? Math.round(avgResponseTime[0].avgHours * 10) / 10 
        : null,
    });
  } catch (error) {
    console.error('[ProfileAnalytics] Inquiry stats error:', error);
    res.status(500).json({ message: 'Failed to fetch inquiry statistics' });
  }
});

/**
 * GET /api/profile/analytics/bookings/:userId
 * Get booking statistics (derived from inquiries with booking type)
 * Privacy: Only profile owner can see
 */
router.get('/analytics/bookings/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const profileUserId = parseInt(req.params.userId);
    
    if (isNaN(profileUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Privacy check
    if (req.userId !== profileUserId) {
      return res.status(403).json({ message: 'Not authorized to view booking stats' });
    }

    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Booking-related inquiries
    const [bookingStats] = await db
      .select({
        total: count(),
        accepted: sql<number>`COUNT(*) FILTER (WHERE ${profileInquiries.status} = 'accepted')`,
        completed: sql<number>`COUNT(*) FILTER (WHERE ${profileInquiries.status} = 'completed')`,
        declined: sql<number>`COUNT(*) FILTER (WHERE ${profileInquiries.status} = 'declined')`,
        totalBudget: sql<number>`COALESCE(SUM(${profileInquiries.budget}), 0)`,
        avgBudget: sql<number>`AVG(${profileInquiries.budget})`,
      })
      .from(profileInquiries)
      .where(
        and(
          eq(profileInquiries.profileUserId, profileUserId),
          eq(profileInquiries.inquiryType, 'booking'),
          gte(profileInquiries.createdAt, startDate)
        )
      );

    // Bookings by event type
    const bookingsByEventType = await db
      .select({
        eventType: profileInquiries.eventType,
        count: count(),
        totalBudget: sql<number>`COALESCE(SUM(${profileInquiries.budget}), 0)`,
      })
      .from(profileInquiries)
      .where(
        and(
          eq(profileInquiries.profileUserId, profileUserId),
          eq(profileInquiries.inquiryType, 'booking'),
          gte(profileInquiries.createdAt, startDate)
        )
      )
      .groupBy(profileInquiries.eventType);

    // Conversion rate
    const conversionRate = bookingStats.total > 0
      ? ((bookingStats.accepted + bookingStats.completed) / bookingStats.total) * 100
      : 0;

    res.json({
      period: days,
      totalBookingInquiries: bookingStats.total || 0,
      acceptedBookings: bookingStats.accepted || 0,
      completedBookings: bookingStats.completed || 0,
      declinedBookings: bookingStats.declined || 0,
      conversionRate: Math.round(conversionRate * 10) / 10,
      totalRevenuePotential: parseFloat(bookingStats.totalBudget?.toString() || '0'),
      avgBookingValue: bookingStats.avgBudget 
        ? Math.round(parseFloat(bookingStats.avgBudget.toString()) * 100) / 100
        : null,
      bookingsByEventType,
    });
  } catch (error) {
    console.error('[ProfileAnalytics] Booking stats error:', error);
    res.status(500).json({ message: 'Failed to fetch booking statistics' });
  }
});

export default router;
