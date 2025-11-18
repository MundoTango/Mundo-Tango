/**
 * Mr. Blue Error Actions Routes - PHASE 4
 * Apply fixes and escalate errors to ESA
 * 
 * Endpoints:
 * - POST /api/mrblue/apply-fix - Apply AI-suggested fix to codebase
 * - POST /api/mrblue/escalate-error - Escalate error to Intelligence Division Chief
 */

import { Router, type Request, Response } from "express";
import { db } from "../db";
import { errorPatterns, agentEscalations } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { VibeCodingService } from "../services/mrBlue/VibeCodingService";
import { broadcastToUser } from "../services/websocket";

const router = Router();

// Initialize Vibe Coding Service
const vibeCodingService = new VibeCodingService();
let serviceInitialized = false;

// Initialize service on first use
async function ensureServiceInitialized() {
  if (!serviceInitialized) {
    await vibeCodingService.initialize();
    serviceInitialized = true;
  }
}

// Request validation schemas
const applyFixSchema = z.object({
  errorPatternId: z.number().int().positive(),
});

const escalateErrorSchema = z.object({
  errorPatternId: z.number().int().positive(),
  reason: z.string().optional(),
});

/**
 * POST /api/mrblue/apply-fix
 * Apply AI-suggested fix to the codebase
 */
router.post("/apply-fix", async (req: Request, res: Response) => {
  try {
    console.log('[Error Actions] Apply fix request:', req.body);

    // Validate request
    const validationResult = applyFixSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request format",
        details: validationResult.error.errors,
      });
    }

    const { errorPatternId } = validationResult.data;
    const userId = (req as any).user?.id;

    // Get error pattern from database
    const [pattern] = await db
      .select()
      .from(errorPatterns)
      .where(eq(errorPatterns.id, errorPatternId))
      .limit(1);

    if (!pattern) {
      return res.status(404).json({
        success: false,
        error: "Error pattern not found",
      });
    }

    // Check if fix is available
    if (!pattern.suggestedFix) {
      return res.status(400).json({
        success: false,
        error: "No suggested fix available for this error",
      });
    }

    // Check if already fixed
    if (pattern.status === 'manually_fixed' || pattern.status === 'auto_fixed') {
      return res.status(400).json({
        success: false,
        error: "Error has already been fixed",
      });
    }

    console.log(`[Error Actions] Applying fix for error pattern ${errorPatternId}...`);

    // Initialize service if needed
    await ensureServiceInitialized();

    // Generate code changes using Vibe Coding Service
    const sessionId = `error-fix-${errorPatternId}-${Date.now()}`;
    const codeResult = await vibeCodingService.generateCode({
      naturalLanguage: `Apply this fix for error: ${pattern.errorMessage}\n\nSuggested Fix:\n${pattern.suggestedFix}`,
      context: pattern.aiAnalysis ? [JSON.stringify(pattern.aiAnalysis)] : [],
      targetFiles: pattern.aiAnalysis?.files || [],
      userId: userId || 0,
      sessionId,
    });

    if (!codeResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate code changes",
        message: codeResult.error,
      });
    }

    // Apply the generated changes
    const applyResult = await vibeCodingService.applyChanges(sessionId, userId || 0);

    if (!applyResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to apply code changes",
        message: applyResult.error,
      });
    }

    // Update error pattern status in database
    await db
      .update(errorPatterns)
      .set({
        status: 'manually_fixed',
        updatedAt: new Date(),
      })
      .where(eq(errorPatterns.id, errorPatternId));

    console.log(`[Error Actions] ✅ Fix applied successfully for error ${errorPatternId}`);
    console.log(`[Error Actions] Files modified:`, applyResult.filesModified);
    console.log(`[Error Actions] Git commit:`, applyResult.gitCommitId);

    // Broadcast to user via WebSocket
    if (userId) {
      broadcastToUser(userId, 'error_fix_applied', {
        errorPatternId,
        filesModified: applyResult.filesModified,
        gitCommitId: applyResult.gitCommitId,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      filesModified: applyResult.filesModified || [],
      gitCommitId: applyResult.gitCommitId,
    });
  } catch (error: any) {
    console.error('[Error Actions] Error applying fix:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

/**
 * POST /api/mrblue/escalate-error
 * Escalate error to Intelligence Division Chief (Agent #4)
 */
router.post("/escalate-error", async (req: Request, res: Response) => {
  try {
    console.log('[Error Actions] Escalate error request:', req.body);

    // Validate request
    const validationResult = escalateErrorSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request format",
        details: validationResult.error.errors,
      });
    }

    const { errorPatternId, reason } = validationResult.data;
    const userId = (req as any).user?.id;

    // Get error pattern from database
    const [pattern] = await db
      .select()
      .from(errorPatterns)
      .where(eq(errorPatterns.id, errorPatternId))
      .limit(1);

    if (!pattern) {
      return res.status(404).json({
        success: false,
        error: "Error pattern not found",
      });
    }

    // Check if already escalated
    if (pattern.status === 'escalated') {
      return res.status(400).json({
        success: false,
        error: "Error has already been escalated",
      });
    }

    console.log(`[Error Actions] Escalating error pattern ${errorPatternId} to Intelligence Division Chief...`);

    // Create ESA escalation task
    const escalationContext = {
      errorPattern: {
        id: pattern.id,
        errorType: pattern.errorType,
        errorMessage: pattern.errorMessage,
        frequency: pattern.frequency,
        lastSeen: pattern.lastSeen,
        fixConfidence: pattern.fixConfidence,
      },
      aiAnalysis: pattern.aiAnalysis,
      suggestedFix: pattern.suggestedFix,
      userReason: reason,
    };

    const [escalation] = await db
      .insert(agentEscalations)
      .values({
        agentId: 'error-analysis-agent',
        issue: `Error Pattern #${errorPatternId}: ${pattern.errorMessage}`,
        severity: pattern.frequency > 10 ? 'high' : pattern.frequency > 5 ? 'medium' : 'low',
        context: escalationContext,
        attemptedFixes: pattern.suggestedFix ? [pattern.suggestedFix] : [],
        escalationLevel: 'chief', // Intelligence Division Chief (Agent #4)
        escalatedTo: 'agent-4-intelligence-chief',
        escalationPath: ['error-analysis-agent', 'agent-4-intelligence-chief'],
        status: 'pending',
      })
      .returning();

    // Update error pattern status
    await db
      .update(errorPatterns)
      .set({
        status: 'escalated',
        updatedAt: new Date(),
      })
      .where(eq(errorPatterns.id, errorPatternId));

    console.log(`[Error Actions] ✅ Error escalated successfully. Escalation ID: ${escalation.id}`);

    // Broadcast to user via WebSocket
    if (userId) {
      broadcastToUser(userId, 'error_escalated', {
        errorPatternId,
        escalationId: escalation.id,
        escalatedTo: 'Intelligence Division Chief (Agent #4)',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      taskId: escalation.id,
    });
  } catch (error: any) {
    console.error('[Error Actions] Error escalating:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
});

export default router;
