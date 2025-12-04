/**
 * PRICING PAGE OBJECT MODEL
 * Handles pricing plans display for all 4 tiers
 */

import { Page, Locator } from '@playwright/test';

export type PlanSlug = 'free-trial' | 'basic' | 'dancer-pro' | 'professional';

export interface PlanDetails {
  name: string;
  slug: PlanSlug;
  price: string;
  period: string;
  features: number;
  isPopular: boolean;
}

export const PRICING_PLANS: PlanDetails[] = [
  {
    name: 'Free Trial',
    slug: 'free-trial',
    price: '$0',
    period: '7 days',
    features: 5,
    isPopular: false,
  },
  {
    name: 'Basic',
    slug: 'basic',
    price: '$4.99',
    period: 'month',
    features: 5,
    isPopular: false,
  },
  {
    name: 'Dancer Pro',
    slug: 'dancer-pro',
    price: '$9.99',
    period: 'month',
    features: 7,
    isPopular: true,
  },
  {
    name: 'Professional',
    slug: 'professional',
    price: '$29.99',
    period: 'month',
    features: 6,
    isPopular: false,
  },
];

export class PricingPage {
  readonly page: Page;
  readonly plansGrid: Locator;

  constructor(page: Page) {
    this.page = page;
    this.plansGrid = page.getByTestId('pricing-plans-grid');
  }

  /**
   * Navigate to pricing page
   */
  async goto(): Promise<void> {
    await this.page.goto('/pricing');
    await this.page.waitForLoadState('domcontentloaded');
    await this.plansGrid.waitFor({ state: 'visible', timeout: 30000 });
  }

  /**
   * Get the card locator for a specific plan
   */
  getPlanCard(slug: PlanSlug): Locator {
    return this.page.getByTestId(`card-plan-${slug}`);
  }

  /**
   * Get the plan name text locator
   */
  getPlanName(slug: PlanSlug): Locator {
    return this.page.getByTestId(`text-plan-name-${slug}`);
  }

  /**
   * Get the plan description text locator
   */
  getPlanDescription(slug: PlanSlug): Locator {
    return this.page.getByTestId(`text-plan-description-${slug}`);
  }

  /**
   * Get the price container locator
   */
  getPrice(slug: PlanSlug): Locator {
    return this.page.getByTestId(`text-price-${slug}`);
  }

  /**
   * Get the price amount locator
   */
  getPriceAmount(slug: PlanSlug): Locator {
    return this.page.getByTestId(`text-price-amount-${slug}`);
  }

  /**
   * Get the price period locator
   */
  getPricePeriod(slug: PlanSlug): Locator {
    return this.page.getByTestId(`text-price-period-${slug}`);
  }

  /**
   * Get the features list locator
   */
  getFeaturesList(slug: PlanSlug): Locator {
    return this.page.getByTestId(`list-features-${slug}`);
  }

  /**
   * Get a specific feature item locator
   */
  getFeatureItem(slug: PlanSlug, index: number): Locator {
    return this.page.getByTestId(`feature-${slug}-${index}`);
  }

  /**
   * Get the CTA button locator
   */
  getCTAButton(slug: PlanSlug): Locator {
    return this.page.getByTestId(`button-cta-${slug}`);
  }

  /**
   * Get the popular badge locator
   */
  getPopularBadge(slug: PlanSlug): Locator {
    return this.page.getByTestId(`badge-popular-${slug}`);
  }

  /**
   * Click the CTA button for a specific plan
   */
  async clickCTA(slug: PlanSlug): Promise<void> {
    await this.getCTAButton(slug).click();
  }

  /**
   * Verify all plan cards are visible
   */
  async verifyAllPlansVisible(): Promise<void> {
    for (const plan of PRICING_PLANS) {
      const card = this.getPlanCard(plan.slug);
      await card.waitFor({ state: 'visible', timeout: 10000 });
    }
  }

  /**
   * Get count of plan cards
   */
  async getPlanCardCount(): Promise<number> {
    const cards = this.page.locator('[data-testid^="card-plan-"]');
    return await cards.count();
  }

  /**
   * Verify plan details match expected values
   */
  async verifyPlanDetails(plan: PlanDetails): Promise<{
    nameVisible: boolean;
    descriptionVisible: boolean;
    priceVisible: boolean;
    priceText: string;
    periodText: string;
    featuresCount: number;
    ctaButtonVisible: boolean;
    popularBadgeVisible: boolean;
  }> {
    return {
      nameVisible: await this.getPlanName(plan.slug).isVisible(),
      descriptionVisible: await this.getPlanDescription(plan.slug).isVisible(),
      priceVisible: await this.getPriceAmount(plan.slug).isVisible(),
      priceText: await this.getPriceAmount(plan.slug).textContent() || '',
      periodText: await this.getPricePeriod(plan.slug).textContent() || '',
      featuresCount: await this.page.locator(`[data-testid^="feature-${plan.slug}-"]`).count(),
      ctaButtonVisible: await this.getCTAButton(plan.slug).isVisible(),
      popularBadgeVisible: plan.isPopular ? await this.getPopularBadge(plan.slug).isVisible() : false,
    };
  }
}
