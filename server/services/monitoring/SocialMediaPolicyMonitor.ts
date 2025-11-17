/**
 * Social Media Policy Monitor - Main Coordinator
 * Orchestrates rate limiting, compliance checking, and sliding-scale monitoring
 * PHASE 0A: Recursive Monitoring System
 */

import { RateLimitTracker, Platform, ActivityLevel } from './RateLimitTracker';
import { PolicyComplianceChecker } from './PolicyComplianceChecker';
import { db } from '../../db';
import { monitoringAlerts } from '@shared/schema';
import { Queue } from 'bullmq';
import { redisConnection } from '../../config/redis';

export interface MonitoringConfig {
  platforms: Platform[];
  enableRateLimitMonitoring: boolean;
  enableComplianceMonitoring: boolean;
  enablePolicyChangeDetection: boolean;
  notificationUserIds: number[];
}

export interface MonitoringStatus {
  platform: Platform;
  activityLevel: ActivityLevel;
  callsLastHour: number;
  rateLimitPercentage: number;
  nextCheckTime: Date;
  complianceStatus: 'compliant' | 'warning' | 'non_compliant';
  lastComplianceCheck: Date;
}

export interface SlidingScaleSchedule {
  platform: Platform;
  activityLevel: ActivityLevel;
  currentInterval: string;
  nextInterval: string;
  transitionTime: Date;
}

export class SocialMediaPolicyMonitor {
  private static readonly DEFAULT_CONFIG: MonitoringConfig = {
    platforms: ['facebook', 'instagram', 'twitter', 'tiktok', 'linkedin', 'youtube', 'whatsapp'],
    enableRateLimitMonitoring: true,
    enableComplianceMonitoring: true,
    enablePolicyChangeDetection: true,
    notificationUserIds: [1], // Scott
  };

  private static config: MonitoringConfig = { ...this.DEFAULT_CONFIG };
  private static monitoringQueue: Queue | null = null;

  /**
   * Initialize monitoring system
   */
  static async initialize(customConfig?: Partial<MonitoringConfig>): Promise<void> {
    console.log('[SocialMediaPolicyMonitor] Initializing monitoring system...');

    // Merge custom config
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }

    // Initialize BullMQ queue
    try {
      this.monitoringQueue = new Queue('policy-monitoring', {
        connection: redisConnection,
      });
      console.log('[SocialMediaPolicyMonitor] BullMQ queue initialized');
    } catch (error) {
      console.error('[SocialMediaPolicyMonitor] Failed to initialize queue:', error);
    }

    // Run initial checks
    await this.runInitialChecks();

    console.log('[SocialMediaPolicyMonitor] Initialization complete');
  }

  /**
   * Run initial compliance and rate limit checks
   */
  private static async runInitialChecks(): Promise<void> {
    console.log('[SocialMediaPolicyMonitor] Running initial checks...');

    // Check compliance for all regulations
    if (this.config.enableComplianceMonitoring) {
      const complianceReport = await PolicyComplianceChecker.generateComplianceReport();
      console.log('[SocialMediaPolicyMonitor] Compliance Report:', {
        criticalIssues: complianceReport.criticalIssues,
        recommendations: complianceReport.recommendations.length,
      });
    }

    // Check rate limits for all platforms
    if (this.config.enableRateLimitMonitoring) {
      const statuses = RateLimitTracker.getAllPlatformStatuses();
      console.log('[SocialMediaPolicyMonitor] Platform Activity Levels:', statuses);
    }
  }

  /**
   * Monitor all platforms and adjust schedules
   */
  static async monitorAllPlatforms(): Promise<MonitoringStatus[]> {
    const statuses: MonitoringStatus[] = [];

    for (const platform of this.config.platforms) {
      const status = await this.monitorPlatform(platform);
      statuses.push(status);
    }

    return statuses;
  }

  /**
   * Monitor single platform
   */
  static async monitorPlatform(platform: Platform): Promise<MonitoringStatus> {
    // Get activity metrics
    const metrics = RateLimitTracker.getActivityMetrics(platform);

    // Check platform policies
    const policyCheck = await PolicyComplianceChecker.checkPlatformPolicies(platform);

    // Determine compliance status
    const complianceStatus = policyCheck.compliant 
      ? 'compliant' 
      : policyCheck.violations.length > 0 
        ? 'non_compliant' 
        : 'warning';

    const status: MonitoringStatus = {
      platform,
      activityLevel: metrics.level,
      callsLastHour: metrics.callsLastHour,
      rateLimitPercentage: 0, // Will be updated when we receive API response headers
      nextCheckTime: metrics.nextCheckTime,
      complianceStatus,
      lastComplianceCheck: new Date(),
    };

    console.log(`[SocialMediaPolicyMonitor] ${platform.toUpperCase()}:`, {
      activity: metrics.level,
      calls: metrics.callsLastHour,
      compliance: complianceStatus,
      nextCheck: metrics.nextCheckTime.toISOString(),
    });

    return status;
  }

  /**
   * Get sliding-scale schedule for all platforms
   */
  static getSlidingScaleSchedule(): SlidingScaleSchedule[] {
    const schedules: SlidingScaleSchedule[] = [];

    for (const platform of this.config.platforms) {
      const metrics = RateLimitTracker.getActivityMetrics(platform);
      const currentInterval = RateLimitTracker.getRecommendedInterval(metrics.level);
      
      // Predict next interval based on trend
      const nextLevel = this.predictNextActivityLevel(platform, metrics.level);
      const nextInterval = RateLimitTracker.getRecommendedInterval(nextLevel);

      schedules.push({
        platform,
        activityLevel: metrics.level,
        currentInterval,
        nextInterval,
        transitionTime: metrics.nextCheckTime,
      });
    }

    return schedules;
  }

  /**
   * Predict next activity level (simple heuristic)
   */
  private static predictNextActivityLevel(
    platform: Platform,
    currentLevel: ActivityLevel
  ): ActivityLevel {
    // TODO: Implement ML-based prediction
    // For now, assume activity stays constant
    return currentLevel;
  }

  /**
   * Process API response headers and update rate limits
   */
  static async processAPIResponse(
    platform: Platform,
    headers: Record<string, any>
  ): Promise<void> {
    // Track the call
    RateLimitTracker.trackCall(platform);

    // Parse platform-specific headers
    let rateLimitData = null;

    if (platform === 'facebook' || platform === 'instagram') {
      rateLimitData = RateLimitTracker.parseFacebookHeaders(headers);
    }
    // TODO: Add parsers for other platforms

    if (rateLimitData) {
      await RateLimitTracker.processRateLimit(rateLimitData);
    }
  }

  /**
   * Handle spam flag detection
   */
  static async handleSpamFlag(
    platform: Platform,
    errorCode: string,
    errorMessage: string
  ): Promise<void> {
    console.error(`[SocialMediaPolicyMonitor] SPAM FLAG DETECTED: ${platform}`);

    // Delegate to compliance checker
    await PolicyComplianceChecker.handleSpamFlag(platform, errorCode, errorMessage);

    // Emergency stop all jobs for this platform
    await this.emergencyStopPlatform(platform);
  }

  /**
   * Emergency stop all monitoring/API calls for a platform
   */
  private static async emergencyStopPlatform(platform: Platform): Promise<void> {
    console.log(`[SocialMediaPolicyMonitor] EMERGENCY STOP: ${platform}`);

    // TODO: Implement emergency stop
    // 1. Cancel all scheduled jobs
    // 2. Clear job queue
    // 3. Set platform status to 'disabled'
    // 4. Send critical notification

    if (this.monitoringQueue) {
      // Remove all jobs for this platform
      const jobs = await this.monitoringQueue.getJobs(['waiting', 'active', 'delayed']);
      for (const job of jobs) {
        if (job.data.platform === platform) {
          await job.remove();
        }
      }
    }

    console.log(`[SocialMediaPolicyMonitor] Emergency stop complete for ${platform}`);
  }

  /**
   * Generate comprehensive monitoring dashboard data
   */
  static async getDashboardData(): Promise<{
    platforms: MonitoringStatus[];
    slidingSchedule: SlidingScaleSchedule[];
    recentAlerts: any[];
    complianceReport: any;
    summary: {
      totalPlatforms: number;
      activePlatforms: number;
      criticalAlerts: number;
      complianceIssues: number;
    };
  }> {
    // Get platform statuses
    const platforms = await this.monitorAllPlatforms();

    // Get sliding schedule
    const slidingSchedule = this.getSlidingScaleSchedule();

    // Get recent alerts (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentAlerts = await db.query.monitoringAlerts.findMany({
      where: (alerts, { gte }) => gte(alerts.createdAt, oneDayAgo),
      orderBy: (alerts, { desc }) => [desc(alerts.createdAt)],
      limit: 50,
    });

    // Get compliance report
    const complianceReport = await PolicyComplianceChecker.generateComplianceReport();

    // Calculate summary
    const activePlatforms = platforms.filter(p => p.callsLastHour > 0).length;
    const criticalAlerts = recentAlerts.filter(a => a.severity === 'critical').length;
    const complianceIssues = complianceReport.criticalIssues;

    return {
      platforms,
      slidingSchedule,
      recentAlerts,
      complianceReport,
      summary: {
        totalPlatforms: this.config.platforms.length,
        activePlatforms,
        criticalAlerts,
        complianceIssues,
      },
    };
  }

  /**
   * Schedule monitoring job based on activity level
   */
  static async scheduleMonitoringJob(
    platform: Platform,
    jobType: 'rate_limit' | 'compliance' | 'policy_change'
  ): Promise<void> {
    if (!this.monitoringQueue) {
      console.error('[SocialMediaPolicyMonitor] Queue not initialized');
      return;
    }

    const metrics = RateLimitTracker.getActivityMetrics(platform);
    const delay = this.getDelayForActivityLevel(metrics.level);

    await this.monitoringQueue.add(
      `monitor-${platform}-${jobType}`,
      {
        platform,
        jobType,
        activityLevel: metrics.level,
      },
      {
        delay,
        jobId: `${platform}-${jobType}-${Date.now()}`,
      }
    );

    console.log(`[SocialMediaPolicyMonitor] Scheduled ${jobType} check for ${platform} (${metrics.level} level, delay: ${delay}ms)`);
  }

  /**
   * Get delay in milliseconds for activity level
   */
  private static getDelayForActivityLevel(level: ActivityLevel): number {
    switch (level) {
      case 'IDLE': return 24 * 60 * 60 * 1000; // 24 hours
      case 'LOW': return 60 * 60 * 1000; // 1 hour
      case 'MEDIUM': return 5 * 60 * 1000; // 5 minutes
      case 'HIGH': return 60 * 1000; // 1 minute
      case 'CRITICAL': return 10 * 1000; // 10 seconds
      default: return 60 * 60 * 1000; // 1 hour
    }
  }

  /**
   * Update configuration
   */
  static updateConfig(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[SocialMediaPolicyMonitor] Configuration updated:', this.config);
  }

  /**
   * Get current configuration
   */
  static getConfig(): MonitoringConfig {
    return { ...this.config };
  }
}
