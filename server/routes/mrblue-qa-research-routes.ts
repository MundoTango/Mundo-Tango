/**
 * Mr. Blue Q&A Research Routes
 * 
 * API endpoints for the autonomous agent Q&A research system.
 * Enables Mr. Blue to conduct research across the agent hierarchy,
 * generate test plans, and orchestrate feature testing.
 */

import { Router, Request, Response } from 'express';
import { mrBlueQAResearch } from '../services/MrBlueQAResearch';
import { agentRegistry } from '../services/AgentRegistry';
import { agentTestOrchestrator } from '../services/AgentTestOrchestrator';
import { BasePageAgent } from '../services/BasePageAgent';
import { BaseFeatureAgent } from '../services/BaseFeatureAgent';

const router = Router();

interface PageAgentWithFeatures extends BasePageAgent {
  getFeatureAgents(): BaseFeatureAgent[];
  getFeatureHealthStatus?(): { totalFeatures: number; totalTests: number; totalKnownIssues: number };
  conductQASession?(questions: string[]): Promise<any>;
}

function hasFeatureAgents(agent: BasePageAgent): agent is PageAgentWithFeatures {
  return 'getFeatureAgents' in agent && typeof (agent as any).getFeatureAgents === 'function';
}

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
 * POST /api/mrblue/qa/run-all-tests
 * Task all agents to self-test and be critical of their work
 */
router.post('/run-all-tests', async (req: Request, res: Response) => {
  try {
    console.log('[Mr. Blue Q&A] 🚀 Tasking all agents to run tests...');
    const report = await agentTestOrchestrator.taskAllAgentsToTest();
    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('[Mr. Blue Q&A] Run all tests error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/mrblue/qa/last-test-report
 * Get the last test orchestration report
 */
router.get('/last-test-report', async (req: Request, res: Response) => {
  try {
    const report = agentTestOrchestrator.getLastReport();
    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('[Mr. Blue Q&A] Last test report error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/mrblue/qa/generate-playwright/:pageId/:featureId
 * Generate Playwright test code for a specific feature
 */
router.get('/generate-playwright/:pageId/:featureId', async (req: Request, res: Response) => {
  try {
    const { pageId, featureId } = req.params;
    const agent = agentRegistry.getAgent(pageId);
    
    if (!agent || !hasFeatureAgents(agent)) {
      return res.status(404).json({
        success: false,
        error: `Page agent not found or has no features: ${pageId}`,
      });
    }

    const featureAgent = agent.getFeatureAgents().find(fa => fa.getFeatureId() === featureId);
    
    if (!featureAgent) {
      return res.status(404).json({
        success: false,
        error: `Feature agent not found: ${featureId}`,
      });
    }

    const testCode = agentTestOrchestrator.generatePlaywrightTestCode(featureAgent, pageId);
    res.json({
      success: true,
      data: {
        pageId,
        featureId,
        testCode,
        filePath: `tests/e2e/${pageId}/${featureId}.spec.ts`,
      },
    });
  } catch (error: any) {
    console.error('[Mr. Blue Q&A] Generate Playwright error:', error);
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
    const pageData = await mrBlueQAResearch.getPageFeatures(pageId);
    
    if (!pageData) {
      return res.status(404).json({
        success: false,
        error: `Page agent not found or has no features: ${pageId}`,
      });
    }

    res.json({
      success: true,
      data: pageData,
    });
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

    if (hasFeatureAgents(agent) && agent.conductQASession) {
      const session = await agent.conductQASession(questions);
      res.json({
        success: true,
        data: session,
      });
    } else {
      // Fallback: conduct Q&A via the research service
      const results = [];
      for (const question of questions) {
        const result = await mrBlueQAResearch.askQuestion(question);
        results.push(result);
      }
      res.json({
        success: true,
        data: {
          pageId,
          questions: questions.length,
          results,
        },
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

    const pageHealth = await agent.getHealthReport();
    
    if (hasFeatureAgents(agent) && agent.getFeatureHealthStatus) {
      const featureHealth = agent.getFeatureHealthStatus();
      res.json({
        success: true,
        data: {
          page: pageHealth,
          features: featureHealth,
        },
      });
    } else {
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
