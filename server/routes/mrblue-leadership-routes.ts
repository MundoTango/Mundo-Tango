/**
 * Leadership Agents API Routes
 * 
 * Provides endpoints to interact with leadership agents (CTO, CEO, VPs, Heads)
 * These agents have real-world job knowledge, Mundo Tango expertise, and continuous learning.
 */

import { Router } from 'express';
import { 
  getLeadershipAgent, 
  getAllLeadershipAgents, 
  routeToLeadershipAgent,
  initializeLeadershipAgents 
} from '../services/mrblue/agents/leadership';

const router = Router();

/**
 * GET /api/mrblue/leadership/agents
 * List all available leadership agents
 */
router.get('/agents', async (req, res) => {
  try {
    const agents = getAllLeadershipAgents();
    
    const agentList = await Promise.all(agents.map(async (agent) => {
      const knowledge = await agent.loadKnowledge();
      return {
        id: agent.getId(),
        name: agent.getName(),
        role: agent.getRole(),
        reportsTo: agent.getReportsTo(),
        directReports: agent.getDirectReports(),
        knowledgeSources: knowledge.realWorld.length,
        learnedExperiences: knowledge.learnedExperiences.length,
        godCommands: knowledge.godCommands.length,
      };
    }));

    res.json({
      success: true,
      agents: agentList,
      total: agentList.length,
    });
  } catch (error: any) {
    console.error('[LeadershipRoutes] Error listing agents:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/mrblue/leadership/agent/:id
 * Get details for a specific leadership agent
 */
router.get('/agent/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const agent = getLeadershipAgent(id);

    if (!agent) {
      return res.status(404).json({ 
        success: false, 
        error: `Agent ${id} not found` 
      });
    }

    const knowledge = await agent.loadKnowledge();
    const context = await agent.getDecisionContext();

    res.json({
      success: true,
      agent: {
        id: agent.getId(),
        name: agent.getName(),
        role: agent.getRole(),
        reportsTo: agent.getReportsTo(),
        directReports: agent.getDirectReports(),
        knowledge: {
          realWorld: knowledge.realWorld,
          mundoTango: knowledge.mundoTango,
          learnedExperiences: knowledge.learnedExperiences,
          godCommands: knowledge.godCommands,
        },
      },
      context,
    });
  } catch (error: any) {
    console.error('[LeadershipRoutes] Error getting agent:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/mrblue/leadership/advise
 * Ask a leadership agent for advice
 */
router.post('/advise', async (req, res) => {
  try {
    const { agentId, question } = req.body;

    if (!agentId || !question) {
      return res.status(400).json({ 
        success: false, 
        error: 'agentId and question are required' 
      });
    }

    const agent = getLeadershipAgent(agentId);

    if (!agent) {
      return res.status(404).json({ 
        success: false, 
        error: `Agent ${agentId} not found` 
      });
    }

    console.log(`[LeadershipRoutes] ${agent.getName()} advising on: ${question}`);

    const advice = await agent.advise(question);

    res.json({
      success: true,
      agentId,
      agentName: agent.getName(),
      agentRole: agent.getRole(),
      question,
      advice,
    });
  } catch (error: any) {
    console.error('[LeadershipRoutes] Error getting advice:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/mrblue/leadership/route
 * Route a task to the appropriate leadership agent
 */
router.post('/route', async (req, res) => {
  try {
    const { task, priority } = req.body;

    if (!task) {
      return res.status(400).json({ 
        success: false, 
        error: 'task is required' 
      });
    }

    const result = await routeToLeadershipAgent(task, priority || 'normal');

    if (!result) {
      return res.json({
        success: false,
        message: 'No suitable leadership agent found for this task',
        suggestion: 'Try rephrasing the task or use a specific agent endpoint',
      });
    }

    res.json({
      success: true,
      routedTo: {
        id: result.agent.getId(),
        name: result.agent.getName(),
        role: result.agent.getRole(),
        confidence: result.confidence,
        reason: result.reason,
      },
    });
  } catch (error: any) {
    console.error('[LeadershipRoutes] Error routing task:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/mrblue/leadership/learn
 * Add a learning entry to an agent's memory
 */
router.post('/learn', async (req, res) => {
  try {
    const { agentId, type, content, impact } = req.body;

    if (!agentId || !type || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'agentId, type, and content are required' 
      });
    }

    const agent = getLeadershipAgent(agentId);

    if (!agent) {
      return res.status(404).json({ 
        success: false, 
        error: `Agent ${agentId} not found` 
      });
    }

    await agent.learn({
      type,
      content,
      impact: impact || 'medium',
    });

    res.json({
      success: true,
      message: `Learning added to ${agent.getName()}`,
      agentId,
    });
  } catch (error: any) {
    console.error('[LeadershipRoutes] Error adding learning:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/mrblue/leadership/initialize
 * Re-initialize all leadership agents (reload knowledge)
 */
router.post('/initialize', async (req, res) => {
  try {
    await initializeLeadershipAgents();

    const agents = getAllLeadershipAgents();

    res.json({
      success: true,
      message: 'Leadership agents initialized',
      agentCount: agents.length,
      agents: agents.map(a => ({
        id: a.getId(),
        name: a.getName(),
        role: a.getRole(),
      })),
    });
  } catch (error: any) {
    console.error('[LeadershipRoutes] Error initializing agents:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
