import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * k6 Load Testing Script
 * Tests application performance under various load conditions
 */

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.05'],   // Error rate must be below 5%
    errors: ['rate<0.1'],             // Custom error rate below 10%
  },
};

const BASE_URL = 'http://localhost:5000';

// Login and get token
function getAuthToken() {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'admin@mundotango.life',
    password: 'admin123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  const token = JSON.parse(loginRes.body).token;
  return token;
}

// Main test scenario
export default function () {
  const token = getAuthToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test 1: Get feed
  let res = http.get(`${BASE_URL}/api/posts`, { headers });
  check(res, {
    'feed loaded': (r) => r.status === 200,
    'feed response time OK': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Get events
  res = http.get(`${BASE_URL}/api/events`, { headers });
  check(res, {
    'events loaded': (r) => r.status === 200,
    'events response time OK': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Get housing listings
  res = http.get(`${BASE_URL}/api/housing`, { headers });
  check(res, {
    'housing loaded': (r) => r.status === 200,
    'housing response time OK': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: Create post
  res = http.post(`${BASE_URL}/api/posts`, JSON.stringify({
    content: `Load test post ${Date.now()}`,
    visibility: 'public',
  }), { headers });
  check(res, {
    'post created': (r) => r.status === 201,
    'post creation time OK': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(2);

  // Test 5: Get Life CEO agents
  res = http.get(`${BASE_URL}/api/life-ceo/agents`, { headers });
  check(res, {
    'agents loaded': (r) => r.status === 200,
    'agents response time OK': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 6: Search functionality
  res = http.get(`${BASE_URL}/api/user/global-search?q=tango`, { headers });
  check(res, {
    'search completed': (r) => r.status === 200,
    'search response time OK': (r) => r.timings.duration < 400,
  }) || errorRate.add(1);

  sleep(2);
}

// Setup function - runs once before tests
export function setup() {
  console.log('Starting load test...');
  console.log(`Target: ${BASE_URL}`);
  return { startTime: Date.now() };
}

// Teardown function - runs once after tests
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration}s`);
}
