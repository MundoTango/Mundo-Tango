import { Router, Request, Response } from "express";
import { db } from "@db";
import { planItems, planLinks, workLogs, users } from "@shared/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { insertPlanItemSchema, insertWorkLogSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.get("/my-tasks", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    
    const tasks = await db
      .select()
      .from(planItems)
      .where(eq(planItems.volunteerId, userId))
      .orderBy(desc(planItems.createdAt));

    res.json(tasks);
  } catch (error: any) {
    console.error("[Volunteer Tasks] Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.get("/work-logs", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    
    const logs = await db
      .select()
      .from(workLogs)
      .where(eq(workLogs.volunteerId, userId))
      .orderBy(desc(workLogs.workDate))
      .limit(50);

    res.json(logs);
  } catch (error: any) {
    console.error("[Volunteer Tasks] Error fetching work logs:", error);
    res.status(500).json({ error: "Failed to fetch work logs" });
  }
});

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(planItems)
      .where(eq(planItems.volunteerId, userId));

    const [completedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(planItems)
      .where(and(
        eq(planItems.volunteerId, userId),
        eq(planItems.status, "completed")
      ));

    const [hoursResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(hours_worked), 0)` })
      .from(workLogs)
      .where(eq(workLogs.volunteerId, userId));

    res.json({
      totalTasks: Number(totalResult?.count) || 0,
      completedTasks: Number(completedResult?.count) || 0,
      hoursLogged: Number(hoursResult?.total) || 0,
      activeStreak: 0,
    });
  } catch (error: any) {
    console.error("[Volunteer Tasks] Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.patch("/tasks/:id/status", async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const { status } = req.body;
    const userId = (req as any).userId || 1;

    if (!["pending", "in_progress", "completed", "blocked", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [task] = await db
      .select()
      .from(planItems)
      .where(and(
        eq(planItems.id, taskId),
        eq(planItems.volunteerId, userId)
      ));

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    const [updated] = await db
      .update(planItems)
      .set(updateData)
      .where(eq(planItems.id, taskId))
      .returning();

    res.json(updated);
  } catch (error: any) {
    console.error("[Volunteer Tasks] Error updating task status:", error);
    res.status(500).json({ error: "Failed to update task status" });
  }
});

router.post("/tasks", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const validatedData = insertPlanItemSchema.parse({
      ...req.body,
      volunteerId: userId,
    });

    const [task] = await db
      .insert(planItems)
      .values(validatedData)
      .returning();

    res.status(201).json(task);
  } catch (error: any) {
    console.error("[Volunteer Tasks] Error creating task:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.post("/work-logs", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const validatedData = insertWorkLogSchema.parse({
      ...req.body,
      volunteerId: userId,
    });

    const [log] = await db
      .insert(workLogs)
      .values(validatedData)
      .returning();

    if (validatedData.planItemId) {
      const [task] = await db
        .select()
        .from(planItems)
        .where(eq(planItems.id, validatedData.planItemId));

      if (task) {
        await db
          .update(planItems)
          .set({
            actualHours: sql`COALESCE(actual_hours, 0) + ${validatedData.hoursWorked}`,
            updatedAt: new Date(),
          })
          .where(eq(planItems.id, validatedData.planItemId));
      }
    }

    res.status(201).json(log);
  } catch (error: any) {
    console.error("[Volunteer Tasks] Error creating work log:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create work log" });
  }
});

router.get("/tasks/:id", async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = (req as any).userId || 1;

    const [task] = await db
      .select()
      .from(planItems)
      .where(and(
        eq(planItems.id, taskId),
        eq(planItems.volunteerId, userId)
      ));

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const logs = await db
      .select()
      .from(workLogs)
      .where(eq(workLogs.planItemId, taskId))
      .orderBy(desc(workLogs.workDate));

    const links = await db
      .select()
      .from(planLinks)
      .where(or(
        eq(planLinks.sourceItemId, taskId),
        eq(planLinks.targetItemId, taskId)
      ));

    res.json({
      ...task,
      workLogs: logs,
      links,
    });
  } catch (error: any) {
    console.error("[Volunteer Tasks] Error fetching task:", error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

export default router;
