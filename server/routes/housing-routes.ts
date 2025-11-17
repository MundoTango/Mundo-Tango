import { Router, type Request, type Response } from "express";
import { db } from "@shared/db";
import { 
  housingListings,
  housingBookings,
  housingReviews,
  housingFavorites,
  users
} from "@shared/schema";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { eq, and, desc, gte, lte, sql, or } from "drizzle-orm";
import multer from "multer";
import { uploadImage, deleteImage, validateCloudinaryConfig } from "../utils/cloudinary";
import crypto from "crypto";

const router = Router();

// ============================================================================
// HOUSING LISTINGS ROUTES
// ============================================================================

// GET /api/housing/listings - Get all active housing listings with filters
router.get("/listings", async (req: Request, res: Response) => {
  try {
    const {
      city,
      country,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      limit = "20",
      offset = "0"
    } = req.query;

    let query = db
      .select({
        listing: housingListings,
        host: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(housingListings)
      .leftJoin(users, eq(housingListings.hostId, users.id))
      .where(eq(housingListings.status, "active"))
      .$dynamic();

    // Apply filters
    const conditions = [eq(housingListings.status, "active")];

    if (city) conditions.push(eq(housingListings.city, city as string));
    if (country) conditions.push(eq(housingListings.country, country as string));
    if (propertyType) conditions.push(eq(housingListings.propertyType, propertyType as string));
    if (minPrice) conditions.push(gte(housingListings.pricePerNight, parseInt(minPrice as string)));
    if (maxPrice) conditions.push(lte(housingListings.pricePerNight, parseInt(maxPrice as string)));
    if (bedrooms) conditions.push(eq(housingListings.bedrooms, parseInt(bedrooms as string)));
    if (bathrooms) conditions.push(eq(housingListings.bathrooms, parseInt(bathrooms as string)));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(housingListings.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[Housing] Error fetching listings:", error);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});

// POST /api/housing/search - Advanced search for housing
router.post("/search", async (req: Request, res: Response) => {
  try {
    const {
      checkInDate,
      checkOutDate,
      city,
      country,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      maxGuests,
      amenities,
      limit = "20",
      offset = "0"
    } = req.body;

    const conditions = [eq(housingListings.status, "active")];

    if (city) conditions.push(sql`${housingListings.city} ILIKE ${`%${city}%`}`);
    if (country) conditions.push(eq(housingListings.country, country));
    if (propertyType) conditions.push(eq(housingListings.propertyType, propertyType));
    if (minPrice) conditions.push(gte(housingListings.pricePerNight, minPrice));
    if (maxPrice) conditions.push(lte(housingListings.pricePerNight, maxPrice));
    if (bedrooms) conditions.push(gte(housingListings.bedrooms, bedrooms));
    if (bathrooms) conditions.push(gte(housingListings.bathrooms, bathrooms));
    if (maxGuests) conditions.push(gte(housingListings.maxGuests, maxGuests));

    // Filter by amenities if provided
    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      amenities.forEach((amenity: string) => {
        conditions.push(sql`${amenity} = ANY(${housingListings.amenities})`);
      });
    }

    const results = await db
      .select({
        listing: housingListings,
        host: {
          id: users.id,
          name: users.name,
          email: users.email,
          profileImage: users.profileImage
        }
      })
      .from(housingListings)
      .leftJoin(users, eq(housingListings.hostId, users.id))
      .where(and(...conditions))
      .orderBy(desc(housingListings.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    res.json(results);
  } catch (error) {
    console.error("[Housing] Error searching listings:", error);
    res.status(500).json({ message: "Failed to search listings" });
  }
});

// GET /api/housing/listings/:id - Get specific listing
router.get("/listings/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db
      .select({
        listing: housingListings,
        host: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(housingListings)
      .leftJoin(users, eq(housingListings.hostId, users.id))
      .where(eq(housingListings.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("[Housing] Error fetching listing:", error);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
});

// POST /api/housing/listings - Create new listing (auth required)
router.post("/listings", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const hostId = req.userId!;
    const {
      title,
      description,
      propertyType,
      bedrooms,
      bathrooms,
      maxGuests,
      pricePerNight,
      currency,
      address,
      city,
      country,
      latitude,
      longitude,
      amenities,
      houseRules,
      images
    } = req.body;

    const [listing] = await db
      .insert(housingListings)
      .values({
        hostId,
        title,
        description,
        propertyType,
        bedrooms,
        bathrooms,
        maxGuests,
        pricePerNight,
        currency: currency || "USD",
        address,
        city,
        country,
        latitude,
        longitude,
        amenities,
        houseRules,
        images,
        status: "active"
      })
      .returning();

    res.status(201).json(listing);
  } catch (error) {
    console.error("[Housing] Error creating listing:", error);
    res.status(500).json({ message: "Failed to create listing" });
  }
});

// PATCH /api/housing/listings/:id - Update listing (auth required, owner only)
router.patch("/listings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const existing = await db
      .select()
      .from(housingListings)
      .where(eq(housingListings.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (existing[0].hostId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [updated] = await db
      .update(housingListings)
      .set({
        ...req.body,
        updatedAt: new Date()
      })
      .where(eq(housingListings.id, parseInt(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("[Housing] Error updating listing:", error);
    res.status(500).json({ message: "Failed to update listing" });
  }
});

// DELETE /api/housing/listings/:id - Delete listing (auth required, owner only)
router.delete("/listings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const existing = await db
      .select()
      .from(housingListings)
      .where(eq(housingListings.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (existing[0].hostId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await db
      .delete(housingListings)
      .where(eq(housingListings.id, parseInt(id)));

    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("[Housing] Error deleting listing:", error);
    res.status(500).json({ message: "Failed to delete listing" });
  }
});

// ============================================================================
// HOUSING BOOKINGS ROUTES
// ============================================================================

// GET /api/housing/bookings - Get user's bookings (auth required)
router.get("/bookings", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { status } = req.query;

    let query = db
      .select({
        booking: housingBookings,
        listing: housingListings,
        host: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(housingBookings)
      .leftJoin(housingListings, eq(housingBookings.listingId, housingListings.id))
      .leftJoin(users, eq(housingListings.hostId, users.id))
      .where(eq(housingBookings.guestId, userId))
      .$dynamic();

    if (status) {
      query = query.where(and(
        eq(housingBookings.guestId, userId),
        eq(housingBookings.status, status as string)
      ));
    }

    const results = await query.orderBy(desc(housingBookings.createdAt));

    res.json(results);
  } catch (error) {
    console.error("[Housing] Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// POST /api/housing/bookings - Create booking (auth required)
router.post("/bookings", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const guestId = req.userId!;
    const {
      listingId,
      checkInDate,
      checkOutDate,
      guests,
      totalAmount
    } = req.body;

    // Check listing exists and is available
    const listing = await db
      .select()
      .from(housingListings)
      .where(and(
        eq(housingListings.id, listingId),
        eq(housingListings.status, "active")
      ))
      .limit(1);

    if (listing.length === 0) {
      return res.status(404).json({ message: "Listing not available" });
    }

    // Check for booking conflicts
    const conflicts = await db
      .select()
      .from(housingBookings)
      .where(and(
        eq(housingBookings.listingId, listingId),
        or(
          eq(housingBookings.status, "confirmed"),
          eq(housingBookings.status, "pending")
        ),
        or(
          and(
            gte(housingBookings.checkInDate, new Date(checkInDate)),
            lte(housingBookings.checkInDate, new Date(checkOutDate))
          ),
          and(
            gte(housingBookings.checkOutDate, new Date(checkInDate)),
            lte(housingBookings.checkOutDate, new Date(checkOutDate))
          )
        )
      ));

    if (conflicts.length > 0) {
      return res.status(409).json({ message: "Dates not available" });
    }

    const [booking] = await db
      .insert(housingBookings)
      .values({
        listingId,
        guestId,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        guests,
        totalAmount,
        status: "pending"
      })
      .returning();

    res.status(201).json(booking);
  } catch (error) {
    console.error("[Housing] Error creating booking:", error);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

// PATCH /api/housing/bookings/:id/status - Update booking status (auth required)
router.patch("/bookings/:id/status", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { status } = req.body;

    // Get booking with listing details
    const result = await db
      .select({
        booking: housingBookings,
        listing: housingListings
      })
      .from(housingBookings)
      .leftJoin(housingListings, eq(housingBookings.listingId, housingListings.id))
      .where(eq(housingBookings.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const { booking, listing } = result[0];

    // Only listing owner can confirm/reject, guest can cancel
    if (status === "confirmed" || status === "rejected") {
      if (listing?.hostId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
    } else if (status === "cancelled") {
      if (booking.guestId !== userId && listing?.hostId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    const [updated] = await db
      .update(housingBookings)
      .set({ status })
      .where(eq(housingBookings.id, parseInt(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("[Housing] Error updating booking status:", error);
    res.status(500).json({ message: "Failed to update booking status" });
  }
});

// ============================================================================
// HOUSING REVIEWS ROUTES
// ============================================================================

// GET /api/housing/listings/:listingId/reviews - Get reviews for a listing
router.get("/listings/:listingId/reviews", async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const reviews = await db
      .select({
        review: housingReviews,
        reviewer: {
          id: users.id,
          name: users.name
        }
      })
      .from(housingReviews)
      .leftJoin(users, eq(housingReviews.reviewerId, users.id))
      .where(eq(housingReviews.listingId, parseInt(listingId)))
      .orderBy(desc(housingReviews.createdAt));

    res.json(reviews);
  } catch (error) {
    console.error("[Housing] Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// POST /api/housing/listings/:listingId/reviews - Create review (auth required)
router.post("/listings/:listingId/reviews", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { listingId } = req.params;
    const { rating, review } = req.body;

    // Check if user has completed booking for this listing
    const booking = await db
      .select()
      .from(housingBookings)
      .where(and(
        eq(housingBookings.listingId, parseInt(listingId)),
        eq(housingBookings.guestId, userId),
        eq(housingBookings.status, "completed")
      ))
      .limit(1);

    if (booking.length === 0) {
      return res.status(403).json({ message: "You must complete a booking to leave a review" });
    }

    // Check if review already exists
    const existingReview = await db
      .select()
      .from(housingReviews)
      .where(and(
        eq(housingReviews.listingId, parseInt(listingId)),
        eq(housingReviews.reviewerId, userId)
      ))
      .limit(1);

    if (existingReview.length > 0) {
      return res.status(409).json({ message: "You have already reviewed this listing" });
    }

    const [newReview] = await db
      .insert(housingReviews)
      .values({
        listingId: parseInt(listingId),
        reviewerId: userId,
        rating,
        review
      })
      .returning();

    res.status(201).json(newReview);
  } catch (error) {
    console.error("[Housing] Error creating review:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
});

// ============================================================================
// HOUSING FAVORITES ROUTES
// ============================================================================

// GET /api/housing/favorites - Get user's favorite listings (auth required)
router.get("/favorites", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const favorites = await db
      .select({
        favorite: housingFavorites,
        listing: housingListings,
        host: {
          id: users.id,
          name: users.name
        }
      })
      .from(housingFavorites)
      .leftJoin(housingListings, eq(housingFavorites.listingId, housingListings.id))
      .leftJoin(users, eq(housingListings.hostId, users.id))
      .where(eq(housingFavorites.userId, userId))
      .orderBy(desc(housingFavorites.createdAt));

    res.json(favorites);
  } catch (error) {
    console.error("[Housing] Error fetching favorites:", error);
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
});

// POST /api/housing/favorites/:listingId - Add to favorites (auth required)
router.post("/favorites/:listingId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { listingId } = req.params;

    // Check if already favorited
    const existing = await db
      .select()
      .from(housingFavorites)
      .where(and(
        eq(housingFavorites.userId, userId),
        eq(housingFavorites.listingId, parseInt(listingId))
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ message: "Already in favorites" });
    }

    const [favorite] = await db
      .insert(housingFavorites)
      .values({
        userId,
        listingId: parseInt(listingId)
      })
      .returning();

    res.status(201).json(favorite);
  } catch (error) {
    console.error("[Housing] Error adding favorite:", error);
    res.status(500).json({ message: "Failed to add favorite" });
  }
});

// DELETE /api/housing/favorites/:listingId - Remove from favorites (auth required)
router.delete("/favorites/:listingId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { listingId } = req.params;

    await db
      .delete(housingFavorites)
      .where(and(
        eq(housingFavorites.userId, userId),
        eq(housingFavorites.listingId, parseInt(listingId))
      ));

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("[Housing] Error removing favorite:", error);
    res.status(500).json({ message: "Failed to remove favorite" });
  }
});

// ============================================================================
// HOUSING PHOTO MANAGEMENT ROUTES
// ============================================================================

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/housing/photos - Upload photo to Cloudinary (auth required)
router.post("/photos", authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const file = req.file;
    const listingId = req.body.listingId;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!listingId) {
      return res.status(400).json({ message: "Listing ID is required" });
    }

    // Verify Cloudinary configuration
    if (!validateCloudinaryConfig()) {
      return res.status(500).json({ 
        message: "Cloudinary not configured. Please contact support." 
      });
    }

    // Check if listing exists and user owns it
    const listing = await db
      .select()
      .from(housingListings)
      .where(eq(housingListings.id, parseInt(listingId)))
      .limit(1);

    if (listing.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing[0].hostId !== userId) {
      return res.status(403).json({ message: "Not authorized to upload photos for this listing" });
    }

    // Check photo count limit (max 20)
    const currentPhotos = listing[0].photos || [];
    if (currentPhotos.length >= 20) {
      return res.status(400).json({ message: "Maximum 20 photos allowed per listing" });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadImage(
      file.buffer, 
      `housing/${listingId}`,
      undefined
    );

    // Create photo object
    const photoId = crypto.randomUUID();
    const newPhoto = {
      id: photoId,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      order: currentPhotos.length,
      isCover: currentPhotos.length === 0, // First photo is cover by default
    };

    // Update listing with new photo
    const updatedPhotos = [...currentPhotos, newPhoto];
    await db
      .update(housingListings)
      .set({ 
        photos: updatedPhotos,
        coverPhotoUrl: currentPhotos.length === 0 ? uploadResult.url : listing[0].coverPhotoUrl,
        updatedAt: new Date()
      })
      .where(eq(housingListings.id, parseInt(listingId)));

    res.status(201).json(newPhoto);
  } catch (error) {
    console.error("[Housing] Error uploading photo:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to upload photo" 
    });
  }
});

// DELETE /api/housing/:listingId/photos/:photoId - Delete photo (auth required)
router.delete("/:listingId/photos/:photoId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { listingId, photoId } = req.params;

    // Get listing
    const listing = await db
      .select()
      .from(housingListings)
      .where(eq(housingListings.id, parseInt(listingId)))
      .limit(1);

    if (listing.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing[0].hostId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const currentPhotos = listing[0].photos || [];
    const photoToDelete = currentPhotos.find(p => p.id === photoId);

    if (!photoToDelete) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Verify Cloudinary configuration
    if (!validateCloudinaryConfig()) {
      return res.status(500).json({ 
        message: "Cloudinary not configured. Please contact support." 
      });
    }

    // Delete from Cloudinary
    try {
      await deleteImage(photoToDelete.publicId);
    } catch (cloudinaryError) {
      console.error("[Housing] Cloudinary deletion error:", cloudinaryError);
      // Continue even if Cloudinary deletion fails
    }

    // Remove from database
    const updatedPhotos = currentPhotos
      .filter(p => p.id !== photoId)
      .map((p, index) => ({ ...p, order: index }));

    // If deleted photo was cover, set first photo as cover
    let newCoverPhotoUrl = listing[0].coverPhotoUrl;
    if (photoToDelete.isCover && updatedPhotos.length > 0) {
      updatedPhotos[0].isCover = true;
      newCoverPhotoUrl = updatedPhotos[0].url;
    } else if (updatedPhotos.length === 0) {
      newCoverPhotoUrl = null;
    }

    await db
      .update(housingListings)
      .set({ 
        photos: updatedPhotos,
        coverPhotoUrl: newCoverPhotoUrl,
        updatedAt: new Date()
      })
      .where(eq(housingListings.id, parseInt(listingId)));

    res.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("[Housing] Error deleting photo:", error);
    res.status(500).json({ message: "Failed to delete photo" });
  }
});

// PUT /api/housing/:listingId/photos/reorder - Reorder photos (auth required)
router.put("/:listingId/photos/reorder", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { listingId } = req.params;
    const { photos } = req.body;

    if (!photos || !Array.isArray(photos)) {
      return res.status(400).json({ message: "Photos array is required" });
    }

    // Get listing
    const listing = await db
      .select()
      .from(housingListings)
      .where(eq(housingListings.id, parseInt(listingId)))
      .limit(1);

    if (listing.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing[0].hostId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update order
    await db
      .update(housingListings)
      .set({ 
        photos: photos,
        updatedAt: new Date()
      })
      .where(eq(housingListings.id, parseInt(listingId)));

    res.json({ message: "Photos reordered successfully", photos });
  } catch (error) {
    console.error("[Housing] Error reordering photos:", error);
    res.status(500).json({ message: "Failed to reorder photos" });
  }
});

// PUT /api/housing/:listingId/photos/:photoId/cover - Set cover photo (auth required)
router.put("/:listingId/photos/:photoId/cover", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { listingId, photoId } = req.params;

    // Get listing
    const listing = await db
      .select()
      .from(housingListings)
      .where(eq(housingListings.id, parseInt(listingId)))
      .limit(1);

    if (listing.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing[0].hostId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const currentPhotos = listing[0].photos || [];
    const photoIndex = currentPhotos.findIndex(p => p.id === photoId);

    if (photoIndex === -1) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Update cover photo
    const updatedPhotos = currentPhotos.map(p => ({
      ...p,
      isCover: p.id === photoId
    }));

    await db
      .update(housingListings)
      .set({ 
        photos: updatedPhotos,
        coverPhotoUrl: currentPhotos[photoIndex].url,
        updatedAt: new Date()
      })
      .where(eq(housingListings.id, parseInt(listingId)));

    res.json({ message: "Cover photo updated successfully" });
  } catch (error) {
    console.error("[Housing] Error setting cover photo:", error);
    res.status(500).json({ message: "Failed to set cover photo" });
  }
});

// PUT /api/housing/:listingId/photos/:photoId/caption - Update photo caption (auth required)
router.put("/:listingId/photos/:photoId/caption", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { listingId, photoId } = req.params;
    const { caption } = req.body;

    // Get listing
    const listing = await db
      .select()
      .from(housingListings)
      .where(eq(housingListings.id, parseInt(listingId)))
      .limit(1);

    if (listing.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing[0].hostId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const currentPhotos = listing[0].photos || [];
    const photoIndex = currentPhotos.findIndex(p => p.id === photoId);

    if (photoIndex === -1) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Update caption
    const updatedPhotos = currentPhotos.map(p =>
      p.id === photoId ? { ...p, caption } : p
    );

    await db
      .update(housingListings)
      .set({ 
        photos: updatedPhotos,
        updatedAt: new Date()
      })
      .where(eq(housingListings.id, parseInt(listingId)));

    res.json({ message: "Caption updated successfully" });
  } catch (error) {
    console.error("[Housing] Error updating caption:", error);
    res.status(500).json({ message: "Failed to update caption" });
  }
});

export default router;
