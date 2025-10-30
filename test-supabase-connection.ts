/**
 * SUPABASE CONNECTION TEST
 * Run this to verify Supabase setup is working correctly
 */

import { supabaseAdmin } from './server/lib/supabase.js';

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');

  // Test 1: Check environment variables
  console.log('📋 Test 1: Environment Variables');
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasAnonKey = !!process.env.VITE_SUPABASE_ANON_KEY;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log(`  SUPABASE_URL: ${hasUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`  VITE_SUPABASE_ANON_KEY: ${hasAnonKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${hasServiceKey ? '✅ Set' : '❌ Missing'}`);
  
  if (!hasUrl || !hasAnonKey || !hasServiceKey) {
    console.log('\n❌ Missing required environment variables!');
    process.exit(1);
  }

  // Test 2: Database connection
  console.log('\n📋 Test 2: Database Connection');
  try {
    const { data: tables, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows, which is OK
      throw error;
    }
    
    console.log('  ✅ Database connection successful!');
  } catch (error: any) {
    console.log(`  ❌ Database error: ${error.message}`);
    process.exit(1);
  }

  // Test 3: Check all tables exist
  console.log('\n📋 Test 3: Verify Tables');
  const expectedTables = [
    'profiles',
    'posts',
    'likes',
    'comments',
    'events',
    'rsvps',
    'communities',
    'community_members',
    'messages',
    'conversations',
    'conversation_participants',
    'subscriptions',
    'ai_conversations'
  ];

  for (const table of expectedTables) {
    try {
      const { error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      console.log(`  ✅ ${table}`);
    } catch (error: any) {
      console.log(`  ❌ ${table}: ${error.message}`);
    }
  }

  // Test 4: Test auth (sign up a test user)
  console.log('\n📋 Test 4: Authentication');
  try {
    const testEmail = `test-${Date.now()}@mundotango.test`;
    const testPassword = 'TestPassword123!';
    
    const { data, error } = await supabaseAdmin.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (error) throw error;

    console.log('  ✅ Auth signup successful!');
    console.log(`  ✅ Test user created: ${testEmail}`);
    
    // Check if profile was auto-created
    if (data.user) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.log('  ⚠️  Profile auto-creation may not be working (trigger issue)');
      } else {
        console.log('  ✅ Profile auto-created successfully!');
      }
    }
  } catch (error: any) {
    console.log(`  ❌ Auth error: ${error.message}`);
  }

  console.log('\n✨ Supabase connection test complete!\n');
  process.exit(0);
}

testSupabaseConnection();
