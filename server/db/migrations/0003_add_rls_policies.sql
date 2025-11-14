-- ============================================================================
-- ROW LEVEL SECURITY (RLS) COMPREHENSIVE MIGRATION
-- Task: P0 #2 - Database Row Level Security
-- Session Variable: app.current_user_id
-- ============================================================================
-- 
-- This migration implements Row Level Security policies for all user-sensitive
-- tables to prevent unauthorized data access at the database level.
--
-- SECURITY PRINCIPLE: Deny by default, allow explicitly based on ownership
-- SESSION VARIABLE: app.current_user_id (set by application layer)
--
-- NOTE: This migration uses app.current_user_id instead of app.user_id
-- to align with the task requirements. All RLS policies check this variable.
-- ============================================================================

-- ============================================================================
-- 1. POSTS - Respect visibility: public/friends/private
-- ============================================================================

-- Drop existing policies if they exist (from previous migrations)
DROP POLICY IF EXISTS posts_select_policy ON posts;
DROP POLICY IF EXISTS posts_modify_policy ON posts;
DROP POLICY IF EXISTS posts_select_visibility ON posts;
DROP POLICY IF EXISTS posts_insert_own ON posts;
DROP POLICY IF EXISTS posts_update_own ON posts;
DROP POLICY IF EXISTS posts_delete_own ON posts;

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: View posts based on visibility settings
CREATE POLICY posts_select_visibility
  ON posts
  FOR SELECT
  USING (
    visibility = 'public' 
    OR user_id = current_setting('app.current_user_id', true)::integer
    OR (visibility = 'friends_only' AND EXISTS (
      SELECT 1 FROM friendships 
      WHERE (user_id = current_setting('app.current_user_id', true)::integer AND friend_id = posts.user_id)
         OR (friend_id = current_setting('app.current_user_id', true)::integer AND user_id = posts.user_id)
    ))
  );

-- Policy: Users can only insert their own posts
CREATE POLICY posts_insert_own
  ON posts
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

-- Policy: Users can only update their own posts
CREATE POLICY posts_update_own
  ON posts
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- Policy: Users can only delete their own posts
CREATE POLICY posts_delete_own
  ON posts
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================================
-- 2. MESSAGES (chat_messages) - Only sender/receiver can access
-- ============================================================================

DROP POLICY IF EXISTS chat_messages_select_policy ON chat_messages;
DROP POLICY IF EXISTS chat_messages_insert_policy ON chat_messages;
DROP POLICY IF EXISTS chat_messages_delete_policy ON chat_messages;
DROP POLICY IF EXISTS messages_select_own ON chat_messages;
DROP POLICY IF EXISTS messages_insert_own ON chat_messages;
DROP POLICY IF EXISTS messages_update_own ON chat_messages;
DROP POLICY IF EXISTS messages_delete_own ON chat_messages;

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see messages in rooms they're part of
CREATE POLICY messages_select_own
  ON chat_messages
  FOR SELECT
  USING (
    user_id = current_setting('app.current_user_id', true)::integer OR
    chat_room_id IN (
      SELECT chat_room_id FROM chat_room_users
      WHERE user_id = current_setting('app.current_user_id', true)::integer
    )
  );

-- Policy: Users can only send messages in rooms they're part of
CREATE POLICY messages_insert_own
  ON chat_messages
  FOR INSERT
  WITH CHECK (
    user_id = current_setting('app.current_user_id', true)::integer AND
    chat_room_id IN (
      SELECT chat_room_id FROM chat_room_users
      WHERE user_id = current_setting('app.current_user_id', true)::integer
    )
  );

-- Policy: Users can only update their own messages
CREATE POLICY messages_update_own
  ON chat_messages
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- Policy: Users can only delete their own messages
CREATE POLICY messages_delete_own
  ON chat_messages
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================================
-- 3. FINANCIAL_GOALS - User's own data only
-- ============================================================================

DROP POLICY IF EXISTS financial_goals_policy ON financial_goals;
DROP POLICY IF EXISTS financial_goals_select_own ON financial_goals;
DROP POLICY IF EXISTS financial_goals_insert_own ON financial_goals;
DROP POLICY IF EXISTS financial_goals_update_own ON financial_goals;
DROP POLICY IF EXISTS financial_goals_delete_own ON financial_goals;

ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY financial_goals_select_own
  ON financial_goals
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY financial_goals_insert_own
  ON financial_goals
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY financial_goals_update_own
  ON financial_goals
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY financial_goals_delete_own
  ON financial_goals
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================================
-- 4. HEALTH_GOALS - User's own data only
-- ============================================================================

DROP POLICY IF EXISTS health_goals_policy ON health_goals;
DROP POLICY IF EXISTS health_goals_select_own ON health_goals;
DROP POLICY IF EXISTS health_goals_insert_own ON health_goals;
DROP POLICY IF EXISTS health_goals_update_own ON health_goals;
DROP POLICY IF EXISTS health_goals_delete_own ON health_goals;

ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY health_goals_select_own
  ON health_goals
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY health_goals_insert_own
  ON health_goals
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY health_goals_update_own
  ON health_goals
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY health_goals_delete_own
  ON health_goals
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================================
-- 5. BUDGET_ENTRIES - User's own data only
-- ============================================================================

DROP POLICY IF EXISTS budget_entries_policy ON budget_entries;
DROP POLICY IF EXISTS budget_entries_select_own ON budget_entries;
DROP POLICY IF EXISTS budget_entries_insert_own ON budget_entries;
DROP POLICY IF EXISTS budget_entries_update_own ON budget_entries;
DROP POLICY IF EXISTS budget_entries_delete_own ON budget_entries;

ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY budget_entries_select_own
  ON budget_entries
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY budget_entries_insert_own
  ON budget_entries
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY budget_entries_update_own
  ON budget_entries
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY budget_entries_delete_own
  ON budget_entries
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================================
-- 6. NUTRITION_LOGS - User's own data only
-- ============================================================================

DROP POLICY IF EXISTS nutrition_logs_policy ON nutrition_logs;
DROP POLICY IF EXISTS nutrition_logs_select_own ON nutrition_logs;
DROP POLICY IF EXISTS nutrition_logs_insert_own ON nutrition_logs;
DROP POLICY IF EXISTS nutrition_logs_update_own ON nutrition_logs;
DROP POLICY IF EXISTS nutrition_logs_delete_own ON nutrition_logs;

ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY nutrition_logs_select_own
  ON nutrition_logs
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY nutrition_logs_insert_own
  ON nutrition_logs
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY nutrition_logs_update_own
  ON nutrition_logs
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY nutrition_logs_delete_own
  ON nutrition_logs
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================================
-- 7. USER_SETTINGS - User's own settings
-- ============================================================================

DROP POLICY IF EXISTS user_settings_policy ON user_settings;
DROP POLICY IF EXISTS user_settings_select_own ON user_settings;
DROP POLICY IF EXISTS user_settings_insert_own ON user_settings;
DROP POLICY IF EXISTS user_settings_update_own ON user_settings;
DROP POLICY IF EXISTS user_settings_delete_own ON user_settings;

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_settings_select_own
  ON user_settings
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY user_settings_insert_own
  ON user_settings
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY user_settings_update_own
  ON user_settings
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY user_settings_delete_own
  ON user_settings
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================================
-- 8. TWO_FACTOR_SECRETS (twoFactorAuth) - User's own 2FA
-- ============================================================================

DROP POLICY IF EXISTS two_factor_secrets_policy ON two_factor_secrets;
DROP POLICY IF EXISTS two_factor_auth_select_own ON two_factor_secrets;
DROP POLICY IF EXISTS two_factor_auth_insert_own ON two_factor_secrets;
DROP POLICY IF EXISTS two_factor_auth_update_own ON two_factor_secrets;
DROP POLICY IF EXISTS two_factor_auth_delete_own ON two_factor_secrets;

ALTER TABLE two_factor_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY two_factor_auth_select_own
  ON two_factor_secrets
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY two_factor_auth_insert_own
  ON two_factor_secrets
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY two_factor_auth_update_own
  ON two_factor_secrets
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY two_factor_auth_delete_own
  ON two_factor_secrets
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================================
-- 9. HOST_VENUE_PROFILES (hostHomes) - Owner can access
-- ============================================================================

DROP POLICY IF EXISTS host_venues_select_policy ON host_venue_profiles;
DROP POLICY IF EXISTS host_venues_modify_policy ON host_venue_profiles;
DROP POLICY IF EXISTS host_homes_select_own ON host_venue_profiles;
DROP POLICY IF EXISTS host_homes_insert_own ON host_venue_profiles;
DROP POLICY IF EXISTS host_homes_update_own ON host_venue_profiles;
DROP POLICY IF EXISTS host_homes_delete_own ON host_venue_profiles;

ALTER TABLE host_venue_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view active listings, owners can view all their listings
CREATE POLICY host_homes_select_own
  ON host_venue_profiles
  FOR SELECT
  USING (
    is_active = true OR
    user_id = current_setting('app.current_user_id', true)::integer
  );

CREATE POLICY host_homes_insert_own
  ON host_venue_profiles
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY host_homes_update_own
  ON host_venue_profiles
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY host_homes_delete_own
  ON host_venue_profiles
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================================
-- 10. BOOKINGS - Host or guest can access
-- ============================================================================

DROP POLICY IF EXISTS bookings_policy ON bookings;
DROP POLICY IF EXISTS bookings_select_own ON bookings;
DROP POLICY IF EXISTS bookings_insert_own ON bookings;
DROP POLICY IF EXISTS bookings_update_own ON bookings;
DROP POLICY IF EXISTS bookings_delete_own ON bookings;

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Guests and hosts can view bookings they're involved in
CREATE POLICY bookings_select_own
  ON bookings
  FOR SELECT
  USING (
    guest_id = current_setting('app.current_user_id', true)::integer OR
    host_home_id IN (
      SELECT id FROM host_venue_profiles
      WHERE user_id = current_setting('app.current_user_id', true)::integer
    )
  );

-- Policy: Only guests can create bookings
CREATE POLICY bookings_insert_own
  ON bookings
  FOR INSERT
  WITH CHECK (guest_id = current_setting('app.current_user_id', true)::integer);

-- Policy: Guests and hosts can update bookings (for status changes)
CREATE POLICY bookings_update_own
  ON bookings
  FOR UPDATE
  USING (
    guest_id = current_setting('app.current_user_id', true)::integer OR
    host_home_id IN (
      SELECT id FROM host_venue_profiles
      WHERE user_id = current_setting('app.current_user_id', true)::integer
    )
  );

-- Policy: Only guests can delete their bookings
CREATE POLICY bookings_delete_own
  ON bookings
  FOR DELETE
  USING (guest_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================================
-- 11. EVENT_RSVPS - Event owner or RSVP owner
-- ============================================================================

DROP POLICY IF EXISTS event_rsvps_select_policy ON event_rsvps;
DROP POLICY IF EXISTS event_rsvps_modify_policy ON event_rsvps;
DROP POLICY IF EXISTS event_rsvps_select_own ON event_rsvps;
DROP POLICY IF EXISTS event_rsvps_insert_own ON event_rsvps;
DROP POLICY IF EXISTS event_rsvps_update_own ON event_rsvps;
DROP POLICY IF EXISTS event_rsvps_delete_own ON event_rsvps;

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own RSVPs and RSVPs for events they created
CREATE POLICY event_rsvps_select_own
  ON event_rsvps
  FOR SELECT
  USING (
    user_id = current_setting('app.current_user_id', true)::integer OR
    event_id IN (
      SELECT id FROM events
      WHERE user_id = current_setting('app.current_user_id', true)::integer
        OR organizer_id = current_setting('app.current_user_id', true)::integer
    )
  );

CREATE POLICY event_rsvps_insert_own
  ON event_rsvps
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY event_rsvps_update_own
  ON event_rsvps
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

CREATE POLICY event_rsvps_delete_own
  ON event_rsvps
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================================
-- 12. GROUP_MEMBERS - Group members can see
-- ============================================================================

DROP POLICY IF EXISTS group_members_policy ON group_members;
DROP POLICY IF EXISTS group_members_select_own ON group_members;
DROP POLICY IF EXISTS group_members_insert_own ON group_members;
DROP POLICY IF EXISTS group_members_update_own ON group_members;
DROP POLICY IF EXISTS group_members_delete_own ON group_members;

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Policy: Members can see other members in groups they belong to
CREATE POLICY group_members_select_own
  ON group_members
  FOR SELECT
  USING (
    user_id = current_setting('app.current_user_id', true)::integer OR
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = current_setting('app.current_user_id', true)::integer
        AND status = 'active'
    )
  );

-- Policy: Users can join groups (insert themselves)
CREATE POLICY group_members_insert_own
  ON group_members
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

-- Policy: Users can update their own membership
CREATE POLICY group_members_update_own
  ON group_members
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- Policy: Users can leave groups (delete themselves)
CREATE POLICY group_members_delete_own
  ON group_members
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================================
-- 13. FRIENDSHIPS - Both parties can see
-- ============================================================================

DROP POLICY IF EXISTS friendships_select_policy ON friendships;
DROP POLICY IF EXISTS friendships_modify_policy ON friendships;
DROP POLICY IF EXISTS friendships_select_own ON friendships;
DROP POLICY IF EXISTS friendships_insert_own ON friendships;
DROP POLICY IF EXISTS friendships_update_own ON friendships;
DROP POLICY IF EXISTS friendships_delete_own ON friendships;

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Policy: Both users in the friendship can read the record
CREATE POLICY friendships_select_own
  ON friendships
  FOR SELECT
  USING (
    user_id = current_setting('app.current_user_id', true)::integer OR
    friend_id = current_setting('app.current_user_id', true)::integer
  );

-- Policy: Users can create friendships
CREATE POLICY friendships_insert_own
  ON friendships
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

-- Policy: Users can update friendships they initiated
CREATE POLICY friendships_update_own
  ON friendships
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- Policy: Users can delete friendships they initiated
CREATE POLICY friendships_delete_own
  ON friendships
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::integer);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check RLS status on all protected tables
-- SELECT 
--   schemaname,
--   tablename,
--   rowsecurity as rls_enabled
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'posts', 'chat_messages', 'financial_goals', 'health_goals',
--     'budget_entries', 'nutrition_logs', 'user_settings', 'two_factor_secrets',
--     'host_venue_profiles', 'bookings', 'event_rsvps', 'group_members', 'friendships'
--   )
-- ORDER BY tablename;

-- List all new policies
-- SELECT 
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'posts', 'chat_messages', 'financial_goals', 'health_goals',
--     'budget_entries', 'nutrition_logs', 'user_settings', 'two_factor_secrets',
--     'host_venue_profiles', 'bookings', 'event_rsvps', 'group_members', 'friendships'
--   )
-- ORDER BY tablename, policyname;
