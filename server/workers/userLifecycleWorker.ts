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

// A-USER-04: Milestone Celebrations
async function handleMilestoneCelebration(job: Job) {
  const { userId, milestone, value } = job.data;
  
  console.log(`[A-USER-04] Celebrating milestone for user ${userId}: ${milestone} = ${value}`);
  
  const milestoneMessages: Record<string, string> = {
    "10_followers": "You have 10 followers! Your tango network is growing 🎉",
    "50_posts": "50 posts shared! You're a community pillar 💪",
    "100_events": "100 events attended! True tango enthusiast 🎵",
    "1_year": "Happy 1 year anniversary with Mundo Tango! 🎂",
  };
  
  await storage.createNotification({
    userId,
    type: "milestone",
    title: `Milestone Achieved! ${value}`,
    message: milestoneMessages[milestone] || `Congratulations on reaching ${milestone}!`,
    actionUrl: "/profile",
  });
  
  console.log(`[A-USER-04] ✅ Milestone celebration sent`);
}

// A-USER-05: Feature Adoption Nudges
async function handleFeatureAdoptionNudge(job: Job) {
  const { userId, unusedFeature } = job.data;
  
  console.log(`[A-USER-05] Nudging user ${userId} to try ${unusedFeature}`);
  
  const featureNudges: Record<string, any> = {
    messaging: {
      title: "Try Messaging! 💬",
      message: "Connect directly with dancers, teachers, and organizers",
      actionUrl: "/messages",
    },
    events: {
      title: "Discover Events Near You 🎵",
      message: "Find milongas, practicas, and workshops in your city",
      actionUrl: "/events",
    },
    life_ceo: {
      title: "Try Life CEO! 🎯",
      message: "Get AI-powered coaching across 16 life domains",
      actionUrl: "/life-ceo",
    },
  };
  
  const nudge = featureNudges[unusedFeature];
  if (nudge) {
    await storage.createNotification({
      userId,
      type: "feature_nudge",
      ...nudge,
    });
  }
  
  console.log(`[A-USER-05] ✅ Feature nudge sent`);
}

// A-USER-06: Referral Rewards
async function handleReferralReward(job: Job) {
  const { userId, referredCount } = job.data;
  
  console.log(`[A-USER-06] Rewarding user ${userId} for ${referredCount} referrals`);
  
  await storage.createNotification({
    userId,
    type: "referral_reward",
    title: `${referredCount} Friends Joined Through You! 🎁`,
    message: "Thank you for growing the Mundo Tango community!",
    actionUrl: "/settings/referrals",
  });
  
  console.log(`[A-USER-06] ✅ Referral reward notification sent`);
}

// A-USER-07: Birthday Wishes
async function handleBirthdayWish(job: Job) {
  const { userId, userName } = job.data;
  
  console.log(`[A-USER-07] Sending birthday wish to ${userName} (${userId})`);
  
  await storage.createNotification({
    userId,
    type: "birthday",
    title: "Happy Birthday! 🎂🎉",
    message: "Wishing you a wonderful day full of tango and joy!",
    actionUrl: "/feed",
  });
  
  console.log(`[A-USER-07] ✅ Birthday wish sent`);
}

// A-USER-08: Anniversary Reminders
async function handleAnniversaryReminder(job: Job) {
  const { userId, yearsAgo } = job.data;
  
  console.log(`[A-USER-08] Celebrating ${yearsAgo}-year anniversary for user ${userId}`);
  
  await storage.createNotification({
    userId,
    type: "anniversary",
    title: `${yearsAgo} Years of Tango! 🎊`,
    message: `You joined Mundo Tango ${yearsAgo} ${yearsAgo === 1 ? "year" : "years"} ago. Thank you for being part of our community!`,
    actionUrl: "/profile",
  });
  
  console.log(`[A-USER-08] ✅ Anniversary reminder sent`);
}

// A-USER-09: Inactive Feature Suggestions
async function handleInactiveFeatureSuggestion(job: Job) {
  const { userId, feature } = job.data;
  
  console.log(`[A-USER-09] Suggesting ${feature} to inactive user ${userId}`);
  
  await storage.createNotification({
    userId,
    type: "suggestion",
    title: `Have you tried ${feature}? 💡`,
    message: "Discover new ways to connect with the tango community",
    actionUrl: `/${feature.toLowerCase().replace(/\s+/g, "-")}`,
  });
  
  console.log(`[A-USER-09] ✅ Feature suggestion sent`);
}

// A-USER-10: Account Health Checkups
async function handleAccountHealthCheckup(job: Job) {
  const { userId, securityIssue } = job.data;
  
  console.log(`[A-USER-10] Account health check for user ${userId}`);
  
  await storage.createNotification({
    userId,
    type: "security",
    title: "Account Security Check 🔐",
    message: securityIssue || "Review your privacy settings and keep your account secure",
    actionUrl: "/settings/security",
  });
  
  console.log(`[A-USER-10] ✅ Account health checkup sent`);
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
        case "milestone-celebration":
          await handleMilestoneCelebration(job);
          break;
        case "feature-adoption-nudge":
          await handleFeatureAdoptionNudge(job);
          break;
        case "referral-reward":
          await handleReferralReward(job);
          break;
        case "birthday-wish":
          await handleBirthdayWish(job);
          break;
        case "anniversary-reminder":
          await handleAnniversaryReminder(job);
          break;
        case "inactive-feature-suggestion":
          await handleInactiveFeatureSuggestion(job);
          break;
        case "account-health-checkup":
          await handleAccountHealthCheckup(job);
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
