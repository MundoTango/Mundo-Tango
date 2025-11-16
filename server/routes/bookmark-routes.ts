import { Router } from "express";
import { z } from "zod";
import type { IStorage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";

// ✅ SECURITY-FIRST: Zod schemas for input validation (mb.md v8.0)
const createBookmarkSchema = z.object({
  collectionName: z.string().min(1).max(100).optional(),
  notes: z.string().max(500).optional(),
});

const getBookmarksSchema = z.object({
  collection: z.string().max(100).optional(),
});

const postIdParamSchema = z.object({
  postId: z.string().regex(/^\d+$/, "Invalid post ID"),
});

export function createBookmarkRoutes(storage: IStorage) {
  const router = Router();

  // ✅ ERROR-FIRST: Specific error handling with user-friendly messages
  router.get("/bookmarks", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      
      // Validate query params
      const { collection } = getBookmarksSchema.parse(req.query);
      
      const bookmarks = await storage.getUserBookmarks(userId, collection);
      res.json(bookmarks);
    } catch (error: any) {
      // Zod validation error
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Invalid request parameters",
          details: error.errors,
        });
      }
      
      // Database error
      if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
        return res.status(503).json({ 
          error: "Database temporarily unavailable. Please try again.",
        });
      }
      
      // Generic fallback
      console.error("Unexpected error in GET /bookmarks:", {
        userId,
        error: error.message,
        stack: error.stack,
      });
      
      res.status(500).json({ 
        error: "Failed to retrieve bookmarks. Please try again later.",
      });
    }
  });

  router.get("/bookmarks/collections", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const collections = await storage.getUserBookmarkCollections(userId);
      res.json(collections);
    } catch (error: any) {
      // Database error
      if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
        return res.status(503).json({ 
          error: "Database temporarily unavailable. Please try again.",
        });
      }
      
      console.error("Unexpected error in GET /bookmarks/collections:", {
        userId: req.userId,
        error: error.message,
        stack: error.stack,
      });
      
      res.status(500).json({ 
        error: "Failed to retrieve bookmark collections. Please try again later.",
      });
    }
  });

  router.post("/posts/:postId/bookmark", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      
      // Validate post ID param
      const { postId: postIdStr } = postIdParamSchema.parse(req.params);
      const postId = parseInt(postIdStr);
      
      // Validate request body
      const { collectionName, notes } = createBookmarkSchema.parse(req.body);
      
      const bookmark = await storage.createBookmark({
        userId,
        postId,
        collectionName: collectionName || "Saved Posts",
        notes,
      });
      
      res.json(bookmark);
    } catch (error: any) {
      // Zod validation error
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Invalid bookmark data",
          details: error.errors,
        });
      }
      
      // Post not found
      if (error.message?.includes("not found") || error.message?.includes("does not exist")) {
        return res.status(404).json({ 
          error: "Post not found. It may have been deleted.",
        });
      }
      
      // Duplicate bookmark
      if (error.code === "23505" || error.message?.includes("already bookmarked")) {
        return res.status(409).json({ 
          error: "You've already bookmarked this post.",
        });
      }
      
      // Database error
      if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
        return res.status(503).json({ 
          error: "Database temporarily unavailable. Please try again.",
        });
      }
      
      console.error("Unexpected error in POST /posts/:postId/bookmark:", {
        userId,
        postId: req.params.postId,
        error: error.message,
        stack: error.stack,
      });
      
      res.status(500).json({ 
        error: "Failed to save post. Please try again later.",
      });
    }
  });

  router.delete("/posts/:postId/bookmark", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      
      // Validate post ID param
      const { postId: postIdStr } = postIdParamSchema.parse(req.params);
      const postId = parseInt(postIdStr);
      
      await storage.deleteBookmark(userId, postId);
      res.json({ success: true });
    } catch (error: any) {
      // Zod validation error
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Invalid post ID",
          details: error.errors,
        });
      }
      
      // Bookmark not found (not an error - idempotent)
      if (error.message?.includes("not found") || error.message?.includes("does not exist")) {
        return res.json({ success: true, message: "Bookmark already removed" });
      }
      
      // Database error
      if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
        return res.status(503).json({ 
          error: "Database temporarily unavailable. Please try again.",
        });
      }
      
      console.error("Unexpected error in DELETE /posts/:postId/bookmark:", {
        userId,
        postId: req.params.postId,
        error: error.message,
        stack: error.stack,
      });
      
      res.status(500).json({ 
        error: "Failed to remove bookmark. Please try again later.",
      });
    }
  });

  router.get("/posts/:postId/edits", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Validate post ID param
      const { postId: postIdStr } = postIdParamSchema.parse(req.params);
      const postId = parseInt(postIdStr);
      
      const edits = await storage.getPostEditHistory(postId);
      res.json(edits);
    } catch (error: any) {
      // Zod validation error
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Invalid post ID",
          details: error.errors,
        });
      }
      
      // Post not found
      if (error.message?.includes("not found") || error.message?.includes("does not exist")) {
        return res.status(404).json({ 
          error: "Post not found. It may have been deleted.",
        });
      }
      
      // Database error
      if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
        return res.status(503).json({ 
          error: "Database temporarily unavailable. Please try again.",
        });
      }
      
      console.error("Unexpected error in GET /posts/:postId/edits:", {
        postId: req.params.postId,
        error: error.message,
        stack: error.stack,
      });
      
      res.status(500).json({ 
        error: "Failed to retrieve edit history. Please try again later.",
      });
    }
  });

  return router;
}
