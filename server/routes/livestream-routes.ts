import { Router, type Request, type Response } from "express";
import { db } from "@shared/db";
import { liveStreams, liveStreamMessages, users } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

// ============================================================================
// LIVE STREAM ROUTES
// ============================================================================

// GET /api/livestreams - Get all live streams
router.get("/", async (req: Request, res: Response) => {
  try {
    const { live, limit = "20", offset = "0" } = req.query;

    let query = db.select().from(liveStreams).$dynamic();

    if (live === "true") {
      query = query.where(eq(liveStreams.isLive, true));
    }

    const results = await query
      .orderBy(desc(liveStreams.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(results);
  } catch (error) {
    console.error("[Livestream] Error fetching streams:", error);
    res.status(500).json({ message: "Failed to fetch live streams" });
  }
});

// GET /api/livestreams/live - Get only currently live streams
router.get("/live", async (req: Request, res: Response) => {
  try {
    const streams = await db
      .select()
      .from(liveStreams)
      .where(eq(liveStreams.isLive, true))
      .orderBy(desc(liveStreams.viewers));

    res.json(streams);
  } catch (error) {
    console.error("[Livestream] Error fetching live streams:", error);
    res.status(500).json({ message: "Failed to fetch live streams" });
  }
});

// GET /api/livestreams/:id - Get specific stream
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stream = await db
      .select()
      .from(liveStreams)
      .where(eq(liveStreams.id, parseInt(id)))
      .limit(1);

    if (stream.length === 0) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json(stream[0]);
  } catch (error) {
    console.error("[Livestream] Error fetching stream:", error);
    res.status(500).json({ message: "Failed to fetch stream" });
  }
});

// POST /api/livestreams - Create new stream (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      host,
      thumbnail,
      scheduledDate
    } = req.body;

    if (!title || !host) {
      return res.status(400).json({ message: "Title and host are required" });
    }

    const [stream] = await db
      .insert(liveStreams)
      .values({
        title,
        host,
        thumbnail,
        scheduledDate,
        isLive: false,
        viewers: 0,
        registrations: 0
      })
      .returning();

    res.status(201).json(stream);
  } catch (error) {
    console.error("[Livestream] Error creating stream:", error);
    res.status(500).json({ message: "Failed to create stream" });
  }
});

// PATCH /api/livestreams/:id - Update stream (auth required)
router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(liveStreams)
      .set(req.body)
      .where(eq(liveStreams.id, parseInt(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("[Livestream] Error updating stream:", error);
    res.status(500).json({ message: "Failed to update stream" });
  }
});

// POST /api/livestreams/:id/go-live - Start broadcasting (auth required)
router.post("/:id/go-live", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(liveStreams)
      .set({ isLive: true })
      .where(eq(liveStreams.id, parseInt(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("[Livestream] Error starting stream:", error);
    res.status(500).json({ message: "Failed to start stream" });
  }
});

// POST /api/livestreams/:id/end - End broadcast (auth required)
router.post("/:id/end", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(liveStreams)
      .set({ 
        isLive: false,
        viewers: 0
      })
      .where(eq(liveStreams.id, parseInt(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("[Livestream] Error ending stream:", error);
    res.status(500).json({ message: "Failed to end stream" });
  }
});

// POST /api/livestreams/:id/register - Register for scheduled stream (auth required)
router.post("/:id/register", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(liveStreams)
      .set({ 
        registrations: sql`${liveStreams.registrations} + 1`
      })
      .where(eq(liveStreams.id, parseInt(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("[Livestream] Error registering for stream:", error);
    res.status(500).json({ message: "Failed to register for stream" });
  }
});

// POST /api/livestreams/:id/viewer-join - Increment viewer count
router.post("/:id/viewer-join", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(liveStreams)
      .set({ 
        viewers: sql`${liveStreams.viewers} + 1`
      })
      .where(eq(liveStreams.id, parseInt(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("[Livestream] Error joining stream:", error);
    res.status(500).json({ message: "Failed to join stream" });
  }
});

// POST /api/livestreams/:id/viewer-leave - Decrement viewer count
router.post("/:id/viewer-leave", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(liveStreams)
      .set({ 
        viewers: sql`GREATEST(0, ${liveStreams.viewers} - 1)`
      })
      .where(eq(liveStreams.id, parseInt(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: "Stream not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("[Livestream] Error leaving stream:", error);
    res.status(500).json({ message: "Failed to leave stream" });
  }
});

// DELETE /api/livestreams/:id - Delete stream (auth required)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await db
      .delete(liveStreams)
      .where(eq(liveStreams.id, parseInt(id)));

    res.json({ message: "Stream deleted successfully" });
  } catch (error) {
    console.error("[Livestream] Error deleting stream:", error);
    res.status(500).json({ message: "Failed to delete stream" });
  }
});

// ============================================================================
// LIVE STREAM CHAT ROUTES
// ============================================================================

// GET /api/livestreams/:id/messages - Get message history
router.get("/:id/messages", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = "50", offset = "0" } = req.query;

    const messages = await db
      .select({
        id: liveStreamMessages.id,
        streamId: liveStreamMessages.streamId,
        userId: liveStreamMessages.userId,
        message: liveStreamMessages.message,
        createdAt: liveStreamMessages.createdAt,
        username: users.username,
        profileImage: users.profileImage,
      })
      .from(liveStreamMessages)
      .leftJoin(users, eq(liveStreamMessages.userId, users.id))
      .where(eq(liveStreamMessages.streamId, parseInt(id)))
      .orderBy(desc(liveStreamMessages.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(messages.reverse());
  } catch (error) {
    console.error("[Livestream] Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// POST /api/livestreams/:id/messages - Send message
router.post("/:id/messages", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const [newMessage] = await db
      .insert(liveStreamMessages)
      .values({
        streamId: parseInt(id),
        userId: req.userId!,
        message: message.trim(),
      })
      .returning();

    const [messageWithUser] = await db
      .select({
        id: liveStreamMessages.id,
        streamId: liveStreamMessages.streamId,
        userId: liveStreamMessages.userId,
        message: liveStreamMessages.message,
        createdAt: liveStreamMessages.createdAt,
        username: users.username,
        profileImage: users.profileImage,
      })
      .from(liveStreamMessages)
      .leftJoin(users, eq(liveStreamMessages.userId, users.id))
      .where(eq(liveStreamMessages.id, newMessage.id))
      .limit(1);

    res.status(201).json(messageWithUser);
  } catch (error) {
    console.error("[Livestream] Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

export default router;
