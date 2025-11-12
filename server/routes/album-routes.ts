import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { insertMediaAlbumSchema, mediaAlbums, albumMedia, media } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { db } from "@shared/db";
import { eq, and } from "drizzle-orm";

const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: Function) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationError.toString() 
        });
      }
      next(error);
    }
  };
};

const createAlbumBodySchema = insertMediaAlbumSchema.omit({ userId: true });
const addMediaSchema = z.object({
  mediaId: z.number().int().positive(),
  order: z.number().int().min(0).optional().default(0),
});

export function registerAlbumRoutes(app: Express) {
  
  // POST /api/media/albums - Create a new album
  app.post(
    "/api/media/albums",
    authenticateToken,
    validateRequest(createAlbumBodySchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const albumData = {
          ...req.body,
          userId: req.user.id,
        };

        const album = await storage.createAlbum(albumData);
        res.status(201).json(album);
      } catch (error) {
        console.error("Error creating album:", error);
        res.status(500).json({ message: "Failed to create album" });
      }
    }
  );

  // GET /api/media/albums - List user's albums
  app.get(
    "/api/media/albums",
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const albums = await storage.getUserAlbums(req.user.id);
        
        // Get cover images for each album
        const albumsWithCovers = await Promise.all(
          albums.map(async (album) => {
            if (album.coverImageId) {
              const coverImage = await db
                .select()
                .from(media)
                .where(eq(media.id, album.coverImageId))
                .limit(1);
              return { ...album, coverImage: coverImage[0] || null };
            }
            return { ...album, coverImage: null };
          })
        );

        res.json(albumsWithCovers);
      } catch (error) {
        console.error("Error fetching albums:", error);
        res.status(500).json({ message: "Failed to fetch albums" });
      }
    }
  );

  // GET /api/media/albums/:id - Get album details with privacy check
  app.get(
    "/api/media/albums/:id",
    async (req: Request, res: Response) => {
      try {
        const albumId = parseInt(req.params.id);
        if (isNaN(albumId)) {
          return res.status(400).json({ message: "Invalid album ID" });
        }

        const album = await storage.getAlbumById(albumId);
        if (!album) {
          return res.status(404).json({ message: "Album not found" });
        }

        // Check privacy
        const authReq = req as AuthRequest;
        if (album.privacy === "private" && album.userId !== authReq.user?.id) {
          return res.status(403).json({ message: "Access denied" });
        }

        if (album.privacy === "friends" && authReq.user) {
          const areFriends = await storage.checkFriendship(album.userId, authReq.user.id);
          if (!areFriends && album.userId !== authReq.user.id) {
            return res.status(403).json({ message: "Access denied" });
          }
        }

        // Get cover image
        let coverImage = null;
        if (album.coverImageId) {
          const coverResult = await db
            .select()
            .from(media)
            .where(eq(media.id, album.coverImageId))
            .limit(1);
          coverImage = coverResult[0] || null;
        }

        res.json({ ...album, coverImage });
      } catch (error) {
        console.error("Error fetching album:", error);
        res.status(500).json({ message: "Failed to fetch album" });
      }
    }
  );

  // PUT /api/media/albums/:id - Update album
  app.put(
    "/api/media/albums/:id",
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const albumId = parseInt(req.params.id);
        if (isNaN(albumId)) {
          return res.status(400).json({ message: "Invalid album ID" });
        }

        // Check ownership
        const isOwner = await storage.checkAlbumOwnership(albumId, req.user.id);
        if (!isOwner) {
          return res.status(403).json({ message: "Access denied" });
        }

        const album = await storage.updateAlbum(albumId, req.body);
        if (!album) {
          return res.status(404).json({ message: "Album not found" });
        }

        res.json(album);
      } catch (error) {
        console.error("Error updating album:", error);
        res.status(500).json({ message: "Failed to update album" });
      }
    }
  );

  // DELETE /api/media/albums/:id - Delete album
  app.delete(
    "/api/media/albums/:id",
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const albumId = parseInt(req.params.id);
        if (isNaN(albumId)) {
          return res.status(400).json({ message: "Invalid album ID" });
        }

        // Check ownership
        const isOwner = await storage.checkAlbumOwnership(albumId, req.user.id);
        if (!isOwner) {
          return res.status(403).json({ message: "Access denied" });
        }

        await storage.deleteAlbum(albumId);
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting album:", error);
        res.status(500).json({ message: "Failed to delete album" });
      }
    }
  );

  // POST /api/media/albums/:id/media - Add media to album
  app.post(
    "/api/media/albums/:id/media",
    authenticateToken,
    validateRequest(addMediaSchema),
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const albumId = parseInt(req.params.id);
        if (isNaN(albumId)) {
          return res.status(400).json({ message: "Invalid album ID" });
        }

        // Check ownership
        const isOwner = await storage.checkAlbumOwnership(albumId, req.user.id);
        if (!isOwner) {
          return res.status(403).json({ message: "Access denied" });
        }

        const { mediaId, order } = req.body;

        // Verify media exists and belongs to user
        const mediaItem = await db
          .select()
          .from(media)
          .where(eq(media.id, mediaId))
          .limit(1);

        if (!mediaItem[0]) {
          return res.status(404).json({ message: "Media not found" });
        }

        if (mediaItem[0].userId !== req.user.id) {
          return res.status(403).json({ message: "Cannot add media you don't own" });
        }

        const result = await storage.addMediaToAlbum(albumId, mediaId, order || 0);
        res.status(201).json(result);
      } catch (error) {
        console.error("Error adding media to album:", error);
        if ((error as any).code === "23505") {
          return res.status(409).json({ message: "Media already in album" });
        }
        res.status(500).json({ message: "Failed to add media to album" });
      }
    }
  );

  // GET /api/media/albums/:id/media - Get album contents with pagination
  app.get(
    "/api/media/albums/:id/media",
    async (req: Request, res: Response) => {
      try {
        const albumId = parseInt(req.params.id);
        if (isNaN(albumId)) {
          return res.status(400).json({ message: "Invalid album ID" });
        }

        const album = await storage.getAlbumById(albumId);
        if (!album) {
          return res.status(404).json({ message: "Album not found" });
        }

        // Check privacy
        const authReq = req as AuthRequest;
        if (album.privacy === "private" && album.userId !== authReq.user?.id) {
          return res.status(403).json({ message: "Access denied" });
        }

        if (album.privacy === "friends" && authReq.user) {
          const areFriends = await storage.checkFriendship(album.userId, authReq.user.id);
          if (!areFriends && album.userId !== authReq.user.id) {
            return res.status(403).json({ message: "Access denied" });
          }
        }

        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const mediaItems = await storage.getAlbumMedia(albumId, { limit, offset });
        res.json(mediaItems);
      } catch (error) {
        console.error("Error fetching album media:", error);
        res.status(500).json({ message: "Failed to fetch album media" });
      }
    }
  );

  // DELETE /api/media/albums/:albumId/media/:mediaId - Remove media from album
  app.delete(
    "/api/media/albums/:albumId/media/:mediaId",
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const albumId = parseInt(req.params.albumId);
        const mediaId = parseInt(req.params.mediaId);

        if (isNaN(albumId) || isNaN(mediaId)) {
          return res.status(400).json({ message: "Invalid album or media ID" });
        }

        // Check ownership
        const isOwner = await storage.checkAlbumOwnership(albumId, req.user.id);
        if (!isOwner) {
          return res.status(403).json({ message: "Access denied" });
        }

        await storage.removeMediaFromAlbum(albumId, mediaId);
        res.status(204).send();
      } catch (error) {
        console.error("Error removing media from album:", error);
        res.status(500).json({ message: "Failed to remove media from album" });
      }
    }
  );
}
