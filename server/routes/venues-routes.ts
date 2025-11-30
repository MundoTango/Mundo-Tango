import { Router, type Request, type Response } from "express";
import { db } from "@shared/db";
import { events } from "@shared/schema";
import { sql, eq } from "drizzle-orm";

const router = Router();

// GET /api/venues/search - Search for venues by city
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { city, q } = req.query;
    
    if (!city && !q) {
      return res.status(400).json({ message: "city or q query parameter required" });
    }

    const searchTerm = city ? (city as string) : (q as string);
    
    // Query venues from existing events in the city
    const venues = await db
      .selectDistinct({
        name: events.venue,
        venueName: events.venueName,
        address: events.address,
        city: events.city,
        country: events.country,
        latitude: events.latitude,
        longitude: events.longitude
      })
      .from(events)
      .where(sql`(${events.city} ILIKE ${`%${searchTerm}%`} OR ${events.venue} ILIKE ${`%${searchTerm}%`} OR ${events.venueName} ILIKE ${`%${searchTerm}%`})`)
      .limit(10);

    // Filter and format results
    const results = venues
      .filter(v => v.name || v.venueName)
      .map(v => ({
        id: `${v.city}_${v.name || v.venueName}`.replace(/\s+/g, '_'),
        name: v.name || v.venueName || 'Unknown Venue',
        address: v.address,
        city: v.city,
        country: v.country,
        coordinates: v.latitude && v.longitude ? { lat: parseFloat(v.latitude), lng: parseFloat(v.longitude) } : null
      }));

    res.json(results);
  } catch (error) {
    console.error("[Venues] Error searching venues:", error);
    res.status(500).json({ message: "Failed to search venues" });
  }
});

export default router;
