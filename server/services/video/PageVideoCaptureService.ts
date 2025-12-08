/**
 * Page Video Capture Service
 * Records short demo videos of individual pages using Playwright
 * 
 * MB.MD Pattern 41: Parallel Execution
 * MB.MD Pattern 26: OSI - Using Playwright for video capture
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

export interface PageCaptureRequest {
  pageId: string;
  pageName: string;
  pagePath: string;
}

export interface PageCaptureResult {
  success: boolean;
  videoUrl?: string;
  screenshotUrl?: string;
  error?: string;
}

export interface PageVideo {
  id: string;
  pageId: string;
  pageName: string;
  pagePath: string;
  videoUrl: string;
  screenshotUrl?: string;
  capturedAt: string;
  duration?: string;
}

const VIDEOS_DIR = path.join(process.cwd(), 'public', 'videos', 'pages');
const SCREENSHOTS_DIR = path.join(process.cwd(), 'public', 'screenshots', 'pages');
const MANIFEST_PATH = path.join(VIDEOS_DIR, 'page-manifest.json');

export class PageVideoCaptureService {
  private captureQueue: PageCaptureRequest[] = [];
  private isCapturing = false;

  constructor() {
    if (!fs.existsSync(VIDEOS_DIR)) {
      fs.mkdirSync(VIDEOS_DIR, { recursive: true });
    }
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }
  }

  async queueCapture(request: PageCaptureRequest): Promise<{ queued: boolean; position: number }> {
    const existingIndex = this.captureQueue.findIndex(r => r.pageId === request.pageId);
    
    if (existingIndex >= 0) {
      return { queued: true, position: existingIndex + 1 };
    }
    
    this.captureQueue.push(request);
    const position = this.captureQueue.length;
    
    if (!this.isCapturing) {
      // Use setImmediate to ensure the queue processing starts in the next event loop tick
      setImmediate(() => {
        this.processQueue().catch(err => {
          console.error('[PageVideoCapture] Queue processing error:', err);
        });
      });
    }
    
    return { queued: true, position };
  }

  private async processQueue(): Promise<void> {
    if (this.isCapturing || this.captureQueue.length === 0) {
      console.log('[PageVideoCapture] Queue already processing or empty');
      return;
    }
    
    this.isCapturing = true;
    console.log(`[PageVideoCapture] Starting queue processing (${this.captureQueue.length} items)`);
    
    while (this.captureQueue.length > 0) {
      const request = this.captureQueue.shift()!;
      try {
        console.log(`[PageVideoCapture] Recording: ${request.pageName} (${request.pagePath})`);
        const result = await this.capturePageVideo(request);
        if (result.success) {
          console.log(`[PageVideoCapture] ✅ Successfully captured: ${request.pageName}`);
        } else {
          console.error(`[PageVideoCapture] ❌ Capture failed for ${request.pageName}: ${result.error}`);
        }
      } catch (error) {
        console.error(`[PageVideoCapture] ❌ Exception capturing ${request.pageId}:`, error);
      }
    }
    
    this.isCapturing = false;
    console.log('[PageVideoCapture] Queue processing complete');
  }

  private async capturePageVideo(request: PageCaptureRequest): Promise<PageCaptureResult> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), 'scripts', 'capture-page-video.ts');
      
      if (!fs.existsSync(scriptPath)) {
        this.createCaptureScript(scriptPath);
      }
      
      const child = spawn('npx', [
        'tsx', 
        scriptPath,
        '--pageId', request.pageId,
        '--pagePath', request.pagePath,
        '--pageName', request.pageName
      ], {
        cwd: process.cwd(),
        stdio: 'pipe',
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
        console.log(`[PageVideoCapture] ${data.toString().trim()}`);
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', async (code) => {
        if (code === 0) {
          const videoUrl = `/videos/pages/${request.pageId}.webm`;
          const screenshotUrl = `/screenshots/pages/${request.pageId}.png`;
          
          await this.updateManifest({
            id: `video-${request.pageId}`,
            pageId: request.pageId,
            pageName: request.pageName,
            pagePath: request.pagePath,
            videoUrl,
            screenshotUrl: fs.existsSync(path.join(SCREENSHOTS_DIR, `${request.pageId}.png`)) ? screenshotUrl : undefined,
            capturedAt: new Date().toISOString()
          });
          
          resolve({
            success: true,
            videoUrl,
            screenshotUrl
          });
        } else {
          resolve({
            success: false,
            error: stderr || stdout || `Process exited with code ${code}`
          });
        }
      });
      
      child.on('error', (err) => {
        reject(err);
      });
    });
  }

  private createCaptureScript(scriptPath: string): void {
    const scriptContent = `/**
 * Page Video Capture Script
 * Auto-generated by PageVideoCaptureService
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const pageId = args[args.indexOf('--pageId') + 1];
const pagePath = args[args.indexOf('--pagePath') + 1];
const pageName = args[args.indexOf('--pageName') + 1];

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const VIDEOS_DIR = path.join(process.cwd(), 'public', 'videos', 'pages');
const SCREENSHOTS_DIR = path.join(process.cwd(), 'public', 'screenshots', 'pages');
const TEMP_DIR = path.join(process.cwd(), '.video-temp', 'pages');

async function capturePage() {
  console.log(\`Capturing: \${pageName} at \${pagePath}\`);
  
  if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
  
  const tempVideoDir = path.join(TEMP_DIR, pageId);
  if (!fs.existsSync(tempVideoDir)) fs.mkdirSync(tempVideoDir, { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: {
        dir: tempVideoDir,
        size: { width: 1280, height: 720 }
      }
    });
    
    const page = await context.newPage();
    
    await page.goto(\`\${BASE_URL}\${pagePath}\`, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, \`\${pageId}.png\`),
      fullPage: false 
    });
    
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1500);
    
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1000);
    
    await page.close();
    await context.close();
    
    const tempFiles = fs.readdirSync(tempVideoDir);
    const webmFile = tempFiles.find(f => f.endsWith('.webm'));
    
    if (webmFile) {
      const tempVideoPath = path.join(tempVideoDir, webmFile);
      const finalVideoPath = path.join(VIDEOS_DIR, \`\${pageId}.webm\`);
      fs.copyFileSync(tempVideoPath, finalVideoPath);
      console.log(\`Video saved: \${finalVideoPath}\`);
    }
    
    fs.rmSync(tempVideoDir, { recursive: true, force: true });
    
    console.log('Capture complete');
    
  } finally {
    await browser.close();
  }
}

capturePage().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
`;
    
    fs.writeFileSync(scriptPath, scriptContent);
    console.log(`[PageVideoCapture] Created capture script: ${scriptPath}`);
  }

  private async updateManifest(video: PageVideo): Promise<void> {
    const manifest = this.loadManifest();
    
    const existingIndex = manifest.videos.findIndex(v => v.pageId === video.pageId);
    if (existingIndex >= 0) {
      manifest.videos[existingIndex] = video;
    } else {
      manifest.videos.push(video);
    }
    
    manifest.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  }

  private loadManifest(): { videos: PageVideo[]; lastUpdated: string } {
    if (!fs.existsSync(MANIFEST_PATH)) {
      return { videos: [], lastUpdated: new Date().toISOString() };
    }
    
    try {
      const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { videos: [], lastUpdated: new Date().toISOString() };
    }
  }

  async getPageVideos(): Promise<PageVideo[]> {
    return this.loadManifest().videos;
  }

  async getPageVideo(pageId: string): Promise<PageVideo | null> {
    const videos = await this.getPageVideos();
    return videos.find(v => v.pageId === pageId) || null;
  }

  getQueueStatus(): { isCapturing: boolean; queueLength: number; queue: PageCaptureRequest[] } {
    return {
      isCapturing: this.isCapturing,
      queueLength: this.captureQueue.length,
      queue: [...this.captureQueue]
    };
  }
}

export const pageVideoCaptureService = new PageVideoCaptureService();
