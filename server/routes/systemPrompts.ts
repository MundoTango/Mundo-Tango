/**
 * SYSTEM PROMPTS API (TRACK 9)
 * 
 * Manages system prompts for Mr. Blue and other agents.
 * Supports versioning, A/B testing, and performance tracking.
 */

import { Router, type Response } from "express";
import { authenticateToken, type AuthRequest, requireRoleLevel } from "../middleware/auth";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { db } from "../../shared/db";
import { mrBlueSystemPrompts } from "../../shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createPromptSchema = z.object({
  agentId: z.string().min(1),
  promptText: z.string().min(10),
  version: z.string().default("1.0.0"),
  isActive: z.boolean().default(false),
  context: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updatePerformanceSchema = z.object({
  performanceScore: z.number().min(0).max(1),
  usageCount: z.number().min(0).optional(),
  successRate: z.number().min(0).max(1).optional(),
  averageResponseTime: z.number().min(0).optional(),
});

// ============================================================================
// ENDPOINTS
// ============================================================================

/**
 * POST /api/prompts/create
 * Create new system prompt version
 */
router.post("/create", authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res: Response) => {
  try {
    const data = createPromptSchema.parse(req.body);
    
    // If setting as active, deactivate other prompts for this agent
    if (data.isActive) {
      await db.update(mrBlueSystemPrompts)
        .set({ isActive: false })
        .where(eq(mrBlueSystemPrompts.agentId, data.agentId));
    }
    
    const [prompt] = await db.insert(mrBlueSystemPrompts)
      .values({
        agentId: data.agentId,
        promptText: data.promptText,
        version: data.version,
        isActive: data.isActive,
        context: data.context,
        tags: data.tags || [],
        metadata: data.metadata || {},
        createdBy: req.user?.username || 'system',
      })
      .returning();
    
    res.status(201).json({
      success: true,
      prompt,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.toString() });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/prompts/agent/:agentId
 * Get all prompts for an agent
 */
router.get("/agent/:agentId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    const includeInactive = req.query.includeInactive === 'true';
    
    let query = db.select()
      .from(mrBlueSystemPrompts)
      .where(eq(mrBlueSystemPrompts.agentId, agentId))
      .orderBy(desc(mrBlueSystemPrompts.createdAt));
    
    // Filter by active status unless includeInactive is true
    if (!includeInactive) {
      query = db.select()
        .from(mrBlueSystemPrompts)
        .where(and(
          eq(mrBlueSystemPrompts.agentId, agentId),
          eq(mrBlueSystemPrompts.isActive, true)
        ))
        .orderBy(desc(mrBlueSystemPrompts.createdAt));
    }
    
    const prompts = await query;
    
    res.json({
      agentId,
      prompts,
      totalPrompts: prompts.length,
      activePrompts: prompts.filter(p => p.isActive).length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/prompts/:id/activate
 * Activate a prompt version (deactivates others for same agent)
 */
router.put("/:id/activate", authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get the prompt to find its agentId
    const [prompt] = await db.select()
      .from(mrBlueSystemPrompts)
      .where(eq(mrBlueSystemPrompts.id, id))
      .limit(1);
    
    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }
    
    // Deactivate all other prompts for this agent
    await db.update(mrBlueSystemPrompts)
      .set({ isActive: false })
      .where(eq(mrBlueSystemPrompts.agentId, prompt.agentId));
    
    // Activate this prompt
    const [updated] = await db.update(mrBlueSystemPrompts)
      .set({ 
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(mrBlueSystemPrompts.id, id))
      .returning();
    
    res.json({
      success: true,
      message: `Prompt ${id} activated for agent ${prompt.agentId}`,
      prompt: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/prompts/:id/deactivate
 * Deactivate a prompt version
 */
router.put("/:id/deactivate", authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const [updated] = await db.update(mrBlueSystemPrompts)
      .set({ 
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(mrBlueSystemPrompts.id, id))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: "Prompt not found" });
    }
    
    res.json({
      success: true,
      message: `Prompt ${id} deactivated`,
      prompt: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/prompts/:id/performance
 * Get performance metrics for a prompt
 */
router.get("/:id/performance", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const [prompt] = await db.select()
      .from(mrBlueSystemPrompts)
      .where(eq(mrBlueSystemPrompts.id, id))
      .limit(1);
    
    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }
    
    // Calculate performance metrics from metadata
    const metadata = prompt.metadata as any || {};
    const usageCount = metadata.usageCount || 0;
    const successCount = metadata.successCount || 0;
    const totalResponseTime = metadata.totalResponseTime || 0;
    
    const performanceMetrics = {
      promptId: id,
      version: prompt.version,
      performanceScore: prompt.performanceScore || 0,
      usageCount,
      successRate: usageCount > 0 ? (successCount / usageCount) : 0,
      averageResponseTime: usageCount > 0 ? (totalResponseTime / usageCount) : 0,
      isActive: prompt.isActive,
      createdAt: prompt.createdAt,
      lastUsed: metadata.lastUsed || null,
    };
    
    res.json({
      success: true,
      performance: performanceMetrics,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/prompts/:id/score
 * Update performance score for a prompt
 */
router.post("/:id/score", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = updatePerformanceSchema.parse(req.body);
    
    // Get existing prompt
    const [existing] = await db.select()
      .from(mrBlueSystemPrompts)
      .where(eq(mrBlueSystemPrompts.id, id))
      .limit(1);
    
    if (!existing) {
      return res.status(404).json({ error: "Prompt not found" });
    }
    
    // Update metadata with performance data
    const metadata = existing.metadata as any || {};
    const updatedMetadata = {
      ...metadata,
      usageCount: data.usageCount || metadata.usageCount || 0,
      successRate: data.successRate || metadata.successRate || 0,
      totalResponseTime: data.averageResponseTime 
        ? (data.averageResponseTime * (data.usageCount || metadata.usageCount || 1))
        : metadata.totalResponseTime || 0,
      lastUpdated: new Date().toISOString(),
    };
    
    // Update prompt with new performance score
    const [updated] = await db.update(mrBlueSystemPrompts)
      .set({
        performanceScore: data.performanceScore,
        metadata: updatedMetadata,
        updatedAt: new Date(),
      })
      .where(eq(mrBlueSystemPrompts.id, id))
      .returning();
    
    res.json({
      success: true,
      message: "Performance score updated",
      prompt: updated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.toString() });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/prompts/stats
 * Get overall system prompt statistics
 */
router.get("/stats", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const stats = await db.select({
      totalPrompts: sql<number>`count(*)`,
      activePrompts: sql<number>`count(*) filter (where ${mrBlueSystemPrompts.isActive} = true)`,
      avgPerformance: sql<number>`avg(${mrBlueSystemPrompts.performanceScore})`,
      uniqueAgents: sql<number>`count(distinct ${mrBlueSystemPrompts.agentId})`,
    })
    .from(mrBlueSystemPrompts);
    
    // Get top performing prompts
    const topPrompts = await db.select()
      .from(mrBlueSystemPrompts)
      .where(eq(mrBlueSystemPrompts.isActive, true))
      .orderBy(desc(mrBlueSystemPrompts.performanceScore))
      .limit(10);
    
    res.json({
      success: true,
      statistics: stats[0],
      topPerformingPrompts: topPrompts,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
