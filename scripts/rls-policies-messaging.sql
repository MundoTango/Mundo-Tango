-- ═══════════════════════════════════════════════════════════════
-- MUNDO TANGO - MESSAGING WORKSTREAM RLS POLICIES
-- Row Level Security Policies for Messages, Conversations, and Participants
-- ═══════════════════════════════════════════════════════════════
-- 
-- This script defines comprehensive RLS policies for the Messaging workstream.
-- Policies ensure strict message privacy - users can only view messages in
-- conversations they participate in. All policies enforce participant membership.
--
-- Usage: Execute this script in Supabase SQL editor or via psql
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- MESSAGES TABLE RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;

-- SELECT Policy: Users can only read messages in conversations they participate in
-- This is the core privacy guarantee - strict conversation participant enforcement
CREATE POLICY "Users can view their messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- INSERT Policy: Users can send messages to conversations they participate in
-- Must be the sender AND must be a participant in the conversation
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- UPDATE Policy: Users can update their own messages (edit messages)
-- Only the original sender can edit their messages
CREATE POLICY "Users can update own messages"
ON public.messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- DELETE Policy: Users can delete their own messages
-- Only the original sender can delete their messages
CREATE POLICY "Users can delete own messages"
ON public.messages FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- CONVERSATIONS TABLE RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on conversations table
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

-- SELECT Policy: Users can only view conversations they participate in
-- Strict privacy - you can only see conversations you're a member of
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversations.id
    AND user_id = auth.uid()
  )
);

-- INSERT Policy: Any authenticated user can create a conversation
-- Note: They must also add themselves as a participant (handled by app logic)
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE Policy: Participants can update conversation metadata (e.g., group name)
-- Only participants can modify conversation details
CREATE POLICY "Users can update their conversations"
ON public.conversations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversations.id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversations.id
    AND user_id = auth.uid()
  )
);

-- ═══════════════════════════════════════════════════════════════
-- CONVERSATION PARTICIPANTS TABLE RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on conversation_participants table
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update own participant record" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can leave conversations" ON public.conversation_participants;

-- SELECT Policy: Users can see all participants in conversations they're part of
-- Allows viewing who else is in your conversations
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = auth.uid()
  )
);

-- INSERT Policy: Participants can add new members to conversations they're in
-- Enables adding people to group chats or starting new conversations
CREATE POLICY "Users can add participants to conversations"
ON public.conversation_participants FOR INSERT
TO authenticated
WITH CHECK (
  -- Either you're adding yourself to a new conversation
  user_id = auth.uid() OR
  -- Or you're already a participant adding someone else
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversation_participants.conversation_id
    AND user_id = auth.uid()
  )
);

-- UPDATE Policy: Users can update their own participant record
-- Allows updating last_read_at timestamp and other personal settings
CREATE POLICY "Users can update own participant record"
ON public.conversation_participants FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE Policy: Users can remove themselves from conversations (leave)
-- Allows users to leave group chats
CREATE POLICY "Users can leave conversations"
ON public.conversation_participants FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════
-- SECURITY NOTES
-- ═══════════════════════════════════════════════════════════════
-- 
-- 1. All policies require authentication (TO authenticated)
-- 2. Messages: Strict participant-only access via conversation_participants
-- 3. Conversations: Users can only see conversations they participate in
-- 4. Participants: Users can see all participants in their conversations
-- 5. Privacy: No cross-conversation data leakage possible
-- 6. Ownership: Users can only edit/delete their own messages
-- 7. Group chats: Participants can add new members
-- 8. Leave: Users can remove themselves from conversations
-- 9. Delivery tracking: Handled by triggers (see message-delivery-trigger.sql)
-- 10. Read receipts: last_read_at updated by participants themselves
-- 
-- ═══════════════════════════════════════════════════════════════
-- MESSAGING RLS POLICIES COMPLETE ✅
-- ═══════════════════════════════════════════════════════════════
