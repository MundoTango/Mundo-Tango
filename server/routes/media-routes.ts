import { Router, Response } from "express";
import { db } from "@shared/db";
import { media, users } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { authenticateToken, optionalAuth, type AuthRequest } from "../middleware/auth";
import { objectStorageService } from "../objectStorage";
import multer from "multer";
import { randomUUID } from "crypto";

const router = Router();

// Multer config for in-memory file handling (upload to Object Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max for images
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/webm'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, GIF, WebP, MP4, MOV, WebM`));
    }
  }
});

// ============================================================================
// POST /api/media/upload - Upload media to Object Storage (MB.MD Pattern 28)
// Returns URL instead of base64 - eliminates database bloat permanently
// ============================================================================
router.post("/upload", optionalAuth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    // Check if Object Storage is configured
    if (!objectStorageService.isConfigured()) {
      console.warn('[MediaUpload] Object Storage not configured, falling back to base64');
      // Fallback to base64 (temporary, for development only)
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      return res.json({
        success: true,
        url: base64,
        type: req.file.mimetype.startsWith('video/') ? 'video' : 'photo',
        storageType: 'base64'
      });
    }

    // Determine file type and extension
    const isVideo = req.file.mimetype.startsWith('video/');
    const type = isVideo ? 'video' : 'photo';
    const ext = getExtensionFromMime(req.file.mimetype);
    const filename = `${type}_${Date.now()}_${randomUUID().slice(0, 8)}${ext}`;
    const directory = isVideo ? 'videos' : 'images';

    // Upload to Object Storage with clean path structure
    const result = await objectStorageService.uploadBuffer(req.file.buffer, {
      filename,
      contentType: req.file.mimetype,
      isPublic: true,
      directory  // 'images' or 'videos' - will become /public-objects/images/filename.ext
    });

    if (!result.success) {
      console.error('[MediaUpload] Object Storage upload failed:', result.error);
      return res.status(500).json({ 
        success: false, 
        error: 'Upload failed: ' + (result.error || 'Unknown error') 
      });
    }

    const sizeMB = (req.file.buffer.length / 1024 / 1024).toFixed(2);
    console.log(`[MediaUpload] Uploaded ${type} to Object Storage: ${result.publicUrl} (${sizeMB}MB)`);

    res.json({
      success: true,
      url: result.publicUrl,
      objectPath: result.objectPath,
      type,
      storageType: 'object-storage'
    });

  } catch (error: any) {
    console.error('[MediaUpload] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Upload failed' 
    });
  }
});

// Helper to get file extension from MIME type
function getExtensionFromMime(mime: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'video/webm': '.webm'
  };
  return mimeToExt[mime] || '.bin';
}

// GET /api/media?type=photo|video - Get media with optional type filter
router.get("/", async (req, res: Response) => {
  try {
    const { type } = req.query;

    let query = db.select({
      media: media,
      uploader: {
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
      },
    })
    .from(media)
    .leftJoin(users, eq(media.userId, users.id))
    .orderBy(desc(media.createdAt));

    if (type) {
      query = query.where(eq(media.type, type as string)) as any;
    }

    const result = await query;

    res.json(result.map((r: any) => ({
      ...r.media,
      uploader: r.uploader,
    })));
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ message: "Failed to fetch media" });
  }
});

// POST /api/media - Create media (auth required)
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { type, url, thumbnail, caption } = req.body;

    if (!type || !url) {
      return res.status(400).json({ message: "Type and URL are required" });
    }

    const result = await db.insert(media).values({
      userId,
      type,
      url,
      thumbnail: thumbnail || null,
      caption: caption || null,
      likes: 0,
      comments: 0,
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating media:", error);
    res.status(500).json({ message: "Failed to create media" });
  }
});

// DELETE /api/media/:id - Delete media (auth required)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const existingResult = await db.select()
      .from(media)
      .where(eq(media.id, parseInt(id)))
      .limit(1);

    if (existingResult.length === 0) {
      return res.status(404).json({ message: "Media not found" });
    }

    const existing: any = existingResult[0];

    if (existing.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this media" });
    }

    await db.delete(media).where(eq(media.id, parseInt(id)));

    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media:", error);
    res.status(500).json({ message: "Failed to delete media" });
  }
});

// POST /api/media/:id/like - Like media (auth required)
router.post("/:id/like", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.update(media)
      .set({
        likes: sql`${media.likes} + 1`,
      })
      .where(eq(media.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ message: "Media not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error liking media:", error);
    res.status(500).json({ message: "Failed to like media" });
  }
});

export default router;
