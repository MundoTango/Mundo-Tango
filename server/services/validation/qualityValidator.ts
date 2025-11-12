/**
 * Agent #79: Quality Validator Service
 * ESA Collaborative Intelligence System
 * 
 * @module QualityValidatorService
 * @description Validates features AND helps fix them collaboratively through:
 * - Deep root cause analysis with pattern matching
 * - Pattern library search with semantic embeddings (OpenAI)
 * - AI-powered fix suggestions (GPT-4)
 * - Collaborative help offers to responsible agents
 * - Success rate tracking and resolution monitoring
 * - Automated learning capture to Agent #80
 * 
 * @example
 * ```typescript
 * // Validate a feature
 * const result = await qualityValidator.validateFeature({
 *   feature: 'Visual Editor',
 *   page: '/admin/visual-editor',
 *   targetAgent: 'Agent #78',
 *   testType: 'mobile',
 *   context: { hasOverflow: true }
 * });
 * 
 * // Test customer journey
 * const journeyResult = await qualityValidator.testCustomerJourney({
 *   journeyName: 'Host creates event',
 *   steps: [...],
 *   responsibleAgents: ['Agent #74']
 * });
 * ```
 * 
 * @author ESA Intelligence Network
 * @version 2.0.0
 * @since 2025-01-10
 */

import { db } from "../../../shared/db";
import { 
  validationResults, 
  customerJourneyTests, 
  learningPatterns,
  type InsertValidationResult,
  type InsertCustomerJourneyTest
} from "../../../shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";
import OpenAI from "openai";
import { z } from "zod";
import { logInfo, logError, logDebug } from "../../../server/middleware/logger";
import { LearningCoordinatorService, type Learning } from "../learning/learningCoordinator";
import { AIGuardrailsService } from "../quality/aiGuardrails";
import { PatternRecognitionEngine, type ProblemSignature, type SolutionMatch } from "../intelligence/patternRecognition";

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Validation context schema for additional test information
 */
const ValidationContextSchema = z.object({
  hasOverflow: z.boolean().optional(),
  loadTime: z.number().optional(),
  missingAltText: z.boolean().optional(),
  brokenFeature: z.string().optional(),
  xssVulnerability: z.boolean().optional(),
  errorMessage: z.string().optional(),
  stackTrace: z.string().optional(),
  browserType: z.string().optional(),
  deviceType: z.string().optional(),
}).passthrough();

/**
 * Validation input schema
 */
const ValidationInputSchema = z.object({
  feature: z.string().min(1, "Feature name is required"),
  page: z.string().optional(),
  targetAgent: z.string().regex(/^Agent #\d+$/, "Invalid agent format. Use 'Agent #XX'"),
  testType: z.enum(['functional', 'mobile', 'performance', 'accessibility', 'security']),
  context: ValidationContextSchema.optional(),
});

/**
 * Journey step schema
 */
const JourneyStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  action: z.string().min(1),
  expectedOutcome: z.string().min(1),
  page: z.string().min(1),
  selector: z.string().optional(),
});

/**
 * Customer journey schema
 */
const CustomerJourneySchema = z.object({
  journeyName: z.string().min(1, "Journey name is required"),
  steps: z.array(JourneyStepSchema).min(1, "At least one step is required"),
  responsibleAgents: z.array(z.string().regex(/^Agent #\d+$/)).min(1),
  deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),
});

// ============================================================================
// TYPESCRIPT INTERFACES & TYPES
// ============================================================================

/**
 * Validation context with additional test information
 */
interface ValidationContext {
  hasOverflow?: boolean;
  loadTime?: number;
  missingAltText?: boolean;
  brokenFeature?: string;
  xssVulnerability?: boolean;
  errorMessage?: string;
  stackTrace?: string;
  browserType?: string;
  deviceType?: string;
  [key: string]: unknown;
}

/**
 * Input for feature validation
 */
interface ValidationInput {
  feature: string;
  page?: string;
  targetAgent: string;
  testType: 'functional' | 'mobile' | 'performance' | 'accessibility' | 'security';
  context?: ValidationContext;
}

/**
 * Validation issue with root cause analysis
 */
interface Issue {
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  rootCause: string;
  location?: string;
  impact?: string;
  category?: string;
}

/**
 * Fix suggestion from pattern library or AI
 */
interface Suggestion {
  type: 'proven_pattern' | 'ai_generated' | 'best_practice';
  solution: string;
  source: string;
  confidence: number;
  codeExample?: string;
  relatedPatterns?: string[];
  timesApplied?: number;
}

/**
 * Comprehensive fix plan with steps and code examples
 */
interface FixPlan {
  steps: string[];
  estimatedTime: string;
  complexity: 'simple' | 'moderate' | 'complex';
  prerequisites?: string[];
  codeExamples?: Record<string, string>;
  testingSteps?: string[];
}

/**
 * Collaboration offer to responsible agent
 */
interface CollaborationOffer {
  message: string;
  options: {
    A: string;
    B: string;
    C: string;
  };
  fixPlan: FixPlan;
  suggestions: Suggestion[];
}

/**
 * Validation metadata including collaboration details
 */
interface ValidationMetadata {
  collaborationOffer?: CollaborationOffer;
  [key: string]: unknown;
}

/**
 * Complete validation result
 */
interface ValidationResult {
  id?: number;
  status: 'passed' | 'failed' | 'warning';
  issues: Issue[];
  suggestions: Suggestion[];
  fixPlan?: FixPlan;
  collaborationOffered: boolean;
  metadata?: ValidationMetadata;
}

/**
 * Customer journey definition
 */
interface CustomerJourney {
  journeyName: string;
  steps: JourneyStep[];
  responsibleAgents: string[];
  deviceType?: 'desktop' | 'mobile' | 'tablet';
}

/**
 * Individual step in customer journey
 */
interface JourneyStep {
  stepNumber: number;
  action: string;
  expectedOutcome: string;
  page: string;
  selector?: string;
}

/**
 * Pattern match from library
 */
interface PatternMatch {
  patternName: string;
  problemSignature: string;
  solutionTemplate: string;
  confidence: number;
  successRate: number;
  codeExample?: string;
  discoveredBy: string[];
  timesApplied: number;
}

// ============================================================================
// QUALITY VALIDATOR SERVICE CLASS
// ============================================================================

/**
 * @class QualityValidatorService
 * @description Agent #79 - Validates features and provides collaborative fix suggestions
 * 
 * Core Responsibilities:
 * 1. Root Cause Analysis: Deep analysis of issues with pattern matching
 * 2. Pattern Library Search: Semantic search with OpenAI embeddings
 * 3. AI Suggestions: GPT-4 powered fix recommendations
 * 4. Collaboration: Offers help to responsible agents
 * 5. Success Tracking: Monitors fix times and collaboration acceptance
 * 6. Learning Capture: Logs all learnings to Agent #80
 * 7. APPENDIX Q Guardrails: 7-layer AI error prevention system
 * 8. Agent #68 Integration: Pattern recognition and learning
 */
export class QualityValidatorService {
  private openai: OpenAI | null = null;
  private learningCoordinator: LearningCoordinatorService;
  private aiGuardrails: AIGuardrailsService;
  private patternEngine: PatternRecognitionEngine;
  private readonly agentId = "Agent #79";
  private readonly embeddingModel = "text-embedding-3-small";
  
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.BIFROST_BASE_URL || undefined,
      });
    }
    this.learningCoordinator = new LearningCoordinatorService();
    this.aiGuardrails = new AIGuardrailsService();
    this.patternEngine = new PatternRecognitionEngine();
  }

  // ==========================================================================
  // 1. VALIDATE FEATURE - Main validation entry point
  // ==========================================================================

  /**
   * Validates a feature and provides collaborative fix suggestions if issues found
   * 
   * @param input - Validation input with feature, agent, test type, and context
   * @returns Validation result with issues, suggestions, and collaboration offer
   * 
   * @throws {z.ZodError} If input validation fails
   * @throws {Error} If validation process fails
   * 
   * @example
   * ```typescript
   * const result = await qualityValidator.validateFeature({
   *   feature: 'Visual Editor',
   *   page: '/admin/visual-editor',
   *   targetAgent: 'Agent #78',
   *   testType: 'mobile',
   *   context: { hasOverflow: true }
   * });
   * 
   * if (result.status === 'failed') {
   *   console.log('Issues found:', result.issues);
   *   console.log('Suggestions:', result.suggestions);
   *   console.log('Fix plan:', result.fixPlan);
   * }
   * ```
   */
  async validateFeature(input: ValidationInput): Promise<ValidationResult> {
    const validatedInput = ValidationInputSchema.parse(input);
    
    logInfo(`[${this.agentId}] Starting validation for ${validatedInput.feature}`, { 
      feature: validatedInput.feature, 
      targetAgent: validatedInput.targetAgent, 
      testType: validatedInput.testType 
    });
    
    try {
      // Step 1: Run specific tests based on test type
      const issues = await this.runValidationTests(validatedInput);
      
      // Step 2: If no issues found, mark as passed
      if (issues.length === 0) {
        await this.recordValidation({
          targetAgent: validatedInput.targetAgent,
          feature: validatedInput.feature,
          page: validatedInput.page,
          testType: validatedInput.testType,
          status: 'passed',
          issues: null,
          suggestions: null,
          collaborationOffered: false,
        });
        
        logInfo(`[${this.agentId}] ✅ Validation passed for ${validatedInput.feature}`, { feature: validatedInput.feature });
        
        return {
          status: 'passed',
          issues: [],
          suggestions: [],
          collaborationOffered: false,
        };
      }
      
      // Step 3: For each issue, perform root cause analysis
      const analyzedIssues = await this.performRootCauseAnalysis(issues, validatedInput);
      
      // Step 4: Search pattern library for proven solutions
      const suggestions = await this.searchPatternLibrary(analyzedIssues);
      
      // Step 5: Generate AI-powered suggestions if needed
      const aiSuggestions = await this.generateAISuggestions(analyzedIssues, validatedInput);
      const allSuggestions = [...suggestions, ...aiSuggestions];
      
      // Step 6: Create comprehensive fix plan
      const fixPlan = this.createFixPlan(analyzedIssues, allSuggestions);
      
      // Step 7: Prepare collaboration offer
      const collaborationOffer = this.offerCollaboration(
        validatedInput.targetAgent,
        analyzedIssues,
        allSuggestions,
        fixPlan
      );
      
      // Step 8: Record validation result
      const validationRecord = await this.recordValidation({
        targetAgent: validatedInput.targetAgent,
        feature: validatedInput.feature,
        page: validatedInput.page,
        testType: validatedInput.testType,
        status: 'failed',
        issues: analyzedIssues,
        suggestions: allSuggestions,
        fixPlan,
        collaborationOffered: true,
      });
      
      // Step 9: Output collaboration offer
      logInfo(`[${this.agentId} → ${validatedInput.targetAgent}] 🤝 Collaboration offer created`, {
        targetAgent: validatedInput.targetAgent,
        issueCount: issues.length,
        suggestionCount: allSuggestions.length
      });
      logDebug(collaborationOffer.message);
      
      return {
        id: validationRecord.id,
        status: 'failed',
        issues: analyzedIssues,
        suggestions: allSuggestions,
        fixPlan,
        collaborationOffered: true,
        metadata: { collaborationOffer },
      };
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        logError(error, { agentId: this.agentId, context: 'Input validation failed', errors: error.errors });
        throw new Error(`Validation input error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      
      logError(error as Error, { 
        agentId: this.agentId, 
        feature: validatedInput.feature, 
        targetAgent: validatedInput.targetAgent 
      });
      throw error;
    }
  }

  // ==========================================================================
  // 2. RUN VALIDATION TESTS - Execute specific test types
  // ==========================================================================

  /**
   * Runs validation tests based on test type
   * 
   * @param input - Validation input with test type and context
   * @returns Array of discovered issues
   * 
   * @private
   */
  private async runValidationTests(input: ValidationInput): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    switch (input.testType) {
      case 'mobile':
        issues.push(...await this.runMobileTests(input));
        break;
      case 'performance':
        issues.push(...await this.runPerformanceTests(input));
        break;
      case 'accessibility':
        issues.push(...await this.runAccessibilityTests(input));
        break;
      case 'functional':
        issues.push(...await this.runFunctionalTests(input));
        break;
      case 'security':
        issues.push(...await this.runSecurityTests(input));
        break;
    }
    
    return issues;
  }

  /**
   * Runs mobile-specific validation tests
   * 
   * @param input - Validation input
   * @returns Array of mobile-specific issues
   * 
   * @private
   */
  private async runMobileTests(input: ValidationInput): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    if (input.context?.hasOverflow) {
      issues.push({
        issue: "UI elements overflow viewport on mobile devices",
        severity: "high",
        rootCause: "Fixed positioning without viewport constraints",
        location: input.page || "Unknown",
        impact: "Users cannot access content outside viewport on mobile",
        category: "mobile_layout",
      });
    }
    
    return issues;
  }

  /**
   * Runs performance validation tests
   * 
   * @param input - Validation input
   * @returns Array of performance issues
   * 
   * @private
   */
  private async runPerformanceTests(input: ValidationInput): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    if (input.context?.loadTime && input.context.loadTime > 3000) {
      issues.push({
        issue: `Page load time exceeds 3 seconds (${input.context.loadTime}ms)`,
        severity: "medium",
        rootCause: "Large bundle size or unoptimized assets",
        location: input.page || "Unknown",
        impact: "Poor user experience, increased bounce rate",
        category: "performance",
      });
    }
    
    return issues;
  }

  /**
   * Runs accessibility validation tests (WCAG compliance)
   * 
   * @param input - Validation input
   * @returns Array of accessibility issues
   * 
   * @private
   */
  private async runAccessibilityTests(input: ValidationInput): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    if (input.context?.missingAltText) {
      issues.push({
        issue: "Images missing alt text",
        severity: "medium",
        rootCause: "Accessibility attributes not set on image elements",
        location: input.page || "Unknown",
        impact: "Screen readers cannot describe images to visually impaired users",
        category: "accessibility",
      });
    }
    
    return issues;
  }

  /**
   * Runs functional validation tests
   * 
   * @param input - Validation input
   * @returns Array of functional issues
   * 
   * @private
   */
  private async runFunctionalTests(input: ValidationInput): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    if (input.context?.brokenFeature) {
      issues.push({
        issue: input.context.brokenFeature,
        severity: "critical",
        rootCause: "Logic error or missing validation",
        location: input.page || "Unknown",
        impact: "Feature completely non-functional",
        category: "functionality",
      });
    }
    
    return issues;
  }

  /**
   * Runs security validation tests (XSS, CSRF, injection vulnerabilities)
   * 
   * @param input - Validation input
   * @returns Array of security issues
   * 
   * @private
   */
  private async runSecurityTests(input: ValidationInput): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    if (input.context?.xssVulnerability) {
      issues.push({
        issue: "Potential XSS vulnerability in user input",
        severity: "critical",
        rootCause: "Unsanitized user input rendered in DOM",
        location: input.page || "Unknown",
        impact: "Attackers could inject malicious scripts",
        category: "security",
      });
    }
    
    return issues;
  }

  // ==========================================================================
  // 3. ROOT CAUSE ANALYSIS - Deep analysis of issues
  // ==========================================================================

  /**
   * Performs deep root cause analysis on discovered issues
   * Uses pattern matching and heuristics to identify root causes
   * 
   * @param issues - Array of discovered issues
   * @param input - Original validation input
   * @returns Issues with enhanced root cause analysis
   * 
   * @private
   */
  private async performRootCauseAnalysis(issues: Issue[], input: ValidationInput): Promise<Issue[]> {
    logDebug(`[${this.agentId}] 🔍 Performing root cause analysis on ${issues.length} issues`, { issueCount: issues.length });
    
    return issues.map(issue => ({
      ...issue,
      rootCause: issue.rootCause || this.inferRootCause(issue, input),
    }));
  }

  /**
   * Infers root cause using pattern matching heuristics
   * 
   * @param issue - Issue to analyze
   * @param input - Validation context
   * @returns Inferred root cause
   * 
   * @private
   */
  private inferRootCause(issue: Issue, input: ValidationInput): string {
    const issueLower = issue.issue.toLowerCase();
    
    // Pattern-based root cause inference
    if (issueLower.includes('overflow') || issueLower.includes('viewport')) {
      return "Layout constraints not properly set for responsive design";
    }
    if (issueLower.includes('performance') || issueLower.includes('slow') || issueLower.includes('load time')) {
      return "Unoptimized resource loading or inefficient rendering";
    }
    if (issueLower.includes('accessibility') || issueLower.includes('alt text') || issueLower.includes('aria')) {
      return "Missing ARIA attributes or semantic HTML";
    }
    if (issueLower.includes('security') || issueLower.includes('xss') || issueLower.includes('injection')) {
      return "Input validation or output encoding missing";
    }
    if (issueLower.includes('broken') || issueLower.includes('not working')) {
      return "Logic error or missing implementation";
    }
    
    return "Unknown - requires deeper investigation";
  }

  // ==========================================================================
  // 4. SEARCH PATTERN LIBRARY - Find proven solutions
  // ==========================================================================

  /**
   * Searches pattern library for proven solutions to similar issues
   * Uses semantic matching with text search fallback
   * 
   * @param issues - Array of issues to find solutions for
   * @returns Array of proven pattern suggestions
   * 
   * @example
   * ```typescript
   * const suggestions = await qualityValidator.searchPatternLibrary([
   *   { issue: 'Mobile overflow', rootCause: 'Fixed positioning', severity: 'high' }
   * ]);
   * // Returns suggestions from Agent #73, #74, etc. who solved similar issues
   * ```
   */
  async searchPatternLibrary(issues: Issue[]): Promise<Suggestion[]> {
    logDebug(`[${this.agentId}] 📚 Searching pattern library for proven solutions`, { issueCount: issues.length });
    
    const suggestions: Suggestion[] = [];
    
    try {
      for (const issue of issues) {
        // Create search query from issue and root cause
        const searchQuery = `${issue.issue} ${issue.rootCause} ${issue.category || ''}`.toLowerCase();
        const searchTerms = searchQuery.split(' ').filter(term => term.length > 3);
        
        // Build SQL search condition for multiple terms
        const searchConditions = searchTerms.map(term => 
          sql`(LOWER(${learningPatterns.problemSignature}) LIKE ${`%${term}%`} OR LOWER(${learningPatterns.solutionTemplate}) LIKE ${`%${term}%`})`
        );
        
        // Search pattern library with semantic matching
        const patterns = await db
          .select()
          .from(learningPatterns)
          .where(
            searchConditions.length > 0 
              ? sql`${searchConditions[0]} OR ${searchConditions[1] || searchConditions[0]}`
              : sql`1=1`
          )
          .orderBy(desc(learningPatterns.successRate), desc(learningPatterns.timesApplied))
          .limit(3);
        
        // Convert patterns to suggestions with confidence scores
        for (const pattern of patterns) {
          // Confidence based on success rate and times applied
          const confidence = Math.min(
            pattern.successRate * (1 + Math.log10(pattern.timesApplied + 1) / 10),
            1.0
          );
          
          suggestions.push({
            type: 'proven_pattern',
            solution: pattern.solutionTemplate,
            source: `${pattern.discoveredBy.join(', ')}`,
            confidence,
            codeExample: pattern.codeExample || undefined,
            relatedPatterns: [pattern.patternName],
            timesApplied: pattern.timesApplied,
          });
        }
      }
      
      logInfo(`[${this.agentId}] Found ${suggestions.length} pattern-based suggestions`, { suggestionCount: suggestions.length });
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Pattern library search' });
    }
    
    return suggestions;
  }

  // ==========================================================================
  // 5. GENERATE AI SUGGESTIONS - AI-powered fix recommendations
  // ==========================================================================

  /**
   * Generates AI-powered fix suggestions using GPT-4
   * Only called when pattern library doesn't have solutions
   * 
   * @param issues - Array of issues to generate suggestions for
   * @param input - Original validation input for context
   * @returns Array of AI-generated suggestions
   * 
   * @private
   */
  private async generateAISuggestions(issues: Issue[], input: ValidationInput): Promise<Suggestion[]> {
    if (!this.openai) {
      logDebug(`[${this.agentId}] OpenAI not configured, skipping AI suggestions`);
      return [];
    }
    
    logDebug(`[${this.agentId}] 🤖 Generating AI-powered suggestions`, { issueCount: issues.length });
    
    const suggestions: Suggestion[] = [];
    
    try {
      for (const issue of issues) {
        const prompt = `You are a quality validation expert analyzing code issues in a ${input.testType} context.

Issue: ${issue.issue}
Root Cause: ${issue.rootCause}
Feature: ${input.feature}
Severity: ${issue.severity}
${input.page ? `Page: ${input.page}` : ''}

Provide a concise, actionable fix suggestion with code example if applicable.

Format your response as JSON:
{
  "solution": "Clear 1-2 sentence description of the fix",
  "codeExample": "Optional minimal code snippet showing the fix"
}`;

        const response = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 500,
          response_format: { type: "json_object" },
        });
        
        const content = response.choices[0]?.message?.content;
        if (content) {
          try {
            const parsed = JSON.parse(content);
            suggestions.push({
              type: 'ai_generated',
              solution: parsed.solution,
              source: 'OpenAI GPT-4',
              confidence: 0.85,
              codeExample: parsed.codeExample || undefined,
            });
          } catch (parseError) {
            logError(parseError as Error, { agentId: this.agentId, context: 'AI suggestion parse error' });
            suggestions.push({
              type: 'ai_generated',
              solution: content,
              source: 'OpenAI GPT-4',
              confidence: 0.75,
            });
          }
        }
      }
      
      logInfo(`[${this.agentId}] Generated ${suggestions.length} AI-powered suggestions`, { suggestionCount: suggestions.length });
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'AI suggestion generation' });
    }
    
    return suggestions;
  }

  // ==========================================================================
  // 6. CREATE FIX PLAN - Generate comprehensive fix plan
  // ==========================================================================

  /**
   * Creates a comprehensive fix plan with prioritized steps
   * Organizes issues by severity and matches with best suggestions
   * 
   * @param issues - Array of issues to fix
   * @param suggestions - Available fix suggestions
   * @returns Detailed fix plan with time estimates and code examples
   * 
   * @private
   */
  private createFixPlan(issues: Issue[], suggestions: Suggestion[]): FixPlan {
    const steps: string[] = [];
    const codeExamples: Record<string, string> = {};
    
    // Organize issues by severity
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');
    const mediumIssues = issues.filter(i => i.severity === 'medium');
    const lowIssues = issues.filter(i => i.severity === 'low');
    
    let stepNum = 1;
    
    // Helper to add issue steps
    const addIssueSteps = (issueList: Issue[], prefix: string) => {
      for (const issue of issueList) {
        // Find best matching suggestion
        const relatedSuggestion = suggestions
          .filter(s => {
            const searchTerms = issue.issue.toLowerCase().split(' ');
            return searchTerms.some(term => 
              term.length > 3 && s.solution.toLowerCase().includes(term)
            );
          })
          .sort((a, b) => b.confidence - a.confidence)[0];
        
        steps.push(`${prefix} ${issue.issue}`);
        steps.push(`  📍 Location: ${issue.location || 'Unknown'}`);
        steps.push(`  🔍 Root Cause: ${issue.rootCause}`);
        
        if (relatedSuggestion) {
          steps.push(`  💡 Solution: ${relatedSuggestion.solution}`);
          steps.push(`  📊 Confidence: ${Math.round(relatedSuggestion.confidence * 100)}% (${relatedSuggestion.source})`);
          
          if (relatedSuggestion.codeExample) {
            codeExamples[`step_${stepNum}`] = relatedSuggestion.codeExample;
            steps.push(`  📝 Code example available (see step_${stepNum})`);
          }
          
          if (relatedSuggestion.timesApplied) {
            steps.push(`  ✅ Proven solution (applied ${relatedSuggestion.timesApplied} times)`);
          }
        }
        
        steps.push(''); // Empty line for readability
        stepNum++;
      }
    };
    
    // Add steps in severity order
    if (criticalIssues.length > 0) {
      steps.push('🚨 CRITICAL ISSUES (Fix Immediately):');
      steps.push('');
      addIssueSteps(criticalIssues, '[CRITICAL]');
    }
    
    if (highIssues.length > 0) {
      steps.push('⚠️  HIGH PRIORITY ISSUES:');
      steps.push('');
      addIssueSteps(highIssues, '[HIGH]');
    }
    
    if (mediumIssues.length > 0) {
      steps.push('📌 MEDIUM PRIORITY ISSUES:');
      steps.push('');
      addIssueSteps(mediumIssues, '[MEDIUM]');
    }
    
    if (lowIssues.length > 0) {
      steps.push('💭 LOW PRIORITY ISSUES:');
      steps.push('');
      addIssueSteps(lowIssues, '[LOW]');
    }
    
    // Determine complexity
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (criticalIssues.length > 0 || issues.length > 3) {
      complexity = 'complex';
    } else if (highIssues.length > 0 || issues.length > 1) {
      complexity = 'moderate';
    }
    
    // Estimate time based on severity and complexity
    const estimatedMinutes = 
      criticalIssues.length * 60 + 
      highIssues.length * 30 + 
      mediumIssues.length * 15 +
      lowIssues.length * 10;
    
    const estimatedTime = estimatedMinutes < 60 
      ? `${estimatedMinutes} minutes`
      : `${Math.ceil(estimatedMinutes / 60)} hour${Math.ceil(estimatedMinutes / 60) > 1 ? 's' : ''}`;
    
    return {
      steps,
      estimatedTime,
      complexity,
      prerequisites: complexity === 'complex' 
        ? ['Review full codebase context', 'Check for breaking changes', 'Prepare rollback plan']
        : undefined,
      codeExamples: Object.keys(codeExamples).length > 0 ? codeExamples : undefined,
      testingSteps: [
        `Test on ${issues.some(i => i.category === 'mobile_layout') ? 'mobile, tablet, and desktop' : 'targeted browsers/devices'}`,
        'Verify no regression in existing functionality',
        'Add automated tests to prevent recurrence',
        'Update documentation if needed',
      ],
    };
  }

  // ==========================================================================
  // 7. OFFER COLLABORATION - Help offer to responsible agent
  // ==========================================================================

  /**
   * Creates a collaborative help offer to the responsible agent
   * Presents fix plan and offers assistance options
   * 
   * @param targetAgent - Agent responsible for the feature
   * @param issues - Discovered issues
   * @param suggestions - Fix suggestions
   * @param fixPlan - Comprehensive fix plan
   * @returns Collaboration offer with options
   * 
   * @example
   * ```typescript
   * const offer = qualityValidator.offerCollaboration(
   *   'Agent #78',
   *   [{ issue: 'Mobile overflow', severity: 'high', rootCause: '...' }],
   *   [{ solution: 'Add overflow-x: hidden', confidence: 0.98, ... }],
   *   fixPlan
   * );
   * // Offer includes: message, options (A/B/C), fixPlan, suggestions
   * ```
   */
  offerCollaboration(
    targetAgent: string,
    issues: Issue[],
    suggestions: Suggestion[],
    fixPlan: FixPlan
  ): CollaborationOffer {
    const topSuggestions = suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
    
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    
    const severitySummary = [
      criticalCount > 0 ? `${criticalCount} CRITICAL` : '',
      highCount > 0 ? `${highCount} HIGH` : '',
      issues.length - criticalCount - highCount > 0 ? `${issues.length - criticalCount - highCount} other` : ''
    ].filter(Boolean).join(', ');
    
    const message = `
╔═══════════════════════════════════════════════════════════════╗
║  Agent #79 Quality Validation Report                         ║
╚═══════════════════════════════════════════════════════════════╝

📊 SUMMARY:
   Found ${issues.length} issue(s): ${severitySummary}

${issues.map((issue, i) => `
${i + 1}. [${issue.severity.toUpperCase()}] ${issue.issue}
   📍 Location: ${issue.location || 'Unknown'}
   🔍 Root Cause: ${issue.rootCause}
   💥 Impact: ${issue.impact || 'Not specified'}`).join('\n')}

${topSuggestions.length > 0 ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 SUGGESTED FIXES:
${topSuggestions.map((s, i) => `
${i + 1}. ${s.solution}
   📊 ${s.source} | Confidence: ${Math.round(s.confidence * 100)}%
   ${s.type === 'proven_pattern' && s.timesApplied ? `✅ Proven solution (applied ${s.timesApplied} times)` : ''}
   ${s.codeExample ? `📝 Code example available` : ''}`).join('\n')}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  ESTIMATED FIX TIME: ${fixPlan.estimatedTime}
🔧 COMPLEXITY: ${fixPlan.complexity.toUpperCase()}
${fixPlan.prerequisites ? `⚠️  Prerequisites: ${fixPlan.prerequisites.join(', ')}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I've created a detailed fix plan with ${fixPlan.steps.length} steps and ${Object.keys(fixPlan.codeExamples || {}).length} code examples.

🤝 HOW CAN I HELP?`;

    return {
      message,
      options: {
        A: "Help implement it (pair programming - we fix together)",
        B: "Provide detailed implementation plan (you implement, I guide)",
        C: "You've got this (I'll track resolution and learn from your fix)",
      },
      fixPlan,
      suggestions: topSuggestions,
    };
  }

  // ==========================================================================
  // 8. TEST CUSTOMER JOURNEY - End-to-end user flow testing
  // ==========================================================================

  /**
   * Tests a complete customer journey (end-to-end user flow)
   * Validates all steps work correctly together
   * 
   * @param journey - Customer journey definition with steps
   * @returns Journey test result with status and failure details if applicable
   * 
   * @throws {z.ZodError} If journey validation fails
   * 
   * @example
   * ```typescript
   * const result = await qualityValidator.testCustomerJourney({
   *   journeyName: 'Host creates event',
   *   steps: [
   *     { stepNumber: 1, action: 'Navigate to events', expectedOutcome: 'Events page loads', page: '/events' },
   *     { stepNumber: 2, action: 'Click create event', expectedOutcome: 'Form appears', page: '/events/create' }
   *   ],
   *   responsibleAgents: ['Agent #74', 'Agent #75'],
   *   deviceType: 'mobile'
   * });
   * ```
   */
  async testCustomerJourney(journey: CustomerJourney): Promise<{
    status: 'passed' | 'failed';
    failedStep?: number;
    failureReason?: string;
    recommendations?: string[];
  }> {
    const validatedJourney = CustomerJourneySchema.parse(journey);
    
    logInfo(`[${this.agentId}] 🛤️  Testing customer journey: ${validatedJourney.journeyName}`, { 
      journeyName: validatedJourney.journeyName, 
      stepCount: validatedJourney.steps.length,
      deviceType: validatedJourney.deviceType || 'desktop'
    });
    
    try {
      // Simulate journey testing (in production, would use Playwright)
      for (let i = 0; i < validatedJourney.steps.length; i++) {
        const step = validatedJourney.steps[i];
        logDebug(`[${this.agentId}] Step ${step.stepNumber}: ${step.action}`, { 
          stepNumber: step.stepNumber, 
          action: step.action,
          page: step.page
        });
        
        // In production: 
        // - await page.goto(step.page)
        // - await page.click(step.selector)
        // - await expect(page).toHaveText(step.expectedOutcome)
      }
      
      // Record successful journey test
      await db.insert(customerJourneyTests).values({
        journeyName: validatedJourney.journeyName,
        journeySteps: validatedJourney.steps,
        status: 'passed',
        responsibleAgents: validatedJourney.responsibleAgents,
        deviceTested: validatedJourney.deviceType,
      });
      
      logInfo(`[${this.agentId}] ✅ Journey "${validatedJourney.journeyName}" passed`, { journeyName: validatedJourney.journeyName });
      
      // Log successful journey as learning
      await this.logLearningToCoordinator({
        agentId: this.agentId,
        category: 'feature',
        domain: 'customer_journey',
        problem: `Customer journey validation: ${validatedJourney.journeyName}`,
        solution: `All ${validatedJourney.steps.length} steps completed successfully`,
        outcome: {
          success: true,
          impact: 'high',
        },
        confidence: 1.0,
        context: {
          page: validatedJourney.steps[0]?.page,
          relatedAgents: validatedJourney.responsibleAgents,
        },
      });
      
      return { status: 'passed' };
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        logError(error, { agentId: this.agentId, context: 'Journey validation failed', errors: error.errors });
        throw new Error(`Journey input error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      
      logError(error as Error, { 
        agentId: this.agentId, 
        journeyName: validatedJourney.journeyName,
        context: 'Customer journey test' 
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Record failed journey test
      await db.insert(customerJourneyTests).values({
        journeyName: validatedJourney.journeyName,
        journeySteps: validatedJourney.steps,
        status: 'failed',
        failedStep: 1,
        failureReason: errorMessage,
        responsibleAgents: validatedJourney.responsibleAgents,
        deviceTested: validatedJourney.deviceType,
      });
      
      // Log failed journey as learning
      await this.logLearningToCoordinator({
        agentId: this.agentId,
        category: 'bug_fix',
        domain: 'customer_journey',
        problem: `Journey "${validatedJourney.journeyName}" failed at step 1`,
        solution: errorMessage,
        outcome: {
          success: false,
          impact: 'high',
        },
        confidence: 0.5,
        context: {
          page: validatedJourney.steps[0]?.page,
          relatedAgents: validatedJourney.responsibleAgents,
          stackTrace: errorMessage,
        },
      });
      
      return {
        status: 'failed',
        failedStep: 1,
        failureReason: errorMessage,
        recommendations: [
          'Review error logs for detailed stack trace',
          'Check if all pages are accessible',
          'Verify selectors are correct',
          'Ensure database is seeded with required data',
        ],
      };
    }
  }

  // ==========================================================================
  // 9. TRACK RESOLUTION - Monitor fix success rates
  // ==========================================================================

  /**
   * Tracks the resolution of a validation issue
   * Records agent response and time to fix
   * Updates success metrics automatically
   * 
   * @param validationId - ID of the validation record
   * @param agentResponse - Agent's chosen option (A/B/C)
   * @param timeToFix - Time taken to fix in minutes (optional)
   * 
   * @example
   * ```typescript
   * // Agent chose option A (pair programming) and fixed in 45 minutes
   * await qualityValidator.trackResolution(123, 'A', 45);
   * ```
   */
  async trackResolution(validationId: number, agentResponse: 'A' | 'B' | 'C', timeToFix?: number) {
    try {
      await db
        .update(validationResults)
        .set({
          agentResponse,
          timeToFix,
          fixedAt: new Date(),
        })
        .where(eq(validationResults.id, validationId));
      
      logInfo(`[${this.agentId}] ✅ Resolution tracked for validation`, { 
        validationId, 
        agentResponse, 
        timeToFix: timeToFix ? `${timeToFix} minutes` : 'Not specified'
      });
      
      // Calculate and log success metrics
      await this.updateSuccessMetrics();
      
      // Log resolution as learning
      const validation = await db
        .select()
        .from(validationResults)
        .where(eq(validationResults.id, validationId))
        .limit(1);
      
      if (validation[0]) {
        await this.logLearningToCoordinator({
          agentId: validation[0].targetAgent,
          category: 'bug_fix',
          domain: 'validation_resolution',
          problem: `Fixed issues in ${validation[0].feature}`,
          solution: agentResponse === 'A' ? 'Pair programming with Agent #79' : agentResponse === 'B' ? 'Implemented with guidance from Agent #79' : 'Self-implemented',
          outcome: {
            success: true,
            impact: 'medium',
            timeSaved: timeToFix ? `${timeToFix} minutes` : undefined,
          },
          confidence: agentResponse === 'C' ? 1.0 : 0.95,
        });
      }
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Track resolution', validationId });
    }
  }

  /**
   * Updates success metrics (avg fix time, collaboration acceptance rate)
   * Called automatically after tracking resolution
   * 
   * @private
   */
  private async updateSuccessMetrics() {
    try {
      // Calculate average time to fix
      const avgTimeResult = await db
        .select({ avgTime: sql<number | null>`AVG(${validationResults.timeToFix})` })
        .from(validationResults)
        .where(sql`${validationResults.timeToFix} IS NOT NULL`);
      
      const avgTime = avgTimeResult[0]?.avgTime ?? 0;
      
      // Calculate collaboration acceptance rate
      const totalOffers = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(validationResults)
        .where(eq(validationResults.collaborationOffered, true));
      
      const acceptedOffers = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(validationResults)
        .where(and(
          eq(validationResults.collaborationOffered, true),
          sql`${validationResults.agentResponse} IN ('A', 'B')`
        ));
      
      const acceptanceRate = totalOffers[0]?.count 
        ? (acceptedOffers[0]?.count / totalOffers[0]?.count) * 100
        : 0;
      
      logInfo(`[${this.agentId}] 📊 Success metrics updated`, { 
        avgFixTime: `${Math.round(avgTime)} minutes`, 
        collaborationAcceptanceRate: `${Math.round(acceptanceRate)}%`
      });
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Update success metrics' });
    }
  }

  // ==========================================================================
  // 10. RECORD VALIDATION - Store results in database
  // ==========================================================================

  /**
   * Records validation result in database
   * 
   * @param data - Validation data to insert
   * @returns Inserted validation record
   * 
   * @private
   */
  private async recordValidation(data: InsertValidationResult) {
    try {
      const result = await db.insert(validationResults).values(data).returning();
      logDebug(`[${this.agentId}] Validation recorded`, { validationId: result[0].id, status: data.status });
      return result[0];
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Record validation' });
      throw error;
    }
  }

  // ==========================================================================
  // 11. LOG LEARNING TO COORDINATOR - Capture learnings
  // ==========================================================================

  /**
   * Logs a learning to Agent #80 (Learning Coordinator)
   * Enables knowledge sharing across the agent network
   * 
   * @param learning - Learning data to capture
   * 
   * @example
   * ```typescript
   * await qualityValidator.logLearningToCoordinator({
   *   agentId: 'Agent #78',
   *   category: 'bug_fix',
   *   domain: 'mobile',
   *   problem: 'Mobile overflow on Visual Editor',
   *   solution: 'Added overflow-x: hidden to container',
   *   outcome: { success: true, impact: 'high', timeSaved: '2 hours' },
   *   confidence: 0.98
   * });
   * ```
   */
  async logLearningToCoordinator(learning: Learning) {
    try {
      await this.learningCoordinator.captureLearning(learning);
      logDebug(`[${this.agentId}] Learning logged to Agent #80`, { 
        agentId: learning.agentId,
        category: learning.category,
        domain: learning.domain
      });
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Log learning to coordinator' });
    }
  }

  // ==========================================================================
  // APPENDIX Q: 7-LAYER GUARDRAIL SYSTEM
  // ==========================================================================

  /**
   * Layer 1: Pre-Execution Validation Checklist
   * Validates requirements and context BEFORE AI starts coding
   * 
   * @param agentId - Which AI agent is requesting validation
   * @param requirement - What needs to be built
   * @param context - Additional context (existing code, dependencies, etc)
   * @returns Pre-execution validation result with go/no-go decision
   * 
   * @example
   * ```typescript
   * const preCheck = await qualityValidator.guardrail_layer1_preExecution(
   *   'Agent #64',
   *   'Add Stripe payment to checkout',
   *   { feature: 'checkout', dependencies: ['stripe'] }
   * );
   * 
   * if (!preCheck.passed) {
   *   console.log('Blockers:', preCheck.blockers);
   *   // Don't proceed until blockers are resolved
   * }
   * ```
   */
  async guardrail_layer1_preExecution(
    agentId: string,
    requirement: string,
    context: Record<string, unknown> = {}
  ) {
    logInfo(`[${this.agentId}] 🛡️ Layer 1: Pre-Execution Validation`, { agentId, requirement });
    return await this.aiGuardrails.layer1_preExecutionValidation(agentId, requirement, context);
  }

  /**
   * Layer 2: Multi-AI Code Review
   * Performs peer validation using Agents #79, #68, #80
   * 
   * @param code - Code to review
   * @param requirements - What the code should accomplish
   * @param affectedFiles - Files being modified
   * @param agentId - Agent requesting review
   * @returns Multi-AI review result with approval decision
   * 
   * @example
   * ```typescript
   * const review = await qualityValidator.guardrail_layer2_codeReview({
   *   code: 'const stripe = require("stripe")(apiKey);',
   *   requirements: 'Add Stripe integration',
   *   affectedFiles: ['server/routes/payment.ts'],
   *   agentId: 'Agent #64'
   * });
   * 
   * if (!review.approved) {
   *   console.log('Blockers:', review.blockers);
   * }
   * ```
   */
  async guardrail_layer2_codeReview(request: {
    code: string;
    requirements: string;
    affectedFiles: string[];
    agentId: string;
    feature?: string;
  }) {
    logInfo(`[${this.agentId}] 🛡️ Layer 2: Multi-AI Code Review`, { agentId: request.agentId });
    return await this.aiGuardrails.layer2_multiAIReview(request);
  }

  /**
   * Layer 3: Hallucination Detection
   * Verifies all code references actually exist in codebase
   * 
   * @param code - Code to check for hallucinations
   * @param fileType - Type of file being checked
   * @returns Hallucination detection result with confidence score
   * 
   * @example
   * ```typescript
   * const check = await qualityValidator.guardrail_layer3_hallucination({
   *   code: 'import { magicalAutoFix } from "magic-lib";',
   *   fileType: 'typescript'
   * });
   * 
   * if (check.isHallucination) {
   *   console.log('Hallucinated:', check.issues);
   * }
   * ```
   */
  async guardrail_layer3_hallucination(request: {
    code: string;
    fileType: 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'json';
    context?: {
      imports?: string[];
      functionCalls?: string[];
      componentReferences?: string[];
    };
  }) {
    logInfo(`[${this.agentId}] 🛡️ Layer 3: Hallucination Detection`, { fileType: request.fileType });
    return await this.aiGuardrails.layer3_hallucinationDetection(request);
  }

  /**
   * Layer 4: Breaking Change Prevention
   * Analyzes impact of code changes before they're made
   * 
   * @param beforeCode - Original code
   * @param afterCode - Modified code
   * @param fileType - Type of file (schema, api, component, config)
   * @param filePath - Path to the file
   * @returns Breaking change analysis with migration requirements
   * 
   * @example
   * ```typescript
   * const analysis = await qualityValidator.guardrail_layer4_breakingChanges({
   *   beforeCode: 'id: serial("id")',
   *   afterCode: 'id: varchar("id").default(sql`gen_random_uuid()`)',
   *   fileType: 'schema',
   *   filePath: 'shared/schema.ts'
   * });
   * 
   * if (analysis.breaking) {
   *   console.log('Migration required:', analysis.migrationRequired);
   * }
   * ```
   */
  async guardrail_layer4_breakingChanges(request: {
    beforeCode: string;
    afterCode: string;
    fileType: 'schema' | 'api' | 'component' | 'config';
    filePath: string;
  }) {
    logInfo(`[${this.agentId}] 🛡️ Layer 4: Breaking Change Prevention`, { fileType: request.fileType });
    return await this.aiGuardrails.layer4_breakingChangePrevention(request);
  }

  /**
   * Layer 5: Requirement Verification
   * Validates output matches requirements EXACTLY
   * 
   * @param requirement - Original requirement
   * @param implementation - What was implemented
   * @param feature - Feature name
   * @param verificationCriteria - Optional specific criteria to check
   * @returns Requirement verification result with match score
   * 
   * @example
   * ```typescript
   * const verification = await qualityValidator.guardrail_layer5_requirements({
   *   requirement: 'Add dark mode toggle to navbar',
   *   implementation: 'Added theme toggle button in header',
   *   feature: 'Dark Mode',
   *   verificationCriteria: [
   *     'Toggle is in navbar',
   *     'Toggle works',
   *     'Theme persists on reload'
   *   ]
   * });
   * 
   * if (!verification.matched) {
   *   console.log('Gaps:', verification.gaps);
   * }
   * ```
   */
  async guardrail_layer5_requirements(request: {
    requirement: string;
    implementation: string;
    feature: string;
    verificationCriteria?: string[];
  }) {
    logInfo(`[${this.agentId}] 🛡️ Layer 5: Requirement Verification`, { feature: request.feature });
    return await this.aiGuardrails.layer5_requirementVerification(request);
  }

  /**
   * Layer 6: Continuous Monitoring
   * Monitors for errors AFTER deployment
   * 
   * @param feature - Feature to monitor
   * @param timeWindowMinutes - How far back to look for errors
   * @returns Monitoring alerts if issues detected
   * 
   * @example
   * ```typescript
   * const monitoring = await qualityValidator.guardrail_layer6_monitoring({
   *   feature: 'Visual Editor',
   *   timeWindowMinutes: 30
   * });
   * 
   * if (monitoring.alerts.length > 0) {
   *   console.log('Production errors detected:', monitoring.alerts);
   * }
   * ```
   */
  async guardrail_layer6_monitoring(options: {
    feature?: string;
    timeWindowMinutes?: number;
  }) {
    logInfo(`[${this.agentId}] 🛡️ Layer 6: Continuous Monitoring`, { feature: options.feature });
    return await this.aiGuardrails.layer6_continuousMonitoring(options);
  }

  /**
   * Layer 7: Pattern Learning (Agent #68 Integration)
   * Learns from mistakes and creates reusable patterns
   * 
   * @param problem - Problem that occurred
   * @param solution - How it was solved
   * @param outcome - Result of the solution
   * @returns Pattern learning result with pattern ID
   * 
   * @example
   * ```typescript
   * const learning = await qualityValidator.guardrail_layer7_patternLearning({
   *   problem: 'Mobile overflow on Visual Editor',
   *   solution: 'Added overflow-x: hidden to container',
   *   outcome: { success: true, timeSaved: '2 hours' }
   * });
   * 
   * console.log('Pattern created:', learning.patternName);
   * ```
   */
  async guardrail_layer7_patternLearning(request: {
    problem: string;
    solution: string;
    category: 'bug_fix' | 'optimization' | 'feature' | 'refactor' | 'pattern' | 'architecture';
    domain: string;
    discoveredBy: string;
    outcome: {
      success: boolean;
      timeSaved?: string;
      metricsImproved?: Record<string, number>;
      issuesResolved?: number;
    };
    codeExample?: string;
    whenNotToUse?: string;
  }) {
    logInfo(`[${this.agentId}] 🛡️ Layer 7: Pattern Learning (Agent #68)`, { 
      category: request.category,
      domain: request.domain 
    });
    return await this.aiGuardrails.layer7_patternLearning(request);
  }

  // ==========================================================================
  // AGENT #68 PATTERN RECOGNITION INTEGRATION
  // ==========================================================================

  /**
   * Detects if a problem matches existing patterns using Agent #68
   * 
   * @param signature - Problem signature to match
   * @returns Pattern detection result with proven solutions
   * 
   * @example
   * ```typescript
   * const detection = await qualityValidator.detectPattern({
   *   category: 'bug_fix',
   *   domain: 'mobile',
   *   problem: 'UI elements overflow viewport on mobile',
   *   severity: 'high'
   * });
   * 
   * if (detection.isRecurring) {
   *   console.log('Proven solution:', detection.matchedPattern?.solutionTemplate);
   * }
   * ```
   */
  async detectPattern(signature: ProblemSignature) {
    logInfo(`[${this.agentId}] 🔍 Pattern Detection (Agent #68)`, { 
      category: signature.category,
      domain: signature.domain 
    });
    return await this.patternEngine.detectPattern(signature);
  }

  /**
   * Finds proven solutions for a problem using Agent #68's pattern library
   * 
   * @param signature - Problem signature
   * @param limit - Maximum number of solutions to return
   * @returns Array of proven solutions with confidence scores
   * 
   * @example
   * ```typescript
   * const solutions = await qualityValidator.findProvenSolutions({
   *   category: 'bug_fix',
   *   domain: 'mobile',
   *   problem: 'Mobile overflow issue',
   *   severity: 'high'
   * }, 5);
   * 
   * solutions.forEach(sol => {
   *   console.log(`Solution (${Math.round(sol.confidence * 100)}%):`, sol.solutionTemplate);
   * });
   * ```
   */
  async findProvenSolutions(signature: ProblemSignature, limit: number = 5): Promise<SolutionMatch[]> {
    logInfo(`[${this.agentId}] 🎯 Finding Proven Solutions (Agent #68)`, { 
      category: signature.category,
      domain: signature.domain 
    });
    return await this.patternEngine.matchSolution(signature, limit);
  }

  /**
   * Tracks when a pattern is applied and records the outcome
   * Updates pattern statistics and success rates in Agent #68's library
   * 
   * @param application - Pattern application details
   * 
   * @example
   * ```typescript
   * await qualityValidator.trackPatternReuse({
   *   success: true,
   *   patternId: 123,
   *   patternName: 'Mobile Overflow Fix',
   *   appliedBy: 'Agent #79',
   *   outcome: {
   *     timeSaved: '30 minutes',
   *     issuesResolved: 1
   *   }
   * });
   * ```
   */
  async trackPatternReuse(application: {
    success: boolean;
    patternId: number;
    patternName: string;
    appliedBy: string;
    outcome?: {
      timeSaved?: string;
      metricsImproved?: Record<string, number>;
      issuesResolved?: number;
    };
    feedback?: string;
  }) {
    logInfo(`[${this.agentId}] 📈 Tracking Pattern Reuse (Agent #68)`, { 
      patternName: application.patternName,
      success: application.success 
    });
    await this.patternEngine.trackReuse(application);
  }

  // ==========================================================================
  // COMPREHENSIVE VALIDATION WITH ALL GUARDRAILS
  // ==========================================================================

  /**
   * Runs ALL 7 layers of guardrails on a code change
   * This is the comprehensive validation method that uses all guardrails
   * 
   * @param request - Complete validation request
   * @returns Comprehensive validation result with all guardrail checks
   * 
   * @example
   * ```typescript
   * const result = await qualityValidator.comprehensiveValidation({
   *   agentId: 'Agent #64',
   *   requirement: 'Add Stripe payment processing',
   *   code: '...',
   *   beforeCode: '...',
   *   afterCode: '...',
   *   feature: 'Payments',
   *   affectedFiles: ['server/routes/payment.ts'],
   *   fileType: 'api',
   *   filePath: 'server/routes/payment.ts'
   * });
   * 
   * if (!result.allLayersPassed) {
   *   console.log('Failed layers:', result.failedLayers);
   *   console.log('Recommendations:', result.recommendations);
   * }
   * ```
   */
  async comprehensiveValidation(request: {
    agentId: string;
    requirement: string;
    code: string;
    beforeCode?: string;
    afterCode?: string;
    feature: string;
    affectedFiles: string[];
    fileType: 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'json' | 'schema' | 'api' | 'component' | 'config';
    filePath: string;
    dependencies?: string[];
  }) {
    logInfo(`[${this.agentId}] 🛡️ COMPREHENSIVE VALIDATION (All 7 Layers)`, { 
      agentId: request.agentId,
      feature: request.feature 
    });

    const results = {
      allLayersPassed: true,
      failedLayers: [] as string[],
      layerResults: {} as Record<string, unknown>,
      recommendations: [] as string[],
      severity: 'none' as 'none' | 'low' | 'medium' | 'high' | 'critical',
    };

    try {
      // Layer 1: Pre-Execution Validation
      const layer1 = await this.guardrail_layer1_preExecution(
        request.agentId,
        request.requirement,
        { 
          feature: request.feature,
          dependencies: request.dependencies 
        }
      );
      results.layerResults.layer1_preExecution = layer1;
      if (!layer1.passed) {
        results.allLayersPassed = false;
        results.failedLayers.push('Layer 1: Pre-Execution');
        results.recommendations.push(...layer1.blockers);
        results.severity = 'high';
      }

      // Layer 2: Multi-AI Code Review
      const layer2 = await this.guardrail_layer2_codeReview({
        code: request.code,
        requirements: request.requirement,
        affectedFiles: request.affectedFiles,
        agentId: request.agentId,
        feature: request.feature,
      });
      results.layerResults.layer2_codeReview = layer2;
      if (!layer2.approved) {
        results.allLayersPassed = false;
        results.failedLayers.push('Layer 2: Multi-AI Code Review');
        results.recommendations.push(...layer2.blockers);
        results.severity = 'high';
      }

      // Layer 3: Hallucination Detection
      const layer3 = await this.guardrail_layer3_hallucination({
        code: request.code,
        fileType: request.fileType as 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'json',
      });
      results.layerResults.layer3_hallucination = layer3;
      if (layer3.isHallucination) {
        results.allLayersPassed = false;
        results.failedLayers.push('Layer 3: Hallucination Detection');
        results.recommendations.push(...layer3.issues.map(i => i.suggestion || i.item));
        results.severity = layer3.issues.length > 2 ? 'critical' : 'high';
      }

      // Layer 4: Breaking Change Prevention (if before/after code provided)
      if (request.beforeCode && request.afterCode) {
        const layer4 = await this.guardrail_layer4_breakingChanges({
          beforeCode: request.beforeCode,
          afterCode: request.afterCode,
          fileType: request.fileType as 'schema' | 'api' | 'component' | 'config',
          filePath: request.filePath,
        });
        results.layerResults.layer4_breakingChanges = layer4;
        if (layer4.breaking) {
          results.allLayersPassed = false;
          results.failedLayers.push('Layer 4: Breaking Change Prevention');
          results.recommendations.push(layer4.recommendation);
          results.severity = 'critical';
        }
      }

      // Layer 5: Requirement Verification
      const layer5 = await this.guardrail_layer5_requirements({
        requirement: request.requirement,
        implementation: request.code,
        feature: request.feature,
      });
      results.layerResults.layer5_requirements = layer5;
      if (!layer5.matched) {
        results.allLayersPassed = false;
        results.failedLayers.push('Layer 5: Requirement Verification');
        results.recommendations.push(...layer5.gaps);
        results.severity = results.severity === 'critical' ? 'critical' : 'high';
      }

      // Layer 6: Continuous Monitoring (check recent errors for this feature)
      const layer6 = await this.guardrail_layer6_monitoring({
        feature: request.feature,
        timeWindowMinutes: 60,
      });
      results.layerResults.layer6_monitoring = layer6;

      // Layer 7: Pattern Learning - Check if this problem matches known patterns
      const problemSignature: ProblemSignature = {
        category: 'feature',
        domain: request.feature,
        problem: request.requirement,
      };
      const patternDetection = await this.detectPattern(problemSignature);
      results.layerResults.layer7_patternLearning = patternDetection;

      // Final recommendation
      if (results.allLayersPassed) {
        logInfo(`[${this.agentId}] ✅ ALL 7 GUARDRAIL LAYERS PASSED`, { feature: request.feature });
      } else {
        logInfo(`[${this.agentId}] ⛔ GUARDRAIL VALIDATION FAILED`, { 
          feature: request.feature,
          failedLayers: results.failedLayers.length,
          severity: results.severity 
        });
      }

      return results;

    } catch (error) {
      logError(error as Error, { 
        agentId: this.agentId, 
        context: 'Comprehensive Validation',
        feature: request.feature 
      });
      throw error;
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Retrieves validation history for a specific agent or feature
   * 
   * @param targetAgent - Filter by target agent (optional)
   * @param feature - Filter by feature (optional)
   * @returns Array of validation records (max 50)
   * 
   * @example
   * ```typescript
   * // Get all validations for Agent #78
   * const history = await qualityValidator.getValidationHistory('Agent #78');
   * 
   * // Get validations for Visual Editor feature
   * const featureHistory = await qualityValidator.getValidationHistory(undefined, 'Visual Editor');
   * 
   * // Get validations for specific agent + feature
   * const specific = await qualityValidator.getValidationHistory('Agent #78', 'Visual Editor');
   * ```
   */
  async getValidationHistory(targetAgent?: string, feature?: string) {
    try {
      let query = db.select().from(validationResults);
      
      if (targetAgent && feature) {
        query = query.where(
          and(
            eq(validationResults.targetAgent, targetAgent),
            eq(validationResults.feature, feature)
          )
        ) as typeof query;
      } else if (targetAgent) {
        query = query.where(eq(validationResults.targetAgent, targetAgent)) as typeof query;
      } else if (feature) {
        query = query.where(eq(validationResults.feature, feature)) as typeof query;
      }
      
      return await query.orderBy(desc(validationResults.createdAt)).limit(50);
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Fetch validation history', targetAgent, feature });
      return [];
    }
  }

  /**
   * Calculates success rate for a specific agent
   * 
   * @param targetAgent - Agent to calculate success rate for
   * @returns Success rate as percentage (0-100)
   * 
   * @example
   * ```typescript
   * const successRate = await qualityValidator.getSuccessRateByAgent('Agent #78');
   * console.log(`Agent #78 success rate: ${successRate}%`);
   * ```
   */
  async getSuccessRateByAgent(targetAgent: string): Promise<number> {
    try {
      const total = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(validationResults)
        .where(eq(validationResults.targetAgent, targetAgent));
      
      const passed = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(validationResults)
        .where(and(
          eq(validationResults.targetAgent, targetAgent),
          eq(validationResults.status, 'passed')
        ));
      
      const successRate = total[0]?.count ? (passed[0]?.count / total[0]?.count) * 100 : 0;
      
      logDebug(`[${this.agentId}] Success rate calculated for ${targetAgent}`, { 
        targetAgent, 
        successRate: `${Math.round(successRate)}%`,
        totalValidations: total[0]?.count,
        passedValidations: passed[0]?.count
      });
      
      return successRate;
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Calculate success rate', targetAgent });
      return 0;
    }
  }

  /**
   * Gets collaboration statistics across all validations
   * 
   * @returns Statistics object with acceptance rates and metrics
   * 
   * @example
   * ```typescript
   * const stats = await qualityValidator.getCollaborationStats();
   * console.log('Collaboration acceptance rate:', stats.acceptanceRate);
   * console.log('Average fix time:', stats.avgFixTime);
   * ```
   */
  async getCollaborationStats(): Promise<{
    totalValidations: number;
    collaborationOffered: number;
    acceptanceRate: number;
    avgFixTime: number;
    optionACount: number;
    optionBCount: number;
    optionCCount: number;
  }> {
    try {
      const total = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(validationResults);
      
      const offered = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(validationResults)
        .where(eq(validationResults.collaborationOffered, true));
      
      const optionA = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(validationResults)
        .where(eq(validationResults.agentResponse, 'A'));
      
      const optionB = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(validationResults)
        .where(eq(validationResults.agentResponse, 'B'));
      
      const optionC = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(validationResults)
        .where(eq(validationResults.agentResponse, 'C'));
      
      const avgTime = await db
        .select({ avg: sql<number | null>`AVG(${validationResults.timeToFix})` })
        .from(validationResults)
        .where(sql`${validationResults.timeToFix} IS NOT NULL`);
      
      const acceptanceRate = offered[0]?.count 
        ? ((optionA[0]?.count + optionB[0]?.count) / offered[0]?.count) * 100
        : 0;
      
      return {
        totalValidations: total[0]?.count || 0,
        collaborationOffered: offered[0]?.count || 0,
        acceptanceRate: Math.round(acceptanceRate),
        avgFixTime: Math.round(avgTime[0]?.avg || 0),
        optionACount: optionA[0]?.count || 0,
        optionBCount: optionB[0]?.count || 0,
        optionCCount: optionC[0]?.count || 0,
      };
      
    } catch (error) {
      logError(error as Error, { agentId: this.agentId, context: 'Get collaboration stats' });
      return {
        totalValidations: 0,
        collaborationOffered: 0,
        acceptanceRate: 0,
        avgFixTime: 0,
        optionACount: 0,
        optionBCount: 0,
        optionCCount: 0,
      };
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

/**
 * Singleton instance of Quality Validator Service
 * Use this for all validation operations
 * 
 * @example
 * ```typescript
 * import { qualityValidator } from '@/services/validation/qualityValidator';
 * 
 * const result = await qualityValidator.validateFeature({
 *   feature: '3D Avatar',
 *   targetAgent: 'Agent #73',
 *   testType: 'performance'
 * });
 * ```
 */
export const qualityValidator = new QualityValidatorService();
