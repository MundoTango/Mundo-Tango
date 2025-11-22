/**
 * MR BLUE PREFERENCES API ROUTES - AGENT #42
 * API endpoints for auto-extracting and managing user preferences
 */

import { Router, Request, Response } from 'express';
import { preferenceExtractor } from '../services/mrBlue/preferenceExtractor';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();

// Initialize service on startup
preferenceExtractor.initialize().catch(err => 
  console.error('[PreferenceExtractor Routes] Initialization error:', err)
);

/**
 * POST /api/mrblue/preferences/extract
 * Extract and save preferences from a message
 */
router.post('/extract', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'message (string) is required'
      });
    }

    const detected = await preferenceExtractor.extractAndSave(
      userId!,
      message,
      conversationId || 0
    );

    res.json({
      success: true,
      detected,
      count: detected.length
    });
  } catch (error: any) {
    console.error('[PreferenceExtractor API] Extract error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/preferences/list
 * Get all preferences for the authenticated user
 */
router.get('/list', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    const preferences = await preferenceExtractor.getUserPreferences(userId!);

    res.json({
      success: true,
      preferences,
      count: preferences.length
    });
  } catch (error: any) {
    console.error('[PreferenceExtractor API] List error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/preferences/context
 * Build preference context for code generation
 */
router.get('/context', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    const context = await preferenceExtractor.buildPreferenceContext(userId!);

    res.json({
      success: true,
      context
    });
  } catch (error: any) {
    console.error('[PreferenceExtractor API] Context error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/mrblue/preferences/:key
 * Delete a specific preference
 */
router.delete('/:key', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { key } = req.params;

    await preferenceExtractor.deletePreference(userId!, key);

    res.json({
      success: true,
      message: 'Preference deleted successfully'
    });
  } catch (error: any) {
    console.error('[PreferenceExtractor API] Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/mrblue/preferences/all
 * Clear all preferences for the authenticated user
 */
router.delete('/all/clear', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    await preferenceExtractor.clearAllPreferences(userId!);

    res.json({
      success: true,
      message: 'All preferences cleared successfully'
    });
  } catch (error: any) {
    console.error('[PreferenceExtractor API] Clear all error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
