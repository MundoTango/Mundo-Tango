const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://e0001089-5956-480e-9ebc-7b1a6c2ec0e7-00-3cydblgjeyjzl.worf.replit.dev';
const OUTPUT_DIR = 'marketing-assets/screenshots';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureScreenshot(page, filename) {
  const filepath = path.join(OUTPUT_DIR, `${filename}.png`);
  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`✅ Captured: ${filename}.png`);
}

async function generateAssets() {
  console.log('🚀 Starting marketing asset generation...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Homepage/Memory Feed
    console.log('\n📸 Capturing Memory Feed...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'memory-feed-home-desktop');
    
    // Events Discovery
    console.log('\n📸 Capturing Events Discovery...');
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'events-discovery-map-view-desktop');
    
    // Housing Marketplace
    console.log('\n📸 Capturing Housing Marketplace...');
    await page.goto(`${BASE_URL}/housing`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'housing-marketplace-grid-desktop');
    
    // Community Tribes
    console.log('\n📸 Capturing Community Tribes...');
    await page.goto(`${BASE_URL}/tribes`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'tribes-directory-desktop');
    
    // Professional Network
    console.log('\n📸 Capturing Professional Network...');
    await page.goto(`${BASE_URL}/network`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'network-profile-desktop');
    
    // Friends & Connections
    console.log('\n📸 Capturing Friends & Connections...');
    await page.goto(`${BASE_URL}/friends`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'friends-list-desktop');
    
    // Mobile versions
    console.log('\n📱 Switching to mobile viewport...');
    await context.setViewportSize({ width: 375, height: 812 });
    
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'memory-feed-home-mobile');
    
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'events-discovery-mobile');
    
    console.log('\n✨ Screenshot generation complete!');
    console.log(`📁 Assets saved to: ${OUTPUT_DIR}`);
    
  } catch (error) {
    console.error('❌ Error generating assets:', error.message);
  } finally {
    await browser.close();
  }
}

generateAssets();
