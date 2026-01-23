/**
 * Post Repository
 * Handles all post-related database operations
 * MB.MD God Command #6: NEVER change ID column types
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import {
  posts,
  postLikes,
  postComments,
  users,
  type SelectPost,
  type InsertPost,
  type SelectPostLike,
  type InsertPostLike,
  type SelectPostComment,
  type InsertPostComment,
} from '@db/schema';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { db as defaultDb } from '../core/connection';

export class PostRepository {
  constructor(private db: NeonHttpDatabase = defaultDb) {}

  // ==============================
  // Post CRUD Operations
  // ==============================

  async createPost(post: InsertPost): Promise<SelectPost> {
    const result = await this.db.insert(posts).values(post).returning();
    return result[0];
  }

  async getPostById(id: number): Promise<SelectPost | undefined> {
    const result = await this.db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        richContent: posts.richContent,
        plainText: posts.plainText,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        mediaUrls: posts.mediaUrls,
        visibility: posts.visibility,
        type: posts.type,
        pollOptions: posts.pollOptions,
        pollVotes: posts.pollVotes,
        pollEndsAt: posts.pollEndsAt,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        likeCount: sql<number>`(SELECT COUNT(*) FROM ${postLikes} WHERE ${postLikes.postId} = ${posts.id})`.as(
          'likeCount'
        ),
        commentCount: sql<number>`(SELECT COUNT(*) FROM ${postComments} WHERE ${postComments.postId} = ${posts.id})`.as(
          'commentCount'
        ),
      })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);
    return result[0] as any;
  }

  async getPosts(params: {
    userId?: number;
    limit?: number;
    offset?: number;
    currentUserId?: number;
    type?: string;
  }): Promise<SelectPost[]> {
    const conditions = [];
    if (params.userId) {
      conditions.push(eq(posts.userId, params.userId));
    }
    if (params.type) {
      conditions.push(eq(posts.type, params.type));
    }

    const query = this.db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        richContent: posts.richContent,
        plainText: posts.plainText,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        mediaUrls: posts.mediaUrls,
        visibility: posts.visibility,
        type: posts.type,
        pollOptions: posts.pollOptions,
        pollVotes: posts.pollVotes,
        pollEndsAt: posts.pollEndsAt,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          profilePicture: users.profilePicture,
        },
        likeCount: sql<number>`(SELECT COUNT(*) FROM ${postLikes} WHERE ${postLikes.postId} = ${posts.id})`.as(
          'likeCount'
        ),
        commentCount: sql<number>`(SELECT COUNT(*) FROM ${postComments} WHERE ${postComments.postId} = ${posts.id})`.as(
          'commentCount'
        ),
        hasLiked: params.currentUserId
          ? sql<boolean>`EXISTS(SELECT 1 FROM ${postLikes} WHERE ${postLikes.postId} = ${posts.id} AND ${postLikes.userId} = ${params.currentUserId})`.as(
              'hasLiked'
            )
          : sql<boolean>`false`.as('hasLiked'),
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(posts.createdAt))
      .limit(params.limit || 20)
      .offset(params.offset || 0);

    return (await query) as any[];
  }

  async updatePost(id: number, data: Partial<SelectPost>): Promise<SelectPost | undefined> {
    const result = await this.db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return result[0];
  }

  async deletePost(id: number): Promise<void> {
    await this.db.delete(posts).where(eq(posts.id, id));
  }

  // ==============================
  // Post Likes
  // ==============================

  async createPostLike(like: InsertPostLike): Promise<SelectPostLike | undefined> {
    try {
      const result = await this.db.insert(postLikes).values(like).returning();
      return result[0];
    } catch (error) {
      // Handle duplicate like
      return undefined;
    }
  }

  async deletePostLike(postId: number, userId: number): Promise<void> {
    await this.db
      .delete(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
  }

  async getPostLikes(postId: number): Promise<SelectPostLike[]> {
    return await this.db.select().from(postLikes).where(eq(postLikes.postId, postId));
  }

  // ==============================
  // Post Comments
  // ==============================

  async createPostComment(comment: InsertPostComment): Promise<SelectPostComment> {
    const result = await this.db.insert(postComments).values(comment).returning();
    return result[0];
  }

  async getPostComments(postId: number): Promise<any[]> {
    return await this.db
      .select({
        id: postComments.id,
        postId: postComments.postId,
        userId: postComments.userId,
        content: postComments.content,
        parentId: postComments.parentId,
        createdAt: postComments.createdAt,
        updatedAt: postComments.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          profilePicture: users.profilePicture,
        },
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);
  }

  async updatePostComment(id: number, content: string): Promise<SelectPostComment | undefined> {
    const result = await this.db
      .update(postComments)
      .set({ content, updatedAt: new Date() })
      .where(eq(postComments.id, id))
      .returning();
    return result[0];
  }

  async deletePostComment(id: number): Promise<void> {
    await this.db.delete(postComments).where(eq(postComments.id, id));
  }
}

// Export singleton instance
export const postRepository = new PostRepository();
