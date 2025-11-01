import { Request, Response, NextFunction } from 'express';
import compression from 'compression';

// ============================================================================
// COMPRESSION MIDDLEWARE
// ============================================================================

export const compressionMiddleware = compression({
  // Only compress responses above 1kb
  threshold: 1024,
  // Compression level (0-9, 6 is default)
  level: 6,
  // Filter function to determine what to compress
  filter: (req: Request, res: Response) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter
    return compression.filter(req, res);
  },
});

// ============================================================================
// CACHING MIDDLEWARE
// ============================================================================

// Simple in-memory cache for API responses
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

export const cacheMiddleware = (ttlSeconds: number = 60) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
      // Cache hit
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    // Cache miss - intercept response
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      // Store in cache
      cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: ttlSeconds,
      });
      
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

// Clear cache periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const entriesToDelete: string[] = [];
  
  cache.forEach((entry, key) => {
    if (now - entry.timestamp > entry.ttl * 1000) {
      entriesToDelete.push(key);
    }
  });
  
  entriesToDelete.forEach(key => cache.delete(key));
}, 60000); // Clean every minute

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
}

const performanceMetrics: PerformanceMetrics[] = [];
const MAX_METRICS = 1000;

export const performanceMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Intercept response finish
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Log slow requests (>1s)
    if (responseTime > 1000) {
      console.warn(`⚠️ Slow request: ${req.method} ${req.path} took ${responseTime}ms`);
    }

    // Store metrics
    performanceMetrics.push({
      endpoint: req.path,
      method: req.method,
      responseTime,
      statusCode: res.statusCode,
      timestamp: Date.now(),
    });

    // Keep only last MAX_METRICS
    if (performanceMetrics.length > MAX_METRICS) {
      performanceMetrics.shift();
    }
  });

  next();
};

// Get performance statistics
export const getPerformanceStats = () => {
  if (performanceMetrics.length === 0) {
    return null;
  }

  const responseTimes = performanceMetrics.map(m => m.responseTime);
  const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const sorted = [...responseTimes].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];

  return {
    totalRequests: performanceMetrics.length,
    avgResponseTime: Math.round(avg),
    p50ResponseTime: Math.round(p50),
    p95ResponseTime: Math.round(p95),
    p99ResponseTime: Math.round(p99),
    slowestEndpoints: getSlowestEndpoints(),
  };
};

const getSlowestEndpoints = (limit: number = 5) => {
  const endpointStats = new Map<string, number[]>();

  for (const metric of performanceMetrics) {
    const key = `${metric.method} ${metric.endpoint}`;
    if (!endpointStats.has(key)) {
      endpointStats.set(key, []);
    }
    endpointStats.get(key)!.push(metric.responseTime);
  }

  const results = Array.from(endpointStats.entries())
    .map(([endpoint, times]) => ({
      endpoint,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      count: times.length,
    }))
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, limit);

  return results;
};

// ============================================================================
// DATABASE CONNECTION POOLING
// ============================================================================

export const connectionPoolConfig = {
  // PostgreSQL connection pool settings
  min: 2,
  max: 10,
  idle: 10000, // 10 seconds
  acquire: 30000, // 30 seconds
  evict: 1000, // Check for idle connections every second
};

// ============================================================================
// BUNDLE SIZE OPTIMIZATION HINTS
// ============================================================================

export const bundleOptimizationHints = {
  // Code splitting strategy
  chunks: {
    vendor: ['react', 'react-dom', 'wouter'],
    ui: ['@radix-ui/*', 'lucide-react'],
    charts: ['recharts'],
    forms: ['react-hook-form', '@hookform/resolvers'],
  },
  
  // Lazy load these routes
  lazyRoutes: [
    '/admin',
    '/analytics',
    '/housing',
    '/events',
  ],
  
  // Images optimization
  imageFormats: ['webp', 'avif'],
  imageSizes: [640, 750, 828, 1080, 1200, 1920],
};
