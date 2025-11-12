/**
 * Agent Collaboration Service
 * ESA Collaborative Intelligence System - TRACK 1 BATCH 4
 * 
 * Enables peer-to-peer collaboration between agents:
 * - Smart help request system with expert matching
 * - Solution offering and tracking
 * - Resolution time monitoring
 * - Success rate analytics
 * - Automatic pattern capture via Agent #80
 * - Tight integration with Agent #79 (Quality Validator) and Agent #80 (Learning Coordinator)
 */

import { db } from "../../../shared/db";
import { 
  agentCollaborations, 
  learningPatterns,
  type InsertAgentCollaboration 
} from "../../../shared/schema";
import { eq, desc, and, sql, gte, lte, count } from "drizzle-orm";
import { LearningCoordinatorService } from "../learning/learningCoordinator";
import OpenAI from "openai";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface HelpRequest {
  agentId: string;
  issue: string;
  context?: {
    page?: string;
    component?: string;
    feature?: string;
    severity?: 'critical' | 'high' | 'medium' | 'low';
    errorDetails?: string;
    stackTrace?: string;
    attemptedSolutions?: string[];
  };
  preferredCollaborator?: string; // Specific agent to request help from
  domain?: string; // e.g., 'mobile', 'frontend', 'backend', 'performance'
  urgency?: 'critical' | 'high' | 'medium' | 'low';
}

export interface SolutionOffer {
  collaborationId: number;
  collaboratorId: string;
  solution: string;
  confidence: number; // 0-1
  codeExample?: string;
  estimatedTime?: string;
  relatedPatterns?: string[];
  alternatives?: Array<{
    solution: string;
    pros: string[];
    cons: string[];
  }>;
}

export interface Resolution {
  collaborationId: number;
  resolutionDetails: string;
  successful: boolean;
  timeTaken?: number; // minutes
  solutionApplied?: string;
  lessonsLearned?: string[];
  wouldRecommend?: boolean;
}

export interface ExpertMatch {
  agentId: string;
  expertiseScore: number; // 0-1
  relevantExperience: {
    patternName: string;
    successRate: number;
    timesApplied: number;
  }[];
  availability?: 'high' | 'medium' | 'low';
  avgResolutionTime?: number; // minutes
}

export interface CollaborationMetrics {
  agentId: string;
  totalCollaborations: number;
  successfulResolutions: number;
  failedResolutions: number;
  successRate: number;
  avgResolutionTime: number; // minutes
  helpRequestsReceived: number;
  helpRequestsProvided: number;
  expertiseAreas: Array<{
    domain: string;
    successRate: number;
    count: number;
  }>;
}

export interface CollaborationStatus {
  id: number;
  agentId: string;
  collaboratorId: string;
  issue: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled';
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
  metadata?: any;
}

// ============================================================================
// AGENT COLLABORATION SERVICE
// ============================================================================

export class AgentCollaborationService {
  private serviceId = "Agent Collaboration Service";
  private learningCoordinator: LearningCoordinatorService;
  private openai: OpenAI | null = null;

  constructor() {
    this.learningCoordinator = new LearningCoordinatorService();
    
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  // ==========================================================================
  // 1. REQUEST HELP - Agent requests assistance from peer
  // ==========================================================================

  /**
   * Agent requests help from a peer agent or finds best expert automatically
   */
  async requestHelp(request: HelpRequest): Promise<CollaborationStatus> {
    console.log(`[${this.serviceId}] 🆘 ${request.agentId} requesting help...`);
    
    try {
      // Step 1: Find best expert if no specific collaborator specified
      let collaboratorId = request.preferredCollaborator;
      
      if (!collaboratorId) {
        console.log(`[${this.serviceId}] 🔍 Finding expert agent for: ${request.domain || 'general'}`);
        const expertMatch = await this.findExpertAgent(request);
        
        if (expertMatch) {
          collaboratorId = expertMatch.agentId;
          console.log(`[${this.serviceId}] ✅ Best match: ${collaboratorId} (score: ${Math.round(expertMatch.expertiseScore * 100)}%)`);
        } else {
          // Fallback to Agent #79 (Quality Validator) for general help
          collaboratorId = 'Agent #79';
          console.log(`[${this.serviceId}] ℹ️ No expert match, defaulting to ${collaboratorId}`);
        }
      }
      
      // Step 2: Search knowledge base for similar issues
      const similarSolutions = await this.searchSimilarSolutions(request.issue);
      
      // Step 3: Create collaboration record
      const collaboration = await db.insert(agentCollaborations).values({
        agentId: request.agentId,
        collaboratorId: collaboratorId,
        issue: request.issue,
        status: 'pending',
        metadata: {
          context: request.context,
          domain: request.domain,
          urgency: request.urgency,
          similarSolutions: similarSolutions.slice(0, 3), // Top 3 similar solutions
          requestedAt: new Date().toISOString(),
        },
      }).returning();
      
      const collaborationRecord = collaboration[0];
      
      // Step 4: Notify collaborator (in production, this would trigger real notification)
      console.log(`\n[${request.agentId} → ${collaboratorId}] HELP REQUEST #${collaborationRecord.id}`);
      console.log(`Issue: ${request.issue}`);
      if (request.context?.severity) {
        console.log(`Severity: ${request.context.severity.toUpperCase()}`);
      }
      if (similarSolutions.length > 0) {
        console.log(`\n📚 Similar solutions found in knowledge base:`);
        similarSolutions.slice(0, 2).forEach((s, i) => {
          console.log(`${i + 1}. ${s.pattern.patternName} (${Math.round(s.relevanceScore * 100)}% match)`);
        });
      }
      
      console.log(`\nAwaiting response from ${collaboratorId}...`);
      
      return {
        id: collaborationRecord.id,
        agentId: collaborationRecord.agentId,
        collaboratorId: collaborationRecord.collaboratorId,
        issue: collaborationRecord.issue,
        status: collaborationRecord.status as 'pending',
        createdAt: collaborationRecord.createdAt,
        metadata: collaborationRecord.metadata,
      };
      
    } catch (error) {
      console.error(`[${this.serviceId}] ❌ Error creating help request:`, error);
      throw error;
    }
  }

  // ==========================================================================
  // 2. OFFER SOLUTION - Provide solution suggestions
  // ==========================================================================

  /**
   * Collaborator offers solution(s) to help request
   */
  async offerSolution(offer: SolutionOffer): Promise<CollaborationStatus> {
    console.log(`[${this.serviceId}] 💡 ${offer.collaboratorId} offering solution for collaboration #${offer.collaborationId}`);
    
    try {
      // Step 1: Get collaboration details
      const collaborations = await db
        .select()
        .from(agentCollaborations)
        .where(eq(agentCollaborations.id, offer.collaborationId))
        .limit(1);
      
      if (collaborations.length === 0) {
        throw new Error(`Collaboration #${offer.collaborationId} not found`);
      }
      
      const collaboration = collaborations[0];
      
      // Step 2: Prepare solution offer
      const solutionData = {
        collaboratorId: offer.collaboratorId,
        solution: offer.solution,
        confidence: offer.confidence,
        codeExample: offer.codeExample,
        estimatedTime: offer.estimatedTime,
        relatedPatterns: offer.relatedPatterns,
        alternatives: offer.alternatives,
        offeredAt: new Date().toISOString(),
      };
      
      // Step 3: Update collaboration with solution
      const metadata = collaboration.metadata as any || {};
      metadata.solutionOffered = solutionData;
      
      await db
        .update(agentCollaborations)
        .set({
          status: 'in_progress',
          metadata,
        })
        .where(eq(agentCollaborations.id, offer.collaborationId));
      
      // Step 4: Notify requesting agent
      console.log(`\n[${offer.collaboratorId} → ${collaboration.agentId}] SOLUTION OFFERED`);
      console.log(`Collaboration #${offer.collaborationId}`);
      console.log(`\nProposed Solution:`);
      console.log(offer.solution);
      console.log(`\nConfidence: ${Math.round(offer.confidence * 100)}%`);
      if (offer.estimatedTime) {
        console.log(`Estimated Time: ${offer.estimatedTime}`);
      }
      if (offer.codeExample) {
        console.log(`\nCode Example:`);
        console.log(offer.codeExample);
      }
      if (offer.alternatives && offer.alternatives.length > 0) {
        console.log(`\nAlternative Approaches: ${offer.alternatives.length}`);
      }
      
      return {
        id: collaboration.id,
        agentId: collaboration.agentId,
        collaboratorId: collaboration.collaboratorId,
        issue: collaboration.issue,
        status: 'in_progress',
        createdAt: collaboration.createdAt,
        metadata,
      };
      
    } catch (error) {
      console.error(`[${this.serviceId}] ❌ Error offering solution:`, error);
      throw error;
    }
  }

  // ==========================================================================
  // 3. TRACK RESOLUTION - Log successful fixes
  // ==========================================================================

  /**
   * Track resolution of collaboration and capture learnings
   */
  async trackResolution(resolution: Resolution): Promise<CollaborationStatus> {
    console.log(`[${this.serviceId}] ✅ Tracking resolution for collaboration #${resolution.collaborationId}`);
    
    try {
      // Step 1: Get collaboration details
      const collaborations = await db
        .select()
        .from(agentCollaborations)
        .where(eq(agentCollaborations.id, resolution.collaborationId))
        .limit(1);
      
      if (collaborations.length === 0) {
        throw new Error(`Collaboration #${resolution.collaborationId} not found`);
      }
      
      const collaboration = collaborations[0];
      const metadata = collaboration.metadata as any || {};
      
      // Step 2: Calculate time to resolution
      const createdAt = new Date(collaboration.createdAt);
      const resolvedAt = new Date();
      const resolutionTimeMs = resolvedAt.getTime() - createdAt.getTime();
      const resolutionTimeMinutes = Math.round(resolutionTimeMs / (1000 * 60));
      
      // Step 3: Update collaboration with resolution
      metadata.resolution = {
        resolutionDetails: resolution.resolutionDetails,
        successful: resolution.successful,
        timeTaken: resolution.timeTaken || resolutionTimeMinutes,
        solutionApplied: resolution.solutionApplied,
        lessonsLearned: resolution.lessonsLearned,
        wouldRecommend: resolution.wouldRecommend,
        resolvedAt: resolvedAt.toISOString(),
      };
      
      await db
        .update(agentCollaborations)
        .set({
          status: 'resolved',
          resolution: resolution.resolutionDetails,
          resolvedAt,
          metadata,
        })
        .where(eq(agentCollaborations.id, resolution.collaborationId));
      
      // Step 4: Log learning to Agent #80 (Learning Coordinator) if successful
      if (resolution.successful && resolution.solutionApplied) {
        const domain = metadata.domain || 'general';
        
        await this.learningCoordinator.captureLearning({
          agentId: collaboration.agentId,
          category: 'bug_fix',
          domain,
          problem: collaboration.issue,
          solution: resolution.solutionApplied,
          outcome: {
            success: true,
            impact: metadata.context?.severity === 'critical' ? 'high' : 
                   metadata.context?.severity === 'high' ? 'medium' : 'low',
            timeSaved: `${resolutionTimeMinutes} minutes with collaboration vs estimated solo time`,
          },
          confidence: metadata.solutionOffered?.confidence || 0.9,
          context: {
            collaborator: collaboration.collaboratorId,
            collaborationId: collaboration.id,
            ...metadata.context,
          },
          codeExample: metadata.solutionOffered?.codeExample,
        });
        
        console.log(`[${this.serviceId}] 📚 Learning captured and shared via Agent #80`);
      }
      
      // Step 5: Update success metrics
      await this.updateCollaborationMetrics(collaboration.agentId, collaboration.collaboratorId, resolution.successful);
      
      console.log(`\n[${this.serviceId}] RESOLUTION COMPLETE`);
      console.log(`Collaboration #${resolution.collaborationId}`);
      console.log(`Status: ${resolution.successful ? 'SUCCESS ✅' : 'FAILED ❌'}`);
      console.log(`Time to Resolution: ${resolutionTimeMinutes} minutes`);
      if (resolution.lessonsLearned && resolution.lessonsLearned.length > 0) {
        console.log(`\nLessons Learned:`);
        resolution.lessonsLearned.forEach((lesson, i) => {
          console.log(`${i + 1}. ${lesson}`);
        });
      }
      
      return {
        id: collaboration.id,
        agentId: collaboration.agentId,
        collaboratorId: collaboration.collaboratorId,
        issue: collaboration.issue,
        status: 'resolved',
        resolution: resolution.resolutionDetails,
        createdAt: collaboration.createdAt,
        resolvedAt,
        metadata,
      };
      
    } catch (error) {
      console.error(`[${this.serviceId}] ❌ Error tracking resolution:`, error);
      throw error;
    }
  }

  // ==========================================================================
  // 4. CALCULATE SUCCESS RATE - Measure collaboration effectiveness
  // ==========================================================================

  /**
   * Calculate success rate and collaboration metrics for an agent
   */
  async calculateSuccessRate(agentId: string): Promise<CollaborationMetrics> {
    console.log(`[${this.serviceId}] 📊 Calculating success metrics for ${agentId}...`);
    
    try {
      // Get all collaborations where agent requested help
      const helpRequests = await db
        .select()
        .from(agentCollaborations)
        .where(eq(agentCollaborations.agentId, agentId));
      
      // Get all collaborations where agent provided help
      const helpProvided = await db
        .select()
        .from(agentCollaborations)
        .where(eq(agentCollaborations.collaboratorId, agentId));
      
      // Calculate metrics for help received
      const resolvedRequests = helpRequests.filter(c => c.status === 'resolved');
      const successfulRequests = resolvedRequests.filter(c => {
        const metadata = c.metadata as any;
        return metadata?.resolution?.successful === true;
      });
      
      // Calculate metrics for help provided
      const resolvedProvided = helpProvided.filter(c => c.status === 'resolved');
      const successfulProvided = resolvedProvided.filter(c => {
        const metadata = c.metadata as any;
        return metadata?.resolution?.successful === true;
      });
      
      // Calculate average resolution time
      const resolutionTimes = resolvedRequests
        .map(c => {
          const metadata = c.metadata as any;
          return metadata?.resolution?.timeTaken;
        })
        .filter(t => typeof t === 'number');
      
      const avgResolutionTime = resolutionTimes.length > 0
        ? resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length
        : 0;
      
      // Calculate expertise areas based on help provided
      const expertiseMap = new Map<string, { successCount: number; totalCount: number }>();
      
      for (const collab of resolvedProvided) {
        const metadata = collab.metadata as any;
        const domain = metadata?.domain || 'general';
        const successful = metadata?.resolution?.successful === true;
        
        const current = expertiseMap.get(domain) || { successCount: 0, totalCount: 0 };
        current.totalCount++;
        if (successful) current.successCount++;
        expertiseMap.set(domain, current);
      }
      
      const expertiseAreas = Array.from(expertiseMap.entries()).map(([domain, stats]) => ({
        domain,
        successRate: stats.successCount / stats.totalCount,
        count: stats.totalCount,
      })).sort((a, b) => b.successRate - a.successRate);
      
      // Overall success rate (combining both requesting and providing help)
      const totalResolved = resolvedRequests.length + resolvedProvided.length;
      const totalSuccessful = successfulRequests.length + successfulProvided.length;
      const overallSuccessRate = totalResolved > 0 ? totalSuccessful / totalResolved : 0;
      
      const metrics: CollaborationMetrics = {
        agentId,
        totalCollaborations: helpRequests.length + helpProvided.length,
        successfulResolutions: totalSuccessful,
        failedResolutions: totalResolved - totalSuccessful,
        successRate: overallSuccessRate,
        avgResolutionTime,
        helpRequestsReceived: helpRequests.length,
        helpRequestsProvided: helpProvided.length,
        expertiseAreas,
      };
      
      console.log(`\n[${this.serviceId}] METRICS FOR ${agentId}`);
      console.log(`Total Collaborations: ${metrics.totalCollaborations}`);
      console.log(`Success Rate: ${Math.round(metrics.successRate * 100)}%`);
      console.log(`Average Resolution Time: ${Math.round(metrics.avgResolutionTime)} minutes`);
      console.log(`Help Requests Made: ${metrics.helpRequestsReceived}`);
      console.log(`Help Provided: ${metrics.helpRequestsProvided}`);
      
      if (expertiseAreas.length > 0) {
        console.log(`\nExpertise Areas:`);
        expertiseAreas.slice(0, 3).forEach((area, i) => {
          console.log(`${i + 1}. ${area.domain}: ${Math.round(area.successRate * 100)}% success (${area.count} cases)`);
        });
      }
      
      return metrics;
      
    } catch (error) {
      console.error(`[${this.serviceId}] ❌ Error calculating success rate:`, error);
      throw error;
    }
  }

  // ==========================================================================
  // 5. FIND EXPERT AGENT - Match problem to expert
  // ==========================================================================

  /**
   * Find best expert agent for a given problem using pattern library and success rates
   */
  async findExpertAgent(request: HelpRequest): Promise<ExpertMatch | null> {
    console.log(`[${this.serviceId}] 🔍 Finding expert for: ${request.domain || 'general'} issue...`);
    
    try {
      // Step 1: Search pattern library for similar problems
      const searchQuery = `${request.issue} ${request.domain || ''}`;
      const knowledgeResults = await this.learningCoordinator.searchKnowledge(searchQuery, 10);
      
      if (knowledgeResults.length === 0) {
        console.log(`[${this.serviceId}] ℹ️ No matching patterns found in knowledge base`);
        return null;
      }
      
      // Step 2: Aggregate expertise by agent from patterns
      const agentExpertise = new Map<string, {
        patternCount: number;
        totalSuccessRate: number;
        patterns: Array<{ patternName: string; successRate: number; timesApplied: number }>;
      }>();
      
      for (const result of knowledgeResults) {
        const pattern = result.pattern;
        const discoveredBy = pattern.discoveredBy || [];
        
        for (const agentId of discoveredBy) {
          const current = agentExpertise.get(agentId) || {
            patternCount: 0,
            totalSuccessRate: 0,
            patterns: [],
          };
          
          current.patternCount++;
          current.totalSuccessRate += pattern.successRate;
          current.patterns.push({
            patternName: pattern.patternName,
            successRate: pattern.successRate,
            timesApplied: pattern.timesApplied,
          });
          
          agentExpertise.set(agentId, current);
        }
      }
      
      // Step 3: Calculate expertise scores
      const expertCandidates: ExpertMatch[] = [];
      
      for (const [agentId, expertise] of Array.from(agentExpertise.entries())) {
        // Don't recommend self
        if (agentId === request.agentId) continue;
        
        // Calculate weighted expertise score
        const avgSuccessRate = expertise.totalSuccessRate / expertise.patternCount;
        const patternCountWeight = Math.min(expertise.patternCount / 5, 1); // Cap at 5 patterns
        const expertiseScore = (avgSuccessRate * 0.7) + (patternCountWeight * 0.3);
        
        // Get collaboration metrics for this agent
        const metrics = await this.calculateSuccessRate(agentId);
        
        expertCandidates.push({
          agentId,
          expertiseScore,
          relevantExperience: expertise.patterns.slice(0, 3), // Top 3 patterns
          availability: this.assessAvailability(metrics),
          avgResolutionTime: metrics.avgResolutionTime,
        });
      }
      
      // Step 4: Sort by expertise score and return best match
      expertCandidates.sort((a, b) => b.expertiseScore - a.expertiseScore);
      
      const bestMatch = expertCandidates[0];
      
      if (bestMatch) {
        console.log(`[${this.serviceId}] ✅ Best expert: ${bestMatch.agentId}`);
        console.log(`  Expertise Score: ${Math.round(bestMatch.expertiseScore * 100)}%`);
        console.log(`  Relevant Experience: ${bestMatch.relevantExperience.length} patterns`);
        console.log(`  Avg Resolution Time: ${Math.round(bestMatch.avgResolutionTime || 0)} minutes`);
        
        return bestMatch;
      }
      
      return null;
      
    } catch (error) {
      console.error(`[${this.serviceId}] ❌ Error finding expert agent:`, error);
      return null;
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Search for similar solutions in knowledge base
   */
  private async searchSimilarSolutions(issue: string): Promise<any[]> {
    try {
      const results = await this.learningCoordinator.searchKnowledge(issue, 5);
      return results;
    } catch (error) {
      console.error(`[${this.serviceId}] Error searching similar solutions:`, error);
      return [];
    }
  }

  /**
   * Update collaboration metrics after resolution
   */
  private async updateCollaborationMetrics(
    agentId: string,
    collaboratorId: string,
    successful: boolean
  ): Promise<void> {
    // This could be expanded to update a separate metrics table
    // For now, metrics are calculated on-demand via calculateSuccessRate
    console.log(`[${this.serviceId}] 📈 Metrics updated for ${agentId} and ${collaboratorId}`);
  }

  /**
   * Assess agent availability based on current workload
   */
  private assessAvailability(metrics: CollaborationMetrics): 'high' | 'medium' | 'low' {
    // Simple heuristic: agents with fewer active collaborations are more available
    const activeCount = metrics.totalCollaborations - (metrics.successfulResolutions + metrics.failedResolutions);
    
    if (activeCount === 0) return 'high';
    if (activeCount <= 2) return 'medium';
    return 'low';
  }

  /**
   * Get collaboration by ID
   */
  async getCollaboration(id: number): Promise<CollaborationStatus | null> {
    try {
      const collaborations = await db
        .select()
        .from(agentCollaborations)
        .where(eq(agentCollaborations.id, id))
        .limit(1);
      
      if (collaborations.length === 0) return null;
      
      const c = collaborations[0];
      return {
        id: c.id,
        agentId: c.agentId,
        collaboratorId: c.collaboratorId,
        issue: c.issue,
        status: c.status as any,
        resolution: c.resolution || undefined,
        createdAt: c.createdAt,
        resolvedAt: c.resolvedAt || undefined,
        metadata: c.metadata,
      };
    } catch (error) {
      console.error(`[${this.serviceId}] Error getting collaboration:`, error);
      return null;
    }
  }

  /**
   * List active collaborations for an agent
   */
  async listActiveCollaborations(agentId: string): Promise<CollaborationStatus[]> {
    try {
      const collaborations = await db
        .select()
        .from(agentCollaborations)
        .where(
          and(
            sql`${agentCollaborations.agentId} = ${agentId} OR ${agentCollaborations.collaboratorId} = ${agentId}`,
            sql`${agentCollaborations.status} IN ('pending', 'in_progress')`
          )
        )
        .orderBy(desc(agentCollaborations.createdAt));
      
      return collaborations.map(c => ({
        id: c.id,
        agentId: c.agentId,
        collaboratorId: c.collaboratorId,
        issue: c.issue,
        status: c.status as any,
        resolution: c.resolution || undefined,
        createdAt: c.createdAt,
        resolvedAt: c.resolvedAt || undefined,
        metadata: c.metadata,
      }));
    } catch (error) {
      console.error(`[${this.serviceId}] Error listing collaborations:`, error);
      return [];
    }
  }

  /**
   * Cancel a collaboration
   */
  async cancelCollaboration(id: number, reason?: string): Promise<void> {
    try {
      const metadata = { cancelledAt: new Date().toISOString(), cancelReason: reason };
      
      await db
        .update(agentCollaborations)
        .set({ status: 'cancelled', metadata })
        .where(eq(agentCollaborations.id, id));
      
      console.log(`[${this.serviceId}] ❌ Collaboration #${id} cancelled`);
    } catch (error) {
      console.error(`[${this.serviceId}] Error cancelling collaboration:`, error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const agentCollaborationService = new AgentCollaborationService();
