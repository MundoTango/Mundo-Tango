/**
 * CHECKOUT FLOW TEST
 * Tests complete checkout process from cart to payment
 */

import { test, expect } from '@playwright/test';

test.describe('Checkout - Flow', () => {
  test('should view cart', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.getByTestId('cart-container')).toBeVisible();
  });

  test('should update item quantity', async ({ page }) => {
    await page.goto('/checkout');
    await page.getByTestId('button-increase-quantity').first().click();
    await expect(page.getByTestId('item-quantity').first()).toHaveText(/2/);
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/checkout');
    await page.getByTestId('button-remove-item').first().click();
    await expect(page.getByText(/removed/i)).toBeVisible();
  });

  test('should proceed to payment', async ({ page }) => {
    await page.goto('/checkout');
    await page.getByTestId('button-proceed-payment').click();
    await expect(page).toHaveURL(/\/payment/);
  });

  test('should apply discount code', async ({ page }) => {
    await page.goto('/checkout');
    await page.getByTestId('input-discount-code').fill('TEST10');
    await page.getByTestId('button-apply-discount').click();
    await expect(page.getByText(/discount.*applied/i)).toBeVisible();
  });
});
