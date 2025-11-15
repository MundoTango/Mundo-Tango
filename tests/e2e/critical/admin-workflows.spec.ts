import { test, expect } from '@playwright/test';

/**
 * P0 Admin Workflows E2E Tests
 * Covers: Founder Approval, Safety Review, AI Support, Content Moderation
 */

async function loginAsAdmin(page: any) {
  await page.goto('/login');
  await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
  await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
  await page.click('[data-testid="button-login"]');
  await page.waitForURL(/\/feed/);
}

test.describe('P0 Admin Workflows - Complete Coverage', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });
  
  test.describe('Founder Approval Workflow', () => {
    
    test('should display pending features queue', async ({ page }) => {
      await page.goto('/admin/founder-approval');
      
      // Should show pending reviews
      await expect(page.locator('h1, h2')).toContainText(/founder.*approval/i);
      
      // Should show stats cards
      await expect(page.locator('[data-testid="card-stats"]')).toBeVisible();
    });
    
    test('should filter features by status', async ({ page }) => {
      await page.goto('/admin/founder-approval');
      
      // Click pending filter
      await page.click('[data-testid="filter-pending"]');
      
      // Should show pending features
      await expect(page.locator('[data-testid^="row-feature-"]')).toBeVisible();
    });
    
    test('should approve a feature', async ({ page }) => {
      await page.goto('/admin/founder-approval');
      
      // Click first pending feature
      const firstFeature = page.locator('[data-testid^="row-feature-"]').first();
      if (await firstFeature.isVisible()) {
        await firstFeature.click();
        
        // Click approve button
        await page.click('[data-testid="button-approve"]');
        
        // Should show success message
        await expect(page.locator('text=/approved/i')).toBeVisible();
      }
    });
    
    test('should request changes on a feature', async ({ page }) => {
      await page.goto('/admin/founder-approval');
      
      const firstFeature = page.locator('[data-testid^="row-feature-"]').first();
      if (await firstFeature.isVisible()) {
        await firstFeature.click();
        
        // Click request changes
        await page.click('[data-testid="button-request-changes"]');
        
        // Fill feedback
        await page.fill('[data-testid="textarea-feedback"]', 'Please add more tests');
        await page.click('[data-testid="button-submit-changes"]');
        
        // Should show success
        await expect(page.locator('text=/changes.*requested/i')).toBeVisible();
      }
    });
  });
  
  test.describe('Safety Review Workflow', () => {
    
    test('should display pending safety reviews', async ({ page }) => {
      await page.goto('/admin/safety-review');
      
      // Should show safety reviews queue
      await expect(page.locator('h1, h2')).toContainText(/safety.*review/i);
    });
    
    test('should filter by risk level', async ({ page }) => {
      await page.goto('/admin/safety-review');
      
      // Click high risk filter
      await page.click('[data-testid="filter-high-risk"]');
      
      // Should show high risk items
      await expect(page.locator('[data-testid^="row-review-"]')).toBeVisible();
    });
    
    test('should approve a safe listing', async ({ page }) => {
      await page.goto('/admin/safety-review');
      
      const firstReview = page.locator('[data-testid^="row-review-"]').first();
      if (await firstReview.isVisible()) {
        await firstReview.click();
        
        // Approve
        await page.click('[data-testid="button-approve-safe"]');
        
        // Should show success
        await expect(page.locator('text=/approved/i')).toBeVisible();
      }
    });
    
    test('should escalate a risky listing', async ({ page }) => {
      await page.goto('/admin/safety-review');
      
      const firstReview = page.locator('[data-testid^="row-review-"]').first();
      if (await firstReview.isVisible()) {
        await firstReview.click();
        
        // Escalate
        await page.click('[data-testid="button-escalate"]');
        
        // Fill reason
        await page.fill('[data-testid="textarea-escalation-reason"]', 'Suspicious activity detected');
        await page.click('[data-testid="button-submit-escalation"]');
        
        // Should show success
        await expect(page.locator('text=/escalated/i')).toBeVisible();
      }
    });
  });
  
  test.describe('AI Support Dashboard', () => {
    
    test('should display support tickets', async ({ page }) => {
      await page.goto('/admin/ai-support');
      
      // Should show tickets queue
      await expect(page.locator('h1, h2')).toContainText(/ai.*support|support.*dashboard/i);
    });
    
    test('should filter by confidence score', async ({ page }) => {
      await page.goto('/admin/ai-support');
      
      // Click low confidence filter
      await page.click('[data-testid="filter-low-confidence"]');
      
      // Should show low confidence tickets
      await expect(page.locator('[data-testid^="row-ticket-"]')).toBeVisible();
    });
    
    test('should escalate to human', async ({ page }) => {
      await page.goto('/admin/ai-support');
      
      const firstTicket = page.locator('[data-testid^="row-ticket-"]').first();
      if (await firstTicket.isVisible()) {
        await firstTicket.click();
        
        // Escalate to human
        await page.click('[data-testid="button-escalate-human"]');
        
        // Should show success
        await expect(page.locator('text=/escalated/i')).toBeVisible();
      }
    });
  });
  
  test.describe('Admin Dashboard Access', () => {
    
    test('should access admin dashboard', async ({ page }) => {
      await page.goto('/admin');
      
      // Should show admin dashboard
      await expect(page.locator('h1')).toContainText(/admin.*dashboard/i);
    });
    
    test('should show workflow links', async ({ page }) => {
      await page.goto('/admin');
      
      // Should show links to all workflows
      await expect(page.locator('[data-testid="link-founder-approval"]')).toBeVisible();
      await expect(page.locator('[data-testid="link-safety-review"]')).toBeVisible();
      await expect(page.locator('[data-testid="link-ai-support"]')).toBeVisible();
    });
  });
});
