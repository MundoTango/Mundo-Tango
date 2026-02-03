/**
 * Mundo Tango Video Recording API Routes
 * Endpoints for video library management and on-demand recording
 * 
 * MB.MD Pattern 38: E2E Testing Infrastructure
 * MB.MD Pattern 41: Parallel Execution
 */

import { Router, Request, Response } from 'express';
import { videoRecordingService, JourneyType } from '../services/VideoRecordingService';

const router = Router();

/**
 * GET /api/videos/library
 * Get all available videos from the video library
 * Query params:
 *   - type: 'customer' | 'marketing' | 'tour' (optional filter)
 */
router.get('/library', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as JourneyType | undefined;
    
    if (type && !['customer', 'marketing', 'tour'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be: customer, marketing, or tour',
      });
    }
    
    const library = await videoRecordingService.getVideoLibrary(type);
    
    res.json({
      success: true,
      ...library,
    });
  } catch (error) {
    console.error('Error fetching video library:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video library',
    });
  }
});

/**
 * GET /api/videos/:id
 * Get a specific video by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const video = await videoRecordingService.getVideoById(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }
    
    res.json({
      success: true,
      video,
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video',
    });
  }
});

/**
 * GET /api/videos/journeys/available
 * Get list of available journey definitions that can be recorded
 */
router.get('/journeys/available', async (req: Request, res: Response) => {
  try {
    const journeys = await videoRecordingService.getAvailableJourneys();
    
    res.json({
      success: true,
      journeys,
      count: journeys.length,
    });
  } catch (error) {
    console.error('Error fetching available journeys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available journeys',
    });
  }
});

/**
 * POST /api/videos/record
 * Trigger recording of a specific journey
 * Body:
 *   - journeyId: string (required)
 *   - type: 'customer' | 'marketing' | 'tour' (optional)
 */
router.post('/record', async (req: Request, res: Response) => {
  try {
    const { journeyId, type } = req.body;
    
    if (!journeyId) {
      return res.status(400).json({
        success: false,
        error: 'journeyId is required',
      });
    }
    
    if (type && !['customer', 'marketing', 'tour'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be: customer, marketing, or tour',
      });
    }
    
    console.log(`Recording journey: ${journeyId} (type: ${type || 'auto-detect'})`);
    
    const result = await videoRecordingService.recordJourney({
      journeyId,
      type: type as JourneyType | undefined,
    });
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }
    
    res.json({
      success: true,
      message: `Journey recorded successfully: ${journeyId}`,
      videoId: result.videoId,
      videoUrl: result.videoUrl,
    });
  } catch (error) {
    console.error('Error recording journey:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record journey',
    });
  }
});

/**
 * POST /api/videos/record-all
 * Trigger recording of all journeys
 * Body:
 *   - type: 'customer' | 'marketing' | 'tour' (optional filter)
 */
router.post('/record-all', async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    
    if (type && !['customer', 'marketing', 'tour'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be: customer, marketing, or tour',
      });
    }
    
    console.log(`Recording all journeys${type ? ` of type: ${type}` : ''}`);
    
    res.json({
      success: true,
      message: 'Recording started in background',
      note: 'Check /api/videos/library for completed recordings',
    });
    
    setImmediate(async () => {
      try {
        await videoRecordingService.recordAllJourneys(type as JourneyType | undefined);
        console.log('All journey recordings completed');
      } catch (err) {
        console.error('Error recording all journeys:', err);
      }
    });
  } catch (error) {
    console.error('Error starting batch recording:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start batch recording',
    });
  }
});

export default router;
