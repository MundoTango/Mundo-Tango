/**
 * MB.MD v9.9.4 - Comprehensive UI Test Runner (Memory Optimized)
 * Recycles browser between test sections to prevent memory exhaustion
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

const CHROMIUM_PATH = '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';
const BASE_URL = 'http://localhost:5000';
const TIMEOUT = 20000;

interface TestResult {
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
}

const results: TestResult[] = [];
let browser: Browser | null = null;
let page: Page | null = null;

async function startBrowser() {
  if (browser) {
    await browser.close().catch(() => {});
  }
  browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM_PATH,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--single-process'],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  page = await context.newPage();
  return page;
}

async function closeBrowser() {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
    page = null;
  }
}

async function goto(path: string) {
  if (!page) throw new Error('Browser not started');
  await page.goto(`${BASE_URL}${path}`, { timeout: TIMEOUT, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
}

async function login() {
  if (!page) throw new Error('Browser not started');
  await goto('/login');
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  await emailInput.waitFor({ timeout: 8000 });
  await emailInput.fill('admin@mundotango.life');
  await page.locator('input[type="password"]').first().fill('admin123');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2000);
  if (page.url().includes('/login')) throw new Error('Login failed');
}

async function runTest(category: string, name: string, testFn: () => Promise<void>) {
  const start = Date.now();
  try {
    await testFn();
    results.push({ name, category, status: 'pass', duration: Date.now() - start });
    console.log(`✅ [${category}] ${name} (${Date.now() - start}ms)`);
  } catch (error: any) {
    results.push({ name, category, status: 'fail', duration: Date.now() - start, error: error.message });
    console.log(`❌ [${category}] ${name}: ${error.message.substring(0, 60)}...`);
  }
}

function printSummary() {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 Test Results Summary\n');
  
  const categories = [...new Set(results.map(r => r.category))];
  for (const cat of categories) {
    const catResults = results.filter(r => r.category === cat);
    const passed = catResults.filter(r => r.status === 'pass').length;
    const failed = catResults.filter(r => r.status === 'fail').length;
    console.log(`   ${cat}: ${passed}/${catResults.length} passed ${failed > 0 ? '❌' : '✅'}`);
  }
  
  const totalPassed = results.filter(r => r.status === 'pass').length;
  const totalFailed = results.filter(r => r.status === 'fail').length;
  
  console.log('\n   ' + '─'.repeat(40));
  console.log(`   TOTAL: ${totalPassed} passed, ${totalFailed} failed out of ${results.length}`);
  console.log(`   Pass Rate: ${Math.round((totalPassed / results.length) * 100)}%`);
  
  if (totalFailed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`   - [${r.category}] ${r.name}: ${r.error?.substring(0, 60)}`);
    });
  }
  console.log('═'.repeat(60));
}

async function main() {
  console.log('\n🚀 MB.MD v9.9.4 - UI Test Runner (Memory Optimized)\n');
  console.log('═'.repeat(60));

  try {
    // ====== SECTION 1: Public Pages ======
    console.log('\n📌 Section 1: Public Pages\n');
    await startBrowser();
    
    await runTest('Public', 'Landing Page', async () => {
      await goto('/');
      const title = await page!.title();
      if (!title.toLowerCase().includes('tango')) throw new Error('Invalid title');
    });
    
    await runTest('Public', 'Login Page', async () => {
      await goto('/login');
      const emailExists = await page!.locator('input[type="email"]').count() > 0;
      if (!emailExists) throw new Error('No email input');
    });
    
    await runTest('Public', 'Register Page', async () => {
      await goto('/register');
    });
    
    await closeBrowser();

    // ====== SECTION 2: Core Social (with login) ======
    console.log('\n📌 Section 2: Core Social Features\n');
    await startBrowser();
    await login();
    
    await runTest('Social', 'Feed Page', async () => { await goto('/feed'); });
    await runTest('Social', 'Profile Page', async () => { await goto('/profile/2'); });
    await runTest('Social', 'Friends Page', async () => { await goto('/friends'); });
    
    await closeBrowser();

    // ====== SECTION 3: Communication ======
    console.log('\n📌 Section 3: Communication\n');
    await startBrowser();
    await login();
    
    await runTest('Comm', 'Messages', async () => { await goto('/messages'); });
    await runTest('Comm', 'Notifications', async () => { await goto('/notifications'); });
    
    await closeBrowser();

    // ====== SECTION 4: Events & Groups ======
    console.log('\n📌 Section 4: Events & Groups\n');
    await startBrowser();
    await login();
    
    await runTest('Events', 'Events Page', async () => { await goto('/events'); });
    await runTest('Events', 'Groups Page', async () => { await goto('/groups'); });
    await runTest('Events', 'Calendar', async () => { await goto('/calendar'); });
    await runTest('Events', 'Workshops', async () => { await goto('/workshops'); });
    
    await closeBrowser();

    // ====== SECTION 5: Commerce ======
    console.log('\n📌 Section 5: Commerce & Housing\n');
    await startBrowser();
    await login();
    
    await runTest('Commerce', 'Marketplace', async () => { await goto('/marketplace'); });
    await runTest('Commerce', 'Housing', async () => { await goto('/housing'); });
    
    await closeBrowser();

    // ====== SECTION 6: AI Tools ======
    console.log('\n📌 Section 6: AI & Tools\n');
    await startBrowser();
    await login();
    
    await runTest('AI', 'Mr Blue Chat', async () => { await goto('/mrblue/chat'); });
    await runTest('AI', 'Life CEO', async () => { await goto('/life-ceo'); });
    await runTest('AI', 'Travel Planner', async () => { await goto('/travel'); });
    
    await closeBrowser();

    // ====== SECTION 7: Discovery & Map ======
    console.log('\n📌 Section 7: Discovery\n');
    await startBrowser();
    await login();
    
    await runTest('Discovery', 'Community Map', async () => { await goto('/community-map'); });
    await runTest('Discovery', 'Discover', async () => { await goto('/discover'); });
    await runTest('Discovery', 'Music Library', async () => { await goto('/music-library'); });
    
    await closeBrowser();

    // ====== SECTION 8: Settings & Admin ======
    console.log('\n📌 Section 8: Settings & Admin\n');
    await startBrowser();
    await login();
    
    await runTest('Settings', 'Settings', async () => { await goto('/settings'); });
    await runTest('Admin', 'Admin Dashboard', async () => { await goto('/admin'); });
    
    await closeBrowser();

    printSummary();
    
    const failed = results.filter(r => r.status === 'fail').length;
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error: any) {
    console.error('Fatal error:', error.message);
    await closeBrowser();
    printSummary();
    process.exit(1);
  }
}

main();
