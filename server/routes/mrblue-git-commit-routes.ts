/**
 * MR BLUE GIT COMMIT API ROUTES - AGENT #41
 * API endpoints for AI-powered Git commit message generation
 */

import { Router, Request, Response } from 'express';
import { 
  commitChanges, 
  getCommitHistory, 
  hasUncommittedChanges,
  generateCommitMessage 
} from '../services/mrBlue/gitCommitGenerator';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/mrblue/git/commit
 * Create a Git commit with AI-generated message
 */
router.post('/commit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { files, description, autoPush } = req.body;

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'files (non-empty array) is required'
      });
    }

    const result = await commitChanges({
      files,
      description,
      userId: userId!,
      autoPush: autoPush || false
    });

    res.json(result);
  } catch (error: any) {
    console.error('[GitCommit API] Commit error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/git/generate-message
 * Generate commit message without committing
 */
router.post('/generate-message', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { files, description } = req.body;

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'files (non-empty array) is required'
      });
    }

    const message = await generateCommitMessage(files, description);

    res.json({
      success: true,
      message
    });
  } catch (error: any) {
    console.error('[GitCommit API] Generate message error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/git/history
 * Get Git commit history
 */
router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const history = await getCommitHistory(limit);

    res.json({
      success: true,
      commits: history,
      count: history.length
    });
  } catch (error: any) {
    console.error('[GitCommit API] History error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/git/status
 * Check if there are uncommitted changes
 */
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const hasChanges = await hasUncommittedChanges();

    res.json({
      success: true,
      hasUncommittedChanges: hasChanges
    });
  } catch (error: any) {
    console.error('[GitCommit API] Status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
