import { Router, type Response } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import {
  insertTangoSchoolProfileSchema,
  insertTangoHotelProfileSchema,
  insertHostVenueProfileSchema,
  insertWellnessProfileSchema,
  insertTourOperatorProfileSchema,
  insertTangoGuideProfileSchema,
  insertContentCreatorProfileSchema,
  insertLearningResourceProfileSchema,
  insertTaxiDancerProfileSchema,
  insertOrganizerProfileSchema,
  tangoSchoolProfiles,
  tangoHotelProfiles,
  hostVenueProfiles,
  users,
} from "@shared/schema";
import { db } from "@shared/db";
import { eq, and, sql, gte, lte, ilike, desc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// ============================================================================
// BATCH 06-07: BUSINESS + SPECIALTY PROFILE API ENDPOINTS
// Business Profiles + Specialty Service Provider Profiles
// ============================================================================

// ============================================================================
// TANGO SCHOOL PROFILE ROUTES
// ============================================================================

// GET /api/profiles/tango-schools - List all tango schools with filters
router.get("/tango-schools", async (req, res: Response) => {
  try {
    const { 
      city, 
      country,
      minRate, 
      maxRate, 
      styles,
      classTypes,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        profile: tangoSchoolProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(tangoSchoolProfiles)
      .leftJoin(users, eq(tangoSchoolProfiles.userId, users.id))
      .where(eq(tangoSchoolProfiles.isActive, true))
      .$dynamic();

    const conditions = [eq(tangoSchoolProfiles.isActive, true)];

    // Filter by city
    if (city && typeof city === "string") {
      conditions.push(ilike(tangoSchoolProfiles.city, `%${city}%`));
    }

    // Filter by country
    if (country && typeof country === "string") {
      conditions.push(ilike(tangoSchoolProfiles.country, `%${country}%`));
    }

    // Filter by drop-in rate range
    if (minRate && typeof minRate === "string") {
      const rate = parseFloat(minRate);
      if (!isNaN(rate)) {
        conditions.push(gte(tangoSchoolProfiles.dropInRate, rate.toString()));
      }
    }

    if (maxRate && typeof maxRate === "string") {
      const rate = parseFloat(maxRate);
      if (!isNaN(rate)) {
        conditions.push(lte(tangoSchoolProfiles.dropInRate, rate.toString()));
      }
    }

    // Filter by dance styles
    if (styles && typeof styles === "string") {
      const styleList = styles.split(",").map(s => s.trim());
      conditions.push(
        sql`${tangoSchoolProfiles.danceStyles} && ARRAY[${sql.join(styleList.map(s => sql`${s}`), sql`, `)}]::text[]`
      );
    }

    // Filter by class types
    if (classTypes && typeof classTypes === "string") {
      const typeList = classTypes.split(",").map(t => t.trim());
      conditions.push(
        sql`${tangoSchoolProfiles.classTypes} && ARRAY[${sql.join(typeList.map(t => sql`${t}`), sql`, `)}]::text[]`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const results = await query
      .orderBy(desc(tangoSchoolProfiles.averageRating))
      .limit(limitNum)
      .offset(offsetNum);

    res.json({
      success: true,
      data: results.map(r => ({
        ...r.profile,
        user: r.user,
      })),
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total: results.length,
      }
    });
  } catch (error) {
    console.error("[BusinessProfile] Error listing tango schools:", error);
    res.status(500).json({ message: "Failed to list tango schools" });
  }
});

// GET /api/profiles/tango-schools/:userId - Get tango school profile by user ID
router.get("/tango-schools/:userId", async (req: any, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getTangoSchoolProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Tango school profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'tango_school', viewerIp);
    }

    res.json(profile);
  } catch (error) {
    console.error("[BusinessProfile] Error fetching tango school profile:", error);
    res.status(500).json({ message: "Failed to fetch tango school profile" });
  }
});

// POST /api/profiles/tango-schools - Create tango school profile for authenticated user
router.post("/tango-schools", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertTangoSchoolProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createTangoSchoolProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error creating tango school profile:", error);
    res.status(500).json({ message: "Failed to create tango school profile" });
  }
});

// PUT /api/profiles/tango-schools/:userId - Update tango school profile
router.put("/tango-schools/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership - user can only update their own profile
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateTangoSchoolProfile(userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Tango school profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error updating tango school profile:", error);
    res.status(500).json({ message: "Failed to update tango school profile" });
  }
});

// DELETE /api/profiles/tango-schools/:userId - Delete tango school profile
router.delete("/tango-schools/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteTangoSchoolProfile(userId);
    res.json({ success: true, message: "Tango school profile deleted successfully" });
  } catch (error) {
    console.error("[BusinessProfile] Error deleting tango school profile:", error);
    res.status(500).json({ message: "Failed to delete tango school profile" });
  }
});

// ============================================================================
// TANGO HOTEL PROFILE ROUTES
// ============================================================================

// GET /api/profiles/tango-hotels - List all tango hotels with filters
router.get("/tango-hotels", async (req, res: Response) => {
  try {
    const { 
      city, 
      country,
      minPrice, 
      maxPrice, 
      hotelType,
      starRating,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        profile: tangoHotelProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(tangoHotelProfiles)
      .leftJoin(users, eq(tangoHotelProfiles.userId, users.id))
      .where(eq(tangoHotelProfiles.isActive, true))
      .$dynamic();

    const conditions = [eq(tangoHotelProfiles.isActive, true)];

    // Filter by city
    if (city && typeof city === "string") {
      conditions.push(ilike(tangoHotelProfiles.city, `%${city}%`));
    }

    // Filter by country
    if (country && typeof country === "string") {
      conditions.push(ilike(tangoHotelProfiles.country, `%${country}%`));
    }

    // Filter by price range (using priceRangeLow)
    if (minPrice && typeof minPrice === "string") {
      const price = parseFloat(minPrice);
      if (!isNaN(price)) {
        conditions.push(gte(tangoHotelProfiles.priceRangeLow, price.toString()));
      }
    }

    if (maxPrice && typeof maxPrice === "string") {
      const price = parseFloat(maxPrice);
      if (!isNaN(price)) {
        conditions.push(lte(tangoHotelProfiles.priceRangeHigh, price.toString()));
      }
    }

    // Filter by hotel type
    if (hotelType && typeof hotelType === "string") {
      conditions.push(eq(tangoHotelProfiles.hotelType, hotelType));
    }

    // Filter by star rating
    if (starRating && typeof starRating === "string") {
      const rating = parseInt(starRating);
      if (!isNaN(rating)) {
        conditions.push(gte(tangoHotelProfiles.starRating, rating));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const results = await query
      .orderBy(desc(tangoHotelProfiles.averageRating))
      .limit(limitNum)
      .offset(offsetNum);

    res.json({
      success: true,
      data: results.map(r => ({
        ...r.profile,
        user: r.user,
      })),
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total: results.length,
      }
    });
  } catch (error) {
    console.error("[BusinessProfile] Error listing tango hotels:", error);
    res.status(500).json({ message: "Failed to list tango hotels" });
  }
});

// GET /api/profiles/tango-hotels/:userId - Get tango hotel profile by user ID
router.get("/tango-hotels/:userId", async (req: any, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getTangoHotelProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Tango hotel profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'tango_hotel', viewerIp);
    }

    res.json(profile);
  } catch (error) {
    console.error("[BusinessProfile] Error fetching tango hotel profile:", error);
    res.status(500).json({ message: "Failed to fetch tango hotel profile" });
  }
});

// POST /api/profiles/tango-hotels - Create tango hotel profile
router.post("/tango-hotels", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertTangoHotelProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createTangoHotelProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error creating tango hotel profile:", error);
    res.status(500).json({ message: "Failed to create tango hotel profile" });
  }
});

// PUT /api/profiles/tango-hotels/:userId - Update tango hotel profile
router.put("/tango-hotels/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateTangoHotelProfile(userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Tango hotel profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error updating tango hotel profile:", error);
    res.status(500).json({ message: "Failed to update tango hotel profile" });
  }
});

// DELETE /api/profiles/tango-hotels/:userId - Delete tango hotel profile
router.delete("/tango-hotels/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteTangoHotelProfile(userId);
    res.json({ success: true, message: "Tango hotel profile deleted successfully" });
  } catch (error) {
    console.error("[BusinessProfile] Error deleting tango hotel profile:", error);
    res.status(500).json({ message: "Failed to delete tango hotel profile" });
  }
});

// ============================================================================
// HOST VENUE PROFILE ROUTES
// ============================================================================

// GET /api/profiles/venues - List all venues with filters
router.get("/venues", async (req, res: Response) => {
  try {
    const { 
      city, 
      country,
      minRate, 
      maxRate, 
      venueType,
      minCapacity,
      eventTypes,
      amenities,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        profile: hostVenueProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(hostVenueProfiles)
      .leftJoin(users, eq(hostVenueProfiles.userId, users.id))
      .where(eq(hostVenueProfiles.isActive, true))
      .$dynamic();

    const conditions = [eq(hostVenueProfiles.isActive, true)];

    // Filter by city
    if (city && typeof city === "string") {
      conditions.push(ilike(hostVenueProfiles.city, `%${city}%`));
    }

    // Filter by country
    if (country && typeof country === "string") {
      conditions.push(ilike(hostVenueProfiles.country, `%${country}%`));
    }

    // Filter by hourly rate range
    if (minRate && typeof minRate === "string") {
      const rate = parseFloat(minRate);
      if (!isNaN(rate)) {
        conditions.push(gte(hostVenueProfiles.hourlyRate, rate.toString()));
      }
    }

    if (maxRate && typeof maxRate === "string") {
      const rate = parseFloat(maxRate);
      if (!isNaN(rate)) {
        conditions.push(lte(hostVenueProfiles.hourlyRate, rate.toString()));
      }
    }

    // Filter by venue type
    if (venueType && typeof venueType === "string") {
      conditions.push(eq(hostVenueProfiles.venueType, venueType));
    }

    // Filter by minimum capacity
    if (minCapacity && typeof minCapacity === "string") {
      const capacity = parseInt(minCapacity);
      if (!isNaN(capacity)) {
        conditions.push(gte(hostVenueProfiles.maximumCapacity, capacity));
      }
    }

    // Filter by event types
    if (eventTypes && typeof eventTypes === "string") {
      const typeList = eventTypes.split(",").map(t => t.trim());
      conditions.push(
        sql`${hostVenueProfiles.eventTypes} && ARRAY[${sql.join(typeList.map(t => sql`${t}`), sql`, `)}]::text[]`
      );
    }

    // Filter by amenities
    if (amenities && typeof amenities === "string") {
      const amenityList = amenities.split(",").map(a => a.trim());
      conditions.push(
        sql`${hostVenueProfiles.amenities} && ARRAY[${sql.join(amenityList.map(a => sql`${a}`), sql`, `)}]::text[]`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const results = await query
      .orderBy(desc(hostVenueProfiles.averageRating))
      .limit(limitNum)
      .offset(offsetNum);

    res.json({
      success: true,
      data: results.map(r => ({
        ...r.profile,
        user: r.user,
      })),
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total: results.length,
      }
    });
  } catch (error) {
    console.error("[BusinessProfile] Error listing venues:", error);
    res.status(500).json({ message: "Failed to list venues" });
  }
});

// GET /api/profiles/venues/:userId - Get venue profile by user ID
router.get("/venues/:userId", async (req, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getHostVenueProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Host venue profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[BusinessProfile] Error fetching host venue profile:", error);
    res.status(500).json({ message: "Failed to fetch host venue profile" });
  }
});

// POST /api/profiles/venues - Create venue profile
router.post("/venues", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertHostVenueProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createHostVenueProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error creating venue profile:", error);
    res.status(500).json({ message: "Failed to create venue profile" });
  }
});

// PUT /api/profiles/venues/:userId - Update venue profile
router.put("/venues/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateHostVenueProfile(userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Venue profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error updating venue profile:", error);
    res.status(500).json({ message: "Failed to update venue profile" });
  }
});

// DELETE /api/profiles/venues/:userId - Delete venue profile
router.delete("/venues/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteHostVenueProfile(userId);
    res.json({ success: true, message: "Venue profile deleted successfully" });
  } catch (error) {
    console.error("[BusinessProfile] Error deleting venue profile:", error);
    res.status(500).json({ message: "Failed to delete venue profile" });
  }
});

// ============================================================================
// WELLNESS PROFILE ROUTES
// ============================================================================

// GET /api/profiles/wellness/:userId
router.get("/wellness/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getWellnessProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Wellness profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'wellness', viewerIp);
    }

    res.json(profile);
  } catch (error) {
    console.error("[BusinessProfile] Error fetching wellness profile:", error);
    res.status(500).json({ message: "Failed to fetch wellness profile" });
  }
});

// POST /api/profiles/wellness
router.post("/wellness", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertWellnessProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createWellnessProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error creating wellness profile:", error);
    res.status(500).json({ message: "Failed to create wellness profile" });
  }
});

// PUT /api/profiles/wellness
router.put("/wellness", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getWellnessProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Wellness profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateWellnessProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Wellness profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error updating wellness profile:", error);
    res.status(500).json({ message: "Failed to update wellness profile" });
  }
});

// DELETE /api/profiles/wellness
router.delete("/wellness", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getWellnessProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Wellness profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteWellnessProfile(req.userId);
    res.json({ success: true, message: "Wellness profile deleted successfully" });
  } catch (error) {
    console.error("[BusinessProfile] Error deleting wellness profile:", error);
    res.status(500).json({ message: "Failed to delete wellness profile" });
  }
});

// ============================================================================
// TOUR OPERATOR PROFILE ROUTES
// ============================================================================

// GET /api/profiles/tour-operator/:userId
router.get("/tour-operator/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getTourOperatorProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Tour operator profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[BusinessProfile] Error fetching tour operator profile:", error);
    res.status(500).json({ message: "Failed to fetch tour operator profile" });
  }
});

// POST /api/profiles/tour-operator
router.post("/tour-operator", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertTourOperatorProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createTourOperatorProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error creating tour operator profile:", error);
    res.status(500).json({ message: "Failed to create tour operator profile" });
  }
});

// PUT /api/profiles/tour-operator
router.put("/tour-operator", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getTourOperatorProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Tour operator profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateTourOperatorProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Tour operator profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error updating tour operator profile:", error);
    res.status(500).json({ message: "Failed to update tour operator profile" });
  }
});

// DELETE /api/profiles/tour-operator
router.delete("/tour-operator", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getTourOperatorProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Tour operator profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteTourOperatorProfile(req.userId);
    res.json({ success: true, message: "Tour operator profile deleted successfully" });
  } catch (error) {
    console.error("[BusinessProfile] Error deleting tour operator profile:", error);
    res.status(500).json({ message: "Failed to delete tour operator profile" });
  }
});

// ============================================================================
// TANGO GUIDE PROFILE ROUTES
// ============================================================================

// GET /api/profiles/tango-guide/:userId
router.get("/tango-guide/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getTangoGuideProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Tango guide profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[BusinessProfile] Error fetching tango guide profile:", error);
    res.status(500).json({ message: "Failed to fetch tango guide profile" });
  }
});

// POST /api/profiles/tango-guide
router.post("/tango-guide", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertTangoGuideProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createTangoGuideProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error creating tango guide profile:", error);
    res.status(500).json({ message: "Failed to create tango guide profile" });
  }
});

// PUT /api/profiles/tango-guide
router.put("/tango-guide", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getTangoGuideProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Tango guide profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateTangoGuideProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Tango guide profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error updating tango guide profile:", error);
    res.status(500).json({ message: "Failed to update tango guide profile" });
  }
});

// DELETE /api/profiles/tango-guide
router.delete("/tango-guide", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getTangoGuideProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Tango guide profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteTangoGuideProfile(req.userId);
    res.json({ success: true, message: "Tango guide profile deleted successfully" });
  } catch (error) {
    console.error("[BusinessProfile] Error deleting tango guide profile:", error);
    res.status(500).json({ message: "Failed to delete tango guide profile" });
  }
});

// ============================================================================
// CONTENT CREATOR PROFILE ROUTES
// ============================================================================

// GET /api/profiles/content-creator/:userId
router.get("/content-creator/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getContentCreatorProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Content creator profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[BusinessProfile] Error fetching content creator profile:", error);
    res.status(500).json({ message: "Failed to fetch content creator profile" });
  }
});

// POST /api/profiles/content-creator
router.post("/content-creator", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertContentCreatorProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createContentCreatorProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error creating content creator profile:", error);
    res.status(500).json({ message: "Failed to create content creator profile" });
  }
});

// PUT /api/profiles/content-creator
router.put("/content-creator", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getContentCreatorProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Content creator profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateContentCreatorProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Content creator profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error updating content creator profile:", error);
    res.status(500).json({ message: "Failed to update content creator profile" });
  }
});

// DELETE /api/profiles/content-creator
router.delete("/content-creator", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getContentCreatorProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Content creator profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteContentCreatorProfile(req.userId);
    res.json({ success: true, message: "Content creator profile deleted successfully" });
  } catch (error) {
    console.error("[BusinessProfile] Error deleting content creator profile:", error);
    res.status(500).json({ message: "Failed to delete content creator profile" });
  }
});

// ============================================================================
// LEARNING RESOURCE PROFILE ROUTES
// ============================================================================

// GET /api/profiles/learning-resource/:userId
router.get("/learning-resource/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getLearningResourceProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Learning resource profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[BusinessProfile] Error fetching learning resource profile:", error);
    res.status(500).json({ message: "Failed to fetch learning resource profile" });
  }
});

// POST /api/profiles/learning-resource
router.post("/learning-resource", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertLearningResourceProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createLearningResourceProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error creating learning resource profile:", error);
    res.status(500).json({ message: "Failed to create learning resource profile" });
  }
});

// PUT /api/profiles/learning-resource
router.put("/learning-resource", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getLearningResourceProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Learning resource profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateLearningResourceProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Learning resource profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error updating learning resource profile:", error);
    res.status(500).json({ message: "Failed to update learning resource profile" });
  }
});

// DELETE /api/profiles/learning-resource
router.delete("/learning-resource", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getLearningResourceProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Learning resource profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteLearningResourceProfile(req.userId);
    res.json({ success: true, message: "Learning resource profile deleted successfully" });
  } catch (error) {
    console.error("[BusinessProfile] Error deleting learning resource profile:", error);
    res.status(500).json({ message: "Failed to delete learning resource profile" });
  }
});

// ============================================================================
// TAXI DANCER PROFILE ROUTES
// ============================================================================

// GET /api/profiles/taxi-dancer/:userId
router.get("/taxi-dancer/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getTaxiDancerProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Taxi dancer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[BusinessProfile] Error fetching taxi dancer profile:", error);
    res.status(500).json({ message: "Failed to fetch taxi dancer profile" });
  }
});

// POST /api/profiles/taxi-dancer
router.post("/taxi-dancer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertTaxiDancerProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createTaxiDancerProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error creating taxi dancer profile:", error);
    res.status(500).json({ message: "Failed to create taxi dancer profile" });
  }
});

// PUT /api/profiles/taxi-dancer
router.put("/taxi-dancer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getTaxiDancerProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Taxi dancer profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateTaxiDancerProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Taxi dancer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error updating taxi dancer profile:", error);
    res.status(500).json({ message: "Failed to update taxi dancer profile" });
  }
});

// DELETE /api/profiles/taxi-dancer
router.delete("/taxi-dancer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getTaxiDancerProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Taxi dancer profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteTaxiDancerProfile(req.userId);
    res.json({ success: true, message: "Taxi dancer profile deleted successfully" });
  } catch (error) {
    console.error("[BusinessProfile] Error deleting taxi dancer profile:", error);
    res.status(500).json({ message: "Failed to delete taxi dancer profile" });
  }
});

// ============================================================================
// ORGANIZER PROFILE ROUTES
// ============================================================================

// GET /api/profiles/organizer/:userId
router.get("/organizer/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getOrganizerProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Organizer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[BusinessProfile] Error fetching organizer profile:", error);
    res.status(500).json({ message: "Failed to fetch organizer profile" });
  }
});

// POST /api/profiles/organizer
router.post("/organizer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertOrganizerProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const profile = await storage.createOrganizerProfile(validatedData);
    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error creating organizer profile:", error);
    res.status(500).json({ message: "Failed to create organizer profile" });
  }
});

// PUT /api/profiles/organizer
router.put("/organizer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getOrganizerProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Organizer profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.updateOrganizerProfile(req.userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Organizer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[BusinessProfile] Error updating organizer profile:", error);
    res.status(500).json({ message: "Failed to update organizer profile" });
  }
});

// DELETE /api/profiles/organizer
router.delete("/organizer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const existingProfile = await storage.getOrganizerProfile(req.userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Organizer profile not found" });
    }

    if (existingProfile.userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteOrganizerProfile(req.userId);
    res.json({ success: true, message: "Organizer profile deleted successfully" });
  } catch (error) {
    console.error("[BusinessProfile] Error deleting organizer profile:", error);
    res.status(500).json({ message: "Failed to delete organizer profile" });
  }
});

export default router;
