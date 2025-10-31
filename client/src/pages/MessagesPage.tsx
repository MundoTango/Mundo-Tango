import { useState } from "react";
import { useConversations, useConversation, useSendMessage } from "@/hooks/useMessages";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { SEO } from "@/components/SEO";

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { data: conversations, isLoading } = useConversations();

  return (
    <>
      <SEO 
        title="Messages"
        description="Stay connected with your tango community through private messaging. Chat with dancers, organize events, and build lasting friendships."
      />
      <div className="h-[calc(100vh-5rem)] flex">
      <div className="w-80 border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100%-5rem)]">
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
                  className={`w-full p-3 rounded-lg hover-elevate text-left ${
                    selectedConversationId === conversation.id ? "toggle-elevated" : ""
                  }`}
                  data-testid={`button-conversation-${conversation.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={conversation.avatar || undefined} />
                      <AvatarFallback>
                        {conversation.name?.charAt(0) || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {conversation.name || "Conversation"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessageAt &&
                          formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: true,
                          })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No conversations yet
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1">
        {selectedConversationId ? (
          <ConversationView conversationId={selectedConversationId} />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
      </div>
    </>
  );
}

function ConversationView({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { data: messages, isLoading } = useConversation(conversationId);
  const sendMessage = useSendMessage();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage.mutateAsync({ 
        conversationId,
        content: message.trim() 
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-16 w-64" />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  data-testid={`message-${msg.id}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-md rounded-2xl p-3 ${
                      isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sendMessage.isPending}
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
