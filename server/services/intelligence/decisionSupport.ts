/**
 * DECISION SUPPORT ENGINE
 * TRACK 2 BATCH 10-12: Knowledge Infrastructure Services (Part 2)
 * 
 * Multi-agent consensus building and conflict resolution for collaborative decision-making.
 * 
 * Core Features:
 * - Multi-agent voting and consensus building
 * - Conflict resolution (voting, priority, authority, human escalation)
 * - Priority queue management
 * - Strategic alignment checking
 * - Complete decision audit trail
 * 
 * Integration Points:
 * - Agent Collaboration Service
 * - Agent Communication Protocol (A2A)
 * - BullMQ (deadline management)
 */

import { db } from "../../../shared/db";
import { agentDecisions } from "../../../shared/schema";
import type { 
  InsertAgentDecision,
  SelectAgentDecision 
} from "../../../shared/schema";
import { eq, desc, and, gte, lte, inArray, sql, isNull } from "drizzle-orm";
import { Queue, Worker, Job } from "bullmq";
import { getRedisConnection, isRedisAvailable } from "../../workers/redis-fallback";
import { 
  validateAuthority, 
  ESA_HIERARCHY,
  type AgentLevel,
  type AuthorityMatrix 
} from "../esa/hierarchyManager";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CreateDecisionOptions {
  decisionType: 'feature_approval' | 'conflict_resolution' | 'priority_assignment' | 'resource_allocation' | 'custom';
  decisionContext: string;
  decisionQuestion: string;
  initiatedBy: string;
  participatingAgents: string[];
  requiredConsensus?: number; // 0-1, default 0.66 (66%)
  votingMechanism?: 'unanimous' | 'majority' | 'weighted' | 'authority';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  deadline?: Date;
  strategicContext?: {
    category: string;
    reasoning: string;
  };
}

export interface CastVoteOptions {
  decisionId: string;
  agentId: string;
  vote: 'approve' | 'reject' | 'abstain' | 'defer';
  weight?: number; // For weighted voting, default 1.0
  reasoning: string;
}

export interface ConflictResolutionResult {
  decision: 'approve' | 'reject' | 'defer' | 'escalate';
  consensusReached: boolean;
  consensusLevel: number; // 0-1
  reasoning: string;
  conflictResolved: boolean;
}

export interface DecisionMetrics {
  totalDecisions: number;
  pendingDecisions: number;
  decidedToday: number;
  avgDecisionTime: number; // milliseconds
  consensusRate: number; // 0-1
  escalationRate: number; // 0-1
  topDecisionTypes: Array<{ type: string; count: number }>;
}

export interface AgentAuthorityValidation {
  agentId: string;
  hasAuthority: boolean;
  level: AgentLevel;
  authorityScore: number; // 0-1, based on level and expertise
  canEscalate: boolean;
  escalationPath?: string[];
  reasoning: string;
}

export interface RecommendedAgents {
  agentIds: string[];
  reasoning: string;
  expertiseMatch: Record<string, number>; // agentId -> match score
}

// ============================================================================
// QUEUE SETUP
// ============================================================================

const QUEUE_NAME = 'agent-decisions';
let decisionQueue: Queue | null = null;

function initializeQueue() {
  if (decisionQueue) return decisionQueue;

  if (isRedisAvailable()) {
    const redis = getRedisConnection();
    if (redis) {
      decisionQueue = new Queue(QUEUE_NAME, { connection: redis });
      console.log('✅ [Decision Support] BullMQ queue initialized');
    }
  }

  return decisionQueue;
}

// ============================================================================
// CORE FUNCTION 1: CREATE DECISION
// ============================================================================

/**
 * Creates a new decision requiring multi-agent consensus
 * 
 * @example
 * ```typescript
 * const decision = await createDecision({
 *   decisionType: 'feature_approval',
 *   decisionContext: 'New real-time collaboration feature',
 *   decisionQuestion: 'Should we implement WebSocket-based real-time editing?',
 *   initiatedBy: 'AGENT_11',
 *   participatingAgents: ['AGENT_54', 'AGENT_55', 'AGENT_56'],
 *   priority: 'high',
 *   deadline: new Date(Date.now() + 24*3600000) // 24 hours
 * });
 * ```
 */
export async function createDecision(options: CreateDecisionOptions): Promise<SelectAgentDecision> {
  console.log(`[Decision Support] 🗳️  Creating decision: ${options.decisionQuestion.slice(0, 60)}...`);

  // Validate initiating agent has authority
  const initiatorAuthority = await validateAgentAuthority(
    options.initiatedBy,
    options.decisionType,
    options.priority || 'medium'
  );

  if (!initiatorAuthority.hasAuthority && options.priority === 'critical') {
    throw new Error(`Agent ${options.initiatedBy} lacks authority to initiate critical decisions. ${initiatorAuthority.reasoning}`);
  }

  // Generate unique decision ID
  const decisionId = `DEC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const votesRequired = options.participatingAgents.length;
  const requiredConsensus = options.requiredConsensus || 0.66;

  // Check strategic alignment if context provided
  let alignsWithStrategy = null;
  let strategicAlignment = null;
  let alignmentScore = null;

  if (options.strategicContext) {
    const alignment = await checkStrategicAlignment(
      options.decisionType,
      options.decisionContext,
      options.strategicContext
    );
    alignsWithStrategy = alignment.aligns;
    strategicAlignment = alignment;
    alignmentScore = alignment.score;
  }

  // Calculate priority score for queue management
  const priorityScore = calculatePriorityScore({
    priority: options.priority || 'medium',
    deadline: options.deadline,
    alignmentScore
  });

  // Create decision record
  const [decision] = await db
    .insert(agentDecisions)
    .values({
      decisionId,
      decisionType: options.decisionType,
      decisionContext: options.decisionContext,
      decisionQuestion: options.decisionQuestion,
      initiatedBy: options.initiatedBy,
      participatingAgents: options.participatingAgents,
      requiredConsensus,
      votingMechanism: options.votingMechanism || 'majority',
      votes: {},
      votesCast: 0,
      votesRequired,
      priority: options.priority || 'medium',
      deadline: options.deadline || null,
      priorityScore,
      alignsWithStrategy,
      strategicAlignment,
      alignmentScore,
      status: 'voting',
      consensusReached: false,
      decisionLog: [
        {
          timestamp: new Date().toISOString(),
          event: 'decision_created',
          actor: options.initiatedBy,
          details: {
            question: options.decisionQuestion,
            participatingAgents: options.participatingAgents
          }
        }
      ]
    })
    .returning();

  // Queue deadline check if deadline is set
  if (options.deadline) {
    await scheduleDeadlineCheck(decision);
  }

  console.log(`[Decision Support] ✅ Created decision ${decisionId} with ${votesRequired} voters`);

  return decision;
}

// ============================================================================
// CORE FUNCTION 2: CAST VOTE
// ============================================================================

/**
 * Records a vote from an agent on a pending decision
 */
export async function castVote(options: CastVoteOptions): Promise<SelectAgentDecision> {
  console.log(`[Decision Support] 🗳️  ${options.agentId} voting ${options.vote} on ${options.decisionId}`);

  const decisions = await db
    .select()
    .from(agentDecisions)
    .where(eq(agentDecisions.decisionId, options.decisionId))
    .limit(1);

  if (decisions.length === 0) {
    throw new Error(`Decision not found: ${options.decisionId}`);
  }

  const decision = decisions[0];

  // Validate agent is participating
  if (!decision.participatingAgents.includes(options.agentId)) {
    throw new Error(`Agent ${options.agentId} is not a participant in this decision`);
  }

  // Validate decision is still open for voting
  if (!['pending', 'voting'].includes(decision.status || 'pending')) {
    throw new Error(`Decision ${options.decisionId} is not open for voting (status: ${decision.status})`);
  }

  // Record vote
  const votes = (decision.votes as Record<string, any>) || {};
  const weight = options.weight || 1.0;

  votes[options.agentId] = {
    vote: options.vote,
    weight,
    reasoning: options.reasoning,
    timestamp: new Date().toISOString()
  };

  const votesCast = Object.keys(votes).length;

  // Update decision log
  const decisionLog = (decision.decisionLog as any[]) || [];
  decisionLog.push({
    timestamp: new Date().toISOString(),
    event: 'vote_cast',
    actor: options.agentId,
    details: {
      vote: options.vote,
      reasoning: options.reasoning
    }
  });

  // Update decision
  await db
    .update(agentDecisions)
    .set({
      votes,
      votesCast,
      decisionLog,
      updatedAt: new Date()
    })
    .where(eq(agentDecisions.id, decision.id));

  // Check if consensus is reached
  if (votesCast === decision.votesRequired) {
    return await finalizeDecision(decision.id);
  }

  // Return updated decision
  const [updated] = await db
    .select()
    .from(agentDecisions)
    .where(eq(agentDecisions.id, decision.id))
    .limit(1);

  return updated;
}

// ============================================================================
// CORE FUNCTION 3: RESOLVE CONFLICT
// ============================================================================

/**
 * Resolves conflicts when consensus cannot be reached through voting
 * Uses configured conflict resolution strategy
 */
export async function resolveConflict(decisionId: string): Promise<ConflictResolutionResult> {
  console.log(`[Decision Support] ⚖️  Resolving conflict for ${decisionId}`);

  const decisions = await db
    .select()
    .from(agentDecisions)
    .where(eq(agentDecisions.decisionId, decisionId))
    .limit(1);

  if (decisions.length === 0) {
    throw new Error(`Decision not found: ${decisionId}`);
  }

  const decision = decisions[0];
  const votes = (decision.votes as Record<string, any>) || {};

  // Analyze votes
  const voteAnalysis = analyzeVotes(votes, decision.votingMechanism || 'majority');

  let result: ConflictResolutionResult;

  if (voteAnalysis.consensusLevel >= (decision.requiredConsensus ?? 0.66)) {
    // Consensus reached
    result = {
      decision: voteAnalysis.majorityVote as any,
      consensusReached: true,
      consensusLevel: voteAnalysis.consensusLevel,
      reasoning: `Consensus reached with ${Math.round(voteAnalysis.consensusLevel * 100)}% agreement`,
      conflictResolved: true
    };
  } else {
    // Apply conflict resolution strategy
    const strategy = decision.conflictResolutionStrategy || 'vote';

    switch (strategy) {
      case 'vote':
        // Use simple majority
        result = {
          decision: voteAnalysis.majorityVote as any,
          consensusReached: false,
          consensusLevel: voteAnalysis.consensusLevel,
          reasoning: `Majority vote: ${voteAnalysis.majorityVote} (${Math.round(voteAnalysis.consensusLevel * 100)}%)`,
          conflictResolved: true
        };
        break;

      case 'priority':
        // Higher priority agents' votes count more
        result = {
          decision: voteAnalysis.weightedMajority as any,
          consensusReached: false,
          consensusLevel: voteAnalysis.weightedConsensus,
          reasoning: 'Decided by weighted priority voting',
          conflictResolved: true
        };
        break;

      case 'authority':
        // Escalate to highest authority agent
        result = {
          decision: 'defer',
          consensusReached: false,
          consensusLevel: voteAnalysis.consensusLevel,
          reasoning: 'Deferred to authority for final decision',
          conflictResolved: false
        };
        break;

      case 'human_escalation':
      default:
        // Escalate to human
        result = {
          decision: 'escalate',
          consensusReached: false,
          consensusLevel: voteAnalysis.consensusLevel,
          reasoning: 'Escalated to human due to lack of consensus',
          conflictResolved: false
        };
        break;
    }
  }

  // Update decision with conflict resolution result
  const decisionLog = (decision.decisionLog as any[]) || [];
  decisionLog.push({
    timestamp: new Date().toISOString(),
    event: 'conflict_resolved',
    actor: 'DECISION_ENGINE',
    details: result
  });

  await db
    .update(agentDecisions)
    .set({
      hasConflict: !result.conflictResolved,
      conflictDetails: result,
      decision: result.decision,
      consensusReached: result.consensusReached,
      consensusLevel: result.consensusLevel,
      finalReasoning: result.reasoning,
      decisionLog,
      status: result.decision === 'escalate' ? 'escalated' : 'decided',
      decidedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(agentDecisions.id, decision.id));

  console.log(`[Decision Support] ✅ Conflict resolved: ${result.decision}`);

  return result;
}

// ============================================================================
// CORE FUNCTION 4: CHECK STRATEGIC ALIGNMENT
// ============================================================================

/**
 * Checks if a decision aligns with strategic goals
 */
export async function checkStrategicAlignment(
  decisionType: string,
  context: string,
  strategicContext: { category: string; reasoning: string }
): Promise<{ aligns: boolean; score: number; category: string; reasoning: string }> {
  console.log(`[Decision Support] 🎯 Checking strategic alignment for ${decisionType}`);

  // Strategic alignment scoring (simplified - in production would use more sophisticated analysis)
  const alignmentCategories: Record<string, string[]> = {
    user_experience: ['accessibility', 'performance', 'ui', 'usability'],
    technical_excellence: ['code_quality', 'architecture', 'testing', 'security'],
    collaboration: ['team', 'communication', 'knowledge_sharing'],
    innovation: ['new_features', 'research', 'experimentation']
  };

  const category = strategicContext.category;
  const keywords = alignmentCategories[category] || [];

  // Simple keyword matching for alignment score
  const contextLower = context.toLowerCase();
  const matchCount = keywords.filter(kw => contextLower.includes(kw)).length;
  const score = Math.min(matchCount / keywords.length, 1.0);

  const aligns = score >= 0.5;

  console.log(`[Decision Support] 📊 Alignment score: ${Math.round(score * 100)}% (${aligns ? 'ALIGNED' : 'NOT ALIGNED'})`);

  return {
    aligns,
    score,
    category,
    reasoning: strategicContext.reasoning
  };
}

// ============================================================================
// CORE FUNCTION 5: GET DECISION METRICS
// ============================================================================

/**
 * Retrieves decision-making metrics for monitoring
 */
export async function getDecisionMetrics(): Promise<DecisionMetrics> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 3600000);

  // Get all decisions
  const allDecisions = await db
    .select()
    .from(agentDecisions)
    .limit(1000);

  const totalDecisions = allDecisions.length;
  const pendingDecisions = allDecisions.filter(d => ['pending', 'voting'].includes(d.status || 'pending')).length;
  const decidedToday = allDecisions.filter(d => 
    d.decidedAt && d.decidedAt >= oneDayAgo
  ).length;

  // Calculate average decision time
  const decidedDecisions = allDecisions.filter(d => d.decidedAt);
  const avgDecisionTime = decidedDecisions.length > 0
    ? decidedDecisions.reduce((sum, d) => {
        const duration = d.decidedAt!.getTime() - d.createdAt.getTime();
        return sum + duration;
      }, 0) / decidedDecisions.length
    : 0;

  // Calculate consensus rate
  const consensusCount = allDecisions.filter(d => d.consensusReached).length;
  const consensusRate = totalDecisions > 0 ? consensusCount / totalDecisions : 0;

  // Calculate escalation rate
  const escalatedCount = allDecisions.filter(d => d.status === 'escalated').length;
  const escalationRate = totalDecisions > 0 ? escalatedCount / totalDecisions : 0;

  // Top decision types
  const typeCounts = allDecisions.reduce((acc, d) => {
    acc[d.decisionType] = (acc[d.decisionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDecisionTypes = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalDecisions,
    pendingDecisions,
    decidedToday,
    avgDecisionTime,
    consensusRate,
    escalationRate,
    topDecisionTypes
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Finalizes a decision when all votes are cast
 */
async function finalizeDecision(decisionId: number): Promise<SelectAgentDecision> {
  const decisions = await db
    .select()
    .from(agentDecisions)
    .where(eq(agentDecisions.id, decisionId))
    .limit(1);

  if (decisions.length === 0) {
    throw new Error(`Decision not found: ${decisionId}`);
  }

  const decision = decisions[0];
  const votes = (decision.votes as Record<string, any>) || {};
  const analysis = analyzeVotes(votes, decision.votingMechanism || 'majority');

  const consensusReached = analysis.consensusLevel >= (decision.requiredConsensus ?? 0.66);
  const finalDecision = consensusReached ? analysis.majorityVote : 'defer';

  const decisionLog = (decision.decisionLog as any[]) || [];
  decisionLog.push({
    timestamp: new Date().toISOString(),
    event: 'decision_finalized',
    actor: 'DECISION_ENGINE',
    details: {
      consensusReached,
      consensusLevel: analysis.consensusLevel,
      decision: finalDecision
    }
  });

  await db
    .update(agentDecisions)
    .set({
      decision: finalDecision as any,
      consensusReached,
      consensusLevel: analysis.consensusLevel,
      finalReasoning: consensusReached
        ? `Consensus reached with ${Math.round(analysis.consensusLevel * 100)}% agreement`
        : 'No consensus - decision deferred',
      status: consensusReached ? 'decided' : 'voting',
      decidedAt: consensusReached ? new Date() : null,
      decisionLog,
      updatedAt: new Date()
    })
    .where(eq(agentDecisions.id, decisionId));

  // If no consensus, may need conflict resolution
  if (!consensusReached && decision.conflictResolutionStrategy) {
    await resolveConflict(decision.decisionId);
  }

  const [updated] = await db
    .select()
    .from(agentDecisions)
    .where(eq(agentDecisions.id, decisionId))
    .limit(1);

  console.log(`[Decision Support] ✅ Decision finalized: ${finalDecision}`);

  return updated;
}

/**
 * Analyzes votes to determine consensus and majority
 */
function analyzeVotes(votes: Record<string, any>, mechanism: string): {
  majorityVote: string;
  consensusLevel: number;
  weightedMajority: string;
  weightedConsensus: number;
} {
  const voteCounts: Record<string, number> = {};
  const weightedVoteCounts: Record<string, number> = {};
  let totalWeight = 0;

  for (const [agentId, voteData] of Object.entries(votes)) {
    const vote = voteData.vote;
    const weight = voteData.weight || 1.0;

    // Simple count
    voteCounts[vote] = (voteCounts[vote] || 0) + 1;

    // Weighted count
    weightedVoteCounts[vote] = (weightedVoteCounts[vote] || 0) + weight;
    totalWeight += weight;
  }

  // Find majority vote
  const sortedVotes = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
  const majorityVote = sortedVotes[0]?.[0] || 'defer';
  const majorityCount = sortedVotes[0]?.[1] || 0;
  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);
  const consensusLevel = totalVotes > 0 ? majorityCount / totalVotes : 0;

  // Find weighted majority
  const sortedWeighted = Object.entries(weightedVoteCounts).sort((a, b) => b[1] - a[1]);
  const weightedMajority = sortedWeighted[0]?.[0] || 'defer';
  const weightedMajorityCount = sortedWeighted[0]?.[1] || 0;
  const weightedConsensus = totalWeight > 0 ? weightedMajorityCount / totalWeight : 0;

  return {
    majorityVote,
    consensusLevel,
    weightedMajority,
    weightedConsensus
  };
}

/**
 * Calculates priority score for queue management
 */
function calculatePriorityScore(options: {
  priority: string;
  deadline?: Date;
  alignmentScore?: number | null;
}): number {
  // Base priority score
  const priorityScores: Record<string, number> = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25
  };

  let score = priorityScores[options.priority] || 50;

  // Deadline urgency bonus
  if (options.deadline) {
    const hoursUntilDeadline = (options.deadline.getTime() - Date.now()) / (1000 * 3600);
    if (hoursUntilDeadline < 24) {
      score += 20; // Urgent
    } else if (hoursUntilDeadline < 72) {
      score += 10; // Soon
    }
  }

  // Strategic alignment bonus
  if (options.alignmentScore && options.alignmentScore > 0.8) {
    score += 15;
  }

  return Math.min(score, 150); // Cap at 150
}

/**
 * Validates if an agent has authority to participate in a decision
 * Integrates with ESA hierarchy for authority checking
 */
async function validateAgentAuthority(
  agentId: string,
  decisionType: string,
  priority: string
): Promise<AgentAuthorityValidation> {
  const agentDef = ESA_HIERARCHY[agentId];

  if (!agentDef) {
    return {
      agentId,
      hasAuthority: false,
      level: 'LAYER' as AgentLevel,
      authorityScore: 0,
      canEscalate: false,
      reasoning: 'Agent not found in ESA hierarchy'
    };
  }

  // Calculate authority score based on agent level
  const levelScores: Record<AgentLevel, number> = {
    'CEO': 1.0,
    'CHIEF': 0.9,
    'DOMAIN': 0.8,
    'EXPERT': 0.7,
    'LAYER': 0.6,
    'LIFE_CEO': 0.7
  };

  const baseScore = levelScores[agentDef.level] || 0.5;

  // Adjust for decision priority
  const priorityAdjustment: Record<string, number> = {
    'critical': 0.2,  // Critical decisions require higher authority
    'high': 0.1,
    'medium': 0,
    'low': -0.1
  };

  const adjustment = priorityAdjustment[priority] || 0;
  const authorityScore = Math.max(0, Math.min(1, baseScore - adjustment));

  // Determine if agent can escalate
  const canEscalate = !!(agentDef.reportingTo && agentDef.reportingTo.length > 0);
  const escalationPath = canEscalate ? agentDef.reportingTo : undefined;

  // Critical decisions require CHIEF level or higher
  const hasAuthority = priority === 'critical' 
    ? ['CEO', 'CHIEF', 'DOMAIN'].includes(agentDef.level)
    : authorityScore >= 0.5;

  return {
    agentId,
    hasAuthority,
    level: agentDef.level,
    authorityScore,
    canEscalate,
    escalationPath,
    reasoning: hasAuthority 
      ? `Agent has ${agentDef.level} authority (score: ${authorityScore.toFixed(2)})`
      : `Insufficient authority for ${priority} priority decision (${agentDef.level}, score: ${authorityScore.toFixed(2)})`
  };
}

/**
 * Gets recommended agents for a decision based on expertise and domain
 */
export async function getRecommendedAgents(options: {
  decisionType: string;
  domain?: string;
  expertise?: string[];
  minLevel?: AgentLevel;
  limit?: number;
}): Promise<RecommendedAgents> {
  const limit = options.limit || 5;
  const minLevel = options.minLevel || 'LAYER';

  console.log(`[Decision Support] 🎯 Finding recommended agents for ${options.decisionType}...`);

  // Filter agents by level
  const levelPriority: Record<AgentLevel, number> = {
    'CEO': 6,
    'CHIEF': 5,
    'DOMAIN': 4,
    'EXPERT': 3,
    'LIFE_CEO': 3,
    'LAYER': 2
  };

  const minLevelScore = levelPriority[minLevel] || 0;
  
  const candidateAgents = Object.values(ESA_HIERARCHY).filter(agent => 
    levelPriority[agent.level] >= minLevelScore
  );

  // Score agents based on expertise match
  const expertiseMatch: Record<string, number> = {};
  const requiredExpertise = options.expertise || [];

  for (const agent of candidateAgents) {
    const agentExpertise = agent.expertiseAreas || [];
    let matchScore = 0;

    // Check expertise overlap
    for (const required of requiredExpertise) {
      for (const has of agentExpertise) {
        if (has.includes(required) || required.includes(has)) {
          matchScore += 0.3;
        }
      }
    }

    // Boost for level
    matchScore += levelPriority[agent.level] * 0.1;

    // Boost for domain match
    if (options.domain && agent.domain === options.domain) {
      matchScore += 0.2;
    }

    if (matchScore > 0) {
      expertiseMatch[agent.id] = Math.min(matchScore, 1.0);
    }
  }

  // Sort by match score and take top N
  const sortedAgents = Object.entries(expertiseMatch)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  const reasoning = sortedAgents.length > 0
    ? `Found ${sortedAgents.length} agents with relevant expertise for ${options.decisionType}`
    : `No agents found matching criteria for ${options.decisionType}`;

  console.log(`[Decision Support] ✅ ${reasoning}`);

  return {
    agentIds: sortedAgents,
    reasoning,
    expertiseMatch
  };
}

/**
 * Calculates vote weight based on agent authority and expertise
 */
export function calculateVoteWeight(
  agentId: string,
  decisionType: string,
  decisionContext: string
): number {
  const agentDef = ESA_HIERARCHY[agentId];

  if (!agentDef) {
    return 1.0; // Default weight
  }

  // Base weight by level
  const levelWeights: Record<AgentLevel, number> = {
    'CEO': 3.0,
    'CHIEF': 2.5,
    'DOMAIN': 2.0,
    'EXPERT': 1.8,
    'LIFE_CEO': 1.5,
    'LAYER': 1.0
  };

  let weight = levelWeights[agentDef.level] || 1.0;

  // Boost weight if agent has relevant expertise
  const agentExpertise = agentDef.expertiseAreas || [];
  const contextLower = decisionContext.toLowerCase();

  for (const expertise of agentExpertise) {
    if (contextLower.includes(expertise.replace(/_/g, ' '))) {
      weight *= 1.3; // 30% boost for expertise match
      break;
    }
  }

  return Math.min(weight, 5.0); // Cap at 5x
}

/**
 * Schedules deadline check for a decision
 */
async function scheduleDeadlineCheck(decision: SelectAgentDecision): Promise<void> {
  if (!decision.deadline) return;

  const queue = initializeQueue();
  if (!queue) return;

  const delay = decision.deadline.getTime() - Date.now();

  if (delay > 0) {
    await queue.add(
      'check-deadline',
      {
        decisionId: decision.decisionId
      },
      {
        delay,
        attempts: 1
      }
    );

    console.log(`[Decision Support] ⏰ Scheduled deadline check for ${decision.decisionId}`);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const DecisionSupportEngine = {
  createDecision,
  castVote,
  resolveConflict,
  checkStrategicAlignment,
  getDecisionMetrics,
  getRecommendedAgents,
  calculateVoteWeight
};

export default DecisionSupportEngine;
