/**
 * AI Guardrails Middleware (APPENDIX Q - BATCH 28)
 * Express middleware for enforcing AI error prevention guardrails
 * 
 * @module AIGuardrailsMiddleware
 * @description Provides Express middleware for wrapping critical operations with guardrail checks
 * 
 * Key Features:
 * - Pre-execution validation middleware
 * - Code review enforcement
 * - Hallucination detection for code submissions
 * - Breaking change prevention for schema/API changes
 * - Requirement verification middleware
 * 
 * @author ESA Intelligence Network
 * @version 1.0.0
 * @since 2025-01-12
 */

import { Request, Response, NextFunction } from "express";
import { aiGuardrails } from "../services/quality/aiGuardrails";
import { logInfo, logWarn, logError } from "./logger";
import { z } from "zod";

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for code submission requests
 */
const CodeSubmissionSchema = z.object({
  code: z.string().min(1),
  requirements: z.string().optional(),
  affectedFiles: z.array(z.string()).optional(),
  agentId: z.string().optional(),
  feature: z.string().optional(),
  fileType: z.enum(['typescript', 'javascript', 'tsx', 'jsx', 'json']).optional(),
});

/**
 * Schema for schema change requests
 */
const SchemaChangeSchema = z.object({
  beforeCode: z.string().optional(),
  afterCode: z.string().min(1),
  filePath: z.string(),
  migration: z.object({
    required: z.boolean().optional(),
    plan: z.string().optional(),
  }).optional(),
});

/**
 * Schema for requirement implementation requests
 */
const RequirementImplementationSchema = z.object({
  requirement: z.string().min(1),
  implementation: z.string().min(1),
  feature: z.string(),
  verificationCriteria: z.array(z.string()).optional(),
});

// ============================================================================
// MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Pre-execution validation middleware
 * Ensures AI validates requirements BEFORE starting work
 * 
 * Usage:
 * ```typescript
 * router.post('/api/features', 
 *   preExecutionValidation, 
 *   async (req, res) => { ... }
 * );
 * ```
 * 
 * Expected request body:
 * - requirement: string - What needs to be built
 * - agentId: string - Which AI is making the request
 * - feature?: string - Feature name for context
 * - dependencies?: string[] - Required dependencies
 */
export async function preExecutionValidation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { requirement, agentId, feature, dependencies } = req.body;

    if (!requirement || !agentId) {
      res.status(400).json({
        error: "Missing required fields: requirement, agentId",
      });
      return;
    }

    logInfo("[Guardrails] Pre-execution validation check", { agentId, feature });

    const result = await aiGuardrails.layer1_preExecutionValidation(
      agentId,
      requirement,
      { feature, dependencies }
    );

    if (!result.passed) {
      logWarn("[Guardrails] Pre-execution validation FAILED", {
        agentId,
        blockers: result.blockers,
        warnings: result.warnings,
      });

      res.status(400).json({
        error: "Pre-execution validation failed",
        blockers: result.blockers,
        warnings: result.warnings,
        recommendation: result.recommendation,
        checklist: result.checklist,
      });
      return;
    }

    // Validation passed - attach result to request for downstream use
    (req as Request & { guardrailResults: unknown }).guardrailResults = {
      preExecution: result,
    };

    next();
  } catch (error) {
    logError(error as Error, { context: "Pre-execution validation middleware" });
    res.status(500).json({
      error: "Guardrail validation error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Code review enforcement middleware
 * Requires multi-AI peer validation before code submission
 * 
 * Usage:
 * ```typescript
 * router.post('/api/code/submit', 
 *   enforceCodeReview, 
 *   async (req, res) => { ... }
 * );
 * ```
 * 
 * Expected request body:
 * - code: string - Code to review
 * - requirements?: string - What the code should do
 * - affectedFiles?: string[] - Which files are modified
 * - agentId?: string - Which AI wrote the code
 * - feature?: string - Feature name
 */
export async function enforceCodeReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = CodeSubmissionSchema.parse(req.body);

    logInfo("[Guardrails] Code review enforcement check", {
      agentId: validated.agentId || "Unknown",
      feature: validated.feature,
    });

    const review = await aiGuardrails.layer2_multiAIReview({
      code: validated.code,
      requirements: validated.requirements || "No requirements specified",
      affectedFiles: validated.affectedFiles || [],
      agentId: validated.agentId || "Unknown",
      feature: validated.feature,
    });

    if (!review.approved) {
      logWarn("[Guardrails] Code review FAILED", {
        agentId: validated.agentId || "Unknown",
        blockers: review.blockers,
      });

      res.status(400).json({
        error: "Code review failed",
        blockers: review.blockers,
        recommendation: review.overallRecommendation,
        details: {
          agent79Quality: review.agent79Quality,
          agent68Patterns: review.agent68Patterns,
          agent80Documentation: review.agent80Documentation,
        },
      });
      return;
    }

    // Review passed - attach result to request
    (req as Request & { guardrailResults: Record<string, unknown> }).guardrailResults = {
      ...(req as Request & { guardrailResults?: Record<string, unknown> }).guardrailResults,
      codeReview: review,
    };

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid request body",
        details: error.errors,
      });
      return;
    }

    logError(error as Error, { context: "Code review middleware" });
    res.status(500).json({
      error: "Code review error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Hallucination detection middleware
 * Verifies all code references actually exist before allowing submission
 * 
 * Usage:
 * ```typescript
 * router.post('/api/code/deploy', 
 *   detectHallucinations, 
 *   async (req, res) => { ... }
 * );
 * ```
 * 
 * Expected request body:
 * - code: string - Code to check
 * - fileType: 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'json'
 */
export async function detectHallucinations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = CodeSubmissionSchema.parse(req.body);

    logInfo("[Guardrails] Hallucination detection check", {
      fileType: validated.fileType || "unknown",
    });

    const result = await aiGuardrails.layer3_hallucinationDetection({
      code: validated.code,
      fileType: validated.fileType || "typescript",
    });

    if (result.isHallucination) {
      logWarn("[Guardrails] Hallucinations detected", {
        issueCount: result.issues.length,
        confidence: result.confidence,
      });

      res.status(400).json({
        error: "Hallucinations detected in code",
        issues: result.issues,
        confidence: result.confidence,
        summary: result.summary,
      });
      return;
    }

    // No hallucinations - attach result to request
    (req as Request & { guardrailResults: Record<string, unknown> }).guardrailResults = {
      ...(req as Request & { guardrailResults?: Record<string, unknown> }).guardrailResults,
      hallucination: result,
    };

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid request body",
        details: error.errors,
      });
      return;
    }

    logError(error as Error, { context: "Hallucination detection middleware" });
    res.status(500).json({
      error: "Hallucination detection error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Breaking change prevention middleware
 * Analyzes schema/API changes for breaking changes before deployment
 * 
 * Usage:
 * ```typescript
 * router.post('/api/schema/update', 
 *   preventBreakingChanges, 
 *   async (req, res) => { ... }
 * );
 * ```
 * 
 * Expected request body:
 * - beforeCode?: string - Original code
 * - afterCode: string - Modified code
 * - filePath: string - Path to file being modified
 * - fileType: 'schema' | 'api' | 'component' | 'config'
 * - migration?: { required: boolean, plan: string }
 */
export async function preventBreakingChanges(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = SchemaChangeSchema.parse(req.body);
    const fileType = validated.filePath.includes('schema') ? 'schema' :
                     validated.filePath.includes('api') || validated.filePath.includes('routes') ? 'api' :
                     validated.filePath.includes('component') ? 'component' : 'config';

    logInfo("[Guardrails] Breaking change analysis", {
      filePath: validated.filePath,
      fileType,
    });

    const analysis = await aiGuardrails.layer4_breakingChangePrevention({
      beforeCode: validated.beforeCode || "",
      afterCode: validated.afterCode,
      fileType,
      filePath: validated.filePath,
    });

    if (analysis.breaking) {
      // Check if migration plan is provided
      const hasMigrationPlan = validated.migration?.required && validated.migration?.plan;

      if (!hasMigrationPlan) {
        logWarn("[Guardrails] Breaking changes detected without migration plan", {
          filePath: validated.filePath,
          changeCount: analysis.changes.length,
        });

        res.status(400).json({
          error: "Breaking changes detected - migration required",
          breaking: true,
          changes: analysis.changes,
          migrationRequired: analysis.migrationRequired,
          affectedAreas: analysis.affectedAreas,
          recommendation: analysis.recommendation,
          hint: "Provide a migration plan in request body: { migration: { required: true, plan: '...' } }",
        });
        return;
      }

      logWarn("[Guardrails] Breaking changes detected (migration plan provided)", {
        filePath: validated.filePath,
        migrationPlan: validated.migration.plan,
      });
    }

    // Attach analysis to request
    (req as Request & { guardrailResults: Record<string, unknown> }).guardrailResults = {
      ...(req as Request & { guardrailResults?: Record<string, unknown> }).guardrailResults,
      breakingChange: analysis,
    };

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid request body",
        details: error.errors,
      });
      return;
    }

    logError(error as Error, { context: "Breaking change prevention middleware" });
    res.status(500).json({
      error: "Breaking change analysis error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Requirement verification middleware
 * Ensures implementation matches requirements before deployment
 * 
 * Usage:
 * ```typescript
 * router.post('/api/features/deploy', 
 *   verifyRequirements, 
 *   async (req, res) => { ... }
 * );
 * ```
 * 
 * Expected request body:
 * - requirement: string - Original requirement
 * - implementation: string - Code implementation
 * - feature: string - Feature name
 * - verificationCriteria?: string[] - Specific criteria to check
 */
export async function verifyRequirements(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated = RequirementImplementationSchema.parse(req.body);

    logInfo("[Guardrails] Requirement verification", {
      feature: validated.feature,
    });

    const verification = await aiGuardrails.layer5_requirementVerification({
      requirement: validated.requirement,
      implementation: validated.implementation,
      feature: validated.feature,
      verificationCriteria: validated.verificationCriteria,
    });

    if (!verification.matched) {
      logWarn("[Guardrails] Requirement verification FAILED", {
        feature: validated.feature,
        score: verification.score,
        gaps: verification.gaps,
      });

      res.status(400).json({
        error: "Implementation does not match requirements",
        matched: false,
        score: verification.score,
        gaps: verification.gaps,
        criteria: verification.criteria,
        recommendation: verification.recommendation,
      });
      return;
    }

    // Verification passed - attach result to request
    (req as Request & { guardrailResults: Record<string, unknown> }).guardrailResults = {
      ...(req as Request & { guardrailResults?: Record<string, unknown> }).guardrailResults,
      requirementVerification: verification,
    };

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid request body",
        details: error.errors,
      });
      return;
    }

    logError(error as Error, { context: "Requirement verification middleware" });
    res.status(500).json({
      error: "Requirement verification error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Combined guardrails middleware
 * Runs multiple guardrail checks in sequence
 * 
 * Usage:
 * ```typescript
 * router.post('/api/critical/operation', 
 *   fullGuardrailValidation(['preExecution', 'codeReview', 'hallucination']), 
 *   async (req, res) => { ... }
 * );
 * ```
 * 
 * @param layers - Array of guardrail layers to enforce
 * @returns Express middleware function
 */
export function fullGuardrailValidation(
  layers: Array<'preExecution' | 'codeReview' | 'hallucination' | 'breakingChange' | 'requirements'>
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logInfo("[Guardrails] Running full validation", { layers });

      // Initialize guardrail results on request
      (req as Request & { guardrailResults: Record<string, unknown> }).guardrailResults = {};

      // Run each layer sequentially
      for (const layer of layers) {
        switch (layer) {
          case 'preExecution':
            await new Promise<void>((resolve, reject) => {
              preExecutionValidation(req, res, (err?: unknown) => {
                if (err) reject(err);
                else resolve();
              });
            });
            break;

          case 'codeReview':
            await new Promise<void>((resolve, reject) => {
              enforceCodeReview(req, res, (err?: unknown) => {
                if (err) reject(err);
                else resolve();
              });
            });
            break;

          case 'hallucination':
            await new Promise<void>((resolve, reject) => {
              detectHallucinations(req, res, (err?: unknown) => {
                if (err) reject(err);
                else resolve();
              });
            });
            break;

          case 'breakingChange':
            await new Promise<void>((resolve, reject) => {
              preventBreakingChanges(req, res, (err?: unknown) => {
                if (err) reject(err);
                else resolve();
              });
            });
            break;

          case 'requirements':
            await new Promise<void>((resolve, reject) => {
              verifyRequirements(req, res, (err?: unknown) => {
                if (err) reject(err);
                else resolve();
              });
            });
            break;
        }

        // If response was sent (validation failed), stop
        if (res.headersSent) {
          return;
        }
      }

      // All layers passed
      logInfo("[Guardrails] Full validation PASSED", { layers });
      next();

    } catch (error) {
      logError(error as Error, { context: "Full guardrail validation" });
      if (!res.headersSent) {
        res.status(500).json({
          error: "Guardrail validation error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  };
}
