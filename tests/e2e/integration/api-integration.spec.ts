/**
 * API INTEGRATION TEST
 * Tests REST API endpoints and responses
 */

import { test, expect } from '@playwright/test';

test.describe('Integration - API Endpoints', () => {
  test('should have healthy API status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('should return user data with auth', async ({ request }) => {
    const response = await request.get('/api/users/me', {
      headers: {
        'Authorization': 'Bearer test_token'
      }
    });
    
    expect([200, 401]).toContain(response.status());
  });

  test('should handle CORS correctly', async ({ request }) => {
    const response = await request.get('/api/health');
    const corsHeader = response.headers()['access-control-allow-origin'];
    
    expect(corsHeader).toBeTruthy();
  });

  test('should validate request body', async ({ request }) => {
    const response = await request.post('/api/posts', {
      data: {
        // Missing required fields
      }
    });
    
    expect(response.status()).toBe(400);
  });

  test('should rate limit API requests', async ({ request }) => {
    // Make multiple rapid requests
    const requests = Array(100).fill(null).map(() => 
      request.get('/api/health')
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status() === 429);
    
    // At least one request should be rate limited
    expect(rateLimited).toBe(true);
  });

  test('should return proper error responses', async ({ request }) => {
    const response = await request.get('/api/posts/99999999');
    
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.error).toBeTruthy();
  });

  test('should support JSON content type', async ({ request }) => {
    const response = await request.get('/api/health');
    const contentType = response.headers()['content-type'];
    
    expect(contentType).toContain('application/json');
  });

  test('should include security headers', async ({ request }) => {
    const response = await request.get('/api/health');
    const headers = response.headers();
    
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBeTruthy();
  });
});
