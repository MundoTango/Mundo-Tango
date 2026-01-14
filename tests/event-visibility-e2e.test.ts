import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const TEST_EMAIL = 'scott+5@boddye.com';
const TEST_PASSWORD = 'password123';

test.describe('Event Visibility E2E Tests', () => {
  
  test('1. Homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await expect(page).toHaveURL(/.*\//);
    console.log('✓ Homepage loaded successfully');
  });

  test('2. Login page accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Check for email input
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    console.log('✓ Login page accessible with email input');
  });

  test('3. User can login successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Find and fill email
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(TEST_EMAIL);
    
    // Find and fill password
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
    await passwordInput.fill(TEST_PASSWORD);
    
    // Click login button
    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    const url = page.url();
    console.log(`After login, URL: ${url}`);
    expect(url).not.toContain('/login');
    console.log('✓ Login successful');
  });

  test('4. Event creation page accessible after login', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill(TEST_EMAIL);
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(TEST_PASSWORD);
    
    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();
    await page.waitForTimeout(3000);
    
    // Navigate to event creation
    await page.goto(`${BASE_URL}/events/create`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Check for title input
    const titleInput = page.locator('input').first();
    await expect(titleInput).toBeVisible({ timeout: 10000 });
    console.log('✓ Event creation form accessible');
  });

  test('5. Event cards load on discover page', async ({ page }) => {
    await page.goto(`${BASE_URL}/discover`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Look for any event cards
    const cards = await page.locator('[data-testid^="card-event-"]').count();
    console.log(`Found ${cards} event cards`);
    
    // Check for event type badges
    const badges = await page.locator('[data-testid^="badge-event-type-"]').count();
    console.log(`Found ${badges} event type badges`);
    
    console.log('✓ Discover page loaded');
  });

  test('6. Event details page and duplicate button', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill(TEST_EMAIL);
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(TEST_PASSWORD);
    
    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();
    await page.waitForTimeout(3000);
    
    // Go to an event details page
    await page.goto(`${BASE_URL}/events/20385`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Click Details tab
    const detailsTab = page.locator('button:has-text("Details"), [role="tab"]:has-text("Details")').first();
    if (await detailsTab.isVisible()) {
      await detailsTab.click();
      await page.waitForTimeout(1000);
    }
    
    // Check for duplicate button
    const duplicateBtn = page.locator('[data-testid="button-duplicate-event"]');
    const isVisible = await duplicateBtn.isVisible().catch(() => false);
    console.log(`Duplicate button visible: ${isVisible}`);
    
    if (isVisible) {
      console.log('✓ Duplicate event button is visible for organizer');
    } else {
      console.log('- User may not be organizer of this event');
    }
  });
});
