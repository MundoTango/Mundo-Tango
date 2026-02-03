import { Router, type Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { webProfileScraper } from "../services/WebsiteProfileScraper";
import rateLimit from "express-rate-limit";

const router = Router();

const analyzeWebsiteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many requests, please try again later.",
});

router.post(
  "/analyze-website",
  authenticateToken,
  analyzeWebsiteLimiter,
  async (req: Request, res: Response) => {
    const { url } = req.body;
    const urlPattern =
      /^(https?:\/\/)?([\w.-]+)\.([a-z\.]{2,6})([\/\w .-]*)*\/?.*$/;

    if (!url || !urlPattern.test(url)) {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    try {
      const profileData = await webProfileScraper.scrape(url);
      res.status(200).json(profileData);
    } catch (error) {
      console.error("Error scraping profile:", error);
      res.status(500).json({ message: "Error scraping profile data" });
    }
  },
);

// VibeCoding endpoint - autonomous task execution with ReAct loop
router.post(
  "/vibecoding",
  authenticateToken,
  async (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const { message, conversationHistory } = req.body;

    try {
      // TODO: Implement VibeCoding ReAct loop
      // 1. Parse task from message
      // 2. Execute Observe-Decide-Act cycle
      // 3. Stream results via SSE
      // 4. Return final result

      res.write(
        "data: " +
          JSON.stringify({
            type: "status",
            content: "VibeCoding mode activated",
          }) +
          "\n\n",
      );
      res.write(
        "data: " +
          JSON.stringify({ type: "thinking", content: "Analyzing task..." }) +
          "\n\n",
      );

      // Simulate ReAct cycle for now
      res.write(
        "data: " +
          JSON.stringify({
            type: "response",
            content: `VibeCoding received: ${message}`,
          }) +
          "\n\n",
      );
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("VibeCoding error:", error);
      res.write(
        "data: " +
          JSON.stringify({
            type: "error",
            content: "Error in VibeCoding mode",
          }) +
          "\n\n",
      );
      res.end();
    }
  },
);

export default router;
