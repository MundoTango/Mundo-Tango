import type { Express, Request, Response } from 'express';
import { LumaService } from '../../services/LumaService';

const lumaService = new LumaService();

/**
 * Register Luma API routes for Mr Blue video generation
 * @param app Express application instance
 */
export function registerLumaRoutes(app: Express): void {
  
  /**
   * POST /api/mrblue/luma/text-to-video
   * Generate video from text prompt using Luma Dream Machine
   */
  app.post('/api/mrblue/luma/text-to-video', async (req: Request, res: Response) => {
    try {
      const { userId, prompt, duration = 5, aspectRatio = '16:9', cameraMotion, style, hdr } = req.body;

      // Validation
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
      }
      if (![5, 10].includes(duration)) {
        return res.status(400).json({ error: 'duration must be 5 or 10 seconds' });
      }
      if (!['1:1', '16:9', '9:16', '4:3'].includes(aspectRatio)) {
        return res.status(400).json({ error: 'invalid aspectRatio' });
      }

      const video = await lumaService.textToVideo({
        userId,
        prompt,
        duration,
        aspectRatio,
        cameraMotion,
        style,
        hdr
      });

      res.json({
        success: true,
        video
      });
    } catch (error) {
      console.error('Luma text-to-video error:', error);
      res.status(500).json({
        error: 'Failed to generate video',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /api/mrblue/luma/image-to-video
   * Generate video from image using Luma Dream Machine
   */
  app.post('/api/mrblue/luma/image-to-video', async (req: Request, res: Response) => {
    try {
      const { userId, imageUrl, duration = 5, animationIntensity = 'medium', cameraPath } = req.body;

      // Validation
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      if (!imageUrl) {
        return res.status(400).json({ error: 'imageUrl is required' });
      }
      if (![5, 10].includes(duration)) {
        return res.status(400).json({ error: 'duration must be 5 or 10 seconds' });
      }
      if (!['subtle', 'medium', 'dramatic'].includes(animationIntensity)) {
        return res.status(400).json({ error: 'invalid animationIntensity' });
      }

      const video = await lumaService.imageToVideo({
        userId,
        imageUrl,
        duration,
        animationIntensity,
        cameraPath
      });

      res.json({
        success: true,
        video
      });
    } catch (error) {
      console.error('Luma image-to-video error:', error);
      res.status(500).json({
        error: 'Failed to generate video',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * GET /api/mrblue/luma/health
   * Health check endpoint for Luma service
   */
  app.get('/api/mrblue/luma/health', (req: Request, res: Response) => {
    res.json({
      service: 'luma',
      status: 'healthy',
      apiConfigured: !!process.env.LUMA_API_KEY,
      endpoints: [
        '/api/mrblue/luma/text-to-video',
        '/api/mrblue/luma/image-to-video'
      ]
    });
  });

  console.log('✓ Luma routes registered for Mr Blue');
}
