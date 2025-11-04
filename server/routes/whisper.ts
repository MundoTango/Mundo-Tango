/**
 * Whisper Audio Transcription Routes
 * OpenAI Whisper API for speech-to-text conversation
 */

import { Router, type Request, Response } from "express";
import { OpenAI } from "openai";
import multer, { type FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";

const router = Router();

// Configure multer for audio file uploads
const upload = multer({
  dest: '/tmp/audio-uploads/',
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedMimes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/m4a',
      'audio/mp4'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format. Supported: mp3, wav, webm, ogg, m4a'));
    }
  }
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * POST /api/whisper/transcribe
 * Transcribe audio to text using Whisper
 */
router.post("/transcribe", upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    console.log('[Whisper] Transcribing audio:', req.file.originalname);

    // Create a read stream from the uploaded file
    const audioFile = fs.createReadStream(req.file.path);

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: req.body.language || "en", // Optional: specify language
      response_format: "json",
      temperature: 0.2 // Lower temperature for more accurate transcription
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    console.log('[Whisper] Transcription successful:', transcription.text.substring(0, 50));

    res.json({
      success: true,
      text: transcription.text,
      language: req.body.language || "en"
    });

  } catch (error: any) {
    console.error('[Whisper] Transcription error:', error);

    // Clean up file if it exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to transcribe audio'
    });
  }
});

/**
 * POST /api/whisper/text-to-speech
 * Convert text to speech using OpenAI TTS
 */
router.post("/text-to-speech", async (req: Request, res: Response) => {
  try {
    const { text, voice = "alloy" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    console.log('[Whisper] Generating speech for:', text.substring(0, 50));

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text,
      speed: 1.0
    });

    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Set response headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);

  } catch (error: any) {
    console.error('[Whisper] TTS error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate speech'
    });
  }
});

export default router;
