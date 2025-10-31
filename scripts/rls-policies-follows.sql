-- ═══════════════════════════════════════════════════════════════
-- MUNDO TANGO - FOLLOWS WORKSTREAM RLS POLICIES
-- Row Level Security Policies for Social Graph (Follow System)
-- ═══════════════════════════════════════════════════════════════
-- 
-- This script defines comprehensive RLS policies for the follows table.
-- Policies ensure users can only create/delete their own follows while
-- maintaining public visibility of the social graph.
--
-- Features:
-- - Public social graph (anyone can see who follows whom)
-- - Users can only follow as themselves (follower_id = auth.uid())
-- - Users can only unfollow their own follows
-- - Prevents self-following at database level
-- - Prevents duplicate follows (unique constraint)
--
-- Usage: Execute this script in Supabase SQL editor or via psql
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- ENABLE RLS ON FOLLOWS TABLE
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- DROP EXISTING POLICIES (for re-running script)
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Follows are publicly visible" ON public.follows;
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow others" ON public.follows;

-- ═══════════════════════════════════════════════════════════════
-- SELECT POLICY: Public Social Graph
-- ═══════════════════════════════════════════════════════════════

-- Anyone can view all follows (public social graph)
-- This is essential for social features:
-- - Displaying follower counts on profiles
-- - Showing "who you might know" suggestions
-- - Displaying mutual followers
-- - Building social recommendations
CREATE POLICY "Follows are publicly visible"
ON public.follows FOR SELECT
TO authenticated
USING (true);

-- Note: TO authenticated (not public) because follows data is only meaningful
-- for logged-in users. Unauthenticated visitors don't need to see follow data.

-- ═══════════════════════════════════════════════════════════════
-- INSERT POLICY: Users Can Follow Others
-- ═══════════════════════════════════════════════════════════════

-- Users can create follows where they are the follower
-- Ensures users can only follow as themselves (not impersonate others)
CREATE POLICY "Users can follow others"
ON public.follows FOR INSERT
TO authenticated
WITH CHECK (follower_id = auth.uid());

-- Security: This prevents a user from creating a follow record where
-- someone else is the follower. Users can only follow as themselves.
--
-- Example valid insert:
-- INSERT INTO follows (follower_id, following_id) VALUES (auth.uid(), 'other-user-id')
--
-- Example invalid insert (will fail):
-- INSERT INTO follows (follower_id, following_id) VALUES ('someone-else', 'other-user-id')

-- ═══════════════════════════════════════════════════════════════
-- DELETE POLICY: Users Can Unfollow
-- ═══════════════════════════════════════════════════════════════

-- Users can only delete their own follows (unfollow)
-- Ensures users cannot remove follows created by others
CREATE POLICY "Users can unfollow others"
ON public.follows FOR DELETE
TO authenticated
USING (follower_id = auth.uid());

-- Security: This prevents a user from deleting follow relationships
-- where they are not the follower. Users can only unfollow as themselves.
--
-- Example valid delete:
-- DELETE FROM follows WHERE follower_id = auth.uid() AND following_id = 'user-id'
--
-- Example invalid delete (will fail):
-- DELETE FROM follows WHERE follower_id = 'someone-else' AND following_id = 'user-id'

-- ═══════════════════════════════════════════════════════════════
-- NO UPDATE POLICY (Not Needed)
-- ═══════════════════════════════════════════════════════════════

-- Update policy is intentionally NOT created because:
-- - Follows table only has follower_id, following_id, created_at
-- - follower_id and following_id should never be updated (delete + insert instead)
-- - created_at should never be updated (immutable timestamp)
-- - If status or metadata is needed, add columns and create update policy

-- ═══════════════════════════════════════════════════════════════
-- DATABASE CONSTRAINTS (Enforced at Table Level)
-- ═══════════════════════════════════════════════════════════════

-- The following constraints should exist on the follows table:
--
-- 1. UNIQUE constraint on (follower_id, following_id)
--    Prevents duplicate follows (user can only follow another user once)
--
-- 2. CHECK constraint to prevent self-following
--    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
--
-- 3. Foreign key constraints
--    FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE
--    FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE
--
-- These constraints are defined in database-schema.sql

-- Create the no_self_follow constraint if it doesn't exist
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

-- ═══════════════════════════════════════════════════════════════
-- VALIDATION QUERIES
-- ═══════════════════════════════════════════════════════════════

-- Verify RLS is enabled on follows table
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'follows';
-- Expected: rowsecurity = true

-- Verify policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'follows'
ORDER BY policyname;
-- Expected: 3 policies (SELECT, INSERT, DELETE)

-- Test self-follow prevention constraint
-- This should fail with error: "new row violates check constraint no_self_follow"
-- DO NOT RUN IN PRODUCTION - Test in development only:
-- INSERT INTO public.follows (follower_id, following_id) VALUES (auth.uid(), auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- USAGE EXAMPLES
-- ═══════════════════════════════════════════════════════════════

-- Follow a user (from authenticated context)
-- INSERT INTO public.follows (follower_id, following_id)
-- VALUES (auth.uid(), 'target-user-uuid');

-- Unfollow a user (from authenticated context)
-- DELETE FROM public.follows
-- WHERE follower_id = auth.uid() AND following_id = 'target-user-uuid';

-- Get follower count for a user
-- SELECT COUNT(*) FROM public.follows WHERE following_id = 'user-uuid';

-- Get following count for a user
-- SELECT COUNT(*) FROM public.follows WHERE follower_id = 'user-uuid';

-- Check if user A follows user B
-- SELECT EXISTS (
--   SELECT 1 FROM public.follows
--   WHERE follower_id = 'user-a-uuid' AND following_id = 'user-b-uuid'
-- );

-- Get list of followers for a user (with profile info)
-- SELECT p.* FROM public.profiles p
-- JOIN public.follows f ON f.follower_id = p.id
-- WHERE f.following_id = 'user-uuid'
-- ORDER BY f.created_at DESC;

-- Get list of users being followed (with profile info)
-- SELECT p.* FROM public.profiles p
-- JOIN public.follows f ON f.following_id = p.id
-- WHERE f.follower_id = 'user-uuid'
-- ORDER BY f.created_at DESC;

-- Get mutual followers between two users
-- SELECT follower_id FROM public.follows WHERE following_id = 'user-a-uuid'
-- INTERSECT
-- SELECT follower_id FROM public.follows WHERE following_id = 'user-b-uuid';

-- ═══════════════════════════════════════════════════════════════
-- SECURITY NOTES
-- ═══════════════════════════════════════════════════════════════
--
-- Public Social Graph:
-- - All follows are publicly visible to authenticated users
-- - This is intentional for social discovery features
-- - Users can see who follows whom (like Twitter/Instagram)
-- - If privacy is needed, implement separate "private profile" logic
--
-- Follow Integrity:
-- - Users can only create follows where they are the follower
-- - Users cannot impersonate others when following
-- - Users can only delete their own follows
-- - Self-following is prevented by CHECK constraint
-- - Duplicate follows prevented by UNIQUE constraint
--
-- Cascade Deletes:
-- - When a user is deleted, all their follows are deleted (ON DELETE CASCADE)
-- - This includes both follower_id and following_id relationships
-- - Ensures no orphaned follow records
--
-- Authentication Required:
-- - All policies require authentication (TO authenticated)
-- - Unauthenticated users cannot view, create, or delete follows
-- - This protects user privacy and prevents spam
--
-- Application-Level Features:
-- - Blocking: Implement at application level (not RLS)
-- - Follow requests: Implement separate table for private profiles
-- - Notifications: Trigger on follow creation
-- - Follow suggestions: Use separate recommendation logic
-- - Mutual follow detection: Query-level logic
--
-- Performance Considerations:
-- - Index on follower_id for fast "who am I following" queries
-- - Index on following_id for fast "who follows me" queries
-- - Composite index on (follower_id, following_id) for uniqueness
-- - Consider caching follower/following counts
-- - Use pagination for large follower/following lists
--
-- Privacy Settings:
-- - RLS policies assume public social graph
-- - For private profiles, implement visibility checks at app level
-- - Consider separate "follow_requests" table for private accounts
-- - Block functionality should prevent follow creation (app logic)
--
-- ═══════════════════════════════════════════════════════════════
-- FOLLOWS RLS POLICIES COMPLETE ✅
-- ═══════════════════════════════════════════════════════════════
