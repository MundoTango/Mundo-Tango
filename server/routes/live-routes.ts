/**
 * Live Streaming API Routes
 * 
 * Endpoints:
 * - POST /api/live/start - Start live stream
 * - POST /api/live/stop - Stop live stream
 * - GET /api/live/active - Get active streams
 * - GET /api/live/:id - Get stream details
 * - POST /api/live/:id/join - Join stream
 * - POST /api/live/:id/leave - Leave stream
 * - GET /api/live/:id/viewers - Get current viewers
 * - POST /api/live/:id/message - Send chat message
 * - GET /api/live/:id/messages - Get chat messages
 */

import { Router } from 'express';
import { LiveStreamService } from '../services/LiveStreamService';
import { authenticateToken } from '../middleware/auth';
import { handleErrors } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/live/start
 * Start a new live stream
 */
router.post('/start', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;
  const { title, thumbnail } = req.body;

  const stream = await LiveStreamService.startStream(userId, {
    title,
    thumbnail,
  });

  res.status(201).json(stream);
}));

/**
 * POST /api/live/stop
 * Stop an active stream
 */
router.post('/stop', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;
  const { streamId } = req.body;

  const result = await LiveStreamService.stopStream(streamId, userId);

  res.json(result);
}));

/**
 * GET /api/live/active
 * Get all active live streams
 */
router.get('/active', handleErrors(async (req, res) => {
  const streams = await LiveStreamService.getActiveStreams();

  res.json(streams);
}));

/**
 * GET /api/live/:id
 * Get stream details
 */
router.get('/:id', handleErrors(async (req, res) => {
  const streamId = parseInt(req.params.id);

  const stream = await LiveStreamService.getStreamDetails(streamId);

  res.json(stream);
}));

/**
 * POST /api/live/:id/join
 * Join a live stream
 */
router.post('/:id/join', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;
  const streamId = parseInt(req.params.id);

  const viewer = await LiveStreamService.joinStream(streamId, userId);

  res.json(viewer);
}));

/**
 * POST /api/live/:id/leave
 * Leave a live stream
 */
router.post('/:id/leave', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;
  const streamId = parseInt(req.params.id);

  const result = await LiveStreamService.leaveStream(streamId, userId);

  res.json(result);
}));

/**
 * GET /api/live/:id/viewers
 * Get current viewers
 */
router.get('/:id/viewers', handleErrors(async (req, res) => {
  const streamId = parseInt(req.params.id);

  const viewers = await LiveStreamService.getCurrentViewers(streamId);

  res.json(viewers);
}));

/**
 * POST /api/live/:id/message
 * Send a chat message
 */
router.post('/:id/message', authenticateToken, handleErrors(async (req, res) => {
  const userId = req.userId!;
  const streamId = parseInt(req.params.id);
  const { message } = req.body;

  const chatMessage = await LiveStreamService.sendMessage(streamId, userId, message);

  res.status(201).json(chatMessage);
}));

/**
 * GET /api/live/:id/messages
 * Get chat messages
 */
router.get('/:id/messages', handleErrors(async (req, res) => {
  const streamId = parseInt(req.params.id);
  const limit = parseInt(req.query.limit as string) || 50;

  const messages = await LiveStreamService.getMessages(streamId, limit);

  res.json(messages);
}));

export default router;
