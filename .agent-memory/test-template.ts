// Standard API Test Template
// Copy and adapt for any new API route testing

const BASE_URL = 'http://localhost:5000';
const TEST_USER = { email: 'admin@mundotango.life', password: 'admin123' };

async function getAuthToken(): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER)
  });
  const data = await response.json();
  return data.accessToken;
}

function authHeaders(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

async function testEndpoint(
  name: string, 
  method: string, 
  path: string, 
  token?: string, 
  body?: any
) {
  console.log(`\n🧪 Testing: ${name}`);
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: token ? authHeaders(token) : { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  
  const data = await response.json();
  console.log(`   Status: ${response.status}${response.ok ? ' ✅' : ' ❌'}`);
  return { response, data };
}

// Usage example:
// const token = await getAuthToken();
// const { data } = await testEndpoint('Create Item', 'POST', '/api/items', token, { name: 'test' });
