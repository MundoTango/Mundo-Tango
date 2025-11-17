/**
 * Agent Rollup Routes - API endpoints for Agent Intelligence Rollup
 * 
 * Endpoints:
 * - POST /api/agent-rollup/trigger - Manually trigger knowledge rollup
 * - GET /api/agent-rollup/status - Get rollup service status
 * - GET /api/agent-rollup/stats - Get intelligence base statistics
 * - GET /api/agent-rollup/agents - Get agent snapshots
 * - GET /api/agent-rollup/knowledge - Search knowledge base
 * - GET /api/agent-rollup/patterns - Get detected patterns
 * - GET /api/agent-rollup/conflicts - Get detected conflicts
 */

import { Router, Request, Response } from 'express';
import { agentKnowledgeSync } from '../services/intelligence/AgentKnowledgeSync';
import { intelligenceBase } from '../services/intelligence/MBMDIntelligenceBase';

const router = Router();

// ============================================================================
// 1. TRIGGER ROLLUP
// ============================================================================

/**
 * POST /api/agent-rollup/trigger
 * Manually trigger a knowledge rollup across all agents
 */
router.post('/trigger', async (req: Request, res: Response) => {
  try {
    console.log('[AgentRollup] Manual rollup triggered');
    
    const trigger = {
      type: 'manual' as const,
      source: req.body.source || 'api',
      metadata: req.body.metadata || {},
    };

    // Initialize services if needed
    try {
      await agentKnowledgeSync.initialize();
    } catch (error) {
      // Already initialized, continue
    }

    // Trigger rollup
    const result = await agentKnowledgeSync.triggerRollup(trigger);

    res.json({
      success: true,
      result,
      message: 'Knowledge rollup completed successfully',
    });
  } catch (error: any) {
    console.error('[AgentRollup] Rollup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to trigger rollup',
    });
  }
});

/**
 * POST /api/agent-rollup/trigger/discovery
 * Trigger rollup on new information discovery
 */
router.post('/trigger/discovery', async (req: Request, res: Response) => {
  try {
    const { agentId, discovery, metadata } = req.body;
    
    if (!agentId || !discovery) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentId, discovery',
      });
    }

    const trigger = {
      type: 'discovery' as const,
      source: agentId,
      metadata: {
        ...metadata,
        discovery,
        triggeredAt: new Date().toISOString(),
      },
    };

    const result = await agentKnowledgeSync.triggerRollup(trigger);

    res.json({
      success: true,
      result,
      message: 'Discovery rollup completed',
    });
  } catch (error: any) {
    console.error('[AgentRollup] Discovery rollup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/agent-rollup/trigger/page-completion
 * Trigger rollup on page completion
 */
router.post('/trigger/page-completion', async (req: Request, res: Response) => {
  try {
    const { page, userId, metadata } = req.body;
    
    if (!page) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: page',
      });
    }

    const trigger = {
      type: 'page_completion' as const,
      source: `page:${page}`,
      metadata: {
        ...metadata,
        page,
        userId,
        completedAt: new Date().toISOString(),
      },
    };

    const result = await agentKnowledgeSync.triggerRollup(trigger);

    res.json({
      success: true,
      result,
      message: 'Page completion rollup completed',
    });
  } catch (error: any) {
    console.error('[AgentRollup] Page completion rollup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/agent-rollup/trigger/critical-event
 * Trigger rollup on critical event
 */
router.post('/trigger/critical-event', async (req: Request, res: Response) => {
  try {
    const { event, severity, metadata } = req.body;
    
    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: event',
      });
    }

    const trigger = {
      type: 'critical_event' as const,
      source: `event:${event}`,
      metadata: {
        ...metadata,
        event,
        severity: severity || 'high',
        triggeredAt: new Date().toISOString(),
      },
    };

    const result = await agentKnowledgeSync.triggerRollup(trigger);

    res.json({
      success: true,
      result,
      message: 'Critical event rollup completed',
    });
  } catch (error: any) {
    console.error('[AgentRollup] Critical event rollup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// 2. STATUS & MONITORING
// ============================================================================

/**
 * GET /api/agent-rollup/status
 * Get current status of rollup service
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = agentKnowledgeSync.getStatus();

    res.json({
      success: true,
      status: {
        ...status,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[AgentRollup] Failed to get status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agent-rollup/stats
 * Get intelligence base statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await intelligenceBase.getStatistics();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AgentRollup] Failed to get stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agent-rollup/agents
 * Get snapshots of all agents
 */
router.get('/agents', async (req: Request, res: Response) => {
  try {
    const snapshots = await agentKnowledgeSync.getAgentSnapshots();

    res.json({
      success: true,
      agents: snapshots,
      count: snapshots.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AgentRollup] Failed to get agent snapshots:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// 3. KNOWLEDGE QUERIES
// ============================================================================

/**
 * GET /api/agent-rollup/knowledge
 * Search knowledge base
 */
router.get('/knowledge', async (req: Request, res: Response) => {
  try {
    const {
      query,
      agentId,
      agentType,
      category,
      minConfidence,
      limit,
    } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameter: query',
      });
    }

    const options = {
      agentId: agentId as string | undefined,
      agentType: agentType as string | undefined,
      category: category as string | undefined,
      minConfidence: minConfidence ? parseFloat(minConfidence as string) : undefined,
      limit: limit ? parseInt(limit as string) : 10,
    };

    const results = await intelligenceBase.searchKnowledge(query as string, options);

    res.json({
      success: true,
      results,
      count: results.length,
      query: query as string,
      options,
    });
  } catch (error: any) {
    console.error('[AgentRollup] Knowledge search failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agent-rollup/knowledge/:agentId
 * Get all knowledge from a specific agent
 */
router.get('/knowledge/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const knowledge = await intelligenceBase.getAgentKnowledge(agentId);

    res.json({
      success: true,
      agentId,
      knowledge,
      count: knowledge.length,
    });
  } catch (error: any) {
    console.error('[AgentRollup] Failed to get agent knowledge:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agent-rollup/knowledge/category/:category
 * Get knowledge by category
 */
router.get('/knowledge/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const knowledge = await intelligenceBase.getKnowledgeByCategory(category);

    res.json({
      success: true,
      category,
      knowledge,
      count: knowledge.length,
    });
  } catch (error: any) {
    console.error('[AgentRollup] Failed to get category knowledge:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// 4. PATTERN DETECTION
// ============================================================================

/**
 * GET /api/agent-rollup/patterns
 * Get detected cross-agent patterns
 */
router.get('/patterns', async (req: Request, res: Response) => {
  try {
    const patterns = await intelligenceBase.detectCrossAgentPatterns();

    res.json({
      success: true,
      patterns,
      count: patterns.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AgentRollup] Pattern detection failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// 5. CONFLICT DETECTION
// ============================================================================

/**
 * GET /api/agent-rollup/conflicts
 * Get detected knowledge conflicts
 */
router.get('/conflicts', async (req: Request, res: Response) => {
  try {
    const conflicts = await intelligenceBase.detectConflicts();

    res.json({
      success: true,
      conflicts,
      count: conflicts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AgentRollup] Conflict detection failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// 6. ADMIN OPERATIONS
// ============================================================================

/**
 * POST /api/agent-rollup/admin/clear
 * Clear all knowledge (admin only)
 */
router.post('/admin/clear', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin authentication check here
    
    const { confirm } = req.body;
    
    if (confirm !== 'CLEAR_ALL_KNOWLEDGE') {
      return res.status(400).json({
        success: false,
        error: 'Missing confirmation. Send { confirm: "CLEAR_ALL_KNOWLEDGE" }',
      });
    }

    await intelligenceBase.clearAllKnowledge();

    res.json({
      success: true,
      message: 'All knowledge has been cleared',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AgentRollup] Failed to clear knowledge:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agent-rollup/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const stats = await intelligenceBase.getStatistics();
    const status = agentKnowledgeSync.getStatus();

    res.json({
      success: true,
      health: 'ok',
      services: {
        intelligenceBase: stats.totalEntries > 0 ? 'operational' : 'initialized',
        knowledgeSync: status.isRollupInProgress ? 'processing' : 'ready',
      },
      lastRollup: status.lastRollupTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      health: 'degraded',
      error: error.message,
    });
  }
});

export default router;
