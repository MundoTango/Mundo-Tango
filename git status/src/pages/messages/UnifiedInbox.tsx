import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Mail, Search, Plus, Star, Archive } from "lucide-react";
import { SiFacebook, SiInstagram, SiWhatsapp } from "react-icons/si";
import { format } from "date-fns";
import { ComposeMessage } from "@/components/messages/ComposeMessage";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import DOMPurify from 'dompurify';

const channelIcons = {
  mt: MessageCircle,
  gmail: Mail,
  facebook: SiFacebook,
  instagram: SiInstagram,
  whatsapp: SiWhatsapp,
};

const channelLabels = {
  mt: "MT Messages",
  gmail: "Gmail",
  facebook: "Facebook",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
};

const channelColors = {
  mt: "hsl(var(--primary))",
  gmail: "hsl(0, 72%, 51%)",
  facebook: "hsl(221, 44%, 41%)",
  instagram: "hsl(329, 70%, 58%)",
  whatsapp: "hsl(142, 70%, 49%)",
};

type Channel = "all" | "mt" | "gmail" | "facebook" | "instagram" | "whatsapp";

export default function UnifiedInbox() {
  const [selectedChannel, setSelectedChannel] = useState<Channel>("all");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/messages/unified", selectedChannel, searchQuery],
    refetchInterval: 30000,
  });

  const { data: channels } = useQuery({
    queryKey: ["/api/messages/channels"],
  });

  const filteredMessages = messages?.filter((msg: any) => {
    const matchesChannel = selectedChannel === "all" || msg.channel === selectedChannel;
    const matchesSearch = searchQuery === "" || 
      msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.from?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  }) || [];

  const getChannelCount = (channel: Channel) => {
    if (channel === "all") return messages?.length || 0;
    return messages?.filter((m: any) => m.channel === channel).length || 0;
  };

  const ChannelIcon = ({ channel }: { channel: string }) => {
    const Icon = channelIcons[channel as keyof typeof channelIcons];
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-sidebar flex flex-col">
        <div className="p-4 border-b">
          <Dialog open={showCompose} onOpenChange={setShowCompose}>
            <DialogTrigger asChild>
              <Button className="w-full" data-testid="button-compose">
                <Plus className="mr-2 h-4 w-4" />
                Compose
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <ComposeMessage onClose={() => setShowCompose(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            <h3 className="text-sm font-medium text-sidebar-foreground mb-4">
              Channels
            </h3>
            
            {(["all", "mt", "gmail", "facebook", "instagram", "whatsapp"] as Channel[]).map((channel) => {
              const Icon = channel === "all" ? MessageCircle : channelIcons[channel as keyof typeof channelIcons];
              const count = getChannelCount(channel);
              const isConnected = channel === "all" || channels?.find((c: any) => c.channel === channel && c.isActive);
              
              return (
                <Button
                  key={channel}
                  variant={selectedChannel === channel ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedChannel(channel)}
                  disabled={channel !== "all" && !isConnected}
                  data-testid={`button-filter-${channel}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span className="flex-1 text-left">
                    {channel === "all" ? "All Messages" : channelLabels[channel]}
                  </span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-auto" data-testid={`badge-count-${channel}`}>
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground">
            {channels?.filter((c: any) => c.isActive).length || 0} of 5 channels connected
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="w-96 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No messages found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedChannel === "all" 
                  ? "Connect your channels to start receiving messages"
                  : `No messages in ${channelLabels[selectedChannel]}`
                }
              </p>
              {selectedChannel === "all" && (
                <Button variant="outline" data-testid="button-connect-channels">
                  Connect Channels
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredMessages.map((message: any) => {
                const Icon = channelIcons[message.channel as keyof typeof channelIcons];
                const isSelected = selectedMessage?.id === message.id;
                
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "p-4 cursor-pointer transition-colors hover-elevate",
                      isSelected && "bg-accent",
                      !message.isRead && "bg-muted/30"
                    )}
                    onClick={() => setSelectedMessage(message)}
                    data-testid={`message-item-${message.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-md"
                        style={{ backgroundColor: `${channelColors[message.channel as keyof typeof channelColors]}15` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: channelColors[message.channel as keyof typeof channelColors] }} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("font-medium truncate", !message.isRead && "font-semibold")}>
                            {message.from}
                          </span>
                          {!message.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full" data-testid={`unread-indicator-${message.id}`} />
                          )}
                        </div>
                        
                        {message.subject && (
                          <div className={cn("text-sm truncate mb-1", !message.isRead && "font-medium")}>
                            {message.subject}
                          </div>
                        )}
                        
                        <div className="text-sm text-muted-foreground truncate">
                          {message.body?.substring(0, 100)}...
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.receivedAt), "MMM d, h:mm a")}
                          </span>
                          {message.isStarred && (
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Message Preview */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <>
            <div className="p-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-md"
                    style={{ backgroundColor: `${channelColors[selectedMessage.channel as keyof typeof channelColors]}15` }}
                  >
                    <ChannelIcon channel={selectedMessage.channel} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold" data-testid="preview-subject">
                      {selectedMessage.subject || "No Subject"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      from <span className="font-medium">{selectedMessage.from}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" data-testid="button-star-message">
                    <Star className={cn("h-4 w-4", selectedMessage.isStarred && "fill-yellow-500 text-yellow-500")} />
                  </Button>
                  <Button variant="ghost" size="icon" data-testid="button-archive-message">
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {format(new Date(selectedMessage.receivedAt), "MMMM d, yyyy 'at' h:mm a")}
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="prose max-w-none" data-testid="preview-body">
                {selectedMessage.htmlBody ? (
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedMessage.htmlBody) }} />
                ) : (
                  <p className="whitespace-pre-wrap">{selectedMessage.body}</p>
                )}
              </div>

              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-4">Attachments</h3>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment: any, index: number) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium">{attachment.filename}</div>
                          <Badge variant="secondary">{attachment.size}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="p-6 border-t">
              <div className="flex gap-4">
                <Button data-testid="button-reply">
                  <Mail className="mr-2 h-4 w-4" />
                  Reply
                </Button>
                <Button variant="outline" data-testid="button-forward">
                  Forward
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">Select a message</h3>
              <p className="text-sm mt-2">Choose a message from the list to view its content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
