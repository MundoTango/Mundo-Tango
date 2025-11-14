import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { FeatureFlagService } from '../services/FeatureFlagService';
import { RBACService } from '../services/RBACService';

/**
 * Tier Enforcement Middleware
 * 
 * Enforces role-based access control and feature flags based on user tier
 * Integrates with existing RBAC (8-tier system) and FeatureFlagService
 */

/**
 * Require minimum role level to access route
 * Example: requireMinimumRole(4) = Admin or higher
 */
export function requireMinimumRole(minimumLevel: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    try {
      const hasAccess = await RBACService.hasMinimumRoleLevel(authReq.user.id, minimumLevel);
      
      if (!hasAccess) {
        const userLevel = await RBACService.getUserRoleLevel(authReq.user.id);
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `This action requires role level ${minimumLevel} or higher. Your current level: ${userLevel}`,
          requiredLevel: minimumLevel,
          currentLevel: userLevel
        });
      }

      next();
    } catch (error: any) {
      console.error('[requireMinimumRole] Error:', error);
      res.status(500).json({ 
        error: 'Permission check failed',
        message: error.message 
      });
    }
  };
}

/**
 * Require specific boolean feature to be enabled for user's tier
 * Example: requireFeature('create_events')
 */
export function requireFeature(featureName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this feature'
      });
    }

    try {
      const featureAccess = await FeatureFlagService.canUseFeature(authReq.user.id, featureName);
      
      if (!featureAccess.allowed) {
        return res.status(403).json({
          error: 'Feature not available',
          message: featureAccess.reason || `The feature "${featureName}" is not available for your current tier`,
          featureName,
          upgradeRequired: true
        });
      }

      next();
    } catch (error: any) {
      console.error('[requireFeature] Error:', error);
      res.status(500).json({ 
        error: 'Feature check failed',
        message: error.message 
      });
    }
  };
}

/**
 * Require quota-based feature and check if user has remaining quota
 * Example: requireQuota('ai_messages')
 * Increments quota automatically after successful request
 */
export function requireQuota(featureName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to use this feature'
      });
    }

    try {
      const quotaCheck = await FeatureFlagService.canUseQuotaFeature(authReq.user.id, featureName);
      
      if (!quotaCheck.allowed) {
        return res.status(429).json({
          error: 'Quota exceeded',
          message: quotaCheck.reason || 'You have reached your usage limit for this feature',
          featureName,
          current: quotaCheck.current,
          limit: quotaCheck.limit,
          isUnlimited: quotaCheck.isUnlimited,
          upgradeRequired: !quotaCheck.isUnlimited
        });
      }

      // Attach quota info to request for post-processing
      (authReq as any).quotaFeature = featureName;
      (authReq as any).quotaInfo = quotaCheck;

      next();
    } catch (error: any) {
      console.error('[requireQuota] Error:', error);
      res.status(500).json({ 
        error: 'Quota check failed',
        message: error.message 
      });
    }
  };
}

/**
 * Middleware to increment quota AFTER successful request
 * Use this after requireQuota and route handler
 */
export async function incrementQuotaAfterSuccess(req: Request, res: Response, next: NextFunction) {
  const authReq = req as any;
  
  if (authReq.quotaFeature && authReq.user?.id) {
    try {
      await FeatureFlagService.incrementQuota(authReq.user.id, authReq.quotaFeature);
      console.log(`[QuotaIncrement] Incremented ${authReq.quotaFeature} for user ${authReq.user.id}`);
    } catch (error: any) {
      console.error('[incrementQuotaAfterSuccess] Error:', error);
      // Don't fail the request if quota increment fails
    }
  }
  
  next();
}

/**
 * Require specific permission (by name)
 * Example: requirePermission('manage_users')
 */
export function requirePermission(permissionName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to perform this action'
      });
    }

    try {
      const hasPermission = await RBACService.hasPermission(authReq.user.id, permissionName);
      
      if (!hasPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `You don't have the required permission: ${permissionName}`,
          requiredPermission: permissionName
        });
      }

      next();
    } catch (error: any) {
      console.error('[requirePermission] Error:', error);
      res.status(500).json({ 
        error: 'Permission check failed',
        message: error.message 
      });
    }
  };
}

/**
 * Composite middleware: Check both role level AND feature access
 * Example: requireRoleAndFeature(3, 'create_events')
 */
export function requireRoleAndFeature(minimumLevel: number, featureName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    
    if (!authReq.user || !authReq.user.id) {
      return res.status(401).json({ 
        error: 'Authentication required'
      });
    }

    try {
      // Check role level
      const hasRoleAccess = await RBACService.hasMinimumRoleLevel(authReq.user.id, minimumLevel);
      
      if (!hasRoleAccess) {
        const userLevel = await RBACService.getUserRoleLevel(authReq.user.id);
        return res.status(403).json({
          error: 'Insufficient role level',
          message: `Required role level: ${minimumLevel}, your level: ${userLevel}`
        });
      }

      // Check feature access
      const featureAccess = await FeatureFlagService.canUseFeature(authReq.user.id, featureName);
      
      if (!featureAccess.allowed) {
        return res.status(403).json({
          error: 'Feature not available',
          message: featureAccess.reason
        });
      }

      next();
    } catch (error: any) {
      console.error('[requireRoleAndFeature] Error:', error);
      res.status(500).json({ 
        error: 'Access check failed',
        message: error.message 
      });
    }
  };
}
