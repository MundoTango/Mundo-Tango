# 🎬 Mr. Blue Dynamic Video Avatar System

## Overview
A comprehensive Pixar-style AI companion with 10 expression states powered by Luma Dream Machine.

## 🎭 Expression States

| State | Description | Loop | Cost |
|-------|-------------|------|------|
| **idle** | Relaxed friendly smile, gentle breathing | ✅ | $0.40 |
| **listening** | Attentive focused expression, slight head tilt | ✅ | $0.40 |
| **speaking** | Animated expressive face, mouth forming words | ✅ | $0.40 |
| **happy** | Big genuine smile, joyful eyes | ✅ | $0.40 |
| **thinking** | Contemplative expression, hand on chin | ✅ | $0.40 |
| **excited** | Wide enthusiastic smile, sparkling eyes | ✅ | $0.40 |
| **surprised** | Eyes wide open, eyebrows raised high | ✅ | $0.40 |
| **nodding** | Agreeable head nod, supportive smile | ✅ | $0.40 |
| **walk-left** | Walking left across frame, smooth stride | ❌ | $0.40 |
| **walk-right** | Walking right across frame, smooth stride | ❌ | $0.40 |

**Total Cost:** ~$4.00 for all 10 states

## 📁 File Structure

```
server/
  services/lumaVideoService.ts      # Video generation service with generateMrBlueState()
  routes/mrblue-video-routes.ts     # API routes for video generation
  routes.ts                          # Routes registration

client/
  src/hooks/useVideoStateManager.ts # State management hook
  public/videos/states/              # Generated videos directory
    idle.mp4
    listening.mp4
    speaking.mp4
    happy.mp4
    thinking.mp4
    excited.mp4
    surprised.mp4
    nodding.mp4
    walk-left.mp4
    walk-right.mp4
```

## 🚀 API Endpoints

### Generate Single State
```bash
POST /api/mrblue/generate-state/:state

# Example
curl -X POST http://localhost:5000/api/mrblue/generate-state/happy
```

Response:
```json
{
  "success": true,
  "generationId": "abc123",
  "state": "pending",
  "videoState": "happy",
  "message": "Mr. Blue happy video generation started!"
}
```

### Generate All States (Batch)
```bash
POST /api/mrblue/generate-all-states

curl -X POST http://localhost:5000/api/mrblue/generate-all-states
```

Response:
```json
{
  "success": true,
  "message": "Started 10/10 video generations",
  "generations": [
    { "state": "idle", "generationId": "abc123", "status": "pending" },
    ...
  ],
  "estimatedCost": "$4.00",
  "estimatedTime": "~2 minutes per video"
}
```

### Check Generation Status
```bash
GET /api/mrblue/check-generation/:generationId?videoState=happy

curl http://localhost:5000/api/mrblue/check-generation/abc123?videoState=happy
```

Response (completed):
```json
{
  "success": true,
  "state": "completed",
  "videoPath": "/videos/states/happy.mp4",
  "generationId": "abc123",
  "videoState": "happy"
}
```

## 💻 Usage in Components

### Basic State Management
```tsx
import { useVideoStateManager } from '@/hooks/useVideoStateManager';

function MyComponent() {
  const {
    currentState,
    transitionTo,
    getVideoPath,
    
    // Convenience methods
    startListening,
    startSpeaking,
    showHappy,
    showThinking,
    returnToIdle
  } = useVideoStateManager({
    defaultState: 'idle',
    onStateChange: (state) => console.log('State changed to:', state)
  });

  return (
    <div>
      <video src={getVideoPath()} autoPlay loop />
      
      <button onClick={() => showHappy(3000)}>
        Show Happy (3s then return to idle)
      </button>
      
      <button onClick={() => startListening()}>
        Start Listening
      </button>
      
      <button onClick={() => startSpeaking(5000)}>
        Speak for 5 seconds
      </button>
    </div>
  );
}
```

### Advanced Usage with Auto-Transitions
```tsx
const videoStateManager = useVideoStateManager();

// User hovers Mr. Blue
const handleHover = () => {
  videoStateManager.showHappy(2000); // Happy for 2s, then auto-idle
};

// User clicks Mr. Blue
const handleClick = () => {
  videoStateManager.walkRight(); // Walk right
  setTimeout(() => {
    // Open chat and start listening
    openChat();
    videoStateManager.startListening();
  }, 2000);
};

// AI starts responding
const handleAIResponse = () => {
  videoStateManager.startSpeaking(5000); // Speak for 5s
};

// Conversation ends
const handleChatClose = () => {
  videoStateManager.returnToIdle();
};
```

## 🎬 Generation Workflow

### 1. Generate All Videos (One-Time Setup)
```bash
# Start all 10 video generations
curl -X POST http://localhost:5000/api/mrblue/generate-all-states
```

### 2. Monitor Progress
```bash
# Check each generation status (replace with actual IDs)
curl http://localhost:5000/api/mrblue/check-generation/[GEN_ID]?videoState=idle
curl http://localhost:5000/api/mrblue/check-generation/[GEN_ID]?videoState=listening
# ... etc
```

### 3. Auto-Download
Videos automatically download to `client/public/videos/states/` when complete!

## 🎨 State Prompts

Each state has a carefully crafted prompt:

**Base Character:**
> Pixar-style AI companion character with bright turquoise mohawk hairstyle, wearing teal floral blazer with silver jewelry

**Idle:**
> ...relaxed friendly smile, gentle breathing animation, subtle eye blinks, calm demeanor, soft lighting, seamless loop

**Listening:**
> ...attentive focused expression, slight head tilt, eyes tracking with interest, engaged body language, subtle nod, seamless loop

**Speaking:**
> ...animated expressive face, mouth forming words, hand gestures for emphasis, energetic but professional, eyes bright, seamless loop

## 📊 Cost Optimization

- **Luma Ray-2 Model:** $0.40 per video
- **Aspect Ratio:** 1:1 (optimal for avatar display)
- **Duration:** 5 seconds per loop
- **Quality:** 720p
- **Loops:** All states loop except walk-left/walk-right

## 🔧 Next Steps

1. **✅ DONE:** Infrastructure built, API routes ready
2. **TODO:** Integrate with MrBlueAvatarVideo component
3. **TODO:** Connect to chat interactions
4. **TODO:** Add walking animation across bottom of screen
5. **TODO:** Implement audio/text response toggle
6. **TODO:** E2E testing of all states

## 🎯 User Interaction Flow

```
idle (page load)
  ↓ (user hovers)
happy (2 seconds)
  ↓ (auto-timeout)
idle
  ↓ (user clicks)
walk-right (2 seconds)
  ↓ (chat opens)
listening (waiting for user)
  ↓ (user types message)
listening (processing)
  ↓ (AI responds)
speaking (5 seconds)
  ↓ (response complete)
idle
```

## 🚨 Important Notes

- **Luma Credits Required:** Ensure sufficient credits before batch generation
- **Generation Time:** ~2 minutes per video (20 minutes total for all 10)
- **Fallback:** System gracefully falls back to 2D canvas if videos unavailable
- **Auto-Save:** Videos automatically download when generation completes
- **State Persistence:** Videos stored permanently in /videos/states/

---

**System Status:** ✅ Infrastructure Complete | ⏳ Video Generation Pending
