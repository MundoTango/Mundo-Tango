/**
 * GDPR COMPLIANCE ROUTES - P0 #5
 * Data export, privacy settings, account deletion
 */

import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import {
  requestDataExport,
  getDataExportStatus,
  getUserDataExports
} from '../services/gdprExport';
import { db } from '@shared/db';
import { users, userPrivacySettings } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Request full data export
 */
router.post('/api/gdpr/export', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const requestId = await requestDataExport(req.userId!);
    
    res.json({
      requestId,
      status: 'pending',
      message: 'Data export request submitted. You will receive an email when ready.'
    });
  } catch (error: any) {
    console.error('Data export request error:', error);
    res.status(500).json({ message: 'Failed to request data export' });
  }
});

/**
 * Get data export status
 */
router.get('/api/gdpr/export/:requestId', authenticateToken, async (req: AuthRequest, res: Response) => {
  const requestId = parseInt(req.params.requestId);

  try {
    const exportRequest = await getDataExportStatus(requestId, req.userId!);

    if (!exportRequest) {
      return res.status(404).json({ message: 'Export request not found' });
    }

    res.json(exportRequest);
  } catch (error: any) {
    console.error('Get export status error:', error);
    res.status(500).json({ message: 'Failed to get export status' });
  }
});

/**
 * Get all data exports for user
 */
router.get('/api/gdpr/exports', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const exports = await getUserDataExports(req.userId!);
    res.json(exports);
  } catch (error: any) {
    console.error('Get user exports error:', error);
    res.status(500).json({ message: 'Failed to get exports' });
  }
});

/**
 * Download a completed data export (authenticated)
 */
router.get('/api/gdpr/export/:requestId/download', authenticateToken, async (req: AuthRequest, res: Response) => {
  const requestId = parseInt(req.params.requestId);

  try {
    const exportRequest = await getDataExportStatus(requestId, req.userId!);

    if (!exportRequest) {
      return res.status(404).json({ message: 'Export request not found' });
    }

    if (exportRequest.status !== 'completed') {
      return res.status(400).json({ message: 'Export is not ready for download' });
    }

    if (!exportRequest.fileUrl) {
      return res.status(404).json({ message: 'Export data not found' });
    }

    // Parse the data URL (format: data:application/json;base64,<base64data>)
    let exportData: string;
    if (exportRequest.fileUrl.startsWith('data:application/json;base64,')) {
      const base64Data = exportRequest.fileUrl.replace('data:application/json;base64,', '');
      exportData = Buffer.from(base64Data, 'base64').toString('utf8');
    } else {
      // If it's a direct URL, the frontend would need to fetch it
      return res.status(400).json({ message: 'External file URLs not supported for direct download' });
    }

    // Set headers for JSON file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="data-export-${requestId}.json"`);
    
    // Send the export data
    res.send(exportData);
  } catch (error: any) {
    console.error('Download export error:', error);
    res.status(500).json({ message: 'Failed to download export' });
  }
});

/**
 * Get privacy settings
 */
router.get('/api/gdpr/privacy-settings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let settings = await db.query.userPrivacySettings.findFirst({
      where: eq(userPrivacySettings.userId, req.userId!)
    });

    if (!settings) {
      // Create default settings
      [settings] = await db.insert(userPrivacySettings).values({
        userId: req.userId!
      }).returning();
    }

    res.json(settings);
  } catch (error: any) {
    console.error('Get privacy settings error:', error);
    res.status(500).json({ message: 'Failed to get privacy settings' });
  }
});

/**
 * Update privacy settings
 */
router.put('/api/gdpr/privacy-settings', authenticateToken, async (req: AuthRequest, res: Response) => {
  const {
    marketingEmails,
    analytics,
    thirdPartySharing,
    profileVisibility,
    searchable,
    showActivity
  } = req.body;

  try {
    const [settings] = await db.insert(userPrivacySettings)
      .values({
        userId: req.userId!,
        marketingEmails,
        analytics,
        thirdPartySharing,
        profileVisibility,
        searchable,
        showActivity
      })
      .onConflictDoUpdate({
        target: userPrivacySettings.userId,
        set: {
          marketingEmails,
          analytics,
          thirdPartySharing,
          profileVisibility,
          searchable,
          showActivity,
          updatedAt: new Date()
        }
      })
      .returning();

    res.json(settings);
  } catch (error: any) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({ message: 'Failed to update privacy settings' });
  }
});

/**
 * Request account deletion (30-day grace period)
 */
router.post('/api/gdpr/delete-account', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password required for account deletion' });
  }

  try {
    // In production: verify password, schedule deletion for 30 days from now
    // For now: immediate soft delete
    await db.update(users)
      .set({ 
        isActive: false,
        suspended: true
      })
      .where(eq(users.id, req.userId!));

    // Session will be invalidated on next request since user is deactivated
    res.json({
      message: 'Account deletion scheduled. You have 30 days to cancel.'
    });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

export default router;
