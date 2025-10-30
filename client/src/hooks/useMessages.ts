import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  createConversation,
} from "@/lib/supabaseQueries";
import type { MessageWithProfile, InsertMessage, InsertConversation } from "@shared/supabase-types";

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => {
      if (!user) throw new Error("Must be logged in");
      return getUserConversations(user.id);
    },
    enabled: !!user,
  });
}

export function useConversation(id: string) {
  return useQuery<MessageWithProfile[]>({
    queryKey: ["conversations", id, "messages"],
    queryFn: () => getConversationMessages(id),
    enabled: !!id,
  });
}

export function useSendMessage() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { conversationId: string; content: string }) => {
      if (!user) throw new Error("Must be logged in");
      return sendMessage({
        conversation_id: data.conversationId,
        sender_id: user.id,
        content: data.content,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations", variables.conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useCreateConversation() {
  return useMutation({
    mutationFn: async (data: { participantIds: string[]; isGroup?: boolean; name?: string }) => {
      return createConversation(
        {
          is_group: data.isGroup || false,
          name: data.name || null,
        },
        data.participantIds
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
