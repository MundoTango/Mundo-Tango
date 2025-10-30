import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { SelectUser } from "@shared/schema";

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

  const refreshSecret = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
  const expiresIn: string = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  return jwt.sign(payload, refreshSecret, { expiresIn } as jwt.SignOptions);
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
  return jwt.verify(token, refreshSecret) as JWTPayload;
};
