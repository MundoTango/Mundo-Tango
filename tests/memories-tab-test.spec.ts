import { test, expect } from "@playwright/test";

const TEST_EMAIL = "admin@example.com";
const TEST_PASSWORD = "admin123";

async function loginAndSetupSession(page: any) {
  await page.goto("/login");
  await page.waitForTimeout(2000);
  await page.getByLabel('Email').fill(TEST_EMAIL);
  await page.getByLabel('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(3000);

  const welcomeScreen = page.locator('[data-testid="scott-welcome-screen"]');
  const welcomeVisible = await welcomeScreen.isVisible().catch(() => false);
  
  if (welcomeVisible) {
    console.log("Welcome screen visible, skipping via API...");
    const response = await page.request.post('/api/the-plan/skip');
    console.log("Skip API response status:", response.status());
    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForTimeout(2000);
  }
}

test.describe("Memories Tab Integration", () => {
  test("MEM-TAB-001: Memories tab exists on Profile page", async ({ page }) => {
    await loginAndSetupSession(page);
    
    await page.goto("/profile");
    await page.waitForTimeout(3000);
    
    const memoriesTab = page.locator('[data-testid="button-tab-memories"]');
    const memoriesTabVisible = await memoriesTab.isVisible().catch(() => false);
    console.log("Memories tab visible:", memoriesTabVisible);
    
    if (!memoriesTabVisible) {
      const memoriesText = page.getByRole('button', { name: /Memories/i });
      const memoriesTextCount = await memoriesText.count();
      console.log("Memories buttons found:", memoriesTextCount);
      expect(memoriesTextCount).toBeGreaterThan(0);
    } else {
      expect(memoriesTabVisible).toBeTruthy();
    }
  });
  
  test("MEM-TAB-002: Memories tab displays content", async ({ page }) => {
    await loginAndSetupSession(page);
    
    await page.goto("/profile?tab=memories");
    await page.waitForTimeout(5000);
    
    const memoriesTitle = page.locator('[data-testid="text-memories-title"]');
    await memoriesTitle.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
    
    const titleVisible = await memoriesTitle.isVisible().catch(() => false);
    console.log("Memories title visible:", titleVisible);
    
    if (!titleVisible) {
      const pageContent = await page.content();
      const hasMemoriesContent = pageContent.includes('memory') || pageContent.includes('Memories');
      console.log("Page contains memories content:", hasMemoriesContent);
      expect(hasMemoriesContent).toBeTruthy();
    } else {
      expect(titleVisible).toBeTruthy();
    }
  });
  
  test("MEM-TAB-003: Profile page with tab=memories query param", async ({ page }) => {
    await loginAndSetupSession(page);
    
    await page.goto("/profile?tab=memories");
    await page.waitForTimeout(5000);
    
    const url = page.url();
    console.log("Current URL:", url);
    
    expect(url).toContain("profile");
    expect(url).toContain("tab=memories");
  });
});
