import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

// Global rate limiter for all routes
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // 10000 requests per window (high limit for development/testing)
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for Vite dev server assets and websockets
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isAssetRequest = req.path.startsWith('/@') || req.path.startsWith('/src/') || req.path.startsWith('/node_modules/');
    const isWebSocket = req.headers.upgrade === 'websocket';
    return isDevelopment && (isAssetRequest || isWebSocket);
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many requests",
      message: "You have exceeded the rate limit. Please try again later.",
      retryAfter: (req as any).rateLimit?.resetTime,
    });
  },
});

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 1000, // 10 attempts in production, 1000 in dev
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many authentication attempts",
      message: "Your account has been temporarily locked due to too many failed login attempts.",
      retryAfter: (req as any).rateLimit?.resetTime,
    });
  },
});

// API rate limiter for general API endpoints
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: "API rate limit exceeded",
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload rate limiter for file uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: "Upload rate limit exceeded",
  skipSuccessfulRequests: false,
});

// Admin action rate limiter
export const adminRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // 50 admin actions per minute
  message: "Admin action rate limit exceeded",
});

// Payment/checkout rate limiter
export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: "Payment rate limit exceeded",
  skipSuccessfulRequests: true,
});

// Search rate limiter
export const searchRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 searches per minute
  message: "Search rate limit exceeded",
});

// Export all rate limiters
export const rateLimiters = {
  global: globalRateLimiter,
  auth: authRateLimiter,
  api: apiRateLimiter,
  upload: uploadRateLimiter,
  admin: adminRateLimiter,
  payment: paymentRateLimiter,
  search: searchRateLimiter,
};
