/**
 * MR BLUE FILE DEPENDENCY TRACKER API ROUTES - AGENT #50
 * API endpoints for tracking file dependencies and impact analysis
 */

import { Router, Request, Response } from 'express';
import { FileDependencyTracker } from '../services/mrBlue/fileDependencyTracker';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();
const dependencyTracker = new FileDependencyTracker();

// Initialize service on startup
dependencyTracker.initialize().catch(err => 
  console.error('[FileDependencyTracker Routes] Initialization error:', err)
);

/**
 * POST /api/mrblue/dependencies/analyze
 * Analyze dependencies for a file
 */
router.post('/analyze', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { filePath } = req.body;

    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'filePath (string) is required'
      });
    }

    const analysis = await dependencyTracker.analyzeDependencies(filePath);

    res.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error('[FileDependencyTracker API] Analyze error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/dependencies/dependents
 * Get all files that depend on a given file
 */
router.post('/dependents', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { filePath } = req.body;

    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'filePath (string) is required'
      });
    }

    const dependents = await dependencyTracker.getDependents(filePath);

    res.json({
      success: true,
      dependents,
      count: dependents.length
    });
  } catch (error: any) {
    console.error('[FileDependencyTracker API] Dependents error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/dependencies/impact
 * Calculate impact of changing a file
 */
router.post('/impact', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { filePath } = req.body;

    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'filePath (string) is required'
      });
    }

    const impact = await dependencyTracker.calculateImpact(filePath);

    res.json({
      success: true,
      impact
    });
  } catch (error: any) {
    console.error('[FileDependencyTracker API] Impact error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/dependencies/graph
 * Build dependency graph for visualization
 */
router.post('/graph', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { rootPath } = req.body;

    if (!rootPath || typeof rootPath !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'rootPath (string) is required'
      });
    }

    const graph = await dependencyTracker.buildGraph(rootPath);

    res.json({
      success: true,
      graph
    });
  } catch (error: any) {
    console.error('[FileDependencyTracker API] Graph error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
