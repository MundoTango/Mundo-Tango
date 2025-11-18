/**
 * Mr Blue Voice Cloning Routes
 * API endpoints for voice cloning, training, and TTS generation
 */

import { Router, type Request, type Response } from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { voiceCloningService, SUPPORTED_LANGUAGES } from '../services/mrBlue/VoiceCloningService';
import { voiceTrainer } from '../services/mrBlue/VoiceTrainer';
import { elevenLabsService } from '../services/elevenLabsService';
import { z } from 'zod';

const router = Router();

// Validation schemas
const trainVoiceSchema = z.object({
  voiceName: z.string().min(1).max(100),
  audioUrls: z.array(z.string().url()).min(1).max(25),
  description: z.string().optional(),
});

const generateSpeechSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().optional(),
  language: z.string().optional(),
  modelId: z.enum(['eleven_multilingual_v2', 'eleven_monolingual_v1', 'eleven_turbo_v2']).optional(),
  voiceSettings: z.object({
    stability: z.number().min(0).max(1).optional(),
    similarityBoost: z.number().min(0).max(1).optional(),
    style: z.number().min(0).max(1).optional(),
    useSpeakerBoost: z.boolean().optional(),
  }).optional(),
});

const cloneVoiceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  audioFiles: z.array(z.string()).min(1).max(25),
  language: z.string().optional(),
});

const previewVoiceSchema = z.object({
  voiceId: z.string().min(1),
  text: z.string().min(1).max(1000),
  language: z.string().optional(),
});

/**
 * POST /api/mrblue/voice/train
 * Start voice training from audio URLs
 */
router.post('/train', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validation = trainVoiceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validation.error.errors 
      });
    }

    const { voiceName, audioUrls, description } = validation.data;

    console.log(`[VoiceAPI] Starting training for user ${userId}: ${voiceName}`);
    console.log(`[VoiceAPI] Audio URLs: ${audioUrls.length}`);

    // Start training session
    const session = await voiceTrainer.startTraining(
      userId,
      voiceName,
      audioUrls,
      description
    );

    res.json({
      success: true,
      message: 'Voice training started',
      session: {
        id: session.id,
        status: session.status,
        progress: session.progress,
        currentStep: session.currentStep,
      },
    });
  } catch (error: any) {
    console.error('[VoiceAPI] Training error:', error);
    res.status(500).json({ 
      message: 'Failed to start voice training',
      error: error.message 
    });
  }
});

/**
 * GET /api/mrblue/voice/status/:sessionId
 * Get training session status and progress
 */
router.get('/status/:sessionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { sessionId } = req.params;

    const session = voiceTrainer.getSessionStatus(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Training session not found' });
    }

    // Verify session belongs to user
    if (session.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const progressSummary = voiceTrainer.getProgressSummary(sessionId);

    res.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        progress: session.progress,
        currentStep: session.currentStep,
        voiceId: session.voiceId,
        error: session.error,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        completedAt: session.completedAt,
      },
      progressSummary,
    });
  } catch (error: any) {
    console.error('[VoiceAPI] Status error:', error);
    res.status(500).json({ 
      message: 'Failed to get training status',
      error: error.message 
    });
  }
});

/**
 * GET /api/mrblue/voice/status
 * Get all training sessions for current user
 */
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const sessions = voiceTrainer.getUserSessions(userId);

    res.json({
      success: true,
      sessions: sessions.map(session => ({
        id: session.id,
        voiceName: session.voiceName,
        status: session.status,
        progress: session.progress,
        voiceId: session.voiceId,
        createdAt: session.createdAt,
        completedAt: session.completedAt,
      })),
    });
  } catch (error: any) {
    console.error('[VoiceAPI] Status list error:', error);
    res.status(500).json({ 
      message: 'Failed to get training sessions',
      error: error.message 
    });
  }
});

/**
 * POST /api/mrblue/voice/generate
 * Generate speech from text using cloned voice
 */
router.post('/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validation = generateSpeechSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validation.error.errors 
      });
    }

    const { text, voiceId, language, modelId, voiceSettings } = validation.data;

    // Get user's custom voice if no voice ID provided
    let actualVoiceId = voiceId;
    if (!actualVoiceId) {
      actualVoiceId = await voiceCloningService.getUserVoiceId(userId);
      if (!actualVoiceId) {
        return res.status(400).json({ 
          message: 'No voice ID provided and user has no custom voice. Please clone your voice first or provide a voice ID.' 
        });
      }
    }

    console.log(`[VoiceAPI] Generating speech for user ${userId}, voice: ${actualVoiceId}`);

    // Generate speech
    const result = await voiceCloningService.generateSpeech(
      actualVoiceId,
      text,
      {
        model_id: modelId,
        language: language as any,
        voice_settings: voiceSettings ? {
          stability: voiceSettings.stability,
          similarity_boost: voiceSettings.similarityBoost,
          style: voiceSettings.style,
          use_speaker_boost: voiceSettings.useSpeakerBoost,
        } : undefined,
      }
    );

    if (!result.success || !result.audio) {
      throw new Error('Speech generation failed');
    }

    // Convert to base64 for easy transmission
    const audioBase64 = result.audio.toString('base64');

    res.json({
      success: true,
      audio: `data:audio/mpeg;base64,${audioBase64}`,
      characterCount: text.length,
    });
  } catch (error: any) {
    console.error('[VoiceAPI] Generate error:', error);
    res.status(500).json({ 
      message: 'Failed to generate speech',
      error: error.message 
    });
  }
});

/**
 * POST /api/mrblue/voice/generate-stream
 * Generate speech with streaming for real-time playback
 */
router.post('/generate-stream', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const validation = generateSpeechSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validation.error.errors 
      });
    }

    const { text, voiceId, language, modelId, voiceSettings } = validation.data;

    // Get user's custom voice if no voice ID provided
    let actualVoiceId = voiceId;
    if (!actualVoiceId) {
      actualVoiceId = await voiceCloningService.getUserVoiceId(userId);
      if (!actualVoiceId) {
        return res.status(400).json({ 
          message: 'No voice ID provided and user has no custom voice' 
        });
      }
    }

    console.log(`[VoiceAPI] Streaming speech for user ${userId}, voice: ${actualVoiceId}`);

    // Generate streaming speech
    const result = await voiceCloningService.generateSpeechStream(
      actualVoiceId,
      text,
      {
        model_id: modelId,
        language: language as any,
        voice_settings: voiceSettings ? {
          stability: voiceSettings.stability,
          similarity_boost: voiceSettings.similarityBoost,
          style: voiceSettings.style,
          use_speaker_boost: voiceSettings.useSpeakerBoost,
        } : undefined,
      }
    );

    if (!result.success || !result.stream) {
      throw new Error('Speech streaming failed');
    }

    // Set headers for streaming audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Pipe the stream to response
    const reader = result.stream.getReader();
    
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
        res.end();
      } catch (error) {
        console.error('[VoiceAPI] Streaming error:', error);
        res.end();
      }
    };

    await pump();
  } catch (error: any) {
    console.error('[VoiceAPI] Generate stream error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Failed to generate streaming speech',
        error: error.message 
      });
    }
  }
});

/**
 * GET /api/mrblue/voice/samples
 * List available voice samples (user's custom + ElevenLabs library)
 */
router.get('/samples', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log(`[VoiceAPI] Listing voices for user ${userId}`);

    // Get all available voices
    const result = await voiceCloningService.listVoices();

    if (!result.success) {
      throw new Error('Failed to list voices');
    }

    // Get user's custom voice ID
    const userVoiceId = await voiceCloningService.getUserVoiceId(userId);

    // Separate custom and premade voices
    const customVoices = result.voices?.filter(v => 
      v.category === 'cloned' || v.labels?.user_id === userId.toString()
    ) || [];

    const premadeVoices = result.voices?.filter(v => 
      v.category === 'premade' || v.category === 'professional'
    ) || [];

    res.json({
      success: true,
      userVoiceId,
      voices: {
        custom: customVoices,
        premade: premadeVoices,
      },
      total: result.voices?.length || 0,
    });
  } catch (error: any) {
    console.error('[VoiceAPI] List samples error:', error);
    res.status(500).json({ 
      message: 'Failed to list voice samples',
      error: error.message 
    });
  }
});

/**
 * GET /api/mrblue/voice/languages
 * Get list of supported languages
 */
router.get('/languages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      languages: SUPPORTED_LANGUAGES,
    });
  } catch (error: any) {
    console.error('[VoiceAPI] Languages error:', error);
    res.status(500).json({ 
      message: 'Failed to get supported languages',
      error: error.message 
    });
  }
});

/**
 * DELETE /api/mrblue/voice/:voiceId
 * Delete a voice model
 */
router.delete('/:voiceId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { voiceId } = req.params;

    // Get voice details to verify ownership
    const voiceResult = await voiceCloningService.getVoice(voiceId);
    if (!voiceResult.success || !voiceResult.voice) {
      return res.status(404).json({ message: 'Voice not found' });
    }

    // Verify user owns this voice
    if (voiceResult.voice.labels?.user_id !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log(`[VoiceAPI] Deleting voice ${voiceId} for user ${userId}`);

    // Delete the voice
    const deleteResult = await voiceCloningService.deleteVoice(voiceId);
    if (!deleteResult.success) {
      throw new Error('Failed to delete voice');
    }

    res.json({
      success: true,
      message: 'Voice deleted successfully',
    });
  } catch (error: any) {
    console.error('[VoiceAPI] Delete voice error:', error);
    res.status(500).json({ 
      message: 'Failed to delete voice',
      error: error.message 
    });
  }
});

/**
 * DELETE /api/mrblue/voice/cancel/:sessionId
 * Cancel a training session
 */
router.delete('/cancel/:sessionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { sessionId } = req.params;

    const session = voiceTrainer.getSessionStatus(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Training session not found' });
    }

    // Verify session belongs to user
    if (session.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const cancelled = voiceTrainer.cancelSession(sessionId);
    if (!cancelled) {
      return res.status(400).json({ 
        message: 'Cannot cancel session - it may already be completed or failed' 
      });
    }

    res.json({
      success: true,
      message: 'Training session cancelled',
    });
  } catch (error: any) {
    console.error('[VoiceAPI] Cancel session error:', error);
    res.status(500).json({ 
      message: 'Failed to cancel training session',
      error: error.message 
    });
  }
});

/**
 * POST /api/mrblue/voice/clone
 * Create voice clone from audio files (required endpoint alias)
 */
router.post('/clone', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validation = cloneVoiceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validation.error.errors 
      });
    }

    const { name, description, audioFiles, language } = validation.data;

    console.log(`[VoiceAPI] Creating voice clone for user ${userId}: ${name}`);

    // Create voice clone using ElevenLabs service
    const result = await elevenLabsService.cloneVoice(userId, {
      name,
      description,
      audioFiles,
      language,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to create voice clone',
      });
    }

    res.json({
      success: true,
      message: 'Voice clone created successfully',
      voiceId: result.voiceId,
      voiceCloneId: result.voiceCloneId,
    });
  } catch (error: any) {
    console.error('[VoiceAPI] Clone voice error:', error);
    res.status(500).json({ 
      message: 'Failed to create voice clone',
      error: error.message 
    });
  }
});

/**
 * GET /api/mrblue/voice/clones
 * List all voice clones for the current user
 */
router.get('/clones', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log(`[VoiceAPI] Listing voice clones for user ${userId}`);

    const result = await elevenLabsService.listUserVoiceClones(userId);

    if (!result.success) {
      throw new Error(result.error || 'Failed to list voice clones');
    }

    res.json({
      success: true,
      clones: result.clones || [],
      count: result.clones?.length || 0,
    });
  } catch (error: any) {
    console.error('[VoiceAPI] List clones error:', error);
    res.status(500).json({ 
      message: 'Failed to list voice clones',
      error: error.message 
    });
  }
});

/**
 * DELETE /api/mrblue/voice/clone/:id
 * Delete a specific voice clone
 */
router.delete('/clone/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cloneId = parseInt(req.params.id, 10);
    if (isNaN(cloneId)) {
      return res.status(400).json({ message: 'Invalid clone ID' });
    }

    console.log(`[VoiceAPI] Deleting voice clone ${cloneId} for user ${userId}`);

    const result = await elevenLabsService.deleteVoiceClone(userId, cloneId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to delete voice clone',
      });
    }

    res.json({
      success: true,
      message: 'Voice clone deleted successfully',
    });
  } catch (error: any) {
    console.error('[VoiceAPI] Delete clone error:', error);
    res.status(500).json({ 
      message: 'Failed to delete voice clone',
      error: error.message 
    });
  }
});

/**
 * POST /api/mrblue/voice/preview
 * Generate preview audio for a voice clone
 */
router.post('/preview', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request body
    const validation = previewVoiceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validation.error.errors 
      });
    }

    const { voiceId, text, language } = validation.data;

    console.log(`[VoiceAPI] Generating preview for voice ${voiceId}`);

    const result = await elevenLabsService.generatePreview({
      voiceId,
      text,
      language,
    });

    if (!result.success || !result.audio) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to generate preview',
      });
    }

    // Convert to base64 for easy transmission
    const audioBase64 = result.audio.toString('base64');

    res.json({
      success: true,
      audio: `data:audio/mpeg;base64,${audioBase64}`,
      characterCount: text.length,
    });
  } catch (error: any) {
    console.error('[VoiceAPI] Preview error:', error);
    res.status(500).json({ 
      message: 'Failed to generate preview',
      error: error.message 
    });
  }
});

/**
 * POST /api/mrblue/voice/set-default/:id
 * Set a voice clone as the user's default voice
 */
router.post('/set-default/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cloneId = parseInt(req.params.id, 10);
    if (isNaN(cloneId)) {
      return res.status(400).json({ message: 'Invalid clone ID' });
    }

    console.log(`[VoiceAPI] Setting default voice ${cloneId} for user ${userId}`);

    const result = await elevenLabsService.setDefaultVoice(userId, cloneId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to set default voice',
      });
    }

    res.json({
      success: true,
      message: 'Default voice set successfully',
    });
  } catch (error: any) {
    console.error('[VoiceAPI] Set default error:', error);
    res.status(500).json({ 
      message: 'Failed to set default voice',
      error: error.message 
    });
  }
});

export default router;
