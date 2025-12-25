import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'https://mundotango.life';
const OUTPUT_DIR = path.join(__dirname, 'marketing-assets/screenshots');

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
  
  let successCount = 0;
  let errorCount = 0;
  
  try {
    console.log('\n📸 Capturing Memory Feed...');
    try {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await captureScreenshot(page, 'memory-feed-home-desktop');
      successCount++;
    } catch (e) { console.error('❌ Memory Feed failed:', e.message); errorCount++; }
    
    console.log('\n📸 Capturing Events Discovery...');
    try {
      await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await captureScreenshot(page, 'events-discovery-map-view-desktop');
      successCount++;
    } catch (e) { console.error('❌ Events failed:', e.message); errorCount++; }
    
    console.log('\n📸 Capturing Housing Marketplace...');
    try {
      await page.goto(`${BASE_URL}/housing`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await captureScreenshot(page, 'housing-marketplace-grid-desktop');
      successCount++;
    } catch (e) { console.error('❌ Housing failed:', e.message); errorCount++; }
    
    console.log('\n📸 Capturing Community Tribes...');
    try {
      await page.goto(`${BASE_URL}/tribes`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await captureScreenshot(page, 'tribes-directory-desktop');
      successCount++;
    } catch (e) { console.error('❌ Tribes failed:', e.message); errorCount++; }
    
    console.log('\n📸 Capturing Professional Network...');
    try {
      await page.goto(`${BASE_URL}/network`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await captureScreenshot(page, 'network-profile-desktop');
      successCount++;
    } catch (e) { console.error('❌ Network failed:', e.message); errorCount++; }
    
    console.log('\n📸 Capturing Friends & Connections...');
    try {
      await page.goto(`${BASE_URL}/friends`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await captureScreenshot(page, 'friends-list-desktop');
      successCount++;
    } catch (e) { console.error('❌ Friends failed:', e.message); errorCount++; }
    
    console.log('\n📱 Switching to mobile viewport...');
    await page.setViewportSize({ width: 375, height: 812 });
    
    console.log('\n📸 Capturing Mobile - Memory Feed...');
    try {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await captureScreenshot(page, 'memory-feed-home-mobile');
      successCount++;
    } catch (e) { console.error('❌ Mobile Memory Feed failed:', e.message); errorCount++; }
    
    console.log('\n📸 Capturing Mobile - Events...');
    try {
      await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await captureScreenshot(page, 'events-discovery-mobile');
      successCount++;
    } catch (e) { console.error('❌ Mobile Events failed:', e.message); errorCount++; }
    
    console.log('\n✨ Screenshot generation complete!');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📁 Assets saved to: ${OUTPUT_DIR}`);
    
  } finally {
    await browser.close();
  }
}

generateAssets().catch(console.error);
