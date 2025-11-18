import { test, expect } from '@playwright/test';
import { nanoid } from 'nanoid';

test.describe('Full Onboarding Journey to Admin Integrations', () => {
  test('should complete registration → onboarding → access admin integrations wizard', async ({ page, context }) => {
    // Enable video recording
    test.setTimeout(120000); // 2 minutes for full journey
    
    // Generate unique user credentials
    const uniqueId = nanoid(6);
    const testEmail = `test-${uniqueId}@mundotango.com`;
    const testPassword = 'TestPassword123!';
    const testName = `Test User ${uniqueId}`;
    
    console.log('🎬 Starting E2E Test with user:', testEmail);

    // ===== REGISTRATION =====
    console.log('📝 Step 1: Registration');
    await page.goto('/register');
    await expect(page).toHaveURL('/register');
    
    // Fill registration form
    await page.getByTestId('input-name').fill(testName);
    await page.getByTestId('input-email').fill(testEmail);
    await page.getByTestId('input-password').fill(testPassword);
    
    // Accept legal agreement
    const legalCheckbox = page.getByTestId('checkbox-legal');
    if (await legalCheckbox.isVisible()) {
      await legalCheckbox.check();
    }
    
    // Submit registration
    await page.getByTestId('button-register').click();
    
    // Wait for redirect to onboarding
    await page.waitForURL(/\/onboarding/, { timeout: 10000 });
    console.log('✅ Registration successful, redirected to onboarding');

    // ===== ONBOARDING STEP 1: CITY SELECTION =====
    console.log('📍 Step 2: City Selection');
    
    // Check if already on step-1 or on welcome page
    const currentUrl = page.url();
    if (currentUrl.includes('/onboarding/welcome')) {
      // Click Get Started on welcome page
      const getStartedButton = page.getByTestId('button-get-started');
      if (await getStartedButton.isVisible()) {
        await getStartedButton.click();
        await page.waitForURL('/onboarding/step-1', { timeout: 5000 });
      }
    }
    
    // Ensure we're on city selection page
    await expect(page).toHaveURL('/onboarding/step-1');
    
    // Type city name to trigger autocomplete (using fixed Nominatim API)
    const cityInput = page.getByPlaceholder(/Search for your city/i);
    await cityInput.fill('Buenos Aires');
    
    // Wait for autocomplete suggestions
    await page.waitForTimeout(1000); // Debounce + API call
    
    // Look for suggestions dropdown
    const suggestionsList = page.locator('[role="listbox"], .suggestions, [data-testid*="suggestion"]').first();
    
    // Wait for suggestions to appear
    await expect(suggestionsList).toBeVisible({ timeout: 5000 });
    
    // Click the first suggestion
    const firstSuggestion = suggestionsList.locator('div, li, button').first();
    await firstSuggestion.click();
    
    console.log('✅ City selected from autocomplete');
    
    // Click Continue button
    const continueButton = page.getByTestId('button-continue');
    await continueButton.click();
    
    // Wait for navigation to step-2
    await page.waitForURL('/onboarding/step-2', { timeout: 5000 });
    console.log('✅ Navigated to Photo Upload page');

    // ===== ONBOARDING STEP 2: PHOTO UPLOAD (SKIP) =====
    console.log('📸 Step 3: Photo Upload (Skipping)');
    
    // Look for Skip button
    const skipButton = page.getByTestId('button-skip');
    if (await skipButton.isVisible({ timeout: 2000 })) {
      await skipButton.click();
    } else {
      // If no skip button, look for Continue/Next button
      const nextButton = page.getByTestId('button-continue').or(page.getByTestId('button-next'));
      if (await nextButton.isVisible({ timeout: 2000 })) {
        await nextButton.click();
      }
    }
    
    await page.waitForURL('/onboarding/step-3', { timeout: 5000 });
    console.log('✅ Navigated to Tango Roles page');

    // ===== ONBOARDING STEP 3: TANGO ROLES =====
    console.log('💃 Step 4: Tango Role Selection');
    
    // Select at least one role
    const leaderRole = page.getByTestId('role-leader').or(page.locator('text=Leader').first());
    if (await leaderRole.isVisible({ timeout: 2000 })) {
      await leaderRole.click();
    }
    
    // Click Continue
    const rolesContinueButton = page.getByTestId('button-continue');
    await rolesContinueButton.click();
    
    // Wait for either step-4 (guided tour) or completion redirect
    const urlAfterRoles = await page.waitForURL(/\/(onboarding\/step-4|feed|dashboard)/, { timeout: 10000 }).then(() => page.url()).catch(() => page.url());
    console.log('✅ Onboarding step 3 completed, current URL:', urlAfterRoles);

    // ===== ONBOARDING STEP 4: GUIDED TOUR (SKIP IF PRESENT) =====
    if (urlAfterRoles.includes('/onboarding/step-4')) {
      console.log('🎯 Step 5: Guided Tour (Skipping)');
      
      const tourSkipButton = page.getByTestId('button-skip').or(page.getByText('Skip Tour'));
      if (await tourSkipButton.isVisible({ timeout: 2000 })) {
        await tourSkipButton.click();
      }
      
      // Wait for completion
      await page.waitForURL(/\/(feed|dashboard)/, { timeout: 5000 });
    }

    console.log('✅ Onboarding completed!');

    // ===== NAVIGATE TO ADMIN INTEGRATIONS =====
    console.log('🔧 Step 6: Navigate to Admin Integrations');
    
    // Go directly to /admin/integrations
    await page.goto('/admin/integrations');
    
    // Wait for page load
    await expect(page).toHaveURL('/admin/integrations');
    
    // Verify Authorization Wizard is present
    await expect(page.locator('text=Authorization Wizard').or(page.locator('text=Platform Integrations'))).toBeVisible({ timeout: 5000 });
    
    // Verify all 4 platform cards are present
    const platformCards = [
      'Facebook Messenger',
      'Supabase OAuth',
      'GitHub OAuth',
      'Gmail API'
    ];
    
    for (const platform of platformCards) {
      const platformCard = page.locator(`text=${platform}`).first();
      await expect(platformCard).toBeVisible();
      console.log(`✅ ${platform} integration card found`);
    }

    console.log('🎉 SUCCESS! Full journey completed:');
    console.log('  ✓ Registration');
    console.log('  ✓ City Selection (with fixed autocomplete)');
    console.log('  ✓ Photo Upload (skipped)');
    console.log('  ✓ Tango Role Selection');
    console.log('  ✓ Admin Integrations Access');
    
    // Take final screenshot
    await page.screenshot({ path: 'tests/screenshots/admin-integrations-final.png', fullPage: true });
  });
});
