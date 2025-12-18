import { test, expect } from '@playwright/test';

test.describe('UnifiedLocationPicker - City Group Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page with the location picker
    await page.goto('http://localhost:5000/profile/admin');
    await page.waitForLoadState('networkidle');
  });

  test('should close dropdown immediately when city group is selected', async ({ page }) => {
    // Find the location input in ProfileTabAbout
    const locationInput = page.locator('input[data-testid="input-location-search"]').first();
    
    // Click to focus
    await locationInput.click();
    
    // Type city name
    await locationInput.fill('Buenos Aires');
    await page.waitForTimeout(200);
    
    // Wait for dropdown to appear
    const dropdown = page.locator('data-testid=location-results-dropdown');
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });
    
    // Verify dropdown is visible
    await expect(dropdown).toBeVisible();
    
    // Count initial result items
    const results = page.locator('button[data-testid^="location-result-"]');
    const initialCount = await results.count();
    console.log(`Found ${initialCount} location results`);
    
    // Verify we have at least one result (the city group)
    expect(initialCount).toBeGreaterThan(0);
    
    // Click on first result (should be the city group for Buenos Aires)
    await results.first().click();
    await page.waitForTimeout(300);
    
    // Dropdown should be closed
    await expect(dropdown).not.toBeVisible({ timeout: 2000 });
    
    // Verify the selection was made (input should show selected value)
    const selectedValue = await locationInput.inputValue();
    expect(selectedValue).toContain('Buenos Aires');
    
    // Give it a moment - if dropdown reopens, it will happen almost immediately
    await page.waitForTimeout(1000);
    
    // Verify dropdown did NOT reopen
    const dropdownVisible = await dropdown.isVisible().catch(() => false);
    expect(dropdownVisible).toBe(false);
  });

  test('should not show multiple selection prompts for the same city', async ({ page }) => {
    const locationInput = page.locator('input[data-testid="input-location-search"]').first();
    
    await locationInput.click();
    await locationInput.fill('Paris');
    await page.waitForTimeout(200);
    
    const dropdown = page.locator('data-testid=location-results-dropdown');
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });
    
    // Get the search results
    const results = page.locator('button[data-testid^="location-result-"]');
    const resultCount = await results.count();
    
    // With our consolidation logic, there should only be 1 result (the city group)
    // for a pure city query like "Paris"
    console.log(`Results for 'Paris': ${resultCount}`);
    expect(resultCount).toBeLessThanOrEqual(2); // Allow 1-2 results max
    
    // Select the first (city group) result
    await results.first().click();
    await page.waitForTimeout(500);
    
    // Dropdown should be closed
    await expect(dropdown).not.toBeVisible({ timeout: 2000 });
    
    // Wait to see if dropdown reopens multiple times
    for (let i = 0; i < 3; i++) {
      const isVisible = await dropdown.isVisible().catch(() => false);
      if (isVisible) {
        throw new Error(`Dropdown reopened after selection (attempt ${i + 1})`);
      }
      await page.waitForTimeout(300);
    }
  });

  test('city group result should have "dancers" badge', async ({ page }) => {
    const locationInput = page.locator('input[data-testid="input-location-search"]').first();
    
    await locationInput.click();
    await locationInput.fill('Melbourne');
    await page.waitForTimeout(200);
    
    const dropdown = page.locator('data-testid=location-results-dropdown');
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });
    
    // Look for badge with "dancers" text
    const dancersBadge = page.locator('text=/\\d+\\s+dancers/');
    
    // Should have at least one dancers badge
    const count = await dancersBadge.count();
    expect(count).toBeGreaterThan(0);
  });
});
