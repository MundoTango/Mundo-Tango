import { Router } from 'express';
import { PageAuditService } from '../services/self-healing/PageAuditService';
import { SelfHealingService } from '../services/self-healing/SelfHealingService';
import { AgentActivationService } from '../services/self-healing/AgentActivationService';
import { spawn } from 'child_process';

const router = Router();

/**
 * Replit AI ↔ MB.MD Agent Bridge
 * 
 * Allows Replit AI to trigger Mr. Blue AI actions programmatically
 * MB.MD Protocol v9.2: Enable external AI agents to interact with MT
 * 
 * Example Usage (from Replit AI):
 * curl -X POST https://mundo-tango.replit.app/api/replit-ai/trigger \
 *   -H "Content-Type: application/json" \
 *   -d '{"action": "run_test", "params": {"testFile": "tests/e2e/mr-blue-complete-workflow.spec.ts"}}'
 */

interface TriggerRequest {
  action: 'run_test' | 'audit_page' | 'heal_issues' | 'activate_agents' | 'ask_mrblue';
  params: Record<string, any>;
}

/**
 * Main trigger endpoint
 */
router.post('/trigger', async (req, res) => {
  try {
    const { action, params } = req.body as TriggerRequest;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Action parameter is required',
      });
    }
    
    console.log(`[Replit AI Bridge] Received action: ${action}`, params);
    
    switch (action) {
      case 'run_test':
        return await handleRunTest(req, res, params);
        
      case 'audit_page':
        return await handleAuditPage(req, res, params);
        
      case 'heal_issues':
        return await handleHealIssues(req, res, params);
        
      case 'activate_agents':
        return await handleActivateAgents(req, res, params);
        
      case 'ask_mrblue':
        return await handleAskMrBlue(req, res, params);
        
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`,
        });
    }
  } catch (error) {
    console.error('[Replit AI Bridge] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Action Handler: Run Playwright Test
 */
async function handleRunTest(req: any, res: any, params: any) {
  const { testFile } = params;
  
  if (!testFile) {
    return res.status(400).json({
      success: false,
      error: 'testFile parameter is required',
    });
  }
  
  // Security: Validate test file path
  if (!testFile.startsWith('tests/') && !testFile.startsWith('./tests/')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid test file path. Must be in tests/ directory',
    });
  }
  
  return new Promise((resolve) => {
    const testProcess = spawn('npx', ['playwright', 'test', testFile, '--reporter=json'], {
      cwd: process.cwd(),
    });
    
    let output = '';
    let errorOutput = '';
    
    testProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    testProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    testProcess.on('close', (code) => {
      try {
        const result = JSON.parse(output);
        res.json({
          success: code === 0,
          exitCode: code,
          result,
          error: code !== 0 ? errorOutput : null,
        });
      } catch (error) {
        res.json({
          success: false,
          exitCode: code,
          output,
          error: errorOutput || 'Failed to parse test results',
        });
      }
      resolve(null);
    });
  });
}

/**
 * Action Handler: Audit Page
 */
async function handleAuditPage(req: any, res: any, params: any) {
  const { pageId, url } = params;
  
  if (!pageId && !url) {
    return res.status(400).json({
      success: false,
      error: 'pageId or url parameter is required',
    });
  }
  
  const auditPageId = pageId || url;
  
  try {
    const auditResult = await PageAuditService.runComprehensiveAudit(auditPageId);
    
    return res.json({
      success: true,
      result: auditResult,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Audit failed',
    });
  }
}

/**
 * Action Handler: Heal Issues
 */
async function handleHealIssues(req: any, res: any, params: any) {
  const { pageId, issues } = params;
  
  if (!pageId) {
    return res.status(400).json({
      success: false,
      error: 'pageId parameter is required',
    });
  }
  
  try {
    const healingResult = await SelfHealingService.healPage(pageId, issues);
    
    return res.json({
      success: true,
      result: healingResult,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Healing failed',
    });
  }
}

/**
 * Action Handler: Activate Agents
 */
async function handleActivateAgents(req: any, res: any, params: any) {
  const { pageId } = params;
  
  if (!pageId) {
    return res.status(400).json({
      success: false,
      error: 'pageId parameter is required',
    });
  }
  
  try {
    const activationResult = await AgentActivationService.activateAgentsForPage(pageId);
    
    return res.json({
      success: true,
      result: activationResult,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Agent activation failed',
    });
  }
}

/**
 * Action Handler: Ask Mr. Blue
 * Allows Replit AI to send messages to Mr. Blue AI and get responses
 * Fully integrated with ConversationOrchestrator
 */
async function handleAskMrBlue(req: any, res: any, params: any) {
  const { message, context, userId = 1, streaming = false } = params;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'message parameter is required',
    });
  }
  
  try {
    const { ConversationOrchestrator } = await import('../services/ConversationOrchestrator');
    const orchestrator = new ConversationOrchestrator();
    
    // Classify intent
    const intent = await orchestrator.classifyIntent(message);
    
    console.log(`[Replit AI Bridge] Intent: ${intent.type} (${intent.confidence})`);
    
    // Route to appropriate handler
    let response: any;
    
    if (intent.type === 'question') {
      // Handle question - no code generation
      const enriched = await orchestrator.enrichWithContext(message);
      const questionResponse = await orchestrator.handleQuestion(message, enriched);
      
      response = {
        mode: 'question',
        intent: intent.type,
        confidence: intent.confidence,
        answer: questionResponse.response,
        sources: questionResponse.sources,
        context: {
          ...context,
          contextChunks: enriched.contextChunks.length,
        },
      };
    } else if (intent.type === 'action') {
      // Handle action - trigger VibeCoding
      const actionContext = {
        currentPage: context?.currentPage || 'unknown',
        pageTitle: context?.pageTitle || 'Unknown Page',
        targetFiles: context?.targetFiles || [],
        domSnapshot: context?.domSnapshot,
      };
      
      const actionResponse = await orchestrator.handleActionRequest(message, actionContext, userId);
      response = {
        mode: 'action',
        intent: intent.type,
        confidence: intent.confidence,
        requiresApproval: actionResponse.requiresApproval,
        vibecodingResult: actionResponse.vibecodingResult,
        context,
      };
    } else if (intent.type === 'page_analysis') {
      // Handle page analysis - trigger self-healing
      const pageId = context?.pageId || context?.currentPage || 'home';
      const autoHeal = context?.autoHeal !== false; // Default true
      
      const analysisResponse = await orchestrator.analyzePage(pageId, autoHeal);
      response = {
        mode: 'page_analysis',
        intent: intent.type,
        confidence: intent.confidence,
        pageId: analysisResponse.pageId,
        activation: analysisResponse.activation,
        audit: analysisResponse.audit,
        healing: analysisResponse.healing,
        totalTime: analysisResponse.totalTime,
        context,
      };
    } else {
      // Unknown intent - default to question handling
      response = {
        mode: 'unknown',
        intent: intent.type,
        confidence: intent.confidence,
        message: 'Intent unclear - please rephrase your request',
        context,
      };
    }
    
    return res.json({
      success: true,
      result: response,
    });
  } catch (error) {
    console.error('[Replit AI Bridge] Error in handleAskMrBlue:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process message',
    });
  }
}

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    endpoints: [
      'POST /api/replit-ai/trigger - Main trigger endpoint',
      'GET /api/replit-ai/health - Health check',
    ],
  });
});

export default router;
