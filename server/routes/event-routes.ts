import { Router, type Request, type Response } from "express";
import { db } from "@shared/db";
import {
  events,
  eventRsvps,
  eventPhotos,
  eventComments,
  eventInvitations,
  eventTeamMembers,
  users,
  posts,
  scrapedEvents,
  insertEventSchema,
  insertEventRsvpSchema,
  insertEventCommentSchema,
  insertEventInvitationSchema
} from "@shared/schema";
import { notificationService } from "../services/notification-service";
import crypto from "crypto";
import { authenticateToken, optionalAuth, AuthRequest } from "../middleware/auth";
import { requireMinimumRole } from "../middleware/tierEnforcement";
import { eq, and, desc, gte, lte, sql, or, asc, inArray, count } from "drizzle-orm";
import { z } from "zod";
import { PostingPermissionService } from "../services/PostingPermissionService";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const router = Router();

// ============================================================================
// PERFORMANCE: SHARED EVENT FIELD SELECTORS (MB.MD Pattern 28 Optimization)
// Exclude coverImage from queries to avoid loading megabyte-scale base64 data
// ============================================================================
const eventSummaryFields = {
  id: events.id,
  title: events.title,
  slug: events.slug,
  description: events.description,
  eventType: events.eventType,
  category: events.category,
  userId: events.userId,
  startDate: events.startDate,
  endDate: events.endDate,
  date: events.date,
  timezone: events.timezone,
  isRecurring: events.isRecurring,
  location: events.location,
  venue: events.venue,
  venueName: events.venueName,
  address: events.address,
  city: events.city,
  country: events.country,
  latitude: events.latitude,
  longitude: events.longitude,
  isOnline: events.isOnline,
  onlineLink: events.onlineLink,
  meetingUrl: events.meetingUrl,
  imageUrl: events.imageUrl,  // URL-based images (not base64)
  coverImage: events.coverImage,  // RESTORED: Now safe - Object Storage URLs, not base64
  mediaUrls: events.mediaUrls,
  organizerId: events.organizerId,
  coOrganizers: events.coOrganizers,
  groupId: events.groupId,
  maxAttendees: events.maxAttendees,
  currentAttendees: events.currentAttendees,
  waitlistEnabled: events.waitlistEnabled,
  waitlistCount: events.waitlistCount,
  isPaid: events.isPaid,
  isFree: events.isFree,
  price: events.price,
  currency: events.currency,
  ticketUrl: events.ticketUrl,
  ticketLink: events.ticketLink,
  visibility: events.visibility,
  requiresApproval: events.requiresApproval,
  allowGuestPlusOne: events.allowGuestPlusOne,
  allowPhotos: events.allowPhotos,
  allowComments: events.allowComments,
  musicStyle: events.musicStyle,
  danceStyles: events.danceStyles,
  djName: events.djName,
  tags: events.tags,
  dressCode: events.dressCode,
  ageRestriction: events.ageRestriction,
  wheelchairAccessible: events.wheelchairAccessible,
  parkingAvailable: events.parkingAvailable,
  status: events.status,
  viewCount: events.viewCount,
  shareCount: events.shareCount,
  sourceName: events.sourceName,
  sourceUrl: events.sourceUrl,
  sourceUpdatedAt: events.sourceUpdatedAt,
  seriesId: events.seriesId,
  createdAt: events.createdAt,
  updatedAt: events.updatedAt,
  publishedAt: events.publishedAt,
  organizerText: events.organizerText,
  djText: events.djText,
  teacherText: events.teacherText,
  performerText: events.performerText,
  organizerProfiles: events.organizerProfiles,
  djProfiles: events.djProfiles,
  teacherProfiles: events.teacherProfiles,
  performerProfiles: events.performerProfiles,
};

// ============================================================================
// MULTER CONFIGURATION WITH SECURITY VALIDATION
// ============================================================================
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error(`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`));
      return;
    }
    cb(null, true);
  }
});

// Configure Cloudinary (ensure it uses env vars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// NOTE: Sample data fallback removed - MB.MD Pattern 58
// Real scraped events should always display from database

// ============================================================================
// PRO TEAM SEARCH - Search professionals by role for event staffing
// ============================================================================

// GET /api/events/search-pros-by-role - Search for DJs, photographers, etc.
router.get("/search-pros-by-role", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { role, city, q } = req.query;
    
    if (!role || typeof role !== 'string') {
      return res.status(400).json({ error: "Role parameter is required" });
    }

    // Use role value directly - matches TANGO_ROLES from client/src/lib/tangoRoles.ts
    const mappedRole = role.toLowerCase();

    // Build search query
    let query = db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        city: users.city,
        tangoRoles: users.tangoRoles,
        bio: users.bio
      })
      .from(users)
      .$dynamic();

    const conditions: any[] = [];
    
    // Search by role in tangoRoles array (case-insensitive, coalesce null to empty array)
    conditions.push(sql`EXISTS (SELECT 1 FROM unnest(COALESCE(${users.tangoRoles}, ARRAY[]::text[])) r WHERE LOWER(r) = LOWER(${mappedRole}))`);
    
    // Filter by city if provided (only if explicitly requested)
    if (city && typeof city === 'string' && city.trim()) {
      conditions.push(sql`${users.city} ILIKE ${'%' + city + '%'}`);
    }
    
    // Search by name/username if query provided
    if (q && typeof q === 'string' && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      conditions.push(
        or(
          sql`${users.name} ILIKE ${searchTerm}`,
          sql`${users.username} ILIKE ${searchTerm}`
        )!
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(20);

    res.json(results);
  } catch (error) {
    console.error("Error searching pros by role:", error);
    res.status(500).json({ error: "Failed to search professionals" });
  }
});

// ============================================================================
// EVENT ROUTES
// ============================================================================

// GET /api/events - List events with filters (includes approved scraped events)
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
      past,
      search,
      includeScraped = "true"
    } = req.query;

    // 1. Query main events table
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

    if (city) conditions.push(sql`LOWER(${events.city}) = LOWER(${city as string})`);
    if (country) conditions.push(eq(events.country, country as string));
    if (eventType) conditions.push(eq(events.eventType, eventType as string));
    if (startDate) conditions.push(gte(events.startDate, new Date(startDate as string)));
    if (endDate) conditions.push(lte(events.startDate, new Date(endDate as string)));

    // Handle search parameter
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

    // Handle category=my-events
    if (category === "my-events" && req.user) {
      conditions.push(eq(events.userId, req.user.id));
    }

    // Handle upcoming=true
    if (upcoming === "true") {
      conditions.push(gte(events.startDate, new Date()));
    }

    // Handle past=true
    if (past === "true") {
      conditions.push(lte(events.startDate, new Date()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const mainResults = await query
      .orderBy(asc(events.startDate))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    // 2. Also fetch scraped events if requested (for immediate visibility - no approval required)
    let allResults = mainResults;
    
    if (includeScraped === "true" && category !== "my-events") {
      // Show scraped events that are pending_review or approved (not rejected or already ingested)
      const scrapedConditions = [
        or(
          eq(scrapedEvents.status, 'pending_review'),
          eq(scrapedEvents.status, 'approved')
        )!
      ];
      
      if (city) {
        scrapedConditions.push(sql`LOWER(${scrapedEvents.city}) = LOWER(${city as string})`);
      }
      if (country) {
        scrapedConditions.push(eq(scrapedEvents.country, country as string));
      }
      if (eventType) {
        scrapedConditions.push(eq(scrapedEvents.eventType, eventType as string));
      }
      if (search && typeof search === 'string' && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        scrapedConditions.push(
          or(
            sql`${scrapedEvents.title} ILIKE ${searchTerm}`,
            sql`${scrapedEvents.description} ILIKE ${searchTerm}`,
            sql`${scrapedEvents.venue} ILIKE ${searchTerm}`,
            sql`${scrapedEvents.city} ILIKE ${searchTerm}`
          )!
        );
      }
      if (upcoming === "true") {
        scrapedConditions.push(gte(scrapedEvents.startDate, new Date()));
      }
      if (past === "true") {
        scrapedConditions.push(lte(scrapedEvents.startDate, new Date()));
      }

      const scrapedResults = await db
        .select()
        .from(scrapedEvents)
        .where(and(...scrapedConditions))
        .orderBy(asc(scrapedEvents.startDate))
        .limit(parseInt(limit as string));

      // Convert scraped events to match main event format
      const convertedScraped = scrapedResults.map(se => ({
        event: {
          id: se.id,
          title: se.title,
          slug: null,
          description: se.description,
          longDescription: null,
          eventType: se.eventType || 'milonga',
          category: null,
          userId: null,
          startDate: se.startDate,
          endDate: se.endDate,
          date: se.startDate,
          timezone: null,
          isRecurring: false,
          location: se.venue,
          venue: se.venue,
          venueName: se.venue,
          address: se.address,
          city: se.city,
          country: se.country,
          latitude: null,
          longitude: null,
          isOnline: false,
          onlineLink: null,
          meetingUrl: null,
          imageUrl: se.imageUrl,
          coverImage: se.imageUrl,
          mediaUrls: null,
          organizerId: null,
          coOrganizers: null,
          groupId: null,
          maxAttendees: null,
          currentAttendees: 0,
          waitlistEnabled: false,
          waitlistCount: 0,
          isPaid: se.price ? true : false,
          isFree: !se.price,
          price: se.price,
          currency: se.currency,
          ticketUrl: se.ticketUrl,
          ticketLink: se.ticketUrl,
          visibility: 'public',
          requiresApproval: false,
          allowGuestPlusOne: true,
          allowPhotos: true,
          allowComments: true,
          musicStyle: null,
          danceStyles: null,
          djName: null,
          tags: se.tags,
          dressCode: null,
          ageRestriction: null,
          wheelchairAccessible: null,
          parkingAvailable: null,
          status: 'published',
          viewCount: 0,
          shareCount: 0,
          sourceName: se.sourceName,
          sourceUrl: se.sourceUrl,
          sourceUpdatedAt: null,
          seriesId: null,
          createdAt: se.createdAt,
          updatedAt: se.updatedAt,
          publishedAt: se.createdAt,
          organizerText: se.organizerText,
          djText: se.djText,
          teacherText: se.teacherText,
          performerText: se.performerText,
          organizerProfiles: null,
          djProfiles: null,
          teacherProfiles: null,
          performerProfiles: null,
          isScraped: true,
          scrapedEventId: se.id
        },
        organizer: null,
        _count: 0
      }));

      // Merge and deduplicate by title + date
      const mainEventKeys = new Set(
        mainResults.map(r => `${r.event.title?.toLowerCase()}-${r.event.startDate?.toISOString()?.split('T')[0]}`)
      );
      
      const uniqueScraped = convertedScraped.filter(se => {
        const key = `${se.event.title?.toLowerCase()}-${se.event.startDate?.toISOString()?.split('T')[0]}`;
        return !mainEventKeys.has(key);
      });

      allResults = [...mainResults, ...uniqueScraped];
      
      // Sort combined results by startDate
      allResults.sort((a, b) => {
        const dateA = a.event.startDate ? new Date(a.event.startDate).getTime() : 0;
        const dateB = b.event.startDate ? new Date(b.event.startDate).getTime() : 0;
        return dateA - dateB;
      });
    }

    // MB.MD Pattern 58: Always return real data, no sample fallback
    res.json(allResults);
  } catch (error) {
    console.error("[Events] Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// ============================================================================
// SMART EVENT FILTERING (for personalized feeds)
// ============================================================================

// GET /api/events/smart - Smart filtering based on user's city + followed groups + RSVP'd events
router.get("/smart", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { limit = "20", offset = "0" } = req.query;

    // Get user's home city
    const [userData] = await db
      .select({ city: users.city, country: users.country })
      .from(users)
      .where(eq(users.id, userId));

    // Get cities from groups user has joined
    const joinedGroups = await db
      .select({ 
        city: sql<string>`${sql.raw('groups')}.city`,
        country: sql<string>`${sql.raw('groups')}.country`
      })
      .from(sql.raw('group_members'))
      .innerJoin(sql.raw('groups'), sql`${sql.raw('group_members')}.group_id = ${sql.raw('groups')}.id`)
      .where(sql`${sql.raw('group_members')}.user_id = ${userId} AND ${sql.raw('group_members')}.status = 'active'`);

    // Get event IDs user has RSVP'd to
    const rsvpEvents = await db
      .select({ eventId: eventRsvps.eventId })
      .from(eventRsvps)
      .where(and(
        eq(eventRsvps.userId, userId),
        or(eq(eventRsvps.status, 'going'), eq(eventRsvps.status, 'interested'))
      ));

    const rsvpEventIds = rsvpEvents.map(r => r.eventId);

    // Build city conditions
    const cityConditions: any[] = [];
    
    // Add user's home city
    if (userData?.city) {
      cityConditions.push(eq(events.city, userData.city));
    }

    // Add cities from joined groups
    for (const group of joinedGroups) {
      if (group.city) {
        cityConditions.push(eq(events.city, group.city));
      }
    }

    // Build main query conditions
    const mainConditions = [
      eq(events.status, "published"),
      gte(events.startDate, new Date())
    ];

    // Add RSVP'd events OR city-based events
    if (rsvpEventIds.length > 0 || cityConditions.length > 0) {
      const combinedConditions: any[] = [];
      
      if (rsvpEventIds.length > 0) {
        combinedConditions.push(inArray(events.id, rsvpEventIds));
      }
      
      if (cityConditions.length > 0) {
        combinedConditions.push(or(...cityConditions));
      }

      if (combinedConditions.length > 0) {
        mainConditions.push(or(...combinedConditions)!);
      }
    }

    const results = await db
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
        )`.as('attendee_count'),
        isRsvpd: sql<boolean>`EXISTS(
          SELECT 1 FROM ${eventRsvps} 
          WHERE ${eventRsvps.eventId} = ${events.id} 
          AND ${eventRsvps.userId} = ${userId}
        )`.as('is_rsvpd')
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .where(and(...mainConditions))
      .orderBy(asc(events.startDate))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json({
      events: results,
      filters: {
        userCity: userData?.city,
        joinedCities: joinedGroups.map(g => g.city).filter(Boolean),
        rsvpEventCount: rsvpEventIds.length
      }
    });
  } catch (error) {
    console.error("[Events] Error fetching smart events:", error);
    res.status(500).json({ message: "Failed to fetch personalized events" });
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
      types,
      priceMin,
      priceMax,
      danceStyle,
      skillLevel,
      online,
      verified,
      tags,
      languages,
      languageMatchOnly,
      past,
      sortBy = "date",
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

    // Date range filter (use startDateTime if startDate is null)
    if (dateFrom) {
      conditions.push(
        sql`COALESCE(${events.startDate}, ${events.startDateTime}::date) >= ${new Date(dateFrom as string)}`
      );
    }
    if (dateTo) {
      conditions.push(
        sql`COALESCE(${events.startDate}, ${events.startDateTime}::date) <= ${new Date(dateTo as string)}`
      );
    }

    // Event type filter (single or multiple types)
    if (type && typeof type === 'string') {
      conditions.push(eq(events.eventType, type));
    } else if (types && typeof types === 'string') {
      const typeList = types.split(',').map(t => t.trim().toLowerCase());
      conditions.push(
        sql`LOWER(${events.eventType}) = ANY(ARRAY[${sql.raw(typeList.map(t => `'${t}'`).join(','))}])`
      );
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

    // Language filter
    // Note: Requires hostLanguages field on events table (text[])
    // Schema update needed: hostLanguages: text("host_languages").array()
    if (languages && typeof languages === 'string') {
      const languageArray = languages.split(',').map(l => l.trim());
      if (languageMatchOnly === "true") {
        // Strict matching - event must have at least one of the specified languages
        conditions.push(
          sql`${events.tags} && ARRAY[${sql.join(languageArray.map(l => sql`${l}`), sql`, `)}]::text[]`
        );
      }
      // Note: Once hostLanguages field is added, replace with:
      // conditions.push(
      //   sql`${events.hostLanguages} && ARRAY[${sql.join(languageArray.map(l => sql`${l}`), sql`, `)}]::text[]`
      // );
    }

    // Past events filter - show events that have already ended
    // If past=true, show only past events
    // Otherwise, default to showing only upcoming events (startDate >= today)
    const { upcoming } = req.query;
    if (past === "true") {
      conditions.push(lte(events.startDate, new Date()));
    } else {
      // Default: show only upcoming events (today and future)
      conditions.push(gte(events.startDate, new Date()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting - with support for prioritizing big events (festivals, marathons, encuentros)
    const { prioritizeBigEvents } = req.query;
    
    switch (sortBy) {
      case "date":
        query = query.orderBy(asc(events.startDate));
        break;
      case "price":
        query = query.orderBy(asc(sql`CAST(${events.price} AS NUMERIC)`));
        break;
      case "relevance":
      default:
        if (prioritizeBigEvents === "true") {
          // Prioritize big events: festivals, marathons, encuentros, competitions first
          query = query.orderBy(
            desc(sql`CASE 
              WHEN ${events.eventType} IN ('festival', 'marathon', 'encuentro', 'competition') THEN 3
              WHEN ${events.eventType} IN ('workshop', 'performance') THEN 2
              ELSE 1
            END`),
            desc(events.startDate)
          );
        } else if (q) {
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

// GET /api/events/invitations/pending - Get user's pending invitations (MUST be before /:id route!)
router.get("/invitations/pending", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const invitations = await db
      .select({
        invitation: eventInvitations,
        event: {
          id: events.id,
          title: events.title,
          startDate: events.startDate,
          venue: events.venue,
          city: events.city,
          imageUrl: events.imageUrl
        },
        inviter: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(eventInvitations)
      .innerJoin(events, eq(eventInvitations.eventId, events.id))
      .leftJoin(users, eq(eventInvitations.inviterId, users.id))
      .where(and(
        eq(eventInvitations.inviteeId, userId),
        eq(eventInvitations.status, 'pending')
      ))
      .orderBy(desc(eventInvitations.createdAt));

    res.json(invitations);
  } catch (error) {
    console.error("[Events] Error fetching pending invitations:", error);
    res.status(500).json({ message: "Failed to fetch invitations" });
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

    // Flatten response to match frontend expected format: { eventId, status, event, organizer }
    const flattenedRsvps = userRsvps.map(item => ({
      eventId: item.rsvp.eventId,
      status: item.rsvp.status,
      createdAt: item.rsvp.createdAt,
      event: item.event,
      organizer: item.organizer
    }));

    res.json(flattenedRsvps);
  } catch (error) {
    console.error("[Events] Error fetching user RSVPs:", error);
    res.status(500).json({ message: "Failed to fetch user RSVPs" });
  }
});

// GET /api/events/city-group - Get events from user's city groups (MUST be before /:id route!)
router.get("/city-group", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const upcoming = req.query.upcoming === 'true';
    
    // Get user's city group memberships
    const userCityGroups = await db
      .select({ groupId: groupMembers.groupId, city: groups.city, country: groups.country })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(and(
        eq(groupMembers.userId, userId),
        eq(groupMembers.status, 'active'),
        eq(groups.type, 'city')
      ));
    
    if (userCityGroups.length === 0) {
      // Fallback: return general upcoming events if user has no city groups
      const now = new Date();
      const fallbackEvents = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          startDate: events.startDate,
          endDate: events.endDate,
          location: events.location,
          city: events.city,
          country: events.country,
          imageUrl: events.imageUrl,
          rsvpCount: events.rsvpCount,
          category: events.category,
        })
        .from(events)
        .where(and(
          eq(events.status, 'published'),
          upcoming ? gte(events.startDate, now) : undefined
        ))
        .orderBy(events.startDate)
        .limit(limit);
      
      return res.json(fallbackEvents);
    }
    
    // Get events from user's city groups
    const cities = userCityGroups.map(g => g.city).filter(Boolean) as string[];
    const now = new Date();
    
    const cityGroupEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        city: events.city,
        country: events.country,
        imageUrl: events.imageUrl,
        rsvpCount: events.rsvpCount,
        category: events.category,
      })
      .from(events)
      .where(and(
        eq(events.status, 'published'),
        inArray(events.city, cities),
        upcoming ? gte(events.startDate, now) : undefined
      ))
      .orderBy(events.startDate)
      .limit(limit);
    
    res.json(cityGroupEvents);
  } catch (error) {
    console.error("[Events] Error fetching city group events:", error);
    res.status(500).json({ message: "Failed to fetch city group events" });
  }
});

// GET /api/events/upcoming - Get upcoming events (MUST be before /:id route!)
router.get("/upcoming", async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const upcomingEvents = await db
      .select({
        event: events,
        organizer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .where(gte(events.startDate, now))
      .orderBy(events.startDate)
      .limit(10);

    res.json(upcomingEvents);
  } catch (error) {
    console.error("[Events] Error fetching upcoming events:", error);
    res.status(500).json({ message: "Failed to fetch upcoming events" });
  }
});

// GET /api/events/:id - Get event details
// PERFORMANCE: Uses eventSummaryFields to exclude base64 coverImage from DB query
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db
      .select({
        event: eventSummaryFields,  // OPTIMIZED: excludes coverImage from DB load
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
    
    // Fetch team members from event_team_members table with user profiles
    const teamMembers = await db
      .select({
        role: eventTeamMembers.role,
        userId: eventTeamMembers.userId,
        displayName: eventTeamMembers.displayName,
        userName: users.name,
        userUsername: users.username,
        userProfileImage: users.profileImage,
        userBio: users.bio
      })
      .from(eventTeamMembers)
      .leftJoin(users, eq(eventTeamMembers.userId, users.id))
      .where(eq(eventTeamMembers.eventId, parseInt(id)));
    
    // Helper to create profile from team member
    const toProfile = (m: typeof teamMembers[0]) => ({
      id: m.userId,
      name: m.userName || m.displayName,
      username: m.userUsername,
      profileImage: m.userProfileImage,
      bio: m.userBio
    });
    
    // Group team members by role
    const djProfiles = teamMembers.filter(m => m.role === 'dj').map(toProfile);
    const teacherProfiles = teamMembers.filter(m => m.role === 'teacher').map(toProfile);
    const performerProfiles = teamMembers.filter(m => m.role === 'performer').map(toProfile);
    const organizerProfiles = teamMembers.filter(m => m.role === 'organizer').map(toProfile);
    
    // PERFORMANCE FIX: Filter out base64 data from mediaUrls (can be megabytes per image)
    const eventData = result[0].event;
    const cleanMediaUrls = eventData.mediaUrls?.filter((url: string) => !url?.startsWith('data:')) || [];
    
    // Derive text fields from profiles if not already set (for scraped events)
    const derivedDjText = eventData.djText || djProfiles.map(p => p.name).join(', ') || null;
    const derivedTeacherText = eventData.teacherText || teacherProfiles.map(p => p.name).join(', ') || null;
    const derivedPerformerText = eventData.performerText || performerProfiles.map(p => p.name).join(', ') || null;
    const derivedOrganizerText = eventData.organizerText || organizerProfiles.map(p => p.name).join(', ') || null;
    
    res.json({
      event: {
        ...eventData,
        mediaUrls: cleanMediaUrls,  // Only URL-based media, no base64
        djText: derivedDjText,
        teacherText: derivedTeacherText,
        performerText: derivedPerformerText,
        organizerText: derivedOrganizerText,
        djProfiles,
        teacherProfiles,
        performerProfiles,
        organizerProfiles
      },
      organizer: result[0].organizer,
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
// AUTO-CREATES: City if not found, based on event city field
router.post("/", authenticateToken, requireMinimumRole(3), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startTime, endTime, timezone, maxCapacity, ...rest } = req.body;
    
    console.log("[Events] Creating event for user:", userId);
    console.log("[Events] Request body keys:", Object.keys(req.body));
    console.log("[Events] Title:", rest.title, "| Description length:", rest.description?.length || 0);
    console.log("[Events] Location:", rest.location, "| City:", rest.city, "| Country:", rest.country);
    console.log("[Events] Photos count:", rest.photos?.length || 0, "| Cover URL:", rest.coverImageUrl ? "yes" : "no");
    
    // Combine date with time if time strings are provided
    let startDate = new Date(rest.startDate);
    let endDate = new Date(rest.endDate || rest.startDate);
    
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      startDate.setHours(hours, minutes, 0, 0);
    }
    
    if (endTime) {
      const [hours, minutes] = endTime.split(':').map(Number);
      endDate.setHours(hours, minutes, 0, 0);
    }
    
    // Build clean event data with required fields only
    const cleanData = {
      title: rest.title,
      description: rest.description,
      eventType: rest.eventType,
      startDate,
      endDate,
      location: rest.location || rest.city || "Unknown Location",
      venue: rest.venue || null,
      venueName: rest.venueName || null,
      address: rest.address || null,
      city: rest.city || null,
      country: rest.country || null,
      latitude: rest.latitude ? String(rest.latitude) : null,
      longitude: rest.longitude ? String(rest.longitude) : null,
      timezone: timezone || "UTC",
      maxAttendees: maxCapacity || null,
      musicStyle: rest.musicStyle || null,
      danceStyles: rest.danceStyles || null,
      experienceLevel: rest.level || "all",
      attendeeCloseness: rest.attendeeCloseness || "all",
      price: rest.price || null,
      currency: rest.currency || "USD",
      isFree: rest.isFree !== false,
      isPaid: rest.price ? true : false,
      isOnline: false,
      visibility: "public",
      imageUrl: rest.coverImageUrl || null,  // FIX: Save to imageUrl for hero section display
      coverImage: rest.coverImageUrl || null,  // Also save to coverImage for backward compatibility
      mediaUrls: rest.photos?.map((p: any) => p.url) || null
    };

    const [event] = await db
      .insert(events)
      .values({
        ...cleanData,
        userId,
        status: "published"
      })
      .returning();

    // AUTO-RSVP: Organizer is automatically "going" to their own event
    try {
      await db
        .insert(eventRsvps)
        .values({
          eventId: event.id,
          userId,
          status: "going",
          isOrganizer: true,
        })
        .onConflictDoNothing();
      console.log("[Events] Auto-RSVP'd organizer as going to event:", event.id);
    } catch (rsvpError) {
      // Non-blocking - event creation still succeeds
      console.error("[Events] Auto-RSVP failed (non-blocking):", rsvpError);
    }

    // PRO TEAM: Save team members (DJs, photographers, teachers, etc.)
    if (rest.proTeam && Array.isArray(rest.proTeam) && rest.proTeam.length > 0) {
      try {
        const teamRecords = rest.proTeam.map((member: { userId: number; role: string; displayName: string }) => ({
          eventId: event.id,
          userId: member.userId,
          role: member.role as any,
          displayName: member.displayName,
          source: "user_submitted",
          confidence: 1.0,
        }));
        
        await db.insert(eventTeamMembers).values(teamRecords).onConflictDoNothing();
        console.log(`[Events] Added ${rest.proTeam.length} pro team members to event:`, event.id);
      } catch (teamError) {
        // Non-blocking - event creation still succeeds
        console.error("[Events] Pro team creation failed (non-blocking):", teamError);
      }
    }

    // CASCADE: Auto-create city group if new location (Pattern 8: Cascade Detection)
    if (cleanData.city && cleanData.country) {
      try {
        const { ensureCityGroupExists } = await import("../utils/cityGroupAutomation");
        const cityGroupResult = await ensureCityGroupExists(
          cleanData.city,
          cleanData.country,
          userId
        );
        
        if (cityGroupResult?.wasCreated) {
          console.log(`[Events] CASCADE: Created new city group "${cityGroupResult.groupName}" for event ${event.id}`);
        } else if (cityGroupResult) {
          console.log(`[Events] City group "${cityGroupResult.groupName}" already exists for ${cleanData.city}`);
        }
      } catch (cascadeError) {
        // Don't fail event creation if cascade fails
        console.error("[Events] City group cascade error (non-blocking):", cascadeError);
      }
    }

    res.status(201).json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[Events] Validation error:", error.errors);
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("[Events] Error creating event:", error);
    res.status(500).json({ message: "Failed to create event", error: String(error).substring(0, 200) });
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

// POST /api/events/:id/rsvp - RSVP to event (auth required) with capacity enforcement
router.post("/:id/rsvp", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const eventId = parseInt(req.params.id);
    const { status = "going", guestCount = 0 } = req.body;

    console.log(`[Events RSVP] Creating RSVP - userId: ${userId}, eventId: ${eventId}, status: ${status}`);

    // Check if event exists and get capacity info
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      console.log(`[Events RSVP] Event not found: ${eventId}`);
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if already RSVP'd
    const [existing] = await db
      .select()
      .from(eventRsvps)
      .where(and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.userId, userId)
      ))
      .limit(1);

    // Capacity enforcement for new RSVPs or status changes to 'going'
    if (status === "going" && (!existing || existing.status !== "going")) {
      const maxCapacity = event.maxAttendees || event.capacity;
      if (maxCapacity && maxCapacity > 0) {
        // Count current attendees
        const [{ count: currentCount }] = await db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(eventRsvps)
          .where(and(
            eq(eventRsvps.eventId, eventId),
            eq(eventRsvps.status, "going")
          ));

        const totalNeeded = (existing?.status === "going" ? 0 : 1) + guestCount;
        if (currentCount + totalNeeded > maxCapacity) {
          console.log(`[Events RSVP] Event at capacity: ${currentCount}/${maxCapacity}`);
          return res.status(409).json({ 
            message: "Event is at full capacity",
            capacity: maxCapacity,
            current: currentCount,
            waitlistAvailable: true
          });
        }
      }
    }

    if (existing) {
      console.log(`[Events RSVP] Updating existing RSVP for user ${userId} on event ${eventId}`);
      const previousStatus = existing.status;
      const [updated] = await db
        .update(eventRsvps)
        .set({ status, guestCount, updatedAt: new Date() })
        .where(and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, userId)
        ))
        .returning();

      // Update attendee count if status changed
      if (previousStatus !== status) {
        const delta = (status === "going" ? 1 : 0) - (previousStatus === "going" ? 1 : 0);
        if (delta !== 0) {
          await db
            .update(events)
            .set({ currentAttendees: sql`GREATEST(0, COALESCE(${events.currentAttendees}, 0) + ${delta})` })
            .where(eq(events.id, eventId));
        }
      }

      console.log(`[Events RSVP] Updated RSVP:`, updated);
      return res.json(updated);
    }

    // Create new RSVP
    console.log(`[Events RSVP] Creating new RSVP - values: { eventId: ${eventId}, userId: ${userId}, status: ${status}, guestCount: ${guestCount} }`);
    const [rsvp] = await db
      .insert(eventRsvps)
      .values({
        eventId,
        userId,
        status,
        guestCount
      })
      .returning();

    console.log(`[Events RSVP] RSVP created successfully:`, rsvp);

    // Update event attendee count for 'going' status
    if (status === "going") {
      await db
        .update(events)
        .set({
          currentAttendees: sql`COALESCE(${events.currentAttendees}, 0) + ${guestCount + 1}`
        })
        .where(eq(events.id, eventId));
    }

    console.log(`[Events RSVP] Event attendee count updated`);
    
    // Notify event organizer about new RSVP
    if (event.userId !== userId) {
      notificationService.notifyEventRsvp(event.userId, eventId, event.title, userId, status).catch(console.error);
    }
    
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
    const { status = "all" } = req.query;

    const whereConditions = [eq(eventRsvps.eventId, parseInt(id))];
    
    if (status !== "all") {
      whereConditions.push(eq(eventRsvps.status, status as string));
    }

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
      .where(and(...whereConditions))
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

// GET /api/events/:id/photos - Get event photos (includes organizer photos from mediaUrls)
router.get("/:id/photos", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get photos from eventPhotos table (participant uploads)
    const participantPhotos = await db
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

    // Get event to include organizer photos from mediaUrls
    const [event] = await db
      .select({
        id: events.id,
        userId: events.userId,
        mediaUrls: events.mediaUrls,
        organizerName: users.name,
        organizerUsername: users.username,
        organizerImage: users.profileImage
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    // Transform organizer photos from mediaUrls to same format
    const organizerPhotos = (event?.mediaUrls || []).map((url: string, idx: number) => ({
      photo: {
        id: -(idx + 1), // Negative IDs for organizer photos (won't conflict with DB)
        eventId: parseInt(id),
        uploaderId: event?.userId || 0,
        photoUrl: url,
        imageUrl: url, // Add imageUrl for frontend compatibility
        caption: null,
        isOrganizer: true,
        createdAt: null
      },
      uploader: {
        id: event?.userId || 0,
        name: event?.organizerName || 'Organizer',
        username: event?.organizerUsername || 'organizer',
        profileImage: event?.organizerImage || null
      },
      isOrganizer: true
    }));

    // Normalize participant photos to include imageUrl for frontend
    const normalizedParticipantPhotos = participantPhotos.map(p => ({
      ...p,
      photo: {
        ...p.photo,
        imageUrl: p.photo.photoUrl // Add imageUrl alias
      },
      isOrganizer: false
    }));

    // Combine: organizer photos first, then participant photos
    res.json([...organizerPhotos, ...normalizedParticipantPhotos]);
  } catch (error) {
    console.error("[Events] Error fetching photos:", error);
    res.status(500).json({ message: "Failed to fetch photos" });
  }
});

// Helper function to validate image magic bytes
function validateImageMagicBytes(buffer: Buffer): { valid: boolean; type: string | null } {
  if (buffer.length < 4) return { valid: false, type: null };
  
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, type: 'image/jpeg' };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { valid: true, type: 'image/png' };
  }
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return { valid: true, type: 'image/gif' };
  }
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && 
      buffer.length >= 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return { valid: true, type: 'image/webp' };
  }
  
  return { valid: false, type: null };
}

// POST /api/events/:id/photos - Upload photo to event (auth required, RSVP'd or organizer)
router.post("/:id/photos", authenticateToken, upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const eventId = parseInt(req.params.id);
    const { caption } = req.body;

    // Check event exists
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is organizer or RSVP'd
    const isOrganizer = event.userId === userId || event.organizerId === userId;
    
    if (!isOrganizer) {
      const [rsvp] = await db
        .select()
        .from(eventRsvps)
        .where(and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, userId),
          eq(eventRsvps.status, "going")
        ))
        .limit(1);

      if (!rsvp) {
        return res.status(403).json({ message: "Only event attendees can upload photos" });
      }
    }

    // Upload to Cloudinary
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Validate magic bytes to prevent spoofed MIME types
    const magicCheck = validateImageMagicBytes(file.buffer);
    if (!magicCheck.valid) {
      return res.status(400).json({ 
        message: "Invalid image file. File content does not match a valid image format." 
      });
    }

    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `events/${eventId}`,
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto", fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    // Insert into database
    const [photo] = await db
      .insert(eventPhotos)
      .values({
        eventId,
        uploaderId: userId,
        photoUrl: result.secure_url,
        thumbnailUrl: result.secure_url.replace('/upload/', '/upload/w_300,h_300,c_fill/'),
        caption: caption || null
      })
      .returning();

    // Get uploader info
    const [uploader] = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Notify event organizer about new photo upload
    if (event.userId !== userId) {
      notificationService.notifyEventPhotoUploaded(event.userId, eventId, event.title, userId).catch(console.error);
    }

    res.status(201).json({
      photo: { ...photo, imageUrl: photo.photoUrl },
      uploader,
      isOrganizer: false
    });
  } catch (error) {
    console.error("[Events] Error uploading photo:", error);
    res.status(500).json({ message: "Failed to upload photo" });
  }
});

// DELETE /api/events/:id/photos/:photoId - Delete photo (auth required, owner or organizer)
router.delete("/:id/photos/:photoId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const eventId = parseInt(req.params.id);
    const photoId = parseInt(req.params.photoId);

    // Check if photo exists
    const [photo] = await db
      .select()
      .from(eventPhotos)
      .where(and(
        eq(eventPhotos.id, photoId),
        eq(eventPhotos.eventId, eventId)
      ))
      .limit(1);

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Check if user is photo owner or event organizer
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    const isPhotoOwner = photo.uploaderId === userId;
    const isOrganizer = event?.userId === userId || event?.organizerId === userId;

    if (!isPhotoOwner && !isOrganizer) {
      return res.status(403).json({ message: "Not authorized to delete this photo" });
    }

    // Delete from database (Cloudinary cleanup could be added later)
    await db
      .delete(eventPhotos)
      .where(eq(eventPhotos.id, photoId));

    res.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("[Events] Error deleting photo:", error);
    res.status(500).json({ message: "Failed to delete photo" });
  }
});

// POST /api/events/:id/photos/:photoId/report - Report a photo (auth required)
router.post("/:id/photos/:photoId/report", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const eventId = parseInt(req.params.id);
    const photoId = parseInt(req.params.photoId);
    const { reason } = req.body;

    // Check if photo exists
    const [photo] = await db
      .select()
      .from(eventPhotos)
      .where(and(
        eq(eventPhotos.id, photoId),
        eq(eventPhotos.eventId, eventId)
      ))
      .limit(1);

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // For now, just log the report (could add a reports table later)
    console.log(`[Events] Photo ${photoId} reported by user ${userId}: ${reason || 'No reason given'}`);

    res.json({ message: "Photo reported successfully. Our team will review it." });
  } catch (error) {
    console.error("[Events] Error reporting photo:", error);
    res.status(500).json({ message: "Failed to report photo" });
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

// ============================================================================
// EVENT POSTS (Discussion Tab)
// ============================================================================

// GET /api/events/:id/permissions - Get user's posting permissions for an event
router.get("/:id/permissions", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const eventId = parseInt(req.params.id);
    
    console.log(`[Events Permissions] Request for eventId: ${eventId}, userId: ${userId || 'unauthenticated'}`);

    // Return default (no permission) for unauthenticated users
    if (!userId) {
      console.log(`[Events Permissions] Unauthenticated user, returning default permissions`);
      return res.json({
        canPost: false,
        canComment: false,
        role: null,
        isRsvpd: false,
        isOrganizer: false,
        reason: "Login to join the discussion"
      });
    }

    console.log(`[Events Permissions] Fetching permissions for userId: ${userId}, eventId: ${eventId}`);
    const permissions = await PostingPermissionService.getEventPermissions(userId, eventId);
    console.log(`[Events Permissions] PostingPermissionService returned:`, JSON.stringify(permissions));
    
    // Check if user is the event organizer
    const [event] = await db.select({ userId: events.userId }).from(events).where(eq(events.id, eventId)).limit(1);
    const isOrganizer = event?.userId === userId;
    
    const result = { ...permissions, isOrganizer };
    console.log(`[Events Permissions] Final result:`, JSON.stringify(result));
    res.json(result);
  } catch (error) {
    console.error("[Events] Error fetching permissions:", error);
    res.status(500).json({ message: "Failed to fetch permissions" });
  }
});

// GET /api/events/:id/posts - Get all posts for an event
router.get("/:id/posts", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = "20", offset = "0" } = req.query;

    const eventPosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        eventId: posts.eventId,
        content: posts.content,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        visibility: posts.visibility,
        likes: posts.likes,
        comments: posts.comments,
        createdAt: posts.createdAt,
        tags: posts.tags,
        location: posts.location,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.eventId, parseInt(id)))
      .orderBy(desc(posts.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(eventPosts);
  } catch (error) {
    console.error("[Events] Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// POST /api/events/:id/posts - Create a post for an event (RBAC enforced)
router.post("/:id/posts", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { content, imageUrl, videoUrl, tags, location } = req.body;
    const eventId = parseInt(id);

    // Verify event exists
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Allow any logged-in user to post to event discussions (no RSVP required)
    // This enables open community discussion about events

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const [post] = await db
      .insert(posts)
      .values({
        userId,
        eventId: eventId,
        content: content.trim(),
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        tags: tags || [],
        location: location || null,
        visibility: "public",
        postType: "event_discussion"
      })
      .returning();

    // Fetch with user info
    const [postWithUser] = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        eventId: posts.eventId,
        content: posts.content,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        visibility: posts.visibility,
        likes: posts.likes,
        comments: posts.comments,
        createdAt: posts.createdAt,
        tags: posts.tags,
        location: posts.location,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, post.id))
      .limit(1);

    res.status(201).json(postWithUser);

    // Send notification to organizer about new post
    if (event.userId !== userId) {
      notificationService.notifyEventPost(event.userId, eventId, event.title, userId).catch(console.error);
    }
  } catch (error) {
    console.error("[Events] Error creating post:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
});

// ============================================================================
// EVENT INVITATION ROUTES
// ============================================================================

// POST /api/events/:id/invitations - Invite user(s) to event (organizer or attendee)
router.post("/:id/invitations", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const eventId = parseInt(req.params.id);
    const { inviteeIds, emails, message, role } = req.body;

    // Check event exists
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const isOrganizer = event.userId === userId || event.organizerId === userId;
    
    // Check if user can invite (organizer or RSVP'd attendee)
    if (!isOrganizer) {
      const [rsvp] = await db
        .select()
        .from(eventRsvps)
        .where(and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, userId),
          eq(eventRsvps.status, "going")
        ))
        .limit(1);

      if (!rsvp) {
        return res.status(403).json({ message: "Only organizers and attendees can invite others" });
      }
    }

    const invitations = [];

    // Handle user ID invitations
    if (inviteeIds && Array.isArray(inviteeIds)) {
      for (const inviteeId of inviteeIds) {
        // Skip if already invited
        const [existing] = await db
          .select()
          .from(eventInvitations)
          .where(and(
            eq(eventInvitations.eventId, eventId),
            eq(eventInvitations.inviteeId, inviteeId)
          ))
          .limit(1);

        if (existing) continue;

        const inviteCode = crypto.randomBytes(16).toString('hex');
        const [invitation] = await db
          .insert(eventInvitations)
          .values({
            eventId,
            inviterId: userId,
            inviteeId,
            inviteCode,
            message: message || null,
            role: role || 'guest',
            status: 'pending',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          })
          .returning();

        invitations.push(invitation);

        // Send notification
        notificationService.notifyEventInvitation(inviteeId, eventId, event.title, userId).catch(console.error);
      }
    }

    // Handle email invitations (for non-users)
    if (emails && Array.isArray(emails)) {
      for (const emailObj of emails) {
        const email = typeof emailObj === 'string' ? emailObj : emailObj.email;
        const name = typeof emailObj === 'string' ? null : emailObj.name;

        const inviteCode = crypto.randomBytes(16).toString('hex');
        const [invitation] = await db
          .insert(eventInvitations)
          .values({
            eventId,
            inviterId: userId,
            inviteeEmail: email,
            inviteeName: name,
            inviteCode,
            message: message || null,
            role: role || 'guest',
            status: 'pending',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          })
          .returning();

        invitations.push(invitation);
        // TODO: Send email invitation
      }
    }

    res.status(201).json({ 
      message: `${invitations.length} invitation(s) sent`,
      invitations 
    });
  } catch (error) {
    console.error("[Events] Error creating invitations:", error);
    res.status(500).json({ message: "Failed to create invitations" });
  }
});

// GET /api/events/:id/invitations - Get event invitations (organizer only)
router.get("/:id/invitations", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const eventId = parseInt(req.params.id);

    // Check if user is organizer
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.userId !== userId && event.organizerId !== userId) {
      return res.status(403).json({ message: "Only organizers can view invitations" });
    }

    const invitations = await db
      .select({
        invitation: eventInvitations,
        inviter: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(eventInvitations)
      .leftJoin(users, eq(eventInvitations.inviterId, users.id))
      .where(eq(eventInvitations.eventId, eventId))
      .orderBy(desc(eventInvitations.createdAt));

    res.json(invitations);
  } catch (error) {
    console.error("[Events] Error fetching invitations:", error);
    res.status(500).json({ message: "Failed to fetch invitations" });
  }
});


// POST /api/events/:id/invitations/:invitationId/respond - Respond to invitation
router.post("/:id/invitations/:invitationId/respond", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const eventId = parseInt(req.params.id);
    const invitationId = parseInt(req.params.invitationId);
    const { response } = req.body; // 'accepted' or 'declined'

    if (!['accepted', 'declined'].includes(response)) {
      return res.status(400).json({ message: "Invalid response. Use 'accepted' or 'declined'" });
    }

    // Find invitation
    const [invitation] = await db
      .select()
      .from(eventInvitations)
      .where(and(
        eq(eventInvitations.id, invitationId),
        eq(eventInvitations.eventId, eventId),
        eq(eventInvitations.inviteeId, userId)
      ))
      .limit(1);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: "Invitation already responded to" });
    }

    // Update invitation
    const [updated] = await db
      .update(eventInvitations)
      .set({ 
        status: response,
        respondedAt: new Date()
      })
      .where(eq(eventInvitations.id, invitationId))
      .returning();

    // If accepted, auto-RSVP
    if (response === 'accepted') {
      const [existingRsvp] = await db
        .select()
        .from(eventRsvps)
        .where(and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, userId)
        ))
        .limit(1);

      if (!existingRsvp) {
        await db
          .insert(eventRsvps)
          .values({
            eventId,
            userId,
            status: 'going',
            guestCount: 0
          });
      }
    }

    res.json(updated);
  } catch (error) {
    console.error("[Events] Error responding to invitation:", error);
    res.status(500).json({ message: "Failed to respond to invitation" });
  }
});

// ============================================================================
// SMART TEAM MEMBER SEARCH (MB.MD Pattern 28 - Parallel Agent Orchestration)
// ============================================================================
// Search Priority:
// 1. Previous collaborators (users the organizer has worked with before)
// 2. City-based professionals with matching tangoRole
// 3. All users with matching tangoRole
// 4. General user search fallback

router.get("/:id/search-team-members", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const eventId = parseInt(req.params.id);
    const role = (req.query.role as string) || '';
    const query = (req.query.q as string) || '';
    const limit = Math.min(parseInt(req.query.limit as string) || 15, 50);

    if (!query || query.length < 2) {
      return res.json([]);
    }

    // Get event and organizer info
    const [event] = await db
      .select({
        id: events.id,
        organizerId: events.organizerId,
        userId: events.userId,
        city: events.city,
        country: events.country
      })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const organizerId = event.organizerId || event.userId;
    
    // Get organizer's city for location-based search
    const [organizer] = await db
      .select({ city: users.city, country: users.country })
      .from(users)
      .where(eq(users.id, organizerId!))
      .limit(1);

    const searchCity = event.city || organizer?.city || '';
    const searchLower = query.toLowerCase();

    // Map participant roles to tangoRoles array values
    const tangoRoleMapping: Record<string, string> = {
      'dj': 'dj',
      'teacher': 'teacher',
      'performer': 'performer',
      'photographer': 'photographer',
      'host': 'organizer',
      'co_organizer': 'organizer'
    };
    const mappedRole = tangoRoleMapping[role] || role;

    // TIER 1: Previous collaborators (users who have participated in organizer's past events)
    const previousCollaborators = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        profileImage: users.profileImage,
        city: users.city,
        tangoRoles: users.tangoRoles,
        tier: sql<number>`1`.as('tier')
      })
      .from(users)
      .innerJoin(eventRsvps, eq(users.id, eventRsvps.userId))
      .innerJoin(events, eq(eventRsvps.eventId, events.id))
      .where(and(
        or(
          eq(events.organizerId, organizerId!),
          eq(events.userId, organizerId!)
        ),
        sql`${events.id} != ${eventId}`,
        or(
          sql`LOWER(${users.name}) LIKE ${'%' + searchLower + '%'}`,
          sql`LOWER(${users.username}) LIKE ${'%' + searchLower + '%'}`
        ),
        mappedRole ? sql`${users.tangoRoles} @> ARRAY[${mappedRole}]::text[]` : sql`1=1`
      ))
      .groupBy(users.id)
      .limit(limit);

    // TIER 2: City-based professionals with matching role
    const cityProfessionals = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        profileImage: users.profileImage,
        city: users.city,
        tangoRoles: users.tangoRoles,
        tier: sql<number>`2`.as('tier')
      })
      .from(users)
      .where(and(
        searchCity ? sql`LOWER(${users.city}) = ${searchCity.toLowerCase()}` : sql`1=1`,
        or(
          sql`LOWER(${users.name}) LIKE ${'%' + searchLower + '%'}`,
          sql`LOWER(${users.username}) LIKE ${'%' + searchLower + '%'}`
        ),
        mappedRole ? sql`${users.tangoRoles} @> ARRAY[${mappedRole}]::text[]` : sql`1=1`,
        sql`${users.id} NOT IN (${previousCollaborators.length > 0 
          ? sql.join(previousCollaborators.map(u => sql`${u.id}`), sql`, `)
          : sql`-1`})`
      ))
      .limit(limit);

    // TIER 3: All users with matching role (anywhere)
    const allWithRole = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        profileImage: users.profileImage,
        city: users.city,
        tangoRoles: users.tangoRoles,
        tier: sql<number>`3`.as('tier')
      })
      .from(users)
      .where(and(
        or(
          sql`LOWER(${users.name}) LIKE ${'%' + searchLower + '%'}`,
          sql`LOWER(${users.username}) LIKE ${'%' + searchLower + '%'}`
        ),
        mappedRole ? sql`${users.tangoRoles} @> ARRAY[${mappedRole}]::text[]` : sql`1=1`,
        sql`${users.id} NOT IN (${[...previousCollaborators, ...cityProfessionals].length > 0
          ? sql.join([...previousCollaborators, ...cityProfessionals].map(u => sql`${u.id}`), sql`, `)
          : sql`-1`})`
      ))
      .limit(limit);

    // TIER 4: General search fallback (all users matching query)
    const generalSearch = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        profileImage: users.profileImage,
        city: users.city,
        tangoRoles: users.tangoRoles,
        tier: sql<number>`4`.as('tier')
      })
      .from(users)
      .where(and(
        or(
          sql`LOWER(${users.name}) LIKE ${'%' + searchLower + '%'}`,
          sql`LOWER(${users.username}) LIKE ${'%' + searchLower + '%'}`,
          sql`LOWER(${users.email}) LIKE ${'%' + searchLower + '%'}`
        ),
        sql`${users.id} NOT IN (${[...previousCollaborators, ...cityProfessionals, ...allWithRole].length > 0
          ? sql.join([...previousCollaborators, ...cityProfessionals, ...allWithRole].map(u => sql`${u.id}`), sql`, `)
          : sql`-1`})`
      ))
      .limit(Math.max(0, limit - previousCollaborators.length - cityProfessionals.length - allWithRole.length));

    // Combine and sort by tier
    const results = [
      ...previousCollaborators.map(u => ({ ...u, matchType: 'previous_collaborator' })),
      ...cityProfessionals.map(u => ({ ...u, matchType: 'city_professional' })),
      ...allWithRole.map(u => ({ ...u, matchType: 'role_match' })),
      ...generalSearch.map(u => ({ ...u, matchType: 'general' }))
    ].slice(0, limit);

    console.log(`[SmartSearch] Event ${eventId}, Role: ${role}, Query: "${query}" → ${results.length} results (${previousCollaborators.length} collaborators, ${cityProfessionals.length} city pros, ${allWithRole.length} role matches, ${generalSearch.length} general)`);

    res.json(results);
  } catch (error) {
    console.error("[Events] Smart team member search error:", error);
    res.status(500).json({ message: "Search failed" });
  }
});

// ============================================================================
// MULTER ERROR HANDLER MIDDLEWARE
// ============================================================================
router.use((err: any, req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err && err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

export default router;
