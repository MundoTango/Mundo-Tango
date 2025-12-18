import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { db } from "@shared/db";
import { events, eventRsvps } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface EventPermissionRequest extends AuthRequest {
  eventId?: number;
  event?: typeof events.$inferSelect;
  isEventOrganizer?: boolean;
  isEventAttendee?: boolean;
  rsvpStatus?: string | null;
}

interface EventCacheItem {
  event: typeof events.$inferSelect;
  timestamp: number;
}

const eventCache = new Map<number, EventCacheItem>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getEventCached(eventId: number): Promise<typeof events.$inferSelect | null> {
  const cached = eventCache.get(eventId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.event;
  }

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (event) {
    eventCache.set(eventId, { event, timestamp: Date.now() });
  }

  return event || null;
}

export function clearEventCache(eventId?: number) {
  if (eventId) {
    eventCache.delete(eventId);
  } else {
    eventCache.clear();
  }
}

export const loadEventContext = async (
  req: EventPermissionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventIdStr = req.params.id || req.params.eventId;
    if (!eventIdStr) {
      return res.status(400).json({ message: "Event ID required" });
    }

    const eventId = parseInt(eventIdStr);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await getEventCached(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    req.eventId = eventId;
    req.event = event;
    
    const userId = req.user?.id;
    req.isEventOrganizer = userId 
      ? (event.userId === userId || event.organizerId === userId)
      : false;

    if (userId && !req.isEventOrganizer) {
      const [rsvp] = await db
        .select()
        .from(eventRsvps)
        .where(and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, userId)
        ))
        .limit(1);

      req.rsvpStatus = rsvp?.status || null;
      req.isEventAttendee = rsvp?.status === "going";
    } else {
      req.rsvpStatus = null;
      req.isEventAttendee = req.isEventOrganizer || false;
    }

    next();
  } catch (error) {
    console.error("[EventPermissions] Error loading event context:", error);
    res.status(500).json({ message: "Failed to load event context" });
  }
};

export const requireEventOrganizer = (
  req: EventPermissionRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!req.isEventOrganizer) {
    return res.status(403).json({ message: "Only event organizers can perform this action" });
  }

  next();
};

export const requireEventAttendee = (
  req: EventPermissionRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!req.isEventAttendee && !req.isEventOrganizer) {
    return res.status(403).json({ 
      message: "Only event attendees can perform this action",
      rsvpRequired: true
    });
  }

  next();
};

export const requireEventAccess = (
  req: EventPermissionRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!req.event) {
    return res.status(404).json({ message: "Event not found" });
  }

  const event = req.event;
  
  if (event.status === "published") {
    return next();
  }

  if (req.isEventOrganizer) {
    return next();
  }

  if (event.status === "draft" || event.status === "cancelled") {
    return res.status(403).json({ 
      message: "This event is not publicly accessible",
      eventStatus: event.status
    });
  }

  next();
};

export function canPerformEventAction(action: 'view' | 'edit' | 'delete' | 'rsvp' | 'upload_photo' | 'post' | 'check_in') {
  return (req: EventPermissionRequest, res: Response, next: NextFunction) => {
    if (!req.event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = req.event;
    const isOrganizer = req.isEventOrganizer;
    const isAttendee = req.isEventAttendee;
    const userId = req.user?.id;

    switch (action) {
      case 'view':
        if (event.status === 'published' || isOrganizer) {
          return next();
        }
        return res.status(403).json({ message: "Event not accessible" });

      case 'edit':
      case 'delete':
      case 'check_in':
        if (!userId) {
          return res.status(401).json({ message: "Authentication required" });
        }
        if (isOrganizer) {
          return next();
        }
        return res.status(403).json({ message: "Only event organizers can perform this action" });

      case 'rsvp':
        if (!userId) {
          return res.status(401).json({ message: "Authentication required to RSVP" });
        }
        if (event.status !== 'published') {
          return res.status(400).json({ message: "Cannot RSVP to unpublished events" });
        }
        return next();

      case 'upload_photo':
        if (!userId) {
          return res.status(401).json({ message: "Authentication required" });
        }
        if (isOrganizer || isAttendee) {
          return next();
        }
        return res.status(403).json({ message: "Only event attendees can upload photos" });

      case 'post':
        if (!userId) {
          return res.status(401).json({ message: "Authentication required" });
        }
        if (isOrganizer || isAttendee) {
          return next();
        }
        return res.status(403).json({ message: "Only event attendees can post" });

      default:
        return res.status(400).json({ message: "Unknown action" });
    }
  };
}

export const checkEventCapacity = async (
  req: EventPermissionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = req.event;
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.capacity || event.capacity === 0) {
      return next();
    }

    const [{ count }] = await db
      .select({ count: db.$count(eventRsvps) })
      .from(eventRsvps)
      .where(and(
        eq(eventRsvps.eventId, event.id),
        eq(eventRsvps.status, "going")
      ));

    if (count >= event.capacity) {
      return res.status(409).json({ 
        message: "Event is at full capacity",
        capacity: event.capacity,
        current: count,
        waitlistAvailable: true
      });
    }

    next();
  } catch (error) {
    console.error("[EventPermissions] Error checking capacity:", error);
    res.status(500).json({ message: "Failed to check event capacity" });
  }
};
