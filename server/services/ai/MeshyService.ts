import type { ArbitrageEngine } from './CascadeExecutor';
import { db } from '../../db';
import { generatedAssets, assetGenerationJobs } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface TextTo3DParams {
  userId: number;
  prompt: string;
  quality: 'draft' | 'production';
  style?: string;
}

interface ImageTo3DParams {
  userId: number;
  imageUrls: string[];
  multiViewMode: boolean;
  targetPolycount?: number;
}

interface ApplyTextureParams {
  userId: number;
  modelId: string;
  texturePrompt: string;
  referenceImageUrl?: string;
  pbrMaps: ('diffuse' | 'normal' | 'roughness' | 'metallic')[];
}

interface Generated3DModel {
  modelId: string;
  modelUrl: string;
  format: string;
  polygonCount: number;
  generationTime: number;
}

export class MeshyService {
  private meshyApiKey: string;
  private meshyApiUrl = 'https://api.meshy.ai/v2';

  constructor() {
    this.meshyApiKey = process.env.MESHY_API_KEY || '';
    if (!this.meshyApiKey) {
      console.warn('MESHY_API_KEY not found in environment');
    }
  }

  async textTo3D(params: TextTo3DParams): Promise<Generated3DModel> {
    const [job] = await db.insert(assetGenerationJobs).values({
      userId: params.userId,
      assetType: '3d_model',
      inputPrompt: params.prompt,
      status: 'processing',
      parameters: params,
      apiProvider: 'meshy'
    }).returning();

    try {
      const response = await fetch(`${this.meshyApiUrl}/text-to-3d`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.meshyApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'preview',
          prompt: params.prompt,
          art_style: params.style || 'realistic',
          negative_prompt: 'low quality, low resolution, low poly, ugly',
          target_polycount: params.quality === 'production' ? 100000 : 5000,
          enable_pbr: true
        })
      });

      if (!response.ok) {
        throw new Error(`Meshy API error: ${response.statusText}`);
      }

      const taskData = await response.json();
      const modelUrl = await this.pollMeshyJob(taskData.result);

      await db.update(assetGenerationJobs)
        .set({ 
          status: 'completed', 
          outputUrl: modelUrl,
          completedAt: new Date()
        })
        .where(eq(assetGenerationJobs.id, job.id));

      const [asset] = await db.insert(generatedAssets).values({
        userId: params.userId,
        assetType: '3d_model',
        fileName: `${params.prompt.slice(0, 50)}.glb`,
        fileUrl: modelUrl,
        metadata: {
          polygonCount: params.quality === 'production' ? 100000 : 5000,
          format: 'glb',
          prompt: params.prompt,
          quality: params.quality
        },
        tags: ['ai-generated', '3d-model']
      }).returning();

      return {
        modelId: asset.id.toString(),
        modelUrl: modelUrl,
        format: 'glb',
        polygonCount: params.quality === 'production' ? 100000 : 5000,
        generationTime: 120
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

  async imageTo3D(params: ImageTo3DParams): Promise<Generated3DModel> {
    const [job] = await db.insert(assetGenerationJobs).values({
      userId: params.userId,
      assetType: '3d_model',
      inputImageUrl: params.imageUrls[0],
      status: 'processing',
      parameters: params,
      apiProvider: 'meshy'
    }).returning();

    try {
      const response = await fetch(`${this.meshyApiUrl}/image-to-3d`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.meshyApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: params.imageUrls[0],
          enable_pbr: true,
          target_polycount: params.targetPolycount || 50000
        })
      });

      if (!response.ok) {
        throw new Error(`Meshy API error: ${response.statusText}`);
      }

      const taskData = await response.json();
      const modelUrl = await this.pollMeshyJob(taskData.result);

      await db.update(assetGenerationJobs)
        .set({ 
          status: 'completed', 
          outputUrl: modelUrl,
          completedAt: new Date()
        })
        .where(eq(assetGenerationJobs.id, job.id));

      const [asset] = await db.insert(generatedAssets).values({
        userId: params.userId,
        assetType: '3d_model',
        fileName: `image_to_3d_${Date.now()}.glb`,
        fileUrl: modelUrl,
        metadata: {
          polygonCount: params.targetPolycount || 50000,
          format: 'glb',
          sourceImage: params.imageUrls[0]
        },
        tags: ['ai-generated', '3d-model', 'image-to-3d']
      }).returning();

      return {
        modelId: asset.id.toString(),
        modelUrl: modelUrl,
        format: 'glb',
        polygonCount: params.targetPolycount || 50000,
        generationTime: 180
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

  private async pollMeshyJob(taskId: string): Promise<string> {
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.meshyApiUrl}/text-to-3d/${taskId}`, {
        headers: { 'Authorization': `Bearer ${this.meshyApiKey}` }
      });

      if (!response.ok) {
        throw new Error(`Meshy polling error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'SUCCEEDED') {
        return data.model_urls?.glb || data.thumbnail_url;
      } else if (data.status === 'FAILED') {
        throw new Error(`Meshy generation failed: ${data.task_error?.message || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Meshy generation timeout');
  }
}
