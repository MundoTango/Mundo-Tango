import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% errors
  },
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  // Test public endpoints
  let res = http.get(`${BASE_URL}/`);
  check(res, { 'homepage status 200': (r) => r.status === 200 });
  
  res = http.get(`${BASE_URL}/api/auth/me`);
  check(res, { 'auth endpoint responds': (r) => r.status >= 200 });
  
  res = http.get(`${BASE_URL}/api/posts?limit=10&offset=0`);
  check(res, { 'posts endpoint responds': (r) => r.status >= 200 });
  
  sleep(1);
}
