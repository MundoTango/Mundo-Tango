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
  real,
  unique,
  numeric,
  primaryKey,
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
  
  // Basic Information
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  
  // Event Type & Category
  eventType: varchar("event_type", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }),
  
  // Date & Time
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  date: text("date"),
  startDateTime: timestamp("start_date_time"),
  endDateTime: timestamp("end_date_time"),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  isRecurring: boolean("is_recurring").default(false),
  recurring: varchar("recurring"),
  recurrenceRule: text("recurrence_rule"),
  
  // Location
  location: text("location").notNull(),
  venue: varchar("venue", { length: 255 }),
  venueName: varchar("venue_name", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isOnline: boolean("is_online").default(false),
  onlineLink: text("online_link"),
  meetingUrl: text("meeting_url"),
  
  // Media
  imageUrl: text("image_url"),
  coverImage: text("cover_image"),
  mediaUrls: text("media_urls").array(),
  
  // Organizer
  organizerId: integer("organizer_id").references(() => users.id),
  coOrganizers: integer("co_organizers").array(),
  groupId: integer("group_id").references(() => groups.id),
  
  // Capacity & RSVPs
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  waitlistEnabled: boolean("waitlist_enabled").default(false),
  waitlistCount: integer("waitlist_count").default(0),
  
  // Ticketing
  isPaid: boolean("is_paid").default(false),
  isFree: boolean("is_free").default(true),
  price: text("price"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  ticketUrl: text("ticket_url"),
  ticketLink: text("ticket_link"),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  
  // Visibility & Privacy
  visibility: varchar("visibility", { length: 20 }).default("public"),
  requiresApproval: boolean("requires_approval").default(false),
  
  // Features
  allowGuestPlusOne: boolean("allow_guest_plus_one").default(false),
  allowPhotos: boolean("allow_photos").default(true),
  allowComments: boolean("allow_comments").default(true),
  
  // Music & Style
  musicStyle: varchar("music_style", { length: 100 }),
  danceStyles: text("dance_styles").array(),
  djName: varchar("dj_name", { length: 255 }),
  
  // Additional Info
  tags: text("tags").array(),
  dressCode: varchar("dress_code", { length: 100 }),
  ageRestriction: varchar("age_restriction", { length: 50 }),
  wheelchairAccessible: boolean("wheelchair_accessible").default(false),
  parkingAvailable: boolean("parking_available").default(false),
  
  // Status
  status: varchar("status", { length: 20 }).default("published"),
  cancellationReason: text("cancellation_reason"),
  
  // Stats
  viewCount: integer("view_count").default(0),
  shareCount: integer("share_count").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
}, (table) => ({
  userIdx: index("events_user_idx").on(table.userId),
  startDateIdx: index("events_start_date_idx").on(table.startDate),
  cityIdx: index("events_city_idx").on(table.city),
  typeIdx: index("events_type_idx").on(table.eventType),
  statusIdx: index("events_status_idx").on(table.status),
  organizerIdx: index("events_organizer_idx").on(table.organizerId),
  groupIdx: index("events_group_idx").on(table.groupId),
  slugIdx: index("events_slug_idx").on(table.slug),
}));

export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // RSVP Status
  status: varchar("status", { length: 20 }).default("going"),
  
  // Guest Information
  guestCount: integer("guest_count").default(0),
  guestNames: text("guest_names").array(),
  
  // Preferences
  role: varchar("role", { length: 50 }),
  dietaryRestrictions: text("dietary_restrictions"),
  specialRequests: text("special_requests"),
  
  // Payment (if ticketed)
  ticketsPurchased: integer("tickets_purchased").default(1),
  totalPaid: numeric("total_paid", { precision: 10, scale: 2 }),
  paymentStatus: varchar("payment_status", { length: 20 }),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  
  // Check-in
  checkedIn: boolean("checked_in").default(false),
  checkedInAt: timestamp("checked_in_at"),
  checkedInBy: integer("checked_in_by").references(() => users.id),
  
  // Notifications
  notificationsEnabled: boolean("notifications_enabled").default(true),
  reminderSent: boolean("reminder_sent").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  rsvpedAt: timestamp("rsvped_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  eventIdx: index("event_rsvps_event_idx").on(table.eventId),
  userIdx: index("event_rsvps_user_idx").on(table.userId),
  uniqueRsvp: uniqueIndex("unique_rsvp").on(table.eventId, table.userId),
  statusIdx: index("event_rsvps_status_idx").on(table.status),
}));

export const eventPhotos = pgTable("event_photos", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  uploaderId: integer("uploader_id").notNull().references(() => users.id),
  
  // Photo Details
  photoUrl: text("photo_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  
  // Tagged People
  taggedUsers: integer("tagged_users").array(),
  
  // Engagement
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  
  // Visibility
  visibility: varchar("visibility", { length: 20 }).default("public"),
  
  // Moderation
  isApproved: boolean("is_approved").default(true),
  isFeatured: boolean("is_featured").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  idxEvent: index("event_photos_event_idx").on(table.eventId),
  idxUploader: index("event_photos_uploader_idx").on(table.uploaderId),
  idxFeatured: index("event_photos_featured_idx").on(table.isFeatured),
}));

export const eventComments = pgTable("event_comments", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  
  // Comment Content
  content: text("content").notNull(),
  parentCommentId: integer("parent_comment_id"),
  
  // Engagement
  likeCount: integer("like_count").default(0),
  
  // Moderation
  isEdited: boolean("is_edited").default(false),
  isDeleted: boolean("is_deleted").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  idxEvent: index("event_comments_event_idx").on(table.eventId),
  idxUser: index("event_comments_user_idx").on(table.userId),
  idxParent: index("event_comments_parent_idx").on(table.parentCommentId),
}));

export const eventReminders = pgTable("event_reminders", {
  id: serial("id").primaryKey(),
  rsvpId: integer("rsvp_id").notNull().references(() => eventRsvps.id, { onDelete: "cascade" }),
  
  // Reminder Settings
  reminderType: varchar("reminder_type", { length: 20 }).notNull(),
  reminderTime: timestamp("reminder_time").notNull(),
  
  // Delivery
  sentAt: timestamp("sent_at"),
  deliveryMethod: varchar("delivery_method", { length: 20 }).default("email"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  idxRSVP: index("event_reminders_rsvp_idx").on(table.rsvpId),
  idxTime: index("event_reminders_time_idx").on(table.reminderTime),
}));

// ============================================================================
// GROUPS (matching existing schema)
// ============================================================================

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  longDescription: text("long_description"),
  
  // Group Type & Location
  type: varchar("type", { length: 50 }).default("city"),
  roleType: varchar("role_type", { length: 50 }),
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  region: varchar("region", { length: 255 }),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  
  // Visibility & Privacy
  isPrivate: boolean("is_private").default(false),
  visibility: varchar("visibility", { length: 20 }).default("public"),
  joinApproval: varchar("join_approval", { length: 20 }).default("open"),
  
  // Media
  emoji: varchar("emoji", { length: 10 }),
  imageUrl: text("image_url"),
  coverImage: text("cover_image"),
  logoImage: text("logo_image"),
  
  // Statistics
  memberCount: integer("member_count").default(0),
  postCount: integer("post_count").default(0),
  eventCount: integer("event_count").default(0),
  
  // Settings
  allowEvents: boolean("allow_events").default(true),
  allowPosts: boolean("allow_posts").default(true),
  allowDiscussions: boolean("allow_discussions").default(true),
  whoCanPost: varchar("who_can_post", { length: 20 }).default("members"),
  
  // Ownership
  createdBy: integer("created_by").references(() => users.id, { onDelete: "cascade" }),
  ownerId: integer("owner_id").references(() => users.id),
  
  // Metadata
  tags: text("tags").array(),
  rules: text("rules"),
  language: varchar("language", { length: 10 }).default("en"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
}, (table) => ({
  slugIdx: index("groups_slug_idx").on(table.slug),
  typeIdx: index("groups_type_idx").on(table.type),
  cityIdx: index("groups_city_idx").on(table.city),
  visibilityIdx: index("groups_visibility_idx").on(table.visibility),
}));

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Role System
  role: varchar("role", { length: 20 }).default("member"),
  
  // Permissions
  canPost: boolean("can_post").default(true),
  canComment: boolean("can_comment").default(true),
  canCreateEvents: boolean("can_create_events").default(false),
  canInvite: boolean("can_invite").default(true),
  canModerate: boolean("can_moderate").default(false),
  
  // Join Information
  joinedAt: timestamp("joined_at").defaultNow(),
  invitedBy: integer("invited_by").references(() => users.id),
  joinMessage: text("join_message"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  // Activity Tracking
  lastVisitedAt: timestamp("last_visited_at").defaultNow(),
  postCount: integer("post_count").default(0),
  commentCount: integer("comment_count").default(0),
  
  // Notifications
  notificationLevel: varchar("notification_level", { length: 20 }).default("all"),
  muteUntil: timestamp("mute_until"),
  
  // Status
  status: varchar("status", { length: 20 }).default("active"),
  bannedReason: text("banned_reason"),
  bannedUntil: timestamp("banned_until"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  groupIdx: index("group_members_group_idx").on(table.groupId),
  userIdx: index("group_members_user_idx").on(table.userId),
  uniqueMember: uniqueIndex("unique_member").on(table.groupId, table.userId),
  roleIdx: index("group_members_role_idx").on(table.role),
  statusIdx: index("group_members_status_idx").on(table.status),
}));

export const groupInvites = pgTable("group_invites", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  inviterId: integer("inviter_id").notNull().references(() => users.id),
  inviteeId: integer("invitee_id").notNull().references(() => users.id),
  
  message: text("message"),
  status: varchar("status", { length: 20 }).default("pending"),
  
  sentAt: timestamp("sent_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at"),
}, (table) => ({
  uniqueInvite: unique().on(table.groupId, table.inviteeId),
  idxGroup: index("group_invites_group_idx").on(table.groupId),
  idxInvitee: index("group_invites_invitee_idx").on(table.inviteeId),
  idxStatus: index("group_invites_status_idx").on(table.status),
}));

export const groupPosts = pgTable("group_posts", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  authorId: integer("author_id").notNull().references(() => users.id),
  
  // Content
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  mediaUrls: text("media_urls").array(),
  mediaType: varchar("media_type", { length: 20 }),
  
  // Post Type
  postType: varchar("post_type", { length: 20 }).default("discussion"),
  
  // Linked Content
  linkedEventId: integer("linked_event_id").references(() => events.id),
  
  // Engagement
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  shareCount: integer("share_count").default(0),
  
  // Moderation
  isPinned: boolean("is_pinned").default(false),
  pinnedBy: integer("pinned_by").references(() => users.id),
  pinnedAt: timestamp("pinned_at"),
  isApproved: boolean("is_approved").default(true),
  approvedBy: integer("approved_by").references(() => users.id),
  
  // Status
  status: varchar("status", { length: 20 }).default("published"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at").defaultNow(),
}, (table) => ({
  idxGroup: index("group_posts_group_idx").on(table.groupId),
  idxAuthor: index("group_posts_author_idx").on(table.authorId),
  idxType: index("group_posts_type_idx").on(table.postType),
  idxStatus: index("group_posts_status_idx").on(table.status),
  idxPinned: index("group_posts_pinned_idx").on(table.isPinned),
  idxCreated: index("group_posts_created_idx").on(table.createdAt),
}));

export const groupCategories = pgTable("group_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  groupCount: integer("group_count").default(0),
  sortOrder: integer("sort_order").default(0),
});

export const groupCategoryAssignments = pgTable("group_category_assignments", {
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => groupCategories.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.groupId, table.categoryId] }),
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
  mentions: text("mentions").array().default(sql`ARRAY[]::text[]`),
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
  mentionsIdx: index("posts_mentions_idx").using("gin", table.mentions),
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
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: text("data").$type<string>(),
  isRead: boolean("is_read").default(false).notNull(),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  readIdx: index("notifications_read_idx").on(table.isRead),
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
  createdAt: true,
  rsvpedAt: true,
  updatedAt: true,
});
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;
export type SelectEventRsvp = typeof eventRsvps.$inferSelect;

// Event Photos
export const insertEventPhotoSchema = createInsertSchema(eventPhotos).omit({ 
  id: true, 
  createdAt: true,
  likeCount: true,
  commentCount: true,
});
export type InsertEventPhoto = z.infer<typeof insertEventPhotoSchema>;
export type SelectEventPhoto = typeof eventPhotos.$inferSelect;

// Event Comments  
export const insertEventCommentSchema = createInsertSchema(eventComments, {
  content: z.string().min(1),
}).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true,
  likeCount: true,
});
export type InsertEventComment = z.infer<typeof insertEventCommentSchema>;
export type SelectEventComment = typeof eventComments.$inferSelect;

// Event Reminders
export const insertEventReminderSchema = createInsertSchema(eventReminders).omit({ 
  id: true, 
  createdAt: true,
  sentAt: true,
});
export type InsertEventReminder = z.infer<typeof insertEventReminderSchema>;
export type SelectEventReminder = typeof eventReminders.$inferSelect;

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
  joinedAt: true,
  createdAt: true,
  updatedAt: true,
  lastVisitedAt: true,
  postCount: true,
  commentCount: true,
});
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type SelectGroupMember = typeof groupMembers.$inferSelect;

// Group Invites
export const insertGroupInviteSchema = createInsertSchema(groupInvites).omit({ 
  id: true, 
  sentAt: true,
  respondedAt: true,
});
export type InsertGroupInvite = z.infer<typeof insertGroupInviteSchema>;
export type SelectGroupInvite = typeof groupInvites.$inferSelect;

// Group Posts
export const insertGroupPostSchema = createInsertSchema(groupPosts, {
  content: z.string().min(1),
}).omit({ 
  id: true, 
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  likeCount: true,
  commentCount: true,
  shareCount: true,
});
export type InsertGroupPost = z.infer<typeof insertGroupPostSchema>;
export type SelectGroupPost = typeof groupPosts.$inferSelect;

// Group Categories
export const insertGroupCategorySchema = createInsertSchema(groupCategories, {
  name: z.string().min(1).max(100),
}).omit({ 
  id: true,
  groupCount: true,
});
export type InsertGroupCategory = z.infer<typeof insertGroupCategorySchema>;
export type SelectGroupCategory = typeof groupCategories.$inferSelect;

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
  isRead: true,
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
  senderMessage: text("sender_message"),
  senderPrivateNote: text("sender_private_note"),
  receiverMessage: text("receiver_message"),
  receiverPrivateNote: text("receiver_private_note"),
  
  // Media
  mediaUrls: text("media_urls").array(),
  
  // Snooze functionality
  snoozedUntil: timestamp("snoozed_until"),
  snoozeReminderSent: boolean("snooze_reminder_sent").default(false),
  
  // Timestamps
  sentAt: timestamp("sent_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Workshop Enrollments
export const workshopEnrollments = pgTable("workshop_enrollments", {
  id: serial("id").primaryKey(),
  workshopId: integer("workshop_id").notNull().references(() => workshops.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").default("enrolled").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
}, (table) => ({
  workshopIdx: index("workshop_enrollments_workshop_idx").on(table.workshopId),
  userIdx: index("workshop_enrollments_user_idx").on(table.userId),
  unique: index("workshop_enrollments_unique_idx").on(table.workshopId, table.userId),
}));

// Music Library
export const musicLibrary = pgTable("music_library", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  artist: varchar("artist").notNull(),
  album: varchar("album"),
  genre: varchar("genre"),
  year: integer("year"),
  duration: varchar("duration"),
  fileUrl: varchar("file_url"),
  orchestra: varchar("orchestra"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  artistIdx: index("music_artist_idx").on(table.artist),
  genreIdx: index("music_genre_idx").on(table.genre),
}));

// Music Playlists
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("playlists_user_idx").on(table.userId),
}));

// Playlist Songs
export const playlistSongs = pgTable("playlist_songs", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull().references(() => playlists.id, { onDelete: "cascade" }),
  songId: integer("song_id").notNull().references(() => musicLibrary.id, { onDelete: "cascade" }),
  position: integer("position").default(0),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => ({
  playlistIdx: index("playlist_songs_playlist_idx").on(table.playlistId),
  songIdx: index("playlist_songs_song_idx").on(table.songId),
}));

// Music Favorites
export const musicFavorites = pgTable("music_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  songId: integer("song_id").notNull().references(() => musicLibrary.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("music_favorites_user_idx").on(table.userId),
  songIdx: index("music_favorites_song_idx").on(table.songId),
  unique: index("music_favorites_unique_idx").on(table.userId, table.songId),
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

export const insertFriendRequestSchema = createInsertSchema(friendRequests).omit({ id: true, createdAt: true, respondedAt: true, snoozeReminderSent: true });
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

export const insertWorkshopEnrollmentSchema = createInsertSchema(workshopEnrollments).omit({ id: true, enrolledAt: true });
export type InsertWorkshopEnrollment = z.infer<typeof insertWorkshopEnrollmentSchema>;
export type SelectWorkshopEnrollment = typeof workshopEnrollments.$inferSelect;

export const insertMusicSchema = createInsertSchema(musicLibrary).omit({ id: true, createdAt: true });
export type InsertMusic = z.infer<typeof insertMusicSchema>;
export type SelectMusic = typeof musicLibrary.$inferSelect;

export const insertPlaylistSchema = createInsertSchema(playlists).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type SelectPlaylist = typeof playlists.$inferSelect;

export const insertPlaylistSongSchema = createInsertSchema(playlistSongs).omit({ id: true, addedAt: true });
export type InsertPlaylistSong = z.infer<typeof insertPlaylistSongSchema>;
export type SelectPlaylistSong = typeof playlistSongs.$inferSelect;

export const insertMusicFavoriteSchema = createInsertSchema(musicFavorites).omit({ id: true, createdAt: true });
export type InsertMusicFavorite = z.infer<typeof insertMusicFavoriteSchema>;
export type SelectMusicFavorite = typeof musicFavorites.$inferSelect;

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
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  postIdx: index("post_shares_post_idx").on(table.postId),
  userIdx: index("post_shares_user_idx").on(table.userId),
  uniqueShare: uniqueIndex("unique_post_share").on(table.postId, table.userId, table.shareType),
}));

// Post Reactions (13 reaction types: Love, Passion, Joy, Tango-specific, Support, Sad)
export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reactionType: varchar("reaction_type").notNull(), // love, passion, fire, tango, celebrate, brilliant, support, hug, sad, cry, thinking, shock, angry
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  postIdx: index("reactions_post_idx").on(table.postId),
  userIdx: index("reactions_user_idx").on(table.userId),
  uniqueReaction: uniqueIndex("unique_post_reaction").on(table.postId, table.userId),
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

export const insertReactionSchema = createInsertSchema(reactions).omit({ id: true, createdAt: true });
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type SelectReaction = typeof reactions.$inferSelect;

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
// PHASE 4: BLOCKER 8 - Agent Validation Protocol
// ============================================================================

// Agent Health Status (tracks health of 134 ESA agents)
export const agentHealth = pgTable("agent_health", {
  id: serial("id").primaryKey(),
  agentCode: varchar("agent_code").notNull(), // References platform-schema.ts esaAgents.agentCode
  status: varchar("status").default("unknown").notNull(), // 'healthy' | 'degraded' | 'failing' | 'offline' | 'unknown'
  lastCheckAt: timestamp("last_check_at").defaultNow().notNull(),
  responseTime: integer("response_time"), // milliseconds
  errorCount: integer("error_count").default(0),
  errorDetails: jsonb("error_details"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  agentCodeIdx: index("agent_health_agent_code_idx").on(table.agentCode),
  statusIdx: index("agent_health_status_idx").on(table.status),
  lastCheckIdx: index("agent_health_last_check_idx").on(table.lastCheckAt),
}));

// Validation Checks (cross-agent validation logs)
export const validationChecks = pgTable("validation_checks", {
  id: serial("id").primaryKey(),
  checkType: varchar("check_type").notNull(), // 'availability' | 'performance' | 'integration' | 'fallback'
  agentCode: varchar("agent_code").notNull(),
  result: varchar("result").notNull(), // 'pass' | 'fail' | 'warning'
  details: text("details"),
  executionTime: integer("execution_time"), // milliseconds
  fallbackActivated: boolean("fallback_activated").default(false),
  fallbackAgentCode: varchar("fallback_agent_code"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  checkTypeIdx: index("validation_checks_type_idx").on(table.checkType),
  agentCodeIdx: index("validation_checks_agent_code_idx").on(table.agentCode),
  resultIdx: index("validation_checks_result_idx").on(table.result),
  createdAtIdx: index("validation_checks_created_at_idx").on(table.createdAt),
}));

// ============================================================================
// PHASE 4: BLOCKER 9 - Predictive Context System
// ============================================================================

// User Patterns (Markov chain data for prediction)
export const userPatterns = pgTable("user_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fromPage: varchar("from_page").notNull(), // Current page path
  toPage: varchar("to_page").notNull(), // Next page path
  transitionCount: integer("transition_count").default(1),
  avgTimeOnPage: integer("avg_time_on_page"), // milliseconds
  lastTransitionAt: timestamp("last_transition_at").defaultNow(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("user_patterns_user_idx").on(table.userId),
  fromPageIdx: index("user_patterns_from_page_idx").on(table.fromPage),
  toPageIdx: index("user_patterns_to_page_idx").on(table.toPage),
  uniquePattern: uniqueIndex("unique_user_pattern").on(table.userId, table.fromPage, table.toPage),
}));

// Prediction Cache (predicted next actions for cache warming)
export const predictionCache = pgTable("prediction_cache", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  currentPage: varchar("current_page").notNull(),
  predictedPages: text("predicted_pages").array(), // Top 3-5 likely next pages
  confidence: integer("confidence"), // 0-100 prediction confidence
  cacheWarmed: boolean("cache_warmed").default(false),
  warmedAt: timestamp("warmed_at"),
  hitCount: integer("hit_count").default(0), // Track prediction accuracy
  missCount: integer("miss_count").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Cache expiry (24 hours)
}, (table) => ({
  userIdx: index("prediction_cache_user_idx").on(table.userId),
  currentPageIdx: index("prediction_cache_current_page_idx").on(table.currentPage),
  expiresAtIdx: index("prediction_cache_expires_at_idx").on(table.expiresAt),
  uniquePrediction: uniqueIndex("unique_prediction").on(table.userId, table.currentPage),
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

// Housing Reviews
export const housingReviews = pgTable("housing_reviews", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => housingListings.id, { onDelete: "cascade" }),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  listingIdx: index("housing_reviews_listing_idx").on(table.listingId),
  reviewerIdx: index("housing_reviews_reviewer_idx").on(table.reviewerId),
}));

// Housing Favorites
export const housingFavorites = pgTable("housing_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listingId: integer("listing_id").notNull().references(() => housingListings.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("housing_favorites_user_idx").on(table.userId),
  listingIdx: index("housing_favorites_listing_idx").on(table.listingId),
  unique: index("housing_favorites_unique_idx").on(table.userId, table.listingId),
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

// Phase 4: BLOCKER 8 - Agent Validation Protocol
export const insertAgentHealthSchema = createInsertSchema(agentHealth).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgentHealth = z.infer<typeof insertAgentHealthSchema>;
export type SelectAgentHealth = typeof agentHealth.$inferSelect;

export const insertValidationCheckSchema = createInsertSchema(validationChecks).omit({ id: true, createdAt: true });
export type InsertValidationCheck = z.infer<typeof insertValidationCheckSchema>;
export type SelectValidationCheck = typeof validationChecks.$inferSelect;

// Phase 4: BLOCKER 9 - Predictive Context System
export const insertUserPatternSchema = createInsertSchema(userPatterns).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserPattern = z.infer<typeof insertUserPatternSchema>;
export type SelectUserPattern = typeof userPatterns.$inferSelect;

export const insertPredictionCacheSchema = createInsertSchema(predictionCache).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPredictionCache = z.infer<typeof insertPredictionCacheSchema>;
export type SelectPredictionCache = typeof predictionCache.$inferSelect;

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
// GOD-LEVEL RBAC (8-Tier System) - BLOCKER 1
// Note: Using platform_* prefix to avoid collision with Life CEO roles table
// ============================================================================

export const platformRoles = pgTable("platform_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  roleLevel: integer("role_level").notNull().unique(),
  isSystemRole: boolean("is_system_role").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  idxName: index("idx_platform_roles_name").on(table.name),
  idxLevel: index("idx_platform_roles_level").on(table.roleLevel),
}));

export const platformPermissions = pgTable("platform_permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  idxName: index("idx_platform_permissions_name").on(table.name),
  idxCategory: index("idx_platform_permissions_category").on(table.category),
}));

export const platformUserRoles = pgTable("platform_user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: integer("role_id").notNull().references(() => platformRoles.id, { onDelete: "cascade" }),
  assignedBy: integer("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  idxUser: index("idx_platform_user_roles_user").on(table.userId),
  idxRole: index("idx_platform_user_roles_role").on(table.roleId),
  uniqueUserRole: uniqueIndex("unique_platform_user_role").on(table.userId, table.roleId),
}));

export const platformRolePermissions = pgTable("platform_role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => platformRoles.id, { onDelete: "cascade" }),
  permissionId: integer("permission_id").notNull().references(() => platformPermissions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  idxRole: index("idx_platform_role_permissions_role").on(table.roleId),
  idxPermission: index("idx_platform_role_permissions_permission").on(table.permissionId),
  uniqueRolePermission: uniqueIndex("unique_platform_role_permission").on(table.roleId, table.permissionId),
}));

// ============================================================================
// FEATURE FLAG SYSTEM - BLOCKER 2
// ============================================================================

export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  description: text("description"),
  featureType: varchar("feature_type", { length: 20 }).notNull().default("boolean"),
  category: varchar("category", { length: 50 }),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  idxName: index("idx_feature_flags_name").on(table.name),
  idxType: index("idx_feature_flags_type").on(table.featureType),
  idxCategory: index("idx_feature_flags_category").on(table.category),
}));

export const tierLimits = pgTable("tier_limits", {
  id: serial("id").primaryKey(),
  tierName: varchar("tier_name", { length: 50 }).notNull(),
  featureFlagId: integer("feature_flag_id").notNull().references(() => featureFlags.id, { onDelete: "cascade" }),
  limitValue: integer("limit_value"),
  isUnlimited: boolean("is_unlimited").default(false),
  resetPeriod: varchar("reset_period", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  idxTier: index("idx_tier_limits_tier").on(table.tierName),
  idxFeature: index("idx_tier_limits_feature").on(table.featureFlagId),
  uniqueTierFeature: uniqueIndex("unique_tier_feature").on(table.tierName, table.featureFlagId),
}));

export const userFeatureUsage = pgTable("user_feature_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  featureFlagId: integer("feature_flag_id").notNull().references(() => featureFlags.id, { onDelete: "cascade" }),
  currentUsage: integer("current_usage").default(0),
  lastResetAt: timestamp("last_reset_at").defaultNow(),
  periodStart: timestamp("period_start").defaultNow(),
  periodEnd: timestamp("period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  idxUser: index("idx_user_feature_usage_user").on(table.userId),
  idxFeature: index("idx_user_feature_usage_feature").on(table.featureFlagId),
  uniqueUserFeature: uniqueIndex("unique_user_feature").on(table.userId, table.featureFlagId),
}));

// ============================================================================
// DYNAMIC PRICING MANAGEMENT - BLOCKER 3
// ============================================================================

export const pricingTiers = pgTable("pricing_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  monthlyPrice: integer("monthly_price").notNull(),
  annualPrice: integer("annual_price"),
  stripeMonthlyPriceId: varchar("stripe_monthly_price_id", { length: 255 }),
  stripeAnnualPriceId: varchar("stripe_annual_price_id", { length: 255 }),
  stripeProductId: varchar("stripe_product_id", { length: 255 }),
  displayOrder: integer("display_order").default(0),
  isPopular: boolean("is_popular").default(false),
  isVisible: boolean("is_visible").default(true),
  features: jsonb("features"),
  roleLevel: integer("role_level"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  idxName: index("idx_pricing_tiers_name").on(table.name),
  idxVisible: index("idx_pricing_tiers_visible").on(table.isVisible),
  idxRoleLevel: index("idx_pricing_tiers_role_level").on(table.roleLevel),
}));

export const tierFeatures = pgTable("tier_features", {
  id: serial("id").primaryKey(),
  tierId: integer("tier_id").notNull().references(() => pricingTiers.id, { onDelete: "cascade" }),
  featureKey: varchar("feature_key", { length: 100 }).notNull(),
  featureName: varchar("feature_name", { length: 255 }).notNull(),
  featureDescription: text("feature_description"),
  limitType: varchar("limit_type", { length: 20 }).default("boolean"),
  limitValue: integer("limit_value"),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  idxTier: index("idx_tier_features_tier").on(table.tierId),
  idxFeature: index("idx_tier_features_feature").on(table.featureKey),
  uniqueTierFeature: uniqueIndex("unique_tier_feature_key").on(table.tierId, table.featureKey),
}));

export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: varchar("discount_type", { length: 20 }).notNull(),
  discountValue: integer("discount_value").notNull(),
  applicableTiers: integer("applicable_tiers").array(),
  stripeCouponId: varchar("stripe_coupon_id", { length: 255 }),
  maxRedemptions: integer("max_redemptions"),
  currentRedemptions: integer("current_redemptions").default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  idxCode: index("idx_promo_codes_code").on(table.code),
  idxActive: index("idx_promo_codes_active").on(table.isActive),
}));

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tierId: integer("tier_id").notNull().references(() => pricingTiers.id),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  billingInterval: varchar("billing_interval", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).default("active"),
  amount: integer("amount").notNull(),
  promoCodeId: integer("promo_code_id").references(() => promoCodes.id),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAt: timestamp("cancel_at"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  idxUser: index("idx_subscriptions_user").on(table.userId),
  idxTier: index("idx_subscriptions_tier").on(table.tierId),
  idxStatus: index("idx_subscriptions_status").on(table.status),
  idxStripe: index("idx_subscriptions_stripe").on(table.stripeSubscriptionId),
}));

export const pricingExperiments = pgTable("pricing_experiments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  tierId: integer("tier_id").notNull().references(() => pricingTiers.id),
  originalPrice: integer("original_price").notNull(),
  testPrice: integer("test_price").notNull(),
  trafficPercentage: integer("traffic_percentage").default(50),
  status: varchar("status", { length: 20 }).default("draft"),
  conversionRateOriginal: integer("conversion_rate_original"),
  conversionRateTest: integer("conversion_rate_test"),
  winner: varchar("winner", { length: 20 }),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  idxTier: index("idx_pricing_experiments_tier").on(table.tierId),
  idxStatus: index("idx_pricing_experiments_status").on(table.status),
}));

// ============================================================================
// CONVERSION TRACKING (PHASE 2 - BLOCKER 4)
// ============================================================================

export const upgradeEvents = pgTable("upgrade_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  featureName: varchar("feature_name", { length: 100 }),
  currentTier: varchar("current_tier", { length: 50 }).notNull(),
  targetTier: varchar("target_tier", { length: 50 }),
  currentQuota: integer("current_quota"),
  quotaLimit: integer("quota_limit"),
  conversionCompleted: boolean("conversion_completed").default(false),
  checkoutSessionId: varchar("checkout_session_id", { length: 255 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  idxUser: index("idx_upgrade_events_user").on(table.userId),
  idxEventType: index("idx_upgrade_events_type").on(table.eventType),
  idxFeature: index("idx_upgrade_events_feature").on(table.featureName),
  idxConversion: index("idx_upgrade_events_conversion").on(table.conversionCompleted),
  idxCreatedAt: index("idx_upgrade_events_created_at").on(table.createdAt),
}));

export const checkoutSessions = pgTable("checkout_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }).notNull().unique(),
  tierId: integer("tier_id").notNull().references(() => pricingTiers.id),
  priceId: varchar("price_id", { length: 255 }).notNull(),
  billingInterval: varchar("billing_interval", { length: 20 }).notNull(),
  amount: integer("amount").notNull(),
  promoCodeId: integer("promo_code_id").references(() => promoCodes.id),
  status: varchar("status", { length: 50 }).default("pending"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  expiresAt: timestamp("expires_at").notNull(),
  successUrl: text("success_url"),
  cancelUrl: text("cancel_url"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  idxUser: index("idx_checkout_sessions_user").on(table.userId),
  idxStripeSession: index("idx_checkout_sessions_stripe").on(table.stripeSessionId),
  idxStatus: index("idx_checkout_sessions_status").on(table.status),
  idxExpiresAt: index("idx_checkout_sessions_expires").on(table.expiresAt),
}));

// ============================================================================
// TRACK 7: NEW FEATURES - MEMORIES, RECOMMENDATIONS, ROLE INVITATIONS, FAVORITES, COMMUNITY STATS
// ============================================================================

// Memories - User memories with photos, milestones, and stories
export const memories = pgTable("memories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  type: varchar("type", { length: 50 }).notNull(),
  mediaUrls: text("media_urls").array(),
  date: timestamp("date").notNull(),
  location: varchar("location", { length: 255 }),
  visibility: varchar("visibility", { length: 20 }).default("private"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("memories_user_idx").on(table.userId),
  typeIdx: index("memories_type_idx").on(table.type),
  dateIdx: index("memories_date_idx").on(table.date),
  visibilityIdx: index("memories_visibility_idx").on(table.visibility),
}));

// Recommendations - AI-generated recommendations for users
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: integer("target_id").notNull(),
  score: real("score").notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("recommendations_user_idx").on(table.userId),
  targetIdx: index("recommendations_target_idx").on(table.targetType, table.targetId),
  statusIdx: index("recommendations_status_idx").on(table.status),
  scoreIdx: index("recommendations_score_idx").on(table.score),
}));

// Role Invitations - Invite users to become teachers, organizers, venue owners, moderators
export const roleInvitations = pgTable("role_invitations", {
  id: serial("id").primaryKey(),
  inviterId: integer("inviter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  inviteeId: integer("invitee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
}, (table) => ({
  inviterIdx: index("role_invitations_inviter_idx").on(table.inviterId),
  inviteeIdx: index("role_invitations_invitee_idx").on(table.inviteeId),
  statusIdx: index("role_invitations_status_idx").on(table.status),
  roleIdx: index("role_invitations_role_idx").on(table.role),
}));

// Favorites - User favorites for events, users, venues, posts
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: integer("target_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("favorites_user_idx").on(table.userId),
  targetIdx: index("favorites_target_idx").on(table.targetType, table.targetId),
  uniqueFavorite: uniqueIndex("unique_favorite").on(table.userId, table.targetType, table.targetId),
}));

// Community Stats - Aggregate statistics for communities by city
export const communityStats = pgTable("community_stats", {
  id: serial("id").primaryKey(),
  city: varchar("city", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  memberCount: integer("member_count").default(0).notNull(),
  activeEventsCount: integer("active_events_count").default(0).notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  cityIdx: index("community_stats_city_idx").on(table.city),
  countryIdx: index("community_stats_country_idx").on(table.country),
  uniqueCityCountry: uniqueIndex("unique_city_country").on(table.city, table.country),
}));

// ============================================================================
// ZOD SCHEMAS & TYPES - RBAC, FEATURE FLAGS, PRICING
// ============================================================================

// RBAC (Platform Roles)
export const insertPlatformRoleSchema = createInsertSchema(platformRoles).omit({ id: true, createdAt: true });
export type InsertPlatformRole = z.infer<typeof insertPlatformRoleSchema>;
export type SelectPlatformRole = typeof platformRoles.$inferSelect;

export const insertPlatformPermissionSchema = createInsertSchema(platformPermissions).omit({ id: true, createdAt: true });
export type InsertPlatformPermission = z.infer<typeof insertPlatformPermissionSchema>;
export type SelectPlatformPermission = typeof platformPermissions.$inferSelect;

export const insertPlatformUserRoleSchema = createInsertSchema(platformUserRoles).omit({ id: true, assignedAt: true, createdAt: true });
export type InsertPlatformUserRole = z.infer<typeof insertPlatformUserRoleSchema>;
export type SelectPlatformUserRole = typeof platformUserRoles.$inferSelect;

export const insertPlatformRolePermissionSchema = createInsertSchema(platformRolePermissions).omit({ id: true, createdAt: true });
export type InsertPlatformRolePermission = z.infer<typeof insertPlatformRolePermissionSchema>;
export type SelectPlatformRolePermission = typeof platformRolePermissions.$inferSelect;

// Feature Flags
export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;
export type SelectFeatureFlag = typeof featureFlags.$inferSelect;

export const insertTierLimitSchema = createInsertSchema(tierLimits).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTierLimit = z.infer<typeof insertTierLimitSchema>;
export type SelectTierLimit = typeof tierLimits.$inferSelect;

export const insertUserFeatureUsageSchema = createInsertSchema(userFeatureUsage).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserFeatureUsage = z.infer<typeof insertUserFeatureUsageSchema>;
export type SelectUserFeatureUsage = typeof userFeatureUsage.$inferSelect;

// Pricing
export const insertPricingTierSchema = createInsertSchema(pricingTiers).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPricingTier = z.infer<typeof insertPricingTierSchema>;
export type SelectPricingTier = typeof pricingTiers.$inferSelect;

export const insertTierFeatureSchema = createInsertSchema(tierFeatures).omit({ id: true, createdAt: true });
export type InsertTierFeature = z.infer<typeof insertTierFeatureSchema>;
export type SelectTierFeature = typeof tierFeatures.$inferSelect;

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ id: true, createdAt: true });
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type SelectPromoCode = typeof promoCodes.$inferSelect;

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type SelectSubscription = typeof subscriptions.$inferSelect;

export const insertPricingExperimentSchema = createInsertSchema(pricingExperiments).omit({ id: true, createdAt: true });
export type InsertPricingExperiment = z.infer<typeof insertPricingExperimentSchema>;
export type SelectPricingExperiment = typeof pricingExperiments.$inferSelect;

// Conversion Tracking (Phase 2)
export const insertUpgradeEventSchema = createInsertSchema(upgradeEvents).omit({ id: true, createdAt: true });
export type InsertUpgradeEvent = z.infer<typeof insertUpgradeEventSchema>;
export type SelectUpgradeEvent = typeof upgradeEvents.$inferSelect;

export const insertCheckoutSessionSchema = createInsertSchema(checkoutSessions).omit({ id: true, createdAt: true });
export type InsertCheckoutSession = z.infer<typeof insertCheckoutSessionSchema>;
export type SelectCheckoutSession = typeof checkoutSessions.$inferSelect;

// ============================================================================
// AGENT INTELLIGENCE NETWORK (Mr. Blue + Visual Editor)
// ============================================================================

// Breadcrumbs - User action tracking (30 clicks or 7 days)
export const breadcrumbs = pgTable("breadcrumbs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  
  // Page context
  page: varchar("page", { length: 500 }).notNull(),
  pageTitle: varchar("page_title", { length: 255 }),
  referrer: varchar("referrer", { length: 500 }),
  
  // Action context
  action: varchar("action", { length: 50 }).notNull(), // 'click', 'view', 'input', 'submit', 'error', 'navigation'
  target: varchar("target", { length: 500 }),
  targetId: varchar("target_id", { length: 255 }),
  value: jsonb("value"),
  
  // User context
  userJourney: varchar("user_journey", { length: 50 }),
  userRole: varchar("user_role", { length: 50 }),
  userIntent: varchar("user_intent", { length: 255 }),
  
  // Outcome
  success: boolean("success").default(true),
  error: text("error"),
  duration: integer("duration"), // milliseconds
  
  // ML predictions
  prediction: varchar("prediction", { length: 255 }),
  confidence: real("confidence"),
  patternId: varchar("pattern_id", { length: 100 }),
  
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => ({
  userIdx: index("idx_breadcrumbs_user").on(table.userId),
  sessionIdx: index("idx_breadcrumbs_session").on(table.sessionId),
  timestampIdx: index("idx_breadcrumbs_timestamp").on(table.timestamp),
  actionIdx: index("idx_breadcrumbs_action").on(table.action)
}));

// Failed Actions - Error tracking and recovery
export const failedActions = pgTable("failed_actions", {
  id: serial("id").primaryKey(),
  breadcrumbId: integer("breadcrumb_id").references(() => breadcrumbs.id),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  
  // Failure details
  failureType: varchar("failure_type", { length: 50 }).notNull(), // '404', 'api_error', 'validation', etc.
  statusCode: integer("status_code"),
  errorDetails: jsonb("error_details").notNull(),
  
  // Recovery
  recoveryAttempted: boolean("recovery_attempted").default(false),
  recoverySuccessful: boolean("recovery_successful").default(false),
  retries: integer("retries").default(0),
  
  // Resolution
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => ({
  userIdx: index("idx_failed_actions_user").on(table.userId),
  failureTypeIdx: index("idx_failed_actions_type").on(table.failureType),
  resolvedIdx: index("idx_failed_actions_resolved").on(table.resolved)
}));

// Visual Edits - Visual Editor change tracking
export const visualEdits = pgTable("visual_edits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  
  // Page context
  page: varchar("page", { length: 500 }).notNull(),
  componentId: varchar("component_id", { length: 255 }).notNull(),
  
  // Change details
  changeType: varchar("change_type", { length: 50 }).notNull(), // 'text', 'style', 'layout', 'size'
  before: jsonb("before"),
  after: jsonb("after"),
  
  // Code generation
  generatedCode: text("generated_code"),
  aiModel: varchar("ai_model", { length: 50 }),
  
  // Git info
  gitBranch: varchar("git_branch", { length: 255 }),
  commitHash: varchar("commit_hash", { length: 255 }),
  
  // Deployment
  previewUrl: varchar("preview_url", { length: 500 }),
  deployedToProduction: boolean("deployed_to_production").default(false),
  deployedAt: timestamp("deployed_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => ({
  userIdx: index("idx_visual_edits_user").on(table.userId),
  pageIdx: index("idx_visual_edits_page").on(table.page),
  deployedIdx: index("idx_visual_edits_deployed").on(table.deployedToProduction)
}));

// Agent Memories - What agents learn
export const agentMemories = pgTable("agent_memories", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  memoryType: varchar("memory_type", { length: 50 }).notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  confidence: real("confidence"),  // 0-1 (how confident agent is)
  context: jsonb("context"),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => ({
  agentIdx: index("idx_agent_memories_agent").on(table.agentId),
  typeIdx: index("idx_agent_memories_type").on(table.memoryType),
  confidenceIdx: index("idx_agent_memories_confidence").on(table.confidence)
}));

// Agent Knowledge - Semantic knowledge base
export const agentKnowledge = pgTable("agent_knowledge", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  content: text("content").notNull(),
  confidence: real("confidence"),
  sourceMemoryId: integer("source_memory_id").references(() => agentMemories.id),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => ({
  agentIdx: index("idx_agent_knowledge_agent").on(table.agentId),
  topicIdx: index("idx_agent_knowledge_topic").on(table.topic),
  tagsIdx: index("idx_agent_knowledge_tags").on(table.tags)
}));

// Agent Communications - Agent-to-agent messages
export const agentCommunications = pgTable("agent_communications", {
  id: serial("id").primaryKey(),
  fromAgent: varchar("from_agent", { length: 100 }).notNull(),
  toAgent: varchar("to_agent", { length: 100 }).notNull(),
  messageType: varchar("message_type", { length: 50 }).notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => ({
  fromIdx: index("idx_agent_comms_from").on(table.fromAgent),
  toIdx: index("idx_agent_comms_to").on(table.toAgent),
  typeIdx: index("idx_agent_comms_type").on(table.messageType),
  readIdx: index("idx_agent_comms_read").on(table.isRead)
}));

// Agent Collaborations - Multi-agent teamwork
export const agentCollaborations = pgTable("agent_collaborations", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  collaboratorId: varchar("collaborator_id", { length: 100 }).notNull(),
  issue: text("issue").notNull(),
  status: varchar("status", { length: 50 }).notNull(), // 'pending', 'in_progress', 'resolved'
  resolution: text("resolution"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at")
}, (table) => ({
  agentIdx: index("idx_agent_collab_agent").on(table.agentId),
  collaboratorIdx: index("idx_agent_collab_collaborator").on(table.collaboratorId),
  statusIdx: index("idx_agent_collab_status").on(table.status)
}));

// Agent Self Tests - Self-testing results
export const agentSelfTests = pgTable("agent_self_tests", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  testType: varchar("test_type", { length: 50 }).notNull(),
  testName: varchar("test_name", { length: 255 }).notNull(),
  passed: boolean("passed").notNull(),
  score: real("score"),
  errorDetails: jsonb("error_details"),
  executionTime: integer("execution_time"), // milliseconds
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => ({
  agentIdx: index("idx_agent_tests_agent").on(table.agentId),
  typeIdx: index("idx_agent_tests_type").on(table.testType),
  passedIdx: index("idx_agent_tests_passed").on(table.passed)
}));

// ============================================================================
// PROFESSIONAL PROFILES SYSTEM (PART 6-2)
// ============================================================================

export const professionalExperiences = pgTable("professional_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  experienceType: varchar("experience_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  organization: varchar("organization", { length: 255 }),
  location: varchar("location", { length: 255 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isCurrent: boolean("is_current").default(false),
  description: text("description"),
  achievements: text("achievements").array(),
  skills: varchar("skills", { length: 100 }).array(),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("idx_prof_exp_user").on(table.userId),
  typeIdx: index("idx_prof_exp_type").on(table.experienceType),
}));

export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  itemType: varchar("item_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  mediaUrl: varchar("media_url", { length: 512 }),
  mediaType: varchar("media_type", { length: 50 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
  eventDate: timestamp("event_date"),
  venue: varchar("venue", { length: 255 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  tags: varchar("tags", { length: 100 }).array(),
  category: varchar("category", { length: 100 }),
  isPublic: boolean("is_public").default(true),
  isFeatured: boolean("is_featured").default(false),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("idx_portfolio_user").on(table.userId),
  typeIdx: index("idx_portfolio_type").on(table.itemType),
}));

export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  issuingOrganization: varchar("issuing_organization", { length: 255 }).notNull(),
  issueDate: timestamp("issue_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  doesNotExpire: boolean("does_not_expire").default(false),
  credentialId: varchar("credential_id", { length: 255 }),
  credentialUrl: varchar("credential_url", { length: 512 }),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: integer("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  userIdx: index("idx_cert_user").on(table.userId),
}));

// ============================================================================
// GAMIFICATION & ACHIEVEMENTS
// ============================================================================

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  iconUrl: varchar("icon_url", { length: 512 }),
  pointsValue: integer("points_value").notNull(),
  rarity: varchar("rarity", { length: 50 }).notNull(),
  requirementType: varchar("requirement_type", { length: 100 }).notNull(),
  requirementValue: integer("requirement_value").notNull(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  slugIdx: index("idx_achievement_slug").on(table.slug),
  categoryIdx: index("idx_achievement_category").on(table.category),
}));

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id, { onDelete: 'cascade' }).notNull(),
  progress: integer("progress").default(0),
  progressMax: integer("progress_max").notNull(),
  isCompleted: boolean("is_completed").default(false),
  isDisplayed: boolean("is_displayed").default(true),
  displayOrder: integer("display_order"),
  earnedAt: timestamp("earned_at"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  uniqueUserAchievement: unique().on(table.userId, table.achievementId),
  userIdx: index("idx_user_ach_user").on(table.userId),
  completedIdx: index("idx_user_ach_completed").on(table.isCompleted),
}));

export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  totalPoints: integer("total_points").default(0),
  socialPoints: integer("social_points").default(0),
  eventPoints: integer("event_points").default(0),
  contributionPoints: integer("contribution_points").default(0),
  achievementPoints: integer("achievement_points").default(0),
  level: integer("level").default(1),
  levelProgress: integer("level_progress").default(0),
  nextLevelThreshold: integer("next_level_threshold").default(100),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("idx_user_points_user").on(table.userId),
  levelIdx: index("idx_user_points_level").on(table.level),
}));

// ============================================================================
// STORIES SYSTEM (Instagram-style)
// ============================================================================

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  mediaUrl: varchar("media_url", { length: 512 }).notNull(),
  mediaType: varchar("media_type", { length: 50 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
  caption: text("caption"),
  duration: integer("duration").default(5),
  backgroundColor: varchar("background_color", { length: 50 }),
  fontFamily: varchar("font_family", { length: 100 }),
  textColor: varchar("text_color", { length: 50 }),
  viewCount: integer("view_count").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  userIdx: index("idx_stories_user").on(table.userId),
  activeIdx: index("idx_stories_active").on(table.isActive),
  expiresIdx: index("idx_stories_expires").on(table.expiresAt),
}));

export const storyViews = pgTable("story_views", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id, { onDelete: 'cascade' }).notNull(),
  viewerId: integer("viewer_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  uniqueView: unique().on(table.storyId, table.viewerId),
  storyIdx: index("idx_story_views_story").on(table.storyId),
  viewerIdx: index("idx_story_views_viewer").on(table.viewerId),
}));

export const storyReactions = pgTable("story_reactions", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id, { onDelete: 'cascade' }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reactionType: varchar("reaction_type", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  storyIdx: index("idx_story_reactions_story").on(table.storyId),
  userIdx: index("idx_story_reactions_user").on(table.userId),
}));
// ============================================================================
// ZOD SCHEMAS & TYPES - TRACK 7 NEW FEATURES
// ============================================================================

// Memories
export const insertMemorySchema = createInsertSchema(memories).omit({ id: true, createdAt: true });
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type SelectMemory = typeof memories.$inferSelect;

// Recommendations
export const insertRecommendationSchema = createInsertSchema(recommendations).omit({ id: true, createdAt: true });
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type SelectRecommendation = typeof recommendations.$inferSelect;

// Role Invitations
export const insertRoleInvitationSchema = createInsertSchema(roleInvitations).omit({ id: true, createdAt: true, respondedAt: true });
export type InsertRoleInvitation = z.infer<typeof insertRoleInvitationSchema>;
export type SelectRoleInvitation = typeof roleInvitations.$inferSelect;

// Favorites
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type SelectFavorite = typeof favorites.$inferSelect;

// Community Stats
export const insertCommunityStatsSchema = createInsertSchema(communityStats).omit({ id: true, updatedAt: true });
export type InsertCommunityStats = z.infer<typeof insertCommunityStatsSchema>;
export type SelectCommunityStats = typeof communityStats.$inferSelect;

// ============================================================================
// ZOD SCHEMAS & TYPES - AGENT INTELLIGENCE NETWORK
// ============================================================================

// Breadcrumbs
export const insertBreadcrumbSchema = createInsertSchema(breadcrumbs).omit({ id: true, timestamp: true, createdAt: true });
export type InsertBreadcrumb = z.infer<typeof insertBreadcrumbSchema>;
export type SelectBreadcrumb = typeof breadcrumbs.$inferSelect;

// Failed Actions
export const insertFailedActionSchema = createInsertSchema(failedActions).omit({ id: true, timestamp: true, createdAt: true, resolvedAt: true });
export type InsertFailedAction = z.infer<typeof insertFailedActionSchema>;
export type SelectFailedAction = typeof failedActions.$inferSelect;

// Visual Edits
export const insertVisualEditSchema = createInsertSchema(visualEdits).omit({ id: true, createdAt: true, deployedAt: true });
export type InsertVisualEdit = z.infer<typeof insertVisualEditSchema>;
export type SelectVisualEdit = typeof visualEdits.$inferSelect;

// Agent Memories
export const insertAgentMemorySchema = createInsertSchema(agentMemories).omit({ id: true, createdAt: true });
export type InsertAgentMemory = z.infer<typeof insertAgentMemorySchema>;
export type SelectAgentMemory = typeof agentMemories.$inferSelect;

// Agent Knowledge
export const insertAgentKnowledgeSchema = createInsertSchema(agentKnowledge).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgentKnowledge = z.infer<typeof insertAgentKnowledgeSchema>;
export type SelectAgentKnowledge = typeof agentKnowledge.$inferSelect;

// Agent Communications
export const insertAgentCommunicationSchema = createInsertSchema(agentCommunications).omit({ id: true, createdAt: true });
export type InsertAgentCommunication = z.infer<typeof insertAgentCommunicationSchema>;
export type SelectAgentCommunication = typeof agentCommunications.$inferSelect;

// Agent Collaborations
export const insertAgentCollaborationSchema = createInsertSchema(agentCollaborations).omit({ id: true, createdAt: true, resolvedAt: true });
export type InsertAgentCollaboration = z.infer<typeof insertAgentCollaborationSchema>;
export type SelectAgentCollaboration = typeof agentCollaborations.$inferSelect;

// Agent Self Tests
export const insertAgentSelfTestSchema = createInsertSchema(agentSelfTests).omit({ id: true, createdAt: true });
export type InsertAgentSelfTest = z.infer<typeof insertAgentSelfTestSchema>;
export type SelectAgentSelfTest = typeof agentSelfTests.$inferSelect;




// ============================================================================
// ADMIN & MODERATION SYSTEM (PART 3-1, 30)
// ============================================================================

export const contentReports = pgTable("content_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  contentId: integer("content_id").notNull(),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default('pending'),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  reporterIdx: index("idx_content_reports_reporter").on(table.reporterId),
  statusIdx: index("idx_content_reports_status").on(table.status),
  contentIdx: index("idx_content_reports_content").on(table.contentType, table.contentId),
}));

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }),
  resourceId: varchar("resource_id", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  userIdx: index("idx_audit_logs_user").on(table.userId),
  actionIdx: index("idx_audit_logs_action").on(table.action),
  createdIdx: index("idx_audit_logs_created").on(table.createdAt),
}));

export const suspensionLogs = pgTable("suspension_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  suspendedBy: integer("suspended_by").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  duration: integer("duration"),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  isPermanent: boolean("is_permanent").default(false),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  userIdx: index("idx_suspension_logs_user").on(table.userId),
  activeIdx: index("idx_suspension_logs_active").on(table.endsAt),
}));

// User Reports (user-to-user reporting system)
export const userReports = pgTable("user_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reportedUserId: integer("reported_user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  reportType: varchar("report_type", { length: 100 }).notNull(), // harassment, spam, inappropriate_content, impersonation, scam, violence, hate_speech, other
  description: text("description").notNull(),
  evidence: jsonb("evidence"), // Screenshots, URLs, etc.
  status: varchar("status", { length: 50 }).default('pending').notNull(), // pending, under_review, resolved, dismissed
  severity: varchar("severity", { length: 50 }).default('medium'), // low, medium, high, critical
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  adminNotes: text("admin_notes"),
  action: varchar("action", { length: 50 }), // no_action, warning, suspension, ban
  actionDetails: text("action_details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  reporterIdx: index("idx_user_reports_reporter").on(table.reporterId),
  reportedUserIdx: index("idx_user_reports_reported_user").on(table.reportedUserId),
  statusIdx: index("idx_user_reports_status").on(table.status),
  severityIdx: index("idx_user_reports_severity").on(table.severity),
}));

// Role Requests (professional role upgrade requests: teacher, DJ, organizer)
export const roleRequests = pgTable("role_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  requestedRole: varchar("requested_role", { length: 50 }).notNull(), // teacher, dj, organizer
  currentRole: varchar("current_role", { length: 50 }).notNull(),
  experience: text("experience").notNull(), // Years of experience description
  credentials: jsonb("credentials"), // Certifications, links to work, references
  bio: text("bio"), // Professional bio
  specialties: text("specialties").array(), // Teaching styles, music genres, event types
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  website: text("website"),
  socialLinks: jsonb("social_links"), // Instagram, YouTube, etc.
  whyRequest: text("why_request").notNull(), // Why they want this role
  status: varchar("status", { length: 50 }).default('pending').notNull(), // pending, under_review, approved, rejected
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  adminNotes: text("admin_notes"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("idx_role_requests_user").on(table.userId),
  statusIdx: index("idx_role_requests_status").on(table.status),
  requestedRoleIdx: index("idx_role_requests_requested_role").on(table.requestedRole),
  createdAtIdx: index("idx_role_requests_created_at").on(table.createdAt),
}));

export const banAppealslogs = pgTable("ban_appeals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  suspensionLogId: integer("suspension_log_id").references(() => suspensionLogs.id),
  appealText: text("appeal_text").notNull(),
  status: varchar("status", { length: 50 }).default('pending'),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  userIdx: index("idx_ban_appeals_user").on(table.userId),
  statusIdx: index("idx_ban_appeals_status").on(table.status),
}));

export const travelPlans = pgTable("travel_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  cityId: integer("city_id"),
  city: varchar("city", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  tripDuration: integer("trip_duration").notNull(),
  budget: varchar("budget", { length: 255 }),
  interests: text("interests").array().default(sql`'{}'::text[]`),
  travelStyle: varchar("travel_style", { length: 255 }),
  status: varchar("status", { length: 50 }).default('planning'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("idx_travel_plans_user").on(table.userId),
  statusIdx: index("idx_travel_plans_status").on(table.status),
}));

export const travelPlanItems = pgTable("travel_plan_items", {
  id: serial("id").primaryKey(),
  travelPlanId: integer("travel_plan_id").references(() => travelPlans.id, { onDelete: 'cascade' }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date"),
  location: varchar("location", { length: 255 }),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  bookingUrl: varchar("booking_url", { length: 512 }),
  isBooked: boolean("is_booked").default(false),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  planIdx: index("idx_travel_items_plan").on(table.travelPlanId),
  typeIdx: index("idx_travel_items_type").on(table.type),
}));

// Venue Recommendations System (PART 1-14)
export const venueRecommendations = pgTable("venue_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // 'restaurant', 'cafe', 'hotel', 'venue'
  cuisine: varchar("cuisine", { length: 100 }), // 'Italian', 'Chinese', etc.
  address: text("address").notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  country: varchar("country", { length: 255 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  rating: real("rating"), // 1-5 stars
  priceLevel: varchar("price_level", { length: 10 }), // '$', '$$', '$$$', '$$$$'
  description: text("description"),
  phoneNumber: varchar("phone_number", { length: 50 }),
  website: varchar("website", { length: 512 }),
  imageUrl: text("image_url"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("idx_venue_recommendations_user").on(table.userId),
  categoryIdx: index("idx_venue_recommendations_category").on(table.category),
  cuisineIdx: index("idx_venue_recommendations_cuisine").on(table.cuisine),
  cityIdx: index("idx_venue_recommendations_city").on(table.city),
  ratingIdx: index("idx_venue_recommendations_rating").on(table.rating),
}));

export const talentProfiles = pgTable("talent_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  profileType: varchar("profile_type", { length: 50 }).notNull(),
  skills: varchar("skills", { length: 100 }).array(),
  availability: varchar("availability", { length: 50 }),
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }),
  experienceYears: integer("experience_years"),
  portfolio: jsonb("portfolio"),
  isActive: boolean("is_active").default(true),
  verificationStatus: varchar("verification_status", { length: 50 }).default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("idx_talent_profiles_user").on(table.userId),
  typeIdx: index("idx_talent_profiles_type").on(table.profileType),
  activeIdx: index("idx_talent_profiles_active").on(table.isActive),
}));

export const talentMatches = pgTable("talent_matches", {
  id: serial("id").primaryKey(),
  seekerId: integer("seeker_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  talentId: integer("talent_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  matchScore: real("match_score").notNull(),
  matchReason: text("match_reason"),
  status: varchar("status", { length: 50 }).default('suggested'),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  seekerIdx: index("idx_talent_matches_seeker").on(table.seekerId),
  talentIdx: index("idx_talent_matches_talent").on(table.talentId),
  scoreIdx: index("idx_talent_matches_score").on(table.matchScore),
}));

export const newsletterCampaigns = pgTable("newsletter_campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 50 }).default('draft'),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count").default(0),
  openRate: real("open_rate"),
  clickRate: real("click_rate"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  statusIdx: index("idx_newsletter_campaigns_status").on(table.status),
  scheduledIdx: index("idx_newsletter_campaigns_scheduled").on(table.scheduledAt),
}));

export const newsletterSends = pgTable("newsletter_sends", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => newsletterCampaigns.id, { onDelete: 'cascade' }).notNull(),
  subscriberId: integer("subscriber_id").references(() => newsletterSubscriptions.id, { onDelete: 'cascade' }).notNull(),
  status: varchar("status", { length: 50 }).default('sent'),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  sentAt: timestamp("sent_at").defaultNow()
}, (table) => ({
  campaignIdx: index("idx_newsletter_sends_campaign").on(table.campaignId),
  subscriberIdx: index("idx_newsletter_sends_subscriber").on(table.subscriberId),
  statusIdx: index("idx_newsletter_sends_status").on(table.status),
}));

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  status: varchar("status", { length: 50 }).default('new'),
  respondedAt: timestamp("responded_at"),
  respondedBy: integer("responded_by").references(() => users.id),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  emailIdx: index("idx_contact_submissions_email").on(table.email),
  statusIdx: index("idx_contact_submissions_status").on(table.status),
  createdIdx: index("idx_contact_submissions_created").on(table.createdAt),
}));

// ============================================================================
// ZOD SCHEMAS & TYPES - NEW TABLES
// ============================================================================

// Professional Experiences
export const insertProfessionalExperienceSchema = createInsertSchema(professionalExperiences).omit({ id: true, createdAt: true, updatedAt: true, verifiedAt: true });
export type InsertProfessionalExperience = z.infer<typeof insertProfessionalExperienceSchema>;
export type SelectProfessionalExperience = typeof professionalExperiences.$inferSelect;

// Portfolio Items
export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type SelectPortfolioItem = typeof portfolioItems.$inferSelect;

// Certifications
export const insertCertificationSchema = createInsertSchema(certifications).omit({ id: true, createdAt: true });
export type InsertCertification = z.infer<typeof insertCertificationSchema>;
export type SelectCertification = typeof certifications.$inferSelect;

// Achievements
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, createdAt: true });
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type SelectAchievement = typeof achievements.$inferSelect;

// User Achievements
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true, createdAt: true, earnedAt: true });
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type SelectUserAchievement = typeof userAchievements.$inferSelect;

// User Points
export const insertUserPointsSchema = createInsertSchema(userPoints).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserPoints = z.infer<typeof insertUserPointsSchema>;
export type SelectUserPoints = typeof userPoints.$inferSelect;

// Stories
export const insertStorySchema = createInsertSchema(stories).omit({ id: true, createdAt: true });
export type InsertStory = z.infer<typeof insertStorySchema>;
export type SelectStory = typeof stories.$inferSelect;

// Story Views
export const insertStoryViewSchema = createInsertSchema(storyViews).omit({ id: true, createdAt: true });
export type InsertStoryView = z.infer<typeof insertStoryViewSchema>;
export type SelectStoryView = typeof storyViews.$inferSelect;

// Story Reactions
export const insertStoryReactionSchema = createInsertSchema(storyReactions).omit({ id: true, createdAt: true });
export type InsertStoryReaction = z.infer<typeof insertStoryReactionSchema>;
export type SelectStoryReaction = typeof storyReactions.$inferSelect;

// Content Reports
export const insertContentReportSchema = createInsertSchema(contentReports).omit({ id: true, createdAt: true, reviewedAt: true });
export type InsertContentReport = z.infer<typeof insertContentReportSchema>;
export type SelectContentReport = typeof contentReports.$inferSelect;

// User Reports
export const insertUserReportSchema = createInsertSchema(userReports).omit({ id: true, createdAt: true, updatedAt: true, reviewedAt: true });
export type InsertUserReport = z.infer<typeof insertUserReportSchema>;
export type SelectUserReport = typeof userReports.$inferSelect;

// Role Requests
export const insertRoleRequestSchema = createInsertSchema(roleRequests).omit({ id: true, createdAt: true, updatedAt: true, reviewedAt: true });
export type InsertRoleRequest = z.infer<typeof insertRoleRequestSchema>;
export type SelectRoleRequest = typeof roleRequests.$inferSelect;

// Audit Logs
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SelectAuditLog = typeof auditLogs.$inferSelect;

// Suspension Logs
export const insertSuspensionLogSchema = createInsertSchema(suspensionLogs).omit({ id: true, createdAt: true });
export type InsertSuspensionLog = z.infer<typeof insertSuspensionLogSchema>;
export type SelectSuspensionLog = typeof suspensionLogs.$inferSelect;

// Ban Appeals
export const insertBanAppealSchema = createInsertSchema(banAppealslogs).omit({ id: true, createdAt: true, reviewedAt: true });
export type InsertBanAppeal = z.infer<typeof insertBanAppealSchema>;
export type SelectBanAppeal = typeof banAppealslogs.$inferSelect;

// Travel Plans
export const insertTravelPlanSchema = createInsertSchema(travelPlans).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTravelPlan = z.infer<typeof insertTravelPlanSchema>;
export type SelectTravelPlan = typeof travelPlans.$inferSelect;

// Travel Plan Items
export const insertTravelPlanItemSchema = createInsertSchema(travelPlanItems).omit({ id: true, createdAt: true });
export type InsertTravelPlanItem = z.infer<typeof insertTravelPlanItemSchema>;
export type SelectTravelPlanItem = typeof travelPlanItems.$inferSelect;

// Talent Profiles
export const insertTalentProfileSchema = createInsertSchema(talentProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTalentProfile = z.infer<typeof insertTalentProfileSchema>;
export type SelectTalentProfile = typeof talentProfiles.$inferSelect;

// Talent Matches
export const insertTalentMatchSchema = createInsertSchema(talentMatches).omit({ id: true, createdAt: true });
export type InsertTalentMatch = z.infer<typeof insertTalentMatchSchema>;
export type SelectTalentMatch = typeof talentMatches.$inferSelect;

// Newsletter Campaigns
export const insertNewsletterCampaignSchema = createInsertSchema(newsletterCampaigns).omit({ id: true, createdAt: true, sentAt: true });
export type InsertNewsletterCampaign = z.infer<typeof insertNewsletterCampaignSchema>;
export type SelectNewsletterCampaign = typeof newsletterCampaigns.$inferSelect;

// Newsletter Sends
export const insertNewsletterSendSchema = createInsertSchema(newsletterSends).omit({ id: true, sentAt: true, openedAt: true, clickedAt: true });
export type InsertNewsletterSend = z.infer<typeof insertNewsletterSendSchema>;
export type SelectNewsletterSend = typeof newsletterSends.$inferSelect;

// Contact Submissions
export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ id: true, createdAt: true, respondedAt: true });
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type SelectContactSubmission = typeof contactSubmissions.$inferSelect;

// Venue Recommendations
export const insertVenueRecommendationSchema = createInsertSchema(venueRecommendations).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVenueRecommendation = z.infer<typeof insertVenueRecommendationSchema>;
export type SelectVenueRecommendation = typeof venueRecommendations.$inferSelect;

// ============================================================================
// PLATFORM INDEPENDENCE SCHEMA (PATH 2)
// ============================================================================

// ============================================================================
// HOUSING MARKETPLACE SYSTEM (PART 15)

// ============================================================================
// PLATFORM INDEPENDENCE SCHEMA (PATH 2)
// ============================================================================

// Export all platform tables from platform-schema.ts so Drizzle can see them
export * from "./platform-schema";
