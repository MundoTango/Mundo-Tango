type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
  error?: string;
  stack?: string;
  [key: string]: any;
}

class Logger {
  private isDev = import.meta.env.DEV;

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    // In production, send to monitoring service (future)
    // For now, use console with different levels
    if (this.isDev || level === 'error' || level === 'warn') {
      console[level === 'debug' ? 'log' : level](
        `[${level.toUpperCase()}] ${message}`,
        context || ''
      );
    }

    // Store errors for later analysis
    if (level === 'error') {
      this.storeError(logEntry);
    }
  }

  private storeError(logEntry: any) {
    try {
      const errors = JSON.parse(localStorage.getItem('mt_errors') || '[]');
      errors.push(logEntry);
      // Keep only last 50 errors
      const recentErrors = errors.slice(-50);
      localStorage.setItem('mt_errors', JSON.stringify(recentErrors));
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: error?.message,
      stack: error?.stack,
    });
  }

  // Method to retrieve stored errors for debugging
  getStoredErrors(): any[] {
    try {
      return JSON.parse(localStorage.getItem('mt_errors') || '[]');
    } catch {
      return [];
    }
  }

  clearStoredErrors() {
    localStorage.removeItem('mt_errors');
  }
}

export const logger = new Logger();
