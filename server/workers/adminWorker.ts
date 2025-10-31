/**
 * ADMIN AUTOMATION WORKER
 * Handles: Content moderation, user reports, system alerts
 * Automations: A-ADMIN-01, A-ADMIN-02
 */

import { Worker, Job } from "bullmq";
import { storage } from "../storage";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

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

// Create Worker
const adminWorker = new Worker(
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
