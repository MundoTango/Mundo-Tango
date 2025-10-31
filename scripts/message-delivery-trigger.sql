-- ═══════════════════════════════════════════════════════════════
-- MUNDO TANGO - MESSAGE DELIVERY TRIGGERS
-- Automatic Delivery Guarantees for Real-time Messaging
-- ═══════════════════════════════════════════════════════════════
-- 
-- This script creates database triggers to ensure message delivery guarantees:
-- 1. Auto-update conversation.last_message_at on new message
-- 2. Auto-update conversation_participants.unread_count for recipients
-- 3. Mark messages as delivered (delivered_at timestamp)
--
-- These triggers provide real-time message delivery tracking and
-- unread message counters without additional application logic.
--
-- Usage: Execute this script in Supabase SQL editor or via psql
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- STEP 1: ADD REQUIRED COLUMNS TO TABLES
-- ═══════════════════════════════════════════════════════════════

-- Add last_message_at to conversations table
-- Tracks when the most recent message was sent in each conversation
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE;

-- Add unread_count to conversation_participants table
-- Tracks how many unread messages each participant has
ALTER TABLE public.conversation_participants 
ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0;

-- Add delivered_at to messages table
-- Tracks when a message was successfully delivered to the database
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Create index for performance on last_message_at (used for sorting conversations)
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at 
ON public.conversations(last_message_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- STEP 2: CREATE TRIGGER FUNCTION FOR MESSAGE DELIVERY
-- ═══════════════════════════════════════════════════════════════

-- Drop existing function if it exists (for re-running this script)
DROP FUNCTION IF EXISTS public.handle_message_delivery() CASCADE;

-- Trigger function to handle all delivery guarantees when a new message is inserted
CREATE OR REPLACE FUNCTION public.handle_message_delivery()
RETURNS TRIGGER AS $$
DECLARE
  participant_record RECORD;
BEGIN
  -- GUARANTEE 1: Mark message as delivered immediately
  -- Set delivered_at to current timestamp
  NEW.delivered_at = NOW();

  -- GUARANTEE 2: Update conversation's last_message_at timestamp
  -- This allows sorting conversations by most recent activity
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;

  -- GUARANTEE 3: Increment unread_count for all participants EXCEPT the sender
  -- Loop through all participants in this conversation
  FOR participant_record IN 
    SELECT user_id 
    FROM public.conversation_participants 
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
  LOOP
    -- Increment unread count for each recipient
    UPDATE public.conversation_participants
    SET unread_count = COALESCE(unread_count, 0) + 1
    WHERE conversation_id = NEW.conversation_id
    AND user_id = participant_record.user_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- STEP 3: CREATE TRIGGER ON MESSAGES TABLE
-- ═══════════════════════════════════════════════════════════════

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_message_insert ON public.messages;

-- Create trigger that fires BEFORE INSERT on messages table
-- This ensures delivered_at is set before the message is stored
CREATE TRIGGER on_message_insert
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_message_delivery();

-- ═══════════════════════════════════════════════════════════════
-- STEP 4: CREATE FUNCTION TO RESET UNREAD COUNT (MARK AS READ)
-- ═══════════════════════════════════════════════════════════════

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.mark_conversation_as_read(UUID);

-- Function to reset unread count when user views a conversation
-- Call this function when user opens a conversation
CREATE OR REPLACE FUNCTION public.mark_conversation_as_read(
  p_conversation_id UUID
)
RETURNS void AS $$
BEGIN
  -- Reset unread count to 0 for the current user
  UPDATE public.conversation_participants
  SET 
    unread_count = 0,
    last_read_at = NOW()
  WHERE conversation_id = p_conversation_id
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- STEP 5: CREATE FUNCTION TO GET UNREAD MESSAGE COUNT
-- ═══════════════════════════════════════════════════════════════

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_total_unread_count();

-- Function to get total unread messages across all conversations for current user
-- Useful for notification badges
CREATE OR REPLACE FUNCTION public.get_total_unread_count()
RETURNS INTEGER AS $$
DECLARE
  total_unread INTEGER;
BEGIN
  SELECT COALESCE(SUM(unread_count), 0) INTO total_unread
  FROM public.conversation_participants
  WHERE user_id = auth.uid();
  
  RETURN total_unread;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- USAGE EXAMPLES
-- ═══════════════════════════════════════════════════════════════

-- Example 1: Send a message (trigger fires automatically)
-- INSERT INTO public.messages (conversation_id, sender_id, content)
-- VALUES ('your-conversation-id', 'your-user-id', 'Hello!');
-- Result: 
--   - Message is marked as delivered (delivered_at set)
--   - Conversation last_message_at is updated
--   - All other participants' unread_count is incremented

-- Example 2: Mark conversation as read when user opens it
-- SELECT mark_conversation_as_read('your-conversation-id');
-- Result:
--   - Current user's unread_count for this conversation is reset to 0
--   - Current user's last_read_at is updated to NOW()

-- Example 3: Get total unread messages for notification badge
-- SELECT get_total_unread_count();
-- Result: Returns total unread messages across all conversations

-- ═══════════════════════════════════════════════════════════════
-- DELIVERY GUARANTEES SUMMARY
-- ═══════════════════════════════════════════════════════════════
-- 
-- ✅ GUARANTEE 1: Message Delivery Timestamp
--    - Every message gets delivered_at timestamp automatically
--    - Set at database insertion time (BEFORE INSERT trigger)
--    - Provides audit trail of message delivery
--
-- ✅ GUARANTEE 2: Conversation Activity Tracking
--    - conversation.last_message_at updated on every new message
--    - Enables sorting conversations by most recent activity
--    - Shows which conversations have new messages
--
-- ✅ GUARANTEE 3: Unread Message Counters
--    - conversation_participants.unread_count auto-incremented
--    - Excludes the sender (only recipients get count incremented)
--    - Provides real-time unread badges without manual counting
--
-- ✅ GUARANTEE 4: Read Receipt Tracking
--    - mark_conversation_as_read() resets count and updates last_read_at
--    - Provides read receipt functionality
--    - User-controlled (call when conversation is viewed)
--
-- ✅ GUARANTEE 5: Global Unread Count
--    - get_total_unread_count() provides notification badge number
--    - Sums unread across all conversations
--    - Efficient single query
--
-- PERFORMANCE NOTES:
-- - Triggers execute in same transaction as INSERT (atomic)
-- - Index on last_message_at ensures fast conversation sorting
-- - Unread counts avoid expensive COUNT(*) queries on messages table
-- - All operations use SECURITY DEFINER for consistent permissions
--
-- ═══════════════════════════════════════════════════════════════
-- MESSAGE DELIVERY TRIGGERS COMPLETE ✅
-- ═══════════════════════════════════════════════════════════════
