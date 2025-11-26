import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { videoCompressionService } from '../services/videoCompression';
import { objectStorageService } from '../objectStorage';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Use workspace directory to avoid /tmp quota issues on Replit
const uploadDir = path.join(process.cwd(), '.uploads', 'videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB - accept ANY size, we compress server-side
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-m4v', 'video/3gpp', 'video/mpeg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid video type: ${file.mimetype}. Allowed: MP4, MOV, AVI, WebM, M4V`));
    }
  }
});

// NEW: Compress and upload to Object Storage (like Facebook/Instagram)
// Returns URL instead of base64
router.post('/compress', authenticateToken, upload.single('video'), async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No video file provided' });
  }

  const inputPath = req.file.path;
  const originalSizeMB = (req.file.size / (1024 * 1024)).toFixed(1);
  
  console.log(`[VideoUpload] Received video: ${req.file.originalname} (${originalSizeMB}MB)`);

  try {
    // Step 1: Compress video with FFmpeg
    const result = await videoCompressionService.compressVideo(inputPath, {
      maxWidth: 1920,
      maxHeight: 1080,
      targetBitrate: '3000k',
      crf: 23
    });

    if (!result.success || !result.outputPath) {
      fs.unlinkSync(inputPath);
      return res.status(500).json({ 
        success: false, 
        error: result.error || 'Compression failed'
      });
    }

    const compressedSizeMB = (result.compressedSize! / (1024 / 1024)).toFixed(1);
    console.log(`[VideoUpload] Compressed: ${originalSizeMB}MB → ${compressedSizeMB}MB`);

    // Step 2: Check if Object Storage is available
    if (objectStorageService.isConfigured()) {
      // Upload to Object Storage (like Facebook/Instagram)
      const filename = `video_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`;
      const uploadResult = await objectStorageService.uploadFile(result.outputPath, {
        filename,
        contentType: 'video/mp4',
        isPublic: true
      });

      if (uploadResult.success) {
        // Clean up temp files
        fs.unlinkSync(inputPath);
        videoCompressionService.cleanup(result.outputPath);

        const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[VideoUpload] Uploaded to Object Storage: ${uploadResult.publicUrl}`);

        // Return URL (not base64!) - like Facebook/Instagram
        return res.json({
          success: true,
          videoUrl: uploadResult.publicUrl, // URL to Object Storage
          objectPath: uploadResult.objectPath,
          thumbnail: result.thumbnail,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          duration: result.duration,
          width: result.width,
          height: result.height,
          processingTime: parseFloat(processingTime),
          storageType: 'object-storage' // Indicates this is a URL, not base64
        });
      } else {
        console.warn('[VideoUpload] Object Storage upload failed, falling back to base64');
      }
    }

    // Fallback: Convert to base64 if Object Storage not available
    console.log('[VideoUpload] Using base64 fallback (Object Storage not configured)');
    const base64Video = await videoCompressionService.convertToBase64(result.outputPath);
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

    fs.unlinkSync(inputPath);
    videoCompressionService.cleanup(result.outputPath);

    res.json({
      success: true,
      videoUrl: base64Video,
      thumbnail: result.thumbnail,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      duration: result.duration,
      width: result.width,
      height: result.height,
      processingTime: parseFloat(processingTime),
      storageType: 'base64' // Indicates this is base64
    });

  } catch (error: any) {
    console.error('[VideoUpload] Error:', error);
    
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Video processing failed'
    });
  }
});

// Get presigned URL for direct upload (alternative approach)
router.post('/get-upload-url', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { filename, contentType = 'video/mp4' } = req.body;
    
    if (!objectStorageService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Object Storage not configured'
      });
    }

    const result = await objectStorageService.getUploadURL({
      filename: filename || `video_${Date.now()}.mp4`,
      contentType,
      isPublic: true
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('[VideoUpload] Get upload URL error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Legacy upload endpoint (with optional compression)
router.post('/upload', authenticateToken, upload.single('video'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No video file provided' });
  }

  const inputPath = req.file.path;
  const skipCompression = req.body.skipCompression === 'true';
  
  try {
    let videoUrl: string;
    let thumbnail: string | undefined;
    let storageType = 'base64';

    if (skipCompression) {
      const buffer = fs.readFileSync(inputPath);
      videoUrl = `data:${req.file.mimetype};base64,${buffer.toString('base64')}`;
    } else {
      const result = await videoCompressionService.compressVideo(inputPath);
      if (!result.success || !result.outputPath) {
        throw new Error(result.error || 'Compression failed');
      }
      
      // Try Object Storage first
      if (objectStorageService.isConfigured()) {
        const filename = `video_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`;
        const uploadResult = await objectStorageService.uploadFile(result.outputPath, {
          filename,
          contentType: 'video/mp4',
          isPublic: true
        });

        if (uploadResult.success) {
          videoUrl = uploadResult.publicUrl;
          thumbnail = result.thumbnail;
          storageType = 'object-storage';
          videoCompressionService.cleanup(result.outputPath);
        } else {
          // Fallback to base64
          videoUrl = await videoCompressionService.convertToBase64(result.outputPath);
          thumbnail = result.thumbnail;
          videoCompressionService.cleanup(result.outputPath);
        }
      } else {
        videoUrl = await videoCompressionService.convertToBase64(result.outputPath);
        thumbnail = result.thumbnail;
        videoCompressionService.cleanup(result.outputPath);
      }
    }

    fs.unlinkSync(inputPath);

    res.json({
      success: true,
      videoUrl,
      thumbnail,
      storageType
    });
  } catch (error: any) {
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve videos from Object Storage
router.get('/serve/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const objectPath = `/${objectStorageService.getBucketName()}/public/videos/${filename}`;
    
    await objectStorageService.downloadToResponse(objectPath, res);
  } catch (error: any) {
    console.error('[VideoUpload] Serve error:', error);
    res.status(404).json({ error: 'Video not found' });
  }
});

router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'video-compression',
    objectStorageEnabled: objectStorageService.isConfigured(),
    maxFileSizeMB: 1024,
    supportedFormats: ['MP4', 'MOV', 'AVI', 'WebM', 'M4V', '3GP', 'MPEG'],
    outputSpecs: {
      maxResolution: '1920x1080',
      codec: 'H.264',
      audioBitrate: '128kbps',
      targetBitrate: '3Mbps'
    },
    architecture: 'Facebook/Instagram style - server-side compression with Object Storage'
  });
});

export default router;
