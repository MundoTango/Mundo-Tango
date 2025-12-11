// ============================================================================
// DATABASE CONNECTION - Mundo Tango
// ============================================================================
// Centralized database connection using Neon serverless driver
// ============================================================================

import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as platformSchema from './platform-schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create Neon SQL function
const sql: NeonQueryFunction<boolean, boolean> = neon(process.env.DATABASE_URL);

// Create Drizzle database instance with all schemas
export const db: NeonHttpDatabase<typeof schema & typeof platformSchema> = drizzle(sql, {
  schema: { ...schema, ...platformSchema },
});

// Export schemas for use in other files
export { schema, platformSchema };

// ============================================================================
// CONNECTION HEALTH CHECK
// ============================================================================

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1 as health_check`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

export async function executeRawQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
  try {
    const result = await sql(query, params || []);
    return result as T[];
  } catch (error) {
    console.error('Raw query execution failed:', error);
    throw error;
  }
}

// ============================================================================
// ROW LEVEL SECURITY (RLS) HELPERS
// ============================================================================

/**
 * Get database instance with user context for RLS
 * CRITICAL: Use this for all queries accessing user-specific data
 * 
 * @param userId - The authenticated user's ID
 * @returns Database instance with user context set
 * 
 * @example
 * ```typescript
 * // In a route handler:
 * const userDb = getDbWithUser(req.user.id);
 * const goals = await userDb.select().from(financialGoals);
 * // RLS ensures only the user's own goals are returned
 * ```
 */
export function getDbWithUser(userId: number): NeonHttpDatabase<typeof schema & typeof platformSchema> {
  // Create a new SQL function with user context
  const userSql: NeonQueryFunction<boolean, boolean> = neon(process.env.DATABASE_URL!, {
    // Set the user context as a session variable for RLS policies
    queryCallback: async (query, params) => {
      // First set the user context
      await sql`SELECT set_config('app.user_id', ${userId.toString()}, true)`;
    },
  });
  
  return drizzle(userSql, {
    schema: { ...schema, ...platformSchema },
  });
}

/**
 * Execute a query with user context for RLS
 * Simpler alternative to getDbWithUser() for one-off queries
 * 
 * @param userId - The authenticated user's ID
 * @param callback - Async function containing database operations
 * @returns Result of the callback
 */
export async function withUserContext<T>(
  userId: number,
  callback: (db: typeof db) => Promise<T>
): Promise<T> {
  try {
    // Set user context
    await sql`SELECT set_config('app.user_id', ${userId.toString()}, true)`;
    
    // Execute the callback
    return await callback(db);
  } catch (error) {
    console.error('[RLS] Query with user context failed:', error);
    throw error;
  }
}
