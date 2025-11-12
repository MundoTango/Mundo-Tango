/**
 * BATCH 08: Content/Organizer Profile API Routes
 * 
 * Handles CRUD operations for content and organizer profiles:
 * - Content Creators (platform links, metrics tracking, collaboration status)
 * - Learning Resources (course materials, certificate generation)
 * - Organizers (event portfolio, testimonials, service packages)
 * 
 * Special Features:
 * - Platform link validation
 * - Collaboration rate management
 * - Testimonial system
 * - Event portfolio tracking
 */

import { Router, type Response } from "express";
import { storage } from "../storage";
import { db } from "@shared/db";
import {
  contentCreatorProfiles,
  learningResourceProfiles,
  organizerProfiles,
  users,
  reviews,
  insertContentCreatorProfileSchema,
  insertLearningResourceProfileSchema,
  insertOrganizerProfileSchema,
  type SelectContentCreatorProfile,
  type SelectLearningResourceProfile,
  type SelectOrganizerProfile,
} from "@shared/schema";
import { eq, and, desc, sql, ilike, gte, lte } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const platformSchema = z.object({
  name: z.string().min(1, "Platform name required"),
  handle: z.string().min(1, "Handle required"),
  url: z.string().url("Valid URL required"),
  followers: z.number().optional(),
});

const collaborationRateSchema = z.object({
  type: z.string().min(1, "Type required"),
  price: z.number().positive("Price must be positive"),
  description: z.string().min(1, "Description required"),
});

const resourceSchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().min(1, "Description required"),
  type: z.string().min(1, "Type required"),
  level: z.string().min(1, "Level required"),
  price: z.number().nonnegative("Price must be non-negative"),
  duration: z.string().optional(),
  lessons: z.number().optional(),
  url: z.string().url().optional(),
  thumbnail: z.string().optional(),
});

const testimonialSchema = z.object({
  name: z.string().min(1, "Name required"),
  role: z.string().optional(),
  quote: z.string().min(1, "Quote required"),
  event: z.string().optional(),
});

const pastEventSchema = z.object({
  name: z.string().min(1, "Event name required"),
  type: z.string().min(1, "Event type required"),
  date: z.string().min(1, "Date required"),
  location: z.string().min(1, "Location required"),
  attendees: z.number().optional(),
  description: z.string().optional(),
});

// ============================================================================
// CONTENT CREATOR PROFILE ROUTES
// ============================================================================

// GET /api/profiles/content-creators - List all content creators with filters
router.get("/content-creators", async (req, res: Response) => {
  try {
    const {
      contentType,
      platform,
      minFollowers,
      openToCollaboration,
      verified,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        profile: contentCreatorProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(contentCreatorProfiles)
      .leftJoin(users, eq(contentCreatorProfiles.userId, users.id))
      .$dynamic();

    const conditions = [eq(contentCreatorProfiles.isActive, true)];

    // Filter by content type
    if (contentType && typeof contentType === "string") {
      const typeList = contentType.split(",").map(t => t.trim());
      conditions.push(
        sql`${contentCreatorProfiles.contentTypes} && ARRAY[${sql.join(typeList.map(t => sql`${t}`), sql`, `)}]::text[]`
      );
    }

    // Filter by minimum followers
    if (minFollowers && typeof minFollowers === "string") {
      const followers = parseInt(minFollowers);
      if (!isNaN(followers)) {
        conditions.push(gte(contentCreatorProfiles.totalFollowers, followers));
      }
    }

    // Filter by collaboration availability
    if (openToCollaboration === "true") {
      conditions.push(eq(contentCreatorProfiles.openToCollaboration, true));
    }

    // Filter by verified status
    if (verified === "true") {
      conditions.push(eq(contentCreatorProfiles.isVerified, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const results = await query
      .orderBy(desc(contentCreatorProfiles.totalFollowers))
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
    console.error("[ContentProfile] Error listing content creators:", error);
    res.status(500).json({ message: "Failed to list content creators" });
  }
});

// GET /api/profiles/content-creators/:userId - Get content creator profile by user ID
router.get("/content-creators/:userId", async (req: any, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const result = await db
      .select({
        profile: contentCreatorProfiles,
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
      .from(contentCreatorProfiles)
      .leftJoin(users, eq(contentCreatorProfiles.userId, users.id))
      .where(eq(contentCreatorProfiles.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Content creator profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'content_creator', viewerIp);
    }

    res.json({
      ...result[0].profile,
      user: result[0].user,
    });
  } catch (error) {
    console.error("[ContentProfile] Error fetching content creator profile:", error);
    res.status(500).json({ message: "Failed to fetch content creator profile" });
  }
});

// POST /api/profiles/content-creators - Create content creator profile
router.post("/content-creators", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Validate platforms if provided
    if (req.body.platforms) {
      const platformsValidation = z.array(platformSchema).safeParse(req.body.platforms);
      if (!platformsValidation.success) {
        return res.status(400).json({
          message: "Invalid platform data",
          errors: platformsValidation.error.errors
        });
      }
    }

    // Validate collaboration rates if provided
    if (req.body.collaborationRates) {
      const ratesValidation = z.array(collaborationRateSchema).safeParse(req.body.collaborationRates);
      if (!ratesValidation.success) {
        return res.status(400).json({
          message: "Invalid collaboration rate data",
          errors: ratesValidation.error.errors
        });
      }
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
    console.error("[ContentProfile] Error creating content creator profile:", error);
    res.status(500).json({ message: "Failed to create content creator profile" });
  }
});

// PUT /api/profiles/content-creators/:userId - Update content creator profile
router.put("/content-creators/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    // Validate platforms if provided
    if (req.body.platforms) {
      const platformsValidation = z.array(platformSchema).safeParse(req.body.platforms);
      if (!platformsValidation.success) {
        return res.status(400).json({
          message: "Invalid platform data",
          errors: platformsValidation.error.errors
        });
      }
    }

    // Validate collaboration rates if provided
    if (req.body.collaborationRates) {
      const ratesValidation = z.array(collaborationRateSchema).safeParse(req.body.collaborationRates);
      if (!ratesValidation.success) {
        return res.status(400).json({
          message: "Invalid collaboration rate data",
          errors: ratesValidation.error.errors
        });
      }
    }

    const profile = await storage.updateContentCreatorProfile(userId, req.body);
    
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
    console.error("[ContentProfile] Error updating content creator profile:", error);
    res.status(500).json({ message: "Failed to update content creator profile" });
  }
});

// DELETE /api/profiles/content-creators/:userId - Delete content creator profile
router.delete("/content-creators/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteContentCreatorProfile(userId);
    res.json({ success: true, message: "Content creator profile deleted" });
  } catch (error) {
    console.error("[ContentProfile] Error deleting content creator profile:", error);
    res.status(500).json({ message: "Failed to delete content creator profile" });
  }
});

// GET /api/profiles/content-creators/:userId/reviews - Get content creator reviews
router.get("/content-creators/:userId/reviews", async (req, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const creatorReviews = await db
      .select({
        review: reviews,
        reviewer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
        }
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(
        and(
          eq(reviews.targetType, 'content_creator'),
          eq(reviews.targetId, userId)
        )
      )
      .orderBy(desc(reviews.createdAt));

    res.json({
      success: true,
      reviews: creatorReviews.map(r => ({
        ...r.review,
        reviewer: r.reviewer,
      })),
    });
  } catch (error) {
    console.error("[ContentProfile] Error fetching content creator reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// ============================================================================
// LEARNING RESOURCE PROFILE ROUTES
// ============================================================================

// GET /api/profiles/learning-resources - List all learning resources with filters
router.get("/learning-resources", async (req, res: Response) => {
  try {
    const {
      courseType,
      level,
      format,
      priceRange,
      includesCertificate,
      offersFreeTrial,
      minRating,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        profile: learningResourceProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(learningResourceProfiles)
      .leftJoin(users, eq(learningResourceProfiles.userId, users.id))
      .$dynamic();

    const conditions = [eq(learningResourceProfiles.isActive, true)];

    // Filter by course type
    if (courseType && typeof courseType === "string") {
      const typeList = courseType.split(",").map(t => t.trim());
      conditions.push(
        sql`${learningResourceProfiles.courseTypes} && ARRAY[${sql.join(typeList.map(t => sql`${t}`), sql`, `)}]::text[]`
      );
    }

    // Filter by level
    if (level && typeof level === "string") {
      const levelList = level.split(",").map(l => l.trim());
      conditions.push(
        sql`${learningResourceProfiles.levels} && ARRAY[${sql.join(levelList.map(l => sql`${l}`), sql`, `)}]::text[]`
      );
    }

    // Filter by format
    if (format && typeof format === "string") {
      const formatList = format.split(",").map(f => f.trim());
      conditions.push(
        sql`${learningResourceProfiles.formats} && ARRAY[${sql.join(formatList.map(f => sql`${f}`), sql`, `)}]::text[]`
      );
    }

    // Filter by price range
    if (priceRange && typeof priceRange === "string") {
      conditions.push(eq(learningResourceProfiles.priceRange, priceRange));
    }

    // Filter by certificate availability
    if (includesCertificate === "true") {
      conditions.push(eq(learningResourceProfiles.includesCertificate, true));
    }

    // Filter by free trial
    if (offersFreeTrial === "true") {
      conditions.push(eq(learningResourceProfiles.offersFreeTrial, true));
    }

    // Filter by minimum rating
    if (minRating && typeof minRating === "string") {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(gte(learningResourceProfiles.averageRating, rating));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const results = await query
      .orderBy(desc(learningResourceProfiles.averageRating))
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
    console.error("[ContentProfile] Error listing learning resources:", error);
    res.status(500).json({ message: "Failed to list learning resources" });
  }
});

// GET /api/profiles/learning-resources/:userId - Get learning resource profile by user ID
router.get("/learning-resources/:userId", async (req: any, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const result = await db
      .select({
        profile: learningResourceProfiles,
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
      .from(learningResourceProfiles)
      .leftJoin(users, eq(learningResourceProfiles.userId, users.id))
      .where(eq(learningResourceProfiles.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Learning resource profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'learning_resource', viewerIp);
    }

    res.json({
      ...result[0].profile,
      user: result[0].user,
    });
  } catch (error) {
    console.error("[ContentProfile] Error fetching learning resource profile:", error);
    res.status(500).json({ message: "Failed to fetch learning resource profile" });
  }
});

// POST /api/profiles/learning-resources - Create learning resource profile
router.post("/learning-resources", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Validate resources if provided
    if (req.body.resources) {
      const resourcesValidation = z.array(resourceSchema).safeParse(req.body.resources);
      if (!resourcesValidation.success) {
        return res.status(400).json({
          message: "Invalid resource data",
          errors: resourcesValidation.error.errors
        });
      }
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
    console.error("[ContentProfile] Error creating learning resource profile:", error);
    res.status(500).json({ message: "Failed to create learning resource profile" });
  }
});

// PUT /api/profiles/learning-resources/:userId - Update learning resource profile
router.put("/learning-resources/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    // Validate resources if provided
    if (req.body.resources) {
      const resourcesValidation = z.array(resourceSchema).safeParse(req.body.resources);
      if (!resourcesValidation.success) {
        return res.status(400).json({
          message: "Invalid resource data",
          errors: resourcesValidation.error.errors
        });
      }
    }

    const profile = await storage.updateLearningResourceProfile(userId, req.body);
    
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
    console.error("[ContentProfile] Error updating learning resource profile:", error);
    res.status(500).json({ message: "Failed to update learning resource profile" });
  }
});

// DELETE /api/profiles/learning-resources/:userId - Delete learning resource profile
router.delete("/learning-resources/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteLearningResourceProfile(userId);
    res.json({ success: true, message: "Learning resource profile deleted" });
  } catch (error) {
    console.error("[ContentProfile] Error deleting learning resource profile:", error);
    res.status(500).json({ message: "Failed to delete learning resource profile" });
  }
});

// GET /api/profiles/learning-resources/:userId/reviews - Get learning resource reviews
router.get("/learning-resources/:userId/reviews", async (req, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const resourceReviews = await db
      .select({
        review: reviews,
        reviewer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
        }
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(
        and(
          eq(reviews.targetType, 'learning_resource'),
          eq(reviews.targetId, userId)
        )
      )
      .orderBy(desc(reviews.createdAt));

    res.json({
      success: true,
      reviews: resourceReviews.map(r => ({
        ...r.review,
        reviewer: r.reviewer,
      })),
    });
  } catch (error) {
    console.error("[ContentProfile] Error fetching learning resource reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// ============================================================================
// ORGANIZER PROFILE ROUTES
// ============================================================================

// GET /api/profiles/organizers - List all organizers with filters
router.get("/organizers", async (req, res: Response) => {
  try {
    const {
      eventType,
      eventSize,
      city,
      specialty,
      willingToTravel,
      verified,
      minRating,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        profile: organizerProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(organizerProfiles)
      .leftJoin(users, eq(organizerProfiles.userId, users.id))
      .$dynamic();

    const conditions = [eq(organizerProfiles.isActive, true)];

    // Filter by event type
    if (eventType && typeof eventType === "string") {
      const typeList = eventType.split(",").map(t => t.trim());
      conditions.push(
        sql`${organizerProfiles.eventTypesOrganized} && ARRAY[${sql.join(typeList.map(t => sql`${t}`), sql`, `)}]::text[]`
      );
    }

    // Filter by event size
    if (eventSize && typeof eventSize === "string") {
      const sizeList = eventSize.split(",").map(s => s.trim());
      conditions.push(
        sql`${organizerProfiles.eventSizes} && ARRAY[${sql.join(sizeList.map(s => sql`${s}`), sql`, `)}]::text[]`
      );
    }

    // Filter by city
    if (city && typeof city === "string") {
      conditions.push(ilike(organizerProfiles.city, `%${city}%`));
    }

    // Filter by specialty
    if (specialty && typeof specialty === "string") {
      const specialtyList = specialty.split(",").map(s => s.trim());
      conditions.push(
        sql`${organizerProfiles.specialties} && ARRAY[${sql.join(specialtyList.map(s => sql`${s}`), sql`, `)}]::text[]`
      );
    }

    // Filter by travel willingness
    if (willingToTravel === "true") {
      conditions.push(eq(organizerProfiles.willingToTravel, true));
    }

    // Filter by verified status
    if (verified === "true") {
      conditions.push(eq(organizerProfiles.isVerified, true));
    }

    // Filter by minimum rating
    if (minRating && typeof minRating === "string") {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(gte(organizerProfiles.averageRating, rating));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const results = await query
      .orderBy(desc(organizerProfiles.averageRating))
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
    console.error("[ContentProfile] Error listing organizers:", error);
    res.status(500).json({ message: "Failed to list organizers" });
  }
});

// GET /api/profiles/organizers/:userId - Get organizer profile by user ID
router.get("/organizers/:userId", async (req: any, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const result = await db
      .select({
        profile: organizerProfiles,
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
      .from(organizerProfiles)
      .leftJoin(users, eq(organizerProfiles.userId, users.id))
      .where(eq(organizerProfiles.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Organizer profile not found" });
    }

    // Track profile view
    const viewerId = req.userId || null;
    const viewerIp = req.ip || req.socket?.remoteAddress || null;
    if (viewerId !== userId) {
      await storage.trackProfileView(viewerId, userId, 'organizer', viewerIp);
    }

    res.json({
      ...result[0].profile,
      user: result[0].user,
    });
  } catch (error) {
    console.error("[ContentProfile] Error fetching organizer profile:", error);
    res.status(500).json({ message: "Failed to fetch organizer profile" });
  }
});

// POST /api/profiles/organizers - Create organizer profile
router.post("/organizers", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Validate testimonials if provided
    if (req.body.testimonials) {
      const testimonialsValidation = z.array(testimonialSchema).safeParse(req.body.testimonials);
      if (!testimonialsValidation.success) {
        return res.status(400).json({
          message: "Invalid testimonial data",
          errors: testimonialsValidation.error.errors
        });
      }
    }

    // Validate past events if provided
    if (req.body.pastEvents) {
      const eventsValidation = z.array(pastEventSchema).safeParse(req.body.pastEvents);
      if (!eventsValidation.success) {
        return res.status(400).json({
          message: "Invalid past event data",
          errors: eventsValidation.error.errors
        });
      }
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
    console.error("[ContentProfile] Error creating organizer profile:", error);
    res.status(500).json({ message: "Failed to create organizer profile" });
  }
});

// PUT /api/profiles/organizers/:userId - Update organizer profile
router.put("/organizers/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    // Validate testimonials if provided
    if (req.body.testimonials) {
      const testimonialsValidation = z.array(testimonialSchema).safeParse(req.body.testimonials);
      if (!testimonialsValidation.success) {
        return res.status(400).json({
          message: "Invalid testimonial data",
          errors: testimonialsValidation.error.errors
        });
      }
    }

    // Validate past events if provided
    if (req.body.pastEvents) {
      const eventsValidation = z.array(pastEventSchema).safeParse(req.body.pastEvents);
      if (!eventsValidation.success) {
        return res.status(400).json({
          message: "Invalid past event data",
          errors: eventsValidation.error.errors
        });
      }
    }

    const profile = await storage.updateOrganizerProfile(userId, req.body);
    
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
    console.error("[ContentProfile] Error updating organizer profile:", error);
    res.status(500).json({ message: "Failed to update organizer profile" });
  }
});

// DELETE /api/profiles/organizers/:userId - Delete organizer profile
router.delete("/organizers/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await storage.deleteOrganizerProfile(userId);
    res.json({ success: true, message: "Organizer profile deleted" });
  } catch (error) {
    console.error("[ContentProfile] Error deleting organizer profile:", error);
    res.status(500).json({ message: "Failed to delete organizer profile" });
  }
});

// GET /api/profiles/organizers/:userId/reviews - Get organizer reviews
router.get("/organizers/:userId/reviews", async (req, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const organizerReviews = await db
      .select({
        review: reviews,
        reviewer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
        }
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(
        and(
          eq(reviews.targetType, 'organizer'),
          eq(reviews.targetId, userId)
        )
      )
      .orderBy(desc(reviews.createdAt));

    res.json({
      success: true,
      reviews: organizerReviews.map(r => ({
        ...r.review,
        reviewer: r.reviewer,
      })),
    });
  } catch (error) {
    console.error("[ContentProfile] Error fetching organizer reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

export default router;
