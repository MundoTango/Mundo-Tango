/**
 * Mundo Tango Demo Recording Script
 * Uses Playwright to capture platform screenshots for demo assets
 * 
 * MB.MD Pattern 41: Parallel Execution
 * MB.MD Pattern 38: E2E Testing Infrastructure
 * 
 * Usage: npx tsx scripts/record-demo.ts
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'demos');

interface PageCapture {
  name: string;
  path: string;
  waitFor?: string;
  description: string;
}

const DEMO_PAGES: PageCapture[] = [
  {
    name: 'tango-map',
    path: '/community-map',
    waitFor: '[data-testid="community-map"]',
    description: 'Global Tango Map - Find dancers worldwide',
  },
  {
    name: 'events-discovery',
    path: '/events',
    waitFor: '[data-testid="events-page"]',
    description: 'Events Discovery - Milongas and festivals',
  },
  {
    name: 'mr-blue-chat',
    path: '/mr-blue',
    waitFor: '[data-testid="mr-blue-page"]',
    description: 'Mr Blue AI - Your tango companion',
  },
  {
    name: 'profile-view',
    path: '/profile/1',
    waitFor: '[data-testid="profile-page"]',
    description: 'Profile - Showcase your tango journey',
  },
];

async function capturePageScreenshot(
  browser: any, 
  page: PageCapture
): Promise<boolean> {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  try {
    const browserPage = await context.newPage();
    
    console.log(`Navigating to ${page.path}...`);
    await browserPage.goto(`${BASE_URL}${page.path}`, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    await browserPage.waitForTimeout(2000);
    
    if (page.waitFor) {
      try {
        await browserPage.waitForSelector(page.waitFor, { timeout: 5000 });
      } catch {
        console.log(`  Selector ${page.waitFor} not found, capturing anyway`);
      }
    }
    
    await browserPage.screenshot({
      path: path.join(OUTPUT_DIR, `${page.name}.png`),
      fullPage: false,
      type: 'png',
    });
    
    console.log(`  ✅ Saved ${page.name}.png`);
    return true;
  } catch (error) {
    console.log(`  ❌ Failed to capture ${page.name}: ${error}`);
    return false;
  } finally {
    await context.close();
  }
}

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Mundo Tango Demo Recording Script     ║');
  console.log('║  MB.MD Pattern 41: Parallel Capture    ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}\n`);
  }
  
  const browser = await chromium.launch({ headless: true });
  
  try {
    console.log('📸 Capturing Landing Page...');
    const landingContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    const landingPage = await landingContext.newPage();
    
    await landingPage.goto(`${BASE_URL}/landing`, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    await landingPage.waitForTimeout(3000);
    
    await landingPage.screenshot({
      path: path.join(OUTPUT_DIR, 'landing-page.png'),
      fullPage: false,
      type: 'png',
    });
    console.log('  ✅ Saved landing-page.png');
    
    try {
      const heroSection = await landingPage.$('[data-testid="section-hero"]');
      if (heroSection) {
        await heroSection.screenshot({
          path: path.join(OUTPUT_DIR, 'hero-section.png'),
          type: 'png',
        });
        console.log('  ✅ Saved hero-section.png');
      }
    } catch (e) {
      console.log('  Could not capture hero section');
    }
    
    await landingContext.close();
    
    console.log('\n📸 Capturing Feature Pages (Parallel)...');
    const results = await Promise.all(
      DEMO_PAGES.map(page => capturePageScreenshot(browser, page))
    );
    
    const successCount = results.filter(Boolean).length;
    console.log(`\n✅ Captured ${successCount}/${DEMO_PAGES.length} feature pages`);
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  Demo Recording Complete!              ║');
    console.log('╚════════════════════════════════════════╝');
    
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));
    console.log('\nGenerated assets:');
    files.forEach(f => console.log(`  📷 ${f}`));
    
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
