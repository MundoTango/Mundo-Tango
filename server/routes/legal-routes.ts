/**
 * LEGAL COMPLIANCE ROUTES - P0 #9
 * Code of Conduct acceptance tracking
 */

import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { db } from '@shared/db';
import { codeOfConductAgreements } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Record Code of Conduct acceptance
 */
router.post('/api/onboarding/legal', async (req: AuthRequest, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const {
    privacyPolicyVersion,
    tosVersion,
    cocVersion
  } = req.body;

  if (!privacyPolicyVersion || !tosVersion || !cocVersion) {
    return res.status(400).json({
      message: 'All policy versions required'
    });
  }

  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await db.insert(codeOfConductAgreements).values({
      userId: req.user!.id,
      privacyPolicyVersion,
      tosVersion,
      cocVersion,
      ipAddress,
      userAgent
    });

    res.json({
      message: 'Legal agreements accepted',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Legal agreement error:', error);
    res.status(500).json({ message: 'Failed to record agreement' });
  }
});

/**
 * Check if user has accepted current legal agreements
 */
router.get('/api/onboarding/legal/status', async (req: AuthRequest, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const agreement = await db.query.codeOfConductAgreements.findFirst({
      where: eq(codeOfConductAgreements.userId, req.user!.id),
      orderBy: (codeOfConductAgreements, { desc }) => [desc(codeOfConductAgreements.acceptedAt)]
    });

    if (!agreement) {
      return res.json({ accepted: false });
    }

    // Check if current versions match
    const currentVersions = {
      privacy: '1.0',
      tos: '1.0',
      coc: '1.0'
    };

    const upToDate = 
      agreement.privacyPolicyVersion === currentVersions.privacy &&
      agreement.tosVersion === currentVersions.tos &&
      agreement.cocVersion === currentVersions.coc;

    res.json({
      accepted: true,
      upToDate,
      lastAccepted: agreement.acceptedAt,
      versions: {
        privacy: agreement.privacyPolicyVersion,
        tos: agreement.tosVersion,
        coc: agreement.cocVersion
      }
    });
  } catch (error: any) {
    console.error('Legal status check error:', error);
    res.status(500).json({ message: 'Failed to check legal status' });
  }
});

/**
 * Get user's legal agreement history
 */
router.get('/api/onboarding/legal/history', async (req: AuthRequest, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const agreements = await db.query.codeOfConductAgreements.findMany({
      where: eq(codeOfConductAgreements.userId, req.user!.id),
      orderBy: (codeOfConductAgreements, { desc }) => [desc(codeOfConductAgreements.acceptedAt)]
    });

    res.json(agreements);
  } catch (error: any) {
    console.error('Legal history error:', error);
    res.status(500).json({ message: 'Failed to get legal history' });
  }
});

export default router;
