import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

/**
 * Prometheus Metrics Collection
 * Custom metrics for application monitoring
 */

// Create a Registry
export const register = new Registry();

// Lazy initialization of default metrics to avoid blocking startup
let metricsInitialized = false;
function ensureMetricsInitialized() {
  if (!metricsInitialized) {
    collectDefaultMetrics({ register });
    metricsInitialized = true;
  }
}

// Initialize metrics on first access
export function initializeMetrics() {
  ensureMetricsInitialized();
}

// Custom Metrics

// HTTP Request Duration
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

// HTTP Request Total
export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Active Users
export const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Number of currently active users',
  registers: [register],
});

// Database Query Duration
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
  registers: [register],
});

// Database Connections
export const dbConnections = new Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections',
  registers: [register],
});

// AI Request Duration
export const aiRequestDuration = new Histogram({
  name: 'ai_request_duration_seconds',
  help: 'Duration of AI API requests in seconds',
  labelNames: ['provider', 'model'],
  buckets: [0.5, 1, 2, 5, 10, 20, 30],
  registers: [register],
});

// AI Request Total
export const aiRequestTotal = new Counter({
  name: 'ai_requests_total',
  help: 'Total number of AI API requests',
  labelNames: ['provider', 'model', 'status'],
  registers: [register],
});

// Life CEO Agent Invocations
export const lifeCeoAgentInvocations = new Counter({
  name: 'life_ceo_agent_invocations_total',
  help: 'Total number of Life CEO agent invocations',
  labelNames: ['agent_id', 'status'],
  registers: [register],
});

// Event Creation
export const eventCreations = new Counter({
  name: 'events_created_total',
  help: 'Total number of events created',
  labelNames: ['event_type'],
  registers: [register],
});

// Event RSVPs
export const eventRsvps = new Counter({
  name: 'event_rsvps_total',
  help: 'Total number of event RSVPs',
  labelNames: ['event_type', 'action'],
  registers: [register],
});

// Post Creation
export const postCreations = new Counter({
  name: 'posts_created_total',
  help: 'Total number of posts created',
  labelNames: ['visibility'],
  registers: [register],
});

// Post Reactions
export const postReactions = new Counter({
  name: 'post_reactions_total',
  help: 'Total number of post reactions',
  labelNames: ['reaction_type'],
  registers: [register],
});

// Housing Bookings
export const housingBookings = new Counter({
  name: 'housing_bookings_total',
  help: 'Total number of housing bookings',
  labelNames: ['status'],
  registers: [register],
});

// Stripe Payments
export const stripePayments = new Counter({
  name: 'stripe_payments_total',
  help: 'Total number of Stripe payments',
  labelNames: ['type', 'status'],
  registers: [register],
});

// Cache Hit Rate
export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
  registers: [register],
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
  registers: [register],
});

// Background Job Duration
export const jobDuration = new Histogram({
  name: 'background_job_duration_seconds',
  help: 'Duration of background jobs in seconds',
  labelNames: ['job_type', 'status'],
  buckets: [1, 5, 10, 30, 60, 120, 300],
  registers: [register],
});

// Background Job Total
export const jobTotal = new Counter({
  name: 'background_jobs_total',
  help: 'Total number of background jobs processed',
  labelNames: ['job_type', 'status'],
  registers: [register],
});

// Error Rate
export const errorTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity'],
  registers: [register],
});

// WebSocket Connections
export const wsConnections = new Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections',
  registers: [register],
});

// Admin Workflow Actions
export const adminWorkflowActions = new Counter({
  name: 'admin_workflow_actions_total',
  help: 'Total number of admin workflow actions',
  labelNames: ['workflow_type', 'action'],
  registers: [register],
});

// ============================================================================
// AGENT PERFORMANCE METRICS (TRACK 1 BATCH 5)
// ============================================================================

// Agent Tasks Completed
export const agentTasksCompleted = new Counter({
  name: 'agent_tasks_completed_total',
  help: 'Total number of tasks completed by agents',
  labelNames: ['agent_id', 'agent_name', 'agent_domain'],
  registers: [register],
});

// Agent Tasks Failed
export const agentTasksFailed = new Counter({
  name: 'agent_tasks_failed_total',
  help: 'Total number of tasks failed by agents',
  labelNames: ['agent_id', 'agent_name', 'agent_domain'],
  registers: [register],
});

// Agent Task Duration
export const agentTaskDuration = new Histogram({
  name: 'agent_task_duration_seconds',
  help: 'Duration of agent tasks in seconds',
  labelNames: ['agent_id', 'agent_name', 'agent_domain'],
  buckets: [1, 5, 10, 30, 60, 120, 300, 600], // 1s to 10min
  registers: [register],
});

// Agent Error Rate
export const agentErrorRate = new Gauge({
  name: 'agent_error_rate',
  help: 'Current error rate for agents (0-1)',
  labelNames: ['agent_id', 'agent_name'],
  registers: [register],
});

// Agent Cache Hit Rate
export const agentCacheHitRate = new Gauge({
  name: 'agent_cache_hit_rate',
  help: 'Current cache hit rate for agents (0-1)',
  labelNames: ['agent_id', 'agent_name'],
  registers: [register],
});

// Agent Workload Percentage
export const agentWorkload = new Gauge({
  name: 'agent_workload_percentage',
  help: 'Current workload percentage for agents (0-100)',
  labelNames: ['agent_id', 'agent_name', 'agent_domain'],
  registers: [register],
});

// Agent Health Score
export const agentHealthScore = new Gauge({
  name: 'agent_health_score',
  help: 'Current health score for agents (0-100)',
  labelNames: ['agent_id', 'agent_name', 'status'],
  registers: [register],
});

// Agent Queue Depth
export const agentQueueDepth = new Gauge({
  name: 'agent_queue_depth',
  help: 'Current queue depth for agents',
  labelNames: ['agent_id', 'agent_name'],
  registers: [register],
});

// Agent Concurrent Tasks
export const agentConcurrentTasks = new Gauge({
  name: 'agent_concurrent_tasks',
  help: 'Current number of concurrent tasks for agents',
  labelNames: ['agent_id', 'agent_name'],
  registers: [register],
});

/**
 * Middleware to track HTTP metrics
 */
export function metricsMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path || 'unknown';
    
    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode,
      },
      duration
    );
    
    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });
  
  next();
}

/**
 * Track database query metrics
 */
export function trackDbQuery(queryType: string, table: string, duration: number) {
  dbQueryDuration.observe({ query_type: queryType, table }, duration);
}

/**
 * Track AI request metrics
 */
export function trackAiRequest(provider: string, model: string, duration: number, status: string) {
  aiRequestDuration.observe({ provider, model }, duration);
  aiRequestTotal.inc({ provider, model, status });
}

/**
 * Export metrics endpoint handler
 */
export async function metricsHandler(req: any, res: any) {
  ensureMetricsInitialized();
  res.set('Content-Type', register.contentType);
  const metrics = await register.metrics();
  res.end(metrics);
}
