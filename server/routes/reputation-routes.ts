import { Router, type Request, type Response } from "express";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { reputationService } from "../services/reputation/ReputationService";
import { insertProfessionalEndorsementSchema } from "../../shared/schema";
import { z } from "zod";

const router = Router();

// Rate limiting map for endorsements (5 per day per user)
const endorsementRateLimit = new Map<number, { count: number; resetAt: Date }>();

function checkRateLimit(userId: number): boolean {
  const now = new Date();
  const userLimit = endorsementRateLimit.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Reset or create new limit
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    endorsementRateLimit.set(userId, { count: 0, resetAt: tomorrow });
    return true;
  }

  if (userLimit.count >= 5) {
    return false;
  }

  return true;
}

function incrementRateLimit(userId: number) {
  const userLimit = endorsementRateLimit.get(userId);
  if (userLimit) {
    userLimit.count++;
  }
}

// POST /api/endorsements - Create new endorsement
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check rate limit
    if (!checkRateLimit(req.user.id)) {
      return res.status(429).json({
        error: "Rate limit exceeded. You can only create 5 endorsements per day.",
      });
    }

    // Validate input
    const validatedData = insertProfessionalEndorsementSchema.parse({
      ...req.body,
      endorserId: req.user.id,
    });

    // Prevent self-endorsement
    if (validatedData.endorseeId === req.user.id) {
      return res.status(400).json({ error: "You cannot endorse yourself" });
    }

    // Validate rating
    if (validatedData.rating && (validatedData.rating < 1 || validatedData.rating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const endorsement = await reputationService.createEndorsement(validatedData);

    // Increment rate limit
    incrementRateLimit(req.user.id);

    res.status(201).json(endorsement);
  } catch (error: any) {
    console.error("Error creating endorsement:", error);

    if (error.message?.includes("already endorsed")) {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to create endorsement" });
  }
});

// GET /api/endorsements/:userId - Get all endorsements for user
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const role = req.query.role as string | undefined;

    const endorsements = await reputationService.getEndorsementsWithDetails(userId, role);

    res.json(endorsements);
  } catch (error) {
    console.error("Error fetching endorsements:", error);
    res.status(500).json({ error: "Failed to fetch endorsements" });
  }
});

// GET /api/reputation/:userId - Get reputation score and résumé
router.get("/resume/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const resume = await reputationService.getTangoResume(userId);

    res.json(resume);
  } catch (error) {
    console.error("Error fetching tango resume:", error);
    res.status(500).json({ error: "Failed to fetch tango resume" });
  }
});

// GET /api/reputation/stats/:userId - Get breakdown by role/skill
router.get("/stats/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const stats = await reputationService.getEndorsementStats(userId);
    const overallScore = await reputationService.calculateReputationScore(userId);

    // Get role-specific scores
    const roleScores = {
      teacher: await reputationService.calculateRoleScore(userId, "teacher"),
      dj: await reputationService.calculateRoleScore(userId, "dj"),
      organizer: await reputationService.calculateRoleScore(userId, "organizer"),
      performer: await reputationService.calculateRoleScore(userId, "performer"),
    };

    res.json({
      ...stats,
      overallScore,
      roleScores,
    });
  } catch (error) {
    console.error("Error fetching reputation stats:", error);
    res.status(500).json({ error: "Failed to fetch reputation stats" });
  }
});

// DELETE /api/endorsements/:id - Delete own endorsement
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const endorsementId = parseInt(req.params.id);

    if (isNaN(endorsementId)) {
      return res.status(400).json({ error: "Invalid endorsement ID" });
    }

    await reputationService.deleteEndorsement(endorsementId, req.user.id);

    res.json({ message: "Endorsement deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting endorsement:", error);

    if (error.message?.includes("not found") || error.message?.includes("permission")) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to delete endorsement" });
  }
});

export default router;
