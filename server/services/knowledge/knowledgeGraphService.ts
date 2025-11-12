/**
 * Knowledge Graph Service
 * TRACK 2 BATCH 7-9: Agent Relationship & Expertise Mapping
 * 
 * Manages the knowledge graph connecting all ESA agents through their
 * relationships, capabilities, and knowledge flows. Provides intelligent
 * routing to the best agent for any task based on expertise matching.
 * 
 * Key Features:
 * - Agent relationship mapping (reports_to, collaborates_with, etc.)
 * - Expertise routing (find best agent for specific task)
 * - Capability matching with scoring (0-1)
 * - Knowledge flow tracking between agents
 * - Graph traversal algorithms (BFS/DFS)
 * - Network analysis (centrality, importance)
 * 
 * Integration:
 * - ESA Hierarchy Manager: Authority and routing
 * - Pattern Recognition Engine: Pattern sharing via graph edges
 * - Agent Performance Tracker: Load balancing and availability
 */

import { db } from "../../../shared/db";
import { 
  knowledgeGraphNodes, 
  knowledgeGraphEdges,
  esaAgents,
  type KnowledgeGraphNode,
  type KnowledgeGraphEdge,
  type InsertKnowledgeGraphNode,
  type InsertKnowledgeGraphEdge,
} from "../../../shared/platform-schema";
import { eq, and, gte, lte, inArray, sql } from "drizzle-orm";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ExpertiseQuery {
  requiredCapabilities: string[];
  preferredExpertise?: string[];
  taskType?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  excludeAgents?: string[];
  minSuccessRate?: number;
  maxLoad?: number;
}

export interface AgentMatch {
  agentId: number;
  agentCode: string;
  agentName: string;
  matchScore: number; // 0-1 confidence
  capabilities: string[];
  expertiseAreas: string[];
  successRate: number;
  currentLoad: number;
  status: string;
  reasoning: string;
  estimatedResponseTime?: string;
}

export interface RelationshipPath {
  path: number[];
  agentCodes: string[];
  agentNames: string[];
  relationshipTypes: string[];
  totalDistance: number;
  avgStrength: number;
  estimatedHops: number;
}

export interface KnowledgeFlowMetrics {
  sourceAgent: string;
  targetAgent: string;
  relationshipType: string;
  knowledgeShared: string[];
  patternsShared: number;
  frequency: number;
  successRate: number;
  avgResponseTime: number;
  strength: number;
}

export interface NetworkAnalysis {
  totalNodes: number;
  totalEdges: number;
  avgDegree: number;
  mostConnected: Array<{ agentCode: string; connections: number }>;
  mostCentral: Array<{ agentCode: string; centrality: number }>;
  knowledgeHubs: Array<{ agentCode: string; knowledgeFlows: number }>;
  isolatedAgents: string[];
}

// ============================================================================
// KNOWLEDGE GRAPH SERVICE CLASS
// ============================================================================

export class KnowledgeGraphService {
  private agentId = "Knowledge Graph Service";
  
  // ==========================================================================
  // 1. AGENT RELATIONSHIP MAPPING
  // ==========================================================================
  
  /**
   * Initialize or update a node in the knowledge graph
   */
  async upsertNode(agentData: {
    agentId: number;
    agentCode: string;
    agentName: string;
    agentType: string;
    division?: string;
    layer?: number;
    capabilities?: string[];
    expertiseAreas?: string[];
    skills?: string[];
  }): Promise<KnowledgeGraphNode> {
    const {
      agentId,
      agentCode,
      agentName,
      agentType,
      division,
      layer,
      capabilities = [],
      expertiseAreas = [],
      skills = [],
    } = agentData;

    // Check if node exists
    const existing = await db.query.knowledgeGraphNodes.findFirst({
      where: eq(knowledgeGraphNodes.agentId, agentId),
    });

    if (existing) {
      // Update existing node
      const [updated] = await db
        .update(knowledgeGraphNodes)
        .set({
          agentCode,
          agentName,
          agentType,
          division,
          layer,
          capabilities,
          expertiseAreas,
          skills,
          updatedAt: new Date(),
        })
        .where(eq(knowledgeGraphNodes.agentId, agentId))
        .returning();
      
      console.log(`[Knowledge Graph] ✅ Updated node for ${agentCode} (${agentName})`);
      return updated;
    } else {
      // Create new node
      const [created] = await db
        .insert(knowledgeGraphNodes)
        .values({
          agentId,
          agentCode,
          agentName,
          agentType,
          nodeType: 'agent',
          division,
          layer,
          capabilities,
          expertiseAreas,
          skills,
          status: 'active',
          currentLoad: 0,
          successRate: 0,
          taskCount: 0,
          collaborationScore: 0,
          importance: 50,
        })
        .returning();
      
      console.log(`[Knowledge Graph] 🆕 Created node for ${agentCode} (${agentName})`);
      return created;
    }
  }

  /**
   * Create or update a relationship between two agents
   */
  async createRelationship(relationship: {
    sourceAgentCode: string;
    targetAgentCode: string;
    relationshipType: 'reports_to' | 'collaborates_with' | 'delegates_to' | 'consults' | 'knowledge_flow' | 'escalates_to';
    strength?: number;
    direction?: 'directed' | 'bidirectional';
    metadata?: Record<string, any>;
  }): Promise<KnowledgeGraphEdge> {
    const {
      sourceAgentCode,
      targetAgentCode,
      relationshipType,
      strength = 50,
      direction = 'directed',
      metadata = {},
    } = relationship;

    // Get node IDs from agent codes
    const sourceNode = await db.query.knowledgeGraphNodes.findFirst({
      where: eq(knowledgeGraphNodes.agentCode, sourceAgentCode),
    });
    
    const targetNode = await db.query.knowledgeGraphNodes.findFirst({
      where: eq(knowledgeGraphNodes.agentCode, targetAgentCode),
    });

    if (!sourceNode || !targetNode) {
      throw new Error(`Agent nodes not found: ${sourceAgentCode} or ${targetAgentCode}`);
    }

    // Check if edge exists
    const existing = await db.query.knowledgeGraphEdges.findFirst({
      where: and(
        eq(knowledgeGraphEdges.sourceNodeId, sourceNode.id),
        eq(knowledgeGraphEdges.targetNodeId, targetNode.id),
        eq(knowledgeGraphEdges.relationshipType, relationshipType)
      ),
    });

    if (existing) {
      // Update existing edge
      const [updated] = await db
        .update(knowledgeGraphEdges)
        .set({
          strength,
          direction,
          metadata,
          frequency: existing.frequency + 1,
          lastInteraction: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(knowledgeGraphEdges.id, existing.id))
        .returning();
      
      console.log(`[Knowledge Graph] 🔄 Updated ${relationshipType} edge: ${sourceAgentCode} → ${targetAgentCode}`);
      return updated;
    } else {
      // Create new edge
      const [created] = await db
        .insert(knowledgeGraphEdges)
        .values({
          sourceNodeId: sourceNode.id,
          targetNodeId: targetNode.id,
          relationshipType,
          strength,
          direction,
          frequency: 1,
          metadata,
          lastInteraction: new Date(),
          successfulInteractions: 0,
          failedInteractions: 0,
          patternsShared: 0,
        })
        .returning();
      
      console.log(`[Knowledge Graph] ➕ Created ${relationshipType} edge: ${sourceAgentCode} → ${targetAgentCode}`);
      return created;
    }
  }

  /**
   * Get all relationships for an agent
   */
  async getAgentRelationships(agentCode: string): Promise<{
    outgoing: KnowledgeGraphEdge[];
    incoming: KnowledgeGraphEdge[];
  }> {
    const node = await db.query.knowledgeGraphNodes.findFirst({
      where: eq(knowledgeGraphNodes.agentCode, agentCode),
    });

    if (!node) {
      throw new Error(`Agent node not found: ${agentCode}`);
    }

    const outgoing = await db.query.knowledgeGraphEdges.findMany({
      where: eq(knowledgeGraphEdges.sourceNodeId, node.id),
    });

    const incoming = await db.query.knowledgeGraphEdges.findMany({
      where: eq(knowledgeGraphEdges.targetNodeId, node.id),
    });

    return { outgoing, incoming };
  }

  // ==========================================================================
  // 2. EXPERTISE ROUTING - Find best agent for task
  // ==========================================================================
  
  /**
   * Find the best agent(s) for a given task based on expertise and capability matching
   */
  async findBestAgentForTask(query: ExpertiseQuery): Promise<AgentMatch[]> {
    const {
      requiredCapabilities,
      preferredExpertise = [],
      taskType,
      urgency = 'medium',
      excludeAgents = [],
      minSuccessRate = 0,
      maxLoad = 100,
    } = query;

    console.log(`\n[Knowledge Graph] 🔍 Finding best agent for task...`);
    console.log(`  Required Capabilities: ${requiredCapabilities.join(', ')}`);
    console.log(`  Preferred Expertise: ${preferredExpertise.join(', ')}`);
    console.log(`  Task Type: ${taskType || 'any'}`);
    console.log(`  Urgency: ${urgency}`);

    // Get all active nodes with sufficient capacity
    const candidates = await db.query.knowledgeGraphNodes.findMany({
      where: and(
        eq(knowledgeGraphNodes.status, 'active'),
        lte(knowledgeGraphNodes.currentLoad, maxLoad),
        gte(knowledgeGraphNodes.successRate, minSuccessRate)
      ),
    });

    const matches: AgentMatch[] = [];

    for (const candidate of candidates) {
      // Skip excluded agents
      if (excludeAgents.includes(candidate.agentCode)) {
        continue;
      }

      // Calculate capability match score
      const capabilityScore = this.calculateCapabilityMatch(
        requiredCapabilities,
        candidate.capabilities
      );

      // Calculate expertise match score
      const expertiseScore = this.calculateExpertiseMatch(
        preferredExpertise,
        candidate.expertiseAreas
      );

      // Calculate availability score (lower load = higher score)
      const availabilityScore = (100 - candidate.currentLoad) / 100;

      // Calculate reliability score
      const reliabilityScore = candidate.successRate / 100;

      // Weighted overall score
      const matchScore = (
        capabilityScore * 0.4 +
        expertiseScore * 0.3 +
        availabilityScore * 0.2 +
        reliabilityScore * 0.1
      );

      // Generate reasoning
      const reasoning = this.generateMatchReasoning(
        candidate,
        capabilityScore,
        expertiseScore,
        availabilityScore,
        reliabilityScore
      );

      // Estimate response time based on urgency and load
      const estimatedResponseTime = this.estimateResponseTime(
        urgency,
        candidate.currentLoad,
        candidate.avgResponseTime || 5000
      );

      matches.push({
        agentId: candidate.agentId,
        agentCode: candidate.agentCode,
        agentName: candidate.agentName,
        matchScore,
        capabilities: candidate.capabilities,
        expertiseAreas: candidate.expertiseAreas,
        successRate: candidate.successRate,
        currentLoad: candidate.currentLoad,
        status: candidate.status,
        reasoning,
        estimatedResponseTime,
      });
    }

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Log top matches
    console.log(`\n[Knowledge Graph] 📊 Top ${Math.min(3, matches.length)} Matches:`);
    for (const match of matches.slice(0, 3)) {
      console.log(`  ${match.agentCode} (${match.agentName}): ${(match.matchScore * 100).toFixed(1)}% match`);
      console.log(`    ${match.reasoning}`);
    }

    return matches;
  }

  /**
   * Calculate capability match score (0-1)
   */
  private calculateCapabilityMatch(required: string[], agentCapabilities: string[]): number {
    if (required.length === 0) return 1.0;
    
    let matches = 0;
    for (const req of required) {
      if (agentCapabilities.some(cap => 
        cap.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(cap.toLowerCase())
      )) {
        matches++;
      }
    }
    
    return matches / required.length;
  }

  /**
   * Calculate expertise match score (0-1)
   */
  private calculateExpertiseMatch(preferred: string[], agentExpertise: string[]): number {
    if (preferred.length === 0) return 1.0;
    
    let matches = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < preferred.length; i++) {
      const weight = 1 - (i * 0.1); // Earlier preferences weighted higher
      totalWeight += weight;
      
      if (agentExpertise.some(exp => 
        exp.toLowerCase().includes(preferred[i].toLowerCase()) ||
        preferred[i].toLowerCase().includes(exp.toLowerCase())
      )) {
        matches += weight;
      }
    }
    
    return totalWeight > 0 ? matches / totalWeight : 0;
  }

  /**
   * Generate reasoning for match score
   */
  private generateMatchReasoning(
    agent: KnowledgeGraphNode,
    capScore: number,
    expScore: number,
    availScore: number,
    relScore: number
  ): string {
    const reasons: string[] = [];
    
    if (capScore >= 0.8) reasons.push('strong capability match');
    else if (capScore >= 0.5) reasons.push('moderate capability match');
    else reasons.push('partial capability match');
    
    if (expScore >= 0.8) reasons.push('excellent expertise alignment');
    else if (expScore >= 0.5) reasons.push('good expertise fit');
    
    if (availScore >= 0.8) reasons.push('high availability');
    else if (availScore >= 0.5) reasons.push('moderate availability');
    else reasons.push('limited availability');
    
    if (relScore >= 0.9) reasons.push('proven track record');
    
    return reasons.join(', ');
  }

  /**
   * Estimate response time based on urgency and load
   */
  private estimateResponseTime(urgency: string, load: number, avgResponseMs: number): string {
    let baseMinutes: number;
    
    switch (urgency) {
      case 'critical':
        baseMinutes = 15;
        break;
      case 'high':
        baseMinutes = 30;
        break;
      case 'medium':
        baseMinutes = 60;
        break;
      default:
        baseMinutes = 120;
    }

    // Adjust for load
    const loadMultiplier = 1 + (load / 100);
    const adjustedMinutes = Math.round(baseMinutes * loadMultiplier);

    if (adjustedMinutes < 60) {
      return `${adjustedMinutes} minutes`;
    } else if (adjustedMinutes < 120) {
      return '1-2 hours';
    } else {
      return `${Math.round(adjustedMinutes / 60)} hours`;
    }
  }

  // ==========================================================================
  // 3. GRAPH TRAVERSAL ALGORITHMS (BFS/DFS)
  // ==========================================================================
  
  /**
   * Breadth-First Search to find shortest path between agents
   */
  async findShortestPath(
    fromAgentCode: string,
    toAgentCode: string
  ): Promise<RelationshipPath | null> {
    console.log(`\n[Knowledge Graph] 🗺️  Finding shortest path: ${fromAgentCode} → ${toAgentCode}`);

    const startNode = await db.query.knowledgeGraphNodes.findFirst({
      where: eq(knowledgeGraphNodes.agentCode, fromAgentCode),
    });
    
    const endNode = await db.query.knowledgeGraphNodes.findFirst({
      where: eq(knowledgeGraphNodes.agentCode, toAgentCode),
    });

    if (!startNode || !endNode) {
      throw new Error(`Agent nodes not found: ${fromAgentCode} or ${toAgentCode}`);
    }

    if (startNode.id === endNode.id) {
      return {
        path: [startNode.id],
        agentCodes: [startNode.agentCode],
        agentNames: [startNode.agentName],
        relationshipTypes: [],
        totalDistance: 0,
        avgStrength: 100,
        estimatedHops: 0,
      };
    }

    // BFS implementation
    const queue: Array<{ nodeId: number; path: number[]; edges: KnowledgeGraphEdge[] }> = [
      { nodeId: startNode.id, path: [startNode.id], edges: [] }
    ];
    const visited = new Set<number>([startNode.id]);

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Get all outgoing edges from current node
      const edges = await db.query.knowledgeGraphEdges.findMany({
        where: eq(knowledgeGraphEdges.sourceNodeId, current.nodeId),
      });

      for (const edge of edges) {
        if (visited.has(edge.targetNodeId)) continue;

        const newPath = [...current.path, edge.targetNodeId];
        const newEdges = [...current.edges, edge];

        // Found the target!
        if (edge.targetNodeId === endNode.id) {
          return await this.buildPathResult(newPath, newEdges);
        }

        visited.add(edge.targetNodeId);
        queue.push({
          nodeId: edge.targetNodeId,
          path: newPath,
          edges: newEdges,
        });
      }
    }

    console.log(`[Knowledge Graph] ❌ No path found between ${fromAgentCode} and ${toAgentCode}`);
    return null;
  }

  /**
   * Depth-First Search to explore all possible paths (for network analysis)
   */
  async findAllPaths(
    fromAgentCode: string,
    toAgentCode: string,
    maxDepth: number = 5
  ): Promise<RelationshipPath[]> {
    console.log(`\n[Knowledge Graph] 🌳 Finding all paths (max depth ${maxDepth}): ${fromAgentCode} → ${toAgentCode}`);

    const startNode = await db.query.knowledgeGraphNodes.findFirst({
      where: eq(knowledgeGraphNodes.agentCode, fromAgentCode),
    });
    
    const endNode = await db.query.knowledgeGraphNodes.findFirst({
      where: eq(knowledgeGraphNodes.agentCode, toAgentCode),
    });

    if (!startNode || !endNode) {
      throw new Error(`Agent nodes not found: ${fromAgentCode} or ${toAgentCode}`);
    }

    const allPaths: RelationshipPath[] = [];
    
    // DFS recursive helper
    const dfs = async (
      nodeId: number,
      path: number[],
      edges: KnowledgeGraphEdge[],
      visited: Set<number>
    ) => {
      if (path.length > maxDepth) return;

      if (nodeId === endNode.id && path.length > 1) {
        const pathResult = await this.buildPathResult(path, edges);
        allPaths.push(pathResult);
        return;
      }

      const outgoingEdges = await db.query.knowledgeGraphEdges.findMany({
        where: eq(knowledgeGraphEdges.sourceNodeId, nodeId),
      });

      for (const edge of outgoingEdges) {
        if (visited.has(edge.targetNodeId)) continue;

        visited.add(edge.targetNodeId);
        await dfs(
          edge.targetNodeId,
          [...path, edge.targetNodeId],
          [...edges, edge],
          visited
        );
        visited.delete(edge.targetNodeId);
      }
    };

    await dfs(startNode.id, [startNode.id], [], new Set([startNode.id]));

    console.log(`[Knowledge Graph] ✅ Found ${allPaths.length} paths`);
    return allPaths.sort((a, b) => a.totalDistance - b.totalDistance);
  }

  /**
   * Build path result from node IDs and edges
   */
  private async buildPathResult(
    nodePath: number[],
    edges: KnowledgeGraphEdge[]
  ): Promise<RelationshipPath> {
    // Get node details
    const nodes = await db.query.knowledgeGraphNodes.findMany({
      where: inArray(knowledgeGraphNodes.id, nodePath),
    });

    // Sort nodes to match path order
    const sortedNodes = nodePath.map(id => nodes.find(n => n.id === id)!);

    // Calculate metrics
    const totalStrength = edges.reduce((sum, e) => sum + e.strength, 0);
    const avgStrength = edges.length > 0 ? totalStrength / edges.length : 0;

    return {
      path: nodePath,
      agentCodes: sortedNodes.map(n => n.agentCode),
      agentNames: sortedNodes.map(n => n.agentName),
      relationshipTypes: edges.map(e => e.relationshipType),
      totalDistance: edges.length,
      avgStrength,
      estimatedHops: edges.length,
    };
  }

  // ==========================================================================
  // 4. KNOWLEDGE FLOW TRACKING
  // ==========================================================================
  
  /**
   * Track knowledge shared between agents
   */
  async trackKnowledgeFlow(flow: {
    sourceAgentCode: string;
    targetAgentCode: string;
    knowledgeType: string;
    success: boolean;
    responseTimeMs?: number;
  }): Promise<void> {
    const { sourceAgentCode, targetAgentCode, knowledgeType, success, responseTimeMs } = flow;

    // Get edge
    const sourceNode = await db.query.knowledgeGraphNodes.findFirst({
      where: eq(knowledgeGraphNodes.agentCode, sourceAgentCode),
    });
    
    const targetNode = await db.query.knowledgeGraphNodes.findFirst({
      where: eq(knowledgeGraphNodes.agentCode, targetAgentCode),
    });

    if (!sourceNode || !targetNode) {
      console.log(`[Knowledge Graph] ⚠️  Cannot track flow: nodes not found`);
      return;
    }

    // Find or create knowledge_flow edge
    const existingEdge = await db.query.knowledgeGraphEdges.findFirst({
      where: and(
        eq(knowledgeGraphEdges.sourceNodeId, sourceNode.id),
        eq(knowledgeGraphEdges.targetNodeId, targetNode.id),
        eq(knowledgeGraphEdges.relationshipType, 'knowledge_flow')
      ),
    });

    if (existingEdge) {
      // Update existing edge
      const newKnowledge = [...(existingEdge.knowledgeShared || []), knowledgeType];
      const uniqueKnowledge = [...new Set(newKnowledge)];
      
      await db.update(knowledgeGraphEdges)
        .set({
          frequency: existingEdge.frequency + 1,
          successfulInteractions: success 
            ? existingEdge.successfulInteractions + 1 
            : existingEdge.successfulInteractions,
          failedInteractions: success 
            ? existingEdge.failedInteractions 
            : existingEdge.failedInteractions + 1,
          knowledgeShared: uniqueKnowledge,
          lastInteraction: new Date(),
          avgResponseTime: responseTimeMs 
            ? Math.round((existingEdge.avgResponseTime || 0 + responseTimeMs) / 2)
            : existingEdge.avgResponseTime,
          strength: Math.min(100, existingEdge.strength + (success ? 2 : -1)),
          updatedAt: new Date(),
        })
        .where(eq(knowledgeGraphEdges.id, existingEdge.id));
      
      console.log(`[Knowledge Graph] 📊 Updated knowledge flow: ${sourceAgentCode} → ${targetAgentCode} (${knowledgeType})`);
    } else {
      // Create new knowledge flow edge
      await this.createRelationship({
        sourceAgentCode,
        targetAgentCode,
        relationshipType: 'knowledge_flow',
        strength: success ? 60 : 40,
        metadata: { knowledgeTypes: [knowledgeType] },
      });
    }
  }

  /**
   * Get knowledge flow metrics for an agent
   */
  async getKnowledgeFlowMetrics(agentCode: string): Promise<KnowledgeFlowMetrics[]> {
    const node = await db.query.knowledgeGraphNodes.findFirst({
      where: eq(knowledgeGraphNodes.agentCode, agentCode),
    });

    if (!node) {
      throw new Error(`Agent node not found: ${agentCode}`);
    }

    // Get all knowledge flow edges (both directions)
    const outgoing = await db.query.knowledgeGraphEdges.findMany({
      where: and(
        eq(knowledgeGraphEdges.sourceNodeId, node.id),
        eq(knowledgeGraphEdges.relationshipType, 'knowledge_flow')
      ),
    });

    const incoming = await db.query.knowledgeGraphEdges.findMany({
      where: and(
        eq(knowledgeGraphEdges.targetNodeId, node.id),
        eq(knowledgeGraphEdges.relationshipType, 'knowledge_flow')
      ),
    });

    const metrics: KnowledgeFlowMetrics[] = [];

    // Process outgoing flows
    for (const edge of outgoing) {
      const targetNode = await db.query.knowledgeGraphNodes.findFirst({
        where: eq(knowledgeGraphNodes.id, edge.targetNodeId),
      });

      if (targetNode) {
        const successRate = edge.frequency > 0
          ? (edge.successfulInteractions / edge.frequency) * 100
          : 0;

        metrics.push({
          sourceAgent: agentCode,
          targetAgent: targetNode.agentCode,
          relationshipType: 'outgoing',
          knowledgeShared: edge.knowledgeShared || [],
          patternsShared: edge.patternsShared,
          frequency: edge.frequency,
          successRate,
          avgResponseTime: edge.avgResponseTime || 0,
          strength: edge.strength,
        });
      }
    }

    // Process incoming flows
    for (const edge of incoming) {
      const sourceNode = await db.query.knowledgeGraphNodes.findFirst({
        where: eq(knowledgeGraphNodes.id, edge.sourceNodeId),
      });

      if (sourceNode) {
        const successRate = edge.frequency > 0
          ? (edge.successfulInteractions / edge.frequency) * 100
          : 0;

        metrics.push({
          sourceAgent: sourceNode.agentCode,
          targetAgent: agentCode,
          relationshipType: 'incoming',
          knowledgeShared: edge.knowledgeShared || [],
          patternsShared: edge.patternsShared,
          frequency: edge.frequency,
          successRate,
          avgResponseTime: edge.avgResponseTime || 0,
          strength: edge.strength,
        });
      }
    }

    return metrics;
  }

  // ==========================================================================
  // 5. NETWORK ANALYSIS
  // ==========================================================================
  
  /**
   * Analyze the entire knowledge graph network
   */
  async analyzeNetwork(): Promise<NetworkAnalysis> {
    console.log(`\n[Knowledge Graph] 📊 Analyzing network...`);

    const allNodes = await db.query.knowledgeGraphNodes.findMany();
    const allEdges = await db.query.knowledgeGraphEdges.findMany();

    // Calculate degree (connections) for each node
    const degreeMap = new Map<number, number>();
    for (const edge of allEdges) {
      degreeMap.set(edge.sourceNodeId, (degreeMap.get(edge.sourceNodeId) || 0) + 1);
      if (edge.direction === 'bidirectional') {
        degreeMap.set(edge.targetNodeId, (degreeMap.get(edge.targetNodeId) || 0) + 1);
      }
    }

    const avgDegree = degreeMap.size > 0
      ? Array.from(degreeMap.values()).reduce((a, b) => a + b, 0) / degreeMap.size
      : 0;

    // Most connected agents
    const mostConnected = Array.from(degreeMap.entries())
      .map(([nodeId, connections]) => {
        const node = allNodes.find(n => n.id === nodeId);
        return { agentCode: node?.agentCode || 'unknown', connections };
      })
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 5);

    // Most central agents (by centrality score)
    const mostCentral = allNodes
      .filter(n => n.centrality !== null)
      .map(n => ({ agentCode: n.agentCode, centrality: n.centrality || 0 }))
      .sort((a, b) => b.centrality - a.centrality)
      .slice(0, 5);

    // Knowledge hubs (agents with most knowledge flows)
    const knowledgeFlowCount = new Map<string, number>();
    for (const edge of allEdges) {
      if (edge.relationshipType === 'knowledge_flow') {
        const sourceNode = allNodes.find(n => n.id === edge.sourceNodeId);
        if (sourceNode) {
          knowledgeFlowCount.set(
            sourceNode.agentCode,
            (knowledgeFlowCount.get(sourceNode.agentCode) || 0) + 1
          );
        }
      }
    }

    const knowledgeHubs = Array.from(knowledgeFlowCount.entries())
      .map(([agentCode, knowledgeFlows]) => ({ agentCode, knowledgeFlows }))
      .sort((a, b) => b.knowledgeFlows - a.knowledgeFlows)
      .slice(0, 5);

    // Isolated agents (no connections)
    const isolatedAgents = allNodes
      .filter(n => !degreeMap.has(n.id))
      .map(n => n.agentCode);

    console.log(`[Knowledge Graph] ✅ Network Analysis Complete:`);
    console.log(`  Total Nodes: ${allNodes.length}`);
    console.log(`  Total Edges: ${allEdges.length}`);
    console.log(`  Average Degree: ${avgDegree.toFixed(2)}`);
    console.log(`  Isolated Agents: ${isolatedAgents.length}`);

    return {
      totalNodes: allNodes.length,
      totalEdges: allEdges.length,
      avgDegree,
      mostConnected,
      mostCentral,
      knowledgeHubs,
      isolatedAgents,
    };
  }

  /**
   * Update node performance metrics
   */
  async updateNodeMetrics(agentCode: string, metrics: {
    successRate?: number;
    currentLoad?: number;
    taskCount?: number;
    avgResponseTime?: number;
    status?: string;
  }): Promise<void> {
    const node = await db.query.knowledgeGraphNodes.findFirst({
      where: eq(knowledgeGraphNodes.agentCode, agentCode),
    });

    if (!node) {
      console.log(`[Knowledge Graph] ⚠️  Node not found for metrics update: ${agentCode}`);
      return;
    }

    await db.update(knowledgeGraphNodes)
      .set({
        ...metrics,
        updatedAt: new Date(),
      })
      .where(eq(knowledgeGraphNodes.id, node.id));

    console.log(`[Knowledge Graph] 📈 Updated metrics for ${agentCode}`);
  }

  // ==========================================================================
  // 6. INITIALIZE 105 ESA AGENTS
  // ==========================================================================
  
  /**
   * Initialize all 105 ESA agents from the hierarchy into the knowledge graph
   * This should be run once during system setup
   */
  async initializeESAGraph(): Promise<{
    nodesCreated: number;
    edgesCreated: number;
  }> {
    console.log(`\n[Knowledge Graph] 🚀 Initializing 105 ESA Agents Graph...`);
    
    // Import ESA hierarchy
    const { ESA_HIERARCHY } = await import('../esa/hierarchyManager');
    
    let nodesCreated = 0;
    let edgesCreated = 0;

    // Phase 1: Create all nodes
    console.log(`[Knowledge Graph] 📝 Phase 1: Creating nodes...`);
    
    for (const [agentCode, agentDef] of Object.entries(ESA_HIERARCHY)) {
      try {
        // Generate a unique agentId number from the agent code
        const agentId = this.generateAgentId(agentCode);
        
        await this.upsertNode({
          agentId,
          agentCode,
          agentName: agentDef.name,
          agentType: agentDef.level,
          division: agentDef.division,
          layer: agentDef.layerNumbers?.[0],
          capabilities: agentDef.expertiseAreas || [],
          expertiseAreas: agentDef.expertiseAreas || [],
          skills: agentDef.expertiseAreas || [],
        });
        
        nodesCreated++;
        
        if (nodesCreated % 20 === 0) {
          console.log(`[Knowledge Graph] 📊 Progress: ${nodesCreated} nodes created...`);
        }
      } catch (error) {
        console.error(`[Knowledge Graph] ❌ Error creating node ${agentCode}:`, error);
      }
    }

    console.log(`[Knowledge Graph] ✅ Phase 1 Complete: ${nodesCreated} nodes created`);

    // Phase 2: Create hierarchical relationships
    console.log(`\n[Knowledge Graph] 📝 Phase 2: Creating hierarchical relationships...`);
    
    for (const [agentCode, agentDef] of Object.entries(ESA_HIERARCHY)) {
      try {
        // Create "reports_to" relationships
        if (agentDef.reportingTo && agentDef.reportingTo.length > 0) {
          for (const supervisorCode of agentDef.reportingTo) {
            await this.createRelationship({
              sourceAgentCode: agentCode,
              targetAgentCode: supervisorCode,
              relationshipType: 'reports_to',
              strength: 90, // Strong hierarchical relationship
              direction: 'directed',
            });
            edgesCreated++;
          }
        }

        // Create "delegates_to" relationships (inverse of manages)
        if (agentDef.manages && agentDef.manages.length > 0) {
          for (const subordinateCode of agentDef.manages) {
            await this.createRelationship({
              sourceAgentCode: agentCode,
              targetAgentCode: subordinateCode,
              relationshipType: 'delegates_to',
              strength: 80,
              direction: 'directed',
            });
            edgesCreated++;
          }
        }
        
        if (edgesCreated % 50 === 0 && edgesCreated > 0) {
          console.log(`[Knowledge Graph] 📊 Progress: ${edgesCreated} edges created...`);
        }
      } catch (error) {
        console.error(`[Knowledge Graph] ❌ Error creating relationships for ${agentCode}:`, error);
      }
    }

    // Phase 3: Create expertise-based collaboration suggestions
    console.log(`\n[Knowledge Graph] 📝 Phase 3: Creating expertise-based connections...`);
    
    const allAgents = Object.entries(ESA_HIERARCHY);
    
    // Find agents with overlapping expertise areas
    for (const [agentCode1, agentDef1] of allAgents) {
      if (!agentDef1.expertiseAreas) continue;
      
      for (const [agentCode2, agentDef2] of allAgents) {
        if (agentCode1 === agentCode2 || !agentDef2.expertiseAreas) continue;
        
        // Calculate expertise overlap
        const overlap = agentDef1.expertiseAreas.filter(area => 
          agentDef2.expertiseAreas?.includes(area)
        );
        
        // Create collaboration relationship if significant overlap
        if (overlap.length >= 2) {
          try {
            await this.createRelationship({
              sourceAgentCode: agentCode1,
              targetAgentCode: agentCode2,
              relationshipType: 'collaborates_with',
              strength: overlap.length * 15, // Strength based on overlap count
              direction: 'bidirectional',
              metadata: { sharedExpertise: overlap },
            });
            edgesCreated++;
          } catch (error) {
            // May already exist, ignore
          }
        }
      }
    }

    console.log(`[Knowledge Graph] ✅ Phase 2 Complete: ${edgesCreated} edges created`);
    console.log(`\n[Knowledge Graph] 🎉 INITIALIZATION COMPLETE`);
    console.log(`  Total Nodes: ${nodesCreated}`);
    console.log(`  Total Edges: ${edgesCreated}`);
    console.log(`  Graph Density: ${(edgesCreated / (nodesCreated * (nodesCreated - 1))).toFixed(4)}`);

    return { nodesCreated, edgesCreated };
  }

  /**
   * Generate a unique agent ID number from agent code
   */
  private generateAgentId(agentCode: string): number {
    // Extract number from agent code or use hash
    const match = agentCode.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }
    
    // For non-numeric codes, generate from hash
    let hash = 0;
    for (let i = 0; i < agentCode.length; i++) {
      hash = ((hash << 5) - hash) + agentCode.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % 100000;
  }

  // ==========================================================================
  // 7. IDENTIFY KNOWLEDGE GAPS
  // ==========================================================================
  
  /**
   * Identify areas where expertise is lacking or missing
   */
  async identifyKnowledgeGaps(): Promise<{
    underservedDomains: Array<{
      domain: string;
      expertCount: number;
      requiredExperts: number;
      gap: number;
    }>;
    isolatedExperts: Array<{
      agentCode: string;
      agentName: string;
      expertise: string[];
      connections: number;
    }>;
    criticalGaps: string[];
  }> {
    console.log(`\n[Knowledge Graph] 🔍 Identifying knowledge gaps...`);

    const allNodes = await db.query.knowledgeGraphNodes.findMany();
    const allEdges = await db.query.knowledgeGraphEdges.findMany();

    // Analyze expertise coverage by domain
    const expertiseByDomain = new Map<string, Set<string>>();
    
    for (const node of allNodes) {
      const domain = node.division || 'Unknown';
      if (!expertiseByDomain.has(domain)) {
        expertiseByDomain.set(domain, new Set());
      }
      for (const expertise of node.expertiseAreas) {
        expertiseByDomain.get(domain)!.add(expertise);
      }
    }

    // Calculate required vs actual expert count
    const domainRequirements = {
      'Foundation': 15,
      'Core': 12,
      'Business': 12,
      'Intelligence': 20,
      'Platform': 12,
      'Extended': 8,
    };

    const underservedDomains = [];
    for (const [domain, requiredExperts] of Object.entries(domainRequirements)) {
      const expertCount = allNodes.filter(n => n.division === domain).length;
      const gap = requiredExperts - expertCount;
      
      if (gap > 0) {
        underservedDomains.push({
          domain,
          expertCount,
          requiredExperts,
          gap,
        });
      }
    }

    // Find isolated experts (low connection count)
    const connectionCounts = new Map<number, number>();
    for (const edge of allEdges) {
      connectionCounts.set(
        edge.sourceNodeId,
        (connectionCounts.get(edge.sourceNodeId) || 0) + 1
      );
      if (edge.direction === 'bidirectional') {
        connectionCounts.set(
          edge.targetNodeId,
          (connectionCounts.get(edge.targetNodeId) || 0) + 1
        );
      }
    }

    const isolatedExperts = allNodes
      .filter(node => (connectionCounts.get(node.id) || 0) < 3)
      .map(node => ({
        agentCode: node.agentCode,
        agentName: node.agentName,
        expertise: node.expertiseAreas,
        connections: connectionCounts.get(node.id) || 0,
      }))
      .sort((a, b) => a.connections - b.connections);

    // Identify critical expertise gaps
    const allExpertise = new Set<string>();
    for (const node of allNodes) {
      node.expertiseAreas.forEach(exp => allExpertise.add(exp));
    }

    const expertiseCoverage = new Map<string, number>();
    for (const node of allNodes) {
      for (const exp of node.expertiseAreas) {
        expertiseCoverage.set(exp, (expertiseCoverage.get(exp) || 0) + 1);
      }
    }

    const criticalGaps = Array.from(expertiseCoverage.entries())
      .filter(([_, count]) => count < 2) // Less than 2 experts
      .map(([expertise, _]) => expertise);

    console.log(`\n[Knowledge Graph] 📊 KNOWLEDGE GAPS ANALYSIS:`);
    console.log(`  Underserved Domains: ${underservedDomains.length}`);
    console.log(`  Isolated Experts: ${isolatedExperts.length}`);
    console.log(`  Critical Expertise Gaps: ${criticalGaps.length}`);

    if (underservedDomains.length > 0) {
      console.log(`\n  Top Underserved Domains:`);
      underservedDomains.slice(0, 3).forEach(d => {
        console.log(`    - ${d.domain}: ${d.gap} experts needed (has ${d.expertCount}/${d.requiredExperts})`);
      });
    }

    if (isolatedExperts.length > 0) {
      console.log(`\n  Most Isolated Experts:`);
      isolatedExperts.slice(0, 3).forEach(e => {
        console.log(`    - ${e.agentCode} (${e.agentName}): ${e.connections} connections`);
      });
    }

    return {
      underservedDomains,
      isolatedExperts,
      criticalGaps,
    };
  }

  // ==========================================================================
  // 8. SUGGEST AGENT COLLABORATIONS
  // ==========================================================================
  
  /**
   * Suggest beneficial collaborations between agents based on complementary expertise
   */
  async suggestCollaborations(agentCode: string, limit: number = 5): Promise<Array<{
    partnerCode: string;
    partnerName: string;
    matchScore: number;
    reasoning: string;
    sharedExpertise: string[];
    complementaryExpertise: string[];
    potentialProjects: string[];
  }>> {
    console.log(`\n[Knowledge Graph] 🤝 Finding collaboration opportunities for ${agentCode}...`);

    const sourceNode = await db.query.knowledgeGraphNodes.findFirst({
      where: eq(knowledgeGraphNodes.agentCode, agentCode),
    });

    if (!sourceNode) {
      throw new Error(`Agent node not found: ${agentCode}`);
    }

    // Get all other nodes
    const allNodes = await db.query.knowledgeGraphNodes.findMany();
    const candidates = allNodes.filter(n => n.agentCode !== agentCode);

    // Check existing collaborations
    const existing = await this.getAgentRelationships(agentCode);
    const existingPartners = new Set([
      ...existing.outgoing.map(e => e.targetNodeId),
      ...existing.incoming.map(e => e.sourceNodeId),
    ]);

    const suggestions = [];

    for (const candidate of candidates) {
      // Skip if already collaborating
      if (existingPartners.has(candidate.id)) continue;

      // Calculate shared expertise
      const shared = sourceNode.expertiseAreas.filter(exp =>
        candidate.expertiseAreas.includes(exp)
      );

      // Calculate complementary expertise
      const complementary = candidate.expertiseAreas.filter(exp =>
        !sourceNode.expertiseAreas.includes(exp)
      );

      // Calculate match score
      const sharedScore = shared.length * 0.3;
      const complementaryScore = Math.min(complementary.length, 5) * 0.2;
      const divisionBonus = sourceNode.division === candidate.division ? 0.2 : 0;
      const layerProximity = Math.abs(
        (sourceNode.layer || 0) - (candidate.layer || 0)
      ) <= 5 ? 0.3 : 0;

      const matchScore = sharedScore + complementaryScore + divisionBonus + layerProximity;

      // Only suggest if match score is above threshold
      if (matchScore > 0.5) {
        suggestions.push({
          partnerCode: candidate.agentCode,
          partnerName: candidate.agentName,
          matchScore,
          reasoning: this.generateCollaborationReasoning(
            sourceNode,
            candidate,
            shared,
            complementary
          ),
          sharedExpertise: shared,
          complementaryExpertise: complementary.slice(0, 5),
          potentialProjects: this.suggestProjects(shared, complementary),
        });
      }
    }

    // Sort by match score
    suggestions.sort((a, b) => b.matchScore - a.matchScore);

    // Return top matches
    const topSuggestions = suggestions.slice(0, limit);

    console.log(`\n[Knowledge Graph] 💡 Top ${topSuggestions.length} Collaboration Suggestions:`);
    topSuggestions.forEach((s, i) => {
      console.log(`\n  ${i + 1}. ${s.partnerCode} (${s.partnerName})`);
      console.log(`     Match Score: ${(s.matchScore * 100).toFixed(1)}%`);
      console.log(`     ${s.reasoning}`);
    });

    return topSuggestions;
  }

  /**
   * Generate reasoning for collaboration suggestion
   */
  private generateCollaborationReasoning(
    source: KnowledgeGraphNode,
    candidate: KnowledgeGraphNode,
    shared: string[],
    complementary: string[]
  ): string {
    const reasons: string[] = [];

    if (shared.length > 2) {
      reasons.push(`Strong overlap in ${shared.length} expertise areas`);
    } else if (shared.length > 0) {
      reasons.push(`Some shared expertise in ${shared.join(', ')}`);
    }

    if (complementary.length > 3) {
      reasons.push(`Highly complementary skills`);
    } else if (complementary.length > 0) {
      reasons.push(`Complementary in ${complementary.slice(0, 2).join(', ')}`);
    }

    if (source.division === candidate.division) {
      reasons.push(`Same division (${source.division})`);
    }

    if (Math.abs((source.layer || 0) - (candidate.layer || 0)) <= 3) {
      reasons.push(`Similar architectural layer`);
    }

    return reasons.join('; ');
  }

  /**
   * Suggest potential projects based on expertise
   */
  private suggestProjects(shared: string[], complementary: string[]): string[] {
    const projects: string[] = [];

    // Project suggestions based on shared expertise
    if (shared.includes('ai') || shared.includes('ml')) {
      projects.push('AI-powered feature development');
    }
    if (shared.includes('frontend') || shared.includes('ui')) {
      projects.push('UI component library enhancement');
    }
    if (shared.includes('performance') || shared.includes('optimization')) {
      projects.push('System optimization initiative');
    }

    // Project suggestions based on complementary skills
    if (
      (shared.includes('backend') && complementary.includes('frontend')) ||
      (shared.includes('frontend') && complementary.includes('backend'))
    ) {
      projects.push('Full-stack feature implementation');
    }

    return projects.slice(0, 3);
  }

  // ==========================================================================
  // 9. TRACK KNOWLEDGE TRANSFER EFFICIENCY
  // ==========================================================================
  
  /**
   * Track and analyze knowledge transfer efficiency across the network
   */
  async trackTransferEfficiency(timeWindowDays: number = 30): Promise<{
    overallEfficiency: number;
    totalTransfers: number;
    successfulTransfers: number;
    topPerformers: Array<{
      agentCode: string;
      agentName: string;
      transfersCompleted: number;
      successRate: number;
      avgResponseTime: number;
    }>;
    bottlenecks: Array<{
      agentCode: string;
      agentName: string;
      pendingTransfers: number;
      avgDelayHours: number;
    }>;
    recommendations: string[];
  }> {
    console.log(`\n[Knowledge Graph] 📈 Analyzing knowledge transfer efficiency (last ${timeWindowDays} days)...`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeWindowDays);

    // Get all knowledge flow edges
    const knowledgeFlows = await db.query.knowledgeGraphEdges.findMany({
      where: and(
        eq(knowledgeGraphEdges.relationshipType, 'knowledge_flow'),
        gte(knowledgeGraphEdges.lastInteraction, cutoffDate)
      ),
    });

    const totalTransfers = knowledgeFlows.reduce((sum, flow) => sum + flow.frequency, 0);
    const successfulTransfers = knowledgeFlows.reduce(
      (sum, flow) => sum + flow.successfulInteractions,
      0
    );
    const overallEfficiency = totalTransfers > 0 
      ? successfulTransfers / totalTransfers 
      : 0;

    // Calculate per-agent metrics
    const agentMetrics = new Map<number, {
      transfers: number;
      successful: number;
      totalResponseTime: number;
    }>();

    for (const flow of knowledgeFlows) {
      // Source agent metrics
      const sourceMetric = agentMetrics.get(flow.sourceNodeId) || {
        transfers: 0,
        successful: 0,
        totalResponseTime: 0,
      };
      sourceMetric.transfers += flow.frequency;
      sourceMetric.successful += flow.successfulInteractions;
      sourceMetric.totalResponseTime += (flow.avgResponseTime || 0) * flow.frequency;
      agentMetrics.set(flow.sourceNodeId, sourceMetric);
    }

    // Get top performers
    const allNodes = await db.query.knowledgeGraphNodes.findMany();
    const topPerformers = [];

    for (const [nodeId, metrics] of Array.from(agentMetrics.entries())) {
      const node = allNodes.find(n => n.id === nodeId);
      if (!node || metrics.transfers === 0) continue;

      const successRate = metrics.successful / metrics.transfers;
      const avgResponseTime = metrics.totalResponseTime / metrics.transfers;

      if (successRate > 0.7 && metrics.transfers >= 5) {
        topPerformers.push({
          agentCode: node.agentCode,
          agentName: node.agentName,
          transfersCompleted: metrics.transfers,
          successRate,
          avgResponseTime,
        });
      }
    }

    topPerformers.sort((a, b) => b.successRate - a.successRate);

    // Identify bottlenecks (agents with high load but low completion)
    const bottlenecks = allNodes
      .filter(node => node.currentLoad > 70)
      .map(node => ({
        agentCode: node.agentCode,
        agentName: node.agentName,
        pendingTransfers: Math.round(node.currentLoad / 10),
        avgDelayHours: Math.round((node.avgResponseTime || 5000) / 1000 / 60 / 60),
      }))
      .filter(b => b.pendingTransfers > 5)
      .sort((a, b) => b.pendingTransfers - a.pendingTransfers);

    // Generate recommendations
    const recommendations: string[] = [];

    if (overallEfficiency < 0.7) {
      recommendations.push(`Overall transfer efficiency is low (${(overallEfficiency * 100).toFixed(1)}%). Consider implementing automated knowledge capture.`);
    }

    if (bottlenecks.length > 3) {
      recommendations.push(`${bottlenecks.length} agents are overloaded. Redistribute workload or add capacity.`);
    }

    if (topPerformers.length > 0) {
      const topAgent = topPerformers[0];
      recommendations.push(`Leverage ${topAgent.agentCode}'s expertise (${(topAgent.successRate * 100).toFixed(1)}% success rate) for mentoring.`);
    }

    const isolatedCount = allNodes.filter(n => (agentMetrics.get(n.id)?.transfers || 0) === 0).length;
    if (isolatedCount > 10) {
      recommendations.push(`${isolatedCount} agents have no knowledge transfers. Encourage cross-team collaboration.`);
    }

    console.log(`\n[Knowledge Graph] 📊 TRANSFER EFFICIENCY ANALYSIS:`);
    console.log(`  Overall Efficiency: ${(overallEfficiency * 100).toFixed(1)}%`);
    console.log(`  Total Transfers: ${totalTransfers}`);
    console.log(`  Successful: ${successfulTransfers}`);
    console.log(`  Top Performers: ${topPerformers.length}`);
    console.log(`  Bottlenecks: ${bottlenecks.length}`);

    return {
      overallEfficiency,
      totalTransfers,
      successfulTransfers,
      topPerformers: topPerformers.slice(0, 5),
      bottlenecks: bottlenecks.slice(0, 5),
      recommendations,
    };
  }
}

// ============================================================================
// SINGLETON EXPORT (Lazy initialization to avoid blocking during module load)
// ============================================================================

let knowledgeGraphServiceInstance: KnowledgeGraphService | null = null;

export function getKnowledgeGraphService(): KnowledgeGraphService {
  if (!knowledgeGraphServiceInstance) {
    knowledgeGraphServiceInstance = new KnowledgeGraphService();
  }
  return knowledgeGraphServiceInstance;
}

// For backward compatibility - lazy getter
export const knowledgeGraphService = {
  get instance() {
    return getKnowledgeGraphService();
  }
};

export default knowledgeGraphService;
