import { Router, type Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { didVideoService } from '../services/premium/didVideoService';
import { elevenlabsVoiceService } from '../services/premium/elevenlabsVoiceService';
import { openaiRealtimeService } from '../services/premium/openaiRealtimeService';
import { costOptimizerService } from '../services/premium/costOptimizerService';

const router = Router();

/**
 * Middleware to check God Level access
 */
async function requireGodLevel(req: Request, res: Response, next: Function) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const hasAccess = await costOptimizerService.checkGodLevelAccess(userId);

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'God Level subscription required for premium features'
    });
  }

  next();
}

/**
 * Middleware to check usage quotas
 */
async function checkQuota(req: Request, res: Response, next: Function) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const quotaCheck = await costOptimizerService.checkQuota(userId);

  if (!quotaCheck.allowed) {
    return res.status(402).json({
      success: false,
      message: 'Monthly quota exceeded',
      usage: quotaCheck.usage,
      limits: quotaCheck.limits
    });
  }

  // Attach quota info to request for logging
  (req as any).quotaInfo = quotaCheck;
  next();
}

// =============================================================================
// VIDEO ENDPOINTS (D-ID)
// =============================================================================

/**
 * POST /api/premium/video/create
 * Create a D-ID talking avatar video
 */
router.post(
  '/video/create',
  authenticateToken,
  requireGodLevel,
  checkQuota,
  async (req: Request, res: Response) => {
    try {
      const { scriptText, avatarImageUrl } = req.body;
      const userId = req.user!.id;

      if (!scriptText) {
        return res.status(400).json({
          success: false,
          message: 'scriptText is required'
        });
      }

      // Default avatar image if not provided
      const imageUrl = avatarImageUrl || 'https://create-images-results.d-id.com/default_presenter.jpg';

      const result = await didVideoService.createTalkingAvatar(
        scriptText,
        imageUrl,
        userId
      );

      res.json({
        success: true,
        videoId: result.videoId,
        videoUrl: result.videoUrl,
        message: 'Video creation started. Check status using the videoId.'
      });
    } catch (error: any) {
      console.error('[Premium Video] Creation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create video'
      });
    }
  }
);

/**
 * GET /api/premium/video/:id/status
 * Check video generation status
 */
router.get(
  '/video/:id/status',
  authenticateToken,
  requireGodLevel,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const status = await didVideoService.getVideoStatus(id);

      res.json({
        success: true,
        ...status
      });
    } catch (error: any) {
      console.error('[Premium Video] Status check error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check video status'
      });
    }
  }
);

/**
 * DELETE /api/premium/video/:id
 * Delete a video (cleanup)
 */
router.delete(
  '/video/:id',
  authenticateToken,
  requireGodLevel,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await didVideoService.deleteVideo(id);

      res.json({
        success: true,
        message: 'Video deleted successfully'
      });
    } catch (error: any) {
      console.error('[Premium Video] Delete error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete video'
      });
    }
  }
);

// =============================================================================
// VOICE ENDPOINTS (ElevenLabs)
// =============================================================================

/**
 * POST /api/premium/voice/tts
 * Text-to-speech (auto-selects best service based on text length)
 */
router.post(
  '/voice/tts',
  authenticateToken,
  requireGodLevel,
  checkQuota,
  async (req: Request, res: Response) => {
    try {
      const { text, voiceId } = req.body;
      const userId = req.user!.id;

      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'text is required'
        });
      }

      // Auto-select optimal service
      const optimalService = costOptimizerService.selectOptimalService(
        'voice',
        undefined,
        text.length
      );

      console.log(`[Premium Voice] Using service: ${optimalService} for ${text.length} characters`);

      const result = await elevenlabsVoiceService.textToSpeech(
        text,
        voiceId,
        userId
      );

      res.json({
        success: true,
        audioUrl: result.audioUrl,
        characterCount: result.characterCount,
        service: optimalService
      });
    } catch (error: any) {
      console.error('[Premium Voice] TTS error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate speech'
      });
    }
  }
);

/**
 * GET /api/premium/voice/voices
 * Get available voices
 */
router.get(
  '/voice/voices',
  authenticateToken,
  requireGodLevel,
  async (req: Request, res: Response) => {
    try {
      const voices = await elevenlabsVoiceService.getAvailableVoices();

      res.json({
        success: true,
        voices
      });
    } catch (error: any) {
      console.error('[Premium Voice] Fetch voices error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch voices'
      });
    }
  }
);

/**
 * POST /api/premium/voice/clone
 * Clone a voice from audio samples
 */
router.post(
  '/voice/clone',
  authenticateToken,
  requireGodLevel,
  async (req: Request, res: Response) => {
    try {
      const { audioSamples, name } = req.body;
      const userId = req.user!.id;

      if (!audioSamples || !Array.isArray(audioSamples)) {
        return res.status(400).json({
          success: false,
          message: 'audioSamples array is required'
        });
      }

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'name is required'
        });
      }

      const result = await elevenlabsVoiceService.cloneVoice(
        audioSamples,
        name,
        userId
      );

      res.json({
        success: true,
        voiceId: result.voiceId,
        message: 'Voice cloned successfully'
      });
    } catch (error: any) {
      console.error('[Premium Voice] Clone error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to clone voice'
      });
    }
  }
);

// =============================================================================
// USAGE & COST TRACKING ENDPOINTS
// =============================================================================

/**
 * GET /api/premium/usage/stats
 * Get user's premium usage statistics and cost tracking
 */
router.get(
  '/usage/stats',
  authenticateToken,
  requireGodLevel,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const now = new Date();
      
      // Get monthly spend from cost tracker
      const monthlySpend = await costOptimizerService.getMonthlySpend(userId);
      const history = await costOptimizerService.getUserSpendHistory(userId, 3);
      const prediction = await costOptimizerService.predictMonthlyBill(userId);
      
      // God Level quota is $100/month
      const quotaLimit = 100;
      const quotaRemaining = Math.max(0, quotaLimit - monthlySpend);
      
      // Break down by service
      const currentMonth = history.filter(h => {
        const [year, month] = h.month.split('-');
        return year === String(now.getFullYear()) && month === String(now.getMonth() + 1).padStart(2, '0');
      });
      
      const serviceBreakdown = {
        did: currentMonth.find(h => h.service === 'did')?.totalCost || 0,
        elevenlabs: currentMonth.find(h => h.service === 'elevenlabs')?.totalCost || 0,
        openaiRealtime: currentMonth.find(h => h.service === 'openai-realtime')?.totalCost || 0,
      };
      
      res.json({
        currentMonth: {
          total: monthlySpend,
          ...serviceBreakdown
        },
        quotaLimit,
        quotaRemaining,
        prediction,
        history
      });
    } catch (error: any) {
      console.error('[Premium Usage] Stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch usage stats'
      });
    }
  }
);

// =============================================================================
// REALTIME VOICE ENDPOINTS (OpenAI Realtime)
// =============================================================================

/**
 * POST /api/premium/realtime/start
 * Start a real-time voice session
 */
router.post(
  '/realtime/start',
  authenticateToken,
  requireGodLevel,
  checkQuota,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const session = await openaiRealtimeService.startRealtimeSession(userId);

      res.json({
        success: true,
        sessionId: session.sessionId,
        wsUrl: session.wsUrl,
        message: 'Realtime session started'
      });
    } catch (error: any) {
      console.error('[Premium Realtime] Start error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to start realtime session'
      });
    }
  }
);

/**
 * POST /api/premium/realtime/end
 * End a real-time voice session
 */
router.post(
  '/realtime/end',
  authenticateToken,
  requireGodLevel,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'sessionId is required'
        });
      }

      await openaiRealtimeService.endRealtimeSession(sessionId);

      res.json({
        success: true,
        message: 'Realtime session ended'
      });
    } catch (error: any) {
      console.error('[Premium Realtime] End error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to end realtime session'
      });
    }
  }
);

/**
 * POST /api/premium/realtime/audio
 * Send audio chunk to active session
 */
router.post(
  '/realtime/audio',
  authenticateToken,
  requireGodLevel,
  async (req: Request, res: Response) => {
    try {
      const { sessionId, audioData } = req.body;

      if (!sessionId || !audioData) {
        return res.status(400).json({
          success: false,
          message: 'sessionId and audioData are required'
        });
      }

      const audioBuffer = Buffer.from(audioData, 'base64');
      await openaiRealtimeService.sendAudioChunk(sessionId, audioBuffer);

      res.json({
        success: true,
        message: 'Audio chunk sent'
      });
    } catch (error: any) {
      console.error('[Premium Realtime] Audio send error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send audio'
      });
    }
  }
);

// =============================================================================
// COST & USAGE ENDPOINTS
// =============================================================================

/**
 * POST /api/premium/cost/estimate
 * Estimate cost for planned usage
 */
router.post(
  '/cost/estimate',
  authenticateToken,
  requireGodLevel,
  async (req: Request, res: Response) => {
    try {
      const { service, usage } = req.body;

      if (!service || !usage) {
        return res.status(400).json({
          success: false,
          message: 'service and usage parameters are required'
        });
      }

      const estimate = await costOptimizerService.estimateCost(service, usage);

      res.json({
        success: true,
        ...estimate
      });
    } catch (error: any) {
      console.error('[Premium Cost] Estimate error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to estimate cost'
      });
    }
  }
);

/**
 * GET /api/premium/cost/history/:userId
 * Get usage history for a user
 */
router.get(
  '/cost/history/:userId',
  authenticateToken,
  requireGodLevel,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { months } = req.query;

      // Only allow users to see their own history (or admins)
      if (parseInt(userId) !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const monthsToFetch = months ? parseInt(months as string) : 3;
      const history = await costOptimizerService.getUsageHistory(
        parseInt(userId),
        monthsToFetch
      );

      res.json({
        success: true,
        history
      });
    } catch (error: any) {
      console.error('[Premium Cost] History error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch usage history'
      });
    }
  }
);

/**
 * GET /api/premium/quota
 * Get current quota status
 */
router.get(
  '/quota',
  authenticateToken,
  requireGodLevel,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const quotaCheck = await costOptimizerService.checkQuota(userId);

      res.json({
        success: true,
        ...quotaCheck
      });
    } catch (error: any) {
      console.error('[Premium Quota] Check error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check quota'
      });
    }
  }
);

export default router;
