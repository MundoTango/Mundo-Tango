/**
 * AUTONOMOUS GIT ROUTES
 * API endpoints for autonomous Git commit system
 */

import { Router } from 'express';
import { AutonomousGitService } from '../services/git/AutonomousGitService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/git/status
 * Get current Git status and change analysis
 */
router.get('/status', async (req, res) => {
  try {
    const analysis = await AutonomousGitService.analyzeChanges();
    
    if (!analysis) {
      return res.json({
        success: true,
        hasChanges: false,
        message: 'No changes detected'
      });
    }

    res.json({
      success: true,
      hasChanges: true,
      analysis
    });
  } catch (error: any) {
    console.error('[Git API] Error getting status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/git/commit
 * Commit all changes with AI-generated message
 */
router.post('/commit', async (req, res) => {
  try {
    const result = await AutonomousGitService.commitChanges();
    
    res.json({
      success: true,
      commit: result.commit,
      summary: result.summary
    });
  } catch (error: any) {
    console.error('[Git API] Error committing:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/git/history
 * Get commit history
 */
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const history = await AutonomousGitService.getHistory(limit);
    
    res.json({
      success: true,
      history
    });
  } catch (error: any) {
    console.error('[Git API] Error getting history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
