import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { startPreviewExpirationChecker } from "./lib/preview-expiration";
import { applySecurity, apiRateLimiter } from "./middleware/security";
import { compressionMiddleware, performanceMonitoringMiddleware } from "./config/performance";
import { healthCheckHandler, readinessCheckHandler, livenessCheckHandler } from "./health-check";
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
import { securityHeaders } from "./middleware/securityHeaders";
import { setCsrfToken, verifyCsrfToken } from "./middleware/csrf";

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

// Apply enhanced security headers
app.use(securityHeaders);

// Apply legacy security middleware (CSP, CORS, headers, etc.)
app.use(applySecurity());

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
  
  // CSRF Protection - verify token for mutating requests
  app.use('/api', verifyCsrfToken);
  
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
  });
})();
