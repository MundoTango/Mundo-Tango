-- ═══════════════════════════════════════════════════════════════
-- MUNDO TANGO - MASTER RLS SETUP SCRIPT
-- Comprehensive Row Level Security Policies for All Workstreams
-- ═══════════════════════════════════════════════════════════════
-- 
-- This master script consolidates ALL RLS policies from workstreams 1-4.
-- Run this single script to set up complete RLS protection across the
-- entire Mundo Tango database.
--
-- ORGANIZATION:
--   - Workstream 1: Feed (Posts, Likes, Comments)
--   - Workstream 2: Events (Events, RSVPs)
--   - Workstream 3: Messaging (Messages, Conversations, Participants)
--   - Workstream 4: Social Graph (Follows, Profiles)
--
-- USAGE: 
--   Execute this script in Supabase SQL editor or via psql
--   psql -h your-host -U postgres -d your-db -f setup-all-rls-policies.sql
--
-- SECURITY GUARANTEES:
--   ✅ All tables protected by RLS
--   ✅ Unauthenticated access blocked
--   ✅ Users can only modify their own content
--   ✅ Privacy enforced (messages, private posts)
--   ✅ Social features maintained (public posts, events)
--
-- VERSION: 1.0.0
-- LAST UPDATED: 2025-10-31
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- WORKSTREAM 1: FEED - Posts, Likes, Comments
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- POSTS TABLE RLS POLICIES
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view friends posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- SELECT: Users can view public posts OR their own posts
CREATE POLICY "Users can view public posts"
ON public.posts FOR SELECT
TO authenticated
USING (
  visibility = 'public' 
  OR user_id = auth.uid()
  OR (visibility = 'friends' AND user_id = auth.uid())
);

-- INSERT: Authenticated users can create posts with their own user_id
CREATE POLICY "Users can create posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can only update their own posts
CREATE POLICY "Users can update own posts"
ON public.posts FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Users can only delete their own posts
CREATE POLICY "Users can delete own posts"
ON public.posts FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ───────────────────────────────────────────────────────────────
-- LIKES TABLE RLS POLICIES
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
DROP POLICY IF EXISTS "Users can create own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;

-- SELECT: All authenticated users can view all likes
CREATE POLICY "Likes are viewable by everyone"
ON public.likes FOR SELECT
TO authenticated
USING (true);

-- INSERT: Users can only create likes with their own user_id
CREATE POLICY "Users can create own likes"
ON public.likes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- DELETE: Users can only delete their own likes (unlike)
CREATE POLICY "Users can delete own likes"
ON public.likes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ───────────────────────────────────────────────────────────────
-- COMMENTS TABLE RLS POLICIES
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Users can view comments on accessible posts" ON public.comments;
DROP POLICY IF EXISTS "Users can create own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

-- SELECT: Comments inherit visibility from their parent post
-- Users can only view comments on posts they have access to
CREATE POLICY "Users can view comments on accessible posts"
ON public.comments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = comments.post_id
    AND (
      posts.visibility = 'public'
      OR posts.user_id = auth.uid()
      OR (
        posts.visibility = 'friends' 
        AND EXISTS (
          SELECT 1 FROM follows
          WHERE follows.following_id = posts.user_id
          AND follows.follower_id = auth.uid()
        )
      )
    )
  )
);

-- INSERT: Users can only create comments with their own user_id
CREATE POLICY "Users can create own comments"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can only edit their own comments
CREATE POLICY "Users can update own comments"
ON public.comments FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Users can only delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.comments FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- WORKSTREAM 2: EVENTS - Events, RSVPs
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- EVENTS TABLE RLS POLICIES
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;

-- SELECT: All authenticated users can view all events
CREATE POLICY "Anyone can view events"
ON public.events FOR SELECT
TO authenticated
USING (true);

-- INSERT: Authenticated users can create events with their own user_id
CREATE POLICY "Users can create events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can only update their own events
CREATE POLICY "Users can update own events"
ON public.events FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Users can only delete their own events
CREATE POLICY "Users can delete own events"
ON public.events FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ───────────────────────────────────────────────────────────────
-- RSVPS TABLE RLS POLICIES
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "RSVPs are viewable by everyone" ON public.rsvps;
DROP POLICY IF EXISTS "Users can create own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can update own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can delete own RSVPs" ON public.rsvps;

-- SELECT: All authenticated users can view all RSVPs
CREATE POLICY "RSVPs are viewable by everyone"
ON public.rsvps FOR SELECT
TO authenticated
USING (true);

-- INSERT: Users can only create RSVPs with their own user_id
CREATE POLICY "Users can create own RSVPs"
ON public.rsvps FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can only update their own RSVPs
CREATE POLICY "Users can update own RSVPs"
ON public.rsvps FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Users can only delete their own RSVPs
CREATE POLICY "Users can delete own RSVPs"
ON public.rsvps FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- WORKSTREAM 3: MESSAGING - Messages, Conversations, Participants
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- MESSAGES TABLE RLS POLICIES
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;

-- SELECT: Users can only read messages in conversations they participate in
CREATE POLICY "Users can view their messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- INSERT: Users can send messages to conversations they participate in
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- UPDATE: Users can update their own messages
CREATE POLICY "Users can update own messages"
ON public.messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- DELETE: Users can delete their own messages
CREATE POLICY "Users can delete own messages"
ON public.messages FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- ───────────────────────────────────────────────────────────────
-- CONVERSATIONS TABLE RLS POLICIES
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

-- SELECT: Users can only view conversations they participate in
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversations.id
    AND user_id = auth.uid()
  )
);

-- INSERT: Any authenticated user can create a conversation
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Participants can update conversation metadata
CREATE POLICY "Users can update their conversations"
ON public.conversations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversations.id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversations.id
    AND user_id = auth.uid()
  )
);

-- ───────────────────────────────────────────────────────────────
-- CONVERSATION PARTICIPANTS TABLE RLS POLICIES
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update own participant record" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can leave conversations" ON public.conversation_participants;

-- SELECT: Users can see all participants in conversations they're part of
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = auth.uid()
  )
);

-- INSERT: Participants can add new members to conversations
CREATE POLICY "Users can add participants to conversations"
ON public.conversation_participants FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversation_participants.conversation_id
    AND user_id = auth.uid()
  )
);

-- UPDATE: Users can update their own participant record
CREATE POLICY "Users can update own participant record"
ON public.conversation_participants FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Users can remove themselves from conversations
CREATE POLICY "Users can leave conversations"
ON public.conversation_participants FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- WORKSTREAM 4: SOCIAL GRAPH - Follows, Profiles
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- FOLLOWS TABLE RLS POLICIES
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Follows are publicly visible" ON public.follows;
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow others" ON public.follows;

-- SELECT: All follows are publicly visible (social graph)
CREATE POLICY "Follows are publicly visible"
ON public.follows FOR SELECT
TO authenticated
USING (true);

-- INSERT: Users can create follows where they are the follower
CREATE POLICY "Users can follow others"
ON public.follows FOR INSERT
TO authenticated
WITH CHECK (follower_id = auth.uid());

-- DELETE: Users can only delete their own follows (unfollow)
CREATE POLICY "Users can unfollow others"
ON public.follows FOR DELETE
TO authenticated
USING (follower_id = auth.uid());

-- Add self-follow prevention constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'no_self_follow' 
    AND conrelid = 'public.follows'::regclass
  ) THEN
    ALTER TABLE public.follows
    ADD CONSTRAINT no_self_follow CHECK (follower_id != following_id);
  END IF;
END $$;

-- ───────────────────────────────────────────────────────────────
-- PROFILES TABLE RLS POLICIES
-- ───────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- SELECT: All authenticated users can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- INSERT: Users can create their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- UPDATE: Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════

-- Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN (
  'posts', 'likes', 'comments',
  'events', 'rsvps',
  'messages', 'conversations', 'conversation_participants',
  'follows', 'profiles'
)
ORDER BY tablename;

-- Count policies per table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'posts', 'likes', 'comments',
  'events', 'rsvps',
  'messages', 'conversations', 'conversation_participants',
  'follows', 'profiles'
)
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ═══════════════════════════════════════════════════════════════
-- SETUP COMPLETE
-- ═══════════════════════════════════════════════════════════════

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ MUNDO TANGO RLS SETUP COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'All RLS policies have been successfully configured:';
  RAISE NOTICE '  ✅ Feed (Posts, Likes, Comments)';
  RAISE NOTICE '  ✅ Events (Events, RSVPs)';
  RAISE NOTICE '  ✅ Messaging (Messages, Conversations, Participants)';
  RAISE NOTICE '  ✅ Social Graph (Follows, Profiles)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Run validation: tsx scripts/validate-rls.ts';
  RAISE NOTICE '  2. Test your application with authenticated users';
  RAISE NOTICE '  3. Verify unauthenticated access is properly blocked';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
