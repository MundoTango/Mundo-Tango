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

        // Extract role tags from resume/notes or derive from skills using word boundary matching
        let roleTags: string[] = [];
        const combinedText = ` ${(p.notes || "")} ${skillsStr} ${resumeSummary} `.toLowerCase();
        
        // Helper function to match whole words only
        const hasWord = (pattern: string) => new RegExp(`\\b${pattern}\\b`, 'i').test(combinedText);
        const hasAnyWord = (...patterns: string[]) => patterns.some(p => hasWord(p));
        
        // Role detection with word boundaries to avoid false positives
        if (hasAnyWord("ux", "user experience", "ux design", "ux research")) roleTags.push("UX");
        if (hasAnyWord("ui design", "ui/ux", "user interface", "figma", "sketch")) roleTags.push("UI");
        if (hasAnyWord("backend", "node.js", "nodejs", "python", "java", "golang", "express", "django", "flask", "rails", "api development")) roleTags.push("Backend");
        if (hasAnyWord("frontend", "react", "vue", "angular", "nextjs", "next.js", "svelte", "typescript", "javascript")) roleTags.push("Frontend");
        if (hasAnyWord("devops", "aws", "docker", "kubernetes", "ci/cd", "terraform", "jenkins", "github actions")) roleTags.push("DevOps");
        if (hasAnyWord("mobile", "ios", "android", "react native", "flutter", "swift", "kotlin")) roleTags.push("Mobile");
        if (hasAnyWord("data science", "data analyst", "machine learning", "ml engineer", "tensorflow", "pytorch", "pandas")) roleTags.push("Data");
        if (hasAnyWord("content writer", "copywriter", "content creator", "technical writer", "blog", "content marketing")) roleTags.push("Content");
        if (hasAnyWord("marketing", "seo", "social media marketing", "digital marketing", "growth", "ads manager")) roleTags.push("Marketing");
        if (hasAnyWord("project manager", "product manager", "scrum master", "agile", "jira", "asana")) roleTags.push("PM");
        if (hasAnyWord("qa engineer", "testing", "quality assurance", "test automation", "selenium", "cypress", "playwright")) roleTags.push("QA");
        if (hasAnyWord("security engineer", "cybersecurity", "infosec", "penetration testing", "soc analyst")) roleTags.push("Security");
        
        // Default to General if no specific roles detected
        if (roleTags.length === 0) roleTags.push("General");

        return {
          id: p.id,
          candidateId: p.candidateId,
          volunteerId: volunteer?.id || null,
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
