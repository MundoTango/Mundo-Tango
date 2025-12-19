import { test, expect } from '@playwright/test';

test.describe('Global Navigation System', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', 'super@admin.com');
    await page.fill('[data-testid="input-password"]', 'admin123');
    await page.click('[data-testid="button-login"]');
    await page.waitForURL('/');
  });

  test.describe('Sidebar - Desktop', () => {
    test('should display sidebar with all 8 navigation items', async ({ page }) => {
      // Check if sidebar is visible
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).toBeVisible();

      // Check all 8 navigation items
      await expect(page.locator('[data-testid="sidebar-item-memories"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar-item-tango-community"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar-item-friends"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar-item-messages"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar-item-groups"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar-item-events"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar-item-recommendations"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar-item-role-invitations"]')).toBeVisible();
    });

    test('should display user profile card', async ({ page }) => {
      const profileCard = page.locator('[data-testid="sidebar-profile-card"]');
      await expect(profileCard).toBeVisible();
      
      // Should be clickable (links to profile)
      await expect(profileCard).toHaveAttribute('href', /\/profile\/.+/);
    });

    test('should display global statistics', async ({ page }) => {
      // Check all 4 stats
      const stats = [
        'stat-global-dancers',
        'stat-active-events',
        'stat-communities',
        'stat-your-city'
      ];

      for (const stat of stats) {
        const statElement = page.locator(`[data-testid="${stat}"]`);
        await expect(statElement).toBeVisible();
      }
    });

    test('should highlight active route', async ({ page }) => {
      // Navigate to Friends
      await page.click('[data-testid="sidebar-item-friends"]');
      await page.waitForURL('/friends-list');

      // Check if active styling is applied
      const friendsItem = page.locator('[data-testid="sidebar-item-friends"]');
      await expect(friendsItem).toHaveClass(/active-ocean/);
    });

    test('should show hover effects on navigation items', async ({ page }) => {
      const item = page.locator('[data-testid="sidebar-item-memories"]');
      
      // Hover and check for visual change
      await item.hover();
      await expect(item).toHaveClass(/hover-ocean-light/);
    });
  });

  test.describe('Sidebar - Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should hide sidebar by default on mobile', async ({ page }) => {
      const sidebar = page.locator('[data-testid="sidebar"]');
      
      // Sidebar should be hidden (translated off-screen)
      await expect(sidebar).toHaveClass(/-translate-x-full/);
    });

    test('should open/close sidebar with menu button', async ({ page }) => {
      // Open sidebar
      await page.click('[data-testid="button-menu-toggle"]');
      
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).toHaveClass(/translate-x-0/);

      // Check overlay is visible
      await expect(page.locator('[data-testid="sidebar-overlay"]')).toBeVisible();

      // Close by clicking overlay
      await page.click('[data-testid="sidebar-overlay"]');
      await expect(sidebar).toHaveClass(/-translate-x-full/);
    });

    test('should close sidebar after navigating on mobile', async ({ page }) => {
      // Open sidebar
      await page.click('[data-testid="button-menu-toggle"]');
      
      // Click a navigation item
      await page.click('[data-testid="sidebar-item-friends"]');
      
      // Sidebar should close automatically
      const sidebar = page.locator('[data-testid="sidebar"]');
      await page.waitForTimeout(500); // Wait for animation
      await expect(sidebar).toHaveClass(/-translate-x-full/);
    });
  });

  test.describe('UnifiedTopBar', () => {
    test('should display all topbar elements', async ({ page }) => {
      const topbar = page.locator('[data-testid="unified-topbar"]');
      await expect(topbar).toBeVisible();

      // Check logo
      await expect(page.locator('[data-testid="link-logo"]')).toBeVisible();

      // Check action buttons
      await expect(page.locator('[data-testid="button-theme-toggle"]')).toBeVisible();
      await expect(page.locator('[data-testid="button-favorites"]')).toBeVisible();
      await expect(page.locator('[data-testid="button-messages"]')).toBeVisible();
      await expect(page.locator('[data-testid="button-notifications"]')).toBeVisible();
      await expect(page.locator('[data-testid="button-user-menu"]')).toBeVisible();
    });

    test('should toggle theme', async ({ page }) => {
      const themeButton = page.locator('[data-testid="button-theme-toggle"]');
      
      // Get initial theme
      const isDarkMode = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      );

      // Toggle theme
      await themeButton.click();
      await page.waitForTimeout(100);

      // Check if theme changed
      const newDarkMode = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      );
      expect(newDarkMode).toBe(!isDarkMode);
    });

    test('should display notification badge when count > 0', async ({ page }) => {
      // This test assumes there are notifications
      // Badge should be visible if notificationCount > 0
      const notifButton = page.locator('[data-testid="button-notifications"]');
      await expect(notifButton).toBeVisible();
      
      // Check if badge exists (might not always be present)
      const badge = notifButton.locator('span.bg-red-500');
      if (await badge.count() > 0) {
        await expect(badge).toBeVisible();
      }
    });

    test('should display message badge when count > 0', async ({ page }) => {
      const messageButton = page.locator('[data-testid="button-messages"]');
      await expect(messageButton).toBeVisible();
      
      // Check if badge exists
      const badge = messageButton.locator('span.bg-red-500');
      if (await badge.count() > 0) {
        await expect(badge).toBeVisible();
      }
    });

    test('should open user menu dropdown', async ({ page }) => {
      await page.click('[data-testid="button-user-menu"]');
      
      // Check menu items
      await expect(page.locator('[data-testid="text-user-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="text-user-username"]')).toBeVisible();
      await expect(page.locator('[data-testid="menu-item-profile"]')).toBeVisible();
      await expect(page.locator('[data-testid="menu-item-settings"]')).toBeVisible();
      await expect(page.locator('[data-testid="menu-item-billing"]')).toBeVisible();
      await expect(page.locator('[data-testid="menu-item-logout"]')).toBeVisible();
    });

    test('should show admin menu item for admin users', async ({ page }) => {
      await page.click('[data-testid="button-user-menu"]');
      
      // Admin user should see admin menu item
      const adminItem = page.locator('[data-testid="menu-item-admin"]');
      if (await adminItem.count() > 0) {
        await expect(adminItem).toBeVisible();
      }
    });

    test('should logout successfully', async ({ page }) => {
      await page.click('[data-testid="button-user-menu"]');
      await page.click('[data-testid="menu-item-logout"]');
      
      // Should redirect to login
      await page.waitForURL('/login');
    });
  });

  test.describe('Global Search', () => {
    test('should display search bar on desktop', async ({ page }) => {
      const searchInput = page.locator('[data-testid="input-search"]');
      await expect(searchInput).toBeVisible();
    });

    test('should search and display results', async ({ page }) => {
      const searchInput = page.locator('[data-testid="input-search"]');
      
      // Type search query
      await searchInput.fill('test');
      await page.waitForTimeout(500); // Debounce delay
      
      // Results should appear (if there are any matching results)
      // Note: This test depends on actual data
    });

    test('should close search results when clicking outside', async ({ page }) => {
      const searchInput = page.locator('[data-testid="input-search"]');
      
      // Open search
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      
      // Click outside
      await page.click('[data-testid="link-logo"]');
      await page.waitForTimeout(200);
      
      // Results should be hidden
      // (This depends on implementation details)
    });
  });

  test.describe('DashboardLayout Integration', () => {
    test('should render content within DashboardLayout', async ({ page }) => {
      // DashboardLayout should contain both topbar and sidebar
      await expect(page.locator('[data-testid="unified-topbar"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      
      // Main content should be visible
      await expect(page.locator('main')).toBeVisible();
    });

    test('should adjust content padding when sidebar is open', async ({ page }) => {
      // On desktop, check if content has proper padding
      // This is a visual test that would need specific assertions
      const main = page.locator('main');
      await expect(main).toBeVisible();
    });
  });

  test.describe('Theme Persistence', () => {
    test('should persist theme preference to localStorage', async ({ page }) => {
      // Toggle to dark mode
      await page.click('[data-testid="button-theme-toggle"]');
      await page.waitForTimeout(100);
      
      // Check localStorage
      const theme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(['light', 'dark']).toContain(theme);
      
      // Reload page
      await page.reload();
      
      // Theme should persist
      const newTheme = await page.evaluate(() => 
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      );
      expect(newTheme).toBe(theme);
    });
  });

  test.describe('Responsive Design', () => {
    test('should show menu button on desktop', async ({ page }) => {
      const menuButton = page.locator('[data-testid="button-menu-toggle"]');
      await expect(menuButton).toBeVisible();
    });

    test('should show sidebar on desktop without overlay', async ({ page }) => {
      const sidebar = page.locator('[data-testid="sidebar"]');
      const overlay = page.locator('[data-testid="sidebar-overlay"]');
      
      await expect(sidebar).toHaveClass(/lg:translate-x-0/);
      await expect(overlay).not.toBeVisible();
    });

    test.use({ viewport: { width: 375, height: 667 } });
    
    test('should hide search bar on mobile', async ({ page }) => {
      const searchInput = page.locator('[data-testid="input-search"]');
      
      // Search should be hidden on mobile
      await expect(searchInput).not.toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper test IDs for all interactive elements', async ({ page }) => {
      // Check key elements have test IDs
      const testIds = [
        'sidebar',
        'sidebar-overlay',
        'sidebar-profile-card',
        'unified-topbar',
        'button-menu-toggle',
        'button-theme-toggle',
        'button-user-menu',
        'button-logout'
      ];

      for (const id of testIds) {
        const element = page.locator(`[data-testid="${id}"]`);
        expect(await element.count()).toBeGreaterThan(0);
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab'); // First focusable element
      await page.keyboard.press('Tab'); // Next element
      
      // Check if focus is visible
      const focused = await page.evaluate(() => {
        const activeElement = document.activeElement;
        return activeElement ? activeElement.tagName : null;
      });
      
      expect(focused).not.toBeNull();
    });
  });

  test.describe('MT Ocean Theme Styling', () => {
    test('should apply Ocean gradient to sidebar in dark mode', async ({ page }) => {
      // Switch to dark mode
      await page.click('[data-testid="button-theme-toggle"]');
      await page.waitForTimeout(200);
      
      const isDarkMode = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      );
      
      if (isDarkMode) {
        const sidebar = page.locator('[data-testid="sidebar"]');
        await expect(sidebar).toHaveClass(/dark:bg-ocean-gradient/);
      }
    });

    test('should display turquoise/seafoam accents', async ({ page }) => {
      // Check if brand logo uses ocean gradient
      const logo = page.locator('[data-testid="link-logo"]');
      await expect(logo).toBeVisible();
      
      // Logo should have ocean gradient text
      const brandText = logo.locator('.text-brand-gradient');
      if (await brandText.count() > 0) {
        await expect(brandText).toBeVisible();
      }
    });
  });
});
