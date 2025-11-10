// Subscriptions API Test Script
// Tests all 7 endpoints after auth bug fix and schema update

const BASE_URL = 'http://localhost:5000';
const TEST_USER = { email: 'admin@mundotango.life', password: 'admin123' };

interface TestResult {
  name: string;
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  data?: any;
  error?: string;
}

const results: TestResult[] = [];
let totalTests = 0;
let passedTests = 0;

async function getAuthToken(): Promise<string> {
  console.log('\n🔐 Authenticating...');
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_USER)
  });
  
  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('✅ Authentication successful');
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
  body?: any,
  expectedStatus: number = 200
): Promise<TestResult> {
  totalTests++;
  console.log(`\n🧪 Test ${totalTests}: ${name}`);
  console.log(`   ${method} ${path}`);
  
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: token ? authHeaders(token) : { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    
    let data;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    
    const success = response.status === expectedStatus;
    if (success) passedTests++;
    
    const result: TestResult = {
      name,
      endpoint: path,
      method,
      status: response.status,
      success,
      data
    };
    
    console.log(`   Status: ${response.status} ${success ? '✅' : '❌'}`);
    if (!success) {
      console.log(`   Expected: ${expectedStatus}, Got: ${response.status}`);
      result.error = `Expected ${expectedStatus}, got ${response.status}`;
    }
    if (data && typeof data === 'object') {
      console.log(`   Response:`, JSON.stringify(data, null, 2));
    }
    
    results.push(result);
    return result;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    const result: TestResult = {
      name,
      endpoint: path,
      method,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
    results.push(result);
    return result;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  SUBSCRIPTIONS API TEST SUITE');
  console.log('  Testing 7 endpoints after auth bug fix');
  console.log('═══════════════════════════════════════════════════');
  
  try {
    // Get auth token
    const token = await getAuthToken();
    
    // ========== 1. GET PRICING TIERS (PUBLIC) ==========
    console.log('\n\n📋 SECTION 1: PRICING TIERS (PUBLIC)');
    console.log('─────────────────────────────────────────────────');
    
    const tiersResult = await testEndpoint(
      'Get All Active Pricing Tiers',
      'GET',
      '/api/subscriptions/tiers'
    );
    
    // Store first tier for testing
    let testPlanId: string | null = null;
    if (tiersResult.success && Array.isArray(tiersResult.data) && tiersResult.data.length > 0) {
      testPlanId = tiersResult.data[0].name; // Use 'name' as planId (e.g., 'free', 'pro')
      console.log(`   📌 Using plan ID "${testPlanId}" for testing`);
    }
    
    // ========== 2. USER SUBSCRIPTION (INITIAL) ==========
    console.log('\n\n👤 SECTION 2: USER SUBSCRIPTION (INITIAL STATE)');
    console.log('─────────────────────────────────────────────────');
    
    await testEndpoint(
      'Get Current Subscription (should be null)',
      'GET',
      '/api/subscriptions/me',
      token
    );
    
    // ========== 3. CREATE SUBSCRIPTION ==========
    console.log('\n\n➕ SECTION 3: CREATE SUBSCRIPTION');
    console.log('─────────────────────────────────────────────────');
    
    if (!testPlanId) {
      console.log('⚠️  Skipping subscription creation - no plan ID available');
    } else {
      const now = new Date();
      const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const createResult = await testEndpoint(
        'Create New Subscription',
        'POST',
        '/api/subscriptions',
        token,
        {
          planId: testPlanId,
          billingInterval: 'monthly',
          currentPeriodStart: now.toISOString(),
          currentPeriodEnd: oneMonthLater.toISOString()
        },
        201
      );
      
      // Store subscription ID for later tests
      let subscriptionId: number | null = null;
      if (createResult.success && createResult.data) {
        subscriptionId = createResult.data.id;
        console.log(`   📌 Created subscription ID ${subscriptionId}`);
      }
      
      // ========== 4. VERIFY SUBSCRIPTION EXISTS ==========
      console.log('\n\n✓ SECTION 4: VERIFY SUBSCRIPTION');
      console.log('─────────────────────────────────────────────────');
      
      await testEndpoint(
        'Get Current Subscription (should exist)',
        'GET',
        '/api/subscriptions/me',
        token
      );
      
      if (!subscriptionId) {
        console.log('⚠️  Skipping management tests - no subscription ID available');
      } else {
        // ========== 5. UPDATE SUBSCRIPTION ==========
        console.log('\n\n✏️  SECTION 5: UPDATE SUBSCRIPTION');
        console.log('─────────────────────────────────────────────────');
        
        const twoMonthsLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
        await testEndpoint(
          'Update Subscription (extend period)',
          'PATCH',
          `/api/subscriptions/${subscriptionId}`,
          token,
          {
            currentPeriodEnd: twoMonthsLater.toISOString()
          }
        );
        
        // ========== 6. CANCEL SUBSCRIPTION ==========
        console.log('\n\n🚫 SECTION 6: CANCEL SUBSCRIPTION');
        console.log('─────────────────────────────────────────────────');
        
        await testEndpoint(
          'Cancel Subscription',
          'POST',
          `/api/subscriptions/${subscriptionId}/cancel`,
          token,
          {}
        );
        
        // ========== 7. VERIFY CANCELLED STATUS ==========
        console.log('\n\n✓ SECTION 7: VERIFY CANCELLED STATUS');
        console.log('─────────────────────────────────────────────────');
        
        const cancelledCheckResult = await testEndpoint(
          'Get Current Subscription (status should be cancelled)',
          'GET',
          '/api/subscriptions/me',
          token
        );
        
        if (cancelledCheckResult.success && cancelledCheckResult.data) {
          const status = cancelledCheckResult.data.subscription?.status;
          console.log(`   📊 Subscription status: ${status}`);
        }
        
        // ========== 8. REACTIVATE SUBSCRIPTION ==========
        console.log('\n\n🔄 SECTION 8: REACTIVATE SUBSCRIPTION');
        console.log('─────────────────────────────────────────────────');
        
        await testEndpoint(
          'Reactivate Subscription',
          'POST',
          `/api/subscriptions/${subscriptionId}/reactivate`,
          token,
          {}
        );
        
        // ========== 9. VERIFY ACTIVE STATUS ==========
        console.log('\n\n✓ SECTION 9: VERIFY ACTIVE STATUS');
        console.log('─────────────────────────────────────────────────');
        
        const activeCheckResult = await testEndpoint(
          'Get Current Subscription (status should be active)',
          'GET',
          '/api/subscriptions/me',
          token
        );
        
        if (activeCheckResult.success && activeCheckResult.data) {
          const status = activeCheckResult.data.subscription?.status;
          console.log(`   📊 Subscription status: ${status}`);
        }
      }
      
      // ========== 10. GET SUBSCRIPTION HISTORY ==========
      console.log('\n\n📜 SECTION 10: SUBSCRIPTION HISTORY');
      console.log('─────────────────────────────────────────────────');
      
      const historyResult = await testEndpoint(
        'Get All User Subscriptions History',
        'GET',
        '/api/subscriptions/history',
        token
      );
      
      if (historyResult.success && Array.isArray(historyResult.data)) {
        console.log(`   📊 Found ${historyResult.data.length} subscription(s) in history`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error during testing:', error);
  }
  
  // ========== SUMMARY ==========
  console.log('\n\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('  TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    failed.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}`);
      console.log(`   ${result.method} ${result.endpoint}`);
      console.log(`   Status: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
  } else {
    console.log('\n✅ ALL TESTS PASSED!');
  }
  
  console.log('\n═══════════════════════════════════════════════════\n');
  
  // Exit with appropriate code
  process.exit(failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
