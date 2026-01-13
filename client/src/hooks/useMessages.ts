import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useCallback, useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  isRead?: boolean;
  type: 'direct' | 'group';
  userId?: number;
}

interface Message {
  id: number;
  senderId: number;
  recipientId?: number;
  senderName?: string;
  senderImage?: string;
  content: string;
  attachments?: string[];
  isRead?: boolean;
  createdAt?: string;
}

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/messages/conversations", {
        credentials: "include",
        headers,
      });
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      const data = await response.json();
      
      return data.map((conv: any) => ({
        id: conv.type === 'direct' ? `direct-${conv.userId}` : `group-${conv.id}`,
        name: conv.userName || conv.name || "Unknown",
        avatar: conv.userImage || conv.image,
        lastMessage: conv.lastMessage,
        timestamp: conv.timestamp,
        isRead: conv.isRead,
        type: conv.type,
        userId: conv.userId,
      })) as Conversation[];
    },
    enabled: !!user,
  });
}

export function useConversation(id: string) {
  const { user } = useAuth();
  
  const parseConversationId = (convId: string) => {
    if (convId.startsWith('direct-')) {
      return { type: 'direct', targetId: parseInt(convId.replace('direct-', '')) };
    }
    if (convId.startsWith('group-')) {
      return { type: 'group', targetId: parseInt(convId.replace('group-', '')) };
    }
    return { type: 'direct', targetId: parseInt(convId) };
  };

  return useQuery<Message[]>({
    queryKey: ["conversations", id, "messages"],
    queryFn: async () => {
      const { type, targetId } = parseConversationId(id);
      const endpoint = type === 'direct' 
        ? `/api/messages/direct/${targetId}`
        : `/api/messages/group/${targetId}`;
      
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(endpoint, {
        credentials: "include",
        headers,
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      
      const data = await response.json();
      
      if (type === 'group') {
        return (data.messages || []).map((msg: any) => ({
          id: msg.id,
          senderId: msg.senderId,
          recipientId: msg.recipientId,
          senderName: msg.senderName,
          senderImage: msg.senderImage,
          content: msg.content,
          attachments: msg.attachments,
          createdAt: msg.createdAt,
        }));
      }
      
      return data.map((msg: any) => ({
        id: msg.id,
        senderId: msg.senderId,
        recipientId: msg.recipientId,
        senderName: msg.senderName,
        senderImage: msg.senderImage,
        content: msg.content,
        attachments: msg.attachments,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
      }));
    },
    enabled: !!id && !!user,
  });
}

export function useSendMessage(conversationId: string) {
  const parseConversationId = (convId: string) => {
    if (convId.startsWith('direct-')) {
      return { type: 'direct', targetId: parseInt(convId.replace('direct-', '')) };
    }
    if (convId.startsWith('group-')) {
      return { type: 'group', targetId: parseInt(convId.replace('group-', '')) };
    }
    return { type: 'direct', targetId: parseInt(convId) };
  };

  return useMutation({
    mutationFn: async (content: string) => {
      const { type, targetId } = parseConversationId(conversationId);
      
      if (type === 'group') {
        const body = { content };
        const response = await apiRequest("POST", `/api/messages/group/${targetId}`, body);
        return response.json();
      }
      
      const body = { recipientId: targetId, content };
      const response = await apiRequest("POST", "/api/messages/send-direct", body);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useCreateConversation() {
  return useMutation({
    mutationFn: async (data: { participantIds: string[]; isGroup?: boolean; name?: string }) => {
      if (data.participantIds.length === 1 && !data.isGroup) {
        return { id: `direct-${data.participantIds[0]}`, type: 'direct' };
      }
      
      console.warn("Group conversation creation not fully implemented");
      return { id: `group-new`, type: 'group' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

interface TypingUser {
  user_id: string;
  username: string;
  timestamp: number;
}

export function useMessagesRealtime(conversationId: string | null) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!conversationId || !user) return;

    pollingRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["conversations", conversationId, "messages"] });
    }, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [conversationId, user]);

  const broadcastTyping = useCallback(
    async (isTyping: boolean) => {
    },
    []
  );

  return {
    typingUsers,
    broadcastTyping,
  };
}

export function useMarkMessagesAsRead(conversationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!conversationId) return;
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch("/api/messages/mark-read", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ conversationId }),
      });
      if (!response.ok) throw new Error("Failed to mark messages as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ["conversations", conversationId, "messages"] });
      }
    },
  });
}
