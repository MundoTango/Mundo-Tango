-- ============================================================================
-- ADDITIONAL ROW LEVEL SECURITY (RLS) POLICIES
-- CRITICAL SECURITY: Add RLS for tables missing from initial migration
-- ============================================================================
-- 
-- This migration adds Row Level Security policies for tables that were
-- missing from the initial RLS implementation. These policies enforce
-- data access controls at the database level.
--
-- SECURITY PRINCIPLE: Deny by default, allow explicitly
-- ============================================================================

-- ============================================================================
-- 1. FINANCIAL_GOALS
-- Users can only access their own financial goals
-- ============================================================================

ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY financial_goals_policy ON financial_goals
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 2. HEALTH_GOALS
-- Users can only access their own health goals
-- ============================================================================

ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY health_goals_policy ON health_goals
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 3. BUDGET_ENTRIES
-- Users can only access their own budget entries
-- ============================================================================

ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY budget_entries_policy ON budget_entries
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 4. NUTRITION_LOGS
-- Users can only access their own nutrition logs
-- ============================================================================

ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY nutrition_logs_policy ON nutrition_logs
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 5. EVENTS
-- Public events visible to all, private events only to organizer/attendees
-- ============================================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: View events based on visibility
CREATE POLICY events_select_policy ON events
  FOR SELECT
  USING (
    visibility = 'public' OR
    status = 'published' OR
    user_id = current_setting('app.user_id', true)::int OR
    organizer_id = current_setting('app.user_id', true)::int OR
    id IN (
      SELECT event_id FROM event_rsvps
      WHERE user_id = current_setting('app.user_id', true)::int
    )
  );

-- Policy: Only creators/organizers can modify events
CREATE POLICY events_modify_policy ON events
  FOR ALL
  USING (
    user_id = current_setting('app.user_id', true)::int OR
    organizer_id = current_setting('app.user_id', true)::int
  )
  WITH CHECK (
    user_id = current_setting('app.user_id', true)::int OR
    organizer_id = current_setting('app.user_id', true)::int
  );

-- ============================================================================
-- 6. USER_SETTINGS
-- Users can only access their own settings
-- ============================================================================

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_settings_policy ON user_settings
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 7. TWO_FACTOR_SECRETS
-- Users can only access their own 2FA secrets
-- ============================================================================

ALTER TABLE two_factor_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY two_factor_secrets_policy ON two_factor_secrets
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- 8. HOST_VENUE_PROFILES (Housing/Venues)
-- Owners can edit, public can view active listings
-- ============================================================================

-- Check if RLS is already enabled, if not enable it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'host_venue_profiles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE host_venue_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS host_venues_select_policy ON host_venue_profiles;
DROP POLICY IF EXISTS host_venues_modify_policy ON host_venue_profiles;

-- Policy: Public can view active listings, owners can view all their listings
CREATE POLICY host_venues_select_policy ON host_venue_profiles
  FOR SELECT
  USING (
    is_active = true OR
    user_id = current_setting('app.user_id', true)::int
  );

-- Policy: Only owners can modify their listings
CREATE POLICY host_venues_modify_policy ON host_venue_profiles
  FOR ALL
  USING (user_id = current_setting('app.user_id', true)::int)
  WITH CHECK (user_id = current_setting('app.user_id', true)::int);

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these to verify RLS is enabled on all tables
-- ============================================================================

-- Check RLS status on newly protected tables
-- SELECT 
--   schemaname,
--   tablename,
--   rowsecurity as rls_enabled
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'financial_goals',
--     'health_goals', 
--     'budget_entries',
--     'nutrition_logs',
--     'events',
--     'user_settings',
--     'two_factor_secrets',
--     'host_venue_profiles'
--   )
-- ORDER BY tablename;

-- List all policies on these tables
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
--     'financial_goals',
--     'health_goals',
--     'budget_entries', 
--     'nutrition_logs',
--     'events',
--     'user_settings',
--     'two_factor_secrets',
--     'host_venue_profiles'
--   )
-- ORDER BY tablename, policyname;
