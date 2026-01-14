/**
 * EVENT PARTICIPANT ROLES ROUTES - P0 #12
 * Manage event participants with specialized roles (10 roles)
 */

import { Router } from "express";
import { db } from "@shared/db";
import { 
  eventParticipants, 
  eventRoleInvitations, 
  eventUpdates,
  eventTeamMembers,
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
import { notificationService } from "../services/notification-service";
import { broadcastToUser, broadcastToEvent } from "../services/websocket";

const router = Router();

// ============================================================================
// PUBLIC ROUTES - Event Participants Management
// ============================================================================

/**
 * GET /api/events/:id/participants
 * Get all participants for an event (with role grouping)
 * Includes both manually added participants AND scraped team members
 */
router.get("/events/:id/participants", async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);

    // Get manually added participants
    const participants = await db
      .select({
        participant: eventParticipants,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          city: users.city,
          name: users.name,
          profileImage: users.profileImage,
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

    // Get scraped team members
    const teamMembers = await db
      .select({
        teamMember: eventTeamMembers,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          city: users.city,
          name: users.name,
          profileImage: users.profileImage,
        }
      })
      .from(eventTeamMembers)
      .leftJoin(users, eq(eventTeamMembers.userId, users.id))
      .where(eq(eventTeamMembers.eventId, eventId))
      .orderBy(desc(eventTeamMembers.createdAt));

    // Group manually added participants by role
    const groupedByRole: Record<string, any[]> = participants.reduce((acc: Record<string, any[]>, p: any) => {
      const role = p.participant.role;
      if (!acc[role]) acc[role] = [];
      acc[role].push({
        ...p.participant,
        user: p.user,
        source: 'manual'
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Add scraped team members to the grouping
    for (const tm of teamMembers) {
      const role = tm.teamMember.role;
      if (!groupedByRole[role]) groupedByRole[role] = [];
      
      // Avoid duplicates by checking if user is already in the list
      const existingUser = groupedByRole[role].find(
        (p: any) => p.user?.id && tm.user?.id && p.user.id === tm.user.id
      );
      
      if (!existingUser) {
        groupedByRole[role].push({
          id: tm.teamMember.id,
          eventId: tm.teamMember.eventId,
          userId: tm.teamMember.userId,
          role: tm.teamMember.role,
          displayName: tm.teamMember.displayName,
          confidence: tm.teamMember.confidence,
          source: tm.teamMember.source || 'scraped',
          user: tm.user,
          isScrapedTeamMember: true
        });
      }
    }

    const total = participants.length + teamMembers.length;
    res.json({ participants: groupedByRole, total });
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

    // Get event details first
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Verify user is event creator OR organizer/co-organizer/host participant
    const isEventCreator = event.userId === userId;
    
    let isOrganizerParticipant = false;
    if (!isEventCreator) {
      const [organizer] = await db
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
      
      isOrganizerParticipant = !!organizer;
    }

    if (!isEventCreator && !isOrganizerParticipant) {
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

    // Get user details for notifications
    const [addedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, newParticipant.userId))
      .limit(1);

    // ========== DOWNSTREAM EFFECT 1: Create notification ==========
    try {
      await notificationService.createNotification({
        userId: newParticipant.userId,
        type: "event_rsvp",
        title: `Added to ${event.title}`,
        message: `You've been added as a ${validatedData.role.replace('_', ' ')} to "${event.title}"`,
        actionUrl: `/events/${eventId}`,
        senderId: userId,
        priority: "high",
        metadata: {
          role: validatedData.role,
          eventId: eventId,
          organizerId: userId
        }
      });
      console.log(`[Notification] ✅ Created notification for user ${newParticipant.userId}`);
    } catch (error) {
      console.error("[Notification] Failed to create participant notification:", error);
    }

    // ========== DOWNSTREAM EFFECT 2: Create activity log ==========
    try {
      if ((sql as any).raw) {
        await db.execute(sql.raw(`
          INSERT INTO event_activity_logs (event_id, user_id, action, details, created_at)
          VALUES (${eventId}, ${userId}, 'participant_added', ${'{"role": "' + validatedData.role + '", "target_user_id": ' + newParticipant.userId + '}'}, NOW())
        `));
      }
    } catch (error) {
      console.error("[ActivityLog] Failed to log participant addition:", error);
    }

    // ========== DOWNSTREAM EFFECT 3: WebSocket real-time update ==========
    try {
      const participantData = {
        id: newParticipant.id,
        userId: newParticipant.userId,
        userName: addedUser?.name,
        role: newParticipant.role,
        status: newParticipant.status
      };
      
      broadcastToUser(newParticipant.userId, 'participant_added', { eventId, participant: participantData });
      broadcastToEvent(eventId, 'participant_added', { participant: participantData });
      console.log("[WebSocket] Participant added broadcast sent to user and event subscribers");
    } catch (error) {
      console.error("[WebSocket] Failed to broadcast participant update:", error);
    }

    // ========== DOWNSTREAM EFFECT 4: Send email notification ==========
    try {
      // TODO: Send email to newParticipant with event details
      if (addedUser?.email) {
        console.log(`[Email] Would send participant invitation to ${addedUser.email} for event ${event.title}`);
        // Example implementation:
        // await emailService.sendParticipantInvitation({
        //   recipientEmail: addedUser.email,
        //   recipientName: addedUser.name,
        //   eventTitle: event.title,
        //   eventDate: event.startDate,
        //   eventVenue: event.venue,
        //   role: validatedData.role,
        //   organizerName: (await db.select().from(users).where(eq(users.id, userId)))[0]?.name,
        //   eventLink: `https://mundotango.com/events/${eventId}`
        // });
      }
    } catch (error) {
      console.error("[Email] Failed to send participant notification email:", error);
    }

    res.status(201).json({ 
      participant: newParticipant,
      message: `${addedUser?.name || 'User'} added as ${validatedData.role.replace('_', ' ')} successfully`
    });
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

    // WebSocket broadcast for participant update
    try {
      const participantData = {
        id: updated.id,
        userId: updated.userId,
        role: updated.role,
        status: updated.status
      };
      
      broadcastToUser(targetUserId, 'participant_updated', { eventId, participant: participantData });
      broadcastToEvent(eventId, 'participant_updated', { participant: participantData });
      console.log("[WebSocket] Participant updated broadcast sent to user and event subscribers");
    } catch (error) {
      console.error("[WebSocket] Failed to broadcast participant update:", error);
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

    // Get event to check if user is creator
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Verify user has permission (either event creator OR has canManageParticipants)
    const isEventCreator = event.userId === userId;
    
    let hasManagementPermission = isEventCreator;
    if (!isEventCreator) {
      const [manager] = await db
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

      hasManagementPermission = !!manager;
    }

    if (!hasManagementPermission) {
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

    // WebSocket broadcast for participant removal
    try {
      const removalData = {
        userId: targetUserId,
        role: target[0].role
      };
      
      broadcastToUser(targetUserId, 'participant_removed', { eventId, ...removalData });
      broadcastToEvent(eventId, 'participant_removed', removalData);
      console.log("[WebSocket] Participant removed broadcast sent to user and event subscribers");
    } catch (error) {
      console.error("[WebSocket] Failed to broadcast participant removal:", error);
    }

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
    const rolePermissions = EVENT_ROLE_PERMISSIONS[invitation.role as keyof typeof EVENT_ROLE_PERMISSIONS];
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

// ============================================================================
// PARTICIPANT SELF-MANAGEMENT - PRO Tab Integration
// ============================================================================

/**
 * GET /api/events/:id/my-participation
 * Get current user's participation details for an event
 */
router.get("/events/:id/my-participation", authenticateToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = (req as any).userId;

    const [participation] = await db
      .select({
        participant: eventParticipants,
        event: {
          id: events.id,
          title: events.title,
          startDate: events.startDate,
          venue: events.venue,
          city: events.city,
        }
      })
      .from(eventParticipants)
      .leftJoin(events, eq(eventParticipants.eventId, events.id))
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId)
        )
      )
      .limit(1);

    if (!participation) {
      return res.status(404).json({ error: "You are not a participant in this event" });
    }

    res.json({ participation });
  } catch (error: any) {
    console.error("Error fetching participation:", error);
    res.status(500).json({ error: "Failed to fetch participation details" });
  }
});

/**
 * PATCH /api/events/:id/my-participation
 * Self-update participation status (confirm, decline) and PRO visibility
 * Body: { status?: 'confirmed' | 'declined', isPubliclyListed?: boolean }
 * 
 * This endpoint allows participants to:
 * 1. Accept/decline their role invitation
 * 2. Toggle whether this participation shows in their public PRO portfolio
 */
router.patch("/events/:id/my-participation", authenticateToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = (req as any).userId;
    const { status, isPubliclyListed } = req.body;

    // Validate status if provided
    if (status && !['confirmed', 'declined', 'pending'].includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status. Must be 'confirmed', 'declined', or 'pending'" 
      });
    }

    // Find user's participation
    const [existing] = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId)
        )
      )
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "You are not a participant in this event" });
    }

    // Cannot change status if already declined or cancelled
    if (status && ['declined', 'cancelled'].includes(existing.status) && status === 'confirmed') {
      return res.status(400).json({ 
        error: "Cannot confirm participation that was already declined or cancelled" 
      });
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (status !== undefined) {
      updateData.status = status;
      
      // Set confirmedAt when confirming
      if (status === 'confirmed' && !existing.confirmedAt) {
        updateData.confirmedAt = new Date();
      }
    }

    if (isPubliclyListed !== undefined) {
      updateData.isPubliclyListed = isPubliclyListed;
    }

    const [updated] = await db
      .update(eventParticipants)
      .set(updateData)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId)
        )
      )
      .returning();

    // Fetch event details for response
    const [event] = await db
      .select({
        id: events.id,
        title: events.title,
        startDate: events.startDate,
        venue: events.venue,
        city: events.city,
      })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    res.json({ 
      participant: updated,
      event,
      message: status === 'confirmed' 
        ? "Participation confirmed! This event will appear in your PRO profile event history."
        : status === 'declined'
        ? "Participation declined."
        : "Participation updated."
    });
  } catch (error: any) {
    console.error("Error updating participation:", error);
    res.status(500).json({ error: "Failed to update participation" });
  }
});

/**
 * GET /api/users/:userId/participations
 * Get all event participations for a user (for PRO tab)
 * Query params: ?status=confirmed&role=teacher&publicOnly=true
 */
router.get("/users/:userId/participations", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { status, role, publicOnly } = req.query;

    const conditions = [eq(eventParticipants.userId, userId)];

    if (status) {
      conditions.push(sql`${eventParticipants.status} = ${status}`);
    }

    if (role) {
      conditions.push(sql`${eventParticipants.role} = ${role}`);
    }

    if (publicOnly === 'true') {
      conditions.push(eq(eventParticipants.isPubliclyListed, true));
    }

    const participations = await db
      .select({
        id: eventParticipants.id,
        eventId: eventParticipants.eventId,
        role: eventParticipants.role,
        status: eventParticipants.status,
        customTitle: eventParticipants.customTitle,
        isPubliclyListed: eventParticipants.isPubliclyListed,
        confirmedAt: eventParticipants.confirmedAt,
        createdAt: eventParticipants.createdAt,
        eventTitle: events.title,
        eventDate: events.startDate,
        eventVenue: events.venue,
        eventCity: events.city,
        eventType: events.eventType,
      })
      .from(eventParticipants)
      .leftJoin(events, eq(eventParticipants.eventId, events.id))
      .where(and(...conditions))
      .orderBy(desc(events.startDate));

    res.json({ participations });
  } catch (error: any) {
    console.error("Error fetching user participations:", error);
    res.status(500).json({ error: "Failed to fetch participations" });
  }
});

export default router;
