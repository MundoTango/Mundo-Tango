/**
 * MR BLUE CONTEXT API ROUTES
 * RESTful API for Mr Blue System 1: Context System
 * 
 * Week 1, Day 1 Implementation - MB.MD v7.1
 */

import { Router, Request, Response } from 'express';
import { contextService } from '../services/mrBlue/ContextService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { requireGodLevel } from '../middleware/requireGodLevel';

const router = Router();

/**
 * GET /api/mrblue/context/status
 * Get context system status and statistics
 */
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const [stats, indexingStatus, initStatus] = await Promise.all([
      contextService.getStats(),
      Promise.resolve(contextService.getIndexingStatus()),
      contextService.initialize()
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        ...indexingStatus,
        initialized: initStatus.indexed,
        ready: stats.isIndexed && !indexingStatus.isIndexing
      }
    });
  } catch (error: any) {
    console.error('[API] Context status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get context status',
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/context/search
 * Search documentation with semantic similarity
 * 
 * Body: { query: string, limit?: number, filters?: { fileType?: string } }
 */
router.post('/search', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { query, limit = 5, filters } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query is required and must be a string'
      });
    }

    const startTime = Date.now();
    const results = await contextService.search(query, limit, filters);
    const searchTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        results,
        query,
        limit,
        resultsCount: results.length,
        searchTimeMs: searchTime
      }
    });
  } catch (error: any) {
    console.error('[API] Context search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/context/multi-search
 * Multi-query semantic search for complex questions
 * 
 * Body: { queries: string[], limitPerQuery?: number }
 */
router.post('/multi-search', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { queries, limitPerQuery = 3 } = req.body;

    if (!Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Queries must be a non-empty array of strings'
      });
    }

    const startTime = Date.now();
    const results = await contextService.multiSearch(queries, limitPerQuery);
    const searchTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        results,
        queries,
        resultsCount: results.length,
        searchTimeMs: searchTime
      }
    });
  } catch (error: any) {
    console.error('[API] Multi-search error:', error);
    res.status(500).json({
      success: false,
      message: 'Multi-search failed',
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/context/index
 * Start documentation indexing (God Level only)
 * This is a long-running operation
 */
router.post('/index', authenticateToken, requireGodLevel(), async (req: AuthRequest, res: Response) => {
  try {
    const indexingStatus = contextService.getIndexingStatus();

    if (indexingStatus.isIndexing) {
      return res.status(409).json({
        success: false,
        message: 'Indexing already in progress',
        data: indexingStatus
      });
    }

    // Start indexing in background (don't await)
    contextService.indexDocumentation().then(result => {
      if (result.success) {
        console.log(`[API] ✅ Indexing complete: ${result.chunksIndexed} chunks`);
      } else {
        console.error('[API] ❌ Indexing failed:', result.errors);
      }
    });

    res.json({
      success: true,
      message: 'Indexing started',
      data: {
        isIndexing: true,
        progress: 0
      }
    });
  } catch (error: any) {
    console.error('[API] Index start error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start indexing',
      error: error.message
    });
  }
});

/**
 * DELETE /api/mrblue/context/index
 * Clear index (God Level only - for re-indexing)
 */
router.delete('/index', authenticateToken, requireGodLevel(), async (req: AuthRequest, res: Response) => {
  try {
    await contextService.clearIndex();

    res.json({
      success: true,
      message: 'Index cleared successfully'
    });
  } catch (error: any) {
    console.error('[API] Clear index error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear index',
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/context/indexing-progress
 * Get real-time indexing progress (for UI polling)
 */
router.get('/indexing-progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const status = contextService.getIndexingStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    console.error('[API] Indexing progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get indexing progress',
      error: error.message
    });
  }
});

export default router;
