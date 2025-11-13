import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { contentGenerator, ContentGenerationRequest } from '../services/social/ContentGenerator';
import { postingTimeOptimizer, OptimalTimingRequest } from '../services/social/PostingTimeOptimizer';
import { crossPlatformScheduler, SchedulePostRequest } from '../services/social/CrossPlatformScheduler';
import { engagementAnalyzer } from '../services/social/EngagementAnalyzer';
import { marketingAssistant } from '../services/social/MarketingAssistant';
import { socialMediaOrchestrator, WorkflowRequest } from '../services/social/SocialMediaOrchestrator';

export type SocialMediaJobType =
  | 'generate-content'
  | 'optimize-timing'
  | 'schedule-post'
  | 'publish-scheduled'
  | 'analyze-engagement'
  | 'campaign-strategy'
  | 'daily-report'
  | 'detect-crisis'
  | 'execute-workflow';

export interface SocialMediaJobData {
  jobType: SocialMediaJobType;
  userId: number;
  data?: any;
}

const processSocialMediaJob = async (job: Job<SocialMediaJobData>) => {
  const { jobType, userId, data } = job.data;

  console.log(`[SocialMediaWorker] Processing job: ${jobType} for user ${userId}`);

  try {
    let result: any;

    switch (jobType) {
      case 'generate-content': {
        const request: ContentGenerationRequest = {
          userId,
          ...data,
        };
        result = await contentGenerator.generateContent(request);
        break;
      }

      case 'optimize-timing': {
        const request: OptimalTimingRequest = {
          userId,
          platform: data.platform || 'instagram',
          timezone: data.timezone,
          eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
        };
        result = await postingTimeOptimizer.optimizePostingTime(request);
        break;
      }

      case 'schedule-post': {
        const request: SchedulePostRequest = {
          userId,
          content: data.content,
          platforms: data.platforms,
          scheduledFor: new Date(data.scheduledFor),
          mediaUrls: data.mediaUrls,
          campaignId: data.campaignId,
        };
        result = await crossPlatformScheduler.schedulePost(request);
        break;
      }

      case 'publish-scheduled': {
        result = await crossPlatformScheduler.publishScheduledPosts();
        break;
      }

      case 'analyze-engagement': {
        const dateRange = data.dateRange
          ? {
              start: new Date(data.dateRange.start),
              end: new Date(data.dateRange.end),
            }
          : undefined;
        result = await engagementAnalyzer.analyzeEngagement(userId, dateRange);
        break;
      }

      case 'campaign-strategy': {
        result = await marketingAssistant.generateCampaignStrategy(
          userId,
          data.objective,
          data.platforms,
          data.budget,
          data.duration
        );
        break;
      }

      case 'daily-report': {
        result = await socialMediaOrchestrator.generateDailyReport(userId);
        break;
      }

      case 'detect-crisis': {
        result = await marketingAssistant.detectCrisis(userId);
        break;
      }

      case 'execute-workflow': {
        const request: WorkflowRequest = {
          userId,
          workflowType: data.workflowType || 'quick-post',
          data: data.workflowData || {},
        };
        result = await socialMediaOrchestrator.executeWorkflow(request);
        break;
      }

      default:
        throw new Error(`Unknown job type: ${jobType}`);
    }

    console.log(`[SocialMediaWorker] Job ${jobType} completed successfully`);
    return result;
  } catch (error: any) {
    console.error(`[SocialMediaWorker] Job ${jobType} failed:`, error);
    throw error;
  }
};

const worker = new Worker<SocialMediaJobData>('social-media-agents', processSocialMediaJob, {
  connection: redisConnection,
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 60000,
  },
});

worker.on('completed', (job) => {
  console.log(`[SocialMediaWorker] Job ${job.id} (${job.data.jobType}) completed`);
});

worker.on('failed', (job, error) => {
  console.error(`[SocialMediaWorker] Job ${job?.id} (${job?.data.jobType}) failed:`, error);
});

worker.on('error', (error) => {
  console.error('[SocialMediaWorker] Worker error:', error);
});

console.log('[SocialMediaWorker] Social Media Agent Worker started');

export default worker;
