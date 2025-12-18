/**
 * Mundo Tango Video Recording Service
 * Server-side service for managing video recording and library
 * 
 * MB.MD Pattern 41: Parallel Execution
 * MB.MD Pattern 26: OSI - Using ffmpeg for video processing
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawn } from 'child_process';

export type JourneyType = 'customer' | 'marketing' | 'tour';

export interface VideoMetadata {
  id: string;
  name: string;
  description: string;
  type: JourneyType;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  recordedAt: string;
}

export interface VideoLibrary {
  videos: VideoMetadata[];
  totalCount: number;
  lastUpdated: string;
}

export interface RecordingRequest {
  journeyId: string;
  type?: JourneyType;
}

export interface RecordingResult {
  success: boolean;
  videoId?: string;
  videoUrl?: string;
  error?: string;
}

const VIDEOS_DIR = path.join(process.cwd(), 'public', 'videos');
const JOURNEYS_DIR = path.join(process.cwd(), 'journeys');
const MANIFEST_PATH = path.join(VIDEOS_DIR, 'manifest.json');

export class VideoRecordingService {
  
  async getVideoLibrary(type?: JourneyType): Promise<VideoLibrary> {
    const manifest = this.loadManifest();
    
    let videos = manifest.journeys.map(j => ({
      id: j.id,
      name: j.name,
      description: j.description,
      type: j.type,
      videoUrl: `/videos/${j.videoFile}`,
      thumbnailUrl: j.thumbnailFile ? `/videos/${j.thumbnailFile}` : undefined,
      duration: j.duration,
      recordedAt: j.recordedAt,
    }));
    
    if (type) {
      videos = videos.filter(v => v.type === type);
    }
    
    return {
      videos,
      totalCount: videos.length,
      lastUpdated: manifest.generatedAt,
    };
  }
  
  async getVideoById(id: string): Promise<VideoMetadata | null> {
    const library = await this.getVideoLibrary();
    return library.videos.find(v => v.id === id) || null;
  }
  
  async recordJourney(request: RecordingRequest): Promise<RecordingResult> {
    const { journeyId, type } = request;
    
    const searchDirs = type 
      ? [path.join(JOURNEYS_DIR, type)]
      : [
          path.join(JOURNEYS_DIR, 'customer'),
          path.join(JOURNEYS_DIR, 'marketing'),
          path.join(JOURNEYS_DIR, 'tours'),
        ];
    
    let journeyPath: string | null = null;
    for (const dir of searchDirs) {
      const potentialPath = path.join(dir, `${journeyId}.yaml`);
      if (fs.existsSync(potentialPath)) {
        journeyPath = potentialPath;
        break;
      }
    }
    
    if (!journeyPath) {
      return {
        success: false,
        error: `Journey not found: ${journeyId}`,
      };
    }
    
    try {
      const result = await this.executeRecording(journeyId);
      return result;
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }
  
  async recordAllJourneys(type?: JourneyType): Promise<RecordingResult[]> {
    const args = type ? [type] : [];
    
    try {
      execSync(`npx tsx scripts/video-recorder.ts ${args.join(' ')}`, {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
      
      const library = await this.getVideoLibrary(type);
      return library.videos.map(v => ({
        success: true,
        videoId: v.id,
        videoUrl: v.videoUrl,
      }));
    } catch (error) {
      return [{
        success: false,
        error: String(error),
      }];
    }
  }
  
  private async executeRecording(journeyId: string): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      const child = spawn('npx', ['tsx', 'scripts/video-recorder.ts', '--journey', journeyId], {
        cwd: process.cwd(),
        stdio: 'pipe',
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', async (code) => {
        if (code === 0) {
          const video = await this.getVideoById(journeyId);
          resolve({
            success: true,
            videoId: journeyId,
            videoUrl: video?.videoUrl,
          });
        } else {
          resolve({
            success: false,
            error: stderr || stdout || `Process exited with code ${code}`,
          });
        }
      });
      
      child.on('error', (err) => {
        reject(err);
      });
    });
  }
  
  private loadManifest(): { journeys: any[]; generatedAt: string } {
    if (!fs.existsSync(MANIFEST_PATH)) {
      return { journeys: [], generatedAt: new Date().toISOString() };
    }
    
    try {
      const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { journeys: [], generatedAt: new Date().toISOString() };
    }
  }
  
  async getAvailableJourneys(): Promise<Array<{ id: string; name: string; type: JourneyType; path: string }>> {
    const journeys: Array<{ id: string; name: string; type: JourneyType; path: string }> = [];
    
    const types: JourneyType[] = ['customer', 'marketing', 'tour'];
    
    for (const type of types) {
      const dir = path.join(JOURNEYS_DIR, type === 'tour' ? 'tours' : type);
      
      if (!fs.existsSync(dir)) continue;
      
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
      
      for (const file of files) {
        const id = path.basename(file, path.extname(file));
        journeys.push({
          id,
          name: id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          type,
          path: path.join(dir, file),
        });
      }
    }
    
    return journeys;
  }
  
  async convertWebmToMp4(inputPath: string, outputPath: string): Promise<boolean> {
    try {
      execSync(`ffmpeg -y -i "${inputPath}" -c:v libx264 -preset fast -crf 23 -c:a aac "${outputPath}"`, {
        stdio: 'pipe',
      });
      return true;
    } catch {
      return false;
    }
  }
  
  async generateThumbnail(videoPath: string, outputPath: string, timestamp = '00:00:01'): Promise<boolean> {
    try {
      execSync(`ffmpeg -y -i "${videoPath}" -ss ${timestamp} -vframes 1 "${outputPath}"`, {
        stdio: 'pipe',
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const videoRecordingService = new VideoRecordingService();
