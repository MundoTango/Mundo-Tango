import { test, expect } from '@playwright/test';

test.describe('GDPR Compliance E2E Tests', () => {
  let authToken: string;
  let userId: string;

  test.beforeAll(async ({ request }) => {
    // Create test user and get auth token
    const timestamp = Date.now();
    const response = await request.post('/api/auth/register', {
      data: {
        email: `gdpr-test-${timestamp}@mundotango.life`,
        password: 'TestPassword123!',
        username: `gdprtest${timestamp}`,
        name: 'GDPR Test User',
      },
    });

    const data = await response.json();
    authToken = data.accessToken;
    userId = data.user.id;
  });

  test.describe('GDPR Article 15: Right to Data Portability', () => {
    test('should export all user data', async ({ request }) => {
      const response = await request.post('/api/gdpr/export', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.metadata).toBeDefined();
      expect(data.data.metadata.userId).toBe(userId);
      expect(data.data.user).toBeDefined();
      expect(data.exportedAt).toBeDefined();
    });

    test('should list previous export requests', async ({ request }) => {
      // First, create an export
      await request.post('/api/gdpr/export', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Then list exports
      const response = await request.get('/api/gdpr/exports', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.exports)).toBe(true);
    });
  });

  test.describe('GDPR Article 17: Right to be Forgotten', () => {
    test('should schedule account deletion with 30-day grace period', async ({ request }) => {
      const response = await request.post('/api/gdpr/delete-account', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('Account deletion scheduled');
      expect(data.scheduledDate).toBeDefined();
      expect(data.gracePeriodDays).toBe(30);
    });

    test('should cancel pending account deletion', async ({ request }) => {
      // First, schedule deletion
      await request.post('/api/gdpr/delete-account', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Then cancel it
      const response = await request.post('/api/gdpr/cancel-deletion', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('cancelled successfully');
    });
  });

  test.describe('GDPR Article 7: Consent Management', () => {
    test('should get user consent preferences', async ({ request }) => {
      const response = await request.get('/api/gdpr/consents', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.consents).toBeDefined();
      expect(typeof data.consents.analytics).toBe('boolean');
      expect(typeof data.consents.marketing).toBe('boolean');
      expect(typeof data.consents.aiTraining).toBe('boolean');
      expect(typeof data.consents.thirdParty).toBe('boolean');
    });

    test('should update consent preferences', async ({ request }) => {
      const response = await request.put('/api/gdpr/consents', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          analytics: true,
          marketing: false,
          aiTraining: true,
          thirdParty: false,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('updated successfully');
    });
  });

  test.describe('Security & Privacy Endpoints', () => {
    test('should get user audit logs', async ({ request }) => {
      const response = await request.get('/api/security/audit-logs', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.logs)).toBe(true);
    });

    test('should get active sessions', async ({ request }) => {
      const response = await request.get('/api/security/sessions', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.sessions)).toBe(true);
    });

    test('should get privacy settings', async ({ request }) => {
      const response = await request.get('/api/privacy/settings', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.settings).toBeDefined();
    });

    test('should update privacy settings', async ({ request }) => {
      const response = await request.put('/api/privacy/settings', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          profileVisibility: 'public',
          showEmail: false,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  test.describe('Authorization Tests', () => {
    test('should reject data export without auth', async ({ request }) => {
      const response = await request.post('/api/gdpr/export');

      expect(response.status()).toBe(401);
    });

    test('should reject account deletion without auth', async ({ request }) => {
      const response = await request.post('/api/gdpr/delete-account');

      expect(response.status()).toBe(401);
    });

    test('should reject consent update without auth', async ({ request }) => {
      const response = await request.put('/api/gdpr/consents', {
        data: { analytics: true },
      });

      expect(response.status()).toBe(401);
    });
  });
});
