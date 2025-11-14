/**
 * Row Level Security (RLS) Context Management
 * 
 * This module provides utilities to execute database queries with proper RLS context.
 * RLS ensures that users can only access their own private data and prevents
 * unauthorized access to other users' sensitive information.
 * 
 * SECURITY CRITICAL: Always use getDbWithUser() for user-specific data queries.
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../../shared/schema";
import { db } from '../storage';

/**
 * Create a user-aware database connection that enforces Row Level Security (RLS)
 * 
 * How it works:
 * 1. Sets PostgreSQL session variable: app.current_user_id = userId
 * 2. RLS policies use current_user_id() function to filter data
 * 3. All queries automatically respect RLS policies
 * 
 * @param userId - The ID of the currently authenticated user
 * @returns Object with execute() method for RLS-protected queries
 * 
 * @example
 * // In a route handler
 * router.get('/api/financial-goals', authenticateToken, async (req, res) => {
 *   const userDb = getDbWithUser(req.user.id);
 *   
 *   // This query automatically filters to only this user's data
 *   const goals = await userDb.execute(async (tx) => {
 *     return tx.query.financialGoals.findMany();
 *   });
 *   
 *   res.json(goals);
 * });
 * 
 * @example
 * // With direct SQL
 * const userDb = getDbWithUser(req.user.id);
 * const result = await userDb.execute(async (tx) => {
 *   return tx.execute(sql`SELECT * FROM posts WHERE visibility = 'public'`);
 * });
 * 
 * @throws {Error} If userId is invalid or missing
 */
export function getDbWithUser(userId: number) {
  if (!userId || typeof userId !== 'number') {
    throw new Error('getDbWithUser requires a valid user ID. Received: ' + userId);
  }

  if (userId < 1) {
    throw new Error('Invalid user ID. User ID must be greater than 0');
  }

  const sql = neon(process.env.DATABASE_URL!);
  const userDb = drizzle(sql, { schema });

  return {
    /**
     * Execute a database operation with RLS context set
     * 
     * The callback receives a transaction object with the user context already set.
     * All queries within the callback will respect RLS policies for this user.
     * 
     * @param callback - Async function that receives a transaction object
     * @returns Promise resolving to the callback's return value
     */
    execute: async <T>(callback: (tx: typeof userDb) => Promise<T>): Promise<T> => {
      return await userDb.transaction(async (tx) => {
        await tx.execute(sql`SELECT set_config('app.current_user_id', ${userId.toString()}, true)`);
        return await callback(tx);
      });
    },
    
    /**
     * Direct access to the database instance
     * 
     * WARNING: Use this only for non-user-specific operations or when you need
     * to bypass RLS (e.g., admin operations, system tasks).
     * 
     * For user data, always use execute() instead.
     */
    db: userDb
  };
}

/**
 * Helper to check if a user can access a specific resource
 * 
 * This provides a programmatic way to check permissions before database access.
 * Use this for additional authorization checks beyond RLS.
 * 
 * @param userId - The user attempting access
 * @param resourceOwnerId - The owner of the resource
 * @returns boolean indicating if access is allowed
 * 
 * @example
 * if (!canUserAccess(req.user.id, post.userId)) {
 *   return res.status(403).json({ error: 'Unauthorized' });
 * }
 */
export function canUserAccess(userId: number, resourceOwnerId: number): boolean {
  return userId === resourceOwnerId;
}

/**
 * Verify RLS is enabled for a table
 * 
 * This is a diagnostic function to check if RLS is properly configured.
 * Use during development or in health checks.
 * 
 * @param tableName - Name of the table to check
 * @returns Promise<boolean> - True if RLS is enabled
 * 
 * @example
 * const isProtected = await isRLSEnabled('financial_goals');
 * console.log('Financial goals protected:', isProtected);
 */
export async function isRLSEnabled(tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(
      sql`
        SELECT relrowsecurity 
        FROM pg_class 
        WHERE relname = ${tableName}
      `
    );
    
    return result.rows[0]?.relrowsecurity === true;
  } catch (error) {
    console.error(`Error checking RLS for ${tableName}:`, error);
    return false;
  }
}

/**
 * Get a list of all tables with RLS enabled
 * 
 * Useful for auditing and verification that all sensitive tables are protected.
 * 
 * @returns Promise<string[]> - Array of table names with RLS enabled
 * 
 * @example
 * const protectedTables = await getRLSEnabledTables();
 * console.log('Protected tables:', protectedTables);
 */
export async function getRLSEnabledTables(): Promise<string[]> {
  try {
    const result = await db.execute(
      sql`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
          SELECT relname 
          FROM pg_class 
          WHERE relrowsecurity = true
        )
        ORDER BY tablename
      `
    );
    
    return result.rows.map((row: any) => row.tablename);
  } catch (error) {
    console.error('Error fetching RLS enabled tables:', error);
    return [];
  }
}

export { sql } from 'drizzle-orm';
