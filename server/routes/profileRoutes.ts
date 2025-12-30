import { Router, type Request, type Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";
import { storage } from "../storage";

const router = Router();

router.post("/enrich", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const enrichSchema = z.object({
      fields: z.record(z.any()).optional(),
    });

    const validatedData = enrichSchema.parse(req.body);
    const updatedProfile = await storage.updateUserProfile(req.userId, validatedData.fields);

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log(`[Profile] Enrichment action performed for user ${req.userId}`);
    res.json(updatedProfile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("[Profile] Error enriching profile:", error);
    res.status(500).json({ message: "Failed to enrich profile" });
  }
});

export default router;