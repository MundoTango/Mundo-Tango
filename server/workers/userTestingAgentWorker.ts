import { Worker, Job } from 'bullmq';
import { sessionOrchestrator } from '../services/userTesting/SessionOrchestrator';
import { interactionAnalyzer } from '../services/userTesting/InteractionAnalyzer';
import { insightExtractor } from '../services/userTesting/InsightExtractor';
import { knowledgeBaseManager } from '../services/userTesting/KnowledgeBaseManager';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

interface UserTestingAgentJob {
  type:
    | 'orchestrate_session'
    | 'analyze_interactions'
    | 'extract_insights'
    | 'manage_knowledge_base'
    | 'create_bug_report';
  data: any;
}

const worker = new Worker<UserTestingAgentJob>(
  'user-testing-agents',
  async (job: Job<UserTestingAgentJob>) => {
    console.log(`Processing user testing agent job: ${job.data.type}`, job.id);

    try {
      switch (job.data.type) {
        case 'orchestrate_session':
          return await sessionOrchestrator.scheduleSession(
            job.data.data.projectId,
            job.data.data.requirements
          );

        case 'analyze_interactions':
          const heatmap = await interactionAnalyzer.analyzeMouseMovements(
            job.data.data.sessionId,
            job.data.data.mouseEvents
          );

          const clickPatterns = await interactionAnalyzer.analyzeClickPatterns(
            job.data.data.sessionId,
            job.data.data.clickEvents
          );

          const scrollBehavior = await interactionAnalyzer.trackScrollBehavior(
            job.data.data.sessionId,
            job.data.data.scrollEvents
          );

          const confusionIndicators = await interactionAnalyzer.detectConfusion(
            job.data.data.sessionId,
            job.data.data.interactions
          );

          const frustration = await interactionAnalyzer.detectFrustration(
            job.data.data.sessionId,
            job.data.data.behaviors
          );

          return {
            heatmap,
            clickPatterns,
            scrollBehavior,
            confusionIndicators,
            frustrationScore: frustration.score
          };

        case 'extract_insights':
          const transcripts = await insightExtractor.transcribeAudio(
            job.data.data.audioUrl,
            job.data.data.sessionId
          );

          const issues = await insightExtractor.identifyProblems(
            job.data.data.sessionId,
            transcripts,
            job.data.data.interactionData
          );

          const painPoints = await insightExtractor.extractPainPoints(
            job.data.data.sessionId,
            transcripts
          );

          const featureRequests = await insightExtractor.detectFeatureRequests(
            job.data.data.sessionId,
            transcripts
          );

          return await insightExtractor.generateReport(job.data.data.sessionId, {
            transcripts,
            issues,
            painPoints,
            featureRequests
          });

        case 'manage_knowledge_base':
          const patterns = await knowledgeBaseManager.recognizePatterns(
            job.data.data.sessions
          );

          const commonIssues = await knowledgeBaseManager.aggregateCommonIssues(
            job.data.data.sessions
          );

          const recommendations = await knowledgeBaseManager.generateDesignRecommendations(
            commonIssues,
            patterns
          );

          return {
            patterns,
            commonIssues,
            recommendations
          };

        case 'create_bug_report':
          return await knowledgeBaseManager.createBugReport(
            job.data.data.issue,
            job.data.data.sessionDetails
          );

        default:
          throw new Error(`Unknown job type: ${job.data.type}`);
      }
    } catch (error: any) {
      console.error(`User testing agent job failed:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 3
  }
);

worker.on('completed', (job) => {
  console.log(`User testing agent job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`User testing agent job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('User testing agent worker error:', err);
});

export default worker;
