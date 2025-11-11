import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodSchema } from "zod";

/**
 * Input Validation Middleware
 * Validates request body, query params, and URL params using Zod schemas
 */

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Create validation middleware for request data
 */
export function validateInput(schemas: ValidationSchemas) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      // Validate query parameters
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      // Validate URL parameters
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          error: "Validation failed",
          details: errors,
        });
      }

      next(error);
    }
  };
}

/**
 * Common validation schemas for reuse
 */
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),

  // ID parameter
  idParam: z.object({
    id: z.coerce.number().int().positive(),
  }),

  // Search query
  searchQuery: z.object({
    q: z.string().min(1).max(200),
  }),

  // Email
  email: z.string().email().max(255),

  // Password (at least 8 chars)
  password: z.string().min(8).max(100),

  // URL
  url: z.string().url().max(500),

  // Date range
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),

  // Status filter
  statusFilter: z.object({
    status: z.enum(["active", "inactive", "pending", "approved", "rejected"]).optional(),
  }),
};

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate file upload
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types
  required?: boolean;
}

export function validateFile(options: FileValidationOptions = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
    required = true,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;

    if (!file) {
      if (required) {
        return res.status(400).json({
          error: "Validation failed",
          details: [{ field: "file", message: "File is required" }],
        });
      }
      return next();
    }

    // Check file size
    if (file.size > maxSize) {
      return res.status(400).json({
        error: "Validation failed",
        details: [
          {
            field: "file",
            message: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
          },
        ],
      });
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: "Validation failed",
        details: [
          {
            field: "file",
            message: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
          },
        ],
      });
    }

    next();
  };
}

/**
 * Validate multiple files upload
 */
export function validateFiles(options: FileValidationOptions = {}) {
  const {
    maxSize = 5 * 1024 * 1024,
    allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
    required = true,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      if (required) {
        return res.status(400).json({
          error: "Validation failed",
          details: [{ field: "files", message: "At least one file is required" }],
        });
      }
      return next();
    }

    // Validate each file
    for (const file of files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          error: "Validation failed",
          details: [
            {
              field: "files",
              message: `File ${file.originalname} exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
            },
          ],
        });
      }

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: "Validation failed",
          details: [
            {
              field: "files",
              message: `File ${file.originalname} type ${file.mimetype} is not allowed`,
            },
          ],
        });
      }
    }

    next();
  };
}

export default validateInput;
