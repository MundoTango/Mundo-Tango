/**
 * JOURNEY RECORDING API ROUTES - PHASE 0C
 * API endpoints for Scott's book journey recording system
 * 
 * Endpoints:
 * - POST   /api/journey/record - Record a new journey entry
 * - GET    /api/journey/entries - Get all entries (with filters)
 * - GET    /api/journey/search - Semantic search entries
 * - GET    /api/journey/timeline - Get timeline of entries
 * - GET    /api/journey/stats - Get journey statistics
 * - GET    /api/journey/chapters - Get book chapters
 * - POST   /api/journey/chapters/suggest - Suggest chapters from entries
 * - POST   /api/journey/chapters/create - Create a book chapter
 * - POST   /api/journey/chapters/auto-generate - Auto-generate all chapters
 * - GET    /api/journey/chapters/:chapterId - Get chapter details
 * - PUT    /api/journey/chapters/:chapterId/status - Update chapter status
 */

import { Router, type Request, type Response } from 'express';
import { journeyRecorder } from '../services/documentation/JourneyRecorder';
import { bookChapterGenerator } from '../services/documentation/BookChapterGenerator';
import { z } from 'zod';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const recordEntrySchema = z.object({
  category: z.enum(['chat', 'code', 'decision', 'bug', 'learning', 'milestone']),
  content: z.string().min(1),
  context: z
    .object({
      page: z.string().optional(),
      feature: z.string().optional(),
      partReference: z.string().optional(),
      filePaths: z.array(z.string()).optional(),
      codeSnippets: z.array(z.string()).optional(),
    })
    .optional(),
  participants: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  significance: z.number().min(1).max(10).optional(),
  emotionalTone: z.string().optional(),
  gitCommitHash: z.string().optional(),
});

const searchEntriesSchema = z.object({
  query: z.string().min(1),
  category: z.enum(['chat', 'code', 'decision', 'bug', 'learning', 'milestone']).optional(),
  tags: z.array(z.string()).optional(),
  minSignificance: z.number().min(1).max(10).optional(),
  limit: z.number().min(1).max(100).optional(),
});

const createChapterSchema = z.object({
  chapterNumber: z.number().min(1),
  title: z.string().min(1).max(255),
  entryIds: z.array(z.string()).min(1),
  description: z.string().optional(),
});

const updateChapterStatusSchema = z.object({
  status: z.enum(['draft', 'in_progress', 'completed']),
});

// ============================================================================
// JOURNEY ENTRY ROUTES
// ============================================================================

/**
 * Record a new journey entry
 * POST /api/journey/record
 */
router.post('/record', async (req: Request, res: Response) => {
  try {
    const data = recordEntrySchema.parse(req.body);

    const result = await journeyRecorder.recordEntry(data);

    if (result.success) {
      res.json({
        success: true,
        entryId: result.entryId,
        message: 'Journey entry recorded successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('[Journey API] Error recording entry:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to record journey entry',
      });
    }
  }
});

/**
 * Get entries by category
 * GET /api/journey/entries?category=chat&limit=50
 */
router.get('/entries', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    let entries;

    if (category) {
      entries = await journeyRecorder.getEntriesByCategory(
        category as any,
        limit
      );
    } else if (tags) {
      entries = await journeyRecorder.getEntriesByTags(tags, limit);
    } else {
      // Get recent entries
      entries = await journeyRecorder.getTimeline(undefined, undefined, limit);
    }

    res.json({
      success: true,
      entries,
      count: entries.length,
    });
  } catch (error) {
    console.error('[Journey API] Error getting entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get journey entries',
    });
  }
});

/**
 * Search entries with semantic search
 * POST /api/journey/search
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const data = searchEntriesSchema.parse(req.body);

    const entries = await journeyRecorder.searchEntries(data.query, {
      category: data.category,
      tags: data.tags,
      minSignificance: data.minSignificance,
      limit: data.limit,
    });

    res.json({
      success: true,
      entries,
      count: entries.length,
    });
  } catch (error) {
    console.error('[Journey API] Error searching entries:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to search journey entries',
      });
    }
  }
});

/**
 * Get timeline of entries
 * GET /api/journey/timeline?startDate=2024-01-01&endDate=2024-12-31&limit=100
 */
router.get('/timeline', async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const entries = await journeyRecorder.getTimeline(startDate, endDate, limit);

    res.json({
      success: true,
      entries,
      count: entries.length,
    });
  } catch (error) {
    console.error('[Journey API] Error getting timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get journey timeline',
    });
  }
});

/**
 * Get journey statistics
 * GET /api/journey/stats
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await journeyRecorder.getStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[Journey API] Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get journey statistics',
    });
  }
});

// ============================================================================
// BOOK CHAPTER ROUTES
// ============================================================================

/**
 * Get all book chapters
 * GET /api/journey/chapters
 */
router.get('/chapters', async (req: Request, res: Response) => {
  try {
    const chapters = await bookChapterGenerator.getAllChapters();

    res.json({
      success: true,
      chapters,
      count: chapters.length,
    });
  } catch (error) {
    console.error('[Journey API] Error getting chapters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get book chapters',
    });
  }
});

/**
 * Suggest chapters from journey entries
 * POST /api/journey/chapters/suggest
 */
router.post('/chapters/suggest', async (req: Request, res: Response) => {
  try {
    const minEntriesPerChapter = req.body.minEntriesPerChapter || 10;
    const maxChapters = req.body.maxChapters || 20;
    const timeBasedClustering = req.body.timeBasedClustering !== false;

    const suggestions = await bookChapterGenerator.suggestChapters({
      minEntriesPerChapter,
      maxChapters,
      timeBasedClustering,
    });

    res.json({
      success: true,
      suggestions,
      count: suggestions.length,
    });
  } catch (error) {
    console.error('[Journey API] Error suggesting chapters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to suggest book chapters',
    });
  }
});

/**
 * Create a book chapter
 * POST /api/journey/chapters/create
 */
router.post('/chapters/create', async (req: Request, res: Response) => {
  try {
    const data = createChapterSchema.parse(req.body);

    const result = await bookChapterGenerator.createChapter(
      data.chapterNumber,
      data.title,
      data.entryIds,
      data.description
    );

    if (result.success) {
      res.json({
        success: true,
        chapterId: result.chapterId,
        message: 'Chapter created successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('[Journey API] Error creating chapter:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create book chapter',
      });
    }
  }
});

/**
 * Auto-generate all chapters
 * POST /api/journey/chapters/auto-generate
 */
router.post('/chapters/auto-generate', async (req: Request, res: Response) => {
  try {
    const result = await bookChapterGenerator.autoGenerateChapters();

    if (result.success) {
      res.json({
        success: true,
        chaptersCreated: result.chaptersCreated,
        message: `Successfully created ${result.chaptersCreated} chapters`,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('[Journey API] Error auto-generating chapters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to auto-generate chapters',
    });
  }
});

/**
 * Get chapter details
 * GET /api/journey/chapters/:chapterId
 */
router.get('/chapters/:chapterId', async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;

    const chapter = await bookChapterGenerator.getChapter(chapterId);

    if (!chapter) {
      res.status(404).json({
        success: false,
        error: 'Chapter not found',
      });
      return;
    }

    // Get entries for this chapter
    const entries = await bookChapterGenerator.getChapterEntries(chapter.title);

    res.json({
      success: true,
      chapter,
      entries,
    });
  } catch (error) {
    console.error('[Journey API] Error getting chapter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chapter details',
    });
  }
});

/**
 * Update chapter status
 * PUT /api/journey/chapters/:chapterId/status
 */
router.put('/chapters/:chapterId/status', async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const data = updateChapterStatusSchema.parse(req.body);

    const success = await bookChapterGenerator.updateChapterStatus(
      chapterId,
      data.status
    );

    if (success) {
      res.json({
        success: true,
        message: 'Chapter status updated successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to update chapter status',
      });
    }
  } catch (error) {
    console.error('[Journey API] Error updating chapter status:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update chapter status',
      });
    }
  }
});

/**
 * Get table of contents
 * GET /api/journey/chapters/toc
 */
router.get('/chapters-toc', async (req: Request, res: Response) => {
  try {
    const toc = await bookChapterGenerator.generateTableOfContents();

    res.json({
      success: true,
      ...toc,
    });
  } catch (error) {
    console.error('[Journey API] Error generating TOC:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate table of contents',
    });
  }
});

// ============================================================================
// CONVENIENCE ENDPOINTS
// ============================================================================

/**
 * Record a conversation (convenience endpoint)
 * POST /api/journey/conversation
 */
router.post('/conversation', async (req: Request, res: Response) => {
  try {
    const { content, context, significance } = req.body;

    const result = await journeyRecorder.recordConversation(
      content,
      context,
      significance
    );

    if (result.success) {
      res.json({
        success: true,
        entryId: result.entryId,
        message: 'Conversation recorded successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('[Journey API] Error recording conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record conversation',
    });
  }
});

/**
 * Record a milestone (convenience endpoint)
 * POST /api/journey/milestone
 */
router.post('/milestone', async (req: Request, res: Response) => {
  try {
    const { milestone, context } = req.body;

    const result = await journeyRecorder.recordMilestone(milestone, context);

    if (result.success) {
      res.json({
        success: true,
        entryId: result.entryId,
        message: 'Milestone recorded successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('[Journey API] Error recording milestone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record milestone',
    });
  }
});

export default router;
