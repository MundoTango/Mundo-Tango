import { Request, Response, NextFunction } from 'express';

/**
 * Error handling middleware wrapper for async route handlers
 * Catches errors from async functions and passes them to Express error handler
 */
export function handleErrors(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[ErrorHandler] Error occurred:', err);

  // Default to 500 server error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}
