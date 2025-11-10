import axios, { AxiosError } from 'axios';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test credentials - use unique username
const timestamp = Date.now();
const TEST_USER = {
  username: `testuser_${timestamp}`,
  email: `test_${timestamp}@example.com`,
  password: 'password123'
};

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];
let authToken = '';
let testStreamId1: number;
let testStreamId2: number;

function logResult(result: TestResult) {
  const emoji = result.status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${result.method} ${result.endpoint} - ${result.status}`);
  if (result.statusCode) {
    console.log(`   Status: ${result.statusCode}`);
  }
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
  if (result.data && result.status === 'PASS') {
    console.log(`   Data:`, JSON.stringify(result.data, null, 2).substring(0, 200));
  }
  console.log('');
  results.push(result);
}

async function authenticate() {
  console.log('🔐 Authenticating...\n');
  
  try {
    // Try to login first
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    authToken = loginRes.data.accessToken;
    console.log('✅ Logged in successfully\n');
  } catch (error) {
    // If login fails, try to register
    try {
      const registerRes = await axios.post(`${API_URL}/auth/register`, {
        username: TEST_USER.username,
        email: TEST_USER.email,
        password: TEST_USER.password,
        name: 'Test User'
      });
      
      authToken = registerRes.data.accessToken;
      console.log('✅ Registered and logged in successfully\n');
    } catch (regError) {
      console.error('❌ Failed to authenticate:', regError);
      throw regError;
    }
  }
}

async function testCreateStream1() {
  console.log('📝 TEST 1: Create Scheduled Stream\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/livestreams`,
      {
        title: `Test Stream ${Date.now()}`,
        host: 'Test Host',
        thumbnail: 'https://example.com/thumb.jpg',
        scheduledDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    testStreamId1 = response.data.id;
    
    logResult({
      endpoint: '/api/livestreams',
      method: 'POST',
      status: 'PASS',
      statusCode: response.status,
      data: response.data
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: '/api/livestreams',
      method: 'POST',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testGetAllStreams() {
  console.log('📝 TEST 2: Get All Streams\n');
  
  try {
    const response = await axios.get(`${API_URL}/livestreams`);
    
    logResult({
      endpoint: '/api/livestreams',
      method: 'GET',
      status: 'PASS',
      statusCode: response.status,
      data: { count: response.data.length, streams: response.data }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: '/api/livestreams',
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testGetSpecificStream() {
  console.log('📝 TEST 3: Get Specific Stream\n');
  
  try {
    const response = await axios.get(`${API_URL}/livestreams/${testStreamId1}`);
    
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}`,
      method: 'GET',
      status: 'PASS',
      statusCode: response.status,
      data: response.data
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}`,
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testUpdateStream() {
  console.log('📝 TEST 4: Update Stream Details\n');
  
  try {
    const response = await axios.patch(
      `${API_URL}/livestreams/${testStreamId1}`,
      {
        title: `Updated Stream ${Date.now()}`,
        host: 'Updated Host'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}`,
      method: 'PATCH',
      status: 'PASS',
      statusCode: response.status,
      data: response.data
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}`,
      method: 'PATCH',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testGoLive() {
  console.log('📝 TEST 5: Start Broadcast (Go Live)\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/livestreams/${testStreamId1}/go-live`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}/go-live`,
      method: 'POST',
      status: 'PASS',
      statusCode: response.status,
      data: response.data
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}/go-live`,
      method: 'POST',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testGetLiveStreams() {
  console.log('📝 TEST 6: Get Live Streams Only\n');
  
  try {
    const response = await axios.get(`${API_URL}/livestreams/live`);
    
    const isLive = response.data.some((stream: any) => stream.id === testStreamId1);
    
    logResult({
      endpoint: '/api/livestreams/live',
      method: 'GET',
      status: isLive ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { count: response.data.length, containsTestStream: isLive }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: '/api/livestreams/live',
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testViewerJoin1() {
  console.log('📝 TEST 7: Viewer Join (First)\n');
  
  try {
    const response = await axios.post(`${API_URL}/livestreams/${testStreamId1}/viewer-join`);
    
    const hasViewers = response.data.viewers >= 1;
    
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}/viewer-join`,
      method: 'POST',
      status: hasViewers ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { viewers: response.data.viewers }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}/viewer-join`,
      method: 'POST',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testViewerJoin2() {
  console.log('📝 TEST 8: Viewer Join (Second - Test Counter)\n');
  
  try {
    const response = await axios.post(`${API_URL}/livestreams/${testStreamId1}/viewer-join`);
    
    const hasViewers = response.data.viewers >= 2;
    
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}/viewer-join`,
      method: 'POST',
      status: hasViewers ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { viewers: response.data.viewers }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}/viewer-join`,
      method: 'POST',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testViewerLeave() {
  console.log('📝 TEST 9: Viewer Leave (Decrement)\n');
  
  try {
    const response = await axios.post(`${API_URL}/livestreams/${testStreamId1}/viewer-leave`);
    
    const decremented = response.data.viewers === 1;
    
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}/viewer-leave`,
      method: 'POST',
      status: decremented ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { viewers: response.data.viewers }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}/viewer-leave`,
      method: 'POST',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testEndBroadcast() {
  console.log('📝 TEST 10: End Broadcast\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/livestreams/${testStreamId1}/end`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const ended = !response.data.isLive && response.data.viewers === 0;
    
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}/end`,
      method: 'POST',
      status: ended ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { isLive: response.data.isLive, viewers: response.data.viewers }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}/end`,
      method: 'POST',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testCreateStream2() {
  console.log('📝 TEST 11: Create Future Scheduled Stream (For Registration)\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/livestreams`,
      {
        title: `Future Stream ${Date.now()}`,
        host: 'Future Host',
        scheduledDate: new Date(Date.now() + 172800000).toISOString() // 2 days from now
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    testStreamId2 = response.data.id;
    
    logResult({
      endpoint: '/api/livestreams',
      method: 'POST',
      status: 'PASS',
      statusCode: response.status,
      data: response.data
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: '/api/livestreams',
      method: 'POST',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testRegisterForStream() {
  console.log('📝 TEST 12: Register for Stream\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/livestreams/${testStreamId2}/register`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const registered = response.data.registrations >= 1;
    
    logResult({
      endpoint: `/api/livestreams/${testStreamId2}/register`,
      method: 'POST',
      status: registered ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { registrations: response.data.registrations }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/livestreams/${testStreamId2}/register`,
      method: 'POST',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testVerifyRegistrationCount() {
  console.log('📝 TEST 13: Verify Registration Count Increased\n');
  
  try {
    const response = await axios.get(`${API_URL}/livestreams/${testStreamId2}`);
    
    const hasRegistrations = response.data.registrations >= 1;
    
    logResult({
      endpoint: `/api/livestreams/${testStreamId2}`,
      method: 'GET',
      status: hasRegistrations ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { registrations: response.data.registrations }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/livestreams/${testStreamId2}`,
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testDeleteStream1() {
  console.log('📝 TEST 14: Delete Test Stream 1 (Cleanup)\n');
  
  try {
    const response = await axios.delete(
      `${API_URL}/livestreams/${testStreamId1}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}`,
      method: 'DELETE',
      status: 'PASS',
      statusCode: response.status,
      data: response.data
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/livestreams/${testStreamId1}`,
      method: 'DELETE',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testDeleteStream2() {
  console.log('📝 TEST 15: Delete Test Stream 2 (Cleanup)\n');
  
  try {
    const response = await axios.delete(
      `${API_URL}/livestreams/${testStreamId2}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    logResult({
      endpoint: `/api/livestreams/${testStreamId2}`,
      method: 'DELETE',
      status: 'PASS',
      statusCode: response.status,
      data: response.data
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/livestreams/${testStreamId2}`,
      method: 'DELETE',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);
  
  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  • ${r.method} ${r.endpoint}: ${r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

async function runTests() {
  console.log('🚀 Starting Livestream API Test Suite\n');
  console.log('='.repeat(60) + '\n');
  
  try {
    await authenticate();
    
    // Stream Management Tests
    console.log('━'.repeat(60));
    console.log('SECTION 1: STREAM MANAGEMENT');
    console.log('━'.repeat(60) + '\n');
    await testCreateStream1();
    await testGetAllStreams();
    await testGetSpecificStream();
    await testUpdateStream();
    
    // Live Broadcasting Tests
    console.log('━'.repeat(60));
    console.log('SECTION 2: LIVE BROADCASTING');
    console.log('━'.repeat(60) + '\n');
    await testGoLive();
    await testGetLiveStreams();
    await testViewerJoin1();
    await testViewerJoin2();
    await testViewerLeave();
    await testEndBroadcast();
    
    // Registration System Tests
    console.log('━'.repeat(60));
    console.log('SECTION 3: REGISTRATION SYSTEM');
    console.log('━'.repeat(60) + '\n');
    await testCreateStream2();
    await testRegisterForStream();
    await testVerifyRegistrationCount();
    
    // Cleanup Tests
    console.log('━'.repeat(60));
    console.log('SECTION 4: CLEANUP');
    console.log('━'.repeat(60) + '\n');
    await testDeleteStream1();
    await testDeleteStream2();
    
    printSummary();
    
    const failed = results.filter(r => r.status === 'FAIL').length;
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

runTests();
