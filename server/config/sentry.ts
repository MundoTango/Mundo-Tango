import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { Express } from "express";

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initializeSentry(app: Express) {
  // Only initialize Sentry if DSN is provided
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    console.warn("SENTRY_DSN not configured. Sentry will not be initialized.");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Set profilesSampleRate to capture profiling data
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Integrations
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      // Enable profiling
      new ProfilingIntegration(),
    ],
    
    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      "Non-Error promise rejection captured",
      "ResizeObserver loop limit exceeded",
      // Network errors
      "Network request failed",
      "Failed to fetch",
      // Common user errors
      "User cancelled",
      "Unauthorized",
    ],
    
    // Before sending errors, filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      
      // Remove sensitive query parameters
      if (event.request?.query_string) {
        event.request.query_string = event.request.query_string
          .replace(/token=[^&]*/g, "token=[REDACTED]")
          .replace(/password=[^&]*/g, "password=[REDACTED]")
          .replace(/secret=[^&]*/g, "secret=[REDACTED]");
      }
      
      return event;
    },
    
    // Performance monitoring configuration
    tracesSampler(samplingContext) {
      // Don't sample health check endpoints
      if (samplingContext.request?.url?.includes("/health")) {
        return 0;
      }
      
      // Sample other requests based on environment
      return process.env.NODE_ENV === "production" ? 0.1 : 1.0;
    },
  });
  
  console.log("✅ Sentry initialized successfully");
}

/**
 * Express middleware for Sentry request handling
 */
export function getSentryRequestHandler() {
  return Sentry.Handlers.requestHandler();
}

/**
 * Express middleware for Sentry tracing
 */
export function getSentryTracingHandler() {
  return Sentry.Handlers.tracingHandler();
}

/**
 * Express error handler for Sentry
 */
export function getSentryErrorHandler() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all errors with status code >= 500
      return error.status ? error.status >= 500 : true;
    },
  });
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: { id: number; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id.toString(),
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
}

/**
 * Start a new transaction for performance tracking
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  });
}

export default Sentry;
