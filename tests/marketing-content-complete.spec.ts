cat > tests/record-flyover-video.spec.ts << 'EOF'
import { test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'https://e0001089-5956-480e-9ebc-7b1a6c2ec0e7-00-3cydblgjeyjzl.worf.replit.dev';
const VIDEOS_DIR = path.join(process.cwd(), 'marketing-assets/videos');

// Ensure video directory exists
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

test('Record Platform Flyover Video', async ({ browser }) => {
  console.log('🎬 Starting comprehensive platform flyover video');

  // Create context with video recording
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: VIDEOS_DIR,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  try {
    // Scene 1: Landing Page
    console.log('📍 Scene 1: Landing Page');
    await page.goto(`${BASE_URL}/landing`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1500);

    // Scene 2: Events Page
    console.log('📍 Scene 2: Events Discovery');
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1500);

    // Scene 3: Housing Marketplace
    console.log('📍 Scene 3: Housing Marketplace');
    await page.goto(`${BASE_URL}/housing`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1500);

    // Scene 4: Community Groups
    console.log('📍 Scene 4: Community Groups');
    await page.goto(`${BASE_URL}/groups`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1500);

    // Scene 5: Back to Landing
    console.log('📍 Scene 5: Closing on Landing');
    await page.goto(`${BASE_URL}/landing`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('✅ Flyover recording complete!');
  } catch (error) {
    console.error('❌ Error during flyover recording:', error);
  } finally {
    // Close context to save video
    await context.close();
    console.log(`💾 Flyover video saved to: ${VIDEOS_DIR}`);
  }
});
EOF
