/**
 * BATCH 05: Service Provider Profile API Routes
 * 
 * Handles CRUD operations for service provider profiles:
 * - Photographers (portfolio, packages, equipment, rates)
 * - Performers (shows, competitions, achievements, videos)
 * - Vendors (products, services, inventory, shipping)
 * - Choreographers (styles, experience, rates, availability)
 * 
 * Special Features:
 * - Portfolio image upload (multipart/form-data)
 * - Package pricing validation
 * - Review integration
 * - Availability calendar
 */

import { Router, type Response } from "express";
import { db } from "@shared/db";
import {
  photographerProfiles,
  performerProfiles,
  vendorProfiles,
  choreographerProfiles,
  users,
  reviews,
  insertPhotographerProfileSchema,
  insertPerformerProfileSchema,
  insertVendorProfileSchema,
  insertChoreographerProfileSchema,
  type SelectPhotographerProfile,
  type SelectPerformerProfile,
  type SelectVendorProfile,
  type SelectChoreographerProfile,
} from "@shared/schema";
import { eq, and, desc, sql, ilike, gte, lte, inArray } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { z } from "zod";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const router = Router();

// ============================================================================
// MULTER CONFIGURATION FOR PORTFOLIO UPLOADS
// ============================================================================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for portfolio images
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP'));
    }
  }
});

// ============================================================================
// CLOUDINARY CONFIGURATION
// ============================================================================

if (process.env.CLOUDINARY_URL || 
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[ServiceProfile] Cloudinary configured');
} else {
  console.warn('[ServiceProfile] Cloudinary not configured - using base64 fallback');
}

/**
 * Upload portfolio image to Cloudinary or convert to base64
 */
async function uploadPortfolioImage(
  file: Express.Multer.File,
  folder: string = 'portfolios'
): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // Fallback to base64
    const base64 = file.buffer.toString('base64');
    return `data:${file.mimetype};base64,${base64}`;
  }

  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1920, height: 1920, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          resolve(result.secure_url);
        }
      );
      
      uploadStream.end(file.buffer);
    });
  } catch (error) {
    console.error('[ServiceProfile] Cloudinary upload failed:', error);
    const base64 = file.buffer.toString('base64');
    return `data:${file.mimetype};base64,${base64}`;
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const packageSchema = z.object({
  name: z.string().min(1, "Package name required"),
  description: z.string().min(1, "Package description required"),
  price: z.number().positive("Price must be positive"),
  hours: z.number().optional(),
  photos: z.number().optional(),
  includes: z.array(z.string()).optional(),
});

const availabilitySchema = z.record(z.object({
  available: z.boolean(),
  slots: z.array(z.object({
    start: z.string(),
    end: z.string(),
  })).optional(),
}));

// ============================================================================
// PHOTOGRAPHER PROFILE ROUTES
// ============================================================================

// GET /api/profiles/photographers - List all photographers with filters
router.get("/photographers", async (req, res: Response) => {
  try {
    const {
      specialty,
      city,
      minRate,
      maxRate,
      eventTypes,
      verified,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        profile: photographerProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(photographerProfiles)
      .leftJoin(users, eq(photographerProfiles.userId, users.id))
      .$dynamic();

    const conditions = [eq(photographerProfiles.isActive, true)];

    // Filter by specialty
    if (specialty && typeof specialty === "string") {
      const specialtyList = specialty.split(",").map(s => s.trim());
      conditions.push(
        sql`${photographerProfiles.specialties} && ARRAY[${sql.join(specialtyList.map(s => sql`${s}`), sql`, `)}]::text[]`
      );
    }

    // Filter by city
    if (city && typeof city === "string") {
      conditions.push(ilike(users.city, `%${city}%`));
    }

    // Filter by hourly rate range
    if (minRate && typeof minRate === "string") {
      const rate = parseFloat(minRate);
      if (!isNaN(rate)) {
        conditions.push(gte(photographerProfiles.hourlyRate, rate.toString()));
      }
    }

    if (maxRate && typeof maxRate === "string") {
      const rate = parseFloat(maxRate);
      if (!isNaN(rate)) {
        conditions.push(lte(photographerProfiles.hourlyRate, rate.toString()));
      }
    }

    // Filter by event types
    if (eventTypes && typeof eventTypes === "string") {
      const eventTypeList = eventTypes.split(",").map(e => e.trim());
      conditions.push(
        sql`${photographerProfiles.eventTypes} && ARRAY[${sql.join(eventTypeList.map(e => sql`${e}`), sql`, `)}]::text[]`
      );
    }

    // Filter by verified status
    if (verified === "true") {
      conditions.push(eq(photographerProfiles.isVerified, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const results = await query
      .orderBy(desc(photographerProfiles.averageRating))
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
    console.error("[ServiceProfile] Error listing photographers:", error);
    res.status(500).json({ message: "Failed to list photographers" });
  }
});

// POST /api/profiles/photographers - Create photographer profile
router.post("/photographers", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Validate packages if provided
    if (req.body.packages) {
      const packagesValidation = z.array(packageSchema).safeParse(req.body.packages);
      if (!packagesValidation.success) {
        return res.status(400).json({
          message: "Invalid package data",
          errors: packagesValidation.error.errors
        });
      }
    }

    const validatedData = insertPhotographerProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const [profile] = await db
      .insert(photographerProfiles)
      .values(validatedData)
      .returning();

    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }
    console.error("[ServiceProfile] Error creating photographer profile:", error);
    res.status(500).json({ message: "Failed to create photographer profile" });
  }
});

// PUT /api/profiles/photographers/:userId - Update photographer profile
router.put("/photographers/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    // Validate packages if provided
    if (req.body.packages) {
      const packagesValidation = z.array(packageSchema).safeParse(req.body.packages);
      if (!packagesValidation.success) {
        return res.status(400).json({
          message: "Invalid package data",
          errors: packagesValidation.error.errors
        });
      }
    }

    const [profile] = await db
      .update(photographerProfiles)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(photographerProfiles.userId, userId))
      .returning();

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
    console.error("[ServiceProfile] Error updating photographer profile:", error);
    res.status(500).json({ message: "Failed to update photographer profile" });
  }
});

// DELETE /api/profiles/photographers/:userId - Delete photographer profile
router.delete("/photographers/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Verify ownership
    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await db
      .delete(photographerProfiles)
      .where(eq(photographerProfiles.userId, userId));

    res.json({ success: true, message: "Photographer profile deleted" });
  } catch (error) {
    console.error("[ServiceProfile] Error deleting photographer profile:", error);
    res.status(500).json({ message: "Failed to delete photographer profile" });
  }
});

// POST /api/profiles/photographers/:userId/portfolio - Upload portfolio images
router.post(
  "/photographers/:userId/portfolio",
  authenticateToken,
  upload.array('images', 10),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const files = req.files as Express.Multer.File[];

      if (isNaN(userId) || !req.userId) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      if (userId !== req.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No images provided" });
      }

      // Upload all images
      const uploadPromises = files.map(file => 
        uploadPortfolioImage(file, `portfolios/photographer_${userId}`)
      );
      const imageUrls = await Promise.all(uploadPromises);

      // Get current profile
      const [profile] = await db
        .select()
        .from(photographerProfiles)
        .where(eq(photographerProfiles.userId, userId))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Append new images to existing gallery
      const currentGallery = profile.galleryImages || [];
      const updatedGallery = [...currentGallery, ...imageUrls];

      // Update profile with new gallery images
      const [updatedProfile] = await db
        .update(photographerProfiles)
        .set({
          galleryImages: updatedGallery,
          updatedAt: new Date(),
        })
        .where(eq(photographerProfiles.userId, userId))
        .returning();

      res.json({
        success: true,
        uploadedImages: imageUrls,
        profile: updatedProfile,
      });
    } catch (error) {
      console.error("[ServiceProfile] Error uploading portfolio images:", error);
      res.status(500).json({ message: "Failed to upload portfolio images" });
    }
  }
);

// GET /api/profiles/photographers/:userId/reviews - Get photographer reviews
router.get("/photographers/:userId/reviews", async (req, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const photographerReviews = await db
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
          eq(reviews.targetType, 'photographer'),
          eq(reviews.targetId, userId)
        )
      )
      .orderBy(desc(reviews.createdAt));

    res.json({
      success: true,
      reviews: photographerReviews.map(r => ({
        ...r.review,
        reviewer: r.reviewer,
      })),
    });
  } catch (error) {
    console.error("[ServiceProfile] Error fetching photographer reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// ============================================================================
// PERFORMER PROFILE ROUTES
// ============================================================================

// GET /api/profiles/performers - List all performers with filters
router.get("/performers", async (req, res: Response) => {
  try {
    const {
      performanceType,
      danceStyle,
      city,
      minRate,
      maxRate,
      verified,
      availableForShows,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        profile: performerProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(performerProfiles)
      .leftJoin(users, eq(performerProfiles.userId, users.id))
      .$dynamic();

    const conditions = [eq(performerProfiles.isActive, true)];

    // Filter by performance type
    if (performanceType && typeof performanceType === "string") {
      const typeList = performanceType.split(",").map(t => t.trim());
      conditions.push(
        sql`${performerProfiles.performanceTypes} && ARRAY[${sql.join(typeList.map(t => sql`${t}`), sql`, `)}]::text[]`
      );
    }

    // Filter by dance style
    if (danceStyle && typeof danceStyle === "string") {
      const styleList = danceStyle.split(",").map(s => s.trim());
      conditions.push(
        sql`${performerProfiles.danceStyles} && ARRAY[${sql.join(styleList.map(s => sql`${s}`), sql`, `)}]::text[]`
      );
    }

    // Filter by city
    if (city && typeof city === "string") {
      conditions.push(ilike(users.city, `%${city}%`));
    }

    // Filter by performance rate range
    if (minRate && typeof minRate === "string") {
      const rate = parseFloat(minRate);
      if (!isNaN(rate)) {
        conditions.push(gte(performerProfiles.performanceRate, rate.toString()));
      }
    }

    if (maxRate && typeof maxRate === "string") {
      const rate = parseFloat(maxRate);
      if (!isNaN(rate)) {
        conditions.push(lte(performerProfiles.performanceRate, rate.toString()));
      }
    }

    // Filter by availability
    if (availableForShows === "true") {
      conditions.push(eq(performerProfiles.availableForShows, true));
    }

    // Filter by verified status
    if (verified === "true") {
      conditions.push(eq(performerProfiles.isVerified, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const results = await query
      .orderBy(desc(performerProfiles.averageRating))
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
    console.error("[ServiceProfile] Error listing performers:", error);
    res.status(500).json({ message: "Failed to list performers" });
  }
});

// POST /api/profiles/performers - Create performer profile
router.post("/performers", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertPerformerProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const [profile] = await db
      .insert(performerProfiles)
      .values(validatedData)
      .returning();

    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }
    console.error("[ServiceProfile] Error creating performer profile:", error);
    res.status(500).json({ message: "Failed to create performer profile" });
  }
});

// PUT /api/profiles/performers/:userId - Update performer profile
router.put("/performers/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const [profile] = await db
      .update(performerProfiles)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(performerProfiles.userId, userId))
      .returning();

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
    console.error("[ServiceProfile] Error updating performer profile:", error);
    res.status(500).json({ message: "Failed to update performer profile" });
  }
});

// DELETE /api/profiles/performers/:userId - Delete performer profile
router.delete("/performers/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await db
      .delete(performerProfiles)
      .where(eq(performerProfiles.userId, userId));

    res.json({ success: true, message: "Performer profile deleted" });
  } catch (error) {
    console.error("[ServiceProfile] Error deleting performer profile:", error);
    res.status(500).json({ message: "Failed to delete performer profile" });
  }
});

// GET /api/profiles/performers/:userId/reviews - Get performer reviews
router.get("/performers/:userId/reviews", async (req, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const performerReviews = await db
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
          eq(reviews.targetType, 'performer'),
          eq(reviews.targetId, userId)
        )
      )
      .orderBy(desc(reviews.createdAt));

    res.json({
      success: true,
      reviews: performerReviews.map(r => ({
        ...r.review,
        reviewer: r.reviewer,
      })),
    });
  } catch (error) {
    console.error("[ServiceProfile] Error fetching performer reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// ============================================================================
// VENDOR PROFILE ROUTES
// ============================================================================

// GET /api/profiles/vendors - List all vendors with filters
router.get("/vendors", async (req, res: Response) => {
  try {
    const {
      category,
      city,
      priceRange,
      shipsInternationally,
      hasPhysicalStore,
      verified,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        profile: vendorProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(vendorProfiles)
      .leftJoin(users, eq(vendorProfiles.userId, users.id))
      .$dynamic();

    const conditions = [eq(vendorProfiles.isActive, true)];

    // Filter by category
    if (category && typeof category === "string") {
      const categoryList = category.split(",").map(c => c.trim());
      conditions.push(
        sql`${vendorProfiles.categories} && ARRAY[${sql.join(categoryList.map(c => sql`${c}`), sql`, `)}]::text[]`
      );
    }

    // Filter by city
    if (city && typeof city === "string") {
      conditions.push(ilike(vendorProfiles.storeCity, `%${city}%`));
    }

    // Filter by price range
    if (priceRange && typeof priceRange === "string") {
      conditions.push(eq(vendorProfiles.priceRange, priceRange));
    }

    // Filter by shipping
    if (shipsInternationally === "true") {
      conditions.push(eq(vendorProfiles.shipsInternationally, true));
    }

    // Filter by physical store
    if (hasPhysicalStore === "true") {
      conditions.push(eq(vendorProfiles.hasPhysicalStore, true));
    }

    // Filter by verified status
    if (verified === "true") {
      conditions.push(eq(vendorProfiles.isVerified, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const results = await query
      .orderBy(desc(vendorProfiles.averageRating))
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
    console.error("[ServiceProfile] Error listing vendors:", error);
    res.status(500).json({ message: "Failed to list vendors" });
  }
});

// POST /api/profiles/vendors - Create vendor profile
router.post("/vendors", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = insertVendorProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const [profile] = await db
      .insert(vendorProfiles)
      .values(validatedData)
      .returning();

    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }
    console.error("[ServiceProfile] Error creating vendor profile:", error);
    res.status(500).json({ message: "Failed to create vendor profile" });
  }
});

// PUT /api/profiles/vendors/:userId - Update vendor profile
router.put("/vendors/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    const [profile] = await db
      .update(vendorProfiles)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(vendorProfiles.userId, userId))
      .returning();

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
    console.error("[ServiceProfile] Error updating vendor profile:", error);
    res.status(500).json({ message: "Failed to update vendor profile" });
  }
});

// DELETE /api/profiles/vendors/:userId - Delete vendor profile
router.delete("/vendors/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await db
      .delete(vendorProfiles)
      .where(eq(vendorProfiles.userId, userId));

    res.json({ success: true, message: "Vendor profile deleted" });
  } catch (error) {
    console.error("[ServiceProfile] Error deleting vendor profile:", error);
    res.status(500).json({ message: "Failed to delete vendor profile" });
  }
});

// POST /api/profiles/vendors/:userId/products - Upload product images
router.post(
  "/vendors/:userId/products",
  authenticateToken,
  upload.array('images', 10),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const files = req.files as Express.Multer.File[];

      if (isNaN(userId) || !req.userId) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      if (userId !== req.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No images provided" });
      }

      // Upload all images
      const uploadPromises = files.map(file => 
        uploadPortfolioImage(file, `products/vendor_${userId}`)
      );
      const imageUrls = await Promise.all(uploadPromises);

      // Get current profile
      const [profile] = await db
        .select()
        .from(vendorProfiles)
        .where(eq(vendorProfiles.userId, userId))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Append new images to existing product images
      const currentImages = profile.productImages || [];
      const updatedImages = [...currentImages, ...imageUrls];

      // Update profile with new product images
      const [updatedProfile] = await db
        .update(vendorProfiles)
        .set({
          productImages: updatedImages,
          updatedAt: new Date(),
        })
        .where(eq(vendorProfiles.userId, userId))
        .returning();

      res.json({
        success: true,
        uploadedImages: imageUrls,
        profile: updatedProfile,
      });
    } catch (error) {
      console.error("[ServiceProfile] Error uploading product images:", error);
      res.status(500).json({ message: "Failed to upload product images" });
    }
  }
);

// GET /api/profiles/vendors/:userId/reviews - Get vendor reviews
router.get("/vendors/:userId/reviews", async (req, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const vendorReviews = await db
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
          eq(reviews.targetType, 'vendor'),
          eq(reviews.targetId, userId)
        )
      )
      .orderBy(desc(reviews.createdAt));

    res.json({
      success: true,
      reviews: vendorReviews.map(r => ({
        ...r.review,
        reviewer: r.reviewer,
      })),
    });
  } catch (error) {
    console.error("[ServiceProfile] Error fetching vendor reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// ============================================================================
// CHOREOGRAPHER PROFILE ROUTES
// ============================================================================

// GET /api/profiles/choreographers - List all choreographers with filters
router.get("/choreographers", async (req, res: Response) => {
  try {
    const {
      style,
      city,
      minRate,
      maxRate,
      yearsExperience,
      verified,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        profile: choreographerProfiles,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
        },
      })
      .from(choreographerProfiles)
      .leftJoin(users, eq(choreographerProfiles.userId, users.id))
      .$dynamic();

    const conditions = [eq(choreographerProfiles.isActive, true)];

    // Filter by style
    if (style && typeof style === "string") {
      const styleList = style.split(",").map(s => s.trim());
      conditions.push(
        sql`${choreographerProfiles.styles} && ARRAY[${sql.join(styleList.map(s => sql`${s}`), sql`, `)}]::text[]`
      );
    }

    // Filter by city
    if (city && typeof city === "string") {
      conditions.push(ilike(users.city, `%${city}%`));
    }

    // Filter by hourly rate range
    if (minRate && typeof minRate === "string") {
      const rate = parseFloat(minRate);
      if (!isNaN(rate)) {
        conditions.push(gte(choreographerProfiles.hourlyRate, rate.toString()));
      }
    }

    if (maxRate && typeof maxRate === "string") {
      const rate = parseFloat(maxRate);
      if (!isNaN(rate)) {
        conditions.push(lte(choreographerProfiles.hourlyRate, rate.toString()));
      }
    }

    // Filter by years of experience
    if (yearsExperience && typeof yearsExperience === "string") {
      const years = parseInt(yearsExperience);
      if (!isNaN(years)) {
        conditions.push(gte(choreographerProfiles.yearsExperience, years));
      }
    }

    // Filter by verified status
    if (verified === "true") {
      conditions.push(eq(choreographerProfiles.isVerified, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const results = await query
      .orderBy(desc(choreographerProfiles.averageRating))
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
    console.error("[ServiceProfile] Error listing choreographers:", error);
    res.status(500).json({ message: "Failed to list choreographers" });
  }
});

// POST /api/profiles/choreographers - Create choreographer profile
router.post("/choreographers", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Validate availability schedule if provided
    if (req.body.availability) {
      const availabilityValidation = availabilitySchema.safeParse(req.body.availability);
      if (!availabilityValidation.success) {
        return res.status(400).json({
          message: "Invalid availability data",
          errors: availabilityValidation.error.errors
        });
      }
    }

    const validatedData = insertChoreographerProfileSchema.parse({
      ...req.body,
      userId: req.userId,
    });

    const [profile] = await db
      .insert(choreographerProfiles)
      .values(validatedData)
      .returning();

    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors
      });
    }
    console.error("[ServiceProfile] Error creating choreographer profile:", error);
    res.status(500).json({ message: "Failed to create choreographer profile" });
  }
});

// PUT /api/profiles/choreographers/:userId - Update choreographer profile
router.put("/choreographers/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    // Validate availability schedule if provided
    if (req.body.availability) {
      const availabilityValidation = availabilitySchema.safeParse(req.body.availability);
      if (!availabilityValidation.success) {
        return res.status(400).json({
          message: "Invalid availability data",
          errors: availabilityValidation.error.errors
        });
      }
    }

    const [profile] = await db
      .update(choreographerProfiles)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(choreographerProfiles.userId, userId))
      .returning();

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
    console.error("[ServiceProfile] Error updating choreographer profile:", error);
    res.status(500).json({ message: "Failed to update choreographer profile" });
  }
});

// DELETE /api/profiles/choreographers/:userId - Delete choreographer profile
router.delete("/choreographers/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId) || !req.userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own profile" });
    }

    await db
      .delete(choreographerProfiles)
      .where(eq(choreographerProfiles.userId, userId));

    res.json({ success: true, message: "Choreographer profile deleted" });
  } catch (error) {
    console.error("[ServiceProfile] Error deleting choreographer profile:", error);
    res.status(500).json({ message: "Failed to delete choreographer profile" });
  }
});

// POST /api/profiles/choreographers/:userId/portfolio - Upload portfolio videos/images
router.post(
  "/choreographers/:userId/portfolio",
  authenticateToken,
  upload.array('files', 5),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const files = req.files as Express.Multer.File[];

      if (isNaN(userId) || !req.userId) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      if (userId !== req.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files provided" });
      }

      // Upload all files
      const uploadPromises = files.map(file => 
        uploadPortfolioImage(file, `portfolios/choreographer_${userId}`)
      );
      const fileUrls = await Promise.all(uploadPromises);

      // Get current profile
      const [profile] = await db
        .select()
        .from(choreographerProfiles)
        .where(eq(choreographerProfiles.userId, userId))
        .limit(1);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Append new URLs to existing portfolio videos
      const currentVideos = profile.portfolioVideos || [];
      const updatedVideos = [...currentVideos, ...fileUrls];

      // Update profile with new portfolio
      const [updatedProfile] = await db
        .update(choreographerProfiles)
        .set({
          portfolioVideos: updatedVideos,
          updatedAt: new Date(),
        })
        .where(eq(choreographerProfiles.userId, userId))
        .returning();

      res.json({
        success: true,
        uploadedFiles: fileUrls,
        profile: updatedProfile,
      });
    } catch (error) {
      console.error("[ServiceProfile] Error uploading portfolio:", error);
      res.status(500).json({ message: "Failed to upload portfolio" });
    }
  }
);

// GET /api/profiles/choreographers/:userId/reviews - Get choreographer reviews
router.get("/choreographers/:userId/reviews", async (req, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const choreographerReviews = await db
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
          eq(reviews.targetType, 'choreographer'),
          eq(reviews.targetId, userId)
        )
      )
      .orderBy(desc(reviews.createdAt));

    res.json({
      success: true,
      reviews: choreographerReviews.map(r => ({
        ...r.review,
        reviewer: r.reviewer,
      })),
    });
  } catch (error) {
    console.error("[ServiceProfile] Error fetching choreographer reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

export default router;
