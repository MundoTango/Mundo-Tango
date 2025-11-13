import { Request, Response, NextFunction } from "express";

/**
 * Security Headers Middleware
 * Implements comprehensive security headers for production deployment
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy (CSP)
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const cspDirectives = [
    "default-src 'self'",
    // Allow unsafe-inline/eval only in development, remove in production for security
    isDevelopment 
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com"
      : "script-src 'self' https://cdn.jsdelivr.net https://unpkg.com",
    isDevelopment
      ? "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
      : "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' blob: https: http:",
    "connect-src 'self' https://api.stripe.com https://api.groq.com https://api.openai.com wss:",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].filter(Boolean).join("; ");
  
  res.setHeader("Content-Security-Policy", cspDirectives);
  
  // Prevent clickjacking attacks
  res.setHeader("X-Frame-Options", "DENY");
  
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  
  // Enable XSS protection (legacy but still useful)
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Permissions Policy (formerly Feature Policy)
  const permissionsPolicy = [
    "camera=('self')",
    "microphone=('self')",
    "geolocation=('self')",
    "payment=('self')",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
  ].join(", ");
  
  res.setHeader("Permissions-Policy", permissionsPolicy);
  
  // Strict Transport Security (HSTS) - only in production with HTTPS
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  
  // Expect-CT (Certificate Transparency)
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Expect-CT", "max-age=86400, enforce");
  }
  
  // Remove powered-by header to hide tech stack
  res.removeHeader("X-Powered-By");
  
  next();
}

/**
 * CORS configuration for API endpoints
 */
export function corsHeaders(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5000",
    "https://mundotango.life",
    "https://www.mundotango.life",
  ];
  
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

/**
 * Sanitize response headers to remove sensitive information
 */
export function sanitizeHeaders(req: Request, res: Response, next: NextFunction) {
  // Remove headers that might leak information
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");
  
  next();
}

/**
 * Combined security middleware
 */
export function applySecurity(req: Request, res: Response, next: NextFunction) {
  securityHeaders(req, res, () => {
    sanitizeHeaders(req, res, () => {
      corsHeaders(req, res, next);
    });
  });
}
