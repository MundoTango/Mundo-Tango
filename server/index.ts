// VibeCoding AgenticExecutor Validated - Jan 11 2026
// ============================================================================
// BOOTSTRAP - MUST BE FIRST IMPORT
// Keeps event loop alive during ESM module loading
// ============================================================================
import { clearStartupKeepalive } from './bootstrap';

// ============================================================================
// OPENTELEMETRY INSTRUMENTATION - MUST BE SECOND IMPORT
// ============================================================================
import './instrumentation';

import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import { startPreviewExpirationChecker } from "./lib/preview-expiration";
import { initStoryExpirationJob } from "./jobs/expireStories";
import { initScrapingScheduler } from "./jobs/scraping-scheduler";
import { apiRateLimiter } from "./middleware/security";
import { compressionMiddleware, performanceMonitoringMiddleware } from "./config/performance";
import { healthCheckHandler, readinessCheckHandler, livenessCheckHandler } from "./health-check";
import { PolicyMonitoringJobs } from "./jobs/policy-monitoring-jobs";
import { recursiveContextService } from "./services/RecursiveContextService";
import { facelessContentService } from "./services/FacelessContentService";
import { initCityCoordinateFix } from "./services/cityCoordinateFix";
// ============================================================================
// SENTRY DISABLED: CSP VIOLATIONS FIX (MB.MD SUBAGENT 3)
// Sentry was injecting 'unsafe-dynamic' and 'report-uri' causing 4891 CSP errors
// Better to have no error tracking than broken CSP
// ============================================================================
// import { 
//   initializeSentry, 
//   getSentryRequestHandler, 
//   getSentryTracingHandler,
//   getSentryErrorHandler 
// } from "./config/sentry";
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

const app = express();

// ============================================================================
// AUTOSCALE MODE CONFIGURATION
// ============================================================================
// When AUTOSCALE_MODE=true, background workers/schedulers are disabled
// This allows the app to run on Autoscale deployments without long-running processes
// Auto-enable on Railway unless explicitly opted out (saves ~15-25MB RAM)
const AUTOSCALE_MODE = process.env.AUTOSCALE_MODE === 'true' 
  || (!!process.env.RAILWAY_ENVIRONMENT && process.env.AUTOSCALE_MODE !== 'false');
if (AUTOSCALE_MODE) {
  console.log("🚀 AUTOSCALE_MODE enabled - Background workers disabled for Autoscale deployment");
} else {
  console.log("📦 Reserved VM mode - All background workers enabled");
}

// ============================================================================
// SENTRY INITIALIZATION - DISABLED (CSP FIX)
// ============================================================================
// initializeSentry(app);
console.log("⚠️  Sentry disabled to fix CSP violations (MB.MD SUBAGENT 3)");

// ============================================================================
// TRUST PROXY CONFIGURATION
// ============================================================================
// Required for rate limiting behind reverse proxies (Replit, Vercel, etc.)
app.set('trust proxy', 1);

// ============================================================================
// SECURITY & PERFORMANCE MIDDLEWARE
// ============================================================================

// Sentry request handler (must be first) - DISABLED (CSP FIX)
// app.use(getSentryRequestHandler());

// Sentry tracing handler - DISABLED (CSP FIX)
// app.use(getSentryTracingHandler());

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
  limit: '200mb', // Support large base64 media uploads (videos can be 50MB file → ~67MB base64)
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '200mb' }));
app.use(cookieParser());

// Serve only stock_images subdirectory for housing/city images (security: don't expose voice_temp, logs, etc.)
app.use('/attached_assets/stock_images', express.static(path.join(process.cwd(), 'attached_assets', 'stock_images'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

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
  // Note: setCsrfToken is already applied globally above, only verify on mutations here
  app.use('/api', verifyDoubleSubmitCookie); // Verify token on mutations
  
  const server = await registerRoutes(app);

  // Sentry error handler (must be before other error handlers) - DISABLED (CSP FIX)
  // app.use(getSentryErrorHandler());

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log error with Winston
    logger.error(`Error ${status}: ${message}`, {
      error: err.message,
      stack: err.stack,
    });

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    // Dynamic import to prevent Vite/Rollup from loading in production
    // The entire vite.ts module with its Vite dependencies is only loaded here
    const { setupVite } = await import("./vite");
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
  }, async () => {
    // Server is listening - clear the startup keepalive
    clearStartupKeepalive();
    log(`serving on port ${port}`);
    
    // ========================================================================
    // DATA QUALITY FIXES - Run on every startup (safe and idempotent)
    // ========================================================================
    try {
      await initCityCoordinateFix();
    } catch (error) {
      console.error('❌ City coordinate fix failed:', error);
    }
    
    // ========================================================================
    // BACKGROUND WORKERS - DISABLED IN AUTOSCALE MODE
    // ========================================================================
    if (AUTOSCALE_MODE) {
      log('⏭️  Skipping background workers (AUTOSCALE_MODE=true)');
      log('   - Preview expiration checker: disabled');
      log('   - Story expiration job: disabled');
      log('   - Scraping scheduler: disabled');
      log('   - MB.MD Intelligence Services: disabled');
      log('   - BullMQ Workers: disabled');
      log('   - Policy Monitoring System: disabled');
    } else {
      // Start background schedulers (Reserved VM mode only)
      startPreviewExpirationChecker();
      initStoryExpirationJob();
      initScrapingScheduler();
      
      // MB.MD v9.9.3: Initialize Self-Healing and Content Services
      try {
        log('🧠 Initializing MB.MD Intelligence Services...');
        await recursiveContextService.initialize();
        await facelessContentService.initialize();
        log('✅ MB.MD Intelligence Services initialized');
      } catch (error) {
        logger.error('❌ MB.MD Intelligence initialization failed:', error);
      }
      
      // MB.MD v9.9.3: Initialize BullMQ Workers (with Redis fallback)
      try {
        log('🔧 Initializing BullMQ Workers...');
        const { initializeRedis } = await import('./workers/redis-fallback');
        await initializeRedis();
        
        await import('./workers/eventWorker');
        await import('./workers/housingWorker');
        await import('./workers/lifeCeoWorker');
        log('[BullMQ Workers] ✅ Initialized 3 core workers');
      } catch (error) {
        logger.error('❌ BullMQ Worker initialization failed:', error);
      }
      
      // PHASE 0A: Initialize Policy Monitoring System (requires Redis)
      if (process.env.REDIS_URL) {
        try {
          log('🔍 Initializing Policy Monitoring System...');
          await PolicyMonitoringJobs.initialize();
          log('✅ Policy Monitoring System initialized successfully');
        } catch (error) {
          logger.error('❌ Failed to initialize Policy Monitoring System:', error);
        }
      } else {
        log('ℹ️  Policy Monitoring System disabled (Redis not configured)');
        log('   Set REDIS_URL environment variable to enable monitoring workers');
      }
    }
  });
})();
