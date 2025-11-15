/**
 * Mr. Blue 3D Avatar - LOD (Level of Detail) Optimization
 * 
 * Performance optimization system:
 * - Automatic LOD level switching based on performance
 * - 60fps target for desktop, 30fps for mobile
 * - Memory and GPU monitoring
 * - Dynamic quality adjustment
 */

import type {
  LODConfig,
  LODLevel,
  LODOptions,
  PerformanceTier,
  PerformanceMetrics,
  LoadedModel
} from '@/types/avatar';

// ============================================================================
// LOD Level Configurations
// ============================================================================

/**
 * Predefined LOD levels for different performance tiers
 */
const LOD_PRESETS: Record<PerformanceTier, LODLevel[]> = {
  high: [
    {
      distance: 5,
      triangleCount: 20000,
      textureResolution: 2048,
      shadows: true
    },
    {
      distance: 10,
      triangleCount: 12000,
      textureResolution: 1024,
      shadows: true
    },
    {
      distance: 20,
      triangleCount: 5000,
      textureResolution: 512,
      shadows: false
    }
  ],
  medium: [
    {
      distance: 5,
      triangleCount: 12000,
      textureResolution: 1024,
      shadows: true
    },
    {
      distance: 15,
      triangleCount: 5000,
      textureResolution: 512,
      shadows: false
    }
  ],
  low: [
    {
      distance: 10,
      triangleCount: 5000,
      textureResolution: 512,
      shadows: false
    }
  ]
};

// ============================================================================
// Performance Monitor
// ============================================================================

class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private frameTimes: number[] = [];
  private maxFrameTimesSamples = 60;

  update(): PerformanceMetrics {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.frameTimes.push(deltaTime);
    if (this.frameTimes.length > this.maxFrameTimesSamples) {
      this.frameTimes.shift();
    }

    this.frameCount++;

    // Update FPS every second
    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    const averageFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;

    return {
      fps: this.fps,
      frameTime: averageFrameTime,
      memoryUsage: this.getMemoryUsage(),
      gpuMemory: this.getGPUMemory(),
      drawCalls: 0, // Would need WebGL context to measure
      triangles: 0, // Would need scene stats
      tier: this.getPerformanceTier()
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }

  private getGPUMemory(): number {
    // Estimate based on renderer info if available
    return 0; // Placeholder
  }

  private getPerformanceTier(): PerformanceTier {
    if (this.fps >= 50) return 'high';
    if (this.fps >= 25) return 'medium';
    return 'low';
  }

  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.frameTimes = [];
  }
}

// ============================================================================
// LOD Manager Class
// ============================================================================

export class LODManager {
  private config: LODConfig;
  private monitor: PerformanceMonitor;
  private monitorInterval: number;
  private monitorTimer?: number;
  private targetFPS: number;
  private onLevelChange?: (level: number) => void;

  constructor(options: LODOptions = {}) {
    const {
      enabled = true,
      monitorInterval = 1000,
      targetFPS = this.detectTargetFPS(),
      onLevelChange
    } = options;

    this.targetFPS = targetFPS;
    this.onLevelChange = onLevelChange;
    this.monitorInterval = monitorInterval;
    this.monitor = new PerformanceMonitor();

    // Initialize with medium tier by default
    const tier = this.detectInitialTier();
    this.config = {
      levels: LOD_PRESETS[tier],
      currentLevel: 0,
      autoSwitch: enabled,
      performanceTier: tier
    };

    if (enabled) {
      this.startMonitoring();
    }
  }

  /**
   * Detect appropriate target FPS based on device
   */
  private detectTargetFPS(): number {
    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    return isMobile ? 30 : 60;
  }

  /**
   * Detect initial performance tier
   */
  private detectInitialTier(): PerformanceTier {
    // Check device capabilities
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      // Mobile devices start at medium
      return 'medium';
    }

    // Desktop: check hardware concurrency
    const cores = navigator.hardwareConcurrency || 4;
    if (cores >= 8) return 'high';
    if (cores >= 4) return 'medium';
    return 'low';
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    this.monitorTimer = window.setInterval(() => {
      const metrics = this.monitor.update();
      this.adjustLODLevel(metrics);
    }, this.monitorInterval);
  }

  /**
   * Stop performance monitoring
   */
  private stopMonitoring(): void {
    if (this.monitorTimer !== undefined) {
      clearInterval(this.monitorTimer);
      this.monitorTimer = undefined;
    }
  }

  /**
   * Adjust LOD level based on performance metrics
   */
  private adjustLODLevel(metrics: PerformanceMetrics): void {
    if (!this.config.autoSwitch) return;

    const currentLevel = this.config.currentLevel;
    const levels = this.config.levels;

    // If FPS is below target, reduce quality (increase LOD level)
    if (metrics.fps < this.targetFPS * 0.9) {
      if (currentLevel < levels.length - 1) {
        this.setLODLevel(currentLevel + 1);
      }
    }
    // If FPS is well above target, increase quality (decrease LOD level)
    else if (metrics.fps > this.targetFPS && currentLevel > 0) {
      this.setLODLevel(currentLevel - 1);
    }
  }

  /**
   * Manually set LOD level
   */
  setLODLevel(level: number): void {
    const clampedLevel = Math.max(0, Math.min(level, this.config.levels.length - 1));
    
    if (clampedLevel !== this.config.currentLevel) {
      this.config.currentLevel = clampedLevel;
      this.onLevelChange?.(clampedLevel);
    }
  }

  /**
   * Get current LOD level configuration
   */
  getCurrentLevel(): LODLevel {
    return this.config.levels[this.config.currentLevel];
  }

  /**
   * Get current LOD level index
   */
  getCurrentLevelIndex(): number {
    return this.config.currentLevel;
  }

  /**
   * Apply LOD settings to a model
   */
  applyToModel(model: LoadedModel): void {
    const currentLOD = this.getCurrentLevel();

    model.meshes.forEach(mesh => {
      // Toggle shadows
      mesh.castShadow = currentLOD.shadows || false;
      mesh.receiveShadow = currentLOD.shadows || false;

      // Adjust materials based on LOD
      if (mesh.material) {
        const material = Array.isArray(mesh.material) 
          ? mesh.material[0] 
          : mesh.material;

        // Disable expensive features at lower LOD
        if (this.config.currentLevel >= 2) {
          // Low quality: disable normal maps, AO, etc.
          material.normalMap = null;
          material.aoMap = null;
        }
      }
    });
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return this.monitor.update();
  }

  /**
   * Get current configuration
   */
  getConfig(): LODConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<LODConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Enable/disable auto-switching
   */
  setAutoSwitch(enabled: boolean): void {
    this.config.autoSwitch = enabled;
    
    if (enabled) {
      this.startMonitoring();
    } else {
      this.stopMonitoring();
    }
  }

  /**
   * Change performance tier
   */
  setPerformanceTier(tier: PerformanceTier): void {
    this.config.performanceTier = tier;
    this.config.levels = LOD_PRESETS[tier];
    this.config.currentLevel = 0;
    this.monitor.reset();
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopMonitoring();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const lodManager = new LODManager();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get LOD presets
 */
export function getLODPresets(): Record<PerformanceTier, LODLevel[]> {
  return LOD_PRESETS;
}

/**
 * Detect if device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Get recommended performance tier for current device
 */
export function getRecommendedTier(): PerformanceTier {
  const isMobile = isMobileDevice();
  
  if (isMobile) {
    return 'medium';
  }

  const cores = navigator.hardwareConcurrency || 4;
  if (cores >= 8) return 'high';
  if (cores >= 4) return 'medium';
  return 'low';
}
