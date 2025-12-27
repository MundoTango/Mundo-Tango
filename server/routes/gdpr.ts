import { Router } from 'express';
import { db } from '@shared/db';
import { eq, and } from 'drizzle-orm';
import { 
  userPrivacySettings, 
  dataExportRequests, 
  accountDeletionRequests,
  cookieConsents,
  consentAuditLog
} from '@shared/schema';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { auditLog } from '../middleware/auditLog';
import { requestDataExport, getDataExportStatus, getUserDataExports } from '../services/gdprExport';

const router = Router();

// ============================================
// GDPR ARTICLE 15: RIGHT TO DATA PORTABILITY
// ============================================

router.post('/api/gdpr/export', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const requestId = await requestDataExport(userId);
    
    await auditLog(userId, 'GDPR_DATA_EXPORT', { requestId });

    res.json({
      success: true,
      requestId,
      message: 'Data export request submitted. You will receive a download link when ready.',
    });
  } catch (error) {
    console.error('GDPR export error:', error);
    res.status(500).json({ error: 'Data export failed' });
  }
});

router.get('/api/gdpr/export/:requestId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const requestId = parseInt(req.params.requestId);
    
    const status = await getDataExportStatus(requestId, userId);
    if (!status) {
      return res.status(404).json({ error: 'Export request not found' });
    }

    res.json({ success: true, export: status });
  } catch (error) {
    console.error('GDPR export status error:', error);
    res.status(500).json({ error: 'Failed to get export status' });
  }
});

router.get('/api/gdpr/exports', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const exports = await getUserDataExports(userId);
    res.json({ success: true, exports });
  } catch (error) {
    console.error('GDPR exports list error:', error);
    res.status(500).json({ error: 'Failed to list exports' });
  }
});

// ============================================
// GDPR ARTICLE 17: RIGHT TO BE FORGOTTEN
// ============================================

router.post('/api/gdpr/delete-account', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 30);

    const existing = await db.query.accountDeletionRequests.findFirst({
      where: eq(accountDeletionRequests.userId, userId)
    });

    if (existing && existing.status === 'scheduled') {
      return res.json({
        success: true,
        message: 'Account deletion already scheduled',
        scheduledDate: existing.scheduledFor,
        gracePeriodDays: 30,
      });
    }

    await db.insert(accountDeletionRequests).values({
      userId,
      scheduledFor: scheduledDate,
      status: 'scheduled',
      ipAddress: req.ip || undefined,
      userAgent: req.get('user-agent') || undefined,
    }).onConflictDoUpdate({
      target: accountDeletionRequests.userId,
      set: {
        scheduledFor: scheduledDate,
        status: 'scheduled',
        cancelledAt: null,
        cancellationReason: null,
      }
    });

    await auditLog(userId, 'ACCOUNT_DELETION_REQUESTED', { 
      scheduledDate: scheduledDate.toISOString() 
    });

    res.json({
      success: true,
      message: 'Account deletion scheduled',
      scheduledDate: scheduledDate.toISOString(),
      gracePeriodDays: 30,
      note: 'You have 30 days to cancel this request.',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Deletion request failed' });
  }
});

router.post('/api/gdpr/cancel-deletion', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { reason } = req.body;

    await db.update(accountDeletionRequests)
      .set({ 
        status: 'cancelled', 
        cancelledAt: new Date(),
        cancellationReason: reason || 'User cancelled'
      })
      .where(and(
        eq(accountDeletionRequests.userId, userId),
        eq(accountDeletionRequests.status, 'scheduled')
      ));

    await auditLog(userId, 'ACCOUNT_DELETION_CANCELLED', { reason });

    res.json({ success: true, message: 'Account deletion cancelled' });
  } catch (error) {
    console.error('Deletion cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel deletion' });
  }
});

router.get('/api/gdpr/deletion-status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    const request = await db.query.accountDeletionRequests.findFirst({
      where: eq(accountDeletionRequests.userId, userId)
    });

    res.json({
      success: true,
      hasPendingDeletion: request?.status === 'scheduled',
      deletionRequest: request || null,
    });
  } catch (error) {
    console.error('Deletion status error:', error);
    res.status(500).json({ error: 'Failed to get deletion status' });
  }
});

// ============================================
// GDPR ARTICLE 7: CONSENT MANAGEMENT
// ============================================

router.get('/api/gdpr/consents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const settings = await db.query.userPrivacySettings.findFirst({
      where: eq(userPrivacySettings.userId, userId)
    });

    const consents = {
      analytics: settings?.analytics ?? false,
      marketing: settings?.marketingEmails ?? false,
      thirdParty: settings?.thirdPartySharing ?? false,
    };

    res.json({ success: true, consents });
  } catch (error) {
    console.error('Consent retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve consents' });
  }
});

router.put('/api/gdpr/consents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { analytics, marketing, thirdParty } = req.body;

    const existing = await db.query.userPrivacySettings.findFirst({
      where: eq(userPrivacySettings.userId, userId)
    });

    const updates = {
      analytics: analytics ?? existing?.analytics ?? false,
      marketingEmails: marketing ?? existing?.marketingEmails ?? false,
      thirdPartySharing: thirdParty ?? existing?.thirdPartySharing ?? false,
      updatedAt: new Date(),
    };

    if (existing) {
      await db.update(userPrivacySettings)
        .set(updates)
        .where(eq(userPrivacySettings.userId, userId));
    } else {
      await db.insert(userPrivacySettings).values({
        userId,
        ...updates,
      });
    }

    // Log consent changes to audit log
    const changes = [];
    if (analytics !== undefined && analytics !== existing?.analytics) {
      changes.push({ type: 'analytics', prev: existing?.analytics, new: analytics });
    }
    if (marketing !== undefined && marketing !== existing?.marketingEmails) {
      changes.push({ type: 'marketing', prev: existing?.marketingEmails, new: marketing });
    }
    if (thirdParty !== undefined && thirdParty !== existing?.thirdPartySharing) {
      changes.push({ type: 'third_party', prev: existing?.thirdPartySharing, new: thirdParty });
    }

    for (const change of changes) {
      await db.insert(consentAuditLog).values({
        userId,
        consentType: change.type,
        action: change.new ? 'granted' : 'withdrawn',
        previousValue: change.prev ?? null,
        newValue: change.new,
        consentVersion: '1.0',
        ipAddress: req.ip || undefined,
        userAgent: req.get('user-agent') || undefined,
      });
    }

    await auditLog(userId, 'CONSENT_PREFERENCES_UPDATED', { analytics, marketing, thirdParty });

    res.json({ success: true, message: 'Consent preferences updated' });
  } catch (error) {
    console.error('Consent update error:', error);
    res.status(500).json({ error: 'Failed to update consents' });
  }
});

// ============================================
// COOKIE CONSENT (Public endpoint)
// ============================================

router.post('/api/gdpr/cookie-consent', async (req, res) => {
  try {
    const { essential, analytics, marketing, functional, sessionId, userId } = req.body;

    await db.insert(cookieConsents).values({
      userId: userId || null,
      sessionId: sessionId || null,
      essential: true, // Always true
      analytics: analytics ?? false,
      marketing: marketing ?? false,
      functional: functional ?? false,
      consentVersion: '1.0',
      consentMethod: 'banner',
      ipAddress: req.ip || undefined,
      userAgent: req.get('user-agent') || undefined,
    });

    res.json({ success: true, message: 'Cookie consent recorded' });
  } catch (error) {
    console.error('Cookie consent error:', error);
    res.status(500).json({ error: 'Failed to record cookie consent' });
  }
});

// ============================================
// PRIVACY SETTINGS
// ============================================

router.get('/api/privacy/settings', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const settings = await db.query.userPrivacySettings.findFirst({
      where: eq(userPrivacySettings.userId, userId)
    });

    res.json({
      success: true,
      settings: settings || {
        profileVisibility: 'public',
        searchable: true,
        showActivity: true,
        marketingEmails: true,
        analytics: true,
        thirdPartySharing: false,
      },
    });
  } catch (error) {
    console.error('Privacy settings retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve privacy settings' });
  }
});

router.put('/api/privacy/settings', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const settings = req.body;

    const existing = await db.query.userPrivacySettings.findFirst({
      where: eq(userPrivacySettings.userId, userId)
    });

    if (existing) {
      await db.update(userPrivacySettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(userPrivacySettings.userId, userId));
    } else {
      await db.insert(userPrivacySettings).values({
        userId,
        ...settings,
      });
    }

    res.json({ success: true, message: 'Privacy settings updated' });
  } catch (error) {
    console.error('Privacy settings update error:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// ============================================
// SECURITY ENDPOINTS
// ============================================

router.get('/api/security/audit-logs', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const logs = await db.query.consentAuditLog.findMany({
      where: eq(consentAuditLog.userId, userId),
      orderBy: (table, { desc }) => [desc(table.timestamp)],
      limit: 100,
    });

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Audit logs retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

router.get('/api/security/sessions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Sessions would typically come from a session store
    // For now, return empty array
    res.json({ success: true, sessions: [] });
  } catch (error) {
    console.error('Sessions retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

export default router;
