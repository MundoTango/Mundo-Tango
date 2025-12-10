import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageCircle, 
  Search, 
  Send, 
  ArrowLeft, 
  Phone, 
  Video, 
  Info,
  Camera,
  Smile,
  MoreHorizontal,
  Check,
  CheckCheck,
  Heart,
  Flame,
  Music,
  Lightbulb,
  Eye,
  Frown,
  Link2,
  Mail,
  MessagesSquare,
  Instagram,
  Phone as WhatsAppIcon,
  Settings2,
  X,
  Loader2
} from "lucide-react";
import { SiFacebook, SiInstagram, SiWhatsapp, SiGmail } from "react-icons/si";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Tango-themed reaction types matching MT design system
const REACTION_TYPES = [
  { id: 'love', icon: Heart, label: 'Love', color: '#EF4444' },
  { id: 'passion', icon: Flame, label: 'Passion', color: '#F97316' },
  { id: 'joy', icon: Smile, label: 'Joy', color: '#FBBF24' },
  { id: 'wow', icon: Eye, label: 'Wow', color: '#3B82F6' },
  { id: 'music', icon: Music, label: 'Music', color: '#A855F7' },
  { id: 'inspiration', icon: Lightbulb, label: 'Inspiration', color: '#10B981' },
];

interface Conversation {
  partnerId: number;
  partnerName: string;
  partnerUsername?: string;
  partnerImage?: string;
  lastMessage: {
    id: number;
    content: string;
    createdAt: string;
    isMine: boolean;
  };
  unreadCount: number;
}

interface Message {
  id: number;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: string;
  isMine: boolean;
  isRead: boolean;
  reactions: Record<string, number>;
  userReaction: string | null;
}

interface ConversationThread {
  partner: {
    id: number;
    name: string;
    username?: string;
    profileImage?: string;
  };
  messages: Message[];
}

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
    <Popover open={showPicker} onOpenChange={setShowPicker}>
      <PopoverTrigger asChild>
        <button 
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted"
          data-testid={`button-react-message-${messageId}`}
        >
          {userReaction ? (
            (() => {
              const reaction = REACTION_TYPES.find(r => r.id === userReaction);
              const IconComponent = reaction?.icon || Smile;
              return <IconComponent className="h-4 w-4" style={{ color: reaction?.color }} />;
            })()
          ) : (
            <Smile className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="center" side="top">
        <motion.div 
          className="flex gap-1"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {REACTION_TYPES.map((reaction) => {
            const IconComponent = reaction.icon;
            return (
              <button
                key={reaction.id}
                onClick={() => {
                  onReact(messageId, reaction.id, userReaction);
                  setShowPicker(false);
                }}
                className={cn(
                  "p-2 rounded-lg transition-all hover:scale-125 hover:bg-muted",
                  userReaction === reaction.id && "bg-muted ring-2 ring-primary"
                )}
                title={reaction.label}
                data-testid={`button-reaction-${reaction.id}-${messageId}`}
              >
                <IconComponent 
                  className="w-6 h-6" 
                  style={{ color: reaction.color }}
                  fill={userReaction === reaction.id ? reaction.color : 'none'}
                />
              </button>
            );
          })}
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}

// Reaction Display under message
function ReactionDisplay({ reactions }: { reactions: Record<string, number> }) {
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  if (totalReactions === 0) return null;

  return (
    <div className="flex items-center gap-0.5 mt-1 px-2 py-1 rounded-full bg-muted/50 w-fit">
      {Object.entries(reactions)
        .filter(([_, count]) => count > 0)
        .slice(0, 3)
        .map(([reactionId, count]) => {
          const reaction = REACTION_TYPES.find(r => r.id === reactionId);
          if (!reaction) return null;
          const IconComponent = reaction.icon;
          return (
            <IconComponent 
              key={reactionId}
              className="w-3.5 h-3.5" 
              style={{ color: reaction.color }} 
              fill={reaction.color}
            />
          );
        })}
      {totalReactions > 1 && (
        <span className="text-xs text-muted-foreground ml-1">{totalReactions}</span>
      )}
    </div>
  );
}

// God-Level Admin Channel Hub
function ChannelConnectionHub({ onClose }: { onClose: () => void }) {
  const channels = [
    { id: 'gmail', name: 'Gmail', icon: SiGmail, color: '#EA4335', connected: false, description: 'Connect your Gmail to receive and send emails' },
    { id: 'facebook', name: 'Facebook Messenger', icon: SiFacebook, color: '#1877F2', connected: false, description: 'Connect Facebook Pages for Messenger' },
    { id: 'instagram', name: 'Instagram DMs', icon: SiInstagram, color: '#E4405F', connected: false, description: 'Connect Instagram business accounts' },
    { id: 'whatsapp', name: 'WhatsApp Business', icon: SiWhatsapp, color: '#25D366', connected: false, description: 'Connect WhatsApp Business API' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Connect Channels</h2>
          <p className="text-sm text-muted-foreground">Manage all your messaging platforms in one place</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {channels.map((channel) => {
          const IconComponent = channel.icon;
          return (
            <Card 
              key={channel.id}
              className="p-4 hover-elevate cursor-pointer transition-all"
              data-testid={`channel-${channel.id}`}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${channel.color}20` }}
                >
                  <IconComponent className="w-6 h-6" style={{ color: channel.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{channel.name}</h3>
                  <p className="text-sm text-muted-foreground">{channel.description}</p>
                </div>
                <Button 
                  variant={channel.connected ? "outline" : "default"}
                  size="sm"
                  className="rounded-full"
                  data-testid={`button-connect-${channel.id}`}
                >
                  {channel.connected ? "Manage" : "Connect"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Advanced Settings</h4>
            <p className="text-sm text-muted-foreground">Configure auto-responses, routing rules, and team assignments</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for conversation list
function ConversationSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UnifiedInbox() {
  const { user } = useAuth();
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [showChannelHub, setShowChannelHub] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isGodAdmin = user?.role === 'god' || user?.role === 'admin';

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
    refetchInterval: 10000,
  });

  const { data: thread, isLoading: threadLoading } = useQuery<ConversationThread>({
    queryKey: ["/api/messages/conversations", selectedPartnerId],
    enabled: !!selectedPartnerId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { to: string; body: string }) => {
      return apiRequest("POST", "/api/messages/send", {
        channel: "mt",
        to: data.to,
        body: data.body,
      });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations", selectedPartnerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
    },
  });

  const reactToMessageMutation = useMutation({
    mutationFn: async (data: { messageId: number; reactionType: string; isRemove: boolean }) => {
      if (data.isRemove) {
        return apiRequest("DELETE", `/api/messages/dm/${data.messageId}/react`);
      }
      return apiRequest("POST", `/api/messages/dm/${data.messageId}/react`, {
        reactionType: data.reactionType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations", selectedPartnerId] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  // When conversation is opened, the backend marks messages as read
  // Invalidate unread count to update the top nav badge
  useEffect(() => {
    if (selectedPartnerId && thread) {
      const timer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
        queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedPartnerId, thread]);

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    return (
      conv.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.partnerUsername?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedPartnerId) return;
    sendMessageMutation.mutate({
      to: selectedPartnerId.toString(),
      body: messageText.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = (messageId: number, reactionType: string, currentUserReaction: string | null) => {
    const isRemove = currentUserReaction === reactionType;
    reactToMessageMutation.mutate({ messageId, reactionType, isRemove });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Conversations List - Left Panel */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r flex flex-col bg-gradient-to-b from-background to-muted/20",
          selectedPartnerId && "hidden md:flex"
        )}
      >
        {/* Header with gradient accent */}
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 via-primary/10 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <MessagesSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold" data-testid="heading-messages">Chats</h1>
            </div>
            <div className="flex items-center gap-1">
              {isGodAdmin && (
                <Dialog open={showChannelHub} onOpenChange={setShowChannelHub}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                      data-testid="button-channel-hub"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link2 className="h-5 w-5 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>Connect Channels</TooltipContent>
                      </Tooltip>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <ChannelConnectionHub onClose={() => setShowChannelHub(false)} />
                  </DialogContent>
                </Dialog>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" data-testid="button-new-message">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Message</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Messenger"
              className="pl-10 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-conversations"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {conversationsLoading ? (
            <ConversationSkeleton />
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center"
              >
                <MessageCircle className="h-10 w-10 text-primary" />
              </motion.div>
              <h3 className="font-semibold mb-2">No conversations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start a conversation by messaging someone from their profile
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredConversations.map((conv, index) => (
                <motion.div
                  key={conv.partnerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-all",
                    selectedPartnerId === conv.partnerId 
                      ? "bg-primary/10 shadow-sm" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedPartnerId(conv.partnerId)}
                  data-testid={`conversation-item-${conv.partnerId}`}
                >
                  {/* Avatar with online indicator */}
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
                      <AvatarImage src={conv.partnerImage || undefined} alt={conv.partnerName} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/60 to-primary text-primary-foreground font-semibold">
                        {getInitials(conv.partnerName)}
                      </AvatarFallback>
                    </Avatar>
                    {conv.partnerId % 2 === 0 && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn(
                        "font-medium truncate",
                        conv.unreadCount > 0 && "font-bold text-foreground"
                      )}>
                        {conv.partnerName}
                      </span>
                      <span className={cn(
                        "text-xs whitespace-nowrap",
                        conv.unreadCount > 0 ? "text-primary font-medium" : "text-muted-foreground"
                      )}>
                        {formatMessageTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-sm truncate flex-1",
                        conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {conv.lastMessage.isMine && (
                          <span className="text-muted-foreground">You: </span>
                        )}
                        {conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge 
                          className="h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-primary"
                          data-testid={`unread-badge-${conv.partnerId}`}
                        >
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat View - Right Panel */}
      <div className={cn("flex-1 flex flex-col", !selectedPartnerId && "hidden md:flex")}>
        {selectedPartnerId && thread ? (
          <>
            {/* Chat Header with gradient */}
            <div className="px-4 py-3 border-b flex items-center gap-3 bg-gradient-to-r from-background via-muted/20 to-background">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedPartnerId(null)}
                data-testid="button-back-to-list"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <Link href={`/profile/${thread.partner.id}`}>
                <div className="relative">
                  <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-background shadow-md">
                    <AvatarImage src={thread.partner.profileImage || undefined} alt={thread.partner.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/60 to-primary text-primary-foreground">
                      {getInitials(thread.partner.name)}
                    </AvatarFallback>
                  </Avatar>
                  {thread.partner.id % 2 === 0 && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${thread.partner.id}`}>
                  <h2 className="font-semibold truncate cursor-pointer hover:underline" data-testid="chat-partner-name">
                    {thread.partner.name}
                  </h2>
                </Link>
                <p className="text-xs text-muted-foreground">
                  {thread.partner.id % 2 === 0 ? (
                    <span className="text-green-600 dark:text-green-500">Active now</span>
                  ) : (
                    `Active ${formatDistanceToNow(new Date(Date.now() - Math.random() * 3600000))} ago`
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" data-testid="button-call">
                      <Phone className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voice Call</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" data-testid="button-video">
                      <Video className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Video Call</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="button-info">
                      <Info className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Conversation Info</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 py-2">
              {threadLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading messages...
                </div>
              ) : thread.messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center py-12"
                >
                  <Avatar className="h-24 w-24 mb-4 ring-4 ring-primary/20 shadow-xl">
                    <AvatarImage src={thread.partner.profileImage || undefined} alt={thread.partner.name} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/60 to-primary text-primary-foreground">
                      {getInitials(thread.partner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{thread.partner.name}</h3>
                  {thread.partner.username && (
                    <p className="text-sm text-muted-foreground">@{thread.partner.username}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Say hi to start the conversation!
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-1 py-2">
                  {thread.messages.map((msg, index) => {
                    const showAvatar = !msg.isMine && (index === 0 || thread.messages[index - 1]?.isMine);
                    const isLastInGroup = index === thread.messages.length - 1 || thread.messages[index + 1]?.isMine !== msg.isMine;
                    
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-end gap-2 group",
                          msg.isMine ? "justify-end" : "justify-start",
                          isLastInGroup && "mb-3"
                        )}
                        data-testid={`message-bubble-${msg.id}`}
                      >
                        {!msg.isMine && (
                          <div className="w-8 flex-shrink-0">
                            {showAvatar && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={thread.partner.profileImage || undefined} alt={thread.partner.name} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-primary/60 to-primary text-primary-foreground">
                                  {getInitials(thread.partner.name)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}
                        
                        <div className={cn("max-w-[70%] relative")}>
                          {/* Message bubble */}
                          <div
                            className={cn(
                              "px-4 py-2.5 rounded-2xl shadow-sm",
                              msg.isMine
                                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            )}
                          >
                            {/* Media display */}
                            {msg.mediaUrl && (
                              <div className="mb-2 rounded-lg overflow-hidden">
                                {msg.mediaType?.startsWith('image') ? (
                                  <img 
                                    src={msg.mediaUrl} 
                                    alt="Media" 
                                    className="max-w-full rounded-lg"
                                    data-testid={`media-image-${msg.id}`}
                                  />
                                ) : msg.mediaType?.startsWith('video') ? (
                                  <video 
                                    src={msg.mediaUrl} 
                                    controls 
                                    className="max-w-full rounded-lg"
                                    data-testid={`media-video-${msg.id}`}
                                  />
                                ) : (
                                  <a 
                                    href={msg.mediaUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-background/20 rounded-lg"
                                  >
                                    <Paperclip className="h-4 w-4" />
                                    <span className="text-sm">View attachment</span>
                                  </a>
                                )}
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {msg.content}
                            </p>
                          </div>
                          
                          {/* Reaction bar - appears on hover */}
                          <div className={cn(
                            "absolute top-1/2 -translate-y-1/2",
                            msg.isMine ? "-left-8" : "-right-8"
                          )}>
                            <MessageReactionBar
                              messageId={msg.id}
                              reactions={msg.reactions}
                              userReaction={msg.userReaction}
                              onReact={handleReaction}
                            />
                          </div>
                          
                          {/* Reaction display under message */}
                          <ReactionDisplay reactions={msg.reactions} />
                          
                          {/* Time and read status */}
                          {isLastInGroup && (
                            <div className={cn(
                              "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
                              msg.isMine ? "justify-end" : "justify-start ml-1"
                            )}>
                              <span>{formatChatTime(msg.createdAt)}</span>
                              {msg.isMine && (
                                msg.isRead ? (
                                  <CheckCheck className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input - Enhanced */}
            <div className="px-4 py-3 border-t bg-gradient-to-r from-muted/20 via-background to-muted/20">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label htmlFor="media-upload">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-primary hover:bg-primary/10" 
                        data-testid="button-attach-media"
                        asChild
                      >
                        <Camera className="h-5 w-5" />
                      </Button>
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>Attach Media or File</TooltipContent>
                </Tooltip>
                <input
                  id="media-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  className="hidden"
                  data-testid="input-media-upload"
                />
                
                <div className="flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    data-testid="input-message"
                  />
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
                      data-testid="button-send-message"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send Message</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/10 via-background to-muted/20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-sm px-4"
            >
              <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 via-primary/30 to-primary/40 flex items-center justify-center shadow-xl">
                <MessagesSquare className="h-14 w-14 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Your Messages</h3>
              <p className="text-muted-foreground mb-6">
                Send private messages to friends and dancers in the Mundo Tango community
              </p>
              <Button className="rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80" data-testid="button-start-conversation">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start a Conversation
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
