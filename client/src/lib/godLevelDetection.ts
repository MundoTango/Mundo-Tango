/**
 * GOD-LEVEL USER DETECTION
 * MB.MD Pattern 53 - Self-Healing System
 * 
 * Detects admin, god, super_admin, and founder users
 * for enhanced error reporting and self-healing features
 */

export const GOD_LEVEL_ROLES = ['super_admin', 'admin', 'god', 'founder'] as const;
export const GOD_LEVEL_EMAILS = ['admin@mundotango.life', 'founder@mundotango.life'] as const;

export type GodLevelRole = typeof GOD_LEVEL_ROLES[number];

interface UserLike {
  role?: string;
  email?: string;
}

/**
 * Check if a user has god-level access
 * @param user - User object with role and/or email
 * @returns true if user is god-level
 */
export function isGodLevelUser(user: UserLike | null | undefined): boolean {
  if (!user) return false;
  
  // Check by role
  if (user.role && GOD_LEVEL_ROLES.includes(user.role as GodLevelRole)) {
    return true;
  }
  
  // Check by email (fallback for special accounts)
  if (user.email && GOD_LEVEL_EMAILS.includes(user.email as typeof GOD_LEVEL_EMAILS[number])) {
    return true;
  }
  
  return false;
}

/**
 * Get god-level status from localStorage (for class components)
 * This reads from the cached user data
 */
export function getGodLevelStatusFromStorage(): boolean {
  try {
    const userDataStr = localStorage.getItem('mt_user_data');
    if (!userDataStr) return false;
    
    const userData = JSON.parse(userDataStr);
    return isGodLevelUser(userData);
  } catch {
    return false;
  }
}

/**
 * Cache user data to localStorage for god-level detection
 * Call this when user logs in or data refreshes
 */
export function cacheUserForGodDetection(user: UserLike | null): void {
  try {
    if (user) {
      localStorage.setItem('mt_user_data', JSON.stringify({
        role: user.role,
        email: user.email
      }));
    } else {
      localStorage.removeItem('mt_user_data');
    }
  } catch {
    // Ignore storage errors
  }
}
