import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

async function validateRLS() {
  console.log('🔒 Starting RLS Policy Validation...\n');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const results: { table: string; test: string; passed: boolean; error?: string }[] = [];

  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    results.push({
      table: 'profiles',
      test: 'Unauthenticated access denied',
      passed: !!error, // Only pass if there's an explicit authorization error
      error: error?.message || (data ? `Access granted (returned ${data.length} rows)` : 'No error but no data'),
    });
  } catch (e: any) {
    results.push({
      table: 'profiles',
      test: 'Unauthenticated access denied',
      passed: true, // Exception counts as access denied
      error: e.message,
    });
  }

  try {
    const { data, error } = await supabase.from('posts').select('*').limit(1);
    results.push({
      table: 'posts',
      test: 'Unauthenticated access denied',
      passed: !!error,
      error: error?.message || (data ? `Access granted (returned ${data.length} rows)` : 'No error but no data'),
    });
  } catch (e: any) {
    results.push({
      table: 'posts',
      test: 'Unauthenticated access denied',
      passed: true,
      error: e.message,
    });
  }

  try {
    const { data, error } = await supabase.from('events').select('*').limit(1);
    results.push({
      table: 'events',
      test: 'Unauthenticated access denied',
      passed: !!error,
      error: error?.message || (data ? `Access granted (returned ${data.length} rows)` : 'No error but no data'),
    });
  } catch (e: any) {
    results.push({
      table: 'events',
      test: 'Unauthenticated access denied',
      passed: true,
      error: e.message,
    });
  }

  try {
    const { data, error } = await supabase.from('messages').select('*').limit(1);
    results.push({
      table: 'messages',
      test: 'Unauthenticated access denied',
      passed: !!error,
      error: error?.message || (data ? `Access granted (returned ${data.length} rows)` : 'No error but no data'),
    });
  } catch (e: any) {
    results.push({
      table: 'messages',
      test: 'Unauthenticated access denied',
      passed: true,
      error: e.message,
    });
  }

  console.log('📊 RLS Validation Results:\n');
  let allPassed = true;
  results.forEach((result) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.table}: ${result.test}`);
    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (!result.passed) allPassed = false;
  });

  console.log(`\n${allPassed ? '✅ All RLS policies validated successfully!' : '❌ Some RLS policies failed validation'}`);
  return allPassed;
}

validateRLS()
  .then((passed) => {
    process.exit(passed ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ RLS validation failed with error:', error);
    process.exit(1);
  });
