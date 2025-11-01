import { useState, useEffect, useRef, useCallback } from "react";
import { 
  useConversations, 
  useConversation, 
  useSendMessage,
  useMessagesRealtime,
  useMarkMessagesAsRead 
} from "@/hooks/useMessages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { data: conversations, isLoading } = useConversations();

  return (
    <PageLayout title="Messages" showBreadcrumbs>
<>
      <SEO 
        title="Messages"
        description="Stay connected with your tango community through private messaging. Chat with dancers, organize events, and build lasting friendships."
      />
      <div className="h-[calc(100vh-5rem)] flex">
        {/* Left Panel - Conversation List (1/3 width) */}
        <div className="flex-1 border-r flex flex-col max-w-[33.333%]">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Messages</h2>
          </div>
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations && conversations.length > 0 ? (
              <div className="p-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full p-3 rounded-lg hover-elevate active-elevate-2 text-left transition-colors ${
                      selectedConversationId === conversation.id ? "bg-accent" : ""
                    }`}
                    data-testid={`button-conversation-${conversation.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={conversation.avatar || undefined} />
                        <AvatarFallback>
                          {conversation.name?.charAt(0)?.toUpperCase() || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate" data-testid={`text-conversation-name-${conversation.id}`}>
                            {conversation.name || "Conversation"}
                          </p>
                          {conversation.unreadCount && conversation.unreadCount > 0 && (
                            <Badge 
                              variant="default" 
                              className="ml-auto flex-shrink-0"
                              data-testid={`badge-unread-${conversation.id}`}
                            >
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate" data-testid={`text-last-message-${conversation.id}`}>
                            {conversation.lastMessage}
                          </p>
                        )}
                        {conversation.lastMessageAt && (
                          <p className="text-xs text-muted-foreground" data-testid={`text-timestamp-${conversation.id}`}>
                            {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                              addSuffix: true,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm" data-testid="text-no-conversations">
                No messages yet
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Panel - Active Conversation (2/3 width) */}
        <div className="flex-[2]">
          {selectedConversationId ? (
            <ConversationView conversationId={selectedConversationId} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground" data-testid="text-select-conversation">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </>
    </PageLayout>);
}

function ConversationView({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { data: messages, isLoading } = useConversation(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { typingUsers, broadcastTyping } = useMessagesRealtime(conversationId);
  const markAsRead = useMarkMessagesAsRead(conversationId);

  useEffect(() => {
    if (conversationId) {
      markAsRead.mutate();
    }
  }, [conversationId]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    broadcastTyping(true);

    typingTimeoutRef.current = setTimeout(() => {
      broadcastTyping(false);
    }, 500);
  }, [broadcastTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage.mutateAsync(message.trim());
      setMessage("");
      broadcastTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const conversationName = "Conversation";

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center gap-3" data-testid="header-conversation">
        <Avatar>
          <AvatarFallback>{conversationName.charAt(0)?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold" data-testid="text-conversation-header-name">
            {conversationName}
          </h3>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-16 w-64 rounded-lg" />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              const senderName = (msg as any).profiles?.username || "User";
              const senderAvatar = (msg as any).profiles?.avatar_url;
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  data-testid={`message-${msg.id}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={senderAvatar || undefined} />
                    <AvatarFallback>
                      {senderName.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
                    <div
                      className={`max-w-md rounded-lg p-3 ${
                        isOwn 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}
                      data-testid={`bubble-${msg.id}`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <p 
                      className="text-xs text-muted-foreground px-1" 
                      data-testid={`timestamp-${msg.id}`}
                    >
                      {formatDistanceToNow(new Date(msg.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            {typingUsers.length > 0 && (
              <div className="flex gap-3" data-testid="typing-indicator">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>
                    {typingUsers[0].username.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <div className="max-w-md rounded-lg p-3 bg-muted">
                    <p className="text-sm text-muted-foreground italic">
                      {typingUsers.length === 1 
                        ? `${typingUsers[0].username} is typing...`
                        : `${typingUsers.length} people are typing...`}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground" data-testid="text-no-messages">
            No messages yet. Start the conversation!
          </div>
        )}
      </ScrollArea>

      {/* Message Composer */}
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2 items-end">
          <Textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            disabled={sendMessage.isPending}
            className="resize-none min-h-[44px] max-h-[120px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            data-testid="input-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || sendMessage.isPending}
            data-testid="button-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
