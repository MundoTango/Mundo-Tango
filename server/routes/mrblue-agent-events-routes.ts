/**
 * MR BLUE AGENT EVENT BUS API ROUTES - AGENT #45
 * API endpoints for inter-agent communication and event tracking
 */

import { Router, Request, Response } from 'express';
import { AgentEventBus } from '../services/mrBlue/AgentEventBus';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();
const eventBus = AgentEventBus.getInstance();

/**
 * GET /api/mrblue/events/stream
 * Get recent events (server-sent events alternative)
 */
router.get('/stream', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const events = eventBus.getRecentEvents(limit);

    res.json({
      success: true,
      events,
      count: events.length
    });
  } catch (error: any) {
    console.error('[AgentEventBus API] Stream error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/events/by-agent/:agentId
 * Get events for a specific agent
 */
router.get('/by-agent/:agentId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    const events = eventBus.getEventsByAgent(agentId, limit);

    res.json({
      success: true,
      events,
      count: events.length,
      agentId
    });
  } catch (error: any) {
    console.error('[AgentEventBus API] By agent error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/events/stats
 * Get event bus statistics
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = eventBus.getEventStats();

    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error('[AgentEventBus API] Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/mrblue/events/clear
 * Clear event history (admin only)
 */
router.delete('/clear', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;

    // TODO: Add admin check here if needed
    eventBus.clearHistory();

    res.json({
      success: true,
      message: 'Event history cleared successfully'
    });
  } catch (error: any) {
    console.error('[AgentEventBus API] Clear error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
