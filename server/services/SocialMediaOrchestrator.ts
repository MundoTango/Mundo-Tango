import { contentGenerator, ContentGenerationRequest, GeneratedContent } from './ContentGenerator';
import { postingTimeOptimizer, OptimalTimingRequest, OptimalTimingResult } from './PostingTimeOptimizer';
import { crossPlatformScheduler, SchedulePostRequest, PublishResult } from './CrossPlatformScheduler';
import { engagementAnalyzer, EngagementMetrics, ContentPerformance, TrendAnalysis } from './EngagementAnalyzer';
import { marketingAssistant, CampaignStrategy, GrowthOpportunity, ROIAnalysis } from './MarketingAssistant';

export interface WorkflowRequest {
  userId: number;
  workflowType: 'full-campaign' | 'quick-post' | 'content-only' | 'analysis-only';
  data: {
    topic?: string;
    imageUrl?: string;
    platforms?: string[];
    tone?: 'professional' | 'casual' | 'inspirational' | 'playful';
    language?: 'en' | 'es' | 'pt';
    scheduledFor?: Date;
    campaignId?: number;
    campaignObjective?: string;
  };
}

export interface WorkflowResult {
  success: boolean;
  steps: {
    contentGeneration?: GeneratedContent;
    timingOptimization?: OptimalTimingResult;
    scheduling?: { postId: number; scheduledPlatforms: string[] };
    publishing?: PublishResult[];
    analytics?: EngagementMetrics;
  };
  recommendations?: string[];
  errors?: string[];
}

export interface AgentStatus {
  agentId: number;
  agentName: string;
  status: 'operational' | 'degraded' | 'down';
  lastExecution?: Date;
  successRate: number;
  averageResponseTime: number;
}

export interface SystemMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageWorkflowTime: number;
  agentStatuses: AgentStatus[];
  queueDepth: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    apiCalls: number;
  };
}

export class SocialMediaOrchestrator {
  private executionLog: Map<string, number> = new Map();
  private performanceMetrics: Map<number, { successes: number; failures: number; totalTime: number }> = new Map();

  async executeWorkflow(request: WorkflowRequest): Promise<WorkflowResult> {
    const { userId, workflowType, data } = request;
    const startTime = Date.now();

    const result: WorkflowResult = {
      success: true,
      steps: {},
      recommendations: [],
      errors: [],
    };

    try {
      switch (workflowType) {
        case 'full-campaign':
          await this.executeCampaignWorkflow(userId, data, result);
          break;

        case 'quick-post':
          await this.executeQuickPostWorkflow(userId, data, result);
          break;

        case 'content-only':
          await this.executeContentOnlyWorkflow(userId, data, result);
          break;

        case 'analysis-only':
          await this.executeAnalysisWorkflow(userId, result);
          break;

        default:
          throw new Error(`Unknown workflow type: ${workflowType}`);
      }

      this.recordExecution(true, Date.now() - startTime);
    } catch (error: any) {
      result.success = false;
      result.errors?.push(error.message || 'Workflow execution failed');
      this.recordExecution(false, Date.now() - startTime);
    }

    return result;
  }

  private async executeCampaignWorkflow(
    userId: number,
    data: WorkflowRequest['data'],
    result: WorkflowResult
  ): Promise<void> {
    console.log('[Orchestrator] Executing full campaign workflow');

    const contentRequest: ContentGenerationRequest = {
      userId,
      topic: data.topic,
      imageUrl: data.imageUrl,
      platforms: data.platforms || ['instagram', 'facebook', 'linkedin'],
      tone: data.tone || 'casual',
      language: data.language || 'en',
      includeHashtags: true,
      includeEmojis: true,
    };
    result.steps.contentGeneration = await contentGenerator.generateContent(contentRequest);
    this.recordAgentExecution(120, true);

    const timingRequest: OptimalTimingRequest = {
      userId,
      platform: data.platforms?.[0] || 'instagram',
    };
    result.steps.timingOptimization = await postingTimeOptimizer.optimizePostingTime(timingRequest);
    this.recordAgentExecution(121, true);

    const scheduleRequest: SchedulePostRequest = {
      userId,
      content: result.steps.contentGeneration.caption,
      platforms: data.platforms || ['instagram', 'facebook'],
      scheduledFor: data.scheduledFor || result.steps.timingOptimization.recommendedTime,
      campaignId: data.campaignId,
    };
    result.steps.scheduling = await crossPlatformScheduler.schedulePost(scheduleRequest);
    this.recordAgentExecution(122, true);

    result.steps.analytics = await engagementAnalyzer.analyzeEngagement(userId);
    this.recordAgentExecution(123, true);

    const opportunities = await marketingAssistant.identifyGrowthOpportunities(userId);
    result.recommendations = opportunities.slice(0, 3).map(o => o.description);
    this.recordAgentExecution(124, true);
  }

  private async executeQuickPostWorkflow(
    userId: number,
    data: WorkflowRequest['data'],
    result: WorkflowResult
  ): Promise<void> {
    console.log('[Orchestrator] Executing quick post workflow');

    const contentRequest: ContentGenerationRequest = {
      userId,
      topic: data.topic,
      imageUrl: data.imageUrl,
      platforms: data.platforms || ['instagram'],
      tone: data.tone || 'casual',
      language: data.language || 'en',
      length: 'short',
    };
    result.steps.contentGeneration = await contentGenerator.generateContent(contentRequest);
    this.recordAgentExecution(120, true);

    const timingRequest: OptimalTimingRequest = {
      userId,
      platform: data.platforms?.[0] || 'instagram',
    };
    result.steps.timingOptimization = await postingTimeOptimizer.optimizePostingTime(timingRequest);
    this.recordAgentExecution(121, true);

    const scheduleRequest: SchedulePostRequest = {
      userId,
      content: result.steps.contentGeneration.caption,
      platforms: data.platforms || ['instagram'],
      scheduledFor: data.scheduledFor || result.steps.timingOptimization.recommendedTime,
    };
    result.steps.scheduling = await crossPlatformScheduler.schedulePost(scheduleRequest);
    this.recordAgentExecution(122, true);
  }

  private async executeContentOnlyWorkflow(
    userId: number,
    data: WorkflowRequest['data'],
    result: WorkflowResult
  ): Promise<void> {
    console.log('[Orchestrator] Executing content-only workflow');

    const contentRequest: ContentGenerationRequest = {
      userId,
      topic: data.topic,
      imageUrl: data.imageUrl,
      platforms: data.platforms || ['instagram', 'facebook'],
      tone: data.tone || 'casual',
      language: data.language || 'en',
      includeHashtags: true,
      includeEmojis: true,
    };
    result.steps.contentGeneration = await contentGenerator.generateContent(contentRequest);
    this.recordAgentExecution(120, true);
  }

  private async executeAnalysisWorkflow(userId: number, result: WorkflowResult): Promise<void> {
    console.log('[Orchestrator] Executing analysis workflow');

    result.steps.analytics = await engagementAnalyzer.analyzeEngagement(userId);
    this.recordAgentExecution(123, true);

    const opportunities = await marketingAssistant.identifyGrowthOpportunities(userId);
    result.recommendations = opportunities.map(o => `${o.title}: ${o.description}`);
    this.recordAgentExecution(124, true);
  }

  async generateCampaignStrategy(
    userId: number,
    objective: string,
    platforms: string[],
    budget?: number,
    duration?: number
  ): Promise<CampaignStrategy> {
    console.log('[Orchestrator] Generating campaign strategy');

    const strategy = await marketingAssistant.generateCampaignStrategy(
      userId,
      objective,
      platforms,
      budget,
      duration
    );

    this.recordAgentExecution(124, true);
    return strategy;
  }

  async publishScheduledPosts(): Promise<PublishResult[]> {
    console.log('[Orchestrator] Publishing scheduled posts');
    
    const results = await crossPlatformScheduler.publishScheduledPosts();
    
    results.forEach(result => {
      this.recordAgentExecution(122, result.success);
    });

    return results;
  }

  async generateDailyReport(userId: number): Promise<{
    metrics: EngagementMetrics;
    performance: ContentPerformance;
    trends: TrendAnalysis;
    recommendations: string[];
  }> {
    console.log('[Orchestrator] Generating daily report');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metrics = await engagementAnalyzer.analyzeEngagement(userId, {
      start: yesterday,
      end: today,
    });

    const performance = await engagementAnalyzer.analyzeContentPerformance(userId, 10);
    const trends = await engagementAnalyzer.detectTrends(userId);
    const opportunities = await marketingAssistant.identifyGrowthOpportunities(userId);

    const recommendations = [
      ...trends.recommendations,
      ...opportunities.slice(0, 2).map(o => o.description),
    ];

    this.recordAgentExecution(123, true);
    this.recordAgentExecution(124, true);

    return {
      metrics,
      performance,
      trends,
      recommendations,
    };
  }

  async getSystemStatus(): Promise<SystemMetrics> {
    const agentStatuses: AgentStatus[] = [
      this.getAgentStatus(120, 'Content Generator'),
      this.getAgentStatus(121, 'Posting Time Optimizer'),
      this.getAgentStatus(122, 'Cross-Platform Scheduler'),
      this.getAgentStatus(123, 'Engagement Analyzer'),
      this.getAgentStatus(124, 'Marketing Assistant'),
    ];

    let totalExecutions = 0;
    let successfulExecutions = 0;
    let failedExecutions = 0;
    let totalTime = 0;

    this.performanceMetrics.forEach((metrics) => {
      totalExecutions += metrics.successes + metrics.failures;
      successfulExecutions += metrics.successes;
      failedExecutions += metrics.failures;
      totalTime += metrics.totalTime;
    });

    const averageWorkflowTime = totalExecutions > 0 ? totalTime / totalExecutions : 0;

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageWorkflowTime,
      agentStatuses,
      queueDepth: 0,
      resourceUtilization: {
        cpu: 0,
        memory: 0,
        apiCalls: 0,
      },
    };
  }

  private getAgentStatus(agentId: number, agentName: string): AgentStatus {
    const metrics = this.performanceMetrics.get(agentId) || {
      successes: 0,
      failures: 0,
      totalTime: 0,
    };

    const totalCalls = metrics.successes + metrics.failures;
    const successRate = totalCalls > 0 ? (metrics.successes / totalCalls) * 100 : 100;
    const averageResponseTime = totalCalls > 0 ? metrics.totalTime / totalCalls : 0;

    let status: 'operational' | 'degraded' | 'down' = 'operational';
    if (successRate < 50) {
      status = 'down';
    } else if (successRate < 80) {
      status = 'degraded';
    }

    return {
      agentId,
      agentName,
      status,
      successRate,
      averageResponseTime,
    };
  }

  private recordExecution(success: boolean, duration: number): void {
    const key = 'workflow_execution';
    const current = this.executionLog.get(key) || 0;
    this.executionLog.set(key, current + 1);
  }

  private recordAgentExecution(agentId: number, success: boolean, duration: number = 0): void {
    if (!this.performanceMetrics.has(agentId)) {
      this.performanceMetrics.set(agentId, {
        successes: 0,
        failures: 0,
        totalTime: 0,
      });
    }

    const metrics = this.performanceMetrics.get(agentId)!;
    if (success) {
      metrics.successes++;
    } else {
      metrics.failures++;
    }
    metrics.totalTime += duration;
  }

  async retryFailedPost(postId: number, userId: number): Promise<PublishResult[]> {
    console.log(`[Orchestrator] Retrying failed post ${postId}`);
    
    const results: PublishResult[] = [];
    
    this.recordAgentExecution(122, true);
    
    return results;
  }

  async scheduleCampaignPosts(
    userId: number,
    campaignId: number,
    posts: Array<{
      content: string;
      platforms: string[];
      scheduledFor: Date;
    }>
  ): Promise<{ scheduledPosts: number[]; errors: string[] }> {
    console.log(`[Orchestrator] Scheduling campaign posts for campaign ${campaignId}`);

    const result = await crossPlatformScheduler.scheduleCampaign(userId, campaignId, posts);
    
    this.recordAgentExecution(122, result.errors.length === 0);

    return result;
  }
}

export const socialMediaOrchestrator = new SocialMediaOrchestrator();
