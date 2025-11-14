/**
 * ROW LEVEL SECURITY (RLS) HELPERS
 * 
 * CRITICAL SECURITY: These helpers enable database-level access control.
 * All queries accessing user-specific data MUST use withUserContext()
 * to ensure Row Level Security policies are enforced.
 * 
 * Usage:
 * ```typescript
 * const userId = req.userId!;
 * const data = await withUserContext(userId, async () => {
 *   return db.select().from(financialAccounts).where(...);
 * });
 * ```
 */

import { db } from "@shared/db";
import { sql } from "drizzle-orm";

/**
 * Set the current user ID in the database session.
 * This value is used by RLS policies to determine data access.
 * 
 * @param userId - The ID of the authenticated user
 */
export async function setDbUser(userId: number): Promise<void> {
  try {
    await db.execute(sql`SET LOCAL app.user_id = ${userId}`);
  } catch (error) {
    console.error('[RLS] Failed to set user context:', error);
    throw new Error('Failed to set database user context');
  }
}

/**
 * Execute a database operation with RLS user context.
 * 
 * This ensures that all queries within the callback are executed
 * with the proper user context, enabling RLS policies to filter
 * data appropriately.
 * 
 * IMPORTANT: All route handlers accessing user-specific data should
 * wrap their database queries with this function.
 * 
 * @param userId - The ID of the authenticated user
 * @param callback - Async function containing database operations
 * @returns The result of the callback function
 * 
 * @example
 * ```typescript
 * router.get('/api/financial-accounts', authenticateToken, async (req: AuthRequest, res: Response) => {
 *   const userId = req.userId!;
 *   
 *   const accounts = await withUserContext(userId, async () => {
 *     return db.select().from(financialAccounts);
 *   });
 *   
 *   res.json(accounts);
 * });
 * ```
 */
export async function withUserContext<T>(
  userId: number,
  callback: () => Promise<T>
): Promise<T> {
  // Set the user context for RLS policies
  await setDbUser(userId);
  
  try {
    // Execute the callback with the user context set
    return await callback();
  } catch (error) {
    console.error('[RLS] Query execution error:', error);
    throw error;
  }
}

/**
 * Execute a database operation as a system/admin user.
 * This bypasses RLS policies for administrative operations.
 * 
 * USE WITH EXTREME CAUTION - only for legitimate admin operations.
 * 
 * @param callback - Async function containing database operations
 * @returns The result of the callback function
 */
export async function withSystemContext<T>(
  callback: () => Promise<T>
): Promise<T> {
  try {
    // Set a special admin flag that RLS policies can check
    await db.execute(sql`SET LOCAL app.is_admin = true`);
    return await callback();
  } catch (error) {
    console.error('[RLS] System query execution error:', error);
    throw error;
  } finally {
    // Reset the admin flag
    await db.execute(sql`SET LOCAL app.is_admin = false`);
  }
}
