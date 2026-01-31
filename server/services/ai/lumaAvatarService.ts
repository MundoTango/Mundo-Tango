import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

interface LumaPhotoRequest {
  photoUrls: string[];
  characterName?: string;
  style?: string;
  outfit?: string;
  expression?: string;
  pose?: string;
}

interface LumaGenerationResponse {
  id: string;
  state: 'queued' | 'dreaming' | 'completed' | 'failed';
  assets?: {
    image?: string;
    video?: string;
  };
}

export class LumaAvatarService {
  private apiKey: string;
  private baseUrl = 'https://api.lumalabs.ai/dream-machine/v1';

  constructor() {
    this.apiKey = process.env.LUMA_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  LUMA_API_KEY not set - avatar generation will fail');
    }
  }

  /**
   * Generate Pixar-style avatar from reference photos
   * Based on the 12 reference photos provided (Mr. Blue signature look):
   * - Bright turquoise/cyan mohawk hairstyle
   * - Silver/turquoise jewelry (bracelets, rings, necklaces)
   * - Floral patterned blazer (teal/turquoise theme)
   * - Professional yet artistic demeanor
   */
  async generatePixarAvatar(request: LumaPhotoRequest): Promise<LumaGenerationResponse> {
    const prompt = this.buildMrBluePrompt(request);
    
    const body = {
      prompt,
      aspect_ratio: '1:1',
      model: 'photon-1',
      character_refs: request.photoUrls.map((url, index) => ({
        url,
        weight: index === 0 ? 0.9 : 0.7 // First photo is primary reference
      }))
    };

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

    return response.json() as Promise<LumaGenerationResponse>;
  }

  /**
   * Build Mr. Blue character prompt from reference photos
   * Captures signature elements: blue hair, turquoise jewelry, floral blazer
   */
  private buildMrBluePrompt(request: LumaPhotoRequest): string {
    const basePrompt = 'Pixar-style 3D character avatar, professional AI companion';
    
    const signature = 'bright turquoise cyan mohawk hairstyle with shaved sides, ' +
                     'silver and turquoise jewelry on wrists and fingers, ' +
                     'teal floral patterned blazer, ' +
                     'warm medium skin tone, ' +
                     'friendly approachable expression';
    
    const style = request.style || 'professional artistic consultant aesthetic';
    const outfit = request.outfit || 'business casual with artistic flair';
    const expression = request.expression || 'confident friendly smile';
    const pose = request.pose || 'standing confident pose, three-quarter view';
    
    const technical = 'high-quality CGI rendering, smooth textures, vibrant colors, ' +
                     'cinematic lighting, Disney Pixar animation quality, ' +
                     'optimized for 3D avatar use, full body character';

    return `${basePrompt}, ${signature}, ${style}, ${outfit}, ${expression}, ${pose}, ${technical}`;
  }

  /**
   * Check generation status
   */
  async checkStatus(generationId: string): Promise<LumaGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/generations/${generationId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to check status: ${response.status}`);
    }

    return response.json() as Promise<LumaGenerationResponse>;
  }

  /**
   * Download generated image
   */
  async downloadImage(generationId: string): Promise<string> {
    const status = await this.checkStatus(generationId);
    
    if (status.state !== 'completed' || !status.assets?.image) {
      throw new Error(`Generation not ready. State: ${status.state}`);
    }

    const imageUrl = status.assets.image;
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const buffer = await response.buffer();
    const outputPath = path.join(process.cwd(), 'client/public/models/mr-blue-pixar.png');
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Downloaded Mr. Blue Pixar image to ${outputPath}`);
    
    return outputPath;
  }

  /**
   * Convert Pixar image to 3D GLB model
   * Note: Luma doesn't have direct image-to-3D yet, 
   * we'll use the Photon-generated image as reference for future 3D conversion
   */
  async convertTo3D(imageUrl: string): Promise<{message: string}> {
    console.log('🎯 Pixar image ready for 3D conversion pipeline');
    console.log('📸 Image URL:', imageUrl);
    console.log('💡 Next: Use image as reference for 3D modeling service or Three.js manual modeling');
    
    return {
      message: 'Pixar image generated. Manual 3D conversion or external service integration needed.'
    };
  }

  /**
   * Complete workflow: Photos → Pixar → Download
   */
  async generateCompleteAvatar(photoUrls: string[]): Promise<string> {
    console.log(`🎨 Starting Mr. Blue avatar generation from ${photoUrls.length} photos`);
    
    // Step 1: Generate Pixar-style image
    const generation = await this.generatePixarAvatar({ photoUrls });
    console.log(`⏳ Generation started: ${generation.id}`);
    
    // Step 2: Poll until complete (max 5 minutes)
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes at 5-second intervals
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const status = await this.checkStatus(generation.id);
      console.log(`📊 Status: ${status.state} (attempt ${attempts + 1}/${maxAttempts})`);
      
      if (status.state === 'completed') {
        // Step 3: Download image
        const imagePath = await this.downloadImage(generation.id);
        return imagePath;
      }
      
      if (status.state === 'failed') {
        throw new Error('Generation failed');
      }
      
      attempts++;
    }
    
    throw new Error('Generation timeout after 5 minutes');
  }
}

export const lumaService = new LumaAvatarService();
