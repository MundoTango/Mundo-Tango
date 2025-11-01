import { Router } from "express";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export function createAIChatRoutes() {
  const router = Router();

  // Mr Blue AI Chat endpoint
  router.post("/chat", async (req, res) => {
    try {
      const { messages, sessionId, volunteerId } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      // System prompt for Mr Blue
      const systemPrompt = sessionId && volunteerId
        ? `You are Mr Blue, an AI assistant for Mundo Tango conducting a volunteer interview. 
Your goal is to understand the candidate's skills, experience, and interests through natural conversation.
Ask follow-up questions to clarify technical abilities, time availability, and areas of passion.
Be friendly, encouraging, and professional. Keep responses concise (2-3 sentences).
Focus on: programming languages, frameworks, design skills, project management, and tango involvement.`
        : `You are Mr Blue, an AI assistant for Mundo Tango - a global tango community platform.
You help with code analysis, debugging, task management, and general questions about the platform.
Be helpful, concise, and friendly. Keep responses under 3 sentences when possible.`;

      // Call Groq API
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9
      });

      const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

      res.json({ response });

    } catch (error: any) {
      console.error("Groq API Error:", error);
      res.status(500).json({ 
        error: "Failed to get AI response",
        details: error.message 
      });
    }
  });

  return router;
}
