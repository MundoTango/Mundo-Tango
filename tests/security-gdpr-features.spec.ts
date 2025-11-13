import { test, expect } from '@playwright/test';
import { nanoid } from 'nanoid';

/**
 * E2E Test Suite: Security & GDPR Compliance Features
 * Tests all new security pages with MT Ocean design validation
 */

test.describe('Security & GDPR Features - Complete Suite', () => {
  let testEmail: string;
  let testPassword: string;

  test.beforeEach(async ({ page }) => {
    // Create unique test user
    testEmail = `test-security-${nanoid(6)}@mundotango.test`;
    testPassword = 'SecureP@ss123!';

    // Navigate to registration
    await page.goto('/');
    await page.click('[data-testid="link-register"]');

    // Register new user
    await page.fill('[data-testid="input-name"]', 'Security Test User');
    await page.fill('[data-testid="input-email"]', testEmail);
    await page.fill('[data-testid="input-password"]', testPassword);
    await page.fill('[data-testid="input-confirmPassword"]', testPassword);
    await page.check('[data-testid="checkbox-terms"]');
    await page.click('[data-testid="button-register"]');

    // Wait for successful registration
    await expect(page).toHaveURL(/\/feed/, { timeout: 10000 });
  });

  test('CSRF Protection: Form submissions include CSRF tokens', async ({ page }) => {
    // Navigate to profile edit (form with CSRF protection)
    await page.click('[data-testid="button-profile"]');
    await page.click('[data-testid="link-edit-profile"]');

    // Monitor network requests
    const requests: any[] = [];
    page.on('request', request => {
      if (request.method() === 'POST' || request.method() === 'PATCH') {
        requests.push({
          url: request.url(),
          headers: request.headers(),
          method: request.method()
        });
      }
    });

    // Submit form
    await page.fill('[data-testid="input-bio"]', 'Testing CSRF protection');
    await page.click('[data-testid="button-save-profile"]');

    // Wait for request to complete
    await page.waitForTimeout(1000);

    // Verify CSRF token in request
    const profileUpdateRequest = requests.find(r => r.url.includes('/api/profile'));
    expect(profileUpdateRequest).toBeDefined();
    expect(profileUpdateRequest.headers['x-csrf-token'] || profileUpdateRequest.headers['xsrf-token']).toBeDefined();
  });

  test('Security Settings Page: View active sessions and audit logs', async ({ page }) => {
    // Navigate to Security Settings
    await page.click('[data-testid="button-profile"]');
    await page.click('[data-testid="link-settings"]');
    await page.click('[data-testid="link-security"]');

    // Verify page loaded with MT Ocean design
    await expect(page).toHaveURL('/settings/security');
    await expect(page.locator('h1')).toContainText('Security Settings');

    // Check glassmorphic card styling (MT Ocean theme)
    const sessionCard = page.locator('[data-testid="card-active-sessions"]').first();
    await expect(sessionCard).toBeVisible();
    
    // Verify backdrop-blur effect applied
    const cardClass = await sessionCard.getAttribute('class');
    expect(cardClass).toContain('backdrop-blur');

    // Verify active sessions section
    await expect(page.locator('[data-testid="text-session-device"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="button-revoke-session"]').first()).toBeVisible();

    // Verify 2FA section
    await expect(page.locator('[data-testid="toggle-2fa"]')).toBeVisible();

    // Verify login history section
    await expect(page.locator('[data-testid="text-login-time"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="text-login-ip"]').first()).toBeVisible();

    // Verify security audit log section
    await expect(page.locator('[data-testid="text-audit-action"]').first()).toBeVisible();
  });

  test('Security Settings: Revoke session functionality', async ({ page }) => {
    // Navigate to Security Settings
    await page.goto('/settings/security');

    // Click revoke on first session
    const initialSessions = await page.locator('[data-testid="text-session-device"]').count();
    expect(initialSessions).toBeGreaterThan(0);

    await page.click('[data-testid="button-revoke-session"]');

    // Verify success message
    await expect(page.locator('text=Session revoked successfully')).toBeVisible({ timeout: 5000 });
  });

  test('Privacy & Data Page: Update privacy settings', async ({ page }) => {
    // Navigate to Privacy & Data
    await page.goto('/settings/privacy-data');

    // Verify page loaded with MT Ocean design
    await expect(page.locator('h1')).toContainText(/Privacy|Data/);

    // Check glassmorphic cards
    const consentCard = page.locator('[data-testid="card-data-consent"]');
    await expect(consentCard).toBeVisible();

    // Toggle marketing emails OFF
    const marketingToggle = page.locator('[data-testid="toggle-marketing-emails"]');
    const wasChecked = await marketingToggle.isChecked();
    await marketingToggle.click();

    // Toggle analytics OFF
    const analyticsToggle = page.locator('[data-testid="toggle-analytics"]');
    await analyticsToggle.click();

    // Save settings
    await page.click('[data-testid="button-save-privacy"]');

    // Verify success message
    await expect(page.locator('text=Privacy settings updated')).toBeVisible({ timeout: 5000 });

    // Reload page and verify persistence
    await page.reload();
    await expect(page.locator('[data-testid="toggle-marketing-emails"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="toggle-analytics"]')).not.toBeChecked();
  });

  test('Data Export Page: Request GDPR data export', async ({ page }) => {
    // Navigate to Data Export
    await page.goto('/settings/data-export');

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Download Your Data');

    // Verify GDPR Article 20 mentioned
    await expect(page.locator('text=/Article 20|data portability/i')).toBeVisible();

    // Check glassmorphic design
    const exportCard = page.locator('[data-testid="card-data-export"]');
    await expect(exportCard).toBeVisible();

    // Select JSON format
    await page.click('[data-testid="radio-format-json"]');

    // Request export
    await page.click('[data-testid="button-request-export"]');

    // Verify success message
    await expect(page.locator('text=/Export requested|request submitted/i')).toBeVisible({ timeout: 5000 });

    // Verify export appears in status section
    await expect(page.locator('[data-testid="text-export-status"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="text-export-status"]').first()).toContainText(/pending|processing/i);
  });

  test('Data Export Page: Multiple format options available', async ({ page }) => {
    // Navigate to Data Export
    await page.goto('/settings/data-export');

    // Verify all format options exist
    await expect(page.locator('[data-testid="radio-format-json"]')).toBeVisible();
    await expect(page.locator('[data-testid="radio-format-csv"]')).toBeVisible();
    await expect(page.locator('[data-testid="radio-format-zip"]')).toBeVisible();

    // Test CSV format selection
    await page.click('[data-testid="radio-format-csv"]');
    await page.click('[data-testid="button-request-export"]');
    await expect(page.locator('text=/Export requested/i')).toBeVisible({ timeout: 5000 });
  });

  test('Account Deletion Page: GDPR compliant deletion flow', async ({ page }) => {
    // Navigate to Account Deletion
    await page.goto('/settings/delete-account');

    // Verify page loaded with warning styling
    await expect(page.locator('h1')).toContainText(/Delete.*Account/i);

    // Verify GDPR Article 17 mentioned
    await expect(page.locator('text=/Article 17|right to erasure/i')).toBeVisible();

    // Verify danger zone styling (red accents)
    const warningCard = page.locator('[data-testid="card-delete-warning"]');
    await expect(warningCard).toBeVisible();

    // Verify all 3 confirmation checkboxes
    await expect(page.locator('[data-testid="checkbox-confirm-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkbox-confirm-2"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkbox-confirm-3"]')).toBeVisible();

    // Verify password input
    await expect(page.locator('[data-testid="input-confirm-password"]')).toBeVisible();

    // Verify delete button is disabled initially
    const deleteButton = page.locator('[data-testid="button-delete-account"]');
    await expect(deleteButton).toBeDisabled();

    // Check all confirmations
    await page.check('[data-testid="checkbox-confirm-1"]');
    await page.check('[data-testid="checkbox-confirm-2"]');
    await page.check('[data-testid="checkbox-confirm-3"]');

    // Enter password
    await page.fill('[data-testid="input-confirm-password"]', testPassword);

    // Verify delete button now enabled
    await expect(deleteButton).toBeEnabled();
  });

  test('Account Deletion: Full deletion flow with modal confirmation', async ({ page }) => {
    // Navigate to Account Deletion
    await page.goto('/settings/delete-account');

    // Complete all confirmations
    await page.check('[data-testid="checkbox-confirm-1"]');
    await page.check('[data-testid="checkbox-confirm-2"]');
    await page.check('[data-testid="checkbox-confirm-3"]');
    await page.fill('[data-testid="input-confirm-password"]', testPassword);

    // Click delete button
    await page.click('[data-testid="button-delete-account"]');

    // Verify modal appears
    await expect(page.locator('[data-testid="modal-final-confirmation"]')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('text=/Are you sure|final confirmation/i')).toBeVisible();

    // Verify countdown timer
    await expect(page.locator('[data-testid="text-countdown"]')).toBeVisible();

    // Wait for countdown (or skip if button becomes enabled sooner)
    await page.waitForTimeout(10500); // 10 seconds + buffer

    // Verify final delete button enabled
    const finalDeleteButton = page.locator('[data-testid="button-final-delete"]');
    await expect(finalDeleteButton).toBeEnabled({ timeout: 2000 });

    // Click final delete
    await finalDeleteButton.click();

    // Verify redirect to login/home
    await expect(page).toHaveURL(/\/login|\/$/i, { timeout: 10000 });
    
    // Verify success/goodbye message
    await expect(page.locator('text=/account deleted|goodbye/i')).toBeVisible({ timeout: 5000 });
  });

  test('MT Ocean Design: Dark mode toggles correctly on all pages', async ({ page }) => {
    const pages = [
      '/settings/security',
      '/settings/privacy-data',
      '/settings/data-export',
      '/settings/delete-account'
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Get initial theme
      const html = page.locator('html');
      const initialClass = await html.getAttribute('class');
      const isDarkMode = initialClass?.includes('dark');

      // Toggle theme
      await page.click('[data-testid="button-theme-toggle"]');
      await page.waitForTimeout(500);

      // Verify class changed
      const newClass = await html.getAttribute('class');
      if (isDarkMode) {
        expect(newClass).not.toContain('dark');
      } else {
        expect(newClass).toContain('dark');
      }

      // Verify glassmorphic cards still visible
      const cards = page.locator('[class*="backdrop-blur"]');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThan(0);
    }
  });

  test('Navigation: All security pages accessible from Settings menu', async ({ page }) => {
    await page.goto('/feed');

    // Open settings dropdown
    await page.click('[data-testid="button-profile"]');

    // Verify all security links exist
    await expect(page.locator('[data-testid="link-security"]')).toBeVisible();
    await expect(page.locator('[data-testid="link-privacy-data"]')).toBeVisible();
    await expect(page.locator('[data-testid="link-data-export"]')).toBeVisible();
    await expect(page.locator('[data-testid="link-delete-account"]')).toBeVisible();

    // Click Security
    await page.click('[data-testid="link-security"]');
    await expect(page).toHaveURL('/settings/security');

    // Navigate back and test Privacy
    await page.click('[data-testid="button-profile"]');
    await page.click('[data-testid="link-privacy-data"]');
    await expect(page).toHaveURL('/settings/privacy-data');

    // Navigate back and test Data Export
    await page.click('[data-testid="button-profile"]');
    await page.click('[data-testid="link-data-export"]');
    await expect(page).toHaveURL('/settings/data-export');

    // Navigate back and test Delete Account
    await page.click('[data-testid="button-profile"]');
    await page.click('[data-testid="link-delete-account"]');
    await expect(page).toHaveURL('/settings/delete-account');
  });

  test('API Integration: Backend endpoints respond correctly', async ({ page }) => {
    // Test sessions endpoint
    const sessionsResponse = await page.request.get('/api/settings/sessions');
    expect(sessionsResponse.ok()).toBeTruthy();
    const sessions = await sessionsResponse.json();
    expect(Array.isArray(sessions)).toBeTruthy();

    // Test audit logs endpoint
    const auditResponse = await page.request.get('/api/settings/audit-logs');
    expect(auditResponse.ok()).toBeTruthy();
    const auditLogs = await auditResponse.json();
    expect(Array.isArray(auditLogs)).toBeTruthy();

    // Test data exports endpoint
    const exportsResponse = await page.request.get('/api/settings/data-exports');
    expect(exportsResponse.ok()).toBeTruthy();
  });

  test('CSP Headers: Content Security Policy applied to all responses', async ({ page }) => {
    const response = await page.goto('/settings/security');
    const headers = response?.headers();
    
    // Verify CSP header exists
    expect(headers?.['content-security-policy'] || headers?.['Content-Security-Policy']).toBeDefined();
  });

  test('Responsive Design: Pages work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Test all pages
    const pages = [
      '/settings/security',
      '/settings/privacy-data',
      '/settings/data-export',
      '/settings/delete-account'
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Verify page loads
      await expect(page.locator('h1')).toBeVisible();

      // Verify cards are visible and not cut off
      const cards = page.locator('[data-testid^="card-"]').first();
      await expect(cards).toBeVisible();

      // Verify buttons are accessible
      const buttons = page.locator('button[data-testid^="button-"]').first();
      await expect(buttons).toBeVisible();
    }
  });
});
