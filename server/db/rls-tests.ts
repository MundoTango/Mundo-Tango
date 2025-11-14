/**
 * ROW LEVEL SECURITY (RLS) TESTS
 * 
 * These tests verify that RLS policies correctly isolate user data.
 * 
 * CRITICAL: These tests must pass before deploying to production.
 * RLS failures can lead to GDPR violations and data breaches.
 */

import { db } from "@shared/db";
import { 
  users, 
  posts, 
  chatMessages, 
  chatRooms,
  chatRoomUsers,
  financialAccounts, 
  friendships,
  notifications,
  payments,
  subscriptions,
} from "@shared/schema";
import { withUserContext, setDbUser } from "./withRLS";
import { eq, and } from "drizzle-orm";

// ============================================================================
// TEST UTILITIES
// ============================================================================

interface TestUser {
  id: number;
  email: string;
  username: string;
}

let testUser1: TestUser;
let testUser2: TestUser;

/**
 * Setup: Create two test users
 */
async function setupTestUsers(): Promise<void> {
  console.log('[RLS TEST] Setting up test users...');
  
  // Create test user 1
  const [user1] = await db.insert(users).values({
    name: 'Test User 1',
    username: 'testuser1',
    email: 'test1@example.com',
    password: 'hashed_password_1',
  }).returning();
  
  testUser1 = user1;
  
  // Create test user 2
  const [user2] = await db.insert(users).values({
    name: 'Test User 2',
    username: 'testuser2',
    email: 'test2@example.com',
    password: 'hashed_password_2',
  }).returning();
  
  testUser2 = user2;
  
  console.log(`[RLS TEST] Created test users: ${testUser1.id}, ${testUser2.id}`);
}

/**
 * Cleanup: Remove test users and their data
 */
async function cleanupTestUsers(): Promise<void> {
  console.log('[RLS TEST] Cleaning up test users...');
  
  await db.delete(users).where(eq(users.email, 'test1@example.com'));
  await db.delete(users).where(eq(users.email, 'test2@example.com'));
  
  console.log('[RLS TEST] Cleanup complete');
}

// ============================================================================
// RLS TEST SUITE
// ============================================================================

/**
 * TEST 1: User A cannot read User B's financial data
 */
export async function testFinancialDataIsolation(): Promise<boolean> {
  console.log('\n[RLS TEST 1] Testing financial data isolation...');
  
  try {
    // User 1 creates a financial account
    await setDbUser(testUser1.id);
    const [account1] = await db.insert(financialAccounts).values({
      userId: testUser1.id,
      accountType: 'checking',
      accountName: 'User 1 Checking Account',
      balance: 10000,
      currency: 'USD',
    }).returning();
    
    console.log(`[RLS TEST 1] User 1 created account: ${account1.id}`);
    
    // User 2 tries to read User 1's financial account
    await setDbUser(testUser2.id);
    const user2Accounts = await db
      .select()
      .from(financialAccounts)
      .where(eq(financialAccounts.id, account1.id));
    
    if (user2Accounts.length > 0) {
      console.error('[RLS TEST 1] FAILED: User 2 can read User 1\'s financial data!');
      return false;
    }
    
    // User 1 can still read their own account
    await setDbUser(testUser1.id);
    const user1Accounts = await db
      .select()
      .from(financialAccounts)
      .where(eq(financialAccounts.userId, testUser1.id));
    
    if (user1Accounts.length === 0) {
      console.error('[RLS TEST 1] FAILED: User 1 cannot read their own financial data!');
      return false;
    }
    
    console.log('[RLS TEST 1] PASSED: Financial data is properly isolated');
    return true;
    
  } catch (error) {
    console.error('[RLS TEST 1] ERROR:', error);
    return false;
  }
}

/**
 * TEST 2: Public posts visible to all, private posts only to owner
 */
export async function testPostVisibility(): Promise<boolean> {
  console.log('\n[RLS TEST 2] Testing post visibility...');
  
  try {
    // User 1 creates a public post
    await setDbUser(testUser1.id);
    const [publicPost] = await db.insert(posts).values({
      userId: testUser1.id,
      content: 'This is a public post',
      visibility: 'public',
    }).returning();
    
    // User 1 creates a private post
    const [privatePost] = await db.insert(posts).values({
      userId: testUser1.id,
      content: 'This is a private post',
      visibility: 'private',
    }).returning();
    
    console.log(`[RLS TEST 2] Created public post: ${publicPost.id}, private post: ${privatePost.id}`);
    
    // User 2 tries to read both posts
    await setDbUser(testUser2.id);
    
    // Should see public post
    const publicPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.id, publicPost.id));
    
    if (publicPosts.length === 0) {
      console.error('[RLS TEST 2] FAILED: User 2 cannot see public post!');
      return false;
    }
    
    // Should NOT see private post
    const privatePosts = await db
      .select()
      .from(posts)
      .where(eq(posts.id, privatePost.id));
    
    if (privatePosts.length > 0) {
      console.error('[RLS TEST 2] FAILED: User 2 can see private post!');
      return false;
    }
    
    console.log('[RLS TEST 2] PASSED: Post visibility works correctly');
    return true;
    
  } catch (error) {
    console.error('[RLS TEST 2] ERROR:', error);
    return false;
  }
}

/**
 * TEST 3: Friends can see friends-only posts
 */
export async function testFriendsOnlyPosts(): Promise<boolean> {
  console.log('\n[RLS TEST 3] Testing friends-only posts...');
  
  try {
    // Create friendship between users
    await setDbUser(testUser1.id);
    await db.insert(friendships).values({
      userId: testUser1.id,
      friendId: testUser2.id,
      status: 'active',
    });
    
    // Reverse friendship for symmetry
    await db.insert(friendships).values({
      userId: testUser2.id,
      friendId: testUser1.id,
      status: 'active',
    });
    
    // User 1 creates friends-only post
    const [friendsPost] = await db.insert(posts).values({
      userId: testUser1.id,
      content: 'This is a friends-only post',
      visibility: 'friends_only',
    }).returning();
    
    console.log(`[RLS TEST 3] Created friends-only post: ${friendsPost.id}`);
    
    // User 2 (who is a friend) should be able to see it
    await setDbUser(testUser2.id);
    const visiblePosts = await db
      .select()
      .from(posts)
      .where(eq(posts.id, friendsPost.id));
    
    if (visiblePosts.length === 0) {
      console.error('[RLS TEST 3] FAILED: Friend cannot see friends-only post!');
      return false;
    }
    
    console.log('[RLS TEST 3] PASSED: Friends can see friends-only posts');
    return true;
    
  } catch (error) {
    console.error('[RLS TEST 3] ERROR:', error);
    return false;
  }
}

/**
 * TEST 4: Only chat participants can read messages
 */
export async function testChatMessageIsolation(): Promise<boolean> {
  console.log('\n[RLS TEST 4] Testing chat message isolation...');
  
  try {
    // Create chat room
    await setDbUser(testUser1.id);
    const [chatRoom] = await db.insert(chatRooms).values({
      type: 'direct',
      name: 'Test Chat',
    }).returning();
    
    // Add User 1 to chat
    await db.insert(chatRoomUsers).values({
      chatRoomId: chatRoom.id,
      userId: testUser1.id,
    });
    
    // User 1 sends a message
    const [message] = await db.insert(chatMessages).values({
      chatRoomId: chatRoom.id,
      userId: testUser1.id,
      message: 'Hello from User 1',
    }).returning();
    
    console.log(`[RLS TEST 4] Created message: ${message.id} in room: ${chatRoom.id}`);
    
    // User 2 (not in chat) tries to read message
    await setDbUser(testUser2.id);
    const unauthorizedMessages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, message.id));
    
    if (unauthorizedMessages.length > 0) {
      console.error('[RLS TEST 4] FAILED: Non-participant can read chat messages!');
      return false;
    }
    
    // Add User 2 to chat
    await setDbUser(testUser1.id);
    await db.insert(chatRoomUsers).values({
      chatRoomId: chatRoom.id,
      userId: testUser2.id,
    });
    
    // Now User 2 should be able to read the message
    await setDbUser(testUser2.id);
    const authorizedMessages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, message.id));
    
    if (authorizedMessages.length === 0) {
      console.error('[RLS TEST 4] FAILED: Participant cannot read chat messages!');
      return false;
    }
    
    console.log('[RLS TEST 4] PASSED: Chat message isolation works correctly');
    return true;
    
  } catch (error) {
    console.error('[RLS TEST 4] ERROR:', error);
    return false;
  }
}

/**
 * TEST 5: Users can only see their own notifications
 */
export async function testNotificationIsolation(): Promise<boolean> {
  console.log('\n[RLS TEST 5] Testing notification isolation...');
  
  try {
    // User 1 creates a notification
    await setDbUser(testUser1.id);
    const [notification1] = await db.insert(notifications).values({
      userId: testUser1.id,
      type: 'system',
      title: 'Test Notification',
      message: 'This is User 1\'s notification',
    }).returning();
    
    console.log(`[RLS TEST 5] Created notification: ${notification1.id}`);
    
    // User 2 tries to read User 1's notification
    await setDbUser(testUser2.id);
    const unauthorizedNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notification1.id));
    
    if (unauthorizedNotifications.length > 0) {
      console.error('[RLS TEST 5] FAILED: User 2 can read User 1\'s notifications!');
      return false;
    }
    
    // User 1 can read their own notification
    await setDbUser(testUser1.id);
    const authorizedNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, testUser1.id));
    
    if (authorizedNotifications.length === 0) {
      console.error('[RLS TEST 5] FAILED: User 1 cannot read their own notifications!');
      return false;
    }
    
    console.log('[RLS TEST 5] PASSED: Notification isolation works correctly');
    return true;
    
  } catch (error) {
    console.error('[RLS TEST 5] ERROR:', error);
    return false;
  }
}

/**
 * TEST 6: Users can only see their own payments
 */
export async function testPaymentIsolation(): Promise<boolean> {
  console.log('\n[RLS TEST 6] Testing payment isolation...');
  
  try {
    // User 1 creates a payment
    await setDbUser(testUser1.id);
    const [payment1] = await db.insert(payments).values({
      userId: testUser1.id,
      amount: 99.99,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'card',
    }).returning();
    
    console.log(`[RLS TEST 6] Created payment: ${payment1.id}`);
    
    // User 2 tries to read User 1's payment
    await setDbUser(testUser2.id);
    const unauthorizedPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.id, payment1.id));
    
    if (unauthorizedPayments.length > 0) {
      console.error('[RLS TEST 6] FAILED: User 2 can read User 1\'s payment data!');
      return false;
    }
    
    console.log('[RLS TEST 6] PASSED: Payment isolation works correctly');
    return true;
    
  } catch (error) {
    console.error('[RLS TEST 6] ERROR:', error);
    return false;
  }
}

/**
 * TEST 7: Users can only see their own subscriptions
 */
export async function testSubscriptionIsolation(): Promise<boolean> {
  console.log('\n[RLS TEST 7] Testing subscription isolation...');
  
  try {
    // User 1 creates a subscription
    await setDbUser(testUser1.id);
    const [subscription1] = await db.insert(subscriptions).values({
      userId: testUser1.id,
      planName: 'Premium Plan',
      price: 29.99,
      currency: 'USD',
      status: 'active',
      startDate: new Date(),
    }).returning();
    
    console.log(`[RLS TEST 7] Created subscription: ${subscription1.id}`);
    
    // User 2 tries to read User 1's subscription
    await setDbUser(testUser2.id);
    const unauthorizedSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscription1.id));
    
    if (unauthorizedSubscriptions.length > 0) {
      console.error('[RLS TEST 7] FAILED: User 2 can read User 1\'s subscription data!');
      return false;
    }
    
    console.log('[RLS TEST 7] PASSED: Subscription isolation works correctly');
    return true;
    
  } catch (error) {
    console.error('[RLS TEST 7] ERROR:', error);
    return false;
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

export async function runRLSTests(): Promise<void> {
  console.log('='.repeat(80));
  console.log('RUNNING ROW LEVEL SECURITY (RLS) TESTS');
  console.log('='.repeat(80));
  
  await setupTestUsers();
  
  const results = {
    testFinancialDataIsolation: await testFinancialDataIsolation(),
    testPostVisibility: await testPostVisibility(),
    testFriendsOnlyPosts: await testFriendsOnlyPosts(),
    testChatMessageIsolation: await testChatMessageIsolation(),
    testNotificationIsolation: await testNotificationIsolation(),
    testPaymentIsolation: await testPaymentIsolation(),
    testSubscriptionIsolation: await testSubscriptionIsolation(),
  };
  
  await cleanupTestUsers();
  
  console.log('\n' + '='.repeat(80));
  console.log('RLS TEST RESULTS');
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  Object.entries(results).forEach(([testName, result]) => {
    const status = result ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status}: ${testName}`);
    if (result) passed++;
    else failed++;
  });
  
  console.log('='.repeat(80));
  console.log(`TOTAL: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(80));
  
  if (failed > 0) {
    console.error('\n⚠️  WARNING: RLS tests failed! Data isolation is compromised.');
    console.error('⚠️  DO NOT DEPLOY to production until all tests pass.');
  } else {
    console.log('\n✅ All RLS tests passed! Data isolation is working correctly.');
  }
}

// Export for CLI usage
if (require.main === module) {
  runRLSTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('RLS test suite failed:', error);
      process.exit(1);
    });
}
