// ============================================================================
// AGENT #185: DOCUMENT REVIEWER - Mundo Tango Legal System
// ============================================================================
// Automated legal document review with AI-powered clause analysis, risk
// assessment, compliance checking, and plain language suggestions
// ============================================================================

import type { RateLimitedAIOrchestrator } from '../../services/ai/integration/rate-limited-orchestrator';
import { db } from '@shared/db';
import { legalDocuments, documentInstances, documentReviews, legalClauses } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface ClauseAnalysis {
  clausesFound: string[];
  missingClauses: string[];
  completenessScore: number; // 0-100
  details: {
    liability?: boolean;
    termination?: boolean;
    disputeResolution?: boolean;
    governingLaw?: boolean;
    forceMajeure?: boolean;
    confidentiality?: boolean;
    intellectualProperty?: boolean;
    indemnification?: boolean;
  };
}

export interface RiskAssessment {
  overallRiskScore: number; // 0-100 (higher = riskier)
  riskLevel: 'low' | 'moderate' | 'high';
  riskFactors: string[];
  recommendations: string[];
}

export interface ComplianceCheck {
  compliant: boolean;
  standards: {
    esignAct: boolean;
    ueta: boolean;
    gdpr: boolean;
    ccpa: boolean;
  };
  issues: string[];
  recommendations: string[];
}

export interface PlainLanguageSuggestion {
  jargonTerms: string[];
  suggestions: Array<{
    original: string;
    simplified: string;
    explanation: string;
  }>;
  readabilityScore: number; // Flesch-Kincaid
}

export interface DocumentReviewResult {
  reviewId: number;
  clauseAnalysis: ClauseAnalysis;
  riskAssessment: RiskAssessment;
  complianceCheck: ComplianceCheck;
  plainLanguage: PlainLanguageSuggestion;
  overallScore: number; // 0-100
  recommendations: string[];
  timestamp: Date;
}

/**
 * Agent #185: Document Review Agent
 * Analyzes legal documents for completeness, risk, compliance, and clarity
 */
export class Agent185_DocumentReviewer {
  private aiOrchestrator?: RateLimitedAIOrchestrator;

  constructor(aiOrchestrator?: RateLimitedAIOrchestrator) {
    this.aiOrchestrator = aiOrchestrator;
  }

  /**
   * Perform comprehensive document review
   */
  async reviewDocument(params: {
    content?: string;
    documentId?: number;
    instanceId?: number;
  }): Promise<DocumentReviewResult> {
    console.log('[Agent #185] Starting document review');

    // Get document content
    let documentContent = params.content || '';
    let documentId: number | undefined;
    let instanceId: number | undefined;
    let category: string | undefined;

    if (!params.content) {
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
      this.analyzeClause(documentContent, category),
      this.assessRisk(documentContent),
      this.checkCompliance(documentContent),
      this.suggestPlainLanguage(documentContent)
    ]);

    // Calculate overall score
    const overallScore = Math.round(
      (clauseAnalysisResult.completenessScore * 0.3) +
      ((100 - riskAssessmentResult.overallRiskScore) * 0.3) +
      (complianceCheckResult.compliant ? 25 : 0) +
      (plainLanguageResult.readabilityScore * 0.15)
    );

    // Generate recommendations
    const recommendations: string[] = [];
    if (clauseAnalysisResult.missingClauses.length > 0) {
      recommendations.push(`Add missing clauses: ${clauseAnalysisResult.missingClauses.join(', ')}`);
    }
    if (riskAssessmentResult.riskLevel === 'high') {
      recommendations.push(...riskAssessmentResult.recommendations);
    }
    if (!complianceCheckResult.compliant) {
      recommendations.push(...complianceCheckResult.recommendations);
    }
    if (plainLanguageResult.jargonTerms.length > 5) {
      recommendations.push('Simplify legal jargon for better readability');
    }

    // Save review to database
    const [review] = await db.insert(documentReviews).values({
      documentId,
      instanceId,
      reviewDate: new Date(),
      clauseAnalysis: clauseAnalysisResult,
      riskScore: riskAssessmentResult.overallRiskScore,
      complianceStatus: complianceCheckResult.compliant ? 'compliant' : 'non-compliant',
      recommendations: recommendations.join('\n'),
      reviewedBy: 'Agent #185'
    }).returning();

    console.log(`[Agent #185] Review complete - Score: ${overallScore}/100`);

    return {
      reviewId: review.id,
      clauseAnalysis: clauseAnalysisResult,
      riskAssessment: riskAssessmentResult,
      complianceCheck: complianceCheckResult,
      plainLanguage: plainLanguageResult,
      overallScore,
      recommendations,
      timestamp: new Date()
    };
  }

  /**
   * Analyze document clauses for completeness
   */
  private async analyzeClause(content: string, category?: string): Promise<ClauseAnalysis> {
    const criticalClauses = [
      'liability', 'termination', 'dispute resolution', 'governing law',
      'force majeure', 'confidentiality', 'intellectual property', 'indemnification'
    ];

    const clausesFound: string[] = [];
    const details: any = {};

    // Simple keyword matching (in production, use AI)
    for (const clause of criticalClauses) {
      const regex = new RegExp(clause, 'i');
      if (regex.test(content)) {
        clausesFound.push(clause);
        details[clause.replace(/ /g, '')] = true;
      } else {
        details[clause.replace(/ /g, '')] = false;
      }
    }

    const missingClauses = criticalClauses.filter(c => !clausesFound.includes(c));
    const completenessScore = Math.round((clausesFound.length / criticalClauses.length) * 100);

    return {
      clausesFound,
      missingClauses,
      completenessScore,
      details
    };
  }

  /**
   * Assess document risk level
   */
  private async assessRisk(content: string): Promise<RiskAssessment> {
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Check for one-sided terms
    if (content.toLowerCase().includes('at our sole discretion')) {
      riskFactors.push('One-sided discretionary clauses detected');
      riskScore += 20;
    }

    // Check for unlimited liability
    if (!content.toLowerCase().includes('limitation of liability')) {
      riskFactors.push('No limitation of liability clause');
      riskScore += 30;
    }

    // Check for harsh termination
    if (content.toLowerCase().includes('immediate termination')) {
      riskFactors.push('Immediate termination without notice');
      riskScore += 15;
    }

    // Check for dispute resolution
    if (!content.toLowerCase().includes('arbitration') && !content.toLowerCase().includes('mediation')) {
      riskFactors.push('No alternative dispute resolution');
      riskScore += 10;
    }

    const riskLevel: 'low' | 'moderate' | 'high' =
      riskScore < 30 ? 'low' : riskScore < 60 ? 'moderate' : 'high';

    const recommendations: string[] = [];
    if (riskLevel === 'high') {
      recommendations.push('Add liability limitations');
      recommendations.push('Include notice period for termination');
      recommendations.push('Add arbitration clause for disputes');
    }

    return {
      overallRiskScore: Math.min(riskScore, 100),
      riskLevel,
      riskFactors,
      recommendations
    };
  }

  /**
   * Check compliance with legal standards
   */
  private async checkCompliance(content: string): Promise<ComplianceCheck> {
    const standards = {
      esignAct: content.toLowerCase().includes('electronic signature') || content.toLowerCase().includes('esign'),
      ueta: content.toLowerCase().includes('uniform electronic') || content.toLowerCase().includes('ueta'),
      gdpr: content.toLowerCase().includes('data protection') || content.toLowerCase().includes('gdpr'),
      ccpa: content.toLowerCase().includes('california') && content.toLowerCase().includes('privacy')
    };

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!standards.esignAct) {
      issues.push('Missing ESIGN Act compliance language');
      recommendations.push('Add electronic signature consent clause');
    }

    const compliant = Object.values(standards).filter(Boolean).length >= 2;

    return {
      compliant,
      standards,
      issues,
      recommendations
    };
  }

  /**
   * Suggest plain language alternatives for legal jargon
   */
  private async suggestPlainLanguage(content: string): Promise<PlainLanguageSuggestion> {
    const jargonPatterns = [
      { term: 'hereinafter', simple: 'from now on', explanation: 'Simplifies time reference' },
      { term: 'whereas', simple: 'since', explanation: 'More conversational' },
      { term: 'aforementioned', simple: 'mentioned above', explanation: 'Clearer reference' },
      { term: 'pursuant to', simple: 'according to', explanation: 'Easier to understand' },
      { term: 'notwithstanding', simple: 'despite', explanation: 'Common usage' }
    ];

    const jargonTerms: string[] = [];
    const suggestions: Array<{ original: string; simplified: string; explanation: string }> = [];

    for (const pattern of jargonPatterns) {
      const regex = new RegExp(pattern.term, 'i');
      if (regex.test(content)) {
        jargonTerms.push(pattern.term);
        suggestions.push({
          original: pattern.term,
          simplified: pattern.simple,
          explanation: pattern.explanation
        });
      }
    }

    // Simple readability score (words per sentence)
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    const readabilityScore = Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 2));

    return {
      jargonTerms,
      suggestions,
      readabilityScore: Math.round(readabilityScore)
    };
  }
}
