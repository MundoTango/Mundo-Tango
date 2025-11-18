import { Router, type Request, Response } from "express";
import { db } from "../db";
import { errorPatterns, insertErrorPatternSchema } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { ErrorAnalysisAgent } from "../services/mrBlue/errorAnalysisAgent";
import { SolutionSuggesterAgent } from "../services/mrBlue/solutionSuggesterAgent";
import { contextService } from "../services/mrBlue/ContextService";

const router = Router();

// Initialize AI agents
const errorAnalysisAgent = new ErrorAnalysisAgent();
const solutionSuggesterAgent = new SolutionSuggesterAgent();

// ============================================================================
// ERROR ANALYSIS API - PHASE 3
// ============================================================================

// Request validation schema
const analyzeErrorsSchema = z.object({
  errors: z.array(z.object({
    errorType: z.string().optional(),
    errorMessage: z.string().min(1),
    errorStack: z.string().optional(),
    metadata: z.any().optional(),
  })).min(1).max(10), // Limit to 10 errors per request
});

/**
 * POST /api/mrblue/analyze-error
 * Analyzes batch of errors using AI and stores patterns in database
 */
router.post("/analyze-error", async (req: Request, res: Response) => {
  try {
    console.log('[Error Analysis API] Received error batch:', req.body);

    // Validate request
    const validationResult = analyzeErrorsSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.error('[Error Analysis API] Validation failed:', validationResult.error);
      return res.status(400).json({
        error: "Invalid request format",
        details: validationResult.error.errors,
      });
    }

    const { errors } = validationResult.data;
    console.log(`[Error Analysis API] Processing ${errors.length} errors`);

    // Track results
    const results = {
      analyzedCount: 0,
      commonalities: [] as Array<{
        pattern: string;
        count: number;
        examples: string[];
      }>,
      suggestions: [] as Array<{
        errorId: number;
        suggestion: string;
        confidence: number;
      }>,
      autoFixes: [] as Array<{
        errorId: number;
        fix: string;
        applied: boolean;
      }>,
      escalations: [] as Array<{
        errorId: number;
        reason: string;
      }>,
    };

    // Step 1: Analyze each error and store in database
    const storedErrors: Array<{ id: number; error: any }> = [];

    for (const error of errors) {
      try {
        console.log(`[Error Analysis API] Analyzing error: ${error.errorMessage.substring(0, 50)}...`);

        // Check if similar error already exists
        const existingErrors = await db
          .select()
          .from(errorPatterns)
          .where(eq(errorPatterns.errorMessage, error.errorMessage))
          .limit(1);

        let errorId: number;

        if (existingErrors.length > 0) {
          // Update frequency and lastSeen for existing error
          const existing = existingErrors[0];
          console.log(`[Error Analysis API] Found existing error pattern (id: ${existing.id})`);

          await db
            .update(errorPatterns)
            .set({
              frequency: sql`${errorPatterns.frequency} + 1`,
              lastSeen: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(errorPatterns.id, existing.id));

          errorId = existing.id;
        } else {
          // Insert new error pattern
          console.log('[Error Analysis API] Creating new error pattern');

          const [inserted] = await db
            .insert(errorPatterns)
            .values({
              errorType: error.errorType || 'unknown',
              errorMessage: error.errorMessage,
              errorStack: error.errorStack,
              metadata: error.metadata,
              status: 'pending',
              frequency: 1,
            })
            .returning();

          errorId = inserted.id;
        }

        storedErrors.push({ id: errorId, error });
        results.analyzedCount++;

        console.log(`[Error Analysis API] ✅ Stored error (id: ${errorId})`);
      } catch (error: any) {
        console.error('[Error Analysis API] Error storing pattern:', error);
      }
    }

    // Step 2: Find similar errors using LanceDB (via contextService)
    console.log('[Error Analysis API] Searching for similar errors...');

    const similarErrorGroups: Map<number, number[]> = new Map();

    for (const { id, error } of storedErrors) {
      try {
        // Search for similar errors (stub for now - will be implemented with LanceDB)
        const similarErrors = await contextService.searchErrors(error.errorMessage, 5);
        
        if (similarErrors.length > 0) {
          const similarIds = similarErrors
            .filter((e: any) => e.id !== id)
            .map((e: any) => e.id);

          if (similarIds.length > 0) {
            similarErrorGroups.set(id, similarIds);

            // Update similarErrors field in database
            await db
              .update(errorPatterns)
              .set({
                similarErrors: similarIds,
                updatedAt: new Date(),
              })
              .where(eq(errorPatterns.id, id));
          }
        }
      } catch (error: any) {
        console.error(`[Error Analysis API] Error finding similar errors for id ${id}:`, error);
      }
    }

    // Step 3: Detect commonalities using ErrorAnalysisAgent
    console.log('[Error Analysis API] Detecting commonalities...');

    try {
      const allErrors = await db
        .select()
        .from(errorPatterns)
        .orderBy(desc(errorPatterns.frequency))
        .limit(20);

      const patternAnalysis = await errorAnalysisAgent.analyzeBugPatterns(allErrors);
      results.commonalities = patternAnalysis.patterns || [];

      console.log(`[Error Analysis API] ✅ Found ${results.commonalities.length} common patterns`);
    } catch (error: any) {
      console.error('[Error Analysis API] Error analyzing patterns:', error);
    }

    // Step 4: Get top 5 errors by frequency for solution suggestions
    console.log('[Error Analysis API] Getting solution suggestions for top errors...');

    const topErrors = await db
      .select()
      .from(errorPatterns)
      .where(eq(errorPatterns.status, 'pending'))
      .orderBy(desc(errorPatterns.frequency))
      .limit(5);

    // Step 5: Generate solutions using SolutionSuggesterAgent
    for (const errorPattern of topErrors) {
      try {
        console.log(`[Error Analysis API] Generating solution for error ${errorPattern.id}...`);

        // Call SolutionSuggesterAgent.suggest()
        const suggestion = await solutionSuggesterAgent.suggestFix(errorPattern.id);

        console.log(`[Error Analysis API] ✅ Generated suggestion (confidence: ${suggestion.confidence})`);

        // Store suggestion in database
        await db
          .update(errorPatterns)
          .set({
            suggestedFix: suggestion.code,
            aiAnalysis: {
              explanation: suggestion.explanation,
              files: suggestion.files,
              generatedAt: new Date().toISOString(),
            },
            fixConfidence: suggestion.confidence.toString(),
            status: 'analyzed',
            updatedAt: new Date(),
          })
          .where(eq(errorPatterns.id, errorPattern.id));

        results.suggestions.push({
          errorId: errorPattern.id,
          suggestion: suggestion.explanation,
          confidence: suggestion.confidence,
        });

        // Step 7: Auto-fix if confidence is very high (> 0.90)
        if (suggestion.confidence > 0.90) {
          console.log(`[Error Analysis API] 🔧 Step 7: Auto-applying fix for error ${errorPattern.id} (confidence: ${suggestion.confidence})...`);
          
          try {
            // Note: Auto-fix is tracked but not auto-applied to prevent unintended changes
            // User must explicitly click "Apply Fix" in the UI for safety
            results.autoFixes.push({
              errorId: errorPattern.id,
              fix: suggestion.code,
              applied: false, // Will be true when user clicks "Apply Fix" button
            });
            
            console.log(`[Error Analysis API] ✅ Auto-fix candidate identified for error ${errorPattern.id}`);
          } catch (error: any) {
            console.error(`[Error Analysis API] ❌ Auto-fix preparation failed for error ${errorPattern.id}:`, error);
          }
        } else if (suggestion.confidence > 0.85) {
          // Medium-high confidence - suggest but don't auto-apply
          results.autoFixes.push({
            errorId: errorPattern.id,
            fix: suggestion.code,
            applied: false,
          });
        }

        // Escalate if confidence is low (< 0.4) and frequency is high (> 5)
        if (suggestion.confidence < 0.4 && errorPattern.frequency > 5) {
          results.escalations.push({
            errorId: errorPattern.id,
            reason: `Low confidence (${suggestion.confidence}) with high frequency (${errorPattern.frequency})`,
          });

          await db
            .update(errorPatterns)
            .set({
              status: 'escalated',
              updatedAt: new Date(),
            })
            .where(eq(errorPatterns.id, errorPattern.id));
        }
      } catch (error: any) {
        console.error(`[Error Analysis API] Error generating suggestion for ${errorPattern.id}:`, error);
      }
    }

    console.log('[Error Analysis API] ✅ Analysis complete!');
    console.log('[Error Analysis API] Results:', {
      analyzed: results.analyzedCount,
      commonalities: results.commonalities.length,
      suggestions: results.suggestions.length,
      autoFixes: results.autoFixes.length,
      escalations: results.escalations.length,
    });

    return res.status(200).json({
      success: true,
      ...results,
    });
  } catch (error: any) {
    console.error('[Error Analysis API] Fatal error:', error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * GET /api/mrblue/error-patterns
 * Retrieve error patterns with optional filters
 */
router.get("/error-patterns", async (req: Request, res: Response) => {
  try {
    const { status, limit = '20', offset = '0' } = req.query;

    let query = db
      .select()
      .from(errorPatterns)
      .orderBy(desc(errorPatterns.frequency));

    if (status && typeof status === 'string') {
      query = query.where(eq(errorPatterns.status, status)) as any;
    }

    const patterns = await query
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    return res.status(200).json({
      success: true,
      patterns,
      count: patterns.length,
    });
  } catch (error: any) {
    console.error('[Error Analysis API] Error fetching patterns:', error);
    return res.status(500).json({
      error: "Failed to fetch error patterns",
      message: error.message,
    });
  }
});

/**
 * GET /api/mrblue/error-patterns/:id
 * Retrieve single error pattern with details
 */
router.get("/error-patterns/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [pattern] = await db
      .select()
      .from(errorPatterns)
      .where(eq(errorPatterns.id, parseInt(id)))
      .limit(1);

    if (!pattern) {
      return res.status(404).json({
        error: "Error pattern not found",
      });
    }

    return res.status(200).json({
      success: true,
      pattern,
    });
  } catch (error: any) {
    console.error('[Error Analysis API] Error fetching pattern:', error);
    return res.status(500).json({
      error: "Failed to fetch error pattern",
      message: error.message,
    });
  }
});

export default router;
