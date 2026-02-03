/**
 * CONTENT ROUTES - Faceless Content Marketing API
 * MB.MD v9.9.3
 */

import { Router, Request, Response } from 'express';
import { facelessContentService, CONTENT_TEMPLATES } from '../services/FacelessContentService';

const router = Router();

/**
 * GET /api/content/templates
 * Get all content templates
 */
router.get('/templates', (_req: Request, res: Response) => {
  res.json(CONTENT_TEMPLATES);
});

/**
 * POST /api/content/generate
 * Generate faceless content (script → voice → video)
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { templateId, customPrompt, topic, duration, voiceId, avatarImageUrl, platforms, scheduledFor, userId } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const result = await facelessContentService.createContent({
      templateId,
      customPrompt,
      topic,
      duration: duration || '30s',
      voiceId,
      avatarImageUrl,
      platforms: platforms || ['tiktok', 'instagram'],
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      userId: userId || 1
    });

    res.json(result);
  } catch (error: any) {
    console.error('[ContentRoutes] Generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/content/batch
 * Batch generate multiple content pieces
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { templates, topics, count, platforms, scheduleDays, userId } = req.body;

    if (!topics || !topics.length) {
      return res.status(400).json({ error: 'Topics are required' });
    }

    const contentIds = await facelessContentService.createBatch({
      templates: templates || ['tango_tip_beginner'],
      topics,
      count: count || topics.length,
      platforms: platforms || ['tiktok', 'instagram'],
      scheduleDays: scheduleDays || 7,
      userId: userId || 1
    });

    res.json({ contentIds });
  } catch (error: any) {
    console.error('[ContentRoutes] Batch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/content/status/:id
 * Get content generation status
 */
router.get('/status/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const result = facelessContentService.getResult(id);

  if (!result) {
    return res.status(404).json({ error: 'Content not found' });
  }

  res.json(result);
});

/**
 * POST /api/content/script
 * Generate script only
 */
router.post('/script', async (req: Request, res: Response) => {
  try {
    const { templateId, customPrompt, topic, duration } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const script = await facelessContentService.generateScript({
      templateId,
      customPrompt,
      topic,
      duration: duration || '30s',
      platforms: [],
      userId: 1
    });

    res.json(script);
  } catch (error: any) {
    console.error('[ContentRoutes] Script error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
