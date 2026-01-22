/**
 * MR. BLUE TASK EXECUTOR ROUTES
 * MB.MD Pattern 67 - Enables Mr. Blue to execute playbooks via API
 * 
 * Routes:
 * - GET /api/mrblue/executor/tasks - List active tasks
 * - GET /api/mrblue/executor/tasks/:id - Get task details with phases
 * - POST /api/mrblue/executor/preview - Preview what will be executed
 * - POST /api/mrblue/executor/execute - Execute a playbook phase (god-level only)
 */

import { Router, Request, Response } from "express";
import { taskExecutorService, isGodLevelUser } from "../services/mrBlue/TaskExecutorService";
import { authenticateToken, type AuthRequest } from "../middleware/auth";

const router = Router();

// Use the centralized god-level check from TaskExecutorService
function isGodLevel(user: any): boolean {
  if (!user) return false;
  // Check both email and tier for god-level access
  return isGodLevelUser(user.email) || isGodLevelUser(user.tier);
}

/**
 * GET /tasks - List all active tasks from memory
 */
router.get("/tasks", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await taskExecutorService.getActiveTasks();
    
    res.json({
      success: true,
      tasks,
      count: tasks.length,
    });
  } catch (error: any) {
    console.error("[MrBlue Executor] Error listing tasks:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /tasks/:id - Get detailed task info with playbook phases
 */
router.get("/tasks/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await taskExecutorService.getTaskStatus(id);
    
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    // Load playbook phases for additional context
    const phases = await taskExecutorService.loadPlaybook(task.playbook);
    
    res.json({
      success: true,
      task,
      playbookPhases: phases.map(p => ({
        phase: p.phase,
        name: p.name,
        codeBlockCount: p.codeBlocks.length,
        status: task.phases.find(tp => tp.phase === p.phase)?.status || 'pending',
      })),
    });
  } catch (error: any) {
    console.error("[MrBlue Executor] Error getting task:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /preview - Preview execution without running
 */
router.post("/preview", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, phase } = req.body;
    
    if (!taskId || phase === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: "taskId and phase are required" 
      });
    }

    const preview = await taskExecutorService.previewPhase(taskId, phase);
    
    if (!preview.task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    if (!preview.phase) {
      return res.status(404).json({ success: false, error: "Phase not found in playbook" });
    }

    res.json({
      success: true,
      task: {
        id: preview.task.id,
        title: preview.task.title,
      },
      phase: {
        number: preview.phase.phase,
        name: preview.phase.name,
        codeBlockCount: preview.phase.codeBlocks.length,
        codeBlocks: preview.phase.codeBlocks.map(cb => ({
          language: cb.language,
          targetFile: cb.targetFile,
          lineCount: cb.code.split('\n').length,
        })),
      },
      executionPrompt: preview.prompt.substring(0, 2000) + (preview.prompt.length > 2000 ? '...' : ''),
    });
  } catch (error: any) {
    console.error("[MrBlue Executor] Error previewing:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /execute - Execute a playbook phase (GOD-LEVEL ONLY)
 */
router.post("/execute", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    // Verify authentication
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication required" 
      });
    }

    // Verify god-level access
    if (!isGodLevel(user)) {
      return res.status(403).json({
        success: false,
        error: "God-level access required for code execution",
        message: "Tier 8 or authorized admin email required to execute code via Mr. Blue",
      });
    }

    const { taskId, phase } = req.body;
    
    if (!taskId || phase === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: "taskId and phase are required" 
      });
    }

    console.log(`[MrBlue Executor] 🚀 God-level execution authorized by ${user.email} (tier: ${user.tier})`);
    console.log(`[MrBlue Executor] Executing Task: ${taskId}, Phase: ${phase}`);

    // Pass tier for god-level check (fallback to email)
    const result = await taskExecutorService.executePhase(taskId, phase, user.tier || user.email);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: `Phase ${phase} executed successfully`,
      result,
      executedBy: user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[MrBlue Executor] Execution error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /status - Get executor service status
 */
router.get("/status", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const tasks = await taskExecutorService.getActiveTasks();
    
    const pendingPhases = tasks.reduce((count, task) => {
      return count + task.phases.filter(p => p.status === 'pending').length;
    }, 0);

    res.json({
      success: true,
      status: "operational",
      version: "1.0.0",
      activeTasks: tasks.length,
      pendingPhases,
      isGodLevel: user ? isGodLevel(user) : false,
      capabilities: {
        preview: true,
        execute: user ? isGodLevel(user) : false,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
