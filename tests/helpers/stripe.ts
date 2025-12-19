import { Page, expect } from '@playwright/test';

/**
 * Stripe Payment Testing Helper
 * Utilities for testing Stripe checkout and payments
 */

export const STRIPE_TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINE: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  REQUIRES_AUTH: '4000002500003155',
  INVALID_CVC: '4000000000000127',
  EXPIRED: '4000000000000069',
};

export async function fillStripeCardDetails(page: Page, cardNumber: string = STRIPE_TEST_CARDS.SUCCESS) {
  // Wait for Stripe iframe to load
  const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
  
  // Fill card number
  await stripeFrame.locator('[placeholder="Card number"]').fill(cardNumber);
  
  // Fill expiry (use future date)
  await stripeFrame.locator('[placeholder="MM / YY"]').fill('12/25');
  
  // Fill CVC
  await stripeFrame.locator('[placeholder="CVC"]').fill('123');
  
  // Fill ZIP code (if present)
  const zipCode = stripeFrame.locator('[placeholder="ZIP"]');
  if (await zipCode.isVisible()) {
    await zipCode.fill('10001');
  }
}

export async function fillBillingAddress(page: Page, address: {
  name?: string;
  email?: string;
  line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}) {
  const defaults = {
    name: 'Test User',
    email: 'test@example.com',
    line1: '123 Test Street',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'US',
  };
  
  const billingData = { ...defaults, ...address };
  
  if (billingData.name) {
    await page.getByTestId('input-billing-name')?.fill(billingData.name).catch(() => {});
  }
  
  if (billingData.email) {
    await page.getByTestId('input-billing-email')?.fill(billingData.email).catch(() => {});
  }
  
  if (billingData.line1) {
    await page.getByTestId('input-billing-address')?.fill(billingData.line1).catch(() => {});
  }
  
  if (billingData.city) {
    await page.getByTestId('input-billing-city')?.fill(billingData.city).catch(() => {});
  }
  
  if (billingData.state) {
    await page.getByTestId('input-billing-state')?.fill(billingData.state).catch(() => {});
  }
  
  if (billingData.postal_code) {
    await page.getByTestId('input-billing-zip')?.fill(billingData.postal_code).catch(() => {});
  }
}

export async function submitPayment(page: Page) {
  await page.getByTestId('button-submit-payment').click();
}

export async function waitForPaymentSuccess(page: Page) {
  // Wait for success page or confirmation
  await page.waitForURL(/\/(success|confirmation|order)/, { timeout: 30000 });
  
  // Verify success message
  await expect(page.getByText(/payment successful|order confirmed/i)).toBeVisible({ timeout: 10000 });
}

export async function verifyPaymentAmount(page: Page, expectedAmount: string) {
  const amountText = await page.getByTestId('text-payment-amount').textContent();
  expect(amountText).toContain(expectedAmount);
}

export async function handleStripe3DSecure(page: Page, authenticate: boolean = true) {
  // Wait for 3D Secure modal
  const modal = page.frameLocator('iframe[name="__privateStripeFrame"]');
  
  if (authenticate) {
    await modal.getByRole('button', { name: 'Complete authentication' }).click();
  } else {
    await modal.getByRole('button', { name: 'Fail authentication' }).click();
  }
}

export async function verifyStripeError(page: Page, errorMessage: string | RegExp) {
  await expect(page.getByText(errorMessage)).toBeVisible({ timeout: 10000 });
}
