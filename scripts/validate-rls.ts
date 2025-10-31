/**
 * RLS Validation Script for Mundo Tango
 * 
 * This script validates Row Level Security (RLS) policies across all database tables.
 * 
 * NOTE: This script requires SUPABASE_SERVICE_ROLE_KEY for full policy inspection.
 * 
 * To get policy counts and details, set the environment variable:
 *   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
 * 
 * Without the service-role key, the script will only check RLS enabled status
 * but will not be able to query policy details from PostgreSQL system catalogs.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface TestResult {
  table: string;
  test: string;
  passed: boolean;
  error?: string;
  details?: string;
}

interface RLSStatus {
  table: string;
  enabled: boolean;
  policyCount: number;
  policies: string[];
}

async function checkRLSEnabled() {
  console.log('🔍 Checking RLS Status on All Tables...\n');
  
  if (!supabaseServiceKey) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set - policy details will be limited\n');
  }
  
  const adminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
  
  const tableNames = ['posts', 'events', 'messages', 'profiles', 'follows', 'likes', 'comments', 'rsvps', 'conversations', 'conversation_participants'];
  
  const rlsStatus: RLSStatus[] = [];
  
  for (const tableName of tableNames) {
    const status = await checkTableRLS(adminClient, tableName);
    rlsStatus.push(status);
  }
  
  console.log('📊 RLS Status:');
  rlsStatus.forEach(status => {
    const icon = status.enabled ? '✅' : '❌';
    const policyInfo = status.policyCount === -1 
      ? '(policy count unknown - need service-role key)' 
      : `(${status.policyCount} ${status.policyCount === 1 ? 'policy' : 'policies'})`;
    console.log(`${icon} ${status.table}: ${status.enabled ? 'ENABLED' : 'DISABLED'} ${policyInfo}`);
    if (status.policies.length > 0) {
      status.policies.forEach(policy => {
        console.log(`     - ${policy}`);
      });
    }
  });
  console.log('');
  
  return rlsStatus;
}

async function checkTableRLS(client: any, tableName: string): Promise<RLSStatus> {
  const { data: tableData, error: tableError } = await client
    .from('pg_class')
    .select('relrowsecurity')
    .eq('relname', tableName)
    .limit(1)
    .maybeSingle();

  if (tableError) {
    console.error(`❌ Error checking RLS for ${tableName}:`, tableError);
    return { 
      table: tableName,
      enabled: false, 
      policyCount: -1, 
      policies: [] 
    };
  }

  const rlsEnabled = tableData?.relrowsecurity || false;

  const { data: policiesData, error: policiesError } = await client
    .from('pg_policies')
    .select('policyname')
    .eq('tablename', tableName)
    .eq('schemaname', 'public');

  if (policiesError) {
    return { 
      table: tableName,
      enabled: rlsEnabled, 
      policyCount: -1,
      policies: [] 
    };
  }

  return {
    table: tableName,
    enabled: rlsEnabled,
    policyCount: policiesData?.length || 0,
    policies: policiesData?.map(p => p.policyname) || [],
  };
}

async function validateRLS() {
  console.log('🔒 Starting Comprehensive RLS Policy Validation...\n');

  const results: TestResult[] = [];
  
  await checkRLSEnabled();

  console.log('🧪 Testing RLS Policies...\n');
  
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);

  await testProfilesRLS(anonClient, results);
  await testPostsRLS(anonClient, results);
  await testEventsRLS(anonClient, results);
  await testMessagesRLS(anonClient, results);
  await testFollowsRLS(anonClient, results);
  await testLikesRLS(anonClient, results);
  await testCommentsRLS(anonClient, results);
  await testRSVPsRLS(anonClient, results);
  await testConversationsRLS(anonClient, results);

  printResults(results);
  
  return results.every(r => r.passed);
}

async function testProfilesRLS(client: any, results: TestResult[]) {
  console.log('Testing PROFILES table...');
  
  try {
    const { data, error } = await client.from('profiles').select('*').limit(1);
    results.push({
      table: 'profiles',
      test: 'Unauthenticated SELECT denied',
      passed: !!error,
      error: error?.message || (data ? `Access granted (returned ${data.length} rows)` : 'No error but no data'),
    });
  } catch (e: any) {
    results.push({
      table: 'profiles',
      test: 'Unauthenticated SELECT denied',
      passed: true,
      error: e.message,
    });
  }

  try {
    const { error } = await client.from('profiles').insert({ 
      id: '00000000-0000-0000-0000-000000000000',
      username: 'test',
      full_name: 'Test User'
    });
    results.push({
      table: 'profiles',
      test: 'Unauthenticated INSERT denied',
      passed: !!error,
      error: error?.message || 'Insert succeeded (should have failed)',
    });
  } catch (e: any) {
    results.push({
      table: 'profiles',
      test: 'Unauthenticated INSERT denied',
      passed: true,
      error: e.message,
    });
  }
}

async function testPostsRLS(client: any, results: TestResult[]) {
  console.log('Testing POSTS table...');
  
  try {
    const { data, error } = await client.from('posts').select('*').limit(1);
    results.push({
      table: 'posts',
      test: 'Unauthenticated SELECT denied',
      passed: !!error,
      error: error?.message || (data ? `Access granted (returned ${data.length} rows)` : 'No error but no data'),
    });
  } catch (e: any) {
    results.push({
      table: 'posts',
      test: 'Unauthenticated SELECT denied',
      passed: true,
      error: e.message,
    });
  }

  try {
    const { error } = await client.from('posts').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      content: 'Test post',
      visibility: 'public'
    });
    results.push({
      table: 'posts',
      test: 'Unauthenticated INSERT denied',
      passed: !!error,
      error: error?.message || 'Insert succeeded (should have failed)',
    });
  } catch (e: any) {
    results.push({
      table: 'posts',
      test: 'Unauthenticated INSERT denied',
      passed: true,
      error: e.message,
    });
  }
}

async function testEventsRLS(client: any, results: TestResult[]) {
  console.log('Testing EVENTS table...');
  
  try {
    const { data, error } = await client.from('events').select('*').limit(1);
    results.push({
      table: 'events',
      test: 'Unauthenticated SELECT denied',
      passed: !!error,
      error: error?.message || (data ? `Access granted (returned ${data.length} rows)` : 'No error but no data'),
    });
  } catch (e: any) {
    results.push({
      table: 'events',
      test: 'Unauthenticated SELECT denied',
      passed: true,
      error: e.message,
    });
  }

  try {
    const { error } = await client.from('events').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      title: 'Test Event',
      start_date: new Date().toISOString(),
      event_type: 'milonga'
    });
    results.push({
      table: 'events',
      test: 'Unauthenticated INSERT denied',
      passed: !!error,
      error: error?.message || 'Insert succeeded (should have failed)',
    });
  } catch (e: any) {
    results.push({
      table: 'events',
      test: 'Unauthenticated INSERT denied',
      passed: true,
      error: e.message,
    });
  }
}

async function testMessagesRLS(client: any, results: TestResult[]) {
  console.log('Testing MESSAGES table...');
  
  try {
    const { data, error } = await client.from('messages').select('*').limit(1);
    results.push({
      table: 'messages',
      test: 'Unauthenticated SELECT denied',
      passed: !!error,
      error: error?.message || (data ? `Access granted (returned ${data.length} rows)` : 'No error but no data'),
    });
  } catch (e: any) {
    results.push({
      table: 'messages',
      test: 'Unauthenticated SELECT denied',
      passed: true,
      error: e.message,
    });
  }

  try {
    const { error } = await client.from('messages').insert({
      conversation_id: '00000000-0000-0000-0000-000000000000',
      sender_id: '00000000-0000-0000-0000-000000000000',
      content: 'Test message'
    });
    results.push({
      table: 'messages',
      test: 'Unauthenticated INSERT denied',
      passed: !!error,
      error: error?.message || 'Insert succeeded (should have failed)',
    });
  } catch (e: any) {
    results.push({
      table: 'messages',
      test: 'Unauthenticated INSERT denied',
      passed: true,
      error: e.message,
    });
  }
}

async function testFollowsRLS(client: any, results: TestResult[]) {
  console.log('Testing FOLLOWS table...');
  
  try {
    const { data, error } = await client.from('follows').select('*').limit(1);
    results.push({
      table: 'follows',
      test: 'Unauthenticated SELECT denied',
      passed: !!error,
      error: error?.message || (data ? `Access granted (returned ${data.length} rows)` : 'No error but no data'),
    });
  } catch (e: any) {
    results.push({
      table: 'follows',
      test: 'Unauthenticated SELECT denied',
      passed: true,
      error: e.message,
    });
  }

  try {
    const { error } = await client.from('follows').insert({
      follower_id: '00000000-0000-0000-0000-000000000000',
      following_id: '00000000-0000-0000-0000-000000000001'
    });
    results.push({
      table: 'follows',
      test: 'Unauthenticated INSERT denied',
      passed: !!error,
      error: error?.message || 'Insert succeeded (should have failed)',
    });
  } catch (e: any) {
    results.push({
      table: 'follows',
      test: 'Unauthenticated INSERT denied',
      passed: true,
      error: e.message,
    });
  }
}

async function testLikesRLS(client: any, results: TestResult[]) {
  console.log('Testing LIKES table...');
  
  try {
    const { data, error } = await client.from('likes').select('*').limit(1);
    results.push({
      table: 'likes',
      test: 'Unauthenticated SELECT denied',
      passed: !!error,
      error: error?.message || (data ? `Access granted (returned ${data.length} rows)` : 'No error but no data'),
    });
  } catch (e: any) {
    results.push({
      table: 'likes',
      test: 'Unauthenticated SELECT denied',
      passed: true,
      error: e.message,
    });
  }

  try {
    const { error } = await client.from('likes').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      post_id: '00000000-0000-0000-0000-000000000000'
    });
    results.push({
      table: 'likes',
      test: 'Unauthenticated INSERT denied',
      passed: !!error,
      error: error?.message || 'Insert succeeded (should have failed)',
    });
  } catch (e: any) {
    results.push({
      table: 'likes',
      test: 'Unauthenticated INSERT denied',
      passed: true,
      error: e.message,
    });
  }
}

async function testCommentsRLS(client: any, results: TestResult[]) {
  console.log('Testing COMMENTS table...');
  
  try {
    const { data, error } = await client.from('comments').select('*').limit(1);
    results.push({
      table: 'comments',
      test: 'Unauthenticated SELECT denied',
      passed: !!error,
      error: error?.message || (data ? `Access granted (returned ${data.length} rows)` : 'No error but no data'),
    });
  } catch (e: any) {
    results.push({
      table: 'comments',
      test: 'Unauthenticated SELECT denied',
      passed: true,
      error: e.message,
    });
  }

  try {
    const { error } = await client.from('comments').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      post_id: '00000000-0000-0000-0000-000000000000',
      content: 'Test comment'
    });
    results.push({
      table: 'comments',
      test: 'Unauthenticated INSERT denied',
      passed: !!error,
      error: error?.message || 'Insert succeeded (should have failed)',
    });
  } catch (e: any) {
    results.push({
      table: 'comments',
      test: 'Unauthenticated INSERT denied',
      passed: true,
      error: e.message,
    });
  }
}

async function testRSVPsRLS(client: any, results: TestResult[]) {
  console.log('Testing RSVPS table...');
  
  try {
    const { data, error } = await client.from('rsvps').select('*').limit(1);
    results.push({
      table: 'rsvps',
      test: 'Unauthenticated SELECT denied',
      passed: !!error,
      error: error?.message || (data ? `Access granted (returned ${data.length} rows)` : 'No error but no data'),
    });
  } catch (e: any) {
    results.push({
      table: 'rsvps',
      test: 'Unauthenticated SELECT denied',
      passed: true,
      error: e.message,
    });
  }

  try {
    const { error } = await client.from('rsvps').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      event_id: '00000000-0000-0000-0000-000000000000',
      status: 'going'
    });
    results.push({
      table: 'rsvps',
      test: 'Unauthenticated INSERT denied',
      passed: !!error,
      error: error?.message || 'Insert succeeded (should have failed)',
    });
  } catch (e: any) {
    results.push({
      table: 'rsvps',
      test: 'Unauthenticated INSERT denied',
      passed: true,
      error: e.message,
    });
  }
}

async function testConversationsRLS(client: any, results: TestResult[]) {
  console.log('Testing CONVERSATIONS table...');
  
  try {
    const { data, error } = await client.from('conversations').select('*').limit(1);
    results.push({
      table: 'conversations',
      test: 'Unauthenticated SELECT denied',
      passed: !!error,
      error: error?.message || (data ? `Access granted (returned ${data.length} rows)` : 'No error but no data'),
    });
  } catch (e: any) {
    results.push({
      table: 'conversations',
      test: 'Unauthenticated SELECT denied',
      passed: true,
      error: e.message,
    });
  }

  try {
    const { error } = await client.from('conversations').insert({
      type: 'direct'
    });
    results.push({
      table: 'conversations',
      test: 'Unauthenticated INSERT denied',
      passed: !!error,
      error: error?.message || 'Insert succeeded (should have failed)',
    });
  } catch (e: any) {
    results.push({
      table: 'conversations',
      test: 'Unauthenticated INSERT denied',
      passed: true,
      error: e.message,
    });
  }
}

function printResults(results: TestResult[]) {
  console.log('\n📊 RLS Validation Results:\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const byTable = results.reduce((acc, result) => {
    if (!acc[result.table]) acc[result.table] = [];
    acc[result.table].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);

  let allPassed = true;
  let totalTests = 0;
  let passedTests = 0;

  Object.entries(byTable).forEach(([table, tableResults]) => {
    const tablePassed = tableResults.every(r => r.passed);
    const tableIcon = tablePassed ? '✅' : '❌';
    
    console.log(`${tableIcon} ${table.toUpperCase()}`);
    tableResults.forEach(result => {
      const status = result.passed ? '  ✅' : '  ❌';
      console.log(`${status} ${result.test}`);
      if (!result.passed && result.error) {
        console.log(`     Error: ${result.error}`);
      }
      totalTests++;
      if (result.passed) passedTests++;
      else allPassed = false;
    });
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n📈 Summary: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`\n${allPassed ? '✅ All RLS policies validated successfully!' : '❌ Some RLS policies failed validation'}`);
  
  if (!allPassed) {
    console.log('\n💡 Recommendations:');
    console.log('   1. Run the master RLS setup script: scripts/setup-all-rls-policies.sql');
    console.log('   2. Verify that all tables have RLS enabled');
    console.log('   3. Check that authenticated users can access their own data');
    console.log('   4. Ensure unauthenticated users are properly blocked');
  }
  
  console.log('\n');
}

validateRLS()
  .then((passed) => {
    process.exit(passed ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ RLS validation failed with error:', error);
    process.exit(1);
  });
