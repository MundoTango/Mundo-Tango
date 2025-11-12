/**
 * BATCH 13-14: Profile Media Upload Routes
 * 
 * Handles media uploads for user profiles including:
 * - Portfolio/gallery photos and videos
 * - Profile avatar updates
 * - Background/cover image updates
 * 
 * Uses Cloudinary if configured, falls back to base64 data URLs
 * Supports image optimization and video transcoding via Cloudinary
 */

import { Router, type Response } from "express";
import { db } from "@shared/db";
import { 
  profileMedia, 
  users,
  insertProfileMediaSchema,
  updateProfileMediaSchema,
  type SelectProfileMedia 
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { z } from "zod";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const router = Router();

// ============================================================================
// MULTER CONFIGURATION
// ============================================================================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/webm',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP, MP4, MOV, WebM'));
    }
  }
});

// ============================================================================
// CLOUDINARY CONFIGURATION
// ============================================================================

// Configure Cloudinary if environment variables are present
if (process.env.CLOUDINARY_URL || 
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[ProfileMedia] Cloudinary configured');
} else {
  console.warn('[ProfileMedia] Cloudinary not configured - using base64 fallback');
}

// ============================================================================
// UPLOAD HELPERS
// ============================================================================

/**
 * Upload file to Cloudinary or convert to base64
 */
async function uploadToCloudinary(
  file: Express.Multer.File,
  folder: string = 'profile_media'
): Promise<{ url: string; thumbnail?: string; publicId?: string }> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // Fallback to base64
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;
    return { url: dataUrl };
  }

  try {
    const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          transformation: resourceType === 'image' ? [
            { width: 1920, height: 1920, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ] : undefined,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          
          resolve({
            url: result.secure_url,
            thumbnail: result.eager?.[0]?.secure_url || result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      
      uploadStream.end(file.buffer);
    });
  } catch (error) {
    console.error('[ProfileMedia] Cloudinary upload failed:', error);
    // Fallback to base64
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;
    return { url: dataUrl };
  }
}

/**
 * Delete file from Cloudinary
 */
async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !publicId) return;
  
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('[ProfileMedia] Cloudinary delete failed:', error);
  }
}

// ============================================================================
// PORTFOLIO/GALLERY ROUTES
// ============================================================================

/**
 * POST /api/profile/media/upload
 * Upload photo/video to user's profile gallery
 */
router.post('/media/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { caption, category, tags, displayOrder } = req.body;

    // Upload to Cloudinary or convert to base64
    const uploadResult = await uploadToCloudinary(req.file, `profiles/${req.userId}/gallery`);

    // Determine media type
    const type = req.file.mimetype.startsWith('video/') ? 'video' : 'photo';

    // Create media record
    const mediaData = {
      userId: req.userId,
      type,
      url: uploadResult.url,
      thumbnail: uploadResult.thumbnail,
      caption: caption || null,
      category: category || 'portfolio',
      tags: tags ? JSON.parse(tags) : [],
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    };

    const validatedData = insertProfileMediaSchema.parse(mediaData);
    const [media] = await db.insert(profileMedia).values(validatedData).returning();

    res.status(201).json(media);
  } catch (error) {
    console.error('[ProfileMedia] Upload error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Failed to upload media' });
  }
});

/**
 * GET /api/profile/media/:userId
 * Get user's profile media gallery
 */
router.get('/media/:userId', async (req, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const { category, type, featured } = req.query;

    let query = db.select()
      .from(profileMedia)
      .where(eq(profileMedia.userId, userId));

    // Apply filters
    if (category) {
      query = query.where(eq(profileMedia.category, category as string)) as any;
    }
    if (type) {
      query = query.where(eq(profileMedia.type, type as string)) as any;
    }
    if (featured === 'true') {
      query = query.where(eq(profileMedia.isFeatured, true)) as any;
    }

    const media = await query.orderBy(
      desc(profileMedia.isFeatured),
      profileMedia.displayOrder,
      desc(profileMedia.createdAt)
    );

    res.json(media);
  } catch (error) {
    console.error('[ProfileMedia] Get media error:', error);
    res.status(500).json({ message: 'Failed to fetch media' });
  }
});

/**
 * PUT /api/profile/media/:mediaId
 * Update media metadata (caption, order, category, etc.)
 */
router.put('/media/:mediaId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const mediaId = parseInt(req.params.mediaId);
    
    if (isNaN(mediaId)) {
      return res.status(400).json({ message: 'Invalid media ID' });
    }

    // Check ownership
    const [existing] = await db.select()
      .from(profileMedia)
      .where(eq(profileMedia.id, mediaId))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ message: 'Media not found' });
    }

    if (existing.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this media' });
    }

    // Validate update data
    const validatedData = updateProfileMediaSchema.parse(req.body);

    // Update media
    const [updated] = await db.update(profileMedia)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(profileMedia.id, mediaId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('[ProfileMedia] Update error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Failed to update media' });
  }
});

/**
 * DELETE /api/profile/media/:mediaId
 * Delete media item from gallery
 */
router.delete('/media/:mediaId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const mediaId = parseInt(req.params.mediaId);
    
    if (isNaN(mediaId)) {
      return res.status(400).json({ message: 'Invalid media ID' });
    }

    // Check ownership
    const [existing] = await db.select()
      .from(profileMedia)
      .where(eq(profileMedia.id, mediaId))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ message: 'Media not found' });
    }

    if (existing.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this media' });
    }

    // Delete from Cloudinary if public ID exists (stored in url)
    // Note: We'd need to store publicId separately for this to work properly
    // For now, skip Cloudinary deletion for base64 URLs

    // Delete from database
    await db.delete(profileMedia).where(eq(profileMedia.id, mediaId));

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('[ProfileMedia] Delete error:', error);
    res.status(500).json({ message: 'Failed to delete media' });
  }
});

// ============================================================================
// PROFILE AVATAR & BACKGROUND ROUTES
// ============================================================================

/**
 * POST /api/profile/avatar
 * Upload/update profile avatar
 */
router.post('/avatar', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Validate it's an image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Avatar must be an image' });
    }

    // Upload to Cloudinary with specific transformations for avatars
    let url: string;
    
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `profiles/${req.userId}/avatar`,
            resource_type: 'image',
            transformation: [
              { width: 500, height: 500, crop: 'fill', gravity: 'face' },
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('Upload failed'));
            resolve(result);
          }
        );
        
        uploadStream.end(req.file!.buffer);
      });
      
      url = result.secure_url;
    } else {
      // Fallback to base64
      const base64 = req.file.buffer.toString('base64');
      url = `data:${req.file.mimetype};base64,${base64}`;
    }

    // Update user's profile image
    await db.update(users)
      .set({ profileImage: url })
      .where(eq(users.id, req.userId));

    res.json({ 
      message: 'Avatar updated successfully',
      url 
    });
  } catch (error) {
    console.error('[ProfileMedia] Avatar upload error:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

/**
 * POST /api/profile/background
 * Upload/update profile background/cover image
 */
router.post('/background', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Validate it's an image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Background must be an image' });
    }

    // Upload to Cloudinary with specific transformations for cover images
    let url: string;
    
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `profiles/${req.userId}/background`,
            resource_type: 'image',
            transformation: [
              { width: 1920, height: 600, crop: 'fill' },
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('Upload failed'));
            resolve(result);
          }
        );
        
        uploadStream.end(req.file!.buffer);
      });
      
      url = result.secure_url;
    } else {
      // Fallback to base64
      const base64 = req.file.buffer.toString('base64');
      url = `data:${req.file.mimetype};base64,${base64}`;
    }

    // Update user's background image
    await db.update(users)
      .set({ backgroundImage: url })
      .where(eq(users.id, req.userId));

    res.json({ 
      message: 'Background image updated successfully',
      url 
    });
  } catch (error) {
    console.error('[ProfileMedia] Background upload error:', error);
    res.status(500).json({ message: 'Failed to upload background image' });
  }
});

export default router;
