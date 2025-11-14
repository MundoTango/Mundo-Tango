import { Router } from 'express';
import { db, checkDatabaseConnection } from '../../shared/db';
import { getRedisClient } from '../cache/redis-cache';

const router = Router();

/**
 * PRODUCTION HEALTH CHECK ENDPOINTS
 * Provides comprehensive system health monitoring for:
 * - Load balancers
 * - Kubernetes liveness/readiness probes
 * - Monitoring systems (Prometheus, Grafana)
 * - DevOps dashboards
 */

// ============================================================================
// SIMPLE HEALTH CHECK (Minimal)
// ============================================================================
router.get('/api/health', async (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================================================
// DETAILED HEALTH CHECK (Full System Status)
// ============================================================================
router.get('/api/health/detailed', async (req, res) => {
  const health: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    components: {},
  };

  // Check Database
  try {
    const dbHealthy = await checkDatabaseConnection();
    health.components.database = {
      status: dbHealthy ? 'up' : 'down',
      type: 'PostgreSQL',
    };
    if (!dbHealthy) health.status = 'degraded';
  } catch (error) {
    health.components.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    health.status = 'unhealthy';
  }

  // Check Redis
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
      health.components.redis = {
        status: 'up',
        type: 'Redis',
      };
    } else {
      health.components.redis = {
        status: 'not_configured',
        fallback: 'in-memory',
      };
    }
  } catch (error) {
    health.components.redis = {
      status: 'down',
      fallback: 'in-memory',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Memory Usage
  const memUsage = process.memoryUsage();
  health.components.memory = {
    status: 'up',
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
  };

  // CPU Usage (estimated)
  const cpuUsage = process.cpuUsage();
  health.components.cpu = {
    status: 'up',
    user: cpuUsage.user,
    system: cpuUsage.system,
  };

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
  res.status(statusCode).json(health);
});

// ============================================================================
// KUBERNETES LIVENESS PROBE
// ============================================================================
router.get('/api/health/liveness', async (req, res) => {
  // Simple check: Is the process alive?
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// KUBERNETES READINESS PROBE
// ============================================================================
router.get('/api/health/readiness', async (req, res) => {
  try {
    // Check if app is ready to serve traffic
    const dbHealthy = await checkDatabaseConnection();
    
    if (dbHealthy) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        reason: 'database_unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      reason: 'health_check_failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// STARTUP PROBE
// ============================================================================
router.get('/api/health/startup', async (req, res) => {
  // Check if application has started successfully
  try {
    const dbHealthy = await checkDatabaseConnection();
    
    if (dbHealthy) {
      res.status(200).json({
        status: 'started',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    } else {
      res.status(503).json({
        status: 'starting',
        reason: 'database_connecting',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'starting',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// DEPENDENCIES CHECK
// ============================================================================
router.get('/api/health/dependencies', async (req, res) => {
  const dependencies: any = {
    timestamp: new Date().toISOString(),
    services: {},
  };

  // Database
  try {
    const dbHealthy = await checkDatabaseConnection();
    dependencies.services.database = {
      status: dbHealthy ? 'up' : 'down',
      required: true,
    };
  } catch (error) {
    dependencies.services.database = {
      status: 'error',
      required: true,
      error: error instanceof Error ? error.message : 'Unknown',
    };
  }

  // Redis
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
      dependencies.services.redis = {
        status: 'up',
        required: false,
      };
    } else {
      dependencies.services.redis = {
        status: 'not_configured',
        required: false,
      };
    }
  } catch (error) {
    dependencies.services.redis = {
      status: 'down',
      required: false,
      fallback: 'in-memory',
    };
  }

  // Check if all required services are up
  const allRequiredUp = Object.values(dependencies.services).every((service: any) => {
    return !service.required || service.status === 'up';
  });

  dependencies.overall_status = allRequiredUp ? 'healthy' : 'unhealthy';

  res.status(allRequiredUp ? 200 : 503).json(dependencies);
});

// ============================================================================
// AGENT HEALTH STATUS (TRACK 9)
// ============================================================================
router.get('/api/health/agents', async (req, res) => {
  try {
    // Import here to avoid circular dependencies
    const { db } = await import('../../shared/db');
    const { esaAgents } = await import('../../shared/platform-schema');
    const { desc, sql } = await import('drizzle-orm');
    
    // Get all agents with their health metrics
    const agents = await db.select({
      id: esaAgents.id,
      agentCode: esaAgents.agentCode,
      agentName: esaAgents.agentName,
      status: esaAgents.status,
      tasksCompleted: esaAgents.tasksCompleted,
      tasksSuccess: esaAgents.tasksSuccess,
      tasksFailed: esaAgents.tasksFailed,
      averageResponseTime: esaAgents.averageResponseTime,
      lastActive: esaAgents.lastActive,
      createdAt: esaAgents.createdAt,
    })
    .from(esaAgents)
    .orderBy(desc(esaAgents.lastActive))
    .limit(100);
    
    // Calculate aggregate statistics
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const totalTasksCompleted = agents.reduce((sum, a) => sum + (a.tasksCompleted || 0), 0);
    const totalTasksSuccess = agents.reduce((sum, a) => sum + (a.tasksSuccess || 0), 0);
    const totalTasksFailed = agents.reduce((sum, a) => sum + (a.tasksFailed || 0), 0);
    const successRate = totalTasksCompleted > 0 
      ? (totalTasksSuccess / totalTasksCompleted) * 100 
      : 0;
    
    // Calculate average response time
    const avgResponseTimes = agents
      .filter(a => a.averageResponseTime && a.averageResponseTime > 0)
      .map(a => a.averageResponseTime || 0);
    const globalAvgResponseTime = avgResponseTimes.length > 0
      ? avgResponseTimes.reduce((sum, time) => sum + time, 0) / avgResponseTimes.length
      : 0;
    
    res.json({
      timestamp: new Date().toISOString(),
      summary: {
        totalAgents,
        activeAgents,
        inactiveAgents: totalAgents - activeAgents,
        totalTasksCompleted,
        totalTasksSuccess,
        totalTasksFailed,
        successRate: successRate.toFixed(2) + '%',
        averageResponseTime: globalAvgResponseTime.toFixed(2) + 'ms',
      },
      agents: agents.map(agent => ({
        ...agent,
        successRate: agent.tasksCompleted && agent.tasksCompleted > 0
          ? ((agent.tasksSuccess || 0) / agent.tasksCompleted * 100).toFixed(2) + '%'
          : '0%',
        health: agent.status === 'active' && agent.lastActive
          ? (Date.now() - new Date(agent.lastActive).getTime() < 3600000 ? 'healthy' : 'stale')
          : 'inactive',
      })),
    });
  } catch (error) {
    console.error('[Health] Error fetching agent statuses:', error);
    res.status(500).json({
      error: 'Failed to fetch agent statuses',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// GOD LEVEL QUOTA STATUS (TRACK 9)
// ============================================================================
router.get('/api/health/quotas', async (req, res) => {
  try {
    // Import here to avoid circular dependencies
    const { db } = await import('../../shared/db');
    const { users } = await import('../../shared/schema');
    const { eq, sql, and, gte } = await import('drizzle-orm');
    
    // Get quota usage statistics
    const quotaStats = await db.select({
      tier: users.subscriptionTier,
      userCount: sql<number>`count(*)`,
      apiUsageToday: sql<number>`coalesce(sum(
        (${users.createdAt} >= current_date)::int
      ), 0)`,
    })
    .from(users)
    .groupBy(users.subscriptionTier);
    
    // Define quota limits per tier
    const quotaLimits = {
      free: {
        apiRequestsPerHour: 100,
        apiRequestsPerDay: 1000,
        storageGB: 1,
        aiCreditsPerMonth: 100,
      },
      basic: {
        apiRequestsPerHour: 500,
        apiRequestsPerDay: 10000,
        storageGB: 10,
        aiCreditsPerMonth: 1000,
      },
      plus: {
        apiRequestsPerHour: 2000,
        apiRequestsPerDay: 50000,
        storageGB: 50,
        aiCreditsPerMonth: 5000,
      },
      pro: {
        apiRequestsPerHour: 10000,
        apiRequestsPerDay: 200000,
        storageGB: 200,
        aiCreditsPerMonth: 20000,
      },
      god: {
        apiRequestsPerHour: 999999,
        apiRequestsPerDay: 999999,
        storageGB: 999999,
        aiCreditsPerMonth: 999999,
      },
    };
    
    // Calculate usage percentages
    const quotaUsage = quotaStats.map(stat => {
      const tier = (stat.tier || 'free').toLowerCase() as keyof typeof quotaLimits;
      const limits = quotaLimits[tier] || quotaLimits.free;
      
      return {
        tier: stat.tier,
        userCount: stat.userCount,
        limits,
        usage: {
          apiRequestsToday: stat.apiUsageToday,
          apiUsagePercentage: (stat.apiUsageToday / limits.apiRequestsPerDay * 100).toFixed(2) + '%',
        },
      };
    });
    
    // Overall system quotas
    const totalUsers = quotaStats.reduce((sum, stat) => sum + stat.userCount, 0);
    const godLevelUsers = quotaStats.find(stat => stat.tier === 'god')?.userCount || 0;
    
    res.json({
      timestamp: new Date().toISOString(),
      systemQuotas: {
        totalUsers,
        godLevelUsers,
        godLevelPercentage: totalUsers > 0 
          ? (godLevelUsers / totalUsers * 100).toFixed(2) + '%'
          : '0%',
      },
      tierQuotas: quotaUsage,
      quotaLimits,
    });
  } catch (error) {
    console.error('[Health] Error fetching quota status:', error);
    res.status(500).json({
      error: 'Failed to fetch quota status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
