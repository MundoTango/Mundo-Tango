/**
 * Message Channels Hook - OAuth integration for Gmail, Facebook, Instagram, WhatsApp
 * Connects to the unified messaging backend
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export type MessageChannel = 'mt' | 'gmail' | 'facebook' | 'instagram' | 'whatsapp';

export interface ConnectedChannel {
  id: number;
  userId: number;
  channel: MessageChannel;
  accountId: string | null;
  accountName: string | null;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
}

export interface UnifiedMessage {
  id: number;
  userId: number;
  channel: MessageChannel;
  externalId: string;
  threadId: string | null;
  from: string | null;
  to: string | null;
  subject: string | null;
  body: string | null;
  isRead: boolean;
  isStarred: boolean;
  labels: string[] | null;
  receivedAt: string;
  syncedAt: string;
}

export interface ChannelStats {
  channel: MessageChannel;
  name: string;
  icon: string;
  connected: boolean;
  accountName?: string;
  unreadCount: number;
  lastSync?: string;
}

export function useConnectedChannels() {
  return useQuery<ConnectedChannel[]>({
    queryKey: ['/api/messages/channels'],
    staleTime: 30000,
  });
}

export function useUnifiedInbox(filters?: { channel?: MessageChannel; unreadOnly?: boolean }) {
  const params = new URLSearchParams();
  if (filters?.channel) params.append('channel', filters.channel);
  if (filters?.unreadOnly) params.append('unreadOnly', 'true');
  
  return useQuery<UnifiedMessage[]>({
    queryKey: ['/api/messages/unified', filters],
    staleTime: 10000,
  });
}

export function useUnreadCount() {
  return useQuery<{ total: number; byChannel: Record<MessageChannel, number> }>({
    queryKey: ['/api/messages/unread-count'],
    staleTime: 30000,
  });
}

export function useConnectChannel() {
  return useMutation({
    mutationFn: async (data: { channel: MessageChannel; accessToken?: string; refreshToken?: string; accountId?: string; accountName?: string }) => {
      return apiRequest('/api/messages/channels/connect', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unified'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unread-count'] });
    },
  });
}

export function useDisconnectChannel() {
  return useMutation({
    mutationFn: async (channel: MessageChannel) => {
      return apiRequest(`/api/messages/channels/${channel}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unified'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unread-count'] });
    },
  });
}

export function useSyncMessages() {
  return useMutation({
    mutationFn: async (channel?: MessageChannel) => {
      return apiRequest('/api/messages/sync', {
        method: 'POST',
        body: JSON.stringify({ channel }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unified'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unread-count'] });
    },
  });
}

export function useSendExternalMessage() {
  return useMutation({
    mutationFn: async (data: { 
      channel: MessageChannel; 
      to: string; 
      subject?: string; 
      body: string;
      replyToMessageId?: string;
    }) => {
      return apiRequest('/api/messages/send', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unified'] });
    },
  });
}

export const CHANNEL_CONFIG: Record<MessageChannel, { name: string; icon: string; color: string; description: string }> = {
  mt: {
    name: 'Mundo Tango',
    icon: '💃',
    color: 'bg-primary',
    description: 'Internal messages within Mundo Tango'
  },
  gmail: {
    name: 'Gmail',
    icon: '📧',
    color: 'bg-red-500',
    description: 'Connect your Gmail account'
  },
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: 'bg-blue-600',
    description: 'Connect Facebook Messenger'
  },
  instagram: {
    name: 'Instagram',
    icon: '📸',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: 'Connect Instagram Direct'
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-500',
    description: 'Connect WhatsApp Business'
  },
};
