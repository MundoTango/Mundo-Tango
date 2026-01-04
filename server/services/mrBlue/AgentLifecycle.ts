/**
 * AgentLifecycle - Contextual Agent Activation System
 * MB.MD v9.2 - November 23, 2025
 * 
 * Purpose: Activate agents BEFORE user makes requests
 * - Agents wake up on page navigation
 * - Run health checks (PreFlightCheckService)
 * - Run page audit (PageAuditService - 6 agents in parallel)
 * - Auto-fix issues (AutoFixEngine)
 * - Enter LISTENING state
 * 
 * Result: <5ms response time (agents already aware of context)
 */

import { agentRegistry } from './AgentRegistry';
import { BasePageAgent } from './agents/BasePageAgent';
import { PreFlightCheckService } from '../self-healing/PreFlightCheckService';
import { PageAuditService, type AuditResults, type AuditIssue } from '../self-healing/PageAuditService';
import { db } from '../../db';
import { errorPatterns } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// MB.MD Pattern: Lazy-loaded AutoFixEngine to avoid circular dependencies
let autoFixEngineInstance: any = null;
async function getLazyAutoFixEngine() {
  if (!autoFixEngineInstance) {
    const { getAutoFixEngine } = await import('../mrBlue/AutoFixEngine');
    autoFixEngineInstance = await getAutoFixEngine();
  }
  return autoFixEngineInstance;
}

export interface AgentActivationResult {
  route: string;
  activatedAgents: Array<{
    id: string;
    name: string;
    domain: string[];
  }>;
  healthChecksPassed: boolean;
  auditResults: AuditResults | null;
  issuesFixed: number;
  activationTime: number;
  timestamp: Date;
}

export interface ActiveAgentInfo {
  agent: BasePageAgent;
  route: string;
  activatedAt: Date;
  state: 'initializing' | 'health-check' | 'auditing' | 'fixing' | 'listening';
}

/**
 * Route to agent mapping
 * Maps routes to agent IDs that should be activated
 */
const ROUTE_AGENT_MAP: Record<string, string[]> = {
  '/': ['landing-page'], // Landing page
  '/visual-editor': ['landing-page'], // Visual editor edits landing page
  // Add more routes as agents are created
  // '/feed': ['feed-page'],
  // '/profile': ['profile-page'],
  // '/events': ['events-page'],
};

export class AgentLifecycle {
  private static instance: AgentLifecycle;
  
  // Track active agents per route
  private activeAgents: Map<string, ActiveAgentInfo> = new Map();
  
  // Track which route is currently active
  private currentRoute: string = '/';
  
  private constructor() {
    console.log('[AgentLifecycle] 🚀 Initialized contextual agent activation system');
  }
  
  /**
   * Singleton instance
   */
  static getInstance(): AgentLifecycle {
    if (!AgentLifecycle.instance) {
      AgentLifecycle.instance = new AgentLifecycle();
    }
    return AgentLifecycle.instance;
  }
  
  /**
   * MAIN ENTRY POINT: Activate agents for a specific route
   * 
   * Flow:
   * 1. Determine which agents own this route
   * 2. Deactivate old agents (from previous route)
   * 3. Initialize/wake new agents
   * 4. Run pre-flight checks
   * 5. Run page audit (6 agents in parallel)
   * 6. Auto-fix high-confidence issues
   * 7. Set agents to LISTENING state
   */
  async activateAgentsForRoute(route: string): Promise<AgentActivationResult> {
    const startTime = Date.now();
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[AgentLifecycle] 🔄 ROUTE CHANGE DETECTED: ${this.currentRoute} → ${route}`);
    console.log(`${'='.repeat(80)}\n`);
    
    try {
      // Step 1: Determine which agents should be active for this route
      const agentIds = this.getAgentsForRoute(route);
      console.log(`[AgentLifecycle] 📋 Route ${route} requires ${agentIds.length} agents: ${agentIds.join(', ')}`);
      
      // Step 2: Deactivate agents from previous route (if different)
      if (route !== this.currentRoute) {
        await this.deactivateAgentsForRoute(this.currentRoute);
        this.currentRoute = route;
      }
      
      // Step 3: Activate agents for new route IN PARALLEL (MB.MD v9.8 - Pattern 28)
      console.log(`[AgentLifecycle] 🚀 Activating ${agentIds.length} agents in PARALLEL`);
      const agents: BasePageAgent[] = agentIds
        .map(agentId => {
          const agent = agentRegistry.getAgent(agentId);
          if (agent) {
            this.activeAgents.set(agentId, {
              agent,
              route,
              activatedAt: new Date(),
              state: 'initializing',
            });
            console.log(`[AgentLifecycle] ✅ Activated: ${agent.getName()}`);
            return agent;
          } else {
            console.warn(`[AgentLifecycle] ⚠️ Agent ${agentId} not found in registry`);
            return null;
          }
        })
        .filter((a): a is BasePageAgent => a !== null);
      
      if (agents.length === 0) {
        console.log(`[AgentLifecycle] ℹ️ No agents registered for route ${route}`);
        return {
          route,
          activatedAgents: [],
          healthChecksPassed: true,
          auditResults: null,
          issuesFixed: 0,
          activationTime: Date.now() - startTime,
          timestamp: new Date(),
        };
      }
      
      // Step 4: Run pre-flight health checks
      console.log(`[AgentLifecycle] 🔍 Running pre-flight health checks...`);
      this.setAgentStates('health-check');
      
      const healthChecksPassed = await this.runPreFlightChecks(route, agents);
      console.log(`[AgentLifecycle] ${healthChecksPassed ? '✅' : '⚠️'} Health checks ${healthChecksPassed ? 'passed' : 'completed with warnings'}`);
      
      // Step 5: Run page audit (6 agents in parallel)
      console.log(`[AgentLifecycle] 🔎 Running comprehensive page audit...`);
      this.setAgentStates('auditing');
      
      const auditResults = await this.runPageAudit(route);
      console.log(`[AgentLifecycle] 📊 Audit complete: ${auditResults.totalIssues} issues found (${auditResults.criticalIssues} critical)`);
      
      // Step 6: Auto-fix high-confidence issues
      let issuesFixed = 0;
      if (auditResults.criticalIssues > 0) {
        console.log(`[AgentLifecycle] 🛠️ Auto-fixing ${auditResults.criticalIssues} critical issues...`);
        this.setAgentStates('fixing');
        
        issuesFixed = await this.autoFixIssues(auditResults);
        console.log(`[AgentLifecycle] ✅ Auto-fixed ${issuesFixed} issues`);
      }
      
      // Step 7: Set agents to LISTENING state
      console.log(`[AgentLifecycle] 👂 All agents now LISTENING for user requests`);
      this.setAgentStates('listening');
      
      const activationTime = Date.now() - startTime;
      console.log(`[AgentLifecycle] ⚡ Total activation time: ${activationTime}ms`);
      console.log(`${'='.repeat(80)}\n`);
      
      return {
        route,
        activatedAgents: agents.map(a => ({
          id: a.getId(),
          name: a.getName(),
          domain: a.getDomain(),
        })),
        healthChecksPassed,
        auditResults,
        issuesFixed,
        activationTime,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error(`[AgentLifecycle] ❌ Error activating agents for ${route}:`, error);
      throw error;
    }
  }
  
  /**
   * Get currently active agents
   * Used by VibeCoding to query only active agents (no broadcast)
   */
  getActiveAgents(): BasePageAgent[] {
    return Array.from(this.activeAgents.values()).map(info => info.agent);
  }
  
  /**
   * Get active agents info (with state)
   */
  getActiveAgentsInfo(): ActiveAgentInfo[] {
    return Array.from(this.activeAgents.values());
  }
  
  /**
   * Deactivate agents for a route
   */
  async deactivateAgentsForRoute(route: string): Promise<void> {
    console.log(`[AgentLifecycle] 💤 Deactivating agents for ${route}...`);
    
    const agentIds = this.getAgentsForRoute(route);
    for (const agentId of agentIds) {
      if (this.activeAgents.has(agentId)) {
        const info = this.activeAgents.get(agentId)!;
        console.log(`[AgentLifecycle] 💤 Deactivated: ${info.agent.getName()}`);
        this.activeAgents.delete(agentId);
      }
    }
  }
  
  /**
   * Get agent IDs for a route
   */
  private getAgentsForRoute(route: string): string[] {
    // Exact match
    if (ROUTE_AGENT_MAP[route]) {
      return ROUTE_AGENT_MAP[route];
    }
    
    // Partial match (e.g., /events/123 → /events)
    for (const [routePattern, agentIds] of Object.entries(ROUTE_AGENT_MAP)) {
      if (route.startsWith(routePattern)) {
        return agentIds;
      }
    }
    
    // No match - return empty array
    return [];
  }
  
  /**
   * Set state for all active agents
   */
  private setAgentStates(state: ActiveAgentInfo['state']): void {
    for (const info of this.activeAgents.values()) {
      info.state = state;
    }
  }
  
  /**
   * Run pre-flight checks
   * Uses PreFlightCheckService to verify imports, providers, hooks
   */
  private async runPreFlightChecks(route: string, agents: BasePageAgent[]): Promise<boolean> {
    try {
      // For each agent, verify their domain files have valid imports/providers
      const checkPromises = agents.map(async (agent) => {
        const filePaths = agent.getDomain();
        
        // Create a simple fix proposal to check dependencies
        const fixProposal = {
          code: '', // Empty for now, just checking existing code
          componentPath: filePaths[0], // Primary file
        };
        
        const result = await PreFlightCheckService.runPreFlightChecks(route, fixProposal);
        return result.allChecksPassed;
      });
      
      const results = await Promise.all(checkPromises);
      return results.every(r => r); // All checks must pass
    } catch (error) {
      console.error('[AgentLifecycle] Pre-flight checks failed:', error);
      return false;
    }
  }
  
  /**
   * Run page audit
   * Uses PageAuditService with 6 agents running in parallel
   */
  private async runPageAudit(route: string): Promise<AuditResults> {
    // Convert route to pageId (e.g., "/" → "landing-page")
    const pageId = this.routeToPageId(route);
    return await PageAuditService.runComprehensiveAudit(pageId);
  }
  
  /**
   * Auto-fix high-confidence issues
   * MB.MD v9.8: Now actually executes fixes via AutoFixEngine
   * Bridge: Page Audit Issues → errorPatterns table → AutoFixEngine.processError()
   */
  private async autoFixIssues(auditResults: AuditResults): Promise<number> {
    try {
      const autoFixEngine = await getLazyAutoFixEngine();
      let fixedCount = 0;
      
      // Get critical issues from all categories (safe access with fallbacks)
      const categories = auditResults.issuesByCategory || {};
      const allIssues: AuditIssue[] = [
        ...(categories.ui_ux || []),
        ...(categories.routing || []),
        ...(categories.integration || []),
        ...(categories.performance || []),
        ...(categories.accessibility || []),
        ...(categories.security || []),
      ];
      
      // Filter for critical and high severity issues
      const fixableIssues = allIssues.filter(
        issue => issue.severity === 'critical' || issue.severity === 'high'
      );
      
      console.log(`[AgentLifecycle] 🔧 Found ${fixableIssues.length} issues to auto-fix`);
      
      if (fixableIssues.length === 0) {
        console.log('[AgentLifecycle] ✅ No critical issues - system healthy');
        return 0;
      }
      
      // Process issues in parallel (mb.md Pattern 28 - Parallel Agent Squads)
      const fixPromises = fixableIssues.map(async (issue) => {
        try {
          // Step 1: Bridge - Insert issue into errorPatterns table
          const errorId = await this.createErrorPatternFromAudit(issue);
          
          if (!errorId) {
            console.log(`[AgentLifecycle] ⏭️ Skipping duplicate issue: ${issue.description?.substring(0, 50)}`);
            return false;
          }
          
          console.log(`[AgentLifecycle] 📝 Created errorPattern #${errorId}: ${issue.description?.substring(0, 50)}`);
          
          // Step 2: Execute fix via AutoFixEngine
          const result = await autoFixEngine.processError(errorId);
          
          if (result.success) {
            console.log(`[AgentLifecycle] ✅ Fixed #${errorId}: ${result.decision.action}`);
            return true;
          } else {
            console.log(`[AgentLifecycle] ⚠️ Fix #${errorId} ${result.decision.action}: ${result.error || 'No error message'}`);
            return false;
          }
        } catch (error: any) {
          console.error(`[AgentLifecycle] ❌ Error fixing issue:`, error.message);
          return false;
        }
      });
      
      // Wait for all fixes to complete
      const results = await Promise.all(fixPromises);
      fixedCount = results.filter(Boolean).length;
      
      console.log(`[AgentLifecycle] 🎯 Auto-fixed ${fixedCount}/${fixableIssues.length} issues`);
      
      return fixedCount;
    } catch (error) {
      console.error('[AgentLifecycle] Auto-fix failed:', error);
      return 0;
    }
  }
  
  /**
   * Bridge: Convert AuditIssue → errorPatterns table entry
   * Returns the new error ID, or null if duplicate
   */
  private async createErrorPatternFromAudit(issue: AuditIssue): Promise<number | null> {
    try {
      // Null safety for issue fields
      const errorMessage = issue.description || issue.message || 'Unknown issue';
      const errorType = issue.type || issue.category || 'audit_issue';
      const suggestedFix = issue.suggestedFix || issue.fix || '';
      
      // Check for existing similar error to avoid duplicates
      const [existing] = await db
        .select()
        .from(errorPatterns)
        .where(
          and(
            eq(errorPatterns.errorMessage, errorMessage),
            eq(errorPatterns.status, 'pending')
          )
        )
        .limit(1);
      
      if (existing) {
        // Update frequency instead of creating duplicate
        await db
          .update(errorPatterns)
          .set({
            frequency: (existing.frequency || 0) + 1,
            lastSeen: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(errorPatterns.id, existing.id));
        return null; // Already exists
      }
      
      // Insert new error pattern
      const [inserted] = await db.insert(errorPatterns).values({
        errorType,
        errorMessage,
        suggestedFix,
        status: 'pending',
        frequency: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        metadata: {
          source: 'page_audit',
          severity: issue.severity,
          category: issue.category,
          affectedElement: issue.affectedElement,
          priority: issue.priority,
        },
      }).returning({ id: errorPatterns.id });
      
      return inserted?.id || null;
    } catch (error: any) {
      console.error('[AgentLifecycle] Failed to create errorPattern:', error.message);
      return null;
    }
  }
  
  /**
   * Convert route to pageId for auditing
   */
  private routeToPageId(route: string): string {
    const routeMap: Record<string, string> = {
      '/': 'landing-page',
      '/visual-editor': 'landing-page',
      '/feed': 'feed-page',
      '/profile': 'profile-page',
      '/events': 'events-page',
    };
    
    return routeMap[route] || route.replace('/', '') + '-page';
  }
  
  /**
   * Get stats
   */
  getStats(): {
    activeAgents: number;
    currentRoute: string;
    agentStates: Array<{ id: string; name: string; state: string }>;
  } {
    return {
      activeAgents: this.activeAgents.size,
      currentRoute: this.currentRoute,
      agentStates: Array.from(this.activeAgents.values()).map(info => ({
        id: info.agent.getId(),
        name: info.agent.getName(),
        state: info.state,
      })),
    };
  }
}

// Export singleton instance
export const agentLifecycle = AgentLifecycle.getInstance();
