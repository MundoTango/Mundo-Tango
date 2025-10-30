import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SelectChatRoom, SelectChatMessage } from "@shared/schema";

export function useConversations() {
  return useQuery<SelectChatRoom[]>({
    queryKey: ["/api/messages/conversations"],
  });
}

export function useConversation(id: number) {
  return useQuery<SelectChatMessage[]>({
    queryKey: ["/api/messages/conversations", id],
    queryFn: async () => {
      const res = await fetch(`/api/messages/conversations/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });
}

export function useSendMessage(conversationId: number) {
  return useMutation({
    mutationFn: async (data: { message: string; mediaUrl?: string; mediaType?: string }) => {
      const res = await apiRequest("POST", `/api/messages/conversations/${conversationId}/messages`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    },
  });
}

export function useCreateConversation() {
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", "/api/messages/conversations", { userId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    },
  });
}
