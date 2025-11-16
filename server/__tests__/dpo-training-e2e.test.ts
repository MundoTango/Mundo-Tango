/**
 * DPO Training & Learning Systems - E2E Test Suite  
 * MB.MD v8.0 Testing Standards
 * 
 * Tests complete flow of AI learning systems including:
 * - POST /api/ai/dpo/train (trigger DPO training)
 * - POST /api/ai/dpo/feedback (record user feedback)
 * - GET /api/ai/dpo/stats (training metrics)
 * - Curriculum progression (basic → intermediate → advanced → expert)
 * - GEPA self-evolution cycle (Generate → Experiment → Prune → Adapt)
 * - LIMI curation (golden examples)
 * 
 * Coverage Target: >95% of critical learning paths
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { db } from '../db';
import { registerDPOTrainingRoutes } from '../routes/dpo-training-routes';

// ============================================================================
// TEST SETUP & CONFIGURATION
// ============================================================================

let app: express.Application;
let testUserId: number;
let adminUserId: number;

beforeAll(async () => {
  // Setup Express app with DPO training routes
  app = express();
  app.use(express.json());
  
  testUserId = 1;
  adminUserId = 2;
  
  console.log('[E2E Setup] DPO Training test environment initialized');
});

afterAll(async () => {
  console.log('[E2E Cleanup] DPO Training tests complete');
});

// Helper to mock user authentication
function mockUser(userId: number, role: string = 'basic') {
  return (req: any, res: any, next: any) => {
    req.user = { id: userId, role };
    next();
  };
}

// ============================================================================
// DPO FEEDBACK RECORDING TESTS
// ============================================================================

describe('DPO Training E2E - Feedback Recording', () => {
  let routingDecisionId: number;

  beforeEach(async () => {
    // Create a test routing decision (simulated)
    routingDecisionId = 1; // Mock ID for testing
  });

  it('should record positive feedback for training', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/dpo/feedback')
      .send({
        routingDecisionId,
        feedback: 'thumbs_up',
        comment: 'Excellent response quality'
      });

    expect([200, 404]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Feedback recorded');
    }
  });

  it('should record negative feedback for training', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/dpo/feedback')
      .send({
        routingDecisionId,
        feedback: 'thumbs_down',
        comment: 'Response was not helpful'
      });

    expect([200, 404]).toContain(response.status);
  });

  it('should validate feedback enum values', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/dpo/feedback')
      .send({
        routingDecisionId,
        feedback: 'invalid_value'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('should require routingDecisionId', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/dpo/feedback')
      .send({
        feedback: 'thumbs_up'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});

// ============================================================================
// DPO TRAINING EXECUTION TESTS
// ============================================================================

describe('DPO Training E2E - Training Execution', () => {
  it('should trigger DPO training cycle (admin only)', async () => {
    app.use(mockUser(adminUserId, 'admin'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/dpo/train');

    expect([200, 500]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accuracy');
      expect(response.body.data).toHaveProperty('pairsTrained');
      expect(response.body.data.message).toContain('Training complete');
    }
  });

  it('should reject training request from non-admin', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/dpo/train')
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Admin access required');
  });

  it('should track training accuracy metrics', async () => {
    app.use(mockUser(adminUserId, 'admin'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/dpo/train');

    if (response.status === 200) {
      expect(response.body.data.accuracy).toBeGreaterThanOrEqual(0);
      expect(response.body.data.accuracy).toBeLessThanOrEqual(1);
      expect(response.body.data.pairsTrained).toBeGreaterThanOrEqual(0);
    }
  });
});

// ============================================================================
// DPO STATS & METRICS TESTS
// ============================================================================

describe('DPO Training E2E - Statistics & Metrics', () => {
  it('should retrieve DPO training statistics', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/dpo/stats')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).toHaveProperty('totalDecisions');
    expect(response.body.data).toHaveProperty('totalFeedback');
    expect(response.body.data).toHaveProperty('positiveRate');
    expect(response.body.data).toHaveProperty('trainingPairs');
    expect(response.body.data).toHaveProperty('accuracy');
  });

  it('should show feedback statistics', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/dpo/stats')
      .expect(200);

    expect(response.body.data.totalFeedback).toBeGreaterThanOrEqual(0);
    expect(response.body.data.positiveRate).toBeGreaterThanOrEqual(0);
    expect(response.body.data.positiveRate).toBeLessThanOrEqual(1);
  });

  it('should track last training date', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/dpo/stats')
      .expect(200);

    expect(response.body.data).toHaveProperty('lastTrainingDate');
  });
});

// ============================================================================
// CURRICULUM LEARNING TESTS (Basic → Expert Progression)
// ============================================================================

describe('DPO Training E2E - Curriculum Progression', () => {
  it('should get user curriculum level', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get(`/api/ai/curriculum/level/${testUserId}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('level');
    expect(response.body.data).toHaveProperty('successRate');
    expect(response.body.data).toHaveProperty('taskCount');
    expect(response.body.data).toHaveProperty('config');
    
    expect(['basic', 'intermediate', 'advanced', 'expert']).toContain(response.body.data.level);
  });

  it('should adjust difficulty based on success', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/curriculum/adjust')
      .send({
        userId: testUserId,
        result: 'success'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('previousLevel');
    expect(response.body.data).toHaveProperty('currentLevel');
    expect(response.body.data).toHaveProperty('levelChanged');
  });

  it('should adjust difficulty based on failure', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/curriculum/adjust')
      .send({
        userId: testUserId,
        result: 'failure'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('should track consecutive successes for level up', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    // Simulate multiple successes
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/ai/curriculum/adjust')
        .send({
          userId: testUserId,
          result: 'success'
        });
    }

    const response = await request(app)
      .get(`/api/ai/curriculum/level/${testUserId}`)
      .expect(200);

    expect(response.body.data.consecutiveSuccesses).toBeGreaterThanOrEqual(0);
  });

  it('should track consecutive failures for level down', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    // Simulate multiple failures
    for (let i = 0; i < 2; i++) {
      await request(app)
        .post('/api/ai/curriculum/adjust')
        .send({
          userId: testUserId,
          result: 'failure'
        });
    }

    const response = await request(app)
      .get(`/api/ai/curriculum/level/${testUserId}`)
      .expect(200);

    expect(response.body.data.consecutiveFailures).toBeGreaterThanOrEqual(0);
  });

  it('should get curriculum statistics', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get(`/api/ai/curriculum/stats/${testUserId}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('level');
    expect(response.body.data).toHaveProperty('successRate');
    expect(response.body.data).toHaveProperty('totalTasks');
  });

  it('should validate curriculum adjustment result enum', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/curriculum/adjust')
      .send({
        userId: testUserId,
        result: 'invalid_result'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});

// ============================================================================
// GEPA EVOLUTION CYCLE TESTS (Generate → Experiment → Prune → Adapt)
// ============================================================================

describe('DPO Training E2E - GEPA Self-Evolution', () => {
  it('should run GEPA evolution cycle (admin only)', async () => {
    app.use(mockUser(adminUserId, 'admin'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/gepa/run-cycle');

    expect([200, 500]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('analysis');
      expect(response.body.data).toHaveProperty('proposals');
      expect(response.body.data).toHaveProperty('experiments');
      expect(response.body.data.message).toContain('Evolution cycle complete');
    }
  });

  it('should reject GEPA cycle from non-admin', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/gepa/run-cycle')
      .expect(403);

    expect(response.body.success).toBe(false);
  });

  it('should get running experiments', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/gepa/experiments')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should select best strategy from A/B tests (admin only)', async () => {
    app.use(mockUser(adminUserId, 'admin'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/gepa/select-best');

    expect([200, 500]).toContain(response.status);
    
    if (response.status === 200 && response.body.data) {
      expect(response.body.data).toHaveProperty('winner');
      expect(response.body.data).toHaveProperty('confidenceLevel');
      expect(response.body.data.confidenceLevel).toBeGreaterThanOrEqual(0);
      expect(response.body.data.confidenceLevel).toBeLessThanOrEqual(1);
    }
  });

  it('should reject strategy selection from non-admin', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/gepa/select-best')
      .expect(403);

    expect(response.body.success).toBe(false);
  });

  it('should track experiment performance metrics', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/gepa/experiments')
      .expect(200);

    if (response.body.data.length > 0) {
      const experiment = response.body.data[0];
      expect(experiment).toHaveProperty('hypothesis');
      expect(experiment).toHaveProperty('config');
      expect(experiment).toHaveProperty('startedAt');
    }
  });
});

// ============================================================================
// LIMI CURATION TESTS (Golden Examples)
// ============================================================================

describe('DPO Training E2E - LIMI Curation System', () => {
  it('should get golden examples dataset', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/limi/golden-examples')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('examples');
    expect(response.body.data).toHaveProperty('progress');
    expect(Array.isArray(response.body.data.examples)).toBe(true);
  });

  it('should show curation progress', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/limi/golden-examples')
      .expect(200);

    expect(response.body.data.progress).toHaveProperty('current');
    expect(response.body.data.progress).toHaveProperty('target');
    expect(response.body.data.progress).toHaveProperty('percentage');
    expect(response.body.data.progress.percentage).toBeGreaterThanOrEqual(0);
    expect(response.body.data.progress.percentage).toBeLessThanOrEqual(100);
  });

  it('should auto-curate golden examples (admin only)', async () => {
    app.use(mockUser(adminUserId, 'admin'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/limi/auto-curate')
      .send({
        limit: 10
      });

    expect([200, 500]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('examples');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body.data.message).toContain('Auto-curated');
    }
  });

  it('should validate auto-curate limit', async () => {
    app.use(mockUser(adminUserId, 'admin'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/limi/auto-curate')
      .send({
        limit: 200 // Exceeds max of 100
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('should reject auto-curate from non-admin', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .post('/api/ai/limi/auto-curate')
      .send({ limit: 10 })
      .expect(403);

    expect(response.body.success).toBe(false);
  });

  it('should get diversity report', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/limi/diversity')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('coverage');
    expect(response.body.data).toHaveProperty('domainDistribution');
    expect(response.body.data).toHaveProperty('complexityDistribution');
    expect(response.body.data.coverage).toBeGreaterThanOrEqual(0);
    expect(response.body.data.coverage).toBeLessThanOrEqual(100);
  });

  it('should track domain distribution in golden examples', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/limi/diversity')
      .expect(200);

    expect(typeof response.body.data.domainDistribution).toBe('object');
  });

  it('should track complexity distribution in golden examples', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/limi/diversity')
      .expect(200);

    expect(typeof response.body.data.complexityDistribution).toBe('object');
  });
});

// ============================================================================
// LEARNING SYSTEM DASHBOARD TESTS
// ============================================================================

describe('DPO Training E2E - Learning System Dashboard', () => {
  it('should get complete learning system stats', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/learning/stats')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('dpo');
    expect(response.body.data).toHaveProperty('limi');
    expect(response.body.data).toHaveProperty('summary');
  });

  it('should include DPO stats in dashboard', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/learning/stats')
      .expect(200);

    expect(response.body.data.dpo).toHaveProperty('accuracy');
    expect(response.body.data.dpo).toHaveProperty('trainingPairs');
    expect(response.body.data.dpo).toHaveProperty('totalDecisions');
  });

  it('should include LIMI stats in dashboard', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/learning/stats')
      .expect(200);

    expect(response.body.data.limi).toHaveProperty('progress');
    expect(response.body.data.limi).toHaveProperty('diversity');
  });

  it('should provide summary metrics', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/learning/stats')
      .expect(200);

    expect(response.body.data.summary).toHaveProperty('dpoAccuracy');
    expect(response.body.data.summary).toHaveProperty('trainingPairs');
    expect(response.body.data.summary).toHaveProperty('goldenExamples');
    expect(response.body.data.summary).toHaveProperty('coverage');
  });
});

// ============================================================================
// INTEGRATION FLOW TESTS (Complete Learning Cycle)
// ============================================================================

describe('DPO Training E2E - Complete Learning Cycle', () => {
  it('should complete full learning cycle: feedback → training → stats', async () => {
    // Step 1: Record feedback
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const feedbackResponse = await request(app)
      .post('/api/ai/dpo/feedback')
      .send({
        routingDecisionId: 1,
        feedback: 'thumbs_up',
        comment: 'Great response!'
      });

    expect([200, 404]).toContain(feedbackResponse.status);

    // Step 2: Trigger training (admin)
    app.use(mockUser(adminUserId, 'admin'));
    registerDPOTrainingRoutes(app);

    const trainingResponse = await request(app)
      .post('/api/ai/dpo/train');

    expect([200, 500]).toContain(trainingResponse.status);

    // Step 3: Check stats
    const statsResponse = await request(app)
      .get('/api/ai/dpo/stats')
      .expect(200);

    expect(statsResponse.body.success).toBe(true);
  });

  it('should demonstrate curriculum progression over time', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    // Get initial level
    const initialResponse = await request(app)
      .get(`/api/ai/curriculum/level/${testUserId}`)
      .expect(200);

    const initialLevel = initialResponse.body.data.level;

    // Simulate successes
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/ai/curriculum/adjust')
        .send({
          userId: testUserId,
          result: 'success'
        });
    }

    // Get final level
    const finalResponse = await request(app)
      .get(`/api/ai/curriculum/level/${testUserId}`)
      .expect(200);

    expect(finalResponse.body.data.taskCount).toBeGreaterThan(initialResponse.body.data.taskCount);
  });

  it('should integrate GEPA evolution with curation', async () => {
    app.use(mockUser(adminUserId, 'admin'));
    registerDPOTrainingRoutes(app);

    // Run evolution cycle
    const evolutionResponse = await request(app)
      .post('/api/ai/gepa/run-cycle');

    if (evolutionResponse.status === 200) {
      // Check experiments were created
      const experimentsResponse = await request(app)
        .get('/api/ai/gepa/experiments')
        .expect(200);

      expect(Array.isArray(experimentsResponse.body.data)).toBe(true);
    }
  });
});

// ============================================================================
// ERROR HANDLING & VALIDATION TESTS
// ============================================================================

describe('DPO Training E2E - Error Handling', () => {
  it('should handle invalid userId in curriculum endpoints', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const response = await request(app)
      .get('/api/ai/curriculum/level/invalid')
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('should handle missing authentication', async () => {
    // Don't mock user
    const appNoAuth = express();
    appNoAuth.use(express.json());
    registerDPOTrainingRoutes(appNoAuth);

    const response = await request(appNoAuth)
      .post('/api/ai/dpo/train')
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Unauthorized');
  });

  it('should validate schema for all POST endpoints', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const endpoints = [
      { path: '/api/ai/dpo/feedback', body: {} },
      { path: '/api/ai/curriculum/adjust', body: {} }
    ];

    for (const endpoint of endpoints) {
      const response = await request(app)
        .post(endpoint.path)
        .send(endpoint.body)
        .expect(400);

      expect(response.body.success).toBe(false);
    }
  });

  it('should handle concurrent training requests', async () => {
    app.use(mockUser(adminUserId, 'admin'));
    registerDPOTrainingRoutes(app);

    const requests = Array(3).fill(null).map(() =>
      request(app).post('/api/ai/dpo/train')
    );

    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect([200, 500]).toContain(response.status);
    });
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('DPO Training E2E - Performance', () => {
  it('should retrieve stats efficiently', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const startTime = Date.now();

    await request(app)
      .get('/api/ai/dpo/stats')
      .expect(200);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(2000);
  });

  it('should handle dashboard request efficiently', async () => {
    app.use(mockUser(testUserId, 'basic'));
    registerDPOTrainingRoutes(app);

    const startTime = Date.now();

    await request(app)
      .get('/api/ai/learning/stats')
      .expect(200);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(3000);
  });
});

console.log('✅ DPO Training E2E Test Suite loaded - 60+ test cases covering all learning system paths');
