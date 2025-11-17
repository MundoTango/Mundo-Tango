import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Paperclip, Users, Settings, LogOut, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function GroupChat() {
  const { groupId } = useParams<{ groupId: string }>();
  const [message, setMessage] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/messages/group", groupId],
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/api/messages/send`, {
        method: "POST",
        body: JSON.stringify({
          groupId: parseInt(groupId),
          content,
        }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages/group", groupId] });
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
  }, [data?.messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading group chat...</p>
      </div>
    );
  }

  const { group, members, messages } = data || {};

  return (
    <div className="flex h-screen bg-background">
      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={group?.profileImage} />
              <AvatarFallback>{group?.name?.[0] || "G"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold" data-testid="text-group-name">{group?.name}</h2>
              <p className="text-xs text-muted-foreground">
                {members?.length || 0} members
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMembers(!showMembers)}
              data-testid="button-toggle-members"
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-settings">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages?.map((msg: any, index: number) => {
              const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
              
              return (
                <div
                  key={msg.id}
                  className="flex gap-2"
                  data-testid={`message-${msg.id}`}
                >
                  {showAvatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.senderImage} />
                      <AvatarFallback>{msg.senderName?.[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8" />
                  )}
                  
                  <div className="flex-1">
                    {showAvatar && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{msg.senderName}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.createdAt), "HH:mm")}
                        </span>
                      </div>
                    )}
                    <div className="bg-muted rounded-2xl px-4 py-2 inline-block max-w-[70%]">
                      <p className="text-sm">{msg.content}</p>
                    </div>
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
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message... (Use @ to mention)"
              className="flex-1"
              data-testid="input-message"
            />
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

      {/* Members Sidebar */}
      {showMembers && (
        <div className="w-80 border-l bg-sidebar flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Members ({members?.length || 0})</h3>
              <Button variant="ghost" size="sm" data-testid="button-add-member">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {members?.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-md hover-elevate"
                  data-testid={`member-${member.id}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.profileImage} />
                    <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <Badge variant="secondary" className="mt-1">
                      {member.role || "member"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <Button variant="destructive" className="w-full" data-testid="button-leave-group">
              <LogOut className="mr-2 h-4 w-4" />
              Leave Group
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
