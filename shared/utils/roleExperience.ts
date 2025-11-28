/**
 * Per-Role Experience Tracking Utilities
 * 
 * These helper functions support the per-role experience tracking system
 * where each tango role has its own start date. All functions maintain
 * backwards compatibility by falling back to yearsOfDancing when
 * tangoRoleExperience is not available.
 * 
 * @see PRD_PER_ROLE_EXPERIENCE.md for full specification
 */

export interface TangoRoleExperience {
  role: string;
  startYear: number;
}

export interface UserWithExperience {
  tangoRoleExperience?: TangoRoleExperience[] | null;
  tangoStartYear?: number | null;
  yearsOfDancing?: number | null;
}

/**
 * Calculate the number of years a user has been in a specific role.
 * 
 * Priority order for experience calculation:
 * 1. Role-specific start year from tangoRoleExperience
 * 2. tangoStartYear (when user first started tango)
 * 3. yearsOfDancing (legacy field, backwards compatibility)
 * 
 * @param user - User object with experience fields
 * @param role - The role to check (e.g., 'leader', 'teacher', 'dj')
 * @param referenceYear - Year to calculate from (defaults to current year)
 * @returns Number of years in the role
 */
export function calculateYearsInRole(
  user: UserWithExperience,
  role: string,
  referenceYear: number = new Date().getFullYear()
): number {
  const roleExp = user.tangoRoleExperience?.find(r => r.role === role);
  
  if (roleExp) {
    return Math.max(0, referenceYear - roleExp.startYear);
  }
  
  if (user.tangoStartYear) {
    return Math.max(0, referenceYear - user.tangoStartYear);
  }
  
  return user.yearsOfDancing ?? 0;
}

/**
 * Get the role experience object for a specific role.
 * 
 * @param user - User object with tangoRoleExperience
 * @param role - The role to find
 * @returns The TangoRoleExperience object or null if not found
 */
export function getRoleExperience(
  user: { tangoRoleExperience?: TangoRoleExperience[] | null },
  role: string
): TangoRoleExperience | null {
  return user.tangoRoleExperience?.find(r => r.role === role) ?? null;
}

/**
 * Get the maximum experience years across all roles.
 * 
 * This represents the user's longest tango experience, calculated as:
 * - If tangoRoleExperience exists: currentYear - earliest startYear
 * - Otherwise: yearsOfDancing (legacy fallback)
 * 
 * @param user - User object with experience fields
 * @returns Maximum years of experience
 */
export function getMaxExperienceYears(
  user: { tangoRoleExperience?: TangoRoleExperience[] | null; yearsOfDancing?: number | null }
): number {
  if (!user.tangoRoleExperience?.length) {
    return user.yearsOfDancing ?? 0;
  }
  
  const currentYear = new Date().getFullYear();
  const minStartYear = Math.min(...user.tangoRoleExperience.map(r => r.startYear));
  return Math.max(0, currentYear - minStartYear);
}

/**
 * Format the role experience as a human-readable string.
 * 
 * @param user - User object with experience fields
 * @param role - The role to format
 * @returns Formatted string like "5 years", "1 year", or "New"
 */
export function formatRoleExperience(
  user: UserWithExperience,
  role: string
): string {
  const years = calculateYearsInRole(user, role);
  
  if (years === 0) return "New";
  if (years === 1) return "1 year";
  return `${years} years`;
}

/**
 * Get the start year for a specific role, formatted as a string.
 * 
 * @param user - User object with experience fields
 * @param role - The role to get the start year for
 * @returns Formatted year string like "2020"
 */
export function getRoleStartYear(
  user: UserWithExperience,
  role: string
): string {
  const roleExp = user.tangoRoleExperience?.find(r => r.role === role);
  
  if (roleExp) {
    return roleExp.startYear.toString();
  }
  
  if (user.tangoStartYear) {
    return user.tangoStartYear.toString();
  }
  
  return "Unknown";
}

/**
 * Build a TangoRoleExperience array from a list of roles.
 * 
 * Used during registration/onboarding when user selects roles.
 * All roles default to the same start year initially.
 * 
 * @param roles - Array of role strings selected by user
 * @param defaultStartYear - The default start year for all roles
 * @returns Array of TangoRoleExperience objects
 */
export function buildTangoRoleExperience(
  roles: string[],
  defaultStartYear: number
): TangoRoleExperience[] {
  return roles.map(role => ({
    role,
    startYear: defaultStartYear
  }));
}

/**
 * Update or add a role's start year in the experience array.
 * 
 * @param experiences - Existing array of role experiences
 * @param role - Role to update
 * @param startYear - New start year for the role
 * @returns Updated array of TangoRoleExperience
 */
export function updateRoleStartYear(
  experiences: TangoRoleExperience[],
  role: string,
  startYear: number
): TangoRoleExperience[] {
  const existingIndex = experiences.findIndex(r => r.role === role);
  
  if (existingIndex >= 0) {
    return experiences.map((exp, index) => 
      index === existingIndex ? { ...exp, startYear } : exp
    );
  }
  
  return [...experiences, { role, startYear }];
}

/**
 * Remove a role from the experience array.
 * 
 * @param experiences - Existing array of role experiences
 * @param role - Role to remove
 * @returns Updated array without the specified role
 */
export function removeRoleExperience(
  experiences: TangoRoleExperience[],
  role: string
): TangoRoleExperience[] {
  return experiences.filter(r => r.role !== role);
}

/**
 * Check if a user has experience data for a specific role.
 * 
 * @param user - User object with tangoRoleExperience
 * @param role - Role to check
 * @returns true if the user has explicit experience for this role
 */
export function hasRoleExperience(
  user: { tangoRoleExperience?: TangoRoleExperience[] | null },
  role: string
): boolean {
  return user.tangoRoleExperience?.some(r => r.role === role) ?? false;
}

/**
 * Get the earliest start year across all roles (when user started tango).
 * 
 * @param user - User object with experience fields
 * @returns Earliest start year or null if no experience data
 */
export function getEarliestStartYear(
  user: { tangoRoleExperience?: TangoRoleExperience[] | null; tangoStartYear?: number | null }
): number | null {
  if (user.tangoRoleExperience?.length) {
    return Math.min(...user.tangoRoleExperience.map(r => r.startYear));
  }
  return user.tangoStartYear ?? null;
}

/**
 * Migrate legacy yearsOfDancing to tangoRoleExperience format.
 * 
 * Used for data migration of existing users.
 * 
 * @param tangoRoles - User's selected roles
 * @param yearsOfDancing - Legacy years of dancing value
 * @returns Object with tangoStartYear and tangoRoleExperience
 */
export function migrateFromYearsOfDancing(
  tangoRoles: string[],
  yearsOfDancing: number
): { tangoStartYear: number; tangoRoleExperience: TangoRoleExperience[] } {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - yearsOfDancing;
  
  return {
    tangoStartYear: startYear,
    tangoRoleExperience: buildTangoRoleExperience(tangoRoles, startYear)
  };
}
