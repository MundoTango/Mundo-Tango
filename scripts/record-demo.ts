/**
 * Mundo Tango Demo Recording Script
 * Uses Playwright to capture platform screenshots
 * 
 * MB.MD Pattern 41: Parallel Execution
 * 
 * Usage: npx tsx scripts/record-demo.ts
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'demos');

interface CaptureConfig {
  name: string;
  path: string;
  description: string;
}

const SCREENSHOTS: CaptureConfig[] = [
  {
    name: 'tango-map',
    path: '/landing',
    description: 'Landing Page - Global Tango Community',
  },
  {
    name: 'events-discovery',
    path: '/landing',
    description: 'Events Discovery',
  },
  {
    name: 'mr-blue-chat',
    path: '/landing',
    description: 'Mr Blue AI Chat Interface',
  },
  {
    name: 'profile-view',
    path: '/landing',
    description: 'Profile View',
  },
];

async function main(): Promise<void> {
  console.log('Mundo Tango Demo Recording Script');
  console.log('==================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
  
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    
    console.log('Navigating to landing page...');
    await page.goto(`${BASE_URL}/landing`, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    await page.waitForTimeout(3000);
    
    console.log('Capturing landing page screenshot...');
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'landing-page.png'),
      fullPage: false,
      type: 'png',
    });
    console.log('Saved landing-page.png');
    
    const sections = [
      { name: 'hero-section', selector: 'section:first-of-type' },
      { name: 'features-section', selector: '#features' },
      { name: 'pricing-section', selector: '#pricing' },
    ];
    
    for (const section of sections) {
      try {
        const element = await page.$(section.selector);
        if (element) {
          await element.screenshot({
            path: path.join(OUTPUT_DIR, `${section.name}.png`),
            type: 'png',
          });
          console.log(`Saved ${section.name}.png`);
        }
      } catch (e) {
        console.log(`Could not capture ${section.name}`);
      }
    }
    
    await context.close();
    
    console.log('\nDemo Recording Complete!');
    console.log('========================');
    
    const files = fs.readdirSync(OUTPUT_DIR);
    console.log('Generated files:');
    files.forEach(f => console.log(`  - ${f}`));
    
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
