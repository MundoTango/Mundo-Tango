/**
 * ADMIN AUTOMATION WORKER
 * Handles: Content moderation, user reports, system alerts
 * Automations: A-ADMIN-01, A-ADMIN-02
 */

import { Job } from "bullmq";
import { storage } from "../storage";
import { createWorker } from "./redis-fallback";

// A-ADMIN-01: Content Moderation Alert
async function handleModerationAlert(job: Job) {
  const { reportId, reportedContentId, reporterId } = job.data;
  
  console.log(`[A-ADMIN-01] Processing moderation report ${reportId}`);
  
  // Get all admin users (placeholder - would query users table with role filter)
  const admins: any[] = [];
  
  // Notify all admins
  for (const admin of admins) {
    await storage.createNotification({
      userId: admin.id,
      type: "moderation_alert",
      title: "New Content Report",
      message: "A user has reported content that requires review",
      actionUrl: `/admin/moderation/${reportId}`,
    });
  }
  
  console.log(`[A-ADMIN-01] ✅ Notified ${admins.length} admins`);
}

// A-ADMIN-02: System Health Alert
async function handleSystemHealthAlert(job: Job) {
  const { metric, value, threshold } = job.data;
  
  console.log(`[A-ADMIN-02] System health alert: ${metric} = ${value}`);
  
  // Get super admin users (placeholder - would query users table)
  const superAdmins: any[] = [];
  
  // Notify super admins
  for (const admin of superAdmins) {
    await storage.createNotification({
      userId: admin.id,
      type: "system_alert",
      title: "System Health Alert",
      message: `${metric} has exceeded threshold: ${value} > ${threshold}`,
      actionUrl: "/platform/monitoring",
    });
  }
  
  console.log(`[A-ADMIN-02] ✅ Notified ${superAdmins.length} super admins`);
}

// A-ADMIN-03: User Activity Analysis
async function handleUserActivityAnalysis(job: Job) {
  const { adminIds, reportData } = job.data;
  
  console.log(`[A-ADMIN-03] User activity analysis report`);
  
  for (const adminId of adminIds) {
    await storage.createNotification({
      userId: adminId,
      type: "activity_report",
      title: "Weekly Activity Report 📊",
      message: `${reportData.activeUsers} active users, ${reportData.newPosts} new posts this week`,
      actionUrl: "/admin/analytics",
    });
  }
  
  console.log(`[A-ADMIN-03] ✅ Activity reports sent to ${adminIds.length} admins`);
}

// A-ADMIN-04: Platform Health Monitoring
async function handlePlatformHealthMonitoring(job: Job) {
  const { adminIds, errorRate, responseTime } = job.data;
  
  console.log(`[A-ADMIN-04] Platform health monitoring`);
  
  let healthStatus = "good";
  if (errorRate > 5 || responseTime > 1000) {
    healthStatus = "warning";
  }
  if (errorRate > 10 || responseTime > 2000) {
    healthStatus = "critical";
  }
  
  if (healthStatus !== "good") {
    for (const adminId of adminIds) {
      await storage.createNotification({
        userId: adminId,
        type: "health_monitoring",
        title: `Platform Health: ${healthStatus.toUpperCase()} ⚠️`,
        message: `Error rate: ${errorRate}%, Response time: ${responseTime}ms`,
        actionUrl: "/platform/monitoring",
      });
    }
    console.log(`[A-ADMIN-04] ✅ Health alerts sent`);
  } else {
    console.log(`[A-ADMIN-04] ✅ Platform health is good`);
  }
}

// A-ADMIN-05: Backup Automation
async function handleBackupAutomation(job: Job) {
  const { adminIds, backupStatus, backupSize } = job.data;
  
  console.log(`[A-ADMIN-05] Backup automation notification`);
  
  for (const adminId of adminIds) {
    await storage.createNotification({
      userId: adminId,
      type: "backup_status",
      title: `Daily Backup ${backupStatus === "success" ? "✅" : "❌"}`,
      message: backupStatus === "success" 
        ? `Backup completed successfully (${backupSize})`
        : "Backup failed - immediate attention required",
      actionUrl: "/admin/backups",
    });
  }
  
  console.log(`[A-ADMIN-05] ✅ Backup notifications sent`);
}

// A-ADMIN-06: Performance Reports
async function handlePerformanceReport(job: Job) {
  const { adminIds, performanceData } = job.data;
  
  console.log(`[A-ADMIN-06] Weekly performance report`);
  
  for (const adminId of adminIds) {
    await storage.createNotification({
      userId: adminId,
      type: "performance_report",
      title: "Weekly Performance Summary 📈",
      message: `Page load: ${performanceData.pageLoad}ms, API response: ${performanceData.apiResponse}ms`,
      actionUrl: "/admin/performance",
    });
  }
  
  console.log(`[A-ADMIN-06] ✅ Performance reports sent`);
}

// Create Worker with automatic Redis fallback
const adminWorker = createWorker(
  "admin-automation",
  async (job: Job) => {
    try {
      switch (job.name) {
        case "moderation-alert":
          await handleModerationAlert(job);
          break;
        case "system-health-alert":
          await handleSystemHealthAlert(job);
          break;
        case "user-activity-analysis":
          await handleUserActivityAnalysis(job);
          break;
        case "platform-health-monitoring":
          await handlePlatformHealthMonitoring(job);
          break;
        case "backup-automation":
          await handleBackupAutomation(job);
          break;
        case "performance-report":
          await handlePerformanceReport(job);
          break;
        default:
          console.error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      console.error(`[Admin Worker] Error:`, error);
      throw error;
    }
  },
  { connection }
);

adminWorker.on("completed", (job) => {
  console.log(`✅ Admin job ${job.id} completed`);
});

adminWorker.on("failed", (job, err) => {
  console.error(`❌ Admin job ${job?.id} failed:`, err.message);
});

console.log("🚀 Admin Automation Worker started");

export default adminWorker;
