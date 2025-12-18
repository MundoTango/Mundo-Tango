import { Router, Request, Response } from 'express';
import { lumaService } from '../services/luma-service';

const router = Router();

/**
 * POST /api/luma/generate/text-to-video
 * Generate a video from a text prompt
 */
router.post('/generate/text-to-video', async (req: Request, res: Response) => {
  try {
    const { prompt, model, resolution, duration } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Start video generation
    const result = await lumaService.generateTextToVideo(prompt, {
      model,
      resolution,
      duration,
    });

    res.json({
      success: true,
      generationId: result.id,
      state: result.state,
      message: 'Video generation started successfully',
    });
  } catch (error: any) {
    console.error('Error in text-to-video generation:', error);
    res.status(500).json({
      error: 'Failed to start video generation',
      details: error.message,
    });
  }
});

/**
 * POST /api/luma/generate/image-to-video
 * Generate a video from an image and text prompt
 */
router.post('/generate/image-to-video', async (req: Request, res: Response) => {
  try {
    const { imageUrl, prompt, model, resolution, duration } = req.body;

    if (!imageUrl || !prompt) {
      return res.status(400).json({ error: 'Image URL and prompt are required' });
    }

    // Start video generation
    const result = await lumaService.generateImageToVideo(imageUrl, prompt, {
      model,
      resolution,
      duration,
    });

    res.json({
      success: true,
      generationId: result.id,
      state: result.state,
      message: 'Video generation started successfully',
    });
  } catch (error: any) {
    console.error('Error in image-to-video generation:', error);
    res.status(500).json({
      error: 'Failed to start video generation',
      details: error.message,
    });
  }
});

/**
 * GET /api/luma/status/:generationId
 * Check the status of a video generation
 */
router.get('/status/:generationId', async (req: Request, res: Response) => {
  try {
    const { generationId } = req.params;

    const status = await lumaService.getGenerationStatus(generationId);

    res.json({
      success: true,
      generationId: status.id,
      state: status.state,
      video: status.video,
      failureReason: status.failure_reason,
    });
  } catch (error: any) {
    console.error('Error checking generation status:', error);
    res.status(500).json({
      error: 'Failed to check generation status',
      details: error.message,
    });
  }
});

/**
 * POST /api/luma/generate-and-wait
 * Generate a video and wait for completion
 */
router.post('/generate-and-wait', async (req: Request, res: Response) => {
  try {
    const { prompt, imageUrl, model, resolution, duration, maxWaitTime, pollInterval } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Start video generation
    let result;
    if (imageUrl) {
      result = await lumaService.generateImageToVideo(imageUrl, prompt, {
        model,
        resolution,
        duration,
      });
    } else {
      result = await lumaService.generateTextToVideo(prompt, {
        model,
        resolution,
        duration,
      });
    }

    // Wait for completion
    const completedResult = await lumaService.waitForCompletion(
      result.id,
      maxWaitTime,
      pollInterval
    );

    res.json({
      success: true,
      generationId: completedResult.id,
      state: completedResult.state,
      video: completedResult.video,
      message: 'Video generated successfully',
    });
  } catch (error: any) {
    console.error('Error in generate-and-wait:', error);
    res.status(500).json({
      error: 'Failed to generate video',
      details: error.message,
    });
  }
});

export default router;
