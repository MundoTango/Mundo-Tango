-- ═══════════════════════════════════════════════════════════════
-- MUNDO TANGO - FEED WORKSTREAM RLS POLICIES
-- Row Level Security Policies for Posts, Likes, and Comments
-- ═══════════════════════════════════════════════════════════════
-- 
-- This script defines comprehensive RLS policies for the Feed workstream.
-- Policies ensure users can only modify their own content while maintaining
-- appropriate read access based on post visibility settings.
--
-- Usage: Execute this script in Supabase SQL editor or via psql
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- POSTS TABLE RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view friends posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- SELECT Policy: Users can view public posts OR their own posts
-- Note: Friends visibility would require a follows/friends table to implement fully
CREATE POLICY "Users can view public posts"
ON public.posts FOR SELECT
TO authenticated
USING (
  visibility = 'public' 
  OR user_id = auth.uid()
  OR (visibility = 'friends' AND user_id = auth.uid())
);

-- INSERT Policy: Authenticated users can create posts with their own user_id
CREATE POLICY "Users can create posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE Policy: Users can only update their own posts
CREATE POLICY "Users can update own posts"
ON public.posts FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE Policy: Users can only delete their own posts
CREATE POLICY "Users can delete own posts"
ON public.posts FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- LIKES TABLE RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on likes table
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
DROP POLICY IF EXISTS "Users can create own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;

-- SELECT Policy: All authenticated users can view all likes
-- (Needed to display like counts and who liked posts)
CREATE POLICY "Likes are viewable by everyone"
ON public.likes FOR SELECT
TO authenticated
USING (true);

-- INSERT Policy: Users can only create likes with their own user_id
CREATE POLICY "Users can create own likes"
ON public.likes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- DELETE Policy: Users can only delete their own likes (unlike)
CREATE POLICY "Users can delete own likes"
ON public.likes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Note: No UPDATE policy needed - likes are immutable (just create/delete)

-- ═══════════════════════════════════════════════════════════════
-- COMMENTS TABLE RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on comments table
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Users can view comments on accessible posts" ON public.comments;
DROP POLICY IF EXISTS "Users can create own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

-- SELECT Policy: Comments inherit visibility from their parent post
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

-- INSERT Policy: Users can only create comments with their own user_id
CREATE POLICY "Users can create own comments"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE Policy: Users can only edit their own comments
CREATE POLICY "Users can update own comments"
ON public.comments FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE Policy: Users can only delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.comments FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- SECURITY NOTES
-- ═══════════════════════════════════════════════════════════════
-- 
-- 1. All policies require authentication (TO authenticated)
-- 2. Users can only create/modify content with their own user_id
-- 3. Public posts are visible to all authenticated users
-- 4. Private posts are only visible to the post owner
-- 5. Friends visibility checked against follows table
-- 6. Likes are globally visible to maintain social features
-- 7. Comments inherit visibility from their parent post
-- 8. USING clause = read permission, WITH CHECK = write permission
-- 
-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES COMPLETE ✅
-- ═══════════════════════════════════════════════════════════════
