/**
 * PostingPermissionService - Unified RBAC/ABAC for Posting
 * 
 * MB.MD v9.8 Pattern 28 Compliant
 * Consolidates group and event permission checks for posting/commenting
 * 
 * ARCHITECTURE:
 * - Groups: ABAC (Attribute-Based) - membership type determines permissions
 * - Events: RBAC (Role-Based) - participant role determines permissions
 * - Platform: 8-tier hierarchy override (God/SuperAdmin can post anywhere)
 */

import { db } from '@shared/db';
import { groupMembers, eventParticipants, eventRsvps, events } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { RBACService } from './RBACService';
import { getDefaultPermissions, GROUP_ROLES, type GroupRole, type GroupPermissions } from '../utils/groupPermissions';
import { EVENT_ROLE_PERMISSIONS } from '@shared/eventRolesSchemas';

export interface PostingPermissions {
  canPost: boolean;
  canComment: boolean;
  canModerate: boolean;
  role: string;
  roleLevel: number;
  reason?: string;
}

export interface EventPostingPermissions extends PostingPermissions {
  canPostUpdates: boolean;
  canEditEvent: boolean;
  canViewAttendees: boolean;
  isOrganizer: boolean;
  isParticipant: boolean;
  isRsvpd: boolean;
  rsvpStatus: 'going' | 'interested' | 'maybe' | 'not_going' | null;
}

export class PostingPermissionService {
  
  /**
   * Get posting permissions for a GROUP context
   * 
   * Priority:
   * 1. Platform God/SuperAdmin (Tier 7+) - always can post
   * 2. Group Admin/Moderator - can post and moderate
   * 3. Group Member - can post, cannot moderate
   * 4. Group Follower - can comment only, cannot post
   * 5. Non-member - cannot post or comment
   */
  static async getGroupPermissions(
    userId: number,
    groupId: number
  ): Promise<PostingPermissions> {
    
    // Check platform-level override (Tier 7+ = SuperAdmin or God)
    const platformRoleLevel = await RBACService.getUserRoleLevel(userId);
    if (platformRoleLevel >= 7) {
      return {
        canPost: true,
        canComment: true,
        canModerate: true,
        role: platformRoleLevel === 8 ? 'god' : 'super_admin',
        roleLevel: platformRoleLevel,
        reason: 'Platform admin override'
      };
    }
    
    // Check group membership
    const membership = await db
      .select({
        role: groupMembers.role,
        status: groupMembers.status
      })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        )
      )
      .limit(1);
    
    if (membership.length === 0) {
      // Not a member - no posting rights
      return {
        canPost: false,
        canComment: false,
        canModerate: false,
        role: 'non_member',
        roleLevel: 0,
        reason: 'Not a member of this group'
      };
    }
    
    const memberRecord = membership[0];
    
    // Check if membership is active
    if (memberRecord.status !== 'active') {
      return {
        canPost: false,
        canComment: false,
        canModerate: false,
        role: memberRecord.role || 'pending',
        roleLevel: 0,
        reason: `Membership status: ${memberRecord.status}`
      };
    }
    
    // Get role-based permissions
    // NOTE: Active members with NULL role should default to MEMBER (can post),
    // not FOLLOWER (cannot post). This handles legacy data where role was not set.
    const groupRole = (memberRecord.role as GroupRole) || GROUP_ROLES.MEMBER;
    const permissions = getDefaultPermissions(groupRole);
    
    // Map role to level for comparison
    const roleLevel = this.getGroupRoleLevel(groupRole);
    
    return {
      canPost: permissions.canPost,
      canComment: permissions.canComment,
      canModerate: permissions.canModerate,
      role: groupRole,
      roleLevel,
      reason: permissions.canPost ? undefined : 'Followers can comment but not post'
    };
  }
  
  /**
   * Get posting permissions for an EVENT context
   * 
   * Priority:
   * 1. Platform God/SuperAdmin (Tier 7+) - always can post
   * 2. Event Organizer/Co-organizer/Host - can post updates
   * 3. Event Staff (DJ, Teacher, Performer, Photographer, Sponsor) - can post updates
   * 4. Event Volunteer - can view but not post
   * 5. RSVP'd Attendee - can comment on discussions
   * 6. Non-participant Guest - cannot post
   */
  static async getEventPermissions(
    userId: number,
    eventId: number
  ): Promise<EventPostingPermissions> {
    
    // Check platform-level override
    const platformRoleLevel = await RBACService.getUserRoleLevel(userId);
    if (platformRoleLevel >= 7) {
      return {
        canPost: true,
        canComment: true,
        canModerate: true,
        canPostUpdates: true,
        canEditEvent: true,
        canViewAttendees: true,
        isOrganizer: true,
        isParticipant: true,
        isRsvpd: true,
        rsvpStatus: 'going' as const,
        role: platformRoleLevel === 8 ? 'god' : 'super_admin',
        roleLevel: platformRoleLevel,
        reason: 'Platform admin override'
      };
    }
    
    // Check if user is the event creator/organizer (check both userId and organizerId)
    const eventData = await db
      .select({ userId: events.userId, organizerId: events.organizerId })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    
    const isEventCreator = eventData.length > 0 && (eventData[0].userId === userId || eventData[0].organizerId === userId);
    
    if (isEventCreator) {
      return {
        canPost: true,
        canComment: true,
        canModerate: true,
        canPostUpdates: true,
        canEditEvent: true,
        canViewAttendees: true,
        isOrganizer: true,
        isParticipant: true,
        isRsvpd: true,
        rsvpStatus: 'going' as const,
        role: 'organizer',
        roleLevel: 10,
        reason: 'Event creator'
      };
    }
    
    // Check event participant role
    const participation = await db
      .select({
        role: eventParticipants.role,
        status: eventParticipants.status,
        canPostUpdates: eventParticipants.canPostUpdates,
        canEditEvent: eventParticipants.canEditEvent,
        canViewAttendees: eventParticipants.canViewAttendees
      })
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId)
        )
      )
      .limit(1);
    
    if (participation.length > 0) {
      const participant = participation[0];
      const rolePerms = EVENT_ROLE_PERMISSIONS[participant.role as keyof typeof EVENT_ROLE_PERMISSIONS];
      
      // Participant with explicit role
      return {
        canPost: rolePerms?.canPostUpdates || participant.canPostUpdates || false,
        canComment: true, // All participants can comment
        canModerate: rolePerms?.canManageParticipants || false,
        canPostUpdates: rolePerms?.canPostUpdates || participant.canPostUpdates || false,
        canEditEvent: rolePerms?.canEditEvent || participant.canEditEvent || false,
        canViewAttendees: rolePerms?.canViewAttendees || participant.canViewAttendees || false,
        isOrganizer: participant.role === 'organizer' || participant.role === 'co_organizer',
        isParticipant: true,
        isRsvpd: true,
        rsvpStatus: 'going' as const,
        role: participant.role,
        roleLevel: this.getEventRoleLevel(participant.role),
        reason: rolePerms?.canPostUpdates ? undefined : 'Role does not have posting rights'
      };
    }
    
    // Check RSVP status
    const rsvp = await db
      .select({ status: eventRsvps.status })
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, userId)
        )
      )
      .limit(1);
    
    console.log(`[PostingPermissionService] RSVP check for userId: ${userId}, eventId: ${eventId}, found: ${rsvp.length}, status: ${rsvp[0]?.status}`);
    
    // Any RSVP status (going, maybe, interested) allows commenting
    const validRsvpStatuses = ['going', 'maybe', 'interested'];
    if (rsvp.length > 0 && validRsvpStatuses.includes(rsvp[0].status)) {
      const actualRsvpStatus = rsvp[0].status as 'going' | 'interested' | 'maybe';
      console.log(`[PostingPermissionService] User is RSVP'd (status: ${actualRsvpStatus}), allowing canComment`);
      // RSVP'd attendee can comment but not post updates
      return {
        canPost: false,
        canComment: true,
        canModerate: false,
        canPostUpdates: false,
        canEditEvent: false,
        canViewAttendees: false,
        isOrganizer: false,
        isParticipant: false,
        isRsvpd: true,
        rsvpStatus: actualRsvpStatus,
        role: 'attendee',
        roleLevel: 1,
        reason: 'Attendees can comment but not post updates'
      };
    }
    
    console.log(`[PostingPermissionService] No RSVP found or not valid status (${rsvp[0]?.status}), denying permissions`);
    
    // Non-participant guest
    return {
      canPost: false,
      canComment: false,
      canModerate: false,
      canPostUpdates: false,
      canEditEvent: false,
      canViewAttendees: false,
      isOrganizer: false,
      isParticipant: false,
      isRsvpd: false,
      rsvpStatus: null,
      role: 'guest',
      roleLevel: 0,
      reason: 'RSVP to comment on this event'
    };
  }
  
  /**
   * Quick check if user can post in a GROUP
   */
  static async canPostInGroup(userId: number, groupId: number): Promise<boolean> {
    const perms = await this.getGroupPermissions(userId, groupId);
    return perms.canPost;
  }
  
  /**
   * Quick check if user can post in an EVENT
   */
  static async canPostInEvent(userId: number, eventId: number): Promise<boolean> {
    const perms = await this.getEventPermissions(userId, eventId);
    return perms.canPost;
  }
  
  /**
   * Quick check if user can comment in a GROUP
   */
  static async canCommentInGroup(userId: number, groupId: number): Promise<boolean> {
    const perms = await this.getGroupPermissions(userId, groupId);
    return perms.canComment;
  }
  
  /**
   * Quick check if user can comment in an EVENT
   */
  static async canCommentInEvent(userId: number, eventId: number): Promise<boolean> {
    const perms = await this.getEventPermissions(userId, eventId);
    return perms.canComment;
  }
  
  /**
   * Convert group role string to numeric level
   */
  private static getGroupRoleLevel(role: GroupRole): number {
    switch (role) {
      case GROUP_ROLES.ADMIN: return 4;
      case GROUP_ROLES.MODERATOR: return 3;
      case GROUP_ROLES.MEMBER: return 2;
      case GROUP_ROLES.FOLLOWER: return 1;
      default: return 0;
    }
  }
  
  /**
   * Convert event role string to numeric level
   */
  private static getEventRoleLevel(role: string): number {
    switch (role) {
      case 'organizer': return 10;
      case 'co_organizer': return 9;
      case 'host': return 8;
      case 'dj': return 7;
      case 'teacher': return 7;
      case 'performer': return 6;
      case 'photographer': return 5;
      case 'sponsor': return 4;
      case 'volunteer': return 3;
      case 'attendee': return 1;
      default: return 0;
    }
  }
}
