import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Initialize OpenAI with API key from environment
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

/**
 * POST /api/openai-realtime/session
 * Creates an ephemeral token for WebRTC Realtime API connection
 * Requires authentication
 */
router.post('/session', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { model = 'gpt-4o-realtime-preview-2024-10-01' } = req.body;
    
    // Create ephemeral token (valid for 60 seconds)
    const response = await openai.beta.realtime.sessions.create({
      model,
      voice: 'alloy',
    });
    
    res.json({
      success: true,
      client_secret: response.client_secret.value,
      expires_at: response.client_secret.expires_at,
    });
  } catch (error: any) {
    console.error('❌ Realtime session error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create Realtime session',
    });
  }
});

export default router;
