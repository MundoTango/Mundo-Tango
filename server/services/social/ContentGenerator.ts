import { OpenAIService } from '../ai/OpenAIService';
import { AnthropicService } from '../ai/AnthropicService';
import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';
import { storage } from '../../storage';

export interface ContentGenerationRequest {
  userId: number;
  topic?: string;
  imageUrl?: string;
  platforms: string[];
  tone?: 'professional' | 'casual' | 'inspirational' | 'playful';
  language?: 'en' | 'es' | 'pt';
  length?: 'short' | 'medium' | 'long';
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  brandVoice?: string;
}

export interface GeneratedContent {
  caption: string;
  hashtags: string[];
  platformVariants: {
    platform: string;
    content: string;
    characterCount: number;
  }[];
  imageAnalysis?: string;
  suggestedEmojis?: string[];
  confidence: number;
  aiModel: string;
}

export class ContentGenerator {
  private orchestrator: RateLimitedAIOrchestrator;

  constructor() {
    this.orchestrator = new RateLimitedAIOrchestrator();
  }

  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const { userId, topic, imageUrl, platforms, tone = 'casual', language = 'en', length = 'medium', includeHashtags = true, includeEmojis = true } = request;

    let imageAnalysis: string | undefined;
    if (imageUrl) {
      imageAnalysis = await this.analyzeImage(imageUrl);
    }

    const contentPrompt = this.buildContentPrompt({
      topic,
      imageAnalysis,
      tone,
      language,
      length,
      platforms,
      includeHashtags,
      includeEmojis,
      brandVoice: request.brandVoice,
    });

    const response = await this.orchestrator.queryWithRateLimit(
      'openai',
      'gpt-4o',
      {
        prompt: contentPrompt,
        systemPrompt: this.getSystemPrompt(tone, language),
        temperature: 0.8,
        maxTokens: 1500,
      },
      {
        priority: 1,
        maxWaitMs: 30000,
        enableRetry: true,
        maxRetries: 3,
      }
    );

    const parsedContent = this.parseGeneratedContent(response.content, platforms);

    await storage.createAIGeneratedContent({
      agentId: 120,
      contentType: 'caption',
      content: parsedContent.caption,
      aiModel: response.model,
      prompt: contentPrompt,
      approvalStatus: 'pending',
      metadata: {
        hashtags: parsedContent.hashtags,
        platforms,
        tone,
        language,
        imageAnalysis,
      },
    });

    return parsedContent;
  }

  private async analyzeImage(imageUrl: string): Promise<string> {
    try {
      const response = await OpenAIService.analyzeImage({
        imageUrl,
        prompt: 'Analyze this image for social media content. Describe the scene, mood, people, activities, and key elements that would be relevant for creating engaging social media captions.',
        model: 'gpt-4o',
        maxTokens: 300,
      });

      return response.content;
    } catch (error) {
      console.error('[ContentGenerator] Image analysis failed:', error);
      return 'Unable to analyze image';
    }
  }

  private buildContentPrompt(options: {
    topic?: string;
    imageAnalysis?: string;
    tone: string;
    language: string;
    length: string;
    platforms: string[];
    includeHashtags: boolean;
    includeEmojis: boolean;
    brandVoice?: string;
  }): string {
    const { topic, imageAnalysis, tone, language, length, platforms, includeHashtags, includeEmojis, brandVoice } = options;

    let prompt = `Generate engaging social media content for ${platforms.join(', ')} platforms.\n\n`;

    if (imageAnalysis) {
      prompt += `IMAGE DESCRIPTION: ${imageAnalysis}\n\n`;
    }

    if (topic) {
      prompt += `TOPIC: ${topic}\n\n`;
    }

    if (brandVoice) {
      prompt += `BRAND VOICE: ${brandVoice}\n\n`;
    }

    prompt += `REQUIREMENTS:\n`;
    prompt += `- Tone: ${tone}\n`;
    prompt += `- Language: ${language === 'en' ? 'English' : language === 'es' ? 'Spanish' : 'Portuguese'}\n`;
    prompt += `- Length: ${length} (short: 1-2 sentences, medium: 3-4 sentences, long: 5+ sentences)\n`;
    
    if (includeHashtags) {
      prompt += `- Include 5-10 relevant hashtags (mix of popular and niche)\n`;
    }
    
    if (includeEmojis && tone !== 'professional') {
      prompt += `- Use appropriate emojis to enhance engagement\n`;
    }

    prompt += `\nFORMAT YOUR RESPONSE AS JSON:\n{\n  "caption": "main caption text",\n  "hashtags": ["hashtag1", "hashtag2"],\n  "platformVariants": [\n    {"platform": "instagram", "content": "adapted content for Instagram"},\n    {"platform": "twitter", "content": "adapted content for Twitter (max 280 chars)"},\n    {"platform": "facebook", "content": "adapted content for Facebook"},\n    {"platform": "linkedin", "content": "adapted content for LinkedIn (professional)"}\n  ],\n  "suggestedEmojis": ["😊", "🎉"],\n  "confidence": 0.95\n}`;

    return prompt;
  }

  private getSystemPrompt(tone: string, language: string): string {
    const languageName = language === 'en' ? 'English' : language === 'es' ? 'Spanish' : 'Portuguese';
    
    return `You are an expert social media content creator specializing in tango dance community engagement. 
    
    Your expertise includes:
    - Creating authentic, engaging captions that resonate with the tango community
    - Understanding platform-specific best practices (Instagram, Twitter/X, Facebook, LinkedIn)
    - Crafting ${tone} content that drives engagement
    - Using relevant tango-specific hashtags (#tango, #tangoargentino, #tangodance, #milonga)
    - Writing in fluent ${languageName}
    - Balancing promotional content with community value
    
    Always provide content that:
    - Tells a story or evokes emotion
    - Includes a clear call-to-action when appropriate
    - Respects character limits for each platform
    - Uses platform-appropriate formatting
    - Maintains brand voice consistency`;
  }

  private parseGeneratedContent(content: string, requestedPlatforms: string[]): GeneratedContent {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const platformVariants = requestedPlatforms.map(platform => {
        const variant = parsed.platformVariants?.find((v: any) => v.platform.toLowerCase() === platform.toLowerCase());
        const content = variant?.content || this.adaptContentForPlatform(parsed.caption, platform);
        
        return {
          platform,
          content,
          characterCount: content.length,
        };
      });

      return {
        caption: parsed.caption || '',
        hashtags: parsed.hashtags || [],
        platformVariants,
        suggestedEmojis: parsed.suggestedEmojis || [],
        confidence: parsed.confidence || 0.8,
        aiModel: 'gpt-4o',
      };
    } catch (error) {
      console.error('[ContentGenerator] Failed to parse AI response:', error);
      
      return {
        caption: content.substring(0, 500),
        hashtags: ['#tango', '#tangodance', '#milonga'],
        platformVariants: requestedPlatforms.map(platform => ({
          platform,
          content: this.adaptContentForPlatform(content.substring(0, 500), platform),
          characterCount: content.substring(0, 500).length,
        })),
        confidence: 0.5,
        aiModel: 'gpt-4o',
      };
    }
  }

  private adaptContentForPlatform(content: string, platform: string): string {
    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x':
        return content.substring(0, 260) + (content.length > 260 ? '...' : '');
      
      case 'instagram':
        return content + '\n\n📸✨';
      
      case 'linkedin':
        return content.replace(/[🎉😊💃🕺]/g, '');
      
      case 'facebook':
      default:
        return content;
    }
  }

  async generateHashtags(topic: string, platform: string, count: number = 10): Promise<string[]> {
    const response = await this.orchestrator.queryWithRateLimit(
      'openai',
      'gpt-4o-mini',
      {
        prompt: `Generate ${count} highly effective hashtags for "${topic}" on ${platform}. Mix popular hashtags with niche-specific ones. Format as a JSON array of strings.`,
        temperature: 0.7,
        maxTokens: 200,
      }
    );

    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('[ContentGenerator] Failed to parse hashtags:', error);
    }

    return ['#tango', '#tangodance', '#milonga'];
  }

  async translateContent(content: string, targetLanguage: 'en' | 'es' | 'pt'): Promise<string> {
    const languageMap = {
      en: 'English',
      es: 'Spanish',
      pt: 'Portuguese'
    };

    const response = await this.orchestrator.queryWithRateLimit(
      'anthropic',
      'claude-3-5-sonnet-20241022',
      {
        prompt: `Translate the following social media content to ${languageMap[targetLanguage]}. Maintain the tone, style, and any hashtags:\n\n${content}`,
        temperature: 0.3,
        maxTokens: 500,
      }
    );

    return response.content;
  }
}

export const contentGenerator = new ContentGenerator();
