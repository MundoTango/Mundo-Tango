import { useQuery, useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

export interface Conversation {
  id: number | string;
  type: "direct" | "group";
  name: string;
  avatar: string | null;
  participants: Array<{
    id: number;
    name: string;
    profileImage: string | null;
  }>;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderImage: string | null;
  message: string;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: string;
  isOwn: boolean;
}

export interface DirectMessageResponse {
  roomId: number;
  otherUser?: {
    id: number;
    name: string;
    profileImage: string | null;
  };
  messages: ChatMessage[];
}

export function useConversations() {
  const { user } = useAuth();

  return useQuery<Conversation[]>({
    queryKey: ["/api/chat/conversations"],
    enabled: !!user,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useConversation(roomId: number | string | null) {
  // Handle group conversations (string IDs like "group-123")
  const isGroupId = typeof roomId === "string" && roomId.startsWith("group-");
  const groupId = isGroupId ? parseInt(roomId.replace("group-", "")) : null;
  const numericRoomId = typeof roomId === "number" ? roomId : null;
  
  // Use group endpoint for group IDs, room endpoint for numeric IDs
  const endpoint = isGroupId 
    ? `/api/chat/group/${groupId}` 
    : `/api/chat/room/${numericRoomId}`;
  
  return useQuery<ChatMessage[]>({
    queryKey: isGroupId ? ["/api/chat/group", groupId] : ["/api/chat/room", numericRoomId],
    enabled: !!(numericRoomId || (isGroupId && groupId)),
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(endpoint, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      // Group endpoint returns { group, members, messages }, room returns just messages array
      return isGroupId ? (data.messages || []) : data;
    },
  });
}

export function useDirectMessages(userId: number | null) {
  return useQuery<DirectMessageResponse>({
    queryKey: ["/api/chat/direct", userId],
    enabled: !!userId,
  });
}

export function useSendMessage() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      recipientId?: number;
      chatRoomId?: number;
      content: string;
      mediaUrl?: string;
      mediaType?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");
      
      const response = await apiRequest("POST", "/api/chat/send", params);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      if (variables.chatRoomId) {
        queryClient.invalidateQueries({ queryKey: ["/api/chat/room", variables.chatRoomId] });
      }
      if (variables.recipientId) {
        queryClient.invalidateQueries({ queryKey: ["/api/chat/direct", variables.recipientId] });
      }
    },
  });
}

export function useCreateConversation() {
  return useMutation({
    mutationFn: async (recipientId: number) => {
      const response = await apiRequest("GET", `/api/chat/direct/${recipientId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
    },
  });
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: async (roomId: number) => {
      const response = await apiRequest("PUT", `/api/chat/room/${roomId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
    },
  });
}

export function useDeleteMessage() {
  return useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest("DELETE", `/api/chat/${messageId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
    },
  });
}

export function useMessagesRealtime(conversationId: string | number | null) {
  const invalidateConversation = useCallback(() => {
    if (conversationId) {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/room", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
    }
  }, [conversationId]);

  return { invalidateConversation };
}
