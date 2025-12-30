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
    const existingToken = req.cookies?.["XSRF-TOKEN"];
    const sessionId = (req as any).session?.id || req.ip;
    
    if (existingToken) {
      // Re-register existing token in memory map (survives server restarts)
      // This ensures the double-submit pattern works after restarts
      csrfTokens.set(sessionId, existingToken);
      res.locals.csrfToken = existingToken;
    } else {
      // Generate new token only for fresh sessions
      const token = generateCsrfToken();
      
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
  
  // Skip CSRF for n8n messaging webhooks (external automation platform)
  if (req.originalUrl.startsWith("/api/messaging/webhook/")) {
    return next();
  }
  
  // Skip CSRF for PRO contact form (public form for anonymous visitors to contact PRO users)
  // Protected by Zod validation and rate limiting in production
  if (req.originalUrl === "/api/pro/contact") {
    return next();
  }
  
  // Skip CSRF for public Mr. Blue endpoints (no auth required)
  const publicMrBlueEndpoints = [
    "/api/mrblue/chat",
    "/api/mrblue/stream",
    "/api/mrblue/vibecode/stream",
    "/api/mr-blue/agents",
    "/api/mrblue/analyze-error",
    "/api/mrblue/conversations",  // ✅ AGENT #13: Beta testing - guest users
    "/api/mrblue/messages",  // ✅ AGENT #13: Beta testing - guest users
    "/api/mrblue/activate-agents",  // ✅ MB.MD v9.2: Contextual agent activation
    "/api/mrblue/save-backend",  // ✅ MB.MD v9.3: Backend agent system (Save button)
    "/api/cto/walkthrough/self-heal",  // ✅ MB.MD Pattern 53: Self-Healing System
    "/api/cto/walkthrough/apply-fix"   // ✅ MB.MD Pattern 53: Auto-fix endpoint
  ];
  if (publicMrBlueEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for public auth endpoints (unauthenticated user registration/waitlist)
  // These have their own rate limiting and validation in production
  const publicAuthEndpoints = [
    "/api/auth/register",
    "/api/auth/login", 
    "/api/auth/waitlist",
    "/api/auth/refresh",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/verify-email",
    "/api/auth/resend-verification",
    "/api/auth/internal/maintenance"  // Protected by maintenance token
  ];
  if (publicAuthEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for location search endpoints (read-only search, no state changes)
  const searchEndpoints = [
    "/api/locations/search",  // Address/city search via Nominatim
    "/api/cities/search",     // City group search
    "/api/venues/search"      // Venue search
  ];
  if (searchEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for file upload endpoints (use JWT auth, multipart is CSRF-resistant)
  const uploadEndpoints = [
    "/api/upload/video",  // Video compression uploads
    "/api/upload/image",  // Image uploads
    "/api/media/upload",  // Object Storage media uploads (MB.MD Pattern 28)
    "/api/posts"  // Post creation with media
  ];
  if (uploadEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for event photo uploads specifically (JWT auth + multipart CSRF-resistant)
  // Pattern: /api/events/:id/photos where :id is numeric
  if (/^\/api\/events\/\d+\/photos/.test(req.originalUrl)) {
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
  
  // Skip CSRF for Agent Learning endpoints (MB.MD v9.9.3 + Samsung TRM - A2A communication)
  const agentLearningEndpoints = [
    "/api/agents/learning/"
  ];
  if (agentLearningEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for Orchestration Phase endpoints (MB.MD v9.9.3 - A2A communication)
  const orchestrationPhasesEndpoints = [
    "/api/orchestration/phases/"
  ];
  if (orchestrationPhasesEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
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
    const authEndpoints = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/waitlist"];
    if (authEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
      return next();
    }
    // Skip CSRF for travel scraping endpoints in development (for testing)
    const travelScrapingEndpoints = ["/api/travel/scrape-accommodation", "/api/travel/scrape-transport"];
    if (travelScrapingEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
      return next();
    }
    // Skip CSRF for location history endpoints (JWT protected)
    const locationEndpoints = ["/api/location-history"];
    if (locationEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
      return next();
    }
    // Skip CSRF for event series endpoints in development (TRACK A)
    const eventSeriesEndpoints = ["/api/event-series"];
    if (eventSeriesEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
      return next();
    }
    // Skip CSRF for talent match profile enrichment endpoints (MB.MD Subagent #4)
    const talentMatchEndpoints = ["/api/v1/enrich-github", "/api/v1/enrich-profile", "/api/v1/validate-linkedin", "/api/v1/validate-urls", "/api/v1/volunteers", "/api/v1/clarifier", "/api/talent-match"];
    if (talentMatchEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
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
  
  // Skip CSRF for n8n messaging webhooks (external automation platform)
  if (req.originalUrl.startsWith("/api/messaging/webhook/")) {
    return next();
  }
  
  // Skip CSRF for PRO contact form (public form for anonymous visitors to contact PRO users)
  // Protected by Zod validation and rate limiting in production
  if (req.originalUrl === "/api/pro/contact") {
    return next();
  }
  
  // Skip CSRF for public Mr. Blue endpoints (no auth required)
  const publicMrBlueEndpoints = [
    "/api/mrblue/chat",
    "/api/mrblue/stream",
    "/api/mrblue/vibecode/stream",
    "/api/mr-blue/agents",
    "/api/mrblue/analyze-error",  // ✅ AGENT #13: Error analysis
    "/api/mrblue/conversations",  // ✅ AGENT #13: Beta testing - guest users
    "/api/mrblue/messages",  // ✅ AGENT #13: Beta testing - guest users
    "/api/mrblue/activate-agents",  // ✅ MB.MD v9.2: Contextual agent activation
    "/api/mrblue/save-backend",  // ✅ MB.MD v9.3: Backend agent system (Save button)
    "/api/cto/walkthrough/self-heal",  // ✅ MB.MD Pattern 53: Self-Healing System
    "/api/cto/walkthrough/apply-fix"   // ✅ MB.MD Pattern 53: Auto-fix endpoint
  ];
  if (publicMrBlueEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for public auth endpoints (unauthenticated user registration/waitlist)
  // These have their own rate limiting and validation in production
  const publicAuthEndpoints = [
    "/api/auth/register",
    "/api/auth/login", 
    "/api/auth/waitlist",
    "/api/auth/refresh",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/verify-email",
    "/api/auth/resend-verification",
    "/api/auth/internal/maintenance"  // Protected by maintenance token
  ];
  if (publicAuthEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for location search endpoints (read-only search via Nominatim, no state changes)
  const searchEndpoints = [
    "/api/locations/search",  // Address/city search via Nominatim
    "/api/cities/search",     // City group search
    "/api/venues/search"      // Venue search
  ];
  if (searchEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for file upload endpoints (use JWT auth, multipart is CSRF-resistant)
  const uploadEndpoints = [
    "/api/upload/video",  // Video compression uploads
    "/api/upload/image",  // Image uploads
    "/api/media/upload",  // Object Storage media uploads (MB.MD Pattern 28)
    "/api/posts"  // Post creation with media
  ];
  if (uploadEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for event photo uploads specifically (JWT auth + multipart CSRF-resistant)
  // Pattern: /api/events/:id/photos where :id is numeric
  if (/^\/api\/events\/\d+\/photos/.test(req.originalUrl)) {
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
  
  // Skip CSRF for Agent Learning endpoints (MB.MD v9.9.3 + Samsung TRM - A2A communication)
  const agentLearningEndpoints = [
    "/api/agents/learning/"
  ];
  if (agentLearningEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for external API endpoints (Replit AI bridge)
  const externalApiEndpoints = [
    "/api/replit-ai/"
  ];
  if (externalApiEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    return next();
  }
  
  // Skip CSRF for Orchestration Phase endpoints (MB.MD v9.9.3 - A2A communication)
  if (req.originalUrl.startsWith("/api/orchestration/phases/")) {
    return next();
  }
  
  // Skip CSRF for Talent Match endpoints (guest flow with rate limiting + session cookies)
  // These endpoints have their own security: rate limiting, session tracking, size limits
  const talentMatchPublicEndpoints = [
    "/api/talent-match/parse-resume",   // Resume parsing for guest users
    "/api/talent-match/session",        // Guest session management
    "/api/talent-match/submit"          // Guest application submission
  ];
  if (talentMatchPublicEndpoints.some(endpoint => req.originalUrl === endpoint)) {
    return next();
  }
  
  // Skip CSRF for auth endpoints in development/testing (Playwright E2E tests)
  // Production uses additional security: rate limiting, bot detection, CAPTCHA
  const isDev = process.env.NODE_ENV === 'development';
  const authEndpoints = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/waitlist"];
  const journeyEndpoints = ["/api/journey"]; // Internal API for recording development progress
  const travelScrapingEndpoints = ["/api/travel/scrape-accommodation", "/api/travel/scrape-transport"];
  const eventSeriesEndpoints = ["/api/event-series"]; // Event series management (TRACK A)
  const talentMatchEndpoints = ["/api/v1/volunteers", "/api/v1/clarifier", "/api/talent-match", "/api/v1/enrich-github", "/api/v1/enrich-profile", "/api/v1/validate-linkedin", "/api/v1/validate-urls"]; // Talent Match system (JWT protected)
  const friendsEndpoints = ["/api/friends"]; // Friends system (JWT protected)
  const isAuthEndpoint = authEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint));
  const isJourneyEndpoint = journeyEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint));
  const isTravelScrapingEndpoint = travelScrapingEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint));
  const isEventSeriesEndpoint = eventSeriesEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint));
  const isTalentMatchEndpoint = talentMatchEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint));
  const isFriendsEndpoint = friendsEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint));
  const shouldBypass = isAuthEndpoint || isJourneyEndpoint || isTravelScrapingEndpoint || isEventSeriesEndpoint || isTalentMatchEndpoint || isFriendsEndpoint;
  
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
