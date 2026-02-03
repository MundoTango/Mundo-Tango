/**
 * Agent Activation API
 * POST /api/mrblue/activate-agents
 * 
 * MB.MD v9.2: Called by navigationInterceptor on route changes
 * Activates contextually-aware agents BEFORE user makes requests
 */

import { Router, type Request, Response } from 'express';
import { agentLifecycle, type AgentActivationResult } from '../../services/AgentLifecycle';

const router = Router();

/**
 * Activate agents for a route
 * POST /api/mrblue/activate-agents
 * 
 * Request body:
 * {
 *   route: string,          // Current route (e.g., "/", "/visual-editor")
 *   context?: any           // Optional context (selected element, etc.)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   result: AgentActivationResult
 * }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { route, context } = req.body;

    if (!route) {
      return res.status(400).json({
        success: false,
        error: 'Route is required'
      });
    }

    console.log(`[API] 🔄 Agent activation request for route: ${route}`);

    // Activate agents for this route
    const result = await agentLifecycle.activateAgentsForRoute(route);

    console.log(`[API] ✅ Activated ${result.activatedAgents.length} agents in ${result.activationTime}ms`);

    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('[API] ❌ Agent activation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Agent activation failed'
    });
  }
});

/**
 * Get currently active agents
 * GET /api/mrblue/activate-agents
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const stats = agentLifecycle.getStats();
    const activeAgentsInfo = agentLifecycle.getActiveAgentsInfo();

    res.json({
      success: true,
      stats,
      activeAgents: activeAgentsInfo.map(info => ({
        id: info.agent.getId(),
        name: info.agent.getName(),
        domain: info.agent.getDomain(),
        route: info.route,
        state: info.state,
        activatedAt: info.activatedAt,
      }))
    });
  } catch (error: any) {
    console.error('[API] ❌ Failed to get active agents:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get active agents'
    });
  }
});

export default router;
