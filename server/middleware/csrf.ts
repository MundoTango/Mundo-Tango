import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// CSRF token storage (in production, use Redis)
const csrfTokens = new Map<string, string>();

// Generate CSRF token
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Set CSRF token for session
export function setCsrfToken(req: Request, res: Response, next: NextFunction) {
  if (req.method === "GET") {
    const token = generateCsrfToken();
    const sessionId = (req as any).session?.id || req.ip;
    
    // Store token
    csrfTokens.set(sessionId, token);
    
    // Set token in cookie (httpOnly for security)
    res.cookie("XSRF-TOKEN", token, {
      httpOnly: false, // Allow JavaScript to read for sending in headers
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    
    // Also attach to response locals for templates
    res.locals.csrfToken = token;
  }
  
  next();
}

// Verify CSRF token middleware
export function verifyCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF check for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF for API endpoints using JWT (they have their own security)
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return next();
  }
  
  const sessionId = (req as any).session?.id || req.ip;
  const storedToken = csrfTokens.get(sessionId);
  
  // Get token from header or body
  const submittedToken = 
    req.headers["x-csrf-token"] || 
    req.headers["x-xsrf-token"] || 
    req.body?._csrf ||
    req.body?.csrfToken;
  
  if (!storedToken) {
    return res.status(403).json({
      error: "CSRF token missing",
      message: "CSRF token not found. Please refresh the page and try again.",
    });
  }
  
  if (!submittedToken) {
    return res.status(403).json({
      error: "CSRF token required",
      message: "CSRF token is required for this request.",
    });
  }
  
  // Constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(storedToken), Buffer.from(submittedToken))) {
    return res.status(403).json({
      error: "Invalid CSRF token",
      message: "CSRF token validation failed. Please refresh the page and try again.",
    });
  }
  
  next();
}

// Double-submit cookie pattern (alternative to storing tokens)
export function verifyDoubleSubmitCookie(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  
  const cookieToken = req.cookies["XSRF-TOKEN"];
  const headerToken = req.headers["x-xsrf-token"] || req.body?._csrf;
  
  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      error: "CSRF protection failed",
      message: "Missing CSRF token",
    });
  }
  
  if (cookieToken !== headerToken) {
    return res.status(403).json({
      error: "CSRF protection failed",
      message: "Invalid CSRF token",
    });
  }
  
  next();
}

// Clean up expired tokens (call periodically)
export function cleanupCsrfTokens() {
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();
  
  const entries = Array.from(csrfTokens.entries());
  for (const [sessionId, _] of entries) {
    // In production, check token creation time from Redis
    // For now, just limit total tokens
    if (csrfTokens.size > 10000) {
      csrfTokens.delete(sessionId);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupCsrfTokens, 60 * 60 * 1000);
