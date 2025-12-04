/**
 * Mundo Tango Customer Journey Recording Script
 * Records actual user journeys through the platform for demo videos
 * 
 * MB.MD Pattern 41: Parallel Execution
 * MB.MD Pattern 38: E2E Testing Infrastructure
 * 
 * Usage: npx tsx scripts/record-customer-journeys.ts
 */

import { chromium, Page, Browser } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'demos', 'journeys');

interface JourneyStep {
  action: string;
  description: string;
  waitFor?: string;
  click?: string;
  scroll?: number;
  delay?: number;
}

interface CustomerJourney {
  id: string;
  name: string;
  description: string;
  startPath: string;
  steps: JourneyStep[];
}

const CUSTOMER_JOURNEYS: CustomerJourney[] = [
  {
    id: 'tango-map',
    name: 'Global Tango Map',
    description: 'Explore dancers and events worldwide',
    startPath: '/community-map',
    steps: [
      { action: 'navigate', description: 'Loading the community map', delay: 2000 },
      { action: 'screenshot', description: 'View global tango map with city markers' },
      { action: 'wait', description: 'Exploring map controls', delay: 1000 },
      { action: 'screenshot', description: 'Interactive map with dancer locations' },
    ]
  },
  {
    id: 'events',
    name: 'Event Discovery',
    description: 'Find milongas and festivals near you',
    startPath: '/events',
    steps: [
      { action: 'navigate', description: 'Loading events page', delay: 2000 },
      { action: 'screenshot', description: 'Browse upcoming tango events' },
      { action: 'wait', description: 'Viewing event listings', delay: 1000 },
      { action: 'screenshot', description: 'Event cards with details and RSVP' },
    ]
  },
  {
    id: 'mr-blue',
    name: 'Mr. Blue AI',
    description: 'Your personal tango companion',
    startPath: '/mr-blue',
    steps: [
      { action: 'navigate', description: 'Opening Mr. Blue chat', delay: 2000 },
      { action: 'screenshot', description: 'Meet Mr. Blue AI assistant' },
      { action: 'wait', description: 'AI ready to help', delay: 1000 },
      { action: 'screenshot', description: 'Chat interface with suggestions' },
    ]
  },
  {
    id: 'profile',
    name: 'Your Profile',
    description: 'Showcase your tango journey',
    startPath: '/feed',
    steps: [
      { action: 'navigate', description: 'Loading your dashboard', delay: 2000 },
      { action: 'screenshot', description: 'Your personalized feed' },
      { action: 'wait', description: 'Viewing profile features', delay: 1000 },
      { action: 'screenshot', description: 'Social features and connections' },
    ]
  }
];

async function captureJourneyScreenshot(
  page: Page,
  journeyId: string,
  stepIndex: number,
  description: string
): Promise<string> {
  const filename = `${journeyId}-step-${stepIndex.toString().padStart(2, '0')}.png`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  await page.screenshot({
    path: filepath,
    fullPage: false,
    type: 'png',
  });
  
  console.log(`    📸 ${filename}: ${description}`);
  return filename;
}

async function recordJourney(browser: Browser, journey: CustomerJourney): Promise<string[]> {
  console.log(`\n🎬 Recording: ${journey.name}`);
  console.log(`   ${journey.description}`);
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
  });
  
  const screenshots: string[] = [];
  
  try {
    const page = await context.newPage();
    
    console.log(`   📍 Navigating to ${journey.startPath}`);
    await page.goto(`${BASE_URL}${journey.startPath}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    
    let screenshotIndex = 0;
    
    for (const step of journey.steps) {
      switch (step.action) {
        case 'navigate':
          if (step.delay) {
            await page.waitForTimeout(step.delay);
          }
          break;
          
        case 'screenshot':
          screenshotIndex++;
          const filename = await captureJourneyScreenshot(
            page,
            journey.id,
            screenshotIndex,
            step.description
          );
          screenshots.push(filename);
          break;
          
        case 'click':
          if (step.click) {
            try {
              await page.click(step.click, { timeout: 3000 });
            } catch {
              console.log(`    ⚠️ Could not click: ${step.click}`);
            }
          }
          break;
          
        case 'scroll':
          if (step.scroll) {
            await page.evaluate((scrollY) => {
              window.scrollBy(0, scrollY);
            }, step.scroll);
          }
          break;
          
        case 'wait':
          if (step.delay) {
            await page.waitForTimeout(step.delay);
          }
          break;
      }
    }
    
    console.log(`   ✅ Captured ${screenshots.length} screenshots`);
    return screenshots;
    
  } catch (error) {
    console.log(`   ❌ Error recording journey: ${error}`);
    return screenshots;
  } finally {
    await context.close();
  }
}

interface JourneyManifest {
  journeys: {
    id: string;
    name: string;
    description: string;
    screenshots: string[];
  }[];
  generatedAt: string;
}

async function main(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║  Mundo Tango Customer Journey Recording       ║');
  console.log('║  Capturing real platform demos                ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
  
  const browser = await chromium.launch({ headless: true });
  
  const manifest: JourneyManifest = {
    journeys: [],
    generatedAt: new Date().toISOString(),
  };
  
  try {
    for (const journey of CUSTOMER_JOURNEYS) {
      const screenshots = await recordJourney(browser, journey);
      manifest.journeys.push({
        id: journey.id,
        name: journey.name,
        description: journey.description,
        screenshots,
      });
    }
    
    const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\n📋 Saved manifest: ${manifestPath}`);
    
    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ Customer journey recording complete!');
    console.log(`   Total journeys: ${manifest.journeys.length}`);
    console.log(`   Total screenshots: ${manifest.journeys.reduce((sum, j) => sum + j.screenshots.length, 0)}`);
    console.log('═══════════════════════════════════════════════\n');
    
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
