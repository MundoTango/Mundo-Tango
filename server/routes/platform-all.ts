import { Router, Response } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// TIER 2.1: Custom Domains
router.post("/domains", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { domain, subdomain, verificationMethod } = req.body;
    
    const verificationToken = Math.random().toString(36).substring(2, 15);
    
    const newDomain = await storage.createCustomDomain({
      userId,
      domain,
      subdomain: subdomain || null,
      verificationToken,
      verificationMethod: verificationMethod || 'TXT',
      isActive: true,
      isVerified: false,
      sslStatus: 'pending',
    });
    
    res.json({ domain: newDomain });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/domains", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const domains = await storage.getCustomDomains(userId);
    res.json({ domains });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/domains/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.userId!;
    const updates = req.body;
    const domain = await storage.updateCustomDomain(id, userId, updates);
    if (!domain) {
      return res.status(404).json({ message: "Domain not found or unauthorized" });
    }
    res.json({ domain });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/domains/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.userId!;
    const deleted = await storage.deleteCustomDomain(id, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Domain not found or unauthorized" });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// TIER 2.2: Analytics Events
router.post("/analytics/events", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { eventType, eventName, metadata } = req.body;
    
    const event = await storage.createAnalyticsEvent({
      userId,
      eventType,
      eventName,
      metadata: metadata || {},
      timestamp: new Date(),
    });
    
    res.json({ event });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/analytics/events", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { eventType, limit } = req.query;
    
    const events = await storage.getAnalyticsEvents({
      userId,
      eventType: eventType as string | undefined,
      limit: limit ? parseInt(limit as string) : 100,
    });
    
    res.json({ events });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/analytics/summary", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    
    const summary = await storage.getAnalyticsSummary(userId, days);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// TIER 2.3: Team Members
router.post("/team", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.userId!;
    const { memberId, role, permissions } = req.body;
    
    const member = await storage.createTeamMember({
      ownerId,
      memberId,
      role,
      permissions,
      status: 'pending',
      invitedBy: ownerId,
    });
    
    res.json({ member });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/team", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.userId!;
    const members = await storage.getTeamMembers(ownerId);
    res.json({ members });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/team/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const ownerId = req.userId!;
    const updates = req.body;
    const member = await storage.updateTeamMember(id, ownerId, updates);
    if (!member) {
      return res.status(404).json({ message: "Team member not found or unauthorized" });
    }
    res.json({ member });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/team/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const ownerId = req.userId!;
    const deleted = await storage.deleteTeamMember(id, ownerId);
    if (!deleted) {
      return res.status(404).json({ message: "Team member not found or unauthorized" });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// TIER 3.1: Cost Tracking
router.post("/costs", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { platform, service, amount, currency, billingPeriodStart, billingPeriodEnd, usageMetrics } = req.body;
    
    const cost = await storage.createCostRecord({
      userId,
      platform,
      service,
      amount,
      currency: currency || 'USD',
      billingPeriodStart: new Date(billingPeriodStart),
      billingPeriodEnd: new Date(billingPeriodEnd),
      usageMetrics: usageMetrics || {},
    });
    
    res.json({ cost });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/costs", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { platform, startDate, endDate } = req.query;
    
    const costs = await storage.getCostRecords({
      userId,
      platform: platform as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });
    
    res.json({ costs });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/costs/summary", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    
    const summary = await storage.getCostSummary(userId, days);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// TIER 3.2: Database Backups
router.post("/backups", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, type, storageProvider } = req.body;
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const backup = await storage.createDatabaseBackup({
      userId,
      name,
      type: type || 'manual',
      storageProvider: storageProvider || 'supabase',
      status: 'pending',
      expiresAt,
    });
    
    res.json({ backup });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/backups", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const backups = await storage.getDatabaseBackups(userId);
    res.json({ backups });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/backups/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.userId!;
    const updates = req.body;
    const backup = await storage.updateDatabaseBackup(id, userId, updates);
    if (!backup) {
      return res.status(404).json({ message: "Backup not found or unauthorized" });
    }
    res.json({ backup });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/backups/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.userId!;
    const deleted = await storage.deleteDatabaseBackup(id, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Backup not found or unauthorized" });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// TIER 4: CI/CD Pipelines
router.post("/cicd/pipelines", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, description, triggers, steps } = req.body;
    
    const pipeline = await storage.createCicdPipeline({
      userId,
      name,
      description: description || null,
      triggers,
      steps,
      isActive: true,
    });
    
    res.json({ pipeline });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/cicd/pipelines", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const pipelines = await storage.getCicdPipelines(userId);
    res.json({ pipelines });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/cicd/pipelines/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.userId!;
    const updates = req.body;
    const pipeline = await storage.updateCicdPipeline(id, userId, updates);
    if (!pipeline) {
      return res.status(404).json({ message: "Pipeline not found or unauthorized" });
    }
    res.json({ pipeline });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/cicd/pipelines/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.userId!;
    const deleted = await storage.deleteCicdPipeline(id, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Pipeline not found or unauthorized" });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/cicd/runs", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { pipelineId, triggerType, gitCommitSha, gitBranch } = req.body;
    
    const pipelines = await storage.getCicdPipelines(userId);
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (!pipeline) {
      return res.status(404).json({ message: "Pipeline not found or unauthorized" });
    }
    
    const run = await storage.createCicdRun({
      pipelineId,
      userId,
      triggerType: triggerType || 'manual',
      gitCommitSha: gitCommitSha || null,
      gitBranch: gitBranch || null,
      status: 'pending',
    });
    
    res.json({ run });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/cicd/runs/:pipelineId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const pipelineId = parseInt(req.params.pipelineId);
    
    const pipelines = await storage.getCicdPipelines(userId);
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (!pipeline) {
      return res.status(404).json({ message: "Pipeline not found or unauthorized" });
    }
    
    const runs = await storage.getCicdRuns(pipelineId);
    res.json({ runs });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/cicd/runs/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.userId!;
    const updates = req.body;
    const run = await storage.updateCicdRun(id, userId, updates);
    if (!run) {
      return res.status(404).json({ message: "Run not found or unauthorized" });
    }
    res.json({ run });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;