import { Page, expect } from '@playwright/test';

/**
 * Navigation Helper - Page navigation and route verification
 */

export async function navigateToPage(page: Page, route: string) {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Allow UI to settle
}

export async function verifyOnPage(page: Page, expectedUrl: string | RegExp) {
  await page.waitForURL(expectedUrl, { timeout: 10000 });
}

export async function clickNavLink(page: Page, linkText: string) {
  await page.getByRole('link', { name: linkText }).click();
  await page.waitForLoadState('networkidle');
}

export async function verifyPageTitle(page: Page, title: string) {
  const pageTitle = await page.title();
  expect(pageTitle).toContain(title);
}

export async function verifyBreadcrumbs(page: Page, breadcrumbs: string[]) {
  for (const crumb of breadcrumbs) {
    await expect(page.getByRole('navigation').getByText(crumb)).toBeVisible();
  }
}

export async function openSidebarMenu(page: Page) {
  const sidebar = page.locator('[data-testid="app-sidebar"]');
  const isVisible = await sidebar.isVisible();
  
  if (!isVisible) {
    await page.getByTestId('button-sidebar-toggle').click();
    await page.waitForTimeout(300); // Wait for animation
  }
}

export async function navigateViaSidebar(page: Page, itemTestId: string) {
  await openSidebarMenu(page);
  await page.getByTestId(itemTestId).click();
  await page.waitForLoadState('networkidle');
}

export async function verifyNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return {
    getErrors: () => errors,
    hasErrors: () => errors.length > 0,
  };
}

export async function waitForPageLoad(page: Page, timeout = 3000) {
  const startTime = Date.now();
  await page.waitForLoadState('load');
  const loadTime = Date.now() - startTime;
  
  // Verify page loads within 3 seconds
  expect(loadTime).toBeLessThan(timeout);
  
  return loadTime;
}
