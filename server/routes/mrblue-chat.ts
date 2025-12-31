import { Router, type Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI();

router.post("/chat", authenticateToken, async (req: Request, res: Response) => {
  const { message, systemPrompt } = req.body;
  
  console.log("[MrBlue Chat] Received request:", { 
    message, 
    systemPromptLength: systemPrompt?.length,
    hasSystemPrompt: !!systemPrompt
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt || "You are Mr. Blue, a helpful assistant." },
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;
    console.log("[MrBlue Chat] Success, reply length:", reply?.length);
    res.json({ message: reply });
  } catch (error: any) {
    console.error("[MrBlue Chat] Error:", error);
    res.status(500).json({ error: "Failed to communicate with AI" });
  }
});

export default router;
