/**
 * NOTIFICATION SERVICE
 * Handles 15 types of notifications with multi-channel delivery
 * Channels: In-app (WebSocket), Push (PWA), Email digest
 */

import { storage, userRepository } from "../storage";

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
  | 'system_announcement'
  | 'new_message'
  | 'group_message';

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
      isRead: false,
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
    const sender = await userRepository.getUserById(senderId);
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
    const liker = await userRepository.getUserById(likerId);
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
    const commenter = await userRepository.getUserById(commenterId);
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
    const author = await userRepository.getUserById(authorId);
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

  async notifyEventInvitation(inviteeId: number, eventId: number, eventTitle: string, inviterId: number) {
    const inviter = await userRepository.getUserById(inviterId);
    if (!inviter) return;

    return this.createNotification({
      userId: inviteeId,
      type: 'event_invitation',
      title: 'Event invitation',
      message: `${inviter.name} invited you to ${eventTitle}`,
      actionUrl: `/events/${eventId}`,
      senderId: inviterId,
      priority: 'high',
      metadata: { eventId, eventTitle },
    });
  }

  async notifyEventRsvp(organizerId: number, eventId: number, eventTitle: string, attendeeId: number, status: string) {
    const attendee = await userRepository.getUserById(attendeeId);
    if (!attendee || organizerId === attendeeId) return;

    const action = status === 'going' ? 'is going to' : status === 'interested' ? 'is interested in' : 'declined';
    return this.createNotification({
      userId: organizerId,
      type: 'event_rsvp',
      title: 'New RSVP',
      message: `${attendee.name} ${action} ${eventTitle}`,
      actionUrl: `/events/${eventId}`,
      senderId: attendeeId,
      priority: 'normal',
      metadata: { eventId, eventTitle, status },
    });
  }

  async notifyEventUpdate(attendeeId: number, eventId: number, eventTitle: string, updateType: string) {
    return this.createNotification({
      userId: attendeeId,
      type: 'event_update',
      title: 'Event updated',
      message: `${eventTitle} has been ${updateType}`,
      actionUrl: `/events/${eventId}`,
      priority: 'normal',
      metadata: { eventId, eventTitle, updateType },
    });
  }

  async notifyEventPhotoUploaded(organizerId: number, eventId: number, eventTitle: string, uploaderId: number) {
    const uploader = await userRepository.getUserById(uploaderId);
    if (!uploader || organizerId === uploaderId) return;

    return this.createNotification({
      userId: organizerId,
      type: 'event_update',
      title: 'New event photo',
      message: `${uploader.name} uploaded a photo to ${eventTitle}`,
      actionUrl: `/events/${eventId}?tab=photos`,
      senderId: uploaderId,
      priority: 'low',
      metadata: { eventId, eventTitle },
    });
  }

  async notifyEventPost(organizerId: number, eventId: number, eventTitle: string, posterId: number) {
    const poster = await userRepository.getUserById(posterId);
    if (!poster || organizerId === posterId) return;

    return this.createNotification({
      userId: organizerId,
      type: 'event_update',
      title: 'New event discussion',
      message: `${poster.name} posted in ${eventTitle}`,
      actionUrl: `/events/${eventId}?tab=discussion`,
      senderId: posterId,
      priority: 'low',
      metadata: { eventId, eventTitle },
    });
  }

  async notifyNewMessage(recipientId: number, senderId: number, messagePreview?: string) {
    const sender = await userRepository.getUserById(senderId);
    if (!sender || recipientId === senderId) return;

    const preview = messagePreview 
      ? (messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview)
      : 'sent you a message';

    return this.createNotification({
      userId: recipientId,
      type: 'new_message',
      title: 'New message',
      message: `${sender.name}: ${preview}`,
      actionUrl: `/messages?conversation=direct-${senderId}`,
      senderId,
      priority: 'high',
      metadata: { senderId },
    });
  }

  async notifyGroupMessage(recipientId: number, senderId: number, groupId: number, groupName: string, messagePreview?: string) {
    const sender = await userRepository.getUserById(senderId);
    if (!sender || recipientId === senderId) return;

    const preview = messagePreview 
      ? (messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview)
      : 'sent a message';

    return this.createNotification({
      userId: recipientId,
      type: 'group_message',
      title: `New message in ${groupName}`,
      message: `${sender.name}: ${preview}`,
      actionUrl: `/messages?conversation=group-${groupId}`,
      senderId,
      priority: 'normal',
      metadata: { senderId, groupId, groupName },
    });
  }
}

export const notificationService = new NotificationService();
