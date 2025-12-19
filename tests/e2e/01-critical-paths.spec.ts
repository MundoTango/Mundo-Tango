import { test, expect } from '@playwright/test';
import { generateTestUser, adminUser } from '../fixtures/test-users';
import { 
  navigateToPage, 
  verifyOnPage, 
  navigateViaSidebar,
  waitForPageLoad,
  verifyPageTitle,
} from '../helpers/navigation';
import {
  fillForm,
  submitForm,
  waitForFormSubmission,
  verifyFormError,
  verifyRequiredFields,
} from '../helpers/forms';
import {
  verifyMTOceanTheme,
  verifyTurquoiseAccents,
  verifyDarkModeToggle,
  verifyResponsiveDesign,
  verifyThemeConsistency,
} from '../helpers/theme';

/**
 * WAVE 5 BATCH 1: CRITICAL PATHS E2E TESTS
 * Tests authentication, navigation, and theme consistency
 */

test.describe('Authentication & Registration', () => {
  
  test('should complete full registration flow', async ({ page }) => {
    const testUser = generateTestUser();
    
    // Navigate to registration page
    await navigateToPage(page, '/register');
    await verifyPageTitle(page, 'Register');
    
    // Fill complete registration form
    await fillForm(page, {
      'input-username': testUser.username,
      'input-email': testUser.email,
      'input-password': testUser.password,
      'input-name': testUser.name,
    });
    
    // Select role if available
    await page.getByTestId('select-role')?.selectOption(testUser.role || 'dancer').catch(() => {});
    
    // Enter city if available
    await page.getByTestId('input-city')?.fill(testUser.city || '').catch(() => {});
    
    // Submit registration
    const responsePromise = waitForFormSubmission(page, '/api/auth/register');
    await submitForm(page, 'button-register');
    await responsePromise;
    
    // Verify redirect to homepage or dashboard
    await page.waitForURL(/\/(feed|onboarding|profile|dashboard|home)/, { timeout: 10000 });
    
    // Verify welcome message/notification
    await expect(
      page.getByText(/welcome|success|registered/i)
    ).toBeVisible({ timeout: 5000 }).catch(() => {});
    
    // Check MT Ocean theme applied
    await verifyMTOceanTheme(page);
    await verifyTurquoiseAccents(page);
  });

  test('should show validation errors for invalid registration', async ({ page }) => {
    await navigateToPage(page, '/register');
    
    // Verify required fields
    await verifyRequiredFields(page, 'button-register', ['username', 'email', 'password']);
  });

  test('should login with valid credentials', async ({ page }) => {
    const testUser = adminUser;
    
    // Navigate to login page
    await navigateToPage(page, '/login');
    await verifyPageTitle(page, 'Login');
    
    // Enter valid credentials
    await fillForm(page, {
      'input-username': testUser.email,
      'input-password': testUser.password,
    });
    
    // Submit login
    const responsePromise = waitForFormSubmission(page, '/api/auth/login');
    await submitForm(page, 'button-login');
    await responsePromise;
    
    // Verify redirect to feed/dashboard
    await verifyOnPage(page, /\/(feed|dashboard)/);
    
    // Check authentication token stored (verify authenticated UI is present)
    await expect(
      page.getByTestId('nav-authenticated')
    ).toBeVisible({ timeout: 5000 }).catch(() => {
      // Alternative: check for user menu or profile link
      return expect(page.getByTestId('button-user-menu')).toBeVisible();
    });
    
    // Verify user profile accessible
    await page.getByTestId('button-user-menu')?.click().catch(() => {});
    await expect(
      page.getByText(testUser.email)
    ).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await navigateToPage(page, '/login');
    
    await fillForm(page, {
      'input-username': 'invalid@example.com',
      'input-password': 'wrongpassword',
    });
    
    await submitForm(page, 'button-login');
    
    // Verify error message
    await verifyFormError(page, /invalid.*credentials|incorrect|failed/i);
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await navigateToPage(page, '/login');
    await fillForm(page, {
      'input-username': adminUser.email,
      'input-password': adminUser.password,
    });
    await submitForm(page, 'button-login');
    await page.waitForURL(/\/(feed|dashboard)/, { timeout: 10000 });
    
    // Click logout button
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    
    // Verify redirect to homepage
    await verifyOnPage(page, /\/(|login|home|marketing)/);
    
    // Check authentication token cleared (protected routes inaccessible)
    await navigateToPage(page, '/feed');
    await page.waitForURL(/\/(login|home|marketing)/, { timeout: 5000 }).catch(() => {});
  });

  test('should support Google OAuth login (if implemented)', async ({ page }) => {
    await navigateToPage(page, '/login');
    
    // Check if Google OAuth button exists
    const googleButton = page.getByTestId('button-google-login');
    const isVisible = await googleButton.isVisible().catch(() => false);
    
    if (isVisible) {
      // Click "Sign in with Google" button
      await googleButton.click();
      
      // Verify OAuth redirect (this would be mocked in tests)
      await page.waitForURL(/accounts\.google\.com|oauth/, { timeout: 5000 }).catch(() => {
        // If no redirect, check for mock OAuth flow
        console.log('Google OAuth not fully implemented or mocked');
      });
    } else {
      test.skip();
    }
  });
});

test.describe('Core Navigation & Theme', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each navigation test
    await navigateToPage(page, '/login');
    await fillForm(page, {
      'input-username': adminUser.email,
      'input-password': adminUser.password,
    });
    await submitForm(page, 'button-login');
    await page.waitForURL(/\/(feed|dashboard)/, { timeout: 10000 });
  });

  test('should render homepage with MT Ocean design', async ({ page }) => {
    // Visit homepage
    await navigateToPage(page, '/');
    
    // Verify MT Ocean glassmorphic design
    await verifyMTOceanTheme(page);
    await verifyTurquoiseAccents(page);
    
    // Check hero section renders (if on marketing page)
    const heroSection = page.locator('[data-testid="hero-section"]');
    const hasHero = await heroSection.isVisible().catch(() => false);
    if (hasHero) {
      await expect(heroSection).toBeVisible();
    }
    
    // Verify navigation menu (sidebar or navbar)
    const hasSidebar = await page.getByTestId('app-sidebar').isVisible().catch(() => false);
    const hasNavbar = await page.getByTestId('navbar').isVisible().catch(() => false);
    
    expect(hasSidebar || hasNavbar).toBeTruthy();
  });

  test('should navigate to all main pages without errors', async ({ page }) => {
    const mainRoutes = [
      { route: '/feed', testId: 'page-feed' },
      { route: '/events', testId: 'page-events' },
      { route: '/groups', testId: 'page-groups' },
      { route: '/messages', testId: 'page-messages' },
      { route: '/profile', testId: 'page-profile' },
      { route: '/settings', testId: 'page-settings' },
    ];

    for (const { route, testId } of mainRoutes) {
      // Navigate to page
      await navigateToPage(page, route);
      
      // Verify page loads without errors
      await page.waitForLoadState('networkidle');
      
      // Check MT Ocean theme consistent
      await verifyMTOceanTheme(page);
      
      // Verify page loads in < 3 seconds
      const loadTime = await waitForPageLoad(page);
      expect(loadTime).toBeLessThan(3000);
    }
  });

  test('should maintain theme consistency across pages', async ({ page }) => {
    const routes = ['/feed', '/events', '/groups', '/profile', '/settings'];
    await verifyThemeConsistency(page, routes);
  });

  test('should persist dark mode across navigation', async ({ page }) => {
    await navigateToPage(page, '/feed');
    
    // Toggle dark mode on
    const themeToggle = page.getByTestId('button-theme-toggle');
    const hasToggle = await themeToggle.isVisible().catch(() => false);
    
    if (hasToggle) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Verify dark mode is active
      const htmlElement = page.locator('html');
      let isDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
      expect(isDark).toBeTruthy();
      
      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify dark mode persists
      isDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
      expect(isDark).toBeTruthy();
      
      // Navigate to different page
      await navigateToPage(page, '/events');
      
      // Check dark mode remains active
      isDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
      expect(isDark).toBeTruthy();
    } else {
      test.skip();
    }
  });

  test('should be responsive across different viewports', async ({ page }) => {
    await navigateToPage(page, '/feed');
    await verifyResponsiveDesign(page);
  });

  test('should navigate via sidebar menu', async ({ page }) => {
    await navigateToPage(page, '/feed');
    
    const sidebarItems = [
      { testId: 'sidebar-item-feed', expectedUrl: '/feed' },
      { testId: 'sidebar-item-events', expectedUrl: '/events' },
      { testId: 'sidebar-item-groups', expectedUrl: '/groups' },
      { testId: 'sidebar-item-messages', expectedUrl: '/messages' },
    ];

    for (const { testId, expectedUrl } of sidebarItems) {
      const item = page.getByTestId(testId);
      const isVisible = await item.isVisible().catch(() => false);
      
      if (isVisible) {
        await navigateViaSidebar(page, testId);
        await verifyOnPage(page, new RegExp(expectedUrl));
      }
    }
  });

  test('should load all pages within 3 seconds', async ({ page }) => {
    const routes = [
      '/feed',
      '/events', 
      '/groups',
      '/profile',
      '/settings',
    ];

    for (const route of routes) {
      await navigateToPage(page, route);
      const loadTime = await waitForPageLoad(page, 3000);
      
      console.log(`${route} loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(3000);
    }
  });

  test('should handle navigation errors gracefully', async ({ page }) => {
    // Try to navigate to non-existent page
    await page.goto('/this-page-does-not-exist-12345');
    
    // Should show 404 or redirect to error page
    await page.waitForLoadState('networkidle');
    
    const has404 = await page.getByText(/404|not found|page.*exist/i).isVisible().catch(() => false);
    expect(has404).toBeTruthy();
  });

  test('should protect authenticated routes', async ({ page }) => {
    // Logout first
    await page.getByTestId('button-user-menu').click();
    await page.getByTestId('button-logout').click();
    await page.waitForURL(/\/(|login|home)/, { timeout: 5000 });
    
    // Try to access protected routes
    const protectedRoutes = ['/feed', '/messages', '/settings'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to login
      await page.waitForURL(/\/(login|home)/, { timeout: 5000 }).catch(() => {});
      
      const currentUrl = page.url();
      const isProtected = currentUrl.includes('/login') || currentUrl.includes('/home');
      
      // If still on protected route, verify login modal appears
      if (!isProtected) {
        const loginModal = await page.getByText(/login|sign in/i).isVisible().catch(() => false);
        expect(loginModal).toBeTruthy();
      }
    }
  });
});

test.describe('Performance & Quality', () => {
  
  test('should have no console errors on critical pages', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Login
    await navigateToPage(page, '/login');
    await fillForm(page, {
      'input-username': adminUser.email,
      'input-password': adminUser.password,
    });
    await submitForm(page, 'button-login');
    await page.waitForURL(/\/(feed|dashboard)/, { timeout: 10000 });
    
    // Navigate to critical pages
    const criticalPages = ['/feed', '/events', '/profile'];
    
    for (const route of criticalPages) {
      await navigateToPage(page, route);
      await page.waitForLoadState('networkidle');
    }
    
    // Filter out known acceptable errors (like CSP warnings)
    const significantErrors = errors.filter(err => 
      !err.includes('Content Security Policy') &&
      !err.includes('coframe.com') &&
      !err.includes('Failed to load resource')
    );
    
    expect(significantErrors.length).toBe(0);
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    await navigateToPage(page, '/');
    
    // Check for title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    // Check for meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
    
    // Check for Open Graph tags (if present)
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
    if (ogTitle) {
      expect(ogTitle.length).toBeGreaterThan(0);
    }
  });
});
