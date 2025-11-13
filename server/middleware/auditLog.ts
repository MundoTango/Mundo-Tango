import { Request, Response, NextFunction } from "express";
import { db } from "@shared/db";
import { securityAuditLogs } from "@shared/schema";

export type AuditAction = 
  | "login"
  | "logout"
  | "password_change"
  | "password_reset_request"
  | "password_reset_complete"
  | "profile_update"
  | "email_change"
  | "2fa_enable"
  | "2fa_disable"
  | "data_access"
  | "data_export"
  | "data_delete"
  | "admin_action"
  | "role_change"
  | "account_suspension"
  | "account_activation"
  | "csrf_violation"
  | "failed_login"
  | "api_key_created"
  | "api_key_deleted";

export interface AuditLogData {
  userId?: number;
  action: AuditAction;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export async function auditLog(data: AuditLogData): Promise<void> {
  try {
    await db.insert(securityAuditLogs).values({
      userId: data.userId,
      action: data.action,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}

export function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

export function auditLogMiddleware(action: AuditAction, metadata?: Record<string, any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    
    await auditLog({
      userId,
      action,
      ipAddress: getClientIp(req),
      userAgent: req.headers["user-agent"],
      metadata: {
        ...metadata,
        path: req.path,
        method: req.method,
      },
    });

    next();
  };
}
