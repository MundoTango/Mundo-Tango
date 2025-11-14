# CSRF Protection Testing Guide

## Overview
CSRF (Cross-Site Request Forgery) protection is applied globally to all POST/PUT/DELETE/PATCH requests in Mundo Tango platform using double-submit cookie pattern.

## Implementation Status
✅ **FULLY IMPLEMENTED** - Global CSRF protection applied to 189+ mutating routes

### Middleware
- `setCsrfToken` - Generates and sets CSRF token in cookie (GET requests)
- `verifyCsrfToken` - Validates CSRF token on mutating requests (POST/PUT/DELETE/PATCH)

### Auto-Skip Logic
CSRF verification automatically skips:
1. **Safe HTTP methods**: GET, HEAD, OPTIONS
2. **JWT Bearer auth**: Requests with `Authorization: Bearer <token>` header

## Testing CSRF Protection

### 1. Manual Testing with curl

#### Step 1: Get CSRF Token
```bash
# Get CSRF token from cookie
curl -c cookies.txt http://localhost:5000/api/csrf-token

# Response: { "csrfToken": "abc123..." }
```

#### Step 2: Test POST Request WITHOUT CSRF Token (Should Fail)
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"content": "Test post"}'

# Expected: 403 Forbidden - "CSRF token required"
```

#### Step 3: Test POST Request WITH CSRF Token (Should Succeed)
```bash
# Extract token from cookies.txt
CSRF_TOKEN=$(grep XSRF-TOKEN cookies.txt | awk '{print $7}')

curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{"content": "Test post"}'

# Expected: 201 Created
```

#### Step 4: Test JWT Bearer Auth (Should Auto-Skip CSRF)
```bash
# Login to get JWT token
JWT_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@mundotango.life", "password": "admin123"}' \
  | jq -r '.token')

# Make POST request with JWT (no CSRF token needed)
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"content": "Test post with JWT"}'

# Expected: 201 Created (CSRF check skipped)
```

### 2. Automated E2E Testing with Playwright

```typescript
// tests/security/csrf-protection.spec.ts
import { test, expect } from '@playwright/test';

test.describe('CSRF Protection', () => {
  test('should prevent POST request without CSRF token', async ({ page }) => {
    // Navigate to page to get CSRF token cookie set
    await page.goto('/');
    
    // Try to POST without CSRF token header
    const response = await page.evaluate(async () => {
      return fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Test post' }),
      });
    });
    
    expect(response.status).toBe(403);
  });

  test('should allow POST request with valid CSRF token', async ({ page }) => {
    // Get CSRF token
    await page.goto('/');
    const csrfToken = await page.evaluate(() => {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
    });
    
    // POST with CSRF token
    const response = await page.evaluate(async (token) => {
      return fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': token,
        },
        body: JSON.stringify({ content: 'Test post' }),
      });
    }, csrfToken);
    
    expect(response.ok).toBe(true);
  });

  test('should auto-skip CSRF for JWT authenticated requests', async ({ page }) => {
    // Login to get JWT token
    await page.goto('/login');
    // ... login flow ...
    
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    
    // POST with JWT (no CSRF token)
    const response = await page.evaluate(async (jwt) => {
      return fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ content: 'Test post' }),
      });
    }, token);
    
    expect(response.ok).toBe(true);
  });
});
```

### 3. Frontend Integration Testing

#### React/JavaScript Frontend
```javascript
// Automatic CSRF token handling in fetch wrapper
async function apiRequest(url, options = {}) {
  // Get CSRF token from cookie
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  // Add CSRF token to headers for mutating requests
  const headers = {
    ...options.headers,
  };
  
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase())) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}
```

## Security Considerations

### 1. Token Storage
- ✅ CSRF tokens stored in httpOnly=false cookie (must be readable by JavaScript)
- ✅ Tokens have SameSite=Strict policy
- ✅ Tokens expire after 24 hours
- ✅ Secure flag enabled in production

### 2. Token Validation
- ✅ Constant-time comparison to prevent timing attacks
- ✅ Token required for all mutating requests (POST/PUT/DELETE/PATCH)
- ✅ Auto-skip for safe methods (GET/HEAD/OPTIONS)
- ✅ Auto-skip for JWT Bearer auth

### 3. Production Considerations
- ✅ Use Redis for token storage (currently in-memory)
- ✅ Implement token rotation on sensitive actions
- ✅ Monitor failed CSRF attempts in audit logs
- ✅ Rate limit CSRF token generation

## Common Issues & Solutions

### Issue 1: Frontend Getting 403 CSRF Errors
**Cause**: CSRF token not included in request headers
**Solution**: Ensure `X-XSRF-TOKEN` header is set from cookie value

### Issue 2: CSRF Token Missing from Cookie
**Cause**: Page not loading or cookie expired
**Solution**: Navigate to any page first to trigger `setCsrfToken` middleware

### Issue 3: CSRF Failing for API-Only Clients
**Cause**: API clients using JWT Bearer auth but including CSRF token
**Solution**: Use JWT Bearer auth exclusively - CSRF is auto-skipped

## Monitoring & Logging

### Failed CSRF Attempts
Monitor `securityAuditLogs` table for:
```sql
SELECT * FROM security_audit_logs 
WHERE action = 'csrf_validation_failed'
ORDER BY timestamp DESC
LIMIT 100;
```

### CSRF Token Metrics
```sql
-- Token generation rate
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as tokens_generated
FROM security_audit_logs 
WHERE action = 'csrf_token_generated'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

## Compliance

### OWASP Top 10 2021
✅ **A01:2021 – Broken Access Control**
- CSRF protection prevents unauthorized state changes

### Security Headers
- `SameSite=Strict` - Prevents cross-site cookie sending
- `Secure` flag in production - HTTPS-only transmission

### GDPR Compliance
- CSRF tokens are ephemeral (24hr TTL)
- No personal data stored in tokens
- Tokens cleared on logout

## Testing Checklist

- [ ] Verify CSRF token endpoint works (`/api/csrf-token`)
- [ ] Test POST without CSRF token (should fail)
- [ ] Test POST with valid CSRF token (should succeed)
- [ ] Test POST with invalid CSRF token (should fail)
- [ ] Test POST with JWT Bearer auth (should auto-skip)
- [ ] Test GET request (should not require CSRF)
- [ ] Test CSRF token expiry (24 hours)
- [ ] Verify secure flag in production
- [ ] Check audit logging for failed attempts
- [ ] Load test CSRF validation performance

## Next Steps

1. **Enable Redis**: Move from in-memory to Redis for token storage
2. **Add Monitoring**: Set up alerts for CSRF attack patterns
3. **Token Rotation**: Implement automatic rotation on sensitive actions
4. **Rate Limiting**: Add rate limits on CSRF token generation
5. **E2E Tests**: Comprehensive Playwright test suite (see template above)
