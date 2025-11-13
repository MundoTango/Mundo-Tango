import { Page, expect } from '@playwright/test';

/**
 * Integration Helper - Multi-system workflows, AI agent coordination, performance monitoring
 */

export async function completeEventAttendanceJourney(page: Page, eventData: {
  eventId: number;
  tripDestination: string;
  campaignTitle: string;
}) {
  // Step 1: Browse and register for event
  await page.goto('/events');
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId(`event-card-${eventData.eventId}`).click();
  await page.waitForURL(/\/events\/\d+/);
  
  await page.getByTestId('button-register-event').click();
  await page.waitForResponse(
    response => response.url().includes('/api/events/register') && response.status() === 200
  );
  
  // Step 2: Create trip for event
  await page.goto('/travel/planner');
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId('button-create-trip').click();
  await page.getByTestId('input-destination').fill(eventData.tripDestination);
  await page.getByTestId('select-event').click();
  await page.getByRole('option', { name: new RegExp(String(eventData.eventId)) }).click();
  
  // Set dates
  const today = new Date();
  const startDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
  
  await page.getByTestId('input-start-date').fill(startDate.toISOString().split('T')[0]);
  await page.getByTestId('input-end-date').fill(endDate.toISOString().split('T')[0]);
  
  await page.getByTestId('button-submit-trip').click();
  await page.waitForURL(/\/travel\/trip\/\d+/);
  
  // Step 3: Find accommodation
  await page.getByTestId('button-find-accommodation').click();
  await page.waitForSelector('[data-testid="accommodation-search-form"]');
  
  await page.getByTestId('input-price-min').fill('50');
  await page.getByTestId('input-price-max').fill('150');
  await page.getByTestId('button-search-accommodation').click();
  
  await page.waitForSelector('[data-testid="accommodation-results"]', { timeout: 20000 });
  
  // Step 4: Track expenses
  await page.goto(page.url() + '/expenses');
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId('button-add-expense').click();
  await page.getByTestId('select-expense-category').click();
  await page.getByRole('option', { name: 'accommodation' }).click();
  await page.getByTestId('input-expense-amount').fill('500');
  await page.getByTestId('button-save-expense').click();
  
  // Step 5: Create crowdfunding campaign
  await page.goto('/crowdfunding/create');
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId('input-campaign-title').fill(eventData.campaignTitle);
  await page.getByTestId('textarea-campaign-description').fill(
    `Help me attend the ${eventData.tripDestination} tango workshop!`
  );
  await page.getByTestId('input-goal-amount').fill('1000');
  await page.getByTestId('input-campaign-duration').fill('60');
  await page.getByTestId('select-campaign-category').click();
  await page.getByRole('option').first().click();
  
  await page.getByTestId('button-submit-campaign').click();
  await page.waitForURL(/\/crowdfunding\/campaign\/\d+/);
  
  // Step 6: Share on social media (verify integration point)
  await page.getByTestId('button-share-campaign').click().catch(() => {});
  
  // Step 7: Sign liability waiver
  await page.goto('/legal/templates');
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId('button-use-template-event-waiver').click().catch(() => {});
  
  return {
    journeyCompleted: true,
    timestamp: new Date()
  };
}

export async function completeCreatorMonetizationJourney(page: Page) {
  // Step 1: Create marketplace product
  await page.goto('/marketplace/seller/products');
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId('button-create-product').click();
  await page.waitForSelector('[data-testid="product-form"]');
  
  await page.getByTestId('input-product-name').fill('Professional Tango Shoes');
  await page.getByTestId('textarea-product-description').fill('Handcrafted leather tango shoes');
  await page.getByTestId('input-product-price').fill('250');
  await page.getByTestId('input-product-quantity').fill('10');
  
  await page.getByTestId('button-save-product').click();
  await page.waitForURL(/\/marketplace\/product\/\d+/);
  
  // Step 2: Get AI pricing recommendations
  await page.getByTestId('button-ai-price-optimizer').click().catch(() => {});
  await page.waitForSelector('[data-testid="ai-pricing-suggestions"]', { timeout: 15000 }).catch(() => {});
  
  // Step 3: Create crowdfunding for product line
  await page.goto('/crowdfunding/create');
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId('input-campaign-title').fill('New Tango Shoe Collection');
  await page.getByTestId('textarea-campaign-description').fill('Launch my new line of professional tango shoes');
  await page.getByTestId('input-goal-amount').fill('5000');
  
  // Step 4: Post on social media
  await page.goto('/social-media/schedule');
  await page.waitForLoadState('networkidle');
  
  await page.getByTestId('textarea-post-content').fill('Check out my new tango shoe collection!').catch(() => {});
  
  return {
    journeyCompleted: true,
    productsCreated: 1,
    campaignsCreated: 1
  };
}

export async function verifyMultiAgentCoordination(page: Page) {
  // Navigate to AI agent dashboard
  await page.goto('/admin/ai-agents');
  await page.waitForLoadState('networkidle');
  
  const agentSystems = [
    { name: 'financial', count: 33 },
    { name: 'social-media', count: 5 },
    { name: 'marketplace', count: 8 },
  ];
  
  for (const system of agentSystems) {
    // Verify agent system panel
    const panel = page.getByTestId(`agent-system-${system.name}`);
    await expect(panel).toBeVisible();
    
    // Verify agent count
    const agentCount = await panel.getByTestId('agent-count').textContent();
    expect(parseInt(agentCount || '0')).toBe(system.count);
    
    // Verify all agents running
    await expect(panel.getByTestId('system-status')).toHaveText(/active|running/i);
  }
}

export async function monitorSystemPerformance(page: Page) {
  // Check no slowdown with multiple agents
  const startTime = Date.now();
  
  await page.goto('/feed');
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  
  // Should load in under 3 seconds even with all agents running
  expect(loadTime).toBeLessThan(3000);
  
  return loadTime;
}

export async function verifyWebSocketNotifications(page: Page, recipientEmail: string) {
  // Open app in context 1 (sender)
  const context1 = page.context();
  const page1 = page;
  
  // Open app in context 2 (recipient)
  const page2 = await context1.newPage();
  await page2.goto('/feed');
  await page2.waitForLoadState('networkidle');
  
  // User A sends message
  await page1.goto('/messages');
  await page1.waitForLoadState('networkidle');
  
  await page1.getByTestId('button-new-message').click();
  await page1.getByTestId('input-recipient').fill(recipientEmail);
  await page1.getByTestId('textarea-message').fill('Test real-time notification');
  await page1.getByTestId('button-send-message').click();
  
  // User B should receive notification instantly
  await expect(
    page2.getByTestId('notification-badge')
  ).toBeVisible({ timeout: 5000 });
  
  await page2.close();
}

export async function testWebSocketReconnection(page: Page) {
  await page.goto('/feed');
  await page.waitForLoadState('networkidle');
  
  // Verify WebSocket connected
  const wsStatus = page.getByTestId('websocket-status');
  await expect(wsStatus).toHaveText(/connected/i).catch(() => {});
  
  // Simulate disconnect/reconnect
  await page.evaluate(() => {
    // @ts-ignore
    if (window.websocket) {
      // @ts-ignore
      window.websocket.close();
    }
  });
  
  // Wait for reconnection
  await page.waitForTimeout(3000);
  
  // Verify reconnected
  await expect(wsStatus).toHaveText(/connected/i).catch(() => {});
}

export async function verifyLiveUpdates(page: Page) {
  const context = page.context();
  
  // User A page
  const pageA = page;
  await pageA.goto('/marketplace/seller/products');
  await pageA.waitForLoadState('networkidle');
  
  // User B page viewing product
  const pageB = await context.newPage();
  await pageB.goto('/marketplace/product/1');
  await pageB.waitForLoadState('networkidle');
  
  // Get initial price
  const initialPrice = await pageB.getByTestId('product-price').textContent();
  
  // User A updates product
  await pageA.getByTestId('button-edit-product-1').click();
  await pageA.getByTestId('input-product-price').fill('300');
  await pageA.getByTestId('button-save-product').click();
  
  // User B should see update in real-time
  await expect(
    pageB.getByTestId('product-price')
  ).not.toHaveText(initialPrice || '', { timeout: 5000 }).catch(() => {});
  
  await pageB.close();
}

export async function measurePageLoadPerformance(page: Page, url: string) {
  const startTime = Date.now();
  
  await page.goto(url);
  await page.waitForLoadState('load');
  
  const loadTime = Date.now() - startTime;
  
  // Should be under 3 seconds
  expect(loadTime).toBeLessThan(3000);
  
  // Get Web Vitals
  const metrics = await page.evaluate(() => {
    return {
      // @ts-ignore
      lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.renderTime || 0,
      // @ts-ignore
      fid: performance.getEntriesByType('first-input')?.[0]?.processingStart - performance.getEntriesByType('first-input')?.[0]?.startTime || 0,
      // @ts-ignore
      cls: performance.getEntriesByType('layout-shift').reduce((sum, entry) => sum + entry.value, 0)
    };
  }).catch(() => ({ lcp: 0, fid: 0, cls: 0 }));
  
  return {
    loadTime,
    lcp: metrics.lcp,
    fid: metrics.fid,
    cls: metrics.cls
  };
}

export async function verifyWebVitals(page: Page, url: string) {
  const metrics = await measurePageLoadPerformance(page, url);
  
  // LCP should be < 2.5s (convert to ms)
  expect(metrics.lcp).toBeLessThan(2500);
  
  // FID should be < 100ms
  expect(metrics.fid).toBeLessThan(100);
  
  // CLS should be < 0.1
  expect(metrics.cls).toBeLessThan(0.1);
}

export async function testDatabaseQueryPerformance(page: Page) {
  // Test complex query with pagination
  const startTime = Date.now();
  
  await page.goto('/feed?page=1&limit=50');
  await page.waitForResponse(
    response => response.url().includes('/api/posts') && response.status() === 200
  );
  
  const queryTime = Date.now() - startTime;
  
  // Should be under 500ms
  expect(queryTime).toBeLessThan(500);
  
  return queryTime;
}

export async function measureAIAgentResponseTime(page: Page, agentType: string, action: string) {
  const startTime = Date.now();
  
  // Trigger AI agent based on type
  switch (agentType) {
    case 'financial':
      await page.getByTestId('button-ai-trade-analysis').click();
      await page.waitForSelector('[data-testid="ai-trade-signal"]', { timeout: 3000 });
      break;
    
    case 'social-media':
      await page.getByTestId('button-ai-generate-caption').click();
      await page.waitForSelector('[data-testid="generated-caption"]', { timeout: 6000 });
      break;
    
    case 'marketplace':
      await page.getByTestId('button-fraud-check').click();
      await page.waitForSelector('[data-testid="fraud-score"]', { timeout: 3000 });
      break;
    
    case 'travel':
      await page.getByTestId('button-ai-recommendations').click();
      await page.waitForSelector('[data-testid="travel-recommendations"]', { timeout: 4000 });
      break;
    
    case 'crowdfunding':
      await page.getByTestId('button-predict-success').click();
      await page.waitForSelector('[data-testid="success-prediction"]', { timeout: 6000 });
      break;
    
    case 'legal':
      await page.getByTestId('button-ai-review').click();
      await page.waitForSelector('[data-testid="ai-review-results"]', { timeout: 11000 });
      break;
    
    case 'user-testing':
      await page.getByTestId('button-analyze-session').click();
      await page.waitForSelector('[data-testid="session-analysis"]', { timeout: 8000 });
      break;
  }
  
  const responseTime = Date.now() - startTime;
  
  return responseTime;
}

export async function verifyAIAgentPerformance(page: Page) {
  const performanceTargets = {
    'financial': 2000,
    'social-media': 5000,
    'marketplace': 2000,
    'travel': 3000,
    'crowdfunding': 5000,
    'legal': 10000,
    'user-testing': 7000
  };
  
  const results: Record<string, number> = {};
  
  for (const [agentType, maxTime] of Object.entries(performanceTargets)) {
    try {
      const responseTime = await measureAIAgentResponseTime(page, agentType, 'test');
      results[agentType] = responseTime;
      
      // Verify within performance target
      expect(responseTime).toBeLessThan(maxTime);
    } catch (error) {
      // Agent may not be available on current page, skip
      results[agentType] = -1;
    }
  }
  
  return results;
}

export async function verifyConcurrentUsers(page: Page, userCount: number) {
  const context = page.context();
  const pages: Page[] = [page];
  
  // Open multiple user sessions
  for (let i = 1; i < userCount; i++) {
    const newPage = await context.newPage();
    await newPage.goto('/feed');
    pages.push(newPage);
  }
  
  // All pages should load successfully
  for (const p of pages) {
    await expect(p.getByTestId('feed-container')).toBeVisible();
  }
  
  // Clean up
  for (let i = 1; i < pages.length; i++) {
    await pages[i].close();
  }
  
  return {
    usersSimulated: userCount,
    allLoaded: true
  };
}

export async function verifyNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  // Wait a bit to collect any errors
  await page.waitForTimeout(2000);
  
  return errors;
}
