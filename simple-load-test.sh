#!/bin/bash
echo "=== SIMPLE LOAD TEST ==="
echo "Testing API endpoint performance..."
echo ""

BASE_URL="http://localhost:5000"

# Test 1: Homepage load time
echo "Test 1: Homepage Load Time"
time curl -s -o /dev/null -w "Status: %{http_code}, Time: %{time_total}s\n" $BASE_URL/

# Test 2: API endpoint (auth check)
echo ""
echo "Test 2: Auth API Response Time"
time curl -s -o /dev/null -w "Status: %{http_code}, Time: %{time_total}s\n" $BASE_URL/api/auth/me

# Test 3: Posts API
echo ""
echo "Test 3: Posts API Response Time"
time curl -s -o /dev/null -w "Status: %{http_code}, Time: %{time_total}s\n" "$BASE_URL/api/posts?limit=10&offset=0"

# Test 4: Concurrent requests
echo ""
echo "Test 4: Concurrent Load (10 requests)"
for i in {1..10}; do
  curl -s -o /dev/null -w "Request $i: %{http_code} (%{time_total}s)\n" $BASE_URL/ &
done
wait

echo ""
echo "=== LOAD TEST COMPLETE ==="
