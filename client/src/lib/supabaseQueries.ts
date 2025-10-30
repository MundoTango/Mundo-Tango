import { supabase } from "./supabase";
import type {
  Post,
  PostWithProfile,
  InsertPost,
  Comment,
  CommentWithProfile,
  InsertComment,
  Like,
  InsertLike,
  Event,
  EventWithProfile,
  InsertEvent,
  RSVP,
  InsertRSVP,
  Community,
  InsertCommunity,
  CommunityMember,
  InsertCommunityMember,
  Message,
  MessageWithProfile,
  InsertMessage,
  Conversation,
  InsertConversation,
  Profile,
} from "@shared/supabase-types";

// ============================================================================
// POSTS
// ============================================================================

export async function getPosts(limit = 50) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (*)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as PostWithProfile[];
}

export async function getPostById(id: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as PostWithProfile;
}

export async function createPost(post: InsertPost) {
  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select(`
      *,
      profiles (*)
    `)
    .single();

  if (error) throw error;
  return data as PostWithProfile;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================================
// LIKES
// ============================================================================

export async function getLikesByPostId(postId: string) {
  const { data, error } = await supabase
    .from("likes")
    .select("*")
    .eq("post_id", postId);

  if (error) throw error;
  return data as Like[];
}

export async function toggleLike(userId: string, postId: string) {
  const { data: existing, error: fetchError } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);
    if (error) throw error;
    return { liked: false };
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ user_id: userId, post_id: postId });
    if (error) throw error;
    return { liked: true };
  }
}

// ============================================================================
// COMMENTS
// ============================================================================

export async function getCommentsByPostId(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      profiles (*)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as CommentWithProfile[];
}

export async function createComment(comment: InsertComment) {
  const { data, error } = await supabase
    .from("comments")
    .insert(comment)
    .select(`
      *,
      profiles (*)
    `)
    .single();

  if (error) throw error;
  return data as CommentWithProfile;
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================================
// EVENTS
// ============================================================================

export async function getEvents(limit = 50) {
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      profiles (*)
    `)
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data as EventWithProfile[];
}

export async function getEventById(id: string) {
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      profiles (*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as EventWithProfile;
}

export async function createEvent(event: InsertEvent) {
  const { data, error } = await supabase
    .from("events")
    .insert(event)
    .select(`
      *,
      profiles (*)
    `)
    .single();

  if (error) throw error;
  return data as EventWithProfile;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================================
// RSVPS
// ============================================================================

export async function getRSVPsByEventId(eventId: string) {
  const { data, error } = await supabase
    .from("rsvps")
    .select("*")
    .eq("event_id", eventId);

  if (error) throw error;
  return data as RSVP[];
}

export async function createOrUpdateRSVP(rsvp: InsertRSVP) {
  const { data, error } = await supabase
    .from("rsvps")
    .upsert(rsvp, { onConflict: "user_id,event_id" })
    .select()
    .single();

  if (error) throw error;
  return data as RSVP;
}

// ============================================================================
// COMMUNITIES
// ============================================================================

export async function getCommunities() {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Community[];
}

export async function getCommunityById(id: string) {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Community;
}

export async function createCommunity(community: InsertCommunity) {
  const { data, error } = await supabase
    .from("communities")
    .insert(community)
    .select()
    .single();

  if (error) throw error;
  return data as Community;
}

// ============================================================================
// COMMUNITY MEMBERS
// ============================================================================

export async function getCommunityMembers(communityId: string) {
  const { data, error } = await supabase
    .from("community_members")
    .select(`
      *,
      profiles (*)
    `)
    .eq("community_id", communityId);

  if (error) throw error;
  return data;
}

export async function joinCommunity(member: InsertCommunityMember) {
  const { data, error } = await supabase
    .from("community_members")
    .insert(member)
    .select()
    .single();

  if (error) throw error;
  return data as CommunityMember;
}

export async function leaveCommunity(userId: string, communityId: string) {
  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("user_id", userId)
    .eq("community_id", communityId);

  if (error) throw error;
}

// ============================================================================
// MESSAGES & CONVERSATIONS
// ============================================================================

export async function getConversationMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      profiles (*)
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as MessageWithProfile[];
}

export async function sendMessage(message: InsertMessage) {
  const { data, error } = await supabase
    .from("messages")
    .insert(message)
    .select(`
      *,
      profiles (*)
    `)
    .single();

  if (error) throw error;
  return data as MessageWithProfile;
}

export async function getUserConversations(userId: string) {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select(`
      *,
      conversations (*)
    `)
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}

export async function createConversation(conversation: InsertConversation, participantIds: string[]) {
  const { data: conv, error: convError } = await supabase
    .from("conversations")
    .insert(conversation)
    .select()
    .single();

  if (convError) throw convError;

  const participants = participantIds.map((userId) => ({
    conversation_id: conv.id,
    user_id: userId,
  }));

  const { error: partError } = await supabase
    .from("conversation_participants")
    .insert(participants);

  if (partError) throw partError;

  return conv as Conversation;
}

// ============================================================================
// PROFILES
// ============================================================================

export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function searchProfiles(query: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(20);

  if (error) throw error;
  return data as Profile[];
}
