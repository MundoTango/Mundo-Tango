/**
 * MB.MD v9.9.4 - Seed Admin Social Data
 * Populates admin@mundotango.life with complete profile, friends, posts, and messages
 */

import { db } from '../../shared/db';
import { users, posts, follows, friendships, reactions, notifications } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';

async function seedAdminSocialData() {
  console.log('🚀 MB.MD: Seeding admin social data...\n');

  // 1. Get admin user
  const [admin] = await db.select().from(users).where(eq(users.email, 'admin@mundotango.life'));
  if (!admin) {
    console.error('❌ Admin user not found!');
    process.exit(1);
  }
  console.log(`✅ Found admin user: ${admin.email} (ID: ${admin.id})`);

  // 2. Update admin profile with rich data
  console.log('\n📝 Updating admin profile...');
  await db.update(users).set({
    bio: 'Passionate tango dancer, organizer, and teacher. Connecting the global tango community through MundoTango. Based in Buenos Aires, dancing worldwide.',
    city: 'Buenos Aires',
    country: 'Argentina',
    firstName: 'Admin',
    lastName: 'MundoTango',
    yearsOfDancing: 15,
    tangoStartYear: 2009,
    leaderLevel: 8,
    followerLevel: 7,
    tangoRoles: ['Organizer', 'Teacher', 'DJ'],
    languages: ['English', 'Spanish', 'Portuguese'],
    primaryLanguage: 'English',
    isOnboardingComplete: true,
    isVerified: true,
    verificationBadge: true,
    occupation: 'Tango Community Founder',
    interests: ['Milongas', 'Festivals', 'Teaching', 'Music'],
  }).where(eq(users.id, admin.id));
  console.log('✅ Admin profile updated with rich data');

  // 3. Get all other users
  const allUsers = await db.select().from(users);
  const otherUsers = allUsers.filter(u => u.id !== admin.id);
  console.log(`\n👥 Found ${otherUsers.length} other users to connect with admin`);

  // 4. Create follows (admin follows everyone, everyone follows admin)
  console.log('\n🔗 Creating follows...');
  for (const user of otherUsers) {
    try {
      // Admin follows user
      await db.insert(follows).values({
        followerId: admin.id,
        followingId: user.id,
      }).onConflictDoNothing();
      
      // User follows admin
      await db.insert(follows).values({
        followerId: user.id,
        followingId: admin.id,
      }).onConflictDoNothing();
    } catch (e) {
      // Ignore duplicates
    }
  }
  const followCount = await db.select({ count: sql`count(*)` }).from(follows);
  console.log(`✅ Created follows. Total: ${followCount[0]?.count}`);

  // 5. Create friendships
  console.log('\n🤝 Creating friendships...');
  for (const user of otherUsers) {
    try {
      await db.insert(friendships).values({
        userId: admin.id,
        friendId: user.id,
        status: 'accepted',
        closenessLevel: Math.floor(Math.random() * 5) + 1,
      }).onConflictDoNothing();
    } catch (e) {
      // Ignore duplicates
    }
  }
  const friendCount = await db.select({ count: sql`count(*)` }).from(friendships);
  console.log(`✅ Created friendships. Total: ${friendCount[0]?.count}`);

  // 6. Update posts to link some to admin
  console.log('\n📝 Linking posts to admin...');
  const existingPosts = await db.select().from(posts).limit(3);
  for (const post of existingPosts) {
    await db.update(posts).set({ userId: admin.id }).where(eq(posts.id, post.id));
  }
  console.log(`✅ Linked ${existingPosts.length} posts to admin`);

  // 7. Create new posts for admin
  console.log('\n✍️ Creating new posts for admin...');
  const newPosts = [
    {
      userId: admin.id,
      content: '🎉 Welcome to MundoTango! Our global tango community platform is now live. Connect with dancers, find events, and share your tango journey with us!',
      type: 'text',
    },
    {
      userId: admin.id,
      content: '📍 Just returned from an amazing milonga in Buenos Aires. The energy was incredible! Who else loves dancing at La Catedral?',
      type: 'text',
    },
    {
      userId: admin.id,
      content: '🎵 Pro tip: When choosing tango music for your milonga, always include a good mix of D\'Arienzo, Di Sarli, and Pugliese. Each orchestra brings a different energy to the floor!',
      type: 'text',
    },
  ];

  for (const post of newPosts) {
    try {
      await db.insert(posts).values(post);
    } catch (e) {
      // Ignore errors
    }
  }
  const postCount = await db.select({ count: sql`count(*)` }).from(posts);
  console.log(`✅ Created new posts. Total posts: ${postCount[0]?.count}`);

  // 8. Create reactions on admin's posts
  console.log('\n❤️ Creating reactions...');
  const adminPosts = await db.select().from(posts).where(eq(posts.userId, admin.id));
  for (const post of adminPosts) {
    for (const user of otherUsers.slice(0, 3)) {
      try {
        await db.insert(reactions).values({
          postId: post.id,
          userId: user.id,
          type: ['like', 'love', 'celebrate'][Math.floor(Math.random() * 3)],
        }).onConflictDoNothing();
      } catch (e) {
        // Ignore errors
      }
    }
  }
  const reactionCount = await db.select({ count: sql`count(*)` }).from(reactions);
  console.log(`✅ Created reactions. Total: ${reactionCount[0]?.count}`);

  // 9. Create notifications for admin
  console.log('\n🔔 Creating notifications...');
  const notificationTypes = [
    { type: 'follow', message: 'started following you' },
    { type: 'like', message: 'liked your post' },
    { type: 'friend_request', message: 'accepted your friend request' },
  ];

  for (let i = 0; i < Math.min(5, otherUsers.length); i++) {
    const user = otherUsers[i];
    const notifType = notificationTypes[i % notificationTypes.length];
    try {
      await db.insert(notifications).values({
        userId: admin.id,
        type: notifType.type,
        message: `${user.name || user.username} ${notifType.message}`,
        isRead: false,
        relatedUserId: user.id,
      });
    } catch (e) {
      // Ignore errors
    }
  }
  const notifCount = await db.select({ count: sql`count(*)` }).from(notifications);
  console.log(`✅ Created notifications. Total: ${notifCount[0]?.count}`);

  // Final summary
  console.log('\n📊 === FINAL SUMMARY ===');
  const finalCounts = await Promise.all([
    db.select({ count: sql`count(*)` }).from(users),
    db.select({ count: sql`count(*)` }).from(posts),
    db.select({ count: sql`count(*)` }).from(follows),
    db.select({ count: sql`count(*)` }).from(friendships),
    db.select({ count: sql`count(*)` }).from(reactions),
    db.select({ count: sql`count(*)` }).from(notifications),
  ]);

  console.log(`Users: ${finalCounts[0][0]?.count}`);
  console.log(`Posts: ${finalCounts[1][0]?.count}`);
  console.log(`Follows: ${finalCounts[2][0]?.count}`);
  console.log(`Friendships: ${finalCounts[3][0]?.count}`);
  console.log(`Reactions: ${finalCounts[4][0]?.count}`);
  console.log(`Notifications: ${finalCounts[5][0]?.count}`);

  console.log('\n✅ MB.MD: Admin social data seeding complete!');
  process.exit(0);
}

seedAdminSocialData().catch(console.error);
