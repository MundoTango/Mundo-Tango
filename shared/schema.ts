import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  boolean, 
  integer,
  jsonb,
  serial,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// USERS & PROFILES (matching existing schema)
// ============================================================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  username: varchar("username").notNull().unique(),
  email: varchar("email").notNull().unique(),
  password: text("password").notNull(),
  mobileNo: varchar("mobile_no"),
  profileImage: text("profile_image"),
  backgroundImage: text("background_image"),
  bio: text("bio"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  country: varchar("country"),
  city: varchar("city"),
  facebookUrl: text("facebook_url"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  suspended: boolean("suspended").default(false),
  deviceType: varchar("device_type"),
  deviceToken: text("device_token"),
  apiToken: text("api_token"),
  replitId: varchar("replit_id"),
  nickname: varchar("nickname"),
  languages: text("languages").array(),
  tangoRoles: text("tango_roles").array(),
  leaderLevel: integer("leader_level").default(0),
  followerLevel: integer("follower_level").default(0),
  yearsOfDancing: integer("years_of_dancing").default(0),
  startedDancingYear: integer("started_dancing_year"),
  state: varchar("state"),
  countryCode: varchar("country_code"),
  stateCode: varchar("state_code"),
  formStatus: integer("form_status").default(0),
  isOnboardingComplete: boolean("is_onboarding_complete").default(false),
  codeOfConductAccepted: boolean("code_of_conduct_accepted").default(false),
  occupation: varchar("occupation"),
  termsAccepted: boolean("terms_accepted").default(false),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status"),
  subscriptionTier: varchar("subscription_tier").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  lastLoginAt: timestamp("last_login_at"),
  lastLoginIp: varchar("last_login_ip"),
  customerJourneyState: varchar("customer_journey_state").default("J1"),
  lastJourneyUpdate: timestamp("last_journey_update"),
  role: varchar("role").default("user").notNull(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  usernameIdx: index("users_username_idx").on(table.username),
}));

// ============================================================================
// SOCIAL CONNECTIONS
// ============================================================================

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: integer("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  followerIdx: index("follows_follower_idx").on(table.followerId),
  followingIdx: index("follows_following_idx").on(table.followingId),
  uniqueFollow: uniqueIndex("unique_follow").on(table.followerId, table.followingId),
}));

// ============================================================================
// EVENTS (matching existing schema + extensions)
// ============================================================================

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  eventType: varchar("event_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  date: text("date"),
  location: text("location").notNull(),
  venue: varchar("venue"),
  address: text("address"),
  city: varchar("city"),
  country: varchar("country"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  price: text("price"),
  currency: varchar("currency"),
  ticketUrl: text("ticket_url"),
  maxAttendees: integer("max_attendees"),
  isPaid: boolean("is_paid").default(false),
  isOnline: boolean("is_online").default(false),
  meetingUrl: text("meeting_url"),
  recurring: varchar("recurring"),
  status: varchar("status").default("published"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("events_user_idx").on(table.userId),
  startDateIdx: index("events_start_date_idx").on(table.startDate),
  cityIdx: index("events_city_idx").on(table.city),
}));

export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  eventIdx: index("event_rsvps_event_idx").on(table.eventId),
  userIdx: index("event_rsvps_user_idx").on(table.userId),
  uniqueRsvp: uniqueIndex("unique_rsvp").on(table.eventId, table.userId),
}));

// ============================================================================
// GROUPS (matching existing schema)
// ============================================================================

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  avatar: text("avatar"),
  coverPhoto: text("cover_photo"),
  groupType: varchar("group_type").notNull(),
  category: varchar("category"),
  location: text("location"),
  city: varchar("city"),
  country: varchar("country"),
  rules: text("rules"),
  memberCount: integer("member_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  creatorIdx: index("groups_creator_idx").on(table.creatorId),
  nameIdx: index("groups_name_idx").on(table.name),
}));

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role").default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  groupIdx: index("group_members_group_idx").on(table.groupId),
  userIdx: index("group_members_user_idx").on(table.userId),
  uniqueMember: uniqueIndex("unique_member").on(table.groupId, table.userId),
}));

// ============================================================================
// POSTS & SOCIAL CONTENT (matching existing schema)
// ============================================================================

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  richContent: jsonb("rich_content"),
  plainText: text("plain_text"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  mediaEmbeds: jsonb("media_embeds"),
  mentions: text("mentions").array(),
  hashtags: text("hashtags").array(),
  location: text("location"),
  coordinates: jsonb("coordinates"),
  placeId: text("place_id"),
  formattedAddress: text("formatted_address"),
  visibility: varchar("visibility").default("public"),
  postType: varchar("post_type").default("post"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("posts_user_idx").on(table.userId),
  eventIdx: index("posts_event_idx").on(table.eventId),
  createdAtIdx: index("posts_created_at_idx").on(table.createdAt),
}));

export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  postIdx: index("post_likes_post_idx").on(table.postId),
  userIdx: index("post_likes_user_idx").on(table.userId),
  uniqueLike: uniqueIndex("unique_post_like").on(table.postId, table.userId),
}));

export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parentCommentId: integer("parent_comment_id"),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  postIdx: index("post_comments_post_idx").on(table.postId),
  userIdx: index("post_comments_user_idx").on(table.userId),
  parentIdx: index("post_comments_parent_idx").on(table.parentCommentId),
}));

// ============================================================================
// MESSAGING
// ============================================================================

export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  type: varchar("type").default("direct").notNull(),
  name: text("name"),
  avatar: text("avatar"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatRoomUsers = pgTable("chat_room_users", {
  id: serial("id").primaryKey(),
  chatRoomId: integer("chat_room_id").notNull().references(() => chatRooms.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lastReadAt: timestamp("last_read_at"),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  chatRoomIdx: index("chat_room_users_room_idx").on(table.chatRoomId),
  userIdx: index("chat_room_users_user_idx").on(table.userId),
  uniqueParticipant: uniqueIndex("unique_chat_participant").on(table.chatRoomId, table.userId),
}));

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  chatRoomId: integer("chat_room_id").notNull().references(() => chatRooms.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type"),
  readBy: text("read_by").array(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  chatRoomIdx: index("chat_messages_room_idx").on(table.chatRoomId),
  userIdx: index("chat_messages_user_idx").on(table.userId),
  createdAtIdx: index("chat_messages_created_at_idx").on(table.createdAt),
}));

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedId: integer("related_id"),
  relatedType: varchar("related_type"),
  actionUrl: text("action_url"),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  readIdx: index("notifications_read_idx").on(table.read),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
}));

// ============================================================================
// AUTHENTICATION & SECURITY
// ============================================================================

export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("refresh_tokens_user_idx").on(table.userId),
  tokenIdx: index("refresh_tokens_token_idx").on(table.token),
}));

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("email_verification_tokens_user_idx").on(table.userId),
  tokenIdx: index("email_verification_tokens_token_idx").on(table.token),
}));

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("password_reset_tokens_user_idx").on(table.userId),
  tokenIdx: index("password_reset_tokens_token_idx").on(table.token),
}));

export const twoFactorSecrets = pgTable("two_factor_secrets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").array(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("two_factor_secrets_user_idx").on(table.userId),
}));

// ============================================================================
// AI INTERACTIONS
// ============================================================================

export const mrBlueConversations = pgTable("mr_blue_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("mr_blue_conversations_user_idx").on(table.userId),
}));

export const mrBlueMessages = pgTable("mr_blue_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => mrBlueConversations.id, { onDelete: "cascade" }),
  role: varchar("role").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  conversationIdx: index("mr_blue_messages_conversation_idx").on(table.conversationId),
}));

export const lifeCeoConversations = pgTable("life_ceo_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  domain: varchar("domain").notNull(),
  title: text("title"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("life_ceo_conversations_user_idx").on(table.userId),
}));

export const lifeCeoChatMessages = pgTable("life_ceo_chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => lifeCeoConversations.id, { onDelete: "cascade" }),
  role: varchar("role").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  conversationIdx: index("life_ceo_messages_conversation_idx").on(table.conversationId),
}));

// ============================================================================
// INSERT SCHEMAS & TYPES
// ============================================================================

// Users
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
  name: z.string().min(1),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  isVerified: true,
  isActive: true,
  suspended: true,
  twoFactorEnabled: true,
});

export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = typeof users.$inferSelect;

// Events
export const insertEventSchema = createInsertSchema(events, {
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectEventSchema = createSelectSchema(events);
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type SelectEvent = typeof events.$inferSelect;

// Event RSVPs
export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;
export type SelectEventRsvp = typeof eventRsvps.$inferSelect;

// Groups
export const insertGroupSchema = createInsertSchema(groups, {
  name: z.string().min(1).max(100),
  description: z.string().min(1),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  memberCount: true,
});
export const selectGroupSchema = createSelectSchema(groups);
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type SelectGroup = typeof groups.$inferSelect;

// Group Members
export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({ 
  id: true, 
  joinedAt: true 
});
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type SelectGroupMember = typeof groupMembers.$inferSelect;

// Posts
export const insertPostSchema = createInsertSchema(posts, {
  content: z.string().min(1),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  likes: true,
  comments: true,
  shares: true,
});
export const selectPostSchema = createSelectSchema(posts);
export type InsertPost = z.infer<typeof insertPostSchema>;
export type SelectPost = typeof posts.$inferSelect;

// Post Comments
export const insertPostCommentSchema = createInsertSchema(postComments, {
  content: z.string().min(1),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  likes: true,
});
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type SelectPostComment = typeof postComments.$inferSelect;

// Chat Messages
export const insertChatMessageSchema = createInsertSchema(chatMessages, {
  message: z.string().min(1),
}).omit({ 
  id: true, 
  createdAt: true,
  readBy: true,
});
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type SelectChatMessage = typeof chatMessages.$inferSelect;

// Chat Rooms
export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({ 
  id: true, 
  createdAt: true,
  lastMessageAt: true,
});
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type SelectChatRoom = typeof chatRooms.$inferSelect;

// Notifications
export const insertNotificationSchema = createInsertSchema(notifications).omit({ 
  id: true, 
  createdAt: true,
  read: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SelectNotification = typeof notifications.$inferSelect;

// Mr Blue Conversations
export const insertMrBlueConversationSchema = createInsertSchema(mrBlueConversations).omit({ 
  id: true, 
  createdAt: true,
  lastMessageAt: true,
});
export type InsertMrBlueConversation = z.infer<typeof insertMrBlueConversationSchema>;
export type SelectMrBlueConversation = typeof mrBlueConversations.$inferSelect;

// Mr Blue Messages
export const insertMrBlueMessageSchema = createInsertSchema(mrBlueMessages).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertMrBlueMessage = z.infer<typeof insertMrBlueMessageSchema>;
export type SelectMrBlueMessage = typeof mrBlueMessages.$inferSelect;

// Life CEO Conversations
export const insertLifeCeoConversationSchema = createInsertSchema(lifeCeoConversations).omit({ 
  id: true, 
  createdAt: true,
  lastMessageAt: true,
});
export type InsertLifeCeoConversation = z.infer<typeof insertLifeCeoConversationSchema>;
export type SelectLifeCeoConversation = typeof lifeCeoConversations.$inferSelect;

// Life CEO Messages
export const insertLifeCeoChatMessageSchema = createInsertSchema(lifeCeoChatMessages).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertLifeCeoChatMessage = z.infer<typeof insertLifeCeoChatMessageSchema>;
export type SelectLifeCeoChatMessage = typeof lifeCeoChatMessages.$inferSelect;

// Refresh Tokens
export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type SelectRefreshToken = typeof refreshTokens.$inferSelect;

// Email Verification Tokens
export const insertEmailVerificationTokenSchema = createInsertSchema(emailVerificationTokens).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertEmailVerificationToken = z.infer<typeof insertEmailVerificationTokenSchema>;
export type SelectEmailVerificationToken = typeof emailVerificationTokens.$inferSelect;

// Password Reset Tokens
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type SelectPasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Two Factor Secrets
export const insertTwoFactorSecretSchema = createInsertSchema(twoFactorSecrets).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertTwoFactorSecret = z.infer<typeof insertTwoFactorSecretSchema>;
export type SelectTwoFactorSecret = typeof twoFactorSecrets.$inferSelect;

// Follows
export const insertFollowSchema = createInsertSchema(follows).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type SelectFollow = typeof follows.$inferSelect;

// Post Likes
export const insertPostLikeSchema = createInsertSchema(postLikes).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type SelectPostLike = typeof postLikes.$inferSelect;

// Chat Room Users
export const insertChatRoomUserSchema = createInsertSchema(chatRoomUsers).omit({ 
  id: true, 
  joinedAt: true,
  lastReadAt: true,
});
export type InsertChatRoomUser = z.infer<typeof insertChatRoomUserSchema>;
export type SelectChatRoomUser = typeof chatRoomUsers.$inferSelect;

// ============================================================================
// PLATFORM INDEPENDENCE SCHEMA (PATH 2)
// ============================================================================

// Export all platform tables from platform-schema.ts so Drizzle can see them
export * from "./platform-schema";
