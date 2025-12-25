-- ============================================================================
-- COMPOUND INDEXES FOR MUNDO TANGO
-- ============================================================================
-- These indexes optimize frequently queried combinations
-- Run after: npm run db:push
-- ============================================================================

-- ============================================================================
-- USER & SOCIAL QUERIES
-- ============================================================================

-- User search by location (city + country)
CREATE INDEX IF NOT EXISTS idx_users_location ON users(city, country) WHERE city IS NOT NULL AND country IS NOT NULL;

-- Active verified users
CREATE INDEX IF NOT EXISTS idx_users_active_verified ON users(is_active, is_verified) WHERE is_active = true;

-- User subscription tier and status
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier, subscription_status);

-- Follows - bidirectional lookup
CREATE INDEX IF NOT EXISTS idx_follows_both ON follows(follower_id, following_id);

-- Friendship requests pending
CREATE INDEX IF NOT EXISTS idx_friendships_pending ON friendships(user_id, status) WHERE status = 'pending';

-- ============================================================================
-- POSTS & ENGAGEMENT
-- ============================================================================

-- Posts by user, ordered by creation date
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC);

-- Public posts for feed
CREATE INDEX IF NOT EXISTS idx_posts_public_feed ON posts(created_at DESC) WHERE visibility = 'public';

-- Post likes by post
CREATE INDEX IF NOT EXISTS idx_post_likes_post_created ON post_likes(post_id, created_at DESC);

-- Post comments by post, ordered by date
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created ON post_comments(post_id, created_at DESC);

-- Bookmarks by user
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON bookmarks(user_id, created_at DESC);

-- ============================================================================
-- EVENTS
-- ============================================================================

-- Upcoming events by location
CREATE INDEX IF NOT EXISTS idx_events_location_date ON events(city, country, start_date) WHERE status = 'published';

-- Events by type and date
CREATE INDEX IF NOT EXISTS idx_events_type_date ON events(event_type, start_date DESC) WHERE status = 'published';

-- Event RSVPs by event
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_status ON event_rsvps(event_id, status);

-- User's RSVPs
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_event ON event_rsvps(user_id, event_id);

-- ============================================================================
-- MESSAGING & NOTIFICATIONS
-- ============================================================================

-- Unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;

-- Chat messages by room
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(chat_room_id, created_at ASC);

-- Unread chat messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(chat_room_id, is_read) WHERE is_read = false;

-- ============================================================================
-- HOUSING MARKETPLACE
-- ============================================================================

-- Available housing by location
CREATE INDEX IF NOT EXISTS idx_housing_location_available ON housing_listings(city, country, available_from) WHERE status = 'active';

-- Housing by price range
CREATE INDEX IF NOT EXISTS idx_housing_price ON housing_listings(monthly_rent, created_at DESC) WHERE status = 'active';

-- ============================================================================
-- TALENT MATCH
-- ============================================================================

-- Active talent profiles by domain
CREATE INDEX IF NOT EXISTS idx_talent_profiles_domain ON talent_profiles(domains, status) WHERE status = 'active';

-- Task matches by confidence
CREATE INDEX IF NOT EXISTS idx_talent_matches_confidence ON talent_task_matches(task_id, confidence_score DESC);

-- ============================================================================
-- LIFE CEO & AGENTS
-- ============================================================================

-- Active goals by user
CREATE INDEX IF NOT EXISTS idx_life_ceo_goals_user_active ON life_ceo_goals(user_id, status) WHERE status = 'active';

-- Agent tasks by status
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status_created ON agent_tasks(status, created_at DESC);

-- Agent communications by type
CREATE INDEX IF NOT EXISTS idx_agent_comms_type_created ON agent_communications(communication_type, created_at DESC);

-- ============================================================================
-- ANALYTICS & TRACKING
-- ============================================================================

-- Post views by post
CREATE INDEX IF NOT EXISTS idx_post_views_post_created ON post_views(post_id, viewed_at DESC);

-- User analytics by date range
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_date ON user_analytics(user_id, date DESC);

-- Event analytics by event
CREATE INDEX IF NOT EXISTS idx_event_analytics_event_date ON event_analytics(event_id, date DESC);

-- ============================================================================
-- PLATFORM FEATURES
-- ============================================================================

-- Active visual editor pages
CREATE INDEX IF NOT EXISTS idx_visual_pages_user_updated ON visual_editor_pages(user_id, updated_at DESC);

-- Platform integrations by user
CREATE INDEX IF NOT EXISTS idx_platform_integrations_user_platform ON platform_integrations(user_id, platform);

-- Active deployments
CREATE INDEX IF NOT EXISTS idx_deployments_user_status ON deployments(user_id, status, created_at DESC);

-- ============================================================================
-- VERIFICATION & NOTES
-- ============================================================================
-- 
-- To verify index usage:
-- 1. Run: EXPLAIN ANALYZE SELECT ... (your slow query);
-- 2. Look for "Index Scan" instead of "Seq Scan"
-- 3. Check index sizes: SELECT pg_size_pretty(pg_relation_size('index_name'));
-- 
-- To monitor index health:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0 AND indexname NOT LIKE 'pg_%'
-- ORDER BY pg_relation_size(indexrelid) DESC;
-- 
-- ============================================================================
