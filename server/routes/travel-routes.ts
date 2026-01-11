import { Router, Response } from "express";
import { db } from "@shared/db";
import { travelPlans, travelPlanItems, users, events, housingListings, tripJoinRequests, notifications } from "@shared/schema";
import { eq, desc, and, gte, lte, or, ilike, isNotNull } from "drizzle-orm";
import { authenticateToken, optionalAuth, AuthRequest } from "../middleware/auth";
import * as cheerio from "cheerio";
import axios from "axios";

// TypeScript types for scraping responses
interface ScrapedAccommodation {
  title: string;
  price: string | null;
  pricePerNight: number | null;
  currency: string;
  address: string | null;
  city: string | null;
  country: string | null;
  images: string[];
  amenities: string[];
  description: string | null;
  rating: number | null;
  reviewCount: number | null;
  hostName: string | null;
  propertyType: string | null;
  maxGuests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  url: string;
  scrapedAt: string;
}

interface ScrapedTransport {
  type: 'flight' | 'train' | 'bus' | 'ferry' | 'unknown';
  provider: string | null;
  departure: {
    location: string | null;
    time: string | null;
    date: string | null;
  };
  arrival: {
    location: string | null;
    time: string | null;
    date: string | null;
  };
  duration: string | null;
  price: string | null;
  priceValue: number | null;
  currency: string;
  bookingUrl: string | null;
  stops: number | null;
  class: string | null;
  url: string;
  scrapedAt: string;
}

interface MTHost {
  id: number;
  name: string;
  username: string;
  profileImage: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  tangoRoles: string[] | null;
  languages: string[] | null;
  listings: {
    id: number;
    title: string;
    propertyType: string;
    pricePerNight: number;
    currency: string | null;
    bedrooms: number | null;
    maxGuests: number | null;
    images: string[] | null;
    amenities: string[] | null;
    rating: number | null;
  }[];
}

const router = Router();

// GET /api/travel/packages - Get upcoming tango events as travel packages
router.get("/packages", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    
    // Fetch upcoming events as travel packages
    const upcomingEvents = await db.select({
      id: events.id,
      title: events.title,
      location: events.city,
      startDate: events.startDate,
      endDate: events.endDate,
      description: events.description,
      eventType: events.eventType,
      venueName: events.venueName,
    })
    .from(events)
    .where(gte(events.startDate, now))
    .orderBy(events.startDate)
    .limit(20);

    // Transform to travel package format
    const packages = upcomingEvents.map(event => ({
      id: event.id,
      title: event.title,
      location: event.location || event.venueName || 'TBA',
      startDate: event.startDate?.toISOString().split('T')[0],
      endDate: event.endDate?.toISOString().split('T')[0] || event.startDate?.toISOString().split('T')[0],
      description: event.description,
      category: event.eventType || 'tango',
      price: 'Varies',
    }));

    res.json(packages);
  } catch (error) {
    console.error("Error fetching travel packages:", error);
    res.status(500).json({ message: "Failed to fetch travel packages" });
  }
});

// GET /api/travel/destinations - Get popular tango destinations
router.get("/destinations", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Return popular tango destinations
    const destinations = [
      { id: 1, name: "Buenos Aires", description: "The birthplace of tango", image: "https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=800", popularity: 100 },
      { id: 2, name: "Berlin", description: "Europe's tango capital", image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800", popularity: 85 },
      { id: 3, name: "Istanbul", description: "A growing tango scene", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800", popularity: 75 },
      { id: 4, name: "Paris", description: "Romantic milongas await", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800", popularity: 80 },
      { id: 5, name: "New York", description: "Vibrant American tango", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800", popularity: 70 },
    ];
    
    res.json(destinations);
  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).json({ message: "Failed to fetch destinations" });
  }
});

// GET /api/travel/trips - Get user's travel trips
router.get("/trips", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const trips = await db.select()
      .from(travelPlans)
      .where(eq(travelPlans.userId, userId))
      .orderBy(desc(travelPlans.startDate));

    res.json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Failed to fetch trips" });
  }
});

// GET /api/travel/plans - Get user's travel plans (public with userId query param)
router.get("/plans", async (req: AuthRequest, res: Response) => {
  try {
    // Support both authenticated and public access
    const userIdParam = req.query.userId ? parseInt(req.query.userId as string) : null;
    const userId = userIdParam || req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "userId query parameter required for public access" });
    }

    const plans = await db.select()
      .from(travelPlans)
      .where(eq(travelPlans.userId, userId))
      .orderBy(desc(travelPlans.startDate));

    // Fetch items for each plan
    const plansWithItems = await Promise.all(
      plans.map(async (plan) => {
        const items = await db.select()
          .from(travelPlanItems)
          .where(eq(travelPlanItems.travelPlanId, plan.id));
        return {
          ...plan,
          items,
        };
      })
    );

    res.json(plansWithItems);
  } catch (error) {
    console.error("Error fetching travel plans:", error);
    res.status(500).json({ message: "Failed to fetch travel plans" });
  }
});

// GET /api/travel/upcoming-visitors - Get people visiting a specific city
router.get("/upcoming-visitors", async (req: AuthRequest, res: Response) => {
  try {
    const { city } = req.query;
    
    if (!city || typeof city !== 'string') {
      return res.json([]);
    }

    const now = new Date();
    
    // Find all travel plans to this city with future start dates
    const visitors = await db.select({
      id: travelPlans.id,
      userId: travelPlans.userId,
      name: users.name,
      username: users.username,
      profileImage: users.profileImage,
      city: travelPlans.city,
      country: travelPlans.country,
      startDate: travelPlans.startDate,
      endDate: travelPlans.endDate,
      visibility: travelPlans.visibility,
    })
    .from(travelPlans)
    .innerJoin(users, eq(travelPlans.userId, users.id))
    .where(and(
      ilike(travelPlans.city, `%${city}%`),
      gte(travelPlans.startDate, now),
      or(
        eq(travelPlans.visibility, 'public'),
        eq(travelPlans.visibility, 'friends')
      )
    ))
    .orderBy(travelPlans.startDate)
    .limit(20);

    // Transform to visitor format
    const visitorList = visitors.map(v => ({
      id: v.id,
      userId: v.userId,
      name: v.name || v.username || 'Traveler',
      profileImage: v.profileImage,
      arrivalDate: v.startDate,
      departureDate: v.endDate,
      city: v.city,
      country: v.country,
    }));

    res.json(visitorList);
  } catch (error) {
    console.error("Error fetching upcoming visitors:", error);
    res.status(500).json({ message: "Failed to fetch visitors" });
  }
});

// GET /api/travel/plans/:id - Get single travel plan (auth required)
router.get("/plans/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const planResult = await db.select()
      .from(travelPlans)
      .where(and(
        eq(travelPlans.id, parseInt(id)),
        eq(travelPlans.userId, userId)
      ))
      .limit(1);

    if (planResult.length === 0) {
      return res.status(404).json({ message: "Travel plan not found" });
    }

    // Get plan items/destinations
    const itemsResult = await db.select()
      .from(travelPlanItems)
      .where(eq(travelPlanItems.travelPlanId, parseInt(id)))
      .orderBy(travelPlanItems.date);

    res.json({
      ...planResult[0],
      items: itemsResult,
    });
  } catch (error) {
    console.error("Error fetching travel plan:", error);
    res.status(500).json({ message: "Failed to fetch travel plan" });
  }
});

// POST /api/travel/plans - Create travel plan (auth required)
router.post("/plans", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { city, country, startDate, endDate, tripDuration, budget, interests, travelStyle, status, notes, cities } = req.body;

    if (!city || !startDate || !endDate) {
      return res.status(400).json({ message: "City, start date, and end date are required" });
    }

    // Convert ISO string dates to Date objects for Drizzle ORM timestamp columns
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    const result = await db.insert(travelPlans).values({
      userId,
      city,
      country: country || null,
      cities: cities && cities.length > 0 ? JSON.stringify(cities) : JSON.stringify([]),
      startDate: startDateObj,
      endDate: endDateObj,
      tripDuration: tripDuration || Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)),
      budget: budget || null,
      interests: interests || [],
      travelStyle: travelStyle || null,
      status: status || 'planning',
      notes: notes || null,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating travel plan:", error);
    res.status(500).json({ message: "Failed to create travel plan" });
  }
});

// POST /api/travel/plans/:id/items - Add item/activity to travel plan (auth required)
router.post("/plans/:id/items", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { 
      type,
      title, 
      description, 
      date, 
      location, 
      cost,
      bookingUrl,
      isBooked 
    } = req.body;

    // Verify ownership
    const plan = await db.select()
      .from(travelPlans)
      .where(and(
        eq(travelPlans.id, parseInt(id)),
        eq(travelPlans.userId, userId)
      ))
      .limit(1);

    if (plan.length === 0) {
      return res.status(404).json({ message: "Travel plan not found or not authorized" });
    }

    if (!type || !title) {
      return res.status(400).json({ message: "Type and title are required" });
    }

    const result = await db.insert(travelPlanItems).values({
      travelPlanId: parseInt(id),
      type,
      title,
      description: description || null,
      date: date || null,
      location: location || null,
      cost: cost || null,
      bookingUrl: bookingUrl || null,
      isBooked: isBooked || false,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error adding destination:", error);
    res.status(500).json({ message: "Failed to add destination" });
  }
});

// PATCH /api/travel/plans/:id - Update travel plan (auth required)
router.patch("/plans/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    console.log("[Travel PATCH] Request body:", req.body);
    const { name, description, startDate, endDate, budget, currency, visibility, status, notes } = req.body;

    // Verify ownership
    const existing = await db.select()
      .from(travelPlans)
      .where(and(
        eq(travelPlans.id, parseInt(id)),
        eq(travelPlans.userId, userId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Travel plan not found or not authorized" });
    }

    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (budget !== undefined) updateData.budget = budget;
    if (currency !== undefined) updateData.currency = currency;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    console.log("[Travel PATCH] Update data:", updateData);
    const result = await db.update(travelPlans)
      .set(updateData)
      .where(eq(travelPlans.id, parseInt(id)))
      .returning();

    console.log("[Travel PATCH] Result:", result[0]);
    res.json(result[0]);
  } catch (error) {
    console.error("Error updating travel plan:", error);
    res.status(500).json({ message: "Failed to update travel plan" });
  }
});

// DELETE /api/travel/plans/:id - Delete travel plan (auth required)
router.delete("/plans/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify ownership
    const existing = await db.select()
      .from(travelPlans)
      .where(and(
        eq(travelPlans.id, parseInt(id)),
        eq(travelPlans.userId, userId)
      ))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Travel plan not found or not authorized" });
    }

    await db.delete(travelPlans).where(eq(travelPlans.id, parseInt(id)));

    res.json({ message: "Travel plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting travel plan:", error);
    res.status(500).json({ message: "Failed to delete travel plan" });
  }
});

// DELETE /api/travel/plans/:planId/destinations/:itemId - Delete destination (auth required)
router.delete("/plans/:planId/destinations/:itemId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { planId, itemId } = req.params;

    // Verify ownership
    const plan = await db.select()
      .from(travelPlans)
      .where(and(
        eq(travelPlans.id, parseInt(planId)),
        eq(travelPlans.userId, userId)
      ))
      .limit(1);

    if (plan.length === 0) {
      return res.status(404).json({ message: "Travel plan not found or not authorized" });
    }

    await db.delete(travelPlanItems)
      .where(and(
        eq(travelPlanItems.id, parseInt(itemId)),
        eq(travelPlanItems.travelPlanId, parseInt(planId))
      ));

    res.json({ message: "Destination deleted successfully" });
  } catch (error) {
    console.error("Error deleting destination:", error);
    res.status(500).json({ message: "Failed to delete destination" });
  }
});

// PATCH /api/travel/plans/:planId/items/:itemId - Update item (auth required)
router.patch("/plans/:planId/items/:itemId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { planId, itemId } = req.params;
    console.log("[Travel PATCH] Request body:", req.body);
    const { type, title, description, date, location, cost, bookingUrl, isBooked, transportType, departureTime, arrivalTime, departureLocation, arrivalLocation } = req.body;

    // Verify ownership
    const plan = await db.select()
      .from(travelPlans)
      .where(and(
        eq(travelPlans.id, parseInt(planId)),
        eq(travelPlans.userId, userId)
      ))
      .limit(1);

    if (plan.length === 0) {
      return res.status(404).json({ message: "Travel plan not found or not authorized" });
    }

    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;
    if (location !== undefined) updateData.location = location;
    if (cost !== undefined) updateData.cost = typeof cost === 'string' ? parseFloat(cost) : cost;
    if (bookingUrl !== undefined) updateData.bookingUrl = bookingUrl;
    if (isBooked !== undefined) updateData.isBooked = isBooked;
    if (transportType !== undefined) updateData.transportType = transportType;
    if (departureTime !== undefined) updateData.departureTime = departureTime;
    if (arrivalTime !== undefined) updateData.arrivalTime = arrivalTime;
    if (departureLocation !== undefined) updateData.departureLocation = departureLocation;
    if (arrivalLocation !== undefined) updateData.arrivalLocation = arrivalLocation;

    console.log("[Travel PATCH] Update data:", updateData);
    const result = await db.update(travelPlanItems)
      .set(updateData)
      .where(and(
        eq(travelPlanItems.id, parseInt(itemId)),
        eq(travelPlanItems.travelPlanId, parseInt(planId))
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("[Travel PATCH] Error updating item:", error);
    res.status(500).json({ message: "Failed to update item", error: String(error) });
  }
});

// DELETE /api/travel/plans/:planId/items/:itemId - Delete item (auth required)
router.delete("/plans/:planId/items/:itemId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { planId, itemId } = req.params;

    // Verify ownership
    const plan = await db.select()
      .from(travelPlans)
      .where(and(
        eq(travelPlans.id, parseInt(planId)),
        eq(travelPlans.userId, userId)
      ))
      .limit(1);

    if (plan.length === 0) {
      return res.status(404).json({ message: "Travel plan not found or not authorized" });
    }

    await db.delete(travelPlanItems)
      .where(and(
        eq(travelPlanItems.id, parseInt(itemId)),
        eq(travelPlanItems.travelPlanId, parseInt(planId))
      ));

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

// GET /api/travel/events-by-city - Get events in a city within date range
router.get(["/events-by-city", "/api/events/by-city"], optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { city, startDate, endDate, categories } = req.query;

    if (!city) {
      return res.status(400).json({ message: "City parameter is required" });
    }

    const cityName = city as string;
    const start = startDate ? new Date(startDate as string) : new Date();
    const end = endDate ? new Date(endDate as string) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Build query for events matching city and date range
    let query = db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      eventType: events.eventType,
      category: events.category,
      startDate: events.startDate,
      endDate: events.endDate,
      location: events.location,
      venue: events.venue,
      venueName: events.venueName,
      city: events.city,
      country: events.country,
      isPaid: events.isPaid,
      isFree: events.isFree,
      price: events.price,
      currency: events.currency,
      imageUrl: events.imageUrl,
      ticketUrl: events.ticketUrl,
    })
    .from(events)
    .where(and(
      ilike(events.city, `%${cityName}%`),
      gte(events.startDate, start),
      lte(events.startDate, end)
    ))
    .orderBy(events.startDate)
    .limit(50);

    const cityEvents = await query;

    // Parse price to extract numeric value for budget calculations
    const eventsWithParsedPrice = cityEvents.map(event => {
      let numericPrice = 0;
      if (event.price) {
        // Extract numeric value from price string (e.g., "$20", "20 USD", "20")
        const priceMatch = event.price.match(/[\d.]+/);
        if (priceMatch) {
          numericPrice = parseFloat(priceMatch[0]);
        }
      }
      return {
        ...event,
        numericPrice,
      };
    });

    res.json(eventsWithParsedPrice);
  } catch (error) {
    console.error("Error fetching events by city:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// GET /api/travel/housing-by-city - Get MT Host housing listings in a city during travel dates
router.get("/housing-by-city", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { city, startDate, endDate, maxGuests } = req.query;

    if (!city) {
      return res.status(400).json({ message: "City parameter is required" });
    }

    const cityName = city as string;
    const guests = maxGuests ? parseInt(maxGuests as string) : 1;

    // Query active housing listings in the city
    const listings = await db.select({
      id: housingListings.id,
      hostId: housingListings.hostId,
      title: housingListings.title,
      description: housingListings.description,
      propertyType: housingListings.propertyType,
      bedrooms: housingListings.bedrooms,
      bathrooms: housingListings.bathrooms,
      maxGuests: housingListings.maxGuests,
      pricePerNight: housingListings.pricePerNight,
      currency: housingListings.currency,
      address: housingListings.address,
      city: housingListings.city,
      country: housingListings.country,
      amenities: housingListings.amenities,
      images: housingListings.images,
      coverPhotoUrl: housingListings.coverPhotoUrl,
      hostName: users.name,
      hostProfileImage: users.profileImage,
    })
    .from(housingListings)
    .leftJoin(users, eq(housingListings.hostId, users.id))
    .where(and(
      ilike(housingListings.city, `%${cityName}%`),
      eq(housingListings.status, "active"),
      gte(housingListings.maxGuests, guests)
    ))
    .orderBy(housingListings.pricePerNight)
    .limit(20);

    // Calculate total cost for trip duration if dates provided
    const listingsWithTotalCost = listings.map(listing => {
      let nights = 1;
      let totalCost = listing.pricePerNight;
      
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (nights < 1) nights = 1;
        totalCost = listing.pricePerNight * nights;
      }
      
      return {
        ...listing,
        nights,
        totalCost,
        isMTHost: true, // Flag to identify as Mundo Tango host
      };
    });

    res.json(listingsWithTotalCost);
  } catch (error) {
    console.error("Error fetching housing by city:", error);
    res.status(500).json({ message: "Failed to fetch housing listings" });
  }
});

// POST /api/travel/scrape-accommodation - Scrape accommodation details from URL
router.post("/scrape-accommodation", async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    // Fetch the page HTML
    let html: string;
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 15000,
      });
      html = response.data;
    } catch (fetchError: any) {
      console.error("Error fetching accommodation URL:", fetchError.message);
      return res.status(422).json({ 
        message: "Failed to fetch the URL. The site may be blocking requests or the URL is inaccessible.",
        error: fetchError.message
      });
    }

    const $ = cheerio.load(html);
    
    // Generic accommodation scraping patterns for various booking sites
    const accommodation: ScrapedAccommodation = {
      title: extractText($, [
        'h1[data-testid="listing-title"]',
        'h1._fecoyn4',
        'h1[data-section-id="TITLE"]',
        'h1.listing-title',
        'h1[itemprop="name"]',
        'meta[property="og:title"]',
        'h1',
      ], 'attr:content'),
      price: extractText($, [
        'span[data-testid="price-per-night"]',
        'span._tyxjp1',
        '.price-amount',
        '[data-testid="price"]',
        '.listing-price',
        'span[itemprop="price"]',
      ]),
      pricePerNight: null,
      currency: 'USD',
      address: extractText($, [
        '[data-testid="location-text"]',
        'address',
        '.location-text',
        '[itemprop="address"]',
        'meta[property="og:locality"]',
      ], 'attr:content'),
      city: null,
      country: null,
      images: extractImages($, [
        'img[data-testid="photo-viewer-image"]',
        'img._6tbg2q',
        '.listing-image img',
        '[data-testid="listing-image"] img',
        'meta[property="og:image"]',
      ]),
      amenities: extractListItems($, [
        '[data-testid="amenity-row"]',
        '.amenities-list li',
        '[data-section-id="AMENITIES"] li',
        '.amenity-item',
      ]),
      description: extractText($, [
        '[data-section-id="DESCRIPTION"]',
        '.listing-description',
        '[itemprop="description"]',
        'meta[property="og:description"]',
      ], 'attr:content'),
      rating: extractNumber($, [
        '[data-testid="rating-value"]',
        '.rating-value',
        '[itemprop="ratingValue"]',
        'span._17p6nbba',
      ]),
      reviewCount: extractNumber($, [
        '[data-testid="review-count"]',
        '.review-count',
        '[itemprop="reviewCount"]',
      ]),
      hostName: extractText($, [
        '[data-testid="host-name"]',
        '.host-name',
        '.hosted-by-name',
      ]),
      propertyType: extractText($, [
        '[data-testid="property-type"]',
        '.property-type',
        '.listing-type',
      ]),
      maxGuests: extractNumber($, [
        '[data-testid="guest-capacity"]',
        '.max-guests',
        '.guest-count',
      ]),
      bedrooms: extractNumber($, [
        '[data-testid="bedroom-count"]',
        '.bedroom-count',
        '.bedrooms',
      ]),
      bathrooms: extractNumber($, [
        '[data-testid="bathroom-count"]',
        '.bathroom-count',
        '.bathrooms',
      ]),
      url,
      scrapedAt: new Date().toISOString(),
    };

    // Extract price value
    if (accommodation.price) {
      const priceMatch = accommodation.price.match(/[\d,]+\.?\d*/);
      if (priceMatch) {
        accommodation.pricePerNight = parseFloat(priceMatch[0].replace(/,/g, ''));
      }
      // Detect currency
      if (accommodation.price.includes('€')) accommodation.currency = 'EUR';
      else if (accommodation.price.includes('£')) accommodation.currency = 'GBP';
      else if (accommodation.price.includes('¥')) accommodation.currency = 'JPY';
      else if (accommodation.price.includes('$')) accommodation.currency = 'USD';
    }

    // Parse location into city/country if address available
    if (accommodation.address) {
      const locationParts = accommodation.address.split(',').map(s => s.trim());
      if (locationParts.length >= 2) {
        accommodation.city = locationParts[locationParts.length - 2] || null;
        accommodation.country = locationParts[locationParts.length - 1] || null;
      }
    }

    console.log('[DEBUG] Accommodation scraping results:', {
      url,
      htmlLength: html.length,
      title: accommodation.title,
      price: accommodation.price,
      pricePerNight: accommodation.pricePerNight,
      currency: accommodation.currency,
      address: accommodation.address,
      city: accommodation.city,
      country: accommodation.country,
      imagesCount: accommodation.images.length,
      amenitiesCount: accommodation.amenities.length,
    });

    res.json({
      success: true,
      data: accommodation,
    });
  } catch (error) {
    console.error("Error scraping accommodation:", error);
    res.status(500).json({ message: "Failed to scrape accommodation data" });
  }
});

// GET /api/travel/mt-hosts - Get Mundo Tango hosts in a city
router.get("/mt-hosts", async (req: AuthRequest, res: Response) => {
  try {
    const { city, country, roles, limit = 20, offset = 0 } = req.query;

    if (!city) {
      return res.status(400).json({ message: "City parameter is required" });
    }

    const cityName = city as string;
    const countryName = country as string | undefined;
    const roleFilter = roles ? (roles as string).split(',') : null;
    const limitNum = Math.min(parseInt(limit as string) || 20, 50);
    const offsetNum = parseInt(offset as string) || 0;

    // First, get users who have housing listings in the specified city
    const hostListings = await db.select({
      hostId: housingListings.hostId,
      listingId: housingListings.id,
      title: housingListings.title,
      propertyType: housingListings.propertyType,
      pricePerNight: housingListings.pricePerNight,
      currency: housingListings.currency,
      bedrooms: housingListings.bedrooms,
      maxGuests: housingListings.maxGuests,
      images: housingListings.images,
      amenities: housingListings.amenities,
      listingCity: housingListings.city,
      listingCountry: housingListings.country,
    })
    .from(housingListings)
    .where(and(
      ilike(housingListings.city, `%${cityName}%`),
      eq(housingListings.isActive, true),
      countryName ? ilike(housingListings.country, `%${countryName}%`) : undefined,
    ));

    // Get unique host IDs
    const hostIds = [...new Set(hostListings.map(l => l.hostId))];

    if (hostIds.length === 0) {
      return res.json({
        hosts: [],
        total: 0,
        city: cityName,
        country: countryName || null,
      });
    }

    // Fetch host user profiles
    let hostsQuery = db.select({
      id: users.id,
      name: users.name,
      username: users.username,
      profileImage: users.profileImage,
      city: users.city,
      country: users.country,
      bio: users.bio,
      tangoRoles: users.tangoRoles,
      languages: users.languages,
    })
    .from(users)
    .where(and(
      eq(users.isActive, true),
      ...hostIds.length > 0 ? [or(...hostIds.map(id => eq(users.id, id)))] : [],
    ))
    .limit(limitNum)
    .offset(offsetNum);

    const hostUsers = await hostsQuery;

    // Build response with listings attached to each host
    const hosts: MTHost[] = hostUsers
      .filter(host => {
        // Filter by roles if specified
        if (roleFilter && roleFilter.length > 0) {
          if (!host.tangoRoles) return false;
          return roleFilter.some(role => host.tangoRoles?.includes(role));
        }
        return true;
      })
      .map(host => ({
        id: host.id,
        name: host.name,
        username: host.username,
        profileImage: host.profileImage,
        city: host.city,
        country: host.country,
        bio: host.bio,
        tangoRoles: host.tangoRoles,
        languages: host.languages,
        listings: hostListings
          .filter(l => l.hostId === host.id)
          .map(l => ({
            id: l.listingId,
            title: l.title,
            propertyType: l.propertyType,
            pricePerNight: l.pricePerNight,
            currency: l.currency,
            bedrooms: l.bedrooms,
            maxGuests: l.maxGuests,
            images: l.images,
            amenities: l.amenities,
            rating: null,
          })),
      }));

    res.json({
      hosts,
      total: hosts.length,
      city: cityName,
      country: countryName || null,
    });
  } catch (error) {
    console.error("Error fetching MT hosts:", error);
    res.status(500).json({ message: "Failed to fetch hosts" });
  }
});

// POST /api/travel/scrape-transport - Scrape transport details from booking sites
router.post("/scrape-transport", async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    // Detect transport type from URL
    const hostname = parsedUrl.hostname.toLowerCase();
    let transportType: ScrapedTransport['type'] = 'unknown';
    
    if (hostname.includes('flight') || hostname.includes('airline') || 
        hostname.includes('skyscanner') || hostname.includes('kayak') ||
        hostname.includes('expedia') || hostname.includes('google.com/flights')) {
      transportType = 'flight';
    } else if (hostname.includes('train') || hostname.includes('rail') || 
               hostname.includes('amtrak') || hostname.includes('eurostar') ||
               hostname.includes('trainline') || hostname.includes('renfe')) {
      transportType = 'train';
    } else if (hostname.includes('bus') || hostname.includes('greyhound') || 
               hostname.includes('flixbus') || hostname.includes('megabus')) {
      transportType = 'bus';
    } else if (hostname.includes('ferry') || hostname.includes('cruise')) {
      transportType = 'ferry';
    }

    // Fetch the page HTML
    let html: string;
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 15000,
      });
      html = response.data;
    } catch (fetchError: any) {
      console.error("Error fetching transport URL:", fetchError.message);
      return res.status(422).json({ 
        message: "Failed to fetch the URL. The site may be blocking requests or the URL is inaccessible.",
        error: fetchError.message
      });
    }

    const $ = cheerio.load(html);
    
    // Generic transport scraping patterns
    const transport: ScrapedTransport = {
      type: transportType,
      provider: extractText($, [
        '[data-testid="airline-name"]',
        '.carrier-name',
        '.provider-name',
        '.airline-name',
        '.operator-name',
        'meta[property="og:site_name"]',
      ], 'attr:content'),
      departure: {
        location: extractText($, [
          '[data-testid="departure-city"]',
          '.departure-city',
          '.origin-name',
          '.from-location',
          '[itemprop="departureStation"]',
        ]),
        time: extractText($, [
          '[data-testid="departure-time"]',
          '.departure-time',
          '.depart-time',
          '[itemprop="departureTime"]',
        ]),
        date: extractText($, [
          '[data-testid="departure-date"]',
          '.departure-date',
          '.depart-date',
        ]),
      },
      arrival: {
        location: extractText($, [
          '[data-testid="arrival-city"]',
          '.arrival-city',
          '.destination-name',
          '.to-location',
          '[itemprop="arrivalStation"]',
        ]),
        time: extractText($, [
          '[data-testid="arrival-time"]',
          '.arrival-time',
          '.arrive-time',
          '[itemprop="arrivalTime"]',
        ]),
        date: extractText($, [
          '[data-testid="arrival-date"]',
          '.arrival-date',
          '.arrive-date',
        ]),
      },
      duration: extractText($, [
        '[data-testid="duration"]',
        '.trip-duration',
        '.flight-duration',
        '.journey-time',
      ]),
      price: extractText($, [
        '[data-testid="price"]',
        '.price-amount',
        '.total-price',
        '.fare-price',
        '[itemprop="price"]',
      ]),
      priceValue: null,
      currency: 'USD',
      bookingUrl: url,
      stops: extractNumber($, [
        '[data-testid="stops"]',
        '.stops-count',
        '.num-stops',
      ]),
      class: extractText($, [
        '[data-testid="cabin-class"]',
        '.cabin-class',
        '.travel-class',
        '.service-class',
      ]),
      url,
      scrapedAt: new Date().toISOString(),
    };

    // Extract price value
    if (transport.price) {
      const priceMatch = transport.price.match(/[\d,]+\.?\d*/);
      if (priceMatch) {
        transport.priceValue = parseFloat(priceMatch[0].replace(/,/g, ''));
      }
      // Detect currency
      if (transport.price.includes('€')) transport.currency = 'EUR';
      else if (transport.price.includes('£')) transport.currency = 'GBP';
      else if (transport.price.includes('¥')) transport.currency = 'JPY';
      else if (transport.price.includes('$')) transport.currency = 'USD';
    }

    console.log('[DEBUG] Transport scraping results:', {
      url,
      htmlLength: html.length,
      type: transport.type,
      provider: transport.provider,
      price: transport.price,
      priceValue: transport.priceValue,
      currency: transport.currency,
      departure: transport.departure,
      arrival: transport.arrival,
      duration: transport.duration,
    });

    res.json({
      success: true,
      data: transport,
    });
  } catch (error) {
    console.error("Error scraping transport:", error);
    res.status(500).json({ message: "Failed to scrape transport data" });
  }
});

// Helper function to extract text from multiple selectors
function extractText($: cheerio.CheerioAPI, selectors: string[], fallbackAttr?: string): string | null {
  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length) {
      // Check for meta tags that use content attribute
      if (selector.startsWith('meta[') || fallbackAttr === 'attr:content') {
        const content = element.attr('content');
        if (content) return content.trim();
      }
      const text = element.text().trim();
      if (text) return text;
    }
  }
  return null;
}

// Helper function to extract number from multiple selectors
function extractNumber($: cheerio.CheerioAPI, selectors: string[]): number | null {
  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length) {
      const text = element.text().trim();
      const match = text.match(/[\d.]+/);
      if (match) return parseFloat(match[0]);
      
      // Check content attribute for meta tags
      const content = element.attr('content');
      if (content) {
        const contentMatch = content.match(/[\d.]+/);
        if (contentMatch) return parseFloat(contentMatch[0]);
      }
    }
  }
  return null;
}

// Helper function to extract images from multiple selectors
function extractImages($: cheerio.CheerioAPI, selectors: string[]): string[] {
  const images: string[] = [];
  const seenUrls = new Set<string>();
  
  for (const selector of selectors) {
    $(selector).each((_, element) => {
      let src = $(element).attr('src') || $(element).attr('data-src') || $(element).attr('content');
      if (src && !seenUrls.has(src)) {
        // Handle relative URLs
        if (src.startsWith('//')) src = 'https:' + src;
        seenUrls.add(src);
        images.push(src);
      }
    });
    if (images.length >= 10) break;
  }
  
  return images.slice(0, 10);
}

// Helper function to extract list items
function extractListItems($: cheerio.CheerioAPI, selectors: string[]): string[] {
  const items: string[] = [];
  const seenItems = new Set<string>();
  
  for (const selector of selectors) {
    $(selector).each((_, element) => {
      const text = $(element).text().trim();
      if (text && !seenItems.has(text) && text.length < 100) {
        seenItems.add(text);
        items.push(text);
      }
    });
    if (items.length >= 20) break;
  }
  
  return items.slice(0, 20);
}

// ============================================================================
// TRIP JOIN REQUESTS - Request to Book Feature
// ============================================================================

// POST /api/travel/trips/:tripId/request-join - Request to join a trip
router.post("/trips/:tripId/request-join", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const requesterId = req.user!.id;
    const tripId = parseInt(req.params.tripId);
    const { message } = req.body;

    // Get the trip to find the owner
    const tripResult = await db.select()
      .from(travelPlans)
      .where(eq(travelPlans.id, tripId))
      .limit(1);

    if (tripResult.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const trip = tripResult[0];

    // Prevent requesting to join own trip
    if (trip.userId === requesterId) {
      return res.status(400).json({ message: "Cannot request to join your own trip" });
    }

    // Check if request already exists
    const existingRequest = await db.select()
      .from(tripJoinRequests)
      .where(and(
        eq(tripJoinRequests.tripId, tripId),
        eq(tripJoinRequests.requesterId, requesterId)
      ))
      .limit(1);

    if (existingRequest.length > 0) {
      return res.status(400).json({ message: "You have already requested to join this trip" });
    }

    // Get requester info for notification
    const requesterResult = await db.select({
      id: users.id,
      name: users.name,
      username: users.username,
      profileImage: users.profileImage,
    })
      .from(users)
      .where(eq(users.id, requesterId))
      .limit(1);

    const requester = requesterResult[0];

    // Create the join request
    const [newRequest] = await db.insert(tripJoinRequests).values({
      tripId,
      requesterId,
      ownerId: trip.userId,
      message: message || null,
      status: 'pending',
    }).returning();

    // Create notification for trip owner
    await db.insert(notifications).values({
      userId: trip.userId,
      type: 'trip_join_request',
      title: 'New Trip Join Request',
      message: `${requester.name} wants to join your trip to ${trip.city}`,
      data: JSON.stringify({
        requestId: newRequest.id,
        tripId: trip.id,
        tripCity: trip.city,
        requesterId: requester.id,
        requesterName: requester.name,
        requesterUsername: requester.username,
        requesterImage: requester.profileImage,
        requestMessage: message,
      }),
      actionUrl: `/profile/${trip.userId}?tab=travel&tripId=${trip.id}&section=requests`,
      isRead: false,
    });

    res.status(201).json({
      message: "Join request sent successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating trip join request:", error);
    res.status(500).json({ message: "Failed to send join request" });
  }
});

// GET /api/travel/trips/:tripId/requests - Get all join requests for a trip (owner only)
router.get("/trips/:tripId/requests", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const tripId = parseInt(req.params.tripId);

    // Verify ownership
    const tripResult = await db.select()
      .from(travelPlans)
      .where(and(
        eq(travelPlans.id, tripId),
        eq(travelPlans.userId, userId)
      ))
      .limit(1);

    if (tripResult.length === 0) {
      return res.status(404).json({ message: "Trip not found or you don't have permission" });
    }

    // Get all requests with requester info
    const requests = await db.select({
      id: tripJoinRequests.id,
      tripId: tripJoinRequests.tripId,
      requesterId: tripJoinRequests.requesterId,
      message: tripJoinRequests.message,
      status: tripJoinRequests.status,
      createdAt: tripJoinRequests.createdAt,
      respondedAt: tripJoinRequests.respondedAt,
      requesterName: users.name,
      requesterUsername: users.username,
      requesterProfileImage: users.profileImage,
      requesterCity: users.city,
      requesterCountry: users.country,
      requesterTangoRoles: users.tangoRoles,
    })
      .from(tripJoinRequests)
      .leftJoin(users, eq(tripJoinRequests.requesterId, users.id))
      .where(eq(tripJoinRequests.tripId, tripId))
      .orderBy(desc(tripJoinRequests.createdAt));

    res.json(requests);
  } catch (error) {
    console.error("Error fetching trip join requests:", error);
    res.status(500).json({ message: "Failed to fetch join requests" });
  }
});

// GET /api/travel/my-requests - Get all requests made by current user
router.get("/my-requests", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const requests = await db.select({
      id: tripJoinRequests.id,
      tripId: tripJoinRequests.tripId,
      message: tripJoinRequests.message,
      status: tripJoinRequests.status,
      createdAt: tripJoinRequests.createdAt,
      respondedAt: tripJoinRequests.respondedAt,
      tripCity: travelPlans.city,
      tripCountry: travelPlans.country,
      tripStartDate: travelPlans.startDate,
      tripEndDate: travelPlans.endDate,
      ownerName: users.name,
      ownerUsername: users.username,
      ownerProfileImage: users.profileImage,
    })
      .from(tripJoinRequests)
      .leftJoin(travelPlans, eq(tripJoinRequests.tripId, travelPlans.id))
      .leftJoin(users, eq(tripJoinRequests.ownerId, users.id))
      .where(eq(tripJoinRequests.requesterId, userId))
      .orderBy(desc(tripJoinRequests.createdAt));

    res.json(requests);
  } catch (error) {
    console.error("Error fetching my requests:", error);
    res.status(500).json({ message: "Failed to fetch your requests" });
  }
});

// PATCH /api/travel/requests/:requestId - Accept or reject a request (owner only)
router.patch("/requests/:requestId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const requestId = parseInt(req.params.requestId);
    const { status } = req.body; // 'accepted' | 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'accepted' or 'rejected'" });
    }

    // Get the request and verify ownership
    const requestResult = await db.select({
      request: tripJoinRequests,
      trip: travelPlans,
    })
      .from(tripJoinRequests)
      .leftJoin(travelPlans, eq(tripJoinRequests.tripId, travelPlans.id))
      .where(eq(tripJoinRequests.id, requestId))
      .limit(1);

    if (requestResult.length === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    const { request, trip } = requestResult[0];

    if (!trip || trip.userId !== userId) {
      return res.status(403).json({ message: "You can only respond to requests for your own trips" });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: "This request has already been processed" });
    }

    // Get owner info for notification
    const ownerResult = await db.select({
      name: users.name,
    })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const owner = ownerResult[0];

    // Update the request
    const [updatedRequest] = await db.update(tripJoinRequests)
      .set({
        status,
        respondedAt: new Date(),
      })
      .where(eq(tripJoinRequests.id, requestId))
      .returning();

    // Create notification for requester
    await db.insert(notifications).values({
      userId: request.requesterId,
      type: status === 'accepted' ? 'trip_request_accepted' : 'trip_request_rejected',
      title: status === 'accepted' ? 'Trip Request Accepted!' : 'Trip Request Update',
      message: status === 'accepted' 
        ? `${owner.name} accepted your request to join their trip to ${trip.city}!`
        : `${owner.name} was unable to accept your request to join their trip to ${trip.city}`,
      data: JSON.stringify({
        requestId: request.id,
        tripId: trip.id,
        tripCity: trip.city,
        ownerId: userId,
        ownerName: owner.name,
        status,
      }),
      actionUrl: `/profile/${userId}?tab=travel`,
      isRead: false,
    });

    res.json({
      message: `Request ${status}`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating trip join request:", error);
    res.status(500).json({ message: "Failed to update request" });
  }
});

// DELETE /api/travel/requests/:requestId - Cancel a request (requester only)
router.delete("/requests/:requestId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const requestId = parseInt(req.params.requestId);

    // Get the request and verify requester
    const requestResult = await db.select()
      .from(tripJoinRequests)
      .where(and(
        eq(tripJoinRequests.id, requestId),
        eq(tripJoinRequests.requesterId, userId)
      ))
      .limit(1);

    if (requestResult.length === 0) {
      return res.status(404).json({ message: "Request not found or you don't have permission" });
    }

    await db.delete(tripJoinRequests)
      .where(eq(tripJoinRequests.id, requestId));

    res.json({ message: "Request cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling trip join request:", error);
    res.status(500).json({ message: "Failed to cancel request" });
  }
});

// GET /api/travel/pending-requests-count - Get count of pending requests for user's trips
router.get("/pending-requests-count", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await db.select({
      count: tripJoinRequests.id,
    })
      .from(tripJoinRequests)
      .where(and(
        eq(tripJoinRequests.ownerId, userId),
        eq(tripJoinRequests.status, 'pending')
      ));

    res.json({ count: result.length });
  } catch (error) {
    console.error("Error counting pending requests:", error);
    res.status(500).json({ message: "Failed to count pending requests" });
  }
});

export default router;
