import { z } from "zod";

// ============================================================================
// SUPABASE DATABASE TYPES (UUID-based)
// ============================================================================
// These types match the Supabase schema created in Phase 1
// All primary keys use UUIDs instead of serial integers

// ============================================================================
// PROFILES (extends auth.users)
// ============================================================================

export interface Profile {
  id: string; // UUID from auth.users
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  language: string;
  timezone: string | null;
  email_notifications: boolean;
  push_notifications: boolean;
  profile_visibility: 'public' | 'friends' | 'private';
  location_sharing: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfilePreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  profile_visibility: 'public' | 'friends' | 'private';
  location_sharing: boolean;
  language: string;
}

export interface Follow {
  id: string; // UUID
  follower_id: string; // UUID references profiles(id)
  following_id: string; // UUID references profiles(id)
  created_at: string;
}

export const insertProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50),
  full_name: z.string().max(255).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  bio: z.string().nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  language: z.string().max(10).default('en'),
  timezone: z.string().max(50).nullable().optional(),
  email_notifications: z.boolean().default(true),
  push_notifications: z.boolean().default(true),
  profile_visibility: z.enum(['public', 'friends', 'private']).default('public'),
  location_sharing: z.boolean().default(true),
});

export const updatePreferencesSchema = z.object({
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  profile_visibility: z.enum(['public', 'friends', 'private']).optional(),
  location_sharing: z.boolean().optional(),
  language: z.string().max(10).optional(),
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;

// ============================================================================
// POSTS
// ============================================================================

export interface Post {
  id: string; // UUID
  user_id: string; // UUID references profiles(id)
  content: string;
  image_url: string | null;
  video_url: string | null;
  visibility: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
  likes?: Array<{ count: number }>; // Aggregated like count for optimistic updates
}

export interface PostWithProfile extends Post {
  profiles: Profile;
}

export const insertPostSchema = z.object({
  user_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  image_url: z.string().url().nullable().optional(),
  video_url: z.string().url().nullable().optional(),
  visibility: z.enum(['public', 'friends', 'private']).optional().default('public'),
});

export type InsertPost = z.infer<typeof insertPostSchema>;

// ============================================================================
// LIKES
// ============================================================================

export interface Like {
  id: string; // UUID
  user_id: string; // UUID references profiles(id)
  post_id: string; // UUID references posts(id)
  created_at: string;
}

export const insertLikeSchema = z.object({
  user_id: z.string().uuid(),
  post_id: z.string().uuid(),
});

export type InsertLike = z.infer<typeof insertLikeSchema>;

// ============================================================================
// COMMENTS
// ============================================================================

export interface Comment {
  id: string; // UUID
  user_id: string; // UUID references profiles(id)
  post_id: string; // UUID references posts(id)
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithProfile extends Comment {
  profiles: Profile;
}

export const insertCommentSchema = z.object({
  user_id: z.string().uuid(),
  post_id: z.string().uuid(),
  content: z.string().min(1).max(1000),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;

// ============================================================================
// EVENTS
// ============================================================================

export interface Event {
  id: string; // UUID
  user_id: string; // UUID references profiles(id)
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  category: string | null;
  max_attendees: number | null;
  is_virtual: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventWithProfile extends Event {
  profiles: Profile;
}

export const insertEventSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().nullable().optional(),
  location: z.string().max(255).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  max_attendees: z.number().int().positive().nullable().optional(),
  is_virtual: z.boolean().default(false),
});

export type InsertEvent = z.infer<typeof insertEventSchema>;

// ============================================================================
// RSVPS
// ============================================================================

export interface RSVP {
  id: string; // UUID
  user_id: string; // UUID references profiles(id)
  event_id: string; // UUID references events(id)
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
  updated_at: string;
}

export const insertRSVPSchema = z.object({
  user_id: z.string().uuid(),
  event_id: z.string().uuid(),
  status: z.enum(['going', 'maybe', 'not_going']).default('going'),
});

export type InsertRSVP = z.infer<typeof insertRSVPSchema>;

// ============================================================================
// COMMUNITIES
// ============================================================================

export interface Community {
  id: string; // UUID
  name: string;
  description: string | null;
  image_url: string | null;
  city: string | null;
  country: string | null;
  is_private: boolean;
  created_by: string | null; // UUID references profiles(id)
  created_at: string;
  updated_at: string;
}

export const insertCommunitySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  is_private: z.boolean().default(false),
  created_by: z.string().uuid().nullable().optional(),
});

export type InsertCommunity = z.infer<typeof insertCommunitySchema>;

// ============================================================================
// COMMUNITY MEMBERS
// ============================================================================

export interface CommunityMember {
  id: string; // UUID
  user_id: string; // UUID references profiles(id)
  community_id: string; // UUID references communities(id)
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export const insertCommunityMemberSchema = z.object({
  user_id: z.string().uuid(),
  community_id: z.string().uuid(),
  role: z.enum(['admin', 'moderator', 'member']).default('member'),
});

export type InsertCommunityMember = z.infer<typeof insertCommunityMemberSchema>;

// ============================================================================
// MESSAGES (Real-time Chat)
// ============================================================================

export interface Message {
  id: string; // UUID
  conversation_id: string; // UUID references conversations(id)
  sender_id: string; // UUID references profiles(id)
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface MessageWithProfile extends Message {
  profiles: Profile;
}

export const insertMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;

// ============================================================================
// CONVERSATIONS
// ============================================================================

export interface Conversation {
  id: string; // UUID
  is_group: boolean;
  name: string | null;
  created_at: string;
}

export const insertConversationSchema = z.object({
  is_group: z.boolean().default(false),
  name: z.string().max(255).nullable().optional(),
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;

// ============================================================================
// CONVERSATION PARTICIPANTS
// ============================================================================

export interface ConversationParticipant {
  id: string; // UUID
  conversation_id: string; // UUID references conversations(id)
  user_id: string; // UUID references profiles(id)
  joined_at: string;
  last_read_at: string | null;
}

export const insertConversationParticipantSchema = z.object({
  conversation_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;

// ============================================================================
// SUBSCRIPTIONS (Stripe)
// ============================================================================

export interface Subscription {
  id: string; // UUID
  user_id: string; // UUID references profiles(id)
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'free' | 'pro' | 'enterprise' | null;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export const insertSubscriptionSchema = z.object({
  user_id: z.string().uuid(),
  stripe_customer_id: z.string().max(255).nullable().optional(),
  stripe_subscription_id: z.string().max(255).nullable().optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).nullable().optional(),
  status: z.enum(['active', 'canceled', 'past_due', 'incomplete', 'trialing']).nullable().optional(),
  current_period_start: z.string().datetime().nullable().optional(),
  current_period_end: z.string().datetime().nullable().optional(),
  cancel_at_period_end: z.boolean().default(false),
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// ============================================================================
// AI CONVERSATIONS (Mr Blue)
// ============================================================================

export interface AIConversation {
  id: string; // UUID
  user_id: string; // UUID references profiles(id)
  messages: any[]; // JSONB array
  context: Record<string, any>; // JSONB object
  total_tokens: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export const insertAIConversationSchema = z.object({
  user_id: z.string().uuid(),
  messages: z.array(z.any()).default([]),
  context: z.record(z.any()).default({}),
  total_tokens: z.number().int().default(0),
  total_cost: z.number().default(0),
});

export type InsertAIConversation = z.infer<typeof insertAIConversationSchema>;

// ============================================================================
// SUPABASE AUTH USER (from auth.users)
// ============================================================================

export interface AuthUser {
  id: string; // UUID
  email: string;
  created_at: string;
  updated_at: string;
  email_confirmed_at: string | null;
  phone: string | null;
  phone_confirmed_at: string | null;
  last_sign_in_at: string | null;
  user_metadata: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}
