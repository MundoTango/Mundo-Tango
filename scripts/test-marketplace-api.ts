import axios, { AxiosError } from 'axios';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test credentials - use unique usernames
const timestamp = Date.now();
const TEST_USER_1 = {
  username: `seller_${timestamp}`,
  email: `seller_${timestamp}@example.com`,
  password: 'password123',
  name: 'Test Seller'
};

const TEST_USER_2 = {
  username: `buyer_${timestamp}`,
  email: `buyer_${timestamp}@example.com`,
  password: 'password123',
  name: 'Test Buyer'
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
let authToken1 = '';
let authToken2 = '';
let testItemId: number;
let initialViewCount: number;

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
    const dataStr = JSON.stringify(result.data, null, 2);
    console.log(`   Data:`, dataStr.substring(0, 300) + (dataStr.length > 300 ? '...' : ''));
  }
  console.log('');
  results.push(result);
}

async function authenticateUser1() {
  console.log('🔐 Authenticating User 1 (Seller)...\n');
  
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_USER_1.email,
      password: TEST_USER_1.password
    });
    
    authToken1 = loginRes.data.accessToken;
    console.log('✅ User 1 logged in successfully\n');
  } catch (error) {
    try {
      const registerRes = await axios.post(`${API_URL}/auth/register`, {
        username: TEST_USER_1.username,
        email: TEST_USER_1.email,
        password: TEST_USER_1.password,
        name: TEST_USER_1.name
      });
      
      authToken1 = registerRes.data.accessToken;
      console.log('✅ User 1 registered and logged in successfully\n');
    } catch (regError) {
      console.error('❌ Failed to authenticate User 1:', regError);
      throw regError;
    }
  }
}

async function authenticateUser2() {
  console.log('🔐 Authenticating User 2 (Buyer)...\n');
  
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_USER_2.email,
      password: TEST_USER_2.password
    });
    
    authToken2 = loginRes.data.accessToken;
    console.log('✅ User 2 logged in successfully\n');
  } catch (error) {
    try {
      const registerRes = await axios.post(`${API_URL}/auth/register`, {
        username: TEST_USER_2.username,
        email: TEST_USER_2.email,
        password: TEST_USER_2.password,
        name: TEST_USER_2.name
      });
      
      authToken2 = registerRes.data.accessToken;
      console.log('✅ User 2 registered and logged in successfully\n');
    } catch (regError) {
      console.error('❌ Failed to authenticate User 2:', regError);
      throw regError;
    }
  }
}

async function testCreateItem() {
  console.log('📝 TEST 1: POST /api/marketplace/items - Create Item\n');
  
  try {
    const response = await axios.post(
      `${API_URL}/marketplace/items`,
      {
        title: `Tango Shoes - ${timestamp}`,
        description: 'Beautiful leather tango shoes in excellent condition',
        category: 'shoes',
        condition: 'like-new',
        price: 75,
        currency: 'USD',
        images: ['https://example.com/shoes.jpg'],
        location: 'Buenos Aires, Argentina',
        city: 'Buenos Aires',
        country: 'Argentina'
      },
      {
        headers: { Authorization: `Bearer ${authToken1}` }
      }
    );
    
    testItemId = response.data.id;
    
    logResult({
      endpoint: '/api/marketplace/items',
      method: 'POST',
      status: 'PASS',
      statusCode: response.status,
      data: response.data
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: '/api/marketplace/items',
      method: 'POST',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testGetAllItems() {
  console.log('📝 TEST 2: GET /api/marketplace/items - Get All Items\n');
  
  try {
    const response = await axios.get(`${API_URL}/marketplace/items`);
    
    const hasTestItem = response.data.some((item: any) => 
      item.item?.id === testItemId || item.id === testItemId
    );
    
    logResult({
      endpoint: '/api/marketplace/items',
      method: 'GET',
      status: hasTestItem ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { count: response.data.length, containsTestItem: hasTestItem }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: '/api/marketplace/items',
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testGetSpecificItem() {
  console.log('📝 TEST 3: GET /api/marketplace/items/:id - Get Specific Item (1st view)\n');
  
  try {
    const response = await axios.get(`${API_URL}/marketplace/items/${testItemId}`);
    
    const item = response.data.item || response.data;
    initialViewCount = item.views || 0;
    
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'GET',
      status: 'PASS',
      statusCode: response.status,
      data: { id: item.id, title: item.title, views: item.views }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testVerifyViewCountIncreased() {
  console.log('📝 TEST 4: GET /api/marketplace/items/:id - Verify View Count Increased\n');
  
  try {
    const response = await axios.get(`${API_URL}/marketplace/items/${testItemId}`);
    
    const item = response.data.item || response.data;
    const newViewCount = item.views || 0;
    const increased = newViewCount > initialViewCount;
    
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'GET',
      status: increased ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { 
        initialViews: initialViewCount, 
        newViews: newViewCount,
        increased 
      }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testUpdateItem() {
  console.log('📝 TEST 5: PATCH /api/marketplace/items/:id - Update Item\n');
  
  try {
    const response = await axios.patch(
      `${API_URL}/marketplace/items/${testItemId}`,
      {
        title: `Updated Tango Shoes - ${timestamp}`,
        price: 65
      },
      {
        headers: { Authorization: `Bearer ${authToken1}` }
      }
    );
    
    const updated = response.data.title?.includes('Updated');
    
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'PATCH',
      status: updated ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: response.data
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'PATCH',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testFilterByCategory() {
  console.log('📝 TEST 6: GET /api/marketplace/items?category=shoes - Filter by Category\n');
  
  try {
    const response = await axios.get(`${API_URL}/marketplace/items?category=shoes`);
    
    const allAreShoes = response.data.every((item: any) => 
      (item.item?.category || item.category) === 'shoes'
    );
    
    logResult({
      endpoint: '/api/marketplace/items?category=shoes',
      method: 'GET',
      status: allAreShoes ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { count: response.data.length, allMatchCategory: allAreShoes }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: '/api/marketplace/items?category=shoes',
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testFilterByCondition() {
  console.log('📝 TEST 7: GET /api/marketplace/items?condition=like-new - Filter by Condition\n');
  
  try {
    const response = await axios.get(`${API_URL}/marketplace/items?condition=like-new`);
    
    const allMatchCondition = response.data.every((item: any) => 
      (item.item?.condition || item.condition) === 'like-new'
    );
    
    logResult({
      endpoint: '/api/marketplace/items?condition=like-new',
      method: 'GET',
      status: allMatchCondition ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { count: response.data.length, allMatchCondition }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: '/api/marketplace/items?condition=like-new',
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testFilterByPriceRange() {
  console.log('📝 TEST 8: GET /api/marketplace/items?minPrice=10&maxPrice=100 - Filter by Price Range\n');
  
  try {
    const response = await axios.get(`${API_URL}/marketplace/items?minPrice=10&maxPrice=100`);
    
    const allInRange = response.data.every((item: any) => {
      const price = item.item?.price || item.price;
      return price >= 10 && price <= 100;
    });
    
    logResult({
      endpoint: '/api/marketplace/items?minPrice=10&maxPrice=100',
      method: 'GET',
      status: allInRange ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { count: response.data.length, allInPriceRange: allInRange }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: '/api/marketplace/items?minPrice=10&maxPrice=100',
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testFilterByCity() {
  console.log('📝 TEST 9: GET /api/marketplace/items?city=Buenos Aires - Filter by City\n');
  
  try {
    const response = await axios.get(`${API_URL}/marketplace/items?city=Buenos Aires`);
    
    const allInCity = response.data.every((item: any) => 
      (item.item?.city || item.city) === 'Buenos Aires'
    );
    
    logResult({
      endpoint: '/api/marketplace/items?city=Buenos Aires',
      method: 'GET',
      status: allInCity ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { count: response.data.length, allMatchCity: allInCity }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: '/api/marketplace/items?city=Buenos Aires',
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testUpdateStatus() {
  console.log('📝 TEST 10: PATCH /api/marketplace/items/:id/status - Update Status to Sold\n');
  
  try {
    const response = await axios.patch(
      `${API_URL}/marketplace/items/${testItemId}/status`,
      { status: 'sold' },
      {
        headers: { Authorization: `Bearer ${authToken1}` }
      }
    );
    
    const isSold = response.data.status === 'sold';
    
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}/status`,
      method: 'PATCH',
      status: isSold ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { status: response.data.status }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}/status`,
      method: 'PATCH',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testVerifyStatusUpdated() {
  console.log('📝 TEST 11: GET /api/marketplace/items/:id - Verify Status Updated\n');
  
  try {
    const response = await axios.get(`${API_URL}/marketplace/items/${testItemId}`);
    
    const item = response.data.item || response.data;
    const isSold = item.status === 'sold';
    
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'GET',
      status: isSold ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { status: item.status }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testGetMyItems() {
  console.log('📝 TEST 12: GET /api/marketplace/my-items - Get Seller\'s Items\n');
  
  try {
    const response = await axios.get(
      `${API_URL}/marketplace/my-items`,
      {
        headers: { Authorization: `Bearer ${authToken1}` }
      }
    );
    
    const hasTestItem = response.data.some((item: any) => item.id === testItemId);
    
    logResult({
      endpoint: '/api/marketplace/my-items',
      method: 'GET',
      status: hasTestItem ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { count: response.data.length, hasTestItem }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: '/api/marketplace/my-items',
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testGetCategories() {
  console.log('📝 TEST 13: GET /api/marketplace/categories - Get Category Counts\n');
  
  try {
    const response = await axios.get(`${API_URL}/marketplace/categories`);
    
    const hasCategories = response.data.length > 0;
    const hasShoes = response.data.some((cat: any) => cat.category === 'shoes');
    
    logResult({
      endpoint: '/api/marketplace/categories',
      method: 'GET',
      status: hasCategories && hasShoes ? 'PASS' : 'FAIL',
      statusCode: response.status,
      data: { categories: response.data }
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: '/api/marketplace/categories',
      method: 'GET',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

async function testUnauthorizedUpdate() {
  console.log('📝 TEST 14: PATCH /api/marketplace/items/:id - Unauthorized Update (Should Fail 403)\n');
  
  try {
    const response = await axios.patch(
      `${API_URL}/marketplace/items/${testItemId}`,
      { title: 'Hacked Item' },
      {
        headers: { Authorization: `Bearer ${authToken2}` }
      }
    );
    
    // Should not reach here
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'PATCH',
      status: 'FAIL',
      statusCode: response.status,
      error: 'Expected 403 Forbidden, but request succeeded'
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    const is403 = axiosError.response?.status === 403;
    
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'PATCH',
      status: is403 ? 'PASS' : 'FAIL',
      statusCode: axiosError.response?.status,
      error: is403 ? 'Correctly rejected unauthorized update' : axiosError.message
    });
  }
}

async function testUnauthorizedDelete() {
  console.log('📝 TEST 15: DELETE /api/marketplace/items/:id - Unauthorized Delete (Should Fail 403)\n');
  
  try {
    const response = await axios.delete(
      `${API_URL}/marketplace/items/${testItemId}`,
      {
        headers: { Authorization: `Bearer ${authToken2}` }
      }
    );
    
    // Should not reach here
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'DELETE',
      status: 'FAIL',
      statusCode: response.status,
      error: 'Expected 403 Forbidden, but request succeeded'
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    const is403 = axiosError.response?.status === 403;
    
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'DELETE',
      status: is403 ? 'PASS' : 'FAIL',
      statusCode: axiosError.response?.status,
      error: is403 ? 'Correctly rejected unauthorized delete' : axiosError.message
    });
  }
}

async function testDeleteItem() {
  console.log('📝 TEST 16: DELETE /api/marketplace/items/:id - Delete Item (Cleanup)\n');
  
  try {
    const response = await axios.delete(
      `${API_URL}/marketplace/items/${testItemId}`,
      {
        headers: { Authorization: `Bearer ${authToken1}` }
      }
    );
    
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'DELETE',
      status: 'PASS',
      statusCode: response.status,
      data: response.data
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    logResult({
      endpoint: `/api/marketplace/items/${testItemId}`,
      method: 'DELETE',
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message
    });
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MARKETPLACE API TEST SUMMARY');
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
  console.log('🚀 Starting Marketplace API Test Suite\n');
  console.log('='.repeat(60) + '\n');
  
  try {
    await authenticateUser1();
    await authenticateUser2();
    
    // Item Management Tests
    console.log('━'.repeat(60));
    console.log('SECTION 1: ITEM MANAGEMENT');
    console.log('━'.repeat(60) + '\n');
    await testCreateItem();
    await testGetAllItems();
    await testGetSpecificItem();
    await testVerifyViewCountIncreased();
    await testUpdateItem();
    
    // Search & Filter Tests
    console.log('━'.repeat(60));
    console.log('SECTION 2: SEARCH & FILTERS');
    console.log('━'.repeat(60) + '\n');
    await testFilterByCategory();
    await testFilterByCondition();
    await testFilterByPriceRange();
    await testFilterByCity();
    
    // Status Management Tests
    console.log('━'.repeat(60));
    console.log('SECTION 3: STATUS MANAGEMENT');
    console.log('━'.repeat(60) + '\n');
    await testUpdateStatus();
    await testVerifyStatusUpdated();
    
    // Seller Dashboard Tests
    console.log('━'.repeat(60));
    console.log('SECTION 4: SELLER DASHBOARD');
    console.log('━'.repeat(60) + '\n');
    await testGetMyItems();
    await testGetCategories();
    
    // Authorization Tests
    console.log('━'.repeat(60));
    console.log('SECTION 5: AUTHORIZATION');
    console.log('━'.repeat(60) + '\n');
    await testUnauthorizedUpdate();
    await testUnauthorizedDelete();
    
    // Cleanup
    console.log('━'.repeat(60));
    console.log('SECTION 6: CLEANUP');
    console.log('━'.repeat(60) + '\n');
    await testDeleteItem();
    
    printSummary();
    
    const failed = results.filter(r => r.status === 'FAIL').length;
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

runTests();
