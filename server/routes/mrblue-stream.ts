/**
 * Mr. Blue Streaming Chat API
 * Server-Sent Events (SSE) for real-time "vibe coding"
 * 
 * Flow:
 * 1. User says "make it blue"
 * 2. Stream: "I'll change the button color... Finding button element... Applying CSS..."
 * 3. Visual change: Button turns blue in real-time as AI streams text
 * 
 * MB.MD v9.2: Routes code generation requests to VibeCoding engine
 */

import { Router, type Request, Response } from "express";
import { GroqService, GROQ_MODELS } from "../services/ai/GroqService";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { getMrBlueCapabilities } from "../utils/mrBlueCapabilities";

const router = Router();

/**
 * Detect if message requires VibeCoding (actual code generation)
 * MB.MD v9.2: Routing logic for code generation vs visual changes
 */
function detectVibeCodeIntent(prompt: string, context: any): {
  isVibeCoding: boolean;
  confidence: number;
  reason: string;
} {
  const lower = prompt.toLowerCase();
  
  // High-confidence VibeCoding patterns
  const codePatterns = [
    /\b(create|generate|build|add|make)\s+(a|an|new)?\s*(component|page|endpoint|api|route|function|class|interface)/i,
    /\bimplement\b/i,
    /\bscaffold|setup|initialize\b/i,
    /\bwrite\s+code/i,
    /\badd\s+test/i,
    /\bcreate.*database|table|model/i,
  ];
  
  for (const pattern of codePatterns) {
    if (pattern.test(prompt)) {
      return { isVibeCoding: true, confidence: 0.95, reason: 'Code generation keyword detected' };
    }
  }
  
  // Medium-confidence: Modifying without selected element (requires code generation)
  const hasElement = context?.selectedElement;
  const modifyPatterns = [
    /\b(make|change|update|modify)\b.*\b(button|element|component|section|header|footer|nav|menu)/i,
  ];
  
  for (const pattern of modifyPatterns) {
    if (pattern.test(prompt) && !hasElement) {
      return { isVibeCoding: true, confidence: 0.80, reason: 'Modification request without selected element' };
    }
  }
  
  // Low confidence: Simple visual changes with selected element (use instant visual change)
  if (hasElement && (/make.*blue|color|bigger|smaller/i.test(prompt))) {
    return { isVibeCoding: false, confidence: 0.90, reason: 'Simple visual change with selected element' };
  }
  
  // Default: Questions or unclear intent (use AI chat)
  return { isVibeCoding: false, confidence: 0.50, reason: 'Default to chat mode' };
}

/**
 * Extract code blocks from markdown
 */
function extractCodeBlocks(text: string): Array<{ language: string; code: string }> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string }> = [];
  
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || 'typescript',
      code: match[2].trim(),
    });
  }
  
  return blocks;
}

/**
 * Parse visual editing command and extract change type
 */
function parseVisualCommand(prompt: string, context: any): { 
  changeType: 'style' | 'text' | 'position' | 'class' | 'delete' | 'none';
  property?: string;
  value?: string;
  element?: string;
} {
  const lowerPrompt = prompt.toLowerCase();
  
  // Color changes
  if (/make.*blue|change.*color.*blue|turn.*blue/i.test(prompt)) {
    return { changeType: 'style', property: 'backgroundColor', value: '#3b82f6' };
  }
  if (/make.*red|change.*color.*red|turn.*red/i.test(prompt)) {
    return { changeType: 'style', property: 'backgroundColor', value: '#ef4444' };
  }
  if (/make.*green|change.*color.*green|turn.*green/i.test(prompt)) {
    return { changeType: 'style', property: 'backgroundColor', value: '#10b981' };
  }
  
  // Size changes
  if (/make.*bigger|increase.*size|larger/i.test(prompt)) {
    return { changeType: 'style', property: 'fontSize', value: '1.5em' };
  }
  if (/make.*smaller|decrease.*size|reduce/i.test(prompt)) {
    return { changeType: 'style', property: 'fontSize', value: '0.8em' };
  }
  
  // Text changes
  if (/change.*text|update.*text|say/i.test(prompt)) {
    const match = prompt.match(/(?:say|text)\s+["']([^"']+)["']/i);
    if (match) {
      return { changeType: 'text', value: match[1] };
    }
  }
  
  // Delete
  if (/delete|remove|hide/i.test(prompt)) {
    return { changeType: 'delete' };
  }
  
  return { changeType: 'none' };
}

/**
 * Stream Mr. Blue chat response with visual changes
 * POST /api/mrblue/stream
 */
router.post("/stream", async (req: Request, res: Response) => {
  try {
    const { message, context, mode } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    // Parse visual context
    let visualContext: any = {};
    try {
      if (context) {
        visualContext = typeof context === 'string' ? JSON.parse(context) : context;
      }
    } catch {
      visualContext = {};
    }

    // MB.MD v9.2: Detect if this is a VibeCoding request (code generation)
    const vibeIntent = detectVibeCodeIntent(message, visualContext);
    console.log(`[Stream] VibeCoding intent: ${vibeIntent.isVibeCoding}, confidence: ${vibeIntent.confidence}, reason: ${vibeIntent.reason}`);

    // ROUTE TO VIBECODING if intent detected
    if (vibeIntent.isVibeCoding && vibeIntent.confidence >= 0.80) {
      console.log(`[Stream] Routing to VibeCoding engine...`);
      
      res.write(`data: ${JSON.stringify({ 
        type: 'progress', 
        message: '🧠 Analyzing your request...',
        status: 'analyzing'
      })}\n\n`);

      await sleep(300);

      // Check user capabilities
      const user = (req as any).user;
      const userTier = user?.tier || 8; // Default to God Level during beta
      const capabilities = getMrBlueCapabilities(userTier);

      if (!capabilities.autonomousVibeCoding) {
        res.write(`data: ${JSON.stringify({ 
          type: 'error',
          message: 'VibeCoding requires Elite (Tier 7) or God Level (Tier 8)'
        })}\n\n`);
        res.end();
        return;
      }

      res.write(`data: ${JSON.stringify({ 
        type: 'progress', 
        message: '✨ Generating code with GROQ Llama-3.3-70b...',
        status: 'generating'
      })}\n\n`);

      // Build VibeCoding system prompt
      const vibeSystemPrompt = `You are Mr. Blue, an expert code generation AI using MB.MD v9.2 methodology.

CRITICAL RULES:
1. ALWAYS generate actual, production-ready code
2. NEVER say "I'll help you" without code
3. NEVER claim completion without showing code
4. Use modern best practices (React, TypeScript, Tailwind CSS)

Current Context:
- Page: ${visualContext?.currentPage || 'unknown'}
- Theme: MT Ocean (blues and warm accents)
- Framework: React + TypeScript + Tailwind CSS
- UI Library: shadcn/ui + Radix UI

TASK: Generate complete, working code for the user's request.

RESPONSE FORMAT:
\`\`\`typescript
// Your generated code here
\`\`\`

Explanation: [Brief explanation of what you built]`;

      try {
        // Generate code using GROQ
        const codeResponse = await GroqService.querySimple({
          prompt: message,
          systemPrompt: vibeSystemPrompt,
          model: GROQ_MODELS.LLAMA_70B,
          temperature: 0.3,
        });

        if (!codeResponse.success || !codeResponse.content) {
          throw new Error('Code generation failed');
        }

        // Extract code blocks
        const codeBlocks = extractCodeBlocks(codeResponse.content);

        res.write(`data: ${JSON.stringify({ 
          type: 'vibe_coding_progress',
          message: '✅ Code generated!',
          status: 'done',
          data: {
            code: codeBlocks,
            explanation: codeResponse.content,
            model: GROQ_MODELS.LLAMA_70B,
            tokensUsed: codeResponse.tokensUsed,
          }
        })}\n\n`);

        res.write(`data: ${JSON.stringify({ 
          type: 'chat_response',
          message: codeResponse.content
        })}\n\n`);

        res.end();
        return;

      } catch (error: any) {
        console.error('[Stream] VibeCoding error:', error);
        res.write(`data: ${JSON.stringify({ 
          type: 'error',
          message: `VibeCoding failed: ${error.message}`
        })}\n\n`);
        res.end();
        return;
      }
    }

    // FALLBACK: Simple visual changes (original logic)
    // Parse command for instant visual changes
    const command = parseVisualCommand(message, visualContext);
    
    // PHASE 1: Acknowledge and describe what we're doing
    const hasElement = visualContext?.selectedElement;
    const elementDesc = hasElement 
      ? `${visualContext.selectedElement.tagName} element`
      : 'element';

    let thinkingMessage = '';
    switch (command.changeType) {
      case 'style':
        if (command.property === 'backgroundColor') {
          thinkingMessage = `I'll change the ${elementDesc} color to ${command.value}...`;
        } else if (command.property === 'fontSize') {
          thinkingMessage = `I'll adjust the ${elementDesc} size...`;
        } else {
          thinkingMessage = `I'll update the ${elementDesc} styling...`;
        }
        break;
      case 'text':
        thinkingMessage = `I'll update the text content...`;
        break;
      case 'delete':
        thinkingMessage = `I'll remove the ${elementDesc}...`;
        break;
      default:
        thinkingMessage = `Let me analyze what you'd like to change...`;
    }

    // Stream thinking message
    res.write(`data: ${JSON.stringify({ 
      type: 'progress', 
      message: thinkingMessage,
      status: 'analyzing'
    })}\n\n`);

    await sleep(300);

    // PHASE 2: Apply visual change if it's a direct command
    if (command.changeType !== 'none' && hasElement) {
      res.write(`data: ${JSON.stringify({ 
        type: 'progress', 
        message: 'Applying change to iframe...',
        status: 'applying'
      })}\n\n`);

      // Send change instruction to frontend
      res.write(`data: ${JSON.stringify({ 
        type: 'visual_change',
        change: command
      })}\n\n`);

      await sleep(200);

      res.write(`data: ${JSON.stringify({ 
        type: 'progress', 
        message: '✅ Change applied!',
        status: 'done'
      })}\n\n`);
    }

    // PHASE 3: Generate AI explanation (streaming)
    if (!process.env.GROQ_API_KEY) {
      res.write(`data: ${JSON.stringify({ 
        type: 'chat_response',
        message: `I'm in demo mode. ${command.changeType !== 'none' ? 'The visual change has been applied!' : 'Configure GROQ_API_KEY for full AI capabilities.'}`
      })}\n\n`);
      res.end();
      return;
    }

    // Build system prompt with visual context
    const selectedElementInfo = visualContext?.selectedElement 
      ? `Selected Element: ${visualContext.selectedElement.tagName} (test-id: ${visualContext.selectedElement.testId || 'none'})`
      : 'No element selected';

    const systemPrompt = `You are Mr. Blue, a visual editing AI assistant. You help users edit their web pages in real-time.

CONTEXT:
- Current Page: ${visualContext.currentPage || 'Unknown'}
- ${selectedElementInfo}
- Total Edits: ${visualContext.editsCount || 0}

INSTRUCTIONS:
- Be conversational and brief (1-2 sentences)
- Confirm what change you made (if any)
- Provide helpful context or suggestions
- Sound excited and helpful!

${command.changeType !== 'none' ? `You just applied a ${command.changeType} change to the selected element.` : ''}`;

    // Stream AI response with cascading fallback: GROQ → OpenAI → Anthropic
    let fullMessage = '';
    
    // Try GROQ first
    try {
      console.log('[MrBlue] Using GROQ for AI response...');
      
      await GroqService.stream({
        prompt: message,
        systemPrompt,
        model: GROQ_MODELS.LLAMA_8B, // Ultra-fast 877 tok/s
        temperature: 0.7,
        maxTokens: 200,
        onChunk: (chunk) => {
          if (!chunk.isComplete) {
            fullMessage += chunk.content;
            
            // Stream each token to client
            res.write(`data: ${JSON.stringify({ 
              type: 'progress',
              message: fullMessage,
              status: 'generating'
            })}\n\n`);
          } else {
            // Final completion message
            res.write(`data: ${JSON.stringify({ 
              type: 'chat_response',
              message: fullMessage
            })}\n\n`);
            
            res.end();
          }
        }
      });
      
    } catch (groqError: any) {
      console.log('[MrBlue] GROQ failed, trying OpenAI...', groqError.message);
      
      // Fallback to OpenAI GPT-4o-mini
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const stream = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          stream: true,
          max_tokens: 200,
          temperature: 0.7
        });
        
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullMessage += content;
            res.write(`data: ${JSON.stringify({ 
              type: 'progress',
              message: fullMessage,
              status: 'generating'
            })}\n\n`);
          }
        }
        
        res.write(`data: ${JSON.stringify({ 
          type: 'chat_response',
          message: fullMessage
        })}\n\n`);
        res.end();
        
      } catch (openaiError: any) {
        console.log('[MrBlue] OpenAI failed, trying Anthropic...', openaiError.message);
        
        // Fallback to Anthropic Claude Haiku
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const stream = await anthropic.messages.stream({
          model: 'claude-3-haiku-20240307',
          max_tokens: 200,
          messages: [{ role: 'user', content: `${systemPrompt}\n\n${message}` }]
        });
        
        stream.on('text', (text) => {
          fullMessage += text;
          res.write(`data: ${JSON.stringify({ 
            type: 'progress',
            message: fullMessage,
            status: 'generating'
          })}\n\n`);
        });
        
        stream.on('end', () => {
          res.write(`data: ${JSON.stringify({ 
            type: 'chat_response',
            message: fullMessage
          })}\n\n`);
          res.end();
        });
      }
    }

  } catch (error: any) {
    console.error('[MrBlue Stream] Error:', error);
    
    try {
      res.write(`data: ${JSON.stringify({ 
        type: 'error',
        message: error.message || 'Stream error'
      })}\n\n`);
      res.end();
    } catch {
      // Response already ended
    }
  }
});

/**
 * Parse element reference from natural language
 * POST /api/mrblue/select-element
 */
router.post("/select-element", async (req: Request, res: Response) => {
  try {
    const { reference, userId } = req.body;

    if (!reference || !reference.trim()) {
      return res.status(400).json({
        success: false,
        message: "Element reference is required"
      });
    }

    // Import elementSelector dynamically
    const { elementSelector } = await import("../services/mrBlue/elementSelector");

    // Parse element reference
    const result = await elementSelector.parseElementReference(reference, userId);

    console.log('[Element Selection] Parsed:', {
      reference,
      selector: result.selector,
      confidence: result.confidence
    });

    res.json({
      success: true,
      selector: result.selector,
      confidence: result.confidence,
      explanation: result.explanation,
      alternatives: result.alternatives || []
    });
  } catch (error: any) {
    console.error('[Element Selection] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to parse element reference'
    });
  }
});

/**
 * Helper: Sleep for delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default router;
