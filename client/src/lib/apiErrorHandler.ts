/**
 * Unified API Error Handler - MB.MD Pattern 68 (3-Strike AutoFix)
 * Provides consistent, actionable error messages across the platform
 */

export interface ApiErrorResponse {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface HandleApiErrorOptions {
  context: string;
  fallbackMessage?: string;
}

/**
 * Extracts actionable error message from API response
 * Handles: JSON errors, HTML error pages, network failures
 */
export async function extractApiError(
  response: Response,
  options: HandleApiErrorOptions
): Promise<string> {
  const { context, fallbackMessage } = options;
  
  try {
    const contentType = response.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      const errorData: ApiErrorResponse = await response.json();
      
      if (errorData.message) {
        return errorData.field 
          ? `${errorData.field}: ${errorData.message}`
          : errorData.message;
      }
      
      if (errorData.code) {
        return getErrorMessageByCode(errorData.code, context);
      }
    }
    
    if (response.status === 401) {
      return "Your session has expired. Please log in again.";
    }
    
    if (response.status === 403) {
      return "You don't have permission to perform this action.";
    }
    
    if (response.status === 404) {
      return `${context} not found. It may have been deleted.`;
    }
    
    if (response.status === 409) {
      return `${context} already exists or conflicts with another record.`;
    }
    
    if (response.status === 422) {
      return "The provided data is invalid. Please check your input.";
    }
    
    if (response.status >= 500) {
      return "Server error. Our team has been notified. Please try again in a moment.";
    }
    
    return fallbackMessage || `Failed to ${context.toLowerCase()}. Please try again.`;
    
  } catch {
    return fallbackMessage || `Failed to ${context.toLowerCase()}. Please try again.`;
  }
}

/**
 * Maps error codes to user-friendly messages
 */
function getErrorMessageByCode(code: string, context: string): string {
  const errorMessages: Record<string, string> = {
    VALIDATION_ERROR: "Please check your input and try again.",
    DUPLICATE_ENTRY: `This ${context.toLowerCase()} already exists.`,
    NOT_FOUND: `${context} not found.`,
    UNAUTHORIZED: "Please log in to continue.",
    FORBIDDEN: "You don't have permission for this action.",
    RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
    NETWORK_ERROR: "Connection failed. Please check your internet and try again.",
    TIMEOUT: "Request timed out. Please try again.",
  };
  
  return errorMessages[code] || `Error: ${code}`;
}

/**
 * Wrapper for fetch with proper error handling
 * Use this instead of raw fetch() in form submissions
 */
export async function safeFetch(
  url: string,
  options: RequestInit,
  errorContext: string
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorMessage = await extractApiError(response, { context: errorContext });
      throw new Error(errorMessage);
    }
    
    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your connection and try again.");
    }
    throw error;
  }
}

/**
 * Creates a retry wrapper for critical operations
 * MB.MD Pattern 68: 3-Strike AutoFix
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError || new Error("Operation failed after retries");
}
