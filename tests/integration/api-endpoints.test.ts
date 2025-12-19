import { test, expect } from '@playwright/test';

/**
 * API Integration Tests
 * Tests all critical API endpoints for correctness
 */

const BASE_URL = 'http://localhost:5000';
let authToken: string;

test.describe('API Integration Tests', () => {
  
  test.beforeAll(async () => {
    // Login to get auth token using environment secrets
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life',
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123'
      })
    });
    
    const data = await response.json();
    authToken = data.token;
  });
  
  test.describe('Authentication API', () => {
    
  test('POST /api/auth/register - should register new user', async () => {
      const timestamp = Date.now();
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `testuser${timestamp}@test.com`,
          password: 'SecurePass123!',
          username: `user${timestamp}`,
          fullName: 'Test User'
        })
      });
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.token).toBeDefined();
    });
    
  test('POST /api/auth/login - should login with valid credentials', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life',
          password: process.env.TEST_ADMIN_PASSWORD || 'admin123'
        })
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.token).toBeDefined();
      expect(data.user).toBeDefined();
    });
    
  test('POST /api/auth/login - should fail with invalid credentials', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life',
          password: 'wrongpassword'
        })
      });
      
      expect(response.status).toBe(401);
    });
  });
  
  test.describe('Events API', () => {
    
  test('GET /api/events - should get events list', async () => {
      const response = await fetch(`${BASE_URL}/api/events`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
    
  test('POST /api/events - should create new event', async () => {
      const timestamp = Date.now();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const response = await fetch(`${BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `Test Event ${timestamp}`,
          description: 'Test event description',
          eventDate: futureDate.toISOString(),
          location: 'Test Location',
          eventType: 'milonga',
          capacity: 100
        })
      });
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
    });
  });
  
  test.describe('Housing API', () => {
    
  test('GET /api/housing - should get housing listings', async () => {
      const response = await fetch(`${BASE_URL}/api/housing`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });
  
  test.describe('Posts API', () => {
    
  test('GET /api/posts - should get posts feed', async () => {
      const response = await fetch(`${BASE_URL}/api/posts`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.posts)).toBe(true);
    });
    
  test('POST /api/posts - should create new post', async () => {
      const timestamp = Date.now();
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: `Test post ${timestamp}`,
          visibility: 'public'
        })
      });
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
    });
  });
  
  test.describe('Life CEO API', () => {
    
  test('GET /api/life-ceo/agents - should get all agents', async () => {
      const response = await fetch(`${BASE_URL}/api/life-ceo/agents`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(16);
    });
    
  test('GET /api/life-ceo/insights/daily - should get daily insights', async () => {
      const response = await fetch(`${BASE_URL}/api/life-ceo/insights/daily`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });
  
  test.describe('Admin Workflows API', () => {
    
  test('GET /api/founder-approval/pending - should get pending features', async () => {
      const response = await fetch(`${BASE_URL}/api/founder-approval/pending`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
    
  test('GET /api/safety-reviews/pending - should get pending reviews', async () => {
      const response = await fetch(`${BASE_URL}/api/safety-reviews/pending`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
    
  test('GET /api/support/tickets - should get support tickets', async () => {
      const response = await fetch(`${BASE_URL}/api/support/tickets`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });
  
  test.describe('Protected Routes', () => {
    
  test('should reject requests without auth token', async () => {
      const response = await fetch(`${BASE_URL}/api/posts`);
      
      expect(response.status).toBe(401);
    });
    
  test('should reject requests with invalid token', async () => {
      const response = await fetch(`${BASE_URL}/api/posts`, {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });
      
      expect(response.status).toBe(401);
    });
  });
});
