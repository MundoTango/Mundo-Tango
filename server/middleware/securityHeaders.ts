import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Comprehensive Security Headers using Helmet
 * Environment-aware CSP: Strict in production with nonces, permissive in development
 * 
 * Source: Part 8: Lines 500-650 - Security Headers & CSP Implementation
 * Reference: https://securityheaders.com for A+ grade validation
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

// ============================================================================
// NONCE GENERATION FOR CSP
// ============================================================================

/**
 * Generate a cryptographically secure nonce for CSP
 * Nonces are unique per request to prevent XSS attacks
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Middleware to generate and attach CSP nonce to each request
 * Usage: app.use(cspNonce) before security headers
 */
export function cspNonce(req: Request, res: Response, next: NextFunction) {
  const nonce = generateNonce();
  res.locals.cspNonce = nonce;
  next();
}

// ============================================================================
// HELMET CONFIGURATION WITH ENVIRONMENT-AWARE CSP
// ============================================================================

/**
 * Security headers middleware with dynamic nonce injection
 * In production: Uses nonces for inline scripts (strict CSP)
 * In development: Allows unsafe-inline/eval for Vite HMR
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  const nonce = res.locals.cspNonce;
  
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        
        // Script sources - nonce-based in production, permissive in dev
        scriptSrc: isDevelopment
          ? [
              "'self'",
              "'unsafe-inline'",
              "'unsafe-eval'",
              "https://js.stripe.com",
              "https://cdn.jsdelivr.net",
              "https://unpkg.com"
            ]
          : [
              "'self'",
              `'nonce-${nonce}'`,
              "https://js.stripe.com",
              "https://cdn.jsdelivr.net",
              "https://unpkg.com"
            ],
        
        // Script element sources (for external scripts)
        scriptSrcElem: isDevelopment
          ? [
              "'self'",
              "'unsafe-inline'",
              "https://js.stripe.com",
              "https://cdn.jsdelivr.net",
              "https://unpkg.com"
            ]
          : [
              "'self'",
              `'nonce-${nonce}'`,
              "https://js.stripe.com",
              "https://cdn.jsdelivr.net",
              "https://unpkg.com"
            ],
        
        // Style sources - unsafe-inline needed for dynamic styles (Tailwind, emotion, etc.)
        // Note: Nonces for styles are harder due to CSS-in-JS libraries
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://unpkg.com"
        ],
        
        // Font sources
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        
        // Image sources - allow data URIs, CDNs, and HTTPS
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        
        // Media sources - allow blob URLs for video/audio
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
              "https://*.sentry.io",
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
              "https://*.sentry.io",
              "wss:"
            ],
        
        // Frame sources - allow Stripe for payment elements
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
        
        // Object sources - block all plugins (Flash, Java, etc.)
        objectSrc: ["'none'"],
        
        // Base URI - prevent base tag injection
        baseUri: ["'self'"],
        
        // Form actions - only allow same-origin form submissions
        formAction: ["'self'"],
        
        // Frame ancestors - prevent clickjacking (same as X-Frame-Options: DENY)
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
    
    // Prevent clickjacking (X-Frame-Options: DENY)
    frameguard: {
      action: 'deny',
    },
    
    // Referrer Policy - only send origin when crossing origins
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    
    // X-Content-Type-Options - prevent MIME sniffing
    noSniff: true,
    
    // X-DNS-Prefetch-Control - disable DNS prefetching for privacy
    dnsPrefetchControl: {
      allow: false,
    },
    
    // X-Download-Options - prevent file downloads in IE
    ieNoOpen: true,
    
    // Hide X-Powered-By header
    hidePoweredBy: true,
  })(req, res, next);
}

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
