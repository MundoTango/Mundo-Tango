import { test, expect } from '@playwright/test';

test('onboarding location change and auto-join city group', async ({ page }) => {
  await page.goto('/');
  
  const getStartedBtn = page.locator('[data-testid="button-join-free"]');
  await expect(getStartedBtn).toBeVisible();
  await getStartedBtn.click();
  
  await expect(page).toHaveURL(/.*register/);
  
  const timestamp = Date.now();
  const username = `user${timestamp}`;
  const email = `test${timestamp}@example.com`;
  
  await page.fill('[data-testid="input-name"]', 'Test User');
  await page.fill('[data-testid="input-username"]', username);
  await page.fill('[data-testid="input-email"]', email);
  await page.fill('[data-testid="input-password"]', 'Password123!');
  await page.fill('[data-testid="input-confirm-password"]', 'Password123!');
  await page.fill('[data-testid="input-invite-code"]', 'nomad');
  
  // Click the checkbox using force because it might be styled/hidden
  await page.click('[data-testid="checkbox-terms"]', { force: true });
  
  // The button ID is button-register
  await page.click('[data-testid="button-register"]');

  // Verify OTP section appears on the same page
  const otpInput = page.locator('[data-testid="input-otp"]');
  await expect(otpInput).toBeVisible({ timeout: 15000 });
  await page.fill('[data-testid="input-otp"]', '123456');
  await page.click('[data-testid="button-verify"]');

  // 3. Onboarding Step 1: Welcome
  await expect(page).toHaveURL(/.*onboarding/, { timeout: 15000 });
  await page.click('[data-testid="button-next"]');

  // 4. Onboarding Step 2: Location
  const locationInput = page.locator('[data-testid="input-location"]');
  await expect(locationInput).toBeVisible();
  
  await locationInput.fill('Tbilisi');
  await page.waitForSelector('[data-testid^="location-result-"]', { timeout: 10000 });
  await page.click('[data-testid^="location-result-0"]'); 
  
  await page.click('[data-testid="button-next"]');
  
  // Follow the steps until completion
  await page.click('[data-testid="button-skip-photo"]');
  await page.click('[data-testid="button-role-dancer"]');
  await page.click('[data-testid="button-next"]');
  await page.click('[data-testid="button-next"]');
  await page.click('[data-testid="button-next"]');

  // 9. Verify redirection and city
  await expect(page).toHaveURL(/.*volunteer/);
  
  // Go to profile to verify city
  await page.goto('/profile/edit');
  const cityValue = await page.inputValue('[data-testid="input-city"]');
  expect(cityValue).toBe('Tbilisi');

  // Verify group membership
  await page.goto('/groups');
  await expect(page.locator('text=Tbilisi Tango Community')).toBeVisible();
});
