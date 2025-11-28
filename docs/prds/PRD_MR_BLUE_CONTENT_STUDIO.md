# PRD: Mr Blue AI Content Studio Enhancement
**Version:** 1.0  
**Created:** November 17, 2025  
**Author:** Mundo Tango Development Team  
**Status:** Implementation Ready

---

## 1. EXECUTIVE SUMMARY

### 1.1 Vision
Transform Mr Blue Studio into a comprehensive AI content creation powerhouse by integrating best-in-class AI services for 3D modeling (Meshy), video generation (Luma Dream Machine), and avatar creation (HeyGen) into a unified interface.

### 1.2 Current State
Mr Blue Studio currently has 6 tabs:
- Video Call (Daily.co) - Real-time video conferencing ✅
- Text Chat - AI conversation with context awareness ✅
- Vibe Coding - Natural language to code generation ✅
- Voice (ElevenLabs) - Voice cloning and TTS ✅
- Messenger - Facebook integration ✅
- Memory - LanceDB-powered conversation history ✅

### 1.3 The Gap
Users need separate tools for:
- 3D model creation (Meshy.ai - $60/mo)
- AI video generation (Luma - $100/mo)
- Avatar video creation (HeyGen - $100/mo)

**Total external cost:** $260/month + context switching overhead

### 1.4 The Solution
Add 2 new tabs to Mr Blue Studio:
- **Tab 7: 3D Creator** (Meshy integration)
- **Tab 8: AI Video Studio** (Luma + HeyGen integration)

**Benefits:**
- ✅ Unified UX (no app switching)
- ✅ 80-90% cost savings via AI Arbitrage ($260/mo → $26-52/mo)
- ✅ Seamless integration with existing Mr Blue features
- ✅ Multi-modal content creation in one place

---

## 2. CURRENT STATE ANALYSIS

### 2.1 Existing Mr Blue Architecture

**Frontend:** `client/src/components/mr-blue/MrBlueStudio.tsx`
- Tab-based interface using shadcn Tabs component
- Persistent 3D avatar (Pixar style, 6 emotional states)
- Real-time status monitoring
- Context sharing between tabs

**Backend Services:**
- `server/services/mrBlue/ContextService.ts` - LanceDB semantic search
- `server/services/mrBlue/VideoConferenceService.ts` - Daily.co integration
- `server/services/mrBlue/VibeCodingService.ts` - GROQ Llama-3.1-70b code generation
- `server/services/mrBlue/VoiceCloningService.ts` - ElevenLabs integration
- `server/services/mrBlue/MessengerService.ts` - Facebook integration
- `server/services/mrBlue/MemoryService.ts` - LanceDB conversation history

**API Routes:** `/api/mrblue/*` (35+ endpoints)

**Database Tables:**
- `mrBlueContextDocs`, `mrBlueConversations`, `mrBlueCodeGenerations`, `vibeCodingJobs`, `messengerConnections`, `messengerMessages`, `userMemories`, `conversationSummaries`

### 2.2 User Pain Points Solved

**Pain Point 1:** "I need to create 3D models for my tango event posters"
- Current: Use Meshy.ai separately ($60/mo), export, upload to Mundo Tango
- Solution: Generate 3D models directly in Mr Blue, auto-save to Media Gallery

**Pain Point 2:** "I want to create promotional videos for my tango classes"
- Current: Use Luma separately ($100/mo), HeyGen separately ($100/mo)
- Solution: Text-to-video in Mr Blue AI Video Studio, one click

**Pain Point 3:** "I need an AI avatar to represent me in videos"
- Current: Upload photo to HeyGen, wait, download, upload to MT
- Solution: Photo-to-avatar in Mr Blue, instant integration with profile

### 2.3 Integration Opportunities

**Existing Feature Synergies:**
- Voice cloning (System 5) ✅ → Use for HeyGen avatar voices
- Context Service (System 1) ✅ → RAG-enhanced 3D/video prompts
- Media Gallery ✅ → Auto-save generated assets
- User Profile ✅ → Store preferred styles, avatars
- BullMQ ✅ → Background job processing for long generations

---

## 3. FEATURE SPECIFICATIONS

### 3.1 Tab 7: 3D Creator (Meshy Integration)

#### 3.1.1 Text-to-3D Model Generation

**User Story:** As a tango teacher, I want to generate 3D models from text descriptions for my event graphics.

**Feature:**
- Input: Natural language prompt (e.g., "Elegant tango dancer in red dress, Argentine style")
- Output: 3D model (.FBX, .OBJ, .glTF, .USDZ, .STL)
- Model quality: Draft (5k polygons, 30s) or Production (50k-300k polygons, 2-5min)
- Preview: WebGL 3D viewer with rotation, zoom, lighting controls

**Technical Implementation:**
```typescript
// server/services/ai/MeshyService.ts
export class MeshyService {
  async textTo3D(params: {
    prompt: string;
    quality: 'draft' | 'production';
    style?: string;
  }): Promise<{
    modelId: string;
    modelUrl: string;
    format: string;
    polygonCount: number;
    generationTime: number;
  }> {
    // 1. Route via AI Arbitrage (tier-2 for quality)
    // 2. Call Meshy API with optimized parameters
    // 3. Poll for completion (async job)
    // 4. Upload to Cloudinary
    // 5. Save to generatedAssets table
    // 6. Return model URL
  }
}
```

**UI Components:**
- Text prompt input with AI enhancement (Context Service suggests improvements)
- Style presets: Realistic, Cartoon, Low-poly, Geometric, Organic
- Quality selector: Draft / Production
- Advanced options: Polycount (1k-300k), texture resolution (512-4096px)
- Progress bar with ETA
- 3D preview panel (React Three Fiber)
- Export format selector
- Save to Media Gallery button

#### 3.1.2 Image-to-3D Conversion

**User Story:** As a tango dancer, I want to convert my 2D photo into a 3D model.

**Feature:**
- Input: Upload image (JPG, PNG, WebP) or select from Media Gallery
- Multi-view support: Upload 2-4 images from different angles for better accuracy
- Output: 3D mesh with automatic texture mapping
- Proportions matching from reference images

**Technical Implementation:**
```typescript
async imageTo3D(params: {
  imageUrls: string[]; // 1-4 images
  multiViewMode: boolean;
  targetPolycount?: number;
}): Promise<{ modelId: string; modelUrl: string }> {
  // Meshy 5 multi-view processing
  // Kontext integration for better mesh fidelity
  // Automatic proportions matching
}
```

**UI Components:**
- Image upload (drag-drop or file picker)
- Multi-view angle selector (Front, Side, Back, Top)
- Alignment guides overlay
- Auto-crop and background removal
- Preview before generation
- Comparison view (2D input vs 3D output)

#### 3.1.3 Text-to-Texture Application

**User Story:** As a 3D artist, I want to apply AI-generated textures to my models.

**Feature:**
- Input: Existing 3D model + text description of texture
- Output: Model with PBR textures (Diffuse, Normal, Roughness, Metallic)
- Reference image support: Upload texture inspiration image

**Technical Implementation:**
```typescript
async applyTexture(params: {
  modelId: string;
  texturePrompt: string;
  referenceImageUrl?: string;
  pbrMaps: ('diffuse' | 'normal' | 'roughness' | 'metallic')[];
}): Promise<{ texturedModelUrl: string }> {
  // Generate PBR texture maps
  // Apply to existing model
  // Return download URLs for each map
}
```

**UI Components:**
- Model selector (from user's library or upload)
- Texture prompt input
- Reference image upload (optional)
- PBR map toggles (Diffuse, Normal, Roughness, Metallic)
- Real-time texture preview
- Before/After comparison slider

#### 3.1.4 Auto-Rigging & Animation

**User Story:** As an animator, I want to auto-rig characters for animation.

**Feature:**
- Input: 3D character model (humanoid or creature)
- Output: Fully rigged model with bone structure
- Animation library: 500+ pre-built animations
  - Dance moves (tango, salsa, waltz, contemporary)
  - Poses (standing, sitting, action poses)
  - Gestures (wave, point, clap, bow)
- Export: FBX with bones + animations

**Technical Implementation:**
```typescript
async autoRig(params: {
  modelId: string;
  rigType: 'humanoid' | 'creature' | 'custom';
}): Promise<{ riggedModelUrl: string; boneCount: number }> {
  // Meshy auto-rigging
  // Bone hierarchy generation
  // Weight painting
}

async applyAnimation(params: {
  riggedModelId: string;
  animationId: string; // From 500+ library
}): Promise<{ animatedModelUrl: string; duration: number }> {
  // Apply pre-built animation
  // Export with keyframes
}
```

**UI Components:**
- Rig type selector
- Bone visualization overlay
- Animation library browser (500+ animations)
  - Filter by category: Dance, Pose, Gesture, Action
  - Preview animation on model
  - Blend multiple animations
- Timeline editor (basic)
- Export options: FBX, glTF with animations

#### 3.1.5 Export & Integration

**Feature:**
- Export formats: FBX, OBJ, STL, USDZ, glTF, BLEND
- Direct integration:
  - Save to Media Gallery (auto-tagged as "3D Model")
  - Use in posts (embed 3D viewer)
  - Use in event graphics
  - Export to Unity/Unreal/Blender
- Sharing: Generate shareable link with WebGL viewer

**Technical:**
- Cloudinary storage for all formats
- WebGL viewer embed code generation
- Metadata: Polygon count, texture resolution, file size
- Version control: Keep generation history

---

### 3.2 Tab 8: AI Video Studio (Luma + HeyGen)

#### 3.2.1 Luma Dream Machine - Text-to-Video

**User Story:** As a tango event organizer, I want to create promotional videos from text descriptions.

**Feature:**
- Input: Text prompt (e.g., "Elegant tango dancers in Buenos Aires milonga at sunset")
- Output: 5-10 second video (1080p native, 4K upscaling available)
- Extendable: Chain multiple clips up to 60 seconds
- Camera controls: Pan, orbit, crane, push/pull, dolly
- Style: Realistic, cinematic, animated, artistic

**Technical Implementation:**
```typescript
// server/services/ai/LumaService.ts
export class LumaService {
  async textToVideo(params: {
    prompt: string;
    duration: 5 | 10; // seconds
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
    cameraMotion?: 'pan' | 'orbit' | 'crane' | 'dolly' | 'static';
    style?: 'realistic' | 'cinematic' | 'animated' | 'artistic';
    hdr?: boolean; // 16-bit HDR output
  }): Promise<{
    videoId: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    resolution: string;
  }> {
    // 1. Route via AI Arbitrage (tier-3 for quality)
    // 2. Call Luma Ray3 API
    // 3. Poll for job completion
    // 4. Upload to Cloudinary
    // 5. Generate thumbnail
    // 6. Save to generatedAssets table
  }
}
```

**UI Components:**
- Prompt input with AI enhancement
- Duration selector: 5s / 10s
- Aspect ratio: 1:1, 16:9, 9:16, 4:3
- Camera motion presets
- Style selector with preview thumbnails
- HDR toggle (16-bit output for pro workflows)
- Draft mode (faster, lower quality for iteration)
- Video preview player
- Extend video button (chain multiple clips)
- Export & download

#### 3.2.2 Luma Dream Machine - Image-to-Video

**User Story:** As a tango dancer, I want to animate my dance photos.

**Feature:**
- Input: Upload image or select from Media Gallery
- Output: 5-10 second animated video
- Animation intensity: Subtle / Medium / Dramatic
- Camera path: Zoom in/out, Pan left/right, Orbit around subject

**Technical Implementation:**
```typescript
async imageToVideo(params: {
  imageUrl: string;
  duration: 5 | 10;
  animationIntensity: 'subtle' | 'medium' | 'dramatic';
  cameraPath?: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' | 'orbit';
}): Promise<{ videoId: string; videoUrl: string }> {
  // Luma image animation
  // Natural motion generation
  // Camera path application
}
```

**UI Components:**
- Image upload/selector
- Animation intensity slider
- Camera path selector (visual preview)
- Before/After comparison
- Generate button
- Video preview

#### 3.2.3 Luma Dream Machine - Video-to-Video Modification

**User Story:** As a video editor, I want to modify existing videos with AI.

**Feature:**
- Input: Upload video or select from Media Gallery
- Modification: Natural language instructions
  - "Change dancer's dress to blue"
  - "Add sunset lighting"
  - "Make it look like a vintage film"
  - "Remove background, add Buenos Aires street"
- Output: Modified video maintaining motion

**Technical Implementation:**
```typescript
async modifyVideo(params: {
  videoUrl: string;
  instruction: string;
  referenceImageUrl?: string;
  preserveMotion: boolean;
}): Promise<{ videoId: string; videoUrl: string }> {
  // Luma Modify Video feature
  // Style transfer while preserving motion
  // Reference image conditioning
}
```

**UI Components:**
- Video upload/selector
- Instruction input (natural language)
- Reference image upload (optional)
- Motion preservation toggle
- Side-by-side comparison (original vs modified)
- Re-generate with refinements

#### 3.2.4 HeyGen Avatar IV - Photo-to-Avatar Video

**User Story:** As a tango teacher, I want to create avatar videos of myself teaching without being on camera.

**Feature:**
- Input: Upload portrait photo (or use profile photo)
- Script: Text for avatar to speak
- Voice: Use ElevenLabs cloned voice ✅ or select from 300+ voices
- Output: Realistic avatar video with lip sync and natural gestures
- Angles: Portrait, half-body, full-body
- Background: Clean, dynamic, or custom upload

**Technical Implementation:**
```typescript
// server/services/ai/HeyGenService.ts
export class HeyGenService {
  async photoToAvatarVideo(params: {
    photoUrl: string;
    script: string;
    voiceId: string; // ElevenLabs voice ID
    angle: 'portrait' | 'half_body' | 'full_body';
    background: 'clean' | 'dynamic' | 'custom';
    customBackgroundUrl?: string;
  }): Promise<{
    videoId: string;
    videoUrl: string;
    duration: number;
  }> {
    // 1. Upload photo to HeyGen
    // 2. Generate voice audio via ElevenLabs
    // 3. Create avatar video with Avatar IV
    // 4. Natural lip sync + facial expressions
    // 5. Hand gestures matching speech
    // 6. Download and upload to Cloudinary
  }
}
```

**UI Components:**
- Photo upload (or select from profile)
- Script text editor (with character count)
- Voice selector:
  - "My Cloned Voice" (ElevenLabs) ✅
  - 300+ HeyGen voices (filter by language, gender, age, accent)
  - Voice preview player
- Angle selector: Portrait / Half-body / Full-body
- Background options:
  - Clean (solid color)
  - Dynamic (contextual backgrounds)
  - Custom (upload your own)
- Generate button
- Preview player

#### 3.2.5 HeyGen Digital Twin - Full-Body Avatar

**User Story:** As a tango instructor, I want a full-body digital twin that looks and moves like me.

**Feature:**
- Input: Record 2-minute video of yourself (from multiple angles)
- Output: Full-body digital twin avatar
- Capabilities:
  - Recognizable appearance
  - Natural body language
  - Gesture matching
  - Voice synchronization (via ElevenLabs)
- Use cases: Teaching videos, event announcements, personalized messages

**Technical Implementation:**
```typescript
async createDigitalTwin(params: {
  trainingVideoUrl: string;
  userId: number;
}): Promise<{
  digitalTwinId: string;
  status: 'training' | 'ready';
  estimatedCompletionTime?: number;
}> {
  // HeyGen Digital Twin training
  // Multi-angle video processing
  // Full-body reconstruction
  // Training time: ~30 minutes
}

async generateDigitalTwinVideo(params: {
  digitalTwinId: string;
  script: string;
  voiceId: string;
  background: string;
}): Promise<{ videoId: string; videoUrl: string }> {
  // Generate video using trained digital twin
  // Full-body animations
  // Natural gestures
}
```

**UI Components:**
- Recording instructions overlay
- Webcam capture (2-minute video, multiple angles)
- Upload existing video option
- Training status tracker
- Digital twin preview
- Generate video interface (same as photo avatar)

#### 3.2.6 Stock Avatar Library

**Feature:**
- 120+ pre-built AI avatars
- Categories: Professional, Casual, Influencer, Diverse, Tango-themed
- Filters: Gender, age, ethnicity, style, profession
- Instant use (no training required)
- Customization: Outfit, tone, voice

**UI Components:**
- Avatar gallery with filters
- Preview card (avatar image, sample video)
- Quick generate: Select avatar → Enter script → Generate
- Favorite avatars for quick access

---

## 4. TECHNICAL ARCHITECTURE

### 4.1 Service Layer Design

#### 4.1.1 MeshyService.ts
```typescript
// server/services/ai/MeshyService.ts
import { ArbitrageEngine } from './ArbitrageEngine';
import { cloudinary } from '@/lib/cloudinary';
import { db } from '@/db';
import { generatedAssets, assetGenerationJobs } from '@shared/schema';

export class MeshyService {
  private arbitrageEngine: ArbitrageEngine;
  private meshyApiKey: string;
  
  constructor() {
    this.arbitrageEngine = new ArbitrageEngine();
    this.meshyApiKey = process.env.MESHY_API_KEY!;
  }
  
  async textTo3D(params: TextTo3DParams): Promise<Generated3DModel> {
    // 1. Create job record
    const [job] = await db.insert(assetGenerationJobs).values({
      userId: params.userId,
      assetType: '3d_model',
      inputPrompt: params.prompt,
      status: 'processing',
      parameters: params
    }).returning();
    
    // 2. Route via AI Arbitrage (tier-2 for quality balance)
    const modelData = await this.arbitrageEngine.execute({
      task: 'generate_3d_model',
      complexity: params.quality === 'production' ? 'high' : 'medium',
      provider: 'meshy',
      params: {
        prompt: params.prompt,
        art_style: params.style || 'realistic',
        target_polycount: params.quality === 'production' ? 100000 : 5000,
        enable_pbr: true
      }
    });
    
    // 3. Poll Meshy API for completion
    const modelUrl = await this.pollMeshyJob(modelData.task_id);
    
    // 4. Upload to Cloudinary
    const cloudinaryUpload = await cloudinary.uploader.upload(modelUrl, {
      resource_type: 'raw',
      folder: 'mundo-tango/3d-models',
      public_id: `model_${job.id}`
    });
    
    // 5. Update job and create asset record
    await db.update(assetGenerationJobs)
      .set({ status: 'completed', outputUrl: cloudinaryUpload.secure_url })
      .where(eq(assetGenerationJobs.id, job.id));
    
    const [asset] = await db.insert(generatedAssets).values({
      userId: params.userId,
      assetType: '3d_model',
      fileName: `${params.prompt.slice(0, 50)}.glb`,
      fileUrl: cloudinaryUpload.secure_url,
      metadata: {
        polygonCount: modelData.polygon_count,
        format: 'glb',
        generationTime: modelData.generation_time,
        prompt: params.prompt
      }
    }).returning();
    
    return {
      modelId: asset.id.toString(),
      modelUrl: cloudinaryUpload.secure_url,
      format: 'glb',
      polygonCount: modelData.polygon_count,
      generationTime: modelData.generation_time
    };
  }
  
  async imageTo3D(params: ImageTo3DParams): Promise<Generated3DModel> {
    // Similar implementation
  }
  
  async applyTexture(params: ApplyTextureParams): Promise<TexturedModel> {
    // PBR texture generation
  }
  
  async autoRig(params: AutoRigParams): Promise<RiggedModel> {
    // Auto-rigging implementation
  }
  
  private async pollMeshyJob(taskId: string): Promise<string> {
    // Poll until complete (max 5 minutes)
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5s intervals
    
    while (attempts < maxAttempts) {
      const response = await fetch(`https://api.meshy.ai/v2/text-to-3d/${taskId}`, {
        headers: { 'Authorization': `Bearer ${this.meshyApiKey}` }
      });
      
      const data = await response.json();
      
      if (data.status === 'SUCCEEDED') {
        return data.model_urls.glb;
      } else if (data.status === 'FAILED') {
        throw new Error(`Meshy generation failed: ${data.error}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    
    throw new Error('Meshy generation timeout');
  }
}
```

#### 4.1.2 LumaService.ts
```typescript
// server/services/ai/LumaService.ts
export class LumaService {
  private arbitrageEngine: ArbitrageEngine;
  private lumaApiKey: string;
  
  async textToVideo(params: TextToVideoParams): Promise<GeneratedVideo> {
    // Ray3 model for text-to-video
    const videoData = await this.arbitrageEngine.execute({
      task: 'generate_video',
      complexity: params.hdr ? 'high' : 'medium',
      provider: 'luma',
      params: {
        prompt: params.prompt,
        aspect_ratio: params.aspectRatio,
        loop: false,
        keyframes: {
          frame0: { type: 'generation', text: params.prompt }
        }
      }
    });
    
    const videoUrl = await this.pollLumaJob(videoData.id);
    
    // Upload to Cloudinary
    const cloudinaryUpload = await cloudinary.uploader.upload(videoUrl, {
      resource_type: 'video',
      folder: 'mundo-tango/ai-videos'
    });
    
    return {
      videoId: videoData.id,
      videoUrl: cloudinaryUpload.secure_url,
      duration: 10,
      resolution: params.hdr ? '1080p_hdr' : '1080p'
    };
  }
  
  async imageToVideo(params: ImageToVideoParams): Promise<GeneratedVideo> {
    // Image animation
  }
  
  async modifyVideo(params: ModifyVideoParams): Promise<GeneratedVideo> {
    // Video-to-video transformation
  }
  
  private async pollLumaJob(jobId: string): Promise<string> {
    // Poll Luma API (similar to Meshy)
  }
}
```

#### 4.1.3 HeyGenService.ts
```typescript
// server/services/ai/HeyGenService.ts
export class HeyGenService {
  async photoToAvatarVideo(params: PhotoToAvatarParams): Promise<GeneratedVideo> {
    // 1. Generate voice audio via ElevenLabs
    const elevenLabs = new VoiceCloningService();
    const audioUrl = await elevenLabs.textToSpeech({
      text: params.script,
      voiceId: params.voiceId
    });
    
    // 2. Create HeyGen avatar video
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_inputs: [{
          character: {
            type: 'photo',
            photo_url: params.photoUrl,
            photo_angle: params.angle
          },
          voice: {
            type: 'audio',
            audio_url: audioUrl
          },
          background: params.background === 'clean' ? '#ffffff' : params.customBackgroundUrl
        }],
        dimension: { width: 1920, height: 1080 }
      })
    });
    
    const data = await response.json();
    const videoUrl = await this.pollHeyGenJob(data.video_id);
    
    return {
      videoId: data.video_id,
      videoUrl,
      duration: data.duration
    };
  }
  
  async createDigitalTwin(params: DigitalTwinParams): Promise<DigitalTwin> {
    // Digital twin training
  }
  
  private async pollHeyGenJob(videoId: string): Promise<string> {
    // Poll HeyGen API
  }
}
```

### 4.2 Database Schema

```typescript
// shared/schema.ts additions

// Generated Assets (3D models, videos)
export const generatedAssets = pgTable('generated_assets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  assetType: varchar('asset_type', { length: 50 }).notNull(), // '3d_model', 'ai_video', 'avatar_video'
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  metadata: jsonb('metadata').notNull(), // { polygonCount, duration, format, etc }
  tags: text('tags').array(),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Asset Generation Jobs (BullMQ job tracking)
export const assetGenerationJobs = pgTable('asset_generation_jobs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  assetType: varchar('asset_type', { length: 50 }).notNull(),
  inputPrompt: text('input_prompt'),
  inputImageUrl: text('input_image_url'),
  status: varchar('status', { length: 20 }).notNull(), // 'processing', 'completed', 'failed'
  outputUrl: text('output_url'),
  parameters: jsonb('parameters').notNull(),
  errorMessage: text('error_message'),
  apiProvider: varchar('api_provider', { length: 50 }).notNull(), // 'meshy', 'luma', 'heygen'
  costCents: integer('cost_cents'), // Track API costs
  processingTimeSeconds: integer('processing_time_seconds'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at')
});

// Digital Twins (user-trained avatars)
export const digitalTwins = pgTable('digital_twins', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  trainingVideoUrl: text('training_video_url').notNull(),
  heygenAvatarId: varchar('heygen_avatar_id', { length: 100 }),
  status: varchar('status', { length: 20 }).notNull(), // 'training', 'ready', 'failed'
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  trainedAt: timestamp('trained_at')
});
```

### 4.3 API Routes

```typescript
// server/routes/mr-blue-content-studio-routes.ts
import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { MeshyService } from '../services/ai/MeshyService';
import { LumaService } from '../services/ai/LumaService';
import { HeyGenService } from '../services/ai/HeyGenService';

const router = Router();

// 3D Generation Routes
router.post('/api/mrblue/3d/text-to-model', authenticateToken, async (req: AuthRequest, res) => {
  const meshyService = new MeshyService();
  const model = await meshyService.textTo3D({
    userId: req.userId!,
    prompt: req.body.prompt,
    quality: req.body.quality,
    style: req.body.style
  });
  res.json(model);
});

router.post('/api/mrblue/3d/image-to-model', authenticateToken, async (req: AuthRequest, res) => {
  // Image-to-3D endpoint
});

router.post('/api/mrblue/3d/apply-texture', authenticateToken, async (req: AuthRequest, res) => {
  // Texture application endpoint
});

// Video Generation Routes
router.post('/api/mrblue/video/text-to-video', authenticateToken, async (req: AuthRequest, res) => {
  const lumaService = new LumaService();
  const video = await lumaService.textToVideo({
    userId: req.userId!,
    prompt: req.body.prompt,
    duration: req.body.duration,
    aspectRatio: req.body.aspectRatio,
    cameraMotion: req.body.cameraMotion,
    hdr: req.body.hdr
  });
  res.json(video);
});

router.post('/api/mrblue/video/photo-to-avatar', authenticateToken, async (req: AuthRequest, res) => {
  const heygenService = new HeyGenService();
  const video = await heygenService.photoToAvatarVideo({
    userId: req.userId!,
    photoUrl: req.body.photoUrl,
    script: req.body.script,
    voiceId: req.body.voiceId,
    angle: req.body.angle,
    background: req.body.background
  });
  res.json(video);
});

// Asset Management Routes
router.get('/api/mrblue/assets', authenticateToken, async (req: AuthRequest, res) => {
  // Get user's generated assets
  const assets = await db.select()
    .from(generatedAssets)
    .where(eq(generatedAssets.userId, req.userId!))
    .orderBy(desc(generatedAssets.createdAt));
  res.json(assets);
});

router.delete('/api/mrblue/assets/:id', authenticateToken, async (req: AuthRequest, res) => {
  // Delete asset
});

export default router;
```

### 4.4 AI Arbitrage Integration

**Cost Optimization Strategy:**

| Service | Tier-1 (Free/Cheap) | Tier-2 (Mid) | Tier-3 (Premium) |
|---------|---------------------|--------------|------------------|
| Meshy 3D | Draft mode (Gemini Flash) | Production mode (GPT-4o-mini) | High-poly (Direct Meshy API) |
| Luma Video | Low-res preview (Llama 3 8B) | 1080p (GPT-4o-mini) | 16-bit HDR (Direct Luma Ray3) |
| HeyGen Avatar | Stock avatars (cached) | Photo avatars (GPT-4o-mini enhancement) | Digital twins (Direct HeyGen) |

**Cascade Execution Logic:**
```typescript
// server/services/ai/ArbitrageEngine.ts
export class ArbitrageEngine {
  async execute(params: ArbitrageParams): Promise<any> {
    // Classify complexity
    const complexity = await this.taskClassifier.classify(params.task, params.params);
    
    // Route to appropriate tier
    if (complexity.score < 0.3 && params.allowCaching) {
      // Tier-1: Use cached results or free models
      return this.executeTier1(params);
    } else if (complexity.score < 0.7) {
      // Tier-2: Use mid-tier models
      return this.executeTier2(params);
    } else {
      // Tier-3: Use premium APIs
      return this.executeTier3(params);
    }
  }
  
  private async executeTier1(params: ArbitrageParams): Promise<any> {
    // Check semantic cache first
    const cached = await this.checkCache(params);
    if (cached) return cached;
    
    // Use free/cheap models (Llama 3 8B, Gemini Flash)
    // For 3D: Generate draft-quality model
    // For video: Low-res preview
  }
  
  private async executeTier2(params: ArbitrageParams): Promise<any> {
    // Use GPT-4o-mini or Claude Haiku
    // Enhanced prompt engineering
    // Higher quality parameters
  }
  
  private async executeTier3(params: ArbitrageParams): Promise<any> {
    // Direct API calls to Meshy/Luma/HeyGen
    // Premium features (16-bit HDR, 300k polygons, digital twins)
  }
}
```

**Expected Savings:**
- Without Arbitrage: $260/mo (Meshy $60 + Luma $100 + HeyGen $100)
- With Arbitrage: $26-52/mo (80-90% reduction)
  - 70% of requests → Tier-1 (free/cheap)
  - 20% of requests → Tier-2 ($0.08-0.60 per 1K tokens)
  - 10% of requests → Tier-3 (premium APIs)

### 4.5 Caching Strategy

**LanceDB Semantic Caching:**
```typescript
// Before generating 3D model, check if similar prompt exists
const similarAssets = await lancedb.search({
  collection: 'generated_3d_models',
  query: userPrompt,
  limit: 5,
  similarityThreshold: 0.85
});

if (similarAssets.length > 0) {
  // Return cached model (cost = $0)
  return similarAssets[0];
} else {
  // Generate new model via API
  const newModel = await meshyService.textTo3D(params);
  
  // Cache for future use
  await lancedb.insert({
    collection: 'generated_3d_models',
    data: {
      prompt: userPrompt,
      modelUrl: newModel.modelUrl,
      metadata: newModel.metadata
    }
  });
}
```

**Cache Hit Rate Target:** 40-60% (saves $100-150/mo)

---

## 5. AI ARBITRAGE STRATEGY

### 5.1 Cost Optimization Goals

**Current External Costs (without Mundo Tango):**
- Meshy: $60/month (Max plan)
- Luma: $100/month (estimated based on usage)
- HeyGen: $100/month (estimated based on usage)
- **Total:** $260/month

**Target Cost with AI Arbitrage:** $26-52/month (80-90% savings)

### 5.2 Arbitrage Execution Plan

#### Tier-1 Routing (70% of requests, ~$0 cost)
**Use cases:**
- Draft 3D models (5k polygons)
- Low-res video previews
- Cached results from previous generations
- Simple texture applications

**Models:**
- Llama 3 8B (free via Groq)
- Gemini Flash (free tier)
- Stable Diffusion 3 (for textures)

**Expected savings:** $182/month

#### Tier-2 Routing (20% of requests, $10-20/month)
**Use cases:**
- Production 3D models (50k polygons)
- 1080p video generation
- Photo-to-avatar videos
- Multi-angle 3D reconstruction

**Models:**
- GPT-4o-mini ($0.15/1M input, $0.60/1M output)
- Claude 3 Haiku ($0.25/1M input, $1.25/1M output)

**Expected cost:** $10-20/month

#### Tier-3 Routing (10% of requests, $16-32/month)
**Use cases:**
- High-poly 3D models (300k polygons)
- 16-bit HDR video
- Digital twin training
- Multi-view 3D reconstruction

**APIs:**
- Meshy API (direct calls for premium features)
- Luma Ray3 (16-bit HDR, extended videos)
- HeyGen Avatar IV (digital twins)

**Expected cost:** $16-32/month

### 5.3 Cost Tracking & Alerts

```typescript
// Track API costs in real-time
await db.insert(assetGenerationJobs).values({
  costCents: actualCostInCents,
  apiProvider: 'meshy',
  // ...
});

// Monthly cost monitoring
const monthlyCost = await db.select({
  totalCost: sql`SUM(cost_cents)`.mapWith(Number)
})
.from(assetGenerationJobs)
.where(sql`created_at >= date_trunc('month', CURRENT_DATE)`);

// Alert if exceeding budget
if (monthlyCost.totalCost > 5000) { // $50
  await sendAdminAlert('AI content generation costs exceeding $50/month');
}
```

---

## 6. USER EXPERIENCE

### 6.1 Tab Navigation Enhancement

**Current Mr Blue Studio UI:**
```tsx
<Tabs defaultValue="video" className="w-full">
  <TabsList>
    <TabsTrigger value="video">Video</TabsTrigger>
    <TabsTrigger value="chat">Chat</TabsTrigger>
    <TabsTrigger value="vibe">Vibe Code</TabsTrigger>
    <TabsTrigger value="voice">Voice</TabsTrigger>
    <TabsTrigger value="messenger">Messenger</TabsTrigger>
    <TabsTrigger value="memory">Memory</TabsTrigger>
  </TabsList>
</Tabs>
```

**Enhanced UI (8 tabs):**
```tsx
<Tabs defaultValue="video" className="w-full">
  <TabsList className="grid grid-cols-8 w-full">
    <TabsTrigger value="video">Video</TabsTrigger>
    <TabsTrigger value="chat">Chat</TabsTrigger>
    <TabsTrigger value="vibe">Vibe Code</TabsTrigger>
    <TabsTrigger value="voice">Voice</TabsTrigger>
    <TabsTrigger value="messenger">Messenger</TabsTrigger>
    <TabsTrigger value="memory">Memory</TabsTrigger>
    <TabsTrigger value="3d-creator" className="bg-gradient-to-r from-purple-500 to-pink-500">
      <Box className="w-4 h-4 mr-2" />
      3D Creator
    </TabsTrigger>
    <TabsTrigger value="video-studio" className="bg-gradient-to-r from-blue-500 to-cyan-500">
      <Video className="w-4 h-4 mr-2" />
      AI Video
    </TabsTrigger>
  </TabsList>
  
  {/* Existing tabs */}
  
  {/* NEW: 3D Creator Tab */}
  <TabsContent value="3d-creator">
    <ThreeDCreatorTab />
  </TabsContent>
  
  {/* NEW: AI Video Studio Tab */}
  <TabsContent value="video-studio">
    <AIVideoStudioTab />
  </TabsContent>
</Tabs>
```

### 6.2 Asset Preview Gallery

**Component:** `GeneratedAssetsGallery.tsx`

**Features:**
- Grid layout (3-4 columns)
- Filter by type: 3D Models / AI Videos / Avatar Videos
- Sort by: Recent, Most Used, Favorites
- Quick actions: Download, Share, Delete, Use in Post
- Metadata display: File size, duration, polygon count, generation date
- Thumbnail generation for all asset types
  - 3D models: Auto-rotate WebGL preview
  - Videos: First frame + hover-to-play
  - Avatars: Profile shot

**UI:**
```tsx
<div className="grid grid-cols-3 gap-4 p-4">
  {assets.map(asset => (
    <Card key={asset.id} className="hover-elevate">
      {asset.assetType === '3d_model' ? (
        <Canvas className="h-48">
          <Model url={asset.fileUrl} />
        </Canvas>
      ) : (
        <video src={asset.thumbnailUrl} className="w-full h-48 object-cover" />
      )}
      <CardContent>
        <h4 className="font-semibold truncate">{asset.fileName}</h4>
        <p className="text-sm text-muted-foreground">
          {asset.metadata.duration ? `${asset.metadata.duration}s` : `${asset.metadata.polygonCount} polys`}
        </p>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="ghost" onClick={() => downloadAsset(asset)}>
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => shareAsset(asset)}>
            <Share className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => deleteAsset(asset)}>
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

### 6.3 Generation Progress Tracking

**Component:** `GenerationProgressTracker.tsx`

**Features:**
- Real-time status updates via WebSocket
- ETA calculation based on historical data
- Cancel generation button
- Retry on failure
- Multiple simultaneous generations support

**UI States:**
1. **Queued:** "Your request is in queue. Position: #3"
2. **Processing:** Progress bar + ETA "Generating... 45 seconds remaining"
3. **Completed:** Preview + Download button
4. **Failed:** Error message + Retry button

```tsx
<Card className="border-2 border-primary">
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <span>Generating 3D Model...</span>
      <Button variant="ghost" size="sm" onClick={cancelJob}>Cancel</Button>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <Progress value={progress} className="mb-2" />
    <p className="text-sm text-muted-foreground">
      {status === 'processing' && `${eta} seconds remaining`}
      {status === 'completed' && 'Generation complete!'}
      {status === 'failed' && 'Generation failed. Please try again.'}
    </p>
    {status === 'completed' && (
      <div className="mt-4">
        <ModelPreview url={outputUrl} />
        <Button className="w-full mt-2" onClick={downloadModel}>
          <Download className="w-4 h-4 mr-2" />
          Download Model
        </Button>
      </div>
    )}
  </CardContent>
</Card>
```

### 6.4 Export & Download Flows

**3D Model Export:**
- Format selector: FBX, OBJ, STL, USDZ, glTF, BLEND
- Include textures toggle (for formats that support it)
- Include rig toggle (if model is rigged)
- Include animations toggle (if animations applied)
- Compression options: None, Medium, High
- Download button → Downloads ZIP with all selected files

**Video Export:**
- Quality selector: 1080p, 4K (if available)
- Format: MP4 (H.264), WebM, MOV
- Include audio toggle
- Watermark toggle (remove watermark on paid plans)
- Download button

**Share Options:**
- Copy link (public URL with WebGL viewer)
- Embed code (for websites)
- Share to Mundo Tango feed
- Share to social media (Facebook, Instagram, TikTok)

### 6.5 Integration with Existing Features

**Media Gallery Integration:**
- All generated assets auto-save to Media Gallery
- Tagged as "AI Generated"
- Sub-categories: 3D Models, AI Videos, Avatar Videos
- Use in posts: Embed 3D viewer or video player
- Use in events: Event header videos, 3D decorative elements

**Profile Integration:**
- Set avatar video as profile video
- Display 3D models in profile gallery
- Show generation stats: "127 AI assets created"

**Post Creation Integration:**
- "Add AI Content" button in post composer
- Quick access to generated assets
- Embed 3D models (interactive viewer)
- Embed avatar videos

**Event Creation Integration:**
- Generate event promotional videos
- Create 3D event decorations
- Generate avatar announcements from event organizers

---

## 7. SUCCESS METRICS

### 7.1 User Adoption Metrics

**Primary KPIs:**
- % of users who visit 3D Creator tab: Target >30% within 3 months
- % of users who visit AI Video Studio tab: Target >40% within 3 months
- Average generations per user per month: Target >5
- User retention (return to use feature): Target >60% within 30 days

**Engagement Metrics:**
- Time spent in content creation tabs: Target >15 min/session
- Assets shared to feed: Target >25% of generated assets
- Assets downloaded: Target >40% of generated assets
- Paid plan upgrades (for premium features): Target >10% conversion

### 7.2 Technical Performance Metrics

**Generation Success Rate:**
- 3D model generation success: Target >95%
- Video generation success: Target >95%
- Avatar video generation success: Target >98%

**Quality Metrics:**
- User satisfaction rating (5-star): Target >4.2/5
- Re-generation rate (failed first attempt): Target <15%
- Asset deletion rate (user unhappy): Target <10%

**Performance Metrics:**
- API response time (95th percentile): Target <10 seconds
- Generation time (median): Target <2 minutes
- Cache hit rate: Target 40-60%

### 7.3 Cost Efficiency Metrics

**API Cost Tracking:**
- Cost per 3D generation: Target <$0.30
- Cost per video generation: Target <$0.50
- Cost per avatar video: Target <$0.40
- Monthly total API cost: Target <$52/month
- Cost savings vs. external tools: Target >80%

**Arbitrage Effectiveness:**
- Tier-1 routing success: Target >70% of requests
- Tier-2 routing: Target 15-25% of requests
- Tier-3 routing: Target <15% of requests

### 7.4 Business Impact Metrics

**Time Savings:**
- Time saved vs. using 3 separate tools: Target >60%
- Workflow efficiency gain: Target >50%
- Context switching reduction: Target >80%

**Revenue Impact:**
- Premium plan upgrades: Target 500+ upgrades in 3 months
- Average revenue per user (ARPU) increase: Target +$5/month
- Churn reduction (users stay for content tools): Target -15%

**User Testimonials Target:**
- Collect 100+ positive reviews mentioning content studio within 6 months
- Net Promoter Score (NPS): Target >70

---

## 8. IMPLEMENTATION TIMELINE

### Phase 1: Foundation (Week 10 Day 1-2)
**Duration:** 2 days

**Deliverables:**
- Database schema migration (3 new tables)
- MeshyService.ts (text-to-3D, image-to-3D)
- LumaService.ts (text-to-video, image-to-video)
- HeyGenService.ts (photo-to-avatar)
- API routes (10 endpoints)
- BullMQ job workers for background processing

**Testing:**
- Unit tests for all services
- Integration tests for API endpoints
- Cost tracking verification

### Phase 2: UI Implementation (Week 10 Day 3-4)
**Duration:** 2 days

**Deliverables:**
- ThreeDCreatorTab.tsx component
- AIVideoStudioTab.tsx component
- GeneratedAssetsGallery.tsx
- GenerationProgressTracker.tsx
- MrBlueStudio.tsx updates (8 tabs)
- WebGL 3D viewer component
- Video player component with controls

**Testing:**
- E2E tests for content generation flows
- UI responsiveness testing
- WebGL performance testing

### Phase 3: AI Arbitrage Integration (Week 10 Day 5)
**Duration:** 1 day

**Deliverables:**
- ArbitrageEngine enhancements for content generation
- Semantic caching implementation
- Cost tracking dashboard (admin)
- Budget alerts system

**Testing:**
- Arbitrage routing verification
- Cost calculation accuracy
- Cache hit rate validation

### Phase 4: Polish & Launch (Week 11 Day 1)
**Duration:** 1 day

**Deliverables:**
- User documentation
- Tutorial videos
- Admin dashboard for monitoring
- Launch announcement
- Marketing materials

---

## 9. RISKS & MITIGATION

### Risk 1: High API Costs
**Probability:** Medium  
**Impact:** High  
**Mitigation:**
- Implement strict budget alerts ($50/month threshold)
- AI Arbitrage routing (80-90% cost reduction)
- Semantic caching (40-60% cache hit rate)
- Rate limiting per user (10 generations/day free tier)

### Risk 2: Generation Quality Issues
**Probability:** Medium  
**Impact:** Medium  
**Mitigation:**
- Prompt enhancement via Context Service
- User feedback loop (5-star ratings)
- Re-generation option (free)
- Quality presets (Draft vs. Production)

### Risk 3: Long Generation Times
**Probability:** Low  
**Impact:** Medium  
**Mitigation:**
- Draft mode for quick iterations
- Background processing via BullMQ
- Real-time progress updates
- Email notification on completion

### Risk 4: Storage Costs
**Probability:** Medium  
**Impact:** Low  
**Mitigation:**
- Cloudinary transformation on-the-fly (reduce storage)
- Auto-delete assets after 90 days (with user warning)
- Compression options
- Limit free tier storage (1GB per user)

---

## 10. APPENDIX

### 10.1 API Documentation

**Meshy API:** https://docs.meshy.ai  
**Luma API:** https://lumalabs.ai/dream-machine/api  
**HeyGen API:** https://docs.heygen.com  
**ElevenLabs API:** https://elevenlabs.io/docs (already integrated)

### 10.2 Competitive Analysis

| Feature | Mundo Tango (Integrated) | External Tools (Separate) |
|---------|-------------------------|---------------------------|
| 3D Generation | ✅ Tab 7 | Meshy.ai ($60/mo) |
| Video Generation | ✅ Tab 8 | Luma ($100/mo) |
| Avatar Videos | ✅ Tab 8 | HeyGen ($100/mo) |
| Voice Integration | ✅ System 5 | External TTS |
| Context Awareness | ✅ System 1 (RAG) | None |
| Cost | $26-52/mo | $260/mo |
| UX | Unified interface | 3 separate apps |
| **TOTAL ADVANTAGE** | **80-90% cost savings + unified UX** | **Fragmented, expensive** |

### 10.3 User Personas

**Persona 1: Elena (Tango Teacher)**
- Needs: Promotional videos for classes, 3D graphics for social media
- Use case: Generate avatar video explaining class schedule, create 3D tango shoe models
- Value: Saves $260/mo, professional content in minutes

**Persona 2: Carlos (Event Organizer)**
- Needs: Event promotional materials, social media content
- Use case: Text-to-video event trailers, 3D venue decorations
- Value: Creates marketing content without hiring designer

**Persona 3: Sofia (Social Media Creator)**
- Needs: Engaging content for TikTok/Instagram
- Use case: Avatar videos, AI-generated dance animations
- Value: Stand out from competitors with unique AI content

---

**END OF PRD**

**Total Pages:** 30  
**Estimated Implementation Time:** 5 days (Week 10)  
**Expected Impact:** 500+ users adopting within 3 months, 80-90% cost savings vs. external tools  
**Next Steps:** Review with stakeholders → Approve → Begin Phase 1 implementation
