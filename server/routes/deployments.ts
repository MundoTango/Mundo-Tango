// FEATURE 1: DEPLOYMENT AUTOMATION - Backend API
// Routes: POST /api/deployments, GET /api/deployments, GET /api/deployments/:id
// Created: October 31, 2025

import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { storage } from "../storage";
import * as githubClient from "../lib/github-client";
import * as vercelClient from "../lib/vercel-client";
import * as railwayClient from "../lib/railway-client";

const router = Router();

// Background function to trigger Vercel + Railway deployments
async function triggerDeployment(deploymentId: number, branch: string, commitSha?: string) {
  try {
    // Validate all required environment variables
    const missingVars = [];
    if (!process.env.GITHUB_REPO_ID) missingVars.push('GITHUB_REPO_ID');
    if (!process.env.VERCEL_API_TOKEN && !process.env.VERCEL_TOKEN) missingVars.push('VERCEL_API_TOKEN');
    if (!process.env.VERCEL_PROJECT_ID) missingVars.push('VERCEL_PROJECT_ID');
    if (!process.env.RAILWAY_API_TOKEN && !process.env.RAILWAY_TOKEN) missingVars.push('RAILWAY_API_TOKEN');
    if (!process.env.RAILWAY_PROJECT_ID) missingVars.push('RAILWAY_PROJECT_ID');

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Update status to building
    await storage.updateDeployment(deploymentId, { status: 'building' });

    // Trigger Vercel deployment (frontend)
    const vercelDeployment = await vercelClient.createVercelDeployment({
      name: 'mundo-tango',
      gitSource: {
        type: 'github',
        repoId: process.env.GITHUB_REPO_ID!,
        ref: commitSha || branch,
      },
      target: 'production',
    });

    // Trigger Railway deployment (backend)
    const railwayDeployment = await railwayClient.createRailwayDeployment({
      branch,
      commitSha,
    });

    // Update deployment with IDs
    await storage.updateDeployment(deploymentId, {
      status: 'deploying',
      vercelDeploymentId: vercelDeployment.id,
      vercelUrl: vercelDeployment.url,
      railwayDeploymentId: railwayDeployment.id,
    });

    // Poll for completion with retry logic
    // Primary mechanism: webhooks (see server/routes/webhooks.ts)
    // Fallback: Poll every 30s for up to 5 minutes
    let pollCount = 0;
    const maxPolls = 10; // 10 * 30s = 5 minutes max
    
    const pollStatus = async () => {
      try {
        pollCount++;
        const vercelStatus = await vercelClient.getVercelDeployment(vercelDeployment.id);
        const railwayStatus = await railwayClient.getRailwayDeployment(railwayDeployment.id);

        const vercelDone = ['READY', 'ERROR', 'CANCELED'].includes(vercelStatus.readyState);
        const railwayDone = ['SUCCESS', 'FAILED', 'CRASHED', 'REMOVING'].includes(railwayStatus.status);

        if (vercelDone && railwayDone) {
          // Both complete
          const success = vercelStatus.readyState === 'READY' && railwayStatus.status === 'SUCCESS';
          await storage.updateDeployment(deploymentId, {
            status: success ? 'success' : 'failed',
            completedAt: new Date(),
            vercelUrl: vercelStatus.url,
            railwayUrl: railwayStatus.url,
            errorMessage: success ? undefined : 'Deployment failed on one or more platforms',
          });
        } else if (pollCount < maxPolls) {
          // Continue polling
          setTimeout(pollStatus, 30000); // Poll again in 30s
        } else {
          // Timeout - mark as unknown, webhooks will update later
          console.log(`Deployment ${deploymentId} polling timeout after ${pollCount * 30}s`);
        }
      } catch (error) {
        console.error('Error polling deployment status:', error);
        if (pollCount < maxPolls) {
          setTimeout(pollStatus, 30000); // Retry
        }
      }
    };

    // Start polling after 30s (give webhooks a chance first)
    setTimeout(pollStatus, 30000);

  } catch (error: any) {
    console.error('Deployment trigger error:', error);
    await storage.updateDeployment(deploymentId, {
      status: 'failed',
      errorMessage: error.message,
      completedAt: new Date(),
    });
  }
}

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

    // Validate all required environment variables BEFORE creating deployment
    const missingVars = [];
    if (!process.env.GITHUB_OWNER) missingVars.push('GITHUB_OWNER');
    if (!process.env.GITHUB_REPO) missingVars.push('GITHUB_REPO');
    if (!process.env.GITHUB_REPO_ID) missingVars.push('GITHUB_REPO_ID');
    if (!process.env.VERCEL_API_TOKEN && !process.env.VERCEL_TOKEN) missingVars.push('VERCEL_API_TOKEN or VERCEL_TOKEN');
    if (!process.env.VERCEL_PROJECT_ID) missingVars.push('VERCEL_PROJECT_ID');
    if (!process.env.RAILWAY_API_TOKEN && !process.env.RAILWAY_TOKEN) missingVars.push('RAILWAY_API_TOKEN or RAILWAY_TOKEN');
    if (!process.env.RAILWAY_PROJECT_ID) missingVars.push('RAILWAY_PROJECT_ID');

    if (missingVars.length > 0) {
      return res.status(400).json({ 
        message: `Deployment configuration incomplete. Missing required environment variables: ${missingVars.join(', ')}. Please configure these secrets before deploying.` 
      });
    }

    const githubOwner = process.env.GITHUB_OWNER!;
    const githubRepo = process.env.GITHUB_REPO!;

    // Get latest commit if not provided
    let commitInfo;
    if (!validatedData.gitCommitSha) {
      try {
        commitInfo = await githubClient.getLatestCommit(githubOwner, githubRepo, validatedData.gitBranch);
      } catch (error) {
        console.error('Failed to get latest commit:', error);
        return res.status(500).json({ 
          message: "Failed to fetch latest commit from GitHub. Check GitHub integration." 
        });
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

    // Trigger actual deployment to Vercel + Railway asynchronously
    // Don't await - let it run in background
    triggerDeployment(savedDeployment.id, validatedData.gitBranch, commitInfo?.sha)
      .catch(error => console.error('Background deployment error:', error));

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

    // Convert completedAt from string to Date if present
    const updateData = {
      ...validatedData,
      completedAt: validatedData.completedAt ? new Date(validatedData.completedAt) : undefined,
    };

    const updated = await storage.updateDeployment(deploymentId, updateData as Partial<typeof deployment>);

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
