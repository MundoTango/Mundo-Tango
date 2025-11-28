import { Router, type Response, type Request } from "express";
import { db } from "../storage";
import { groups, groupMembers } from "@shared/schema";
import { eq, ilike, sql, or, and } from "drizzle-orm";

const router = Router();

// Popular cities list for Tier 2 instant match (subset - full list in location-search.ts)
const POPULAR_CITIES = [
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816 },
  { name: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631 },
  { name: "New York", country: "United States", lat: 40.7128, lng: -74.006 },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { name: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734 },
  { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { name: "Montevideo", country: "Uruguay", lat: -34.9011, lng: -56.1645 },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
];

interface CitySearchResult {
  id: string;
  name: string;
  country: string;
  source: 'city_group' | 'popular' | 'nominatim';
  memberCount?: number;
  groupId?: number;
  coordinates?: { lat: number; lng: number };
}

/**
 * City Search Endpoint - 3-Tier Priority System
 * Tier 1: MT City Groups (database) - highest priority
 * Tier 2: Popular Cities (instant match)
 * Tier 3: Nominatim API fallback
 */
router.get("/search", async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim().toLowerCase();
  
  if (!query || query.length < 2) {
    return res.json({ cityGroups: [], popularCities: [], nominatimResults: [] });
  }

  try {
    console.log(`[CitySearch] Query: "${query}"`);

    // Tier 1: Search MT City Groups
    const cityGroupResults = await db
      .select({
        group: groups,
        memberCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${groupMembers} 
          WHERE ${groupMembers.groupId} = ${groups.id}
          AND ${groupMembers.status} = 'active'
        )`.as("member_count"),
      })
      .from(groups)
      .where(
        and(
          eq(groups.type, "city"),
          eq(groups.visibility, "public"),
          or(
            ilike(groups.name, `%${query}%`),
            ilike(groups.city, `%${query}%`)
          )
        )
      )
      .limit(10);

    const cityGroups: CitySearchResult[] = cityGroupResults.map((r) => ({
      id: `group_${r.group.id}`,
      name: r.group.city || r.group.name,
      country: r.group.country || '',
      source: 'city_group' as const,
      memberCount: r.memberCount || 0,
      groupId: r.group.id,
      coordinates: r.group.latitude && r.group.longitude 
        ? { lat: parseFloat(r.group.latitude), lng: parseFloat(r.group.longitude) }
        : undefined,
    }));

    console.log(`[CitySearch] Tier 1 (City Groups): ${cityGroups.length} results`);

    // Tier 2: Search Popular Cities (instant match)
    const popularCities: CitySearchResult[] = POPULAR_CITIES
      .filter(city => 
        city.name.toLowerCase().includes(query) ||
        city.country.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map(city => ({
        id: `popular_${city.name.toLowerCase().replace(/\s+/g, '_')}`,
        name: city.name,
        country: city.country,
        source: 'popular' as const,
        coordinates: { lat: city.lat, lng: city.lng },
      }));

    // Filter out popular cities that already have city groups
    const cityGroupNames = new Set(cityGroups.map(g => g.name.toLowerCase()));
    const filteredPopularCities = popularCities.filter(
      city => !cityGroupNames.has(city.name.toLowerCase())
    );

    console.log(`[CitySearch] Tier 2 (Popular): ${filteredPopularCities.length} results`);

    // Tier 3: Nominatim fallback (only if Tier 1+2 have < 3 results)
    let nominatimResults: CitySearchResult[] = [];
    if (cityGroups.length + filteredPopularCities.length < 3) {
      try {
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&featuretype=city`,
          {
            headers: { 'User-Agent': 'MundoTango/1.0' },
          }
        );
        
        if (nominatimResponse.ok) {
          const nominatimData = await nominatimResponse.json();
          nominatimResults = nominatimData
            .filter((r: any) => r.type === 'city' || r.type === 'town' || r.type === 'administrative')
            .slice(0, 5)
            .map((r: any) => ({
              id: `nominatim_${r.place_id}`,
              name: r.display_name.split(',')[0],
              country: r.display_name.split(',').pop()?.trim() || '',
              source: 'nominatim' as const,
              coordinates: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) },
            }));
          console.log(`[CitySearch] Tier 3 (Nominatim): ${nominatimResults.length} results`);
        }
      } catch (nominatimError) {
        console.error('[CitySearch] Nominatim fallback failed:', nominatimError);
      }
    }

    res.json({
      cityGroups,
      popularCities: filteredPopularCities,
      nominatimResults,
    });
  } catch (error) {
    console.error("[CitySearch] Error:", error);
    res.status(500).json({ error: "Failed to search cities" });
  }
});

export default router;
