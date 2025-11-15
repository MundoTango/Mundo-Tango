import { test, expect } from '@playwright/test';
import { BugReporter } from './helpers/bug-reporter';

const SUITE_NAME = 'Auth Token Tests';
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

test.describe(SUITE_NAME, () => {
  let bugReporter: BugReporter;

  test.beforeEach(async ({ page }) => {
    bugReporter = new BugReporter(page);
  });

  test('AUTH-01: Login with valid admin credentials', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      
      await expect(page).toHaveURL(/\/feed|\/dashboard/, { timeout: 10000 });
      
      const consoleErrors = bugReporter.getConsoleErrors();
      expect(consoleErrors.length).toBe(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Login with valid admin credentials',
        1,
        String(error),
        {
          files: ['client/src/pages/Login.tsx', 'server/routes/auth.ts'],
          issue: 'Login flow not working with valid credentials',
          expectedFix: 'Verify auth endpoint and form submission logic',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-02: JWT token stored in localStorage after login', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      
      await page.waitForURL(/\/feed|\/dashboard/, { timeout: 10000 });
      
      const token = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(token).toBeTruthy();
      expect(token).toMatch(/^eyJ/);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'JWT token stored in localStorage',
        2,
        String(error),
        {
          files: ['client/src/lib/queryClient.ts', 'server/routes/auth.ts'],
          issue: 'Token not being stored in localStorage after successful login',
          expectedFix: 'Add localStorage.setItem in login response handler',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-03: Session persists across page refresh', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/\/feed|\/dashboard/);
      
      const is401Count = bugReporter.get401Errors().length;
      expect(is401Count).toBe(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Session persists across page refresh',
        3,
        String(error),
        {
          files: ['client/src/lib/queryClient.ts', 'client/src/App.tsx'],
          issue: 'Session not persisting on page refresh',
          expectedFix: 'Implement token validation on app mount',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-04: Zero 401 errors after successful login', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      
      bugReporter.clearLogs();
      
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      await page.waitForTimeout(3000);
      
      const unauthorized = bugReporter.get401Errors();
      expect(unauthorized.length).toBe(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Zero 401 errors after login',
        4,
        String(error),
        {
          files: ['client/src/lib/queryClient.ts', 'server/middleware/auth.ts'],
          issue: 'Receiving 401 errors after successful authentication',
          expectedFix: 'Add authorization header to all authenticated requests',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-05: Token auto-refresh when nearing expiry', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      
      const initialToken = await page.evaluate(() => localStorage.getItem('authToken'));
      
      await page.evaluate(() => {
        const expiredToken = localStorage.getItem('authToken');
        if (expiredToken) {
          const payload = JSON.parse(atob(expiredToken.split('.')[1]));
          payload.exp = Math.floor(Date.now() / 1000) + 60;
          const newToken = [
            expiredToken.split('.')[0],
            btoa(JSON.stringify(payload)),
            expiredToken.split('.')[2]
          ].join('.');
          localStorage.setItem('authToken', newToken);
        }
      });
      
      await page.reload();
      await page.waitForTimeout(2000);
      
      const refreshedToken = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(refreshedToken).not.toBe(initialToken);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Token auto-refresh when nearing expiry',
        5,
        String(error),
        {
          files: ['client/src/lib/queryClient.ts', 'server/routes/auth.ts'],
          issue: 'Token refresh not triggered automatically',
          expectedFix: 'Implement token expiry checking and auto-refresh',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-06: Logout clears token and redirects to login', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      
      await page.click('[data-testid="button-logout"]');
      
      await expect(page).toHaveURL(/\/login/);
      
      const token = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(token).toBeFalsy();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Logout clears token and redirects',
        6,
        String(error),
        {
          files: ['client/src/components/navigation/TopNavigationBar.tsx'],
          issue: 'Logout not clearing authentication state',
          expectedFix: 'Clear localStorage and redirect to /login on logout',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-07: Re-login after logout works correctly', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      
      await page.click('[data-testid="button-logout"]');
      await page.waitForURL(/\/login/);
      
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      
      await expect(page).toHaveURL(/\/feed|\/dashboard/);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Re-login after logout',
        7,
        String(error),
        {
          files: ['client/src/pages/Login.tsx', 'server/routes/auth.ts'],
          issue: 'Cannot re-login after logging out',
          expectedFix: 'Ensure state is properly cleared on logout',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-08: Invalid credentials show error message', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', 'wrong@email.com');
      await page.fill('[data-testid="input-password"]', 'wrongpassword');
      await page.click('[data-testid="button-login"]');
      
      await page.waitForTimeout(2000);
      
      const errorMessage = await page.locator('[data-testid="text-error"]');
      await expect(errorMessage).toBeVisible();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Invalid credentials show error',
        8,
        String(error),
        {
          files: ['client/src/pages/Login.tsx'],
          issue: 'Error message not displayed for invalid credentials',
          expectedFix: 'Add error state display in login form',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-09: Protected routes redirect to login when not authenticated', async ({ page }, testInfo) => {
    try {
      await page.goto('/feed');
      
      await expect(page).toHaveURL(/\/login/);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Protected routes redirect to login',
        9,
        String(error),
        {
          files: ['client/src/App.tsx'],
          issue: 'Protected routes accessible without authentication',
          expectedFix: 'Add route guards to protect authenticated routes',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-10: Authorization header included in API requests', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      
      bugReporter.clearLogs();
      
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      await page.waitForTimeout(2000);
      
      const apiRequests = bugReporter.getNetworkLogs().filter(log => 
        log.url.includes('/api/') && !log.url.includes('/api/auth/login')
      );
      
      const hasAuthHeader = apiRequests.some(req => 
        req.requestHeaders && req.requestHeaders['authorization']
      );
      
      expect(hasAuthHeader).toBeTruthy();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Authorization header in API requests',
        10,
        String(error),
        {
          files: ['client/src/lib/queryClient.ts'],
          issue: 'Authorization header not being sent with API requests',
          expectedFix: 'Add default authorization header to fetch/axios config',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-11: Token expiry triggers automatic re-authentication', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      
      await page.evaluate(() => {
        const expiredPayload = {
          exp: Math.floor(Date.now() / 1000) - 3600,
          sub: 'test-user'
        };
        const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
          btoa(JSON.stringify(expiredPayload)) + 
          '.fake-signature';
        localStorage.setItem('authToken', fakeToken);
      });
      
      await page.reload();
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveURL(/\/login/);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Expired token triggers re-authentication',
        11,
        String(error),
        {
          files: ['client/src/lib/queryClient.ts', 'client/src/App.tsx'],
          issue: 'Expired tokens not being detected and handled',
          expectedFix: 'Add token validation on app mount and API calls',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-12: Multiple tabs share authentication state', async ({ browser }, testInfo) => {
    try {
      const context = await browser.newContext();
      const page1 = await context.newPage();
      const bugReporter1 = new BugReporter(page1);
      
      await page1.goto('/login');
      await page1.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page1.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page1.click('[data-testid="button-login"]');
      await page1.waitForURL(/\/feed|\/dashboard/);
      
      const page2 = await context.newPage();
      await page2.goto('/feed');
      
      await expect(page2).toHaveURL(/\/feed/);
      
      await context.close();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Multiple tabs share auth state',
        12,
        String(error),
        {
          files: ['client/src/lib/queryClient.ts'],
          issue: 'Authentication state not shared between tabs',
          expectedFix: 'Use localStorage events to sync auth across tabs',
          priority: 'low',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-13: Remember me functionality persists login', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      
      const rememberCheckbox = page.locator('[data-testid="checkbox-remember"]');
      if (await rememberCheckbox.isVisible()) {
        await rememberCheckbox.check();
      }
      
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      
      await page.context().close();
      
      const newContext = await page.context().browser()?.newContext();
      if (newContext) {
        const newPage = await newContext.newPage();
        await newPage.goto('/');
        
        await expect(newPage).toHaveURL(/\/feed|\/dashboard/);
        await newContext.close();
      }
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Remember me functionality',
        13,
        String(error),
        {
          files: ['client/src/pages/Login.tsx', 'server/routes/auth.ts'],
          issue: 'Remember me feature not persisting login',
          expectedFix: 'Implement long-lived refresh tokens for remember me',
          priority: 'low',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-14: Password reset flow works correctly', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      
      const forgotPasswordLink = page.locator('[data-testid="link-forgot-password"]');
      if (await forgotPasswordLink.isVisible()) {
        await forgotPasswordLink.click();
        
        await expect(page).toHaveURL(/\/forgot-password|\/reset-password/);
        
        await page.fill('[data-testid="input-email"]', TEST_EMAIL);
        await page.click('[data-testid="button-send-reset"]');
        
        const successMessage = page.locator('[data-testid="text-success"]');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Password reset flow',
        14,
        String(error),
        {
          files: ['client/src/pages/ForgotPassword.tsx', 'server/routes/auth.ts'],
          issue: 'Password reset flow not working',
          expectedFix: 'Implement forgot password endpoint and email sending',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('AUTH-15: User profile data loaded after authentication', async ({ page }, testInfo) => {
    try {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', TEST_EMAIL);
      await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
      await page.click('[data-testid="button-login"]');
      await page.waitForURL(/\/feed|\/dashboard/);
      
      await page.waitForTimeout(2000);
      
      const userAvatar = page.locator('[data-testid="img-avatar"]');
      await expect(userAvatar).toBeVisible({ timeout: 5000 });
      
      const consoleErrors = bugReporter.getConsoleErrors();
      const profileErrors = consoleErrors.filter(e => 
        e.message.includes('profile') || e.message.includes('user')
      );
      expect(profileErrors.length).toBe(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'User profile loaded after auth',
        15,
        String(error),
        {
          files: ['client/src/App.tsx', 'server/routes/users.ts'],
          issue: 'User profile data not loading after authentication',
          expectedFix: 'Fetch user profile on successful login',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });
});
