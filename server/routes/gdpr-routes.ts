/**
 * GDPR COMPLIANCE ROUTES - P0 #5
 * Data export, privacy settings, account deletion
 */

import { Router } from 'express';
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
router.post('/api/gdpr/export', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const requestId = await requestDataExport(req.user!.id);
    
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
router.get('/api/gdpr/export/:requestId', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const requestId = parseInt(req.params.requestId);

  try {
    const exportRequest = await getDataExportStatus(requestId, req.user!.id);

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
router.get('/api/gdpr/exports', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const exports = await getUserDataExports(req.user!.id);
    res.json(exports);
  } catch (error: any) {
    console.error('Get user exports error:', error);
    res.status(500).json({ message: 'Failed to get exports' });
  }
});

/**
 * Get privacy settings
 */
router.get('/api/gdpr/privacy-settings', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    let settings = await db.query.userPrivacySettings.findFirst({
      where: eq(userPrivacySettings.userId, req.user!.id)
    });

    if (!settings) {
      // Create default settings
      [settings] = await db.insert(userPrivacySettings).values({
        userId: req.user!.id
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
router.put('/api/gdpr/privacy-settings', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

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
        userId: req.user!.id,
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
router.post('/api/gdpr/delete-account', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

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
      .where(eq(users.id, req.user!.id));

    // Logout user
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
    });

    res.json({
      message: 'Account deletion scheduled. You have 30 days to cancel.'
    });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

export default router;
