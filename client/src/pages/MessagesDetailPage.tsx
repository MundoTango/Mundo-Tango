import { useParams } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MoreVertical, Phone, Video, Info } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  userId: number;
  userName: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageAt?: string;
}

export default function MessagesDetailPage() {
  const { conversationId } = useParams();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");

  const { data: conversation } = useQuery<Conversation>({
    queryKey: ['/api/messages/conversations', conversationId],
  });

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages', conversationId],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/messages/${conversationId}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
      setNewMessage("");
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading || !conversation) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading conversation...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-screen flex flex-col bg-gradient-to-b from-background to-primary/5">
        {/* Conversation Header */}
        <Card className="rounded-none border-x-0 border-t-0">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={conversation.avatarUrl} alt={conversation.userName} />
                  <AvatarFallback>{conversation.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-foreground" data-testid="text-conversation-name">
                    {conversation.userName}
                  </h2>
                  <p className="text-xs text-muted-foreground">Active now</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" data-testid="button-voice-call">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" data-testid="button-video-call">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" data-testid="button-conversation-info">
                  <Info className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderId !== conversation.userId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${message.id}`}
                  >
                    <div className={`flex gap-3 max-w-md ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                      {!isOwnMessage && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={conversation.avatarUrl} alt={conversation.userName} />
                          <AvatarFallback className="text-xs">
                            {conversation.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card border border-border'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {format(new Date(message.createdAt), 'p')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <Card className="rounded-none border-x-0 border-b-0">
          <CardContent className="p-4">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
                data-testid="input-message"
              />
              <Button
                onClick={handleSend}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
