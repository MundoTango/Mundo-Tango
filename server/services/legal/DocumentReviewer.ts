import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';
import { db } from '@shared/db';
import { 
  legalDocuments, 
  documentInstances, 
  legalClauses,
  documentReviews,
  type SelectLegalDocument,
  type SelectDocumentInstance 
} from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface ClauseAnalysis {
  clauseType: string;
  found: boolean;
  content?: string;
  clarity: 'clear' | 'unclear' | 'ambiguous';
  enforceability: 'strong' | 'moderate' | 'weak';
  issues: string[];
}

export interface RiskAssessment {
  overallScore: number; // 0-100 (lower is better)
  factors: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  oneSidedTerms: string[];
  liabilityExposure: string;
  recommendations: string[];
}

export interface ComplianceCheck {
  esignCompliant: boolean;
  uetaCompliant: boolean;
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  jurisdictionSpecific: Record<string, boolean>;
  issues: string[];
  recommendations: string[];
}

export interface PlainLanguageSuggestion {
  original: string;
  simplified: string;
  readabilityScore: number;
  jargonTerms: Array<{
    term: string;
    definition: string;
    suggestion: string;
  }>;
}

export interface DocumentReviewResult {
  documentId?: number;
  instanceId?: number;
  
  // Scores (0-100)
  riskScore: number;
  completenessScore: number;
  clarityScore: number;
  complianceScore: number;
  overallScore: number;
  
  // Detailed analysis
  clauses: ClauseAnalysis[];
  missingClauses: string[];
  riskAssessment: RiskAssessment;
  complianceCheck: ComplianceCheck;
  plainLanguageSuggestions: PlainLanguageSuggestion[];
  inconsistencies: string[];
  
  // Recommendations
  improvementSuggestions: string[];
  templateQualityScore?: number;
  
  // Metadata
  aiModel: string;
  processingTimeMs: number;
  reviewedAt: Date;
}

export class DocumentReviewer {
  private orchestrator: RateLimitedAIOrchestrator;

  constructor() {
    this.orchestrator = new RateLimitedAIOrchestrator();
  }

  async reviewDocument(params: {
    documentId?: number;
    instanceId?: number;
    content?: string;
    category?: string;
    jurisdiction?: string;
    industry?: string;
  }): Promise<DocumentReviewResult> {
    const startTime = Date.now();
    
    let documentContent = params.content;
    let category = params.category;
    let documentId = params.documentId;
    let instanceId = params.instanceId;

    // Fetch document content if not provided
    if (!documentContent) {
      if (params.documentId) {
        const doc = await db.query.legalDocuments.findFirst({
          where: eq(legalDocuments.id, params.documentId)
        });
        if (doc) {
          documentContent = doc.templateContent;
          category = doc.category;
          documentId = doc.id;
        }
      } else if (params.instanceId) {
        const instance = await db.query.documentInstances.findFirst({
          where: eq(documentInstances.id, params.instanceId)
        });
        if (instance) {
          documentContent = instance.filledContent;
          instanceId = instance.id;
        }
      }
    }

    if (!documentContent) {
      throw new Error('No document content provided');
    }

    // Parallel AI analysis calls
    const [
      clauseAnalysisResult,
      riskAssessmentResult,
      complianceCheckResult,
      plainLanguageResult
    ] = await Promise.all([
      this.analyzeClau (...Truncated due to length)
