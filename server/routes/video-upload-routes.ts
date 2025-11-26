import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { videoCompressionService } from '../services/videoCompression';
import { requireAuth } from '../middleware/auth';

const router = Router();

const uploadDir = path.join(os.tmpdir(), 'mundo-tango-uploads');
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
    fileSize: 1024 * 1024 * 1024
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

router.post('/compress', requireAuth, upload.single('video'), async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No video file provided' });
  }

  const inputPath = req.file.path;
  const originalSizeMB = (req.file.size / (1024 * 1024)).toFixed(1);
  
  console.log(`[VideoUpload] Received video: ${req.file.originalname} (${originalSizeMB}MB)`);

  try {
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

    const base64Video = await videoCompressionService.convertToBase64(result.outputPath);
    const compressedSizeMB = (result.compressedSize! / (1024 * 1024)).toFixed(1);
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

    fs.unlinkSync(inputPath);
    videoCompressionService.cleanup(result.outputPath);

    console.log(`[VideoUpload] Complete: ${originalSizeMB}MB → ${compressedSizeMB}MB in ${processingTime}s`);

    res.json({
      success: true,
      videoUrl: base64Video,
      thumbnail: result.thumbnail,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      duration: result.duration,
      width: result.width,
      height: result.height,
      processingTime: parseFloat(processingTime)
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

router.post('/upload', requireAuth, upload.single('video'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No video file provided' });
  }

  const inputPath = req.file.path;
  const skipCompression = req.body.skipCompression === 'true';
  
  try {
    let videoUrl: string;
    let thumbnail: string | undefined;

    if (skipCompression) {
      const buffer = fs.readFileSync(inputPath);
      videoUrl = `data:${req.file.mimetype};base64,${buffer.toString('base64')}`;
    } else {
      const result = await videoCompressionService.compressVideo(inputPath);
      if (!result.success || !result.outputPath) {
        throw new Error(result.error || 'Compression failed');
      }
      videoUrl = await videoCompressionService.convertToBase64(result.outputPath);
      thumbnail = result.thumbnail;
      videoCompressionService.cleanup(result.outputPath);
    }

    fs.unlinkSync(inputPath);

    res.json({
      success: true,
      videoUrl,
      thumbnail
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

router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'video-compression',
    maxFileSizeMB: 1024,
    supportedFormats: ['MP4', 'MOV', 'AVI', 'WebM', 'M4V', '3GP', 'MPEG'],
    outputSpecs: {
      maxResolution: '1920x1080',
      codec: 'H.264',
      audioBitrate: '128kbps',
      targetBitrate: '3Mbps'
    }
  });
});

export default router;
