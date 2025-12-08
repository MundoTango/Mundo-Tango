import { Router, Request, Response } from 'express';
import { mrBlueService } from '../services/mr-blue-service';
import logger from "../middleware/logger";

const router = Router();

/**
 * POST /api/mr-blue/chat
 * Chat with Mr Blue
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, includeVideo, includeVoice } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await mrBlueService.chat(message, {
      includeVideo,
      includeVoice,
    });

    res.json({
      success: true,
      ...response,
    });
  } catch (error: any) {
    console.error('Mr Blue chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat',
      details: error.message,
    });
  }
});

/**
 * POST /api/mr-blue/generate-avatar
 * Generate a video avatar for Mr Blue
 */
router.post('/generate-avatar', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await mrBlueService.generateAvatar(prompt);

    res.json({
      success: true,
      ...result,
      message: 'Avatar generation started',
    });
  } catch (error: any) {
    console.error('Avatar generation error:', error);
    res.status(500).json({
      error: 'Failed to generate avatar',
      details: error.message,
    });
  }
});

/**
 * GET /api/mr-blue/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Mr Blue AI Assistant',
    features: {
      chat: true,
      voice: !!process.env.ELEVENLABS_API_KEY,
      video: !!process.env.LUMA_API_KEY,
    },
  });
});

export default router;
