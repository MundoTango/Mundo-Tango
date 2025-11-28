/**
 * PRO API ENDPOINTS - WAVE 3A
 * Professional stats, event history, and booking requests for ProfileTabPro.tsx
 */

import { Router, Request, Response } from "express";
import { db } from "@shared/db";
import { 
  eventParticipants, 
  eventRoleInvitations,
  events,
  users,
  reviews
} from "../../shared/schema";
import { eq, and, desc, sql, gte, lt, or, inArray } from "drizzle-orm";
import { authenticateToken, optionalAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// Helper to safely check if a table exists by attempting a limited query
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(
      sql`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )`
    );
    return (result as any)?.[0]?.exists === true;
  } catch (error) {
    console.error(`[PRO] Error checking table ${tableName}:`, error);
    return false;
  }
}

/**
 * GET /api/users/:id/pro-stats
 * Returns professional stats for a user by role
 * Query param: ?role=teacher (optional, returns all roles if not specified)
 */
router.get("/:id/pro-stats", optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const roleFilter = req.query.role as string | undefined;

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const stats: Record<string, {
      totalEvents: number;
      upcomingEvents: number;
      avgRating: number;
      totalReviews: number;
    }> = {};

    const participantsTableExists = await tableExists('event_participants');
    
    if (participantsTableExists) {
      const now = new Date();

      const baseConditions = [eq(eventParticipants.userId, userId)];
      if (roleFilter) {
        baseConditions.push(sql`${eventParticipants.role} = ${roleFilter}`);
      }

      const participations = await db
        .select({
          role: eventParticipants.role,
          status: eventParticipants.status,
          eventId: eventParticipants.eventId,
          eventStartDate: events.startDate,
        })
        .from(eventParticipants)
        .leftJoin(events, eq(eventParticipants.eventId, events.id))
        .where(and(...baseConditions));

      const roleStats = participations.reduce((acc, p) => {
        const role = p.role;
        if (!acc[role]) {
          acc[role] = {
            totalEvents: 0,
            upcomingEvents: 0,
            eventIds: new Set<number>(),
          };
        }
        acc[role].totalEvents++;
        acc[role].eventIds.add(p.eventId);
        
        if (p.eventStartDate && new Date(p.eventStartDate) > now) {
          acc[role].upcomingEvents++;
        }
        return acc;
      }, {} as Record<string, { totalEvents: number; upcomingEvents: number; eventIds: Set<number> }>);

      const reviewsTableExists = await tableExists('reviews');

      for (const [role, data] of Object.entries(roleStats)) {
        let avgRating = 0;
        let totalReviews = 0;

        if (reviewsTableExists) {
          const userReviews = await db
            .select({
              rating: reviews.rating,
            })
            .from(reviews)
            .where(
              and(
                eq(reviews.targetType, 'user'),
                eq(reviews.targetId, userId)
              )
            );

          if (userReviews.length > 0) {
            totalReviews = userReviews.length;
            avgRating = userReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / userReviews.length;
          }
        }

        stats[role] = {
          totalEvents: data.totalEvents,
          upcomingEvents: data.upcomingEvents,
          avgRating: parseFloat(avgRating.toFixed(1)),
          totalReviews,
        };
      }
    }

    res.json({ stats });
  } catch (error: any) {
    console.error("[PRO] Error fetching pro stats:", error);
    res.status(500).json({ error: "Failed to fetch professional stats" });
  }
});

/**
 * GET /api/users/:id/event-history
 * Returns event participation history for PRO portfolio
 * Query params: ?role=teacher&status=confirmed&limit=20
 */
router.get("/:id/event-history", optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const roleFilter = req.query.role as string | undefined;
    const statusFilter = req.query.status as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const participantsTableExists = await tableExists('event_participants');

    if (!participantsTableExists) {
      return res.json({ events: [] });
    }

    const conditions = [eq(eventParticipants.userId, userId)];
    
    if (roleFilter) {
      conditions.push(sql`${eventParticipants.role} = ${roleFilter}`);
    }
    
    if (statusFilter) {
      conditions.push(sql`${eventParticipants.status} = ${statusFilter}`);
    }

    const participations = await db
      .select({
        id: eventParticipants.id,
        eventId: eventParticipants.eventId,
        role: eventParticipants.role,
        status: eventParticipants.status,
        customTitle: eventParticipants.customTitle,
        isPubliclyListed: eventParticipants.isPubliclyListed,
        createdAt: eventParticipants.createdAt,
        eventTitle: events.title,
        eventDate: events.startDate,
        eventType: events.eventType,
        eventVenue: events.venue,
        eventCity: events.city,
      })
      .from(eventParticipants)
      .leftJoin(events, eq(eventParticipants.eventId, events.id))
      .where(and(...conditions))
      .orderBy(desc(events.startDate))
      .limit(limit);

    const eventHistory = participations.map((p) => ({
      id: p.id,
      eventId: p.eventId,
      eventTitle: p.eventTitle || "Untitled Event",
      eventDate: p.eventDate?.toISOString() || "",
      eventVenue: p.eventVenue || "",
      eventCity: p.eventCity || "",
      role: p.role,
      status: p.status as 'pending' | 'confirmed' | 'completed',
      customTitle: p.customTitle,
      isPubliclyListed: p.isPubliclyListed ?? true,
      eventType: p.eventType || "event",
    }));

    res.json({ events: eventHistory });
  } catch (error: any) {
    console.error("[PRO] Error fetching event history:", error);
    res.status(500).json({ error: "Failed to fetch event history" });
  }
});

/**
 * GET /api/users/:id/booking-requests
 * Returns pending booking requests for the user (owner only)
 */
router.get("/:id/booking-requests", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const authUserId = req.userId;

    if (isNaN(targetUserId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (authUserId !== targetUserId) {
      return res.status(403).json({ error: "You can only view your own booking requests" });
    }

    const invitationsTableExists = await tableExists('event_role_invitations');

    if (!invitationsTableExists) {
      return res.json({ requests: [] });
    }

    const requests = await db
      .select({
        id: eventRoleInvitations.id,
        fromUserId: eventRoleInvitations.inviterId,
        fromUserName: users.name,
        fromUserImage: users.profileImage,
        role: eventRoleInvitations.role,
        eventId: eventRoleInvitations.eventId,
        eventName: events.title,
        eventDate: events.startDate,
        message: eventRoleInvitations.message,
        status: eventRoleInvitations.status,
        createdAt: eventRoleInvitations.createdAt,
      })
      .from(eventRoleInvitations)
      .leftJoin(users, eq(eventRoleInvitations.inviterId, users.id))
      .leftJoin(events, eq(eventRoleInvitations.eventId, events.id))
      .where(
        and(
          eq(eventRoleInvitations.inviteeUserId, targetUserId),
          eq(eventRoleInvitations.status, "pending")
        )
      )
      .orderBy(desc(eventRoleInvitations.createdAt));

    const formattedRequests = requests.map((r) => ({
      id: r.id,
      fromUserId: r.fromUserId,
      fromUserName: r.fromUserName || "Unknown",
      fromUserImage: r.fromUserImage,
      role: r.role,
      eventName: r.eventName || "Untitled Event",
      eventDate: r.eventDate?.toISOString() || "",
      message: r.message || "",
      status: r.status as 'pending' | 'accepted' | 'declined',
      createdAt: r.createdAt?.toISOString() || "",
    }));

    res.json({ requests: formattedRequests });
  } catch (error: any) {
    console.error("[PRO] Error fetching booking requests:", error);
    res.status(500).json({ error: "Failed to fetch booking requests" });
  }
});

/**
 * PATCH /api/users/:id/booking-requests/:requestId
 * Accept or decline a booking request
 * Body: { action: 'accept' | 'decline' }
 */
router.patch("/:id/booking-requests/:requestId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const requestId = parseInt(req.params.requestId);
    const authUserId = req.userId;
    const { action } = req.body;

    if (isNaN(targetUserId) || isNaN(requestId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    if (authUserId !== targetUserId) {
      return res.status(403).json({ error: "You can only manage your own booking requests" });
    }

    if (!action || !['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: "Action must be 'accept' or 'decline'" });
    }

    const invitationsTableExists = await tableExists('event_role_invitations');

    if (!invitationsTableExists) {
      return res.status(404).json({ error: "Booking requests not available" });
    }

    const [invitation] = await db
      .select()
      .from(eventRoleInvitations)
      .where(
        and(
          eq(eventRoleInvitations.id, requestId),
          eq(eventRoleInvitations.inviteeUserId, targetUserId),
          eq(eventRoleInvitations.status, "pending")
        )
      )
      .limit(1);

    if (!invitation) {
      return res.status(404).json({ error: "Booking request not found" });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    const [updated] = await db
      .update(eventRoleInvitations)
      .set({ 
        status: newStatus,
        acceptedAt: action === 'accept' ? new Date() : null,
      })
      .where(eq(eventRoleInvitations.id, requestId))
      .returning();

    if (action === 'accept') {
      const participantsTableExists = await tableExists('event_participants');
      
      if (participantsTableExists) {
        const { EVENT_ROLE_PERMISSIONS } = await import("@shared/schema");
        const rolePermissions = EVENT_ROLE_PERMISSIONS?.[invitation.role as keyof typeof EVENT_ROLE_PERMISSIONS] || {};
        
        await db
          .insert(eventParticipants)
          .values({
            eventId: invitation.eventId,
            userId: targetUserId,
            role: invitation.role,
            status: "confirmed",
            ...rolePermissions,
            confirmedAt: new Date(),
          })
          .onConflictDoNothing();
      }
    }

    res.json({ 
      success: true,
      message: `Booking request ${newStatus}`,
      request: updated 
    });
  } catch (error: any) {
    console.error("[PRO] Error updating booking request:", error);
    res.status(500).json({ error: "Failed to update booking request" });
  }
});

export default router;
