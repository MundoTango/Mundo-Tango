/**
 * UNIFIED MR. BLUE CHAT SERVICE
 * MB.MD Pattern 97 - Central orchestration hub for Mr. Blue intelligence
 *
 * GOD COMMANDS ENFORCED:
 * #2: Work Simultaneously - Parallel context loading
 * #3: Work Recursively - Deep analysis via tools
 * #4: Work Critically - Intent validation
 * #5: Check Documentation First - Context service integration
 *
 * Architecture:
 * 1. MEMORY LOAD + CONTEXT ENRICHMENT (parallel)
 * 2. INTENT DETECTION
 * 3. ROUTING DECISION (confidence-based)
 * 4. HANDLER DISPATCH (tools / agents / simple chat)
 * 5. RESPONSE + MEMORY PERSIST
 */

import { chatWithTools, chatSimple, hasToolAccess, type ToolCallContext, type ToolCallResponse } from './AnthropicToolService';
import { vibeCodingToolService } from './VibeCodingToolService';
import { memoryService } from './MemoryService';
import { contextService } from './ContextService';
import { conversationContext } from './conversationContext';
import { ConversationOrchestrator, type Intent } from './ConversationOrchestrator';
import { AgentRegistry } from './AgentRegistry';

// System prompt for Mr. Blue with tools
const MR_BLUE_SYSTEM_PROMPT = `You are Mr. Blue, the AI partner for MundoTango - a global tango community platform.

## Your Identity
- You are helpful, knowledgeable, and efficient
- You have access to tools to read files, search the codebase, check git status, and more
- You can help with code questions, debugging, and understanding the project

## Your Capabilities (when tools are available)
- Read and analyze source code files
- Search the codebase for patterns and implementations
- Check git status and recent commits
- List directories and explore project structure
- Query GitHub repository information

## Guidelines
1. Use tools proactively when they would help answer the question
2. When asked about code, read the relevant files first
3. Provide concise, actionable answers
4. Reference specific files and line numbers when discussing code
5. If you don't know something, say so honestly

## Context Provided
You may receive context about the user's previous conversations and relevant documentation.
Use this context to provide more personalized and accurate responses.`;

// Simple prompt when tools are not available
const MR_BLUE_SIMPLE_PROMPT = `You are Mr. Blue, a helpful AI assistant for MundoTango - a global tango community platform.

You can answer questions about the platform, tango events, and general inquiries.
Be friendly, helpful, and concise in your responses.`;

export interface ChatRequest {
  message: string;
  userId: number;
  sessionId: string;
  roleLevel?: number;
  page?: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  mode: 'tools' | 'agent' | 'simple' | 'error';
  metadata?: {
    toolsUsed?: Array<{ tool: string; success: boolean }>;
    agentUsed?: string;
    intent?: Intent;
    tokensUsed?: number;
    memoryStored?: boolean;
  };
}

/**
 * Unified Mr. Blue Chat Service
 * Central hub that routes messages to appropriate handlers
 */
class UnifiedMrBlueChatService {
  private orchestrator: ConversationOrchestrator;
  private agentRegistry: AgentRegistry;

  constructor() {
    this.orchestrator = new ConversationOrchestrator();
    this.agentRegistry = AgentRegistry.getInstance();
  }

  /**
   * Main chat entry point
   * Routes message through: Context → Intent → Handler → Response
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { message, userId, sessionId, roleLevel = 0, page } = request;
    const startTime = Date.now();

    console.log(`[UnifiedMrBlueChat] Processing message for user ${userId} (roleLevel: ${roleLevel})`);

    try {
      // PHASE 1: Load context in PARALLEL (GOD COMMAND #2)
      const [memories, docContext, convContext, intent, toolIntent] = await Promise.all([
        this.loadMemories(userId, message),
        this.loadDocContext(message),
        this.loadConversationContext(userId),
        this.orchestrator.classifyIntent(message),
        Promise.resolve(vibeCodingToolService.detectToolIntent(message))
      ]);

      console.log(`[UnifiedMrBlueChat] Intent: ${intent.type} (${intent.confidence}), Tool: ${toolIntent.suggestedTool} (${toolIntent.confidence})`);

      // PHASE 2: Build enriched system prompt
      const systemPrompt = this.buildSystemPrompt(memories, docContext, convContext, roleLevel);

      // PHASE 3: Route to appropriate handler
      let response: ChatResponse;

      // Route 1: Tool use for god-level users with high tool confidence
      if (hasToolAccess(roleLevel) && toolIntent.shouldExecuteTool && toolIntent.confidence >= 0.7) {
        response = await this.handleToolChat(message, systemPrompt, {
          userId,
          roleLevel,
          sessionId
        }, intent);
      }
      // Route 2: Page-specific agent queries
      else if (intent.type === 'page_analysis' && page) {
        response = await this.handleAgentQuery(message, page, intent);
      }
      // Route 3: High-confidence tool use even without explicit detection (god-level)
      else if (hasToolAccess(roleLevel) && this.shouldUseTtools(message, intent)) {
        response = await this.handleToolChat(message, systemPrompt, {
          userId,
          roleLevel,
          sessionId
        }, intent);
      }
      // Route 4: Simple chat (default)
      else {
        response = await this.handleSimpleChat(message, systemPrompt);
      }

      // PHASE 4: Store conversation in memory
      await this.storeToMemory(userId, message, response.message, sessionId);

      // Add timing metadata
      const duration = Date.now() - startTime;
      console.log(`[UnifiedMrBlueChat] ✅ Response generated in ${duration}ms (mode: ${response.mode})`);

      return response;

    } catch (error: any) {
      console.error('[UnifiedMrBlueChat] ❌ Error:', error);
      return {
        success: false,
        message: `I encountered an error: ${error.message}. Please try again.`,
        mode: 'error',
        metadata: {
          intent: { type: 'unknown', confidence: 0, reasoning: 'Error occurred' }
        }
      };
    }
  }

  /**
   * Handle chat with tools (god-level users)
   */
  private async handleToolChat(
    message: string,
    systemPrompt: string,
    context: ToolCallContext,
    intent: Intent
  ): Promise<ChatResponse> {
    console.log('[UnifiedMrBlueChat] 🔧 Using tool-enabled chat');

    const result = await chatWithTools(systemPrompt, message, context);

    return {
      success: true,
      message: result.content,
      mode: 'tools',
      metadata: {
        toolsUsed: result.toolsUsed.map(t => ({
          tool: t.tool,
          success: t.result.success
        })),
        intent,
        tokensUsed: result.usage.totalTokens
      }
    };
  }

  /**
   * Handle page-specific agent queries
   */
  private async handleAgentQuery(
    message: string,
    pageId: string,
    intent: Intent
  ): Promise<ChatResponse> {
    console.log(`[UnifiedMrBlueChat] 🤖 Routing to page agent: ${pageId}`);

    try {
      const agent = this.agentRegistry.getAgent(pageId);
      if (agent) {
        // Use agent's knowledge to answer
        const knowledge = agent.getKnowledge();
        const response = `Based on my knowledge of the ${pageId} page:\n\n${knowledge.substring(0, 1000)}...`;

        return {
          success: true,
          message: response,
          mode: 'agent',
          metadata: {
            agentUsed: pageId,
            intent
          }
        };
      }
    } catch (error) {
      console.warn(`[UnifiedMrBlueChat] Agent ${pageId} not found, falling back to simple chat`);
    }

    // Fallback to simple chat
    return this.handleSimpleChat(message, MR_BLUE_SIMPLE_PROMPT);
  }

  /**
   * Handle simple chat (no tools)
   */
  private async handleSimpleChat(
    message: string,
    systemPrompt: string
  ): Promise<ChatResponse> {
    console.log('[UnifiedMrBlueChat] 💬 Using simple chat');

    const result = await chatSimple(systemPrompt, message);

    return {
      success: true,
      message: result.content,
      mode: 'simple',
      metadata: {
        tokensUsed: result.usage.inputTokens + result.usage.outputTokens
      }
    };
  }

  /**
   * Load user memories (parallel)
   */
  private async loadMemories(userId: number, message: string): Promise<string> {
    try {
      const memories = await memoryService.retrieveMemories(userId, message, 3);
      if (memories && memories.length > 0) {
        return memories.map((m: any) => m.content).join('\n');
      }
    } catch (error) {
      console.warn('[UnifiedMrBlueChat] Memory load failed:', error);
    }
    return '';
  }

  /**
   * Load documentation context (parallel)
   */
  private async loadDocContext(message: string): Promise<string> {
    try {
      const results = await contextService.search(message, 3);
      if (results && results.length > 0) {
        return results.map((r: any) => r.content).join('\n');
      }
    } catch (error) {
      console.warn('[UnifiedMrBlueChat] Context load failed:', error);
    }
    return '';
  }

  /**
   * Load conversation context (parallel)
   */
  private async loadConversationContext(userId: number): Promise<string> {
    try {
      const context = conversationContext.getContextSummary(userId);
      return context || '';
    } catch (error) {
      console.warn('[UnifiedMrBlueChat] Conversation context load failed:', error);
    }
    return '';
  }

  /**
   * Build enriched system prompt with context
   */
  private buildSystemPrompt(
    memories: string,
    docContext: string,
    convContext: string,
    roleLevel: number
  ): string {
    const basePrompt = hasToolAccess(roleLevel) ? MR_BLUE_SYSTEM_PROMPT : MR_BLUE_SIMPLE_PROMPT;
    const contextParts: string[] = [basePrompt];

    if (memories) {
      contextParts.push(`\n## User Memory\n${memories}`);
    }
    if (docContext) {
      contextParts.push(`\n## Relevant Documentation\n${docContext}`);
    }
    if (convContext) {
      contextParts.push(`\n## Recent Conversation\n${convContext}`);
    }

    return contextParts.join('\n');
  }

  /**
   * Store conversation to memory
   */
  private async storeToMemory(
    userId: number,
    userMessage: string,
    assistantResponse: string,
    sessionId: string
  ): Promise<void> {
    try {
      await memoryService.storeMemory(
        userId,
        `User: ${userMessage}\nAssistant: ${assistantResponse.substring(0, 500)}`,
        'conversation',
        5,
        { source: 'unified-chat', conversationId: sessionId }
      );
    } catch (error) {
      console.warn('[UnifiedMrBlueChat] Memory store failed:', error);
    }
  }

  /**
   * Determine if we should use tools based on message content
   */
  private shouldUseTtools(message: string, intent: Intent): boolean {
    const msg = message.toLowerCase();

    // Keywords that suggest tool use would be helpful
    const toolKeywords = [
      'read', 'file', 'code', 'show me', 'what is in',
      'git', 'status', 'commit', 'branch',
      'search', 'find', 'grep', 'where is',
      'list', 'directory', 'folder',
      'project', 'structure', 'codebase',
      'github', 'repo', 'repository'
    ];

    return toolKeywords.some(keyword => msg.includes(keyword));
  }
}

// Export singleton instance
export const unifiedMrBlueChat = new UnifiedMrBlueChatService();
