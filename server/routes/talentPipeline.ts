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

        // Handle skills - could be array, object, or null
        let skillsStr = "Not specified";
        if (volunteer?.skills) {
          if (Array.isArray(volunteer.skills)) {
            skillsStr = volunteer.skills.length > 0 ? volunteer.skills.join(", ") : "Not specified";
          } else if (typeof volunteer.skills === 'object') {
            const skillKeys = Object.keys(volunteer.skills);
            skillsStr = skillKeys.length > 0 ? skillKeys.join(", ") : "Not specified";
          }
        }
        
        // Extract resume text from profile if available
        const profile = volunteer?.profile as { resumeText?: string; githubUrl?: string } | null;
        const resumeSummary = profile?.resumeText?.substring(0, 100) || "";

        // Extract role tags from resume/notes or derive from skills
        let roleTags: string[] = [];
        const notesLower = (p.notes || "").toLowerCase();
        const skillsLower = skillsStr.toLowerCase();
        const resumeLower = resumeSummary.toLowerCase();
        const combinedText = notesLower + " " + skillsLower + " " + resumeLower;
        
        // Common role detection
        if (combinedText.includes("ux") || combinedText.includes("user experience")) roleTags.push("UX");
        if (combinedText.includes("ui") || combinedText.includes("user interface") || combinedText.includes("design")) roleTags.push("UI");
        if (combinedText.includes("backend") || combinedText.includes("node") || combinedText.includes("python") || combinedText.includes("server")) roleTags.push("Backend");
        if (combinedText.includes("frontend") || combinedText.includes("react") || combinedText.includes("vue") || combinedText.includes("angular")) roleTags.push("Frontend");
        if (combinedText.includes("devops") || combinedText.includes("aws") || combinedText.includes("docker") || combinedText.includes("kubernetes")) roleTags.push("DevOps");
        if (combinedText.includes("mobile") || combinedText.includes("ios") || combinedText.includes("android") || combinedText.includes("flutter")) roleTags.push("Mobile");
        if (combinedText.includes("data") || combinedText.includes("analytics") || combinedText.includes("machine learning") || combinedText.includes("ml")) roleTags.push("Data");
        if (combinedText.includes("content") || combinedText.includes("writing") || combinedText.includes("copywriting")) roleTags.push("Content");
        if (combinedText.includes("marketing") || combinedText.includes("seo") || combinedText.includes("social media")) roleTags.push("Marketing");
        if (combinedText.includes("project") || combinedText.includes("management") || combinedText.includes("scrum") || combinedText.includes("agile")) roleTags.push("PM");
        if (combinedText.includes("qa") || combinedText.includes("testing") || combinedText.includes("quality")) roleTags.push("QA");
        if (combinedText.includes("security") || combinedText.includes("infosec") || combinedText.includes("cyber")) roleTags.push("Security");
        
        // Default to General if no specific roles detected
        if (roleTags.length === 0) roleTags.push("General");

        return {
          id: p.id,
          candidateId: p.candidateId,
          name: p.userDisplayName || p.userName || "Unknown",
          email: p.userEmail,
          skills: skillsStr + (resumeSummary ? ` (${resumeSummary}...)` : ""),
          skillsArray: Array.isArray(volunteer?.skills) ? volunteer.skills : [],
          roleTags,
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
