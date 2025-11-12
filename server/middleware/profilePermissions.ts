import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { RBACService } from "../services/RBACService";

/**
 * Profile Privacy Settings Structure
 */
export interface ProfilePrivacySettings {
  profileVisibility?: 'public' | 'members' | 'private';
  showEmail?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
  showRates?: boolean;
}

/**
 * Profile Permission Check Results
 */
export interface ProfilePermissionResult {
  allowed: boolean;
  reason?: string;
}

// ============================================================================
// PROFILE PERMISSION UTILITIES
// ============================================================================

/**
 * Check if a user can view a profile
 * Respects privacy settings and RBAC roles
 * 
 * @param viewerId - ID of user trying to view profile (null for guests)
 * @param profileUserId - ID of profile owner
 * @param privacySettings - Profile privacy configuration
 * @param isActive - Whether profile is active
 * @returns Permission check result
 */
export async function canViewProfile(
  viewerId: number | null,
  profileUserId: number,
  privacySettings: ProfilePrivacySettings = {},
  isActive: boolean = true
): Promise<ProfilePermissionResult> {
  // Inactive profiles can only be viewed by owner or admins
  if (!isActive && viewerId !== profileUserId) {
    if (!viewerId) {
      return { allowed: false, reason: "Profile is inactive" };
    }
    
    const isAdmin = await RBACService.hasMinimumRoleLevel(viewerId, 4); // Admin level
    if (!isAdmin) {
      return { allowed: false, reason: "Profile is inactive" };
    }
  }

  // Owner can always view their own profile
  if (viewerId === profileUserId) {
    return { allowed: true };
  }

  // Admins (level 4+) can view all profiles
  if (viewerId) {
    const isAdmin = await RBACService.hasMinimumRoleLevel(viewerId, 4);
    if (isAdmin) {
      return { allowed: true };
    }
  }

  // Check privacy settings
  const visibility = privacySettings.profileVisibility || 'public';

  switch (visibility) {
    case 'public':
      return { allowed: true };
    
    case 'members':
      // Only logged-in members can view
      if (!viewerId) {
        return { allowed: false, reason: "Login required to view this profile" };
      }
      return { allowed: true };
    
    case 'private':
      // Only owner and admins can view
      return { allowed: false, reason: "Profile is private" };
    
    default:
      return { allowed: true };
  }
}

/**
 * Check if a user can edit a profile
 * Only profile owner or admins (level 4+) can edit
 * 
 * @param userId - ID of user trying to edit
 * @param profileUserId - ID of profile owner
 * @returns Permission check result
 */
export async function canEditProfile(
  userId: number,
  profileUserId: number
): Promise<ProfilePermissionResult> {
  // Owner can edit their own profile
  if (userId === profileUserId) {
    return { allowed: true };
  }

  // Admins (level 4+) can edit any profile
  const isAdmin = await RBACService.hasMinimumRoleLevel(userId, 4);
  if (isAdmin) {
    return { allowed: true };
  }

  return { allowed: false, reason: "You can only edit your own profile" };
}

/**
 * Check if a user can delete a profile
 * Only profile owner or Super Admins (level 7+) can delete
 * Regular admins cannot delete profiles for safety
 * 
 * @param userId - ID of user trying to delete
 * @param profileUserId - ID of profile owner
 * @returns Permission check result
 */
export async function canDeleteProfile(
  userId: number,
  profileUserId: number
): Promise<ProfilePermissionResult> {
  // Owner can delete their own profile
  if (userId === profileUserId) {
    return { allowed: true };
  }

  // Only Super Admins (level 7+) can delete others' profiles
  const isSuperAdmin = await RBACService.hasMinimumRoleLevel(userId, 7);
  if (isSuperAdmin) {
    return { allowed: true };
  }

  return { allowed: false, reason: "You can only delete your own profile or require Super Admin privileges" };
}

/**
 * Check if a user can verify a profile
 * Only Platform Contributors (level 5+) can verify profiles
 * 
 * @param userId - ID of user trying to verify
 * @returns Permission check result
 */
export async function canVerifyProfile(
  userId: number
): Promise<ProfilePermissionResult> {
  const canVerify = await RBACService.hasMinimumRoleLevel(userId, 5);
  
  if (!canVerify) {
    return { allowed: false, reason: "Platform Contributor level or higher required to verify profiles" };
  }

  return { allowed: true };
}

/**
 * Check if a user can feature/highlight a profile
 * Only Admins (level 4+) can feature profiles
 * 
 * @param userId - ID of user trying to feature
 * @returns Permission check result
 */
export async function canFeatureProfile(
  userId: number
): Promise<ProfilePermissionResult> {
  const isAdmin = await RBACService.hasMinimumRoleLevel(userId, 4);
  
  if (!isAdmin) {
    return { allowed: false, reason: "Admin privileges required to feature profiles" };
  }

  return { allowed: true };
}

// ============================================================================
// EXPRESS MIDDLEWARE
// ============================================================================

/**
 * Middleware to check view profile permission
 * Attaches permission result to request
 */
export const requireViewProfilePermission = (
  getProfileUserId: (req: AuthRequest) => number,
  getPrivacySettings: (req: AuthRequest) => ProfilePrivacySettings | Promise<ProfilePrivacySettings>,
  getIsActive: (req: AuthRequest) => boolean | Promise<boolean>
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const viewerId = req.userId || null;
      const profileUserId = getProfileUserId(req);
      const privacySettings = await Promise.resolve(getPrivacySettings(req));
      const isActive = await Promise.resolve(getIsActive(req));

      const permission = await canViewProfile(viewerId, profileUserId, privacySettings, isActive);

      if (!permission.allowed) {
        return res.status(403).json({ 
          message: permission.reason || "Cannot view this profile"
        });
      }

      next();
    } catch (error) {
      console.error("Profile view permission check error:", error);
      return res.status(500).json({ message: "Error checking profile permissions" });
    }
  };
};

/**
 * Middleware to check edit profile permission
 * Validates user can edit the profile
 */
export const requireEditProfilePermission = (
  getProfileUserId: (req: AuthRequest) => number | Promise<number>
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const profileUserId = await Promise.resolve(getProfileUserId(req));
      const permission = await canEditProfile(req.userId, profileUserId);

      if (!permission.allowed) {
        return res.status(403).json({ 
          message: permission.reason || "Cannot edit this profile"
        });
      }

      next();
    } catch (error) {
      console.error("Profile edit permission check error:", error);
      return res.status(500).json({ message: "Error checking profile permissions" });
    }
  };
};

/**
 * Middleware to check delete profile permission
 * Validates user can delete the profile
 */
export const requireDeleteProfilePermission = (
  getProfileUserId: (req: AuthRequest) => number | Promise<number>
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const profileUserId = await Promise.resolve(getProfileUserId(req));
      const permission = await canDeleteProfile(req.userId, profileUserId);

      if (!permission.allowed) {
        return res.status(403).json({ 
          message: permission.reason || "Cannot delete this profile"
        });
      }

      next();
    } catch (error) {
      console.error("Profile delete permission check error:", error);
      return res.status(500).json({ message: "Error checking profile permissions" });
    }
  };
};

/**
 * Middleware to check verify profile permission
 * Requires Platform Contributor level or higher
 */
export const requireVerifyProfilePermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const permission = await canVerifyProfile(req.userId);

    if (!permission.allowed) {
      return res.status(403).json({ 
        message: permission.reason || "Cannot verify profiles"
      });
    }

    next();
  } catch (error) {
    console.error("Profile verify permission check error:", error);
    return res.status(500).json({ message: "Error checking profile permissions" });
  }
};

/**
 * Middleware to check feature profile permission
 * Requires Admin level or higher
 */
export const requireFeatureProfilePermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const permission = await canFeatureProfile(req.userId);

    if (!permission.allowed) {
      return res.status(403).json({ 
        message: permission.reason || "Cannot feature profiles"
      });
    }

    next();
  } catch (error) {
    console.error("Profile feature permission check error:", error);
    return res.status(500).json({ message: "Error checking profile permissions" });
  }
};

// ============================================================================
// OWNER-OR-ADMIN SHORTHAND MIDDLEWARE
// ============================================================================

/**
 * Simple middleware: Allow if user is profile owner OR admin (level 4+)
 * This is the most common pattern for profile editing
 */
export const requireOwnerOrAdmin = (
  getUserIdFromRequest: (req: AuthRequest) => number | Promise<number>
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const targetUserId = await Promise.resolve(getUserIdFromRequest(req));
      
      // Check if owner
      if (req.userId === targetUserId) {
        return next();
      }

      // Check if admin
      const isAdmin = await RBACService.hasMinimumRoleLevel(req.userId, 4);
      if (isAdmin) {
        return next();
      }

      return res.status(403).json({ 
        message: "You can only modify your own profile or require admin privileges"
      });
    } catch (error) {
      console.error("Owner or admin check error:", error);
      return res.status(500).json({ message: "Error checking permissions" });
    }
  };
};
