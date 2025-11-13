import { Router, Request, Response } from 'express';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { legalOrchestrator } from '../services/legal/LegalOrchestrator';
import type { LegalJobData } from '../workers/legalAgentWorker';
import { z } from 'zod';

const router = Router();

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

const legalQueue = new Queue<LegalJobData>('legal-agents', { connection });

/**
 * @route POST /api/legal/agents/review-document
 * @desc Comprehensive document review using Agent #185
 */
router.post('/review-document', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      documentId: z.number().optional(),
      instanceId: z.number().optional(),
      content: z.string().optional(),
      category: z.string().optional(),
      jurisdiction: z.string().optional(),
      industry: z.string().optional(),
      async: z.boolean().optional().default(false)
    });

    const data = schema.parse(req.body);
    const userId = (req.user as any)?.id;

    if (!data.documentId && !data.instanceId && !data.content) {
      return res.status(400).json({
        success: false,
        error: 'Must provide documentId, instanceId, or content'
      });
    }

    // Async processing via BullMQ
    if (data.async) {
      const job = await legalQueue.add('review-document', {
        type: 'review-document',
        documentId: data.documentId,
        instanceId: data.instanceId,
        content: data.content,
        category: data.category,
        jurisdiction: data.jurisdiction,
        industry: data.industry,
        userId
      });

      return res.json({
        success: true,
        jobId: job.id,
        message: 'Document review job queued. Check /api/legal/agents/job-status/:jobId for results.'
      });
    }

    // Synchronous processing
    const review = await legalOrchestrator.reviewAndSaveDocument({
      documentId: data.documentId,
      instanceId: data.instanceId,
      content: data.content,
      category: data.category,
      jurisdiction: data.jurisdiction,
      industry: data.industry,
      userId
    });

    res.json({
      success: true,
      review
    });
  } catch (error: any) {
    console.error('[LegalAgentsRoutes] Error in review-document:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to review document'
    });
  }
});

/**
 * @route POST /api/legal/agents/assist-contract
 * @desc Get contract assistance using Agent #186
 */
router.post('/assist-contract', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      documentId: z.number().optional(),
      instanceId: z.number().optional(),
      category: z.string(),
      jurisdiction: z.string().optional(),
      industry: z.string().optional(),
      eventId: z.number().optional(),
      providedValues: z.record(z.any()).optional(),
      async: z.boolean().optional().default(false)
    });

    const data = schema.parse(req.body);
    const userId = (req.user as any)?.id;

    // Async processing
    if (data.async) {
      const job = await legalQueue.add('assist-contract', {
        type: 'assist-contract',
        documentId: data.documentId,
        instanceId: data.instanceId,
        category: data.category,
        jurisdiction: data.jurisdiction,
        industry: data.industry,
        userId,
        eventId: data.eventId,
        providedValues: data.providedValues
      });

      return res.json({
        success: true,
        jobId: job.id,
        message: 'Contract assistance job queued'
      });
    }

    // Synchronous processing
    const assistance = await legalOrchestrator.assistWithContract({
      documentId: data.documentId,
      instanceId: data.instanceId,
      category: data.category,
      jurisdiction: data.jurisdiction,
      industry: data.industry,
      userId,
      eventId: data.eventId,
      providedValues: data.providedValues
    });

    res.json({
      success: true,
      assistance
    });
  } catch (error: any) {
    console.error('[LegalAgentsRoutes] Error in assist-contract:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to assist with contract'
    });
  }
});

/**
 * @route POST /api/legal/agents/check-compliance
 * @desc Compliance verification
 */
router.post('/check-compliance', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      documentId: z.number().optional(),
      instanceId: z.number().optional(),
      content: z.string().optional(),
      jurisdiction: z.string().optional(),
      async: z.boolean().optional().default(false)
    });

    const data = schema.parse(req.body);

    if (!data.documentId && !data.instanceId && !data.content) {
      return res.status(400).json({
        success: false,
        error: 'Must provide documentId, instanceId, or content'
      });
    }

    // Async processing
    if (data.async) {
      const job = await legalQueue.add('check-compliance', {
        type: 'check-compliance',
        documentId: data.documentId,
        instanceId: data.instanceId,
        content: data.content,
        jurisdiction: data.jurisdiction
      });

      return res.json({
        success: true,
        jobId: job.id,
        message: 'Compliance check job queued'
      });
    }

    // Synchronous processing
    const compliance = await legalOrchestrator.checkCompliance({
      documentId: data.documentId,
      instanceId: data.instanceId,
      content: data.content,
      jurisdiction: data.jurisdiction
    });

    res.json({
      success: true,
      compliance
    });
  } catch (error: any) {
    console.error('[LegalAgentsRoutes] Error in check-compliance:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check compliance'
    });
  }
});

/**
 * @route POST /api/legal/agents/suggest-clauses
 * @desc Get clause recommendations
 */
router.post('/suggest-clauses', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      category: z.string(),
      jurisdiction: z.string().optional(),
      industry: z.string().optional(),
      context: z.string().optional(),
      existingClauses: z.array(z.string()).optional()
    });

    const data = schema.parse(req.body);

    const contractAssistant = legalOrchestrator.getContractAssistant();
    const suggestions = await contractAssistant.suggestClauses({
      category: data.category,
      jurisdiction: data.jurisdiction,
      industry: data.industry,
      context: data.context,
      existingClauses: data.existingClauses
    });

    res.json({
      success: true,
      suggestions
    });
  } catch (error: any) {
    console.error('[LegalAgentsRoutes] Error in suggest-clauses:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to suggest clauses'
    });
  }
});

/**
 * @route GET /api/legal/agents/template-quality/:id
 * @desc Get template quality score
 */
router.get('/template-quality/:id', async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id);
    
    if (isNaN(templateId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid template ID'
      });
    }

    const userId = (req.user as any)?.id;
    const async = req.query.async === 'true';

    // Async processing
    if (async) {
      const job = await legalQueue.add('score-template', {
        type: 'score-template',
        documentId: templateId,
        userId
      });

      return res.json({
        success: true,
        jobId: job.id,
        message: 'Template scoring job queued'
      });
    }

    // Synchronous processing
    const result = await legalOrchestrator.scoreTemplateQuality({
      templateId,
      userId
    });

    res.json({
      success: true,
      qualityScore: result.qualityScore,
      review: result.review
    });
  } catch (error: any) {
    console.error('[LegalAgentsRoutes] Error in template-quality:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to score template quality'
    });
  }
});

/**
 * @route POST /api/legal/agents/compare-documents
 * @desc Compare two document templates
 */
router.post('/compare-documents', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      templateIdA: z.number(),
      templateIdB: z.number(),
      async: z.boolean().optional().default(false)
    });

    const data = schema.parse(req.body);
    const userId = (req.user as any)?.id;

    // Async processing
    if (data.async) {
      const job = await legalQueue.add('compare-templates', {
        type: 'compare-templates',
        templateIdA: data.templateIdA,
        templateIdB: data.templateIdB,
        userId
      });

      return res.json({
        success: true,
        jobId: job.id,
        message: 'Template comparison job queued'
      });
    }

    // Synchronous processing
    const comparison = await legalOrchestrator.compareTemplates({
      templateIdA: data.templateIdA,
      templateIdB: data.templateIdB,
      userId
    });

    res.json({
      success: true,
      comparison
    });
  } catch (error: any) {
    console.error('[LegalAgentsRoutes] Error in compare-documents:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to compare documents'
    });
  }
});

/**
 * @route POST /api/legal/agents/auto-fill
 * @desc Auto-fill document variables
 */
router.post('/auto-fill', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      content: z.string(),
      userId: z.number().optional(),
      eventId: z.number().optional(),
      providedValues: z.record(z.string()).optional()
    });

    const data = schema.parse(req.body);
    const userId = data.userId || (req.user as any)?.id;

    const contractAssistant = legalOrchestrator.getContractAssistant();
    const result = await contractAssistant.autoFillVariables({
      content: data.content,
      userId,
      eventId: data.eventId,
      providedValues: data.providedValues
    });

    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('[LegalAgentsRoutes] Error in auto-fill:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to auto-fill variables'
    });
  }
});

/**
 * @route GET /api/legal/agents/job-status/:jobId
 * @desc Check status of async job
 */
router.get('/job-status/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    const job = await legalQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const state = await job.getState();
    const progress = job.progress;
    const returnValue = job.returnvalue;
    const failedReason = job.failedReason;

    res.json({
      success: true,
      job: {
        id: job.id,
        name: job.name,
        state,
        progress,
        result: returnValue,
        error: failedReason,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn
      }
    });
  } catch (error: any) {
    console.error('[LegalAgentsRoutes] Error in job-status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get job status'
    });
  }
});

/**
 * @route POST /api/legal/agents/negotiate
 * @desc Get negotiation advice
 */
router.post('/negotiate', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      documentContent: z.string(),
      partyRole: z.enum(['provider', 'recipient'])
    });

    const data = schema.parse(req.body);

    const contractAssistant = legalOrchestrator.getContractAssistant();
    const advice = await contractAssistant.provideNegotiationAdvice({
      documentContent: data.documentContent,
      partyRole: data.partyRole
    });

    res.json({
      success: true,
      advice
    });
  } catch (error: any) {
    console.error('[LegalAgentsRoutes] Error in negotiate:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to provide negotiation advice'
    });
  }
});

/**
 * @route POST /api/legal/agents/optimize-workflow
 * @desc Optimize signature workflow
 */
router.post('/optimize-workflow', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      signers: z.array(z.object({
        role: z.string(),
        email: z.string().email().optional()
      })),
      documentType: z.string(),
      urgency: z.enum(['low', 'medium', 'high']).optional()
    });

    const data = schema.parse(req.body);

    const contractAssistant = legalOrchestrator.getContractAssistant();
    const optimization = await contractAssistant.optimizeSignatureWorkflow({
      signers: data.signers,
      documentType: data.documentType,
      urgency: data.urgency
    });

    res.json({
      success: true,
      optimization
    });
  } catch (error: any) {
    console.error('[LegalAgentsRoutes] Error in optimize-workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to optimize workflow'
    });
  }
});

export default router;
