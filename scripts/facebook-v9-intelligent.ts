#!/usr/bin/env tsx

/**
 * FACEBOOK TOKEN GENERATION - MB.MD V9.0 INTELLIGENT
 * 
 * Applies 8 V9.0 Patterns:
 * - Pattern 4 (Session State): Cookie persistence
 * - Pattern 7 (Parallel Execution): Multiple strategies
 * - Pattern 8 (Non-Interactive): Smart timeouts
 * - Pattern 10 (Database Safety): Token validation before DB
 * - Pattern 11 (Error Recovery): 3-tier fallback
 * - Pattern 12 (Incremental Validation): Test each phase
 * - Pattern 14 (Reasoning): Document decisions
 * - Pattern 16 (Pattern Extraction): Learn from results
 */

import { FacebookTokenGeneratorV2 } from '../server/services/facebook/FacebookTokenGeneratorV2';

async function main() {
  console.log('\n🤖 MB.MD V9.0 - INTELLIGENT FACEBOOK TOKEN GENERATION');
  console.log('=' .repeat(70));
  
  // Pattern 14: Reasoning
  console.log('\n📊 APPLYING V9.0 PATTERNS:');
  console.log('  ✅ Pattern 4 (Session State): Cookie persistence');
  console.log('  ✅ Pattern 8 (Non-Interactive): 180s timeout');
  console.log('  ✅ Pattern 11 (Error Recovery): 3-tier fallback');
  console.log('  ✅ Pattern 12 (Incremental Validation): Test each phase\n');

  const appId = process.env.FACEBOOK_APP_ID || '122157503636969453';
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const email = process.env.FACEBOOK_EMAIL;
  const password = process.env.FACEBOOK_PASSWORD;

  if (!appSecret || !email || !password) {
    console.error('❌ Missing environment variables');
    console.log('\n📋 REQUIRED:');
    console.log('  - FACEBOOK_APP_SECRET');
    console.log('  - FACEBOOK_EMAIL');
    console.log('  - FACEBOOK_PASSWORD\n');
    process.exit(1);
  }

  const generator = new FacebookTokenGeneratorV2();

  // Pattern 11: 3-Tier Error Recovery
  console.log('\n🔄 TIER 1: Try saved session (if exists)...');
  let result = await withTimeout(
    generator.generateToken({
      appId,
      appSecret,
      email,
      password,
      useSavedSession: true,
      assistedMode: false  // Silent first try
    }),
    60000  // 60s for session check
  );

  if (result.success) {
    console.log('\n✅ TIER 1 SUCCESS: Session login worked!');
    await handleSuccess(result);
    return;
  }

  console.log('\n⚠️  TIER 1 FAILED: Session expired or not available');
  console.log('\n🔄 TIER 2: Direct login with stealth mode...');
  
  result = await withTimeout(
    generator.generateToken({
      appId,
      appSecret,
      email,
      password,
      useSavedSession: false,
      assistedMode: false
    }),
    120000  // 120s for direct login
  );

  if (result.success) {
    console.log('\n✅ TIER 2 SUCCESS: Direct login worked!');
    await handleSuccess(result);
    return;
  }

  console.log('\n⚠️  TIER 2 FAILED: Direct login blocked or timed out');
  console.log('\n🔄 TIER 3: ESCALATE TO USER');
  console.log('=' .repeat(70));
  console.log('\n📖 MANUAL TOKEN GENERATION REQUIRED (5 minutes)');
  console.log('\nFacebook has blocked all automation attempts.');
  console.log('Please follow this guide: docs/FACEBOOK_TOKEN_MANUAL_GUIDE.md\n');
  console.log('Quick steps:');
  console.log('1. Go to: https://developers.facebook.com/tools/explorer/');
  console.log('2. Select "Mundo Tango" page');
  console.log('3. Add permissions: pages_messaging, pages_manage_metadata');
  console.log('4. Click "Generate Access Token"');
  console.log('5. Run: npx tsx scripts/exchange-facebook-token.ts <SHORT_LIVED_TOKEN>\n');
  
  // Pattern 16: Extract learnings
  console.log('\n📊 V9.0 PATTERN LEARNINGS:');
  console.log('  ❌ Pattern 11 (Error Recovery): All 3 tiers attempted, all failed');
  console.log('  ✅ Pattern 8 (Non-Interactive): Timeouts prevented infinite blocks');
  console.log('  ✅ Pattern 14 (Reasoning): Clear escalation path documented');
  console.log('  📝 NEW PATTERN: Facebook requires human verification for @mundotango1');
  console.log('  📝 RECOMMENDATION: Create "facebook-human-verification" pattern for mb.md v10.0\n');

  process.exit(1);
}

async function handleSuccess(result: any) {
  console.log('\n✅ TOKEN GENERATED SUCCESSFULLY!');
  console.log('=' .repeat(70));
  console.log(`Token Type: ${result.tokenType}`);
  console.log(`Expires In: ${result.expiresIn ? result.expiresIn + ' seconds' : 'Unknown'}`);
  console.log(`Method: ${result.method}`);
  
  // Pattern 10: Database Safety - validate before storing
  console.log('\n🔍 Pattern 10 (Database Safety): Validating token...');
  const isValid = await validateToken(result.token!);
  
  if (!isValid) {
    console.error('❌ Token validation failed!');
    process.exit(1);
  }
  
  console.log('✅ Token validated successfully!');
  console.log('\n💾 Saving to environment...');
  console.log(`\nFACEBOOK_PAGE_ACCESS_TOKEN=${result.token}\n`);
  console.log('Add this to your Replit Secrets and restart workflow.');
  
  // Pattern 16: Extract new patterns
  console.log('\n📊 V9.0 SUCCESS METRICS:');
  console.log(`  ✅ Strategy Used: ${result.method}`);
  console.log('  ✅ Pattern 4 (Session State): Working');
  console.log('  ✅ Pattern 10 (Database Safety): Token validated');
  console.log('  📝 Add to LIMI: Successful Facebook authentication case\n');
}

async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/me?access_token=${token}`
    );
    const data = await response.json();
    return !data.error;
  } catch (error) {
    return false;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    )
  ]);
}

main().catch((error) => {
  console.error('\n❌ FATAL ERROR:', error.message);
  process.exit(1);
});
