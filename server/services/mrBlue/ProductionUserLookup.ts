/**
 * Mr. Blue Production User Lookup Service
 * Enables admin users to troubleshoot production users through Mr. Blue
 * 
 * MB.MD Pattern: Production Admin Tools
 * use mb.md: admin:production
 */

import { productionDb } from "../ProductionDatabaseService";
import { storage } from "../../storage";

interface ProductionUserInfo {
  found: boolean;
  user?: any;
  loginDiagnosis?: {
    canLogin: boolean;
    issues: string[];
    recommendation: string;
  };
  error?: string;
}

/**
 * Check if a user has god-level admin access
 */
export async function isGodLevelUser(userId: number): Promise<boolean> {
  if (!userId || userId <= 0) return false;
  
  try {
    const user = await userRepository.getUserById(userId);
    if (!user) return false;
    
    const godLevelRoles = ['super_admin', 'admin', 'god', 'founder'];
    const godLevelEmails = ['admin@mundotango.life', 'founder@mundotango.life'];
    
    return godLevelRoles.includes(user.role) || godLevelEmails.includes(user.email);
  } catch (error) {
    console.error('[ProductionUserLookup] Error checking god level:', error);
    return false;
  }
}

/**
 * Lookup a production user by email
 * Only available to god-level users
 */
export async function lookupProductionUser(email: string, requestingUserId: number): Promise<ProductionUserInfo> {
  // Security: Verify requesting user is god-level
  const isAdmin = await isGodLevelUser(requestingUserId);
  if (!isAdmin) {
    return {
      found: false,
      error: "Production user lookup is only available to admin users"
    };
  }
  
  // Check if production database is configured
  if (!productionDb.isConnected()) {
    return {
      found: false,
      error: "Production database is not configured. This feature only works when deployed."
    };
  }
  
  try {
    const result = await productionDb.getUserLoginHistory(email);
    
    if (!result) {
      return {
        found: false,
        error: `User with email "${email}" not found in production database`
      };
    }
    
    return {
      found: true,
      user: result.user,
      loginDiagnosis: result.loginDiagnosis
    };
  } catch (error: any) {
    console.error('[ProductionUserLookup] Error:', error);
    return {
      found: false,
      error: `Failed to lookup user: ${error.message}`
    };
  }
}

/**
 * Get production statistics
 * Only available to god-level users
 */
export async function getProductionStats(requestingUserId: number): Promise<any> {
  const isAdmin = await isGodLevelUser(requestingUserId);
  if (!isAdmin) {
    return { error: "Production stats are only available to admin users" };
  }
  
  if (!productionDb.isConnected()) {
    return { error: "Production database is not configured" };
  }
  
  try {
    return await productionDb.getProductionStats();
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Search production users
 * Only available to god-level users
 */
export async function searchProductionUsers(query: string, requestingUserId: number, limit = 10): Promise<any> {
  const isAdmin = await isGodLevelUser(requestingUserId);
  if (!isAdmin) {
    return { error: "Production user search is only available to admin users" };
  }
  
  if (!productionDb.isConnected()) {
    return { error: "Production database is not configured" };
  }
  
  try {
    const users = await productionDb.searchUsers(query, limit);
    return { users, count: users.length };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Format production user info for Mr. Blue response
 */
export function formatUserInfoForMrBlue(info: ProductionUserInfo): string {
  if (!info.found) {
    return info.error || "User not found";
  }
  
  const user = info.user;
  const diagnosis = info.loginDiagnosis;
  
  let response = `**Production User Found:**
- Email: ${user.email}
- Display Name: ${user.displayName || 'Not set'}
- Role: ${user.role}
- Created: ${new Date(user.createdAt).toLocaleDateString()}

**Login Status:** ${diagnosis?.canLogin ? '✅ Can Login' : '❌ Cannot Login'}`;

  if (diagnosis?.issues?.length) {
    response += `\n\n**Issues Found:**`;
    for (const issue of diagnosis.issues) {
      response += `\n- ${issue}`;
    }
  }
  
  if (diagnosis?.recommendation) {
    response += `\n\n**Recommendation:** ${diagnosis.recommendation}`;
  }
  
  return response;
}
