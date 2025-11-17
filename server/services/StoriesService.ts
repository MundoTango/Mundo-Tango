/**
 * StoriesService - Manage Stories (24hr expiration, view tracking)
 * 
 * Features:
 * - Create/delete stories
 * - View tracking
 * - 24-hour automatic expiration
 * - Story highlights
 */

import { db } from '@db';
import { posts, storyViews, users, friendships } from '@shared/schema';
import { eq, and, sql, inArray, gt, desc } from 'drizzle-orm';
import { NotFoundError, UnauthorizedError, ValidationError } from '../lib/errors';

export class StoriesService {
  /**
   * Create a new story (expires in 24 hours)
   */
  static async createStory(userId: number, data: {
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    mediaGallery?: any;
  }) {
    if (!data.imageUrl && !data.videoUrl && !data.mediaGallery) {
      throw new ValidationError('Stories must have at least one media item');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const [story] = await db.insert(posts).values({
      userId,
      content: data.content || '',
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      mediaGallery: data.mediaGallery,
      type: 'story',
      visibility: 'public',
      postType: 'story',
      status: 'published',
      expiresAt,
    }).returning();

    return story;
  }

  /**
   * Get active stories feed (friends' stories, not expired)
   */
  static async getStoriesFeed(userId: number) {
    const now = new Date();

    // Get user's friends
    const friendsResult = await db
      .select({ friendId: friendships.friendId })
      .from(friendships)
      .where(
        and(
          eq(friendships.userId, userId),
          eq(friendships.status, 'accepted')
        )
      );

    const friendIds = friendsResult.map(f => f.friendId);

    if (friendIds.length === 0) {
      return [];
    }

    // Get active stories from friends
    const stories = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        mediaGallery: posts.mediaGallery,
        createdAt: posts.createdAt,
        expiresAt: posts.expiresAt,
        author: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
        },
        viewCount: sql<number>`(SELECT COUNT(*) FROM ${storyViews} WHERE ${storyViews.storyId} = ${posts.id})`,
        hasViewed: sql<boolean>`EXISTS(SELECT 1 FROM ${storyViews} WHERE ${storyViews.storyId} = ${posts.id} AND ${storyViews.viewerId} = ${userId})`,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(
        and(
          inArray(posts.userId, friendIds),
          eq(posts.type, 'story'),
          gt(posts.expiresAt, now)
        )
      )
      .orderBy(desc(posts.createdAt));

    // Group stories by user
    const storiesByUser = new Map<number, any[]>();
    stories.forEach(story => {
      if (!storiesByUser.has(story.userId)) {
        storiesByUser.set(story.userId, []);
      }
      storiesByUser.get(story.userId)!.push(story);
    });

    // Format as array of users with their stories
    return Array.from(storiesByUser.entries()).map(([userId, userStories]) => ({
      user: userStories[0].author,
      stories: userStories.map(s => ({
        id: s.id,
        content: s.content,
        imageUrl: s.imageUrl,
        videoUrl: s.videoUrl,
        mediaGallery: s.mediaGallery,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        viewCount: s.viewCount,
        hasViewed: s.hasViewed,
      })),
      hasUnviewed: userStories.some(s => !s.hasViewed),
    }));
  }

  /**
   * Get user's own stories
   */
  static async getUserStories(userId: number) {
    const now = new Date();

    return await db
      .select({
        id: posts.id,
        content: posts.content,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        mediaGallery: posts.mediaGallery,
        createdAt: posts.createdAt,
        expiresAt: posts.expiresAt,
        viewCount: sql<number>`(SELECT COUNT(*) FROM ${storyViews} WHERE ${storyViews.storyId} = ${posts.id})`,
      })
      .from(posts)
      .where(
        and(
          eq(posts.userId, userId),
          eq(posts.type, 'story'),
          gt(posts.expiresAt, now)
        )
      )
      .orderBy(desc(posts.createdAt));
  }

  /**
   * Record a story view
   */
  static async recordView(storyId: number, viewerId: number) {
    const story = await db.query.posts.findFirst({
      where: and(
        eq(posts.id, storyId),
        eq(posts.type, 'story')
      ),
    });

    if (!story) {
      throw new NotFoundError('Story not found');
    }

    // Check if already viewed
    const existing = await db.query.storyViews.findFirst({
      where: and(
        eq(storyViews.storyId, storyId),
        eq(storyViews.viewerId, viewerId)
      ),
    });

    if (existing) {
      return; // Already viewed
    }

    // Record view
    await db.insert(storyViews).values({
      storyId,
      viewerId,
    });
  }

  /**
   * Get story viewers
   */
  static async getStoryViewers(storyId: number, userId: number) {
    // Verify story belongs to user
    const story = await db.query.posts.findFirst({
      where: and(
        eq(posts.id, storyId),
        eq(posts.type, 'story')
      ),
    });

    if (!story) {
      throw new NotFoundError('Story not found');
    }

    if (story.userId !== userId) {
      throw new UnauthorizedError('Not authorized to view story analytics');
    }

    return await db
      .select({
        id: storyViews.id,
        viewedAt: storyViews.createdAt,
        viewer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
        },
      })
      .from(storyViews)
      .innerJoin(users, eq(storyViews.viewerId, users.id))
      .where(eq(storyViews.storyId, storyId))
      .orderBy(desc(storyViews.createdAt));
  }

  /**
   * Delete a story
   */
  static async deleteStory(storyId: number, userId: number) {
    const story = await db.query.posts.findFirst({
      where: and(
        eq(posts.id, storyId),
        eq(posts.type, 'story')
      ),
    });

    if (!story) {
      throw new NotFoundError('Story not found');
    }

    if (story.userId !== userId) {
      throw new UnauthorizedError('Not authorized to delete this story');
    }

    await db.delete(posts).where(eq(posts.id, storyId));

    return { success: true };
  }

  /**
   * Clean up expired stories (run as cron job)
   */
  static async cleanupExpiredStories() {
    const now = new Date();

    const result = await db
      .delete(posts)
      .where(
        and(
          eq(posts.type, 'story'),
          sql`${posts.expiresAt} < ${now}`
        )
      );

    return result;
  }
}
