/**
 * Agent Coordination Service - Advanced Self-Healing v2.0
 * MB.MD Phase 5: Multi-agent coordination and consensus building
 * 
 * Prevents:
 * - Agent conflicts (Agent A fix breaks Agent B's work)
 * - Incomplete fixes (only fixing part of the problem)
 * - Redundant work (multiple agents fixing same issue)
 * 
 * Methodology: Simultaneously (parallel review), Critically (consensus validation)
 */

import { db } from '../../db';
import { agentCoordinationSessions } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { AuditIssue } from './PageAuditService';
import { GlobalKnowledgeBase } from '../learning/GlobalKnowledgeBase';

interface CoordinationSession {
  id: number;
  sessionId: string;
  pageId: string;
  leadAgentId: string;
  participatingAgents: string[];
  issueUnderReview: any;
  agentFeedback?: any;
  consensusReached: boolean;
  unifiedFix?: any;
  createdAt?: Date;
  completedAt?: Date | null;
}

interface AgentFeedback {
  agentId: string;
  analysis: string;
  proposedFix?: string;
  concerns?: string[];
  confidence: number;
  estimatedTime?: number; // minutes
  dependencies?: string[]; // Other files/agents needed
}

interface Consensus {
  reached: boolean;
  confidence: number; // 0-1
  unifiedFix: UnifiedFix;
  dissenting?: {
    agentId: string;
    reason: string;
  }[];
  votingSummary: {
    agree: number;
    disagree: number;
    abstain: number;
  };
}

interface UnifiedFix {
  description: string;
  steps: Array<{
    order: number;
    agentId: string;
    action: string;
    dependencies: string[];
  }>;
  expectedOutcome: string;
  rollbackPlan: string;
  requiredTests: string[];
}

export class AgentCoordinationService {
  /**
   * Create a coordination session for multi-agent review
   * Brings together all relevant agents to analyze complex issue
   */
  static async createCoordinationSession(
    pageId: string,
    leadAgentId: string,
    issueUnderReview: AuditIssue
  ): Promise<string> {
    console.log('[AgentCoordination] 🤝 Creating coordination session');
    console.log('[AgentCoordination] Lead agent:', leadAgentId);
    console.log('[AgentCoordination] Issue:', issueUnderReview.message);
    
    const sessionId = nanoid(12);
    
    try {
      await db.insert(agentCoordinationSessions).values({
        sessionId,
        pageId,
        leadAgentId,
        participatingAgents: [leadAgentId], // Lead agent is first participant
        issueUnderReview: issueUnderReview as any,
        consensusReached: false,
      });
      
      console.log('[AgentCoordination] ✅ Session created:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('[AgentCoordination] Failed to create session:', error);
      throw error;
    }
  }
  
  /**
   * Invite relevant agents to participate in coordination session
   * Smart agent selection based on issue type and expertise
   */
  static async inviteAgents(
    sessionId: string,
    additionalAgentIds?: string[]
  ): Promise<string[]> {
    console.log('[AgentCoordination] 📨 Inviting agents to session:', sessionId);
    
    // Get session details
    const session = await db.query.agentCoordinationSessions.findFirst({
      where: eq(agentCoordinationSessions.sessionId, sessionId),
    });
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    const issue = session.issueUnderReview as AuditIssue;
    const invitedAgents: Set<string> = new Set(session.participatingAgents || []);
    
    // Add explicitly requested agents
    if (additionalAgentIds) {
      additionalAgentIds.forEach(id => invitedAgents.add(id));
    }
    
    // Smart agent selection based on issue type
    const agentExpertise: Record<string, string[]> = {
      // Accessibility issues
      accessibility: ['accessibility-agent', 'aria-validator', 'screen-reader-agent'],
      
      // React/Component issues
      react: ['react-component-agent', 'jsx-validator', 'hook-validator', 'context-analyzer'],
      component: ['react-component-agent', 'prop-validator', 'lifecycle-agent'],
      
      // Performance issues
      performance: ['performance-monitor', 'bundle-analyzer', 'render-optimizer'],
      
      // Type/Import issues
      type: ['type-checker', 'import-resolver', 'lsp-diagnostics'],
      import: ['import-resolver', 'module-resolver', 'circular-dependency-detector'],
      
      // UI/UX issues
      ui: ['ui-consistency-agent', 'design-system-agent', 'responsive-agent'],
      ux: ['ux-validator', 'navigation-agent', 'user-flow-agent'],
      
      // Security issues
      security: ['security-scanner', 'auth-validator', 'xss-detector', 'csrf-validator'],
      
      // Database issues
      database: ['database-agent', 'query-optimizer', 'migration-agent', 'schema-validator'],
      
      // API issues
      api: ['api-agent', 'route-validator', 'auth-checker', 'rate-limiter'],
    };
    
    // Invite agents based on issue type
    const issueType = issue.type.toLowerCase();
    if (agentExpertise[issueType]) {
      agentExpertise[issueType].forEach(agent => invitedAgents.add(agent));
    }
    
    // Always invite core agents for complex issues
    if (issue.severity === 'critical' || issue.severity === 'error') {
      ['pre-flight-checker', 'predictive-analyzer', 'global-knowledge-base'].forEach(
        agent => invitedAgents.add(agent)
      );
    }
    
    // Update session with invited agents
    const participatingAgents = Array.from(invitedAgents);
    await db.update(agentCoordinationSessions)
      .set({ participatingAgents })
      .where(eq(agentCoordinationSessions.sessionId, sessionId));
    
    console.log('[AgentCoordination] 📨 Invited', participatingAgents.length, 'agents');
    console.log('[AgentCoordination] Agents:', participatingAgents.join(', '));
    
    return participatingAgents;
  }
  
  /**
   * Collect feedback from all participating agents
   * Each agent analyzes issue from their expertise perspective
   */
  static async collectFeedback(
    sessionId: string,
    timeoutMs: number = 5000
  ): Promise<AgentFeedback[]> {
    console.log('[AgentCoordination] 📝 Collecting feedback from agents');
    
    const session = await db.query.agentCoordinationSessions.findFirst({
      where: eq(agentCoordinationSessions.sessionId, sessionId),
    });
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    const issue = session.issueUnderReview as AuditIssue;
    const agents = session.participatingAgents || [];
    
    // Simulate parallel agent feedback (in production, would be actual agent calls)
    const feedbackPromises = agents.map(async (agentId) => {
      return await this.simulateAgentFeedback(agentId, issue);
    });
    
    // Wait for all agents with timeout
    const feedback = await Promise.race([
      Promise.all(feedbackPromises),
      new Promise<AgentFeedback[]>((resolve) => 
        setTimeout(() => {
          console.warn('[AgentCoordination] ⏰ Timeout - proceeding with partial feedback');
          resolve([]);
        }, timeoutMs)
      ),
    ]);
    
    // Save feedback to session
    await db.update(agentCoordinationSessions)
      .set({ 
        agentFeedback: feedback as any,
      })
      .where(eq(agentCoordinationSessions.sessionId, sessionId));
    
    console.log('[AgentCoordination] 📝 Collected', feedback.length, 'feedback responses');
    return feedback;
  }
  
  /**
   * Build consensus from agent feedback
   * Synthesizes unified fix that incorporates all agent perspectives
   */
  static async buildConsensus(
    sessionId: string,
    feedback: AgentFeedback[]
  ): Promise<Consensus> {
    console.log('[AgentCoordination] 🤝 Building consensus from', feedback.length, 'agents');
    
    const session = await db.query.agentCoordinationSessions.findFirst({
      where: eq(agentCoordinationSessions.sessionId, sessionId),
    });
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    const issue = session.issueUnderReview as AuditIssue;
    
    // Analyze feedback
    let agreeCount = 0;
    let disagreeCount = 0;
    let abstainCount = 0;
    const dissenting: Consensus['dissenting'] = [];
    
    // Confidence-weighted voting
    let totalConfidence = 0;
    let weightedAgree = 0;
    
    for (const agent of feedback) {
      totalConfidence += agent.confidence;
      
      if (agent.proposedFix) {
        agreeCount++;
        weightedAgree += agent.confidence;
      } else if (agent.concerns && agent.concerns.length > 0) {
        disagreeCount++;
        dissenting.push({
          agentId: agent.agentId,
          reason: agent.concerns.join('; '),
        });
      } else {
        abstainCount++;
      }
    }
    
    // Calculate consensus confidence
    const consensusConfidence = feedback.length > 0 
      ? weightedAgree / totalConfidence
      : 0;
    
    // Consensus reached if >70% agree and confidence >0.7
    const reached = (agreeCount / feedback.length) > 0.7 && consensusConfidence > 0.7;
    
    // Synthesize unified fix from all proposals
    const unifiedFix = await this.synthesizeUnifiedFix(issue, feedback);
    
    const consensus: Consensus = {
      reached,
      confidence: consensusConfidence,
      unifiedFix,
      dissenting: dissenting.length > 0 ? dissenting : undefined,
      votingSummary: {
        agree: agreeCount,
        disagree: disagreeCount,
        abstain: abstainCount,
      },
    };
    
    // Save consensus to session
    await db.update(agentCoordinationSessions)
      .set({
        consensusReached: reached,
        unifiedFix: unifiedFix as any,
      })
      .where(eq(agentCoordinationSessions.sessionId, sessionId));
    
    console.log('[AgentCoordination] 🤝 Consensus:', reached ? 'REACHED' : 'NOT REACHED');
    console.log('[AgentCoordination] Voting:', agreeCount, 'agree,', disagreeCount, 'disagree,', abstainCount, 'abstain');
    console.log('[AgentCoordination] Confidence:', (consensusConfidence * 100).toFixed(0) + '%');
    
    return consensus;
  }
  
  /**
   * Execute the unified fix after consensus is reached
   * Coordinates multiple agents in proper sequence
   */
  static async executeUnifiedFix(
    sessionId: string
  ): Promise<{ success: boolean; results: any[] }> {
    console.log('[AgentCoordination] 🚀 Executing unified fix for session:', sessionId);
    
    const session = await db.query.agentCoordinationSessions.findFirst({
      where: eq(agentCoordinationSessions.sessionId, sessionId),
    });
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    if (!session.consensusReached) {
      throw new Error('Cannot execute - consensus not reached');
    }
    
    if (!session.unifiedFix) {
      throw new Error('No unified fix available');
    }
    
    const fix = session.unifiedFix as UnifiedFix;
    const results: any[] = [];
    
    // Execute steps in order
    console.log('[AgentCoordination] Executing', fix.steps.length, 'steps');
    
    for (const step of fix.steps) {
      console.log(`[AgentCoordination] Step ${step.order}: ${step.agentId} - ${step.action}`);
      
      // Check dependencies
      for (const dep of step.dependencies) {
        const depCompleted = results.some(r => r.step.agentId === dep && r.success);
        if (!depCompleted) {
          console.error(`[AgentCoordination] ❌ Dependency not met: ${dep}`);
          results.push({
            step,
            success: false,
            error: `Dependency not met: ${dep}`,
          });
          continue;
        }
      }
      
      // Execute step (simulated - in production would call actual agent)
      try {
        const result = await this.executeAgentStep(step);
        results.push({
          step,
          success: true,
          result,
        });
        console.log(`[AgentCoordination] ✅ Step ${step.order} completed`);
      } catch (error: any) {
        console.error(`[AgentCoordination] ❌ Step ${step.order} failed:`, error.message);
        results.push({
          step,
          success: false,
          error: error.message,
        });
        
        // Stop execution on failure
        console.log('[AgentCoordination] 🛑 Execution stopped due to failure');
        break;
      }
    }
    
    // Mark session complete
    await db.update(agentCoordinationSessions)
      .set({ completedAt: new Date() })
      .where(eq(agentCoordinationSessions.sessionId, sessionId));
    
    const success = results.every(r => r.success);
    console.log('[AgentCoordination] 🏁 Execution', success ? 'SUCCEEDED' : 'FAILED');
    
    // Save as lesson if successful
    if (success) {
      await GlobalKnowledgeBase.saveLesson({
        agentId: 'agent-coordination',
        context: `multi_agent_fix_${session.pageId}`,
        issue: (session.issueUnderReview as AuditIssue).message,
        solution: fix.description,
        confidence: 0.9,
        appliesTo: session.participatingAgents || [],
      });
    }
    
    return { success, results };
  }
  
  /**
   * Private: Simulate agent feedback (replace with actual agent calls in production)
   */
  private static async simulateAgentFeedback(
    agentId: string,
    issue: AuditIssue
  ): Promise<AgentFeedback> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    // Generate realistic feedback based on agent expertise
    const feedback: AgentFeedback = {
      agentId,
      analysis: `${agentId} analyzed the ${issue.type} issue`,
      proposedFix: `Fix suggested by ${agentId}`,
      concerns: [],
      confidence: 0.7 + Math.random() * 0.2, // 0.7-0.9
      estimatedTime: Math.floor(Math.random() * 10) + 1,
      dependencies: [],
    };
    
    // Add concerns for some agents
    if (Math.random() > 0.8) {
      feedback.concerns = [`Potential conflict with ${agentId.replace('-agent', '')} logic`];
    }
    
    return feedback;
  }
  
  /**
   * Private: Synthesize unified fix from multiple agent proposals
   */
  private static async synthesizeUnifiedFix(
    issue: AuditIssue,
    feedback: AgentFeedback[]
  ): Promise<UnifiedFix> {
    const steps: UnifiedFix['steps'] = [];
    
    // Build execution steps from feedback
    feedback.forEach((agent, index) => {
      if (agent.proposedFix) {
        steps.push({
          order: index + 1,
          agentId: agent.agentId,
          action: agent.proposedFix,
          dependencies: agent.dependencies || [],
        });
      }
    });
    
    // Sort by dependencies (topological sort)
    const sorted = this.topologicalSort(steps);
    
    return {
      description: `Coordinated fix for ${issue.type}: ${issue.message}`,
      steps: sorted,
      expectedOutcome: `Issue resolved with input from ${feedback.length} agents`,
      rollbackPlan: 'Revert steps in reverse order',
      requiredTests: [`E2E test: Verify ${issue.type} is fixed`],
    };
  }
  
  /**
   * Private: Topological sort for dependency resolution
   */
  private static topologicalSort(
    steps: UnifiedFix['steps']
  ): UnifiedFix['steps'] {
    // Simple topological sort (Kahn's algorithm)
    const sorted: UnifiedFix['steps'] = [];
    const remaining = [...steps];
    
    while (remaining.length > 0) {
      // Find step with no unmet dependencies
      const nextIdx = remaining.findIndex(step =>
        step.dependencies.every(dep =>
          sorted.some(s => s.agentId === dep)
        )
      );
      
      if (nextIdx === -1) {
        // Circular dependency - add remaining in order
        sorted.push(...remaining);
        break;
      }
      
      const [next] = remaining.splice(nextIdx, 1);
      sorted.push(next);
    }
    
    // Renumber steps
    return sorted.map((step, index) => ({
      ...step,
      order: index + 1,
    }));
  }
  
  /**
   * Private: Execute individual agent step (simulated)
   */
  private static async executeAgentStep(
    step: UnifiedFix['steps'][0]
  ): Promise<any> {
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate 90% success rate
    if (Math.random() < 0.9) {
      return { success: true, message: `${step.action} completed` };
    } else {
      throw new Error(`Failed to execute: ${step.action}`);
    }
  }
}
