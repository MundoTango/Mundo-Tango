/**
 * Database connection exports with Row Level Security (RLS) support
 * 
 * This module provides:
 * 1. Standard database connection (db) - for system-level operations
 * 2. User-aware connection (getDbWithUser) - for RLS-protected queries
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import * as schema from "../../shared/schema";

// Re-export the standard db instance from storage.ts for backward compatibility
export { db } from '../storage';

/**
 * Create a user-aware database connection that enforces Row Level Security (RLS)
 * 
 * IMPORTANT: With Neon HTTP driver, we need to set the user context before each query.
 * This function returns a wrapper that executes queries within a transaction that sets
 * the RLS context.
 * 
 * @param userId - The ID of the currently authenticated user
 * @returns Object with query method that wraps database operations with RLS context
 * 
 * @example
 * // In a route handler
 * app.get('/api/posts', async (req, res) => {
 *   const userDb = getDbWithUser(req.user.id);
 *   const posts = await userDb.execute(async (tx) => {
 *     return tx.query.posts.findMany();
 *   });
 *   res.json(posts);
 * });
 */
export function getDbWithUser(userId: number) {
  if (!userId || typeof userId !== 'number') {
    throw new Error('getDbWithUser requires a valid user ID');
  }

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  return {
    /**
     * Execute a database operation with RLS context set
     * The callback receives a transaction object with the user context already set
     */
    execute: async <T>(callback: (tx: typeof db) => Promise<T>): Promise<T> => {
      // Use a transaction to ensure the user context persists
      return await db.transaction(async (tx) => {
        // Set the user context for RLS policies
        await tx.execute(sql`SELECT set_config('app.current_user_id', ${userId.toString()}, true)`);
        
        // Execute the callback with the transaction object
        return await callback(tx);
      });
    },
    
    /**
     * Direct access to the database for non-RLS operations
     * Use this only when you need to bypass RLS (e.g., admin operations)
     */
    db
  };
}

/**
 * Helper to check if a user can access a specific resource
 * This provides a programmatic way to check permissions before RLS
 * 
 * @param userId - The user attempting access
 * @param resourceOwnerId - The owner of the resource
 * @returns boolean indicating if access is allowed
 */
export function canUserAccess(userId: number, resourceOwnerId: number): boolean {
  return userId === resourceOwnerId;
}

/**
 * Execute a database operation with Row Level Security context set
 * 
 * This is a simpler alternative to getDbWithUser() for when you need to execute
 * a single query or operation with RLS context.
 * 
 * IMPORTANT: This uses the standard db connection and sets/resets the session variable.
 * For complex operations with multiple queries, prefer getDbWithUser().execute()
 * 
 * @param userId - The ID of the currently authenticated user
 * @param fn - Async function containing the database operation
 * @returns The result of the database operation
 * 
 * @example
 * // In a route handler
 * router.get('/api/financial-goals', auth, async (req, res) => {
 *   const goals = await setRLSContext(req.user.id, async () => {
 *     return db.query.financialGoals.findMany();
 *   });
 *   res.json(goals);
 * });
 */
export async function setRLSContext<T>(userId: number, fn: () => Promise<T>): Promise<T> {
  if (!userId || typeof userId !== 'number') {
    throw new Error('setRLSContext requires a valid user ID');
  }

  const { db } = await import('../storage');
  const { sql } = await import('drizzle-orm');

  try {
    // Set the user context for RLS policies
    await db.execute(sql`SET LOCAL app.current_user_id = ${userId.toString()}`);
    
    // Execute the callback
    const result = await fn();
    
    // Reset the user context
    await db.execute(sql`RESET app.current_user_id`);
    
    return result;
  } catch (error) {
    // Ensure we reset even on error
    try {
      await db.execute(sql`RESET app.current_user_id`);
    } catch (resetError) {
      console.error('[RLS] Failed to reset user context:', resetError);
    }
    throw error;
  }
}
