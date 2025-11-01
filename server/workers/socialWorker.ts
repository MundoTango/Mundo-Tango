/**
 * SOCIAL AUTOMATION WORKER
 * Handles: Likes, comments, follows, friend requests
 * Automations: A-SOCIAL-01 through A-SOCIAL-05
 */

import { Job } from "bullmq";
import { storage } from "../storage";
import { createWorker } from "./redis-fallback";

// A-SOCIAL-01: Follow Notification
async function handleFollowNotification(job: Job) {
  const { followerId, followingId } = job.data;
  
  console.log(`[A-SOCIAL-01] User ${followerId} followed user ${followingId}`);
  
  const follower = await storage.getUserById(followerId);
  if (!follower) return;
  
  await storage.createNotification({
    userId: followingId,
    type: "follow",
    title: "New follower",
    message: `${follower.name} started following you`,
    actionUrl: `/profile/${follower.username}`,
  });
  
  console.log(`[A-SOCIAL-01] ✅ Follow notification sent`);
}

// A-SOCIAL-02: Like Notification
async function handleLikeNotification(job: Job) {
  const { postId, userId, postAuthorId } = job.data;
  
  if (userId === postAuthorId) return; // Don't notify if liking own post
  
  console.log(`[A-SOCIAL-02] User ${userId} liked post ${postId}`);
  
  const user = await storage.getUserById(userId);
  if (!user) return;
  
  await storage.createNotification({
    userId: postAuthorId,
    type: "like",
    title: "Someone liked your post",
    message: `${user.name} liked your post`,
    actionUrl: `/posts/${postId}`,
  });
  
  console.log(`[A-SOCIAL-02] ✅ Like notification sent`);
}

// A-SOCIAL-03: Comment Notification
async function handleCommentNotification(job: Job) {
  const { postId, commentId, userId, postAuthorId } = job.data;
  
  if (userId === postAuthorId) return; // Don't notify if commenting on own post
  
  console.log(`[A-SOCIAL-03] User ${userId} commented on post ${postId}`);
  
  const user = await storage.getUserById(userId);
  if (!user) return;
  
  await storage.createNotification({
    userId: postAuthorId,
    type: "comment",
    title: "New comment on your post",
    message: `${user.name} commented on your post`,
    actionUrl: `/posts/${postId}#comment-${commentId}`,
  });
  
  console.log(`[A-SOCIAL-03] ✅ Comment notification sent`);
}

// A-SOCIAL-04: Friend Request Notification
async function handleFriendRequestNotification(job: Job) {
  const { senderId, receiverId } = job.data;
  
  console.log(`[A-SOCIAL-04] Friend request from ${senderId} to ${receiverId}`);
  
  const sender = await storage.getUserById(senderId);
  if (!sender) return;
  
  await storage.createNotification({
    userId: receiverId,
    type: "friend_request",
    title: "New friend request",
    message: `${sender.name} sent you a friend request`,
    actionUrl: "/friends/requests",
  });
  
  console.log(`[A-SOCIAL-04] ✅ Friend request notification sent`);
}

// A-SOCIAL-05: Share Notification
async function handleShareNotification(job: Job) {
  const { postId, userId, originalAuthorId } = job.data;
  
  if (userId === originalAuthorId) return;
  
  console.log(`[A-SOCIAL-05] User ${userId} shared post ${postId}`);
  
  const user = await storage.getUserById(userId);
  if (!user) return;
  
  await storage.createNotification({
    userId: originalAuthorId,
    type: "share",
    title: "Someone shared your post",
    message: `${user.name} shared your post`,
    actionUrl: `/posts/${postId}`,
  });
  
  console.log(`[A-SOCIAL-05] ✅ Share notification sent`);
}

// A-SOCIAL-06: Community Digest
async function handleCommunityDigest(job: Job) {
  const { userId, communityId } = job.data;
  
  console.log(`[A-SOCIAL-06] Generating community digest for user ${userId}`);
  
  await storage.createNotification({
    userId,
    type: "digest",
    title: "This Week in Your Community 📰",
    message: "Top posts, events, and conversations you missed",
    actionUrl: `/communities/${communityId}`,
  });
  
  console.log(`[A-SOCIAL-06] ✅ Community digest sent`);
}

// A-SOCIAL-07: Trending Content Alert
async function handleTrendingContentAlert(job: Job) {
  const { userId, postId, engagementCount } = job.data;
  
  console.log(`[A-SOCIAL-07] Trending content alert for user ${userId}`);
  
  await storage.createNotification({
    userId,
    type: "trending",
    title: "Trending in Your City! 🔥",
    message: `A post is going viral with ${engagementCount} interactions`,
    actionUrl: `/posts/${postId}`,
  });
  
  console.log(`[A-SOCIAL-07] ✅ Trending alert sent`);
}

// A-SOCIAL-08: User Recommendations
async function handleUserRecommendation(job: Job) {
  const { userId, recommendedUserId } = job.data;
  
  console.log(`[A-SOCIAL-08] Recommending user ${recommendedUserId} to ${userId}`);
  
  const recommendedUser = await storage.getUserById(recommendedUserId);
  if (!recommendedUser) return;
  
  await storage.createNotification({
    userId,
    type: "recommendation",
    title: "People You May Know 👥",
    message: `Connect with ${recommendedUser.name} - you have mutual friends!`,
    actionUrl: `/profile/${recommendedUser.username}`,
  });
  
  console.log(`[A-SOCIAL-08] ✅ User recommendation sent`);
}

// A-SOCIAL-09: Engagement Boost Suggestions
async function handleEngagementBoost(job: Job) {
  const { userId, optimalTime } = job.data;
  
  console.log(`[A-SOCIAL-09] Engagement boost for user ${userId}`);
  
  await storage.createNotification({
    userId,
    type: "tip",
    title: "Boost Your Reach! 📈",
    message: `Post between ${optimalTime} for maximum engagement`,
    actionUrl: "/feed",
  });
  
  console.log(`[A-SOCIAL-09] ✅ Engagement boost sent`);
}

// A-SOCIAL-10: Connection Milestones
async function handleConnectionMilestone(job: Job) {
  const { userId, friendId, yearsAsFriends } = job.data;
  
  console.log(`[A-SOCIAL-10] Connection milestone for user ${userId}`);
  
  const friend = await storage.getUserById(friendId);
  if (!friend) return;
  
  await storage.createNotification({
    userId,
    type: "friendship_anniversary",
    title: `${yearsAsFriends}-Year Friendship! 🎉`,
    message: `You and ${friend.name} have been friends for ${yearsAsFriends} ${yearsAsFriends === 1 ? "year" : "years"}`,
    actionUrl: `/profile/${friend.username}`,
  });
  
  console.log(`[A-SOCIAL-10] ✅ Connection milestone sent`);
}

// Create Worker with automatic Redis fallback
const socialWorker = createWorker(
  "social-automation",
  async (job: Job) => {
    try {
      switch (job.name) {
        case "follow-notification":
          await handleFollowNotification(job);
          break;
        case "like-notification":
          await handleLikeNotification(job);
          break;
        case "comment-notification":
          await handleCommentNotification(job);
          break;
        case "friend-request-notification":
          await handleFriendRequestNotification(job);
          break;
        case "share-notification":
          await handleShareNotification(job);
          break;
        case "community-digest":
          await handleCommunityDigest(job);
          break;
        case "trending-content-alert":
          await handleTrendingContentAlert(job);
          break;
        case "user-recommendation":
          await handleUserRecommendation(job);
          break;
        case "engagement-boost":
          await handleEngagementBoost(job);
          break;
        case "connection-milestone":
          await handleConnectionMilestone(job);
          break;
        default:
          console.error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      console.error(`[Social Worker] Error:`, error);
      throw error;
    }
  },
  { connection }
);

socialWorker.on("completed", (job) => {
  console.log(`✅ Social job ${job.id} completed`);
});

socialWorker.on("failed", (job, err) => {
  console.error(`❌ Social job ${job?.id} failed:`, err.message);
});

console.log("🚀 Social Automation Worker started");

export default socialWorker;
