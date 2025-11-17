/**
 * LiveStreamService - Manage Live Streams (Daily.co integration)
 * 
 * Features:
 * - Start/stop live streams
 * - Viewer management
 * - Stream chat (WebSocket)
 * - Daily.co room creation
 */

import { db } from '@db';
import { liveStreams, streamViewers, liveStreamMessages, users } from '@shared/schema';
import { eq, and, sql, desc, isNull } from 'drizzle-orm';
import { NotFoundError, UnauthorizedError, ValidationError } from '../lib/errors';

export class LiveStreamService {
  /**
   * Create and start a live stream
   */
  static async startStream(userId: number, data: {
    title: string;
    thumbnail?: string;
  }) {
    if (!data.title || data.title.length < 3) {
      throw new ValidationError('Stream title must be at least 3 characters');
    }

    // Get user info
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user already has active stream
    const existing = await db.query.liveStreams.findFirst({
      where: and(
        eq(liveStreams.userId, userId),
        eq(liveStreams.status, 'live')
      ),
    });

    if (existing) {
      throw new ValidationError('You already have an active stream');
    }

    // Create Daily.co room (simplified - in production, use Daily API)
    const streamUrl = `https://mundo-tango.daily.co/${userId}-${Date.now()}`;

    const [stream] = await db.insert(liveStreams).values({
      userId,
      title: data.title,
      host: user.name,
      thumbnail: data.thumbnail,
      streamUrl,
      status: 'live',
      isLive: true,
      startedAt: new Date(),
    }).returning();

    return {
      ...stream,
      streamUrl,
    };
  }

  /**
   * Stop a live stream
   */
  static async stopStream(streamId: number, userId: number) {
    const stream = await db.query.liveStreams.findFirst({
      where: eq(liveStreams.id, streamId),
    });

    if (!stream) {
      throw new NotFoundError('Stream not found');
    }

    if (stream.userId !== userId) {
      throw new UnauthorizedError('Not authorized to stop this stream');
    }

    if (stream.status !== 'live') {
      throw new ValidationError('Stream is not live');
    }

    // Mark all viewers as left
    await db
      .update(streamViewers)
      .set({ leftAt: new Date() })
      .where(
        and(
          eq(streamViewers.streamId, streamId),
          isNull(streamViewers.leftAt)
        )
      );

    // Update stream status
    await db
      .update(liveStreams)
      .set({
        status: 'ended',
        isLive: false,
        endedAt: new Date(),
      })
      .where(eq(liveStreams.id, streamId));

    return { success: true };
  }

  /**
   * Get active live streams
   */
  static async getActiveStreams() {
    return await db
      .select({
        id: liveStreams.id,
        title: liveStreams.title,
        thumbnail: liveStreams.thumbnail,
        streamUrl: liveStreams.streamUrl,
        viewerCount: sql<number>`(
          SELECT COUNT(*) 
          FROM ${streamViewers} 
          WHERE ${streamViewers.streamId} = ${liveStreams.id} 
          AND ${streamViewers.leftAt} IS NULL
        )`,
        startedAt: liveStreams.startedAt,
        host: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
        },
      })
      .from(liveStreams)
      .innerJoin(users, eq(liveStreams.userId, users.id))
      .where(eq(liveStreams.status, 'live'))
      .orderBy(desc(liveStreams.startedAt));
  }

  /**
   * Get stream details
   */
  static async getStreamDetails(streamId: number) {
    const stream = await db.query.liveStreams.findFirst({
      where: eq(liveStreams.id, streamId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    if (!stream) {
      throw new NotFoundError('Stream not found');
    }

    const viewerCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(streamViewers)
      .where(
        and(
          eq(streamViewers.streamId, streamId),
          isNull(streamViewers.leftAt)
        )
      );

    return {
      ...stream,
      viewerCount: viewerCount[0]?.count || 0,
    };
  }

  /**
   * Join a stream (record viewer)
   */
  static async joinStream(streamId: number, viewerId: number) {
    const stream = await db.query.liveStreams.findFirst({
      where: eq(liveStreams.id, streamId),
    });

    if (!stream) {
      throw new NotFoundError('Stream not found');
    }

    if (stream.status !== 'live') {
      throw new ValidationError('Stream is not live');
    }

    // Check if already joined
    const existing = await db.query.streamViewers.findFirst({
      where: and(
        eq(streamViewers.streamId, streamId),
        eq(streamViewers.viewerId, viewerId),
        isNull(streamViewers.leftAt)
      ),
    });

    if (existing) {
      return existing; // Already joined
    }

    const [viewer] = await db.insert(streamViewers).values({
      streamId,
      viewerId,
    }).returning();

    // Update viewer count
    await this.updateViewerCount(streamId);

    return viewer;
  }

  /**
   * Leave a stream
   */
  static async leaveStream(streamId: number, viewerId: number) {
    await db
      .update(streamViewers)
      .set({ leftAt: new Date() })
      .where(
        and(
          eq(streamViewers.streamId, streamId),
          eq(streamViewers.viewerId, viewerId),
          isNull(streamViewers.leftAt)
        )
      );

    // Update viewer count
    await this.updateViewerCount(streamId);

    return { success: true };
  }

  /**
   * Get current viewers
   */
  static async getCurrentViewers(streamId: number) {
    return await db
      .select({
        id: streamViewers.id,
        joinedAt: streamViewers.joinedAt,
        viewer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
        },
      })
      .from(streamViewers)
      .innerJoin(users, eq(streamViewers.viewerId, users.id))
      .where(
        and(
          eq(streamViewers.streamId, streamId),
          isNull(streamViewers.leftAt)
        )
      )
      .orderBy(desc(streamViewers.joinedAt));
  }

  /**
   * Send a chat message
   */
  static async sendMessage(streamId: number, userId: number, message: string) {
    if (!message || message.length === 0) {
      throw new ValidationError('Message cannot be empty');
    }

    const [chatMessage] = await db.insert(liveStreamMessages).values({
      streamId,
      userId,
      message,
    }).returning();

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return {
      ...chatMessage,
      user: {
        id: user!.id,
        name: user!.name,
        username: user!.username,
        profileImage: user!.profileImage,
      },
    };
  }

  /**
   * Get chat messages
   */
  static async getMessages(streamId: number, limit = 50) {
    return await db
      .select({
        id: liveStreamMessages.id,
        message: liveStreamMessages.message,
        createdAt: liveStreamMessages.createdAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
        },
      })
      .from(liveStreamMessages)
      .innerJoin(users, eq(liveStreamMessages.userId, users.id))
      .where(eq(liveStreamMessages.streamId, streamId))
      .orderBy(desc(liveStreamMessages.createdAt))
      .limit(limit);
  }

  /**
   * Update viewer count (internal)
   */
  private static async updateViewerCount(streamId: number) {
    const count = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(streamViewers)
      .where(
        and(
          eq(streamViewers.streamId, streamId),
          isNull(streamViewers.leftAt)
        )
      );

    await db
      .update(liveStreams)
      .set({ viewerCount: count[0]?.count || 0 })
      .where(eq(liveStreams.id, streamId));
  }
}
