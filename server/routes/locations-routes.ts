import { Router, Response } from "express";
import fetch from "node-fetch";

const router = Router();

interface LocationResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: Record<string, any>;
}

// GET /api/locations/search - Search locations via OpenStreetMap Nominatim API
router.get("/search", async (req, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ message: "Search query required" });
    }

    if (q.trim().length < 2) {
      return res.json([]);
    }

    // Call Nominatim API (free, no API key required)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8`;

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "MundoTango/1.0",
      },
      timeout: 5000,
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

    res.json(results);
  } catch (error) {
    console.error("Location search error:", error);
    res.status(500).json({ message: "Location search failed" });
  }
});

export default router;
