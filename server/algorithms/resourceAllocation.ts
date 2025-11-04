/**
 * A49: Resource Allocation Agent
 * 
 * Optimizes server resources, database connections, cache distribution,
 * and load balancing for efficient platform operation
 */

export interface ResourceMetrics {
  cpu: number; // 0-100 percentage
  memory: number; // 0-100 percentage
  diskIO: number; // operations per second
  networkIO: number; // MB/s
  activeConnections: number;
  queueLength: number;
}

export interface AllocationDecision {
  action: 'scale_up' | 'scale_down' | 'rebalance' | 'maintain';
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

/**
 * Assess current resource utilization
 */
function assessUtilization(metrics: ResourceMetrics): {
  level: 'low' | 'normal' | 'high' | 'critical';
  bottlenecks: string[];
} {
  const bottlenecks: string[] = [];
  let level: 'low' | 'normal' | 'high' | 'critical' = 'normal';
  
  // Check CPU
  if (metrics.cpu > 90) {
    bottlenecks.push('CPU at critical level');
    level = 'critical';
  } else if (metrics.cpu > 75) {
    bottlenecks.push('High CPU usage');
    if (level === 'normal') level = 'high';
  } else if (metrics.cpu < 20) {
    level = 'low';
  }
  
  // Check memory
  if (metrics.memory > 90) {
    bottlenecks.push('Memory exhaustion imminent');
    level = 'critical';
  } else if (metrics.memory > 80) {
    bottlenecks.push('High memory pressure');
    if (level === 'normal') level = 'high';
  }
  
  // Check connections
  const connectionUtilization = (metrics.activeConnections / 1000) * 100;
  if (connectionUtilization > 90) {
    bottlenecks.push('Connection pool nearly exhausted');
    level = 'critical';
  } else if (connectionUtilization > 75) {
    bottlenecks.push('High connection count');
    if (level === 'normal') level = 'high';
  }
  
  // Check queue
  if (metrics.queueLength > 500) {
    bottlenecks.push('Request queue backing up');
    if (level !== 'critical') level = 'high';
  }
  
  return { level, bottlenecks };
}

/**
 * Calculate optimal resource allocation
 */
export function calculateOptimalAllocation(
  current: ResourceMetrics,
  historical: ResourceMetrics[],
  options: {
    scaleUpThreshold?: number;
    scaleDownThreshold?: number;
    minInstances?: number;
    maxInstances?: number;
  } = {}
): AllocationDecision {
  const {
    scaleUpThreshold = 75,
    scaleDownThreshold = 25,
    minInstances = 1,
    maxInstances = 10
  } = options;
  
  const utilization = assessUtilization(current);
  const recommendations: string[] = [];
  
  // Calculate average utilization from history
  const avgCpu = historical.length > 0
    ? historical.reduce((sum, m) => sum + m.cpu, 0) / historical.length
    : current.cpu;
  
  const avgMemory = historical.length > 0
    ? historical.reduce((sum, m) => sum + m.memory, 0) / historical.length
    : current.memory;
  
  // Critical situation - immediate action needed
  if (utilization.level === 'critical') {
    return {
      action: 'scale_up',
      reason: `Critical resource exhaustion detected: ${utilization.bottlenecks.join(', ')}`,
      priority: 'critical',
      recommendations: [
        'Immediate horizontal scaling required',
        'Consider cache warming for frequently accessed data',
        'Review recent code deploys for performance regressions',
        ...utilization.bottlenecks
      ]
    };
  }
  
  // High utilization - proactive scaling
  if (utilization.level === 'high' || avgCpu > scaleUpThreshold) {
    return {
      action: 'scale_up',
      reason: `Sustained high utilization detected (CPU: ${current.cpu.toFixed(1)}%, Memory: ${current.memory.toFixed(1)}%)`,
      priority: 'high',
      recommendations: [
        'Add additional instances to handle load',
        'Enable auto-scaling if not already active',
        'Monitor queue length for improvement',
        'Consider implementing rate limiting',
        ...utilization.bottlenecks
      ]
    };
  }
  
  // Low utilization - consider scaling down
  if (utilization.level === 'low' && avgCpu < scaleDownThreshold && avgMemory < 40) {
    return {
      action: 'scale_down',
      reason: `Sustained low utilization detected (CPU: ${current.cpu.toFixed(1)}%, Memory: ${current.memory.toFixed(1)}%)`,
      priority: 'low',
      recommendations: [
        'Reduce instance count to optimize costs',
        'Maintain minimum instances for availability',
        'Monitor for traffic pattern changes',
        'Consider reserved instances for base capacity'
      ]
    };
  }
  
  // Uneven load - rebalance needed
  if (current.queueLength > 100 && current.cpu < 60) {
    return {
      action: 'rebalance',
      reason: 'Queue buildup despite available capacity suggests load imbalance',
      priority: 'medium',
      recommendations: [
        'Rebalance traffic across available instances',
        'Check for connection pooling issues',
        'Review load balancer configuration',
        'Consider session affinity settings'
      ]
    };
  }
  
  // Normal operation
  return {
    action: 'maintain',
    reason: 'Resource utilization within normal parameters',
    priority: 'low',
    recommendations: [
      'Continue monitoring',
      'Review trends for future capacity planning',
      'Optimize queries and caching as needed'
    ]
  };
}

/**
 * Recommend database connection pool size
 */
export function recommendConnectionPoolSize(
  concurrentUsers: number,
  avgQueriesPerUser: number = 3
): {
  min: number;
  max: number;
  recommended: number;
} {
  // Base calculation: concurrent users * queries per user
  const baseConnections = concurrentUsers * avgQueriesPerUser;
  
  // Add buffer for spikes (20%)
  const recommended = Math.ceil(baseConnections * 1.2);
  
  // Min: 25% of recommended (for idle periods)
  const min = Math.max(5, Math.ceil(recommended * 0.25));
  
  // Max: 150% of recommended (for traffic spikes)
  const max = Math.ceil(recommended * 1.5);
  
  return {
    min,
    max,
    recommended
  };
}

/**
 * Calculate optimal cache size allocation
 */
export function calculateCacheAllocation(
  totalMemoryMB: number,
  cacheTypes: string[]
): Map<string, number> {
  const allocation = new Map<string, number>();
  
  // Reserve 30% for application
  const availableForCache = totalMemoryMB * 0.7;
  
  // Predefined weights for different cache types
  const weights: Record<string, number> = {
    'user_sessions': 0.15,
    'feed_cache': 0.25,
    'query_cache': 0.20,
    'static_assets': 0.10,
    'api_responses': 0.15,
    'search_index': 0.10,
    'other': 0.05
  };
  
  for (const cacheType of cacheTypes) {
    const weight = weights[cacheType] || weights['other'];
    const sizeMB = availableForCache * weight;
    allocation.set(cacheType, sizeMB);
  }
  
  return allocation;
}
