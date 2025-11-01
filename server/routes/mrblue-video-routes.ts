import { Router } from 'express';
import { lumaVideoService } from '../services/lumaVideoService';

const router = Router();

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

export default router;
