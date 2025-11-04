import { Router } from "express";
import Groq from "groq-sdk";

// Bifrost AI Gateway integration - MB.MD Protocol Implementation
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.BIFROST_BASE_URL || undefined,
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
        model: "llama-3.3-70b-versatile",
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

  // Mr Blue Bug Report Analysis endpoint
  router.post("/report-bug", async (req, res) => {
    try {
      const { page, error, stack, componentStack, timestamp, userAgent } = req.body;

      if (!error || !page) {
        return res.status(400).json({ error: "Error details and page name are required" });
      }

      // System prompt for bug analysis with structured output
      const systemPrompt = `You are Mr Blue, an expert debugging AI for Mundo Tango platform.
Analyze React errors and provide actionable fixes in a structured format.

IMPORTANT: Return your response as valid JSON with this structure:
{
  "rootCause": "One sentence explaining what went wrong",
  "autoFixable": true/false,
  "severity": "Low|Medium|High|Critical",
  "fixSteps": ["Step 1", "Step 2", "Step 3"],
  "codeSnippet": "Optional code example if helpful",
  "explanation": "Brief explanation for developers"
}

Auto-fixable means the self-healing system can fix it automatically (e.g., network retry, re-render, chunk reload).
If it requires code changes, it's NOT auto-fixable.`;

      // Create analysis prompt
      const userPrompt = `Page: ${page}
Error: ${error}
Stack: ${stack?.substring(0, 500) || 'No stack trace'}
Component Stack: ${componentStack?.substring(0, 300) || 'No component stack'}
Browser: ${userAgent || 'Unknown'}
Time: ${timestamp}

Analyze this error and return JSON following the specified structure.`;

      // Call Groq API for analysis
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
        top_p: 0.9,
        response_format: { type: "json_object" }
      });

      const rawAnalysis = completion.choices[0]?.message?.content || "{}";
      
      // Parse JSON response
      let parsedAnalysis;
      try {
        parsedAnalysis = JSON.parse(rawAnalysis);
      } catch (e) {
        // Fallback if JSON parsing fails
        parsedAnalysis = {
          rootCause: "Unable to parse error analysis",
          autoFixable: false,
          severity: "Unknown",
          fixSteps: ["Contact support"],
          explanation: rawAnalysis
        };
      }

      // Create human-readable analysis for backward compatibility
      const analysis = `
🔍 Root Cause: ${parsedAnalysis.rootCause || 'Unknown'}

⚙️ Auto-fixable: ${parsedAnalysis.autoFixable ? 'Yes' : 'No'}

🎯 Severity: ${parsedAnalysis.severity || 'Unknown'}

📝 Fix Steps:
${(parsedAnalysis.fixSteps || []).map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

${parsedAnalysis.codeSnippet ? `\n💻 Code Snippet:\n${parsedAnalysis.codeSnippet}\n` : ''}

${parsedAnalysis.explanation ? `\n📖 Explanation:\n${parsedAnalysis.explanation}` : ''}
      `.trim();

      // Store bug report in console (future: save to database)
      console.log(`[Mr Blue Bug Report] Page: ${page}, Error: ${error}`);
      console.log(`[Mr Blue Analysis] ${analysis}`);

      res.json({ 
        analysis,  // Human-readable text
        structured: parsedAnalysis,  // Structured JSON for auto-fix
        reported: true,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error("Mr Blue Bug Report Error:", error);
      res.status(500).json({ 
        error: "Failed to analyze bug report",
        details: error.message 
      });
    }
  });

  return router;
}
