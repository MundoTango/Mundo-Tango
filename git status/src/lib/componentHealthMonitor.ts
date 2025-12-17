/**
 * COMPONENT HEALTH MONITOR
 * Detects when UI components render but don't work (silent failures)
 * 
 * Features:
 * - Register health checks for critical components
 * - Periodic execution (every 60 seconds)
 * - Integration with ProactiveErrorDetector
 * - Extensible for multiple components
 */

import { getErrorDetector } from './proactiveErrorDetection';

type HealthCheckFunction = () => Promise<boolean>;

interface HealthCheckResult {
  name: string;
  passed: boolean;
  timestamp: number;
  error?: string;
}

export class ComponentHealthMonitor {
  private healthChecks: Map<string, HealthCheckFunction> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  // Configuration
  private readonly CHECK_INTERVAL_MS = 60000; // 60 seconds
  
  constructor() {
    console.log('[ComponentHealthMonitor] Initializing...');
  }

  /**
   * Register a health check for a component
   * @param name - Component name (e.g., 'UnifiedLocationPicker')
   * @param healthCheckFn - Async function that returns true if healthy, false if broken
   */
  registerCheck(name: string, healthCheckFn: HealthCheckFunction): void {
    this.healthChecks.set(name, healthCheckFn);
    console.log(`[ComponentHealthMonitor] Registered health check: ${name}`);
  }

  /**
   * Unregister a health check
   */
  unregisterCheck(name: string): void {
    this.healthChecks.delete(name);
    console.log(`[ComponentHealthMonitor] Unregistered health check: ${name}`);
  }

  /**
   * Run all registered health checks
   * @returns Array of health check results
   */
  async runChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    console.log(`[ComponentHealthMonitor] Running ${this.healthChecks.size} health checks...`);
    
    for (const [name, checkFn] of this.healthChecks.entries()) {
      try {
        const passed = await checkFn();
        const result: HealthCheckResult = {
          name,
          passed,
          timestamp: Date.now(),
        };
        
        results.push(result);
        
        if (!passed) {
          // Health check failed - report to ProactiveErrorDetector
          console.error(`[ComponentHealthMonitor] ❌ Component health check failed: ${name}`);
          this.reportFailure(name, 'Health check returned false');
        } else {
          console.log(`[ComponentHealthMonitor] ✅ Component health check passed: ${name}`);
        }
      } catch (error) {
        // Exception during health check
        const errorMessage = error instanceof Error ? error.message : String(error);
        const result: HealthCheckResult = {
          name,
          passed: false,
          timestamp: Date.now(),
          error: errorMessage,
        };
        
        results.push(result);
        
        console.error(`[ComponentHealthMonitor] ❌ Component health check error: ${name}`, error);
        this.reportFailure(name, errorMessage);
      }
    }
    
    return results;
  }

  /**
   * Report a health check failure to ProactiveErrorDetector
   */
  private reportFailure(componentName: string, errorMessage: string): void {
    try {
      const errorDetector = getErrorDetector();
      errorDetector.reportError({
        type: 'console.error',
        message: `Component health check failed: ${componentName} - ${errorMessage}`,
        timestamp: Date.now(),
        stack: new Error().stack,
        context: {
          component: componentName,
          healthCheckFailure: true,
        },
      });
    } catch (error) {
      console.error('[ComponentHealthMonitor] Failed to report to ProactiveErrorDetector:', error);
    }
  }

  /**
   * Start periodic health checks
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[ComponentHealthMonitor] Already running');
      return;
    }
    
    this.isRunning = true;
    
    // Run immediately on start
    this.runChecks();
    
    // Then run periodically
    this.checkInterval = setInterval(() => {
      this.runChecks();
    }, this.CHECK_INTERVAL_MS);
    
    console.log(`[ComponentHealthMonitor] ✅ Started - checking every ${this.CHECK_INTERVAL_MS / 1000} seconds`);
  }

  /**
   * Stop periodic health checks
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.isRunning = false;
    console.log('[ComponentHealthMonitor] Stopped');
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      registeredChecks: Array.from(this.healthChecks.keys()),
      checkIntervalSeconds: this.CHECK_INTERVAL_MS / 1000,
    };
  }
}

// Singleton instance
let monitorInstance: ComponentHealthMonitor | null = null;

/**
 * Get or create singleton instance
 */
export function getComponentHealthMonitor(): ComponentHealthMonitor {
  if (!monitorInstance) {
    monitorInstance = new ComponentHealthMonitor();
  }
  return monitorInstance;
}

/**
 * Initialize component health monitoring
 */
export function initComponentHealthMonitor(): ComponentHealthMonitor {
  const monitor = getComponentHealthMonitor();
  
  // Register health check for UnifiedLocationPicker
  monitor.registerCheck('UnifiedLocationPicker', async () => {
    try {
      const response = await fetch('/api/locations/search?q=test');
      return response.ok; // Returns false if 404 or other error
    } catch (error) {
      // Network error or fetch failed
      return false;
    }
  });
  
  // Start monitoring
  monitor.start();
  
  return monitor;
}

/**
 * Cleanup component health monitoring
 */
export function cleanupComponentHealthMonitor(): void {
  if (monitorInstance) {
    monitorInstance.stop();
    monitorInstance = null;
  }
}
