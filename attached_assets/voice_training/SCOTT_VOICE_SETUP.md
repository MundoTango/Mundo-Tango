# Scott Boddye Voice Clone Setup

## Status: READY FOR API KEY UPGRADE

### Current Status
- ✅ Audio samples prepared (2.5 min of clean audio)
- ✅ Training files organized in `attached_assets/voice_training/`
- ❌ Voice clone creation BLOCKED: API key missing `voices_write` permission

### Required Action
**Upgrade ElevenLabs plan to Creator ($22/mo) or higher**

Once upgraded, run this command to create Scott's voice:

```bash
cd attached_assets/voice_training

curl -X POST https://api.elevenlabs.io/v1/voices/add \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "name=Scott Boddye - Mundo Tango" \
  -F "files=@sample_1.mp3" \
  -F "files=@sample_2.mp3" \
  -F "files=@sample_3.mp3" \
  -F "files=@sample_4.mp3" \
  -F "files=@sample_5.mp3" \
  -F "description=Scott 'Skoot' Boddye - Founder of Mundo Tango. Warm, approachable, expressive teaching style."
```

### Expected Response
```json
{
  "voice_id": "voice_abc123xyz...",
  "name": "Scott Boddye - Mundo Tango"
}
```

### Next Steps After Voice Creation
1. Copy the `voice_id` from the response
2. Set environment variable: `SCOTT_VOICE_ID=voice_abc123xyz`
3. Restart the application
4. Test voice generation in Mr Blue Studio → Voice tab

### Training Audio Files
- **sample_1.mp3** - 30 seconds (Podcast excerpt 1)
- **sample_2.mp3** - 30 seconds (Podcast excerpt 2)
- **sample_3.mp3** - 30 seconds (Podcast excerpt 3)
- **sample_4.mp3** - 30 seconds (Podcast excerpt 4)
- **sample_5.mp3** - 30 seconds (Podcast excerpt 5)
- **scott_podcast.mp3** - 25 minutes (Full podcast - backup)

**Total Training Time:** 2.5 minutes (optimal for ElevenLabs)
**Audio Quality:** 128kbps MP3, 44.1kHz stereo
**Source:** Humans of Tango Podcast - "Free Heeling with Scott Boddye"

### Voice Characteristics
- Warm, approachable tone
- Expressive, passionate about tango
- Clear articulation
- Teaching/conversational style
- Natural inflection and pacing

