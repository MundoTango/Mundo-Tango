import { Router, type Request, type Response } from "express";
import { db } from "@shared/db";
import {
  events,
  eventRsvps,
  eventPhotos,
  eventComments,
  users,
  insertEventSchema,
  insertEventRsvpSchema,
  insertEventCommentSchema
} from "@shared/schema";
import { authenticateToken, optionalAuth, AuthRequest } from "../middleware/auth";
import { requireMinimumRole } from "../middleware/tierEnforcement";
import { eq, and, desc, gte, lte, sql, or, asc, inArray, count } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// ============================================================================
// EVENT ROUTES
// ============================================================================

// GET /api/events - List events with filters
router.get("/", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      city,
      country,
      eventType,
      startDate,
      endDate,
      status = "published",
      limit = "20",
      offset = "0",
      category,
      upcoming,
      search
    } = req.query;

    let query = db
      .select({
        event: events,
        organizer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        },
        _count: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${eventRsvps} 
          WHERE ${eventRsvps.eventId} = ${events.id}
          AND ${eventRsvps.status} = 'going'
        )`.as('attendee_count')
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .$dynamic();

    const conditions = [eq(events.status, status as string)];

    if (city) conditions.push(eq(events.city, city as string));
    if (country) conditions.push(eq(events.country, country as string));
    if (eventType) conditions.push(eq(events.eventType, eventType as string));
    if (startDate) conditions.push(gte(events.startDate, new Date(startDate as string)));
    if (endDate) conditions.push(lte(events.startDate, new Date(endDate as string)));

    // Handle search parameter - search in title, description, venue, address, city
    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          sql`${events.title} ILIKE ${searchTerm}`,
          sql`${events.description} ILIKE ${searchTerm}`,
          sql`${events.venue} ILIKE ${searchTerm}`,
          sql`${events.address} ILIKE ${searchTerm}`,
          sql`${events.city} ILIKE ${searchTerm}`
        )!
      );
    }

    // Handle category=my-events: filter by userId if user is authenticated
    if (category === "my-events" && req.user) {
      conditions.push(eq(events.userId, req.user.id));
    }

    // Handle upcoming=true: filter for events starting from now
    if (upcoming === "true") {
      conditions.push(gte(events.startDate, new Date()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(asc(events.startDate))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[Events] Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// ============================================================================
// EVENT ANALYTICS (must be before /:id routes)
// ============================================================================

// GET /api/events/search - Advanced search with 12 filters
router.get("/search", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      q,
      city,
      dateFrom,
      dateTo,
      type,
      priceMin,
      priceMax,
      danceStyle,
      skillLevel,
      online,
      verified,
      tags,
      sortBy = "relevance",
      page = "1",
      limit = "20"
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = db
      .select({
        event: events,
        organizer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          isVerified: users.isVerified
        },
        attendeeCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${eventRsvps} 
          WHERE ${eventRsvps.eventId} = ${events.id}
          AND ${eventRsvps.status} = 'going'
        )`.as('attendee_count')
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .$dynamic();

    const conditions = [eq(events.status, "published")];

    // Full-text search using PostgreSQL ts_vector
    if (q && typeof q === 'string' && q.trim()) {
      const searchQuery = q.trim();
      conditions.push(
        sql`(
          to_tsvector('english', ${events.title}) @@ plainto_tsquery('english', ${searchQuery})
          OR to_tsvector('english', ${events.description}) @@ plainto_tsquery('english', ${searchQuery})
          OR to_tsvector('english', ${events.location}) @@ plainto_tsquery('english', ${searchQuery})
        )`
      );
    }

    // City/location filter
    if (city && typeof city === 'string') {
      conditions.push(
        sql`${events.city} ILIKE ${`%${city}%`}`
      );
    }

    // Date range filter
    if (dateFrom) {
      conditions.push(gte(events.startDate, new Date(dateFrom as string)));
    }
    if (dateTo) {
      conditions.push(lte(events.startDate, new Date(dateTo as string)));
    }

    // Event type filter
    if (type && typeof type === 'string') {
      conditions.push(eq(events.eventType, type));
    }

    // Price range filter
    if (priceMin !== undefined || priceMax !== undefined) {
      if (priceMin === "0" && priceMax === "0") {
        conditions.push(eq(events.isFree, true));
      } else {
        conditions.push(eq(events.isPaid, true));
        if (priceMin !== undefined) {
          conditions.push(sql`CAST(${events.price} AS NUMERIC) >= ${priceMin}`);
        }
        if (priceMax !== undefined && priceMax !== "500") {
          conditions.push(sql`CAST(${events.price} AS NUMERIC) <= ${priceMax}`);
        }
      }
    }

    // Dance style filter
    if (danceStyle && typeof danceStyle === 'string') {
      conditions.push(
        sql`${danceStyle} = ANY(${events.danceStyles})`
      );
    }

    // Skill level filter (stored in tags)
    if (skillLevel && typeof skillLevel === 'string') {
      conditions.push(
        sql`${skillLevel} = ANY(${events.tags})`
      );
    }

    // Online/in-person toggle
    if (online === "true") {
      conditions.push(eq(events.isOnline, true));
    } else if (online === "false") {
      conditions.push(eq(events.isOnline, false));
    }

    // Verified organizer filter
    if (verified === "true") {
      conditions.push(eq(users.isVerified, true));
    }

    // Tags filter
    if (tags && typeof tags === 'string') {
      const tagArray = tags.split(',').map(t => t.trim());
      tagArray.forEach(tag => {
        conditions.push(
          sql`${tag} = ANY(${events.tags})`
        );
      });
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    switch (sortBy) {
      case "date":
        query = query.orderBy(asc(events.startDate));
        break;
      case "price":
        query = query.orderBy(asc(sql`CAST(${events.price} AS NUMERIC)`));
        break;
      case "relevance":
      default:
        if (q) {
          query = query.orderBy(
            desc(sql`
              ts_rank(
                to_tsvector('english', ${events.title} || ' ' || ${events.description}),
                plainto_tsquery('english', ${q})
              )
            `)
          );
        } else {
          query = query.orderBy(asc(events.startDate));
        }
        break;
    }

    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const [{ count: total }] = await countQuery;

    // Get results with pagination
    const results = await query
      .limit(parseInt(limit as string))
      .offset(offset);

    res.json({
      events: results,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error("[Events] Error in advanced search:", error);
    res.status(500).json({ message: "Failed to search events" });
  }
});

// GET /api/events/calendar - Get events for calendar view
router.get("/calendar", async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;

    let query = db
      .select({
        event: events,
        organizer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        },
        attendeeCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${eventRsvps} 
          WHERE ${eventRsvps.eventId} = ${events.id}
          AND ${eventRsvps.status} = 'going'
        )`.as('attendee_count')
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .where(eq(events.status, "published"))
      .$dynamic();

    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string), parseInt(month as string), 0, 23, 59, 59);
      
      query = query.where(and(
        eq(events.status, "published"),
        gte(events.startDate, startDate),
        lte(events.startDate, endDate)
      ));
    }

    const results = await query.orderBy(asc(events.startDate));

    res.json(results);
  } catch (error) {
    console.error("[Events] Error fetching calendar events:", error);
    res.status(500).json({ message: "Failed to fetch calendar events" });
  }
});

// GET /api/events/analytics/popular - Get popular events
router.get("/analytics/popular", async (req: Request, res: Response) => {
  try {
    const { limit = "10" } = req.query;

    const popular = await db
      .select({
        event: events,
        attendeeCount: sql<number>`COUNT(${eventRsvps.id})::int`.as('attendee_count')
      })
      .from(events)
      .leftJoin(eventRsvps, and(
        eq(eventRsvps.eventId, events.id),
        eq(eventRsvps.status, "going")
      ))
      .where(eq(events.status, "published"))
      .groupBy(events.id)
      .orderBy(desc(sql`COUNT(${eventRsvps.id})`))
      .limit(parseInt(limit as string));

    res.json(popular);
  } catch (error) {
    console.error("[Events] Error fetching popular events:", error);
    res.status(500).json({ message: "Failed to fetch popular events" });
  }
});

// GET /api/events/analytics/attendance - Get attendance statistics
router.get("/analytics/attendance", async (req: Request, res: Response) => {
  try {
    const stats = await db
      .select({
        totalEvents: sql<number>`COUNT(DISTINCT ${events.id})::int`,
        totalRSVPs: sql<number>`COUNT(${eventRsvps.id})::int`,
        goingCount: sql<number>`COUNT(CASE WHEN ${eventRsvps.status} = 'going' THEN 1 END)::int`,
        maybeCount: sql<number>`COUNT(CASE WHEN ${eventRsvps.status} = 'maybe' THEN 1 END)::int`,
        averageAttendance: sql<number>`AVG(attendee_counts.cnt)::int`
      })
      .from(events)
      .leftJoin(eventRsvps, eq(eventRsvps.eventId, events.id))
      .leftJoin(
        sql`(
          SELECT event_id, COUNT(*) as cnt
          FROM ${eventRsvps}
          WHERE status = 'going'
          GROUP BY event_id
        ) as attendee_counts`,
        sql`attendee_counts.event_id = ${events.id}`
      );

    res.json(stats[0] || {
      totalEvents: 0,
      totalRSVPs: 0,
      goingCount: 0,
      maybeCount: 0,
      averageAttendance: 0
    });
  } catch (error) {
    console.error("[Events] Error fetching attendance stats:", error);
    res.status(500).json({ message: "Failed to fetch attendance stats" });
  }
});

// GET /api/events/my-rsvps - Get user's RSVPs (MUST be before /:id route!)
router.get("/my-rsvps", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const userRsvps = await db
      .select({
        event: events,
        rsvp: eventRsvps,
        organizer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(eventRsvps)
      .innerJoin(events, eq(eventRsvps.eventId, events.id))
      .leftJoin(users, eq(events.userId, users.id))
      .where(eq(eventRsvps.userId, userId))
      .orderBy(desc(events.startDate));

    res.json(userRsvps);
  } catch (error) {
    console.error("[Events] Error fetching user RSVPs:", error);
    res.status(500).json({ message: "Failed to fetch user RSVPs" });
  }
});

// GET /api/events/:id - Get event details
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db
      .select({
        event: events,
        organizer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          bio: users.bio
        }
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get RSVP count
    const rsvpCount = await db
      .select({ count: count() })
      .from(eventRsvps)
      .where(and(
        eq(eventRsvps.eventId, parseInt(id)),
        eq(eventRsvps.status, "going")
      ));

    res.json({
      ...result[0],
      attendeeCount: rsvpCount[0]?.count || 0
    });
  } catch (error) {
    console.error("[Events] Error fetching event:", error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// POST /api/events - Create new event
// TIER ENFORCEMENT: Requires Community Leader (level 3) or higher
// Level 3 = Community Leader, Level 4 = Admin, Level 5+ = Higher tiers
router.post("/", authenticateToken, requireMinimumRole(3), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const eventData = insertEventSchema.omit({ userId: true }).parse(req.body);

    const [event] = await db
      .insert(events)
      .values({
        ...eventData,
        userId,
        status: "published"
      })
      .returning();

    res.status(201).json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("[Events] Error creating event:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
});

// PUT /api/events/:id - Update event (auth required, owner only)
router.put("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check ownership
    const existing = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (existing[0].userId !== userId && existing[0].organizerId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [updated] = await db
      .update(events)
      .set({
        ...req.body,
        updatedAt: new Date()
      })
      .where(eq(events.id, parseInt(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("[Events] Error updating event:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

// DELETE /api/events/:id - Delete event (auth required, owner only)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check ownership
    const existing = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (existing[0].userId !== userId && existing[0].organizerId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await db.delete(events).where(eq(events.id, parseInt(id)));

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("[Events] Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

// ============================================================================
// EVENT RSVP ROUTES
// ============================================================================

// POST /api/events/:id/rsvp - RSVP to event (auth required)
router.post("/:id/rsvp", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status = "going", guestCount = 0 } = req.body;

    // Check if event exists
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (event.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if already RSVP'd
    const existing = await db
      .select()
      .from(eventRsvps)
      .where(and(
        eq(eventRsvps.eventId, parseInt(id)),
        eq(eventRsvps.userId, userId)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing RSVP
      const [updated] = await db
        .update(eventRsvps)
        .set({ status, guestCount, updatedAt: new Date() })
        .where(and(
          eq(eventRsvps.eventId, parseInt(id)),
          eq(eventRsvps.userId, userId)
        ))
        .returning();

      return res.json(updated);
    }

    // Create new RSVP
    const [rsvp] = await db
      .insert(eventRsvps)
      .values({
        eventId: parseInt(id),
        userId,
        status,
        guestCount
      })
      .returning();

    // Update event attendee count
    await db
      .update(events)
      .set({
        currentAttendees: sql`${events.currentAttendees} + ${guestCount + 1}`
      })
      .where(eq(events.id, parseInt(id)));

    res.status(201).json(rsvp);
  } catch (error) {
    console.error("[Events] Error creating RSVP:", error);
    res.status(500).json({ message: "Failed to create RSVP" });
  }
});

// GET /api/events/:id/attendees - Get event attendees
router.get("/:id/attendees", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status = "going" } = req.query;

    const attendees = await db
      .select({
        rsvp: eventRsvps,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country
        }
      })
      .from(eventRsvps)
      .leftJoin(users, eq(eventRsvps.userId, users.id))
      .where(and(
        eq(eventRsvps.eventId, parseInt(id)),
        eq(eventRsvps.status, status as string)
      ))
      .orderBy(desc(eventRsvps.createdAt));

    res.json(attendees);
  } catch (error) {
    console.error("[Events] Error fetching attendees:", error);
    res.status(500).json({ message: "Failed to fetch attendees" });
  }
});

// ============================================================================
// EVENT COMMENTS ROUTES
// ============================================================================

// GET /api/events/:id/comments - Get event comments
router.get("/:id/comments", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comments = await db
      .select({
        comment: eventComments,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(eventComments)
      .leftJoin(users, eq(eventComments.userId, users.id))
      .where(eq(eventComments.eventId, parseInt(id)))
      .orderBy(desc(eventComments.createdAt));

    res.json(comments);
  } catch (error) {
    console.error("[Events] Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// POST /api/events/:id/comments - Add comment to event (auth required)
router.post("/:id/comments", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const [comment] = await db
      .insert(eventComments)
      .values({
        eventId: parseInt(id),
        userId,
        content
      })
      .returning();

    res.status(201).json(comment);
  } catch (error) {
    console.error("[Events] Error creating comment:", error);
    res.status(500).json({ message: "Failed to create comment" });
  }
});

// ============================================================================
// EVENT PHOTOS ROUTES
// ============================================================================

// GET /api/events/:id/photos - Get event photos
router.get("/:id/photos", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const photos = await db
      .select({
        photo: eventPhotos,
        uploader: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(eventPhotos)
      .leftJoin(users, eq(eventPhotos.uploaderId, users.id))
      .where(eq(eventPhotos.eventId, parseInt(id)))
      .orderBy(desc(eventPhotos.createdAt));

    res.json(photos);
  } catch (error) {
    console.error("[Events] Error fetching photos:", error);
    res.status(500).json({ message: "Failed to fetch photos" });
  }
});

// ============================================================================
// EVENT CHECK-IN (QR CODE)
// ============================================================================

// POST /api/events/:id/check-in - Check-in attendee (auth required, organizer only)
router.post("/:id/check-in", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { attendeeId } = req.body;

    if (!attendeeId) {
      return res.status(400).json({ message: "Attendee ID is required" });
    }

    // Check if user is organizer of event
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.userId !== userId && event.organizerId !== userId) {
      return res.status(403).json({ message: "Only event organizers can check-in attendees" });
    }

    // Find the RSVP
    const [rsvp] = await db
      .select()
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, parseInt(id)),
          eq(eventRsvps.userId, attendeeId)
        )
      )
      .limit(1);

    if (!rsvp) {
      return res.status(404).json({ message: "RSVP not found" });
    }

    if (rsvp.checkedIn) {
      return res.status(400).json({ message: "Already checked in" });
    }

    // Update RSVP to checked in
    const [updatedRsvp] = await db
      .update(eventRsvps)
      .set({
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: userId
      })
      .where(eq(eventRsvps.id, rsvp.id))
      .returning();

    res.json({
      message: "Check-in successful",
      rsvp: updatedRsvp
    });
  } catch (error) {
    console.error("[Events] Error checking in attendee:", error);
    res.status(500).json({ message: "Failed to check in attendee" });
  }
});

export default router;
