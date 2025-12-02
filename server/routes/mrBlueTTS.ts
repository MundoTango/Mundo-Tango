import { Router, Request, Response } from 'express';

const router = Router();

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

router.post('/', async (req: Request, res: Response) => {
  const { text, voiceId } = req.body;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.error('[TTS] ElevenLabs API key not configured');
    return res.status(500).json({ 
      success: false, 
      error: 'TTS service not configured' 
    });
  }
  
  if (!text || !voiceId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: text and voiceId' 
    });
  }
  
  try {
    console.log(`[TTS] Generating speech for ${text.length} characters`);
    
    const resp = await fetch(`${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`[TTS] ElevenLabs API error: ${resp.status}`, errorText);
      throw new Error(`ElevenLabs API error: ${resp.status}`);
    }
    
    const buffer = await resp.arrayBuffer();
    console.log(`[TTS] Generated ${buffer.byteLength} bytes of audio`);
    
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('[TTS] Proxy error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'TTS generation failed' 
    });
  }
});

router.get('/voices', async (_req: Request, res: Response) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      success: false, 
      error: 'TTS service not configured' 
    });
  }
  
  try {
    const resp = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
      headers: {
        'xi-api-key': apiKey
      }
    });
    
    if (!resp.ok) {
      throw new Error(`Failed to fetch voices: ${resp.status}`);
    }
    
    const data = await resp.json();
    res.json({ success: true, voices: data.voices });
  } catch (err) {
    console.error('[TTS] Voices fetch error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch voices' 
    });
  }
});

export default router;
