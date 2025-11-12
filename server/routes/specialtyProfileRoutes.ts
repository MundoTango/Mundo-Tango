import { Router, type Response } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { db } from "@shared/db";
import { eq, and, or, ilike, sql, desc } from "drizzle-orm";
import {
  wellnessProfiles,
  tourOperatorProfiles,
  tangoGuideProfiles,
  taxiDancerProfiles,
  users,
  insertWellnessProfileSchema,
  insertTourOperatorProfileSchema,
  insertTangoGuideProfileSchema,
  insertTaxiDancerProfileSchema,
  insertContentCreatorProfileSchema,
  insertLearningResourceProfileSchema,
  insertOrganizerProfileSchema,
} from "@shared/schema";
import { z } from "zod";

const router = Router();

// ============================================================================
// BATCH 07: SPECIALTY SERVICE PROFILE API ROUTES
// ============================================================================

// ============================================================================
// WELLNESS PROFILE ROUTES
// ============================================================================

// GET /api/profiles/wellness - Search wellness profiles
router.get("/wellness", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      service,
      specialty, 
      city,
      minRating,
      acceptsInsurance,
      virtualSessions,
      limit = "20",
      offset = "0" 
    } = req.query;

    let query = db
      .select({
        id: wellnessProfiles.id,
        userId: wellnessProfiles.userId,
        businessName: wellnessProfiles.businessName,
        bio: wellnessProfiles.bio,
        tagline: wellnessProfiles.tagline,
        primarySpecialty: wellnessProfiles.primarySpecialty,
        specialties: wellnessProfiles.specialties,
        focusAreas: wellnessProfiles.focusAreas,
        certifications: wellnessProfiles.certifications,
        yearsExperience: wellnessProfiles.yearsExperience,
        sessionRate: wellnessProfiles.sessionRate,
        currency: wellnessProfiles.currency,
        acceptsInsurance: wellnessProfiles.acceptsInsurance,
        insuranceProviders: wellnessProfiles.insuranceProviders,
        virtualSessions: wellnessProfiles.virtualSessions,
        officeCity: wellnessProfiles.officeCity,
        officeCountry: wellnessProfiles.officeCountry,
        averageRating: wellnessProfiles.averageRating,
        totalReviews: wellnessProfiles.totalReviews,
        isActive: wellnessProfiles.isActive,
        isVerified: wellnessProfiles.isVerified,
        userName: users.name,
        userProfileImage: users.profileImage,
      })
      .from(wellnessProfiles)
      .leftJoin(users, eq(wellnessProfiles.userId, users.id));

    const conditions: any[] = [eq(wellnessProfiles.isActive, true)];

    if (q && typeof q === 'string') {
      conditions.push(
        or(
          ilike(wellnessProfiles.businessName, `%${q}%`),
          ilike(wellnessProfiles.bio, `%${q}%`),
          ilike(users.name, `%${q}%`)
        )
      );
    }

    if (specialty && typeof specialty === 'string') {
      conditions.push(sql`${specialty} = ANY(${wellnessProfiles.specialties})`);
    }

    if (city && typeof city === 'string') {
      conditions.push(ilike(wellnessProfiles.officeCity, `%${city}%`));
    }

    if (minRating && typeof minRating === 'string') {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(sql`${wellnessProfiles.averageRating} >= ${rating}`);
      }
    }

    if (acceptsInsurance === 'true') {
      conditions.push(eq(wellnessProfiles.acceptsInsurance, true));
    }

    if (virtualSessions === 'true') {
      conditions.push(eq(wellnessProfiles.virtualSessions, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(wellnessProfiles.averageRating))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[SpecialtyProfiles] Error searching wellness profiles:", error);
    res.status(500).json({ message: "Failed to search wellness profiles" });
  }
});

// GET /api/profiles/wellness/:userId - Get wellness profile by user ID
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

    res.json(profile);
  } catch (error) {
    console.error("[SpecialtyProfiles] Error fetching wellness profile:", error);
    res.status(500).json({ message: "Failed to fetch wellness profile" });
  }
});

// PUT /api/profiles/wellness/:userId - Create or update wellness profile
router.put("/wellness/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    // Special validation for wellness profiles: certifications array & insurance info
    const validationSchema = insertWellnessProfileSchema.extend({
      certifications: z.array(z.object({
        name: z.string().min(1, "Certification name is required"),
        issuer: z.string().min(1, "Issuer is required"),
        year: z.number().int().min(1900).max(new Date().getFullYear()),
        expiryDate: z.string().optional(),
      })).optional(),
      insuranceProviders: z.array(z.string().min(1, "Insurance provider name cannot be empty")).optional(),
      acceptsInsurance: z.boolean().optional(),
    });

    const existingProfile = await storage.getWellnessProfile(userId);
    
    if (!existingProfile) {
      const validatedData = validationSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const profile = await storage.createWellnessProfile(validatedData);
      return res.status(201).json(profile);
    }

    const validatedData = validationSchema.partial().parse(req.body);
    const profile = await storage.updateWellnessProfile(userId, validatedData);
    
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
    console.error("[SpecialtyProfiles] Error updating wellness profile:", error);
    res.status(500).json({ message: "Failed to update wellness profile" });
  }
});

// DELETE /api/profiles/wellness/:userId - Delete wellness profile
router.delete("/wellness/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteWellnessProfile(userId);
    res.status(204).send();
  } catch (error) {
    console.error("[SpecialtyProfiles] Error deleting wellness profile:", error);
    res.status(500).json({ message: "Failed to delete wellness profile" });
  }
});

// ============================================================================
// TOUR OPERATOR PROFILE ROUTES
// ============================================================================

// GET /api/profiles/tour-operators - Search tour operator profiles
router.get("/tour-operators", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      destination,
      tourType,
      minGroupSize,
      maxGroupSize,
      minRating,
      limit = "20",
      offset = "0" 
    } = req.query;

    let query = db
      .select({
        id: tourOperatorProfiles.id,
        userId: tourOperatorProfiles.userId,
        companyName: tourOperatorProfiles.companyName,
        bio: tourOperatorProfiles.bio,
        tagline: tourOperatorProfiles.tagline,
        tourTypes: tourOperatorProfiles.tourTypes,
        focusRegions: tourOperatorProfiles.focusRegions,
        destinations: tourOperatorProfiles.destinations,
        averageGroupSize: tourOperatorProfiles.averageGroupSize,
        maxGroupSize: tourOperatorProfiles.maxGroupSize,
        minGroupSize: tourOperatorProfiles.minGroupSize,
        priceRangeLow: tourOperatorProfiles.priceRangeLow,
        priceRangeHigh: tourOperatorProfiles.priceRangeHigh,
        currency: tourOperatorProfiles.currency,
        yearsOperating: tourOperatorProfiles.yearsOperating,
        languages: tourOperatorProfiles.languages,
        photoUrls: tourOperatorProfiles.photoUrls,
        averageRating: tourOperatorProfiles.averageRating,
        totalReviews: tourOperatorProfiles.totalReviews,
        isActive: tourOperatorProfiles.isActive,
        isVerified: tourOperatorProfiles.isVerified,
        userName: users.name,
        userProfileImage: users.profileImage,
      })
      .from(tourOperatorProfiles)
      .leftJoin(users, eq(tourOperatorProfiles.userId, users.id));

    const conditions: any[] = [eq(tourOperatorProfiles.isActive, true)];

    if (q && typeof q === 'string') {
      conditions.push(
        or(
          ilike(tourOperatorProfiles.companyName, `%${q}%`),
          ilike(tourOperatorProfiles.bio, `%${q}%`)
        )
      );
    }

    if (tourType && typeof tourType === 'string') {
      conditions.push(sql`${tourType} = ANY(${tourOperatorProfiles.tourTypes})`);
    }

    // Special validation: Group size limits
    if (minGroupSize && typeof minGroupSize === 'string') {
      const size = parseInt(minGroupSize);
      if (!isNaN(size)) {
        conditions.push(sql`${tourOperatorProfiles.minGroupSize} <= ${size}`);
      }
    }

    if (maxGroupSize && typeof maxGroupSize === 'string') {
      const size = parseInt(maxGroupSize);
      if (!isNaN(size)) {
        conditions.push(sql`${tourOperatorProfiles.maxGroupSize} >= ${size}`);
      }
    }

    if (minRating && typeof minRating === 'string') {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(sql`${tourOperatorProfiles.averageRating} >= ${rating}`);
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(tourOperatorProfiles.averageRating))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[SpecialtyProfiles] Error searching tour operators:", error);
    res.status(500).json({ message: "Failed to search tour operators" });
  }
});

// GET /api/profiles/tour-operators/:userId - Get tour operator profile by user ID
router.get("/tour-operators/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getTourOperatorProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Tour operator profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'tour_operator', viewerIp);
    }

    res.json(profile);
  } catch (error) {
    console.error("[SpecialtyProfiles] Error fetching tour operator profile:", error);
    res.status(500).json({ message: "Failed to fetch tour operator profile" });
  }
});

// PUT /api/profiles/tour-operators/:userId - Create or update tour operator profile
router.put("/tour-operators/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    // Special validation for tour operators: destination arrays & group size limits
    const validationSchema = insertTourOperatorProfileSchema.extend({
      destinations: z.array(z.object({
        city: z.string().min(1, "City is required"),
        country: z.string().min(1, "Country is required"),
        description: z.string().min(1, "Description is required"),
        highlights: z.array(z.string()),
        bestSeasons: z.array(z.string()).optional(),
      })).optional(),
      minGroupSize: z.number().int().min(1, "Minimum group size must be at least 1").max(1000).optional(),
      maxGroupSize: z.number().int().min(1, "Maximum group size must be at least 1").max(1000).optional(),
    }).refine((data) => {
      if (data.minGroupSize && data.maxGroupSize) {
        return data.minGroupSize <= data.maxGroupSize;
      }
      return true;
    }, {
      message: "Minimum group size must be less than or equal to maximum group size",
      path: ["minGroupSize"],
    });

    const existingProfile = await storage.getTourOperatorProfile(userId);
    
    if (!existingProfile) {
      const validatedData = validationSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const profile = await storage.createTourOperatorProfile(validatedData);
      return res.status(201).json(profile);
    }

    const validatedData = validationSchema.partial().parse(req.body);
    const profile = await storage.updateTourOperatorProfile(userId, validatedData);
    
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
    console.error("[SpecialtyProfiles] Error updating tour operator profile:", error);
    res.status(500).json({ message: "Failed to update tour operator profile" });
  }
});

// DELETE /api/profiles/tour-operators/:userId - Delete tour operator profile
router.delete("/tour-operators/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteTourOperatorProfile(userId);
    res.status(204).send();
  } catch (error) {
    console.error("[SpecialtyProfiles] Error deleting tour operator profile:", error);
    res.status(500).json({ message: "Failed to delete tour operator profile" });
  }
});

// ============================================================================
// TANGO GUIDE PROFILE ROUTES
// ============================================================================

// GET /api/profiles/guides - Search tango guide profiles
router.get("/guides", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      city,
      language,
      specialization,
      minRating,
      emergencyAvailable,
      limit = "20",
      offset = "0" 
    } = req.query;

    let query = db
      .select({
        id: tangoGuideProfiles.id,
        userId: tangoGuideProfiles.userId,
        guideName: tangoGuideProfiles.guideName,
        bio: tangoGuideProfiles.bio,
        tagline: tangoGuideProfiles.tagline,
        expertCities: tangoGuideProfiles.expertCities,
        languages: tangoGuideProfiles.languages,
        specializations: tangoGuideProfiles.specializations,
        services: tangoGuideProfiles.services,
        yearsAsGuide: tangoGuideProfiles.yearsAsGuide,
        hourlyRate: tangoGuideProfiles.hourlyRate,
        halfDayRate: tangoGuideProfiles.halfDayRate,
        fullDayRate: tangoGuideProfiles.fullDayRate,
        currency: tangoGuideProfiles.currency,
        emergencyAvailable: tangoGuideProfiles.emergencyAvailable,
        knowledgeAreas: tangoGuideProfiles.knowledgeAreas,
        photoUrls: tangoGuideProfiles.photoUrls,
        averageRating: tangoGuideProfiles.averageRating,
        totalReviews: tangoGuideProfiles.totalReviews,
        isActive: tangoGuideProfiles.isActive,
        isVerified: tangoGuideProfiles.isVerified,
        userName: users.name,
        userProfileImage: users.profileImage,
      })
      .from(tangoGuideProfiles)
      .leftJoin(users, eq(tangoGuideProfiles.userId, users.id));

    const conditions: any[] = [eq(tangoGuideProfiles.isActive, true)];

    if (q && typeof q === 'string') {
      conditions.push(
        or(
          ilike(tangoGuideProfiles.guideName, `%${q}%`),
          ilike(tangoGuideProfiles.bio, `%${q}%`),
          ilike(users.name, `%${q}%`)
        )
      );
    }

    // Special validation: Language requirements
    if (language && typeof language === 'string') {
      conditions.push(sql`${language} = ANY(${tangoGuideProfiles.languages})`);
    }

    if (specialization && typeof specialization === 'string') {
      conditions.push(sql`${specialization} = ANY(${tangoGuideProfiles.specializations})`);
    }

    if (emergencyAvailable === 'true') {
      conditions.push(eq(tangoGuideProfiles.emergencyAvailable, true));
    }

    if (minRating && typeof minRating === 'string') {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(sql`${tangoGuideProfiles.averageRating} >= ${rating}`);
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(tangoGuideProfiles.averageRating))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[SpecialtyProfiles] Error searching guides:", error);
    res.status(500).json({ message: "Failed to search guides" });
  }
});

// GET /api/profiles/guides/:userId - Get guide profile by user ID
router.get("/guides/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getTangoGuideProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Guide profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[SpecialtyProfiles] Error fetching guide profile:", error);
    res.status(500).json({ message: "Failed to fetch guide profile" });
  }
});

// PUT /api/profiles/guides/:userId - Create or update guide profile
router.put("/guides/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    // Special validation for guides: city expertise & language requirements
    const validationSchema = insertTangoGuideProfileSchema.extend({
      expertCities: z.array(z.object({
        city: z.string().min(1, "City name is required"),
        country: z.string().min(1, "Country name is required"),
        yearsKnowledge: z.number().int().min(0, "Years of knowledge must be non-negative"),
        description: z.string().optional(),
      })).min(1, "At least one expert city is required"),
      languages: z.array(z.string().min(2, "Language code must be at least 2 characters"))
        .min(1, "At least one language is required"),
    });

    const existingProfile = await storage.getTangoGuideProfile(userId);
    
    if (!existingProfile) {
      const validatedData = validationSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const profile = await storage.createTangoGuideProfile(validatedData);
      return res.status(201).json(profile);
    }

    const validatedData = validationSchema.partial().parse(req.body);
    const profile = await storage.updateTangoGuideProfile(userId, validatedData);
    
    if (!profile) {
      return res.status(404).json({ message: "Guide profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[SpecialtyProfiles] Error updating guide profile:", error);
    res.status(500).json({ message: "Failed to update guide profile" });
  }
});

// DELETE /api/profiles/guides/:userId - Delete guide profile
router.delete("/guides/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteTangoGuideProfile(userId);
    res.status(204).send();
  } catch (error) {
    console.error("[SpecialtyProfiles] Error deleting guide profile:", error);
    res.status(500).json({ message: "Failed to delete guide profile" });
  }
});

// ============================================================================
// TAXI DANCER PROFILE ROUTES
// ============================================================================

// GET /api/profiles/taxi-dancers - Search taxi dancer profiles
router.get("/taxi-dancers", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      role,
      style,
      skillLevel,
      minRating,
      lastMinuteBookings,
      backgroundCheckVerified,
      limit = "20",
      offset = "0" 
    } = req.query;

    let query = db
      .select({
        id: taxiDancerProfiles.id,
        userId: taxiDancerProfiles.userId,
        displayName: taxiDancerProfiles.displayName,
        bio: taxiDancerProfiles.bio,
        tagline: taxiDancerProfiles.tagline,
        primaryRole: taxiDancerProfiles.primaryRole,
        canDanceBothRoles: taxiDancerProfiles.canDanceBothRoles,
        danceStyles: taxiDancerProfiles.danceStyles,
        skillLevel: taxiDancerProfiles.skillLevel,
        yearsOfDancing: taxiDancerProfiles.yearsOfDancing,
        yearsAsTaxiDancer: taxiDancerProfiles.yearsAsTaxiDancer,
        hourlyRate: taxiDancerProfiles.hourlyRate,
        eventRate: taxiDancerProfiles.eventRate,
        currency: taxiDancerProfiles.currency,
        lastMinuteBookings: taxiDancerProfiles.lastMinuteBookings,
        services: taxiDancerProfiles.services,
        photoUrls: taxiDancerProfiles.photoUrls,
        videoUrls: taxiDancerProfiles.videoUrls,
        averageRating: taxiDancerProfiles.averageRating,
        totalReviews: taxiDancerProfiles.totalReviews,
        totalBookings: taxiDancerProfiles.totalBookings,
        backgroundCheckDate: taxiDancerProfiles.backgroundCheckDate,
        isActive: taxiDancerProfiles.isActive,
        isVerified: taxiDancerProfiles.isVerified,
        userName: users.name,
        userProfileImage: users.profileImage,
      })
      .from(taxiDancerProfiles)
      .leftJoin(users, eq(taxiDancerProfiles.userId, users.id));

    const conditions: any[] = [eq(taxiDancerProfiles.isActive, true)];

    if (q && typeof q === 'string') {
      conditions.push(
        or(
          ilike(taxiDancerProfiles.displayName, `%${q}%`),
          ilike(taxiDancerProfiles.bio, `%${q}%`),
          ilike(users.name, `%${q}%`)
        )
      );
    }

    if (role && typeof role === 'string') {
      conditions.push(
        or(
          eq(taxiDancerProfiles.primaryRole, role),
          eq(taxiDancerProfiles.canDanceBothRoles, true)
        )
      );
    }

    if (style && typeof style === 'string') {
      conditions.push(sql`${style} = ANY(${taxiDancerProfiles.danceStyles})`);
    }

    if (skillLevel && typeof skillLevel === 'string') {
      conditions.push(eq(taxiDancerProfiles.skillLevel, skillLevel));
    }

    if (lastMinuteBookings === 'true') {
      conditions.push(eq(taxiDancerProfiles.lastMinuteBookings, true));
    }

    // Special validation: Background check verification
    if (backgroundCheckVerified === 'true') {
      conditions.push(sql`${taxiDancerProfiles.backgroundCheckDate} IS NOT NULL`);
      // Only show profiles with background check within last 2 years
      conditions.push(
        sql`${taxiDancerProfiles.backgroundCheckDate} >= NOW() - INTERVAL '2 years'`
      );
    }

    if (minRating && typeof minRating === 'string') {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(sql`${taxiDancerProfiles.averageRating} >= ${rating}`);
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(taxiDancerProfiles.averageRating))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[SpecialtyProfiles] Error searching taxi dancers:", error);
    res.status(500).json({ message: "Failed to search taxi dancers" });
  }
});

// GET /api/profiles/taxi-dancers/:userId - Get taxi dancer profile by user ID
router.get("/taxi-dancers/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getTaxiDancerProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Taxi dancer profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'taxi_dancer', viewerIp);
    }

    res.json(profile);
  } catch (error) {
    console.error("[SpecialtyProfiles] Error fetching taxi dancer profile:", error);
    res.status(500).json({ message: "Failed to fetch taxi dancer profile" });
  }
});

// PUT /api/profiles/taxi-dancers/:userId - Create or update taxi dancer profile
router.put("/taxi-dancers/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    // Special validation for taxi dancers: hourly rates & background check verification
    const validationSchema = insertTaxiDancerProfileSchema.extend({
      hourlyRate: z.number().min(0, "Hourly rate must be non-negative").optional(),
      eventRate: z.number().min(0, "Event rate must be non-negative").optional(),
      backgroundCheckDate: z.string().datetime().optional(),
    }).refine((data) => {
      // If hourly rate or event rate is provided, at least one must be set
      if (data.hourlyRate !== undefined || data.eventRate !== undefined) {
        return (data.hourlyRate && data.hourlyRate > 0) || (data.eventRate && data.eventRate > 0);
      }
      return true;
    }, {
      message: "At least one rate (hourly or event) must be specified and greater than zero",
      path: ["hourlyRate"],
    });

    const existingProfile = await storage.getTaxiDancerProfile(userId);
    
    if (!existingProfile) {
      const validatedData = validationSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const profile = await storage.createTaxiDancerProfile(validatedData);
      return res.status(201).json(profile);
    }

    const validatedData = validationSchema.partial().parse(req.body);
    const profile = await storage.updateTaxiDancerProfile(userId, validatedData);
    
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
    console.error("[SpecialtyProfiles] Error updating taxi dancer profile:", error);
    res.status(500).json({ message: "Failed to update taxi dancer profile" });
  }
});

// DELETE /api/profiles/taxi-dancers/:userId - Delete taxi dancer profile
router.delete("/taxi-dancers/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteTaxiDancerProfile(userId);
    res.status(204).send();
  } catch (error) {
    console.error("[SpecialtyProfiles] Error deleting taxi dancer profile:", error);
    res.status(500).json({ message: "Failed to delete taxi dancer profile" });
  }
});

// POST /api/profiles/taxi-dancers/:userId/background-check - Update background check date
router.post("/taxi-dancers/:userId/background-check", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const { checkDate } = req.body;
    
    if (!checkDate) {
      return res.status(400).json({ message: "Background check date is required" });
    }

    const profile = await storage.getTaxiDancerProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ message: "Taxi dancer profile not found" });
    }

    const updated = await storage.updateTaxiDancerProfile(userId, {
      backgroundCheckDate: new Date(checkDate),
    });

    res.json(updated);
  } catch (error) {
    console.error("[SpecialtyProfiles] Error updating background check:", error);
    res.status(500).json({ message: "Failed to update background check" });
  }
});

// ============================================================================
// CONTENT CREATOR, LEARNING RESOURCE, ORGANIZER PROFILE ROUTES
// (Keeping existing routes from original file)
// ============================================================================

// Content Creator routes
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
    console.error("[SpecialtyProfile] Error fetching content creator profile:", error);
    res.status(500).json({ message: "Failed to fetch content creator profile" });
  }
});

router.put("/content-creator/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    const existingProfile = await storage.getContentCreatorProfile(userId);
    
    if (existingProfile) {
      const updated = await storage.updateContentCreatorProfile(userId, req.body);
      return res.json(updated);
    } else {
      const validated = insertContentCreatorProfileSchema.omit({ id: true }).parse({
        ...req.body,
        userId
      });
      const created = await storage.createContentCreatorProfile(validated);
      return res.status(201).json(created);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("[SpecialtyProfile] Error updating content creator profile:", error);
    res.status(500).json({ message: "Failed to update content creator profile" });
  }
});

// Learning Resource routes
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
    console.error("[SpecialtyProfile] Error fetching learning resource profile:", error);
    res.status(500).json({ message: "Failed to fetch learning resource profile" });
  }
});

router.put("/learning-resource/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    const existingProfile = await storage.getLearningResourceProfile(userId);
    
    if (existingProfile) {
      const updated = await storage.updateLearningResourceProfile(userId, req.body);
      return res.json(updated);
    } else {
      const validated = insertLearningResourceProfileSchema.omit({ id: true }).parse({
        ...req.body,
        userId
      });
      const created = await storage.createLearningResourceProfile(validated);
      return res.status(201).json(created);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("[SpecialtyProfile] Error updating learning resource profile:", error);
    res.status(500).json({ message: "Failed to update learning resource profile" });
  }
});

// Organizer routes
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
    console.error("[SpecialtyProfile] Error fetching organizer profile:", error);
    res.status(500).json({ message: "Failed to fetch organizer profile" });
  }
});

router.put("/organizer/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    const existingProfile = await storage.getOrganizerProfile(userId);
    
    if (existingProfile) {
      const updated = await storage.updateOrganizerProfile(userId, req.body);
      return res.json(updated);
    } else {
      const validated = insertOrganizerProfileSchema.omit({ id: true }).parse({
        ...req.body,
        userId
      });
      const created = await storage.createOrganizerProfile(validated);
      return res.status(201).json(created);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("[SpecialtyProfile] Error updating organizer profile:", error);
    res.status(500).json({ message: "Failed to update organizer profile" });
  }
});

export default router;
