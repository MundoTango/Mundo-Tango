/**
 * USER ONBOARDING TEST
 * Tests complete first-time user onboarding flow
 */

import { test, expect } from '@playwright/test';

test.describe('Onboarding - User Flow', () => {
  test('should view welcome screen', async ({ page }) => {
    await page.goto('/welcome');
    await expect(page.getByTestId('welcome-container')).toBeVisible();
  });

  test('should complete profile setup wizard', async ({ page }) => {
    await page.goto('/welcome');
    
    // Step 1: Welcome
    await page.getByTestId('button-get-started').click();
    
    // Step 2: Profile Info
    await expect(page.getByTestId('step-profile-info')).toBeVisible();
    await page.getByTestId('input-display-name').fill('Carlos Tango');
    await page.getByTestId('input-city').fill('Buenos Aires');
    await page.getByTestId('button-next').click();
    
    // Step 3: Dance Experience
    await expect(page.getByTestId('step-dance-experience')).toBeVisible();
    await page.getByTestId('select-experience-level').click();
    await page.getByTestId('option-intermediate').click();
    await page.getByTestId('button-next').click();
    
    // Step 4: Interests
    await expect(page.getByTestId('step-interests')).toBeVisible();
    await page.getByTestId('checkbox-milongas').click();
    await page.getByTestId('checkbox-workshops').click();
    await page.getByTestId('button-next').click();
    
    // Step 5: Complete
    await expect(page.getByTestId('step-complete')).toBeVisible();
    await page.getByTestId('button-finish-onboarding').click();
    
    // Should redirect to feed
    await expect(page).toHaveURL(/\/feed/);
  });

  test('should skip onboarding', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByTestId('button-skip').click();
    await expect(page).toHaveURL(/\/feed/);
  });

  test('should take guided tour', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByTestId('button-take-tour').click();
    await expect(page.getByTestId('tour-overlay')).toBeVisible();
  });
});
