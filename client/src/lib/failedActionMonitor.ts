/**
 * Failed Action Monitor
 * Tracks errors (404, API failures, validation errors) for proactive assistance
 * Integrates with Mr. Blue Intelligence to offer help
 */

export interface FailedAction {
  id?: number;
  breadcrumbId?: number;
  userId: number;
  sessionId: string;
  timestamp: Date;
  failureType: '404' | 'api_error' | 'validation' | 'network' | 'auth' | 'unknown';
  statusCode?: number;
  errorDetails: {
    message: string;
    stack?: string;
    url?: string;
    method?: string;
    requestData?: any;
    responseData?: any;
  };
  recoveryAttempted: boolean;
  recoverySuccessful: boolean;
  retries: number;
}

interface MonitorConfig {
  maxRetries: number;
  retryDelay: number;
  trackValidation: boolean;
  trackNavigation: boolean;
  trackApi: boolean;
}

class FailedActionMonitor {
  private sessionId: string;
  private failedActions: FailedAction[] = [];
  private config: MonitorConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    trackValidation: true,
    trackNavigation: true,
    trackApi: true
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.setupNavigationMonitoring();
    this.setupApiMonitoring();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.trackError({
        failureType: 'unknown',
        errorDetails: {
          message: event.message,
          stack: event.error?.stack,
          url: event.filename
        }
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        failureType: 'unknown',
        errorDetails: {
          message: event.reason?.message || String(event.reason),
          stack: event.reason?.stack
        }
      });
    });
  }

  private setupNavigationMonitoring() {
    if (!this.config.trackNavigation) return;

    // Monitor navigation failures (404s)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (response.status === 404) {
          this.trackError({
            failureType: '404',
            statusCode: 404,
            errorDetails: {
              message: 'Page not found',
              url: args[0] as string,
              method: (args[1] as RequestInit)?.method || 'GET'
            }
          });
        }

        return response;
      } catch (error: any) {
        this.trackError({
          failureType: 'network',
          errorDetails: {
            message: error.message,
            url: args[0] as string,
            method: (args[1] as RequestInit)?.method || 'GET'
          }
        });
        throw error;
      }
    };
  }

  private setupApiMonitoring() {
    if (!this.config.trackApi) return;

    // Monitor API calls via fetch interception
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] as string;
      const options = args[1] as RequestInit;

      try {
        const response = await originalFetch(...args);

        // Track API errors (4xx, 5xx)
        if (!response.ok && url.startsWith('/api/')) {
          const errorData = await response.clone().json().catch(() => ({}));
          
          this.trackError({
            failureType: 'api_error',
            statusCode: response.status,
            errorDetails: {
              message: errorData.message || response.statusText,
              url,
              method: options?.method || 'GET',
              requestData: options?.body,
              responseData: errorData
            }
          });
        }

        return response;
      } catch (error: any) {
        // Network failures
        this.trackError({
          failureType: 'network',
          errorDetails: {
            message: error.message,
            url,
            method: options?.method || 'GET'
          }
        });
        throw error;
      }
    };
  }

  private trackError(partial: Omit<FailedAction, 'userId' | 'sessionId' | 'timestamp' | 'recoveryAttempted' | 'recoverySuccessful' | 'retries'>) {
    const failedAction: FailedAction = {
      userId: 0, // Will be set from auth context
      sessionId: this.sessionId,
      timestamp: new Date(),
      recoveryAttempted: false,
      recoverySuccessful: false,
      retries: 0,
      ...partial
    };

    this.failedActions.push(failedAction);
    
    // Send to backend for ML analysis
    this.sendToBackend(failedAction);

    // Trigger Mr. Blue proactive assistance
    this.offerHelp(failedAction);
  }

  private async sendToBackend(failedAction: FailedAction) {
    try {
      await fetch('/api/failed-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(failedAction)
      });
    } catch (error) {
      console.debug('[FailedActionMonitor] Failed to send to backend:', error);
    }
  }

  private offerHelp(failedAction: FailedAction) {
    // Dispatch custom event for Mr. Blue to intercept
    const event = new CustomEvent('mrblue:failed-action', {
      detail: failedAction
    });
    window.dispatchEvent(event);
  }

  // Public API for manual tracking
  trackValidationError(field: string, message: string) {
    if (!this.config.trackValidation) return;

    this.trackError({
      failureType: 'validation',
      errorDetails: {
        message: `Validation error: ${field} - ${message}`,
        url: window.location.pathname
      }
    });
  }

  trackAuthError(message: string) {
    this.trackError({
      failureType: 'auth',
      statusCode: 401,
      errorDetails: {
        message,
        url: window.location.pathname
      }
    });
  }

  trackApiError(url: string, method: string, statusCode: number, errorData: any) {
    this.trackError({
      failureType: 'api_error',
      statusCode,
      errorDetails: {
        message: errorData.message || 'API Error',
        url,
        method,
        responseData: errorData
      }
    });
  }

  getRecentErrors(limit: number = 10): FailedAction[] {
    return this.failedActions.slice(-limit);
  }

  getErrorsByType(type: FailedAction['failureType']): FailedAction[] {
    return this.failedActions.filter(a => a.failureType === type);
  }

  clear() {
    this.failedActions = [];
  }
}

export const failedActionMonitor = new FailedActionMonitor();
