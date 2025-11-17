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
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export message schemas
export * from "./messageSchemas";

// Re-export event roles schemas
export * from "./eventRolesSchemas";

// Re-export ad schemas
export * from "./adSchemas";

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
  customVoiceId: varchar("custom_voice_id", { length: 255 }),
  
  // WEEK 9 DAY 2: User Profile & Networking Features
  interests: text("interests").array(),
  socialLinks: jsonb("social_links"),
  availability: jsonb("availability"),
  customUrl: varchar("custom_url", { length: 100 }).unique(),
  privacySettings: jsonb("privacy_settings"),
  verificationBadge: boolean("verification_badge").default(false),
  portfolioUrls: text("portfolio_urls").array(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  usernameIdx: index("users_username_idx").on(table.username),
  cityCountryIdx: index("users_city_country_idx").on(table.city, table.country),
  activeIdx: index("users_active_idx").on(table.isActive),
  citiesIdx: index("users_cities_idx").on(table.city, table.country, table.isActive),
  customUrlIdx: index("users_custom_url_idx").on(table.customUrl),
}));

// ============================================================================
// GOD LEVEL QUOTAS
// ============================================================================

export const godLevelQuotas = pgTable("god_level_quotas", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  videoQuotaUsed: integer("video_quota_used").default(0).notNull(),
  videoQuotaLimit: integer("video_quota_limit").default(5).notNull(),
  voiceQuotaUsed: integer("voice_quota_used").default(0).notNull(),
  voiceQuotaLimit: integer("voice_quota_limit").default(5).notNull(),
  quotaResetDate: timestamp("quota_reset_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("god_level_quotas_user_idx").on(table.userId),
  resetDateIdx: index("god_level_quotas_reset_date_idx").on(table.quotaResetDate),
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
// PROFILE ANALYTICS
// ============================================================================

export const profileViews = pgTable("profile_views", {
  id: serial("id").primaryKey(),
  profileUserId: integer("profile_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  viewerUserId: integer("viewer_user_id").references(() => users.id, { onDelete: "cascade" }),
  profileType: varchar("profile_type", { length: 50 }),
  viewerIp: varchar("viewer_ip", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  profileUserIdx: index("profile_views_profile_user_idx").on(table.profileUserId),
  viewerUserIdx: index("profile_views_viewer_user_idx").on(table.viewerUserId),
  createdAtIdx: index("profile_views_created_at_idx").on(table.createdAt),
  profileTypeIdx: index("profile_views_profile_type_idx").on(table.profileType),
  compositeIdx: index("profile_views_composite_idx").on(table.profileUserId, table.createdAt),
}));

// ============================================================================
// USER SKILLS & ENDORSEMENTS (WEEK 9 DAY 2)
// ============================================================================

export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillName: varchar("skill_name", { length: 100 }).notNull(),
  level: varchar("level", { length: 50 }), // beginner, intermediate, advanced, expert
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_skills_user_idx").on(table.userId),
  skillIdx: index("user_skills_skill_idx").on(table.skillName),
  uniqueUserSkill: uniqueIndex("unique_user_skill").on(table.userId, table.skillName),
}));

export const skillEndorsements = pgTable("skill_endorsements", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull().references(() => userSkills.id, { onDelete: "cascade" }),
  endorserId: integer("endorser_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  skillIdx: index("skill_endorsements_skill_idx").on(table.skillId),
  endorserIdx: index("skill_endorsements_endorser_idx").on(table.endorserId),
  uniqueEndorsement: uniqueIndex("unique_skill_endorsement").on(table.skillId, table.endorserId),
}));

// ============================================================================
// BLOCKED USERS & REPORTS (WEEK 9 DAY 2)
// ============================================================================

export const blockedUsers = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  blockerId: integer("blocker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  blockedId: integer("blocked_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  blockerIdx: index("blocked_users_blocker_idx").on(table.blockerId),
  blockedIdx: index("blocked_users_blocked_idx").on(table.blockedId),
  uniqueBlock: uniqueIndex("unique_block").on(table.blockerId, table.blockedId),
}));

export const reportedProfiles = pgTable("reported_profiles", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportedUserId: integer("reported_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, reviewed, resolved, dismissed
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
}, (table) => ({
  reporterIdx: index("reported_profiles_reporter_idx").on(table.reporterId),
  reportedIdx: index("reported_profiles_reported_idx").on(table.reportedUserId),
  statusIdx: index("reported_profiles_status_idx").on(table.status),
}));

// ============================================================================
// EVENTS (matching existing schema + extensions)
// ============================================================================

// Event Categories enum
export const eventCategoryEnum = pgEnum("event_category", [
  "milonga",
  "workshop",
  "festival",
  "practice",
  "concert",
  "class",
  "performance",
  "social",
  "other"
]);

// Event Ticket Types enum
export const eventTicketTypeEnum = pgEnum("event_ticket_type", [
  "general",
  "vip",
  "earlybird",
  "group",
  "student",
  "couple",
  "single"
]);

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
  
  // Approval Workflow (for community-submitted events requiring admin review)
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  adminNotes: text("admin_notes"),
  
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
  cityCountryIdx: index("events_city_country_idx").on(table.city, table.country),
  userStartDateIdx: index("events_user_start_date_idx").on(table.userId, table.startDate),
  // GIN indexes for full-text search
  titleSearchIdx: index("events_title_search_idx").using(
    "gin",
    sql`to_tsvector('english', ${table.title})`
  ),
  descriptionSearchIdx: index("events_description_search_idx").using(
    "gin",
    sql`to_tsvector('english', ${table.description})`
  ),
  locationSearchIdx: index("events_location_search_idx").using(
    "gin",
    sql`to_tsvector('english', ${table.location})`
  ),
  // Combined search index for title + description (optimized for full-text search)
  searchIdx: index("events_search_idx").using(
    "gin", 
    sql`to_tsvector('english', ${table.title} || ' ' || ${table.description})`
  ),
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
  checkedInByIdx: index("event_rsvps_checked_in_by_idx").on(table.checkedInBy),
  paymentStatusIdx: index("event_rsvps_payment_status_idx").on(table.paymentStatus),
  eventStatusIdx: index("event_rsvps_event_status_idx").on(table.eventId, table.status),
  userStatusIdx: index("event_rsvps_user_status_idx").on(table.userId, table.status),
  rsvpedAtIdx: index("event_rsvps_rsvped_at_idx").on(table.rsvpedAt),
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
  createdByIdx: index("groups_created_by_idx").on(table.createdBy),
  ownerIdIdx: index("groups_owner_id_idx").on(table.ownerId),
  lastActivityIdx: index("groups_last_activity_idx").on(table.lastActivityAt),
  cityCountryVisibleIdx: index("groups_city_country_visible_idx").on(table.city, table.country, table.visibility),
}));

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Role System: 'member' (full rights via automation) | 'follower' (limited rights via voluntary follow) | 'admin' | 'moderator'
  role: varchar("role", { length: 20 }).default("member"),
  
  // Permissions (defaults differ for members vs followers)
  canPost: boolean("can_post").default(true), // true for members, false for followers
  canComment: boolean("can_comment").default(true), // true for both
  canCreateEvents: boolean("can_create_events").default(false), // true for members, false for followers
  canInvite: boolean("can_invite").default(true), // true for members, false for followers
  canModerate: boolean("can_moderate").default(false), // false for both (admin/moderator only)
  
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
  invitedByIdx: index("group_members_invited_by_idx").on(table.invitedBy),
  approvedByIdx: index("group_members_approved_by_idx").on(table.approvedBy),
  joinedAtIdx: index("group_members_joined_at_idx").on(table.joinedAt),
  groupRoleIdx: index("group_members_group_role_idx").on(table.groupId, table.role),
  userJoinedIdx: index("group_members_user_joined_idx").on(table.userId, table.joinedAt),
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
  linkedEventIdx: index("group_posts_linked_event_idx").on(table.linkedEventId),
  pinnedByIdx: index("group_posts_pinned_by_idx").on(table.pinnedBy),
  approvedByIdx: index("group_posts_approved_by_idx").on(table.approvedBy),
  groupCreatedIdx: index("group_posts_group_created_idx").on(table.groupId, table.createdAt),
  authorCreatedIdx: index("group_posts_author_created_idx").on(table.authorId, table.createdAt),
  groupStatusIdx: index("group_posts_group_status_idx").on(table.groupId, table.status),
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
  videoThumbnail: text("video_thumbnail"),
  mediaEmbeds: jsonb("media_embeds"),
  mediaGallery: jsonb("media_gallery"), // Array of {url: string, type: 'image'|'video', order: number}
  mentions: text("mentions").array().default(sql`ARRAY[]::text[]`),
  hashtags: text("hashtags").array(),
  tags: text("tags").array(),
  location: text("location"),
  coordinates: jsonb("coordinates"),
  placeId: text("place_id"),
  formattedAddress: text("formatted_address"),
  visibility: varchar("visibility").default("public"),
  postType: varchar("post_type").default("post"),
  type: varchar("type", { length: 20 }).notNull().default("post"), // 'post' | 'story'
  status: varchar("status", { length: 20 }).default("published"), // 'draft' | 'scheduled' | 'published'
  scheduledFor: timestamp("scheduled_for"),
  wordCount: integer("word_count").default(0),
  expiresAt: timestamp("expires_at"), // Only set for stories (24 hours from creation)
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
  typeExpiresIdx: index("posts_type_expires_idx").on(table.type, table.expiresAt),
  statusScheduledIdx: index("posts_status_scheduled_idx").on(table.status, table.scheduledFor),
  visibilityIdx: index("posts_visibility_idx").on(table.visibility),
  statusIdx: index("posts_status_idx").on(table.status),
  userCreatedIdx: index("posts_user_created_idx").on(table.userId, table.createdAt),
  userVisibleIdx: index("posts_user_visible_idx").on(table.userId, table.visibility),
  visibleCreatedIdx: index("posts_visible_created_idx").on(table.visibility, table.createdAt),
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

export const postDrafts = pgTable("post_drafts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  richContent: jsonb("rich_content"),
  mediaGallery: jsonb("media_gallery"),
  videoUrl: text("video_url"),
  videoThumbnail: text("video_thumbnail"),
  mentions: text("mentions").array(),
  hashtags: text("hashtags").array(),
  tags: text("tags").array(),
  location: text("location"),
  coordinates: jsonb("coordinates"),
  visibility: varchar("visibility").default("public"),
  lastSaved: timestamp("last_saved").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("post_drafts_user_idx").on(table.userId),
  lastSavedIdx: index("post_drafts_last_saved_idx").on(table.lastSaved),
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
  roomCreatedIdx: index("chat_messages_room_created_idx").on(table.chatRoomId, table.createdAt),
  mediaTypeIdx: index("chat_messages_media_type_idx").on(table.mediaType),
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
  data: text("data"),
  isRead: boolean("is_read").default(false).notNull(),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  readIdx: index("notifications_read_idx").on(table.isRead),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
  typeIdx: index("notifications_type_idx").on(table.type),
  userReadIdx: index("notifications_user_read_idx").on(table.userId, table.isRead),
  userCreatedIdx: index("notifications_user_created_idx").on(table.userId, table.createdAt),
  userTypeIdx: index("notifications_user_type_idx").on(table.userId, table.type),
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
  
  // ENCRYPTED FIELD: Stores sensitive 2FA data
  // {secret: string, backupCodes: string[], phoneNumber?: string}
  encryptedData: text("encrypted_data"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("two_factor_secrets_user_idx").on(table.userId),
}));

export const securityAuditLogs = pgTable("security_audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("security_audit_logs_user_idx").on(table.userId),
  actionIdx: index("security_audit_logs_action_idx").on(table.action),
  timestampIdx: index("security_audit_logs_timestamp_idx").on(table.timestamp),
}));

// ============================================================================
// AI INTERACTIONS
// ============================================================================

export const mrBlueConversations = pgTable("mr_blue_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),
  contextWindow: integer("context_window").default(10),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("mr_blue_conversations_user_idx").on(table.userId),
}));

export const mrBlueMessages = pgTable("mr_blue_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => mrBlueConversations.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  readAt: timestamp("read_at"),
  readBy: integer("read_by").array(),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  conversationIdx: index("mr_blue_messages_conversation_idx").on(table.conversationId),
  conversationCreatedIdx: index("mr_blue_messages_conv_created_idx").on(table.conversationId, table.createdAt),
  userIdx: index("mr_blue_messages_user_idx").on(table.userId),
}));

export const messageReactions = pgTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => mrBlueMessages.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  messageIdx: index("message_reactions_message_idx").on(table.messageId),
  userIdx: index("message_reactions_user_idx").on(table.userId),
  uniqueReaction: uniqueIndex("unique_message_user_emoji").on(table.messageId, table.userId, table.emoji),
}));

export const messageBookmarks = pgTable("message_bookmarks", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => mrBlueMessages.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  messageIdx: index("message_bookmarks_message_idx").on(table.messageId),
  userIdx: index("message_bookmarks_user_idx").on(table.userId),
  uniqueBookmark: uniqueIndex("unique_message_user_bookmark").on(table.messageId, table.userId),
}));

// ============================================================================
// MR BLUE MEMORY SYSTEM (System 8)
// ============================================================================

export const userMemories = pgTable("user_memories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  memoryType: varchar("memory_type", { length: 50 }).notNull(), // conversation, preference, fact, feedback, decision
  importance: integer("importance").default(5).notNull(), // 1-10 scale
  metadata: jsonb("metadata"), // {source, conversationId, tags, etc}
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
  accessCount: integer("access_count").default(0).notNull(),
}, (table) => ({
  userIdx: index("user_memories_user_idx").on(table.userId),
  typeIdx: index("user_memories_type_idx").on(table.memoryType),
  userTypeIdx: index("user_memories_user_type_idx").on(table.userId, table.memoryType),
  createdIdx: index("user_memories_created_idx").on(table.createdAt),
  importanceIdx: index("user_memories_importance_idx").on(table.importance),
}));

export const conversationSummaries = pgTable("conversation_summaries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  conversationId: integer("conversation_id").references(() => mrBlueConversations.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  summary: text("summary").notNull(),
  messageCount: integer("message_count").default(0).notNull(),
  topics: text("topics").array(),
  keyDecisions: text("key_decisions").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("conversation_summaries_user_idx").on(table.userId),
  conversationIdx: index("conversation_summaries_conv_idx").on(table.conversationId),
  timeIdx: index("conversation_summaries_time_idx").on(table.startTime, table.endTime),
}));

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  preferenceKey: varchar("preference_key", { length: 100 }).notNull(),
  preferenceValue: text("preference_value").notNull(),
  confidence: real("confidence").default(0.5).notNull(), // 0-1 scale
  extractedFrom: text("extracted_from"), // Source conversation snippet
  metadata: jsonb("metadata"), // Additional context
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_preferences_user_idx").on(table.userId),
  keyIdx: index("user_preferences_key_idx").on(table.preferenceKey),
  userKeyIdx: index("user_preferences_user_key_idx").on(table.userId, table.preferenceKey),
  confidenceIdx: index("user_preferences_confidence_idx").on(table.confidence),
  uniqueUserKey: uniqueIndex("unique_user_preference_key").on(table.userId, table.preferenceKey),
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

// User Memories (System 8)
export const insertUserMemorySchema = createInsertSchema(userMemories, {
  content: z.string().min(1),
  memoryType: z.enum(['conversation', 'preference', 'fact', 'feedback', 'decision']),
  importance: z.number().min(1).max(10),
}).omit({
  id: true,
  createdAt: true,
  lastAccessedAt: true,
  accessCount: true,
});
export type InsertUserMemory = z.infer<typeof insertUserMemorySchema>;
export type SelectUserMemory = typeof userMemories.$inferSelect;

// Conversation Summaries
export const insertConversationSummarySchema = createInsertSchema(conversationSummaries, {
  summary: z.string().min(1),
  messageCount: z.number().min(0),
}).omit({
  id: true,
  createdAt: true,
});
export type InsertConversationSummary = z.infer<typeof insertConversationSummarySchema>;
export type SelectConversationSummary = typeof conversationSummaries.$inferSelect;

// User Preferences
export const insertUserPreferenceSchema = createInsertSchema(userPreferences, {
  preferenceKey: z.string().min(1).max(100),
  preferenceValue: z.string().min(1),
  confidence: z.number().min(0).max(1),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;
export type SelectUserPreference = typeof userPreferences.$inferSelect;

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
  danceEventIdx: index("friend_requests_dance_event_idx").on(table.danceEventId),
  createdAtIdx: index("friend_requests_created_at_idx").on(table.createdAt),
  senderStatusIdx: index("friend_requests_sender_status_idx").on(table.senderId, table.status),
  receiverStatusIdx: index("friend_requests_receiver_status_idx").on(table.receiverId, table.status),
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
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  host: varchar("host").notNull(),
  thumbnail: text("thumbnail"),
  streamUrl: text("stream_url"),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, live, ended
  isLive: boolean("is_live").default(false),
  viewers: integer("viewers").default(0),
  viewerCount: integer("viewer_count").default(0),
  scheduledDate: varchar("scheduled_date"),
  registrations: integer("registrations").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
}, (table) => ({
  userIdx: index("live_streams_user_idx").on(table.userId),
  liveIdx: index("live_streams_live_idx").on(table.isLive),
  statusIdx: index("live_streams_status_idx").on(table.status),
}));

// Story Views
export const storyViews = pgTable("story_views", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  viewerId: integer("viewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  storyIdx: index("story_views_story_idx").on(table.storyId),
  viewerIdx: index("story_views_viewer_idx").on(table.viewerId),
  uniqueView: uniqueIndex("unique_story_view").on(table.storyId, table.viewerId),
}));

// Stream Viewers
export const streamViewers = pgTable("stream_viewers", {
  id: serial("id").primaryKey(),
  streamId: integer("stream_id").notNull().references(() => liveStreams.id, { onDelete: "cascade" }),
  viewerId: integer("viewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at"),
}, (table) => ({
  streamIdx: index("stream_viewers_stream_idx").on(table.streamId),
  viewerIdx: index("stream_viewers_viewer_idx").on(table.viewerId),
  activeIdx: index("stream_viewers_active_idx").on(table.streamId, table.leftAt),
}));

// Live Stream Messages
export const liveStreamMessages = pgTable("live_stream_messages", {
  id: serial("id").primaryKey(),
  streamId: integer("stream_id").notNull().references(() => liveStreams.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  streamIdx: index("live_stream_messages_stream_idx").on(table.streamId),
  userIdx: index("live_stream_messages_user_idx").on(table.userId),
  createdAtIdx: index("live_stream_messages_created_at_idx").on(table.createdAt),
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

export const insertLiveStreamMessageSchema = createInsertSchema(liveStreamMessages).omit({ id: true, createdAt: true });
export type InsertLiveStreamMessage = z.infer<typeof insertLiveStreamMessageSchema>;
export type SelectLiveStreamMessage = typeof liveStreamMessages.$inferSelect;

export const insertMediaSchema = createInsertSchema(media).omit({ id: true, createdAt: true });
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type SelectMedia = typeof media.$inferSelect;

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type SelectActivityLog = typeof activityLogs.$inferSelect;

export const insertBlockedUserSchema = createInsertSchema(blockedUsers).omit({ id: true, createdAt: true });
export type InsertBlockedUser = z.infer<typeof insertBlockedUserSchema>;
export type SelectBlockedUser = typeof blockedUsers.$inferSelect;

export const insertUserSkillSchema = createInsertSchema(userSkills).omit({ id: true, createdAt: true });
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;
export type SelectUserSkill = typeof userSkills.$inferSelect;

export const insertSkillEndorsementSchema = createInsertSchema(skillEndorsements).omit({ id: true, createdAt: true });
export type InsertSkillEndorsement = z.infer<typeof insertSkillEndorsementSchema>;
export type SelectSkillEndorsement = typeof skillEndorsements.$inferSelect;

export const insertReportedProfileSchema = createInsertSchema(reportedProfiles).omit({ id: true, createdAt: true, reviewedAt: true });
export type InsertReportedProfile = z.infer<typeof insertReportedProfileSchema>;
export type SelectReportedProfile = typeof reportedProfiles.$inferSelect;

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

// Profile Views
export const insertProfileViewSchema = createInsertSchema(profileViews).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertProfileView = z.infer<typeof insertProfileViewSchema>;
export type SelectProfileView = typeof profileViews.$inferSelect;

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
  
  // ENCRYPTED FIELD: Stores sensitive user preferences
  // {privateSettings: any, securityPreferences: any, sensitiveData: any}
  encryptedData: text("encrypted_data"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("user_settings_user_idx").on(table.userId),
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


export const insertPostShareSchema = createInsertSchema(postShares).omit({ id: true, createdAt: true });
export type InsertPostShare = z.infer<typeof insertPostShareSchema>;
export type SelectPostShare = typeof postShares.$inferSelect;

export const insertReactionSchema = createInsertSchema(reactions).omit({ id: true, createdAt: true });
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type SelectReaction = typeof reactions.$inferSelect;

// ============================================================================
// FACEBOOK DATA IMPORT (System 0 - MB.MD Protocol)
// ============================================================================

// Facebook Import Sessions (track import operations from FB accounts)
export const facebookImports = pgTable("facebook_imports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountName: varchar("account_name").notNull(), // @sboddye or @mundotango1
  dataType: varchar("data_type").notNull(), // profile, posts, friends, events, groups, photos
  status: varchar("status").default("pending").notNull(), // pending, in_progress, completed, failed
  itemsImported: integer("items_imported").default(0),
  itemsFailed: integer("items_failed").default(0),
  errorLog: text("error_log"),
  jsonData: jsonb("json_data"), // Full import metadata
  importDate: timestamp("import_date").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("facebook_imports_user_idx").on(table.userId),
  accountIdx: index("facebook_imports_account_idx").on(table.accountName),
  statusIdx: index("facebook_imports_status_idx").on(table.status),
  dateIdx: index("facebook_imports_date_idx").on(table.importDate),
}));

// Facebook Posts (imported posts from FB accounts)
export const facebookPosts = pgTable("facebook_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fbPostId: varchar("fb_post_id").notNull().unique(), // Original Facebook post ID
  content: text("content"),
  mediaUrls: text("media_urls").array(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  fbCreatedAt: timestamp("fb_created_at"), // Original FB timestamp
  importedAt: timestamp("imported_at").defaultNow().notNull(),
  mappedPostId: integer("mapped_post_id").references(() => posts.id), // Link to MT post if imported
}, (table) => ({
  userIdx: index("facebook_posts_user_idx").on(table.userId),
  fbPostIdIdx: index("facebook_posts_fb_post_id_idx").on(table.fbPostId),
  mappedIdx: index("facebook_posts_mapped_idx").on(table.mappedPostId),
}));

// Facebook Friends (imported friends from FB accounts)
export const facebookFriends = pgTable("facebook_friends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  friendName: varchar("friend_name").notNull(),
  friendFbId: varchar("friend_fb_id"), // FB user ID if available
  friendProfileUrl: text("friend_profile_url"),
  mutualFriends: integer("mutual_friends").default(0),
  relationship: varchar("relationship"), // close_friend, acquaintance, family, etc
  importedAt: timestamp("imported_at").defaultNow().notNull(),
  mappedUserId: integer("mapped_user_id").references(() => users.id), // Link to MT user if they exist
}, (table) => ({
  userIdx: index("facebook_friends_user_idx").on(table.userId),
  friendFbIdIdx: index("facebook_friends_fb_id_idx").on(table.friendFbId),
  mappedIdx: index("facebook_friends_mapped_idx").on(table.mappedUserId),
}));

// Zod Schemas for Facebook Import Tables
export const insertFacebookImportSchema = createInsertSchema(facebookImports).omit({ id: true, importDate: true, completedAt: true });
export type InsertFacebookImport = z.infer<typeof insertFacebookImportSchema>;
export type SelectFacebookImport = typeof facebookImports.$inferSelect;

export const insertFacebookPostSchema = createInsertSchema(facebookPosts).omit({ id: true, importedAt: true });
export type InsertFacebookPost = z.infer<typeof insertFacebookPostSchema>;
export type SelectFacebookPost = typeof facebookPosts.$inferSelect;

export const insertFacebookFriendSchema = createInsertSchema(facebookFriends).omit({ id: true, importedAt: true });
export type InsertFacebookFriend = z.infer<typeof insertFacebookFriendSchema>;
export type SelectFacebookFriend = typeof facebookFriends.$inferSelect;

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
  photos: jsonb('photos').$type<Array<{
    id: string;
    url: string;
    publicId: string;
    caption?: string;
    order: number;
    isCover: boolean;
  }>>().default(sql`'[]'::jsonb`),
  coverPhotoUrl: text('cover_photo_url'),
  status: varchar("status").default("active").notNull(),
  
  // Safety Verification (admin reviews for trust & safety)
  verificationStatus: varchar("verification_status").default("pending").notNull(),
  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  safetyNotes: text("safety_notes"),
  rejectionReason: text("rejection_reason"),
  
  // ENCRYPTED FIELD: Stores sensitive pricing and financial details
  // {pricingDetails: any, cleaningFee?: number, securityDeposit?: number, hostPaymentInfo?: any}
  encryptedData: text("encrypted_data"),
  
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
  coverImageId: integer("cover_image_id").references(() => media.id, { onDelete: "set null" }),
  mediaCount: integer("media_count").default(0),
  privacy: varchar("privacy").default("public").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("media_albums_user_idx").on(table.userId),
  createdAtIdx: index("media_albums_created_at_idx").on(table.createdAt),
  coverImageIdx: index("media_albums_cover_image_idx").on(table.coverImageId),
}));

// Album Media (junction table)
export const albumMedia = pgTable("album_media", {
  id: serial("id").primaryKey(),
  albumId: integer("album_id").notNull().references(() => mediaAlbums.id, { onDelete: "cascade" }),
  mediaId: integer("media_id").notNull().references(() => media.id, { onDelete: "cascade" }),
  order: integer("order").default(0).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => ({
  albumIdx: index("album_media_album_idx").on(table.albumId),
  mediaIdx: index("album_media_media_idx").on(table.mediaId),
  orderIdx: index("album_media_order_idx").on(table.albumId, table.order),
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

export const insertAlbumMediaSchema = createInsertSchema(albumMedia).omit({ id: true, addedAt: true });
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
  
  // ENCRYPTED FIELD: Stores sensitive payment and billing details
  // {paymentMethodDetails: any, billingAddress: any, taxInfo: any, invoiceHistory: any[]}
  encryptedData: text("encrypted_data"),
  
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

/**
 * Agent Communications - A2A (Agent-to-Agent) Message Queue
 * Supports request/response, broadcasts, alerts, and escalations
 * Includes priority queue, expiration, and response tracking
 */
export const agentCommunications = pgTable("agent_communications", {
  id: serial("id").primaryKey(),
  fromAgent: varchar("from_agent", { length: 100 }).notNull(),
  toAgent: varchar("to_agent", { length: 100 }).notNull(),
  messageType: varchar("message_type", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  payload: jsonb("payload"),
  priority: varchar("priority", { length: 20 }).default('normal'),
  status: varchar("status", { length: 20 }).default('pending'),
  requiresResponse: boolean("requires_response").default(false),
  response: jsonb("response"),
  processedAt: timestamp("processed_at"),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => ({
  fromIdx: index("idx_agent_comms_from").on(table.fromAgent),
  toIdx: index("idx_agent_comms_to").on(table.toAgent),
  typeIdx: index("idx_agent_comms_type").on(table.messageType),
  statusIdx: index("idx_agent_comms_status").on(table.status),
  priorityIdx: index("idx_agent_comms_priority").on(table.priority),
}));

/**
 * Agent Collaborations - Multi-agent collaborative problem-solving
 * Tracks collaboration sessions with voting, confidence, and outcomes
 * Supports peer-to-peer and group collaborations
 */
export const agentCollaborations = pgTable("agent_collaborations", {
  id: serial("id").primaryKey(),
  requestingAgent: varchar("requesting_agent", { length: 100 }).notNull(),
  respondingAgent: varchar("responding_agent", { length: 100 }).notNull(),
  problem: text("problem").notNull(),
  solution: text("solution"),
  outcome: varchar("outcome", { length: 20 }),
  resolutionTime: integer("resolution_time"),
  confidence: real("confidence"),
  votesReceived: integer("votes_received").default(0),
  votesRequired: integer("votes_required").default(1),
  status: varchar("status", { length: 20 }).default('active'),
  metadata: jsonb("metadata"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at")
}, (table) => ({
  requestingIdx: index("idx_agent_collab_requesting").on(table.requestingAgent),
  respondingIdx: index("idx_agent_collab_responding").on(table.respondingAgent),
  statusIdx: index("idx_agent_collab_status").on(table.status),
  outcomeIdx: index("idx_agent_collab_outcome").on(table.outcome),
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

// Agent Performance Metrics - Track agent performance over time (Prometheus + BullMQ integration)
export const agentPerformanceMetrics = pgTable("agent_performance_metrics", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(), // e.g., 'AGENT_54', 'AGENT_11'
  agentName: varchar("agent_name", { length: 255 }), // e.g., 'Accessibility', 'UI Framework'
  agentDomain: varchar("agent_domain", { length: 100 }), // e.g., 'Platform', 'Foundation'
  
  // Task Performance Metrics
  tasksCompleted: integer("tasks_completed").default(0).notNull(),
  tasksInProgress: integer("tasks_in_progress").default(0).notNull(),
  tasksFailed: integer("tasks_failed").default(0).notNull(),
  totalTasks: integer("total_tasks").default(0).notNull(),
  
  // Duration Metrics (in seconds)
  avgTaskDuration: real("avg_task_duration").default(0), // average seconds per task
  minTaskDuration: real("min_task_duration"),
  maxTaskDuration: real("max_task_duration"),
  totalDuration: real("total_duration").default(0), // total time spent on tasks
  
  // Quality Metrics
  errorRate: real("error_rate").default(0), // percentage 0-1 (e.g., 0.02 = 2%)
  errorCount: integer("error_count").default(0),
  successRate: real("success_rate").default(1), // percentage 0-1 (e.g., 0.98 = 98%)
  
  // Cache Performance (for agents with caching)
  cacheHitRate: real("cache_hit_rate"), // percentage 0-1
  cacheHits: integer("cache_hits").default(0),
  cacheMisses: integer("cache_misses").default(0),
  
  // Workload Metrics
  workloadPercentage: real("workload_percentage").default(0), // 0-100
  queueDepth: integer("queue_depth").default(0), // number of tasks waiting
  concurrentTasks: integer("concurrent_tasks").default(0),
  maxConcurrentTasks: integer("max_concurrent_tasks").default(5),
  
  // Health Score (0-100, calculated from multiple metrics)
  healthScore: real("health_score").default(100),
  status: varchar("status", { length: 50 }).default("healthy"), // 'healthy' | 'degraded' | 'overloaded' | 'failing'
  
  // Timestamps
  lastActive: timestamp("last_active").defaultNow().notNull(),
  lastTaskCompleted: timestamp("last_task_completed"),
  lastError: timestamp("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  
  // Metadata
  metadata: jsonb("metadata"), // Additional metrics, tags, BullMQ job IDs, etc.
  
  // Time window for aggregation
  timeWindow: varchar("time_window", { length: 50 }).default("hour"), // 'minute' | 'hour' | 'day' | 'week'
  windowStart: timestamp("window_start").defaultNow().notNull(),
  windowEnd: timestamp("window_end")
}, (table) => ({
  agentIdIdx: index("idx_perf_agent_id").on(table.agentId),
  agentDomainIdx: index("idx_perf_domain").on(table.agentDomain),
  statusIdx: index("idx_perf_status").on(table.status),
  lastActiveIdx: index("idx_perf_last_active").on(table.lastActive),
  timeWindowIdx: index("idx_perf_time_window").on(table.timeWindow, table.windowStart),
  healthScoreIdx: index("idx_perf_health_score").on(table.healthScore),
  workloadIdx: index("idx_perf_workload").on(table.workloadPercentage)
}));

// Agent Performance Alerts - Alert tracking for performance issues
export const agentPerformanceAlerts = pgTable("agent_performance_alerts", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  agentName: varchar("agent_name", { length: 255 }),
  agentDomain: varchar("agent_domain", { length: 100 }),
  
  alertType: varchar("alert_type", { length: 100 }).notNull(), // 'high_error_rate' | 'high_workload' | 'slow_performance' | 'queue_backup' | 'low_cache_hit' | 'health_degraded'
  severity: varchar("severity", { length: 20 }).notNull(), // 'low' | 'medium' | 'high' | 'critical'
  
  message: text("message").notNull(),
  threshold: real("threshold"), // The threshold that was exceeded
  actualValue: real("actual_value"), // The actual value that triggered the alert
  
  status: varchar("status", { length: 20 }).default("active"), // 'active' | 'acknowledged' | 'resolved' | 'dismissed'
  acknowledgedBy: varchar("acknowledged_by", { length: 100 }),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
  
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => ({
  agentIdIdx: index("idx_alert_agent_id").on(table.agentId),
  typeIdx: index("idx_alert_type").on(table.alertType),
  severityIdx: index("idx_alert_severity").on(table.severity),
  statusIdx: index("idx_alert_status").on(table.status),
  createdAtIdx: index("idx_alert_created_at").on(table.createdAt)
}));

// ============================================================================
// KNOWLEDGE INFRASTRUCTURE ORCHESTRATION (TRACK 2 BATCH 10-12)
// ============================================================================

// Agent Change Broadcasts - System-wide change notifications
export const agentChangeBroadcasts = pgTable("agent_change_broadcasts", {
  id: serial("id").primaryKey(),
  changeId: varchar("change_id", { length: 100 }).notNull().unique(),
  changeType: varchar("change_type", { length: 100 }).notNull(), // 'code_update' | 'config_change' | 'schema_update' | 'pattern_learned' | 'feature_added'
  changeDescription: text("change_description").notNull(),
  changeDetails: jsonb("change_details"), // Full change payload
  
  // Source
  initiatedBy: varchar("initiated_by", { length: 100 }).notNull(), // agent ID or user ID
  sourceAgent: varchar("source_agent", { length: 100 }), // agent that made the change
  priority: varchar("priority", { length: 20 }).default("medium"), // 'critical' | 'high' | 'medium' | 'low'
  
  // Affected Agents
  affectedAgents: text("affected_agents").array().default(sql`ARRAY[]::text[]`), // List of agent IDs that need to know
  affectedDomains: text("affected_domains").array(), // e.g., ['platform', 'ui', 'backend']
  affectedTags: text("affected_tags").array(), // Additional filtering tags
  
  // Broadcasting
  broadcastStrategy: varchar("broadcast_strategy", { length: 50 }).default("immediate"), // 'immediate' | 'batched' | 'scheduled'
  batchSize: integer("batch_size").default(10), // For batched broadcasts
  batchDelay: integer("batch_delay").default(1000), // Milliseconds between batches
  
  // Status Tracking
  status: varchar("status", { length: 50 }).default("pending"), // 'pending' | 'broadcasting' | 'completed' | 'failed' | 'partial'
  totalAgents: integer("total_agents").default(0),
  acknowledgedCount: integer("acknowledged_count").default(0),
  failedCount: integer("failed_count").default(0),
  acknowledgedBy: text("acknowledged_by").array().default(sql`ARRAY[]::text[]`), // List of agent IDs that acknowledged
  failedAgents: text("failed_agents").array(), // List of agent IDs that failed to receive
  
  // Retry Mechanism
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  retryStrategy: varchar("retry_strategy", { length: 50 }).default("exponential"), // 'exponential' | 'linear' | 'fixed'
  nextRetryAt: timestamp("next_retry_at"),
  lastRetryAt: timestamp("last_retry_at"),
  
  // Propagation Metrics
  propagationStartedAt: timestamp("propagation_started_at"),
  propagationCompletedAt: timestamp("propagation_completed_at"),
  propagationDuration: integer("propagation_duration"), // milliseconds
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Optional expiry for time-sensitive changes
  
  metadata: jsonb("metadata")
}, (table) => ({
  changeIdIdx: index("idx_change_broadcasts_change_id").on(table.changeId),
  statusIdx: index("idx_change_broadcasts_status").on(table.status),
  priorityIdx: index("idx_change_broadcasts_priority").on(table.priority),
  createdAtIdx: index("idx_change_broadcasts_created_at").on(table.createdAt),
  nextRetryIdx: index("idx_change_broadcasts_next_retry").on(table.nextRetryAt),
  affectedAgentsIdx: index("idx_change_broadcasts_affected_agents").using("gin", table.affectedAgents),
  sourceAgentIdx: index("idx_change_broadcasts_source_agent").on(table.sourceAgent)
}));

// Agent Decisions - Multi-agent consensus and conflict resolution
export const agentDecisions = pgTable("agent_decisions", {
  id: serial("id").primaryKey(),
  decisionId: varchar("decision_id", { length: 100 }).notNull().unique(),
  decisionType: varchar("decision_type", { length: 100 }).notNull(), // 'feature_approval' | 'conflict_resolution' | 'priority_assignment' | 'resource_allocation'
  decisionContext: text("decision_context").notNull(),
  decisionQuestion: text("decision_question").notNull(),
  
  // Participants
  initiatedBy: varchar("initiated_by", { length: 100 }).notNull(),
  participatingAgents: text("participating_agents").array().notNull(), // List of agent IDs involved
  requiredConsensus: real("required_consensus").default(0.66), // 0-1, percentage of agreement needed (e.g., 0.66 = 66%)
  
  // Voting & Consensus
  votingMechanism: varchar("voting_mechanism", { length: 50 }).default("majority"), // 'unanimous' | 'majority' | 'weighted' | 'authority'
  votes: jsonb("votes"), // { "AGENT_54": { vote: "approve", weight: 1, reasoning: "...", timestamp: "..." }, ... }
  votesCast: integer("votes_cast").default(0),
  votesRequired: integer("votes_required"),
  
  // Conflict Resolution
  hasConflict: boolean("has_conflict").default(false),
  conflictResolutionStrategy: varchar("conflict_resolution_strategy", { length: 50 }), // 'vote' | 'priority' | 'authority' | 'human_escalation'
  conflictDetails: jsonb("conflict_details"),
  conflictingAgents: text("conflicting_agents").array(),
  
  // Priority Management
  priority: varchar("priority", { length: 20 }).default("medium"), // 'critical' | 'high' | 'medium' | 'low'
  deadline: timestamp("deadline"),
  isPrioritized: boolean("is_prioritized").default(false),
  priorityScore: real("priority_score"), // Calculated score for queue position
  
  // Strategic Alignment
  alignsWithStrategy: boolean("aligns_with_strategy"),
  strategicAlignment: jsonb("strategic_alignment"), // { category: "user_experience", score: 0.95, reasoning: "..." }
  alignmentScore: real("alignment_score"), // 0-1
  
  // Decision Outcome
  status: varchar("status", { length: 50 }).default("pending"), // 'pending' | 'voting' | 'decided' | 'implemented' | 'rejected' | 'escalated'
  decision: varchar("decision", { length: 50 }), // 'approve' | 'reject' | 'defer' | 'escalate'
  consensusReached: boolean("consensus_reached").default(false),
  consensusLevel: real("consensus_level"), // 0-1, actual percentage of agreement
  finalReasoning: text("final_reasoning"),
  
  // Escalation
  escalatedTo: varchar("escalated_to", { length: 100 }), // e.g., 'AGENT_ADMIN' or 'human'
  escalationReason: text("escalation_reason"),
  escalatedAt: timestamp("escalated_at"),
  
  // Implementation Tracking
  implementedAt: timestamp("implemented_at"),
  implementedBy: varchar("implemented_by", { length: 100 }),
  implementationNotes: text("implementation_notes"),
  
  // Audit Trail
  decisionLog: jsonb("decision_log"), // Array of timestamped events
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  decidedAt: timestamp("decided_at"),
  
  metadata: jsonb("metadata")
}, (table) => ({
  decisionIdIdx: index("idx_agent_decisions_decision_id").on(table.decisionId),
  statusIdx: index("idx_agent_decisions_status").on(table.status),
  priorityIdx: index("idx_agent_decisions_priority").on(table.priority),
  deadlineIdx: index("idx_agent_decisions_deadline").on(table.deadline),
  createdAtIdx: index("idx_agent_decisions_created_at").on(table.createdAt),
  participatingAgentsIdx: index("idx_agent_decisions_participants").using("gin", table.participatingAgents),
  initiatedByIdx: index("idx_agent_decisions_initiated_by").on(table.initiatedBy)
}));

// Intelligence Cycles - Automated 7-step learning cycles
export const intelligenceCycles = pgTable("intelligence_cycles", {
  id: serial("id").primaryKey(),
  cycleId: varchar("cycle_id", { length: 100 }).notNull().unique(),
  cycleName: varchar("cycle_name", { length: 255 }).notNull(),
  cycleType: varchar("cycle_type", { length: 100 }).default("standard"), // 'standard' | 'emergency' | 'scheduled' | 'triggered'
  cycleDescription: text("cycle_description"),
  
  // 7-Step Cycle: LEARN → TEST → ANALYZE → COLLABORATE → BUILD → TEST → REPORT
  currentStep: varchar("current_step", { length: 50 }).default("LEARN"), // Current step in cycle
  stepsCompleted: text("steps_completed").array().default(sql`ARRAY[]::text[]`), // List of completed steps
  stepsOrder: text("steps_order").array().default(sql`ARRAY['LEARN', 'TEST', 'ANALYZE', 'COLLABORATE', 'BUILD', 'TEST', 'REPORT']::text[]`),
  
  // Step Details & Metrics
  stepMetrics: jsonb("step_metrics"), // { "LEARN": { startedAt: "...", completedAt: "...", duration: 120, status: "completed", data: {...} }, ... }
  stepResults: jsonb("step_results"), // Results from each step
  stepErrors: jsonb("step_errors"), // Errors encountered in each step
  
  // Triggering & Scheduling
  triggerType: varchar("trigger_type", { length: 50 }).default("manual"), // 'manual' | 'scheduled' | 'event' | 'threshold'
  triggerSource: varchar("trigger_source", { length: 100 }), // What initiated this cycle
  schedule: varchar("schedule", { length: 100 }), // Cron expression for recurring cycles
  nextScheduledRun: timestamp("next_scheduled_run"),
  
  // Participating Agents
  leadAgent: varchar("lead_agent", { length: 100 }), // Agent orchestrating the cycle
  participatingAgents: text("participating_agents").array().default(sql`ARRAY[]::text[]`), // All agents involved
  agentRoles: jsonb("agent_roles"), // { "AGENT_54": "learner", "AGENT_11": "builder", ... }
  agentContributions: jsonb("agent_contributions"), // Track what each agent contributed
  
  // Status & Progress
  status: varchar("status", { length: 50 }).default("pending"), // 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
  progress: real("progress").default(0), // 0-100 percentage
  
  // Performance Metrics
  cycleStartedAt: timestamp("cycle_started_at"),
  cycleCompletedAt: timestamp("cycle_completed_at"),
  totalDuration: integer("total_duration"), // milliseconds
  avgStepDuration: integer("avg_step_duration"), // milliseconds
  
  // Quality Metrics
  successRate: real("success_rate"), // 0-1, based on step completions
  qualityScore: real("quality_score"), // 0-100, overall cycle quality
  issuesIdentified: integer("issues_identified").default(0),
  issuesResolved: integer("issues_resolved").default(0),
  patternsLearned: integer("patterns_learned").default(0),
  
  // Outputs & Deliverables
  learningOutputs: jsonb("learning_outputs"), // What was learned
  buildOutputs: jsonb("build_outputs"), // What was built
  reportGenerated: boolean("report_generated").default(false),
  reportUrl: text("report_url"),
  
  // Auto-triggering Configuration
  autoTriggerEnabled: boolean("auto_trigger_enabled").default(false),
  autoTriggerConditions: jsonb("auto_trigger_conditions"), // Conditions that trigger next cycle
  nextCycleId: varchar("next_cycle_id", { length: 100 }), // Link to next cycle if auto-triggered
  
  // Failure Handling
  failureReason: text("failure_reason"),
  failedAt: timestamp("failed_at"),
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(2),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  
  metadata: jsonb("metadata")
}, (table) => ({
  cycleIdIdx: index("idx_intelligence_cycles_cycle_id").on(table.cycleId),
  statusIdx: index("idx_intelligence_cycles_status").on(table.status),
  currentStepIdx: index("idx_intelligence_cycles_current_step").on(table.currentStep),
  cycleTypeIdx: index("idx_intelligence_cycles_type").on(table.cycleType),
  leadAgentIdx: index("idx_intelligence_cycles_lead_agent").on(table.leadAgent),
  createdAtIdx: index("idx_intelligence_cycles_created_at").on(table.createdAt),
  nextScheduledIdx: index("idx_intelligence_cycles_next_scheduled").on(table.nextScheduledRun),
  participatingAgentsIdx: index("idx_intelligence_cycles_participants").using("gin", table.participatingAgents)
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

// Agent Self Tests
export const insertAgentSelfTestSchema = createInsertSchema(agentSelfTests).omit({ id: true, createdAt: true });
export type InsertAgentSelfTest = z.infer<typeof insertAgentSelfTestSchema>;
export type SelectAgentSelfTest = typeof agentSelfTests.$inferSelect;

// Agent Performance Metrics
export const insertAgentPerformanceMetricsSchema = createInsertSchema(agentPerformanceMetrics).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  lastActive: true 
});
export type InsertAgentPerformanceMetrics = z.infer<typeof insertAgentPerformanceMetricsSchema>;
export type SelectAgentPerformanceMetrics = typeof agentPerformanceMetrics.$inferSelect;

// Agent Performance Alerts
export const insertAgentPerformanceAlertsSchema = createInsertSchema(agentPerformanceAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type InsertAgentPerformanceAlert = z.infer<typeof insertAgentPerformanceAlertsSchema>;
export type SelectAgentPerformanceAlert = typeof agentPerformanceAlerts.$inferSelect;



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

// ============================================================================
// CONTENT MODERATION SYSTEM
// ============================================================================

// Moderation Queue (unified queue for all content types)
export const moderationQueue = pgTable("moderation_queue", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type", { length: 50 }).notNull(), // 'post' | 'comment' | 'message' | 'user' | 'event' | 'housing'
  contentId: integer("content_id").notNull(),
  userId: integer("user_id").references(() => users.id), // Content owner
  
  status: varchar("status", { length: 20 }).default("pending"), // 'pending' | 'reviewing' | 'approved' | 'removed' | 'escalated' | 'banned'
  priority: integer("priority").default(3), // 1=highest, 5=lowest
  
  reportReason: varchar("report_reason", { length: 100 }), // 'spam' | 'harassment' | 'inappropriate' | 'hate_speech' | 'violence' | 'misinformation'
  reportDetails: text("report_details"),
  reportedBy: integer("reported_by").references(() => users.id),
  
  // Legacy fields (backwards compatibility)
  reason: varchar("reason", { length: 100 }), 
  description: text("description"),
  
  autoFlagged: boolean("auto_flagged").default(false),
  autoFlagReason: varchar("auto_flag_reason", { length: 100 }),
  
  moderatorId: integer("moderator_id").references(() => users.id),
  moderatedBy: integer("moderated_by").references(() => users.id), // Legacy field
  moderatorNotes: text("moderator_notes"),
  actionTaken: varchar("action_taken", { length: 50 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  moderatedAt: timestamp("moderated_at"), // Legacy field
}, (table) => ({
  contentTypeIdx: index("idx_moderation_queue_content_type").on(table.contentType),
  statusIdx: index("idx_moderation_queue_status").on(table.status),
  priorityIdx: index("idx_moderation_queue_priority").on(table.priority),
  createdAtIdx: index("idx_moderation_queue_created_at").on(table.createdAt),
  compositeIdx: index("idx_moderation_queue_composite").on(table.status, table.priority, table.createdAt),
  userIdx: index("idx_moderation_queue_user").on(table.userId),
  autoFlaggedIdx: index("idx_moderation_queue_auto_flagged").on(table.autoFlagged),
}));

// Moderation Actions (audit log of all moderation actions)
export const moderationActions = pgTable("moderation_actions", {
  id: serial("id").primaryKey(),
  moderatorId: integer("moderator_id").references(() => users.id).notNull(),
  
  actionType: varchar("action_type", { length: 50 }).notNull(), // 'approve' | 'remove' | 'ban_user' | 'warn' | 'edit'
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: integer("target_id").notNull(),
  
  // Legacy fields (backwards compatibility)
  queueId: integer("queue_id").references(() => moderationQueue.id),
  action: varchar("action", { length: 50 }),
  
  reason: text("reason"),
  duration: integer("duration"), // For bans (in days)
  reversible: boolean("reversible").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  queueIdx: index("idx_moderation_actions_queue").on(table.queueId),
  moderatorIdx: index("idx_moderation_actions_moderator").on(table.moderatorId),
  actionIdx: index("idx_moderation_actions_action").on(table.action),
  actionTypeIdx: index("idx_moderation_actions_action_type").on(table.actionType),
  targetTypeIdx: index("idx_moderation_actions_target_type").on(table.targetType),
  createdAtIdx: index("idx_moderation_actions_created_at").on(table.createdAt),
}));

// Flagged Content (auto-flagging system)
export const flaggedContent = pgTable("flagged_content", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  contentId: integer("content_id").notNull(),
  
  flagType: varchar("flag_type", { length: 50 }).notNull(), // 'spam' | 'harassment' | 'hate_speech' | 'violence' | 'misinformation' | 'profanity'
  severity: integer("severity").notNull(), // 1-10
  confidence: integer("confidence"), // 0-100 for auto-flags
  
  detectionMethod: varchar("detection_method", { length: 50 }), // 'manual' | 'keyword' | 'ai' | 'pattern'
  
  // Legacy fields (backwards compatibility)
  flagReason: varchar("flag_reason", { length: 50 }),
  autoFlagged: boolean("auto_flagged").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  contentTypeIdx: index("idx_flagged_content_type").on(table.contentType),
  flagTypeIdx: index("idx_flagged_content_flag_type").on(table.flagType),
  flagReasonIdx: index("idx_flagged_content_reason").on(table.flagReason),
  severityIdx: index("idx_flagged_content_severity").on(table.severity),
  createdAtIdx: index("idx_flagged_content_created_at").on(table.createdAt),
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

// ============================================================================
// SPECIALIZED PROFILE TABLES - 17 PROFESSIONAL PROFILE TYPES
// ============================================================================

// 1. Teacher Profiles
export const teacherProfiles = pgTable("teacher_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Bio & Experience
  bio: text("bio"),
  yearsExperience: integer("years_experience"),
  teachingSince: integer("teaching_since"),
  
  // Teaching Styles & Specialties
  teachingStyles: text("teaching_styles").array(), // 'salon', 'nuevo', 'milonguero', etc.
  specialties: text("specialties").array(), // 'beginners', 'advanced', 'technique', 'musicality'
  levels: text("levels").array(), // 'beginner', 'intermediate', 'advanced'
  
  // Certifications
  certifications: text("certifications").array(),
  certificationDetails: jsonb("certification_details").$type<Array<{
    name: string;
    issuer: string;
    year: number;
    certificate_url?: string;
  }>>(),
  
  // Pricing & Availability
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  privateClassRate: numeric("private_class_rate", { precision: 10, scale: 2 }),
  groupClassRate: numeric("group_class_rate", { precision: 10, scale: 2 }),
  availability: jsonb("availability").$type<{
    weekdays?: string[];
    timeSlots?: string[];
    locations?: string[];
  }>(),
  
  // Media
  photoUrls: text("photo_urls").array(),
  videoUrls: text("video_urls").array(),
  portfolioUrl: text("portfolio_url"),
  
  // Teaching Info
  languagesSpoken: text("languages_spoken").array(),
  teachingLocations: text("teaching_locations").array(), // cities/venues
  onlineTeaching: boolean("online_teaching").default(false),
  travelForTeaching: boolean("travel_for_teaching").default(false),
  
  // Stats
  totalStudents: integer("total_students").default(0),
  activeStudents: integer("active_students").default(0),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("teacher_profiles_user_idx").on(table.userId),
  activeIdx: index("teacher_profiles_active_idx").on(table.isActive),
  ratingIdx: index("teacher_profiles_rating_idx").on(table.averageRating),
}));

// 2. DJ Profiles
export const djProfiles = pgTable("dj_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Bio & Experience
  bio: text("bio"),
  djName: varchar("dj_name", { length: 255 }),
  yearsExperience: integer("years_experience"),
  startedYear: integer("started_year"),
  
  // Music Styles
  musicStyles: text("music_styles").array(), // 'traditional', 'alternative', 'neo', 'vals', 'milonga'
  specialties: text("specialties").array(),
  eras: text("eras").array(), // 'golden age', 'contemporary', 'mixed'
  
  // Equipment
  equipment: jsonb("equipment").$type<{
    mixer?: string;
    speakers?: string;
    software?: string[];
    other?: string[];
  }>(),
  hasOwnEquipment: boolean("has_own_equipment").default(false),
  
  // Experience
  setsPerformed: integer("sets_performed").default(0),
  eventsWorked: integer("events_worked").default(0),
  venuesPlayed: text("venues_played").array(),
  
  // Portfolio
  portfolioLinks: text("portfolio_links").array(),
  soundcloudUrl: text("soundcloud_url"),
  spotifyUrl: text("spotify_url"),
  youtubeUrl: text("youtube_url"),
  mixcloudUrl: text("mixcloud_url"),
  
  // Pricing
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }),
  eventRate: numeric("event_rate", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Availability
  availability: jsonb("availability"),
  travelRadius: integer("travel_radius"), // miles/km
  willingToTravel: boolean("willing_to_travel").default(false),
  
  // Media
  photoUrls: text("photo_urls").array(),
  videoUrls: text("video_urls").array(),
  
  // Stats
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("dj_profiles_user_idx").on(table.userId),
  activeIdx: index("dj_profiles_active_idx").on(table.isActive),
  ratingIdx: index("dj_profiles_rating_idx").on(table.averageRating),
}));

// 3. Photographer Profiles
export const photographerProfiles = pgTable("photographer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Bio
  bio: text("bio"),
  businessName: varchar("business_name", { length: 255 }),
  yearsExperience: integer("years_experience"),
  
  // Specialties
  specialties: text("specialties").array(), // 'event', 'portrait', 'performance', 'social'
  photographyStyle: text("photography_style").array(), // 'candid', 'artistic', 'documentary'
  
  // Equipment
  equipment: jsonb("equipment").$type<{
    cameras?: string[];
    lenses?: string[];
    lighting?: string[];
    other?: string[];
  }>(),
  
  // Portfolio
  portfolioUrl: text("portfolio_url"),
  instagramUrl: text("instagram_url"),
  websiteUrl: text("website_url"),
  photoUrls: text("photo_urls").array(),
  
  // Packages & Pricing
  packages: jsonb("packages").$type<Array<{
    name: string;
    description: string;
    price: number;
    duration?: string;
    deliverables?: string[];
  }>>(),
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }),
  eventRate: numeric("event_rate", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Services
  servicesOffered: text("services_offered").array(), // 'photo', 'video', 'editing', 'prints'
  deliveryTime: varchar("delivery_time", { length: 100 }), // '2 weeks', '1 month'
  
  // Coverage
  coverageAreas: text("coverage_areas").array(),
  willingToTravel: boolean("willing_to_travel").default(false),
  travelFee: numeric("travel_fee", { precision: 10, scale: 2 }),
  
  // Stats
  eventsPhotographed: integer("events_photographed").default(0),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("photographer_profiles_user_idx").on(table.userId),
  activeIdx: index("photographer_profiles_active_idx").on(table.isActive),
  ratingIdx: index("photographer_profiles_rating_idx").on(table.averageRating),
}));

// 4. Performer Profiles
export const performerProfiles = pgTable("performer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Bio
  bio: text("bio"),
  stageName: varchar("stage_name", { length: 255 }),
  yearsPerforming: integer("years_performing"),
  
  // Performance Types
  performanceTypes: text("performance_types").array(), // 'solo', 'couple', 'group', 'show'
  styles: text("styles").array(), // 'stage tango', 'fantasia', 'traditional'
  
  // Experience
  performanceCount: integer("performance_count").default(0),
  venuesPerformed: text("venues_performed").array(),
  notablePerformances: jsonb("notable_performances").$type<Array<{
    event: string;
    venue: string;
    date: string;
    description?: string;
  }>>(),
  
  // Repertoire
  repertoire: text("repertoire").array(),
  choreographies: text("choreographies").array(),
  
  // Media
  demoVideoUrls: text("demo_video_urls").array(),
  photoUrls: text("photo_urls").array(),
  portfolioUrl: text("portfolio_url"),
  youtubeUrl: text("youtube_url"),
  instagramUrl: text("instagram_url"),
  
  // Availability
  availability: jsonb("availability"),
  requiresPartner: boolean("requires_partner").default(false),
  partnerName: varchar("partner_name", { length: 255 }),
  
  // Pricing
  performanceFee: numeric("performance_fee", { precision: 10, scale: 2 }),
  rehearsalFee: numeric("rehearsal_fee", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Technical Requirements
  technicalRequirements: text("technical_requirements"),
  musicRequirements: text("music_requirements"),
  
  // Stats
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("performer_profiles_user_idx").on(table.userId),
  activeIdx: index("performer_profiles_active_idx").on(table.isActive),
  ratingIdx: index("performer_profiles_rating_idx").on(table.averageRating),
}));

// 5. Vendor Profiles
export const vendorProfiles = pgTable("vendor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Business Info
  businessName: varchar("business_name", { length: 255 }).notNull(),
  bio: text("bio"),
  yearsInBusiness: integer("years_in_business"),
  
  // Products & Services
  productCategories: text("product_categories").array(), // 'shoes', 'clothing', 'accessories', 'music'
  servicesOffered: text("services_offered").array(),
  
  // Catalog
  products: jsonb("products").$type<Array<{
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    inStock?: boolean;
  }>>(),
  
  // Pricing
  priceRange: varchar("price_range", { length: 50 }), // '$', '$$', '$$$'
  currency: varchar("currency", { length: 3 }).default("USD"),
  acceptsCustomOrders: boolean("accepts_custom_orders").default(false),
  
  // Delivery
  deliveryAreas: text("delivery_areas").array(),
  shippingOptions: text("shipping_options").array(), // 'local pickup', 'domestic', 'international'
  shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 }),
  
  // Store Info
  websiteUrl: text("website_url"),
  shopUrl: text("shop_url"),
  phoneNumber: varchar("phone_number", { length: 50 }),
  email: varchar("email", { length: 255 }),
  
  // Social & Media
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  photoUrls: text("photo_urls").array(),
  
  // Location
  hasPhysicalStore: boolean("has_physical_store").default(false),
  storeAddress: text("store_address"),
  storeHours: jsonb("store_hours"),
  
  // Stats
  totalSales: integer("total_sales").default(0),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("vendor_profiles_user_idx").on(table.userId),
  activeIdx: index("vendor_profiles_active_idx").on(table.isActive),
  ratingIdx: index("vendor_profiles_rating_idx").on(table.averageRating),
}));

// 6. Musician Profiles
export const musicianProfiles = pgTable("musician_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Bio
  bio: text("bio"),
  artistName: varchar("artist_name", { length: 255 }),
  yearsExperience: integer("years_experience"),
  
  // Musical Info
  instruments: text("instruments").array(), // 'bandoneon', 'violin', 'piano', 'guitar'
  genres: text("genres").array(), // 'tango', 'milonga', 'vals', 'folklore'
  musicalStyles: text("musical_styles").array(), // 'traditional', 'nuevo', 'electrotango'
  
  // Performance History
  performanceHistory: jsonb("performance_history").$type<Array<{
    venue: string;
    date: string;
    role: string;
    description?: string;
  }>>(),
  orchestrasPlayed: text("orchestras_played").array(),
  
  // Recordings & Media
  audioSamples: text("audio_samples").array(),
  videoUrls: text("video_urls").array(),
  spotifyUrl: text("spotify_url"),
  soundcloudUrl: text("soundcloud_url"),
  youtubeUrl: text("youtube_url"),
  
  // Portfolio
  albums: jsonb("albums").$type<Array<{
    title: string;
    year: number;
    role: string;
    url?: string;
  }>>(),
  compositions: text("compositions").array(),
  
  // Availability
  availableForHire: boolean("available_for_hire").default(false),
  availability: jsonb("availability"),
  
  // Pricing
  performanceFee: numeric("performance_fee", { precision: 10, scale: 2 }),
  sessionFee: numeric("session_fee", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Stats
  performanceCount: integer("performance_count").default(0),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("musician_profiles_user_idx").on(table.userId),
  activeIdx: index("musician_profiles_active_idx").on(table.isActive),
  ratingIdx: index("musician_profiles_rating_idx").on(table.averageRating),
}));

// 7. Choreographer Profiles
export const choreographerProfiles = pgTable("choreographer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Bio
  bio: text("bio"),
  yearsExperience: integer("years_experience"),
  
  // Style Specialties
  styleSpecialties: text("style_specialties").array(), // 'stage', 'salon', 'nuevo', 'theatrical'
  
  // Works Created
  worksCreated: jsonb("works_created").$type<Array<{
    title: string;
    year: number;
    duration: string;
    description: string;
    performers?: string;
    videoUrl?: string;
  }>>(),
  choreographyCount: integer("choreography_count").default(0),
  
  // Teaching
  teachingAvailable: boolean("teaching_available").default(false),
  workshopsOffered: text("workshops_offered").array(),
  
  // Portfolio
  portfolioUrl: text("portfolio_url"),
  videoUrls: text("video_urls").array(),
  photoUrls: text("photo_urls").array(),
  youtubeUrl: text("youtube_url"),
  instagramUrl: text("instagram_url"),
  
  // Collaborations
  notableCollaborations: text("notable_collaborations").array(),
  companies: text("companies").array(), // Companies worked with
  
  // Services
  servicesOffered: text("services_offered").array(), // 'custom choreography', 'show creation', 'workshops'
  
  // Pricing
  choreographyFee: numeric("choreography_fee", { precision: 10, scale: 2 }),
  workshopFee: numeric("workshop_fee", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Availability
  availability: jsonb("availability"),
  willingToTravel: boolean("willing_to_travel").default(false),
  
  // Stats
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("choreographer_profiles_user_idx").on(table.userId),
  activeIdx: index("choreographer_profiles_active_idx").on(table.isActive),
  ratingIdx: index("choreographer_profiles_rating_idx").on(table.averageRating),
}));

// 8. Tango School Profiles
export const tangoSchoolProfiles = pgTable("tango_school_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // School Info
  schoolName: varchar("school_name", { length: 255 }).notNull(),
  bio: text("bio"),
  founded: integer("founded"),
  
  // Classes Offered
  classTypes: text("class_types").array(), // 'group', 'private', 'workshops', 'intensive'
  levels: text("levels").array(), // 'beginner', 'intermediate', 'advanced'
  styles: text("styles").array(), // 'salon', 'milonguero', 'nuevo'
  
  // Schedule
  schedule: jsonb("schedule").$type<Array<{
    day: string;
    time: string;
    level: string;
    teacher: string;
  }>>(),
  
  // Instructors
  instructors: jsonb("instructors").$type<Array<{
    name: string;
    bio?: string;
    photo?: string;
    specialties?: string[];
  }>>(),
  instructorCount: integer("instructor_count").default(0),
  
  // Facilities
  facilities: jsonb("facilities").$type<{
    floorType?: string;
    floorSize?: string;
    capacity?: number;
    amenities?: string[];
    accessibility?: string[];
  }>(),
  address: text("address"),
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  
  // Pricing
  priceRange: varchar("price_range", { length: 50 }),
  packages: jsonb("packages").$type<Array<{
    name: string;
    description: string;
    price: number;
    duration: string;
    classCount?: number;
  }>>(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Contact
  phoneNumber: varchar("phone_number", { length: 50 }),
  email: varchar("email", { length: 255 }),
  websiteUrl: text("website_url"),
  
  // Media
  photoUrls: text("photo_urls").array(),
  videoUrls: text("video_urls").array(),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  
  // Stats
  studentCount: integer("student_count").default(0),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("tango_school_profiles_user_idx").on(table.userId),
  activeIdx: index("tango_school_profiles_active_idx").on(table.isActive),
  cityIdx: index("tango_school_profiles_city_idx").on(table.city),
  ratingIdx: index("tango_school_profiles_rating_idx").on(table.averageRating),
}));

// 9. Tango Hotel Profiles
export const tangoHotelProfiles = pgTable("tango_hotel_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Hotel Info
  hotelName: varchar("hotel_name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }), // 'hotel', 'hostel', 'apartment', 'guesthouse'
  starRating: integer("star_rating"), // 1-5
  
  // Location
  address: text("address"),
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  neighborhood: varchar("neighborhood", { length: 255 }),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  
  // Rooms
  rooms: jsonb("rooms").$type<Array<{
    type: string;
    capacity: number;
    price: number;
    amenities: string[];
    photos?: string[];
  }>>(),
  totalRooms: integer("total_rooms"),
  
  // Amenities
  amenities: text("amenities").array(), // 'wifi', 'breakfast', 'pool', 'gym', 'parking'
  tangoAmenities: text("tango_amenities").array(), // 'practice space', 'dance floor', 'sound system'
  
  // Tango Events
  hostsEvents: boolean("hosts_events").default(false),
  eventsHosted: jsonb("events_hosted").$type<Array<{
    name: string;
    frequency: string;
    description?: string;
  }>>(),
  hasDanceFloor: boolean("has_dance_floor").default(false),
  
  // Pricing
  priceRange: varchar("price_range", { length: 50 }), // '$', '$$', '$$$'
  lowestRate: numeric("lowest_rate", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Tango-Specific Features
  proximityToMilongas: text("proximity_to_milongas"),
  tangoPackages: jsonb("tango_packages").$type<Array<{
    name: string;
    description: string;
    price: number;
    includes: string[];
  }>>(),
  
  // Contact & Booking
  phoneNumber: varchar("phone_number", { length: 50 }),
  email: varchar("email", { length: 255 }),
  websiteUrl: text("website_url"),
  bookingUrl: text("booking_url"),
  
  // Media
  photoUrls: text("photo_urls").array(),
  videoUrls: text("video_urls").array(),
  instagramUrl: text("instagram_url"),
  
  // Stats
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("tango_hotel_profiles_user_idx").on(table.userId),
  activeIdx: index("tango_hotel_profiles_active_idx").on(table.isActive),
  cityIdx: index("tango_hotel_profiles_city_idx").on(table.city),
  ratingIdx: index("tango_hotel_profiles_rating_idx").on(table.averageRating),
}));

// 10. Wellness Profiles
export const wellnessProfiles = pgTable("wellness_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Professional Info
  bio: text("bio"),
  professionalTitle: varchar("professional_title", { length: 255 }),
  yearsExperience: integer("years_experience"),
  
  // Services
  servicesOffered: text("services_offered").array(), // 'massage', 'physical therapy', 'yoga', 'pilates'
  specialties: text("specialties").array(), // 'sports injury', 'dancer wellness', 'injury prevention'
  
  // Certifications
  certifications: text("certifications").array(),
  certificationDetails: jsonb("certification_details").$type<Array<{
    name: string;
    issuer: string;
    year: number;
    certificateUrl?: string;
  }>>(),
  licenses: text("licenses").array(),
  
  // Pricing
  sessionRate: numeric("session_rate", { precision: 10, scale: 2 }),
  packageRates: jsonb("package_rates").$type<Array<{
    name: string;
    sessions: number;
    price: number;
    description?: string;
  }>>(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Practice Info
  practiceName: varchar("practice_name", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  
  // Availability
  availability: jsonb("availability"),
  acceptsInsurance: boolean("accepts_insurance").default(false),
  insuranceProviders: text("insurance_providers").array(),
  
  // Virtual Services
  offersVirtualSessions: boolean("offers_virtual_sessions").default(false),
  virtualPlatforms: text("virtual_platforms").array(),
  
  // Contact
  phoneNumber: varchar("phone_number", { length: 50 }),
  email: varchar("email", { length: 255 }),
  websiteUrl: text("website_url"),
  
  // Media
  photoUrls: text("photo_urls").array(),
  videoUrls: text("video_urls").array(),
  
  // Stats
  totalClients: integer("total_clients").default(0),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("wellness_profiles_user_idx").on(table.userId),
  activeIdx: index("wellness_profiles_active_idx").on(table.isActive),
  cityIdx: index("wellness_profiles_city_idx").on(table.city),
  ratingIdx: index("wellness_profiles_rating_idx").on(table.averageRating),
}));

// 11. Tour Operator Profiles
export const tourOperatorProfiles = pgTable("tour_operator_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Business Info
  companyName: varchar("company_name", { length: 255 }).notNull(),
  bio: text("bio"),
  yearsInBusiness: integer("years_in_business"),
  
  // Destinations
  destinations: text("destinations").array(), // Cities/countries covered
  primaryDestinations: text("primary_destinations").array(),
  
  // Packages
  packages: jsonb("packages").$type<Array<{
    name: string;
    description: string;
    duration: string;
    destination: string;
    price: number;
    included: string[];
    groupSize: {
      min: number;
      max: number;
    };
    dates?: string[];
  }>>(),
  
  // Tour Types
  tourTypes: text("tour_types").array(), // 'group', 'private', 'custom', 'festival'
  tangoFocus: boolean("tango_focus").default(true),
  
  // Group Sizes
  minGroupSize: integer("min_group_size"),
  maxGroupSize: integer("max_group_size"),
  
  // Pricing
  priceRange: varchar("price_range", { length: 50 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Services Included
  servicesIncluded: text("services_included").array(), // 'accommodation', 'transport', 'classes', 'milongas'
  
  // Languages
  languagesOffered: text("languages_offered").array(),
  
  // Contact
  phoneNumber: varchar("phone_number", { length: 50 }),
  email: varchar("email", { length: 255 }),
  websiteUrl: text("website_url"),
  
  // Media
  photoUrls: text("photo_urls").array(),
  videoUrls: text("video_urls").array(),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  
  // Stats
  toursCompleted: integer("tours_completed").default(0),
  totalParticipants: integer("total_participants").default(0),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Licenses & Certifications
  licenses: text("licenses").array(),
  certifications: text("certifications").array(),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("tour_operator_profiles_user_idx").on(table.userId),
  activeIdx: index("tour_operator_profiles_active_idx").on(table.isActive),
  ratingIdx: index("tour_operator_profiles_rating_idx").on(table.averageRating),
}));

// 12. Host Venue Profiles
export const hostVenueProfiles = pgTable("host_venue_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Venue Info
  venueName: varchar("venue_name", { length: 255 }).notNull(),
  description: text("description"),
  venueType: varchar("venue_type", { length: 100 }), // 'studio', 'ballroom', 'cultural center', 'restaurant'
  
  // Location
  address: text("address"),
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  neighborhood: varchar("neighborhood", { length: 255 }),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  
  // Capacity
  capacity: integer("capacity"),
  standingCapacity: integer("standing_capacity"),
  seatedCapacity: integer("seated_capacity"),
  
  // Facilities
  floorType: varchar("floor_type", { length: 100 }), // 'wood', 'parquet', 'vinyl'
  floorSize: varchar("floor_size", { length: 100 }), // '500 sq ft', etc.
  facilities: text("facilities").array(), // 'sound system', 'stage', 'lighting', 'climate control'
  amenities: text("amenities").array(), // 'parking', 'wheelchair access', 'wifi', 'bar'
  
  // Availability
  availabilityCalendar: jsonb("availability_calendar"), // Complex availability data
  minimumBookingHours: integer("minimum_booking_hours"),
  advanceBookingDays: integer("advance_booking_days"), // How far in advance required
  
  // Pricing
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }),
  dailyRate: numeric("daily_rate", { precision: 10, scale: 2 }),
  depositRequired: boolean("deposit_required").default(false),
  depositAmount: numeric("deposit_amount", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Event Types Accepted
  eventTypesAccepted: text("event_types_accepted").array(), // 'milonga', 'class', 'workshop', 'performance'
  
  // Technical Specs
  soundSystem: jsonb("sound_system").$type<{
    available: boolean;
    specs?: string;
    included?: boolean;
  }>(),
  lightingSystem: jsonb("lighting_system"),
  
  // Catering
  cateringAvailable: boolean("catering_available").default(false),
  alcoholAllowed: boolean("alcohol_allowed").default(false),
  externalCateringAllowed: boolean("external_catering_allowed").default(false),
  
  // Contact
  phoneNumber: varchar("phone_number", { length: 50 }),
  email: varchar("email", { length: 255 }),
  websiteUrl: text("website_url"),
  
  // Media
  photoUrls: text("photo_urls").array(),
  videoUrls: text("video_urls").array(),
  virtualTourUrl: text("virtual_tour_url"),
  
  // Stats
  eventsHosted: integer("events_hosted").default(0),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("host_venue_profiles_user_idx").on(table.userId),
  activeIdx: index("host_venue_profiles_active_idx").on(table.isActive),
  cityIdx: index("host_venue_profiles_city_idx").on(table.city),
  ratingIdx: index("host_venue_profiles_rating_idx").on(table.averageRating),
  capacityIdx: index("host_venue_profiles_capacity_idx").on(table.capacity),
}));

// 13. Tango Guide Profiles
export const tangoGuideProfiles = pgTable("tango_guide_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Guide Info
  bio: text("bio"),
  yearsExperience: integer("years_experience"),
  
  // Coverage
  citiesCovered: text("cities_covered").array(),
  primaryCity: varchar("primary_city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  
  // Languages
  languagesSpoken: text("languages_spoken").array(),
  
  // Services
  servicesOffered: text("services_offered").array(), // 'city tours', 'milonga tours', 'shopping', 'cultural'
  tourTypes: text("tour_types").array(), // 'walking', 'driving', 'evening', 'multi-day'
  
  // Expertise
  specialKnowledge: text("special_knowledge").array(), // 'tango history', 'venues', 'local culture'
  neighborhoods: text("neighborhoods").array(), // Neighborhoods covered
  
  // Tango-Specific
  milongaKnowledge: boolean("milonga_knowledge").default(true),
  venueConnections: boolean("venue_connections").default(false), // Has connections to get in
  canArrangeClasses: boolean("can_arrange_classes").default(false),
  canArrangeShows: boolean("can_arrange_shows").default(false),
  
  // Pricing
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }),
  halfDayRate: numeric("half_day_rate", { precision: 10, scale: 2 }),
  fullDayRate: numeric("full_day_rate", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Packages
  packages: jsonb("packages").$type<Array<{
    name: string;
    description: string;
    duration: string;
    price: number;
    includes: string[];
  }>>(),
  
  // Availability
  availability: jsonb("availability"),
  minimumHours: integer("minimum_hours"),
  advanceNotice: integer("advance_notice"), // Days of advance notice required
  
  // Transportation
  hasVehicle: boolean("has_vehicle").default(false),
  vehicleType: varchar("vehicle_type", { length: 100 }),
  transportIncluded: boolean("transport_included").default(false),
  
  // Contact
  phoneNumber: varchar("phone_number", { length: 50 }),
  email: varchar("email", { length: 255 }),
  websiteUrl: text("website_url"),
  
  // Media
  photoUrls: text("photo_urls").array(),
  videoUrls: text("video_urls").array(),
  
  // Stats
  toursCompleted: integer("tours_completed").default(0),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Certifications
  tourismLicense: varchar("tourism_license", { length: 255 }),
  certifications: text("certifications").array(),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("tango_guide_profiles_user_idx").on(table.userId),
  activeIdx: index("tango_guide_profiles_active_idx").on(table.isActive),
  cityIdx: index("tango_guide_profiles_city_idx").on(table.primaryCity),
  ratingIdx: index("tango_guide_profiles_rating_idx").on(table.averageRating),
}));

// 14. Content Creator Profiles
export const contentCreatorProfiles = pgTable("content_creator_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Creator Info
  bio: text("bio"),
  creatorName: varchar("creator_name", { length: 255 }),
  yearsCreating: integer("years_creating"),
  
  // Content Types
  contentTypes: text("content_types").array(), // 'video', 'blog', 'podcast', 'photography', 'social media'
  formats: text("formats").array(), // 'tutorials', 'vlogs', 'reviews', 'documentaries'
  
  // Platforms
  platforms: jsonb("platforms").$type<Array<{
    name: string;
    handle: string;
    url: string;
    followers?: number;
  }>>(),
  
  // Portfolio
  portfolioUrl: text("portfolio_url"),
  featuredWork: jsonb("featured_work").$type<Array<{
    title: string;
    url: string;
    type: string;
    description?: string;
    thumbnail?: string;
  }>>(),
  
  // Social Media
  youtubeUrl: text("youtube_url"),
  instagramUrl: text("instagram_url"),
  tiktokUrl: text("tiktok_url"),
  blogUrl: text("blog_url"),
  podcastUrl: text("podcast_url"),
  
  // Audience
  totalFollowers: integer("total_followers").default(0),
  averageViews: integer("average_views"),
  engagementRate: real("engagement_rate"),
  
  // Collaboration
  openToCollaboration: boolean("open_to_collaboration").default(true),
  collaborationTypes: text("collaboration_types").array(), // 'sponsorship', 'guest post', 'interview', 'review'
  
  // Pricing
  collaborationRates: jsonb("collaboration_rates").$type<Array<{
    type: string;
    price: number;
    description: string;
  }>>(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Media Kit
  mediaKitUrl: text("media_kit_url"),
  
  // Contact
  businessEmail: varchar("business_email", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 50 }),
  
  // Stats
  totalContent: integer("total_content").default(0),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("content_creator_profiles_user_idx").on(table.userId),
  activeIdx: index("content_creator_profiles_active_idx").on(table.isActive),
  followersIdx: index("content_creator_profiles_followers_idx").on(table.totalFollowers),
  ratingIdx: index("content_creator_profiles_rating_idx").on(table.averageRating),
}));

// 15. Learning Resource Profiles
export const learningResourceProfiles = pgTable("learning_resource_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Resource Info
  resourceName: varchar("resource_name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Course Types
  courseTypes: text("course_types").array(), // 'online course', 'video series', 'ebook', 'tutorial'
  levels: text("levels").array(), // 'beginner', 'intermediate', 'advanced'
  formats: text("formats").array(), // 'video', 'text', 'audio', 'interactive'
  
  // Courses/Resources
  resources: jsonb("resources").$type<Array<{
    title: string;
    description: string;
    type: string;
    level: string;
    price: number;
    duration?: string;
    lessons?: number;
    url?: string;
    thumbnail?: string;
  }>>(),
  
  // Pricing
  priceRange: varchar("price_range", { length: 50 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  offersFreeTrial: boolean("offers_free_trial").default(false),
  freeResourcesAvailable: boolean("free_resources_available").default(false),
  
  // Platform
  platformUrl: text("platform_url"),
  platformType: varchar("platform_type", { length: 100 }), // 'udemy', 'teachable', 'custom', 'youtube'
  
  // Content Details
  totalLessons: integer("total_lessons").default(0),
  totalHours: integer("total_hours"),
  languagesAvailable: text("languages_available").array(),
  
  // Features
  features: text("features").array(), // 'certificates', 'lifetime access', 'community', 'support'
  includesCertificate: boolean("includes_certificate").default(false),
  
  // Preview
  previewVideoUrl: text("preview_video_url"),
  sampleLessons: text("sample_lessons").array(),
  
  // Media
  photoUrls: text("photo_urls").array(),
  videoUrls: text("video_urls").array(),
  
  // Stats
  totalStudents: integer("total_students").default(0),
  completionRate: real("completion_rate"),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Contact
  email: varchar("email", { length: 255 }),
  websiteUrl: text("website_url"),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("learning_resource_profiles_user_idx").on(table.userId),
  activeIdx: index("learning_resource_profiles_active_idx").on(table.isActive),
  ratingIdx: index("learning_resource_profiles_rating_idx").on(table.averageRating),
  studentsIdx: index("learning_resource_profiles_students_idx").on(table.totalStudents),
}));

// 16. Taxi Dancer Profiles
export const taxiDancerProfiles = pgTable("taxi_dancer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Profile Info
  bio: text("bio"),
  yearsExperience: integer("years_experience"),
  
  // Dance Info
  roles: text("roles").array(), // 'leader', 'follower', 'both'
  styles: text("styles").array(), // 'salon', 'milonguero', 'nuevo'
  levels: text("levels").array(), // Levels comfortable dancing with
  
  // Availability
  availability: jsonb("availability").$type<{
    weekdays?: string[];
    timeSlots?: string[];
    regularMilongas?: string[];
  }>(),
  availableForEvents: boolean("available_for_events").default(true),
  availableForPractice: boolean("available_for_practice").default(true),
  
  // Pricing
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }),
  eventRate: numeric("event_rate", { precision: 10, scale: 2 }),
  packageRates: jsonb("package_rates").$type<Array<{
    hours: number;
    price: number;
    description?: string;
  }>>(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Experience
  experienceLevel: varchar("experience_level", { length: 50 }), // 'beginner friendly', 'intermediate', 'advanced'
  specialSkills: text("special_skills").array(), // 'teaching', 'performance', 'specific techniques'
  
  // Preferences
  preferredVenues: text("preferred_venues").array(),
  travelRadius: integer("travel_radius"), // miles/km willing to travel
  minimumBooking: integer("minimum_booking"), // Minimum hours
  
  // Languages
  languagesSpoken: text("languages_spoken").array(),
  
  // Media
  photoUrls: text("photo_urls").array(),
  videoUrls: text("video_urls").array(),
  
  // Contact
  phoneNumber: varchar("phone_number", { length: 50 }),
  email: varchar("email", { length: 255 }),
  
  // Stats
  totalDances: integer("total_dances").default(0),
  regularClients: integer("regular_clients").default(0),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Background Check
  backgroundCheckCompleted: boolean("background_check_completed").default(false),
  backgroundCheckDate: timestamp("background_check_date"),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("taxi_dancer_profiles_user_idx").on(table.userId),
  activeIdx: index("taxi_dancer_profiles_active_idx").on(table.isActive),
  ratingIdx: index("taxi_dancer_profiles_rating_idx").on(table.averageRating),
}));

// 17. Organizer Profiles
export const organizerProfiles = pgTable("organizer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Organizer Info
  bio: text("bio"),
  organizationName: varchar("organization_name", { length: 255 }),
  yearsOrganizing: integer("years_organizing"),
  
  // Event Types
  eventTypesOrganized: text("event_types_organized").array(), // 'milonga', 'festival', 'workshop', 'marathon'
  eventSizes: text("event_sizes").array(), // 'small', 'medium', 'large'
  
  // Experience
  totalEventsOrganized: integer("total_events_organized").default(0),
  pastEvents: jsonb("past_events").$type<Array<{
    name: string;
    type: string;
    date: string;
    location: string;
    attendees?: number;
    description?: string;
  }>>(),
  
  // Specialties
  specialties: text("specialties").array(), // 'festivals', 'weekly milongas', 'workshops', 'marathons'
  
  // Services Offered
  servicesOffered: text("services_offered").array(), // 'full event planning', 'consulting', 'DJ booking', 'venue finding'
  
  // Portfolio
  portfolioUrl: text("portfolio_url"),
  photoUrls: text("photo_urls").array(),
  videoUrls: text("video_urls").array(),
  
  // Testimonials
  testimonials: jsonb("testimonials").$type<Array<{
    name: string;
    role?: string;
    quote: string;
    event?: string;
  }>>(),
  
  // Location & Coverage
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  regionsServed: text("regions_served").array(),
  willingToTravel: boolean("willing_to_travel").default(false),
  
  // Pricing
  consultingRate: numeric("consulting_rate", { precision: 10, scale: 2 }),
  eventFee: numeric("event_fee", { precision: 10, scale: 2 }),
  pricingModel: varchar("pricing_model", { length: 100 }), // 'hourly', 'per event', 'package', 'percentage'
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Contact
  phoneNumber: varchar("phone_number", { length: 50 }),
  email: varchar("email", { length: 255 }),
  websiteUrl: text("website_url"),
  
  // Social Media
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  
  // Stats
  upcomingEvents: integer("upcoming_events").default(0),
  averageAttendance: integer("average_attendance"),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").default(0),
  
  // Status
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  userIdx: index("organizer_profiles_user_idx").on(table.userId),
  activeIdx: index("organizer_profiles_active_idx").on(table.isActive),
  cityIdx: index("organizer_profiles_city_idx").on(table.city),
  ratingIdx: index("organizer_profiles_rating_idx").on(table.averageRating),
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
// P0 WORKFLOWS - PART 2 CRITICAL FEATURES
// ============================================================================

// WORKFLOW #1: Founder Approval Workflow
export const featureReviewStatus = pgTable("feature_review_status", {
  id: serial("id").primaryKey(),
  featureName: varchar("feature_name", { length: 255 }).notNull(),
  pageUrl: varchar("page_url", { length: 500 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default('pending_review'),
  builtBy: varchar("built_by", { length: 100 }),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  approvedAt: timestamp("approved_at"),
  checklist: jsonb("checklist").$type<{
    functionalityWorks: boolean;
    designMatches: boolean;
    noBugs: boolean;
    meetsRequirements: boolean;
    readyForUsers: boolean;
  }>(),
  metadata: jsonb("metadata").$type<{
    filesChanged?: string[];
    testCoverage?: number;
    performanceMetrics?: object;
  }>()
}, (table) => ({
  statusIdx: index("idx_feature_review_status").on(table.status),
  submittedIdx: index("idx_feature_review_submitted").on(table.submittedAt),
}));

// WORKFLOW #2: Safety Review Workflow
export const safetyReviews = pgTable("safety_reviews", {
  id: serial("id").primaryKey(),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: integer("target_id").notNull(),
  reviewerId: integer("reviewer_id").references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default('pending'),
  riskLevel: varchar("risk_level", { length: 50 }).default('low'),
  issues: jsonb("issues").$type<Array<{
    category: string;
    severity: string;
    description: string;
  }>>(),
  notes: text("notes"),
  backgroundCheckCompleted: boolean("background_check_completed").default(false),
  backgroundCheckProvider: varchar("background_check_provider", { length: 100 }),
  backgroundCheckResult: jsonb("background_check_result"),
  verificationDocuments: text("verification_documents").array(),
  actionTaken: varchar("action_taken", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  resolvedAt: timestamp("resolved_at")
}, (table) => ({
  targetIdx: index("idx_safety_reviews_target").on(table.targetType, table.targetId),
  statusIdx: index("idx_safety_reviews_status").on(table.status),
  riskIdx: index("idx_safety_reviews_risk").on(table.riskLevel),
}));

// WORKFLOW #3: AI Support Workflow
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  priority: varchar("priority", { length: 50 }).default('medium'),
  status: varchar("status", { length: 50 }).notNull().default('open'),
  description: text("description").notNull(),
  aiResponse: text("ai_response"),
  aiConfidence: real("ai_confidence"),
  humanReviewRequired: boolean("human_review_required").default(false),
  assignedTo: integer("assigned_to").references(() => users.id),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolution: text("resolution"),
  satisfactionRating: integer("satisfaction_rating"),
  satisfactionFeedback: text("satisfaction_feedback"),
  conversationHistory: jsonb("conversation_history").$type<Array<{
    role: 'user' | 'ai' | 'agent';
    message: string;
    timestamp: string;
    confidence?: number;
  }>>(),
  tags: text("tags").array(),
  relatedTickets: integer("related_tickets").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  firstResponseAt: timestamp("first_response_at")
}, (table) => ({
  userIdx: index("idx_support_tickets_user").on(table.userId),
  statusIdx: index("idx_support_tickets_status").on(table.status),
  priorityIdx: index("idx_support_tickets_priority").on(table.priority),
  assignedIdx: index("idx_support_tickets_assigned").on(table.assignedTo),
  createdIdx: index("idx_support_tickets_created").on(table.createdAt),
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

// Content Reports
export const insertContentReportSchema = createInsertSchema(contentReports).omit({ id: true, createdAt: true, reviewedAt: true });
export type InsertContentReport = z.infer<typeof insertContentReportSchema>;
export type SelectContentReport = typeof contentReports.$inferSelect;

// User Reports
export const insertUserReportSchema = createInsertSchema(userReports).omit({ id: true, createdAt: true, updatedAt: true, reviewedAt: true });
export type InsertUserReport = z.infer<typeof insertUserReportSchema>;
export type SelectUserReport = typeof userReports.$inferSelect;

// Moderation Queue
export const insertModerationQueueSchema = createInsertSchema(moderationQueue).omit({ id: true, createdAt: true, moderatedAt: true });
export type InsertModerationQueue = z.infer<typeof insertModerationQueueSchema>;
export type SelectModerationQueue = typeof moderationQueue.$inferSelect;

// Moderation Actions
export const insertModerationActionSchema = createInsertSchema(moderationActions).omit({ id: true, createdAt: true });
export type InsertModerationAction = z.infer<typeof insertModerationActionSchema>;
export type SelectModerationAction = typeof moderationActions.$inferSelect;

// Flagged Content
export const insertFlaggedContentSchema = createInsertSchema(flaggedContent).omit({ id: true, createdAt: true });
export type InsertFlaggedContent = z.infer<typeof insertFlaggedContentSchema>;
export type SelectFlaggedContent = typeof flaggedContent.$inferSelect;

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

// ============================================================================
// SPECIALIZED PROFILE ZOD SCHEMAS & TYPES - 17 PROFILE TYPES
// ============================================================================

// 1. Teacher Profiles
export const insertTeacherProfileSchema = createInsertSchema(teacherProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTeacherProfile = z.infer<typeof insertTeacherProfileSchema>;
export type SelectTeacherProfile = typeof teacherProfiles.$inferSelect;

// 2. DJ Profiles
export const insertDJProfileSchema = createInsertSchema(djProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDJProfile = z.infer<typeof insertDJProfileSchema>;
export type SelectDJProfile = typeof djProfiles.$inferSelect;

// 3. Photographer Profiles
export const insertPhotographerProfileSchema = createInsertSchema(photographerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPhotographerProfile = z.infer<typeof insertPhotographerProfileSchema>;
export type SelectPhotographerProfile = typeof photographerProfiles.$inferSelect;

// 4. Performer Profiles
export const insertPerformerProfileSchema = createInsertSchema(performerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPerformerProfile = z.infer<typeof insertPerformerProfileSchema>;
export type SelectPerformerProfile = typeof performerProfiles.$inferSelect;

// 5. Vendor Profiles
export const insertVendorProfileSchema = createInsertSchema(vendorProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVendorProfile = z.infer<typeof insertVendorProfileSchema>;
export type SelectVendorProfile = typeof vendorProfiles.$inferSelect;

// 6. Musician Profiles
export const insertMusicianProfileSchema = createInsertSchema(musicianProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMusicianProfile = z.infer<typeof insertMusicianProfileSchema>;
export type SelectMusicianProfile = typeof musicianProfiles.$inferSelect;

// 7. Choreographer Profiles
export const insertChoreographerProfileSchema = createInsertSchema(choreographerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertChoreographerProfile = z.infer<typeof insertChoreographerProfileSchema>;
export type SelectChoreographerProfile = typeof choreographerProfiles.$inferSelect;

// 8. Tango School Profiles
export const insertTangoSchoolProfileSchema = createInsertSchema(tangoSchoolProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTangoSchoolProfile = z.infer<typeof insertTangoSchoolProfileSchema>;
export type SelectTangoSchoolProfile = typeof tangoSchoolProfiles.$inferSelect;

// 9. Tango Hotel Profiles
export const insertTangoHotelProfileSchema = createInsertSchema(tangoHotelProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTangoHotelProfile = z.infer<typeof insertTangoHotelProfileSchema>;
export type SelectTangoHotelProfile = typeof tangoHotelProfiles.$inferSelect;

// 10. Wellness Profiles
export const insertWellnessProfileSchema = createInsertSchema(wellnessProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWellnessProfile = z.infer<typeof insertWellnessProfileSchema>;
export type SelectWellnessProfile = typeof wellnessProfiles.$inferSelect;

// 11. Tour Operator Profiles
export const insertTourOperatorProfileSchema = createInsertSchema(tourOperatorProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTourOperatorProfile = z.infer<typeof insertTourOperatorProfileSchema>;
export type SelectTourOperatorProfile = typeof tourOperatorProfiles.$inferSelect;

// 12. Host Venue Profiles
export const insertHostVenueProfileSchema = createInsertSchema(hostVenueProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHostVenueProfile = z.infer<typeof insertHostVenueProfileSchema>;
export type SelectHostVenueProfile = typeof hostVenueProfiles.$inferSelect;

// 13. Tango Guide Profiles
export const insertTangoGuideProfileSchema = createInsertSchema(tangoGuideProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTangoGuideProfile = z.infer<typeof insertTangoGuideProfileSchema>;
export type SelectTangoGuideProfile = typeof tangoGuideProfiles.$inferSelect;

// 14. Content Creator Profiles
export const insertContentCreatorProfileSchema = createInsertSchema(contentCreatorProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContentCreatorProfile = z.infer<typeof insertContentCreatorProfileSchema>;
export type SelectContentCreatorProfile = typeof contentCreatorProfiles.$inferSelect;

// 15. Learning Resource Profiles
export const insertLearningResourceProfileSchema = createInsertSchema(learningResourceProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLearningResourceProfile = z.infer<typeof insertLearningResourceProfileSchema>;
export type SelectLearningResourceProfile = typeof learningResourceProfiles.$inferSelect;

// 16. Taxi Dancer Profiles
export const insertTaxiDancerProfileSchema = createInsertSchema(taxiDancerProfiles).omit({ id: true, createdAt: true, updatedAt: true, backgroundCheckDate: true });
export type InsertTaxiDancerProfile = z.infer<typeof insertTaxiDancerProfileSchema>;
export type SelectTaxiDancerProfile = typeof taxiDancerProfiles.$inferSelect;

// 17. Organizer Profiles
export const insertOrganizerProfileSchema = createInsertSchema(organizerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrganizerProfile = z.infer<typeof insertOrganizerProfileSchema>;
export type SelectOrganizerProfile = typeof organizerProfiles.$inferSelect;

// ============================================================================
// COMPREHENSIVE UPDATE VALIDATION SCHEMAS FOR ALL PROFILE TYPES
// ============================================================================

// 1. Teacher Profile Update Schema
export const updateTeacherProfileSchema = insertTeacherProfileSchema.partial().extend({
  bio: z.string().max(5000).optional(),
  yearsExperience: z.number().int().min(0).max(100).optional(),
  teachingSince: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  teachingStyles: z.array(z.string().max(100)).max(20).optional(),
  specialties: z.array(z.string().max(100)).max(30).optional(),
  levels: z.array(z.string().max(50)).max(10).optional(),
  certifications: z.array(z.string().max(200)).max(20).optional(),
  hourlyRate: z.number().min(0).max(10000).optional(),
  privateClassRate: z.number().min(0).max(10000).optional(),
  groupClassRate: z.number().min(0).max(10000).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(50).optional(),
  videoUrls: z.array(z.string().url().max(500)).max(30).optional(),
  portfolioUrl: z.string().url().max(500).optional(),
  languagesSpoken: z.array(z.string().max(50)).max(20).optional(),
  teachingLocations: z.array(z.string().max(200)).max(30).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateTeacherProfile = z.infer<typeof updateTeacherProfileSchema>;

// 2. DJ Profile Update Schema
export const updateDJProfileSchema = insertDJProfileSchema.partial().extend({
  bio: z.string().max(5000).optional(),
  djName: z.string().max(255).optional(),
  yearsExperience: z.number().int().min(0).max(100).optional(),
  startedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  musicStyles: z.array(z.string().max(100)).max(20).optional(),
  specialties: z.array(z.string().max(100)).max(30).optional(),
  eras: z.array(z.string().max(100)).max(15).optional(),
  setsPerformed: z.number().int().min(0).max(100000).optional(),
  eventsWorked: z.number().int().min(0).max(50000).optional(),
  venuesPlayed: z.array(z.string().max(200)).max(100).optional(),
  portfolioLinks: z.array(z.string().url().max(500)).max(20).optional(),
  soundcloudUrl: z.string().url().max(500).optional(),
  spotifyUrl: z.string().url().max(500).optional(),
  youtubeUrl: z.string().url().max(500).optional(),
  mixcloudUrl: z.string().url().max(500).optional(),
  hourlyRate: z.number().min(0).max(50000).optional(),
  eventRate: z.number().min(0).max(100000).optional(),
  travelRadius: z.number().int().min(0).max(10000).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(50).optional(),
  videoUrls: z.array(z.string().url().max(500)).max(30).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateDJProfile = z.infer<typeof updateDJProfileSchema>;

// 3. Photographer Profile Update Schema
export const updatePhotographerProfileSchema = insertPhotographerProfileSchema.partial().extend({
  bio: z.string().max(5000).optional(),
  businessName: z.string().max(255).optional(),
  yearsExperience: z.number().int().min(0).max(100).optional(),
  specialties: z.array(z.string().max(100)).max(20).optional(),
  photographyStyle: z.array(z.string().max(100)).max(20).optional(),
  portfolioUrl: z.string().url().max(500).optional(),
  instagramUrl: z.string().url().max(500).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(100).optional(),
  hourlyRate: z.number().min(0).max(50000).optional(),
  eventRate: z.number().min(0).max(100000).optional(),
  servicesOffered: z.array(z.string().max(100)).max(20).optional(),
  deliveryTime: z.string().max(100).optional(),
  coverageAreas: z.array(z.string().max(200)).max(50).optional(),
  travelFee: z.number().min(0).max(50000).optional(),
  eventsPhotographed: z.number().int().min(0).max(100000).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdatePhotographerProfile = z.infer<typeof updatePhotographerProfileSchema>;

// 4. Performer Profile Update Schema
export const updatePerformerProfileSchema = insertPerformerProfileSchema.partial().extend({
  bio: z.string().max(5000).optional(),
  stageName: z.string().max(255).optional(),
  yearsPerforming: z.number().int().min(0).max(100).optional(),
  performanceTypes: z.array(z.string().max(100)).max(20).optional(),
  styles: z.array(z.string().max(100)).max(20).optional(),
  performanceCount: z.number().int().min(0).max(100000).optional(),
  venuesPerformed: z.array(z.string().max(200)).max(100).optional(),
  repertoire: z.array(z.string().max(200)).max(100).optional(),
  choreographies: z.array(z.string().max(200)).max(50).optional(),
  demoVideoUrls: z.array(z.string().url().max(500)).max(30).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(100).optional(),
  portfolioUrl: z.string().url().max(500).optional(),
  youtubeUrl: z.string().url().max(500).optional(),
  instagramUrl: z.string().url().max(500).optional(),
  partnerName: z.string().max(255).optional(),
  performanceFee: z.number().min(0).max(1000000).optional(),
  rehearsalFee: z.number().min(0).max(100000).optional(),
  technicalRequirements: z.string().max(2000).optional(),
  musicRequirements: z.string().max(2000).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdatePerformerProfile = z.infer<typeof updatePerformerProfileSchema>;

// 5. Vendor Profile Update Schema
export const updateVendorProfileSchema = insertVendorProfileSchema.partial().extend({
  businessName: z.string().max(255),
  bio: z.string().max(5000).optional(),
  yearsInBusiness: z.number().int().min(0).max(200).optional(),
  productCategories: z.array(z.string().max(100)).max(30).optional(),
  servicesOffered: z.array(z.string().max(100)).max(30).optional(),
  priceRange: z.string().max(50).optional(),
  deliveryAreas: z.array(z.string().max(200)).max(100).optional(),
  shippingOptions: z.array(z.string().max(100)).max(20).optional(),
  shippingCost: z.number().min(0).max(10000).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  shopUrl: z.string().url().max(500).optional(),
  phoneNumber: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  instagramUrl: z.string().url().max(500).optional(),
  facebookUrl: z.string().url().max(500).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(100).optional(),
  storeAddress: z.string().max(500).optional(),
  totalSales: z.number().int().min(0).max(1000000000).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateVendorProfile = z.infer<typeof updateVendorProfileSchema>;

// 6. Musician Profile Update Schema
export const updateMusicianProfileSchema = insertMusicianProfileSchema.partial().extend({
  bio: z.string().max(5000).optional(),
  artistName: z.string().max(255).optional(),
  yearsExperience: z.number().int().min(0).max(100).optional(),
  instruments: z.array(z.string().max(100)).max(20).optional(),
  genres: z.array(z.string().max(100)).max(30).optional(),
  musicalStyles: z.array(z.string().max(100)).max(30).optional(),
  orchestrasPlayed: z.array(z.string().max(200)).max(50).optional(),
  audioSamples: z.array(z.string().url().max(500)).max(50).optional(),
  videoUrls: z.array(z.string().url().max(500)).max(50).optional(),
  spotifyUrl: z.string().url().max(500).optional(),
  soundcloudUrl: z.string().url().max(500).optional(),
  youtubeUrl: z.string().url().max(500).optional(),
  compositions: z.array(z.string().max(200)).max(100).optional(),
  performanceFee: z.number().min(0).max(1000000).optional(),
  sessionFee: z.number().min(0).max(100000).optional(),
  performanceCount: z.number().int().min(0).max(100000).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateMusicianProfile = z.infer<typeof updateMusicianProfileSchema>;

// 7. Choreographer Profile Update Schema
export const updateChoreographerProfileSchema = insertChoreographerProfileSchema.partial().extend({
  bio: z.string().max(5000).optional(),
  yearsExperience: z.number().int().min(0).max(100).optional(),
  styleSpecialties: z.array(z.string().max(100)).max(20).optional(),
  choreographyCount: z.number().int().min(0).max(10000).optional(),
  workshopsOffered: z.array(z.string().max(200)).max(50).optional(),
  portfolioUrl: z.string().url().max(500).optional(),
  videoUrls: z.array(z.string().url().max(500)).max(100).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(100).optional(),
  youtubeUrl: z.string().url().max(500).optional(),
  instagramUrl: z.string().url().max(500).optional(),
  notableCollaborations: z.array(z.string().max(200)).max(100).optional(),
  companies: z.array(z.string().max(200)).max(50).optional(),
  servicesOffered: z.array(z.string().max(200)).max(30).optional(),
  choreographyFee: z.number().min(0).max(1000000).optional(),
  workshopFee: z.number().min(0).max(100000).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateChoreographerProfile = z.infer<typeof updateChoreographerProfileSchema>;

// 8. Tango School Profile Update Schema
export const updateTangoSchoolProfileSchema = insertTangoSchoolProfileSchema.partial().extend({
  schoolName: z.string().max(255),
  bio: z.string().max(5000).optional(),
  founded: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  classTypes: z.array(z.string().max(100)).max(20).optional(),
  levels: z.array(z.string().max(50)).max(15).optional(),
  styles: z.array(z.string().max(100)).max(20).optional(),
  instructorCount: z.number().int().min(0).max(1000).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(255).optional(),
  country: z.string().max(255).optional(),
  priceRange: z.string().max(50).optional(),
  phoneNumber: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(100).optional(),
  videoUrls: z.array(z.string().url().max(500)).max(50).optional(),
  instagramUrl: z.string().url().max(500).optional(),
  facebookUrl: z.string().url().max(500).optional(),
  studentCount: z.number().int().min(0).max(1000000).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateTangoSchoolProfile = z.infer<typeof updateTangoSchoolProfileSchema>;

// 9. Tango Hotel Profile Update Schema
export const updateTangoHotelProfileSchema = insertTangoHotelProfileSchema.partial().extend({
  hotelName: z.string().max(255),
  description: z.string().max(5000).optional(),
  category: z.string().max(50).optional(),
  starRating: z.number().int().min(1).max(5).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(255).optional(),
  country: z.string().max(255).optional(),
  phoneNumber: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  bookingUrl: z.string().url().max(500).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(100).optional(),
  videoUrls: z.array(z.string().url().max(500)).max(30).optional(),
  instagramUrl: z.string().url().max(500).optional(),
  facebookUrl: z.string().url().max(500).optional(),
  priceRange: z.string().max(50).optional(),
  roomCount: z.number().int().min(0).max(10000).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateTangoHotelProfile = z.infer<typeof updateTangoHotelProfileSchema>;

// 10. Wellness Profile Update Schema
export const updateWellnessProfileSchema = insertWellnessProfileSchema.partial().extend({
  businessName: z.string().max(255),
  bio: z.string().max(5000).optional(),
  yearsExperience: z.number().int().min(0).max(100).optional(),
  specialties: z.array(z.string().max(100)).max(30).optional(),
  servicesOffered: z.array(z.string().max(100)).max(50).optional(),
  certifications: z.array(z.string().max(200)).max(30).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(255).optional(),
  country: z.string().max(255).optional(),
  phoneNumber: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  bookingUrl: z.string().url().max(500).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(100).optional(),
  videoUrls: z.array(z.string().url().max(500)).max(30).optional(),
  instagramUrl: z.string().url().max(500).optional(),
  facebookUrl: z.string().url().max(500).optional(),
  priceRange: z.string().max(50).optional(),
  sessionRate: z.number().min(0).max(10000).optional(),
  packageRate: z.number().min(0).max(100000).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateWellnessProfile = z.infer<typeof updateWellnessProfileSchema>;

// 11. Tour Operator Profile Update Schema
export const updateTourOperatorProfileSchema = insertTourOperatorProfileSchema.partial().extend({
  companyName: z.string().max(255),
  description: z.string().max(5000).optional(),
  yearsInBusiness: z.number().int().min(0).max(200).optional(),
  tourTypes: z.array(z.string().max(100)).max(30).optional(),
  specialties: z.array(z.string().max(100)).max(30).optional(),
  destinations: z.array(z.string().max(200)).max(100).optional(),
  languagesOffered: z.array(z.string().max(50)).max(30).optional(),
  phoneNumber: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  bookingUrl: z.string().url().max(500).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(100).optional(),
  videoUrls: z.array(z.string().url().max(500)).max(50).optional(),
  instagramUrl: z.string().url().max(500).optional(),
  facebookUrl: z.string().url().max(500).optional(),
  priceRange: z.string().max(50).optional(),
  toursCompleted: z.number().int().min(0).max(1000000).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateTourOperatorProfile = z.infer<typeof updateTourOperatorProfileSchema>;

// 12. Host Venue Profile Update Schema
export const updateHostVenueProfileSchema = insertHostVenueProfileSchema.partial().extend({
  venueName: z.string().max(255),
  description: z.string().max(5000).optional(),
  venueType: z.string().max(100).optional(),
  capacity: z.number().int().min(0).max(1000000).optional(),
  eventTypes: z.array(z.string().max(100)).max(30).optional(),
  amenities: z.array(z.string().max(100)).max(50).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(255).optional(),
  country: z.string().max(255).optional(),
  phoneNumber: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  bookingUrl: z.string().url().max(500).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(100).optional(),
  videoUrls: z.array(z.string().url().max(500)).max(50).optional(),
  virtualTourUrl: z.string().url().max(500).optional(),
  instagramUrl: z.string().url().max(500).optional(),
  facebookUrl: z.string().url().max(500).optional(),
  priceRange: z.string().max(50).optional(),
  baseRate: z.number().min(0).max(1000000).optional(),
  hourlyRate: z.number().min(0).max(100000).optional(),
  eventsHosted: z.number().int().min(0).max(1000000).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateHostVenueProfile = z.infer<typeof updateHostVenueProfileSchema>;

// 13. Tango Guide Profile Update Schema
export const updateTangoGuideProfileSchema = insertTangoGuideProfileSchema.partial().extend({
  bio: z.string().max(5000).optional(),
  yearsExperience: z.number().int().min(0).max(100).optional(),
  citiesCovered: z.array(z.string().max(200)).max(50).optional(),
  primaryCity: z.string().max(255).optional(),
  country: z.string().max(255).optional(),
  languagesSpoken: z.array(z.string().max(50)).max(30).optional(),
  servicesOffered: z.array(z.string().max(200)).max(30).optional(),
  tourTypes: z.array(z.string().max(100)).max(20).optional(),
  specialKnowledge: z.array(z.string().max(200)).max(50).optional(),
  neighborhoods: z.array(z.string().max(200)).max(50).optional(),
  hourlyRate: z.number().min(0).max(10000).optional(),
  halfDayRate: z.number().min(0).max(50000).optional(),
  fullDayRate: z.number().min(0).max(100000).optional(),
  minimumHours: z.number().int().min(0).max(24).optional(),
  advanceNotice: z.number().int().min(0).max(365).optional(),
  vehicleType: z.string().max(100).optional(),
  phoneNumber: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(100).optional(),
  videoUrls: z.array(z.string().url().max(500)).max(30).optional(),
  toursCompleted: z.number().int().min(0).max(100000).optional(),
  tourismLicense: z.string().max(255).optional(),
  certifications: z.array(z.string().max(200)).max(20).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateTangoGuideProfile = z.infer<typeof updateTangoGuideProfileSchema>;

// 14. Content Creator Profile Update Schema
export const updateContentCreatorProfileSchema = insertContentCreatorProfileSchema.partial().extend({
  bio: z.string().max(5000).optional(),
  creatorName: z.string().max(255).optional(),
  yearsCreating: z.number().int().min(0).max(100).optional(),
  contentTypes: z.array(z.string().max(100)).max(20).optional(),
  formats: z.array(z.string().max(100)).max(30).optional(),
  portfolioUrl: z.string().url().max(500).optional(),
  youtubeUrl: z.string().url().max(500).optional(),
  instagramUrl: z.string().url().max(500).optional(),
  tiktokUrl: z.string().url().max(500).optional(),
  blogUrl: z.string().url().max(500).optional(),
  podcastUrl: z.string().url().max(500).optional(),
  totalFollowers: z.number().int().min(0).max(1000000000).optional(),
  averageViews: z.number().int().min(0).max(1000000000).optional(),
  engagementRate: z.number().min(0).max(100).optional(),
  collaborationTypes: z.array(z.string().max(100)).max(20).optional(),
  mediaKitUrl: z.string().url().max(500).optional(),
  businessEmail: z.string().email().max(255).optional(),
  phoneNumber: z.string().max(50).optional(),
  totalContent: z.number().int().min(0).max(1000000).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateContentCreatorProfile = z.infer<typeof updateContentCreatorProfileSchema>;

// 15. Learning Resource Profile Update Schema
export const updateLearningResourceProfileSchema = insertLearningResourceProfileSchema.partial().extend({
  resourceName: z.string().max(255),
  description: z.string().max(5000).optional(),
  courseTypes: z.array(z.string().max(100)).max(20).optional(),
  levels: z.array(z.string().max(50)).max(15).optional(),
  formats: z.array(z.string().max(100)).max(20).optional(),
  priceRange: z.string().max(50).optional(),
  platformUrl: z.string().url().max(500).optional(),
  platformType: z.string().max(100).optional(),
  totalLessons: z.number().int().min(0).max(100000).optional(),
  totalHours: z.number().int().min(0).max(100000).optional(),
  languagesAvailable: z.array(z.string().max(50)).max(50).optional(),
  features: z.array(z.string().max(200)).max(30).optional(),
  previewVideoUrl: z.string().url().max(500).optional(),
  sampleLessons: z.array(z.string().url().max(500)).max(20).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(50).optional(),
  videoUrls: z.array(z.string().url().max(500)).max(50).optional(),
  totalStudents: z.number().int().min(0).max(10000000).optional(),
  completionRate: z.number().min(0).max(100).optional(),
  email: z.string().email().max(255).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateLearningResourceProfile = z.infer<typeof updateLearningResourceProfileSchema>;

// 16. Taxi Dancer Profile Update Schema
export const updateTaxiDancerProfileSchema = insertTaxiDancerProfileSchema.partial().extend({
  bio: z.string().max(5000).optional(),
  yearsExperience: z.number().int().min(0).max(100).optional(),
  roles: z.array(z.string().max(50)).max(5).optional(),
  styles: z.array(z.string().max(100)).max(20).optional(),
  levels: z.array(z.string().max(50)).max(10).optional(),
  hourlyRate: z.number().min(0).max(10000).optional(),
  eventRate: z.number().min(0).max(50000).optional(),
  experienceLevel: z.string().max(50).optional(),
  specialSkills: z.array(z.string().max(200)).max(30).optional(),
  preferredVenues: z.array(z.string().max(200)).max(50).optional(),
  travelRadius: z.number().int().min(0).max(10000).optional(),
  minimumBooking: z.number().int().min(0).max(24).optional(),
  languagesSpoken: z.array(z.string().max(50)).max(30).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(50).optional(),
  videoUrls: z.array(z.string().url().max(500)).max(30).optional(),
  phoneNumber: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  totalDances: z.number().int().min(0).max(1000000).optional(),
  regularClients: z.number().int().min(0).max(10000).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateTaxiDancerProfile = z.infer<typeof updateTaxiDancerProfileSchema>;

// 17. Organizer Profile Update Schema
export const updateOrganizerProfileSchema = insertOrganizerProfileSchema.partial().extend({
  bio: z.string().max(5000).optional(),
  organizationName: z.string().max(255).optional(),
  yearsOrganizing: z.number().int().min(0).max(100).optional(),
  eventTypesOrganized: z.array(z.string().max(100)).max(30).optional(),
  eventSizes: z.array(z.string().max(50)).max(10).optional(),
  totalEventsOrganized: z.number().int().min(0).max(100000).optional(),
  specialties: z.array(z.string().max(200)).max(30).optional(),
  servicesOffered: z.array(z.string().max(200)).max(30).optional(),
  portfolioUrl: z.string().url().max(500).optional(),
  photoUrls: z.array(z.string().url().max(500)).max(100).optional(),
  videoUrls: z.array(z.string().url().max(500)).max(50).optional(),
  city: z.string().max(255).optional(),
  country: z.string().max(255).optional(),
  regionsServed: z.array(z.string().max(200)).max(100).optional(),
  consultingRate: z.number().min(0).max(100000).optional(),
  eventFee: z.number().min(0).max(10000000).optional(),
  pricingModel: z.string().max(100).optional(),
  phoneNumber: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  facebookUrl: z.string().url().max(500).optional(),
  instagramUrl: z.string().url().max(500).optional(),
  upcomingEvents: z.number().int().min(0).max(10000).optional(),
  averageAttendance: z.number().int().min(0).max(1000000).optional(),
  currency: z.string().length(3).optional(),
});
export type UpdateOrganizerProfile = z.infer<typeof updateOrganizerProfileSchema>;

// ============================================================================
// P0 WORKFLOWS ZOD SCHEMAS & TYPES
// ============================================================================

// Feature Review Status (Founder Approval Workflow)
export const insertFeatureReviewStatusSchema = createInsertSchema(featureReviewStatus).omit({ id: true, submittedAt: true, reviewedAt: true, approvedAt: true });
export type InsertFeatureReviewStatus = z.infer<typeof insertFeatureReviewStatusSchema>;
export type SelectFeatureReviewStatus = typeof featureReviewStatus.$inferSelect;

// Safety Reviews
export const insertSafetyReviewSchema = createInsertSchema(safetyReviews).omit({ id: true, createdAt: true, reviewedAt: true, resolvedAt: true });
export type InsertSafetyReview = z.infer<typeof insertSafetyReviewSchema>;
export type SelectSafetyReview = typeof safetyReviews.$inferSelect;

// Support Tickets (AI Support Workflow)
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true, resolvedAt: true, firstResponseAt: true });
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SelectSupportTicket = typeof supportTickets.$inferSelect;

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
// ESA AGENT INTELLIGENCE SYSTEM (AGENT #79 & #80)
// ============================================================================

/**
 * Agents Table - Master Registry
 * Central registry of all 927+ ESA agents in the system
 * Tracks agent metadata, capabilities, status, and performance
 */
export const agents = pgTable("agents", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  status: varchar("status", { length: 50 }).default('active'),
  configuration: jsonb("configuration").default({}).notNull(),
  capabilities: jsonb("capabilities").default([]),
  personality: jsonb("personality"),
  systemPrompt: text("system_prompt"),
  version: varchar("version", { length: 50 }).default('1.0.0'),
  layer: integer("layer"),
  lastActive: timestamp("last_active"),
  metrics: jsonb("metrics").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  idIdx: index("agents_id_idx").on(table.id),
  typeIdx: index("agents_type_idx").on(table.type),
  categoryIdx: index("agents_category_idx").on(table.category),
  statusIdx: index("agents_status_idx").on(table.status),
  layerIdx: index("agents_layer_idx").on(table.layer),
}));

/**
 * Agent Learnings Table - Learning Coordinator (Agent #80)
 * Stores all agent learnings for knowledge distribution
 * Includes vector embeddings for semantic search
 */
export const agentLearnings = pgTable("agent_learnings", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }),
  category: varchar("category", { length: 100 }).notNull(),
  domain: varchar("domain", { length: 100 }),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  outcome: jsonb("outcome"),
  embedding: text("embedding"),
  tags: text("tags").array(),
  relatedAgents: text("related_agents").array(),
  distributedUp: boolean("distributed_up").default(false),
  distributedAcross: boolean("distributed_across").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  agentIdx: index("idx_agent_learnings_agent").on(table.agentId),
  categoryIdx: index("idx_agent_learnings_category").on(table.category),
  domainIdx: index("idx_agent_learnings_domain").on(table.domain),
  tagsIdx: index("idx_agent_learnings_tags").using("gin", table.tags),
}));

/**
 * Agent Escalations Table - Hierarchical Problem Escalation
 * Tracks escalations through 4-level hierarchy: Peer → Domain → Chief → CEO
 */
export const agentEscalations = pgTable("agent_escalations", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  issue: text("issue").notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  context: jsonb("context"),
  attemptedFixes: text("attempted_fixes").array(),
  escalationLevel: varchar("escalation_level", { length: 20 }).notNull(),
  escalatedTo: varchar("escalated_to", { length: 100 }),
  escalationPath: text("escalation_path").array(),
  status: varchar("status", { length: 20 }).default('pending'),
  resolution: text("resolution"),
  resolvedBy: varchar("resolved_by", { length: 100 }),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  agentIdx: index("idx_agent_escalations_agent").on(table.agentId),
  severityIdx: index("idx_agent_escalations_severity").on(table.severity),
  levelIdx: index("idx_agent_escalations_level").on(table.escalationLevel),
  statusIdx: index("idx_agent_escalations_status").on(table.status),
  escalatedToIdx: index("idx_agent_escalations_to").on(table.escalatedTo),
}));

/**
 * Learning Patterns Table - Agent #80 Pattern Library
 * Recurring solution patterns discovered across agents
 * Includes success rates and confidence scores
 */
export const learningPatterns = pgTable("learning_patterns", {
  id: serial("id").primaryKey(),
  patternName: varchar("pattern_name", { length: 255 }).notNull().unique(),
  problemSignature: text("problem_signature").notNull(),
  solutionTemplate: text("solution_template").notNull(),
  category: varchar("category", { length: 100 }),
  discoveredBy: text("discovered_by").array().notNull(),
  timesApplied: integer("times_applied").default(0),
  successRate: real("success_rate").default(0.5),
  confidence: real("confidence").default(0.5),
  metadata: jsonb("metadata"),
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  variations: jsonb("variations"),
  whenNotToUse: text("when_not_to_use"),
  codeExample: text("code_example"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  patternNameIdx: index("learning_patterns_pattern_name_idx").on(table.patternName),
  categoryIdx: index("learning_patterns_category_idx").on(table.category),
  successRateIdx: index("learning_patterns_success_rate_idx").on(table.successRate),
  isActiveIdx: index("learning_patterns_is_active_idx").on(table.isActive),
}));

/**
 * Validation Results Table - Agent #79 Quality Validator
 * Stores feature validation outcomes, issues, and fix suggestions
 * Enables collaborative debugging with offering to fix issues
 */
export const validationResults = pgTable("validation_results", {
  id: serial("id").primaryKey(),
  validatorAgent: varchar("validator_agent", { length: 50 }).default("Agent #79"),
  targetAgent: varchar("target_agent", { length: 100 }).notNull(),
  feature: varchar("feature", { length: 255 }).notNull(),
  page: varchar("page", { length: 255 }),
  testType: varchar("test_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  issues: jsonb("issues").default([]),
  suggestions: jsonb("suggestions").default([]),
  fixPlan: jsonb("fix_plan"),
  collaborationOffered: boolean("collaboration_offered").default(false),
  agentResponse: varchar("agent_response", { length: 50 }),
  timeToFix: integer("time_to_fix"),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata"),
  validatedAt: timestamp("validated_at").defaultNow(),
  fixedAt: timestamp("fixed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  targetAgentIdx: index("validation_results_target_agent_idx").on(table.targetAgent),
  featureIdx: index("validation_results_feature_idx").on(table.feature),
  statusIdx: index("validation_results_status_idx").on(table.status),
  testTypeIdx: index("validation_results_test_type_idx").on(table.testType),
}));

// Customer Journey Tests (Agent #79 - End-to-End Testing)
export const customerJourneyTests = pgTable("customer_journey_tests", {
  id: serial("id").primaryKey(),
  journeyName: varchar("journey_name", { length: 255 }).notNull(),
  journeySteps: jsonb("journey_steps").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  failedStep: integer("failed_step"),
  failureReason: text("failure_reason"),
  responsibleAgents: text("responsible_agents").array(),
  deviceTested: varchar("device_tested", { length: 50 }),
  testedAt: timestamp("tested_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  journeyNameIdx: index("customer_journey_tests_journey_name_idx").on(table.journeyName),
  statusIdx: index("customer_journey_tests_status_idx").on(table.status),
  testedAtIdx: index("customer_journey_tests_tested_at_idx").on(table.testedAt),
}));

/**
 * AI Guardrail Violations Table (APPENDIX Q - BATCH 28)
 * Tracks AI error prevention guardrail violations across 7 layers
 * Enables tracking of hallucinations, breaking changes, and other AI errors
 * 
 * 7 Guardrail Layers:
 * 1. Pre-Execution Validation - Requirements clarity before coding
 * 2. Multi-AI Code Review - Peer validation from Agents #79, #68, #80
 * 3. Hallucination Detection - Verify code references exist
 * 4. Breaking Change Prevention - Impact analysis before changes
 * 5. Requirement Verification - Output matches requirements exactly
 * 6. Continuous Monitoring - Watch for runtime errors
 * 7. Pattern Learning - Learn from mistakes (Agent #68)
 */
export const aiGuardrailViolations = pgTable("ai_guardrail_violations", {
  id: serial("id").primaryKey(),
  
  // Violation identification
  guardrailLayer: varchar("guardrail_layer", { length: 50 }).notNull(), // Layer 1-7
  violationType: varchar("violation_type", { length: 100 }).notNull(), // hallucination, breaking_change, etc
  severity: varchar("severity", { length: 20 }).notNull(), // critical, high, medium, low
  
  // Agent context
  agentId: varchar("agent_id", { length: 100 }).notNull(), // Which AI made the error
  targetFeature: varchar("target_feature", { length: 255 }), // What was being built
  targetFile: varchar("target_file", { length: 500 }), // Which file was affected
  
  // Violation details
  violationDetails: jsonb("violation_details").notNull(), // Full violation data
  codeSnippet: text("code_snippet"), // Problematic code
  expectedBehavior: text("expected_behavior"), // What should have happened
  actualBehavior: text("actual_behavior"), // What actually happened
  
  // Detection & resolution
  detectedBy: varchar("detected_by", { length: 100 }).notNull(), // Which guardrail/agent detected it
  autoFixed: boolean("auto_fixed").default(false), // Was it auto-corrected?
  fixApplied: text("fix_applied"), // What fix was applied
  fixedBy: varchar("fixed_by", { length: 100 }), // Which agent fixed it
  
  // Impact assessment
  impactLevel: varchar("impact_level", { length: 20 }), // production, staging, development
  affectedUsers: integer("affected_users").default(0), // How many users impacted
  downtimeMinutes: integer("downtime_minutes").default(0), // Service downtime caused
  
  // Learning & pattern extraction
  patternExtracted: boolean("pattern_extracted").default(false), // Was a pattern learned?
  patternId: integer("pattern_id").references(() => learningPatterns.id), // Link to learned pattern
  preventionRule: text("prevention_rule"), // Rule to prevent recurrence
  
  // Metadata
  metadata: jsonb("metadata"), // Additional context data
  status: varchar("status", { length: 50 }).default("open"), // open, fixed, acknowledged, ignored
  
  // Timestamps
  detectedAt: timestamp("detected_at").defaultNow(),
  fixedAt: timestamp("fixed_at"),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  guardrailLayerIdx: index("ai_guardrail_violations_layer_idx").on(table.guardrailLayer),
  violationTypeIdx: index("ai_guardrail_violations_type_idx").on(table.violationType),
  severityIdx: index("ai_guardrail_violations_severity_idx").on(table.severity),
  agentIdx: index("ai_guardrail_violations_agent_idx").on(table.agentId),
  statusIdx: index("ai_guardrail_violations_status_idx").on(table.status),
  detectedAtIdx: index("ai_guardrail_violations_detected_at_idx").on(table.detectedAt),
  impactIdx: index("ai_guardrail_violations_impact_idx").on(table.impactLevel, table.severity),
}));

// ============================================================================
// ESA AGENT ZOD SCHEMAS & TYPES
// ============================================================================

// Agents (Master Registry)
export const insertAgentSchema = createInsertSchema(agents).omit({ createdAt: true, lastActive: true });
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type SelectAgent = typeof agents.$inferSelect;

// Agent Learnings
export const insertAgentLearningSchema = createInsertSchema(agentLearnings).omit({ id: true, createdAt: true });
export type InsertAgentLearning = z.infer<typeof insertAgentLearningSchema>;
export type SelectAgentLearning = typeof agentLearnings.$inferSelect;

// Agent Escalations
export const insertAgentEscalationSchema = createInsertSchema(agentEscalations).omit({ id: true, createdAt: true, updatedAt: true, resolvedAt: true });
export type InsertAgentEscalation = z.infer<typeof insertAgentEscalationSchema>;
export type SelectAgentEscalation = typeof agentEscalations.$inferSelect;

// Learning Patterns
export const insertLearningPatternSchema = createInsertSchema(learningPatterns).omit({ id: true, createdAt: true, updatedAt: true, lastUsed: true });
export type InsertLearningPattern = z.infer<typeof insertLearningPatternSchema>;
export type SelectLearningPattern = typeof learningPatterns.$inferSelect;

// Validation Results
export const insertValidationResultSchema = createInsertSchema(validationResults).omit({ id: true, createdAt: true, validatedAt: true, fixedAt: true, resolvedAt: true });
export type InsertValidationResult = z.infer<typeof insertValidationResultSchema>;
export type SelectValidationResult = typeof validationResults.$inferSelect;

// Agent Communications
export const insertAgentCommunicationSchema = createInsertSchema(agentCommunications).omit({ id: true, createdAt: true, processedAt: true });
export type InsertAgentCommunication = z.infer<typeof insertAgentCommunicationSchema>;
export type SelectAgentCommunication = typeof agentCommunications.$inferSelect;

// Agent Collaborations
export const insertAgentCollaborationSchema = createInsertSchema(agentCollaborations).omit({ id: true, requestedAt: true, resolvedAt: true });
export type InsertAgentCollaboration = z.infer<typeof insertAgentCollaborationSchema>;
export type SelectAgentCollaboration = typeof agentCollaborations.$inferSelect;

// Agent Memories
export const insertAgentMemorySchema = createInsertSchema(agentMemories).omit({ id: true, createdAt: true });
export type InsertAgentMemory = z.infer<typeof insertAgentMemorySchema>;
export type SelectAgentMemory = typeof agentMemories.$inferSelect;

// Agent Knowledge
export const insertAgentKnowledgeSchema = createInsertSchema(agentKnowledge).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgentKnowledge = z.infer<typeof insertAgentKnowledgeSchema>;
export type SelectAgentKnowledge = typeof agentKnowledge.$inferSelect;

// Customer Journey Tests
export const insertCustomerJourneyTestSchema = createInsertSchema(customerJourneyTests).omit({ id: true, createdAt: true, testedAt: true });
export type InsertCustomerJourneyTest = z.infer<typeof insertCustomerJourneyTestSchema>;
export type SelectCustomerJourneyTest = typeof customerJourneyTests.$inferSelect;

// AI Guardrail Violations (APPENDIX Q - BATCH 28)
export const insertAIGuardrailViolationSchema = createInsertSchema(aiGuardrailViolations).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  detectedAt: true, 
  fixedAt: true, 
  acknowledgedAt: true 
});
export type InsertAIGuardrailViolation = z.infer<typeof insertAIGuardrailViolationSchema>;
export type SelectAIGuardrailViolation = typeof aiGuardrailViolations.$inferSelect;

// Agent Change Broadcasts (TRACK 2 BATCH 10-12)
export const insertAgentChangeBroadcastSchema = createInsertSchema(agentChangeBroadcasts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  propagationStartedAt: true,
  propagationCompletedAt: true,
  lastRetryAt: true
});
export type InsertAgentChangeBroadcast = z.infer<typeof insertAgentChangeBroadcastSchema>;
export type SelectAgentChangeBroadcast = typeof agentChangeBroadcasts.$inferSelect;

// Agent Decisions (TRACK 2 BATCH 10-12)
export const insertAgentDecisionSchema = createInsertSchema(agentDecisions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  decidedAt: true,
  escalatedAt: true,
  implementedAt: true
});
export type InsertAgentDecision = z.infer<typeof insertAgentDecisionSchema>;
export type SelectAgentDecision = typeof agentDecisions.$inferSelect;

// Intelligence Cycles (TRACK 2 BATCH 10-12)
export const insertIntelligenceCycleSchema = createInsertSchema(intelligenceCycles).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  cycleStartedAt: true,
  cycleCompletedAt: true,
  failedAt: true
});
export type InsertIntelligenceCycle = z.infer<typeof insertIntelligenceCycleSchema>;
export type SelectIntelligenceCycle = typeof intelligenceCycles.$inferSelect;

// ============================================================================
// MULTI-AI ORCHESTRATION SYSTEM (BATCH 7)
// 5 AI Platforms: OpenAI | Claude | Groq | Gemini | OpenRouter
// ============================================================================

/**
 * AI Requests Table - Complete request tracking with platform/model/cost
 * Tracks every AI API call across all 5 platforms with full cost attribution
 * Enables FinOps cost tracking and performance analysis
 * 
 * Platforms supported:
 * - OpenAI (GPT-4o, GPT-4o-mini)
 * - Anthropic (Claude Sonnet, Haiku, Opus)
 * - Groq (Llama 3.1 70B, 8B) - FREE
 * - Gemini (Flash, Flash-lite, Pro)
 * - OpenRouter (Multi-model gateway)
 */
export const aiRequests = pgTable("ai_requests", {
  id: serial("id").primaryKey(),
  
  // Request identification
  userId: integer("user_id").references(() => users.id),
  agentId: varchar("agent_id", { length: 50 }),
  sessionId: varchar("session_id", { length: 100 }),
  conversationId: varchar("conversation_id", { length: 100 }),
  requestId: varchar("request_id", { length: 100 }).unique(),
  
  // Platform & Model
  platform: varchar("platform", { length: 20 }).notNull(), // openai, anthropic, groq, gemini, openrouter
  model: varchar("model", { length: 100 }).notNull(), // gpt-4o, claude-3-5-sonnet, etc
  
  // Request Details
  useCase: varchar("use_case", { length: 50 }), // chat, code, analysis, bulk, reasoning
  priority: varchar("priority", { length: 20 }), // speed, cost, quality, balanced
  prompt: text("prompt").notNull(),
  systemPrompt: text("system_prompt"),
  
  // Request Parameters
  temperature: real("temperature"),
  maxTokens: integer("max_tokens"),
  topP: real("top_p"),
  
  // Response
  response: text("response"),
  responseTime: integer("response_time"), // milliseconds
  
  // Token Usage
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  
  // Cost Calculation (per 1M tokens pricing)
  inputCostPerMillion: numeric("input_cost_per_million", { precision: 10, scale: 2 }), // e.g., 3.00 for GPT-4o
  outputCostPerMillion: numeric("output_cost_per_million", { precision: 10, scale: 2 }), // e.g., 10.00 for GPT-4o
  totalCost: numeric("total_cost", { precision: 10, scale: 6 }).notNull().default("0"), // Actual cost in USD
  
  // Cache Status
  cacheHit: boolean("cache_hit").default(false),
  cacheKey: varchar("cache_key", { length: 100 }),
  cacheTtl: integer("cache_ttl"), // seconds
  
  // Fallback Chain
  attemptNumber: integer("attempt_number").default(1), // 1 = primary, 2 = first fallback, etc
  fallbackReason: varchar("fallback_reason", { length: 100 }), // rate_limit, error, circuit_open
  originalPlatform: varchar("original_platform", { length: 20 }), // If fallback was used
  
  // Performance
  latencyMs: integer("latency_ms").notNull(),
  ttfbMs: integer("ttfb_ms"), // Time to first byte
  tokensPerSecond: real("tokens_per_second"),
  
  // Status
  status: varchar("status", { length: 20 }).notNull().default("success"), // success, error, timeout, rate_limited
  errorMessage: text("error_message"),
  errorCode: varchar("error_code", { length: 50 }),
  
  // Context
  endpoint: varchar("endpoint", { length: 255 }), // Which API endpoint called this
  userAgent: varchar("user_agent", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  
  // Metadata
  metadata: jsonb("metadata"), // Additional platform-specific data
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Performance indexes
  platformIdx: index("ai_requests_platform_idx").on(table.platform),
  modelIdx: index("ai_requests_model_idx").on(table.model),
  userIdx: index("ai_requests_user_idx").on(table.userId),
  agentIdx: index("ai_requests_agent_idx").on(table.agentId),
  sessionIdx: index("ai_requests_session_idx").on(table.sessionId),
  conversationIdx: index("ai_requests_conversation_idx").on(table.conversationId),
  createdAtIdx: index("ai_requests_created_at_idx").on(table.createdAt),
  statusIdx: index("ai_requests_status_idx").on(table.status),
  cacheHitIdx: index("ai_requests_cache_hit_idx").on(table.cacheHit),
  
  // Cost analysis indexes
  platformModelIdx: index("ai_requests_platform_model_idx").on(table.platform, table.model),
  costIdx: index("ai_requests_cost_idx").on(table.totalCost),
  useCaseIdx: index("ai_requests_use_case_idx").on(table.useCase),
  
  // Composite indexes for common queries
  userCostIdx: index("ai_requests_user_cost_idx").on(table.userId, table.totalCost, table.createdAt),
  platformCostIdx: index("ai_requests_platform_cost_idx").on(table.platform, table.totalCost, table.createdAt),
}));

/**
 * AI Costs Table - Aggregated cost tracking per platform/model
 * Pre-computed daily cost summaries for fast FinOps dashboard queries
 * Reduces need to aggregate aiRequests table on every query
 */
export const aiCosts = pgTable("ai_costs", {
  id: serial("id").primaryKey(),
  
  // Time period
  date: timestamp("date").notNull(), // Date of aggregation (daily)
  hour: integer("hour"), // Optional hourly breakdown (0-23)
  
  // Platform & Model
  platform: varchar("platform", { length: 20 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  
  // Aggregated metrics
  requestCount: integer("request_count").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  cacheHitCount: integer("cache_hit_count").notNull().default(0),
  
  // Token totals
  totalInputTokens: integer("total_input_tokens").notNull().default(0),
  totalOutputTokens: integer("total_output_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  
  // Cost totals
  totalCost: numeric("total_cost", { precision: 10, scale: 6 }).notNull().default("0"),
  avgCostPerRequest: numeric("avg_cost_per_request", { precision: 10, scale: 6 }),
  
  // Performance
  avgLatencyMs: integer("avg_latency_ms"),
  p95LatencyMs: integer("p95_latency_ms"),
  p99LatencyMs: integer("p99_latency_ms"),
  avgTokensPerSecond: real("avg_tokens_per_second"),
  
  // Cache efficiency
  cacheHitRate: real("cache_hit_rate"), // Percentage (0-100)
  cacheSavings: numeric("cache_savings", { precision: 10, scale: 6 }), // Cost saved by cache hits
  
  // By use case
  chatRequests: integer("chat_requests").default(0),
  codeRequests: integer("code_requests").default(0),
  analysisRequests: integer("analysis_requests").default(0),
  bulkRequests: integer("bulk_requests").default(0),
  reasoningRequests: integer("reasoning_requests").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  dateIdx: index("ai_costs_date_idx").on(table.date),
  platformIdx: index("ai_costs_platform_idx").on(table.platform),
  modelIdx: index("ai_costs_model_idx").on(table.model),
  platformModelDateIdx: index("ai_costs_platform_model_date_idx").on(table.platform, table.model, table.date),
  uniqueCostEntry: uniqueIndex("unique_cost_entry").on(table.date, table.platform, table.model, table.hour),
}));

/**
 * AI Cache Table - Semantic cache with prompt embeddings
 * Stores AI responses keyed by normalized prompts to avoid duplicate API calls
 * Uses embeddings for semantic similarity matching (optional feature)
 * 
 * Cache Strategy:
 * - Exact match: Hash-based lookup (fastest)
 * - Semantic match: Vector similarity search (optional)
 * - TTL: 24 hours default, configurable per use case
 */
export const aiCache = pgTable("ai_cache", {
  id: serial("id").primaryKey(),
  
  // Cache key (SHA-256 hash of normalized prompt + model + params)
  cacheKey: varchar("cache_key", { length: 100 }).notNull().unique(),
  
  // Original request
  platform: varchar("platform", { length: 20 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  prompt: text("prompt").notNull(),
  normalizedPrompt: text("normalized_prompt").notNull(), // Lowercase, trimmed
  systemPrompt: text("system_prompt"),
  
  // Request parameters (part of cache key)
  temperature: real("temperature"),
  maxTokens: integer("max_tokens"),
  
  // Cached response
  response: text("response").notNull(),
  
  // Original metadata (from first request)
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  totalCost: numeric("total_cost", { precision: 10, scale: 6 }).notNull(),
  originalLatencyMs: integer("original_latency_ms"),
  
  // Cache statistics
  hitCount: integer("hit_count").notNull().default(0),
  lastHitAt: timestamp("last_hit_at"),
  totalSavings: numeric("total_savings", { precision: 10, scale: 6 }).default("0"), // Cost saved by cache hits
  
  // Semantic search (optional)
  embedding: real("embedding").array(), // Vector embedding for semantic similarity
  embeddingModel: varchar("embedding_model", { length: 50 }), // e.g., text-embedding-ada-002
  
  // TTL & Expiration
  ttl: integer("ttl").notNull().default(86400), // Time-to-live in seconds (default 24h)
  expiresAt: timestamp("expires_at").notNull(),
  
  // Metadata
  useCase: varchar("use_case", { length: 50 }),
  tags: text("tags").array(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  cacheKeyIdx: index("ai_cache_cache_key_idx").on(table.cacheKey),
  platformModelIdx: index("ai_cache_platform_model_idx").on(table.platform, table.model),
  expiresAtIdx: index("ai_cache_expires_at_idx").on(table.expiresAt),
  hitCountIdx: index("ai_cache_hit_count_idx").on(table.hitCount),
  useCaseIdx: index("ai_cache_use_case_idx").on(table.useCase),
  createdAtIdx: index("ai_cache_created_at_idx").on(table.createdAt),
}));

/**
 * AI Rate Limits Table - Token bucket rate limiting state
 * Tracks current token bucket state for each platform/model combination
 * Implements token bucket algorithm to prevent API rate limit violations
 * 
 * Platform Rate Limits:
 * - OpenAI GPT-4o: 500 RPM, 30k TPM
 * - Claude Sonnet: 50 RPM, 40k TPM
 * - Groq Llama 70B: 30 RPM, 14.4k TPM (FREE)
 * - Gemini Flash: 1000 RPM, 4M TPM
 */
export const aiRateLimits = pgTable("ai_rate_limits", {
  id: serial("id").primaryKey(),
  
  // Platform & Model
  platform: varchar("platform", { length: 20 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  
  // Token Bucket State
  currentTokens: real("current_tokens").notNull(), // Current tokens in bucket
  capacity: integer("capacity").notNull(), // Maximum tokens (RPM limit)
  refillRate: real("refill_rate").notNull(), // Tokens per second (capacity / 60)
  lastRefill: timestamp("last_refill").notNull(), // Last refill timestamp
  
  // Rate Limit Configuration
  requestsPerMinute: integer("requests_per_minute").notNull(), // RPM limit
  tokensPerMinute: integer("tokens_per_minute"), // TPM limit (optional)
  requestsPerDay: integer("requests_per_day"), // RPD limit (optional)
  
  // Usage Tracking
  requestsToday: integer("requests_today").default(0),
  tokensToday: integer("tokens_today").default(0),
  lastDailyReset: timestamp("last_daily_reset"),
  
  // Violation Tracking
  violationCount: integer("violation_count").default(0), // How many times rate limit hit
  lastViolation: timestamp("last_violation"),
  consecutiveViolations: integer("consecutive_violations").default(0),
  
  // Status
  isThrottled: boolean("is_throttled").default(false),
  throttledUntil: timestamp("throttled_until"),
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  platformModelIdx: uniqueIndex("ai_rate_limits_platform_model_idx").on(table.platform, table.model),
  throttledIdx: index("ai_rate_limits_throttled_idx").on(table.isThrottled),
}));

/**
 * AI Circuit Breakers Table - Circuit breaker state for platform resilience
 * Implements circuit breaker pattern to prevent cascading failures
 * Automatically opens circuit after repeated failures, closes after recovery
 * 
 * States:
 * - CLOSED: Normal operation, requests flowing
 * - OPEN: Too many failures, blocking requests temporarily
 * - HALF_OPEN: Testing if service recovered, allowing limited requests
 */
export const aiCircuitBreakers = pgTable("ai_circuit_breakers", {
  id: serial("id").primaryKey(),
  
  // Platform & Model
  platform: varchar("platform", { length: 20 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  
  // Circuit State
  state: varchar("state", { length: 20 }).notNull().default("closed"), // closed, open, half_open
  
  // Failure Tracking
  failureCount: integer("failure_count").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  consecutiveFailures: integer("consecutive_failures").notNull().default(0),
  
  // Thresholds
  failureThreshold: integer("failure_threshold").notNull().default(5), // Open after 5 failures
  successThreshold: integer("success_threshold").notNull().default(2), // Close after 2 successes
  timeout: integer("timeout").notNull().default(60000), // Milliseconds before half-open (60s)
  
  // Timing
  lastFailure: timestamp("last_failure"),
  lastSuccess: timestamp("last_success"),
  openedAt: timestamp("opened_at"), // When circuit opened
  halfOpenAt: timestamp("half_open_at"), // When circuit entered half-open
  closedAt: timestamp("closed_at"), // When circuit closed
  nextAttemptAt: timestamp("next_attempt_at"), // When to try half-open
  
  // Error Analysis
  lastErrorMessage: text("last_error_message"),
  lastErrorCode: varchar("last_error_code", { length: 50 }),
  errorTypes: jsonb("error_types"), // Categorized error counts
  
  // Performance Impact
  blockedRequests: integer("blocked_requests").default(0), // Requests blocked while open
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  platformModelIdx: uniqueIndex("ai_circuit_breakers_platform_model_idx").on(table.platform, table.model),
  stateIdx: index("ai_circuit_breakers_state_idx").on(table.state),
  nextAttemptIdx: index("ai_circuit_breakers_next_attempt_idx").on(table.nextAttemptAt),
}));

/**
 * AI Blackboard Table - Agent shared memory for multi-AI coordination
 * Implements blackboard architectural pattern for collaborative AI analysis
 * Enables multiple AI agents to read/write shared insights
 * 
 * Use Cases:
 * - Code review: GPT-4o (structure) → Claude (security) → Gemini (performance)
 * - Multi-perspective analysis: Different models contribute domain expertise
 * - Consensus building: Synthesize insights from multiple AI sources
 */
export const aiBlackboard = pgTable("ai_blackboard", {
  id: serial("id").primaryKey(),
  
  // Session identification
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  taskType: varchar("task_type", { length: 50 }).notNull(), // code_review, analysis, synthesis
  
  // Agent contribution
  agentId: varchar("agent_id", { length: 50 }).notNull(), // GPT-4o, Claude, Gemini, etc
  platform: varchar("platform", { length: 20 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  
  // Insight data
  insight: text("insight").notNull(), // The agent's contribution
  confidence: real("confidence"), // Agent's confidence score (0-1)
  priority: integer("priority").default(5), // 1-10 importance ranking
  
  // Relationships
  relatedTo: text("related_to").array(), // IDs of other insights this builds on
  supersedes: text("supersedes").array(), // IDs of insights this replaces/improves
  
  // Context
  contextData: jsonb("context_data"), // Additional structured data
  tags: text("tags").array(),
  
  // Metadata
  tokensCost: integer("tokens_cost"), // Tokens used to generate this insight
  latencyMs: integer("latency_ms"),
  
  // Lifecycle
  isActive: boolean("is_active").default(true),
  isSynthesized: boolean("is_synthesized").default(false), // Used in final synthesis
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Optional TTL for session cleanup
}, (table) => ({
  sessionIdx: index("ai_blackboard_session_idx").on(table.sessionId),
  agentIdx: index("ai_blackboard_agent_idx").on(table.agentId),
  taskTypeIdx: index("ai_blackboard_task_type_idx").on(table.taskType),
  platformIdx: index("ai_blackboard_platform_idx").on(table.platform),
  createdAtIdx: index("ai_blackboard_created_at_idx").on(table.createdAt),
  activeIdx: index("ai_blackboard_active_idx").on(table.isActive),
  sessionTaskIdx: index("ai_blackboard_session_task_idx").on(table.sessionId, table.taskType),
}));

/**
 * AI Performance Table - Platform performance metrics and health monitoring
 * Tracks real-world performance of each AI platform/model combination
 * Used for intelligent routing decisions and SLA monitoring
 * 
 * Metrics tracked:
 * - Latency: Response time distribution (p50, p95, p99)
 * - Availability: Success rate and uptime
 * - Quality: Error rates and types
 * - Cost: Actual vs expected pricing
 */
export const aiPerformance = pgTable("ai_performance", {
  id: serial("id").primaryKey(),
  
  // Platform & Model
  platform: varchar("platform", { length: 20 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  
  // Time window
  windowStart: timestamp("window_start").notNull(),
  windowEnd: timestamp("window_end").notNull(),
  windowSize: integer("window_size").notNull().default(3600), // seconds (1 hour default)
  
  // Request volume
  totalRequests: integer("total_requests").notNull().default(0),
  successfulRequests: integer("successful_requests").notNull().default(0),
  failedRequests: integer("failed_requests").notNull().default(0),
  cachedRequests: integer("cached_requests").notNull().default(0),
  
  // Latency metrics (milliseconds)
  avgLatency: integer("avg_latency"),
  medianLatency: integer("median_latency"),
  p95Latency: integer("p95_latency"),
  p99Latency: integer("p99_latency"),
  minLatency: integer("min_latency"),
  maxLatency: integer("max_latency"),
  
  // Throughput
  avgTokensPerSecond: real("avg_tokens_per_second"),
  peakTokensPerSecond: real("peak_tokens_per_second"),
  
  // Reliability
  successRate: real("success_rate"), // Percentage (0-100)
  errorRate: real("error_rate"), // Percentage (0-100)
  timeoutRate: real("timeout_rate"), // Percentage (0-100)
  
  // Error breakdown
  rateLimitErrors: integer("rate_limit_errors").default(0),
  authErrors: integer("auth_errors").default(0),
  serverErrors: integer("server_errors").default(0),
  networkErrors: integer("network_errors").default(0),
  otherErrors: integer("other_errors").default(0),
  
  // Cost efficiency
  totalCost: numeric("total_cost", { precision: 10, scale: 6 }),
  costPerRequest: numeric("cost_per_request", { precision: 10, scale: 6 }),
  costPer1kTokens: numeric("cost_per_1k_tokens", { precision: 10, scale: 6 }),
  
  // Quality metrics
  avgInputTokens: integer("avg_input_tokens"),
  avgOutputTokens: integer("avg_output_tokens"),
  avgTotalTokens: integer("avg_total_tokens"),
  
  // SLA compliance
  slaTarget: integer("sla_target"), // Target latency in ms
  slaViolations: integer("sla_violations").default(0),
  slaComplianceRate: real("sla_compliance_rate"), // Percentage (0-100)
  
  // Health score (0-100 composite metric)
  healthScore: integer("health_score"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  platformModelIdx: index("ai_performance_platform_model_idx").on(table.platform, table.model),
  windowStartIdx: index("ai_performance_window_start_idx").on(table.windowStart),
  healthScoreIdx: index("ai_performance_health_score_idx").on(table.healthScore),
  platformWindowIdx: index("ai_performance_platform_window_idx").on(table.platform, table.windowStart),
  uniqueWindow: uniqueIndex("unique_performance_window").on(table.platform, table.model, table.windowStart),
}));

// ============================================================================
// MULTI-AI ORCHESTRATION ZOD SCHEMAS & TYPES
// ============================================================================

// AI Requests
export const insertAIRequestSchema = createInsertSchema(aiRequests).omit({ id: true, createdAt: true });
export type InsertAIRequest = z.infer<typeof insertAIRequestSchema>;
export type SelectAIRequest = typeof aiRequests.$inferSelect;

// AI Costs
export const insertAICostSchema = createInsertSchema(aiCosts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAICost = z.infer<typeof insertAICostSchema>;
export type SelectAICost = typeof aiCosts.$inferSelect;

// AI Cache
export const insertAICacheSchema = createInsertSchema(aiCache).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAICache = z.infer<typeof insertAICacheSchema>;
export type SelectAICache = typeof aiCache.$inferSelect;

// AI Rate Limits
export const insertAIRateLimitSchema = createInsertSchema(aiRateLimits).omit({ id: true, updatedAt: true });
export type InsertAIRateLimit = z.infer<typeof insertAIRateLimitSchema>;
export type SelectAIRateLimit = typeof aiRateLimits.$inferSelect;

// AI Circuit Breakers
export const insertAICircuitBreakerSchema = createInsertSchema(aiCircuitBreakers).omit({ id: true, updatedAt: true });
export type InsertAICircuitBreaker = z.infer<typeof insertAICircuitBreakerSchema>;
export type SelectAICircuitBreaker = typeof aiCircuitBreakers.$inferSelect;

// AI Blackboard
export const insertAIBlackboardSchema = createInsertSchema(aiBlackboard).omit({ id: true, createdAt: true });
export type InsertAIBlackboard = z.infer<typeof insertAIBlackboardSchema>;
export type SelectAIBlackboard = typeof aiBlackboard.$inferSelect;

// AI Performance
export const insertAIPerformanceSchema = createInsertSchema(aiPerformance).omit({ id: true, createdAt: true });
export type InsertAIPerformance = z.infer<typeof insertAIPerformanceSchema>;
export type SelectAIPerformance = typeof aiPerformance.$inferSelect;

// ============================================================================
// AI ARBITRAGE SYSTEM - Intelligent Routing & Cost Optimization
// ============================================================================

/**
 * Routing Decisions Table - Track all AI routing decisions for analysis and DPO training
 * Stores: query classification, model selection, performance metrics, user feedback
 */
export const routingDecisions = pgTable("routing_decisions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Query details
  query: text("query").notNull(),
  context: text("context"),
  
  // Classification results
  classification: jsonb("classification").notNull(), // { complexity, domain, requiredQuality, estimatedTokens }
  
  // Model selection
  modelUsed: varchar("model_used", { length: 100 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  tierUsed: integer("tier_used").notNull(), // 1 (cheapest), 2 (mid), 3 (premium)
  
  // Performance metrics
  cost: numeric("cost", { precision: 10, scale: 6 }).notNull(),
  latency: integer("latency").notNull(), // milliseconds
  confidence: numeric("confidence", { precision: 5, scale: 4 }), // 0.0000-1.0000
  quality: numeric("quality", { precision: 5, scale: 4 }), // 0.0000-1.0000
  
  // Cascade execution
  escalated: boolean("escalated").default(false),
  escalationReason: text("escalation_reason"),
  previousTiersAttempted: jsonb("previous_tiers_attempted"), // [{ tier, model, reason }]
  
  // User feedback (for DPO training)
  userFeedback: varchar("user_feedback", { length: 20 }), // thumbs_up, thumbs_down, neutral
  feedbackComment: text("feedback_comment"),
  
  // Cost savings vs premium model
  savingsAmount: numeric("savings_amount", { precision: 10, scale: 6 }),
  savingsPercentage: numeric("savings_percentage", { precision: 5, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("routing_decisions_user_idx").on(table.userId),
  platformModelIdx: index("routing_decisions_platform_model_idx").on(table.platform, table.modelUsed),
  tierIdx: index("routing_decisions_tier_idx").on(table.tierUsed),
  createdAtIdx: index("routing_decisions_created_at_idx").on(table.createdAt),
  userFeedbackIdx: index("routing_decisions_user_feedback_idx").on(table.userFeedback),
  escalatedIdx: index("routing_decisions_escalated_idx").on(table.escalated),
}));

/**
 * AI Spend Tracking Table - Real-time spend tracking per user and platform
 * Enables budget enforcement, cost analytics, and billing
 */
export const aiSpendTracking = pgTable("ai_spend_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Platform & Model
  platform: varchar("platform", { length: 50 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  
  // Usage metrics
  cost: numeric("cost", { precision: 10, scale: 6 }).notNull(),
  tokens: integer("tokens").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  
  // Request details
  requestType: varchar("request_type", { length: 50 }), // chat, code, reasoning, bulk
  useCase: varchar("use_case", { length: 100 }), // mr_blue_chat, vibe_coding, etc
  
  // Billing period
  billingMonth: varchar("billing_month", { length: 7 }).notNull(), // YYYY-MM
  
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("ai_spend_tracking_user_idx").on(table.userId),
  platformModelIdx: index("ai_spend_tracking_platform_model_idx").on(table.platform, table.model),
  billingMonthIdx: index("ai_spend_tracking_billing_month_idx").on(table.billingMonth),
  userBillingIdx: index("ai_spend_tracking_user_billing_idx").on(table.userId, table.billingMonth),
  timestampIdx: index("ai_spend_tracking_timestamp_idx").on(table.timestamp),
}));

/**
 * Cost Budgets Table - Define monthly spending limits per user tier
 * Used for budget enforcement and threshold alerting
 */
export const costBudgets = pgTable("cost_budgets", {
  id: serial("id").primaryKey(),
  
  // Tier definition
  tier: varchar("tier", { length: 50 }).notNull().unique(), // free, basic, pro, enterprise
  
  // Budget limits
  monthlyLimit: numeric("monthly_limit", { precision: 10, scale: 2 }).notNull(), // USD
  alertThreshold: numeric("alert_threshold", { precision: 5, scale: 2 }).notNull(), // Percentage 0.00-100.00
  
  // Per-request limits (optional)
  maxCostPerRequest: numeric("max_cost_per_request", { precision: 10, scale: 6 }),
  maxTokensPerRequest: integer("max_tokens_per_request"),
  
  // Rate limits
  maxRequestsPerMinute: integer("max_requests_per_minute"),
  maxRequestsPerDay: integer("max_requests_per_day"),
  
  // Features
  allowPremiumModels: boolean("allow_premium_models").default(false),
  allowCascadeEscalation: boolean("allow_cascade_escalation").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tierIdx: uniqueIndex("cost_budgets_tier_idx").on(table.tier),
}));

// AI Arbitrage Zod Schemas & Types
export const insertRoutingDecisionSchema = createInsertSchema(routingDecisions).omit({ id: true, createdAt: true });
export type InsertRoutingDecision = z.infer<typeof insertRoutingDecisionSchema>;
export type SelectRoutingDecision = typeof routingDecisions.$inferSelect;

export const insertAISpendTrackingSchema = createInsertSchema(aiSpendTracking).omit({ id: true, timestamp: true });
export type InsertAISpendTracking = z.infer<typeof insertAISpendTrackingSchema>;
export type SelectAISpendTracking = typeof aiSpendTracking.$inferSelect;

export const insertCostBudgetSchema = createInsertSchema(costBudgets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCostBudget = z.infer<typeof insertCostBudgetSchema>;
export type SelectCostBudget = typeof costBudgets.$inferSelect;

/**
 * Budget Alerts Table - Real-time budget warning history
 * Stores alerts sent to users when approaching/exceeding budget limits
 */
export const budgetAlerts = pgTable("budget_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Alert details
  alertType: varchar("alert_type", { length: 50 }).notNull(), // budget-warning (80%), budget-critical (95%), budget-exceeded (100%)
  threshold: numeric("threshold", { precision: 5, scale: 2 }).notNull(), // Percentage 0.00-100.00
  
  // Budget status at alert time
  currentSpend: numeric("current_spend", { precision: 10, scale: 6 }).notNull(),
  monthlyLimit: numeric("monthly_limit", { precision: 10, scale: 2 }).notNull(),
  percentageUsed: numeric("percentage_used", { precision: 5, scale: 2 }).notNull(),
  
  // Billing period
  billingMonth: varchar("billing_month", { length: 7 }).notNull(), // YYYY-MM
  
  // Notification delivery
  notificationSent: boolean("notification_sent").default(false),
  notificationMethod: varchar("notification_method", { length: 20 }), // websocket, email, push
  
  // User response tracking
  acknowledged: boolean("acknowledged").default(false),
  acknowledgedAt: timestamp("acknowledged_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("budget_alerts_user_idx").on(table.userId),
  alertTypeIdx: index("budget_alerts_type_idx").on(table.alertType),
  billingMonthIdx: index("budget_alerts_billing_month_idx").on(table.billingMonth),
  userBillingIdx: index("budget_alerts_user_billing_idx").on(table.userId, table.billingMonth),
  createdAtIdx: index("budget_alerts_created_at_idx").on(table.createdAt),
}));

export const insertBudgetAlertSchema = createInsertSchema(budgetAlerts).omit({ id: true, createdAt: true });
export type InsertBudgetAlert = z.infer<typeof insertBudgetAlertSchema>;
export type SelectBudgetAlert = typeof budgetAlerts.$inferSelect;

// ============================================================================
// AI LEARNING SYSTEMS (DPO, Curriculum, GEPA, LIMI)
// ============================================================================

/**
 * DPO Training Data - Direct Preference Optimization
 * Stores (CHOSEN, REJECTED) pairs for training TaskClassifier
 */
export const dpoTrainingData = pgTable("dpo_training_data", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  chosenModel: varchar("chosen_model", { length: 100 }).notNull(),
  chosenCost: numeric("chosen_cost", { precision: 10, scale: 6 }).notNull(),
  rejectedModel: varchar("rejected_model", { length: 100 }).notNull(),
  rejectedCost: numeric("rejected_cost", { precision: 10, scale: 6 }).notNull(),
  qualityDelta: numeric("quality_delta", { precision: 5, scale: 4 }),
  domain: varchar("domain", { length: 50 }), // chat, code, reasoning, etc
  complexity: numeric("complexity", { precision: 5, scale: 4 }), // 0-1 score
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  domainIdx: index("dpo_training_data_domain_idx").on(table.domain),
  createdAtIdx: index("dpo_training_data_created_at_idx").on(table.createdAt),
}));

/**
 * Curriculum Levels - Progressive difficulty scaling per user
 * Tracks user progression: basic → intermediate → advanced → expert
 */
export const curriculumLevels = pgTable("curriculum_levels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  level: varchar("level", { length: 50 }).notNull().default("basic"), // basic, intermediate, advanced, expert
  successRate: numeric("success_rate", { precision: 5, scale: 4 }).default("0"), // 0-1 score
  taskCount: integer("task_count").default(0).notNull(),
  consecutiveSuccesses: integer("consecutive_successes").default(0).notNull(),
  consecutiveFailures: integer("consecutive_failures").default(0).notNull(),
  lastPromotionAt: timestamp("last_promotion_at"),
  lastDemotionAt: timestamp("last_demotion_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("curriculum_levels_user_idx").on(table.userId),
  levelIdx: index("curriculum_levels_level_idx").on(table.level),
  successRateIdx: index("curriculum_levels_success_rate_idx").on(table.successRate),
}));

/**
 * GEPA Experiments - Self-evolution experiments
 * Stores proposed improvements and A/B test results
 */
export const gepaExperiments = pgTable("gepa_experiments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  hypothesis: text("hypothesis").notNull(),
  config: jsonb("config").notNull(), // { strategy, parameters, constraints }
  results: jsonb("results"), // { cost, quality, successRate, sampleSize }
  status: varchar("status", { length: 50 }).notNull().default("running"), // running, completed, adopted, rejected
  controlGroup: jsonb("control_group"), // Baseline performance metrics
  experimentGroup: jsonb("experiment_group"), // Test performance metrics
  trafficPercentage: integer("traffic_percentage").default(10), // % of traffic for A/B test
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("gepa_experiments_status_idx").on(table.status),
  createdAtIdx: index("gepa_experiments_created_at_idx").on(table.createdAt),
}));

/**
 * Golden Examples - Curated routing examples for training
 * 78 high-quality, diverse, cost-effective examples for DPO training
 */
export const goldenExamples = pgTable("golden_examples", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  classification: jsonb("classification").notNull(), // { complexity, domain, requiredQuality }
  modelUsed: varchar("model_used", { length: 100 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  cost: numeric("cost", { precision: 10, scale: 6 }).notNull(),
  quality: numeric("quality", { precision: 5, scale: 4 }).notNull(), // 0-1 score
  savingsPercentage: numeric("savings_percentage", { precision: 5, scale: 2 }), // vs premium model
  reasoning: text("reasoning"), // Why this is a golden example
  tags: text("tags").array(), // [edge_case, cost_effective, high_quality, diverse]
  userRating: integer("user_rating"), // 1-5 stars
  domain: varchar("domain", { length: 50 }), // For diversity tracking
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  domainIdx: index("golden_examples_domain_idx").on(table.domain),
  qualityIdx: index("golden_examples_quality_idx").on(table.quality),
  tagsIdx: index("golden_examples_tags_idx").on(table.tags),
  createdAtIdx: index("golden_examples_created_at_idx").on(table.createdAt),
}));

// AI Learning Zod Schemas & Types
export const insertDpoTrainingDataSchema = createInsertSchema(dpoTrainingData).omit({ id: true, createdAt: true });
export type InsertDpoTrainingData = z.infer<typeof insertDpoTrainingDataSchema>;
export type SelectDpoTrainingData = typeof dpoTrainingData.$inferSelect;

export const insertCurriculumLevelSchema = createInsertSchema(curriculumLevels).omit({ id: true, updatedAt: true });
export type InsertCurriculumLevel = z.infer<typeof insertCurriculumLevelSchema>;
export type SelectCurriculumLevel = typeof curriculumLevels.$inferSelect;

export const insertGepaExperimentSchema = createInsertSchema(gepaExperiments).omit({ id: true, createdAt: true, startedAt: true });
export type InsertGepaExperiment = z.infer<typeof insertGepaExperimentSchema>;
export type SelectGepaExperiment = typeof gepaExperiments.$inferSelect;

export const insertGoldenExampleSchema = createInsertSchema(goldenExamples).omit({ id: true, createdAt: true });
export type InsertGoldenExample = z.infer<typeof insertGoldenExampleSchema>;
export type SelectGoldenExample = typeof goldenExamples.$inferSelect;

// ============================================================================
// PROFILE MEDIA & ANALYTICS (BATCH 13-14)
// ============================================================================

/**
 * Profile Media Table - User portfolio/gallery media items
 * Stores photos and videos uploaded to user profiles
 * Separate from general media table - specifically for profile portfolios
 */
export const profileMedia = pgTable("profile_media", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Media details
  type: varchar("type", { length: 20 }).notNull(), // photo, video
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  
  // Metadata
  caption: text("caption"),
  altText: text("alt_text"),
  displayOrder: integer("display_order").default(0),
  
  // Media properties
  width: integer("width"),
  height: integer("height"),
  fileSize: integer("file_size"), // bytes
  mimeType: varchar("mime_type", { length: 100 }),
  
  // Organization
  category: varchar("category", { length: 50 }), // portfolio, performances, teaching, events
  tags: text("tags").array(),
  
  // Engagement
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  
  // Visibility
  isPublic: boolean("is_public").default(true),
  isFeatured: boolean("is_featured").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("profile_media_user_idx").on(table.userId),
  typeIdx: index("profile_media_type_idx").on(table.type),
  categoryIdx: index("profile_media_category_idx").on(table.category),
  orderIdx: index("profile_media_order_idx").on(table.userId, table.displayOrder),
  featuredIdx: index("profile_media_featured_idx").on(table.userId, table.isFeatured),
}));

/**
 * Profile Analytics Table - Profile view and engagement tracking
 * Tracks profile visits, engagement metrics, and professional inquiries
 * Privacy: Only profile owner can see detailed analytics
 */
export const profileAnalytics = pgTable("profile_analytics", {
  id: serial("id").primaryKey(),
  
  // Profile being viewed
  profileUserId: integer("profile_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Viewer (null for anonymous views)
  viewerUserId: integer("viewer_user_id").references(() => users.id, { onDelete: "set null" }),
  
  // View details
  viewDate: timestamp("view_date").defaultNow().notNull(),
  viewDuration: integer("view_duration"), // seconds
  
  // Source & Context
  referrerUrl: text("referrer_url"),
  sourceType: varchar("source_type", { length: 50 }), // search, direct, social, recommendation
  deviceType: varchar("device_type", { length: 20 }), // mobile, desktop, tablet
  
  // Engagement
  sectionsViewed: text("sections_viewed").array(), // about, photos, events, etc
  interactionType: varchar("interaction_type", { length: 50 }), // view, message, follow, booking_inquiry
  
  // Geographic
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  
  // Session tracking
  sessionId: varchar("session_id", { length: 100 }),
  isUniqueView: boolean("is_unique_view").default(true), // First view in 24h period
}, (table) => ({
  profileUserIdx: index("profile_analytics_profile_user_idx").on(table.profileUserId),
  viewerUserIdx: index("profile_analytics_viewer_user_idx").on(table.viewerUserId),
  viewDateIdx: index("profile_analytics_view_date_idx").on(table.viewDate),
  uniqueViewIdx: index("profile_analytics_unique_view_idx").on(table.isUniqueView),
  interactionIdx: index("profile_analytics_interaction_idx").on(table.interactionType),
  profileDateIdx: index("profile_analytics_profile_date_idx").on(table.profileUserId, table.viewDate),
}));

/**
 * Profile Inquiries Table - Contact/booking inquiries for business profiles
 * Tracks professional inquiries for teachers, venues, performers, etc.
 */
export const profileInquiries = pgTable("profile_inquiries", {
  id: serial("id").primaryKey(),
  
  // Target profile (teacher, venue, etc)
  profileUserId: integer("profile_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Inquirer
  inquirerUserId: integer("inquirer_user_id").references(() => users.id, { onDelete: "set null" }),
  inquirerName: varchar("inquirer_name", { length: 255 }),
  inquirerEmail: varchar("inquirer_email", { length: 255 }),
  inquirerPhone: varchar("inquirer_phone", { length: 50 }),
  
  // Inquiry details
  inquiryType: varchar("inquiry_type", { length: 50 }).notNull(), // lesson, booking, collaboration, event
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  
  // Event/service details (if applicable)
  preferredDate: timestamp("preferred_date"),
  eventType: varchar("event_type", { length: 100 }),
  numberOfPeople: integer("number_of_people"),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  
  // Status
  status: varchar("status", { length: 20 }).default("new"), // new, replied, accepted, declined, completed
  response: text("response"),
  respondedAt: timestamp("responded_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  profileUserIdx: index("profile_inquiries_profile_user_idx").on(table.profileUserId),
  inquirerUserIdx: index("profile_inquiries_inquirer_user_idx").on(table.inquirerUserId),
  statusIdx: index("profile_inquiries_status_idx").on(table.status),
  typeIdx: index("profile_inquiries_type_idx").on(table.inquiryType),
  createdAtIdx: index("profile_inquiries_created_at_idx").on(table.createdAt),
}));

/**
 * Travel Preferences Profile - User's travel style and preferences
 * Tracks travel history, preferences, and interests
 */
export const travelPreferencesProfiles = pgTable("travel_preferences_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Travel Style & Preferences
  travelStyle: text("travel_style").array(),
  accommodationPreferences: text("accommodation_preferences").array(),
  
  // Travel History
  totalCountriesVisited: integer("total_countries_visited").default(0),
  totalCitiesVisited: integer("total_cities_visited").default(0),
  tangoDestinationsVisited: text("tango_destinations_visited").array(),
  
  // Travel Patterns
  preferredTravelMonths: text("preferred_travel_months").array(),
  travelCompanions: varchar("travel_companions", { length: 100 }),
  typicalTripDuration: varchar("typical_trip_duration", { length: 100 }),
  budgetRange: varchar("budget_range", { length: 50 }),
  planningStyle: varchar("planning_style", { length: 100 }),
  
  // Interests & Languages
  travelInterests: text("travel_interests").array(),
  languagesSpoken: text("languages_spoken").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("travel_preferences_profiles_user_idx").on(table.userId),
}));

/**
 * Events Profile - User's event attendance and hosting history
 * Tracks event participation, hosting, and preferences
 */
export const eventsProfiles = pgTable("events_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Event Attendance
  totalEventsAttended: integer("total_events_attended").default(0),
  totalMilongasAttended: integer("total_milongas_attended").default(0),
  totalFestivalsAttended: integer("total_festivals_attended").default(0),
  totalWorkshopsAttended: integer("total_workshops_attended").default(0),
  
  // Event Hosting
  totalEventsHosted: integer("total_events_hosted").default(0),
  hostingTypes: text("hosting_types").array(),
  
  // Event Preferences
  preferredEventTypes: text("preferred_event_types").array(),
  preferredEventSizes: text("preferred_event_sizes").array(),
  preferredDays: text("preferred_days").array(),
  preferredTimes: text("preferred_times").array(),
  
  // Event Activity Patterns
  averageEventsPerMonth: integer("average_events_per_month").default(0),
  mostActiveCity: varchar("most_active_city", { length: 255 }),
  
  // Reliability
  rsvpReliability: numeric("rsvp_reliability", { precision: 5, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("events_profiles_user_idx").on(table.userId),
  attendanceIdx: index("events_profiles_attendance_idx").on(table.totalEventsAttended),
}));

/**
 * Friends/Network Profile - User's social network and connections
 * Tracks friendships, followers, and network statistics
 */
export const friendsNetworkProfiles = pgTable("friends_network_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Network Size
  totalFriends: integer("total_friends").default(0),
  totalFollowers: integer("total_followers").default(0),
  totalFollowing: integer("total_following").default(0),
  
  // Dance Partners
  dancePartners: integer("dance_partners").default(0),
  regularPartners: integer("regular_partners").default(0),
  totalEndorsements: integer("total_endorsements").default(0),
  
  // Network Composition
  leadersConnected: integer("leaders_connected").default(0),
  followersConnected: integer("followers_connected").default(0),
  teachersConnected: integer("teachers_connected").default(0),
  organizersConnected: integer("organizers_connected").default(0),
  djsConnected: integer("djs_connected").default(0),
  
  // Growth Metrics
  newConnectionsThisMonth: integer("new_connections_this_month").default(0),
  newConnectionsThisYear: integer("new_connections_this_year").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("friends_network_profiles_user_idx").on(table.userId),
  friendsIdx: index("friends_network_profiles_friends_idx").on(table.totalFriends),
}));

/**
 * Photos/Media Gallery Profile - User's media library and statistics
 * Tracks photos, videos, albums, and engagement
 */
export const photosMediaGalleryProfiles = pgTable("photos_media_gallery_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Media Counts
  totalPhotos: integer("total_photos").default(0),
  totalVideos: integer("total_videos").default(0),
  totalAlbums: integer("total_albums").default(0),
  
  // Engagement
  totalViews: integer("total_views").default(0),
  totalLikes: integer("total_likes").default(0),
  totalShares: integer("total_shares").default(0),
  totalTags: integer("total_tags").default(0),
  
  // Featured Content
  featuredPhoto: text("featured_photo"),
  featuredVideo: text("featured_video"),
  featuredAlbum: integer("featured_album"),
  mostViewedPhoto: text("most_viewed_photo"),
  mostLikedPhoto: text("most_liked_photo"),
  
  // Activity Metrics
  uploadsThisMonth: integer("uploads_this_month").default(0),
  uploadsThisYear: integer("uploads_this_year").default(0),
  totalStorageUsed: integer("total_storage_used").default(0),
  
  // Privacy Settings
  defaultPhotoVisibility: varchar("default_photo_visibility", { length: 20 }).default("public"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("photos_media_gallery_profiles_user_idx").on(table.userId),
  photosIdx: index("photos_media_gallery_profiles_photos_idx").on(table.totalPhotos),
}));

/**
 * About/Bio Extended Profile - Detailed user biography and background
 * Comprehensive information about the user's tango journey and life
 */
export const aboutBioExtendedProfiles = pgTable("about_bio_extended_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Biography
  fullBio: text("full_bio"),
  tangoJourneyStory: text("tango_journey_story"),
  inspirations: text("inspirations"),
  dancingPhilosophy: text("dancing_philosophy"),
  
  // Influences & Favorites
  favoriteTeachers: text("favorite_teachers").array(),
  favoriteDancers: text("favorite_dancers").array(),
  musicalInfluences: text("musical_influences").array(),
  
  // Interests & Background
  hobbies: text("hobbies").array(),
  otherDances: text("other_dances").array(),
  languages: text("languages").array(),
  profession: varchar("profession", { length: 255 }),
  education: text("education"),
  interests: text("interests").array(),
  
  // Personal Touch
  favoriteQuote: text("favorite_quote"),
  
  // Media Highlights
  photoGallery: text("photo_gallery").array(),
  videoHighlights: text("video_highlights").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("about_bio_extended_profiles_user_idx").on(table.userId),
}));

/**
 * Feed/Activity Profile - User's social feed and activity settings
 * Posts, interactions, visibility
 */
export const feedActivityProfiles = pgTable("feed_activity_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Posting Activity
  totalPosts: integer("total_posts").default(0),
  totalPhotoPosts: integer("total_photo_posts").default(0),
  totalVideoPosts: integer("total_video_posts").default(0),
  totalTextPosts: integer("total_text_posts").default(0),
  totalShares: integer("total_shares").default(0),
  
  // Engagement Received
  totalLikesReceived: integer("total_likes_received").default(0),
  totalCommentsReceived: integer("total_comments_received").default(0),
  totalSharesReceived: integer("total_shares_received").default(0),
  
  // Engagement Given
  totalLikesGiven: integer("total_likes_given").default(0),
  totalCommentsGiven: integer("total_comments_given").default(0),
  totalSharesGiven: integer("total_shares_given").default(0),
  
  // Activity Patterns
  averagePostsPerWeek: numeric("average_posts_per_week", { precision: 5, scale: 2 }),
  mostActiveDay: varchar("most_active_day", { length: 20 }),
  mostActiveTime: varchar("most_active_time", { length: 50 }),
  
  // Content Preferences
  preferredPostTypes: text("preferred_post_types").array(),
  commonHashtags: text("common_hashtags").array(),
  
  // Popular Posts
  mostLikedPostId: integer("most_liked_post_id"),
  mostCommentedPostId: integer("most_commented_post_id"),
  mostSharedPostId: integer("most_shared_post_id"),
  
  // Visibility & Privacy Settings
  defaultPostVisibility: varchar("default_post_visibility", { length: 20 }).default("public"),
  allowCommentsOnPosts: boolean("allow_comments_on_posts").default(true),
  allowSharingOfPosts: boolean("allow_sharing_of_posts").default(true),
  allowTaggingInPosts: boolean("allow_tagging_in_posts").default(true),
  
  // Notification Settings
  notifyOnLikes: boolean("notify_on_likes").default(true),
  notifyOnComments: boolean("notify_on_comments").default(true),
  notifyOnShares: boolean("notify_on_shares").default(true),
  notifyOnMentions: boolean("notify_on_mentions").default(true),
  
  // Feed Preferences
  showFriendsOnly: boolean("show_friends_only").default(false),
  hideReposts: boolean("hide_reposts").default(false),
  
  // Activity Streaks
  currentPostingStreak: integer("current_posting_streak").default(0),
  longestPostingStreak: integer("longest_posting_streak").default(0),
  
  // Last Activity
  lastPostDate: timestamp("last_post_date"),
  lastCommentDate: timestamp("last_comment_date"),
  lastLikeDate: timestamp("last_like_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("feed_activity_profiles_user_idx").on(table.userId),
  postsIdx: index("feed_activity_profiles_posts_idx").on(table.totalPosts),
  engagementIdx: index("feed_activity_profiles_engagement_idx").on(table.totalLikesReceived),
}));

// Profile Media Zod Schemas
export const insertProfileMediaSchema = createInsertSchema(profileMedia).omit({ id: true, createdAt: true, updatedAt: true });
export const updateProfileMediaSchema = insertProfileMediaSchema.partial();
export type InsertProfileMedia = z.infer<typeof insertProfileMediaSchema>;
export type UpdateProfileMedia = z.infer<typeof updateProfileMediaSchema>;
export type SelectProfileMedia = typeof profileMedia.$inferSelect;

// Profile Analytics Zod Schemas
export const insertProfileAnalyticsSchema = createInsertSchema(profileAnalytics).omit({ id: true });
export type InsertProfileAnalytics = z.infer<typeof insertProfileAnalyticsSchema>;
export type SelectProfileAnalytics = typeof profileAnalytics.$inferSelect;

// Profile Inquiries Zod Schemas
export const insertProfileInquirySchema = createInsertSchema(profileInquiries).omit({ id: true, createdAt: true, updatedAt: true });
export const updateProfileInquirySchema = insertProfileInquirySchema.partial();
export type InsertProfileInquiry = z.infer<typeof insertProfileInquirySchema>;
export type UpdateProfileInquiry = z.infer<typeof updateProfileInquirySchema>;
export type SelectProfileInquiry = typeof profileInquiries.$inferSelect;

// User Extended Profiles (6)

// 18. Travel Preferences Profile Schema
export const insertTravelPreferencesProfileSchema = createInsertSchema(travelPreferencesProfiles)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    travelStyle: z.array(z.string().min(1).max(100)).optional(),
    accommodationPreferences: z.array(z.string().min(1).max(100)).optional(),
    totalCountriesVisited: z.number().int().min(0).max(300).optional(),
    totalCitiesVisited: z.number().int().min(0).max(10000).optional(),
    tangoDestinationsVisited: z.array(z.string().min(1).max(255)).optional(),
    preferredTravelMonths: z.array(z.string().min(1).max(20)).optional(),
    travelCompanions: z.string().min(1).max(100).optional(),
    languagesSpoken: z.array(z.string().min(2).max(50)).optional(),
    typicalTripDuration: z.string().min(1).max(100).optional(),
    budgetRange: z.string().min(1).max(50).optional(),
    planningStyle: z.string().min(1).max(100).optional(),
    travelInterests: z.array(z.string().min(1).max(100)).optional(),
  });

export const updateTravelPreferencesProfileSchema = insertTravelPreferencesProfileSchema.partial();
export type InsertTravelPreferencesProfile = z.infer<typeof insertTravelPreferencesProfileSchema>;
export type UpdateTravelPreferencesProfile = z.infer<typeof updateTravelPreferencesProfileSchema>;
export type SelectTravelPreferencesProfile = typeof travelPreferencesProfiles.$inferSelect;

// 19. Events Profile Schema
export const insertEventsProfileSchema = createInsertSchema(eventsProfiles)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    totalEventsAttended: z.number().int().min(0).optional(),
    totalMilongasAttended: z.number().int().min(0).optional(),
    totalFestivalsAttended: z.number().int().min(0).optional(),
    totalWorkshopsAttended: z.number().int().min(0).optional(),
    totalEventsHosted: z.number().int().min(0).optional(),
    hostingTypes: z.array(z.string().min(1).max(100)).optional(),
    preferredEventTypes: z.array(z.string().min(1).max(100)).optional(),
    preferredEventSizes: z.array(z.string().min(1).max(100)).optional(),
    preferredDays: z.array(z.string().min(1).max(20)).optional(),
    preferredTimes: z.array(z.string().min(1).max(50)).optional(),
    averageEventsPerMonth: z.number().int().min(0).max(100).optional(),
    mostActiveCity: z.string().min(1).max(255).optional(),
    rsvpReliability: z.number().min(0).max(100).optional(),
  });

export const updateEventsProfileSchema = insertEventsProfileSchema.partial();
export type InsertEventsProfile = z.infer<typeof insertEventsProfileSchema>;
export type UpdateEventsProfile = z.infer<typeof updateEventsProfileSchema>;
export type SelectEventsProfile = typeof eventsProfiles.$inferSelect;

// 20. Friends/Network Profile Schema
export const insertFriendsNetworkProfileSchema = createInsertSchema(friendsNetworkProfiles)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    totalFriends: z.number().int().min(0).optional(),
    totalFollowers: z.number().int().min(0).optional(),
    totalFollowing: z.number().int().min(0).optional(),
    dancePartners: z.number().int().min(0).optional(),
    regularPartners: z.number().int().min(0).optional(),
    totalEndorsements: z.number().int().min(0).optional(),
    leadersConnected: z.number().int().min(0).optional(),
    followersConnected: z.number().int().min(0).optional(),
    teachersConnected: z.number().int().min(0).optional(),
    organizersConnected: z.number().int().min(0).optional(),
    djsConnected: z.number().int().min(0).optional(),
    newConnectionsThisMonth: z.number().int().min(0).optional(),
    newConnectionsThisYear: z.number().int().min(0).optional(),
  });

export const updateFriendsNetworkProfileSchema = insertFriendsNetworkProfileSchema.partial();
export type InsertFriendsNetworkProfile = z.infer<typeof insertFriendsNetworkProfileSchema>;
export type UpdateFriendsNetworkProfile = z.infer<typeof updateFriendsNetworkProfileSchema>;
export type SelectFriendsNetworkProfile = typeof friendsNetworkProfiles.$inferSelect;

// 21. Photos/Media Gallery Profile Schema
export const insertPhotosMediaGalleryProfileSchema = createInsertSchema(photosMediaGalleryProfiles)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    totalPhotos: z.number().int().min(0).optional(),
    totalVideos: z.number().int().min(0).optional(),
    totalAlbums: z.number().int().min(0).optional(),
    totalViews: z.number().int().min(0).optional(),
    totalLikes: z.number().int().min(0).optional(),
    featuredPhoto: z.string().url().optional(),
    featuredVideo: z.string().url().optional(),
    featuredAlbum: z.number().int().min(0).optional(),
    mostViewedPhoto: z.string().url().optional(),
    mostLikedPhoto: z.string().url().optional(),
    uploadsThisMonth: z.number().int().min(0).optional(),
    uploadsThisYear: z.number().int().min(0).optional(),
    totalStorageUsed: z.number().int().min(0).optional(),
    totalShares: z.number().int().min(0).optional(),
    totalTags: z.number().int().min(0).optional(),
    defaultPhotoVisibility: z.enum(['public', 'friends', 'private']).optional(),
  });

export const updatePhotosMediaGalleryProfileSchema = insertPhotosMediaGalleryProfileSchema.partial();
export type InsertPhotosMediaGalleryProfile = z.infer<typeof insertPhotosMediaGalleryProfileSchema>;
export type UpdatePhotosMediaGalleryProfile = z.infer<typeof updatePhotosMediaGalleryProfileSchema>;
export type SelectPhotosMediaGalleryProfile = typeof photosMediaGalleryProfiles.$inferSelect;

// 22. About/Bio Extended Profile Schema
export const insertAboutBioExtendedProfileSchema = createInsertSchema(aboutBioExtendedProfiles)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    fullBio: z.string().min(100).max(10000).optional(),
    tangoJourneyStory: z.string().min(100).max(10000).optional(),
    inspirations: z.string().min(50).max(5000).optional(),
    dancingPhilosophy: z.string().min(50).max(5000).optional(),
    favoriteTeachers: z.array(z.string().min(1).max(255)).optional(),
    favoriteDancers: z.array(z.string().min(1).max(255)).optional(),
    musicalInfluences: z.array(z.string().min(1).max(255)).optional(),
    hobbies: z.array(z.string().min(1).max(100)).optional(),
    otherDances: z.array(z.string().min(1).max(100)).optional(),
    languages: z.array(z.string().min(2).max(50)).optional(),
    profession: z.string().min(1).max(255).optional(),
    education: z.string().max(2000).optional(),
    interests: z.array(z.string().min(1).max(100)).optional(),
    favoriteQuote: z.string().max(1000).optional(),
    photoGallery: z.array(z.string().url()).optional(),
    videoHighlights: z.array(z.string().url()).optional(),
  });

export const updateAboutBioExtendedProfileSchema = insertAboutBioExtendedProfileSchema.partial();
export type InsertAboutBioExtendedProfile = z.infer<typeof insertAboutBioExtendedProfileSchema>;
export type UpdateAboutBioExtendedProfile = z.infer<typeof updateAboutBioExtendedProfileSchema>;
export type SelectAboutBioExtendedProfile = typeof aboutBioExtendedProfiles.$inferSelect;

// 23. Feed/Activity Profile Schema
export const insertFeedActivityProfileSchema = createInsertSchema(feedActivityProfiles)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    totalPosts: z.number().int().min(0).optional(),
    totalPhotoPosts: z.number().int().min(0).optional(),
    totalVideoPosts: z.number().int().min(0).optional(),
    totalTextPosts: z.number().int().min(0).optional(),
    totalShares: z.number().int().min(0).optional(),
    totalLikesReceived: z.number().int().min(0).optional(),
    totalCommentsReceived: z.number().int().min(0).optional(),
    totalSharesReceived: z.number().int().min(0).optional(),
    totalLikesGiven: z.number().int().min(0).optional(),
    totalCommentsGiven: z.number().int().min(0).optional(),
    totalSharesGiven: z.number().int().min(0).optional(),
    averagePostsPerWeek: z.number().min(0).max(1000).optional(),
    mostActiveDay: z.string().min(1).max(20).optional(),
    mostActiveTime: z.string().min(1).max(50).optional(),
    preferredPostTypes: z.array(z.string().min(1).max(100)).optional(),
    commonHashtags: z.array(z.string().min(1).max(100)).optional(),
    mostLikedPostId: z.number().int().min(0).optional(),
    mostCommentedPostId: z.number().int().min(0).optional(),
    mostSharedPostId: z.number().int().min(0).optional(),
    defaultPostVisibility: z.enum(['public', 'friends', 'private']).optional(),
    currentPostingStreak: z.number().int().min(0).optional(),
    longestPostingStreak: z.number().int().min(0).optional(),
  });

export const updateFeedActivityProfileSchema = insertFeedActivityProfileSchema.partial();
export type InsertFeedActivityProfile = z.infer<typeof insertFeedActivityProfileSchema>;
export type UpdateFeedActivityProfile = z.infer<typeof updateFeedActivityProfileSchema>;
export type SelectFeedActivityProfile = typeof feedActivityProfiles.$inferSelect;

// ============================================================================
// FINANCIAL MANAGEMENT SYSTEM (Agents #73-105)
// ============================================================================

// 1. Financial Portfolios - User investment portfolios
export const financialPortfolios = pgTable("financial_portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // personal, business, retirement
  totalValue: numeric("total_value", { precision: 15, scale: 2 }).default("0").notNull(),
  cashBalance: numeric("cash_balance", { precision: 15, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("financial_portfolios_user_idx").on(table.userId),
  typeIdx: index("financial_portfolios_type_idx").on(table.type),
}));

// 2. Financial Accounts - Connected accounts (Coinbase, Schwab, etc.)
export const financialAccounts = pgTable("financial_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(), // coinbase, schwab, puzzle, mercury
  accountId: varchar("account_id", { length: 255 }).notNull(), // external ID
  accountType: varchar("account_type", { length: 50 }).notNull(), // brokerage, crypto, banking, business
  balance: numeric("balance", { precision: 15, scale: 2 }).default("0").notNull(),
  lastSyncedAt: timestamp("last_synced_at"),
  credentials: jsonb("credentials"), // encrypted credentials
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("financial_accounts_user_idx").on(table.userId),
  providerIdx: index("financial_accounts_provider_idx").on(table.provider),
  accountTypeIdx: index("financial_accounts_account_type_idx").on(table.accountType),
}));

// 3. Financial Assets - Stocks, crypto, bonds owned
export const financialAssets = pgTable("financial_assets", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull().references(() => financialPortfolios.id, { onDelete: "cascade" }),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  assetType: varchar("asset_type", { length: 50 }).notNull(), // stock, crypto, bond, etf, option
  quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
  averagePrice: numeric("average_price", { precision: 15, scale: 2 }).notNull(),
  currentPrice: numeric("current_price", { precision: 15, scale: 2 }).notNull(),
  totalValue: numeric("total_value", { precision: 15, scale: 2 }).notNull(),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
}, (table) => ({
  portfolioIdx: index("financial_assets_portfolio_idx").on(table.portfolioId),
  symbolIdx: index("financial_assets_symbol_idx").on(table.symbol),
  assetTypeIdx: index("financial_assets_asset_type_idx").on(table.assetType),
}));

// 4. Financial Trades - All trades executed
export const financialTrades = pgTable("financial_trades", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull().references(() => financialPortfolios.id, { onDelete: "cascade" }),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  tradeType: varchar("trade_type", { length: 20 }).notNull(), // buy, sell, transfer
  quantity: numeric("quantity", { precision: 20, scale: 8 }).notNull(),
  price: numeric("price", { precision: 15, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
  fees: numeric("fees", { precision: 15, scale: 2 }).default("0").notNull(),
  strategy: varchar("strategy", { length: 255 }), // which AI agent initiated
  executedAt: timestamp("executed_at").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).notNull(), // pending, executed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  portfolioIdx: index("financial_trades_portfolio_idx").on(table.portfolioId),
  symbolIdx: index("financial_trades_symbol_idx").on(table.symbol),
  statusIdx: index("financial_trades_status_idx").on(table.status),
  executedAtIdx: index("financial_trades_executed_at_idx").on(table.executedAt),
}));

// 5. Financial Strategies - AI trading strategies
export const financialStrategies = pgTable("financial_strategies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  agentId: integer("agent_id").notNull(), // which of agents #73-105
  strategyType: varchar("strategy_type", { length: 50 }).notNull(), // momentum, value, arbitrage, swing, day_trading
  riskLevel: varchar("risk_level", { length: 20 }).notNull(), // low, medium, high, aggressive
  capitalAllocation: numeric("capital_allocation", { precision: 15, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  performance: jsonb("performance"), // returns, sharpe ratio, etc.
  rules: jsonb("rules"), // strategy parameters
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  agentIdx: index("financial_strategies_agent_idx").on(table.agentId),
  strategyTypeIdx: index("financial_strategies_strategy_type_idx").on(table.strategyType),
  isActiveIdx: index("financial_strategies_is_active_idx").on(table.isActive),
}));

// 6. Financial Market Data - Real-time market data cache
export const financialMarketData = pgTable("financial_market_data", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  price: numeric("price", { precision: 15, scale: 2 }).notNull(),
  volume: numeric("volume", { precision: 20, scale: 2 }),
  change24h: numeric("change_24h", { precision: 10, scale: 2 }),
  high24h: numeric("high_24h", { precision: 15, scale: 2 }),
  low24h: numeric("low_24h", { precision: 15, scale: 2 }),
  marketCap: numeric("market_cap", { precision: 20, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  symbolIdx: index("financial_market_data_symbol_idx").on(table.symbol),
  timestampIdx: index("financial_market_data_timestamp_idx").on(table.timestamp),
  symbolTimestampIdx: index("financial_market_data_symbol_timestamp_idx").on(table.symbol, table.timestamp),
}));

// 7. Financial AI Decisions - AI agent decisions log
export const financialAIDecisions = pgTable("financial_ai_decisions", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(), // agents #73-105
  portfolioId: integer("portfolio_id").notNull().references(() => financialPortfolios.id, { onDelete: "cascade" }),
  decisionType: varchar("decision_type", { length: 20 }).notNull(), // buy, sell, hold, rebalance
  symbol: varchar("symbol", { length: 50 }),
  reasoning: text("reasoning").notNull(), // AI explanation
  confidence: numeric("confidence", { precision: 3, scale: 2 }).notNull(), // 0-1
  recommendation: jsonb("recommendation").notNull(),
  executedTradeId: integer("executed_trade_id").references(() => financialTrades.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  agentIdx: index("financial_ai_decisions_agent_idx").on(table.agentId),
  portfolioIdx: index("financial_ai_decisions_portfolio_idx").on(table.portfolioId),
  decisionTypeIdx: index("financial_ai_decisions_decision_type_idx").on(table.decisionType),
  createdAtIdx: index("financial_ai_decisions_created_at_idx").on(table.createdAt),
}));

// 8. Financial Risk Metrics - Portfolio risk tracking
export const financialRiskMetrics = pgTable("financial_risk_metrics", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull().references(() => financialPortfolios.id, { onDelete: "cascade" }),
  sharpeRatio: numeric("sharpe_ratio", { precision: 10, scale: 4 }),
  maxDrawdown: numeric("max_drawdown", { precision: 10, scale: 4 }),
  volatility: numeric("volatility", { precision: 10, scale: 4 }),
  beta: numeric("beta", { precision: 10, scale: 4 }),
  var95: numeric("var_95", { precision: 15, scale: 2 }), // Value at Risk
  exposureByAsset: jsonb("exposure_by_asset"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
}, (table) => ({
  portfolioIdx: index("financial_risk_metrics_portfolio_idx").on(table.portfolioId),
  calculatedAtIdx: index("financial_risk_metrics_calculated_at_idx").on(table.calculatedAt),
}));

// 9. Financial Agents - Agent metadata & status
export const financialAgents = pgTable("financial_agents", {
  id: serial("id").primaryKey(),
  agentNumber: integer("agent_number").notNull().unique(), // 73-105
  name: varchar("name", { length: 255 }).notNull(),
  tier: integer("tier").notNull(), // 1-6
  role: varchar("role", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastRunAt: timestamp("last_run_at"),
  successRate: numeric("success_rate", { precision: 5, scale: 2 }), // percentage
  totalDecisions: integer("total_decisions").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  agentNumberIdx: index("financial_agents_agent_number_idx").on(table.agentNumber),
  tierIdx: index("financial_agents_tier_idx").on(table.tier),
  isActiveIdx: index("financial_agents_is_active_idx").on(table.isActive),
}));

// 10. Financial Monitoring - 30-second monitoring logs
export const financialMonitoring = pgTable("financial_monitoring", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => financialAgents.id, { onDelete: "cascade" }),
  portfolioId: integer("portfolio_id").references(() => financialPortfolios.id, { onDelete: "cascade" }),
  checkType: varchar("check_type", { length: 50 }).notNull(), // price, risk, opportunity, alert
  findings: jsonb("findings").notNull(),
  actionTaken: boolean("action_taken").default(false).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  agentIdx: index("financial_monitoring_agent_idx").on(table.agentId),
  portfolioIdx: index("financial_monitoring_portfolio_idx").on(table.portfolioId),
  checkTypeIdx: index("financial_monitoring_check_type_idx").on(table.checkType),
  timestampIdx: index("financial_monitoring_timestamp_idx").on(table.timestamp),
}));

// ============================================================================
// FINANCIAL SYSTEM ZOD VALIDATION SCHEMAS
// ============================================================================

// 1. Financial Portfolios
export const insertFinancialPortfolioSchema = createInsertSchema(financialPortfolios)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.string().min(1).max(255),
    type: z.enum(['personal', 'business', 'retirement']),
    totalValue: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    cashBalance: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  });
export const selectFinancialPortfolioSchema = createSelectSchema(financialPortfolios);
export type InsertFinancialPortfolio = z.infer<typeof insertFinancialPortfolioSchema>;
export type SelectFinancialPortfolio = typeof financialPortfolios.$inferSelect;

// 2. Financial Accounts
export const insertFinancialAccountSchema = createInsertSchema(financialAccounts)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    provider: z.enum(['coinbase', 'schwab', 'puzzle', 'mercury', 'plaid', 'other']),
    accountType: z.enum(['brokerage', 'crypto', 'banking', 'business']),
    balance: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    credentials: z.record(z.any()).optional(),
  });
export const selectFinancialAccountSchema = createSelectSchema(financialAccounts);
export type InsertFinancialAccount = z.infer<typeof insertFinancialAccountSchema>;
export type SelectFinancialAccount = typeof financialAccounts.$inferSelect;

// 3. Financial Assets
export const insertFinancialAssetSchema = createInsertSchema(financialAssets)
  .omit({ id: true, lastUpdatedAt: true })
  .extend({
    symbol: z.string().min(1).max(50),
    assetType: z.enum(['stock', 'crypto', 'bond', 'etf', 'option']),
    quantity: z.string().regex(/^\d+(\.\d{1,8})?$/),
    averagePrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
    currentPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
    totalValue: z.string().regex(/^\d+(\.\d{1,2})?$/),
  });
export const selectFinancialAssetSchema = createSelectSchema(financialAssets);
export type InsertFinancialAsset = z.infer<typeof insertFinancialAssetSchema>;
export type SelectFinancialAsset = typeof financialAssets.$inferSelect;

// 4. Financial Trades
export const insertFinancialTradeSchema = createInsertSchema(financialTrades)
  .omit({ id: true, createdAt: true })
  .extend({
    symbol: z.string().min(1).max(50),
    tradeType: z.enum(['buy', 'sell', 'transfer']),
    quantity: z.string().regex(/^\d+(\.\d{1,8})?$/),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/),
    totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
    fees: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    status: z.enum(['pending', 'executed', 'failed']),
  });
export const selectFinancialTradeSchema = createSelectSchema(financialTrades);
export type InsertFinancialTrade = z.infer<typeof insertFinancialTradeSchema>;
export type SelectFinancialTrade = typeof financialTrades.$inferSelect;

// 5. Financial Strategies
export const insertFinancialStrategySchema = createInsertSchema(financialStrategies)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.string().min(1).max(255),
    agentId: z.number().int().min(73).max(105),
    strategyType: z.enum(['momentum', 'value', 'arbitrage', 'swing', 'day_trading']),
    riskLevel: z.enum(['low', 'medium', 'high', 'aggressive']),
    capitalAllocation: z.string().regex(/^\d+(\.\d{1,2})?$/),
    performance: z.record(z.any()).optional(),
    rules: z.record(z.any()).optional(),
  });
export const selectFinancialStrategySchema = createSelectSchema(financialStrategies);
export type InsertFinancialStrategy = z.infer<typeof insertFinancialStrategySchema>;
export type SelectFinancialStrategy = typeof financialStrategies.$inferSelect;

// 6. Financial Market Data
export const insertFinancialMarketDataSchema = createInsertSchema(financialMarketData)
  .omit({ id: true, timestamp: true })
  .extend({
    symbol: z.string().min(1).max(50),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/),
    volume: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    change24h: z.string().regex(/^-?\d+(\.\d{1,2})?$/).optional(),
    high24h: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    low24h: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    marketCap: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  });
export const selectFinancialMarketDataSchema = createSelectSchema(financialMarketData);
export type InsertFinancialMarketData = z.infer<typeof insertFinancialMarketDataSchema>;
export type SelectFinancialMarketData = typeof financialMarketData.$inferSelect;

// 7. Financial AI Decisions
export const insertFinancialAIDecisionSchema = createInsertSchema(financialAIDecisions)
  .omit({ id: true, createdAt: true })
  .extend({
    agentId: z.number().int().min(73).max(105),
    decisionType: z.enum(['buy', 'sell', 'hold', 'rebalance']),
    reasoning: z.string().min(10),
    confidence: z.string().regex(/^0(\.\d{1,2})?$|^1(\.0{1,2})?$/), // 0.00 to 1.00
    recommendation: z.record(z.any()),
  });
export const selectFinancialAIDecisionSchema = createSelectSchema(financialAIDecisions);
export type InsertFinancialAIDecision = z.infer<typeof insertFinancialAIDecisionSchema>;
export type SelectFinancialAIDecision = typeof financialAIDecisions.$inferSelect;

// 8. Financial Risk Metrics
export const insertFinancialRiskMetricsSchema = createInsertSchema(financialRiskMetrics)
  .omit({ id: true, calculatedAt: true })
  .extend({
    sharpeRatio: z.string().regex(/^-?\d+(\.\d{1,4})?$/).optional(),
    maxDrawdown: z.string().regex(/^-?\d+(\.\d{1,4})?$/).optional(),
    volatility: z.string().regex(/^\d+(\.\d{1,4})?$/).optional(),
    beta: z.string().regex(/^-?\d+(\.\d{1,4})?$/).optional(),
    var95: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    exposureByAsset: z.record(z.any()).optional(),
  });
export const selectFinancialRiskMetricsSchema = createSelectSchema(financialRiskMetrics);
export type InsertFinancialRiskMetrics = z.infer<typeof insertFinancialRiskMetricsSchema>;
export type SelectFinancialRiskMetrics = typeof financialRiskMetrics.$inferSelect;

// 9. Financial Agents
export const insertFinancialAgentSchema = createInsertSchema(financialAgents)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    agentNumber: z.number().int().min(73).max(105),
    name: z.string().min(1).max(255),
    tier: z.number().int().min(1).max(6),
    role: z.string().min(1).max(255),
    successRate: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  });
export const selectFinancialAgentSchema = createSelectSchema(financialAgents);
export type InsertFinancialAgent = z.infer<typeof insertFinancialAgentSchema>;
export type SelectFinancialAgent = typeof financialAgents.$inferSelect;

// 10. Financial Monitoring
export const insertFinancialMonitoringSchema = createInsertSchema(financialMonitoring)
  .omit({ id: true, timestamp: true })
  .extend({
    checkType: z.enum(['price', 'risk', 'opportunity', 'alert']),
    findings: z.record(z.any()),
  });
export const selectFinancialMonitoringSchema = createSelectSchema(financialMonitoring);
export type InsertFinancialMonitoring = z.infer<typeof insertFinancialMonitoringSchema>;
export type SelectFinancialMonitoring = typeof financialMonitoring.$inferSelect;

// ============================================================================
// SOCIAL MEDIA & EVENT SCRAPING (Agents #120-124)
// ============================================================================

// 1. Scraped Events - Events from 226+ external tango sources
export const scrapedEvents = pgTable("scraped_events", {
  id: serial("id").primaryKey(),
  sourceUrl: varchar("source_url", { length: 500 }).notNull(),
  sourceName: varchar("source_name", { length: 255 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: varchar("location", { length: 255 }),
  address: text("address"),
  organizer: varchar("organizer", { length: 255 }),
  price: numeric("price", { precision: 10, scale: 2 }),
  imageUrl: varchar("image_url", { length: 500 }),
  externalId: varchar("external_id", { length: 255 }),
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("pending_review").notNull(),
  claimedByUserId: integer("claimed_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  sourceIdx: index("scraped_events_source_idx").on(table.sourceName),
  statusIdx: index("scraped_events_status_idx").on(table.status),
  startDateIdx: index("scraped_events_start_date_idx").on(table.startDate),
  claimedIdx: index("scraped_events_claimed_idx").on(table.claimedByUserId),
}));

// 2. Event Scraping Sources - 226+ tango community sources
export const eventScrapingSources = pgTable("event_scraping_sources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  customSelectors: jsonb("custom_selectors"),
  lastScrapedAt: timestamp("last_scraped_at"),
  totalEventsScraped: integer("total_events_scraped").default(0),
  scrapeFrequency: varchar("scrape_frequency", { length: 20 }).default("daily").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  platformIdx: index("scraping_sources_platform_idx").on(table.platform),
  activeIdx: index("scraping_sources_active_idx").on(table.isActive),
  cityCountryIdx: index("scraping_sources_city_country_idx").on(table.city, table.country),
}));

// 3. Social Posts - Cross-platform posts
export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  mediaUrls: text("media_urls").array(),
  platforms: text("platforms").array().notNull(),
  scheduledFor: timestamp("scheduled_for"),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  publishedAt: timestamp("published_at"),
  engagement: jsonb("engagement"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("social_posts_user_idx").on(table.userId),
  statusIdx: index("social_posts_status_idx").on(table.status),
  scheduledIdx: index("social_posts_scheduled_idx").on(table.scheduledFor),
}));

// 5. Platform Connections - OAuth tokens for social platforms
export const platformConnections = pgTable("platform_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 50 }).notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  scope: text("scope").array(),
  platformUserId: varchar("platform_user_id", { length: 255 }),
  platformUsername: varchar("platform_username", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userPlatformIdx: uniqueIndex("platform_connections_user_platform_idx").on(table.userId, table.platform),
  activeIdx: index("platform_connections_active_idx").on(table.isActive),
}));

// 6. Social Campaigns - AI marketing campaigns
export const socialCampaigns = pgTable("social_campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  objective: varchar("objective", { length: 50 }).notNull(),
  targetAudience: jsonb("target_audience"),
  contentType: varchar("content_type", { length: 50 }),
  platforms: text("platforms").array().notNull(),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  aiGenerated: boolean("ai_generated").default(false),
  performance: jsonb("performance"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("social_campaigns_user_idx").on(table.userId),
  statusIdx: index("social_campaigns_status_idx").on(table.status),
  startDateIdx: index("social_campaigns_start_date_idx").on(table.startDate),
}));

// 7. AI Generated Content - AI-created posts/images/videos
export const aiGeneratedContent = pgTable("ai_generated_content", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => socialCampaigns.id, { onDelete: "set null" }),
  agentId: integer("agent_id").notNull(),
  contentType: varchar("content_type", { length: 20 }).notNull(),
  content: text("content"),
  mediaUrl: varchar("media_url", { length: 500 }),
  aiModel: varchar("ai_model", { length: 100 }),
  prompt: text("prompt"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  approvalStatus: varchar("approval_status", { length: 20 }).default("pending").notNull(),
  humanFeedback: text("human_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  campaignIdx: index("ai_content_campaign_idx").on(table.campaignId),
  agentIdx: index("ai_content_agent_idx").on(table.agentId),
  statusIdx: index("ai_content_status_idx").on(table.approvalStatus),
  typeIdx: index("ai_content_type_idx").on(table.contentType),
}));

// 8. Event Claims - Venue/organizer event claims
export const eventClaims = pgTable("event_claims", {
  id: serial("id").primaryKey(),
  scrapedEventId: integer("scraped_event_id").notNull().references(() => scrapedEvents.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  claimReason: text("claim_reason").notNull(),
  verificationStatus: varchar("verification_status", { length: 20 }).default("pending").notNull(),
  verificationMethod: varchar("verification_method", { length: 20 }),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  eventIdx: index("event_claims_event_idx").on(table.scrapedEventId),
  userIdx: index("event_claims_user_idx").on(table.userId),
  statusIdx: index("event_claims_status_idx").on(table.verificationStatus),
}));

// 9. Cross Platform Analytics - Unified analytics
export const crossPlatformAnalytics = pgTable("cross_platform_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  period: varchar("period", { length: 20 }).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  platformMetrics: jsonb("platform_metrics"),
  topPosts: jsonb("top_posts"),
  growth: jsonb("growth"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("analytics_user_idx").on(table.userId),
  periodIdx: index("analytics_period_idx").on(table.period),
  periodStartIdx: index("analytics_period_start_idx").on(table.periodStart),
}));

// 10. API Health Logs - Agent #120 monitoring logs
export const apiHealthLogs = pgTable("api_health_logs", {
  id: serial("id").primaryKey(),
  platform: varchar("platform", { length: 50 }).notNull(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  responseTime: integer("response_time"),
  statusCode: integer("status_code"),
  isHealthy: boolean("is_healthy").notNull(),
  errorMessage: text("error_message"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  platformIdx: index("api_health_platform_idx").on(table.platform),
  healthyIdx: index("api_health_healthy_idx").on(table.isHealthy),
  checkedAtIdx: index("api_health_checked_at_idx").on(table.checkedAt),
}));

// ============================================================================
// ZOD VALIDATION SCHEMAS - SOCIAL MEDIA & EVENT SCRAPING
// ============================================================================

// 1. Scraped Events
export const insertScrapedEventSchema = createInsertSchema(scrapedEvents)
  .omit({ id: true, createdAt: true, updatedAt: true, scrapedAt: true })
  .extend({
    sourceUrl: z.string().url().max(500),
    sourceName: z.string().min(1).max(255),
    title: z.string().min(1).max(500),
    description: z.string().optional(),
    location: z.string().max(255).optional(),
    organizer: z.string().max(255).optional(),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    imageUrl: z.string().url().max(500).optional(),
    externalId: z.string().max(255).optional(),
    status: z.enum(['pending_review', 'approved', 'rejected']),
  });
export const selectScrapedEventSchema = createSelectSchema(scrapedEvents);
export type InsertScrapedEvent = z.infer<typeof insertScrapedEventSchema>;
export type SelectScrapedEvent = typeof scrapedEvents.$inferSelect;

// 2. Event Scraping Sources
export const insertEventScrapingSourceSchema = createInsertSchema(eventScrapingSources)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.string().min(1).max(255),
    url: z.string().url().max(500),
    platform: z.enum(['facebook', 'instagram', 'website', 'eventbrite', 'meetup']),
    country: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    scrapeFrequency: z.enum(['hourly', 'daily', 'weekly']),
  });
export const selectEventScrapingSourceSchema = createSelectSchema(eventScrapingSources);
export type InsertEventScrapingSource = z.infer<typeof insertEventScrapingSourceSchema>;
export type SelectEventScrapingSource = typeof eventScrapingSources.$inferSelect;

// 3. Social Posts
export const insertSocialPostSchema = createInsertSchema(socialPosts)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    content: z.string().min(1),
    mediaUrls: z.array(z.string().url()).optional(),
    platforms: z.array(z.string()).min(1),
    status: z.enum(['draft', 'scheduled', 'publishing', 'published', 'failed']),
    engagement: z.record(z.any()).optional(),
  });
export const selectSocialPostSchema = createSelectSchema(socialPosts);
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type SelectSocialPost = typeof socialPosts.$inferSelect;

// 5. Platform Connections
export const insertPlatformConnectionSchema = createInsertSchema(platformConnections)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    platform: z.enum(['facebook', 'instagram', 'linkedin', 'twitter']),
    accessToken: z.string().min(1),
    refreshToken: z.string().optional(),
    scope: z.array(z.string()).optional(),
    platformUserId: z.string().max(255).optional(),
    platformUsername: z.string().max(255).optional(),
  });
export const selectPlatformConnectionSchema = createSelectSchema(platformConnections);
export type InsertPlatformConnection = z.infer<typeof insertPlatformConnectionSchema>;
export type SelectPlatformConnection = typeof platformConnections.$inferSelect;

// 6. Social Campaigns
export const insertSocialCampaignSchema = createInsertSchema(socialCampaigns)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.string().min(1).max(255),
    objective: z.enum(['event_promotion', 'user_growth', 'engagement', 'viral']),
    targetAudience: z.record(z.any()).optional(),
    contentType: z.enum(['video', 'image', 'text', 'carousel']).optional(),
    platforms: z.array(z.string()).min(1),
    budget: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    status: z.enum(['draft', 'active', 'paused', 'completed']),
    performance: z.record(z.any()).optional(),
  });
export const selectSocialCampaignSchema = createSelectSchema(socialCampaigns);
export type InsertSocialCampaign = z.infer<typeof insertSocialCampaignSchema>;
export type SelectSocialCampaign = typeof socialCampaigns.$inferSelect;

// 7. AI Generated Content
export const insertAIGeneratedContentSchema = createInsertSchema(aiGeneratedContent)
  .omit({ id: true, createdAt: true, updatedAt: true, generatedAt: true })
  .extend({
    agentId: z.number().int().min(120).max(125),
    contentType: z.enum(['text', 'image', 'video']),
    content: z.string().optional(),
    mediaUrl: z.string().url().max(500).optional(),
    aiModel: z.string().max(100).optional(),
    prompt: z.string().optional(),
    approvalStatus: z.enum(['pending', 'approved', 'rejected']),
    humanFeedback: z.string().optional(),
  });
export const selectAIGeneratedContentSchema = createSelectSchema(aiGeneratedContent);
export type InsertAIGeneratedContent = z.infer<typeof insertAIGeneratedContentSchema>;
export type SelectAIGeneratedContent = typeof aiGeneratedContent.$inferSelect;

// 8. Event Claims
export const insertEventClaimSchema = createInsertSchema(eventClaims)
  .omit({ id: true, createdAt: true, updatedAt: true, claimedAt: true })
  .extend({
    claimReason: z.string().min(10),
    verificationStatus: z.enum(['pending', 'verified', 'rejected']),
    verificationMethod: z.enum(['email', 'phone', 'document', 'manual']).optional(),
  });
export const selectEventClaimSchema = createSelectSchema(eventClaims);
export type InsertEventClaim = z.infer<typeof insertEventClaimSchema>;
export type SelectEventClaim = typeof eventClaims.$inferSelect;

// 9. Cross Platform Analytics
export const insertCrossPlatformAnalyticsSchema = createInsertSchema(crossPlatformAnalytics)
  .omit({ id: true, createdAt: true, calculatedAt: true })
  .extend({
    period: z.enum(['day', 'week', 'month']),
    platformMetrics: z.record(z.any()).optional(),
    topPosts: z.record(z.any()).optional(),
    growth: z.record(z.any()).optional(),
  });
export const selectCrossPlatformAnalyticsSchema = createSelectSchema(crossPlatformAnalytics);
export type InsertCrossPlatformAnalytics = z.infer<typeof insertCrossPlatformAnalyticsSchema>;
export type SelectCrossPlatformAnalytics = typeof crossPlatformAnalytics.$inferSelect;

// 10. API Health Logs
export const insertAPIHealthLogSchema = createInsertSchema(apiHealthLogs)
  .omit({ id: true, createdAt: true, checkedAt: true })
  .extend({
    platform: z.enum(['facebook', 'instagram', 'linkedin', 'twitter', 'coinbase', 'schwab']),
    endpoint: z.string().min(1).max(255),
    responseTime: z.number().int().optional(),
    statusCode: z.number().int().optional(),
    errorMessage: z.string().optional(),
  });
export const selectAPIHealthLogSchema = createSelectSchema(apiHealthLogs);
export type InsertAPIHealthLog = z.infer<typeof insertAPIHealthLogSchema>;
export type SelectAPIHealthLog = typeof apiHealthLogs.$inferSelect;

// ============================================================================
// MARKETPLACE SYSTEMS (Agents #158-160) - WAVE 1 STREAM 3
// ============================================================================

// 1. Funding Campaigns (GoFundMe-style crowdfunding)
export const fundingCampaigns = pgTable("funding_campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  story: text("story"),
  
  goalAmount: numeric("goal_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  category: varchar("category", { length: 50 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  videoUrl: varchar("video_url", { length: 500 }),
  
  deadline: timestamp("deadline"),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  beneficiaryType: varchar("beneficiary_type", { length: 50 }).notNull(),
  visibility: varchar("visibility", { length: 20 }).default("public").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("funding_campaigns_user_idx").on(table.userId),
  statusIdx: index("funding_campaigns_status_idx").on(table.status),
  categoryIdx: index("funding_campaigns_category_idx").on(table.category),
  createdAtIdx: index("funding_campaigns_created_at_idx").on(table.createdAt),
}));

// 2. Campaign Donations
export const campaignDonations = pgTable("campaign_donations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => fundingCampaigns.id, { onDelete: "cascade" }),
  donorUserId: integer("donor_user_id").references(() => users.id, { onDelete: "set null" }),
  
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  donorName: varchar("donor_name", { length: 255 }),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  platformFee: numeric("platform_fee", { precision: 10, scale: 2 }).notNull(),
  netAmount: numeric("net_amount", { precision: 10, scale: 2 }).notNull(),
  
  donatedAt: timestamp("donated_at").defaultNow().notNull(),
  refundStatus: varchar("refund_status", { length: 20 }),
}, (table) => ({
  campaignIdx: index("campaign_donations_campaign_idx").on(table.campaignId),
  donorIdx: index("campaign_donations_donor_idx").on(table.donorUserId),
  donatedAtIdx: index("campaign_donations_donated_at_idx").on(table.donatedAt),
}));

// 3. Campaign Updates
export const campaignUpdates = pgTable("campaign_updates", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => fundingCampaigns.id, { onDelete: "cascade" }),
  
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  imageUrls: text("image_urls").array(),
  videoUrl: varchar("video_url", { length: 500 }),
  
  postedAt: timestamp("posted_at").defaultNow().notNull(),
}, (table) => ({
  campaignIdx: index("campaign_updates_campaign_idx").on(table.campaignId),
  postedAtIdx: index("campaign_updates_posted_at_idx").on(table.postedAt),
}));

// 4. Legal Documents (Contract templates)
export const legalDocuments = pgTable("legal_documents", {
  id: serial("id").primaryKey(),
  creatorUserId: integer("creator_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  
  templateContent: text("template_content").notNull(),
  requiredFields: jsonb("required_fields"),
  
  price: numeric("price", { precision: 10, scale: 2 }),
  isPremium: boolean("is_premium").default(false).notNull(),
  downloads: integer("downloads").default(0).notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  creatorIdx: index("legal_documents_creator_idx").on(table.creatorUserId),
  categoryIdx: index("legal_documents_category_idx").on(table.category),
  statusIdx: index("legal_documents_status_idx").on(table.status),
  isPremiumIdx: index("legal_documents_is_premium_idx").on(table.isPremium),
}));

// 5. Document Instances (Filled-out documents)
export const documentInstances = pgTable("document_instances", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => legalDocuments.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  filledContent: text("filled_content").notNull(),
  variables: jsonb("variables"),
  
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  templateIdx: index("document_instances_template_idx").on(table.templateId),
  userIdx: index("document_instances_user_idx").on(table.userId),
  statusIdx: index("document_instances_status_idx").on(table.status),
}));

// 6. Document Signatures (E-signatures)
export const documentSignatures = pgTable("document_signatures", {
  id: serial("id").primaryKey(),
  documentInstanceId: integer("document_instance_id").notNull().references(() => documentInstances.id, { onDelete: "cascade" }),
  signerUserId: integer("signer_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  signerName: varchar("signer_name", { length: 255 }).notNull(),
  signerEmail: varchar("signer_email", { length: 255 }).notNull(),
  signatureData: text("signature_data").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  
  signedAt: timestamp("signed_at").defaultNow().notNull(),
  verificationMethod: varchar("verification_method", { length: 20 }).notNull(),
}, (table) => ({
  documentIdx: index("document_signatures_document_idx").on(table.documentInstanceId),
  signerIdx: index("document_signatures_signer_idx").on(table.signerUserId),
  signedAtIdx: index("document_signatures_signed_at_idx").on(table.signedAt),
}));

// 7. Marketplace Products (Creator digital products)
export const marketplaceProducts = pgTable("marketplace_products", {
  id: serial("id").primaryKey(),
  creatorUserId: integer("creator_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  mediaUrls: text("media_urls").array(),
  downloadUrl: varchar("download_url", { length: 500 }),
  sampleUrl: varchar("sample_url", { length: 500 }),
  
  fileSize: integer("file_size"),
  fileFormat: varchar("file_format", { length: 50 }),
  tags: text("tags").array(),
  
  difficulty: varchar("difficulty", { length: 20 }),
  duration: integer("duration"),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  
  totalSales: integer("total_sales").default(0).notNull(),
  revenue: numeric("revenue", { precision: 10, scale: 2 }).default("0").notNull(),
  
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  creatorIdx: index("marketplace_products_creator_idx").on(table.creatorUserId),
  categoryIdx: index("marketplace_products_category_idx").on(table.category),
  statusIdx: index("marketplace_products_status_idx").on(table.status),
  ratingIdx: index("marketplace_products_rating_idx").on(table.rating),
  createdAtIdx: index("marketplace_products_created_at_idx").on(table.createdAt),
}));

// 8. Product Purchases
export const productPurchases = pgTable("product_purchases", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => marketplaceProducts.id, { onDelete: "cascade" }),
  buyerUserId: integer("buyer_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: numeric("platform_fee", { precision: 10, scale: 2 }).notNull(),
  creatorPayout: numeric("creator_payout", { precision: 10, scale: 2 }).notNull(),
  
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  downloadCount: integer("download_count").default(0).notNull(),
  downloadExpiresAt: timestamp("download_expires_at"),
  
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  refundStatus: varchar("refund_status", { length: 20 }),
}, (table) => ({
  productIdx: index("product_purchases_product_idx").on(table.productId),
  buyerIdx: index("product_purchases_buyer_idx").on(table.buyerUserId),
  purchasedAtIdx: index("product_purchases_purchased_at_idx").on(table.purchasedAt),
}));

// 9. Product Reviews
export const productReviews = pgTable("product_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => marketplaceProducts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  rating: integer("rating").notNull(),
  review: text("review"),
  isPurchaseVerified: boolean("is_purchase_verified").default(false).notNull(),
  helpfulCount: integer("helpful_count").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  productIdx: index("product_reviews_product_idx").on(table.productId),
  userIdx: index("product_reviews_user_idx").on(table.userId),
  ratingIdx: index("product_reviews_rating_idx").on(table.rating),
  uniqueReview: uniqueIndex("unique_product_review").on(table.productId, table.userId),
}));

// 10. Marketplace Analytics
export const marketplaceAnalytics = pgTable("marketplace_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  period: varchar("period", { length: 20 }).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  totalRevenue: numeric("total_revenue", { precision: 10, scale: 2 }).notNull(),
  platformFees: numeric("platform_fees", { precision: 10, scale: 2 }).notNull(),
  netRevenue: numeric("net_revenue", { precision: 10, scale: 2 }).notNull(),
  totalSales: integer("total_sales").notNull(),
  
  productsSold: jsonb("products_sold"),
  topProducts: jsonb("top_products"),
  
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("marketplace_analytics_user_idx").on(table.userId),
  periodIdx: index("marketplace_analytics_period_idx").on(table.period),
  periodStartIdx: index("marketplace_analytics_period_start_idx").on(table.periodStart),
}));

// ============================================================================
// MARKETPLACE SYSTEMS - ZOD VALIDATION SCHEMAS
// ============================================================================

// 1. Funding Campaigns
export const insertFundingCampaignSchema = createInsertSchema(fundingCampaigns)
  .omit({ id: true, createdAt: true, updatedAt: true, currentAmount: true })
  .extend({
    title: z.string().min(1).max(255),
    description: z.string().min(10),
    story: z.string().optional(),
    goalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
    currency: z.string().length(3).default("USD"),
    category: z.enum(['event', 'medical', 'education', 'community', 'travel', 'equipment']),
    imageUrl: z.string().url().max(500).optional(),
    videoUrl: z.string().url().max(500).optional(),
    status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).default('draft'),
    beneficiaryType: z.enum(['individual', 'organization', 'community']),
    visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  });
export const selectFundingCampaignSchema = createSelectSchema(fundingCampaigns);
export type InsertFundingCampaign = z.infer<typeof insertFundingCampaignSchema>;
export type SelectFundingCampaign = typeof fundingCampaigns.$inferSelect;

// 2. Campaign Donations
export const insertCampaignDonationSchema = createInsertSchema(campaignDonations)
  .omit({ id: true, donatedAt: true })
  .extend({
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
    currency: z.string().length(3).default("USD"),
    donorName: z.string().max(255).optional(),
    message: z.string().optional(),
    isAnonymous: z.boolean().default(false),
    platformFee: z.string().regex(/^\d+(\.\d{1,2})?$/),
    netAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
    stripePaymentId: z.string().max(255).optional(),
    refundStatus: z.enum(['none', 'pending', 'refunded']).optional(),
  });
export const selectCampaignDonationSchema = createSelectSchema(campaignDonations);
export type InsertCampaignDonation = z.infer<typeof insertCampaignDonationSchema>;
export type SelectCampaignDonation = typeof campaignDonations.$inferSelect;

// 3. Campaign Updates
export const insertCampaignUpdateSchema = createInsertSchema(campaignUpdates)
  .omit({ id: true, postedAt: true })
  .extend({
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    imageUrls: z.array(z.string().url()).optional(),
    videoUrl: z.string().url().max(500).optional(),
  });
export const selectCampaignUpdateSchema = createSelectSchema(campaignUpdates);
export type InsertCampaignUpdate = z.infer<typeof insertCampaignUpdateSchema>;
export type SelectCampaignUpdate = typeof campaignUpdates.$inferSelect;

// 4. Legal Documents
export const insertLegalDocumentSchema = createInsertSchema(legalDocuments)
  .omit({ id: true, createdAt: true, updatedAt: true, downloads: true, rating: true })
  .extend({
    title: z.string().min(1).max(255),
    description: z.string().min(10),
    category: z.enum(['contract', 'waiver', 'agreement', 'release', 'nda', 'terms']),
    templateContent: z.string().min(1),
    requiredFields: z.array(z.string()).optional(),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    isPremium: z.boolean().default(false),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
  });
export const selectLegalDocumentSchema = createSelectSchema(legalDocuments);
export type InsertLegalDocument = z.infer<typeof insertLegalDocumentSchema>;
export type SelectLegalDocument = typeof legalDocuments.$inferSelect;

// 5. Document Instances
export const insertDocumentInstanceSchema = createInsertSchema(documentInstances)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    filledContent: z.string().min(1),
    variables: z.record(z.any()).optional(),
    status: z.enum(['draft', 'pending_signature', 'signed', 'archived']).default('draft'),
  });
export const selectDocumentInstanceSchema = createSelectSchema(documentInstances);
export type InsertDocumentInstance = z.infer<typeof insertDocumentInstanceSchema>;
export type SelectDocumentInstance = typeof documentInstances.$inferSelect;

// 6. Document Signatures
export const insertDocumentSignatureSchema = createInsertSchema(documentSignatures)
  .omit({ id: true, signedAt: true })
  .extend({
    signerName: z.string().min(1).max(255),
    signerEmail: z.string().email().max(255),
    signatureData: z.string().min(1),
    ipAddress: z.string().max(45).optional(),
    verificationMethod: z.enum(['email', 'sms', 'manual']),
  });
export const selectDocumentSignatureSchema = createSelectSchema(documentSignatures);
export type InsertDocumentSignature = z.infer<typeof insertDocumentSignatureSchema>;
export type SelectDocumentSignature = typeof documentSignatures.$inferSelect;

// 7. Marketplace Products
export const insertMarketplaceProductSchema = createInsertSchema(marketplaceProducts)
  .omit({ id: true, createdAt: true, updatedAt: true, totalSales: true, revenue: true, rating: true })
  .extend({
    title: z.string().min(1).max(255),
    description: z.string().min(10),
    category: z.enum(['course', 'music', 'choreography', 'video', 'ebook', 'template', 'tutorial']),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/),
    currency: z.string().length(3).default("USD"),
    mediaUrls: z.array(z.string().url()).optional(),
    downloadUrl: z.string().url().max(500).optional(),
    sampleUrl: z.string().url().max(500).optional(),
    fileSize: z.number().int().optional(),
    fileFormat: z.string().max(50).optional(),
    tags: z.array(z.string()).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    duration: z.number().int().optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
  });
export const selectMarketplaceProductSchema = createSelectSchema(marketplaceProducts);
export type InsertMarketplaceProduct = z.infer<typeof insertMarketplaceProductSchema>;
export type SelectMarketplaceProduct = typeof marketplaceProducts.$inferSelect;

// 8. Product Purchases
export const insertProductPurchaseSchema = createInsertSchema(productPurchases)
  .omit({ id: true, purchasedAt: true, downloadCount: true })
  .extend({
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
    platformFee: z.string().regex(/^\d+(\.\d{1,2})?$/),
    creatorPayout: z.string().regex(/^\d+(\.\d{1,2})?$/),
    stripePaymentId: z.string().max(255).optional(),
    refundStatus: z.enum(['none', 'pending', 'refunded']).optional(),
  });
export const selectProductPurchaseSchema = createSelectSchema(productPurchases);
export type InsertProductPurchase = z.infer<typeof insertProductPurchaseSchema>;
export type SelectProductPurchase = typeof productPurchases.$inferSelect;

// 9. Product Reviews
export const insertProductReviewSchema = createInsertSchema(productReviews)
  .omit({ id: true, createdAt: true, updatedAt: true, helpfulCount: true, isPurchaseVerified: true })
  .extend({
    rating: z.number().int().min(1).max(5),
    review: z.string().optional(),
  });
export const selectProductReviewSchema = createSelectSchema(productReviews);
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;
export type SelectProductReview = typeof productReviews.$inferSelect;

// 10. Marketplace Analytics
export const insertMarketplaceAnalyticsSchema = createInsertSchema(marketplaceAnalytics)
  .omit({ id: true, calculatedAt: true })
  .extend({
    period: z.enum(['day', 'week', 'month']),
    totalRevenue: z.string().regex(/^\d+(\.\d{1,2})?$/),
    platformFees: z.string().regex(/^\d+(\.\d{1,2})?$/),
    netRevenue: z.string().regex(/^\d+(\.\d{1,2})?$/),
    totalSales: z.number().int().min(0),
    productsSold: z.record(z.any()).optional(),
    topProducts: z.record(z.any()).optional(),
  });
export const selectMarketplaceAnalyticsSchema = createSelectSchema(marketplaceAnalytics);
export type InsertMarketplaceAnalytics = z.infer<typeof insertMarketplaceAnalyticsSchema>;
export type SelectMarketplaceAnalytics = typeof marketplaceAnalytics.$inferSelect;

// ============================================================================
// TRAVEL INTEGRATION SYSTEM (WAVE 1 - STREAM 4, Agent #157)
// ============================================================================

// 1. Travel Searches - Search history & preferences
export const travelSearches = pgTable("travel_searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  searchType: varchar("search_type", { length: 50 }).notNull(),
  origin: varchar("origin", { length: 100 }),
  destination: varchar("destination", { length: 100 }),
  departDate: timestamp("depart_date"),
  returnDate: timestamp("return_date"),
  passengers: integer("passengers").default(1),
  cabinClass: varchar("cabin_class", { length: 50 }),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  preferences: jsonb("preferences"),
  relatedEventId: integer("related_event_id").references(() => events.id, { onDelete: "set null" }),
  searchedAt: timestamp("searched_at").defaultNow(),
}, (table) => ({
  userIdx: index("travel_searches_user_idx").on(table.userId),
  eventIdx: index("travel_searches_event_idx").on(table.relatedEventId),
  searchedAtIdx: index("travel_searches_searched_at_idx").on(table.searchedAt),
  typeIdx: index("travel_searches_type_idx").on(table.searchType),
}));

// 2. Flight Results - Cached flight search results
export const flightResults = pgTable("flight_results", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").notNull().references(() => travelSearches.id, { onDelete: "cascade" }),
  apiProvider: varchar("api_provider", { length: 50 }).notNull(),
  airline: varchar("airline", { length: 100 }),
  flightNumber: varchar("flight_number", { length: 50 }),
  departureAirport: varchar("departure_airport", { length: 10 }),
  arrivalAirport: varchar("arrival_airport", { length: 10 }),
  departureTime: timestamp("departure_time"),
  arrivalTime: timestamp("arrival_time"),
  duration: integer("duration"),
  stops: integer("stops").default(0),
  price: numeric("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  cabinClass: varchar("cabin_class", { length: 50 }),
  availableSeats: integer("available_seats"),
  deepLink: text("deep_link"),
  rawData: jsonb("raw_data"),
  cachedAt: timestamp("cached_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
}, (table) => ({
  searchIdx: index("flight_results_search_idx").on(table.searchId),
  providerIdx: index("flight_results_provider_idx").on(table.apiProvider),
  priceIdx: index("flight_results_price_idx").on(table.price),
  expiresIdx: index("flight_results_expires_idx").on(table.expiresAt),
}));

// 3. Accommodation Results - Cached accommodation results
export const accommodationResults = pgTable("accommodation_results", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").notNull().references(() => travelSearches.id, { onDelete: "cascade" }),
  apiProvider: varchar("api_provider", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }),
  address: text("address"),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  pricePerNight: numeric("price_per_night", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  roomType: varchar("room_type", { length: 100 }),
  amenities: text("amenities").array(),
  imageUrls: text("image_urls").array(),
  deepLink: text("deep_link"),
  distanceToEvent: numeric("distance_to_event", { precision: 10, scale: 2 }),
  rawData: jsonb("raw_data"),
  cachedAt: timestamp("cached_at").defaultNow(),
}, (table) => ({
  searchIdx: index("accommodation_results_search_idx").on(table.searchId),
  providerIdx: index("accommodation_results_provider_idx").on(table.apiProvider),
  priceIdx: index("accommodation_results_price_idx").on(table.pricePerNight),
  ratingIdx: index("accommodation_results_rating_idx").on(table.rating),
}));

// 4. Trip Plans - User trip itineraries
export const tripPlans = pgTable("trip_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  relatedEventIds: integer("related_event_ids").array(),
  flightBookingId: integer("flight_booking_id"),
  accommodationBookingId: integer("accommodation_booking_id"),
  status: varchar("status", { length: 50 }).default("planning"),
  visibility: varchar("visibility", { length: 50 }).default("private"),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  actualSpent: numeric("actual_spent", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("trip_plans_user_idx").on(table.userId),
  statusIdx: index("trip_plans_status_idx").on(table.status),
  datesIdx: index("trip_plans_dates_idx").on(table.startDate, table.endDate),
}));

// 5. Travel Bookings - Actual bookings (flights + hotels)
export const travelBookings = pgTable("travel_bookings", {
  id: serial("id").primaryKey(),
  tripPlanId: integer("trip_plan_id").references(() => tripPlans.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookingType: varchar("booking_type", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 255 }),
  confirmationCode: varchar("confirmation_code", { length: 100 }),
  bookingReference: varchar("booking_reference", { length: 100 }),
  passengerDetails: jsonb("passenger_details"),
  price: numeric("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  bookingDate: timestamp("booking_date").defaultNow(),
  status: varchar("status", { length: 50 }).default("confirmed"),
  cancellationPolicy: text("cancellation_policy"),
  rawBookingData: jsonb("raw_booking_data"),
}, (table) => ({
  tripIdx: index("travel_bookings_trip_idx").on(table.tripPlanId),
  userIdx: index("travel_bookings_user_idx").on(table.userId),
  statusIdx: index("travel_bookings_status_idx").on(table.status),
  typeIdx: index("travel_bookings_type_idx").on(table.bookingType),
}));

// 6. Trip Itinerary Items - Daily itinerary items
export const tripItineraryItems = pgTable("trip_itinerary_items", {
  id: serial("id").primaryKey(),
  tripPlanId: integer("trip_plan_id").notNull().references(() => tripPlans.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  time: varchar("time", { length: 10 }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),
  itemType: varchar("item_type", { length: 50 }).notNull(),
  relatedEventId: integer("related_event_id").references(() => events.id, { onDelete: "set null" }),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  bookingRequired: boolean("booking_required").default(false),
  notes: text("notes"),
  order: integer("order").default(0),
}, (table) => ({
  tripIdx: index("trip_itinerary_items_trip_idx").on(table.tripPlanId),
  dateIdx: index("trip_itinerary_items_date_idx").on(table.date),
  typeIdx: index("trip_itinerary_items_type_idx").on(table.itemType),
  eventIdx: index("trip_itinerary_items_event_idx").on(table.relatedEventId),
}));

// 7. Travel Preferences - User travel preferences
export const travelPreferences = pgTable("travel_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  preferredAirlines: text("preferred_airlines").array(),
  preferredCabinClass: varchar("preferred_cabin_class", { length: 50 }),
  seatPreference: varchar("seat_preference", { length: 50 }),
  mealPreference: varchar("meal_preference", { length: 100 }),
  frequentFlyerNumbers: jsonb("frequent_flyer_numbers"),
  accommodationPreferences: jsonb("accommodation_preferences"),
  budgetRange: jsonb("budget_range"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: uniqueIndex("travel_preferences_user_idx").on(table.userId),
}));

// 8. Travel Buddies - Find travel companions
export const travelBuddies = pgTable("travel_buddies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tripPlanId: integer("trip_plan_id").references(() => tripPlans.id, { onDelete: "set null" }),
  destination: varchar("destination", { length: 255 }),
  travelDates: varchar("travel_dates", { length: 100 }),
  lookingFor: varchar("looking_for", { length: 50 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("travel_buddies_user_idx").on(table.userId),
  destinationIdx: index("travel_buddies_destination_idx").on(table.destination),
  statusIdx: index("travel_buddies_status_idx").on(table.status),
}));

// 9. Travel Alerts - Price drop alerts
export const travelAlerts = pgTable("travel_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  searchId: integer("search_id").notNull().references(() => travelSearches.id, { onDelete: "cascade" }),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  targetPrice: numeric("target_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  lastCheckedAt: timestamp("last_checked_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("travel_alerts_user_idx").on(table.userId),
  searchIdx: index("travel_alerts_search_idx").on(table.searchId),
  activeIdx: index("travel_alerts_active_idx").on(table.isActive),
}));

// 10. Travel API Cache - API response caching
export const travelApiCache = pgTable("travel_api_cache", {
  id: serial("id").primaryKey(),
  cacheKey: varchar("cache_key", { length: 500 }).notNull().unique(),
  apiProvider: varchar("api_provider", { length: 50 }).notNull(),
  endpoint: varchar("endpoint", { length: 255 }),
  requestParams: jsonb("request_params"),
  response: jsonb("response"),
  cachedAt: timestamp("cached_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
}, (table) => ({
  keyIdx: uniqueIndex("travel_api_cache_key_idx").on(table.cacheKey),
  providerIdx: index("travel_api_cache_provider_idx").on(table.apiProvider),
  expiresIdx: index("travel_api_cache_expires_idx").on(table.expiresAt),
}));

// ============================================================================
// TRAVEL INTEGRATION ZOD VALIDATION SCHEMAS
// ============================================================================

// 1. Travel Searches
export const insertTravelSearchSchema = createInsertSchema(travelSearches)
  .omit({ id: true, searchedAt: true })
  .extend({
    searchType: z.enum(['flight', 'accommodation', 'package']),
    origin: z.string().max(100).optional(),
    destination: z.string().max(100).optional(),
    departDate: z.coerce.date().optional(),
    returnDate: z.coerce.date().optional(),
    passengers: z.number().int().min(1).max(20).default(1),
    cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']).optional(),
    budget: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    preferences: z.record(z.any()).optional(),
  });
export const selectTravelSearchSchema = createSelectSchema(travelSearches);
export type InsertTravelSearch = z.infer<typeof insertTravelSearchSchema>;
export type SelectTravelSearch = typeof travelSearches.$inferSelect;

// 2. Flight Results
export const insertFlightResultSchema = createInsertSchema(flightResults)
  .omit({ id: true, cachedAt: true })
  .extend({
    apiProvider: z.enum(['serpapi', 'kiwi', 'amadeus']),
    airline: z.string().max(100).optional(),
    flightNumber: z.string().max(50).optional(),
    departureAirport: z.string().max(10).optional(),
    arrivalAirport: z.string().max(10).optional(),
    departureTime: z.coerce.date().optional(),
    arrivalTime: z.coerce.date().optional(),
    duration: z.number().int().optional(),
    stops: z.number().int().min(0).default(0),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    currency: z.string().length(3).default("USD"),
    cabinClass: z.string().max(50).optional(),
    availableSeats: z.number().int().optional(),
    deepLink: z.string().url().optional(),
    rawData: z.record(z.any()).optional(),
    expiresAt: z.coerce.date().optional(),
  });
export const selectFlightResultSchema = createSelectSchema(flightResults);
export type InsertFlightResult = z.infer<typeof insertFlightResultSchema>;
export type SelectFlightResult = typeof flightResults.$inferSelect;

// 3. Accommodation Results
export const insertAccommodationResultSchema = createInsertSchema(accommodationResults)
  .omit({ id: true, cachedAt: true })
  .extend({
    apiProvider: z.enum(['booking', 'airbnb', 'hotels']),
    name: z.string().max(255).optional(),
    address: z.string().optional(),
    lat: z.string().regex(/^-?\d+(\.\d+)?$/).optional(),
    lng: z.string().regex(/^-?\d+(\.\d+)?$/).optional(),
    rating: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    reviewCount: z.number().int().min(0).default(0),
    pricePerNight: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    currency: z.string().length(3).default("USD"),
    totalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    checkIn: z.coerce.date().optional(),
    checkOut: z.coerce.date().optional(),
    roomType: z.string().max(100).optional(),
    amenities: z.array(z.string()).optional(),
    imageUrls: z.array(z.string().url()).optional(),
    deepLink: z.string().url().optional(),
    distanceToEvent: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    rawData: z.record(z.any()).optional(),
  });
export const selectAccommodationResultSchema = createSelectSchema(accommodationResults);
export type InsertAccommodationResult = z.infer<typeof insertAccommodationResultSchema>;
export type SelectAccommodationResult = typeof accommodationResults.$inferSelect;

// 4. Trip Plans
export const insertTripPlanSchema = createInsertSchema(tripPlans)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    title: z.string().min(1).max(255),
    destination: z.string().max(255).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    relatedEventIds: z.array(z.number().int()).optional(),
    flightBookingId: z.number().int().optional(),
    accommodationBookingId: z.number().int().optional(),
    status: z.enum(['planning', 'confirmed', 'in_progress', 'completed', 'cancelled']).default('planning'),
    visibility: z.enum(['private', 'friends', 'public']).default('private'),
    budget: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    actualSpent: z.string().regex(/^\d+(\.\d{1,2})?$/).default("0"),
    notes: z.string().optional(),
  });
export const selectTripPlanSchema = createSelectSchema(tripPlans);
export type InsertTripPlan = z.infer<typeof insertTripPlanSchema>;
export type SelectTripPlan = typeof tripPlans.$inferSelect;

// 5. Travel Bookings
export const insertTravelBookingSchema = createInsertSchema(travelBookings)
  .omit({ id: true, bookingDate: true })
  .extend({
    bookingType: z.enum(['flight', 'accommodation', 'package']),
    provider: z.string().max(255).optional(),
    confirmationCode: z.string().max(100).optional(),
    bookingReference: z.string().max(100).optional(),
    passengerDetails: z.record(z.any()).optional(),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    currency: z.string().length(3).default("USD"),
    status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']).default('confirmed'),
    cancellationPolicy: z.string().optional(),
    rawBookingData: z.record(z.any()).optional(),
  });
export const selectTravelBookingSchema = createSelectSchema(travelBookings);
export type InsertTravelBooking = z.infer<typeof insertTravelBookingSchema>;
export type SelectTravelBooking = typeof travelBookings.$inferSelect;

// 6. Trip Itinerary Items
export const insertTripItineraryItemSchema = createInsertSchema(tripItineraryItems)
  .omit({ id: true })
  .extend({
    date: z.coerce.date(),
    time: z.string().max(10).optional(),
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    location: z.string().max(255).optional(),
    lat: z.string().regex(/^-?\d+(\.\d+)?$/).optional(),
    lng: z.string().regex(/^-?\d+(\.\d+)?$/).optional(),
    itemType: z.enum(['flight', 'accommodation', 'event', 'activity', 'meal', 'transport', 'free_time']),
    cost: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    bookingRequired: z.boolean().default(false),
    notes: z.string().optional(),
    order: z.number().int().default(0),
  });
export const selectTripItineraryItemSchema = createSelectSchema(tripItineraryItems);
export type InsertTripItineraryItem = z.infer<typeof insertTripItineraryItemSchema>;
export type SelectTripItineraryItem = typeof tripItineraryItems.$inferSelect;

// 7. Travel Preferences
export const insertTravelPreferenceSchema = createInsertSchema(travelPreferences)
  .omit({ id: true, updatedAt: true })
  .extend({
    preferredAirlines: z.array(z.string()).optional(),
    preferredCabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']).optional(),
    seatPreference: z.enum(['window', 'aisle', 'any']).optional(),
    mealPreference: z.string().max(100).optional(),
    frequentFlyerNumbers: z.record(z.any()).optional(),
    accommodationPreferences: z.record(z.any()).optional(),
    budgetRange: z.record(z.any()).optional(),
  });
export const selectTravelPreferenceSchema = createSelectSchema(travelPreferences);
export type InsertTravelPreference = z.infer<typeof insertTravelPreferenceSchema>;
export type SelectTravelPreference = typeof travelPreferences.$inferSelect;

// 8. Travel Buddies
export const insertTravelBuddySchema = createInsertSchema(travelBuddies)
  .omit({ id: true, createdAt: true })
  .extend({
    destination: z.string().max(255).optional(),
    travelDates: z.string().max(100).optional(),
    lookingFor: z.enum(['roommate', 'travel_companion', 'event_buddy']),
    message: z.string().optional(),
    status: z.enum(['active', 'matched', 'inactive']).default('active'),
  });
export const selectTravelBuddySchema = createSelectSchema(travelBuddies);
export type InsertTravelBuddy = z.infer<typeof insertTravelBuddySchema>;
export type SelectTravelBuddy = typeof travelBuddies.$inferSelect;

// 9. Travel Alerts
export const insertTravelAlertSchema = createInsertSchema(travelAlerts)
  .omit({ id: true, createdAt: true, lastCheckedAt: true })
  .extend({
    alertType: z.enum(['price_drop', 'availability', 'deal']),
    targetPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    isActive: z.boolean().default(true),
  });
export const selectTravelAlertSchema = createSelectSchema(travelAlerts);
export type InsertTravelAlert = z.infer<typeof insertTravelAlertSchema>;
export type SelectTravelAlert = typeof travelAlerts.$inferSelect;

// 10. Travel API Cache
export const insertTravelApiCacheSchema = createInsertSchema(travelApiCache)
  .omit({ id: true, cachedAt: true })
  .extend({
    cacheKey: z.string().min(1).max(500),
    apiProvider: z.enum(['serpapi', 'kiwi', 'amadeus', 'booking']),
    endpoint: z.string().max(255).optional(),
    requestParams: z.record(z.any()).optional(),
    response: z.record(z.any()).optional(),
    expiresAt: z.coerce.date().optional(),
  });
export const selectTravelApiCacheSchema = createSelectSchema(travelApiCache);
export type InsertTravelApiCache = z.infer<typeof insertTravelApiCacheSchema>;
export type SelectTravelApiCache = typeof travelApiCache.$inferSelect;

// ============================================================================
// LEGAL AI AGENTS SYSTEM - Additional Tables (Agents #185-186)
// ============================================================================

// 1. Legal Clauses - Clause database for AI recommendations
export const legalClauses = pgTable("legal_clauses", {
  id: serial("id").primaryKey(),
  clauseType: varchar("clause_type", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  description: text("description"),
  jurisdiction: varchar("jurisdiction", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  riskLevel: varchar("risk_level", { length: 20 }).default("medium"),
  isRequired: boolean("is_required").default(false),
  tags: text("tags").array(),
  alternatives: jsonb("alternatives"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  typeIdx: index("legal_clauses_type_idx").on(table.clauseType),
  categoryIdx: index("legal_clauses_category_idx").on(table.category),
  jurisdictionIdx: index("legal_clauses_jurisdiction_idx").on(table.jurisdiction),
  industryIdx: index("legal_clauses_industry_idx").on(table.industry),
}));

// 2. Document Reviews - AI agent review results
export const documentReviews = pgTable("document_reviews", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => legalDocuments.id, { onDelete: "cascade" }),
  instanceId: integer("instance_id").references(() => documentInstances.id, { onDelete: "cascade" }),
  agentType: varchar("agent_type", { length: 50 }).notNull(),
  
  riskScore: integer("risk_score").notNull(),
  completenessScore: integer("completeness_score").notNull(),
  clarityScore: integer("clarity_score").notNull(),
  complianceScore: integer("compliance_score").notNull(),
  overallScore: integer("overall_score").notNull(),
  
  identifiedClauses: jsonb("identified_clauses"),
  missingClauses: jsonb("missing_clauses"),
  riskFactors: jsonb("risk_factors"),
  complianceIssues: jsonb("compliance_issues"),
  suggestions: jsonb("suggestions"),
  plainLanguageAlternatives: jsonb("plain_language_alternatives"),
  
  aiModel: varchar("ai_model", { length: 100 }),
  processingTimeMs: integer("processing_time_ms"),
  
  reviewedAt: timestamp("reviewed_at").defaultNow(),
}, (table) => ({
  documentIdx: index("document_reviews_document_idx").on(table.documentId),
  instanceIdx: index("document_reviews_instance_idx").on(table.instanceId),
  agentTypeIdx: index("document_reviews_agent_type_idx").on(table.agentType),
  reviewedAtIdx: index("document_reviews_reviewed_at_idx").on(table.reviewedAt),
}));

// 3. Document Audit Logs - Action logging for compliance
export const documentAuditLogs = pgTable("document_audit_logs", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => legalDocuments.id, { onDelete: "cascade" }),
  instanceId: integer("instance_id").references(() => documentInstances.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: integer("entity_id"),
  
  changes: jsonb("changes"),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  documentIdx: index("document_audit_logs_document_idx").on(table.documentId),
  instanceIdx: index("document_audit_logs_instance_idx").on(table.instanceId),
  userIdx: index("document_audit_logs_user_idx").on(table.userId),
  actionIdx: index("document_audit_logs_action_idx").on(table.action),
  createdAtIdx: index("document_audit_logs_created_at_idx").on(table.createdAt),
}));

// 4. Legal Agreements - Contract terms tracking
export const legalAgreements = pgTable("legal_agreements", {
  id: serial("id").primaryKey(),
  instanceId: integer("instance_id").notNull().references(() => documentInstances.id, { onDelete: "cascade" }),
  agreementType: varchar("agreement_type", { length: 100 }).notNull(),
  
  partyA: jsonb("party_a").notNull(),
  partyB: jsonb("party_b").notNull(),
  additionalParties: jsonb("additional_parties"),
  
  keyTerms: jsonb("key_terms"),
  effectiveDate: timestamp("effective_date"),
  expirationDate: timestamp("expiration_date"),
  
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  executionDate: timestamp("execution_date"),
  
  autoRenew: boolean("auto_renew").default(false),
  renewalTerms: text("renewal_terms"),
  terminationNotice: integer("termination_notice"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  instanceIdx: index("legal_agreements_instance_idx").on(table.instanceId),
  typeIdx: index("legal_agreements_type_idx").on(table.agreementType),
  statusIdx: index("legal_agreements_status_idx").on(table.status),
  effectiveDateIdx: index("legal_agreements_effective_date_idx").on(table.effectiveDate),
  expirationDateIdx: index("legal_agreements_expiration_date_idx").on(table.expirationDate),
}));

// Zod Validation Schemas

export const insertLegalClauseSchema = createInsertSchema(legalClauses)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    clauseType: z.string().min(1).max(100),
    category: z.string().min(1).max(50),
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    description: z.string().optional(),
    jurisdiction: z.string().max(100).optional(),
    industry: z.string().max(100).optional(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    isRequired: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    alternatives: z.record(z.any()).optional(),
  });
export const selectLegalClauseSchema = createSelectSchema(legalClauses);
export type InsertLegalClause = z.infer<typeof insertLegalClauseSchema>;
export type SelectLegalClause = typeof legalClauses.$inferSelect;

export const insertDocumentReviewSchema = createInsertSchema(documentReviews)
  .omit({ id: true, reviewedAt: true })
  .extend({
    agentType: z.enum(['document-reviewer', 'contract-assistant', 'compliance-checker']),
    riskScore: z.number().int().min(0).max(100),
    completenessScore: z.number().int().min(0).max(100),
    clarityScore: z.number().int().min(0).max(100),
    complianceScore: z.number().int().min(0).max(100),
    overallScore: z.number().int().min(0).max(100),
    identifiedClauses: z.record(z.any()).optional(),
    missingClauses: z.record(z.any()).optional(),
    riskFactors: z.record(z.any()).optional(),
    complianceIssues: z.record(z.any()).optional(),
    suggestions: z.record(z.any()).optional(),
    plainLanguageAlternatives: z.record(z.any()).optional(),
    aiModel: z.string().max(100).optional(),
    processingTimeMs: z.number().int().optional(),
  });
export const selectDocumentReviewSchema = createSelectSchema(documentReviews);
export type InsertDocumentReview = z.infer<typeof insertDocumentReviewSchema>;
export type SelectDocumentReview = typeof documentReviews.$inferSelect;

export const insertDocumentAuditLogSchema = createInsertSchema(documentAuditLogs)
  .omit({ id: true, createdAt: true })
  .extend({
    action: z.string().min(1).max(100),
    entityType: z.string().min(1).max(50),
    entityId: z.number().int().optional(),
    changes: z.record(z.any()).optional(),
    metadata: z.record(z.any()).optional(),
    ipAddress: z.string().max(45).optional(),
    userAgent: z.string().optional(),
  });
export const selectDocumentAuditLogSchema = createSelectSchema(documentAuditLogs);
export type InsertDocumentAuditLog = z.infer<typeof insertDocumentAuditLogSchema>;
export type SelectDocumentAuditLog = typeof documentAuditLogs.$inferSelect;

export const insertLegalAgreementSchema = createInsertSchema(legalAgreements)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    agreementType: z.string().min(1).max(100),
    partyA: z.record(z.any()),
    partyB: z.record(z.any()),
    additionalParties: z.array(z.record(z.any())).optional(),
    keyTerms: z.record(z.any()).optional(),
    effectiveDate: z.coerce.date().optional(),
    expirationDate: z.coerce.date().optional(),
    status: z.enum(['pending', 'active', 'expired', 'terminated', 'renewed']).default('pending'),
    executionDate: z.coerce.date().optional(),
    autoRenew: z.boolean().default(false),
    renewalTerms: z.string().optional(),
    terminationNotice: z.number().int().optional(),
  });
export const selectLegalAgreementSchema = createSelectSchema(legalAgreements);
export type InsertLegalAgreement = z.infer<typeof insertLegalAgreementSchema>;
export type SelectLegalAgreement = typeof legalAgreements.$inferSelect;

// ============================================================================
// GDPR COMPLIANCE TABLES
// ============================================================================

export const dataExportRequests = pgTable("data_export_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  format: varchar("format", { length: 10 }).default("json").notNull(),
  fileUrl: text("file_url"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("data_export_requests_user_idx").on(table.userId),
  statusIdx: index("data_export_requests_status_idx").on(table.status),
  requestedAtIdx: index("data_export_requests_requested_at_idx").on(table.requestedAt),
}));

export const userPrivacySettings = pgTable("user_privacy_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  marketingEmails: boolean("marketing_emails").default(true).notNull(),
  analytics: boolean("analytics").default(true).notNull(),
  thirdPartySharing: boolean("third_party_sharing").default(false).notNull(),
  profileVisibility: varchar("profile_visibility", { length: 20 }).default("public").notNull(),
  searchable: boolean("searchable").default(true).notNull(),
  showActivity: boolean("show_activity").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: uniqueIndex("user_privacy_settings_user_idx").on(table.userId),
}));

export const insertDataExportRequestSchema = createInsertSchema(dataExportRequests)
  .omit({ id: true, requestedAt: true })
  .extend({
    format: z.enum(['json', 'csv', 'zip']).default('json'),
    status: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
  });
export const selectDataExportRequestSchema = createSelectSchema(dataExportRequests);
export type InsertDataExportRequest = z.infer<typeof insertDataExportRequestSchema>;
export type SelectDataExportRequest = typeof dataExportRequests.$inferSelect;

export const insertUserPrivacySettingsSchema = createInsertSchema(userPrivacySettings)
  .omit({ id: true, updatedAt: true })
  .extend({
    profileVisibility: z.enum(['public', 'friends', 'private']).default('public'),
    marketingEmails: z.boolean().default(true),
    analytics: z.boolean().default(true),
    thirdPartySharing: z.boolean().default(false),
    searchable: z.boolean().default(true),
    showActivity: z.boolean().default(true),
  });
export const selectUserPrivacySettingsSchema = createSelectSchema(userPrivacySettings);
export type InsertUserPrivacySettings = z.infer<typeof insertUserPrivacySettingsSchema>;
export type SelectUserPrivacySettings = typeof userPrivacySettings.$inferSelect;

// ============================================================================
// PHASE 2: WEBAUTHN/PASSKEYS (Enterprise Security)
// ============================================================================

export const webauthnCredentials = pgTable("webauthn_credentials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  credentialId: text("credential_id").unique().notNull(),
  publicKey: text("public_key").notNull(),
  counter: integer("counter").notNull(),
  deviceType: varchar("device_type", { length: 20 }), // 'platform' or 'cross-platform'
  deviceName: varchar("device_name", { length: 100 }),
  transports: jsonb("transports"), // Array of transport methods
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
}, (table) => ({
  userIdx: index("webauthn_credentials_user_idx").on(table.userId),
  credentialIdx: uniqueIndex("webauthn_credentials_credential_idx").on(table.credentialId),
}));

export const insertWebauthnCredentialSchema = createInsertSchema(webauthnCredentials);

export const selectWebauthnCredentialSchema = createSelectSchema(webauthnCredentials);
export type InsertWebauthnCredential = z.infer<typeof insertWebauthnCredentialSchema>;
export type SelectWebauthnCredential = typeof webauthnCredentials.$inferSelect;

// ============================================================================
// PHASE 2: ANOMALY DETECTION (Enterprise Security)
// ============================================================================

export const anomalyDetections = pgTable("anomaly_detections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  type: varchar("type", { length: 50 }).notNull(), // 'failed_login', 'unusual_api_usage', etc.
  severity: varchar("severity", { length: 20 }).notNull(), // 'low', 'medium', 'high', 'critical'
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  resolved: boolean("resolved").default(false).notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id, { onDelete: "set null" }),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("anomaly_detections_user_idx").on(table.userId),
  typeIdx: index("anomaly_detections_type_idx").on(table.type),
  severityIdx: index("anomaly_detections_severity_idx").on(table.severity),
  resolvedIdx: index("anomaly_detections_resolved_idx").on(table.resolved),
  detectedAtIdx: index("anomaly_detections_detected_at_idx").on(table.detectedAt),
}));

export const insertAnomalyDetectionSchema = createInsertSchema(anomalyDetections)
  .omit({ id: true, detectedAt: true });

export const selectAnomalyDetectionSchema = createSelectSchema(anomalyDetections);
export type InsertAnomalyDetection = z.infer<typeof insertAnomalyDetectionSchema>;
export type SelectAnomalyDetection = typeof anomalyDetections.$inferSelect;

// ============================================================================
// PHASE 4: ADVANCED LOGGING (Enterprise Scale)
// ============================================================================

export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  level: varchar("level", { length: 20 }).notNull(), // 'info', 'warn', 'error', 'debug'
  category: varchar("category", { length: 50 }).notNull(), // 'application', 'security', 'performance', 'audit'
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  requestId: varchar("request_id", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  levelIdx: index("system_logs_level_idx").on(table.level),
  categoryIdx: index("system_logs_category_idx").on(table.category),
  userIdx: index("system_logs_user_idx").on(table.userId),
  timestampIdx: index("system_logs_timestamp_idx").on(table.timestamp),
}));

export const insertSystemLogSchema = createInsertSchema(systemLogs)
  .omit({ id: true, timestamp: true });

export const selectSystemLogSchema = createSelectSchema(systemLogs);
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type SelectSystemLog = typeof systemLogs.$inferSelect;

// ============================================================================
// TANGO SCRAPING SYSTEM - COMMUNITY METADATA (Track 3 - MB.MD God Level)
// Note: scrapedEvents already exists at line 7696 (Agents #120-124)
// Adding new tables for community metadata extraction
// ============================================================================

export const scrapedCommunityData = pgTable("scraped_community_data", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").references(() => eventScrapingSources.id, { onDelete: "cascade" }).notNull(),
  communityName: text("community_name"),
  description: text("description"),
  history: text("history"),
  culture: text("culture"),
  rules: text("rules").array(),
  dressCode: text("dress_code"),
  etiquette: text("etiquette").array(),
  organizers: jsonb("organizers"),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  facebookUrl: text("facebook_url"),
  facebookGroupId: varchar("facebook_group_id", { length: 100 }),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  whatsappGroupLink: text("whatsapp_group_link"),
  websiteUrl: text("website_url"),
  memberCount: integer("member_count"),
  foundedYear: integer("founded_year"),
  isActive: boolean("is_active").default(true).notNull(),
  coverPhotoUrl: text("cover_photo_url"),
  logoUrl: text("logo_url"),
  galleryPhotos: text("gallery_photos").array(),
  dataQuality: integer("data_quality").default(0).notNull(),
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated"),
  cityGroupId: integer("city_group_id").references(() => groups.id, { onDelete: "set null" }),
  approved: boolean("approved").default(false).notNull(),
  reviewedBy: integer("reviewed_by").references(() => users.id, { onDelete: "set null" }),
}, (table) => ({
  sourceIdx: index("scraped_community_source_idx").on(table.sourceId),
  groupIdx: index("scraped_community_group_idx").on(table.cityGroupId),
  approvedIdx: index("scraped_community_approved_idx").on(table.approved),
}));

export const insertScrapedCommunityDataSchema = createInsertSchema(scrapedCommunityData)
  .omit({ id: true, scrapedAt: true });

export const selectScrapedCommunityDataSchema = createSelectSchema(scrapedCommunityData);
export type InsertScrapedCommunityData = z.infer<typeof insertScrapedCommunityDataSchema>;
export type SelectScrapedCommunityData = typeof scrapedCommunityData.$inferSelect;

export const scrapedProfiles = pgTable("scraped_profiles", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").references(() => eventScrapingSources.id, { onDelete: "cascade" }),
  profileType: varchar("profile_type", { length: 50 }).notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  socialLinks: jsonb("social_links"),
  metadata: jsonb("metadata"),
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
  claimed: boolean("claimed").default(false).notNull(),
  claimedBy: integer("claimed_by").references(() => users.id, { onDelete: "set null" }),
  claimedAt: timestamp("claimed_at"),
}, (table) => ({
  typeIdx: index("scraped_profiles_type_idx").on(table.profileType),
  claimedIdx: index("scraped_profiles_claimed_idx").on(table.claimed),
  nameIdx: index("scraped_profiles_name_idx").on(table.name),
}));

export const insertScrapedProfileSchema = createInsertSchema(scrapedProfiles)
  .omit({ id: true, scrapedAt: true });

export const selectScrapedProfileSchema = createSelectSchema(scrapedProfiles);
export type InsertScrapedProfile = z.infer<typeof insertScrapedProfileSchema>;
export type SelectScrapedProfile = typeof scrapedProfiles.$inferSelect;

// ============================================================================
// WAVE 4: SECURITY & COMPLIANCE (P0 #6-9)
// ============================================================================

// Two-Factor Authentication (P0 #7)
export const userTwoFactor = pgTable("user_two_factor", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  method: varchar("method", { length: 20 }).notNull(), // 'totp', 'sms', 'email'
  secret: varchar("secret", { length: 255 }), // TOTP secret (encrypted)
  backupCodes: text("backup_codes").array(), // Encrypted backup codes
  phoneNumber: varchar("phone_number", { length: 20 }), // For SMS
  isEnabled: boolean("is_enabled").default(false).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  
  // ENCRYPTED FIELD: Stores sensitive 2FA secrets and backup codes
  // {secret: string, backupCodes: string[], recoveryEmail?: string}
  encryptedData: text("encrypted_data"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_two_factor_user_idx").on(table.userId),
  methodIdx: index("user_two_factor_method_idx").on(table.method),
}));

export const insertUserTwoFactorSchema = createInsertSchema(userTwoFactor)
  .omit({ id: true, createdAt: true });
export const selectUserTwoFactorSchema = createSelectSchema(userTwoFactor);
export type InsertUserTwoFactor = z.infer<typeof insertUserTwoFactorSchema>;
export type SelectUserTwoFactor = typeof userTwoFactor.$inferSelect;

// Legal Agreements (P0 #9)
export const codeOfConductAgreements = pgTable("code_of_conduct_agreements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  privacyPolicyVersion: varchar("privacy_policy_version", { length: 20 }).notNull(),
  tosVersion: varchar("tos_version", { length: 20 }).notNull(),
  cocVersion: varchar("coc_version", { length: 20 }).notNull(),
  acceptedAt: timestamp("accepted_at").defaultNow().notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
}, (table) => ({
  userIdx: index("coc_agreements_user_idx").on(table.userId),
  acceptedAtIdx: index("coc_agreements_accepted_at_idx").on(table.acceptedAt),
}));

export const insertCodeOfConductAgreementSchema = createInsertSchema(codeOfConductAgreements)
  .omit({ id: true, acceptedAt: true });
export const selectCodeOfConductAgreementSchema = createSelectSchema(codeOfConductAgreements);
export type InsertCodeOfConductAgreement = z.infer<typeof insertCodeOfConductAgreementSchema>;
export type SelectCodeOfConductAgreement = typeof codeOfConductAgreements.$inferSelect;

// Housing Revenue Tracking (P0 #4 - Extension)
export const housingBookingPayments = pgTable("housing_booking_payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => housingBookings.id, { onDelete: "cascade" }),
  
  // Pricing breakdown (all in cents)
  subtotal: integer("subtotal").notNull(), // Listing price * nights
  cleaningFee: integer("cleaning_fee").default(0).notNull(),
  guestServiceFee: integer("guest_service_fee").notNull(), // 5% of subtotal
  hostServiceFee: integer("host_service_fee").notNull(), // 12% of subtotal
  totalCharged: integer("total_charged").notNull(), // What guest pays
  
  // Host payout
  hostPayout: integer("host_payout").notNull(), // subtotal + cleaning - host fee
  platformRevenue: integer("platform_revenue").notNull(), // guest fee + host fee
  
  // Stripe tracking
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeTransferId: varchar("stripe_transfer_id", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, paid, transferred, failed
  paidAt: timestamp("paid_at"),
  transferredAt: timestamp("transferred_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  bookingIdx: index("housing_payments_booking_idx").on(table.bookingId),
  statusIdx: index("housing_payments_status_idx").on(table.status),
  stripeIdx: index("housing_payments_stripe_idx").on(table.stripePaymentIntentId),
}));

export const insertHousingBookingPaymentSchema = createInsertSchema(housingBookingPayments)
  .omit({ id: true, createdAt: true });
export const selectHousingBookingPaymentSchema = createSelectSchema(housingBookingPayments);
export type InsertHousingBookingPayment = z.infer<typeof insertHousingBookingPaymentSchema>;
export type SelectHousingBookingPayment = typeof housingBookingPayments.$inferSelect;

// Event Revenue Tracking (P0 #4 - Extension)
export const eventTicketPurchases = pgTable("event_ticket_purchases", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ticketCount: integer("ticket_count").notNull(),
  
  // Pricing (all in cents)
  ticketPrice: integer("ticket_price").notNull(),
  platformFee: integer("platform_fee").notNull(), // 10% of subtotal
  totalPaid: integer("total_paid").notNull(),
  
  // Organizer payout
  organizerPayout: integer("organizer_payout").notNull(),
  
  // Stripe tracking
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeTransferId: varchar("stripe_transfer_id", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  paidAt: timestamp("paid_at"),
  transferredAt: timestamp("transferred_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  eventIdx: index("event_tickets_event_idx").on(table.eventId),
  userIdx: index("event_tickets_user_idx").on(table.userId),
  statusIdx: index("event_tickets_status_idx").on(table.status),
}));

export const insertEventTicketPurchaseSchema = createInsertSchema(eventTicketPurchases)
  .omit({ id: true, createdAt: true });
export const selectEventTicketPurchaseSchema = createSelectSchema(eventTicketPurchases);
export type InsertEventTicketPurchase = z.infer<typeof insertEventTicketPurchaseSchema>;
export type SelectEventTicketPurchase = typeof eventTicketPurchases.$inferSelect;

// Platform Revenue Aggregation
export const platformRevenue = pgTable("platform_revenue", {
  id: serial("id").primaryKey(),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(), // housing, event_ticket, subscription, ad
  transactionId: integer("transaction_id").notNull(),
  amount: integer("amount").notNull(), // Revenue in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("platform_revenue_type_idx").on(table.transactionType),
  recordedIdx: index("platform_revenue_recorded_idx").on(table.recordedAt),
}));

export const insertPlatformRevenueSchema = createInsertSchema(platformRevenue)
  .omit({ id: true, recordedAt: true });
export const selectPlatformRevenueSchema = createSelectSchema(platformRevenue);
export type InsertPlatformRevenue = z.infer<typeof insertPlatformRevenueSchema>;
export type SelectPlatformRevenue = typeof platformRevenue.$inferSelect;

// Revenue Sharing System (P0 #4)
export const revenueShares = pgTable("revenue_shares", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  transactionType: varchar("transaction_type", { length: 50 }).notNull(), // housing, event_ticket, workshop, marketplace
  transactionId: integer("transaction_id").notNull(),
  role: varchar("role", { length: 50 }).notNull(), // host, organizer, teacher, seller
  platformFee: integer("platform_fee").notNull(), // Platform's share in cents
  creatorPayout: integer("creator_payout").notNull(), // Creator's share in cents
  totalAmount: integer("total_amount").notNull(), // Total transaction amount in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, paid, failed
  stripeTransferId: varchar("stripe_transfer_id", { length: 255 }),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("revenue_shares_user_idx").on(table.userId),
  typeIdx: index("revenue_shares_type_idx").on(table.transactionType),
  statusIdx: index("revenue_shares_status_idx").on(table.status),
  createdIdx: index("revenue_shares_created_idx").on(table.createdAt),
}));

export const insertRevenueShareSchema = createInsertSchema(revenueShares)
  .omit({ id: true, createdAt: true });
export const selectRevenueShareSchema = createSelectSchema(revenueShares);
export type InsertRevenueShare = z.infer<typeof insertRevenueShareSchema>;
export type SelectRevenueShare = typeof revenueShares.$inferSelect;

// GDPR Data Export Requests (P0 #5) - Already defined at line 9067, no duplicate needed

// ============================================================================
// WAVE 4: ENCRYPTION AT REST FOR SENSITIVE DATA (P0 #8)
// Financial, Health, Budget, Nutrition Data with AES-256-GCM Encryption
// ============================================================================

// Financial Goals
export const financialGoals = pgTable("financial_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  goalType: varchar("goal_type", { length: 50 }).notNull(), // 'savings', 'investment', 'debt_reduction', 'retirement'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("active").notNull(), // 'active', 'completed', 'abandoned'
  targetDate: timestamp("target_date"),
  
  // ENCRYPTED FIELD: Stores sensitive financial data
  // {targetAmount: number, currentAmount: number, details: {currency, notes, milestones}}
  encryptedData: text("encrypted_data").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("financial_goals_user_idx").on(table.userId),
  statusIdx: index("financial_goals_status_idx").on(table.status),
  typeIdx: index("financial_goals_type_idx").on(table.goalType),
}));

export const insertFinancialGoalSchema = createInsertSchema(financialGoals)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const selectFinancialGoalSchema = createSelectSchema(financialGoals);
export type InsertFinancialGoal = z.infer<typeof insertFinancialGoalSchema>;
export type SelectFinancialGoal = typeof financialGoals.$inferSelect;

// Budget Entries
export const budgetEntries = pgTable("budget_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => users.id), // Will reference budgetCategories
  entryType: varchar("entry_type", { length: 20 }).notNull(), // 'income', 'expense'
  date: timestamp("date").notNull(),
  merchant: varchar("merchant", { length: 255 }),
  
  // ENCRYPTED FIELD: Stores sensitive financial transaction data
  // {amount: number, description: string, notes: string, currency: string}
  encryptedData: text("encrypted_data").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("budget_entries_user_idx").on(table.userId),
  categoryIdx: index("budget_entries_category_idx").on(table.categoryId),
  dateIdx: index("budget_entries_date_idx").on(table.date),
  typeIdx: index("budget_entries_type_idx").on(table.entryType),
}));

export const insertBudgetEntrySchema = createInsertSchema(budgetEntries)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const selectBudgetEntrySchema = createSelectSchema(budgetEntries);
export type InsertBudgetEntry = z.infer<typeof insertBudgetEntrySchema>;
export type SelectBudgetEntry = typeof budgetEntries.$inferSelect;

// Budget Categories
export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }),
  icon: varchar("icon", { length: 50 }),
  
  // ENCRYPTED FIELD: Stores budget limits and targets
  // {monthlyLimit: number, yearlyTarget: number, notes: string}
  encryptedData: text("encrypted_data"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("budget_categories_user_idx").on(table.userId),
  nameIdx: index("budget_categories_name_idx").on(table.name),
}));

export const insertBudgetCategorySchema = createInsertSchema(budgetCategories)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const selectBudgetCategorySchema = createSelectSchema(budgetCategories);
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type SelectBudgetCategory = typeof budgetCategories.$inferSelect;

// Health Goals
export const healthGoals = pgTable("health_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  goalType: varchar("goal_type", { length: 50 }).notNull(), // 'weight_loss', 'muscle_gain', 'endurance', 'flexibility'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  targetDate: timestamp("target_date"),
  
  // ENCRYPTED FIELD: Stores sensitive health metrics
  // {targetWeight: number, currentWeight: number, metrics: {bmi, bodyFat, measurements}}
  encryptedData: text("encrypted_data").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("health_goals_user_idx").on(table.userId),
  statusIdx: index("health_goals_status_idx").on(table.status),
  typeIdx: index("health_goals_type_idx").on(table.goalType),
}));

export const insertHealthGoalSchema = createInsertSchema(healthGoals)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const selectHealthGoalSchema = createSelectSchema(healthGoals);
export type InsertHealthGoal = z.infer<typeof insertHealthGoalSchema>;
export type SelectHealthGoal = typeof healthGoals.$inferSelect;

// Health Metrics
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  metricType: varchar("metric_type", { length: 50 }).notNull(), // 'weight', 'blood_pressure', 'heart_rate', 'sleep'
  
  // ENCRYPTED FIELD: Stores sensitive health measurements
  // {value: number, unit: string, notes: string, additionalData: object}
  encryptedData: text("encrypted_data").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("health_metrics_user_idx").on(table.userId),
  dateIdx: index("health_metrics_date_idx").on(table.date),
  typeIdx: index("health_metrics_type_idx").on(table.metricType),
}));

export const insertHealthMetricSchema = createInsertSchema(healthMetrics)
  .omit({ id: true, createdAt: true });
export const selectHealthMetricSchema = createSelectSchema(healthMetrics);
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
export type SelectHealthMetric = typeof healthMetrics.$inferSelect;

// Nutrition Logs
export const nutritionLogs = pgTable("nutrition_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  mealType: varchar("meal_type", { length: 20 }).notNull(), // 'breakfast', 'lunch', 'dinner', 'snack'
  foodName: varchar("food_name", { length: 255 }).notNull(),
  
  // ENCRYPTED FIELD: Stores sensitive nutrition data
  // {calories: number, protein: number, carbs: number, fat: number, fiber: number, sugar: number, notes: string}
  encryptedData: text("encrypted_data").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("nutrition_logs_user_idx").on(table.userId),
  dateIdx: index("nutrition_logs_date_idx").on(table.date),
  mealTypeIdx: index("nutrition_logs_meal_type_idx").on(table.mealType),
}));

export const insertNutritionLogSchema = createInsertSchema(nutritionLogs)
  .omit({ id: true, createdAt: true });
export const selectNutritionLogSchema = createSelectSchema(nutritionLogs);
export type InsertNutritionLog = z.infer<typeof insertNutritionLogSchema>;
export type SelectNutritionLog = typeof nutritionLogs.$inferSelect;

// Fitness Activities
export const fitnessActivities = pgTable("fitness_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  activityType: varchar("activity_type", { length: 100 }).notNull(), // 'running', 'cycling', 'swimming', 'strength_training'
  duration: integer("duration"), // in minutes (not encrypted - used for queries)
  
  // ENCRYPTED FIELD: Stores detailed fitness metrics
  // {distance: number, pace: number, heartRate: number, calories: number, notes: string, route: object}
  encryptedData: text("encrypted_data").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("fitness_activities_user_idx").on(table.userId),
  dateIdx: index("fitness_activities_date_idx").on(table.date),
  typeIdx: index("fitness_activities_type_idx").on(table.activityType),
}));

export const insertFitnessActivitySchema = createInsertSchema(fitnessActivities)
  .omit({ id: true, createdAt: true });
export const selectFitnessActivitySchema = createSelectSchema(fitnessActivities);
export type InsertFitnessActivity = z.infer<typeof insertFitnessActivitySchema>;
export type SelectFitnessActivity = typeof fitnessActivities.$inferSelect;

// User Payments (sensitive payment information)
export const userPayments = pgTable("user_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  paymentType: varchar("payment_type", { length: 50 }).notNull(), // 'subscription', 'event_ticket', 'housing', 'marketplace'
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'completed', 'failed', 'refunded'
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  
  // ENCRYPTED FIELD: Stores sensitive payment details
  // {amount: number, currency: string, description: string, metadata: object, billingDetails: object}
  encryptedData: text("encrypted_data").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_payments_user_idx").on(table.userId),
  statusIdx: index("user_payments_status_idx").on(table.status),
  typeIdx: index("user_payments_type_idx").on(table.paymentType),
  stripeIdx: index("user_payments_stripe_idx").on(table.stripePaymentIntentId),
}));

export const insertUserPaymentSchema = createInsertSchema(userPayments)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const selectUserPaymentSchema = createSelectSchema(userPayments);
export type InsertUserPayment = z.infer<typeof insertUserPaymentSchema>;
export type SelectUserPayment = typeof userPayments.$inferSelect;

// ============================================================================
// PLATFORM ANALYTICS
// ============================================================================

export const platformMetrics = pgTable("platform_metrics", {
  id: serial("id").primaryKey(),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  metricValue: integer("metric_value").notNull(),
  metricDate: timestamp("metric_date").notNull().defaultNow(),
  metadata: jsonb("metadata"),
}, (table) => ({
  metricNameIdx: index("platform_metrics_metric_name_idx").on(table.metricName),
  metricDateIdx: index("platform_metrics_metric_date_idx").on(table.metricDate),
}));

export const insertPlatformMetricSchema = createInsertSchema(platformMetrics)
  .omit({ id: true });
export const selectPlatformMetricSchema = createSelectSchema(platformMetrics);
export type InsertPlatformMetric = z.infer<typeof insertPlatformMetricSchema>;
export type SelectPlatformMetric = typeof platformMetrics.$inferSelect;

// Analytics Events - Track user events for analytics
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("analytics_events_user_idx").on(table.userId),
  eventTypeIdx: index("analytics_events_event_type_idx").on(table.eventType),
  timestampIdx: index("analytics_events_timestamp_idx").on(table.timestamp),
  userEventIdx: index("analytics_events_user_event_idx").on(table.userId, table.eventType),
}));

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents)
  .omit({ id: true, timestamp: true });
export const selectAnalyticsEventSchema = createSelectSchema(analyticsEvents);
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type SelectAnalyticsEvent = typeof analyticsEvents.$inferSelect;

// User Analytics - Aggregate user analytics data
export const userAnalytics = pgTable("user_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  totalEvents: integer("total_events").default(0).notNull(),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_analytics_user_idx").on(table.userId),
  lastActiveIdx: index("user_analytics_last_active_idx").on(table.lastActiveAt),
}));

export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const selectUserAnalyticsSchema = createSelectSchema(userAnalytics);
export type InsertUserAnalytics = z.infer<typeof insertUserAnalyticsSchema>;
export type SelectUserAnalytics = typeof userAnalytics.$inferSelect;

// Daily stats aggregation table for fast analytics queries
export const dailyStats = pgTable("daily_stats_view", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().unique(),
  totalUsers: integer("total_users").default(0),
  newUsers: integer("new_users").default(0),
  activeUsers: integer("active_users").default(0),
  totalPosts: integer("total_posts").default(0),
  totalEvents: integer("total_events").default(0),
  revenue: integer("revenue").default(0), // in cents
  subscriptions: integer("subscriptions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  dateIdx: index("daily_stats_date_idx").on(table.date),
}));

export const insertDailyStatSchema = createInsertSchema(dailyStats)
  .omit({ id: true, createdAt: true });
export const selectDailyStatSchema = createSelectSchema(dailyStats);
export type InsertDailyStat = z.infer<typeof insertDailyStatSchema>;
export type SelectDailyStat = typeof dailyStats.$inferSelect;

// ============================================================================
// EMAIL NOTIFICATION SYSTEM
// ============================================================================

export const emailQueue = pgTable("email_queue", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  toEmail: varchar("to_email", { length: 255 }).notNull(),
  
  templateName: varchar("template_name", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  templateData: jsonb("template_data"),
  
  status: varchar("status", { length: 20 }).default('pending'),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  
  sentAt: timestamp("sent_at"),
  failedAt: timestamp("failed_at"),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("email_queue_user_id_idx").on(table.userId),
  statusIdx: index("email_queue_status_idx").on(table.status),
  createdAtIdx: index("email_queue_created_at_idx").on(table.createdAt),
}));

export const insertEmailQueueSchema = createInsertSchema(emailQueue)
  .omit({ id: true, createdAt: true });
export const selectEmailQueueSchema = createSelectSchema(emailQueue);
export type InsertEmailQueue = z.infer<typeof insertEmailQueueSchema>;
export type SelectEmailQueue = typeof emailQueue.$inferSelect;

export const emailPreferences = pgTable("email_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  
  // Notification types
  eventReminders: boolean("event_reminders").default(true),
  newMessages: boolean("new_messages").default(true),
  friendRequests: boolean("friend_requests").default(true),
  postReactions: boolean("post_reactions").default(false),
  housingBookings: boolean("housing_bookings").default(true),
  subscriptionUpdates: boolean("subscription_updates").default(true),
  weeklyDigest: boolean("weekly_digest").default(true),
  
  // Global settings
  emailsEnabled: boolean("emails_enabled").default(true),
  unsubscribeToken: varchar("unsubscribe_token", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("email_preferences_user_id_idx").on(table.userId),
  unsubscribeTokenIdx: index("email_preferences_unsubscribe_token_idx").on(table.unsubscribeToken),
}));

export const insertEmailPreferencesSchema = createInsertSchema(emailPreferences)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const selectEmailPreferencesSchema = createSelectSchema(emailPreferences);
export type InsertEmailPreferences = z.infer<typeof insertEmailPreferencesSchema>;
export type SelectEmailPreferences = typeof emailPreferences.$inferSelect;

export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  emailType: varchar("email_type", { length: 100 }).notNull(),
  
  sentAt: timestamp("sent_at").defaultNow(),
  opened: boolean("opened").default(false),
  openedAt: timestamp("opened_at"),
  clicked: boolean("clicked").default(false),
  clickedAt: timestamp("clicked_at"),
}, (table) => ({
  userIdIdx: index("email_logs_user_id_idx").on(table.userId),
  emailTypeIdx: index("email_logs_email_type_idx").on(table.emailType),
  sentAtIdx: index("email_logs_sent_at_idx").on(table.sentAt),
}));

export const insertEmailLogSchema = createInsertSchema(emailLogs)
  .omit({ id: true, sentAt: true });
export const selectEmailLogSchema = createSelectSchema(emailLogs);
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type SelectEmailLog = typeof emailLogs.$inferSelect;

// ============================================================================
// VISUAL EDITOR + MR. BLUE - UI TESTING & INTELLIGENCE TABLES
// ============================================================================

// Batch 1: UI Testing Tables

export const uiTestScenarios = pgTable("ui_test_scenarios", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  difficulty: varchar("difficulty", { length: 20 }),
  estimatedMinutes: integer("estimated_minutes"),
  steps: jsonb("steps"),
  expectedBehavior: text("expected_behavior"),
  createdBy: integer("created_by").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  createdByIdx: index("ui_test_scenarios_created_by_idx").on(table.createdBy),
  isActiveIdx: index("ui_test_scenarios_is_active_idx").on(table.isActive),
  difficultyIdx: index("ui_test_scenarios_difficulty_idx").on(table.difficulty),
}));

export const insertUiTestScenarioSchema = createInsertSchema(uiTestScenarios)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const selectUiTestScenarioSchema = createSelectSchema(uiTestScenarios);
export type InsertUiTestScenario = z.infer<typeof insertUiTestScenarioSchema>;
export type SelectUiTestScenario = typeof uiTestScenarios.$inferSelect;

export const uiTestResults = pgTable("ui_test_results", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenario_id").references(() => uiTestScenarios.id, { onDelete: "cascade" }),
  volunteerId: integer("volunteer_id").references(() => users.id),
  sessionId: integer("session_id").references(() => userTestingSessions.id, { onDelete: "cascade" }),
  completedSteps: integer("completed_steps"),
  totalSteps: integer("total_steps"),
  timeSpentSeconds: integer("time_spent_seconds"),
  stuckPoints: jsonb("stuck_points"),
  feedbackText: text("feedback_text"),
  difficultyRating: integer("difficulty_rating"),
  clarityRating: integer("clarity_rating"),
  status: varchar("status", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  scenarioIdIdx: index("ui_test_results_scenario_id_idx").on(table.scenarioId),
  volunteerIdIdx: index("ui_test_results_volunteer_id_idx").on(table.volunteerId),
  sessionIdIdx: index("ui_test_results_session_id_idx").on(table.sessionId),
  statusIdx: index("ui_test_results_status_idx").on(table.status),
}));

export const insertUiTestResultSchema = createInsertSchema(uiTestResults)
  .omit({ id: true, createdAt: true });
export const selectUiTestResultSchema = createSelectSchema(uiTestResults);
export type InsertUiTestResult = z.infer<typeof insertUiTestResultSchema>;
export type SelectUiTestResult = typeof uiTestResults.$inferSelect;

export const volunteerStats = pgTable("volunteer_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).unique(),
  totalSessionsCompleted: integer("total_sessions_completed").default(0),
  totalMinutesTested: integer("total_minutes_tested").default(0),
  bugsFound: integer("bugs_found").default(0),
  averageCompletionRate: real("average_completion_rate").default(0),
  skillLevel: varchar("skill_level", { length: 20 }),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("volunteer_stats_user_id_idx").on(table.userId),
  skillLevelIdx: index("volunteer_stats_skill_level_idx").on(table.skillLevel),
  lastActiveAtIdx: index("volunteer_stats_last_active_at_idx").on(table.lastActiveAt),
}));

export const insertVolunteerStatsSchema = createInsertSchema(volunteerStats)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const selectVolunteerStatsSchema = createSelectSchema(volunteerStats);
export type InsertVolunteerStats = z.infer<typeof insertVolunteerStatsSchema>;
export type SelectVolunteerStats = typeof volunteerStats.$inferSelect;

// Batch 2: Session Management Tables

export const userTestingSessions = pgTable("user_testing_sessions", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").references(() => users.id),
  scenarioId: integer("scenario_id").references(() => uiTestScenarios.id),
  sessionType: varchar("session_type", { length: 20 }),
  dailyRoomUrl: text("daily_room_url"),
  status: varchar("status", { length: 20 }),
  scheduledStartAt: timestamp("scheduled_start_at"),
  actualStartAt: timestamp("actual_start_at"),
  actualEndAt: timestamp("actual_end_at"),
  recordingUrl: text("recording_url"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  volunteerIdIdx: index("user_testing_sessions_volunteer_id_idx").on(table.volunteerId),
  scenarioIdIdx: index("user_testing_sessions_scenario_id_idx").on(table.scenarioId),
  statusIdx: index("user_testing_sessions_status_idx").on(table.status),
  sessionTypeIdx: index("user_testing_sessions_session_type_idx").on(table.sessionType),
}));

export const insertUserTestingSessionSchema = createInsertSchema(userTestingSessions)
  .omit({ id: true, createdAt: true });
export const selectUserTestingSessionSchema = createSelectSchema(userTestingSessions);
export type InsertUserTestingSession = z.infer<typeof insertUserTestingSessionSchema>;
export type SelectUserTestingSession = typeof userTestingSessions.$inferSelect;

export const sessionInteractions = pgTable("session_interactions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => userTestingSessions.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").notNull(),
  interactionType: varchar("interaction_type", { length: 50 }),
  elementSelector: text("element_selector"),
  elementText: text("element_text"),
  value: text("value"),
  screenshotUrl: text("screenshot_url"),
  metadata: jsonb("metadata"),
}, (table) => ({
  sessionIdIdx: index("session_interactions_session_id_idx").on(table.sessionId),
  timestampIdx: index("session_interactions_timestamp_idx").on(table.timestamp),
  interactionTypeIdx: index("session_interactions_interaction_type_idx").on(table.interactionType),
}));

export const insertSessionInteractionSchema = createInsertSchema(sessionInteractions)
  .omit({ id: true });
export const selectSessionInteractionSchema = createSelectSchema(sessionInteractions);
export type InsertSessionInteraction = z.infer<typeof insertSessionInteractionSchema>;
export type SelectSessionInteraction = typeof sessionInteractions.$inferSelect;

export const sessionBugsFound = pgTable("session_bugs_found", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => userTestingSessions.id, { onDelete: "cascade" }),
  volunteerId: integer("volunteer_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  severity: varchar("severity", { length: 20 }),
  status: varchar("status", { length: 20 }),
  reproSteps: jsonb("repro_steps"),
  screenshotUrls: text("screenshot_urls").array(),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("session_bugs_found_session_id_idx").on(table.sessionId),
  volunteerIdIdx: index("session_bugs_found_volunteer_id_idx").on(table.volunteerId),
  severityIdx: index("session_bugs_found_severity_idx").on(table.severity),
  statusIdx: index("session_bugs_found_status_idx").on(table.status),
  assignedToIdx: index("session_bugs_found_assigned_to_idx").on(table.assignedTo),
}));

export const insertSessionBugFoundSchema = createInsertSchema(sessionBugsFound)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const selectSessionBugFoundSchema = createSelectSchema(sessionBugsFound);
export type InsertSessionBugFound = z.infer<typeof insertSessionBugFoundSchema>;
export type SelectSessionBugFound = typeof sessionBugsFound.$inferSelect;

export const sessionUxPatterns = pgTable("session_ux_patterns", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => userTestingSessions.id, { onDelete: "cascade" }),
  patternType: varchar("pattern_type", { length: 50 }),
  confidence: real("confidence"),
  description: text("description"),
  timestamp: timestamp("timestamp"),
  elementPath: text("element_path"),
  suggestedFix: text("suggested_fix"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("session_ux_patterns_session_id_idx").on(table.sessionId),
  patternTypeIdx: index("session_ux_patterns_pattern_type_idx").on(table.patternType),
  confidenceIdx: index("session_ux_patterns_confidence_idx").on(table.confidence),
}));

export const insertSessionUxPatternSchema = createInsertSchema(sessionUxPatterns)
  .omit({ id: true, createdAt: true });
export const selectSessionUxPatternSchema = createSelectSchema(sessionUxPatterns);
export type InsertSessionUxPattern = z.infer<typeof insertSessionUxPatternSchema>;
export type SelectSessionUxPattern = typeof sessionUxPatterns.$inferSelect;

// Batch 3: Visual Editor AI Tables

export const visualEditorAiSuggestions = pgTable("visual_editor_ai_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  context: jsonb("context"),
  suggestionType: varchar("suggestion_type", { length: 50 }),
  generatedCode: text("generated_code").notNull(),
  language: varchar("language", { length: 20 }),
  appliedAt: timestamp("applied_at"),
  wasHelpful: boolean("was_helpful"),
  feedbackText: text("feedback_text"),
  agentId: integer("agent_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("visual_editor_ai_suggestions_user_id_idx").on(table.userId),
  suggestionTypeIdx: index("visual_editor_ai_suggestions_suggestion_type_idx").on(table.suggestionType),
  agentIdIdx: index("visual_editor_ai_suggestions_agent_id_idx").on(table.agentId),
  wasHelpfulIdx: index("visual_editor_ai_suggestions_was_helpful_idx").on(table.wasHelpful),
}));

export const insertVisualEditorAiSuggestionSchema = createInsertSchema(visualEditorAiSuggestions)
  .omit({ id: true, createdAt: true });
export const selectVisualEditorAiSuggestionSchema = createSelectSchema(visualEditorAiSuggestions);
export type InsertVisualEditorAiSuggestion = z.infer<typeof insertVisualEditorAiSuggestionSchema>;
export type SelectVisualEditorAiSuggestion = typeof visualEditorAiSuggestions.$inferSelect;

export const userTelemetry = pgTable("user_telemetry", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 100 }),
  eventType: varchar("event_type", { length: 50 }),
  pagePath: text("page_path"),
  elementId: text("element_id"),
  value: text("value"),
  metadata: jsonb("metadata"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => ({
  userIdIdx: index("user_telemetry_user_id_idx").on(table.userId),
  sessionIdIdx: index("user_telemetry_session_id_idx").on(table.sessionId),
  eventTypeIdx: index("user_telemetry_event_type_idx").on(table.eventType),
  timestampIdx: index("user_telemetry_timestamp_idx").on(table.timestamp),
}));

export const insertUserTelemetrySchema = createInsertSchema(userTelemetry)
  .omit({ id: true, timestamp: true });
export const selectUserTelemetrySchema = createSelectSchema(userTelemetry);
export type InsertUserTelemetry = z.infer<typeof insertUserTelemetrySchema>;
export type SelectUserTelemetry = typeof userTelemetry.$inferSelect;

// Batch 4: Mr. Blue Knowledge Tables

export const mrBlueKnowledgeBase = pgTable("mr_blue_knowledge_base", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  category: varchar("category", { length: 50 }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  embedding: text("embedding"),
  tags: text("tags").array(),
  useCount: integer("use_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("mr_blue_knowledge_base_user_id_idx").on(table.userId),
  categoryIdx: index("mr_blue_knowledge_base_category_idx").on(table.category),
  useCountIdx: index("mr_blue_knowledge_base_use_count_idx").on(table.useCount),
}));

export const insertMrBlueKnowledgeBaseSchema = createInsertSchema(mrBlueKnowledgeBase)
  .omit({ id: true, createdAt: true, updatedAt: true });
export const selectMrBlueKnowledgeBaseSchema = createSelectSchema(mrBlueKnowledgeBase);
export type InsertMrBlueKnowledgeBase = z.infer<typeof insertMrBlueKnowledgeBaseSchema>;
export type SelectMrBlueKnowledgeBase = typeof mrBlueKnowledgeBase.$inferSelect;

export const mrBlueSystemPrompts = pgTable("mr_blue_system_prompts", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  version: integer("version").notNull(),
  promptText: text("prompt_text").notNull(),
  isActive: boolean("is_active").default(false),
  performanceScore: real("performance_score"),
  activatedAt: timestamp("activated_at"),
  deactivatedAt: timestamp("deactivated_at"),
  createdBy: integer("created_by").references(() => users.id),
  changeNotes: text("change_notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  agentIdIdx: index("mr_blue_system_prompts_agent_id_idx").on(table.agentId),
  isActiveIdx: index("mr_blue_system_prompts_is_active_idx").on(table.isActive),
  uniqueAgentVersion: uniqueIndex("unique_agent_version").on(table.agentId, table.version),
}));

export const insertMrBlueSystemPromptSchema = createInsertSchema(mrBlueSystemPrompts)
  .omit({ id: true, createdAt: true });
export const selectMrBlueSystemPromptSchema = createSelectSchema(mrBlueSystemPrompts);
export type InsertMrBlueSystemPrompt = z.infer<typeof insertMrBlueSystemPromptSchema>;
export type SelectMrBlueSystemPrompt = typeof mrBlueSystemPrompts.$inferSelect;

// ============================================================================
// GAMIFICATION SYSTEM
// ============================================================================

export const gamificationPoints = pgTable("gamification_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(),
  pointsAwarded: integer("points_awarded").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("gamification_points_user_idx").on(table.userId),
  createdAtIdx: index("gamification_points_created_at_idx").on(table.createdAt),
  actionIdx: index("gamification_points_action_idx").on(table.action),
}));

export const insertGamificationPointsSchema = createInsertSchema(gamificationPoints)
  .omit({ id: true, createdAt: true });
export const selectGamificationPointsSchema = createSelectSchema(gamificationPoints);
export type InsertGamificationPoints = z.infer<typeof insertGamificationPointsSchema>;
export type SelectGamificationPoints = typeof gamificationPoints.$inferSelect;

export const gamificationBadges = pgTable("gamification_badges", {
  id: serial("id").primaryKey(),
  badgeId: varchar("badge_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url").notNull(),
  criteria: jsonb("criteria").notNull(),
}, (table) => ({
  badgeIdIdx: index("gamification_badges_badge_id_idx").on(table.badgeId),
}));

export const insertGamificationBadgeSchema = createInsertSchema(gamificationBadges)
  .omit({ id: true });
export const selectGamificationBadgeSchema = createSelectSchema(gamificationBadges);
export type InsertGamificationBadge = z.infer<typeof insertGamificationBadgeSchema>;
export type SelectGamificationBadge = typeof gamificationBadges.$inferSelect;

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: varchar("badge_id", { length: 50 }).notNull().references(() => gamificationBadges.badgeId, { onDelete: "cascade" }),
  awardedAt: timestamp("awarded_at").defaultNow(),
}, (table) => ({
  userIdx: index("user_badges_user_idx").on(table.userId),
  badgeIdx: index("user_badges_badge_idx").on(table.badgeId),
  uniqueUserBadge: uniqueIndex("unique_user_badge").on(table.userId, table.badgeId),
}));

export const insertUserBadgeSchema = createInsertSchema(userBadges)
  .omit({ id: true, awardedAt: true });
export const selectUserBadgeSchema = createSelectSchema(userBadges);
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type SelectUserBadge = typeof userBadges.$inferSelect;

export const autonomyProgress = pgTable("autonomy_progress", {
  id: serial("id").primaryKey(),
  weekNumber: integer("week_number").notNull().unique(),
  autonomyPercentage: integer("autonomy_percentage").notNull(),
  capabilities: text("capabilities").array().notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
}, (table) => ({
  weekIdx: index("autonomy_progress_week_idx").on(table.weekNumber),
}));

export const insertAutonomyProgressSchema = createInsertSchema(autonomyProgress)
  .omit({ id: true });
export const selectAutonomyProgressSchema = createSelectSchema(autonomyProgress);
export type InsertAutonomyProgress = z.infer<typeof insertAutonomyProgressSchema>;
export type SelectAutonomyProgress = typeof autonomyProgress.$inferSelect;

// ============================================================================
// MR. BLUE AUTONOMOUS AGENT SYSTEM
// ============================================================================

export const autonomousTasks = pgTable("autonomous_tasks", {
  id: varchar("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  decomposition: jsonb("decomposition"),
  generatedFiles: jsonb("generated_files"),
  validationReport: jsonb("validation_report"),
  error: text("error"),
  snapshotId: varchar("snapshot_id"),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }).default("0.00"),
  actualCost: numeric("actual_cost", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("autonomous_tasks_user_idx").on(table.userId),
  statusIdx: index("autonomous_tasks_status_idx").on(table.status),
  createdAtIdx: index("autonomous_tasks_created_at_idx").on(table.createdAt),
}));

export const insertAutonomousTaskSchema = createInsertSchema(autonomousTasks)
  .omit({ createdAt: true, updatedAt: true });
export const selectAutonomousTaskSchema = createSelectSchema(autonomousTasks);
export type InsertAutonomousTask = z.infer<typeof insertAutonomousTaskSchema>;
export type SelectAutonomousTask = typeof autonomousTasks.$inferSelect;

export const autonomousTaskFiles = pgTable("autonomous_task_files", {
  id: serial("id").primaryKey(),
  taskId: varchar("task_id").notNull().references(() => autonomousTasks.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
  operation: varchar("operation", { length: 20 }).notNull(),
  contentBefore: text("content_before"),
  contentAfter: text("content_after"),
  diff: text("diff"),
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  taskIdx: index("autonomous_task_files_task_idx").on(table.taskId),
  filePathIdx: index("autonomous_task_files_path_idx").on(table.filePath),
}));

export const insertAutonomousTaskFileSchema = createInsertSchema(autonomousTaskFiles)
  .omit({ id: true, createdAt: true });
export const selectAutonomousTaskFileSchema = createSelectSchema(autonomousTaskFiles);
export type InsertAutonomousTaskFile = z.infer<typeof insertAutonomousTaskFileSchema>;
export type SelectAutonomousTaskFile = typeof autonomousTaskFiles.$inferSelect;

export const autonomousSessions = pgTable("autonomous_sessions", {
  id: varchar("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userRequest: text("user_request").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  totalTasks: integer("total_tasks").default(0).notNull(),
  completedTasks: integer("completed_tasks").default(0).notNull(),
  failedTasks: integer("failed_tasks").default(0).notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }).default("0.00"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  errorLog: jsonb("error_log"),
}, (table) => ({
  userIdx: index("autonomous_sessions_user_idx").on(table.userId),
  statusIdx: index("autonomous_sessions_status_idx").on(table.status),
  startedAtIdx: index("autonomous_sessions_started_at_idx").on(table.startedAt),
}));

export const insertAutonomousSessionSchema = createInsertSchema(autonomousSessions)
  .omit({ startedAt: true });
export const selectAutonomousSessionSchema = createSelectSchema(autonomousSessions);
export type InsertAutonomousSession = z.infer<typeof insertAutonomousSessionSchema>;
export type SelectAutonomousSession = typeof autonomousSessions.$inferSelect;

export const autonomousSessionTasks = pgTable("autonomous_session_tasks", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id").notNull().references(() => autonomousSessions.id, { onDelete: "cascade" }),
  taskNumber: integer("task_number").notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  code: jsonb("code"),
  validationResults: jsonb("validation_results"),
  attempts: integer("attempts").default(0).notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }).default("0.00"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index("autonomous_session_tasks_session_idx").on(table.sessionId),
  statusIdx: index("autonomous_session_tasks_status_idx").on(table.status),
  sessionTaskIdx: uniqueIndex("unique_session_task").on(table.sessionId, table.taskNumber),
}));

export const insertAutonomousSessionTaskSchema = createInsertSchema(autonomousSessionTasks)
  .omit({ id: true, createdAt: true });
export const selectAutonomousSessionTaskSchema = createSelectSchema(autonomousSessionTasks);
export type InsertAutonomousSessionTask = z.infer<typeof insertAutonomousSessionTaskSchema>;
export type SelectAutonomousSessionTask = typeof autonomousSessionTasks.$inferSelect;

// ============================================================================
// FACEBOOK MESSENGER INTEGRATION
// ============================================================================

export const messengerConnections = pgTable("messenger_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pageId: varchar("page_id", { length: 255 }).notNull(),
  pageName: varchar("page_name", { length: 255 }).notNull(),
  accessToken: text("access_token").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  lastSyncAt: timestamp("last_sync_at"),
}, (table) => ({
  userIdx: index("messenger_connections_user_idx").on(table.userId),
  pageIdx: index("messenger_connections_page_idx").on(table.pageId),
  activeIdx: index("messenger_connections_active_idx").on(table.isActive),
}));

export const insertMessengerConnectionSchema = createInsertSchema(messengerConnections)
  .omit({ id: true, connectedAt: true });
export const selectMessengerConnectionSchema = createSelectSchema(messengerConnections);
export type InsertMessengerConnection = z.infer<typeof insertMessengerConnectionSchema>;
export type SelectMessengerConnection = typeof messengerConnections.$inferSelect;

export const messengerMessages = pgTable("messenger_messages", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").notNull().references(() => messengerConnections.id, { onDelete: "cascade" }),
  conversationId: varchar("conversation_id", { length: 255 }).notNull(),
  senderId: varchar("sender_id", { length: 255 }).notNull(),
  recipientId: varchar("recipient_id", { length: 255 }).notNull(),
  message: text("message").notNull(),
  messageType: varchar("message_type", { length: 50 }).default("text").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
}, (table) => ({
  connectionIdx: index("messenger_messages_connection_idx").on(table.connectionId),
  conversationIdx: index("messenger_messages_conversation_idx").on(table.conversationId),
  sentAtIdx: index("messenger_messages_sent_at_idx").on(table.sentAt),
}));

export const insertMessengerMessageSchema = createInsertSchema(messengerMessages)
  .omit({ id: true, sentAt: true });
export const selectMessengerMessageSchema = createSelectSchema(messengerMessages);
export type InsertMessengerMessage = z.infer<typeof insertMessengerMessageSchema>;
export type SelectMessengerMessage = typeof messengerMessages.$inferSelect;

// ============================================================================
// WEEK 9 DAY 4: ANALYTICS & MODERATION (NEW TABLES ONLY)
// ============================================================================
// Note: analyticsEvents, userAnalytics, platformMetrics, and moderationActions already exist above

// Moderation Reports - User-generated content reports
export const moderationReports = pgTable("moderation_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  contentId: integer("content_id").notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id, { onDelete: "set null" }),
}, (table) => ({
  reporterIdx: index("moderation_reports_reporter_idx").on(table.reporterId),
  contentIdx: index("moderation_reports_content_idx").on(table.contentType, table.contentId),
  statusIdx: index("moderation_reports_status_idx").on(table.status),
  createdAtIdx: index("moderation_reports_created_at_idx").on(table.createdAt),
}));

export const insertModerationReportSchema = createInsertSchema(moderationReports)
  .omit({ id: true, createdAt: true });
export type InsertModerationReport = z.infer<typeof insertModerationReportSchema>;
export type SelectModerationReport = typeof moderationReports.$inferSelect;

// User Violations - Track user policy violations
export const userViolations = pgTable("user_violations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  violationType: varchar("violation_type", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  appealStatus: varchar("appeal_status", { length: 50 }).default("none"),
  appealReason: text("appeal_reason"),
}, (table) => ({
  userIdx: index("user_violations_user_idx").on(table.userId),
  severityIdx: index("user_violations_severity_idx").on(table.severity),
  timestampIdx: index("user_violations_timestamp_idx").on(table.timestamp),
}));

export const insertUserViolationSchema = createInsertSchema(userViolations)
  .omit({ id: true, timestamp: true });
export type InsertUserViolation = z.infer<typeof insertUserViolationSchema>;
export type SelectUserViolation = typeof userViolations.$inferSelect;

// ============================================================================
// AI SERVICES CONSOLIDATION (Week 10-12)
// ============================================================================

// Mr Blue AI Content Studio - Generated Assets (3D models, videos, avatars)
export const generatedAssets = pgTable("generated_assets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assetType: varchar("asset_type", { length: 50 }).notNull(), // '3d_model', 'ai_video', 'avatar_video'
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  metadata: jsonb("metadata").notNull(), // { polygonCount, duration, format, etc }
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  userIdx: index("generated_assets_user_idx").on(table.userId),
  typeIdx: index("generated_assets_type_idx").on(table.assetType),
  createdAtIdx: index("generated_assets_created_at_idx").on(table.createdAt),
}));

export const insertGeneratedAssetSchema = createInsertSchema(generatedAssets)
  .omit({ id: true, createdAt: true });
export type InsertGeneratedAsset = z.infer<typeof insertGeneratedAssetSchema>;
export type SelectGeneratedAsset = typeof generatedAssets.$inferSelect;

// Asset Generation Jobs (BullMQ job tracking)
export const assetGenerationJobs = pgTable("asset_generation_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assetType: varchar("asset_type", { length: 50 }).notNull(),
  inputPrompt: text("input_prompt"),
  inputImageUrl: text("input_image_url"),
  status: varchar("status", { length: 20 }).notNull(), // 'processing', 'completed', 'failed'
  outputUrl: text("output_url"),
  parameters: jsonb("parameters").notNull(),
  errorMessage: text("error_message"),
  apiProvider: varchar("api_provider", { length: 50 }).notNull(), // 'meshy', 'luma', 'heygen'
  costCents: integer("cost_cents"), // Track API costs
  processingTimeSeconds: integer("processing_time_seconds"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at")
}, (table) => ({
  userIdx: index("asset_generation_jobs_user_idx").on(table.userId),
  statusIdx: index("asset_generation_jobs_status_idx").on(table.status),
  createdAtIdx: index("asset_generation_jobs_created_at_idx").on(table.createdAt),
}));

export const insertAssetGenerationJobSchema = createInsertSchema(assetGenerationJobs)
  .omit({ id: true, createdAt: true });
export type InsertAssetGenerationJob = z.infer<typeof insertAssetGenerationJobSchema>;
export type SelectAssetGenerationJob = typeof assetGenerationJobs.$inferSelect;

// Digital Twins (user-trained avatars)
export const digitalTwins = pgTable("digital_twins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  trainingVideoUrl: text("training_video_url").notNull(),
  heygenAvatarId: varchar("heygen_avatar_id", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull(), // 'training', 'ready', 'failed'
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  trainedAt: timestamp("trained_at")
}, (table) => ({
  userIdx: index("digital_twins_user_idx").on(table.userId),
  statusIdx: index("digital_twins_status_idx").on(table.status),
}));

export const insertDigitalTwinSchema = createInsertSchema(digitalTwins)
  .omit({ id: true, createdAt: true });
export type InsertDigitalTwin = z.infer<typeof insertDigitalTwinSchema>;
export type SelectDigitalTwin = typeof digitalTwins.$inferSelect;

// LIFE CEO Productivity Agent 2.0 - Pomodoro Sessions
export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  taskId: integer("task_id").references(() => lifeCeoTasks.id, { onDelete: "set null" }),
  type: varchar("type", { length: 20 }).notNull(), // 'work', 'short_break', 'long_break'
  plannedDuration: integer("planned_duration").notNull(), // seconds
  actualDuration: integer("actual_duration"),
  status: varchar("status", { length: 20 }).notNull(), // 'active', 'completed', 'cancelled'
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at")
}, (table) => ({
  userIdx: index("pomodoro_sessions_user_idx").on(table.userId),
  taskIdx: index("pomodoro_sessions_task_idx").on(table.taskId),
  statusIdx: index("pomodoro_sessions_status_idx").on(table.status),
  startedAtIdx: index("pomodoro_sessions_started_at_idx").on(table.startedAt),
}));

export const insertPomodoroSessionSchema = createInsertSchema(pomodoroSessions)
  .omit({ id: true });
export type InsertPomodoroSession = z.infer<typeof insertPomodoroSessionSchema>;
export type SelectPomodoroSession = typeof pomodoroSessions.$inferSelect;

// Distraction Logs
export const distractionLogs = pgTable("distraction_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'tab_switch', 'idle', 'social_media'
  timestamp: timestamp("timestamp").notNull(),
  metadata: jsonb("metadata") // { fromUrl, toUrl, duration, etc }
}, (table) => ({
  userIdx: index("distraction_logs_user_idx").on(table.userId),
  typeIdx: index("distraction_logs_type_idx").on(table.type),
  timestampIdx: index("distraction_logs_timestamp_idx").on(table.timestamp),
}));

export const insertDistractionLogSchema = createInsertSchema(distractionLogs)
  .omit({ id: true });
export type InsertDistractionLog = z.infer<typeof insertDistractionLogSchema>;
export type SelectDistractionLog = typeof distractionLogs.$inferSelect;

// Productivity Reports
export const productivityReports = pgTable("productivity_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  weekOf: timestamp("week_of").notNull(),
  totalFocusTime: integer("total_focus_time").notNull(), // seconds
  completedTasks: integer("completed_tasks").notNull(),
  totalTasks: integer("total_tasks").notNull(),
  distractionCount: integer("distraction_count").notNull(),
  insights: jsonb("insights").notNull(), // AI-generated recommendations
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  userIdx: index("productivity_reports_user_idx").on(table.userId),
  weekOfIdx: index("productivity_reports_week_of_idx").on(table.weekOf),
}));

export const insertProductivityReportSchema = createInsertSchema(productivityReports)
  .omit({ id: true, createdAt: true });
export type InsertProductivityReport = z.infer<typeof insertProductivityReportSchema>;
export type SelectProductivityReport = typeof productivityReports.$inferSelect;

// LIFE CEO Finance Agent - Financial Transactions
export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // 'income' | 'expense'
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description").notNull(),
  merchant: varchar("merchant", { length: 100 }),
  date: timestamp("date").notNull(),
  recurring: boolean("recurring").default(false),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  userIdx: index("financial_transactions_user_idx").on(table.userId),
  typeIdx: index("financial_transactions_type_idx").on(table.type),
  categoryIdx: index("financial_transactions_category_idx").on(table.category),
  dateIdx: index("financial_transactions_date_idx").on(table.date),
}));

export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions)
  .omit({ id: true, createdAt: true });
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type SelectFinancialTransaction = typeof financialTransactions.$inferSelect;

// Budgets
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 50 }).notNull(),
  budgetedAmount: numeric("budgeted_amount", { precision: 10, scale: 2 }).notNull(),
  spentAmount: numeric("spent_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  period: varchar("period", { length: 20 }).notNull(), // 'monthly' | 'yearly'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  userIdx: index("budgets_user_idx").on(table.userId),
  categoryIdx: index("budgets_category_idx").on(table.category),
  periodIdx: index("budgets_period_idx").on(table.period),
}));

export const insertBudgetSchema = createInsertSchema(budgets)
  .omit({ id: true, createdAt: true });
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type SelectBudget = typeof budgets.$inferSelect;

// Investments
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assetType: varchar("asset_type", { length: 20 }).notNull(), // 'stock', 'crypto', 'real_estate', 'cash'
  symbol: varchar("symbol", { length: 20 }), // 'AAPL', 'BTC', null for real estate
  quantity: numeric("quantity", { precision: 18, scale: 8 }).notNull(),
  purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }).notNull(),
  currentPrice: numeric("current_price", { precision: 10, scale: 2 }),
  lastUpdated: timestamp("last_updated"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  userIdx: index("investments_user_idx").on(table.userId),
  assetTypeIdx: index("investments_asset_type_idx").on(table.assetType),
  symbolIdx: index("investments_symbol_idx").on(table.symbol),
}));

export const insertInvestmentSchema = createInsertSchema(investments)
  .omit({ id: true, createdAt: true });
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type SelectInvestment = typeof investments.$inferSelect;

// Enhanced Talent Match - Outreach Sequences
export const outreachSequences = pgTable("outreach_sequences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  candidateId: integer("candidate_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  opportunityDescription: text("opportunity_description").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'active', 'paused', 'completed', 'replied'
  currentStep: integer("current_step").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  userIdx: index("outreach_sequences_user_idx").on(table.userId),
  candidateIdx: index("outreach_sequences_candidate_idx").on(table.candidateId),
  statusIdx: index("outreach_sequences_status_idx").on(table.status),
}));

export const insertOutreachSequenceSchema = createInsertSchema(outreachSequences)
  .omit({ id: true, createdAt: true });
export type InsertOutreachSequence = z.infer<typeof insertOutreachSequenceSchema>;
export type SelectOutreachSequence = typeof outreachSequences.$inferSelect;

// Outreach Steps
export const outreachSteps = pgTable("outreach_steps", {
  id: serial("id").primaryKey(),
  sequenceId: integer("sequence_id").notNull().references(() => outreachSequences.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  delayDays: integer("delay_days").notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  body: text("body").notNull(),
  channel: varchar("channel", { length: 20 }).notNull(), // 'email', 'linkedin', 'messenger'
  status: varchar("status", { length: 20 }).notNull(), // 'pending', 'sent', 'opened', 'replied'
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  repliedAt: timestamp("replied_at")
}, (table) => ({
  sequenceIdx: index("outreach_steps_sequence_idx").on(table.sequenceId),
  statusIdx: index("outreach_steps_status_idx").on(table.status),
}));

export const insertOutreachStepSchema = createInsertSchema(outreachSteps)
  .omit({ id: true });
export type InsertOutreachStep = z.infer<typeof insertOutreachStepSchema>;
export type SelectOutreachStep = typeof outreachSteps.$inferSelect;

// Candidate Pipelines (ATS)
export const candidatePipelines = pgTable("candidate_pipelines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Recruiter
  candidateId: integer("candidate_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  opportunityId: integer("opportunity_id").references(() => opportunities.id, { onDelete: "set null" }),
  stage: varchar("stage", { length: 20 }).notNull(), // 'contacted', 'responded', 'interviewed', 'offered', 'hired', 'rejected'
  source: varchar("source", { length: 50 }), // 'search', 'referral', 'event'
  notes: text("notes"),
  rating: integer("rating"), // 1-5 stars
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => ({
  userIdx: index("candidate_pipelines_user_idx").on(table.userId),
  candidateIdx: index("candidate_pipelines_candidate_idx").on(table.candidateId),
  stageIdx: index("candidate_pipelines_stage_idx").on(table.stage),
}));

export const insertCandidatePipelineSchema = createInsertSchema(candidatePipelines)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCandidatePipeline = z.infer<typeof insertCandidatePipelineSchema>;
export type SelectCandidatePipeline = typeof candidatePipelines.$inferSelect;

// Opportunities (Jobs/Gigs)
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location", { length: 100 }),
  compensation: varchar("compensation", { length: 100 }),
  startDate: timestamp("start_date"),
  status: varchar("status", { length: 20 }).notNull(), // 'open', 'filled', 'cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  userIdx: index("opportunities_user_idx").on(table.userId),
  statusIdx: index("opportunities_status_idx").on(table.status),
}));

export const insertOpportunitySchema = createInsertSchema(opportunities)
  .omit({ id: true, createdAt: true });
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type SelectOpportunity = typeof opportunities.$inferSelect;

// User Privacy Hub - Virtual Emails
export const virtualEmails = pgTable("virtual_emails", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  virtualEmail: varchar("virtual_email", { length: 100 }).unique().notNull(),
  label: varchar("label", { length: 50 }).notNull(),
  forwardTo: varchar("forward_to", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true),
  emailCount: integer("email_count").default(0),
  spamCount: integer("spam_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  disabledAt: timestamp("disabled_at")
}, (table) => ({
  userIdx: index("virtual_emails_user_idx").on(table.userId),
  virtualEmailIdx: uniqueIndex("virtual_emails_virtual_email_idx").on(table.virtualEmail),
  activeIdx: index("virtual_emails_active_idx").on(table.isActive),
}));

export const insertVirtualEmailSchema = createInsertSchema(virtualEmails)
  .omit({ id: true, createdAt: true });
export type InsertVirtualEmail = z.infer<typeof insertVirtualEmailSchema>;
export type SelectVirtualEmail = typeof virtualEmails.$inferSelect;

// Virtual Email Logs
export const virtualEmailLogs = pgTable("virtual_email_logs", {
  id: serial("id").primaryKey(),
  virtualEmailId: integer("virtual_email_id").notNull().references(() => virtualEmails.id, { onDelete: "cascade" }),
  from: varchar("from", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 200 }),
  isSpam: boolean("is_spam").default(false),
  receivedAt: timestamp("received_at").notNull()
}, (table) => ({
  virtualEmailIdx: index("virtual_email_logs_virtual_email_idx").on(table.virtualEmailId),
  receivedAtIdx: index("virtual_email_logs_received_at_idx").on(table.receivedAt),
}));

export const insertVirtualEmailLogSchema = createInsertSchema(virtualEmailLogs)
  .omit({ id: true });
export type InsertVirtualEmailLog = z.infer<typeof insertVirtualEmailLogSchema>;
export type SelectVirtualEmailLog = typeof virtualEmailLogs.$inferSelect;

// Data Broker Removal Requests
export const dataBrokerRemovalRequests = pgTable("data_broker_removal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  brokerName: varchar("broker_name", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'pending', 'submitted', 'in_progress', 'removed', 'failed'
  requestedAt: timestamp("requested_at").notNull(),
  submittedAt: timestamp("submitted_at"),
  removedAt: timestamp("removed_at"),
  errorMessage: text("error_message")
}, (table) => ({
  userIdx: index("data_broker_removal_requests_user_idx").on(table.userId),
  statusIdx: index("data_broker_removal_requests_status_idx").on(table.status),
}));

export const insertDataBrokerRemovalRequestSchema = createInsertSchema(dataBrokerRemovalRequests)
  .omit({ id: true });
export type InsertDataBrokerRemovalRequest = z.infer<typeof insertDataBrokerRemovalRequestSchema>;
export type SelectDataBrokerRemovalRequest = typeof dataBrokerRemovalRequests.$inferSelect;

// Security Alerts (Dark Web Monitoring)
export const securityAlerts = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'data_breach', 'suspicious_login', 'dark_web_exposure'
  severity: varchar("severity", { length: 20 }).notNull(), // 'low', 'medium', 'high', 'critical'
  message: text("message").notNull(),
  metadata: jsonb("metadata"), // { breaches, affectedData, recommendations }
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  userIdx: index("security_alerts_user_idx").on(table.userId),
  typeIdx: index("security_alerts_type_idx").on(table.type),
  severityIdx: index("security_alerts_severity_idx").on(table.severity),
  isReadIdx: index("security_alerts_is_read_idx").on(table.isRead),
  createdAtIdx: index("security_alerts_created_at_idx").on(table.createdAt),
}));

export const insertSecurityAlertSchema = createInsertSchema(securityAlerts)
  .omit({ id: true, createdAt: true });
export type InsertSecurityAlert = z.infer<typeof insertSecurityAlertSchema>;
export type SelectSecurityAlert = typeof securityAlerts.$inferSelect;

// ============================================================================
// PLATFORM INDEPENDENCE SCHEMA (PATH 2)
// ============================================================================

// Export all platform tables from platform-schema.ts so Drizzle can see them
export * from "./platform-schema";
