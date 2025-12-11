import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useCallback, useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  getUserConversations,
  getConversationMessages,
  createConversation,
} from "@/lib/supabaseQueries";
import type { MessageWithProfile, InsertConversation } from "@shared/supabase-types";
import type { RealtimeChannel } from "@supabase/supabase-js";

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

export function useSendMessage(conversationId: string) {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
        })
        .select(`
          *,
          profiles (*)
        `)
        .single();

      if (error) throw error;

      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      return data as MessageWithProfile;
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

interface TypingUser {
  user_id: string;
  username: string;
  timestamp: number;
}

export function useMessagesRealtime(conversationId: string | null) {
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase.channel(`conversation:${conversationId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as MessageWithProfile;
          
          queryClient.setQueryData(
            ["conversations", conversationId, "messages"],
            (old: MessageWithProfile[] | undefined) => {
              if (!old) return [newMessage];
              const exists = old.some((msg) => msg.id === newMessage.id);
              if (exists) return old;
              return [...old, newMessage];
            }
          );

          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ typing?: boolean; username?: string }>();
        const now = Date.now();
        
        const typing: TypingUser[] = [];
        Object.entries(state).forEach(([userId, presences]) => {
          if (userId !== user.id && presences.length > 0) {
            const presence = presences[0];
            if (presence.typing) {
              typing.push({
                user_id: userId,
                username: presence.username || "User",
                timestamp: now,
              });
            }
          }
        });
        
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ typing: false, username: user.user_metadata?.username || "User" });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((current) =>
        current.filter((tu) => now - tu.timestamp < 3000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const broadcastTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !user) return;

      try {
        await channelRef.current.track({
          typing: isTyping,
          username: user.user_metadata?.username || "User",
        });
      } catch (error) {
        console.error("Error broadcasting typing state:", error);
      }
    },
    [user]
  );

  return {
    typingUsers,
    broadcastTyping,
  };
}

export function useMarkMessagesAsRead(conversationId: string | null) {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!conversationId || !user) return;

      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["conversations", conversationId, "messages"] });
      }
    },
  });
}
