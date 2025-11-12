/**
 * AGENT COMMUNICATION API
 * TRACK 3 BATCH 13-16: Complete API Layer
 * 
 * Provides endpoints for agent-to-agent (A2A) and human-to-agent (H2A) communication,
 * including message routing, escalations, collaboration requests, and emergency protocols.
 */

import { Router, type Response } from "express";
import { authenticateToken, type AuthRequest, requireRoleLevel } from "../middleware/auth";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { a2aProtocol, MessageType, MessagePriority } from "../services/communication/a2aProtocol";
import { ChangeBroadcastService } from "../services/broadcast/changeBroadcastService";
import { ESA_HIERARCHY } from "../services/esa/hierarchyManager";
import { AgentPerformanceTracker } from "../services/monitoring/agentPerformanceTracker";
import { db } from "../../shared/db";
import { agentCommunications, esaAgents, agentChangeBroadcasts, agentTasks } from "../../shared/platform-schema";
import { eq, desc, and, or, gte, count, sql, inArray } from "drizzle-orm";

console.log('[DEBUG] 🔄 agentCommunicationRoutes.ts - Starting module load...');

const router = Router();

console.log('[DEBUG] ✅ agentCommunicationRoutes.ts - Module load complete');

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const sendMessageSchema = z.object({
  fromAgentId: z.string().min(1),
  toAgentIds: z.array(z.string()).min(1),
  messageType: z.enum(['command', 'query', 'response', 'notification', 'escalation', 'coordination']),
  subject: z.string().min(1),
  message: z.string().min(1),
  taskId: z.number().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  requiresResponse: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
});

const escalateIssueSchema = z.object({
  agentId: z.string().min(1),
  issue: z.string().min(1),
  attemptedSolutions: z.array(z.string()).min(1),
  blockingIssue: z.string().min(1),
  helpNeeded: z.string().min(1),
  impact: z.string().min(1),
  suggestedAgents: z.array(z.string()).optional(),
});

const collaborationRequestSchema = z.object({
  requestingAgent: z.string().min(1),
  issue: z.string().min(1),
  expertiseNeeded: z.array(z.string()).min(1),
  impact: z.string().min(1),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  context: z.record(z.unknown()).optional(),
});

const declareEmergencySchema = z.object({
  agentId: z.string().min(1),
  situation: z.string().min(1),
  impact: z.string().min(1),
  affectedSystems: z.array(z.string()),
  immediateActions: z.array(z.string()),
});

const respondToMessageSchema = z.object({
  responseMessage: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

const broadcastChangeSchema = z.object({
  changeType: z.enum(['code_update', 'config_change', 'schema_update', 'pattern_learned', 'feature_added']),
  changeDescription: z.string().min(1),
  changeDetails: z.record(z.unknown()).optional(),
  initiatedBy: z.string().min(1),
  sourceAgent: z.string().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  affectedAgents: z.array(z.string()).optional(),
  affectedDomains: z.array(z.string()).optional(),
  affectedTags: z.array(z.string()).optional(),
});

const acknowledgeBroadcastSchema = z.object({
  agentId: z.string().min(1),
  processingTime: z.number().optional(),
});

// ============================================================================
// ENDPOINTS
// ============================================================================

/**
 * POST /api/agent-communication/send
 * Send a message from one agent to one or more other agents
 */
router.post("/send", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const message = sendMessageSchema.parse(req.body);

    // Verify sender agent exists
    const fromAgent = await db.select()
      .from(esaAgents)
      .where(eq(esaAgents.agentCode, message.fromAgentId))
      .limit(1);

    if (!fromAgent || fromAgent.length === 0) {
      return res.status(404).json({ error: "Sender agent not found" });
    }

    // Create communication records for each recipient
    const communications = await Promise.all(
      message.toAgentIds.map(async (toAgentId) => {
        const toAgent = await db.select()
          .from(esaAgents)
          .where(eq(esaAgents.agentCode, toAgentId))
          .limit(1);

        if (!toAgent || toAgent.length === 0) {
          throw new Error(`Recipient agent ${toAgentId} not found`);
        }

        const [comm] = await db.insert(agentCommunications)
          .values({
            communicationType: 'A2A',
            fromAgentId: fromAgent[0].id,
            toAgentId: toAgent[0].id,
            messageType: message.messageType,
            subject: message.subject,
            message: message.message,
            taskId: message.taskId,
            priority: message.priority,
            requiresResponse: message.requiresResponse,
            metadata: message.metadata,
          })
          .returning();

        return comm;
      })
    );

    res.json({
      success: true,
      messagesSent: communications.length,
      communications,
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
 * GET /api/agent-communication/messages/:agentId
 * Get all messages for a specific agent (inbox)
 */
router.get("/messages/:agentId", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    const { type, priority, limit = '50', offset = '0', unrespondedOnly = 'false' } = req.query;

    // Get agent
    const agent = await db.select()
      .from(esaAgents)
      .where(eq(esaAgents.agentCode, agentId))
      .limit(1);

    if (!agent || agent.length === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    let query = db.select({
      id: agentCommunications.id,
      communicationType: agentCommunications.communicationType,
      fromAgentId: agentCommunications.fromAgentId,
      toAgentId: agentCommunications.toAgentId,
      messageType: agentCommunications.messageType,
      subject: agentCommunications.subject,
      message: agentCommunications.message,
      priority: agentCommunications.priority,
      requiresResponse: agentCommunications.requiresResponse,
      respondedAt: agentCommunications.respondedAt,
      createdAt: agentCommunications.createdAt,
      fromAgent: {
        agentCode: esaAgents.agentCode,
        agentName: esaAgents.agentName,
      }
    })
    .from(agentCommunications)
    .leftJoin(esaAgents, eq(agentCommunications.fromAgentId, esaAgents.id))
    .where(eq(agentCommunications.toAgentId, agent[0].id))
    .$dynamic();

    if (type) {
      query = query.where(eq(agentCommunications.messageType, type as any));
    }
    if (priority) {
      query = query.where(eq(agentCommunications.priority, priority as any));
    }
    if (unrespondedOnly === 'true') {
      query = query.where(
        and(
          eq(agentCommunications.requiresResponse, true),
          sql`${agentCommunications.respondedAt} IS NULL`
        )
      );
    }

    const messages = await query
      .orderBy(desc(agentCommunications.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    const totalCount = await db.select({ count: count() })
      .from(agentCommunications)
      .where(eq(agentCommunications.toAgentId, agent[0].id));

    res.json({
      messages,
      total: totalCount[0].count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-communication/messages/:agentId/sent
 * Get all messages sent by a specific agent (outbox)
 */
router.get("/messages/:agentId/sent", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const agent = await db.select()
      .from(esaAgents)
      .where(eq(esaAgents.agentCode, agentId))
      .limit(1);

    if (!agent || agent.length === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const messages = await db.select({
      id: agentCommunications.id,
      communicationType: agentCommunications.communicationType,
      toAgentId: agentCommunications.toAgentId,
      messageType: agentCommunications.messageType,
      subject: agentCommunications.subject,
      message: agentCommunications.message,
      priority: agentCommunications.priority,
      requiresResponse: agentCommunications.requiresResponse,
      respondedAt: agentCommunications.respondedAt,
      createdAt: agentCommunications.createdAt,
      toAgent: {
        agentCode: esaAgents.agentCode,
        agentName: esaAgents.agentName,
      }
    })
    .from(agentCommunications)
    .leftJoin(esaAgents, eq(agentCommunications.toAgentId, esaAgents.id))
    .where(eq(agentCommunications.fromAgentId, agent[0].id))
    .orderBy(desc(agentCommunications.createdAt))
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));

    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-communication/escalate
 * Escalate an issue up the agent hierarchy
 */
router.post("/escalate", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const escalation = escalateIssueSchema.parse(req.body);

    const result = await a2aProtocol.escalateIssue(escalation);

    res.json({
      success: true,
      escalation: result,
      message: `Issue escalated to ${result.escalatedTo}`,
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
 * GET /api/agent-communication/escalations
 * Get all active escalations in the system
 */
router.get("/escalations", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const { status = 'active', limit = '20' } = req.query;

    const escalations = await db.select()
      .from(agentCommunications)
      .where(
        and(
          eq(agentCommunications.messageType, 'escalation'),
          sql`${agentCommunications.respondedAt} IS ${status === 'active' ? sql`NULL` : sql`NOT NULL`}`
        )
      )
      .orderBy(desc(agentCommunications.createdAt))
      .limit(parseInt(limit as string));

    res.json({ escalations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-communication/collaborate
 * Request collaboration from peer agents
 */
router.post("/collaborate", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const collaboration = collaborationRequestSchema.parse(req.body);

    const result = await a2aProtocol.requestPeerCollaboration(collaboration);

    res.json({
      success: true,
      collaboration: result,
      collaborators: result.collaborators,
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
 * GET /api/agent-communication/collaborations
 * Get all active collaboration requests
 */
router.get("/collaborations", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { agentId, status = 'active' } = req.query;

    let query = db.select()
      .from(agentCommunications)
      .where(eq(agentCommunications.messageType, 'coordination'))
      .$dynamic();

    if (agentId) {
      const agent = await db.select()
        .from(esaAgents)
        .where(eq(esaAgents.agentCode, agentId as string))
        .limit(1);

      if (agent && agent.length > 0) {
        query = query.where(
          or(
            eq(agentCommunications.fromAgentId, agent[0].id),
            eq(agentCommunications.toAgentId, agent[0].id)
          )
        );
      }
    }

    if (status === 'active') {
      query = query.where(sql`${agentCommunications.respondedAt} IS NULL`);
    }

    const collaborations = await query.orderBy(desc(agentCommunications.createdAt));

    res.json({ collaborations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/agent-communication/resolve/:id
 * Mark a communication as resolved (responded to)
 */
router.patch("/resolve/:id", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const commId = parseInt(req.params.id);
    const { responseMessage, metadata } = req.body;

    const updated = await db.update(agentCommunications)
      .set({
        respondedAt: new Date(),
        metadata: metadata ? { ...metadata, response: responseMessage } : { response: responseMessage },
      })
      .where(eq(agentCommunications.id, commId))
      .returning();

    if (!updated || updated.length === 0) {
      return res.status(404).json({ error: "Communication not found" });
    }

    res.json({
      success: true,
      communication: updated[0],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-communication/respond/:id
 * Respond to a message that requires a response
 */
router.post("/respond/:id", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const commId = parseInt(req.params.id);
    const response = respondToMessageSchema.parse(req.body);

    // Get original message
    const original = await db.select()
      .from(agentCommunications)
      .where(eq(agentCommunications.id, commId))
      .limit(1);

    if (!original || original.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (!original[0].requiresResponse) {
      return res.status(400).json({ error: "Message does not require a response" });
    }

    // Create response message
    const [responseComm] = await db.insert(agentCommunications)
      .values({
        communicationType: 'A2A',
        fromAgentId: original[0].toAgentId!,
        toAgentId: original[0].fromAgentId!,
        messageType: 'response',
        subject: `Re: ${original[0].subject}`,
        message: response.responseMessage,
        priority: original[0].priority,
        requiresResponse: false,
        responseId: commId,
        metadata: response.metadata,
      })
      .returning();

    // Mark original as responded
    await db.update(agentCommunications)
      .set({ respondedAt: new Date() })
      .where(eq(agentCommunications.id, commId));

    res.json({
      success: true,
      response: responseComm,
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
 * POST /api/agent-communication/emergency
 * Declare an emergency and activate emergency protocols
 */
router.post("/emergency", authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res: Response) => {
  try {
    const emergency = declareEmergencySchema.parse(req.body);

    const result = await a2aProtocol.declareEmergency({
      agentId: emergency.agentId,
      situation: emergency.situation,
      impact: emergency.impact,
      affectedSystems: emergency.affectedSystems,
      immediateActions: emergency.immediateActions,
    });

    res.json({
      success: true,
      emergency: result,
      message: "Emergency protocol activated",
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
 * GET /api/agent-communication/broadcast-history
 * Get history of broadcast messages
 */
router.get("/broadcast-history", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const { limit = '20', offset = '0' } = req.query;

    const broadcasts = await db.select()
      .from(agentCommunications)
      .where(eq(agentCommunications.messageType, 'notification'))
      .orderBy(desc(agentCommunications.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json({ broadcasts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-communication/stats
 * Get communication statistics
 */
router.get("/stats", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { timeRange = '7d' } = req.query;

    const daysAgo = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysAgo);

    const stats = await db.select({
      total: count(),
      escalations: sql<number>`count(*) FILTER (WHERE message_type = 'escalation')`,
      collaborations: sql<number>`count(*) FILTER (WHERE message_type = 'coordination')`,
      commands: sql<number>`count(*) FILTER (WHERE message_type = 'command')`,
      queries: sql<number>`count(*) FILTER (WHERE message_type = 'query')`,
      requireResponse: sql<number>`count(*) FILTER (WHERE requires_response = true)`,
      responded: sql<number>`count(*) FILTER (WHERE responded_at IS NOT NULL)`,
    }).from(agentCommunications)
      .where(gte(agentCommunications.createdAt, threshold));

    const responseRate = stats[0].requireResponse > 0
      ? (stats[0].responded / stats[0].requireResponse) * 100
      : 0;

    res.json({
      timeRange,
      stats: stats[0],
      responseRate: responseRate.toFixed(2),
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-communication/conversation/:id
 * Get full conversation thread for a message
 */
router.get("/conversation/:id", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const commId = parseInt(req.params.id);

    // Get original message
    const original = await db.select()
      .from(agentCommunications)
      .where(eq(agentCommunications.id, commId))
      .limit(1);

    if (!original || original.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Get all responses in thread
    const responses = await db.select()
      .from(agentCommunications)
      .where(eq(agentCommunications.responseId, commId))
      .orderBy(agentCommunications.createdAt);

    res.json({
      original: original[0],
      responses,
      threadLength: responses.length + 1,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agents/communication/broadcast
 * Broadcast a system-wide change to all affected agents
 */
router.post("/broadcast", authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res: Response) => {
  try {
    const broadcast = broadcastChangeSchema.parse(req.body);

    const result = await ChangeBroadcastService.broadcastChange({
      changeType: broadcast.changeType,
      changeDescription: broadcast.changeDescription,
      changeDetails: broadcast.changeDetails,
      initiatedBy: broadcast.initiatedBy,
      sourceAgent: broadcast.sourceAgent,
      priority: broadcast.priority,
      affectedAgents: broadcast.affectedAgents,
      affectedDomains: broadcast.affectedDomains,
      affectedTags: broadcast.affectedTags,
    });

    res.json({
      success: true,
      broadcast: result,
      message: `Broadcast initiated to ${result.totalAgents} agents`,
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
 * GET /api/agents/communication/broadcasts/:id
 * Get the status of a specific broadcast
 */
router.get("/broadcasts/:id", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const status = await ChangeBroadcastService.getBroadcastStatus(id);

    res.json({
      success: true,
      status,
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agents/communication/broadcasts/:id/acknowledge
 * Acknowledge receipt and processing of a broadcast
 */
router.post("/broadcasts/:id/acknowledge", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ack = acknowledgeBroadcastSchema.parse(req.body);

    await ChangeBroadcastService.acknowledgeChange({
      changeId: id,
      agentId: ack.agentId,
      acknowledged: true,
      processingTime: ack.processingTime,
    });

    res.json({
      success: true,
      message: `Agent ${ack.agentId} acknowledged broadcast ${id}`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.toString() });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agents/communication/hierarchy/:agentId
 * Get the hierarchical structure and reporting lines for a specific agent
 */
router.get("/hierarchy/:agentId", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;

    const agentDef = ESA_HIERARCHY[agentId];
    if (!agentDef) {
      return res.status(404).json({ error: `Agent ${agentId} not found in hierarchy` });
    }

    // Build hierarchy information
    const hierarchy = {
      agent: {
        id: agentDef.id,
        name: agentDef.name,
        level: agentDef.level,
        division: agentDef.division,
        domain: agentDef.domain,
        layerNumbers: agentDef.layerNumbers,
        expertiseAreas: agentDef.expertiseAreas,
      },
      reportsTo: agentDef.reportingTo?.map(id => {
        const superior = ESA_HIERARCHY[id];
        return superior ? {
          id: superior.id,
          name: superior.name,
          level: superior.level,
        } : null;
      }).filter(Boolean) || [],
      manages: agentDef.manages?.map(id => {
        const subordinate = ESA_HIERARCHY[id];
        return subordinate ? {
          id: subordinate.id,
          name: subordinate.name,
          level: subordinate.level,
        } : null;
      }).filter(Boolean) || [],
      peers: Object.values(ESA_HIERARCHY)
        .filter(a => 
          a.id !== agentId && 
          a.level === agentDef.level && 
          a.division === agentDef.division
        )
        .slice(0, 5)
        .map(peer => ({
          id: peer.id,
          name: peer.name,
          level: peer.level,
        })),
    };

    res.json({
      success: true,
      hierarchy,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agents/communication/workload
 * Get workload balance status across all agents or specific domain/division
 */
router.get("/workload", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const { division, domain, threshold = '80' } = req.query;
    const workloadThreshold = parseInt(threshold as string);

    // Get all agents with their current workload
    const agents = await db.select({
      agentId: esaAgents.id,
      agentCode: esaAgents.agentCode,
      agentName: esaAgents.agentName,
      agentType: esaAgents.agentType,
      status: esaAgents.status,
      taskCount: sql<number>`(
        SELECT COUNT(*) FROM agent_tasks 
        WHERE agent_id = ${esaAgents.id} 
        AND status IN ('assigned', 'in_progress')
      )`,
      performanceScore: esaAgents.performanceScore,
    })
    .from(esaAgents)
    .where(eq(esaAgents.status, 'active'));

    // Calculate workload status for each agent
    const workloadStatus = agents.map(agent => {
      const maxCapacity = 10; // Assume each agent can handle 10 concurrent tasks
      const currentCapacity = (agent.taskCount / maxCapacity) * 100;
      
      let status: 'available' | 'busy' | 'overloaded' | 'critical';
      if (currentCapacity < 50) status = 'available';
      else if (currentCapacity < 80) status = 'busy';
      else if (currentCapacity < 100) status = 'overloaded';
      else status = 'critical';

      return {
        agentId: agent.agentCode,
        agentName: agent.agentName,
        currentCapacity: Math.round(currentCapacity),
        status,
        queueDepth: agent.taskCount,
        concurrentTasks: agent.taskCount,
        performanceScore: agent.performanceScore || 0,
        recommendedAction: currentCapacity > workloadThreshold 
          ? 'Consider redistributing tasks to available agents' 
          : undefined,
      };
    });

    // Identify overloaded agents
    const overloadedAgents = workloadStatus.filter(a => a.currentCapacity > workloadThreshold);
    const availableAgents = workloadStatus.filter(a => a.currentCapacity < 50);

    // Calculate overall system health
    const avgCapacity = workloadStatus.reduce((sum, a) => sum + a.currentCapacity, 0) / workloadStatus.length;
    
    res.json({
      success: true,
      summary: {
        totalAgents: workloadStatus.length,
        availableAgents: availableAgents.length,
        busyAgents: workloadStatus.filter(a => a.status === 'busy').length,
        overloadedAgents: overloadedAgents.length,
        criticalAgents: workloadStatus.filter(a => a.status === 'critical').length,
        averageCapacity: Math.round(avgCapacity),
        systemHealth: avgCapacity < 60 ? 'healthy' : avgCapacity < 80 ? 'moderate' : 'strained',
      },
      agents: workloadStatus,
      recommendations: overloadedAgents.length > 0 ? [
        `${overloadedAgents.length} agent(s) are overloaded and may need task redistribution`,
        `${availableAgents.length} agent(s) are available to take on additional work`,
      ] : ['System workload is balanced'],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
