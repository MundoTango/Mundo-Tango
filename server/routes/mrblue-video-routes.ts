import { Router, type Request } from 'express';
import { lumaVideoService } from '../services/lumaVideoService';
import { didService, DID_VOICE_PRESETS, MRBLUE_AVATAR_PRESETS } from '../services/didService';
import { insertLumaVideoSchema } from '@shared/schema';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Extend Request to include user
interface AuthRequest extends Request {
  user?: { id: number };
}

/**
 * POST /api/mrblue/generate-state/:state
 * Generate a specific state video for Mr. Blue
 */
router.post('/generate-state/:state', async (req, res) => {
  try {
    const { state } = req.params;
    
    const validStates = [
      'idle', 'listening', 'speaking', 'happy', 
      'thinking', 'excited', 'surprised', 'nodding',
      'walk-left', 'walk-right'
    ];

    if (!validStates.includes(state)) {
      return res.status(400).json({
        error: `Invalid state. Must be one of: ${validStates.join(', ')}`
      });
    }

    console.log(`🎬 Generating Mr. Blue ${state} video...`);
    const generation = await lumaVideoService.generateMrBlueState(state);

    res.json({
      success: true,
      generationId: generation.id,
      state: generation.state,
      videoState: state,
      message: `Mr. Blue ${state} video generation started!`
    });
  } catch (error: any) {
    console.error('State video generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate state video'
    });
  }
});

/**
 * POST /api/mrblue/generate-all-states
 * Generate ALL state videos in parallel (requires sufficient Luma credits)
 */
router.post('/generate-all-states', async (req, res) => {
  try {
    const states = [
      'idle', 'listening', 'speaking', 'happy', 
      'thinking', 'excited', 'surprised', 'nodding',
      'walk-left', 'walk-right'
    ];

    console.log('🎬 Starting batch generation of all Mr. Blue state videos...');
    console.log(`⚠️  This will cost approximately $${(states.length * 0.40).toFixed(2)} in Luma credits`);

    // Generate all videos in parallel
    const generations = await Promise.all(
      states.map(state => 
        lumaVideoService.generateMrBlueState(state)
          .then(gen => ({ state, generationId: gen.id, status: gen.state }))
          .catch(err => ({ state, error: err.message }))
      )
    );

    const successful = generations.filter(g => !('error' in g));
    const failed = generations.filter(g => 'error' in g);

    res.json({
      success: true,
      message: `Started ${successful.length}/${states.length} video generations`,
      generations: successful,
      failed: failed.length > 0 ? failed : undefined,
      estimatedCost: `$${(successful.length * 0.40).toFixed(2)}`,
      estimatedTime: '~2 minutes per video'
    });
  } catch (error: any) {
    console.error('Batch generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to start batch generation'
    });
  }
});

/**
 * GET /api/mrblue/check-generation/:generationId
 * Check status of a specific generation and auto-save when complete
 */
router.get('/check-generation/:generationId', async (req, res) => {
  try {
    const { generationId } = req.params;
    const { videoState } = req.query;

    const status = await lumaVideoService.getGenerationStatus(generationId);

    // If completed, download and save the video
    if (status.state === 'completed' && status.video?.url && videoState) {
      console.log(`✅ ${videoState} video completed! Downloading...`);
      
      const videoUrl = status.video.url;
      const response = await fetch(videoUrl);
      
      if (response.ok) {
        const buffer = await response.buffer();
        const fs = await import('fs');
        const path = await import('path');
        
        const outputDir = path.join(process.cwd(), 'client/public/videos/states');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const filename = `${videoState}.mp4`;
        const outputPath = path.join(outputDir, filename);
        
        fs.writeFileSync(outputPath, buffer);
        console.log(`✅ Saved ${videoState} video to ${outputPath}`);
        
        return res.json({
          success: true,
          state: 'completed',
          videoPath: `/videos/states/${filename}`,
          generationId,
          videoState
        });
      }
    }

    res.json({
      success: true,
      state: status.state,
      generationId,
      videoState
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to check generation status'
    });
  }
});

// ============================================================================
// USER-FACING VIDEO GENERATION API
// ============================================================================

/**
 * POST /api/mrblue/video/generate
 * Start a new video generation for the logged-in user
 */
router.post('/video/generate', async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { prompt, aspectRatio, duration } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (prompt.length > 500) {
      return res.status(400).json({ error: 'Prompt too long (max 500 characters)' });
    }

    const video = await lumaVideoService.generateUserVideo(
      req.user.id,
      prompt.trim(),
      {
        aspectRatio: aspectRatio || '16:9',
        duration: duration || 5,
      }
    );

    res.json({
      success: true,
      generationId: video.generationId,
      status: video.status,
      message: 'Video generation started! Check status for updates.',
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to start video generation'
    });
  }
});

/**
 * GET /api/mrblue/video/status/:generationId
 * Poll generation status and auto-complete when ready
 */
router.get('/video/status/:generationId', async (req: AuthRequest, res) => {
  try {
    const { generationId } = req.params;

    if (!generationId) {
      return res.status(400).json({ error: 'Generation ID required' });
    }

    // Get from database first
    const dbVideo = await lumaVideoService.getVideoByGenerationId(generationId);

    if (!dbVideo) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // If already completed, return it
    if (dbVideo.status === 'completed') {
      return res.json({
        success: true,
        video: dbVideo,
      });
    }

    // If failed, return error
    if (dbVideo.status === 'failed') {
      return res.json({
        success: false,
        video: dbVideo,
        error: dbVideo.failureReason || 'Video generation failed',
      });
    }

    // Otherwise, check Luma and try to complete
    const video = await lumaVideoService.completeVideoGeneration(generationId);

    res.json({
      success: true,
      video,
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: error.message || 'Failed to check video status'
    });
  }
});

/**
 * GET /api/mrblue/video/download/:generationId
 * Get download URL for completed video
 */
router.get('/video/download/:generationId', async (req: AuthRequest, res) => {
  try {
    const { generationId } = req.params;

    const video = await lumaVideoService.getVideoByGenerationId(generationId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Video not ready',
        status: video.status 
      });
    }

    res.json({
      success: true,
      downloadUrl: video.cloudinaryUrl || video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
    });
  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get download URL'
    });
  }
});

/**
 * GET /api/mrblue/video/history
 * Get user's video generation history
 */
router.get('/video/history', async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const videos = await lumaVideoService.getUserVideos(req.user.id, limit);

    res.json({
      success: true,
      videos,
      count: videos.length,
    });
  } catch (error: any) {
    console.error('History fetch error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch video history'
    });
  }
});

// ============================================================================
// D-ID TALKING AVATAR VIDEO GENERATION
// ============================================================================

/**
 * GET /api/mrblue/video/did/presets
 * Get avatar and voice presets
 */
router.get('/video/did/presets', async (req: AuthRequest, res) => {
  try {
    res.json({
      success: true,
      avatarPresets: MRBLUE_AVATAR_PRESETS,
      voicePresets: DID_VOICE_PRESETS,
    });
  } catch (error: any) {
    console.error('Presets fetch error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch presets'
    });
  }
});

/**
 * GET /api/mrblue/video/did/voices
 * Get available voices (D-ID + user's ElevenLabs voices)
 */
router.get('/video/did/voices', async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const voices = await didService.getAvailableVoices(req.user.id);

    res.json({
      success: true,
      voices,
    });
  } catch (error: any) {
    console.error('Voices fetch error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch voices'
    });
  }
});

/**
 * POST /api/mrblue/video/did/upload-avatar
 * Upload custom avatar image
 */
router.post('/video/did/upload-avatar', upload.single('avatar'), async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Avatar image is required' });
    }

    const filename = `${Date.now()}_${req.file.originalname}`;
    const avatarUrl = await didService.uploadAvatar(
      req.file.buffer,
      req.user.id,
      filename
    );

    res.json({
      success: true,
      avatarUrl,
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      error: error.message || 'Failed to upload avatar'
    });
  }
});

/**
 * POST /api/mrblue/video/did/generate
 * Generate talking avatar video
 */
router.post('/video/did/generate', async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      avatarUrl,
      avatarPreset,
      script,
      voice,
      voiceProvider,
      elevenLabsVoiceId,
      useSSML,
    } = req.body;

    // Validation
    if (!avatarUrl) {
      return res.status(400).json({ error: 'Avatar URL is required' });
    }

    if (!script || typeof script !== 'string' || script.trim().length === 0) {
      return res.status(400).json({ error: 'Script is required' });
    }

    if (script.length > 2000) {
      return res.status(400).json({ error: 'Script too long (max 2000 characters)' });
    }

    if (!voice) {
      return res.status(400).json({ error: 'Voice is required' });
    }

    // Validate SSML if enabled
    if (useSSML) {
      const validation = didService.validateSSML(script);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
    }

    // Generate video
    const video = await didService.generateVideo(req.user.id, {
      avatarUrl,
      avatarPreset,
      script: script.trim(),
      voice,
      voiceProvider,
      elevenLabsVoiceId,
      useSSML,
    });

    res.json({
      success: true,
      videoId: video.didVideoId,
      status: video.status,
      message: 'Talking avatar video generation started!',
    });
  } catch (error: any) {
    console.error('D-ID generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate video'
    });
  }
});

/**
 * GET /api/mrblue/video/did/status/:id
 * Check D-ID video generation status and auto-complete when ready
 */
router.get('/video/did/status/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Video ID required' });
    }

    // Get from database first
    const dbVideo = await didService.getVideoByDIDId(id);

    if (!dbVideo) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // If already completed, return it
    if (dbVideo.status === 'completed') {
      return res.json({
        success: true,
        video: dbVideo,
      });
    }

    // If failed, return error
    if (dbVideo.status === 'failed') {
      return res.json({
        success: false,
        video: dbVideo,
        error: dbVideo.failureReason || 'Video generation failed',
      });
    }

    // Otherwise, check D-ID and try to complete
    const video = await didService.completeVideoGeneration(id);

    res.json({
      success: true,
      video,
    });
  } catch (error: any) {
    console.error('D-ID status check error:', error);
    res.status(500).json({
      error: error.message || 'Failed to check video status'
    });
  }
});

/**
 * GET /api/mrblue/video/did/history
 * Get user's D-ID video generation history
 */
router.get('/video/did/history', async (req: AuthRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const videos = await didService.getUserVideos(req.user.id, limit);

    res.json({
      success: true,
      videos,
      count: videos.length,
    });
  } catch (error: any) {
    console.error('History fetch error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch video history'
    });
  }
});

/**
 * GET /api/mrblue/video/did/download/:id
 * Get download URL for completed D-ID video
 */
router.get('/video/did/download/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const video = await didService.getVideoByDIDId(id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.status !== 'completed') {
      return res.status(400).json({
        error: 'Video not ready',
        status: video.status
      });
    }

    res.json({
      success: true,
      downloadUrl: video.cloudinaryUrl || video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
    });
  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get download URL'
    });
  }
});

export default router;
