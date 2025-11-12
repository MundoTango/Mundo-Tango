import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ChatMessage {
  id: number;
  streamId: number;
  userId: number;
  message: string;
  createdAt: string;
  username: string;
  profileImage?: string;
}

interface LiveStreamChatProps {
  streamId: string;
  isLive: boolean;
  currentUserId?: number;
}

export default function LiveStreamChat({ streamId, isLive, currentUserId }: LiveStreamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { data: messageHistory } = useQuery<ChatMessage[]>({
    queryKey: ["/api/livestreams", streamId, "messages"],
    enabled: isLive,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest(`/api/livestreams/${streamId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
    },
    onSuccess: (newMessage: ChatMessage) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "chat",
          data: newMessage,
        }));
      }
      setInputMessage("");
    },
  });

  useEffect(() => {
    if (messageHistory) {
      setMessages(messageHistory);
    }
  }, [messageHistory]);

  useEffect(() => {
    if (!isLive) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/stream/${streamId}`;
    
    console.log("[LiveStream Chat] Connecting to WebSocket:", wsUrl);
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("[LiveStream Chat] WebSocket connected");
      setIsConnected(true);
      
      websocket.send(JSON.stringify({
        type: "join",
        userId: currentUserId,
      }));
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[LiveStream Chat] Received:", data);

        if (data.type === "connected") {
          console.log("[LiveStream Chat] Successfully joined stream");
        } else if (data.type === "chat") {
          setMessages((prev) => [...prev, data]);
        } else if (data.type === "viewerCount") {
          setViewerCount(data.count);
        }
      } catch (error) {
        console.error("[LiveStream Chat] Error parsing message:", error);
      }
    };

    websocket.onerror = (error) => {
      console.error("[LiveStream Chat] WebSocket error:", error);
      setIsConnected(false);
    };

    websocket.onclose = () => {
      console.log("[LiveStream Chat] WebSocket disconnected");
      setIsConnected(false);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [streamId, isLive, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isLive) return;

    sendMessageMutation.mutate(inputMessage);
  };

  return (
    <Card className="h-[500px] flex flex-col" data-testid="livestream-chat">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-serif font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Live Chat
          </CardTitle>
          {isLive && (
            <Badge variant="secondary" className="flex items-center gap-1" data-testid="viewer-count">
              <Users className="h-3 w-3" />
              {viewerCount || 0}
            </Badge>
          )}
        </div>
        {isLive && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden flex flex-col p-4 pt-0">
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2" 
          data-testid="chat-messages"
        >
          {!isLive ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Chat is disabled for non-live streams
            </div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No messages yet. Be the first to chat!
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className="flex gap-2 items-start"
                data-testid={`chat-message-${msg.id}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={msg.profileImage} />
                  <AvatarFallback>{msg.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{msg.username || 'Anonymous'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {isLive && (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
              data-testid="input-chat"
              disabled={!isConnected || sendMessageMutation.isPending}
            />
            <Button 
              type="submit"
              size="sm" 
              disabled={!inputMessage.trim() || !isConnected || sendMessageMutation.isPending}
              data-testid="button-send-chat"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
