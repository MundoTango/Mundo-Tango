import { Router, type Request, Response } from "express";
import { db } from "../db";
import { errorPatterns, insertErrorPatternSchema } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { contextService } from "../services/ContextService";

const router = Router();

// MB.MD Pattern: Lazy-loaded services to avoid circular dependencies
let errorAnalysisAgent: any = null;
let solutionSuggesterAgent: any = null;
let autoFixEngine: any = null;

async function getErrorAnalysisAgent() {
  if (!errorAnalysisAgent) {
    const { ErrorAnalysisAgent } = await import("../services/mrBlue/errorAnalysisAgent");
    errorAnalysisAgent = new ErrorAnalysisAgent();
  }
  return errorAnalysisAgent;
}

async function getSolutionSuggesterAgent() {
  if (!solutionSuggesterAgent) {
    const { SolutionSuggesterAgent } = await import("../services/mrBlue/solutionSuggesterAgent");
    solutionSuggesterAgent = new SolutionSuggesterAgent();
  }
  return solutionSuggesterAgent;
}

async function getAutoFixEngineInstance() {
  if (!autoFixEngine) {
    const { getAutoFixEngine } = await import("../services/mrBlue/AutoFixEngine");
    autoFixEngine = await getAutoFixEngine();
    await autoFixEngine.initialize();
  }
  return autoFixEngine;
}

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
  })).min(1).max(500), // Increased to 500 to handle batch bursts (MB.MD Pattern 48 fix)
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

    // Step 1: Analyze and store errors IN PARALLEL (MB.MD v9.8 - Pattern 28: Parallel Agent Squads)
    console.log(`[Error Analysis API] 🚀 Processing ${errors.length} errors in PARALLEL`);
    
    const storeErrorPromises = errors.map(async (error) => {
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
          
          // Index in LanceDB for semantic search (MB.MD v9.8) - fire and forget
          contextService.indexError(errorId, error.errorMessage, {
            errorType: error.errorType,
            metadata: error.metadata,
          }).catch(err => console.warn('[Error Analysis API] LanceDB indexing failed (non-critical):', err.message));
        }

        console.log(`[Error Analysis API] ✅ Stored error (id: ${errorId})`);
        return { id: errorId, error, success: true };
      } catch (err: any) {
        console.error('[Error Analysis API] Error storing pattern:', err);
        return { id: 0, error, success: false };
      }
    });

    const storeResults = await Promise.all(storeErrorPromises);
    const storedErrors = storeResults.filter(r => r.success);
    results.analyzedCount = storedErrors.length;
    console.log(`[Error Analysis API] ✅ Stored ${storedErrors.length}/${errors.length} errors in parallel`)

    // Step 2: Find similar errors using LanceDB IN PARALLEL (MB.MD v9.8)
    console.log('[Error Analysis API] 🚀 Searching for similar errors in PARALLEL...');

    const similarErrorGroups: Map<number, number[]> = new Map();

    const searchPromises = storedErrors.map(async ({ id, error }) => {
      try {
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
        return { id, success: true };
      } catch (err: any) {
        console.error(`[Error Analysis API] Error finding similar errors for id ${id}:`, err);
        return { id, success: false };
      }
    });

    await Promise.all(searchPromises);
    console.log(`[Error Analysis API] ✅ Similar error search complete for ${storedErrors.length} errors`)

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
            // ✅ MB.MD v9.2 Fix: Store as string for DECIMAL(3,2) column
            fixConfidence: suggestion.confidence.toFixed(2),
            status: 'analyzed',
            updatedAt: new Date(),
          })
          .where(eq(errorPatterns.id, errorPattern.id));

        results.suggestions.push({
          errorId: errorPattern.id,
          suggestion: suggestion.explanation,
          confidence: suggestion.confidence,
        });

        // Step 7: AUTONOMOUS AUTO-FIX using AutoFixEngine
        // This triggers automatically based on confidence scores:
        // - >95%: Auto-apply immediately (no manual intervention)
        // - 80-95%: Stage for approval
        // - <80%: Manual review required
        // ✅ MB.MD v9.5 Fix: Changed > to >= so 0.80 exactly triggers
        if (autoFixEngine && suggestion.confidence >= 0.80) {
          console.log(`[Error Analysis API] 🤖 Step 7: AUTONOMOUS fix triggered for error ${errorPattern.id} (confidence: ${Math.round(suggestion.confidence * 100)}%)...`);
          
          try {
            // Trigger autonomous fix (runs in background, non-blocking)
            setImmediate(async () => {
              try {
                const autoFixResult = await autoFixEngine.processError(errorPattern.id);
                
                console.log(`[Error Analysis API] ${autoFixResult.success ? '✅' : '❌'} Autonomous fix ${autoFixResult.decision.action}: ${autoFixResult.decision.reasoning}`);
                
                results.autoFixes.push({
                  errorId: errorPattern.id,
                  fix: autoFixResult.fixAnalysis.suggestedFix,
                  applied: autoFixResult.decision.action === 'auto-fix' && autoFixResult.success,
                });
              } catch (error: any) {
                console.error(`[Error Analysis API] ❌ Autonomous fix failed for error ${errorPattern.id}:`, error);
              }
            });
            
            console.log(`[Error Analysis API] ✅ Autonomous fix queued for error ${errorPattern.id}`);
          } catch (error: any) {
            console.error(`[Error Analysis API] ❌ Failed to queue autonomous fix for error ${errorPattern.id}:`, error);
          }
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

/**
 * GET /api/mrblue/auto-fix/status
 * Server-Sent Events endpoint for real-time auto-fix status updates
 */
router.get("/auto-fix/status", async (req: Request, res: Response) => {
  console.log('[AutoFix SSE] Client connected');
  
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx
  
  // Send initial connection success
  res.write(': connected\n\n');
  
  // Register client with AutoFixEngine
  if (autoFixEngine) {
    autoFixEngine.registerSSEClient(res);
    
    // Send current status immediately
    const currentStatus = autoFixEngine.getStatus();
    res.write(`data: ${JSON.stringify(currentStatus)}\n\n`);
  } else {
    // Engine not ready yet
    res.write(`data: ${JSON.stringify({
      phase: 'idle',
      progress: 0,
      message: 'Auto-fix engine initializing...'
    })}\n\n`);
  }
  
  // Handle client disconnect
  req.on('close', () => {
    console.log('[AutoFix SSE] Client disconnected');
    if (autoFixEngine) {
      autoFixEngine.unregisterSSEClient(res);
    }
  });
});

/**
 * POST /api/mrblue/auto-fix/trigger
 * Manually trigger auto-fix for a specific error (for testing/god-level users)
 */
router.post("/auto-fix/trigger", async (req: Request, res: Response) => {
  try {
    const { errorId } = req.body;
    
    if (!errorId) {
      return res.status(400).json({
        error: "errorId is required",
      });
    }
    
    if (!autoFixEngine) {
      return res.status(503).json({
        error: "AutoFixEngine not initialized",
      });
    }
    
    console.log(`[AutoFix API] Manual trigger for error ${errorId}`);
    
    // Trigger auto-fix (non-blocking)
    setImmediate(async () => {
      try {
        await autoFixEngine.processError(parseInt(errorId));
      } catch (error: any) {
        console.error(`[AutoFix API] Error processing ${errorId}:`, error);
      }
    });
    
    return res.status(202).json({
      success: true,
      message: `Auto-fix queued for error ${errorId}`,
    });
  } catch (error: any) {
    console.error('[AutoFix API] Error triggering auto-fix:', error);
    return res.status(500).json({
      error: "Failed to trigger auto-fix",
      message: error.message,
    });
  }
});

export default router;
