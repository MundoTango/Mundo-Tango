/**
 * Backend Save API - POST /api/mrblue/save-backend
 * MB.MD v9.3 - Backend Agent System
 * 
 * Purpose: Process all backend work when "Save" button is clicked
 * - Coordinate backend agents
 * - Show progress updates
 * - Auto-commit to git
 * - Restart workflow
 */

import { Router } from 'express';
import { backendOrchestrator } from '../../services/mrBlue/BackendOrchestrator';
import { sessionTracker } from '../../services/mrBlue/SessionTracker';
import type { BackendSaveProgress } from '../../services/mrBlue/BackendOrchestrator';

const router = Router();

/**
 * POST /api/mrblue/save-backend
 * Process all backend changes for a conversation
 * 
 * Request body:
 * {
 *   conversationId: number
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   filesModified: string[]
 *   agentsUsed: string[]
 *   commitHash?: string
 *   errors: string[]
 *   duration: number
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { conversationId } = req.body;
    
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'conversationId is required',
      });
    }
    
    console.log(`[save-backend] 💾 Processing backend save for conversation ${conversationId}`);
    
    // Check if there are changes to save
    const hasChanges = sessionTracker.hasUnsavedChanges(conversationId);
    if (!hasChanges) {
      return res.json({
        success: true,
        filesModified: [],
        agentsUsed: [],
        errors: [],
        duration: 0,
        message: 'No changes to save',
      });
    }
    
    // Process backend changes
    const result = await backendOrchestrator.processBackendChanges(conversationId);
    
    return res.json(result);
    
  } catch (error) {
    console.error('[save-backend] ❌ Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/mrblue/save-backend/status/:conversationId
 * Get save button status (enabled/disabled, tooltip)
 * 🔥 MB.MD v9.4: Fixed to use path param instead of query param
 * 
 * Response:
 * {
 *   enabled: boolean
 *   tooltip: string
 *   changeCount: number
 *   filesModified: number
 * }
 */
router.get('/status/:conversationId', (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    
    if (!conversationId || isNaN(conversationId)) {
      return res.status(400).json({
        success: false,
        error: 'conversationId is required and must be a number',
      });
    }
    
    const hasChanges = sessionTracker.hasUnsavedChanges(conversationId);
    const summary = sessionTracker.getChangeSummary(conversationId);
    const sessionState = sessionTracker.getSessionState(conversationId);
    
    return res.json({
      enabled: hasChanges,
      tooltip: summary,
      changeCount: sessionState?.totalChanges || 0,
      filesModified: sessionState?.filesModified.size || 0,
    });
    
  } catch (error) {
    console.error('[save-backend] ❌ Error getting status:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
