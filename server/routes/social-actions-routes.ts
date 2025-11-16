/**
 * Social Actions API Routes
 * Block users and save posts
 * 
 * Endpoints:
 * - POST /api/users/:id/block - Block a user
 * - DELETE /api/users/:id/block - Unblock a user
 * - GET /api/users/blocked - Get blocked users
 * - POST /api/posts/:id/save - Save a post
 * - DELETE /api/posts/:id/save - Unsave a post
 * - GET /api/posts/saved - Get saved posts
 */

import { Router } from 'express';
import { db } from '@db';
import { blockedUsers, savedPosts, posts, users } from '@db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import { handleErrors } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/users/:id/block
 * Block a user
 */
router.post('/users/:id/block', authenticateToken, handleErrors(async (req, res) => {
  const blockerId = req.userId!;
  const blockedId = parseInt(req.params.id);

  if (blockerId === blockedId) {
    return res.status(400).json({ error: 'Cannot block yourself' });
  }

  // Check if already blocked
  const existing = await db.query.blockedUsers.findFirst({
    where: and(
      eq(blockedUsers.blockerId, blockerId),
      eq(blockedUsers.blockedId, blockedId)
    ),
  });

  if (existing) {
    return res.status(400).json({ error: 'User already blocked' });
  }

  const [blocked] = await db.insert(blockedUsers).values({
    blockerId,
    blockedId,
  }).returning();

  res.status(201).json(blocked);
}));

/**
 * DELETE /api/users/:id/block
 * Unblock a user
 */
router.delete('/users/:id/block', authenticateToken, handleErrors(async (req, res) => {
  const blockerId = req.userId!;
  const blockedId = parseInt(req.params.id);

  await db.delete(blockedUsers).where(
    and(
      eq(blockedUsers.blockerId, blockerId),
      eq(blockedUsers.blockedId, blockedId)
    )
  );

  res.json({ success: true });
}));

/**
 * GET /api/users/blocked
 * Get list of blocked users
 */
router.get('/users/blocked', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;

  const blocked = await db
    .select({
      id: blockedUsers.id,
      blockedAt: blockedUsers.createdAt,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
      },
    })
    .from(blockedUsers)
    .innerJoin(users, eq(blockedUsers.blockedId, users.id))
    .where(eq(blockedUsers.blockerId, userId))
    .orderBy(desc(blockedUsers.createdAt));

  res.json(blocked);
}));

/**
 * POST /api/posts/:id/save
 * Save a post
 */
router.post('/posts/:id/save', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;
  const postId = parseInt(req.params.id);

  // Check if post exists
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // Check if already saved
  const existing = await db.query.savedPosts.findFirst({
    where: and(
      eq(savedPosts.userId, userId),
      eq(savedPosts.postId, postId)
    ),
  });

  if (existing) {
    return res.status(400).json({ error: 'Post already saved' });
  }

  const [saved] = await db.insert(savedPosts).values({
    userId,
    postId,
  }).returning();

  res.status(201).json(saved);
}));

/**
 * DELETE /api/posts/:id/save
 * Unsave a post
 */
router.delete('/posts/:id/save', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;
  const postId = parseInt(req.params.id);

  await db.delete(savedPosts).where(
    and(
      eq(savedPosts.userId, userId),
      eq(savedPosts.postId, postId)
    )
  );

  res.json({ success: true });
}));

/**
 * GET /api/posts/saved
 * Get saved posts
 */
router.get('/posts/saved', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;

  const saved = await db
    .select({
      id: savedPosts.id,
      savedAt: savedPosts.createdAt,
      post: {
        id: posts.id,
        content: posts.content,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        mediaGallery: posts.mediaGallery,
        likes: posts.likes,
        comments: posts.comments,
        shares: posts.shares,
        createdAt: posts.createdAt,
        author: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
        },
      },
    })
    .from(savedPosts)
    .innerJoin(posts, eq(savedPosts.postId, posts.id))
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(savedPosts.userId, userId))
    .orderBy(desc(savedPosts.createdAt));

  res.json(saved);
}));

export default router;
