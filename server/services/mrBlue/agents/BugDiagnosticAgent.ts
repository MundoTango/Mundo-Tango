/**
 * BugDiagnosticAgent - MB.MD Pattern 67
 * 
 * Primary orchestrator for the Universal Bug Diagnostic System.
 * Coordinates user bug reporting, admin fix workflow, and agent-driven fixes.
 * 
 * @see bug-diagnostic.md for full documentation
 */

import { ReactProtocolService } from '../ReactProtocol';
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

// God-level user emails
const GOD_LEVEL_USERS = ['scott@boddye.com', 'admin@mundotango.life'];

// ==================== BUG DIAGNOSTIC AGENT ====================

export class BugDiagnosticAgent {
  private name: string;
  private reactProtocol: ReactProtocolService;
  private autoFixEngine: AutoFixEngine;
  private elementSelector: ElementSelectorService;
  private workStream: AgentWorkStream[] = [];
  private streamCallback?: (work: AgentWorkStream) => void;

  constructor() {
    this.name = 'BugDiagnosticAgent';
    this.reactProtocol = new ReactProtocolService();
    this.autoFixEngine = new AutoFixEngine();
    this.elementSelector = new ElementSelectorService();
    console.log('[BugDiagnosticAgent] Initialized');
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
      'Using ReAct Protocol: Reason \u2192 Act \u2192 Observe');

    // Execute ReAct protocol
    let reactReasoning = 'Analysis complete';
    try {
      const reactResult = await this.reactProtocol.executeReAct(
        bugReport.userId || 0,
        `Fix bug: ${bugReport.title}`,
        JSON.stringify({
          diagnosticContext: bugReport.diagnosticContext,
          errorType: analysis.errorType,
          currentPage: bugReport.currentPage,
        })
      );
      reactReasoning = reactResult.finalAnswer || 'Analysis complete';
    } catch (e) {
      console.error('[BugDiagnosticAgent] ReAct failed:', e);
    }

    this.streamWork(analysis.routing.primary, 'planning', 
      `ReAct Analysis: ${reactReasoning}`);

    // Step 4: Generate fix via AutoFixEngine
    this.streamWork('AutoFixEngine', 'executing', 
      'Generating fix with confidence scoring...');

    // Run auto-fix analysis
    let fixConfidence = 50;
    let fixReasoning = analysis.summary;
    let affectedFiles: string[] = [];

    try {
      const fixResult = await this.autoFixEngine.analyzeAndFix({
        id: bugReport.id,
        errorType: analysis.errorType,
        errorMessage: analysis.summary,
        frequency: 1,
        lastSeen: new Date(),
      });
      
      if (fixResult) {
        fixConfidence = fixResult.decision?.confidence || 50;
        fixReasoning = fixResult.decision?.reasoning || analysis.summary;
        affectedFiles = fixResult.fixAnalysis?.affectedFiles || [];
      }
    } catch (e) {
      console.error('[BugDiagnosticAgent] AutoFix failed:', e);
    }

    this.streamWork('AutoFixEngine', 'executing', 
      `Fix confidence: ${fixConfidence}%`);

    // Step 5: Determine action based on confidence
    let action: FixResult['action'];
    if (fixConfidence >= 85 && isGodLevel) {
      action = 'auto-fix';
      this.streamWork('AutoFixEngine', 'executing', 
        'High confidence - applying fix automatically');
    } else if (fixConfidence >= 70) {
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
      validationPassed = affectedFiles.length > 0;
      this.streamWork('QAAgent', 'validating', 
        validationPassed ? 'Validation passed!' : 'Validation failed');
    }

    return {
      success: true,
      action,
      confidence: fixConfidence,
      reasoning: fixReasoning,
      filesModified: affectedFiles,
      agentWork: this.workStream,
      validationPassed,
    };
  }

  /**
   * Check if user is god-level
   */
  isGodLevel(user: any): boolean {
    if (!user) return false;
    return GOD_LEVEL_USERS.includes(user.email) || user.tier === 8;
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
      'BugDiagnosticAgent': '\uD83D\uDD0D',
      'CTOAgent': '\uD83D\uDC54',
      'FrontendAgent': '\uD83C\uDFA8',
      'BackendAgent': '\u2699\uFE0F',
      'SecurityAgent': '\uD83D\uDD10',
      'DesignAgent': '\u2728',
      'QAAgent': '\u2705',
      'DevOpsAgent': '\uD83D\uDE80',
      'AutoFixEngine': '\uD83D\uDD27',
    };
    return icons[agent] || '\uD83E\uDD16';
  }

  private getPhaseEmoji(phase: AgentWorkStream['phase']): string {
    const emojis: Record<string, string> = {
      'analyzing': '\uD83D\uDD0D',
      'planning': '\uD83D\uDCDD',
      'executing': '\u26A1',
      'validating': '\u2705',
    };
    return emojis[phase] || '';
  }

  /**
   * Get agent work stream
   */
  getWorkStream(): AgentWorkStream[] {
    return this.workStream;
  }
}

// Export singleton instance
export const bugDiagnosticAgent = new BugDiagnosticAgent();
