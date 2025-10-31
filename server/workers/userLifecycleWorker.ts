/**
 * USER LIFECYCLE AUTOMATION WORKER
 * Handles: New user onboarding, profile completion, welcome messages
 * Automations: A-USER-01, A-USER-02, A-USER-03
 */

import { Worker, Job } from "bullmq";
import { storage } from "../storage";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

// A-USER-01: New User Welcome
async function handleNewUserWelcome(job: Job) {
  const { userId } = job.data;
  
  console.log(`[A-USER-01] Processing new user welcome for user ${userId}`);
  
  // 1. Create welcome notification
  await storage.createNotification({
    userId,
    type: "welcome",
    title: "Welcome to Mundo Tango! 🎉",
    message: "Complete your profile to connect with the global tango community",
    actionUrl: "/profile/edit",
  });
  
  // 2. Send welcome email (integration with email service)
  // await emailService.sendWelcomeEmail(userId);
  
  // 3. Suggest first steps
  await storage.createNotification({
    userId,
    type: "suggestion",
    title: "Get Started",
    message: "Join your local city community and discover events near you",
    actionUrl: "/communities",
  });
  
  console.log(`[A-USER-01] ✅ Welcome sent to user ${userId}`);
}

// A-USER-02: Profile Completion Reminder
async function handleProfileCompletionReminder(job: Job) {
  const { userId } = job.data;
  
  console.log(`[A-USER-02] Checking profile completion for user ${userId}`);
  
  const user = await storage.getUserById(userId);
  if (!user) return;
  
  const completionScore = calculateProfileCompletion(user);
  
  if (completionScore < 50) {
    await storage.createNotification({
      userId,
      type: "reminder",
      title: "Complete your profile",
      message: `Your profile is ${completionScore}% complete. Add a photo and bio to connect better!`,
      actionUrl: "/profile/edit",
    });
  }
  
  console.log(`[A-USER-02] ✅ Profile completion: ${completionScore}%`);
}

// A-USER-03: Inactivity Re-engagement
async function handleInactivityReengagement(job: Job) {
  const { userId } = job.data;
  
  console.log(`[A-USER-03] Re-engaging inactive user ${userId}`);
  
  // Send notification about new content
  await storage.createNotification({
    userId,
    type: "reengagement",
    title: "You've been missed! 💃",
    message: "Check out what's new in your community - 5 new events this week",
    actionUrl: "/events",
  });
  
  console.log(`[A-USER-03] ✅ Re-engagement sent to user ${userId}`);
}

// Helper function
function calculateProfileCompletion(user: any): number {
  let score = 0;
  if (user.profileImage) score += 20;
  if (user.bio) score += 20;
  if (user.city) score += 15;
  if (user.tangoRoles?.length > 0) score += 15;
  if (user.yearsOfDancing > 0) score += 15;
  if (user.languages?.length > 0) score += 15;
  return score;
}

// Create Worker
const userLifecycleWorker = new Worker(
  "user-lifecycle",
  async (job: Job) => {
    try {
      switch (job.name) {
        case "new-user-welcome":
          await handleNewUserWelcome(job);
          break;
        case "profile-completion-reminder":
          await handleProfileCompletionReminder(job);
          break;
        case "inactivity-reengagement":
          await handleInactivityReengagement(job);
          break;
        default:
          console.error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      console.error(`[User Lifecycle Worker] Error:`, error);
      throw error;
    }
  },
  { connection }
);

userLifecycleWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

userLifecycleWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

console.log("🚀 User Lifecycle Worker started");

export default userLifecycleWorker;
