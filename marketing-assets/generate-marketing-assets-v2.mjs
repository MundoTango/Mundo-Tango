import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://mundotango.life';
const OUTPUT_DIR = path.join(__dirname, 'marketing-assets/screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureScreenshot(page, filename) {
  const filepath = path.join(OUTPUT_DIR, `${filename}.png`);
  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`✅ Captured: ${filename}.png`);
  return true;
}

async function generateAssets() {
  console.log('🚀 Starting marketing asset generation (v2 - improved)...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  let successCount = 0;
  let errorCount = 0;
  
  const pages = [
    { url: '/', name: 'memory-feed-home-desktop', desc: 'Memory Feed' },
    { url: '/events', name: 'events-discovery-map-view-desktop', desc: 'Events Discovery' },
    { url: '/housing', name: 'housing-marketplace-grid-desktop', desc: 'Housing Marketplace' },
    { url: '/tribes', name: 'tribes-directory-desktop', desc: 'Community Tribes' },
    { url: '/network', name: 'network-profile-desktop', desc: 'Professional Network' },
    { url: '/friends', name: 'friends-list-desktop', desc: 'Friends & Connections' }
  ];
  
  try {
    // Desktop captures
    for (const pageInfo of pages) {
      console.log(`\n📸 Capturing ${pageInfo.desc}...`);
      try {
        await page.goto(`${BASE_URL}${pageInfo.url}`, { 
          waitUntil: 'domcontentloaded',  // Changed from 'networkidle'
          timeout: 15000 
        });
        // Wait for page to render
        await page.waitForTimeout(3000);
        await captureScreenshot(page, pageInfo.name);
        successCount++;
      } catch (e) { 
        console.error(`❌ ${pageInfo.desc} failed:`, e.message); 
        errorCount++; 
      }
    }
    
    // Mobile captures
    console.log('\n📱 Switching to mobile viewport...');
    await page.setViewportSize({ width: 375, height: 812 });
    
    const mobilePages = [
      { url: '/', name: 'memory-feed-home-mobile', desc: 'Mobile - Memory Feed' },
      { url: '/events', name: 'events-discovery-mobile', desc: 'Mobile - Events' }
    ];
    
    for (const pageInfo of mobilePages) {
      console.log(`\n📸 Capturing ${pageInfo.desc}...`);
      try {
        await page.goto(`${BASE_URL}${pageInfo.url}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });
        await page.waitForTimeout(3000);
        await captureScreenshot(page, pageInfo.name);
        successCount++;
      } catch (e) { 
        console.error(`❌ ${pageInfo.desc} failed:`, e.message); 
        errorCount++; 
      }
    }
    
    console.log('\n✨ Screenshot generation complete!');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📁 Assets saved to: ${OUTPUT_DIR}`);
    
  } finally {
    await browser.close();
  }
}

generateAssets().catch(console.error);
