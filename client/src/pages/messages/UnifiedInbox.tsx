import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Mail, 
  Search, 
  Plus, 
  MoreHorizontal,
  Send,
  CheckCheck,
  Pin,
  Edit3,
  Heart,
  Flame,
  Smile,
  Eye,
  Music,
  Lightbulb
} from "lucide-react";
import { SiFacebook, SiInstagram, SiWhatsapp } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";
import { ComposeMessage } from "@/components/messages/ComposeMessage";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ReactionSelector } from "@/components/ui/ReactionSelector";
import { ImageGalleryUploader } from "@/components/feed/ImageGalleryUploader";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Tango-themed reaction types matching MT design system
const REACTION_TYPES = [
  { id: 'love', icon: Heart, label: 'Love', color: '#EF4444' },
  { id: 'passion', icon: Flame, label: 'Passion', color: '#F97316' },
  { id: 'joy', icon: Smile, label: 'Joy', color: '#FBBF24' },
  { id: 'wow', icon: Eye, label: 'Wow', color: '#3B82F6' },
  { id: 'music', icon: Music, label: 'Music', color: '#A855F7' },
  { id: 'inspiration', icon: Lightbulb, label: 'Inspiration', color: '#10B981' },
];

const channelLabels = {
  mt: "Mundo Tango",
  gmail: "Gmail",
  facebook: "Facebook",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
};

const channelColors = {
  mt: "hsl(var(--primary))",
  gmail: "#EA4335",
  facebook: "#1877F2",
  instagram: "#E4405F",
  whatsapp: "#25D366",
};

const channelIcons = {
  mt: MessageCircle,
  gmail: Mail,
  facebook: SiFacebook,
  instagram: SiInstagram,
  whatsapp: SiWhatsapp,
};

type Channel = "all" | "mt" | "gmail" | "facebook" | "instagram" | "whatsapp";

// Helper to get initials from name
function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Helper for relative time (Messenger style: "2h", "1d", "1w")
function getRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  if (diffWeeks < 4) return `${diffWeeks}w`;
  return formatDistanceToNow(d, { addSuffix: false });
}

// Conversation bubble colors (Messenger gradient style)
const bubbleGradients = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-pink-500",
  "from-orange-400 to-pink-500",
  "from-green-400 to-cyan-500",
  "from-indigo-500 to-purple-500",
];

function getBubbleGradient(id: string | number): string {
  // Convert string IDs to a stable numeric hash
  const numericId = typeof id === 'string' 
    ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : id;
  return bubbleGradients[Math.abs(numericId) % bubbleGradients.length];
}

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  order: number;
}

export default function UnifiedInbox() {
  const { t } = useTranslation(["pages", "common"]);
  const { toast } = useToast();
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [selectedChannel, setSelectedChannel] = useState<Channel>("all");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [attachedImages, setAttachedImages] = useState<ImageItem[]>([]);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [localSentMessages, setLocalSentMessages] = useState<any[]>([]);
  const [optimisticConversations, setOptimisticConversations] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/messages/unified", { channel: selectedChannel === "all" ? undefined : selectedChannel, search: searchQuery || undefined }],
    refetchInterval: 30000,
    select: (data: any) => data?.messages || data || [],
  });

  const { data: channels } = useQuery({
    queryKey: ["/api/messages/channels"],
  });

  // Group messages by counterparty (the other person in the conversation) for Messenger-style view
  const serverConversations = messages?.reduce((acc: any[], msg: any) => {
    // For MT messages, use counterpartyId/counterpartyName from the API
    // For external messages, fallback to sender info
    const conversationKey = msg.counterpartyId 
      ? `${msg.counterpartyId}-${msg.channel}` 
      : `${msg.from}-${msg.channel}`;
    
    const existingConv = acc.find(c => c.conversationKey === conversationKey);
    if (existingConv) {
      existingConv.messages.push(msg);
      if (new Date(msg.receivedAt) > new Date(existingConv.lastMessageAt)) {
        existingConv.lastMessage = msg.body;
        existingConv.lastMessageAt = msg.receivedAt;
        // For incoming messages, update read status
        if (!msg.isOutgoing) {
          existingConv.isRead = msg.isRead;
        }
      }
      // Only count unread for incoming messages
      if (!msg.isRead && !msg.isOutgoing) existingConv.unreadCount++;
    } else {
      // Use counterparty info for display name and avatar
      const displayName = msg.counterpartyName || msg.from;
      const displayAvatar = msg.counterpartyAvatar || msg.senderAvatar;
      const counterpartyId = msg.counterpartyId || msg.senderId;
      
      acc.push({
        id: msg.id,
        conversationKey,
        from: displayName,
        counterpartyId,
        senderId: msg.senderId,
        channel: msg.channel,
        avatar: displayAvatar,
        isOnline: Math.random() > 0.5, // Simulated - would come from presence API
        isPinned: msg.isStarred,
        lastMessage: msg.body,
        lastMessageAt: msg.receivedAt,
        isRead: msg.isOutgoing ? true : msg.isRead, // Outgoing messages are always "read"
        unreadCount: (!msg.isRead && !msg.isOutgoing) ? 1 : 0,
        messages: [msg],
      });
    }
    return acc;
  }, []) || [];
  
  // Merge optimistic conversations with server conversations
  const conversations = [...optimisticConversations, ...serverConversations].reduce((acc: any[], conv: any) => {
    // Use conversationKey as the primary dedup key (works for both MT and external messages)
    // Fall back to counterpartyId+channel only for MT messages
    const exists = acc.find(c => {
      // If both have conversationKey, compare those
      if (c.conversationKey && conv.conversationKey) {
        return c.conversationKey === conv.conversationKey;
      }
      // For MT messages with counterpartyId, compare those
      if (c.counterpartyId && conv.counterpartyId) {
        return c.counterpartyId === conv.counterpartyId && c.channel === conv.channel;
      }
      // For external messages without counterpartyId, never merge
      return false;
    });
    
    if (!exists) {
      acc.push(conv);
    } else if (conv.isOptimistic) {
      // Update the existing conversation with optimistic message if newer
      if (new Date(conv.lastMessageAt) > new Date(exists.lastMessageAt)) {
        exists.lastMessage = conv.lastMessage;
        exists.lastMessageAt = conv.lastMessageAt;
      }
    }
    return acc;
  }, []);

  // Sort: pinned first, then by most recent
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  const filteredConversations = sortedConversations.filter((conv: any) => {
    const matchesChannel = selectedChannel === "all" || conv.channel === selectedChannel;
    const matchesSearch = searchQuery === "" || 
      conv.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const pinnedConversations = filteredConversations.filter(c => c.isPinned);
  const regularConversations = filteredConversations.filter(c => !c.isPinned);

  // Scroll to bottom when conversation changes and mark messages as read
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // Mark messages as read when viewing a conversation
    // Only mark as read if this is an MT internal message (channel === 'mt')
    // Use counterpartyId instead of senderId to correctly identify the other person
    if (selectedConversation?.counterpartyId && selectedConversation?.channel === 'mt') {
      const markAsRead = async () => {
        try {
          await apiRequest('POST', '/api/messages/mark-read', {
            senderId: selectedConversation.counterpartyId,
            senderName: selectedConversation.from,
          });
          // Invalidate unread count to update the badge
          queryClient.invalidateQueries({ queryKey: ['/api/messages/unread-count'] });
          // Also refresh the messages list to update read status
          queryClient.invalidateQueries({ queryKey: ['/api/messages/unified'] });
        } catch (error) {
          console.error('Failed to mark messages as read:', error);
        }
      };
      markAsRead();
    }
  }, [selectedConversation]);

  const getChannelCount = (channel: Channel) => {
    if (channel === "all") return conversations.length;
    return conversations.filter((c: any) => c.channel === channel).length;
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && attachedImages.length === 0) || !selectedConversation) {
      console.log('Send blocked - no content or no conversation selected');
      return;
    }
    
    const messageBody = messageInput.trim();
    const newLocalMessage = {
      id: `local-${Date.now()}`,
      body: messageBody,
      from: 'me',
      to: selectedConversation.from,
      channel: selectedConversation.channel || 'mt',
      receivedAt: new Date().toISOString(),
      isOwn: true,
      conversationId: selectedConversation.id,
    };
    
    // Optimistically add message to UI
    setLocalSentMessages(prev => [...prev, newLocalMessage]);
    setMessageInput("");
    setAttachedImages([]);
    setShowImageUploader(false);
    
    try {
      console.log('Sending message:', { to: selectedConversation.from, body: messageBody });
      const response = await apiRequest('POST', '/api/messages/send', {
        to: selectedConversation.from,
        channel: selectedConversation.channel || 'mt',
        body: messageBody,
        attachments: attachedImages.map(img => img.url)
      });
      console.log('Message sent successfully:', response);
      
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unified'] });
      
      toast({
        title: "Message sent",
        description: `Your message to ${selectedConversation.from} was sent successfully.`,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the optimistic message on failure
      setLocalSentMessages(prev => prev.filter(m => m.id !== newLocalMessage.id));
      toast({
        title: "Failed to send",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMessageReaction = async (msgId: number, reactionId: string) => {
    // Would call API to save reaction
    console.log('Reacting to message', msgId, 'with', reactionId);
  };

  const ConversationItem = ({ conv, isSelected }: { conv: any; isSelected: boolean }) => {
    const Icon = channelIcons[conv.channel as keyof typeof channelIcons];
    
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 cursor-pointer rounded-lg mx-2 transition-all",
          isSelected 
            ? "bg-accent" 
            : "hover-elevate"
        )}
        onClick={() => setSelectedConversation(conv)}
        data-testid={`conversation-${conv.id}`}
      >
        {/* Avatar with online indicator */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-14 w-14">
            <AvatarImage src={conv.avatar} alt={conv.from} />
            <AvatarFallback className={cn(
              "bg-gradient-to-br text-white font-medium",
              getBubbleGradient(conv.id)
            )}>
              {getInitials(conv.from)}
            </AvatarFallback>
          </Avatar>
          {conv.isOnline && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
          )}
          {/* Channel indicator */}
          <div 
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-background"
            style={{ backgroundColor: channelColors[conv.channel as keyof typeof channelColors] }}
          >
            <Icon className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              "font-medium truncate",
              !conv.isRead && "font-bold"
            )}>
              {conv.from}
            </span>
            <span className={cn(
              "text-xs flex-shrink-0",
              conv.isRead ? "text-muted-foreground" : "text-primary font-medium"
            )}>
              {getRelativeTime(conv.lastMessageAt)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mt-0.5">
            {/* Read receipt icon */}
            {conv.isRead && conv.channel === 'mt' && (
              <CheckCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            )}
            <p className={cn(
              "text-sm truncate",
              conv.isRead ? "text-muted-foreground" : "text-foreground font-medium"
            )}>
              {conv.lastMessage?.substring(0, 50)}
            </p>
          </div>
        </div>

        {/* Unread badge */}
        {conv.unreadCount > 0 && (
          <div className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">
              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
            </span>
          </div>
        )}
      </div>
    );
  };

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, "h:mm a");
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "MMM d");
  }
}

function formatChatTime(dateStr: string) {
  const date = new Date(dateStr);
  return format(date, "h:mm a");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Message Reaction Component
function MessageReactionBar({ 
  messageId, 
  reactions, 
  userReaction, 
  onReact 
}: { 
  messageId: number;
  reactions: Record<string, number>;
  userReaction: string | null;
  onReact: (messageId: number, reactionType: string, currentUserReaction: string | null) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="flex items-center gap-1">
      {Object.entries(reactions).length > 0 && (
        <div className="flex gap-0.5">
          {Object.entries(reactions).map(([type, count]) => (
            <button
              key={type}
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-full bg-muted hover:bg-muted/80",
                userReaction === type && "ring-1 ring-primary"
              )}
              onClick={() => onReact(messageId, type, userReaction)}
            >
              {type} {count}
            </button>
          ))}
        </div>
      )}
      <button
        className="p-1 rounded-full hover:bg-muted"
        onClick={() => setShowPicker(!showPicker)}
      >
        <span className="text-sm">😊</span>
      </button>
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-1 p-1 bg-popover rounded-lg shadow-lg border flex gap-1">
          {REACTION_TYPES.map((reaction) => (
            <button
              key={reaction.id}
              className="p-1.5 rounded hover:bg-muted"
              onClick={() => {
                onReact(messageId, reaction.id, userReaction);
                setShowPicker(false);
              }}
            >
              <reaction.icon className="h-4 w-4" style={{ color: reaction.color }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

  return (
    <div className="flex h-full bg-background overflow-hidden">
        {/* Left Sidebar - Conversations List */}
        <div className="w-80 border-r flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b">
          <h1 className="text-2xl font-bold">{t('pages:messages.inbox.title', 'Chats')}</h1>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-options">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('pages:messages.inbox.options', 'Options')}</TooltipContent>
            </Tooltip>
            <Dialog open={showCompose} onOpenChange={setShowCompose}>
              <DialogTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="button-new-message">
                      <Edit3 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('pages:messages.inbox.newMessage', 'New message')}</TooltipContent>
                </Tooltip>
              </DialogTrigger>
              <DialogContent className="max-w-md p-0">
                <DialogTitle className="sr-only">{t('pages:messages.inbox.newMessageTitle', 'New Message')}</DialogTitle>
                <ComposeMessage 
                  onClose={() => setShowCompose(false)} 
                  onSendSuccess={(data) => {
                    // Create optimistic conversation with real user data
                    const newConversation = {
                      id: `conv-${data.recipientId}`,
                      conversationKey: `${data.recipientId}-${data.channel}`,
                      counterpartyId: data.recipientId,
                      from: data.recipientName,
                      channel: data.channel,
                      avatar: data.recipientAvatar,
                      isOnline: false,
                      isPinned: false,
                      lastMessage: data.body,
                      lastMessageAt: new Date().toISOString(),
                      isRead: true,
                      unreadCount: 0,
                      messages: [],
                      isOptimistic: true,
                    };
                    
                    // Add to optimistic conversations to show in list immediately
                    setOptimisticConversations(prev => {
                      // Don't add duplicate
                      const exists = prev.find(c => c.counterpartyId === data.recipientId);
                      if (exists) return prev;
                      return [...prev, newConversation];
                    });
                    
                    setSelectedConversation(newConversation);
                    
                    // Add the sent message to local state
                    setLocalSentMessages(prev => [...prev, {
                      id: `local-${Date.now()}`,
                      body: data.body,
                      from: 'me',
                      to: data.recipientName,
                      channel: data.channel,
                      receivedAt: new Date().toISOString(),
                      isOwn: true,
                      conversationId: newConversation.id,
                    }]);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className={cn(
            "relative rounded-full transition-all",
            isSearchFocused ? "ring-2 ring-primary" : ""
          )}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('pages:messages.inbox.searchPlaceholder', 'Search Messenger')}
              className="pl-10 pr-4 h-10 rounded-full bg-muted border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Channel Filter Tabs */}
        <div className="px-3 pb-2 flex gap-1 overflow-x-auto">
          {(["all", "mt", "gmail", "facebook", "instagram", "whatsapp"] as Channel[]).map((channel) => {
            const Icon = channel === "all" ? MessageCircle : channelIcons[channel as keyof typeof channelIcons];
            const count = getChannelCount(channel);
            const isActive = selectedChannel === channel;
            const isConnected = channel === "all" || channel === "mt" || channels?.find((c: any) => c.channel === channel && c.isActive);
            
            return (
              <Button
                key={channel}
                variant={isActive ? "default" : "secondary"}
                size="sm"
                className={cn(
                  "rounded-full flex-shrink-0 gap-1.5",
                  !isActive && "bg-muted hover:bg-muted/80"
                )}
                onClick={() => setSelectedChannel(channel)}
                disabled={channel !== "all" && channel !== "mt" && !isConnected}
                data-testid={`button-filter-${channel}`}
              >
                <Icon className="h-4 w-4" />
                {channel === "all" ? "All" : channelLabels[channel].split(" ")[0]}
                {count > 0 && (
                  <span className={cn(
                    "text-xs",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-3 mx-2">
                    <div className="w-14 h-14 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No conversations</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? "No results found" : "Start a conversation to get chatting"}
              </p>
              <Button onClick={() => setShowCompose(true)} data-testid="button-start-chat">
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </div>
          ) : (
            <div className="py-2">
              {/* Pinned conversations */}
              {pinnedConversations.length > 0 && (
                <>
                  <div className="px-4 py-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Pin className="h-3 w-3" />
                    PINNED
                  </div>
                  {pinnedConversations.map((conv: any) => (
                    <ConversationItem 
                      key={conv.id} 
                      conv={conv} 
                      isSelected={selectedConversation?.id === conv.id}
                    />
                  ))}
                  <div className="my-2 mx-4 border-t" />
                </>
              )}
              
              {/* All conversations */}
              {regularConversations.map((conv: any) => (
                <ConversationItem 
                  key={conv.id} 
                  conv={conv} 
                  isSelected={selectedConversation?.id === conv.id}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b bg-card">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.from} />
                    <AvatarFallback className={cn(
                      "bg-gradient-to-br text-white text-sm font-medium",
                      getBubbleGradient(selectedConversation.id)
                    )}>
                      {getInitials(selectedConversation.from)}
                    </AvatarFallback>
                  </Avatar>
                  {selectedConversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold" data-testid="chat-header-name">
                    {selectedConversation.from}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.isOnline ? "Active now" : `Active ${getRelativeTime(selectedConversation.lastMessageAt)} ago`}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-3xl mx-auto space-y-4">
                {/* Profile intro card */}
                <div className="flex flex-col items-center py-8 text-center">
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.from} />
                    <AvatarFallback className={cn(
                      "bg-gradient-to-br text-white text-2xl font-medium",
                      getBubbleGradient(selectedConversation.id)
                    )}>
                      {getInitials(selectedConversation.from)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold">{selectedConversation.from}</h3>
                  <p className="text-sm text-muted-foreground">Mundo Tango</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    You're connected on Mundo Tango
                  </p>
                </div>

                {/* Message bubbles - combine server messages with local sent messages */}
                {(() => {
                  const conversationLocalMessages = localSentMessages.filter(
                    m => m.conversationId === selectedConversation.id
                  );
                  const allMessages = [
                    ...(selectedConversation.messages || []),
                    ...conversationLocalMessages
                  ].sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime());
                  
                  return allMessages.map((msg: any, idx: number) => {
                    // Only local optimistic messages (with isOwn flag) are outgoing - server messages are incoming
                    const isOwn = msg.isOwn === true;
                    const prevMsg = allMessages[idx - 1];
                    const prevIsOwn = prevMsg?.isOwn === true;
                    const showAvatar = idx === 0 || (prevIsOwn !== isOwn);
                    
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-end gap-2",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                        data-testid={`message-bubble-${msg.id}`}
                      >
                        {!isOwn && (
                          <div className="w-7 flex-shrink-0">
                            {showAvatar && (
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={selectedConversation.avatar} />
                                <AvatarFallback className={cn(
                                  "bg-gradient-to-br text-white text-xs",
                                  getBubbleGradient(selectedConversation.id)
                                )}>
                                  {getInitials(selectedConversation.from)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}
                        
                        <div className={cn(
                          "group relative max-w-[70%]"
                        )}>
                          <div className={cn(
                            "px-4 py-2.5 rounded-2xl",
                            isOwn 
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm"
                              : "bg-muted rounded-bl-sm"
                          )}>
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.body}
                            </p>
                          </div>
                          
                          {/* Timestamp on hover */}
                          <div className={cn(
                            "absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground whitespace-nowrap",
                            isOwn ? "right-full mr-2" : "left-full ml-2"
                          )}>
                            {getRelativeTime(msg.receivedAt)}
                          </div>
                          
                          {/* Reactions bar - only for received messages */}
                          {!isOwn && (
                            <div className={cn(
                              "absolute -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity",
                              "right-0"
                            )}>
                              <ReactionSelector
                                targetId={typeof msg.id === 'string' ? parseInt(msg.id) || idx : msg.id}
                                targetType="post"
                                currentReaction={msg.currentReaction}
                                reactions={msg.reactions || {}}
                                totalCount={msg.likes || 0}
                                onReact={(reactionId) => handleMessageReaction(msg.id, reactionId)}
                                className="scale-75 origin-bottom-left"
                              />
                            </div>
                          )}
                        </div>
                        
                        {isOwn && showAvatar && (
                          <Avatar className="h-7 w-7 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
                              Me
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  });
                })()}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input - Messenger style */}
            <div className="border-t bg-card">
              <div className="p-3">
                {/* Image Gallery Uploader */}
                {showImageUploader && (
                  <div className="mb-3">
                    <ImageGalleryUploader
                      images={attachedImages}
                      onImagesChange={setAttachedImages}
                      maxImages={10}
                    />
                  </div>
                )}
                
                <div className="flex items-end gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={showImageUploader ? "default" : "ghost"} 
                        size="icon" 
                        className="text-primary rounded-full flex-shrink-0" 
                        onClick={() => setShowImageUploader(!showImageUploader)}
                        data-testid="button-attach-image"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add media</TooltipContent>
                  </Tooltip>
                  
                  <div className="flex-1">
                    <Input
                      placeholder="Type a message..."
                      className="rounded-full bg-muted border-0 h-10"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      data-testid="input-message"
                    />
                  </div>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        className="rounded-full flex-shrink-0"
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() && attachedImages.length === 0}
                        data-testid="button-send"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-muted/30">
            <div className="text-center max-w-sm">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-6 flex items-center justify-center">
                <MessageCircle className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
              <p className="text-muted-foreground mb-6">
                Send private messages to a friend or group
              </p>
              <Button 
                size="lg" 
                className="rounded-full"
                onClick={() => setShowCompose(true)}
                data-testid="button-send-message-cta"
              >
                Send message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
