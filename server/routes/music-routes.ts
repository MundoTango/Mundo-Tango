import { Router, Response } from "express";
import { db } from "@shared/db";
import { musicLibrary, playlists, playlistSongs, musicFavorites } from "@shared/schema";
import { eq, desc, and, or, ilike } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/music - List songs with search/filter
router.get("/", async (req, res: Response) => {
  try {
    const { search, genre, artist } = req.query;

    let query = db.select()
      .from(musicLibrary)
      .orderBy(desc(musicLibrary.createdAt))
      .$dynamic();

    const conditions = [];
    
    if (search && typeof search === "string") {
      conditions.push(
        or(
          ilike(musicLibrary.title, `%${search}%`),
          ilike(musicLibrary.artist, `%${search}%`),
          ilike(musicLibrary.album, `%${search}%`)
        ) as any
      );
    }

    if (genre && typeof genre === "string") {
      conditions.push(eq(musicLibrary.genre, genre));
    }

    if (artist && typeof artist === "string") {
      conditions.push(ilike(musicLibrary.artist, `%${artist}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;

    res.json(result);
  } catch (error) {
    console.error("Error fetching music:", error);
    res.status(500).json({ message: "Failed to fetch music" });
  }
});

// GET /api/music/:id - Get song detail
router.get("/:id", async (req, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.select()
      .from(musicLibrary)
      .where(eq(musicLibrary.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching song:", error);
    res.status(500).json({ message: "Failed to fetch song" });
  }
});

// POST /api/music/playlist - Create playlist (auth required)
router.post("/playlist", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Playlist name is required" });
    }

    const result = await db.insert(playlists).values({
      userId,
      name,
      description: description || null,
      isPublic: isPublic || false,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ message: "Failed to create playlist" });
  }
});

// GET /api/music/playlists - Get user's playlists (auth required)
router.get("/playlists", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const result = await db.select()
      .from(playlists)
      .where(eq(playlists.userId, userId))
      .orderBy(desc(playlists.updatedAt));

    res.json(result);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ message: "Failed to fetch playlists" });
  }
});

// POST /api/music/:id/favorite - Favorite song (auth required)
router.post("/:id/favorite", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check if already favorited
    const existing = await db.select()
      .from(musicFavorites)
      .where(and(
        eq(musicFavorites.userId, userId),
        eq(musicFavorites.songId, parseInt(id))
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ message: "Song already in favorites" });
    }

    const result = await db.insert(musicFavorites).values({
      userId,
      songId: parseInt(id),
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ message: "Failed to add favorite" });
  }
});

// GET /api/music/favorites - Get user's favorite songs (auth required)
router.get("/favorites", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const result = await db.select({
      favorite: musicFavorites,
      song: musicLibrary,
    })
    .from(musicFavorites)
    .leftJoin(musicLibrary, eq(musicFavorites.songId, musicLibrary.id))
    .where(eq(musicFavorites.userId, userId))
    .orderBy(desc(musicFavorites.createdAt));

    res.json(result.map((r: any) => ({
      ...r.favorite,
      song: r.song,
    })));
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
});

// POST /api/music/tracks - Upload track (auth required)
router.post("/tracks", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, artist, album, genre, year, duration, fileUrl, orchestra } = req.body;

    if (!title || !artist) {
      return res.status(400).json({ message: "Title and artist are required" });
    }

    const result = await db.insert(musicLibrary).values({
      title,
      artist,
      album: album || null,
      genre: genre || null,
      year: year || null,
      duration: duration || null,
      fileUrl: fileUrl || null,
      orchestra: orchestra || null,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error uploading track:", error);
    res.status(500).json({ message: "Failed to upload track" });
  }
});

// POST /api/music/playlists - Create playlist (auth required) - ALIAS for /playlist
router.post("/playlists", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Playlist name is required" });
    }

    const result = await db.insert(playlists).values({
      userId,
      name,
      description: description || null,
      isPublic: isPublic || false,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ message: "Failed to create playlist" });
  }
});

export default router;
