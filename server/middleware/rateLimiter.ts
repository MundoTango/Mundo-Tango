import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

const isDevelopment = process.env.NODE_ENV !== 'production';

// Helper to properly handle IPv6 addresses
function getKeyFromIP(req: Request): string {
  // Use req.ip which is already normalized by Express
  const ip = req.ip || 'unknown';
  // Convert IPv6-mapped IPv4 addresses to IPv4
  return ip.replace(/^::ffff:/, '');
}

// Global rate limiter for all routes
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100000 : 500, // Effectively disabled in dev
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevelopment, // Completely skip in development
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
  max: isDevelopment ? 100000 : 10, // Disabled in dev
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true,
  skip: () => isDevelopment, // Completely skip in development
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
  max: isDevelopment ? 100000 : 30, // Disabled in dev
  message: "API rate limit exceeded",
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevelopment, // Completely skip in development
});

// Upload rate limiter for file uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 100000 : 20,
  message: "Upload rate limit exceeded",
  skipSuccessfulRequests: false,
  skip: () => isDevelopment,
});

// Admin action rate limiter
export const adminRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDevelopment ? 100000 : 50,
  message: "Admin action rate limit exceeded",
  skip: () => isDevelopment,
});

// Payment/checkout rate limiter
export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 100000 : 10,
  message: "Payment rate limit exceeded",
  skipSuccessfulRequests: true,
  skip: () => isDevelopment,
});

// Search rate limiter
export const searchRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDevelopment ? 100000 : 20,
  message: "Search rate limit exceeded",
  skip: () => isDevelopment,
});

// ============================================================================
// TIERED SUBSCRIPTION-BASED RATE LIMITING (TRACK 9)
// ============================================================================

/**
 * Tiered rate limits based on subscription tier:
 * - Free tier: 100 requests/hour
 * - Basic tier: 500 requests/hour
 * - Plus tier: 2000 requests/hour
 * - Pro tier: 10000 requests/hour
 * - God tier: Unlimited
 */
export const tieredRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: async (req: Request) => {
    // Skip entirely in development
    if (isDevelopment) return 100000;
    
    const authReq = req as AuthRequest;
    
    // If user is authenticated, check their subscription tier
    if (authReq.user) {
      const tier = authReq.user.subscriptionTier || 'free';
      
      switch (tier.toLowerCase()) {
        case 'god':
          return 999999; // Effectively unlimited
        case 'pro':
          return 10000;
        case 'plus':
          return 2000;
        case 'basic':
          return 500;
        case 'free':
        default:
          return 100;
      }
    }
    
    // For unauthenticated requests, use free tier limits
    return 100;
  },
  keyGenerator: (req: Request) => {
    const authReq = req as AuthRequest;
    // Use user ID if authenticated, otherwise use IP (properly normalized for IPv6)
    return authReq.user?.id?.toString() || getKeyFromIP(req);
  },
  skip: () => isDevelopment, // Completely skip in development
  handler: (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const tier = authReq.user?.subscriptionTier || 'free';
    
    res.status(429).json({
      error: "Rate limit exceeded",
      message: `You have exceeded the rate limit for your ${tier} tier subscription.`,
      tier: tier,
      retryAfter: (req as any).rateLimit?.resetTime,
      upgradeMessage: tier === 'free' 
        ? "Upgrade to Basic tier for 5x more requests per hour!"
        : tier === 'basic'
        ? "Upgrade to Plus tier for 4x more requests per hour!"
        : tier === 'plus'
        ? "Upgrade to Pro tier for 5x more requests per hour!"
        : "Contact support for enterprise pricing.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
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
  tiered: tieredRateLimiter,
};
