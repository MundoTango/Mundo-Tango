import { Router, type Request, type Response } from "express";
import { db } from "@shared/db";
import logger from "../middleware/logger";
import {
  eventSeries,
  events,
  users,
  insertEventSeriesSchema
} from "@shared/schema";
import { authenticateToken, optionalAuth, AuthRequest } from "../middleware/auth";
import { eq, and, desc, gte, lt, sql } from "drizzle-orm";
import { z } from "zod";
import logger from "../middleware/logger";

const router = Router();

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const { city, country, organizerId, limit = "50", offset = "0" } = req.query;

    let query = db.select().from(eventSeries);

    const conditions = [];
    if (city) {
      conditions.push(eq(eventSeries.city, String(city)));
    }
    if (country) {
      conditions.push(eq(eventSeries.country, String(country)));
    }
    if (organizerId) {
      conditions.push(eq(eventSeries.organizerId, Number(organizerId)));
    }
    conditions.push(eq(eventSeries.isActive, true));

    const series = await db
      .select()
      .from(eventSeries)
      .where(and(...conditions))
      .orderBy(desc(eventSeries.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json({
      success: true,
      data: series,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: series.length
      }
    });
  } catch (error) {
    console.error("Error fetching event series:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch event series"
    });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const seriesId = Number(id);

    if (isNaN(seriesId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid series ID"
      });
    }

    const [series] = await db
      .select()
      .from(eventSeries)
      .where(eq(eventSeries.id, seriesId))
      .limit(1);

    if (!series) {
      return res.status(404).json({
        success: false,
        error: "Event series not found"
      });
    }

    const organizer = series.organizerId
      ? await db
          .select({
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage
          })
          .from(users)
          .where(eq(users.id, series.organizerId))
          .limit(1)
      : null;

    const now = new Date();

    const upcomingEvents = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.seriesId, seriesId),
          gte(events.startDate, now)
        )
      )
      .orderBy(events.startDate)
      .limit(10);

    const pastEvents = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.seriesId, seriesId),
          lt(events.startDate, now)
        )
      )
      .orderBy(desc(events.startDate))
      .limit(10);

    res.json({
      success: true,
      data: {
        ...series,
        organizer: organizer?.[0] || null,
        upcomingEvents,
        pastEvents
      }
    });
  } catch (error) {
    console.error("Error fetching event series:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch event series"
    });
  }
});

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const validatedData = insertEventSeriesSchema.parse({
      ...req.body,
      organizerId: userId
    });

    if (!validatedData.slug) {
      validatedData.slug = generateSlug(validatedData.name);
    }

    const existingSlug = await db
      .select({ id: eventSeries.id })
      .from(eventSeries)
      .where(eq(eventSeries.slug, validatedData.slug))
      .limit(1);

    if (existingSlug.length > 0) {
      validatedData.slug = `${validatedData.slug}-${Date.now()}`;
    }

    const [newSeries] = await db
      .insert(eventSeries)
      .values(validatedData)
      .returning();

    res.status(201).json({
      success: true,
      data: newSeries
    });
  } catch (error) {
    console.error("Error creating event series:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create event series"
    });
  }
});

router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const seriesId = Number(id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    if (isNaN(seriesId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid series ID"
      });
    }

    const [existingSeries] = await db
      .select()
      .from(eventSeries)
      .where(eq(eventSeries.id, seriesId))
      .limit(1);

    if (!existingSeries) {
      return res.status(404).json({
        success: false,
        error: "Event series not found"
      });
    }

    if (existingSeries.organizerId !== userId) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to update this series"
      });
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.organizerId;

    const [updatedSeries] = await db
      .update(eventSeries)
      .set(updateData)
      .where(eq(eventSeries.id, seriesId))
      .returning();

    res.json({
      success: true,
      data: updatedSeries
    });
  } catch (error) {
    console.error("Error updating event series:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update event series"
    });
  }
});

router.post("/:id/claim", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const seriesId = Number(id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    if (isNaN(seriesId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid series ID"
      });
    }

    const [existingSeries] = await db
      .select()
      .from(eventSeries)
      .where(eq(eventSeries.id, seriesId))
      .limit(1);

    if (!existingSeries) {
      return res.status(404).json({
        success: false,
        error: "Event series not found"
      });
    }

    if (existingSeries.isClaimed) {
      return res.status(400).json({
        success: false,
        error: "This series has already been claimed"
      });
    }

    const [claimedSeries] = await db
      .update(eventSeries)
      .set({
        organizerId: userId,
        isClaimed: true,
        updatedAt: new Date()
      })
      .where(eq(eventSeries.id, seriesId))
      .returning();

    res.json({
      success: true,
      data: claimedSeries,
      message: "Series claimed successfully"
    });
  } catch (error) {
    console.error("Error claiming event series:", error);
    res.status(500).json({
      success: false,
      error: "Failed to claim event series"
    });
  }
});

export default router;
