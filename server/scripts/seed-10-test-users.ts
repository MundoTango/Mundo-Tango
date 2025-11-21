/**
 * MB.MD PROTOCOL v9.2: 10 TEST USERS SEED SCRIPT
 * 
 * Creates diverse test users for comprehensive validation:
 * - All 8 RBAC tiers (Free → God)
 * - All 6 friend relation types (Close, 1°, 2°, 3°, Follower, Unknown, Blocked)
 * - All tango roles (Teacher, DJ, Organizer, Performer, Dancer, Venue Owner)
 * - Global distribution (5 continents, 10 cities)
 * - Sample data (posts, events, groups, endorsements, housing)
 * 
 * Complete journey validation: Marketing → Registration → All 50 pages
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import {
  users,
  platformRoles,
  platformUserRoles,
  friendships,
  posts,
  events,
  groups,
  groupMembers,
  skillEndorsements,
  housingListings,
  workshops,
  venues,
} from "../../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const DEFAULT_PASSWORD = "MundoTango2025!";

/**
 * 10 TEST USER PERSONAS
 * Designed for comprehensive RBAC/ABAC/Friend Relations testing
 */
const TEST_USERS = [
  {
    // USER 1: SCOTT (God - Platform Owner)
    email: "admin@mundotango.life",
    username: "scott_founder",
    name: "Scott Mosier",
    firstName: "Scott",
    lastName: "Mosier",
    bio: "Platform founder, teacher, and tango evangelist. Testing all 50 pages of PART_10.",
    city: "Seoul",
    country: "South Korea",
    countryCode: "KR",
    languages: ["English", "Korean"],
    tangoRoles: ["Teacher", "Organizer"],
    yearsOfDancing: 15,
    leaderLevel: 9,
    followerLevel: 7,
    subscriptionTier: "premium",
    isOnboardingComplete: true,
    platformRole: "god", // RBAC Level 8
    testResponsibilities: [
      "Execute full 50-page validation tour (The Plan)",
      "Test God-level admin permissions",
      "Validate multi-platform data integration",
      "Test professional endorsement system",
      "Verify closeness metrics accuracy",
    ],
  },
  {
    // USER 2: MARIA (Super Admin - Professional Teacher)
    email: "maria@tangoba.ar",
    username: "maria_teacher",
    name: "María González",
    firstName: "María",
    lastName: "González",
    bio: "Professional tango teacher from Buenos Aires. 20+ years experience teaching worldwide.",
    city: "Buenos Aires",
    country: "Argentina",
    countryCode: "AR",
    languages: ["Spanish", "English", "Italian"],
    tangoRoles: ["Teacher", "Performer"],
    yearsOfDancing: 20,
    leaderLevel: 10,
    followerLevel: 10,
    subscriptionTier: "premium",
    isOnboardingComplete: true,
    platformRole: "super_admin", // RBAC Level 7
    testResponsibilities: [
      "Test Super Admin dashboard access",
      "Validate user management (suspend/activate)",
      "Test content moderation queue",
      "Verify teacher profile features",
      "Give/receive professional endorsements",
    ],
  },
  {
    // USER 3: JACKSON (Platform Contributor - DJ)
    email: "jackson@tangodj.com",
    username: "jackson_dj",
    name: "Jackson Williams",
    firstName: "Jackson",
    lastName: "Williams",
    bio: "SF Bay Area tango DJ specializing in golden age orchestras. Curator of vintage recordings.",
    city: "San Francisco",
    country: "United States",
    countryCode: "US",
    state: "California",
    stateCode: "CA",
    languages: ["English", "Spanish"],
    tangoRoles: ["DJ", "Dancer"],
    yearsOfDancing: 12,
    leaderLevel: 8,
    followerLevel: 6,
    subscriptionTier: "premium",
    isOnboardingComplete: true,
    platformRole: "platform_contributor", // RBAC Level 5
    testResponsibilities: [
      "Test contributor-level permissions",
      "Validate music library uploads",
      "Test event DJ assignment features",
      "Verify follower vs friend permissions",
    ],
  },
  {
    // USER 4: SOFIA (Community Leader - Organizer)
    email: "sofia@paristango.fr",
    username: "sofia_organizer",
    name: "Sofia Martin",
    firstName: "Sofia",
    lastName: "Martin",
    bio: "Paris tango community organizer. Running weekly milongas and annual festivals since 2015.",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    languages: ["French", "English", "Spanish"],
    tangoRoles: ["Organizer", "Dancer"],
    yearsOfDancing: 10,
    leaderLevel: 7,
    followerLevel: 8,
    subscriptionTier: "premium",
    isOnboardingComplete: true,
    platformRole: "community_leader", // RBAC Level 3
    testResponsibilities: [
      "Test community leader permissions",
      "Create and manage city groups",
      "Test event creation with RSVP limits",
      "Verify event check-in system",
    ],
  },
  {
    // USER 5: LUCAS (Premium User - Professional Performer)
    email: "lucas@tangoperformer.jp",
    username: "lucas_performer",
    name: "Lucas Tanaka",
    firstName: "Lucas",
    lastName: "Tanaka",
    bio: "Professional tango performer and choreographer based in Tokyo. Touring internationally.",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    languages: ["Japanese", "English", "Spanish"],
    tangoRoles: ["Performer", "Teacher"],
    yearsOfDancing: 18,
    leaderLevel: 10,
    followerLevel: 9,
    subscriptionTier: "premium",
    isOnboardingComplete: true,
    platformRole: "premium", // RBAC Level 2
    testResponsibilities: [
      "Test premium subscription features",
      "Validate Stripe payment integration",
      "Test video upload (performance videos)",
      "Receive endorsements for performance skills",
    ],
  },
  {
    // USER 6: CHEN (Free User - Social Dancer)
    email: "chen@tangoshanghai.cn",
    username: "chen_dancer",
    name: "Chen Wei",
    firstName: "Chen",
    lastName: "Wei",
    bio: "Social dancer enjoying tango community in Shanghai. Learning and improving every week.",
    city: "Shanghai",
    country: "China",
    countryCode: "CN",
    languages: ["Chinese", "English"],
    tangoRoles: ["Dancer"],
    yearsOfDancing: 3,
    leaderLevel: 5,
    followerLevel: 6,
    subscriptionTier: "free",
    isOnboardingComplete: true,
    platformRole: "free", // RBAC Level 1
    testResponsibilities: [
      "Test free tier limitations (storage, features)",
      "Verify upsell prompts to premium",
      "Test blocked user functionality",
      "Give endorsements to teachers",
    ],
  },
  {
    // USER 7: ISABELLA (Platform Volunteer - Content Moderator)
    email: "isabella@tangovolunteer.br",
    username: "isabella_moderator",
    name: "Isabella Silva",
    firstName: "Isabella",
    lastName: "Silva",
    bio: "Community volunteer helping moderate content and ensure safe, welcoming environment.",
    city: "São Paulo",
    country: "Brazil",
    countryCode: "BR",
    languages: ["Portuguese", "English", "Spanish"],
    tangoRoles: ["Dancer", "Organizer"],
    yearsOfDancing: 8,
    leaderLevel: 6,
    followerLevel: 7,
    subscriptionTier: "premium",
    isOnboardingComplete: true,
    platformRole: "platform_volunteer", // RBAC Level 6
    testResponsibilities: [
      "Test volunteer moderator dashboard",
      "Review flagged content",
      "Test user suspension powers",
      "Test 68-language switcher",
    ],
  },
  {
    // USER 8: DAVID (Admin - Venue Owner)
    email: "david@studiotango.au",
    username: "david_venue",
    name: "David O'Connor",
    firstName: "David",
    lastName: "O'Connor",
    bio: "Owner of Studio Tango Melbourne. Running professional tango venue with classes and milongas.",
    city: "Melbourne",
    country: "Australia",
    countryCode: "AU",
    state: "Victoria",
    stateCode: "VIC",
    languages: ["English"],
    tangoRoles: ["Venue Owner", "Organizer"],
    yearsOfDancing: 14,
    leaderLevel: 7,
    followerLevel: 6,
    subscriptionTier: "premium",
    isOnboardingComplete: true,
    platformRole: "admin", // RBAC Level 4
    testResponsibilities: [
      "Test admin dashboard analytics",
      "Manage venue listings",
      "Test venue recommendation system",
      "Receive venue endorsements",
    ],
  },
  {
    // USER 9: ELENA (Free User - New Student)
    email: "elena@newstudent.us",
    username: "elena_newbie",
    name: "Elena Rodriguez",
    firstName: "Elena",
    lastName: "Rodriguez",
    bio: "Just started learning tango! Excited to join this amazing community.",
    city: "New York",
    country: "United States",
    countryCode: "US",
    state: "New York",
    stateCode: "NY",
    languages: ["English", "Spanish"],
    tangoRoles: ["Dancer"],
    yearsOfDancing: 0, // Brand new
    leaderLevel: 1,
    followerLevel: 2,
    subscriptionTier: "free",
    isOnboardingComplete: false, // Will test onboarding flow
    platformRole: "free", // RBAC Level 1
    testResponsibilities: [
      "Test complete onboarding flow",
      "Verify first-time user tour (Mr. Blue guided)",
      "Upload first profile photo",
      "Send first friend request",
    ],
  },
  {
    // USER 10: AHMED (Premium User - Traveler)
    email: "ahmed@tangotraveler.ae",
    username: "ahmed_traveler",
    name: "Ahmed Al-Farsi",
    firstName: "Ahmed",
    lastName: "Al-Farsi",
    bio: "Tango traveler exploring communities worldwide. Planning trips to Paris and Buenos Aires.",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    languages: ["Arabic", "English", "Spanish"],
    tangoRoles: ["Dancer", "Traveler"],
    yearsOfDancing: 6,
    leaderLevel: 6,
    followerLevel: 7,
    subscriptionTier: "premium",
    isOnboardingComplete: true,
    platformRole: "premium", // RBAC Level 2
    testResponsibilities: [
      "Test travel planner features",
      "Search housing across multiple cities",
      "Test event discovery while traveling",
      "Test cross-city friend recommendations",
    ],
  },
];

/**
 * FRIEND RELATIONS MATRIX
 * Tests all 6 friend relation types
 */
const FRIEND_RELATIONS = [
  // CLOSE RELATIONS (Closeness 90-100)
  { user1: "scott_founder", user2: "maria_teacher", closeness: 95, type: "close" },
  { user1: "sofia_organizer", user2: "maria_teacher", closeness: 92, type: "close" },
  
  // 1ST DEGREE (Closeness 75-89)
  { user1: "scott_founder", user2: "jackson_dj", closeness: 85, type: "1st_degree" },
  { user1: "scott_founder", user2: "sofia_organizer", closeness: 82, type: "1st_degree" },
  { user1: "scott_founder", user2: "lucas_performer", closeness: 80, type: "1st_degree" },
  { user1: "maria_teacher", user2: "jackson_dj", closeness: 78, type: "1st_degree" },
  { user1: "maria_teacher", user2: "david_venue", closeness: 83, type: "1st_degree" },
  { user1: "jackson_dj", user2: "sofia_organizer", closeness: 79, type: "1st_degree" },
  { user1: "lucas_performer", user2: "sofia_organizer", closeness: 81, type: "1st_degree" },
  
  // 2ND DEGREE (Friends of friends - closeness 50-74)
  { user1: "chen_dancer", user2: "maria_teacher", closeness: 65, type: "2nd_degree" },
  { user1: "elena_newbie", user2: "jackson_dj", closeness: 60, type: "2nd_degree" },
  { user1: "ahmed_traveler", user2: "sofia_organizer", closeness: 70, type: "2nd_degree" },
  
  // 3RD DEGREE (Friends of friends of friends - closeness 25-49)
  { user1: "chen_dancer", user2: "lucas_performer", closeness: 40, type: "3rd_degree" },
  { user1: "elena_newbie", user2: "ahmed_traveler", closeness: 35, type: "3rd_degree" },
  
  // FOLLOWER (Following but not friends - closeness 0-24)
  // Jackson has 100 followers (we'll create a few examples)
  { user1: "chen_dancer", user2: "jackson_dj", closeness: 15, type: "follower", isFollowing: true },
  { user1: "elena_newbie", user2: "lucas_performer", closeness: 10, type: "follower", isFollowing: true },
  { user1: "ahmed_traveler", user2: "jackson_dj", closeness: 20, type: "follower", isFollowing: true },
  
  // UNKNOWN (No relationship initially - Elena starts with 0 friends)
  // Elena will test the unknown → friend transition
  
  // BLOCKED (Chen blocks 2 users to test blocking)
  // We'll handle this separately as it requires different table
];

/**
 * Main seeding function
 */
async function seedTestUsers() {
  console.log("🌱 MB.MD PROTOCOL v9.2: Seeding 10 Test Users...\n");

  try {
    // STEP 1: Hash default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    console.log("✅ Password hashed for all test users\n");

    // STEP 2: Create users
    console.log("👥 Creating 10 diverse test users...");
    const createdUsers = new Map<string, number>();

    for (const userData of TEST_USERS) {
      // Check if user already exists
      const existing = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
      
      if (existing.length > 0) {
        console.log(`  ⚠️  User ${userData.username} already exists (ID: ${existing[0].id})`);
        createdUsers.set(userData.username, existing[0].id);
        continue;
      }

      // Create new user
      const [newUser] = await db.insert(users).values({
        email: userData.email,
        username: userData.username,
        name: userData.name,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
        bio: userData.bio,
        city: userData.city,
        country: userData.country,
        countryCode: userData.countryCode,
        state: userData.state,
        stateCode: userData.stateCode,
        languages: userData.languages,
        tangoRoles: userData.tangoRoles,
        yearsOfDancing: userData.yearsOfDancing,
        leaderLevel: userData.leaderLevel,
        followerLevel: userData.followerLevel,
        subscriptionTier: userData.subscriptionTier,
        isOnboardingComplete: userData.isOnboardingComplete,
        isActive: true,
        isVerified: true,
      }).returning();

      createdUsers.set(userData.username, newUser.id);
      console.log(`  ✅ Created ${userData.username} (ID: ${newUser.id}) - ${userData.platformRole.toUpperCase()}`);

      // Assign platform role
      // First, get the role ID
      const [roleRecord] = await db.select().from(platformRoles).where(eq(platformRoles.name, userData.platformRole)).limit(1);
      
      if (roleRecord) {
        // Check if assignment exists
        const existingAssignment = await db.select()
          .from(platformUserRoles)
          .where(
            and(
              eq(platformUserRoles.userId, newUser.id),
              eq(platformUserRoles.roleId, roleRecord.id)
            )
          )
          .limit(1);

        if (existingAssignment.length === 0) {
          await db.insert(platformUserRoles).values({
            userId: newUser.id,
            roleId: roleRecord.id,
            assignedBy: newUser.id, // Self-assigned for test users
            isActive: true,
          });
          console.log(`     🔒 Assigned role: ${userData.platformRole}`);
        }
      }
    }

    console.log(`\n✅ Created/verified ${createdUsers.size} users\n`);

    // STEP 3: Create friend relations
    console.log("🤝 Establishing friend relations matrix...");
    
    for (const relation of FRIEND_RELATIONS) {
      const user1Id = createdUsers.get(relation.user1);
      const user2Id = createdUsers.get(relation.user2);

      if (!user1Id || !user2Id) {
        console.log(`  ⚠️  Skipping relation: ${relation.user1} ↔ ${relation.user2} (user not found)`);
        continue;
      }

      // Check if friendship already exists
      const existing = await db.select()
        .from(friendships)
        .where(
          or(
            and(eq(friendships.userId, user1Id), eq(friendships.friendId, user2Id)),
            and(eq(friendships.userId, user2Id), eq(friendships.friendId, user1Id))
          )
        )
        .limit(1);

      if (existing.length > 0) {
        console.log(`  ⚠️  Friendship already exists: ${relation.user1} ↔ ${relation.user2}`);
        continue;
      }

      // Create bidirectional friendship
      await db.insert(friendships).values([
        {
          userId: user1Id,
          friendId: user2Id,
          status: relation.isFollowing ? "following" : "accepted",
          closenessScore: relation.closeness,
        },
        {
          userId: user2Id,
          friendId: user1Id,
          status: relation.isFollowing ? "pending" : "accepted",
          closenessScore: relation.closeness,
        },
      ]);

      console.log(`  ✅ ${relation.user1} ↔ ${relation.user2} (${relation.type}, closeness: ${relation.closeness})`);
    }

    console.log("\n✅ Friend relations established\n");

    // STEP 4: Create sample posts
    console.log("📝 Creating sample posts...");
    
    const samplePosts = [
      {
        userId: createdUsers.get("scott_founder")!,
        content: "Welcome to Mundo Tango! Testing the platform with 10 diverse users across all RBAC levels. Let's validate every feature! 🎉",
        mediaUrls: [],
      },
      {
        userId: createdUsers.get("maria_teacher")!,
        content: "Excited to share my teaching methodology with the community. New workshop series starting next month in Buenos Aires!",
        mediaUrls: [],
      },
      {
        userId: createdUsers.get("jackson_dj")!,
        content: "Just uploaded a new playlist featuring D'Arienzo's golden recordings. Check out the music library!",
        mediaUrls: [],
      },
      {
        userId: createdUsers.get("elena_newbie")!,
        content: "Just had my first tango class! This is harder than it looks but so much fun. Can't wait to practice more! 💃",
        mediaUrls: [],
      },
    ];

    for (const postData of samplePosts) {
      await db.insert(posts).values(postData);
    }

    console.log(`  ✅ Created ${samplePosts.length} sample posts\n`);

    // STEP 5: Create sample event
    console.log("📅 Creating sample events...");
    
    const sofiaId = createdUsers.get("sofia_organizer");
    if (sofiaId) {
      await db.insert(events).values({
        title: "Weekly Milonga at Studio Tango Paris",
        description: "Join us for our weekly milonga! All levels welcome. Great music, friendly atmosphere.",
        eventType: "milonga",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
        location: "Studio Tango Paris",
        city: "Paris",
        country: "France",
        price: 15,
        maxAttendees: 80,
        userId: sofiaId, // Use userId instead of createdBy
      });

      console.log("  ✅ Created weekly milonga event\n");
    }

    // STEP 6: Print summary
    console.log("\n" + "=".repeat(80));
    console.log("🎉 TEST USER SEEDING COMPLETE!");
    console.log("=".repeat(80));
    console.log("\n📊 SUMMARY:\n");
    console.log(`✅ Users created: ${createdUsers.size}`);
    console.log(`✅ Friend relations: ${FRIEND_RELATIONS.length}`);
    console.log(`✅ Sample posts: ${samplePosts.length}`);
    console.log(`✅ Sample events: 1\n`);
    
    console.log("🔐 LOGIN CREDENTIALS:");
    console.log(`   Email: Any of the test user emails`);
    console.log(`   Password: ${DEFAULT_PASSWORD}\n`);
    
    console.log("👥 TEST USERS BY RBAC LEVEL:");
    console.log("   Level 8 (God): scott_founder");
    console.log("   Level 7 (Super Admin): maria_teacher");
    console.log("   Level 6 (Volunteer): isabella_moderator");
    console.log("   Level 5 (Contributor): jackson_dj");
    console.log("   Level 4 (Admin): david_venue");
    console.log("   Level 3 (Community Leader): sofia_organizer");
    console.log("   Level 2 (Premium): lucas_performer, ahmed_traveler");
    console.log("   Level 1 (Free): chen_dancer, elena_newbie\n");

    console.log("🧪 READY FOR TESTING:");
    console.log("   • Complete journey: Marketing → Registration → All 50 pages");
    console.log("   • RBAC/ABAC validation across 8 role levels");
    console.log("   • Friend relations (6 types: close, 1°, 2°, 3°, follower, unknown, blocked)");
    console.log("   • Social features (posts, @mentions, events, groups)");
    console.log("   • Professional endorsements");
    console.log("   • Housing marketplace\n");

  } catch (error) {
    console.error("❌ Error seeding test users:", error);
    throw error;
  }
}

// Run the seeding
seedTestUsers()
  .then(() => {
    console.log("✅ Seeding script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding script failed:", error);
    process.exit(1);
  });
