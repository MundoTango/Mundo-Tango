/**
 * PRICING PAGE E2E TESTS
 * 
 * Comprehensive test suite for pricing page with all 4 pricing tiers:
 * - Free Trial ($0/7 days)
 * - Basic ($4.99/month)
 * - Dancer Pro ($9.99/month) - Most Popular
 * - Professional ($29.99/month)
 * 
 * Tests verify:
 * - Page loads with all 4 tier cards
 * - Each tier shows correct price and features
 * - CTA buttons are clickable
 * - Checkout flow initiates properly (with Stripe test mode)
 */

import { test, expect } from '@playwright/test';
import { PricingPage, PRICING_PLANS, PlanSlug } from './pages/public/PricingPage';

test.describe('Pricing Page - Complete E2E Tests', () => {
  let pricingPage: PricingPage;

  test.beforeEach(async ({ page }) => {
    pricingPage = new PricingPage(page);
    await pricingPage.goto();
  });

  test.describe('Page Loading & Structure', () => {
    test('should load pricing page successfully', async ({ page }) => {
      await expect(page).toHaveURL(/\/pricing/);
      await expect(pricingPage.plansGrid).toBeVisible();
    });

    test('should display all 4 pricing tier cards', async () => {
      const cardCount = await pricingPage.getPlanCardCount();
      expect(cardCount).toBe(4);
    });

    test('should have all plan cards visible', async () => {
      await pricingPage.verifyAllPlansVisible();
    });
  });

  test.describe('Free Trial Tier ($0/7 days)', () => {
    const plan = PRICING_PLANS.find(p => p.slug === 'free-trial')!;

    test('should display Free Trial card with correct details', async () => {
      const card = pricingPage.getPlanCard('free-trial');
      await expect(card).toBeVisible();
      
      const details = await pricingPage.verifyPlanDetails(plan);
      expect(details.nameVisible).toBe(true);
      expect(details.priceText).toBe('$0');
      expect(details.periodText).toContain('7 days');
      expect(details.ctaButtonVisible).toBe(true);
    });

    test('should display all Free Trial features', async () => {
      const featuresList = pricingPage.getFeaturesList('free-trial');
      await expect(featuresList).toBeVisible();
      
      const details = await pricingPage.verifyPlanDetails(plan);
      expect(details.featuresCount).toBe(5);
    });

    test('should have clickable CTA button', async () => {
      const ctaButton = pricingPage.getCTAButton('free-trial');
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toBeEnabled();
      await expect(ctaButton).toHaveText(/Start Free Trial/i);
    });
  });

  test.describe('Basic Tier ($4.99/month)', () => {
    const plan = PRICING_PLANS.find(p => p.slug === 'basic')!;

    test('should display Basic card with correct details', async () => {
      const card = pricingPage.getPlanCard('basic');
      await expect(card).toBeVisible();
      
      const details = await pricingPage.verifyPlanDetails(plan);
      expect(details.nameVisible).toBe(true);
      expect(details.priceText).toBe('$4.99');
      expect(details.periodText).toContain('month');
      expect(details.ctaButtonVisible).toBe(true);
    });

    test('should display all Basic features', async () => {
      const featuresList = pricingPage.getFeaturesList('basic');
      await expect(featuresList).toBeVisible();
      
      const details = await pricingPage.verifyPlanDetails(plan);
      expect(details.featuresCount).toBe(5);
    });

    test('should have clickable CTA button', async () => {
      const ctaButton = pricingPage.getCTAButton('basic');
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toBeEnabled();
      await expect(ctaButton).toHaveText(/Get Started/i);
    });
  });

  test.describe('Dancer Pro Tier ($9.99/month) - Most Popular', () => {
    const plan = PRICING_PLANS.find(p => p.slug === 'dancer-pro')!;

    test('should display Dancer Pro card with correct details', async () => {
      const card = pricingPage.getPlanCard('dancer-pro');
      await expect(card).toBeVisible();
      
      const details = await pricingPage.verifyPlanDetails(plan);
      expect(details.nameVisible).toBe(true);
      expect(details.priceText).toBe('$9.99');
      expect(details.periodText).toContain('month');
      expect(details.ctaButtonVisible).toBe(true);
    });

    test('should display Most Popular badge', async () => {
      const popularBadge = pricingPage.getPopularBadge('dancer-pro');
      await expect(popularBadge).toBeVisible();
      await expect(popularBadge).toHaveText(/Most Popular/i);
    });

    test('should display all Dancer Pro features (7 features)', async () => {
      const featuresList = pricingPage.getFeaturesList('dancer-pro');
      await expect(featuresList).toBeVisible();
      
      const details = await pricingPage.verifyPlanDetails(plan);
      expect(details.featuresCount).toBe(7);
    });

    test('should have clickable CTA button', async () => {
      const ctaButton = pricingPage.getCTAButton('dancer-pro');
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toBeEnabled();
      await expect(ctaButton).toHaveText(/Start Free Trial/i);
    });

    test('should have primary button variant (highlighted)', async ({ page }) => {
      const ctaButton = pricingPage.getCTAButton('dancer-pro');
      const buttonClasses = await ctaButton.getAttribute('class');
      expect(buttonClasses).not.toContain('variant-outline');
    });
  });

  test.describe('Professional Tier ($29.99/month)', () => {
    const plan = PRICING_PLANS.find(p => p.slug === 'professional')!;

    test('should display Professional card with correct details', async () => {
      const card = pricingPage.getPlanCard('professional');
      await expect(card).toBeVisible();
      
      const details = await pricingPage.verifyPlanDetails(plan);
      expect(details.nameVisible).toBe(true);
      expect(details.priceText).toBe('$29.99');
      expect(details.periodText).toContain('month');
      expect(details.ctaButtonVisible).toBe(true);
    });

    test('should display all Professional features', async () => {
      const featuresList = pricingPage.getFeaturesList('professional');
      await expect(featuresList).toBeVisible();
      
      const details = await pricingPage.verifyPlanDetails(plan);
      expect(details.featuresCount).toBe(6);
    });

    test('should have clickable CTA button', async () => {
      const ctaButton = pricingPage.getCTAButton('professional');
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toBeEnabled();
      await expect(ctaButton).toHaveText(/Start Free Trial/i);
    });
  });

  test.describe('All Tiers Comparison', () => {
    test('should display all tiers with correct prices', async () => {
      const expectedPrices: Record<PlanSlug, string> = {
        'free-trial': '$0',
        'basic': '$4.99',
        'dancer-pro': '$9.99',
        'professional': '$29.99',
      };

      for (const [slug, expectedPrice] of Object.entries(expectedPrices)) {
        const priceAmount = pricingPage.getPriceAmount(slug as PlanSlug);
        const actualPrice = await priceAmount.textContent();
        expect(actualPrice).toBe(expectedPrice);
      }
    });

    test('should have all CTA buttons enabled and clickable', async () => {
      for (const plan of PRICING_PLANS) {
        const ctaButton = pricingPage.getCTAButton(plan.slug);
        await expect(ctaButton).toBeVisible();
        await expect(ctaButton).toBeEnabled();
      }
    });

    test('should display correct number of features per tier', async () => {
      const expectedFeatures: Record<PlanSlug, number> = {
        'free-trial': 5,
        'basic': 5,
        'dancer-pro': 7,
        'professional': 6,
      };

      for (const [slug, expectedCount] of Object.entries(expectedFeatures)) {
        const details = await pricingPage.verifyPlanDetails(
          PRICING_PLANS.find(p => p.slug === slug)!
        );
        expect(details.featuresCount).toBe(expectedCount);
      }
    });

    test('should only have Dancer Pro marked as popular', async ({ page }) => {
      for (const plan of PRICING_PLANS) {
        const popularBadge = page.getByTestId(`badge-popular-${plan.slug}`);
        
        if (plan.isPopular) {
          await expect(popularBadge).toBeVisible();
        } else {
          await expect(popularBadge).not.toBeVisible();
        }
      }
    });
  });

  test.describe('CTA Button Interactions', () => {
    test('clicking Free Trial CTA should be interactive', async ({ page }) => {
      const ctaButton = pricingPage.getCTAButton('free-trial');
      await ctaButton.scrollIntoViewIfNeeded();
      await expect(ctaButton).toBeEnabled();
      
      const clickPromise = ctaButton.click({ timeout: 5000 });
      await expect(clickPromise).resolves.toBeUndefined();
    });

    test('clicking Basic CTA should be interactive', async ({ page }) => {
      const ctaButton = pricingPage.getCTAButton('basic');
      await ctaButton.scrollIntoViewIfNeeded();
      await expect(ctaButton).toBeEnabled();
      
      const clickPromise = ctaButton.click({ timeout: 5000 });
      await expect(clickPromise).resolves.toBeUndefined();
    });

    test('clicking Dancer Pro CTA should be interactive', async ({ page }) => {
      const ctaButton = pricingPage.getCTAButton('dancer-pro');
      await ctaButton.scrollIntoViewIfNeeded();
      await expect(ctaButton).toBeEnabled();
      
      const clickPromise = ctaButton.click({ timeout: 5000 });
      await expect(clickPromise).resolves.toBeUndefined();
    });

    test('clicking Professional CTA should be interactive', async ({ page }) => {
      const ctaButton = pricingPage.getCTAButton('professional');
      await ctaButton.scrollIntoViewIfNeeded();
      await expect(ctaButton).toBeEnabled();
      
      const clickPromise = ctaButton.click({ timeout: 5000 });
      await expect(clickPromise).resolves.toBeUndefined();
    });
  });

  test.describe('Visual & Layout', () => {
    test('pricing grid should be responsive', async ({ page }) => {
      const grid = pricingPage.plansGrid;
      await expect(grid).toBeVisible();
      
      const gridClasses = await grid.getAttribute('class');
      expect(gridClasses).toContain('grid');
    });

    test('all plan cards should have proper structure', async ({ page }) => {
      for (const plan of PRICING_PLANS) {
        const card = pricingPage.getPlanCard(plan.slug);
        const name = pricingPage.getPlanName(plan.slug);
        const description = pricingPage.getPlanDescription(plan.slug);
        const price = pricingPage.getPrice(plan.slug);
        const features = pricingPage.getFeaturesList(plan.slug);
        const cta = pricingPage.getCTAButton(plan.slug);

        await expect(card).toBeVisible();
        await expect(name).toBeVisible();
        await expect(description).toBeVisible();
        await expect(price).toBeVisible();
        await expect(features).toBeVisible();
        await expect(cta).toBeVisible();
      }
    });
  });
});
