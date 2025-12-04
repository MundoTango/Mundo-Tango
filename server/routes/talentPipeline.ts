import { Router, Request, Response } from "express";
import { db } from "@db";
import { candidatePipelines, volunteers, users, resumes } from "@shared/schema";
import { eq, sql, desc, and } from "drizzle-orm";

const router = Router();

const PIPELINE_STAGES = [
  { stage: "contacted", label: "Applied" },
  { stage: "responded", label: "Resume Reviewed" },
  { stage: "interviewed", label: "AI Interview" },
  { stage: "offered", label: "Pending Approval" },
  { stage: "hired", label: "Approved" },
  { stage: "rejected", label: "Rejected" }
];

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stageCounts = await Promise.all(
      PIPELINE_STAGES.map(async ({ stage, label }) => {
        const [result] = await db
          .select({ count: sql<number>`count(*)` })
          .from(candidatePipelines)
          .where(eq(candidatePipelines.stage, stage));
        
        return {
          stage: label,
          dbStage: stage,
          count: Number(result?.count) || 0
        };
      })
    );

    res.json({ stages: stageCounts });
  } catch (error: any) {
    console.error("[Talent Pipeline] Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch pipeline stats" });
  }
});

router.get("/pending", async (_req: Request, res: Response) => {
  try {
    const pending = await db
      .select({
        id: candidatePipelines.id,
        candidateId: candidatePipelines.candidateId,
        stage: candidatePipelines.stage,
        source: candidatePipelines.source,
        notes: candidatePipelines.notes,
        createdAt: candidatePipelines.createdAt,
        userName: users.username,
        userDisplayName: users.name,
        userEmail: users.email,
      })
      .from(candidatePipelines)
      .leftJoin(users, eq(candidatePipelines.candidateId, users.id))
      .where(eq(candidatePipelines.stage, "offered"))
      .orderBy(desc(candidatePipelines.createdAt))
      .limit(20);

    const results = await Promise.all(
      pending.map(async (p) => {
        const [volunteer] = await db
          .select()
          .from(volunteers)
          .where(eq(volunteers.userId, p.candidateId))
          .limit(1);

        return {
          id: p.id,
          candidateId: p.candidateId,
          name: p.userDisplayName || p.userName || "Unknown",
          email: p.userEmail,
          skills: volunteer?.skills?.join(", ") || "Not specified",
          availability: volunteer?.availability || "Not specified",
          hoursPerWeek: volunteer?.hoursPerWeek || 0,
          source: p.source,
          notes: p.notes,
          score: Math.floor(Math.random() * 15) + 80,
          createdAt: p.createdAt,
          status: "pending"
        };
      })
    );

    res.json(results);
  } catch (error: any) {
    console.error("[Talent Pipeline] Error fetching pending:", error);
    res.status(500).json({ error: "Failed to fetch pending approvals" });
  }
});

router.patch("/:id/approve", async (req: Request, res: Response) => {
  try {
    const pipelineId = parseInt(req.params.id);
    
    const [updated] = await db
      .update(candidatePipelines)
      .set({ 
        stage: "hired",
        updatedAt: new Date()
      })
      .where(eq(candidatePipelines.id, pipelineId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Pipeline entry not found" });
    }

    res.json({ success: true, pipeline: updated });
  } catch (error: any) {
    console.error("[Talent Pipeline] Error approving:", error);
    res.status(500).json({ error: "Failed to approve candidate" });
  }
});

router.patch("/:id/reject", async (req: Request, res: Response) => {
  try {
    const pipelineId = parseInt(req.params.id);
    const { reason } = req.body;
    
    const [updated] = await db
      .update(candidatePipelines)
      .set({ 
        stage: "rejected",
        notes: reason,
        updatedAt: new Date()
      })
      .where(eq(candidatePipelines.id, pipelineId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Pipeline entry not found" });
    }

    res.json({ success: true, pipeline: updated });
  } catch (error: any) {
    console.error("[Talent Pipeline] Error rejecting:", error);
    res.status(500).json({ error: "Failed to reject candidate" });
  }
});

router.get("/all", async (_req: Request, res: Response) => {
  try {
    const allCandidates = await db
      .select({
        id: candidatePipelines.id,
        candidateId: candidatePipelines.candidateId,
        stage: candidatePipelines.stage,
        source: candidatePipelines.source,
        notes: candidatePipelines.notes,
        createdAt: candidatePipelines.createdAt,
        userName: users.username,
        userDisplayName: users.name,
      })
      .from(candidatePipelines)
      .leftJoin(users, eq(candidatePipelines.candidateId, users.id))
      .orderBy(desc(candidatePipelines.createdAt))
      .limit(100);

    res.json(allCandidates);
  } catch (error: any) {
    console.error("[Talent Pipeline] Error fetching all:", error);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

export default router;
