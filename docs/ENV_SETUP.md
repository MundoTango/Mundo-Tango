# Environment Setup for Audio Conversation Feature

## Required Environment Variables

Add these variables to your `.env` file to enable audio conversation functionality:

### ElevenLabs Configuration

```env
# ElevenLabs API Key (required for text-to-speech)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# ElevenLabs Voice ID (optional, defaults to Adam)
# Visit https://elevenlabs.io/app/agents/voice-lab to select or create a voice
ELEVENLABS_VOICE_ID=your_voice_id_here
```

### Groq Configuration

```env
# Groq API Key (required for speech-to-text transcription)
# Using Whisper-large-v3 model
GROQ_API_KEY=your_groq_api_key_here
```

## How to Get API Keys

### ElevenLabs API Key

1. Go to https://elevenlabs.io
2. Sign up or log in to your account
3. Navigate to Profile → API Keys
4. Generate a new API key
5. Copy and paste into your `.env` file

### ElevenLabs Voice ID

1. Go to https://elevenlabs.io/app/agents/voice-lab
2. Browse or create a custom voice
3. Copy the Voice ID from the URL or voice settings
4. Add to `.env` file (optional - defaults to "Adam" if not set)

### Groq API Key

1. Go to https://console.groq.com
2. Sign up or log in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste into your `.env` file

## Server Setup

### Register Audio Routes

Add the following to `server/routes.ts`:

```typescript
import audioConversationRoutes from './routes/audioConversation';

// In registerRoutes function, add:
app.use('/api/mrblue/audio', audioConversationRoutes);
```

## Frontend Setup

### Add AudioConversationButton to Your App

The button is available in two variants:

#### Floating Button (Recommended for God User)

Add to `App.tsx` or `PageLayout.tsx`:

```typescript
import { AudioConversationButton } from '@/components/AudioConversationButton';

// In your component:
<AudioConversationButton variant="floating" />
```

This creates a floating microphone button in the bottom-right corner, accessible from any page.

#### Inline Button

For integration into specific pages:

```typescript
<AudioConversationButton 
  variant="inline" 
  onTranscription={(text) => console.log('User said:', text)}
  onResponse={(text, audioUrl) => console.log('Mr. Blue replied:', text)}
/>
```

## Testing the Feature

1. Start the server with environment variables configured
2. Log in as a user with tier 5 or higher (required for voice access)
3. Click the microphone button
4. Grant browser permission for microphone access
5. Speak your message
6. Click again to stop recording
7. Listen to Mr. Blue's response

## Tier Requirements

- **Basic users (tier 0-4)**: Cannot access audio conversation
- **Pro users (tier 5+)**: Full audio conversation access
- **Premium users (tier 6+)**: Voice cloning features
- **Elite users (tier 7+)**: Autonomous coding with voice
- **God user (tier 8+)**: Unlimited audio conversations

## Troubleshooting

### "Microphone Error" Toast

- Check browser permissions (chrome://settings/content/microphone)
- Ensure HTTPS connection (microphone requires secure context)
- Try a different browser

### "Session Error" or "Processing Error"

- Verify `ELEVENLABS_API_KEY` is set correctly
- Verify `GROQ_API_KEY` is set correctly
- Check server logs for detailed error messages
- Ensure you're logged in with sufficient tier level

### Audio Not Playing

- Check browser audio settings
- Try refreshing the page
- Verify ElevenLabs API has credit/quota available

## Cost Optimization

- **Transcription**: Using Groq Whisper (faster and cheaper than alternatives)
- **TTS**: Using ElevenLabs Turbo v2 (optimized for real-time)
- **Session Management**: Automatic timeout after inactivity
- **Rate Limiting**: Tier-based limits prevent runaway costs

## Security Considerations

- All audio routes require authentication (`requireAuth` middleware)
- CSRF protection enabled for state-changing endpoints
- Session validation ensures users can only access their own conversations
- Audio files are processed in-memory (not persisted to disk)
- Tier-based access control prevents abuse

## RBAC Implementation

Mr. Blue audio conversations respect Role-Based Access Control:

- **Basic users**: Access to personal data, public data, and friend-shared data
- **God user**: Full access to all data in Mundo Tango (for UX walkthroughs)
- Click tracking automatically associates with user's session
- All database queries filter by user permissions

See `MB.MD` for complete RBAC specifications.
