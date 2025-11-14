console.log("🔍 [DEBUG] Starting server/index.ts imports...");
import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
console.log("🔍 [DEBUG] About to import ./routes...");
import { registerRoutes } from "./routes";
console.log("✅ [DEBUG] ./routes imported");
import { setupVite, serveStatic, log } from "./vite";
import { startPreviewExpirationChecker } from "./lib/preview-expiration";
import { initStoryExpirationJob } from "./jobs/expireStories";
import { apiRateLimiter } from "./middleware/security";
import { compressionMiddleware, performanceMonitoringMiddleware } from "./config/performance";
import { healthCheckHandler, readinessCheckHandler, livenessCheckHandler } from "./health-check";
console.log("✅ [DEBUG] All imports complete in server/index.ts");
import { 
  initializeSentry, 
  getSentryRequestHandler, 
  getSentryTracingHandler,
  getSentryErrorHandler 
} from "./config/sentry";
import logger, { stream } from "./middleware/logger";
import { 
  globalRateLimiter, 
  authRateLimiter,
  uploadRateLimiter,
  adminRateLimiter,
  searchRateLimiter 
} from "./middleware/rateLimiter";
import { cspNonce, securityHeaders, additionalSecurityHeaders, applySecurity as applySecurityFromHeaders } from "./middleware/securityHeaders";
import { setCsrfToken, verifyDoubleSubmitCookie } from "./middleware/csrf";

console.log("✅ [DEBUG] All server/index.ts imports completed!");

const app = express();

// ============================================================================
// SENTRY INITIALIZATION
// ============================================================================
initializeSentry(app);

// ============================================================================
// TRUST PROXY CONFIGURATION
// ============================================================================
// Required for rate limiting behind reverse proxies (Replit, Vercel, etc.)
app.set('trust proxy', 1);

// ============================================================================
// SECURITY & PERFORMANCE MIDDLEWARE
// ============================================================================

// Sentry request handler (must be first)
app.use(getSentryRequestHandler());

// Sentry tracing handler
app.use(getSentryTracingHandler());

// Winston + Morgan HTTP request logging
app.use(morgan('combined', { stream }));

// Generate CSP nonce for each request (must be before securityHeaders)
app.use(cspNonce);

// Apply Helmet security headers with environment-aware CSP and nonces
app.use(securityHeaders);

// Apply additional security headers (X-XSS-Protection, Permissions-Policy, etc.)
app.use(additionalSecurityHeaders);

// Apply CORS and sanitization headers
app.use(applySecurityFromHeaders);

// Global rate limiting
app.use(globalRateLimiter);

// Enable compression
app.use(compressionMiddleware);

// Performance monitoring
app.use(performanceMonitoringMiddleware);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CSRF Protection - set token for GET requests
app.use(setCsrfToken);

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================

// Legacy health checks (keep for backward compatibility)
app.get('/health', healthCheckHandler);
app.get('/ready', readinessCheckHandler);
app.get('/live', livenessCheckHandler);

// Enhanced health checks will be registered via routes below

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Apply rate limiting to specific route patterns
  app.use('/api/auth', authRateLimiter);
  app.use('/api/admin', adminRateLimiter);
  app.use('/api/upload', uploadRateLimiter);
  app.use('/api/search', searchRateLimiter);
  app.use('/api', apiRateLimiter);
  
  // CSRF Protection - Double-submit cookie pattern (stateless, no Redis needed)
  app.use(setCsrfToken); // Set token cookie on all GET requests
  app.use('/api', verifyDoubleSubmitCookie); // Verify token on mutations
  
  const server = await registerRoutes(app);

  // Sentry error handler (must be before other error handlers)
  app.use(getSentryErrorHandler());

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log error with Winston
    logger.error(`Error ${status}: ${message}`, {
      error: err.message,
      stack: err.stack,
    });

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    startPreviewExpirationChecker();
    initStoryExpirationJob();
  });
})();
