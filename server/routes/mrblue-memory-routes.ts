/**
 * MR BLUE MEMORY API ROUTES - SYSTEM 8
 * API endpoints for managing user memories, preferences, and conversation summaries
 */

import { Router, Request, Response } from 'express';
import { memoryService } from '../services/mrBlue/MemoryService';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { db } from '../db';
import { userMemories, conversationSummaries, userPreferences } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

/**
 * POST /api/mrblue/memory/store
 * Store a new memory with embeddings
 */
router.post('/store', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { content, memoryType, importance, metadata } = req.body;

    if (!content || !memoryType) {
      return res.status(400).json({
        success: false,
        error: 'Content and memoryType are required'
      });
    }

    const result = await memoryService.storeMemory(
      userId!,
      content,
      memoryType,
      { importance, metadata }
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error('[Memory API] Store error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/memory/search
 * Semantic search across memories
 */
router.post('/search', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { query, limit = 5, memoryTypes, minSimilarity = 0.7 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const results = await memoryService.retrieveMemories(
      userId!,
      query,
      { limit, memoryTypes, minSimilarity }
    );

    res.json({
      success: true,
      results,
      count: results.length
    });
  } catch (error: any) {
    console.error('[Memory API] Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/memory/recent
 * Get recent conversations for a user
 */
router.get('/recent', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const limit = parseInt(req.query.limit as string) || 10;

    const conversations = await memoryService.getRecentConversations(userId!, limit);

    res.json({
      success: true,
      conversations,
      count: conversations.length
    });
  } catch (error: any) {
    console.error('[Memory API] Recent conversations error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/memory/preferences
 * Get user preferences
 */
router.get('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    const preferences = await memoryService.getUserPreferences(userId!);

    res.json({
      success: true,
      preferences,
      count: preferences.length
    });
  } catch (error: any) {
    console.error('[Memory API] Get preferences error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/memory/summarize
 * Summarize a conversation
 */
router.post('/summarize', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { messages, conversationId } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required'
      });
    }

    const result = await memoryService.summarizeConversation(
      userId!,
      messages,
      conversationId
    );

    res.json(result);
  } catch (error: any) {
    console.error('[Memory API] Summarize error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mrblue/memory/extract-preferences
 * Extract preferences from conversation
 */
router.post('/extract-preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { conversation } = req.body;

    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Conversation array is required'
      });
    }

    const preferences = await memoryService.extractPreferences(userId!, conversation);

    res.json({
      success: true,
      preferences,
      count: preferences.length
    });
  } catch (error: any) {
    console.error('[Memory API] Extract preferences error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/mrblue/memory/:id
 * Delete a specific memory (GDPR compliance)
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const { id } = req.params;

    const result = await memoryService.forgetMemory(id);

    res.json(result);
  } catch (error: any) {
    console.error('[Memory API] Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/memory/stats
 * Get memory statistics for a user
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    const stats = await memoryService.getMemoryStats(userId!);

    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error('[Memory API] Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/memory/export
 * Export all memories for a user (GDPR compliance)
 */
router.get('/export', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    // Get all memories
    const allMemories = await memoryService.retrieveMemories(
      userId!,
      'all user data export',
      { limit: 10000, minSimilarity: 0 }
    );

    // Get preferences
    const preferences = await memoryService.getUserPreferences(userId!);

    // Get conversation summaries from database
    const summaries = await db
      .select()
      .from(conversationSummaries)
      .where(eq(conversationSummaries.userId, userId!))
      .orderBy(desc(conversationSummaries.createdAt));

    const exportData = {
      exportDate: new Date().toISOString(),
      userId: userId,
      memories: allMemories,
      preferences: preferences,
      conversationSummaries: summaries,
      totalMemories: allMemories.length,
      totalPreferences: preferences.length,
      totalSummaries: summaries.length
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=mr-blue-memories-${userId}-${Date.now()}.json`);
    res.json(exportData);
  } catch (error: any) {
    console.error('[Memory API] Export error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/mrblue/memory/all
 * Delete all memories for a user (GDPR compliance - right to be forgotten)
 */
router.delete('/all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    // Delete from database tables
    await db.delete(userMemories).where(eq(userMemories.userId, userId!));
    await db.delete(conversationSummaries).where(eq(conversationSummaries.userId, userId!));
    await db.delete(userPreferences).where(eq(userPreferences.userId, userId!));

    // Note: LanceDB memories are marked as deleted in the service
    console.log(`[Memory API] Deleted all memories for user ${userId}`);

    res.json({
      success: true,
      message: 'All memories deleted successfully'
    });
  } catch (error: any) {
    console.error('[Memory API] Delete all error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
