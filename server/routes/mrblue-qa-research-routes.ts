/**
 * Mr. Blue Q&A Research Routes
 * 
 * API endpoints for the autonomous agent Q&A research system.
 * Enables Mr. Blue to conduct research across the agent hierarchy,
 * generate test plans, and orchestrate feature testing.
 */

import { Router, Request, Response } from 'express';
import { mrBlueQAResearch } from '../services/mrblue/MrBlueQAResearch';
import { agentRegistry } from '../services/mrblue/AgentRegistry';
import { FeedPageAgent } from '../services/mrblue/agents/FeedPageAgent';

const router = Router();

/**
 * GET /api/mrblue/qa/ecosystem-health
 * Get overall health of the agent ecosystem
 */
router.get('/ecosystem-health', async (req: Request, res: Response) => {
  try {
    const health = await mrBlueQAResearch.getEcosystemHealth();
    res.json({
      success: true,
      data: health,
    });
  } catch (error: any) {
    console.error('[Mr. Blue Q&A] Ecosystem health error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/mrblue/qa/research
 * Conduct research on a specific topic
 */
router.post('/research', async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required',
      });
    }

    const session = await mrBlueQAResearch.conductResearch(topic);
    res.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('[Mr. Blue Q&A] Research error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/mrblue/qa/ask
 * Ask a specific question to the agent ecosystem
 */
router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required',
      });
    }

    const result = await mrBlueQAResearch.askQuestion(question);
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[Mr. Blue Q&A] Ask error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/mrblue/qa/testable-features
 * Get all testable features across the platform
 */
router.get('/testable-features', async (req: Request, res: Response) => {
  try {
    const features = await mrBlueQAResearch.getTestableFeatures();
    res.json({
      success: true,
      data: features,
    });
  } catch (error: any) {
    console.error('[Mr. Blue Q&A] Testable features error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/mrblue/qa/test-plan/:pageId
 * Generate comprehensive test plan for a page
 */
router.get('/test-plan/:pageId', async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    const testPlan = await mrBlueQAResearch.generatePageTestPlan(pageId);
    res.json({
      success: true,
      data: {
        pageId,
        testPlan,
      },
    });
  } catch (error: any) {
    console.error('[Mr. Blue Q&A] Test plan error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/mrblue/qa/research-history
 * Get history of research sessions
 */
router.get('/research-history', async (req: Request, res: Response) => {
  try {
    const history = mrBlueQAResearch.getResearchHistory();
    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error('[Mr. Blue Q&A] Research history error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/mrblue/qa/page/:pageId/features
 * Get feature agents for a specific page
 */
router.get('/page/:pageId/features', async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    const agent = agentRegistry.getAgent(pageId);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `Page agent not found: ${pageId}`,
      });
    }

    if (agent instanceof FeedPageAgent) {
      const features = agent.getFeatureAgents().map(fa => ({
        featureId: fa.getFeatureId(),
        featureName: fa.getFeatureName(),
        prd: fa.getPRD(),
        health: fa.getHealthStatus(),
      }));

      res.json({
        success: true,
        data: {
          pageId,
          pageName: agent.getName(),
          featureCount: features.length,
          features,
        },
      });
    } else {
      res.json({
        success: true,
        data: {
          pageId,
          pageName: agent.getName(),
          featureCount: 0,
          features: [],
          note: 'This page agent does not have feature agents yet',
        },
      });
    }
  } catch (error: any) {
    console.error('[Mr. Blue Q&A] Page features error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/mrblue/qa/page/:pageId/qa-session
 * Conduct a Q&A session with a page's feature agents
 */
router.post('/page/:pageId/qa-session', async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    const { questions } = req.body;
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Questions array is required',
      });
    }

    const agent = agentRegistry.getAgent(pageId);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `Page agent not found: ${pageId}`,
      });
    }

    if (agent instanceof FeedPageAgent) {
      const session = await agent.conductQASession(questions);
      res.json({
        success: true,
        data: session,
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'This page agent does not support Q&A sessions',
      });
    }
  } catch (error: any) {
    console.error('[Mr. Blue Q&A] Q&A session error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/mrblue/qa/page/:pageId/health
 * Get health status of a page and its feature agents
 */
router.get('/page/:pageId/health', async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    const agent = agentRegistry.getAgent(pageId);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `Page agent not found: ${pageId}`,
      });
    }

    if (agent instanceof FeedPageAgent) {
      const pageHealth = await agent.getHealthReport();
      const featureHealth = agent.getFeatureHealthStatus();

      res.json({
        success: true,
        data: {
          page: pageHealth,
          features: featureHealth,
        },
      });
    } else {
      const pageHealth = await agent.getHealthReport();
      res.json({
        success: true,
        data: {
          page: pageHealth,
          features: null,
        },
      });
    }
  } catch (error: any) {
    console.error('[Mr. Blue Q&A] Page health error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
