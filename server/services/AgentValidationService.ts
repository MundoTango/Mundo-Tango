/**
 * BLOCKER 8: Agent Validation Protocol
 * Health checks and fallback coordination for 134 ESA agents
 */

import { db, executeRawQuery } from "../../shared/db";
import { esaAgents } from "../../shared/platform-schema";
import { eq } from "drizzle-orm";

interface AgentHealthStatus {
  agentCode: string;
  status: 'healthy' | 'degraded' | 'failing' | 'offline' | 'unknown';
  lastCheckAt: Date;
  responseTime?: number;
  errorCount: number;
  errorDetails?: any;
}

interface ValidationCheckResult {
  checkType: 'availability' | 'performance' | 'integration' | 'fallback';
  agentCode: string;
  result: 'pass' | 'fail' | 'warning';
  details?: string;
  executionTime?: number;
  fallbackActivated: boolean;
  fallbackAgentCode?: string;
}

export class AgentValidationService {
  /**
   * Run health check on a specific agent
   */
  static async runHealthCheck(agentCode: string): Promise<AgentHealthStatus> {
    const startTime = Date.now();

    try {
      // Get agent info from platform-schema
      const agent = await db
        .select()
        .from(esaAgents)
        .where(eq(esaAgents.agentCode, agentCode))
        .limit(1);

      if (agent.length === 0) {
        throw new Error(`Agent ${agentCode} not found`);
      }

      // Simulate health check (in production, would ping agent endpoint)
      const responseTime = Date.now() - startTime;
      const status = responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'failing';

      // Get current error count
      const [healthRecord] = await executeRawQuery<any>(
        `SELECT error_count FROM agent_health WHERE agent_code = $1 ORDER BY created_at DESC LIMIT 1`,
        [agentCode]
      );

      const errorCount = healthRecord?.error_count || 0;

      // Insert health check result
      await executeRawQuery(
        `INSERT INTO agent_health (
          agent_code, status, last_check_time, response_time_ms, error_count, created_at, updated_at
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
      // Agent is offline/failing
      await executeRawQuery(
        `INSERT INTO agent_health (
          agent_code, status, last_check_time, error_count, error_details, created_at, updated_at
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

  /**
   * Run validation check (availability, performance, integration, fallback)
   */
  static async runValidationCheck(
    checkType: 'availability' | 'performance' | 'integration' | 'fallback',
    agentCode: string
  ): Promise<ValidationCheckResult> {
    const startTime = Date.now();

    try {
      // Run health check first
      const health = await this.runHealthCheck(agentCode);
      const executionTime = Date.now() - startTime;

      let result: 'pass' | 'fail' | 'warning' = 'pass';
      let details = '';
      let fallbackActivated = false;
      let fallbackAgentCode: string | undefined;

      // Determine result based on check type
      switch (checkType) {
        case 'availability':
          if (health.status === 'offline') {
            result = 'fail';
            details = 'Agent is offline';
          } else if (health.status === 'failing') {
            result = 'warning';
            details = 'Agent is failing';
          }
          break;

        case 'performance':
          if (health.responseTime && health.responseTime > 3000) {
            result = 'fail';
            details = `Response time ${health.responseTime}ms exceeds threshold`;
          } else if (health.responseTime && health.responseTime > 1000) {
            result = 'warning';
            details = `Response time ${health.responseTime}ms is degraded`;
          }
          break;

        case 'integration':
          if (health.errorCount > 5) {
            result = 'fail';
            details = `Error count ${health.errorCount} exceeds threshold`;
          } else if (health.errorCount > 2) {
            result = 'warning';
            details = `Error count ${health.errorCount} is elevated`;
          }
          break;

        case 'fallback':
          if (health.status === 'offline' || health.status === 'failing') {
            fallbackActivated = true;
            const fallback = await this.activateFallbackAgent(agentCode);
            fallbackAgentCode = fallback || undefined;
            result = fallbackAgentCode ? 'pass' : 'fail';
            details = fallbackAgentCode
              ? `Fallback agent ${fallbackAgentCode} activated`
              : 'No fallback agent available';
          }
          break;
      }

      // Log validation check
      await executeRawQuery(
        `INSERT INTO validation_checks (
          check_type, agent_code, result, details, execution_time,
          fallback_activated, fallback_agent_code, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          checkType,
          agentCode,
          result,
          details,
          executionTime,
          fallbackActivated,
          fallbackAgentCode || null,
        ]
      );

      return {
        checkType,
        agentCode,
        result,
        details,
        executionTime,
        fallbackActivated,
        fallbackAgentCode,
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      // Log failed check
      await executeRawQuery(
        `INSERT INTO validation_checks (
          check_type, agent_code, result, details, execution_time,
          fallback_activated, created_at
        ) VALUES ($1, $2, $3, $4, $5, false, NOW())`,
        [checkType, agentCode, 'fail', error.message, executionTime]
      );

      return {
        checkType,
        agentCode,
        result: 'fail',
        details: error.message,
        executionTime,
        fallbackActivated: false,
      };
    }
  }

  /**
   * Activate fallback agent for a failing agent
   */
  private static async activateFallbackAgent(agentCode: string): Promise<string | null> {
    try {
      // Get agent info
      const agent = await db
        .select()
        .from(esaAgents)
        .where(eq(esaAgents.agentCode, agentCode))
        .limit(1);

      if (agent.length === 0) {
        return null;
      }

      // Find fallback agent (same type, different code, status active)
      const fallbacks = await db
        .select()
        .from(esaAgents)
        .where(eq(esaAgents.agentType, agent[0].agentType))
        .limit(10);

      // Filter out the failing agent and inactive agents
      const activeFallbacks = fallbacks.filter(
        (a) => a.agentCode !== agentCode && a.status === 'active'
      );

      if (activeFallbacks.length === 0) {
        return null;
      }

      // Return first available fallback
      return activeFallbacks[0].agentCode;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all agent health statuses
   */
  static async getAllAgentHealth(): Promise<AgentHealthStatus[]> {
    try {
      const results = await executeRawQuery<any>(
        `SELECT DISTINCT ON (agent_code)
          agent_code, status, last_check_time, response_time_ms, error_count, error_details
        FROM agent_health
        ORDER BY agent_code, created_at DESC`
      );

      return results.map((r) => ({
        agentCode: r.agent_code,
        status: r.status,
        lastCheckAt: new Date(r.last_check_time),
        responseTime: r.response_time_ms,
        errorCount: r.error_count,
        errorDetails: r.error_details,
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Get validation check history
   */
  static async getValidationHistory(
    agentCode?: string,
    limit: number = 50
  ): Promise<ValidationCheckResult[]> {
    try {
      const query = agentCode
        ? `SELECT * FROM validation_checks WHERE agent_code = $1 ORDER BY created_at DESC LIMIT $2`
        : `SELECT * FROM validation_checks ORDER BY created_at DESC LIMIT $1`;

      const params = agentCode ? [agentCode, limit] : [limit];
      const results = await executeRawQuery<any>(query, params);

      return results.map((r) => ({
        checkType: r.check_type,
        agentCode: r.agent_code,
        result: r.result,
        details: r.details,
        executionTime: r.execution_time,
        fallbackActivated: r.fallback_activated,
        fallbackAgentCode: r.fallback_agent_code,
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Run health checks on all agents (batch operation)
   */
  static async runBatchHealthChecks(): Promise<AgentHealthStatus[]> {
    try {
      // Get all agents from platform-schema
      const agents = await db.select().from(esaAgents);

      // Run health checks in parallel (batch of 10 at a time to avoid overload)
      const batchSize = 10;
      const results: AgentHealthStatus[] = [];

      for (let i = 0; i < agents.length; i += batchSize) {
        const batch = agents.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map((agent) => this.runHealthCheck(agent.agentCode))
        );
        results.push(...batchResults);
      }

      return results;
    } catch (error) {
      return [];
    }
  }
}
