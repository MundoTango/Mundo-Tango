/**
 * AGENT LEARNING API ROUTES
 * MB.MD v9.9.3 + Samsung TinyRecursiveModels Integration
 * 
 * Provides REST API for triggering and monitoring agent learning
 */

import { Router } from 'express';
import { agentKnowledgeLoader, LearningReport } from '../services/intelligence/AgentKnowledgeLoader';
import { recursiveContextService } from '../services/intelligence/RecursiveContextService';

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

export default router;
