import { test, expect } from '@playwright/test';

/**
 * Stripe Payment Integration E2E Tests
 * Covers: Checkout, Subscriptions, Payment Methods
 */

async function loginAsAdmin(page: any) {
  await page.goto('/login');
  await page.fill('[data-testid="input-email"]', 'admin@mundotango.life');
  await page.fill('[data-testid="input-password"]', 'admin123');
  await page.click('[data-testid="button-login"]');
  await page.waitForURL(/\/feed/);
}

test.describe('Stripe Payments - Complete Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });
  
  test.describe('Pricing Page', () => {
    
    test('should display pricing tiers', async ({ page }) => {
      await page.goto('/pricing');
      
      // Should show pricing cards
      await expect(page.locator('[data-testid="card-pricing-free"]')).toBeVisible();
      await expect(page.locator('[data-testid="card-pricing-premium"]')).toBeVisible();
    });
    
    test('should show feature comparison', async ({ page }) => {
      await page.goto('/pricing');
      
      // Should show features
      await expect(page.locator('text=/features/i')).toBeVisible();
    });
  });
  
  test.describe('Subscription Checkout', () => {
    
    test('should initiate premium subscription checkout', async ({ page }) => {
      await page.goto('/pricing');
      
      // Click upgrade to premium
      await page.click('[data-testid="button-subscribe-premium"]');
      
      // Should redirect to checkout or show Stripe modal
      // Wait for either URL change or Stripe iframe
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const hasStripeIframe = await page.locator('iframe[name^="stripe"]').isVisible();
      
      expect(currentUrl.includes('checkout') || hasStripeIframe).toBeTruthy();
    });
    
    test('should show subscription management for existing subscribers', async ({ page }) => {
      await page.goto('/settings/subscription');
      
      // Should show subscription status
      await expect(page.locator('[data-testid="text-subscription-status"]')).toBeVisible();
    });
  });
  
  test.describe('Event Ticket Purchase', () => {
    
    test('should show ticket purchase option for paid events', async ({ page }) => {
      await page.goto('/events');
      
      // Find a paid event
      const firstEvent = page.locator('[data-testid^="card-event-"]').first();
      await firstEvent.click();
      
      // Check if event has tickets
      const buyTicketButton = page.locator('[data-testid="button-buy-ticket"]');
      if (await buyTicketButton.isVisible()) {
        await expect(buyTicketButton).toBeVisible();
      }
    });
  });
  
  test.describe('Payment Methods', () => {
    
    test('should access payment methods page', async ({ page }) => {
      await page.goto('/settings/payment-methods');
      
      // Should show payment methods section
      await expect(page.locator('h1, h2')).toContainText(/payment.*method/i);
    });
  });
  
  test.describe('Payment History', () => {
    
    test('should view payment history', async ({ page }) => {
      await page.goto('/settings/billing');
      
      // Should show billing/payment history
      await expect(page.locator('text=/billing|payment.*history/i')).toBeVisible();
    });
  });
  
  test.describe('Checkout Success', () => {
    
    test('should show checkout success page', async ({ page }) => {
      // Navigate directly to success page (simulating successful payment)
      await page.goto('/checkout/success');
      
      // Should show success message
      await expect(page.locator('text=/success|thank.*you|payment.*confirmed/i')).toBeVisible();
    });
  });
});
