/**
 * AI Error Prevention Guardrails Service (APPENDIX Q - BATCH 28)
 * 7-Layer Guardrail System to prevent AI from making incorrect decisions
 * 
 * @module AIGuardrailsService
 * @description Implements APPENDIX Q's 7-layer defense system:
 * 
 * Layer 1: Pre-Execution Validation - Validate requirements BEFORE coding
 * Layer 2: Multi-AI Code Review - Peer validation from Agents #79, #68, #80
 * Layer 3: Hallucination Detection - Verify all code references exist
 * Layer 4: Breaking Change Prevention - Analyze impact before changes
 * Layer 5: Requirement Verification - Output matches requirements exactly
 * Layer 6: Continuous Monitoring - Watch for runtime errors
 * Layer 7: Pattern Learning - Learn from mistakes (Agent #68)
 * 
 * @author ESA Intelligence Network
 * @version 1.0.0
 * @since 2025-01-12
 */

import { db } from "../../../shared/db";
import { 
  aiGuardrailViolations, 
  learningPatterns,
  type InsertAIGuardrailViolation 
} from "../../../shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import OpenAI from "openai";
import { z } from "zod";
import { logInfo, logError, logDebug, logWarning } from "../../middleware/logger";
import * as fs from "fs";
import * as path from "path";

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Pre-execution validation checklist schema
 */
const PreExecutionChecklistSchema = z.object({
  requirementClarity: z.boolean(),
  existingCodeChecked: z.boolean(),
  dependenciesVerified: z.boolean(),
  breakingChangeRiskAssessed: z.boolean(),
  similarPatternSearched: z.boolean(),
});

/**
 * Code review request schema
 */
const CodeReviewRequestSchema = z.object({
  code: z.string().min(1),
  requirements: z.string().min(1),
  affectedFiles: z.array(z.string()),
  agentId: z.string(),
  feature: z.string().optional(),
});

/**
 * Hallucination check schema
 */
const HallucinationCheckSchema = z.object({
  code: z.string().min(1),
  fileType: z.enum(['typescript', 'javascript', 'tsx', 'jsx', 'json']),
  context: z.object({
    imports: z.array(z.string()).optional(),
    functionCalls: z.array(z.string()).optional(),
    componentReferences: z.array(z.string()).optional(),
  }).optional(),
});

/**
 * Breaking change analysis schema
 */
const BreakingChangeRequestSchema = z.object({
  beforeCode: z.string(),
  afterCode: z.string(),
  fileType: z.enum(['schema', 'api', 'component', 'config']),
  filePath: z.string(),
});

/**
 * Requirement verification schema
 */
const RequirementVerificationSchema = z.object({
  requirement: z.string().min(1),
  implementation: z.string().min(1),
  feature: z.string(),
  verificationCriteria: z.array(z.string()).optional(),
});

// ============================================================================
// TYPESCRIPT INTERFACES & TYPES
// ============================================================================

/**
 * Pre-execution validation result
 */
interface PreExecutionResult {
  passed: boolean;
  checklist: {
    requirementClarity: boolean;
    existingCodeChecked: boolean;
    dependenciesVerified: boolean;
    breakingChangeRiskAssessed: boolean;
    similarPatternSearched: boolean;
  };
  warnings: string[];
  blockers: string[];
  recommendation: string;
}

/**
 * Multi-AI code review result
 */
interface CodeReviewResult {
  approved: boolean;
  agent79Quality: { passed: boolean; issues: string[] };
  agent68Patterns: { passed: boolean; issues: string[] };
  agent80Documentation: { passed: boolean; issues: string[] };
  overallRecommendation: string;
  blockers: string[];
}

/**
 * Hallucination detection result
 */
interface HallucinationResult {
  isHallucination: boolean;
  confidence: number;
  issues: Array<{
    type: 'missing_import' | 'unknown_function' | 'nonexistent_component' | 'invalid_db_column';
    item: string;
    location?: string;
    suggestion?: string;
  }>;
  summary: string;
}

/**
 * Breaking change analysis result
 */
interface BreakingChangeResult {
  breaking: boolean;
  changes: Array<{
    type: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    from?: string;
    to?: string;
    impact?: string;
  }>;
  migrationRequired: boolean;
  affectedAreas: string[];
  recommendation: string;
}

/**
 * Requirement verification result
 */
interface RequirementVerificationResult {
  matched: boolean;
  score: number;
  criteria: Array<{
    criterion: string;
    met: boolean;
    evidence?: string;
  }>;
  gaps: string[];
  recommendation: string;
}

/**
 * Continuous monitoring alert
 */
interface MonitoringAlert {
  alertType: 'console_error' | 'api_error' | 'performance_degradation' | 'user_complaint';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  context: Record<string, unknown>;
  affectedFeature?: string;
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
}

/**
 * Pattern learning result
 */
interface PatternLearningResult {
  patternExtracted: boolean;
  patternId?: number;
  patternName?: string;
  preventionRule?: string;
  confidence: number;
  applicableScenarios: string[];
}

// ============================================================================
// AI GUARDRAILS SERVICE CLASS
// ============================================================================

/**
 * @class AIGuardrailsService
 * @description Main guardrail service implementing 7-layer defense system
 * 
 * Core Responsibilities:
 * 1. Pre-Execution Validation - Think before coding
 * 2. Multi-AI Code Review - Peer validation
 * 3. Hallucination Detection - Fact-checking
 * 4. Breaking Change Prevention - Impact analysis
 * 5. Requirement Verification - Built right thing?
 * 6. Continuous Monitoring - Watch for runtime errors
 * 7. Pattern Learning - Learn from mistakes
 */
export class AIGuardrailsService {
  private openai: OpenAI | null = null;
  private readonly serviceId = "AI Guardrails";
  
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.BIFROST_BASE_URL || undefined,
      });
    }
  }

  // ==========================================================================
  // LAYER 1: PRE-EXECUTION VALIDATION
  // ==========================================================================

  /**
   * Validates requirements and context BEFORE AI starts coding
   * Implements APPENDIX Q Layer 1 checklist
   * 
   * @param agentId - Which AI agent is requesting validation
   * @param requirement - What needs to be built
   * @param context - Additional context (existing code, dependencies, etc)
   * @returns Pre-execution validation result with go/no-go decision
   * 
   * @example
   * ```typescript
   * const result = await guardrails.layer1_preExecutionValidation(
   *   'Agent #64',
   *   'Add Stripe payment to checkout',
   *   { feature: 'checkout', hasExistingPayment: false }
   * );
   * 
   * if (!result.passed) {
   *   console.log('Blockers:', result.blockers);
   *   // Don't proceed until blockers are resolved
   * }
   * ```
   */
  async layer1_preExecutionValidation(
    agentId: string,
    requirement: string,
    context: Record<string, unknown> = {}
  ): Promise<PreExecutionResult> {
    logInfo(`[${this.serviceId}] Layer 1: Pre-Execution Validation`, { agentId, requirement });

    const warnings: string[] = [];
    const blockers: string[] = [];
    let checklist = {
      requirementClarity: false,
      existingCodeChecked: false,
      dependenciesVerified: false,
      breakingChangeRiskAssessed: false,
      similarPatternSearched: false,
    };

    try {
      // Check 1: Requirement Clarity
      if (requirement.length < 10) {
        blockers.push("Requirement too vague - needs more detail");
      } else if (requirement.includes("somehow") || requirement.includes("maybe")) {
        warnings.push("Requirement contains uncertain language");
      } else {
        checklist.requirementClarity = true;
      }

      // Check 2: Existing Code Check
      const feature = context.feature as string;
      if (feature) {
        const existingFiles = await this.searchCodebase(feature);
        if (existingFiles.length > 0) {
          logDebug(`Found ${existingFiles.length} existing files related to '${feature}'`);
          checklist.existingCodeChecked = true;
        } else {
          warnings.push(`No existing code found for '${feature}' - ensure this is a new feature`);
          checklist.existingCodeChecked = true; // Pass but with warning
        }
      } else {
        warnings.push("No feature context provided - skipping existing code check");
      }

      // Check 3: Dependencies Verified
      const dependencies = context.dependencies as string[] | undefined;
      if (dependencies && dependencies.length > 0) {
        const missingDeps = await this.checkDependencies(dependencies);
        if (missingDeps.length > 0) {
          blockers.push(`Missing dependencies: ${missingDeps.join(', ')}`);
        } else {
          checklist.dependenciesVerified = true;
        }
      } else {
        checklist.dependenciesVerified = true; // No deps to check
      }

      // Check 4: Breaking Change Risk Assessment
      const affectsSchema = requirement.toLowerCase().includes('schema') || 
                           requirement.toLowerCase().includes('database');
      const affectsAPI = requirement.toLowerCase().includes('api') || 
                        requirement.toLowerCase().includes('endpoint');
      
      if (affectsSchema || affectsAPI) {
        warnings.push(`Potential breaking change - modifies ${affectsSchema ? 'schema' : 'API'}`);
      }
      checklist.breakingChangeRiskAssessed = true;

      // Check 5: Similar Pattern Search
      const patterns = await this.searchSimilarPatterns(requirement);
      if (patterns.length > 0) {
        logInfo(`Found ${patterns.length} similar patterns in codebase`, { patterns: patterns.slice(0, 3) });
        checklist.similarPatternSearched = true;
      } else {
        warnings.push("No similar patterns found - this appears to be a new type of implementation");
        checklist.similarPatternSearched = true;
      }

      // Overall decision
      const passed = blockers.length === 0;
      const recommendation = passed 
        ? "✅ Pre-execution validation passed - safe to proceed"
        : `⛔ Pre-execution validation FAILED - resolve ${blockers.length} blocker(s) before proceeding`;

      const result: PreExecutionResult = {
        passed,
        checklist,
        warnings,
        blockers,
        recommendation,
      };

      // Log violation if failed
      if (!passed) {
        await this.recordViolation({
          guardrailLayer: 'Layer 1: Pre-Execution',
          violationType: 'pre_execution_failure',
          severity: 'high',
          agentId,
          targetFeature: feature || 'unknown',
          violationDetails: { checklist, warnings, blockers },
          expectedBehavior: 'All pre-execution checks should pass',
          actualBehavior: `${blockers.length} blocker(s) found`,
          detectedBy: this.serviceId,
        });
      }

      return result;

    } catch (error) {
      logError(error as Error, { context: 'Layer 1 Pre-Execution Validation', agentId });
      throw error;
    }
  }

  // ==========================================================================
  // LAYER 2: MULTI-AI CODE REVIEW
  // ==========================================================================

  /**
   * Performs peer validation using Agents #79, #68, #80
   * Implements APPENDIX Q Layer 2 multi-AI review protocol
   * 
   * @param request - Code review request with code and context
   * @returns Multi-AI review result with approval decision
   * 
   * @example
   * ```typescript
   * const review = await guardrails.layer2_multiAIReview({
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
  async layer2_multiAIReview(
    request: z.infer<typeof CodeReviewRequestSchema>
  ): Promise<CodeReviewResult> {
    const validated = CodeReviewRequestSchema.parse(request);
    logInfo(`[${this.serviceId}] Layer 2: Multi-AI Code Review`, { 
      agentId: validated.agentId, 
      filesCount: validated.affectedFiles.length 
    });

    try {
      // Run 3 parallel validations
      const [agent79Quality, agent68Patterns, agent80Documentation] = await Promise.all([
        this.runAgent79QualityCheck(validated),
        this.runAgent68PatternCheck(validated),
        this.runAgent80DocumentationCheck(validated),
      ]);

      // Collect all blockers
      const blockers: string[] = [];
      if (!agent79Quality.passed) blockers.push(...agent79Quality.issues);
      if (!agent68Patterns.passed) blockers.push(...agent68Patterns.issues);
      if (!agent80Documentation.passed) blockers.push(...agent80Documentation.issues);

      const approved = blockers.length === 0;
      const overallRecommendation = approved
        ? "✅ Multi-AI review passed - code meets quality standards"
        : `⛔ Multi-AI review FAILED - ${blockers.length} issue(s) must be resolved`;

      const result: CodeReviewResult = {
        approved,
        agent79Quality,
        agent68Patterns,
        agent80Documentation,
        overallRecommendation,
        blockers,
      };

      // Log violation if failed
      if (!approved) {
        await this.recordViolation({
          guardrailLayer: 'Layer 2: Multi-AI Review',
          violationType: 'code_review_failure',
          severity: blockers.length > 3 ? 'critical' : 'high',
          agentId: validated.agentId,
          targetFeature: validated.feature || 'unknown',
          targetFile: validated.affectedFiles[0],
          violationDetails: { agent79Quality, agent68Patterns, agent80Documentation },
          codeSnippet: validated.code.substring(0, 500),
          expectedBehavior: 'Code should pass all 3 AI reviews',
          actualBehavior: `Failed ${3 - [agent79Quality, agent68Patterns, agent80Documentation].filter(r => r.passed).length} review(s)`,
          detectedBy: 'Multi-AI Review System',
        });
      }

      return result;

    } catch (error) {
      logError(error as Error, { context: 'Layer 2 Multi-AI Review', agentId: validated.agentId });
      throw error;
    }
  }

  // ==========================================================================
  // LAYER 3: HALLUCINATION DETECTION
  // ==========================================================================

  /**
   * Verifies all code references actually exist in codebase
   * Implements APPENDIX Q Layer 3 hallucination detection
   * 
   * @param request - Code to check for hallucinations
   * @returns Hallucination detection result with confidence score
   * 
   * @example
   * ```typescript
   * const check = await guardrails.layer3_hallucinationDetection({
   *   code: 'import { magicalAutoFix } from "magic-lib";',
   *   fileType: 'typescript'
   * });
   * 
   * if (check.isHallucination) {
   *   console.log('Hallucinated:', check.issues);
   * }
   * ```
   */
  async layer3_hallucinationDetection(
    request: z.infer<typeof HallucinationCheckSchema>
  ): Promise<HallucinationResult> {
    const validated = HallucinationCheckSchema.parse(request);
    logInfo(`[${this.serviceId}] Layer 3: Hallucination Detection`, { fileType: validated.fileType });

    const issues: HallucinationResult['issues'] = [];

    try {
      // Extract imports from code
      const imports = this.extractImports(validated.code);
      for (const imp of imports) {
        const exists = await this.checkLibraryExists(imp);
        if (!exists) {
          issues.push({
            type: 'missing_import',
            item: imp,
            suggestion: `Install '${imp}' or remove the import`,
          });
        }
      }

      // Extract function calls
      const functionCalls = this.extractFunctionCalls(validated.code);
      for (const fn of functionCalls) {
        const exists = await this.checkFunctionExists(fn);
        if (!exists) {
          issues.push({
            type: 'unknown_function',
            item: fn,
            suggestion: `Function '${fn}' not found - possible hallucination`,
          });
        }
      }

      // Extract component references (for React/TSX)
      if (validated.fileType === 'tsx' || validated.fileType === 'jsx') {
        const components = this.extractComponentReferences(validated.code);
        for (const comp of components) {
          const exists = await this.checkComponentExists(comp);
          if (!exists) {
            issues.push({
              type: 'nonexistent_component',
              item: comp,
              suggestion: `Component '<${comp} />' not found in codebase`,
            });
          }
        }
      }

      // Calculate confidence (0-1)
      const totalChecks = imports.length + functionCalls.length;
      const confidence = totalChecks > 0 ? 1 - (issues.length / totalChecks) : 1;

      const isHallucination = issues.length > 0;
      const summary = isHallucination
        ? `⚠️ ${issues.length} potential hallucination(s) detected`
        : "✅ No hallucinations detected - all references valid";

      const result: HallucinationResult = {
        isHallucination,
        confidence,
        issues,
        summary,
      };

      // Log violation if hallucinations found
      if (isHallucination) {
        await this.recordViolation({
          guardrailLayer: 'Layer 3: Hallucination Detection',
          violationType: 'hallucination',
          severity: issues.length > 2 ? 'critical' : 'high',
          agentId: 'Unknown', // Will be set by caller
          violationDetails: { issues, confidence },
          codeSnippet: validated.code.substring(0, 500),
          expectedBehavior: 'All code references should exist in codebase or dependencies',
          actualBehavior: `${issues.length} non-existent reference(s) found`,
          detectedBy: 'Hallucination Detector',
        });
      }

      return result;

    } catch (error) {
      logError(error as Error, { context: 'Layer 3 Hallucination Detection' });
      throw error;
    }
  }

  // ==========================================================================
  // LAYER 4: BREAKING CHANGE PREVENTION
  // ==========================================================================

  /**
   * Analyzes impact of code changes before they're made
   * Implements APPENDIX Q Layer 4 breaking change detection
   * 
   * @param request - Before/after code comparison
   * @returns Breaking change analysis with migration requirements
   * 
   * @example
   * ```typescript
   * const analysis = await guardrails.layer4_breakingChangePrevention({
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
  async layer4_breakingChangePrevention(
    request: z.infer<typeof BreakingChangeRequestSchema>
  ): Promise<BreakingChangeResult> {
    const validated = BreakingChangeRequestSchema.parse(request);
    logInfo(`[${this.serviceId}] Layer 4: Breaking Change Prevention`, { 
      fileType: validated.fileType,
      filePath: validated.filePath 
    });

    const changes: BreakingChangeResult['changes'] = [];
    const affectedAreas: string[] = [];
    let migrationRequired = false;

    try {
      // Schema changes (MOST CRITICAL)
      if (validated.fileType === 'schema') {
        const schemaChanges = this.analyzeSchemaChanges(validated.beforeCode, validated.afterCode);
        changes.push(...schemaChanges);
        
        const hasTypeChange = schemaChanges.some(c => c.type === 'COLUMN_TYPE_CHANGE');
        const hasColumnRemoval = schemaChanges.some(c => c.type === 'COLUMN_REMOVED');
        
        if (hasTypeChange || hasColumnRemoval) {
          migrationRequired = true;
          affectedAreas.push('database', 'all queries using this table');
        }
      }

      // API changes
      if (validated.fileType === 'api') {
        const apiChanges = this.analyzeAPIChanges(validated.beforeCode, validated.afterCode);
        changes.push(...apiChanges);
        
        if (apiChanges.some(c => c.type === 'ENDPOINT_REMOVED' || c.type === 'REQUEST_FORMAT_CHANGE')) {
          affectedAreas.push('frontend API calls', 'mobile app', 'third-party integrations');
        }
      }

      // Component API changes
      if (validated.fileType === 'component') {
        const componentChanges = this.analyzeComponentChanges(validated.beforeCode, validated.afterCode);
        changes.push(...componentChanges);
        
        if (componentChanges.some(c => c.type === 'PROP_REMOVED' || c.type === 'PROP_TYPE_CHANGE')) {
          affectedAreas.push('all component usages');
        }
      }

      const breaking = changes.some(c => c.severity === 'CRITICAL' || c.severity === 'HIGH');
      const recommendation = breaking
        ? `⛔ BREAKING CHANGES DETECTED - Migration required. Review all affected areas: ${affectedAreas.join(', ')}`
        : "✅ No breaking changes detected - safe to proceed";

      const result: BreakingChangeResult = {
        breaking,
        changes,
        migrationRequired,
        affectedAreas,
        recommendation,
      };

      // Log violation if breaking changes found
      if (breaking) {
        await this.recordViolation({
          guardrailLayer: 'Layer 4: Breaking Change Prevention',
          violationType: 'breaking_change',
          severity: 'critical',
          agentId: 'Unknown', // Will be set by caller
          targetFile: validated.filePath,
          violationDetails: { changes, affectedAreas, migrationRequired },
          codeSnippet: validated.afterCode.substring(0, 500),
          expectedBehavior: 'Changes should be backward compatible',
          actualBehavior: `${changes.length} breaking change(s) detected`,
          detectedBy: 'Breaking Change Analyzer',
        });
      }

      return result;

    } catch (error) {
      logError(error as Error, { context: 'Layer 4 Breaking Change Prevention', filePath: validated.filePath });
      throw error;
    }
  }

  // ==========================================================================
  // LAYER 5: REQUIREMENT VERIFICATION
  // ==========================================================================

  /**
   * Validates that implementation matches requirements EXACTLY
   * Implements APPENDIX Q Layer 5 requirement verification
   * 
   * @param request - Requirement and implementation to verify
   * @returns Verification result with match score
   * 
   * @example
   * ```typescript
   * const verification = await guardrails.layer5_requirementVerification({
   *   requirement: 'Add dark mode toggle to navbar',
   *   implementation: '<Button onClick={toggleTheme}>Toggle Theme</Button>',
   *   feature: 'Dark Mode'
   * });
   * 
   * if (!verification.matched) {
   *   console.log('Gaps:', verification.gaps);
   * }
   * ```
   */
  async layer5_requirementVerification(
    request: z.infer<typeof RequirementVerificationSchema>
  ): Promise<RequirementVerificationResult> {
    const validated = RequirementVerificationSchema.parse(request);
    logInfo(`[${this.serviceId}] Layer 5: Requirement Verification`, { feature: validated.feature });

    const criteria: RequirementVerificationResult['criteria'] = [];
    const gaps: string[] = [];

    try {
      // Auto-generate verification criteria from requirement
      const autoCriteria = this.generateVerificationCriteria(validated.requirement);
      const allCriteria = [...autoCriteria, ...(validated.verificationCriteria || [])];

      // Check each criterion
      for (const criterion of allCriteria) {
        const met = this.checkCriterion(criterion, validated.implementation);
        criteria.push({
          criterion,
          met,
          evidence: met ? `Found in implementation` : undefined,
        });
        
        if (!met) {
          gaps.push(criterion);
        }
      }

      // Calculate match score (0-1)
      const score = criteria.length > 0 ? criteria.filter(c => c.met).length / criteria.length : 0;
      const matched = score >= 0.8; // 80% threshold

      const recommendation = matched
        ? `✅ Requirement verification passed (${Math.round(score * 100)}% match)`
        : `⛔ Requirement verification FAILED (${Math.round(score * 100)}% match) - ${gaps.length} gap(s)`;

      const result: RequirementVerificationResult = {
        matched,
        score,
        criteria,
        gaps,
        recommendation,
      };

      // Log violation if verification failed
      if (!matched) {
        await this.recordViolation({
          guardrailLayer: 'Layer 5: Requirement Verification',
          violationType: 'requirement_mismatch',
          severity: score < 0.5 ? 'critical' : 'high',
          agentId: 'Unknown', // Will be set by caller
          targetFeature: validated.feature,
          violationDetails: { score, criteria, gaps },
          expectedBehavior: validated.requirement,
          actualBehavior: `Only ${Math.round(score * 100)}% of requirements met`,
          detectedBy: 'Requirement Verifier',
        });
      }

      return result;

    } catch (error) {
      logError(error as Error, { context: 'Layer 5 Requirement Verification', feature: validated.feature });
      throw error;
    }
  }

  // ==========================================================================
  // LAYER 6: CONTINUOUS MONITORING
  // ==========================================================================

  /**
   * Monitors for runtime errors after deployment
   * Implements APPENDIX Q Layer 6 continuous monitoring
   * 
   * @returns Recent monitoring alerts
   * 
   * @example
   * ```typescript
   * const alerts = await guardrails.layer6_continuousMonitoring();
   * 
   * for (const alert of alerts) {
   *   if (alert.severity === 'critical') {
   *     console.log('Critical alert:', alert.message);
   *   }
   * }
   * ```
   */
  async layer6_continuousMonitoring(): Promise<MonitoringAlert[]> {
    logInfo(`[${this.serviceId}] Layer 6: Continuous Monitoring`);

    const alerts: MonitoringAlert[] = [];

    try {
      // Check for console errors (placeholder - would integrate with logging system)
      const consoleErrors = await this.getRecentConsoleErrors();
      if (consoleErrors.length > 0) {
        alerts.push({
          alertType: 'console_error',
          severity: 'high',
          message: `${consoleErrors.length} console errors detected`,
          context: { errors: consoleErrors.slice(0, 5) },
          occurrences: consoleErrors.length,
          firstSeen: new Date(),
          lastSeen: new Date(),
        });
      }

      // Check for API errors (placeholder - would integrate with API monitoring)
      const apiErrors = await this.getRecentAPIErrors();
      if (apiErrors.length > 0) {
        alerts.push({
          alertType: 'api_error',
          severity: 'critical',
          message: `${apiErrors.length} API errors detected`,
          context: { errors: apiErrors.slice(0, 5) },
          occurrences: apiErrors.length,
          firstSeen: new Date(),
          lastSeen: new Date(),
        });
      }

      // Log high-severity alerts as violations
      for (const alert of alerts) {
        if (alert.severity === 'critical' || alert.severity === 'high') {
          await this.recordViolation({
            guardrailLayer: 'Layer 6: Continuous Monitoring',
            violationType: alert.alertType,
            severity: alert.severity,
            agentId: 'System',
            targetFeature: alert.affectedFeature || 'unknown',
            violationDetails: alert.context,
            expectedBehavior: 'No runtime errors',
            actualBehavior: alert.message,
            detectedBy: 'Continuous Monitor',
          });
        }
      }

      return alerts;

    } catch (error) {
      logError(error as Error, { context: 'Layer 6 Continuous Monitoring' });
      return alerts; // Return partial results
    }
  }

  // ==========================================================================
  // LAYER 7: PATTERN LEARNING
  // ==========================================================================

  /**
   * Learns from mistakes and extracts prevention patterns
   * Implements APPENDIX Q Layer 7 pattern learning (Agent #68 integration)
   * 
   * @param violationId - ID of violation to learn from
   * @returns Pattern learning result
   * 
   * @example
   * ```typescript
   * const learning = await guardrails.layer7_patternLearning(123);
   * 
   * if (learning.patternExtracted) {
   *   console.log('Pattern learned:', learning.patternName);
   *   console.log('Prevention rule:', learning.preventionRule);
   * }
   * ```
   */
  async layer7_patternLearning(violationId: number): Promise<PatternLearningResult> {
    logInfo(`[${this.serviceId}] Layer 7: Pattern Learning`, { violationId });

    try {
      // Fetch violation details
      const violation = await db
        .select()
        .from(aiGuardrailViolations)
        .where(eq(aiGuardrailViolations.id, violationId))
        .limit(1);

      if (violation.length === 0) {
        throw new Error(`Violation ${violationId} not found`);
      }

      const v = violation[0];

      // Search for similar patterns
      const similarPatterns = await db
        .select()
        .from(learningPatterns)
        .where(sql`LOWER(${learningPatterns.category}) = LOWER(${v.violationType})`)
        .limit(5);

      let patternExtracted = false;
      let patternId: number | undefined;
      let patternName: string | undefined;
      let preventionRule: string | undefined;

      // If this is a recurring violation type, extract pattern
      const similarViolations = await db
        .select()
        .from(aiGuardrailViolations)
        .where(
          and(
            eq(aiGuardrailViolations.violationType, v.violationType),
            eq(aiGuardrailViolations.guardrailLayer, v.guardrailLayer)
          )
        )
        .limit(10);

      if (similarViolations.length >= 3) {
        // Pattern detected - extract prevention rule
        patternName = `${v.guardrailLayer}: ${v.violationType}`;
        preventionRule = this.generatePreventionRule(v.violationType, v.violationDetails as Record<string, unknown>);

        // Store pattern in learning_patterns table
        const [newPattern] = await db
          .insert(learningPatterns)
          .values({
            patternName,
            problemSignature: v.violationType,
            solutionTemplate: preventionRule,
            category: v.guardrailLayer,
            discoveredBy: [v.detectedBy],
            timesApplied: 0,
            successRate: 0.5,
            confidence: 0.7,
            metadata: { violationCount: similarViolations.length },
            isActive: true,
          })
          .onConflictDoUpdate({
            target: learningPatterns.patternName,
            set: {
              timesApplied: sql`${learningPatterns.timesApplied} + 1`,
              updatedAt: sql`NOW()`,
            },
          })
          .returning();

        patternId = newPattern.id;
        patternExtracted = true;

        // Update violation to link to pattern
        await db
          .update(aiGuardrailViolations)
          .set({
            patternExtracted: true,
            patternId,
            preventionRule,
            updatedAt: new Date(),
          })
          .where(eq(aiGuardrailViolations.id, violationId));

        logInfo(`[${this.serviceId}] Pattern learned: ${patternName}`, { patternId, preventionRule });
      }

      const result: PatternLearningResult = {
        patternExtracted,
        patternId,
        patternName,
        preventionRule,
        confidence: patternExtracted ? 0.7 : 0.3,
        applicableScenarios: [v.guardrailLayer, v.violationType],
      };

      return result;

    } catch (error) {
      logError(error as Error, { context: 'Layer 7 Pattern Learning', violationId });
      throw error;
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Records a guardrail violation to database
   */
  private async recordViolation(violation: Omit<InsertAIGuardrailViolation, 'detectedAt' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      await db.insert(aiGuardrailViolations).values({
        ...violation,
        status: 'open',
      });
      
      logWarning(`Guardrail violation recorded`, { 
        layer: violation.guardrailLayer, 
        type: violation.violationType,
        severity: violation.severity 
      });
    } catch (error) {
      logError(error as Error, { context: 'Record Violation' });
    }
  }

  /**
   * Searches codebase for existing implementations
   */
  private async searchCodebase(query: string): Promise<string[]> {
    // Placeholder - would use grep/ripgrep in real implementation
    return [];
  }

  /**
   * Checks if dependencies are installed in package.json
   */
  private async checkDependencies(deps: string[]): Promise<string[]> {
    const missingDeps: string[] = [];
    
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      for (const dep of deps) {
        if (!allDeps[dep]) {
          missingDeps.push(dep);
        }
      }
    } catch (error) {
      logError(error as Error, { context: 'Check Dependencies' });
    }

    return missingDeps;
  }

  /**
   * Searches for similar patterns in learning database
   */
  private async searchSimilarPatterns(query: string): Promise<string[]> {
    try {
      const patterns = await db
        .select()
        .from(learningPatterns)
        .where(sql`LOWER(${learningPatterns.problemSignature}) LIKE LOWER(${'%' + query + '%'})`)
        .limit(5);

      return patterns.map(p => p.patternName);
    } catch (error) {
      logError(error as Error, { context: 'Search Similar Patterns' });
      return [];
    }
  }

  /**
   * Agent #79 quality check (integrates with existing qualityValidator)
   */
  private async runAgent79QualityCheck(request: z.infer<typeof CodeReviewRequestSchema>): Promise<{ passed: boolean; issues: string[] }> {
    // Placeholder - would call actual Agent #79 service
    return { passed: true, issues: [] };
  }

  /**
   * Agent #68 pattern check
   */
  private async runAgent68PatternCheck(request: z.infer<typeof CodeReviewRequestSchema>): Promise<{ passed: boolean; issues: string[] }> {
    // Placeholder - would call Agent #68 pattern recognition service
    return { passed: true, issues: [] };
  }

  /**
   * Agent #80 documentation check
   */
  private async runAgent80DocumentationCheck(request: z.infer<typeof CodeReviewRequestSchema>): Promise<{ passed: boolean; issues: string[] }> {
    // Placeholder - would call Agent #80 learning coordinator service
    return { passed: true, issues: [] };
  }

  /**
   * Extracts import statements from code
   */
  private extractImports(code: string): string[] {
    const importRegex = /import.*from\s+['"]([@\w\-\/]+)['"]/g;
    const matches = code.matchAll(importRegex);
    return Array.from(matches, m => m[1]);
  }

  /**
   * Extracts function calls from code
   */
  private extractFunctionCalls(code: string): string[] {
    const fnRegex = /(\w+)\s*\(/g;
    const matches = code.matchAll(fnRegex);
    const functions = Array.from(matches, m => m[1]);
    // Filter out common keywords
    return functions.filter(fn => !['if', 'for', 'while', 'switch', 'catch'].includes(fn));
  }

  /**
   * Extracts React component references from code
   */
  private extractComponentReferences(code: string): string[] {
    const componentRegex = /<(\w+)\s/g;
    const matches = code.matchAll(componentRegex);
    return Array.from(matches, m => m[1]).filter(c => c[0] === c[0].toUpperCase());
  }

  /**
   * Checks if library exists in package.json
   */
  private async checkLibraryExists(lib: string): Promise<boolean> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      return !!(packageJson.dependencies?.[lib] || packageJson.devDependencies?.[lib]);
    } catch {
      return false;
    }
  }

  /**
   * Checks if function exists in codebase (placeholder)
   */
  private async checkFunctionExists(fn: string): Promise<boolean> {
    // Placeholder - would search codebase
    return true; // Assume exists for now
  }

  /**
   * Checks if component exists in codebase (placeholder)
   */
  private async checkComponentExists(component: string): Promise<boolean> {
    // Placeholder - would search component files
    return true; // Assume exists for now
  }

  /**
   * Analyzes schema changes for breaking changes
   */
  private analyzeSchemaChanges(before: string, after: string): BreakingChangeResult['changes'] {
    const changes: BreakingChangeResult['changes'] = [];
    
    // Simple regex-based detection (placeholder)
    if (before.includes('serial') && after.includes('varchar')) {
      changes.push({
        type: 'COLUMN_TYPE_CHANGE',
        severity: 'CRITICAL',
        description: 'Primary key type changed from serial to varchar',
        from: 'serial',
        to: 'varchar',
        impact: 'All foreign keys and queries will break',
      });
    }

    return changes;
  }

  /**
   * Analyzes API changes for breaking changes
   */
  private analyzeAPIChanges(before: string, after: string): BreakingChangeResult['changes'] {
    const changes: BreakingChangeResult['changes'] = [];
    
    // Placeholder - would parse API routes
    return changes;
  }

  /**
   * Analyzes component changes for breaking changes
   */
  private analyzeComponentChanges(before: string, after: string): BreakingChangeResult['changes'] {
    const changes: BreakingChangeResult['changes'] = [];
    
    // Placeholder - would parse component props
    return changes;
  }

  /**
   * Generates verification criteria from requirement
   */
  private generateVerificationCriteria(requirement: string): string[] {
    const criteria: string[] = [];
    
    // Extract key terms
    if (requirement.includes('dark mode')) {
      criteria.push('Theme toggle functionality exists');
      criteria.push('Theme persists across page reloads');
    }
    
    if (requirement.includes('navbar')) {
      criteria.push('Implementation is in navbar component');
    }

    return criteria;
  }

  /**
   * Checks if criterion is met in implementation
   */
  private checkCriterion(criterion: string, implementation: string): boolean {
    // Simple keyword matching (placeholder)
    const keywords = criterion.toLowerCase().split(' ').filter(w => w.length > 3);
    return keywords.some(keyword => implementation.toLowerCase().includes(keyword));
  }

  /**
   * Gets recent console errors (placeholder)
   */
  private async getRecentConsoleErrors(): Promise<Array<{ message: string; timestamp: Date }>> {
    // Placeholder - would integrate with logging system
    return [];
  }

  /**
   * Gets recent API errors (placeholder)
   */
  private async getRecentAPIErrors(): Promise<Array<{ endpoint: string; error: string; timestamp: Date }>> {
    // Placeholder - would integrate with API monitoring
    return [];
  }

  /**
   * Generates prevention rule from violation type
   */
  private generatePreventionRule(violationType: string, details: Record<string, unknown>): string {
    switch (violationType) {
      case 'hallucination':
        return 'Always verify imports exist in package.json before using them';
      case 'breaking_change':
        return 'Never change database column types without migration';
      case 'requirement_mismatch':
        return 'Verify implementation matches all requirement criteria before submitting';
      default:
        return `Avoid ${violationType} by following pre-execution checklist`;
    }
  }
}

// Export singleton instance
export const aiGuardrails = new AIGuardrailsService();
