import { Router, Response } from "express";
import { db } from "@shared/db";
import { travelPlans, travelPlanItems, users, events, housingListings } from "@shared/schema";
import { eq, desc, and, gte, lte, or, ilike, isNotNull } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";
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
    const { name, description, startDate, endDate, budget, currency, isPublic } = req.body;

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
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (budget !== undefined) updateData.budget = budget;
    if (currency !== undefined) updateData.currency = currency;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const result = await db.update(travelPlans)
      .set(updateData)
      .where(eq(travelPlans.id, parseInt(id)))
      .returning();

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
router.get("/events-by-city", async (req: AuthRequest, res: Response) => {
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
router.get("/housing-by-city", async (req: AuthRequest, res: Response) => {
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

export default router;
