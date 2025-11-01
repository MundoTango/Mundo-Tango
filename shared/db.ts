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
