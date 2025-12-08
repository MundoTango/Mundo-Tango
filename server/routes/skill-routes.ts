import { Router, type Request, type Response } from "express";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { db } from "../db";
import { userSkills, skillEndorsements, users } from "../../shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { z } from "zod";
import logger from "../middleware/logger";

const router = Router();

const TANGO_SKILL_CATEGORIES = [
  "Leader",
  "Follower",
  "Teacher",
  "DJ",
  "Organizer",
  "Performer",
  "Musician",
  "Choreographer"
];

const addSkillSchema = z.object({
  skillName: z.string().min(1).max(100),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional()
});

router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const skills = await db
      .select({
        id: userSkills.id,
        skillName: userSkills.skillName,
        level: userSkills.level,
        createdAt: userSkills.createdAt,
        endorsementCount: sql<number>`COALESCE((
          SELECT COUNT(*) FROM skill_endorsements 
          WHERE skill_endorsements.skill_id = ${userSkills.id}
        ), 0)::int`
      })
      .from(userSkills)
      .where(eq(userSkills.userId, userId))
      .orderBy(desc(sql`endorsement_count`), userSkills.skillName);

    const skillsWithEndorsers = await Promise.all(
      skills.map(async (skill) => {
        const endorsers = await db
          .select({
            id: users.id,
            name: users.name,
            profileImage: users.profileImage
          })
          .from(skillEndorsements)
          .innerJoin(users, eq(skillEndorsements.endorserId, users.id))
          .where(eq(skillEndorsements.skillId, skill.id))
          .limit(5);

        return {
          ...skill,
          endorsers
        };
      })
    );

    res.json(skillsWithEndorsers);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const validated = addSkillSchema.parse(req.body);

    const existingSkill = await db
      .select()
      .from(userSkills)
      .where(
        and(
          eq(userSkills.userId, req.user.id),
          eq(userSkills.skillName, validated.skillName)
        )
      )
      .limit(1);

    if (existingSkill.length > 0) {
      return res.status(409).json({ error: "Skill already exists" });
    }

    const [newSkill] = await db
      .insert(userSkills)
      .values({
        userId: req.user.id,
        skillName: validated.skillName,
        level: validated.level
      })
      .returning();

    res.status(201).json(newSkill);
  } catch (error: any) {
    console.error("Error adding skill:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    res.status(500).json({ error: "Failed to add skill" });
  }
});

router.delete("/:skillId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const skillId = parseInt(req.params.skillId);
    if (isNaN(skillId)) {
      return res.status(400).json({ error: "Invalid skill ID" });
    }

    const [skill] = await db
      .select()
      .from(userSkills)
      .where(eq(userSkills.id, skillId))
      .limit(1);

    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    if (skill.userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this skill" });
    }

    await db.delete(userSkills).where(eq(userSkills.id, skillId));

    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({ error: "Failed to delete skill" });
  }
});

router.post("/:skillId/endorse", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const skillId = parseInt(req.params.skillId);
    if (isNaN(skillId)) {
      return res.status(400).json({ error: "Invalid skill ID" });
    }

    const [skill] = await db
      .select()
      .from(userSkills)
      .where(eq(userSkills.id, skillId))
      .limit(1);

    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    if (skill.userId === req.user.id) {
      return res.status(400).json({ error: "Cannot endorse your own skill" });
    }

    const existingEndorsement = await db
      .select()
      .from(skillEndorsements)
      .where(
        and(
          eq(skillEndorsements.skillId, skillId),
          eq(skillEndorsements.endorserId, req.user.id)
        )
      )
      .limit(1);

    if (existingEndorsement.length > 0) {
      return res.status(409).json({ error: "Already endorsed this skill" });
    }

    const [endorsement] = await db
      .insert(skillEndorsements)
      .values({
        skillId,
        endorserId: req.user.id
      })
      .returning();

    res.status(201).json(endorsement);
  } catch (error) {
    console.error("Error endorsing skill:", error);
    res.status(500).json({ error: "Failed to endorse skill" });
  }
});

router.delete("/:skillId/endorse", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const skillId = parseInt(req.params.skillId);
    if (isNaN(skillId)) {
      return res.status(400).json({ error: "Invalid skill ID" });
    }

    await db
      .delete(skillEndorsements)
      .where(
        and(
          eq(skillEndorsements.skillId, skillId),
          eq(skillEndorsements.endorserId, req.user.id)
        )
      );

    res.json({ message: "Endorsement removed" });
  } catch (error) {
    console.error("Error removing endorsement:", error);
    res.status(500).json({ error: "Failed to remove endorsement" });
  }
});

router.get("/categories/list", async (_req: Request, res: Response) => {
  res.json(TANGO_SKILL_CATEGORIES);
});

router.get("/:skillId/endorsers", async (req: Request, res: Response) => {
  try {
    const skillId = parseInt(req.params.skillId);
    if (isNaN(skillId)) {
      return res.status(400).json({ error: "Invalid skill ID" });
    }

    const endorsers = await db
      .select({
        id: users.id,
        name: users.name,
        profileImage: users.profileImage,
        city: users.city,
        country: users.country,
        endorsedAt: skillEndorsements.createdAt
      })
      .from(skillEndorsements)
      .innerJoin(users, eq(skillEndorsements.endorserId, users.id))
      .where(eq(skillEndorsements.skillId, skillId))
      .orderBy(desc(skillEndorsements.createdAt));

    res.json(endorsers);
  } catch (error) {
    console.error("Error fetching endorsers:", error);
    res.status(500).json({ error: "Failed to fetch endorsers" });
  }
});

export default router;
