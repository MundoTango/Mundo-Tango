/**
 * AI Collaboration Routes
 * 
 * MB.MD v9.3: Hierarchical Execution API
 * Exposes AI collaboration endpoints for Replit AI ↔ Mr Blue communication
 */

import { Router, Request, Response } from 'express';
import { aiCollaborationService } from '../services/mrBlue/AICollaborationService';

const router = Router();

/**
 * POST /api/ai-collaboration/start
 * Start a new AI collaboration session
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { request } = req.body;
    
    if (!request || typeof request !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Request string is required'
      });
    }
    
    console.log(`[AICollaboration] Starting session for: "${request}"`);
    
    const session = await aiCollaborationService.startSession(request);
    
    res.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        currentPhase: session.currentPhase,
        messages: session.messages,
        tasks: session.tasks
      }
    });
  } catch (error: any) {
    console.error('[AICollaboration] Error starting session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai-collaboration/:sessionId/execute
 * Execute parallel tasks for a session
 */
router.post('/:sessionId/execute', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    console.log(`[AICollaboration] Executing parallel tasks for session: ${sessionId}`);
    
    const session = await aiCollaborationService.executeParallelTasks(sessionId);
    
    res.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        currentPhase: session.currentPhase,
        messages: session.messages,
        tasks: session.tasks,
        results: session.results
      }
    });
  } catch (error: any) {
    console.error('[AICollaboration] Error executing tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ai-collaboration/:sessionId
 * Get session details
 */
router.get('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const session = aiCollaborationService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        currentPhase: session.currentPhase,
        messages: session.messages,
        tasks: session.tasks,
        results: session.results
      }
    });
  } catch (error: any) {
    console.error('[AICollaboration] Error getting session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ai-collaboration/active
 * Get all active sessions
 */
router.get('/sessions/active', async (_req: Request, res: Response) => {
  try {
    const sessions = aiCollaborationService.getActiveSessions();
    
    res.json({
      success: true,
      sessions: sessions.map(s => ({
        id: s.id,
        status: s.status,
        currentPhase: s.currentPhase,
        taskCount: s.tasks.length,
        startedAt: s.startedAt
      }))
    });
  } catch (error: any) {
    console.error('[AICollaboration] Error getting active sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
