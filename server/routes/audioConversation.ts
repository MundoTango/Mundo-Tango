import { Router } from 'express';
import { ElevenLabsService } from '../services/mrblue/elevenLabsService';
import { AudioConversationService } from '../services/mrblue/audioConversationService';
import { requireAuth } from '../middleware/auth';
import { db } from '../db';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const elevenLabsService = new ElevenLabsService();
const audioConversationService = new AudioConversationService();

/**
 * Start a new audio conversation session
 */
router.post('/start', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { context } = req.body;

    // Get user tier for capability check
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create session
    const session = await audioConversationService.createSession(
      userId,
      user.tier || 0,
      context
    );

    res.json({
      sessionId: session.id,
      maxDuration: session.maxDurationMinutes,
      features: session.features,
    });
  } catch (error: any) {
    console.error('Error starting audio conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Process audio input from user
 */
router.post('/process-audio', requireAuth, upload.single('audio'), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { sessionId, context } = req.body;
    const audioBuffer = req.file?.buffer;

    if (!audioBuffer) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Validate session belongs to user
    const session = await audioConversationService.getSession(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(403).json({ error: 'Invalid session' });
    }

    // Convert audio to text
    const transcription = await elevenLabsService.transcribeAudio(audioBuffer);

    // Process with Mr. Blue AI
    const response = await audioConversationService.processMessage(
      sessionId,
      transcription,
      {
        userId,
        context,
        includeClickTracking: true,
      }
    );

    // Convert response to audio
    const audioResponse = await elevenLabsService.textToSpeech(response.text);

    // Send back both text and audio
    res.json({
      transcription,
      text: response.text,
      audioUrl: audioResponse.url,
      suggestions: response.suggestions,
    });
  } catch (error: any) {
    console.error('Error processing audio:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get conversation history
 */
router.get('/history/:sessionId', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    const session = await audioConversationService.getSession(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(403).json({ error: 'Invalid session' });
    }

    const history = await audioConversationService.getConversationHistory(sessionId);

    res.json({ history });
  } catch (error: any) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * End audio conversation session
 */
router.post('/end/:sessionId', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    const session = await audioConversationService.getSession(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(403).json({ error: 'Invalid session' });
    }

    await audioConversationService.endSession(sessionId);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Track user click during audio conversation
 */
router.post('/track-click', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { sessionId, element, page, timestamp } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const session = await audioConversationService.getSession(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(403).json({ error: 'Invalid session' });
    }

    await audioConversationService.trackClick(sessionId, {
      element,
      page,
      timestamp,
      userId,
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
