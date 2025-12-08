import { Router, type Request, type Response } from "express";
import { db } from "@shared/db";
import { users, events, groups } from "@shared/schema";
import { eq, and, isNotNull, sql } from "drizzle-orm";
import { tangoCities, searchCities, getCitiesByRegion, getCitiesByScene, type TangoCity } from "@shared/data/tangoCities";
import logger from "../middleware/logger";

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
          latitude: users.latitude,
          longitude: users.longitude,
          tangoRoles: users.tangoRoles,
          leaderLevel: users.leaderLevel,
          followerLevel: users.followerLevel,
          isVerified: users.isVerified
        })
        .from(users)
        .where(and(
          isNotNull(users.latitude),
          isNotNull(users.longitude),
          eq(users.isActive, true),
          city ? eq(users.city, city as string) : sql`1=1`,
          country ? eq(users.country, country as string) : sql`1=1`
        ))
        .limit(500);

      markers.push(...userMarkers);
    }

    // Get event markers
    if (!type || type === 'events') {
      const eventMarkersRaw = await db
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
          status: events.status,
          address: events.address,
          location: events.location
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

      // Transform to include coordinates object for frontend compatibility
      const eventMarkers = eventMarkersRaw.map(event => {
        const lat = parseFloat(String(event.latitude || 0));
        const lng = parseFloat(String(event.longitude || 0));
        return {
          ...event,
          coordinates: { lat, lng },
          address: event.address || event.location || ''
        };
      }).filter(e => !isNaN(e.coordinates.lat) && !isNaN(e.coordinates.lng));

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

// ============================================================================
// TANGO CITIES ROUTES - Global community locations
// ============================================================================

// GET /api/map/cities - Get all tango cities (230+ worldwide locations)
router.get("/cities", async (req: Request, res: Response) => {
  try {
    const { search, region, scene, limit } = req.query;
    
    let cities: TangoCity[] = tangoCities;
    
    // Filter by search query
    if (search && typeof search === 'string') {
      cities = searchCities(search);
    }
    
    // Filter by region
    if (region && typeof region === 'string') {
      cities = cities.filter(city => city.region.toLowerCase() === region.toLowerCase());
    }
    
    // Filter by tango scene level
    if (scene && typeof scene === 'string') {
      const validScenes = ['major', 'active', 'growing', 'emerging'];
      if (validScenes.includes(scene)) {
        cities = cities.filter(city => city.tangoScene === scene);
      }
    }
    
    // Apply limit if specified
    if (limit && !isNaN(parseInt(limit as string))) {
      cities = cities.slice(0, parseInt(limit as string));
    }
    
    // Transform to marker format for map compatibility
    const cityMarkers = cities.map(city => ({
      id: city.id,
      city: city.city,
      country: city.country,
      region: city.region,
      coordinates: city.coordinates,
      memberCount: city.estimatedDancers,
      activeEvents: city.weeklyMilongas,
      tangoScene: city.tangoScene,
      hasTeachers: city.hasTeachers,
      hasSchools: city.hasSchools,
      recommendations: 0,
      housing: 0,
      isActive: true,
    }));
    
    res.json(cityMarkers);
  } catch (error) {
    console.error("[Map] Error fetching tango cities:", error);
    res.status(500).json({ message: "Failed to fetch tango cities" });
  }
});

// GET /api/map/cities/stats - Get statistics about tango cities
router.get("/cities/stats", async (req: Request, res: Response) => {
  try {
    const stats = {
      totalCities: tangoCities.length,
      byScene: {
        major: tangoCities.filter(c => c.tangoScene === 'major').length,
        active: tangoCities.filter(c => c.tangoScene === 'active').length,
        growing: tangoCities.filter(c => c.tangoScene === 'growing').length,
        emerging: tangoCities.filter(c => c.tangoScene === 'emerging').length,
      },
      byRegion: {
        'South America': tangoCities.filter(c => c.region === 'South America').length,
        'North America': tangoCities.filter(c => c.region === 'North America').length,
        'Europe': tangoCities.filter(c => c.region === 'Europe').length,
        'Asia': tangoCities.filter(c => c.region === 'Asia').length,
        'Oceania': tangoCities.filter(c => c.region === 'Oceania').length,
        'Africa': tangoCities.filter(c => c.region === 'Africa').length,
        'Middle East': tangoCities.filter(c => c.region === 'Middle East').length,
        'Caribbean': tangoCities.filter(c => c.region === 'Caribbean').length,
        'Central America': tangoCities.filter(c => c.region === 'Central America').length,
      },
      totalEstimatedDancers: tangoCities.reduce((sum, c) => sum + c.estimatedDancers, 0),
      totalWeeklyMilongas: tangoCities.reduce((sum, c) => sum + c.weeklyMilongas, 0),
    };
    
    res.json(stats);
  } catch (error) {
    console.error("[Map] Error fetching cities stats:", error);
    res.status(500).json({ message: "Failed to fetch cities stats" });
  }
});

export default router;
