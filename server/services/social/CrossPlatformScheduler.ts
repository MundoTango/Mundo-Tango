import { storage } from '../../storage';
import { eq } from 'drizzle-orm';

export interface SchedulePostRequest {
  userId: number;
  content: string;
  platforms: string[];
  scheduledFor: Date;
  mediaUrls?: string[];
  campaignId?: number;
  platformConfigs?: Record<string, any>;
}

export interface PublishResult {
  platform: string;
  success: boolean;
  postId?: string;
  error?: string;
  publishedAt?: Date;
  retryCount?: number;
}

export interface SchedulerStats {
  totalScheduled: number;
  totalPublished: number;
  totalFailed: number;
  platformBreakdown: Record<string, {
    scheduled: number;
    published: number;
    failed: number;
  }>;
}

export class CrossPlatformScheduler {
  private static readonly PLATFORM_LIMITS = {
    twitter: { maxLength: 280, imageRequired: false, threadSupport: true },
    x: { maxLength: 280, imageRequired: false, threadSupport: true },
    instagram: { maxLength: 2200, imageRequired: true, threadSupport: false },
    facebook: { maxLength: 63206, imageRequired: false, threadSupport: false },
    linkedin: { maxLength: 3000, imageRequired: false, threadSupport: false },
  };

  private static readonly RATE_LIMITS = {
    twitter: { postsPerHour: 50, minIntervalMinutes: 1 },
    x: { postsPerHour: 50, minIntervalMinutes: 1 },
    instagram: { postsPerDay: 25, minIntervalMinutes: 3 },
    facebook: { postsPerHour: 200, minIntervalMinutes: 0.5 },
    linkedin: { postsPerDay: 100, minIntervalMinutes: 1 },
  };

  async schedulePost(request: SchedulePostRequest): Promise<{ postId: number; scheduledPlatforms: string[] }> {
    const { userId, content, platforms, scheduledFor, mediaUrls, campaignId, platformConfigs } = request;

    const validatedPlatforms = await this.validatePlatforms(userId, platforms, mediaUrls);

    if (validatedPlatforms.length === 0) {
      throw new Error('No valid platforms available for posting');
    }

    const platformVariants = this.createPlatformVariants(content, validatedPlatforms, platformConfigs);

    const post = await storage.createSocialPost(userId, {
      content,
      platforms: validatedPlatforms,
      scheduledFor,
      status: 'scheduled',
      mediaUrls,
    });

    for (const platform of validatedPlatforms) {
      await storage.createAIGeneratedContent({
        campaignId,
        agentId: 122,
        contentType: 'scheduled_post',
        content: platformVariants[platform] || content,
        aiModel: 'cross-platform-scheduler',
        prompt: `Schedule post for ${platform}`,
        approvalStatus: 'approved',
        metadata: {
          postId: post.id,
          platform,
          scheduledFor,
          mediaUrls,
        },
      });
    }

    return {
      postId: post.id,
      scheduledPlatforms: validatedPlatforms,
    };
  }

  private async validatePlatforms(userId: number, platforms: string[], mediaUrls?: string[]): Promise<string[]> {
    const validPlatforms: string[] = [];

    for (const platform of platforms) {
      const normalizedPlatform = platform.toLowerCase();
      const limits = CrossPlatformScheduler.PLATFORM_LIMITS[normalizedPlatform as keyof typeof CrossPlatformScheduler.PLATFORM_LIMITS];

      if (!limits) {
        console.warn(`[CrossPlatformScheduler] Unknown platform: ${platform}`);
        continue;
      }

      if (limits.imageRequired && (!mediaUrls || mediaUrls.length === 0)) {
        console.warn(`[CrossPlatformScheduler] ${platform} requires images but none provided`);
        continue;
      }

      const connections = await storage.getPlatformConnections(userId);
      const connection = connections.find(c => c.platform.toLowerCase() === normalizedPlatform && c.isActive);

      if (!connection) {
        console.warn(`[CrossPlatformScheduler] No active connection for ${platform}`);
        continue;
      }

      if (connection.expiresAt && new Date(connection.expiresAt) < new Date()) {
        console.warn(`[CrossPlatformScheduler] Connection expired for ${platform}`);
        continue;
      }

      validPlatforms.push(normalizedPlatform);
    }

    return validPlatforms;
  }

  private createPlatformVariants(content: string, platforms: string[], configs?: Record<string, any>): Record<string, string> {
    const variants: Record<string, string> = {};

    for (const platform of platforms) {
      const limits = CrossPlatformScheduler.PLATFORM_LIMITS[platform as keyof typeof CrossPlatformScheduler.PLATFORM_LIMITS];
      
      if (!limits) continue;

      let variant = content;

      if (content.length > limits.maxLength) {
        if (limits.threadSupport) {
          variant = this.createThread(content, limits.maxLength);
        } else {
          variant = content.substring(0, limits.maxLength - 3) + '...';
        }
      }

      if (configs && configs[platform]) {
        variant = this.applyPlatformConfig(variant, platform, configs[platform]);
      }

      variants[platform] = variant;
    }

    return variants;
  }

  private createThread(content: string, maxLength: number): string {
    const parts: string[] = [];
    let remaining = content;

    while (remaining.length > 0) {
      if (remaining.length <= maxLength) {
        parts.push(remaining);
        break;
      }

      let cutPoint = remaining.lastIndexOf(' ', maxLength - 10);
      if (cutPoint === -1) cutPoint = maxLength - 10;

      parts.push(remaining.substring(0, cutPoint) + '...');
      remaining = remaining.substring(cutPoint).trim();
    }

    return parts.map((part, i) => `${i + 1}/${parts.length} ${part}`).join('\n\n');
  }

  private applyPlatformConfig(content: string, platform: string, config: any): string {
    let modified = content;

    if (platform === 'instagram' && config.hashtagsInComment) {
      const hashtags = content.match(/#\w+/g) || [];
      modified = content.replace(/#\w+/g, '').trim();
      modified += '\n\n' + hashtags.join(' ');
    }

    if (platform === 'linkedin' && config.professionalTone) {
      modified = modified.replace(/[🎉😊💃🕺]/g, '');
    }

    return modified;
  }

  async publishScheduledPosts(): Promise<PublishResult[]> {
    const now = new Date();
    
    const allScheduledPosts = await storage.getSocialPosts(1, { status: 'scheduled' });
    const scheduledPosts = allScheduledPosts.filter(post => 
      post.scheduledFor && new Date(post.scheduledFor) <= now
    );

    const results: PublishResult[] = [];

    for (const post of scheduledPosts) {
      for (const platform of post.platforms || []) {
        const result = await this.publishToPlatform(post.id, post.userId, platform, post.content, post.mediaUrls);
        results.push(result);

        if (result.success) {
          await storage.updateSocialPost(post.id, {
            status: 'published',
            publishedAt: new Date(),
          });
        }

        await this.delayForRateLimit(platform);
      }
    }

    return results;
  }

  private async publishToPlatform(
    postId: number,
    userId: number,
    platform: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<PublishResult> {
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: string = '';

    while (retryCount < maxRetries) {
      try {
        const connections = await storage.getPlatformConnections(userId);
        const connection = connections.find(c => c.platform.toLowerCase() === platform.toLowerCase() && c.isActive);

        if (!connection) {
          throw new Error(`No active connection for ${platform}`);
        }

        const platformPostId = await this.callPlatformAPI(platform, connection.accessToken, content, mediaUrls);

        return {
          platform,
          success: true,
          postId: platformPostId,
          publishedAt: new Date(),
          retryCount,
        };
      } catch (error: any) {
        lastError = error.message || 'Unknown error';
        retryCount++;

        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return {
      platform,
      success: false,
      error: lastError,
      retryCount,
    };
  }

  private async callPlatformAPI(
    platform: string,
    accessToken: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<string> {
    console.log(`[CrossPlatformScheduler] Publishing to ${platform}`);
    
    return `mock_post_id_${Date.now()}`;
  }

  private async delayForRateLimit(platform: string): Promise<void> {
    const limits = CrossPlatformScheduler.RATE_LIMITS[platform as keyof typeof CrossPlatformScheduler.RATE_LIMITS];
    if (!limits) return;

    const delayMs = limits.minIntervalMinutes * 60 * 1000;
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  async scheduleCampaign(
    userId: number,
    campaignId: number,
    posts: Array<{
      content: string;
      platforms: string[];
      scheduledFor: Date;
      mediaUrls?: string[];
    }>
  ): Promise<{ scheduledPosts: number[]; errors: string[] }> {
    const scheduledPosts: number[] = [];
    const errors: string[] = [];

    let currentDate = new Date(posts[0].scheduledFor);

    for (const postData of posts) {
      try {
        const staggeredDate = new Date(currentDate);
        staggeredDate.setHours(staggeredDate.getHours() + 2);

        const result = await this.schedulePost({
          userId,
          ...postData,
          scheduledFor: staggeredDate,
          campaignId,
        });

        scheduledPosts.push(result.postId);
        currentDate = staggeredDate;
      } catch (error: any) {
        errors.push(error.message || 'Failed to schedule post');
      }
    }

    return { scheduledPosts, errors };
  }

  async getSchedulerStats(userId: number): Promise<SchedulerStats> {
    const posts = await storage.getSocialPosts(userId);

    const stats: SchedulerStats = {
      totalScheduled: 0,
      totalPublished: 0,
      totalFailed: 0,
      platformBreakdown: {},
    };

    posts.forEach(post => {
      if (post.status === 'scheduled') stats.totalScheduled++;
      if (post.status === 'published') stats.totalPublished++;
      if (post.status === 'failed') stats.totalFailed++;

      (post.platforms || []).forEach(platform => {
        if (!stats.platformBreakdown[platform]) {
          stats.platformBreakdown[platform] = {
            scheduled: 0,
            published: 0,
            failed: 0,
          };
        }

        if (post.status === 'scheduled') stats.platformBreakdown[platform].scheduled++;
        if (post.status === 'published') stats.platformBreakdown[platform].published++;
        if (post.status === 'failed') stats.platformBreakdown[platform].failed++;
      });
    });

    return stats;
  }

  async cancelScheduledPost(postId: number, userId: number): Promise<boolean> {
    try {
      const posts = await storage.getSocialPosts(userId);
      const post = posts.find(p => p.id === postId);

      if (!post) {
        throw new Error('Post not found');
      }

      if (post.status !== 'scheduled') {
        throw new Error('Only scheduled posts can be cancelled');
      }

      await storage.updateSocialPost(postId, {
        status: 'cancelled',
      });

      return true;
    } catch (error) {
      console.error('[CrossPlatformScheduler] Failed to cancel post:', error);
      return false;
    }
  }
}

export const crossPlatformScheduler = new CrossPlatformScheduler();
