/**
 * TaskQueue API Routes - MB.MD GOD COMMAND #4
 * Provides REST API and WebHook endpoints for background task management
 */

import { Router } from "express";
import {
  taskQueue,
  executeCommand,
  handleWebhook,
} from "../services/TaskQueueService";
import { authenticateToken } from "../middleware/auth";

const router = Router();

/**
 * POST /api/taskqueue/enqueue
 * Enqueue a new VibeCoding task
 */
router.post("/enqueue", authenticateToken, async (req, res) => {
  try {
    const {
      command,
      type = "vibe_code",
      priority = "normal",
      params = {},
    } = req.body;

    if (!command) {
      return res.status(400).json({ error: "Command is required" });
    }

    const taskId = await taskQueue.enqueue({
      type,
      priority,
      command,
      params,
    });

    res.json({ success: true, taskId });
  } catch (error: any) {
    console.error("[TaskQueue API] Enqueue error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/taskqueue/status/:taskId
 * Get task status by ID
 */
router.get("/status/:taskId", authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = taskQueue.getTaskStatus(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ success: true, task });
  } catch (error: any) {
    console.error("[TaskQueue API] Status error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/taskqueue/list
 * Get all tasks in queue
 */
router.get("/list", authenticateToken, async (req, res) => {
  try {
    const tasks = taskQueue.getAllTasks();
    res.json({ success: true, tasks, count: tasks.length });
  } catch (error: any) {
    console.error("[TaskQueue API] List error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/taskqueue/webhook
 * Webhook endpoint for external triggers
 */
router.post("/webhook", async (req, res) => {
  try {
    // TODO: Add webhook signature verification for security
    const result = await handleWebhook(req.body);
    res.json(result);
  } catch (error: any) {
    console.error("[TaskQueue API] Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/taskqueue/clear
 * Clear completed tasks
 */
router.post("/clear", authenticateToken, async (req, res) => {
  try {
    taskQueue.clearCompleted();
    res.json({ success: true, message: "Cleared completed tasks" });
  } catch (error: any) {
    console.error("[TaskQueue API] Clear error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/taskqueue/execute
 * Quick execute command (enqueue + returns immediately)
 */
router.post("/execute", authenticateToken, async (req, res) => {
  try {
    const { command, priority = "normal" } = req.body;

    if (!command) {
      return res.status(400).json({ error: "Command is required" });
    }

    const taskId = await executeCommand(command, priority);
    res.json({
      success: true,
      taskId,
      message: "Command queued for execution",
    });
  } catch (error: any) {
    console.error("[TaskQueue API] Execute error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
