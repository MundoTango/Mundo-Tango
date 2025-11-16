import { Router, type Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { db } from "../db";
import { posts, postDrafts, users } from "../../shared/schema";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { eq, and, like, or, desc, sql, ilike } from "drizzle-orm";

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// ============================================================================
// Feature 2: Multiple Image Upload
// ============================================================================

router.post("/images", authenticateToken, upload.array('images', 10), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: "No images provided" });
    }

    const uploadedUrls: string[] = [];

    // In a real app, you'd upload to cloud storage (Cloudinary, S3, etc.)
    // For now, we'll convert to base64 data URLs
    for (const file of req.files) {
      const base64 = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64}`;
      uploadedUrls.push(dataUrl);
    }

    res.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ error: "Failed to upload images" });
  }
});

// ============================================================================
// Feature 3: Video Upload & Processing
// ============================================================================

router.post("/videos", authenticateToken, upload.single('video'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video provided" });
    }

    // Validate file size (100MB max)
    if (req.file.size > 100 * 1024 * 1024) {
      return res.status(400).json({ error: "Video size exceeds 100MB limit" });
    }

    // In a real app, you'd:
    // 1. Upload to cloud storage
    // 2. Generate thumbnail using ffmpeg or similar
    // 3. Return both video URL and thumbnail URL

    // For now, convert to base64 data URL
    const base64 = req.file.buffer.toString('base64');
    const videoUrl = `data:${req.file.mimetype};base64,${base64}`;
    
    // Mock thumbnail (first frame would be extracted in production)
    const thumbnailUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;

    res.json({ 
      videoUrl, 
      thumbnailUrl,
      duration: 0, // Would be extracted from video metadata
      size: req.file.size 
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Failed to upload video" });
  }
});

// ============================================================================
// Feature 4: User Search for Mentions
// ============================================================================

const userSearchSchema = z.object({
  q: z.string().min(1).max(50),
  limit: z.coerce.number().min(1).max(20).default(10),
});

router.get("/users/search", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { q, limit } = userSearchSchema.parse(req.query);

    // Fuzzy search by name or username
    const searchResults = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
      })
      .from(users)
      .where(
        and(
          or(
            ilike(users.name, `%${q}%`),
            ilike(users.username, `%${q}%`)
          ),
          eq(users.isActive, true)
        )
      )
      .limit(limit);

    res.json(searchResults);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

// ============================================================================
// Feature 5: Hashtag Suggestions
// ============================================================================

router.get("/hashtags/trending", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Get top trending hashtags from recent posts
    const trendingHashtags = await db
      .select({
        hashtag: sql<string>`unnest(hashtags)`,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(posts)
      .where(
        sql`created_at > NOW() - INTERVAL '7 days' AND hashtags IS NOT NULL`
      )
      .groupBy(sql`unnest(hashtags)`)
      .orderBy(desc(sql`count(*)`))
      .limit(20);

    res.json(trendingHashtags);
  } catch (error) {
    console.error("Error fetching trending hashtags:", error);
    res.status(500).json({ error: "Failed to fetch trending hashtags" });
  }
});

const hashtagSuggestSchema = z.object({
  content: z.string().max(5000),
});

router.get("/hashtags/suggest", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = hashtagSuggestSchema.parse(req.query);

    // Simple keyword extraction for hashtag suggestions
    const words = content.toLowerCase().split(/\s+/);
    const keywords = words.filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'with', 'this', 'that', 'from'].includes(word)
    ).slice(0, 5);

    // Get existing hashtags that match these keywords
    const suggestions = await db
      .select({
        hashtag: sql<string>`unnest(hashtags)`,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(posts)
      .where(
        and(
          sql`hashtags IS NOT NULL`,
          or(...keywords.map(keyword => 
            sql`EXISTS (SELECT 1 FROM unnest(hashtags) AS tag WHERE tag ILIKE ${'%' + keyword + '%'})`
          ))
        )
      )
      .groupBy(sql`unnest(hashtags)`)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    res.json(suggestions);
  } catch (error) {
    console.error("Error suggesting hashtags:", error);
    res.status(500).json({ error: "Failed to suggest hashtags" });
  }
});

// ============================================================================
// Feature 7: Scheduled Posts
// ============================================================================

const createScheduledPostSchema = z.object({
  content: z.string().min(1).max(5000),
  richContent: z.any().optional(),
  scheduledFor: z.string().datetime(),
  visibility: z.enum(['public', 'friends', 'private']).default('public'),
  mediaGallery: z.array(z.object({
    url: z.string(),
    type: z.enum(['image', 'video']),
    order: z.number(),
  })).optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  location: z.string().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

router.post("/schedule", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const data = createScheduledPostSchema.parse(req.body);

    // Calculate word count
    const wordCount = data.content.split(/\s+/).filter(word => word.length > 0).length;

    const [scheduledPost] = await db.insert(posts).values({
      userId,
      content: data.content,
      richContent: data.richContent,
      scheduledFor: new Date(data.scheduledFor),
      status: 'scheduled',
      visibility: data.visibility,
      mediaGallery: data.mediaGallery,
      hashtags: data.hashtags,
      mentions: data.mentions,
      location: data.location,
      coordinates: data.coordinates,
      wordCount,
    }).returning();

    res.json(scheduledPost);
  } catch (error) {
    console.error("Error creating scheduled post:", error);
    res.status(500).json({ error: "Failed to create scheduled post" });
  }
});

router.get("/scheduled", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const scheduledPosts = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.userId, userId),
          eq(posts.status, 'scheduled')
        )
      )
      .orderBy(posts.scheduledFor);

    res.json(scheduledPosts);
  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    res.status(500).json({ error: "Failed to fetch scheduled posts" });
  }
});

router.delete("/scheduled/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const postId = parseInt(req.params.id);

    await db
      .delete(posts)
      .where(
        and(
          eq(posts.id, postId),
          eq(posts.userId, userId),
          eq(posts.status, 'scheduled')
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting scheduled post:", error);
    res.status(500).json({ error: "Failed to delete scheduled post" });
  }
});

// ============================================================================
// Feature 8: Drafts
// ============================================================================

const saveDraftSchema = z.object({
  content: z.string().optional(),
  richContent: z.any().optional(),
  mediaGallery: z.any().optional(),
  videoUrl: z.string().optional(),
  videoThumbnail: z.string().optional(),
  mentions: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  visibility: z.enum(['public', 'friends', 'private']).default('public'),
});

router.post("/drafts", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const data = saveDraftSchema.parse(req.body);

    const [draft] = await db.insert(postDrafts).values({
      userId,
      ...data,
      lastSaved: new Date(),
    }).returning();

    res.json(draft);
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({ error: "Failed to save draft" });
  }
});

router.get("/drafts", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const drafts = await db
      .select()
      .from(postDrafts)
      .where(eq(postDrafts.userId, userId))
      .orderBy(desc(postDrafts.lastSaved));

    res.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    res.status(500).json({ error: "Failed to fetch drafts" });
  }
});

router.put("/drafts/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const draftId = parseInt(req.params.id);
    const data = saveDraftSchema.parse(req.body);

    const [updatedDraft] = await db
      .update(postDrafts)
      .set({
        ...data,
        lastSaved: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(postDrafts.id, draftId),
          eq(postDrafts.userId, userId)
        )
      )
      .returning();

    if (!updatedDraft) {
      return res.status(404).json({ error: "Draft not found" });
    }

    res.json(updatedDraft);
  } catch (error) {
    console.error("Error updating draft:", error);
    res.status(500).json({ error: "Failed to update draft" });
  }
});

router.delete("/drafts/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const draftId = parseInt(req.params.id);

    await db
      .delete(postDrafts)
      .where(
        and(
          eq(postDrafts.id, draftId),
          eq(postDrafts.userId, userId)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting draft:", error);
    res.status(500).json({ error: "Failed to delete draft" });
  }
});

export default router;
