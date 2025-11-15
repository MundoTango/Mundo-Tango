import { Request, Response } from 'express';
import { db } from '@shared/db';
import { sql } from 'drizzle-orm';

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    redis?: HealthCheck;
    mcp?: HealthCheck;
    memory: HealthCheck;
  };
}

interface HealthCheck {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  message?: string;
  details?: any;
}

export async function healthCheckHandler(req: Request, res: Response) {
  const startTime = Date.now();
  const checks: HealthStatus['checks'] = {
    database: await checkDatabase(),
    memory: checkMemory(),
  };

  // Check Redis if available
  if (process.env.REDIS_URL) {
    checks.redis = await checkRedis();
  }

  // Check MCP Gateway if configured
  if (process.env.MCP_GATEWAY_URL) {
    checks.mcp = await checkMCP();
  }

  // Determine overall status
  const allChecks = Object.values(checks);
  const hasDown = allChecks.some(c => c.status === 'down');
  const hasDegraded = allChecks.some(c => c.status === 'degraded');

  const status: HealthStatus = {
    status: hasDown ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks,
  };

  const statusCode = status.status === 'healthy' ? 200 : status.status === 'degraded' ? 200 : 503;
  
  res.status(statusCode).json(status);
}

// ============================================================================
// INDIVIDUAL HEALTH CHECKS
// ============================================================================

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // Simple query to check database connectivity
    await db.execute(sql`SELECT 1 as health_check`);
    
    return {
      status: 'up',
      responseTime: Date.now() - start,
      message: 'Database connection successful',
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // Use existing Redis client from redis-optional (don't create new connections)
    const { getRedisClient, isRedisConnected } = await import('./config/redis-optional');
    const redis = getRedisClient();
    
    if (!redis) {
      return {
        status: 'down',
        responseTime: Date.now() - start,
        message: 'Redis not configured',
      };
    }
    
    // Check if already connected
    if (!isRedisConnected()) {
      return {
        status: 'down',
        responseTime: Date.now() - start,
        message: 'Redis not connected',
      };
    }
    
    // Quick ping test (reuses existing connection)
    await redis.ping();
    
    return {
      status: 'up',
      responseTime: Date.now() - start,
      message: 'Redis connection successful',
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Redis connection failed',
    };
  }
}

async function checkMCP(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const response = await fetch(`${process.env.MCP_GATEWAY_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (!response.ok) {
      return {
        status: 'degraded',
        responseTime: Date.now() - start,
        message: `MCP Gateway returned ${response.status}`,
      };
    }
    
    return {
      status: 'up',
      responseTime: Date.now() - start,
      message: 'MCP Gateway accessible',
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'MCP Gateway unreachable',
    };
  }
}

function checkMemory(): HealthCheck {
  const usage = process.memoryUsage();
  const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const usagePercent = (usage.heapUsed / usage.heapTotal) * 100;

  // Warning if memory usage > 80%
  const status = usagePercent > 80 ? 'degraded' : 'up';
  
  return {
    status,
    message: `Memory usage: ${usedMB}MB / ${totalMB}MB (${usagePercent.toFixed(1)}%)`,
    details: {
      heapUsed: usedMB,
      heapTotal: totalMB,
      rss: Math.round(usage.rss / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
    },
  };
}

// ============================================================================
// READINESS CHECK (Kubernetes/Docker)
// ============================================================================

export async function readinessCheckHandler(req: Request, res: Response) {
  // Check if app is ready to accept traffic
  const dbCheck = await checkDatabase();
  
  if (dbCheck.status === 'down') {
    return res.status(503).json({
      ready: false,
      message: 'Database not ready',
    });
  }
  
  res.status(200).json({
    ready: true,
    message: 'Application is ready',
  });
}

// ============================================================================
// LIVENESS CHECK (Kubernetes/Docker)
// ============================================================================

export async function livenessCheckHandler(req: Request, res: Response) {
  // Simple check to verify app is alive
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
}
