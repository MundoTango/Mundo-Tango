import { Page, expect } from '@playwright/test';

export async function waitForNetworkIdle(page: Page, timeout = 2000) {
  await page.waitForLoadState('networkidle', { timeout });
}

export async function fillForm(page: Page, formData: Record<string, string>) {
  for (const [field, value] of Object.entries(formData)) {
    await page.getByTestId(`input-${field}`).fill(value);
  }
}

export async function verifyToast(page: Page, message: string) {
  const toast = page.getByText(message);
  await expect(toast).toBeVisible({ timeout: 5000 });
  await expect(toast).toBeHidden({ timeout: 10000 });
}

export async function scrollToBottom(page: Page) {
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
}

export async function verifyNavigation(page: Page, expectedPath: string) {
  await page.waitForURL(`**${expectedPath}`, { timeout: 5000 });
  expect(page.url()).toContain(expectedPath);
}

export async function clickAndWait(page: Page, selector: string, waitForNavigation = true) {
  const element = page.getByTestId(selector);
  await element.click();
  if (waitForNavigation) {
    await page.waitForLoadState('networkidle');
  }
}

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

export async function verifyElementVisible(page: Page, testId: string) {
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 5000 });
}

export async function verifyElementHidden(page: Page, testId: string) {
  await expect(page.getByTestId(testId)).toBeHidden({ timeout: 5000 });
}

export async function waitForApiResponse(page: Page, urlPattern: string, timeout = 10000) {
  return page.waitForResponse(
    response => response.url().includes(urlPattern) && response.status() === 200,
    { timeout }
  );
}
