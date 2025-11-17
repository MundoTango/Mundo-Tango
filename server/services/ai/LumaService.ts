import { db } from '../../db';
import { generatedAssets, assetGenerationJobs } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface TextToVideoParams {
  userId: number;
  prompt: string;
  duration: 5 | 10;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
  cameraMotion?: 'pan' | 'orbit' | 'crane' | 'dolly' | 'static';
  style?: 'realistic' | 'cinematic' | 'animated' | 'artistic';
  hdr?: boolean;
}

interface ImageToVideoParams {
  userId: number;
  imageUrl: string;
  duration: 5 | 10;
  animationIntensity: 'subtle' | 'medium' | 'dramatic';
  cameraPath?: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' | 'orbit';
}

interface GeneratedVideo {
  videoId: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  resolution: string;
}

export class LumaService {
  private lumaApiKey: string;
  private lumaApiUrl = 'https://api.lumalabs.ai/dream-machine/v1';

  constructor() {
    this.lumaApiKey = process.env.LUMA_API_KEY || '';
    if (!this.lumaApiKey) {
      console.warn('LUMA_API_KEY not found in environment');
    }
  }

  async textToVideo(params: TextToVideoParams): Promise<GeneratedVideo> {
    const [job] = await db.insert(assetGenerationJobs).values({
      userId: params.userId,
      assetType: 'ai_video',
      inputPrompt: params.prompt,
      status: 'processing',
      parameters: params,
      apiProvider: 'luma'
    }).returning();

    try {
      const response = await fetch(`${this.lumaApiUrl}/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.lumaApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: params.prompt,
          aspect_ratio: params.aspectRatio,
          loop: false,
          keyframes: {
            frame0: {
              type: 'generation',
              text: params.prompt
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Luma API error: ${response.statusText}`);
      }

      const generationData = await response.json();
      const videoData = await this.pollLumaJob(generationData.id);

      await db.update(assetGenerationJobs)
        .set({ 
          status: 'completed', 
          outputUrl: videoData.video.url,
          completedAt: new Date()
        })
        .where(eq(assetGenerationJobs.id, job.id));

      const [asset] = await db.insert(generatedAssets).values({
        userId: params.userId,
        assetType: 'ai_video',
        fileName: `${params.prompt.slice(0, 50)}.mp4`,
        fileUrl: videoData.video.url,
        thumbnailUrl: videoData.video.thumbnail,
        metadata: {
          duration: params.duration,
          resolution: params.hdr ? '1080p_hdr' : '1080p',
          aspectRatio: params.aspectRatio,
          prompt: params.prompt
        },
        tags: ['ai-generated', 'video', 'luma']
      }).returning();

      return {
        videoId: asset.id.toString(),
        videoUrl: videoData.video.url,
        thumbnailUrl: videoData.video.thumbnail || '',
        duration: params.duration,
        resolution: params.hdr ? '1080p_hdr' : '1080p'
      };
    } catch (error) {
      await db.update(assetGenerationJobs)
        .set({ 
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        })
        .where(eq(assetGenerationJobs.id, job.id));

      throw error;
    }
  }

  async imageToVideo(params: ImageToVideoParams): Promise<GeneratedVideo> {
    const [job] = await db.insert(assetGenerationJobs).values({
      userId: params.userId,
      assetType: 'ai_video',
      inputImageUrl: params.imageUrl,
      status: 'processing',
      parameters: params,
      apiProvider: 'luma'
    }).returning();

    try {
      const response = await fetch(`${this.lumaApiUrl}/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.lumaApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyframes: {
            frame0: {
              type: 'image',
              url: params.imageUrl
            }
          },
          loop: false
        })
      });

      if (!response.ok) {
        throw new Error(`Luma API error: ${response.statusText}`);
      }

      const generationData = await response.json();
      const videoData = await this.pollLumaJob(generationData.id);

      await db.update(assetGenerationJobs)
        .set({ 
          status: 'completed', 
          outputUrl: videoData.video.url,
          completedAt: new Date()
        })
        .where(eq(assetGenerationJobs.id, job.id));

      const [asset] = await db.insert(generatedAssets).values({
        userId: params.userId,
        assetType: 'ai_video',
        fileName: `image_to_video_${Date.now()}.mp4`,
        fileUrl: videoData.video.url,
        thumbnailUrl: videoData.video.thumbnail,
        metadata: {
          duration: params.duration,
          resolution: '1080p',
          sourceImage: params.imageUrl,
          animationIntensity: params.animationIntensity
        },
        tags: ['ai-generated', 'video', 'image-to-video']
      }).returning();

      return {
        videoId: asset.id.toString(),
        videoUrl: videoData.video.url,
        thumbnailUrl: videoData.video.thumbnail || '',
        duration: params.duration,
        resolution: '1080p'
      };
    } catch (error) {
      await db.update(assetGenerationJobs)
        .set({ 
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        })
        .where(eq(assetGenerationJobs.id, job.id));

      throw error;
    }
  }

  private async pollLumaJob(jobId: string): Promise<any> {
    let attempts = 0;
    const maxAttempts = 120;

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.lumaApiUrl}/generations/${jobId}`, {
        headers: { 'Authorization': `Bearer ${this.lumaApiKey}` }
      });

      if (!response.ok) {
        throw new Error(`Luma polling error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.state === 'completed') {
        return data;
      } else if (data.state === 'failed') {
        throw new Error(`Luma generation failed: ${data.failure_reason || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Luma generation timeout');
  }
}
