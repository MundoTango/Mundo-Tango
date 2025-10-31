// Webhook Handlers - Receive deployment status updates from Vercel + Railway
// Tier 1: Deployment Automation
// Created: October 31, 2025

import { Router, Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

// Vercel Webhook Handler
// Receives deployment status updates from Vercel
router.post("/vercel", async (req: Request, res: Response) => {
  try {
    const { type, payload } = req.body;

    // Verify webhook signature (if configured)
    const signature = req.headers['x-vercel-signature'] as string;
    // TODO: Verify signature using VERCEL_WEBHOOK_SECRET
    
    if (type === 'deployment.created' || type === 'deployment.succeeded' || type === 'deployment.failed' || type === 'deployment.canceled') {
      const { id, url, state, meta } = payload;
      
      // Find our deployment record by Vercel deployment ID
      // Note: This requires adding a method to find deployment by vercelDeploymentId
      // For now, using a simple approach - find by commit SHA
      const commitSha = meta?.gitCommitSha;
      if (!commitSha) {
        console.log('Vercel webhook: No commit SHA in payload');
        return res.status(200).json({ received: true });
      }

      // Update deployment status
      let status: string;
      switch (state) {
        case 'READY':
          status = 'success';
          break;
        case 'ERROR':
          status = 'failed';
          break;
        case 'BUILDING':
          status = 'building';
          break;
        case 'QUEUED':
          status = 'pending';
          break;
        case 'CANCELED':
          status = 'cancelled';
          break;
        default:
          status = 'deploying';
      }

      // Log the webhook for debugging
      console.log(`Vercel webhook: ${type}, state: ${state}, commit: ${commitSha}, id: ${id}`);
      
      // Find deployment by Vercel deployment ID using indexed query
      const deployment = await storage.getDeploymentByVercelId(id);
      
      if (deployment) {
        await storage.updateDeployment(deployment.id, {
          status,
          vercelUrl: url,
          vercelDeploymentId: id,
          completedAt: status === 'success' || status === 'failed' ? new Date() : undefined,
        });
        console.log(`Updated deployment ${deployment.id} to status: ${status}`);
      } else {
        console.log(`No deployment found for Vercel ID: ${id}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Vercel webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Railway Webhook Handler
// Receives deployment status updates from Railway
router.post("/railway", async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    // Verify webhook signature (if configured)
    const signature = req.headers['x-railway-signature'] as string;
    // TODO: Verify signature using RAILWAY_WEBHOOK_SECRET

    if (type === 'DEPLOYMENT_STATUS_CHANGED') {
      const { id, status: railwayStatus, projectId, environmentId } = data;

      // Map Railway status to our status
      let status: string;
      switch (railwayStatus) {
        case 'SUCCESS':
          status = 'success';
          break;
        case 'FAILED':
        case 'CRASHED':
          status = 'failed';
          break;
        case 'BUILDING':
          status = 'building';
          break;
        case 'DEPLOYING':
          status = 'deploying';
          break;
        case 'REMOVING':
          status = 'cancelled';
          break;
        default:
          status = 'pending';
      }

      console.log(`Railway webhook: ${type}, status: ${railwayStatus}, deployment: ${id}`);

      // Find deployment by Railway deployment ID using indexed query
      const deployment = await storage.getDeploymentByRailwayId(id);
      
      if (deployment) {
        await storage.updateDeployment(deployment.id, {
          status,
          railwayDeploymentId: id,
          completedAt: status === 'success' || status === 'failed' ? new Date() : undefined,
        });
        console.log(`Updated deployment ${deployment.id} to status: ${status}`);
      } else {
        console.log(`No deployment found for Railway ID: ${id}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Railway webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Webhook handlers are running' });
});

export default router;
