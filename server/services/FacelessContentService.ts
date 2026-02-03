/**
 * FACELESS CONTENT SERVICE
 * MB.MD v9.9.3 - Automated Content Marketing Pipeline
 * 
 * Pipeline: GROQ Script → ElevenLabs Voice → D-ID Avatar → Final Video
 * 
 * Features:
 * - AI script generation from topics/templates
 * - Voice synthesis with ElevenLabs clones
 * - Avatar video generation with D-ID
 * - Batch processing via BullMQ
 * - Auto-posting to social platforms
 */

import Groq from 'groq-sdk';
import { DIDVideoService } from './didVideoService';
import { voiceCloningService } from './VoiceCloningService';
import { crossPlatformScheduler } from './CrossPlatformScheduler';
import { Queue, Worker } from 'bullmq';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ContentTemplate {
  id: string;
  name: string;
  category: 'tango_tips' | 'event_promo' | 'dance_tutorial' | 'community_spotlight' | 'motivation' | 'custom';
  promptTemplate: string;
  duration: '15s' | '30s' | '60s';
  platforms: ('tiktok' | 'instagram' | 'youtube' | 'facebook')[];
  voiceStyle: 'professional' | 'casual' | 'energetic' | 'calm';
}

export interface ContentRequest {
  templateId?: string;
  customPrompt?: string;
  topic: string;
  duration: '15s' | '30s' | '60s';
  voiceId?: string;
  avatarImageUrl?: string;
  platforms: string[];
  scheduledFor?: Date;
  userId: number;
}

export interface GeneratedScript {
  title: string;
  script: string;
  hashtags: string[];
  estimatedDuration: number;
  callToAction: string;
}

export interface ContentResult {
  id: string;
  status: 'pending' | 'generating_script' | 'generating_voice' | 'generating_video' | 'scheduling' | 'completed' | 'failed';
  script?: GeneratedScript;
  voiceUrl?: string;
  videoUrl?: string;
  scheduledPosts?: { platform: string; postId: number }[];
  error?: string;
  progress: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface BatchRequest {
  templates: string[];
  topics: string[];
  count: number;
  platforms: string[];
  scheduleDays: number;
  userId: number;
}

// ============================================================================
// PRE-BUILT TEMPLATES
// ============================================================================

export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    id: 'tango_tip_beginner',
    name: 'Tango Tip for Beginners',
    category: 'tango_tips',
    promptTemplate: 'Create a 30-second tango tip script for beginners about: {topic}. Be encouraging and practical.',
    duration: '30s',
    platforms: ['tiktok', 'instagram'],
    voiceStyle: 'professional'
  },
  {
    id: 'event_promo',
    name: 'Event Promotion',
    category: 'event_promo',
    promptTemplate: 'Write an exciting 15-second promotional script for a tango event: {topic}. Include urgency and call-to-action.',
    duration: '15s',
    platforms: ['tiktok', 'instagram', 'facebook'],
    voiceStyle: 'energetic'
  },
  {
    id: 'dance_tutorial_step',
    name: 'Dance Step Tutorial',
    category: 'dance_tutorial',
    promptTemplate: 'Create a 60-second tutorial script explaining the tango step: {topic}. Break it down into simple steps.',
    duration: '60s',
    platforms: ['youtube', 'tiktok'],
    voiceStyle: 'professional'
  },
  {
    id: 'community_story',
    name: 'Community Spotlight',
    category: 'community_spotlight',
    promptTemplate: 'Write a heartwarming 30-second story about: {topic}. Focus on the tango community connection.',
    duration: '30s',
    platforms: ['instagram', 'facebook'],
    voiceStyle: 'calm'
  },
  {
    id: 'motivation_daily',
    name: 'Daily Motivation',
    category: 'motivation',
    promptTemplate: 'Create an inspiring 15-second motivation script related to tango and: {topic}. End with a powerful quote.',
    duration: '15s',
    platforms: ['tiktok', 'instagram'],
    voiceStyle: 'energetic'
  },
  {
    id: 'embrace_technique',
    name: 'Embrace Technique',
    category: 'dance_tutorial',
    promptTemplate: 'Explain the proper tango embrace technique focusing on: {topic}. Make it clear for all levels.',
    duration: '30s',
    platforms: ['tiktok', 'youtube'],
    voiceStyle: 'professional'
  },
  {
    id: 'milonga_etiquette',
    name: 'Milonga Etiquette',
    category: 'tango_tips',
    promptTemplate: 'Share milonga etiquette tips about: {topic}. Be respectful of traditions while being accessible.',
    duration: '30s',
    platforms: ['tiktok', 'instagram'],
    voiceStyle: 'professional'
  },
  {
    id: 'music_recommendation',
    name: 'Music Recommendation',
    category: 'tango_tips',
    promptTemplate: 'Recommend tango music related to: {topic}. Explain why dancers will love it.',
    duration: '30s',
    platforms: ['tiktok', 'instagram'],
    voiceStyle: 'casual'
  },
  {
    id: 'partner_connection',
    name: 'Partner Connection',
    category: 'dance_tutorial',
    promptTemplate: 'Discuss building connection with your tango partner focusing on: {topic}. Be warm and insightful.',
    duration: '60s',
    platforms: ['youtube', 'instagram'],
    voiceStyle: 'calm'
  },
  {
    id: 'tango_history',
    name: 'Tango History Moment',
    category: 'community_spotlight',
    promptTemplate: 'Share an interesting tango history fact about: {topic}. Make it engaging and educational.',
    duration: '30s',
    platforms: ['tiktok', 'instagram', 'facebook'],
    voiceStyle: 'professional'
  }
];

// ============================================================================
// FACELESS CONTENT SERVICE
// ============================================================================

export class FacelessContentService {
  private didService: DIDVideoService | null = null;
  private contentQueue: Queue | null = null;
  private results = new Map<string, ContentResult>();

  constructor() {
    try {
      this.didService = new DIDVideoService();
    } catch (error) {
      console.warn('[FacelessContent] D-ID service not available:', error);
    }
  }

  /**
   * Initialize the content processing queue
   */
  async initialize(): Promise<void> {
    if (process.env.REDIS_URL) {
      this.contentQueue = new Queue('faceless-content', {
        connection: { url: process.env.REDIS_URL }
      });
      console.log('[FacelessContent] ✅ Queue initialized');
    } else {
      console.warn('[FacelessContent] Redis not configured, running without queue');
    }
  }

  /**
   * Generate a script from topic and template
   */
  async generateScript(request: ContentRequest): Promise<GeneratedScript> {
    const template = request.templateId 
      ? CONTENT_TEMPLATES.find(t => t.id === request.templateId)
      : null;

    const prompt = template
      ? template.promptTemplate.replace('{topic}', request.topic)
      : request.customPrompt || `Create a ${request.duration} video script about: ${request.topic}`;

    const durationSeconds = parseInt(request.duration) || 30;
    const wordCount = Math.round(durationSeconds * 2.5); // ~150 words per minute

    const systemPrompt = `You are a social media content creator specializing in tango dance content.
Create engaging, platform-optimized scripts for short-form video.
Target word count: ${wordCount} words (for ${request.duration} video).
Format your response as JSON with: title, script, hashtags (array), callToAction`;

    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);

      return {
        title: parsed.title || request.topic,
        script: parsed.script || '',
        hashtags: parsed.hashtags || ['#tango', '#dance', '#argentina'],
        estimatedDuration: durationSeconds,
        callToAction: parsed.callToAction || 'Follow for more tango content!'
      };
    } catch (error) {
      console.error('[FacelessContent] Script generation failed:', error);
      throw new Error('Failed to generate script');
    }
  }

  /**
   * Generate voice audio from script
   */
  async generateVoice(script: string, voiceId?: string): Promise<string> {
    try {
      // Use ElevenLabs via voice cloning service
      const result = await voiceCloningService.synthesizeSpeech(
        voiceId || 'default',
        script
      );
      
      return result.audioUrl || '';
    } catch (error) {
      console.error('[FacelessContent] Voice generation failed:', error);
      throw new Error('Failed to generate voice');
    }
  }

  /**
   * Generate avatar video from voice
   */
  async generateVideo(
    scriptText: string,
    avatarImageUrl: string,
    userId: number
  ): Promise<string> {
    if (!this.didService) {
      throw new Error('D-ID service not configured');
    }

    try {
      const result = await this.didService.createTalkingAvatar(
        scriptText,
        avatarImageUrl,
        userId
      );

      // Poll for completion
      let attempts = 0;
      while (attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const status = await this.didService.checkVideoStatus(result.videoId);
        
        if (status.status === 'done' && status.videoUrl) {
          return status.videoUrl;
        }
        if (status.status === 'error') {
          throw new Error('Video generation failed');
        }
        attempts++;
      }

      throw new Error('Video generation timed out');
    } catch (error) {
      console.error('[FacelessContent] Video generation failed:', error);
      throw error;
    }
  }

  /**
   * Full pipeline: Script → Voice → Video → Schedule
   */
  async createContent(request: ContentRequest): Promise<ContentResult> {
    const id = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result: ContentResult = {
      id,
      status: 'pending',
      progress: 0,
      createdAt: new Date()
    };

    this.results.set(id, result);

    try {
      // Step 1: Generate script (20%)
      result.status = 'generating_script';
      result.progress = 10;
      this.results.set(id, { ...result });

      const script = await this.generateScript(request);
      result.script = script;
      result.progress = 25;
      this.results.set(id, { ...result });

      // Step 2: Generate voice (40%)
      result.status = 'generating_voice';
      result.progress = 30;
      this.results.set(id, { ...result });

      const voiceUrl = await this.generateVoice(script.script, request.voiceId);
      result.voiceUrl = voiceUrl;
      result.progress = 50;
      this.results.set(id, { ...result });

      // Step 3: Generate video (80%)
      result.status = 'generating_video';
      result.progress = 55;
      this.results.set(id, { ...result });

      if (request.avatarImageUrl && this.didService) {
        const videoUrl = await this.generateVideo(
          script.script,
          request.avatarImageUrl,
          request.userId
        );
        result.videoUrl = videoUrl;
      }
      result.progress = 85;
      this.results.set(id, { ...result });

      // Step 4: Schedule posts (100%)
      result.status = 'scheduling';
      result.progress = 90;
      this.results.set(id, { ...result });

      if (request.platforms.length > 0 && result.videoUrl) {
        const scheduleResult = await crossPlatformScheduler.schedulePost({
          userId: request.userId,
          content: `${script.title}\n\n${script.callToAction}\n\n${script.hashtags.join(' ')}`,
          platforms: request.platforms,
          scheduledFor: request.scheduledFor || new Date(),
          mediaUrls: [result.videoUrl]
        });

        result.scheduledPosts = request.platforms.map(p => ({
          platform: p,
          postId: scheduleResult.postId
        }));
      }

      result.status = 'completed';
      result.progress = 100;
      result.completedAt = new Date();
      this.results.set(id, { ...result });

      return result;
    } catch (error: any) {
      result.status = 'failed';
      result.error = error.message;
      this.results.set(id, { ...result });
      throw error;
    }
  }

  /**
   * Batch generate content
   */
  async createBatch(request: BatchRequest): Promise<string[]> {
    const contentIds: string[] = [];
    const topics = request.topics.slice(0, request.count);

    for (let i = 0; i < topics.length; i++) {
      const template = request.templates[i % request.templates.length];
      const scheduleDaysOffset = Math.floor(i / 3); // 3 posts per day

      const contentRequest: ContentRequest = {
        templateId: template,
        topic: topics[i],
        duration: '30s',
        platforms: request.platforms,
        scheduledFor: new Date(Date.now() + scheduleDaysOffset * 24 * 60 * 60 * 1000),
        userId: request.userId
      };

      try {
        const result = await this.createContent(contentRequest);
        contentIds.push(result.id);
      } catch (error) {
        console.error(`[FacelessContent] Batch item ${i} failed:`, error);
      }
    }

    return contentIds;
  }

  /**
   * Get content result by ID
   */
  getResult(id: string): ContentResult | undefined {
    return this.results.get(id);
  }

  /**
   * Get all templates
   */
  getTemplates(): ContentTemplate[] {
    return CONTENT_TEMPLATES;
  }
}

// Singleton instance
export const facelessContentService = new FacelessContentService();
