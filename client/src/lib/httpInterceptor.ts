/**
 * HTTP FETCH INTERCEPTOR
 * Monitors ALL HTTP requests and captures errors
 * 
 * Features:
 * - Wraps native window.fetch
 * - Captures 404, 500, and other HTTP error responses
 * - Reports to ProactiveErrorDetector
 * - Preserves original fetch behavior
 * - Graceful degradation if detector not available
 */

import { getErrorDetector } from './proactiveErrorDetection';

// Store original fetch
let originalFetch: typeof window.fetch | null = null;

/**
 * Initialize HTTP fetch interceptor
 */
export function initHttpInterceptor() {
  // Already initialized
  if (originalFetch) {
    console.log('[HttpInterceptor] Already initialized');
    return;
  }

  // Store original fetch
  originalFetch = window.fetch;

  // Wrap window.fetch
  window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
    const [url, options] = args;
    const startTime = Date.now();

    try {
      // Call original fetch
      const response = await originalFetch!(...args);

      // Check for HTTP error responses (4xx, 5xx)
      if (!response.ok) {
        const duration = Date.now() - startTime;
        const urlString = typeof url === 'string' ? url : url.url;
        const method = options?.method || 'GET';

        // Get error detector
        const detector = getErrorDetector();

        // Report HTTP error
        detector.reportError({
          type: 'http.error',
          message: `HTTP ${response.status} ${response.statusText}: ${method} ${urlString}`,
          timestamp: Date.now(),
          url: urlString,
          context: {
            status: response.status,
            statusText: response.statusText,
            method,
            duration,
            headers: Object.fromEntries(response.headers.entries()),
          },
        });

        console.log(
          `[HttpInterceptor] Captured http.error: ${method} ${urlString} - ${response.status} ${response.statusText}`
        );
      }

      // Return response as-is
      return response;
    } catch (error) {
      // Network error or other fetch failure
      const duration = Date.now() - startTime;
      const urlString = typeof url === 'string' ? url : url.url;
      const method = options?.method || 'GET';

      // Get error detector
      const detector = getErrorDetector();

      // Report network error
      detector.reportError({
        type: 'http.error',
        message: `Network error: ${method} ${urlString} - ${error instanceof Error ? error.message : String(error)}`,
        timestamp: Date.now(),
        url: urlString,
        stack: error instanceof Error ? error.stack : undefined,
        context: {
          method,
          duration,
          networkError: true,
        },
      });

      console.log(
        `[HttpInterceptor] Captured network error: ${method} ${urlString} - ${error instanceof Error ? error.message : String(error)}`
      );

      // Re-throw to preserve original behavior
      throw error;
    }
  };

  console.log('[HttpInterceptor] ✅ Initialized - monitoring all HTTP requests');
}

/**
 * Cleanup HTTP interceptor and restore original fetch
 */
export function cleanupHttpInterceptor() {
  if (originalFetch) {
    window.fetch = originalFetch;
    originalFetch = null;
    console.log('[HttpInterceptor] Cleaned up');
  }
}
