import { db } from "@db";
import { userTelemetry } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export interface ScrollDepthData {
  avgDepth: number;
  bounceRate: number;
}

export interface RageClick {
  elementId: string;
  count: number;
  users: number;
}

export class TelemetryPathway {
  /**
   * Analyze scroll depth for a specific page
   */
  async analyzeScrollDepth(pagePath: string): Promise<ScrollDepthData> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const scrollEvents = await db
        .select()
        .from(userTelemetry)
        .where(
          and(
            eq(userTelemetry.eventType, 'scroll'),
            eq(userTelemetry.pagePath, pagePath),
            gte(userTelemetry.timestamp, sevenDaysAgo)
          )
        );

      if (scrollEvents.length === 0) {
        return { avgDepth: 0, bounceRate: 0 };
      }

      // Calculate average scroll depth
      let totalDepth = 0;
      let bounces = 0;

      scrollEvents.forEach(event => {
        const metadata = event.metadata as any;
        const scrollDepth = metadata?.scrollDepth || 0;
        totalDepth += scrollDepth;
        if (scrollDepth < 25) { // Less than 25% scroll = bounce
          bounces++;
        }
      });

      return {
        avgDepth: Math.round(totalDepth / scrollEvents.length),
        bounceRate: bounces / scrollEvents.length,
      };
    } catch (error) {
      console.error('[Telemetry Pathway] Error analyzing scroll depth:', error);
      return { avgDepth: 0, bounceRate: 0 };
    }
  }

  /**
   * Find pages with high exit rates (dead ends)
   */
  async findDeadEnds(): Promise<string[]> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Find pages where users exit without further navigation
      const exitEvents = await db
        .select({
          pagePath: userTelemetry.pagePath,
          exitCount: sql<number>`COUNT(DISTINCT ${userTelemetry.userId})`,
        })
        .from(userTelemetry)
        .where(
          and(
            eq(userTelemetry.eventType, 'page_exit'),
            gte(userTelemetry.timestamp, sevenDaysAgo)
          )
        )
        .groupBy(userTelemetry.pagePath)
        .having(sql`COUNT(DISTINCT ${userTelemetry.userId}) > 10`); // At least 10 exits

      return exitEvents
        .sort((a, b) => (b.exitCount || 0) - (a.exitCount || 0))
        .map(e => e.pagePath)
        .slice(0, 10);
    } catch (error) {
      console.error('[Telemetry Pathway] Error finding dead ends:', error);
      return [];
    }
  }

  /**
   * Detect rage clicks (rapid repeated clicks on same element)
   */
  async detectRageClicks(): Promise<RageClick[]> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const clickEvents = await db
        .select()
        .from(userTelemetry)
        .where(
          and(
            eq(userTelemetry.eventType, 'click'),
            gte(userTelemetry.timestamp, sevenDaysAgo)
          )
        );

      // Group clicks by element and user, looking for rapid succession
      const rageClicks: Record<string, { count: number; users: Set<number> }> = {};

      let lastClick: { elementId: string; userId: number; time: Date } | null = null;

      clickEvents.forEach(event => {
        const metadata = event.metadata as any;
        const elementId = metadata?.elementId || metadata?.target || 'unknown';
        const userId = event.userId;
        const time = event.timestamp;

        // Check if this is a rapid click (within 1 second of last click on same element)
        if (lastClick && 
            lastClick.elementId === elementId && 
            lastClick.userId === userId &&
            time.getTime() - lastClick.time.getTime() < 1000) {
          
          if (!rageClicks[elementId]) {
            rageClicks[elementId] = { count: 0, users: new Set() };
          }
          rageClicks[elementId].count++;
          rageClicks[elementId].users.add(userId);
        }

        lastClick = { elementId, userId, time };
      });

      return Object.entries(rageClicks)
        .map(([elementId, data]) => ({
          elementId,
          count: data.count,
          users: data.users.size,
        }))
        .filter(rc => rc.count > 5) // At least 5 rage clicks
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('[Telemetry Pathway] Error detecting rage clicks:', error);
      return [];
    }
  }

  /**
   * Get telemetry summary
   */
  async getTelemetrySummary(days: number = 7): Promise<{
    totalEvents: number;
    uniqueUsers: number;
    topPages: string[];
    topEvents: string[];
  }> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const events = await db
        .select()
        .from(userTelemetry)
        .where(gte(userTelemetry.timestamp, since));

      const pageCount: Record<string, number> = {};
      const eventCount: Record<string, number> = {};

      events.forEach(event => {
        pageCount[event.pagePath] = (pageCount[event.pagePath] || 0) + 1;
        eventCount[event.eventType] = (eventCount[event.eventType] || 0) + 1;
      });

      const topPages = Object.entries(pageCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([page]) => page);

      const topEvents = Object.entries(eventCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([event]) => event);

      return {
        totalEvents: events.length,
        uniqueUsers: new Set(events.map(e => e.userId)).size,
        topPages,
        topEvents,
      };
    } catch (error) {
      console.error('[Telemetry Pathway] Error getting telemetry summary:', error);
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        topPages: [],
        topEvents: [],
      };
    }
  }
}

export const telemetryPathway = new TelemetryPathway();
