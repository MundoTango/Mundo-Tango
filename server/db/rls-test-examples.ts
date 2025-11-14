/**
 * RLS Test Examples
 * 
 * This file demonstrates how to test RLS policies and provides
 * examples of correct and incorrect usage.
 * 
 * Run tests with: tsx server/db/rls-test-examples.ts
 */

import { db, withUserContext } from '@shared/db';
import { 
  financialGoals, 
  healthGoals, 
  budgetEntries, 
  nutritionLogs,
  events,
  posts,
  userSettings 
} from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Test 1: Financial Goals - Owner Only Access
 */
async function testFinancialGoalsRLS() {
  console.log('\n=== Test 1: Financial Goals RLS ===');
  
  try {
    // User A (ID: 1) tries to access their own data
    console.log('User A (ID: 1) accessing own financial goals...');
    const userAGoals = await withUserContext(1, async (db) => {
      return db.select().from(financialGoals).where(eq(financialGoals.userId, 1));
    });
    console.log(`✅ User A can see own goals: ${userAGoals.length} records`);

    // User A tries to access User B's data
    console.log('User A (ID: 1) trying to access User B (ID: 2) goals...');
    const userBGoalsAttempt = await withUserContext(1, async (db) => {
      return db.select().from(financialGoals).where(eq(financialGoals.userId, 2));
    });
    
    if (userBGoalsAttempt.length === 0) {
      console.log('✅ PASS: User A cannot see User B\'s goals (RLS working!)');
    } else {
      console.log('❌ FAIL: User A can see User B\'s goals (RLS NOT working!)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test 2: Health Goals - Owner Only Access
 */
async function testHealthGoalsRLS() {
  console.log('\n=== Test 2: Health Goals RLS ===');
  
  try {
    // User trying to access another user's health data
    console.log('User A trying to access User B\'s health goals...');
    const goals = await withUserContext(1, async (db) => {
      return db.select().from(healthGoals).where(eq(healthGoals.userId, 2));
    });
    
    if (goals.length === 0) {
      console.log('✅ PASS: Private health data protected by RLS');
    } else {
      console.log('❌ FAIL: Health data accessible across users');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test 3: Posts - Visibility-Based Access
 */
async function testPostsRLS() {
  console.log('\n=== Test 3: Posts Visibility RLS ===');
  
  try {
    // Any user can see public posts
    console.log('User A accessing public posts...');
    const publicPosts = await withUserContext(1, async (db) => {
      return db.select().from(posts).where(eq(posts.visibility, 'public'));
    });
    console.log(`✅ User can see ${publicPosts.length} public posts`);

    // User cannot see private posts from other users
    console.log('User A trying to access all private posts...');
    const privatePosts = await withUserContext(1, async (db) => {
      return db.select().from(posts).where(eq(posts.visibility, 'private'));
    });
    console.log(`Accessible private posts: ${privatePosts.length} (should only be User A's own)`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test 4: Events - Organizer and Public Access
 */
async function testEventsRLS() {
  console.log('\n=== Test 4: Events RLS ===');
  
  try {
    // Public events should be visible to everyone
    console.log('User A accessing public events...');
    const publicEvents = await withUserContext(1, async (db) => {
      return db.select().from(events).where(eq(events.visibility, 'public'));
    });
    console.log(`✅ User can see ${publicEvents.length} public events`);

    // User can see events they're organizing
    console.log('User A accessing events they organize...');
    const myEvents = await withUserContext(1, async (db) => {
      return db.select().from(events).where(eq(events.organizerId, 1));
    });
    console.log(`✅ User can see ${myEvents.length} events they organize`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test 5: Budget Entries - Owner Only
 */
async function testBudgetEntriesRLS() {
  console.log('\n=== Test 5: Budget Entries RLS ===');
  
  try {
    // User trying to access another user's budget
    console.log('User A trying to access User B\'s budget entries...');
    const entries = await withUserContext(1, async (db) => {
      return db.select().from(budgetEntries).where(eq(budgetEntries.userId, 2));
    });
    
    if (entries.length === 0) {
      console.log('✅ PASS: Budget data protected by RLS');
    } else {
      console.log('❌ FAIL: Budget data accessible across users');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test 6: Nutrition Logs - Owner Only
 */
async function testNutritionLogsRLS() {
  console.log('\n=== Test 6: Nutrition Logs RLS ===');
  
  try {
    console.log('User A trying to access User B\'s nutrition logs...');
    const logs = await withUserContext(1, async (db) => {
      return db.select().from(nutritionLogs).where(eq(nutritionLogs.userId, 2));
    });
    
    if (logs.length === 0) {
      console.log('✅ PASS: Nutrition data protected by RLS');
    } else {
      console.log('❌ FAIL: Nutrition data accessible across users');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test 7: User Settings - Owner Only
 */
async function testUserSettingsRLS() {
  console.log('\n=== Test 7: User Settings RLS ===');
  
  try {
    console.log('User A trying to access User B\'s settings...');
    const settings = await withUserContext(1, async (db) => {
      return db.select().from(userSettings).where(eq(userSettings.userId, 2));
    });
    
    if (settings.length === 0) {
      console.log('✅ PASS: User settings protected by RLS');
    } else {
      console.log('❌ FAIL: User settings accessible across users');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test 8: Demonstrate Common Mistakes
 */
async function testCommonMistakes() {
  console.log('\n=== Test 8: Common Mistakes ===');
  
  // ❌ WRONG: Querying without user context
  console.log('\n❌ BAD PRACTICE: Querying without user context');
  console.log('const goals = await db.select().from(financialGoals);');
  console.log('^ This returns ALL users\' data! (If RLS not enforced)');
  
  // ✅ CORRECT: Using withUserContext
  console.log('\n✅ GOOD PRACTICE: Using withUserContext');
  console.log('const goals = await withUserContext(userId, async (db) => {');
  console.log('  return db.select().from(financialGoals);');
  console.log('});');
  console.log('^ RLS automatically filters to user\'s data only');

  // ❌ WRONG: Trusting client-provided user ID
  console.log('\n❌ BAD PRACTICE: Using client-provided user ID');
  console.log('const userId = req.body.userId; // Client can fake this!');
  console.log('const goals = await withUserContext(userId, ...);');
  
  // ✅ CORRECT: Using authenticated user ID from JWT
  console.log('\n✅ GOOD PRACTICE: Using authenticated user ID');
  console.log('const userId = req.user.id; // From verified JWT token');
  console.log('const goals = await withUserContext(userId, ...);');
}

/**
 * Run All Tests
 */
async function runAllTests() {
  console.log('========================================');
  console.log('RLS SECURITY TESTS');
  console.log('========================================');
  console.log('Testing Row Level Security policies to ensure');
  console.log('users cannot access other users\' private data');
  console.log('========================================');

  try {
    await testFinancialGoalsRLS();
    await testHealthGoalsRLS();
    await testPostsRLS();
    await testEventsRLS();
    await testBudgetEntriesRLS();
    await testNutritionLogsRLS();
    await testUserSettingsRLS();
    await testCommonMistakes();

    console.log('\n========================================');
    console.log('ALL TESTS COMPLETE');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Export for use in other test files
export {
  testFinancialGoalsRLS,
  testHealthGoalsRLS,
  testPostsRLS,
  testEventsRLS,
  testBudgetEntriesRLS,
  testNutritionLogsRLS,
  testUserSettingsRLS,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
