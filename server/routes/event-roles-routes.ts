/**
 * EVENT PARTICIPANT ROLES ROUTES - P0 #12
 * Manage event participants with specialized roles (10 roles)
 */

import { Router } from "express";
import { db } from "./db";
import { 
  eventParticipants, 
  eventRoleInvitations, 
  eventUpdates,
  insertEventParticipantSchema,
  insertEventRoleInvitationSchema,
  insertEventUpdateSchema,
  EVENT_ROLE_PERMISSIONS,
  type EventParticipant,
  type EventRoleInvitation,
  type EventUpdate,
  events,
  users
} from "../../shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticateToken } from "../middleware/auth";
import { randomBytes } from "crypto";

const router = Router();

// ============================================================================
// PUBLIC ROUTES - Event Participants Management
// ============================================================================

/**
 * GET /api/events/:id/participants
 * Get all participants for an event (with role grouping)
 */
router.get("/events/:id/participants", async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);

    const participants = await db
      .select({
        participant: eventParticipants,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          city: users.city,
        }
      })
      .from(eventParticipants)
      .leftJoin(users, eq(eventParticipants.userId, users.id))
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.isPubliclyListed, true)
        )
      )
      .orderBy(
        eventParticipants.displayOrder,
        desc(eventParticipants.createdAt)
      );

    // Group by role
    const groupedByRole = participants.reduce((acc: Record<string, any[]>, p: any) => {
      const role = p.participant.role;
      if (!acc[role]) acc[role] = [];
      acc[role].push({
        ...p.participant,
        user: p.user
      });
      return acc;
    }, {} as Record<string, any[]>);

    res.json({ participants: groupedByRole, total: participants.length });
  } catch (error: any) {
    console.error("Error fetching event participants:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

/**
 * POST /api/events/:id/participants
 * Add participant to event with role (requires auth + organizer permission)
 */
router.post("/events/:id/participants", authenticateToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = (req as any).userId;

    // Verify user is organizer/co-organizer/host
    const organizer = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId),
          sql`${eventParticipants.role} IN ('organizer', 'co_organizer', 'host')`
        )
      )
      .limit(1);

    if (organizer.length === 0) {
      return res.status(403).json({ error: "Only organizers can add participants" });
    }

    // Validate input
    const validatedData = insertEventParticipantSchema.parse({
      ...req.body,
      eventId
    });

    // Apply default permissions based on role
    const rolePermissions = EVENT_ROLE_PERMISSIONS[validatedData.role as keyof typeof EVENT_ROLE_PERMISSIONS];
    const participantData = {
      ...validatedData,
      ...rolePermissions,
      status: validatedData.status || "confirmed"
    };

    const [newParticipant] = await db
      .insert(eventParticipants)
      .values(participantData)
      .returning();

    res.status(201).json({ participant: newParticipant });
  } catch (error: any) {
    console.error("Error adding participant:", error);
    res.status(400).json({ error: error.message || "Failed to add participant" });
  }
});

/**
 * PATCH /api/events/:id/participants/:userId
 * Update participant role or status
 */
router.patch("/events/:id/participants/:targetUserId", authenticateToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const targetUserId = parseInt(req.params.targetUserId);
    const userId = (req as any).userId;

    // Verify user has permission to manage participants
    const manager = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId),
          eq(eventParticipants.canManageParticipants, true)
        )
      )
      .limit(1);

    if (manager.length === 0) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const updateData: any = {};
    
    // If changing role, apply new permissions
    if (req.body.role) {
      const newPermissions = EVENT_ROLE_PERMISSIONS[req.body.role as keyof typeof EVENT_ROLE_PERMISSIONS];
      Object.assign(updateData, newPermissions, { role: req.body.role });
    }

    // Allow updating other fields
    const allowedFields = [
      'status', 'notes', 'customTitle', 'displayOrder', 
      'isPubliclyListed', 'compensation'
    ];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(eventParticipants)
      .set(updateData)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, targetUserId)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json({ participant: updated });
  } catch (error: any) {
    console.error("Error updating participant:", error);
    res.status(400).json({ error: error.message || "Failed to update participant" });
  }
});

/**
 * DELETE /api/events/:id/participants/:userId
 * Remove participant from event
 */
router.delete("/events/:id/participants/:targetUserId", authenticateToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const targetUserId = parseInt(req.params.targetUserId);
    const userId = (req as any).userId;

    // Verify user has permission
    const manager = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId),
          eq(eventParticipants.canManageParticipants, true)
        )
      )
      .limit(1);

    if (manager.length === 0) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Prevent removing the primary organizer
    const target = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, targetUserId)
        )
      )
      .limit(1);

    if (target.length === 0) {
      return res.status(404).json({ error: "Participant not found" });
    }

    if (target[0].role === 'organizer') {
      return res.status(400).json({ error: "Cannot remove primary organizer" });
    }

    await db
      .delete(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, targetUserId)
        )
      );

    res.json({ message: "Participant removed successfully" });
  } catch (error: any) {
    console.error("Error removing participant:", error);
    res.status(500).json({ error: "Failed to remove participant" });
  }
});

/**
 * POST /api/events/:id/participants/invite
 * Send invitation for specific role (email invitation)
 */
router.post("/events/:id/participants/invite", authenticateToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = (req as any).userId;

    // Verify user can manage participants
    const manager = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId),
          eq(eventParticipants.canManageParticipants, true)
        )
      )
      .limit(1);

    if (manager.length === 0) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const validatedData = insertEventRoleInvitationSchema.parse({
      ...req.body,
      eventId,
      inviterId: userId,
      token,
      expiresAt
    });

    const [invitation] = await db
      .insert(eventRoleInvitations)
      .values(validatedData)
      .returning();

    // TODO: Send email with invitation link
    // Email should contain: /events/${eventId}/accept-invitation/${token}

    res.status(201).json({ 
      invitation,
      invitationLink: `/events/${eventId}/accept-invitation/${token}`
    });
  } catch (error: any) {
    console.error("Error creating invitation:", error);
    res.status(400).json({ error: error.message || "Failed to create invitation" });
  }
});

/**
 * POST /api/events/:id/accept-invitation/:token
 * Accept role invitation (can be unauthenticated, will prompt login)
 */
router.post("/events/:id/accept-invitation/:token", authenticateToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const token = req.params.token;
    const userId = (req as any).userId;

    // Find invitation
    const [invitation] = await db
      .select()
      .from(eventRoleInvitations)
      .where(
        and(
          eq(eventRoleInvitations.eventId, eventId),
          eq(eventRoleInvitations.token, token),
          eq(eventRoleInvitations.status, "pending")
        )
      )
      .limit(1);

    if (!invitation) {
      return res.status(404).json({ error: "Invalid or expired invitation" });
    }

    if (new Date() > invitation.expiresAt) {
      await db
        .update(eventRoleInvitations)
        .set({ status: "expired" })
        .where(eq(eventRoleInvitations.id, invitation.id));
      
      return res.status(400).json({ error: "Invitation has expired" });
    }

    // Create participant with invited role
    const rolePermissions = EVENT_ROLE_PERMISSIONS[invitation.role];
    const [newParticipant] = await db
      .insert(eventParticipants)
      .values({
        eventId,
        userId,
        role: invitation.role,
        status: "confirmed",
        ...rolePermissions,
        confirmedAt: new Date()
      })
      .returning();

    // Mark invitation as accepted
    await db
      .update(eventRoleInvitations)
      .set({ 
        status: "accepted",
        inviteeUserId: userId,
        acceptedAt: new Date()
      })
      .where(eq(eventRoleInvitations.id, invitation.id));

    res.json({ 
      participant: newParticipant,
      message: "Invitation accepted successfully"
    });
  } catch (error: any) {
    console.error("Error accepting invitation:", error);
    res.status(400).json({ error: error.message || "Failed to accept invitation" });
  }
});

// ============================================================================
// EVENT UPDATES - Posts by organizers, DJs, teachers, etc.
// ============================================================================

/**
 * GET /api/events/:id/updates
 * Get all updates for an event
 */
router.get("/events/:id/updates", async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);

    const updates = await db
      .select({
        update: eventUpdates,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
        }
      })
      .from(eventUpdates)
      .leftJoin(users, eq(eventUpdates.authorId, users.id))
      .where(eq(eventUpdates.eventId, eventId))
      .orderBy(desc(eventUpdates.isPinned), desc(eventUpdates.createdAt));

    res.json({ updates });
  } catch (error: any) {
    console.error("Error fetching event updates:", error);
    res.status(500).json({ error: "Failed to fetch updates" });
  }
});

/**
 * POST /api/events/:id/updates
 * Post update to event (requires canPostUpdates permission)
 */
router.post("/events/:id/updates", authenticateToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = (req as any).userId;

    // Verify user has permission to post updates
    const participant = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId),
          eq(eventParticipants.canPostUpdates, true)
        )
      )
      .limit(1);

    if (participant.length === 0) {
      return res.status(403).json({ error: "Permission denied to post updates" });
    }

    const validatedData = insertEventUpdateSchema.parse({
      ...req.body,
      eventId,
      authorId: userId,
      authorRole: participant[0].role
    });

    const [update] = await db
      .insert(eventUpdates)
      .values(validatedData)
      .returning();

    // TODO: If notifyAttendees is true, send notifications

    res.status(201).json({ update });
  } catch (error: any) {
    console.error("Error posting update:", error);
    res.status(400).json({ error: error.message || "Failed to post update" });
  }
});

/**
 * PATCH /api/events/:id/updates/:updateId
 * Edit update (only author or organizer)
 */
router.patch("/events/:id/updates/:updateId", authenticateToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const updateId = parseInt(req.params.updateId);
    const userId = (req as any).userId;

    // Find update
    const [update] = await db
      .select()
      .from(eventUpdates)
      .where(
        and(
          eq(eventUpdates.id, updateId),
          eq(eventUpdates.eventId, eventId)
        )
      )
      .limit(1);

    if (!update) {
      return res.status(404).json({ error: "Update not found" });
    }

    // Verify user is author or organizer
    const isAuthor = update.authorId === userId;
    const isOrganizer = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId),
          sql`${eventParticipants.role} IN ('organizer', 'co_organizer', 'host')`
        )
      )
      .limit(1);

    if (!isAuthor && isOrganizer.length === 0) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    const allowedFields = ['title', 'content', 'isPinned'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const [updated] = await db
      .update(eventUpdates)
      .set(updateData)
      .where(eq(eventUpdates.id, updateId))
      .returning();

    res.json({ update: updated });
  } catch (error: any) {
    console.error("Error updating event update:", error);
    res.status(400).json({ error: error.message || "Failed to update" });
  }
});

/**
 * DELETE /api/events/:id/updates/:updateId
 * Delete update (only author or organizer)
 */
router.delete("/events/:id/updates/:updateId", authenticateToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const updateId = parseInt(req.params.updateId);
    const userId = (req as any).userId;

    // Find update
    const [update] = await db
      .select()
      .from(eventUpdates)
      .where(
        and(
          eq(eventUpdates.id, updateId),
          eq(eventUpdates.eventId, eventId)
        )
      )
      .limit(1);

    if (!update) {
      return res.status(404).json({ error: "Update not found" });
    }

    // Verify user is author or organizer
    const isAuthor = update.authorId === userId;
    const isOrganizer = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId),
          sql`${eventParticipants.role} IN ('organizer', 'co_organizer', 'host')`
        )
      )
      .limit(1);

    if (!isAuthor && isOrganizer.length === 0) {
      return res.status(403).json({ error: "Permission denied" });
    }

    await db
      .delete(eventUpdates)
      .where(eq(eventUpdates.id, updateId));

    res.json({ message: "Update deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting update:", error);
    res.status(500).json({ error: "Failed to delete update" });
  }
});

export default router;
