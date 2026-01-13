import { Router, type Response, type Request } from "express";
import { db } from "../storage";
import { groups, groupMembers, cities, cityMembers, events, users, housingListings, travelPlans, groupPosts, placeRecommendations, cityWebsites, eventScrapingSources } from "@shared/schema";
import { eq, ilike, sql, or, and, desc, inArray, gte, isNull } from "drizzle-orm";
import { normalizeCityName, citiesMatch } from "../utils/city-normalize";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { storage } from "../storage";

const router = Router();

/**
 * GET /api/cities/:city/scrapers
 * Returns existing scrapers and associated websites for a city
 */
router.get("/:city/scrapers", async (req: Request, res: Response) => {
  const cityName = req.params.city;
  const country = req.query.country as string;

  try {
    // 1. Find city group to get canonical city/country if needed
    const normalizedCity = cityName.toLowerCase();
    
    // 2. Get associated websites from city_websites table
    const associatedWebsites = await db
      .select()
      .from(cityWebsites)
      .where(
        and(
          ilike(cityWebsites.city, cityName),
          country ? ilike(cityWebsites.country, country) : undefined,
          eq(cityWebsites.submissionStatus, 'approved')
        )
      );

    // 3. Get existing scrapers from event_scraping_sources
    const existingScrapers = await db
      .select()
      .from(eventScrapingSources)
      .where(
        and(
          ilike(eventScrapingSources.city, cityName),
          country ? ilike(eventScrapingSources.country, country) : undefined,
          eq(eventScrapingSources.isActive, true)
        )
      );

    res.json({
      websites: associatedWebsites,
      scrapers: existingScrapers,
    });
  } catch (error) {
    console.error("[CityScrapers] Error:", error);
    res.status(500).json({ error: "Failed to fetch city scrapers" });
  }
});

/**
 * Auto-verification helper: Analyzes a submitted URL against approved sources
 * Returns a confidence score (0-100) and reason
 */
const CITY_NAME_PATTERNS: Record<string, string[]> = {
  'paris': ['paris', 'parisien', 'parisian'],
  'london': ['london', 'londres'],
  'berlin': ['berlin', 'berliner'],
  'rome': ['roma', 'rome', 'romano'],
  'madrid': ['madrid', 'madrileño'],
  'barcelona': ['barcelona', 'bcn'],
  'buenos aires': ['buenosaires', 'bsas', 'buenos-aires', 'porteno', 'porteño'],
  'new york': ['newyork', 'nyc', 'ny'],
  'los angeles': ['losangeles', 'la'],
  'san francisco': ['sanfrancisco', 'sf'],
  'tokyo': ['tokyo', 'tokio'],
  'sydney': ['sydney'],
  'melbourne': ['melbourne'],
  'amsterdam': ['amsterdam'],
  'vienna': ['vienna', 'wien'],
  'prague': ['prague', 'praha'],
  'lisbon': ['lisbon', 'lisboa'],
  'milan': ['milan', 'milano'],
  'munich': ['munich', 'munchen', 'münchen'],
  'hamburg': ['hamburg'],
  'frankfurt': ['frankfurt'],
  'zurich': ['zurich', 'zürich'],
  'stockholm': ['stockholm'],
  'copenhagen': ['copenhagen', 'kobenhavn'],
  'budapest': ['budapest'],
  'warsaw': ['warsaw', 'warszawa'],
  'riga': ['riga'],
  'vilnius': ['vilnius'],
  'seattle': ['seattle'],
  'portland': ['portland'],
  'chicago': ['chicago'],
  'austin': ['austin'],
  'minneapolis': ['minneapolis'],
  'victoria': ['victoria'],
  'mannheim': ['mannheim'],
  'luxembourg': ['luxembourg', 'luxemburg'],
  'brugge': ['brugge', 'bruges'],
  'trier': ['trier'],
};

function detectCityMismatch(url: string, submittedCity: string): { mismatch: boolean; detectedCity: string | null; } {
  const urlLower = url.toLowerCase().replace(/[^a-z0-9]/g, '');
  const submittedCityNormalized = submittedCity.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  for (const [cityName, patterns] of Object.entries(CITY_NAME_PATTERNS)) {
    const cityNormalized = cityName.replace(/[^a-z0-9]/g, '');
    for (const pattern of patterns) {
      if (urlLower.includes(pattern)) {
        if (cityNormalized !== submittedCityNormalized && !submittedCityNormalized.includes(pattern)) {
          return { mismatch: true, detectedCity: cityName };
        }
        return { mismatch: false, detectedCity: cityName };
      }
    }
  }
  
  return { mismatch: false, detectedCity: null };
}

async function autoVerifyWebsite(websiteUrl: string, submittedCity?: string): Promise<{ 
  autoApproved: boolean; 
  confidence: number; 
  reason: string;
  cityMismatch?: { detected: string; submitted: string };
}> {
  try {
    const url = new URL(websiteUrl);
    const domain = url.hostname.toLowerCase().replace(/^www\./, '');
    
    // Get all approved sources for pattern comparison
    const approvedWebsites = await db
      .select({ websiteUrl: cityWebsites.websiteUrl })
      .from(cityWebsites)
      .where(eq(cityWebsites.submissionStatus, 'approved'));
    
    const approvedScrapers = await db
      .select({ sourceUrl: eventScrapingSources.sourceUrl })
      .from(eventScrapingSources)
      .where(eq(eventScrapingSources.isActive, true));
    
    // Extract domains from approved sources
    const approvedDomains = new Set<string>();
    [...approvedWebsites, ...approvedScrapers.map(s => ({ websiteUrl: s.sourceUrl }))].forEach(source => {
      try {
        const sourceUrl = new URL(source.websiteUrl);
        const sourceDomain = sourceUrl.hostname.toLowerCase().replace(/^www\./, '');
        approvedDomains.add(sourceDomain);
      } catch (e) { /* Skip invalid URLs */ }
    });
    
    // Check 1: Exact domain match (already approved elsewhere)
    if (approvedDomains.has(domain)) {
      return { autoApproved: true, confidence: 95, reason: 'Domain already approved for another city' };
    }
    
    // Check 2: Known tango/dance keywords in domain
    const tangoKeywords = ['tango', 'milonga', 'practica', 'dance', 'baile', 'danza', 'vals', 'abrazo'];
    const hasTangoKeyword = tangoKeywords.some(kw => domain.includes(kw));
    
    // Check 3: Common event platforms (high trust)
    const trustedPlatforms = ['eventbrite', 'facebook', 'meetup', 'tangofolly', 'hoy-milonga', 'tangomango'];
    const isTrustedPlatform = trustedPlatforms.some(p => domain.includes(p));
    
    // Check 4: Suspicious patterns (reject)
    const suspiciousPatterns = ['casino', 'gambling', 'adult', 'xxx', 'spam', 'phishing'];
    const isSuspicious = suspiciousPatterns.some(p => domain.includes(p) || websiteUrl.includes(p));
    
    if (isSuspicious) {
      return { autoApproved: false, confidence: 10, reason: 'Domain contains suspicious patterns' };
    }
    
    // Check for city mismatch (e.g., paris URL submitted for Buenos Aires)
    if (submittedCity) {
      const cityCheck = detectCityMismatch(websiteUrl, submittedCity);
      if (cityCheck.mismatch && cityCheck.detectedCity) {
        return { 
          autoApproved: false, 
          confidence: 20, 
          reason: `City mismatch detected: URL appears to be for ${cityCheck.detectedCity}, not ${submittedCity}`,
          cityMismatch: { detected: cityCheck.detectedCity, submitted: submittedCity }
        };
      }
    }
    
    if (isTrustedPlatform) {
      return { autoApproved: true, confidence: 90, reason: 'Recognized event platform' };
    }
    
    if (hasTangoKeyword) {
      return { autoApproved: true, confidence: 80, reason: 'Domain contains tango-related keywords' };
    }
    
    // Check 5: Domain similarity to approved sources (partial match)
    for (const approvedDomain of approvedDomains) {
      // Check if they share a root domain (e.g., tangox.city1 vs tangox.city2)
      const domainParts = domain.split('.');
      const approvedParts = approvedDomain.split('.');
      
      if (domainParts.length >= 2 && approvedParts.length >= 2) {
        const domainRoot = domainParts.slice(-2).join('.');
        const approvedRoot = approvedParts.slice(-2).join('.');
        if (domainRoot === approvedRoot) {
          return { autoApproved: true, confidence: 75, reason: `Similar to approved domain: ${approvedDomain}` };
        }
      }
    }
    
    // Default: Manual review needed (but low-risk sites can still be auto-approved with moderate confidence)
    const hasEventsPath = websiteUrl.includes('/events') || websiteUrl.includes('/calendar') || websiteUrl.includes('/agenda');
    if (hasEventsPath) {
      return { autoApproved: true, confidence: 65, reason: 'URL contains events/calendar path' };
    }
    
    return { autoApproved: false, confidence: 40, reason: 'Could not auto-verify - manual review suggested' };
    
  } catch (error) {
    console.error('[AutoVerify] Error:', error);
    return { autoApproved: false, confidence: 0, reason: 'Invalid URL format' };
  }
}

/**
 * POST /api/cities/suggest-source
 * User suggests a new event source during onboarding
 * Auto-verifies by comparing to approved sources
 */
router.post("/suggest-source", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { city, country, websiteUrl, latitude, longitude } = req.body;

    if (!city || !websiteUrl) {
      return res.status(400).json({ error: "City and Website URL are required" });
    }

    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch (e) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Check if this URL is already submitted for this city
    const existingWebsite = await db
      .select()
      .from(cityWebsites)
      .where(
        and(
          ilike(cityWebsites.city, city),
          eq(cityWebsites.websiteUrl, websiteUrl)
        )
      )
      .limit(1);

    if (existingWebsite.length > 0) {
      const status = existingWebsite[0].submissionStatus;
      if (status === 'approved') {
        return res.json({
          success: true,
          message: "Great choice! This source is already being tracked.",
          suggestion: existingWebsite[0],
          alreadyExists: true
        });
      } else if (status === 'pending_review') {
        return res.json({
          success: true,
          message: "Thanks! This source has already been submitted and is pending review.",
          suggestion: existingWebsite[0],
          alreadyExists: true
        });
      }
    }

    // Auto-verify the website with city validation
    const verification = await autoVerifyWebsite(websiteUrl, city);
    const submissionStatus = verification.autoApproved ? 'approved' : 'pending_review';
    
    console.log(`[SuggestSource] Auto-verification for ${websiteUrl}: ${JSON.stringify(verification)}`);

    // Insert the suggestion
    const [suggestion] = await db.insert(cityWebsites).values({
      city,
      country: country || 'Unknown',
      websiteUrl,
      latitude: latitude?.toString() || "0",
      longitude: longitude?.toString() || "0",
      submissionStatus,
      submittedBy: userId,
    }).returning();

    // Only notify admin if not auto-approved
    if (!verification.autoApproved) {
      try {
        const admin = await db.query.users.findFirst({
          where: eq(users.email, 'scott@boddye.com')
        });

        if (admin) {
          await storage.createNotification({
            userId: admin.id,
            type: 'system',
            title: 'New Source Needs Review',
            message: `User suggested ${websiteUrl} for ${city}. Confidence: ${verification.confidence}%. Reason: ${verification.reason}`,
            link: `/admin/pending-sources`,
            read: false,
          });
        }
      } catch (notifyError) {
        console.error("[SuggestSource] Notification failed:", notifyError);
      }
    }

    const responseMessage = verification.autoApproved 
      ? `Source added! We'll start tracking events from ${new URL(websiteUrl).hostname}.`
      : "Thank you! Your suggestion has been submitted for review.";

    res.json({
      success: true,
      message: responseMessage,
      suggestion,
      verification: {
        autoApproved: verification.autoApproved,
        confidence: verification.confidence,
        reason: verification.reason
      }
    });
  } catch (error: any) {
    console.error("[SuggestSource] Error:", error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.json({
        success: true,
        message: "This source has already been submitted for this city.",
        alreadyExists: true
      });
    }
    
    res.status(500).json({ error: "Failed to suggest source" });
  }
});

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
  isExternal?: boolean; // True for nominatim results (will auto-create city)
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

    // Tier 3: ALWAYS query Nominatim for external cities
    // This allows users to select ANY city worldwide, even if not in our database
    let nominatimResults: CitySearchResult[] = [];
    try {
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=1`,
        {
          headers: { 'User-Agent': 'MundoTango/1.0 (https://mundotango.life)' },
        }
      );
      
      if (nominatimResponse.ok) {
        const nominatimData = await nominatimResponse.json();
        // Accept cities, towns, villages, and administrative areas
        nominatimResults = nominatimData
          .filter((r: any) => {
            const validTypes = ['city', 'town', 'village', 'municipality', 'administrative', 'suburb', 'hamlet'];
            return validTypes.includes(r.type) || r.class === 'place' || r.class === 'boundary';
          })
          .slice(0, 8)
          .map((r: any) => {
            // Extract city name and country from address details
            const address = r.address || {};
            const cityName = address.city || address.town || address.village || 
                           address.municipality || address.suburb || r.display_name.split(',')[0];
            const countryName = address.country || r.display_name.split(',').pop()?.trim() || '';
            
            return {
              id: `nominatim_${r.place_id}`,
              name: cityName,
              country: countryName,
              source: 'nominatim' as const,
              coordinates: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) },
              // Mark as external for UI badge
              isExternal: true,
            };
          });
        
        // Filter out nominatim results that already exist in cityGroups (match by city+country)
        const existingCityKeys = new Set([
          ...cityGroups.map(g => `${g.name.toLowerCase()}|${g.country.toLowerCase()}`),
          ...filteredPopularCities.map(c => `${c.name.toLowerCase()}|${c.country.toLowerCase()}`)
        ]);
        nominatimResults = nominatimResults.filter(
          r => !existingCityKeys.has(`${r.name.toLowerCase()}|${r.country.toLowerCase()}`)
        );
        
        console.log(`[CitySearch] Tier 3 (Nominatim): ${nominatimResults.length} results`);
      }
    } catch (nominatimError) {
      console.error('[CitySearch] Nominatim failed:', nominatimError);
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
    
    const slug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newGroupData = {
      name: cityName,
      slug: slug,
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

    // MUNDO TANGO: Ensure it exists in the world map 'cities' table too
    try {
      const existingCity = await db.select().from(cities).where(eq(cities.slug, slug)).limit(1);
      if (!existingCity.length) {
        await db.insert(cities).values({
          name: cityName,
          slug: slug,
          country: countryName || '',
          latitude: popularCity?.lat?.toString(),
          longitude: popularCity?.lng?.toString(),
          description: `Tango community for ${cityName}`,
          isActive: true,
          legacyGroupId: newGroup.id,
        });
      }
    } catch (syncErr) {
      console.error(`[CityFindGroup] Failed to sync with cities table:`, syncErr);
    }
    
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
 * Resolve ASCII city slug to city data (cities table first, groups fallback)
 * Example: /api/cities/by-slug/tbilisi-tango -> full city data
 */
router.get("/by-slug/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    if (!slug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    console.log(`[CityBySlug] Looking up slug: "${slug}"`);

    // Normalize slug for matching - handle with and without -tango suffix
    const normalizedSlug = slug.toLowerCase().trim();
    const slugWithTango = normalizedSlug.endsWith('-tango') ? normalizedSlug : `${normalizedSlug}-tango`;
    const slugWithoutTango = normalizedSlug.replace(/-tango(-community)?$/, '');

    // PRIORITY 1: Search cities table first (new normalized data)
    let cityResult = await db
      .select()
      .from(cities)
      .where(
        or(
          eq(cities.slug, normalizedSlug),
          eq(cities.slug, slugWithTango),
          ilike(cities.slug, `${slugWithoutTango}%`)
        )
      )
      .limit(1);

    if (cityResult.length > 0) {
      const city = cityResult[0];
      console.log(`[CityBySlug] Found in cities table: ${city.name} (ID: ${city.id}, legacyGroupId: ${city.legacyGroupId})`);
      
      // Get counts from events and city_members
      const [memberCountResult, eventCountResult] = await Promise.all([
        db.select({ count: sql<number>`COUNT(*)::int` })
          .from(cityMembers)
          .where(and(eq(cityMembers.cityId, city.id), eq(cityMembers.status, 'active'))),
        db.select({ count: sql<number>`COUNT(*)::int` })
          .from(events)
          .where(ilike(events.city, city.name))
      ]);
      
      const memberCount = memberCountResult[0]?.count || 0;
      const eventCount = eventCountResult[0]?.count || 0;
      
      return res.json({
        id: city.id,
        slug: city.slug,
        name: city.name,
        city: city.name,
        country: city.country,
        region: city.region,
        description: city.description,
        longDescription: city.longDescription,
        coverImage: city.coverImage,
        logoImage: city.logoImage,
        latitude: city.latitude,
        longitude: city.longitude,
        memberCount,
        eventCount,
        postCount: city.postCount || 0,
        housingCount: city.housingCount || 0,
        recommendationCount: city.recommendationCount || 0,
        venueCount: city.venueCount || 0,
        timezone: city.timezone,
        isActive: city.isActive,
        isFeatured: city.isFeatured,
        legacyGroupId: city.legacyGroupId,
      });
    }

    // PRIORITY 2: Fallback to groups table for legacy data
    console.log(`[CityBySlug] Not in cities table, checking groups for: "${slug}"`);
    
    let groupResult = await db
      .select()
      .from(groups)
      .where(
        and(
          eq(groups.type, "city"),
          or(
            eq(groups.slug, normalizedSlug),
            eq(groups.slug, slugWithTango),
            ilike(groups.slug, `${slugWithoutTango}%`)
          )
        )
      )
      .limit(1);

    if (groupResult.length > 0) {
      const group = groupResult[0];
      
      // Check if city exists in cities table by legacyGroupId
      let existingCity = await db
        .select()
        .from(cities)
        .where(eq(cities.legacyGroupId, group.id))
        .limit(1);
      
      let cityId: number;
      if (existingCity.length > 0) {
        cityId = existingCity[0].id;
        console.log(`[CityBySlug] Found existing city row for group ${group.id}: city ID ${cityId}`);
      } else {
        // Create city row from group data
        const citySlug = group.slug || `${(group.city || group.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-tango`;
        const [newCity] = await db.insert(cities).values({
          name: group.city || group.name,
          slug: citySlug,
          country: group.country || '',
          region: null,
          latitude: group.latitude,
          longitude: group.longitude,
          description: group.description,
          longDescription: group.longDescription,
          coverImage: group.coverImage,
          logoImage: group.logoImage,
          legacyGroupId: group.id,
          isActive: true,
          isFeatured: false,
        }).returning();
        cityId = newCity.id;
        console.log(`[CityBySlug] Created new city row for group ${group.id}: city ID ${cityId}`);
      }
      
      // Get counts separately for reliability
      const [memberCountResult, eventCountResult] = await Promise.all([
        db.select({ count: sql<number>`COUNT(*)::int` })
          .from(groupMembers)
          .where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.status, 'active'))),
        db.select({ count: sql<number>`COUNT(*)::int` })
          .from(events)
          .where(and(eq(events.groupId, group.id), eq(events.status, 'published')))
      ]);
      
      const memberCount = memberCountResult[0]?.count || 0;
      const eventCount = eventCountResult[0]?.count || 0;
      
      console.log(`[CityBySlug] Found city group: ${group.name} (ID: ${group.id}), cityId: ${cityId}, events: ${eventCount}`);
      return res.json({
        id: cityId,  // Return city table ID, NOT group.id
        slug: group.slug,
        name: group.name,
        city: group.city,
        country: group.country,
        description: group.description,
        longDescription: group.longDescription,
        coverImage: group.coverImage,
        logoImage: group.logoImage,
        latitude: group.latitude,
        longitude: group.longitude,
        memberCount,
        eventCount,
        postCount: group.postCount || 0,
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
      .select()
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
      const group = fallbackResult[0];
      
      // Check if city exists in cities table by legacyGroupId
      let existingCity = await db
        .select()
        .from(cities)
        .where(eq(cities.legacyGroupId, group.id))
        .limit(1);
      
      let cityId: number;
      if (existingCity.length > 0) {
        cityId = existingCity[0].id;
        console.log(`[CityBySlug] Found existing city row for group ${group.id}: city ID ${cityId}`);
      } else {
        // Create city row from group data
        const citySlug = group.slug || `${(group.city || group.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-tango`;
        const [newCity] = await db.insert(cities).values({
          name: group.city || group.name,
          slug: citySlug,
          country: group.country || '',
          region: null,
          latitude: group.latitude,
          longitude: group.longitude,
          description: group.description,
          longDescription: group.longDescription,
          coverImage: group.coverImage,
          logoImage: group.logoImage,
          legacyGroupId: group.id,
          isActive: true,
          isFeatured: false,
        }).returning();
        cityId = newCity.id;
        console.log(`[CityBySlug] Created new city row for group ${group.id}: city ID ${cityId}`);
      }
      
      // Get counts separately for reliability
      const [memberCountResult, eventCountResult] = await Promise.all([
        db.select({ count: sql<number>`COUNT(*)::int` })
          .from(groupMembers)
          .where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.status, 'active'))),
        db.select({ count: sql<number>`COUNT(*)::int` })
          .from(events)
          .where(and(eq(events.groupId, group.id), eq(events.status, 'published')))
      ]);
      
      const memberCount = memberCountResult[0]?.count || 0;
      const eventCount = eventCountResult[0]?.count || 0;
      
      console.log(`[CityBySlug] Found via fallback: ${group.name} (groupId: ${group.id}), cityId: ${cityId}, events: ${eventCount}`);
      return res.json({
        id: cityId,  // Return city table ID, NOT group.id
        slug: group.slug,
        name: group.name,
        city: group.city,
        country: group.country,
        description: group.description,
        longDescription: group.longDescription,
        coverImage: group.coverImage,
        logoImage: group.logoImage,
        latitude: group.latitude,
        longitude: group.longitude,
        memberCount,
        eventCount,
        postCount: group.postCount || 0,
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
 * GET /api/cities/followed
 * Get all cities the current user is following (for "My Stuff" sidebar)
 * IMPORTANT: This route MUST be defined BEFORE /:id to prevent route matching conflicts
 */
router.get("/followed", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.json([]);
    }
    
    const followedCities = await db
      .select({
        membership: cityMembers,
        city: cities,
      })
      .from(cityMembers)
      .innerJoin(cities, eq(cityMembers.cityId, cities.id))
      .where(and(
        eq(cityMembers.userId, userId),
        eq(cityMembers.status, 'active')
      ));
    
    console.log(`[FollowedCities] User ${userId} has ${followedCities.length} followed cities`);
    
    res.json(followedCities.map(fc => ({
      ...fc.city,
      membershipType: fc.membership.membershipType,
      isResident: fc.membership.membershipType === 'resident',
    })));
  } catch (error) {
    console.error("[FollowedCities] Error:", error);
    res.status(500).json({ error: "Failed to get followed cities" });
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

/**
 * POST /api/cities/:id/follow
 * Follow a city (non-resident) - adds city to user's "My Stuff" and includes events in feed
 */
router.post("/:id/follow", async (req: Request, res: Response) => {
  try {
    const cityId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (isNaN(cityId)) {
      return res.status(400).json({ error: "Invalid city ID" });
    }
    
    // Check if city exists
    const [city] = await db.select().from(cities).where(eq(cities.id, cityId)).limit(1);
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }
    
    // Check if already following
    const [existing] = await db
      .select()
      .from(cityMembers)
      .where(and(eq(cityMembers.cityId, cityId), eq(cityMembers.userId, userId)))
      .limit(1);
    
    if (existing) {
      return res.json({ message: "Already following this city", membership: existing });
    }
    
    // Check if user lives in this city using canonical slug comparison
    // This prevents false positives like "Newark" matching "New York"
    const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const userCityRaw = userRecord?.city?.trim() || '';
    
    // Generate slug for user's profile city
    // Also extract just the city name if format is "City, Country"
    const toSlug = (name: string): string => name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Handle "City, Country" format - extract just the city part
    const userCityName = userCityRaw.includes(',') 
      ? userCityRaw.split(',')[0].trim()
      : userCityRaw;
    const userCitySlug = toSlug(userCityName);
    
    // Use canonical city slug OR compare slugified names
    // Also check if user city exactly matches city name (case-insensitive)
    const canonicalCitySlug = city.slug || '';
    const userCityLower = userCityName.toLowerCase();
    const cityNameLower = city.name.toLowerCase();
    const cityFieldLower = (city.city || '').toLowerCase();
    
    // User is resident if:
    // 1. User's slugified city matches canonical city slug, OR
    // 2. User's city name exactly matches city name or city field (case-insensitive), OR
    // 3. Canonical slug starts with user's city slug (e.g., "berlin" matches "berlin-tango")
    const isResident = userCitySlug !== '' && (
      userCitySlug === canonicalCitySlug ||
      userCityLower === cityNameLower ||
      userCityLower === cityFieldLower ||
      canonicalCitySlug.startsWith(userCitySlug + '-') ||
      canonicalCitySlug === userCitySlug
    );
    
    // Create membership
    const [membership] = await db
      .insert(cityMembers)
      .values({
        cityId,
        userId,
        role: 'member',
        status: 'active',
        membershipType: isResident ? 'resident' : 'follower',
      })
      .returning();
    
    console.log(`[CityFollow] User ${userId} ${isResident ? 'joined as resident' : 'followed'} city ${city.name}`);
    
    res.json({ 
      message: isResident ? "Joined as resident" : "Now following this city", 
      membership,
      isResident 
    });
  } catch (error) {
    console.error("[CityFollow] Error:", error);
    res.status(500).json({ error: "Failed to follow city" });
  }
});

/**
 * DELETE /api/cities/:id/follow
 * Unfollow a city
 */
router.delete("/:id/follow", async (req: Request, res: Response) => {
  try {
    const cityId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (isNaN(cityId)) {
      return res.status(400).json({ error: "Invalid city ID" });
    }
    
    await db
      .delete(cityMembers)
      .where(and(eq(cityMembers.cityId, cityId), eq(cityMembers.userId, userId)));
    
    console.log(`[CityUnfollow] User ${userId} unfollowed city ${cityId}`);
    
    res.json({ message: "Unfollowed city" });
  } catch (error) {
    console.error("[CityUnfollow] Error:", error);
    res.status(500).json({ error: "Failed to unfollow city" });
  }
});

/**
 * GET /api/cities/:id/membership
 * Check if current user is a member/follower of this city
 */
router.get("/:id/membership", async (req: Request, res: Response) => {
  try {
    const cityId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.json({ isMember: false, isFollowing: false, isResident: false });
    }
    
    if (isNaN(cityId)) {
      return res.status(400).json({ error: "Invalid city ID" });
    }
    
    const [membership] = await db
      .select()
      .from(cityMembers)
      .where(and(eq(cityMembers.cityId, cityId), eq(cityMembers.userId, userId)))
      .limit(1);
    
    // Check if user lives in this city using canonical slug comparison
    // This prevents false positives like "Newark" matching "New York"
    const [city] = await db.select().from(cities).where(eq(cities.id, cityId)).limit(1);
    const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    const userCityRaw = userRecord?.city?.trim() || '';
    
    // Generate slug for comparison
    const toSlug = (name: string): string => name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Handle "City, Country" format - extract just the city part
    const userCityName = userCityRaw.includes(',') 
      ? userCityRaw.split(',')[0].trim()
      : userCityRaw;
    const userCitySlug = toSlug(userCityName);
    const canonicalCitySlug = city?.slug || '';
    // Also check without -tango suffix for more flexible matching
    const canonicalCitySlugBase = canonicalCitySlug.replace(/-tango(-community)?$/, '');
    const userCityLower = userCityName.toLowerCase();
    // Clean city name for comparison (remove Tango Community suffix)
    const cityNameLower = city?.name?.toLowerCase().replace(' tango community', '').replace(' tango', '').trim() || '';
    const cityFieldLower = (city?.city || '').toLowerCase();
    
    // User is resident if their city matches canonical slug or name
    // MB.MD v9.9.3: More flexible matching for resident detection
    const isResident = userCitySlug !== '' && (
      userCitySlug === canonicalCitySlug ||
      userCitySlug === canonicalCitySlugBase ||
      userCityLower === cityNameLower ||
      userCityLower === cityFieldLower ||
      canonicalCitySlug.startsWith(userCitySlug + '-') ||
      canonicalCitySlugBase === userCitySlug
    );

    if (!membership) {
      // If user is a resident, auto-create membership record so they appear as member
      if (isResident && city) {
        try {
          const [newMembership] = await db
            .insert(cityMembers)
            .values({
              cityId,
              userId,
              role: 'member',
              status: 'active',
              membershipType: 'resident',
            })
            .returning();
          
          console.log(`[CityMembership] Auto-created resident membership for user ${userId} in city ${city.name}`);
          
          return res.json({
            isMember: true,
            isFollowing: true,
            isResident: true,
            membershipType: 'resident',
            membership: newMembership
          });
        } catch (autoJoinErr) {
          // Might fail due to unique constraint if race condition, that's OK
          console.error(`[CityMembership] Failed to auto-create membership:`, autoJoinErr);
        }
      }
      
      return res.json({ 
        isMember: false, 
        isFollowing: false, 
        isResident,
        membershipType: null 
      });
    }
    
    // If membership exists but type is 'follower', but isResident is true, update it to 'resident'
    if (membership && membership.membershipType === 'follower' && isResident) {
      try {
        const [updatedMembership] = await db
          .update(cityMembers)
          .set({ membershipType: 'resident' })
          .where(eq(cityMembers.id, membership.id))
          .returning();
        
        console.log(`[CityMembership] Upgraded user ${userId} to resident in city ${cityId}`);
        
        return res.json({
          isMember: true,
          isFollowing: true,
          isResident: true,
          membershipType: 'resident',
          membership: updatedMembership
        });
      } catch (updateErr) {
        console.error(`[CityMembership] Failed to upgrade membership:`, updateErr);
      }
    }
    
    res.json({
      isMember: true,
      isFollowing: true,
      isResident: membership.membershipType === 'resident' || isResident,
      membershipType: membership.membershipType,
      membership
    });
  } catch (error) {
    console.error("[CityMembership] Error:", error);
    res.status(500).json({ error: "Failed to check membership" });
  }
});

/**
 * POST /api/cities/:id/join (Legacy endpoint - same logic as follow)
 * Join a city community - auto-detects if user is resident or follower
 */
/**
 * GET /api/cities/:id/visitors
 * Get visitors/travelers planning to visit this city
 */
router.get("/:id/visitors", async (req: Request, res: Response) => {
  try {
    const cityId = parseInt(req.params.id);
    if (isNaN(cityId)) {
      return res.status(400).json({ error: "Invalid city ID" });
    }
    
    // Get city info
    const [city] = await db.select().from(cities).where(eq(cities.id, cityId)).limit(1);
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }
    
    const cityName = city.name.replace(' Tango Community', '');
    
    // Query travel_plans for this city using both cityId and canonical name matching
    // MB.MD v9.9.3: Use cityId as primary match, normalized string as fallback
    const allPlans = await db
      .select({
        id: travelPlans.id,
        userId: travelPlans.userId,
        city: travelPlans.city,
        cityId: travelPlans.cityId,
        startDate: travelPlans.startDate,
        endDate: travelPlans.endDate,
        status: travelPlans.status,
        visibility: travelPlans.visibility,
        user: {
          id: users.id,
          username: users.username,
          name: users.name,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        }
      })
      .from(travelPlans)
      .innerJoin(users, eq(travelPlans.userId, users.id))
      .where(
        and(
          gte(travelPlans.endDate, new Date()),
          eq(travelPlans.visibility, 'public')
        )
      )
      .orderBy(travelPlans.startDate)
      .limit(200);
    
    // Filter using cityId match OR canonical name matching (handles diacritics, prefixes, etc.)
    const visitors = allPlans.filter(plan => 
      plan.cityId === cityId || citiesMatch(plan.city || '', cityName)
    ).slice(0, 50);
    
    // Format response
    const formattedVisitors = visitors.map(v => ({
      id: v.id,
      username: v.user.username,
      name: v.user.name || v.user.username,
      profileImage: v.user.profileImage,
      homeCity: v.user.city,
      homeCountry: v.user.country,
      arrivalDate: v.startDate ? new Date(v.startDate).toLocaleDateString() : null,
      departureDate: v.endDate ? new Date(v.endDate).toLocaleDateString() : null,
      status: v.status,
    }));
    
    console.log(`[CityVisitors] Found ${formattedVisitors.length} visitors for ${cityName}`);
    res.json(formattedVisitors);
  } catch (error) {
    console.error("[CityVisitors] Error:", error);
    res.status(500).json({ error: "Failed to get visitors" });
  }
});

/**
 * GET /api/cities/:id/housing
 * Get housing listings in this city
 */
router.get("/:id/housing", async (req: Request, res: Response) => {
  try {
    const cityId = parseInt(req.params.id);
    if (isNaN(cityId)) {
      return res.status(400).json({ error: "Invalid city ID" });
    }
    
    // Get city info
    const [city] = await db.select().from(cities).where(eq(cities.id, cityId)).limit(1);
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }
    
    const cityName = city.name.replace(' Tango Community', '');
    
    // Query housing_listings using canonical name matching
    // MB.MD v9.9.3: Use normalized comparison for diacritics/prefixes/suffixes
    const allListings = await db
      .select({
        id: housingListings.id,
        title: housingListings.title,
        description: housingListings.description,
        propertyType: housingListings.propertyType,
        bedrooms: housingListings.bedrooms,
        bathrooms: housingListings.bathrooms,
        maxGuests: housingListings.maxGuests,
        pricePerNight: housingListings.pricePerNight,
        currency: housingListings.currency,
        city: housingListings.city,
        country: housingListings.country,
        latitude: housingListings.latitude,
        longitude: housingListings.longitude,
        amenities: housingListings.amenities,
        images: housingListings.images,
        hostId: housingListings.hostId,
        host: {
          id: users.id,
          username: users.username,
          name: users.name,
          profileImage: users.profileImage,
        }
      })
      .from(housingListings)
      .innerJoin(users, eq(housingListings.hostId, users.id))
      .orderBy(desc(housingListings.id))
      .limit(200);
    
    // Filter using canonical name matching (handles diacritics, prefixes, etc.)
    const listings = allListings.filter(listing => 
      citiesMatch(listing.city || '', cityName)
    ).slice(0, 50);
    
    console.log(`[CityHousing] Found ${listings.length} housing listings for ${cityName}`);
    res.json(listings);
  } catch (error) {
    console.error("[CityHousing] Error:", error);
    res.status(500).json({ error: "Failed to get housing" });
  }
});

/**
 * GET /api/cities/:id/posts
 * Get discussion posts for this city (via legacyGroupId)
 */
router.get("/:id/posts", async (req: Request, res: Response) => {
  try {
    const cityId = parseInt(req.params.id);
    if (isNaN(cityId)) {
      return res.status(400).json({ error: "Invalid city ID" });
    }
    
    // Get city info to find legacyGroupId
    const [city] = await db.select().from(cities).where(eq(cities.id, cityId)).limit(1);
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }
    
    if (!city.legacyGroupId) {
      return res.json([]);
    }
    
    // Query group_posts using legacyGroupId
    const posts = await db
      .select({
        id: groupPosts.id,
        content: groupPosts.content,
        title: groupPosts.title,
        postType: groupPosts.postType,
        mediaUrls: groupPosts.mediaUrls,
        likeCount: groupPosts.likeCount,
        commentCount: groupPosts.commentCount,
        isPinned: groupPosts.isPinned,
        createdAt: groupPosts.createdAt,
        author: {
          id: users.id,
          username: users.username,
          name: users.name,
          profileImage: users.profileImage,
        }
      })
      .from(groupPosts)
      .innerJoin(users, eq(groupPosts.authorId, users.id))
      .where(
        and(
          eq(groupPosts.groupId, city.legacyGroupId),
          eq(groupPosts.status, 'published')
        )
      )
      .orderBy(desc(groupPosts.isPinned), desc(groupPosts.createdAt))
      .limit(50);
    
    console.log(`[CityPosts] Found ${posts.length} posts for city ${city.name} (groupId: ${city.legacyGroupId})`);
    res.json(posts);
  } catch (error) {
    console.error("[CityPosts] Error:", error);
    res.status(500).json({ error: "Failed to get posts" });
  }
});

router.post("/:id/join", async (req: Request, res: Response) => {
  try {
    const cityId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (isNaN(cityId)) {
      return res.status(400).json({ error: "Invalid city ID" });
    }
    
    // Check if city exists
    const [city] = await db.select().from(cities).where(eq(cities.id, cityId)).limit(1);
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }
    
    // Check if already following
    const [existing] = await db
      .select()
      .from(cityMembers)
      .where(and(eq(cityMembers.cityId, cityId), eq(cityMembers.userId, userId)))
      .limit(1);
    
    if (existing) {
      return res.json({ message: "Already following this city", membership: existing });
    }
    
    // Check if user lives in this city using canonical slug comparison
    const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const userCityRaw = userRecord?.city?.trim() || '';
    
    const toSlug = (name: string): string => name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const userCitySlug = toSlug(userCityRaw);
    const canonicalCitySlug = city.slug || '';
    const userCityLower = userCityRaw.toLowerCase();
    const cityNameLower = city.name.toLowerCase();
    
    // User is resident if their city matches (same logic as /follow endpoint)
    const isResident = userCitySlug !== '' && (
      userCitySlug === canonicalCitySlug ||
      userCityLower === cityNameLower ||
      canonicalCitySlug.startsWith(userCitySlug + '-') ||
      canonicalCitySlug === userCitySlug
    );
    
    // Create membership
    const [membership] = await db
      .insert(cityMembers)
      .values({
        cityId,
        userId,
        role: 'member',
        status: 'active',
        membershipType: isResident ? 'resident' : 'follower',
      })
      .returning();
    
    console.log(`[CityJoin] User ${userId} ${isResident ? 'joined as resident' : 'followed'} city ${city.name}`);
    
    res.json({ 
      message: isResident ? "Joined as resident" : "Now following this city", 
      membership,
      isResident 
    });
  } catch (error) {
    console.error("[CityJoin] Error:", error);
    res.status(500).json({ error: "Failed to join city" });
  }
});

/**
 * GET /api/cities/:id/tips
 * Get place recommendations/tips for a city
 */
router.get("/:id/tips", async (req: Request, res: Response) => {
  try {
    const cityId = parseInt(req.params.id);
    
    // Get city info
    const [city] = await db
      .select()
      .from(cities)
      .where(eq(cities.id, cityId))
      .limit(1);
    
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }
    
    // Get place recommendations that match this city
    // Match by address containing city name
    const tips = await db
      .select({
        id: placeRecommendations.id,
        name: placeRecommendations.placeName,
        title: placeRecommendations.placeName,
        category: placeRecommendations.category,
        description: placeRecommendations.description,
        latitude: placeRecommendations.latitude,
        longitude: placeRecommendations.longitude,
        address: placeRecommendations.address,
        priceRange: placeRecommendations.priceRange,
        recommendationCount: placeRecommendations.recommendationCount,
        averageRating: placeRecommendations.averageRating,
        createdAt: placeRecommendations.createdAt,
      })
      .from(placeRecommendations)
      .where(
        sql`LOWER(${placeRecommendations.address}) LIKE LOWER(${'%' + city.name + '%'})`
      )
      .orderBy(desc(placeRecommendations.recommendationCount));
    
    res.json(tips);
  } catch (error) {
    console.error("[CityTips] Error:", error);
    res.status(500).json({ error: "Failed to fetch tips" });
  }
});

/**
 * GET /api/cities/admin/pending-websites
 * Get all pending city_websites submissions for admin review
 */
router.get("/admin/pending-websites", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.tier < 8) {
      return res.status(403).json({ error: "God-level access required" });
    }

    const pending = await db
      .select()
      .from(cityWebsites)
      .where(eq(cityWebsites.submissionStatus, 'pending_review'))
      .orderBy(desc(cityWebsites.createdAt));

    res.json({ pending, count: pending.length });
  } catch (error) {
    console.error("[AdminPendingWebsites] Error:", error);
    res.status(500).json({ error: "Failed to fetch pending websites" });
  }
});

/**
 * PATCH /api/cities/admin/websites/:id/approve
 * Approve a pending city_website and add to event_scraping_sources
 */
router.patch("/admin/websites/:id/approve", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.tier < 8) {
      return res.status(403).json({ error: "God-level access required" });
    }

    const websiteId = parseInt(req.params.id);
    if (isNaN(websiteId)) {
      return res.status(400).json({ error: "Invalid website ID" });
    }

    const [website] = await db
      .select()
      .from(cityWebsites)
      .where(eq(cityWebsites.id, websiteId))
      .limit(1);

    if (!website) {
      return res.status(404).json({ error: "Website not found" });
    }

    await db
      .update(cityWebsites)
      .set({ 
        submissionStatus: 'approved', 
        updatedAt: new Date() 
      })
      .where(eq(cityWebsites.id, websiteId));

    const existingSource = await db
      .select()
      .from(eventScrapingSources)
      .where(eq(eventScrapingSources.baseUrl, website.websiteUrl))
      .limit(1);

    let sourceId = null;
    if (existingSource.length === 0) {
      const [newSource] = await db
        .insert(eventScrapingSources)
        .values({
          name: `${website.city} Community Website`,
          baseUrl: website.websiteUrl,
          scraperType: 'community',
          city: website.city,
          country: website.country || '',
          isActive: true,
          priority: 5,
        })
        .returning();
      sourceId = newSource.id;
      console.log(`[AdminApprove] Added new scraping source: ${website.websiteUrl}`);
    }

    console.log(`[AdminApprove] Approved website ${websiteId}: ${website.websiteUrl} for ${website.city}`);
    res.json({ 
      success: true, 
      message: `Approved ${website.websiteUrl}`,
      sourceId 
    });
  } catch (error) {
    console.error("[AdminApprove] Error:", error);
    res.status(500).json({ error: "Failed to approve website" });
  }
});

/**
 * PATCH /api/cities/admin/websites/:id/reject
 * Reject a pending city_website
 */
router.patch("/admin/websites/:id/reject", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.tier < 8) {
      return res.status(403).json({ error: "God-level access required" });
    }

    const websiteId = parseInt(req.params.id);
    const { reason } = req.body;

    if (isNaN(websiteId)) {
      return res.status(400).json({ error: "Invalid website ID" });
    }

    await db
      .update(cityWebsites)
      .set({ 
        submissionStatus: 'rejected',
        updatedAt: new Date()
      })
      .where(eq(cityWebsites.id, websiteId));

    console.log(`[AdminReject] Rejected website ${websiteId}: ${reason || 'No reason provided'}`);
    res.json({ success: true, message: "Website rejected" });
  } catch (error) {
    console.error("[AdminReject] Error:", error);
    res.status(500).json({ error: "Failed to reject website" });
  }
});

/**
 * PATCH /api/cities/admin/websites/:id/reassign
 * Reassign a pending city_website to the correct city
 */
router.patch("/admin/websites/:id/reassign", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.tier < 8) {
      return res.status(403).json({ error: "God-level access required" });
    }

    const websiteId = parseInt(req.params.id);
    const { city, country } = req.body;

    if (isNaN(websiteId)) {
      return res.status(400).json({ error: "Invalid website ID" });
    }

    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    await db
      .update(cityWebsites)
      .set({ 
        city,
        country: country || null,
        updatedAt: new Date()
      })
      .where(eq(cityWebsites.id, websiteId));

    console.log(`[AdminReassign] Reassigned website ${websiteId} to ${city}, ${country}`);
    res.json({ success: true, message: `Reassigned to ${city}` });
  } catch (error) {
    console.error("[AdminReassign] Error:", error);
    res.status(500).json({ error: "Failed to reassign website" });
  }
});

export default router;
