-- ═══════════════════════════════════════════════════════════════
-- MUNDO TANGO - EVENTS WORKSTREAM RLS POLICIES
-- Row Level Security Policies for Events and RSVPs
-- ═══════════════════════════════════════════════════════════════
-- 
-- This script defines comprehensive RLS policies for the Events workstream.
-- Policies ensure users can only modify their own events while maintaining
-- appropriate read access. RSVPs are managed with capacity constraints.
--
-- Usage: Execute this script in Supabase SQL editor or via psql
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- EVENTS TABLE RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;

-- SELECT Policy: All authenticated users can view all events
-- Events are public by nature (unlike posts which have visibility settings)
CREATE POLICY "Anyone can view events"
ON public.events FOR SELECT
TO authenticated
USING (true);

-- INSERT Policy: Authenticated users can create events with their own user_id
CREATE POLICY "Users can create events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE Policy: Users can only update their own events
CREATE POLICY "Users can update own events"
ON public.events FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE Policy: Users can only delete their own events
CREATE POLICY "Users can delete own events"
ON public.events FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- RSVPS TABLE RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on rsvps table
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "RSVPs are viewable by everyone" ON public.rsvps;
DROP POLICY IF EXISTS "Users can create own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can update own RSVPs" ON public.rsvps;
DROP POLICY IF EXISTS "Users can delete own RSVPs" ON public.rsvps;

-- SELECT Policy: All authenticated users can view all RSVPs
-- (Needed to display attendee counts and who's attending events)
CREATE POLICY "RSVPs are viewable by everyone"
ON public.rsvps FOR SELECT
TO authenticated
USING (true);

-- INSERT Policy: Users can only create RSVPs with their own user_id
-- Note: Capacity validation is handled by trigger (see event-capacity-trigger.sql)
CREATE POLICY "Users can create own RSVPs"
ON public.rsvps FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE Policy: Users can only update their own RSVPs (change status)
CREATE POLICY "Users can update own RSVPs"
ON public.rsvps FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE Policy: Users can only delete their own RSVPs (cancel attendance)
CREATE POLICY "Users can delete own RSVPs"
ON public.rsvps FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- VALIDATION CONSTRAINTS (Database Level)
-- ═══════════════════════════════════════════════════════════════

-- Note: The following constraints are already defined in database-schema.sql
-- Listed here for documentation purposes:

-- 1. UNIQUE constraint on (user_id, event_id) in rsvps table
--    Ensures users can only have one RSVP per event

-- 2. CHECK constraint on events.valid_dates
--    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)

-- 3. CHECK constraint on events.valid_coordinates
--    CONSTRAINT valid_coordinates CHECK (
--      (latitude IS NULL AND longitude IS NULL) OR
--      (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
--    )

-- 4. CHECK constraint on rsvps.status
--    CHECK (status IN ('going', 'maybe', 'not_going'))

-- Additional location validation can be added via triggers if needed
-- For city/country validation, consider using a lookup table or external API

-- ═══════════════════════════════════════════════════════════════
-- SECURITY NOTES
-- ═══════════════════════════════════════════════════════════════
-- 
-- 1. All policies require authentication (TO authenticated)
-- 2. Users can only create/modify events with their own user_id
-- 3. All events are publicly viewable (social platform design)
-- 4. RSVPs are globally visible to maintain social features
-- 5. Capacity validation is handled by trigger (event-capacity-trigger.sql)
-- 6. USING clause = read permission, WITH CHECK = write permission
-- 7. Location constraints are enforced at database level via CHECK constraints
-- 
-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES COMPLETE ✅
-- ═══════════════════════════════════════════════════════════════
