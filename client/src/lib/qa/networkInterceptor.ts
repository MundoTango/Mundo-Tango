/**
 * Network Interceptor - Captures full API request/response data
 * Provides detailed context for bug diagnosis
 * MB.MD Pattern 67: Universal Bug Diagnostic System
 */

import type { APICallRecord } from './componentRegistry';

const MAX_RECORDED_CALLS = 50;
const MAX_BODY_SIZE = 10000; // 10KB max for request/response body

let recordedCalls: APICallRecord[] = [];
let isInterceptorActive = false;
let originalFetch: typeof fetch | null = null;

function sanitizeBody(body: unknown): unknown {
  if (!body) return undefined;
  
  try {
    const str = typeof body === 'string' ? body : JSON.stringify(body);
    if (str.length > MAX_BODY_SIZE) {
      return { _truncated: true, _size: str.length, _preview: str.substring(0, 500) };
    }
    return typeof body === 'string' ? JSON.parse(body) : body;
  } catch {
    return typeof body === 'string' ? body.substring(0, MAX_BODY_SIZE) : undefined;
  }
}

function shouldRecordAPI(url: string): boolean {
  // Only record our API calls
  if (!url.includes('/api/')) return false;
  
  // Skip noisy endpoints
  const skipPatterns = [
    '/api/health',
    '/api/breadcrumbs',
    '/api/analytics',
    '/api/mrblue/heartbeat',
  ];
  
  return !skipPatterns.some(pattern => url.includes(pattern));
}

export function startNetworkInterceptor(): void {
  if (isInterceptorActive) return;
  
  originalFetch = window.fetch;
  isInterceptorActive = true;
  
  window.fetch = async (...args): Promise<Response> => {
    const [input, init] = args;
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    const method = init?.method || 'GET';
    const startTime = Date.now();
    
    if (!shouldRecordAPI(url)) {
      return originalFetch!.apply(window, args);
    }
    
    // Capture request body
    let requestBody: unknown = undefined;
    if (init?.body) {
      try {
        if (typeof init.body === 'string') {
          requestBody = sanitizeBody(init.body);
        } else if (init.body instanceof FormData) {
          requestBody = { _type: 'FormData', _fields: Array.from((init.body as FormData).keys()) };
        }
      } catch {
        requestBody = { _type: 'unknown' };
      }
    }
    
    try {
      const response = await originalFetch!.apply(window, args);
      const duration = Date.now() - startTime;
      
      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      let responseBody: unknown = undefined;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const text = await clonedResponse.text();
          responseBody = sanitizeBody(text);
        }
      } catch {
        // Ignore body read errors
      }
      
      const record: APICallRecord = {
        timestamp: startTime,
        url: url.substring(0, 200),
        method,
        status: response.status,
        requestBody,
        responseBody,
        duration,
      };
      
      recordedCalls = [...recordedCalls.slice(-MAX_RECORDED_CALLS + 1), record];
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const record: APICallRecord = {
        timestamp: startTime,
        url: url.substring(0, 200),
        method,
        status: 0,
        requestBody,
        duration,
        error: error instanceof Error ? error.message : 'Network Error',
      };
      
      recordedCalls = [...recordedCalls.slice(-MAX_RECORDED_CALLS + 1), record];
      
      throw error;
    }
  };
  
  console.log('[NetworkInterceptor] Started');
}

export function stopNetworkInterceptor(): void {
  if (!isInterceptorActive || !originalFetch) return;
  
  window.fetch = originalFetch;
  isInterceptorActive = false;
  originalFetch = null;
  
  console.log('[NetworkInterceptor] Stopped');
}

export function getRecordedCalls(): APICallRecord[] {
  return [...recordedCalls];
}

export function getRecentCalls(limit: number = 10): APICallRecord[] {
  return recordedCalls.slice(-limit);
}

export function getFailedCalls(): APICallRecord[] {
  return recordedCalls.filter(c => c.status >= 400 || c.status === 0);
}

export function clearRecordedCalls(): void {
  recordedCalls = [];
}

export function getCallsForEndpoint(pattern: string | RegExp): APICallRecord[] {
  return recordedCalls.filter(c => {
    if (typeof pattern === 'string') {
      return c.url.includes(pattern);
    }
    return pattern.test(c.url);
  });
}
