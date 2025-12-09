import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Search, Send, ArrowLeft, MoreVertical, Phone, Video, Info } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

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
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

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
    <div className="flex h-screen bg-background">
      {/* Conversations List - Left Panel */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r flex flex-col bg-card",
          selectedPartnerId && "hidden md:flex"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-4" data-testid="heading-messages">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
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
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No conversations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start a conversation by messaging someone from their profile
              </p>
            </div>
          ) : (
            <div>
              {filteredConversations.map((conv) => (
                <div
                  key={conv.partnerId}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer transition-colors hover-elevate",
                    selectedPartnerId === conv.partnerId && "bg-accent"
                  )}
                  onClick={() => setSelectedPartnerId(conv.partnerId)}
                  data-testid={`conversation-item-${conv.partnerId}`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.partnerImage || undefined} alt={conv.partnerName} />
                    <AvatarFallback>{getInitials(conv.partnerName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("font-medium truncate", conv.unreadCount > 0 && "font-bold")}>
                        {conv.partnerName}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatMessageTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm truncate flex-1", conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>
                        {conv.lastMessage.isMine && <span className="text-muted-foreground">You: </span>}
                        {conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center" data-testid={`unread-badge-${conv.partnerId}`}>
                          <span className="text-xs text-primary-foreground font-medium">
                            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                          </span>
                        </div>
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
            {/* Chat Header */}
            <div className="p-3 border-b flex items-center gap-3 bg-card">
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
                <Avatar className="h-10 w-10 cursor-pointer">
                  <AvatarImage src={thread.partner.profileImage || undefined} alt={thread.partner.name} />
                  <AvatarFallback>{getInitials(thread.partner.name)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${thread.partner.id}`}>
                  <h2 className="font-semibold truncate cursor-pointer hover:underline" data-testid="chat-partner-name">
                    {thread.partner.name}
                  </h2>
                </Link>
                {thread.partner.username && (
                  <p className="text-xs text-muted-foreground">@{thread.partner.username}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" data-testid="button-call">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" data-testid="button-video">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" data-testid="button-info">
                  <Info className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {threadLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Loading messages...
                </div>
              ) : thread.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={thread.partner.profileImage || undefined} alt={thread.partner.name} />
                    <AvatarFallback className="text-2xl">{getInitials(thread.partner.name)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{thread.partner.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Start a conversation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {thread.messages.map((msg, index) => {
                    const showAvatar = !msg.isMine && (index === 0 || thread.messages[index - 1]?.isMine);
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex items-end gap-2", msg.isMine ? "justify-end" : "justify-start")}
                        data-testid={`message-bubble-${msg.id}`}
                      >
                        {!msg.isMine && (
                          <div className="w-8">
                            {showAvatar && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={thread.partner.profileImage || undefined} alt={thread.partner.name} />
                                <AvatarFallback className="text-xs">{getInitials(thread.partner.name)}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[70%] px-4 py-2 rounded-2xl",
                            msg.isMine
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={cn("text-xs mt-1", msg.isMine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                            {formatChatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 border-t bg-card">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/30">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="text-sm mt-2">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
