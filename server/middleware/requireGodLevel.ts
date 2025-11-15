import { Request, Response, NextFunction } from 'express';
import { approvalService } from '../services/godLevel/approvalService';
import { quotaService, QuotaType } from '../services/godLevel/quotaService';

export interface GodLevelRequest extends Request {
  user?: {
    id: number;
    subscriptionTier?: string;
  };
}

export function requireGodLevel(options?: { quotaType?: QuotaType }) {
  return async (req: GodLevelRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Please log in to access this feature'
        });
      }

      if (req.user.subscriptionTier !== 'god') {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'God Level subscription required'
        });
      }

      const isApproved = await approvalService.isGodLevelApproved(req.user.id);
      if (!isApproved) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'God Level access not approved. Please request approval first.'
        });
      }

      if (options?.quotaType) {
        const quotaCheck = await quotaService.checkQuota(req.user.id, options.quotaType);
        if (!quotaCheck.available) {
          return res.status(402).json({ 
            error: 'Payment Required',
            message: `Monthly ${options.quotaType} quota exceeded (${quotaCheck.used}/${quotaCheck.limit})`,
            quota: quotaCheck
          });
        }
      }

      next();
    } catch (error) {
      console.error('[requireGodLevel] Error:', error);
      next(error);
    }
  };
}

export function requireAdmin(req: GodLevelRequest, res: Response, next: NextFunction) {
  if (!req.user?.id) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Please log in to access this feature'
    });
  }

  const adminEmail = process.env.TEST_ADMIN_EMAIL || 'scott@mundotango.com';
  
  if (req.user) {
    next();
  } else {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }
}
