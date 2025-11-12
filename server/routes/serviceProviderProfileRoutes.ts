import { Router, type Response } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { db } from "@shared/db";
import { eq, and, or, ilike, inArray, sql, desc } from "drizzle-orm";
import {
  photographerProfiles,
  performerProfiles,
  vendorProfiles,
  choreographerProfiles,
  tangoSchoolProfiles,
  tangoHotelProfiles,
  hostVenueProfiles,
  users,
  insertPhotographerProfileSchema,
  insertPerformerProfileSchema,
  insertVendorProfileSchema,
  insertChoreographerProfileSchema,
  insertTangoSchoolProfileSchema,
  insertTangoHotelProfileSchema,
  insertHostVenueProfileSchema,
} from "@shared/schema";
import { z } from "zod";

const router = Router();

// ============================================================================
// BATCH 05-06: SERVICE PROVIDER + BUSINESS PROFILE API ENDPOINTS
// ============================================================================

// ============================================================================
// PHOTOGRAPHER PROFILE ROUTES
// ============================================================================

// GET /api/profile/:userId/photographer - Get photographer profile by user ID
router.get("/profile/:userId/photographer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getPhotographerProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Photographer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[ServiceProvider] Error fetching photographer profile:", error);
    res.status(500).json({ message: "Failed to fetch photographer profile" });
  }
});

// PUT /api/profile/:userId/photographer - Update photographer profile
router.put("/profile/:userId/photographer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership - user can only update their own profile
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const existingProfile = await storage.getPhotographerProfile(userId);
    
    // If profile doesn't exist, create it
    if (!existingProfile) {
      const validatedData = insertPhotographerProfileSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const profile = await storage.createPhotographerProfile(validatedData);
      return res.status(201).json(profile);
    }

    const profile = await storage.updatePhotographerProfile(userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Photographer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ServiceProvider] Error updating photographer profile:", error);
    res.status(500).json({ message: "Failed to update photographer profile" });
  }
});

// GET /api/photographers/search - Search photographers
router.get("/photographers/search", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      specialty, 
      city, 
      minRating,
      limit = "20",
      offset = "0" 
    } = req.query;

    let query = db
      .select({
        id: photographerProfiles.id,
        userId: photographerProfiles.userId,
        businessName: photographerProfiles.businessName,
        bio: photographerProfiles.bio,
        specialties: photographerProfiles.specialties,
        photoUrls: photographerProfiles.photoUrls,
        portfolioUrl: photographerProfiles.portfolioUrl,
        averageRating: photographerProfiles.averageRating,
        reviewCount: photographerProfiles.reviewCount,
        coverageAreas: photographerProfiles.coverageAreas,
        willingToTravel: photographerProfiles.willingToTravel,
        hourlyRate: photographerProfiles.hourlyRate,
        eventRate: photographerProfiles.eventRate,
        currency: photographerProfiles.currency,
        isActive: photographerProfiles.isActive,
        isVerified: photographerProfiles.isVerified,
        userName: users.name,
        userProfileImage: users.profileImage,
      })
      .from(photographerProfiles)
      .leftJoin(users, eq(photographerProfiles.userId, users.id))
      .where(eq(photographerProfiles.isActive, true));

    const conditions: any[] = [eq(photographerProfiles.isActive, true)];

    if (q && typeof q === 'string') {
      conditions.push(
        or(
          ilike(photographerProfiles.businessName, `%${q}%`),
          ilike(photographerProfiles.bio, `%${q}%`),
          ilike(users.name, `%${q}%`)
        )
      );
    }

    if (specialty && typeof specialty === 'string') {
      conditions.push(sql`${specialty} = ANY(${photographerProfiles.specialties})`);
    }

    if (city && typeof city === 'string') {
      conditions.push(sql`${city} = ANY(${photographerProfiles.coverageAreas})`);
    }

    if (minRating && typeof minRating === 'string') {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(sql`${photographerProfiles.averageRating} >= ${rating}`);
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(photographerProfiles.averageRating))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[ServiceProvider] Error searching photographers:", error);
    res.status(500).json({ message: "Failed to search photographers" });
  }
});

// POST /api/profile/:userId/photographer/portfolio - Add portfolio item
router.post("/profile/:userId/photographer/portfolio", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const { photoUrl } = req.body;
    
    if (!photoUrl || typeof photoUrl !== 'string') {
      return res.status(400).json({ message: "Photo URL is required" });
    }

    const profile = await storage.getPhotographerProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ message: "Photographer profile not found" });
    }

    const currentPhotos = profile.photoUrls || [];
    const updatedPhotos = [...currentPhotos, photoUrl];

    const updated = await storage.updatePhotographerProfile(userId, {
      photoUrls: updatedPhotos
    });

    res.json(updated);
  } catch (error) {
    console.error("[ServiceProvider] Error adding portfolio item:", error);
    res.status(500).json({ message: "Failed to add portfolio item" });
  }
});

// DELETE /api/profile/:userId/photographer/portfolio/:itemId - Remove portfolio item
router.delete("/profile/:userId/photographer/portfolio/:itemId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const itemId = parseInt(req.params.itemId);
    
    if (isNaN(userId) || isNaN(itemId) || !req.userId) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const profile = await storage.getPhotographerProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ message: "Photographer profile not found" });
    }

    const currentPhotos = profile.photoUrls || [];
    
    if (itemId < 0 || itemId >= currentPhotos.length) {
      return res.status(404).json({ message: "Portfolio item not found" });
    }

    const updatedPhotos = currentPhotos.filter((_, index) => index !== itemId);

    const updated = await storage.updatePhotographerProfile(userId, {
      photoUrls: updatedPhotos
    });

    res.json(updated);
  } catch (error) {
    console.error("[ServiceProvider] Error removing portfolio item:", error);
    res.status(500).json({ message: "Failed to remove portfolio item" });
  }
});

// ============================================================================
// PERFORMER PROFILE ROUTES
// ============================================================================

// GET /api/profile/:userId/performer - Get performer profile by user ID
router.get("/profile/:userId/performer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getPerformerProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Performer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[ServiceProvider] Error fetching performer profile:", error);
    res.status(500).json({ message: "Failed to fetch performer profile" });
  }
});

// PUT /api/profile/:userId/performer - Update performer profile
router.put("/profile/:userId/performer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const existingProfile = await storage.getPerformerProfile(userId);
    
    if (!existingProfile) {
      const validatedData = insertPerformerProfileSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const profile = await storage.createPerformerProfile(validatedData);
      return res.status(201).json(profile);
    }

    const profile = await storage.updatePerformerProfile(userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Performer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ServiceProvider] Error updating performer profile:", error);
    res.status(500).json({ message: "Failed to update performer profile" });
  }
});

// GET /api/performers/search - Search performers
router.get("/performers/search", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      performanceType, 
      style,
      minRating,
      limit = "20",
      offset = "0" 
    } = req.query;

    let query = db
      .select({
        id: performerProfiles.id,
        userId: performerProfiles.userId,
        stageName: performerProfiles.stageName,
        bio: performerProfiles.bio,
        performanceTypes: performerProfiles.performanceTypes,
        styles: performerProfiles.styles,
        demoVideoUrls: performerProfiles.demoVideoUrls,
        photoUrls: performerProfiles.photoUrls,
        averageRating: performerProfiles.averageRating,
        reviewCount: performerProfiles.reviewCount,
        performanceFee: performerProfiles.performanceFee,
        currency: performerProfiles.currency,
        requiresPartner: performerProfiles.requiresPartner,
        partnerName: performerProfiles.partnerName,
        isActive: performerProfiles.isActive,
        isVerified: performerProfiles.isVerified,
        userName: users.name,
        userProfileImage: users.profileImage,
      })
      .from(performerProfiles)
      .leftJoin(users, eq(performerProfiles.userId, users.id))
      .where(eq(performerProfiles.isActive, true));

    const conditions: any[] = [eq(performerProfiles.isActive, true)];

    if (q && typeof q === 'string') {
      conditions.push(
        or(
          ilike(performerProfiles.stageName, `%${q}%`),
          ilike(performerProfiles.bio, `%${q}%`),
          ilike(users.name, `%${q}%`)
        )
      );
    }

    if (performanceType && typeof performanceType === 'string') {
      conditions.push(sql`${performanceType} = ANY(${performerProfiles.performanceTypes})`);
    }

    if (style && typeof style === 'string') {
      conditions.push(sql`${style} = ANY(${performerProfiles.styles})`);
    }

    if (minRating && typeof minRating === 'string') {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(sql`${performerProfiles.averageRating} >= ${rating}`);
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(performerProfiles.averageRating))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[ServiceProvider] Error searching performers:", error);
    res.status(500).json({ message: "Failed to search performers" });
  }
});

// POST /api/profile/:userId/performer/videos - Add video
router.post("/profile/:userId/performer/videos", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const { videoUrl } = req.body;
    
    if (!videoUrl || typeof videoUrl !== 'string') {
      return res.status(400).json({ message: "Video URL is required" });
    }

    const profile = await storage.getPerformerProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ message: "Performer profile not found" });
    }

    const currentVideos = profile.demoVideoUrls || [];
    const updatedVideos = [...currentVideos, videoUrl];

    const updated = await storage.updatePerformerProfile(userId, {
      demoVideoUrls: updatedVideos
    });

    res.json(updated);
  } catch (error) {
    console.error("[ServiceProvider] Error adding video:", error);
    res.status(500).json({ message: "Failed to add video" });
  }
});

// ============================================================================
// VENDOR PROFILE ROUTES
// ============================================================================

// GET /api/profile/:userId/vendor - Get vendor profile by user ID
router.get("/profile/:userId/vendor", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getVendorProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[ServiceProvider] Error fetching vendor profile:", error);
    res.status(500).json({ message: "Failed to fetch vendor profile" });
  }
});

// PUT /api/profile/:userId/vendor - Update vendor profile
router.put("/profile/:userId/vendor", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const existingProfile = await storage.getVendorProfile(userId);
    
    if (!existingProfile) {
      const validatedData = insertVendorProfileSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const profile = await storage.createVendorProfile(validatedData);
      return res.status(201).json(profile);
    }

    const profile = await storage.updateVendorProfile(userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ServiceProvider] Error updating vendor profile:", error);
    res.status(500).json({ message: "Failed to update vendor profile" });
  }
});

// GET /api/vendors/search - Search vendors
router.get("/vendors/search", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      category,
      city,
      minRating,
      limit = "20",
      offset = "0" 
    } = req.query;

    let query = db
      .select({
        id: vendorProfiles.id,
        userId: vendorProfiles.userId,
        businessName: vendorProfiles.businessName,
        bio: vendorProfiles.bio,
        productCategories: vendorProfiles.productCategories,
        servicesOffered: vendorProfiles.servicesOffered,
        photoUrls: vendorProfiles.photoUrls,
        priceRange: vendorProfiles.priceRange,
        averageRating: vendorProfiles.averageRating,
        reviewCount: vendorProfiles.reviewCount,
        hasPhysicalStore: vendorProfiles.hasPhysicalStore,
        storeAddress: vendorProfiles.storeAddress,
        websiteUrl: vendorProfiles.websiteUrl,
        shopUrl: vendorProfiles.shopUrl,
        isActive: vendorProfiles.isActive,
        isVerified: vendorProfiles.isVerified,
        userName: users.name,
        userProfileImage: users.profileImage,
      })
      .from(vendorProfiles)
      .leftJoin(users, eq(vendorProfiles.userId, users.id))
      .where(eq(vendorProfiles.isActive, true));

    const conditions: any[] = [eq(vendorProfiles.isActive, true)];

    if (q && typeof q === 'string') {
      conditions.push(
        or(
          ilike(vendorProfiles.businessName, `%${q}%`),
          ilike(vendorProfiles.bio, `%${q}%`)
        )
      );
    }

    if (category && typeof category === 'string') {
      conditions.push(sql`${category} = ANY(${vendorProfiles.productCategories})`);
    }

    if (city && typeof city === 'string') {
      conditions.push(ilike(vendorProfiles.storeAddress, `%${city}%`));
    }

    if (minRating && typeof minRating === 'string') {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(sql`${vendorProfiles.averageRating} >= ${rating}`);
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(vendorProfiles.averageRating))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[ServiceProvider] Error searching vendors:", error);
    res.status(500).json({ message: "Failed to search vendors" });
  }
});

// GET /api/vendors/categories - Get all vendor categories
router.get("/vendors/categories", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await db
      .select({
        category: sql<string>`unnest(${vendorProfiles.productCategories})`.as('category'),
        count: sql<number>`count(*)::int`.as('count'),
      })
      .from(vendorProfiles)
      .where(eq(vendorProfiles.isActive, true))
      .groupBy(sql`unnest(${vendorProfiles.productCategories})`)
      .orderBy(desc(sql`count(*)`));

    const categories = result.map(r => ({
      name: r.category,
      count: r.count
    }));

    res.json(categories);
  } catch (error) {
    console.error("[ServiceProvider] Error fetching vendor categories:", error);
    res.status(500).json({ message: "Failed to fetch vendor categories" });
  }
});

// ============================================================================
// CHOREOGRAPHER PROFILE ROUTES
// ============================================================================

// GET /api/profile/:userId/choreographer - Get choreographer profile by user ID
router.get("/profile/:userId/choreographer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getChoreographerProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Choreographer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[ServiceProvider] Error fetching choreographer profile:", error);
    res.status(500).json({ message: "Failed to fetch choreographer profile" });
  }
});

// PUT /api/profile/:userId/choreographer - Update choreographer profile
router.put("/profile/:userId/choreographer", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const existingProfile = await storage.getChoreographerProfile(userId);
    
    if (!existingProfile) {
      const validatedData = insertChoreographerProfileSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const profile = await storage.createChoreographerProfile(validatedData);
      return res.status(201).json(profile);
    }

    const profile = await storage.updateChoreographerProfile(userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Choreographer profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ServiceProvider] Error updating choreographer profile:", error);
    res.status(500).json({ message: "Failed to update choreographer profile" });
  }
});

// GET /api/choreographers/search - Search choreographers
router.get("/choreographers/search", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      style,
      minRating,
      limit = "20",
      offset = "0" 
    } = req.query;

    let query = db
      .select({
        id: choreographerProfiles.id,
        userId: choreographerProfiles.userId,
        bio: choreographerProfiles.bio,
        specializations: choreographerProfiles.specializations,
        styles: choreographerProfiles.styles,
        yearsExperience: choreographerProfiles.yearsExperience,
        photoUrls: choreographerProfiles.photoUrls,
        videoUrls: choreographerProfiles.videoUrls,
        averageRating: choreographerProfiles.averageRating,
        reviewCount: choreographerProfiles.reviewCount,
        hourlyRate: choreographerProfiles.hourlyRate,
        currency: choreographerProfiles.currency,
        isActive: choreographerProfiles.isActive,
        isVerified: choreographerProfiles.isVerified,
        userName: users.name,
        userProfileImage: users.profileImage,
      })
      .from(choreographerProfiles)
      .leftJoin(users, eq(choreographerProfiles.userId, users.id))
      .where(eq(choreographerProfiles.isActive, true));

    const conditions: any[] = [eq(choreographerProfiles.isActive, true)];

    if (q && typeof q === 'string') {
      conditions.push(
        or(
          ilike(choreographerProfiles.bio, `%${q}%`),
          ilike(users.name, `%${q}%`)
        )
      );
    }

    if (style && typeof style === 'string') {
      conditions.push(sql`${style} = ANY(${choreographerProfiles.styles})`);
    }

    if (minRating && typeof minRating === 'string') {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(sql`${choreographerProfiles.averageRating} >= ${rating}`);
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(choreographerProfiles.averageRating))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[ServiceProvider] Error searching choreographers:", error);
    res.status(500).json({ message: "Failed to search choreographers" });
  }
});

// ============================================================================
// TANGO SCHOOL ROUTES
// ============================================================================

// GET /api/profile/:userId/tango-school - Get tango school profile by user ID
router.get("/profile/:userId/tango-school", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getTangoSchoolProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Tango school profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[ServiceProvider] Error fetching tango school profile:", error);
    res.status(500).json({ message: "Failed to fetch tango school profile" });
  }
});

// PUT /api/profile/:userId/tango-school - Update tango school profile
router.put("/profile/:userId/tango-school", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const existingProfile = await storage.getTangoSchoolProfile(userId);
    
    if (!existingProfile) {
      const validatedData = insertTangoSchoolProfileSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const profile = await storage.createTangoSchoolProfile(validatedData);
      return res.status(201).json(profile);
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
    console.error("[ServiceProvider] Error updating tango school profile:", error);
    res.status(500).json({ message: "Failed to update tango school profile" });
  }
});

// GET /api/tango-schools/search - Search tango schools
router.get("/tango-schools/search", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      city,
      minRating,
      limit = "20",
      offset = "0" 
    } = req.query;

    let query = db
      .select({
        id: tangoSchoolProfiles.id,
        userId: tangoSchoolProfiles.userId,
        schoolName: tangoSchoolProfiles.schoolName,
        description: tangoSchoolProfiles.description,
        address: tangoSchoolProfiles.address,
        city: tangoSchoolProfiles.city,
        country: tangoSchoolProfiles.country,
        photoUrls: tangoSchoolProfiles.photoUrls,
        classTypes: tangoSchoolProfiles.classTypes,
        levels: tangoSchoolProfiles.levels,
        styles: tangoSchoolProfiles.styles,
        averageRating: tangoSchoolProfiles.averageRating,
        reviewCount: tangoSchoolProfiles.reviewCount,
        studentCapacity: tangoSchoolProfiles.studentCapacity,
        amenities: tangoSchoolProfiles.amenities,
        websiteUrl: tangoSchoolProfiles.websiteUrl,
        isActive: tangoSchoolProfiles.isActive,
        isVerified: tangoSchoolProfiles.isVerified,
        userName: users.name,
        userProfileImage: users.profileImage,
      })
      .from(tangoSchoolProfiles)
      .leftJoin(users, eq(tangoSchoolProfiles.userId, users.id))
      .where(eq(tangoSchoolProfiles.isActive, true));

    const conditions: any[] = [eq(tangoSchoolProfiles.isActive, true)];

    if (q && typeof q === 'string') {
      conditions.push(
        or(
          ilike(tangoSchoolProfiles.schoolName, `%${q}%`),
          ilike(tangoSchoolProfiles.description, `%${q}%`)
        )
      );
    }

    if (city && typeof city === 'string') {
      conditions.push(ilike(tangoSchoolProfiles.city, `%${city}%`));
    }

    if (minRating && typeof minRating === 'string') {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(sql`${tangoSchoolProfiles.averageRating} >= ${rating}`);
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(tangoSchoolProfiles.averageRating))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[ServiceProvider] Error searching tango schools:", error);
    res.status(500).json({ message: "Failed to search tango schools" });
  }
});

// GET /api/tango-schools/:id/schedule - Get tango school schedule
router.get("/tango-schools/:id/schedule", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid school ID" });
    }

    const profile = await db
      .select()
      .from(tangoSchoolProfiles)
      .where(eq(tangoSchoolProfiles.id, id))
      .limit(1);

    if (!profile || profile.length === 0) {
      return res.status(404).json({ message: "Tango school not found" });
    }

    // Return class schedule from packages field
    res.json({
      schoolId: id,
      schedule: profile[0].packages || []
    });
  } catch (error) {
    console.error("[ServiceProvider] Error fetching tango school schedule:", error);
    res.status(500).json({ message: "Failed to fetch schedule" });
  }
});

// PUT /api/tango-schools/:id/schedule - Update tango school schedule
router.put("/tango-schools/:id/schedule", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || !req.userId) {
      return res.status(400).json({ message: "Invalid school ID" });
    }

    const profile = await db
      .select()
      .from(tangoSchoolProfiles)
      .where(eq(tangoSchoolProfiles.id, id))
      .limit(1);

    if (!profile || profile.length === 0) {
      return res.status(404).json({ message: "Tango school not found" });
    }

    // Verify ownership
    if (profile[0].userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own schedule" });
    }

    const { schedule } = req.body;
    
    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({ message: "Schedule must be an array" });
    }

    const updated = await db
      .update(tangoSchoolProfiles)
      .set({ packages: schedule })
      .where(eq(tangoSchoolProfiles.id, id))
      .returning();

    res.json({
      schoolId: id,
      schedule: updated[0].packages || []
    });
  } catch (error) {
    console.error("[ServiceProvider] Error updating tango school schedule:", error);
    res.status(500).json({ message: "Failed to update schedule" });
  }
});

// ============================================================================
// TANGO HOTEL ROUTES
// ============================================================================

// GET /api/profile/:userId/tango-hotel - Get tango hotel profile by user ID
router.get("/profile/:userId/tango-hotel", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await storage.getTangoHotelProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "Tango hotel profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("[ServiceProvider] Error fetching tango hotel profile:", error);
    res.status(500).json({ message: "Failed to fetch tango hotel profile" });
  }
});

// PUT /api/profile/:userId/tango-hotel - Update tango hotel profile
router.put("/profile/:userId/tango-hotel", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const existingProfile = await storage.getTangoHotelProfile(userId);
    
    if (!existingProfile) {
      const validatedData = insertTangoHotelProfileSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const profile = await storage.createTangoHotelProfile(validatedData);
      return res.status(201).json(profile);
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
    console.error("[ServiceProvider] Error updating tango hotel profile:", error);
    res.status(500).json({ message: "Failed to update tango hotel profile" });
  }
});

// GET /api/tango-hotels/search - Search tango hotels
router.get("/tango-hotels/search", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      location,
      minRating,
      limit = "20",
      offset = "0" 
    } = req.query;

    let query = db
      .select({
        id: tangoHotelProfiles.id,
        userId: tangoHotelProfiles.userId,
        hotelName: tangoHotelProfiles.hotelName,
        description: tangoHotelProfiles.description,
        address: tangoHotelProfiles.address,
        city: tangoHotelProfiles.city,
        country: tangoHotelProfiles.country,
        photoUrls: tangoHotelProfiles.photoUrls,
        starRating: tangoHotelProfiles.starRating,
        averageRating: tangoHotelProfiles.averageRating,
        reviewCount: tangoHotelProfiles.reviewCount,
        totalRooms: tangoHotelProfiles.totalRooms,
        amenities: tangoHotelProfiles.amenities,
        tangoAmenities: tangoHotelProfiles.tangoAmenities,
        websiteUrl: tangoHotelProfiles.websiteUrl,
        isActive: tangoHotelProfiles.isActive,
        isVerified: tangoHotelProfiles.isVerified,
        userName: users.name,
        userProfileImage: users.profileImage,
      })
      .from(tangoHotelProfiles)
      .leftJoin(users, eq(tangoHotelProfiles.userId, users.id))
      .where(eq(tangoHotelProfiles.isActive, true));

    const conditions: any[] = [eq(tangoHotelProfiles.isActive, true)];

    if (q && typeof q === 'string') {
      conditions.push(
        or(
          ilike(tangoHotelProfiles.hotelName, `%${q}%`),
          ilike(tangoHotelProfiles.description, `%${q}%`)
        )
      );
    }

    if (location && typeof location === 'string') {
      conditions.push(
        or(
          ilike(tangoHotelProfiles.city, `%${location}%`),
          ilike(tangoHotelProfiles.address, `%${location}%`)
        )
      );
    }

    if (minRating && typeof minRating === 'string') {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(sql`${tangoHotelProfiles.averageRating} >= ${rating}`);
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(tangoHotelProfiles.averageRating))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[ServiceProvider] Error searching tango hotels:", error);
    res.status(500).json({ message: "Failed to search tango hotels" });
  }
});

// GET /api/tango-hotels/:id/rooms - Get tango hotel rooms
router.get("/tango-hotels/:id/rooms", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid hotel ID" });
    }

    const profile = await db
      .select()
      .from(tangoHotelProfiles)
      .where(eq(tangoHotelProfiles.id, id))
      .limit(1);

    if (!profile || profile.length === 0) {
      return res.status(404).json({ message: "Tango hotel not found" });
    }

    res.json({
      hotelId: id,
      rooms: profile[0].rooms || []
    });
  } catch (error) {
    console.error("[ServiceProvider] Error fetching tango hotel rooms:", error);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

// GET /api/tango-hotels/:id/packages - Get tango hotel packages
router.get("/tango-hotels/:id/packages", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid hotel ID" });
    }

    const profile = await db
      .select()
      .from(tangoHotelProfiles)
      .where(eq(tangoHotelProfiles.id, id))
      .limit(1);

    if (!profile || profile.length === 0) {
      return res.status(404).json({ message: "Tango hotel not found" });
    }

    res.json({
      hotelId: id,
      packages: profile[0].tangoPackages || []
    });
  } catch (error) {
    console.error("[ServiceProvider] Error fetching tango hotel packages:", error);
    res.status(500).json({ message: "Failed to fetch packages" });
  }
});

// ============================================================================
// HOST VENUE ROUTES
// ============================================================================

// GET /api/profile/:userId/host-venue - Get host venue profile by user ID
router.get("/profile/:userId/host-venue", authenticateToken, async (req: AuthRequest, res: Response) => {
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
    console.error("[ServiceProvider] Error fetching host venue profile:", error);
    res.status(500).json({ message: "Failed to fetch host venue profile" });
  }
});

// PUT /api/profile/:userId/host-venue - Update host venue profile
router.put("/profile/:userId/host-venue", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const existingProfile = await storage.getHostVenueProfile(userId);
    
    if (!existingProfile) {
      const validatedData = insertHostVenueProfileSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const profile = await storage.createHostVenueProfile(validatedData);
      return res.status(201).json(profile);
    }

    const profile = await storage.updateHostVenueProfile(userId, req.body);
    
    if (!profile) {
      return res.status(404).json({ message: "Host venue profile not found" });
    }

    res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("[ServiceProvider] Error updating host venue profile:", error);
    res.status(500).json({ message: "Failed to update host venue profile" });
  }
});

// GET /api/host-venues/search - Search host venues
router.get("/host-venues/search", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      q, 
      capacity,
      amenities,
      city,
      minRating,
      limit = "20",
      offset = "0" 
    } = req.query;

    let query = db
      .select({
        id: hostVenueProfiles.id,
        userId: hostVenueProfiles.userId,
        venueName: hostVenueProfiles.venueName,
        description: hostVenueProfiles.description,
        address: hostVenueProfiles.address,
        city: hostVenueProfiles.city,
        country: hostVenueProfiles.country,
        photoUrls: hostVenueProfiles.photoUrls,
        venueType: hostVenueProfiles.venueType,
        capacity: hostVenueProfiles.capacity,
        size: hostVenueProfiles.size,
        amenities: hostVenueProfiles.amenities,
        danceFloorType: hostVenueProfiles.danceFloorType,
        soundSystem: hostVenueProfiles.soundSystem,
        averageRating: hostVenueProfiles.averageRating,
        reviewCount: hostVenueProfiles.reviewCount,
        basePrice: hostVenueProfiles.basePrice,
        currency: hostVenueProfiles.currency,
        websiteUrl: hostVenueProfiles.websiteUrl,
        isActive: hostVenueProfiles.isActive,
        isVerified: hostVenueProfiles.isVerified,
        userName: users.name,
        userProfileImage: users.profileImage,
      })
      .from(hostVenueProfiles)
      .leftJoin(users, eq(hostVenueProfiles.userId, users.id))
      .where(eq(hostVenueProfiles.isActive, true));

    const conditions: any[] = [eq(hostVenueProfiles.isActive, true)];

    if (q && typeof q === 'string') {
      conditions.push(
        or(
          ilike(hostVenueProfiles.venueName, `%${q}%`),
          ilike(hostVenueProfiles.description, `%${q}%`)
        )
      );
    }

    if (capacity && typeof capacity === 'string') {
      const cap = parseInt(capacity);
      if (!isNaN(cap)) {
        conditions.push(sql`${hostVenueProfiles.capacity} >= ${cap}`);
      }
    }

    if (amenities && typeof amenities === 'string') {
      const amenitiesList = amenities.split(',').map(a => a.trim());
      for (const amenity of amenitiesList) {
        conditions.push(sql`${amenity} = ANY(${hostVenueProfiles.amenities})`);
      }
    }

    if (city && typeof city === 'string') {
      conditions.push(ilike(hostVenueProfiles.city, `%${city}%`));
    }

    if (minRating && typeof minRating === 'string') {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(sql`${hostVenueProfiles.averageRating} >= ${rating}`);
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(hostVenueProfiles.averageRating))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[ServiceProvider] Error searching host venues:", error);
    res.status(500).json({ message: "Failed to search host venues" });
  }
});

// GET /api/host-venues/:id/availability - Get host venue availability
router.get("/host-venues/:id/availability", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid venue ID" });
    }

    const profile = await db
      .select()
      .from(hostVenueProfiles)
      .where(eq(hostVenueProfiles.id, id))
      .limit(1);

    if (!profile || profile.length === 0) {
      return res.status(404).json({ message: "Host venue not found" });
    }

    res.json({
      venueId: id,
      availability: profile[0].availabilityCalendar || {}
    });
  } catch (error) {
    console.error("[ServiceProvider] Error fetching host venue availability:", error);
    res.status(500).json({ message: "Failed to fetch availability" });
  }
});

export default router;
