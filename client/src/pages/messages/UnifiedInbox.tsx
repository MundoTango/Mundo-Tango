import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { MessageCircle, Plus, Search, Send, Mail, User } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  channel: string;
  from: string;
  fromId: number;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  receivedAt: string;
  conversationId: string;
  participant?: {
    id: number;
    name: string;
    username: string;
    avatarUrl?: string;
  };
}

export default function UnifiedInbox() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [messageContent, setMessageContent] = useState("");

  const { data: messages = [], isLoading, error } = useQuery<Message[]>({
    queryKey: ["/api/messages/unified/all/"],
    refetchInterval: 30000,
  });

  const sendMutation = useMutation({
    mutationFn: async (data: { recipientId: string; content: string }) => {
      return apiRequest("POST", "/api/messages/send", {
        channel: "mt",
        to: data.recipientId,
        body: data.content,
      });
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unified/all/"] });
      setComposeOpen(false);
      setRecipientId("");
      setMessageContent("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message,
      });
    },
  });

  const handleSend = () => {
    if (!recipientId.trim() || !messageContent.trim()) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please enter both recipient and message.",
      });
      return;
    }
    sendMutation.mutate({ recipientId, content: messageContent });
  };

  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.from?.toLowerCase().includes(query) ||
      msg.subject?.toLowerCase().includes(query) ||
      msg.body?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex h-full min-h-[600px]" data-testid="messages-container">
      {/* Left Sidebar */}
      <div className="w-64 border-r bg-sidebar flex flex-col shrink-0">
        <div className="p-4 border-b">
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2" data-testid="button-compose">
                <Plus className="h-4 w-4" />
                <span>Compose</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">To (User ID or Username)</label>
                  <Input
                    placeholder="Enter recipient ID or username"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    data-testid="input-recipient"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    placeholder="Write your message..."
                    className="min-h-[150px]"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    data-testid="textarea-message"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setComposeOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSend}
                    disabled={sendMutation.isPending}
                    data-testid="button-send"
                  >
                    {sendMutation.isPending ? "Sending..." : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Channels</h3>
          <div className="space-y-1">
            <Button variant="secondary" className="w-full justify-start" data-testid="button-channel-all">
              <MessageCircle className="mr-2 h-4 w-4" />
              All Messages
              <Badge variant="secondary" className="ml-auto">{messages.length}</Badge>
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-channel-mt">
              <Mail className="mr-2 h-4 w-4" />
              MT Messages
            </Button>
          </div>
        </div>

        <div className="p-4 border-t text-xs text-muted-foreground">
          Unified Messaging Platform
        </div>
      </div>

      {/* Message List */}
      <div className="w-80 border-r flex flex-col shrink-0">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading messages...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              Failed to load messages. Please login first.
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click Compose to send your first message
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "p-4 cursor-pointer hover-elevate",
                    selectedMessage?.id === message.id && "bg-accent",
                    !message.isRead && "bg-muted/30"
                  )}
                  onClick={() => setSelectedMessage(message)}
                  data-testid={`conversation-${message.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={message.participant?.avatarUrl} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "font-medium truncate",
                          !message.isRead && "font-semibold"
                        )}>
                          {message.from}
                        </span>
                        {!message.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full shrink-0" data-testid={`badge-unread-${message.id}`} />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {message.body?.substring(0, 50) || "No content"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.receivedAt ? format(new Date(message.receivedAt), "MMM d, h:mm a") : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedMessage ? (
          <>
            <div className="p-6 border-b shrink-0">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedMessage.participant?.avatarUrl} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold" data-testid="message-from">
                    {selectedMessage.from}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedMessage.receivedAt ? format(new Date(selectedMessage.receivedAt), "MMMM d, yyyy 'at' h:mm a") : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <Card className="p-4">
                <p className="whitespace-pre-wrap" data-testid="message-body">
                  {selectedMessage.body}
                </p>
              </Card>
            </div>

            <div className="p-4 border-t shrink-0">
              <Button data-testid="button-reply">
                <Mail className="mr-2 h-4 w-4" />
                Reply
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="text-sm mt-2">Choose a message from the list to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
