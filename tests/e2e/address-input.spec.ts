import { test, expect } from '@playwright/test';

test.describe('Address Input - Full Address Support', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'admin@mundotango.life');
    await page.fill('[data-testid="input-password"]', 'admin123');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('**/feed**', { timeout: 10000 });
  });

  test('should accept full address in housing form', async ({ page }) => {
    const fullAddress = 'Av. Córdoba 5443, C1414 Cdad. Autónoma de Buenos Aires, Argentina';
    
    // Navigate to housing creation page
    await page.goto('/housing/new');
    await page.waitForLoadState('networkidle');
    
    // Find the address input field
    const addressInput = page.locator('[data-testid="input-location-search"]');
    await expect(addressInput).toBeVisible({ timeout: 10000 });
    
    // Type the full address - should NOT be truncated
    await addressInput.fill(fullAddress);
    
    // Verify the full address is in the input (not truncated)
    const inputValue = await addressInput.inputValue();
    expect(inputValue).toBe(fullAddress);
    expect(inputValue.length).toBe(fullAddress.length);
    
    // Wait for search results or loading to complete
    await page.waitForTimeout(2000);
    
    // Check that no CSRF error occurred (would show as toast/error)
    const csrfError = page.locator('text=CSRF');
    await expect(csrfError).not.toBeVisible();
    
    // The dropdown should appear (even if empty, it means the API call succeeded)
    // Or the loading spinner should have finished
    const loadingSpinner = page.locator('.animate-spin');
    await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });
    
    console.log('✅ Full address accepted without truncation');
    console.log(`   Address length: ${inputValue.length} characters`);
  });

  test('should make POST request for address mode search', async ({ page }) => {
    const fullAddress = 'Av. Córdoba 5443, C1414 Cdad. Autónoma de Buenos Aires, Argentina';
    
    // Navigate to housing creation page
    await page.goto('/housing/new');
    await page.waitForLoadState('networkidle');
    
    // Set up request interception to verify POST is used
    let postRequestMade = false;
    let requestBody = '';
    
    page.on('request', (request) => {
      if (request.url().includes('/api/locations/search') && request.method() === 'POST') {
        postRequestMade = true;
        requestBody = request.postData() || '';
        console.log('✅ POST request detected:', request.url());
        console.log('   Request body:', requestBody);
      }
    });
    
    // Find and fill the address input
    const addressInput = page.locator('[data-testid="input-location-search"]');
    await expect(addressInput).toBeVisible({ timeout: 10000 });
    await addressInput.fill(fullAddress);
    
    // Wait for the API call
    await page.waitForTimeout(2000);
    
    // Verify POST request was made (not GET)
    expect(postRequestMade).toBe(true);
    expect(requestBody).toContain(fullAddress.substring(0, 20)); // Check partial match due to encoding
    
    console.log('✅ Address search uses POST method correctly');
  });

  test('should handle special characters in address', async ({ page }) => {
    const specialAddress = 'Calle Núñez 123, São Paulo, España';
    
    await page.goto('/housing/new');
    await page.waitForLoadState('networkidle');
    
    const addressInput = page.locator('[data-testid="input-location-search"]');
    await expect(addressInput).toBeVisible({ timeout: 10000 });
    
    await addressInput.fill(specialAddress);
    
    const inputValue = await addressInput.inputValue();
    expect(inputValue).toBe(specialAddress);
    
    // Wait for search
    await page.waitForTimeout(2000);
    
    // No errors should occur
    const errorToast = page.locator('[role="alert"]');
    const hasError = await errorToast.count();
    expect(hasError).toBe(0);
    
    console.log('✅ Special characters handled correctly');
  });
});
