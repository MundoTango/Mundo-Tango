/**
 * AGENT PERFORMANCE TRACKER SERVICE
 * TRACK 1 BATCH 5: Comprehensive Agent Performance Monitoring
 * 
 * Integrations:
 * - Prometheus (prom-client): Real-time metrics collection
 * - BullMQ: Job tracking and queue monitoring
 * - PostgreSQL: Historical performance data (agent_performance_metrics table)
 * 
 * Reference: ESA A2A Protocol - Performance Tracking Communication
 */

import { db } from "../../../shared/db";
import { agentPerformanceMetrics, agentPerformanceAlerts } from "../../../shared/schema";
import type { 
  InsertAgentPerformanceMetrics, 
  SelectAgentPerformanceMetrics,
  InsertAgentPerformanceAlert,
  SelectAgentPerformanceAlert
} from "../../../shared/schema";
import { eq, desc, and, gte, lte, sql, inArray } from "drizzle-orm";
import { Job, Queue, Worker } from "bullmq";
import { getRedisClient, isRedisConnected } from "../../config/redis-optional";
import {
  agentTasksCompleted,
  agentTasksFailed,
  agentTaskDuration,
  agentErrorRate,
  agentCacheHitRate,
  agentWorkload,
  agentHealthScore,
  agentQueueDepth,
  agentConcurrentTasks,
} from "../../monitoring/prometheus";

// ============================================================================
// ALERT CONFIGURATION
// ============================================================================

/**
 * Default alert thresholds for all agents
 * Can be overridden per agent or domain
 */
export const DEFAULT_ALERT_THRESHOLDS: AlertThresholds = {
  errorRate: 0.05,           // 5%
  slowPerformance: 300,      // 5 minutes
  workloadPercentage: 80,    // 80%
  queueDepth: 50,            // 50 tasks
  cacheHitRate: 0.8,         // 80%
  healthScore: 70,           // 70/100
};

/**
 * Alert cooldown period in milliseconds
 * Prevents alert spam - only trigger once per period
 */
const ALERT_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AgentMetrics {
  agentId: string;
  agentName?: string;
  agentDomain?: string;
  tasksCompleted?: number;
  tasksInProgress?: number;
  tasksFailed?: number;
  avgTaskDuration?: number;
  errorRate?: number;
  cacheHitRate?: number;
  workloadPercentage?: number;
  queueDepth?: number;
  concurrentTasks?: number;
  metadata?: Record<string, any>;
}

export interface HealthScoreFactors {
  errorRate: number;          // 0-1 (lower is better)
  successRate: number;         // 0-1 (higher is better)
  avgDuration: number;         // seconds (lower is better, compared to baseline)
  workload: number;            // 0-100 (moderate is best, <80 ideal)
  queueDepth: number;          // tasks waiting (lower is better)
  cacheHitRate?: number;       // 0-1 (higher is better)
  lastActiveMinutes: number;   // minutes since last activity
}

export interface WorkloadStatus {
  agentId: string;
  agentName?: string;
  workloadPercentage: number;
  status: 'healthy' | 'busy' | 'overloaded' | 'failing';
  queueDepth: number;
  concurrentTasks: number;
  maxConcurrentTasks: number;
  recommendedAction?: string;
}

export interface Bottleneck {
  agentId: string;
  agentName?: string;
  agentDomain?: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metrics: {
    errorRate?: number;
    avgDuration?: number;
    workload?: number;
    queueDepth?: number;
  };
  recommendation: string;
}

export interface PerformanceReport {
  generatedAt: Date;
  timeWindow: {
    start: Date;
    end: Date;
    duration: string;
  };
  summary: {
    totalAgents: number;
    healthyAgents: number;
    degradedAgents: number;
    overloadedAgents: number;
    failingAgents: number;
    avgHealthScore: number;
  };
  topPerformers: Array<{
    agentId: string;
    agentName?: string;
    healthScore: number;
    tasksCompleted: number;
    avgDuration: number;
  }>;
  bottlenecks: Bottleneck[];
  activeAlerts: SelectAgentPerformanceAlert[];
  recommendations: string[];
}

export interface AlertThresholds {
  errorRate: number;           // Alert if error rate > threshold (default: 0.05 = 5%)
  slowPerformance: number;      // Alert if avg duration > threshold seconds (default: 300s)
  workloadPercentage: number;   // Alert if workload > threshold (default: 80%)
  queueDepth: number;           // Alert if queue depth > threshold (default: 50)
  cacheHitRate: number;         // Alert if cache hit rate < threshold (default: 0.8 = 80%)
  healthScore: number;          // Alert if health score < threshold (default: 70)
}

export interface AlertOptions {
  agentId: string;
  agentName?: string;
  agentDomain?: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold?: number;
  actualValue?: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// CORE FUNCTION 1: TRACK METRICS
// ============================================================================

/**
 * Record agent performance metrics to database and Prometheus
 * 
 * Usage:
 * ```typescript
 * await trackMetrics({
 *   agentId: 'AGENT_54',
 *   agentName: 'Accessibility',
 *   agentDomain: 'Platform',
 *   tasksCompleted: 1,
 *   avgTaskDuration: 220,
 *   errorRate: 0
 * });
 * ```
 */
export async function trackMetrics(metrics: AgentMetrics): Promise<SelectAgentPerformanceMetrics> {
  const {
    agentId,
    agentName,
    agentDomain,
    tasksCompleted = 0,
    tasksInProgress = 0,
    tasksFailed = 0,
    avgTaskDuration = 0,
    errorRate = 0,
    cacheHitRate,
    workloadPercentage = 0,
    queueDepth = 0,
    concurrentTasks = 0,
    metadata = {},
  } = metrics;

  // Get existing metrics or create new record
  const existing = await db
    .select()
    .from(agentPerformanceMetrics)
    .where(
      and(
        eq(agentPerformanceMetrics.agentId, agentId),
        eq(agentPerformanceMetrics.timeWindow, 'hour'),
        gte(agentPerformanceMetrics.windowStart, new Date(Date.now() - 3600000)) // last hour
      )
    )
    .orderBy(desc(agentPerformanceMetrics.windowStart))
    .limit(1);

  const currentMetrics = existing[0];
  
  // Calculate updated metrics
  const newTasksCompleted = (currentMetrics?.tasksCompleted || 0) + tasksCompleted;
  const newTasksFailed = (currentMetrics?.tasksFailed || 0) + tasksFailed;
  const totalTasks = newTasksCompleted + newTasksFailed + tasksInProgress;
  
  // Update average duration (weighted)
  const newAvgDuration = currentMetrics?.avgTaskDuration
    ? (currentMetrics.avgTaskDuration * currentMetrics.tasksCompleted + avgTaskDuration * tasksCompleted) / 
      (currentMetrics.tasksCompleted + tasksCompleted)
    : avgTaskDuration;

  const successRate = totalTasks > 0 ? newTasksCompleted / totalTasks : 1;
  const newErrorRate = totalTasks > 0 ? newTasksFailed / totalTasks : 0;

  // Calculate health score
  const healthScore = calculateHealthScore({
    errorRate: newErrorRate,
    successRate,
    avgDuration: newAvgDuration,
    workload: workloadPercentage,
    queueDepth,
    cacheHitRate,
    lastActiveMinutes: 0, // just active
  });

  // Determine status
  let status: 'healthy' | 'degraded' | 'overloaded' | 'failing' = 'healthy';
  if (healthScore < 50) status = 'failing';
  else if (healthScore < 70) status = 'degraded';
  else if (workloadPercentage > 90) status = 'overloaded';

  // Update Prometheus metrics
  if (tasksCompleted > 0) {
    agentTasksCompleted.inc(
      { agent_id: agentId, agent_name: agentName || agentId, agent_domain: agentDomain || 'unknown' },
      tasksCompleted
    );
  }
  if (tasksFailed > 0) {
    agentTasksFailed.inc(
      { agent_id: agentId, agent_name: agentName || agentId, agent_domain: agentDomain || 'unknown' },
      tasksFailed
    );
  }
  if (avgTaskDuration > 0) {
    agentTaskDuration.observe(
      { agent_id: agentId, agent_name: agentName || agentId, agent_domain: agentDomain || 'unknown' },
      avgTaskDuration
    );
  }
  
  agentErrorRate.set({ agent_id: agentId, agent_name: agentName || agentId }, newErrorRate);
  agentWorkload.set(
    { agent_id: agentId, agent_name: agentName || agentId, agent_domain: agentDomain || 'unknown' },
    workloadPercentage
  );
  agentHealthScore.set(
    { agent_id: agentId, agent_name: agentName || agentId, status },
    healthScore
  );
  agentQueueDepth.set({ agent_id: agentId, agent_name: agentName || agentId }, queueDepth);
  agentConcurrentTasks.set({ agent_id: agentId, agent_name: agentName || agentId }, concurrentTasks);
  
  if (cacheHitRate !== undefined) {
    agentCacheHitRate.set({ agent_id: agentId, agent_name: agentName || agentId }, cacheHitRate);
  }

  // Insert or update database record
  const record: InsertAgentPerformanceMetrics = {
    agentId,
    agentName,
    agentDomain,
    tasksCompleted: newTasksCompleted,
    tasksInProgress,
    tasksFailed: newTasksFailed,
    totalTasks,
    avgTaskDuration: newAvgDuration,
    errorRate: newErrorRate,
    errorCount: newTasksFailed,
    successRate,
    cacheHitRate,
    workloadPercentage,
    queueDepth,
    concurrentTasks,
    healthScore,
    status,
    lastTaskCompleted: tasksCompleted > 0 ? new Date() : currentMetrics?.lastTaskCompleted,
    lastError: tasksFailed > 0 ? new Date() : currentMetrics?.lastError,
    metadata,
    timeWindow: 'hour',
    windowStart: new Date(Math.floor(Date.now() / 3600000) * 3600000), // round to hour
  };

  let result: SelectAgentPerformanceMetrics;
  
  if (currentMetrics) {
    // Update existing record
    const [updated] = await db
      .update(agentPerformanceMetrics)
      .set({
        ...record,
        updatedAt: new Date(),
      })
      .where(eq(agentPerformanceMetrics.id, currentMetrics.id))
      .returning();
    result = updated;
  } else {
    // Insert new record
    const [inserted] = await db
      .insert(agentPerformanceMetrics)
      .values(record)
      .returning();
    result = inserted;
  }
  
  // Trigger alerts if thresholds exceeded
  await detectAndTriggerAlerts(metrics);
  
  // Auto-resolve alerts if metrics improved
  await autoResolveAlerts(agentId, metrics);
  
  return result;
}

// ============================================================================
// CORE FUNCTION 2: CALCULATE HEALTH SCORE
// ============================================================================

/**
 * Calculate agent health score (0-100) based on multiple factors
 * 
 * Scoring weights:
 * - Success Rate: 25%
 * - Error Rate: 25%
 * - Performance: 20%
 * - Workload: 15%
 * - Cache Performance: 10%
 * - Recency: 5%
 * 
 * Usage:
 * ```typescript
 * const score = calculateHealthScore({
 *   errorRate: 0.02,
 *   successRate: 0.98,
 *   avgDuration: 220,
 *   workload: 65,
 *   queueDepth: 5,
 *   cacheHitRate: 0.98,
 *   lastActiveMinutes: 2
 * });
 * // score: ~94
 * ```
 */
export function calculateHealthScore(factors: HealthScoreFactors): number {
  let score = 0;

  // Success rate (25 points max)
  score += factors.successRate * 25;

  // Error rate (25 points max, inverse)
  score += (1 - factors.errorRate) * 25;

  // Performance - duration compared to baseline (20 points max)
  // Baseline: 300s (5min), ideal: <60s
  const durationScore = Math.max(0, Math.min(1, 1 - factors.avgDuration / 600));
  score += durationScore * 20;

  // Workload - ideal is 50-70% (15 points max)
  let workloadScore = 0;
  if (factors.workload < 40) {
    workloadScore = factors.workload / 40 * 0.8; // underutilized
  } else if (factors.workload <= 80) {
    workloadScore = 1; // ideal range
  } else {
    workloadScore = Math.max(0, 1 - (factors.workload - 80) / 20); // overloaded
  }
  score += workloadScore * 15;

  // Cache performance (10 points max)
  if (factors.cacheHitRate !== undefined) {
    score += factors.cacheHitRate * 10;
  } else {
    score += 8; // neutral if not applicable
  }

  // Recency - penalize if not active recently (5 points max)
  const recencyScore = Math.max(0, 1 - factors.lastActiveMinutes / 60); // penalty after 60min
  score += recencyScore * 5;

  return Math.round(Math.max(0, Math.min(100, score)));
}

// ============================================================================
// CORE FUNCTION 3: MONITOR WORKLOAD
// ============================================================================

/**
 * Track capacity utilization and identify overloaded agents
 * 
 * Returns workload status for all agents or specific agent
 * 
 * Usage:
 * ```typescript
 * const allWorkloads = await monitorWorkload();
 * const agent54 = await monitorWorkload('AGENT_54');
 * ```
 */
export async function monitorWorkload(agentId?: string): Promise<WorkloadStatus[]> {
  const conditions = [
    eq(agentPerformanceMetrics.timeWindow, 'hour'),
    gte(agentPerformanceMetrics.windowStart, new Date(Date.now() - 3600000))
  ];

  if (agentId) {
    conditions.push(eq(agentPerformanceMetrics.agentId, agentId));
  }

  const metrics = await db
    .select()
    .from(agentPerformanceMetrics)
    .where(and(...conditions))
    .orderBy(desc(agentPerformanceMetrics.workloadPercentage));

  return metrics.map((m) => {
    let status: 'healthy' | 'busy' | 'overloaded' | 'failing' = 'healthy';
    let recommendedAction: string | undefined;

    if (m.workloadPercentage! > 95) {
      status = 'failing';
      recommendedAction = 'CRITICAL: Immediate intervention required. Scale up or redistribute tasks.';
    } else if (m.workloadPercentage! > 85) {
      status = 'overloaded';
      recommendedAction = 'Add capacity or reduce incoming task rate.';
    } else if (m.workloadPercentage! > 70) {
      status = 'busy';
      recommendedAction = 'Monitor closely. Consider scaling if trend continues.';
    }

    return {
      agentId: m.agentId,
      agentName: m.agentName || undefined,
      workloadPercentage: m.workloadPercentage!,
      status,
      queueDepth: m.queueDepth!,
      concurrentTasks: m.concurrentTasks!,
      maxConcurrentTasks: m.maxConcurrentTasks!,
      recommendedAction,
    };
  });
}

// ============================================================================
// CORE FUNCTION 4: DETECT BOTTLENECKS
// ============================================================================

/**
 * Identify performance issues and bottlenecks across agents
 * 
 * Detection criteria:
 * - High error rate (>5%)
 * - Slow performance (>300s avg)
 * - Overloaded (>90% workload)
 * - Large queue depth (>50 tasks)
 * - Low cache hit rate (<80%)
 * 
 * Usage:
 * ```typescript
 * const bottlenecks = await detectBottlenecks();
 * console.log(`Found ${bottlenecks.length} bottlenecks`);
 * ```
 */
export async function detectBottlenecks(): Promise<Bottleneck[]> {
  const metrics = await db
    .select()
    .from(agentPerformanceMetrics)
    .where(
      and(
        eq(agentPerformanceMetrics.timeWindow, 'hour'),
        gte(agentPerformanceMetrics.windowStart, new Date(Date.now() - 3600000))
      )
    );

  const bottlenecks: Bottleneck[] = [];

  for (const m of metrics) {
    // High error rate
    if (m.errorRate! > 0.05) {
      bottlenecks.push({
        agentId: m.agentId,
        agentName: m.agentName || undefined,
        agentDomain: m.agentDomain || undefined,
        issue: `High error rate: ${(m.errorRate! * 100).toFixed(1)}%`,
        severity: m.errorRate! > 0.2 ? 'critical' : m.errorRate! > 0.1 ? 'high' : 'medium',
        metrics: { errorRate: m.errorRate! },
        recommendation: 'Review recent errors, check for API failures or data quality issues.',
      });
    }

    // Slow performance
    if (m.avgTaskDuration! > 300) {
      bottlenecks.push({
        agentId: m.agentId,
        agentName: m.agentName || undefined,
        agentDomain: m.agentDomain || undefined,
        issue: `Slow task execution: ${m.avgTaskDuration!.toFixed(1)}s average`,
        severity: m.avgTaskDuration! > 600 ? 'high' : 'medium',
        metrics: { avgDuration: m.avgTaskDuration! },
        recommendation: 'Optimize algorithms, add caching, or parallelize operations.',
      });
    }

    // Overloaded
    if (m.workloadPercentage! > 90) {
      bottlenecks.push({
        agentId: m.agentId,
        agentName: m.agentName || undefined,
        agentDomain: m.agentDomain || undefined,
        issue: `Agent overloaded: ${m.workloadPercentage!.toFixed(1)}% capacity`,
        severity: m.workloadPercentage! > 95 ? 'critical' : 'high',
        metrics: { workload: m.workloadPercentage! },
        recommendation: 'Scale horizontally or reduce task assignment rate.',
      });
    }

    // Large queue depth
    if (m.queueDepth! > 50) {
      bottlenecks.push({
        agentId: m.agentId,
        agentName: m.agentName || undefined,
        agentDomain: m.agentDomain || undefined,
        issue: `Large queue backlog: ${m.queueDepth} tasks waiting`,
        severity: m.queueDepth! > 100 ? 'critical' : m.queueDepth! > 75 ? 'high' : 'medium',
        metrics: { queueDepth: m.queueDepth! },
        recommendation: 'Add worker capacity or prioritize critical tasks.',
      });
    }

    // Low cache hit rate
    if (m.cacheHitRate !== null && m.cacheHitRate < 0.8) {
      bottlenecks.push({
        agentId: m.agentId,
        agentName: m.agentName || undefined,
        agentDomain: m.agentDomain || undefined,
        issue: `Poor cache performance: ${(m.cacheHitRate * 100).toFixed(1)}% hit rate`,
        severity: m.cacheHitRate < 0.5 ? 'high' : 'medium',
        metrics: { },
        recommendation: 'Review cache strategy, increase TTL, or pre-warm cache.',
      });
    }
  }

  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  bottlenecks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return bottlenecks;
}

// ============================================================================
// CORE FUNCTION 5: GENERATE REPORT
// ============================================================================

/**
 * Generate comprehensive performance summary report
 * 
 * Usage:
 * ```typescript
 * const report = await generateReport({
 *   startDate: new Date(Date.now() - 24*3600000), // last 24 hours
 *   endDate: new Date()
 * });
 * console.log(JSON.stringify(report, null, 2));
 * ```
 */
export async function generateReport(options?: {
  startDate?: Date;
  endDate?: Date;
  agentDomain?: string;
}): Promise<PerformanceReport> {
  const startDate = options?.startDate || new Date(Date.now() - 24 * 3600000); // default: last 24h
  const endDate = options?.endDate || new Date();
  
  const conditions = [
    gte(agentPerformanceMetrics.windowStart, startDate),
    lte(agentPerformanceMetrics.windowStart, endDate)
  ];

  if (options?.agentDomain) {
    conditions.push(eq(agentPerformanceMetrics.agentDomain, options.agentDomain));
  }

  const metrics = await db
    .select()
    .from(agentPerformanceMetrics)
    .where(and(...conditions));

  // Calculate summary statistics
  const totalAgents = new Set(metrics.map(m => m.agentId)).size;
  const healthyAgents = metrics.filter(m => m.status === 'healthy').length;
  const degradedAgents = metrics.filter(m => m.status === 'degraded').length;
  const overloadedAgents = metrics.filter(m => m.status === 'overloaded').length;
  const failingAgents = metrics.filter(m => m.status === 'failing').length;
  const avgHealthScore = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + (m.healthScore || 0), 0) / metrics.length
    : 100;

  // Identify top performers (highest health score + most tasks completed)
  const topPerformers = metrics
    .sort((a, b) => {
      const scoreA = (a.healthScore || 0) + (a.tasksCompleted || 0) / 100;
      const scoreB = (b.healthScore || 0) + (b.tasksCompleted || 0) / 100;
      return scoreB - scoreA;
    })
    .slice(0, 10)
    .map(m => ({
      agentId: m.agentId,
      agentName: m.agentName || undefined,
      healthScore: m.healthScore || 0,
      tasksCompleted: m.tasksCompleted || 0,
      avgDuration: m.avgTaskDuration || 0,
    }));

  // Detect bottlenecks
  const bottlenecks = await detectBottlenecks();

  // Get active alerts
  const activeAlerts = await getActiveAlerts();

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (failingAgents > 0) {
    recommendations.push(`🚨 ${failingAgents} agents are failing. Immediate action required.`);
  }
  if (overloadedAgents > totalAgents * 0.3) {
    recommendations.push(`⚠️ ${((overloadedAgents / totalAgents) * 100).toFixed(0)}% of agents are overloaded. Consider scaling.`);
  }
  if (avgHealthScore < 70) {
    recommendations.push(`📉 Average health score is ${avgHealthScore.toFixed(1)}. System-wide optimization needed.`);
  }
  if (bottlenecks.length > 5) {
    recommendations.push(`🔍 ${bottlenecks.length} bottlenecks detected. Prioritize critical issues.`);
  }
  if (healthyAgents === totalAgents) {
    recommendations.push(`✅ All agents healthy. System performing optimally.`);
  }

  const duration = endDate.getTime() - startDate.getTime();
  const durationHours = Math.floor(duration / 3600000);
  const durationMinutes = Math.floor((duration % 3600000) / 60000);

  return {
    generatedAt: new Date(),
    timeWindow: {
      start: startDate,
      end: endDate,
      duration: `${durationHours}h ${durationMinutes}m`,
    },
    summary: {
      totalAgents,
      healthyAgents,
      degradedAgents,
      overloadedAgents,
      failingAgents,
      avgHealthScore: Math.round(avgHealthScore * 10) / 10,
    },
    topPerformers,
    bottlenecks: bottlenecks.slice(0, 20), // top 20 bottlenecks
    activeAlerts,
    recommendations,
  };
}

// ============================================================================
// CORE FUNCTION 6: ALERT MANAGEMENT
// ============================================================================

/**
 * Check if an alert should be triggered (respects cooldown period)
 */
async function shouldTriggerAlert(
  agentId: string,
  alertType: string,
  cooldownMs: number = ALERT_COOLDOWN_MS
): Promise<boolean> {
  const cooldownTime = new Date(Date.now() - cooldownMs);
  
  const recentAlert = await db
    .select()
    .from(agentPerformanceAlerts)
    .where(
      and(
        eq(agentPerformanceAlerts.agentId, agentId),
        eq(agentPerformanceAlerts.alertType, alertType),
        eq(agentPerformanceAlerts.status, 'active'),
        gte(agentPerformanceAlerts.createdAt, cooldownTime)
      )
    )
    .limit(1);

  return recentAlert.length === 0;
}

/**
 * Trigger a performance alert
 * 
 * Usage:
 * ```typescript
 * await triggerAlert({
 *   agentId: 'AGENT_54',
 *   agentName: 'Accessibility',
 *   alertType: 'high_error_rate',
 *   severity: 'high',
 *   message: 'Error rate exceeds 5%',
 *   threshold: 0.05,
 *   actualValue: 0.08
 * });
 * ```
 */
export async function triggerAlert(options: AlertOptions): Promise<SelectAgentPerformanceAlert | null> {
  const {
    agentId,
    agentName,
    agentDomain,
    alertType,
    severity,
    message,
    threshold,
    actualValue,
    metadata = {},
  } = options;

  // Check cooldown
  const shouldTrigger = await shouldTriggerAlert(agentId, alertType);
  if (!shouldTrigger) {
    console.log(`Alert cooldown active for ${agentId} - ${alertType}`);
    return null;
  }

  // Create alert
  const [alert] = await db
    .insert(agentPerformanceAlerts)
    .values({
      agentId,
      agentName,
      agentDomain,
      alertType,
      severity,
      message,
      threshold,
      actualValue,
      status: 'active',
      metadata,
    })
    .returning();

  console.log(`🚨 ALERT [${severity.toUpperCase()}]: ${agentId} - ${message}`);
  
  return alert;
}

/**
 * Detect and trigger alerts based on current metrics
 * 
 * This is called automatically after trackMetrics updates
 */
export async function detectAndTriggerAlerts(
  metrics: AgentMetrics,
  thresholds: AlertThresholds = DEFAULT_ALERT_THRESHOLDS
): Promise<SelectAgentPerformanceAlert[]> {
  const {
    agentId,
    agentName,
    agentDomain,
    errorRate = 0,
    avgTaskDuration = 0,
    workloadPercentage = 0,
    queueDepth = 0,
    cacheHitRate,
  } = metrics;

  const alerts: SelectAgentPerformanceAlert[] = [];

  // Get current health score from database
  const [current] = await db
    .select()
    .from(agentPerformanceMetrics)
    .where(
      and(
        eq(agentPerformanceMetrics.agentId, agentId),
        eq(agentPerformanceMetrics.timeWindow, 'hour'),
        gte(agentPerformanceMetrics.windowStart, new Date(Date.now() - 3600000))
      )
    )
    .orderBy(desc(agentPerformanceMetrics.windowStart))
    .limit(1);

  const healthScore = current?.healthScore || 100;

  // Alert 1: High Error Rate
  if (errorRate > thresholds.errorRate) {
    const severity = errorRate > 0.2 ? 'critical' : errorRate > 0.1 ? 'high' : 'medium';
    const alert = await triggerAlert({
      agentId,
      agentName,
      agentDomain,
      alertType: 'high_error_rate',
      severity,
      message: `Error rate ${(errorRate * 100).toFixed(1)}% exceeds threshold ${(thresholds.errorRate * 100).toFixed(1)}%`,
      threshold: thresholds.errorRate,
      actualValue: errorRate,
      metadata: { recommendation: 'Review recent errors and fix root causes' },
    });
    if (alert) alerts.push(alert);
  }

  // Alert 2: Slow Performance
  if (avgTaskDuration > thresholds.slowPerformance) {
    const severity = avgTaskDuration > 600 ? 'high' : 'medium';
    const alert = await triggerAlert({
      agentId,
      agentName,
      agentDomain,
      alertType: 'slow_performance',
      severity,
      message: `Average task duration ${avgTaskDuration.toFixed(0)}s exceeds threshold ${thresholds.slowPerformance}s`,
      threshold: thresholds.slowPerformance,
      actualValue: avgTaskDuration,
      metadata: { recommendation: 'Optimize algorithms or add caching' },
    });
    if (alert) alerts.push(alert);
  }

  // Alert 3: High Workload
  if (workloadPercentage > thresholds.workloadPercentage) {
    const severity = workloadPercentage > 95 ? 'critical' : workloadPercentage > 90 ? 'high' : 'medium';
    const alert = await triggerAlert({
      agentId,
      agentName,
      agentDomain,
      alertType: 'high_workload',
      severity,
      message: `Workload ${workloadPercentage.toFixed(0)}% exceeds threshold ${thresholds.workloadPercentage}%`,
      threshold: thresholds.workloadPercentage,
      actualValue: workloadPercentage,
      metadata: { recommendation: 'Scale horizontally or reduce task assignment rate' },
    });
    if (alert) alerts.push(alert);
  }

  // Alert 4: Queue Backup
  if (queueDepth > thresholds.queueDepth) {
    const severity = queueDepth > 100 ? 'critical' : queueDepth > 75 ? 'high' : 'medium';
    const alert = await triggerAlert({
      agentId,
      agentName,
      agentDomain,
      alertType: 'queue_backup',
      severity,
      message: `Queue depth ${queueDepth} exceeds threshold ${thresholds.queueDepth}`,
      threshold: thresholds.queueDepth,
      actualValue: queueDepth,
      metadata: { recommendation: 'Add worker capacity or prioritize critical tasks' },
    });
    if (alert) alerts.push(alert);
  }

  // Alert 5: Low Cache Hit Rate
  if (cacheHitRate !== undefined && cacheHitRate < thresholds.cacheHitRate) {
    const severity = cacheHitRate < 0.5 ? 'high' : 'medium';
    const alert = await triggerAlert({
      agentId,
      agentName,
      agentDomain,
      alertType: 'low_cache_hit',
      severity,
      message: `Cache hit rate ${(cacheHitRate * 100).toFixed(1)}% below threshold ${(thresholds.cacheHitRate * 100).toFixed(1)}%`,
      threshold: thresholds.cacheHitRate,
      actualValue: cacheHitRate,
      metadata: { recommendation: 'Review cache strategy or increase TTL' },
    });
    if (alert) alerts.push(alert);
  }

  // Alert 6: Health Score Degraded
  if (healthScore < thresholds.healthScore) {
    const severity = healthScore < 50 ? 'critical' : healthScore < 60 ? 'high' : 'medium';
    const alert = await triggerAlert({
      agentId,
      agentName,
      agentDomain,
      alertType: 'health_degraded',
      severity,
      message: `Health score ${healthScore.toFixed(0)} below threshold ${thresholds.healthScore}`,
      threshold: thresholds.healthScore,
      actualValue: healthScore,
      metadata: { recommendation: 'Investigate multiple performance factors' },
    });
    if (alert) alerts.push(alert);
  }

  return alerts;
}

/**
 * Get all active alerts
 * 
 * Usage:
 * ```typescript
 * const activeAlerts = await getActiveAlerts();
 * const agent54Alerts = await getActiveAlerts('AGENT_54');
 * const criticalAlerts = await getActiveAlerts(undefined, 'critical');
 * ```
 */
export async function getActiveAlerts(
  agentId?: string,
  severity?: 'low' | 'medium' | 'high' | 'critical'
): Promise<SelectAgentPerformanceAlert[]> {
  const conditions = [eq(agentPerformanceAlerts.status, 'active')];

  if (agentId) {
    conditions.push(eq(agentPerformanceAlerts.agentId, agentId));
  }

  if (severity) {
    conditions.push(eq(agentPerformanceAlerts.severity, severity));
  }

  return await db
    .select()
    .from(agentPerformanceAlerts)
    .where(and(...conditions))
    .orderBy(
      sql`CASE 
        WHEN severity = 'critical' THEN 1
        WHEN severity = 'high' THEN 2
        WHEN severity = 'medium' THEN 3
        ELSE 4
      END`,
      desc(agentPerformanceAlerts.createdAt)
    );
}

/**
 * Acknowledge an alert
 * 
 * Usage:
 * ```typescript
 * await acknowledgeAlert(123, 'admin_user');
 * ```
 */
export async function acknowledgeAlert(
  alertId: number,
  acknowledgedBy: string
): Promise<SelectAgentPerformanceAlert> {
  const [alert] = await db
    .update(agentPerformanceAlerts)
    .set({
      status: 'acknowledged',
      acknowledgedBy,
      acknowledgedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(agentPerformanceAlerts.id, alertId))
    .returning();

  return alert;
}

/**
 * Resolve an alert
 * 
 * Usage:
 * ```typescript
 * await resolveAlert(123);
 * ```
 */
export async function resolveAlert(alertId: number): Promise<SelectAgentPerformanceAlert> {
  const [alert] = await db
    .update(agentPerformanceAlerts)
    .set({
      status: 'resolved',
      resolvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(agentPerformanceAlerts.id, alertId))
    .returning();

  return alert;
}

/**
 * Dismiss an alert
 * 
 * Usage:
 * ```typescript
 * await dismissAlert(123);
 * ```
 */
export async function dismissAlert(alertId: number): Promise<SelectAgentPerformanceAlert> {
  const [alert] = await db
    .update(agentPerformanceAlerts)
    .set({
      status: 'dismissed',
      updatedAt: new Date(),
    })
    .where(eq(agentPerformanceAlerts.id, alertId))
    .returning();

  return alert;
}

/**
 * Auto-resolve alerts when metrics improve
 * 
 * Called automatically after metrics updates
 */
export async function autoResolveAlerts(agentId: string, metrics: AgentMetrics): Promise<number> {
  const activeAlerts = await db
    .select()
    .from(agentPerformanceAlerts)
    .where(
      and(
        eq(agentPerformanceAlerts.agentId, agentId),
        eq(agentPerformanceAlerts.status, 'active')
      )
    );

  let resolvedCount = 0;

  for (const alert of activeAlerts) {
    let shouldResolve = false;

    // Check if the condition that triggered the alert has improved
    switch (alert.alertType) {
      case 'high_error_rate':
        shouldResolve = (metrics.errorRate || 0) <= (alert.threshold || 0.05);
        break;
      case 'slow_performance':
        shouldResolve = (metrics.avgTaskDuration || 0) <= (alert.threshold || 300);
        break;
      case 'high_workload':
        shouldResolve = (metrics.workloadPercentage || 0) <= (alert.threshold || 80);
        break;
      case 'queue_backup':
        shouldResolve = (metrics.queueDepth || 0) <= (alert.threshold || 50);
        break;
      case 'low_cache_hit':
        shouldResolve = (metrics.cacheHitRate || 0) >= (alert.threshold || 0.8);
        break;
      case 'health_degraded':
        // Get current health score
        const [current] = await db
          .select()
          .from(agentPerformanceMetrics)
          .where(
            and(
              eq(agentPerformanceMetrics.agentId, agentId),
              eq(agentPerformanceMetrics.timeWindow, 'hour'),
              gte(agentPerformanceMetrics.windowStart, new Date(Date.now() - 3600000))
            )
          )
          .orderBy(desc(agentPerformanceMetrics.windowStart))
          .limit(1);
        shouldResolve = (current?.healthScore || 100) >= (alert.threshold || 70);
        break;
    }

    if (shouldResolve) {
      await resolveAlert(alert.id);
      resolvedCount++;
      console.log(`✅ Auto-resolved alert: ${alert.alertType} for ${agentId}`);
    }
  }

  return resolvedCount;
}

// ============================================================================
// BULLMQ INTEGRATION
// ============================================================================

/**
 * Track BullMQ job completion and update agent metrics
 */
export async function trackBullMQJob(job: Job, duration: number, success: boolean): Promise<void> {
  const agentId = job.data.agentId || job.data.agent_id;
  const agentName = job.data.agentName || job.data.agent_name;
  const agentDomain = job.data.agentDomain || job.data.agent_domain;

  if (!agentId) {
    console.warn('BullMQ job missing agentId, cannot track performance');
    return;
  }

  await trackMetrics({
    agentId,
    agentName,
    agentDomain,
    tasksCompleted: success ? 1 : 0,
    tasksFailed: success ? 0 : 1,
    avgTaskDuration: duration,
    metadata: {
      jobId: job.id,
      jobName: job.name,
      queueName: job.queueName,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Monitor BullMQ queue depth for workload tracking
 */
export async function monitorBullMQQueue(queueName: string, agentId: string): Promise<void> {
  if (!isRedisConnected()) {
    return;
  }

  const redis = getRedisClient();
  if (!redis) return;

  try {
    const queue = new Queue(queueName, { connection: redis });
    const counts = await queue.getJobCounts('waiting', 'active');
    
    await trackMetrics({
      agentId,
      queueDepth: counts.waiting || 0,
      concurrentTasks: counts.active || 0,
    });
  } catch (error) {
    console.error(`Error monitoring queue ${queueName}:`, error);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const AgentPerformanceTracker = {
  // Core Metrics
  trackMetrics,
  calculateHealthScore,
  monitorWorkload,
  detectBottlenecks,
  generateReport,
  
  // BullMQ Integration
  trackBullMQJob,
  monitorBullMQQueue,
  
  // Alert Management
  triggerAlert,
  detectAndTriggerAlerts,
  getActiveAlerts,
  acknowledgeAlert,
  resolveAlert,
  dismissAlert,
  autoResolveAlerts,
  
  // Configuration
  DEFAULT_ALERT_THRESHOLDS,
};

export default AgentPerformanceTracker;
