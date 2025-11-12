/**
 * MONITORING API
 * TRACK 3 BATCH 13-16: Complete API Layer
 * 
 * Provides endpoints for agent performance monitoring, system health checks,
 * Prometheus metrics, and intelligence cycle tracking.
 */

import { Router, type Response } from "express";
import { authenticateToken, type AuthRequest, requireRoleLevel } from "../middleware/auth";
import { db } from "../../shared/db";
import { 
  esaAgents,
  agentTasks,
  agentCommunications,
} from "../../shared/platform-schema";
import { 
  learningPatterns,
  validationResults,
  agentHealth,
} from "../../shared/schema";
import { eq, desc, and, gte, sql, count } from "drizzle-orm";

const router = Router();

// ============================================================================
// ENDPOINTS
// ============================================================================

/**
 * GET /api/monitoring/performance/:agentId
 * Get comprehensive performance metrics for a specific agent
 */
router.get("/performance/:agentId", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    const { timeRange = '7d' } = req.query;

    // Get agent
    const agent = await db.select()
      .from(esaAgents)
      .where(eq(esaAgents.agentCode, agentId))
      .limit(1);

    if (!agent || agent.length === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Calculate date threshold
    const daysAgo = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysAgo);

    // Task performance
    const taskStats = await db.select({
      total: count(),
      completed: sql<number>`count(*) FILTER (WHERE status = 'completed')`,
      failed: sql<number>`count(*) FILTER (WHERE status = 'failed')`,
      inProgress: sql<number>`count(*) FILTER (WHERE status = 'in_progress')`,
      avgDuration: sql<number>`avg(actual_duration) FILTER (WHERE actual_duration IS NOT NULL)`,
    }).from(agentTasks)
      .where(
        and(
          eq(agentTasks.agentId, agent[0].id),
          gte(agentTasks.createdAt, threshold)
        )
      );

    // Communication stats
    const commStats = await db.select({
      messagesSent: count(),
      escalations: sql<number>`count(*) FILTER (WHERE message_type = 'escalation')`,
      collaborations: sql<number>`count(*) FILTER (WHERE message_type = 'coordination')`,
    }).from(agentCommunications)
      .where(
        and(
          eq(agentCommunications.fromAgentId, agent[0].id),
          gte(agentCommunications.createdAt, threshold)
        )
      );

    // Learning contributions
    const learningStats = await db.select({
      patternsCreated: count(),
      avgConfidence: sql<number>`avg(confidence)`,
    }).from(learningPatterns)
      .where(
        and(
          eq(learningPatterns.agentId, agentId),
          gte(learningPatterns.createdAt, threshold)
        )
      );

    // Validation results
    const validationStats = await db.select({
      total: count(),
      passed: sql<number>`count(*) FILTER (WHERE status = 'passed')`,
      failed: sql<number>`count(*) FILTER (WHERE status = 'failed')`,
      warnings: sql<number>`count(*) FILTER (WHERE status = 'warning')`,
    }).from(validationResults)
      .where(
        and(
          eq(validationResults.targetAgent, agentId),
          gte(validationResults.validatedAt, threshold)
        )
      );

    // Calculate success rate
    const successRate = taskStats[0].total > 0
      ? (taskStats[0].completed / taskStats[0].total) * 100
      : 0;

    res.json({
      agentId,
      agentName: agent[0].agentName,
      timeRange,
      performance: {
        tasks: taskStats[0],
        successRate: successRate.toFixed(2),
        avgCompletionTime: agent[0].avgCompletionTime,
        communications: commStats[0],
        learning: learningStats[0],
        validation: validationStats[0],
      },
      currentStatus: agent[0].status,
      certificationLevel: agent[0].certificationLevel,
      lastActive: agent[0].lastActiveAt,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/monitoring/health
 * Get overall system health status
 */
router.get("/health", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    // Agent status distribution
    const agentStatus = await db.select({
      total: count(),
      active: sql<number>`count(*) FILTER (WHERE status = 'active')`,
      training: sql<number>`count(*) FILTER (WHERE status = 'training')`,
      inactive: sql<number>`count(*) FILTER (WHERE status = 'inactive')`,
      suspended: sql<number>`count(*) FILTER (WHERE status = 'suspended')`,
    }).from(esaAgents);

    // Get recent health checks
    const recentHealthChecks = await db.select()
      .from(agentHealth)
      .orderBy(desc(agentHealth.createdAt))
      .limit(100);

    const healthyAgents = recentHealthChecks.filter(h => h.status === 'healthy').length;
    const degradedAgents = recentHealthChecks.filter(h => h.status === 'degraded').length;
    const failingAgents = recentHealthChecks.filter(h => h.status === 'failing').length;

    // Task queue health
    const taskQueueStats = await db.select({
      pending: sql<number>`count(*) FILTER (WHERE status = 'pending')`,
      inProgress: sql<number>`count(*) FILTER (WHERE status = 'in_progress')`,
      stuck: sql<number>`count(*) FILTER (WHERE status = 'in_progress' AND created_at < NOW() - INTERVAL '1 hour')`,
    }).from(agentTasks);

    // Calculate system health score (0-100)
    const healthScore = Math.round(
      ((agentStatus[0].active / agentStatus[0].total) * 40) +
      ((healthyAgents / Math.max(recentHealthChecks.length, 1)) * 40) +
      ((taskQueueStats[0].stuck === 0 ? 1 : 0) * 20)
    );

    const overallStatus = 
      healthScore >= 90 ? 'healthy' :
      healthScore >= 70 ? 'degraded' :
      healthScore >= 50 ? 'warning' : 'critical';

    res.json({
      overallStatus,
      healthScore,
      agents: agentStatus[0],
      healthChecks: {
        healthy: healthyAgents,
        degraded: degradedAgents,
        failing: failingAgents,
        total: recentHealthChecks.length,
      },
      taskQueue: taskQueueStats[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/monitoring/metrics
 * Get Prometheus-style metrics for monitoring systems
 */
router.get("/metrics", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { format = 'json' } = req.query;

    // Collect all metrics
    const agentMetrics = await db.select({
      totalAgents: count(),
      activeAgents: sql<number>`count(*) FILTER (WHERE status = 'active')`,
      certifiedAgents: sql<number>`count(*) FILTER (WHERE certification_level >= 2)`,
    }).from(esaAgents);

    const taskMetrics = await db.select({
      totalTasks: count(),
      completedTasks: sql<number>`count(*) FILTER (WHERE status = 'completed')`,
      failedTasks: sql<number>`count(*) FILTER (WHERE status = 'failed')`,
      pendingTasks: sql<number>`count(*) FILTER (WHERE status = 'pending')`,
    }).from(agentTasks);

    const patternMetrics = await db.select({
      totalPatterns: count(),
      avgConfidence: sql<number>`avg(confidence)`,
      avgSuccessRate: sql<number>`avg(success_rate)`,
    }).from(learningPatterns);

    const validationMetrics = await db.select({
      totalValidations: count(),
      passedValidations: sql<number>`count(*) FILTER (WHERE status = 'passed')`,
      failedValidations: sql<number>`count(*) FILTER (WHERE status = 'failed')`,
    }).from(validationResults);

    const metrics = {
      agents: agentMetrics[0],
      tasks: taskMetrics[0],
      patterns: patternMetrics[0],
      validations: validationMetrics[0],
      timestamp: Date.now(),
    };

    if (format === 'prometheus') {
      // Format as Prometheus metrics
      const prometheusMetrics = [
        `# HELP esa_agents_total Total number of ESA agents`,
        `# TYPE esa_agents_total gauge`,
        `esa_agents_total ${metrics.agents.totalAgents}`,
        ``,
        `# HELP esa_agents_active Number of active ESA agents`,
        `# TYPE esa_agents_active gauge`,
        `esa_agents_active ${metrics.agents.activeAgents}`,
        ``,
        `# HELP esa_tasks_total Total number of tasks`,
        `# TYPE esa_tasks_total counter`,
        `esa_tasks_total ${metrics.tasks.totalTasks}`,
        ``,
        `# HELP esa_tasks_completed Number of completed tasks`,
        `# TYPE esa_tasks_completed counter`,
        `esa_tasks_completed ${metrics.tasks.completedTasks}`,
        ``,
        `# HELP esa_tasks_failed Number of failed tasks`,
        `# TYPE esa_tasks_failed counter`,
        `esa_tasks_failed ${metrics.tasks.failedTasks}`,
        ``,
        `# HELP esa_patterns_total Total number of learning patterns`,
        `# TYPE esa_patterns_total gauge`,
        `esa_patterns_total ${metrics.patterns.totalPatterns}`,
        ``,
        `# HELP esa_validations_pass_rate Validation pass rate`,
        `# TYPE esa_validations_pass_rate gauge`,
        `esa_validations_pass_rate ${metrics.validations.totalValidations > 0 ? (metrics.validations.passedValidations / metrics.validations.totalValidations) : 0}`,
      ].join('\n');

      res.setHeader('Content-Type', 'text/plain');
      return res.send(prometheusMetrics);
    }

    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/monitoring/cycles
 * Get intelligence cycle metrics and status
 */
router.get("/cycles", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { timeRange = '7d' } = req.query;

    const daysAgo = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysAgo);

    // Learning cycle metrics
    const learningCycles = await db.select({
      patternsCreated: count(),
      avgConfidence: sql<number>`avg(confidence)`,
      totalApplications: sql<number>`sum(times_applied)`,
      avgSuccessRate: sql<number>`avg(success_rate)`,
    }).from(learningPatterns)
      .where(gte(learningPatterns.createdAt, threshold));

    // Validation cycles
    const validationCycles = await db.select({
      totalValidations: count(),
      passRate: sql<number>`(count(*) FILTER (WHERE status = 'passed')::float / count(*)::float) * 100`,
    }).from(validationResults)
      .where(gte(validationResults.validatedAt, threshold));

    // Communication cycles
    const commCycles = await db.select({
      totalMessages: count(),
      escalations: sql<number>`count(*) FILTER (WHERE message_type = 'escalation')`,
      collaborations: sql<number>`count(*) FILTER (WHERE message_type = 'coordination')`,
      responseRate: sql<number>`(count(*) FILTER (WHERE responded_at IS NOT NULL AND requires_response = true)::float / count(*) FILTER (WHERE requires_response = true)::float) * 100`,
    }).from(agentCommunications)
      .where(gte(agentCommunications.createdAt, threshold));

    res.json({
      timeRange,
      learningCycle: learningCycles[0],
      validationCycle: validationCycles[0],
      communicationCycle: commCycles[0],
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/monitoring/agents/status
 * Get real-time status of all agents
 */
router.get("/agents/status", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { type, status } = req.query;

    let query = db.select({
      agentCode: esaAgents.agentCode,
      agentName: esaAgents.agentName,
      agentType: esaAgents.agentType,
      status: esaAgents.status,
      certificationLevel: esaAgents.certificationLevel,
      tasksCompleted: esaAgents.tasksCompleted,
      tasksSuccess: esaAgents.tasksSuccess,
      tasksFailed: esaAgents.tasksFailed,
      lastActiveAt: esaAgents.lastActiveAt,
      successRate: sql<number>`CASE WHEN ${esaAgents.tasksCompleted} > 0 THEN (${esaAgents.tasksSuccess}::float / ${esaAgents.tasksCompleted}::float) * 100 ELSE 0 END`,
    }).from(esaAgents).$dynamic();

    if (type) {
      query = query.where(eq(esaAgents.agentType, type as string));
    }
    if (status) {
      query = query.where(eq(esaAgents.status, status as any));
    }

    const agents = await query.orderBy(desc(esaAgents.lastActiveAt));

    res.json({
      agents,
      total: agents.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/monitoring/alerts
 * Get active alerts and warnings
 */
router.get("/alerts", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const alerts: Array<{
      severity: string;
      type: string;
      message: string;
      agentId?: string;
      timestamp: Date;
    }> = [];

    // Check for failing agents
    const failingAgents = await db.select()
      .from(agentHealth)
      .where(eq(agentHealth.status, 'failing'))
      .orderBy(desc(agentHealth.createdAt))
      .limit(10);

    failingAgents.forEach(agent => {
      alerts.push({
        severity: 'critical',
        type: 'agent_health',
        message: `Agent ${agent.agentCode} is failing`,
        agentId: agent.agentCode,
        timestamp: agent.createdAt || new Date(),
      });
    });

    // Check for stuck tasks
    const stuckTasks = await db.select()
      .from(agentTasks)
      .where(
        and(
          eq(agentTasks.status, 'in_progress'),
          sql`${agentTasks.startedAt} < NOW() - INTERVAL '2 hours'`
        )
      )
      .limit(10);

    stuckTasks.forEach(task => {
      alerts.push({
        severity: 'warning',
        type: 'stuck_task',
        message: `Task ${task.id} has been in progress for over 2 hours`,
        timestamp: task.startedAt || new Date(),
      });
    });

    // Check for high escalation rate
    const recentEscalations = await db.select({ count: count() })
      .from(agentCommunications)
      .where(
        and(
          eq(agentCommunications.messageType, 'escalation'),
          gte(agentCommunications.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
        )
      );

    if (recentEscalations[0].count > 10) {
      alerts.push({
        severity: 'warning',
        type: 'high_escalation_rate',
        message: `${recentEscalations[0].count} escalations in the last 24 hours`,
        timestamp: new Date(),
      });
    }

    // Sort by severity and timestamp
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => {
      const severityDiff = (severityOrder[a.severity as keyof typeof severityOrder] || 3) - 
                          (severityOrder[b.severity as keyof typeof severityOrder] || 3);
      if (severityDiff !== 0) return severityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    res.json({
      alerts,
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warnings: alerts.filter(a => a.severity === 'warning').length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/monitoring/trends
 * Get trend data for dashboards and analytics
 */
router.get("/trends", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { metric = 'tasks', days = '30' } = req.query;
    const daysCount = parseInt(days as string);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    let trendData: any[] = [];

    if (metric === 'tasks') {
      // Daily task completion trends
      trendData = await db.select({
        date: sql<string>`DATE(${agentTasks.completedAt})`,
        completed: count(),
      })
      .from(agentTasks)
      .where(
        and(
          eq(agentTasks.status, 'completed'),
          gte(agentTasks.completedAt, startDate)
        )
      )
      .groupBy(sql`DATE(${agentTasks.completedAt})`)
      .orderBy(sql`DATE(${agentTasks.completedAt})`);
    } else if (metric === 'patterns') {
      // Pattern creation trends
      trendData = await db.select({
        date: sql<string>`DATE(${learningPatterns.createdAt})`,
        created: count(),
      })
      .from(learningPatterns)
      .where(gte(learningPatterns.createdAt, startDate))
      .groupBy(sql`DATE(${learningPatterns.createdAt})`)
      .orderBy(sql`DATE(${learningPatterns.createdAt})`);
    } else if (metric === 'validations') {
      // Validation trends
      trendData = await db.select({
        date: sql<string>`DATE(${validationResults.validatedAt})`,
        total: count(),
        passed: sql<number>`count(*) FILTER (WHERE status = 'passed')`,
      })
      .from(validationResults)
      .where(gte(validationResults.validatedAt, startDate))
      .groupBy(sql`DATE(${validationResults.validatedAt})`)
      .orderBy(sql`DATE(${validationResults.validatedAt})`);
    }

    res.json({
      metric,
      days: daysCount,
      data: trendData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
