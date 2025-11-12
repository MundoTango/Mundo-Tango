/**
 * KNOWLEDGE API
 * TRACK 3 BATCH 13-16: Complete API Layer
 * 
 * Provides endpoints for knowledge graph operations, semantic search,
 * pattern management, and expertise routing.
 */

import { Router, type Response } from "express";
import { authenticateToken, type AuthRequest, requireRoleLevel } from "../middleware/auth";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { knowledgeGraphService } from "../services/knowledge/knowledgeGraphService";
import { LearningCoordinatorService } from "../services/learning/learningCoordinator";
import { db } from "../../shared/db";
import { 
  knowledgeGraphNodes,
  knowledgeGraphEdges,
  esaAgents,
} from "../../shared/platform-schema";
import { learningPatterns } from "../../shared/schema";
import { eq, desc, and, or, gte, like, sql, count } from "drizzle-orm";

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const semanticSearchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(10),
  filters: z.object({
    category: z.string().optional(),
    domain: z.string().optional(),
    agentId: z.string().optional(),
    minConfidence: z.number().min(0).max(1).optional(),
  }).optional(),
});

const createPatternSchema = z.object({
  agentId: z.string().min(1),
  patternName: z.string().min(1),
  category: z.enum(['bug_fix', 'optimization', 'feature', 'refactor', 'pattern', 'architecture']),
  domain: z.string().min(1),
  problemSignature: z.string().min(1),
  solutionTemplate: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0.8),
  tags: z.array(z.string()).optional(),
  codeExample: z.string().optional(),
  whenNotToUse: z.string().optional(),
});

const findExpertsSchema = z.object({
  requiredCapabilities: z.array(z.string()).min(1),
  preferredExpertise: z.array(z.string()).optional(),
  taskType: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  excludeAgents: z.array(z.string()).optional(),
  minSuccessRate: z.number().min(0).max(1).optional(),
  maxLoad: z.number().optional(),
  limit: z.number().min(1).max(20).default(5),
});

const addRelationshipSchema = z.object({
  sourceAgentCode: z.string().min(1),
  targetAgentCode: z.string().min(1),
  relationshipType: z.enum(['reports_to', 'manages', 'collaborates_with', 'consults', 'shares_knowledge', 'escalates_to']),
  strength: z.number().min(0).max(1).default(1.0),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// ENDPOINTS
// ============================================================================

/**
 * POST /api/knowledge/search
 * Semantic search across all knowledge (patterns, learnings, agent expertise)
 */
router.post("/search", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const search = semanticSearchSchema.parse(req.body);

    const results = await LearningCoordinatorService.searchKnowledge(
      search.query,
      search.limit
    );

    // Apply filters if provided
    let filtered = results;
    if (search.filters) {
      if (search.filters.category) {
        filtered = filtered.filter(r => r.pattern.category === search.filters!.category);
      }
      if (search.filters.domain) {
        filtered = filtered.filter(r => r.pattern.domain === search.filters!.domain);
      }
      if (search.filters.agentId) {
        filtered = filtered.filter(r => r.pattern.agentId === search.filters!.agentId);
      }
      if (search.filters.minConfidence) {
        filtered = filtered.filter(r => r.relevanceScore >= search.filters!.minConfidence!);
      }
    }

    res.json({
      query: search.query,
      results: filtered,
      totalResults: filtered.length,
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
 * GET /api/knowledge/graph/:agentId
 * Get knowledge graph for a specific agent (relationships, expertise, connections)
 */
router.get("/graph/:agentId", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;
    const { depth = '2' } = req.query;

    // Get agent node
    const agent = await db.select()
      .from(esaAgents)
      .where(eq(esaAgents.agentCode, agentId))
      .limit(1);

    if (!agent || agent.length === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Get agent's knowledge graph node
    const node = await db.select()
      .from(knowledgeGraphNodes)
      .where(eq(knowledgeGraphNodes.agentId, agent[0].id))
      .limit(1);

    if (!node || node.length === 0) {
      // Create node if it doesn't exist
      const [newNode] = await db.insert(knowledgeGraphNodes)
        .values({
          agentId: agent[0].id,
          nodeType: 'agent',
          capabilities: agent[0].configuration?.capabilities || [],
          expertiseAreas: agent[0].configuration?.capabilities || [],
          successRate: agent[0].tasksSuccess && agent[0].tasksCompleted 
            ? agent[0].tasksSuccess / agent[0].tasksCompleted 
            : 0,
          currentLoad: 0,
        })
        .returning();

      return res.json({
        node: newNode,
        relationships: [],
        depth: parseInt(depth as string),
      });
    }

    // Get relationships
    const outgoingEdges = await db.select({
      edge: knowledgeGraphEdges,
      targetAgent: esaAgents,
    })
    .from(knowledgeGraphEdges)
    .leftJoin(esaAgents, eq(knowledgeGraphEdges.targetNodeId, esaAgents.id))
    .where(eq(knowledgeGraphEdges.sourceNodeId, node[0].id!));

    const incomingEdges = await db.select({
      edge: knowledgeGraphEdges,
      sourceAgent: esaAgents,
    })
    .from(knowledgeGraphEdges)
    .leftJoin(esaAgents, eq(knowledgeGraphEdges.sourceNodeId, esaAgents.id))
    .where(eq(knowledgeGraphEdges.targetNodeId, node[0].id!));

    res.json({
      node: node[0],
      relationships: {
        outgoing: outgoingEdges,
        incoming: incomingEdges,
      },
      depth: parseInt(depth as string),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/knowledge/pattern
 * Create a new knowledge pattern
 */
router.post("/pattern", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const pattern = createPatternSchema.parse(req.body);

    const [created] = await db.insert(learningPatterns)
      .values({
        agentId: pattern.agentId,
        patternName: pattern.patternName,
        category: pattern.category,
        domain: pattern.domain,
        problemSignature: pattern.problemSignature,
        solutionTemplate: pattern.solutionTemplate,
        confidence: pattern.confidence,
        tags: pattern.tags || [],
        codeExample: pattern.codeExample,
        whenNotToUse: pattern.whenNotToUse,
        timesApplied: 0,
        successRate: 0,
      })
      .returning();

    res.json({
      success: true,
      pattern: created,
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
 * GET /api/knowledge/patterns
 * List knowledge patterns with optional filters
 */
router.get("/patterns", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      category, 
      domain, 
      agentId, 
      minConfidence,
      sortBy = 'recent',
      limit = '20', 
      offset = '0' 
    } = req.query;

    let query = db.select().from(learningPatterns).$dynamic();

    if (category) {
      query = query.where(eq(learningPatterns.category, category as any));
    }
    if (domain) {
      query = query.where(eq(learningPatterns.domain, domain as string));
    }
    if (agentId) {
      query = query.where(eq(learningPatterns.agentId, agentId as string));
    }
    if (minConfidence) {
      query = query.where(gte(learningPatterns.confidence, parseFloat(minConfidence as string)));
    }

    const orderBy = sortBy === 'popular' 
      ? desc(learningPatterns.timesApplied)
      : sortBy === 'success'
      ? desc(learningPatterns.successRate)
      : desc(learningPatterns.createdAt);

    const patterns = await query
      .orderBy(orderBy)
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    const totalCount = await db.select({ count: count() })
      .from(learningPatterns);

    res.json({
      patterns,
      total: totalCount[0].count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/knowledge/patterns/:id
 * Get detailed information about a specific pattern
 */
router.get("/patterns/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const patternId = parseInt(req.params.id);

    const pattern = await db.select()
      .from(learningPatterns)
      .where(eq(learningPatterns.id, patternId))
      .limit(1);

    if (!pattern || pattern.length === 0) {
      return res.status(404).json({ error: "Pattern not found" });
    }

    res.json({ pattern: pattern[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/knowledge/expertise
 * Find expert agents based on required capabilities
 */
router.post("/expertise", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const expertiseQuery = findExpertsSchema.parse(req.body);

    const matches = await knowledgeGraphService.instance.findExpertAgents(expertiseQuery);

    res.json({
      query: expertiseQuery,
      experts: matches,
      totalMatches: matches.length,
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
 * GET /api/knowledge/expertise/:domain
 * Find experts in a specific domain
 */
router.get("/expertise/:domain", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { domain } = req.params;
    const { limit = '10' } = req.query;

    // Search for agents with expertise in this domain
    const experts = await db.select()
      .from(esaAgents)
      .where(
        and(
          eq(esaAgents.status, 'active'),
          sql`${esaAgents.competencies} @> ARRAY[${domain}]::text[]`
        )
      )
      .orderBy(desc(esaAgents.tasksSuccess))
      .limit(parseInt(limit as string));

    res.json({
      domain,
      experts,
      totalExperts: experts.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/knowledge/relationships
 * Add a relationship between two agents in the knowledge graph
 */
router.post("/relationships", authenticateToken, requireRoleLevel(6), async (req: AuthRequest, res: Response) => {
  try {
    const relationship = addRelationshipSchema.parse(req.body);

    // Get source and target agents
    const sourceAgent = await db.select()
      .from(esaAgents)
      .where(eq(esaAgents.agentCode, relationship.sourceAgentCode))
      .limit(1);

    const targetAgent = await db.select()
      .from(esaAgents)
      .where(eq(esaAgents.agentCode, relationship.targetAgentCode))
      .limit(1);

    if (!sourceAgent || sourceAgent.length === 0) {
      return res.status(404).json({ error: "Source agent not found" });
    }
    if (!targetAgent || targetAgent.length === 0) {
      return res.status(404).json({ error: "Target agent not found" });
    }

    // Get or create knowledge graph nodes
    let sourceNode = await db.select()
      .from(knowledgeGraphNodes)
      .where(eq(knowledgeGraphNodes.agentId, sourceAgent[0].id))
      .limit(1);

    if (!sourceNode || sourceNode.length === 0) {
      [sourceNode[0]] = await db.insert(knowledgeGraphNodes)
        .values({
          agentId: sourceAgent[0].id,
          nodeType: 'agent',
          capabilities: sourceAgent[0].configuration?.capabilities || [],
          expertiseAreas: sourceAgent[0].configuration?.capabilities || [],
          successRate: 0,
          currentLoad: 0,
        })
        .returning();
    }

    let targetNode = await db.select()
      .from(knowledgeGraphNodes)
      .where(eq(knowledgeGraphNodes.agentId, targetAgent[0].id))
      .limit(1);

    if (!targetNode || targetNode.length === 0) {
      [targetNode[0]] = await db.insert(knowledgeGraphNodes)
        .values({
          agentId: targetAgent[0].id,
          nodeType: 'agent',
          capabilities: targetAgent[0].configuration?.capabilities || [],
          expertiseAreas: targetAgent[0].configuration?.capabilities || [],
          successRate: 0,
          currentLoad: 0,
        })
        .returning();
    }

    // Create edge
    const [edge] = await db.insert(knowledgeGraphEdges)
      .values({
        sourceNodeId: sourceNode[0].id!,
        targetNodeId: targetNode[0].id!,
        relationshipType: relationship.relationshipType,
        strength: relationship.strength,
        metadata: relationship.metadata,
      })
      .returning();

    res.json({
      success: true,
      relationship: edge,
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
 * GET /api/knowledge/network-analysis
 * Get network analysis of the agent knowledge graph
 */
router.get("/network-analysis", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const analysis = await knowledgeGraphService.instance.getNetworkAnalysis();

    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/knowledge/domains
 * Get list of all knowledge domains with agent counts
 */
router.get("/domains", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Get unique domains from patterns
    const patternDomains = await db.select({
      domain: learningPatterns.domain,
      count: count(),
    })
    .from(learningPatterns)
    .groupBy(learningPatterns.domain)
    .orderBy(desc(count()));

    res.json({
      domains: patternDomains,
      totalDomains: patternDomains.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/knowledge/stats
 * Get knowledge system statistics
 */
router.get("/stats", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const patternStats = await db.select({
      total: count(),
      bugFixes: sql<number>`count(*) FILTER (WHERE category = 'bug_fix')`,
      optimizations: sql<number>`count(*) FILTER (WHERE category = 'optimization')`,
      features: sql<number>`count(*) FILTER (WHERE category = 'feature')`,
      patterns: sql<number>`count(*) FILTER (WHERE category = 'pattern')`,
    }).from(learningPatterns);

    const nodeStats = await db.select({
      total: count(),
    }).from(knowledgeGraphNodes);

    const edgeStats = await db.select({
      total: count(),
      reportsTo: sql<number>`count(*) FILTER (WHERE relationship_type = 'reports_to')`,
      collaborates: sql<number>`count(*) FILTER (WHERE relationship_type = 'collaborates_with')`,
      consults: sql<number>`count(*) FILTER (WHERE relationship_type = 'consults')`,
      sharesKnowledge: sql<number>`count(*) FILTER (WHERE relationship_type = 'shares_knowledge')`,
    }).from(knowledgeGraphEdges);

    res.json({
      patterns: patternStats[0],
      graph: {
        nodes: nodeStats[0].total,
        edges: edgeStats[0].total,
        relationships: edgeStats[0],
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/knowledge/statistics
 * Alias for /api/knowledge/stats - Get knowledge statistics
 */
router.get("/statistics", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const patternStats = await db.select({
      total: count(),
      bugFixes: sql<number>`count(*) FILTER (WHERE category = 'bug_fix')`,
      optimizations: sql<number>`count(*) FILTER (WHERE category = 'optimization')`,
      features: sql<number>`count(*) FILTER (WHERE category = 'feature')`,
      patterns: sql<number>`count(*) FILTER (WHERE category = 'pattern')`,
    }).from(learningPatterns);

    const nodeStats = await db.select({
      total: count(),
    }).from(knowledgeGraphNodes);

    const edgeStats = await db.select({
      total: count(),
      reportsTo: sql<number>`count(*) FILTER (WHERE relationship_type = 'reports_to')`,
      collaborates: sql<number>`count(*) FILTER (WHERE relationship_type = 'collaborates_with')`,
      consults: sql<number>`count(*) FILTER (WHERE relationship_type = 'consults')`,
      sharesKnowledge: sql<number>`count(*) FILTER (WHERE relationship_type = 'shares_knowledge')`,
    }).from(knowledgeGraphEdges);

    res.json({
      patterns: patternStats[0],
      graph: {
        nodes: nodeStats[0].total,
        edges: edgeStats[0].total,
        relationships: edgeStats[0],
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/knowledge/patterns/:id
 * Update pattern details
 */
router.patch("/patterns/:id", authenticateToken, requireRoleLevel(5), async (req: AuthRequest, res: Response) => {
  try {
    const patternId = parseInt(req.params.id);
    const updates = req.body;

    const pattern = await db.select()
      .from(learningPatterns)
      .where(eq(learningPatterns.id, patternId))
      .limit(1);

    if (!pattern || pattern.length === 0) {
      return res.status(404).json({ error: "Pattern not found" });
    }

    const [updated] = await db.update(learningPatterns)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(learningPatterns.id, patternId))
      .returning();

    res.json({
      success: true,
      pattern: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/knowledge/graph/agents
 * Get complete agent knowledge graph
 */
router.get("/graph/agents", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { limit = '50', offset = '0' } = req.query;

    const nodes = await db.select()
      .from(knowledgeGraphNodes)
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    const edges = await db.select()
      .from(knowledgeGraphEdges);

    const totalNodes = await db.select({ count: count() })
      .from(knowledgeGraphNodes);

    res.json({
      nodes,
      edges,
      totalNodes: totalNodes[0].count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/knowledge/graph/relationships/:agentId
 * Get all relationships for a specific agent
 */
router.get("/graph/relationships/:agentId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { agentId } = req.params;

    // Get agent node
    const agent = await db.select()
      .from(esaAgents)
      .where(eq(esaAgents.agentCode, agentId))
      .limit(1);

    if (!agent || agent.length === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Get agent's knowledge graph node
    const node = await db.select()
      .from(knowledgeGraphNodes)
      .where(eq(knowledgeGraphNodes.agentId, agent[0].id))
      .limit(1);

    if (!node || node.length === 0) {
      return res.json({
        agentId,
        relationships: {
          outgoing: [],
          incoming: [],
        },
        totalRelationships: 0,
      });
    }

    // Get relationships
    const outgoingEdges = await db.select({
      edge: knowledgeGraphEdges,
      targetNode: knowledgeGraphNodes,
      targetAgent: esaAgents,
    })
    .from(knowledgeGraphEdges)
    .leftJoin(knowledgeGraphNodes, eq(knowledgeGraphEdges.targetNodeId, knowledgeGraphNodes.id))
    .leftJoin(esaAgents, eq(knowledgeGraphNodes.agentId, esaAgents.id))
    .where(eq(knowledgeGraphEdges.sourceNodeId, node[0].id!));

    const incomingEdges = await db.select({
      edge: knowledgeGraphEdges,
      sourceNode: knowledgeGraphNodes,
      sourceAgent: esaAgents,
    })
    .from(knowledgeGraphEdges)
    .leftJoin(knowledgeGraphNodes, eq(knowledgeGraphEdges.sourceNodeId, knowledgeGraphNodes.id))
    .leftJoin(esaAgents, eq(knowledgeGraphNodes.agentId, esaAgents.id))
    .where(eq(knowledgeGraphEdges.targetNodeId, node[0].id!));

    res.json({
      agentId,
      relationships: {
        outgoing: outgoingEdges,
        incoming: incomingEdges,
      },
      totalRelationships: outgoingEdges.length + incomingEdges.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/knowledge/flow
 * Track knowledge flow between agents
 */
router.post("/flow", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const flowSchema = z.object({
      sourceAgentCode: z.string().min(1),
      targetAgentCode: z.string().min(1),
      knowledgeType: z.string().min(1),
      knowledgeItems: z.array(z.string()).optional(),
      success: z.boolean(),
      responseTimeMs: z.number().optional(),
      metadata: z.record(z.unknown()).optional(),
    });

    const flow = flowSchema.parse(req.body);

    await knowledgeGraphService.instance.trackKnowledgeFlow({
      sourceAgentCode: flow.sourceAgentCode,
      targetAgentCode: flow.targetAgentCode,
      knowledgeType: flow.knowledgeType,
      success: flow.success,
      responseTimeMs: flow.responseTimeMs,
    });

    res.json({
      success: true,
      message: "Knowledge flow tracked successfully",
      flow: {
        source: flow.sourceAgentCode,
        target: flow.targetAgentCode,
        type: flow.knowledgeType,
        timestamp: new Date().toISOString(),
      },
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
 * GET /api/knowledge/gaps
 * Identify knowledge gaps in the system
 */
router.get("/gaps", authenticateToken, requireRoleLevel(4), async (req: AuthRequest, res: Response) => {
  try {
    const { domain, category, minConfidence = '0.5' } = req.query;

    // Find agents with low success rates
    const strugglingAgents = await db.select({
      agentCode: esaAgents.agentCode,
      agentName: esaAgents.agentName,
      tasksCompleted: esaAgents.tasksCompleted,
      tasksSuccess: esaAgents.tasksSuccess,
      successRate: sql<number>`CASE WHEN ${esaAgents.tasksCompleted} > 0 THEN ${esaAgents.tasksSuccess}::float / ${esaAgents.tasksCompleted} ELSE 0 END`,
    })
    .from(esaAgents)
    .where(
      and(
        eq(esaAgents.status, 'active'),
        gte(esaAgents.tasksCompleted, 5)
      )
    )
    .having(sql`CASE WHEN ${esaAgents.tasksCompleted} > 0 THEN ${esaAgents.tasksSuccess}::float / ${esaAgents.tasksCompleted} ELSE 0 END < ${parseFloat(minConfidence as string)}`)
    .orderBy(sql`CASE WHEN ${esaAgents.tasksCompleted} > 0 THEN ${esaAgents.tasksSuccess}::float / ${esaAgents.tasksCompleted} ELSE 0 END ASC`)
    .limit(10);

    // Find domains with few patterns
    const domainCoverage = await db.select({
      domain: learningPatterns.domain,
      patternCount: count(),
      avgConfidence: sql<number>`AVG(${learningPatterns.confidence})`,
    })
    .from(learningPatterns)
    .groupBy(learningPatterns.domain)
    .orderBy(count());

    // Find isolated agents (no relationships)
    const allNodes = await db.select({
      id: knowledgeGraphNodes.id,
      agentCode: knowledgeGraphNodes.agentCode,
      agentName: knowledgeGraphNodes.agentName,
    }).from(knowledgeGraphNodes);

    const isolatedAgents = [];
    for (const node of allNodes) {
      const outgoing = await db.select()
        .from(knowledgeGraphEdges)
        .where(eq(knowledgeGraphEdges.sourceNodeId, node.id!))
        .limit(1);
      
      const incoming = await db.select()
        .from(knowledgeGraphEdges)
        .where(eq(knowledgeGraphEdges.targetNodeId, node.id!))
        .limit(1);

      if (outgoing.length === 0 && incoming.length === 0) {
        isolatedAgents.push({
          agentCode: node.agentCode,
          agentName: node.agentName,
        });
      }
    }

    // Find categories with low pattern coverage
    const categoryCoverage = await db.select({
      category: learningPatterns.category,
      patternCount: count(),
      avgSuccessRate: sql<number>`AVG(${learningPatterns.successRate})`,
    })
    .from(learningPatterns)
    .groupBy(learningPatterns.category)
    .orderBy(count());

    res.json({
      gaps: {
        strugglingAgents: strugglingAgents.map(a => ({
          agentCode: a.agentCode,
          agentName: a.agentName,
          successRate: a.successRate,
          tasksCompleted: a.tasksCompleted,
          recommendation: "Needs additional training patterns or expertise enhancement",
        })),
        underservedDomains: domainCoverage.filter(d => (d.patternCount as number) < 5).map(d => ({
          domain: d.domain,
          patternCount: d.patternCount,
          avgConfidence: d.avgConfidence,
          recommendation: "Create more patterns for this domain",
        })),
        isolatedAgents: isolatedAgents.map(a => ({
          ...a,
          recommendation: "Establish collaboration relationships with other agents",
        })),
        weakCategories: categoryCoverage.filter(c => (c.patternCount as number) < 10 || (c.avgSuccessRate as number) < 0.7).map(c => ({
          category: c.category,
          patternCount: c.patternCount,
          avgSuccessRate: c.avgSuccessRate,
          recommendation: c.patternCount < 10 
            ? "Increase pattern coverage in this category"
            : "Improve pattern quality in this category",
        })),
      },
      summary: {
        totalGaps: strugglingAgents.length + isolatedAgents.length,
        criticalIssues: strugglingAgents.filter(a => a.successRate < 0.3).length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
