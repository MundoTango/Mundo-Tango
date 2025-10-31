-- ═══════════════════════════════════════════════════════════════
-- MUNDO TANGO - AUTH TRIGGER VERIFICATION
-- Verify and test automatic profile creation on user signup
-- ═══════════════════════════════════════════════════════════════
-- 
-- This script verifies that the auth.users trigger exists and properly
-- creates profiles automatically when new users sign up.
--
-- Features:
-- - Verifies trigger function exists
-- - Verifies trigger is attached to auth.users
-- - Tests trigger creates profile with correct defaults
-- - Documents trigger behavior and dependencies
--
-- Usage: Execute this script in Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- PART 1: VERIFY TRIGGER FUNCTION EXISTS
-- ═══════════════════════════════════════════════════════════════

-- Check if the handle_new_user() function exists
SELECT 
  routine_name,
  routine_type,
  routine_schema
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';

-- Expected result: One row showing function exists in public schema
-- If no rows returned, the trigger function needs to be created

-- ═══════════════════════════════════════════════════════════════
-- PART 2: VERIFY TRIGGER IS ATTACHED TO auth.users
-- ═══════════════════════════════════════════════════════════════

-- Check if the trigger exists on auth.users table
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';

-- Expected result: One row showing trigger on auth.users INSERT
-- If no rows returned, the trigger needs to be created

-- ═══════════════════════════════════════════════════════════════
-- PART 3: VIEW TRIGGER FUNCTION DEFINITION
-- ═══════════════════════════════════════════════════════════════

-- Display the complete trigger function definition
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'handle_new_user'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Expected result: Complete function definition showing:
-- - Inserts into public.profiles
-- - Uses NEW.id (auth.users.id)
-- - Sets username from metadata or email
-- - Sets full_name from metadata
-- - Sets default preferences (language='en', notifications=true, etc.)

-- ═══════════════════════════════════════════════════════════════
-- PART 4: CREATE TRIGGER FUNCTION (IF NOT EXISTS)
-- ═══════════════════════════════════════════════════════════════

-- Drop existing function if re-creating
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new profile for the user
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    bio,
    city,
    country,
    language,
    timezone,
    email_notifications,
    push_notifications,
    profile_visibility,
    location_sharing
  ) VALUES (
    NEW.id,
    -- Use username from metadata, or generate from email
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    -- Use full_name from metadata, or NULL
    NEW.raw_user_meta_data->>'full_name',
    -- Default avatar_url (NULL)
    NULL,
    -- Default bio (NULL)
    NULL,
    -- Default city (NULL)
    NULL,
    -- Default country (NULL)
    NULL,
    -- Default language (English)
    'en',
    -- Default timezone (NULL - will be detected client-side)
    NULL,
    -- Email notifications enabled by default
    true,
    -- Push notifications enabled by default
    true,
    -- Profile visibility public by default
    'public',
    -- Location sharing enabled by default
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- PART 5: CREATE TRIGGER (IF NOT EXISTS)
-- ═══════════════════════════════════════════════════════════════

-- Drop existing trigger if re-creating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires after user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- PART 6: TEST TRIGGER BEHAVIOR (VERIFICATION QUERIES)
-- ═══════════════════════════════════════════════════════════════

-- Count total users vs total profiles (should match)
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles;

-- Expected result: Both counts should be equal
-- If total_users > total_profiles, trigger may not be working

-- Check for users without profiles (should be empty)
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Expected result: No rows (all users have profiles)
-- If rows returned, those users are missing profiles

-- Check for orphaned profiles (should be empty)
SELECT 
  p.id,
  p.username,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- Expected result: No rows (all profiles have users)
-- If rows returned, those profiles have no associated auth user

-- Sample recently created profiles to verify defaults
SELECT 
  id,
  username,
  full_name,
  language,
  email_notifications,
  push_notifications,
  profile_visibility,
  location_sharing,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- Expected result: Recent profiles with:
-- - language = 'en'
-- - email_notifications = true
-- - push_notifications = true
-- - profile_visibility = 'public'
-- - location_sharing = true

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER FUNCTION DOCUMENTATION
-- ═══════════════════════════════════════════════════════════════
--
-- Function Name: handle_new_user()
-- Trigger Name: on_auth_user_created
-- Event: AFTER INSERT ON auth.users
-- Timing: FOR EACH ROW
--
-- Purpose:
-- Automatically creates a profile in public.profiles when a new user
-- signs up through Supabase Auth. This ensures every authenticated
-- user has a corresponding profile record.
--
-- Behavior:
-- 1. Fires immediately after auth.users INSERT
-- 2. Uses NEW.id (auth user UUID) as profiles.id (foreign key)
-- 3. Extracts username from raw_user_meta_data or generates from email
-- 4. Extracts full_name from raw_user_meta_data or sets NULL
-- 5. Sets default preferences:
--    - language: 'en' (English)
--    - email_notifications: true
--    - push_notifications: true
--    - profile_visibility: 'public'
--    - location_sharing: true
--
-- Metadata Requirements:
-- When registering users, pass metadata in the signup options:
-- 
-- await supabase.auth.signUp({
--   email: 'user@example.com',
--   password: 'password123',
--   options: {
--     data: {
--       username: 'tangodancer',
--       full_name: 'Maria Rodriguez'
--     }
--   }
-- })
--
-- Dependencies:
-- - Requires auth.users table (Supabase Auth built-in)
-- - Requires public.profiles table with matching schema
-- - Requires profiles.id to be UUID type
-- - Requires profiles.id to reference auth.users(id) ON DELETE CASCADE
--
-- Error Handling:
-- - If profile creation fails, entire transaction is rolled back
-- - User signup will fail if trigger fails (data consistency)
-- - Common failures: constraint violations, missing columns
--
-- Security:
-- - Function runs with SECURITY DEFINER (elevated privileges)
-- - Only auth.users INSERT can trigger this function
-- - Users cannot manually call this function
-- - RLS policies on profiles table still apply
--
-- Testing:
-- 1. Create new user via Supabase Auth
-- 2. Verify profile created in public.profiles
-- 3. Verify profile.id matches auth user.id
-- 4. Verify username and full_name extracted correctly
-- 5. Verify default preferences are set
--
-- Maintenance:
-- - Update defaults if business requirements change
-- - Add new columns with appropriate defaults
-- - Test thoroughly after schema changes
-- - Monitor for failed signups due to trigger errors
--
-- ═══════════════════════════════════════════════════════════════
-- AUTH TRIGGER VERIFICATION COMPLETE ✅
-- ═══════════════════════════════════════════════════════════════
