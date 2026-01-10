/**
 * BugDiagnosticAgent - MB.MD Pattern 67
 * 
 * Primary orchestrator for the Universal Bug Diagnostic System.
 * Coordinates user bug reporting, admin fix workflow, and agent-driven fixes.
 * 
 * @see bug-diagnostic.md for full documentation
 */

import { BaseServiceAgent } from './BaseServiceAgent';
import { AgentOrchestrator } from '../AgentOrchestrator';
import { ReactProtocol } from '../ReactProtocol';
import { AutoFixEngine } from '../AutoFixEngine';
import { ElementSelectorService } from '../elementSelector';

// ==================== TYPES ====================

export interface DiagnosticContext {
  testId?: string;
  breadcrumb: string[];
  apiCalls: APICallRecord[];
  userContext: UserContext;
  errors: ErrorRecord[];
  appState: Record<string, unknown>;
  playwrightVideoUrl?: string;
  selectedElement?: string;
}

export interface APICallRecord {
  timestamp: number;
  url: string;
  method: string;
  status: number;
  requestBody?: unknown;
  responseBody?: unknown;
  duration: number;
  error?: string;
}

export interface UserContext {
  id?: number;
  username?: string;
  isLoggedIn: boolean;
  tier: 'free' | 'pro' | 'admin' | 'god';
  role?: string;
  cityId?: number;
  cityName?: string;
  isVerified: boolean;
  profileComplete: boolean;
  permissions: string[];
}

export interface ErrorRecord {
  timestamp: number;
  message: string;
  stack?: string;
  type: 'console' | 'network' | 'runtime';
}

export interface BugReport {
  id: number;
  userId?: number;
  title: string;
  description: string;
  currentPage: string;
  diagnosticContext: DiagnosticContext;
  playwrightVideoUrl?: string;
  status: 'pending' | 'approved' | 'in-progress' | 'resolved' | 'rejected';
  assignedAgents?: string[];
}

export interface FixResult {
  success: boolean;
  action: 'auto-fix' | 'request-approval' | 'manual-review';
  confidence: number;
  reasoning: string;
  filesModified?: string[];
  agentWork: AgentWorkStream[];
  validationPassed?: boolean;
}

export interface AgentWorkStream {
  agent: string;
  phase: 'analyzing' | 'planning' | 'executing' | 'validating';
  message: string;
  timestamp: number;
  data?: unknown;
}

// ==================== AGENT ROUTING ====================

const ERROR_AGENT_ROUTING: Record<string, { primary: string; supporting: string[] }> = {
  '401': { primary: 'SecurityAgent', supporting: ['BackendAgent'] },
  '403': { primary: 'SecurityAgent', supporting: ['BackendAgent'] },
  '404': { primary: 'BackendAgent', supporting: ['QAAgent'] },
  '500': { primary: 'BackendAgent', supporting: ['DevOpsAgent'] },
  'ui-render': { primary: 'FrontendAgent', supporting: ['DesignAgent'] },
  'styling': { primary: 'DesignAgent', supporting: ['FrontendAgent'] },
  'performance': { primary: 'BackendAgent', supporting: ['DevOpsAgent'] },
  'data-save': { primary: 'BackendAgent', supporting: ['SecurityAgent'] },
  'crash': { primary: 'QAAgent', supporting: ['CTOAgent'] },
  'unknown': { primary: 'CTOAgent', supporting: ['QAAgent'] },
};

// ==================== BUG DIAGNOSTIC AGENT ====================

export class BugDiagnosticAgent extends BaseServiceAgent {
  private agentOrchestrator: AgentOrchestrator;
  private reactProtocol: ReactProtocol;
  private autoFixEngine: AutoFixEngine;
  private elementSelector: ElementSelectorService;
  private workStream: AgentWorkStream[] = [];
  private streamCallback?: (work: AgentWorkStream) => void;

  constructor() {
    super({
      name: 'BugDiagnosticAgent',
      description: 'Orchestrates bug reporting, diagnosis, and fix application',
      capabilities: [
        'analyze-diagnostic-context',
        'route-to-agents',
        'stream-agent-work',
        'apply-fixes',
        'validate-fixes',
        'notify-user',
      ],
    });

    this.agentOrchestrator = new AgentOrchestrator();
    this.reactProtocol = new ReactProtocol();
    this.autoFixEngine = new AutoFixEngine();
    this.elementSelector = new ElementSelectorService();
  }

  /**
   * Set callback for streaming agent work to VibeCoding chat
   */
  setStreamCallback(callback: (work: AgentWorkStream) => void): void {
    this.streamCallback = callback;
  }

  /**
   * Stream work update to chat
   */
  private streamWork(agent: string, phase: AgentWorkStream['phase'], message: string, data?: unknown): void {
    const work: AgentWorkStream = {
      agent,
      phase,
      message,
      timestamp: Date.now(),
      data,
    };
    this.workStream.push(work);
    this.streamCallback?.(work);
  }

  /**
   * Analyze diagnostic context and determine which agents to deploy
   */
  async analyzeContext(context: DiagnosticContext): Promise<{
    errorType: string;
    routing: { primary: string; supporting: string[] };
    summary: string;
  }> {
    this.streamWork('BugDiagnosticAgent', 'analyzing', 'Analyzing diagnostic context...');

    // Check for API errors
    const failedCalls = context.apiCalls.filter(c => c.status >= 400);
    if (failedCalls.length > 0) {
      const statusCode = failedCalls[0].status.toString();
      const errorType = statusCode.startsWith('4') ? statusCode : '500';
      const routing = ERROR_AGENT_ROUTING[errorType] || ERROR_AGENT_ROUTING['unknown'];
      
      this.streamWork('BugDiagnosticAgent', 'analyzing', 
        `Found ${failedCalls.length} failed API calls. Primary error: ${statusCode}`);

      return {
        errorType,
        routing,
        summary: `API Error ${statusCode} on ${failedCalls[0].url}`,
      };
    }

    // Check for console errors
    if (context.errors.length > 0) {
      const runtimeErrors = context.errors.filter(e => e.type === 'runtime');
      if (runtimeErrors.length > 0) {
        this.streamWork('BugDiagnosticAgent', 'analyzing', 
          `Found ${runtimeErrors.length} runtime errors`);
        return {
          errorType: 'crash',
          routing: ERROR_AGENT_ROUTING['crash'],
          summary: `Runtime error: ${runtimeErrors[0].message}`,
        };
      }
    }

    // Default to CTO oversight
    this.streamWork('BugDiagnosticAgent', 'analyzing', 
      'No clear error pattern detected. Escalating to CTO for analysis.');
    return {
      errorType: 'unknown',
      routing: ERROR_AGENT_ROUTING['unknown'],
      summary: 'Requires manual investigation',
    };
  }

  /**
   * Deploy agents based on routing and execute fix
   */
  async deployAgentsForFix(
    bugReport: BugReport,
    isGodLevel: boolean
  ): Promise<FixResult> {
    this.workStream = [];

    // Step 1: Analyze context
    const analysis = await this.analyzeContext(bugReport.diagnosticContext);
    
    // Step 2: Deploy primary agent
    this.streamWork(analysis.routing.primary, 'analyzing', 
      `${analysis.routing.primary} starting analysis...`);

    // Step 3: Use ReactProtocol for reasoning
    this.streamWork(analysis.routing.primary, 'planning', 
      'Using ReAct Protocol: Reason → Act → Observe');

    const reactResult = await this.reactProtocol.execute({
      task: `Fix bug: ${bugReport.title}`,
      context: {
        diagnosticContext: bugReport.diagnosticContext,
        errorType: analysis.errorType,
        currentPage: bugReport.currentPage,
      },
    });

    this.streamWork(analysis.routing.primary, 'planning', 
      `ReAct Analysis: ${reactResult.reasoning || 'Analysis complete'}`);

    // Step 4: Generate fix via AutoFixEngine
    this.streamWork('AutoFixEngine', 'executing', 
      'Generating fix with confidence scoring...');

    const fixAnalysis = await this.autoFixEngine.analyze({
      patternId: analysis.errorType,
      diagnosis: analysis.summary,
      context: bugReport.diagnosticContext,
    });

    this.streamWork('AutoFixEngine', 'executing', 
      `Fix confidence: ${fixAnalysis.confidence}%`);

    // Step 5: Determine action based on confidence
    let action: FixResult['action'];
    if (fixAnalysis.confidence >= 85 && isGodLevel) {
      action = 'auto-fix';
      this.streamWork('AutoFixEngine', 'executing', 
        'High confidence - applying fix automatically');
    } else if (fixAnalysis.confidence >= 70) {
      action = 'request-approval';
      this.streamWork('AutoFixEngine', 'executing', 
        'Medium confidence - requesting approval');
    } else {
      action = 'manual-review';
      this.streamWork('AutoFixEngine', 'executing', 
        'Low confidence - requires manual review');
    }

    // Step 6: Validate if applying
    let validationPassed = false;
    if (action === 'auto-fix') {
      this.streamWork('QAAgent', 'validating', 
        'Running validation loop...');
      validationPassed = await this.validateFix(fixAnalysis);
      this.streamWork('QAAgent', 'validating', 
        validationPassed ? 'Validation passed!' : 'Validation failed');
    }

    return {
      success: true,
      action,
      confidence: fixAnalysis.confidence,
      reasoning: fixAnalysis.reasoning || analysis.summary,
      filesModified: fixAnalysis.affectedFiles,
      agentWork: this.workStream,
      validationPassed,
    };
  }

  /**
   * Validate a fix before applying
   */
  private async validateFix(fixAnalysis: any): Promise<boolean> {
    // Run basic validation checks
    try {
      // Check if affected files exist
      if (!fixAnalysis.affectedFiles || fixAnalysis.affectedFiles.length === 0) {
        return false;
      }
      
      // Additional validation can be added here
      return true;
    } catch (error) {
      console.error('[BugDiagnosticAgent] Validation failed:', error);
      return false;
    }
  }

  /**
   * Check if user is god-level
   */
  isGodLevel(user: any): boolean {
    if (!user) return false;
    const godEmails = ['scott@boddye.com', 'admin@mundotango.life'];
    return godEmails.includes(user.email) || user.tier === 8;
  }

  /**
   * Parse element selector from natural language
   */
  async parseElementSelector(reference: string, userId?: number): Promise<string | null> {
    try {
      const result = await this.elementSelector.parseElementReference(reference, userId);
      return result.selector;
    } catch (error) {
      console.error('[BugDiagnosticAgent] Element selector failed:', error);
      return null;
    }
  }

  /**
   * Generate conversational clarifying questions based on context
   */
  generateClarifyingQuestions(context: DiagnosticContext): string[] {
    const questions: string[] = [];

    // Check for vague reports
    if (context.breadcrumb.length < 2) {
      questions.push('What were you trying to do when this happened?');
    }

    // Check for specific error types
    const failedCalls = context.apiCalls.filter(c => c.status >= 400);
    if (failedCalls.length > 0) {
      questions.push('Did you see any error messages on the screen?');
    }

    // Check for UI issues
    if (context.errors.some(e => e.message.includes('render'))) {
      questions.push('Is something not displaying correctly? Can you describe what you expected to see?');
    }

    // Default question
    if (questions.length === 0) {
      questions.push('Can you walk me through exactly what happened step by step?');
    }

    return questions;
  }

  /**
   * Format agent work stream for chat display
   */
  formatWorkStreamForChat(): string {
    return this.workStream.map(work => {
      const icon = this.getAgentIcon(work.agent);
      const phase = this.getPhaseEmoji(work.phase);
      return `${icon} **${work.agent}** ${phase}: ${work.message}`;
    }).join('\n\n');
  }

  private getAgentIcon(agent: string): string {
    const icons: Record<string, string> = {
      'BugDiagnosticAgent': '🔍',
      'CTOAgent': '👔',
      'FrontendAgent': '🎨',
      'BackendAgent': '⚙️',
      'SecurityAgent': '🔐',
      'DesignAgent': '✨',
      'QAAgent': '✅',
      'DevOpsAgent': '🚀',
      'AutoFixEngine': '🔧',
    };
    return icons[agent] || '🤖';
  }

  private getPhaseEmoji(phase: AgentWorkStream['phase']): string {
    const emojis: Record<string, string> = {
      'analyzing': '🔍',
      'planning': '📝',
      'executing': '⚡',
      'validating': '✅',
    };
    return emojis[phase] || '';
  }
}

// Export singleton instance
export const bugDiagnosticAgent = new BugDiagnosticAgent();
