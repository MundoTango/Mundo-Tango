import { Router, type Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { webProfileScraper } from "../services/mrBlue/WebsiteProfileScraper";
import rateLimit from "express-rate-limit";

const router = Router();

const analyzeWebsiteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many requests, please try again later."
});

router.post("/analyze-website", authenticateToken, analyzeWebsiteLimiter, async (req: Request, res: Response) => {
  const { url } = req.body;
  const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z\.]{2,6})([\/\w .-]*)*\/?.*$/;

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
});

export default router;