import { Router, type Request, Response } from "express";
import Groq from "groq-sdk";
import { streamingService } from "../services/streamingService";

const router = Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Mr. Blue Chat
router.post("/chat", async (req: Request, res: Response) => {
    try {
      const { message, context, conversationHistory } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Message is required"
        });
      }

      // Parse Visual Editor context
      let visualContext;
      try {
        visualContext = typeof context === 'string' ? JSON.parse(context) : context;
      } catch {
        visualContext = {};
      }

      // Build rich context for Visual Editor
      const selectedElementInfo = visualContext.selectedElement 
        ? `Selected Element: ${visualContext.selectedElement.tagName} (test-id: ${visualContext.selectedElement.testId || 'none'})
   Class: ${visualContext.selectedElement.className}
   Text: ${visualContext.selectedElement.text}`
        : 'No element selected';

      const recentEditsInfo = visualContext.recentEdits && visualContext.recentEdits.length > 0
        ? `Recent edits: ${visualContext.recentEdits.join(', ')}`
        : 'No recent edits';

      const systemPrompt = `You are Mr. Blue, an AI assistant in the Visual Editor of Mundo Tango platform.

VISUAL EDITOR CONTEXT:
- Current Page: ${visualContext.currentPage || 'Unknown'}
- ${selectedElementInfo}
- Total Edits: ${visualContext.editsCount || 0}
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

      // Build message history
      const messages: any[] = [
        { role: "system", content: systemPrompt }
      ];

      // Add conversation history if provided
      if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.push(...conversationHistory.slice(-6));
      }

      // Add current user message
      messages.push({ role: "user", content: message });

      const completion = await groq.chat.completions.create({
        messages,
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 300,
      });

      const response = completion.choices[0]?.message?.content || 
        "I'm sorry, I couldn't process that request.";

      res.json({
        success: true,
        response
      });
    } catch (error) {
      console.error('[MrBlue] Chat error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to process chat request"
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

export default router;
