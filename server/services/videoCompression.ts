import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

export interface VideoCompressionResult {
  success: boolean;
  outputPath?: string;
  originalSize: number;
  compressedSize?: number;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: string;
  error?: string;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  bitrate: number;
  codec: string;
}

class VideoCompressionService {
  private tempDir: string;

  constructor() {
    // Use workspace directory to avoid /tmp quota issues on Replit
    this.tempDir = path.join(process.cwd(), '.uploads', 'videos', 'processing');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    console.log('[VideoCompression] Service initialized, temp dir:', this.tempDir);
  }

  async getVideoMetadata(inputPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          bitrate: parseInt(String(metadata.format.bit_rate || 0)),
          codec: videoStream.codec_name || 'unknown'
        });
      });
    });
  }

  async compressVideo(
    inputPath: string,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      targetBitrate?: string;
      crf?: number;
    } = {}
  ): Promise<VideoCompressionResult> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      targetBitrate = '3000k',
      crf = 23
    } = options;

    const originalSize = fs.statSync(inputPath).size;
    const outputFilename = `compressed_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`;
    const outputPath = path.join(this.tempDir, outputFilename);
    const thumbnailPath = path.join(this.tempDir, `thumb_${Date.now()}.jpg`);

    console.log(`[VideoCompression] Starting compression: ${(originalSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`[VideoCompression] Input: ${inputPath}`);
    console.log(`[VideoCompression] Output: ${outputPath}`);

    try {
      const metadata = await this.getVideoMetadata(inputPath);
      console.log(`[VideoCompression] Input metadata:`, metadata);

      await this.runCompression(inputPath, outputPath, {
        maxWidth,
        maxHeight,
        targetBitrate,
        crf,
        originalWidth: metadata.width,
        originalHeight: metadata.height
      });

      await this.generateThumbnail(inputPath, thumbnailPath);
      
      const compressedSize = fs.statSync(outputPath).size;
      const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
      
      console.log(`[VideoCompression] Complete! ${(compressedSize / 1024 / 1024).toFixed(1)}MB (${compressionRatio}% reduction)`);

      let thumbnailBase64 = '';
      if (fs.existsSync(thumbnailPath)) {
        const thumbnailBuffer = fs.readFileSync(thumbnailPath);
        thumbnailBase64 = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
        fs.unlinkSync(thumbnailPath);
      }

      return {
        success: true,
        outputPath,
        originalSize,
        compressedSize,
        duration: metadata.duration,
        width: Math.min(metadata.width, maxWidth),
        height: Math.min(metadata.height, maxHeight),
        thumbnail: thumbnailBase64
      };
    } catch (error: any) {
      console.error('[VideoCompression] Error:', error.message);
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      return {
        success: false,
        originalSize,
        error: error.message
      };
    }
  }

  private runCompression(
    inputPath: string,
    outputPath: string,
    options: {
      maxWidth: number;
      maxHeight: number;
      targetBitrate: string;
      crf: number;
      originalWidth: number;
      originalHeight: number;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let scaleFilter = '';
      
      if (options.originalWidth > options.maxWidth || options.originalHeight > options.maxHeight) {
        scaleFilter = `scale='min(${options.maxWidth},iw)':min'(${options.maxHeight},ih)':force_original_aspect_ratio=decrease`;
      }

      const command = ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioBitrate('128k')
        .audioFrequency(48000)
        .outputOptions([
          `-crf ${options.crf}`,
          '-preset fast',
          '-profile:v high',
          '-level 4.2',
          `-maxrate ${options.targetBitrate}`,
          `-bufsize ${parseInt(options.targetBitrate) * 2}k`,
          '-movflags +faststart',
          '-pix_fmt yuv420p'
        ]);

      if (scaleFilter) {
        command.videoFilter(scaleFilter);
      }

      command
        .on('start', (cmd) => {
          console.log('[VideoCompression] FFmpeg command:', cmd.substring(0, 200) + '...');
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`[VideoCompression] Progress: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', () => {
          console.log('[VideoCompression] FFmpeg finished');
          resolve();
        })
        .on('error', (err) => {
          console.error('[VideoCompression] FFmpeg error:', err.message);
          reject(err);
        })
        .save(outputPath);
    });
  }

  private generateThumbnail(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          count: 1,
          folder: path.dirname(outputPath),
          filename: path.basename(outputPath),
          size: '640x360'
        })
        .on('end', () => resolve())
        .on('error', (err) => {
          console.warn('[VideoCompression] Thumbnail generation failed:', err.message);
          resolve();
        });
    });
  }

  async convertToBase64(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    const mimeType = 'video/mp4';
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  }

  cleanup(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('[VideoCompression] Cleaned up:', filePath);
      }
    } catch (error) {
      console.warn('[VideoCompression] Cleanup failed:', error);
    }
  }

  cleanupTempDir(): void {
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const maxAge = 1000 * 60 * 30;

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          console.log('[VideoCompression] Cleaned old file:', file);
        }
      }
    } catch (error) {
      console.warn('[VideoCompression] Temp cleanup failed:', error);
    }
  }
}

export const videoCompressionService = new VideoCompressionService();
