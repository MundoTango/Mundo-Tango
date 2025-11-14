import { Router, type Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { db } from "@shared/db";
import { housingListings } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================================================
// PHOTO UPLOAD
// ============================================================================

router.post("/photos", authenticateToken, upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    const listingId = parseInt(req.body.listingId);
    const userId = req.userId!;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    if (!listingId) {
      return res.status(400).json({ error: "Listing ID required" });
    }

    // Verify ownership
    const [listing] = await db
      .select()
      .from(housingListings)
      .where(and(
        eq(housingListings.id, listingId),
        eq(housingListings.hostId, userId)
      ))
      .limit(1);

    if (!listing) {
      return res.status(403).json({ error: "Not your listing" });
    }

    // Upload to Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "housing",
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto", fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    const existingPhotos = listing.photos as Array<{
      id: string;
      url: string;
      publicId: string;
      caption?: string;
      order: number;
      isCover: boolean;
    }> || [];

    const photo = {
      id: result.public_id,
      url: result.secure_url,
      publicId: result.public_id,
      order: existingPhotos.length,
      isCover: existingPhotos.length === 0, // First photo is cover
    };

    // Update database
    const updatedPhotos = [...existingPhotos, photo];
    await db
      .update(housingListings)
      .set({
        photos: updatedPhotos as any,
        coverPhotoUrl: photo.isCover ? photo.url : listing.coverPhotoUrl,
        updatedAt: new Date(),
      })
      .where(eq(housingListings.id, listingId));

    res.json(photo);
  } catch (error) {
    console.error("[Housing Photos] Upload error:", error);
    res.status(500).json({ error: "Failed to upload photo" });
  }
});

// ============================================================================
// REORDER PHOTOS
// ============================================================================

router.put("/:id/photos/reorder", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const listingId = parseInt(req.params.id);
    const { photos } = req.body;
    const userId = req.userId!;

    if (!Array.isArray(photos)) {
      return res.status(400).json({ error: "Photos must be an array" });
    }

    // Verify ownership
    const [listing] = await db
      .select()
      .from(housingListings)
      .where(and(
        eq(housingListings.id, listingId),
        eq(housingListings.hostId, userId)
      ))
      .limit(1);

    if (!listing) {
      return res.status(403).json({ error: "Not your listing" });
    }

    // Update database
    await db
      .update(housingListings)
      .set({
        photos: photos as any,
        updatedAt: new Date(),
      })
      .where(eq(housingListings.id, listingId));

    res.json({ success: true });
  } catch (error) {
    console.error("[Housing Photos] Reorder error:", error);
    res.status(500).json({ error: "Failed to reorder photos" });
  }
});

// ============================================================================
// SET COVER PHOTO
// ============================================================================

router.put("/:id/photos/:photoId/cover", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const listingId = parseInt(req.params.id);
    const photoId = req.params.photoId;
    const userId = req.userId!;

    // Verify ownership
    const [listing] = await db
      .select()
      .from(housingListings)
      .where(and(
        eq(housingListings.id, listingId),
        eq(housingListings.hostId, userId)
      ))
      .limit(1);

    if (!listing) {
      return res.status(403).json({ error: "Not your listing" });
    }

    const existingPhotos = listing.photos as Array<{
      id: string;
      url: string;
      publicId: string;
      caption?: string;
      order: number;
      isCover: boolean;
    }> || [];

    // Update isCover flags
    const updatedPhotos = existingPhotos.map(p => ({
      ...p,
      isCover: p.id === photoId,
    }));

    const coverPhoto = updatedPhotos.find(p => p.isCover);

    // Update database
    await db
      .update(housingListings)
      .set({
        photos: updatedPhotos as any,
        coverPhotoUrl: coverPhoto?.url || null,
        updatedAt: new Date(),
      })
      .where(eq(housingListings.id, listingId));

    res.json({ success: true });
  } catch (error) {
    console.error("[Housing Photos] Set cover error:", error);
    res.status(500).json({ error: "Failed to set cover photo" });
  }
});

// ============================================================================
// DELETE PHOTO
// ============================================================================

router.delete("/:id/photos/:photoId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const listingId = parseInt(req.params.id);
    const photoId = req.params.photoId;
    const userId = req.userId!;

    // Verify ownership
    const [listing] = await db
      .select()
      .from(housingListings)
      .where(and(
        eq(housingListings.id, listingId),
        eq(housingListings.hostId, userId)
      ))
      .limit(1);

    if (!listing) {
      return res.status(403).json({ error: "Not your listing" });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(photoId);
    } catch (cloudinaryError) {
      console.error("[Housing Photos] Cloudinary delete error:", cloudinaryError);
      // Continue even if Cloudinary delete fails
    }

    const existingPhotos = listing.photos as Array<{
      id: string;
      url: string;
      publicId: string;
      caption?: string;
      order: number;
      isCover: boolean;
    }> || [];

    // Remove photo from array and reindex order
    const updatedPhotos = existingPhotos
      .filter(p => p.id !== photoId)
      .map((p, index) => ({ ...p, order: index }));

    // If we deleted the cover photo, make the first photo the new cover
    if (listing.coverPhotoUrl && existingPhotos.find(p => p.id === photoId)?.isCover) {
      if (updatedPhotos.length > 0) {
        updatedPhotos[0].isCover = true;
      }
    }

    const newCoverUrl = updatedPhotos.find(p => p.isCover)?.url || null;

    // Update database
    await db
      .update(housingListings)
      .set({
        photos: updatedPhotos as any,
        coverPhotoUrl: newCoverUrl,
        updatedAt: new Date(),
      })
      .where(eq(housingListings.id, listingId));

    res.json({ success: true });
  } catch (error) {
    console.error("[Housing Photos] Delete error:", error);
    res.status(500).json({ error: "Failed to delete photo" });
  }
});

export default router;
