import { Router, type Request, type Response } from "express";
import { db } from "@shared/db";
import { users, events, groups } from "@shared/schema";
import { eq, and, isNotNull, sql } from "drizzle-orm";

const router = Router();

// ============================================================================
// MAP MARKERS ROUTES
// ============================================================================

// GET /api/map/markers - Get all map markers (users, events, venues/groups)
router.get("/markers", async (req: Request, res: Response) => {
  try {
    const { type, city, country } = req.query;

    const markers: any[] = [];

    // Get user markers (dancers, teachers, DJs)
    if (!type || type === 'users') {
      const userMarkers = await db
        .select({
          id: users.id,
          type: sql<string>`'user'`.as('type'),
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
          latitude: sql<string>`users.city::text`.as('latitude'),
          longitude: sql<string>`users.country::text`.as('longitude'),
          tangoRoles: users.tangoRoles,
          leaderLevel: users.leaderLevel,
          followerLevel: users.followerLevel,
          isVerified: users.isVerified
        })
        .from(users)
        .where(and(
          isNotNull(users.city),
          isNotNull(users.country),
          eq(users.isActive, true),
          city ? eq(users.city, city as string) : sql`1=1`,
          country ? eq(users.country, country as string) : sql`1=1`
        ))
        .limit(500);

      markers.push(...userMarkers);
    }

    // Get event markers
    if (!type || type === 'events') {
      const eventMarkers = await db
        .select({
          id: events.id,
          type: sql<string>`'event'`.as('type'),
          title: events.title,
          eventType: events.eventType,
          city: events.city,
          country: events.country,
          latitude: events.latitude,
          longitude: events.longitude,
          startDate: events.startDate,
          endDate: events.endDate,
          imageUrl: events.imageUrl,
          isFree: events.isFree,
          price: events.price,
          status: events.status
        })
        .from(events)
        .where(and(
          isNotNull(events.latitude),
          isNotNull(events.longitude),
          eq(events.status, 'published'),
          city ? eq(events.city, city as string) : sql`1=1`,
          country ? eq(events.country, country as string) : sql`1=1`
        ))
        .limit(500);

      markers.push(...eventMarkers);
    }

    // Get group/venue markers (city groups, professional groups)
    if (!type || type === 'venues') {
      const venueMarkers = await db
        .select({
          id: groups.id,
          type: sql<string>`'venue'`.as('type'),
          name: groups.name,
          groupType: groups.type,
          city: groups.city,
          country: groups.country,
          latitude: groups.latitude,
          longitude: groups.longitude,
          memberCount: groups.memberCount,
          imageUrl: groups.imageUrl,
          isPrivate: groups.isPrivate
        })
        .from(groups)
        .where(and(
          isNotNull(groups.latitude),
          isNotNull(groups.longitude),
          city ? eq(groups.city, city as string) : sql`1=1`,
          country ? eq(groups.country, country as string) : sql`1=1`
        ))
        .limit(500);

      markers.push(...venueMarkers);
    }

    res.json(markers);
  } catch (error) {
    console.error("[Map] Error fetching markers:", error);
    res.status(500).json({ message: "Failed to fetch map markers" });
  }
});

// GET /api/map/clusters?zoom=X - Get clustered markers by zoom level
router.get("/clusters", async (req: Request, res: Response) => {
  try {
    const { zoom = "5", bounds } = req.query;
    
    // For MVP, return all markers and let frontend handle clustering
    // In production, implement server-side clustering based on zoom level
    const markers = await db
      .select({
        id: users.id,
        city: users.city,
        country: users.country,
        count: sql<number>`COUNT(*)::int`
      })
      .from(users)
      .where(and(
        isNotNull(users.city),
        isNotNull(users.country),
        eq(users.isActive, true)
      ))
      .groupBy(users.city, users.country)
      .limit(200);

    res.json(markers);
  } catch (error) {
    console.error("[Map] Error fetching clusters:", error);
    res.status(500).json({ message: "Failed to fetch clusters" });
  }
});

export default router;
