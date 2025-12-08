import { Router, Response } from "express";
import fetch from "node-fetch";
import logger from "../middleware/logger";

const router = Router();

// ============================================================================
// MB.MD AGENT 1: POPULAR CITIES DATABASE - Instant prefix matching
// ============================================================================
const POPULAR_CITIES = [
  { city: "Buenos Aires", country: "Argentina", lat: "-34.6037", lon: "-58.3816" },
  { city: "Tokyo", country: "Japan", lat: "35.6762", lon: "139.6503" },
  { city: "Paris", country: "France", lat: "48.8566", lon: "2.3522" },
  { city: "London", country: "United Kingdom", lat: "51.5074", lon: "-0.1278" },
  { city: "New York", country: "United States", lat: "40.7128", lon: "-74.0060" },
  { city: "Berlin", country: "Germany", lat: "52.5200", lon: "13.4050" },
  { city: "Rome", country: "Italy", lat: "41.9028", lon: "12.4964" },
  { city: "Milan", country: "Italy", lat: "45.4642", lon: "9.1900" },
  { city: "Barcelona", country: "Spain", lat: "41.3851", lon: "2.1734" },
  { city: "Madrid", country: "Spain", lat: "40.4168", lon: "-3.7038" },
  { city: "Amsterdam", country: "Netherlands", lat: "52.3676", lon: "4.9041" },
  { city: "Vienna", country: "Austria", lat: "48.2082", lon: "16.3738" },
  { city: "Istanbul", country: "Turkey", lat: "41.0082", lon: "28.9784" },
  { city: "Sydney", country: "Australia", lat: "-33.8688", lon: "151.2093" },
  { city: "Melbourne", country: "Australia", lat: "-37.8136", lon: "144.9631" },
  { city: "Toronto", country: "Canada", lat: "43.6532", lon: "-79.3832" },
  { city: "Vancouver", country: "Canada", lat: "49.2827", lon: "-123.1207" },
  { city: "Montreal", country: "Canada", lat: "45.5017", lon: "-73.5673" },
  { city: "Los Angeles", country: "United States", lat: "34.0522", lon: "-118.2437" },
  { city: "San Francisco", country: "United States", lat: "37.7749", lon: "-122.4194" },
  { city: "Chicago", country: "United States", lat: "41.8781", lon: "-87.6298" },
  { city: "Miami", country: "United States", lat: "25.7617", lon: "-80.1918" },
  { city: "Montevideo", country: "Uruguay", lat: "-34.9011", lon: "-56.1645" },
  { city: "Salta", country: "Argentina", lat: "-24.7821", lon: "-65.4232" },
  { city: "Córdoba", country: "Argentina", lat: "-31.4201", lon: "-64.1888" },
  { city: "Mendoza", country: "Argentina", lat: "-32.8895", lon: "-68.8458" },
  { city: "Rosario", country: "Argentina", lat: "-32.9442", lon: "-60.6505" },
  { city: "São Paulo", country: "Brazil", lat: "-23.5505", lon: "-46.6333" },
  { city: "Rio de Janeiro", country: "Brazil", lat: "-22.9068", lon: "-43.1729" },
  { city: "Mexico City", country: "Mexico", lat: "19.4326", lon: "-99.1332" },
  { city: "Bogotá", country: "Colombia", lat: "4.7110", lon: "-74.0721" },
  { city: "Lima", country: "Peru", lat: "-12.0464", lon: "-77.0428" },
  { city: "Santiago", country: "Chile", lat: "-33.4489", lon: "-70.6693" },
  { city: "Hong Kong", country: "China", lat: "22.3193", lon: "114.1694" },
  { city: "Singapore", country: "Singapore", lat: "1.3521", lon: "103.8198" },
  { city: "Seoul", country: "South Korea", lat: "37.5665", lon: "126.9780" },
  { city: "Taipei", country: "Taiwan", lat: "25.0330", lon: "121.5654" },
  { city: "Bangkok", country: "Thailand", lat: "13.7563", lon: "100.5018" },
  { city: "Moscow", country: "Russia", lat: "55.7558", lon: "37.6173" },
  { city: "Prague", country: "Czech Republic", lat: "50.0755", lon: "14.4378" },
  { city: "Budapest", country: "Hungary", lat: "47.4979", lon: "19.0402" },
  { city: "Warsaw", country: "Poland", lat: "52.2297", lon: "21.0122" },
  { city: "Lisbon", country: "Portugal", lat: "38.7223", lon: "-9.1393" },
  { city: "Athens", country: "Greece", lat: "37.9838", lon: "23.7275" },
  { city: "Dublin", country: "Ireland", lat: "53.3498", lon: "-6.2603" },
  { city: "Stockholm", country: "Sweden", lat: "59.3293", lon: "18.0686" },
  { city: "Copenhagen", country: "Denmark", lat: "55.6761", lon: "12.5683" },
  { city: "Oslo", country: "Norway", lat: "59.9139", lon: "10.7522" },
  { city: "Helsinki", country: "Finland", lat: "60.1699", lon: "24.9384" },
  { city: "Zurich", country: "Switzerland", lat: "47.3769", lon: "8.5417" },
  { city: "Geneva", country: "Switzerland", lat: "46.2044", lon: "6.1432" },
  { city: "Brussels", country: "Belgium", lat: "50.8503", lon: "4.3517" },
  { city: "Munich", country: "Germany", lat: "48.1351", lon: "11.5820" },
  { city: "Frankfurt", country: "Germany", lat: "50.1109", lon: "8.6821" },
  { city: "Hamburg", country: "Germany", lat: "53.5511", lon: "9.9937" },
  { city: "Florence", country: "Italy", lat: "43.7696", lon: "11.2558" },
  { city: "Venice", country: "Italy", lat: "45.4408", lon: "12.3155" },
  { city: "Naples", country: "Italy", lat: "40.8518", lon: "14.2681" },
  { city: "Seville", country: "Spain", lat: "37.3891", lon: "-5.9845" },
  { city: "Valencia", country: "Spain", lat: "39.4699", lon: "-0.3763" },
  { city: "Lyon", country: "France", lat: "45.7640", lon: "4.8357" },
  { city: "Marseille", country: "France", lat: "43.2965", lon: "5.3698" },
  { city: "Nice", country: "France", lat: "43.7102", lon: "7.2620" },
  { city: "Edinburgh", country: "United Kingdom", lat: "55.9533", lon: "-3.1883" },
  { city: "Manchester", country: "United Kingdom", lat: "53.4808", lon: "-2.2426" },
  { city: "Cape Town", country: "South Africa", lat: "-33.9249", lon: "18.4241" },
  { city: "Johannesburg", country: "South Africa", lat: "-26.2041", lon: "28.0473" },
  { city: "Cairo", country: "Egypt", lat: "30.0444", lon: "31.2357" },
  { city: "Dubai", country: "United Arab Emirates", lat: "25.2048", lon: "55.2708" },
  { city: "Tel Aviv", country: "Israel", lat: "32.0853", lon: "34.7818" },
  { city: "Mumbai", country: "India", lat: "19.0760", lon: "72.8777" },
  { city: "Delhi", country: "India", lat: "28.7041", lon: "77.1025" },
  { city: "Shanghai", country: "China", lat: "31.2304", lon: "121.4737" },
  { city: "Beijing", country: "China", lat: "39.9042", lon: "116.4074" },
  { city: "Osaka", country: "Japan", lat: "34.6937", lon: "135.5023" },
  { city: "Kyoto", country: "Japan", lat: "35.0116", lon: "135.7681" },
];

// Fast prefix matching for popular cities (case-insensitive)
function matchPopularCities(query: string): LocationResult[] {
  const lowerQuery = query.toLowerCase();
  return POPULAR_CITIES
    .filter(c => c.city.toLowerCase().startsWith(lowerQuery) || 
                 c.city.toLowerCase().includes(lowerQuery) ||
                 c.country.toLowerCase().startsWith(lowerQuery))
    .slice(0, 6)
    .map(c => ({
      place_id: `popular_${c.city.replace(/\s/g, '_')}_${c.country.replace(/\s/g, '_')}`,
      display_name: `${c.city}, ${c.country}`,
      lat: c.lat,
      lon: c.lon,
      type: "city",
    }));
}

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
// MB.MD: Optimized with INSTANT popular cities matching + server-side caching
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

    // STEP 1: Try instant popular cities match first (no API call needed!)
    const popularMatches = matchPopularCities(query);
    if (popularMatches.length > 0) {
      console.log(`[LocationSearch] Instant match for "${query}": ${popularMatches.length} popular cities`);
      return res.json(popularMatches);
    }

    // STEP 2: Check cache for API results
    const cached = getCachedResults(query);
    if (cached) {
      return res.json(cached);
    }

    // STEP 3: Fall back to Nominatim API only for less common locations
    console.log(`[LocationSearch] Calling Nominatim for "${query}"...`);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=0`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    try {
      const response = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "MundoTango/1.0 (tango social platform)",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

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
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.log(`[LocationSearch] Nominatim timeout for "${query}", returning empty`);
        return res.json([]);
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Location search error:", error);
    res.status(500).json({ message: "Location search failed" });
  }
});

export default router;
