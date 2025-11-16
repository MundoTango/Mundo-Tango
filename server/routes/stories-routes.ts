/**
 * Stories API Routes
 * 
 * Endpoints:
 * - POST /api/stories - Create story
 * - GET /api/stories/feed - Get friends' stories
 * - GET /api/stories/my - Get user's own stories
 * - POST /api/stories/:id/view - Record story view
 * - GET /api/stories/:id/viewers - Get story viewers
 * - DELETE /api/stories/:id - Delete story
 */

import { Router } from 'express';
import { StoriesService } from '../services/StoriesService';
import { authenticateToken } from '../middleware/auth';
import { handleErrors } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/stories
 * Create a new story
 */
router.post('/', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;
  const { content, imageUrl, videoUrl, mediaGallery } = req.body;

  const story = await StoriesService.createStory(userId, {
    content,
    imageUrl,
    videoUrl,
    mediaGallery,
  });

  res.status(201).json(story);
}));

/**
 * GET /api/stories/feed
 * Get friends' active stories
 */
router.get('/feed', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;

  const stories = await StoriesService.getStoriesFeed(userId);

  res.json(stories);
}));

/**
 * GET /api/stories/my
 * Get user's own stories
 */
router.get('/my', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;

  const stories = await StoriesService.getUserStories(userId);

  res.json(stories);
}));

/**
 * POST /api/stories/:id/view
 * Record a story view
 */
router.post('/:id/view', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;
  const storyId = parseInt(req.params.id);

  await StoriesService.recordView(storyId, userId);

  res.json({ success: true });
}));

/**
 * GET /api/stories/:id/viewers
 * Get story viewers (only for story owner)
 */
router.get('/:id/viewers', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;
  const storyId = parseInt(req.params.id);

  const viewers = await StoriesService.getStoryViewers(storyId, userId);

  res.json(viewers);
}));

/**
 * DELETE /api/stories/:id
 * Delete a story
 */
router.delete('/:id', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;
  const storyId = parseInt(req.params.id);

  const result = await StoriesService.deleteStory(storyId, userId);

  res.json(result);
}));

export default router;
