import { test, expect } from '@playwright/test';
import { generateTestUser } from './fixtures/test-data';

test.describe('Profile Management Journey', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    // Register and login
    testUser = generateTestUser();
    await page.request.post('/api/auth/register', {
      data: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      },
    });
    
    await page.goto('/login');
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
  });

  test('should view own profile', async ({ page }) => {
    // Navigate to profile
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('link-my-profile').click();
    
    // Verify profile page
    await expect(page.getByRole('heading', { name: testUser.name })).toBeVisible();
    await expect(page.getByText(testUser.bio)).toBeVisible();
    await expect(page.getByTestId('button-edit-profile')).toBeVisible();
  });

  test('should edit profile information', async ({ page }) => {
    await page.goto('/profile/edit');
    
    // Update bio
    const newBio = 'Updated bio - passionate about tango and community';
    await page.getByTestId('textarea-bio').fill(newBio);
    
    // Update name
    const newName = 'Updated Name';
    await page.getByTestId('input-name').fill(newName);
    
    // Save changes
    await page.getByTestId('button-save-profile').click();
    
    // Verify success
    await expect(page.getByText(/profile updated/i)).toBeVisible();
    
    // Verify changes appear on profile
    await page.goto('/profile');
    await expect(page.getByText(newBio)).toBeVisible();
    await expect(page.getByText(newName)).toBeVisible();
  });

  test('should upload profile avatar', async ({ page }) => {
    await page.goto('/profile/edit');
    
    // Upload avatar
    const fileInput = page.getByTestId('input-avatar-upload');
    await fileInput.setInputFiles('tests/fixtures/test-avatar.jpg');
    
    // Wait for upload
    await page.waitForTimeout(2000);
    
    // Verify preview
    await expect(page.getByTestId('avatar-preview')).toBeVisible();
    
    // Save
    await page.getByTestId('button-save-profile').click();
    
    // Verify avatar on profile
    await page.goto('/profile');
    await expect(page.getByTestId('user-avatar')).toHaveAttribute('src', /.+/);
  });

  test('should update privacy settings', async ({ page }) => {
    await page.goto('/settings/privacy');
    
    // Toggle privacy settings
    await page.getByTestId('toggle-profile-visibility').click();
    await page.getByTestId('toggle-show-email').click();
    await page.getByTestId('toggle-show-phone').click();
    
    // Save settings
    await page.getByTestId('button-save-privacy').click();
    
    // Verify success
    await expect(page.getByText(/settings saved/i)).toBeVisible();
  });

  test('should view activity log', async ({ page }) => {
    await page.goto('/profile/activity');
    
    // Verify activity log
    await expect(page.getByRole('heading', { name: /activity log/i })).toBeVisible();
    await expect(page.getByTestId('activity-item')).toHaveCount({ min: 1 });
    
    // Verify login activity
    await expect(page.getByText(/logged in/i)).toBeVisible();
  });

  test('should change password', async ({ page }) => {
    await page.goto('/settings/security');
    
    // Fill password change form
    await page.getByTestId('input-current-password').fill(testUser.password);
    await page.getByTestId('input-new-password').fill('NewPassword123!');
    await page.getByTestId('input-confirm-password').fill('NewPassword123!');
    
    // Submit
    await page.getByTestId('button-change-password').click();
    
    // Verify success
    await expect(page.getByText(/password changed/i)).toBeVisible();
  });

  test('should request data download', async ({ page }) => {
    await page.goto('/settings/data');
    
    // Request data export
    await page.getByTestId('button-request-data-export').click();
    
    // Confirm dialog
    await page.getByTestId('button-confirm-export').click();
    
    // Verify request submitted
    await expect(page.getByText(/data export requested/i)).toBeVisible();
    await expect(page.getByText(/you will receive an email/i)).toBeVisible();
  });
});
