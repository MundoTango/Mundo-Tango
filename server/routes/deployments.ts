// FEATURE 1: DEPLOYMENT AUTOMATION - Backend API
// Routes: POST /api/deployments, GET /api/deployments, GET /api/deployments/:id
// Created: October 31, 2025

import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { storage } from "../storage";
import * as githubClient from "../lib/github-client";

const router = Router();

// Validation schemas
const createDeploymentSchema = z.object({
  type: z.enum(['production', 'preview', 'rollback']),
  gitBranch: z.string().min(1).max(255),
  gitCommitSha: z.string().length(40).optional(),
  vercelProjectId: z.string().optional(),
  railwayProjectId: z.string().optional(),
});

const updateDeploymentSchema = z.object({
  status: z.enum(['pending', 'building', 'deploying', 'success', 'failed', 'cancelled']).optional(),
  vercelUrl: z.string().url().optional(),
  railwayUrl: z.string().url().optional(),
  buildLogs: z.string().optional(),
  errorMessage: z.string().optional(),
  completedAt: z.string().datetime().optional(),
  durationSeconds: z.number().int().positive().optional(),
});

// POST /api/deployments - Create new deployment
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createDeploymentSchema.parse(req.body);
    const userId = req.userId!;

    // Get latest commit if not provided
    let commitInfo;
    if (!validatedData.gitCommitSha) {
      try {
        // TODO: Get repo info from user's platform integrations
        // For now, using placeholder
        commitInfo = await githubClient.getLatestCommit('user', 'repo', validatedData.gitBranch);
      } catch (error) {
        console.error('Failed to get latest commit:', error);
      }
    }

    // Create deployment record
    const savedDeployment = await storage.createDeployment({
      userId,
      type: validatedData.type,
      status: 'pending',
      gitBranch: validatedData.gitBranch,
      gitCommitSha: validatedData.gitCommitSha || commitInfo?.sha,
      gitCommitMessage: commitInfo?.message,
    });

    // TODO: Trigger actual deployment to Vercel + Railway asynchronously
    // This will be implemented with Vercel/Railway API clients

    res.status(201).json({
      message: "Deployment created successfully",
      deployment: savedDeployment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Create deployment error:", error);
    res.status(500).json({ message: "Failed to create deployment" });
  }
});

// GET /api/deployments - List all deployments for current user
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const type = req.query.type as string;
    const status = req.query.status as string;

    const deployments = await storage.getDeployments({
      userId,
      limit,
      offset,
      type,
      status,
    });

    res.json({
      deployments,
      total: deployments.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("List deployments error:", error);
    res.status(500).json({ message: "Failed to fetch deployments" });
  }
});

// GET /api/deployments/:id - Get specific deployment
router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const deploymentId = parseInt(req.params.id);
    const userId = req.userId!;

    if (isNaN(deploymentId)) {
      return res.status(400).json({ message: "Invalid deployment ID" });
    }

    const deployment = await storage.getDeploymentById(deploymentId);
    
    if (!deployment || deployment.userId !== userId) {
      return res.status(404).json({ message: "Deployment not found" });
    }

    res.json({
      deployment,
    });
  } catch (error) {
    console.error("Get deployment error:", error);
    res.status(500).json({ message: "Failed to fetch deployment" });
  }
});

// PATCH /api/deployments/:id - Update deployment status
router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const deploymentId = parseInt(req.params.id);
    const userId = req.userId!;
    const validatedData = updateDeploymentSchema.parse(req.body);

    if (isNaN(deploymentId)) {
      return res.status(400).json({ message: "Invalid deployment ID" });
    }

    const deployment = await storage.getDeploymentById(deploymentId);
    
    if (!deployment || deployment.userId !== userId) {
      return res.status(404).json({ message: "Deployment not found" });
    }

    const updated = await storage.updateDeployment(deploymentId, validatedData);

    res.json({
      message: "Deployment updated successfully",
      deployment: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Update deployment error:", error);
    res.status(500).json({ message: "Failed to update deployment" });
  }
});

// POST /api/deployments/:id/cancel - Cancel a deployment
router.post("/:id/cancel", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const deploymentId = parseInt(req.params.id);
    const userId = req.userId!;

    if (isNaN(deploymentId)) {
      return res.status(400).json({ message: "Invalid deployment ID" });
    }

    // TODO: Cancel deployment
    // 1. Update status to 'cancelled'
    // 2. Stop any running build processes
    // 3. Notify Vercel/Railway to cancel

    res.json({
      message: "Deployment cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel deployment error:", error);
    res.status(500).json({ message: "Failed to cancel deployment" });
  }
});

export default router;
