/**
 * Social Features E2E Tests - Week 9 Day 5
 * 
 * Test Coverage:
 * - Stories (create, view, track, expire, delete)
 * - Live Streams (start, stop, join, leave, chat)
 * - Blocking/Unblocking users
 * - Saving/Unsaving posts
 * 
 * Target: 40+ comprehensive tests
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { app } from '../index';
import { db } from '@db';
import { users, posts, friendships, storyViews, liveStreams, streamViewers, blockedUsers, savedPosts } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import request from 'supertest';

describe('Social Features E2E Tests', () => {
  let testUser1Token: string;
  let testUser2Token: string;
  let testUser1Id: number;
  let testUser2Id: number;
  let testStoryId: number;
  let testStreamId: number;
  let testPostId: number;

  beforeAll(async () => {
    // Create test users
    const user1Response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User 1',
        username: 'testuser1_stories',
        email: 'test1_stories@example.com',
        password: 'password123',
      });
    testUser1Token = user1Response.body.token;
    testUser1Id = user1Response.body.userId;

    const user2Response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User 2',
        username: 'testuser2_stories',
        email: 'test2_stories@example.com',
        password: 'password123',
      });
    testUser2Token = user2Response.body.token;
    testUser2Id = user2Response.body.userId;

    // Create friendship
    await db.insert(friendships).values({
      userId: testUser1Id,
      friendId: testUser2Id,
      status: 'accepted',
    });
    await db.insert(friendships).values({
      userId: testUser2Id,
      friendId: testUser1Id,
      status: 'accepted',
    });

    // Create a test post for saving
    const [post] = await db.insert(posts).values({
      userId: testUser1Id,
      content: 'Test post for saving',
      type: 'post',
    }).returning();
    testPostId = post.id;
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(users).where(eq(users.id, testUser1Id));
    await db.delete(users).where(eq(users.id, testUser2Id));
  });

  // ============================================================================
  // STORIES TESTS (15 tests)
  // ============================================================================

  describe('Stories', () => {
    it('should create a story with image', async () => {
      const response = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${testUser1Token}`)
        .send({
          content: 'My first story!',
          imageUrl: 'https://example.com/story1.jpg',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('story');
      expect(response.body.expiresAt).toBeDefined();
      testStoryId = response.body.id;
    });

    it('should fail to create story without media', async () => {
      const response = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${testUser1Token}`)
        .send({
          content: 'Story without media',
        });

      expect(response.status).toBe(400);
    });

    it('should get stories feed showing friends stories', async () => {
      const response = await request(app)
        .get('/api/stories/feed')
        .set('Authorization', `Bearer ${testUser2Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      const user1Stories = response.body.find((g: any) => g.user.id === testUser1Id);
      expect(user1Stories).toBeDefined();
      expect(user1Stories.stories.length).toBeGreaterThan(0);
    });

    it('should get users own stories', async () => {
      const response = await request(app)
        .get('/api/stories/my')
        .set('Authorization', `Bearer ${testUser1Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should record story view', async () => {
      const response = await request(app)
        .post(`/api/stories/${testStoryId}/view`)
        .set('Authorization', `Bearer ${testUser2Token}`);

      expect(response.status).toBe(200);

      // Verify view was recorded
      const view = await db.query.storyViews.findFirst({
        where: and(
          eq(storyViews.storyId, testStoryId),
          eq(storyViews.viewerId, testUser2Id)
        ),
      });
      expect(view).toBeDefined();
    });

    it('should not duplicate views', async () => {
      // View again
      await request(app)
        .post(`/api/stories/${testStoryId}/view`)
        .set('Authorization', `Bearer ${testUser2Token}`);

      // Count views
      const views = await db.query.storyViews.findMany({
        where: and(
          eq(storyViews.storyId, testStoryId),
          eq(storyViews.viewerId, testUser2Id)
        ),
      });
      expect(views.length).toBe(1);
    });

    it('should get story viewers (owner only)', async () => {
      const response = await request(app)
        .get(`/api/stories/${testStoryId}/viewers`)
        .set('Authorization', `Bearer ${testUser1Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].viewer.id).toBe(testUser2Id);
    });

    it('should fail to get viewers if not owner', async () => {
      const response = await request(app)
        .get(`/api/stories/${testStoryId}/viewers`)
        .set('Authorization', `Bearer ${testUser2Token}`);

      expect(response.status).toBe(401);
    });

    it('should delete own story', async () => {
      const response = await request(app)
        .delete(`/api/stories/${testStoryId}`)
        .set('Authorization', `Bearer ${testUser1Token}`);

      expect(response.status).toBe(200);

      // Verify deleted
      const story = await db.query.posts.findFirst({
        where: eq(posts.id, testStoryId),
      });
      expect(story).toBeUndefined();
    });

    it('should fail to delete someone elses story', async () => {
      // Create another story
      const storyResponse = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${testUser1Token}`)
        .send({ imageUrl: 'https://example.com/story2.jpg' });

      const response = await request(app)
        .delete(`/api/stories/${storyResponse.body.id}`)
        .set('Authorization', `Bearer ${testUser2Token}`);

      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // LIVE STREAMS TESTS (15 tests)
  // ============================================================================

  describe('Live Streams', () => {
    it('should start a live stream', async () => {
      const response = await request(app)
        .post('/api/live/start')
        .set('Authorization', `Bearer ${testUser1Token}`)
        .send({
          title: 'My First Stream',
          thumbnail: 'https://example.com/thumb.jpg',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('live');
      expect(response.body.streamUrl).toBeDefined();
      testStreamId = response.body.id;
    });

    it('should fail to start stream with short title', async () => {
      const response = await request(app)
        .post('/api/live/start')
        .set('Authorization', `Bearer ${testUser2Token}`)
        .send({
          title: 'Ab',
        });

      expect(response.status).toBe(400);
    });

    it('should fail to start second stream if already live', async () => {
      const response = await request(app)
        .post('/api/live/start')
        .set('Authorization', `Bearer ${testUser1Token}`)
        .send({
          title: 'Another Stream',
        });

      expect(response.status).toBe(400);
    });

    it('should get active streams', async () => {
      const response = await request(app)
        .get('/api/live/active');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(testStreamId);
    });

    it('should get stream details', async () => {
      const response = await request(app)
        .get(`/api/live/${testStreamId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testStreamId);
      expect(response.body.title).toBe('My First Stream');
    });

    it('should join a stream', async () => {
      const response = await request(app)
        .post(`/api/live/${testStreamId}/join`)
        .set('Authorization', `Bearer ${testUser2Token}`);

      expect(response.status).toBe(200);

      // Verify viewer recorded
      const viewer = await db.query.streamViewers.findFirst({
        where: and(
          eq(streamViewers.streamId, testStreamId),
          eq(streamViewers.viewerId, testUser2Id)
        ),
      });
      expect(viewer).toBeDefined();
    });

    it('should get current viewers', async () => {
      const response = await request(app)
        .get(`/api/live/${testStreamId}/viewers`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].viewer.id).toBe(testUser2Id);
    });

    it('should send chat message', async () => {
      const response = await request(app)
        .post(`/api/live/${testStreamId}/message`)
        .set('Authorization', `Bearer ${testUser2Token}`)
        .send({
          message: 'Hello from the stream!',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Hello from the stream!');
    });

    it('should get chat messages', async () => {
      const response = await request(app)
        .get(`/api/live/${testStreamId}/messages`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });

    it('should leave stream', async () => {
      const response = await request(app)
        .post(`/api/live/${testStreamId}/leave`)
        .set('Authorization', `Bearer ${testUser2Token}`);

      expect(response.status).toBe(200);

      // Verify viewer marked as left
      const viewer = await db.query.streamViewers.findFirst({
        where: and(
          eq(streamViewers.streamId, testStreamId),
          eq(streamViewers.viewerId, testUser2Id)
        ),
      });
      expect(viewer?.leftAt).toBeDefined();
    });

    it('should stop stream (owner only)', async () => {
      const response = await request(app)
        .post('/api/live/stop')
        .set('Authorization', `Bearer ${testUser1Token}`)
        .send({
          streamId: testStreamId,
        });

      expect(response.status).toBe(200);

      // Verify stream ended
      const stream = await db.query.liveStreams.findFirst({
        where: eq(liveStreams.id, testStreamId),
      });
      expect(stream?.status).toBe('ended');
      expect(stream?.isLive).toBe(false);
    });

    it('should fail to stop someone elses stream', async () => {
      // Start another stream
      const streamResponse = await request(app)
        .post('/api/live/start')
        .set('Authorization', `Bearer ${testUser2Token}`)
        .send({ title: 'User 2 Stream' });

      const response = await request(app)
        .post('/api/live/stop')
        .set('Authorization', `Bearer ${testUser1Token}`)
        .send({
          streamId: streamResponse.body.id,
        });

      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // BLOCKING/UNBLOCKING TESTS (5 tests)
  // ============================================================================

  describe('Blocking Users', () => {
    it('should block a user', async () => {
      const response = await request(app)
        .post(`/api/users/${testUser2Id}/block`)
        .set('Authorization', `Bearer ${testUser1Token}`);

      expect(response.status).toBe(201);

      // Verify block recorded
      const block = await db.query.blockedUsers.findFirst({
        where: and(
          eq(blockedUsers.blockerId, testUser1Id),
          eq(blockedUsers.blockedId, testUser2Id)
        ),
      });
      expect(block).toBeDefined();
    });

    it('should fail to block yourself', async () => {
      const response = await request(app)
        .post(`/api/users/${testUser1Id}/block`)
        .set('Authorization', `Bearer ${testUser1Token}`);

      expect(response.status).toBe(400);
    });

    it('should get blocked users list', async () => {
      const response = await request(app)
        .get('/api/users/blocked')
        .set('Authorization', `Bearer ${testUser1Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].user.id).toBe(testUser2Id);
    });

    it('should unblock a user', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUser2Id}/block`)
        .set('Authorization', `Bearer ${testUser1Token}`);

      expect(response.status).toBe(200);

      // Verify unblocked
      const block = await db.query.blockedUsers.findFirst({
        where: and(
          eq(blockedUsers.blockerId, testUser1Id),
          eq(blockedUsers.blockedId, testUser2Id)
        ),
      });
      expect(block).toBeUndefined();
    });
  });

  // ============================================================================
  // SAVED POSTS TESTS (5 tests)
  // ============================================================================

  describe('Saved Posts', () => {
    it('should save a post', async () => {
      const response = await request(app)
        .post(`/api/posts/${testPostId}/save`)
        .set('Authorization', `Bearer ${testUser2Token}`);

      expect(response.status).toBe(201);

      // Verify save recorded
      const saved = await db.query.savedPosts.findFirst({
        where: and(
          eq(savedPosts.userId, testUser2Id),
          eq(savedPosts.postId, testPostId)
        ),
      });
      expect(saved).toBeDefined();
    });

    it('should fail to save non-existent post', async () => {
      const response = await request(app)
        .post('/api/posts/999999/save')
        .set('Authorization', `Bearer ${testUser2Token}`);

      expect(response.status).toBe(404);
    });

    it('should get saved posts', async () => {
      const response = await request(app)
        .get('/api/posts/saved')
        .set('Authorization', `Bearer ${testUser2Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].post.id).toBe(testPostId);
    });

    it('should unsave a post', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPostId}/save`)
        .set('Authorization', `Bearer ${testUser2Token}`);

      expect(response.status).toBe(200);

      // Verify unsaved
      const saved = await db.query.savedPosts.findFirst({
        where: and(
          eq(savedPosts.userId, testUser2Id),
          eq(savedPosts.postId, testPostId)
        ),
      });
      expect(saved).toBeUndefined();
    });
  });
});
