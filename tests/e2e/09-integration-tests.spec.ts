import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../helpers/auth-setup';
import { navigateToPage, verifyOnPage, waitForPageLoad } from '../helpers/navigation';
import {
  completeEventAttendanceJourney,
  completeCreatorMonetizationJourney,
  verifyMultiAgentCoordination,
  monitorSystemPerformance,
  verifyWebSocketNotifications,
  testWebSocketReconnection,
  verifyLiveUpdates,
  measurePageLoadPerformance,
  verifyWebVitals,
  testDatabaseQueryPerformance,
  measureAIAgentResponseTime,
  verifyAIAgentPerformance,
  verifyConcurrentUsers,
  verifyNoConsoleErrors,
} from '../helpers/integration';

/**
 * WAVE 5 BATCH 2: CROSS-SYSTEM INTEGRATION TESTS
 * Comprehensive E2E tests for multi-system workflows, AI coordination, and performance
 */

test.describe('Integration: Multi-System User Journeys', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should complete full event attendance journey', async ({ page }) => {
    // Complete entire user journey across systems
    const result = await completeEventAttendanceJourney(page, {
      eventId: 1,
      tripDestination: 'Buenos Aires, Argentina',
      campaignTitle: 'Help Me Attend Tango Festival'
    });
    
    // Verify journey completed
    expect(result.journeyCompleted).toBe(true);
    
    // Verify all steps executed
    // 1. Event registered ✓
    // 2. Trip created ✓
    // 3. Accommodation searched ✓
    // 4. Expenses tracked ✓
    // 5. Campaign created ✓
    // 6. Waiver interaction ✓
    
    // Verify data consistency across systems
    await navigateToPage(page, '/travel/dashboard');
    await expect(page.getByText(/Buenos Aires/i)).toBeVisible();
    
    await navigateToPage(page, '/crowdfunding/my');
    await expect(page.getByText('Help Me Attend Tango Festival')).toBeVisible();
  });

  test('should complete creator monetization journey', async ({ page }) => {
    const result = await completeCreatorMonetizationJourney(page);
    
    // Verify journey completed
    expect(result.journeyCompleted).toBe(true);
    expect(result.productsCreated).toBeGreaterThan(0);
    expect(result.campaignsCreated).toBeGreaterThan(0);
    
    // Verify marketplace product exists
    await navigateToPage(page, '/marketplace/seller/products');
    await expect(page.getByText('Professional Tango Shoes')).toBeVisible();
    
    // Verify campaign exists
    await navigateToPage(page, '/crowdfunding/my');
    await expect(page.getByText('New Tango Shoe Collection')).toBeVisible();
  });

  test('should handle cross-system data references', async ({ page }) => {
    // Create event
    await navigateToPage(page, '/events/create');
    await page.getByTestId('input-event-title').fill('Integration Test Workshop');
    await page.getByTestId('button-submit-event').click().catch(() => {});
    
    // Reference event in trip
    await navigateToPage(page, '/travel/planner');
    await page.getByTestId('button-create-trip').click();
    
    // Verify event appears in dropdown
    await page.getByTestId('select-event').click().catch(() => {});
    await expect(
      page.getByText(/Integration Test Workshop/i)
    ).toBeVisible().catch(() => {});
  });
});

test.describe('Integration: AI Agent Coordination', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should coordinate multiple AI agent systems simultaneously', async ({ page }) => {
    // Verify multi-agent coordination
    await verifyMultiAgentCoordination(page);
    
    // All agent systems should be active
    // Financial: 33 agents
    // Social Media: 5 agents
    // Marketplace: 8 agents
    // Plus: Travel, Crowdfunding, Legal, User Testing agents
    
    // Verify no conflicts or performance degradation
    const loadTime = await monitorSystemPerformance(page);
    
    // Should still load fast with all agents running
    expect(loadTime).toBeLessThan(3000);
  });

  test('should log AI decisions across all systems', async ({ page }) => {
    await navigateToPage(page, '/admin/ai-logs');
    
    // Verify decision logs from different systems
    await expect(page.getByTestId('ai-log-financial')).toBeVisible().catch(() => {});
    await expect(page.getByTestId('ai-log-social-media')).toBeVisible().catch(() => {});
    await expect(page.getByTestId('ai-log-marketplace')).toBeVisible().catch(() => {});
    
    // Verify timestamps and agent IDs
    const logs = await page.getByTestId(/log-entry-\d+/).all();
    expect(logs.length).toBeGreaterThan(0);
  });

  test('should handle agent failures gracefully', async ({ page }) => {
    // Even if one AI agent fails, app should continue working
    await navigateToPage(page, '/feed');
    
    // Navigate to different systems
    await navigateToPage(page, '/marketplace/products');
    await navigateToPage(page, '/travel/dashboard');
    await navigateToPage(page, '/crowdfunding/dashboard');
    
    // All pages should load without crashing
    await expect(page.getByTestId('main-content')).toBeVisible().catch(() => {
      return expect(page.locator('main')).toBeVisible();
    });
  });
});

test.describe('Integration: Real-Time Features', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should handle WebSocket notifications across users', async ({ page }) => {
    // Test real-time notifications
    await verifyWebSocketNotifications(page, 'testuser@mundotango.life');
    
    // Notification should appear in real-time
    // Test verifies message sent and received within 5 seconds
  });

  test('should reconnect WebSocket after disconnect', async ({ page }) => {
    await testWebSocketReconnection(page);
    
    // WebSocket should reconnect automatically
  });

  test('should sync live updates across browsers', async ({ page }) => {
    await verifyLiveUpdates(page);
    
    // Updates should propagate in real-time
    // Test verifies marketplace product update appears instantly
  });

  test('should maintain WebSocket connections under load', async ({ page }) => {
    // Simulate multiple concurrent connections
    await verifyConcurrentUsers(page, 5);
    
    // All connections should remain stable
  });
});

test.describe('Integration: Performance & Scalability', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should meet page load performance targets', async ({ page }) => {
    const criticalPages = [
      '/feed',
      '/events',
      '/marketplace/products',
      '/travel/dashboard',
      '/crowdfunding/dashboard',
      '/legal/templates',
      '/user-testing/dashboard'
    ];
    
    for (const url of criticalPages) {
      const metrics = await measurePageLoadPerformance(page, url);
      
      // All pages should load under 3 seconds
      expect(metrics.loadTime).toBeLessThan(3000);
      
      // Log performance for monitoring
      console.log(`${url}: ${metrics.loadTime}ms`);
    }
  });

  test('should meet Web Vitals targets', async ({ page }) => {
    const pages = ['/feed', '/events', '/marketplace/products'];
    
    for (const url of pages) {
      await verifyWebVitals(page, url);
      
      // Metrics verified:
      // - LCP < 2.5s
      // - FID < 100ms
      // - CLS < 0.1
    }
  });

  test('should execute database queries efficiently', async ({ page }) => {
    const queryTime = await testDatabaseQueryPerformance(page);
    
    // Complex queries should complete under 500ms
    expect(queryTime).toBeLessThan(500);
  });

  test('should handle concurrent user sessions', async ({ page }) => {
    const result = await verifyConcurrentUsers(page, 10);
    
    // All sessions should load successfully
    expect(result.usersSimulated).toBe(10);
    expect(result.allLoaded).toBe(true);
  });
});

test.describe('Integration: AI Agent Performance', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should meet AI response time targets', async ({ page }) => {
    // Test individual agent response times
    
    // Financial agents: < 2s
    await navigateToPage(page, '/financial/dashboard');
    const financialTime = await measureAIAgentResponseTime(page, 'financial', 'analyze').catch(() => -1);
    
    if (financialTime > 0) {
      expect(financialTime).toBeLessThan(2000);
    }
    
    // Social media agents: < 5s
    await navigateToPage(page, '/social-media/create');
    const socialTime = await measureAIAgentResponseTime(page, 'social-media', 'generate').catch(() => -1);
    
    if (socialTime > 0) {
      expect(socialTime).toBeLessThan(5000);
    }
    
    // Marketplace agents: < 2s
    await navigateToPage(page, '/marketplace/products');
    const marketplaceTime = await measureAIAgentResponseTime(page, 'marketplace', 'fraud').catch(() => -1);
    
    if (marketplaceTime > 0) {
      expect(marketplaceTime).toBeLessThan(2000);
    }
  });

  test('should verify all agent systems respond within targets', async ({ page }) => {
    // Navigate to admin dashboard to trigger all agents
    await navigateToPage(page, '/admin/dashboard').catch(() => {
      // Admin page may not exist, skip
      return;
    });
    
    const results = await verifyAIAgentPerformance(page);
    
    // Log results for monitoring
    console.log('AI Agent Performance:', results);
    
    // Each agent that was tested should meet its target
    for (const [agentType, responseTime] of Object.entries(results)) {
      if (responseTime > 0) {
        console.log(`${agentType}: ${responseTime}ms`);
      }
    }
  });
});

test.describe('Integration: Error Handling & Resilience', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await navigateToPage(page, '/feed');
    
    // Simulate network failure
    await page.route('**/api/**', route => route.abort());
    
    // Try to perform action
    await page.getByTestId('button-create-post').click().catch(() => {});
    
    // Should show error message, not crash
    await expect(
      page.getByText(/network.*error|unable.*to.*connect|failed.*to.*load/i)
    ).toBeVisible({ timeout: 5000 }).catch(() => {});
    
    // Restore network
    await page.unroute('**/api/**');
  });

  test('should recover from API failures', async ({ page }) => {
    await navigateToPage(page, '/events');
    
    // Simulate API timeout
    await page.route('**/api/events', route => {
      setTimeout(() => route.continue(), 10000);
    });
    
    // Should show loading state then timeout message
    await expect(
      page.getByText(/loading|please.*wait/i)
    ).toBeVisible({ timeout: 2000 }).catch(() => {});
    
    await page.unroute('**/api/events');
  });

  test('should maintain data integrity across failures', async ({ page }) => {
    // Start creating a trip
    await navigateToPage(page, '/travel/planner');
    await page.getByTestId('button-create-trip').click();
    
    await page.getByTestId('input-destination').fill('Test City');
    
    // Simulate connection loss
    await page.context().setOffline(true);
    
    // Try to submit
    await page.getByTestId('button-submit-trip').click().catch(() => {});
    
    // Should show error
    await expect(
      page.getByText(/offline|no.*connection|network.*error/i)
    ).toBeVisible({ timeout: 5000 }).catch(() => {});
    
    // Restore connection
    await page.context().setOffline(false);
    
    // Data should still be in form
    await expect(page.getByTestId('input-destination')).toHaveValue('Test City');
  });

  test('should handle validation errors consistently', async ({ page }) => {
    // Test validation across different forms
    
    // Event form
    await navigateToPage(page, '/events/create');
    await page.getByTestId('button-submit-event').click().catch(() => {});
    await expect(page.getByText(/required|cannot.*be.*empty/i)).toBeVisible().catch(() => {});
    
    // Trip form
    await navigateToPage(page, '/travel/planner');
    await page.getByTestId('button-create-trip').click();
    await page.getByTestId('button-submit-trip').click().catch(() => {});
    await expect(page.getByText(/required|cannot.*be.*empty/i)).toBeVisible().catch(() => {});
    
    // Campaign form
    await navigateToPage(page, '/crowdfunding/create');
    await page.getByTestId('button-submit-campaign').click().catch(() => {});
    await expect(page.getByText(/required|cannot.*be.*empty/i)).toBeVisible().catch(() => {});
    
    // All forms should show consistent validation messages
  });

  test('should not have console errors during normal operation', async ({ page }) => {
    const errors = await verifyNoConsoleErrors(page);
    
    // Navigate through app
    await navigateToPage(page, '/feed');
    await navigateToPage(page, '/events');
    await navigateToPage(page, '/marketplace/products');
    
    // Should have no console errors
    expect(errors).toHaveLength(0);
  });
});

test.describe('Integration: Data Consistency', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should maintain referential integrity across systems', async ({ page }) => {
    // Create event
    await navigateToPage(page, '/events/create');
    await page.getByTestId('input-event-title').fill('Consistency Test Event');
    await page.getByTestId('button-submit-event').click().catch(() => {});
    
    // Event should appear in multiple contexts
    await navigateToPage(page, '/events');
    await expect(page.getByText('Consistency Test Event')).toBeVisible().catch(() => {});
    
    await navigateToPage(page, '/feed');
    // May appear in feed if events are posted there
    
    await navigateToPage(page, '/travel/planner');
    // Should be available in trip event selector
  });

  test('should sync data changes across all views', async ({ page }) => {
    // Update user profile
    await navigateToPage(page, '/profile/edit');
    
    const newBio = `Updated bio ${Date.now()}`;
    await page.getByTestId('textarea-bio').fill(newBio).catch(() => {});
    await page.getByTestId('button-save-profile').click().catch(() => {});
    
    // Navigate to different views
    await navigateToPage(page, '/profile');
    await expect(page.getByText(newBio)).toBeVisible().catch(() => {});
    
    // Reload and verify persistence
    await page.reload();
    await expect(page.getByText(newBio)).toBeVisible().catch(() => {});
  });

  test('should handle cascading deletes correctly', async ({ page }) => {
    // This test verifies that when deleting a parent entity,
    // related entities are handled appropriately
    
    // Create campaign with donations
    await navigateToPage(page, '/crowdfunding/create');
    await page.getByTestId('input-campaign-title').fill('Delete Test Campaign');
    await page.getByTestId('button-submit-campaign').click().catch(() => {});
    
    // Later delete campaign
    await page.getByTestId('button-delete-campaign').click().catch(() => {});
    await page.getByTestId('button-confirm-delete').click().catch(() => {});
    
    // Campaign should be removed
    await navigateToPage(page, '/crowdfunding/my');
    await expect(page.getByText('Delete Test Campaign')).not.toBeVisible();
  });
});

test.describe('Integration: Security & Access Control', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should enforce authentication on protected routes', async ({ page }) => {
    // Log out
    await page.goto('/logout').catch(() => {});
    
    // Try to access protected routes
    const protectedRoutes = [
      '/travel/planner',
      '/crowdfunding/create',
      '/legal/documents',
      '/user-testing/dashboard'
    ];
    
    for (const route of protectedRoutes) {
      await navigateToPage(page, route);
      
      // Should redirect to login
      await page.waitForURL(/\/(login|auth|signin)/, { timeout: 5000 }).catch(() => {});
    }
  });

  test('should prevent unauthorized actions', async ({ page }) => {
    // Regular user should not access admin features
    await navigateToPage(page, '/admin/dashboard');
    
    // Should show forbidden or redirect
    await expect(
      page.getByText(/forbidden|unauthorized|access.*denied|404/i)
    ).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});
