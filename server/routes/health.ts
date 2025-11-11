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

export default router;
