/**
 * Group Permissions System
 * 
 * MEMBER vs FOLLOWER Permissions:
 * 
 * MEMBER (Full Rights):
 * - Automatically added based on city/professional role
 * - Can post in group
 * - Can comment
 * - Can create events
 * - Can invite others
 * - View all content
 * 
 * FOLLOWER (Limited Rights):
 * - User voluntarily follows a group they're not a member of
 * - CANNOT post
 * - CAN comment
 * - CANNOT create events
 * - CANNOT invite
 * - View all public content
 */

export const GROUP_ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  MEMBER: "member",
  FOLLOWER: "follower",
} as const;

export type GroupRole = typeof GROUP_ROLES[keyof typeof GROUP_ROLES];

export interface GroupPermissions {
  canPost: boolean;
  canComment: boolean;
  canCreateEvents: boolean;
  canInvite: boolean;
  canModerate: boolean;
  canViewContent: boolean;
}

/**
 * Get default permissions for a given group role
 */
export function getDefaultPermissions(role: GroupRole): GroupPermissions {
  switch (role) {
    case GROUP_ROLES.ADMIN:
      return {
        canPost: true,
        canComment: true,
        canCreateEvents: true,
        canInvite: true,
        canModerate: true,
        canViewContent: true,
      };
    
    case GROUP_ROLES.MODERATOR:
      return {
        canPost: true,
        canComment: true,
        canCreateEvents: true,
        canInvite: true,
        canModerate: true,
        canViewContent: true,
      };
    
    case GROUP_ROLES.MEMBER:
      return {
        canPost: true,
        canComment: true,
        canCreateEvents: true,
        canInvite: true,
        canModerate: false,
        canViewContent: true,
      };
    
    case GROUP_ROLES.FOLLOWER:
      return {
        canPost: false,          // KEY DIFFERENCE: Followers cannot post
        canComment: true,
        canCreateEvents: false,  // KEY DIFFERENCE: Followers cannot create events
        canInvite: false,        // KEY DIFFERENCE: Followers cannot invite
        canModerate: false,
        canViewContent: true,
      };
    
    default:
      return {
        canPost: false,
        canComment: false,
        canCreateEvents: false,
        canInvite: false,
        canModerate: false,
        canViewContent: true, // Public content always viewable
      };
  }
}

/**
 * Check if user should be a MEMBER vs FOLLOWER based on automation rules
 * 
 * MEMBER if:
 * - City group AND user's location matches
 * - Professional group AND user has that professional role
 * 
 * FOLLOWER if:
 * - User manually joined/followed the group
 * - Not automatically qualified for membership
 */
export function determineGroupRole(
  groupType: string,
  groupCity: string | null,
  groupRoleType: string | null,
  userCity: string | null,
  userRoles: string[] | null
): GroupRole {
  // City-based groups
  if (groupType === "city" && groupCity && userCity === groupCity) {
    return GROUP_ROLES.MEMBER;
  }
  
  // Professional groups
  if (groupType === "professional" && groupRoleType && userRoles?.includes(groupRoleType)) {
    return GROUP_ROLES.MEMBER;
  }
  
  // Default to follower for manual joins
  return GROUP_ROLES.FOLLOWER;
}
