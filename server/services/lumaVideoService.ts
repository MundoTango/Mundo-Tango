import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { lumaVideos, type InsertLumaVideo, type LumaVideo } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { uploadImage } from '../utils/cloudinary';

/**
 * MB.MD Protocol: Luma Dream Machine Video Generation Service
 * Generates AI videos of Mr. Blue using text-to-video and image-to-video
 * Integrates with database and Cloudinary for permanent storage
 */

export interface VideoGenerationRequest {
  prompt: string;
  imageUrl?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  loop?: boolean;
}

export interface VideoGenerationResponse {
  id: string;
  state: 'pending' | 'queued' | 'dreaming' | 'completed' | 'failed';
  failure_reason?: string;
  created_at?: string;
  video?: {
    url: string;
    width: number;
    height: number;
    thumbnail?: string;
  };
}

export class LumaVideoService {
  private apiKey: string;
  private baseUrl = 'https://api.lumalabs.ai/dream-machine/v1';
  private activeAvatarGenerationId: string | null = null;

  constructor() {
    this.apiKey = process.env.LUMA_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('LUMA_API_KEY not configured');
    }
  }

  /**
   * Generate video from text prompt only
   */
  async generateFromText(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const body: any = {
      prompt: request.prompt,
      model: 'ray-2', // Latest Dream Machine model
    };

    if (request.aspectRatio) {
      body.aspect_ratio = request.aspectRatio;
    }

    if (request.loop !== undefined) {
      body.loop = request.loop;
    }

    console.log('🎬 Generating video from text:', request.prompt);

    const response = await fetch(`${this.baseUrl}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Luma API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<VideoGenerationResponse>;
  }

  /**
   * Generate video from image + prompt (image-to-video)
   */
  async generateFromImage(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    if (!request.imageUrl) {
      throw new Error('imageUrl required for image-to-video generation');
    }

    const body: any = {
      prompt: request.prompt,
      model: 'ray-2', // Latest Dream Machine model
      keyframes: {
        frame0: {
          type: 'image',
          url: request.imageUrl
        }
      }
    };

    if (request.aspectRatio) {
      body.aspect_ratio = request.aspectRatio;
    }

    if (request.loop !== undefined) {
      body.loop = request.loop;
    }

    console.log('🎬 Generating video from image:', request.imageUrl);
    console.log('📝 Prompt:', request.prompt);

    const response = await fetch(`${this.baseUrl}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Luma API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<VideoGenerationResponse>;
  }

  /**
   * Check video generation status
   */
  async getGenerationStatus(generationId: string): Promise<VideoGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/generations/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to check status: ${response.status} - ${error}`);
    }

    return response.json() as Promise<VideoGenerationResponse>;
  }

  /**
   * Poll until video is complete (max 5 minutes)
   */
  async waitForCompletion(generationId: string, maxAttempts = 60): Promise<VideoGenerationResponse> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const status = await this.getGenerationStatus(generationId);
      
      console.log(`📊 Status: ${status.state} (attempt ${attempts + 1}/${maxAttempts})`);

      if (status.state === 'completed') {
        console.log('✅ Video generation complete!');
        return status;
      }

      if (status.state === 'failed') {
        throw new Error(`Video generation failed: ${status.failure_reason || 'Unknown error'}`);
      }

      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Video generation timeout after 5 minutes');
  }

  /**
   * Download video to local storage
   */
  async downloadVideo(generationId: string): Promise<string> {
    const status = await this.getGenerationStatus(generationId);

    if (status.state !== 'completed' || !status.video?.url) {
      throw new Error(`Video not ready. State: ${status.state}`);
    }

    const videoUrl = status.video.url;
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }

    const buffer = await response.buffer();
    const outputDir = path.join(process.cwd(), 'client/public/videos');
    
    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `mr-blue-${generationId}.mp4`;
    const outputPath = path.join(outputDir, filename);
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Downloaded video to ${outputPath}`);

    return `/videos/${filename}`;
  }

  /**
   * Generate Mr. Blue introduction video
   */
  async generateMrBlueIntro(): Promise<VideoGenerationResponse> {
    const prompt = `Professional AI companion with turquoise mohawk hairstyle greeting users, 
                    wearing teal blazer with silver jewelry, friendly confident smile, 
                    waving hand gesture, modern office background with tango-inspired decor, 
                    cinematic lighting, professional video quality`;

    return this.generateFromText({
      prompt,
      aspectRatio: '16:9',
      loop: false
    });
  }

  /**
   * Generate Mr. Blue from existing photo
   */
  async generateFromMrBluePhoto(imageUrl: string, motion: string = 'gentle nod and smile'): Promise<VideoGenerationResponse> {
    const prompt = `Mr. Blue AI companion ${motion}, professional demeanor, 
                    smooth natural movement, cinematic lighting`;

    return this.generateFromImage({
      imageUrl,
      prompt,
      aspectRatio: '16:9',
      loop: false
    });
  }

  /**
   * Generate Mr. Blue avatar looping video (1:1 square)
   * Perfect for avatar display with seamless loop
   */
  async generateMrBlueAvatar(): Promise<VideoGenerationResponse> {
    const prompt = `Professional AI companion with bright turquoise mohawk hairstyle, 
                    wearing teal floral blazer with silver jewelry, 
                    friendly warm smile, gentle subtle nod, 
                    modern office background with soft lighting, 
                    cinematic quality, professional demeanor, 
                    smooth natural movement, seamless loop animation`;

    return this.generateFromText({
      prompt,
      aspectRatio: '1:1',
      loop: true
    });
  }

  /**
   * Generate state-specific Mr. Blue avatar videos
   * Each state has unique expression and body language
   */
  async generateMrBlueState(state: string): Promise<VideoGenerationResponse> {
    const baseCharacter = `Pixar-style AI companion character with bright turquoise mohawk hairstyle, 
                          wearing teal floral blazer with silver jewelry`;

    const statePrompts: Record<string, string> = {
      'idle': `${baseCharacter}, relaxed friendly smile, gentle breathing animation, 
               subtle eye blinks, calm demeanor, soft lighting, seamless loop`,
      
      'listening': `${baseCharacter}, attentive focused expression, slight head tilt, 
                    eyes tracking with interest, engaged body language, subtle nod, seamless loop`,
      
      'speaking': `${baseCharacter}, animated expressive face, mouth forming words, 
                   hand gestures for emphasis, energetic but professional, eyes bright, seamless loop`,
      
      'happy': `${baseCharacter}, big genuine smile, joyful eyes, slight bounce in posture, 
                positive energy radiating, warm welcoming presence, seamless loop`,
      
      'thinking': `${baseCharacter}, contemplative expression, hand on chin, 
                   eyes looking upward in thought, pondering gesture, focused concentration, seamless loop`,
      
      'excited': `${baseCharacter}, wide enthusiastic smile, sparkling eyes, 
                  energetic bounce, hands expressing excitement, vibrant personality, seamless loop`,
      
      'surprised': `${baseCharacter}, eyes wide open, eyebrows raised high, 
                    mouth forming "oh!" expression, slight backward lean, sudden realization, seamless loop`,
      
      'nodding': `${baseCharacter}, agreeable head nod motion, supportive smile, 
                  encouraging expression, affirmative body language, understanding eyes, seamless loop`,
      
      'walk-left': `${baseCharacter}, walking left across frame, smooth confident stride, 
                    natural arm swing, turquoise mohawk flowing with movement, professional walk cycle`,
      
      'walk-right': `${baseCharacter}, walking right across frame, smooth confident stride, 
                     natural arm swing, turquoise mohawk flowing with movement, professional walk cycle`,
    };

    const prompt = statePrompts[state] || statePrompts['idle'];

    return this.generateFromText({
      prompt,
      aspectRatio: '1:1',
      loop: state !== 'walk-left' && state !== 'walk-right' // Walking videos don't loop
    });
  }

  /**
   * Get or generate Mr. Blue avatar video
   * Returns existing video if available, generates new one if not
   */
  async getOrGenerateAvatar(): Promise<{ videoPath?: string; generationId?: string; state: string }> {
    const videoDir = path.join(process.cwd(), 'client/public/videos');
    const avatarFile = 'mr-blue-avatar.mp4';
    const avatarPath = path.join(videoDir, avatarFile);

    // Check if avatar video already exists
    if (fs.existsSync(avatarPath)) {
      console.log('✅ Using existing Mr. Blue avatar video');
      this.activeAvatarGenerationId = null; // Clear active generation
      return {
        videoPath: `/videos/${avatarFile}`,
        state: 'completed'
      };
    }

    // If we have an active generation, check its status
    if (this.activeAvatarGenerationId) {
      console.log(`📊 Checking status of active generation: ${this.activeAvatarGenerationId}`);
      try {
        const status = await this.getGenerationStatus(this.activeAvatarGenerationId);
        
        // If completed, auto-save and return
        if (status.state === 'completed' && status.video?.url) {
          console.log('✅ Generation completed! Auto-saving...');
          await this.saveAvatarVideo(this.activeAvatarGenerationId);
          this.activeAvatarGenerationId = null;
          return {
            videoPath: `/videos/${avatarFile}`,
            state: 'completed'
          };
        }
        
        // If failed, clear and allow retry
        if (status.state === 'failed') {
          console.log('❌ Generation failed, clearing cache for retry');
          this.activeAvatarGenerationId = null;
        } else {
          // Still in progress
          return {
            generationId: this.activeAvatarGenerationId,
            state: status.state
          };
        }
      } catch (error) {
        console.error('Error checking generation status:', error);
        this.activeAvatarGenerationId = null; // Clear on error
      }
    }

    // No active generation, start a new one
    console.log('🎬 Starting new Mr. Blue avatar video generation...');
    const generation = await this.generateMrBlueAvatar();
    this.activeAvatarGenerationId = generation.id;

    return {
      generationId: generation.id,
      state: generation.state
    };
  }

  /**
   * Save avatar video with standard name
   */
  async saveAvatarVideo(generationId: string): Promise<string> {
    const status = await this.getGenerationStatus(generationId);

    if (status.state !== 'completed' || !status.video?.url) {
      throw new Error(`Video not ready. State: ${status.state}`);
    }

    const videoUrl = status.video.url;
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }

    const buffer = await response.buffer();
    const outputDir = path.join(process.cwd(), 'client/public/videos');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = 'mr-blue-avatar.mp4';
    const outputPath = path.join(outputDir, filename);
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Saved avatar video to ${outputPath}`);

    return `/videos/${filename}`;
  }

  // ============================================================================
  // USER-FACING VIDEO GENERATION WITH DATABASE & CLOUDINARY
  // ============================================================================

  /**
   * Create a video generation record in database
   */
  async createVideoRecord(userId: number, generationId: string, prompt: string, options: {
    aspectRatio?: string;
    duration?: number;
  }): Promise<LumaVideo> {
    const [video] = await db.insert(lumaVideos).values({
      userId,
      generationId,
      prompt,
      status: 'pending',
      aspectRatio: options.aspectRatio,
      duration: options.duration,
    }).returning();

    return video;
  }

  /**
   * Update video status in database
   */
  async updateVideoStatus(generationId: string, updates: Partial<InsertLumaVideo>): Promise<void> {
    await db.update(lumaVideos)
      .set({
        ...updates,
        ...(updates.status === 'completed' ? { completedAt: new Date() } : {}),
      })
      .where(eq(lumaVideos.generationId, generationId));
  }

  /**
   * Download video buffer from URL
   */
  async downloadVideoBuffer(videoUrl: string): Promise<Buffer> {
    console.log('📥 Downloading video from Luma...');
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }

    return response.buffer();
  }

  /**
   * Upload video to Cloudinary
   */
  async uploadToCloudinary(videoBuffer: Buffer, generationId: string): Promise<{ url: string; publicId: string }> {
    console.log('☁️  Uploading video to Cloudinary...');
    
    return new Promise((resolve, reject) => {
      const cloudinary = require('cloudinary').v2;
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'luma_videos',
          resource_type: 'video',
          public_id: `video_${generationId}`,
          format: 'mp4',
        },
        (error: any, result: any) => {
          if (error) {
            console.error('[Cloudinary] Upload error:', error);
            reject(new Error(`Failed to upload video: ${error.message}`));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );

      uploadStream.end(videoBuffer);
    });
  }

  /**
   * Generate video for user (text-to-video)
   */
  async generateUserVideo(
    userId: number,
    prompt: string,
    options: {
      aspectRatio?: '16:9' | '9:16' | '1:1';
      duration?: number;
    } = {}
  ): Promise<LumaVideo> {
    console.log(`🎬 User ${userId} generating video: ${prompt}`);

    // Start Luma generation
    const generation = await this.generateFromText({
      prompt,
      aspectRatio: options.aspectRatio || '16:9',
      loop: false,
    });

    // Save to database
    const video = await this.createVideoRecord(userId, generation.id, prompt, {
      aspectRatio: options.aspectRatio,
      duration: options.duration,
    });

    console.log(`✅ Video generation started: ${generation.id}`);
    return video;
  }

  /**
   * Poll and complete video generation
   * Downloads from Luma, uploads to Cloudinary, updates database
   */
  async completeVideoGeneration(generationId: string): Promise<LumaVideo> {
    console.log(`🔄 Completing video generation: ${generationId}`);

    // Get current status from Luma
    const status = await this.getGenerationStatus(generationId);

    if (status.state === 'failed') {
      await this.updateVideoStatus(generationId, {
        status: 'failed',
        failureReason: status.failure_reason || 'Unknown error',
      });
      throw new Error(`Video generation failed: ${status.failure_reason}`);
    }

    if (status.state !== 'completed' || !status.video?.url) {
      // Update status but don't complete yet
      await this.updateVideoStatus(generationId, {
        status: status.state,
      });
      
      const [video] = await db.select().from(lumaVideos).where(eq(lumaVideos.generationId, generationId));
      return video;
    }

    // Video is complete! Download and upload to Cloudinary
    const videoBuffer = await this.downloadVideoBuffer(status.video.url);
    const cloudinaryResult = await this.uploadToCloudinary(videoBuffer, generationId);

    // Update database with final URLs and metadata
    await this.updateVideoStatus(generationId, {
      status: 'completed',
      videoUrl: status.video.url,
      cloudinaryUrl: cloudinaryResult.url,
      cloudinaryPublicId: cloudinaryResult.publicId,
      width: status.video.width,
      height: status.video.height,
      thumbnailUrl: status.video.thumbnail,
    });

    console.log(`✅ Video generation complete and saved to Cloudinary`);

    const [video] = await db.select().from(lumaVideos).where(eq(lumaVideos.generationId, generationId));
    return video;
  }

  /**
   * Get user's video history
   */
  async getUserVideos(userId: number, limit: number = 20): Promise<LumaVideo[]> {
    return db.select()
      .from(lumaVideos)
      .where(eq(lumaVideos.userId, userId))
      .orderBy(desc(lumaVideos.createdAt))
      .limit(limit);
  }

  /**
   * Get single video by generation ID
   */
  async getVideoByGenerationId(generationId: string): Promise<LumaVideo | undefined> {
    const [video] = await db.select()
      .from(lumaVideos)
      .where(eq(lumaVideos.generationId, generationId));
    return video;
  }

  /**
   * Delete video from Cloudinary (cleanup)
   */
  async deleteFromCloudinary(publicId: string): Promise<void> {
    const cloudinary = require('cloudinary').v2;
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    console.log(`🗑️  Deleted video from Cloudinary: ${publicId}`);
  }
}

export const lumaVideoService = new LumaVideoService();
