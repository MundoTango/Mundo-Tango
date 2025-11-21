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
  
  // Skip CSRF for public Mr. Blue endpoints (no auth required)
  const publicMrBlueEndpoints = [
    "/api/mrblue/chat",
    "/api/mrblue/stream",
    "/api/mrblue/vibecode/stream",
    "/api/mr-blue/agents",
    "/api/mrblue/analyze-error"
  ];
  if (publicMrBlueEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for The Plan endpoints (Scott's first-time login tour)
  const thePlanEndpoints = [
    "/api/the-plan/"
  ];
  if (thePlanEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for A2A protocol endpoints (machine-to-machine communication)
  const a2aEndpoints = [
    "/api/a2a/"
  ];
  if (a2aEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for external API endpoints (Replit AI bridge)
  const externalApiEndpoints = [
    "/api/replit-ai/"
  ];
  if (externalApiEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for auth endpoints in development/testing (Playwright E2E tests)
  // Production uses additional security: rate limiting, bot detection, CAPTCHA
  if (process.env.NODE_ENV === 'development') {
    const authEndpoints = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh"];
    if (authEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
      return next();
    }
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
  
  // Skip CSRF check for API endpoints using JWT (they have their own security)
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return next();
  }
  
  // Skip CSRF for public Mr. Blue endpoints (no auth required)
  const publicMrBlueEndpoints = [
    "/api/mrblue/chat",
    "/api/mrblue/stream",
    "/api/mrblue/vibecode/stream",
    "/api/mr-blue/agents"
  ];
  if (publicMrBlueEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for The Plan endpoints (Scott's first-time login tour)
  const thePlanEndpoints = [
    "/api/the-plan/"
  ];
  if (thePlanEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for A2A protocol endpoints (machine-to-machine communication)
  const a2aEndpoints = [
    "/api/a2a/"
  ];
  if (a2aEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for external API endpoints (Replit AI bridge)
  const externalApiEndpoints = [
    "/api/replit-ai/"
  ];
  if (externalApiEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for auth endpoints in development/testing (Playwright E2E tests)
  // Production uses additional security: rate limiting, bot detection, CAPTCHA
  const isDev = process.env.NODE_ENV === 'development';
  const authEndpoints = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh"];
  const journeyEndpoints = ["/api/journey"]; // Internal API for recording development progress
  const isAuthEndpoint = authEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint));
  const isJourneyEndpoint = journeyEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint));
  const shouldBypass = isAuthEndpoint || isJourneyEndpoint;
  
  console.log(`[CSRF DEBUG] isDev=${isDev}, url=${req.originalUrl}, isAuthEndpoint=${isAuthEndpoint}, isJourneyEndpoint=${isJourneyEndpoint}, shouldBypass=${shouldBypass}`);
  
  if (isDev && shouldBypass) {
    console.log(`[CSRF BYPASS] Skipping CSRF for ${req.originalUrl} in development`);
    return next();
  }
  
  const cookieToken = req.cookies["XSRF-TOKEN"];
  const headerToken = req.headers["x-xsrf-token"] || req.body?._csrf;
  
  if (!cookieToken || !headerToken) {
    console.log(`[CSRF FAIL] Missing token for ${req.originalUrl} - cookie:${!!cookieToken}, header:${!!headerToken}`);
    return res.status(403).json({
      error: "CSRF protection failed",
      message: "Missing CSRF token",
    });
  }
  
  if (cookieToken !== headerToken) {
    console.log(`[CSRF FAIL] Token mismatch for ${req.originalUrl}`);
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
