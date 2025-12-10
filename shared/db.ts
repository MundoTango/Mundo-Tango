// ============================================================================
// DATABASE CONNECTION - Mundo Tango
// ============================================================================
// Centralized database connection using Supabase/PostgreSQL
// Updated to use pg Pool for Supabase compatibility
// ============================================================================

import { Pool } from 'pg';
import { drizzle as drizzlePg, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import * as schema from './schema';
import * as platformSchema from './platform-schema';

// Determine database type - prefer Supabase if available
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
const isSupabase = !!process.env.SUPABASE_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('SUPABASE_DATABASE_URL or DATABASE_URL environment variable is not set');
}

console.log(`[shared/db] Connecting to ${isSupabase ? 'Supabase' : 'Neon'} database`);

// Create appropriate database driver based on database type
type DbType = NodePgDatabase<typeof schema & typeof platformSchema> | NeonHttpDatabase<typeof schema & typeof platformSchema>;
let db: DbType;
let pool: Pool | null = null;
let sqlClient: NeonQueryFunction<boolean, boolean> | null = null;

if (isSupabase) {
  // Use pg Pool for Supabase (standard PostgreSQL)
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzlePg(pool, {
    schema: { ...schema, ...platformSchema },
  });
} else {
  // Use Neon HTTP driver for Neon databases
  sqlClient = neon(databaseUrl);
  db = drizzleNeon(sqlClient, {
    schema: { ...schema, ...platformSchema },
  });
}

// Export schemas for use in other files
export { db, schema, platformSchema };

// ============================================================================
// CONNECTION HEALTH CHECK
// ============================================================================

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    if (isSupabase && pool) {
      const client = await pool.connect();
      try {
        await client.query('SELECT 1 as health_check');
        return true;
      } finally {
        client.release();
      }
    } else if (sqlClient) {
      await sqlClient`SELECT 1 as health_check`;
      return true;
    }
    return false;
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
    if (isSupabase && pool) {
      const client = await pool.connect();
      try {
        const result = await client.query(query, params || []);
        return result.rows as T[];
      } finally {
        client.release();
      }
    } else if (sqlClient) {
      const result = await sqlClient(query, params || []);
      return result as T[];
    }
    throw new Error('No database connection available');
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
export function getDbWithUser(userId: number): DbType {
  if (isSupabase && pool) {
    // For Supabase, we return the same db instance
    // RLS is handled at the database level through policies
    return db;
  } else if (sqlClient) {
    // Create a new SQL function with user context for Neon
    const userSql: NeonQueryFunction<boolean, boolean> = neon(databaseUrl!, {
      queryCallback: async (query, params) => {
        await sqlClient!`SELECT set_config('app.user_id', ${userId.toString()}, true)`;
      },
    });
    
    return drizzleNeon(userSql, {
      schema: { ...schema, ...platformSchema },
    });
  }
  return db;
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
  callback: (db: DbType) => Promise<T>
): Promise<T> {
  try {
    if (isSupabase && pool) {
      // For Supabase, RLS is handled at the database level
      return await callback(db);
    } else if (sqlClient) {
      // Set user context for Neon
      await sqlClient`SELECT set_config('app.user_id', ${userId.toString()}, true)`;
      return await callback(db);
    }
    throw new Error('No database connection available');
  } catch (error) {
    console.error('[RLS] Query with user context failed:', error);
    throw error;
  }
}
