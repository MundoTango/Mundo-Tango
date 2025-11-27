import { Router, Response } from "express";
import fetch from "node-fetch";

const router = Router();

// ============================================================================
// MB.MD AGENT 1: PERFORMANCE OPTIMIZATION - In-Memory Cache (5 min TTL)
// ============================================================================
interface CacheEntry {
  data: LocationResult[];
  timestamp: number;
}

const locationCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedResults(query: string): LocationResult[] | null {
  const entry = locationCache.get(query.toLowerCase());
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return null;
}

function setCachedResults(query: string, data: LocationResult[]): void {
  locationCache.set(query.toLowerCase(), { data, timestamp: Date.now() });
  // Cleanup old entries (keep cache size manageable)
  if (locationCache.size > 500) {
    const oldestKey = locationCache.keys().next().value;
    if (oldestKey) locationCache.delete(oldestKey);
  }
}

interface LocationResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: Record<string, any>;
}

// GET /api/locations/search - Search locations via OpenStreetMap Nominatim API
// MB.MD: Optimized with server-side caching for faster repeated searches
router.get("/search", async (req, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ message: "Search query required" });
    }

    const query = q.trim();
    if (query.length < 2) {
      return res.json([]);
    }

    // Check cache first (MB.MD Performance Optimization)
    const cached = getCachedResults(query);
    if (cached) {
      return res.json(cached);
    }

    // Call Nominatim API (free, no API key required)
    // Optimized: limit=6, reduce timeout to 2s, focus on cities
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=0`;

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "MundoTango/1.0 (tango social platform)",
      },
      timeout: 2000,
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = (await response.json()) as LocationResult[];

    // Filter and format results
    const results = data
      .filter((item) => item.display_name && item.lat && item.lon)
      .slice(0, 8)
      .map((item) => ({
        place_id: item.place_id.toString(),
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        type: item.type,
      }));

    // Cache the results
    setCachedResults(query, results);

    res.json(results);
  } catch (error) {
    console.error("Location search error:", error);
    res.status(500).json({ message: "Location search failed" });
  }
});

export default router;
