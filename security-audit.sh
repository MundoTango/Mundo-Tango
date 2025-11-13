#!/bin/bash
echo "==================================="
echo "SECURITY AUDIT - OWASP Top 10 Check"
echo "==================================="
echo ""

BASE_URL="http://localhost:5000"

# Test 1: SQL Injection Attempt
echo "1. SQL Injection Test (should fail safely)"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/posts?limit=10';DROP TABLE users;--")
echo "   SQL injection attempt: $RESPONSE (should be 400 or reject safely)"

# Test 2: XSS Attempt
echo ""
echo "2. XSS Test (should escape HTML)"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(1)</script>","password":"test"}' \
  -o /dev/null -w "%{http_code}")
echo "   XSS attempt: $RESPONSE (should handle safely)"

# Test 3: Authentication Required
echo ""
echo "3. Authentication Check (should require auth)"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/user/profile")
echo "   Unauth profile access: $RESPONSE (should be 401/403)"

# Test 4: HTTPS Headers (in production)
echo ""
echo "4. Security Headers Check"
HEADERS=$(curl -s -I "$BASE_URL/" | grep -i "x-frame\|x-content\|strict-transport")
if [ -z "$HEADERS" ]; then
  echo "   ⚠️  Warning: Security headers not detected (may be added in production)"
else
  echo "   ✅ Security headers found: $HEADERS"
fi

# Test 5: Rate Limiting
echo ""
echo "5. Rate Limiting Test (rapid requests)"
for i in {1..20}; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}')
  echo -n "$RESPONSE "
done
echo ""
echo "   (Should show rate limiting after many attempts)"

# Test 6: CORS Policy
echo ""
echo "6. CORS Policy Check"
CORS=$(curl -s -I "$BASE_URL/api/auth/me" -H "Origin: http://evil.com" | grep -i "access-control")
if [ -z "$CORS" ]; then
  echo "   ⚠️  CORS not configured or restrictive (good for security)"
else
  echo "   CORS headers: $CORS"
fi

echo ""
echo "==================================="
echo "SECURITY AUDIT COMPLETE"
echo "==================================="
