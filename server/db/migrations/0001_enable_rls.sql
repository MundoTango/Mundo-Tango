-- ============================================================================
-- ROW LEVEL SECURITY (RLS) MIGRATION
-- CRITICAL SECURITY: Prevents unauthorized access to user data
-- ============================================================================
-- 
-- This migration enables Row Level Security on all tables containing
-- sensitive user data and creates comprehensive policies to enforce
-- data access controls at the database level.
--
-- SECURITY PRINCIPLE: Deny by default, allow explicitly
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE
-- Users can only see and modify their own profile
-- Public profiles are visible to everyone (for user search/discovery)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY users_own_profile_policy ON users
  FOR ALL
  USING (id = current_setting('app.user_id', true)::int);

-- Policy: Public profiles are visible for discovery
CREATE POLICY users_public_profiles_policy ON users
  FOR SELECT
  USING (
    is_active = true 
    AND suspended = false
  );

-- ============================================================================
-- 2. POSTS TABLE
-- Respects visibility settings: public, friends_only, private
-- ============================================================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: View posts based on visibility
CREATE POLICY posts_select_policy ON posts
  FOR SELECT
  USING (
    visibility = 'public' OR
    (visibility = 'friends_only' AND (
      user_id = current_setting('app.user_id', true)::int OR
      user_id IN (
        SELECT friend_id FROM friendships 
        WHERE user_id = current_setting('app.user_id', true)::int 
          AND status = 'active'
      ) OR
      user_id IN (
        SELECT user_id FROM friendships 
        WHERE friend_id = current_setting('app.user_id', true)::int 
          AND status = 'active'
      )
    )) OR
    (visibility = 'private' AND user_id = current_setting('app.user_id', true)::int)
  );

-- Policy: Only owners can create/update/delete posts
CREATE POLICY posts_modify_policy ON posts
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 3. CHAT MESSAGES (Direct Messages)
-- Only participants in the chat room can read/write messages
-- ============================================================================

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see messages in rooms they're part of
CREATE POLICY chat_messages_select_policy ON chat_messages
  FOR SELECT
  USING (
    user_id = current_setting('app.user_id', true)::int OR
    chat_room_id IN (
      SELECT chat_room_id FROM chat_room_users
      WHERE user_id = current_setting('app.user_id', true)::int
    )
  );

-- Policy: Users can only send messages in rooms they're part of
CREATE POLICY chat_messages_insert_policy ON chat_messages
  FOR INSERT
  WITH CHECK (
    user_id = current_setting('app.user_id', true)::int AND
    chat_room_id IN (
      SELECT chat_room_id FROM chat_room_users
      WHERE user_id = current_setting('app.user_id', true)::int
    )
  );

-- Policy: Users can only delete their own messages
CREATE POLICY chat_messages_delete_policy ON chat_messages
  FOR DELETE
  USING (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 4. CHAT ROOMS
-- Users can only access rooms they're participants in
-- ============================================================================

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_rooms_policy ON chat_rooms
  FOR SELECT
  USING (
    id IN (
      SELECT chat_room_id FROM chat_room_users
      WHERE user_id = current_setting('app.user_id', true)::int
    )
  );

-- ============================================================================
-- 5. CHAT ROOM USERS
-- Users can see participants in rooms they're part of
-- ============================================================================

ALTER TABLE chat_room_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_room_users_policy ON chat_room_users
  FOR SELECT
  USING (
    user_id = current_setting('app.user_id', true)::int OR
    chat_room_id IN (
      SELECT chat_room_id FROM chat_room_users
      WHERE user_id = current_setting('app.user_id', true)::int
    )
  );

-- ============================================================================
-- 6. FINANCIAL PORTFOLIOS
-- Only owners can access their financial data
-- ============================================================================

ALTER TABLE financial_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY financial_portfolios_policy ON financial_portfolios
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 7. FINANCIAL ACCOUNTS
-- Only owners can access their financial accounts
-- ============================================================================

ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY financial_accounts_policy ON financial_accounts
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 8. FINANCIAL ASSETS
-- Only owners can access their financial assets
-- ============================================================================

ALTER TABLE financial_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY financial_assets_policy ON financial_assets
  FOR ALL
  USING (
    portfolio_id IN (
      SELECT id FROM financial_portfolios
      WHERE user_id = current_setting('app.user_id', true)::int
    )
  );

-- ============================================================================
-- 9. FINANCIAL TRADES
-- Only owners can access their trades
-- ============================================================================

ALTER TABLE financial_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY financial_trades_policy ON financial_trades
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 10. BOOKINGS
-- Guests and hosts can view bookings they're involved in
-- ============================================================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookings_policy ON bookings
  FOR SELECT
  USING (
    guest_id = current_setting('app.user_id', true)::int OR
    host_home_id IN (
      SELECT id FROM host_venue_profiles
      WHERE user_id = current_setting('app.user_id', true)::int
    )
  );

-- ============================================================================
-- 11. SUBSCRIPTIONS (User Subscriptions)
-- Only owners can view their subscription details
-- ============================================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_policy ON subscriptions
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 12. PAYMENTS
-- Only owners can view their payment history
-- ============================================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY payments_policy ON payments
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 13. FRIENDSHIPS
-- Both users in the friendship can read the record
-- ============================================================================

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY friendships_select_policy ON friendships
  FOR SELECT
  USING (
    user_id = current_setting('app.user_id', true)::int OR
    friend_id = current_setting('app.user_id', true)::int
  );

-- Policy: Only the user who initiated can delete friendship
CREATE POLICY friendships_modify_policy ON friendships
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 14. FRIEND REQUESTS
-- Only sender and recipient can see friend requests
-- ============================================================================

ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY friend_requests_policy ON friend_requests
  FOR SELECT
  USING (
    requester_id = current_setting('app.user_id', true)::int OR
    addressee_id = current_setting('app.user_id', true)::int
  );

-- Policy: Only requester can create/delete requests
CREATE POLICY friend_requests_modify_policy ON friend_requests
  FOR ALL
  USING (requester_id = current_setting('app.user_id', true)::int)
  WITH CHECK (requester_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 15. GROUPS
-- Public groups visible to all, private groups only to members
-- ============================================================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Policy: View groups
CREATE POLICY groups_select_policy ON groups
  FOR SELECT
  USING (
    privacy = 'public' OR
    creator_id = current_setting('app.user_id', true)::int OR
    id IN (
      SELECT group_id FROM group_members
      WHERE user_id = current_setting('app.user_id', true)::int
        AND status = 'active'
    )
  );

-- Policy: Only creators can modify groups
CREATE POLICY groups_modify_policy ON groups
  FOR ALL
  USING (creator_id = current_setting('app.user_id', true)::int)
  WITH CHECK (creator_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 16. GROUP MEMBERS
-- Members can see other members in groups they belong to
-- ============================================================================

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY group_members_policy ON group_members
  FOR SELECT
  USING (
    user_id = current_setting('app.user_id', true)::int OR
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = current_setting('app.user_id', true)::int
        AND status = 'active'
    )
  );

-- ============================================================================
-- 17. GROUP POSTS
-- Visible to group members based on group privacy
-- ============================================================================

ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY group_posts_select_policy ON group_posts
  FOR SELECT
  USING (
    group_id IN (
      SELECT id FROM groups
      WHERE privacy = 'public' OR
        creator_id = current_setting('app.user_id', true)::int OR
        id IN (
          SELECT group_id FROM group_members
          WHERE user_id = current_setting('app.user_id', true)::int
            AND status = 'active'
        )
    )
  );

-- Policy: Only owners can modify their group posts
CREATE POLICY group_posts_modify_policy ON group_posts
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 18. EVENT RSVPs
-- Users can see their own RSVPs and RSVPs for events they created
-- ============================================================================

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_rsvps_select_policy ON event_rsvps
  FOR SELECT
  USING (
    user_id = current_setting('app.user_id', true)::int OR
    event_id IN (
      SELECT id FROM events
      WHERE user_id = current_setting('app.user_id', true)::int
        OR organizer_id = current_setting('app.user_id', true)::int
    )
  );

-- Policy: Only owners can modify their RSVPs
CREATE POLICY event_rsvps_modify_policy ON event_rsvps
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 19. NOTIFICATIONS
-- Users can only see their own notifications
-- ============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_policy ON notifications
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 20. MR BLUE CONVERSATIONS
-- Users can only see their own AI conversations
-- ============================================================================

ALTER TABLE mr_blue_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY mr_blue_conversations_policy ON mr_blue_conversations
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 21. MR BLUE MESSAGES
-- Users can only see messages in their conversations
-- ============================================================================

ALTER TABLE mr_blue_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY mr_blue_messages_policy ON mr_blue_messages
  FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM mr_blue_conversations
      WHERE user_id = current_setting('app.user_id', true)::int
    )
  );

-- ============================================================================
-- 22. LIFE CEO CONVERSATIONS
-- Users can only see their own Life CEO conversations
-- ============================================================================

ALTER TABLE life_ceo_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY life_ceo_conversations_policy ON life_ceo_conversations
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 23. LIFE CEO CHAT MESSAGES
-- Users can only see messages in their Life CEO conversations
-- ============================================================================

ALTER TABLE life_ceo_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY life_ceo_chat_messages_policy ON life_ceo_chat_messages
  FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM life_ceo_conversations
      WHERE user_id = current_setting('app.user_id', true)::int
    )
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these to verify RLS is enabled
-- ============================================================================

-- Check RLS status on all tables
-- SELECT 
--   schemaname,
--   tablename,
--   rowsecurity as rls_enabled
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND rowsecurity = true
-- ORDER BY tablename;

-- List all policies
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
-- ORDER BY tablename, policyname;
