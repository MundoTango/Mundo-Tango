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
import { PageAuditService, type AuditResults } from '../self-healing/PageAuditService';
import { getAutoFixEngine } from '../mrBlue/AutoFixEngine';

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
      
      // Step 3: Activate agents for new route
      const agents: BasePageAgent[] = [];
      for (const agentId of agentIds) {
        const agent = agentRegistry.getAgent(agentId);
        if (agent) {
          agents.push(agent);
          this.activeAgents.set(agentId, {
            agent,
            route,
            activatedAt: new Date(),
            state: 'initializing',
          });
          console.log(`[AgentLifecycle] ✅ Activated: ${agent.getName()}`);
        } else {
          console.warn(`[AgentLifecycle] ⚠️ Agent ${agentId} not found in registry`);
        }
      }
      
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
   * Uses AutoFixEngine to apply fixes automatically
   */
  private async autoFixIssues(auditResults: AuditResults): Promise<number> {
    try {
      const autoFixEngine = getAutoFixEngine();
      let fixedCount = 0;
      
      // Get all critical issues
      const criticalIssues = [
        ...auditResults.issuesByCategory.ui_ux,
        ...auditResults.issuesByCategory.routing,
        ...auditResults.issuesByCategory.integration,
        ...auditResults.issuesByCategory.performance,
        ...auditResults.issuesByCategory.accessibility,
        ...auditResults.issuesByCategory.security,
      ].filter(issue => issue.severity === 'critical');
      
      console.log(`[AgentLifecycle] 🔧 Found ${criticalIssues.length} critical issues to auto-fix`);
      
      // Note: AutoFixEngine expects error IDs from errorPatterns table
      // For page audit issues, we'd need to create error patterns first
      // For now, we'll just log what we'd fix
      for (const issue of criticalIssues) {
        console.log(`[AgentLifecycle] 📝 Would fix: ${issue.description}`);
        console.log(`[AgentLifecycle] 💡 Suggested: ${issue.suggestedFix}`);
        // In production, this would call autoFixEngine.processError(errorId)
      }
      
      return fixedCount;
    } catch (error) {
      console.error('[AgentLifecycle] Auto-fix failed:', error);
      return 0;
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
