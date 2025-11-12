/**
 * AGENT INTELLIGENCE API
 * TRACK 3 BATCH 13-16: Complete API Layer
 * 
 * Provides comprehensive endpoints for agent validation, learning, pattern recognition,
 * and system statistics. Integrates Quality Validator, Learning Coordinator, and
 * Pattern Recognition services.
 */

import { Router, type Response } from "express";
import { authenticateToken, type AuthRequest, requireRoleLevel } from "../middleware/auth";
import { apiRateLimiter } from "../middleware/rateLimiter";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { QualityValidatorService } from "../services/validation/qualityValidator";
import { LearningCoordinatorService } from "../services/learning/learningCoordinator";
import { PatternRecognitionEngine } from "../services/intelligence/patternRecognition";
import { AgentCollaborationService } from "../services/collaboration/agentCollaborationService";
import { KnowledgeGraphService } from "../services/knowledge/knowledgeGraphService";
import { db } from "../../shared/db";
import { esaAgents, agentTasks } from "../../shared/platform-schema";
import { 
  learningPatterns, 
  validationResults,
  agentPerformanceMetrics,
  agentPerformanceAlerts
} from "../../shared/schema";
import { eq, desc, and, gte, sql, count, or } from "drizzle-orm";

const router = Router();

// Lazy initialization to avoid blocking during module load
let collaborationService: AgentCollaborationService | null = null;
let knowledgeGraph: KnowledgeGraphService | null = null;

function getCollaborationService(): AgentCollaborationService {
  if (!collaborationService) {
    collaborationService = new AgentCollaborationService();
  }
  return collaborationService;
}

function getKnowledgeGraph(): KnowledgeGraphService {
  if (!knowledgeGraph) {
    knowledgeGraph = new KnowledgeGraphService();
  }
  return knowledgeGraph;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const validateFeatureSchema = z.object({
  feature: z.string().min(1),
  page: z.string().optional(),
  targetAgent: z.string().min(1),
  testType: z.enum(['functional', 'mobile', 'performance', 'accessibility', 'security']),
  context: z.record(z.unknown()).optional(),
});

const captureLearningSchema = z.object({
  agentId: z.string().min(1),
  category: z.enum(['bug_fix', 'optimization', 'feature', 'refactor', 'pattern', 'architecture']),
  domain: z.string().min(1),
  problem: z.string().min(1),
  solution: z.string().min(1),
  outcome: z.object({
    success: z.boolean(),
    impact: z.enum(['low', 'medium', 'high']),
    timeSaved: z.string().optional(),
    metricsImproved: z.record(z.number()).optional(),
  }),
  confidence: z.number().min(0).max(1).optional(),
  context: z.object({
    page: z.string().optional(),
    component: z.string().optional(),
    stackTrace: z.string().optional(),
    relatedAgents: z.array(z.string()).optional(),
  }).optional(),
  codeExample: z.string().optional(),
  whenNotToUse: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const searchPatternsSchema = z.object({
  query: z.string().min(1),
  category: z.enum(['bug_fix', 'optimization', 'feature', 'refactor', 'pattern', 'architecture']).optional(),
  domain: z.string().optional(),
  limit: z.number().min(1).max(50).default(10),
  minConfidence: z.number().min(0).max(1).optional(),
});

const findSolutionSchema = z.object({
  category: z.enum(['bug_fix', 'optimization', 'feature', 'refactor', 'pattern', 'architecture']),
  domain: z.string(),
  problem: z.string().min(1),
  context: z.object({
    page: z.string().optional(),
    component: z.string().optional(),
    errorMessage: z.string().optional(),
    stackTrace: z.string().optional(),
    browserType: z.string().optional(),
    deviceType: z.string().optional(),
  }).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
});

const distributeKnowledgeSchema = z.object({
  patternId: z.number(),
  targetAgents: z.array(z.string()).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
});

// ============================================================================
// ENDPOINTS
// ============================================================================

/**
 * GET /api/agent-intelligence/agents
 * List all ESA agents with their current status and certification levels
 */
router.get("/agents", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { status, type, certificationLevel, limit = '50', offset = '0' } = req.query;

    let query = db.select().from(esaAgents).$dynamic();

    if (status) {
      query = query.where(eq(esaAgents.status, status as string));
    }
    if (type) {
      query = query.where(eq(esaAgents.agentType, type as string));
    }
    if (certificationLevel) {
      query = query.where(eq(esaAgents.certificationLevel, parseInt(certificationLevel as string)));
    }

    const agents = await query
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .orderBy(desc(esaAgents.createdAt));

    const total = await db.select({ count: count() }).from(esaAgents);

    res.json({
      agents,
      total: total[0].count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/agents/:agentCode
 * Get detailed information about a specific agent
 */
router.get("/agents/:agentCode", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { agentCode } = req.params;

    const agent = await db.select()
      .from(esaAgents)
      .where(eq(esaAgents.agentCode, agentCode))
      .limit(1);

    if (!agent || agent.length === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Get recent tasks
    const recentTasks = await db.select()
      .from(agentTasks)
      .where(eq(agentTasks.agentId, agent[0].id))
      .orderBy(desc(agentTasks.createdAt))
      .limit(10);

    res.json({
      agent: agent[0],
      recentTasks,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/validate
 * Trigger feature validation with AI-powered fix suggestions
 */
router.post("/validate", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const validation = validateFeatureSchema.parse(req.body);

    const result = await QualityValidatorService.validateFeature(validation);

    res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.toString() });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/validations/:agentId
 * Get validation history and results for a specific agent
 */
router.get("/validations/:agentId", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    const { limit = '20', status } = req.query;

    let query = db.select()
      .from(validationResults)
      .where(eq(validationResults.targetAgent, agentId))
      .$dynamic();

    if (status) {
      query = query.where(eq(validationResults.status, status as any));
    }

    const results = await query
      .orderBy(desc(validationResults.validatedAt))
      .limit(parseInt(limit as string));

    const stats = await db.select({
      total: count(),
      passed: sql<number>`count(*) FILTER (WHERE status = 'passed')`,
      failed: sql<number>`count(*) FILTER (WHERE status = 'failed')`,
      warnings: sql<number>`count(*) FILTER (WHERE status = 'warning')`,
    }).from(validationResults)
      .where(eq(validationResults.targetAgent, agentId));

    res.json({
      results,
      stats: stats[0],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/learn
 * Capture a new learning from an agent and distribute to network
 */
router.post("/learn", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const learning = captureLearningSchema.parse(req.body);

    const result = await LearningCoordinatorService.captureLearning(learning);

    res.json({
      success: true,
      pattern: result,
      message: "Learning captured and distributed to agent network",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.toString() });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/patterns
 * Search for patterns in the learning library
 */
router.get("/patterns", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { query, category, domain, limit = '10', minConfidence } = req.query;

    if (!query) {
      // List recent patterns if no search query
      let dbQuery = db.select().from(learningPatterns).$dynamic();

      if (category) {
        dbQuery = dbQuery.where(eq(learningPatterns.category, category as any));
      }
      if (domain) {
        dbQuery = dbQuery.where(eq(learningPatterns.domain, domain as string));
      }

      const patterns = await dbQuery
        .orderBy(desc(learningPatterns.createdAt))
        .limit(parseInt(limit as string));

      return res.json({ patterns });
    }

    // Semantic search
    const results = await LearningCoordinatorService.searchKnowledge(
      query as string,
      parseInt(limit as string)
    );

    res.json({ patterns: results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/patterns/search
 * Semantic search for solution patterns
 */
router.post("/patterns/search", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const search = searchPatternsSchema.parse(req.body);

    const results = await LearningCoordinatorService.searchKnowledge(
      search.query,
      search.limit
    );

    // Filter by category and domain if specified
    let filtered = results;
    if (search.category) {
      filtered = filtered.filter(r => r.pattern.category === search.category);
    }
    if (search.domain) {
      filtered = filtered.filter(r => r.pattern.domain === search.domain);
    }
    if (search.minConfidence !== undefined) {
      filtered = filtered.filter(r => r.relevanceScore >= search.minConfidence!);
    }

    res.json({ results: filtered });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.toString() });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/find-solution
 * Find similar problems and recommended solutions
 */
router.post("/find-solution", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const problemSignature = findSolutionSchema.parse(req.body);

    const matches = await PatternRecognitionEngine.findSimilarProblems(problemSignature);

    res.json({
      matches,
      totalFound: matches.length,
      recommendations: matches.slice(0, 3), // Top 3 recommendations
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.toString() });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/patterns/:id
 * Get detailed information about a specific pattern
 */
router.get("/patterns/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const patternId = parseInt(req.params.id);

    const pattern = await db.select()
      .from(learningPatterns)
      .where(eq(learningPatterns.id, patternId))
      .limit(1);

    if (!pattern || pattern.length === 0) {
      return res.status(404).json({ error: "Pattern not found" });
    }

    // Get pattern statistics
    const stats = await PatternRecognitionEngine.getPatternStatistics(patternId);

    res.json({
      pattern: pattern[0],
      stats,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/distribute-knowledge
 * Distribute knowledge/pattern to specific agents or entire network
 */
router.post("/distribute-knowledge", authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res: Response) => {
  try {
    const distribution = distributeKnowledgeSchema.parse(req.body);

    const result = await LearningCoordinatorService.distributeKnowledge(
      distribution.patternId,
      distribution.targetAgents,
      distribution.priority
    );

    res.json({
      success: true,
      distributed: result,
      message: `Knowledge distributed to ${result.agentsNotified.length} agents`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.toString() });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/stats
 * Get comprehensive system statistics
 */
router.get("/stats", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const timeRange = req.query.timeRange as string || '7d';
    
    // Calculate date threshold
    const daysAgo = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysAgo);

    // Agent statistics
    const agentStats = await db.select({
      total: count(),
      active: sql<number>`count(*) FILTER (WHERE status = 'active')`,
      training: sql<number>`count(*) FILTER (WHERE status = 'training')`,
      certified: sql<number>`count(*) FILTER (WHERE certification_level >= 2)`,
    }).from(esaAgents);

    // Validation statistics
    const validationStats = await db.select({
      total: count(),
      passed: sql<number>`count(*) FILTER (WHERE status = 'passed')`,
      failed: sql<number>`count(*) FILTER (WHERE status = 'failed')`,
      warnings: sql<number>`count(*) FILTER (WHERE status = 'warning')`,
    }).from(validationResults)
      .where(gte(validationResults.validatedAt, threshold));

    // Learning statistics
    const learningStats = await db.select({
      total: count(),
      bugFixes: sql<number>`count(*) FILTER (WHERE category = 'bug_fix')`,
      optimizations: sql<number>`count(*) FILTER (WHERE category = 'optimization')`,
      features: sql<number>`count(*) FILTER (WHERE category = 'feature')`,
      patterns: sql<number>`count(*) FILTER (WHERE category = 'pattern')`,
    }).from(learningPatterns)
      .where(gte(learningPatterns.createdAt, threshold));

    // Task statistics
    const taskStats = await db.select({
      total: count(),
      pending: sql<number>`count(*) FILTER (WHERE status = 'pending')`,
      inProgress: sql<number>`count(*) FILTER (WHERE status = 'in_progress')`,
      completed: sql<number>`count(*) FILTER (WHERE status = 'completed')`,
      failed: sql<number>`count(*) FILTER (WHERE status = 'failed')`,
    }).from(agentTasks)
      .where(gte(agentTasks.createdAt, threshold));

    res.json({
      timeRange,
      agents: agentStats[0],
      validations: validationStats[0],
      learning: learningStats[0],
      tasks: taskStats[0],
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/learning-cycles
 * Get information about learning cycle status and metrics
 */
router.get("/learning-cycles", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    // Get recent patterns with their reuse statistics
    const recentPatterns = await db.select()
      .from(learningPatterns)
      .orderBy(desc(learningPatterns.createdAt))
      .limit(parseInt(limit as string));

    const cycleMetrics = await LearningCoordinatorService.getLearningCycleMetrics();

    res.json({
      recentPatterns,
      cycleMetrics,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/synthesize-patterns
 * Synthesize multiple related patterns into a unified pattern
 */
router.post("/synthesize-patterns", authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res: Response) => {
  try {
    const { patternIds } = req.body;

    if (!Array.isArray(patternIds) || patternIds.length < 2) {
      return res.status(400).json({ error: "At least 2 pattern IDs required for synthesis" });
    }

    const synthesis = await LearningCoordinatorService.synthesizePatterns(patternIds);

    res.json({
      success: true,
      synthesis,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/top-performers
 * Get top performing agents based on success rates and task completion
 */
router.get("/top-performers", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { limit = '10', metric = 'success_rate' } = req.query;

    const agents = await db.select({
      id: esaAgents.id,
      agentCode: esaAgents.agentCode,
      agentName: esaAgents.agentName,
      agentType: esaAgents.agentType,
      tasksCompleted: esaAgents.tasksCompleted,
      tasksSuccess: esaAgents.tasksSuccess,
      tasksFailed: esaAgents.tasksFailed,
      avgCompletionTime: esaAgents.avgCompletionTime,
      certificationLevel: esaAgents.certificationLevel,
      successRate: sql<number>`CASE WHEN ${esaAgents.tasksCompleted} > 0 THEN (${esaAgents.tasksSuccess}::float / ${esaAgents.tasksCompleted}::float) * 100 ELSE 0 END`,
    }).from(esaAgents)
      .where(eq(esaAgents.status, 'active'))
      .orderBy(
        metric === 'tasks_completed' 
          ? desc(esaAgents.tasksCompleted)
          : sql`CASE WHEN ${esaAgents.tasksCompleted} > 0 THEN (${esaAgents.tasksSuccess}::float / ${esaAgents.tasksCompleted}::float) * 100 ELSE 0 END DESC`
      )
      .limit(parseInt(limit as string));

    res.json({ topPerformers: agents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/agent-intelligence/agents/:agentCode/certify
 * Update agent certification level
 */
router.patch("/agents/:agentCode/certify", authenticateToken, requireRoleLevel(7), async (req: AuthRequest, res: Response) => {
  try {
    const { agentCode } = req.params;
    const { level, methodology } = req.body;

    if (![0, 1, 2, 3].includes(level)) {
      return res.status(400).json({ error: "Certification level must be 0-3" });
    }

    const updated = await db.update(esaAgents)
      .set({
        certificationLevel: level,
        trainingMethodology: methodology,
        certifiedAt: level > 0 ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(esaAgents.agentCode, agentCode))
      .returning();

    if (!updated || updated.length === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.json({
      success: true,
      agent: updated[0],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// BATCH 13: NEW AGENT INTELLIGENCE ENDPOINTS
// ============================================================================

/**
 * POST /api/agent-intelligence/collaboration
 * Request agent collaboration using knowledge graph
 */
router.post("/collaboration", authenticateToken, requireRoleLevel(4), apiRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const {
      agentId,
      issue,
      context,
      preferredCollaborator,
      domain,
      urgency
    } = req.body;

    if (!agentId || !issue) {
      return res.status(400).json({ 
        error: "agentId and issue are required" 
      });
    }

    // Request collaboration
    const collaboration = await getCollaborationService().requestHelp({
      agentId,
      issue,
      context,
      preferredCollaborator,
      domain,
      urgency
    });

    // Find expert matches if no preferred collaborator
    let expertMatches = [];
    if (!preferredCollaborator && domain) {
      expertMatches = await getCollaborationService().findExperts(domain, issue);
    }

    res.status(201).json({
      success: true,
      collaboration,
      expertMatches,
      message: "Collaboration request created successfully"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/performance/:agentId
 * Get performance metrics for a specific agent
 */
router.get("/performance/:agentId", authenticateToken, requireRoleLevel(4), apiRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    const { days = '7' } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

    // Query performance metrics
    const metrics = await db
      .select()
      .from(agentPerformanceMetrics)
      .where(
        and(
          eq(agentPerformanceMetrics.agentId, agentId),
          gte(agentPerformanceMetrics.recordedAt, daysAgo)
        )
      )
      .orderBy(desc(agentPerformanceMetrics.recordedAt))
      .limit(100);

    // Calculate aggregated stats
    const stats = metrics.length > 0 ? {
      avgTaskDuration: metrics.reduce((sum, m) => sum + (m.avgTaskDuration || 0), 0) / metrics.length,
      totalTasksCompleted: metrics.reduce((sum, m) => sum + (m.tasksCompleted || 0), 0),
      totalTasksFailed: metrics.reduce((sum, m) => sum + (m.tasksFailed || 0), 0),
      avgErrorRate: metrics.reduce((sum, m) => sum + (m.errorRate || 0), 0) / metrics.length,
      avgQueueDepth: metrics.reduce((sum, m) => sum + (m.queueDepth || 0), 0) / metrics.length,
      cacheHitRate: metrics.reduce((sum, m) => sum + (m.cacheHitRate || 0), 0) / metrics.length,
      successRate: (() => {
        const totalTasks = metrics.reduce((sum, m) => sum + (m.totalTasks || 0), 0);
        const totalCompleted = metrics.reduce((sum, m) => sum + (m.tasksCompleted || 0), 0);
        return totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
      })()
    } : null;

    res.json({
      success: true,
      agentId,
      period: `${days} days`,
      metricsCount: metrics.length,
      aggregatedStats: stats,
      detailedMetrics: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/alerts
 * Get active performance alerts
 */
router.get("/alerts", authenticateToken, requireRoleLevel(4), apiRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { severity, status = 'active', agentId } = req.query;

    let query = db.select().from(agentPerformanceAlerts);
    const conditions = [];

    if (status === 'active') {
      conditions.push(eq(agentPerformanceAlerts.status, 'active'));
    } else if (status === 'acknowledged') {
      conditions.push(eq(agentPerformanceAlerts.status, 'acknowledged'));
    } else if (status === 'resolved') {
      conditions.push(eq(agentPerformanceAlerts.status, 'resolved'));
    }

    if (severity) {
      conditions.push(eq(agentPerformanceAlerts.severity, severity as any));
    }

    if (agentId) {
      conditions.push(eq(agentPerformanceAlerts.agentId, agentId as string));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const alerts = await query
      .orderBy(desc(agentPerformanceAlerts.createdAt))
      .limit(100);

    // Group by severity
    const grouped = {
      critical: alerts.filter(a => a.severity === 'critical'),
      high: alerts.filter(a => a.severity === 'high'),
      medium: alerts.filter(a => a.severity === 'medium'),
      low: alerts.filter(a => a.severity === 'low'),
    };

    res.json({
      success: true,
      totalAlerts: alerts.length,
      criticalCount: grouped.critical.length,
      highCount: grouped.high.length,
      mediumCount: grouped.medium.length,
      lowCount: grouped.low.length,
      alerts,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/alerts/:id/acknowledge
 * Acknowledge a performance alert
 */
router.post("/alerts/:id/acknowledge", authenticateToken, requireRoleLevel(4), apiRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { acknowledgedBy, resolution, notes } = req.body;

    if (!acknowledgedBy) {
      return res.status(400).json({ error: "acknowledgedBy is required" });
    }

    // Update alert status
    const updated = await db
      .update(agentPerformanceAlerts)
      .set({
        status: 'acknowledged',
        acknowledgedBy,
        acknowledgedAt: new Date(),
        updatedAt: new Date(),
        metadata: resolution || notes ? sql`jsonb_build_object('resolution', ${resolution}, 'notes', ${notes})` : undefined
      })
      .where(eq(agentPerformanceAlerts.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json({
      success: true,
      message: "Alert acknowledged successfully",
      alert: updated[0],
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/knowledge/search
 * Semantic knowledge search with OpenAI embeddings
 */
router.get("/knowledge/search", authenticateToken, requireRoleLevel(3), apiRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { q, threshold = '0.7', limit = '10' } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Query parameter 'q' is required"
      });
    }

    const minRelevance = parseFloat(threshold as string);
    const maxResults = parseInt(limit as string);

    // Semantic search using Learning Coordinator
    const learningCoordinator = new LearningCoordinatorService();
    const results = await learningCoordinator.searchKnowledge(
      q as string,
      maxResults
    );

    // Filter by relevance threshold
    const filtered = results.filter(r => r.relevanceScore >= minRelevance);

    res.json({
      success: true,
      query: q,
      threshold: minRelevance,
      resultsCount: filtered.length,
      results: filtered.map(r => ({
        pattern: r.pattern,
        relevanceScore: r.relevanceScore,
        agentId: r.pattern.agentId,
        category: r.pattern.category,
        domain: r.pattern.domain,
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/distribute
 * Distribute knowledge UP/ACROSS/DOWN the hierarchy
 */
router.post("/distribute", authenticateToken, requireRoleLevel(4), apiRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const {
      patternId,
      targetAgents,
      priority = 'medium',
      direction,
      messageType
    } = req.body;

    if (!patternId) {
      return res.status(400).json({ error: "patternId is required" });
    }

    const learningCoordinator = new LearningCoordinatorService();
    
    // Distribute knowledge
    const result = await learningCoordinator.distributeKnowledge(
      patternId,
      targetAgents,
      priority
    );

    res.status(201).json({
      success: true,
      message: "Knowledge distributed successfully",
      distribution: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/metrics
 * Get overall intelligence network metrics
 */
router.get("/metrics", authenticateToken, requireRoleLevel(4), apiRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { days = '7' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

    // Get pattern library stats
    const [patternsStats] = await db
      .select({
        totalPatterns: sql<number>`count(*)::int`,
        avgConfidence: sql<number>`avg(${learningPatterns.confidence})::float`,
        avgSuccessRate: sql<number>`avg(${learningPatterns.successRate})::float`,
        totalVariations: sql<number>`sum(${learningPatterns.variationCount})::int`,
      })
      .from(learningPatterns)
      .where(gte(learningPatterns.createdAt, daysAgo));

    // Get validation stats
    const [validationStats] = await db
      .select({
        totalValidations: sql<number>`count(*)::int`,
        passed: sql<number>`count(*) filter (where ${validationResults.passed} = true)::int`,
        failed: sql<number>`count(*) filter (where ${validationResults.passed} = false)::int`,
      })
      .from(validationResults)
      .where(gte(validationResults.validatedAt, daysAgo));

    // Get performance metrics summary
    const [perfStats] = await db
      .select({
        totalMetrics: sql<number>`count(*)::int`,
        avgErrorRate: sql<number>`avg(${agentPerformanceMetrics.errorRate})::float`,
        totalTasksCompleted: sql<number>`sum(${agentPerformanceMetrics.tasksCompleted})::int`,
        totalTasksFailed: sql<number>`sum(${agentPerformanceMetrics.tasksFailed})::int`,
      })
      .from(agentPerformanceMetrics)
      .where(gte(agentPerformanceMetrics.recordedAt, daysAgo));

    // Get active alerts count
    const [alertStats] = await db
      .select({
        activeAlerts: sql<number>`count(*) filter (where ${agentPerformanceAlerts.status} = 'active')::int`,
        criticalAlerts: sql<number>`count(*) filter (where ${agentPerformanceAlerts.severity} = 'critical' and ${agentPerformanceAlerts.status} = 'active')::int`,
      })
      .from(agentPerformanceAlerts);

    res.json({
      success: true,
      period: `${days} days`,
      patternLibrary: {
        totalPatterns: patternsStats.totalPatterns || 0,
        avgConfidence: patternsStats.avgConfidence || 0,
        avgSuccessRate: patternsStats.avgSuccessRate || 0,
        totalVariations: patternsStats.totalVariations || 0,
      },
      validation: {
        totalValidations: validationStats.totalValidations || 0,
        passed: validationStats.passed || 0,
        failed: validationStats.failed || 0,
        passRate: validationStats.totalValidations > 0
          ? (validationStats.passed / validationStats.totalValidations) * 100
          : 0,
      },
      performance: {
        totalMetrics: perfStats.totalMetrics || 0,
        avgErrorRate: perfStats.avgErrorRate || 0,
        totalTasksCompleted: perfStats.totalTasksCompleted || 0,
        totalTasksFailed: perfStats.totalTasksFailed || 0,
        successRate: (() => {
          const total = (perfStats.totalTasksCompleted || 0) + (perfStats.totalTasksFailed || 0);
          return total > 0 ? ((perfStats.totalTasksCompleted || 0) / total) * 100 : 0;
        })()
      },
      alerts: {
        active: alertStats.activeAlerts || 0,
        critical: alertStats.criticalAlerts || 0,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/health
 * Health check endpoint for agent intelligence system
 */
router.get("/health", async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      status: "healthy",
      services: {
        validation: "Agent #79 - Quality Validator",
        learning: "Agent #80 - Learning Coordinator",
        patternRecognition: "Pattern Recognition Engine",
        collaboration: "Agent Collaboration Service",
        knowledgeGraph: "Knowledge Graph Service",
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: "unhealthy",
      error: error.message
    });
  }
});

export default router;
