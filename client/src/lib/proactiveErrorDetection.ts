/**
 * PROACTIVE ERROR DETECTION SYSTEM
 * Catches ALL errors BEFORE users see them
 * 
 * Features:
 * - Console interceptor (error/warn)
 * - Global error handlers (window.onerror, unhandledrejection)
 * - MutationObserver for suspicious DOM changes
 * - Rate limiting (10 errors/minute)
 * - Batch reporting (every 10 seconds)
 * - Graceful degradation if API unavailable
 */

interface ErrorReport {
  type: 'console.error' | 'console.warn' | 'window.onerror' | 'unhandledrejection' | 'dom.mutation';
  message: string;
  stack?: string;
  timestamp: number;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
  context?: any;
}

export class ProactiveErrorDetector {
  private errorQueue: ErrorReport[] = [];
  private errorCount = 0;
  private errorTimestamps: number[] = [];
  private batchInterval: NodeJS.Timeout | null = null;
  private mutationObserver: MutationObserver | null = null;
  
  // Configuration
  private readonly MAX_ERRORS_PER_MINUTE = 10;
  private readonly BATCH_INTERVAL_MS = 10000; // 10 seconds
  private readonly RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
  private readonly API_ENDPOINT = '/api/mrblue/analyze-error';
  
  // Original console methods (to prevent infinite loops)
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  
  // Track if we're currently sending to prevent loops
  private isSending = false;

  constructor() {
    // Store original console methods
    this.originalConsoleError = console.error.bind(console);
    this.originalConsoleWarn = console.warn.bind(console);
    
    console.log('[ProactiveErrorDetector] Initializing...');
  }

  /**
   * Start error detection
   */
  start() {
    this.interceptConsole();
    this.setupGlobalErrorHandlers();
    this.setupMutationObserver();
    this.startBatchReporting();
    
    console.log('[ProactiveErrorDetector] ✅ Started - monitoring all errors');
  }

  /**
   * Stop error detection and cleanup
   */
  stop() {
    this.restoreConsole();
    this.removeGlobalErrorHandlers();
    this.stopMutationObserver();
    this.stopBatchReporting();
    
    console.log('[ProactiveErrorDetector] Stopped');
  }

  /**
   * Intercept console.error and console.warn
   */
  private interceptConsole() {
    console.error = (...args: any[]) => {
      // Call original first
      this.originalConsoleError(...args);
      
      // Capture error
      this.captureError({
        type: 'console.error',
        message: args.map(arg => String(arg)).join(' '),
        timestamp: Date.now(),
        stack: new Error().stack,
      });
    };

    console.warn = (...args: any[]) => {
      // Call original first
      this.originalConsoleWarn(...args);
      
      // Capture warning
      this.captureError({
        type: 'console.warn',
        message: args.map(arg => String(arg)).join(' '),
        timestamp: Date.now(),
        stack: new Error().stack,
      });
    };
  }

  /**
   * Restore original console methods
   */
  private restoreConsole() {
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers() {
    // window.onerror - catches unhandled JavaScript errors
    window.addEventListener('error', this.handleWindowError);
    
    // unhandledrejection - catches unhandled Promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  /**
   * Remove global error handlers
   */
  private removeGlobalErrorHandlers() {
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  /**
   * Handle window.onerror events
   */
  private handleWindowError = (event: ErrorEvent) => {
    this.captureError({
      type: 'window.onerror',
      message: event.message,
      stack: event.error?.stack,
      timestamp: Date.now(),
      url: event.filename,
      lineNumber: event.lineno,
      columnNumber: event.colno,
    });
  };

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.captureError({
      type: 'unhandledrejection',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
      timestamp: Date.now(),
    });
  };

  /**
   * Setup MutationObserver to detect suspicious DOM changes
   */
  private setupMutationObserver() {
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Detect suspicious patterns
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            // Check if critical elements are being removed
            if (node instanceof HTMLElement) {
              const isCritical = 
                node.id === 'root' || 
                node.getAttribute('data-critical') === 'true' ||
                node.classList.contains('app-container');
              
              if (isCritical) {
                this.captureError({
                  type: 'dom.mutation',
                  message: `Critical DOM element removed: ${node.tagName}#${node.id}`,
                  timestamp: Date.now(),
                  context: {
                    nodeType: node.tagName,
                    nodeId: node.id,
                    className: node.className,
                  },
                });
              }
            }
          });
        }
      }
    });

    // Observe document body for changes
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Stop MutationObserver
   */
  private stopMutationObserver() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }

  /**
   * Capture an error with rate limiting
   */
  private captureError(error: ErrorReport) {
    // Check rate limit
    if (!this.checkRateLimit()) {
      // Use original console to avoid infinite loop
      this.originalConsoleWarn(
        `[ProactiveErrorDetector] Rate limit exceeded (${this.MAX_ERRORS_PER_MINUTE}/min). Error not captured.`
      );
      return;
    }

    // Add to queue
    this.errorQueue.push(error);
    this.errorCount++;
    this.errorTimestamps.push(Date.now());

    // Clean up old timestamps
    this.cleanupTimestamps();

    // Log using original console to avoid loop
    this.originalConsoleError(
      `[ProactiveErrorDetector] Captured ${error.type}: ${error.message.substring(0, 100)}...`
    );
  }

  /**
   * Check if we're within rate limit
   */
  private checkRateLimit(): boolean {
    this.cleanupTimestamps();
    return this.errorTimestamps.length < this.MAX_ERRORS_PER_MINUTE;
  }

  /**
   * Clean up old timestamps outside the rate limit window
   */
  private cleanupTimestamps() {
    const now = Date.now();
    this.errorTimestamps = this.errorTimestamps.filter(
      timestamp => now - timestamp < this.RATE_LIMIT_WINDOW_MS
    );
  }

  /**
   * Start batch reporting interval
   */
  private startBatchReporting() {
    this.batchInterval = setInterval(() => {
      this.sendBatch();
    }, this.BATCH_INTERVAL_MS);
  }

  /**
   * Stop batch reporting interval
   */
  private stopBatchReporting() {
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
      this.batchInterval = null;
    }
  }

  /**
   * Send batch of errors to API
   */
  private async sendBatch() {
    // Nothing to send
    if (this.errorQueue.length === 0) {
      return;
    }

    // Already sending (prevent concurrent sends)
    if (this.isSending) {
      return;
    }

    // Get batch and clear queue
    const batch = [...this.errorQueue];
    this.errorQueue = [];
    this.isSending = true;

    try {
      this.originalConsoleError(
        `[ProactiveErrorDetector] Sending batch of ${batch.length} errors to Mr. Blue API...`
      );

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors: batch,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });

      if (!response.ok) {
        // API endpoint doesn't exist yet or error - graceful degradation
        if (response.status === 404) {
          this.originalConsoleWarn(
            `[ProactiveErrorDetector] API endpoint not ready yet (404). This is expected during Phase 2.`
          );
        } else {
          throw new Error(`API returned ${response.status}`);
        }
      } else {
        const data = await response.json();
        this.originalConsoleError(
          `[ProactiveErrorDetector] ✅ Batch sent successfully. Response:`, 
          data
        );
      }
    } catch (error) {
      // Network failure - gracefully degrade
      this.originalConsoleWarn(
        `[ProactiveErrorDetector] Failed to send batch (network error). This is OK - errors still captured locally.`,
        error
      );
      
      // Put errors back in queue for retry (but limit queue size)
      if (this.errorQueue.length < 50) {
        this.errorQueue.unshift(...batch);
      }
    } finally {
      this.isSending = false;
    }
  }

  /**
   * Manually trigger sending current batch (for testing)
   */
  public flushBatch() {
    this.sendBatch();
  }

  /**
   * Get current stats
   */
  public getStats() {
    return {
      totalErrors: this.errorCount,
      queuedErrors: this.errorQueue.length,
      recentErrors: this.errorTimestamps.length,
      rateLimitRemaining: Math.max(0, this.MAX_ERRORS_PER_MINUTE - this.errorTimestamps.length),
    };
  }
}

// Singleton instance
let detectorInstance: ProactiveErrorDetector | null = null;

/**
 * Get or create singleton instance
 */
export function getErrorDetector(): ProactiveErrorDetector {
  if (!detectorInstance) {
    detectorInstance = new ProactiveErrorDetector();
  }
  return detectorInstance;
}

/**
 * Initialize error detection
 */
export function initErrorDetection() {
  const detector = getErrorDetector();
  detector.start();
  return detector;
}

/**
 * Cleanup error detection
 */
export function cleanupErrorDetection() {
  if (detectorInstance) {
    detectorInstance.stop();
    detectorInstance = null;
  }
}
