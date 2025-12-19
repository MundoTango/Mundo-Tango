import { test as setup, expect } from '@playwright/test';
import { generateTestUser } from './test-data';

const authFile = 'tests/.auth/user.json';

setup('authenticate', async ({ page, request }) => {
  const testUser = generateTestUser();
  
  // Register new user
  const registerResponse = await request.post('/api/auth/register', {
    data: {
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
      name: testUser.name,
    },
  });
  
  expect(registerResponse.ok()).toBeTruthy();
  
  // Login
  await page.goto('/login');
  await page.getByTestId('input-username').fill(testUser.username);
  await page.getByTestId('input-password').fill(testUser.password);
  await page.getByTestId('button-login').click();
  
  // Wait for successful login
  await page.waitForURL('/feed');
  await expect(page.getByTestId('text-welcome-user')).toBeVisible();
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
});
