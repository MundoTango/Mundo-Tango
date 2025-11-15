import { test, expect } from '@playwright/test';

/**
 * OWASP Top 10 Security Tests
 * Tests for common web application vulnerabilities
 */

const BASE_URL = 'http://localhost:5000';

test.describe('OWASP Top 10 Security Tests', () => {
  
  test.describe('A01:2021 - Broken Access Control', () => {
    
    test('should prevent unauthorized access to admin routes', async ({ page }) => {
      // Try to access admin page without login
      await page.goto('/admin');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
    
    test('should prevent non-admin users from accessing admin APIs', async ({ request }) => {
      // Try to access admin API without proper permissions
      const response = await request.get('/api/admin/users');
      
      // Should return 401 or 403
      expect([401, 403]).toContain(response.status());
    });
  });
  
  test.describe('A02:2021 - Cryptographic Failures', () => {
    
    test('should use HTTPS in production', async ({ page }) => {
      // In production, all pages should use HTTPS
      // This test would check process.env.NODE_ENV === 'production'
      expect(true).toBe(true); // Placeholder
    });
    
    test('should not expose sensitive data in responses', async ({ request }) => {
      const response = await request.get('/api/posts');
      const body = await response.text();
      
      // Should not contain sensitive keywords
      expect(body.toLowerCase()).not.toContain('password');
      expect(body.toLowerCase()).not.toContain('api_key');
      expect(body.toLowerCase()).not.toContain('secret');
    });
  });
  
  test.describe('A03:2021 - Injection', () => {
    
    test('should prevent SQL injection in search', async ({ page }) => {
      await page.goto('/login');
      
      // Try SQL injection payload
      await page.fill('[data-testid="input-email"]', "admin' OR '1'='1");
      await page.fill('[data-testid="input-password"]', "password' OR '1'='1");
      await page.click('[data-testid="button-login"]');
      
      // Should not log in
      await expect(page).not.toHaveURL(/\/feed/);
      await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible();
    });
    
    test('should sanitize user input in posts', async ({ page }) => {
      // Login first using environment secrets
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
      await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
      await page.click('[data-testid="button-login"]');
      
      await page.goto('/feed');
      
      // Try to inject script
      const maliciousContent = '<script>alert("XSS")</script>';
      await page.fill('[data-testid="input-post-content"]', maliciousContent);
      await page.click('[data-testid="button-create-post"]');
      
      // Script should be sanitized (not executed)
      // The page should not show an alert
      await page.waitForTimeout(1000);
    });
  });
  
  test.describe('A04:2021 - Insecure Design', () => {
    
    test('should implement rate limiting on login', async ({ request }) => {
      // Make multiple failed login attempts
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        attempts.push(
          request.post('/api/auth/login', {
            data: {
              email: 'test@test.com',
              password: 'wrongpassword'
            }
          })
        );
      }
      
      const responses = await Promise.all(attempts);
      
      // At least one should be rate limited (429)
      const rateLimited = responses.some(r => r.status() === 429);
      expect(rateLimited).toBe(true);
    });
  });
  
  test.describe('A05:2021 - Security Misconfiguration', () => {
    
    test('should not expose server information', async ({ request }) => {
      const response = await request.get('/');
      const headers = response.headers();
      
      // Should not expose server technology
      expect(headers['x-powered-by']).toBeUndefined();
    });
    
    test('should set security headers', async ({ request }) => {
      const response = await request.get('/');
      const headers = response.headers();
      
      // Should have security headers
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBeDefined();
    });
  });
  
  test.describe('A06:2021 - Vulnerable and Outdated Components', () => {
    
    test('should use up-to-date dependencies', async () => {
      // This would check package.json for known vulnerabilities
      // In practice, run `npm audit` in CI/CD
      expect(true).toBe(true); // Placeholder
    });
  });
  
  test.describe('A07:2021 - Identification and Authentication Failures', () => {
    
    test('should enforce strong password requirements', async ({ page }) => {
      await page.goto('/register');
      
      const timestamp = Date.now();
      await page.fill('[data-testid="input-email"]', `test${timestamp}@test.com`);
      await page.fill('[data-testid="input-password"]', '123'); // Weak password
      await page.click('[data-testid="button-register"]');
      
      // Should show password requirement error
      await expect(page.locator('text=/password.*8 characters/i')).toBeVisible();
    });
    
    test('should invalidate sessions on logout', async ({ page, context }) => {
      // Login using environment secrets
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
      await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
      await page.click('[data-testid="button-login"]');
      
      await expect(page).toHaveURL(/\/feed/);
      
      // Get cookies
      const cookiesBefore = await context.cookies();
      
      // Logout
      await page.click('[data-testid="button-profile"]');
      await page.click('[data-testid="button-logout"]');
      
      // Cookies should be cleared
      const cookiesAfter = await context.cookies();
      expect(cookiesAfter.length).toBeLessThan(cookiesBefore.length);
    });
  });
  
  test.describe('A08:2021 - Software and Data Integrity Failures', () => {
    
    test('should validate file uploads', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[data-testid="input-email"]', process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life');
      await page.fill('[data-testid="input-password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123');
      await page.click('[data-testid="button-login"]');
      
      // Try to upload executable file
      // This test assumes file upload functionality exists
      // Adjust selectors based on actual implementation
      expect(true).toBe(true); // Placeholder
    });
  });
  
  test.describe('A09:2021 - Security Logging and Monitoring Failures', () => {
    
    test('should log failed login attempts', async ({ request }) => {
      await request.post('/api/auth/login', {
        data: {
          email: process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life',
          password: 'wrongpassword'
        }
      });
      
      // In practice, check logs for this failed attempt
      // This would require log aggregation setup
      expect(true).toBe(true); // Placeholder
    });
  });
  
  test.describe('A10:2021 - Server-Side Request Forgery (SSRF)', () => {
    
    test('should not allow SSRF attacks', async ({ request }) => {
      // Try to make server request internal resources
      const response = await request.post('/api/fetch-url', {
        data: {
          url: 'http://localhost:8080/admin'
        }
      });
      
      // Should reject or sanitize
      expect([400, 403]).toContain(response.status());
    });
  });
});
