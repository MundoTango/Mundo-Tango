import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Search, 
  Send, 
  ArrowLeft, 
  Phone, 
  Video, 
  Info,
  Image,
  Smile,
  Paperclip,
  MoreHorizontal,
  Check,
  CheckCheck
} from "lucide-react";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  createdAt: string;
  isMine: boolean;
  isRead: boolean;
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

export default function UnifiedInbox() {
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  // When conversation is opened, the backend marks messages as read
  // Invalidate unread count to update the top nav badge
  useEffect(() => {
    if (selectedPartnerId && thread) {
      // Small delay to ensure backend has marked messages as read
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

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Conversations List - Left Panel */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r flex flex-col",
          selectedPartnerId && "hidden md:flex"
        )}
      >
        {/* Header with gradient accent */}
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold" data-testid="heading-messages">Chats</h1>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-new-message">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Message</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-more-options">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>More Options</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Messenger"
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-conversations"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {conversationsLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-12 h-12 rounded-full bg-muted" />
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No conversations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start a conversation by messaging someone from their profile
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.partnerId}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-all",
                    selectedPartnerId === conv.partnerId 
                      ? "bg-primary/10" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedPartnerId(conv.partnerId)}
                  data-testid={`conversation-item-${conv.partnerId}`}
                >
                  {/* Avatar with online indicator */}
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-background">
                      <AvatarImage src={conv.partnerImage || undefined} alt={conv.partnerName} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/60 to-primary text-primary-foreground">
                        {getInitials(conv.partnerName)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator - randomly show for demo */}
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
                </div>
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
            <div className="px-4 py-3 border-b flex items-center gap-3 bg-gradient-to-r from-background to-muted/30">
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
                  <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-background">
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
                  {thread.partner.id % 2 === 0 ? "Active now" : `Active ${formatDistanceToNow(new Date(Date.now() - Math.random() * 3600000))} ago`}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary" data-testid="button-call">
                      <Phone className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voice Call</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary" data-testid="button-video">
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
                  <div className="animate-pulse">Loading messages...</div>
                </div>
              ) : thread.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Avatar className="h-24 w-24 mb-4 ring-4 ring-primary/20">
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
                </div>
              ) : (
                <div className="space-y-1 py-2">
                  {thread.messages.map((msg, index) => {
                    const showAvatar = !msg.isMine && (index === 0 || thread.messages[index - 1]?.isMine);
                    const isLastInGroup = index === thread.messages.length - 1 || thread.messages[index + 1]?.isMine !== msg.isMine;
                    
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-end gap-2",
                          msg.isMine ? "justify-end" : "justify-start",
                          isLastInGroup && "mb-2"
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
                        
                        <div className={cn("max-w-[70%] group relative")}>
                          <div
                            className={cn(
                              "px-4 py-2.5 rounded-2xl shadow-sm",
                              msg.isMine
                                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {msg.content}
                            </p>
                          </div>
                          
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
            <div className="px-4 py-3 border-t bg-gradient-to-r from-background to-muted/20">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-primary" data-testid="button-attach">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach File</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-primary" data-testid="button-image">
                        <Image className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send Image</TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder="Aa"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="pr-10 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
                    data-testid="input-message"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    data-testid="button-emoji"
                  >
                    <Smile className="h-5 w-5 text-primary" />
                  </Button>
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      className="rounded-full bg-primary hover:bg-primary/90"
                      data-testid="button-send-message"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send Message</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40">
            <div className="text-center max-w-sm px-4">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                <MessageCircle className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
              <p className="text-muted-foreground mb-4">
                Send private messages to friends and dancers in the Mundo Tango community
              </p>
              <Button className="rounded-full" data-testid="button-start-conversation">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start a Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
