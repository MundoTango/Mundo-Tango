import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { SelectUser } from "@shared/schema";
import { RBACService } from "../services/RBACService";
import { FeatureFlagService } from "../services/FeatureFlagService";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set");
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  user?: SelectUser;
  userId?: number;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    const user = await storage.getUserById(payload.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    if (user.suspended) {
      return res.status(403).json({ message: "Account is suspended" });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Insufficient permissions",
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

export const requireVerified = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ message: "Email verification required" });
  }

  next();
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const user = await storage.getUserById(payload.userId);
    
    if (user && user.isActive && !user.suspended) {
      req.user = user;
      req.userId = user.id;
    }
    
    next();
  } catch (error) {
    next();
  }
};

export const generateAccessToken = (user: SelectUser): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const expiresIn: string = process.env.JWT_EXPIRES_IN || "15m";
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

export const generateRefreshToken = (user: SelectUser): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  // Require separate refresh secret in production for security
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_REFRESH_SECRET must be set in production');
  }
  const secret = refreshSecret || JWT_SECRET;
  
  const expiresIn: string = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_REFRESH_SECRET must be set in production');
  }
  const secret = refreshSecret || JWT_SECRET;
  return jwt.verify(token, secret) as JWTPayload;
};

// ============================================================================
// GOD-LEVEL RBAC MIDDLEWARE (8-Tier System)
// ============================================================================

/**
 * Require minimum role level (1-8)
 * Tier 8: God (Owner)
 * Tier 7: Super Admin
 * Tier 6: Platform Volunteer
 * Tier 5: Platform Contributor
 * Tier 4: Admin
 * Tier 3: Community Leader
 * Tier 2: Premium User
 * Tier 1: Free User
 */
export const requireRoleLevel = (minimumLevel: number) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const hasAccess = await RBACService.hasMinimumRoleLevel(req.userId, minimumLevel);

      if (!hasAccess) {
        const userLevel = await RBACService.getUserRoleLevel(req.userId);
        return res.status(403).json({
          message: "Insufficient role level",
          required: minimumLevel,
          current: userLevel,
        });
      }

      next();
    } catch (error) {
      console.error("RBAC error:", error);
      return res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

/**
 * Require specific permission
 * Example: requirePermission('posts.delete')
 */
export const requirePermission = (permissionName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const hasPermission = await RBACService.hasPermission(req.userId, permissionName);

      if (!hasPermission) {
        return res.status(403).json({
          message: "Permission denied",
          required: permissionName,
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

// ============================================================================
// FEATURE FLAG MIDDLEWARE
// ============================================================================

/**
 * Check if user has access to a feature (boolean or quota)
 * Example: requireFeature('housing.create')
 */
export const requireFeature = (featureName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const access = await FeatureFlagService.canUseFeature(req.userId, featureName);

      if (!access.allowed) {
        return res.status(403).json({
          message: "Feature not available",
          feature: featureName,
          reason: access.reason,
          upgradeRequired: true,
        });
      }

      next();
    } catch (error) {
      console.error("Feature flag error:", error);
      return res.status(500).json({ message: "Error checking feature access" });
    }
  };
};

/**
 * Check quota-based feature access
 * Example: requireQuotaFeature('posts.create')
 */
export const requireQuotaFeature = (featureName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const quota = await FeatureFlagService.canUseQuotaFeature(req.userId, featureName);

      if (!quota.allowed) {
        return res.status(403).json({
          message: "Quota exceeded",
          feature: featureName,
          current: quota.current,
          limit: quota.limit,
          upgradeRequired: true,
        });
      }

      // Attach quota info to request for later use
      (req as any).featureQuota = quota;
      next();
    } catch (error) {
      console.error("Quota check error:", error);
      return res.status(500).json({ message: "Error checking quota" });
    }
  };
};
