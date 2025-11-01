import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

/**
 * MB.MD Protocol: Luma Dream Machine Video Generation Service
 * Generates AI videos of Mr. Blue using text-to-video and image-to-video
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
      model: 'ray', // Dream Machine model
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
      model: 'ray', // Dream Machine model
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
      return {
        videoPath: `/videos/${avatarFile}`,
        state: 'completed'
      };
    }

    console.log('🎬 Generating new Mr. Blue avatar video...');
    const generation = await this.generateMrBlueAvatar();

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
}

export const lumaVideoService = new LumaVideoService();
