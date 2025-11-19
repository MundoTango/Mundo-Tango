/**
 * Conversation Orchestrator
 * MB.MD v9.2 - Self-Healing System Integration
 * November 19, 2025
 * 
 * Orchestrates Mr Blue conversations with intelligent routing:
 * - Questions → GROQ answers (NO code generation)
 * - Actions → VibeCoding workflow
 * - Page Analysis → Activate → Audit → Self-Heal
 * 
 * Performance Targets:
 * - Intent classification: <100ms
 * - Context enrichment (RAG): <200ms
 * - Question handling: <2000ms
 * - Page analysis: <1000ms (activation + audit)
 */

import Groq from 'groq-sdk';
import { contextService } from './mrBlue/ContextService';
import { vibeCodingService } from './mrBlue/VibeCodingService';
import { AgentActivationService } from './self-healing/AgentActivationService';
import { PageAuditService } from './self-healing/PageAuditService';
import { SelfHealingService } from './self-healing/SelfHealingService';

// Initialize GROQ client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

export interface Intent {
  type: 'question' | 'action' | 'page_analysis' | 'unknown';
  confidence: number;
  reasoning: string;
}

export interface EnrichedMessage {
  originalMessage: string;
  contextChunks: any[];
  relevanceScore: number;
}

export interface QuestionResponse {
  success: true;
  mode: 'question';
  response: string;
  sources: string[];
}

export interface ActionResponse {
  success: boolean;
  mode: 'action';
  vibecodingResult: any;
  requiresApproval: boolean;
}

export interface PageAnalysisResult {
  success: boolean;
  pageId: string;
  activation: {
    totalAgents: number;
    activationTime: number;
  };
  audit: {
    totalIssues: number;
    criticalIssues: number;
    issuesByCategory: any;
    auditDurationMs: number;
  };
  healing?: {
    issuesFixed: number;
    healingDurationMs: number;
    success: boolean;
  };
  totalTime: number;
}

export class ConversationOrchestrator {
  /**
   * Classify user intent: Question vs Action vs Page Analysis
   * 2-tier system: Questions first (what/where/when), then Actions (add/create/fix)
   * Target: <100ms
   */
  async classifyIntent(message: string): Promise<Intent> {
    const startTime = Date.now();
    const msg = message.toLowerCase();

    // Tier 1: Check for page analysis intent (highest priority)
    const pageAnalysisKeywords = [
      'analyze page',
      'audit page',
      'check page',
      'scan page',
      'inspect page',
      'page health',
      'page status',
    ];

    for (const keyword of pageAnalysisKeywords) {
      if (msg.includes(keyword)) {
        console.log(`[Orchestrator] 🎯 Page Analysis intent detected (${Date.now() - startTime}ms)`);
        return {
          type: 'page_analysis',
          confidence: 0.95,
          reasoning: `Matched keyword: "${keyword}"`
        };
      }
    }

    // Tier 2: Check for question intent
    const questionKeywords = [
      'what is',
      'what are',
      'where is',
      'where can',
      'when does',
      'when will',
      'why is',
      'why does',
      'how do',
      'how can',
      'who is',
      'who are',
      'explain',
      'tell me',
      'show me',
      'describe',
    ];

    for (const keyword of questionKeywords) {
      if (msg.includes(keyword)) {
        console.log(`[Orchestrator] ❓ Question intent detected (${Date.now() - startTime}ms)`);
        return {
          type: 'question',
          confidence: 0.90,
          reasoning: `Matched question keyword: "${keyword}"`
        };
      }
    }

    // Tier 3: Check for action intent
    const actionKeywords = [
      'add',
      'create',
      'make',
      'build',
      'implement',
      'fix',
      'change',
      'modify',
      'update',
      'remove',
      'delete',
      'refactor',
      'improve',
      'optimize',
    ];

    for (const keyword of actionKeywords) {
      if (msg.includes(keyword)) {
        console.log(`[Orchestrator] 🔨 Action intent detected (${Date.now() - startTime}ms)`);
        return {
          type: 'action',
          confidence: 0.85,
          reasoning: `Matched action keyword: "${keyword}"`
        };
      }
    }

    // Default: Treat as question (safer fallback)
    console.log(`[Orchestrator] ⚠️ Unknown intent - defaulting to question (${Date.now() - startTime}ms)`);
    return {
      type: 'question',
      confidence: 0.50,
      reasoning: 'No clear intent keywords found, defaulting to question'
    };
  }

  /**
   * Enrich message with RAG context
   * Uses contextService.search() for semantic retrieval
   * Target: <200ms
   */
  async enrichWithContext(message: string): Promise<EnrichedMessage> {
    const startTime = Date.now();

    try {
      // Search documentation for relevant context
      const contextChunks = await contextService.search(message, 5);

      const duration = Date.now() - startTime;
      console.log(`[Orchestrator] 📚 Context enrichment complete: ${contextChunks.length} chunks in ${duration}ms`);

      // Calculate relevance score (average similarity)
      const relevanceScore = contextChunks.length > 0
        ? contextChunks.reduce((sum, chunk) => sum + (chunk.similarity || 0), 0) / contextChunks.length
        : 0;

      return {
        originalMessage: message,
        contextChunks,
        relevanceScore
      };
    } catch (error) {
      console.error('[Orchestrator] ❌ Context enrichment failed:', error);
      return {
        originalMessage: message,
        contextChunks: [],
        relevanceScore: 0
      };
    }
  }

  /**
   * Handle question intent - Use GROQ to generate answer (NO code)
   * Target: <2000ms
   */
  async handleQuestion(
    message: string,
    enrichedContext: EnrichedMessage
  ): Promise<QuestionResponse> {
    const startTime = Date.now();

    try {
      // Build context from RAG results
      let contextText = '';
      if (enrichedContext.contextChunks.length > 0) {
        contextText = enrichedContext.contextChunks
          .map((chunk, i) => `[Context ${i + 1}] ${chunk.content.substring(0, 500)}`)
          .join('\n\n');
      }

      const systemPrompt = `You are Mr. Blue, the Mundo Tango AI assistant.

IMPORTANT: You are in QUESTION mode. Answer the user's question conversationally. DO NOT generate code.

${contextText ? `RELEVANT CONTEXT:\n${contextText}\n\n` : ''}

GUIDELINES:
1. Answer questions clearly and concisely
2. Reference the context if relevant
3. If you don't know, say so - don't make things up
4. Keep responses conversational and helpful
5. DO NOT generate code or file changes`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const answer = response.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
      const duration = Date.now() - startTime;

      console.log(`[Orchestrator] ✅ Question handled in ${duration}ms`);

      return {
        success: true,
        mode: 'question',
        response: answer,
        sources: enrichedContext.contextChunks.map(c => c.source)
      };
    } catch (error) {
      console.error('[Orchestrator] ❌ Question handling failed:', error);
      return {
        success: true,
        mode: 'question',
        response: 'I apologize, I encountered an error processing your question. Please try again.',
        sources: []
      };
    }
  }

  /**
   * Handle action intent - Route to VibeCoding
   * Target: <3000ms (includes VibeCoding processing)
   */
  async handleActionRequest(
    message: string,
    context: any,
    userId: number = 0
  ): Promise<ActionResponse> {
    const startTime = Date.now();

    try {
      console.log('[Orchestrator] 🔨 Routing to VibeCoding service...');

      const sessionId = `action_${userId}_${Date.now()}`;

      const vibeRequest = {
        naturalLanguage: message,
        context: [
          `Current Page: ${context.currentPage || 'Unknown'}`,
          `Page Title: ${context.pageTitle || 'Unknown'}`,
          ...(context.domSnapshot ? [`DOM Snapshot: ${JSON.stringify(context.domSnapshot, null, 2)}`] : []),
        ],
        targetFiles: context.targetFiles || [],
        userId,
        sessionId,
      };

      const vibeResult = await vibeCodingService.generateCode(vibeRequest);

      const duration = Date.now() - startTime;
      console.log(`[Orchestrator] ✅ Action handled in ${duration}ms`);

      return {
        success: vibeResult.success,
        mode: 'action',
        vibecodingResult: vibeResult,
        requiresApproval: true,
      };
    } catch (error) {
      console.error('[Orchestrator] ❌ Action handling failed:', error);
      return {
        success: false,
        mode: 'action',
        vibecodingResult: null,
        requiresApproval: false,
      };
    }
  }

  /**
   * Analyze page: Activate → Audit → Self-Heal
   * Target: <1000ms (activation + audit), healing optional
   */
  async analyzePage(pageId: string, autoHeal: boolean = false): Promise<PageAnalysisResult> {
    const startTime = Date.now();

    try {
      console.log(`[Orchestrator] 🔍 Analyzing page: ${pageId}`);

      // Step 1: Activate agents
      const activation = await AgentActivationService.spinUpPageAgents(pageId);
      console.log(`[Orchestrator] ✅ Activated ${activation.totalAgents} agents in ${activation.activationTime}ms`);

      // Step 2: Run comprehensive audit
      const audit = await PageAuditService.runComprehensiveAudit(pageId);
      console.log(`[Orchestrator] ✅ Audit complete: ${audit.totalIssues} issues (${audit.criticalIssues} critical)`);

      let healing = undefined;

      // Step 3: Auto-heal if requested and issues found
      if (autoHeal && audit.hasIssues) {
        const healingResult = await SelfHealingService.executeSimultaneousFixes(audit);
        healing = {
          issuesFixed: healingResult.issuesFixed,
          healingDurationMs: healingResult.healingDurationMs,
          success: healingResult.success
        };
        console.log(`[Orchestrator] ✅ Self-healing complete: ${healingResult.issuesFixed} issues fixed`);
      }

      const totalTime = Date.now() - startTime;

      const result: PageAnalysisResult = {
        success: true,
        pageId,
        activation: {
          totalAgents: activation.totalAgents,
          activationTime: activation.activationTime
        },
        audit: {
          totalIssues: audit.totalIssues,
          criticalIssues: audit.criticalIssues,
          issuesByCategory: audit.issuesByCategory,
          auditDurationMs: audit.auditDurationMs
        },
        healing,
        totalTime
      };

      console.log(`[Orchestrator] ✅ Page analysis complete for ${pageId} in ${totalTime}ms`);

      return result;
    } catch (error) {
      console.error(`[Orchestrator] ❌ Page analysis failed for ${pageId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const conversationOrchestrator = new ConversationOrchestrator();
