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
// MB.MD Pattern: Lazy-loaded to avoid circular dependencies
// import { vibeCodingService } from './mrBlue/VibeCodingService';
import { AgentActivationService } from './self-healing/AgentActivationService';
import { PageAuditService } from './self-healing/PageAuditService';
import { SelfHealingService } from './self-healing/SelfHealingService';
import { db } from '../db';
import { events } from '@shared/schema';
import { gte, and, ilike, asc } from 'drizzle-orm';

// Lazy-loaded VibeCodingService
let vibeCodingServiceInstance: any = null;
async function getLazyVibeCodingService() {
  if (!vibeCodingServiceInstance) {
    const { vibeCodingService } = await import('./mrBlue/VibeCodingService');
    vibeCodingServiceInstance = vibeCodingService;
  }
  return vibeCodingServiceInstance;
}

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

    // TIER 0: UI/Code modification requests (HIGHEST PRIORITY - MB.MD v9.2 ENHANCED)
    const uiModificationKeywords = [
      // Explicit vibecoding
      'vibe code',
      'vibecod',
      'vibe cod',
      'can you code',
      'can you vibe',
      'generate code',
      'write code',
      'code this',
      'code that',
      // UI modification patterns (NEW - Nov 19, 2025)
      'make the',
      'change the',
      'make it',
      'change it to',
      'turn the',
      'set the',
      'color to',
      'color the',
      'style the',
      'resize the',
      'move the',
      'add a button',
      'add a',
      'create a button',
      'create a',
      'remove the',
      'hide the',
      'show the',
      'display the',
    ];

    for (const keyword of uiModificationKeywords) {
      if (msg.includes(keyword)) {
        console.log(`[Orchestrator] 🎯 UI MODIFICATION intent detected: "${keyword}" (${Date.now() - startTime}ms)`);
        return {
          type: 'action',
          confidence: 0.99,
          reasoning: `UI modification request: "${keyword}"`
        };
      }
    }

    // Tier 1: Check for page analysis intent
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

    // Tier 2: Check for question intent (CONTEXT-AWARE - MB.MD v9.2 FIX)
    const questionKeywords = [
      'what is',
      'what are',
      'what\'s wrong',
      'where is',
      'where can',
      'when does',
      'when will',
      'why is',
      'why does',
      'how do',
      'who is',
      'who are',
      'explain',
      'tell me',
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
   * MB.MD v9.3: Detect if message is asking about events
   */
  private isEventsQuestion(message: string): boolean {
    const msg = message.toLowerCase();
    const eventKeywords = [
      'event', 'milonga', 'practica', 'festival', 'workshop', 'class',
      'tango', 'dance', 'happening', 'going on', 'schedule', 'calendar',
      'upcoming', 'this week', 'this month', 'tonight', 'tomorrow',
      'where can i dance', 'where to dance', 'places to dance'
    ];
    return eventKeywords.some(kw => msg.includes(kw));
  }

  /**
   * MB.MD v9.3: Detect if message is about travel planning
   */
  private isTravelPlanningRequest(message: string): boolean {
    const msg = message.toLowerCase();
    const travelKeywords = [
      'travel', 'trip', 'visit', 'going to', 'plan', 'interested',
      'want to go', 'i\'d like to go', 'add to', 'mark as interested',
      'create travel plan', 'book', 'attend'
    ];
    return travelKeywords.some(kw => msg.includes(kw));
  }

  /**
   * MB.MD v9.3: Query events from database
   * Retrieves upcoming events with optional city filter
   */
  private async getEventsContext(message: string, limit: number = 10): Promise<string> {
    try {
      const msg = message.toLowerCase();
      
      // Extract city name if mentioned
      let cityFilter: string | null = null;
      const cityMatch = msg.match(/in\s+([a-z\s]+?)(?:\s+this|\s+next|\s+upcoming|$|\?)/i);
      if (cityMatch) {
        cityFilter = cityMatch[1].trim();
      }

      // Build query for upcoming events
      const now = new Date();
      
      // Apply city filter if specified, otherwise get general upcoming events
      const whereConditions = cityFilter
        ? and(gte(events.startDate, now), ilike(events.city, `%${cityFilter}%`))
        : gte(events.startDate, now);

      const upcomingEvents = await db.select({
        id: events.id,
        title: events.title,
        eventType: events.eventType,
        startDate: events.startDate,
        city: events.city,
        country: events.country,
        venue: events.venue,
        interestedCount: events.interestedCount,
        goingCount: events.goingCount,
      })
      .from(events)
      .where(whereConditions)
      .orderBy(asc(events.startDate))
      .limit(Math.min(limit, 15));

      if (upcomingEvents.length === 0) {
        const noEventsMsg = cityFilter 
          ? `No upcoming events found in ${cityFilter}. Try asking about events in a different city.`
          : 'No upcoming events found in the database.';
        return noEventsMsg;
      }

      console.log(`[Orchestrator] 📅 Found ${upcomingEvents.length} events${cityFilter ? ` in ${cityFilter}` : ''}`);

      // Format events for context
      const eventsSummary = upcomingEvents.map((evt, i) => {
        const startDate = evt.startDate ? new Date(evt.startDate).toLocaleDateString('en-US', { 
          weekday: 'short', month: 'short', day: 'numeric' 
        }) : 'TBD';
        return `${i + 1}. **${evt.title}** (ID: ${evt.id})
   - Type: ${evt.eventType || 'Event'}
   - Date: ${startDate}
   - Location: ${evt.venue || ''}, ${evt.city || ''}, ${evt.country || ''}
   - Interested: ${evt.interestedCount || 0} | Going: ${evt.goingCount || 0}`;
      }).join('\n\n');

      const headerText = cityFilter
        ? `MUNDO TANGO EVENTS IN ${cityFilter.toUpperCase()} (${upcomingEvents.length} events):`
        : `MUNDO TANGO EVENTS DATABASE (${upcomingEvents.length} upcoming events):`;

      return `${headerText}
${eventsSummary}

To help users attend events, you can:
1. Suggest they mark as "Interested" by saying "I want to go to [Event Name]"
2. Help them create a travel plan by asking about their dates and preferences
3. Show them related events in the same city`;
    } catch (error) {
      console.error('[Orchestrator] ❌ Events query failed:', error);
      return 'Unable to fetch events data at this time.';
    }
  }

  /**
   * MB.MD v9.3: Handle travel planning requests
   * Mark user as interested in event and create travel plan
   */
  async handleTravelPlanning(
    message: string,
    userId?: number
  ): Promise<{ action: string; eventId?: number; success: boolean; message: string }> {
    try {
      // Extract event reference from message
      const eventMatch = message.match(/(?:event|id)\s*[:#]?\s*(\d+)/i) ||
                        message.match(/go to\s+(.+?)(?:\s+event)?(?:\.|$)/i);
      
      if (!eventMatch) {
        return {
          action: 'clarify',
          success: false,
          message: 'Which event would you like to attend? Please specify the event name or ID.'
        };
      }

      // If user is not logged in
      if (!userId) {
        return {
          action: 'login_required',
          success: false,
          message: 'To mark events as interested or create travel plans, please log in first. Would you like me to guide you to the login page?'
        };
      }

      // For now, return guidance (actual RSVP creation would need event ID lookup)
      return {
        action: 'guide',
        success: true,
        message: `Great choice! To add this to your travel plans:
1. Visit the event page and click "Interested" or "Going"
2. You can then add travel dates from your profile
3. I can help you find housing and other events in that city!

Would you like me to show you more events in the same location?`
      };
    } catch (error) {
      console.error('[Orchestrator] ❌ Travel planning failed:', error);
      return {
        action: 'error',
        success: false,
        message: 'Unable to process travel planning request at this time.'
      };
    }
  }

  /**
   * Handle question intent - Use GROQ to generate answer (NO code)
   * MB.MD v9.2: Now CONTEXT-AWARE of current page, DOM elements, user intent
   * MB.MD v9.3: Now includes EVENTS DATABASE context for tango-related queries
   * Target: <2000ms
   */
  async handleQuestion(
    message: string,
    enrichedContext: EnrichedMessage,
    pageContext?: any
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

      // MB.MD v9.3: Add events context if this is an events-related question
      let eventsContextText = '';
      if (this.isEventsQuestion(message)) {
        console.log('[Orchestrator] 📅 Detected events question - fetching events context');
        eventsContextText = await this.getEventsContext(message);
      }

      // MB.MD v9.2 FIX: Build page awareness context
      let pageAwarenessText = '';
      if (pageContext) {
        const currentPage = pageContext.page || pageContext.currentPage || 'Unknown';
        const pageTitle = pageContext.pageTitle || 'Unknown';
        const userIntent = pageContext.userIntent || 'browsing';
        
        pageAwarenessText = `CURRENT PAGE CONTEXT:
- URL Path: ${currentPage}
- Page Title: ${pageTitle}
- User Intent: ${userIntent}`;

        // Add DOM snapshot if available
        if (pageContext.domSnapshot) {
          const { inputs, buttons, selects, errors } = pageContext.domSnapshot;
          pageAwarenessText += `
- Inputs on page: ${inputs?.length || 0}
- Buttons on page: ${buttons?.length || 0}
- Dropdowns on page: ${selects?.length || 0}
- Errors visible: ${errors?.length || 0}`;

          // Show specific DOM elements if present
          if (inputs && inputs.length > 0) {
            const inputDetails = inputs.slice(0, 3).map((inp: any) => 
              `  • ${inp.placeholder || inp.name || inp.testId || 'input'}`
            ).join('\n');
            pageAwarenessText += `\n\nKey inputs:\n${inputDetails}`;
          }

          if (errors && errors.length > 0) {
            const errorDetails = errors.map((err: any) => 
              `  • ${err.text}`
            ).join('\n');
            pageAwarenessText += `\n\nVisible errors:\n${errorDetails}`;
          }
        }
      }

      const systemPrompt = `You are Mr. Blue, the Mundo Tango AI assistant with CONTEXT AWARENESS.

${pageAwarenessText}

CAPABILITIES:
✅ I can SEE the current page you're on
✅ I can SEE form fields, buttons, and errors
✅ I can VIBE CODE (generate/modify code with "can you vibe code?")
✅ I provide context-aware answers based on where you are
✅ I have ACCESS to the Mundo Tango events database
✅ I can HELP with travel planning for tango events

IMPORTANT: You are in QUESTION mode. Answer the user's question conversationally. DO NOT generate code unless explicitly asked.

${contextText ? `RELEVANT DOCUMENTATION:\n${contextText}\n\n` : ''}
${eventsContextText ? `\n${eventsContextText}\n\n` : ''}

GUIDELINES:
1. **ALWAYS acknowledge the current page** in your response if page context is available
2. If asking about a specific field/button, reference what you see on the page
3. Answer questions clearly and concisely
4. If you don't know, say so - don't make things up
5. Keep responses conversational and helpful
6. If they ask about my abilities, mention vibecoding!
7. When discussing events, be specific about dates, locations, and event types
8. Encourage users to mark events as "Interested" or create travel plans
9. Offer to help with travel planning if they show interest in an event`;

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

      const vibeCodingService = await getLazyVibeCodingService();
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
