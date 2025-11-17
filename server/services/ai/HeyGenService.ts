import { db } from '../../db';
import { generatedAssets, assetGenerationJobs, digitalTwins } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface PhotoToAvatarParams {
  userId: number;
  photoUrl: string;
  script: string;
  voiceId: string;
  angle: 'portrait' | 'half_body' | 'full_body';
  background: 'clean' | 'dynamic' | 'custom';
  customBackgroundUrl?: string;
}

interface GeneratedVideo {
  videoId: string;
  videoUrl: string;
  duration: number;
}

export class HeyGenService {
  private heygenApiKey: string;
  private heygenApiUrl = 'https://api.heygen.com/v2';

  constructor() {
    this.heygenApiKey = process.env.HEYGEN_API_KEY || '';
    if (!this.heygenApiKey) {
      console.warn('HEYGEN_API_KEY not found in environment');
    }
  }

  async photoToAvatarVideo(params: PhotoToAvatarParams): Promise<GeneratedVideo> {
    const [job] = await db.insert(assetGenerationJobs).values({
      userId: params.userId,
      assetType: 'avatar_video',
      inputPrompt: params.script,
      inputImageUrl: params.photoUrl,
      status: 'processing',
      parameters: params,
      apiProvider: 'heygen'
    }).returning();

    try {
      const response = await fetch(`${this.heygenApiUrl}/video/generate`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.heygenApiKey,
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
              type: 'text',
              input_text: params.script,
              voice_id: params.voiceId
            },
            background: params.background === 'clean' 
              ? { type: 'color', value: '#ffffff' }
              : params.background === 'custom'
              ? { type: 'image', url: params.customBackgroundUrl }
              : { type: 'dynamic' }
          }],
          dimension: { width: 1920, height: 1080 }
        })
      });

      if (!response.ok) {
        throw new Error(`HeyGen API error: ${response.statusText}`);
      }

      const generationData = await response.json();
      const videoData = await this.pollHeyGenJob(generationData.data.video_id);

      await db.update(assetGenerationJobs)
        .set({ 
          status: 'completed', 
          outputUrl: videoData.video_url,
          completedAt: new Date()
        })
        .where(eq(assetGenerationJobs.id, job.id));

      const [asset] = await db.insert(generatedAssets).values({
        userId: params.userId,
        assetType: 'avatar_video',
        fileName: `avatar_${Date.now()}.mp4`,
        fileUrl: videoData.video_url,
        thumbnailUrl: videoData.thumbnail_url,
        metadata: {
          duration: videoData.duration || 30,
          script: params.script,
          photoUrl: params.photoUrl,
          angle: params.angle
        },
        tags: ['ai-generated', 'avatar-video', 'heygen']
      }).returning();

      return {
        videoId: asset.id.toString(),
        videoUrl: videoData.video_url,
        duration: videoData.duration || 30
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

  async createDigitalTwin(params: { userId: number; trainingVideoUrl: string; name: string }): Promise<any> {
    const [twin] = await db.insert(digitalTwins).values({
      userId: params.userId,
      name: params.name,
      trainingVideoUrl: params.trainingVideoUrl,
      status: 'training'
    }).returning();

    try {
      const response = await fetch(`${this.heygenApiUrl}/avatar/create`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.heygenApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_url: params.trainingVideoUrl,
          avatar_name: params.name
        })
      });

      if (!response.ok) {
        throw new Error(`HeyGen API error: ${response.statusText}`);
      }

      const creationData = await response.json();

      await db.update(digitalTwins)
        .set({
          heygenAvatarId: creationData.data.avatar_id,
          status: 'training'
        })
        .where(eq(digitalTwins.id, twin.id));

      return {
        digitalTwinId: twin.id.toString(),
        status: 'training',
        estimatedCompletionTime: 1800
      };
    } catch (error) {
      await db.update(digitalTwins)
        .set({ status: 'failed' })
        .where(eq(digitalTwins.id, twin.id));

      throw error;
    }
  }

  private async pollHeyGenJob(videoId: string): Promise<any> {
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.heygenApiUrl}/video/${videoId}`, {
        headers: { 'X-Api-Key': this.heygenApiKey }
      });

      if (!response.ok) {
        throw new Error(`HeyGen polling error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.data.status === 'completed') {
        return {
          video_url: data.data.video_url,
          thumbnail_url: data.data.thumbnail_url,
          duration: data.data.duration
        };
      } else if (data.data.status === 'failed') {
        throw new Error(`HeyGen generation failed: ${data.data.error || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
    }

    throw new Error('HeyGen generation timeout');
  }
}
