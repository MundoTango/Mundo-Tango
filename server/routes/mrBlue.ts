import { Router, type Request, Response } from "express";
import Groq from "groq-sdk";
import { streamingService } from "../services/streamingService";
import { traceRoute, traceAIOperation } from "../metrics/tracing";
import { db } from "../db";
import { mrBlueConversations, mrBlueMessages, messageReactions, messageBookmarks } from "@shared/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { getConversationContext, saveMessageToHistory } from "../services/chat-context";

const router = Router();

// Bifrost AI Gateway integration - MB.MD Protocol Implementation
// Groq SDK supports baseURL for routing through Bifrost gateway
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
  baseURL: process.env.BIFROST_BASE_URL || undefined,
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

      // Parse Visual Editor context (may be undefined for regular chat)
      let visualContext: any = {};
      try {
        if (context) {
          visualContext = typeof context === 'string' ? JSON.parse(context) : context;
        }
      } catch {
        visualContext = {};
      }

      // Build rich context for Visual Editor
      const selectedElementInfo = visualContext?.selectedElement 
        ? `Selected Element: ${visualContext.selectedElement.tagName} (test-id: ${visualContext.selectedElement.testId || 'none'})
   Class: ${visualContext.selectedElement.className}
   Text: ${visualContext.selectedElement.text}`
        : 'No element selected';

      const recentEditsInfo = visualContext?.recentEdits && visualContext.recentEdits.length > 0
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

      // Save messages to history if conversationId and userId provided
      if (conversationId && userId) {
        try {
          await saveMessageToHistory(conversationId, userId, 'user', message);
          await saveMessageToHistory(conversationId, userId, 'assistant', response);
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

export default router;
