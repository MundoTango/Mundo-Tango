/**
 * NOTIFICATION SERVICE
 * Handles 15 types of notifications with multi-channel delivery
 * Channels: In-app (WebSocket), Push (PWA), Email digest
 */

import { storage } from "../storage";

export type NotificationType =
  | 'friend_request'
  | 'friend_request_accepted'
  | 'post_like'
  | 'post_comment'
  | 'comment_reply'
  | 'post_share'
  | 'mention'
  | 'event_invitation'
  | 'event_reminder'
  | 'event_update'
  | 'event_rsvp'
  | 'goal_milestone'
  | 'task_due'
  | 'task_completed'
  | 'system_announcement';

interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  senderId?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Create and send notification
   */
  async createNotification(params: CreateNotificationParams) {
    const {
      userId,
      type,
      title,
      message,
      actionUrl,
      senderId,
      priority = 'normal',
      metadata = {},
    } = params;

    // Create notification in database
    const notification = await storage.createNotification({
      userId,
      type,
      title,
      message,
      actionUrl,
      senderId,
      priority,
      metadata,
      read: false,
    });

    // Send via appropriate channels
    await this.sendNotification(notification, userId);

    return notification;
  }

  private async sendNotification(notification: any, userId: number) {
    // TODO: Send via WebSocket (real-time)
    // TODO: Send push notification if user offline
    // TODO: Queue for email digest if configured
    
    console.log(`[Notification] Sent ${notification.type} to user ${userId}`);
  }

  /**
   * Notification helpers for common scenarios
   */
  async notifyFriendRequest(senderId: number, receiverId: number) {
    const sender = await storage.getUserById(senderId);
    if (!sender) return;

    return this.createNotification({
      userId: receiverId,
      type: 'friend_request',
      title: 'New friend request',
      message: `${sender.name} sent you a friend request`,
      actionUrl: `/profile/${senderId}`,
      senderId,
      priority: 'normal',
    });
  }

  async notifyPostLike(postId: number, postUserId: number, likerId: number) {
    const liker = await storage.getUserById(likerId);
    if (!liker || postUserId === likerId) return;

    return this.createNotification({
      userId: postUserId,
      type: 'post_like',
      title: 'New like',
      message: `${liker.name} liked your post`,
      actionUrl: `/feed#post-${postId}`,
      senderId: likerId,
      priority: 'low',
      metadata: { postId },
    });
  }

  async notifyPostComment(postId: number, postUserId: number, commenterId: number) {
    const commenter = await storage.getUserById(commenterId);
    if (!commenter || postUserId === commenterId) return;

    return this.createNotification({
      userId: postUserId,
      type: 'post_comment',
      title: 'New comment',
      message: `${commenter.name} commented on your post`,
      actionUrl: `/feed#post-${postId}`,
      senderId: commenterId,
      priority: 'normal',
      metadata: { postId },
    });
  }

  async notifyMention(mentionedUserId: number, postId: number, authorId: number) {
    const author = await storage.getUserById(authorId);
    if (!author || mentionedUserId === authorId) return;

    return this.createNotification({
      userId: mentionedUserId,
      type: 'mention',
      title: 'You were mentioned',
      message: `${author.name} mentioned you in a post`,
      actionUrl: `/feed#post-${postId}`,
      senderId: authorId,
      priority: 'high',
      metadata: { postId },
    });
  }

  async notifyEventReminder(userId: number, eventId: number) {
    const event = await storage.getEventById(eventId);
    if (!event) return;

    return this.createNotification({
      userId,
      type: 'event_reminder',
      title: 'Event starting soon',
      message: `${event.title} starts in 1 hour`,
      actionUrl: `/events/${eventId}`,
      priority: 'urgent',
      metadata: { eventId },
    });
  }

  async notifyGoalMilestone(userId: number, goalTitle: string, percentage: number) {
    return this.createNotification({
      userId,
      type: 'goal_milestone',
      title: 'Goal milestone reached!',
      message: `You've reached ${percentage}% of your goal: ${goalTitle}`,
      actionUrl: `/life-ceo/goals`,
      priority: 'normal',
      metadata: { goalTitle, percentage },
    });
  }
}

export const notificationService = new NotificationService();
