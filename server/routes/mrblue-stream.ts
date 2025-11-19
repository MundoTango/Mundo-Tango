/**
 * Mr. Blue Streaming Chat API
 * Server-Sent Events (SSE) for real-time "vibe coding"
 * 
 * Flow:
 * 1. User says "make it blue"
 * 2. Stream: "I'll change the button color... Finding button element... Applying CSS..."
 * 3. Visual change: Button turns blue in real-time as AI streams text
 */

import { Router, type Request, Response } from "express";
import { GroqService, GROQ_MODELS } from "../services/ai/GroqService";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

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
        type: 'completion',
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
              type: 'completion',
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
          type: 'completion',
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
            type: 'completion',
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
 * Helper: Sleep for delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default router;
