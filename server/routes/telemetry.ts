/**
 * TELEMETRY & ANALYTICS API (TRACK 9)
 * 
 * Collects and analyzes user behavior, engagement metrics, and conversion funnels.
 * Supports batch event tracking, heatmap generation, and funnel analysis.
 */

import { Router, type Response } from "express";
import { authenticateToken, type AuthRequest, requireRoleLevel } from "../middleware/auth";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { db } from "../../shared/db";
import { 
  userInteractions,
  pageViews,
  breadcrumbs,
  searchAnalytics,
  postShareAnalytics,
} from "../../shared/schema";
import { eq, desc, and, or, gte, lte, sql, count, between } from "drizzle-orm";

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const trackEventSchema = z.object({
  events: z.array(z.object({
    userId: z.number().optional(),
    sessionId: z.string().optional(),
    eventType: z.string().min(1),
    pagePath: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
    timestamp: z.string().datetime().optional(),
  })).min(1).max(100), // Batch of up to 100 events
});

// ============================================================================
// ENDPOINTS
// ============================================================================

/**
 * POST /api/telemetry/track
 * Track user events in batch
 */
router.post("/track", async (req: AuthRequest, res: Response) => {
  try {
    const data = trackEventSchema.parse(req.body);
    
    // Process events in batch
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };
    
    for (const event of data.events) {
      try {
        // Store in breadcrumbs table for user action tracking
        await db.insert(breadcrumbs).values({
          userId: event.userId || null,
          action: event.eventType,
          pagePath: event.pagePath || '/unknown',
          metadata: event.metadata || {},
          timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
        });
        
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Event ${results.success + results.failed}: ${error.message}`);
      }
    }
    
    res.status(results.failed === 0 ? 200 : 207).json({
      message: `Processed ${data.events.length} events`,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.toString() });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/telemetry/user/:userId
 * Get telemetry data for a specific user
 */
router.get("/user/:userId", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 100;
    const days = parseInt(req.query.days as string) || 7;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get user breadcrumbs (actions)
    const actions = await db.select()
      .from(breadcrumbs)
      .where(and(
        eq(breadcrumbs.userId, userId),
        gte(breadcrumbs.timestamp, startDate)
      ))
      .orderBy(desc(breadcrumbs.timestamp))
      .limit(limit);
    
    // Get user interactions
    const interactions = await db.select()
      .from(userInteractions)
      .where(and(
        eq(userInteractions.userId, userId),
        gte(userInteractions.timestamp, startDate)
      ))
      .orderBy(desc(userInteractions.timestamp))
      .limit(limit);
    
    // Get page views (if available)
    const views = await db.select()
      .from(pageViews)
      .where(and(
        eq(pageViews.userId, userId),
        gte(pageViews.timestamp, startDate)
      ))
      .orderBy(desc(pageViews.timestamp))
      .limit(limit);
    
    // Calculate statistics
    const stats = {
      totalActions: actions.length,
      totalInteractions: interactions.length,
      totalPageViews: views.length,
      uniquePages: new Set(actions.map(a => a.pagePath)).size,
      timeRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
      },
    };
    
    res.json({
      userId,
      statistics: stats,
      recentActions: actions.slice(0, 20),
      recentInteractions: interactions.slice(0, 20),
      recentPageViews: views.slice(0, 20),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/telemetry/session/:sessionId
 * Get telemetry data for a specific session
 */
router.get("/session/:sessionId", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    // Get all breadcrumbs for this session
    const sessionData = await db.select()
      .from(breadcrumbs)
      .where(
        sql`${breadcrumbs.metadata}->>'sessionId' = ${sessionId}`
      )
      .orderBy(breadcrumbs.timestamp);
    
    if (sessionData.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    // Calculate session metrics
    const startTime = sessionData[0].timestamp;
    const endTime = sessionData[sessionData.length - 1].timestamp;
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    
    const sessionStats = {
      sessionId,
      userId: sessionData[0].userId,
      startTime,
      endTime,
      durationMs: duration,
      durationMinutes: (duration / 60000).toFixed(2),
      totalEvents: sessionData.length,
      uniquePages: new Set(sessionData.map(d => d.pagePath)).size,
      eventTypes: Array.from(new Set(sessionData.map(d => d.action))),
    };
    
    res.json({
      statistics: sessionStats,
      events: sessionData,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/telemetry/heatmap/:pagePath
 * Generate heatmap data for a specific page
 */
router.get("/heatmap/:pagePath(*)", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const pagePath = '/' + req.params.pagePath;
    const days = parseInt(req.query.days as string) || 7;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all clicks on this page
    const clicks = await db.select({
      action: breadcrumbs.action,
      metadata: breadcrumbs.metadata,
      timestamp: breadcrumbs.timestamp,
    })
    .from(breadcrumbs)
    .where(and(
      eq(breadcrumbs.pagePath, pagePath),
      gte(breadcrumbs.timestamp, startDate),
      or(
        sql`${breadcrumbs.action} = 'click'`,
        sql`${breadcrumbs.action} = 'tap'`,
        sql`${breadcrumbs.action} LIKE '%_click'`
      )
    ));
    
    // Process click data into heatmap coordinates
    const heatmapData = clicks.map(click => {
      const metadata = click.metadata as any || {};
      return {
        x: metadata.x || metadata.clientX || 0,
        y: metadata.y || metadata.clientY || 0,
        element: metadata.element || metadata.target || 'unknown',
        timestamp: click.timestamp,
      };
    }).filter(d => d.x > 0 || d.y > 0); // Filter out invalid coordinates
    
    // Group clicks by proximity (50px radius)
    const clusters: any[] = [];
    for (const point of heatmapData) {
      let addedToCluster = false;
      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(cluster.x - point.x, 2) + Math.pow(cluster.y - point.y, 2)
        );
        if (distance < 50) {
          cluster.count++;
          cluster.clicks.push(point);
          addedToCluster = true;
          break;
        }
      }
      if (!addedToCluster) {
        clusters.push({
          x: point.x,
          y: point.y,
          count: 1,
          clicks: [point],
        });
      }
    }
    
    res.json({
      pagePath,
      timeRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
      },
      totalClicks: clicks.length,
      heatmapPoints: heatmapData,
      clusters: clusters.sort((a, b) => b.count - a.count),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/telemetry/funnel
 * Funnel analysis from page views to conversions
 */
router.get("/funnel", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const funnelType = (req.query.type as string) || 'default';
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Define funnel stages based on type
    let funnelStages: { name: string; paths: string[]; actions?: string[] }[] = [];
    
    if (funnelType === 'signup') {
      funnelStages = [
        { name: 'Landing', paths: ['/', '/home'] },
        { name: 'View Signup', paths: ['/signup', '/register'] },
        { name: 'Complete Signup', actions: ['signup_complete', 'registration_complete'] },
        { name: 'First Login', actions: ['login_success'] },
      ];
    } else if (funnelType === 'purchase') {
      funnelStages = [
        { name: 'Browse Products', paths: ['/products', '/shop'] },
        { name: 'View Product', paths: ['/product/'] }, // Partial match
        { name: 'Add to Cart', actions: ['add_to_cart'] },
        { name: 'Checkout', paths: ['/checkout'] },
        { name: 'Purchase Complete', actions: ['purchase_complete'] },
      ];
    } else {
      // Default funnel: basic page flow
      funnelStages = [
        { name: 'Homepage', paths: ['/'] },
        { name: 'Feature Pages', paths: ['/features', '/about', '/pricing'] },
        { name: 'Engagement', actions: ['click', 'scroll', 'video_play'] },
        { name: 'Conversion', actions: ['signup', 'subscribe', 'purchase'] },
      ];
    }
    
    // Calculate funnel metrics
    const funnelMetrics = await Promise.all(funnelStages.map(async (stage) => {
      let count = 0;
      let uniqueUsers = new Set<number>();
      
      if (stage.paths) {
        for (const path of stage.paths) {
          const results = await db.select({
            userId: breadcrumbs.userId,
          })
          .from(breadcrumbs)
          .where(and(
            gte(breadcrumbs.timestamp, startDate),
            path.endsWith('/') 
              ? sql`${breadcrumbs.pagePath} LIKE ${path + '%'}`
              : eq(breadcrumbs.pagePath, path)
          ));
          
          count += results.length;
          results.forEach(r => {
            if (r.userId) uniqueUsers.add(r.userId);
          });
        }
      }
      
      if (stage.actions) {
        for (const action of stage.actions) {
          const results = await db.select({
            userId: breadcrumbs.userId,
          })
          .from(breadcrumbs)
          .where(and(
            gte(breadcrumbs.timestamp, startDate),
            eq(breadcrumbs.action, action)
          ));
          
          count += results.length;
          results.forEach(r => {
            if (r.userId) uniqueUsers.add(r.userId);
          });
        }
      }
      
      return {
        stage: stage.name,
        events: count,
        uniqueUsers: uniqueUsers.size,
      };
    }));
    
    // Calculate conversion rates
    const funnelWithConversions = funnelMetrics.map((stage, index) => {
      const previousStage = index > 0 ? funnelMetrics[index - 1] : null;
      const conversionRate = previousStage 
        ? (stage.uniqueUsers / previousStage.uniqueUsers * 100)
        : 100;
      
      return {
        ...stage,
        conversionRate: conversionRate.toFixed(2) + '%',
        dropoffRate: previousStage
          ? ((1 - stage.uniqueUsers / previousStage.uniqueUsers) * 100).toFixed(2) + '%'
          : '0%',
      };
    });
    
    res.json({
      funnelType,
      timeRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
      },
      stages: funnelWithConversions,
      overallConversion: {
        entered: funnelMetrics[0]?.uniqueUsers || 0,
        completed: funnelMetrics[funnelMetrics.length - 1]?.uniqueUsers || 0,
        conversionRate: funnelMetrics[0]?.uniqueUsers 
          ? ((funnelMetrics[funnelMetrics.length - 1]?.uniqueUsers || 0) / funnelMetrics[0].uniqueUsers * 100).toFixed(2) + '%'
          : '0%',
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/telemetry/stats
 * Overall telemetry statistics
 */
router.get("/stats", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get statistics
    const [actionStats] = await db.select({
      totalActions: count(),
      uniqueUsers: sql<number>`count(distinct ${breadcrumbs.userId})`,
    })
    .from(breadcrumbs)
    .where(gte(breadcrumbs.timestamp, startDate));
    
    const [interactionStats] = await db.select({
      totalInteractions: count(),
    })
    .from(userInteractions)
    .where(gte(userInteractions.timestamp, startDate));
    
    // Get top actions
    const topActions = await db.select({
      action: breadcrumbs.action,
      count: count(),
    })
    .from(breadcrumbs)
    .where(gte(breadcrumbs.timestamp, startDate))
    .groupBy(breadcrumbs.action)
    .orderBy(desc(count()))
    .limit(10);
    
    // Get top pages
    const topPages = await db.select({
      pagePath: breadcrumbs.pagePath,
      count: count(),
    })
    .from(breadcrumbs)
    .where(gte(breadcrumbs.timestamp, startDate))
    .groupBy(breadcrumbs.pagePath)
    .orderBy(desc(count()))
    .limit(10);
    
    res.json({
      timeRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days,
      },
      summary: {
        ...actionStats,
        ...interactionStats,
      },
      topActions,
      topPages,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
