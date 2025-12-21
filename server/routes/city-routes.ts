import { Router, type Response, type Request } from "express";
import { db } from "../storage";
import { groups, groupMembers, cities, cityMembers } from "@shared/schema";
import { eq, ilike, sql, or, and, desc } from "drizzle-orm";

const router = Router();

// In-memory cache for city search results (TTL: 5 minutes)
const citySearchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedResult(key: string): any | null {
  const cached = citySearchCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  if (cached) {
    citySearchCache.delete(key);
  }
  return null;
}

function setCachedResult(key: string, data: any): void {
  // Limit cache size to 100 entries
  if (citySearchCache.size > 100) {
    const oldestKey = citySearchCache.keys().next().value;
    if (oldestKey) citySearchCache.delete(oldestKey);
  }
  citySearchCache.set(key, { data, timestamp: Date.now() });
}

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

  // Check cache first
  const cacheKey = `city_search:${query}`;
  const cached = getCachedResult(cacheKey);
  if (cached) {
    console.log(`[CitySearch] Cache HIT for: "${query}"`);
    return res.json(cached);
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

    const result = {
      cityGroups,
      popularCities: filteredPopularCities,
      nominatimResults,
    };
    
    // Cache the result
    setCachedResult(cacheKey, result);
    
    res.json(result);
  } catch (error) {
    console.error("[CitySearch] Error:", error);
    res.status(500).json({ error: "Failed to search cities" });
  }
});

/**
 * GET /api/cities/stats
 * Returns user count and group info for a specific city
 * Query params: ?city=Buenos Aires
 */
router.get("/stats", async (req: Request, res: Response) => {
  const cityName = (req.query.city as string || '').trim();
  
  if (!cityName) {
    return res.json({ userCount: 0, groupId: null, groupName: null });
  }

  try {
    // Find city group and member count
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
          ilike(groups.city, cityName)
        )
      )
      .limit(1);

    if (cityGroupResults.length > 0) {
      const result = cityGroupResults[0];
      return res.json({
        userCount: result.memberCount || 0,
        groupId: result.group.id,
        groupName: result.group.name,
        city: result.group.city,
        country: result.group.country,
      });
    }

    // No city group found
    res.json({ userCount: 0, groupId: null, groupName: null, city: cityName });
  } catch (error) {
    console.error("[CityStats] Error:", error);
    res.status(500).json({ error: "Failed to get city stats" });
  }
});

/**
 * GET /api/cities/find-group
 * Auto-detect existing city group OR create new one
 * Smart consolidation: "Buenos Aires" variations → same groupId
 * Disambiguation: "Buenos Aires, Texas" → different groupId
 * 
 * Query params: ?city=Buenos Aires&country=Argentina
 * Returns: { groupId, groupName, isNew, memberCount }
 */
router.get("/find-group", async (req: Request, res: Response) => {
  const cityName = (req.query.city as string || '').trim();
  const countryName = (req.query.country as string || '').trim();
  
  if (!cityName) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    console.log(`[CityFindGroup] Looking for: "${cityName}", "${countryName}"`);

    // Normalize city name for matching (same logic as frontend)
    const normalizeCityName = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/^ciudad autónoma de\s*/i, '')
        .replace(/^ciudad de\s*/i, '')
        .replace(/^provincia de\s*/i, '')
        .replace(/^metropolitan\s*/i, '')
        .replace(/^greater\s*/i, '')
        .replace(/^area\s*/i, '')
        .trim();
    };

    const normalizedCity = normalizeCityName(cityName);
    const normalizedCountry = countryName.toLowerCase().trim();

    // Search for existing city group with smart matching
    const existingGroups = await db
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
      .where(eq(groups.type, "city"))
      .limit(100);

    // Find matching group with smart consolidation
    let matchedGroup = null;
    for (const result of existingGroups) {
      const groupCity = normalizeCityName(result.group.city || result.group.name || '');
      const groupCountry = (result.group.country || '').toLowerCase().trim();
      
      // Match if normalized names are equal or one contains the other
      const cityMatch = normalizedCity === groupCity || 
                       normalizedCity.includes(groupCity) || 
                       groupCity.includes(normalizedCity);
      
      // Country must match (or be empty for legacy groups)
      const countryMatch = !normalizedCountry || 
                          !groupCountry || 
                          normalizedCountry === groupCountry ||
                          normalizedCountry.includes(groupCountry) ||
                          groupCountry.includes(normalizedCountry);
      
      if (cityMatch && countryMatch) {
        matchedGroup = result;
        console.log(`[CityFindGroup] Found existing group: ${result.group.name} (ID: ${result.group.id})`);
        break;
      }
    }

    if (matchedGroup) {
      return res.json({
        groupId: matchedGroup.group.id,
        groupName: matchedGroup.group.name,
        city: matchedGroup.group.city,
        country: matchedGroup.group.country,
        memberCount: matchedGroup.memberCount || 0,
        isNew: false,
      });
    }

    // No existing group - create new one
    console.log(`[CityFindGroup] Creating new city group for: "${cityName}", "${countryName}"`);
    
    // Get coordinates from popular cities or default
    const popularCity = POPULAR_CITIES.find(
      c => normalizeCityName(c.name) === normalizedCity && 
           c.country.toLowerCase().includes(normalizedCountry)
    );
    
    const newGroupData = {
      name: cityName,
      slug: cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      type: 'city' as const,
      city: cityName,
      country: countryName || undefined,
      visibility: 'public' as const,
      description: `Tango community in ${cityName}${countryName ? `, ${countryName}` : ''}`,
      latitude: popularCity?.lat?.toString(),
      longitude: popularCity?.lng?.toString(),
      memberCount: 0,
    };

    const [newGroup] = await db.insert(groups).values(newGroupData).returning();
    
    console.log(`[CityFindGroup] Created new city group: ${newGroup.name} (ID: ${newGroup.id})`);

    return res.json({
      groupId: newGroup.id,
      groupName: newGroup.name,
      city: newGroup.city,
      country: newGroup.country,
      memberCount: 0,
      isNew: true,
    });
  } catch (error) {
    console.error("[CityFindGroup] Error:", error);
    res.status(500).json({ error: "Failed to find or create city group" });
  }
});

/**
 * Normalize diacritics to ASCII for slug matching
 */
function normalizeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * GET /api/cities/by-slug/:slug
 * Resolve ASCII city slug to city group data
 * Example: /api/cities/by-slug/miami-tango -> full city group data
 */
router.get("/by-slug/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    if (!slug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    console.log(`[CityBySlug] Looking up slug: "${slug}"`);

    // Look for city group by slug
    let groupResult = await db
      .select({
        group: groups,
        memberCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${groupMembers} 
          WHERE ${groupMembers.groupId} = ${groups.id}
          AND ${groupMembers.status} = 'active'
        )`.as("member_count"),
        eventCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM events 
          WHERE ${sql`events.group_id`} = ${groups.id}
          AND status = 'published'
        )`.as("event_count"),
      })
      .from(groups)
      .where(
        and(
          eq(groups.type, "city"),
          eq(groups.slug, slug)
        )
      )
      .limit(1);

    if (groupResult.length > 0) {
      const result = groupResult[0];
      const group = result.group;
      console.log(`[CityBySlug] Found city group: ${group.name} (ID: ${group.id})`);
      return res.json({
        id: group.id,
        slug: group.slug,
        name: group.name,
        country: group.country,
        description: group.description,
        longDescription: group.long_description,
        coverImage: group.cover_image,
        logoImage: group.logo_image,
        latitude: group.latitude,
        longitude: group.longitude,
        memberCount: result.memberCount || 0,
        eventCount: result.eventCount || 0,
        postCount: group.post_count || 0,
        housingCount: 0,
        recommendationCount: 0,
        venueCount: 0,
        timezone: null,
        isActive: true,
        isFeatured: false,
        legacyGroupId: group.id,
      });
    }

    // FALLBACK: Try to find by city name derived from slug
    // Convert slug like "tbilisi" or "phoenix" to search pattern
    console.log(`[CityBySlug] No exact slug match for: "${slug}", trying city name fallback`);
    
    const cityNameFromSlug = slug
      .replace(/-tango(-community)?$/, '') // Remove -tango or -tango-community suffix
      .replace(/-/g, ' ') // Convert dashes to spaces
      .trim();
    
    // Search by normalized city name using ILIKE
    const fallbackResult = await db
      .select({
        group: groups,
        memberCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${groupMembers} 
          WHERE ${groupMembers.groupId} = ${groups.id}
          AND ${groupMembers.status} = 'active'
        )`.as("member_count"),
        eventCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM events 
          WHERE ${sql`events.group_id`} = ${groups.id}
          AND status = 'published'
        )`.as("event_count"),
      })
      .from(groups)
      .where(
        and(
          eq(groups.type, "city"),
          or(
            ilike(groups.city, cityNameFromSlug),
            ilike(groups.city, `%${cityNameFromSlug}%`)
          )
        )
      )
      .limit(1);

    if (fallbackResult.length > 0) {
      const result = fallbackResult[0];
      const group = result.group;
      console.log(`[CityBySlug] Found via fallback: ${group.name} (ID: ${group.id})`);
      return res.json({
        id: group.id,
        slug: group.slug,
        name: group.name,
        country: group.country,
        description: group.description,
        longDescription: group.long_description,
        coverImage: group.cover_image,
        logoImage: group.logo_image,
        latitude: group.latitude,
        longitude: group.longitude,
        memberCount: result.memberCount || 0,
        eventCount: result.eventCount || 0,
        postCount: group.post_count || 0,
        housingCount: 0,
        recommendationCount: 0,
        venueCount: 0,
        timezone: null,
        isActive: true,
        isFeatured: false,
        legacyGroupId: group.id,
      });
    }

    console.log(`[CityBySlug] No city group found for slug: "${slug}" or city name: "${cityNameFromSlug}"`);
    return res.status(404).json({ error: "City not found" });
  } catch (error) {
    console.error("[CityBySlug] Error:", error);
    res.status(500).json({ error: "Failed to lookup city" });
  }
});

/**
 * Auto-create city endpoint
 * Creates a new city in the cities table when one doesn't exist
 */
router.post("/auto-create", async (req: Request, res: Response) => {
  try {
    const { cityName, slug } = req.body;
    
    if (!cityName || !slug) {
      return res.status(400).json({ error: "cityName and slug required" });
    }
    
    // Look up city info from popular cities
    const cityInfo = POPULAR_CITIES.find(c => 
      normalizeDiacritics(c.name).toLowerCase().replace(/\s+/g, '-') === slug ||
      c.name.toLowerCase() === cityName.toLowerCase()
    );
    
    // Check if city already exists
    const existing = await db
      .select()
      .from(cities)
      .where(eq(cities.slug, slug))
      .limit(1);
      
    if (existing.length > 0) {
      return res.json({ 
        id: existing[0].id,
        slug: existing[0].slug,
        name: existing[0].name,
        country: existing[0].country,
        message: "City already exists"
      });
    }
    
    // Create new city
    const [newCity] = await db
      .insert(cities)
      .values({
        name: cityName,
        slug: slug,
        description: `Welcome to the ${cityName} Tango Community! Connect with dancers, find milongas, and discover the local tango scene.`,
        country: cityInfo?.country || '',
        latitude: cityInfo?.lat?.toString(),
        longitude: cityInfo?.lng?.toString(),
        memberCount: 0,
        eventCount: 0,
        postCount: 0,
        housingCount: 0,
        recommendationCount: 0,
        venueCount: 0,
        isActive: true,
        isFeatured: false,
      })
      .returning();
    
    console.log(`[CityAutoCreate] Created city: ${newCity.name} (ID: ${newCity.id})`);
    
    res.json({
      id: newCity.id,
      slug: newCity.slug,
      name: newCity.name,
      country: newCity.country,
      message: "City created successfully"
    });
  } catch (error) {
    console.error("[CityAutoCreate] Error:", error);
    res.status(500).json({ error: "Failed to create city" });
  }
});

/**
 * GET /api/cities/list
 * Get all active cities
 */
router.get("/list", async (req: Request, res: Response) => {
  try {
    const allCities = await db
      .select()
      .from(cities)
      .where(eq(cities.isActive, true))
      .orderBy(desc(cities.memberCount));
    
    res.json(allCities);
  } catch (error) {
    console.error("[CityList] Error:", error);
    res.status(500).json({ error: "Failed to get cities" });
  }
});

/**
 * GET /api/cities/:id
 * Get city by ID
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid city ID" });
    }
    
    const [city] = await db
      .select()
      .from(cities)
      .where(eq(cities.id, id))
      .limit(1);
    
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }
    
    res.json(city);
  } catch (error) {
    console.error("[CityById] Error:", error);
    res.status(500).json({ error: "Failed to get city" });
  }
});

/**
 * GET /api/cities/:id/members
 * Get city members
 */
router.get("/:id/members", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid city ID" });
    }
    
    const members = await db
      .select()
      .from(cityMembers)
      .where(and(
        eq(cityMembers.cityId, id),
        eq(cityMembers.status, 'active')
      ));
    
    res.json(members);
  } catch (error) {
    console.error("[CityMembers] Error:", error);
    res.status(500).json({ error: "Failed to get city members" });
  }
});

export default router;
