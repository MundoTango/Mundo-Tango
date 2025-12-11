/**
 * MB.MD v9.9.4 - Seed Admin Messaging & Fix Reactions/Notifications
 */

import { db } from '../../shared/db';
import { users, posts, reactions, notifications, chatRooms, chatRoomUsers, chatMessages } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';

async function seedAdminMessaging() {
  console.log('🚀 MB.MD: Seeding admin messaging & fixing reactions...\n');

  // Get admin and other users
  const allUsers = await db.select().from(users);
  const admin = allUsers.find(u => u.email === 'admin@mundotango.life');
  if (!admin) {
    console.error('❌ Admin user not found!');
    process.exit(1);
  }
  const otherUsers = allUsers.filter(u => u.id !== admin.id);
  console.log(`✅ Found admin (ID: ${admin.id}) and ${otherUsers.length} other users`);

  // 1. Add reactions with correct field name
  console.log('\n❤️ Creating reactions...');
  const adminPosts = await db.select().from(posts).where(eq(posts.userId, admin.id));
  const reactionTypes = ['love', 'passion', 'fire', 'tango', 'celebrate'];
  let reactionsCreated = 0;
  
  for (const post of adminPosts) {
    for (let i = 0; i < Math.min(3, otherUsers.length); i++) {
      const user = otherUsers[i];
      try {
        await db.insert(reactions).values({
          postId: post.id,
          userId: user.id,
          reactionType: reactionTypes[Math.floor(Math.random() * reactionTypes.length)],
        }).onConflictDoNothing();
        reactionsCreated++;
      } catch (e: any) {
        console.log(`  Reaction error: ${e.message?.slice(0, 50)}`);
      }
    }
  }
  console.log(`✅ Created ${reactionsCreated} reactions`);

  // 2. Add notifications with correct fields
  console.log('\n🔔 Creating notifications...');
  let notifsCreated = 0;
  const notifData = [
    { type: 'follow', title: 'New Follower', message: 'started following you' },
    { type: 'like', title: 'Post Liked', message: 'liked your post about tango' },
    { type: 'friend_accepted', title: 'Friend Request Accepted', message: 'accepted your friend request' },
    { type: 'event_invite', title: 'Event Invitation', message: 'invited you to a milonga' },
    { type: 'message', title: 'New Message', message: 'sent you a message' },
  ];

  for (let i = 0; i < Math.min(5, otherUsers.length); i++) {
    const user = otherUsers[i];
    const notif = notifData[i % notifData.length];
    try {
      await db.insert(notifications).values({
        userId: admin.id,
        type: notif.type,
        title: notif.title,
        message: `${user.name || user.username} ${notif.message}`,
        isRead: i > 2, // First 3 unread
        data: JSON.stringify({ relatedUserId: user.id }),
      });
      notifsCreated++;
    } catch (e: any) {
      console.log(`  Notification error: ${e.message?.slice(0, 50)}`);
    }
  }
  console.log(`✅ Created ${notifsCreated} notifications`);

  // 3. Create chat rooms and messages
  console.log('\n💬 Creating chat rooms and messages...');
  
  for (let i = 0; i < Math.min(3, otherUsers.length); i++) {
    const user = otherUsers[i];
    try {
      // Create chat room
      const [room] = await db.insert(chatRooms).values({
        name: `Chat with ${user.name || user.username}`,
        type: 'direct',
        createdBy: admin.id,
      }).returning();

      if (room) {
        // Add participants
        await db.insert(chatRoomUsers).values([
          { chatRoomId: room.id, userId: admin.id },
          { chatRoomId: room.id, userId: user.id },
        ]).onConflictDoNothing();

        // Add messages
        const messages = [
          { userId: user.id, content: `Hi! Great to connect with you on MundoTango!` },
          { userId: admin.id, content: `Welcome! Looking forward to dancing together soon.` },
          { userId: user.id, content: `I love the platform! When's the next milonga in Buenos Aires?` },
          { userId: admin.id, content: `There's one this Friday at La Catedral - you should come!` },
        ];

        for (const msg of messages) {
          await db.insert(chatMessages).values({
            chatRoomId: room.id,
            userId: msg.userId,
            content: msg.content,
          });
        }
        console.log(`  Created chat with ${user.name || user.username}`);
      }
    } catch (e: any) {
      console.log(`  Chat error: ${e.message?.slice(0, 80)}`);
    }
  }

  // Final counts
  console.log('\n📊 === FINAL COUNTS ===');
  const counts = await Promise.all([
    db.select({ count: sql`count(*)` }).from(reactions),
    db.select({ count: sql`count(*)` }).from(notifications),
    db.select({ count: sql`count(*)` }).from(chatRooms),
    db.select({ count: sql`count(*)` }).from(chatMessages),
  ]);

  console.log(`Reactions: ${counts[0][0]?.count}`);
  console.log(`Notifications: ${counts[1][0]?.count}`);
  console.log(`Chat Rooms: ${counts[2][0]?.count}`);
  console.log(`Chat Messages: ${counts[3][0]?.count}`);

  console.log('\n✅ MB.MD: Messaging seeding complete!');
  process.exit(0);
}

seedAdminMessaging().catch(console.error);
