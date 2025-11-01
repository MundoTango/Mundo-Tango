import express from 'express';
import { lumaVideoService } from '../services/lumaVideoService';

const router = express.Router();

/**
 * POST /api/videos/generate/text
 * Generate video from text prompt
 */
router.post('/generate/text', async (req, res) => {
  try {
    const { prompt, aspectRatio, loop } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'prompt is required'
      });
    }

    const generation = await lumaVideoService.generateFromText({
      prompt,
      aspectRatio: aspectRatio || '16:9',
      loop: loop || false
    });

    res.json({
      success: true,
      generationId: generation.id,
      state: generation.state,
      message: 'Video generation started. Poll /api/videos/status/:id for progress.'
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate video'
    });
  }
});

/**
 * POST /api/videos/generate/image
 * Generate video from image + prompt (image-to-video)
 */
router.post('/generate/image', async (req, res) => {
  try {
    const { imageUrl, prompt, aspectRatio, loop } = req.body;

    if (!imageUrl || !prompt) {
      return res.status(400).json({
        error: 'imageUrl and prompt are required'
      });
    }

    const generation = await lumaVideoService.generateFromImage({
      imageUrl,
      prompt,
      aspectRatio: aspectRatio || '16:9',
      loop: loop || false
    });

    res.json({
      success: true,
      generationId: generation.id,
      state: generation.state,
      message: 'Video generation started. Poll /api/videos/status/:id for progress.'
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate video'
    });
  }
});

/**
 * GET /api/videos/status/:generationId
 * Check video generation progress
 */
router.get('/status/:generationId', async (req, res) => {
  try {
    const { generationId } = req.params;
    const status = await lumaVideoService.getGenerationStatus(generationId);

    res.json({
      success: true,
      ...status
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to check status'
    });
  }
});

/**
 * POST /api/videos/download/:generationId
 * Download completed video
 */
router.post('/download/:generationId', async (req, res) => {
  try {
    const { generationId } = req.params;
    const videoPath = await lumaVideoService.downloadVideo(generationId);

    res.json({
      success: true,
      videoPath,
      message: 'Video downloaded successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to download video'
    });
  }
});

/**
 * POST /api/videos/mr-blue/intro
 * Generate standard Mr. Blue introduction video
 */
router.post('/mr-blue/intro', async (req, res) => {
  try {
    const generation = await lumaVideoService.generateMrBlueIntro();

    res.json({
      success: true,
      generationId: generation.id,
      state: generation.state,
      message: 'Mr. Blue intro video generation started!'
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to generate intro video'
    });
  }
});

/**
 * POST /api/videos/mr-blue/from-photo
 * Generate video from Mr. Blue photo
 */
router.post('/mr-blue/from-photo', async (req, res) => {
  try {
    const { imageUrl, motion } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        error: 'imageUrl is required'
      });
    }

    const generation = await lumaVideoService.generateFromMrBluePhoto(
      imageUrl,
      motion || 'gentle nod and smile'
    );

    res.json({
      success: true,
      generationId: generation.id,
      state: generation.state,
      message: 'Mr. Blue video from photo generation started!'
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to generate video from photo'
    });
  }
});

export default router;
