import { Router, type Request, Response } from "express";
import Groq from "groq-sdk";
import { OpenAI } from "openai";
import multer from "multer";
import fs from "fs";
import { streamingService } from "../services/streamingService";
import { traceRoute, traceAIOperation } from "../metrics/tracing";
import { db } from "../db";
import { mrBlueConversations, mrBlueMessages, messageReactions, messageBookmarks } from "@shared/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { getConversationContext, saveMessageToHistory } from "../services/chat-context";
import { CodeGenerator } from "../services/codeGenerator";
import { getMrBlueCapabilities, getTierName } from '../utils/mrBlueCapabilities';
import { contextService } from "../services/mrBlue/ContextService";
import { memoryService } from "../services/mrBlue/MemoryService";
import { vibeCodingService } from "../services/mrBlue/VibeCodingService";
import { conversationOrchestrator } from "../services/ConversationOrchestrator";

const router = Router();

// Configure multer for audio uploads
const upload = multer({
  dest: '/tmp/mr-blue-audio/',
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
    const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/mp4'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format'));
    }
  }
});

// Bifrost AI Gateway integration - MB.MD Protocol Implementation
// Groq SDK supports baseURL for routing through Bifrost gateway
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

// OpenAI for transcription
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.BIFROST_BASE_URL || undefined,
});

// ================== MB.MD v9.0: VIBE CODING INTENT DETECTION ==================
/**
 * Detect if user message requires vibe coding (code generation/modification)
 * Follows MB.MD Pattern #25: Platform Compliance Protocol
 */
function detectVibecodingIntent(message: string, context: any): {
  isVibecoding: boolean;
  type: 'fix_bug' | 'identify_elements' | 'make_change' | 'inspect_page' | null;
  confidence: number;
} {
  const msg = message.toLowerCase();
  console.log('[VibeCoding Intent] Analyzing message:', message);
  
  // Pattern matching for vibe coding intents
  const patterns = {
    fix_bug: [
      /fix|debug|repair|broken|not working|not automated|bug|error|issue/i,
      /autocomplete.*not.*work|dropdown.*not.*show|form.*not.*submit/i,
      /why.*not.*work|what.*wrong|help.*fix|make.*plan.*fix/i,
      /automat.*not|need.*automat|should.*automat/i,
    ],
    identify_elements: [
      /identify|find|locate|what elements|inspect|show me|list.*elements/i,
      /what.*on.*page|elements.*page|inputs.*page|buttons.*page/i,
      /id.*all|scan|analyze.*page/i,
    ],
    make_change: [
      /change|modify|update|add|remove|create|edit|build|implement/i,
      /make.*button|add.*feature|update.*style|create.*component/i,
      /improve|enhance|refactor|automate/i,
    ],
    inspect_page: [
      /what page|where am i|current page|this page|what.*looking at/i,
      /page.*title|url|path/i,
    ],
  };
  
  // Special handling for DOM snapshot context
  const hasDOMSnapshot = context?.domSnapshot && Object.keys(context.domSnapshot).length > 0;
  console.log('[VibeCoding Intent] Has DOM snapshot:', hasDOMSnapshot);
  
  // Check for MB.MD protocol keywords FIRST (highest priority)
  if (/(use\s+mb\.md|mb\.md|mbmd|vibe\s*cod|mb\s*protocol|simultaneously|recursively|critically)/i.test(msg)) {
    console.log('[VibeCoding Intent] ✅ MB.MD PROTOCOL DETECTED - confidence: 0.99');
    return {
      isVibecoding: true,
      type: 'make_change',
      confidence: 0.99, // Very high confidence for explicit MB.MD requests
    };
  }
  
  // Check each pattern category
  for (const [type, regexList] of Object.entries(patterns)) {
    for (const regex of regexList) {
      if (regex.test(msg)) {
        const confidence = hasDOMSnapshot ? 0.95 : 0.85; // Higher confidence with DOM data
        console.log(`[VibeCoding Intent] ✅ Pattern matched: ${type} - confidence: ${confidence}`);
        return {
          isVibecoding: true,
          type: type as any,
          confidence,
        };
      }
    }
  }
  
  console.log('[VibeCoding Intent] ❌ No vibe coding pattern matched');
  return {
    isVibecoding: false,
    type: null,
    confidence: 0,
  };
}

// Voice Transcription for Mr. Blue Continuous Voice Mode
router.post("/transcribe", upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    console.log('[MrBlue] Transcribing audio for continuous voice mode');

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[MrBlue] OPENAI_API_KEY not configured, returning demo response');
      fs.unlinkSync(req.file.path);
      return res.json({
        success: true,
        transcript: 'This is a demo transcription. Configure OPENAI_API_KEY for real transcription.'
      });
    }

    // Create a read stream from the uploaded file
    const audioFile = fs.createReadStream(req.file.path);

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
      response_format: "json",
      temperature: 0.2
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    console.log('[MrBlue] Transcription successful:', transcription.text.substring(0, 50));

    res.json({
      success: true,
      transcript: transcription.text
    });

  } catch (error: any) {
    console.error('[MrBlue] Transcription error:', error);

    // Clean up file if it exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to transcribe audio'
    });
  }
});

// Mr. Blue Chat
router.post("/chat", traceRoute("mr-blue-chat"), async (req: Request, res: Response) => {
    try {
      const { message, context, conversationHistory, conversationId, userId } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Message is required"
        });
      }

      // Check if GROQ_API_KEY is configured
      if (!process.env.GROQ_API_KEY) {
        console.error('[MrBlue] GROQ_API_KEY not configured');
        return res.json({
          success: true,
          response: "I'm currently in demo mode. For full AI capabilities, please configure the GROQ_API_KEY environment variable. How can I help you explore Mundo Tango?"
        });
      }

      // Parse context (may be undefined for basic chat)
      let parsedContext: any = {};
      try {
        if (context) {
          parsedContext = typeof context === 'string' ? JSON.parse(context) : context;
        }
      } catch {
        parsedContext = {};
      }

      // Log received context for debugging
      console.log('[Mr. Blue] Received context:', JSON.stringify(parsedContext, null, 2));

      // ================== MB.MD v9.2: CONVERSATION ORCHESTRATOR INTEGRATION ==================
      // Step 1: Enrich message with RAG context
      console.log('[Mr. Blue] 📚 Enriching message with RAG context...');
      const enriched = await conversationOrchestrator.enrichWithContext(message);

      // Step 2: Classify intent (question vs action vs page_analysis)
      console.log('[Mr. Blue] 🎯 Classifying intent...');
      const intent = await conversationOrchestrator.classifyIntent(message);
      console.log(`[Mr. Blue] Intent classified as: ${intent.type} (confidence: ${intent.confidence})`);

      // Step 3: Route based on intent
      if (intent.type === 'question') {
        // Handle question - use GROQ to answer (NO code generation)
        console.log('[Mr. Blue] ❓ Handling as QUESTION');
        const questionResponse = await conversationOrchestrator.handleQuestion(message, enriched);
        
        return res.json({
          success: questionResponse.success,
          mode: 'question',
          response: questionResponse.response,
          sources: questionResponse.sources,
          intent: intent.type,
          confidence: intent.confidence
        });
      } else if (intent.type === 'page_analysis') {
        // Handle page analysis - activate → audit → heal
        console.log('[Mr. Blue] 🔍 Handling as PAGE ANALYSIS');
        const pageId = parsedContext.currentPage || 'unknown-page';
        const analysisResult = await conversationOrchestrator.analyzePage(pageId, false);
        
        return res.json({
          success: analysisResult.success,
          mode: 'page_analysis',
          response: `Page analysis complete for ${pageId}:\n- Activated ${analysisResult.activation.totalAgents} agents\n- Found ${analysisResult.audit.totalIssues} issues (${analysisResult.audit.criticalIssues} critical)\n- Analysis time: ${analysisResult.totalTime}ms`,
          analysisResult,
          intent: intent.type,
          confidence: intent.confidence
        });
      } else if (intent.type === 'action') {
        // Handle action - route to VibeCoding
        console.log('[Mr. Blue] 🔨 Handling as ACTION (VibeCoding)');
        const actionResponse = await conversationOrchestrator.handleActionRequest(
          message,
          parsedContext,
          userId || 0
        );
        
        return res.json({
          success: actionResponse.success,
          mode: 'action',
          response: actionResponse.vibecodingResult?.interpretation || 'Action processed',
          vibecodingResult: actionResponse.vibecodingResult,
          requiresApproval: actionResponse.requiresApproval,
          intent: intent.type,
          confidence: intent.confidence
        });
      }

      // ================== FALLBACK: OLD VIBE CODING DETECTION ==================
      // NOTE: This is now only a fallback if orchestrator doesn't classify properly
      const vibecodingIntent = detectVibecodingIntent(message, parsedContext);
      
      if (vibecodingIntent.isVibecoding) {
        console.log(`[Mr. Blue] 🎯 VIBE CODING INTENT DETECTED: ${vibecodingIntent.type} (confidence: ${vibecodingIntent.confidence})`);
        
        try {
          const sessionId = `vibe_${userId || Date.now()}_${Date.now()}`;
          
          // Auto-detect target file from current page
          let targetFiles = parsedContext.targetFiles || [];
          const currentPage = parsedContext.currentPage || '';
          
          // Map routes to component files
          if (currentPage.includes('/onboarding/step-1') || currentPage.includes('city')) {
            targetFiles = ['client/src/pages/onboarding/CitySelectionPage.tsx'];
          } else if (currentPage.includes('/profile')) {
            targetFiles = ['client/src/pages/ProfilePage.tsx'];
          } else if (currentPage.includes('/events')) {
            targetFiles = ['client/src/pages/EventsPage.tsx'];
          }
          
          const vibeRequest = {
            naturalLanguage: enhancedMessage,
            context: [
              `Current Page: ${parsedContext.currentPage || 'Unknown'}`,
              `Page Title: ${parsedContext.pageTitle || 'Unknown'}`,
              `Target Component File: ${targetFiles[0] || 'Auto-detect'}`,
              ...(parsedContext.domSnapshot ? [`DOM Snapshot: ${JSON.stringify(parsedContext.domSnapshot, null, 2)}`] : []),
              ...(parsedContext.breadcrumbs || []).slice(-5).map((b: any) => `Recent Action: ${b.action} on ${b.page}`)
            ],
            targetFiles,
            userId: userId || 0,
            sessionId,
          };
          
          console.log('[Mr. Blue] 🔨 Calling VibeCodingService...');
          const vibeResult = await vibeCodingService.generateCode(vibeRequest);
          
          if (vibeResult.success) {
            console.log(`[Mr. Blue] ✅ Vibe coding successful: ${vibeResult.fileChanges.length} files affected`);
            
            return res.json({
              success: true,
              mode: 'vibecoding',
              response: vibeResult.interpretation,
              vibecodingResult: {
                sessionId: vibeResult.sessionId,
                fileChanges: vibeResult.fileChanges,
                validationResults: vibeResult.validationResults,
                estimatedImpact: vibeResult.estimatedImpact,
              },
              requiresApproval: true,
            });
          } else {
            console.log('[Mr. Blue] ⚠️ Vibe coding failed, falling back to AI chat');
            // Fall through to normal AI chat
          }
        } catch (error) {
          console.error('[Mr. Blue] ❌ Vibe coding error:', error);
          // Fall through to normal AI chat
        }
      }

      // Detect context type: Visual Editor vs General Chat
      const isVisualEditorContext = parsedContext?.selectedElement || parsedContext?.recentEdits;
      const isGeneralContext = parsedContext?.breadcrumbs || parsedContext?.currentPage || parsedContext?.userIntent;

      let systemPrompt = '';

      if (isGeneralContext) {
        // Build context-aware system message for general chat
        const currentPage = parsedContext?.currentPage || 'Unknown';
        const pageTitle = parsedContext?.pageTitle || 'Unknown';
        const userIntent = parsedContext?.userIntent || 'general inquiry';
        const breadcrumbs = parsedContext?.breadcrumbs || [];

        // Build recent actions summary
        let recentActionsText = 'None';
        if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
          recentActionsText = breadcrumbs.slice(-5).map((b: any) => {
            const target = b.target ? ` (${b.target})` : '';
            return `- ${b.action} on ${b.page}${target}`;
          }).join('\n');
        }

        systemPrompt = `You are Mr. Blue, the Mundo Tango AI assistant for the global tango community platform.

CURRENT CONTEXT:
- Page: ${currentPage}
- Page Title: ${pageTitle}
- User Intent: ${userIntent}

RECENT USER ACTIONS:
${recentActionsText}

YOUR ROLE:
Provide context-aware assistance based on where the user is and what they're doing. Always acknowledge their current page and activity in your response.

PAGE-SPECIFIC GUIDANCE:
- If on /events: Help find milongas, festivals, workshops. Offer event recommendations.
- If on /profile: Help with profile editing, settings, tango preferences.
- If on /messages: Assist with messaging features, conversations.
- If on /groups: Help find groups, join communities, or create new groups.
- If on /housing: Help find accommodation for festivals, connect with hosts.
- If on /marketplace: Help browse tango shoes, clothing, music, accessories.
- If on /feed: Help with posts, connections, community updates.

INSTRUCTIONS:
- Be warm, friendly, and conversational
- ALWAYS mention the current page in your first response
- Provide specific, actionable help based on their location
- Keep responses concise (2-4 sentences)
- Show enthusiasm for tango culture

Example: If user is on /events and asks "Help me", respond: "I see you're viewing events! I can help you discover amazing milongas, festivals, and workshops. Are you looking for events in a specific city, or would you like recommendations based on your preferences?"`;

        console.log('[Mr. Blue] Using GENERAL CHAT context');
        console.log('[Mr. Blue] Current Page:', currentPage);
        console.log('[Mr. Blue] User Intent:', userIntent);
      } else if (isVisualEditorContext) {
        // Build rich context for Visual Editor
        const selectedElementInfo = parsedContext?.selectedElement 
          ? `Selected Element: ${parsedContext.selectedElement.tagName} (test-id: ${parsedContext.selectedElement.testId || 'none'})
   Class: ${parsedContext.selectedElement.className}
   Text: ${parsedContext.selectedElement.text}`
          : 'No element selected';

        const recentEditsInfo = parsedContext?.recentEdits && parsedContext.recentEdits.length > 0
          ? `Recent edits: ${parsedContext.recentEdits.join(', ')}`
          : 'No recent edits';

        systemPrompt = `You are Mr. Blue, an AI assistant in the Visual Editor of Mundo Tango platform.

VISUAL EDITOR CONTEXT:
- Current Page: ${parsedContext.currentPage || 'Unknown'}
- ${selectedElementInfo}
- Total Edits: ${parsedContext.editsCount || 0}
- ${recentEditsInfo}

YOUR CAPABILITIES:
1. Answer questions about the current page and selected elements
2. Help users make design changes to elements
3. Provide guidance on editing, styling, and layout
4. Understand context of what the user is looking at and working on

INSTRUCTIONS:
- Be conversational and helpful
- When asked "what page am I on" or similar, tell them the current page
- When asked about selected elements, describe what's selected
- Provide actionable advice for making changes
- Keep responses concise but informative (2-3 sentences max)

Be friendly, context-aware, and ready to help with Visual Editor tasks!`;

        console.log('[Mr. Blue] Using VISUAL EDITOR context');
      } else {
        // No context provided - default system prompt
        systemPrompt = `You are Mr. Blue, the Mundo Tango AI assistant for the global tango community platform.

Help users navigate the platform, answer questions, and provide personalized recommendations. Be warm, friendly, and enthusiastic about tango culture.`;

        console.log('[Mr. Blue] No context provided - using default prompt');
      }

      // Log the system prompt for debugging
      console.log('[Mr. Blue] System prompt:', systemPrompt.substring(0, 200) + '...');

      // SYSTEM 1: Context Service - RAG with LanceDB semantic search
      // Search documentation for relevant context based on user message
      let ragContext = '';
      try {
        await contextService.initialize(); // Ensure indexed
        const searchResults = await contextService.search(message, 3); // Top 3 relevant chunks
        
        if (searchResults.length > 0) {
          ragContext = '\n\nRELEVANT DOCUMENTATION:\n' + searchResults.map((result, idx) => 
            `[${idx + 1}] ${result.metadata.source} (${result.metadata.fileType}):\n${result.content.substring(0, 300)}...`
          ).join('\n\n');
          
          console.log(`[Mr. Blue] 📚 Found ${searchResults.length} relevant docs (avg similarity: ${
            (searchResults.reduce((sum, r) => sum + r.similarity, 0) / searchResults.length).toFixed(3)
          })`);
        }
      } catch (error) {
        console.error('[Mr. Blue] Context search failed:', error);
        // Continue without RAG context - non-blocking
      }

      // SYSTEM 8: Memory System - Retrieve relevant user memories
      let memoryContext = '';
      if (userId && process.env.OPENAI_API_KEY) {
        try {
          await memoryService.initialize();
          const memories = await memoryService.retrieveMemories(userId, message, {
            limit: 3,
            minSimilarity: 0.7
          });
          
          if (memories.length > 0) {
            const preferences = memories.filter(m => m.memory.memoryType === 'preference');
            const facts = memories.filter(m => m.memory.memoryType === 'fact');
            const pastFeedback = memories.filter(m => m.memory.memoryType === 'feedback');
            
            let memoryParts: string[] = [];
            
            if (preferences.length > 0) {
              memoryParts.push('USER PREFERENCES:\n' + preferences.map(m => 
                `- ${m.memory.content}`
              ).join('\n'));
            }
            
            if (facts.length > 0) {
              memoryParts.push('USER FACTS:\n' + facts.map(m => 
                `- ${m.memory.content}`
              ).join('\n'));
            }
            
            if (pastFeedback.length > 0) {
              memoryParts.push('PAST FEEDBACK:\n' + pastFeedback.map(m => 
                `- ${m.memory.content}`
              ).join('\n'));
            }
            
            if (memoryParts.length > 0) {
              memoryContext = '\n\nWHAT I REMEMBER ABOUT YOU:\n' + memoryParts.join('\n\n');
              console.log(`[Mr. Blue] 💭 Retrieved ${memories.length} memories for user ${userId}`);
            }
          }
        } catch (error) {
          console.error('[Mr. Blue] Memory retrieval failed:', error);
          // Continue without memory context - non-blocking
        }
      }

      // Build message history
      const messages: any[] = [
        { role: "system", content: systemPrompt + ragContext + memoryContext }
      ];

      // Get conversation context from database if conversationId provided
      let dbContext: any[] = [];
      if (conversationId) {
        try {
          dbContext = await getConversationContext(conversationId, 10);
        } catch (error) {
          console.error('[MrBlue] Failed to get conversation context:', error);
        }
      }

      // Use database context if available, otherwise use provided conversationHistory
      if (dbContext.length > 0) {
        messages.push(...dbContext);
      } else if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.push(...conversationHistory.slice(-6));
      }

      // Add current user message (with MB.MD protocol already appended)
      messages.push({ role: "user", content: enhancedMessage });

      const completion = await groq.chat.completions.create({
        messages,
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 300,
      });

      const response = completion.choices[0]?.message?.content || 
        "I'm sorry, I couldn't process that request.";

      // Save messages to history if conversationId and userId provided
      if (conversationId && userId) {
        try {
          await saveMessageToHistory(conversationId, userId, 'user', enhancedMessage);
          await saveMessageToHistory(conversationId, userId, 'assistant', response);
          
          // SYSTEM 8: Store conversation in memory
          if (process.env.OPENAI_API_KEY) {
            try {
              // Store user message
              await memoryService.storeMemory(
                userId,
                `User: ${enhancedMessage}\nMr Blue: ${response}`,
                'conversation',
                {
                  importance: 5,
                  metadata: {
                    conversationId,
                    timestamp: Date.now()
                  }
                }
              );
              
              // Get conversation history to check if we should extract preferences or summarize
              const conversationMessages = await getConversationContext(conversationId, 100);
              
              // Extract preferences every 10 messages
              if (conversationMessages.length > 0 && conversationMessages.length % 10 === 0) {
                memoryService.extractPreferences(userId, conversationMessages)
                  .then(prefs => {
                    if (prefs.length > 0) {
                      console.log(`[Mr. Blue] 🎯 Extracted ${prefs.length} preferences`);
                    }
                  })
                  .catch(err => console.error('[Mr. Blue] Preference extraction failed:', err));
              }
              
              // Summarize conversation after 50 messages
              if (conversationMessages.length >= 50 && conversationMessages.length % 50 === 0) {
                memoryService.summarizeConversation(userId, conversationMessages, conversationId.toString())
                  .then(result => {
                    if (result.success) {
                      console.log('[Mr. Blue] 📝 Conversation summarized');
                    }
                  })
                  .catch(err => console.error('[Mr. Blue] Summarization failed:', err));
              }
            } catch (error) {
              console.error('[Mr. Blue] Memory storage failed:', error);
              // Non-blocking - continue even if memory storage fails
            }
          }
        } catch (error) {
          console.error('[MrBlue] Failed to save messages to history:', error);
        }
      }

      res.json({
        success: true,
        response
      });
    } catch (error: any) {
      console.error('[MrBlue] Chat error:', {
        message: error.message,
        status: error.status,
        type: error.type,
        full: error
      });
      
      // Provide helpful error message based on error type
      const errorMessage = error.status === 401 
        ? "API authentication failed. Please check GROQ_API_KEY configuration."
        : error.status === 429
        ? "API rate limit exceeded. Please try again later."
        : error.message || "Failed to process chat request";
      
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });

// Streaming chat with work progress (SSE)
router.post("/stream", async (req: Request, res: Response) => {
  try {
    const { message, context, mode } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    // Check if GROQ_API_KEY is configured
    if (!process.env.GROQ_API_KEY) {
      console.error('[MrBlue] GROQ_API_KEY not configured for streaming');
      return res.json({
        success: true,
        response: "I'm currently in demo mode. For full AI streaming capabilities, please configure the GROQ_API_KEY environment variable."
      });
    }

    // Initialize SSE
    streamingService.initSSE(res);

    // Detect if this is an editing request
    const isEditRequest = detectEditRequest(message);

    if (isEditRequest && mode === 'visual_editor') {
      // Stream visual edit workflow
      await streamingService.streamVisualEdit(res, {
        prompt: message,
        elementId: context?.selectedElement?.id,
        currentPage: context?.currentPage,
        
        // Callback to apply instant changes
        onApplyChange: async (change) => {
          // This would trigger iframe DOM update
          streamingService.send(res, {
            type: 'progress',
            message: `Applying ${change.type} change...`,
            data: { change }
          });
        },
        
        // Callback for code generation
        onGenerateCode: async (code) => {
          streamingService.send(res, {
            type: 'code',
            code,
            message: 'Code generated!'
          });
        }
      });
    } else {
      // Regular chat - stream AI response
      streamingService.send(res, {
        type: 'progress',
        status: 'analyzing',
        message: '🤔 Thinking...'
      });

      // Get AI response
      const messages: any[] = [
        { role: "system", content: "You are Mr. Blue, a helpful AI assistant for Mundo Tango." },
        { role: "user", content: message }
      ];

      const completion = await groq.chat.completions.create({
        messages,
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 300,
      });

      const response = completion.choices[0]?.message?.content || 
        "I'm sorry, I couldn't process that request.";

      streamingService.send(res, {
        type: 'completion',
        status: 'done',
        message: response
      });

      res.end();
    }
  } catch (error: any) {
    console.error('[MrBlue] Stream error:', error);
    streamingService.send(res, {
      type: 'error',
      message: error.message || 'Failed to process request'
    });
    res.end();
  }
});

// Breadcrumb tracking
router.post("/breadcrumbs", async (req: Request, res: Response) => {
  try {
    const breadcrumb = req.body;
    
    // Store in database (optional - can implement later)
    // For now, just acknowledge receipt
    
    res.json({ success: true });
  } catch (error) {
    console.error('[Breadcrumbs] Tracking error:', error);
    res.status(500).json({ success: false });
  }
});

/**
 * Detect if message is an editing request
 */
function detectEditRequest(message: string): boolean {
  const editKeywords = [
    'make', 'change', 'update', 'edit', 'modify',
    'color', 'blue', 'red', 'green', 'style',
    'move', 'resize', 'bigger', 'smaller',
    'left', 'right', 'center'
  ];

  const lower = message.toLowerCase();
  return editKeywords.some(keyword => lower.includes(keyword));
}

// ============================================================================
// CONVERSATION PERSISTENCE
// ============================================================================

// Create/Save conversation
router.post("/conversations", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const userId = req.user!.id;

    const [conversation] = await db.insert(mrBlueConversations)
      .values({
        userId,
        title: title || `Conversation ${new Date().toLocaleDateString()}`,
        lastMessageAt: new Date(),
      })
      .returning();

    res.json(conversation);
  } catch (error: any) {
    console.error('[MrBlue] Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Update conversation
router.put("/conversations/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, lastMessageAt } = req.body;
    const userId = req.user!.id;

    const [conversation] = await db.update(mrBlueConversations)
      .set({
        title,
        lastMessageAt: lastMessageAt ? new Date(lastMessageAt) : new Date(),
      })
      .where(and(
        eq(mrBlueConversations.id, parseInt(id)),
        eq(mrBlueConversations.userId, userId)
      ))
      .returning();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error: any) {
    console.error('[MrBlue] Update conversation error:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// Load specific conversation with messages
router.get("/conversations/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const conversation = await db.query.mrBlueConversations.findFirst({
      where: and(
        eq(mrBlueConversations.id, parseInt(id)),
        eq(mrBlueConversations.userId, userId)
      ),
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get messages for this conversation
    const messages = await db.query.mrBlueMessages.findMany({
      where: eq(mrBlueMessages.conversationId, parseInt(id)),
      orderBy: [mrBlueMessages.createdAt],
    });

    res.json({
      ...conversation,
      messages,
    });
  } catch (error: any) {
    console.error('[MrBlue] Load conversation error:', error);
    res.status(500).json({ error: 'Failed to load conversation' });
  }
});

// List all conversations for user
router.get("/conversations", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const conversations = await db.query.mrBlueConversations.findMany({
      where: eq(mrBlueConversations.userId, userId),
      orderBy: [desc(mrBlueConversations.lastMessageAt)],
      limit: 50,
    });

    res.json(conversations);
  } catch (error: any) {
    console.error('[MrBlue] List conversations error:', error);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
});

// Delete conversation
router.delete("/conversations/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await db.delete(mrBlueConversations)
      .where(and(
        eq(mrBlueConversations.id, parseInt(id)),
        eq(mrBlueConversations.userId, userId)
      ));

    res.json({ success: true });
  } catch (error: any) {
    console.error('[MrBlue] Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Get messages for conversation with pagination (for infinite scroll)
router.get("/conversations/:id/messages", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { offset = '0', limit = '50' } = req.query;
    const userId = req.user!.id;
    
    const conversation = await db.query.mrBlueConversations.findFirst({
      where: and(
        eq(mrBlueConversations.id, parseInt(id)),
        eq(mrBlueConversations.userId, userId)
      ),
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    const messages = await db.query.mrBlueMessages.findMany({
      where: eq(mrBlueMessages.conversationId, parseInt(id)),
      orderBy: [desc(mrBlueMessages.createdAt)],
      offset: parseInt(offset as string),
      limit: parseInt(limit as string),
    });
    
    res.json(messages);
  } catch (error: any) {
    console.error('[MrBlue] Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// ============================================================================
// MESSAGES
// ============================================================================

// Save message
router.post("/messages", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, role, content, metadata } = req.body;

    if (!conversationId || !role || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [message] = await db.insert(mrBlueMessages)
      .values({
        conversationId,
        role,
        content,
        metadata,
      })
      .returning();

    // Update conversation's lastMessageAt
    await db.update(mrBlueConversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(mrBlueConversations.id, conversationId));

    res.json(message);
  } catch (error: any) {
    console.error('[MrBlue] Save message error:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Mark message as read
router.post("/messages/:id/read", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await db.update(mrBlueMessages)
      .set({
        readAt: new Date(),
        readBy: sql`array_append(COALESCE(read_by, ARRAY[]::integer[]), ${userId})`,
      })
      .where(eq(mrBlueMessages.id, parseInt(id)));

    res.json({ success: true });
  } catch (error: any) {
    console.error('[MrBlue] Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// ============================================================================
// MESSAGE ACTIONS (EDIT, DELETE, REACT, BOOKMARK, SHARE)
// ============================================================================

// Edit message
router.patch("/messages/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const [updated] = await db.update(mrBlueMessages)
      .set({ 
        content, 
        isEdited: true, 
        editedAt: sql`now()` 
      })
      .where(and(
        eq(mrBlueMessages.id, parseInt(id)),
        eq(mrBlueMessages.userId, userId),
        isNull(mrBlueMessages.deletedAt)
      ))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('[MrBlue] Edit message error:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// Delete message (soft delete)
router.delete("/messages/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [deleted] = await db.update(mrBlueMessages)
      .set({ deletedAt: sql`now()` })
      .where(and(
        eq(mrBlueMessages.id, parseInt(id)),
        eq(mrBlueMessages.userId, userId),
        isNull(mrBlueMessages.deletedAt)
      ))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('[MrBlue] Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// React to message (toggle)
router.post("/messages/:id/react", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user!.id;

    if (!emoji || emoji.length > 10) {
      return res.status(400).json({ error: 'Valid emoji is required' });
    }

    // Check if reaction already exists
    const existing = await db.query.messageReactions.findFirst({
      where: and(
        eq(messageReactions.messageId, parseInt(id)),
        eq(messageReactions.userId, userId),
        eq(messageReactions.emoji, emoji)
      ),
    });

    if (existing) {
      // Remove reaction
      await db.delete(messageReactions)
        .where(eq(messageReactions.id, existing.id));
      
      return res.json({ action: 'removed' });
    }

    // Add reaction
    const [reaction] = await db.insert(messageReactions)
      .values({ 
        messageId: parseInt(id), 
        userId, 
        emoji 
      })
      .returning();

    res.json({ action: 'added', reaction });
  } catch (error: any) {
    console.error('[MrBlue] React to message error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Get message reactions
router.get("/messages/:id/reactions", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reactions = await db.query.messageReactions.findMany({
      where: eq(messageReactions.messageId, parseInt(id)),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            username: true,
            profileImage: true,
          }
        }
      }
    });

    // Group reactions by emoji
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: []
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.userId);
      return acc;
    }, {} as Record<string, any>);

    res.json(Object.values(grouped));
  } catch (error: any) {
    console.error('[MrBlue] Get reactions error:', error);
    res.status(500).json({ error: 'Failed to get reactions' });
  }
});

// Bookmark message
router.post("/messages/:id/bookmark", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user!.id;

    // Check if already bookmarked
    const existing = await db.query.messageBookmarks.findFirst({
      where: and(
        eq(messageBookmarks.messageId, parseInt(id)),
        eq(messageBookmarks.userId, userId)
      ),
    });

    if (existing) {
      // Update note if provided
      if (note !== undefined) {
        const [updated] = await db.update(messageBookmarks)
          .set({ note })
          .where(eq(messageBookmarks.id, existing.id))
          .returning();
        
        return res.json({ action: 'updated', bookmark: updated });
      }
      
      // Remove bookmark
      await db.delete(messageBookmarks)
        .where(eq(messageBookmarks.id, existing.id));
      
      return res.json({ action: 'removed' });
    }

    // Add bookmark
    const [bookmark] = await db.insert(messageBookmarks)
      .values({ 
        messageId: parseInt(id), 
        userId, 
        note 
      })
      .returning();

    res.json({ action: 'added', bookmark });
  } catch (error: any) {
    console.error('[MrBlue] Bookmark message error:', error);
    res.status(500).json({ error: 'Failed to bookmark message' });
  }
});

// Get user's bookmarks
router.get("/bookmarks", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const bookmarks = await db.query.messageBookmarks.findMany({
      where: eq(messageBookmarks.userId, userId),
      with: {
        message: true
      },
      orderBy: desc(messageBookmarks.createdAt)
    });

    res.json(bookmarks);
  } catch (error: any) {
    console.error('[MrBlue] Get bookmarks error:', error);
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
});

// Share message (generate shareable URL)
router.post("/messages/:id/share", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const message = await db.query.mrBlueMessages.findFirst({
      where: eq(mrBlueMessages.id, parseInt(id))
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const shareUrl = `${req.protocol}://${req.get('host')}/mr-blue/message/${message.id}`;
    
    res.json({ url: shareUrl });
  } catch (error: any) {
    console.error('[MrBlue] Share message error:', error);
    res.status(500).json({ error: 'Failed to generate share URL' });
  }
});

// ============================================================================
// MB.MD v9.0: DOM INSPECTOR ENDPOINT
// ============================================================================
router.post("/inspect-page", async (req: Request, res: Response) => {
  try {
    const { currentPage, domSnapshot } = req.body;
    
    if (!domSnapshot) {
      return res.status(400).json({
        success: false,
        message: 'DOM snapshot is required'
      });
    }
    
    console.log('[Mr. Blue] 🔍 DOM Inspector called for page:', currentPage);
    
    // Analyze DOM elements
    const analysis = {
      currentPage: currentPage || 'Unknown',
      summary: {
        totalInputs: domSnapshot.inputs?.length || 0,
        totalButtons: domSnapshot.buttons?.length || 0,
        totalSelects: domSnapshot.selects?.length || 0,
        totalErrors: domSnapshot.errors?.length || 0,
      },
      elements: {
        inputs: domSnapshot.inputs || [],
        buttons: domSnapshot.buttons || [],
        selects: domSnapshot.selects || [],
        errors: domSnapshot.errors || [],
      },
      insights: []
    };
    
    // Generate insights
    if (analysis.summary.totalErrors > 0) {
      analysis.insights.push(`⚠️ Found ${analysis.summary.totalErrors} error message(s) on page`);
    }
    
    if (analysis.summary.totalInputs === 0) {
      analysis.insights.push('ℹ️ No input fields found on this page');
    }
    
    const inputsWithoutTestId = domSnapshot.inputs?.filter((i: any) => !i.testId).length || 0;
    if (inputsWithoutTestId > 0) {
      analysis.insights.push(`⚠️ ${inputsWithoutTestId} input(s) missing data-testid attributes`);
    }
    
    console.log('[Mr. Blue] 🔍 DOM Inspector analysis:', analysis.summary);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error('[Mr. Blue] DOM Inspector error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to inspect page'
    });
  }
});

// ============================================================================
// CODE GENERATION
// ============================================================================

const codeGenerator = new CodeGenerator();

// Generate code endpoint
router.post("/generate-code", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { prompt, context } = req.body;
    
    const result = await codeGenerator.generateComponent(prompt, context);
    
    res.json(result);
  } catch (error: any) {
    console.error('[Code Generation] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Modify code endpoint
router.post("/modify-code", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { originalCode, modification } = req.body;
    
    const result = await codeGenerator.modifyCode(originalCode, modification);
    
    res.json(result);
  } catch (error: any) {
    console.error('[Code Modification] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// TIER-BASED CAPABILITIES
// ============================================================================

// Get user's Mr. Blue capabilities based on tier
router.get("/capabilities", async (req, res) => {
  try {
    // Default to tier 0 if no user (guest access)
    const userTier = (req.user as any)?.tier || 0;
    const capabilities = getMrBlueCapabilities(userTier);
    const tierName = getTierName(userTier);
    
    res.json({
      tier: userTier,
      tierName,
      capabilities,
      upgradeUrl: userTier < 8 ? '/premium' : null
    });
  } catch (error: any) {
    console.error('[MrBlue] Capabilities error:', error);
    res.status(500).json({ error: 'Failed to get capabilities' });
  }
});

// ============================================================================
// VIBE CODING: APPLY CHANGES
// ============================================================================

/**
 * Apply generated code changes to files
 * POST /api/mrblue/vibecoding/apply
 */
router.post("/vibecoding/apply", async (req: Request, res: Response) => {
  try {
    const { sessionId, fileChanges } = req.body;

    if (!sessionId || !fileChanges || !Array.isArray(fileChanges)) {
      return res.status(400).json({ error: 'Missing sessionId or fileChanges' });
    }

    console.log(`[VibeCoding] Applying ${fileChanges.length} file changes for session ${sessionId}`);

    const appliedFiles: string[] = [];
    const errors: Array<{ filePath: string; error: string }> = [];

    // Import fs/promises for async file operations
    const fsPromises = await import('fs/promises');
    const path = await import('path');

    for (const change of fileChanges) {
      try {
        const { filePath, newContent } = change;
        
        // Resolve absolute path (assuming workspace root)
        const absolutePath = path.resolve(process.cwd(), filePath);
        
        // Ensure directory exists
        const directory = path.dirname(absolutePath);
        await fsPromises.mkdir(directory, { recursive: true });

        // Write file
        await fsPromises.writeFile(absolutePath, newContent, 'utf-8');
        
        appliedFiles.push(filePath);
        console.log(`[VibeCoding] ✅ Applied: ${filePath}`);
      } catch (error: any) {
        console.error(`[VibeCoding] ❌ Failed to apply ${change.filePath}:`, error);
        errors.push({
          filePath: change.filePath,
          error: error.message,
        });
      }
    }

    // Return results
    res.json({
      success: errors.length === 0,
      appliedFiles,
      errors,
      message: errors.length === 0 
        ? `Successfully applied ${appliedFiles.length} file changes`
        : `Applied ${appliedFiles.length} files with ${errors.length} errors`,
    });

  } catch (error: any) {
    console.error('[VibeCoding] Apply error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ============================================================================
// MB.MD v9.2: PAGE ANALYSIS ENDPOINT
// ============================================================================

/**
 * Analyze page health: Activate → Audit → Self-Heal
 * POST /api/mrblue/analyze-page
 * 
 * Body: { pageId: string, autoHeal?: boolean }
 * Returns: { success, activation, audit, healing?, totalTime }
 */
router.post("/analyze-page", async (req: Request, res: Response) => {
  try {
    const { pageId, autoHeal = false } = req.body;

    if (!pageId) {
      return res.status(400).json({
        success: false,
        error: 'pageId is required'
      });
    }

    console.log(`[MrBlue] 🔍 Analyzing page: ${pageId} (autoHeal: ${autoHeal})`);

    const result = await conversationOrchestrator.analyzePage(pageId, autoHeal);

    console.log(`[MrBlue] ✅ Page analysis complete in ${result.totalTime}ms`);

    res.json(result);

  } catch (error: any) {
    console.error('[MrBlue] Page analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze page'
    });
  }
});

export default router;
