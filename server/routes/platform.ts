import { Router, Response } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { esaAgents, agentTasks, agentCommunications } from "../../shared/platform-schema";
import { sql, eq, asc, desc } from "drizzle-orm";

const router = Router();

// Initialize database connection
const queryClient = neon(process.env.DATABASE_URL!);
const db = drizzle(queryClient);

// ============================================================================
// ESA FRAMEWORK ROUTES
// ============================================================================

// GET /api/platform/esa/stats - Get ESA agent statistics
router.get("/esa/stats", async (req: AuthRequest, res: Response) => {
  try {
    const totalAgents = await db.select({ count: sql<number>`count(*)::int` }).from(esaAgents);
    const activeAgents = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(esaAgents)
      .where(eq(esaAgents.status, "active"));
    const certifiedAgents = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(esaAgents)
      .where(sql`${esaAgents.certificationLevel} > 0`);
    const trainingAgents = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(esaAgents)
      .where(eq(esaAgents.status, "training"));

    // Agents by type
    const byType = await db
      .select({
        type: esaAgents.agentType,
        count: sql<number>`count(*)::int`,
      })
      .from(esaAgents)
      .groupBy(esaAgents.agentType);

    const agentsByType: Record<string, number> = {};
    byType.forEach((row) => {
      agentsByType[row.type] = row.count;
    });

    // Certification levels
    const byLevel = await db
      .select({
        level: esaAgents.certificationLevel,
        count: sql<number>`count(*)::int`,
      })
      .from(esaAgents)
      .groupBy(esaAgents.certificationLevel);

    const certificationLevels: Record<string, number> = {
      level0: 0,
      level1: 0,
      level2: 0,
      level3: 0,
    };
    byLevel.forEach((row) => {
      certificationLevels[`level${row.level}`] = row.count;
    });

    res.json({
      totalAgents: totalAgents[0].count,
      activeAgents: activeAgents[0].count,
      certifiedAgents: certifiedAgents[0].count,
      trainingAgents: trainingAgents[0].count,
      agentsByType,
      certificationLevels,
      performanceMetrics: {
        totalTasksCompleted: 0,
        avgSuccessRate: 0,
        avgCompletionTime: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/platform/esa/agents - Get all ESA agents
router.get("/esa/agents", async (req: AuthRequest, res: Response) => {
  try {
    const agents = await db.select().from(esaAgents).orderBy(asc(esaAgents.agentCode));
    res.json(agents);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/platform/esa/agents/:code - Get specific agent
router.get("/esa/agents/:code", async (req: AuthRequest, res: Response) => {
  try {
    // Mock data - implement actual database queries when storage interface is ready
    res.status(404).json({ error: "Agent not found" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/platform/esa/agents - Create new agent
router.post("/esa/agents", async (req: AuthRequest, res: Response) => {
  try {
    // Mock data - implement actual database queries when storage interface is ready
    res.status(201).json({ message: "Not implemented yet" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================================
// AGENT TASKS ROUTES
// ============================================================================

// GET /api/platform/esa/tasks - Get all agent tasks
router.get("/esa/tasks", async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await db
      .select({
        id: agentTasks.id,
        agentId: agentTasks.agentId,
        taskType: agentTasks.taskType,
        title: agentTasks.title,
        description: agentTasks.description,
        priority: agentTasks.priority,
        status: agentTasks.status,
        estimatedDuration: agentTasks.estimatedDuration,
        actualDuration: agentTasks.actualDuration,
        createdAt: agentTasks.createdAt,
        startedAt: agentTasks.startedAt,
        completedAt: agentTasks.completedAt,
        agentCode: esaAgents.agentCode,
        agentName: esaAgents.agentName,
      })
      .from(agentTasks)
      .leftJoin(esaAgents, eq(agentTasks.agentId, esaAgents.id))
      .orderBy(desc(agentTasks.createdAt));

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/platform/esa/tasks/stats - Get task statistics
router.get("/esa/tasks/stats", async (req: AuthRequest, res: Response) => {
  try {
    const totalTasks = await db.select({ count: sql<number>`count(*)::int` }).from(agentTasks);
    const pending = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentTasks)
      .where(eq(agentTasks.status, "pending"));
    const inProgress = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentTasks)
      .where(eq(agentTasks.status, "in_progress"));
    const completed = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentTasks)
      .where(eq(agentTasks.status, "completed"));
    const failed = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentTasks)
      .where(eq(agentTasks.status, "failed"));

    res.json({
      total: totalTasks[0].count,
      pending: pending[0].count,
      inProgress: inProgress[0].count,
      completed: completed[0].count,
      failed: failed[0].count,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================================
// AGENT COMMUNICATIONS ROUTES
// ============================================================================

// GET /api/platform/esa/communications - Get all communications
router.get("/esa/communications", async (req: AuthRequest, res: Response) => {
  try {
    const comms = await db
      .select({
        id: agentCommunications.id,
        communicationType: agentCommunications.communicationType,
        fromAgentId: agentCommunications.fromAgentId,
        toAgentId: agentCommunications.toAgentId,
        fromUserId: agentCommunications.fromUserId,
        toUserId: agentCommunications.toUserId,
        messageType: agentCommunications.messageType,
        subject: agentCommunications.subject,
        message: agentCommunications.message,
        priority: agentCommunications.priority,
        requiresResponse: agentCommunications.requiresResponse,
        createdAt: agentCommunications.createdAt,
      })
      .from(agentCommunications)
      .orderBy(desc(agentCommunications.createdAt));

    // Enrich with agent names
    const enrichedComms = await Promise.all(
      comms.map(async (comm) => {
        let fromAgentCode, fromAgentName, toAgentCode, toAgentName;

        if (comm.fromAgentId) {
          const fromAgent = await db
            .select({ code: esaAgents.agentCode, name: esaAgents.agentName })
            .from(esaAgents)
            .where(eq(esaAgents.id, comm.fromAgentId))
            .limit(1);
          if (fromAgent[0]) {
            fromAgentCode = fromAgent[0].code;
            fromAgentName = fromAgent[0].name;
          }
        }

        if (comm.toAgentId) {
          const toAgent = await db
            .select({ code: esaAgents.agentCode, name: esaAgents.agentName })
            .from(esaAgents)
            .where(eq(esaAgents.id, comm.toAgentId))
            .limit(1);
          if (toAgent[0]) {
            toAgentCode = toAgent[0].code;
            toAgentName = toAgent[0].name;
          }
        }

        return {
          ...comm,
          fromAgentCode,
          fromAgentName,
          toAgentCode,
          toAgentName,
        };
      })
    );

    res.json(enrichedComms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/platform/esa/communications/stats - Get communication statistics
router.get("/esa/communications/stats", async (req: AuthRequest, res: Response) => {
  try {
    const totalComms = await db.select({ count: sql<number>`count(*)::int` }).from(agentCommunications);
    const agentToAgent = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentCommunications)
      .where(eq(agentCommunications.communicationType, "agent_to_agent"));
    const agentToUser = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentCommunications)
      .where(eq(agentCommunications.communicationType, "agent_to_user"));
    const userToAgent = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentCommunications)
      .where(eq(agentCommunications.communicationType, "user_to_agent"));
    const requiresResponse = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentCommunications)
      .where(eq(agentCommunications.requiresResponse, true));

    res.json({
      total: totalComms[0].count,
      agentToAgent: agentToAgent[0].count,
      agentToUser: agentToUser[0].count,
      userToAgent: userToAgent[0].count,
      requiresResponse: requiresResponse[0].count,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================================
// GIT REPOSITORY ROUTES (Mock - would connect to GitHub API in production)
// ============================================================================

router.get("/git-info", async (req, res, next) => {
  try {
    res.json({
      owner: process.env.GITHUB_OWNER || "mundo-tango",
      repo: process.env.GITHUB_REPO || "platform",
      repoId: process.env.GITHUB_REPO_ID || "R_123456",
      defaultBranch: "main",
      branches: [
        { name: "main", commit: "abc123", protected: true },
        { name: "develop", commit: "def456", protected: false },
        { name: "feature/esa-framework", commit: "ghi789", protected: false },
      ],
      recentCommits: [
        {
          sha: "abc123def",
          message: "feat: Add ESA Framework schema",
          author: "Developer",
          date: new Date().toISOString(),
          branch: "main",
        },
        {
          sha: "def456ghi",
          message: "feat: Implement secrets management UI",
          author: "Developer",
          date: new Date(Date.now() - 3600000).toISOString(),
          branch: "main",
        },
        {
          sha: "ghi789jkl",
          message: "fix: Update deployment webhook handlers",
          author: "Developer",
          date: new Date(Date.now() - 7200000).toISOString(),
          branch: "develop",
        },
      ],
      stats: {
        totalCommits: 247,
        totalBranches: 8,
        contributors: 3,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// MONITORING ROUTES (Mock - would connect to monitoring service in production)
// ============================================================================

router.get("/monitoring", async (req, res, next) => {
  try {
    res.json({
      vercel: {
        status: "operational",
        uptime: 99.98,
        avgResponseTime: 142,
        requests24h: 12847,
      },
      railway: {
        status: "operational",
        uptime: 99.95,
        avgResponseTime: 218,
        requests24h: 8932,
      },
      responseTimeHistory: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        vercel: Math.floor(120 + Math.random() * 80),
        railway: Math.floor(180 + Math.random() * 100),
      })),
      recentIncidents: [
        {
          platform: "Vercel",
          severity: "info",
          message: "Deployment completed successfully",
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
        {
          platform: "Railway",
          severity: "warning",
          message: "Increased response time detected",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// ANALYTICS ROUTES (Mock - would query analytics_events table in production)
// ============================================================================

router.get("/analytics", async (req, res, next) => {
  try {
    res.json({
      overview: {
        totalDeployments: 47,
        successfulDeployments: 43,
        failedDeployments: 4,
        avgDeploymentTime: 182,
      },
      deploymentsByDay: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        count: Math.floor(3 + Math.random() * 8),
      })),
      apiUsage: {
        totalRequests: 284792,
        avgResponseTime: 145,
        errorRate: 0.8,
      },
      apiRequestsByHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString().padStart(2, "0") + ":00",
        requests: Math.floor(8000 + Math.random() * 6000),
      })),
      topErrors: [
        {
          message: "Database connection timeout",
          count: 12,
          lastOccurred: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          message: "Invalid authentication token",
          count: 8,
          lastOccurred: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          message: "Rate limit exceeded",
          count: 5,
          lastOccurred: new Date(Date.now() - 10800000).toISOString(),
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
