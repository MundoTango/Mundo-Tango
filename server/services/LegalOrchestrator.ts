import { DocumentReviewer, type DocumentReviewResult } from './DocumentReviewer';
import { ContractAssistant, type ClauseRecommendation, type AutoFillResult, type NegotiationAdvice, type TemplateComparison } from './ContractAssistant';
import { db } from '@shared/db';
import { 
  documentReviews,
  documentAuditLogs,
  legalDocuments,
  documentInstances,
  type InsertDocumentReview,
  type InsertDocumentAuditLog
} from '@shared/schema';

export interface DocumentLifecycleEvent {
  event: 'created' | 'reviewed' | 'updated' | 'signed' | 'expired' | 'terminated';
  documentId?: number;
  instanceId?: number;
  userId?: number;
  metadata?: Record<string, any>;
}

export class LegalOrchestrator {
  private documentReviewer: DocumentReviewer;
  private contractAssistant: ContractAssistant;

  constructor() {
    this.documentReviewer = new DocumentReviewer();
    this.contractAssistant = new ContractAssistant();
  }

  async reviewAndSaveDocument(params: {
    documentId?: number;
    instanceId?: number;
    content?: string;
    category?: string;
    jurisdiction?: string;
    industry?: string;
    userId?: number;
  }): Promise<DocumentReviewResult> {
    const startTime = Date.now();
    
    // Perform review using Agent #185
    const review = await this.documentReviewer.reviewDocument({
      documentId: params.documentId,
      instanceId: params.instanceId,
      content: params.content,
      category: params.category,
      jurisdiction: params.jurisdiction,
      industry: params.industry
    });

    // Save review to database
    try {
      const reviewRecord: InsertDocumentReview = {
        documentId: params.documentId || null,
        instanceId: params.instanceId || null,
        agentType: 'document-reviewer',
        riskScore: review.riskScore,
        completenessScore: review.completenessScore,
        clarityScore: review.clarityScore,
        complianceScore: review.complianceScore,
        overallScore: review.overallScore,
        identifiedClauses: review.clauses as any,
        missingClauses: review.missingClauses as any,
        riskFactors: review.riskAssessment.factors as any,
        complianceIssues: review.complianceCheck.issues as any,
        suggestions: review.improvementSuggestions as any,
        plainLanguageAlternatives: review.plainLanguageSuggestions as any,
        aiModel: review.aiModel,
        processingTimeMs: review.processingTimeMs
      };

      await db.insert(documentReviews).values(reviewRecord);

      // Log the review action
      if (params.userId) {
        await this.logAction({
          documentId: params.documentId,
          instanceId: params.instanceId,
          userId: params.userId,
          action: 'document_reviewed',
          entityType: params.documentId ? 'template' : 'instance',
          entityId: params.documentId || params.instanceId,
          metadata: {
            overallScore: review.overallScore,
            riskScore: review.riskScore,
            processingTimeMs: Date.now() - startTime
          }
        });
      }
    } catch (error) {
      console.error('[LegalOrchestrator] Failed to save review:', error);
    }

    return review;
  }

  async assistWithContract(params: {
    documentId?: number;
    instanceId?: number;
    category: string;
    jurisdiction?: string;
    industry?: string;
    userId?: number;
    eventId?: number;
    providedValues?: Record<string, any>;
  }): Promise<{
    clauseRecommendations: ClauseRecommendation[];
    autoFillResult?: AutoFillResult;
    expirationRecommendation?: any;
  }> {
    // Get clause recommendations using Agent #186
    const clauseRecommendations = await this.contractAssistant.suggestClauses({
      category: params.category,
      jurisdiction: params.jurisdiction,
      industry: params.industry
    });

    let autoFillResult: AutoFillResult | undefined;
    let expirationRecommendation: any;

    // If we have a document instance, try auto-fill
    if (params.instanceId) {
      const instance = await db.query.documentInstances.findFirst({
        where: (instances, { eq }) => eq(instances.id, params.instanceId)
      });

      if (instance) {
        autoFillResult = await this.contractAssistant.autoFillVariables({
          content: instance.filledContent,
          userId: params.userId,
          eventId: params.eventId,
          providedValues: params.providedValues
        });
      }
    }

    // Get expiration recommendation
    expirationRecommendation = await this.contractAssistant.recommendExpirationDate({
      documentType: params.category,
      jurisdiction: params.jurisdiction,
      industry: params.industry
    });

    // Log the assistance action
    if (params.userId) {
      await this.logAction({
        documentId: params.documentId,
        instanceId: params.instanceId,
        userId: params.userId,
        action: 'contract_assistance_provided',
        entityType: params.documentId ? 'template' : 'instance',
        entityId: params.documentId || params.instanceId,
        metadata: {
          clauseCount: clauseRecommendations.length,
          autoFillApplied: !!autoFillResult
        }
      });
    }

    return {
      clauseRecommendations,
      autoFillResult,
      expirationRecommendation
    };
  }

  async checkCompliance(params: {
    documentId?: number;
    instanceId?: number;
    content?: string;
    jurisdiction?: string;
  }): Promise<any> {
    // Use documentReviewer's compliance checking
    const review = await this.documentReviewer.reviewDocument({
      documentId: params.documentId,
      instanceId: params.instanceId,
      content: params.content,
      jurisdiction: params.jurisdiction
    });

    return {
      complianceScore: review.complianceScore,
      complianceCheck: review.complianceCheck,
      issues: review.complianceCheck.issues,
      recommendations: review.complianceCheck.recommendations
    };
  }

  async compareTemplates(params: {
    templateIdA: number;
    templateIdB: number;
    userId?: number;
  }): Promise<TemplateComparison> {
    const comparison = await this.contractAssistant.compareTemplates({
      templateIdA: params.templateIdA,
      templateIdB: params.templateIdB
    });

    // Log the comparison
    if (params.userId) {
      await this.logAction({
        userId: params.userId,
        action: 'templates_compared',
        entityType: 'template',
        metadata: {
          templateIdA: params.templateIdA,
          templateIdB: params.templateIdB,
          differenceCount: comparison.differences.length
        }
      });
    }

    return comparison;
  }

  async scoreTemplateQuality(params: {
    templateId: number;
    userId?: number;
  }): Promise<{
    qualityScore: number;
    review: DocumentReviewResult;
  }> {
    const review = await this.reviewAndSaveDocument({
      documentId: params.templateId,
      userId: params.userId
    });

    const qualityScore = (
      review.completenessScore * 0.3 +
      review.clarityScore * 0.25 +
      review.complianceScore * 0.25 +
      (100 - review.riskScore) * 0.2
    );

    return {
      qualityScore: Math.round(qualityScore),
      review
    };
  }

  async handleDocumentLifecycleEvent(event: DocumentLifecycleEvent): Promise<void> {
    const { event: eventType, documentId, instanceId, userId, metadata } = event;

    // Log the lifecycle event
    await this.logAction({
      documentId,
      instanceId,
      userId,
      action: `document_${eventType}`,
      entityType: documentId ? 'template' : 'instance',
      entityId: documentId || instanceId,
      metadata
    });

    // Trigger automated workflows based on event
    switch (eventType) {
      case 'created':
        // Auto-review new documents
        if (documentId || instanceId) {
          await this.reviewAndSaveDocument({
            documentId,
            instanceId,
            userId
          });
        }
        break;

      case 'signed':
        // Update agreement status, trigger completion workflows
        console.log(`[LegalOrchestrator] Document signed: ${documentId || instanceId}`);
        break;

      case 'expired':
        // Notify stakeholders, update status
        console.log(`[LegalOrchestrator] Document expired: ${documentId || instanceId}`);
        break;
    }
  }

  async logAction(params: {
    documentId?: number;
    instanceId?: number;
    userId?: number;
    action: string;
    entityType: string;
    entityId?: number;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      const logEntry: InsertDocumentAuditLog = {
        documentId: params.documentId || null,
        instanceId: params.instanceId || null,
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        changes: params.changes as any || null,
        metadata: params.metadata as any || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null
      };

      await db.insert(documentAuditLogs).values(logEntry);
    } catch (error) {
      console.error('[LegalOrchestrator] Failed to log action:', error);
    }
  }

  getDocumentReviewer(): DocumentReviewer {
    return this.documentReviewer;
  }

  getContractAssistant(): ContractAssistant {
    return this.contractAssistant;
  }
}

export const legalOrchestrator = new LegalOrchestrator();
