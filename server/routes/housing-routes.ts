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

export default router;
