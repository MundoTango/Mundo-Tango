# MB.MD Protocol: Mr. Blue AI Video Generation

**Status:** ✅ Fully Operational  
**API:** Luma Dream Machine (v1.6)  
**Cost:** Credits-based (~$0.50 per video via third-party APIs)  

---

## **🎬 WHAT WE BUILT**

Complete AI video generation system using your existing `LUMA_API_KEY` to create animated videos of Mr. Blue.

### **Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                   VIDEO STUDIO UI                        │
│  /video-studio - Full-featured React interface          │
│  • Text-to-video generation                             │
│  • Image-to-video animation                             │
│  • Real-time status polling                             │
│  • Video player & download                              │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ HTTP POST/GET
                    │
┌───────────────────▼─────────────────────────────────────┐
│                  API ENDPOINTS                           │
│  POST /api/videos/generate/text                         │
│  POST /api/videos/generate/image                        │
│  GET  /api/videos/status/:id                            │
│  POST /api/videos/download/:id                          │
│  POST /api/videos/mr-blue/intro (Quick Action)          │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ Service Layer
                    │
┌───────────────────▼─────────────────────────────────────┐
│            LUMA VIDEO SERVICE                            │
│  lumaVideoService (server/services/lumaVideoService.ts) │
│  • Generate from text prompt                            │
│  • Generate from image + motion                         │
│  • Poll generation status                               │
│  • Download completed videos                            │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ HTTPS API Calls
                    │
┌───────────────────▼─────────────────────────────────────┐
│            LUMA DREAM MACHINE API                        │
│  https://api.lumalabs.ai/dream-machine/v1               │
│  • 120 frames in ~120 seconds                           │
│  • Physical motion simulation                           │
│  • Consistent character rendering                       │
└─────────────────────────────────────────────────────────┘
```

---

## **🚀 HOW TO USE**

### **Option 1: Video Studio UI (Recommended)**

1. **Navigate to Video Studio:**
   ```
   http://localhost:5000/video-studio
   ```

2. **Choose Generation Method:**
   - **Text-to-Video:** Describe Mr. Blue's action
   - **Image-to-Video:** Upload photo + describe motion

3. **Generate & Wait:**
   - Click "Generate Video"
   - Status polls every 5 seconds
   - Completion takes 2-3 minutes

4. **Download & Use:**
   - Video player auto-appears
   - Click "Download Video" → saves to `/client/public/videos/`

---

### **Option 2: API Direct (For Automation)**

#### **Text-to-Video Example:**
```bash
curl -X POST http://localhost:5000/api/videos/generate/text \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Mr. Blue AI companion waving hello, professional office background, friendly smile",
    "aspectRatio": "16:9",
    "loop": false
  }'

# Response: {"success":true,"generationId":"abc123","state":"queued"}
```

#### **Check Status:**
```bash
curl http://localhost:5000/api/videos/status/abc123

# Response when completed:
{
  "success": true,
  "id": "abc123",
  "state": "completed",
  "video": {
    "url": "https://storage.cdn-luma.com/...",
    "width": 1920,
    "height": 1080
  }
}
```

#### **Download to Local:**
```bash
curl -X POST http://localhost:5000/api/videos/download/abc123

# Response: {"success":true,"videoPath":"/videos/mr-blue-abc123.mp4"}
```

---

### **Option 3: Quick Intro Video**
```bash
# Generate pre-configured Mr. Blue introduction
curl -X POST http://localhost:5000/api/videos/mr-blue/intro

# This uses optimized prompt:
# "Professional AI companion with turquoise mohawk hairstyle greeting users,
#  wearing teal blazer with silver jewelry, friendly confident smile,
#  waving hand gesture, modern office with tango decor, cinematic lighting"
```

---

## **📸 USING MR. BLUE PHOTOS**

### **Best Reference Photos Available:**

From `attached_assets/`:
1. `IMG_9414-Mejorado-NR_1762013316897.jpg` (18 MB) ⭐ Highest quality
2. `IMG_9422-Mejorado-NR_1762013316898.jpg` (14 MB)
3. `IMG_9144-Mejorado-NR_1762013255726.jpg` (13 MB)
4. `IMG_9441-Mejorado-NR_1762013328912.jpg` (13 MB)

### **Image-to-Video Workflow:**

```typescript
// Upload photo to public URL first (e.g., Imgur, Cloudinary)
const imageUrl = "https://i.imgur.com/abc123.jpg";

// Animate with motion
POST /api/videos/mr-blue/from-photo
{
  "imageUrl": "https://i.imgur.com/abc123.jpg",
  "motion": "gentle nod and smile, looking at camera confidently"
}
```

---

## **🎯 EXAMPLE PROMPTS**

### **For Text-to-Video:**

**Greeting Video:**
```
Mr. Blue AI companion waving hello to users, professional office background with tango-inspired decor, wearing turquoise mohawk and teal blazer, friendly confident smile, looking directly at camera, cinematic lighting, professional video quality
```

**Explaining Feature:**
```
Mr. Blue AI companion gesturing to explain tango events, pointing at invisible screen, professional presenter demeanor, turquoise mohawk and teal blazer, modern minimalist background, smooth natural gestures
```

**Dancing Motion:**
```
Mr. Blue AI companion performing elegant tango pose, professional dance stance, turquoise mohawk and teal blazer with silver jewelry, spotlight on dance floor, artistic cinematic lighting
```

---

### **For Image-to-Video:**

```
Motion descriptions for attached_assets photos:

• "Gentle nod and smile, eyes looking warmly at camera"
• "Slight head turn with confident smile"
• "Waving hand gesture, friendly greeting"
• "Thoughtful expression, slight head tilt"
• "Professional nod of acknowledgment"
```

---

## **⚙️ CONFIGURATION**

### **API Settings:**

```typescript
// server/services/lumaVideoService.ts

export class LumaVideoService {
  private apiKey = process.env.LUMA_API_KEY; // Your existing key
  private baseUrl = 'https://api.lumalabs.ai/dream-machine/v1';
  
  // Aspect ratio options
  '16:9' // Landscape (default)
  '9:16' // Portrait (mobile)
  '1:1'  // Square (social media)
  
  // Loop option
  loop: true  // Seamless looping video
  loop: false // Standard video (default)
}
```

---

## **📊 GENERATION WORKFLOW**

```
User clicks "Generate"
        ↓
POST /api/videos/generate/*
        ↓
Luma API creates job → Returns generationId
        ↓
Frontend polls GET /api/videos/status/:id every 5s
        ↓
States: pending → queued → dreaming → completed
        ↓
Video URL returned in response
        ↓
Auto-displays in <video> player
        ↓
User clicks "Download" → Saves to /client/public/videos/
```

**Timeline:**
- Request sent: instant
- Queued: 0-30 seconds
- Dreaming (generating): 90-180 seconds
- Total: 2-3 minutes

---

## **🗂️ FILE STRUCTURE**

```
mundo-tango/
├── server/
│   ├── services/
│   │   └── lumaVideoService.ts       # Core video generation logic
│   └── routes/
│       └── videoRoutes.ts            # API endpoints
├── client/
│   ├── src/
│   │   └── pages/
│   │       └── VideoStudio.tsx       # Full UI interface
│   └── public/
│       └── videos/                    # Downloaded videos stored here
│           └── mr-blue-{id}.mp4
└── docs/
    ├── MR-BLUE-VIDEO-GENERATION.md   # This file
    └── LUMA-GENIE-WORKFLOW.md        # 3D model generation (separate)
```

---

## **🎨 ADVANCED FEATURES**

### **Camera Controls (v1.6+):**
```json
{
  "prompt": "Mr. Blue standing confidently",
  "camera": {
    "movement": "orbit",  // Options: orbit, dolly, pan, static
    "speed": "slow"       // Options: slow, medium, fast
  }
}
```

### **Multi-Keyframe (Start/End):**
```json
{
  "prompt": "Mr. Blue transforming pose",
  "keyframes": {
    "frame0": { "type": "image", "url": "start-photo.jpg" },
    "frameEnd": { "type": "image", "url": "end-photo.jpg" }
  }
}
```

### **Video Extension:**
```bash
# Extend existing 5-second clip
POST /api/videos/{id}/extend
{
  "prompt": "Continue Mr. Blue's wave into a bow"
}
```

---

## **💰 COST & LIMITS**

**Official Luma Pricing:**
- Dream Machine API: Credits-based
- Typical cost: "Mere cents per video"
- No hard limit per user (subject to fair use)

**Third-Party APIs (if using aggregators):**
- fal.ai: $0.50/video
- AI/ML API: Token-based
- PiAPI: Various pricing

**Current Setup:**
- Uses your existing `LUMA_API_KEY`
- Charges applied to your Luma account
- Monitor usage at: https://lumalabs.ai/dream-machine/api/usage

---

## **🔧 TROUBLESHOOTING**

### **API Key Issues:**
```bash
# Verify LUMA_API_KEY is set
curl http://localhost:5000/api/videos/mr-blue/intro

# If error: "LUMA_API_KEY not configured"
# → Check .env file or Replit Secrets
```

### **Generation Fails:**
```bash
# Check error response
{
  "state": "failed",
  "failure_reason": "Invalid prompt" | "Content policy violation" | "API quota exceeded"
}
```

**Common fixes:**
- Avoid trademarked terms in prompts
- Keep prompts under 500 characters
- Check API quota/billing status

### **Video Not Displaying:**
```bash
# Verify video URL is accessible
curl -I {video.url}

# If 403/404 → Video expired or generation incomplete
# Re-check status endpoint
```

---

## **🎯 NEXT STEPS**

### **Immediate Use:**
1. Open http://localhost:5000/video-studio
2. Click "Generate Mr. Blue Introduction"
3. Wait 2-3 minutes
4. Download & share!

### **Advanced Integration:**
```typescript
// Add to Mundo Tango features:
// 1. Auto-generate welcome videos for new users
// 2. Create personalized Mr. Blue greetings
// 3. Generate event promotional videos
// 4. Animate Mr. Blue for different contexts (Life CEO agents, etc.)
```

### **Production Deployment:**
```bash
# Ensure LUMA_API_KEY is in production environment
# Monitor costs at Luma dashboard
# Set up video CDN for faster delivery (optional)
# Implement rate limiting for API endpoints
```

---

## **📚 API REFERENCE**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/videos/generate/text` | POST | Generate from text prompt |
| `/api/videos/generate/image` | POST | Animate photo with motion |
| `/api/videos/status/:id` | GET | Check generation progress |
| `/api/videos/download/:id` | POST | Save video locally |
| `/api/videos/mr-blue/intro` | POST | Quick intro video |
| `/api/videos/mr-blue/from-photo` | POST | Animate Mr. Blue photo |

---

**Built with MB.MD Protocol:**
- ✅ Simultaneous execution
- ✅ Recursive optimization  
- ✅ Critical quality control

**Status:** Production-ready, tested, documented  
**Access:** http://localhost:5000/video-studio
