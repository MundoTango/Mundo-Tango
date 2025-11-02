import { db } from '@shared/db';
import { platformRoles, platformPermissions, platformUserRoles, platformRolePermissions, users } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * God-Level RBAC Service (8-Tier Hierarchy)
 * 
 * Tier 8: God (Owner) - ALL permissions
 * Tier 7: Super Admin - Platform-wide control
 * Tier 6: Platform Volunteer - Contributor tools
 * Tier 5: Platform Contributor - Basic contributor access
 * Tier 4: Admin - Community management
 * Tier 3: Community Leader - Event/group creation
 * Tier 2: Premium User - Enhanced features
 * Tier 1: Free User - Basic access
 */
export class RBACService {
  /**
   * Get user's highest role level (for numeric comparisons)
   * Returns highest level if user has multiple roles
   */
  static async getUserRoleLevel(userId: number): Promise<number> {
    const userRolesData = await db
      .select({
        roleLevel: platformRoles.roleLevel,
      })
      .from(platformUserRoles)
      .innerJoin(platformRoles, eq(platformUserRoles.roleId, platformRoles.id))
      .where(eq(platformUserRoles.userId, userId));

    if (userRolesData.length === 0) {
      return 1; // Default: Free User (Tier 1)
    }

    // Return highest role level (God = 8, Free = 1)
    return Math.max(...userRolesData.map((r: any) => r.roleLevel));
  }

  /**
   * Check if user has specific permission
   * Uses permission inheritance: Tier 8 (God) has ALL permissions
   */
  static async hasPermission(userId: number, permissionName: string): Promise<boolean> {
    const userRoleLevel = await this.getUserRoleLevel(userId);

    // God (Tier 8) has ALL permissions automatically
    if (userRoleLevel === 8) {
      return true;
    }

    // Get user's role IDs
    const userRolesData = await db
      .select({ roleId: platformUserRoles.roleId })
      .from(platformUserRoles)
      .where(eq(platformUserRoles.userId, userId));

    if (userRolesData.length === 0) {
      return false;
    }

    const roleIds = userRolesData.map((r: any) => r.roleId);

    // Check if any of user's roles have the permission
    const permission = await db
      .select({ id: platformPermissions.id })
      .from(platformPermissions)
      .where(eq(platformPermissions.name, permissionName))
      .limit(1);

    if (permission.length === 0) {
      return false;
    }

    const hasPermission = await db
      .select()
      .from(platformRolePermissions)
      .where(
        and(
          inArray(platformRolePermissions.roleId, roleIds),
          eq(platformRolePermissions.permissionId, permission[0].id)
        )
      )
      .limit(1);

    return hasPermission.length > 0;
  }

  /**
   * Check if user has specific permission (by permission ID)
   */
  static async hasPermissionById(userId: number, permissionId: number): Promise<boolean> {
    const userRoleLevel = await this.getUserRoleLevel(userId);

    // God (Tier 8) has ALL permissions automatically
    if (userRoleLevel === 8) {
      return true;
    }

    // Get user's role IDs
    const userRolesData = await db
      .select({ roleId: platformUserRoles.roleId })
      .from(platformUserRoles)
      .where(eq(platformUserRoles.userId, userId));

    if (userRolesData.length === 0) {
      return false;
    }

    const roleIds = userRolesData.map((r: any) => r.roleId);

    const hasPermission = await db
      .select()
      .from(platformRolePermissions)
      .where(
        and(
          inArray(platformRolePermissions.roleId, roleIds),
          eq(platformRolePermissions.permissionId, permissionId)
        )
      )
      .limit(1);

    return hasPermission.length > 0;
  }

  /**
   * Get all permissions for a user (including inherited permissions)
   */
  static async getUserPermissions(userId: number): Promise<string[]> {
    const userRoleLevel = await this.getUserRoleLevel(userId);

    // God (Tier 8) gets ALL permissions
    if (userRoleLevel === 8) {
      const allPermissions = await db.select({ name: platformPermissions.name }).from(platformPermissions);
      return allPermissions.map((p: any) => p.name);
    }

    // Get user's role IDs
    const userRolesData = await db
      .select({ roleId: platformUserRoles.roleId })
      .from(platformUserRoles)
      .where(eq(platformUserRoles.userId, userId));

    if (userRolesData.length === 0) {
      return [];
    }

    const roleIds = userRolesData.map((r: any) => r.roleId);

    // Get all permissions for these roles
    const userPermissions = await db
      .select({
        name: platformPermissions.name,
      })
      .from(platformRolePermissions)
      .innerJoin(platformPermissions, eq(platformRolePermissions.permissionId, platformPermissions.id))
      .where(inArray(platformRolePermissions.roleId, roleIds));

    return Array.from(new Set(userPermissions.map((p: any) => p.name))); // Deduplicate
  }

  /**
   * Assign role to user
   */
  static async assignRole(
    userId: number,
    roleName: string,
    assignedBy?: number,
    expiresAt?: Date
  ): Promise<void> {
    const role = await db
      .select()
      .from(platformRoles)
      .where(eq(platformRoles.name, roleName))
      .limit(1);

    if (role.length === 0) {
      throw new Error(`Role ${roleName} not found`);
    }

    await db
      .insert(platformUserRoles)
      .values({
        userId,
        roleId: role[0].id,
        assignedBy,
        expiresAt,
      })
      .onConflictDoNothing();
  }

  /**
   * Remove role from user
   */
  static async removeRole(userId: number, roleName: string): Promise<void> {
    const role = await db
      .select()
      .from(platformRoles)
      .where(eq(platformRoles.name, roleName))
      .limit(1);

    if (role.length === 0) {
      throw new Error(`Role ${roleName} not found`);
    }

    await db
      .delete(platformUserRoles)
      .where(
        and(
          eq(platformUserRoles.userId, userId),
          eq(platformUserRoles.roleId, role[0].id)
        )
      );
  }

  /**
   * Check if user has minimum role level
   * Example: requireRoleLevel(7) checks if user is Super Admin or God
   */
  static async hasMinimumRoleLevel(userId: number, minimumLevel: number): Promise<boolean> {
    const userLevel = await this.getUserRoleLevel(userId);
    return userLevel >= minimumLevel;
  }
}
