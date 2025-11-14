/**
 * ROW LEVEL SECURITY (RLS) POLICY MANAGEMENT
 * 
 * This module provides utilities for managing PostgreSQL Row Level Security policies.
 * RLS is our primary defense against unauthorized data access.
 * 
 * SECURITY PRINCIPLES:
 * 1. Deny by default - RLS blocks all access unless explicitly allowed
 * 2. Ownership-based - Users can only access their own data
 * 3. Visibility-based - Posts/content respect visibility settings
 * 4. Relationship-based - Friends, group members, etc. can access shared data
 */

import { db } from "@shared/db";
import { sql } from "drizzle-orm";

/**
 * Table names requiring RLS protection
 */
export const RLS_TABLES = [
  'users',
  'posts',
  'chat_messages',
  'chat_rooms',
  'chat_room_users',
  'financial_portfolios',
  'financial_accounts',
  'financial_assets',
  'financial_trades',
  'bookings',
  'subscriptions',
  'payments',
  'friendships',
  'friend_requests',
  'groups',
  'group_members',
  'group_posts',
  'event_rsvps',
  'notifications',
  'mr_blue_conversations',
  'mr_blue_messages',
  'life_ceo_conversations',
  'life_ceo_chat_messages',
] as const;

export type RLSTable = typeof RLS_TABLES[number];

/**
 * Enable RLS on a specific table
 */
export async function enableRLSOnTable(tableName: string): Promise<void> {
  try {
    await db.execute(sql.raw(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`));
    console.log(`[RLS] Enabled RLS on table: ${tableName}`);
  } catch (error) {
    console.error(`[RLS] Failed to enable RLS on ${tableName}:`, error);
    throw error;
  }
}

/**
 * Disable RLS on a specific table (use with caution!)
 */
export async function disableRLSOnTable(tableName: string): Promise<void> {
  try {
    await db.execute(sql.raw(`ALTER TABLE ${tableName} DISABLE ROW LEVEL SECURITY;`));
    console.log(`[RLS] Disabled RLS on table: ${tableName}`);
  } catch (error) {
    console.error(`[RLS] Failed to disable RLS on ${tableName}:`, error);
    throw error;
  }
}

/**
 * Create a basic ownership policy (owner can do everything)
 */
export async function createOwnershipPolicy(
  tableName: string,
  policyName: string,
  userIdColumn: string = 'user_id'
): Promise<void> {
  try {
    // Drop existing policy if it exists
    await db.execute(sql.raw(`DROP POLICY IF EXISTS ${policyName} ON ${tableName};`));
    
    // Create new policy
    await db.execute(sql.raw(`
      CREATE POLICY ${policyName} ON ${tableName}
        FOR ALL
        USING (${userIdColumn} = current_setting('app.user_id', true)::int)
        WITH CHECK (${userIdColumn} = current_setting('app.user_id', true)::int);
    `));
    
    console.log(`[RLS] Created ownership policy: ${policyName} on ${tableName}`);
  } catch (error) {
    console.error(`[RLS] Failed to create ownership policy on ${tableName}:`, error);
    throw error;
  }
}

/**
 * Create a read-only policy for public data
 */
export async function createPublicReadPolicy(
  tableName: string,
  policyName: string,
  visibilityColumn: string = 'visibility'
): Promise<void> {
  try {
    await db.execute(sql.raw(`DROP POLICY IF EXISTS ${policyName} ON ${tableName};`));
    
    await db.execute(sql.raw(`
      CREATE POLICY ${policyName} ON ${tableName}
        FOR SELECT
        USING (${visibilityColumn} = 'public');
    `));
    
    console.log(`[RLS] Created public read policy: ${policyName} on ${tableName}`);
  } catch (error) {
    console.error(`[RLS] Failed to create public read policy on ${tableName}:`, error);
    throw error;
  }
}

/**
 * Check if RLS is enabled on a table
 */
export async function isRLSEnabled(tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql.raw(`
      SELECT relrowsecurity
      FROM pg_class
      WHERE relname = '${tableName}';
    `));
    
    return result.rows[0]?.relrowsecurity === true;
  } catch (error) {
    console.error(`[RLS] Failed to check RLS status on ${tableName}:`, error);
    return false;
  }
}

/**
 * List all policies on a table
 */
export async function listPolicies(tableName: string): Promise<any[]> {
  try {
    const result = await db.execute(sql.raw(`
      SELECT 
        policyname as name,
        permissive,
        roles,
        cmd as command,
        qual as using_expression,
        with_check as with_check_expression
      FROM pg_policies
      WHERE tablename = '${tableName}';
    `));
    
    return result.rows;
  } catch (error) {
    console.error(`[RLS] Failed to list policies on ${tableName}:`, error);
    return [];
  }
}

/**
 * Drop a specific policy
 */
export async function dropPolicy(tableName: string, policyName: string): Promise<void> {
  try {
    await db.execute(sql.raw(`DROP POLICY IF EXISTS ${policyName} ON ${tableName};`));
    console.log(`[RLS] Dropped policy: ${policyName} on ${tableName}`);
  } catch (error) {
    console.error(`[RLS] Failed to drop policy ${policyName} on ${tableName}:`, error);
    throw error;
  }
}

/**
 * Initialize RLS on all required tables
 * This should be run during deployment/migration
 */
export async function initializeRLS(): Promise<void> {
  console.log('[RLS] Initializing Row Level Security...');
  
  for (const table of RLS_TABLES) {
    try {
      await enableRLSOnTable(table);
    } catch (error) {
      console.error(`[RLS] Failed to enable RLS on ${table}:`, error);
    }
  }
  
  console.log('[RLS] RLS initialization complete');
}

/**
 * Verify RLS is enabled on all required tables
 */
export async function verifyRLS(): Promise<{ table: string; enabled: boolean }[]> {
  const results = [];
  
  for (const table of RLS_TABLES) {
    const enabled = await isRLSEnabled(table);
    results.push({ table, enabled });
    
    if (!enabled) {
      console.warn(`[RLS] WARNING: RLS not enabled on ${table}`);
    }
  }
  
  return results;
}
