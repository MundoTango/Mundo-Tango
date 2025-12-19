import { test, expect } from '@playwright/test';
import { generateTestUser } from './fixtures/test-data';

test.describe('Admin Dashboard Journey', () => {
  let adminUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    // Create admin user
    adminUser = generateTestUser();
    const registerResponse = await page.request.post('/api/auth/register', {
      data: {
        username: adminUser.username,
        email: adminUser.email,
        password: adminUser.password,
        name: adminUser.name,
      },
    });
    const userData = await registerResponse.json();
    
    // Set user as admin (direct DB update)
    await page.request.post('/api/admin/set-admin', {
      data: { userId: userData.id, isAdmin: true },
    });
    
    // Login as admin
    await page.goto('/login');
    await page.getByTestId('input-username').fill(adminUser.username);
    await page.getByTestId('input-password').fill(adminUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
  });

  test('should access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    // Verify admin dashboard
    await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible();
    await expect(page.getByTestId('admin-stats-widget')).toBeVisible();
  });

  test('should view platform statistics', async ({ page }) => {
    await page.goto('/admin');
    
    // Verify stats widgets
    await expect(page.getByTestId('stat-total-users')).toBeVisible();
    await expect(page.getByTestId('stat-active-users')).toBeVisible();
    await expect(page.getByTestId('stat-total-posts')).toBeVisible();
    await expect(page.getByTestId('stat-total-events')).toBeVisible();
    
    // Verify charts
    await expect(page.getByTestId('chart-user-growth')).toBeVisible();
    await expect(page.getByTestId('chart-engagement')).toBeVisible();
  });

  test('should view moderation queue', async ({ page }) => {
    await page.goto('/admin/moderation');
    
    // Verify moderation queue
    await expect(page.getByRole('heading', { name: /moderation queue/i })).toBeVisible();
    await expect(page.getByTestId('moderation-queue-table')).toBeVisible();
  });

  test('should moderate reported content', async ({ page }) => {
    // Create a reported post
    const postResponse = await page.request.post('/api/posts', {
      data: { content: 'Test post to be reported' },
    });
    const postData = await postResponse.json();
    
    await page.request.post(`/api/posts/${postData.id}/report`, {
      data: { reason: 'Inappropriate content' },
    });
    
    await page.goto('/admin/moderation');
    
    // Find and moderate the report
    const report = page.getByTestId('moderation-item').first();
    await report.getByTestId('button-view-details').click();
    
    // Take action
    await page.getByTestId('button-approve-content').click();
    
    // Verify action taken
    await expect(page.getByText(/content approved/i)).toBeVisible();
  });

  test('should manage users', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Verify user management page
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible();
    await expect(page.getByTestId('users-table')).toBeVisible();
    
    // Search for user
    await page.getByTestId('input-search-users').fill(adminUser.username);
    await page.waitForTimeout(500);
    
    // Verify user appears in results
    await expect(page.getByText(adminUser.username)).toBeVisible();
  });

  test('should view activity logs', async ({ page }) => {
    await page.goto('/admin/activity');
    
    // Verify activity logs
    await expect(page.getByRole('heading', { name: /activity logs/i })).toBeVisible();
    await expect(page.getByTestId('activity-log-table')).toBeVisible();
    
    // Verify log entries
    await expect(page.getByTestId('activity-log-entry')).toHaveCount({ min: 1 });
  });

  test('should export analytics data', async ({ page }) => {
    await page.goto('/admin/analytics');
    
    // Click export button
    await page.getByTestId('button-export-analytics').click();
    
    // Select date range
    await page.getByTestId('input-date-from').fill('2025-01-01');
    await page.getByTestId('input-date-to').fill('2025-12-31');
    
    // Trigger download
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('button-download-csv').click();
    const download = await downloadPromise;
    
    // Verify download started
    expect(download.suggestedFilename()).toContain('analytics');
  });
});
