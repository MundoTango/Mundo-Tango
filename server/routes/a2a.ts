/**
 * A2A PROTOCOL ROUTES
 * Machine-to-machine agent communication API
 * JSON-RPC 2.0 compliant
 * 
 * MB.MD Protocol v9.2 - Phase 6A
 * Created: Nov 20, 2025
 */

import { Router, type Request, type Response } from 'express';
import { a2aProtocolService } from '../services/orchestration/A2AProtocolService';
import { agentCardRegistry } from '../services/orchestration/AgentCardRegistry';
import type { A2AMessage } from '../../shared/types/a2a';

const router = Router();

/**
 * POST /api/a2a/route
 * Route JSON-RPC message to target agent
 * Query param: agent_id (e.g., life-ceo-career-coach)
 */
router.post('/route', async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agent_id as string;
    
    if (!agentId) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: req.body.id || null,
        error: {
          code: -32602,
          message: 'Missing agent_id query parameter'
        }
      });
    }

    const message: A2AMessage = req.body;

    console.log(`[A2A] 📨 Routing message to agent: ${agentId}, method: ${message.method}`);

    const result = await a2aProtocolService.routeMessage(agentId, message);

    // Always return JSON-RPC response
    res.json(result);
  } catch (error: any) {
    console.error('[A2A] ❌ Message routing failed:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id || null,
      error: {
        code: -32603,
        message: error.message || 'Internal error'
      }
    });
  }
});

/**
 * POST /api/a2a/:agentId
 * Alternative route format with agent ID in path
 */
router.post('/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const message: A2AMessage = req.body;

    console.log(`[A2A] 📨 Routing message to agent: ${agentId}, method: ${message.method}`);

    const result = await a2aProtocolService.routeMessage(agentId, message);

    res.json(result);
  } catch (error: any) {
    console.error('[A2A] ❌ Message routing failed:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id || null,
      error: {
        code: -32603,
        message: error.message || 'Internal error'
      }
    });
  }
});

/**
 * GET /api/a2a/agents
 * Get all registered agent cards
 */
router.get('/agents', (_req: Request, res: Response) => {
  try {
    const agents = agentCardRegistry.getAllAgents();

    console.log(`[A2A] 📋 Returning ${agents.length} registered agents`);

    res.json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (error: any) {
    console.error('[A2A] ❌ Failed to get agents:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/a2a/agents/search
 * Search agents by capability, method, or query
 */
router.get('/agents/search', (req: Request, res: Response) => {
  try {
    const { capability, method, query } = req.query;

    let agents;
    if (capability) {
      agents = agentCardRegistry.discoverAgentsByCapability(capability as string);
    } else if (method) {
      agents = agentCardRegistry.discoverAgentsByMethod(method as any);
    } else if (query) {
      agents = agentCardRegistry.searchAgents(query as string);
    } else {
      agents = agentCardRegistry.getAllAgents();
    }

    res.json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (error: any) {
    console.error('[A2A] ❌ Agent search failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
