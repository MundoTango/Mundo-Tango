/**
 * Policy Monitor Worker - BullMQ Worker for Monitoring Jobs
 * Processes rate limit checks, compliance monitoring, and policy change detection
 * PHASE 0A: Recursive Monitoring System
 */

import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { SocialMediaPolicyMonitor } from '../services/monitoring/SocialMediaPolicyMonitor';
import { RateLimitTracker, Platform } from '../services/monitoring/RateLimitTracker';
import { PolicyComplianceChecker } from '../services/monitoring/PolicyComplianceChecker';

export type PolicyMonitorJobType =
  | 'rate_limit_check'
  | 'compliance_check'
  | 'policy_change_detection'
  | 'platform_monitor'
  | 'generate_report';

export interface PolicyMonitorJobData {
  jobType: PolicyMonitorJobType;
  platform?: Platform;
  data?: any;
}

const processPolicyMonitorJob = async (job: Job<PolicyMonitorJobData>) => {
  const { jobType, platform, data } = job.data;

  console.log(`[PolicyMonitorWorker] Processing job: ${jobType}${platform ? ` for ${platform}` : ''}`);

  try {
    let result: any;

    switch (jobType) {
      case 'rate_limit_check': {
        if (!platform) {
          throw new Error('Platform required for rate_limit_check');
        }

        // Get current activity metrics
        const metrics = RateLimitTracker.getActivityMetrics(platform);

        // Log status
        console.log(`[PolicyMonitorWorker] Rate limit check for ${platform}:`, {
          callsLastHour: metrics.callsLastHour,
          activityLevel: metrics.level,
          nextCheck: metrics.nextCheckTime.toISOString(),
        });

        // Schedule next check based on activity level
        await SocialMediaPolicyMonitor.scheduleMonitoringJob(platform, 'rate_limit');

        result = {
          platform,
          metrics,
          timestamp: new Date(),
        };
        break;
      }

      case 'compliance_check': {
        if (!platform) {
          // Check all platforms
          const report = await PolicyComplianceChecker.generateComplianceReport();
          console.log(`[PolicyMonitorWorker] Compliance check complete:`, {
            criticalIssues: report.criticalIssues,
            recommendations: report.recommendations.length,
          });
          result = report;
        } else {
          // Check specific platform
          const policyCheck = await PolicyComplianceChecker.checkPlatformPolicies(platform);
          console.log(`[PolicyMonitorWorker] Compliance check for ${platform}:`, {
            compliant: policyCheck.compliant,
            violations: policyCheck.violations.length,
            warnings: policyCheck.warnings.length,
          });
          result = { platform, ...policyCheck };
        }
        break;
      }

      case 'policy_change_detection': {
        // Detect policy changes across all platforms
        const changes = await PolicyComplianceChecker.detectPolicyChanges();
        console.log(`[PolicyMonitorWorker] Policy change detection complete:`, {
          changesDetected: changes.length,
        });

        if (changes.length > 0) {
          console.log('[PolicyMonitorWorker] Policy changes detected:', changes);
        }

        result = { changes, timestamp: new Date() };
        break;
      }

      case 'platform_monitor': {
        if (!platform) {
          // Monitor all platforms
          const statuses = await SocialMediaPolicyMonitor.monitorAllPlatforms();
          console.log(`[PolicyMonitorWorker] Monitored ${statuses.length} platforms`);
          result = { statuses, timestamp: new Date() };
        } else {
          // Monitor specific platform
          const status = await SocialMediaPolicyMonitor.monitorPlatform(platform);
          console.log(`[PolicyMonitorWorker] Monitored ${platform}:`, status);
          result = { platform, status, timestamp: new Date() };
        }
        break;
      }

      case 'generate_report': {
        // Generate comprehensive dashboard data
        const dashboard = await SocialMediaPolicyMonitor.getDashboardData();
        console.log(`[PolicyMonitorWorker] Dashboard report generated:`, {
          platforms: dashboard.summary.totalPlatforms,
          active: dashboard.summary.activePlatforms,
          criticalAlerts: dashboard.summary.criticalAlerts,
          complianceIssues: dashboard.summary.complianceIssues,
        });
        result = dashboard;
        break;
      }

      default:
        throw new Error(`Unknown job type: ${jobType}`);
    }

    console.log(`[PolicyMonitorWorker] Job ${jobType} completed successfully`);
    return result;
  } catch (error: any) {
    console.error(`[PolicyMonitorWorker] Job ${jobType} failed:`, error);
    throw error;
  }
};

const worker = new Worker<PolicyMonitorJobData>(
  'policy-monitoring',
  processPolicyMonitorJob,
  {
    connection: redisConnection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 60000, // 10 jobs per minute max
    },
  }
);

worker.on('completed', (job) => {
  console.log(`[PolicyMonitorWorker] Job ${job.id} (${job.data.jobType}) completed`);
});

worker.on('failed', (job, error) => {
  console.error(`[PolicyMonitorWorker] Job ${job?.id} (${job?.data.jobType}) failed:`, error);
});

worker.on('error', (error) => {
  console.error('[PolicyMonitorWorker] Worker error:', error);
});

console.log('[PolicyMonitorWorker] Policy Monitor Worker started');

export default worker;
