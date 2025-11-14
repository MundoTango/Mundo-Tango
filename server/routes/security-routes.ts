/**
 * SECURITY ROUTES - P0 #7 (Two-Factor Authentication)
 * Complete 2FA implementation with TOTP
 */

import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  setupTOTP,
  verifyTOTP,
  verifyBackupCode,
  enable2FA,
  disable2FA,
  is2FAEnabled
} from '../services/twoFactor';

const router = Router();

/**
 * Setup 2FA for authenticated user
 * Returns QR code and backup codes
 */
router.post('/api/auth/2fa/setup', async (req: AuthRequest, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const { secret, qrCode, backupCodes } = await setupTOTP(
      req.user!.id,
      req.user!.email
    );

    res.json({
      qrCode,
      backupCodes,
      message: 'Scan QR code with your authenticator app'
    });
  } catch (error: any) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: 'Failed to setup 2FA' });
  }
});

/**
 * Verify 2FA token and enable it
 */
router.post('/api/auth/2fa/verify', async (req: AuthRequest, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token required' });
  }

  try {
    const verified = await verifyTOTP(req.user!.id, token);

    if (verified) {
      await enable2FA(req.user!.id);
      res.json({ 
        verified: true,
        message: '2FA enabled successfully'
      });
    } else {
      res.json({
        verified: false,
        message: 'Invalid token'
      });
    }
  } catch (error: any) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

/**
 * Verify 2FA during login
 */
router.post('/api/auth/2fa/login-verify', async (req: Request, res: Response) => {
  const { userId, token, backupCode } = req.body;

  if (!userId || (!token && !backupCode)) {
    return res.status(400).json({ message: 'User ID and token or backup code required' });
  }

  try {
    let verified = false;

    if (backupCode) {
      verified = await verifyBackupCode(userId, backupCode);
    } else {
      verified = await verifyTOTP(userId, token);
    }

    res.json({ verified });
  } catch (error: any) {
    console.error('2FA login verification error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

/**
 * Disable 2FA
 */
router.post('/api/auth/2fa/disable', async (req: AuthRequest, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token required to disable 2FA' });
  }

  try {
    // Verify token before disabling
    const verified = await verifyTOTP(req.user!.id, token);

    if (!verified) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    await disable2FA(req.user!.id);
    res.json({ message: '2FA disabled successfully' });
  } catch (error: any) {
    console.error('2FA disable error:', error);
    res.status(500).json({ message: 'Failed to disable 2FA' });
  }
});

/**
 * Check 2FA status
 */
router.get('/api/auth/2fa/status', async (req: AuthRequest, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const enabled = await is2FAEnabled(req.user!.id);
    res.json({ enabled });
  } catch (error: any) {
    console.error('2FA status check error:', error);
    res.status(500).json({ message: 'Failed to check 2FA status' });
  }
});

export default router;
