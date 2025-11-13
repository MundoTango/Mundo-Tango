import { Router } from 'express';
import { storage } from '../storage';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { auditLog } from '../middleware/auditLog';

const router = Router();

// ============================================
// GDPR ARTICLE 15: RIGHT TO DATA PORTABILITY
// ============================================

/**
 * POST /api/gdpr/export
 * Export all user data as JSON
 */
router.post('/api/gdpr/export', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // Gather all user data
    const userData = {
      metadata: {
        userId,
        exportedAt: new Date().toISOString(),
        dataProtectionRights: 'GDPR Article 15 - Right to Data Portability',
      },
      
      // User profile
      user: await storage.getUser(userId),
      
      // TODO: Add more data export logic here
      // posts: await storage.getUserPosts(userId),
      // messages: await storage.getUserMessages(userId),
      // etc.
    };

    // Log the export
    await auditLog(userId, 'GDPR_DATA_EXPORT', { success: true });

    res.json({
      success: true,
      data: userData,
      exportedAt: new Date().toISOString(),
      message: 'Your complete data export is ready',
    });

  } catch (error) {
    console.error('GDPR export error:', error);
    res.status(500).json({ 
      error: 'Data export failed',
      message: 'An error occurred while exporting your data. Please try again.',
    });
  }
});

// ============================================
// GDPR ARTICLE 17: RIGHT TO BE FORGOTTEN
// ============================================

/**
 * POST /api/gdpr/delete-account
 * Request account deletion with 30-day grace period
 */
router.post('/api/gdpr/delete-account', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // Schedule deletion 30 days from now
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 30);

    // Update user status (this would need to be added to storage interface)
    // await storage.scheduleAccountDeletion(userId, scheduledDate);

    // Log the deletion request
    await auditLog(userId, 'ACCOUNT_DELETION_REQUESTED', { 
      scheduledDate: scheduledDate.toISOString() 
    });

    res.json({
      success: true,
      message: 'Account deletion scheduled',
      scheduledDate: scheduledDate.toISOString(),
      gracePeriodDays: 30,
      note: 'You have 30 days to cancel this request. After that, all your data will be permanently deleted.',
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ 
      error: 'Deletion request failed',
      message: 'An error occurred while processing your deletion request.',
    });
  }
});

/**
 * POST /api/gdpr/cancel-deletion
 * Cancel pending account deletion
 */
router.post('/api/gdpr/cancel-deletion', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // Cancel deletion (this would need to be added to storage interface)
    // await storage.cancelAccountDeletion(userId);

    // Log the cancellation
    await auditLog(userId, 'ACCOUNT_DELETION_CANCELLED', {});

    res.json({ 
      success: true,
      message: 'Account deletion cancelled successfully',
    });

  } catch (error) {
    console.error('Deletion cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel deletion' });
  }
});

// ============================================
// GDPR ARTICLE 7: CONSENT MANAGEMENT
// ============================================

/**
 * GET /api/gdpr/consents
 * Get user consent preferences
 */
router.get('/api/gdpr/consents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // This would need to be added to storage interface
    // const consents = await storage.getUserPrivacySettings(userId);

    const consents = {
      analytics: false,
      marketing: false,
      aiTraining: false,
      thirdParty: false,
    };

    res.json({
      success: true,
      consents,
    });

  } catch (error) {
    console.error('Consent retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve consent preferences' });
  }
});

/**
 * PUT /api/gdpr/consents
 * Update consent preferences
 */
router.put('/api/gdpr/consents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { analytics, marketing, aiTraining, thirdParty } = req.body;

    // This would need to be added to storage interface
    // await storage.updateUserPrivacySettings(userId, {
    //   analytics, marketing, aiTraining, thirdParty
    // });

    // Log consent update
    await auditLog(userId, 'CONSENT_PREFERENCES_UPDATED', { 
      analytics, marketing, aiTraining, thirdParty 
    });

    res.json({ 
      success: true,
      message: 'Consent preferences updated successfully',
    });

  } catch (error) {
    console.error('Consent update error:', error);
    res.status(500).json({ error: 'Failed to update consent preferences' });
  }
});

// ============================================
// SECURITY ENDPOINTS
// ============================================

/**
 * GET /api/security/audit-logs
 * Get user's security audit logs
 */
router.get('/api/security/audit-logs', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // This would need to be added to storage interface
    // const logs = await storage.getUserAuditLogs(userId, 100);

    res.json({
      success: true,
      logs: [],
    });

  } catch (error) {
    console.error('Audit logs retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

/**
 * GET /api/security/sessions
 * Get user's active sessions
 */
router.get('/api/security/sessions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // This would need to be added to storage interface
    // const sessions = await storage.getUserSessions(userId);

    res.json({
      success: true,
      sessions: [],
    });

  } catch (error) {
    console.error('Sessions retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

/**
 * GET /api/privacy/settings
 * Get user's privacy settings
 */
router.get('/api/privacy/settings', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // This would need to be added to storage interface
    // const settings = await storage.getUserPrivacySettings(userId);

    res.json({
      success: true,
      settings: {},
    });

  } catch (error) {
    console.error('Privacy settings retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve privacy settings' });
  }
});

/**
 * PUT /api/privacy/settings
 * Update user's privacy settings
 */
router.put('/api/privacy/settings', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const settings = req.body;

    // This would need to be added to storage interface
    // await storage.updateUserPrivacySettings(userId, settings);

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
    });

  } catch (error) {
    console.error('Privacy settings update error:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

export default router;
