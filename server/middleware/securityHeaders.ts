import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

/**
 * Comprehensive Security Headers using Helmet
 * Environment-aware CSP: Strict in production, permissive in development
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

// ============================================================================
// HELMET CONFIGURATION WITH ENVIRONMENT-AWARE CSP
// ============================================================================

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      
      // Script sources - allow unsafe-inline/eval only in development
      scriptSrc: isDevelopment
        ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://cdn.jsdelivr.net", "https://unpkg.com"]
        : ["'self'", "https://js.stripe.com", "https://cdn.jsdelivr.net", "https://unpkg.com"],
      
      // Script element sources (for external scripts)
      scriptSrcElem: isDevelopment
        ? ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://cdn.jsdelivr.net", "https://unpkg.com"]
        : ["'self'", "https://js.stripe.com", "https://cdn.jsdelivr.net", "https://unpkg.com"],
      
      // Style sources - allow unsafe-inline in dev for Vite HMR
      styleSrc: isDevelopment
        ? ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"]
        : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
      
      // Font sources
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      
      // Image sources - allow Cloudinary and other CDNs
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      
      // Media sources
      mediaSrc: ["'self'", "blob:", "https:", "http:"],
      
      // Connection sources - APIs, WebSocket, Vite HMR
      connectSrc: isDevelopment
        ? [
            "'self'",
            "https://api.stripe.com",
            "https://api.groq.com",
            "https://api.openai.com",
            "https://api.anthropic.com",
            "https://generativelanguage.googleapis.com",
            "https://*.supabase.co",
            "wss:",
            "ws:",
            "ws://localhost:*",
            "http://localhost:*"
          ]
        : [
            "'self'",
            "https://api.stripe.com",
            "https://api.groq.com",
            "https://api.openai.com",
            "https://api.anthropic.com",
            "https://generativelanguage.googleapis.com",
            "https://*.supabase.co",
            "wss:"
          ],
      
      // Frame sources - allow Stripe
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      
      // Object sources - none
      objectSrc: ["'none'"],
      
      // Base URI
      baseUri: ["'self'"],
      
      // Form actions
      formAction: ["'self'"],
      
      // Frame ancestors - prevent clickjacking
      frameAncestors: ["'none'"],
      
      // Upgrade insecure requests in production only
      ...(isDevelopment ? {} : { upgradeInsecureRequests: [] }),
    },
  },
  
  // Strict Transport Security (HSTS) - 1 year, include subdomains, preload
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  
  // Prevent clickjacking
  frameguard: {
    action: 'deny',
  },
  
  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // X-DNS-Prefetch-Control
  dnsPrefetchControl: {
    allow: false,
  },
  
  // X-Download-Options
  ieNoOpen: true,
  
  // Hide X-Powered-By
  hidePoweredBy: true,
});

// ============================================================================
// ADDITIONAL SECURITY HEADERS
// ============================================================================

export function additionalSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // X-XSS-Protection (legacy but still useful for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Permissions Policy (formerly Feature Policy)
  // Allow microphone/camera for self (Mr. Blue voice features)
  const permissionsPolicy = [
    "camera=(self)",
    "microphone=(self)",
    "geolocation=(self)",
    "payment=(self)",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
  ].join(", ");
  
  res.setHeader('Permissions-Policy', permissionsPolicy);
  
  // Expect-CT (Certificate Transparency) - production only
  if (!isDevelopment) {
    res.setHeader('Expect-CT', 'max-age=86400, enforce');
  }
  
  next();
}

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

export function corsHeaders(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5000",
    "https://mundotango.life",
    "https://www.mundotango.life",
    process.env.REPLIT_DEPLOYMENT_URL,
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-CSRF-Token, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  
  next();
}

// ============================================================================
// SANITIZE HEADERS
// ============================================================================

export function sanitizeHeaders(req: Request, res: Response, next: NextFunction) {
  // Remove headers that might leak information
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");
  
  next();
}

// ============================================================================
// COMBINED SECURITY MIDDLEWARE (for backward compatibility)
// ============================================================================

export function applySecurity(req: Request, res: Response, next: NextFunction) {
  // Note: securityHeaders (Helmet) should be applied separately in server/index.ts
  // This function maintains backward compatibility
  additionalSecurityHeaders(req, res, () => {
    sanitizeHeaders(req, res, () => {
      corsHeaders(req, res, next);
    });
  });
}
