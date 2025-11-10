// Marketplace API Retest - Post Auth Fix
// Tests all 8 endpoints with comprehensive scenarios

const BASE_URL = 'http://localhost:5000';
const TEST_USER = { email: 'admin@mundotango.life', password: 'admin123' };
const TEST_USER_2 = { email: 'user@mundotango.life', password: 'user123' };

interface TestResult {
  name: string;
  passed: boolean;
  status?: number;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

async function getAuthToken(user = TEST_USER): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
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
  expectedStatus: number,
  token?: string,
  body?: any
): Promise<TestResult> {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: token ? authHeaders(token) : { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    const passed = response.status === expectedStatus;
    
    console.log(`   Status: ${response.status} (expected ${expectedStatus}) ${passed ? '✅' : '❌'}`);
    if (!passed && data.message) {
      console.log(`   Error: ${data.message}`);
    }

    return {
      name,
      passed,
      status: response.status,
      data
    };
  } catch (error) {
    console.log(`   ❌ FAILED: ${error}`);
    return {
      name,
      passed: false,
      error: String(error)
    };
  }
}

async function runTests() {
  console.log('\n🚀 MARKETPLACE API RETEST - POST AUTH FIX');
  console.log('=' .repeat(60));

  let token1: string;
  let token2: string;
  let createdItemId: number;
  let item2Id: number;

  try {
    // Get auth tokens
    console.log('\n📝 Getting authentication tokens...');
    token1 = await getAuthToken(TEST_USER);
    token2 = await getAuthToken(TEST_USER_2);
    console.log('✅ Auth tokens obtained');

    // ========================================================================
    // 1. ITEM CRUD OPERATIONS
    // ========================================================================
    console.log('\n' + '='.repeat(60));
    console.log('SECTION 1: ITEM CRUD OPERATIONS');
    console.log('='.repeat(60));

    // POST - Create item with dynamic title
    const timestamp = Date.now();
    const result1 = await testEndpoint(
      '1.1 POST /api/marketplace/items - Create item',
      'POST',
      '/api/marketplace/items',
      201,
      token1,
      {
        title: `Tango Shoes Test ${timestamp}`,
        description: 'Beautiful leather tango shoes, gently used',
        category: 'shoes',
        condition: 'like-new',
        price: 120,
        currency: 'USD',
        city: 'Buenos Aires',
        country: 'Argentina'
      }
    );
    results.push(result1);
    if (result1.passed) {
      createdItemId = result1.data.id;
      console.log(`   Created item ID: ${createdItemId}`);
    }

    // GET - Get specific item and verify view count
    if (createdItemId) {
      const result2 = await testEndpoint(
        '1.2 GET /api/marketplace/items/:id - Get item',
        'GET',
        `/api/marketplace/items/${createdItemId}`,
        200
      );
      results.push(result2);
      if (result2.passed) {
        console.log(`   Initial view count: ${result2.data.item.views}`);
      }

      // GET again to verify view count increment
      const result3 = await testEndpoint(
        '1.3 GET /api/marketplace/items/:id - Verify view count increment',
        'GET',
        `/api/marketplace/items/${createdItemId}`,
        200
      );
      results.push(result3);
      if (result3.passed) {
        console.log(`   Updated view count: ${result3.data.item.views}`);
        const viewsIncremented = result3.data.item.views > (result2.data?.item?.views || 0);
        console.log(`   Views incremented: ${viewsIncremented ? '✅' : '❌'}`);
      }

      // PATCH - Update item
      const result4 = await testEndpoint(
        '1.4 PATCH /api/marketplace/items/:id - Update item',
        'PATCH',
        `/api/marketplace/items/${createdItemId}`,
        200,
        token1,
        {
          price: 100,
          description: 'Updated: Beautiful leather tango shoes, gently used - SALE!'
        }
      );
      results.push(result4);
      if (result4.passed) {
        console.log(`   Updated price: ${result4.data.price}`);
      }
    }

    // ========================================================================
    // 2. SEARCH & FILTERS
    // ========================================================================
    console.log('\n' + '='.repeat(60));
    console.log('SECTION 2: SEARCH & FILTERS');
    console.log('='.repeat(60));

    // Create another item for filter testing
    const result5 = await testEndpoint(
      '2.0 POST - Create second item for filter testing',
      'POST',
      '/api/marketplace/items',
      201,
      token1,
      {
        title: 'New Tango Dress',
        description: 'Brand new elegant tango dress',
        category: 'clothing',
        condition: 'new',
        price: 50,
        currency: 'USD',
        city: 'Buenos Aires',
        country: 'Argentina'
      }
    );
    results.push(result5);
    if (result5.passed) {
      item2Id = result5.data.id;
      console.log(`   Created item 2 ID: ${item2Id}`);
    }

    // GET - Filter by category
    const result6 = await testEndpoint(
      '2.1 GET /api/marketplace/items?category=shoes',
      'GET',
      '/api/marketplace/items?category=shoes',
      200
    );
    results.push(result6);
    if (result6.passed) {
      console.log(`   Found ${result6.data.length} shoes`);
    }

    // GET - Filter by condition
    const result7 = await testEndpoint(
      '2.2 GET /api/marketplace/items?condition=new',
      'GET',
      '/api/marketplace/items?condition=new',
      200
    );
    results.push(result7);
    if (result7.passed) {
      console.log(`   Found ${result7.data.length} new items`);
    }

    // GET - Filter by price range
    const result8 = await testEndpoint(
      '2.3 GET /api/marketplace/items?minPrice=10&maxPrice=100',
      'GET',
      '/api/marketplace/items?minPrice=10&maxPrice=100',
      200
    );
    results.push(result8);
    if (result8.passed) {
      console.log(`   Found ${result8.data.length} items in price range $10-$100`);
    }

    // ========================================================================
    // 3. STATUS MANAGEMENT
    // ========================================================================
    console.log('\n' + '='.repeat(60));
    console.log('SECTION 3: STATUS MANAGEMENT');
    console.log('='.repeat(60));

    // PATCH - Update status to sold
    if (item2Id) {
      const result9 = await testEndpoint(
        '3.1 PATCH /api/marketplace/items/:id/status - Update to sold',
        'PATCH',
        `/api/marketplace/items/${item2Id}/status`,
        200,
        token1,
        { status: 'sold' }
      );
      results.push(result9);
      if (result9.passed) {
        console.log(`   Updated status: ${result9.data.status}`);
      }
    }

    // ========================================================================
    // 4. SELLER DASHBOARD
    // ========================================================================
    console.log('\n' + '='.repeat(60));
    console.log('SECTION 4: SELLER DASHBOARD');
    console.log('='.repeat(60));

    // GET - My items
    const result10 = await testEndpoint(
      '4.1 GET /api/marketplace/my-items - Get seller items',
      'GET',
      '/api/marketplace/my-items',
      200,
      token1
    );
    results.push(result10);
    if (result10.passed) {
      console.log(`   Found ${result10.data.length} items for this seller`);
    }

    // GET - Categories
    const result11 = await testEndpoint(
      '4.2 GET /api/marketplace/categories - Get all categories',
      'GET',
      '/api/marketplace/categories',
      200
    );
    results.push(result11);
    if (result11.passed) {
      console.log(`   Found ${result11.data.length} categories`);
      result11.data.forEach((cat: any) => {
        console.log(`     - ${cat.category}: ${cat.count} items`);
      });
    }

    // ========================================================================
    // 5. AUTHORIZATION TESTING
    // ========================================================================
    console.log('\n' + '='.repeat(60));
    console.log('SECTION 5: AUTHORIZATION TESTING');
    console.log('='.repeat(60));

    // Try to update item owned by user1 with user2's token (should fail)
    if (createdItemId) {
      const result12 = await testEndpoint(
        '5.1 PATCH - Unauthorized update (should fail with 403)',
        'PATCH',
        `/api/marketplace/items/${createdItemId}`,
        403,
        token2,
        { price: 999 }
      );
      results.push(result12);
    }

    // Try to delete item owned by user1 with user2's token (should fail)
    if (createdItemId) {
      const result13 = await testEndpoint(
        '5.2 DELETE - Unauthorized delete (should fail with 403)',
        'DELETE',
        `/api/marketplace/items/${createdItemId}`,
        403,
        token2
      );
      results.push(result13);
    }

    // ========================================================================
    // CLEANUP - Delete test items
    // ========================================================================
    console.log('\n' + '='.repeat(60));
    console.log('CLEANUP');
    console.log('='.repeat(60));

    if (createdItemId) {
      const result14 = await testEndpoint(
        'DELETE /api/marketplace/items/:id - Delete item 1',
        'DELETE',
        `/api/marketplace/items/${createdItemId}`,
        200,
        token1
      );
      results.push(result14);
    }

    if (item2Id) {
      const result15 = await testEndpoint(
        'DELETE /api/marketplace/items/:id - Delete item 2',
        'DELETE',
        `/api/marketplace/items/${item2Id}`,
        200,
        token1
      );
      results.push(result15);
    }

  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  }

  // ========================================================================
  // SUMMARY
  // ========================================================================
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Pass Rate: ${passRate}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name} (${r.status || 'error'})${r.error ? ': ' + r.error : ''}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  
  if (passRate === '100.0') {
    console.log('🎉 ALL TESTS PASSED - AUTH FIX VERIFIED!');
  } else {
    console.log('⚠️  SOME TESTS FAILED - REVIEW NEEDED');
  }
  console.log('='.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
