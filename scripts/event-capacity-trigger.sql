-- ═══════════════════════════════════════════════════════════════
-- MUNDO TANGO - EVENT CAPACITY VALIDATION TRIGGER
-- Database-level capacity enforcement for event RSVPs
-- ═══════════════════════════════════════════════════════════════
-- 
-- This trigger validates event capacity before allowing new RSVPs.
-- It prevents overbooking and provides clear error messages.
--
-- Features:
-- - Validates max_attendees capacity before RSVP insert
-- - Only counts "going" status RSVPs toward capacity
-- - Allows unlimited RSVPs if max_attendees is NULL
-- - Provides clear error messages when events are full
--
-- Note: Waitlist functionality is handled at application level
--
-- Usage: Execute this script in Supabase SQL editor or via psql
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- DROP EXISTING TRIGGER AND FUNCTION (for re-running script)
-- ═══════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS event_capacity_check ON public.rsvps;
DROP FUNCTION IF EXISTS check_event_capacity();

-- ═══════════════════════════════════════════════════════════════
-- CAPACITY VALIDATION FUNCTION
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
  event_capacity INTEGER;
  current_going_count INTEGER;
  event_title TEXT;
BEGIN
  -- Get the event's max_attendees capacity and title
  SELECT max_attendees, title INTO event_capacity, event_title
  FROM public.events 
  WHERE id = NEW.event_id;
  
  -- If event doesn't exist, let FK constraint handle the error
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- If max_attendees is NULL, no capacity limit exists
  IF event_capacity IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Only validate capacity if the new RSVP status is "going"
  -- "maybe" and "not_going" don't count toward capacity
  IF NEW.status != 'going' THEN
    RETURN NEW;
  END IF;
  
  -- Count current "going" RSVPs for this event
  -- Exclude the current user if they're updating their RSVP
  SELECT COUNT(*) INTO current_going_count
  FROM public.rsvps 
  WHERE event_id = NEW.event_id 
    AND status = 'going'
    AND user_id != NEW.user_id;
  
  -- Check if event is at capacity
  IF current_going_count >= event_capacity THEN
    RAISE EXCEPTION 'Event "%" is at full capacity (% / % attendees). Please join the waitlist or check back later.', 
      event_title, 
      current_going_count, 
      event_capacity
    USING HINT = 'You can still RSVP as "maybe" to show interest without taking a spot.';
  END IF;
  
  -- Capacity check passed, allow the RSVP
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- CREATE TRIGGER
-- ═══════════════════════════════════════════════════════════════

-- Trigger fires BEFORE INSERT OR UPDATE on rsvps table
-- This prevents invalid RSVPs from being committed to the database
CREATE TRIGGER event_capacity_check
BEFORE INSERT OR UPDATE ON public.rsvps
FOR EACH ROW 
EXECUTE FUNCTION check_event_capacity();

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER BEHAVIOR NOTES
-- ═══════════════════════════════════════════════════════════════
--
-- INSERT Behavior:
-- - New RSVP with status="going" → Validates capacity
-- - New RSVP with status="maybe" → No capacity check
-- - New RSVP with status="not_going" → No capacity check
-- - Raises exception if event is full
--
-- UPDATE Behavior:
-- - Changing RSVP from "maybe" to "going" → Validates capacity
-- - Changing RSVP from "going" to "maybe" → No capacity check
-- - Changing RSVP from "not_going" to "going" → Validates capacity
-- - Excludes current user from count (allows status changes)
--
-- Capacity Calculation:
-- - Only counts RSVPs with status="going"
-- - NULL max_attendees = unlimited capacity
-- - Uses accurate count excluding current user
--
-- Error Handling:
-- - Clear exception message with event title and capacity info
-- - Includes helpful hint about "maybe" status
-- - Application layer should catch and display user-friendly message
--
-- Waitlist:
-- - This trigger does NOT implement waitlist functionality
-- - Waitlist position calculation handled at application level
-- - See useEvents.ts for frontend waitlist handling
--
-- ═══════════════════════════════════════════════════════════════
-- CAPACITY TRIGGER COMPLETE ✅
-- ═══════════════════════════════════════════════════════════════
