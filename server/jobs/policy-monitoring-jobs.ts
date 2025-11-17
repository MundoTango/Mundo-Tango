/**
 * Policy Monitoring Jobs - Cron job definitions with sliding-scale frequencies
 * PHASE 0A: Recursive Monitoring System
 */

import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';
import { SocialMediaPolicyMonitor } from '../services/monitoring/SocialMediaPolicyMonitor';
import { RateLimitTracker, Platform } from '../services/monitoring/RateLimitTracker';
import type { PolicyMonitorJobData } from '../workers/policy-monitor-worker';

export class PolicyMonitoringJobs {
  private static queue: Queue<PolicyMonitorJobData> | null = null;
  private static intervals: Map<string, NodeJS.Timeout> = new Map();
  private static isInitialized = false;

  /**
   * Initialize monitoring jobs system
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[PolicyMonitoringJobs] Already initialized');
      return;
    }

    console.log('[PolicyMonitoringJobs] Initializing policy monitoring jobs...');

    try {
      // Initialize BullMQ queue
      this.queue = new Queue<PolicyMonitorJobData>('policy-monitoring', {
        connection: redisConnection,
      });

      // Initialize monitoring system
      await SocialMediaPolicyMonitor.initialize();

      // Schedule all monitoring jobs
      await this.scheduleAllJobs();

      this.isInitialized = true;
      console.log('[PolicyMonitoringJobs] Initialization complete');
    } catch (error) {
      console.error('[PolicyMonitoringJobs] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Schedule all monitoring jobs with sliding-scale frequencies
   */
  private static async scheduleAllJobs(): Promise<void> {
    console.log('[PolicyMonitoringJobs] Scheduling all monitoring jobs...');

    // Schedule platform-specific monitoring with sliding scale
    await this.schedulePlatformMonitoring();

    // Schedule compliance checks (daily)
    await this.scheduleComplianceChecks();

    // Schedule policy change detection (every 6 hours)
    await this.schedulePolicyChangeDetection();

    // Schedule dashboard report generation (every hour)
    await this.scheduleDashboardReports();

    console.log('[PolicyMonitoringJobs] All jobs scheduled');
  }

  /**
   * Schedule platform monitoring with sliding-scale frequencies
   */
  private static async schedulePlatformMonitoring(): Promise<void> {
    const platforms: Platform[] = [
      'facebook',
      'instagram',
      'twitter',
      'tiktok',
      'linkedin',
      'youtube',
      'whatsapp',
    ];

    for (const platform of platforms) {
      await this.schedulePlatformJob(platform);
    }
  }

  /**
   * Schedule monitoring job for a specific platform
   * Frequency adjusts based on activity level (sliding scale)
   */
  private static async schedulePlatformJob(platform: Platform): Promise<void> {
    if (!this.queue) return;

    const metrics = RateLimitTracker.getActivityMetrics(platform);
    const intervalMs = this.getIntervalForActivityLevel(metrics.level);
    const jobId = `platform-monitor-${platform}`;

    // Clear existing interval if any
    const existingInterval = this.intervals.get(jobId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Schedule recurring job
    const interval = setInterval(async () => {
      try {
        // Add job to queue
        await this.queue?.add(
          `monitor-${platform}`,
          {
            jobType: 'platform_monitor',
            platform,
          },
          {
            jobId: `${jobId}-${Date.now()}`,
          }
        );

        // Update interval based on new activity level
        const newMetrics = RateLimitTracker.getActivityMetrics(platform);
        if (newMetrics.level !== metrics.level) {
          console.log(`[PolicyMonitoringJobs] Activity level changed for ${platform}: ${metrics.level} → ${newMetrics.level}`);
          await this.schedulePlatformJob(platform); // Reschedule with new interval
        }
      } catch (error) {
        console.error(`[PolicyMonitoringJobs] Failed to schedule ${platform} monitoring:`, error);
      }
    }, intervalMs);

    this.intervals.set(jobId, interval);

    console.log(`[PolicyMonitoringJobs] Scheduled ${platform} monitoring (${metrics.level} level, interval: ${intervalMs}ms)`);
  }

  /**
   * Get interval in milliseconds for activity level
   */
  private static getIntervalForActivityLevel(level: string): number {
    switch (level) {
      case 'IDLE': return 24 * 60 * 60 * 1000; // Daily
      case 'LOW': return 60 * 60 * 1000; // Hourly
      case 'MEDIUM': return 5 * 60 * 1000; // Every 5 minutes
      case 'HIGH': return 60 * 1000; // Every 1 minute
      case 'CRITICAL': return 10 * 1000; // Every 10 seconds
      default: return 60 * 60 * 1000; // Hourly default
    }
  }

  /**
   * Schedule compliance checks (daily at 2 AM)
   */
  private static async scheduleComplianceChecks(): Promise<void> {
    if (!this.queue) return;

    const jobId = 'compliance-check-daily';

    // Run daily at 2 AM
    const interval = setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 2 && now.getMinutes() === 0) {
        try {
          await this.queue?.add(
            'compliance-check',
            {
              jobType: 'compliance_check',
            },
            {
              jobId: `${jobId}-${Date.now()}`,
            }
          );
          console.log('[PolicyMonitoringJobs] Daily compliance check scheduled');
        } catch (error) {
          console.error('[PolicyMonitoringJobs] Failed to schedule compliance check:', error);
        }
      }
    }, 60 * 1000); // Check every minute

    this.intervals.set(jobId, interval);

    // Also run immediately on startup
    try {
      await this.queue.add(
        'compliance-check-startup',
        {
          jobType: 'compliance_check',
        },
        {
          jobId: `${jobId}-startup-${Date.now()}`,
        }
      );
      console.log('[PolicyMonitoringJobs] Startup compliance check scheduled');
    } catch (error) {
      console.error('[PolicyMonitoringJobs] Failed to schedule startup compliance check:', error);
    }
  }

  /**
   * Schedule policy change detection (every 6 hours)
   */
  private static async schedulePolicyChangeDetection(): Promise<void> {
    if (!this.queue) return;

    const jobId = 'policy-change-detection';
    const intervalMs = 6 * 60 * 60 * 1000; // 6 hours

    const interval = setInterval(async () => {
      try {
        await this.queue?.add(
          'policy-change-detection',
          {
            jobType: 'policy_change_detection',
          },
          {
            jobId: `${jobId}-${Date.now()}`,
          }
        );
        console.log('[PolicyMonitoringJobs] Policy change detection scheduled');
      } catch (error) {
        console.error('[PolicyMonitoringJobs] Failed to schedule policy change detection:', error);
      }
    }, intervalMs);

    this.intervals.set(jobId, interval);

    // Run immediately on startup
    try {
      await this.queue.add(
        'policy-change-detection-startup',
        {
          jobType: 'policy_change_detection',
        },
        {
          jobId: `${jobId}-startup-${Date.now()}`,
        }
      );
      console.log('[PolicyMonitoringJobs] Startup policy change detection scheduled');
    } catch (error) {
      console.error('[PolicyMonitoringJobs] Failed to schedule startup policy change detection:', error);
    }
  }

  /**
   * Schedule dashboard report generation (every hour)
   */
  private static async scheduleDashboardReports(): Promise<void> {
    if (!this.queue) return;

    const jobId = 'dashboard-report';
    const intervalMs = 60 * 60 * 1000; // 1 hour

    const interval = setInterval(async () => {
      try {
        await this.queue?.add(
          'dashboard-report',
          {
            jobType: 'generate_report',
          },
          {
            jobId: `${jobId}-${Date.now()}`,
          }
        );
        console.log('[PolicyMonitoringJobs] Dashboard report generation scheduled');
      } catch (error) {
        console.error('[PolicyMonitoringJobs] Failed to schedule dashboard report:', error);
      }
    }, intervalMs);

    this.intervals.set(jobId, interval);

    // Run immediately on startup
    try {
      await this.queue.add(
        'dashboard-report-startup',
        {
          jobType: 'generate_report',
        },
        {
          jobId: `${jobId}-startup-${Date.now()}`,
        }
      );
      console.log('[PolicyMonitoringJobs] Startup dashboard report scheduled');
    } catch (error) {
      console.error('[PolicyMonitoringJobs] Failed to schedule startup dashboard report:', error);
    }
  }

  /**
   * Manually trigger platform monitoring
   */
  static async triggerPlatformMonitor(platform: Platform): Promise<void> {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    await this.queue.add(
      `manual-monitor-${platform}`,
      {
        jobType: 'platform_monitor',
        platform,
      },
      {
        jobId: `manual-${platform}-${Date.now()}`,
      }
    );

    console.log(`[PolicyMonitoringJobs] Manual platform monitor triggered for ${platform}`);
  }

  /**
   * Manually trigger compliance check
   */
  static async triggerComplianceCheck(): Promise<void> {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    await this.queue.add(
      'manual-compliance-check',
      {
        jobType: 'compliance_check',
      },
      {
        jobId: `manual-compliance-${Date.now()}`,
      }
    );

    console.log('[PolicyMonitoringJobs] Manual compliance check triggered');
  }

  /**
   * Manually trigger dashboard report
   */
  static async triggerDashboardReport(): Promise<void> {
    if (!this.queue) {
      throw new Error('Queue not initialized');
    }

    await this.queue.add(
      'manual-dashboard-report',
      {
        jobType: 'generate_report',
      },
      {
        jobId: `manual-report-${Date.now()}`,
      }
    );

    console.log('[PolicyMonitoringJobs] Manual dashboard report triggered');
  }

  /**
   * Stop all monitoring jobs
   */
  static async stopAll(): Promise<void> {
    console.log('[PolicyMonitoringJobs] Stopping all monitoring jobs...');

    // Clear all intervals
    for (const [jobId, interval] of this.intervals.entries()) {
      clearInterval(interval);
      console.log(`[PolicyMonitoringJobs] Stopped job: ${jobId}`);
    }

    this.intervals.clear();
    this.isInitialized = false;

    console.log('[PolicyMonitoringJobs] All jobs stopped');
  }

  /**
   * Get status of all scheduled jobs
   */
  static getJobStatus(): {
    initialized: boolean;
    activeJobs: number;
    jobs: string[];
  } {
    return {
      initialized: this.isInitialized,
      activeJobs: this.intervals.size,
      jobs: Array.from(this.intervals.keys()),
    };
  }
}
