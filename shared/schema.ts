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
  tags: text("tags").array(),
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
  parentCommentId: integer("parent_id"),
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
// LIFE CEO SYSTEM (16 Agents - P66-P81)
// ============================================================================

// Life CEO Domains (16 life domains)
export const lifeCeoDomains = pgTable("life_ceo_domains", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  agentId: varchar("agent_id").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  color: varchar("color"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Life CEO Goals
export const lifeCeoGoals = pgTable("life_ceo_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  domainId: integer("domain_id").references(() => lifeCeoDomains.id),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date"),
  status: varchar("status").default("active").notNull(),
  progress: integer("progress").default(0),
  priority: varchar("priority").default("medium"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("life_ceo_goals_user_idx").on(table.userId),
  domainIdx: index("life_ceo_goals_domain_idx").on(table.domainId),
  statusIdx: index("life_ceo_goals_status_idx").on(table.status),
}));

// Life CEO Tasks (different from talent match tasks)
export const lifeCeoTasks = pgTable("life_ceo_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  goalId: integer("goal_id").references(() => lifeCeoGoals.id, { onDelete: "cascade" }),
  domainId: integer("domain_id").references(() => lifeCeoDomains.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  status: varchar("status").default("pending").notNull(),
  priority: varchar("priority").default("medium"),
  estimatedMinutes: integer("estimated_minutes"),
  actualMinutes: integer("actual_minutes"),
  recurring: varchar("recurring"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("life_ceo_tasks_user_idx").on(table.userId),
  goalIdx: index("life_ceo_tasks_goal_idx").on(table.goalId),
  domainIdx: index("life_ceo_tasks_domain_idx").on(table.domainId),
  statusIdx: index("life_ceo_tasks_status_idx").on(table.status),
  dueDateIdx: index("life_ceo_tasks_due_date_idx").on(table.dueDate),
}));

// Life CEO Goal Milestones
export const lifeCeoMilestones = pgTable("life_ceo_milestones", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull().references(() => lifeCeoGoals.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  targetPercentage: integer("target_percentage").notNull(),
  achieved: boolean("achieved").default(false),
  achievedAt: timestamp("achieved_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  goalIdx: index("life_ceo_milestones_goal_idx").on(table.goalId),
}));

// Life CEO Agent Recommendations
export const lifeCeoRecommendations = pgTable("life_ceo_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  domainId: integer("domain_id").references(() => lifeCeoDomains.id),
  agentId: varchar("agent_id").notNull(),
  type: varchar("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  actionUrl: text("action_url"),
  priority: varchar("priority").default("medium"),
  status: varchar("status").default("pending").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  dismissedAt: timestamp("dismissed_at"),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("life_ceo_recommendations_user_idx").on(table.userId),
  domainIdx: index("life_ceo_recommendations_domain_idx").on(table.domainId),
  statusIdx: index("life_ceo_recommendations_status_idx").on(table.status),
}));

// ============================================================================
// H2AC FRAMEWORK (Human-to-Agent Communication)
// ============================================================================

// H2AC Agent Messages (Agent-to-Agent, Agent-to-Human communications)
export const h2acMessages = pgTable("h2ac_messages", {
  id: serial("id").primaryKey(),
  senderType: varchar("sender_type").notNull(),
  senderId: varchar("sender_id").notNull(),
  recipientType: varchar("recipient_type").notNull(),
  recipientId: varchar("recipient_id").notNull(),
  messageType: varchar("message_type").notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  priority: varchar("priority").default("normal"),
  status: varchar("status").default("sent").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
  respondedAt: timestamp("responded_at"),
}, (table) => ({
  senderIdx: index("h2ac_messages_sender_idx").on(table.senderType, table.senderId),
  recipientIdx: index("h2ac_messages_recipient_idx").on(table.recipientType, table.recipientId),
  statusIdx: index("h2ac_messages_status_idx").on(table.status),
  createdAtIdx: index("h2ac_messages_created_at_idx").on(table.createdAt),
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

// ============================================================================
// EXTENDED FEATURES - NEW TABLES
// ============================================================================

// Saved Posts
export const savedPosts = pgTable("saved_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("saved_posts_user_idx").on(table.userId),
  postIdx: index("saved_posts_post_idx").on(table.postId),
  uniqueSave: uniqueIndex("unique_saved_post").on(table.userId, table.postId),
}));

// Friend Requests (Enhanced with dance stories & snooze)
export const friendRequests = pgTable("friend_requests", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: integer("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").default("pending").notNull(), // pending, accepted, declined, cancelled, snoozed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
  
  // Dance story fields
  didWeDance: boolean("did_we_dance").default(false),
  danceLocation: text("dance_location"),
  danceEventId: integer("dance_event_id").references(() => events.id),
  danceStory: text("dance_story"),
  
  // Messages
  senderMessage: text("sender_message").notNull(), // Required personal message
  senderPrivateNote: text("sender_private_note"), // Only visible to sender
  receiverResponse: text("receiver_response"),
  
  // Media
  mediaUrls: text("media_urls").array(),
  
  // Snooze functionality
  snoozedUntil: timestamp("snoozed_until"),
  snoozedCount: integer("snoozed_count").default(0).notNull(),
}, (table) => ({
  senderIdx: index("friend_requests_sender_idx").on(table.senderId),
  receiverIdx: index("friend_requests_receiver_idx").on(table.receiverId),
  statusIdx: index("friend_requests_status_idx").on(table.status),
  snoozedIdx: index("friend_requests_snoozed_idx").on(table.snoozedUntil),
  uniqueRequest: uniqueIndex("unique_friend_request").on(table.senderId, table.receiverId),
}));

// Workshops
export const workshops = pgTable("workshops", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  instructor: varchar("instructor").notNull(),
  image: text("image"),
  date: varchar("date").notNull(),
  location: text("location").notNull(),
  duration: varchar("duration"),
  price: integer("price").notNull(),
  capacity: integer("capacity").notNull(),
  registered: integer("registered").default(0).notNull(),
  spotsLeft: integer("spots_left"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  dateIdx: index("workshops_date_idx").on(table.date),
}));

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetType: varchar("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  rating: integer("rating").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  verified: boolean("verified").default(false),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("reviews_user_idx").on(table.userId),
  targetIdx: index("reviews_target_idx").on(table.targetType, table.targetId),
}));

// Live Streams
export const liveStreams = pgTable("live_streams", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  host: varchar("host").notNull(),
  thumbnail: text("thumbnail"),
  isLive: boolean("is_live").default(false),
  viewers: integer("viewers").default(0),
  scheduledDate: varchar("scheduled_date"),
  registrations: integer("registrations").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  liveIdx: index("live_streams_live_idx").on(table.isLive),
}));

// Media Gallery
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(),
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  caption: text("caption"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("media_user_idx").on(table.userId),
  typeIdx: index("media_type_idx").on(table.type),
}));

// Activity Logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(),
  text: text("text").notNull(),
  time: varchar("time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("activity_logs_user_idx").on(table.userId),
  createdAtIdx: index("activity_logs_created_at_idx").on(table.createdAt),
}));

// Blocked Users
export const blockedUsers = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  blockedUserId: integer("blocked_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("blocked_users_user_idx").on(table.userId),
  blockedIdx: index("blocked_users_blocked_idx").on(table.blockedUserId),
  uniqueBlock: uniqueIndex("unique_blocked_user").on(table.userId, table.blockedUserId),
}));

// Blocked Content
export const blockedContent = pgTable("blocked_content", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentType: varchar("content_type").notNull(),
  contentId: integer("content_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("blocked_content_user_idx").on(table.userId),
  contentIdx: index("blocked_content_content_idx").on(table.contentType, table.contentId),
}));

// Teachers (extended user profiles)
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  bio: text("bio"),
  experience: varchar("experience"),
  specialties: text("specialties").array(),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("teachers_user_idx").on(table.userId),
}));

// Venues
export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  country: varchar("country").notNull(),
  phone: varchar("phone"),
  email: varchar("email"),
  hours: text("hours"),
  image: text("image"),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  cityIdx: index("venues_city_idx").on(table.city),
}));

// Tutorials
export const tutorials = pgTable("tutorials", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  instructor: varchar("instructor").notNull(),
  level: varchar("level").notNull(),
  duration: varchar("duration").notNull(),
  price: integer("price").notNull(),
  thumbnail: text("thumbnail"),
  students: integer("students").default(0),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  instructorIdx: index("tutorials_instructor_idx").on(table.instructor),
}));

// Blog Posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  image: text("image"),
  published: boolean("published").default(false),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  authorIdx: index("blog_posts_author_idx").on(table.authorId),
  slugIdx: index("blog_posts_slug_idx").on(table.slug),
}));

// Newsletter Subscriptions
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  name: varchar("name"),
  subscribed: boolean("subscribed").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  emailIdx: index("newsletter_subscriptions_email_idx").on(table.email),
}));

// Bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventId: integer("event_id").references(() => events.id, { onDelete: "cascade" }),
  workshopId: integer("workshop_id").references(() => workshops.id, { onDelete: "cascade" }),
  confirmationNumber: varchar("confirmation_number").notNull().unique(),
  guests: integer("guests").default(1),
  totalAmount: integer("total_amount").notNull(),
  status: varchar("status").default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("bookings_user_idx").on(table.userId),
  confirmationIdx: index("bookings_confirmation_idx").on(table.confirmationNumber),
}));

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  currency: varchar("currency").default("USD"),
  status: varchar("status").default("pending"),
  transactionId: varchar("transaction_id").unique(),
  paymentMethod: varchar("payment_method"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("payments_user_idx").on(table.userId),
  transactionIdx: index("payments_transaction_idx").on(table.transactionId),
}));

// Zod Schemas for new tables
export const insertSavedPostSchema = createInsertSchema(savedPosts).omit({ id: true, createdAt: true });
export type InsertSavedPost = z.infer<typeof insertSavedPostSchema>;
export type SelectSavedPost = typeof savedPosts.$inferSelect;

export const insertFriendRequestSchema = createInsertSchema(friendRequests).omit({ id: true, createdAt: true, respondedAt: true, snoozedCount: true });
export type InsertFriendRequest = z.infer<typeof insertFriendRequestSchema>;
export type SelectFriendRequest = typeof friendRequests.$inferSelect;

export const insertWorkshopSchema = createInsertSchema(workshops).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkshop = z.infer<typeof insertWorkshopSchema>;
export type SelectWorkshop = typeof workshops.$inferSelect;

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type SelectReview = typeof reviews.$inferSelect;

export const insertLiveStreamSchema = createInsertSchema(liveStreams).omit({ id: true, createdAt: true });
export type InsertLiveStream = z.infer<typeof insertLiveStreamSchema>;
export type SelectLiveStream = typeof liveStreams.$inferSelect;

export const insertMediaSchema = createInsertSchema(media).omit({ id: true, createdAt: true });
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type SelectMedia = typeof media.$inferSelect;

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type SelectActivityLog = typeof activityLogs.$inferSelect;

export const insertBlockedUserSchema = createInsertSchema(blockedUsers).omit({ id: true, createdAt: true });
export type InsertBlockedUser = z.infer<typeof insertBlockedUserSchema>;
export type SelectBlockedUser = typeof blockedUsers.$inferSelect;

export const insertBlockedContentSchema = createInsertSchema(blockedContent).omit({ id: true, createdAt: true });
export type InsertBlockedContent = z.infer<typeof insertBlockedContentSchema>;
export type SelectBlockedContent = typeof blockedContent.$inferSelect;

export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true, createdAt: true });
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type SelectTeacher = typeof teachers.$inferSelect;

export const insertVenueSchema = createInsertSchema(venues).omit({ id: true, createdAt: true });
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type SelectVenue = typeof venues.$inferSelect;

export const insertTutorialSchema = createInsertSchema(tutorials).omit({ id: true, createdAt: true });
export type InsertTutorial = z.infer<typeof insertTutorialSchema>;
export type SelectTutorial = typeof tutorials.$inferSelect;

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type SelectBlogPost = typeof blogPosts.$inferSelect;

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({ id: true, createdAt: true });
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type SelectNewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type SelectBooking = typeof bookings.$inferSelect;

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type SelectPayment = typeof payments.$inferSelect;

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
// COMMUNITIES (City-based communities with auto-join)
// ============================================================================

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  cityName: varchar("city_name").notNull().unique(),
  country: varchar("country"),
  coverPhotoUrl: text("cover_photo_url"),
  coverPhotoSource: varchar("cover_photo_source"),
  coverPhotoCredit: varchar("cover_photo_credit"),
  description: text("description"),
  memberCount: integer("member_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  cityIdx: index("communities_city_idx").on(table.cityName),
}));

export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  communityIdx: index("community_members_community_idx").on(table.communityId),
  userIdx: index("community_members_user_idx").on(table.userId),
  uniqueMember: uniqueIndex("unique_community_member").on(table.communityId, table.userId),
}));

export const insertCommunitySchema = createInsertSchema(communities).omit({ id: true, createdAt: true });
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type SelectCommunity = typeof communities.$inferSelect;

export const insertCommunityMemberSchema = createInsertSchema(communityMembers).omit({ id: true, joinedAt: true });
export type InsertCommunityMember = z.infer<typeof insertCommunityMemberSchema>;
export type SelectCommunityMember = typeof communityMembers.$inferSelect;

// ============================================================================
// TALENT MATCH (Resume AI / Volunteer System)
// ============================================================================

export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  profile: jsonb("profile"),
  skills: text("skills").array(),
  availability: varchar("availability"),
  hoursPerWeek: integer("hours_per_week"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("volunteers_user_idx").on(table.userId),
}));

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id, { onDelete: "cascade" }),
  filename: text("filename"),
  fileUrl: text("file_url"),
  parsedText: text("parsed_text"),
  links: text("links").array(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  volunteerIdx: index("resumes_volunteer_idx").on(table.volunteerId),
}));

export const clarifierSessions = pgTable("clarifier_sessions", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id, { onDelete: "cascade" }),
  chatLog: jsonb("chat_log"),
  detectedSignals: text("detected_signals").array(),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  volunteerIdx: index("clarifier_sessions_volunteer_idx").on(table.volunteerId),
}));

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  domain: varchar("domain"),
  phase: varchar("phase"),
  estimatedHours: integer("estimated_hours"),
  requiredSkills: text("required_skills").array(),
  status: varchar("status").default("open"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  statusIdx: index("tasks_status_idx").on(table.status),
  domainIdx: index("tasks_domain_idx").on(table.domain),
}));

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id, { onDelete: "cascade" }),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  matchReason: text("match_reason"),
  status: varchar("status").default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
}, (table) => ({
  volunteerIdx: index("assignments_volunteer_idx").on(table.volunteerId),
  taskIdx: index("assignments_task_idx").on(table.taskId),
  statusIdx: index("assignments_status_idx").on(table.status),
}));

export const insertVolunteerSchema = createInsertSchema(volunteers).omit({ id: true, createdAt: true });
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type SelectVolunteer = typeof volunteers.$inferSelect;

export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, createdAt: true });
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type SelectResume = typeof resumes.$inferSelect;

export const insertClarifierSessionSchema = createInsertSchema(clarifierSessions).omit({ id: true, createdAt: true, completedAt: true });
export type InsertClarifierSession = z.infer<typeof insertClarifierSessionSchema>;
export type SelectClarifierSession = typeof clarifierSessions.$inferSelect;

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type SelectTask = typeof tasks.$inferSelect;

export const insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true, createdAt: true, approvedAt: true, rejectedAt: true });
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type SelectAssignment = typeof assignments.$inferSelect;

// ============================================================================
// MISSING TABLES - Wave 1B Database Expansion (MB.MD Protocol)
// ============================================================================

// Friendships (accepted friend connections with scoring)
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  friendId: integer("friend_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // Enhanced fields
  closenessScore: integer("closeness_score").default(75).notNull(), // 0-100, starts at 75
  connectionDegree: integer("connection_degree").default(1).notNull(), // Always 1 for direct friends
  lastInteractionAt: timestamp("last_interaction_at").defaultNow(),
  status: varchar("status").default("active").notNull(), // active, blocked
}, (table) => ({
  userIdx: index("friendships_user_idx").on(table.userId),
  friendIdx: index("friendships_friend_idx").on(table.friendId),
  closenessIdx: index("friendships_closeness_idx").on(table.closenessScore),
  uniqueFriendship: uniqueIndex("unique_friendship").on(table.userId, table.friendId),
}));

// Friendship Activities (tracks interactions between friends)
export const friendshipActivities = pgTable("friendship_activities", {
  id: serial("id").primaryKey(),
  friendshipId: integer("friendship_id").notNull().references(() => friendships.id, { onDelete: "cascade" }),
  activityType: varchar("activity_type").notNull(), // message_sent, post_liked, event_attended_together, group_joined_together, memory_shared, dance_together
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  friendshipIdx: index("friendship_activities_friendship_idx").on(table.friendshipId),
  typeIdx: index("friendship_activities_type_idx").on(table.activityType),
  dateIdx: index("friendship_activities_date_idx").on(table.createdAt),
}));

// Friendship Media (photos/videos shared in friend requests or friendships)
export const friendshipMedia = pgTable("friendship_media", {
  id: serial("id").primaryKey(),
  friendRequestId: integer("friend_request_id").references(() => friendRequests.id, { onDelete: "cascade" }),
  friendshipId: integer("friendship_id").references(() => friendships.id, { onDelete: "cascade" }),
  uploaderId: integer("uploader_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mediaUrl: text("media_url").notNull(),
  mediaType: varchar("media_type").notNull(), // image, video
  caption: text("caption"),
  phase: varchar("phase").notNull(), // request, acceptance, memory
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  requestIdx: index("friendship_media_request_idx").on(table.friendRequestId),
  friendshipIdx: index("friendship_media_friendship_idx").on(table.friendshipId),
  uploaderIdx: index("friendship_media_uploader_idx").on(table.uploaderId),
}));

// Message Reactions (emoji reactions to chat messages)
export const messageReactions = pgTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => chatMessages.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  emoji: varchar("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  messageIdx: index("message_reactions_message_idx").on(table.messageId),
  userIdx: index("message_reactions_user_idx").on(table.userId),
  uniqueReaction: uniqueIndex("unique_message_reaction").on(table.messageId, table.userId, table.emoji),
}));

// User Settings (privacy, notifications, preferences)
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  profileVisibility: varchar("profile_visibility").default("public"),
  showOnlineStatus: boolean("show_online_status").default(true),
  allowMessages: varchar("allow_messages").default("everyone"),
  language: varchar("language").default("en"),
  theme: varchar("theme").default("system"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("user_settings_user_idx").on(table.userId),
}));

// Moderation Queue (reported content)
export const moderationQueue = pgTable("moderation_queue", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type").notNull(),
  contentId: integer("content_id").notNull(),
  reporterId: integer("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: varchar("reason").notNull(),
  details: text("details"),
  status: varchar("status").default("pending").notNull(),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  action: varchar("action"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  contentIdx: index("moderation_queue_content_idx").on(table.contentType, table.contentId),
  reporterIdx: index("moderation_queue_reporter_idx").on(table.reporterId),
  statusIdx: index("moderation_queue_status_idx").on(table.status),
}));

// Post Shares (track who shared what post)
export const postShares = pgTable("post_shares", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  shareType: varchar("share_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  postIdx: index("post_shares_post_idx").on(table.postId),
  userIdx: index("post_shares_user_idx").on(table.userId),
  uniqueShare: uniqueIndex("unique_post_share").on(table.postId, table.userId, table.shareType),
}));

// Zod Schemas for New Tables
export const insertFriendshipSchema = createInsertSchema(friendships).omit({ id: true, createdAt: true, closenessScore: true, connectionDegree: true, lastInteractionAt: true, status: true });
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type SelectFriendship = typeof friendships.$inferSelect;

export const insertFriendshipActivitySchema = createInsertSchema(friendshipActivities).omit({ id: true, createdAt: true });
export type InsertFriendshipActivity = z.infer<typeof insertFriendshipActivitySchema>;
export type SelectFriendshipActivity = typeof friendshipActivities.$inferSelect;

export const insertFriendshipMediaSchema = createInsertSchema(friendshipMedia).omit({ id: true, createdAt: true });
export type InsertFriendshipMedia = z.infer<typeof insertFriendshipMediaSchema>;
export type SelectFriendshipMedia = typeof friendshipMedia.$inferSelect;

export const insertMessageReactionSchema = createInsertSchema(messageReactions).omit({ id: true, createdAt: true });
export type InsertMessageReaction = z.infer<typeof insertMessageReactionSchema>;
export type SelectMessageReaction = typeof messageReactions.$inferSelect;

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type SelectUserSettings = typeof userSettings.$inferSelect;

export const insertModerationQueueSchema = createInsertSchema(moderationQueue).omit({ id: true, createdAt: true, reviewedAt: true });
export type InsertModerationQueue = z.infer<typeof insertModerationQueueSchema>;
export type SelectModerationQueue = typeof moderationQueue.$inferSelect;

export const insertPostShareSchema = createInsertSchema(postShares).omit({ id: true, createdAt: true });
export type InsertPostShare = z.infer<typeof insertPostShareSchema>;
export type SelectPostShare = typeof postShares.$inferSelect;

// Life CEO System
export const insertLifeCeoDomainSchema = createInsertSchema(lifeCeoDomains).omit({ id: true, createdAt: true });
export type InsertLifeCeoDomain = z.infer<typeof insertLifeCeoDomainSchema>;
export type SelectLifeCeoDomain = typeof lifeCeoDomains.$inferSelect;

export const insertLifeCeoGoalSchema = createInsertSchema(lifeCeoGoals).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true });
export type InsertLifeCeoGoal = z.infer<typeof insertLifeCeoGoalSchema>;
export type SelectLifeCeoGoal = typeof lifeCeoGoals.$inferSelect;

export const insertLifeCeoTaskSchema = createInsertSchema(lifeCeoTasks).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true });
export type InsertLifeCeoTask = z.infer<typeof insertLifeCeoTaskSchema>;
export type SelectLifeCeoTask = typeof lifeCeoTasks.$inferSelect;

export const insertLifeCeoMilestoneSchema = createInsertSchema(lifeCeoMilestones).omit({ id: true, createdAt: true, achievedAt: true });
export type InsertLifeCeoMilestone = z.infer<typeof insertLifeCeoMilestoneSchema>;
export type SelectLifeCeoMilestone = typeof lifeCeoMilestones.$inferSelect;

export const insertLifeCeoRecommendationSchema = createInsertSchema(lifeCeoRecommendations).omit({ id: true, createdAt: true, dismissedAt: true, completedAt: true });
export type InsertLifeCeoRecommendation = z.infer<typeof insertLifeCeoRecommendationSchema>;
export type SelectLifeCeoRecommendation = typeof lifeCeoRecommendations.$inferSelect;

// H2AC Framework
export const insertH2acMessageSchema = createInsertSchema(h2acMessages).omit({ id: true, createdAt: true, readAt: true, respondedAt: true });
export type InsertH2acMessage = z.infer<typeof insertH2acMessageSchema>;
export type SelectH2acMessage = typeof h2acMessages.$inferSelect;

// ============================================================================
// MEGA WAVE 8: MASSIVE DATABASE EXPANSION (MB.MD Protocol)
// ============================================================================

// ============================================================================
// ESA AGENT FRAMEWORK TABLES (Wave 8A)
// ============================================================================

// ESA Agents (134 total agents)
export const esaAgents = pgTable("esa_agents", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull().unique(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(),
  division: varchar("division"),
  certificationLevel: integer("certification_level").default(1),
  specialization: text("specialization"),
  status: varchar("status").default("active").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  agentIdIdx: index("esa_agents_agent_id_idx").on(table.agentId),
  typeIdx: index("esa_agents_type_idx").on(table.type),
  divisionIdx: index("esa_agents_division_idx").on(table.division),
  statusIdx: index("esa_agents_status_idx").on(table.status),
}));

// ESA Agent Certifications
export const esaAgentCertifications = pgTable("esa_agent_certifications", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => esaAgents.id, { onDelete: "cascade" }),
  certificationLevel: integer("certification_level").notNull(),
  certificationDate: timestamp("certification_date").notNull(),
  certifiedBy: varchar("certified_by"),
  skills: text("skills").array(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  agentIdx: index("esa_certifications_agent_idx").on(table.agentId),
  levelIdx: index("esa_certifications_level_idx").on(table.certificationLevel),
}));

// ESA Agent Communications (agent-to-agent messaging)
export const esaAgentCommunications = pgTable("esa_agent_communications", {
  id: serial("id").primaryKey(),
  senderAgentId: integer("sender_agent_id").notNull().references(() => esaAgents.id, { onDelete: "cascade" }),
  recipientAgentId: integer("recipient_agent_id").notNull().references(() => esaAgents.id, { onDelete: "cascade" }),
  messageType: varchar("message_type").notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  priority: varchar("priority").default("normal"),
  status: varchar("status").default("sent").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
  respondedAt: timestamp("responded_at"),
}, (table) => ({
  senderIdx: index("esa_comms_sender_idx").on(table.senderAgentId),
  recipientIdx: index("esa_comms_recipient_idx").on(table.recipientAgentId),
  statusIdx: index("esa_comms_status_idx").on(table.status),
  createdAtIdx: index("esa_comms_created_at_idx").on(table.createdAt),
}));

// ESA Agent Metrics
export const esaAgentMetrics = pgTable("esa_agent_metrics", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => esaAgents.id, { onDelete: "cascade" }),
  metricType: varchar("metric_type").notNull(),
  metricValue: integer("metric_value").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"),
}, (table) => ({
  agentIdx: index("esa_metrics_agent_idx").on(table.agentId),
  typeIdx: index("esa_metrics_type_idx").on(table.metricType),
  timestampIdx: index("esa_metrics_timestamp_idx").on(table.timestamp),
}));

// ESA Agent Tasks (agent-specific tasks)
export const esaAgentTasks = pgTable("esa_agent_tasks", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => esaAgents.id, { onDelete: "cascade" }),
  taskTitle: text("task_title").notNull(),
  taskDescription: text("task_description"),
  status: varchar("status").default("pending").notNull(),
  priority: varchar("priority").default("medium"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  agentIdx: index("esa_tasks_agent_idx").on(table.agentId),
  statusIdx: index("esa_tasks_status_idx").on(table.status),
  dueDateIdx: index("esa_tasks_due_date_idx").on(table.dueDate),
}));

// ============================================================================
// POST ACTIONS TABLES (Wave 8B)
// ============================================================================

// Post Edits (edit history tracking)
export const postEdits = pgTable("post_edits", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  previousContent: text("previous_content").notNull(),
  newContent: text("new_content").notNull(),
  editReason: text("edit_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  postIdx: index("post_edits_post_idx").on(table.postId),
  userIdx: index("post_edits_user_idx").on(table.userId),
  createdAtIdx: index("post_edits_created_at_idx").on(table.createdAt),
}));

// Post Reports (user-reported content)
export const postReports = pgTable("post_reports", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  reporterId: integer("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: varchar("reason").notNull(),
  details: text("details"),
  status: varchar("status").default("pending").notNull(),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  action: varchar("action"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  postIdx: index("post_reports_post_idx").on(table.postId),
  reporterIdx: index("post_reports_reporter_idx").on(table.reporterId),
  statusIdx: index("post_reports_status_idx").on(table.status),
}));

// Post Bookmarks (saved posts with collections)
export const postBookmarks = pgTable("post_bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  collectionName: varchar("collection_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("post_bookmarks_user_idx").on(table.userId),
  postIdx: index("post_bookmarks_post_idx").on(table.postId),
  collectionIdx: index("post_bookmarks_collection_idx").on(table.collectionName),
  uniqueBookmark: uniqueIndex("unique_post_bookmark").on(table.userId, table.postId),
}));

// Post Share Analytics (track share metrics)
export const postShareAnalytics = pgTable("post_share_analytics", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  shareType: varchar("share_type").notNull(),
  platform: varchar("platform"),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  postIdx: index("post_share_analytics_post_idx").on(table.postId),
  shareTypeIdx: index("post_share_analytics_type_idx").on(table.shareType),
  createdAtIdx: index("post_share_analytics_created_at_idx").on(table.createdAt),
}));

// Comment Likes (for nested comment interactions)
export const commentLikes = pgTable("comment_likes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull().references(() => postComments.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  commentIdx: index("comment_likes_comment_idx").on(table.commentId),
  userIdx: index("comment_likes_user_idx").on(table.userId),
  uniqueLike: uniqueIndex("unique_comment_like").on(table.commentId, table.userId),
}));

// ============================================================================
// SEARCH & ANALYTICS TABLES (Wave 8C)
// ============================================================================

// Search History (user search queries)
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  query: text("query").notNull(),
  resultCount: integer("result_count"),
  clicked: boolean("clicked").default(false),
  clickedResultType: varchar("clicked_result_type"),
  clickedResultId: integer("clicked_result_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("search_history_user_idx").on(table.userId),
  queryIdx: index("search_history_query_idx").on(table.query),
  createdAtIdx: index("search_history_created_at_idx").on(table.createdAt),
}));

// Search Analytics (aggregate search metrics)
export const searchAnalytics = pgTable("search_analytics", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  searchCount: integer("search_count").default(1),
  avgResultCount: integer("avg_result_count"),
  clickThroughRate: integer("click_through_rate"),
  lastSearchedAt: timestamp("last_searched_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  queryIdx: index("search_analytics_query_idx").on(table.query),
  searchCountIdx: index("search_analytics_count_idx").on(table.searchCount),
}));

// User Interactions (engagement tracking)
export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetType: varchar("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  interactionType: varchar("interaction_type").notNull(),
  durationSeconds: integer("duration_seconds"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_interactions_user_idx").on(table.userId),
  targetIdx: index("user_interactions_target_idx").on(table.targetType, table.targetId),
  typeIdx: index("user_interactions_type_idx").on(table.interactionType),
  createdAtIdx: index("user_interactions_created_at_idx").on(table.createdAt),
}));

// Page Views (analytics)
export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  pagePath: text("page_path").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  sessionId: varchar("session_id"),
  durationSeconds: integer("duration_seconds"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("page_views_user_idx").on(table.userId),
  pagePathIdx: index("page_views_page_path_idx").on(table.pagePath),
  sessionIdx: index("page_views_session_idx").on(table.sessionId),
  createdAtIdx: index("page_views_created_at_idx").on(table.createdAt),
}));

// ============================================================================
// HOUSING & MARKETPLACE TABLES (Wave 8D)
// ============================================================================

// Housing Listings
export const housingListings = pgTable("housing_listings", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  propertyType: varchar("property_type").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  maxGuests: integer("max_guests"),
  pricePerNight: integer("price_per_night").notNull(),
  currency: varchar("currency").default("USD"),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  country: varchar("country").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  amenities: text("amenities").array(),
  houseRules: text("house_rules"),
  images: text("images").array(),
  status: varchar("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  hostIdx: index("housing_host_idx").on(table.hostId),
  cityIdx: index("housing_city_idx").on(table.city),
  statusIdx: index("housing_status_idx").on(table.status),
  createdAtIdx: index("housing_created_at_idx").on(table.createdAt),
}));

// Housing Bookings
export const housingBookings = pgTable("housing_bookings", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => housingListings.id, { onDelete: "cascade" }),
  guestId: integer("guest_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  guests: integer("guests").notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: varchar("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  listingIdx: index("housing_bookings_listing_idx").on(table.listingId),
  guestIdx: index("housing_bookings_guest_idx").on(table.guestId),
  statusIdx: index("housing_bookings_status_idx").on(table.status),
}));

// Marketplace Items
export const marketplaceItems = pgTable("marketplace_items", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  condition: varchar("condition").notNull(),
  price: integer("price").notNull(),
  currency: varchar("currency").default("USD"),
  images: text("images").array(),
  location: text("location"),
  city: varchar("city"),
  country: varchar("country"),
  status: varchar("status").default("available").notNull(),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  sellerIdx: index("marketplace_seller_idx").on(table.sellerId),
  categoryIdx: index("marketplace_category_idx").on(table.category),
  statusIdx: index("marketplace_status_idx").on(table.status),
  cityIdx: index("marketplace_city_idx").on(table.city),
}));

// ============================================================================
// MEDIA & CONTENT TABLES (Wave 8E)
// ============================================================================

// Media Albums
export const mediaAlbums = pgTable("media_albums", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  mediaCount: integer("media_count").default(0),
  privacy: varchar("privacy").default("public"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("media_albums_user_idx").on(table.userId),
  createdAtIdx: index("media_albums_created_at_idx").on(table.createdAt),
}));

// Album Media (junction table)
export const albumMedia = pgTable("album_media", {
  id: serial("id").primaryKey(),
  albumId: integer("album_id").notNull().references(() => mediaAlbums.id, { onDelete: "cascade" }),
  mediaId: integer("media_id").notNull().references(() => media.id, { onDelete: "cascade" }),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  albumIdx: index("album_media_album_idx").on(table.albumId),
  mediaIdx: index("album_media_media_idx").on(table.mediaId),
  uniqueAlbumMedia: uniqueIndex("unique_album_media").on(table.albumId, table.mediaId),
}));

// Video Uploads
export const videoUploads = pgTable("video_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  durationSeconds: integer("duration_seconds"),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  privacy: varchar("privacy").default("public"),
  processingStatus: varchar("processing_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("video_uploads_user_idx").on(table.userId),
  statusIdx: index("video_uploads_status_idx").on(table.processingStatus),
  createdAtIdx: index("video_uploads_created_at_idx").on(table.createdAt),
}));

// Tutorial Modules (structured learning content)
export const tutorialModules = pgTable("tutorial_modules", {
  id: serial("id").primaryKey(),
  tutorialId: integer("tutorial_id").notNull().references(() => tutorials.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  contentType: varchar("content_type").notNull(),
  contentUrl: text("content_url"),
  durationMinutes: integer("duration_minutes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  tutorialIdx: index("tutorial_modules_tutorial_idx").on(table.tutorialId),
  orderIdx: index("tutorial_modules_order_idx").on(table.order),
}));

// ============================================================================
// ZOD SCHEMAS FOR NEW TABLES
// ============================================================================

// ESA Agents
export const insertEsaAgentSchema = createInsertSchema(esaAgents).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEsaAgent = z.infer<typeof insertEsaAgentSchema>;
export type SelectEsaAgent = typeof esaAgents.$inferSelect;

export const insertEsaAgentCertificationSchema = createInsertSchema(esaAgentCertifications).omit({ id: true, createdAt: true });
export type InsertEsaAgentCertification = z.infer<typeof insertEsaAgentCertificationSchema>;
export type SelectEsaAgentCertification = typeof esaAgentCertifications.$inferSelect;

export const insertEsaAgentCommunicationSchema = createInsertSchema(esaAgentCommunications).omit({ id: true, createdAt: true, readAt: true, respondedAt: true });
export type InsertEsaAgentCommunication = z.infer<typeof insertEsaAgentCommunicationSchema>;
export type SelectEsaAgentCommunication = typeof esaAgentCommunications.$inferSelect;

export const insertEsaAgentMetricSchema = createInsertSchema(esaAgentMetrics).omit({ id: true });
export type InsertEsaAgentMetric = z.infer<typeof insertEsaAgentMetricSchema>;
export type SelectEsaAgentMetric = typeof esaAgentMetrics.$inferSelect;

export const insertEsaAgentTaskSchema = createInsertSchema(esaAgentTasks).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true });
export type InsertEsaAgentTask = z.infer<typeof insertEsaAgentTaskSchema>;
export type SelectEsaAgentTask = typeof esaAgentTasks.$inferSelect;

// Post Actions
export const insertPostEditSchema = createInsertSchema(postEdits).omit({ id: true, createdAt: true });
export type InsertPostEdit = z.infer<typeof insertPostEditSchema>;
export type SelectPostEdit = typeof postEdits.$inferSelect;

export const insertPostReportSchema = createInsertSchema(postReports).omit({ id: true, createdAt: true, reviewedAt: true });
export type InsertPostReport = z.infer<typeof insertPostReportSchema>;
export type SelectPostReport = typeof postReports.$inferSelect;

export const insertPostBookmarkSchema = createInsertSchema(postBookmarks).omit({ id: true, createdAt: true });
export type InsertPostBookmark = z.infer<typeof insertPostBookmarkSchema>;
export type SelectPostBookmark = typeof postBookmarks.$inferSelect;

export const insertPostShareAnalyticsSchema = createInsertSchema(postShareAnalytics).omit({ id: true, createdAt: true });
export type InsertPostShareAnalytics = z.infer<typeof insertPostShareAnalyticsSchema>;
export type SelectPostShareAnalytics = typeof postShareAnalytics.$inferSelect;

export const insertCommentLikeSchema = createInsertSchema(commentLikes).omit({ id: true, createdAt: true });
export type InsertCommentLike = z.infer<typeof insertCommentLikeSchema>;
export type SelectCommentLike = typeof commentLikes.$inferSelect;

// Search & Analytics
export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({ id: true, createdAt: true });
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SelectSearchHistory = typeof searchHistory.$inferSelect;

export const insertSearchAnalyticsSchema = createInsertSchema(searchAnalytics).omit({ id: true, createdAt: true });
export type InsertSearchAnalytics = z.infer<typeof insertSearchAnalyticsSchema>;
export type SelectSearchAnalytics = typeof searchAnalytics.$inferSelect;

export const insertUserInteractionSchema = createInsertSchema(userInteractions).omit({ id: true, createdAt: true });
export type InsertUserInteraction = z.infer<typeof insertUserInteractionSchema>;
export type SelectUserInteraction = typeof userInteractions.$inferSelect;

export const insertPageViewSchema = createInsertSchema(pageViews).omit({ id: true, createdAt: true });
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type SelectPageView = typeof pageViews.$inferSelect;

// Housing & Marketplace
export const insertHousingListingSchema = createInsertSchema(housingListings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHousingListing = z.infer<typeof insertHousingListingSchema>;
export type SelectHousingListing = typeof housingListings.$inferSelect;

export const insertHousingBookingSchema = createInsertSchema(housingBookings).omit({ id: true, createdAt: true });
export type InsertHousingBooking = z.infer<typeof insertHousingBookingSchema>;
export type SelectHousingBooking = typeof housingBookings.$inferSelect;

export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
export type SelectMarketplaceItem = typeof marketplaceItems.$inferSelect;

// Media & Content
export const insertMediaAlbumSchema = createInsertSchema(mediaAlbums).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMediaAlbum = z.infer<typeof insertMediaAlbumSchema>;
export type SelectMediaAlbum = typeof mediaAlbums.$inferSelect;

export const insertAlbumMediaSchema = createInsertSchema(albumMedia).omit({ id: true, createdAt: true });
export type InsertAlbumMedia = z.infer<typeof insertAlbumMediaSchema>;
export type SelectAlbumMedia = typeof albumMedia.$inferSelect;

export const insertVideoUploadSchema = createInsertSchema(videoUploads).omit({ id: true, createdAt: true });
export type InsertVideoUpload = z.infer<typeof insertVideoUploadSchema>;
export type SelectVideoUpload = typeof videoUploads.$inferSelect;

export const insertTutorialModuleSchema = createInsertSchema(tutorialModules).omit({ id: true, createdAt: true });
export type InsertTutorialModule = z.infer<typeof insertTutorialModuleSchema>;
export type SelectTutorialModule = typeof tutorialModules.$inferSelect;

// ============================================================================
// PLATFORM INDEPENDENCE SCHEMA (PATH 2)
// ============================================================================

// Export all platform tables from platform-schema.ts so Drizzle can see them
export * from "./platform-schema";
