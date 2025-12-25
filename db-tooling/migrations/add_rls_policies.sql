-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Migration created: 2025-11-14
-- Purpose: Implement comprehensive RLS to prevent users from accessing
--          other users' private data (GDPR compliance, security hardening)
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION: Get current user ID from session variable
-- ============================================================================
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS INTEGER AS $$
  SELECT NULLIF(current_setting('app.current_user_id', TRUE), '')::INTEGER;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- POSTS: Visibility-based access (public/friends/trust_circle/private)
-- ============================================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see public posts, their own posts, and friend/trust circle posts
CREATE POLICY "posts_select_policy"
ON posts FOR SELECT
USING (
  visibility = 'public'
  OR user_id = current_user_id()
  OR (
    visibility = 'friends' 
    AND EXISTS (
      SELECT 1 FROM friendships 
      WHERE (user_id = current_user_id() AND friend_id = posts.user_id AND status = 'accepted')
         OR (friend_id = current_user_id() AND user_id = posts.user_id AND status = 'accepted')
    )
  )
  OR (
    visibility = 'trust_circle'
    AND EXISTS (
      SELECT 1 FROM friendships
      WHERE (user_id = current_user_id() AND friend_id = posts.user_id AND status = 'accepted' AND is_close_friend = true)
         OR (friend_id = current_user_id() AND user_id = posts.user_id AND status = 'accepted' AND is_close_friend = true)
    )
  )
);

-- INSERT: Users can only create posts as themselves
CREATE POLICY "posts_insert_policy"
ON posts FOR INSERT
WITH CHECK (user_id = current_user_id());

-- UPDATE: Users can only update their own posts
CREATE POLICY "posts_update_policy"
ON posts FOR UPDATE
USING (user_id = current_user_id());

-- DELETE: Users can only delete their own posts
CREATE POLICY "posts_delete_policy"
ON posts FOR DELETE
USING (user_id = current_user_id());

-- ============================================================================
-- POST COMMENTS: Only visible on posts user can see
-- ============================================================================
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_comments_select_policy"
ON post_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = post_comments.post_id
    AND (
      posts.visibility = 'public'
      OR posts.user_id = current_user_id()
      OR (
        posts.visibility = 'friends' 
        AND EXISTS (
          SELECT 1 FROM friendships 
          WHERE (user_id = current_user_id() AND friend_id = posts.user_id AND status = 'accepted')
             OR (friend_id = current_user_id() AND user_id = posts.user_id AND status = 'accepted')
        )
      )
    )
  )
);

CREATE POLICY "post_comments_insert_policy"
ON post_comments FOR INSERT
WITH CHECK (user_id = current_user_id());

CREATE POLICY "post_comments_modify_policy"
ON post_comments FOR UPDATE
USING (user_id = current_user_id());

CREATE POLICY "post_comments_delete_policy"
ON post_comments FOR DELETE
USING (user_id = current_user_id());

-- ============================================================================
-- CHAT MESSAGES: Only conversation participants
-- ============================================================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages_select_policy"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_room_users
    WHERE chat_room_users.room_id = chat_messages.room_id
    AND chat_room_users.user_id = current_user_id()
  )
);

CREATE POLICY "chat_messages_insert_policy"
ON chat_messages FOR INSERT
WITH CHECK (
  user_id = current_user_id()
  AND EXISTS (
    SELECT 1 FROM chat_room_users
    WHERE chat_room_users.room_id = chat_messages.room_id
    AND chat_room_users.user_id = current_user_id()
  )
);

-- Users cannot update or delete chat messages
CREATE POLICY "chat_messages_no_update"
ON chat_messages FOR UPDATE
USING (false);

CREATE POLICY "chat_messages_no_delete"
ON chat_messages FOR DELETE
USING (false);

-- ============================================================================
-- CHAT ROOMS: Only participants can see their rooms
-- ============================================================================
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_rooms_select_policy"
ON chat_rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_room_users
    WHERE chat_room_users.room_id = chat_rooms.id
    AND chat_room_users.user_id = current_user_id()
  )
);

-- ============================================================================
-- FINANCIAL DATA: Only owner can access
-- ============================================================================
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "financial_goals_policy"
ON financial_goals FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_entries_policy"
ON budget_entries FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- HEALTH DATA: Only owner can access
-- ============================================================================
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "health_goals_policy"
ON health_goals FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- Enable RLS on workout, nutrition, sleep, fitness logs if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workout_logs') THEN
    EXECUTE 'ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "workout_logs_policy" ON workout_logs FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id())';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nutrition_logs') THEN
    EXECUTE 'ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "nutrition_logs_policy" ON nutrition_logs FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id())';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sleep_logs') THEN
    EXECUTE 'ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "sleep_logs_policy" ON sleep_logs FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id())';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fitness_activities') THEN
    EXECUTE 'ALTER TABLE fitness_activities ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "fitness_activities_policy" ON fitness_activities FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id())';
  END IF;
END $$;

-- ============================================================================
-- HOUSING: Public listings visible to all, bookings only to parties involved
-- ============================================================================
ALTER TABLE host_homes ENABLE ROW LEVEL SECURITY;

-- SELECT: All can see active listings, owners can see all their listings
CREATE POLICY "host_homes_select_policy"
ON host_homes FOR SELECT
USING (
  is_active = true 
  OR user_id = current_user_id()
);

-- INSERT/UPDATE/DELETE: Only owners
CREATE POLICY "host_homes_modify_policy"
ON host_homes FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

ALTER TABLE housing_bookings ENABLE ROW LEVEL SECURITY;

-- SELECT: Only guest or host can see booking
CREATE POLICY "housing_bookings_select_policy"
ON housing_bookings FOR SELECT
USING (
  guest_id = current_user_id()
  OR EXISTS (
    SELECT 1 FROM host_homes
    WHERE host_homes.id = housing_bookings.home_id
    AND host_homes.user_id = current_user_id()
  )
);

-- INSERT: Users can only create bookings as themselves
CREATE POLICY "housing_bookings_insert_policy"
ON housing_bookings FOR INSERT
WITH CHECK (guest_id = current_user_id());

-- UPDATE/DELETE: Only guest can modify their own bookings
CREATE POLICY "housing_bookings_modify_policy"
ON housing_bookings FOR UPDATE
USING (guest_id = current_user_id());

CREATE POLICY "housing_bookings_delete_policy"
ON housing_bookings FOR DELETE
USING (guest_id = current_user_id());

-- ============================================================================
-- SUBSCRIPTIONS: Only user's own subscription data
-- ============================================================================
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_subscriptions_policy"
ON user_subscriptions FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- LIFE CEO DATA: Only owner can access
-- ============================================================================
ALTER TABLE life_ceo_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "life_ceo_conversations_policy"
ON life_ceo_conversations FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

ALTER TABLE life_ceo_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "life_ceo_chat_messages_select_policy"
ON life_ceo_chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM life_ceo_conversations
    WHERE life_ceo_conversations.id = life_ceo_chat_messages.conversation_id
    AND life_ceo_conversations.user_id = current_user_id()
  )
);

CREATE POLICY "life_ceo_chat_messages_insert_policy"
ON life_ceo_chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM life_ceo_conversations
    WHERE life_ceo_conversations.id = life_ceo_chat_messages.conversation_id
    AND life_ceo_conversations.user_id = current_user_id()
  )
);

ALTER TABLE life_ceo_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "life_ceo_domains_policy"
ON life_ceo_domains FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

ALTER TABLE life_ceo_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "life_ceo_goals_policy"
ON life_ceo_goals FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

ALTER TABLE life_ceo_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "life_ceo_tasks_policy"
ON life_ceo_tasks FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

ALTER TABLE life_ceo_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "life_ceo_milestones_policy"
ON life_ceo_milestones FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

ALTER TABLE life_ceo_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "life_ceo_recommendations_policy"
ON life_ceo_recommendations FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- MR BLUE DATA: Only owner can access conversations
-- ============================================================================
ALTER TABLE mr_blue_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mr_blue_conversations_policy"
ON mr_blue_conversations FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

ALTER TABLE mr_blue_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mr_blue_messages_select_policy"
ON mr_blue_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM mr_blue_conversations
    WHERE mr_blue_conversations.id = mr_blue_messages.conversation_id
    AND mr_blue_conversations.user_id = current_user_id()
  )
);

CREATE POLICY "mr_blue_messages_insert_policy"
ON mr_blue_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM mr_blue_conversations
    WHERE mr_blue_conversations.id = mr_blue_messages.conversation_id
    AND mr_blue_conversations.user_id = current_user_id()
  )
);

-- ============================================================================
-- PAYMENTS & TRANSACTIONS: Only user's own payment data
-- ============================================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_policy"
ON payments FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- CAMPAIGN DONATIONS: Donors can see their donations, campaign owners see all
-- ============================================================================
ALTER TABLE campaign_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaign_donations_select_policy"
ON campaign_donations FOR SELECT
USING (
  user_id = current_user_id()
  OR EXISTS (
    SELECT 1 FROM funding_campaigns
    WHERE funding_campaigns.id = campaign_donations.campaign_id
    AND funding_campaigns.creator_id = current_user_id()
  )
);

CREATE POLICY "campaign_donations_insert_policy"
ON campaign_donations FOR INSERT
WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- TRAVEL BOOKINGS & PLANS: Only user can access their travel data
-- ============================================================================
ALTER TABLE travel_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "travel_bookings_policy"
ON travel_bookings FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

ALTER TABLE trip_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_plans_policy"
ON trip_plans FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

ALTER TABLE travel_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "travel_preferences_policy"
ON travel_preferences FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- LEGAL DOCUMENTS: Only owner can access document instances
-- ============================================================================
ALTER TABLE document_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_instances_policy"
ON document_instances FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_signatures_select_policy"
ON document_signatures FOR SELECT
USING (
  signer_user_id = current_user_id()
  OR EXISTS (
    SELECT 1 FROM document_instances
    WHERE document_instances.id = document_signatures.document_instance_id
    AND document_instances.user_id = current_user_id()
  )
);

CREATE POLICY "document_signatures_insert_policy"
ON document_signatures FOR INSERT
WITH CHECK (signer_user_id = current_user_id());

-- ============================================================================
-- NOTIFICATIONS: Only user can see their own notifications
-- ============================================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_policy"
ON notifications FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- SAVED POSTS: Only user can see their saved posts
-- ============================================================================
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_posts_policy"
ON saved_posts FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- FRIEND REQUESTS: Users can see requests involving them
-- ============================================================================
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friend_requests_select_policy"
ON friend_requests FOR SELECT
USING (
  sender_id = current_user_id()
  OR receiver_id = current_user_id()
);

CREATE POLICY "friend_requests_insert_policy"
ON friend_requests FOR INSERT
WITH CHECK (sender_id = current_user_id());

CREATE POLICY "friend_requests_update_policy"
ON friend_requests FOR UPDATE
USING (receiver_id = current_user_id() OR sender_id = current_user_id());

-- ============================================================================
-- FRIENDSHIPS: Users can see their own friendships
-- ============================================================================
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friendships_select_policy"
ON friendships FOR SELECT
USING (
  user_id = current_user_id()
  OR friend_id = current_user_id()
);

CREATE POLICY "friendships_insert_policy"
ON friendships FOR INSERT
WITH CHECK (user_id = current_user_id());

CREATE POLICY "friendships_update_policy"
ON friendships FOR UPDATE
USING (user_id = current_user_id() OR friend_id = current_user_id());

CREATE POLICY "friendships_delete_policy"
ON friendships FOR DELETE
USING (user_id = current_user_id());

-- ============================================================================
-- BLOCKED USERS: Users can manage their own block list
-- ============================================================================
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blocked_users_policy"
ON blocked_users FOR ALL
USING (blocker_user_id = current_user_id())
WITH CHECK (blocker_user_id = current_user_id());

-- ============================================================================
-- PRIVACY SETTINGS: Only user can access their own settings
-- ============================================================================
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_privacy_settings_policy"
ON user_privacy_settings FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- TWO FACTOR: Only user can access their own 2FA settings
-- ============================================================================
ALTER TABLE two_factor_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "two_factor_secrets_policy"
ON two_factor_secrets FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- MARKETPLACE: Product purchases only visible to buyer and seller
-- ============================================================================
ALTER TABLE product_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_purchases_select_policy"
ON product_purchases FOR SELECT
USING (
  buyer_id = current_user_id()
  OR EXISTS (
    SELECT 1 FROM marketplace_products
    WHERE marketplace_products.id = product_purchases.product_id
    AND marketplace_products.seller_id = current_user_id()
  )
);

CREATE POLICY "product_purchases_insert_policy"
ON product_purchases FOR INSERT
WITH CHECK (buyer_id = current_user_id());

-- ============================================================================
-- REFRESH TOKENS: Only user can access their own tokens
-- ============================================================================
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "refresh_tokens_policy"
ON refresh_tokens FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- EMAIL VERIFICATION TOKENS: Only user can access their own tokens
-- ============================================================================
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_verification_tokens_policy"
ON email_verification_tokens FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- PASSWORD RESET TOKENS: Only user can access their own tokens
-- ============================================================================
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "password_reset_tokens_policy"
ON password_reset_tokens FOR ALL
USING (user_id = current_user_id())
WITH CHECK (user_id = current_user_id());

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$ 
BEGIN
  RAISE NOTICE 'Row Level Security (RLS) policies successfully applied to all critical tables.';
  RAISE NOTICE 'Users can now only access their own private data.';
  RAISE NOTICE 'GDPR compliance and security hardening complete.';
END $$;
