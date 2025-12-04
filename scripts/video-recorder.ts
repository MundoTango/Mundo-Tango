/**
 * Mundo Tango Video Recorder
 * Records customer journeys using Playwright's built-in recordVideo capability
 * 
 * MB.MD Pattern 41: Parallel Execution
 * MB.MD Pattern 38: E2E Testing Infrastructure
 * MB.MD Pattern 26: OSI - Using Playwright native video recording
 * 
 * Usage:
 *   npx tsx scripts/video-recorder.ts                    # Record all journeys
 *   npx tsx scripts/video-recorder.ts customer           # Record customer journeys only
 *   npx tsx scripts/video-recorder.ts --journey signup   # Record specific journey
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { 
  parseJourney, 
  parseAllJourneys, 
  JourneyDefinition, 
  JourneyStep,
  generateManifest,
  saveManifest,
  JourneyType
} from './journey-schema';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const JOURNEYS_DIR = path.join(process.cwd(), 'journeys');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'videos');
const TEMP_DIR = path.join(process.cwd(), '.video-temp');

interface RecordingResult {
  definition: JourneyDefinition;
  videoFile: string;
  thumbnailFile?: string;
  recordedAt: Date;
  success: boolean;
  error?: string;
}

async function executeStep(page: Page, step: JourneyStep): Promise<void> {
  console.log(`    → ${step.action}: ${step.description}`);
  
  switch (step.action) {
    case 'navigate':
      if (step.target) {
        await page.goto(`${BASE_URL}${step.target}`, { waitUntil: 'domcontentloaded' });
      }
      break;
      
    case 'click':
      if (step.target) {
        try {
          await page.waitForSelector(step.target, { timeout: 5000 });
          await page.click(step.target);
        } catch (err) {
          console.warn(`      ⚠️ Could not click: ${step.target}`);
        }
      }
      break;
      
    case 'type':
      if (step.target && step.value) {
        try {
          await page.waitForSelector(step.target, { timeout: 5000 });
          await page.fill(step.target, step.value);
        } catch (err) {
          console.warn(`      ⚠️ Could not type in: ${step.target}`);
        }
      }
      break;
      
    case 'scroll':
      const scrollAmount = step.value ? parseInt(step.value, 10) : 300;
      await page.evaluate((y) => window.scrollBy(0, y), scrollAmount);
      break;
      
    case 'hover':
      if (step.target) {
        try {
          await page.waitForSelector(step.target, { timeout: 5000 });
          await page.hover(step.target);
        } catch (err) {
          console.warn(`      ⚠️ Could not hover: ${step.target}`);
        }
      }
      break;
      
    case 'wait':
      break;
      
    case 'screenshot':
      break;
  }
  
  if (step.delay && step.delay > 0) {
    await page.waitForTimeout(step.delay);
  }
}

async function recordJourney(browser: Browser, journey: JourneyDefinition): Promise<RecordingResult> {
  console.log(`\n🎬 Recording: ${journey.name}`);
  console.log(`   Type: ${journey.type}`);
  console.log(`   Start: ${journey.startPath}`);
  
  const tempVideoDir = path.join(TEMP_DIR, journey.id);
  if (!fs.existsSync(tempVideoDir)) {
    fs.mkdirSync(tempVideoDir, { recursive: true });
  }
  
  let context: BrowserContext | null = null;
  
  try {
    context = await browser.newContext({
      viewport: journey.viewport,
      recordVideo: {
        dir: tempVideoDir,
        size: journey.viewport,
      },
    });
    
    const page = await context.newPage();
    
    console.log(`   📍 Navigating to ${journey.startPath}`);
    await page.goto(`${BASE_URL}${journey.startPath}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    
    await page.waitForTimeout(2000);
    
    for (const step of journey.steps) {
      await executeStep(page, step);
    }
    
    await page.waitForTimeout(1000);
    
    await page.close();
    await context.close();
    context = null;
    
    const tempFiles = fs.readdirSync(tempVideoDir);
    const webmFile = tempFiles.find(f => f.endsWith('.webm'));
    
    if (!webmFile) {
      throw new Error('No video file generated');
    }
    
    const tempVideoPath = path.join(tempVideoDir, webmFile);
    const outputSubDir = path.join(OUTPUT_DIR, journey.type);
    if (!fs.existsSync(outputSubDir)) {
      fs.mkdirSync(outputSubDir, { recursive: true });
    }
    
    let finalVideoPath: string;
    let thumbnailPath: string | undefined;
    
    if (journey.output.format === 'mp4') {
      finalVideoPath = path.join(outputSubDir, `${journey.id}.mp4`);
      
      try {
        console.log(`   🔄 Converting to MP4...`);
        execSync(`ffmpeg -y -i "${tempVideoPath}" -c:v libx264 -preset fast -crf 23 -c:a aac "${finalVideoPath}"`, {
          stdio: 'pipe',
        });
        
        if (journey.output.thumbnail) {
          thumbnailPath = path.join(outputSubDir, `${journey.id}-thumb.jpg`);
          execSync(`ffmpeg -y -i "${finalVideoPath}" -ss 00:00:01 -vframes 1 "${thumbnailPath}"`, {
            stdio: 'pipe',
          });
        }
      } catch (ffmpegErr) {
        console.log(`   ⚠️ FFmpeg not available, keeping WebM format`);
        finalVideoPath = path.join(outputSubDir, `${journey.id}.webm`);
        fs.copyFileSync(tempVideoPath, finalVideoPath);
      }
    } else {
      finalVideoPath = path.join(outputSubDir, `${journey.id}.webm`);
      fs.copyFileSync(tempVideoPath, finalVideoPath);
    }
    
    fs.rmSync(tempVideoDir, { recursive: true, force: true });
    
    console.log(`   ✅ Saved: ${path.relative(process.cwd(), finalVideoPath)}`);
    
    return {
      definition: journey,
      videoFile: path.relative(OUTPUT_DIR, finalVideoPath),
      thumbnailFile: thumbnailPath ? path.relative(OUTPUT_DIR, thumbnailPath) : undefined,
      recordedAt: new Date(),
      success: true,
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error}`);
    
    if (context) {
      await context.close();
    }
    
    if (fs.existsSync(tempVideoDir)) {
      fs.rmSync(tempVideoDir, { recursive: true, force: true });
    }
    
    return {
      definition: journey,
      videoFile: '',
      recordedAt: new Date(),
      success: false,
      error: String(error),
    };
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let journeyFilter: JourneyType | null = null;
  let specificJourney: string | null = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--journey' && args[i + 1]) {
      specificJourney = args[i + 1];
      i++;
    } else if (['customer', 'marketing', 'tour'].includes(args[i])) {
      journeyFilter = args[i] as JourneyType;
    }
  }
  
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  Mundo Tango Video Recorder                           ║');
  console.log('║  MB.MD Pattern 41: Parallel Execution                 ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log(`Journeys: ${JOURNEYS_DIR}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);
  
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
  
  let journeys: JourneyDefinition[];
  
  if (specificJourney) {
    const journeyFiles = [
      path.join(JOURNEYS_DIR, 'customer', `${specificJourney}.yaml`),
      path.join(JOURNEYS_DIR, 'marketing', `${specificJourney}.yaml`),
      path.join(JOURNEYS_DIR, 'tours', `${specificJourney}.yaml`),
    ];
    
    const foundFile = journeyFiles.find(f => fs.existsSync(f));
    if (!foundFile) {
      console.error(`Journey not found: ${specificJourney}`);
      process.exit(1);
    }
    
    journeys = [parseJourney(foundFile)];
  } else {
    journeys = parseAllJourneys(JOURNEYS_DIR);
    
    if (journeyFilter) {
      journeys = journeys.filter(j => j.type === journeyFilter);
    }
  }
  
  if (journeys.length === 0) {
    console.log('No journeys found to record.');
    console.log('\nCreate journey YAML files in:');
    console.log('  - journeys/customer/*.yaml');
    console.log('  - journeys/marketing/*.yaml');
    console.log('  - journeys/tours/*.yaml');
    process.exit(0);
  }
  
  console.log(`Found ${journeys.length} journey(s) to record:\n`);
  journeys.forEach(j => console.log(`  - ${j.name} (${j.type})`));
  
  const browser = await chromium.launch({ headless: true });
  const results: RecordingResult[] = [];
  
  try {
    for (const journey of journeys) {
      const result = await recordJourney(browser, journey);
      results.push(result);
    }
  } finally {
    await browser.close();
    
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }
  
  const successfulResults = results.filter(r => r.success);
  
  if (successfulResults.length > 0) {
    const manifest = generateManifest(successfulResults);
    const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
    saveManifest(manifest, manifestPath);
    console.log(`\n📋 Saved manifest: ${manifestPath}`);
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`✅ Recording complete!`);
  console.log(`   Successful: ${successfulResults.length}/${journeys.length}`);
  
  if (results.some(r => !r.success)) {
    console.log('\n❌ Failed recordings:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.definition.name}: ${r.error}`);
    });
  }
  
  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
