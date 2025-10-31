/**
 * SOCIAL AUTOMATION WORKER
 * Handles: Likes, comments, follows, friend requests
 * Automations: A-SOCIAL-01 through A-SOCIAL-05
 */

import { Worker, Job } from "bullmq";
import { storage } from "../storage";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

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

// Create Worker
const socialWorker = new Worker(
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
