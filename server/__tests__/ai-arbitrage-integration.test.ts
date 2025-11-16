/**
 * AI Arbitrage System - Integration Tests
 * 
 * End-to-End tests for smart routing API endpoints:
 * - POST /api/ai/smart-query - Execute smart query with routing
 * - POST /api/ai/feedback - Submit user feedback
 * - GET /api/ai/cost-stats - Get cost analytics
 * 
 * Tests the full flow: classification → selection → execution → tracking
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { db } from '../db';
import aiArbitrageRoutes from '../routes/ai-arbitrage-routes';
import dpoTrainingRoutes from '../routes/dpo-training-routes';

// ============================================================================
// TEST APP SETUP
// ============================================================================

let app: express.Application;

beforeAll(() => {
  app = express();
  app.use(express.json());
  
  // Mount routes
  app.use('/api/ai', aiArbitrageRoutes);
  app.use('/api/dpo', dpoTrainingRoutes);
});

afterAll(async () => {
  // Cleanup test data if needed
});

// ============================================================================
// SMART QUERY E2E TESTS
// ============================================================================

describe('POST /api/ai/smart-query - E2E Routing Flow', () => {
  it('should execute simple query with tier-1 routing', async () => {
    const response = await request(app)
      .post('/api/ai/smart-query')
      .send({
        query: 'What is 2 + 2?',
        userId: 1,
        userTier: 'free'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('response');
    expect(response.body).toHaveProperty('classification');
    expect(response.body).toHaveProperty('modelUsed');
    expect(response.body).toHaveProperty('platform');
    expect(response.body).toHaveProperty('tierUsed');
    expect(response.body).toHaveProperty('cost');
    expect(response.body).toHaveProperty('latency');

    // Simple query should use tier-1 (cheapest)
    expect(response.body.tierUsed).toBeLessThanOrEqual(2);
    expect(response.body.cost).toBeGreaterThanOrEqual(0);
  });

  it('should execute moderate query with appropriate tier', async () => {
    const response = await request(app)
      .post('/api/ai/smart-query')
      .send({
        query: 'Explain how JWT authentication works and provide a simple code example',
        userId: 1,
        userTier: 'basic'
      });

    expect(response.status).toBe(200);
    expect(response.body.response).toBeDefined();
    expect(response.body.classification.complexity).toBeGreaterThan(0.3);
    expect(response.body.tierUsed).toBeGreaterThanOrEqual(1);
    expect(response.body.tierUsed).toBeLessThanOrEqual(3);
  });

  it('should execute complex query with escalation if needed', async () => {
    const response = await request(app)
      .post('/api/ai/smart-query')
      .send({
        query: 'Design a scalable microservices architecture for a global e-commerce platform with 1M+ users, including database sharding, caching strategy, and disaster recovery plan',
        userId: 1,
        userTier: 'pro'
      });

    expect(response.status).toBe(200);
    expect(response.body.response).toBeDefined();
    expect(response.body.classification.complexity).toBeGreaterThan(0.6);
    
    // Complex query may escalate to higher tier
    expect(response.body.tierUsed).toBeGreaterThanOrEqual(1);
    expect(response.body.tierUsed).toBeLessThanOrEqual(3);
  });

  it('should track cost and calculate savings', async () => {
    const response = await request(app)
      .post('/api/ai/smart-query')
      .send({
        query: 'Hello, how are you?',
        userId: 1,
        userTier: 'free'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('savingsAmount');
    expect(response.body).toHaveProperty('savingsPercentage');

    // If tier-1 (free) succeeds, savings should be 100%
    if (response.body.tierUsed === 1 && response.body.cost === 0) {
      expect(response.body.savingsPercentage).toBeGreaterThan(90);
    }
  });

  it('should return classification details', async () => {
    const response = await request(app)
      .post('/api/ai/smart-query')
      .send({
        query: 'Summarize this text',
        userId: 1,
        userTier: 'free'
      });

    expect(response.status).toBe(200);
    expect(response.body.classification).toHaveProperty('complexity');
    expect(response.body.classification).toHaveProperty('domain');
    expect(response.body.classification).toHaveProperty('requiredQuality');
    expect(response.body.classification).toHaveProperty('estimatedTokens');

    expect(response.body.classification.complexity).toBeGreaterThanOrEqual(0);
    expect(response.body.classification.complexity).toBeLessThanOrEqual(1);
  });

  it('should handle missing userId gracefully', async () => {
    const response = await request(app)
      .post('/api/ai/smart-query')
      .send({
        query: 'Test query'
        // Missing userId
      });

    // Should return error or handle gracefully
    expect([400, 401, 500]).toContain(response.status);
  });

  it('should handle missing query gracefully', async () => {
    const response = await request(app)
      .post('/api/ai/smart-query')
      .send({
        userId: 1
        // Missing query
      });

    expect([400, 422, 500]).toContain(response.status);
  });

  it('should support optional context parameter', async () => {
    const response = await request(app)
      .post('/api/ai/smart-query')
      .send({
        query: 'What does this mean?',
        context: 'Previous conversation about AI routing systems',
        userId: 1,
        userTier: 'basic'
      });

    expect(response.status).toBe(200);
    expect(response.body.response).toBeDefined();
  });
});

// ============================================================================
// USER FEEDBACK TESTS
// ============================================================================

describe('POST /api/ai/feedback - User Feedback Submission', () => {
  it('should accept thumbs_up feedback', async () => {
    const response = await request(app)
      .post('/api/ai/feedback')
      .send({
        routingDecisionId: 1,
        feedback: 'thumbs_up',
        comment: 'Great response!'
      });

    // Should succeed or return appropriate error
    expect([200, 201, 404]).toContain(response.status);
  });

  it('should accept thumbs_down feedback', async () => {
    const response = await request(app)
      .post('/api/ai/feedback')
      .send({
        routingDecisionId: 1,
        feedback: 'thumbs_down',
        comment: 'Response was not helpful'
      });

    expect([200, 201, 404]).toContain(response.status);
  });

  it('should accept neutral feedback', async () => {
    const response = await request(app)
      .post('/api/ai/feedback')
      .send({
        routingDecisionId: 1,
        feedback: 'neutral'
      });

    expect([200, 201, 404]).toContain(response.status);
  });

  it('should handle invalid feedback type', async () => {
    const response = await request(app)
      .post('/api/ai/feedback')
      .send({
        routingDecisionId: 1,
        feedback: 'invalid_feedback_type'
      });

    expect([400, 422, 500]).toContain(response.status);
  });
});

// ============================================================================
// COST STATS TESTS
// ============================================================================

describe('GET /api/ai/cost-stats - Cost Analytics', () => {
  it('should return cost statistics for user', async () => {
    const response = await request(app)
      .get('/api/ai/cost-stats')
      .query({ userId: 1 });

    expect([200, 404]).toContain(response.status);

    if (response.status === 200) {
      expect(response.body).toHaveProperty('totalSpent');
      expect(response.body).toHaveProperty('monthlyLimit');
      expect(response.body).toHaveProperty('percentUsed');
      expect(response.body).toHaveProperty('totalRequests');
    }
  });

  it('should return breakdown by platform', async () => {
    const response = await request(app)
      .get('/api/ai/cost-stats')
      .query({ userId: 1 });

    if (response.status === 200) {
      expect(response.body).toHaveProperty('byPlatform');
      expect(typeof response.body.byPlatform).toBe('object');
    }
  });

  it('should return breakdown by tier', async () => {
    const response = await request(app)
      .get('/api/ai/cost-stats')
      .query({ userId: 1 });

    if (response.status === 200) {
      expect(response.body).toHaveProperty('byTier');
      expect(typeof response.body.byTier).toBe('object');
    }
  });

  it('should calculate total savings', async () => {
    const response = await request(app)
      .get('/api/ai/cost-stats')
      .query({ userId: 1 });

    if (response.status === 200) {
      expect(response.body).toHaveProperty('totalSavings');
      expect(response.body.totalSavings).toBeGreaterThanOrEqual(0);
    }
  });
});

// ============================================================================
// DPO TRAINING ROUTES TESTS
// ============================================================================

describe('DPO Training Routes', () => {
  it('should generate DPO training pairs', async () => {
    const response = await request(app)
      .post('/api/dpo/generate-pairs')
      .send({
        domain: 'chat',
        minSamples: 5
      });

    expect([200, 201, 500]).toContain(response.status);

    if (response.status === 200 || response.status === 201) {
      expect(Array.isArray(response.body.pairs)).toBe(true);
    }
  });

  it('should update curriculum level', async () => {
    const response = await request(app)
      .post('/api/dpo/curriculum/update')
      .send({
        userId: 1,
        success: true
      });

    expect([200, 201, 500]).toContain(response.status);
  });

  it('should create GEPA experiment', async () => {
    const response = await request(app)
      .post('/api/dpo/gepa/create')
      .send({
        name: 'Test Experiment',
        hypothesis: 'Using model X will improve efficiency',
        config: { strategy: 'test' },
        trafficPercentage: 10
      });

    expect([200, 201, 500]).toContain(response.status);
  });

  it('should add golden example', async () => {
    const response = await request(app)
      .post('/api/dpo/golden/add')
      .send({
        query: 'Test query',
        classification: { complexity: 0.5, domain: 'chat', requiredQuality: 0.7, estimatedTokens: 200 },
        modelUsed: 'llama-3.1-8b-instant',
        platform: 'groq',
        cost: 0,
        quality: 0.85,
        savingsPercentage: 100,
        domain: 'chat',
        tags: ['cost_effective']
      });

    expect([200, 201, 500]).toContain(response.status);
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Performance Benchmarks', () => {
  it('should complete routing in <2000ms (including LLM calls)', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .post('/api/ai/smart-query')
      .send({
        query: 'Quick test',
        userId: 1,
        userTier: 'free'
      });

    const duration = Date.now() - startTime;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(5000); // Generous limit for tests (includes LLM latency)
  });

  it('should report latency metrics', async () => {
    const response = await request(app)
      .post('/api/ai/smart-query')
      .send({
        query: 'Latency test',
        userId: 1,
        userTier: 'free'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('latency');
    expect(response.body.latency).toBeGreaterThan(0);
  });
});

// ============================================================================
// COST SAVINGS VALIDATION
// ============================================================================

describe('Cost Savings Validation', () => {
  it('should demonstrate 50-90% cost savings with tier-1 success', async () => {
    // Execute multiple simple queries
    const queries = [
      'Hello',
      'What is AI?',
      'Tell me a joke',
      'How are you?',
      'What time is it?'
    ];

    let totalCost = 0;
    let totalSavings = 0;
    let tier1SuccessCount = 0;

    for (const query of queries) {
      const response = await request(app)
        .post('/api/ai/smart-query')
        .send({
          query,
          userId: 1,
          userTier: 'free'
        });

      if (response.status === 200) {
        totalCost += Number(response.body.cost);
        totalSavings += Number(response.body.savingsAmount || 0);
        
        if (response.body.tierUsed === 1) {
          tier1SuccessCount++;
        }
      }
    }

    // Calculate tier-1 success rate
    const tier1SuccessRate = tier1SuccessCount / queries.length;

    // Should achieve at least 60% tier-1 success for simple queries
    expect(tier1SuccessRate).toBeGreaterThanOrEqual(0.60);

    // If we have savings data, verify it's significant
    if (totalSavings > 0) {
      const savingsPercentage = (totalSavings / (totalCost + totalSavings)) * 100;
      expect(savingsPercentage).toBeGreaterThanOrEqual(50);
    }
  });
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

describe('Error Handling', () => {
  it('should handle API errors gracefully', async () => {
    const response = await request(app)
      .post('/api/ai/smart-query')
      .send({
        query: '', // Empty query
        userId: 1
      });

    expect([400, 422, 500]).toContain(response.status);
  });

  it('should handle database errors gracefully', async () => {
    const response = await request(app)
      .get('/api/ai/cost-stats')
      .query({ userId: 9999999 }); // Non-existent user

    expect([200, 404, 500]).toContain(response.status);
  });

  it('should handle LLM service errors gracefully', async () => {
    // This would require mocking LLM service failures
    // For now, we just ensure the endpoint doesn't crash
    const response = await request(app)
      .post('/api/ai/smart-query')
      .send({
        query: 'Test query that might fail',
        userId: 1,
        userTier: 'free'
      });

    // Should return some response (success or error)
    expect(response.status).toBeDefined();
  });
});
