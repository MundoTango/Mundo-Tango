import { Router, Response } from "express";
import { db } from "@shared/db";
import { travelPlans, travelPlanItems, users, events, housingListings, tripJoinRequests, notifications } from "@shared/schema";
import { eq, desc, and, gte, lte, or, ilike, isNotNull } from "drizzle-orm";
import { authenticateToken, optionalAuth, AuthRequest } from "@shared/middleware";
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

const router = Router();

// Corrected route: GET /api/travel/events-by-city
router.get("/events-by-city", optionalAuth, async (req: AuthRequest, res: Response) => {
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

export default router;