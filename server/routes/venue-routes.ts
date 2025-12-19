import { Router, Response } from "express";
import { db } from "@shared/db";
import { venues, events, users } from "@shared/schema";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// ============================================================================
// VENUE SEARCH API - 3-TIER INTELLIGENT SEARCH (MB.MD v9.6)
// Priority: 1) User's hosted events → 2) City group venues → 3) Google Maps
// ============================================================================

interface VenueSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  source: 'user_events' | 'city_venues' | 'database' | 'google_maps';
  verified?: boolean;
  rating?: number;
  placeId?: string;
  coordinates?: { lat: number; lng: number };
}

/**
 * Shared venue search logic for GET and POST handlers
 */
async function handleVenueSearch(q: string | undefined, userId: string | undefined, city: string | undefined, res: Response) {
  try {
    const searchQuery = (q || '').trim().toLowerCase();
    
    if (!searchQuery || searchQuery.length < 2) {
      return res.json({ userVenues: [], cityVenues: [], googleVenues: [] });
    }

    console.log(`[Venue Search] Query: "${searchQuery}", userId: ${userId}, city: ${city}`);

    const results: {
      userVenues: VenueSearchResult[];
      cityVenues: VenueSearchResult[];
      googleVenues: VenueSearchResult[];
    } = {
      userVenues: [],
      cityVenues: [],
      googleVenues: [],
    };

    // ────────────────────────────────────────────────────────────────────
    // TIER 1: User's previously hosted events (highest priority)
    // ────────────────────────────────────────────────────────────────────
    if (userId) {
      try {
        const userEvents = await db
          .select({
            venueName: events.venueName,
            venue: events.venue,
            address: events.address,
            city: events.city,
            country: events.country,
            latitude: events.latitude,
            longitude: events.longitude,
          })
          .from(events)
          .where(
            and(
              eq(events.userId, parseInt(userId)),
              or(
                ilike(events.venueName, `%${searchQuery}%`),
                ilike(events.venue, `%${searchQuery}%`)
              )
            )
          )
          .limit(5);

        // Deduplicate by venue name
        const seenVenues = new Set<string>();
        for (const event of userEvents) {
          const name = event.venueName || event.venue || '';
          if (name && !seenVenues.has(name.toLowerCase())) {
            seenVenues.add(name.toLowerCase());
            results.userVenues.push({
              id: `user_${name.replace(/\s+/g, '_')}`,
              name,
              address: event.address || '',
              city: event.city || '',
              country: event.country || '',
              source: 'user_events',
              coordinates: event.latitude && event.longitude 
                ? { lat: parseFloat(event.latitude), lng: parseFloat(event.longitude) }
                : undefined,
            });
          }
        }
        console.log(`[Venue Search] Tier 1 (User Events): ${results.userVenues.length} venues`);
      } catch (err) {
        console.error('[Venue Search] Tier 1 error:', err);
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // TIER 2: City group venues (from venues database)
    // ────────────────────────────────────────────────────────────────────
    try {
      const conditions = [
        or(
          ilike(venues.name, `%${searchQuery}%`),
          ilike(venues.description, `%${searchQuery}%`)
        )
      ];

      // If city specified, prioritize that city
      if (city && typeof city === 'string') {
        conditions.push(ilike(venues.city, `%${city}%`));
      }

      const cityVenuesResult = await db
        .select()
        .from(venues)
        .where(and(...conditions as any))
        .orderBy(desc(venues.verified), desc(venues.rating))
        .limit(10);

      for (const venue of cityVenuesResult) {
        results.cityVenues.push({
          id: `db_${venue.id}`,
          name: venue.name,
          address: venue.address,
          city: venue.city,
          country: venue.country,
          source: 'city_venues',
          verified: venue.verified || false,
          rating: venue.rating || 0,
        });
      }

      // If no city-filtered results, search all venues
      if (results.cityVenues.length === 0 && city) {
        const allVenuesResult = await db
          .select()
          .from(venues)
          .where(
            or(
              ilike(venues.name, `%${searchQuery}%`),
              ilike(venues.description, `%${searchQuery}%`)
            ) as any
          )
          .orderBy(desc(venues.verified), desc(venues.rating))
          .limit(10);

        for (const venue of allVenuesResult) {
          results.cityVenues.push({
            id: `db_${venue.id}`,
            name: venue.name,
            address: venue.address,
            city: venue.city,
            country: venue.country,
            source: 'database',
            verified: venue.verified || false,
            rating: venue.rating || 0,
          });
        }
      }

      // Also check sample venues if database is empty
      if (results.cityVenues.length === 0) {
        const matchingSamples = sampleVenues.filter(v => 
          v.name.toLowerCase().includes(searchQuery) ||
          v.description.toLowerCase().includes(searchQuery)
        );
        
        for (const venue of matchingSamples) {
          if (city && !venue.city.toLowerCase().includes(city.toLowerCase())) {
            continue; // Skip if city doesn't match
          }
          results.cityVenues.push({
            id: `sample_${venue.id}`,
            name: venue.name,
            address: venue.address,
            city: venue.city,
            country: venue.country,
            source: 'database',
            verified: true,
            rating: parseFloat(venue.rating),
          });
        }
      }

      console.log(`[Venue Search] Tier 2 (City Venues): ${results.cityVenues.length} venues`);
    } catch (err) {
      console.error('[Venue Search] Tier 2 error:', err);
    }

    // ────────────────────────────────────────────────────────────────────
    // TIER 3: Google Places API fallback (when Tiers 1+2 have <3 results)
    // ────────────────────────────────────────────────────────────────────
    const totalResults = results.userVenues.length + results.cityVenues.length;
    if (totalResults < 3) {
      try {
        const googleResults = await searchGooglePlaces(searchQuery, city);
        results.googleVenues = googleResults;
        console.log(`[Venue Search] Tier 3 (Google Maps): ${results.googleVenues.length} venues`);
      } catch (err) {
        console.error('[Venue Search] Tier 3 error:', err);
      }
    }

    res.json(results);
  } catch (error) {
    console.error("[Venue Search] Error:", error);
    res.status(500).json({ message: "Failed to search venues" });
  }
}

/**
 * GET /api/venues/search - 3-tier intelligent venue search
 * Query params:
 *   - q: search query (venue name)
 *   - userId: current user ID (for user's past venues)
 *   - city: user's city group (for city-filtered venues)
 */
router.get("/search", async (req, res: Response) => {
  const { q, userId, city } = req.query;
  return handleVenueSearch(q as string, userId as string, city as string, res);
});

/**
 * POST /api/venues/search - 3-tier intelligent venue search (for long queries)
 * Avoids URL length limits when venue names are long
 * Body params: { q, userId, city }
 */
router.post("/search", async (req, res: Response) => {
  const { q, userId, city } = req.body;
  console.log(`[Venue Search POST] Query: "${q}", userId: ${userId}, city: ${city}`);
  return handleVenueSearch(q, userId?.toString(), city, res);
});

// Legacy GET handler kept for backwards compatibility
router.get("/search-legacy", async (req, res: Response) => {
  try {
    const { q, userId, city } = req.query;
    const searchQuery = (q as string || '').trim().toLowerCase();
    
    if (!searchQuery || searchQuery.length < 2) {
      return res.json({ userVenues: [], cityVenues: [], googleVenues: [] });
    }

    console.log(`[Venue Search] Query: "${searchQuery}", userId: ${userId}, city: ${city}`);

    const results: {
      userVenues: VenueSearchResult[];
      cityVenues: VenueSearchResult[];
      googleVenues: VenueSearchResult[];
    } = {
      userVenues: [],
      cityVenues: [],
      googleVenues: [],
    };

    // ────────────────────────────────────────────────────────────────────
    // TIER 1: User's previously hosted events (highest priority)
    // ────────────────────────────────────────────────────────────────────
    if (userId) {
      try {
        const userEvents = await db
          .select({
            venueName: events.venueName,
            venue: events.venue,
            address: events.address,
            city: events.city,
            country: events.country,
            latitude: events.latitude,
            longitude: events.longitude,
          })
          .from(events)
          .where(
            and(
              eq(events.userId, parseInt(userId as string)),
              or(
                ilike(events.venueName, `%${searchQuery}%`),
                ilike(events.venue, `%${searchQuery}%`)
              )
            )
          )
          .limit(5);

        // Deduplicate by venue name
        const seenVenues = new Set<string>();
        for (const event of userEvents) {
          const name = event.venueName || event.venue || '';
          if (name && !seenVenues.has(name.toLowerCase())) {
            seenVenues.add(name.toLowerCase());
            results.userVenues.push({
              id: `user_${name.replace(/\s+/g, '_')}`,
              name,
              address: event.address || '',
              city: event.city || '',
              country: event.country || '',
              source: 'user_events',
              coordinates: event.latitude && event.longitude 
                ? { lat: parseFloat(event.latitude), lng: parseFloat(event.longitude) }
                : undefined,
            });
          }
        }
        console.log(`[Venue Search] Tier 1 (User Events): ${results.userVenues.length} venues`);
      } catch (err) {
        console.error('[Venue Search] Tier 1 error:', err);
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // TIER 2: City group venues (from venues database)
    // ────────────────────────────────────────────────────────────────────
    try {
      const conditions = [
        or(
          ilike(venues.name, `%${searchQuery}%`),
          ilike(venues.description, `%${searchQuery}%`)
        )
      ];

      // If city specified, prioritize that city
      if (city && typeof city === 'string') {
        conditions.push(ilike(venues.city, `%${city}%`));
      }

      const cityVenuesResult = await db
        .select()
        .from(venues)
        .where(and(...conditions as any))
        .orderBy(desc(venues.verified), desc(venues.rating))
        .limit(10);

      for (const venue of cityVenuesResult) {
        results.cityVenues.push({
          id: `db_${venue.id}`,
          name: venue.name,
          address: venue.address,
          city: venue.city,
          country: venue.country,
          source: 'city_venues',
          verified: venue.verified || false,
          rating: venue.rating || 0,
        });
      }

      // If no city-filtered results, search all venues
      if (results.cityVenues.length === 0 && city) {
        const allVenuesResult = await db
          .select()
          .from(venues)
          .where(
            or(
              ilike(venues.name, `%${searchQuery}%`),
              ilike(venues.description, `%${searchQuery}%`)
            ) as any
          )
          .orderBy(desc(venues.verified), desc(venues.rating))
          .limit(10);

        for (const venue of allVenuesResult) {
          results.cityVenues.push({
            id: `db_${venue.id}`,
            name: venue.name,
            address: venue.address,
            city: venue.city,
            country: venue.country,
            source: 'database',
            verified: venue.verified || false,
            rating: venue.rating || 0,
          });
        }
      }

      // Also check sample venues if database is empty
      if (results.cityVenues.length === 0) {
        const matchingSamples = sampleVenues.filter(v => 
          v.name.toLowerCase().includes(searchQuery) ||
          v.description.toLowerCase().includes(searchQuery)
        );
        
        for (const venue of matchingSamples) {
          if (city && !venue.city.toLowerCase().includes((city as string).toLowerCase())) {
            continue; // Skip if city doesn't match
          }
          results.cityVenues.push({
            id: `sample_${venue.id}`,
            name: venue.name,
            address: venue.address,
            city: venue.city,
            country: venue.country,
            source: 'database',
            verified: true,
            rating: parseFloat(venue.rating),
          });
        }
      }

      console.log(`[Venue Search] Tier 2 (City Venues): ${results.cityVenues.length} venues`);
    } catch (err) {
      console.error('[Venue Search] Tier 2 error:', err);
    }

    // ────────────────────────────────────────────────────────────────────
    // TIER 3: Google Places API fallback (when Tiers 1+2 have <3 results)
    // ────────────────────────────────────────────────────────────────────
    const totalResults = results.userVenues.length + results.cityVenues.length;
    if (totalResults < 3) {
      try {
        const googleResults = await searchGooglePlaces(searchQuery, city as string);
        results.googleVenues = googleResults;
        console.log(`[Venue Search] Tier 3 (Google Maps): ${results.googleVenues.length} venues`);
      } catch (err) {
        console.error('[Venue Search] Tier 3 error:', err);
      }
    }

    res.json(results);
  } catch (error) {
    console.error("[Venue Search] Error:", error);
    res.status(500).json({ message: "Failed to search venues" });
  }
});

/**
 * Search Google Places API for venues
 * Falls back gracefully if API key not configured
 */
async function searchGooglePlaces(query: string, city?: string): Promise<VenueSearchResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.log('[Venue Search] Google Places API key not configured - skipping Tier 3');
    return [];
  }

  try {
    const searchText = city ? `${query} ${city}` : query;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchText)}&type=establishment&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results) {
      console.log(`[Venue Search] Google Places returned: ${data.status}`);
      return [];
    }

    return data.results.slice(0, 5).map((place: any) => ({
      id: `google_${place.place_id}`,
      name: place.name,
      address: place.formatted_address || '',
      city: extractCityFromAddress(place.formatted_address),
      country: extractCountryFromAddress(place.formatted_address),
      source: 'google_maps' as const,
      placeId: place.place_id,
      rating: place.rating,
      coordinates: place.geometry?.location 
        ? { lat: place.geometry.location.lat, lng: place.geometry.location.lng }
        : undefined,
    }));
  } catch (err) {
    console.error('[Venue Search] Google Places API error:', err);
    return [];
  }
}

function extractCityFromAddress(address: string): string {
  if (!address) return '';
  const parts = address.split(',').map(p => p.trim());
  // City is usually second-to-last before country
  return parts.length >= 2 ? parts[parts.length - 2] : '';
}

function extractCountryFromAddress(address: string): string {
  if (!address) return '';
  const parts = address.split(',').map(p => p.trim());
  return parts[parts.length - 1] || '';
}

// Sample venue data for when database is empty
const sampleVenues = [
  {
    id: 1,
    name: "La Viruta Tango",
    address: "Armenia 1366, Palermo",
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "milonga",
    rating: "4.9",
    reviewCount: 328,
    phone: "+54 11 4774-6357",
    website: "https://lavirutatango.com",
    hours: "Tue-Sun 11pm-5am",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800",
    description: "Legendary Buenos Aires milonga with live orchestras and authentic atmosphere"
  },
  {
    id: 2,
    name: "Salon Canning",
    address: "Scalabrini Ortiz 1331",
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "milonga",
    rating: "4.8",
    reviewCount: 256,
    phone: "+54 11 4832-6753",
    hours: "Mon-Sun 10pm-4am",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800",
    description: "Classic milonga venue in the heart of Palermo"
  },
  {
    id: 3,
    name: "El Beso",
    address: "Riobamba 416",
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "milonga",
    rating: "4.7",
    reviewCount: 189,
    hours: "Wed-Sun 11pm-4am",
    image: "https://images.unsplash.com/photo-1485872299829-c673f50dea4d?w=800",
    description: "Intimate traditional milonga with classic tango atmosphere"
  },
  {
    id: 4,
    name: "Tango Malevaje",
    address: "123 Tango Street",
    city: "New York",
    country: "USA",
    venueType: "studio",
    rating: "4.6",
    reviewCount: 142,
    website: "https://tangomalevaje.com",
    hours: "Daily classes and practica",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    description: "Premier tango studio in Manhattan with world-class instruction"
  },
  {
    id: 5,
    name: "Milonga del Indio",
    address: "Güemes 4671",
    city: "Buenos Aires",
    country: "Argentina",
    venueType: "milonga",
    rating: "4.8",
    reviewCount: 203,
    hours: "Fri-Sat 11pm-5am",
    image: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800",
    description: "Traditional milonga with great floor and authentic atmosphere"
  }
];

// GET /api/venues - List venues with search/filter
router.get("/", async (req, res: Response) => {
  try {
    const { search, city, country } = req.query;

    let query = db.select()
      .from(venues)
      .orderBy(desc(venues.rating))
      .$dynamic();

    const conditions = [];
    
    if (search && typeof search === "string") {
      conditions.push(
        or(
          ilike(venues.name, `%${search}%`),
          ilike(venues.description, `%${search}%`)
        ) as any
      );
    }

    if (city && typeof city === "string") {
      conditions.push(eq(venues.city, city));
    }

    if (country && typeof country === "string") {
      conditions.push(eq(venues.country, country));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;

    // Return sample data if database is empty
    if (result.length === 0) {
      let filteredSamples = sampleVenues;
      if (city && typeof city === "string") {
        filteredSamples = filteredSamples.filter(v => v.city.toLowerCase().includes(city.toLowerCase()));
      }
      if (country && typeof country === "string") {
        filteredSamples = filteredSamples.filter(v => v.country.toLowerCase().includes(country.toLowerCase()));
      }
      if (search && typeof search === "string") {
        filteredSamples = filteredSamples.filter(v => 
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      return res.json(filteredSamples);
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching venues:", error);
    res.status(500).json({ message: "Failed to fetch venues" });
  }
});

// GET /api/venues/:id - Get venue detail
router.get("/:id", async (req, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.select()
      .from(venues)
      .where(eq(venues.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Venue not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching venue:", error);
    res.status(500).json({ message: "Failed to fetch venue" });
  }
});

// POST /api/venues - Create venue (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, address, city, country, phone, email, hours, image } = req.body;

    if (!name || !address || !city || !country) {
      return res.status(400).json({ message: "Name, address, city, and country are required" });
    }

    const result = await db.insert(venues).values({
      name,
      description: description || null,
      address,
      city,
      country,
      phone: phone || null,
      email: email || null,
      hours: hours || null,
      image: image || null,
      rating: 0,
      reviewCount: 0,
      verified: false,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating venue:", error);
    res.status(500).json({ message: "Failed to create venue" });
  }
});

// PATCH /api/venues/:id - Update venue (auth required)
router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, address, city, country, phone, email, hours, image } = req.body;

    // Check existence
    const existing = await db.select().from(venues).where(eq(venues.id, parseInt(id))).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (hours !== undefined) updateData.hours = hours;
    if (image !== undefined) updateData.image = image;

    const result = await db.update(venues)
      .set(updateData)
      .where(eq(venues.id, parseInt(id)))
      .returning();

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating venue:", error);
    res.status(500).json({ message: "Failed to update venue" });
  }
});

// DELETE /api/venues/:id - Delete venue (auth required)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check existence
    const existing = await db.select().from(venues).where(eq(venues.id, parseInt(id))).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Venue not found" });
    }

    await db.delete(venues).where(eq(venues.id, parseInt(id)));

    res.json({ message: "Venue deleted successfully" });
  } catch (error) {
    console.error("Error deleting venue:", error);
    res.status(500).json({ message: "Failed to delete venue" });
  }
});

// GET /api/venues/recommendations/by-city/:city - Get recommendations by city name
router.get("/recommendations/by-city/:city", async (req, res: Response) => {
  try {
    const { city } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await db.select()
      .from(venues)
      .where(and(
        sql`LOWER(${venues.city}) = LOWER(${city})`,
        or(
          eq(venues.verified, true),
          sql`${venues.rating} >= 4`
        ) as any
      ))
      .orderBy(desc(venues.rating), desc(venues.reviewCount))
      .limit(limit);

    // Transform to recommendation format - use actual data or null for missing values
    const recommendations = result.map(v => ({
      id: v.id,
      placeName: v.name,
      category: 'venue',
      latitude: null,
      longitude: null,
      address: v.address,
      priceRange: null,
      recommendationCount: v.reviewCount || 0,
      description: v.description,
    }));

    res.json(recommendations);
  } catch (error) {
    console.error("Error fetching city recommendations:", error);
    res.status(500).json({ message: "Failed to fetch city recommendations" });
  }
});

// GET /api/venues/recommendations - Get venue recommendations based on location and rating
router.get("/recommendations", async (req, res: Response) => {
  try {
    const { city, country, minRating = "0" } = req.query;

    let query = db.select()
      .from(venues)
      .orderBy(desc(venues.rating), desc(venues.reviewCount))
      .limit(20)
      .$dynamic();

    const conditions = [];
    
    if (city && typeof city === "string") {
      conditions.push(eq(venues.city, city));
    }

    if (country && typeof country === "string") {
      conditions.push(eq(venues.country, country));
    }

    const rating = parseInt(minRating as string);
    if (rating > 0) {
      conditions.push(sql`${venues.rating} >= ${rating}`);
    }

    // Only show verified or highly rated venues in recommendations
    conditions.push(
      or(
        eq(venues.verified, true),
        sql`${venues.rating} >= 4`
      ) as any
    );

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;

    res.json(result);
  } catch (error) {
    console.error("Error fetching venue recommendations:", error);
    res.status(500).json({ message: "Failed to fetch venue recommendations" });
  }
});

export default router;
