# Environment Configuration for Audio Conversation

## Required Environment Variables

Add these to your `.env` file:

```bash
# ElevenLabs API Configuration
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here

# Groq API (may already exist)
GROQ_API_KEY=your_groq_api_key
```

## Getting ElevenLabs Credentials

### API Key
1. Go to https://elevenlabs.io/
2. Sign in to your account
3. Navigate to Profile → API Keys
4. Copy your API key

### Voice ID (Voice Lab)
1. Go to https://elevenlabs.io/app/agents/voice-lab
2. Select your chosen voice
3. Click on the voice to see details
4. Copy the Voice ID from the URL or settings panel
5. Alternatively, use the default voice ID

## Testing Configuration

After adding environment variables, restart the application and test:

```bash
# Test backend endpoint
curl -X POST http://localhost:3000/api/mrblue/audio/start \\
  -H "Content-Type: application/json"

# Should return: {"success": true, "sessionId": "audio_..."}
```

## Troubleshooting

**Issue**: "ELEVENLABS_API_KEY is not defined"
- Solution: Verify .env file has the correct key
- Solution: Restart Replit application after adding key

**Issue**: "ElevenLabs API error: 401"
- Solution: Check API key is valid
- Solution: Verify API key has proper permissions

**Issue**: "Voice not found"
- Solution: Verify ELEVENLABS_VOICE_ID is correct
- Solution: Try using a different voice ID from Voice Lab

