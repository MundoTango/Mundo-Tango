/**
 * AGENT LEARNING API ROUTES
 * MB.MD v9.9.3 + Samsung TinyRecursiveModels Integration
 * 
 * Provides REST API for triggering and monitoring agent learning
 * 
 * Core Endpoints:
 * - POST /execute - Record an agent execution for learning
 * - POST /cycle/:agentId - Trigger learning cycle for an agent
 * - GET /baseline/:agentId - Get performance baseline for an agent
 * - POST /evaluate/:agentId - Run self-evaluation for an agent
 * - GET /patterns - Get all discovered patterns
 * - POST /patterns/discover - Discover new patterns from execution history
 */

import { Router } from 'express';
import { agentKnowledgeLoader, LearningReport } from '../services/intelligence/AgentKnowledgeLoader';
import { recursiveContextService } from '../services/intelligence/RecursiveContextService';
import { AgentLearningService, type AgentExecutionResult } from '../services/learning/AgentLearningService';
import { PatternRecognition } from '../services/learning/PatternRecognition';

const router = Router();

/**
 * GET /api/agents/learning/status
 * Get current agent learning system status
 */
router.get('/status', async (_req, res) => {
  try {
    const counts = agentKnowledgeLoader.getAgentCounts();
    
    res.json({
      success: true,
      status: 'operational',
      methodology: 'MB.MD v9.9.3 + Samsung TinyRecursiveModels',
      agentCounts: counts,
      capabilities: {
        recursiveLearning: true,
        batchProcessing: true,
        semanticRetrieval: true,
        knowledgeDistribution: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get learning status'
    });
  }
});

/**
 * POST /api/agents/learning/all
 * Trigger learning for all agents (full swarm training)
 */
router.post('/all', async (_req, res) => {
  try {
    console.log('[AgentLearning API] Starting full agent swarm training...');
    
    // Note: This is a long-running operation
    // In production, this should be a background job
    const report = await agentKnowledgeLoader.loadAllAgents();
    
    res.json({
      success: true,
      report: {
        totalAgents: report.totalAgents,
        successfulLearnings: report.successfulLearnings,
        failedLearnings: report.failedLearnings,
        averageConfidence: report.averageConfidence,
        byCategory: report.byCategory,
        timestamp: report.timestamp
      }
    });
  } catch (error) {
    console.error('[AgentLearning API] Error in full training:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete agent training'
    });
  }
});

/**
 * POST /api/agents/learning/category/:category
 * Trigger learning for a specific agent category
 */
router.post('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!['page', 'algorithm', 'feature', 'system'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category. Must be: page, algorithm, feature, or system'
      });
    }
    
    console.log(`[AgentLearning API] Starting ${category} agent training...`);
    
    const report = await agentKnowledgeLoader.loadAgentCategory(
      category as 'page' | 'algorithm' | 'feature' | 'system'
    );
    
    res.json({
      success: true,
      category,
      report: {
        totalAgents: report.totalAgents,
        successfulLearnings: report.successfulLearnings,
        failedLearnings: report.failedLearnings,
        averageConfidence: report.averageConfidence,
        timestamp: report.timestamp
      }
    });
  } catch (error) {
    console.error('[AgentLearning API] Error in category training:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete category training'
    });
  }
});

/**
 * POST /api/agents/learning/priority/:priority
 * Trigger learning by priority level
 */
router.post('/priority/:priority', async (req, res) => {
  try {
    const { priority } = req.params;
    
    if (!['critical', 'high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid priority. Must be: critical, high, medium, or low'
      });
    }
    
    console.log(`[AgentLearning API] Starting ${priority} priority agent training...`);
    
    const report = await agentKnowledgeLoader.loadByPriority(
      priority as 'critical' | 'high' | 'medium' | 'low'
    );
    
    res.json({
      success: true,
      priority,
      report: {
        totalAgents: report.totalAgents,
        successfulLearnings: report.successfulLearnings,
        failedLearnings: report.failedLearnings,
        averageConfidence: report.averageConfidence,
        timestamp: report.timestamp
      }
    });
  } catch (error) {
    console.error('[AgentLearning API] Error in priority training:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete priority training'
    });
  }
});

/**
 * POST /api/agents/learning/single/:agentId
 * Trigger learning for a single agent
 */
router.post('/single/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    console.log(`[AgentLearning API] Starting training for ${agentId}...`);
    
    const knowledge = await agentKnowledgeLoader.loadSingleAgent(agentId);
    
    if (!knowledge) {
      return res.status(404).json({
        success: false,
        error: `Agent ${agentId} not found or no documentation available`
      });
    }
    
    res.json({
      success: true,
      agentId,
      knowledge: {
        confidence: knowledge.confidence,
        improvementCycles: knowledge.improvementCycles,
        timestamp: knowledge.timestamp,
        knowledgeSummary: knowledge.knowledge.substring(0, 500) + '...'
      }
    });
  } catch (error) {
    console.error('[AgentLearning API] Error in single agent training:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete agent training'
    });
  }
});

/**
 * GET /api/agents/learning/knowledge/:agentId
 * Get an agent's learned knowledge
 */
router.get('/knowledge/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const knowledge = await agentKnowledgeLoader.getAgentKnowledge(agentId);
    
    if (!knowledge) {
      return res.status(404).json({
        success: false,
        error: `No knowledge found for agent ${agentId}`
      });
    }
    
    res.json({
      success: true,
      agentId,
      knowledge: {
        content: knowledge.knowledge,
        confidence: knowledge.confidence,
        improvementCycles: knowledge.improvementCycles,
        timestamp: knowledge.timestamp
      }
    });
  } catch (error) {
    console.error('[AgentLearning API] Error retrieving knowledge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agent knowledge'
    });
  }
});

/**
 * GET /api/agents/learning/configs
 * Get all agent configurations
 */
router.get('/configs', async (_req, res) => {
  try {
    const configs = agentKnowledgeLoader.getAllAgentConfigs();
    
    res.json({
      success: true,
      totalAgents: configs.length,
      agents: configs.map(c => ({
        agentId: c.agentId,
        agentName: c.agentName,
        category: c.category,
        priority: c.priority,
        documentCount: c.documentationPaths.length
      }))
    });
  } catch (error) {
    console.error('[AgentLearning API] Error getting configs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent configurations'
    });
  }
});

/**
 * POST /api/agents/learning/context
 * Get recursive context for a query (TRM semantic search)
 */
router.post('/context', async (req, res) => {
  try {
    const { query, maxTokens = 4000 } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }
    
    const context = await recursiveContextService.getContext(query, maxTokens);
    
    res.json({
      success: true,
      context: {
        query: context.query,
        expandedContext: context.expandedContext,
        totalTokens: context.totalTokens,
        compressionAchieved: context.compressionAchieved,
        relevantSummaries: context.relevantSummaries.length
      }
    });
  } catch (error) {
    console.error('[AgentLearning API] Error getting context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recursive context'
    });
  }
});

// ============================================================================
// AGENT LEARNING SERVICE ENDPOINTS (Core Learning System)
// ============================================================================

/**
 * POST /api/agents/learning/execute
 * Record an agent execution for learning
 * This is the core entry point for the learning system
 */
router.post('/execute', async (req, res) => {
  try {
    const execution: AgentExecutionResult = {
      agentId: req.body.agentId,
      task: req.body.task,
      outcome: req.body.outcome,
      result: req.body.result,
      errorMessage: req.body.errorMessage,
      errorType: req.body.errorType,
      startedAt: new Date(req.body.startedAt || Date.now()),
      completedAt: new Date(req.body.completedAt || Date.now()),
      durationMs: req.body.durationMs || 0,
      quality: req.body.quality,
      efficiency: req.body.efficiency,
      confidence: req.body.confidence,
      cost: req.body.cost,
      tokensUsed: req.body.tokensUsed,
      context: req.body.context,
      appliedPatterns: req.body.appliedPatterns,
      metadata: req.body.metadata,
    };
    
    if (!execution.agentId || !execution.task || !execution.outcome) {
      return res.status(400).json({
        success: false,
        error: 'agentId, task, and outcome are required'
      });
    }
    
    console.log(`[AgentLearning API] Recording execution for ${execution.agentId}: ${execution.outcome}`);
    
    const executionId = await AgentLearningService.recordExecution(execution, req.body.userId);
    
    res.json({
      success: true,
      executionId,
      message: `Execution recorded for ${execution.agentId}`
    });
  } catch (error: any) {
    console.error('[AgentLearning API] Error recording execution:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to record execution'
    });
  }
});

/**
 * POST /api/agents/learning/cycle/:agentId
 * Trigger a learning cycle for a specific agent
 */
router.post('/cycle/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const lookbackDays = parseInt(req.body.lookbackDays) || 7;
    
    console.log(`[AgentLearning API] Triggering learning cycle for ${agentId}...`);
    
    const result = await AgentLearningService.runLearningCycle(agentId, lookbackDays);
    
    res.json({
      success: true,
      agentId,
      result: {
        patternsDiscovered: result.patternsDiscovered,
        knowledgeUpdates: result.knowledgeUpdates,
        performanceImprovement: result.performanceImprovement,
        newVersion: result.newVersion,
        insights: result.insights,
        recommendations: result.recommendations
      }
    });
  } catch (error: any) {
    console.error('[AgentLearning API] Error in learning cycle:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to run learning cycle'
    });
  }
});

/**
 * GET /api/agents/learning/baseline/:agentId
 * Get performance baseline for an agent
 */
router.get('/baseline/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const baseline = await AgentLearningService.calculatePerformanceBaseline(agentId);
    
    res.json({
      success: true,
      agentId,
      baseline: {
        version: baseline.version,
        totalExecutions: baseline.totalExecutions,
        successRate: baseline.successRate,
        averageQuality: baseline.averageQuality,
        averageEfficiency: baseline.averageEfficiency,
        averageDuration: baseline.averageDuration,
        userSatisfaction: baseline.userSatisfaction,
        calculatedAt: baseline.calculatedAt
      }
    });
  } catch (error: any) {
    console.error('[AgentLearning API] Error getting baseline:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get baseline'
    });
  }
});

/**
 * POST /api/agents/learning/evaluate/:agentId
 * Run self-evaluation for an agent
 */
router.post('/evaluate/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    console.log(`[AgentLearning API] Running self-evaluation for ${agentId}...`);
    
    const result = await AgentLearningService.selfEvaluate(agentId);
    
    res.json({
      success: true,
      agentId,
      evaluation: {
        performanceDelta: result.performanceDelta,
        shouldTriggerLearning: result.shouldTriggerLearning,
        reason: result.reason,
        improvementHypotheses: result.improvementHypotheses,
        currentPerformance: {
          successRate: result.currentPerformance.successRate,
          averageQuality: result.currentPerformance.averageQuality,
          averageEfficiency: result.currentPerformance.averageEfficiency
        },
        baselinePerformance: {
          successRate: result.baselinePerformance.successRate,
          averageQuality: result.baselinePerformance.averageQuality,
          averageEfficiency: result.baselinePerformance.averageEfficiency
        }
      }
    });
  } catch (error: any) {
    console.error('[AgentLearning API] Error in self-evaluation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to run self-evaluation'
    });
  }
});

// ============================================================================
// PATTERN RECOGNITION ENDPOINTS
// ============================================================================

/**
 * POST /api/agents/learning/patterns/discover
 * Discover new patterns from execution history
 */
router.post('/patterns/discover', async (req, res) => {
  try {
    const { agentId, lookbackDays = 7, minConfidence = 0.6 } = req.body;
    
    console.log(`[AgentLearning API] Discovering patterns...`);
    
    const patterns = await PatternRecognition.discoverPatterns(agentId, lookbackDays, minConfidence);
    
    if (patterns.length > 0) {
      await PatternRecognition.savePatterns(patterns);
    }
    
    res.json({
      success: true,
      patternsDiscovered: patterns.length,
      patterns: patterns.map(p => ({
        problemSignature: p.problemSignature,
        category: p.category,
        confidence: p.confidence,
        successRate: p.evidence.successRate,
        successCount: p.evidence.successCount,
        agentIds: p.context.agentIds
      }))
    });
  } catch (error: any) {
    console.error('[AgentLearning API] Error discovering patterns:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to discover patterns'
    });
  }
});

/**
 * GET /api/agents/learning/patterns/correlations
 * Get performance correlations
 */
router.get('/patterns/correlations', async (req, res) => {
  try {
    const agentId = req.query.agentId as string | undefined;
    const lookbackDays = parseInt(req.query.lookbackDays as string) || 30;
    
    const correlations = await PatternRecognition.analyzePerformanceCorrelations(agentId, lookbackDays);
    
    res.json({
      success: true,
      correlations: correlations.map(c => ({
        factor: c.factor,
        correlation: c.correlation,
        significance: c.significance,
        impact: c.impact,
        recommendation: c.recommendation
      }))
    });
  } catch (error: any) {
    console.error('[AgentLearning API] Error getting correlations:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get correlations'
    });
  }
});

/**
 * POST /api/agents/learning/patterns/insights
 * Generate insights from discovered patterns
 */
router.post('/patterns/insights', async (req, res) => {
  try {
    const { agentId, lookbackDays = 7 } = req.body;
    
    const patterns = await PatternRecognition.discoverPatterns(agentId, lookbackDays);
    const insights = await PatternRecognition.generateInsights(patterns);
    
    res.json({
      success: true,
      insights,
      patternsAnalyzed: patterns.length
    });
  } catch (error: any) {
    console.error('[AgentLearning API] Error generating insights:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate insights'
    });
  }
});

export default router;
