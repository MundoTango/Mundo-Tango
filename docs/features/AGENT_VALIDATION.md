# Agent Validation Protocol Documentation

**Version:** 1.0  
**Last Updated:** November 2, 2025  
**Status:** Production  
**Blocker ID:** BLOCKER-8  
**Owner:** Platform Reliability Team  

---

## Table of Contents

1. [Overview](#overview)
2. [Health Check System](#health-check-system)
3. [Validation Types](#validation-types)
4. [Batch Validation](#batch-validation)
5. [Fallback Coordination](#fallback-coordination)
6. [Error Detection](#error-detection)
7. [Performance Monitoring](#performance-monitoring)
8. [Agent Restart Protocol](#agent-restart-protocol)
9. [Database Schema](#database-schema)
10. [API Reference](#api-reference)

---

## Overview

The Agent Validation Protocol monitors the health and performance of all 134 ESA (Element-Subject-Agent) agents in the Mundo Tango platform. It provides automated health checks, fallback coordination, and degradation alerts to ensure system reliability.

### System Architecture

```
┌──────────────────────┐
│  Validation Service  │ (Orchestrator)
└──────────┬───────────┘
           │
    ┌──────▼──────┐
    │  Scheduler  │ (Cron jobs)
    └──────┬──────┘
           │
  ┌────────▼────────┐
  │   Health Check  │ (Per agent)
  └────────┬────────┘
           │
  ┌────────▼────────┐
  │   Validation    │ (4 types)
  └────────┬────────┘
           │
  ┌────────▼────────┐
  │  Fallback Logic │ (Auto-recovery)
  └─────────────────┘
```

### Core Capabilities

- **134 Agent Monitoring**: Track health of all ESA agents
- **4 Validation Types**: Availability, Performance, Integration, Fallback
- **Batch Processing**: Validate 10 agents simultaneously
- **Auto-Fallback**: Automatic failover to backup agents
- **Real-time Alerts**: Degradation notifications via WebSocket
- **Health Dashboard**: Admin UI for system overview

---

## Health Check System

### Agent Health States

```typescript
enum AgentHealthStatus {
  HEALTHY = 'healthy',       // Response time < 1s, no errors
  DEGRADED = 'degraded',     // Response time 1-3s
  FAILING = 'failing',       // Response time > 3s or high error rate
  OFFLINE = 'offline',       // No response
  UNKNOWN = 'unknown',       // Not yet checked
}
```

### Health Check Algorithm

```typescript
/**
 * Run health check on a specific agent
 * 
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 * 
 * @param agentCode - Unique identifier for the agent
 * @returns Health status with metrics
 */
static async runHealthCheck(agentCode: string): Promise<AgentHealthStatus> {
  const startTime = Date.now();

  try {
    // Verify agent exists in registry
    const agent = await db
      .select()
      .from(esaAgents)
      .where(eq(esaAgents.agentCode, agentCode))
      .limit(1);

    if (agent.length === 0) {
      throw new Error(`Agent ${agentCode} not found in registry`);
    }

    // Simulate health check (in production, would ping agent endpoint)
    // This could be HTTP health endpoint, WebSocket ping, or queue check
    const responseTime = Date.now() - startTime;
    
    // Determine status based on response time
    let status: AgentHealthStatus;
    if (responseTime < 1000) {
      status = 'healthy';
    } else if (responseTime < 3000) {
      status = 'degraded';
    } else {
      status = 'failing';
    }

    // Get current error count from recent history
    const [healthRecord] = await executeRawQuery<any>(
      `SELECT error_count FROM agent_health 
       WHERE agent_code = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [agentCode]
    );

    const errorCount = healthRecord?.error_count || 0;

    // Store health check result
    await executeRawQuery(
      `INSERT INTO agent_health (
        agent_code, status, last_check_time, response_time_ms, 
        error_count, created_at, updated_at
      ) VALUES ($1, $2, NOW(), $3, $4, NOW(), NOW())`,
      [agentCode, status, responseTime, errorCount]
    );

    return {
      agentCode,
      status,
      lastCheckAt: new Date(),
      responseTime,
      errorCount,
    };
  } catch (error: any) {
    // Agent is offline or encountered error
    await executeRawQuery(
      `INSERT INTO agent_health (
        agent_code, status, last_check_time, error_count, 
        error_details, created_at, updated_at
      ) VALUES ($1, $2, NOW(), 1, $3, NOW(), NOW())`,
      [agentCode, 'offline', JSON.stringify({ error: error.message })]
    );

    return {
      agentCode,
      status: 'offline',
      lastCheckAt: new Date(),
      errorCount: 1,
      errorDetails: { error: error.message },
    };
  }
}
```

---

## Validation Types

### 1. Availability Check

**Purpose**: Verify agent is responsive and accepting requests.

```typescript
async function availabilityCheck(agentCode: string): Promise<ValidationResult> {
  const health = await AgentValidationService.runHealthCheck(agentCode);
  
  let result: 'pass' | 'fail' | 'warning';
  let details: string;
  
  if (health.status === 'offline') {
    result = 'fail';
    details = 'Agent is offline and not responding';
  } else if (health.status === 'failing') {
    result = 'warning';
    details = 'Agent is responding but experiencing issues';
  } else {
    result = 'pass';
    details = 'Agent is available and responsive';
  }
  
  return {
    checkType: 'availability',
    agentCode,
    result,
    details,
    executionTime: Date.now() - startTime,
    fallbackActivated: false,
  };
}
```

### 2. Performance Check

**Purpose**: Measure response time and ensure SLA compliance.

```typescript
async function performanceCheck(agentCode: string): Promise<ValidationResult> {
  const health = await AgentValidationService.runHealthCheck(agentCode);
  
  const SLA_THRESHOLD_MS = 1000;  // 1 second
  const WARNING_THRESHOLD_MS = 3000;  // 3 seconds
  
  let result: 'pass' | 'fail' | 'warning';
  let details: string;
  
  if (health.responseTime && health.responseTime > WARNING_THRESHOLD_MS) {
    result = 'fail';
    details = `Response time ${health.responseTime}ms exceeds SLA (${WARNING_THRESHOLD_MS}ms)`;
  } else if (health.responseTime && health.responseTime > SLA_THRESHOLD_MS) {
    result = 'warning';
    details = `Response time ${health.responseTime}ms is degraded (target: ${SLA_THRESHOLD_MS}ms)`;
  } else {
    result = 'pass';
    details = `Response time ${health.responseTime}ms within SLA`;
  }
  
  return {
    checkType: 'performance',
    agentCode,
    result,
    details,
    executionTime: health.responseTime,
    fallbackActivated: false,
  };
}
```

### 3. Integration Check

**Purpose**: Verify agent can communicate with dependent services.

```typescript
async function integrationCheck(agentCode: string): Promise<ValidationResult> {
  const health = await AgentValidationService.runHealthCheck(agentCode);
  
  const ERROR_THRESHOLD = 5;
  const WARNING_THRESHOLD = 2;
  
  let result: 'pass' | 'fail' | 'warning';
  let details: string;
  
  if (health.errorCount > ERROR_THRESHOLD) {
    result = 'fail';
    details = `Error count ${health.errorCount} exceeds threshold (${ERROR_THRESHOLD})`;
  } else if (health.errorCount > WARNING_THRESHOLD) {
    result = 'warning';
    details = `Error count ${health.errorCount} is elevated (threshold: ${WARNING_THRESHOLD})`;
  } else {
    result = 'pass';
    details = `Error count ${health.errorCount} within acceptable range`;
  }
  
  return {
    checkType: 'integration',
    agentCode,
    result,
    details,
    executionTime: Date.now() - startTime,
    fallbackActivated: false,
  };
}
```

### 4. Fallback Check

**Purpose**: Test failover mechanism and activate backup agents.

```typescript
async function fallbackCheck(agentCode: string): Promise<ValidationResult> {
  const health = await AgentValidationService.runHealthCheck(agentCode);
  
  let fallbackActivated = false;
  let fallbackAgentCode: string | undefined;
  let result: 'pass' | 'fail';
  let details: string;
  
  // Activate fallback if agent is offline or failing
  if (health.status === 'offline' || health.status === 'failing') {
    fallbackActivated = true;
    fallbackAgentCode = await activateFallbackAgent(agentCode);
    
    if (fallbackAgentCode) {
      result = 'pass';
      details = `Fallback agent ${fallbackAgentCode} activated successfully`;
    } else {
      result = 'fail';
      details = 'No fallback agent available - service degradation imminent';
    }
  } else {
    result = 'pass';
    details = 'Agent healthy - no fallback needed';
  }
  
  return {
    checkType: 'fallback',
    agentCode,
    result,
    details,
    executionTime: Date.now() - startTime,
    fallbackActivated,
    fallbackAgentCode,
  };
}
```

---

## Batch Validation

### Parallel Health Checks

```typescript
/**
 * Run health checks on all agents in parallel batches
 * 
 * Batch Size: 10 agents (prevents database overload)
 * Time Complexity: O(n/10) where n = agent count
 * 
 * @returns Array of health statuses for all agents
 */
static async runBatchHealthChecks(): Promise<AgentHealthStatus[]> {
  try {
    // Get all agents from registry
    const agents = await db.select().from(esaAgents);
    console.log(`[Batch Validation] Checking ${agents.length} agents`);

    const BATCH_SIZE = 10;
    const results: AgentHealthStatus[] = [];

    // Process in batches to avoid overwhelming system
    for (let i = 0; i < agents.length; i += BATCH_SIZE) {
      const batch = agents.slice(i, i + BATCH_SIZE);
      
      console.log(`[Batch ${Math.floor(i / BATCH_SIZE) + 1}] Checking agents ${i + 1}-${Math.min(i + BATCH_SIZE, agents.length)}`);
      
      // Run batch in parallel
      const batchResults = await Promise.all(
        batch.map(agent => this.runHealthCheck(agent.agentCode))
      );
      
      results.push(...batchResults);
      
      // Small delay between batches to prevent resource exhaustion
      if (i + BATCH_SIZE < agents.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Generate summary statistics
    const summary = {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      degraded: results.filter(r => r.status === 'degraded').length,
      failing: results.filter(r => r.status === 'failing').length,
      offline: results.filter(r => r.status === 'offline').length,
    };

    console.log('[Batch Validation] Summary:', summary);

    // Alert if too many agents are unhealthy
    const unhealthyPercentage = ((summary.failing + summary.offline) / summary.total) * 100;
    if (unhealthyPercentage > 10) {
      await notifyAdmins({
        severity: 'critical',
        message: `${unhealthyPercentage.toFixed(1)}% of agents are unhealthy`,
        summary,
      });
    }

    return results;
  } catch (error) {
    console.error('[Batch Validation] Error:', error);
    return [];
  }
}
```

### Scheduled Validation

```typescript
// Cron job configuration
// Runs every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('[Cron] Starting scheduled agent validation');
  await AgentValidationService.runBatchHealthChecks();
});

// Critical agents checked more frequently (every minute)
cron.schedule('* * * * *', async () => {
  const criticalAgents = [
    'A1-AUTH',
    'A4-SPAM',
    'A11-PAYMENT',
    'A25-WEBSOCKET',
  ];
  
  for (const agentCode of criticalAgents) {
    await AgentValidationService.runHealthCheck(agentCode);
  }
});
```

---

## Fallback Coordination

### Fallback Strategy

```typescript
/**
 * Activate fallback agent for a failing agent
 * 
 * Strategy:
 * 1. Find agents of same type
 * 2. Filter by health status (healthy only)
 * 3. Exclude the failing agent
 * 4. Select first available
 * 
 * Time Complexity: O(n) where n = agents of same type
 */
private static async activateFallbackAgent(agentCode: string): Promise<string | null> {
  try {
    // Get failing agent info
    const [agent] = await db
      .select()
      .from(esaAgents)
      .where(eq(esaAgents.agentCode, agentCode))
      .limit(1);

    if (!agent) {
      return null;
    }

    // Find backup agents of same type
    const fallbackCandidates = await db
      .select()
      .from(esaAgents)
      .where(eq(esaAgents.agentType, agent.agentType));

    // Filter for healthy active agents (excluding the failing one)
    const healthyFallbacks = fallbackCandidates.filter(
      (a) => a.agentCode !== agentCode && a.status === 'active'
    );

    if (healthyFallbacks.length === 0) {
      console.error(`[Fallback] No backup agents available for ${agentCode}`);
      return null;
    }

    // Select first available fallback
    const fallback = healthyFallbacks[0];
    
    // Log fallback activation
    await executeRawQuery(
      `INSERT INTO fallback_activations (
        primary_agent, fallback_agent, activated_at, reason
      ) VALUES ($1, $2, NOW(), $3)`,
      [agentCode, fallback.agentCode, 'Primary agent unhealthy']
    );

    console.log(`[Fallback] Activated ${fallback.agentCode} for ${agentCode}`);
    
    return fallback.agentCode;
  } catch (error) {
    console.error('[Fallback] Activation error:', error);
    return null;
  }
}
```

### Fallback Recovery

```typescript
/**
 * Check if primary agent has recovered and deactivate fallback
 */
async function checkFallbackRecovery(): Promise<void> {
  // Get all active fallbacks
  const activeFallbacks = await executeRawQuery<any>(
    `SELECT * FROM fallback_activations WHERE deactivated_at IS NULL`
  );

  for (const fallback of activeFallbacks) {
    // Check if primary agent is healthy again
    const primaryHealth = await AgentValidationService.runHealthCheck(
      fallback.primary_agent
    );

    if (primaryHealth.status === 'healthy') {
      // Deactivate fallback
      await executeRawQuery(
        `UPDATE fallback_activations 
         SET deactivated_at = NOW(), 
             recovery_reason = 'Primary agent recovered'
         WHERE id = $1`,
        [fallback.id]
      );

      console.log(`[Fallback] Deactivated fallback for ${fallback.primary_agent} - primary recovered`);
    }
  }
}
```

---

## Error Detection

### Error Categorization

```typescript
enum ErrorCategory {
  NETWORK = 'network',           // Connection timeouts, DNS failures
  AUTHENTICATION = 'authentication',  // Auth token expired/invalid
  RATE_LIMIT = 'rate_limit',     // API rate limiting
  DEPENDENCY = 'dependency',     // External service down
  INTERNAL = 'internal',         // Agent logic error
  DATABASE = 'database',         // DB connection/query errors
}

interface AgentError {
  agentCode: string;
  category: ErrorCategory;
  message: string;
  stackTrace?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

### Error Logging

```typescript
async function logAgentError(error: AgentError): Promise<void> {
  await executeRawQuery(
    `INSERT INTO agent_errors (
      agent_code, category, message, stack_trace, 
      severity, created_at
    ) VALUES ($1, $2, $3, $4, $5, NOW())`,
    [
      error.agentCode,
      error.category,
      error.message,
      error.stackTrace,
      error.severity,
    ]
  );

  // Alert on critical errors
  if (error.severity === 'critical') {
    await notifyAdmins({
      severity: 'critical',
      title: `Critical error in ${error.agentCode}`,
      message: error.message,
      agentCode: error.agentCode,
    });
  }
}
```

---

## Performance Monitoring

### Response Time Tracking

```typescript
/**
 * Track agent response time percentiles
 */
async function getResponseTimeMetrics(
  agentCode: string,
  period: '1h' | '24h' | '7d'
): Promise<PerformanceMetrics> {
  const periodHours = {
    '1h': 1,
    '24h': 24,
    '7d': 168,
  };

  const [metrics] = await executeRawQuery<any>(
    `SELECT 
      COUNT(*) as check_count,
      AVG(response_time_ms) as avg_response_time,
      MIN(response_time_ms) as min_response_time,
      MAX(response_time_ms) as max_response_time,
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY response_time_ms) as p50,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95,
      PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) as p99
    FROM agent_health
    WHERE agent_code = $1
      AND created_at > NOW() - INTERVAL '${periodHours[period]} hours'`,
    [agentCode]
  );

  return {
    agentCode,
    period,
    checkCount: metrics.check_count,
    avgResponseTime: Math.round(metrics.avg_response_time),
    minResponseTime: metrics.min_response_time,
    maxResponseTime: metrics.max_response_time,
    p50: Math.round(metrics.p50),
    p95: Math.round(metrics.p95),
    p99: Math.round(metrics.p99),
  };
}
```

### Degradation Alerts

```typescript
/**
 * Monitor for performance degradation over time
 */
async function detectDegradation(agentCode: string): Promise<boolean> {
  // Compare current performance to baseline
  const current = await getResponseTimeMetrics(agentCode, '1h');
  const baseline = await getResponseTimeMetrics(agentCode, '7d');

  // Alert if current p95 is 2x baseline
  if (current.p95 > baseline.p95 * 2) {
    await notifyAdmins({
      severity: 'warning',
      title: `Performance degradation detected: ${agentCode}`,
      message: `P95 response time increased from ${baseline.p95}ms to ${current.p95}ms`,
      agentCode,
    });
    return true;
  }

  return false;
}
```

---

## Agent Restart Protocol

### Graceful Restart

```typescript
/**
 * Restart agent with zero downtime
 * 
 * Steps:
 * 1. Activate fallback agent
 * 2. Drain in-flight requests
 * 3. Restart primary agent
 * 4. Health check primary
 * 5. Deactivate fallback
 */
async function restartAgent(agentCode: string): Promise<boolean> {
  console.log(`[Restart] Initiating restart for ${agentCode}`);

  try {
    // Step 1: Activate fallback
    const fallbackCode = await activateFallbackAgent(agentCode);
    if (!fallbackCode) {
      throw new Error('No fallback available - cannot safely restart');
    }

    // Step 2: Drain requests (wait for in-flight to complete)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 3: Restart agent (implementation depends on deployment)
    // This could be:
    // - Kubernetes pod restart
    // - PM2 restart
    // - Docker container restart
    await executeAgentRestart(agentCode);

    // Step 4: Wait for restart and health check
    await new Promise(resolve => setTimeout(resolve, 10000));
    const health = await AgentValidationService.runHealthCheck(agentCode);

    if (health.status !== 'healthy') {
      throw new Error(`Agent failed to restart healthily: ${health.status}`);
    }

    // Step 5: Deactivate fallback
    await executeRawQuery(
      `UPDATE fallback_activations 
       SET deactivated_at = NOW(), 
           recovery_reason = 'Primary agent restarted'
       WHERE fallback_agent = $1 AND deactivated_at IS NULL`,
      [fallbackCode]
    );

    console.log(`[Restart] Successfully restarted ${agentCode}`);
    return true;
  } catch (error: any) {
    console.error(`[Restart] Failed to restart ${agentCode}:`, error.message);
    
    await notifyAdmins({
      severity: 'critical',
      title: `Failed to restart ${agentCode}`,
      message: error.message,
      agentCode,
    });
    
    return false;
  }
}
```

---

## Database Schema

```sql
-- Agent Health Records
CREATE TABLE agent_health (
  id SERIAL PRIMARY KEY,
  agent_code VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  last_check_time TIMESTAMP NOT NULL,
  response_time_ms INTEGER,
  error_count INTEGER DEFAULT 0,
  error_details JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX agent_health_agent_idx ON agent_health(agent_code);
CREATE INDEX agent_health_created_idx ON agent_health(created_at);

-- Validation Checks
CREATE TABLE validation_checks (
  id SERIAL PRIMARY KEY,
  check_type VARCHAR NOT NULL,
  agent_code VARCHAR NOT NULL,
  result VARCHAR NOT NULL,
  details TEXT,
  execution_time INTEGER,
  fallback_activated BOOLEAN DEFAULT FALSE,
  fallback_agent_code VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fallback Activations
CREATE TABLE fallback_activations (
  id SERIAL PRIMARY KEY,
  primary_agent VARCHAR NOT NULL,
  fallback_agent VARCHAR NOT NULL,
  activated_at TIMESTAMP NOT NULL,
  deactivated_at TIMESTAMP,
  reason TEXT,
  recovery_reason TEXT
);

-- Agent Errors
CREATE TABLE agent_errors (
  id SERIAL PRIMARY KEY,
  agent_code VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  severity VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Reference

### GET /api/agents/health

Get health status of all agents.

**Response:**
```json
{
  "agents": [
    {
      "agentCode": "A1-AUTH",
      "status": "healthy",
      "responseTime": 45,
      "errorCount": 0,
      "lastCheckAt": "2025-11-02T10:00:00Z"
    }
  ],
  "summary": {
    "total": 134,
    "healthy": 130,
    "degraded": 3,
    "failing": 1,
    "offline": 0
  }
}
```

### POST /api/agents/:code/restart

Restart specific agent with fallback.

**Response (200):**
```json
{
  "message": "Agent restarted successfully",
  "fallbackUsed": true,
  "downtime": "5s"
}
```

---

**End of Document**
