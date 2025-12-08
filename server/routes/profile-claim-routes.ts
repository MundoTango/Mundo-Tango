import { Router, Response } from "express";
import { db } from "@shared/db";
import { profileClaims, venues, users, teachers } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";
import logger from "../middleware/logger";

const router = Router();

const claimProfileSchema = z.object({
  verificationInfo: z.string().min(10, "Please provide verification details (at least 10 characters)"),
  verificationDocuments: z.array(z.string().url()).optional(),
});

router.post("/claim/:profileType/:profileId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { profileType, profileId } = req.params;
    const profileIdNum = parseInt(profileId);

    if (!["venue", "teacher", "dj", "musician"].includes(profileType)) {
      return res.status(400).json({ error: "Invalid profile type" });
    }

    if (isNaN(profileIdNum)) {
      return res.status(400).json({ error: "Invalid profile ID" });
    }

    const validation = claimProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validation.error.errors 
      });
    }

    const { verificationInfo, verificationDocuments } = validation.data;

    if (profileType === "venue") {
      const [venue] = await db
        .select()
        .from(venues)
        .where(eq(venues.id, profileIdNum))
        .limit(1);

      if (!venue) {
        return res.status(404).json({ error: "Venue not found" });
      }

      if (venue.claimedBy) {
        return res.status(409).json({ error: "This venue has already been claimed" });
      }
    } else if (profileType === "teacher") {
      const [teacher] = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, profileIdNum))
        .limit(1);

      if (!teacher) {
        return res.status(404).json({ error: "Teacher profile not found" });
      }

      if (teacher.userId) {
        return res.status(409).json({ error: "This teacher profile is already linked to a user" });
      }
    }

    const [existingClaim] = await db
      .select()
      .from(profileClaims)
      .where(
        and(
          eq(profileClaims.profileType, profileType),
          eq(profileClaims.profileId, profileIdNum),
          eq(profileClaims.status, "pending")
        )
      )
      .limit(1);

    if (existingClaim) {
      if (existingClaim.userId === userId) {
        return res.status(409).json({ error: "You already have a pending claim for this profile" });
      }
      return res.status(409).json({ error: "There is already a pending claim for this profile" });
    }

    const [claim] = await db
      .insert(profileClaims)
      .values({
        userId,
        profileType,
        profileId: profileIdNum,
        verificationInfo,
        verificationDocuments: verificationDocuments || [],
        status: "pending",
      })
      .returning();

    console.log(`[ProfileClaim] User ${userId} submitted claim for ${profileType} ${profileIdNum}`);

    res.status(201).json({
      success: true,
      claim,
      message: "Your claim has been submitted and is pending review",
    });
  } catch (error) {
    console.error("[ProfileClaim] Error submitting claim:", error);
    res.status(500).json({ error: "Failed to submit claim" });
  }
});

router.get("/claims/my", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const claims = await db
      .select()
      .from(profileClaims)
      .where(eq(profileClaims.userId, userId))
      .orderBy(profileClaims.createdAt);

    res.json(claims);
  } catch (error) {
    console.error("[ProfileClaim] Error fetching user claims:", error);
    res.status(500).json({ error: "Failed to fetch claims" });
  }
});

router.get("/claims/pending", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const claims = await db
      .select({
        claim: profileClaims,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(profileClaims)
      .leftJoin(users, eq(profileClaims.userId, users.id))
      .where(eq(profileClaims.status, "pending"))
      .orderBy(profileClaims.createdAt);

    res.json(claims);
  } catch (error) {
    console.error("[ProfileClaim] Error fetching pending claims:", error);
    res.status(500).json({ error: "Failed to fetch pending claims" });
  }
});

router.post("/claims/:claimId/approve", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const claimId = parseInt(req.params.claimId);
    const { adminNotes } = req.body;

    const [claim] = await db
      .select()
      .from(profileClaims)
      .where(eq(profileClaims.id, claimId))
      .limit(1);

    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({ error: "This claim has already been processed" });
    }

    await db
      .update(profileClaims)
      .set({
        status: "approved",
        reviewedBy: userId,
        reviewedAt: new Date(),
        adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(profileClaims.id, claimId));

    if (claim.profileType === "venue") {
      await db
        .update(venues)
        .set({
          claimedBy: claim.userId,
          claimedAt: new Date(),
        })
        .where(eq(venues.id, claim.profileId));
    }

    console.log(`[ProfileClaim] Admin ${userId} approved claim ${claimId}`);

    res.json({ success: true, message: "Claim approved successfully" });
  } catch (error) {
    console.error("[ProfileClaim] Error approving claim:", error);
    res.status(500).json({ error: "Failed to approve claim" });
  }
});

router.post("/claims/:claimId/reject", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const claimId = parseInt(req.params.claimId);
    const { adminNotes } = req.body;

    const [claim] = await db
      .select()
      .from(profileClaims)
      .where(eq(profileClaims.id, claimId))
      .limit(1);

    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({ error: "This claim has already been processed" });
    }

    await db
      .update(profileClaims)
      .set({
        status: "rejected",
        reviewedBy: userId,
        reviewedAt: new Date(),
        adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(profileClaims.id, claimId));

    console.log(`[ProfileClaim] Admin ${userId} rejected claim ${claimId}`);

    res.json({ success: true, message: "Claim rejected" });
  } catch (error) {
    console.error("[ProfileClaim] Error rejecting claim:", error);
    res.status(500).json({ error: "Failed to reject claim" });
  }
});

router.get("/status/:profileType/:profileId", async (req, res: Response) => {
  try {
    const { profileType, profileId } = req.params;
    const profileIdNum = parseInt(profileId);

    if (!["venue", "teacher", "dj", "musician"].includes(profileType)) {
      return res.status(400).json({ error: "Invalid profile type" });
    }

    let isClaimed = false;
    let claimedByUserId: number | null = null;

    if (profileType === "venue") {
      const [venue] = await db
        .select({ claimedBy: venues.claimedBy })
        .from(venues)
        .where(eq(venues.id, profileIdNum))
        .limit(1);

      if (venue) {
        isClaimed = !!venue.claimedBy;
        claimedByUserId = venue.claimedBy;
      }
    } else if (profileType === "teacher") {
      const [teacher] = await db
        .select({ userId: teachers.userId })
        .from(teachers)
        .where(eq(teachers.id, profileIdNum))
        .limit(1);

      if (teacher) {
        isClaimed = !!teacher.userId;
        claimedByUserId = teacher.userId;
      }
    }

    const [pendingClaim] = await db
      .select()
      .from(profileClaims)
      .where(
        and(
          eq(profileClaims.profileType, profileType),
          eq(profileClaims.profileId, profileIdNum),
          eq(profileClaims.status, "pending")
        )
      )
      .limit(1);

    res.json({
      isClaimed,
      claimedByUserId,
      hasPendingClaim: !!pendingClaim,
    });
  } catch (error) {
    console.error("[ProfileClaim] Error checking claim status:", error);
    res.status(500).json({ error: "Failed to check claim status" });
  }
});

export default router;
