import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Paperclip, MoreVertical, ArrowLeft, Phone, Video } from "lucide-react";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function DirectMessages() {
  const { userId } = useParams<{ userId: string }>();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/messages/direct", userId],
    refetchInterval: 3000,
  });

  const { data: user } = useQuery({
    queryKey: [`/api/users/${userId}`],
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/api/messages/send`, {
        method: "POST",
        body: JSON.stringify({
          recipientId: parseInt(userId),
          content,
        }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages/direct", userId] });
      scrollToBottom();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold" data-testid="text-recipient-name">{user?.name || "User"}</h2>
            {isTyping && (
              <p className="text-xs text-muted-foreground">typing...</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" data-testid="button-call">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-video">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-more">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.map((msg: any, index: number) => {
            const isOwn = msg.senderId !== parseInt(userId);
            const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
            
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  isOwn ? "justify-end" : "justify-start"
                )}
                data-testid={`message-bubble-${msg.id}`}
              >
                {!isOwn && showAvatar && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.senderImage} />
                    <AvatarFallback>{msg.senderName?.[0]}</AvatarFallback>
                  </Avatar>
                )}
                {!isOwn && !showAvatar && <div className="w-8" />}
                
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {format(new Date(msg.createdAt), "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4 bg-card">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" data-testid="button-attach">
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="min-h-[2.5rem]"
              data-testid="input-message"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
            size="icon"
            data-testid="button-send"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
