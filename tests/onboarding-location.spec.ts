import { test, expect } from '@playwright/test';

test('onboarding location change and auto-join city group', async ({ page }) => {
  // 1. Register with invite code "nomad"
  await page.goto('/');
  await page.click('[data-testid="link-register"]');
  
  const timestamp = Date.now();
  const username = `user${timestamp}`;
  const email = `test${timestamp}@example.com`;
  
  await page.fill('[data-testid="input-name"]', 'Test User');
  await page.fill('[data-testid="input-username"]', username);
  await page.fill('[data-testid="input-email"]', email);
  await page.fill('[data-testid="input-password"]', 'Password123!');
  await page.fill('[data-testid="input-invite-code"]', 'nomad');
  await page.click('[data-testid="button-submit"]');

  // 2. Email Verification
  await expect(page).toHaveURL(/.*verify-email/);
  await page.fill('[data-testid="input-otp"]', '123456');
  await page.click('[data-testid="button-verify"]');

  // 3. Onboarding Step 1: Welcome
  await expect(page).toHaveURL(/.*onboarding/);
  await page.click('[data-testid="button-next"]');

  // 4. Onboarding Step 2: Location
  const locationInput = page.locator('[data-testid="input-location"]');
  await locationInput.fill('Tbilisi');
  await page.waitForSelector('[data-testid^="location-result-"]');
  await page.click('[data-testid^="location-result-"]');
  await page.click('[data-testid="button-next"]');

  // 5. Skip photo
  await page.click('[data-testid="button-skip-photo"]');

  // 6. Roles
  await page.click('[data-testid="button-role-dancer"]');
  await page.click('[data-testid="button-next"]');

  // 7. Tour Intro
  await page.click('[data-testid="button-next"]');

  // 8. Completion
  await page.click('[data-testid="button-next"]');

  // 9. Verify redirection and city
  await expect(page).toHaveURL(/.*volunteer/);
  
  // Go to profile to verify city
  await page.goto('/profile/edit');
  const cityValue = await page.getAttribute('[data-testid="input-city"]', 'value');
  expect(cityValue).toBe('Tbilisi');

  // Verify group membership (check if joined the city group)
  await page.goto('/groups');
  await expect(page.locator('text=Tbilisi Tango Community')).toBeVisible();
});
