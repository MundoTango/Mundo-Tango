import type { Express, Request, Response } from "express";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export function registerMrBlueRoutes(app: Express) {
  // Mr. Blue Chat
  app.post("/api/mrblue/chat", async (req: Request, res: Response) => {
    try {
      const { message, pageContext } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Message is required"
        });
      }

      // Build context from breadcrumbs
      const contextInfo = pageContext?.breadcrumbs
        ?.map((b: any) => `${b.action} on ${b.page}`)
        .join(', ') || 'No context available';

      const systemPrompt = `You are Mr. Blue, an AI assistant for Mundo Tango platform. 
You help users navigate the platform, answer questions about tango events, groups, and features.
Current user context: ${contextInfo}
Current page: ${pageContext?.page || 'Unknown'}

Be helpful, concise, and friendly. Provide specific actions when possible.`;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 500,
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

  // Breadcrumb tracking
  app.post("/api/breadcrumbs", async (req: Request, res: Response) => {
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
}
