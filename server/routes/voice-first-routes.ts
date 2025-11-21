/**
 * VOICE-FIRST API ROUTES
 * Inspired by Wispr Flow: 4x faster than typing
 * 
 * Endpoints:
 * - POST /api/voice/transcribe - General voice transcription
 * - POST /api/voice/post - Create post from voice
 * - POST /api/voice/event - Create event from voice
 * - POST /api/voice/profile - Update profile from voice
 * - POST /api/voice/search - Voice search
 * - POST /api/voice/chat - Mr. Blue voice chat
 * - GET /api/voice/languages - Get supported languages
 */

import { Router } from 'express';
import multer from 'multer';
import VoiceFirstService from '../services/mrBlue/VoiceFirstService';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max (Whisper limit)
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

/**
 * POST /api/voice/transcribe
 * General-purpose voice transcription with auto-editing
 */
router.post('/transcribe', requireAuth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { language, context, tonePreference, autoEdit } = req.body;

    const result = await VoiceFirstService.transcribeVoice({
      audioBuffer: req.file.buffer,
      language,
      context: context || 'chat',
      tonePreference,
      autoEdit: autoEdit !== 'false', // Default true
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Voice transcription error:', error);
    res.status(500).json({
      error: 'Failed to transcribe voice',
      details: error.message,
    });
  }
});

/**
 * POST /api/voice/post
 * Create a post from voice input
 */
router.post('/post', requireAuth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { language } = req.body;
    const userId = req.user!.id;

    const result = await VoiceFirstService.createVoicePost(
      req.file.buffer,
      userId,
      language
    );

    res.json({
      success: true,
      data: {
        content: result.content,
        metadata: result.metadata,
      },
    });
  } catch (error: any) {
    console.error('Voice post creation error:', error);
    res.status(500).json({
      error: 'Failed to create post from voice',
      details: error.message,
    });
  }
});

/**
 * POST /api/voice/event
 * Create an event from natural language voice input
 */
router.post('/event', requireAuth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { language } = req.body;
    const userId = req.user!.id;

    const result = await VoiceFirstService.createVoiceEvent(
      req.file.buffer,
      userId,
      language
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Voice event creation error:', error);
    res.status(500).json({
      error: 'Failed to create event from voice',
      details: error.message,
    });
  }
});

/**
 * POST /api/voice/profile
 * Update profile bio from voice
 */
router.post('/profile', requireAuth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { language } = req.body;
    const userId = req.user!.id;

    const result = await VoiceFirstService.updateVoiceProfile(
      req.file.buffer,
      userId,
      language
    );

    res.json({
      success: true,
      data: {
        bio: result.bio,
        metadata: result.metadata,
      },
    });
  } catch (error: any) {
    console.error('Voice profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile from voice',
      details: error.message,
    });
  }
});

/**
 * POST /api/voice/search
 * Voice-powered search
 */
router.post('/search', requireAuth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { language } = req.body;

    const result = await VoiceFirstService.voiceSearch(
      req.file.buffer,
      language
    );

    res.json({
      success: true,
      data: {
        query: result.searchQuery,
        keywords: result.keywords,
        metadata: result.metadata,
      },
    });
  } catch (error: any) {
    console.error('Voice search error:', error);
    res.status(500).json({
      error: 'Failed to perform voice search',
      details: error.message,
    });
  }
});

/**
 * POST /api/voice/chat
 * Voice input for Mr. Blue chat
 */
router.post('/chat', requireAuth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { language } = req.body;
    const userId = req.user!.id;

    const result = await VoiceFirstService.voiceMrBlueChat(
      req.file.buffer,
      userId,
      language
    );

    res.json({
      success: true,
      data: {
        message: result.message,
        metadata: result.metadata,
      },
    });
  } catch (error: any) {
    console.error('Voice chat error:', error);
    res.status(500).json({
      error: 'Failed to process voice chat',
      details: error.message,
    });
  }
});

/**
 * GET /api/voice/languages
 * Get list of supported languages (68 languages)
 */
router.get('/languages', (req, res) => {
  const languages = VoiceFirstService.getSupportedLanguages();
  res.json({
    success: true,
    data: {
      count: languages.length,
      languages,
      note: 'Supports 68 languages with auto-detection',
    },
  });
});

export default router;
