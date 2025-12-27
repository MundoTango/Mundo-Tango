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
  date,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// CLOSENESS VISIBILITY TYPE - Friendship-based content filtering
// ============================================================================
// Scoring Reference:
// - 86-100: Best Friend
// - 71-85: Close Friend  
// - 41-70: Friend
// - 0-40: Acquaintance
// - connectionDegree 1: Direct friend
// - connectionDegree 2: Friend of friend
// - connectionDegree 3: Extended network

export type ClosenessVisibility = 
  | 'all'           // Everyone (default)
  | 'close_friend'  // Close friends only (closenessScore 71+)
  | 'friends_1st'   // Direct friends only (connectionDegree 1)
  | 'friends_2nd'   // Up to 2nd degree (connectionDegree 1-2)
  | 'friends_3rd';  // Up to 3rd degree (connectionDegree 1-3)

export const closenessVisibilitySchema = z.enum([
  'all',
  'close_friend',
  'friends_1st',
  'friends_2nd',
  'friends_3rd',
]);

// Re-export message schemas
export * from "./messageSchemas";

// Re-export event roles schemas
export * from "./eventRolesSchemas";

// Re-export ad schemas
export * from "./adSchemas";

// ============================================================================
// USERS & PROFILES (matching existing schema)
// ============================================================================

export const users = pgTable(
  "users",
  {
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
    primaryLanguage: varchar("primary_language"),
    languages: text("languages").array(),
    tangoRoles: text("tango_roles").array(),
    tangoRoleExperience: jsonb("tango_role_experience").$type<
      { role: string; startYear: number }[]
    >(),
    leaderLevel: integer("leader_level").default(0),
    followerLevel: integer("follower_level").default(0),
    /** @deprecated Use tangoStartYear and tangoRoleExperience instead. Kept for backwards compatibility. */
    yearsOfDancing: integer("years_of_dancing").default(0),
    /** Renamed from startedDancingYear - When the user first started tango (year). Default for all role experiences. */
    tangoStartYear: integer("tango_start_year"),
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
    waitlist: boolean("waitlist").default(false),
    waitlistDate: timestamp("waitlist_date"),

    // WEEK 9 DAY 2: User Profile & Networking Features
    interests: text("interests").array(),
    socialLinks: jsonb("social_links"),
    availability: jsonb("availability"),
    customUrl: varchar("custom_url", { length: 100 }).unique(),
    privacySettings: jsonb("privacy_settings"),
    verificationBadge: boolean("verification_badge").default(false),
    portfolioUrls: text("portfolio_urls").array(),

    // WEEK 9 DAY 5: Facebook Messenger Integration
    facebookPSID: varchar("facebook_psid", { length: 100 }).unique(),
    facebookMessengerOptIn: boolean("facebook_messenger_opt_in").default(false),
    facebookLastMessageAt: timestamp("facebook_last_message_at"),

    // WEEK 9 DAY 6: Facebook OAuth Integration (Supabase)
    supabaseUserId: varchar("supabase_user_id", { length: 100 }).unique(),
    facebookUserId: varchar("facebook_user_id", { length: 100 }),
    facebookPageId: varchar("facebook_page_id", { length: 100 }),
    facebookPageAccessToken: text("facebook_page_access_token"),
    facebookTokenExpiresAt: timestamp("facebook_token_expires_at"),
    facebookRefreshToken: text("facebook_refresh_token"),
    facebookScopes: text("facebook_scopes").array(),

    // God-Level User Registration: Location & Community Website
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    communityWebsiteUrl: text("community_website_url"),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    usernameIdx: index("users_username_idx").on(table.username),
    cityCountryIdx: index("users_city_country_idx").on(
      table.city,
      table.country,
    ),
    activeIdx: index("users_active_idx").on(table.isActive),
    citiesIdx: index("users_cities_idx").on(
      table.city,
      table.country,
      table.isActive,
    ),
    customUrlIdx: index("users_custom_url_idx").on(table.customUrl),
  }),
);

// ============================================================================
// CITY WEBSITES - City-to-Website Mapping
// ============================================================================

export const cityWebsites = pgTable(
  "city_websites",
  {
    id: serial("id").primaryKey(),
    city: varchar("city", { length: 255 }).notNull(),
    country: varchar("country", { length: 255 }).notNull(),
    websiteUrl: text("website_url").notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
    submissionStatus: varchar("submissionStatus", { length: 50 }).default("approved").notNull(), // 'pending_review', 'approved', 'rejected'
    submittedBy: integer("submitted_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    cityCountryIdx: index("city_websites_city_country_idx").on(
      table.city,
      table.country,
    ),
    uniqueCityCountry: unique("unique_city_country").on(
      table.city,
      table.country,
    ),
  }),
);

export const insertCityWebsiteSchema = createInsertSchema(cityWebsites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCityWebsite = z.infer<typeof insertCityWebsiteSchema>;
export type CityWebsite = typeof cityWebsites.$inferSelect;
