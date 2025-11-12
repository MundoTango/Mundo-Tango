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
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { eq, and, desc, gte, lte, sql, or, asc, inArray, count } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// ============================================================================
// EVENT ROUTES
// ============================================================================

// GET /api/events - List events with filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      city,
      country,
      eventType,
      startDate,
      endDate,
      status = "published",
      limit = "20",
      offset = "0"
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

// POST /api/events - Create new event (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
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

export default router;
