import { Router } from "express";
import type { IStorage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";

export function createBookmarkRoutes(storage: IStorage) {
  const router = Router();

  router.get("/bookmarks", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const { collection } = req.query;
      
      const bookmarks = await storage.getUserBookmarks(userId, collection as string);
      res.json(bookmarks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/bookmarks/collections", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const collections = await storage.getUserBookmarkCollections(userId);
      res.json(collections);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/posts/:postId/bookmark", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const postId = parseInt(req.params.postId);
      const { collectionName, notes } = req.body;
      
      const bookmark = await storage.createBookmark({
        userId,
        postId,
        collectionName: collectionName || "Saved Posts",
        notes,
      });
      
      res.json(bookmark);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete("/posts/:postId/bookmark", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const postId = parseInt(req.params.postId);
      
      await storage.deleteBookmark(userId, postId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/posts/:postId/edits", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const edits = await storage.getPostEditHistory(postId);
      res.json(edits);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
