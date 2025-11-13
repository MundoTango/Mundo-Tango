import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { legalOrchestrator } from '../services/legal/LegalOrchestrator';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export interface LegalJobData {
  type: 'review-document' | 'assist-contract' | 'check-compliance' | 'compare-templates' | 'score-template';
  documentId?: number;
  instanceId?: number;
  content?: string;
  category?: string;
  jurisdiction?: string;
  industry?: string;
  userId?: number;
  eventId?: number;
  providedValues?: Record<string, any>;
  templateIdA?: number;
  templateIdB?: number;
}

export const legalAgentWorker = new Worker<LegalJobData>(
  'legal-agents',
  async (job: Job<LegalJobData>) => {
    console.log(`[LegalAgentWorker] Processing job ${job.id}: ${job.data.type}`);

    try {
      switch (job.data.type) {
        case 'review-document':
          return await handleReviewDocument(job);
        
        case 'assist-contract':
          return await handleAssistContract(job);
        
        case 'check-compliance':
          return await handleCheckCompliance(job);
        
        case 'compare-templates':
          return await handleCompareTemplates(job);
        
        case 'score-template':
          return await handleScoreTemplate(job);
        
        default:
          throw new Error(`Unknown job type: ${job.data.type}`);
      }
    } catch (error: any) {
      console.error(`[LegalAgentWorker] Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 3,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  }
);

async function handleReviewDocument(job: Job<LegalJobData>) {
  await job.updateProgress(10);
  
  const { documentId, instanceId, content, category, jurisdiction, industry, userId } = job.data;
  
  console.log(`[LegalAgentWorker] Reviewing document ${documentId || instanceId}`);
  
  const result = await legalOrchestrator.reviewAndSaveDocument({
    documentId,
    instanceId,
    content,
    category,
    jurisdiction,
    industry,
    userId
  });
  
  await job.updateProgress(100);
  console.log(`[LegalAgentWorker] Document review complete. Overall score: ${result.overallScore}/100`);
  
  return {
    success: true,
    review: result
  };
}

async function handleAssistContract(job: Job<LegalJobData>) {
  await job.updateProgress(10);
  
  const { documentId, instanceId, category, jurisdiction, industry, userId, eventId, providedValues } = job.data;
  
  if (!category) {
    throw new Error('Category is required for contract assistance');
  }
  
  console.log(`[LegalAgentWorker] Assisting with contract (category: ${category})`);
  
  const result = await legalOrchestrator.assistWithContract({
    documentId,
    instanceId,
    category,
    jurisdiction,
    industry,
    userId,
    eventId,
    providedValues
  });
  
  await job.updateProgress(100);
  console.log(`[LegalAgentWorker] Contract assistance complete. ${result.clauseRecommendations.length} clause recommendations`);
  
  return {
    success: true,
    assistance: result
  };
}

async function handleCheckCompliance(job: Job<LegalJobData>) {
  await job.updateProgress(10);
  
  const { documentId, instanceId, content, jurisdiction } = job.data;
  
  console.log(`[LegalAgentWorker] Checking compliance for document ${documentId || instanceId}`);
  
  const result = await legalOrchestrator.checkCompliance({
    documentId,
    instanceId,
    content,
    jurisdiction
  });
  
  await job.updateProgress(100);
  console.log(`[LegalAgentWorker] Compliance check complete. Score: ${result.complianceScore}/100`);
  
  return {
    success: true,
    compliance: result
  };
}

async function handleCompareTemplates(job: Job<LegalJobData>) {
  await job.updateProgress(10);
  
  const { templateIdA, templateIdB, userId } = job.data;
  
  if (!templateIdA || !templateIdB) {
    throw new Error('Both template IDs are required for comparison');
  }
  
  console.log(`[LegalAgentWorker] Comparing templates ${templateIdA} and ${templateIdB}`);
  
  const result = await legalOrchestrator.compareTemplates({
    templateIdA,
    templateIdB,
    userId
  });
  
  await job.updateProgress(100);
  console.log(`[LegalAgentWorker] Template comparison complete. ${result.differences.length} differences found`);
  
  return {
    success: true,
    comparison: result
  };
}

async function handleScoreTemplate(job: Job<LegalJobData>) {
  await job.updateProgress(10);
  
  const { documentId, userId } = job.data;
  
  if (!documentId) {
    throw new Error('Document ID is required for template scoring');
  }
  
  console.log(`[LegalAgentWorker] Scoring template ${documentId}`);
  
  const result = await legalOrchestrator.scoreTemplateQuality({
    templateId: documentId,
    userId
  });
  
  await job.updateProgress(100);
  console.log(`[LegalAgentWorker] Template scoring complete. Quality score: ${result.qualityScore}/100`);
  
  return {
    success: true,
    qualityScore: result.qualityScore,
    review: result.review
  };
}

// Worker event listeners
legalAgentWorker.on('completed', (job) => {
  console.log(`[LegalAgentWorker] ✅ Job ${job.id} completed`);
});

legalAgentWorker.on('failed', (job, err) => {
  console.error(`[LegalAgentWorker] ❌ Job ${job?.id} failed:`, err.message);
});

legalAgentWorker.on('error', (err) => {
  console.error('[LegalAgentWorker] Worker error:', err);
});

console.log('[LegalAgentWorker] 🚀 Legal AI Agent Worker started');

export default legalAgentWorker;
