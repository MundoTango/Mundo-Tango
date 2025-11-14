-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - Mundo Tango Platform
-- ============================================================================
-- 
-- Security Architecture:
-- 1. Users can only access their own data (privacy)
-- 2. Public content is readable by all authenticated users
-- 3. Admin/moderator roles have elevated access
-- 4. Group/event access is membership-based
-- 
-- CRITICAL: Run these policies in PostgreSQL after schema is created
-- Execute: psql $DATABASE_URL < server/database/rls-policies.sql
-- ============================================================================

-- Enable RLS on core user tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on social content tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on event tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;

-- Enable RLS on group tables
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invites ENABLE ROW LEVEL SECURITY;

-- Enable RLS on messaging tables
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTION: Get current user ID from JWT
-- ============================================================================
CREATE OR REPLACE FUNCTION current_user_id() RETURNS INTEGER AS $$
  SELECT NULLIF(current_setting('app.current_user_id', TRUE), '')::INTEGER;
$$ LANGUAGE SQL STABLE;

-- Helper function: Check if user has minimum role level
CREATE OR REPLACE FUNCTION has_minimum_role_level(user_id INTEGER, min_level INTEGER) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM platform_user_roles pur
    JOIN platform_roles pr ON pur.role_id = pr.id
    WHERE pur.user_id = user_id
    AND pr.role_level >= min_level
  );
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (id = current_user_id());

-- Users can view public profiles (limited columns)
CREATE POLICY users_select_public ON users
  FOR SELECT
  USING (true);  -- All users visible, application layer filters sensitive fields

-- Users can update their own profile
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (id = current_user_id());

-- Admins can view all users
CREATE POLICY users_admin_all ON users
  FOR ALL
  USING (has_minimum_role_level(current_user_id(), 4));  -- Admin level = 4

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can only see their own notifications
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT
  USING (user_id = current_user_id());

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE
  USING (user_id = current_user_id());

-- System can insert notifications for users
CREATE POLICY notifications_insert ON notifications
  FOR INSERT
  WITH CHECK (true);  -- Application layer handles authorization

-- ============================================================================
-- POSTS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view published posts
CREATE POLICY posts_select_published ON posts
  FOR SELECT
  USING (visibility = 'public' OR author_id = current_user_id());

-- Users can insert their own posts
CREATE POLICY posts_insert_own ON posts
  FOR INSERT
  WITH CHECK (author_id = current_user_id());

-- Users can update their own posts
CREATE POLICY posts_update_own ON posts
  FOR UPDATE
  USING (author_id = current_user_id());

-- Users can delete their own posts
CREATE POLICY posts_delete_own ON posts
  FOR DELETE
  USING (author_id = current_user_id());

-- Admins can manage all posts (moderation)
CREATE POLICY posts_admin_all ON posts
  FOR ALL
  USING (has_minimum_role_level(current_user_id(), 4));

-- ============================================================================
-- POST COMMENTS TABLE POLICIES
-- ============================================================================

-- Users can view comments on posts they can see
CREATE POLICY post_comments_select ON post_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_comments.post_id 
      AND (posts.visibility = 'public' OR posts.author_id = current_user_id())
    )
  );

-- Users can insert their own comments
CREATE POLICY post_comments_insert_own ON post_comments
  FOR INSERT
  WITH CHECK (user_id = current_user_id());

-- Users can update their own comments
CREATE POLICY post_comments_update_own ON post_comments
  FOR UPDATE
  USING (user_id = current_user_id());

-- Users can delete their own comments
CREATE POLICY post_comments_delete_own ON post_comments
  FOR DELETE
  USING (user_id = current_user_id());

-- ============================================================================
-- CHAT MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can only see messages in rooms they're part of
CREATE POLICY chat_messages_select_member ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_room_users 
      WHERE chat_room_users.room_id = chat_messages.room_id 
      AND chat_room_users.user_id = current_user_id()
    )
  );

-- Users can insert messages in rooms they're part of
CREATE POLICY chat_messages_insert_member ON chat_messages
  FOR INSERT
  WITH CHECK (
    sender_id = current_user_id()
    AND EXISTS (
      SELECT 1 FROM chat_room_users 
      WHERE chat_room_users.room_id = chat_messages.room_id 
      AND chat_room_users.user_id = current_user_id()
    )
  );

-- ============================================================================
-- EVENTS TABLE POLICIES
-- ============================================================================

-- All users can view published events
CREATE POLICY events_select_published ON events
  FOR SELECT
  USING (status = 'published' OR user_id = current_user_id());

-- Community Leaders (level 3+) can create events
CREATE POLICY events_insert_leader ON events
  FOR INSERT
  WITH CHECK (
    user_id = current_user_id()
    AND has_minimum_role_level(current_user_id(), 3)
  );

-- Users can update their own events
CREATE POLICY events_update_own ON events
  FOR UPDATE
  USING (user_id = current_user_id());

-- Users can delete their own events
CREATE POLICY events_delete_own ON events
  FOR DELETE
  USING (user_id = current_user_id());

-- Admins can manage all events
CREATE POLICY events_admin_all ON events
  FOR ALL
  USING (has_minimum_role_level(current_user_id(), 4));

-- ============================================================================
-- EVENT RSVPS TABLE POLICIES
-- ============================================================================

-- Users can view RSVPs for events they can see
CREATE POLICY event_rsvps_select ON event_rsvps
  FOR SELECT
  USING (
    user_id = current_user_id()
    OR EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rsvps.event_id 
      AND events.status = 'published'
    )
  );

-- Users can RSVP to events
CREATE POLICY event_rsvps_insert_own ON event_rsvps
  FOR INSERT
  WITH CHECK (user_id = current_user_id());

-- Users can update their own RSVPs
CREATE POLICY event_rsvps_update_own ON event_rsvps
  FOR UPDATE
  USING (user_id = current_user_id());

-- ============================================================================
-- GROUPS TABLE POLICIES
-- ============================================================================

-- All users can view public groups
CREATE POLICY groups_select_public ON groups
  FOR SELECT
  USING (is_private = false OR creator_id = current_user_id());

-- Community Leaders (level 3+) can create groups
CREATE POLICY groups_insert_leader ON groups
  FOR INSERT
  WITH CHECK (
    creator_id = current_user_id()
    AND has_minimum_role_level(current_user_id(), 3)
  );

-- Group creators can update their groups
CREATE POLICY groups_update_own ON groups
  FOR UPDATE
  USING (creator_id = current_user_id());

-- Group creators can delete their groups
CREATE POLICY groups_delete_own ON groups
  FOR DELETE
  USING (creator_id = current_user_id());

-- ============================================================================
-- GROUP MEMBERS TABLE POLICIES
-- ============================================================================

-- Users can view members of groups they're part of
CREATE POLICY group_members_select_member ON group_members
  FOR SELECT
  USING (
    user_id = current_user_id()
    OR EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = current_user_id()
    )
  );

-- Group admins can add members
CREATE POLICY group_members_insert_admin ON group_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = current_user_id()
      AND gm.role = 'admin'
    )
  );

-- Users can remove themselves from groups
CREATE POLICY group_members_delete_own ON group_members
  FOR DELETE
  USING (user_id = current_user_id());

-- ============================================================================
-- SECURITY AUDIT LOGS TABLE POLICIES
-- ============================================================================

-- Only super admins (level 7+) can view audit logs
CREATE POLICY security_audit_logs_admin_only ON security_audit_logs
  FOR SELECT
  USING (has_minimum_role_level(current_user_id(), 7));

-- System can insert audit logs
CREATE POLICY security_audit_logs_insert ON security_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- CHAT ROOMS TABLE POLICIES
-- ============================================================================

-- Users can view rooms they're part of
CREATE POLICY chat_rooms_select_member ON chat_rooms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_room_users 
      WHERE chat_room_users.room_id = chat_rooms.id 
      AND chat_room_users.user_id = current_user_id()
    )
  );

-- ============================================================================
-- IMPLEMENTATION NOTES
-- ============================================================================
-- 
-- 1. Application Layer Integration:
--    - Set current_user_id in each request: 
--      SET LOCAL app.current_user_id = :userId
-- 
-- 2. Performance Considerations:
--    - Add indexes on user_id, author_id columns
--    - Monitor query performance with EXPLAIN ANALYZE
--    - Consider materialized views for complex queries
-- 
-- 3. Testing:
--    - Test each policy with different user roles
--    - Verify admins can access all data
--    - Verify users can only access their data
--    - Test edge cases (deleted users, expired sessions)
-- 
-- 4. Maintenance:
--    - Update policies when adding new roles
--    - Document policy changes in migration files
--    - Regular security audits
-- 
-- ============================================================================
