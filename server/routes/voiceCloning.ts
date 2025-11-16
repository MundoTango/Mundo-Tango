import { Router, type Request, type Response } from 'express';
import { VoiceCloningService } from '../services/voiceCloningService';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const voiceCloningService = new VoiceCloningService();

export function registerVoiceCloningRoutes(app: Router) {
  const router = Router();
  
  // Clone voice from interview URLs
  router.post('/clone', async (req: Request, res: Response) => {
    try {
      // Check authentication
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { audioUrls, voiceName } = req.body;
      const userId = req.user!.id;
      
      if (!audioUrls || !Array.isArray(audioUrls) || audioUrls.length === 0) {
        return res.status(400).json({ 
          error: 'audioUrls array required',
          example: {
            audioUrls: [
              'https://www.youtube.com/watch?v=xxxxx',
              'https://podbean.com/episode/xxxxx'
            ],
            voiceName: 'My Custom Voice'
          }
        });
      }
      
      console.log(`[VoiceClone API] User ${userId} cloning voice from ${audioUrls.length} URLs`);
      
      // Clone voice
      const voiceId = await voiceCloningService.cloneUserVoice({
        audioUrls,
        voiceName: voiceName || `${req.user!.username}'s Voice`,
        userId
      });
      
      // Save voice ID to user's profile
      await db.update(users)
        .set({ customVoiceId: voiceId })
        .where(eq(users.id, userId));
      
      console.log(`[VoiceClone API] Successfully cloned voice ${voiceId} for user ${userId}`);
      
      res.json({
        success: true,
        voiceId,
        message: 'Voice cloned successfully! This is now your default Mr. Blue voice.'
      });
    } catch (error: any) {
      console.error('[VoiceClone API] Error:', error);
      res.status(500).json({ 
        error: error.message || 'Voice cloning failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Get user's custom voice ID
  router.get('/voice', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = req.user!.id;
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        customVoiceId: user.customVoiceId || null
      });
    } catch (error: any) {
      console.error('[VoiceClone API] Error fetching voice:', error);
      res.status(500).json({ error: 'Failed to fetch voice' });
    }
  });

  // List available voices from ElevenLabs
  router.get('/voices', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = await voiceCloningService.listVoices();
      
      if (!result.success) {
        return res.status(500).json({ 
          error: 'Failed to list voices',
          details: result.error
        });
      }

      res.json({
        success: true,
        voices: result.voices || []
      });
    } catch (error: any) {
      console.error('[VoiceClone API] Error listing voices:', error);
      res.status(500).json({ error: 'Failed to list voices' });
    }
  });

  // Delete custom voice
  router.delete('/voice', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = req.user!.id;
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user?.customVoiceId) {
        return res.status(404).json({ error: 'No custom voice found' });
      }

      // Delete from ElevenLabs
      const result = await voiceCloningService.deleteVoice(user.customVoiceId);
      
      if (!result.success) {
        console.error('[VoiceClone API] Failed to delete from ElevenLabs:', result.error);
        // Continue anyway to clear from database
      }

      // Clear from user profile
      await db.update(users)
        .set({ customVoiceId: null })
        .where(eq(users.id, userId));

      res.json({
        success: true,
        message: 'Custom voice deleted successfully'
      });
    } catch (error: any) {
      console.error('[VoiceClone API] Error deleting voice:', error);
      res.status(500).json({ error: 'Failed to delete voice' });
    }
  });
  
  app.use('/api/voice-cloning', router);
}
