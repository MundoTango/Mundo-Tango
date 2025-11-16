# Mr Blue Voice Cloning System (System 5)

Complete voice cloning integration for Mr Blue using ElevenLabs API with support for 17 languages.

## Architecture

### Backend Services

1. **VoiceCloningService.ts** - Core voice cloning service
   - ElevenLabs API integration
   - Voice model management (create, list, delete)
   - Multi-language TTS generation (17 languages)
   - Audio streaming support
   - User voice ID management

2. **VoiceTrainer.ts** - Training workflow management
   - Session tracking and progress monitoring
   - Background training execution
   - Status reporting
   - Error handling and recovery

3. **VoiceIntegration.ts** - Integration helper
   - Automatic voice selection (custom or default)
   - Video conference audio generation
   - Batch message generation
   - Voice info retrieval

### API Routes (`/api/mrblue/voice/`)

- `POST /train` - Start voice training from audio URLs
- `GET /status/:sessionId` - Get training session status
- `GET /status` - Get all user training sessions
- `POST /generate` - Generate speech from text
- `POST /generate-stream` - Generate streaming speech
- `GET /samples` - List available voice samples
- `GET /languages` - Get supported languages
- `DELETE /:voiceId` - Delete a voice model
- `DELETE /cancel/:sessionId` - Cancel training session

### Frontend Component

**VoiceCloning.tsx** - Complete voice cloning UI
- Voice training form with multiple URL inputs
- Real-time training progress monitoring
- Voice testing with language selection
- Sample management
- Preview and playback

## Supported Languages (17)

English, Spanish, French, German, Italian, Portuguese, Polish, Turkish, Russian, Dutch, Czech, Arabic, Chinese, Japanese, Korean, Hindi, Indonesian

## Usage

### 1. Training a Voice

```typescript
// Backend
const session = await voiceTrainer.startTraining(
  userId,
  "My Professional Voice",
  [
    "https://youtube.com/watch?v=xxx",
    "https://podbean.com/episode/xxx",
  ],
  "Voice for professional presentations"
);

// Frontend - Automatic via UI
```

### 2. Generating Speech

```typescript
// Using user's custom voice (automatically selected)
const result = await voiceIntegration.generateChatMessage({
  userId: 15,
  text: "Hello! This is Mr Blue speaking in your voice.",
  language: "en",
  streaming: false,
});

// Or specify a voice ID
const result = await voiceCloningService.generateSpeech(
  voiceId,
  text,
  {
    model_id: 'eleven_multilingual_v2',
    language: 'es', // Spanish
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    }
  }
);
```

### 3. Video Conference Integration

```typescript
// Generate audio for Daily.co call
const { audioUrl } = await voiceIntegration.generateVideoConferenceAudio({
  userId: 15,
  text: "Let's discuss your project!",
  language: "en",
});

// Use audioUrl in Daily.co call
```

### 4. Checking Voice Status

```typescript
// Check if user has custom voice
const hasVoice = await voiceIntegration.hasCustomVoice(userId);

// Get voice details
const info = await voiceIntegration.getUserVoiceInfo(userId);
// { hasCustomVoice: true, voiceId: "...", voiceName: "..." }
```

## Database Integration

The system uses the existing `users` table:
- `customVoiceId` - Stores the user's ElevenLabs voice ID

Voice quota tracking uses `godLevelQuotas` table:
- `voiceQuotaUsed` - Number of voice operations used
- `voiceQuotaLimit` - Maximum voice operations allowed
- `quotaResetDate` - When quota resets

## Training Workflow

1. **Downloading** (10% progress)
   - Downloads audio from YouTube/podcast URLs using yt-dlp
   - Handles multiple URL types (YouTube, Podbean, direct MP3)

2. **Processing** (40% progress)
   - Extracts clean voice samples using ffmpeg
   - Skips first 30 seconds (intros)
   - Takes 2-minute samples from each source

3. **Training** (60% progress)
   - Submits samples to ElevenLabs API
   - Creates voice clone with metadata
   - Stores voice ID in user profile

4. **Completed** (100% progress)
   - Voice available for TTS generation
   - Auto-selected for user's Mr Blue conversations

## Error Handling

- **No API Key**: Returns clear error message
- **Download Failures**: Continues with other URLs
- **Training Failures**: Captured in session status
- **Invalid URLs**: Validates and reports specific errors
- **Quota Exceeded**: Can be integrated with quota system

## Testing

The system can be tested using:

1. **Training Test**
```bash
curl -X POST http://localhost:5000/api/mrblue/voice/train \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "voiceName": "Test Voice",
    "audioUrls": ["https://youtube.com/watch?v=xxx"]
  }'
```

2. **Generation Test**
```bash
curl -X POST http://localhost:5000/api/mrblue/voice/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "language": "en"
  }'
```

## Production Considerations

1. **Audio Processing**: Requires yt-dlp and ffmpeg on server
2. **Storage**: Voice samples cleaned up after training
3. **Rate Limiting**: ElevenLabs API has rate limits
4. **Costs**: Voice cloning + TTS costs on ElevenLabs plan
5. **Privacy**: Voice data handling according to GDPR

## Integration Points

- **Chat System**: Use `voiceIntegration.generateChatMessage()` for chat TTS
- **Video Calls**: Use `voiceIntegration.generateVideoConferenceAudio()` for Daily.co
- **Mr Blue Responses**: Automatic voice selection in conversations
- **Multi-language**: Supports all 17 languages seamlessly

## Future Enhancements

- [ ] Voice similarity metrics
- [ ] Voice style presets (professional, casual, excited)
- [ ] Real-time voice morphing in calls
- [ ] Voice emotion control
- [ ] Multi-speaker conversations
- [ ] Voice backup/restore
