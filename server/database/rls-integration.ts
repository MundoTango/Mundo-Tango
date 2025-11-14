import { db } from '@shared/db';
import { sql } from 'drizzle-orm';

/**
 * RLS Integration Helper
 * Sets current_user_id for PostgreSQL Row Level Security policies
 */

/**
 * Set current user ID for RLS policies in database session
 * Call this at the start of each authenticated request
 */
export async function setRLSContext(userId: number): Promise<void> {
  try {
    await db.execute(sql`SET LOCAL app.current_user_id = ${userId}`);
  } catch (error) {
    console.error('[RLS] Failed to set user context:', error);
    // Don't throw - RLS might not be enabled yet
  }
}

/**
 * Clear RLS context (call at end of request or in error handlers)
 */
export async function clearRLSContext(): Promise<void> {
  try {
    await db.execute(sql`RESET app.current_user_id`);
  } catch (error) {
    console.error('[RLS] Failed to clear user context:', error);
  }
}

/**
 * Express middleware to automatically set RLS context for authenticated requests
 * Use AFTER authenticateToken middleware
 */
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';

export function setRLSMiddleware(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthRequest;
  
  if (authReq.user && authReq.user.id) {
    setRLSContext(authReq.user.id)
      .then(() => next())
      .catch((error) => {
        console.error('[RLS Middleware] Error:', error);
        next(); // Continue even if RLS fails (policies might not be enabled)
      });
  } else {
    next();
  }
}

/**
 * Apply RLS policies to database
 * Run this during deployment or database setup
 */
export async function applyRLSPolicies(): Promise<void> {
  const fs = require('fs');
  const path = require('path');
  
  const sqlPath = path.join(__dirname, 'rls-policies.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.warn('[RLS] Policies file not found:', sqlPath);
    return;
  }
  
  const policies = fs.readFileSync(sqlPath, 'utf-8');
  
  try {
    await db.execute(sql.raw(policies));
    console.log('✅ [RLS] Policies applied successfully');
  } catch (error: any) {
    console.error('❌ [RLS] Failed to apply policies:', error.message);
    throw error;
  }
}

/**
 * Check if RLS is enabled on a table
 */
export async function isRLSEnabled(tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(
      sql`SELECT relrowsecurity FROM pg_class WHERE relname = ${tableName}`
    );
    return result.rows[0]?.relrowsecurity === true;
  } catch (error) {
    console.error(`[RLS] Failed to check RLS status for ${tableName}:`, error);
    return false;
  }
}
