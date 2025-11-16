# QUICK START - Scott's Voice Clone

## Current Status
✅ All infrastructure ready  
⏸️ Waiting for ElevenLabs API upgrade

## To Complete Setup (After Upgrading to Creator Plan)

### 1. Create Voice Clone (5 min)
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
  -F "description=Scott 'Skoot' Boddye - Founder of Mundo Tango."
```

### 2. Set Environment Variable (1 min)
```bash
# Copy voice_id from response, then:
echo "SCOTT_VOICE_ID=<your_voice_id>" >> .env
```

### 3. Test Voice (2 min)
```bash
tsx server/scripts/test-scott-voice.ts
```

### 4. Verify in UI
- Open Mr Blue Studio → Voice tab
- Check "Scott's Voice" status
- Generate test audio

## Files Ready for Training
- ✅ 5 audio samples (2.5 min total)
- ✅ High-quality podcast source (25 min backup)
- ✅ Service integration complete
- ✅ Test scripts ready

## Documentation
- Full guide: `SYSTEM_5_VOICE_CLONING_COMPLETE.md`
- Setup details: `SCOTT_VOICE_SETUP.md`
- Test script: `server/scripts/test-scott-voice.ts`

## Support
For questions, see complete documentation in this directory.
